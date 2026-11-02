import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  ShieldAlert,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Building,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { Complaint, Language, ComplaintCategory } from '../../types/banking';
import { translations } from '../../utils/i18n';
import { formatInr, generateReferenceNumber } from '../../utils/banking';

interface ComplaintsCenterProps {
  complaints: Complaint[];
  language: Language;
  onRegisterComplaint: (complaint: Complaint) => void;
  onOpenAssistantForDispute: () => void;
}

export const ComplaintsCenter: React.FC<ComplaintsCenterProps> = ({
  complaints,
  language,
  onRegisterComplaint,
  onOpenAssistantForDispute,
}) => {
  const t = translations[language];

  const [showFilingModal, setShowFilingModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ComplaintCategory>('UPI_FAILURE');
  const [txnRef, setTxnRef] = useState('UPI/20261102/894819284719');
  const [disputeAmount, setDisputeAmount] = useState<number>(2500);
  const [disputeDate, setDisputeDate] = useState('2026-11-01');
  const [description, setDescription] = useState(
    'Payment debited at merchant point but transaction failed. No credit received after 24 hours.'
  );

  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(
    complaints[0] || null
  );

  const handleCreateComplaint = (e: React.FormEvent) => {
    e.preventDefault();

    const ref = generateReferenceNumber('CMP');
    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + 3); // RBI T+3 resolution SLA

    const newCmp: Complaint = {
      id: `CMP-${Date.now()}`,
      complaintNumber: ref,
      category: selectedCategory,
      customerId: 'CUST-001',
      customerName: 'Rajesh Manubhai Patel',
      customerPhone: '+91 98250 14892',
      accountNumber: '501004829104',
      transactionReference: txnRef,
      amount: disputeAmount,
      disputeDate: disputeDate,
      description: description,
      status: 'UNDER_INVESTIGATION',
      registeredAt: new Date().toISOString(),
      resolutionDeadline: deadlineDate.toISOString(),
      assignedOfficer: 'Deepak Nair (Dispute Operations)',
      timeline: [
        {
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: 'Complaint Registered',
          note: 'Logged in digital redressal ledger and sent to NPCI clearing switch.',
        },
      ],
    };

    onRegisterComplaint(newCmp);
    setActiveComplaint(newCmp);
    setShowFilingModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {t.complaints}
            </h1>
            <span className="bg-blue-50 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
              RBI Ombudsman Integrated
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Resolve failed UPI debits, ATM cash shortages, and unauthorized transactions with transparent SLA tracking.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenAssistantForDispute}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Draft with AI Assistant</span>
          </button>
          <button
            onClick={() => setShowFilingModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>File New Dispute</span>
          </button>
        </div>
      </div>

      {/* RBI Ombudsman 3-Tier Escalation Ladder */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
            <ShieldCheck className="w-4 h-4 text-blue-600 mr-1.5" />
            RBI Integrated Ombudsman Escalation Ladder (Circular Ref: CEPD.PR.No.12)
          </span>
          <span className="text-[11px] text-slate-500">Auto-Escalation Protected</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-blue-700 block">
              Tier 1: Branch & System Nodal
            </span>
            <p className="font-semibold text-slate-800">Turnaround Time: 1 to 7 Days</p>
            <p className="text-[11px] text-slate-500">
              Automated reconciliation with NPCI UPI / ATM switch for fast refund posting.
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-700 block">
              Tier 2: Principal Nodal Officer (PNO)
            </span>
            <p className="font-semibold text-slate-800">Days 8 to 21</p>
            <p className="text-[11px] text-slate-500">
              Senior executive review if unresolved at branch level with compensation tracking.
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">
              Tier 3: RBI CMS Ombudsman Portal
            </span>
            <p className="font-semibold text-slate-800">After 30 Days</p>
            <p className="text-[11px] text-slate-500">
              Automatic escalation to Reserve Bank of India with official statutory docket.
            </p>
          </div>
        </div>
      </div>

      {/* Main Complaints List + Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Complaints List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {complaints.map((c) => {
            const isSelected = activeComplaint?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setActiveComplaint(c)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-1 ring-blue-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-900 block">
                      {c.complaintNumber}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900 mt-0.5">
                      {c.category.replace('_', ' ')}
                    </h3>
                  </div>
                  {c.amount && (
                    <span className="text-xs font-bold text-slate-900">
                      {formatInr(c.amount)}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{c.description}</p>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {c.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(c.registeredAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Active Complaint Investigation Timeline (7 cols) */}
        <div className="lg:col-span-7">
          {activeComplaint ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 sticky top-24">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Dispute Reference
                  </span>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <h2 className="text-lg font-bold text-slate-900 font-mono">
                      {activeComplaint.complaintNumber}
                    </h2>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {activeComplaint.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {activeComplaint.amount && (
                  <div className="text-right">
                    <span className="text-slate-400 text-[11px] block">Disputed Sum</span>
                    <strong className="text-lg font-extrabold text-slate-900">
                      {formatInr(activeComplaint.amount)}
                    </strong>
                  </div>
                )}
              </div>

              {/* Status Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Txn Reference / UTR:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {activeComplaint.transactionReference || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Assigned Officer:</span>
                  <span className="font-medium text-slate-800">
                    {activeComplaint.assignedOfficer || 'Auto-Switch Nodal'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Logged On:</span>
                  <span className="text-slate-800">
                    {new Date(activeComplaint.registeredAt).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Resolution Deadline:</span>
                  <span className="font-semibold text-emerald-700">
                    {new Date(activeComplaint.resolutionDeadline).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Customer Statement:
                </span>
                <p className="text-xs text-slate-700 bg-slate-50/70 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {activeComplaint.description}
                </p>
              </div>

              {/* Resolution Remarks if resolved */}
              {activeComplaint.resolutionRemarks && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-emerald-900 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                    Final Bank Resolution:
                  </span>
                  <p className="text-emerald-950">{activeComplaint.resolutionRemarks}</p>
                </div>
              )}

              {/* Investigation History Timeline */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Investigation & Switch Timeline:
                </h4>
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {activeComplaint.timeline.map((item, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white"></div>
                      <p className="text-xs font-semibold text-slate-800">{item.status}</p>
                      <p className="text-[11px] text-slate-500">{item.date}</p>
                      <p className="text-xs text-slate-600 mt-1">{item.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <p className="text-sm text-slate-500">Select a dispute from the left to inspect.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Complaint Modal */}
      {showFilingModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Register Banking Grievance / Dispute
              </h3>
              <button
                onClick={() => setShowFilingModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dispute Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="UPI_FAILURE">UPI Failed Payment (Debited not credited)</option>
                  <option value="ATM_DISPENSER">ATM Cash Dispenser Shortage</option>
                  <option value="UNAUTHORIZED_TXN">Unauthorized Electronic Debit</option>
                  <option value="WRONG_CHARGES">Incorrect Service Charge / Annual Fee</option>
                  <option value="CHEQUE_CLEARING">Cheque Return / Delayed Clearing</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Disputed Amount (INR)
                  </label>
                  <input
                    type="number"
                    required
                    value={disputeAmount}
                    onChange={(e) => setDisputeAmount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    required
                    value={disputeDate}
                    onChange={(e) => setDisputeDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transaction RRN / UTR / Reference No.
                </label>
                <input
                  type="text"
                  required
                  placeholder="12-digit UPI RRN or ATM Slip Ref"
                  value={txnRef}
                  onChange={(e) => setTxnRef(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description of Issue
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                ></textarea>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl text-[11px] text-blue-900 border border-blue-200 flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <span>
                  <strong>RBI Protection:</strong> Under RBI circular on Harmonisation of TAT, if the
                  auto-reversal is delayed beyond T+1, banks are liable to pay ₹100 per day compensation.
                </span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFilingModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  Register Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
