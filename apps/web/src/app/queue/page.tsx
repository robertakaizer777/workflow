"use client";

import { motion } from "framer-motion";
import { Loader2, AlertCircle, CheckCircle2, Clock, RefreshCw } from "lucide-react";

export default function QueuePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const jobs = [
    { id: "job-1", title: "Campanha Black Friday", platform: "Instagram", status: "processing", time: "Agora", icon: Loader2, color: "text-blue-400" },
    { id: "job-2", title: "Lançamento Produto X", platform: "LinkedIn", status: "completed", time: "Há 2 min", icon: CheckCircle2, color: "text-emerald-400" },
    { id: "job-3", title: "Vídeo Promocional", platform: "TikTok", status: "failed", time: "Retentando em 5m", icon: AlertCircle, color: "text-primary" }, // primary = red
    { id: "job-4", title: "Post Institucional", platform: "Facebook", status: "queued", time: "Agendado para 15:00", icon: Clock, color: "text-zinc-400" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fila de Processamento</h1>
            <p className="text-muted-foreground mt-2">Monitore o disparo das suas postagens em tempo real.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium text-sm hover:bg-secondary/80 transition-colors border border-border">
            <RefreshCw className="w-4 h-4" /> Atualizar
          </button>
        </motion.div>

        {/* Status Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-4 rounded-xl border border-blue-500/30 bg-blue-500/5">
            <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">Processando</p>
            <p className="text-2xl font-bold mt-1">1</p>
          </div>
          <div className="glass-card p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
            <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Publicados Hoje</p>
            <p className="text-2xl font-bold mt-1">124</p>
          </div>
          <div className="glass-card p-4 rounded-xl border border-zinc-500/30 bg-zinc-500/5">
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Na Fila</p>
            <p className="text-2xl font-bold mt-1">45</p>
          </div>
          <div className="glass-card p-4 rounded-xl border border-primary/30 bg-primary/5">
            <p className="text-xs text-primary font-bold uppercase tracking-wider">Falhas / Retries</p>
            <p className="text-2xl font-bold mt-1">2</p>
          </div>
        </div>

        {/* Fila de Jobs */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
          {jobs.map((job) => (
            <motion.div key={job.id} variants={itemVariants} className="glass-card p-4 rounded-xl flex items-center justify-between hover:bg-secondary/20 transition-colors group">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full bg-secondary/50 ${job.color}`}>
                  <job.icon className={`w-5 h-5 ${job.status === 'processing' ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h4 className="font-semibold">{job.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">{job.platform}</span>
                    <span className="text-xs text-zinc-500">{job.time}</span>
                  </div>
                </div>
              </div>

              <div>
                {job.status === 'failed' && (
                  <button className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-lg text-xs font-semibold transition-colors">
                    Forçar Retentativa
                  </button>
                )}
                {job.status === 'queued' && (
                  <button className="px-3 py-1.5 bg-secondary text-muted-foreground hover:text-foreground rounded-lg text-xs font-semibold transition-colors">
                    Cancelar
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}
