import React from 'react';
import { Zap, History, Settings, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TabType } from '../types';
import { getTranslation } from '../utils/translations';
import clsx from 'clsx';

const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab, settings } = useApp();

  const tabs = [
    { id: 'improve' as TabType, icon: Zap, labelKey: 'improve' as const },
    { id: 'history' as TabType, icon: History, labelKey: 'history' as const },
    { id: 'settings' as TabType, icon: Settings, labelKey: 'settings' as const },
    { id: 'profile' as TabType, icon: User, labelKey: 'profile' as const },
  ];

  return (
    <div className="flex flex-col w-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="flex flex-col items-center py-4 space-y-2">
        {/* Logo */}
        <div className="flex items-center justify-center w-10 h-10 bg-primary-500 rounded-lg mb-2">
          <Zap className="w-6 h-6 text-white" />
        </div>

        {/* Navigation Buttons */}
        <nav className="flex flex-col space-y-1">
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
                  'hover:scale-105 hover:shadow-lg',
                  {
                    'bg-primary-500 text-white shadow-lg': isActive,
                    'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200': !isActive,
                  }
                )}
              >
                <Icon className="w-5 h-5" />
                
                {/* Tooltip */}
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                  {getTranslation(tab.labelKey, settings.language)}
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-l-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;