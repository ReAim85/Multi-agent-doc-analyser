# Multi-Agent Document Analysis System

A containerized web application that processes documents through a pipeline of specialized AI agents (Summary, Q&A, Sentiment) and displays the results in an animated, responsive UI.

## 🚀 Features

- **Multi-Agent Architecture**: Specialized AI agents for summarization, sentiment analysis, and Q&A
- **Modern Frontend**: React with TypeScript, Tailwind CSS, and Framer Motion animations
- **Containerized Backend**: FastAPI server with Docker support
- **Responsive Design**: Dark mode support and mobile-friendly interface
- **Real-time Analysis**: Asynchronous processing with loading states and animations

## 🏗️ Architecture

### Backend Components
- **FastAPI Server** (`backend/app.py`): RESTful API with CORS support
- **Orchestrator Agent** (`backend/agents/orchestrator.py`): Coordinates all agents
- **Summarizer Agent** (`backend/agents/summarizer.py`): Document summarization
- **Q&A Agent** (`backend/agents/qa_agent.py`): Question answering
- **Sentiment Analyzer** (`backend/agents/sentiment_analyzer.py`): Sentiment analysis

### Frontend Components
- **App.tsx**: Main application with dark mode toggle
- **DocumentInput.tsx**: File upload and text input with drag-and-drop
- **AgentResults.tsx**: Animated results display with accordion Q&A
- **LoadingSpinner.tsx**: Animated loading states

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Python 3.9**: Base runtime
- **Docker**: Containerization
- **Cerebras Integration**: Placeholder for Cerebras Cloud SDK

### Frontend
- **React 18**: UI framework with TypeScript
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Lucide React**: Icon library

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for frontend development)

### Backend Setup

1. **Build and run the backend:**
```bash
# Build the Docker image
docker-compose build

# Start the backend service
docker-compose up
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Start the development server:**
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📡 API Endpoints

### POST /analyze
Analyze text with optional questions.

**Request:**
```json
{
  "text": "Your document content here...",
  "questions": ["What is the main topic?", "How does it work?"]
}
```

**Response:**
```json
{
  "summary": "Generated summary...",
  "sentiment": {
    "sentiment": "positive",
    "confidence": 0.85
  },
  "qa": [
    {
      "question": "What is the main topic?",
      "answer": "The main topic is..."
    }
  ],
  "metadata": {
    "word_count": 150,
    "summary_length": 25,
    "questions_answered": 2
  }
}
```

### POST /analyze-file
Analyze uploaded .txt file.

**Request:** Multipart form data with file and optional questions parameter.

## 🎨 UI Features

### Animations
- **Page transitions**: Smooth fade and slide animations
- **Loading states**: Animated dots with progress bars
- **Micro-interactions**: Hover and tap animations on buttons
- **Staggered animations**: Sequential reveal of result cards
- **Accordion Q&A**: Smooth height animations for expand/collapse

### Dark Mode
- **Toggle button**: Animated sun/moon icon
- **Smooth transitions**: Color transitions between themes
- **Consistent theming**: All components support dark mode

### Responsive Design
- **Mobile-first**: Optimized for all screen sizes
- **Grid layout**: Responsive grid for desktop/tablet
- **Touch-friendly**: Large touch targets for mobile

## 🔧 Development

### Project Structure
```
multi-agent-app/
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── backend/
│   ├── app.py
│   └── agents/
│       ├── __init__.py
│       ├── orchestrator.py
│       ├── summarizer.py
│       ├── qa_agent.py
│       └── sentiment_analyzer.py
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── DocumentInput.tsx
    │   │   ├── AgentResults.tsx
    │   │   └── LoadingSpinner.tsx
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── types.ts
    ├── package.json
    └── tailwind.config.js
```

### Adding New Agents

1. Create a new agent class in `backend/agents/`
2. Implement the `_call_cerebras_model` method
3. Add the agent to the orchestrator
4. Update the frontend to display new results

### Customizing Animations

The project uses Framer Motion with predefined variants. Customize animations in:
- `App.tsx`: Page-level animations
- `DocumentInput.tsx`: Input form animations
- `AgentResults.tsx`: Results display animations
- `LoadingSpinner.tsx`: Loading state animations

## 🐳 Docker Deployment

### Production Build
```bash
# Build the backend
docker-compose build

# Run in production mode
docker-compose up -d
```

### Environment Variables
- `PYTHONPATH=/app`
- `PYTHONUNBUFFERED=1`

## 🔮 Future Enhancements

- **Real Cerebras Integration**: Replace placeholder functions with actual Cerebras Cloud SDK
- **Additional Agents**: Add more specialized agents (translation, classification, etc.)
- **Batch Processing**: Support for multiple document analysis
- **Export Features**: Download results as PDF/JSON
- **User Authentication**: Multi-user support with saved analyses
- **Advanced Analytics**: Charts and visualizations for sentiment trends

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or issues, please open an issue on the GitHub repository.
