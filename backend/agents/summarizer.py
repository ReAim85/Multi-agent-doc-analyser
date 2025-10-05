"""
Summarizer Agent
Simulates document summarization using Cerebras models
"""

import asyncio
from . import config
from typing import Dict, Any


class Summarizer:
    """Agent responsible for summarizing documents"""
    
    def __init__(self):
        self.name = "Summarizer"
    
    async def _call_cerebras_model(self, prompt: str, max_length: int = 1000) -> str:
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
            "max_tokens": max_length * 4,  # Quadruple the token limit for much more comprehensive summaries
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
            # Fallback to a simple summary if API fails
            return "Unable to generate summary due to API error."
    
    async def summarize(self, text: str) -> Dict[str, Any]:
        """
        Generate a summary of the provided text
        
        Args:
            text: The document text to summarize
            
        Returns:
            Dictionary containing the summary
        """
        prompt = f"""Please provide a comprehensive, detailed analysis and summary of the following text. Make sure to cover ALL aspects thoroughly and provide a complete analysis. Structure your response with clear sections and bullet points to make it easy to read and understand. Include:

**MAIN TOPIC & KEY THEMES**
• [List 5-7 main themes with detailed bullet points explaining each theme]

**IMPORTANT DETAILS & SUPPORTING INFORMATION**
• [Key supporting information with detailed bullet points]
• [Specific examples, data, or evidence mentioned]
• [Important context and background information]

**KEY INSIGHTS & IMPLICATIONS**
• [Notable findings and their significance with detailed bullet points]
• [What these insights mean for the reader]
• [Potential impact or consequences]

**PATTERNS & TRENDS**
• [Any recurring patterns or trends with detailed bullet points]
• [Connections between different parts of the content]
• [Underlying themes or motifs]

**PRACTICAL RECOMMENDATIONS & NEXT STEPS**
• [Actionable recommendations with detailed bullet points]
• [What the reader should consider or do next]
• [Key takeaways for practical application]

**CONCLUSION & SUMMARY**
• [A comprehensive wrap-up of the main points]
• [Final thoughts and overall assessment]

IMPORTANT: Please ensure your analysis is complete and thorough. Do not cut off mid-sentence or leave sections incomplete. Provide detailed explanations for each point.

Text to analyze:
{text}

Please format your response with clear section headers and bullet points for easy reading. Make sure to complete the entire analysis:"""
        
        try:
            summary = await self._call_cerebras_model(prompt)
            print(summary)
            
            return {
                "summary": summary,
                "word_count": len(text.split()),
                "summary_length": len(summary.split())
            }
        except Exception as e:
            # Fallback summary if analysis fails
            return {
                "summary": "Unable to generate summary due to processing error.",
                "word_count": len(text.split()),
                "summary_length": 0
            }
