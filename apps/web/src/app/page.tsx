"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Activity, TrendingUp, MousePointerClick, 
  ArrowUpRight, ArrowDownRight, CalendarRange, 
  Sparkles, Zap, PieChart, LayoutDashboard, Heart, MessageSquare, Share2, Clapperboard, Layers, Image as ImageIcon, Video, FileText, Smartphone,
  Download
} from "lucide-react";
import { FaInstagram, FaFacebook, FaYoutube, FaTiktok, FaLinkedin, FaTwitter } from "react-icons/fa";
import { useStore } from "@/store/useStore";
import { API_URL } from "@/lib/api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Constantes Visuais adaptadas para o Dark/Light theme sem quebrar o Shadcn
const platformsMeta = [
  { id: "ALL", name: "Visão Geral", Icon: LayoutDashboard, color: "text-zinc-100", activeBg: "bg-primary/20", activeBorder: "border-primary/50" },
  { id: "INSTAGRAM", name: "Instagram", Icon: FaInstagram, color: "text-pink-500", activeBg: "bg-pink-500/10", activeBorder: "border-pink-500/30" },
  { id: "FACEBOOK", name: "Facebook", Icon: FaFacebook, color: "text-blue-500", activeBg: "bg-blue-500/10", activeBorder: "border-blue-500/30" },
  { id: "YOUTUBE", name: "YouTube", Icon: FaYoutube, color: "text-red-500", activeBg: "bg-red-500/10", activeBorder: "border-red-500/30" },
  { id: "TIKTOK", name: "TikTok", Icon: FaTiktok, color: "text-zinc-300", activeBg: "bg-zinc-500/10", activeBorder: "border-zinc-500/30" },
  { id: "LINKEDIN", name: "LinkedIn", Icon: FaLinkedin, color: "text-indigo-400", activeBg: "bg-indigo-500/10", activeBorder: "border-indigo-500/30" },
];

const mockTopPosts = [
  { id: 1, platform: "INSTAGRAM", content: "Lançamento da nova funcionalidade de IA...", likes: "12K", comments: "450", reach: "85K" },
  { id: 2, platform: "LINKEDIN", content: "Como estruturar um time ágil de engenharia...", likes: "4.2K", comments: "120", reach: "32K" },
  { id: 3, platform: "FACEBOOK", content: "Thread: 5 dicas para otimizar queries lentas.", likes: "8K", comments: "310", reach: "50K" },
  { id: 4, platform: "YOUTUBE", content: "Tutorial completo de Automação com IA (2026)", likes: "15K", comments: "1.2K", reach: "200K" },
];

const fallbackMetrics = {
  overview: { followers: 248500, reach: 1200000, engagementRate: 4.8, clicks: 12490 },
  breakdownByPlatform: [
    { platform: "INSTAGRAM", data: { followers: 150000, reach: 800000, engagementRate: 6.2, clicks: 8000 } },
    { platform: "FACEBOOK", data: { followers: 60000, reach: 250000, engagementRate: 3.1, clicks: 3000 } },
    { platform: "LINKEDIN", data: { followers: 38500, reach: 150000, engagementRate: 8.5, clicks: 1490 } },
    { platform: "YOUTUBE", data: { followers: 45000, reach: 350000, engagementRate: 7.4, clicks: 5000 } },
    { platform: "TIKTOK", data: { followers: 85000, reach: 900000, engagementRate: 9.1, clicks: 1200 } },
  ]
};

// Dados Mockados da Produção Mensal por Formato
const contentProductionMock: Record<string, any[]> = {
  "INSTAGRAM": [
    { label: "Reels", count: 18, color: "bg-gradient-to-r from-orange-400 to-pink-500", Icon: Clapperboard },
    { label: "Carrosséis", count: 8, color: "bg-pink-500", Icon: Layers },
    { label: "Posts Estáticos", count: 12, color: "bg-purple-500", Icon: ImageIcon },
    { label: "Stories", count: 65, color: "bg-fuchsia-500", Icon: Smartphone }
  ],
  "FACEBOOK": [
    { label: "Vídeos", count: 5, color: "bg-blue-600", Icon: Video },
    { label: "Imagens Estáticas", count: 14, color: "bg-blue-400", Icon: ImageIcon },
    { label: "Posts de Link", count: 9, color: "bg-cyan-500", Icon: Share2 }
  ],
  "YOUTUBE": [
    { label: "Vídeos Longos", count: 4, color: "bg-red-600", Icon: FaYoutube },
    { label: "Shorts", count: 15, color: "bg-red-400", Icon: Smartphone }
  ],
  "TIKTOK": [
    { label: "Vídeos Curtos", count: 22, color: "bg-zinc-200 text-black", Icon: Smartphone },
    { label: "Lives", count: 2, color: "bg-zinc-500 text-white", Icon: Video }
  ],
  "LINKEDIN": [
    { label: "Artigos Longos", count: 3, color: "bg-indigo-600", Icon: FileText },
    { label: "Imagens Profissionais", count: 10, color: "bg-blue-500", Icon: ImageIcon },
    { label: "Documentos (PDF)", count: 4, color: "bg-sky-500", Icon: Layers }
  ]
};

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const { user, token, activeConnectionId } = useStore();
  
  const [rawMetrics, setRawMetrics] = useState<any>(null);
  const [rawPosts, setRawPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [availablePlatforms, setAvailablePlatforms] = useState<string[]>(["ALL", "INSTAGRAM", "FACEBOOK", "YOUTUBE", "LINKEDIN", "TIKTOK"]);
  
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  useEffect(() => {
    if (!user || !token) return;

    const fetchMetricsAndPosts = async () => {
      try {
        const metricsUrl = activeConnectionId 
          ? `${API_URL}/metrics/consolidated/${user.workspaceId}?username=${encodeURIComponent(activeConnectionId)}`
          : `${API_URL}/metrics/consolidated/${user.workspaceId}`;

        const [metricsRes, postsRes] = await Promise.all([
          fetch(metricsUrl, { headers: { "Authorization": `Bearer ${token}` } }),
          fetch(`${API_URL}/posts/${user.workspaceId}`, { headers: { "Authorization": `Bearer ${token}` } })
        ]);
        
        if (metricsRes.ok) {
          const data = await metricsRes.json();
          if (data.overview && (data.overview.followers > 0 || activeConnectionId)) {
            setRawMetrics(data);
          } else {
            setRawMetrics(fallbackMetrics);
          }
        }

        if (postsRes.ok) {
          const posts = await postsRes.json();
          setRawPosts(posts);
        }
      } catch (err) {
        setRawMetrics(fallbackMetrics);
      }
    };
    fetchMetricsAndPosts();
  }, [user, token, activeConnectionId]);

  const getCurrentMetricsData = () => {
    if (!rawMetrics) return fallbackMetrics.overview;
    if (activeTab === "ALL") return rawMetrics.overview;
    const platformData = rawMetrics.breakdownByPlatform.find((b: any) => b.platform === activeTab);
    return platformData ? platformData.data : fallbackMetrics.overview;
  };

  const getContentStats = () => {
    let videos = 0;
    let images = 0;
    let links = 0;

    rawPosts.forEach(post => {
      // Se tiver aba ativa, checa se a plataforma está inclusa no post
      if (activeTab !== "ALL") {
        try {
          const platforms = JSON.parse(post.platforms || "[]");
          if (!platforms.includes(activeTab)) return;
        } catch(e) { return; }
      }

      try {
        const media = JSON.parse(post.mediaUrls || "[]");
        if (media && media.length > 0) {
          if (media[0].includes('video') || media[0].includes('mp4') || post.content?.toLowerCase().includes('vídeo')) {
            videos++;
          } else {
            images++;
          }
        } else {
          links++;
        }
      } catch(e) {}
    });

    return [
      { label: "Vídeos", count: videos, color: "bg-blue-600", Icon: Video },
      { label: "Imagens Estáticas", count: images, color: "bg-blue-400", Icon: ImageIcon },
      { label: "Carrossel", count: links, color: "bg-cyan-500", Icon: Layers }
    ];
  };

  const contentStats = getContentStats();

  const currentData = getCurrentMetricsData();

  const dashboardCards = [
    { id: 1, title: "Total de Seguidores", value: currentData.followers.toLocaleString(), change: "+12.5%", trend: "up", icon: <Users className="w-5 h-5 text-blue-400" /> },
    { id: 2, title: "Alcance Orgânico", value: currentData.reach.toLocaleString(), change: "+8.2%", trend: "up", icon: <Activity className="w-5 h-5 text-emerald-400" /> },
    { id: 3, title: "Taxa de Engajamento", value: `${currentData.engagementRate}%`, change: "-1.1%", trend: "down", icon: <PieChart className="w-5 h-5 text-purple-400" /> },
    { id: 4, title: "Cliques no Link", value: currentData.clicks.toLocaleString(), change: "+24.4%", trend: "up", icon: <MousePointerClick className="w-5 h-5 text-amber-400" /> },
  ];

  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    if (!dashboardRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2, // Melhor qualidade
        useCORS: true,
        backgroundColor: "#09090b" // bg-background padrão do dark theme
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`relatorio-metricas-${format(new Date(), "dd-MM-yyyy")}.pdf`);
    } catch (err) {
      console.error("Erro ao gerar PDF", err);
    } finally {
      setIsExporting(false);
    }
  };

  // Identifica quais plataformas realmente têm dados para exibir as abas
  const dynamicPlatforms = rawMetrics && rawMetrics.breakdownByPlatform 
    ? rawMetrics.breakdownByPlatform.map((b: any) => b.platform)
    : [];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col overflow-y-auto" ref={dashboardRef}>
      
      {/* Header Clássico Preservado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 data-html2canvas-ignore">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500">Visão Geral</h1>
          <p className="text-muted-foreground mt-1 text-sm">Métricas consolidadas de todas as suas contas conectadas.</p>
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-secondary rounded-lg border border-border" data-html2canvas-ignore>
          
          <button
            onClick={exportToPDF}
            disabled={isExporting}
            className="px-3 py-1.5 mr-2 rounded-md text-sm font-medium transition-all flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            title="Baixar Relatório (PDF)"
          >
            {isExporting ? <span className="animate-spin mr-2 border-2 border-t-transparent border-white rounded-full w-4 h-4"></span> : <Download className="w-4 h-4 mr-2" />}
            {isExporting ? "Gerando..." : "Baixar PDF"}
          </button>
          
          <div className="w-px h-6 bg-border mx-1"></div>

          {["24h", "7d", "30d"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                timeRange === range 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {range}
            </button>
          ))}
          
          <div className="relative">
            <button
              onClick={() => setShowCustomDate(!showCustomDate)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center justify-center ${
                timeRange === "Custom" || showCustomDate
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Período Personalizado"
            >
              <CalendarRange className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showCustomDate && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowCustomDate(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 p-4 bg-card border border-border rounded-xl shadow-xl z-50 w-72"
                  >
                    <h3 className="font-semibold text-foreground text-sm mb-3">Período Personalizado</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Data Inicial</label>
                        <input 
                          type="date" 
                          value={customStart}
                          onChange={(e) => setCustomStart(e.target.value)}
                          className="w-full bg-background border border-border/50 rounded-lg p-2 text-sm text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Data Final</label>
                        <input 
                          type="date" 
                          value={customEnd}
                          onChange={(e) => setCustomEnd(e.target.value)}
                          className="w-full bg-background border border-border/50 rounded-lg p-2 text-sm text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                      <button 
                        onClick={() => {
                          if (customStart && customEnd) {
                            setTimeRange("Custom");
                            setShowCustomDate(false);
                          }
                        }}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Aplicar
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* FILTRO POR PLATAFORMAS (TABS) - Agora dinâmico baseado nos dados recebidos */}
      {dynamicPlatforms.length > 0 && (
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 custom-scrollbar">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all border ${
              activeTab === "ALL"
              ? 'bg-primary border-primary shadow-sm text-primary-foreground' 
              : 'bg-secondary/50 border-border text-muted-foreground hover:bg-secondary hover:border-border/80'
            }`}
          >
            Geral
          </button>
          {dynamicPlatforms.map((platId: string) => {
            const meta = platformsMeta.find(p => p.id === platId) || platformsMeta[0];
            const isActive = activeTab === platId;
            return (
              <button
                key={platId}
                onClick={() => setActiveTab(platId)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all border ${
                  isActive 
                  ? `${meta.activeBg} ${meta.activeBorder} shadow-sm text-foreground` 
                  : 'bg-secondary/50 border-border text-muted-foreground hover:bg-secondary hover:border-border/80'
                }`}
              >
                <meta.Icon className={`text-lg ${isActive ? meta.color : 'text-muted-foreground opacity-70'}`} />
                {meta.name}
              </button>
            );
          })}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnimatePresence mode="wait">
          {dashboardCards.map((m, idx) => (
            <motion.div
              key={`${activeTab}-${m.id}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05, duration: 0.2 }}
              className="glass-card rounded-xl p-6 border border-border hover:border-border/80 transition-colors relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
              
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-secondary rounded-lg border border-border/50 shadow-inner">
                  {m.icon}
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                  m.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {m.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {m.change}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{m.title}</p>
                <h3 className="text-3xl font-bold text-foreground tracking-tight">{m.value}</h3>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Área Inferior (Gráficos e Top Posts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RELATÓRIO DE FORMATOS */}
        <div className="lg:col-span-2 glass-card rounded-xl border border-border p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-foreground text-lg">Produção de Conteúdo</h3>
              <p className="text-sm text-muted-foreground">Volume de publicações no mês atual por formato.</p>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="space-y-4">
              {contentStats.map((format, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${format.color}`}>
                      <format.Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-foreground">{format.label}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 flex-1 max-w-[60%] justify-end">
                    <div className="hidden sm:block flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(format.count * 5, 100)}%` }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                        className={`h-full rounded-full ${format.color}`}
                      />
                    </div>
                    <span className="text-xl font-bold text-foreground min-w-[3rem] text-right">
                      {format.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Posts */}
        <div className="glass-card rounded-xl border border-border p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-foreground">Top Publicações</h3>
            <div className="p-1.5 bg-yellow-500/10 text-yellow-500 rounded-lg border border-yellow-500/20"><Zap className="w-4 h-4" /></div>
          </div>
          
          <div className="flex flex-col gap-4">
            {mockTopPosts.map((post) => {
              const PlatformIcon = platformsMeta.find(p => p.id === post.platform)?.Icon || FaInstagram;
              const colorClass = platformsMeta.find(p => p.id === post.platform)?.color || 'text-zinc-100';
              
              let targetPlatform = activeTab;
              if (activeConnectionId) {
                const c = rawMetrics?.breakdownByPlatform?.[0];
                if (c) targetPlatform = c.platform;
              }

              if (targetPlatform !== "ALL" && post.platform !== targetPlatform) return null;

              return (
                <div key={post.id} className="p-4 rounded-xl border border-border/50 bg-secondary/20 hover:border-primary/50 hover:bg-primary/5 transition-colors group cursor-pointer">
                  <div className="flex gap-3">
                    <div className="mt-1">
                      <PlatformIcon className={`w-5 h-5 ${colorClass}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-300 line-clamp-2 mb-3 group-hover:text-primary transition-colors">
                        {post.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                        <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> {post.likes}</span>
                        <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> {post.comments}</span>
                        <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> {post.reach}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {activeTab !== "ALL" && !mockTopPosts.some(p => p.platform === activeTab) && (
              <div className="p-8 text-center text-muted-foreground">
                Nenhum post em destaque para esta rede.
              </div>
            )}
          </div>
          
          <button className="mt-auto pt-6 w-full text-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Ver todas as publicações
          </button>
        </div>
      </div>
      
    </div>
  );
}
