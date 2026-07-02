"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, ArrowRight, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import { API_URL } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useStore((state: any) => state.setSession);

  const registered = searchParams.get("registered");

  // States
  const [email, setEmail] = useState("admin@postflow.ai");
  const [password, setPassword] = useState("senha123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // 2FA States
  const [step, setStep] = useState<"LOGIN" | "2FA">("LOGIN");
  const [userId, setUserId] = useState<string | null>(null);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // O botão secreto pra debugar: aperta CTRL + SHIFT pra preencher os zeros
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && step === "2FA") {
        console.log("Auto-fill de debug acionado");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Credenciais inválidas");
      }

      if (data.requires2FA) {
        setUserId(data.userId);
        setStep("2FA");
      } else {
        // Fallback pro sistema antigo
        setSession(data.user, data.access_token);
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length < 6) {
      setError("Preencha todos os 6 dígitos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/auth/verify-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, code: fullCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Código incorreto");
      }

      // SUCESSO!
      setSession(data.user, data.access_token);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
      // Limpa os campos
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setLoading(false);
    }
  };

  // Gerenciamento dos Inputs de 6 Dígitos
  const handleChangeCode = (index: number, value: string) => {
    // Permite apenas números
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-avança
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDownCode = (index: number, e: React.KeyboardEvent) => {
    // Volta se apertar Backspace no input vazio
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePasteCode = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      const newCode = [...code];
      for (let i = 0; i < pastedData.length; i++) {
        newCode[i] = pastedData[i];
      }
      setCode(newCode);
      const nextFocusIndex = pastedData.length < 6 ? pastedData.length : 5;
      inputRefs.current[nextFocusIndex]?.focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      
      {/* Background Decorativo Estilo Enterprise */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 flex justify-center items-center">
        <div className="w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/4"></div>
        <div className="w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl opacity-50 -translate-x-1/2 translate-y-1/4"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card border border-border rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
          
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 p-0.5 shadow-lg">
              <div className="w-full h-full bg-background rounded-[14px] flex items-center justify-center">
                <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-500">PF</span>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            
            {/* ETAPA 1: LOGIN TRADICIONAL */}
            {step === "LOGIN" && (
              <motion.div
                key="step-login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-8">
                  {registered && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-2 mb-4 p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-medium rounded-lg">
                      <CheckCircle2 className="w-4 h-4" /> Conta criada! Faça login para ativar.
                    </motion.div>
                  )}
                  <h1 className="text-2xl font-bold text-foreground">Bem-vindo de volta</h1>
                  <p className="text-sm text-muted-foreground mt-2">Acesse seu painel central de mídias sociais.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-1.5 block">Email Institucional</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input 
                        type="email" 
                        required
                        className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-semibold text-foreground block">Senha</label>
                      <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:text-primary/80">Esqueceu a senha?</Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input 
                        type="password" 
                        required
                        className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center font-medium">
                      {error}
                    </motion.div>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 mt-4"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>Entrar com Segurança <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>

                  <div className="text-center pt-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      Ainda não tem conta? <Link href="/register" className="text-primary font-medium hover:underline">Criar agora</Link>
                    </p>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ETAPA 2: 2FA */}
            {step === "2FA" && (
              <motion.div
                key="step-2fa"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="text-center mb-8">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">Autenticação 2 Fatores</h1>
                  <p className="text-sm text-muted-foreground mt-2">
                    Enviamos um código de 6 dígitos para o e-mail<br/> 
                    <strong className="text-foreground">{email}</strong>
                  </p>
                </div>

                <form onSubmit={handleVerify2FA}>
                  <div className="flex justify-center gap-2 sm:gap-3 mb-6" onPaste={handlePasteCode}>
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChangeCode(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDownCode(index, e)}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                      />
                    ))}
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center font-medium">
                      {error}
                    </motion.div>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verificar Código"}
                  </button>

                  <div className="text-center mt-6">
                    <button type="button" onClick={() => setStep("LOGIN")} className="text-sm font-semibold text-muted-foreground hover:text-foreground">
                      Voltar ao Login
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
