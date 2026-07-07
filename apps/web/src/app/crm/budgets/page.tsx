"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Search, Plus } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import Link from "next/link";
import { API_URL } from "@/lib/api";
import CrmClientModal from "@/components/crm/CrmClientModal";

export default function BudgetsPage() {
  const { user, token } = useStore();
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "", company: "", phone: "", whatsapp: "", email: "", 
    instagram: "", city: "", leadSource: "", projectType: "", 
    estimatedValue: "", priority: "MEDIA", stage: "ORCAMENTO_ENVIADO", observations: ""
  });

  const openNewModal = () => {
    setEditingClient(null);
    setFormData({
      name: "", company: "", phone: "", whatsapp: "", email: "", 
      instagram: "", city: "", leadSource: "", projectType: "", 
      estimatedValue: "", priority: "MEDIA", stage: "ORCAMENTO_ENVIADO", observations: ""
    });
    setIsModalOpen(true);
  };

  const fetchClients = () => {
    if (!user || !token) return;
    fetch(`${API_URL}/crm/${user.workspaceId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setClients(data))
    .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchClients();
  }, [user, token]);

  const filteredClients = clients.filter(c => 
    c.stage === 'ORCAMENTO_ENVIADO' &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.company && c.company.toLowerCase().includes(search.toLowerCase())))
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Orçamentos</h1>
            <p className="text-muted-foreground text-sm mt-1">Gerencie as propostas enviadas aos clientes.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Buscar cliente..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
            <button onClick={openNewModal} className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors">
              <Plus className="w-4 h-4" /> Novo orçamento
            </button>
          </div>
        </div>

        <p className="text-sm font-semibold text-muted-foreground">{filteredClients.length} orçamentos</p>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-x-auto shadow-sm">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-secondary/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Cliente</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Valor</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-center">Versão</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Data de Envio</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-center">Dias em Aberto</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredClients.map(client => {
                const daysOpen = differenceInDays(new Date(), new Date(client.updatedAt));
                return (
                  <tr 
                    key={client.id} 
                    className="hover:bg-secondary/30 transition-colors group cursor-pointer"
                    onClick={() => {
                      setEditingClient(client);
                      setFormData({
                        name: client.name || "", company: client.company || "", phone: client.phone || "",
                        whatsapp: client.whatsapp || "", email: client.email || "", instagram: client.instagram || "",
                        city: client.city || "", leadSource: client.leadSource || "", projectType: client.projectType || "",
                        estimatedValue: client.estimatedValue?.toString() || "", priority: client.priority || "MEDIA",
                        stage: client.stage || "ORCAMENTO_ENVIADO", observations: client.observations || "",
                        budgetVersion: client.budgetVersion || "", budgetDate: client.budgetDate ? new Date(client.budgetDate).toISOString().split('T')[0] : "", budgetStatus: client.budgetStatus || "Aguardando resposta"
                      });
                      setIsModalOpen(true);
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-foreground">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{client.name}</div>
                          {client.company && <div className="text-xs text-muted-foreground">{client.company}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">{formatCurrency(client.estimatedValue)}</td>
                    <td className="px-6 py-4 text-center text-muted-foreground">{client.budgetVersion || '-'}</td>
                    <td className="px-6 py-4 font-medium">{client.budgetDate ? format(new Date(client.budgetDate), 'dd/MM/yyyy') : '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`${client.budgetStatus === 'Aprovado' ? 'text-green-500' : client.budgetStatus === 'Recusado' ? 'text-red-500' : 'text-yellow-500'} font-medium text-xs`}>
                        {client.budgetStatus || 'Aguardando'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`${daysOpen > 15 ? 'text-yellow-500 font-bold' : 'text-muted-foreground'} flex items-center justify-center gap-1`}>
                        {daysOpen}d {daysOpen > 15 && <span className="text-yellow-500 text-[10px]">⚠️</span>}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Não abrir modal ao clicar em excluir
                          if (confirm("Tem certeza que deseja excluir o orçamento? Isso o retornará para a etapa anterior.")) {
                            fetch(`${API_URL}/crm/${user.workspaceId}/${client.id}`, {
                              method: 'PUT',
                              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                              body: JSON.stringify({ budgetVersion: null, budgetDate: null, budgetStatus: null, stage: 'NOVO_INTERESSE' })
                            }).then(() => fetchClients());
                          }
                        }}
                        className="text-red-500 font-medium text-xs hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    Nenhum orçamento enviado no momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <CrmClientModal 
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingClient(null); }}
          formData={formData}
          setFormData={setFormData}
          onSave={() => { setIsModalOpen(false); setEditingClient(null); fetchClients(); }}
          user={user}
          token={token}
          editingClient={editingClient}
        />
      </div>
    </div>
  );
}
