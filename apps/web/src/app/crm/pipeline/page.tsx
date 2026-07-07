"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Search, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { API_URL } from "@/lib/api";
import CrmClientModal from "@/components/crm/CrmClientModal";

const STAGES = [
  "NOVO_INTERESSE", "PRIMEIRO_CONTATO", "BRIEFING_RECEBIDO", 
  "ORCAMENTO_ENVIADO", "FOLLOW_UP", "NEGOCIACAO", 
  "FECHAMENTO", "AGENDADO", "PROJ_CONCLUIDO", "CLIENTE_RECORRENTE"
];

const STAGE_LABELS: Record<string, string> = {
  "NOVO_INTERESSE": "Novo interesse", "PRIMEIRO_CONTATO": "Primeiro contato",
  "BRIEFING_RECEBIDO": "Briefing recebido", "ORCAMENTO_ENVIADO": "Orçamento enviado",
  "FOLLOW_UP": "Follow-up", "NEGOCIACAO": "Negociação",
  "FECHAMENTO": "Fechamento", "AGENDADO": "Agendado",
  "PROJ_CONCLUIDO": "Proj. concluído", "CLIENTE_RECORRENTE": "Cliente recorrente"
};

const STAGE_COLORS: Record<string, string> = {
  "NOVO_INTERESSE": "text-zinc-400 bg-zinc-400", "PRIMEIRO_CONTATO": "text-blue-500 bg-blue-500",
  "BRIEFING_RECEBIDO": "text-indigo-400 bg-indigo-400", "ORCAMENTO_ENVIADO": "text-purple-500 bg-purple-500",
  "FOLLOW_UP": "text-yellow-500 bg-yellow-500", "NEGOCIACAO": "text-orange-500 bg-orange-500",
  "FECHAMENTO": "text-red-500 bg-red-500", "AGENDADO": "text-emerald-500 bg-emerald-500",
  "PROJ_CONCLUIDO": "text-green-500 bg-green-500", "CLIENTE_RECORRENTE": "text-white bg-white"
};

export default function PipelinePage() {
  const { user, token } = useStore();
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [draggedItem, setDraggedItem] = useState<any>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "", company: "", phone: "", whatsapp: "", email: "", 
    instagram: "", city: "", leadSource: "", projectType: "", 
    estimatedValue: "", priority: "MEDIA", stage: "NOVO_INTERESSE", observations: ""
  });

  const openNewModal = () => {
    setEditingClient(null);
    setFormData({
      name: "", company: "", phone: "", whatsapp: "", email: "", 
      instagram: "", city: "", leadSource: "", projectType: "", 
      estimatedValue: "", priority: "MEDIA", stage: "NOVO_INTERESSE", observations: ""
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

  const handleDragStart = (e: React.DragEvent, client: any) => {
    setDraggedItem(client);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.stage === targetStage) return;
    if (!user || !token) return;

    // Update optimistic UI
    const updatedClient = { ...draggedItem, stage: targetStage };
    setClients(prev => prev.map(c => c.id === draggedItem.id ? updatedClient : c));

    try {
      await fetch(`${API_URL}/crm/${user?.workspaceId}/${draggedItem.id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ stage: targetStage })
      });
    } catch (err) {
      console.error(err);
      fetchClients(); // revert on error
    }
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
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0c0c0e]">
      {/* Header */}
      <div className="p-4 md:px-8 md:py-6 border-b border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 bg-background/50">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pipeline de Vendas</h1>
          <p className="text-muted-foreground text-sm">Arraste os cards para alterar a etapa do cliente.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:ring-1 focus:ring-primary/50 text-white"
            />
          </div>
          <button onClick={openNewModal} className="bg-white hover:bg-zinc-200 text-black px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors">
            <Plus className="w-4 h-4" /> Novo cliente
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden flex gap-4 p-4 md:px-8 items-start custom-scrollbar">
        {STAGES.map(stage => {
          const stageClients = filteredClients.filter(c => (c.stage || 'NOVO_INTERESSE') === stage);
          
          return (
            <div 
              key={stage} 
              className="flex flex-col w-72 shrink-0 max-h-full rounded-xl bg-zinc-900/50 border border-zinc-800/50"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <div className="p-4 flex items-center justify-between border-b border-zinc-800/50 shrink-0">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${STAGE_COLORS[stage].split(' ')[1]}`} />
                  <h3 className="font-semibold text-sm text-zinc-300">{STAGE_LABELS[stage]}</h3>
                </div>
                <span className="text-xs text-zinc-500 font-medium">{stageClients.length}</span>
              </div>
              
              <div className="p-2 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-2 min-h-[150px]">
                {stageClients.length === 0 && (
                  <div className="h-full flex items-center justify-center text-xs text-zinc-600 italic">Vazio</div>
                )}
                
                {stageClients.map(client => (
                  <motion.div
                    key={client.id}
                    layoutId={client.id}
                    draggable
                    onDragStart={(e: any) => handleDragStart(e, client)}
                    onDragEnd={(e: any) => handleDragEnd(e)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 cursor-grab active:cursor-grabbing hover:border-zinc-700 transition-colors shadow-sm"
                  >
                    <h4 className="font-bold text-zinc-200 text-sm mb-0.5">{client.name}</h4>
                    <p className="text-xs text-zinc-500 mb-1">{client.company || '-'}</p>
                    <p className="text-xs text-zinc-600 mb-4 truncate">{client.projectType || 'Projeto geral'}</p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-sm font-semibold text-zinc-300">{formatCurrency(client.estimatedValue)}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPriorityColor(client.priority)}`}>
                        {client.priority}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
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
  );
}
