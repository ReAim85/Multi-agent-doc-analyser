import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Brain, AlertCircle } from 'lucide-react';
import DocumentInput from './components/DocumentInput';
import AgentResults from './components/AgentResults';
import LoadingSpinner from './components/LoadingSpinner';
import { AnalysisResult } from './types';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleAnalysis = async (text: string, questions: string[], file?: File) => {
    // Reset states
    setError(null);
    setAnalysisResult(null);
    setIsLoading(true);

    // Validate input
    if (!text.trim() && !file) {
      setError('Please provide text content or upload a file');
      setIsLoading(false);
      return;
    }

    if (text.trim().length < 50 && !file) {
      setError('Please provide at least 50 characters of text for meaningful analysis');
      setIsLoading(false);
      return;
    }

    try {
      let response;
      
      if (file) {
        // Handle file upload with proper FormData format
        const formData = new FormData();
        formData.append('file', file);
        
        // Append questions as individual fields for proper array handling
        questions.forEach((question, index) => {
          formData.append(`questions[${index}]`, question);
        });
        
        response = await fetch('/api/analyze-file', {
          method: 'POST',
          body: formData,
        });
      } else {
        // Handle text input
        response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: text.trim(),
            questions: questions.filter(q => q.trim().length > 0), // Filter empty questions
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Analysis failed' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result: AnalysisResult = await response.json();
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg"
              >
                <Brain className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </motion.div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Multi-Agent Document Analysis
              </h1>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-800 dark:text-red-300 text-sm font-medium">
                    {error}
                  </span>
                </div>
                <button
                  onClick={clearError}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <DocumentInput 
              onAnalyze={handleAnalysis} 
              //@ts-ignore
              isAnalyzing={isLoading}
            />
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <LoadingSpinner key="loading" />
              ) : analysisResult ? (
                <AgentResults key="results" result={analysisResult} />
              ) : error ? (
                // Error state placeholder
                <motion.div
                  key="error-placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="card text-center py-12"
                >
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Analysis Failed
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {error}
                  </p>
                  <button
                    onClick={clearError}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Try Again
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="card text-center py-12"
                >
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Ready to Analyze
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Upload a document or enter text to get started with AI-powered analysis
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default App;