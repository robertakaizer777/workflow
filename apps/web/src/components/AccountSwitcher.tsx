"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { ChevronDown, Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "@/lib/api";

interface Connection {
  id: string;
  platform: string;
  username: string;
}

export function AccountSwitcher() {
  const { user, token, activeConnectionId, setActiveConnection } = useStore();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user || !token) return;

    fetch(`${API_URL}/social/${user.workspaceId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setConnections(data);
          // Se a conta ativa não existir mais na lista, reseta para null (Todas as contas)
          if (data.length > 0 && activeConnectionId) {
            const exists = data.some(c => c.username === activeConnectionId);
            if (!exists) setActiveConnection(null);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [user, token, activeConnectionId, setActiveConnection]);

  if (loading) {
    return (
      <div className="w-full h-12 flex items-center justify-center border-b border-zinc-800 bg-black/20">
        <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="w-full p-3 border-b border-zinc-800 bg-black/10">
        <p className="text-xs text-zinc-400 text-center">Nenhuma conta conectada</p>
      </div>
    );
  }
  const uniqueUsernames = Array.from(new Set(connections.map(c => c.username)));

  // O activeConnectionId agora armazena o username!
  const activeUsername = activeConnectionId;

  return (
    <div className="relative border-b border-zinc-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-2 truncate">
          <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
            {activeUsername ? "👤" : "ALL"}
          </div>
          <span className="text-sm font-semibold truncate text-zinc-200">
            {activeUsername ? activeUsername : "Todas as Contas"}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 w-[240px] ml-3 mt-1 bg-background border border-border rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-2 text-xs font-medium text-muted-foreground uppercase tracking-wider bg-secondary/30">
                Trocar Conta
              </div>
              <div className="max-h-60 overflow-y-auto">
                
                <button
                  onClick={() => {
                    setActiveConnection(null);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 text-left transition-colors hover:bg-secondary/50 ${
                    !activeUsername ? "bg-primary/10 text-primary" : "text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center font-bold text-xs">
                      ALL
                    </div>
                    <span className="text-sm font-medium">Todas as Contas</span>
                  </div>
                  {!activeUsername && <Check className="w-4 h-4" />}
                </button>

                {/* Contas Agrupadas por Username */}
                {uniqueUsernames.map((username) => (
                  <button
                    key={username}
                    onClick={() => {
                      setActiveConnection(username);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 text-left transition-colors hover:bg-secondary/50 ${
                      activeUsername === username ? "bg-primary/10 text-primary" : "text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center font-bold text-xs text-muted-foreground">
                        👤
                      </div>
                      <span className="text-sm font-medium truncate" title={username}>
                        {username}
                      </span>
                    </div>
                    {activeUsername === username && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
