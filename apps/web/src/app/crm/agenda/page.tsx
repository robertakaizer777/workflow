"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Search, Plus, Calendar, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { API_URL } from "@/lib/api";

export default function AgendaPage() {
  const { user, token } = useStore();
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState("");

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
    c.stage === 'AGENDADO' &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.company && c.company.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agenda</h1>
            <p className="text-muted-foreground text-sm mt-1">Reuniões e gravações agendadas com clientes.</p>
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
            <button className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors">
              <Plus className="w-4 h-4" /> Novo agendamento
            </button>
          </div>
        </div>

        <div className="flex gap-3 text-sm mb-4">
          <select className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 focus:outline-none">
            <option>Todos os status</option>
          </select>
        </div>

        <div className="space-y-3">
          {filteredClients.length === 0 && (
            <div className="p-8 text-center text-muted-foreground bg-card border border-border rounded-xl">
              Nenhum compromisso agendado.
            </div>
          )}

          {filteredClients.map(client => (
            <div key={client.id} className="bg-card border border-border hover:border-border/80 transition-colors rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-secondary border border-border rounded-xl flex flex-col items-center justify-center shrink-0">
                  <span className="text-xl font-bold text-foreground">{format(new Date(client.updatedAt), 'dd')}</span>
                  <span className="text-xs font-semibold text-muted-foreground uppercase">{format(new Date(client.updatedAt), 'MMM')}</span>
                </div>
                
                <div>
                  <h3 className="font-bold text-lg text-foreground">{client.name}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 14:00 (A definir)</span>
                    {client.company && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {client.company}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{client.observations || 'Nenhuma observação.'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                <span className="text-xs font-bold px-2 py-1 rounded text-green-500 bg-green-500/10 border border-green-500/20">CONFIRMADO</span>
                <button className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Editar</button>
                <button className="text-sm font-medium text-muted-foreground hover:text-red-500 transition-colors">Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
