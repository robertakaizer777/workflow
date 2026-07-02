"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CheckCircle2, ShieldAlert, Loader2, Trash2, Lock, Key, RefreshCcw, LayoutTemplate } from "lucide-react";
import { useStore } from "@/store/useStore";
import { API_URL } from "@/lib/api";

interface Connection {
  id: string;
  platform: string;
  pageId: string;
  username: string;
  status: string;
}

const platformsMeta = [
  { id: "INSTAGRAM", name: "Instagram", icon: "📸", color: "from-pink-500 to-orange-400" },
  { id: "FACEBOOK", name: "Facebook", icon: "📘", color: "from-blue-600 to-blue-400" },
  { id: "LINKEDIN", name: "LinkedIn", icon: "💼", color: "from-sky-600 to-sky-500" },
  { id: "TWITTER", name: "Twitter", icon: "🐦", color: "from-sky-400 to-blue-500" },
  { id: "YOUTUBE", name: "YouTube", icon: "▶️", color: "from-red-600 to-red-500" },
  { id: "TIKTOK", name: "TikTok", icon: "🎵", color: "from-black to-gray-800" },
];

export default function IntegrationsPage() {
  const { user, token } = useStore();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<Connection | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [metaAppId, setMetaAppId] = useState("");
  const [metaAppSecret, setMetaAppSecret] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !token) return;
    
    fetch(`${API_URL}/social/${user.workspaceId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) setConnections(data);
    })
    .catch(err => console.error(err));
  }, [user, token]);

  const handleOAuthConnect = async (platformId: string) => {
    if (!user || !token) return;
    
    if (platformId === 'FACEBOOK' || platformId === 'INSTAGRAM') {
      setSelectedPlatform(platformId);
      setIsMetaModalOpen(true);
      return;
    }

    setLoadingAction(platformId);
    window.location.href = `${API_URL}/social/auth/${platformId}?workspaceId=${user.workspaceId}&token=${token}`;
  };

  const handleSaveMetaSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token || !selectedPlatform) return;
    setLoadingAction(selectedPlatform);

    try {
      await fetch(`${API_URL}/social/settings`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          workspaceId: user.workspaceId,
          metaAppId,
          metaAppSecret
        })
      });

      // Se salvou com sucesso, redireciona pro fluxo OAuth
      window.location.href = `${API_URL}/social/auth/${selectedPlatform}?workspaceId=${user.workspaceId}&token=${token}`;
    } catch (err) {
      console.error(err);
      setLoadingAction(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !token) return;
    try {
      await fetch(`${API_URL}/social/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setConnections(prev => prev.filter(c => c.id !== id));
      setAccountToDelete(null);
      setDeleteConfirmText("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Integrações de Contas</h1>
        <p className="text-muted-foreground mt-2">Conecte seus perfis sociais para gerenciar postagens e visualizar métricas centralizadas.</p>
      </div>

      {/* NOVO: TUTORIAL VISUAL DE CONEXÃO E SEGURANÇA */}
      <div className="mb-12">
        <div className="glass-card rounded-2xl border border-border overflow-hidden bg-secondary/20">
          <div className="bg-primary/5 p-4 border-b border-border flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Como funciona a conexão segura?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            
            <div className="flex flex-col gap-3 relative">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border shadow-sm text-foreground font-bold z-10">1</div>
              <h3 className="font-semibold text-foreground text-sm">Selecione a Rede</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Clique no botão de conexão abaixo. Você será redirecionado em um ambiente seguro para o portal oficial (Facebook, Google, LinkedIn).
              </p>
              {/* Linha conectora */}
              <div className="hidden md:block absolute top-5 left-10 w-full h-[1px] bg-border -z-0"></div>
            </div>

            <div className="flex flex-col gap-3 relative">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm text-primary-foreground font-bold z-10">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">Aprove o Acesso (OAuth)</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Nós <strong>nunca vemos ou salvamos sua senha</strong>. A rede social apenas nos fornece um token temporário (OAuth2) para agendar posts por você.
              </p>
              {/* Linha conectora */}
              <div className="hidden md:block absolute top-5 left-10 w-full h-[1px] bg-border -z-0"></div>
            </div>

            <div className="flex flex-col gap-3 relative">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-sm font-bold z-10">
                <RefreshCcw className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">Métricas Sincronizadas</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tudo pronto! Nossos servidores vão puxar seus dados de audiência diariamente e popular seu Dashboard mágico automaticamente.
              </p>
            </div>

          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        
        {/* Painel de Redes Disponíveis */}
        <div className="glass-card rounded-2xl p-6 border border-border bg-secondary/10 flex flex-col">
          <h2 className="text-xl font-bold text-foreground mb-1">Catálogo de Redes</h2>
          <p className="text-sm text-muted-foreground mb-6">Você pode conectar múltiplas contas da mesma plataforma se desejar.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {platformsMeta.map((plat) => {
              const isConnected = connections.some(c => c.platform === plat.id);
              
              return (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={plat.id} 
                className={`group relative flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer overflow-hidden shadow-sm hover:shadow-md ${isConnected ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border bg-background hover:border-primary/50'}`}
                onClick={() => handleOAuthConnect(plat.id)}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${plat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className="text-3xl filter drop-shadow-sm">{plat.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    {plat.name}
                    {isConnected && (
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      </span>
                    )}
                  </h3>
                  <p className={`text-xs mt-0.5 font-medium ${isConnected ? 'text-emerald-500' : 'text-red-400'}`}>
                    {isConnected ? 'Conexão Ativa' : 'Desconectado'}
                  </p>
                </div>
                
                {loadingAction === plat.id ? (
                  <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                ) : isConnected ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 transition-colors">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Plus className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            )})}
          </div>
        </div>

        {/* Painel de Contas Conectadas */}
        <div className="glass-card rounded-2xl p-6 border border-border bg-background flex flex-col h-full shadow-inner">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Suas Contas Ativas</h2>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold border border-emerald-500/20">
              {connections.length} Conectadas
            </span>
          </div>
          
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence>
              {connections.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center border-2 border-dashed border-border rounded-xl"
                >
                  <LayoutTemplate className="w-12 h-12 mb-3 text-muted-foreground/30" />
                  <p className="font-medium">Nenhuma conta conectada ainda.</p>
                  <p className="text-sm mt-1">Siga o tutorial acima para conectar sua primeira rede.</p>
                </motion.div>
              )}

              {connections.map((conn) => {
                const meta = platformsMeta.find(p => p.id === conn.platform);
                return (
                  <motion.div 
                    key={conn.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl bg-background w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border border-border">
                        {meta?.icon || "📱"}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{conn.username}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-xs font-medium text-emerald-500">Sincronizado</span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setAccountToDelete(conn)}
                      className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Desconectar Conta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {accountToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => {
                setAccountToDelete(null);
                setDeleteConfirmText("");
              }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-background border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Desconectar Conta</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Você está prestes a desconectar a conta <strong className="text-foreground">{accountToDelete.username}</strong>. Todas as automações e sincronizações de métricas serão pausadas. Para confirmar, digite <strong>desconectar</strong> abaixo:
                </p>

                <input
                  type="text"
                  placeholder="desconectar"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 text-foreground transition-all"
                />
              </div>

              <div className="p-4 bg-secondary/30 border-t border-border flex justify-end gap-3">
                <button
                  onClick={() => {
                    setAccountToDelete(null);
                    setDeleteConfirmText("");
                  }}
                  className="px-4 py-2 rounded-xl font-semibold text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(accountToDelete.id)}
                  disabled={deleteConfirmText.toLowerCase() !== "desconectar"}
                  className="px-6 py-2 rounded-xl font-semibold text-sm bg-red-600 text-white shadow-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Desconectar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Configuração da Meta (White-Label) */}
      <AnimatePresence>
        {isMetaModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsMetaModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-background border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center border border-blue-600/20">
                    <Key className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Credenciais da Meta</h3>
                    <p className="text-sm text-muted-foreground">Insira as chaves do seu aplicativo do Facebook.</p>
                  </div>
                </div>

                <form onSubmit={handleSaveMetaSettings} className="space-y-4 mt-2">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-1 block">App ID</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: 1234567890"
                      value={metaAppId}
                      onChange={e => setMetaAppId(e.target.value)}
                      className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-foreground"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-1 block">App Secret</label>
                    <input 
                      type="password" 
                      required
                      placeholder="Cole sua chave secreta aqui"
                      value={metaAppSecret}
                      onChange={e => setMetaAppSecret(e.target.value)}
                      className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-foreground"
                    />
                  </div>

                  <div className="bg-blue-600/10 border border-blue-600/20 p-3 rounded-lg flex items-start gap-2 mt-2">
                    <ShieldAlert className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-600 font-medium">Suas chaves serão criptografadas e salvas com segurança no seu Workspace.</p>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button 
                      type="button"
                      onClick={() => setIsMetaModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      disabled={loadingAction === selectedPlatform || !metaAppId || !metaAppSecret}
                      className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {loadingAction === selectedPlatform ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar e Conectar"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
