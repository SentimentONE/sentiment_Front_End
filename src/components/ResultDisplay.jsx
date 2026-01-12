import { useLanguage } from '../contexts/LanguageContext'

function ResultDisplay({ result }) {
  const { t, language } = useLanguage()
  const getSentimentColor = (sentiment) => {
    if (!sentiment) return 'positive'

    const sentimentUpper = sentiment.toUpperCase()
    if (sentimentUpper.includes('POSITIVO') || sentimentUpper.includes('POSITIVE')) {
      return 'positive'
    }
    if (sentimentUpper.includes('NEGATIVO') || sentimentUpper.includes('NEGATIVE')) {
      return 'negative'
    }
    return 'positive'
  }

  const getSentimentIcon = (sentiment) => {
    const color = getSentimentColor(sentiment)
    if (color === 'positive') return '😊'
    if (color === 'negative') return '😞'
    return '😊'
  }

  const getSentimentLabel = (sentiment) => {
    const color = getSentimentColor(sentiment)
    if (color === 'positive') return t('result.sentiment_positive')
    if (color === 'negative') return t('result.sentiment_negative')
    return t('result.sentiment_positive')
  }

  const formatConfidence = (score) => {
    if (score === null || score === undefined) return t('result.na')
    return `${(score * 100).toFixed(1)}%`
  }

  const formatDate = (dateString) => {
    if (!dateString) return t('result.now')
    try {
      const date = new Date(dateString)
      const localeMap = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' }
      return date.toLocaleString(localeMap[language] || 'pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return t('result.now')
    }
  }

  const sentimentColor = getSentimentColor(result.sentimentResult)
  const confidenceScore = result.confidenceScore || 0

  const sentimentStyles = {
    positive: 'bg-success/15 border-success/30 text-success',
    negative: 'bg-danger/15 border-danger/30 text-danger',
  }

  const confidenceBarStyles = {
    positive: 'bg-gradient-to-r from-success to-emerald-400',
    negative: 'bg-gradient-to-r from-danger to-red-400',
  }

  return (
    <div className="mt-4 p-4 bg-bg-primary-light/60 dark:bg-bg-primary/60 rounded-lg border border-border-light dark:border-border animate-fade-in">
      <h3 className="text-lg font-semibold mb-4 text-text-primary-light dark:text-text-primary">{t('result.title')}</h3>

      <div className="flex flex-col gap-4">
        <div className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 text-lg font-semibold text-center ${sentimentStyles[sentimentColor]}`}>
          <span className="text-2xl">{getSentimentIcon(result.sentimentResult)}</span>
          <span className="uppercase tracking-wide">{getSentimentLabel(result.sentimentResult)}</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-text-secondary-light dark:text-text-secondary">{t('result.confidence')}</span>
            <span className="text-base font-semibold text-text-primary-light dark:text-text-primary">{formatConfidence(confidenceScore)}</span>
          </div>
          <div className="w-full h-1.5 bg-border-light/30 dark:bg-border/30 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${confidenceBarStyles[sentimentColor]}`}
              style={{ width: `${confidenceScore * 100}%` }}
            ></div>
          </div>
        </div>

        {result.textContent && (
          <div className="pt-3 border-t border-border-light dark:border-border">
            <h4 className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary mb-2 uppercase tracking-wide">{t('result.analyzedText')}</h4>
            <p className="text-text-primary-light dark:text-text-primary leading-relaxed p-3 bg-bg-primary-light/40 dark:bg-bg-primary/40 rounded-lg border-l-4 border-primary text-sm max-h-32 overflow-y-auto custom-scrollbar">
              {result.textContent}
            </p>
          </div>
        )}

        {result.analyzedAt && (
          <div className="flex items-center gap-1.5 pt-3 border-t border-border-light dark:border-border text-xs text-text-secondary-light dark:text-text-secondary italic">
            <span className="text-sm">🕒</span>
            <span>{t('result.analyzedAt')} {formatDate(result.analyzedAt)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResultDisplay

