export type Language = 'en' | 'hi' | 'gu';

export type UserRole = 'CUSTOMER' | 'BANK_OFFICER';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  accountNumber?: string;
  maskedAccount?: string;
  employeeId?: string;
  designation?: string;
  branch?: string;
  avatarUrl?: string;
  kycStatus?: 'FULL_KYC' | 'MINIMUM_KYC' | 'PENDING';
  preferredLanguage: Language;
  authMethod: 'PASSWORD' | 'GOOGLE' | 'ACCOUNT_OTP' | 'EMPLOYEE_SSO';
  lastLogin: string;
}

export interface BankAccount {
  accountNumber: string;
  maskedNumber: string;
  accountType: 'SAVINGS' | 'CURRENT' | 'FIXED_DEPOSIT' | 'RECURRING_DEPOSIT';
  balance: number;
  ifscCode: string;
  branchName: string;
  currency: string;
  status: 'ACTIVE' | 'DORMANT' | 'FROZEN';
  nomineeRegistered: boolean;
}

export interface BankBranch {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  address: string;
  countersAvailable: number;
  currentQueueLength: number;
  avgWaitMinutes: number;
  openHours: string;
}

export type ServiceCategory = 'ACCOUNT' | 'KYC' | 'LOAN' | 'DEPOSIT_CERTIFICATE' | 'OTHER';

export interface BankingService {
  id: string;
  category: ServiceCategory;
  title: Record<Language, string>;
  description: Record<Language, string>;
  estimatedDays: number;
  requiredDocuments: string[];
  paperFormsAvoided: number;
  iconName: string;
  popular?: boolean;
}

export type RequestStatus = 
  | 'SUBMITTED' 
  | 'IN_VERIFICATION' 
  | 'PENDING_APPROVAL' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'ADDITIONAL_DOCS_REQUIRED';

export interface RequestAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  comment?: string;
}

export interface BankingRequest {
  id: string;
  referenceNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  accountNumber: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: ServiceCategory;
  branch: string;
  status: RequestStatus;
  priority: 'NORMAL' | 'HIGH' | 'SENIOR_CITIZEN';
  submittedAt: string;
  updatedAt: string;
  slaDeadline: string;
  formData: Record<string, string | number | boolean>;
  attachedDocuments: {
    name: string;
    type: string;
    url?: string;
    ocrExtracted?: Record<string, string>;
    verified?: boolean;
  }[];
  officerNotes?: string;
  rejectionReason?: string;
  auditTrail: RequestAuditEntry[];
}

export type QueueTokenStatus = 'WAITING' | 'SERVING' | 'SERVED' | 'SKIPPED' | 'CANCELLED';

export interface VirtualQueueToken {
  id: string;
  tokenNumber: string;
  branchId: string;
  branchName: string;
  serviceCategory: string;
  serviceName: string;
  customerName: string;
  customerPhone: string;
  accountNumber?: string;
  status: QueueTokenStatus;
  counterNumber?: number;
  bookedAt: string;
  appointmentTime?: string;
  estimatedWaitMins: number;
  isPriority: boolean; // Senior citizen or PwD
  qrCodePayload: string;
}

export type ComplaintCategory = 
  | 'UPI_FAILURE' 
  | 'ATM_DISPENSER' 
  | 'UNAUTHORIZED_TXN' 
  | 'WRONG_CHARGES' 
  | 'SERVICE_DELAY' 
  | 'CHEQUE_CLEARING';

export type ComplaintStatus = 
  | 'REGISTERED' 
  | 'UNDER_INVESTIGATION' 
  | 'PENDING_BANK_REVERSAL' 
  | 'RESOLVED' 
  | 'ESCALATED_OMBUDSMAN';

export interface Complaint {
  id: string;
  complaintNumber: string;
  category: ComplaintCategory;
  customerId: string;
  customerName: string;
  customerPhone: string;
  accountNumber: string;
  transactionReference?: string;
  amount?: number;
  disputeDate: string;
  description: string;
  status: ComplaintStatus;
  registeredAt: string;
  resolutionDeadline: string; // RBI statutory TAT
  assignedOfficer?: string;
  resolutionRemarks?: string;
  timeline: {
    date: string;
    status: string;
    note: string;
  }[];
}

export interface DocumentItem {
  id: string;
  name: string;
  docType: 'AADHAAR' | 'PAN' | 'SALARY_SLIP' | 'ADDRESS_PROOF' | 'CHEQUE_LEAF' | 'FORM_15G' | 'PENSION_CERTIFICATE';
  maskedIdentifier: string;
  fileSize: string;
  uploadedAt: string;
  expiryDate?: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  extractedData: Record<string, string>;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  targetEntity: string;
  targetId: string;
  ipHash: string;
  checksum: string;
}

export type KioskStatus = 'ONLINE' | 'OFFLINE' | 'NEEDS_ATTENTION';

export interface BranchKiosk {
  id: string;
  name: string;
  kioskCode: string;
  branchId: string;
  branchName: string;
  locationDetails: string;
  status: KioskStatus;
  cashDispenserStatus: 'OK' | 'LOW_CASH' | 'EMPTY' | 'N/A';
  passbookPrinterStatus: 'OK' | 'PAPER_LOW' | 'JAMMED' | 'OFFLINE';
  chequeDepositStatus: 'OK' | 'BIN_FULL' | 'OFFLINE';
  touchScreenStatus: 'OPERATIONAL' | 'CALIBRATION_NEEDED';
  lastPing: string;
  todayTransactions: number;
  activeAlerts: string[];
  maintenanceHistory: {
    date: string;
    technician: string;
    issue: string;
    actionTaken: string;
  }[];
}

