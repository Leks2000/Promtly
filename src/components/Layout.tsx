import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import TabNavigation from './TabNavigation';
import MainContent from './MainContent';
import AdBanner from './AdBanner';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import IntroAnimation from './IntroAnimation';

const Layout: React.FC = () => {
  const { isLoading, error } = useApp();
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // Проверяем, показывали ли мы интро раньше
    const hasSeenIntro = localStorage.getItem('promptly-intro-seen');
    if (hasSeenIntro) {
      setShowIntro(false);
    }
  }, []);

  const handleIntroComplete = () => {
    localStorage.setItem('promptly-intro-seen', 'true');
    setShowIntro(false);
  };

  if (showIntro) {
    return <IntroAnimation onComplete={handleIntroComplete} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Основной контент */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <MainContent />
      </div>
      
      {/* Sidebar справа */}
      <div className="flex flex-col w-20 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
        {/* Навигация */}
        <div className="flex-1">
          <TabNavigation />
        </div>
      </div>

      {/* Реклама внизу на всю ширину */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <AdBanner />
      </div>

      {/* Загрузка и ошибки */}
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
    </div>
  );
};

export default Layout;