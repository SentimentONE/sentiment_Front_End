# Frontend - Sentiment Analysis API

Frontend React moderno para análise de sentimento de textos.  
Repositório da atividade extra do HACKATHON Criar um Front_End

## 🚀 Tecnologias

- **React 18** - Biblioteca JavaScript para construção de interfaces
- **Vite** - Build tool rápida e moderna
- **Tailwind CSS** - Framework CSS utility-first para estilização
- **Axios** - Cliente HTTP para comunicação com a API

## 📦 Instalação

1. Instale as dependências:
```bash
npm install
```

## 🏃 Executando o Projeto

### Modo Desenvolvimento
```bash
npm run dev
```

O frontend estará disponível em `http://localhost:3000`

### Build para Produção
```bash
npm run build
```

### Preview do Build
```bash
npm run preview
```

## ⚙️ Configuração

O frontend está configurado para se conectar com a API backend em `http://localhost:8080` por padrão.

## 🎨 Funcionalidades

- ✅ Interface moderna e responsiva
- ✅ Análise de sentimento em tempo real
- ✅ Histórico de análises
- ✅ Visualização de resultados com gráficos de confiança
- ✅ Validação de entrada
- ✅ Feedback visual de carregamento
- ✅ Tratamento de erros

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/          # Componentes React
│   │   ├── SentimentAnalyzer.jsx
│   │   ├── ResultDisplay.jsx
│   │   └── History.jsx
│   ├── services/            # Serviços de API
│   │   └── api.js
│   ├── App.jsx              # Componente principal
│   ├── main.jsx             # Ponto de entrada
│   └── index.css            # Estilos globais (Tailwind)
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js       # Configuração do Tailwind CSS
└── postcss.config.js        # Configuração do PostCSS
```

## 🔌 Integração com API

O frontend faz requisições POST para o endpoint `/sentiment` da API backend:

**Request (Backend):**
```json
{
  "text": "Este produto é muito bom!"
}
```

**Response (Backend):**
```json
{
  "sentiment": "POSITIVO",
  "score": 0.95,
  "text": "Este produto é muito bom!"
}
```

**Nota**: O frontend mapeia a resposta do backend para o formato interno:
- `sentiment` → `sentimentResult` (normalizado para POSITIVO/NEGATIVO)
- `score` → `confidenceScore`
- `text` → `textContent`

