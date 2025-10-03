import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  AppState, 
  TabType, 
  Theme, 
  Language, 
  PromptHistoryItem, 
  FavoritePrompt,
  User,
  AIProvider,
  PromptType,
  AIModel,
  SearchFilters,
  ImageAnalysisResult,
  SubscriptionPlan
} from '../types';
import { ChromeApiService } from '../services/chromeApi';
import { authService } from '../services/auth';
import { databaseService } from '../services/database';
import { aiService } from '../services/aiProviders';
import { sharingService } from '../services/sharing';

interface AppContextType extends AppState {
  // Навигация
  setCurrentTab: (tab: TabType) => void;
  
  // Настройки
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  updateSettings: (settings: Partial<AppState['settings']>) => void;
  
  // Аутентификация
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  
  // Работа с промптами
  improvePrompt: (text: string, type: PromptType, provider: AIProvider, model: string) => Promise<void>;
  
  // История
  addHistoryItem: (item: Omit<PromptHistoryItem, 'id' | 'timestamp' | 'userId'>) => Promise<void>;
  clearHistory: () => Promise<void>;
  deleteHistoryItem: (id: string) => Promise<void>;
  toggleHistoryFavorite: (id: string) => Promise<void>;
  
  // Избранное
  addToFavorites: (item: Omit<FavoritePrompt, 'id' | 'createdAt' | 'usageCount' | 'userId'>) => Promise<void>;
  removeFromFavorites: (id: string) => Promise<void>;
  loadFavorites: () => Promise<void>;
  
  // Поиск и фильтры
  updateSearchFilters: (filters: Partial<SearchFilters>) => void;
  searchHistory: (query: string) => Promise<void>;
  
  // Расшаривание
  sharePrompt: (title: string, content: string, type: PromptType, tags: string[]) => Promise<{ shareUrl: string; qrCodeUrl: string }>;
  
  // Анализ изображений
  analyzeImage: (imageFile: File) => Promise<ImageAnalysisResult>;
  getImageAnalysisHistory: () => ImageAnalysisResult[];
  
  // Подписки Pro
  purchaseProSubscription: (planId: string) => Promise<void>;
  checkProStatus: () => Promise<boolean>;
  
  // ИИ провайдеры
  selectProvider: (provider: AIProvider) => void;
  selectModel: (model: AIModel) => void;
  getAvailableModels: () => AIModel[];
  
  // Аутентификация (обновленные методы)
  login: (user: User) => void;
  
  // Утилиты
  copyToClipboard: (text: string) => Promise<boolean>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type AppAction =
  | { type: 'SET_TAB'; payload: TabType }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppState['settings']> }
  | { type: 'LOGIN_USER'; payload: User }
  | { type: 'LOGOUT_USER' }
  | { type: 'SET_HISTORY'; payload: PromptHistoryItem[] }
  | { type: 'ADD_HISTORY_ITEM'; payload: PromptHistoryItem }
  | { type: 'DELETE_HISTORY_ITEM'; payload: string }
  | { type: 'UPDATE_HISTORY_ITEM'; payload: { id: string; updates: Partial<PromptHistoryItem> } }
  | { type: 'SET_FAVORITES'; payload: FavoritePrompt[] }
  | { type: 'ADD_FAVORITE'; payload: FavoritePrompt }
  | { type: 'REMOVE_FAVORITE'; payload: string }
  | { type: 'UPDATE_SEARCH_FILTERS'; payload: Partial<SearchFilters> }
  | { type: 'SELECT_PROVIDER'; payload: AIProvider }
  | { type: 'SELECT_MODEL'; payload: AIModel }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_IMAGE_ANALYSIS_HISTORY'; payload: ImageAnalysisResult[] }
  | { type: 'ADD_IMAGE_ANALYSIS'; payload: ImageAnalysisResult }
  | { type: 'UPDATE_USER_PRO_STATUS'; payload: { isPro: boolean; proExpiresAt?: Date } }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };

const initialState: AppState = {
  currentTab: 'improve',
  user: null,
  isLoggedIn: false,
  history: [],
  favorites: [],
  settings: {
    theme: 'light',
    language: 'ru',
    defaultProvider: 'openrouter',
    defaultPromptType: 'universal',
    aiProviders: [
      {
        provider: 'openrouter',
        enabled: true,
        rateLimit: { requests: 10, window: 60 }
      },
      {
        provider: 'huggingface',
        enabled: true,
        rateLimit: { requests: 5, window: 60 }
      },
      {
        provider: 'poe',
        enabled: false,
        rateLimit: { requests: 3, window: 60 }
      }
    ],
    showAds: true,
    cacheEnabled: true,
    autoSave: true,
    maxHistoryItems: 10,
    imageAnalysisProvider: 'openai'
  },
  isLoading: false,
  error: null,
  searchFilters: {},
  selectedProvider: 'openrouter',
  selectedModel: null,
  imageAnalysisHistory: [],
  availableSubscriptions: [
    {
      id: 'pro-monthly',
      name: 'Pro Monthly',
      price: 9.99,
      currency: 'USD',
      duration: 30,
      historyLimit: -1,
      features: ['Unlimited History', 'Priority Support', 'Advanced Features', 'No Ads']
    },
    {
      id: 'pro-yearly',
      name: 'Pro Yearly',
      price: 99.99,
      currency: 'USD',
      duration: 365,
      historyLimit: -1,
      popular: true,
      features: ['Unlimited History', 'Priority Support', 'Advanced Features', 'No Ads', 'Beta Access']
    }
  ]
};

const AppContext = createContext<AppContextType | undefined>(undefined);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, currentTab: action.payload };
    
    case 'SET_THEME':
      return {
        ...state,
        settings: { ...state.settings, theme: action.payload },
      };
    
    case 'SET_LANGUAGE':
      return {
        ...state,
        settings: { ...state.settings, language: action.payload },
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    
    case 'LOGIN_USER':
      return {
        ...state,
        user: action.payload,
        isLoggedIn: true,
      };
    
    case 'LOGOUT_USER':
      return {
        ...state,
        user: null,
        isLoggedIn: false,
        history: [],
        favorites: []
      };

    case 'SET_HISTORY':
      return { ...state, history: action.payload };

    case 'ADD_HISTORY_ITEM':
      return {
        ...state,
        history: [action.payload, ...state.history],
      };

    case 'DELETE_HISTORY_ITEM':
      return {
        ...state,
        history: state.history.filter(item => item.id !== action.payload),
      };

    case 'UPDATE_HISTORY_ITEM':
      return {
        ...state,
        history: state.history.map(item => 
          item.id === action.payload.id 
            ? { ...item, ...action.payload.updates }
            : item
        ),
      };

    case 'SET_FAVORITES':
      return { ...state, favorites: action.payload };

    case 'ADD_FAVORITE':
      return {
        ...state,
        favorites: [action.payload, ...state.favorites],
      };

    case 'REMOVE_FAVORITE':
      return {
        ...state,
        favorites: state.favorites.filter(item => item.id !== action.payload),
      };

    case 'UPDATE_SEARCH_FILTERS':
      return {
        ...state,
        searchFilters: { ...state.searchFilters, ...action.payload },
      };

    case 'SELECT_PROVIDER':
      return {
        ...state,
        selectedProvider: action.payload,
        selectedModel: null // Сброс модели при смене провайдера
      };

    case 'SELECT_MODEL':
      return {
        ...state,
        selectedModel: action.payload,
        selectedProvider: action.payload.provider
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_IMAGE_ANALYSIS_HISTORY':
      return { ...state, imageAnalysisHistory: action.payload };

    case 'ADD_IMAGE_ANALYSIS':
      return {
        ...state,
        imageAnalysisHistory: [action.payload, ...state.imageAnalysisHistory],
      };

    case 'UPDATE_USER_PRO_STATUS':
      return {
        ...state,
        user: state.user ? {
          ...state.user,
          isPro: action.payload.isPro,
          proExpiresAt: action.payload.proExpiresAt
        } : null,
      };

    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Инициализация при загрузке
  useEffect(() => {
    initializeApp();
  }, []);

  // Сохранение состояния
  useEffect(() => {
    if (state.user) {
      ChromeApiService.setStorage('appState', {
        settings: state.settings,
        selectedProvider: state.selectedProvider,
        selectedModel: state.selectedModel,
        searchFilters: state.searchFilters
      });
    }
  }, [state.settings, state.selectedProvider, state.selectedModel, state.searchFilters, state.user]);

  // Применение темы
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.settings.theme === 'dark');
  }, [state.settings.theme]);

  // Инициализация приложения
  const initializeApp = async () => {
    try {
      setLoading(true);

      // Инициализация БД
      await databaseService.initializeTables();

      // Автоматический вход
      const user = await authService.autoSignIn();
      if (user) {
        dispatch({ type: 'LOGIN_USER', payload: user });
        await loadUserData(user.id);
      }

      // Загрузка настроек
      const savedState = await ChromeApiService.getStorage('appState');
      if (savedState) {
        dispatch({ type: 'LOAD_STATE', payload: savedState });
      }

      // Инициализация модели по умолчанию
      const models = aiService.getAvailableModels(state.selectedProvider);
      if (models.length > 0 && !state.selectedModel) {
        dispatch({ type: 'SELECT_MODEL', payload: models[0] });
      }
    } catch (error) {
      console.error('Initialization error:', error);
      setError('Ошибка инициализации приложения');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка данных пользователя
  const loadUserData = async (userId: string) => {
    try {
      const [historyResponse, favorites] = await Promise.all([
        databaseService.getUserHistory(userId),
        databaseService.getUserFavorites(userId)
      ]);

      let history = historyResponse.data;
      
      // Ограничиваем историю для бесплатных пользователей
      if (state.user && !state.user.isPro) {
        const maxItems = state.settings.maxHistoryItems;
        if (maxItems > 0 && history.length > maxItems) {
          history = history.slice(0, maxItems);
        }
      }

      dispatch({ type: 'SET_HISTORY', payload: history });
      dispatch({ type: 'SET_FAVORITES', payload: favorites });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Навигация
  const setCurrentTab = (tab: TabType) => {
    dispatch({ type: 'SET_TAB', payload: tab });
  };

  // Настройки
  const setTheme = (theme: Theme) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const setLanguage = (language: Language) => {
    dispatch({ type: 'SET_LANGUAGE', payload: language });
  };

  const updateSettings = (settings: Partial<AppState['settings']>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  // Аутентификация
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);

      let user: User;
      
      if (authService.isChromeExtension()) {
        user = await authService.signInWithGoogle();
      } else {
        await authService.loadGoogleAPI();
        user = await authService.signInWithGoogleWeb();
      }

      dispatch({ type: 'LOGIN_USER', payload: user });
      await loadUserData(user.id);
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
      dispatch({ type: 'LOGOUT_USER' });
      await ChromeApiService.removeStorage('appState');
    } catch (error) {
      console.error('Logout error:', error);
      setError('Ошибка при выходе из системы');
    }
  };

  // Работа с промптами
  const improvePrompt = async (text: string, type: PromptType, provider: AIProvider, model: string) => {
    if (!state.user) {
      setError('Необходимо войти в систему');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await aiService.improvePrompt(
        text, 
        provider, 
        model, 
        type, 
        state.settings.language
      );

      const historyItem = await databaseService.addHistoryItem({
        userId: state.user.id,
        originalText: text,
        improvedText: response.text,
        improvedBy: provider,
        promptType: type,
        tags: [],
        isFavorite: false,
        isShared: false,
        model: response.model,
        tokensUsed: response.tokensUsed
      });

      dispatch({ type: 'ADD_HISTORY_ITEM', payload: historyItem });

      // Для бесплатных пользователей ограничиваем количество записей в истории
      if (!state.user.isPro && state.settings.maxHistoryItems > 0) {
        const currentHistory = [historyItem, ...state.history];
        if (currentHistory.length > state.settings.maxHistoryItems) {
          // Удаляем старые записи
          const itemsToRemove = currentHistory.slice(state.settings.maxHistoryItems);
          for (const item of itemsToRemove) {
            await databaseService.deleteHistoryItem(item.id);
          }
          
          // Обновляем локальное состояние
          const limitedHistory = currentHistory.slice(0, state.settings.maxHistoryItems);
          dispatch({ type: 'SET_HISTORY', payload: limitedHistory });
        }
      }

    } catch (error) {
      console.error('Improve prompt error:', error);
      setError(error instanceof Error ? error.message : 'Ошибка улучшения промпта');
    } finally {
      setLoading(false);
    }
  };

  // История
  const addHistoryItem = async (item: Omit<PromptHistoryItem, 'id' | 'timestamp' | 'userId'>) => {
    if (!state.user) return;

    try {
      const historyItem = await databaseService.addHistoryItem({
        ...item,
        userId: state.user.id
      });
      dispatch({ type: 'ADD_HISTORY_ITEM', payload: historyItem });
    } catch (error) {
      console.error('Add history item error:', error);
    }
  };

  const clearHistory = async () => {
    if (!state.user) return;

    try {
      await databaseService.clearUserHistory(state.user.id);
      dispatch({ type: 'SET_HISTORY', payload: [] });
    } catch (error) {
      console.error('Clear history error:', error);
      setError('Ошибка очистки истории');
    }
  };

  const deleteHistoryItem = async (id: string) => {
    try {
      await databaseService.deleteHistoryItem(id);
      dispatch({ type: 'DELETE_HISTORY_ITEM', payload: id });
    } catch (error) {
      console.error('Delete history item error:', error);
    }
  };

  const toggleHistoryFavorite = async (id: string) => {
    const item = state.history.find(h => h.id === id);
    if (!item) return;

    try {
      const updates = { isFavorite: !item.isFavorite };
      dispatch({ type: 'UPDATE_HISTORY_ITEM', payload: { id, updates } });

      // Обновляем в БД
      // Здесь нужно добавить метод updateHistoryItem в databaseService
    } catch (error) {
      console.error('Toggle favorite error:', error);
    }
  };

  // Избранное
  const addToFavorites = async (item: Omit<FavoritePrompt, 'id' | 'createdAt' | 'usageCount' | 'userId'>) => {
    if (!state.user) return;

    try {
      const favorite = await databaseService.addFavorite({
        ...item,
        userId: state.user.id
      });
      dispatch({ type: 'ADD_FAVORITE', payload: favorite });
    } catch (error) {
      console.error('Add to favorites error:', error);
    }
  };

  const removeFromFavorites = async (id: string) => {
    try {
      await databaseService.deleteFavorite(id);
      dispatch({ type: 'REMOVE_FAVORITE', payload: id });
    } catch (error) {
      console.error('Remove from favorites error:', error);
    }
  };

  const loadFavorites = async () => {
    if (!state.user) return;

    try {
      const favorites = await databaseService.getUserFavorites(state.user.id);
      dispatch({ type: 'SET_FAVORITES', payload: favorites });
    } catch (error) {
      console.error('Load favorites error:', error);
    }
  };

  // Поиск
  const updateSearchFilters = (filters: Partial<SearchFilters>) => {
    dispatch({ type: 'UPDATE_SEARCH_FILTERS', payload: filters });
  };

  const searchHistory = async (query: string) => {
    if (!state.user) return;

    try {
      const results = await databaseService.searchHistory(state.user.id, query, state.searchFilters);
      dispatch({ type: 'SET_HISTORY', payload: results });
    } catch (error) {
      console.error('Search history error:', error);
    }
  };

  // Расшаривание
  const sharePrompt = async (title: string, content: string, type: PromptType, tags: string[]) => {
    if (!state.user) throw new Error('Необходимо войти в систему');

    const result = await sharingService.sharePrompt(title, content, type, tags, state.user.name);
    return {
      shareUrl: result.shareUrl,
      qrCodeUrl: result.qrCodeUrl
    };
  };

  // ИИ провайдеры
  const selectProvider = (provider: AIProvider) => {
    dispatch({ type: 'SELECT_PROVIDER', payload: provider });
  };

  const selectModel = (model: AIModel) => {
    dispatch({ type: 'SELECT_MODEL', payload: model });
  };

  const getAvailableModels = (): AIModel[] => {
    return aiService.getAvailableModels(state.selectedProvider);
  };

  // Утилиты
  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const result = document.execCommand('copy');
        textArea.remove();
        return result;
      }
    } catch (error) {
      console.error('Copy error:', error);
      return false;
    }
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  // Анализ изображений
  const analyzeImage = async (imageFile: File): Promise<ImageAnalysisResult> => {
    if (!state.user) {
      throw new Error('Необходимо войти в систему');
    }

    try {
      setLoading(true);
      setError(null);

      // Импортируем сервис анализа изображений
      const { imageAnalysisService } = await import('../services/imageAnalysis');
      
      const result = await imageAnalysisService.analyzeImage(imageFile, state.user.id);
      
      // Добавляем результат в историю анализа
      dispatch({ type: 'ADD_IMAGE_ANALYSIS', payload: result });
      
      // Сохраняем в базе данных (если есть соответствующий сервис)
      // await databaseService.addImageAnalysis(result);
      
      return result;
    } catch (error) {
      console.error('Image analysis error:', error);
      setError(error instanceof Error ? error.message : 'Ошибка анализа изображения');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getImageAnalysisHistory = (): ImageAnalysisResult[] => {
    return state.imageAnalysisHistory;
  };

  // Подписки Pro
  const purchaseProSubscription = async (planId: string): Promise<void> => {
    if (!state.user) {
      throw new Error('Необходимо войти в систему');
    }

    try {
      setLoading(true);
      setError(null);

      // В реальном приложении здесь будет интеграция с платежной системой
      // Например, Stripe, PayPal или другим провайдером
      
      // Для демонстрации симулируем успешную покупку
      const plan = state.availableSubscriptions.find(p => p.id === planId);
      if (!plan) {
        throw new Error('План не найден');
      }

      // Обновляем статус Pro пользователя
      const proExpiresAt = new Date();
      proExpiresAt.setDate(proExpiresAt.getDate() + plan.duration);

      dispatch({ 
        type: 'UPDATE_USER_PRO_STATUS', 
        payload: { 
          isPro: true, 
          proExpiresAt 
        } 
      });

      // В реальном приложении здесь будет вызов к серверу для обновления статуса
      // await databaseService.updateUserProStatus(state.user.id, true, proExpiresAt);

      // Обновляем настройки для неограниченной истории
      updateSettings({ maxHistoryItems: -1 });

    } catch (error) {
      console.error('Purchase error:', error);
      setError(error instanceof Error ? error.message : 'Ошибка покупки подписки');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkProStatus = async (): Promise<boolean> => {
    if (!state.user?.isPro) {
      return false;
    }

    if (state.user.proExpiresAt) {
      const now = new Date();
      const expiresAt = new Date(state.user.proExpiresAt);
      
      if (now > expiresAt) {
        // Подписка истекла
        dispatch({ 
          type: 'UPDATE_USER_PRO_STATUS', 
          payload: { isPro: false } 
        });
        return false;
      }
    }

    return true;
  };

  // Обновленный метод login
  const login = (user: User) => {
    dispatch({ type: 'LOGIN_USER', payload: user });
  };

  const contextValue: AppContextType = {
    ...state,
    setCurrentTab,
    setTheme,
    setLanguage,
    updateSettings,
    loginWithGoogle,
    logout,
    login,
    improvePrompt,
    addHistoryItem,
    clearHistory,
    deleteHistoryItem,
    toggleHistoryFavorite,
    addToFavorites,
    removeFromFavorites,
    loadFavorites,
    updateSearchFilters,
    searchHistory,
    sharePrompt,
    analyzeImage,
    getImageAnalysisHistory,
    purchaseProSubscription,
    checkProStatus,
    selectProvider,
    selectModel,
    getAvailableModels,
    copyToClipboard,
    setLoading,
    setError
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}