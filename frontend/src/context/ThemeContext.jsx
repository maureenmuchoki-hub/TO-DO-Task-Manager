import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const ACCENT_COLORS = {
  violet: { primary: '#7C3AED', light: '#EDE9FE', name: 'Violet' },
  blue: { primary: '#2563EB', light: '#DBEAFE', name: 'Blue' },
  rose: { primary: '#E11D48', light: '#FFE4E6', name: 'Rose' },
  emerald: { primary: '#059669', light: '#D1FAE5', name: 'Emerald' },
  orange: { primary: '#EA580C', light: '#FFEDD5', name: 'Orange' },
  pink: { primary: '#DB2777', light: '#FCE7F3', name: 'Pink' },
}

export const FONTS = {
  inter: { name: 'Inter', value: "'Inter', sans-serif" },
  poppins: { name: 'Poppins', value: "'Poppins', sans-serif" },
  mono: { name: 'Mono', value: "'JetBrains Mono', monospace" },
  serif: { name: 'Serif', value: "'Georgia', serif" },
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
  const [accent, setAccent] = useState(localStorage.getItem('accent') || 'violet')
  const [font, setFont] = useState(localStorage.getItem('font') || 'inter')

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark')
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'system') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark')
      }
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const color = ACCENT_COLORS[accent]
    document.documentElement.style.setProperty('--accent', color.primary)
    document.documentElement.style.setProperty('--accent-light', color.light)
    localStorage.setItem('accent', accent)
  }, [accent])

  useEffect(() => {
    document.documentElement.style.setProperty('--font', FONTS[font].value)
    localStorage.setItem('font', font)
  }, [font])

  const darkMode = theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <ThemeContext.Provider value={{
      theme, setTheme,
      accent, setAccent,
      font, setFont,
      darkMode,
      ACCENT_COLORS,
      FONTS
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}