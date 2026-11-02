/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  Briefcase,
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  Globe2,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Eye,
  EyeOff,
  Shield,
  HelpCircle,
  Building2,
  Database,
  Info,
  PhoneCall,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AuthUser, Language, UserRole } from '../../types/banking';
import { translations } from '../../utils/i18n';
import {
  validateAccountNumber,
  maskAccountNumber,
  validateMobileNumber,
  validateEmployeeEmail,
} from '../../utils/banking';
import { SahayakLogo } from '../common/SahayakLogo';
import {
  authenticateWithGoogle,
  sendOtpToMobile,
  verifyPhoneOtp,
  loginWithEmail,
  loginEmployee,
  registerNewCustomer,
  isFirebaseConfigured,
  getMissingFirebaseEnvKeys,
} from '../../services/firebase';

interface LoginPortalProps {
  onLoginSuccess: (user: AuthUser) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  selectedBank: string;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({
  onLoginSuccess,
  language,
  onLanguageChange,
  selectedBank,
}) => {
  const t = translations[language];

  // Primary stages: 'ROLE_SELECT' | 'CUSTOMER_LOGIN' | 'CUSTOMER_REGISTER' | 'EMPLOYEE_LOGIN' | 'EMPLOYEE_MFA'
  const [stage, setStage] = useState<
    'ROLE_SELECT' | 'CUSTOMER_LOGIN' | 'CUSTOMER_REGISTER' | 'EMPLOYEE_LOGIN' | 'EMPLOYEE_MFA'
  >('ROLE_SELECT');

  // Customer Login tabs: 'MOBILE_OTP' | 'ACCOUNT_PWD'
  const [customerAuthTab, setCustomerAuthTab] = useState<'MOBILE_OTP' | 'ACCOUNT_PWD'>('MOBILE_OTP');

  // Customer Form states
  const [mobileNumber, setMobileNumber] = useState('');
  const [customerAccountNumber, setCustomerAccountNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [showCustomerPassword, setShowCustomerPassword] = useState(false);

  // Customer Registration states
  const [regName, setRegName] = useState('');
  const [regAccount, setRegAccount] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAadhaarConsent, setRegAadhaarConsent] = useState(true);

  // Employee Form states
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');
  const [showEmployeePassword, setShowEmployeePassword] = useState(false);
  const [mfaCode, setMfaCode] = useState('');

  // Modals & UI states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmployeeRecoveryModal, setShowEmployeeRecoveryModal] = useState(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);

  // OTP Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, resendTimer]);

  // Handler: Customer Send OTP
  const handleSendCustomerOtp = async () => {
    setErrorMessage(null);
    setSuccessNotice(null);

    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit registered mobile number.');
      return;
    }

    if (!validateMobileNumber(cleanMobile)) {
      setErrorMessage('Mobile number must begin with 6, 7, 8, or 9.');
      return;
    }

    setIsLoading(true);
    const res = await sendOtpToMobile(cleanMobile);
    setIsLoading(false);

    if (res.success) {
      setOtpSent(true);
      setResendTimer(45);
      setSuccessNotice(`OTP sent successfully to registered mobile +91 ••••• ${cleanMobile.slice(-4)}.`);
    } else {
      setErrorMessage('Failed to dispatch OTP. Please check connection or try again.');
    }
  };

  // Handler: Customer Verify OTP
  const handleVerifyCustomerOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (!otpValue || otpValue.trim().length !== 6) {
      setErrorMessage(t.invalidOtp || 'Please enter the 6-digit OTP code.');
      return;
    }

    setIsLoading(true);
    const identifier = customerAccountNumber || mobileNumber || '501004829104';
    const res = await verifyPhoneOtp(identifier, otpValue.trim(), {
      email: customerEmail || undefined,
    });
    setIsLoading(false);

    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setErrorMessage(res.error || t.invalidOtp || 'Invalid OTP. Please enter 123456 for testing.');
    }
  };

  // Handler: Customer Account & Password Login
  const handleCustomerAccountLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerEmail && !customerAccountNumber) {
      setErrorMessage('Please enter your Customer ID, Account Number, or Email.');
      return;
    }

    if (!customerPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    const emailToUse = customerEmail.includes('@')
      ? customerEmail
      : `cust_${customerAccountNumber || 'primary'}@janatabank.in`;
    const res = await loginWithEmail(emailToUse, customerPassword, 'CUSTOMER');
    setIsLoading(false);

    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  // Handler: Google Sign-in for Customer
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    const res = await authenticateWithGoogle('CUSTOMER');
    setIsLoading(false);

    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setErrorMessage(res.error || 'Google sign-in could not be completed.');
    }
  };

  // Handler: Customer Registration
  const handleCustomerRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim() || regName.length < 3) {
      setErrorMessage('Please enter your full legal name as per bank records.');
      return;
    }

    if (!validateAccountNumber(regAccount)) {
      setErrorMessage('Account number must be between 9 and 18 digits.');
      return;
    }

    if (!validateMobileNumber(regMobile)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!regEmail.includes('@') || !regEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (!regAadhaarConsent) {
      setErrorMessage('You must authorize the bank to verify your identity under RBI guidelines.');
      return;
    }

    setIsLoading(true);
    const res = await registerNewCustomer({
      name: regName.trim(),
      accountNumber: regAccount.trim(),
      mobileNumber: regMobile.trim(),
      email: regEmail.trim(),
      password: regPassword,
    });
    setIsLoading(false);

    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setErrorMessage(res.error || 'Registration failed. Please contact your branch.');
    }
  };

  // Handler: Employee Step 1 (Credentials & Domain Validation)
  const handleEmployeeStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!employeeEmail.trim()) {
      setErrorMessage('Official bank email is required.');
      return;
    }

    if (!validateEmployeeEmail(employeeEmail)) {
      setErrorMessage(
        'Access Denied: Employee login is restricted to authorized bank intranet domains (@janatabank.in, @saarthibanking.in, @bankops.gov.in).'
      );
      return;
    }

    if (!employeeId.trim()) {
      setErrorMessage('Official Bank Employee ID is required (e.g. JSB-EMP-8841).');
      return;
    }

    if (!employeePassword) {
      setErrorMessage('Password is required.');
      return;
    }

    setStage('EMPLOYEE_MFA');
  };

  // Handler: Employee MFA Verification
  const handleEmployeeMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!mfaCode || mfaCode.trim().length !== 6) {
      setErrorMessage('Please enter the complete 6-digit MFA Authenticator Token.');
      return;
    }

    setIsLoading(true);
    const res = await loginEmployee(employeeEmail, employeeId, employeePassword, mfaCode.trim());
    setIsLoading(false);

    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setErrorMessage(res.error || 'Employee verification failed. Please check MFA token.');
    }
  };

  const configured = isFirebaseConfigured();
  const missingKeys = getMissingFirebaseEnvKeys();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans text-slate-800">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <SahayakLogo size="md" showSubtitle={true} />
            <span className="hidden lg:inline-block bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200">
              {selectedBank}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* System Status / Firebase Badge */}
            <button
              onClick={() => setShowFirebaseModal(true)}
              className="flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
              title="Backend & Storage Status"
            >
              <Database className={`w-3.5 h-3.5 ${configured ? 'text-emerald-500' : 'text-blue-500'}`} />
              <span className="hidden sm:inline">
                {configured ? 'Firebase Live' : 'Local State Engine'}
              </span>
              <span className="sm:hidden">{configured ? 'Cloud' : 'Local'}</span>
            </button>

            {/* Language Selector */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
              <Globe2 className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-0.5" />
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  language === 'en'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                onClick={() => onLanguageChange('hi')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  language === 'hi'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => onLanguageChange('gu')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  language === 'gu'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ગુજરાતી
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Authentication Flow */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* STAGE 1: LANDING PAGE & ROLE SELECTION */}
        {stage === 'ROLE_SELECT' && (
          <div className="max-w-4xl w-full mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Welcoming Headline */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>RBI Master Direction & DPDP Act 2023 Compliant</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Welcome to <span className="text-blue-700">Sahayak AI</span>
              </h1>
              <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                India's next-generation digital banking platform. Select your portal to access personalized customer banking or internal branch operations.
              </p>
            </div>

            {/* Two Clearly Separated Login Paths */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Option 1: Bank Customer Login */}
              <div
                onClick={() => {
                  setStage('CUSTOMER_LOGIN');
                  setErrorMessage(null);
                  setSuccessNotice(null);
                }}
                className="group relative bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 group-hover:scale-105 transition-transform shadow-xs">
                      <User className="w-7 h-7" />
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Zero Branch Visits</span>
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight group-hover:text-blue-700 transition-colors">
                      Bank Customer Login
                    </h2>
                    <p className="text-slate-600 text-sm mt-1.5 font-medium">
                      “Get assistance with your banking services.”
                    </p>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                      Complete routine banking tasks, submit paperless service requests, and track your applications securely from home.
                    </p>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>Instant login via Registered Mobile + OTP or Google Sign-In</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>Digital requests: Nominee, Cheque Book, Address, Certificates</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>Sahayak AI guidance in English, हिन्दी, and ગુજરાતી</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-8 flex items-center justify-between text-blue-700 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                  <span>Sign in as Bank Customer</span>
                  <div className="w-9 h-9 rounded-full bg-blue-50 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-blue-600 transition-all shadow-xs">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Option 2: Bank Employee Login */}
              <div
                onClick={() => {
                  setStage('EMPLOYEE_LOGIN');
                  setErrorMessage(null);
                  setSuccessNotice(null);
                }}
                className="group relative bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:shadow-xl hover:border-slate-400 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white group-hover:scale-105 transition-transform shadow-xs">
                      <Briefcase className="w-7 h-7" />
                    </div>
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full border border-slate-200 flex items-center space-x-1">
                      <Shield className="w-3.5 h-3.5 text-slate-600" />
                      <span>Staff Restricted</span>
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight group-hover:text-slate-800 transition-colors">
                      Bank Employee Login
                    </h2>
                    <p className="text-slate-600 text-sm mt-1.5 font-medium">
                      “Access internal banking knowledge and employee assistance.”
                    </p>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                      Branch management dashboard, KYC approvals desk, kiosk fleet health, and RBI operational SOP knowledge base.
                    </p>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0" />
                      <span>Official Bank Email + Employee ID + MFA Token</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0" />
                      <span>Process & verify customer requests, approvals & complaints</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0" />
                      <span>Internal Sahayak AI for RBI circulars & branch SOP queries</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-8 flex items-center justify-between text-slate-900 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                  <span>Sign in as Bank Employee</span>
                  <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center text-slate-700 transition-all shadow-xs">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Trust and Compliance Highlights */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-around gap-4 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>256-Bit TLS End-to-End Encryption</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>RBI Master Direction Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-indigo-600" />
                <span>DPDP Act 2023 Masked Verification</span>
              </div>
              <div className="flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>Mandatory Employee MFA</span>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 2: DEDICATED BANK CUSTOMER LOGIN */}
        {stage === 'CUSTOMER_LOGIN' && (
          <div className="max-w-md w-full mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 animate-in fade-in duration-200">
            {/* Header with Back button */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setStage('ROLE_SELECT');
                  setErrorMessage(null);
                  setSuccessNotice(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-900 flex items-center space-x-1 transition-colors font-medium"
              >
                <span>← Back to Portal Selection</span>
              </button>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">
                Customer Banking
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Bank Customer Login
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                Get assistance with your banking services.
              </p>
            </div>

            {/* Error or Success Notice */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successNotice}</span>
              </div>
            )}

            {/* Customer Authentication Mode Tabs */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold">
              <button
                onClick={() => {
                  setCustomerAuthTab('MOBILE_OTP');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 rounded-lg text-center transition-all ${
                  customerAuthTab === 'MOBILE_OTP'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Registered Mobile + OTP
              </button>
              <button
                onClick={() => {
                  setCustomerAuthTab('ACCOUNT_PWD');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 rounded-lg text-center transition-all ${
                  customerAuthTab === 'ACCOUNT_PWD'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Customer ID / Account
              </button>
            </div>

            {/* METHOD 1: Mobile Number + OTP */}
            {customerAuthTab === 'MOBILE_OTP' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Registered Mobile Number *
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-300 text-slate-600 rounded-l-xl text-sm font-mono font-medium">
                      +91
                    </span>
                    <input
                      type="text"
                      maxLength={10}
                      value={mobileNumber}
                      onChange={(e) => {
                        setMobileNumber(e.target.value.replace(/\D/g, ''));
                        setOtpSent(false);
                      }}
                      placeholder="e.g. 98250 88292"
                      className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-r-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Enter the 10-digit mobile number linked to your bank account.
                  </p>
                </div>

                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendCustomerOtp}
                    disabled={isLoading || mobileNumber.length < 10}
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>{isLoading ? 'Verifying with Bank...' : 'Send Secure OTP'}</span>
                  </button>
                ) : (
                  <form onSubmit={handleVerifyCustomerOtp} className="space-y-4 pt-1">
                    <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between text-xs text-blue-900 font-medium">
                        <span>Enter 6-digit OTP code</span>
                        <span>
                          {resendTimer > 0 ? (
                            <span className="text-slate-500 font-mono">Resend in {resendTimer}s</span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSendCustomerOtp}
                              className="text-blue-700 hover:underline font-semibold"
                            >
                              Resend OTP
                            </button>
                          )}
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="w-full text-center tracking-widest text-2xl font-mono font-bold px-3 py-2 bg-white border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                      />
                      <p className="text-[11px] text-blue-800 text-center font-medium">
                        Testing code: <span className="font-mono bg-blue-100 px-1.5 py-0.5 rounded font-bold">123456</span>
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || otpValue.length < 6}
                      className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{isLoading ? 'Authorizing Session...' : 'Verify OTP & Enter Customer Portal'}</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* METHOD 2: Customer ID / Account Number + Password */}
            {customerAuthTab === 'ACCOUNT_PWD' && (
              <form onSubmit={handleCustomerAccountLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Customer ID / Account Number *
                  </label>
                  <input
                    type="text"
                    value={customerAccountNumber}
                    onChange={(e) => setCustomerAccountNumber(e.target.value)}
                    placeholder="e.g. 501004829104 or CUST-7721"
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showCustomerPassword ? 'text' : 'password'}
                      value={customerPassword}
                      onChange={(e) => setCustomerPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCustomerPassword(!showCustomerPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showCustomerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isLoading ? 'Signing in...' : 'Sign In to Customer Portal'}</span>
                </button>
              </form>
            )}

            {/* Google Sign-In Option */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400 font-semibold">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold py-2.5 rounded-xl shadow-2xs transition-colors flex items-center justify-center space-x-3 text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google (Bank Verified ID)</span>
            </button>

            {/* Registration Link */}
            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => {
                  setStage('CUSTOMER_REGISTER');
                  setErrorMessage(null);
                  setSuccessNotice(null);
                }}
                className="text-xs text-blue-700 hover:underline font-semibold"
              >
                Existing bank account holder without online access? Register here →
              </button>
            </div>

            {/* Security Caution */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 flex items-start space-x-2 text-[11px] text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Bank Security Notice:</strong> Bank officials or Sahayak AI will never ask for your ATM PIN, OTP, or CVV.
              </span>
            </div>
          </div>
        )}

        {/* STAGE 3: CUSTOMER DIGITAL REGISTRATION */}
        {stage === 'CUSTOMER_REGISTER' && (
          <div className="max-w-md w-full mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setStage('CUSTOMER_LOGIN');
                  setErrorMessage(null);
                  setSuccessNotice(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1"
              >
                <span>← Back to Customer Login</span>
              </button>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                New User Onboarding
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Register Online Access
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                Link your existing bank account for 100% paperless service access.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCustomerRegistration} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Legal Name (as per Bank Passbook) *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra Verma"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bank Account Number *
                </label>
                <input
                  type="text"
                  required
                  value={regAccount}
                  onChange={(e) => setRegAccount(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  placeholder="11-16 digit bank account number"
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Create Password *
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                />
              </div>

              <div className="flex items-start space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="aadhaarConsent"
                  checked={regAadhaarConsent}
                  onChange={(e) => setRegAadhaarConsent(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="aadhaarConsent" className="text-[11px] text-slate-600 leading-tight">
                  I authorize {selectedBank} to verify my details under RBI guidelines and DPDP Act 2023.
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 text-sm mt-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isLoading ? 'Registering with Bank...' : 'Complete Digital Registration'}</span>
              </button>
            </form>
          </div>
        )}

        {/* STAGE 4: DEDICATED BANK EMPLOYEE LOGIN (STEP 1: CREDENTIALS) */}
        {stage === 'EMPLOYEE_LOGIN' && (
          <div className="max-w-md w-full mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-300 shadow-xl space-y-6 animate-in fade-in duration-200">
            {/* Header with Back button */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setStage('ROLE_SELECT');
                  setErrorMessage(null);
                  setSuccessNotice(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-900 flex items-center space-x-1 font-medium"
              >
                <span>← Back to Portal Selection</span>
              </button>
              <span className="text-[10px] bg-slate-900 text-white font-semibold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                <Shield className="w-3 h-3 text-slate-300" />
                <span>Staff Intranet Only</span>
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Bank Employee Login
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                Access internal banking knowledge and employee assistance.
              </p>
            </div>

            {/* Security and Admin Approval Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 space-y-1">
              <div className="flex items-center space-x-1.5 font-semibold text-slate-900">
                <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Restricted Access Notice</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Public employee registration is disabled. Employee accounts must be created or approved by authorized bank administrators.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleEmployeeStep1} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Bank Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={employeeEmail}
                    onChange={(e) => setEmployeeEmail(e.target.value)}
                    placeholder="officer@janatabank.in"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  Allowed domains: @janatabank.in, @saarthibanking.in, @bankops.gov.in
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Bank Employee ID *
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                    placeholder="e.g. JSB-EMP-8841"
                    className="w-full pl-9 pr-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 uppercase font-semibold"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowEmployeeRecoveryModal(true)}
                    className="text-[11px] text-blue-700 hover:underline font-semibold"
                  >
                    Forgot Password / Recovery?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showEmployeePassword ? 'text' : 'password'}
                    required
                    value={employeePassword}
                    onChange={(e) => setEmployeePassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmployeePassword(!showEmployeePassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showEmployeePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 text-sm"
              >
                <span>Proceed to MFA Authentication Token →</span>
              </button>
            </form>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowEmployeeRecoveryModal(true)}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                Need account recovery or new branch employee provisioning?
              </button>
            </div>
          </div>
        )}

        {/* STAGE 5: DEDICATED BANK EMPLOYEE MFA VERIFICATION */}
        {stage === 'EMPLOYEE_MFA' && (
          <div className="max-w-md w-full mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-300 shadow-xl space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setStage('EMPLOYEE_LOGIN');
                  setErrorMessage(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1"
              >
                <span>← Back to Credentials</span>
              </button>
              <span className="text-[10px] bg-amber-50 text-amber-700 font-semibold px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>2-Factor MFA Mandatory</span>
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                MFA Authenticator Token
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Enter the time-based one-time token from your bank hardware key or authorized authenticator app.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleEmployeeMfa} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  6-Digit Authenticator Token *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 884102"
                  className="w-full text-center tracking-widest text-2xl font-mono font-bold px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                />
                <p className="text-[11px] text-slate-500 mt-2 text-center font-medium">
                  Enter any 6 digits (e.g., <strong className="font-mono text-slate-800">884102</strong>) for staff demo verification.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || mfaCode.length < 6}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{isLoading ? 'Authorizing Employee Desk...' : 'Verify MFA & Open Employee Desk'}</span>
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Bottom Compliance & Security Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">Sahayak AI</span>
            <span>• Banking, Made Simpler.</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>RBI & DPDP Act 2023 Compliant</span>
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="hidden sm:inline">Partner Bank: {selectedBank}</span>
          </div>
        </div>
      </footer>

      {/* Employee Forgot Password / Account Recovery Modal */}
      {showEmployeeRecoveryModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Employee Account Recovery</h3>
              </div>
              <button
                onClick={() => setShowEmployeeRecoveryModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                In compliance with <strong>RBI Cyber Security Framework for Banks</strong>, employee accounts cannot be self-reset using public reset links.
              </p>
              
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                  <span>Internal Bank IT Helpdesk</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Toll-Free Staff Hotline: <strong className="text-slate-900 font-mono">1800-209-8801</strong> (Ext. 4)
                  <br />
                  Intranet Ticket Desk: <strong className="text-slate-900 font-mono">helpdesk@janatabank.in</strong>
                </p>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1 text-blue-900">
                <div className="font-semibold flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-700" />
                  <span>Branch Manager Approval Protocol</span>
                </div>
                <p className="text-[11px] text-blue-800">
                  MFA hardware token resets and password re-issues require authorization from your Branch Manager or Operations Head.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowEmployeeRecoveryModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Firebase Backend Diagnostic Modal */}
      {showFirebaseModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Storage & Architecture Diagnostic</h3>
              </div>
              <button
                onClick={() => setShowFirebaseModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                Sahayak AI utilizes a modular database and authentication engine with both Cloud Firebase and secure Local Session state storage.
              </p>
              {configured ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-medium">
                  ✓ Firebase Firestore & Auth are active and bound to cloud project.
                </div>
              ) : (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 space-y-1.5">
                  <div className="font-semibold flex items-center space-x-1.5">
                    <span>⚡ Local State Engine Active</span>
                  </div>
                  <p>
                    All customer authentication, masked account numbers, OTP simulations, and bank officer request management are fully interactive.
                  </p>
                  <p className="text-[11px] text-blue-800">
                    To link external Firestore credentials, configure these variables in <code className="bg-blue-100 px-1 py-0.5 rounded">.env</code>:
                  </p>
                  <ul className="list-disc pl-4 text-[11px] font-mono text-blue-950">
                    {missingKeys.map((k) => (
                      <li key={k}>{k}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowFirebaseModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
