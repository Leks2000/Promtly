import React from 'react';
import { useApp } from '../context/AppContext';
import TabNavigation from './TabNavigation';
import MainContent from './MainContent';
import AdBanner from './AdBanner';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const Layout: React.FC = () => {
  const { isLoading, error } = useApp();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Контентная область */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <MainContent />
        
        {/* Реклама внизу */}
        <AdBanner />
      </div>
      
      {/* Навигация справа - всегда видимая */}
      <TabNavigation />

      {/* Загрузка и ошибки */}
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
    </div>
  );
};

export default Layout;