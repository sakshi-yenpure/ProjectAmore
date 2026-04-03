import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const applyTheme = (isDark) => {
  if (isDark) {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
  } else {
    document.documentElement.classList.add('light')
    document.documentElement.classList.remove('dark')
  }
}

const useThemeStore = create(
  persist(
    (set, get) => ({
      isDark: false,
      toggle: () => {
        const next = !get().isDark
        applyTheme(next)
        set({ isDark: next })
      },
      initTheme: () => {
        applyTheme(get().isDark)
      },
    }),
    { name: 'amore-theme' }
  )
)

export default useThemeStore
