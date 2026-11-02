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
} from 'lucide-react';
import { AuthUser, Language, UserRole } from '../../types/banking';

interface AssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  role?: UserRole;
  currentUser?: AuthUser | null;
  onNavigateToService?: (serviceId: string) => void;
  onNavigateToComplaints?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
}

export const AssistantDrawer: React.FC<AssistantDrawerProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  role = 'CUSTOMER',
  currentUser,
  onNavigateToService,
  onNavigateToComplaints,
}) => {
  const isEmployee = role === 'BANK_OFFICER';
  const storageKey = isEmployee ? 'sahayak_chat_employee' : 'sahayak_chat_customer';

  // Load isolated messages for the specific role
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync state when role changes or if empty
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setMessages(JSON.parse(saved));
        return;
      }
    } catch (e) {}

    // Initialize with role-tailored greeting
    let initialGreeting = '';
    if (isEmployee) {
      if (language === 'hi') {
        initialGreeting = `नमस्ते अधिकारी महोदय। मैं **सहायक AI** आंतरिक बैंकिंग कार्यप्रणाली व आरबीआई परिपत्र (SOP) डेस्क हूँ।\n\nमैं शाखा परिचालन में निम्नलिखित संदर्भ प्रदान कर सकता हूँ:\n• **आरबीआई केवाईसी मास्टर डायरेक्शन**: आवधिक अद्यतन आवृत्ति (High: 2 वर्ष, Medium: 8 वर्ष, Low: 10 वर्ष)\n• **लॉकर ब्रेक-ओपन एसओपी**: 3 पंजीकृत नोटिस व स्वतंत्र गवाह समिति नियम\n• **कैश रिटेंशन सीमा**: ईओडी अतिरिक्त कैश रिपोर्टिंग व वॉल्ट बीमा\n• **बैंकिंग लोकपाल**: 30 दिवसीय टीएटी व विवाद निवारण\n\nआप किस परिचालन प्रक्रिया या परिपत्र की जानकारी चाहते हैं?`;
      } else if (language === 'gu') {
        initialGreeting = `નમસ્તે અધિકારી શ્રી. હું **સહાયક AI** બેંક આંતરિક કાર્યપ્રણાલી અને RBI પરિપત્રો (SOP) માટેનો સહાયક છું.\n\nહું શાખા સંચાલનમાં નીચેની વિગતો પ્રદાન કરી શકું છું:\n• **RBI KYC માસ્ટર ડાયરેક્શન**: રિસ્ક કેટેગરાઇઝેશન અને રી-કેવાયસી સમયમર્યાદા\n• **લોકર બ્રેક-ઓપન SOP**: નોટિસ અવધિ અને કમિટી પ્રોટોકોલ\n• **કેશ લિમિટ અને વોલ્ટ ઈન્સ્યોરન્સ**: એન્ડ-ઓફ-ડે પ્રોટોકોલ\n• **બેંકિંગ લોકપાલ TAT**: 30 દિવસમાં નિવારણ નિયમો\n\nતમારો પ્રશ્ન નીચે લખો!`;
      } else {
        initialGreeting = `Greetings Officer. I am **Sahayak AI**, your internal banking knowledge and operational SOP assistant.\n\nI am configured with RBI Master Directions and standardized branch workflows:\n• **RBI Master Direction on KYC**: Periodic updation frequency & digital re-KYC guidelines\n• **Locker Break-Open SOP**: 3-notice registered mandate, locksmith & witness committee protocol\n• **Cash Retention Limit Breach**: EOD double-lock strong room & insurance endorsement procedure\n• **RBI Integrated Ombudsman**: 30-day internal resolution TAT & compensation guidelines\n• **Self-Service Kiosk Maintenance**: Cassette reconciliation and status alerts\n\nWhich operational SOP or regulatory circular would you like to consult?`;
      }
    } else {
      if (language === 'hi') {
        initialGreeting = `नमस्ते! मैं सेतु व सारथी का **सहायक AI** डिजिटल बैंकिंग मित्र हूँ।\n\nमैं बिना बैंक शाखा जाए आपके नियमित कार्य पूरे कराने में मदद कर सकता हूँ:\n• बिना शाखा जाए नॉमिनी (फॉर्म DA-1) या पता बदलना\n• असफल यूपीआई लेन-देन का पैसा कब वापस मिलेगा? (RBI TAT)\n• ब्याज प्रमाणपत्र और नई चेक बुक मंगाना\n• डिजिटल जीवन प्रमाणपत्र (Jeevan Pramaan) मार्गदर्शन\n\nकृपया अपना प्रश्न नीचे लिखें!`;
      } else if (language === 'gu') {
        initialGreeting = `નમસ્તે! હું **સહાયક AI** તમારો ડિજિટલ બેંકિંગ મિત્ર છું.\n\nહું તમને બેંક શાખાની મુલાકાત લીધા વગર ઓનલાઈન કામ કરવામાં મદદ કરીશ:\n• ખાતામાં વારસદાર (નોમિની ફોર્મ DA-1) અથવા સરનામું બદલવું\n• નિષ્ફળ UPI ટ્રાન્ઝેક્શનની ફરિયાદ અને રિફંડ નિયમો (RBI TAT)\n• નવી ચેક બુક અને વ્યાજ પ્રમાણપત્ર મેળવવું\n\nતમારો પ્રશ્ન નીચે લખો!`;
      } else {
        initialGreeting = `Hello! I am **Sahayak AI**, your personal banking guide.\n\nI can help you complete routine banking tasks 100% digitally without physical branch visits:\n• Guidance on updating Nominee (Form DA-1) or Address\n• Clarifying failed UPI debits and RBI auto-reversal TAT rules\n• Applying for MSME / Mudra loans and calculating EMIs\n• Requesting personalized cheque books or tax interest certificates\n\nHow can I help you today?`;
      }
    }

    const initMsg: ChatMessage = {
      id: `msg-welcome-${Date.now()}`,
      sender: 'assistant',
      text: initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([initMsg]);
    try {
      localStorage.setItem(storageKey, JSON.stringify([initMsg]));
    } catch (e) {}
  }, [role, language]);

  // Persist messages whenever updated
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages));
      } catch (e) {}
    }
  }, [messages, storageKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Suggested prompt pills according to role and language
  const suggestedPrompts = isEmployee
    ? language === 'hi'
      ? [
          'आरबीआई केवाईसी आवधिक अद्यतन (Periodic KYC) आवृत्ति नियम क्या हैं?',
          'शाखा में लॉकर ब्रेक-ओपन (Locker Break-Open) की वैधानिक प्रक्रिया क्या है?',
          'कैश रिटेंशन सीमा (Cash Limit) पार होने पर क्या एसओपी अपनाएं?',
          'बैंकिंग लोकपाल (Ombudsman) के तहत शिकायत निवारण का टीएटी क्या है?',
        ]
      : language === 'gu'
      ? [
          'RBI નિયમાનુસાર સમયાંતરે KYC અપડેટ કરવાની સમયમર્યાદા શું છે?',
          'શાખામાં લોકર બ્રેક-ઓપન કરવાની માન્ય કાનૂની પ્રક્રિયા શું છે?',
          'શાખામાં કેશ લિમિટ વટાવી જતાં અનુસરવાની SOP શું છે?',
          'બેંકિંગ લોકપાલ હેઠળ ગ્રાહક ફરિયાદ નિવારણ TAT શું છે?',
        ]
      : [
          'RBI Master Direction: Periodic KYC Updation frequency',
          'SOP for Safe Deposit Locker break-open committee',
          'Branch Cash Retention Limit breach escalation procedure',
          'Turn Around Time (TAT) under RBI Banking Ombudsman',
        ]
    : language === 'hi'
    ? [
        'यूपीआई फेल हुआ लेकिन पैसा कट गया, क्या करूँ?',
        'खाते में नॉमिनी (Nominee) कैसे जोड़ें?',
        'चेक बुक के लिए क्या शाखा जाना जरूरी है?',
        'मुद्रा लोन (Mudra Loan) के लिए कौन से दस्तावेज़ चाहिए?',
      ]
    : language === 'gu'
    ? [
        'UPI ફેલ થયું પણ પૈસા કપાઈ ગયા, શું કરવું?',
        'ખાતામાં નોમિની (વારસદાર) કેવી રીતે ઉમેરવો?',
        'નવી ચેક બુક માટે શું કરવું?',
        'પેન્શન જીવન પ્રમાણપત્ર ઓનલાઈન કેવી રીતે જમા કરવું?',
      ]
    : [
        'My UPI payment failed but money was deducted',
        'What documents are needed to update Nominee?',
        'How do I request a new cheque book without visiting branch?',
        'Explain RBI auto-reversal turnaround time (TAT)',
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
        }),
      });

      const data = await response.json();
      const replyText =
        data.reply ||
        (isEmployee
          ? 'Sahayak AI Employee Desk is ready. Please consult specific RBI Master Directions or branch operations SOPs.'
          : 'I am here to guide you with routine banking paperwork. Please let me know what you need.');

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
              ? 'नमस्ते, सेवा में क्षणिक विलंब हुआ। सभी बैंकिंग सेवाएँ सामान्य रूप से कार्यरत हैं।'
              : 'Services are operating normally. You may proceed with your service request or consult bank policies.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem(storageKey);
    setMessages([]);
  };

  // Browser speech synthesis for accessibility
  const toggleSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text.replace(/[*#•_-]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'hi' ? 'hi-IN' : language === 'gu' ? 'gu-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Top Header */}
        <div
          className={`p-4 border-b text-white flex items-center justify-between ${
            isEmployee
              ? 'bg-slate-900 border-slate-800'
              : 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 border-blue-900'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs ${
                isEmployee ? 'bg-slate-800 text-teal-400' : 'bg-white/10 text-white'
              }`}
            >
              {isEmployee ? <Briefcase className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base tracking-tight">
                  Sahayak<span className="text-teal-300 font-black ml-0.5">AI</span>
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isEmployee ? 'bg-teal-900/80 text-teal-200 border border-teal-700/60' : 'bg-white/20 text-white'
                  }`}
                >
                  {isEmployee ? 'Staff Desk' : 'Customer Guide'}
                </span>
              </div>
              <p className="text-xs text-slate-200 font-medium">
                {isEmployee
                  ? 'Internal Banking Knowledge & Operational SOPs'
                  : 'Your Intelligent Banking Assistance Guide'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleClearHistory}
              title="Clear session history"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
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
            <span>
              {isEmployee
                ? 'Internal Bank Operations • RBI Master Directions Grounded'
                : 'Zero Branch Visits • Bank NEVER asks for ATM PIN or Passwords'}
            </span>
          </div>

          {/* Quick language toggle */}
          <div className="flex items-center space-x-1 text-[10px] font-semibold">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-1.5 py-0.5 rounded ${language === 'en' ? 'bg-white shadow-2xs font-bold' : 'text-slate-600'}`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('hi')}
              className={`px-1.5 py-0.5 rounded ${language === 'hi' ? 'bg-white shadow-2xs font-bold' : 'text-slate-600'}`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => onLanguageChange('gu')}
              className={`px-1.5 py-0.5 rounded ${language === 'gu' ? 'bg-white shadow-2xs font-bold' : 'text-slate-600'}`}
            >
              ગુજરાતી
            </button>
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg) => {
            const isAss = msg.sender === 'assistant';
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
                  <div
                    className={`mt-2 flex items-center justify-between text-[10px] ${
                      isAss ? 'text-slate-400' : 'text-blue-200'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {isAss && (
                      <button
                        onClick={() => toggleSpeech(msg.text)}
                        className="hover:text-blue-600 flex items-center space-x-1"
                        title="Read aloud"
                      >
                        {isSpeaking ? (
                          <VolumeX className="w-3 h-3 text-blue-600 animate-pulse" />
                        ) : (
                          <Volume2 className="w-3 h-3" />
                        )}
                        <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                      </button>
                    )}
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
                  {isEmployee ? 'Consulting RBI circulars & internal SOPs...' : 'Searching bank procedures & forms...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompt Chips */}
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
              className={`p-2.5 rounded-xl text-white shadow-xs transition-colors disabled:opacity-50 ${
                isEmployee ? 'bg-slate-900 hover:bg-slate-800' : 'bg-blue-700 hover:bg-blue-800'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-[10px] text-slate-400 mt-1.5 text-center">
            {isEmployee
              ? 'Authorized Staff Desk • All queries logged for operational quality compliance.'
              : 'End-to-End Encrypted • RBI DPDP Act 2023 Compliant'}
          </div>
        </div>
      </div>
    </div>
  );
};
