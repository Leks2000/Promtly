import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Save, 
  Share,
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


  const promptTypes = [
    {
      id: 'civitai' as PromptType,
      icon: Image,
      title: 'Изображения',
      description: 'SD, Midjourney',
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'universal' as PromptType,
      icon: Layers,
      title: 'Универсальный',
      description: 'Любые задачи',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      id: 'textual' as PromptType,
      icon: MessageSquare,
      title: 'Текст',
      description: 'ChatGPT, Claude',
      color: 'from-blue-500 to-indigo-600'
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
    <div className="flex flex-col h-full p-4 space-y-4">
      {/* Заголовок */}
      <div className="flex items-center space-x-2">
        <Sparkles className="w-6 h-6 text-indigo-500" />
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {getTranslation('improvePrompt', settings.language)}
        </h1>
      </div>



      {/* Выбор типа промпта */}
      <div className="grid grid-cols-3 gap-3">
        {promptTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          
          return (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`relative p-3 rounded-xl transition-all duration-200 ${
                isSelected
                  ? `bg-gradient-to-br ${type.color} text-white shadow-lg shadow-${type.color.split('-')[1]}-500/25`
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Icon className="w-6 h-6 mx-auto mb-2" />
              <div className="text-xs font-medium mb-1">{type.title}</div>
              <div className="text-xs opacity-75">{type.description}</div>
            </button>
          );
        })}
      </div>

      {/* Редактор промпта */}
      <div className="flex-1 flex flex-col space-y-4 min-h-0">
        {/* Входной текст */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {getTranslation('enterPrompt', settings.language)}
          </label>
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Напишите ваш промпт здесь..."
              className="w-full h-32 p-4 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {inputText.length}/2000
            </div>
          </div>
        </div>

        {/* Кнопка улучшения */}
        <button
          onClick={handleImprove}
          disabled={!inputText.trim() || isLoading}
          className="flex items-center justify-center space-x-2 w-full py-4 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700 text-white rounded-xl transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed font-medium"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="text-white" />
              <span>Улучшаем промпт...</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              <span>Улучшить промпт</span>
            </>
          )}
        </button>

        {/* Результат */}
        {outputText && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Улучшенный промпт
              </label>
              
              {/* Быстрые кнопки */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-200"
                  title="Копировать"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                  title="Сохранить"
                >
                  <Save className="w-4 h-4" />
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-200"
                  title="Поделиться"
                >
                  <Share className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl">
              <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                {outputText}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImproveTab;