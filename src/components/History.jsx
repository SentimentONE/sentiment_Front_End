import { useState } from 'react'
import ResultDisplay from './ResultDisplay'
import { useLanguage } from '../contexts/LanguageContext'

function History({ history, onClear }) {
  const { t } = useLanguage()
  const [expandedIndex, setExpandedIndex] = useState(null)

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  if (history.length === 0) {
    return null
  }

  return (
    <div className="w-full relative" style={{ zIndex: 1 }}>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary">{t('history.title')}</h2>
        <button 
          className="text-text-secondary-light dark:text-text-secondary hover:text-danger cursor-pointer text-base transition-all hover:scale-105 active:scale-95" 
          onClick={onClear} 
          title={t('history.clear')}
        >
          🗑️
        </button>
      </div>

      <div className="flex flex-col gap-2 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
        {history.map((item, index) => (
          <div 
            key={`${item.textContent}-${item.analyzedAt || item.timestamp}-${index}`} 
            className="bg-bg-primary-light/60 dark:bg-bg-primary/60 border border-border-light dark:border-border rounded-lg transition-all hover:border-primary hover:bg-bg-primary-light/80 dark:hover:bg-bg-primary/80"
          >
            <div 
              className="flex justify-between items-center p-3 gap-3 cursor-pointer"
              onClick={() => toggleExpand(index)}
            >
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <span className="inline-block px-2 py-0.5 bg-primary/20 border border-primary/30 rounded text-xs font-semibold text-primary uppercase w-fit">
                  {item.sentimentResult || t('history.na')}
                </span>
                <span className="text-text-secondary-light dark:text-text-secondary text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                  {item.textContent?.substring(0, 40) || t('history.noText')}
                  {item.textContent?.length > 40 ? '...' : ''}
                </span>
              </div>
              <span className="text-text-secondary-light dark:text-text-secondary text-xs flex-shrink-0">
                {expandedIndex === index ? '▼' : '▶'}
              </span>
            </div>
            
            {expandedIndex === index && (
              <div className="px-3 pb-3 border-t border-border-light dark:border-border pt-3 animate-slide-down">
                <ResultDisplay result={item} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default History

