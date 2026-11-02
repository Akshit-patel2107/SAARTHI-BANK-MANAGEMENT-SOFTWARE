import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  UploadCloud,
  CheckCircle2,
  Clock,
  Eye,
  Lock,
  Download,
  AlertCircle,
  FileCheck,
  Calendar,
} from 'lucide-react';
import { DocumentItem, Language } from '../../types/banking';
import { translations } from '../../utils/i18n';

interface DocumentVaultViewProps {
  documents: DocumentItem[];
  language: Language;
  onUploadDoc: (doc: DocumentItem) => void;
}

export const DocumentVaultView: React.FC<DocumentVaultViewProps> = ({
  documents,
  language,
  onUploadDoc,
}) => {
  const t = translations[language];
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<string>('ADDRESS_PROOF');

  const handleSimulateNewUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    setTimeout(() => {
      const newDoc: DocumentItem = {
        id: `DOC-${Date.now()}`,
        name:
          uploadType === 'ADDRESS_PROOF'
            ? 'Water Utility Bill (Municipal Corp).pdf'
            : uploadType === 'SALARY_SLIP'
            ? 'Salary Slip - Oct 2026.pdf'
            : 'Income Tax Return (ITR-V) Ack.pdf',
        docType: uploadType as any,
        maskedIdentifier: 'Document #DOC-9921',
        fileSize: '640 KB',
        uploadedAt: new Date().toISOString().split('T')[0],
        expiryDate: 'Valid for 1 Year',
        verificationStatus: 'VERIFIED',
        extractedData: {
          ocrConfidence: '99.4%',
          dpdpCompliance: 'Tamper Evident Stored',
          extractedAt: new Date().toLocaleDateString('en-IN'),
        },
      };

      onUploadDoc(newDoc);
      setIsUploading(false);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {t.documents}
            </h1>
            <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              AES-256 Encrypted
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Secure, verified digital repository for your KYC, income, and statutory banking documents.
            Masked per RBI and UIDAI privacy mandates.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-800">DigiLocker Integration</p>
            <p className="text-[11px] text-emerald-600 font-medium">Sync Active (Govt of India)</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
            DL
          </div>
        </div>
      </div>

      {/* Main Grid: Document Cards + Quick Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Document Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {doc.docType.replace('_', ' ')}
                    </span>
                    <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {doc.verificationStatus}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {doc.name}
                    </h3>
                    <p className="text-xs font-mono text-slate-600 mt-1">
                      {doc.maskedIdentifier}
                    </p>
                  </div>

                  {/* Extracted Details pill */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
                    {Object.entries(doc.extractedData).slice(0, 2).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="font-medium text-slate-800 truncate max-w-[140px]">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">{doc.fileSize}</span>
                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View OCR Data</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Upload New Document Widget (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Upload to Vault</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Securely store documents for one-click attachment in banking services.
            </p>
          </div>

          <form onSubmit={handleSimulateNewUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Document Classification
              </label>
              <select
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              >
                <option value="ADDRESS_PROOF">Address Proof (Utility Bill / Passport)</option>
                <option value="SALARY_SLIP">Salary Slip (Last 3 Months)</option>
                <option value="FORM_15G">Form 15G / 15H (TDS Exemption)</option>
                <option value="CHEQUE_LEAF">Cancelled Cheque Leaf</option>
              </select>
            </div>

            <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-5 text-center transition-all bg-slate-50/50 cursor-pointer">
              <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-700 mt-2">
                Click or drop document here
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                PDF, JPG or PNG up to 5 MB (Malware scanned)
              </p>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs disabled:opacity-50"
            >
              {isUploading ? 'Extracting & Masking OCR...' : 'Upload & Encrypt'}
            </button>
          </form>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-start space-x-2">
            <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
            <span>
              Your documents are kept only as long as required for banking compliance and are never
              shared without your explicit consent.
            </span>
          </div>
        </div>
      </div>

      {/* OCR Inspector Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{selectedDoc.name}</h3>
                <p className="text-[11px] text-slate-500 font-mono">{selectedDoc.maskedIdentifier}</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Verified
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                OCR Extracted Metadata (UIDAI Masked):
              </p>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5 text-xs">
                {Object.entries(selectedDoc.extractedData).map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1 border-b border-slate-200/60 last:border-0">
                    <span className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className="font-medium text-slate-900">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedDoc(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
