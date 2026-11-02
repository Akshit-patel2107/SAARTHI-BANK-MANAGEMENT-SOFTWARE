import React, { useState, useEffect } from 'react';
import {
  Home,
  FileText,
  Clock,
  Ticket,
  AlertTriangle,
  FolderLock,
  Sparkles,
  HelpCircle,
  Building2,
  TreePine,
  CheckCircle2,
} from 'lucide-react';
import { Navbar } from './components/layout/Navbar';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { ServicesCatalog } from './components/customer/ServicesCatalog';
import { ServiceRequestModal } from './components/customer/ServiceRequestModal';
import { MyRequestsView } from './components/customer/MyRequestsView';
import { VirtualQueueView } from './components/customer/VirtualQueueView';
import { DocumentVaultView } from './components/customer/DocumentVaultView';
import { ComplaintsCenter } from './components/customer/ComplaintsCenter';
import { AssistantDrawer } from './components/customer/AssistantDrawer';
import { OfficerDashboard } from './components/officer/OfficerDashboard';
import { LoginPortal } from './components/auth/LoginPortal';
import { SettingsModal } from './components/settings/SettingsModal';

import {
  AuthUser,
  Language,
  UserRole,
  BankAccount,
  BankBranch,
  BankingService,
  BankingRequest,
  VirtualQueueToken,
  Complaint,
  DocumentItem,
  AuditLogItem,
  RequestStatus,
} from './types/banking';
import {
  INITIAL_ACCOUNTS,
  INITIAL_BRANCHES,
  INITIAL_SERVICES,
  INITIAL_REQUESTS,
  INITIAL_QUEUES,
  INITIAL_COMPLAINTS,
  INITIAL_DOCUMENTS,
  INITIAL_AUDIT_LOGS,
} from './data/seedData';
import { translations } from './utils/i18n';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('saarthi_active_user') || localStorage.getItem('setubank_active_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  const [role, setRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('saarthi_active_user') || localStorage.getItem('setubank_active_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.role) return u.role;
      }
    } catch (e) {}
    return 'CUSTOMER';
  });

  const [language, setLanguage] = useState<Language>(() => {
    try {
      const savedLang = localStorage.getItem('saarthi_language') || localStorage.getItem('setubank_language');
      if (savedLang === 'en' || savedLang === 'hi' || savedLang === 'gu') return savedLang;
      const savedUser = localStorage.getItem('saarthi_active_user') || localStorage.getItem('setubank_active_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u.preferredLanguage) return u.preferredLanguage;
      }
    } catch (e) {}
    return 'en';
  });

  const [selectedBank, setSelectedBank] = useState<string>('Janata Sahakari Bank Ltd.');
  const [activeCustomerTab, setActiveCustomerTab] = useState<string>('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Core application state
  const [accounts, setAccounts] = useState<BankAccount[]>(INITIAL_ACCOUNTS);
  const [branches, setBranches] = useState<BankBranch[]>(INITIAL_BRANCHES);
  const [services, setServices] = useState<BankingService[]>(INITIAL_SERVICES);
  const [requests, setRequests] = useState<BankingRequest[]>(INITIAL_REQUESTS);
  const [queues, setQueues] = useState<VirtualQueueToken[]>(INITIAL_QUEUES);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

  // Modals
  const [selectedServiceForModal, setSelectedServiceForModal] =
    useState<BankingService | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);

  const [sessionNotice, setSessionNotice] = useState<string | null>(null);

  const t = translations[language];

  // Inactivity tracking for banking compliance (15 minutes)
  useEffect(() => {
    if (!currentUser) return;

    let timeoutId: NodeJS.Timeout;
    const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // 15 minutes

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleLogout('Your session timed out after 15 minutes of inactivity for bank security.');
      }, INACTIVITY_LIMIT_MS);
    };

    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach((evt) => window.addEventListener(evt, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [currentUser]);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setRole(user.role);
    setSessionNotice(null);
    if (user.preferredLanguage) {
      setLanguage(user.preferredLanguage);
      try {
        localStorage.setItem('saarthi_language', user.preferredLanguage);
      } catch (e) {}
    }
    try {
      localStorage.setItem('saarthi_active_user', JSON.stringify(user));
    } catch (e) {}
  };

  const handleLogout = (reason?: string) => {
    setCurrentUser(null);
    setRole('CUSTOMER');
    setActiveCustomerTab('home');
    if (reason) {
      setSessionNotice(reason);
    }
    try {
      localStorage.removeItem('saarthi_active_user');
      localStorage.removeItem('setubank_active_user');
    } catch (e) {}
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    try {
      localStorage.setItem('saarthi_language', newLang);
    } catch (e) {}
    if (currentUser) {
      const updated = { ...currentUser, preferredLanguage: newLang };
      setCurrentUser(updated);
      try {
        localStorage.setItem('saarthi_active_user', JSON.stringify(updated));
      } catch (e) {}
    }
  };

  const handleUpdateUserPreferences = (updates: Partial<AuthUser>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    try {
      localStorage.setItem('setubank_active_user', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (currentUser) {
      const updated: AuthUser = {
        ...currentUser,
        role: newRole,
        designation:
          newRole === 'BANK_OFFICER'
            ? currentUser.designation || 'Branch Operations Officer'
            : undefined,
        employeeId:
          newRole === 'BANK_OFFICER'
            ? currentUser.employeeId || 'JSB-EMP-8841'
            : undefined,
      };
      setCurrentUser(updated);
      try {
        localStorage.setItem('setubank_active_user', JSON.stringify(updated));
      } catch (e) {}
    }
  };

  // Fetch initial state from server API or seed
  useEffect(() => {
    fetch('/api/requests')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) setRequests(res.data);
      })
      .catch(() => {});

    fetch('/api/queues')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) setQueues(res.data);
      })
      .catch(() => {});

    fetch('/api/complaints')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) setComplaints(res.data);
      })
      .catch(() => {});

    fetch('/api/audit-logs')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) setAuditLogs(res.data);
      })
      .catch(() => {});
  }, []);

  // Handlers for state updates
  const handleCreateRequest = async (newRequest: BankingRequest) => {
    setRequests((prev) => [newRequest, ...prev]);

    // Send to backend
    try {
      await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest),
      });
    } catch (e) {
      console.warn('Network sync offline, using local store');
    }
  };

  const handleUpdateRequestStatus = async (
    requestId: string,
    status: RequestStatus,
    notes?: string
  ) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            status,
            officerNotes: notes || r.officerNotes,
            updatedAt: new Date().toISOString(),
          };
        }
        return r;
      })
    );

    try {
      await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          officerNotes: notes,
          actorName: 'Suresh Rao (Officer JSB-41)',
        }),
      });
    } catch (e) {
      console.warn('Network sync offline, using local store');
    }
  };

  const handleBookQueueToken = async (newToken: VirtualQueueToken) => {
    setQueues((prev) => [...prev, newToken]);

    try {
      await fetch('/api/queues/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newToken),
      });
    } catch (e) {
      console.warn('Network sync offline, using local store');
    }
  };

  const handleUpdateQueueStatus = async (
    tokenId: string,
    status: any,
    counterNumber?: number,
    officerName?: string
  ) => {
    setQueues((prev) =>
      prev.map((q) => {
        if (q.id === tokenId) {
          return {
            ...q,
            status,
            counterNumber: counterNumber !== undefined ? counterNumber : q.counterNumber,
          };
        }
        return q;
      })
    );

    try {
      await fetch(`/api/queues/${tokenId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          counterNumber,
          officerName,
        }),
      });
    } catch (e) {
      console.warn('Network sync offline, using local store');
    }
  };

  const handleRegisterComplaint = async (newComplaint: Complaint) => {
    setComplaints((prev) => [newComplaint, ...prev]);

    try {
      await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComplaint),
      });
    } catch (e) {
      console.warn('Network sync offline, using local store');
    }
  };

  const handleUpdateComplaintStatus = async (
    complaintId: string,
    status: any,
    remarks?: string
  ) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          return {
            ...c,
            status,
            resolutionRemarks: remarks || c.resolutionRemarks,
          };
        }
        return c;
      })
    );
  };

  const handleUploadVaultDoc = (newDoc: DocumentItem) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  // If unauthenticated, show the modern Login & Registration Portal
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
        {sessionNotice && (
          <div className="bg-amber-500 text-slate-950 font-semibold px-4 py-2.5 text-xs text-center border-b border-amber-600 shadow-xs flex items-center justify-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-slate-900 animate-ping"></span>
            <span>{sessionNotice}</span>
          </div>
        )}
        <LoginPortal
          onLoginSuccess={handleLoginSuccess}
          language={language}
          onLanguageChange={handleLanguageChange}
          selectedBank={selectedBank}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navbar */}
      <Navbar
        currentRole={role}
        language={language}
        onLanguageChange={handleLanguageChange}
        selectedBank={selectedBank}
        onBankChange={setSelectedBank}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        currentUser={currentUser}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
      />

      {/* Role Notice Pill if on Officer Portal */}
      {role === 'BANK_OFFICER' && (
        <div className="bg-blue-900 text-blue-100 px-4 py-2 text-xs flex items-center justify-between border-b border-blue-800">
          <div className="flex items-center space-x-2 max-w-7xl mx-auto w-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              <strong>Bank Officer Verification Workspace Active:</strong> You are viewing live queue counters and approving customer paperless submissions for {selectedBank}.
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {role === 'CUSTOMER' ? (
          <div>
            {/* Customer Main Tab Navigation */}
            <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs mb-6 overflow-x-auto flex items-center space-x-1 text-xs">
              <button
                onClick={() => setActiveCustomerTab('home')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activeCustomerTab === 'home'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>{t.home}</span>
              </button>

              <button
                onClick={() => setActiveCustomerTab('services')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activeCustomerTab === 'services'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{t.services}</span>
              </button>

              <button
                onClick={() => setActiveCustomerTab('myRequests')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activeCustomerTab === 'myRequests'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{t.myRequests}</span>
                {requests.filter((r) => r.status !== 'APPROVED').length > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      activeCustomerTab === 'myRequests'
                        ? 'bg-white text-blue-800'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {requests.filter((r) => r.status !== 'APPROVED').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveCustomerTab('appointments')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activeCustomerTab === 'appointments'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>{t.appointments}</span>
              </button>

              <button
                onClick={() => setActiveCustomerTab('documents')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activeCustomerTab === 'documents'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FolderLock className="w-4 h-4" />
                <span>{t.documents}</span>
              </button>

              <button
                onClick={() => setActiveCustomerTab('complaints')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activeCustomerTab === 'complaints'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{t.complaints}</span>
              </button>
            </div>

            {/* Sub-Views */}
            {activeCustomerTab === 'home' && (
              <CustomerDashboard
                accounts={accounts}
                requests={requests}
                activeTokens={queues}
                language={language}
                currentUser={currentUser}
                onNavigateTab={(tab) => setActiveCustomerTab(tab)}
                onSelectService={(serviceId) => {
                  const s = services.find((x) => x.id === serviceId);
                  if (s) setSelectedServiceForModal(s);
                }}
                popularServices={services}
                onOpenAssistant={() => setIsAssistantOpen(true)}
              />
            )}

            {activeCustomerTab === 'services' && (
              <ServicesCatalog
                services={services}
                language={language}
                onSelectService={(serviceId) => {
                  const s = services.find((x) => x.id === serviceId);
                  if (s) setSelectedServiceForModal(s);
                }}
              />
            )}

            {activeCustomerTab === 'myRequests' && (
              <MyRequestsView
                requests={requests}
                language={language}
                onOpenServiceModal={() => setSelectedServiceForModal(services[0])}
              />
            )}

            {activeCustomerTab === 'appointments' && (
              <VirtualQueueView
                branches={branches}
                tokens={queues}
                language={language}
                onBookToken={handleBookQueueToken}
                onSelectOnlineService={() => setActiveCustomerTab('services')}
              />
            )}

            {activeCustomerTab === 'documents' && (
              <DocumentVaultView
                documents={documents}
                language={language}
                onUploadDoc={handleUploadVaultDoc}
              />
            )}

            {activeCustomerTab === 'complaints' && (
              <ComplaintsCenter
                complaints={complaints}
                language={language}
                onRegisterComplaint={handleRegisterComplaint}
                onOpenAssistantForDispute={() => setIsAssistantOpen(true)}
              />
            )}

            {/* Mobile Bottom Navigation for Customer Portal (Home · Services · Requests · Help) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-4 flex items-center justify-around z-30 shadow-lg">
              <button
                onClick={() => setActiveCustomerTab('home')}
                className={`flex flex-col items-center space-y-0.5 text-[10px] font-semibold transition-colors ${
                  activeCustomerTab === 'home' ? 'text-blue-700' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </button>

              <button
                onClick={() => setActiveCustomerTab('services')}
                className={`flex flex-col items-center space-y-0.5 text-[10px] font-semibold transition-colors ${
                  activeCustomerTab === 'services' ? 'text-blue-700' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Services</span>
              </button>

              <button
                onClick={() => setActiveCustomerTab('myRequests')}
                className={`flex flex-col items-center space-y-0.5 text-[10px] font-semibold transition-colors relative ${
                  activeCustomerTab === 'myRequests' ? 'text-blue-700' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Clock className="w-5 h-5" />
                <span>Requests</span>
                {requests.filter((r) => r.status !== 'APPROVED').length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-600"></span>
                )}
              </button>

              <button
                onClick={() => setIsAssistantOpen(true)}
                className="flex flex-col items-center space-y-0.5 text-[10px] font-semibold text-teal-700 hover:text-teal-900 transition-colors"
              >
                <Sparkles className="w-5 h-5" />
                <span>Help</span>
              </button>
            </div>
          </div>
        ) : (
          /* Bank Employee / Officer Portal */
          <OfficerDashboard
            requests={requests}
            queues={queues}
            complaints={complaints}
            auditLogs={auditLogs}
            branches={branches}
            currentUser={currentUser}
            onUpdateRequestStatus={handleUpdateRequestStatus}
            onUpdateQueueStatus={handleUpdateQueueStatus}
            onUpdateComplaintStatus={handleUpdateComplaintStatus}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500 mb-14 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">Saarthi</span>
            <span>• Banking, Made Simpler.</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              RBI & DPDP 2023 Compliant
            </span>
            <span>Bank Partner: {selectedBank}</span>
          </div>
        </div>
      </footer>

      {/* Service Request Paperless Form Modal */}
      {selectedServiceForModal && (
        <ServiceRequestModal
          service={selectedServiceForModal}
          accounts={accounts}
          language={language}
          onClose={() => setSelectedServiceForModal(null)}
          onSubmit={(req) => {
            handleCreateRequest(req);
          }}
        />
      )}

      {/* Sahayak AI Banking Assistant Drawer */}
      <AssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        language={language}
        onLanguageChange={setLanguage}
        role={role}
        currentUser={currentUser}
        onNavigateToService={(serviceId) => {
          setIsAssistantOpen(false);
          setActiveCustomerTab('services');
          const s = services.find((x) => x.id === serviceId);
          if (s) setSelectedServiceForModal(s);
        }}
        onNavigateToComplaints={() => {
          setIsAssistantOpen(false);
          setActiveCustomerTab('complaints');
        }}
      />

      {/* Settings & Language Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
        language={language}
        onLanguageChange={handleLanguageChange}
        onUpdateUserPreferences={handleUpdateUserPreferences}
      />
    </div>
  );
}
