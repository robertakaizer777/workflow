"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, Plus, Edit, Trash2, Eye, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "http://localhost:4001";

const STAGES = [
  "Novo interesse", "Primeiro contato", "Briefing recebido", 
  "Orçamento enviado", "Follow-up", "Negociação", 
  "Fechamento", "Agendado", "Proj. concluído", "Cliente recorrente"
];

const PRIORITIES = ["BAIXA", "MEDIA", "ALTA"];

export default function ClientsPage() {
  const { user, token } = useStore();
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "", company: "", phone: "", whatsapp: "", email: "", instagram: "",
    city: "", leadSource: "", projectType: "", estimatedValue: "", priority: "MEDIA", stage: "NOVO_INTERESSE", observations: ""
  });

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) return;
    
    const url = editingClient 
      ? `${API_URL}/crm/${user.workspaceId}/${editingClient.id}`
      : `${API_URL}/crm/${user.workspaceId}`;
    
    const method = editingClient ? "PUT" : "POST";

    try {
      await fetch(url, {
        method,
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          estimatedValue: parseFloat(formData.estimatedValue) || 0
        })
      });
      setIsModalOpen(false);
      setEditingClient(null);
      fetchClients();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    if (!user || !token) return;
    try {
      await fetch(`${API_URL}/crm/${user.workspaceId}/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      fetchClients();
    } catch (err) {
      console.error(err);
    }
  };

  const openNew = () => {
    setEditingClient(null);
    setFormData({
      name: "", company: "", phone: "", whatsapp: "", email: "", instagram: "",
      city: "", leadSource: "", projectType: "", estimatedValue: "", priority: "MEDIA", stage: "NOVO_INTERESSE", observations: ""
    });
    setIsModalOpen(true);
  };

  const openEdit = (client: any) => {
    setEditingClient(client);
    setFormData({
      name: client.name || "", company: client.company || "", phone: client.phone || "", 
      whatsapp: client.whatsapp || "", email: client.email || "", instagram: client.instagram || "",
      city: client.city || "", leadSource: client.leadSource || "", projectType: client.projectType || "", 
      estimatedValue: client.estimatedValue?.toString() || "", priority: client.priority || "MEDIA", 
      stage: client.stage || "NOVO_INTERESSE", observations: client.observations || ""
    });
    setIsModalOpen(true);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getPriorityColor = (prio: string) => {
    if (prio === 'ALTA') return 'text-red-500 bg-red-500/10 border-red-500/20';
    if (prio === 'MEDIA') return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    return 'text-green-500 bg-green-500/10 border-green-500/20';
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
            <p className="text-muted-foreground text-sm">Gerencie todos os seus clientes e negociações.</p>
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
            <button 
              onClick={openNew}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors"
            >
              <Plus className="w-4 h-4" /> Novo cliente
            </button>
          </div>
        </div>

        {/* Filters bar (static for UI) */}
        <div className="flex gap-3 text-sm flex-wrap">
          <select className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 focus:outline-none">
            <option>Todos os status</option>
          </select>
          <select className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 focus:outline-none">
            <option>Todas as prioridades</option>
          </select>
          <select className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 focus:outline-none">
            <option>Todos os tipos</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-x-auto shadow-sm">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-secondary/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Cliente</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Tipo de Projeto</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Etapa</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Prioridade</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Valor</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Cidade</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredClients.map(client => (
                <tr key={client.id} className="hover:bg-secondary/30 transition-colors group">
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
                  <td className="px-6 py-4 text-muted-foreground">{client.projectType || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      {client.stage.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getPriorityColor(client.priority)}`}>
                      {client.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">{formatCurrency(client.estimatedValue)}</td>
                  <td className="px-6 py-4 text-muted-foreground">{client.city || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(client)} className="text-muted-foreground hover:text-primary transition-colors text-xs font-medium">Editar</button>
                      <button onClick={() => handleDelete(client.id)} className="text-muted-foreground hover:text-red-500 transition-colors text-xs font-medium">Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo/Editar */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-background border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-background/95 backdrop-blur z-10 p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-bold">{editingClient ? 'Editar cliente' : 'Novo cliente'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5"/></button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Dados Pessoais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-foreground mb-1 block">Nome completo *</label>
                      <input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="text-sm text-foreground mb-1 block">Empresa</label>
                      <input type="text" value={formData.company} onChange={e=>setFormData({...formData, company: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="text-sm text-foreground mb-1 block">Telefone</label>
                      <input type="text" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="text-sm text-foreground mb-1 block">WhatsApp</label>
                      <input type="text" value={formData.whatsapp} onChange={e=>setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="text-sm text-foreground mb-1 block">E-mail</label>
                      <input type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="text-sm text-foreground mb-1 block">Instagram</label>
                      <input type="text" value={formData.instagram} onChange={e=>setFormData({...formData, instagram: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="text-sm text-foreground mb-1 block">Cidade</label>
                      <input type="text" value={formData.city} onChange={e=>setFormData({...formData, city: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="text-sm text-foreground mb-1 block">Origem do lead</label>
                      <input type="text" value={formData.leadSource} onChange={e=>setFormData({...formData, leadSource: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Projeto</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-foreground mb-1 block">Tipo de projeto</label>
                      <input type="text" value={formData.projectType} onChange={e=>setFormData({...formData, projectType: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="text-sm text-foreground mb-1 block">Valor estimado (R$)</label>
                      <input type="number" step="0.01" value={formData.estimatedValue} onChange={e=>setFormData({...formData, estimatedValue: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="text-sm text-foreground mb-1 block">Prioridade</label>
                      <select value={formData.priority} onChange={e=>setFormData({...formData, priority: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-foreground mb-1 block">Etapa do pipeline</label>
                      <select value={formData.stage} onChange={e=>setFormData({...formData, stage: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                        {STAGES.map(s => <option key={s} value={s.toUpperCase().replace(' ', '_')}>{s}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm text-foreground mb-1 block">Observações</label>
                      <textarea value={formData.observations} onChange={e=>setFormData({...formData, observations: e.target.value})} rows={3} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-background/95 backdrop-blur z-10 pt-4 pb-2 border-t border-border flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg transition-colors">Cancelar</button>
                  <button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium text-sm transition-colors">Salvar cliente</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
