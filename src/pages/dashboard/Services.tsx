import React, { useState, useEffect } from 'react';
import { Header } from '../../components/dashboard/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PhotographyService } from '../../types';
import { subscribeToServices, addService, updateService } from '../../firebase/firestore';
import { Camera, Plus, CheckCircle2, XCircle, DollarSign, Edit3 } from 'lucide-react';

export const Services: React.FC = () => {
  const [services, setServices] = useState<PhotographyService[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState<number>(1000);
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsub = subscribeToServices(setServices);
    return () => unsub();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setStartingPrice(1000);
    setIsActive(true);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (s: PhotographyService) => {
    if (!s.id) return;
    setEditingId(s.id);
    setName(s.name);
    setDescription(s.description);
    setStartingPrice(s.startingPrice);
    setIsActive(s.isActive);
    setIsAddModalOpen(true);
  };

  const handleToggleActive = async (s: PhotographyService) => {
    if (!s.id) return;
    await updateService(s.id, { isActive: !s.isActive });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startingPrice) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateService(editingId, {
          name,
          description,
          startingPrice: Number(startingPrice),
          isActive
        });
      } else {
        await addService({
          name,
          description,
          startingPrice: Number(startingPrice),
          isActive
        });
      }
      setIsSubmitting(false);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error saving service:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-12">
      <Header
        title="Photography Services & Pricing"
        subtitle="Manage available shoot packages, descriptions, starting prices, and booking availability"
        action={
          <Button
            size="sm"
            onClick={handleOpenAdd}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Service
          </Button>
        }
      />

      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <Card
              key={service.id}
              className={`space-y-4 border-l-4 ${
                service.isActive ? 'border-l-[#40E0D0]' : 'border-l-gray-600 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-[#E9E4DC] font-serif">{service.name}</h3>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        service.isActive
                          ? 'bg-[#585D27]/30 border-[#585D27] text-[#A2AC48]'
                          : 'bg-gray-500/15 border-gray-500/30 text-gray-400'
                      }`}
                    >
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-[#BCA890] mt-1 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase text-[#BCA890]/60 block">Starting At</span>
                  <span className="text-xl font-bold text-[#40E0D0] font-serif">
                    ${service.startingPrice?.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#554A32]">
                <button
                  onClick={() => handleToggleActive(service)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    service.isActive
                      ? 'border-rose-500/30 text-rose-300 hover:bg-rose-500/10'
                      : 'border-[#585D27] text-[#A2AC48] hover:bg-[#585D27]/20'
                  }`}
                >
                  {service.isActive ? 'Deactivate Package' : 'Activate Package'}
                </button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleOpenEdit(service)}
                  icon={<Edit3 className="w-3.5 h-3.5" />}
                >
                  Edit Package
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Add / Edit Service Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingId ? 'Edit Photography Service' : 'Add New Photography Service'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Service Name"
            required
            placeholder="e.g. Fashion & Editorial Campaign"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#F5F0E8]/70">
              Service Description
            </label>
            <textarea
              rows={3}
              className="w-full bg-[#1A1A2E] text-[#F5F0E8] border border-[#2A2A42] rounded-lg p-2.5 text-sm focus:border-[#C9A84C] focus:outline-none"
              placeholder="What is included in this package..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Input
            label="Starting Price ($ USD)"
            type="number"
            required
            value={startingPrice}
            onChange={(e) => setStartingPrice(Number(e.target.value))}
          />

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-[#C9A84C] rounded"
            />
            <span className="text-xs text-[#F5F0E8]">Show in Client Booking Form (/book)</span>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2A42]">
            <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingId ? 'Update Service' : 'Add Service'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
