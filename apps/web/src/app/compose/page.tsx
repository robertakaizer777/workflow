"use client";

import { useState, useEffect, useRef } from "react";
import { useStore } from "../../store/useStore";
import { 
  Check, Trash2, ChevronDown, Sparkles, Image as ImageIcon, Smile, Hash, Link2, 
  AlignLeft, Repeat, MoreHorizontal, PlusCircle, Calendar as CalendarIcon, Clock,
  MapPin, MessageCircle, Users, Megaphone, ShoppingCart, MessageSquareOff, AtSign, 
  Cpu, Accessibility, Rotate3d, Lock, Tag, Box, ToggleLeft, Music, LayoutGrid, ToggleRight, 
  Handshake, BookOpen, Settings, ArrowLeft, ChevronRight, CheckCircle2,
  Heart, Send, Bookmark, MoreVertical, ThumbsUp, MessageSquare, Share2, Globe
} from "lucide-react";
import { FaInstagram, FaFacebook, FaYoutube, FaTiktok, FaLinkedin, FaTwitter } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "@/lib/api";

// --- META DADOS DAS REDES E SEUS FORMATOS ---
const platformsMeta = [
  { id: "INSTAGRAM", name: "Instagram", Icon: FaInstagram, color: "pink", formats: [{ id: "INSTAGRAM_FEED", label: "Feed" }, { id: "INSTAGRAM_REELS", label: "Reels", isNew: false }, { id: "INSTAGRAM_STORIES", label: "Stories", isNew: true }] },
  { id: "FACEBOOK", name: "Facebook", Icon: FaFacebook, color: "blue", formats: [{ id: "FACEBOOK_FEED", label: "Feed" }, { id: "FACEBOOK_REELS", label: "Reels" }] },
  { id: "YOUTUBE", name: "YouTube", Icon: FaYoutube, color: "red", formats: [{ id: "YOUTUBE_VIDEO", label: "Vídeo Longo" }, { id: "YOUTUBE_SHORTS", label: "Shorts" }] },
  { id: "TIKTOK", name: "TikTok", Icon: FaTiktok, color: "black", formats: [{ id: "TIKTOK_VIDEO", label: "TikTok" }] },
  { id: "TWITTER", name: "Twitter", Icon: FaTwitter, color: "sky", formats: [{ id: "TWITTER_TWEET", label: "Post" }] },
  { id: "LINKEDIN", name: "LinkedIn", Icon: FaLinkedin, color: "indigo", formats: [{ id: "LINKEDIN_POST", label: "Postagem" }] },
];

const advancedSettingsSchema: Record<string, any[]> = {
  "INSTAGRAM_FEED": [
    { id: "location", label: "Localização", type: "text", Icon: MapPin },
    { id: "first_comment", label: "Primeiro comentário", type: "textarea", Icon: MessageCircle },
    { id: "collab", label: "Colaborador", type: "text", Icon: Handshake },
    { id: "paid_partnership", label: "Parceria paga", type: "toggle", Icon: Megaphone },
    { id: "shop", label: "Instagram shop", type: "toggle", Icon: ShoppingCart },
    { id: "disable_comments", label: "Desativar comentários", type: "toggle", Icon: MessageSquareOff },
    { id: "tags", label: "Marcação de pessoas", type: "text", Icon: AtSign },
    { id: "ai_content", label: "Conteúdo gerado por AI", type: "toggle", Icon: Cpu },
    { id: "alt_text", label: "Texto alternativo", type: "textarea", Icon: Accessibility }
  ],
  "INSTAGRAM_STORIES": [
    { id: "mention", label: "@ Adicionar menção", type: "text", Icon: AtSign },
    { id: "paid_partnership", label: "Parceria paga", type: "toggle", Icon: Megaphone },
    { id: "ai_content", label: "Conteúdo gerado por AI", type: "toggle", Icon: Cpu }
  ],
  "INSTAGRAM_REELS": [
    { id: "location", label: "Localização", type: "text", Icon: MapPin },
    { id: "audio_config", label: "Configuração de áudio", type: "text", Icon: Music },
    { id: "first_comment", label: "Primeiro comentário", type: "textarea", Icon: MessageCircle },
    { id: "collab", label: "Colaborador", type: "text", Icon: Handshake },
    { id: "paid_partnership", label: "Parceria paga", type: "toggle", Icon: Megaphone },
    { id: "share_feed", label: "Compartilhamento no Feed", type: "toggle", Icon: LayoutGrid },
    { id: "shop", label: "Instagram shop", type: "toggle", Icon: ShoppingCart },
    { id: "disable_comments", label: "Desativar comentários", type: "toggle", Icon: MessageSquareOff },
    { id: "test_mode", label: "Teste", type: "toggle", Icon: ToggleRight },
    { id: "tags", label: "Marcação de pessoas", type: "text", Icon: AtSign },
    { id: "ai_content", label: "Conteúdo gerado por AI", type: "toggle", Icon: Cpu }
  ],
  "FACEBOOK_FEED": [
    { id: "image_360", label: "Imagem 360", type: "toggle", Icon: Rotate3d },
    { id: "location", label: "Localização", type: "text", Icon: MapPin }
  ],
  "FACEBOOK_REELS": [
    { id: "location", label: "Localização", type: "text", Icon: MapPin },
    { id: "collab", label: "Colaborador", type: "text", Icon: Handshake }
  ],
  "YOUTUBE_VIDEO": [
    { id: "title", label: "Título do vídeo", type: "text", Icon: AlignLeft },
    { id: "privacy", label: "Privacidade", type: "select", Icon: Lock },
    { id: "tags", label: "Tags", type: "text", Icon: Tag },
    { id: "category", label: "Categoria", type: "text", Icon: Box },
    { id: "kids", label: "Conteúdo para crianças", type: "toggle", Icon: ToggleLeft }
  ],
  "YOUTUBE_SHORTS": [
    { id: "title", label: "Título do vídeo", type: "text", Icon: AlignLeft },
    { id: "privacy", label: "Privacidade", type: "select", Icon: Lock },
    { id: "tags", label: "Tags", type: "text", Icon: Tag },
    { id: "category", label: "Categoria", type: "text", Icon: Box },
    { id: "kids", label: "Conteúdo para crianças", type: "toggle", Icon: ToggleLeft }
  ],
  "TIKTOK_VIDEO": [
    { id: "commercial_music", label: "Música comercial", type: "toggle", Icon: Music },
    { id: "disable_comments", label: "Desativar comentários", type: "toggle", Icon: MessageSquareOff },
    { id: "disable_duet", label: "Desativar duetos", type: "toggle", Icon: MessageSquareOff },
    { id: "disable_stitch", label: "Desativar costura", type: "toggle", Icon: MessageSquareOff },
    { id: "promotional", label: "Conteúdo promocional", type: "toggle", Icon: BookOpen },
    { id: "paid_partnership", label: "Parceria paga", type: "toggle", Icon: Megaphone },
    { id: "auto_music", label: "Auto música", type: "toggle", Icon: Music },
    { id: "privacy", label: "Privacidade", type: "select", Icon: Lock },
    { id: "title", label: "Título", type: "text", Icon: AlignLeft },
    { id: "ai_content", label: "Conteúdo gerado por AI", type: "toggle", Icon: Cpu }
  ]
};

export default function ComposePage() {
  const router = useRouter();
  const user = useStore((state) => state.user);
  const token = useStore((state) => state.token);

  // Estados Básicos
  const [content, setContent] = useState("");
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [connections, setConnections] = useState<any[]>([]);

  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);

  const [advancedSettings, setAdvancedSettings] = useState<Record<string, any>>({});
  const [editingSettingsFor, setEditingSettingsFor] = useState<string | null>(null);
  const [expandedOptionId, setExpandedOptionId] = useState<string | null>(null);

  const [activePreviewTab, setActivePreviewTab] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !user) {
      router.push("/login");
      return;
    }

    // Busca conexões para permitir escolher em qual conta postar
    fetch(`http://localhost:4001/social/${user.workspaceId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setConnections(data.filter(c => c.status === "ACTIVE"));
        }
      })
      .catch(err => console.error(err));
  }, [user, token, router]);

  const activeConnectionId = useStore((state) => state.activeConnectionId);
  const [activeBasePlatforms, setActiveBasePlatforms] = useState<string[]>([]);

  // As contas ativas baseadas no seletor global do header (que agora guarda o username)
  const effectiveConnections = activeConnectionId 
    ? connections.filter(c => c.username === activeConnectionId)
    : connections;
  
  // As plataformas que o usuário REALMENTE possui conectadas nas contas efetivas
  const availablePlatforms = Array.from(new Set(effectiveConnections.map(c => c.platform)));

  useEffect(() => {
    // Se a conta global mudar, resetamos a seleção de plataformas
    if (activeConnectionId) {
      const connsForUser = connections.filter(c => c.username === activeConnectionId);
      if (connsForUser.length > 0) {
        const platforms = Array.from(new Set(connsForUser.map(c => c.platform)));
        setActiveBasePlatforms(platforms);
        
        // Pega o primeiro formato de cada plataforma encontrada
        const initialFormats = platforms.flatMap(plat => {
          const platformObj = platformsMeta.find(p => p.id === plat);
          return platformObj && platformObj.formats.length > 0 ? [platformObj.formats[0].id] : [];
        });
        setSelectedFormats(initialFormats);
      }
    } else {
      setActiveBasePlatforms([]);
      setSelectedFormats([]);
    }
  }, [activeConnectionId, connections]);

  useEffect(() => {
    if (activeBasePlatforms.length > 0 && (!activePreviewTab || !activeBasePlatforms.includes(activePreviewTab))) {
      setActivePreviewTab(activeBasePlatforms[0]);
    } else if (activeBasePlatforms.length === 0) {
      setActivePreviewTab(null);
    }
  }, [activeBasePlatforms]);

  const toggleBasePlatform = (baseId: string) => {
    setActiveBasePlatforms(prev => {
      if (prev.includes(baseId)) {
        setSelectedFormats(formats => formats.filter(f => !f.startsWith(baseId)));
        return prev.filter(x => x !== baseId);
      } else {
        const platformObj = platformsMeta.find(p => p.id === baseId);
        if (platformObj && platformObj.formats.length > 0) {
          setSelectedFormats(formats => [...formats, platformObj.formats[0].id]);
        }
        return [...prev, baseId];
      }
    });
  };

  const toggleFormat = (formatId: string) => {
    setSelectedFormats(prev => prev.includes(formatId) ? prev.filter(x => x !== formatId) : [...prev, formatId]);
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setMediaFiles(prev => [...prev, ...newFiles]);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setMediaPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSettingChange = (formatId: string, settingId: string, value: any) => {
    setAdvancedSettings(prev => ({
      ...prev,
      [formatId]: { ...(prev[formatId] || {}), [settingId]: value }
    }));
  };

  const hasSettingsApplied = (formatId: string) => {
    const settingsObj = advancedSettings[formatId];
    if (!settingsObj) return false;
    return Object.values(settingsObj).some(val => val !== "" && val !== false && val !== undefined);
  };

  const handlePublish = async () => {
    if (!content.trim() || selectedFormats.length === 0 || !user || !token || effectiveConnections.length === 0) return;
    setIsSubmitting(true);
    try {
      let scheduledFor = undefined;
      if (scheduledDate && scheduledTime) scheduledFor = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
      const mockMediaUrls = mediaPreviews.length > 0 ? ["https://picsum.photos/400/300"] : [];
      
      const targets = effectiveConnections
        .filter(c => activeBasePlatforms.includes(c.platform))
        .flatMap(c => 
          selectedFormats
            .filter(f => f.startsWith(c.platform))
            .map(f => `${c.id}:::${f}`)
        );

      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          workspaceId: user.workspaceId, 
          content, 
          platforms: targets, 
          mediaUrls: mockMediaUrls, 
          scheduledFor, 
          advancedSettings
        }),
      });

      if (!response.ok) throw new Error("Falha na API");
      
      setSuccess(true);
      setContent("");
      setSelectedFormats([]);
      setMediaFiles([]);
      setMediaPreviews([]);
      setScheduledDate("");
      setScheduledTime("");
      setAdvancedSettings({});
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Erro ao publicar post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activePlatformDetails = editingSettingsFor ? platformsMeta.find(p => p.formats.some(f => f.id === editingSettingsFor)) : null;
  const editingFormatDetails = activePlatformDetails?.formats.find(f => f.id === editingSettingsFor);

  if (!user) return null;

  return (
    <div className="flex-1 p-8 max-w-[1600px] mx-auto overflow-y-auto w-full bg-background min-h-screen relative">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agendar Post</h1>
          <p className="text-muted-foreground text-sm mt-1">Crie conteúdo e visualize em tempo real no simulador.</p>
        </div>
        <button 
          onClick={handlePublish}
          disabled={isSubmitting || selectedFormats.length === 0 || (!content.trim() && mediaFiles.length === 0)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full font-medium transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 z-10"
        >
          {isSubmitting ? "Processando..." : (scheduledDate ? "Agendar Publicação" : "Publicar Agora")}
        </button>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-500/10 text-green-500 rounded-xl border border-green-500/20 flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center shrink-0"><Check className="w-5 h-5" /></div>
          <div><h3 className="font-semibold">Sucesso!</h3><p className="text-sm opacity-90">Sua publicação foi enviada perfeitamente.</p></div>
        </div>
      )}

      {/* NOVO GRID: 3 COLUNAS */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative">
        
        {/* COLUNA 1: PERFIS E REDES (Span 3) */}
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-card p-5 rounded-2xl shadow-sm border border-border/50">
            <h2 className="font-bold text-foreground mb-4">1. Canais e Formatos</h2>
            {availablePlatforms.length === 0 ? (
              <p className="text-sm text-muted-foreground/80 italic">Nenhuma conta conectada neste workspace.</p>
            ) : (
              <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b border-border/50">
                {platformsMeta
                  .filter(p => availablePlatforms.includes(p.id))
                  .map(p => (
                  <button 
                    key={p.id}
                    onClick={() => toggleBasePlatform(p.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all shadow-sm border 
                      ${activeBasePlatforms.includes(p.id) ? 
                        (p.id === 'INSTAGRAM' ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 text-white border-transparent scale-110' : 'bg-blue-600 text-white border-blue-600 scale-110') 
                        : 'bg-secondary/50 text-muted-foreground hover:bg-secondary border-transparent'}
                    `}
                  >
                    <p.Icon />
                  </button>
                ))}
              </div>
            )}
            {activeBasePlatforms.length > 0 && (
              <div className="space-y-4">
                {activeBasePlatforms.map(baseId => {
                  const platform = platformsMeta.find(p => p.id === baseId);
                  return (
                    <div key={baseId} className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-foreground/90">{platform?.name}</span>
                      <div className="flex gap-2 flex-wrap">
                        {platform?.formats.map(fmt => (
                          <button
                            key={fmt.id} onClick={() => toggleFormat(fmt.id)}
                            className={`px-3 py-1 text-xs font-bold rounded-full border transition-all ${
                              selectedFormats.includes(fmt.id) ? `bg-primary/20 text-primary border-primary/30` : `bg-secondary/50 text-muted-foreground border-border/50 hover:bg-secondary`
                            }`}
                          >{fmt.label}</button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* COLUNA 2: CONTEÚDO E CONFIGURAÇÕES (Span 5) */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-card rounded-2xl shadow-sm border border-border/50 flex flex-col">
            <div className="p-4 border-b border-border/50 flex justify-between items-center bg-secondary/30">
              <h2 className="font-bold text-foreground">3. Texto do post</h2>
              <button className="flex items-center gap-1 text-sm font-semibold text-orange-500 bg-orange-500/10 hover:bg-orange-500/20 transition-colors px-3 py-1 rounded-full"><Sparkles className="w-4 h-4"/> IA</button>
            </div>
            <textarea 
              className="w-full min-h-[250px] p-4 outline-none resize-none bg-transparent text-foreground/90 text-lg leading-relaxed"
              placeholder="Digite o seu texto incrível aqui..."
              value={content} onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="bg-card p-5 rounded-2xl shadow-sm border border-border/50">
            <h2 className="font-bold text-foreground mb-4">4. Mídias</h2>
            <div className="flex gap-2 mb-4">
              <input type="file" multiple ref={fileInputRef} onChange={handleMediaUpload} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-sm font-semibold text-orange-500 border border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 transition-colors px-4 py-2 rounded-lg"><ImageIcon className="w-4 h-4" /> Computador</button>
            </div>
            {mediaPreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {mediaPreviews.map((preview, i) => (
                  <div key={i} className="relative aspect-square bg-secondary rounded-lg overflow-hidden group">
                    <img src={preview} className="w-full h-full object-cover" />
                    <button onClick={() => removeMedia(i)} className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card p-5 rounded-2xl shadow-sm border border-border/50">
            <h2 className="font-bold text-foreground mb-4">5. Data e horário</h2>
            <div className="flex items-center gap-4 bg-secondary/30 p-4 rounded-xl border border-border/50">
              <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} className="w-full rounded-xl shadow-sm border border-border/50 bg-background font-bold text-foreground p-3 outline-none" />
              <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} className="w-40 rounded-xl shadow-sm border border-border/50 bg-background font-bold text-foreground p-3 outline-none" />
            </div>
          </div>
          
          {selectedFormats.length > 0 && (
            <div className="bg-card p-5 rounded-2xl shadow-sm border border-border/50">
              <h2 className="font-bold text-foreground mb-1">6. Configurações Avançadas</h2>
              <p className="text-muted-foreground text-sm mb-4">Personalize seu post aplicando as configurações avançadas.</p>
              <div className="divide-y divide-gray-100 border border-border/50 rounded-xl overflow-hidden">
                {selectedFormats.map(formatId => {
                  const basePlatform = platformsMeta.find(p => p.formats.some(f => f.id === formatId));
                  const formatDetails = basePlatform?.formats.find(f => f.id === formatId);
                  const Icon = basePlatform?.Icon || FaInstagram;
                  const hasSettings = hasSettingsApplied(formatId);
                  if (!advancedSettingsSchema[formatId]) return null;

                  return (
                    <div key={formatId} className="p-3 flex items-center justify-between hover:bg-secondary/30">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${basePlatform?.id === 'INSTAGRAM' ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500' : 'bg-blue-600'}`}><Icon /></div>
                        <span className="font-semibold text-sm text-foreground">{basePlatform?.name} {formatDetails?.label !== basePlatform?.name ? formatDetails?.label : ''}</span>
                      </div>
                      <button onClick={() => setEditingSettingsFor(formatId)} className={`p-2 rounded-full flex items-center gap-1 ${hasSettings ? 'text-green-500' : 'text-muted-foreground/80'}`}>
                        <Settings className="w-5 h-5" />
                        {hasSettings && <CheckCircle2 className="w-4 h-4 absolute translate-x-4 -translate-y-2 bg-card rounded-full" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* COLUNA 3: SIMULADOR MOBILE ADERENTE (Span 4) */}
        <div className="xl:col-span-4 h-full relative">
          <div className="sticky top-8 bg-card p-5 rounded-3xl shadow-xl border border-border h-max max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* TABS DO PREVIEW */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 shrink-0">
              {activeBasePlatforms.length === 0 && <div className="text-sm text-muted-foreground/80">Selecione uma rede para ver o preview.</div>}
              {activeBasePlatforms.map(baseId => {
                const platform = platformsMeta.find(p => p.id === baseId);
                const isActive = activePreviewTab === baseId;
                return (
                  <button 
                    key={baseId} onClick={() => setActivePreviewTab(baseId)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all shrink-0 ${isActive ? (baseId === 'INSTAGRAM' ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 text-white' : 'bg-blue-600 text-white') : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'}`}
                  >
                    <platform.Icon /> {platform?.name}
                  </button>
                )
              })}
            </div>

            {/* O CELULAR VIRTUAL */}
            <div className="w-[260px] h-[520px] mx-auto border-[6px] border-gray-900 rounded-[2rem] overflow-hidden bg-card shadow-inner relative flex flex-col shrink-0">
              {/* Notch */}
              <div className="absolute top-0 inset-x-0 h-4 bg-foreground rounded-b-2xl w-32 mx-auto z-20"></div>
              {/* Status Bar */}
              <div className="h-5 bg-card w-full z-10 flex justify-between items-center px-4 text-[9px] font-bold pt-1">
                <span>9:41</span>
                <div className="flex gap-1 items-center"><div className="w-2.5 h-2 bg-black rounded-sm"></div><div className="w-3.5 h-2 bg-black rounded-sm"></div></div>
              </div>

              {/* CONTEÚDO DINÂMICO */}
              <div className="flex-1 overflow-y-auto bg-card pb-8">
                {activePreviewTab === "INSTAGRAM" && (
                  <div className="animate-in fade-in">
                    <div className="flex items-center justify-between p-3 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 p-0.5"><div className="w-full h-full bg-card rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold">W</div></div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">{user.name.toLowerCase()}_oficial</span>
                          {advancedSettings["INSTAGRAM_FEED"]?.location && <span className="text-[9px] text-muted-foreground">{advancedSettings["INSTAGRAM_FEED"].location}</span>}
                        </div>
                      </div>
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="w-full aspect-square bg-secondary/50 flex items-center justify-center">
                      {mediaPreviews[0] ? <img src={mediaPreviews[0]} className="w-full h-full object-cover" /> : <ImageIcon className="w-12 h-12 text-gray-300" />}
                    </div>
                    <div className="p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex gap-3"><Heart className="w-6 h-6" /><MessageCircle className="w-6 h-6" /><Send className="w-6 h-6" /></div>
                        <Bookmark className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold mb-1">1.234 curtidas</p>
                      <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                        <span className="font-bold mr-1">{user.name.toLowerCase()}_oficial</span>{content || "Sua legenda fantástica aparecerá aqui..."}
                      </p>
                    </div>
                  </div>
                )}
                {activePreviewTab === "FACEBOOK" && (
                  <div className="animate-in fade-in">
                    <div className="flex items-center gap-2 p-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">W</div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground">{user.name} Workspace</span>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><span>Agora</span> · <Globe className="w-3 h-3" /></div>
                      </div>
                    </div>
                    <div className="px-3 pb-2"><p className="text-sm text-foreground whitespace-pre-wrap">{content || "No que você está pensando?"}</p></div>
                    <div className="w-full min-h-[250px] bg-secondary/50 flex items-center justify-center">
                      {mediaPreviews[0] ? <img src={mediaPreviews[0]} className="w-full h-full object-cover" /> : <ImageIcon className="w-12 h-12 text-gray-300" />}
                    </div>
                    <div className="p-3 border-t border-border mt-2 flex justify-between text-muted-foreground">
                      <button className="flex items-center gap-1 text-xs font-semibold"><ThumbsUp className="w-4 h-4"/> Curtir</button>
                      <button className="flex items-center gap-1 text-xs font-semibold"><MessageSquare className="w-4 h-4"/> Comentar</button>
                      <button className="flex items-center gap-1 text-xs font-semibold"><Share2 className="w-4 h-4"/> Compartilhar</button>
                    </div>
                  </div>
                )}
                {!["INSTAGRAM", "FACEBOOK"].includes(activePreviewTab || "") && activePreviewTab !== null && (
                  <div className="p-8 text-center text-muted-foreground/80 mt-10">
                    <p className="text-sm">Preview visual em desenvolvimento.</p>
                  </div>
                )}
              </div>
              <div className="absolute bottom-2 inset-x-0 flex justify-center"><div className="w-1/3 h-1 bg-black rounded-full opacity-20"></div></div>
            </div>

          </div>
        </div>
      </div>

      {/* === MODAL DE CONFIGURAÇÕES AVANÇADAS === */}
      <AnimatePresence>
        {editingSettingsFor && editingFormatDetails && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }}
              className="bg-card w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-border/50 bg-secondary/30">
                <button onClick={() => { setEditingSettingsFor(null); setExpandedOptionId(null); }} className="flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800">
                  <ArrowLeft className="w-5 h-5" /> Voltar
                </button>
                <div className="flex items-center gap-2 font-bold text-foreground/90">
                  {activePlatformDetails?.name} {editingFormatDetails.label}
                  {activePlatformDetails && <activePlatformDetails.Icon className="text-xl opacity-80" />}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-card">
                <div className="divide-y divide-gray-100">
                  {advancedSettingsSchema[editingSettingsFor]?.map(option => {
                    const isExpanded = expandedOptionId === option.id;
                    const currentValue = advancedSettings[editingSettingsFor]?.[option.id];
                    return (
                      <div key={option.id} className="flex flex-col">
                        <div 
                          onClick={() => {
                            if (option.type !== 'toggle') setExpandedOptionId(isExpanded ? null : option.id);
                            else handleSettingChange(editingSettingsFor, option.id, !currentValue);
                          }}
                          className={`flex items-center justify-between p-5 cursor-pointer hover:bg-secondary/30 transition-colors ${isExpanded ? 'bg-secondary/30' : ''}`}
                        >
                          <div className="flex items-center gap-3 text-foreground/90 font-semibold"><option.Icon className="w-5 h-5 text-muted-foreground" />{option.label}</div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {option.type !== 'toggle' && currentValue && !isExpanded && <span className="max-w-[150px] truncate text-indigo-600 font-medium">{currentValue}</span>}
                            {option.type === 'toggle' ? (
                              <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${currentValue ? 'bg-green-500' : 'bg-gray-300'}`}>
                                <div className={`w-4 h-4 bg-card rounded-full transition-transform ${currentValue ? 'translate-x-5' : 'translate-x-0'}`} />
                              </div>
                            ) : <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90 text-indigo-500' : 'text-muted-foreground/80'}`} />}
                          </div>
                        </div>
                        <AnimatePresence>
                          {isExpanded && option.type !== 'toggle' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-secondary/30/50 px-5 pb-5 pt-1">
                              {option.type === 'text' && <input type="text" placeholder={`Digite ${option.label.toLowerCase()}...`} value={currentValue || ""} onChange={e => handleSettingChange(editingSettingsFor, option.id, e.target.value)} className="w-full p-3 rounded-xl border border-border outline-none focus:ring-2 focus:ring-indigo-500 text-foreground" />}
                              {option.type === 'textarea' && <textarea placeholder={`Digite ${option.label.toLowerCase()}...`} value={currentValue || ""} onChange={e => handleSettingChange(editingSettingsFor, option.id, e.target.value)} className="w-full p-3 rounded-xl border border-border outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] resize-none text-foreground" />}
                              {option.type === 'select' && (
                                <select value={currentValue || ""} onChange={e => handleSettingChange(editingSettingsFor, option.id, e.target.value)} className="w-full p-3 rounded-xl border border-border outline-none focus:ring-2 focus:ring-indigo-500 bg-card text-foreground">
                                  <option value="">Selecione...</option><option value="public">Público</option><option value="private">Privado</option><option value="unlisted">Não listado</option>
                                </select>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
