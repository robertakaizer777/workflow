"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { API_URL } from "@/lib/api";

const STAGES = [
  "NOVO_INTERESSE", "PRIMEIRO_CONTATO", "BRIEFING_RECEBIDO", 
  "ORCAMENTO_ENVIADO", "NEGOCIACAO", "AGENDADO", "FECHAMENTO_GANHO", "PERDIDO"
];

const PRIORITIES = ["ALTA", "MEDIA", "BAIXA"];

export default function CrmClientModal({ 
  isOpen, 
  onClose, 
  formData, 
  setFormData, 
  onSave,
  user,
  token,
  editingClient
}: any) {
  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) return;
    
    const url = editingClient 
      ? `${API_URL}/crm/${user.workspaceId}/${editingClient.id}`
      : `${API_URL}/crm/${user.workspaceId}`;
    
    const method = editingClient ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          estimatedValue: parseFloat(formData.estimatedValue) || 0
        })
      });
      if (response.ok) {
        onSave(); // call parent to refresh list and close
      } else {
        console.error("Failed to save:", await response.text());
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
            <h2 className="text-xl font-bold text-foreground">
              {editingClient ? "Editar cliente" : "Novo cliente"}
            </h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-secondary rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            <form id="clientForm" onSubmit={handleSave} className="space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Dados Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Nome completo *</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Empresa</label>
                    <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Telefone</label>
                    <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">WhatsApp</label>
                    <input type="text" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">E-mail</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Instagram</label>
                    <input type="text" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Cidade</label>
                    <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Origem do lead</label>
                    <input type="text" value={formData.leadSource} onChange={e => setFormData({...formData, leadSource: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Projeto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Tipo de projeto</label>
                    <input type="text" value={formData.projectType} onChange={e => setFormData({...formData, projectType: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Valor estimado (R$)</label>
                    <input type="number" step="0.01" value={formData.estimatedValue} onChange={e => setFormData({...formData, estimatedValue: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Prioridade</label>
                    <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                      {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Etapa do pipeline</label>
                    <select value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                      {STAGES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5 pt-2">
                  <label className="text-sm font-medium">Observações</label>
                  <textarea value={formData.observations} onChange={e => setFormData({...formData, observations: e.target.value})} rows={3} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"></textarea>
                </div>
              </div>

            </form>
          </div>

          <div className="p-6 border-t border-border flex justify-end gap-3 shrink-0 bg-background">
            <button onClick={onClose} type="button" className="px-4 py-2 font-medium text-sm text-foreground hover:bg-secondary rounded-lg transition-colors">
              Cancelar
            </button>
            <button form="clientForm" type="submit" className="px-4 py-2 font-medium text-sm bg-[#e5002a] text-white hover:bg-[#cc0025] rounded-lg transition-colors">
              Salvar cliente
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
