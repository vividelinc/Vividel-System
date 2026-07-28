import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Lead, PhotographyService, BookingStatus } from '../../types';
import { createBookingRequest, updateLead, subscribeToActiveServices } from '../../firebase/firestore';
import { triggerOnNewBooking } from '../../services/cloudFunctions';

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillLead?: Lead | null;
}

export const NewBookingModal: React.FC<NewBookingModalProps> = ({
  isOpen,
  onClose,
  prefillLead
}) => {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [service, setService] = useState('');
  const [shootDate, setShootDate] = useState('');
  const [backupDate, setBackupDate] = useState('');
  const [location, setLocation] = useState('');
  const [totalPrice, setTotalPrice] = useState<number>(1000);
  const [depositAmount, setDepositAmount] = useState<number>(500);
  const [depositDeadline, setDepositDeadline] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [status, setStatus] = useState<BookingStatus>('pending_contract');
  const [services, setServices] = useState<PhotographyService[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsub = subscribeToActiveServices((sList) => {
      setServices(sList);
      if (sList.length > 0 && !service) {
        setService(sList[0].name);
        setTotalPrice(sList[0].startingPrice);
        setDepositAmount(Math.round(sList[0].startingPrice * 0.5));
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (prefillLead) {
      setClientName(prefillLead.name);
      setClientEmail(prefillLead.email);
      setClientPhone(prefillLead.phone);
      if (prefillLead.callNotes) {
        setSpecialRequirements(`Notes from discovery call: ${prefillLead.callNotes}`);
      }
    }
  }, [prefillLead]);

  const handleServiceChange = (selectedName: string) => {
    setService(selectedName);
    const sObj = services.find((s) => s.name === selectedName);
    if (sObj) {
      setTotalPrice(sObj.startingPrice);
      setDepositAmount(Math.round(sObj.startingPrice * 0.5));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !service || !shootDate) return;

    setIsSubmitting(true);
    try {
      const bookingData = {
        clientName,
        clientEmail,
        clientPhone,
        service,
        shootDate,
        backupDate,
        location,
        specialRequirements,
        totalPrice: Number(totalPrice),
        depositAmount: Number(depositAmount),
        depositDeadline,
        status,
        createdAt: new Date().toISOString()
      };

      const result = await createBookingRequest(bookingData);

      // Trigger Cloud Function notification
      await triggerOnNewBooking(bookingData as any, result.id);

      // If prefilled from lead, update lead status to converted
      if (prefillLead && prefillLead.id) {
        await updateLead(prefillLead.id, { status: 'converted' });
      }

      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error('Error creating booking:', err);
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { value: 'pending_contract', label: 'Pending Contract' },
    { value: 'contract_sent', label: 'Contract Sent' },
    { value: 'deposit_pending', label: 'Deposit Pending' },
    { value: 'shoot_scheduled', label: 'Shoot Scheduled' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Booking" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Client Name"
            required
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
          <Input
            label="Client Email"
            type="email"
            required
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
          />
          <Input
            label="Client Phone"
            type="tel"
            required
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Service"
            options={services.map((s) => ({ value: s.name, label: `${s.name} ($${s.startingPrice})` }))}
            value={service}
            onChange={(e) => handleServiceChange(e.target.value)}
          />
          <Select
            label="Initial Status"
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value as BookingStatus)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Shoot Date"
            type="date"
            required
            value={shootDate}
            onChange={(e) => setShootDate(e.target.value)}
          />
          <Input
            label="Backup Date"
            type="date"
            value={backupDate}
            onChange={(e) => setBackupDate(e.target.value)}
          />
        </div>

        <Input
          label="Location / Venue"
          placeholder="e.g. Labadi Beach Hotel, Accra"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Total Price ($ USD)"
            type="number"
            value={totalPrice}
            onChange={(e) => setTotalPrice(Number(e.target.value))}
          />
          <Input
            label="Deposit Amount ($ USD)"
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(Number(e.target.value))}
          />
          <Input
            label="Deposit Deadline"
            type="date"
            value={depositDeadline}
            onChange={(e) => setDepositDeadline(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#BCA890]">
            Special Requirements / Internal Notes
          </label>
          <textarea
            rows={2}
            className="w-full bg-[#2B2414] text-[#E9E4DC] border border-[#554A32] rounded-lg p-2.5 text-sm focus:border-[#40E0D0] focus:outline-none"
            value={specialRequirements}
            onChange={(e) => setSpecialRequirements(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#554A32]">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Booking...' : 'Create Booking'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
