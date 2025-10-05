import React from 'react';
import { X, Crown, Check, Zap } from 'lucide-react';
import { freemiumService } from '../services/freemium';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string; // Название функции которая заблокирована
  currentUsage?: number;
  limit?: number;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  feature,
  currentUsage,
  limit
}) => {
  if (!isOpen) return null;

  const handleUpgrade = () => {
    // Открываем Gumroad в новой вкладке
    window.open(freemiumService.getProPurchaseUrl(), '_blank');
    onClose();
  };

  const proFeatures = [
    'Безлимитные сохранения в избранное',
    'Безлимитный анализ изображений',
    'Безлимитная история промптов',
    'Отключение рекламы',
    'Приоритетная поддержка',
    'Ранний доступ к новым функциям'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Обновиться до Pro
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Разблокируйте все возможности
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Limit notification */}
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-300">
              <Zap className="w-5 h-5" />
              <span className="font-medium">Лимит достигнут</span>
            </div>
            <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
              {feature}: {currentUsage}/{limit}
            </p>
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              Обновитесь до Pro для получения безлимитного доступа
            </p>
          </div>

          {/* Pro features */}
          <div className="space-y-3 mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Что включено в Pro:
            </h4>
            <div className="space-y-2">
              {proFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-6 p-4 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border border-teal-200 dark:border-teal-800 rounded-xl text-center">
            <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">
              $9.99
            </div>
            <div className="text-sm text-teal-600 dark:text-teal-400">
              разовая покупка • навсегда
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              Позже
            </button>
            <button
              onClick={handleUpgrade}
              className="flex-1 px-4 py-2 bg-gradient-to-br from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Перейти на Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;