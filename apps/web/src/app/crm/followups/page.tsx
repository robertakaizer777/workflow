"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Search, Plus, AlertTriangle, ExternalLink, Mail } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import Link from "next/link";
import { API_URL } from "@/lib/api";
import CrmClientModal from "@/components/crm/CrmClientModal";

export default function FollowUpsPage() {
  const { user, token } = useStore();
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    name: "", company: "", phone: "", whatsapp: "", email: "", 
    instagram: "", city: "", leadSource: "", projectType: "", 
    estimatedValue: "", priority: "MEDIA", stage: "FOLLOW_UP", observations: ""
  });

  const openNewModal = () => {
    setEditingClient(null);
    setFormData({
      name: "", company: "", phone: "", whatsapp: "", email: "", 
      instagram: "", city: "", leadSource: "", projectType: "", 
      estimatedValue: "", priority: "MEDIA", stage: "FOLLOW_UP", observations: ""
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

  const markAsDone = async (client: any) => {
    if (!user || !token) return;
    try {
      await fetch(`${API_URL}/crm/${user?.workspaceId}/${client.id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ stage: "NEGOCIACAO" }) // Move to Negociação
      });
      fetchClients();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredClients = clients.filter(c => 
    (c.stage === 'ORCAMENTO_ENVIADO' || c.stage === 'FOLLOW_UP') &&
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
            <h1 className="text-2xl font-bold text-foreground">Follow-ups</h1>
            <p className="text-muted-foreground text-sm mt-1">Clientes que receberam orçamento ou precisam de um retorno.</p>
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
              <Plus className="w-4 h-4" /> Novo cliente
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredClients.length === 0 && (
            <div className="p-8 text-center text-muted-foreground bg-card border border-border rounded-xl">
              Nenhum follow-up pendente no momento. Parabéns! 🎉
            </div>
          )}

          {filteredClients.map(client => {
            const daysWaiting = differenceInDays(new Date(), new Date(client.updatedAt));
            const isLate = daysWaiting >= 15 || client.stage === 'FOLLOW_UP';

            return (
              <div key={client.id} className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-foreground">{client.name}</h3>
                    {client.company && <span className="text-muted-foreground text-sm">{client.company}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    {isLate && (
                      <div className="flex items-center gap-1.5 text-yellow-500 text-sm font-bold bg-yellow-500/10 px-3 py-1 rounded-full">
                        <AlertTriangle className="w-4 h-4" /> 
                        {daysWaiting} dias sem resposta
                      </div>
                    )}
                    <button onClick={() => markAsDone(client)} className="text-sm font-semibold border border-border bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-lg transition-colors">
                      Marcar como feito
                    </button>
                    <button 
                      onClick={() => {
                        setEditingClient(client);
                        setFormData({
                          name: client.name || "", company: client.company || "", phone: client.phone || "",
                          whatsapp: client.whatsapp || "", email: client.email || "", instagram: client.instagram || "",
                          city: client.city || "", leadSource: client.leadSource || "", projectType: client.projectType || "",
                          estimatedValue: client.estimatedValue?.toString() || "", priority: client.priority || "MEDIA",
                          stage: client.stage || "FOLLOW_UP", observations: client.observations || ""
                        });
                        setIsModalOpen(true);
                      }}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      Ver cliente
                    </button>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground mb-4">
                  Orçamento de <strong>{formatCurrency(client.estimatedValue)}</strong> — enviado em {format(new Date(client.updatedAt), 'dd/MM/yyyy')}
                </div>

                <div className="bg-secondary/30 rounded-lg p-4 border border-border/50">
                  <p className="text-sm text-muted-foreground mb-4">Sugestão de mensagem:</p>
                  <p className="text-sm text-foreground/80 italic bg-background p-3 rounded-md border border-border/50">
                    "Olá, {client.name.split(' ')[0]}. Tudo bem? Passando para saber se conseguiu analisar a proposta que enviamos. Ficamos à disposição para ajustar qualquer detalhe e encontrar a melhor solução para o seu projeto. Abraços!"
                  </p>
                  
                  <div className="flex gap-3 mt-4">
                    <a 
                      href={`https://wa.me/${client.whatsapp?.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, ${client.name.split(' ')[0]}. Tudo bem? Passando para saber se conseguiu analisar a proposta que enviamos. Ficamos à disposição para ajustar qualquer detalhe e encontrar a melhor solução para o seu projeto.`)}`}
                      target="_blank"
                      className="flex items-center gap-2 text-sm font-semibold border border-border px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" /> Abrir WhatsApp
                    </a>
                    <a 
                      href={`mailto:${client.email}?subject=Acompanhamento de Orçamento&body=${encodeURIComponent(`Olá, ${client.name.split(' ')[0]}.\n\nTudo bem? Passando para saber se conseguiu analisar a proposta que enviamos.\nFicamos à disposição para ajustar qualquer detalhe e encontrar a melhor solução para o seu projeto.\n\nAbraços!`)}`}
                      className="flex items-center gap-2 text-sm font-semibold border border-border px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <Mail className="w-4 h-4" /> Enviar e-mail
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
