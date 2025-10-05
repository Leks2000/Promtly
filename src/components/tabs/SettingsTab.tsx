import React, { useState } from 'react';
import { Settings, Sun, Moon, Globe, Crown, CreditCard } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import { Theme, Language } from '../../types';

const SettingsTab: React.FC = () => {
  const { settings, setTheme, setLanguage } = useApp();
  
  const handleGumroadPurchase = (plan: 'monthly' | 'annual') => {
    const urls = {
      monthly: 'https://gumroad.com/l/ai-prompt-improver-monthly',
      annual: 'https://gumroad.com/l/ai-prompt-improver-annual'
    };
    window.open(urls[plan], '_blank');
  };

  const handleThemeChange = (theme: Theme) => {
    setTheme(theme);
  };

  const handleLanguageChange = (language: Language) => {
    setLanguage(language);
  };

  return (
    <div className="flex flex-col h-full space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Settings className="w-6 h-6 text-indigo-500" />
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
                ? 'bg-indigo-500 text-white shadow-lg'
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
                ? 'bg-indigo-500 text-white shadow-lg'
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
                ? 'bg-indigo-500 text-white shadow-lg'
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
                ? 'bg-indigo-500 text-white shadow-lg'
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

      {/* Subscription Plans */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Crown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Subscription Plans
          </h3>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {/* Pro Monthly */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Pro Monthly
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Perfect for regular users
                </p>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                  $9.99<span className="text-sm text-gray-500">/month</span>
                </div>
              </div>
              <div className="text-indigo-500">
                <Crown className="w-8 h-8" />
              </div>
            </div>
            
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></div>
                Unlimited AI requests
              </li>
              <li className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></div>
                Priority support
              </li>
              <li className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></div>
                No ads
              </li>
            </ul>
            
            <button
              onClick={() => handleGumroadPurchase('monthly')}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all duration-200 font-medium"
            >
              <CreditCard className="w-4 h-4" />
              <span>Subscribe via Gumroad</span>
            </button>
          </div>

          {/* Pro Annual */}
          <div className="relative bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="absolute top-4 right-4 bg-indigo-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              Save 33%
            </div>
            
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Pro Annual
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Best value for power users
                </p>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                  $79.99<span className="text-sm text-gray-500">/year</span>
                </div>
                <div className="text-xs text-gray-500 line-through">
                  $119.88 if paid monthly
                </div>
              </div>
              <div className="text-indigo-500">
                <Crown className="w-8 h-8" />
              </div>
            </div>
            
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></div>
                Unlimited AI requests
              </li>
              <li className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></div>
                Priority support
              </li>
              <li className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></div>
                No ads
              </li>
              <li className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></div>
                Early access to new features
              </li>
            </ul>
            
            <button
              onClick={() => handleGumroadPurchase('annual')}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all duration-200 font-medium"
            >
              <CreditCard className="w-4 h-4" />
              <span>Subscribe via Gumroad</span>
            </button>
          </div>
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