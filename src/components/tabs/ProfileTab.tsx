import React from 'react';
import { User, LogOut, LogIn } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';

const ProfileTab: React.FC = () => {
  const { isLoggedIn, user, settings, loginWithGoogle, logout } = useApp();

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <User className="w-6 h-6 text-primary-500" />
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {getTranslation('profile', settings.language)}
        </h1>
      </div>

      {/* Profile Content */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-6">
        {!isLoggedIn ? (
          // Login State
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Sign in to your account
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connect your Google account to sync your prompts and preferences
              </p>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="flex items-center space-x-3 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group"
            >
              <div className="w-5 h-5 bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 rounded-sm flex items-center justify-center">
                <span className="text-white text-xs font-bold">G</span>
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                {getTranslation('loginWithGoogle', settings.language)}
              </span>
              <LogIn className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
            </button>
          </div>
        ) : (
          // Logged In State
          <div className="text-center space-y-4 w-full max-w-sm">
            <div className="relative">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=3b82f6&color=ffffff&size=128`}
                alt={user?.name}
                className="w-24 h-24 mx-auto rounded-full border-4 border-white dark:border-gray-700 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {getTranslation('welcome', settings.language)}, {user?.name}!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user?.email}
              </p>
            </div>

            {/* User Stats */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-500">
                  {/* This could be actual user stats */}
                  12
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Prompts Improved
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="space-y-2 w-full">
              <button className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200">
                Account Settings
              </button>
              
              <button className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200">
                Export Data
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center space-x-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>{getTranslation('logout', settings.language)}</span>
            </button>
          </div>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 leading-relaxed">
          Your data is stored locally and securely. We never share your personal information with third parties.
        </p>
      </div>
    </div>
  );
};

export default ProfileTab;