"""
Orchestrator Agent
Coordinates the workflow between different agents
"""

import asyncio
from typing import Dict, Any, List
from .summarizer import Summarizer
from .qa_agent import QAAgent
from .sentiment_analyzer import SentimentAnalyzer


class Orchestrator:
    """Main orchestrator that coordinates all agents"""
    
    def __init__(self):
        self.summarizer = Summarizer()
        self.qa_agent = QAAgent()
        self.sentiment_analyzer = SentimentAnalyzer()
    
    async def analyze_document(self, text: str, questions: List[str] = None) -> Dict[str, Any]:
        """
        Orchestrate the analysis of a document using all agents
        
        Args:
            text: The document text to analyze
            questions: Optional list of questions to answer
            
        Returns:
            Dictionary containing all analysis results
        """
        if questions is None:
            questions = []
        
        # Run agents in parallel for better performance
        tasks = [
            self.summarizer.summarize(text),
            self.sentiment_analyzer.analyze_sentiment(text),
            self.qa_agent.answer_questions(text, questions)
        ]
        
        try:
            # Execute all tasks concurrently
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            summary_result, sentiment_result, qa_result = results
            
            # Handle any exceptions that occurred
            if isinstance(summary_result, Exception):
                summary_result = {"summary": "Error generating summary", "word_count": 0, "summary_length": 0}
            
            if isinstance(sentiment_result, Exception):
                sentiment_result = {"sentiment": "neutral", "confidence": 0.5}
            
            if isinstance(qa_result, Exception):
                qa_result = []
            
            return {
                "summary": summary_result.get("summary", ""),
                "sentiment": sentiment_result,
                "qa": qa_result,
                "metadata": {
                    "word_count": summary_result.get("word_count", 0),
                    "summary_length": summary_result.get("summary_length", 0),
                    "questions_answered": len(qa_result) if qa_result else 0
                }
            }
            
        except Exception as e:
            # Fallback response if orchestration fails
            return {
                "summary": "Analysis failed due to system error",
                "sentiment": {"sentiment": "neutral", "confidence": 0.0},
                "qa": [],
                "metadata": {
                    "word_count": len(text.split()),
                    "summary_length": 0,
                    "questions_answered": 0,
                    "error": str(e)
                }
            }
