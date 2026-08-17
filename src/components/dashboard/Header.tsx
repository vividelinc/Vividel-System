import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Copy, Check, ExternalLink, Sparkles } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, action }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyBookingLink = () => {
    const bookingUrl = `${window.location.origin}/book`;
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <header className="px-8 py-6 bg-[#10151A]/80 backdrop-blur-md border-b border-[#262D34] flex flex-col md:flex-row md:items-center md:justify-between gap-4 sticky top-0 z-20">
      <div>
        <h1 className="text-2xl font-bold font-serif tracking-tight text-[#F2F4F5]">
          {title}
        </h1>
        {subtitle && <p className="text-xs text-[#8B96A0] mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {action}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyBookingLink}
          icon={copied ? <Check className="w-3.5 h-3.5 text-[#2DD4BF]" /> : <Copy className="w-3.5 h-3.5" />}
        >
          {copied ? 'Booking Link Copied!' : 'Create Booking Link'}
        </Button>
      </div>
    </header>
  );
};
