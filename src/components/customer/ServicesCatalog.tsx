import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  FileCheck,
  Building,
  Sparkles,
} from 'lucide-react';
import { BankingService, Language, ServiceCategory } from '../../types/banking';
import { translations } from '../../utils/i18n';

interface ServicesCatalogProps {
  services: BankingService[];
  language: Language;
  onSelectService: (serviceId: string) => void;
}

export const ServicesCatalog: React.FC<ServicesCatalogProps> = ({
  services,
  language,
  onSelectService,
}) => {
  const t = translations[language];
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'ALL', label: 'All Services' },
    { id: 'ACCOUNT', label: 'Account Services' },
    { id: 'KYC', label: 'KYC & Verification' },
    { id: 'LOAN', label: 'Loan Services & EMI' },
    { id: 'DEPOSIT_CERTIFICATE', label: 'Certificates & TDS' },
    { id: 'OTHER', label: 'Pension & Locker' },
  ];

  const filteredServices = services.filter((srv) => {
    const matchesCategory =
      selectedCategory === 'ALL' || srv.category === selectedCategory;
    const matchesSearch =
      srv.title[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.description[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.requiredDocuments.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Catalog Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {t.services} (100% Paperless Digital Center)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Submit legally recognized banking requests directly to your branch without queueing
              up or filling physical paper slips.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-2 border-t border-slate-100">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-700 text-white shadow-xs font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {service.category.replace('_', ' ')}
                </span>
                <span className="text-[11px] font-bold text-blue-700 flex items-center bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
                  <Clock className="w-3 h-3 mr-1" />
                  {service.estimatedDays === 0
                    ? 'Instant'
                    : `${service.estimatedDays} Day TAT`}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {service.title[language]}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {service.description[language]}
                </p>
              </div>

              {/* Required Documents Checklist preview */}
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Mandatory Document Check:
                </span>
                <ul className="text-xs text-slate-600 space-y-1">
                  {service.requiredDocuments.map((doc, idx) => (
                    <li key={idx} className="flex items-center space-x-1.5 text-[11px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-[11px] text-emerald-700 font-medium flex items-center">
                <span>{service.paperFormsAvoided} paper sheets eliminated</span>
              </div>

              <button
                onClick={() => onSelectService(service.id)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
              >
                <span>{t.applyNow}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <p className="text-slate-500 text-sm">No services matching "{searchQuery}".</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
            }}
            className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};
