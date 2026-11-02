import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  UploadCloud,
  FileText,
  AlertCircle,
  Clock,
  Printer,
  ChevronRight,
  ArrowLeft,
  Eye,
} from 'lucide-react';
import {
  BankingService,
  BankAccount,
  BankingRequest,
  Language,
} from '../../types/banking';
import { translations } from '../../utils/i18n';
import {
  validatePan,
  maskPan,
  validateAadhaar,
  maskAadhaar,
  calculateEmi,
  calculateSlaDeadline,
  generateReferenceNumber,
  formatInr,
} from '../../utils/banking';

interface ServiceRequestModalProps {
  service: BankingService;
  accounts: BankAccount[];
  language: Language;
  onClose: () => void;
  onSubmit: (request: BankingRequest) => void;
}

export const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({
  service,
  accounts,
  language,
  onClose,
  onSubmit,
}) => {
  const t = translations[language];

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedAccount, setSelectedAccount] = useState<string>(
    accounts[0]?.accountNumber || ''
  );

  // Dynamic form state
  const [formData, setFormData] = useState<Record<string, any>>({
    // Nominee
    nomineeName: '',
    relationship: 'Spouse',
    nomineeDob: '',
    sharePercentage: 100,
    nomineeAadhaar: '',
    // Address
    newAddressLine: '',
    city: 'Ahmedabad',
    pincode: '380009',
    addressProofType: 'Electricity Bill',
    // Cheque
    leavesCount: 25,
    chequeType: 'Personalized Bearer',
    // Card
    cardReason: 'Damaged / Wear & Tear',
    cardVariant: 'RuPay Platinum Contactless EMV',
    // Loan
    loanAmount: 200000,
    loanTenureMonths: 24,
    businessType: 'Retail / Services',
    annualTurnover: 1200000,
    // Pension
    ppoNumber: '',
  });

  // Attached documents state with OCR extraction
  const [uploadedDocs, setUploadedDocs] = useState<
    {
      name: string;
      type: string;
      status: 'VERIFIED' | 'EXTRACTING' | 'PENDING';
      ocrPreview?: Record<string, string>;
    }[]
  >([]);

  const [consentGiven, setConsentGiven] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<BankingRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // EMI preview for loans
  const loanEmi = calculateEmi(
    formData.loanAmount || 200000,
    10.5,
    formData.loanTenureMonths || 24
  );

  // Handle simulated document upload with OCR extraction
  const handleSimulateUpload = (docLabel: string) => {
    const newDoc = {
      name: `${docLabel.replace(/[^a-zA-Z0-9]/g, '_')}_Verified.pdf`,
      type: docLabel,
      status: 'VERIFIED' as const,
      ocrPreview: {
        documentName: docLabel,
        extractionTime: '0.4s',
        dpdpMasking: 'Applied UIDAI Standard',
        ocrConfidence: '99.1%',
      },
    };
    setUploadedDocs((prev) => [...prev, newDoc]);
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Basic validation depending on service
    if (service.id === 'SRV-NOMINEE') {
      if (!formData.nomineeName.trim()) {
        setValidationError('Please enter legal full name of nominee.');
        return;
      }
      if (formData.nomineeAadhaar && !validateAadhaar(formData.nomineeAadhaar)) {
        setValidationError('Please enter a valid 12-digit Aadhaar number for the nominee.');
        return;
      }
    } else if (service.id === 'SRV-ADDRESS') {
      if (!formData.newAddressLine.trim() || !formData.pincode.trim()) {
        setValidationError('Please provide complete street address and PIN code.');
        return;
      }
    }

    setStep(2);
  };

  const handleFinalSubmit = () => {
    if (!consentGiven) {
      setValidationError('Please agree to the statutory declaration and banking terms.');
      return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const refNumber = generateReferenceNumber('REQ');
    const deadline = calculateSlaDeadline(now.toISOString(), service.estimatedDays || 2);

    const newReq: BankingRequest = {
      id: `REQ-${Date.now()}`,
      referenceNumber: refNumber,
      customerId: 'CUST-001',
      customerName: 'Rajesh Manubhai Patel',
      customerPhone: '+91 98250 14892',
      customerEmail: 'rajesh.patel@gujaratcorp.in',
      accountNumber: selectedAccount,
      serviceId: service.id,
      serviceName: service.title.en,
      serviceCategory: service.category,
      branch: 'Navrangpura Commerce Branch, Ahmedabad',
      status: 'IN_VERIFICATION',
      priority: 'NORMAL',
      submittedAt: now.toISOString(),
      updatedAt: now.toISOString(),
      slaDeadline: deadline,
      formData: {
        ...formData,
        ...(formData.nomineeAadhaar
          ? { nomineeAadhaarMasked: maskAadhaar(formData.nomineeAadhaar) }
          : {}),
      },
      attachedDocuments: uploadedDocs.map((d) => ({
        name: d.name,
        type: d.type,
        ocrExtracted: d.ocrPreview,
        verified: true,
      })),
      auditTrail: [
        {
          id: `AUD-${Date.now()}`,
          timestamp: now.toISOString(),
          actor: 'Rajesh Manubhai Patel',
          role: 'CUSTOMER',
          action: 'Submitted paperless digital request with customer authorization',
        },
      ],
    };

    setTimeout(() => {
      onSubmit(newReq);
      setSubmittedRequest(newReq);
      setIsSubmitting(false);
      setStep(4);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {service.title[language]}
              </h2>
              <p className="text-xs text-slate-300">
                100% Paperless • Target SLA: {service.estimatedDays} Days
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Bar (Steps 1 to 3) */}
        {step < 4 && (
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span
              className={`font-semibold flex items-center space-x-1.5 ${
                step >= 1 ? 'text-blue-700' : 'text-slate-400'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[11px]">
                1
              </span>
              <span>Details & Account</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span
              className={`font-semibold flex items-center space-x-1.5 ${
                step >= 2 ? 'text-blue-700' : 'text-slate-400'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[11px]">
                2
              </span>
              <span>Documents & OCR</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span
              className={`font-semibold flex items-center space-x-1.5 ${
                step >= 3 ? 'text-blue-700' : 'text-slate-400'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[11px]">
                3
              </span>
              <span>Review & Authorize</span>
            </span>
          </div>
        )}

        {/* Validation Error Banner */}
        {validationError && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{validationError}</span>
          </div>
        )}

        {/* STEP 1: FORM INPUTS */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="p-6 space-y-5">
            {/* Account Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Bank Account
              </label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.accountNumber} value={acc.accountNumber}>
                    {acc.accountType} - {acc.maskedNumber} (Balance: {formatInr(acc.balance)})
                  </option>
                ))}
              </select>
            </div>

            {/* Service-Specific Fields */}
            {service.id === 'SRV-NOMINEE' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-800">
                  Form DA-1 (Nomination under Section 45ZA of Banking Regulation Act)
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nominee Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bhavna Rajesh Patel"
                      value={formData.nomineeName}
                      onChange={(e) =>
                        setFormData({ ...formData, nomineeName: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Relationship with Account Holder *
                    </label>
                    <select
                      value={formData.relationship}
                      onChange={(e) =>
                        setFormData({ ...formData, relationship: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <option value="Spouse">Spouse (पति / पत्नी)</option>
                      <option value="Son">Son (पुत्र)</option>
                      <option value="Daughter">Daughter (पुत्री)</option>
                      <option value="Mother">Mother (माता)</option>
                      <option value="Father">Father (पिता)</option>
                      <option value="Other">Other Legal Dependent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nominee Date of Birth *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.nomineeDob}
                      onChange={(e) =>
                        setFormData({ ...formData, nomineeDob: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nominee Aadhaar Number (UIDAI)
                    </label>
                    <input
                      type="text"
                      maxLength={14}
                      placeholder="XXXX-XXXX-1234"
                      value={formData.nomineeAadhaar}
                      onChange={(e) =>
                        setFormData({ ...formData, nomineeAadhaar: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {service.id === 'SRV-ADDRESS' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-800">
                  New Communication & Permanent Address
                </p>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Street Address & Premise Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B-402, Shivalik Heights, CG Road"
                    value={formData.newAddressLine}
                    onChange={(e) =>
                      setFormData({ ...formData, newAddressLine: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      City / District *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      6-Digit PIN Code *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) =>
                        setFormData({ ...formData, pincode: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {service.id === 'SRV-CHEQUE' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-800">Cheque Book Options</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Number of Leaves
                    </label>
                    <select
                      value={formData.leavesCount}
                      onChange={(e) =>
                        setFormData({ ...formData, leavesCount: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <option value={25}>25 Leaves (Complimentary)</option>
                      <option value={50}>50 Leaves (Standard)</option>
                      <option value={100}>100 Leaves (Commercial)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Delivery Method
                    </label>
                    <input
                      type="text"
                      disabled
                      value="India Post SpeedPost to Registered Address"
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {service.category === 'LOAN' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-800">
                  Loan Amount & EMI Estimator
                </p>
                <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Requested Principal:</span>
                    <strong className="text-blue-900 font-bold text-sm">
                      {formatInr(formData.loanAmount)}
                    </strong>
                  </div>
                  <input
                    type="range"
                    min={50000}
                    max={1000000}
                    step={25000}
                    value={formData.loanAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, loanAmount: parseInt(e.target.value) })
                    }
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-blue-200/60">
                    <div>
                      <span className="text-slate-500 block">Est. Monthly EMI:</span>
                      <strong className="text-emerald-700 font-extrabold text-base">
                        {formatInr(loanEmi.emi)}/mo
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block">Interest Rate:</span>
                      <strong className="text-slate-800">10.5% p.a. (Fixed)</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1 Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
              >
                <span>Continue to Documents</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: DOCUMENT UPLOAD & OCR VERIFICATION */}
        {step === 2 && (
          <div className="p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Attach Supporting Proofs (DPDP Act Masked)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload scans or use pre-verified records from your SetuBank Document Vault.
              </p>
            </div>

            <div className="space-y-3">
              {service.requiredDocuments.map((docReq, idx) => {
                const isUploaded = uploadedDocs.some((d) => d.type === docReq);
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      isUploaded
                        ? 'border-emerald-300 bg-emerald-50/40'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          isUploaded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isUploaded ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <UploadCloud className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{docReq}</p>
                        <p className="text-[11px] text-slate-500">
                          {isUploaded
                            ? 'OCR verified & masked UIDAI standard'
                            : 'PDF, JPG or Digilocker XML (< 5MB)'}
                        </p>
                      </div>
                    </div>

                    <div>
                      {isUploaded ? (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                          Attached ✓
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSimulateUpload(docReq)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          Attach / OCR
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <span>
                <strong>Privacy Guaranteed:</strong> Aadhaar numbers are automatically masked on-device
                to comply with UIDAI guidelines. No sensitive biological data or raw keys are stored.
              </span>
            </div>

            {/* Step 2 Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
              >
                <span>Proceed to Review</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW & STATUTORY CONSENT */}
        {step === 3 && (
          <div className="p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Review Request Summary</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Verify details before submitting for bank officer verification.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2.5">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Service:</span>
                <strong className="text-slate-900 font-semibold">{service.title.en}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Account:</span>
                <span className="text-slate-900 font-mono">{selectedAccount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Processing Branch:</span>
                <span className="text-slate-900">Navrangpura Commerce Branch, Ahmedabad</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Target Resolution SLA:</span>
                <span className="text-blue-700 font-semibold">{service.estimatedDays} Business Days</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Documents Attached:</span>
                <span className="text-emerald-700 font-medium">{uploadedDocs.length} Documents</span>
              </div>
            </div>

            {/* DPDP and Statutory Consent */}
            <div className="pt-2">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  I hereby declare that the particulars furnished above are true and correct. I authorize
                  SetuBank and its nodal branch officers to verify these credentials under the
                  <strong> Digital Personal Data Protection Act (DPDP 2023)</strong> and RBI Master
                  Directions on Customer Service.
                </span>
              </label>
            </div>

            {/* Step 3 Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-sm transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Submitting to Bank...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize & Submit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS & ACKNOWLEDGMENT RECEIPT */}
        {step === 4 && submittedRequest && (
          <div className="p-6 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Application Successfully Submitted!
              </h3>
              <p className="text-xs text-slate-500">
                Your request has been routed to the KYC & Operations Verification Desk.
              </p>
            </div>

            {/* Printable Digital Receipt Card */}
            <div
              id="printable-receipt"
              className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-3 font-sans"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Official Acknowledgment Slip
                  </p>
                  <p className="text-sm font-bold text-blue-900 font-mono">
                    {submittedRequest.referenceNumber}
                  </p>
                </div>
                <span className="text-[11px] font-semibold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                  Under Verification
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Service:</span>
                  <span className="font-semibold text-slate-800">{submittedRequest.serviceName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Account No:</span>
                  <span className="font-mono text-slate-800">{submittedRequest.accountNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Submission Date:</span>
                  <span className="text-slate-800">
                    {new Date(submittedRequest.submittedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Expected Resolution:</span>
                  <span className="text-emerald-700 font-semibold">
                    {new Date(submittedRequest.slaDeadline).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-200">
                * Zero branch visit required. SMS updates will be sent to +91 98250 14892.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save Slip</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
