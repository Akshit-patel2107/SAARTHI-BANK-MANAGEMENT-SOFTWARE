/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  ArrowUpRight,
  FileText,
  ShieldCheck,
  ChevronRight,
  CreditCard,
  UserCheck,
  QrCode,
  MapPin,
  Sparkles,
  TreePine,
  CheckCircle2,
  RefreshCw,
  Search,
  BookOpen,
  Clock,
  ArrowRight,
  Cpu,
  Printer,
  Monitor,
} from 'lucide-react';
import {
  BankAccount,
  BankingRequest,
  VirtualQueueToken,
  Language,
  BankingService,
  AuthUser,
} from '../../types/banking';
import { translations } from '../../utils/i18n';
import { formatInr, maskAccountNumber } from '../../utils/banking';

interface CustomerDashboardProps {
  accounts: BankAccount[];
  requests: BankingRequest[];
  activeTokens: VirtualQueueToken[];
  language: Language;
  currentUser?: AuthUser | null;
  onNavigateTab: (tab: string) => void;
  onSelectService: (serviceId: string) => void;
  popularServices: BankingService[];
  onOpenAssistant: () => void;
  onOpenKioskSimulator?: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  accounts,
  requests,
  activeTokens,
  language,
  currentUser,
  onNavigateTab,
  onSelectService,
  popularServices,
  onOpenAssistant,
  onOpenKioskSimulator,
}) => {
  const t = translations[language];
  const [showBalance, setShowBalance] = useState(true);
  const [selectedAccountIdx, setSelectedAccountIdx] = useState(0);

  const activeAccount = accounts[selectedAccountIdx] || accounts[0];
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  const userActiveToken = activeTokens.find(
    (tok) => tok.status === 'WAITING' || tok.status === 'SERVING'
  );

  const pendingRequests = requests.filter(
    (r) => r.status !== 'APPROVED' && r.status !== 'REJECTED'
  );

  const userName = currentUser?.name || 'Customer';

  return (
    <div className="space-y-6">
      {/* 1. Welcome Header & KYC Shield */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-1.5 bg-teal-50 text-teal-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-teal-200">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Full KYC Verified • DPDP Act 2023 Protected</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t.welcomeBack}, {userName}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Primary Account: <strong className="font-mono text-slate-700">{maskAccountNumber(activeAccount?.accountNumber || '501004829104')}</strong> • {activeAccount?.branchName || 'Navrangpura Commerce Branch'}
          </p>
        </div>

        {/* Paperless Impact Pill */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex items-center space-x-3 shrink-0">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TreePine className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Paperless Impact</span>
            <span className="font-bold text-slate-900">4 Branch Visits Avoided</span>
            <span className="text-emerald-700 font-medium block text-[11px]">~12 Paper Sheets Saved</span>
          </div>
        </div>
      </div>

      {/* 2. Four Prominent Quick Action Cards */}
      {/* Required: Request a Service, Update Details, Cheque Book / Debit Card, Track Request */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Action 1: Request a Service */}
          <div
            onClick={() => onNavigateTab('services')}
            className="group p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
                Request a Service
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">Explore 100% paperless bank services</p>
            </div>
            <div className="text-blue-700 font-semibold text-xs flex items-center space-x-1 pt-1">
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Action 2: Update Details */}
          <div
            onClick={() => {
              const nomineeService = popularServices.find((s) => s.id === 'srv-nominee-01') || popularServices[0];
              if (nomineeService) onSelectService(nomineeService.id);
              else onNavigateTab('services');
            }}
            className="group p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-teal-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-teal-700 transition-colors">
                Update Details
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">Nominee, address & communication</p>
            </div>
            <div className="text-teal-700 font-semibold text-xs flex items-center space-x-1 pt-1">
              <span>Update Now</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Action 3: Cheque Book / Debit Card */}
          <div
            onClick={() => {
              const chqService = popularServices.find((s) => s.id === 'srv-cheque-02') || popularServices[1] || popularServices[0];
              if (chqService) onSelectService(chqService.id);
              else onNavigateTab('services');
            }}
            className="group p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-700 transition-colors">
                Cards & Cheque Book
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">Order personalised leaves & contactless ATM card</p>
            </div>
            <div className="text-indigo-700 font-semibold text-xs flex items-center space-x-1 pt-1">
              <span>Order Leaf</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Action 4: Track Request */}
          <div
            onClick={() => onNavigateTab('myRequests')}
            className="group p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-slate-900 transition-colors">
                Track Application
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">Live officer verification & digital receipts</p>
            </div>
            <div className="text-slate-800 font-semibold text-xs flex items-center space-x-1 pt-1">
              <span>View Status</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* 2.5 Branch Kiosk Self-Service Simulator Banner */}
      {onOpenKioskSimulator && (
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-teal-950 text-white rounded-2xl p-5 border border-blue-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30">
              <Cpu className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-white">Smart Branch Kiosk Terminal Simulator</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30">
                  Touchscreen Mode
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl">
                Experience physical branch automation: optical passbook line-printer, smart cheque drop box with OCR scanning, and NFC contactless card authentication.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenKioskSimulator}
            className="px-4 py-2.5 bg-teal-400 hover:bg-teal-300 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all shrink-0 shadow-xs hover:shadow-md"
          >
            <Monitor className="w-4 h-4" />
            <span>Launch Kiosk Terminal</span>
          </button>
        </div>
      )}

      {/* 3. Live Queue Token Banner (if active) */}
      {userActiveToken && (
        <div className="bg-white border-2 border-blue-500/30 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider">TOKEN</span>
              <span className="text-xs font-extrabold">{userActiveToken.tokenNumber}</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base text-slate-900">
                  Branch Queue Token #{userActiveToken.tokenNumber}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    userActiveToken.status === 'SERVING'
                      ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {userActiveToken.status === 'SERVING'
                    ? `NOW SERVING (Counter ${userActiveToken.counterNumber || 2})`
                    : 'IN QUEUE'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 flex items-center">
                <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                {userActiveToken.branchName} • {userActiveToken.serviceName}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('appointments')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors self-start md:self-auto"
          >
            <QrCode className="w-4 h-4 text-teal-400" />
            <span>Show QR Pass</span>
          </button>
        </div>
      )}

      {/* 4. Main Two-Column Layout: Accounts & Balance (Left) + Services & Recent Activity (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Accounts Summary */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t.balance}
              </span>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                aria-label={showBalance ? t.hideBalance : t.showBalance}
              >
                {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {showBalance ? formatInr(totalBalance) : '••••••••'}
              </p>
              <p className="text-xs text-slate-500 mt-1">Across 3 linked accounts</p>
            </div>

            {/* Linked Accounts List */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-700">Your Accounts</p>
              {accounts.map((acc, idx) => (
                <div
                  key={acc.accountNumber}
                  onClick={() => setSelectedAccountIdx(idx)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                    selectedAccountIdx === idx
                      ? 'border-blue-500 bg-blue-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900">
                        {acc.accountType === 'SAVINGS'
                          ? t.savingsAccount
                          : acc.accountType === 'CURRENT'
                          ? t.currentAccount
                          : 'Fixed Deposit (FD)'}
                      </span>
                      {selectedAccountIdx === idx && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                      )}
                    </div>
                    <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                      {acc.maskedNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">
                      {showBalance ? formatInr(acc.balance) : '••••'}
                    </span>
                    <span className="block text-[10px] text-teal-600 font-medium">Active</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigateTab('documents')}
                className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-2 border border-slate-200"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Open Digital Document Vault</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Routine Services & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Services Section */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Popular Paperless Services</h2>
                <p className="text-xs text-slate-500">Zero branch visits required</p>
              </div>
              <button
                onClick={() => onNavigateTab('services')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center space-x-1"
              >
                <span>View All Services</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {popularServices.slice(0, 4).map((service) => (
                <div
                  key={service.id}
                  onClick={() => onSelectService(service.id)}
                  className="group p-4 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer bg-slate-50/40 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                        {service.estimatedDays === 0 ? 'Instant Online' : `${service.estimatedDays} Day TAT`}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {service.title[language]}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {service.description[language]}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-emerald-700 font-medium">
                      ✓ {service.paperFormsAvoided} Forms Avoided
                    </span>
                    <span className="text-blue-700 font-semibold group-hover:underline">
                      Apply Now →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity & Tracking */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recent Service Applications</h2>
                <p className="text-xs text-slate-500">Live processing status and officer updates</p>
              </div>
              <button
                onClick={() => onNavigateTab('myRequests')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center space-x-1"
              >
                <span>Track All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {requests.slice(0, 3).map((req) => (
                <div key={req.id} className="py-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-900">{req.serviceName}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : req.status === 'PENDING_APPROVAL'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {req.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Ref: {req.referenceNumber} • Submitted: {new Date(req.submittedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigateTab('myRequests')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                  >
                    View Status
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Help & Support Banner for Accessible Assistance */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              Need assistance completing banking forms or understanding charges?
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Talk to Saarthi AI Guide in English, हिन्दी, or ગુજરાતી. Voice and step-by-step guidance available.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenAssistant}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-bold rounded-xl shrink-0 transition-colors shadow-xs"
        >
          Ask Saarthi Guide
        </button>
      </div>
    </div>
  );
};
