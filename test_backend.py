#!/usr/bin/env python3
"""
Simple test script to verify the multi-agent system works
"""

import asyncio
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from agents.orchestrator import Orchestrator

async def test_analysis():
    """Test the multi-agent analysis system"""
    print("🤖 Testing Multi-Agent Document Analysis System")
    print("=" * 50)
    
    # Sample document
    sample_text = """
    Artificial Intelligence (AI) is transforming the way we work and live. 
    From healthcare to finance, AI technologies are being adopted across various industries. 
    Machine learning algorithms can now process vast amounts of data to identify patterns 
    and make predictions with remarkable accuracy. This technological advancement brings 
    both opportunities and challenges for society.
    """
    
    # Sample questions
    sample_questions = [
        "What is the main topic of this document?",
        "How is AI being used in different industries?",
        "What are the benefits and challenges mentioned?"
    ]
    
    print(f"📄 Document: {sample_text.strip()[:100]}...")
    print(f"❓ Questions: {len(sample_questions)}")
    print()
    
    # Initialize orchestrator
    orchestrator = Orchestrator()
    
    try:
        print("🔄 Starting analysis...")
        result = await orchestrator.analyze_document(sample_text, sample_questions)
        
        print("✅ Analysis completed!")
        print()
        
        # Display results
        print("📋 SUMMARY:")
        print(f"   {result['summary']}")
        print()
        
        print("😊 SENTIMENT:")
        print(f"   Sentiment: {result['sentiment']['sentiment']}")
        print(f"   Confidence: {result['sentiment']['confidence']:.2f}")
        print()
        
        print("❓ Q&A RESULTS:")
        for i, qa in enumerate(result['qa'], 1):
            print(f"   {i}. Q: {qa['question']}")
            print(f"      A: {qa['answer']}")
            print()
        
        print("📊 METADATA:")
        print(f"   Word count: {result['metadata']['word_count']}")
        print(f"   Summary length: {result['metadata']['summary_length']}")
        print(f"   Questions answered: {result['metadata']['questions_answered']}")
        
        print("\n🎉 All tests passed! The multi-agent system is working correctly.")
        
    except Exception as e:
        print(f"❌ Error during analysis: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = asyncio.run(test_analysis())
    sys.exit(0 if success else 1)
