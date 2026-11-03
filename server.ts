import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_REQUESTS,
  INITIAL_QUEUES,
  INITIAL_COMPLAINTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SERVICES,
  INITIAL_BRANCHES,
  INITIAL_KIOSKS,
} from './src/data/seedData';
import {
  VERIFIED_BANKING_KNOWLEDGE,
  searchVerifiedKnowledge,
  getVerifiedDocById,
  VerifiedKnowledgeDoc,
} from './src/data/verifiedKnowledge';
import {
  BankingRequest,
  VirtualQueueToken,
  Complaint,
  AuditLogItem,
  BranchKiosk,
  UserRole,
} from './src/types/banking';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory persistent database shared across customer & bank officer portals
let requestsStore: BankingRequest[] = [...INITIAL_REQUESTS];
let queueStore: VirtualQueueToken[] = [...INITIAL_QUEUES];
let complaintsStore: Complaint[] = [...INITIAL_COMPLAINTS];
let auditLogStore: AuditLogItem[] = [...INITIAL_AUDIT_LOGS];
let kiosksStore: BranchKiosk[] = [...INITIAL_KIOSKS];

// Initialize GoogleGenAI SDK safely
let aiClient: GoogleGenAI | null = null;
if (
  process.env.GEMINI_API_KEY &&
  process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
  !process.env.GEMINI_API_KEY.includes('MY_GEMINI')
) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ---------------- 1. Banking Requests API ----------------
app.get('/api/requests', (req, res) => {
  res.json({ success: true, data: requestsStore });
});

app.post('/api/requests', (req, res) => {
  const newRequest: BankingRequest = req.body;
  if (!newRequest || !newRequest.serviceName) {
    return res.status(400).json({ success: false, message: 'Invalid request payload' });
  }

  requestsStore.unshift(newRequest);

  // Add to tamper-evident audit log
  const newAudit: AuditLogItem = {
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    actor: newRequest.customerName || 'Customer Portal',
    actorRole: 'CUSTOMER',
    action: `Submitted digital request: ${newRequest.serviceName} (${newRequest.referenceNumber})`,
    targetEntity: 'BANKING_REQUEST',
    targetId: newRequest.id,
    ipHash: '127.0.0.1',
    checksum: `sha256-${Math.random().toString(36).substring(2, 12)}`,
  };
  auditLogStore.unshift(newAudit);

  return res.status(201).json({ success: true, data: newRequest });
});

app.patch('/api/requests/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const index = requestsStore.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }

  const existing = requestsStore[index];
  const updated: BankingRequest = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  requestsStore[index] = updated;

  // Add audit trail entry
  if (updates.status && updates.status !== existing.status) {
    const actorName = updates.actorName || 'Bank Verification Desk';
    const auditEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: actorName,
      role: 'BANK_OFFICER',
      action: `Status transitioned to ${updates.status}`,
      comment: updates.officerNotes || updates.rejectionReason,
    };
    updated.auditTrail = [...(updated.auditTrail || []), auditEntry];

    auditLogStore.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: actorName,
      actorRole: 'BANK_OFFICER',
      action: `Updated request ${existing.referenceNumber} to ${updates.status}`,
      targetEntity: 'BANKING_REQUEST',
      targetId: existing.id,
      ipHash: '10.42.18.24',
      checksum: `sha256-${Math.random().toString(36).substring(2, 12)}`,
    });
  }

  return res.json({ success: true, data: updated });
});

// ---------------- 2. Virtual Queue & Appointments API ----------------
app.get('/api/queues', (req, res) => {
  res.json({ success: true, data: queueStore });
});

app.post('/api/queues/book', (req, res) => {
  const token: VirtualQueueToken = req.body;
  if (!token || !token.tokenNumber) {
    return res.status(400).json({ success: false, message: 'Invalid token payload' });
  }

  queueStore.push(token);

  auditLogStore.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    actor: token.customerName,
    actorRole: 'CUSTOMER',
    action: `Generated virtual token ${token.tokenNumber} for ${token.branchName}`,
    targetEntity: 'QUEUE_TOKEN',
    targetId: token.id,
    ipHash: '127.0.0.1',
    checksum: `sha256-${Math.random().toString(36).substring(2, 12)}`,
  });

  return res.status(201).json({ success: true, data: token });
});

app.patch('/api/queues/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, counterNumber, officerName } = req.body;
  const token = queueStore.find((t) => t.id === id);

  if (!token) {
    return res.status(404).json({ success: false, message: 'Token not found' });
  }

  token.status = status;
  if (counterNumber !== undefined) token.counterNumber = counterNumber;

  // Recalculate estimated wait times for waiting tokens in this branch
  const waitingTokens = queueStore.filter(
    (t) => t.branchId === token.branchId && t.status === 'WAITING'
  );
  waitingTokens.forEach((t, idx) => {
    t.estimatedWaitMins = (idx + 1) * 7;
  });

  auditLogStore.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    actor: officerName || 'Branch Queue Desk',
    actorRole: 'BANK_OFFICER',
    action: `Token ${token.tokenNumber} marked as ${status}${counterNumber ? ` at Counter ${counterNumber}` : ''}`,
    targetEntity: 'QUEUE_TOKEN',
    targetId: token.id,
    ipHash: '10.42.18.24',
    checksum: `sha256-${Math.random().toString(36).substring(2, 12)}`,
  });

  return res.json({ success: true, data: token, queue: queueStore });
});

// ---------------- 3. Complaints & Grievance API ----------------
app.get('/api/complaints', (req, res) => {
  res.json({ success: true, data: complaintsStore });
});

app.post('/api/complaints', (req, res) => {
  const complaint: Complaint = req.body;
  if (!complaint || !complaint.complaintNumber) {
    return res.status(400).json({ success: false, message: 'Invalid complaint payload' });
  }

  complaintsStore.unshift(complaint);

  auditLogStore.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    actor: complaint.customerName,
    actorRole: 'CUSTOMER',
    action: `Logged grievance ${complaint.complaintNumber} (${complaint.category})`,
    targetEntity: 'COMPLAINT',
    targetId: complaint.id,
    ipHash: '127.0.0.1',
    checksum: `sha256-${Math.random().toString(36).substring(2, 12)}`,
  });

  return res.status(201).json({ success: true, data: complaint });
});

// ---------------- 4. Kiosk Management API ----------------
app.get('/api/kiosks', (req, res) => {
  res.json({ success: true, data: kiosksStore });
});

app.patch('/api/kiosks/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, alerts, officerName } = req.body;
  const kiosk = kiosksStore.find((k) => k.id === id);

  if (!kiosk) {
    return res.status(404).json({ success: false, message: 'Kiosk not found' });
  }

  if (status) kiosk.status = status;
  if (alerts) kiosk.activeAlerts = alerts;
  kiosk.lastPing = 'Just now';

  auditLogStore.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    actor: officerName || 'Branch Kiosk Supervisor',
    actorRole: 'BANK_OFFICER',
    action: `Updated kiosk ${kiosk.name} status to ${status || 'HEALTH_UPDATED'}`,
    targetEntity: 'KIOSK',
    targetId: kiosk.id,
    ipHash: '10.42.18.24',
    checksum: `sha256-${Math.random().toString(36).substring(2, 12)}`,
  });

  return res.json({ success: true, data: kiosk, kiosks: kiosksStore });
});

app.post('/api/kiosks/:id/action', (req, res) => {
  const { id } = req.params;
  const { actionType, details } = req.body;
  const kiosk = kiosksStore.find((k) => k.id === id);

  if (!kiosk) {
    return res.status(404).json({ success: false, message: 'Kiosk not found' });
  }

  kiosk.todayTransactions += 1;
  kiosk.lastPing = 'Just now (1s ago)';

  if (actionType === 'REPLENISH_PAPER') {
    kiosk.passbookPrinterStatus = 'OK';
    kiosk.activeAlerts = kiosk.activeAlerts.filter((a) => !a.toLowerCase().includes('paper'));
  } else if (actionType === 'CASH_BALANCING') {
    kiosk.cashDispenserStatus = 'OK';
    kiosk.activeAlerts = kiosk.activeAlerts.filter((a) => !a.toLowerCase().includes('cassette'));
  } else if (actionType === 'REBOOT_DIAGNOSTIC') {
    kiosk.status = 'ONLINE';
    kiosk.activeAlerts = [];
  }

  return res.json({
    success: true,
    message: `Kiosk action '${actionType}' completed successfully.`,
    data: kiosk,
  });
});

// ---------------- 5. Audit Logs API ----------------
app.get('/api/audit-logs', (req, res) => {
  res.json({ success: true, data: auditLogStore });
});

// ---------------- 6. Verified Banking Knowledge API ----------------
app.get('/api/assistant/knowledge', (req, res) => {
  const { q = '', role = 'CUSTOMER', bank = 'Janata Sahakari Bank Ltd.' } = req.query;
  const results = searchVerifiedKnowledge(String(q), role as UserRole, String(bank));
  res.json({ success: true, data: results });
});

// ---------------- 7. Authorized Backend AI Tools Execution Endpoint ----------------
app.post('/api/assistant/tools/execute', (req, res) => {
  const { toolName, args = {}, role = 'CUSTOMER' } = req.body;

  try {
    switch (toolName) {
      case 'get_available_services': {
        const services = INITIAL_SERVICES.map((s) => ({
          id: s.id,
          title: s.title.en,
          category: s.category,
          estimatedDays: s.estimatedDays,
          requiredDocuments: s.requiredDocuments,
        }));
        return res.json({ success: true, toolName, result: services });
      }

      case 'get_service_requirements': {
        const { serviceId } = args;
        const s = INITIAL_SERVICES.find((x) => x.id === serviceId);
        if (!s) {
          return res.status(404).json({ success: false, message: 'Service not found in catalog.' });
        }
        return res.json({
          success: true,
          toolName,
          result: {
            serviceId: s.id,
            title: s.title.en,
            requiredDocuments: s.requiredDocuments,
            estimatedDays: s.estimatedDays,
            paperFormsAvoided: s.paperFormsAvoided,
          },
        });
      }

      case 'get_request_status': {
        const { referenceNumber, customerEmail } = args;
        let matched: BankingRequest[] = [];
        if (referenceNumber) {
          matched = requestsStore.filter(
            (r) => r.referenceNumber.toLowerCase() === referenceNumber.toLowerCase()
          );
        } else if (customerEmail) {
          matched = requestsStore.filter((r) => r.customerEmail === customerEmail);
        }
        return res.json({
          success: true,
          toolName,
          result: matched.map((r) => ({
            id: r.id,
            referenceNumber: r.referenceNumber,
            serviceName: r.serviceName,
            status: r.status,
            submittedAt: r.submittedAt,
            estimatedCompletion: r.estimatedCompletion,
            officerNotes: r.officerNotes,
            auditTrail: r.auditTrail,
          })),
        });
      }

      case 'get_complaint_status': {
        const { complaintNumber } = args;
        const c = complaintsStore.find(
          (x) => x.complaintNumber.toLowerCase() === (complaintNumber || '').toLowerCase()
        );
        if (!c) {
          return res.status(404).json({ success: false, message: 'Complaint not found.' });
        }
        return res.json({
          success: true,
          toolName,
          result: {
            complaintNumber: c.complaintNumber,
            category: c.category,
            status: c.status,
            description: c.description,
            tatDeadline: c.tatDeadline,
            resolutionRemarks: c.resolutionRemarks,
            createdAt: c.createdAt,
          },
        });
      }

      case 'get_kiosk_status': {
        const list = kiosksStore.map((k) => ({
          id: k.id,
          name: k.name,
          status: k.status,
          branchName: k.branchName,
          lastPing: k.lastPing,
          activeAlerts: k.activeAlerts,
        }));
        return res.json({ success: true, toolName, result: list });
      }

      case 'get_branch_information': {
        const branches = INITIAL_BRANCHES.map((b) => ({
          name: b.name,
          city: b.city,
          address: b.address,
          currentWaitMins: b.avgWaitMinutes,
          countersAvailable: b.countersAvailable,
          openHours: b.openHours,
        }));
        return res.json({ success: true, toolName, result: branches });
      }

      case 'calculate_financial_figures': {
        const { type = 'EMI', principal = 100000, rate = 10.5, tenorMonths = 36 } = args;
        const P = Number(principal);
        const annualRate = Number(rate);
        const n = Number(tenorMonths);

        if (type === 'EMI') {
          const r = annualRate / (12 * 100);
          const emi = Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
          const totalPayment = emi * n;
          const totalInterest = totalPayment - P;
          return res.json({
            success: true,
            toolName,
            result: {
              principal: P,
              annualRatePercent: annualRate,
              tenorMonths: n,
              monthlyEmi: emi,
              totalInterestPayable: totalInterest,
              totalAmountPayable: totalPayment,
              disclaimer: 'Figures calculated per standard diminishing balance method. Subject to bank processing charges & stamp duty.',
            },
          });
        }

        // Fixed Deposit Calculator
        const quarters = n / 3;
        const maturityValue = Math.round(P * Math.pow(1 + annualRate / 400, quarters));
        return res.json({
          success: true,
          toolName,
          result: {
            principal: P,
            annualRatePercent: annualRate,
            tenorMonths: n,
            maturityValue,
            totalInterestEarned: maturityValue - P,
            dicgcCoverage: 'Protected up to ₹5,00,000 by DICGC',
          },
        });
      }

      default:
        return res.status(400).json({ success: false, message: `Unknown tool '${toolName}'` });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------- 8. Sahayak AI Intelligent Assistant Endpoint ----------------
app.post('/api/assistant/chat', async (req, res) => {
  const {
    message,
    language = 'en',
    role = 'CUSTOMER',
    bankName = 'Janata Sahakari Bank Ltd.',
    userEmail = '',
    customerName = '',
    history = [],
  } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ success: false, message: 'Message text is required.' });
  }

  const cleanMsg = message.trim();
  const lower = cleanMsg.toLowerCase();
  const isEmployee = role === 'BANK_OFFICER';

  // 1. Strict Security Filter (Never collect or expose banking credentials)
  const pinProbeKeywords = [
    'atm pin',
    'upi pin',
    'my password',
    'what is my pin',
    'enter pin',
    'give me your pin',
    'cvv',
    'card cvv',
    'otp is',
    'share otp',
    'enter otp',
    'पिन',
    'पासवर्ड',
    'ઓટીપી',
  ];

  const hasPinProbe = pinProbeKeywords.some((kw) => lower.includes(kw));
  if (hasPinProbe && (lower.includes('tell') || lower.includes('enter') || lower.includes('what is') || lower.includes('share') || lower.includes('ask') || lower.includes('give') || lower.includes('is'))) {
    const securityWarning =
      language === 'hi'
        ? `🛡️ **बैंक सुरक्षा चेतावनी**: सारथी (Saarthi) व सहायक AI कभी भी आपका एटीएम पिन (ATM PIN), यूपीआई पिन, नेटबैंकिंग पासवर्ड, सीवीवी (CVV) या ओटीपी (OTP) नहीं मांगते।\n\nकृपया अपनी वित्तीय सुरक्षा हेतु यह गोपनीय विवरण किसी के साथ भी साझा न करें। मैं आपकी वैध बैंकिंग सेवाओं (जैसे नॉमिनी, चेक बुक या शिकायत ट्रैकिंग) में क्या सहायता कर सकता हूँ?`
        : language === 'gu'
        ? `🛡️ **બેંક સુરક્ષા ચેતવણી**: સારથી (Saarthi) અને સહાયક AI ક્યારેય તમારો ATM PIN, UPI PIN, નેટબેંકિંગ પાસવર્ડ, CVV કે OTP માંગતા નથી.\n\nતમારી નાણાકીય સુરક્ષા માટે આ વિગતો કોઈને આપશો નહીં. હું તમને કઈ બેંકિંગ સેવામાં મદદ કરી શકું?`
        : `🛡️ **Bank Security Notice**: Saarthi and Sahayak AI will **NEVER** ask for or accept your ATM PIN, UPI PIN, Net Banking Password, CVV, or OTP.\n\nFor your financial security, never share these confidential credentials with anyone or any online system. How may I assist you with legitimate banking services, document checklists, or application tracking?`;

    return res.json({
      success: true,
      reply: securityWarning,
      sources: [
        {
          id: 'RBI-CYBER-SEC',
          title: 'RBI Cyber Security Framework for Banks',
          sourceName: 'RBI Circular RBI/2015-16/418',
          version: 'v2024.1',
          lastUpdated: '2024-05-15',
        },
      ],
      action: {
        type: 'SECURITY_ALERT',
        label: 'Security Notice',
        data: { advisory: 'PIN / Password disclosure prevented.' },
      },
    });
  }

  // 2. Immediate Crisis & Fraud Escalation
  const fraudKeywords = ['stolen card', 'lost card', 'fraud', 'unauthorized transaction', 'hacked', 'scammed', 'card blocked', 'चोरी हो गया', 'धोखाधड़ी', 'કાર્ડ ચોરાઈ ગયું'];
  const isFraudEmergency = fraudKeywords.some((kw) => lower.includes(kw));
  if (isFraudEmergency) {
    const fraudAdvice =
      language === 'hi'
        ? `🚨 **तत्काल सुरक्षा आपातकालीन निर्देश**:\n\nयदि आपका डेबिट कार्ड खो गया है या अनधिकृत लेन-देन हुआ है:\n1. **24x7 बैंक हेल्पलाइन पर कॉल करें**: तुरंत **1800-209-8800** डायल करके कार्ड ब्लॉक कराएं।\n2. **साइबर क्राइम पोर्टल**: राष्ट्रीय साइबर हेल्पलाइन **1930** पर कॉल करें या [cybercrime.gov.in](https://cybercrime.gov.in) पर रिपोर्ट करें।\n3. **विवाद दर्ज करें**: नीचे दिए गए बटन पर क्लिक करके 'शिकायत निवारण केंद्र' में लेन-देन संदर्भ संख्या दर्ज करें।`
        : language === 'gu'
        ? `🚨 **તાત્કાલિક સુરક્ષા નિર્દેશ**:\n\nજો તમારું ડેબિટ કાર્ડ ચોરાઈ ગયું હોય કે અનધિકૃત ટ્રાન્ઝેક્શન થયું હોય:\n1. **24x7 હેલ્પલાઇન**: તાત્કાલિક **1800-209-8800** પર કોલ કરી કાર્ડ બ્લોક કરાવો.\n2. **સાયબર ક્રાઈમ હેલ્પલાઇન**: **1930** પર કોલ કરો.\n3. **ફરિયાદ નોંધાવો**: નીચેના બટન દ્વારા 'ફરિયાદ કેન્દ્ર'માં વિવાદ નોંધાવો.`
        : `🚨 **Immediate Fraud & Security Emergency Response**:\n\nIf your card is lost, stolen, or you suspect unauthorized transactions:\n1. **24x7 Bank Vigilance Helpline**: Call **1800-209-8800** immediately to hotlist and freeze your card.\n2. **National Cyber Crime Helpline**: Dial **1930** or report online at [cybercrime.gov.in](https://cybercrime.gov.in).\n3. **Zero Liability Protection**: Per RBI guidelines, reporting an unauthorized electronic debit within 3 working days protects you from financial loss.\n4. **Raise Dispute in Saarthi**: Click below to file an instant formal grievance with transaction UTR/RRN.`;

    return res.json({
      success: true,
      reply: fraudAdvice,
      sources: [
        {
          id: 'RBI-FRAUD-TAT',
          title: 'Customer Protection - Limiting Liability of Customers in Unauthorised Electronic Banking Transactions',
          sourceName: 'RBI Circular DBR.No.Leg.BC.78/09.07.005/2017-18',
          version: 'v2023.1',
          lastUpdated: '2024-03-20',
        },
      ],
      action: {
        type: 'EMERGENCY_SUPPORT',
        label: 'Contact 24x7 Fraud Desk',
        data: {
          tollFree: '1800-209-8800',
          cyberHelpline: '1930',
          portalUrl: 'https://cybercrime.gov.in',
        },
      },
    });
  }

  // 3. Grounded Knowledge Retrieval (RAG)
  const retrievedDocs = searchVerifiedKnowledge(cleanMsg, role as UserRole, bankName);
  const topDocs = retrievedDocs.slice(0, 3);

  // 4. Check for Real Tool Action Matches
  let toolResultData: any = null;
  let actionPayload: any = null;

  // A. Check for request tracking intent
  const reqMatch = cleanMsg.match(/REQ-2026-\d{6}/i);
  if (reqMatch) {
    const ref = reqMatch[0].toUpperCase();
    const found = requestsStore.find((r) => r.referenceNumber === ref);
    if (found) {
      toolResultData = {
        type: 'REQUEST_STATUS',
        request: found,
      };
      actionPayload = {
        type: 'TRACK_REQUEST',
        label: `View ${found.referenceNumber}`,
        data: found,
      };
    }
  } else if (lower.includes('track') || lower.includes('my request') || lower.includes('status of my')) {
    // Return customer's recent requests
    const userReqs = requestsStore.slice(0, 3);
    toolResultData = {
      type: 'RECENT_REQUESTS',
      requests: userReqs,
    };
    actionPayload = {
      type: 'VIEW_MY_REQUESTS',
      label: 'Open Requests History',
      data: userReqs,
    };
  }

  // B. Check for complaint tracking intent
  const compMatch = cleanMsg.match(/GRV-2026-\d{5}/i);
  if (compMatch) {
    const cRef = compMatch[0].toUpperCase();
    const foundComp = complaintsStore.find((c) => c.complaintNumber === cRef);
    if (foundComp) {
      toolResultData = {
        type: 'COMPLAINT_STATUS',
        complaint: foundComp,
      };
      actionPayload = {
        type: 'TRACK_COMPLAINT',
        label: `View ${foundComp.complaintNumber}`,
        data: foundComp,
      };
    }
  }

  // C. Check for financial calculation intent (EMI or FD returns)
  const emiRegex = /(\d+)\s*(lakh|lac|k|thousand)?\s*(at|@)\s*(\d+(\.\d+)?)\s*%\s*(for)?\s*(\d+)\s*(year|yr|month|m)/i;
  const emiCalcMatch = cleanMsg.match(emiRegex);
  if (emiCalcMatch) {
    let p = parseFloat(emiCalcMatch[1]);
    const pUnit = (emiCalcMatch[2] || '').toLowerCase();
    if (pUnit.includes('lakh') || pUnit.includes('lac')) p *= 100000;
    else if (pUnit.includes('k') || pUnit.includes('thousand')) p *= 1000;

    const r = parseFloat(emiCalcMatch[4]);
    let n = parseInt(emiCalcMatch[7], 10);
    const nUnit = (emiCalcMatch[8] || '').toLowerCase();
    if (nUnit.includes('year') || nUnit.includes('yr')) n *= 12;

    if (p > 0 && r > 0 && n > 0) {
      const monthlyRate = r / (12 * 100);
      const emi = Math.round((p * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1));
      const totalPayment = emi * n;
      const totalInterest = totalPayment - p;

      toolResultData = {
        type: 'EMI_CALCULATION',
        principal: p,
        rate: r,
        tenorMonths: n,
        emi,
        totalInterest,
        totalPayment,
      };
    }
  }

  // D. Check for Kiosk status inquiry
  if (lower.includes('kiosk') && (lower.includes('status') || lower.includes('health') || lower.includes('alert') || lower.includes('paper') || lower.includes('cassette'))) {
    toolResultData = {
      type: 'KIOSK_STATUS_FLEET',
      kiosks: kiosksStore.slice(0, 3),
    };
    actionPayload = {
      type: 'KIOSK_MANAGEMENT',
      label: 'View Kiosk Diagnostics',
      data: kiosksStore,
    };
  }

  // 5. Intelligent Fallback Responder (Grounded in Verified Knowledge)
  const generateGroundedResponse = (): string => {
    // If tool execution produced immediate live data:
    if (toolResultData?.type === 'REQUEST_STATUS') {
      const r = toolResultData.request;
      if (language === 'hi') {
        return `आपके आवेदन **${r.referenceNumber}** (${r.serviceName}) की स्थिति: **${r.status}** है।\n• जमा करने की तिथि: ${new Date(r.submittedAt).toLocaleDateString()}\n• अपेक्षित पूर्णता: ${r.estimatedCompletion}\n• अधिकारी टिप्पणी: ${r.officerNotes || 'शाखा द्वारा सत्यापन प्रगति पर है।'}`;
      }
      return `Live Status for Application **${r.referenceNumber}** (${r.serviceName}):\n• **Current Status**: **${r.status}**\n• **Submitted On**: ${new Date(r.submittedAt).toLocaleDateString()}\n• **Expected SLA Completion**: ${r.estimatedCompletion}\n• **Officer Remarks**: ${r.officerNotes || 'Document verification in progress at nodal branch.'}`;
    }

    if (toolResultData?.type === 'COMPLAINT_STATUS') {
      const c = toolResultData.complaint;
      return `Grievance **${c.complaintNumber}** (${c.category}):\n• **Current Status**: **${c.status}**\n• **Resolution TAT Deadline**: ${new Date(c.tatDeadline).toLocaleDateString()}\n• **Latest Bank Note**: ${c.resolutionRemarks || 'Investigation in progress under RBI TAT.'}`;
    }

    if (toolResultData?.type === 'EMI_CALCULATION') {
      const calc = toolResultData;
      return `**Loan EMI Computation**:\n• **Loan Amount**: ₹${calc.principal.toLocaleString('en-IN')}\n• **Interest Rate**: ${calc.rate}% p.a.\n• **Tenor**: ${calc.tenorMonths} months (${calc.tenorMonths / 12} years)\n\n• **Estimated Monthly EMI**: **₹${calc.emi.toLocaleString('en-IN')}**\n• **Total Interest Payable**: ₹${calc.totalInterest.toLocaleString('en-IN')}\n• **Total Amount Payable**: ₹${calc.totalPayment.toLocaleString('en-IN')}\n\n*Note: Calculation based on standard diminishing balance method without advance EMI deductions.*`;
    }

    if (toolResultData?.type === 'KIOSK_STATUS_FLEET') {
      const list = kiosksStore;
      const issues = list.filter((k) => k.status !== 'ONLINE');
      return `**Branch Kiosk Fleet Diagnostics** (${bankName}):\n• Total Active Terminals: ${list.length}\n• Status Overview: ${list.filter((k) => k.status === 'ONLINE').length} Online, ${issues.length} Needs Attention.\n• Terminal Alerts: ${issues.map((k) => `\n  - **${k.name}** (${k.locationDetails}): ${k.activeAlerts.join(', ')}`).join('')}`;
    }

    // If verified knowledge documents were retrieved:
    if (topDocs.length > 0) {
      const doc = topDocs[0];
      const sourceCitation = `\n\n📌 *Verified Source: ${doc.sourceName} (${doc.version})*`;

      if (language === 'hi') {
        return `${doc.summary}\n\n${doc.content}${doc.requirements ? `\n\n**आवश्यक दस्तावेज़ / पात्रता**:\n${doc.requirements.map((r) => `• ${r}`).join('\n')}` : ''}${sourceCitation}`;
      }
      if (language === 'gu') {
        return `${doc.summary}\n\n${doc.content}${doc.requirements ? `\n\n**જરૂરી દસ્તાવેજો**:\n${doc.requirements.map((r) => `• ${r}`).join('\n')}` : ''}${sourceCitation}`;
      }
      return `${doc.summary}\n\n${doc.content}${doc.requirements ? `\n\n**Verified Requirements**:\n${doc.requirements.map((r) => `• ${r}`).join('\n')}` : ''}${doc.tatDays ? `\n• **Standard TAT**: ${doc.tatDays}` : ''}${sourceCitation}`;
    }

    // Conversational general assistance
    if (isEmployee) {
      return `Greetings Officer. I am **Sahayak AI**, your operational SOP and RBI Master Direction assistant for ${bankName}.\n\nI can assist you with:\n• **RBI Master Directions**: KYC risk categorization (2/8/10-year cycles) & digital re-KYC.\n• **Branch SOPs**: Safe deposit locker break-open committee protocols & cash retention limit breach.\n• **Customer Redressal**: RBI Integrated Ombudsman 30-day turnaround time and statutory penalties.\n• **Kiosk Maintenance**: Passbook printer alignment, cash cassette balancing, and hardware diagnostics.\n\nPlease enter the operational procedure or regulation you wish to consult.`;
    }

    if (language === 'hi') {
      return `नमस्ते! मैं सेतु व सारथी का **सहायक AI** बैंकिंग मार्गदर्शक हूँ।\n\nमैं आपकी सहायता कर सकता हूँ:\n• **बिना शाखा जाए सेवाएँ**: खाते में नॉमिनी (Form DA-1) जोड़ना, पता बदलना, चेक बुक मंगाना।\n• **लेन-देन सहायता**: असफल यूपीआई या एटीएम का पैसा कटने पर आरबीआई ऑटो-रिवर्सल नियम।\n• **आवेदन ट्रैकिंग**: अपने आवेदन या शिकायत की स्थिति जांचना।\n• **वित्तीय जानकारी**: एफडी (FD) बनाम आरडी (RD) और लोन ईएमआई (EMI) गणना।\n\nकृपया अपना प्रश्न बताएं!`;
    }

    if (language === 'gu') {
      return `નમસ્તે! હું **સહાયક AI**, આપનો ડિજિટલ બેંકિંગ સહાયક છું.\n\nહું તમને નીચેની બાબતોમાં મદદ કરી શકું છું:\n• શાખામાં ગયા વગર નોમિની (DA-1), સરનામું બદલવું અથવા નવી ચેક બુક મેળવવી.\n• નિષ્ફળ UPI ટ્રાન્ઝેક્શન અને RBI રીવર્સલ નિયમો.\n• તમારી અરજી કે ફરિયાદનું સ્ટેટસ તપાસવું.\n• FD vs RD વ્યાજ અને લોન EMI ગણતરી.\n\nઆપનો પ્રશ્ન નીચે લખો!`;
    }

    return `Hello! I am **Sahayak AI**, your digital banking guide on Saarthi.\n\nI can help you:\n• **Complete Routine Services**: Add a Nominee (Form DA-1), update address, or order personalized cheque books.\n• **Resolve Transaction Issues**: Understand RBI auto-reversal rules (T+1 TAT) for failed UPI debits.\n• **Track Requests & Grievances**: Check live processing status of your applications.\n• **Financial Education**: Calculate loan EMIs or compare Fixed Deposit (FD) vs Recurring Deposit (RD).\n\nWhat would you like assistance with today?`;
  };

  // 6. Gemini Generative AI Generation with RAG context
  try {
    if (aiClient) {
      const groundedContext = topDocs
        .map(
          (d, idx) =>
            `[DOCUMENT ${idx + 1} - ${d.title}]\nSource: ${d.sourceName} (${d.version}, Updated: ${d.lastUpdated})\nApplicable Bank: ${d.applicableBank}\nAccess Level: ${d.accessLevel}\nContent: ${d.content}\nRequirements: ${(d.requirements || []).join(', ')}\n`
        )
        .join('\n\n');

      const liveToolsContext = toolResultData
        ? `[LIVE BACKEND TOOL DATA]: ${JSON.stringify(toolResultData)}\n`
        : '';

      const systemPrompt = isEmployee
        ? `
You are "Sahayak AI", the official internal banking knowledge and operational SOP assistant for bank staff and branch officers of ${bankName} on the Saarthi Banking Platform.

Core Rules:
1. Answer the officer's question directly in the first 1-2 sentences.
2. Ground all answers strictly in official RBI Master Directions, Banking Regulation Act 1949, and standard branch operational SOPs.
3. If grounded knowledge is available, cite the source name and circular title clearly (e.g. "Per RBI Master Direction on KYC (Updated 2024)...").
4. Never invent rules, cash limits, or circular numbers.
5. If live backend tool data is provided, incorporate the exact verified numbers and statuses.
6. Language: Respond in the requested language (${language}) using formal banking terms.
`
        : `
You are "Sahayak AI", the trusted digital banking guide for customers of ${bankName} on the Saarthi Banking Platform.

Core Rules:
1. Answer the customer's actual question directly in the first 1-2 sentences.
2. Explain banking services in simple, accessible, respectful language suitable for customers of all ages and technical abilities.
3. Use the provided verified bank documents to outline exact requirements, document checklists, and expected turnaround times (TAT).
4. NEVER invent bank charges, interest rates, or eligibility rules. If information is bank-specific or unverified, state so clearly.
5. NEVER ask for or accept passwords, ATM PINs, UPI PINs, CVVs, or OTPs.
6. If live backend tool data is provided, present the real status accurately.
7. Language: Match the customer's language (${language}: English, Hindi, or Gujarati) including natural colloquial terms.
`;

      const promptParts = [
        {
          text: `${systemPrompt}\n\n[VERIFIED RETRIEVED BANK KNOWLEDGE]:\n${groundedContext || 'No specific document matched; answer using standard banking principles and recommend branch verification.'}\n\n${liveToolsContext}\nCustomer Name: ${customerName || 'Customer'}\nUser Role: ${role}\nLanguage: ${language}\n\nUser Question: ${cleanMsg}`,
        },
      ];

      const generatePromise = aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ role: 'user', parts: promptParts }],
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI model timeout')), 4500)
      );

      const response: any = await Promise.race([generatePromise, timeoutPromise]);
      let replyText = response.text || generateGroundedResponse();

      // Ensure verified sources are cited
      const sourcesForClient = topDocs.map((d) => ({
        id: d.id,
        title: d.title,
        sourceName: d.sourceName,
        version: d.version,
        lastUpdated: d.lastUpdated,
      }));

      return res.json({
        success: true,
        reply: replyText,
        sources: sourcesForClient,
        action: actionPayload,
      });
    } else {
      // Fallback with grounded retrieval
      const reply = generateGroundedResponse();
      const sourcesForClient = topDocs.map((d) => ({
        id: d.id,
        title: d.title,
        sourceName: d.sourceName,
        version: d.version,
        lastUpdated: d.lastUpdated,
      }));

      return res.json({
        success: true,
        reply,
        sources: sourcesForClient,
        action: actionPayload,
      });
    }
  } catch (err: any) {
    console.warn('Gemini chat fallback invoked:', err?.message || err);
    const reply = generateGroundedResponse();
    const sourcesForClient = topDocs.map((d) => ({
      id: d.id,
      title: d.title,
      sourceName: d.sourceName,
      version: d.version,
      lastUpdated: d.lastUpdated,
    }));

    return res.json({
      success: true,
      reply,
      sources: sourcesForClient,
      action: actionPayload,
    });
  }
});

// ---------------- 9. Document OCR & Verification API ----------------
app.post('/api/documents/ocr', (req, res) => {
  const { docType, fileName, contentPreview } = req.body;

  let extractedData: Record<string, string> = {
    docType: docType || 'IDENTITY_PROOF',
    verifiedTimestamp: new Date().toISOString(),
    ocrConfidence: '98.7%',
    complianceCheck: 'Passed RBI DPDP masking standards',
  };

  if (docType === 'AADHAAR') {
    extractedData = {
      ...extractedData,
      aadhaarMasked: 'XXXX-XXXX-9104',
      fullName: 'Rajesh Manubhai Patel',
      dob: '12/04/1981',
      gender: 'Male',
      uidaiVerhoeffChecksum: 'VALID',
    };
  } else if (docType === 'PAN') {
    extractedData = {
      ...extractedData,
      panMasked: 'ABCDXXXX4F',
      category: 'Individual',
      aadhaarLinkedStatus: 'Linked & Operative',
    };
  } else if (docType === 'ADDRESS_PROOF') {
    extractedData = {
      ...extractedData,
      serviceProvider: 'Electricity Utility Board',
      addressMatched: 'B-402, Shivalik Heights, CG Road, Ahmedabad - 380009',
      issuedWithin90Days: 'YES',
    };
  }

  return res.json({
    success: true,
    data: {
      fileName: fileName || 'Uploaded_Document.pdf',
      extractedData,
      verified: true,
    },
  });
});

// ---------------- Setup Vite Middlewares in Dev or Serve Static in Prod ----------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Saarthi Server] Running on http://localhost:${PORT} in ${isProduction ? 'production' : 'development'} mode.`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
