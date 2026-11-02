/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language } from '../types/banking';

export interface Translations {
  appName: string;
  tagline: string;
  customerPortal: string;
  bankOfficerPortal: string;
  switchRole: string;
  home: string;
  services: string;
  myRequests: string;
  documents: string;
  appointments: string;
  complaints: string;
  support: string;
  profile: string;
  settings: string;
  logout: string;
  balance: string;
  hideBalance: string;
  showBalance: string;
  welcomeBack: string;
  savingsAccount: string;
  currentAccount: string;
  quickServices: string;
  pendingRequests: string;
  liveToken: string;
  activeToken: string;
  waitingInQueue: string;
  nowServing: string;
  counter: string;
  approxWaitTime: string;
  minutes: string;
  bookTokenOrAppointment: string;
  startService: string;
  trackStatus: string;
  digitalReceipt: string;
  verifiedKYC: string;
  reKycDue: string;
  allBranches: string;
  selectBranch: string;
  viewAll: string;
  searchPlaceholder: string;
  submitRequest: string;
  cancel: string;
  applyNow: string;
  uploadDocuments: string;
  confirmAndSubmit: string;
  referenceNumber: string;
  status: string;
  submittedOn: string;
  slaDeadline: string;
  seniorCitizenPriority: string;
  rbiCompliant: string;
  paperlessBadge: string;

  // Login & Role Selection
  loginTitle: string;
  loginSubtitle: string;
  selectYourRole: string;
  customerRoleTitle: string;
  customerRoleDesc: string;
  employeeRoleTitle: string;
  employeeRoleDesc: string;
  loginWithEmail: string;
  loginWithAccount: string;
  loginWithGoogle: string;
  accountNumberLabel: string;
  accountNumberPlaceholder: string;
  registeredMobileLabel: string;
  sendOtp: string;
  enterOtp: string;
  otpSentMessage: string;
  resendOtp: string;
  verifyAndLogin: string;
  emailLabel: string;
  passwordLabel: string;
  employeeIdLabel: string;
  employeeEmailLabel: string;
  mfaTitle: string;
  mfaSubtitle: string;
  mfaCodeLabel: string;
  mfaHelper: string;
  verifyMfa: string;
  registerTitle: string;
  createNewAccount: string;
  alreadyHaveAccount: string;
  dontHaveAccount: string;
  employeeRestrictedNotice: string;
  invalidCredentials: string;
  invalidOtp: string;
  termsAgreement: string;

  // Employee Dashboard sections
  overview: string;
  customerRequests: string;
  approvals: string;
  kioskManagement: string;
  customerComplaints: string;
  serviceHistory: string;
  reports: string;
  pending: string;
  inProgress: string;
  completed: string;
  needsAttention: string;

  // Settings
  languagePreference: string;
  securitySettings: string;
  twoFactorAuth: string;
  sessionTimeout: string;
  saveSettings: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'Saarthi',
    tagline: 'Banking, Made Simpler.',
    customerPortal: 'Customer Banking',
    bankOfficerPortal: 'Bank Officer Desk',
    switchRole: 'Switch Workspace',
    home: 'Home',
    services: 'Banking Services',
    myRequests: 'My Requests',
    documents: 'Document Vault',
    appointments: 'Virtual Queue',
    complaints: 'Grievance Center',
    support: 'Saarthi AI Banking Guide',
    profile: 'Profile & KYC',
    settings: 'Settings & Security',
    logout: 'Log Out',
    balance: 'Total Available Balance',
    hideBalance: 'Hide Balance',
    showBalance: 'Show Balance',
    welcomeBack: 'Welcome back',
    savingsAccount: 'Savings Account',
    currentAccount: 'Current Account',
    quickServices: 'Instant Paperless Services',
    pendingRequests: 'Active Requests',
    liveToken: 'Your Live Queue Token',
    activeToken: 'Active Token',
    waitingInQueue: 'People Ahead of You',
    nowServing: 'Now Serving',
    counter: 'Counter',
    approxWaitTime: 'Estimated Wait',
    minutes: 'mins',
    bookTokenOrAppointment: 'Get Virtual Token / Appointment',
    startService: 'Submit Online',
    trackStatus: 'Track Application',
    digitalReceipt: 'Download Receipt',
    verifiedKYC: 'KYC Verified (Full)',
    reKycDue: 'Re-KYC Due in 90 Days',
    allBranches: 'All Branches',
    selectBranch: 'Select Branch',
    viewAll: 'View All',
    searchPlaceholder: 'Search services, reference numbers or complaints...',
    submitRequest: 'Submit Paperless Request',
    cancel: 'Cancel',
    applyNow: 'Apply Now',
    uploadDocuments: 'Upload & Verify Documents',
    confirmAndSubmit: 'Confirm & Authorize',
    referenceNumber: 'Reference Number',
    status: 'Status',
    submittedOn: 'Submitted On',
    slaDeadline: 'Target Resolution (SLA)',
    seniorCitizenPriority: 'Senior Citizen & Accessible Priority',
    rbiCompliant: 'RBI & DPDP Act 2023 Compliant',
    paperlessBadge: 'Zero Branch Visit Required',

    // Login & Role Selection
    loginTitle: 'Secure Digital Banking Access',
    loginSubtitle: 'Choose your access path to continue to Saarthi automated banking platform.',
    selectYourRole: 'Select Your Access Role',
    customerRoleTitle: 'Bank Customer',
    customerRoleDesc: 'Access accounts, submit routine service requests, track approvals, and manage self-service digital documents.',
    employeeRoleTitle: 'Bank Employee',
    employeeRoleDesc: 'Authorized staff portal for KYC inspections, branch queue counter calls, approvals, and kiosk monitoring.',
    loginWithEmail: 'Email & Password',
    loginWithAccount: 'Account Number & OTP',
    loginWithGoogle: 'Continue with Google',
    accountNumberLabel: 'Bank Account Number',
    accountNumberPlaceholder: 'Enter 11-16 digit account number',
    registeredMobileLabel: 'Registered Mobile Number',
    sendOtp: 'Send OTP to Mobile',
    enterOtp: 'Enter 6-Digit OTP',
    otpSentMessage: 'One-Time Password sent to your bank-registered mobile number',
    resendOtp: 'Resend Code',
    verifyAndLogin: 'Verify & Sign In',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    employeeIdLabel: 'Bank Employee ID',
    employeeEmailLabel: 'Official Bank Email (@bank domain)',
    mfaTitle: '2-Step Security Verification (MFA)',
    mfaSubtitle: 'Enter the 6-digit code from your authorized bank authenticator.',
    mfaCodeLabel: '6-Digit Authenticator Token',
    mfaHelper: 'Valid 6-digit MFA authentication code',
    verifyMfa: 'Verify MFA & Open Workspace',
    registerTitle: 'Open Digital Banking Access',
    createNewAccount: 'Register for Internet Banking',
    alreadyHaveAccount: 'Already have digital access? Sign In',
    dontHaveAccount: 'First time user? Register your account',
    employeeRestrictedNotice: 'Staff portal is strictly restricted to authorized bank employees. Public registration is disabled.',
    invalidCredentials: 'Invalid credentials. Please verify your details.',
    invalidOtp: 'Invalid verification OTP. Please try again.',
    termsAgreement: 'By proceeding, you agree to digital banking terms under DPDP Act 2023 and RBI guidelines.',

    // Employee Dashboard
    overview: 'Overview',
    customerRequests: 'Customer Requests',
    approvals: 'Approvals',
    kioskManagement: 'Kiosk Management',
    customerComplaints: 'Customer Complaints',
    serviceHistory: 'Service History',
    reports: 'Reports',
    pending: 'Pending',
    inProgress: 'In Progress',
    completed: 'Completed',
    needsAttention: 'Needs Attention',

    // Settings
    languagePreference: 'Interface & Notification Language',
    securitySettings: 'Security & Access Preferences',
    twoFactorAuth: 'Require OTP for High-Risk Paperless Requests',
    sessionTimeout: 'Automatic Inactivity Logout (15 mins)',
    saveSettings: 'Save & Apply Preferences',
  },
  hi: {
    appName: 'सारथी',
    tagline: 'बैंकिंग, अब और भी सरल।',
    customerPortal: 'ग्राहक बैंकिंग',
    bankOfficerPortal: 'बैंक अधिकारी डेस्क',
    switchRole: 'कार्यक्षेत्र बदलें',
    home: 'होम',
    services: 'बैंकिंग सेवाएँ',
    myRequests: 'मेरे आवेदन',
    documents: 'दस्तावेज़ वॉल्ट',
    appointments: 'डिजिटल टोकन व कतार',
    complaints: 'शिकायत निवारण केंद्र',
    support: 'सारथी AI बैंकिंग मित्र',
    profile: 'प्रोफ़ाइल व केवाईसी',
    settings: 'सेटिंग्स व सुरक्षा',
    logout: 'लॉग आउट',
    balance: 'कुल उपलब्ध शेष राशि',
    hideBalance: 'राशि छुपाएं',
    showBalance: 'राशि देखें',
    welcomeBack: 'स्वागत है',
    savingsAccount: 'बचत खाता',
    currentAccount: 'चालू खाता',
    quickServices: 'त्वरित पेपरलेस सेवाएँ',
    pendingRequests: 'प्रक्रियाधीन आवेदन',
    liveToken: 'आपका लाइव कतार टोकन',
    activeToken: 'सक्रिय टोकन',
    waitingInQueue: 'आपसे पहले ग्राहक',
    nowServing: 'वर्तमान सेवा टोकन',
    counter: 'काउंटर',
    approxWaitTime: 'अनुमानित समय',
    minutes: 'मिनट',
    bookTokenOrAppointment: 'वर्चुअल टोकन / अपॉइंटमेंट लें',
    startService: 'ऑनलाइन आवेदन करें',
    trackStatus: 'स्थिति जांचें',
    digitalReceipt: 'रसीद डाउनलोड करें',
    verifiedKYC: 'केवाईसी सत्यापित (पूर्ण)',
    reKycDue: '90 दिनों में पुन: केवाईसी',
    allBranches: 'सभी शाखाएँ',
    selectBranch: 'शाखा चुनें',
    viewAll: 'सभी देखें',
    searchPlaceholder: 'सेवाएँ, संदर्भ संख्या या शिकायत खोजें...',
    submitRequest: 'पेपरलेस आवेदन जमा करें',
    cancel: 'रद्द करें',
    applyNow: 'आवेदन करें',
    uploadDocuments: 'दस्तावेज़ अपलोड व सत्यापन',
    confirmAndSubmit: 'पुष्टि करें और जमा करें',
    referenceNumber: 'संदर्भ संख्या (Ref No)',
    status: 'स्थिति',
    submittedOn: 'जमा करने की तिथि',
    slaDeadline: 'समाधान समयसीमा (SLA)',
    seniorCitizenPriority: 'वरिष्ठ नागरिक प्राथमिकता सेवा',
    rbiCompliant: 'भारतीय रिज़र्व बैंक (RBI) व डेटा सुरक्षा नियमानुरूप',
    paperlessBadge: 'शाखा जाने की आवश्यकता नहीं',

    // Login & Role Selection
    loginTitle: 'सुरक्षित डिजिटल बैंकिंग प्रवेश',
    loginSubtitle: 'सारथी ऑटोमेटेड बैंकिंग में आगे बढ़ने के लिए अपनी भूमिका चुनें।',
    selectYourRole: 'अपनी उपयोगकर्ता भूमिका चुनें',
    customerRoleTitle: 'बैंक ग्राहक (व्यक्तिगत)',
    customerRoleDesc: 'खाते देखें, पेपरलेस सेवा आवेदन जमा करें, स्थिति ट्रैक करें और कतार टोकन प्राप्त करें।',
    employeeRoleTitle: 'बैंक अधिकारी / कर्मचारी',
    employeeRoleDesc: 'केवाईसी सत्यापन, काउंटर टोकन कॉल, आवेदन अनुमोदन और कियोस्क निगरानी हेतु अधिकृत पोर्टल।',
    loginWithEmail: 'ईमेल व पासवर्ड',
    loginWithAccount: 'खाता संख्या व ओटीपी',
    loginWithGoogle: 'गूगल के साथ प्रवेश करें',
    accountNumberLabel: 'बैंक खाता संख्या',
    accountNumberPlaceholder: '11-16 अंकों की खाता संख्या दर्ज करें',
    registeredMobileLabel: 'पंजीकृत मोबाइल नंबर',
    sendOtp: 'ओटीपी (OTP) भेजें',
    enterOtp: '6-अंकीय ओटीपी दर्ज करें',
    otpSentMessage: 'बैंक में पंजीकृत मोबाइल नंबर पर ओटीपी भेजा गया है',
    resendOtp: 'पुन: भेजें',
    verifyAndLogin: 'सत्यापित करें और प्रवेश करें',
    emailLabel: 'ईमेल पता',
    passwordLabel: 'पासवर्ड',
    employeeIdLabel: 'कर्मचारी पहचान संख्या (Employee ID)',
    employeeEmailLabel: 'आधिकारिक बैंक ईमेल (@bank डोमेन)',
    mfaTitle: 'द्वि-चरणीय सुरक्षा सत्यापन (2FA/MFA)',
    mfaSubtitle: 'अपने पंजीकृत सुरक्षा टोकन या फोन पर प्राप्त 6-अंकीय कोड दर्ज करें।',
    mfaCodeLabel: '6-अंकीय सुरक्षा कोड',
    mfaHelper: '6-अंकीय सुरक्षा कोड दर्ज करें',
    verifyMfa: 'सत्यापित करें और डेस्क खोलें',
    registerTitle: 'डिजिटल बैंकिंग खाता खोलें',
    createNewAccount: 'नया ग्राहक पंजीकरण करें',
    alreadyHaveAccount: 'पहले से खाता है? प्रवेश करें',
    dontHaveAccount: 'पहली बार आए हैं? डिजिटल बैंकिंग हेतु पंजीकरण करें',
    employeeRestrictedNotice: 'कर्मचारी पोर्टल केवल अधिकृत बैंक कर्मियों के लिए है। सार्वजनिक पंजीकरण बैंक नियमों के तहत वर्जित है।',
    invalidCredentials: 'अमान्य विवरण। कृपया जांच कर पुन: प्रयास करें।',
    invalidOtp: 'अमान्य ओटीपी कोड। कृपया सही कोड दर्ज करें।',
    termsAgreement: 'प्रवेश करके आप डेटा सुरक्षा अधिनियम 2023 के तहत सत्र लॉगिंग की सहमति देते हैं।',

    // Employee Dashboard
    overview: 'अवलोकन (Overview)',
    customerRequests: 'ग्राहक आवेदन',
    approvals: 'अनुमोदन (Approvals)',
    kioskManagement: 'कियोस्क प्रबंधन',
    customerComplaints: 'ग्राहक शिकायतें',
    serviceHistory: 'सेवा इतिहास',
    reports: 'रिपोर्ट व आंकड़े',
    pending: 'लंबित',
    inProgress: 'प्रक्रियाधीन',
    completed: 'पूर्ण',
    needsAttention: 'ध्यान देने योग्य',

    // Settings
    languagePreference: 'इंटरफ़ेस और सूचना भाषा',
    securitySettings: 'सुरक्षा व खाता प्राथमिकताएं',
    twoFactorAuth: 'संवेदनशील अनुरोधों हेतु ओटीपी अनिवार्य करें',
    sessionTimeout: 'स्वतः निष्क्रियता लॉगआउट (15 मिनट)',
    saveSettings: 'प्राथमिकताएं सहेजें',
  },
  gu: {
    appName: 'સારથી',
    tagline: 'બેંકિંગ, હવે વધુ સરળ.',
    customerPortal: 'ગ્રાહક બેંકિંગ',
    bankOfficerPortal: 'બેંક અધિકારી ડેસ્ક',
    switchRole: 'વર્કસ્પેસ બદલો',
    home: 'હોમ',
    services: 'બેંકિંગ સેવાઓ',
    myRequests: 'મારી અરજીઓ',
    documents: 'દસ્તાવેજ વોલ્ટ',
    appointments: 'ડિજિટલ ટોકન અને લાઈન',
    complaints: 'ફરિયાદ નિવારણ કેન્દ્ર',
    support: 'સારથી AI બેંકિંગ મિત્ર',
    profile: 'પ્રોફાઇલ અને કેવાયસી',
    settings: 'સેટિંગ્સ અને સુરક્ષા',
    logout: 'લૉગ આઉટ',
    balance: 'કુલ ઉપલબ્ધ બેલેન્સ',
    hideBalance: 'બેલેન્સ છુપાવો',
    showBalance: 'બેલેન્સ જુઓ',
    welcomeBack: 'સ્વાગત છે',
    savingsAccount: 'બચત ખાતું',
    currentAccount: 'ચાલુ ખાતું',
    quickServices: 'ત્વરિત પેપરલેસ સેવાઓ',
    pendingRequests: 'ચાલુ અરજીઓ',
    liveToken: 'તમારું લાઈવ કતાર ટોકન',
    activeToken: 'સક્રિય ટોકન',
    waitingInQueue: 'તમારી આગળ ગ્રાહકો',
    nowServing: 'ચાલુ સેવા ટોકન',
    counter: 'કાઉન્ટર',
    approxWaitTime: 'અંદાજિત સમય',
    minutes: 'મિનિટ',
    bookTokenOrAppointment: 'વર્ચ્યુઅલ ટોકન / એપોઇન્ટમેન્ટ મેળવો',
    startService: 'ઓનલાઈન અરજી કરો',
    trackStatus: 'સ્થિતિ તપાસો',
    digitalReceipt: 'રસીદ ડાઉનલોડ કરો',
    verifiedKYC: 'કેવાયસી ચકાસાયેલ (સંપૂર્ણ)',
    reKycDue: '૯૦ દિવસમાં પુનઃ કેવાયસી',
    allBranches: 'તમામ શાખાઓ',
    selectBranch: 'શાખા પસંદ કરો',
    viewAll: 'બધું જુઓ',
    searchPlaceholder: 'સેવાઓ, સંદર્ભ નંબર અથવા ફરિયાદ શોધો...',
    submitRequest: 'પેપરલેસ અરજી સબમિટ કરો',
    cancel: 'રદ કરો',
    applyNow: 'અરજી કરો',
    uploadDocuments: 'દસ્તાવેજો અપલોડ અને ચકાસણી',
    confirmAndSubmit: 'ખાતરી કરો અને સબમિટ કરો',
    referenceNumber: 'સંદર્ભ નંબર (Ref No)',
    status: 'સ્થિતિ',
    submittedOn: 'સબમિટ તારીખ',
    slaDeadline: 'નિરાકરણ સમયમર્યાદા (SLA)',
    seniorCitizenPriority: 'વરિષ્ઠ નાગરિક અગ્રતા સેવા',
    rbiCompliant: 'RBI અને ડેટા સુરક્ષા કાયદા મુજબ',
    paperlessBadge: 'શાખાની મુલાકાત જરૂરી નથી',

    // Login & Role Selection
    loginTitle: 'સુરક્ષિત ડિજિટલ બેંકિંગ લોગિન',
    loginSubtitle: 'સારથી ઓટોમેટેડ બેંકિંગ સેવાઓ માટે તમારી ભૂમિકા પસંદ કરો.',
    selectYourRole: 'તમારી ભૂમિકા પસંદ કરો',
    customerRoleTitle: 'બેંક ગ્રાહક (વ્યક્તિગત)',
    customerRoleDesc: 'ખાતા બેલેન્સ જુઓ, પેપરલેસ સેવા અરજીઓ કરો, ડિજિટલ ટોકન મેળવો અને દસ્તાવેજો સાચવો.',
    employeeRoleTitle: 'બેંક અધિકારી / કર્મચારી',
    employeeRoleDesc: 'KYC ચકાસણી, કાઉન્ટર ટોકન કોલ, અરજી મંજૂરી અને કિયોસ્ક મોનિટરિંગ માટે અધિકૃત પોર્ટલ.',
    loginWithEmail: 'ઇમેઇલ અને પાસવર્ડ',
    loginWithAccount: 'ખાતા નંબર અને OTP',
    loginWithGoogle: 'ગૂગલ દ્વારા સાઇન ઇન',
    accountNumberLabel: 'બેંક ખાતા નંબર',
    accountNumberPlaceholder: '૧૧-૧૬ અંકનો ખાતા નંબર દાખલ કરો',
    registeredMobileLabel: 'નોંધાયેલ મોબાઈલ નંબર',
    sendOtp: 'મોબાઈલ પર OTP મોકલો',
    enterOtp: '૬-અંકનો OTP દાખલ કરો',
    otpSentMessage: 'બેંકમાં નોંધાયેલા મોબાઈલ નંબર પર OTP મોકલવામાં આવ્યો છે',
    resendOtp: 'ફરી મોકલો',
    verifyAndLogin: 'ચકાસો અને લૉગિન કરો',
    emailLabel: 'ઇમેઇલ સરનામું',
    passwordLabel: 'પાસવર્ડ',
    employeeIdLabel: 'કર્મચારી આઈડી (Employee ID)',
    employeeEmailLabel: 'અધિકૃત બેંક ઇમેઇલ (@bank ડોમેન)',
    mfaTitle: 'દ્વિ-સ્તરીય સુરક્ષા ચકાસણી (MFA)',
    mfaSubtitle: 'તમારા નોંધાયેલા સુરક્ષા ટોકન અથવા ફોન પર મોકલેલ ૬-અંકનો કોડ દાખલ કરો.',
    mfaCodeLabel: '૬-અંકનો સુરક્ષા કોડ',
    mfaHelper: '૬-અંકનો સુરક્ષા કોડ દાખલ કરો',
    verifyMfa: 'ચકાસો અને ડેસ્ક ખોલો',
    registerTitle: 'ડિજિટલ બેંકિંગ ખાતું ખોલો',
    createNewAccount: 'નવું ગ્રાહક નોંધણી',
    alreadyHaveAccount: 'ખાતું પહેલેથી છે? લૉગિન કરો',
    dontHaveAccount: 'નવા વપરાશકર્તા? ડિજિટલ બેંકિંગ નોંધણી કરો',
    employeeRestrictedNotice: 'કર્મચારી પોર્ટલ માત્ર અધિકૃત બેંક સ્ટાફ માટે મર્યાદિત છે. સ્વ-નોંધણી પ્રતિબંધિત છે.',
    invalidCredentials: 'ખોટી વિગતો. કૃપા કરીને તપાસીને ફરી પ્રયાસ કરો.',
    invalidOtp: 'ખોટો OTP. કૃપા કરીને ફરી ચકાસો.',
    termsAgreement: 'લૉગિન કરીને તમે DPDP એક્ટ 2023 મુજબ સત્ર લોગિંગની સંમતિ આપો છો.',

    // Employee Dashboard
    overview: 'વિહંગાવલોકન (Overview)',
    customerRequests: 'ગ્રાહક અરજીઓ',
    approvals: 'મંજૂરીઓ (Approvals)',
    kioskManagement: 'કિયોસ્ક સંચાલન',
    customerComplaints: 'ગ્રાહક ફરિયાદો',
    serviceHistory: 'સેવા ઇતિહાસ',
    reports: 'રિપોર્ટ્સ',
    pending: 'બાકી',
    inProgress: 'પ્રગતિમાં',
    completed: 'પૂર્ણ',
    needsAttention: 'ધ્યાન જરૂરી',

    // Settings
    languagePreference: 'ઇન્ટરફેસ અને સૂચના ભાષા',
    securitySettings: 'સુરક્ષા અને ખાતા વિકલ્પો',
    twoFactorAuth: 'સંવેદનશીલ વિનંતીઓ માટે OTP ફરજિયાત કરો',
    sessionTimeout: 'આપોઆપ નિષ્ક્રિયતા લૉગઆઉટ (૧૫ મિનિટ)',
    saveSettings: 'પસંદગીઓ સાચવો',
  },
};
