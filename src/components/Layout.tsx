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
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-800 transition-colors duration-200">
      {/* Основной контент */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <MainContent />
      </div>
      
      {/* Sidebar справа */}
      <div className="flex flex-col">
        {/* Навигация */}
        <TabNavigation />
        
        {/* Реклама внизу */}
        <AdBanner />
      </div>

      {/* Загрузка и ошибки */}
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
    </div>
  );
};

export default Layout;