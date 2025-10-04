import { FavoritePrompt, ImageAnalysis, PromptHistoryItem } from '../types';

/**
 * Сервис для локального хранения данных без авторизации
 */
export class LocalStorageService {
  private static readonly KEYS = {
    FAVORITES: 'ai_prompt_favorites',
    IMAGE_ANALYSES: 'ai_prompt_image_analyses',
    HISTORY: 'ai_prompt_history',
    SETTINGS: 'ai_prompt_settings'
  };

  // Избранное
  static async getFavorites(): Promise<FavoritePrompt[]> {
    try {
      const stored = localStorage.getItem(this.KEYS.FAVORITES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting favorites from localStorage:', error);
      return [];
    }
  }

  static async saveFavorites(favorites: FavoritePrompt[]): Promise<void> {
    try {
      localStorage.setItem(this.KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }

  static async addFavorite(favorite: Omit<FavoritePrompt, 'id' | 'userId' | 'createdAt' | 'usageCount'>): Promise<FavoritePrompt> {
    const favorites = await this.getFavorites();
    
    // Проверяем дубликаты
    const isDuplicate = favorites.some(f => 
      f.content.toLowerCase() === favorite.content.toLowerCase() || 
      f.title.toLowerCase() === favorite.title.toLowerCase()
    );

    if (isDuplicate) {
      throw new Error('Промпт уже существует в избранном');
    }

    const newFavorite: FavoritePrompt = {
      ...favorite,
      id: Date.now().toString(),
      userId: 'local',
      createdAt: new Date(),
      usageCount: 0
    };

    const updatedFavorites = [newFavorite, ...favorites].slice(0, 100); // Ограничиваем до 100 элементов
    await this.saveFavorites(updatedFavorites);
    
    return newFavorite;
  }

  static async removeFavorite(id: string): Promise<void> {
    const favorites = await this.getFavorites();
    const updatedFavorites = favorites.filter(f => f.id !== id);
    await this.saveFavorites(updatedFavorites);
  }

  static async updateFavorite(id: string, updates: Partial<FavoritePrompt>): Promise<void> {
    const favorites = await this.getFavorites();
    const updatedFavorites = favorites.map(f => 
      f.id === id ? { ...f, ...updates } : f
    );
    await this.saveFavorites(updatedFavorites);
  }

  // Анализы изображений
  static async getImageAnalyses(): Promise<ImageAnalysis[]> {
    try {
      const stored = localStorage.getItem(this.KEYS.IMAGE_ANALYSES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting image analyses from localStorage:', error);
      return [];
    }
  }

  static async saveImageAnalyses(analyses: ImageAnalysis[]): Promise<void> {
    try {
      localStorage.setItem(this.KEYS.IMAGE_ANALYSES, JSON.stringify(analyses));
    } catch (error) {
      console.error('Error saving image analyses to localStorage:', error);
    }
  }

  static async addImageAnalysis(analysis: Omit<ImageAnalysis, 'id' | 'userId' | 'createdAt'>): Promise<ImageAnalysis> {
    const analyses = await this.getImageAnalyses();

    const newAnalysis: ImageAnalysis = {
      ...analysis,
      id: Date.now().toString(),
      userId: 'local',
      createdAt: new Date()
    };

    const updatedAnalyses = [newAnalysis, ...analyses].slice(0, 50); // Ограничиваем до 50 элементов
    await this.saveImageAnalyses(updatedAnalyses);
    
    return newAnalysis;
  }

  static async removeImageAnalysis(id: string): Promise<void> {
    const analyses = await this.getImageAnalyses();
    const updatedAnalyses = analyses.filter(a => a.id !== id);
    await this.saveImageAnalyses(updatedAnalyses);
  }

  static async updateImageAnalysis(id: string, updates: Partial<ImageAnalysis>): Promise<void> {
    const analyses = await this.getImageAnalyses();
    const updatedAnalyses = analyses.map(a => 
      a.id === id ? { ...a, ...updates } : a
    );
    await this.saveImageAnalyses(updatedAnalyses);
  }

  // История промптов (локальная)
  static async getHistory(): Promise<PromptHistoryItem[]> {
    try {
      const stored = localStorage.getItem(this.KEYS.HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting history from localStorage:', error);
      return [];
    }
  }

  static async saveHistory(history: PromptHistoryItem[]): Promise<void> {
    try {
      localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving history to localStorage:', error);
    }
  }

  static async addHistoryItem(item: Omit<PromptHistoryItem, 'id' | 'userId' | 'timestamp'>): Promise<PromptHistoryItem> {
    const history = await this.getHistory();

    const newItem: PromptHistoryItem = {
      ...item,
      id: Date.now().toString(),
      userId: 'local',
      timestamp: new Date()
    };

    const updatedHistory = [newItem, ...history].slice(0, 200); // Ограничиваем до 200 элементов
    await this.saveHistory(updatedHistory);
    
    return newItem;
  }

  static async removeHistoryItem(id: string): Promise<void> {
    const history = await this.getHistory();
    const updatedHistory = history.filter(h => h.id !== id);
    await this.saveHistory(updatedHistory);
  }

  static async clearHistory(): Promise<void> {
    await this.saveHistory([]);
  }

  // Поиск с проверкой дубликатов
  static async checkDuplicate(content: string, type: 'favorite' | 'history'): Promise<boolean> {
    const normalizedContent = content.toLowerCase().trim();
    
    if (type === 'favorite') {
      const favorites = await this.getFavorites();
      return favorites.some(f => 
        f.content.toLowerCase().trim() === normalizedContent ||
        f.title.toLowerCase().trim() === normalizedContent
      );
    } else {
      const history = await this.getHistory();
      return history.some(h => 
        h.originalText.toLowerCase().trim() === normalizedContent ||
        h.improvedText.toLowerCase().trim() === normalizedContent
      );
    }
  }

  // Экспорт данных
  static async exportData(): Promise<{
    favorites: FavoritePrompt[];
    imageAnalyses: ImageAnalysis[];
    history: PromptHistoryItem[];
  }> {
    const [favorites, imageAnalyses, history] = await Promise.all([
      this.getFavorites(),
      this.getImageAnalyses(),
      this.getHistory()
    ]);

    return {
      favorites,
      imageAnalyses,
      history
    };
  }

  // Импорт данных
  static async importData(data: {
    favorites?: FavoritePrompt[];
    imageAnalyses?: ImageAnalysis[];
    history?: PromptHistoryItem[];
  }): Promise<void> {
    try {
      if (data.favorites) {
        await this.saveFavorites(data.favorites);
      }
      if (data.imageAnalyses) {
        await this.saveImageAnalyses(data.imageAnalyses);
      }
      if (data.history) {
        await this.saveHistory(data.history);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  // Очистка всех данных
  static async clearAllData(): Promise<void> {
    try {
      localStorage.removeItem(this.KEYS.FAVORITES);
      localStorage.removeItem(this.KEYS.IMAGE_ANALYSES);
      localStorage.removeItem(this.KEYS.HISTORY);
      localStorage.removeItem(this.KEYS.SETTINGS);
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }

  // Получение статистики
  static async getStats(): Promise<{
    favoritesCount: number;
    imageAnalysesCount: number;
    historyCount: number;
    totalSize: number; // в байтах
  }> {
    const [favorites, imageAnalyses, history] = await Promise.all([
      this.getFavorites(),
      this.getImageAnalyses(),
      this.getHistory()
    ]);

    // Приблизительный размер в localStorage
    const totalSize = 
      (localStorage.getItem(this.KEYS.FAVORITES)?.length || 0) +
      (localStorage.getItem(this.KEYS.IMAGE_ANALYSES)?.length || 0) +
      (localStorage.getItem(this.KEYS.HISTORY)?.length || 0);

    return {
      favoritesCount: favorites.length,
      imageAnalysesCount: imageAnalyses.length,
      historyCount: history.length,
      totalSize: totalSize * 2 // UTF-16 encoding
    };
  }
}