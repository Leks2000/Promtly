import React from 'react';
import { 
  Sparkles, 
  Image,
  History, 
  Heart, 
  Settings, 
  User,
  LogOut,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TabType } from '../types';
import { getTranslation } from '../utils/translations';
import clsx from 'clsx';

const TabNavigation: React.FC = () => {
  const { currentTab, setCurrentTab, settings, isLoggedIn, user, logout } = useApp();

  const tabs = [
    { id: 'improve' as TabType, icon: Sparkles, labelKey: 'improve' as const },
    { id: 'analyze' as TabType, icon: Image, labelKey: 'analyze' as const },
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
    <div className="flex flex-col w-16 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-colors duration-200">
      {/* Верхняя часть - логотип */}
      <div className="flex flex-col items-center py-3">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4 shadow-lg">
          <Zap className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Основная навигация */}
      <nav className="flex flex-col items-center space-y-1 flex-1 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              title={getTranslation(tab.labelKey, settings.language)}
              className={clsx(
                'group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200',
                'hover:scale-105 hover:shadow-md',
                {
                  'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25': isActive,
                  'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200': !isActive,
                }
              )}
            >
              <Icon className="w-5 h-5" />
              
              {/* Tooltip */}
              <div className="absolute right-full mr-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                {getTranslation(tab.labelKey, settings.language)}
              </div>

              {/* Активный индикатор слева */}
              {isActive && (
                <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-r-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Нижняя часть - профиль и выход */}
      <div className="flex flex-col items-center py-3 space-y-1">
        {isLoggedIn && user && (
          <>
            {/* Аватар пользователя */}
            <button
              onClick={() => setCurrentTab('profile')}
              className="relative group"
              title={user.name}
            >
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=ffffff&size=40`}
                alt={user.name}
                className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 transition-all duration-200"
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
              
              {/* Tooltip */}
              <div className="absolute right-full mr-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                {user.name}
              </div>
            </button>

            {/* Кнопка выхода */}
            <button
              onClick={handleLogout}
              title={getTranslation('logout', settings.language)}
              className="group flex items-center justify-center w-10 h-10 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              
              {/* Tooltip */}
              <div className="absolute right-full mr-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                {getTranslation('logout', settings.language)}
              </div>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TabNavigation;