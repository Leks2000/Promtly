import React, { useState } from 'react';
import { History, Copy, Trash2, Check, Crown, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import { PromptHistoryItem } from '../../types';
import ProSubscription from '../ProSubscription';

const HistoryTab: React.FC = () => {
  const { history, settings, copyToClipboard, clearHistory, user } = useApp();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showProModal, setShowProModal] = useState(false);
  
  const isPro = user?.isPro || false;
  const maxFreeHistory = 10;
  
  // Показываем только последние 10 записей для бесплатных пользователей
  const displayedHistory = isPro ? history : history.slice(0, maxFreeHistory);
  const hasMoreHistory = !isPro && history.length > maxFreeHistory;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(settings.language === 'ru' ? 'ru-RU' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleCopy = async (text: string, id: string) => {
    await copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      clearHistory();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Main Content Container */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
                <History className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getTranslation('history', settings.language)}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  История улучшенных промптов
                </p>
              </div>
            </div>
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 transition-all duration-200 hover:shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>{getTranslation('clearAllHistory', settings.language)}</span>
              </button>
            )}
          </div>

          {/* Pro Upgrade Banner */}
          {hasMoreHistory && (
            <div className="mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Ещё {history.length - maxFreeHistory} записей в полной истории
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Обновитесь до Pro, чтобы видеть все промпты и никогда не терять работу
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProModal(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 text-sm font-semibold whitespace-nowrap shadow-lg shadow-emerald-500/25"
                >
                  {getTranslation('upgradeToPro', settings.language)}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* History List */}
        {displayedHistory.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-6">
                <History className="w-12 h-12 opacity-50" />
              </div>
              <p className="text-xl font-medium mb-2">
                {getTranslation('noHistory', settings.language)}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
                Начните улучшать промпты, и здесь появится их история
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedHistory.map((item: PromptHistoryItem, index) => (
              <div
                key={item.id}
                className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 transition-all duration-200 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-600 ${
                  !isPro && index >= maxFreeHistory - 2 ? 'relative overflow-hidden' : ''
                }`}
              >
                {!isPro && index === maxFreeHistory - 1 && (
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-gray-800 rounded-xl pointer-events-none z-10" />
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {formatDate(new Date(item.timestamp))}
                    </div>
                    {!isPro && index >= maxFreeHistory - 2 && (
                      <div className="flex items-center space-x-1 px-2 py-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                        <Lock className="w-3 h-3" />
                        <span>Pro</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Original Text */}
                <div className="mb-4">
                  <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Исходный промпт:
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-900 dark:text-white leading-relaxed">
                      {item.originalText}
                    </p>
                  </div>
                </div>

                {/* Improved Text */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      {getTranslation('improvedPrompt', settings.language)}:
                    </div>
                    <button
                      onClick={() => handleCopy(item.improvedText, item.id)}
                      className="flex items-center space-x-1 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700 transition-all duration-200"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{getTranslation('copied', settings.language)}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>{getTranslation('copyButton', settings.language)}</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-lg">
                    <p className="text-sm text-gray-900 dark:text-white leading-relaxed">
                      {item.improvedText}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pro Subscription Modal */}
      <ProSubscription 
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
      />
    </div>
  );
};

export default HistoryTab;