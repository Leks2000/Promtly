import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'logo' | 'name' | 'move' | 'fade'>('logo');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Показываем логотип (500мс)
    timers.push(setTimeout(() => {
      setStage('name');
    }, 500));

    // Показываем название (1000мс)
    timers.push(setTimeout(() => {
      setStage('move');
    }, 1500));

    // Перемещаем вниз (300мс)
    timers.push(setTimeout(() => {
      setStage('fade');
    }, 1800));

    // Исчезаем (300мс)
    timers.push(setTimeout(() => {
      setIsVisible(false);
    }, 2100));

    // Завершаем анимацию
    timers.push(setTimeout(() => {
      onComplete();
    }, 2400));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-800">
      <div 
        className={`flex flex-col items-center transition-all duration-300 ease-out ${
          stage === 'logo' ? 'opacity-0 scale-75 translate-y-4' :
          stage === 'name' ? 'opacity-100 scale-100 translate-y-0' :
          stage === 'move' ? 'opacity-100 scale-90 translate-y-8' :
          'opacity-0 scale-75 translate-y-12'
        }`}
      >
        {/* Логотип */}
        <div 
          className={`flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl mb-4 shadow-2xl transform transition-all duration-500 ${
            stage === 'logo' ? 'scale-0 rotate-180' : 'scale-100 rotate-0'
          }`}
        >
          <Zap className="w-8 h-8 text-white" />
        </div>

        {/* Название */}
        <h1 
          className={`text-2xl font-bold text-gray-900 dark:text-white transition-all duration-500 ${
            stage === 'name' || stage === 'move' || stage === 'fade' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Promptly
        </h1>

        {/* Подзаголовок */}
        <p 
          className={`text-sm text-gray-600 dark:text-gray-400 mt-2 transition-all duration-500 delay-200 ${
            stage === 'name' || stage === 'move' || stage === 'fade' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Улучшите ваши промпты с ИИ
        </p>
      </div>

      {/* Пульсирующие точки загрузки */}
      <div className="absolute bottom-20 flex space-x-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default IntroAnimation;