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
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <History className="w-6 h-6 text-primary-500" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {getTranslation('history', settings.language)}
          </h1>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
            <span>{getTranslation('clearAllHistory', settings.language)}</span>
          </button>
        )}
      </div>

      {/* Pro Upgrade Banner */}
      {hasMoreHistory && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {history.length - maxFreeHistory} more items in full history
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Upgrade to Pro to see all your prompts and never lose your work
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowProModal(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-sm font-medium whitespace-nowrap"
            >
              {getTranslation('upgradeToPro', settings.language)}
            </button>
          </div>
        </div>
      )}

      {/* History List */}
      <div className="flex-1 overflow-hidden">
        {displayedHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <History className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">
              {getTranslation('noHistory', settings.language)}
            </p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto scrollbar-thin space-y-3">
            {displayedHistory.map((item: PromptHistoryItem, index) => (
              <div
                key={item.id}
                className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                  !isPro && index >= maxFreeHistory - 2 ? 'relative' : ''
                }`}
              >
                {!isPro && index === maxFreeHistory - 1 && (
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-100 dark:to-gray-800 rounded-lg pointer-events-none" />
                )}
                
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(new Date(item.timestamp))}
                    </div>
                    {!isPro && index >= maxFreeHistory - 2 && (
                      <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
                        <Lock className="w-3 h-3" />
                        <span>Pro</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Original Text */}
                <div className="mb-3">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Original:
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-white">
                    {item.originalText}
                  </div>
                </div>

                {/* Improved Text */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {getTranslation('improvedPrompt', settings.language)}:
                    </div>
                    <button
                      onClick={() => handleCopy(item.improvedText, item.id)}
                      className="flex items-center space-x-1 px-2 py-1 text-xs text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-all duration-200"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>{getTranslation('copied', settings.language)}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>{getTranslation('copyButton', settings.language)}</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded text-sm text-gray-900 dark:text-white">
                    {item.improvedText}
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