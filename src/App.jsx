import { useState, useCallback } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider, useLanguage } from './contexts/LanguageContext'
import SentimentAnalyzer from './components/SentimentAnalyzer'
import History from './components/History'
import Charts from './components/Charts'
import ThemeToggle from './components/ThemeToggle'
import LanguageSelector from './components/LanguageSelector'

function AppContent() {
  const { t } = useLanguage()
  const [history, setHistory] = useState([])

  const addToHistory = useCallback((analysis) => {
    setHistory(prev => [analysis, ...prev])
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-bg-secondary-light/80 dark:bg-bg-secondary/80 backdrop-blur-sm border-b border-border-light dark:border-border py-4">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-end gap-2 mb-3">
            <ThemeToggle />
            <LanguageSelector />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center justify-center gap-2">
            <span className="text-2xl md:text-3xl">💭</span>
            {t('app.title')}
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary text-sm md:text-base text-center">
            {t('app.subtitle')}
          </p>
        </div>
      </header>

      <main className="flex-1 py-4">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 items-start mb-4">
            <div className="bg-bg-secondary-light/60 dark:bg-bg-secondary/60 backdrop-blur-sm rounded-xl border border-border-light dark:border-border p-4 shadow-xl lg:sticky lg:top-4">
              <SentimentAnalyzer onAnalysisComplete={addToHistory} />
            </div>
            
            {history.length > 0 && (
              <div className="bg-bg-secondary-light/60 dark:bg-bg-secondary/60 backdrop-blur-sm rounded-xl border border-border-light dark:border-border p-4 shadow-xl">
                <History 
                  history={history} 
                  onClear={clearHistory}
                />
              </div>
            )}
          </div>

          {history.length > 0 && (
            <div className="bg-bg-secondary-light/60 dark:bg-bg-secondary/60 backdrop-blur-sm rounded-xl border border-border-light dark:border-border p-4 shadow-xl">
              <Charts history={history} />
            </div>
          )}
        </div>
      </main>

      <footer className="bg-bg-secondary-light/80 dark:bg-bg-secondary/80 backdrop-blur-sm border-t border-border-light dark:border-border py-3">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <p className="text-text-secondary-light dark:text-text-secondary text-xs">{t('app.copyright')}</p>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App

