import React from 'react';
import { useApp } from '../context/AppContext';
import ImproveTab from './tabs/ImproveTab';
import ImageAnalysisTab from './tabs/ImageAnalysisTab';
import HistoryTab from './tabs/HistoryTab';
import FavoritesTab from './tabs/FavoritesTab';
import SettingsTab from './tabs/SettingsTab';
import ProfileTab from './tabs/ProfileTab';

const MainContent: React.FC = () => {
  const { currentTab } = useApp();

  const renderTab = () => {
    switch (currentTab) {
      case 'improve':
        return <ImproveTab />;
      case 'image-analysis':
        return <ImageAnalysisTab />;
      case 'history':
        return <HistoryTab />;
      case 'favorites':
        return <FavoritesTab />;
      case 'settings':
        return <SettingsTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <ImproveTab />;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <div className="h-full animate-fade-in">
          {renderTab()}
        </div>
      </div>
    </div>
  );
};

export default MainContent;