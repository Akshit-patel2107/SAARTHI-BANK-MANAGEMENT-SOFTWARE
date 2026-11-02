import React, { useState } from 'react';
import {
  Ticket,
  MapPin,
  Clock,
  QrCode,
  Users,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Sparkles,
  PhoneCall,
  Volume2,
  X,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import {
  BankBranch,
  VirtualQueueToken,
  Language,
} from '../../types/banking';
import { translations } from '../../utils/i18n';
import { getEstimatedWaitTime } from '../../utils/banking';

interface VirtualQueueViewProps {
  branches: BankBranch[];
  tokens: VirtualQueueToken[];
  language: Language;
  onBookToken: (token: VirtualQueueToken) => void;
  onSelectOnlineService: () => void;
}

export const VirtualQueueView: React.FC<VirtualQueueViewProps> = ({
  branches,
  tokens,
  language,
  onBookToken,
  onSelectOnlineService,
}) => {
  const t = translations[language];

  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    branches[1]?.id || branches[0]?.id || ''
  );
  const [selectedService, setSelectedService] = useState<string>(
    'Account Services & Passbook Issue'
  );
  const [isPriority, setIsPriority] = useState<boolean>(false);
  const [notificationChannel, setNotificationChannel] = useState<'SMS' | 'WHATSAPP'>('WHATSAPP');
  const [bookingMode, setBookingMode] = useState<'NOW' | 'APPOINTMENT'>('NOW');
  const [appointmentDate, setAppointmentDate] = useState<string>('2026-11-03');
  const [appointmentSlot, setAppointmentSlot] = useState<string>('11:00 AM - 11:30 AM');
  const [showQrModal, setShowQrModal] = useState<VirtualQueueToken | null>(null);

  const selectedBranch =
    branches.find((b) => b.id === selectedBranchId) || branches[0];

  const branchTokens = tokens.filter((tok) => tok.branchId === selectedBranchId);
  const currentServing = branchTokens.find((tok) => tok.status === 'SERVING');
  const waitingTokens = branchTokens.filter((tok) => tok.status === 'WAITING');

  // Customer's own active token if any
  const myToken = tokens.find(
    (tok) =>
      tok.customerName.includes('Rajesh') &&
      (tok.status === 'WAITING' || tok.status === 'SERVING')
  );

  const handleGenerateToken = (e: React.FormEvent) => {
    e.preventDefault();

    const prefix = isPriority ? 'P' : 'B';
    const num = Math.floor(100 + Math.random() * 899);
    const tokenNumber = `${prefix}-${num}`;
    const waitMins = getEstimatedWaitTime(waitingTokens.length + 1, 7, isPriority);

    const newToken: VirtualQueueToken = {
      id: `TOK-${Date.now()}`,
      tokenNumber,
      branchId: selectedBranch.id,
      branchName: selectedBranch.name,
      serviceCategory: 'BRANCH_SERVICE',
      serviceName: selectedService,
      customerName: 'Rajesh Manubhai Patel',
      customerPhone: '+91 98250 14892',
      accountNumber: '501004829104',
      status: 'WAITING',
      bookedAt: new Date().toISOString(),
      appointmentTime:
        bookingMode === 'APPOINTMENT'
          ? `${appointmentDate} at ${appointmentSlot}`
          : undefined,
      estimatedWaitMins: waitMins,
      isPriority,
      qrCodePayload: `SETUBANK:${selectedBranch.code}:${tokenNumber}:${Date.now()}`,
    };

    onBookToken(newToken);
    setShowQrModal(newToken);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t.appointments}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Zero physical waiting in long branch queues. Get live virtual queue passes or book reserved counter appointments.
          </p>
        </div>

        {/* Paperless recommendation notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center space-x-3 text-xs text-blue-900">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Most routine services like Nominee, Address, and Cheque book can be completed online in 2 minutes!
          </span>
          <button
            onClick={onSelectOnlineService}
            className="px-2.5 py-1 bg-blue-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap hover:bg-blue-800 transition-colors"
          >
            Apply Online
          </button>
        </div>
      </div>

      {/* Live Branch Queue Display Monitor */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white">{selectedBranch.name}</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">{selectedBranch.address}</p>
          </div>

          {/* Branch Switcher */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Viewing Branch:</span>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-blue-500"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Big Live Digital Token Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {/* Box 1: Currently Serving */}
          <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center">
              <Volume2 className="w-3.5 h-3.5 mr-1 animate-pulse" />
              Now Serving at Counter
            </span>
            <div className="flex items-baseline space-x-3">
              <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                {currentServing ? currentServing.tokenNumber : 'None'}
              </span>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                Counter {currentServing?.counterNumber || 2}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate">
              {currentServing?.serviceName || 'Awaiting next customer call'}
            </p>
          </div>

          {/* Box 2: Next in Queue */}
          <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1" />
              Next in Line
            </span>
            <div className="flex items-baseline space-x-3">
              <span className="text-4xl sm:text-5xl font-black text-slate-200 font-mono tracking-tight">
                {waitingTokens[0] ? waitingTokens[0].tokenNumber : 'None'}
              </span>
              {waitingTokens[0]?.isPriority && (
                <span className="text-xs font-semibold text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded">
                  Senior Citizen Priority
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {waitingTokens.length} customers in live virtual queue
            </p>
          </div>

          {/* Box 3: Estimated Wait Time */}
          <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center">
              <Users className="w-3.5 h-3.5 mr-1" />
              Branch Capacity & Pace
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl sm:text-5xl font-black text-white">
                {selectedBranch.avgWaitMinutes}
              </span>
              <span className="text-slate-400 text-sm">mins / customer</span>
            </div>
            <p className="text-xs text-emerald-400 font-medium">
              {selectedBranch.countersAvailable} counters actively operating
            </p>
          </div>
        </div>
      </div>

      {/* Customer Token Generator & Active Pass Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Token Booking Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Generate Live Virtual Token / Counter Appointment
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Receive live position alerts on your mobile. Arrive only when your token is near!
            </p>
          </div>

          <form onSubmit={handleGenerateToken} className="space-y-4">
            {/* Booking Mode Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setBookingMode('NOW')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  bookingMode === 'NOW'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Instant Walk-In Token (Today)
              </button>
              <button
                type="button"
                onClick={() => setBookingMode('APPOINTMENT')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  bookingMode === 'APPOINTMENT'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Scheduled Appointment
              </button>
            </div>

            {/* Service Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Banking Service Required
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Account Services & Passbook Issue">
                  Account Services & Passbook Issue
                </option>
                <option value="Biometric Re-KYC Update">Biometric Re-KYC Update</option>
                <option value="Pension Services & Jeevan Pramaan">
                  Pension Services & Jeevan Pramaan Desk
                </option>
                <option value="Safe Deposit Locker Vault Access">
                  Safe Deposit Locker Vault Access
                </option>
                <option value="High-Value Cash Counter / Forex">
                  High-Value Cash Counter / Forex
                </option>
                <option value="Mudra / MSME Loan Consultation">
                  Mudra / MSME Loan Consultation
                </option>
              </select>
            </div>

            {/* Appointment Slots (if appointment mode) */}
            {bookingMode === 'APPOINTMENT' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Select Time Slot
                  </label>
                  <select
                    value={appointmentSlot}
                    onChange={(e) => setAppointmentSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="10:30 AM - 11:00 AM">10:30 AM - 11:00 AM (Low Wait)</option>
                    <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM</option>
                    <option value="02:30 PM - 03:00 PM">02:30 PM - 03:00 PM</option>
                    <option value="03:30 PM - 04:00 PM">03:30 PM - 04:00 PM</option>
                  </select>
                </div>
              </div>
            )}

            {/* Accessibility Priority Checkbox */}
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPriority}
                  onChange={(e) => setIsPriority(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 border-amber-400 focus:ring-amber-500"
                />
                <div>
                  <span className="text-xs font-bold text-amber-950 block">
                    {t.seniorCitizenPriority}
                  </span>
                  <span className="text-[11px] text-amber-800">
                    Priority ticket code (P-series) per RBI Accessibility Master Circular for citizens aged 65+ or persons with physical disabilities.
                  </span>
                </div>
              </label>
            </div>

            {/* Notification Channel Preference */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Queue Position Alerts Via
              </label>
              <div className="flex items-center space-x-4 text-xs">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="notif"
                    checked={notificationChannel === 'WHATSAPP'}
                    onChange={() => setNotificationChannel('WHATSAPP')}
                    className="text-blue-600"
                  />
                  <span>WhatsApp (+91 98250 14892)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="notif"
                    checked={notificationChannel === 'SMS'}
                    onChange={() => setNotificationChannel('SMS')}
                    className="text-blue-600"
                  />
                  <span>SMS Alerts</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center space-x-2"
            >
              <Ticket className="w-4 h-4" />
              <span>
                {bookingMode === 'NOW'
                  ? 'Generate Instant Virtual Token'
                  : 'Confirm Appointment Slot'}
              </span>
            </button>
          </form>
        </div>

        {/* Right: Your Active Token Pass Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {myToken ? (
            <div className="bg-gradient-to-b from-blue-900 to-slate-900 text-white rounded-2xl p-6 shadow-md space-y-5 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-blue-300">
                    Live Virtual Pass
                  </p>
                  <p className="text-xs text-slate-300">{myToken.branchName}</p>
                </div>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    myToken.status === 'SERVING'
                      ? 'bg-emerald-400 text-emerald-950 animate-pulse'
                      : 'bg-amber-400 text-amber-950'
                  }`}
                >
                  {myToken.status}
                </span>
              </div>

              {/* Big Token Number */}
              <div className="text-center py-2 space-y-1">
                <p className="text-5xl font-black font-mono tracking-tight text-white">
                  {myToken.tokenNumber}
                </p>
                <p className="text-xs text-slate-300">{myToken.serviceName}</p>
                {myToken.isPriority && (
                  <span className="inline-block mt-1 text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
                    Priority Senior Ticket
                  </span>
                )}
              </div>

              {/* Estimated Wait Box */}
              <div className="bg-white/10 rounded-xl p-3.5 backdrop-blur-md flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Estimated Wait:</span>
                  <strong className="text-white text-base">
                    {myToken.status === 'SERVING'
                      ? 'Proceed to Counter 2'
                      : `${myToken.estimatedWaitMins} Minutes`}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">People Ahead:</span>
                  <strong className="text-white text-base">
                    {myToken.status === 'SERVING' ? '0' : '2'}
                  </strong>
                </div>
              </div>

              {/* QR Code Pass representation */}
              <div className="bg-white p-3 rounded-xl flex items-center justify-between text-slate-900">
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase font-bold text-slate-400">
                    Self Check-In QR Pass
                  </p>
                  <p className="text-xs font-semibold">Scan at Branch Kiosk</p>
                  <p className="text-[10px] font-mono text-slate-500">
                    Passcode: #{myToken.tokenNumber.replace('-', '')}
                  </p>
                </div>
                <div className="w-16 h-16 bg-slate-100 rounded-lg border border-slate-300 flex items-center justify-center p-1">
                  <QrCode className="w-12 h-12 text-slate-900" />
                </div>
              </div>

              <p className="text-[11px] text-center text-slate-400">
                An SMS / WhatsApp alert will chime 5 minutes before your token is called.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Active Queue Token</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Select your branch and preferred service on the left to get your instant live token or book an appointment.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pop-up Modal when token is freshly booked */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Digital Token Confirmed!</h3>
              <p className="text-xs text-slate-500">{showQrModal.branchName}</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3 font-mono">
              <p className="text-4xl font-extrabold text-blue-900 tracking-tight">
                {showQrModal.tokenNumber}
              </p>
              <p className="text-xs text-slate-600 font-sans">{showQrModal.serviceName}</p>
              <div className="w-32 h-32 bg-white mx-auto rounded-lg border border-slate-300 p-2 flex items-center justify-center">
                <QrCode className="w-28 h-28 text-slate-900" />
              </div>
              <p className="text-[11px] text-slate-500 font-sans">
                Estimated wait: ~{showQrModal.estimatedWaitMins} mins
              </p>
            </div>

            <button
              onClick={() => setShowQrModal(null)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Close & View Live Queue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
