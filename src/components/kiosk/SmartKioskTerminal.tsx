/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  X,
  CreditCard,
  FileText,
  Printer,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Smartphone,
  ScanLine,
  ArrowRight,
  Sparkles,
  Search,
  Check,
  Radio,
  Building2,
} from 'lucide-react';
import { Language } from '../../types/banking';
import { SahayakLogo } from '../common/SahayakLogo';

interface SmartKioskTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  bankName?: string;
  defaultLanguage?: Language;
}

export const SmartKioskTerminal: React.FC<SmartKioskTerminalProps> = ({
  isOpen,
  onClose,
  bankName = 'Janata Sahakari Bank Ltd.',
  defaultLanguage = 'en',
}) => {
  const [kioskLang, setKioskLang] = useState<Language>(defaultLanguage);
  // Views: 'HOME' | 'PASSBOOK' | 'CHEQUE_DROP' | 'NFC_CHEQUE' | 'TRACK' | 'CASH_RECYCLER' | 'SUCCESS'
  const [view, setView] = useState<
    'HOME' | 'PASSBOOK' | 'CHEQUE_DROP' | 'NFC_CHEQUE' | 'TRACK' | 'CASH_RECYCLER' | 'SUCCESS'
  >('HOME');

  // 60-Second Inactivity Security Timer for Public Terminals
  const [inactivitySeconds, setInactivitySeconds] = useState(60);

  // Workflow states
  const [passbookProgress, setPassbookProgress] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);
  const [passbookDone, setPassbookDone] = useState(false);

  // Cheque Drop states
  const [chequeAcc, setChequeAcc] = useState('501004829104');
  const [chequeAmt, setChequeAmt] = useState('15000');
  const [chequeNo, setChequeNo] = useState('000412');
  const [chequeScanning, setChequeScanning] = useState(false);
  const [chequeAckSlip, setChequeAckSlip] = useState<string | null>(null);

  // NFC Cheque Book states
  const [nfcTapped, setNfcTapped] = useState(false);
  const [nfcVerifying, setNfcVerifying] = useState(false);
  const [nfcTokenCode, setNfcTokenCode] = useState<string | null>(null);

  // Tracking states
  const [trackInput, setTrackInput] = useState('REQ-2026-881204');
  const [trackResult, setTrackResult] = useState<any | null>(null);

  // Inactivity countdown effect
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setInactivitySeconds((prev) => {
        if (prev <= 1) {
          // Reset session completely for public privacy
          handleResetSession();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, view]);

  const handleUserActivity = () => {
    setInactivitySeconds(60);
  };

  const handleResetSession = () => {
    setView('HOME');
    setInactivitySeconds(60);
    setPassbookProgress(0);
    setIsPrinting(false);
    setPassbookDone(false);
    setChequeScanning(false);
    setChequeAckSlip(null);
    setNfcTapped(false);
    setNfcVerifying(false);
    setNfcTokenCode(null);
    setTrackResult(null);
  };

  // Passbook printing simulation
  const handleStartPassbookPrint = () => {
    setIsPrinting(true);
    setPassbookProgress(10);

    const step1 = setTimeout(() => setPassbookProgress(45), 1000);
    const step2 = setTimeout(() => setPassbookProgress(80), 2200);
    const step3 = setTimeout(() => {
      setPassbookProgress(100);
      setIsPrinting(false);
      setPassbookDone(true);
    }, 3200);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
    };
  };

  // Cheque drop simulation
  const handleScanCheque = () => {
    setChequeScanning(true);
    setTimeout(() => {
      setChequeScanning(false);
      setChequeAckSlip(`ACK-${Date.now().toString().slice(-6)}`);
    }, 2000);
  };

  // NFC tap simulation
  const handleSimulateNfcTap = () => {
    setNfcTapped(true);
    setNfcVerifying(true);
    setTimeout(() => {
      setNfcVerifying(false);
      setNfcTokenCode(`NFC-DISP-${Math.floor(100000 + Math.random() * 900000)}`);
    }, 1800);
  };

  // Track lookup simulation
  const handleLookupRequest = () => {
    setTrackResult({
      refNumber: trackInput || 'REQ-2026-881204',
      service: 'Add / Update Account Nominee (Form DA-1)',
      customerName: 'Rajesh Manubhai Patel (•••• 9104)',
      status: 'PENDING APPROVAL',
      branch: 'Navrangpura Commerce Branch',
      submittedDate: '01 Nov 2026, 11:20 AM',
      slaDue: '02 Nov 2026 (Within 24h SLA)',
      officerNote: 'Aadhaar e-consent verified. Counter 2 officer reviewing document signature.',
    });
  };

  if (!isOpen) return null;

  return (
    <div
      onMouseMove={handleUserActivity}
      onClick={handleUserActivity}
      onKeyDown={handleUserActivity}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none animate-in fade-in duration-200"
    >
      {/* Outer Kiosk Machine Enclosure */}
      <div className="bg-slate-900 border-4 border-slate-700 rounded-3xl shadow-2xl max-w-4xl w-full h-[92vh] max-h-[820px] flex flex-col overflow-hidden text-white relative">
        {/* Kiosk Bezel Top Header */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-100 flex items-center space-x-2">
                <span>Smart Banking Self-Service Kiosk #1</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                  ONLINE • KSK-01-LOBBY
                </span>
              </div>
              <div className="text-[11px] text-slate-400">{bankName} • 24x7 e-Lobby</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* 60s Session Privacy Timer */}
            <div className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700 text-xs text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Session Reset in <strong className="font-mono">{inactivitySeconds}s</strong></span>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center space-x-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setKioskLang('en')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  kioskLang === 'en' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setKioskLang('hi')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  kioskLang === 'hi' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setKioskLang('gu')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  kioskLang === 'gu' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                ગુજરાતી
              </button>
            </div>

            {/* Close Simulator */}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Kiosk Simulator"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* High-Contrast Interactive Touchscreen Content */}
        <div className="flex-1 bg-slate-900 overflow-y-auto p-6 flex flex-col justify-between">
          {/* SCREEN 1: KIOSK MAIN MENU */}
          {view === 'HOME' && (
            <div className="space-y-6">
              <div className="text-center space-y-1.5 pt-2">
                <span className="text-xs uppercase tracking-widest text-blue-400 font-bold">
                  {kioskLang === 'hi'
                    ? 'स्वयं-सेवा बैंकिंग टर्मिनल'
                    : kioskLang === 'gu'
                    ? 'સેલ્ફ-સર્વિસ બેંકિંગ ટર્મિનલ'
                    : 'Touch-Enabled Self-Service Banking Terminal'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {kioskLang === 'hi'
                    ? 'कृपया अपनी बैंकिंग सेवा चुनें'
                    : kioskLang === 'gu'
                    ? 'કૃપા કરીને આપની સેવા પસંદ કરો'
                    : 'Select Your Banking Service'}
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">
                  Instant, paperless routine banking operations without waiting at teller counters.
                </p>
              </div>

              {/* Touchscreen Grid Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {/* Tile 1: Print Passbook */}
                <div
                  onClick={() => setView('PASSBOOK')}
                  className="bg-slate-800 hover:bg-slate-750 border-2 border-slate-700 hover:border-blue-500 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between space-y-3 group shadow-md"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Printer className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">
                      {kioskLang === 'hi' ? 'पासबुक प्रिंटिंग' : kioskLang === 'gu' ? 'પાસબુક પ્રિન્ટિંગ' : 'Print Passbook'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Insert passbook with barcode facing up. Auto-detects line and prints pending transactions.
                    </p>
                  </div>
                  <div className="text-xs text-blue-400 font-semibold flex items-center justify-between pt-2 border-t border-slate-700">
                    <span>Touch to start →</span>
                    <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">Optical Scan</span>
                  </div>
                </div>

                {/* Tile 2: Smart Cheque Drop Box */}
                <div
                  onClick={() => setView('CHEQUE_DROP')}
                  className="bg-slate-800 hover:bg-slate-750 border-2 border-slate-700 hover:border-emerald-500 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between space-y-3 group shadow-md"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">
                      {kioskLang === 'hi' ? 'चेक ड्रॉप बॉक्स (डिजिटल रसीद)' : kioskLang === 'gu' ? 'ચેક ડિપોઝિટ ડ્રોપ બોક્સ' : 'Smart Cheque Deposit'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Scans CTS-2010 MICR band, captures high-res image, and prints instant timestamped receipt.
                    </p>
                  </div>
                  <div className="text-xs text-emerald-400 font-semibold flex items-center justify-between pt-2 border-t border-slate-700">
                    <span>Touch to deposit →</span>
                    <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">MICR CTS-2010</span>
                  </div>
                </div>

                {/* Tile 3: NFC Cheque Book Dispense Concept */}
                <div
                  onClick={() => setView('NFC_CHEQUE')}
                  className="bg-slate-800 hover:bg-slate-750 border-2 border-slate-700 hover:border-indigo-500 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between space-y-3 group shadow-md"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Radio className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-base text-white">NFC Cheque Book Auth</h3>
                      <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded">Concept Demo</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Tap contactless card or branch NFC token for authorized cheque book dispatch verification.
                    </p>
                  </div>
                  <div className="text-xs text-indigo-400 font-semibold flex items-center justify-between pt-2 border-t border-slate-700">
                    <span>Tap Card & Verify →</span>
                    <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">NFC ISO-14443</span>
                  </div>
                </div>

                {/* Tile 4: Track Service Request */}
                <div
                  onClick={() => setView('TRACK')}
                  className="bg-slate-800 hover:bg-slate-750 border-2 border-slate-700 hover:border-amber-500 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between space-y-3 group shadow-md"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">
                      {kioskLang === 'hi' ? 'आवेदन स्थिति जांचें' : kioskLang === 'gu' ? 'અરજી સ્ટેટસ તપાસો' : 'Track Application Status'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Enter your mobile number or 10-digit application reference to view live bank officer verification.
                    </p>
                  </div>
                  <div className="text-xs text-amber-400 font-semibold flex items-center justify-between pt-2 border-t border-slate-700">
                    <span>Touch to track →</span>
                    <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">Live Status</span>
                  </div>
                </div>

                {/* Tile 5: Cash Recycler & Note Feeder Diagnostic */}
                <div
                  onClick={() => setView('CASH_RECYCLER')}
                  className="bg-slate-800 hover:bg-slate-750 border-2 border-slate-700 hover:border-teal-500 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between space-y-3 group shadow-md"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-base text-white">Cash Recycler Status</h3>
                      <span className="bg-teal-500/30 text-teal-300 text-[10px] font-bold px-2 py-0.5 rounded">Hardware Note</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      View cash deposit note validator health, INR 500/100 cassette balancing, and counterfeit rejection standards.
                    </p>
                  </div>
                  <div className="text-xs text-teal-400 font-semibold flex items-center justify-between pt-2 border-t border-slate-700">
                    <span>View Cash Recycler →</span>
                    <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">RBI Cassette SOP</span>
                  </div>
                </div>

                {/* Tile 6: Saarthi AI Audio Guide */}
                <div
                  onClick={() => {
                    setView('TRACK');
                    setTrackInput('FAQ: How do I change nominee?');
                  }}
                  className="bg-slate-800 hover:bg-slate-750 border-2 border-slate-700 hover:border-purple-500 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between space-y-3 group shadow-md"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">Voice & Kiosk Help</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Sahayak AI voice-guided step-by-step assistance in English, Hindi, and Gujarati for lobby visitors.
                    </p>
                  </div>
                  <div className="text-xs text-purple-400 font-semibold flex items-center justify-between pt-2 border-t border-slate-700">
                    <span>Audio Assistance →</span>
                    <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">Accessibility</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: PASSBOOK PRINTING SIMULATOR */}
          {view === 'PASSBOOK' && (
            <div className="max-w-xl mx-auto w-full space-y-6 animate-in zoom-in-95 duration-150">
              <div className="text-center space-y-1">
                <h3 className="text-2xl font-bold text-white">Smart Passbook Printing Unit</h3>
                <p className="text-slate-400 text-xs">
                  Place your opened physical passbook into the slot below.
                </p>
              </div>

              <div className="bg-slate-800 border-2 border-slate-700 rounded-2xl p-6 space-y-5 text-center">
                {/* Physical passbook graphic */}
                <div className="w-48 h-32 mx-auto bg-amber-100 text-slate-900 rounded-lg shadow-inner border-2 border-amber-300 p-3 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex justify-between items-start text-[10px] font-bold">
                    <span>{bankName}</span>
                    <span className="font-mono">•••• 9104</span>
                  </div>
                  <div className="text-center font-mono text-xs font-semibold text-slate-700">
                    PASSBOOK / पासबुक
                  </div>
                  {/* Barcode representation */}
                  <div className="h-4 bg-slate-800 mx-2 rounded-xs opacity-75"></div>
                </div>

                {!passbookDone ? (
                  <div className="space-y-4">
                    {isPrinting ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-300 font-medium">
                          <span>Printing pending transactions...</span>
                          <span className="font-mono">{passbookProgress}%</span>
                        </div>
                        <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${passbookProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Optical sensor aligned to Line 14. Printing 4 new entries.
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={handleStartPassbookPrint}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
                      >
                        Insert Passbook & Print Entries
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl space-y-2 text-emerald-300">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
                    <div className="font-bold text-sm">Passbook Updated Successfully!</div>
                    <p className="text-xs text-emerald-200">
                      4 transactions printed up to 02-Nov-2026. Please collect your passbook from the tray.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleResetSession}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  ← Back to Main Menu
                </button>
                {passbookDone && (
                  <button
                    onClick={handleResetSession}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                  >
                    Finish Session
                  </button>
                )}
              </div>
            </div>
          )}

          {/* SCREEN 3: SMART CHEQUE DROP BOX */}
          {view === 'CHEQUE_DROP' && (
            <div className="max-w-xl mx-auto w-full space-y-6 animate-in zoom-in-95 duration-150">
              <div className="text-center space-y-1">
                <h3 className="text-2xl font-bold text-white">Smart Cheque Deposit Unit</h3>
                <p className="text-slate-400 text-xs">
                  Deposit CTS-2010 cheques with instant optical MICR scan & printed receipt.
                </p>
              </div>

              <div className="bg-slate-800 border-2 border-slate-700 rounded-2xl p-6 space-y-4">
                {!chequeAckSlip ? (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Beneficiary Account Number</label>
                        <input
                          type="text"
                          value={chequeAcc}
                          onChange={(e) => setChequeAcc(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Cheque Number (6 digits)</label>
                          <input
                            type="text"
                            value={chequeNo}
                            onChange={(e) => setChequeNo(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Cheque Amount (INR)</label>
                          <input
                            type="text"
                            value={chequeAmt}
                            onChange={(e) => setChequeAmt(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl flex items-center space-x-3 text-xs text-slate-300">
                      <ScanLine className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>Insert signed cheque face up into feeder slot. Back of cheque must contain account number & mobile.</span>
                    </div>

                    <button
                      onClick={handleScanCheque}
                      disabled={chequeScanning}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all disabled:opacity-50"
                    >
                      {chequeScanning ? 'Scanning CTS-2010 MICR Band...' : 'Insert & Scan Cheque'}
                    </button>
                  </div>
                ) : (
                  <div className="p-5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl space-y-3 text-emerald-200">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <div className="text-center font-bold text-base text-white">
                      Cheque Deposited Successfully
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700 text-xs font-mono space-y-1 text-slate-300">
                      <div>Acknowledgment Slip: <strong className="text-white">{chequeAckSlip}</strong></div>
                      <div>Cheque No: {chequeNo} | Amount: ₹{Number(chequeAmt).toLocaleString('en-IN')}</div>
                      <div>Account: •••• •••• {chequeAcc.slice(-4)}</div>
                      <div>CTS Clearing Cycle: T+1 Clearing (Expected credit by tomorrow)</div>
                    </div>
                    <p className="text-[11px] text-center text-emerald-400">
                      A physical printed receipt has been generated. Confirmation SMS sent to your registered mobile.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleResetSession}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  ← Back to Main Menu
                </button>
                {chequeAckSlip && (
                  <button
                    onClick={handleResetSession}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                  >
                    Finish Session
                  </button>
                )}
              </div>
            </div>
          )}

          {/* SCREEN 4: NFC CHEQUE BOOK CONCEPT DEMO */}
          {view === 'NFC_CHEQUE' && (
            <div className="max-w-xl mx-auto w-full space-y-6 animate-in zoom-in-95 duration-150">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center space-x-1.5 bg-indigo-500/20 text-indigo-300 text-xs px-3 py-1 rounded-full border border-indigo-500/30">
                  <Radio className="w-3.5 h-3.5" />
                  <span>NFC Contactless Authentication Concept</span>
                </div>
                <h3 className="text-2xl font-bold text-white">NFC Cheque Book Authorization</h3>
                <p className="text-slate-400 text-xs">
                  Demonstrates secure contactless token identification for instant cheque book dispatch authorization.
                </p>
              </div>

              <div className="bg-slate-800 border-2 border-slate-700 rounded-2xl p-6 space-y-5 text-center">
                {!nfcTokenCode ? (
                  <div className="space-y-4">
                    <div className="w-24 h-24 mx-auto rounded-full bg-indigo-500/10 border-2 border-dashed border-indigo-500/40 flex items-center justify-center text-indigo-400 animate-pulse">
                      <Radio className="w-10 h-10" />
                    </div>
                    <p className="text-xs text-slate-300 max-w-sm mx-auto">
                      Hold your EMV contactless debit card or branch-issued NFC key fob against the designated reader pad.
                    </p>

                    <button
                      onClick={handleSimulateNfcTap}
                      disabled={nfcVerifying}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all disabled:opacity-50"
                    >
                      {nfcVerifying ? 'Verifying NFC Card Token with Bank Server...' : 'Simulate Contactless NFC Card Tap'}
                    </button>
                  </div>
                ) : (
                  <div className="p-5 bg-indigo-950/60 border border-indigo-500/40 rounded-xl space-y-3 text-indigo-200">
                    <CheckCircle2 className="w-8 h-8 text-indigo-400 mx-auto" />
                    <div className="text-center font-bold text-base text-white">
                      NFC Authorization Verified
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700 text-xs font-mono space-y-1 text-slate-300 text-left">
                      <div>Auth Token: <strong className="text-emerald-400">{nfcTokenCode}</strong></div>
                      <div>Card Holder: Rajesh Manubhai Patel (•••• 9104)</div>
                      <div>CTS Cheque Package: 25 Leaves Personalized</div>
                      <div>Dispatch Status: Verified & Approved for Counter / Kiosk Dispenser</div>
                    </div>
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[11px] text-amber-300 text-left">
                      ⚠️ <strong>Architecture Notice:</strong> In accordance with RBI guidelines, no sensitive banking data is stored on NFC tags. Actual automated cheque book dispensing requires an approved hardware dispenser integration.
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleResetSession}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  ← Back to Main Menu
                </button>
                {nfcTokenCode && (
                  <button
                    onClick={handleResetSession}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
                  >
                    Finish Session
                  </button>
                )}
              </div>
            </div>
          )}

          {/* SCREEN 5: TRACK SERVICE REQUEST ON KIOSK */}
          {view === 'TRACK' && (
            <div className="max-w-xl mx-auto w-full space-y-6 animate-in zoom-in-95 duration-150">
              <div className="text-center space-y-1">
                <h3 className="text-2xl font-bold text-white">Kiosk Request Tracker</h3>
                <p className="text-slate-400 text-xs">
                  Enter your 10-digit application reference to check live branch verification status.
                </p>
              </div>

              <div className="bg-slate-800 border-2 border-slate-700 rounded-2xl p-6 space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={trackInput}
                    onChange={(e) => setTrackInput(e.target.value.toUpperCase())}
                    placeholder="e.g. REQ-2026-881204"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono"
                  />
                  <button
                    onClick={handleLookupRequest}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs"
                  >
                    Lookup
                  </button>
                </div>

                {trackResult && (
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 space-y-3 text-xs text-left">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-white text-sm">{trackResult.service}</span>
                      <span className="bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        {trackResult.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px]">
                      <div>Reference: <span className="font-mono text-white">{trackResult.refNumber}</span></div>
                      <div>Submitted: {trackResult.submittedDate}</div>
                      <div>Branch: {trackResult.branch}</div>
                      <div>SLA Due: {trackResult.slaDue}</div>
                    </div>

                    <div className="p-2.5 bg-slate-800 rounded-lg text-slate-300 text-[11px]">
                      <strong>Officer Note:</strong> {trackResult.officerNote}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleResetSession}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  ← Back to Main Menu
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 6: CASH RECYCLER STATUS */}
          {view === 'CASH_RECYCLER' && (
            <div className="max-w-xl mx-auto w-full space-y-6 animate-in zoom-in-95 duration-150">
              <div className="text-center space-y-1">
                <h3 className="text-2xl font-bold text-white">Cash Recycler Module Diagnostics</h3>
                <p className="text-slate-400 text-xs">
                  Hardware diagnostic view of the automated currency acceptor and note cassettes.
                </p>
              </div>

              <div className="bg-slate-800 border-2 border-slate-700 rounded-2xl p-5 space-y-4 text-xs text-slate-300">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 space-y-1">
                    <div className="font-bold text-white">Cassette A (₹500 Notes)</div>
                    <div className="text-emerald-400 font-mono font-bold text-sm">412 Notes (₹2,06,000)</div>
                    <div className="text-[10px] text-slate-400">Capacity: 41% • Status: OPERATIONAL</div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 space-y-1">
                    <div className="font-bold text-white">Cassette B (₹100 Notes)</div>
                    <div className="text-amber-400 font-mono font-bold text-sm">89 Notes (₹8,900)</div>
                    <div className="text-[10px] text-amber-400">Capacity: 9% • REPLENISH ADVISED</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 space-y-2">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>Optical Validation & Counterfeit Rejector</span>
                    <span className="text-emerald-400 font-bold text-[10px]">Passes RBI Clean Note Policy</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Certified note detector module checks magnetic ink, UV watermark, and infrared thread alignment. Reject bin current count: 3 notes.
                  </p>
                </div>

                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-[11px] text-blue-300">
                  ℹ️ <strong>MVP Integration Boundary:</strong> Live cash dispensing and deposit transactions require certified physical cash recycler hardware (Diebold / NCR / Wincor) and core banking HSM keys.
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleResetSession}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  ← Back to Main Menu
                </button>
              </div>
            </div>
          )}

          {/* Kiosk Bottom Regulatory Footer */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Saarthi Kiosk OS • RBI Cyber Security & Clean Note Compliant</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleResetSession}
                className="hover:text-amber-400 transition-colors flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear & Reset Terminal</span>
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Exit Kiosk Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
