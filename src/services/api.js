import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const analyzeSentiment = async (textContent) => {
  try {
    // Backend espera { "text": "..." }
    const payload = {
      text: textContent,
    }

    const response = await api.post('/sentiment', payload)
    
    // Backend retorna: { "sentiment": "POSITIVE", "score": 0.87, "text": "..." }
    // Frontend espera: { sentimentResult, confidenceScore, textContent, analyzedAt }
    const mappedData = {
      sentimentResult: response.data.sentiment || 'NEUTRO',
      confidenceScore: response.data.score || 0,
      textContent: response.data.text || textContent,
      analyzedAt: new Date().toISOString(),
    }
    
    return {
      success: true,
      data: mappedData,
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Erro ao analisar sentimento',
    }
  }
}

export default api

