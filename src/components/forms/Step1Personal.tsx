import React from 'react';
import { Input } from '../ui/Input';
import { User, Mail, Phone } from 'lucide-react';

interface Step1Props {
  data: {
    fullName: string;
    email: string;
    phone: string;
  };
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

export const Step1Personal: React.FC<Step1Props> = ({ data, onChange, errors }) => {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="border-b border-[#262D34] pb-4">
        <h2 className="text-xl font-bold text-[#F2F4F5]">Step 1: Personal Details</h2>
        <p className="text-sm text-[#F2F4F5]/60 mt-1">
          Please provide your contact information so James can link your booking.
        </p>
      </div>

      <Input
        label="Full Name"
        placeholder="e.g. Ama Mensah"
        value={data.fullName}
        onChange={(e) => onChange('fullName', e.target.value)}
        error={errors.fullName}
        icon={<User className="w-4 h-4" />}
      />

      <Input
        label="Email Address"
        type="email"
        placeholder="e.g. ama@example.com"
        value={data.email}
        onChange={(e) => onChange('email', e.target.value)}
        error={errors.email}
        icon={<Mail className="w-4 h-4" />}
      />

      <Input
        label="Phone Number"
        type="tel"
        placeholder="e.g. +233 24 000 0000"
        value={data.phone}
        onChange={(e) => onChange('phone', e.target.value)}
        error={errors.phone}
        icon={<Phone className="w-4 h-4" />}
      />
    </div>
  );
};
