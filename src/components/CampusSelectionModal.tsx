import React from 'react';
import { getAllSchools, setRememberedSchoolSlug, getActiveSchoolId } from '../lib/tenantContext';
import { KumonLogo } from './KumonLogo';
import { School } from '../types';
import { Building2, MapPin, Phone, CheckCircle2, ChevronRight, X } from 'lucide-react';

interface CampusSelectionModalProps {
  isOpen: boolean;
  canDismiss?: boolean;
  onClose?: () => void;
  onSelectSchool?: (school: School) => void;
}

export const CampusSelectionModal: React.FC<CampusSelectionModalProps> = ({
  isOpen,
  canDismiss = false,
  onClose,
  onSelectSchool
}) => {
  if (!isOpen) return null;

  const schools = getAllSchools();
  const activeSchoolId = getActiveSchoolId();

  const handleSelect = (school: School) => {
    setRememberedSchoolSlug(school.slug);
    if (onSelectSchool) {
      onSelectSchool(school);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#e5e1da] overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#f8f6f3] border-b border-[#e5e1da] px-6 py-5 text-center relative">
          {canDismiss && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#8c8a86] hover:text-[#3c3c3b] p-1.5 rounded-full hover:bg-white transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          )}

          <div className="flex justify-center mb-3">
            <KumonLogo variant="horizontal" size="md" />
          </div>
          <h2 className="text-xl font-extrabold text-[#3c3c3b]">
            Select Your Center Campus
          </h2>
          <p className="text-xs text-[#8c8a86] mt-1 max-w-sm mx-auto">
            Choose which Kumon center you are accessing. This device will automatically remember your selection for future visits.
          </p>
        </div>

        {/* Campus Cards List */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {schools.map(school => {
            const isCurrentlyActive = school.id === activeSchoolId;

            return (
              <div
                key={school.id}
                onClick={() => handleSelect(school)}
                className={`group relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between hover:shadow-md ${
                  isCurrentlyActive 
                    ? 'border-[#5c869e] bg-[#f8f6f3]/60 ring-2 ring-[#5c869e]/20' 
                    : 'border-[#e5e1da] bg-white hover:border-[#5c869e]/60 hover:bg-[#faf9f7]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: school.themeColor || '#2edaff' }}
                      />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#5c869e]">
                        {school.subtitle || school.name}
                      </span>
                      {isCurrentlyActive && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 size={12} />
                          Active Device Campus
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-[#3c3c3b] text-base group-hover:text-[#5c869e] transition-colors">
                      {school.name}
                    </h3>

                    {school.address && (
                      <div className="flex items-center gap-1.5 text-xs text-[#8c8a86]">
                        <MapPin size={13} className="text-[#8c8a86] flex-shrink-0" />
                        <span>{school.address}</span>
                      </div>
                    )}

                    {school.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-[#8c8a86]">
                        <Phone size={13} className="text-[#8c8a86] flex-shrink-0" />
                        <span>{school.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#f8f6f3] group-hover:bg-[#5c869e] group-hover:text-white transition-all text-[#8c8a86] flex-shrink-0">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="bg-[#f8f6f3]/60 border-t border-[#e5e1da] px-6 py-3.5 text-center text-[11px] text-[#8c8a86]">
          You can change your selected campus at any time from the bottom of the sign-in screen.
        </div>
      </div>
    </div>
  );
};
