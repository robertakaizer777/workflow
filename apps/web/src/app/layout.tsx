"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutDashboard, PenSquare, Share2, Calendar, Settings, LogOut, Users, Briefcase, Clock, FileText, ChevronDown, ChevronRight, CheckSquare } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";

import { AccountSwitcher } from "@/components/AccountSwitcher";

import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, logout } = useStore();
  const [mounted, setMounted] = useState(false);
  
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname === "/reset-password";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCrmOpen, setIsCrmOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!token && !isAuthPage) {
        router.push("/login");
      }
    }
  }, [mounted, token, isAuthPage, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased ${!mounted ? 'bg-background' : 'flex flex-col md:flex-row h-screen overflow-hidden'}`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
          {mounted && (
            <>
              {/* Mobile Header */}
              {!isAuthPage && (
                <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background z-40 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-primary to-purple-600 rounded-lg shadow-[0_0_10px_rgba(195,0,16,0.4)]" />
                    <span className="font-bold tracking-tight">PostFlow AI</span>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-secondary rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
                  </button>
                </div>
              )}

              {/* Sidebar */}
              {!isAuthPage && (
                <>
                  {/* Backdrop for Mobile */}
                  {isMobileMenuOpen && (
                    <div 
                      className="fixed inset-0 bg-black/60 z-40 md:hidden" 
                      onClick={() => setIsMobileMenuOpen(false)}
                    />
                  )}

                  <aside className={`fixed inset-y-0 left-0 w-64 bg-zinc-950 border-r border-border flex flex-col shrink-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="h-16 flex items-center justify-between px-6 border-b border-border shrink-0">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-tr from-primary to-purple-600 rounded-lg mr-3 shadow-[0_0_15px_rgba(195,0,16,0.4)]" />
                        <span className="font-bold text-lg tracking-tight text-white">PostFlow AI</span>
                      </div>
                      <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-zinc-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                    </div>
                    
                    <AccountSwitcher />
                    
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                      <Link onClick={() => setIsMobileMenuOpen(false)} href="/" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === '/' ? 'bg-primary/10 text-primary' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <Link onClick={() => setIsMobileMenuOpen(false)} href="/compose" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === '/compose' ? 'bg-primary/10 text-primary' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
                        <PenSquare className="w-4 h-4" /> Novo Post
                      </Link>
                      <Link onClick={() => setIsMobileMenuOpen(false)} href="/calendar" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === '/calendar' ? 'bg-primary/10 text-primary' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
                        <Calendar className="w-4 h-4" /> Calendário
                      </Link>
                      <Link onClick={() => setIsMobileMenuOpen(false)} href="/integrations" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === '/integrations' ? 'bg-primary/10 text-primary' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
                        <Share2 className="w-4 h-4" /> Integrações
                      </Link>

                      {/* CRM Seção */}
                      <div className="pt-4 mt-4 border-t border-zinc-800">
                        <button 
                          onClick={() => setIsCrmOpen(!isCrmOpen)} 
                          className="w-full flex items-center justify-between px-3 py-2 text-sm font-bold text-zinc-300 hover:text-white transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-primary" /> CRM
                          </div>
                          {isCrmOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        
                        {isCrmOpen && (
                          <div className="mt-2 space-y-1 pl-4">
                            <Link onClick={() => setIsMobileMenuOpen(false)} href="/crm/dashboard" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === '/crm/dashboard' ? 'bg-primary/10 text-primary' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
                              <LayoutDashboard className="w-4 h-4" /> Dashboard
                            </Link>
                            <Link onClick={() => setIsMobileMenuOpen(false)} href="/crm/clients" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname.includes('/crm/clients') ? 'bg-primary/10 text-primary' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
                              <Users className="w-4 h-4" /> Clientes
                            </Link>
                            <Link onClick={() => setIsMobileMenuOpen(false)} href="/crm/pipeline" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname.includes('/crm/pipeline') ? 'bg-primary/10 text-primary' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
                              <LayoutDashboard className="w-4 h-4" /> Pipeline
                            </Link>
                            <Link onClick={() => setIsMobileMenuOpen(false)} href="/crm/agenda" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname.includes('/crm/agenda') ? 'bg-primary/10 text-primary' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
                              <Clock className="w-4 h-4" /> Agenda
                            </Link>
                            <Link onClick={() => setIsMobileMenuOpen(false)} href="/crm/budgets" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname.includes('/crm/budgets') ? 'bg-primary/10 text-primary' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
                              <FileText className="w-4 h-4" /> Orçamentos
                            </Link>
                            <Link onClick={() => setIsMobileMenuOpen(false)} href="/crm/followups" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname.includes('/crm/followups') ? 'bg-primary/10 text-primary' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
                              <CheckSquare className="w-4 h-4" /> Follow-ups
                            </Link>
                          </div>
                        )}
                      </div>
                    </nav>

                    <div className="p-4 border-t border-border space-y-1">
                      <ThemeToggle />
                      <Link onClick={() => setIsMobileMenuOpen(false)} href="/settings" className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === '/settings' ? 'bg-primary/10 text-primary' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
                        <Settings className="w-4 h-4" /> Configurações
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-red-500/80 hover:text-red-500 hover:bg-red-500/10 transition-colors">
                        <LogOut className="w-4 h-4" /> Sair da Conta
                      </button>
                    </div>
                  </aside>
                </>
              )}

              {/* Main Content */}
              <main className="flex-1 overflow-y-auto bg-background relative flex flex-col">
                {!isAuthPage && <div className="absolute top-0 left-0 w-full h-96 bg-primary/5 blur-3xl -z-10 pointer-events-none" />}
                {children}
              </main>
            </>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
