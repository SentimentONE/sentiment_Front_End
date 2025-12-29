import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '../contexts/LanguageContext'

function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, right: 0 })
  const buttonRef = useRef(null)
  const dropdownRef = useRef(null)

  const languages = [
    { code: 'pt', name: t('language.pt'), flag: '🇧🇷' },
    { code: 'en', name: t('language.en'), flag: '🇺🇸' },
    { code: 'es', name: t('language.es'), flag: '🇪🇸' },
  ]

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0]

  const handleSelect = (langCode) => {
    setLanguage(langCode)
    setIsOpen(false)
  }

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right
      })
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-secondary-light/60 dark:bg-bg-secondary/60 border border-border-light dark:border-border hover:bg-bg-tertiary-light/50 dark:hover:bg-bg-tertiary/50 transition-colors"
          title={t('language.select')}
          aria-label={t('language.select')}
        >
          <span className="text-xl">{currentLanguage.flag}</span>
          <span className="text-sm font-medium text-text-primary-light dark:text-text-primary">
            {currentLanguage.name}
          </span>
          <span className="text-xs text-text-secondary-light dark:text-text-secondary">
            {isOpen ? '▲' : '▼'}
          </span>
        </button>
      </div>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          <div
            ref={dropdownRef}
            className="fixed z-[9999] bg-bg-secondary-light dark:bg-bg-secondary border border-border-light dark:border-border rounded-lg shadow-2xl overflow-hidden min-w-[180px]"
            style={{
              top: `${position.top}px`,
              right: `${position.right}px`
            }}
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-bg-tertiary-light/50 dark:hover:bg-bg-tertiary/50 transition-colors ${
                  language === lang.code
                    ? 'bg-primary/20 dark:bg-primary/20 text-primary dark:text-primary'
                    : 'text-text-primary-light dark:text-text-primary'
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="text-sm font-medium">{lang.name}</span>
                {language === lang.code && (
                  <span className="ml-auto text-primary dark:text-primary">✓</span>
                )}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </>
  )
}

export default LanguageSelector

