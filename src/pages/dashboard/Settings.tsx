import React, { useState, useEffect } from 'react';
import { Header } from '../../components/dashboard/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SystemSettings } from '../../types';
import { getSettings, updateSettings } from '../../firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { Settings as SettingsIcon, CreditCard, Mail, Link as LinkIcon, Check, ShieldCheck } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettingsData] = useState<SystemSettings>({
    displayName: 'James Akabo Jnr',
    email: 'vividelinc@gmail.com',
    ownerPhone: '',
    calComLink: 'https://cal.com/vividel',
    momoNumber: '+233 24 123 4567',
    momoName: 'Vividel Inc (James Akabo)',
    bankName: 'Ecobank Ghana',
    accountNumber: '1441000123456',
    contractEmailTemplate: 'Hello {clientName},\n\nYour shoot contract for {service} on {shootDate} is ready for review and e-signature.\n\nPlease review and sign using the link below:\n{contractUrl}\n\nWarm regards,\nJames Akabo Jnr\nVividel Inc.',
    paymentEmailTemplate: 'Hello {clientName},\n\nYour deposit of ${depositAmount} for {service} on {shootDate} is pending.\n\nPayment Details:\n- Mobile Money: {momoNumber} ({momoName})\n- Bank Transfer: {bankName} - Acc #{accountNumber}\n\nDeadline: {depositDeadline}\n\nWarm regards,\nVividel Inc.'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    getSettings().then((st) => {
      setSettingsData(st);
    });
  }, []);

  const handleChange = (field: keyof SystemSettings, value: string) => {
    setSettingsData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateSettings(settings);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setIsSaving(false);
    }
  };

  return (
    <div className="pb-16">
      <Header
        title="Studio Settings & Integrations"
        subtitle="Manage discovery call calendar, payment credentials, contract email templates, and profile"
      />

      <div className="p-8 max-w-5xl mx-auto space-y-8">
        <form onSubmit={handleSave} className="space-y-8">
          {/* Studio Profile */}
          <Card className="space-y-4">
            <h3 className="font-bold text-base text-[#F2F4F5] border-b border-[#262D34] pb-3 flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 text-[#2DD4BF]" /> Studio Owner Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Display Name"
                disabled
                value={settings.displayName}
                className="opacity-70"
              />
              <Input
                label="Owner Email Address"
                disabled
                value={user?.email || settings.email}
                className="opacity-70"
              />
              <Input
                label="Owner Phone Number (for SMS alerts)"
                placeholder="+233 24 123 4567"
                value={settings.ownerPhone}
                onChange={(e) => handleChange('ownerPhone', e.target.value)}
              />
            </div>
          </Card>

          {/* Cal.com Discovery Call Link */}
          <Card className="space-y-4">
            <h3 className="font-bold text-base text-[#F2F4F5] border-b border-[#262D34] pb-3 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-[#2DD4BF]" /> Discovery Call Link (Cal.com)
            </h3>

            <Input
              label="Cal.com Booking URL"
              placeholder="https://cal.com/vividel"
              value={settings.calComLink}
              onChange={(e) => handleChange('calComLink', e.target.value)}
              icon={<LinkIcon className="w-4 h-4" />}
            />
            <p className="text-xs text-[#8B96A0]">
              This link is embedded in CTA buttons for discovery calls before sending clients to the booking portal.
            </p>
          </Card>

          {/* Payment Credentials */}
          <Card className="space-y-4">
            <h3 className="font-bold text-base text-[#F2F4F5] border-b border-[#262D34] pb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#2DD4BF]" /> Payment Accounts & Mobile Money
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Mobile Money Number"
                placeholder="+233 24 123 4567"
                value={settings.momoNumber}
                onChange={(e) => handleChange('momoNumber', e.target.value)}
              />
              <Input
                label="Mobile Money Registered Name"
                placeholder="Vividel Inc (James Akabo)"
                value={settings.momoName}
                onChange={(e) => handleChange('momoName', e.target.value)}
              />
              <Input
                label="Bank Name"
                placeholder="Ecobank Ghana"
                value={settings.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
              />
              <Input
                label="Bank Account Number"
                placeholder="1441000123456"
                value={settings.accountNumber}
                onChange={(e) => handleChange('accountNumber', e.target.value)}
              />
            </div>
          </Card>

          {/* Email Template Preview & Editor */}
          <Card className="space-y-6">
            <h3 className="font-bold text-base text-[#F2F4F5] border-b border-[#262D34] pb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#2DD4BF]" /> Automated Email Templates
            </h3>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#8B96A0]">
                Contract Signing Email Template
              </label>
              <textarea
                rows={5}
                value={settings.contractEmailTemplate}
                onChange={(e) => handleChange('contractEmailTemplate', e.target.value)}
                className="w-full bg-[#0A0D10] text-[#F2F4F5] border border-[#262D34] rounded-lg p-3 text-xs font-mono focus:border-[#2DD4BF] focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#8B96A0]">
                Deposit Payment Instructions Email Template
              </label>
              <textarea
                rows={6}
                value={settings.paymentEmailTemplate || ''}
                onChange={(e) => handleChange('paymentEmailTemplate', e.target.value)}
                className="w-full bg-[#0A0D10] text-[#F2F4F5] border border-[#262D34] rounded-lg p-3 text-xs font-mono focus:border-[#2DD4BF] focus:outline-none"
              />
            </div>
          </Card>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-4">
            {saveSuccess ? (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Studio settings saved successfully!
              </span>
            ) : (
              <span />
            )}

            <Button
              type="submit"
              disabled={isSaving}
              icon={<ShieldCheck className="w-4 h-4" />}
            >
              {isSaving ? 'Saving Settings...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
