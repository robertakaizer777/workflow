"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { API_URL } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error("Erro ao processar solicitação.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full -z-10 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md p-8 rounded-2xl border border-border shadow-2xl relative"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Recuperar Senha</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Digite seu e-mail corporativo para receber um link de acesso seguro.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!success ? (
            <motion.form 
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleForgot} 
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-300">Email Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-secondary/50 border border-border rounded-lg pl-10 pr-4 py-3 text-sm outline-none focus:border-primary transition-colors text-foreground"
                    placeholder="voce@empresa.com"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium rounded-lg text-center">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-foreground text-background font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>Enviar Link de Recuperação <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <div className="text-center pt-4 border-t border-border mt-6">
                <p className="text-sm text-muted-foreground">
                  Lembrou sua senha? <Link href="/login" className="text-primary hover:underline font-medium">Voltar para o Login</Link>
                </p>
              </div>
            </motion.form>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">E-mail Enviado!</h3>
              <p className="text-muted-foreground text-sm">
                Se o e-mail <strong>{email}</strong> estiver cadastrado em nossa base, você receberá um link de recuperação em instantes.
              </p>
              <Link href="/login" className="inline-block mt-4 text-primary font-medium hover:underline">
                Voltar para o Login
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
