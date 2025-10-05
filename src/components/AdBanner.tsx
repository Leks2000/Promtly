import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const AdBanner: React.FC = () => {
  const { settings, user, getUserSubscriptionType } = useApp();
  const [adLoaded, setAdLoaded] = useState(false);

  // Не показываем рекламу для Pro пользователей или если она отключена
  const subscriptionType = getUserSubscriptionType();
  const shouldShowAds = subscriptionType === 'free' && settings.showAds;
  
  if (!shouldShowAds) return null;

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

  return (
    <div className="w-full h-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="flex items-center justify-center h-full px-4">
        {/* Рекламный блок */}
        <div className="flex items-center justify-between w-full max-w-md">
          {adLoaded ? (
            // Google AdSense блок
            <ins
              className="adsbygoogle"
              style={{ display: 'block', width: '100%', height: '50px' }}
              data-ad-client="ca-pub-XXXXXXXXXXXXXXXXX"
              data-ad-slot="XXXXXXXXXX"
              data-ad-format="horizontal"
              data-full-width-responsive="true"
            ></ins>
          ) : (
            // Заглушка пока реклама не загрузилась
            <MockAd />
          )}
          
          {/* Информация о рекламе */}
          <div className="text-xs text-gray-400 dark:text-gray-500 ml-2">
            Ad
          </div>
        </div>
      </div>
    </div>
  );
};

// Мок-реклама для демонстрации
const MockAd: React.FC = () => {
  const mockAds = [
    {
      title: 'AI Tools',
      description: 'Инструменты ИИ',
      url: '#',
      image: '🤖'
    },
    {
      title: 'Pro Course',
      description: 'Курс промптов',
      url: '#',
      image: '📚'
    },
    {
      title: 'Extensions',
      description: 'Расширения',
      url: '#',
      image: '⚡'
    }
  ];

  const [currentAd] = useState(mockAds[Math.floor(Math.random() * mockAds.length)]);

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg px-4 py-2 flex items-center space-x-3 flex-1">
      <div className="text-lg">{currentAd.image}</div>
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {currentAd.title}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {currentAd.description}
        </div>
      </div>
      <div className="text-xs text-indigo-500 font-medium">
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