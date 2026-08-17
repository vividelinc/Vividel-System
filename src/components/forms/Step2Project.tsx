import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { PhotographyService } from '../../types';
import { Camera, Calendar, MapPin, FileText } from 'lucide-react';

interface Step2Props {
  data: {
    service: string;
    shootDate: string;
    backupDate: string;
    location: string;
    specialRequirements: string;
  };
  services: PhotographyService[];
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

export const Step2Project: React.FC<Step2Props> = ({
  data,
  services,
  onChange,
  errors
}) => {
  const serviceOptions = [
    { value: '', label: '-- Select a Photography Service --' },
    ...services.map((s) => ({
      value: s.name,
      label: `${s.name} (from $${s.startingPrice.toLocaleString()})`
    }))
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="border-b border-[#262D34] pb-4">
        <h2 className="text-xl font-bold text-[#F2F4F5]">Step 2: Project Details</h2>
        <p className="text-sm text-[#F2F4F5]/60 mt-1">
          Tell us about the shoot details you agreed upon during your call.
        </p>
      </div>

      <Select
        label="Service Type"
        options={serviceOptions}
        value={data.service}
        onChange={(e) => onChange('service', e.target.value)}
        error={errors.service}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Preferred Shoot Date"
          type="date"
          value={data.shootDate}
          onChange={(e) => onChange('shootDate', e.target.value)}
          error={errors.shootDate}
          icon={<Calendar className="w-4 h-4" />}
        />

        <Input
          label="Backup Date (Optional)"
          type="date"
          value={data.backupDate}
          onChange={(e) => onChange('backupDate', e.target.value)}
          icon={<Calendar className="w-4 h-4" />}
        />
      </div>

      <Input
        label="Location / Venue"
        placeholder="e.g. Kempinski Hotel Gold Coast City, Accra"
        value={data.location}
        onChange={(e) => onChange('location', e.target.value)}
        error={errors.location}
        icon={<MapPin className="w-4 h-4" />}
      />

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#F2F4F5]/70">
          Special Requirements or Notes
        </label>
        <textarea
          rows={3}
          className="w-full bg-[#0A0D10] text-[#F2F4F5] placeholder-[#F2F4F5]/30 border border-[#262D34] rounded-lg p-3 text-sm focus:outline-none focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#2DD4BF] transition-all"
          placeholder="Specific mood boards, brand guidelines, lighting requirements, or schedule..."
          value={data.specialRequirements}
          onChange={(e) => onChange('specialRequirements', e.target.value)}
        />
      </div>
    </div>
  );
};
