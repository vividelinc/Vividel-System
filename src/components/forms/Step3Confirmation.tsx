import React from 'react';
import { Button } from '../ui/Button';
import { PhotographyService } from '../../types';
import { CheckCircle2, ShieldCheck, Calendar, MapPin, User, Mail, Phone, Camera } from 'lucide-react';

interface Step3Props {
  data: {
    fullName: string;
    email: string;
    phone: string;
    service: string;
    shootDate: string;
    backupDate: string;
    location: string;
    specialRequirements: string;
    termsAgreed: boolean;
  };
  services: PhotographyService[];
  onChange: (field: string, value: any) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

export const Step3Confirmation: React.FC<Step3Props> = ({
  data,
  services,
  onChange,
  onSubmit,
  isSubmitting,
  errors
}) => {
  const selectedServiceObj = services.find((s) => s.name === data.service);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-[#262D34] pb-4">
        <h2 className="text-xl font-bold text-[#F2F4F5]">Step 3: Review & Confirm</h2>
        <p className="text-sm text-[#F2F4F5]/60 mt-1">
          Review your shoot details before submitting to Vividel Inc.
        </p>
      </div>

      <div className="bg-[#0A0D10] border border-[#262D34] rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[#F2F4F5]/50 block text-xs uppercase font-semibold">Client Name</span>
            <span className="text-[#F2F4F5] font-medium flex items-center gap-1.5 mt-0.5">
              <User className="w-3.5 h-3.5 text-[#2DD4BF]" /> {data.fullName}
            </span>
          </div>

          <div>
            <span className="text-[#F2F4F5]/50 block text-xs uppercase font-semibold">Email & Phone</span>
            <span className="text-[#F2F4F5] font-medium flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-[#2DD4BF]" /> {data.email} | {data.phone}
            </span>
          </div>

          <div>
            <span className="text-[#F2F4F5]/50 block text-xs uppercase font-semibold">Service</span>
            <span className="text-[#F2F4F5] font-medium flex items-center gap-1.5 mt-0.5">
              <Camera className="w-3.5 h-3.5 text-[#2DD4BF]" /> {data.service}
              {selectedServiceObj && (
                <span className="text-[#2DD4BF] text-xs font-semibold">
                  (From ${selectedServiceObj.startingPrice.toLocaleString()})
                </span>
              )}
            </span>
          </div>

          <div>
            <span className="text-[#F2F4F5]/50 block text-xs uppercase font-semibold">Shoot Date</span>
            <span className="text-[#F2F4F5] font-medium flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-[#2DD4BF]" /> {data.shootDate}
              {data.backupDate && <span className="text-[#F2F4F5]/50 text-xs">(Backup: {data.backupDate})</span>}
            </span>
          </div>

          <div className="md:col-span-2">
            <span className="text-[#F2F4F5]/50 block text-xs uppercase font-semibold">Location</span>
            <span className="text-[#F2F4F5] font-medium flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#2DD4BF]" /> {data.location}
            </span>
          </div>

          {data.specialRequirements && (
            <div className="md:col-span-2 border-t border-[#262D34] pt-3 mt-1">
              <span className="text-[#F2F4F5]/50 block text-xs uppercase font-semibold">Special Requirements</span>
              <p className="text-[#F2F4F5]/90 text-xs mt-1 bg-[#171D23]/60 p-2.5 rounded-lg border border-[#262D34]">
                {data.specialRequirements}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 bg-[#171D23]/40 p-4 rounded-xl border border-[#2DD4BF]/30">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.termsAgreed}
            onChange={(e) => onChange('termsAgreed', e.target.checked)}
            className="mt-1 w-4 h-4 accent-[#2DD4BF] rounded bg-[#0A0D10] border-[#262D34]"
          />
          <span className="text-xs text-[#F2F4F5]/90 leading-relaxed">
            I confirm I have discussed and agreed terms with <strong className="text-[#2DD4BF]">James Akabo Jnr</strong> at Vividel Inc.
          </span>
        </label>
        {errors.termsAgreed && <p className="text-xs text-rose-400 pl-7">{errors.termsAgreed}</p>}
      </div>

      <Button
        onClick={onSubmit}
        disabled={isSubmitting || !data.termsAgreed}
        className="w-full py-3.5 text-base"
        icon={isSubmitting ? undefined : <ShieldCheck className="w-5 h-5" />}
      >
        {isSubmitting ? 'Submitting Request...' : 'Submit Shoot Booking Request'}
      </Button>
    </div>
  );
};
