import React, { useState } from 'react';
import { History, Copy, Trash2, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import { HistoryItem } from '../../types';

const HistoryTab: React.FC = () => {
  const { history, settings, copyToClipboard, clearHistory } = useApp();
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    <div className="flex flex-col h-full space-y-4 p-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <History className="w-6 h-6 text-indigo-500" />
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

      {/* History List */}
      <div className="flex-1 overflow-hidden">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <History className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">
              {getTranslation('noHistory', settings.language)}
            </p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto scrollbar-thin space-y-3">
            {history.map((item: HistoryItem) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(new Date(item.timestamp))}
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
    </div>
  );
};

export default HistoryTab;