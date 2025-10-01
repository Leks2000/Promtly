import { PromptHistoryItem, FavoritePrompt, User, ShareablePrompt } from '../types';

export class DatabaseService {
  private baseUrl = '';
  
  // Инициализация схем таблиц
  async initializeTables() {
    try {
      // Таблица пользователей
      await this.createTable('users', [
        { name: 'id', type: 'text', description: 'User ID' },
        { name: 'googleId', type: 'text', description: 'Google OAuth ID' },
        { name: 'name', type: 'text', description: 'Display name' },
        { name: 'email', type: 'text', description: 'Email address' },
        { name: 'avatar', type: 'text', description: 'Avatar URL' },
        { name: 'createdAt', type: 'datetime', description: 'Registration date' },
        { name: 'lastLoginAt', type: 'datetime', description: 'Last login date' }
      ]);

      // Таблица истории промптов
      await this.createTable('prompt_history', [
        { name: 'id', type: 'text', description: 'History item ID' },
        { name: 'userId', type: 'text', description: 'User ID' },
        { name: 'originalText', type: 'rich_text', description: 'Original prompt' },
        { name: 'improvedText', type: 'rich_text', description: 'Improved prompt' },
        { name: 'improvedBy', type: 'text', description: 'AI provider' },
        { name: 'promptType', type: 'text', description: 'Prompt type' },
        { name: 'tags', type: 'array', description: 'Tags' },
        { name: 'isFavorite', type: 'bool', description: 'Is favorite' },
        { name: 'isShared', type: 'bool', description: 'Is shared' },
        { name: 'shareId', type: 'text', description: 'Share ID' },
        { name: 'timestamp', type: 'datetime', description: 'Created date' },
        { name: 'model', type: 'text', description: 'AI model used' },
        { name: 'tokensUsed', type: 'number', description: 'Tokens consumed' }
      ]);

      // Таблица избранных промптов
      await this.createTable('favorites', [
        { name: 'id', type: 'text', description: 'Favorite ID' },
        { name: 'userId', type: 'text', description: 'User ID' },
        { name: 'title', type: 'text', description: 'Prompt title' },
        { name: 'content', type: 'rich_text', description: 'Prompt content' },
        { name: 'tags', type: 'array', description: 'Tags' },
        { name: 'category', type: 'text', description: 'Category' },
        { name: 'createdAt', type: 'datetime', description: 'Created date' },
        { name: 'usageCount', type: 'number', description: 'Usage count' }
      ]);

      // Таблица расшаренных промптов
      await this.createTable('shared_prompts', [
        { name: 'id', type: 'text', description: 'Share ID' },
        { name: 'title', type: 'text', description: 'Prompt title' },
        { name: 'content', type: 'rich_text', description: 'Prompt content' },
        { name: 'type', type: 'text', description: 'Prompt type' },
        { name: 'tags', type: 'array', description: 'Tags' },
        { name: 'createdBy', type: 'text', description: 'Created by user' },
        { name: 'createdAt', type: 'datetime', description: 'Created date' },
        { name: 'viewCount', type: 'number', description: 'View count' }
      ]);

      console.log('Database tables initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database tables:', error);
    }
  }

  private async createTable(name: string, fields: any[]) {
    try {
      // Используем TableSchemaUpdate tool через fetch к нашему API
      const response = await fetch('/api/table-schema-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          fields
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create table ${name}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error creating table ${name}:`, error);
    }
  }

  // Методы для работы с пользователями
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLoginAt'>): Promise<User> {
    const user: User = {
      ...userData,
      id: this.generateId(),
      createdAt: new Date(),
      lastLoginAt: new Date()
    };

    const response = await fetch(`/tables/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }

    return await response.json();
  }

  async getUserByGoogleId(googleId: string): Promise<User | null> {
    try {
      const response = await fetch(`/tables/users?search=${googleId}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.data.find((user: User) => user.googleId === googleId) || null;
    } catch (error) {
      console.error('Error getting user by Google ID:', error);
      return null;
    }
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    await fetch(`/tables/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        lastLoginAt: new Date().toISOString()
      })
    });
  }

  // Методы для работы с историей промптов
  async addHistoryItem(item: Omit<PromptHistoryItem, 'id' | 'timestamp'>): Promise<PromptHistoryItem> {
    const historyItem: PromptHistoryItem = {
      ...item,
      id: this.generateId(),
      timestamp: new Date()
    };

    const response = await fetch(`/tables/prompt_history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(historyItem)
    });

    if (!response.ok) {
      throw new Error('Failed to add history item');
    }

    return await response.json();
  }

  async getUserHistory(userId: string, page: number = 1, limit: number = 50): Promise<{
    data: PromptHistoryItem[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await fetch(`/tables/prompt_history?page=${page}&limit=${limit}&search=${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get user history');
    }

    const result = await response.json();
    
    // Фильтруем по userId на клиенте (если API не поддерживает точные фильтры)
    const filteredData = result.data.filter((item: PromptHistoryItem) => item.userId === userId);
    
    return {
      data: filteredData,
      total: filteredData.length,
      page: result.page,
      limit: result.limit
    };
  }

  async deleteHistoryItem(id: string): Promise<void> {
    const response = await fetch(`/tables/prompt_history/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete history item');
    }
  }

  async clearUserHistory(userId: string): Promise<void> {
    const history = await this.getUserHistory(userId, 1, 1000);
    
    for (const item of history.data) {
      await this.deleteHistoryItem(item.id);
    }
  }

  // Методы для работы с избранным
  async addFavorite(favorite: Omit<FavoritePrompt, 'id' | 'createdAt' | 'usageCount'>): Promise<FavoritePrompt> {
    const favoriteItem: FavoritePrompt = {
      ...favorite,
      id: this.generateId(),
      createdAt: new Date(),
      usageCount: 0
    };

    const response = await fetch(`/tables/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(favoriteItem)
    });

    if (!response.ok) {
      throw new Error('Failed to add favorite');
    }

    return await response.json();
  }

  async getUserFavorites(userId: string): Promise<FavoritePrompt[]> {
    const response = await fetch(`/tables/favorites?search=${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get user favorites');
    }

    const result = await response.json();
    return result.data.filter((item: FavoritePrompt) => item.userId === userId);
  }

  async deleteFavorite(id: string): Promise<void> {
    const response = await fetch(`/tables/favorites/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete favorite');
    }
  }

  async incrementFavoriteUsage(id: string): Promise<void> {
    // Получаем текущий объект
    const response = await fetch(`/tables/favorites/${id}`);
    if (!response.ok) return;
    
    const favorite = await response.json();
    
    // Увеличиваем счетчик
    await fetch(`/tables/favorites/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        usageCount: (favorite.usageCount || 0) + 1
      })
    });
  }

  // Методы для расшаривания
  async sharePrompt(prompt: Omit<ShareablePrompt, 'id'>): Promise<ShareablePrompt> {
    const shareablePrompt: ShareablePrompt = {
      ...prompt,
      id: this.generateShareId()
    };

    const response = await fetch(`/tables/shared_prompts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(shareablePrompt)
    });

    if (!response.ok) {
      throw new Error('Failed to share prompt');
    }

    return await response.json();
  }

  async getSharedPrompt(shareId: string): Promise<ShareablePrompt | null> {
    try {
      const response = await fetch(`/tables/shared_prompts/${shareId}`);
      if (!response.ok) return null;
      
      // Увеличиваем счетчик просмотров
      const prompt = await response.json();
      await fetch(`/tables/shared_prompts/${shareId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          viewCount: (prompt.viewCount || 0) + 1
        })
      });

      return prompt;
    } catch (error) {
      console.error('Error getting shared prompt:', error);
      return null;
    }
  }

  // Поиск и фильтрация
  async searchHistory(userId: string, query: string, filters?: any): Promise<PromptHistoryItem[]> {
    let url = `/tables/prompt_history?search=${encodeURIComponent(query)}`;
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url += `&${key}=${encodeURIComponent(String(value))}`;
        }
      });
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to search history');
    }

    const result = await response.json();
    return result.data.filter((item: PromptHistoryItem) => item.userId === userId);
  }

  // Утилиты
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private generateShareId(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  // Методы для кэширования
  async getCachedData(key: string): Promise<any> {
    try {
      const data = localStorage.getItem(`cache_${key}`);
      if (!data) return null;

      const parsed = JSON.parse(data);
      const now = Date.now();
      
      // Проверяем срок действия кэша (1 час)
      if (now - parsed.timestamp > 3600000) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }

  async setCachedData(key: string, data: any): Promise<void> {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  async clearCache(): Promise<void> {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
  }
}

export const databaseService = new DatabaseService();