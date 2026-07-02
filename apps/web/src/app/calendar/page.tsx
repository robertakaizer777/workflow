"use client";

import { useState, useEffect, useRef } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock, X, Calendar as CalendarIcon, Save, Image as ImageIcon, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";

export default function CalendarPage() {
  const { user, token } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<any[]>([]);
  
  // Drag State
  const [draggedPostId, setDraggedPostId] = useState<string | null>(null);
  const [isHoveringPrev, setIsHoveringPrev] = useState(false);
  const [isHoveringNext, setIsHoveringNext] = useState(false);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Modal State
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [editContent, setEditContent] = useState("");
  const [editTime, setEditTime] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchPosts = () => {
    if (!user || !token) return;
    fetch(`http://localhost:4001/posts/${user.workspaceId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setPosts(data))
    .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchPosts();
  }, [user, token]);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const nextMonth = () => setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() + 1)));
  const prevMonth = () => setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() - 1)));

  // --- DRAG AND DROP (INTER-MESES) ---
  const handleDragStart = (e: React.DragEvent, post: any) => {
    setDraggedPostId(post.id);
    e.dataTransfer.setData("postId", post.id);
    e.currentTarget.classList.add("opacity-50");
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("opacity-50");
    setDraggedPostId(null);
    clearMonthSwitchTimeout();
    setIsHoveringPrev(false);
    setIsHoveringNext(false);
  };

  const clearMonthSwitchTimeout = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
  };

  // Funções para as setinhas de Navegação do Mês
  const handleNavDragEnter = (direction: 'prev' | 'next') => {
    if (!draggedPostId) return;
    
    if (direction === 'prev') setIsHoveringPrev(true);
    if (direction === 'next') setIsHoveringNext(true);

    clearMonthSwitchTimeout();
    dragTimeoutRef.current = setTimeout(() => {
      if (direction === 'prev') prevMonth();
      if (direction === 'next') nextMonth();
    }, 600); // 600ms hovering para virar a página do mês
  };

  const handleNavDragLeave = (direction: 'prev' | 'next') => {
    if (direction === 'prev') setIsHoveringPrev(false);
    if (direction === 'next') setIsHoveringNext(false);
    clearMonthSwitchTimeout();
  };

  // Funções para o Dia do Calendário
  const handleDragOverDay = (e: React.DragEvent) => {
    e.preventDefault(); 
  };

  const handleDropDay = async (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    clearMonthSwitchTimeout();
    setIsHoveringPrev(false);
    setIsHoveringNext(false);

    const postId = e.dataTransfer.getData("postId");
    if (!postId) return;

    const postToMove = posts.find(p => p.id === postId);
    if (!postToMove || !postToMove.scheduledFor) return;

    const originalDate = new Date(postToMove.scheduledFor);
    const newScheduledDate = new Date(targetDate);
    newScheduledDate.setHours(originalDate.getHours(), originalDate.getMinutes(), 0, 0);

    setPosts(prev => prev.map(p => p.id === postId ? { ...p, scheduledFor: newScheduledDate.toISOString() } : p));

    try {
      await fetch(`http://localhost:4001/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ workspaceId: user?.workspaceId, scheduledFor: newScheduledDate.toISOString() })
      });
    } catch (err) {
      console.error("Falha ao reagendar", err);
      fetchPosts(); 
    }
  };

  // --- CORES POR STATUS ---
  const getStatusColors = (status: string) => {
    switch(status) {
      case 'PUBLISHED':
        return 'bg-green-50 border-green-200 hover:border-green-400 text-green-900';
      case 'FAILED':
        return 'bg-red-50 border-red-200 hover:border-red-400 text-red-900';
      case 'DRAFT':
      case 'SCHEDULED':
      default:
        return 'bg-indigo-50 border-indigo-200 hover:border-indigo-400 text-indigo-900';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'PUBLISHED':
        return <CheckCircle2 className="w-3 h-3 text-green-600" />;
      case 'FAILED':
        return <AlertTriangle className="w-3 h-3 text-red-600" />;
      case 'DRAFT':
      case 'SCHEDULED':
      default:
        return <Clock className="w-3 h-3 text-indigo-600" />;
    }
  };

  // --- MODAL HANDLERS ---
  const openEditModal = (post: any) => {
    setSelectedPost(post);
    setEditContent(post.content);
    if (post.scheduledFor) {
      const d = new Date(post.scheduledFor);
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      setEditTime(`${hours}:${mins}`);
    } else {
      setEditTime("");
    }
  };

  const saveEdit = async () => {
    if (!selectedPost || !user || !token) return;
    setIsSaving(true);
    try {
      let newScheduledFor = selectedPost.scheduledFor;
      if (editTime && selectedPost.scheduledFor) {
        const d = new Date(selectedPost.scheduledFor);
        const [h, m] = editTime.split(':');
        d.setHours(parseInt(h), parseInt(m), 0, 0);
        newScheduledFor = d.toISOString();
      }
      await fetch(`http://localhost:4001/posts/${selectedPost.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ workspaceId: user.workspaceId, content: editContent, scheduledFor: newScheduledFor })
      });
      setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, content: editContent, scheduledFor: newScheduledFor } : p));
      setSelectedPost(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar post");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 p-8 bg-[#f8f9fa] min-h-screen overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Calendário Interativo</h1>
            <p className="text-muted-foreground mt-1">Arraste os cards. Para trocar de mês, arraste sobre as setas.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-card px-4 py-2 rounded-xl shadow-sm border border-border/50">
            {/* Seta Mês Anterior com DropZone */}
            <button 
              onClick={prevMonth} 
              onDragEnter={() => handleNavDragEnter('prev')}
              onDragLeave={() => handleNavDragLeave('prev')}
              onDragOver={(e) => e.preventDefault()}
              className={`p-2 rounded-full transition-all ${isHoveringPrev ? 'bg-indigo-100 scale-110 shadow-inner' : 'hover:bg-secondary/50'}`}
            >
              <ChevronLeft className={`w-5 h-5 ${isHoveringPrev ? 'text-indigo-600' : 'text-muted-foreground'}`} />
            </button>
            
            <h2 className="text-lg font-bold text-foreground min-w-[140px] text-center capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            
            {/* Seta Mês Seguinte com DropZone */}
            <button 
              onClick={nextMonth} 
              onDragEnter={() => handleNavDragEnter('next')}
              onDragLeave={() => handleNavDragLeave('next')}
              onDragOver={(e) => e.preventDefault()}
              className={`p-2 rounded-full transition-all ${isHoveringNext ? 'bg-indigo-100 scale-110 shadow-inner' : 'hover:bg-secondary/50'}`}
            >
              <ChevronRight className={`w-5 h-5 ${isHoveringNext ? 'text-indigo-600' : 'text-muted-foreground'}`} />
            </button>
          </div>
        </div>

        {/* Legenda de Cores */}
        <div className="flex gap-4 mb-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500"></div> Publicado</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-indigo-500"></div> Agendado</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div> Falhou</div>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-border/50">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="py-3 text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 auto-rows-fr min-h-[700px]">
            {daysInMonth.map((day, idx) => {
              const dayPosts = posts.filter(post => 
                post.scheduledFor && format(new Date(post.scheduledFor), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
              );
              
              return (
                <div 
                  key={day.toString()}
                  onDragOver={handleDragOverDay}
                  onDrop={(e) => handleDropDay(e, day)}
                  className={`min-h-[140px] p-2 border-b border-r border-border/50 transition-colors
                    ${!isSameMonth(day, currentDate) ? 'bg-secondary/30/50' : 'bg-card hover:bg-indigo-50/10'}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full
                      ${isToday(day) ? 'bg-indigo-600 text-white shadow-md' : 'text-foreground/90'}
                    `}>
                      {format(day, 'd')}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {dayPosts.map(post => {
                      const statusClass = getStatusColors(post.status);
                      const StatusIcon = getStatusIcon(post.status);

                      return (
                        <div 
                          key={post.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, post)}
                          onDragEnd={handleDragEnd}
                          onClick={() => openEditModal(post)}
                          className={`border p-2 rounded-lg text-xs cursor-pointer hover:shadow-md transition-all group relative active:cursor-grabbing ${statusClass} ${draggedPostId === post.id ? 'opacity-50 scale-95' : ''}`}
                        >
                          <div className="font-semibold truncate mb-1 pr-4">{post.content || "Sem legenda"}</div>
                          
                          <div className="flex items-center justify-between opacity-80 font-mono text-[10px]">
                            <div className="flex items-center gap-1">
                              {StatusIcon}
                              {format(new Date(post.scheduledFor), 'HH:mm')}
                            </div>
                            <span className="uppercase font-bold tracking-tighter">
                              {(() => {
                                try { return JSON.parse(post.platforms)[0].substring(0,2); }
                                catch(e) { return post.platforms?.substring(0,2); }
                              })()}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODAL DE EDIÇÃO */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-border/50 bg-secondary/30">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <CalendarIcon className="text-indigo-600" />
                  Editar Publicação
                </h3>
                <button onClick={() => setSelectedPost(null)} className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground/90 mb-2">Legenda do Post</label>
                  <textarea 
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    className="w-full min-h-[150px] p-4 border border-border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-foreground/90 resize-none shadow-sm"
                  />
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-foreground/90 mb-2">Mídias Atuais</label>
                    <div className="h-24 bg-secondary/30 border-2 border-dashed border-border rounded-xl flex items-center justify-center text-muted-foreground/80">
                      <ImageIcon className="w-6 h-6 mr-2" />
                      <span className="text-sm">Nenhuma/Sem thumbnail</span>
                    </div>
                  </div>
                  
                  <div className="w-48">
                    <label className="block text-sm font-semibold text-foreground/90 mb-2">Horário (HH:MM)</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                      <input 
                        type="time" 
                        value={editTime}
                        onChange={e => setEditTime(e.target.value)}
                        className="w-full pl-10 p-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-foreground/90 font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border/50 flex justify-end gap-3 bg-secondary/30">
                <button 
                  onClick={() => setSelectedPost(null)}
                  className="px-6 py-2.5 rounded-full font-medium text-muted-foreground hover:bg-secondary transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={saveEdit}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-full font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2"
                >
                  {isSaving ? "Salvando..." : <><Save className="w-4 h-4" /> Salvar Alterações</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
