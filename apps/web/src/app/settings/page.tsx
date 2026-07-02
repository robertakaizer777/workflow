"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Settings, Lock, Check } from "lucide-react";

export default function SettingsPage() {
  const { user } = useStore();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("A nova senha e a confirmação não conferem.");
      return;
    }

    if (newPassword.length < 6) {
      setError("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setIsSubmitting(true);
    
    // Simulação de chamada à API
    setTimeout(() => {
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsSubmitting(false);
      
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="flex-1 p-8 max-w-[1000px] mx-auto overflow-y-auto w-full bg-background min-h-screen relative">
      
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie sua conta e preferências do sistema.</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Alterar Senha
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Atualize sua senha de acesso periodicamente para manter sua conta segura.
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="p-6 space-y-5">
          {success && (
            <div className="p-4 bg-green-500/10 text-green-500 rounded-xl border border-green-500/20 flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Senha Atualizada!</h3>
                <p className="text-sm opacity-90">Sua nova senha foi salva com sucesso.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20">
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Senha Atual</label>
            <input 
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Digite sua senha atual"
              className="w-full bg-background border border-border/50 rounded-xl p-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Nova Senha</label>
              <input 
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="No mínimo 6 caracteres"
                className="w-full bg-background border border-border/50 rounded-xl p-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Confirmar Nova Senha</label>
              <input 
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Digite a nova senha novamente"
                className="w-full bg-background border border-border/50 rounded-xl p-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit"
              disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-full font-medium transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Salvando..." : "Salvar Nova Senha"}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
