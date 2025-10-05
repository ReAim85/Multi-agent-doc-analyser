import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Plus, X, FileText } from 'lucide-react';

interface DocumentInputProps {
  onAnalyze: (text: string, questions: string[], file?: File) => void;
}

const DocumentInput: React.FC<DocumentInputProps> = ({ onAnalyze }) => {
  const [text, setText] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'text/plain' && file.type !== 'application/pdf') {
      alert('Please upload a .txt or .pdf file');
      return;
    }

    setSelectedFile(file);

    try {
      if (file.type === 'text/plain') {
        const content = await file.text();
        setText(content);
      } else if (file.type === 'application/pdf') {
        // For PDF files, we'll let the backend handle the extraction
        // Just show a message that PDF processing will be handled server-side
        setText(''); // ✅ FIX: Clear text area for PDF files
      }
    } catch (error) {
      alert('Error reading file');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const addQuestion = () => {
    if (newQuestion.trim()) {
      setQuestions([...questions, newQuestion.trim()]);
      setNewQuestion('');
    }
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleAnalyze = () => {
    // ✅ FIX: Check if we have either text OR a file
    const hasContent = text.trim() || selectedFile;
    
    if (!hasContent) {
      alert('Please provide text content or upload a file');
      return;
    }

    // ✅ FIX: For file uploads, send empty text (backend will use the file)
    // For text input, send the actual text
    const textToSend = selectedFile ? '' : text.trim();
    
    console.log('📤 Sending to analysis:', {
      hasFile: !!selectedFile,
      textLength: textToSend.length,
      questions: questions
    });

    onAnalyze(textToSend, questions, selectedFile || undefined);
  };

  const clearAll = () => {
    setText('');
    setQuestions([]);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1
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
        Document Input
      </motion.h2>

      {/* File Upload Area */}
      <motion.div
        variants={itemVariants}
        className="relative"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
            isDragOver
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
          }`}
        >
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Drop your .txt or .pdf file here
          </p>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            or click to browse
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary"
          >
            <div className="flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </div>
          </motion.button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </motion.div>

        {/* Selected File Info */}
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-800 dark:text-green-300">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-green-600 dark:text-green-400">
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setText('');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Text Input */}
      <motion.div variants={itemVariants} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {selectedFile ? 'Additional text (optional):' : 'Or paste your text here:'}
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={selectedFile ? "Add additional text to analyze with the file..." : "Enter your document text..."}
          className="input-field min-h-[200px] resize-y"
          disabled={!!selectedFile && selectedFile.type === 'application/pdf'}
        />
        {selectedFile && selectedFile.type === 'application/pdf' && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            PDF content will be extracted automatically by the server
          </p>
        )}
      </motion.div>

      {/* Questions Input */}
      <motion.div variants={itemVariants} className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Questions (optional):
        </label>
        
        <div className="flex space-x-2">
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addQuestion()}
            placeholder="Enter a question..."
            className="input-field flex-1"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addQuestion}
            disabled={!newQuestion.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Questions List */}
        <AnimatePresence>
          {questions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              {questions.map((question, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-lg p-3"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 text-left">
                    {question}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeQuestion(index)}
                    className="text-red-500 hover:text-red-700 flex-shrink-0 ml-2"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Action Buttons */}
      <motion.div variants={itemVariants} className="flex space-x-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={clearAll}
          className="flex-1 btn-secondary"
        >
          Clear All
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAnalyze}
          disabled={!text.trim() && !selectedFile}
          className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-lg py-4"
        >
          Analyze Document
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default DocumentInput;