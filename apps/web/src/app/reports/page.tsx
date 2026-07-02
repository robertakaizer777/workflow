"use client";

import { motion } from "framer-motion";
import { Download, Share2, TrendingUp, Users, Eye, BarChart3, ChevronDown } from "lucide-react";

export default function ReportsPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const reportCards = [
    { title: "Crescimento da Audiência", value: "+12.5%", subtitle: "vs mês anterior", icon: Users, color: "text-blue-400" },
    { title: "Alcance Médio por Post", value: "45.2K", subtitle: "+5.2% vs mês anterior", icon: Eye, color: "text-purple-400" },
    { title: "Taxa de Engajamento", value: "8.4%", subtitle: "Acima da média do setor", icon: TrendingUp, color: "text-emerald-400" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-primary" /> Relatórios Consolidados
            </h1>
            <p className="text-muted-foreground mt-2">
              Analise o desempenho de todas as suas redes em um único lugar.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium text-sm border border-border hover:bg-secondary/80 transition-colors">
              <Share2 className="w-4 h-4" /> Compartilhar Link
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(195,0,16,0.2)]">
              <Download className="w-4 h-4" /> Exportar PDF
            </button>
          </div>
        </motion.div>

        {/* Filtros */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border rounded-lg text-sm cursor-pointer hover:bg-secondary/80">
            <span>Últimos 30 Dias</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border rounded-lg text-sm cursor-pointer hover:bg-secondary/80">
            <span>Todas as Plataformas</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
        </motion.div>

        {/* Highlights */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reportCards.map((card, i) => (
            <motion.div key={i} variants={itemVariants} className="glass-card p-6 rounded-xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <card.icon className={`w-32 h-32 ${card.color}`} />
              </div>
              <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
              <h2 className="text-4xl font-bold mt-2">{card.value}</h2>
              <p className={`text-sm mt-2 font-medium ${card.color}`}>{card.subtitle}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Placeholder para Gráficos Reais (Chart.js / Recharts) */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-xl p-6 h-80 flex flex-col">
            <h3 className="font-semibold text-lg mb-4">Evolução de Seguidores</h3>
            <div className="flex-1 border border-dashed border-border rounded-lg flex items-center justify-center bg-secondary/20">
              <p className="text-muted-foreground text-sm">Componente de Gráfico de Linha (Recharts)</p>
            </div>
          </div>
          
          <div className="glass-card rounded-xl p-6 h-80 flex flex-col">
            <h3 className="font-semibold text-lg mb-4">Engajamento por Formato</h3>
            <div className="flex-1 border border-dashed border-border rounded-lg flex items-center justify-center bg-secondary/20">
              <p className="text-muted-foreground text-sm">Componente de Gráfico de Barras (Recharts)</p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
