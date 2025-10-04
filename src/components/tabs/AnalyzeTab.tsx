import React, { useState, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Upload, Image, Sparkles, Copy, Heart, Share2, AlertCircle, CheckCircle } from 'lucide-react';
import { ImageAnalysisService } from '../../services/imageAnalysis';

const PROMPT_TYPE_OPTIONS: { value: 'general' | 'flux' | 'stableDiffusion', label: string, description: string }[] = [
  {
    value: 'general',
    label: 'General Image Prompt',
    description: 'Natural language description of the image'
  },
  {
    value: 'flux',
    label: 'Flux',
    description: 'Optimized for state-of-the-art Flux AI models, concise natural language'
  },
  {
    value: 'stableDiffusion',
    label: 'Stable Diffusion',
    description: 'Formatted for Stable Diffusion models'
  }
];

export default function AnalyzeTab() {
  const { 
    isLoading, 
    error, 
    copyToClipboard, 
    setError,
    user,
    imageAnalyses,
    addImageAnalysis,
    addToFavorites: addToFavoritesContext
  } = useApp();
  
  // Переименовываем чтобы избежать конфликта имен
  const addToFavoritesHandler = addToFavoritesContext;

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedPromptType, setSelectedPromptType] = useState<'general' | 'flux' | 'stableDiffusion'>('general');
  const [generatedPrompts, setGeneratedPrompts] = useState<{
    general: string;
    flux: string;
    stableDiffusion: string;
  } | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and Drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP up to 4MB)');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setError('Image file size must be under 4MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setSelectedImage(e.target.result as string);
        setGeneratedPrompts(null);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  }, [setError]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    // Получаем файл из data URL
    const response = await fetch(selectedImage);
    const blob = await response.blob();
    const file = new File([blob], 'image.jpg', { type: blob.type });

    try {
      const imageService = new ImageAnalysisService();
      const prompts = await imageService.generatePrompts(file, 'openrouter');
      setGeneratedPrompts(prompts);
      setError(null);
      
      // Сохраняем анализ если пользователь авторизован или локально
      if (user || !user) { // Работает для всех пользователей
        await addImageAnalysis({
          imageUrl: selectedImage,
          generatedPrompts: prompts,
          promptType: selectedPromptType,
          isFavorite: false
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to analyze image. Please try again.');
      console.error('Image analysis error:', error);
    }
  };

  const handleCopy = async (promptType: string, text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopySuccess(promptType);
      setTimeout(() => setCopySuccess(null), 2000);
    }
  };

  const handleAddToFavorites = async (promptType: 'general' | 'flux' | 'stableDiffusion') => {
    if (!generatedPrompts || !selectedImage) return;
    
    try {
      const promptContent = generatedPrompts[promptType];
      
      await addToFavoritesHandler({
        title: `${promptType.charAt(0).toUpperCase() + promptType.slice(1)} Image Prompt`,
        content: promptContent,
        tags: [promptType, 'image-analysis'],
        category: promptType
      });
      
      // Показываем уведомление об успехе
      setCopySuccess(promptType + '_fav');
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add to favorites');
    }
  };

  const currentPromptConfig = PROMPT_TYPE_OPTIONS.find(opt => opt.value === selectedPromptType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Image className="h-6 w-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">Image Analysis</h1>
        </div>
        <p className="text-gray-600">
          Upload an image and generate AI prompts in different formats
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Image Upload Area */}
      <div className="space-y-4">
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          {selectedImage ? (
            <div className="space-y-4">
              <img 
                src={selectedImage} 
                alt="Selected" 
                className="max-h-64 mx-auto rounded-lg shadow-md"
              />
              <p className="text-sm text-gray-600">
                Image loaded. Click "Analyze Image" to generate prompts.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-900">Drop your image here</p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, or WebP up to 4MB
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </button>
            </div>
          )}
        </div>

        {/* Analyze Button */}
        {selectedImage && (
          <div className="text-center">
            <button
              onClick={analyzeImage}
              disabled={isLoading}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              {isLoading ? 'Analyzing...' : 'Analyze Image'}
            </button>
          </div>
        )}
      </div>

      {/* Generated Prompts */}
      {generatedPrompts && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Generated Prompts</h2>
          
          {/* Prompt Type Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {PROMPT_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedPromptType(option.value)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedPromptType === option.value
                    ? 'bg-white text-purple-700 shadow'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Current Prompt Display */}
          {currentPromptConfig && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                {currentPromptConfig.description}
              </div>
              
              <div className="relative">
                <textarea
                  value={generatedPrompts[selectedPromptType] || ''}
                  readOnly
                  className="w-full h-32 p-4 border border-gray-200 rounded-lg bg-gray-50 text-sm resize-none"
                  placeholder="Generated prompt will appear here..."
                />
                
                {/* Action Buttons */}
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => handleCopy(selectedPromptType, generatedPrompts[selectedPromptType] || '')}
                    className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {copySuccess === selectedPromptType ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleAddToFavorites(selectedPromptType)}
                    className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                  >
                    {copySuccess === selectedPromptType + '_fav' ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Added!
                      </>
                    ) : (
                      <>
                        <Heart className="h-4 w-4 mr-1" />
                        Favorite
                      </>
                    )}
                  </button>
                  
                  <button
                    className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Analyses */}
      {imageAnalyses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Analyses</h2>
          <div className="grid grid-cols-1 gap-4">
            {imageAnalyses.slice(0, 3).map((analysis) => (
              <div key={analysis.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start space-x-3">
                  <img 
                    src={analysis.imageUrl} 
                    alt="Analysis" 
                    className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {analysis.promptType.charAt(0).toUpperCase() + analysis.promptType.slice(1)} Prompt
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {analysis.generatedPrompts[analysis.promptType as keyof typeof analysis.generatedPrompts]}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(analysis.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Heart className={`h-5 w-5 ${analysis.isFavorite ? 'text-red-500' : 'text-gray-300'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Login Prompt */}
      {!user && (
        <div className="text-center p-6 bg-blue-50 rounded-lg">
          <p className="text-blue-800 mb-2">
            Login to save your image analyses and access advanced features
          </p>
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            Login with Google →
          </button>
        </div>
      )}
    </div>
  );
}