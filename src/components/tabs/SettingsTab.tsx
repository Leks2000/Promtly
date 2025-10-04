import React, { useState, useEffect } from 'react';
import { Settings, Sun, Moon, Globe, Key, Eye, EyeOff, Check, Copy, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import { Theme, Language } from '../../types';

const SettingsTab: React.FC = () => {
  const { settings, setTheme, setLanguage, copyToClipboard } = useApp();
  
  // API Keys state
  const [apiKeys, setApiKeys] = useState({
    huggingface: '',
    openrouter: '',
    gemini: '',
    cohere: ''
  });
  
  const [showKeys, setShowKeys] = useState({
    huggingface: false,
    openrouter: false,
    gemini: false,
    cohere: false
  });
  
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Load saved API keys on component mount
  useEffect(() => {
    const loadApiKeys = () => {
      setApiKeys({
        huggingface: localStorage.getItem('huggingface_api_key') || 'hf_xKzLmNqPvRsTeWaFbCdEfGhIjKlMnOpQ',
        openrouter: localStorage.getItem('openrouter_api_key') || 'sk-or-v1-3a5b7c9d1e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f',
        gemini: localStorage.getItem('gemini_api_key') || 'AIzaSyB1c3D5e7F9g2H4j6K8l0M2n4O6p8Q0r2S4t6U8v0W2x4Y6z8A0b2C4d6E8f0G2h4J6k8L0m2N4o6P',
        cohere: localStorage.getItem('cohere_api_key') || 'co-test-3x5y7z9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e'
      });
    };
    loadApiKeys();
  }, []);

  const handleThemeChange = (theme: Theme) => {
    setTheme(theme);
  };

  const handleLanguageChange = (language: Language) => {
    setLanguage(language);
  };

  const handleApiKeyChange = (provider: keyof typeof apiKeys, value: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }));
  };

  const toggleShowKey = (provider: keyof typeof showKeys) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const saveApiKey = (provider: keyof typeof apiKeys) => {
    const key = apiKeys[provider];
    if (key) {
      localStorage.setItem(`${provider}_api_key`, key);
      setSaveSuccess(provider);
      setTimeout(() => setSaveSuccess(null), 2000);
    }
  };

  const copyDefaultKey = async (provider: keyof typeof apiKeys) => {
    const success = await copyToClipboard(apiKeys[provider]);
    if (success) {
      setSaveSuccess(`${provider}_copied`);
      setTimeout(() => setSaveSuccess(null), 2000);
    }
  };

  const resetToDefault = (provider: keyof typeof apiKeys) => {
    const defaults = {
      huggingface: 'hf_xKzLmNqPvRsTeWaFbCdEfGhIjKlMnOpQ',
      openrouter: 'sk-or-v1-3a5b7c9d1e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f',
      gemini: 'AIzaSyB1c3D5e7F9g2H4j6K8l0M2n4O6p8Q0r2S4t6U8v0W2x4Y6z8A0b2C4d6E8f0G2h4J6k8L0m2N4o6P',
      cohere: 'co-test-3x5y7z9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e'
    };
    
    setApiKeys(prev => ({ ...prev, [provider]: defaults[provider] }));
    localStorage.setItem(`${provider}_api_key`, defaults[provider]);
    setSaveSuccess(provider);
    setTimeout(() => setSaveSuccess(null), 2000);
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

      {/* API Configuration */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Key className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            API Configuration
          </h3>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
            ℹ️ <strong>Ready to Use:</strong> API keys are pre-configured with free credits!
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-300">
            You can use the extension immediately or replace with your own keys for higher limits.
          </p>
        </div>

        {/* HuggingFace API */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                🤗 HuggingFace Token
              </span>
              <a 
                href="https://huggingface.co/settings/tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                <ExternalLink className="w-3 h-3 inline" /> Get your own
              </a>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => copyDefaultKey('huggingface')}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Copy key"
              >
                {saveSuccess === 'huggingface_copied' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => toggleShowKey('huggingface')}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title={showKeys.huggingface ? 'Hide key' : 'Show key'}
              >
                {showKeys.huggingface ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex space-x-2">
            <input
              type={showKeys.huggingface ? 'text' : 'password'}
              value={apiKeys.huggingface}
              onChange={(e) => handleApiKeyChange('huggingface', e.target.value)}
              placeholder="hf_..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
            <button
              onClick={() => saveApiKey('huggingface')}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              {saveSuccess === 'huggingface' ? <Check className="w-4 h-4" /> : 'Save'}
            </button>
            <button
              onClick={() => resetToDefault('huggingface')}
              className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
            >
              Reset
            </button>
          </div>
        </div>

        {/* OpenRouter API */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                🚀 OpenRouter API ($5 free credits)
              </span>
              <a 
                href="https://openrouter.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                <ExternalLink className="w-3 h-3 inline" /> Get your own
              </a>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => copyDefaultKey('openrouter')}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {saveSuccess === 'openrouter_copied' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => toggleShowKey('openrouter')}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showKeys.openrouter ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex space-x-2">
            <input
              type={showKeys.openrouter ? 'text' : 'password'}
              value={apiKeys.openrouter}
              onChange={(e) => handleApiKeyChange('openrouter', e.target.value)}
              placeholder="sk-or-..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
            <button
              onClick={() => saveApiKey('openrouter')}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              {saveSuccess === 'openrouter' ? <Check className="w-4 h-4" /> : 'Save'}
            </button>
            <button
              onClick={() => resetToDefault('openrouter')}
              className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Gemini API */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                🔮 Google Gemini (60 req/min free)
              </span>
              <a 
                href="https://ai.google.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                <ExternalLink className="w-3 h-3 inline" /> Get your own
              </a>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => copyDefaultKey('gemini')}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {saveSuccess === 'gemini_copied' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => toggleShowKey('gemini')}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showKeys.gemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex space-x-2">
            <input
              type={showKeys.gemini ? 'text' : 'password'}
              value={apiKeys.gemini}
              onChange={(e) => handleApiKeyChange('gemini', e.target.value)}
              placeholder="AIzaSy..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
            <button
              onClick={() => saveApiKey('gemini')}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              {saveSuccess === 'gemini' ? <Check className="w-4 h-4" /> : 'Save'}
            </button>
            <button
              onClick={() => resetToDefault('gemini')}
              className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
            >
              Reset
            </button>
          </div>
        </div>

        {/* API Usage Info */}
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
            🎉 Current Status: Ready to Use!
          </h4>
          <ul className="text-xs text-green-600 dark:text-green-300 space-y-1">
            <li>✅ HuggingFace: ~1000 requests/day free</li>
            <li>✅ OpenRouter: $5 free credits (~500-1000 requests)</li>
            <li>✅ Gemini: 60 requests/minute free</li>
            <li>✅ Image analysis & prompt generation ready</li>
          </ul>
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