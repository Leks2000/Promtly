import React from 'react';
import { 
  Sparkles, 
  History, 
  Heart, 
  Settings, 
  User,
  LogOut,
  Zap,
  Image
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TabType } from '../types';
import { getTranslation } from '../utils/translations';
import clsx from 'clsx';

const TabNavigation: React.FC = () => {
  const { currentTab, setCurrentTab, settings, isLoggedIn, user, logout } = useApp();

  const tabs = [
    { id: 'improve' as TabType, icon: Sparkles, labelKey: 'improve' as const },
    { id: 'image-analysis' as TabType, icon: Image, labelKey: 'imageAnalysis' as const },
    { id: 'history' as TabType, icon: History, labelKey: 'history' as const },
    { id: 'favorites' as TabType, icon: Heart, labelKey: 'favorites' as const },
    { id: 'settings' as TabType, icon: Settings, labelKey: 'settings' as const },
    { id: 'profile' as TabType, icon: User, labelKey: 'profile' as const },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex flex-col w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg">
      {/* Верхняя часть - логотип */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md mr-3">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">AI Prompt</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Improver</p>
        </div>
      </div>

      {/* Основная навигация */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={clsx(
                'w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-left group',
                {
                  'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800': isActive,
                  'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200': !isActive,
                }
              )}
            >
              <Icon className={clsx('w-5 h-5 mr-3', {
                'text-emerald-600 dark:text-emerald-400': isActive,
                'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300': !isActive
              })} />
              <span className="font-medium">
                {getTranslation(tab.labelKey, settings.language)}
              </span>
              
              {/* Активный индикатор справа */}
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Нижняя часть - профиль и выход */}
      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
        {isLoggedIn && user ? (
          <div className="space-y-3">
            {/* Профиль пользователя */}
            <button
              onClick={() => setCurrentTab('profile')}
              className="w-full flex items-center px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=10b981&color=ffffff&size=40`}
                alt={user.name}
                className="w-10 h-10 rounded-full border-2 border-emerald-200 dark:border-emerald-700"
              />
              <div className="ml-3 text-left flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full ml-2" />
            </button>

            {/* Кнопка выхода */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
            >
              <LogOut className="w-4 h-4 mr-3" />
              <span className="text-sm font-medium">{getTranslation('logout', settings.language)}</span>
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Войдите для доступа ко всем функциям
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabNavigation;