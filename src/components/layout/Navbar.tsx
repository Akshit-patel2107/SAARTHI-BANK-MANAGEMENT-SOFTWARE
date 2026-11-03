import React from 'react';
import {
  Building2,
  Globe2,
  ShieldCheck,
  User,
  Briefcase,
  Bell,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  TreePine,
  Settings,
  LogOut,
  BadgeCheck,
} from 'lucide-react';
import { AuthUser, Language, UserRole } from '../../types/banking';
import { translations } from '../../utils/i18n';
import { SahayakLogo } from '../common/SahayakLogo';
import { SaarthiLogo } from '../common/SaarthiLogo';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  selectedBank: string;
  onBankChange: (bank: string) => void;
  onOpenAssistant: () => void;
  unreadCount?: number;
  currentUser?: AuthUser | null;
  onOpenSettings?: () => void;
  onLogout?: () => void;
}

const SUPPORTED_BANKS = [
  'Janata Sahakari Bank Ltd.',
  'Pratham Vikas Gramin Bank',
  'State Apex Co-operative Bank',
  'Bharatiya Urban Co-op Bank',
];

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  language,
  onLanguageChange,
  selectedBank,
  onBankChange,
  onOpenAssistant,
  unreadCount = 2,
  currentUser,
  onOpenSettings,
  onLogout,
}) => {
  const t = translations[language];
  const [showBankMenu, setShowBankMenu] = React.useState(false);
  const [showLangMenu, setShowLangMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Regulatory & Environmental Banner */}
      <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-x-auto whitespace-nowrap">
          <span className="flex items-center text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            {t.rbiCompliant}
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center text-slate-300">
            <TreePine className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            100% Paperless Digital Banking Initiative
          </span>
        </div>

        <div className="flex items-center space-x-4 text-slate-300 text-xs">
          <span className="hidden sm:inline">Toll Free: 1800-209-8800 (24x7)</span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center space-x-1.5 hover:text-white transition-colors bg-slate-800 px-2.5 py-0.5 rounded text-xs"
              aria-label="Language selection"
            >
              <Globe2 className="w-3 h-3 text-blue-400" />
              <span className="font-medium">
                {language === 'en' ? 'English' : language === 'hi' ? 'हिन्दी' : 'ગુજરાતી'}
              </span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-xl border border-slate-200 py-1 text-slate-800 z-50">
                <button
                  onClick={() => {
                    onLanguageChange('en');
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 ${
                    language === 'en' ? 'font-semibold text-blue-600' : ''
                  }`}
                >
                  <span>English</span>
                  {language === 'en' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </button>
                <button
                  onClick={() => {
                    onLanguageChange('hi');
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 ${
                    language === 'hi' ? 'font-semibold text-blue-600' : ''
                  }`}
                >
                  <span>हिन्दी (Hindi)</span>
                  {language === 'hi' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </button>
                <button
                  onClick={() => {
                    onLanguageChange('gu');
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 ${
                    language === 'gu' ? 'font-semibold text-blue-600' : ''
                  }`}
                >
                  <span>ગુજરાતી (Gujarati)</span>
                  {language === 'gu' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Bank Selector */}
        <div className="flex items-center space-x-3">
          <SahayakLogo size="sm" showSubtitle={false} />


          {/* Integrated Bank Dropdown */}
          <div className="relative hidden md:block border-l border-slate-200 pl-4 ml-1">
            <button
              onClick={() => setShowBankMenu(!showBankMenu)}
              className="flex items-center space-x-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-medium max-w-[170px] truncate">{selectedBank}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {showBankMenu && (
              <div className="absolute left-4 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 text-slate-800 z-50">
                <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Switch Partner Institution
                </div>
                {SUPPORTED_BANKS.map((bank) => (
                  <button
                    key={bank}
                    onClick={() => {
                      onBankChange(bank);
                      setShowBankMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      selectedBank === bank ? 'bg-blue-50 text-blue-700 font-medium' : ''
                    }`}
                  >
                    <span>{bank}</span>
                    {selectedBank === bank && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Controls: AI Assistant Button, Strict Portal Indicator, Notifications, User Profile & Settings */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* AI Sahayak Assistant Trigger */}
          <button
            onClick={onOpenAssistant}
            className="flex items-center space-x-1.5 text-xs bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-800 border border-blue-200/80 px-3 py-1.5 rounded-xl font-medium shadow-2xs transition-all cursor-pointer"
            title={currentRole === 'CUSTOMER' ? 'Ask Sahayak Banking Guide' : 'Open Employee Knowledge Base'}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span className="hidden sm:inline">
              {currentRole === 'CUSTOMER' ? 'Sahayak AI' : 'Sahayak Desk'}
            </span>
            <span className="sm:hidden">AI</span>
          </button>

          {/* Strict Role Isolation Badge (Non-interactive; Switching requires Logout) */}
          <div className="flex items-center">
            {currentRole === 'CUSTOMER' ? (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Customer Portal</span>
                <span className="sm:hidden">Customer</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white shadow-2xs">
                <Briefcase className="w-3.5 h-3.5 text-slate-300" />
                <span className="hidden sm:inline">Employee Desk</span>
                <span className="sm:hidden">Staff</span>
              </div>
            )}
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
                <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Banking Notifications</span>
                  <span className="text-[10px] text-blue-600 font-medium">All Read</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  <div className="p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-600 shrink-0"></div>
                      <div>
                        <p className="font-medium text-slate-800">
                          Nominee Update Application in Progress
                        </p>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Ref: REQ-2026-881204 has passed document verification by Branch KYC Desk.
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">10 mins ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                      <div>
                        <p className="font-medium text-slate-800">
                          Cheque Book Dispatched (Speed Post)
                        </p>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Tracking #ED938172918IN dispatched to your Fort, Mumbai communication address.
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">2 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Badge & Quick Settings / Logout */}
          {currentUser && (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div
                onClick={onOpenSettings}
                className="flex items-center space-x-2 py-1 px-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                title="Account & Language Settings"
              >
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-1 ring-slate-300">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left text-xs leading-tight">
                  <div className="font-semibold text-slate-800 flex items-center space-x-1">
                    <span className="truncate max-w-[110px]">{currentUser.name}</span>
                    <BadgeCheck className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {currentUser.role === 'CUSTOMER'
                      ? currentUser.maskedAccount || 'A/C Active'
                      : currentUser.employeeId || 'Staff'}
                  </div>
                </div>
              </div>

              {/* Settings Gear */}
              {onOpenSettings && (
                <button
                  onClick={onOpenSettings}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label="Settings"
                  title="Settings & Language"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}

              {/* Logout Button */}
              {onLogout && (
                <button
                  onClick={() => onLogout()}
                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Sign Out"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
