import React, { useState } from 'react';
import { Settings, Sun, Moon, Globe, Crown, Shield, Key, LogIn } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import { Theme, Language } from '../../types';
import { authService } from '../../services/auth';
import ProSubscription from '../ProSubscription';

const SettingsTab: React.FC = () => {
  const { settings, setTheme, setLanguage, user, isLoggedIn, login } = useApp();
  const [showProModal, setShowProModal] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleThemeChange = (theme: Theme) => {
    setTheme(theme);
  };

  const handleLanguageChange = (language: Language) => {
    setLanguage(language);
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      if (authService.isChromeExtension()) {
        const user = await authService.signInWithGoogle();
        login(user);
      } else {
        await authService.loadGoogleAPI();
        const user = await authService.signInWithGoogleWeb();
        login(user);
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoggingIn(false);
    }
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

      {/* Authentication Section */}
      {!isLoggedIn && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Authentication
            </h3>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Sign in to unlock full features
                </h4>
                <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
                  Save your history, sync across devices, and access Pro features
                </p>
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isLoggingIn ? 'Signing in...' : getTranslation('loginWithGoogle', settings.language)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pro Subscription Section */}
      {isLoggedIn && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {getTranslation('subscriptions', settings.language)}
            </h3>
          </div>
          
          <div className={`border rounded-lg p-4 ${
            user?.isPro 
              ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800' 
              : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {user?.isPro ? (
                  <Crown className="w-6 h-6 text-yellow-500" />
                ) : (
                  <Crown className="w-6 h-6 text-gray-400" />
                )}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {user?.isPro ? getTranslation('proPlan', settings.language) : getTranslation('freePlan', settings.language)}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {user?.isPro 
                      ? getTranslation('unlimitedHistory', settings.language)
                      : getTranslation('historyLimit', settings.language)
                    }
                  </p>
                </div>
              </div>
              {!user?.isPro && (
                <button
                  onClick={() => setShowProModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-sm font-medium"
                >
                  {getTranslation('upgradeToPro', settings.language)}
                </button>
              )}
            </div>
            
            {user?.isPro && user.proExpiresAt && (
              <div className="mt-3 pt-3 border-t border-yellow-200 dark:border-yellow-800">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  Pro expires: {new Date(user.proExpiresAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center space-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            AI Prompt Improver v2.0.0
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Built with React, TypeScript & Tailwind CSS
          </p>
        </div>
      </div>

      {/* Pro Subscription Modal */}
      <ProSubscription 
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
      />
    </div>
  );
};

export default SettingsTab;