import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Save, 
  Share,
  Settings,
  Zap,
  Image,
  MessageSquare,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import { PromptType, AIProvider } from '../../types';
import LoadingSpinner from '../LoadingSpinner';

const ImproveTab: React.FC = () => {
  const { 
    settings, 
    improvePrompt, 
    addToFavorites, 
    sharePrompt,
    copyToClipboard,
    isLoading,
    user,
    isLoggedIn,
    selectedProvider,
    selectedModel,
    selectProvider,
    selectModel,
    getAvailableModels
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [selectedType, setSelectedType] = useState<PromptType>('universal');
  const [isCopied, setIsCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const promptTypes = [
    {
      id: 'civitai' as PromptType,
      icon: Image,
      title: 'Civitai',
      description: 'Для генерации изображений в Stable Diffusion',
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'universal' as PromptType,
      icon: Layers,
      title: 'Универсальный',
      description: 'Для любых задач и ИИ моделей',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      id: 'textual' as PromptType,
      icon: MessageSquare,
      title: 'Текстовый',
      description: 'Для ChatGPT, Claude, Gemini',
      color: 'from-purple-500 to-indigo-500'
    }
  ];

  const providers = [
    { id: 'openrouter' as AIProvider, name: 'OpenRouter', free: true },
    { id: 'huggingface' as AIProvider, name: 'HuggingFace', free: true },
    { id: 'poe' as AIProvider, name: 'Poe API', free: false }
  ];

  const handleImprove = async () => {
    if (!inputText.trim()) return;
    
    if (!isLoggedIn) {
      alert('Необходимо войти в систему для использования ИИ');
      return;
    }

    if (!selectedModel) {
      alert('Выберите модель ИИ');
      return;
    }

    try {
      await improvePrompt(inputText, selectedType, selectedProvider, selectedModel.id);
      
      // Получаем последний элемент истории как результат
      // В реальности это должно возвращаться из improvePrompt
      setOutputText('Улучшенная версия промпта появится здесь...');
    } catch (error) {
      console.error('Improve error:', error);
    }
  };

  const handleCopy = async () => {
    if (outputText) {
      const success = await copyToClipboard(outputText);
      if (success) {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    }
  };

  const handleSave = async () => {
    if (!outputText || !user) return;

    try {
      await addToFavorites({
        title: `${selectedType} промпт`,
        content: outputText,
        tags: [selectedType],
        category: selectedType
      });
      alert('Сохранено в избранное!');
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleShare = async () => {
    if (!outputText || !user) return;

    try {
      const result = await sharePrompt(
        `${selectedType} промпт`,
        outputText,
        selectedType,
        [selectedType]
      );
      alert(`Промпт расшарен! Ссылка: ${result.shareUrl}`);
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const availableModels = getAvailableModels();

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Main Content Container */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getTranslation('improvePrompt', settings.language)}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Улучшите свои промпты с помощью ИИ
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-3 rounded-lg transition-all duration-200 ${
                showSettings 
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* AI Settings Panel */}
          {showSettings && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                <span>Настройки ИИ</span>
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                {/* Provider Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Провайдер ИИ
                  </label>
                  <div className="space-y-2">
                    {providers.map((provider) => (
                      <button
                        key={provider.id}
                        onClick={() => selectProvider(provider.id)}
                        className={`w-full p-3 text-sm rounded-lg transition-all duration-200 border ${
                          selectedProvider === provider.id
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{provider.name}</span>
                          {provider.free && (
                            <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                              Free
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Model Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Модель ИИ
                  </label>
                  <select
                    value={selectedModel?.id || ''}
                    onChange={(e) => {
                      const model = availableModels.find(m => m.id === e.target.value);
                      if (model) selectModel(model);
                    }}
                    className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Выберите модель...</option>
                    {availableModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} {model.free && '(Free)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Prompt Type Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-emerald-500" />
            <span>Тип промпта</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {promptTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;
              
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-4 rounded-xl transition-all duration-200 border-2 ${
                    isSelected
                      ? `bg-gradient-to-br ${type.color} text-white border-transparent shadow-lg`
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <Icon className="w-8 h-8 mx-auto mb-3" />
                  <div className="text-sm font-semibold mb-2">{type.title}</div>
                  <div className="text-xs opacity-90 leading-relaxed">{type.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompt Editor */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
          {/* Input Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              <span>{getTranslation('enterPrompt', settings.language)}</span>
            </label>
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Напишите ваш промпт здесь..."
                className="w-full h-40 p-4 text-sm bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                maxLength={2000}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white dark:bg-gray-700 px-2 py-1 rounded">
                {inputText.length}/2000
              </div>
            </div>
          </div>

          {/* Improve Button */}
          <button
            onClick={handleImprove}
            disabled={!inputText.trim() || isLoading || !selectedModel}
            className="flex items-center justify-center space-x-3 w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700 text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-[1.02] disabled:hover:scale-100 disabled:cursor-not-allowed font-semibold text-lg shadow-lg shadow-emerald-500/25"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="text-white" />
                <span>Улучшаем промпт...</span>
              </>
            ) : (
              <>
                <Zap className="w-6 h-6" />
                <span>Улучшить промпт</span>
              </>
            )}
          </button>

          {/* Results Section */}
          {outputText && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>Улучшенный промпт</span>
                </label>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all duration-200 border border-emerald-200 dark:border-emerald-800"
                    title="Копировать"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Скопировано</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Копировать</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-all duration-200 border border-teal-200 dark:border-teal-800"
                    title="Сохранить"
                  >
                    <Save className="w-4 h-4" />
                    <span>Сохранить</span>
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all duration-200 border border-emerald-200 dark:border-emerald-800"
                    title="Поделиться"
                  >
                    <Share className="w-4 h-4" />
                    <span>Поделиться</span>
                  </button>
                </div>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl">
                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                  {outputText}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImproveTab;