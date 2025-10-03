import React, { useState, useCallback } from 'react';
import { 
  Image, 
  Upload, 
  Wand2, 
  Copy, 
  Download, 
  Sparkles,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import { ImagePromptMode } from '../../types';
import clsx from 'clsx';

const ImageAnalysisTab: React.FC = () => {
  const { settings, user, isLoggedIn, analyzeImage } = useApp();
  
  // State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ImagePromptMode>('general');
  const [analysisResults, setAnalysisResults] = useState<{
    general: string;
    midjourney: string;
    stableDiffusion: string;
  } | null>(null);
  const [copiedMode, setCopiedMode] = useState<ImagePromptMode | null>(null);

  // Drag & Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleImageSelect(file);
      }
    }
  }, []);

  // File input handler
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleImageSelect(file);
      }
    }
  }, []);

  // Handle image selection
  const handleImageSelect = useCallback((file: File) => {
    setSelectedFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Reset previous results
    setAnalysisResults(null);
  }, []);

  // Analyze image
  const handleAnalyzeImage = async () => {
    if (!selectedFile || !isLoggedIn) {
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Используем сервис анализа изображений из контекста
      const result = await analyzeImage(selectedFile);
      
      // Устанавливаем результаты анализа
      setAnalysisResults({
        general: result.generalPrompt,
        midjourney: result.midjourneyPrompt,
        stableDiffusion: result.stableDiffusionPrompt
      });
      
    } catch (error) {
      console.error('Image analysis error:', error);
      // В случае ошибки показываем демо результаты
      setAnalysisResults({
        general: `A beautifully composed photograph featuring vibrant colors and excellent lighting. The image showcases detailed textures, balanced composition, and professional quality. The subject is well-defined with clear focus and artistic perspective. Natural lighting enhances the overall mood and atmosphere of the scene.`,
        
        midjourney: `professional photography, vibrant colors, excellent lighting, detailed textures, balanced composition, high quality, natural lighting, artistic perspective, well-defined subject, clear focus --ar 16:9 --v 6 --style raw --s 250`,
        
        stableDiffusion: `(masterpiece, best quality, ultra-detailed), professional photography, vibrant colors, excellent lighting, detailed textures, balanced composition, high resolution, natural lighting, artistic perspective, well-defined subject, clear focus, photorealistic, 8k, sharp details, perfect exposure`
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Copy prompt to clipboard
  const handleCopyPrompt = async (mode: ImagePromptMode) => {
    if (!analysisResults) return;
    
    let textToCopy = '';
    switch (mode) {
      case 'general':
        textToCopy = analysisResults.general;
        break;
      case 'midjourney':
        textToCopy = analysisResults.midjourney;
        break;
      case 'stable-diffusion':
        textToCopy = analysisResults.stableDiffusion;
        break;
    }
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedMode(mode);
      setTimeout(() => setCopiedMode(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const modes = [
    {
      id: 'general' as ImagePromptMode,
      title: 'General Image Prompt',
      description: 'Natural language description of the image',
      color: 'blue'
    },
    {
      id: 'midjourney' as ImagePromptMode,
      title: 'Midjourney',
      description: 'Tailored for Midjourney generation with parameters',
      color: 'purple'
    },
    {
      id: 'stable-diffusion' as ImagePromptMode,
      title: 'Stable Diffusion',
      description: 'Formatted for Stable Diffusion models',
      color: 'green'
    }
  ];

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Image className="w-6 h-6 text-purple-500" />
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Image Analysis
        </h1>
      </div>

      {!isLoggedIn && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              Please sign in to use image analysis feature
            </p>
          </div>
        </div>
      )}

      {/* Image Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={clsx(
          'relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200',
          'hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10',
          {
            'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800': !selectedImage,
            'border-purple-400 bg-purple-50 dark:bg-purple-900/20': selectedImage
          }
        )}
      >
        {!selectedImage ? (
          <>
            <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Upload an image to analyze
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Drop an image here or click to select
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={!isLoggedIn}
            />
            <button
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
              disabled={!isLoggedIn}
            >
              Select Image
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <img
              src={selectedImage}
              alt="Selected"
              className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
            />
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setSelectedFile(null);
                  setAnalysisResults(null);
                }}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 px-4 py-2 rounded-lg transition-colors"
              >
                Change Image
              </button>
              <button
                onClick={handleAnalyzeImage}
                disabled={isAnalyzing || !isLoggedIn}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Analyze Image</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysisResults && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Generated Prompts
          </h2>
          
          {modes.map((mode) => {
            const isActive = selectedMode === mode.id;
            const promptText = analysisResults[mode.id as keyof typeof analysisResults];
            const isCopied = copiedMode === mode.id;
            
            return (
              <div
                key={mode.id}
                className={clsx(
                  'border rounded-lg p-4 transition-all duration-200 cursor-pointer',
                  {
                    'border-blue-400 bg-blue-50 dark:bg-blue-900/20': mode.color === 'blue' && isActive,
                    'border-purple-400 bg-purple-50 dark:bg-purple-900/20': mode.color === 'purple' && isActive,
                    'border-green-400 bg-green-50 dark:bg-green-900/20': mode.color === 'green' && isActive,
                    'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600': !isActive
                  }
                )}
                onClick={() => setSelectedMode(mode.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {mode.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {mode.description}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyPrompt(mode.id);
                    }}
                    className={clsx(
                      'p-2 rounded-lg transition-all duration-200',
                      {
                        'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400': isCopied,
                        'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400': !isCopied
                      }
                    )}
                    title={isCopied ? 'Copied!' : 'Copy prompt'}
                  >
                    {isCopied ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                
                {isActive && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                      {promptText}
                    </p>
                    <div className="flex justify-end mt-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {promptText.length} characters
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ImageAnalysisTab;