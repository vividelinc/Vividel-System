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
      <div className="border-b border-outline pb-4">
        <h2 className="text-xl font-bold text-on-surface">Step 3: Review & Confirm</h2>
        <p className="text-sm text-on-surface/60 mt-1">
          Review your shoot details before submitting to Vividel Inc.
        </p>
      </div>

      <div className="bg-surface-2 border border-outline rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-on-surface/50 block text-xs uppercase font-semibold">Client Name</span>
            <span className="text-on-surface font-medium flex items-center gap-1.5 mt-0.5">
              <User className="w-3.5 h-3.5 text-primary" /> {data.fullName}
            </span>
          </div>

          <div>
            <span className="text-on-surface/50 block text-xs uppercase font-semibold">Email & Phone</span>
            <span className="text-on-surface font-medium flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-primary" /> {data.email} | {data.phone}
            </span>
          </div>

          <div>
            <span className="text-on-surface/50 block text-xs uppercase font-semibold">Service</span>
            <span className="text-on-surface font-medium flex items-center gap-1.5 mt-0.5">
              <Camera className="w-3.5 h-3.5 text-primary" /> {data.service}
              {selectedServiceObj && (
                <span className="text-primary text-xs font-semibold">
                  (From ${selectedServiceObj.startingPrice.toLocaleString()})
                </span>
              )}
            </span>
          </div>

          <div>
            <span className="text-on-surface/50 block text-xs uppercase font-semibold">Shoot Date</span>
            <span className="text-on-surface font-medium flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-primary" /> {data.shootDate}
              {data.backupDate && <span className="text-on-surface/50 text-xs">(Backup: {data.backupDate})</span>}
            </span>
          </div>

          <div className="md:col-span-2">
            <span className="text-on-surface/50 block text-xs uppercase font-semibold">Location</span>
            <span className="text-on-surface font-medium flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-primary" /> {data.location}
            </span>
          </div>

          {data.specialRequirements && (
            <div className="md:col-span-2 border-t border-outline pt-3 mt-1">
              <span className="text-on-surface/50 block text-xs uppercase font-semibold">Special Requirements</span>
              <p className="text-on-surface/90 text-xs mt-1 bg-surface-1/60 p-2.5 rounded-lg border border-outline">
                {data.specialRequirements}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 bg-surface-1/40 p-4 rounded-xl border border-primary/30">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.termsAgreed}
            onChange={(e) => onChange('termsAgreed', e.target.checked)}
            className="mt-1 w-4 h-4 accent-primary rounded bg-surface-2 border-outline"
          />
          <span className="text-xs text-on-surface/90 leading-relaxed">
            I confirm I have discussed and agreed terms with <strong className="text-primary">James Akabo Jnr</strong> at Vividel Inc.
          </span>
        </label>
        {errors.termsAgreed && <p className="text-xs text-rose-600 pl-7">{errors.termsAgreed}</p>}
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
