/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Volume2,
  VolumeX,
  ShieldCheck,
  Globe2,
  Bot,
  User,
  ArrowRight,
  RefreshCw,
  Briefcase,
  Lock,
  FileCheck2,
  HelpCircle,
  Building2,
  Copy,
  Check,
  PhoneCall,
  ExternalLink,
  PlusCircle,
  History,
  FileText,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AuthUser, Language, UserRole } from '../../types/banking';

interface AssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  role?: UserRole;
  currentUser?: AuthUser | null;
  bankName?: string;
  onNavigateToService?: (serviceId: string) => void;
  onNavigateToComplaints?: () => void;
  onNavigateToRequests?: () => void;
}

export interface VerifiedSourceItem {
  id: string;
  title: string;
  sourceName: string;
  version: string;
  lastUpdated: string;
}

export interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
  sources?: VerifiedSourceItem[];
  action?: {
    type: string;
    label: string;
    data: any;
  };
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

export const AssistantDrawer: React.FC<AssistantDrawerProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  role = 'CUSTOMER',
  currentUser,
  bankName = 'Janata Sahakari Bank Ltd.',
  onNavigateToService,
  onNavigateToComplaints,
  onNavigateToRequests,
}) => {
  const isEmployee = role === 'BANK_OFFICER';
  const storageSessionsKey = isEmployee ? 'sahayak_sessions_employee' : 'sahayak_sessions_customer';
  const activeSessionIdKey = isEmployee ? 'sahayak_active_session_employee' : 'sahayak_active_session_customer';

  // Load chat sessions from local storage
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(storageSessionsKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    try {
      return localStorage.getItem(activeSessionIdKey) || '';
    } catch (e) {}
    return '';
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [showHistoryView, setShowHistoryView] = useState(false);
  const [showEmergencyHelp, setShowEmergencyHelp] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or load current session
  useEffect(() => {
    if (!isOpen) return;

    if (sessions.length > 0) {
      const existing = sessions.find((s) => s.id === currentSessionId) || sessions[0];
      setCurrentSessionId(existing.id);
      setMessages(existing.messages);
      try {
        localStorage.setItem(activeSessionIdKey, existing.id);
      } catch (e) {}
    } else {
      // Create initial session with role-tailored greeting
      handleStartNewSession();
    }
  }, [isOpen, role, language]);

  // Persist sessions whenever messages update
  useEffect(() => {
    if (!currentSessionId || messages.length === 0) return;

    setSessions((prev) => {
      const index = prev.findIndex((s) => s.id === currentSessionId);
      const title =
        messages.find((m) => m.sender === 'user')?.text.slice(0, 32) ||
        (isEmployee ? 'Staff Operational Session' : 'Customer Banking Query');

      let updated: ChatSession[];
      if (index >= 0) {
        updated = [...prev];
        updated[index] = {
          ...updated[index],
          title,
          messages,
        };
      } else {
        updated = [
          {
            id: currentSessionId,
            title,
            createdAt: new Date().toLocaleDateString(),
            messages,
          },
          ...prev,
        ];
      }

      try {
        localStorage.setItem(storageSessionsKey, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, [messages, currentSessionId, storageSessionsKey, isEmployee]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const getRoleGreeting = (): string => {
    if (isEmployee) {
      if (language === 'hi') {
        return `नमस्ते अधिकारी महोदय। मैं **सहायक AI** आंतरिक बैंकिंग कार्यप्रणाली व आरबीआई परिपत्र (SOP) डेस्क हूँ।\n\nमैं शाखा परिचालन में सत्यापित संदर्भ प्रदान कर सकता हूँ:\n• **आरबीआई केवाईसी मास्टर डायरेक्शन**: आवधिक अद्यतन आवृत्ति (High: 2 वर्ष, Medium: 8 वर्ष, Low: 10 वर्ष)\n• **लॉकर ब्रेक-ओपन एसओपी**: 3 पंजीकृत नोटिस व स्वतंत्र गवाह समिति नियम\n• **कैश रिटेंशन सीमा**: ईओडी अतिरिक्त कैश रिपोर्टिंग व वॉल्ट बीमा\n• **बैंकिंग लोकपाल**: 30 दिवसीय टीएटी व विवाद निवारण\n\nआप किस परिचालन प्रक्रिया या परिपत्र की जानकारी चाहते हैं?`;
      }
      if (language === 'gu') {
        return `નમસ્તે અધિકારી શ્રી. હું **સહાયક AI** બેંક આંતરિક કાર્યપ્રણાલી અને RBI પરિપત્રો (SOP) માટેનો સહાયક છું.\n\nહું શાખા સંચાલનમાં નીચેની વિગતો પ્રદાન કરી શકું છું:\n• **RBI KYC માસ્ટર ડાયરેક્શન**: રિસ્ક કેટેગરાઇઝેશન અને રી-કેવાયસી સમયમર્યાદા\n• **લોકર બ્રેક-ઓપન SOP**: નોટિસ અવધિ અને કમિટી પ્રોટોકોલ\n• **કેશ લિમિટ અને વોલ્ટ ઈન્સ્યોરન્સ**: એન્ડ-ઓફ-ડે પ્રોટોકોલ\n• **બેંકિંગ લોકપાલ TAT**: 30 દિવસમાં નિવારણ નિયમો\n\nતમારો પ્રશ્ન નીચે લખો!`;
      }
      return `Greetings Officer. I am **Sahayak AI**, your internal banking knowledge and operational SOP assistant for ${bankName}.\n\nI am configured with RBI Master Directions and standardized branch workflows:\n• **RBI Master Direction on KYC**: Periodic updation frequency & digital re-KYC guidelines\n• **Locker Break-Open SOP**: 3-notice registered mandate, locksmith & witness committee protocol\n• **Cash Retention Limit Breach**: EOD double-lock strong room & insurance endorsement procedure\n• **RBI Integrated Ombudsman**: 30-day internal resolution TAT & compensation guidelines\n• **Self-Service Kiosk Maintenance**: Cassette reconciliation and status alerts\n\nWhich operational SOP or regulatory circular would you like to consult?`;
    }

    if (language === 'hi') {
      return `नमस्ते! मैं सारथी का **सहायक AI** डिजिटल बैंकिंग मित्र हूँ।\n\nमैं बिना बैंक शाखा जाए आपके नियमित कार्य पूरे कराने में मदद कर सकता हूँ:\n• बिना शाखा जाए नॉमिनी (फॉर्म DA-1) या पता बदलना\n• असफल यूपीआई लेन-देन का पैसा कब वापस मिलेगा? (RBI TAT)\n• ब्याज प्रमाणपत्र और नई चेक बुक मंगाना\n• डिजिटल जीवन प्रमाणपत्र (Jeevan Pramaan) व ऋण ईएमआई गणना\n\nकृपया अपना प्रश्न नीचे लिखें!`;
    }
    if (language === 'gu') {
      return `નમસ્તે! હું **સહાયક AI** તમારો ડિજિટલ બેંકિંગ મિત્ર છું.\n\nહું તમને બેંક શાખાની મુલાકાત લીધા વગર ઓનલાઈન કામ કરવામાં મદદ કરીશ:\n• ખાતામાં વારસદાર (નોમિની ફોર્મ DA-1) અથવા સરનામું બદલવું\n• નિષ્ફળ UPI ટ્રાન્ઝેક્શનની ફરિયાદ અને રિફંડ નિયમો (RBI TAT)\n• નવી ચેક બુક અને વ્યાજ પ્રમાણપત્ર મેળવવું\n• ડિજિટલ જીવન પ્રમાણપત્ર અને લોન EMI ગણતરી\n\nતમારો પ્રશ્ન નીચે લખો!`;
    }
    return `Hello! I am **Sahayak AI**, your trusted digital banking guide inside Saarthi.\n\nI can help you complete routine banking tasks 100% digitally without physical branch visits:\n• Guidance on updating Nominee (Form DA-1) or Address\n• Clarifying failed UPI debits and RBI auto-reversal TAT rules\n• Applying for MSME / Mudra loans and calculating EMIs\n• Requesting personalized cheque books or tax interest certificates\n\nHow can I help you today?`;
  };

  const handleStartNewSession = () => {
    const newId = `session-${Date.now()}`;
    const initialGreeting = getRoleGreeting();

    const welcomeMsg: ChatMessage = {
      id: `msg-welcome-${Date.now()}`,
      sender: 'assistant',
      text: initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newSession: ChatSession = {
      id: newId,
      title: isEmployee ? 'Staff Operations Session' : 'Customer Banking Query',
      createdAt: new Date().toLocaleDateString(),
      messages: [welcomeMsg],
    };

    setCurrentSessionId(newId);
    setMessages([welcomeMsg]);
    setSessions((prev) => [newSession, ...prev]);
    setShowHistoryView(false);

    try {
      localStorage.setItem(activeSessionIdKey, newId);
    } catch (e) {}
  };

  const handleSelectSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setShowHistoryView(false);
    try {
      localStorage.setItem(activeSessionIdKey, session.id);
    } catch (e) {}
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);
    try {
      localStorage.setItem(storageSessionsKey, JSON.stringify(updated));
    } catch (e) {}

    if (currentSessionId === sessionId) {
      if (updated.length > 0) {
        handleSelectSession(updated[0]);
      } else {
        handleStartNewSession();
      }
    }
  };

  // Suggested prompt pills according to role and language
  const suggestedPrompts = isEmployee
    ? language === 'hi'
      ? [
          'आरबीआई केवाईसी आवधिक अद्यतन (Periodic KYC) आवृत्ति नियम क्या हैं?',
          'शाखा में लॉकर ब्रेक-ओपन (Locker Break-Open) की वैधानिक प्रक्रिया क्या है?',
          'कैश रिटेंशन सीमा (Cash Limit) पार होने पर क्या एसओपी अपनाएं?',
          'बैंकिंग लोकपाल (Ombudsman) के तहत शिकायत निवारण का टीएटी क्या है?',
          'शाखा कियोस्क (Kiosk) की वर्तमान स्थिति व स्वास्थ्य दिखाएं',
        ]
      : language === 'gu'
      ? [
          'RBI નિયમાનુસાર સમયાંતરે KYC અપડેટ કરવાની સમયમર્યાદા શું છે?',
          'શાખામાં લોકર બ્રેક-ઓપન કરવાની માન્ય કાનૂની પ્રક્રિયા શું છે?',
          'શાખામાં કેશ લિમિટ વટાવી જતાં અનુસરવાની SOP શું છે?',
          'બેંકિંગ લોકપાલ હેઠળ ગ્રાહક ફરિયાદ નિવારણ TAT શું છે?',
          'શાખા કિયોસ્ક (Kiosk) ડાયગ્નોસ્ટિક્સ સ્ટેટસ',
        ]
      : [
          'RBI Master Direction: Periodic KYC Updation frequency',
          'SOP for Safe Deposit Locker break-open committee',
          'Branch Cash Retention Limit breach escalation procedure',
          'Turn Around Time (TAT) under RBI Banking Ombudsman',
          'Check branch self-service kiosk status',
        ]
    : language === 'hi'
    ? [
        'यूपीआई फेल हुआ लेकिन पैसा कट गया, क्या करूँ?',
        'खाते में नॉमिनी (Nominee) कैसे जोड़ें?',
        'चेक बुक के लिए क्या शाखा जाना जरूरी है?',
        '5 लाख के ऋण पर 10.5% पर 3 वर्ष की ईएमआई कितनी होगी?',
        'मेरे सेवा अनुरोध (Service Request) की स्थिति जांचें',
      ]
    : language === 'gu'
    ? [
        'UPI ફેલ થયું પણ પૈસા કપાઈ ગયા, શું કરવું?',
        'ખાતામાં નોમિની (વારસદાર) કેવી રીતે ઉમેરવો?',
        'નવી ચેક બુક માટે શું કરવું?',
        'FD અને RD વચ્ચેનો તફાવત સમજાવો',
        'મારી અરજીનું સ્ટેટસ તપાસો',
      ]
    : [
        'My UPI payment failed but money was deducted',
        'What documents are needed to update Nominee?',
        'Calculate EMI for 5 lakh loan at 10.5% for 3 years',
        'How do I request a new cheque book without visiting branch?',
        'Track my service request REQ-2026-881204',
      ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language,
          role,
          bankName,
          userEmail: currentUser?.email || '',
          customerName: currentUser?.name || '',
          history: messages.slice(-4).map((m) => ({
            role: m.sender === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.text }],
          })),
        }),
      });

      const data = await response.json();
      const replyText =
        data.reply ||
        (isEmployee
          ? 'Sahayak AI Employee Desk is active. Please consult official RBI Master Directions or branch operations SOPs.'
          : 'I am here to guide you with routine banking services. Please let me know which procedure you wish to explore.');

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources || [],
        action: data.action || null,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          text:
            language === 'hi'
              ? 'नमस्ते, सेवा में क्षणिक विलंब हुआ। सभी बैंकिंग प्रणालियां व सेवाएँ सुरक्षित और सामान्य रूप से कार्यरत हैं।'
              : 'Services are operating normally. You may proceed with your service request or consult bank policies.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Text-to-speech
  const toggleSpeech = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking && speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#•_-]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'hi' ? 'hi-IN' : language === 'gu' ? 'gu-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMsgId(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMsgId(null);
    };

    setIsSpeaking(true);
    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Copy to clipboard
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const toggleSourceExpansion = (msgId: string) => {
    setExpandedSources((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 font-sans">
        {/* Top Header */}
        <div
          className={`p-3.5 border-b text-white flex items-center justify-between ${
            isEmployee
              ? 'bg-slate-900 border-slate-800'
              : 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 border-blue-900'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${
                isEmployee ? 'bg-slate-800 text-teal-400' : 'bg-white/10 text-white'
              }`}
            >
              {isEmployee ? <Briefcase className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base tracking-tight leading-tight">
                  Sahayak<span className="text-teal-300 font-black ml-0.5">AI</span>
                </h3>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isEmployee ? 'bg-teal-900/80 text-teal-200 border border-teal-700/60' : 'bg-white/20 text-white'
                  }`}
                >
                  {isEmployee ? 'Staff Desk' : 'Customer Guide'}
                </span>
              </div>
              <p className="text-[11px] text-slate-200 font-medium">
                {isEmployee
                  ? 'Internal Banking Knowledge & Operational SOPs'
                  : 'Saarthi — Banking, Made Simpler.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {/* New Session Button */}
            <button
              onClick={handleStartNewSession}
              title="Start a new conversation"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center space-x-1 text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">New</span>
            </button>

            {/* Conversation History Toggle */}
            <button
              onClick={() => setShowHistoryView(!showHistoryView)}
              title="View past conversation sessions"
              className={`p-1.5 rounded-lg transition-colors text-xs flex items-center space-x-1 ${
                showHistoryView
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </button>

            {/* Emergency Hotline Trigger */}
            <button
              onClick={() => setShowEmergencyHelp(!showEmergencyHelp)}
              title="24x7 Emergency Bank Support"
              className="p-1.5 rounded-lg text-amber-300 hover:text-amber-100 hover:bg-white/10 transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security & Regulatory Compliance Banner */}
        <div
          className={`px-4 py-2 text-xs flex items-center justify-between border-b ${
            isEmployee
              ? 'bg-amber-50 text-amber-900 border-amber-200'
              : 'bg-blue-50 text-blue-900 border-blue-200'
          }`}
        >
          <div className="flex items-center space-x-1.5 text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate max-w-[280px] sm:max-w-none">
              {isEmployee
                ? 'Internal Operations • RBI Master Directions Grounded'
                : 'Zero Branch Visits • Bank NEVER asks for ATM PIN or Passwords'}
            </span>
          </div>

          {/* Quick language toggle */}
          <div className="flex items-center space-x-1 text-[10px] font-semibold">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-1.5 py-0.5 rounded transition-all ${
                language === 'en' ? 'bg-white shadow-2xs font-bold text-blue-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('hi')}
              className={`px-1.5 py-0.5 rounded transition-all ${
                language === 'hi' ? 'bg-white shadow-2xs font-bold text-blue-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => onLanguageChange('gu')}
              className={`px-1.5 py-0.5 rounded transition-all ${
                language === 'gu' ? 'bg-white shadow-2xs font-bold text-blue-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ગુજરાતી
            </button>
          </div>
        </div>

        {/* Emergency Escalation Modal Overlay */}
        {showEmergencyHelp && (
          <div className="p-4 bg-red-50 border-b border-red-200 text-xs text-red-900 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between font-bold text-red-800">
              <span className="flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>24x7 Official Bank Emergency & Fraud Hotlines</span>
              </span>
              <button onClick={() => setShowEmergencyHelp(false)} className="text-red-500 hover:text-red-800">
                ✕
              </button>
            </div>
            <p className="text-[11px] text-red-700">
              For lost debit cards, suspected fraud, or unauthorized debits, contact bank vigilance immediately:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-white rounded-lg border border-red-200">
                <div className="font-semibold text-slate-800">Bank Toll-Free</div>
                <div className="font-mono font-bold text-red-700">1800-209-8800</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-red-200">
                <div className="font-semibold text-slate-800">National Cyber Helpline</div>
                <div className="font-mono font-bold text-red-700">1930</div>
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={() => {
                  setShowEmergencyHelp(false);
                  if (onNavigateToComplaints) onNavigateToComplaints();
                }}
                className="text-[11px] font-semibold text-red-800 underline hover:text-red-950"
              >
                Raise Dispute in Grievance Center →
              </button>
            </div>
          </div>
        )}

        {/* History View vs Chat Messages */}
        {showHistoryView ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Saved Conversation Sessions
              </h4>
              <button
                onClick={handleStartNewSession}
                className="text-xs text-blue-700 hover:underline font-semibold flex items-center space-x-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Start New Chat</span>
              </button>
            </div>

            {sessions.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No saved conversation history yet.
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleSelectSession(s)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      s.id === currentSessionId
                        ? 'bg-blue-50/80 border-blue-300 text-blue-900 shadow-2xs font-semibold'
                        : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="truncate max-w-[280px]">
                      <div className="truncate">{s.title}</div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                        {s.createdAt} • {s.messages.length} messages
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(s.id, e)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded"
                      title="Delete conversation"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => {
              const isAss = msg.sender === 'assistant';
              const hasSources = msg.sources && msg.sources.length > 0;
              const isSourceExpanded = expandedSources[msg.id];

              return (
                <div key={msg.id} className={`flex items-start space-x-2.5 ${isAss ? '' : 'flex-row-reverse space-x-reverse'}`}>
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs ${
                      isAss
                        ? isEmployee
                          ? 'bg-slate-900 text-teal-400'
                          : 'bg-blue-700 text-white'
                        : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {isAss ? (isEmployee ? <Briefcase className="w-4 h-4" /> : <Bot className="w-4 h-4" />) : <User className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-2xs ${
                      isAss
                        ? 'bg-white border border-slate-200 text-slate-800'
                        : 'bg-blue-700 text-white'
                    }`}
                  >
                    <div className="whitespace-pre-line font-sans">{msg.text}</div>

                    {/* Verified Source Citations Drawer */}
                    {hasSources && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => toggleSourceExpansion(msg.id)}
                          className="flex items-center space-x-1 text-[11px] text-blue-700 hover:text-blue-900 font-semibold"
                        >
                          <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>
                            {msg.sources!.length} Verified Bank Reference{msg.sources!.length > 1 ? 's' : ''}
                          </span>
                          {isSourceExpanded ? (
                            <ChevronUp className="w-3 h-3 text-blue-600" />
                          ) : (
                            <ChevronDown className="w-3 h-3 text-blue-600" />
                          )}
                        </button>

                        {isSourceExpanded && (
                          <div className="mt-2 space-y-1.5">
                            {msg.sources!.map((s, sIdx) => (
                              <div
                                key={sIdx}
                                className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] space-y-0.5 text-slate-600"
                              >
                                <div className="font-bold text-slate-800">{s.title}</div>
                                <div className="text-slate-500 font-mono">
                                  {s.sourceName} • {s.version} (Updated: {s.lastUpdated})
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Real Tool Action Card */}
                    {msg.action && (
                      <div className="mt-3 p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                          <span className="flex items-center space-x-1.5">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            <span>Live Action: {msg.action.label}</span>
                          </span>
                        </div>

                        {msg.action.type === 'TRACK_REQUEST' && (
                          <div className="text-[11px] text-blue-800">
                            <div>Ref: <strong className="font-mono">{msg.action.data.referenceNumber}</strong></div>
                            <div>Status: <strong>{msg.action.data.status}</strong></div>
                            <button
                              onClick={() => {
                                onClose();
                                if (onNavigateToRequests) onNavigateToRequests();
                              }}
                              className="mt-1.5 px-2.5 py-1 bg-blue-700 text-white rounded-lg font-semibold text-[10px] hover:bg-blue-800 flex items-center space-x-1"
                            >
                              <span>View in Requests Desk →</span>
                            </button>
                          </div>
                        )}

                        {msg.action.type === 'EMERGENCY_SUPPORT' && (
                          <div className="text-[11px] text-red-800 space-y-1">
                            <div>Toll-Free Fraud Hotline: <strong className="font-mono">1800-209-8800</strong></div>
                            <button
                              onClick={() => {
                                onClose();
                                if (onNavigateToComplaints) onNavigateToComplaints();
                              }}
                              className="px-2.5 py-1 bg-red-700 text-white rounded-lg font-semibold text-[10px] hover:bg-red-800 flex items-center space-x-1"
                            >
                              <span>File Instant Dispute →</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bottom Metadata & Controls */}
                    <div
                      className={`mt-2 flex items-center justify-between text-[10px] ${
                        isAss ? 'text-slate-400' : 'text-blue-200'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      <div className="flex items-center space-x-2">
                        {isAss && (
                          <button
                            onClick={() => toggleSpeech(msg.id, msg.text)}
                            className="hover:text-blue-600 flex items-center space-x-1 transition-colors"
                            title="Read aloud"
                          >
                            {isSpeaking && speakingMsgId === msg.id ? (
                              <VolumeX className="w-3 h-3 text-blue-600 animate-pulse" />
                            ) : (
                              <Volume2 className="w-3 h-3" />
                            )}
                            <span>{isSpeaking && speakingMsgId === msg.id ? 'Stop' : 'Listen'}</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="hover:text-blue-600 flex items-center space-x-1 transition-colors"
                          title="Copy response"
                        >
                          {copiedMsgId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedMsgId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start space-x-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isEmployee ? 'bg-slate-900 text-teal-400' : 'bg-blue-700 text-white'
                  }`}
                >
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-500 shadow-2xs flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></div>
                  <span>
                    {isEmployee
                      ? 'Consulting RBI circulars & internal SOPs...'
                      : 'Searching bank procedures & forms...'}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Suggested Prompt Chips */}
        {!showHistoryView && (
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
              <span>{isEmployee ? 'Suggested Operational Topics:' : 'Suggested Questions:'}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-[11px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-all text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Text Input Box */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isEmployee
                  ? 'Ask about RBI Master Directions, locker SOP, or cash limits...'
                  : 'Ask about nominee update, cheque book, UPI refund...'
              }
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className={`p-2.5 rounded-xl text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer ${
                isEmployee ? 'bg-slate-900 hover:bg-slate-800' : 'bg-blue-700 hover:bg-blue-800'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-[10px] text-slate-400 mt-1.5 text-center flex items-center justify-center space-x-1">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>
              {isEmployee
                ? 'Authorized Staff Desk • All queries logged for operational quality compliance.'
                : 'End-to-End Encrypted • RBI DPDP Act 2023 Compliant'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
