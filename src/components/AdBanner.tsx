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
    <div className="w-20 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="p-3">
        {/* Рекламный блок */}
        <div className="flex flex-col items-center space-y-2">
          {adLoaded ? (
            // Google AdSense блок
            <ins
              className="adsbygoogle"
              style={{ display: 'block', width: '100%', minHeight: '80px' }}
              data-ad-client="ca-pub-XXXXXXXXXXXXXXXXX"
              data-ad-slot="XXXXXXXXXX"
              data-ad-format="vertical"
              data-full-width-responsive="true"
            ></ins>
          ) : (
            // Заглушка пока реклама не загрузилась
            <MockAd />
          )}
          
          {/* Информация о рекламе */}
          <div className="text-xs text-gray-400 dark:text-gray-500 text-center">
            Реклама
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
    <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-xl p-3 text-center">
      <div className="text-2xl mb-2">{currentAd.image}</div>
      <div className="text-xs font-medium text-gray-900 dark:text-white mb-1">
        {currentAd.title}
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        {currentAd.description}
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