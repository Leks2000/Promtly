import React from 'react';
import { Settings, Sun, Moon, Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import { Theme, Language } from '../../types';

const SettingsTab: React.FC = () => {
  const { settings, setTheme, setLanguage } = useApp();

  const handleThemeChange = (theme: Theme) => {
    setTheme(theme);
  };

  const handleLanguageChange = (language: Language) => {
    setLanguage(language);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Settings className="w-6 h-6 text-primary-500" />
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {getTranslation('settings', settings.language)}
        </h1>
      </div>

      {/* Theme Setting */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {getTranslation('theme', settings.language)}
          </h3>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => handleThemeChange('light')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 flex-1 ${
              settings.theme === 'light'
                ? 'bg-primary-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span className="font-medium">
              {getTranslation('light', settings.language)}
            </span>
          </button>
          
          <button
            onClick={() => handleThemeChange('dark')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 flex-1 ${
              settings.theme === 'dark'
                ? 'bg-primary-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span className="font-medium">
              {getTranslation('dark', settings.language)}
            </span>
          </button>
        </div>
      </div>

      {/* Language Setting */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {getTranslation('language', settings.language)}
          </h3>
        </div>
        
        <div className="space-y-2">
          <button
            onClick={() => handleLanguageChange('en')}
            className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200 ${
              settings.language === 'en'
                ? 'bg-primary-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span className="font-medium">
              {getTranslation('english', settings.language)}
            </span>
            {settings.language === 'en' && (
              <div className="w-2 h-2 bg-white rounded-full" />
            )}
          </button>
          
          <button
            onClick={() => handleLanguageChange('ru')}
            className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200 ${
              settings.language === 'ru'
                ? 'bg-primary-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span className="font-medium">
              {getTranslation('russian', settings.language)}
            </span>
            {settings.language === 'ru' && (
              <div className="w-2 h-2 bg-white rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center space-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            AI Prompt Improver v1.0.0
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Built with React, TypeScript & Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;