"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, Plus, Edit, Trash2, Eye, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "@/lib/api";
import CrmClientModal from "@/components/crm/CrmClientModal";

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
      {/* Componente Global de Modal */}
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
  );
}
