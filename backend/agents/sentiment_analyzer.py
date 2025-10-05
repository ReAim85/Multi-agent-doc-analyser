"""
Sentiment Analyzer Agent
Simulates sentiment analysis using Cerebras models
"""

import asyncio
from . import config
from typing import Dict, Any
import random


class SentimentAnalyzer:
    """Agent responsible for analyzing document sentiment"""
    
    def __init__(self):
        self.name = "SentimentAnalyzer"
    
    async def _call_cerebras_model(self, prompt: str, max_length: int = 100) -> str:
        """
        Real Cerebras API call using llama-4-scout-17b-16e-instruct model
        """
        import httpx
        
        api_key = config.API_KEY
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "llama-4-scout-17b-16e-instruct",
            "prompt": prompt,
            "max_tokens": max_length,
            "temperature": 0.3,  # Lower temperature for more consistent sentiment analysis
            "stream": False
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.cerebras.ai/v1/completions",
                    headers=headers,
                    json=payload,
                    timeout=30.0
                )
                response.raise_for_status()
                result = response.json()
                return result["choices"][0]["text"].strip()
        except Exception as e:
            print(f"Cerebras API error: {e}")
            # Fallback to neutral sentiment if API fails
            return "neutral"
    
    async def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """
        Analyze the sentiment of the provided text
        
        Args:
            text: The document text to analyze
            
        Returns:
            Dictionary containing sentiment and confidence
        """
        prompt = f"Analyze the sentiment of the following text and respond with only one word (positive, negative, or neutral):\n\n{text[:500]}"
        
        try:
            sentiment = await self._call_cerebras_model(prompt)
            
            # Generate confidence score (simulated)
            confidence = round(random.uniform(0.7, 0.95), 2)
            
            return {
                "sentiment": sentiment,
                "confidence": confidence
            }
            
        except Exception as e:
            # Fallback to neutral sentiment if analysis fails
            return {
                "sentiment": "neutral",
                "confidence": 0.5
            }
