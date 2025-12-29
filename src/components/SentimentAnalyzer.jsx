import { useState } from 'react'
import { analyzeSentiment } from '../services/api'
import ResultDisplay from './ResultDisplay'
import { useLanguage } from '../contexts/LanguageContext'

function SentimentAnalyzer({ onAnalysisComplete }) {
  const { t } = useLanguage()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!text.trim()) {
      setError(t('analyzer.errorEmpty'))
      return
    }

    if (text.length < 5) {
      setError(t('analyzer.errorMinLength'))
      return
    }

    if (text.length > 5000) {
      setError(t('analyzer.errorMaxLength'))
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await analyzeSentiment(text)
      
      if (response.success) {
        setResult(response.data)
        onAnalysisComplete({
          ...response.data,
          timestamp: new Date().toISOString(),
        })
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError(t('analyzer.errorConnection'))
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setText('')
    setResult(null)
    setError(null)
  }

  const characterCount = text.length
  const maxLength = 5000

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4 text-text-primary-light dark:text-text-primary">{t('analyzer.title')}</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="text-input" className="text-xs font-medium text-text-secondary-light dark:text-text-secondary">
            {t('analyzer.label')}
          </label>
          <textarea
            id="text-input"
            className="w-full p-3 bg-bg-primary-light/60 dark:bg-bg-primary/60 border-2 border-border-light dark:border-border rounded-lg text-text-primary-light dark:text-text-primary text-sm font-sans resize-y transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-text-secondary-light/60 dark:placeholder:text-text-secondary/60"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('analyzer.placeholder')}
            rows={4}
            maxLength={maxLength}
            disabled={loading}
          />
          <div className="flex justify-end">
            <span className={`text-xs ${characterCount > maxLength * 0.9 ? 'text-warning' : 'text-text-secondary-light dark:text-text-secondary'}`}>
              {characterCount} / {maxLength} {t('analyzer.characters')}
            </span>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-xs">
            <span className="text-base">⚠️</span>
            {error}
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold border-none rounded-lg cursor-pointer transition-all flex-1 min-w-[120px] bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            disabled={loading || !text.trim()}
          >
            {loading ? (
              <>
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                {t('analyzer.analyzing')}
              </>
            ) : (
              <>
                <span className="text-base">🔍</span>
                {t('analyzer.analyze')}
              </>
            )}
          </button>
          
          {(text || result) && (
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold border border-border-light dark:border-border rounded-lg cursor-pointer transition-all flex-1 min-w-[120px] bg-border-light/50 dark:bg-border/50 text-text-primary-light dark:text-text-primary hover:bg-border-light/70 dark:hover:bg-border/70 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleClear}
              disabled={loading}
            >
              {t('analyzer.clear')}
            </button>
          )}
        </div>
      </form>

      {result && <ResultDisplay result={result} />}
    </div>
  )
}

export default SentimentAnalyzer

