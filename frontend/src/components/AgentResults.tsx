import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Heart, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ChevronDown,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { AnalysisResult } from '../types';

interface AgentResultsProps {
  result: AnalysisResult;
}

const AgentResults: React.FC<AgentResultsProps> = ({ result }) => {
  const [expandedQA, setExpandedQA] = useState<number | null>(null);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'negative':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 dark:border dark:border-green-700';
      case 'negative':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 dark:border dark:border-red-700';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300 dark:border dark:border-gray-600';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.h2 
        variants={itemVariants}
        className="text-2xl font-bold text-gray-900 dark:text-white"
      >
        Analysis Results
      </motion.h2>

      {/* Summary Card */}
      <motion.div variants={itemVariants}>
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Summary
            </h3>
          </div>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {result.summary.split('\n').map((line, index) => {
              // Handle section headers
              if (line.startsWith('**') && line.endsWith('**')) {
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 p-3 rounded-lg border-l-4 border-primary-500"
                  >
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg flex items-center">
                      <span className="mr-2">📋</span>
                      {line.replace(/\*\*/g, '')}
                    </h4>
                  </motion.div>
                );
              }
              // Handle bullet points
              else if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start ml-4 mb-2 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <span className="text-primary-600 dark:text-primary-400 mr-3 mt-1 text-lg font-bold">•</span>
                    <span className="flex-1">{line.replace(/^[•\-*]\s*/, '')}</span>
                  </motion.div>
                );
              }
              // Handle regular paragraphs
              else if (line.trim()) {
                return (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="mb-3 text-justify"
                  >
                    {line}
                  </motion.p>
                );
              }
              // Handle empty lines
              else {
                return <br key={index} />;
              }
            })}
          </div>
          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Words: {result.metadata.word_count}</span>
            <span>Summary Length: {result.metadata.summary_length}</span>
          </div>
        </div>
      </motion.div>

      {/* Sentiment Card */}
      <motion.div variants={itemVariants}>
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-lg">
              <Heart className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sentiment Analysis
            </h3>
          </div>
          
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                {getSentimentIcon(result.sentiment.sentiment)}
                <span className={`px-4 py-2 rounded-lg text-sm font-medium ${getSentimentColor(result.sentiment.sentiment)}`}>
                  {result.sentiment.sentiment.charAt(0).toUpperCase() + result.sentiment.sentiment.slice(1)}
                </span>
              </div>
            </div>

          {/* Confidence Meter */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Confidence</span>
              <span>{Math.round(result.sentiment.confidence * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${result.sentiment.confidence * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  result.sentiment.confidence > 0.8 
                    ? 'bg-green-500' 
                    : result.sentiment.confidence > 0.6 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
                }`}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Q&A Card */}
      {result.qa.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Q&A Results
              </h3>
              <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-2 py-1 rounded-full text-sm font-medium">
                {result.qa.length} questions
              </span>
            </div>

            <div className="space-y-3">
              {result.qa.map((qa, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                    onClick={() => setExpandedQA(expandedQA === index ? null : index)}
                    className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <span className="font-medium text-gray-900 dark:text-white flex-1">
                      {qa.question}
                    </span>
                    <motion.div
                      animate={{ rotate: expandedQA === index ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </motion.div>
                  </motion.button>
                  
                  <AnimatePresence>
                    {expandedQA === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-3 pt-1 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              {qa.answer}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Metadata */}
      <motion.div variants={itemVariants}>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Analysis Metadata
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>Questions Answered: {result.metadata.questions_answered}</div>
            <div>Processing Status: Complete</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AgentResults;
