import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-secondary-light/60 dark:bg-bg-secondary/60 border border-border-light dark:border-border hover:bg-bg-tertiary-light/50 dark:hover:bg-bg-tertiary/50 transition-colors"
      title={t('theme.toggle')}
      aria-label={t('theme.toggle')}
    >
      {theme === 'dark' ? (
        <>
          <span className="text-xl">🌙</span>
          <span className="text-sm font-medium text-text-primary-light dark:text-text-primary">
            {t('theme.dark')}
          </span>
        </>
      ) : (
        <>
          <span className="text-xl">☀️</span>
          <span className="text-sm font-medium text-text-primary-light dark:text-text-primary">
            {t('theme.light')}
          </span>
        </>
      )}
    </button>
  )
}

export default ThemeToggle

