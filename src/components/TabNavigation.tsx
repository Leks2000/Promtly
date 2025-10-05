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
    { id: 'profile' as TabType, icon: User, labelKey: 'profile' as const },
    { id: 'favorites' as TabType, icon: Heart, labelKey: 'favorites' as const },
    { id: 'history' as TabType, icon: History, labelKey: 'history' as const },
    { id: 'settings' as TabType, icon: Settings, labelKey: 'settings' as const },
    { id: 'improve' as TabType, icon: Sparkles, labelKey: 'improve' as const },
    { id: 'analyze' as TabType, icon: Image, labelKey: 'analyze' as const },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex flex-col w-20 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-colors duration-200">
      {/* Логотип */}
      <div className="flex items-center justify-center py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl shadow-lg">
          <Zap className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Основная навигация */}
      <nav className="flex flex-col items-center space-y-2 flex-1 py-4 px-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              title={getTranslation(tab.labelKey, settings.language)}
              className={clsx(
                'group relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-200',
                {
                  'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/25 scale-105': isActive,
                  'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 hover:scale-105': !isActive,
                }
              )}
            >
              <Icon className="w-6 h-6" />
              
              {/* Tooltip */}
              <div className="absolute right-full mr-3 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10 shadow-lg">
                {getTranslation(tab.labelKey, settings.language)}
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900 dark:border-l-gray-700"></div>
              </div>

              {/* Активный индикатор */}
              {isActive && (
                <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-teal-500 to-emerald-600 rounded-r-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Нижняя часть - аватар и выход */}
      <div className="flex flex-col items-center py-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
        {isLoggedIn && user && (
          <>
            {/* Аватар пользователя */}
            <button
              onClick={() => setCurrentTab('profile')}
              className="relative group"
              title={user.name}
            >
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=ffffff&size=48`}
                alt={user.name}
                className="w-12 h-12 rounded-full border-3 border-gray-200 dark:border-gray-600 hover:border-teal-500 transition-all duration-200 hover:scale-110"
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
              
              {/* Tooltip */}
              <div className="absolute right-full mr-3 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10 shadow-lg">
                {user.name}
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900 dark:border-l-gray-700"></div>
              </div>
            </button>

            {/* Кнопка выхода */}
            <button
              onClick={handleLogout}
              title={getTranslation('logout', settings.language)}
              className="group flex items-center justify-center w-12 h-12 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 hover:scale-110"
            >
              <LogOut className="w-5 h-5" />
              
              {/* Tooltip */}
              <div className="absolute right-full mr-3 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10 shadow-lg">
                {getTranslation('logout', settings.language)}
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900 dark:border-l-gray-700"></div>
              </div>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TabNavigation;