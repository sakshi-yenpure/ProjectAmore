import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { login as apiLogin, signup as apiSignup } from '../api/auth'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: async (username, password) => {
        try {
          const response = await apiLogin({ username, password })
          const { user, access } = response.data
          set({ user, token: access, isAuthenticated: true })
          return { success: true }
        } catch (error) {
          return { 
            success: false, 
            message: error.response?.data?.detail || 'Invalid username or password' 
          }
        }
      },
      
      signup: async (signupData) => {
        try {
          const response = await apiSignup(signupData)
          const { user, access } = response.data
          set({ user, token: access, isAuthenticated: true })
          return { success: true }
        } catch (error) {
          const errorData = error.response?.data
          let message = 'Signup failed'
          if (typeof errorData === 'object') {
            message = Object.entries(errorData)
              .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
              .join(' | ')
          }
          return { success: false, message }
        }
      },
      
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      
      updateUser: (userData) => set((state) => ({ 
        user: { ...state.user, ...userData } 
      })),
    }),
    { 
      name: 'amore-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)

export default useAuthStore

