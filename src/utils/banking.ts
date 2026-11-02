/**
 * Pure business logic and calculation utilities for Indian Digital Banking Automation
 */

export function validatePan(pan: string): boolean {
  if (!pan) return false;
  const cleaned = pan.trim().toUpperCase();
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
  return panRegex.test(cleaned);
}

export function maskPan(pan: string): string {
  if (!pan) return '';
  const cleaned = pan.trim().toUpperCase();
  if (cleaned.length !== 10) return cleaned;
  // Mask 4th through 7th characters (e.g., ABCDE1234F -> ABCDXXXX4F)
  return `${cleaned.slice(0, 4)}XXXX${cleaned.slice(8)}`;
}

export function validateAadhaar(aadhaar: string): boolean {
  if (!aadhaar) return false;
  const digits = aadhaar.replace(/\D/g, '');
  return digits.length === 12;
}

export function maskAadhaar(aadhaar: string): string {
  if (!aadhaar) return '';
  const digits = aadhaar.replace(/\D/g, '');
  if (digits.length !== 12) return aadhaar;
  return `XXXX-XXXX-${digits.slice(8)}`;
}

export function validateAccountNumber(acc: string): boolean {
  if (!acc) return false;
  const digits = acc.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 18;
}

export function maskAccountNumber(acc: string): string {
  if (!acc) return '';
  const digits = acc.replace(/\D/g, '');
  if (digits.length < 4) return digits;
  const lastFour = digits.slice(-4);
  return `•••• •••• ${lastFour}`;
}

export function validateMobileNumber(mobile: string): boolean {
  if (!mobile) return false;
  const digits = mobile.replace(/\D/g, '');
  // Indian mobile numbers are 10 digits starting with 6, 7, 8, or 9
  return digits.length === 10 && /^[6-9]\d{9}$/.test(digits);
}

export function maskMobile(mobile: string): string {
  if (!mobile) return '';
  const digits = mobile.replace(/\D/g, '');
  if (digits.length < 10) return mobile;
  const lastTwo = digits.slice(-2);
  const firstFive = digits.slice(0, 5);
  return `+91 ${firstFive} •••${lastTwo}`;
}

export function validateEmployeeEmail(email: string): boolean {
  if (!email) return false;
  const trimmed = email.trim().toLowerCase();
  const allowedDomains = [
    '@janatabank.in',
    '@prathambank.co.in',
    '@stateapexbank.org',
    '@bharatiyabank.in',
    '@bank.gov.in',
    '@setubank.in',
  ];
  return allowedDomains.some((domain) => trimmed.endsWith(domain));
}

export function formatInr(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateEmi(principal: number, annualRatePct: number, tenureMonths: number): {
  emi: number;
  totalPayment: number;
  totalInterest: number;
} {
  if (principal <= 0 || tenureMonths <= 0) {
    return { emi: 0, totalPayment: 0, totalInterest: 0 };
  }
  if (annualRatePct <= 0) {
    const emi = Math.round(principal / tenureMonths);
    return { emi, totalPayment: principal, totalInterest: 0 };
  }

  const monthlyRate = annualRatePct / (12 * 100);
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = Math.round((principal * monthlyRate * factor) / (factor - 1));
  const totalPayment = emi * tenureMonths;
  const totalInterest = Math.max(0, totalPayment - principal);

  return { emi, totalPayment, totalInterest };
}

export function calculateSlaDeadline(submittedAtIso: string, slaDays: number): string {
  const date = new Date(submittedAtIso);
  if (isNaN(date.getTime())) {
    const now = new Date();
    now.setDate(now.getDate() + slaDays);
    return now.toISOString();
  }
  date.setDate(date.getDate() + slaDays);
  return date.toISOString();
}

export function isRequestOverdue(slaDeadlineIso: string, currentIso?: string): boolean {
  const deadline = new Date(slaDeadlineIso).getTime();
  const current = currentIso ? new Date(currentIso).getTime() : Date.now();
  if (isNaN(deadline)) return false;
  return current > deadline;
}

export function getEstimatedWaitTime(positionInQueue: number, avgServiceMinutes = 8, isPriority = false): number {
  if (positionInQueue <= 0) return 0;
  // Priority tickets (Senior citizens, PwD) jump the general queue
  const effectivePosition = isPriority ? Math.max(1, Math.ceil(positionInQueue / 3)) : positionInQueue;
  return effectivePosition * avgServiceMinutes;
}

export function calculatePaperAndCostSavings(
  completedRequestsCount: number,
  digitalTokensServed: number
): {
  paperSheetsSaved: number;
  treesSaved: number;
  branchHoursSaved: number;
  costSavingsInr: number;
} {
  const paperSheetsSaved = (completedRequestsCount * 4) + (digitalTokensServed * 2);
  const treesSaved = Number((paperSheetsSaved / 8333).toFixed(2));
  const branchHoursSaved = Math.round(((completedRequestsCount * 45) + (digitalTokensServed * 20)) / 60);
  const costSavingsInr = completedRequestsCount * 112 + digitalTokensServed * 35;

  return {
    paperSheetsSaved,
    treesSaved,
    branchHoursSaved,
    costSavingsInr,
  };
}

export function generateReferenceNumber(prefix: string): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${year}-${random}`;
}
