import React, { useState, useEffect } from 'react';
import { Header } from '../../components/dashboard/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ClientRecord, Booking } from '../../types';
import { subscribeToClients, subscribeToBookings, updateClientNotes } from '../../firebase/firestore';
import { Search, UserCheck, Mail, Phone, Calendar, DollarSign, MessageSquare, Briefcase } from 'lucide-react';

export const Clients: React.FC = () => {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [clientNotes, setClientNotes] = useState('');

  useEffect(() => {
    const unsubC = subscribeToClients(setClients);
    const unsubB = subscribeToBookings(setBookings);
    return () => {
      unsubC();
      unsubB();
    };
  }, []);

  const handleOpenClient = (client: ClientRecord) => {
    setSelectedClient(client);
    setClientNotes(client.notes || '');
  };

  const handleSaveNotes = async () => {
    if (!selectedClient?.id) return;
    await updateClientNotes(selectedClient.id, clientNotes);
    setSelectedClient({ ...selectedClient, notes: clientNotes });
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  const clientBookings = selectedClient
    ? bookings.filter((b) => b.clientEmail === selectedClient.email || b.clientId === selectedClient.id)
    : [];

  return (
    <div className="pb-12">
      <Header
        title="Client Directory & CRM"
        subtitle="Manage client history, lifetime booking value, repeat badges, and private CRM notes"
      />

      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-3.5 h-3.5" />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.length === 0 ? (
            <div className="col-span-full p-12 text-center text-xs text-[#8B96A0]/40 border border-dashed border-[#262D34] rounded-xl">
              No clients found.
            </div>
          ) : (
            filteredClients.map((client) => (
              <Card
                key={client.id}
                onClick={() => handleOpenClient(client)}
                className="space-y-4 hover:border-[#2DD4BF]/60 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-[#F2F4F5]">{client.name}</h3>
                    <p className="text-xs text-[#8B96A0] mt-0.5">{client.email}</p>
                  </div>
                  {client.isRepeatClient && (
                    <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-[#2DD4BF]/15 border border-[#2DD4BF]/40 text-[#2DD4BF] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <UserCheck className="w-3 h-3" /> Repeat Client
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#262D34]">
                  <div className="bg-[#0A0D10] p-2.5 rounded-lg border border-[#262D34]">
                    <span className="text-[#8B96A0] text-[10px] block">Total Bookings</span>
                    <span className="font-bold text-[#F2F4F5] text-sm">{client.totalBookings || 1}</span>
                  </div>

                  <div className="bg-[#0A0D10] p-2.5 rounded-lg border border-[#262D34]">
                    <span className="text-[#8B96A0] text-[10px] block">Lifetime Value</span>
                    <span className="font-bold text-[#2DD4BF] text-sm">
                      ${(client.totalSpend || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-[#8B96A0] flex items-center gap-2">
                  <Phone className="w-3 h-3 text-[#2DD4BF]" /> {client.phone}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
        <Modal
          isOpen={Boolean(selectedClient)}
          onClose={() => setSelectedClient(null)}
          title={`Client Profile: ${selectedClient.name}`}
          maxWidth="lg"
        >
          <div className="space-y-6">
            <div className="bg-[#10151A] p-4 rounded-xl border border-[#262D34] flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-lg text-[#F2F4F5]">{selectedClient.name}</h4>
                  {selectedClient.isRepeatClient && (
                    <span className="px-2 py-0.5 bg-[#2DD4BF]/20 border border-[#2DD4BF]/50 text-[#2DD4BF] text-[10px] font-bold rounded-full uppercase">
                      Repeat Client
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-[#8B96A0]">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#2DD4BF]" /> {selectedClient.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#2DD4BF]" /> {selectedClient.phone}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-[#8B96A0] block">Total Spend</span>
                <span className="text-xl font-bold font-serif text-[#2DD4BF]">
                  ${(selectedClient.totalSpend || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Bookings History */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-[#F2F4F5] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#2DD4BF]" /> Booking History ({clientBookings.length})
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {clientBookings.length === 0 ? (
                  <p className="text-xs text-[#8B96A0]/60">No linked bookings recorded.</p>
                ) : (
                  clientBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 bg-[#0A0D10] rounded-xl border border-[#262D34] flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-[#F2F4F5]">{b.service}</span>
                        <p className="text-[11px] text-[#8B96A0]">{b.shootDate}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#2DD4BF]">${b.totalPrice}</span>
                        <p className="text-[10px] capitalize text-[#8B96A0]/70">{b.status.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase text-[#8B96A0] flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#2DD4BF]" /> Client CRM Notes
              </label>
              <textarea
                rows={4}
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                placeholder="Preferred styling, communication style, special dates..."
                className="w-full bg-[#0A0D10] text-[#F2F4F5] border border-[#262D34] rounded-lg p-3 text-xs focus:border-[#2DD4BF] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#262D34]">
              <Button variant="ghost" onClick={() => setSelectedClient(null)}>
                Close
              </Button>
              <Button onClick={handleSaveNotes}>Save Client Notes</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
