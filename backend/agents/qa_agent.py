"""
Q&A Agent
Simulates question-answering using Cerebras models
"""

import asyncio
from . import config
from typing import List, Dict, Any


class QAAgent:
    """Agent responsible for answering questions about documents"""
    
    def __init__(self):
        self.name = "QAAgent"
    
    async def _call_cerebras_model(self, prompt: str, max_length: int = 150) -> str:
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
            "temperature": 0.7,
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
            # Fallback answer if API fails
            return "Unable to process this question due to API error."
    
    async def answer_questions(self, text: str, questions: List[str]) -> List[Dict[str, str]]:
        """
        Answer questions about the provided text
        
        Args:
            text: The document text to analyze
            questions: List of questions to answer
            
        Returns:
            List of dictionaries containing question-answer pairs
        """
        if not questions:
            return []
        
        results = []
        
        for question in questions:
            try:
                prompt = f"please answer the question based on the context provided. Context: {text[:1000]}\n\nQuestion: {question}\nAnswer: (add your answer here)"
                answer = await self._call_cerebras_model(prompt)

                print(answer)
                
                results.append({
                    "question": question,
                    "answer": answer
                })
                
            except Exception as e:
                # Fallback answer if processing fails
                results.append({
                    "question": question,
                    "answer": "Unable to process this question due to an error."
                })
        
        return results
