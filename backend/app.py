"""
FastAPI server for Multi-Agent Document Analysis System
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import asyncio
import PyPDF2
import io
from .agents.orchestrator import Orchestrator

app = FastAPI(
    title="Multi-Agent Document Analysis API",
    description="API for analyzing documents using specialized AI agents",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize orchestrator
orchestrator = Orchestrator()


class AnalyzeRequest(BaseModel):
    text: str
    questions: Optional[List[str]] = []


class AnalyzeResponse(BaseModel):
    summary: str
    sentiment: dict
    qa: List[dict]
    metadata: dict


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Multi-Agent Document Analysis API is running"}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_text(request: AnalyzeRequest):
    """
    Analyze text using all agents
    
    Args:
        request: JSON containing text and optional questions
        
    Returns:
        Analysis results from all agents
    """
    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # Process the document through the orchestrator
        result = await orchestrator.analyze_document(
            text=request.text,
            questions=request.questions or []
        )
        
        return AnalyzeResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/analyze-file", response_model=AnalyzeResponse)
async def analyze_file(
    file: UploadFile = File(...),
    questions: Optional[str] = None
):
    """
    Analyze uploaded file using all agents
    
    Args:
        file: Uploaded text or PDF file
        questions: Optional comma-separated questions
        
    Returns:
        Analysis results from all agents
    """
    try:
        # Validate file type
        if not (file.filename.endswith('.txt') or file.filename.endswith('.pdf')):
            raise HTTPException(status_code=400, detail="Only .txt and .pdf files are supported")
        
        # Read file content
        content = await file.read()
        
        # Extract text based on file type
        if file.filename.endswith('.pdf'):
            # Extract text from PDF
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            
            if not text.strip():
                raise HTTPException(status_code=400, detail="PDF appears to be empty or contains no extractable text")
        else:
            # Handle text file
            text = content.decode('utf-8')
            if not text.strip():
                raise HTTPException(status_code=400, detail="File is empty")
        
        # Parse questions if provided
        question_list = []
        if questions:
            question_list = [q.strip() for q in questions.split(',') if q.strip()]
        
        # Process the document through the orchestrator
        result = await orchestrator.analyze_document(
            text=text,
            questions=question_list
        )
        
        return AnalyzeResponse(**result)
        
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File must be UTF-8 encoded")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File analysis failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
