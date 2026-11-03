/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserRole } from '../types/banking';

export interface VerifiedKnowledgeDoc {
  id: string;
  sourceName: string;
  applicableBank: string; // 'All Banks' or specific bank name
  version: string;
  lastUpdated: string;
  accessLevel: 'PUBLIC_CUSTOMER' | 'RESTRICTED_EMPLOYEE';
  topic: string;
  title: string;
  summary: string;
  content: string;
  requirements?: string[];
  tatDays?: number | string;
  actionableWorkflowId?: string;
  keywords: string[];
}

export const VERIFIED_BANKING_KNOWLEDGE: VerifiedKnowledgeDoc[] = [
  // 1. Nominee Addition / Form DA-1
  {
    id: 'DOC-KYC-NOMINEE',
    sourceName: 'RBI Master Direction on Customer Service in Banks (Sec 45ZA) & Bank Policy v4.2',
    applicableBank: 'All Banks',
    version: 'v2024.1',
    lastUpdated: '2024-09-12',
    accessLevel: 'PUBLIC_CUSTOMER',
    topic: 'NOMINEE_DA1',
    title: 'Nominee Addition & Modification Guidelines (Form DA-1)',
    summary: 'Every individual account holder can nominate one person per savings/deposit account under Section 45ZA of Banking Regulation Act.',
    content: `Under Banking Regulation Act, 1949 Section 45ZA and RBI circular DBOD.No.Leg.BC.95/09.07.005, individual depositors may nominate a person to receive deposit proceeds upon death.

1. Eligibility: Any individual single account holder or joint account holders with 'Either or Survivor' mandate.
2. Forms: Form DA-1 (First-time nomination), Form DA-2 (Cancellation), Form DA-3 (Variation/Change of nominee).
3. Minor Nominee: If nominee is under 18 years, an adult Guardian must be designated.
4. Digital Submission via Saarthi: Paperless nomination is processed within 1 business day via Aadhaar OTP e-consent. Physical branch visit is NOT required.
5. Verification: Verified by Branch KYC Officer against depositor records.`,
    requirements: ['Nominee Full Legal Name', 'Nominee Date of Birth & Relationship', 'Aadhaar / ID Number of Nominee', 'Guardian details (if nominee is minor)'],
    tatDays: 1,
    actionableWorkflowId: 'SRV-NOMINEE',
    keywords: ['nominee', 'nomination', 'form da-1', 'da1', 'वारिस', 'नॉमिनी', 'નોમિની', 'legal heir', 'death claim'],
  },

  // 2. Residential Address Update
  {
    id: 'DOC-KYC-ADDRESS',
    sourceName: 'RBI Master Direction on KYC (Updated May 2024, Sec 38)',
    applicableBank: 'All Banks',
    version: 'v2024.3',
    lastUpdated: '2024-05-30',
    accessLevel: 'PUBLIC_CUSTOMER',
    topic: 'ADDRESS_UPDATE',
    title: 'Customer Address Updation & Officially Valid Documents (OVD)',
    summary: 'Customers can change communication or permanent address by providing an Officially Valid Document (OVD) or DigiLocker pull.',
    content: `Per RBI KYC Master Direction Section 38, customers do NOT need to visit their parent branch to update residential address.

1. Approved Officially Valid Documents (OVD): Passport, Driving Licence, Proof of possession of Aadhaar number, Voter Identity Card, or NREGA job card.
2. Utility Bill Allowance: If current address differs from permanent OVD, utility bill (electricity/piped gas/water not older than 2 months) or municipal property tax receipt is accepted for communication address.
3. Turn Around Time (TAT): 2 working days after digital verification. Passbook sticker and communication profile updated automatically.`,
    requirements: ['Valid Address Proof (Electricity bill under 60 days, Passport, or Aadhaar)', 'Recent Photograph / Live selfie', 'Self-declaration Form'],
    tatDays: 2,
    actionableWorkflowId: 'SRV-ADDRESS',
    keywords: ['address', 'change address', 'shift home', 'पता', 'सरનામું', 'electricity bill', 'aadhaar', 'ovd'],
  },

  // 3. Personalized Cheque Book Request
  {
    id: 'DOC-ACC-CHEQUE',
    sourceName: 'Janata Sahakari Bank Operating Service Policy v4.2 (Section 7.4)',
    applicableBank: 'All Banks',
    version: 'v4.2',
    lastUpdated: '2024-08-01',
    accessLevel: 'PUBLIC_CUSTOMER',
    topic: 'CHEQUE_BOOK',
    title: 'Cheque Book Requisition, Delivery & Security Rules',
    summary: 'Personalized 25 or 50 leaves CTS-2010 compliant cheque book with speed post tracking and automatic Positive Pay registration.',
    content: `1. Requisition: Account holders with active operative savings or current accounts with verified signature on record can order a personalized cheque book.
2. CTS-2010 Security: All issued cheques comply with RBI CTS-2010 standards (watermark, pantograph, and invisible UV ink).
3. Positive Pay System (PPS): RBI mandates PPS confirmation for cheque payments above ₹50,000 to prevent counterfeit clearance.
4. Delivery: Dispatched to verified registered address via India Post Speed Post within 3 business days. Customer receives SMS with tracking number.`,
    requirements: ['Active operative savings/current account', 'Positive Pay consent', 'Communication address confirmation'],
    tatDays: 3,
    actionableWorkflowId: 'SRV-CHEQUE',
    keywords: ['cheque', 'cheque book', 'check book', 'चेक', 'ચેક', 'cts-2010', 'positive pay', 'leaves'],
  },

  // 4. Contactless Debit Card Replacement & Blocking
  {
    id: 'DOC-CARD-DEBIT',
    sourceName: 'RBI Master Direction on Credit & Debit Card Issuance (RBI/2022-23/92)',
    applicableBank: 'All Banks',
    version: 'v2023.2',
    lastUpdated: '2024-04-10',
    accessLevel: 'PUBLIC_CUSTOMER',
    topic: 'DEBIT_CARD',
    title: 'EMV Chip Debit Card Issuance, Hotlisting & Replacement',
    summary: 'Instant online card hotlisting for lost/damaged cards with dispatch of contactless EMV chip RuPay Platinum or Visa cards.',
    content: `1. Immediate Blocking: If a debit card is stolen, lost, or subjected to suspicious SMS alerts, it must be hotlisted instantly via Saarthi or SMS to 567676.
2. Replacement: New EMV contactless card is dispatched within 3 business days.
3. Default Security Limits: Newly issued cards are pre-set with domestic ATM and POS enabled; international transactions and online e-commerce are disabled by default as per RBI mandate and can be toggled by the customer.`,
    requirements: ['Account Number', 'Reason for replacement (Lost / Damaged / Expired)', 'Dispatch address confirmation'],
    tatDays: 3,
    actionableWorkflowId: 'SRV-DEBIT-CARD',
    keywords: ['card', 'debit card', 'atm card', 'block card', 'hotlist', 'rupay', 'visa', 'कार्ड', 'ડેબિટ કાર્ડ'],
  },

  // 5. Failed UPI Auto-Reversal & RBI Harmonisation of TAT
  {
    id: 'DOC-PAY-UPI-FAILED',
    sourceName: 'RBI Circular DPSS.CO.PD No.629/02.01.014/2019-20 (Harmonisation of TAT & Compensation)',
    applicableBank: 'All Banks',
    version: 'v2024.1',
    lastUpdated: '2024-10-01',
    accessLevel: 'PUBLIC_CUSTOMER',
    topic: 'FAILED_UPI_REFUND',
    title: 'Harmonisation of Turn Around Time (TAT) for Failed UPI / ATM Debits',
    summary: 'RBI statutory framework mandating automatic refund within T+1 day and ₹100/day compensation for bank delays.',
    content: `Under RBI guidelines on Turn Around Time (TAT) for failed digital transactions:

1. UPI Account Debited but Beneficiary Not Credited: The remitting bank must auto-reverse the funds within T+1 working day (where T is transaction date).
2. Compensation for Delay: If the refund is delayed beyond T+1 business day, the issuing bank must proactively pay ₹100 per day of delay directly into the customer's account without requiring a separate claim.
3. Immediate Action: Customers should retrieve the 12-digit UPI RRN / UTR number from their passbook/SMS and file an instant dispute under Saarthi Grievance Center if not credited after 24 hours.
4. Security Advisory: Bank staff NEVER request UPI PIN or OTP to credit any refund. Any caller asking for a PIN to receive money is a fraudster.`,
    requirements: ['12-digit UPI RRN (Retrieval Reference Number) / UTR', 'Transaction Date & Time', 'Debited Amount (INR)'],
    tatDays: 'T+1 Working Day',
    actionableWorkflowId: 'COMPLAINTS',
    keywords: ['upi failed', 'money deducted', 'refund', 'reversal', 'upi tat', 'पैसा कट गया', 'पैसे कट गए', 'પૈસા કપાઈ ગયા', 'upi dispute', 'rrn'],
  },

  // 6. Senior Citizen Digital Life Certificate (Jeevan Pramaan)
  {
    id: 'DOC-SRV-PENSION',
    sourceName: 'DoPPW & RBI Master Circular on Disbursement of Government Pension',
    applicableBank: 'All Banks',
    version: 'v2024.1',
    lastUpdated: '2024-06-15',
    accessLevel: 'PUBLIC_CUSTOMER',
    topic: 'SENIOR_CITIZEN',
    title: 'Digital Life Certificate (Jeevan Pramaan) Submission & Doorstep Banking',
    summary: 'Pensioners can submit annual life certificate digitally via Face Recognition / Biometric or book priority doorstep verification.',
    content: `1. Window: Central, State, and Defense pensioners can submit their annual Life Certificate between October 1 and November 30.
2. Digital Submission: Using Aadhaar Face RD app and Jeevan Pramaan portal without stepping into a branch.
3. Doorstep Banking for Super Senior Citizens (70+ years): Available through Saarthi Doorstep Banking desk. An authorized bank mitra or branch executive visits the residence for biometric verification.
4. Processing Time: Same-day clearance (instant validation with CPAO/Defense Pension portal).`,
    requirements: ['Pension Payment Order (PPO) Number', 'Pension Account Number', 'Aadhaar Number linked with Mobile'],
    tatDays: 'Instant / Same Day',
    actionableWorkflowId: 'SRV-PENSION',
    keywords: ['pension', 'jeevan pramaan', 'life certificate', 'senior citizen', 'जीवन प्रमाण', 'પેન્શન', 'doorstep'],
  },

  // 7. Fixed Deposit (FD) vs Recurring Deposit (RD) Education
  {
    id: 'DOC-EDU-FDRD',
    sourceName: 'RBI Master Direction - Interest Rate on Deposits & Bank Deposit Rules',
    applicableBank: 'All Banks',
    version: 'v2024.2',
    lastUpdated: '2024-08-20',
    accessLevel: 'PUBLIC_CUSTOMER',
    topic: 'FD_RD_SAVINGS_EDUCATION',
    title: 'Term Deposits Comparison: Fixed Deposit (FD) vs Recurring Deposit (RD)',
    summary: 'Clear distinction between lump-sum Fixed Deposits and monthly installment Recurring Deposits with senior citizen benefits.',
    content: `1. Fixed Deposit (FD):
   • Deposit Type: One-time lump sum deposit (e.g., ₹50,000 or ₹5,00,000).
   • Tenor: 7 days to 10 years.
   • Interest Payout: Quarterly compounding, monthly income payout, or cumulative at maturity.
   • Senior Citizens (60+ years): Enjoy an additional 0.50% p.a. interest over standard rack rates.
   • Loan facility: Up to 90% of principal available instantly without breaking the FD.

2. Recurring Deposit (RD):
   • Deposit Type: Fixed monthly installment (e.g., ₹2,000 or ₹10,000 per month).
   • Tenor: 6 months to 10 years.
   • Ideal For: Salaried professionals and small savers building a planned corpus.

3. Deposit Insurance (DICGC): All customer deposits (Savings + Current + FD + RD) are insured up to ₹5,00,000 per depositor under Deposit Insurance and Credit Guarantee Corporation (DICGC).`,
    requirements: ['Operative Savings Account', 'PAN Card (for TDS exemption / Form 15G/15H)'],
    tatDays: 'Instant digital booking',
    keywords: ['fd', 'rd', 'fixed deposit', 'recurring deposit', 'interest rate', 'dicgc', 'ब्याज', 'फिक्स डिपॉजिट', 'વ્યાજ'],
  },

  // 8. RESTRICTED EMPLOYEE: RBI Master Direction on Periodic KYC Updation
  {
    id: 'DOC-EMP-KYC-RISK',
    sourceName: 'RBI Master Direction - Know Your Customer (KYC) Direction, 2016 (Updated May 2024)',
    applicableBank: 'All Banks',
    version: 'v2024.5',
    lastUpdated: '2024-05-04',
    accessLevel: 'RESTRICTED_EMPLOYEE',
    topic: 'KYC_RISK_CATEGORIZATION',
    title: 'RBI Master Direction: Customer Risk Categorization & Periodic Re-KYC Frequency',
    summary: 'Mandatory risk classification (High, Medium, Low) and statutory intervals for fresh KYC documentation under PMLA rules.',
    content: `Under Section 34 to 38 of RBI Master Directions on KYC:

1. Risk Categorization Schedule:
   • High-Risk Customers: Fresh KYC documents must be obtained every TWO (2) years. Includes politically exposed persons (PEPs), non-resident high net-worth individuals, trusts, charities, and accounts with multi-crore turnover.
   • Medium-Risk Customers: Fresh KYC documents required every EIGHT (8) years. Includes non-salaried individuals, small businesses, and partnership firms with moderate turnover.
   • Low-Risk Customers: Fresh KYC documents required every TEN (10) years. Includes salaried individuals, students, self-help groups, and senior citizens with verifiable income sources.

2. Low-Risk Address Self-Declaration: If a low-risk customer has no change in address, a simple self-declaration submitted via email, NetBanking, ATM, or Kiosk is legally sufficient. Physical presence cannot be insisted upon.

3. Partial Freezing Protocol (Section 39):
   • Notice period: Minimum 3 months advance notice must be served to the customer.
   • Stage 1: Disallow all debits while allowing credits for 3 months.
   • Stage 2: Full account freeze after 6 months total default, requiring Regional Manager approval.`,
    requirements: ['Risk assessment matrix score', 'PMLA verification checklist', 'CBS customer profiling update'],
    keywords: ['risk categorization', 'periodic kyc', 're-kyc', 'high risk', 'medium risk', 'low risk', 'pmla', 'partial freezing'],
  },

  // 9. RESTRICTED EMPLOYEE: Safe Deposit Locker Break-Open Procedure
  {
    id: 'DOC-EMP-LOCKER-BREAK',
    sourceName: 'RBI Circular DOR.LEG.REC/40/09.07.005/2021-22 (Safe Deposit Locker SOP)',
    applicableBank: 'All Banks',
    version: 'v2022.1',
    lastUpdated: '2024-03-15',
    accessLevel: 'RESTRICTED_EMPLOYEE',
    topic: 'LOCKER_BREAK_OPEN',
    title: 'Standard Operating Procedure (SOP) for Safe Deposit Locker Break-Open',
    summary: 'Strict statutory protocol for forced opening of lockers due to non-payment of rent, customer loss of key, or court order.',
    content: `Under RBI revised guidelines on Safe Deposit Lockers:

1. Notice Mandates for Overdue Rent:
   • The bank cannot break open a locker without giving at least 3 registered notices over a minimum span of 6 months.
   • Final notice must specify the exact date, time, and venue of intended break-open at least 15 days in advance.

2. Mandatory Committee for Physical Break-Open:
   • Senior Branch Manager / Officer-in-Charge (Chairperson)
   • Independent Officer (Vault Custodian / Dual Key Holder)
   • Certified OEM Locksmith (e.g. Godrej / Steelage authorized)
   • TWO (2) respectable independent external witnesses (non-bank employees, non-relatives).

3. Evidence & Inventory Protocol:
   • Continuous HD video recording from seal inspection to re-packing.
   • Preparation of detailed Itemised Inventory Register (Annexure L-4) signed by all committee members and witnesses.
   • Items must be packed in a tamper-evident sealed canvas bag with wax seals and stored in the main branch vault treasury.`,
    requirements: ['Postal acknowledgement cards of 3 registered notices', 'Annexure L-4 Inventory Form', 'Video recording storage archive (7-year retention)'],
    keywords: ['locker break-open', 'locker overdue rent', 'vault protocol', 'safe deposit locker', 'godrej locksmith', 'annexure l-4'],
  },

  // 10. RESTRICTED EMPLOYEE: Cash Retention Limits & EOD Balancing
  {
    id: 'DOC-EMP-CASH-RETENTION',
    sourceName: 'Janata Sahakari Bank Internal Operations Manual & Insurance Policy (Sec 12.3)',
    applicableBank: 'Janata Sahakari Bank Ltd.',
    version: 'v4.1',
    lastUpdated: '2024-07-10',
    accessLevel: 'RESTRICTED_EMPLOYEE',
    topic: 'CASH_RETENTION_LIMIT',
    title: 'Branch Cash Retention Limit Breach & Overnight Vault Insurance Protocol',
    summary: 'Mandatory ceiling on overnight physical cash held in branch strong rooms and immediate escalation protocols for excess cash.',
    content: `1. Sanctioned Cash Retention Limit:
   • Metro / Category A branches: Maximum ₹25,00,000 (Twenty-Five Lakhs).
   • Semi-Urban / Rural branches: Maximum ₹15,00,000 (Fifteen Lakhs).

2. Excess Cash Handling SOP:
   • Normal Day: Excess cash exceeding ₹5,00,000 above the retention limit must be remitted via Armoured Cash-in-Transit (CIT) van to the designated Currency Chest before 04:00 PM.
   • Late Receipts: If cash exceeds retention limit due to unexpected late deposits after banking hours:
     a) Lodge cash inside Double-Lock Strong Room Safe with Dual Custodian keys.
     b) Immediate automated email alert sent to Zonal Operations Head and Chief Risk Officer.
     c) Excess Cash In Transit & Safe Insurance endorsement automatically triggered for 24 hours.`,
    requirements: ['CBS EOD Cash Balancing Sheet', 'Dual Custody Register signed by Cashier & Accountant', 'Special Insurance Endorsement Voucher'],
    keywords: ['cash retention limit', 'eod cash', 'vault insurance', 'strong room', 'currency chest', 'cit remittance', 'excess cash'],
  },

  // 11. RESTRICTED EMPLOYEE: Banking Ombudsman Grievance Escalation & TAT
  {
    id: 'DOC-EMP-OMBUDSMAN',
    sourceName: 'Reserve Bank - Integrated Ombudsman Scheme, 2021 (RB-IOS 2021)',
    applicableBank: 'All Banks',
    version: 'v2024.1',
    lastUpdated: '2024-04-18',
    accessLevel: 'RESTRICTED_EMPLOYEE',
    topic: 'OMBUDSMAN_GRIEVANCE',
    title: 'Grievance Redressal TAT & Escalation Protocol under RBI Integrated Ombudsman Scheme',
    summary: 'Internal 30-day resolution timeline, Principal Nodal Officer escalation, and statutory customer compensation clauses.',
    content: `1. Internal Resolution Window: The bank has a maximum of THIRTY (30) calendar days from receipt of complaint to provide a written resolution to the complainant.
2. Escalation to RBI Ombudsman: If the bank fails to resolve within 30 days or the resolution is rejected by the customer, the complainant has the legal right to file a dispute before the RBI Banking Ombudsman (https://cms.rbi.org.in).
3. Compensatory Penalties:
   • Delayed credit of failed ATM transactions: ₹100 per day beyond T+5 calendar days.
   • Delayed reversal of failed UPI debits: ₹100 per day beyond T+1 business day.
   • Unauthorized electronic transactions: Zero liability if customer reports within 3 working days per RBI customer liability circular.`,
    requirements: ['Complaint Master Docket Number', 'Root Cause Analysis (RCA) memo', 'Nodal Officer Sign-off'],
    keywords: ['ombudsman', 'tat', 'complaint escalation', 'rb-ios', 'grievance resolution', 'nodal officer', 'compensation'],
  },

  // 12. RESTRICTED EMPLOYEE: Branch Kiosk Fleet Maintenance & Cassette SOP
  {
    id: 'DOC-EMP-KIOSK-SOP',
    sourceName: 'Saarthi Smart Banking Kiosk Operations Manual v3.2',
    applicableBank: 'All Banks',
    version: 'v3.2',
    lastUpdated: '2024-10-05',
    accessLevel: 'RESTRICTED_EMPLOYEE',
    topic: 'KIOSK_FLEET',
    title: 'Smart Banking Kiosk Fleet Health, Thermal Printer Spool & Cash Cassette SOP',
    summary: 'Daily morning audit procedure for self-service passbook printers, cheque deposit bins, and cash recycler modules.',
    content: `1. Morning Readiness Check (09:15 AM daily):
   • Verify network ping to local branch switch and central Saarthi API gateway.
   • Inspect thermal receipt roll (replace if remaining capacity is below 15%).
   • Verify Passbook Printer optical alignment by executing a blank test passbook feed.

2. Cash Deposit Module (CDM) Reconciliation:
   • Balance physical note count in Cassette A (₹500 notes) and Cassette B (₹100/₹200 notes) against EOD Kiosk Electronic Journal.
   • Inspect reject bin (clean dust sensor with dry lint-free cloth if reject rate exceeds 2%).

3. Hardware Tamper & Jam Protocol:
   • To open rear maintenance door, turn physical supervisor key to Pos-B to prevent tamper alarm sirens.
   • Log maintenance voucher in Saarthi Employee Desk under Kiosk Management tab.`,
    requirements: ['Supervisor Key A & B', 'OEM thermal print rolls (80mm)', 'EOD Electronic Journal (EJ) log'],
    keywords: ['kiosk maintenance', 'passbook printer', 'cash cassette', 'thermal paper', 'kiosk jam', 'supervisor mode', 'kiosk reboot'],
  },
];

/**
 * Searches the verified banking knowledge base with role-based filtering,
 * keyword matching, and bank-specific relevance.
 */
export function searchVerifiedKnowledge(
  query: string,
  userRole: UserRole = 'CUSTOMER',
  bankName: string = 'Janata Sahakari Bank Ltd.'
): VerifiedKnowledgeDoc[] {
  if (!query || !query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  const searchTerms = lowerQuery
    .replace(/[?,.:;!'"()]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const matched = VERIFIED_BANKING_KNOWLEDGE.filter((doc) => {
    // 1. Enforce access control
    if (doc.accessLevel === 'RESTRICTED_EMPLOYEE' && userRole !== 'BANK_OFFICER') {
      return false;
    }

    // 2. Enforce bank applicability
    if (doc.applicableBank !== 'All Banks' && doc.applicableBank !== bankName) {
      return false;
    }

    // 3. Keyword / text score
    const inTitle = doc.title.toLowerCase();
    const inSummary = doc.summary.toLowerCase();
    const inContent = doc.content.toLowerCase();
    const keywords = doc.keywords.join(' ').toLowerCase();

    // Direct phrase match
    if (inTitle.includes(lowerQuery) || inSummary.includes(lowerQuery) || keywords.includes(lowerQuery)) {
      return true;
    }

    // Term overlaps
    const matches = searchTerms.filter(
      (term) =>
        inTitle.includes(term) ||
        inSummary.includes(term) ||
        inContent.includes(term) ||
        keywords.includes(term)
    );

    return matches.length >= 1;
  });

  return matched;
}

/**
 * Retrieves a verified document by its unique ID
 */
export function getVerifiedDocById(id: string): VerifiedKnowledgeDoc | undefined {
  return VERIFIED_BANKING_KNOWLEDGE.find((d) => d.id === id);
}
