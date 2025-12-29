import { createContext, useContext, useState, useEffect } from 'react'
import translations from '../locales/translations'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Verifica se há idioma salvo no localStorage
    const savedLanguage = localStorage.getItem('language')
    return savedLanguage || 'pt'
  })

  useEffect(() => {
    // Salva no localStorage
    localStorage.setItem('language', language)
  }, [language])

  const t = (key) => {
    const keys = key.split('.')
    let value = translations[language]
    
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) {
        console.warn(`Translation key "${key}" not found for language "${language}"`)
        return key
      }
    }
    
    return value || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

