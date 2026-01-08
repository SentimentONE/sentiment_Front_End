import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Mapeia o sentimento do backend para o formato do frontend
 * Backend pode retornar: "POSITIVE", "NEGATIVE", "POSITIVO", "NEGATIVO" (em maiúsculas)
 * Frontend usa: "POSITIVO", "NEGATIVO"
 */
const mapSentiment = (backendSentiment) => {
  if (!backendSentiment) return 'POSITIVO'
  
  const sentimentUpper = backendSentiment.toUpperCase().trim()
  
  // Trata valores em inglês
  if (sentimentUpper === 'NEGATIVE') {
    return 'NEGATIVO'
  }
  if (sentimentUpper === 'POSITIVE') {
    return 'POSITIVO'
  }
  
  // Trata valores em português (já vêm do backend assim quando usa análise simples)
  if (sentimentUpper === 'NEGATIVO') {
    return 'NEGATIVO'
  }
  if (sentimentUpper === 'POSITIVO') {
    return 'POSITIVO'
  }
  
  // Por padrão, assume POSITIVO
  return 'POSITIVO'
}

/**
 * Extrai mensagem de erro da resposta do backend
 * Backend retorna ApiErrorResponse: { status, error, message, timestamp }
 */
const extractErrorMessage = (error) => {
  if (error.response?.data) {
    const errorData = error.response.data
    
    // Se for ApiErrorResponse do backend
    if (errorData.message) {
      return errorData.message
    }
    
    // Fallback para outros formatos
    if (errorData.error) {
      return errorData.error
    }
  }
  
  // Erro de rede ou outro tipo
  if (error.message) {
    return error.message
  }
  
  return 'Erro ao analisar sentimento'
}

/**
 * Analisa o sentimento de um texto único
 * 
 * @param {string} textContent - Texto para análise
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const analyzeSentiment = async (textContent) => {
  try {
    // Backend espera: { "text": "..." }
    const payload = {
      text: textContent,
    }

    const response = await api.post('/sentiment', payload)
    
    // Backend retorna: { "sentiment": "POSITIVE", "score": 0.87, "text": "..." }
    const backendSentiment = response.data.sentiment
    const score = response.data.score ?? 0
    const text = response.data.text || textContent
    
    // Mapeia para formato do frontend
    const mappedData = {
      sentimentResult: mapSentiment(backendSentiment),
      confidenceScore: score,
      textContent: text,
      analyzedAt: new Date().toISOString(),
    }
    
    return {
      success: true,
      data: mappedData,
    }
  } catch (error) {
    return {
      success: false,
      error: extractErrorMessage(error),
    }
  }
}

/**
 * Analisa sentimento em lote via arquivo CSV
 * 
 * @param {File} file - Arquivo CSV
 * @param {string} textColumn - Nome da coluna com textos (opcional)
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const analyzeBatchCSV = async (file, textColumn = null) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    if (textColumn) {
      formData.append('textColumn', textColumn)
    }

    // Para FormData, o axios define automaticamente o Content-Type com boundary
    // Criamos uma requisição sem o header padrão 'Content-Type' para que o axios defina corretamente
    const response = await axios.post(`${API_URL}/sentiment/batch`, formData)
    
    // Backend retorna: { "results": [...], "totalProcessed": 10 }
    const results = (response.data.results || []).map(item => ({
      sentimentResult: mapSentiment(item.sentiment),
      confidenceScore: item.score ?? 0,
      textContent: item.text || '',
      analyzedAt: new Date().toISOString(),
    }))
    
    return {
      success: true,
      data: {
        results,
        totalProcessed: response.data.totalProcessed || 0,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: extractErrorMessage(error),
    }
  }
}

/**
 * Busca estatísticas agregadas do backend
 * 
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getStatistics = async () => {
  try {
    const response = await api.get('/sentiment/statistics')
    
    // Backend retorna: StatisticsDTO
    const data = response.data
    
    return {
      success: true,
      data: {
        total: data.total || 0,
        positive: data.positive || 0,
        negative: data.negative || 0,
        positivePercentage: data.positivePercentage || 0,
        negativePercentage: data.negativePercentage || 0,
        averageConfidence: data.averageConfidence || 0,
        positiveAverageConfidence: data.positiveAverageConfidence || 0,
        negativeAverageConfidence: data.negativeAverageConfidence || 0,
        timeline: (data.timeline || []).map(item => ({
          date: item.date,
          positive: item.positive || 0,
          negative: item.negative || 0,
          total: item.total || 0,
        })),
      },
    }
  } catch (error) {
    return {
      success: false,
      error: extractErrorMessage(error),
    }
  }
}

/**
 * Busca histórico de análises do backend
 * 
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const getHistory = async () => {
  try {
    const response = await api.get('/sentiment/history')
    
    // Backend retorna: { historyItemList: [HistoryItemDTO] }
    const items = response.data?.historyItemList || []

    const history = items.map(item => ({
      id: item.id,
      sentimentResult: mapSentiment(item.sentimentResult),
      confidenceScore: item.confidenceScore || 0,
      textContent: item.textContent || '',
      analyzedAt: item.analyzedAt,
      timestamp: item.analyzedAt,
    }))
    
    return {
      success: true,
      data: history,
    }
  } catch (error) {
    return {
      success: false,
      error: extractErrorMessage(error),
    }
  }
}

export default api

