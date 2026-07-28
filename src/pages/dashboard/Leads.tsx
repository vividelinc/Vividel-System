import React, { useState, useEffect } from 'react';
import { Header } from '../../components/dashboard/Header';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Lead, LeadStatus } from '../../types';
import { subscribeToLeads } from '../../firebase/firestore';
import { LeadDetailModal } from '../../components/dashboard/LeadDetailModal';
import { NewLeadModal } from '../../components/dashboard/NewLeadModal';
import { NewBookingModal } from '../../components/dashboard/NewBookingModal';
import { Search, Plus, Phone, Mail, Calendar, Filter } from 'lucide-react';

export const Leads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [convertLead, setConvertLead] = useState<Lead | null>(null);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeToLeads((lList) => {
      setLeads(lList);
    });
    return () => unsub();
  }, []);

  const handleConvertTrigger = (lead: Lead) => {
    setSelectedLead(null);
    setConvertLead(lead);
    setIsConvertModalOpen(true);
  };

  // Filtering
  const filteredLeads = leads.filter((l) => {
    const matchesTab = activeTab === 'all' || l.status === activeTab;
    const matchesSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone.includes(searchTerm);
    return matchesTab && matchesSearch;
  });

  const tabs = [
    { id: 'all', label: 'All Leads' },
    { id: 'new', label: 'New' },
    { id: 'called', label: 'Called' },
    { id: 'converted', label: 'Converted' },
    { id: 'lost', label: 'Lost' }
  ];

  return (
    <div className="pb-12">
      <Header
        title="Leads & Call Log"
        subtitle="Inquiries from Instagram, WhatsApp, referrals, and discovery calls"
        action={
          <Button
            size="sm"
            onClick={() => setIsNewLeadOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Lead
          </Button>
        }
      />

      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#3E3521] border border-[#554A32] rounded-xl overflow-x-auto">
            {tabs.map((tab) => {
              const count =
                tab.id === 'all'
                  ? leads.length
                  : leads.filter((l) => l.status === tab.id).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-[#40E0D0] text-[#2B2414] font-bold shadow-sm'
                      : 'text-[#BCA890] hover:text-[#E9E4DC] hover:bg-[#554A32]/50'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      activeTab === tab.id
                        ? 'bg-[#2B2414]/20 text-[#2B2414]'
                        : 'bg-[#2B2414] text-[#BCA890]/70'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search leads by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-3.5 h-3.5" />}
            />
          </div>
        </div>

        {/* Leads Table */}
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#E9E4DC]">
              <thead className="bg-[#2B2414] text-[#BCA890] uppercase tracking-wider text-[10px] border-b border-[#554A32]">
                <tr>
                  <th className="p-4">Client Name</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Call Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#554A32]">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#BCA890]/60">
                      No leads matching criteria found.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-[#554A32]/40 transition-colors cursor-pointer"
                    >
                      <td className="p-4 font-semibold text-sm text-[#E9E4DC]">
                        {lead.name}
                      </td>
                      <td className="p-4 space-y-0.5 text-[#BCA890]">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-[#40E0D0]" /> {lead.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-[#BCA890]/60">
                          <Phone className="w-3 h-3" /> {lead.phone}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="capitalize px-2 py-0.5 rounded-full bg-[#2B2414] border border-[#554A32] text-[11px] text-[#40E0D0]">
                          {lead.source}
                        </span>
                      </td>
                      <td className="p-4 text-[#BCA890]">
                        {lead.callDate ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#40E0D0]" />
                            {new Date(lead.callDate).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-[#BCA890]/40">Not set</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge status={lead.status} />
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConvertTrigger(lead)}
                        >
                          Convert
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <LeadDetailModal
        lead={selectedLead}
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        onConvert={handleConvertTrigger}
      />

      <NewLeadModal
        isOpen={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
      />

      <NewBookingModal
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        prefillLead={convertLead}
      />
    </div>
  );
};
