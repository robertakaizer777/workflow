"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { API_URL } from "@/lib/api";

const STAGES = [
  "NOVO_INTERESSE", "PRIMEIRO_CONTATO", "BRIEFING_RECEBIDO", 
  "ORCAMENTO_ENVIADO", "FOLLOW_UP", "NEGOCIACAO", 
  "FECHAMENTO", "AGENDADO", "PROJ_CONCLUIDO", "CLIENTE_RECORRENTE"
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
          <div className="flex items-start justify-between p-6 border-b border-border shrink-0 bg-background">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {editingClient ? editingClient.name : "Novo cliente"}
              </h2>
              {editingClient?.company && <p className="text-sm text-muted-foreground">{editingClient.company}</p>}
            </div>
            <div className="flex gap-2 items-center">
              {editingClient && <button className="px-3 py-1 text-xs font-medium border border-border rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">Editar</button>}
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-secondary rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex gap-6 px-6 border-b border-border bg-background overflow-x-auto custom-scrollbar">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-zinc-950/50">
            <form id="clientForm" onSubmit={handleSave} className="space-y-6">
              
              {activeTab === "Informações" && (
                <div className="space-y-4">
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
              )}

              {activeTab === "Projeto" && (
                <div className="space-y-4">
                  <div className="space-y-4 pt-4 border-t border-border">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Projeto</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Tipo de projeto</label>
                        <input type="text" value={formData.projectType || ''} onChange={e => setFormData({...formData, projectType: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Valor estimado (R$)</label>
                        <input type="number" step="0.01" value={formData.estimatedValue || ''} onChange={e => setFormData({...formData, estimatedValue: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Prioridade</label>
                        <select value={formData.priority || 'MEDIA'} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Etapa do pipeline</label>
                        <select value={formData.stage || 'NOVO_INTERESSE'} onChange={e => setFormData({...formData, stage: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                          {STAGES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1.5 pt-2">
                      <label className="text-sm font-medium">Observações</label>
                      <textarea value={formData.observations || ''} onChange={e => setFormData({...formData, observations: e.target.value})} rows={3} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"></textarea>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Orçamento</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Versão</label>
                        <input type="text" placeholder="Ex: v1" value={formData.budgetVersion || ''} onChange={e => setFormData({...formData, budgetVersion: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Data de Envio</label>
                        <input type="date" value={formData.budgetDate || ''} onChange={e => setFormData({...formData, budgetDate: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Status do Orçamento</label>
                        <select value={formData.budgetStatus || 'Aguardando resposta'} onChange={e => setFormData({...formData, budgetStatus: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                          <option value="Aguardando resposta">Aguardando resposta</option>
                          <option value="Aprovado">Aprovado</option>
                          <option value="Recusado">Recusado</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "Orçamento" && (
                <div className="space-y-8">
                  {/* Current Budget Card */}
                  {formData.estimatedValue && formData.budgetVersion && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-2xl font-bold text-foreground">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(formData.estimatedValue))}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {formData.budgetVersion} · Enviado em {formData.budgetDate ? new Date(formData.budgetDate).toLocaleDateString('pt-BR') : 'Data não definida'}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className={`text-sm font-bold flex items-center gap-1 ${formData.budgetStatus === 'Aprovado' ? 'text-green-500' : formData.budgetStatus === 'Recusado' ? 'text-red-500' : 'text-yellow-500'}`}>
                            {formData.budgetStatus === 'Aprovado' ? '✓ Aprovado' : formData.budgetStatus}
                          </div>
                          <select 
                            value={formData.budgetStatus || 'Aguardando resposta'} 
                            onChange={e => {
                              setFormData({...formData, budgetStatus: e.target.value});
                              setTimeout(() => handleSave(), 100);
                            }} 
                            className="bg-black border border-zinc-800 rounded-md px-2 py-1 text-xs focus:outline-none"
                          >
                            <option value="Aguardando resposta">Aguardando resposta</option>
                            <option value="Aprovado">Aprovado</option>
                            <option value="Recusado">Recusado</option>
                          </select>
                          <button 
                            type="button" 
                            onClick={() => {
                              setFormData({...formData, budgetVersion: '', budgetDate: '', budgetStatus: ''});
                              setTimeout(() => handleSave(), 100);
                            }}
                            className="text-xs text-red-500 hover:underline mt-1"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Registrar Novo Orçamento</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Valor (R$)</label>
                        <input type="number" step="0.01" value={formData.estimatedValue || ''} onChange={e => setFormData({...formData, estimatedValue: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Data de envio</label>
                        <input type="date" value={formData.budgetDate ? new Date(formData.budgetDate).toISOString().split('T')[0] : ''} onChange={e => setFormData({...formData, budgetDate: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Versão</label>
                        <input type="text" placeholder="Ex: v1" value={formData.budgetVersion || ''} onChange={e => setFormData({...formData, budgetVersion: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Status</label>
                        <select value={formData.budgetStatus || 'Aguardando resposta'} onChange={e => setFormData({...formData, budgetStatus: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                          <option value="Aguardando resposta">Aguardando resposta</option>
                          <option value="Aprovado">Aprovado</option>
                          <option value="Recusado">Recusado</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(activeTab === "Histórico" || activeTab === "Follow-up") && (
                <div className="flex items-center justify-center p-12 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
                  Esta funcionalidade estará disponível em breve.
                </div>
              )}

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
