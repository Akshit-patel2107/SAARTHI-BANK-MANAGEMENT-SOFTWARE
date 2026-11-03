/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  CheckCircle2,
  Cpu,
  AlertTriangle,
  History,
  BarChart3,
  Settings,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Clock,
  Building2,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Menu,
  MoreHorizontal,
  RefreshCw,
  Printer,
  CreditCard,
  MonitorCheck,
  Wrench,
  User,
  ExternalLink,
  Download,
  Calendar,
  Lock,
  Monitor,
} from 'lucide-react';
import {
  BankingRequest,
  VirtualQueueToken,
  Complaint,
  AuditLogItem,
  BankBranch,
  BranchKiosk,
  RequestStatus,
  KioskStatus,
  AuthUser,
} from '../../types/banking';
import { formatInr, isRequestOverdue, maskAccountNumber } from '../../utils/banking';
import { INITIAL_KIOSKS } from '../../data/seedData';

interface OfficerDashboardProps {
  requests: BankingRequest[];
  queues: VirtualQueueToken[];
  complaints: Complaint[];
  auditLogs: AuditLogItem[];
  branches: BankBranch[];
  kiosks?: BranchKiosk[];
  currentUser?: AuthUser | null;
  onUpdateRequestStatus: (requestId: string, status: RequestStatus, notes?: string) => void;
  onUpdateQueueStatus: (
    tokenId: string,
    status: any,
    counterNumber?: number,
    officerName?: string
  ) => void;
  onUpdateComplaintStatus: (
    complaintId: string,
    status: any,
    remarks?: string
  ) => void;
  onOpenSettings?: () => void;
  onOpenKioskSimulator?: () => void;
}

type OfficerNavSection =
  | 'OVERVIEW'
  | 'REQUESTS'
  | 'APPROVALS'
  | 'KIOSKS'
  | 'COMPLAINTS'
  | 'HISTORY'
  | 'REPORTS'
  | 'SETTINGS';

export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({
  requests,
  queues,
  complaints,
  auditLogs,
  branches,
  kiosks = INITIAL_KIOSKS,
  currentUser,
  onUpdateRequestStatus,
  onUpdateQueueStatus,
  onUpdateComplaintStatus,
  onOpenSettings,
  onOpenKioskSimulator,
}) => {
  const [activeSection, setActiveSection] = useState<OfficerNavSection>('OVERVIEW');
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);

  // Request list search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'NEEDS_ATTENTION'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Request Detail Modal state
  const [selectedRequest, setSelectedRequest] = useState<BankingRequest | null>(null);
  const [officerNote, setOfficerNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Kiosk Detail Modal state
  const [selectedKiosk, setSelectedKiosk] = useState<BranchKiosk | null>(null);

  // Complaint modal state
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [complaintRemarks, setComplaintRemarks] = useState('');

  // Active kiosk list
  const [kioskList, setKioskList] = useState<BranchKiosk[]>(kiosks);

  // Map internal status to requested 4 simple statuses:
  // Pending · In Progress · Completed · Needs Attention
  const getSimpleStatus = (req: BankingRequest): 'Pending' | 'In Progress' | 'Completed' | 'Needs Attention' => {
    if (isRequestOverdue(req.slaDeadline) && req.status !== 'APPROVED') {
      return 'Needs Attention';
    }
    if (req.status === 'REJECTED' || req.status === 'ADDITIONAL_DOCS_REQUIRED') {
      return 'Needs Attention';
    }
    if (req.status === 'APPROVED') {
      return 'Completed';
    }
    if (req.status === 'IN_VERIFICATION') {
      return 'In Progress';
    }
    return 'Pending';
  };

  // Status counts
  const pendingCount = requests.filter((r) => getSimpleStatus(r) === 'Pending').length;
  const inProgressCount = requests.filter((r) => getSimpleStatus(r) === 'In Progress').length;
  const completedCount = requests.filter((r) => getSimpleStatus(r) === 'Completed').length;
  const needsAttentionCount = requests.filter((r) => getSimpleStatus(r) === 'Needs Attention').length;

  // Filtered requests list
  const filteredRequests = requests.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      r.referenceNumber.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      r.serviceName.toLowerCase().includes(q) ||
      r.accountNumber.includes(q);

    const s = getSimpleStatus(r);
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && s === 'Pending') ||
      (statusFilter === 'IN_PROGRESS' && s === 'In Progress') ||
      (statusFilter === 'COMPLETED' && s === 'Completed') ||
      (statusFilter === 'NEEDS_ATTENTION' && s === 'Needs Attention');

    const matchesCategory = categoryFilter === 'ALL' || r.serviceCategory === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Approvals queue: requests pending officer approval
  const approvalRequests = requests.filter(
    (r) => r.status === 'PENDING_APPROVAL' || r.status === 'IN_VERIFICATION'
  );

  // Kiosk summary
  const onlineKiosks = kioskList.filter((k) => k.status === 'ONLINE').length;
  const attentionKiosks = kioskList.filter((k) => k.status === 'NEEDS_ATTENTION').length;
  const offlineKiosks = kioskList.filter((k) => k.status === 'OFFLINE').length;

  // Handle Quick Approve
  const handleApprove = (req: BankingRequest) => {
    onUpdateRequestStatus(req.id, 'APPROVED', officerNote || 'Approved via digital banking portal');
    setSelectedRequest(null);
    setOfficerNote('');
  };

  // Handle Reject
  const handleReject = (req: BankingRequest) => {
    if (!rejectReason.trim()) return;
    onUpdateRequestStatus(req.id, 'REJECTED', rejectReason);
    setSelectedRequest(null);
    setRejectReason('');
    setIsRejecting(false);
  };

  // Handle Request Additional Documents
  const handleRequestDocs = (req: BankingRequest) => {
    onUpdateRequestStatus(
      req.id,
      'ADDITIONAL_DOCS_REQUIRED',
      officerNote || 'Additional supporting documentation requested from customer.'
    );
    setSelectedRequest(null);
    setOfficerNote('');
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col md:flex-row font-sans text-slate-800">
      {/* 1. DESKTOP / LAPTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 p-4 space-y-6 shrink-0">
        {/* Workspace Brand / Header */}
        <div className="px-2 pt-1 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              JSB
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 leading-tight">Branch Operations</div>
              <div className="text-[10px] text-slate-400">Desk #JSB-EMP-8841</div>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50 animate-pulse"></span>
        </div>

        {/* Sidebar Navigation Menu */}
        <nav className="flex-1 space-y-1">
          <button
            onClick={() => setActiveSection('OVERVIEW')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeSection === 'OVERVIEW'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveSection('REQUESTS')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeSection === 'REQUESTS'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-4 h-4" />
              <span>Customer Requests</span>
            </div>
            {pendingCount > 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeSection === 'REQUESTS' ? 'bg-white text-slate-900' : 'bg-blue-100 text-blue-700'
                }`}
              >
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSection('APPROVALS')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeSection === 'APPROVALS'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-4 h-4" />
              <span>Approvals</span>
            </div>
            {approvalRequests.length > 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeSection === 'APPROVALS'
                    ? 'bg-white text-slate-900'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {approvalRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSection('KIOSKS')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeSection === 'KIOSKS'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Cpu className="w-4 h-4" />
              <span>Kiosk Management</span>
            </div>
            {attentionKiosks > 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeSection === 'KIOSKS'
                    ? 'bg-white text-slate-900'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {attentionKiosks}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSection('COMPLAINTS')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeSection === 'COMPLAINTS'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Customer Complaints</span>
          </button>

          <button
            onClick={() => setActiveSection('HISTORY')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeSection === 'HISTORY'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Service History</span>
          </button>

          <button
            onClick={() => setActiveSection('REPORTS')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeSection === 'REPORTS'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Reports</span>
          </button>

          <button
            onClick={() => {
              if (onOpenSettings) onOpenSettings();
              else setActiveSection('SETTINGS');
            }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeSection === 'SETTINGS'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Officer Profile Card at Bottom of Sidebar */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
              SR
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate">
                {currentUser?.name || 'Suresh Rao'}
              </div>
              <div className="text-[10px] text-slate-500 truncate">Senior Operations Officer</div>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MOBILE TOP NAVIGATION & TAB BAR */}
      <div className="md:hidden bg-white border-b border-slate-200 p-3 flex items-center justify-between sticky top-16 z-20">
        <div className="flex items-center space-x-2">
          <div className="text-xs font-bold text-slate-900">
            {activeSection === 'OVERVIEW' && 'Overview'}
            {activeSection === 'REQUESTS' && 'Customer Requests'}
            {activeSection === 'APPROVALS' && 'Approvals'}
            {activeSection === 'KIOSKS' && 'Kiosk Management'}
            {activeSection === 'COMPLAINTS' && 'Complaints'}
            {activeSection === 'HISTORY' && 'Service History'}
            {activeSection === 'REPORTS' && 'Reports'}
            {activeSection === 'SETTINGS' && 'Settings'}
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
            Staff Desk
          </span>
        </div>

        <button
          onClick={() => setIsMobileMoreOpen(!isMobileMoreOpen)}
          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg flex items-center space-x-1 text-xs"
        >
          <Menu className="w-4 h-4" />
          <span>Menu</span>
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMoreOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-2 z-20 shadow-md">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                setActiveSection('OVERVIEW');
                setIsMobileMoreOpen(false);
              }}
              className="p-2.5 rounded-xl border border-slate-200 text-left font-medium hover:bg-slate-50"
            >
              Overview
            </button>
            <button
              onClick={() => {
                setActiveSection('REQUESTS');
                setIsMobileMoreOpen(false);
              }}
              className="p-2.5 rounded-xl border border-slate-200 text-left font-medium hover:bg-slate-50"
            >
              Customer Requests ({pendingCount})
            </button>
            <button
              onClick={() => {
                setActiveSection('APPROVALS');
                setIsMobileMoreOpen(false);
              }}
              className="p-2.5 rounded-xl border border-slate-200 text-left font-medium hover:bg-slate-50"
            >
              Approvals ({approvalRequests.length})
            </button>
            <button
              onClick={() => {
                setActiveSection('KIOSKS');
                setIsMobileMoreOpen(false);
              }}
              className="p-2.5 rounded-xl border border-slate-200 text-left font-medium hover:bg-slate-50"
            >
              Kiosk Management
            </button>
            <button
              onClick={() => {
                setActiveSection('COMPLAINTS');
                setIsMobileMoreOpen(false);
              }}
              className="p-2.5 rounded-xl border border-slate-200 text-left font-medium hover:bg-slate-50"
            >
              Complaints
            </button>
            <button
              onClick={() => {
                setActiveSection('HISTORY');
                setIsMobileMoreOpen(false);
              }}
              className="p-2.5 rounded-xl border border-slate-200 text-left font-medium hover:bg-slate-50"
            >
              Service History
            </button>
            <button
              onClick={() => {
                setActiveSection('REPORTS');
                setIsMobileMoreOpen(false);
              }}
              className="p-2.5 rounded-xl border border-slate-200 text-left font-medium hover:bg-slate-50"
            >
              Reports
            </button>
            <button
              onClick={() => {
                if (onOpenSettings) onOpenSettings();
                else setActiveSection('SETTINGS');
                setIsMobileMoreOpen(false);
              }}
              className="p-2.5 rounded-xl border border-slate-200 text-left font-medium hover:bg-slate-50"
            >
              Settings
            </button>
          </div>
        </div>
      )}

      {/* 3. MAIN DASHBOARD CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl w-full">
        {/* ================= SECTION A: OVERVIEW ================= */}
        {activeSection === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* Top Welcome Message & Employee Profile */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    Welcome, {currentUser?.name || 'Suresh Rao'}
                  </h1>
                  <span className="bg-blue-50 text-blue-700 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                    Navrangpura Branch
                  </span>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Senior Branch Operations Officer • Staff ID: {currentUser?.employeeId || 'JSB-EMP-8841'} • Active shift: 09:30 AM - 05:00 PM
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveSection('APPROVALS')}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-xs flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Review Approvals ({approvalRequests.length})</span>
                </button>
              </div>
            </div>

            {/* 4 Essential Status KPI Cards */}
            {/* Status Labels: Pending · In Progress · Completed · Needs Attention */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Pending */}
              <div
                onClick={() => {
                  setStatusFilter('PENDING');
                  setActiveSection('REQUESTS');
                }}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Pending</span>
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {pendingCount}
                </div>
                <p className="text-xs text-slate-500 mt-1">Awaiting verification</p>
              </div>

              {/* 2. In Progress */}
              <div
                onClick={() => {
                  setStatusFilter('IN_PROGRESS');
                  setActiveSection('REQUESTS');
                }}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">In Progress</span>
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {inProgressCount}
                </div>
                <p className="text-xs text-slate-500 mt-1">Under verification</p>
              </div>

              {/* 3. Completed */}
              <div
                onClick={() => {
                  setStatusFilter('COMPLETED');
                  setActiveSection('REQUESTS');
                }}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Completed</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {completedCount}
                </div>
                <p className="text-xs text-slate-500 mt-1">Approved & delivered</p>
              </div>

              {/* 4. Needs Attention */}
              <div
                onClick={() => {
                  setStatusFilter('NEEDS_ATTENTION');
                  setActiveSection('REQUESTS');
                }}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Needs Attention</span>
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {needsAttentionCount}
                </div>
                <p className="text-xs text-slate-500 mt-1">SLA or Doc issues</p>
              </div>
            </div>

            {/* Kiosk Status and Alerts Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Branch Kiosk Status & Service Alerts</h2>
                  <p className="text-xs text-slate-500">Self-service machines in branch lobby and 24x7 e-Lobby</p>
                </div>
                <div className="flex items-center space-x-2">
                  {onOpenKioskSimulator && (
                    <button
                      onClick={onOpenKioskSimulator}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
                    >
                      <Monitor className="w-3.5 h-3.5 text-teal-400" />
                      <span>Launch Terminal Mode</span>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveSection('KIOSKS')}
                    className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center space-x-1 px-2.5 py-1.5 bg-blue-50 rounded-xl"
                  >
                    <span>Manage Kiosks</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {kioskList.slice(0, 3).map((kiosk) => (
                  <div
                    key={kiosk.id}
                    onClick={() => {
                      setSelectedKiosk(kiosk);
                    }}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all cursor-pointer bg-slate-50/50 flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">{kiosk.name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            kiosk.status === 'ONLINE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : kiosk.status === 'NEEDS_ATTENTION'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {kiosk.status === 'ONLINE'
                            ? 'Online'
                            : kiosk.status === 'NEEDS_ATTENTION'
                            ? 'Needs Attention'
                            : 'Offline'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{kiosk.locationDetails}</p>
                    </div>

                    <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{kiosk.todayTransactions} txns today</span>
                      <span className="text-blue-700 font-semibold">View Details →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Recent Customer Activity</h2>
                  <p className="text-xs text-slate-500">Latest submissions and service updates</p>
                </div>
                <button
                  onClick={() => setActiveSection('REQUESTS')}
                  className="text-xs text-blue-700 hover:text-blue-900 font-semibold"
                >
                  View All Requests
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {requests.slice(0, 5).map((req) => (
                  <div
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 text-xs font-bold">
                        {req.customerName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{req.customerName}</div>
                        <div className="text-[11px] text-slate-500">
                          {req.serviceName} • {maskAccountNumber(req.accountNumber)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-right">
                      <div className="hidden sm:block text-[11px] text-slate-400">
                        {new Date(req.submittedAt).toLocaleDateString()}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          getSimpleStatus(req) === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : getSimpleStatus(req) === 'Needs Attention'
                            ? 'bg-red-50 text-red-700'
                            : getSimpleStatus(req) === 'In Progress'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {getSimpleStatus(req)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION B: CUSTOMER REQUESTS ================= */}
        {activeSection === 'REQUESTS' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Customer Request Management</h1>
                <p className="text-xs text-slate-500">Inspect, verify documents, and process paperless requests</p>
              </div>

              {/* Status Filter Tabs */}
              <div className="bg-white border border-slate-200 rounded-xl p-1 flex items-center space-x-1 text-xs">
                {(['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'NEEDS_ATTENTION'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                      statusFilter === s
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {s === 'ALL'
                      ? 'All'
                      : s === 'PENDING'
                      ? 'Pending'
                      : s === 'IN_PROGRESS'
                      ? 'In Progress'
                      : s === 'COMPLETED'
                      ? 'Completed'
                      : 'Needs Attention'}
                  </button>
                ))}
              </div>
            </div>

            {/* Search and Category Filter Bar */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Request ID, customer name, service or account..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Categories</option>
                  <option value="ACCOUNT">Account Services</option>
                  <option value="KYC">KYC & Identity</option>
                  <option value="LOAN">Loans & Advances</option>
                  <option value="DEPOSIT_CERTIFICATE">Certificates & Deposits</option>
                </select>
              </div>
            </div>

            {/* Request List Table / Card View */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Request ID</th>
                      <th className="py-3 px-4">Customer & Account</th>
                      <th className="py-3 px-4">Service Requested</th>
                      <th className="py-3 px-4">Submitted On</th>
                      <th className="py-3 px-4">Current Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400">
                          No customer requests matching the current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {req.referenceNumber}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{req.customerName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {maskAccountNumber(req.accountNumber)}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-slate-800">{req.serviceName}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {new Date(req.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                getSimpleStatus(req) === 'Completed'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : getSimpleStatus(req) === 'Needs Attention'
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : getSimpleStatus(req) === 'In Progress'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {getSimpleStatus(req)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedRequest(req)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Inspect →
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION C: APPROVALS ================= */}
        {activeSection === 'APPROVALS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Approvals Desk</h1>
                <p className="text-xs text-slate-500">
                  Requests verified and pending final officer sign-off ({approvalRequests.length} queue items)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {approvalRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {req.referenceNumber}
                      </span>
                      <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                        {req.serviceCategory}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{req.serviceName}</h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Customer: <strong className="text-slate-800">{req.customerName}</strong> ({maskAccountNumber(req.accountNumber)})
                      </div>
                    </div>

                    {req.attachedDocuments && req.attachedDocuments.length > 0 && (
                      <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                        <div className="font-semibold text-[11px] text-slate-500">Attached Documents:</div>
                        {req.attachedDocuments.map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px]">
                            <span>{doc.name}</span>
                            <span className="text-emerald-600 font-medium">✓ OCR Verified</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleApprove(req)}
                      className="flex-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5 text-teal-400" />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= SECTION D: KIOSK MANAGEMENT ================= */}
        {activeSection === 'KIOSKS' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Kiosk Management</h1>
                <p className="text-xs text-slate-500">
                  Branch self-service terminals, cash recyclers, and passbook printing machines
                </p>
              </div>

              {/* Status summary & Terminal Launch */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {onOpenKioskSimulator && (
                  <button
                    onClick={onOpenKioskSimulator}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Launch Kiosk Terminal Mode</span>
                  </button>
                )}
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  {onlineKiosks} Online
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                  {attentionKiosks} Attention
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 font-semibold border border-red-200">
                  {offlineKiosks} Offline
                </span>
              </div>
            </div>

            {/* Kiosk Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kioskList.map((kiosk) => (
                <div
                  key={kiosk.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                          <Cpu className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{kiosk.name}</h3>
                          <span className="text-[11px] font-mono text-slate-400">{kiosk.kioskCode}</span>
                        </div>
                      </div>

                      {/* Simple Status Pill */}
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          kiosk.status === 'ONLINE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : kiosk.status === 'NEEDS_ATTENTION'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {kiosk.status === 'ONLINE'
                          ? 'Online'
                          : kiosk.status === 'NEEDS_ATTENTION'
                          ? 'Needs Attention'
                          : 'Offline'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">{kiosk.locationDetails}</p>

                    {/* Active alerts banner if any */}
                    {kiosk.activeAlerts.length > 0 && (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                        <div className="text-[11px] font-bold text-amber-900 flex items-center space-x-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Service Alerts:</span>
                        </div>
                        {kiosk.activeAlerts.map((alt, idx) => (
                          <div key={idx} className="text-[11px] text-amber-800 pl-4 list-disc">
                            • {alt}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Machine Hardware Modules */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                        <span className="text-slate-500">Printer:</span>
                        <span className="font-semibold text-slate-800">{kiosk.passbookPrinterStatus}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                        <span className="text-slate-500">Dispenser:</span>
                        <span className="font-semibold text-slate-800">{kiosk.cashDispenserStatus}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                        <span className="text-slate-500">Cheque Bin:</span>
                        <span className="font-semibold text-slate-800">{kiosk.chequeDepositStatus}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                        <span className="text-slate-500">Today Txns:</span>
                        <span className="font-semibold text-slate-800">{kiosk.todayTransactions}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Ping: {kiosk.lastPing}</span>
                    <button
                      onClick={() => setSelectedKiosk(kiosk)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= SECTION E: CUSTOMER COMPLAINTS ================= */}
        {activeSection === 'COMPLAINTS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Customer Grievances & Disputes</h1>
                <p className="text-xs text-slate-500">RBI Statutory 7-day turnaround tracking and dispute reversals</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Ticket Number</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Issue Category</th>
                    <th className="py-3 px-4">Disputed Amount</th>
                    <th className="py-3 px-4">Resolution Deadline</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.complaintNumber}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{c.customerName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{maskAccountNumber(c.accountNumber)}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">{c.category.replace('_', ' ')}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {c.amount ? formatInr(c.amount) : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{new Date(c.resolutionDeadline).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.status === 'RESOLVED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedComplaint(c);
                            setComplaintRemarks(c.resolutionRemarks || '');
                          }}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
                        >
                          Review & Resolve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= SECTION F: SERVICE HISTORY ================= */}
        {activeSection === 'HISTORY' && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Service Audit Trail</h1>
              <p className="text-xs text-slate-500">Immutable ledger of bank employee operations and approvals</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-3">
              <div className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-3 flex items-start justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900">{log.action}</div>
                      <div className="text-slate-500 text-[11px]">
                        Actor: {log.actor} ({log.actorRole}) • Target: {log.targetId}
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-slate-400 font-mono">
                      <div>{log.timestamp}</div>
                      <div className="text-[10px] text-slate-300 truncate max-w-[120px]">{log.checksum}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION G: REPORTS ================= */}
        {activeSection === 'REPORTS' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Operational Efficiency Reports</h1>
              <p className="text-xs text-slate-500">Branch productivity, citizen time saved, and paperless impact</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                <span className="text-xs text-slate-500 font-medium">Paper Saved Today</span>
                <div className="text-3xl font-extrabold text-teal-600 mt-1">682 Sheets</div>
                <p className="text-[11px] text-slate-400 mt-1">~0.08 trees protected</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                <span className="text-xs text-slate-500 font-medium">Citizen Branch Hours Avoided</span>
                <div className="text-3xl font-extrabold text-blue-600 mt-1">146 Hours</div>
                <p className="text-[11px] text-slate-400 mt-1">Avg 35 mins saved per service</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                <span className="text-xs text-slate-500 font-medium">Digital Approval SLA Compliance</span>
                <div className="text-3xl font-extrabold text-slate-900 mt-1">98.4%</div>
                <p className="text-[11px] text-emerald-600 mt-1">Above target benchmark</p>
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION H: SETTINGS ================= */}
        {activeSection === 'SETTINGS' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4 max-w-xl">
            <h2 className="text-base font-bold text-slate-900">Branch Operations Settings</h2>
            <p className="text-xs text-slate-500">Configure officer desk notifications and printer bindings.</p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-700">Audio chime on high-priority customer arrival</span>
                <input type="checkbox" defaultChecked className="rounded text-slate-900" />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-700">Require Biometric Confirmation for approvals</span>
                <input type="checkbox" defaultChecked className="rounded text-slate-900" />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= DETAIL MODAL: CUSTOMER REQUEST INSPECTOR ================= */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {selectedRequest.referenceNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      getSimpleStatus(selectedRequest) === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : getSimpleStatus(selectedRequest) === 'Needs Attention'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {getSimpleStatus(selectedRequest)}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedRequest.serviceName}</h2>
              </div>
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setIsRejecting(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Customer Information Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Customer</span>
                <span className="font-bold text-slate-900">{selectedRequest.customerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Account</span>
                <span className="font-mono font-semibold text-slate-800">
                  {maskAccountNumber(selectedRequest.accountNumber)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Branch</span>
                <span className="text-slate-800">{selectedRequest.branch}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Phone</span>
                <span className="text-slate-800">{selectedRequest.customerPhone || '+91 98250 88292'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Submitted</span>
                <span className="text-slate-800">
                  {new Date(selectedRequest.submittedAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">SLA Target</span>
                <span className="text-slate-800">
                  {new Date(selectedRequest.slaDeadline).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Customer Submitted Form Details */}
            {selectedRequest.formData && Object.keys(selectedRequest.formData).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Submitted Form Fields
                </h4>
                <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs divide-y divide-slate-100">
                  {Object.entries(selectedRequest.formData).map(([k, v]) => (
                    <div key={k} className="py-1.5 flex items-center justify-between">
                      <span className="text-slate-500 font-medium capitalize">
                        {k.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span className="font-semibold text-slate-900">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attached Documents & Verification Status */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Attached Documents & KYC Status
              </h4>
              <div className="space-y-2">
                {selectedRequest.attachedDocuments && selectedRequest.attachedDocuments.length > 0 ? (
                  selectedRequest.attachedDocuments.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <div>
                          <span className="font-semibold text-slate-900">{doc.name}</span>
                          <span className="text-[10px] text-slate-400 block">{doc.type}</span>
                        </div>
                      </div>
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                        ✓ Verified by AI
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 italic">No supplementary documents required for this service.</div>
                )}
              </div>
            </div>

            {/* Officer Action Box */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700">Officer Verification Notes</label>
              <input
                type="text"
                value={officerNote}
                onChange={(e) => setOfficerNote(e.target.value)}
                placeholder="Add verification remarks or approvals note..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {isRejecting ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-red-900">
                    Reason for Rejection (Customer will receive notification)
                  </label>
                  <input
                    type="text"
                    required
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Signature mismatch or incomplete identity proof"
                    className="w-full px-3 py-2 text-xs bg-white border border-red-300 rounded-lg text-slate-900"
                  />
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsRejecting(false)}
                      className="px-3 py-1 text-xs text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(selectedRequest)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleRequestDocs(selectedRequest)}
                    className="w-full sm:w-auto px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Request More Documents
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRejecting(true)}
                    className="w-full sm:w-auto px-4 py-2 border border-red-200 text-red-700 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedRequest)}
                    className="w-full sm:w-auto px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs flex items-center justify-center space-x-1"
                  >
                    <Check className="w-4 h-4 text-teal-400" />
                    <span>Approve & Complete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= DETAIL MODAL: KIOSK DETAILS ================= */}
      {selectedKiosk && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedKiosk.name}</h3>
                  <div className="text-xs text-slate-400 font-mono">{selectedKiosk.kioskCode}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedKiosk(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Simple Status & Location */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Machine Status:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                    selectedKiosk.status === 'ONLINE'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-800'
                  }`}
                >
                  {selectedKiosk.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-semibold text-slate-800">{selectedKiosk.locationDetails}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Last Network Heartbeat:</span>
                <span className="text-slate-800">{selectedKiosk.lastPing}</span>
              </div>
            </div>

            {/* Hardware Module Health */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Hardware Diagnostics
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Passbook Printer</span>
                  <span className="font-bold text-slate-800">{selectedKiosk.passbookPrinterStatus}</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Cash Dispenser</span>
                  <span className="font-bold text-slate-800">{selectedKiosk.cashDispenserStatus}</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Cheque Deposit Bin</span>
                  <span className="font-bold text-slate-800">{selectedKiosk.chequeDepositStatus}</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Touchscreen</span>
                  <span className="font-bold text-slate-800">{selectedKiosk.touchScreenStatus}</span>
                </div>
              </div>
            </div>

            {/* Maintenance History */}
            {selectedKiosk.maintenanceHistory && selectedKiosk.maintenanceHistory.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Maintenance Log
                </h4>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs space-y-1">
                  {selectedKiosk.maintenanceHistory.map((m, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span>{m.issue}</span>
                        <span className="text-slate-400 font-normal">{m.date}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{m.actionTaken}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedKiosk(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DETAIL MODAL: COMPLAINT RESOLUTION ================= */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-slate-900">
                  {selectedComplaint.complaintNumber}
                </span>
                <h3 className="font-bold text-slate-900 text-base">{selectedComplaint.customerName}</h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                <strong>Description:</strong> {selectedComplaint.description}
              </p>
              {selectedComplaint.amount && (
                <p>
                  <strong>Disputed Amount:</strong> {formatInr(selectedComplaint.amount)}
                </p>
              )}
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-semibold text-slate-700">Resolution Remarks</label>
              <textarea
                rows={3}
                value={complaintRemarks}
                onChange={(e) => setComplaintRemarks(e.target.value)}
                placeholder="Enter NPCI reversal details or branch investigation resolution..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateComplaintStatus(selectedComplaint.id, 'RESOLVED', complaintRemarks);
                  setSelectedComplaint(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
              >
                Resolve & Close Grievance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
