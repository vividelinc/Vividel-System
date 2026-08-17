import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { addLead } from '../../firebase/firestore';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState('instagram');
  const [callNotes, setCallNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;

    setIsSubmitting(true);
    try {
      await addLead({
        name,
        email,
        phone,
        source,
        callNotes,
        status: 'new',
        createdAt: new Date().toISOString()
      });
      setIsSubmitting(false);
      onClose();
      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setCallNotes('');
    } catch (err) {
      console.error('Error adding lead:', err);
      setIsSubmitting(false);
    }
  };

  const sourceOptions = [
    { value: 'instagram', label: 'Instagram' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'referral', label: 'Referral' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Lead">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          required
          placeholder="Client or brand contact name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Email Address"
          type="email"
          required
          placeholder="email@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Phone Number"
          type="tel"
          required
          placeholder="+233 24 000 0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <Select
          label="Source"
          options={sourceOptions}
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#F2F4F5]/70">
            Initial Call Notes
          </label>
          <textarea
            rows={3}
            className="w-full bg-[#0A0D10] text-[#F2F4F5] border border-[#262D34] rounded-lg p-2.5 text-sm focus:border-[#2DD4BF] focus:outline-none"
            placeholder="Key notes from initial call..."
            value={callNotes}
            onChange={(e) => setCallNotes(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#262D34]">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Add Lead'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
