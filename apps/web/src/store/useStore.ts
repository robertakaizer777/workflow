import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  workspaceId: string;
}

interface AppState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  activeConnectionId: string | null;
  setSession: (user: User, token: string) => void;
  setActiveConnection: (id: string | null) => void;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      activeConnectionId: null,
      
      setSession: (user, token) => {
        if (typeof window !== 'undefined') {
          document.cookie = `token=${token}; path=/; max-age=2592000; samesite=lax`;
        }
        set({ 
          user, 
          token, 
          isAuthenticated: true 
        });
      },
      
      setActiveConnection: (id) => set({ activeConnectionId: id }),
      
      logout: () => {
        // Remove cookie by setting expiration to past
        if (typeof window !== 'undefined') {
          document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'postflow-storage',
      onRehydrateStorage: () => (state) => {
        // Sync token with cookies for Next.js Middleware to read
        if (state?.token && typeof window !== 'undefined') {
          document.cookie = `token=${state.token}; path=/; max-age=2592000; samesite=lax`;
        }
      }
    }
  )
);
