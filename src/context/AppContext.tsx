import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
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
  ImageAnalysis
} from '../types';
import { ChromeApiService } from '../services/chromeApi';
import { authService } from '../services/auth';
import { databaseService } from '../services/database';
import { aiService } from '../services/aiProviders';
import { sharingService } from '../services/sharing';
import { LocalStorageService } from '../services/localStorage';

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
  loginUser: (user: User) => void;
  logoutUser: () => void;
  
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
  
  // ИИ провайдеры
  selectProvider: (provider: AIProvider) => void;
  selectModel: (model: AIModel) => void;
  getAvailableModels: () => AIModel[];
  
  // Анализ изображений
  analyzeImage: (imageFile: File) => Promise<ImageAnalysis>;
  addImageAnalysis: (analysis: Omit<ImageAnalysis, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  
  // Проверка дубликатов
  checkDuplicate: (content: string, type: 'favorite' | 'history') => Promise<boolean>;
  
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
  | { type: 'LOAD_STATE'; payload: Partial<AppState> }
  | { type: 'SET_IMAGE_ANALYSES'; payload: ImageAnalysis[] }
  | { type: 'ADD_IMAGE_ANALYSIS'; payload: ImageAnalysis };

const initialState: AppState = {
  currentTab: 'improve',
  user: null,
  isLoggedIn: false,
  history: [],
  favorites: [],
  imageAnalyses: [],
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
    autoSave: true
  },
  isLoading: false,
  error: null,
  searchFilters: {},
  selectedProvider: 'openrouter',
  selectedModel: null
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
    
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    
    case 'SET_IMAGE_ANALYSES':
      return { ...state, imageAnalyses: action.payload };
    
    case 'ADD_IMAGE_ANALYSIS':
      return { 
        ...state, 
        imageAnalyses: [action.payload, ...state.imageAnalyses]
      };
    
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
      
      // Если пользователь не авторизован, загружаем локальные данные
      if (!user) {
        const [localFavorites, localImageAnalyses] = await Promise.all([
          LocalStorageService.getFavorites(),
          LocalStorageService.getImageAnalyses()
        ]);
        
        dispatch({ type: 'SET_FAVORITES', payload: localFavorites });
        dispatch({ type: 'SET_IMAGE_ANALYSES', payload: localImageAnalyses });
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
      const [history, favorites] = await Promise.all([
        databaseService.getUserHistory(userId),
        databaseService.getUserFavorites(userId)
      ]);

      dispatch({ type: 'SET_HISTORY', payload: history.data });
      dispatch({ type: 'SET_FAVORITES', payload: favorites });
      
      // Load image analyses from local storage
      const imageAnalyses = await ChromeApiService.getStorage(`imageAnalyses_${userId}`) || [];
      dispatch({ type: 'SET_IMAGE_ANALYSES', payload: imageAnalyses });
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

  // Simple login/logout methods for ProfileTab compatibility
  const loginUser = (user: User) => {
    dispatch({ type: 'LOGIN_USER', payload: user });
  };

  const logoutUser = () => {
    dispatch({ type: 'LOGOUT_USER' });
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
    try {
      // Проверяем дубликаты
      const isDuplicate = await checkDuplicate(item.content, 'favorite');
      if (isDuplicate) {
        throw new Error('Этот промпт уже существует в избранном');
      }
      
      let favorite: FavoritePrompt;
      
      if (state.user) {
        // Авторизованный пользователь - сохраняем в БД
        favorite = await databaseService.addFavorite({
          ...item,
          userId: state.user.id
        });
      } else {
        // Неавторизованный пользователь - сохраняем локально
        favorite = await LocalStorageService.addFavorite(item);
      }
      
      dispatch({ type: 'ADD_FAVORITE', payload: favorite });
    } catch (error) {
      console.error('Add to favorites error:', error);
      setError(error instanceof Error ? error.message : 'Ошибка добавления в избранное');
    }
  };

  const removeFromFavorites = async (id: string) => {
    try {
      if (state.user) {
        await databaseService.deleteFavorite(id);
      } else {
        await LocalStorageService.removeFavorite(id);
      }
      dispatch({ type: 'REMOVE_FAVORITE', payload: id });
    } catch (error) {
      console.error('Remove from favorites error:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      let favorites: FavoritePrompt[];
      
      if (state.user) {
        favorites = await databaseService.getUserFavorites(state.user.id);
      } else {
        favorites = await LocalStorageService.getFavorites();
      }
      
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
  const analyzeImage = async (imageFile: File): Promise<ImageAnalysis> => {
    if (!state.user) {
      throw new Error('Необходимо войти в систему');
    }

    try {
      setLoading(true);
      setError(null);

      // Convert image to base64
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      // TODO: Replace with actual AI service call
      // Simulate AI analysis for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockPrompts = {
        general: 'A detailed natural language description of the uploaded image with focus on composition, subjects, and visual elements.',
        flux: 'High-quality digital art, detailed composition, professional lighting, modern style, vibrant colors, sharp focus.',
        stableDiffusion: 'masterpiece, best quality, ultra detailed, 8k resolution, photorealistic, professional photography, perfect composition, dramatic lighting, vibrant colors, sharp focus, artstation quality'
      };

      const analysis: ImageAnalysis = {
        id: Date.now().toString(),
        userId: state.user.id,
        imageUrl: base64Image,
        generatedPrompts: mockPrompts,
        promptType: 'general',
        createdAt: new Date(),
        isFavorite: false
      };

      return analysis;
    } catch (error) {
      console.error('Image analysis error:', error);
      throw new Error('Ошибка анализа изображения');
    } finally {
      setLoading(false);
    }
  };

  const addImageAnalysis = async (analysis: Omit<ImageAnalysis, 'id' | 'userId' | 'createdAt'>) => {
    try {
      let newAnalysis: ImageAnalysis;
      
      if (state.user) {
        // Авторизованный пользователь - сохраняем в Chrome storage
        newAnalysis = {
          ...analysis,
          id: Date.now().toString(),
          userId: state.user.id,
          createdAt: new Date()
        };
        
        // Save to Chrome storage
        const currentAnalyses = state.imageAnalyses;
        const updatedAnalyses = [newAnalysis, ...currentAnalyses].slice(0, 50); // Keep only last 50
        await ChromeApiService.setStorage(`imageAnalyses_${state.user.id}`, updatedAnalyses);
      } else {
        // Неавторизованный пользователь - сохраняем локально
        newAnalysis = await LocalStorageService.addImageAnalysis(analysis);
      }
      
      dispatch({ type: 'ADD_IMAGE_ANALYSIS', payload: newAnalysis });
    } catch (error) {
      console.error('Add image analysis error:', error);
    }
  };

  // Проверка дубликатов
  const checkDuplicate = async (content: string, type: 'favorite' | 'history'): Promise<boolean> => {
    try {
      if (state.user) {
        // Для авторизованных пользователей проверяем в локальном состоянии
        const normalizedContent = content.toLowerCase().trim();
        
        if (type === 'favorite') {
          return state.favorites.some(f => 
            f.content.toLowerCase().trim() === normalizedContent ||
            f.title.toLowerCase().trim() === normalizedContent
          );
        } else {
          return state.history.some(h => 
            h.originalText.toLowerCase().trim() === normalizedContent ||
            h.improvedText.toLowerCase().trim() === normalizedContent
          );
        }
      } else {
        // Для неавторизованных пользователей проверяем в localStorage
        return await LocalStorageService.checkDuplicate(content, type);
      }
    } catch (error) {
      console.error('Check duplicate error:', error);
      return false;
    }
  };

  const contextValue: AppContextType = {
    ...state,
    setCurrentTab,
    setTheme,
    setLanguage,
    updateSettings,
    loginWithGoogle,
    logout,
    loginUser,
    logoutUser,
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
    selectProvider,
    selectModel,
    getAvailableModels,
    analyzeImage,
    addImageAnalysis,
    checkDuplicate,
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