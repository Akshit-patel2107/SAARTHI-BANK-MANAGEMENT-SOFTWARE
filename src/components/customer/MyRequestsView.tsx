import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  ChevronRight,
  ArrowUpRight,
  ShieldCheck,
  Building,
  UploadCloud,
  XCircle,
} from 'lucide-react';
import { BankingRequest, Language } from '../../types/banking';
import { translations } from '../../utils/i18n';
import { isRequestOverdue } from '../../utils/banking';

interface MyRequestsViewProps {
  requests: BankingRequest[];
  language: Language;
  onOpenServiceModal: () => void;
  onUpdateStatus?: (requestId: string, newStatus: any, notes?: string) => void;
}

export const MyRequestsView: React.FC<MyRequestsViewProps> = ({
  requests,
  language,
  onOpenServiceModal,
  onUpdateStatus,
}) => {
  const t = translations[language];
  const [selectedReq, setSelectedReq] = useState<BankingRequest | null>(
    requests[0] || null
  );
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filtered = requests.filter((r) => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
            Approved & Completed
          </span>
        );
      case 'PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3 mr-1 text-blue-600" />
            Awaiting Branch Manager Sign-Off
          </span>
        );
      case 'IN_VERIFICATION':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            <Clock className="w-3 h-3 mr-1 text-slate-600" />
            KYC & Document Verification
          </span>
        );
      case 'ADDITIONAL_DOCS_REQUIRED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3 h-3 mr-1 text-amber-600" />
            Action Required: Resubmit Document
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 mr-1 text-rose-600" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t.myRequests}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time tracking of routine branch service submissions, officer verifications, and SLA timelines.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {['ALL', 'IN_VERIFICATION', 'PENDING_APPROVAL', 'APPROVED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filterStatus === st
                  ? 'bg-blue-700 text-white shadow-xs font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {st === 'ALL'
                ? 'All'
                : st === 'IN_VERIFICATION'
                ? 'In Verification'
                : st === 'PENDING_APPROVAL'
                ? 'Manager Approval'
                : 'Approved'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: Request List + Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Requests List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filtered.map((req) => {
            const isSelected = selectedReq?.id === req.id;
            const overdue = isRequestOverdue(req.slaDeadline);

            return (
              <div
                key={req.id}
                onClick={() => setSelectedReq(req)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-1 ring-blue-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold text-blue-900 block">
                      {req.referenceNumber}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900">{req.serviceName}</h3>
                    <p className="text-xs text-slate-500">{req.branch}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-400 ${isSelected ? 'text-blue-600' : ''}`} />
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>{getStatusBadge(req.status)}</div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(req.submittedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
              <p className="text-xs text-slate-500">No requests found under this status filter.</p>
            </div>
          )}
        </div>

        {/* Right Side: Detailed Timeline & Audit Inspector (7 cols) */}
        <div className="lg:col-span-7">
          {selectedReq ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 sticky top-24">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Request Details
                  </span>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <h2 className="text-lg font-bold text-slate-900">{selectedReq.serviceName}</h2>
                    <span className="font-mono text-xs text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {selectedReq.referenceNumber}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center space-x-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Slip</span>
                  </button>
                </div>
              </div>

              {/* Status and SLA card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Current Status:</span>
                  <div className="mt-1">{getStatusBadge(selectedReq.status)}</div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Submitted On:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(selectedReq.submittedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Target SLA:</span>
                  <span className="font-semibold text-emerald-700">
                    {new Date(selectedReq.slaDeadline).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              </div>

              {/* Officer Remarks / Instructions banner */}
              {selectedReq.officerNotes && (
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-blue-900 block flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-blue-700" />
                    Bank Officer Verification Note:
                  </span>
                  <p className="text-blue-950 leading-relaxed">{selectedReq.officerNotes}</p>
                </div>
              )}

              {/* Form Data Submitted */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Submitted Particulars:
                </h4>
                <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(selectedReq.formData || {}).map(([key, val]) => (
                    <div key={key} className="py-0.5">
                      <span className="text-slate-400 text-[11px] block capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                      </span>
                      <span className="font-medium text-slate-800">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attached Documents */}
              {selectedReq.attachedDocuments && selectedReq.attachedDocuments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Attached & Verified Documents:
                  </h4>
                  <div className="space-y-2">
                    {selectedReq.attachedDocuments.map((doc, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-slate-800">{doc.name}</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-semibold">
                          OCR Verified ✓
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step-by-Step Statutory Timeline */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Processing & Audit Trail:
                </h4>
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {(selectedReq.auditTrail || []).map((audit, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white"></div>
                      <p className="text-xs font-semibold text-slate-800">{audit.action}</p>
                      <p className="text-[11px] text-slate-500">
                        {audit.actor} ({audit.role}) • {new Date(audit.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {audit.comment && (
                        <p className="text-[11px] text-slate-600 bg-slate-100 p-1.5 rounded mt-1 italic">
                          "{audit.comment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <p className="text-sm text-slate-500">Select a request on the left to view timeline.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
