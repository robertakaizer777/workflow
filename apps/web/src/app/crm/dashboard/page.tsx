"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Search, Plus, AlertTriangle, Users, Target, FileText, CheckCircle2, Clock, Percent, DollarSign } from "lucide-react";
import { API_URL } from "@/lib/api";
import { differenceInDays, format } from "date-fns";
import CrmClientModal from "@/components/crm/CrmClientModal";

const STAGES = [
  { id: "NOVO_INTERESSE", label: "Novo interesse", color: "bg-zinc-500" },
  { id: "PRIMEIRO_CONTATO", label: "Primeiro contato", color: "bg-blue-500" },
  { id: "BRIEFING_RECEBIDO", label: "Briefing recebido", color: "bg-indigo-500" },
  { id: "ORCAMENTO_ENVIADO", label: "Orçamento enviado", color: "bg-purple-500" },
  { id: "FOLLOW_UP", label: "Follow-up", color: "bg-yellow-500" },
  { id: "NEGOCIACAO", label: "Negociação", color: "bg-orange-500" },
  { id: "FECHAMENTO", label: "Fechamento", color: "bg-red-500" },
  { id: "AGENDADO", label: "Agendado", color: "bg-teal-500" },
  { id: "PROJ_CONCLUIDO", label: "Proj. concluído", color: "bg-green-500" },
  { id: "CLIENTE_RECORRENTE", label: "Cliente recorrente", color: "bg-emerald-600" }
];

export default function CrmDashboard() {
  const { user, token } = useStore();
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
  );

  // Metrics
  const totalLeads = filteredClients.length;
  
  const inNegotiation = filteredClients.filter(c => 
    ['FOLLOW_UP', 'NEGOCIACAO', 'FECHAMENTO'].includes(c.stage)
  ).length;

  const budgetsSent = filteredClients.filter(c => c.stage === 'ORCAMENTO_ENVIADO').length;
  const budgetsLate = filteredClients.filter(c => c.stage === 'ORCAMENTO_ENVIADO' && differenceInDays(new Date(), new Date(c.updatedAt)) >= 15).length;
  
  const closedProjects = filteredClients.filter(c => 
    ['PROJ_CONCLUIDO', 'CLIENTE_RECORRENTE'].includes(c.stage)
  ).length;

  const scheduled = filteredClients.filter(c => c.stage === 'AGENDADO').length;

  const conversionRate = totalLeads > 0 ? Math.round((closedProjects / totalLeads) * 100) : 0;

  const expectedRevenue = filteredClients
    .filter(c => ['FECHAMENTO', 'AGENDADO', 'PROJ_CONCLUIDO'].includes(c.stage))
    .reduce((sum, c) => sum + (c.estimatedValue || 0), 0);

  const pendingFollowUps = filteredClients.filter(c => 
    ['ORCAMENTO_ENVIADO', 'FOLLOW_UP'].includes(c.stage) && 
    differenceInDays(new Date(), new Date(c.updatedAt)) >= 15
  );

  return (
    <div className="flex-1 overflow-y-auto min-h-screen bg-[#0c0c0e]">
      <div className="p-4 md:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-6">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Buscar cliente..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:ring-1 focus:ring-primary/50 focus:outline-none text-white"
              />
            </div>
            <button onClick={() => setIsModalOpen(true)} className="bg-white hover:bg-zinc-200 text-black px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors">
              <Plus className="w-4 h-4" /> Novo cliente
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-zinc-500 tracking-wider">TOTAL DE LEADS</span>
              <Users className="w-4 h-4 text-zinc-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{totalLeads}</div>
              <div className="text-xs text-zinc-500 mt-1">clientes cadastrados</div>
            </div>
          </div>
          
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-zinc-500 tracking-wider">EM NEGOCIAÇÃO</span>
              <Target className="w-4 h-4 text-zinc-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{inNegotiation}</div>
              <div className="text-xs text-zinc-500 mt-1">follow-up + negociação + fechamento</div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-zinc-500 tracking-wider">ORÇAMENTOS ENVIADOS</span>
              <FileText className="w-4 h-4 text-zinc-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{budgetsSent}</div>
              <div className="text-xs text-zinc-500 mt-1">{budgetsLate} aguardando follow-up</div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-zinc-500 tracking-wider">PROJETOS FECHADOS</span>
              <CheckCircle2 className="w-4 h-4 text-zinc-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{closedProjects}</div>
              <div className="text-xs text-zinc-500 mt-1">concluídos + recorrentes</div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-zinc-500 tracking-wider">AGENDADOS</span>
              <Clock className="w-4 h-4 text-zinc-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{scheduled}</div>
              <div className="text-xs text-zinc-500 mt-1">próximos projetos</div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-zinc-500 tracking-wider">TAXA DE CONVERSÃO</span>
              <Percent className="w-4 h-4 text-zinc-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{conversionRate}%</div>
              <div className="text-xs text-zinc-500 mt-1">leads → projetos fechados</div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-zinc-500 tracking-wider">RECEITA PREVISTA</span>
              <DollarSign className="w-4 h-4 text-zinc-600" />
            </div>
            <div>
              <div className="text-4xl font-bold text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expectedRevenue)}
              </div>
              <div className="text-xs text-zinc-500 mt-1">projetos em fechamento + agendados + concluídos</div>
            </div>
          </div>
        </div>

        {/* Pipeline Distribution */}
        <div className="pt-6">
          <h3 className="text-xs font-bold text-zinc-500 tracking-wider mb-4">PIPELINE — DISTRIBUIÇÃO DE ETAPAS</h3>
          
          <div className="flex w-full h-2 rounded-full overflow-hidden mb-4 bg-zinc-900">
            {STAGES.map(stage => {
              const count = filteredClients.filter(c => (c.stage || 'NOVO_INTERESSE') === stage.id).length;
              const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
              if (percentage === 0) return null;
              return (
                <div 
                  key={stage.id} 
                  className={`h-full ${stage.color}`} 
                  style={{ width: `${percentage}%` }}
                />
              );
            })}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-4">
            {STAGES.map(stage => {
              const count = filteredClients.filter(c => (c.stage || 'NOVO_INTERESSE') === stage.id).length;
              return (
                <div key={stage.id} className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className={`w-12 h-1 ${stage.color} rounded-full`} />
                  </div>
                  <span className="text-xs text-zinc-500 font-medium">{stage.label}</span>
                  <span className="font-bold text-white">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
          
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 flex justify-between items-center border-b border-zinc-800 bg-zinc-950">
              <h3 className="font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                Follow-ups pendentes
              </h3>
              <button className="text-xs text-zinc-400 hover:text-white font-medium">Ver todos</button>
            </div>
            <div className="p-4 flex-1">
              {pendingFollowUps.length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-600 text-sm py-10">
                  Nenhum follow-up pendente no momento
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingFollowUps.slice(0, 3).map(client => (
                    <div key={client.id} className="flex items-center justify-between p-4 rounded-lg bg-zinc-900 border border-yellow-500/20">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        <div>
                          <h4 className="font-bold text-white text-sm">{client.name}</h4>
                          <p className="text-xs text-yellow-500 font-medium">{differenceInDays(new Date(), new Date(client.updatedAt))} dias sem resposta</p>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-zinc-400">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.estimatedValue || 0)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 flex justify-between items-center border-b border-zinc-800 bg-zinc-950">
              <h3 className="font-bold text-white">Atividade recente</h3>
            </div>
            <div className="p-4 flex-1">
              <div className="h-full flex items-center justify-center text-zinc-600 text-sm py-10">
                Sem atividade recente
              </div>
            </div>
          </div>

        </div>

      </div>

      <CrmClientModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={{}}
        setFormData={() => {}}
        onSave={() => {
          setIsModalOpen(false);
          fetchClients();
        }}
        user={user}
        token={token}
      />
    </div>
  );
}
