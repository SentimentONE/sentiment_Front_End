import { useMemo, useState, useEffect } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { useLanguage } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'
import { getStatistics } from '../services/api'

function Charts({ history }) {
  const { t } = useLanguage()
  const { theme } = useTheme()
  const [backendStats, setBackendStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [useBackendData, setUseBackendData] = useState(false)
  
  // Cores baseadas no tema
  const isDark = theme === 'dark'
  const gridColor = isDark ? '#475569' : '#cbd5e1'
  const textColor = isDark ? '#cbd5e1' : '#475569'
  const tooltipBg = isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)'
  const tooltipText = isDark ? '#f1f5f9' : '#0f172a'
  const tooltipBorder = isDark ? '#475569' : '#cbd5e1'

  // Busca estatísticas do backend
  useEffect(() => {
    let isMounted = true
    let hasInitialLoad = false
    
    const fetchStatistics = async (isInitialLoad = false) => {
      try {
        // Só mostra loading na primeira carga
        if (isInitialLoad && !hasInitialLoad) {
          setLoading(true)
          hasInitialLoad = true
        }
        
        const response = await getStatistics()
        
        // Só atualiza se o componente ainda estiver montado
        if (!isMounted) return
        
        if (response.success && response.data) {
          // Só atualiza se os dados realmente mudaram (evita re-renderizações desnecessárias)
          setBackendStats(prev => {
            if (prev && 
                prev.total === response.data.total &&
                prev.positive === response.data.positive &&
                prev.negative === response.data.negative) {
              return prev // Dados não mudaram, não atualiza
            }
            return response.data
          })
          
          // Usa dados do backend se houver dados
          if (response.data.total > 0) {
            setUseBackendData(true)
          }
        }
      } catch (error) {
        console.warn('Erro ao buscar estatísticas do backend:', error)
        if (isMounted) {
          setUseBackendData(false)
        }
      } finally {
        if (isMounted && isInitialLoad) {
          setLoading(false)
        }
      }
    }

    // Primeira carga
    fetchStatistics(true)
    
    // Atualiza a cada 15 segundos (sem mostrar loading para não resetar scroll)
    const interval = setInterval(() => fetchStatistics(false), 15000)
    
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  // Calcula estatísticas - usa dados do backend se disponíveis, senão usa histórico local
  const stats = useMemo(() => {
    // Se tiver dados do backend, usa eles
    if (useBackendData && backendStats) {
      const timelineData = (backendStats.timeline || []).map(item => ({
        date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        positive: item.positive || 0,
        negative: item.negative || 0,
        total: item.total || 0,
      }))

      return {
        total: backendStats.total || 0,
        positive: backendStats.positive || 0,
        negative: backendStats.negative || 0,
        positivePercentage: backendStats.positivePercentage || 0,
        negativePercentage: backendStats.negativePercentage || 0,
        averageConfidence: backendStats.averageConfidence || 0,
        positiveAverageConfidence: backendStats.positiveAverageConfidence || 0,
        negativeAverageConfidence: backendStats.negativeAverageConfidence || 0,
        pieData: [
          { name: t('charts.positive'), value: backendStats.positive || 0, percentage: backendStats.positivePercentage || 0 },
          { name: t('charts.negative'), value: backendStats.negative || 0, percentage: backendStats.negativePercentage || 0 },
        ],
        barData: [
          { name: t('charts.positive'), value: backendStats.positive || 0, confidence: (backendStats.positiveAverageConfidence || 0).toFixed(1) },
          { name: t('charts.negative'), value: backendStats.negative || 0, confidence: (backendStats.negativeAverageConfidence || 0).toFixed(1) },
        ],
        timelineData: timelineData,
      }
    }

    // Fallback: calcula do histórico local
    if (!history || history.length === 0) {
      return {
        total: 0,
        positive: 0,
        negative: 0,
        positivePercentage: 0,
        negativePercentage: 0,
        averageConfidence: 0,
        positiveAverageConfidence: 0,
        negativeAverageConfidence: 0,
        pieData: [],
        barData: [],
        timelineData: [],
      }
    }

    const total = history.length
    let positive = 0
    let negative = 0
    let totalConfidence = 0
    let positiveConfidence = 0
    let negativeConfidence = 0

    // Agrupa por data para timeline
    const timelineMap = new Map()

    history.forEach((item) => {
      const sentiment = item.sentimentResult?.toUpperCase() || 'POSITIVO'
      const confidence = item.confidenceScore || 0
      totalConfidence += confidence

      if (sentiment.includes('POSITIVO') || sentiment.includes('POSITIVE')) {
        positive++
        positiveConfidence += confidence
      } else if (sentiment.includes('NEGATIVO') || sentiment.includes('NEGATIVE')) {
        negative++
        negativeConfidence += confidence
      }

      // Agrupa por data para timeline
      if (item.analyzedAt || item.timestamp) {
        const date = new Date(item.analyzedAt || item.timestamp)
        const dateKey = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        
        if (!timelineMap.has(dateKey)) {
          timelineMap.set(dateKey, { date: dateKey, positive: 0, negative: 0, total: 0 })
        }
        
        const dayData = timelineMap.get(dateKey)
        dayData.total++
        if (sentiment.includes('POSITIVO') || sentiment.includes('POSITIVE')) {
          dayData.positive++
        } else {
          dayData.negative++
        }
      }
    })

    const positivePercentage = total > 0 ? (positive / total) * 100 : 0
    const negativePercentage = total > 0 ? (negative / total) * 100 : 0
    const averageConfidence = total > 0 ? totalConfidence / total : 0
    const positiveAverageConfidence = positive > 0 ? positiveConfidence / positive : 0
    const negativeAverageConfidence = negative > 0 ? negativeConfidence / negative : 0

    // Dados para gráfico de pizza
    const pieData = [
      { name: t('charts.positive'), value: positive, percentage: positivePercentage },
      { name: t('charts.negative'), value: negative, percentage: negativePercentage },
    ]

    // Dados para gráfico de barras
    const barData = [
      { name: t('charts.positive'), value: positive, confidence: (positiveAverageConfidence * 100).toFixed(1) },
      { name: t('charts.negative'), value: negative, confidence: (negativeAverageConfidence * 100).toFixed(1) },
    ]

    // Dados para timeline (últimos 7 dias ou todos se menos de 7)
    const timelineData = Array.from(timelineMap.values())
      .sort((a, b) => {
        const dateA = new Date(a.date.split('/').reverse().join('-'))
        const dateB = new Date(b.date.split('/').reverse().join('-'))
        return dateA - dateB
      })
      .slice(-7) // Últimos 7 dias

    return {
      total,
      positive,
      negative,
      positivePercentage,
      negativePercentage,
      averageConfidence: averageConfidence * 100,
      positiveAverageConfidence: positiveAverageConfidence * 100,
      negativeAverageConfidence: negativeAverageConfidence * 100,
      pieData,
      barData,
      timelineData,
    }
  }, [history, t, useBackendData, backendStats])

  // Cores para os gráficos
  const COLORS = {
    positive: '#10b981', // success (verde)
    negative: '#ef4444', // danger (vermelho)
  }

  // Classes CSS para modo escuro/claro
  const textColorClass = 'text-text-primary-light dark:text-text-primary'
  const secondaryTextColor = 'text-text-secondary-light dark:text-text-secondary'

  if (loading) {
    return (
      <div className="w-full p-4 bg-bg-primary-light/40 dark:bg-bg-primary/40 rounded-lg border border-border-light dark:border-border">
        <p className={`text-center ${secondaryTextColor} text-sm`}>
          {t('charts.loading')}
        </p>
      </div>
    )
  }

  if (stats.total === 0 && (!history || history.length === 0)) {
    return (
      <div className="w-full p-4 bg-bg-primary-light/40 dark:bg-bg-primary/40 rounded-lg border border-border-light dark:border-border">
        <p className={`text-center ${secondaryTextColor} text-sm`}>
          {t('charts.noData')}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Estatísticas Resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bg-primary-light/60 dark:bg-bg-primary/60 p-4 rounded-lg border border-border-light dark:border-border">
          <div className={`text-xs font-medium ${secondaryTextColor} mb-1`}>
            {t('charts.total')}
          </div>
          <div className={`text-2xl font-bold ${textColorClass}`}>
            {stats.total}
          </div>
        </div>
        
        <div className="bg-success/10 border border-success/30 p-4 rounded-lg">
          <div className={`text-xs font-medium ${secondaryTextColor} mb-1`}>
            {t('charts.positive')}
          </div>
          <div className="text-2xl font-bold text-success">
            {stats.positive} ({stats.positivePercentage.toFixed(1)}%)
          </div>
        </div>
        
        <div className="bg-danger/10 border border-danger/30 p-4 rounded-lg">
          <div className={`text-xs font-medium ${secondaryTextColor} mb-1`}>
            {t('charts.negative')}
          </div>
          <div className="text-2xl font-bold text-danger">
            {stats.negative} ({stats.negativePercentage.toFixed(1)}%)
          </div>
        </div>
      </div>

      {/* Gráfico de Pizza - Distribuição */}
      <div className="bg-bg-primary-light/60 dark:bg-bg-primary/60 p-4 rounded-lg border border-border-light dark:border-border">
        <h3 className={`text-lg font-semibold mb-4 ${textColorClass}`}>
          {t('charts.distribution')}
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={stats.pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {stats.pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.name === t('charts.positive') ? COLORS.positive : COLORS.negative} 
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: '8px',
                color: tooltipText,
              }}
              labelStyle={{ color: tooltipText }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Barras - Comparação */}
      <div className="bg-bg-primary-light/60 dark:bg-bg-primary/60 p-4 rounded-lg border border-border-light dark:border-border">
        <h3 className={`text-lg font-semibold mb-4 ${textColorClass}`}>
          {t('charts.comparison')}
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={stats.barData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: textColor }}
              stroke={gridColor}
            />
            <YAxis 
              tick={{ fill: textColor }}
              stroke={gridColor}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: '8px',
                color: tooltipText,
              }}
              labelStyle={{ color: tooltipText }}
            />
            <Legend />
            <Bar 
              dataKey="value" 
              fill={COLORS.positive}
              name={t('charts.count')}
            />
            <Bar 
              dataKey="confidence" 
              fill={COLORS.negative}
              name={t('charts.avgConfidence')}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Linha - Evolução Temporal */}
      {stats.timelineData.length > 0 && (
        <div className="bg-bg-primary-light/60 dark:bg-bg-primary/60 p-4 rounded-lg border border-border-light dark:border-border">
          <h3 className={`text-lg font-semibold mb-4 ${textColorClass}`}>
            {t('charts.timeline')}
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: textColor }}
                stroke={gridColor}
              />
              <YAxis 
                tick={{ fill: textColor }}
                stroke={gridColor}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  color: '#0f172a',
                }}
                labelStyle={{ color: '#0f172a' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="positive" 
                stroke={COLORS.positive} 
                strokeWidth={2}
                name={t('charts.positive')}
                dot={{ fill: COLORS.positive, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="negative" 
                stroke={COLORS.negative} 
                strokeWidth={2}
                name={t('charts.negative')}
                dot={{ fill: COLORS.negative, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Estatísticas de Confiança */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bg-primary-light/60 dark:bg-bg-primary/60 p-4 rounded-lg border border-border-light dark:border-border">
          <div className={`text-xs font-medium ${secondaryTextColor} mb-1`}>
            {t('charts.avgConfidence')}
          </div>
          <div className={`text-xl font-bold ${textColorClass}`}>
            {stats.averageConfidence.toFixed(1)}%
          </div>
        </div>
        
        <div className="bg-success/10 border border-success/30 p-4 rounded-lg">
          <div className={`text-xs font-medium ${secondaryTextColor} mb-1`}>
            {t('charts.positiveAvgConfidence')}
          </div>
          <div className="text-xl font-bold text-success">
            {stats.positiveAverageConfidence.toFixed(1)}%
          </div>
        </div>
        
        <div className="bg-danger/10 border border-danger/30 p-4 rounded-lg">
          <div className={`text-xs font-medium ${secondaryTextColor} mb-1`}>
            {t('charts.negativeAvgConfidence')}
          </div>
          <div className="text-xl font-bold text-danger">
            {stats.negativeAverageConfidence.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  )
}

export default Charts

