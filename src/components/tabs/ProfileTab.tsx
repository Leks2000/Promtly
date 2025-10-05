import React from 'react';
import { User, LogOut, LogIn } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';

const ProfileTab: React.FC = () => {
  const { isLoggedIn, user, settings, loginUser, logoutUser } = useApp();

  const handleGoogleLogin = () => {
    // Mock Google login - replace with actual Google OAuth implementation
    const mockUser = {
      id: 'user_123',
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      avatar: `https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=ffffff&size=128`,
    };
    loginUser(mockUser);
  };

  const handleLogout = () => {
    logoutUser();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Main Content Container */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {getTranslation('profile', settings.language)}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Управление профилем и настройками
              </p>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {!isLoggedIn ? (
            // Login State
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center space-y-6 max-w-md w-full">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Войдите в аккаунт
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Подключите Google аккаунт для синхронизации промптов и настроек
                </p>
              </div>

              <button
                onClick={handleGoogleLogin}
                className="flex items-center space-x-3 w-full px-6 py-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 hover:shadow-lg group"
              >
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 rounded-md flex items-center justify-center shadow-sm">
                  <span className="text-white text-sm font-bold">G</span>
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                  {getTranslation('loginWithGoogle', settings.language)}
                </span>
                <LogIn className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-emerald-500 ml-auto" />
              </button>

              {/* Features Preview */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  После входа вам будет доступно:
                </p>
                <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>Сохранение истории промптов</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>Коллекция избранных промптов</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>Анализ изображений с помощью ИИ</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Logged In State
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center space-y-6 max-w-md w-full">
              <div className="relative">
                <div className="w-24 h-24 mx-auto rounded-full p-1 bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=10b981&color=ffffff&size=128`}
                    alt={user?.name}
                    className="w-full h-full rounded-full border-2 border-white dark:border-gray-800"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {getTranslation('welcome', settings.language)}, {user?.name}!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>

              {/* User Stats */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                    {/* This could be actual user stats */}
                    12
                  </div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Промптов улучшено
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-800">
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">5</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Избранные</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">3</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Поделились</div>
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="space-y-3 w-full">
                <button className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 border border-gray-200 dark:border-gray-600 font-medium">
                  Настройки аккаунта
                </button>
                
                <button className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 border border-gray-200 dark:border-gray-600 font-medium">
                  Экспорт данных
                </button>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center justify-center space-x-2 w-full px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 border border-red-200 dark:border-red-800 font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>{getTranslation('logout', settings.language)}</span>
              </button>
            </div>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              🔒 Конфиденциальность и безопасность
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Ваши данные хранятся локально и безопасно. Мы никогда не передаём вашу личную информацию третьим лицам.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;