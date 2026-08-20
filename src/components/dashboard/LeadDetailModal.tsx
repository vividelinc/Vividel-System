import React, { useState, useEffect } from 'react';
import { Lead, LeadStatus } from '../../types';
import { updateLead } from '../../firebase/firestore';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { X, UserCheck, Phone, Mail, Calendar, MessageSquare, ArrowRight } from 'lucide-react';

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onConvert: (lead: Lead) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  isOpen,
  onClose,
  onConvert
}) => {
  if (!isOpen || !lead) return null;

  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [callNotes, setCallNotes] = useState(lead.callNotes || '');
  const [callDate, setCallDate] = useState(lead.callDate || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (lead) {
      setStatus(lead.status);
      setCallNotes(lead.callNotes || '');
      setCallDate(lead.callDate || '');
    }
  }, [lead]);

  const handleSave = async () => {
    if (!lead.id) return;
    setIsSaving(true);
    try {
      await updateLead(lead.id, {
        status,
        callNotes,
        callDate
      });
      setIsSaving(false);
      onClose();
    } catch (err) {
      console.error('Error updating lead:', err);
      setIsSaving(false);
    }
  };

  const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'called', label: 'Called' },
    { value: 'converted', label: 'Converted' },
    { value: 'lost', label: 'Lost' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-surface-2 border-l border-outline h-full flex flex-col justify-between shadow-2xl">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between p-6 border-b border-outline bg-surface-1">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-on-surface">{lead.name}</h3>
                <Badge status={status} />
              </div>
              <p className="text-xs text-on-surface/60 mt-1">
                Source: <span className="capitalize text-primary">{lead.source}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-on-surface/60 hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 max-h-[calc(100vh-140px)] overflow-y-auto">
            {/* Contact info card */}
            <div className="bg-surface-1/60 border border-outline rounded-xl p-4 space-y-3 text-sm">
              <div className="flex items-center gap-3 text-on-surface">
                <Mail className="w-4 h-4 text-primary" />
                <a href={`mailto:${lead.email}`} className="hover:underline text-xs">
                  {lead.email}
                </a>
              </div>
              <div className="flex items-center gap-3 text-on-surface">
                <Phone className="w-4 h-4 text-primary" />
                <a href={`tel:${lead.phone}`} className="hover:underline text-xs">
                  {lead.phone}
                </a>
              </div>
              <div className="flex items-center gap-3 text-on-surface">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-xs">
                  Created: {new Date(lead.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-4">
              <Select
                label="Lead Status"
                options={statusOptions}
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface/70">
                  Call Date
                </label>
                <input
                  type="datetime-local"
                  value={callDate}
                  onChange={(e) => setCallDate(e.target.value)}
                  className="w-full bg-surface-2 text-on-surface border border-outline rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface/70 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-primary" /> Call Notes & Inquiries
                </label>
                <textarea
                  rows={5}
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Record summary of discovery call, agreed timeline, special requests..."
                  className="w-full bg-surface-2 text-on-surface placeholder-on-surface/30 border border-outline rounded-lg p-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-outline bg-surface-2 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => onConvert(lead)}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Convert to Booking
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};
