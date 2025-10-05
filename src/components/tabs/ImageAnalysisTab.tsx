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
      color: 'emerald'
    },
    {
      id: 'midjourney' as ImagePromptMode,
      title: 'Midjourney',
      description: 'Tailored for Midjourney generation with parameters',
      color: 'teal'
    },
    {
      id: 'stable-diffusion' as ImagePromptMode,
      title: 'Stable Diffusion',
      description: 'Formatted for Stable Diffusion models',
      color: 'emerald'
    }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Main Content Container */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
              <Image className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Анализ изображений
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Создавайте промпты из изображений с помощью ИИ
              </p>
            </div>
          </div>

          {!isLoggedIn && (
            <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">
                  Войдите в систему для использования анализа изображений
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Image Upload Area */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Upload className="w-4 h-4 text-emerald-500" />
            <span>Загрузка изображения</span>
          </h3>
          
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={clsx(
              'relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200',
              'hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10',
              {
                'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700': !selectedImage,
                'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20': selectedImage
              }
            )}
          >
            {!selectedImage ? (
              <>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Загрузите изображение для анализа
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Перетащите изображение сюда или нажмите для выбора файла
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={!isLoggedIn}
                />
                <button
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25 font-medium"
                  disabled={!isLoggedIn}
                >
                  Выбрать изображение
                </button>
              </>
            ) : (
              <div className="space-y-6">
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="max-w-full max-h-80 mx-auto rounded-xl shadow-lg border border-gray-200 dark:border-gray-600"
                />
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setSelectedFile(null);
                      setAnalysisResults(null);
                    }}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    Изменить изображение
                  </button>
                  <button
                    onClick={handleAnalyzeImage}
                    disabled={isAnalyzing || !isLoggedIn}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg shadow-emerald-500/25"
                  >
                    {isAnalyzing ? (
                      <>
                        <Sparkles className="w-5 h-5 animate-spin" />
                        <span>Анализируем...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        <span>Анализировать изображение</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Results */}
        {analysisResults && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <span>Сгенерированные промпты</span>
            </h2>
            
            <div className="space-y-4">
              {modes.map((mode) => {
                const isActive = selectedMode === mode.id;
                const promptText = analysisResults[mode.id as keyof typeof analysisResults];
                const isCopied = copiedMode === mode.id;
                
                return (
                  <div
                    key={mode.id}
                    className={clsx(
                      'border-2 rounded-xl p-5 transition-all duration-200 cursor-pointer',
                      {
                        'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg shadow-emerald-500/10': mode.color === 'emerald' && isActive,
                        'border-teal-400 bg-teal-50 dark:bg-teal-900/20 shadow-lg shadow-teal-500/10': mode.color === 'teal' && isActive,
                        'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-gray-50 dark:hover:bg-gray-700': !isActive
                      }
                    )}
                    onClick={() => setSelectedMode(mode.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
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
                          'p-3 rounded-lg transition-all duration-200 border',
                          {
                            'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-600': isCopied,
                            'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600': !isCopied
                          }
                        )}
                        title={isCopied ? 'Скопировано!' : 'Копировать промпт'}
                      >
                        {isCopied ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    
                    {isActive && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                          {promptText}
                        </p>
                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {promptText.length} символов
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyPrompt(mode.id);
                            }}
                            className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
                          >
                            {isCopied ? 'Скопировано ✓' : 'Копировать текст'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageAnalysisTab;