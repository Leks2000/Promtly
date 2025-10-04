import { User } from '../types';
import { databaseService } from './database';

// Google OAuth API types
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
        oauth2: {
          initTokenClient: (config: any) => any;
        };
      };
    };
  }
}

export interface GoogleAuthResponse {
  access_token: string;
  id_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    picture: string;
  };
}

export class AuthService {
  private clientId = '1019228620951-2lvctsnreemkva94hdmgd661cg1mg24l.apps.googleusercontent.com';
  private redirectUri = chrome.identity.getRedirectURL();

  // Chrome Extension OAuth
  async signInWithGoogle(): Promise<User> {
    try {
      if (!chrome?.identity) {
        console.log(chrome.identity.getRedirectURL());
        throw new Error('Chrome Identity API недоступен');
      }

      console.log(chrome.identity.getRedirectURL());

      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('access_type', 'online');
      authUrl.searchParams.set('client_id', this.clientId);
      authUrl.searchParams.set('response_type', 'token id_token');
      authUrl.searchParams.set('redirect_uri', this.redirectUri);
      authUrl.searchParams.set('scope', 'openid profile email');
      authUrl.searchParams.set('prompt', 'consent');
      authUrl.searchParams.set('nonce', this.generateNonce());

      // Запускаем OAuth flow
      const responseUrl = await new Promise<string>((resolve, reject) => {
        chrome.identity.launchWebAuthFlow({
          url: authUrl.toString(),
          interactive: true
        }, (responseUrl) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (responseUrl) {
            resolve(responseUrl);
          } else {
            reject(new Error('Авторизация отменена'));
          }
        });
      });

      // Парсим ответ
      const urlParams = new URL(responseUrl);
      const fragment = new URLSearchParams(urlParams.hash.substring(1));
      
      const accessToken = fragment.get('access_token');
      const idToken = fragment.get('id_token');

      if (!accessToken || !idToken) {
        throw new Error('Не удалось получить токены авторизации');
      }

      // Получаем информацию о пользователе
      const userInfo = await this.getUserInfo(accessToken);
      
      // Проверяем, существует ли пользователь в БД
      let user = await databaseService.getUserByGoogleId(userInfo.id);
      
      if (!user) {
        // Создаем нового пользователя
        user = await databaseService.createUser({
          googleId: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          avatar: userInfo.picture
        });
      } else {
        // Обновляем время последнего входа
        await databaseService.updateUserLastLogin(user.id);
      }

      // Сохраняем токены
      await this.saveTokens(accessToken, idToken);
      
      return user;
    } catch (error) {
      console.error('Google Auth error:', error);
      throw new Error(`Ошибка авторизации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  // Альтернативный метод для обычной веб-авторизации (fallback)
  async signInWithGoogleWeb(): Promise<User> {
    try {
      // Используем Google Identity Services для веб-приложений
      const response = await new Promise<GoogleAuthResponse>((resolve, reject) => {
        if (typeof window.google === 'undefined') {
          reject(new Error('Google Identity Services не загружен'));
          return;
        }

        window.google.accounts.oauth2.initTokenClient({
          client_id: this.clientId,
          scope: 'openid profile email',
          callback: async (response: any) => {
            if (response.access_token) {
              try {
                const userInfo = await this.getUserInfo(response.access_token);
                resolve({
                  access_token: response.access_token,
                  id_token: response.id_token || '',
                  user: userInfo
                });
              } catch (error) {
                reject(error);
              }
            } else {
              reject(new Error('Не удалось получить access token'));
            }
          }
        }).requestAccessToken();
      });

      // Обрабатываем пользователя аналогично Chrome Extension flow
      let user = await databaseService.getUserByGoogleId(response.user.id);
      
      if (!user) {
        user = await databaseService.createUser({
          googleId: response.user.id,
          name: response.user.name,
          email: response.user.email,
          avatar: response.user.picture
        });
      } else {
        await databaseService.updateUserLastLogin(user.id);
      }

      await this.saveTokens(response.access_token, response.id_token);
      
      return user;
    } catch (error) {
      console.error('Google Web Auth error:', error);
      throw new Error(`Ошибка веб-авторизации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  // Получение информации о пользователе через Google API
  private async getUserInfo(accessToken: string): Promise<{
    id: string;
    name: string;
    email: string;
    picture: string;
  }> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Не удалось получить информацию о пользователе');
    }

    const data = await response.json();
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      picture: data.picture
    };
  }

  // Сохранение токенов
  private async saveTokens(accessToken: string, idToken: string): Promise<void> {
    try {
      if (chrome?.storage) {
        await chrome.storage.local.set({
          'google_access_token': accessToken,
          'google_id_token': idToken,
          'auth_timestamp': Date.now()
        });
      } else {
        // Fallback для локального хранения
        localStorage.setItem('google_access_token', accessToken);
        localStorage.setItem('google_id_token', idToken);
        localStorage.setItem('auth_timestamp', Date.now().toString());
      }
    } catch (error) {
      console.error('Error saving tokens:', error);
    }
  }

  // Получение сохраненных токенов
  async getStoredTokens(): Promise<{
    accessToken: string | null;
    idToken: string | null;
    timestamp: number | null;
  }> {
    try {
      if (chrome?.storage) {
        const result = await chrome.storage.local.get([
          'google_access_token',
          'google_id_token',
          'auth_timestamp'
        ]);
        
        return {
          accessToken: result.google_access_token || null,
          idToken: result.google_id_token || null,
          timestamp: result.auth_timestamp || null
        };
      } else {
        // Fallback для локального хранения
        return {
          accessToken: localStorage.getItem('google_access_token'),
          idToken: localStorage.getItem('google_id_token'),
          timestamp: parseInt(localStorage.getItem('auth_timestamp') || '0') || null
        };
      }
    } catch (error) {
      console.error('Error getting stored tokens:', error);
      return {
        accessToken: null,
        idToken: null,
        timestamp: null
      };
    }
  }

  // Проверка валидности токенов
  async isAuthenticated(): Promise<boolean> {
    const { accessToken, timestamp } = await this.getStoredTokens();
    
    if (!accessToken || !timestamp) {
      return false;
    }

    // Токены действительны 1 час
    const tokenAge = Date.now() - timestamp;
    return tokenAge < 3600000; // 1 час в миллисекундах
  }

  // Выход из системы
  async signOut(): Promise<void> {
    try {
      // Очищаем сохраненные токены
      if (chrome?.storage) {
        await chrome.storage.local.remove([
          'google_access_token',
          'google_id_token',
          'auth_timestamp'
        ]);
      } else {
        localStorage.removeItem('google_access_token');
        localStorage.removeItem('google_id_token');
        localStorage.removeItem('auth_timestamp');
      }

      // Отзываем токен в Google (опционально)
      const { accessToken } = await this.getStoredTokens();
      if (accessToken) {
        try {
          await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
            method: 'POST'
          });
        } catch (error) {
          console.warn('Failed to revoke token:', error);
        }
      }
    } catch (error) {
      console.error('Signout error:', error);
      throw new Error('Ошибка выхода из системы');
    }
  }

  // Автоматический вход при запуске
  async autoSignIn(): Promise<User | null> {
    try {
      const isAuth = await this.isAuthenticated();
      if (!isAuth) {
        return null;
      }

      const { accessToken } = await this.getStoredTokens();
      if (!accessToken) {
        return null;
      }

      // Получаем информацию о пользователе
      const userInfo = await this.getUserInfo(accessToken);
      
      // Ищем пользователя в БД
      const user = await databaseService.getUserByGoogleId(userInfo.id);
      if (user) {
        await databaseService.updateUserLastLogin(user.id);
        return user;
      }

      return null;
    } catch (error) {
      console.error('Auto sign-in error:', error);
      // Если что-то пошло не так, очищаем токены
      await this.signOut();
      return null;
    }
  }

  // Обновление токенов
  async refreshToken(): Promise<boolean> {
    try {
      // В Chrome Extension токены обычно обновляются автоматически
      // Для веб-приложения нужно реализовать refresh logic
      return await this.isAuthenticated();
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  // Утилиты
  private generateNonce(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Проверка доступности Chrome Identity API
  isChromeExtension(): boolean {
    return typeof chrome !== 'undefined' && !!chrome.identity;
  }

  // Загрузка Google Identity Services для веб-версии
  async loadGoogleAPI(): Promise<void> {
    if (this.isChromeExtension()) {
      return; // В расширении используем Chrome Identity API
    }

    return new Promise((resolve, reject) => {
      if (typeof window.google !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    });
  }
}

export const authService = new AuthService();