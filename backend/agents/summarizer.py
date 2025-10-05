import asyncio
import httpx
from typing import Dict, Any
from . import config


class Summarizer:
    """Agent responsible for summarizing documents"""
    
    def __init__(self):
        self.name = "Summarizer"
        self.max_retries = 3
        self.timeout = 60.0  # Increased timeout
    
    async def _call_cerebras_model(self, prompt: str, max_length: int = 1000) -> str:
        """
        Real Cerebras API call with proper error handling
        """
        # Validate configuration
        api_key = getattr(config, 'API_KEY', None)
        if not api_key:
            return "Error: Cerebras API key not configured in environment"
        
        if not prompt or len(prompt.strip()) == 0:
            return "Error: Empty prompt provided"
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "llama-4-scout-17b-16e-instruct",
            "prompt": prompt,
            "max_tokens": min(max_length * 4, 4000),  # Add upper limit
            "temperature": 0.7,
            "stream": False
        }
        
        # Retry logic
        for attempt in range(self.max_retries):
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        "https://api.cerebras.ai/v1/completions",
                        headers=headers,
                        json=payload,
                        timeout=self.timeout
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        return result["choices"][0]["text"].strip()
                    elif response.status_code == 429:  # Rate limit
                        await asyncio.sleep(2 ** attempt)  # Exponential backoff
                        continue
                    else:
                        response.raise_for_status()
                        
            except httpx.TimeoutException:
                if attempt == self.max_retries - 1:
                    return "Error: Request timeout - try again later"
                continue
            except httpx.RequestError as e:
                if attempt == self.max_retries - 1:
                    return f"Error: Connection issue - {str(e)}"
                continue
            except Exception as e:
                if attempt == self.max_retries - 1:
                    return f"Error: Processing failed - {str(e)}"
                continue
        
        return "Error: Maximum retries exceeded"
    
    async def summarize(self, text: str) -> Dict[str, Any]:
        """
        Generate a summary of the provided text with improved prompt
        """
        if not text or len(text.strip()) < 50:
            return {
                "summary": "Error: Text too short for meaningful analysis",
                "word_count": len(text.split()) if text else 0,
                "summary_length": 0
            }
        
        # Improved prompt - clearer instructions
        prompt = f""" READ THE PROMPT CAREFULLY AND FOLLOW IT STRICTLY.
        Please provide a comprehensive, detailed analysis and summary of the following text. Make sure to cover ALL aspects thoroughly and provide a complete analysis. Structure your response with clear sections and bullet points to make it easy to read and understand. Include the below sections with proper headings and bullet points as provided below. Like do not add (##), only add (**) before and after each heading and (•) before bullet points and add a new line after each section:

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
            
            return {
                "summary": summary,
                "word_count": len(text.split()),
                "summary_length": len(summary.split()),
                "status": "success" if not summary.startswith("Error:") else "error"
            }
        except Exception as e:
            return {
                "summary": f"Unexpected error: {str(e)}",
                "word_count": len(text.split()),
                "summary_length": 0,
                "status": "error"
            }