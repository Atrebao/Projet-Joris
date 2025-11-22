import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  nom: string
  prenoms: string
  email: string
  role: 'SUPER_ADMIN' | 'PARTENAIRE' | 'CLIENT'
  nomBoutique?: string
  logo?: string
  ville?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  userType: 'admin' | 'partenaire' | 'client' | null
  
  setAuth: (user: User, token: string, userType: 'admin' | 'partenaire' | 'client') => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      userType: null,

      setAuth: (user, token, userType) => {
        localStorage.setItem('token', token)
        set({
          user,
          token,
          isAuthenticated: true,
          userType,
        })
      },

      logout: () => {
        localStorage.removeItem('token')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          userType: null,
        })
      },

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
)
