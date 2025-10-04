import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const AdBanner: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const [isMinimized, setIsMinimized] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);

  // Показываем рекламу только если включена в настройках
  if (!settings.showAds) return null;

  useEffect(() => {
    // Загружаем Google Ads скрипт
    loadGoogleAds();
  }, []);

  const loadGoogleAds = async () => {
    try {
      // Проверяем, не загружен ли уже скрипт
      if (window.adsbygoogle) {
        initializeAd();
        return;
      }

      // Создаем скрипт для Google Ads
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      
      // Ваш publisher ID от Google AdSense
      script.setAttribute('data-ad-client', 'ca-pub-XXXXXXXXXXXXXXXXX');
      
      script.onload = () => {
        setAdLoaded(true);
        initializeAd();
      };
      
      script.onerror = () => {
        console.warn('Google Ads не удалось загрузить');
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error('Ошибка загрузки рекламы:', error);
    }
  };

  const initializeAd = () => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('Ошибка инициализации рекламы:', error);
    }
  };

  const hideAds = () => {
    updateSettings({ showAds: false });
  };

  return (
    <div className={`bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      isMinimized ? 'h-8' : 'h-20'
    }`}>
      <div className="flex items-center justify-between h-full px-4">
        {/* Кнопки управления */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title={isMinimized ? 'Развернуть рекламу' : 'Свернуть рекламу'}
          >
            {isMinimized ? '↑' : '↓'}
          </button>
          
          <button
            onClick={hideAds}
            className="text-xs text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
            title="Скрыть рекламу"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Рекламный блок */}
        {!isMinimized && (
          <div className="flex-1 flex items-center justify-center h-full">
            {adLoaded ? (
              // Google AdSense блок
              <ins
                className="adsbygoogle"
                style={{ display: 'block', width: '100%', height: '60px' }}
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXXX"
                data-ad-slot="XXXXXXXXXX"
                data-ad-format="horizontal"
                data-full-width-responsive="true"
              ></ins>
            ) : (
              // Заглушка пока реклама не загрузилась
              <MockAd />
            )}
          </div>
        )}

        {/* Информация о рекламе */}
        <div className="text-xs text-gray-400 dark:text-gray-500">
          {isMinimized ? 'Реклама' : 'Поддержите разработку'}
        </div>
      </div>
    </div>
  );
};

// Мок-реклама для демонстрации
const MockAd: React.FC = () => {
  const mockAds = [
    {
      title: 'AI Writing Assistant',
      description: 'Улучшите свои тексты с помощью ИИ',
      url: '#',
      image: '🤖'
    },
    {
      title: 'Prompt Engineering Course',
      description: 'Изучите искусство создания промптов',
      url: '#',
      image: '📚'
    },
    {
      title: 'Chrome Extensions Pro',
      description: 'Расширения для продуктивности',
      url: '#',
      image: '⚡'
    }
  ];

  const [currentAd] = useState(mockAds[Math.floor(Math.random() * mockAds.length)]);

  return (
    <div className="flex items-center space-x-3 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-lg p-3 max-w-sm">
      <div className="text-2xl">{currentAd.image}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {currentAd.title}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
          {currentAd.description}
        </div>
      </div>
      <div className="text-xs text-blue-500 font-medium">
        Ad
      </div>
    </div>
  );
};

// Расширяем интерфейс Window для TypeScript
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default AdBanner;