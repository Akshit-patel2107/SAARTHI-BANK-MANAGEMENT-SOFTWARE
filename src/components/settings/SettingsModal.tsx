import React, { useState } from 'react';
import {
  X,
  Globe2,
  ShieldCheck,
  CheckCircle2,
  Bell,
  Lock,
  User,
  Smartphone,
  Save,
} from 'lucide-react';
import { AuthUser, Language } from '../../types/banking';
import { translations } from '../../utils/i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onUpdateUserPreferences?: (updates: Partial<AuthUser>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  language,
  onLanguageChange,
  onUpdateUserPreferences,
}) => {
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'LANGUAGE' | 'SECURITY' | 'PROFILE'>('LANGUAGE');
  const [selectedLang, setSelectedLang] = useState<Language>(language);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [sessionTimeoutEnabled, setSessionTimeoutEnabled] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsAppAlerts, setWhatsAppAlerts] = useState(true);
  const [savedBanner, setSavedBanner] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onLanguageChange(selectedLang);
    try {
      localStorage.setItem('setubank_language', selectedLang);
    } catch (e) {}

    if (onUpdateUserPreferences && currentUser) {
      onUpdateUserPreferences({
        preferredLanguage: selectedLang,
      });
    }

    setSavedBanner(true);
    setTimeout(() => {
      setSavedBanner(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{t.settingsTitle}</h2>
              <p className="text-xs text-slate-500">Configure language, security, and notification preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 border-b border-slate-100 flex space-x-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('LANGUAGE')}
            className={`pb-2.5 flex items-center space-x-1.5 border-b-2 transition-colors ${
              activeTab === 'LANGUAGE'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>{t.languageSettings}</span>
          </button>
          <button
            onClick={() => setActiveTab('SECURITY')}
            className={`pb-2.5 flex items-center space-x-1.5 border-b-2 transition-colors ${
              activeTab === 'SECURITY'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t.security2FA}</span>
          </button>
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`pb-2.5 flex items-center space-x-1.5 border-b-2 transition-colors ${
              activeTab === 'PROFILE'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{t.profile}</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
          {savedBanner && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-xs text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Settings updated successfully! Applying preferences...</span>
            </div>
          )}

          {/* TAB 1: LANGUAGE SETTINGS */}
          {activeTab === 'LANGUAGE' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Select Platform Language
                </h3>
                <p className="text-xs text-slate-500">
                  Choose your preferred language for all banking services, notifications, forms, and Sahayak AI conversations.
                </p>
              </div>

              <div className="space-y-3">
                {/* English */}
                <div
                  onClick={() => setSelectedLang('en')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedLang === 'en'
                      ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-800 text-xs">
                      EN
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">English</div>
                      <div className="text-slate-500 text-xs">Primary banking terminology & official documentation</div>
                    </div>
                  </div>
                  {selectedLang === 'en' && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                  )}
                </div>

                {/* Hindi */}
                <div
                  onClick={() => setSelectedLang('hi')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedLang === 'hi'
                      ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-800 text-xs">
                      हि
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">हिन्दी (Hindi)</div>
                      <div className="text-slate-500 text-xs font-hindi">सरल डिजिटल बैंकिंग और फॉर्म निर्देश</div>
                    </div>
                  </div>
                  {selectedLang === 'hi' && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                  )}
                </div>

                {/* Gujarati */}
                <div
                  onClick={() => setSelectedLang('gu')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedLang === 'gu'
                      ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-800 text-xs">
                      ગુ
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">ગુજરાતી (Gujarati)</div>
                      <div className="text-slate-500 text-xs font-gujarati">સહકારી બેંકિંગ અને ડિજિટલ સેવાઓ માટે</div>
                    </div>
                  </div>
                  {selectedLang === 'gu' && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SECURITY & 2FA */}
          {activeTab === 'SECURITY' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Banking Security & Permissions
                </h3>
                <p className="text-xs text-slate-500">
                  Enforce RBI-mandated two-factor authentication and fraud alerts.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-xs text-slate-900">
                      Two-Factor Authentication (OTP / Authenticator)
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Mandatory verification for logins and high-value transactions.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-xs text-slate-900">
                      Auto Session Timeout (15 mins idle)
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Complies with RBI Master Directions on digital banking security.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={sessionTimeoutEnabled}
                    onChange={(e) => setSessionTimeoutEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-xs text-slate-900">
                      Instant SMS Delivery Alerts
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Receive alerts on your registered Indian mobile number.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-xs text-slate-900">
                      WhatsApp Digital Pass & Tracking
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Receive QR queue tokens and cheque dispatch status on WhatsApp.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={whatsAppAlerts}
                    onChange={(e) => setWhatsAppAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: USER PROFILE */}
          {activeTab === 'PROFILE' && currentUser && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Active User Profile & Authorization
                </h3>
                <p className="text-xs text-slate-500">
                  Identity and permission scope provisioned by the banking platform.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500">Full Name</span>
                  <span className="font-semibold text-slate-900">{currentUser.name}</span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500">Platform Role</span>
                  <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {currentUser.role === 'CUSTOMER' ? 'Bank Customer (Retail)' : 'Bank Employee (Operations)'}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500">Email Address</span>
                  <span className="font-mono text-slate-800">{currentUser.email}</span>
                </div>

                {currentUser.role === 'CUSTOMER' ? (
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <span className="text-slate-500">Masked Account</span>
                    <span className="font-mono text-slate-800">{currentUser.maskedAccount || '•••• 9104'}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <span className="text-slate-500">Employee ID</span>
                    <span className="font-mono text-slate-800">{currentUser.employeeId || 'JSB-EMP-8841'}</span>
                  </div>
                )}

                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500">Assigned Branch</span>
                  <span className="font-medium text-slate-800">{currentUser.branch || 'Navrangpura Commerce Branch'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">KYC Status</span>
                  <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[10px] border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Verified under DPDP Act 2023
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Selected: <strong className="text-slate-800">{selectedLang === 'en' ? 'English' : selectedLang === 'hi' ? 'हिन्दी' : 'ગુજરાતી'}</strong>
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1.5 rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t.save}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
