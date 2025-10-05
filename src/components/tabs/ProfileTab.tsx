import React from 'react';
import { User, LogOut, LogIn, Crown, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';

const ProfileTab: React.FC = () => {
  const { isLoggedIn, user, settings, loginWithGoogle, logout, getUserSubscriptionType, usageStats, freemiumLimits } = useApp();
  const subscriptionType = getUserSubscriptionType();

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {getTranslation('profile', settings.language)}
            </h1>
          </div>
          {subscriptionType === 'pro' && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full text-white text-sm font-medium">
              <Crown className="w-4 h-4" />
              <span>Pro</span>
            </div>
          )}
        </div>

        {!isLoggedIn ? (
          // Login State
          <div className="text-center space-y-6 py-12">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center">
              <User className="w-16 h-16 text-teal-600 dark:text-teal-400" />
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Войти в аккаунт
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                Подключите Google аккаунт для синхронизации промптов и настроек
              </p>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="flex items-center space-x-3 px-8 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:shadow-lg hover:scale-105 group mx-auto"
            >
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">G</span>
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                {getTranslation('loginWithGoogle', settings.language)}
              </span>
              <LogIn className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
            </button>
          </div>
        ) : (
          // Logged In State
          <div className="space-y-6">
            {/* User Info Card */}
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-2xl p-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=3b82f6&color=ffffff&size=80`}
                    alt={user?.name}
                    className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-700 shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-3 border-white dark:border-gray-800 rounded-full"></div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {user?.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {user?.email}
                  </p>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      subscriptionType === 'pro'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {subscriptionType === 'pro' ? (
                        <>
                          <Crown className="w-4 h-4 mr-1" />
                          Pro Plan
                        </>
                      ) : (
                        'Free Plan'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    {usageStats.favoritesUsed}
                    {freemiumLimits.favorites > 0 && (
                      <span className="text-sm text-gray-500">/{freemiumLimits.favorites}</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Избранных промптов
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {usageStats.imageAnalysisUsed}
                    {freemiumLimits.imageAnalysis > 0 && (
                      <span className="text-sm text-gray-500">/{freemiumLimits.imageAnalysis}</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Анализов изображений
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {usageStats.historyItemsUsed}
                    {freemiumLimits.historyItems > 0 && (
                      <span className="text-sm text-gray-500">/{freemiumLimits.historyItems}</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Записей в истории
                  </div>
                </div>
              </div>
            </div>

            {/* Upgrade to Pro */}
            {subscriptionType === 'free' && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-900 dark:text-amber-300">
                      Обновиться до Pro
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Безлимитные возможности и отключение рекламы
                    </p>
                  </div>
                  <button
                    onClick={() => window.open('https://gumroad.com/l/ai-prompt-improver-pro', '_blank')}
                    className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105"
                  >
                    Обновить
                  </button>
                </div>
              </div>
            )}

            {/* Account Actions */}
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200">
                <span className="font-medium text-gray-700 dark:text-gray-300">Экспорт данных</span>
                <Star className="w-5 h-5 text-gray-400" />
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 p-4 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">{getTranslation('logout', settings.language)}</span>
              </button>
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 leading-relaxed">
            Ваши данные хранятся локально и безопасно. Мы никогда не передаем личную информацию третьим лицам.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;