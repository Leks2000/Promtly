import { FreemiumLimits, UsageStats, User } from '../types';
import { ChromeApiService } from './chromeApi';

export interface FreemiumConfig {
  gumroadProductUrl: string;
  limits: {
    free: FreemiumLimits;
    pro: FreemiumLimits;
  };
}

export class FreemiumService {
  private static readonly FREE_LIMITS: FreemiumLimits = {
    favorites: 3,
    imageAnalysis: 3,
    historyItems: 10,
  };

  private static readonly PRO_LIMITS: FreemiumLimits = {
    favorites: -1, // Безлимитно
    imageAnalysis: -1,
    historyItems: -1,
  };

  private static readonly GUMROAD_PRODUCT_URL = 'https://gumroad.com/l/ai-prompt-improver-pro';

  // Проверка подписки пользователя
  static async checkSubscriptionStatus(user: User): Promise<'free' | 'pro'> {
    try {
      // Получаем сохраненный статус из Chrome storage
      const subscriptionData = await ChromeApiService.getStorage(`subscription_${user.id}`);
      
      if (subscriptionData) {
        const { type, expiresAt } = subscriptionData;
        
        // Проверяем не истекла ли подписка
        if (type === 'pro' && expiresAt && new Date(expiresAt) > new Date()) {
          return 'pro';
        }
      }
      
      return 'free';
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return 'free'; // По умолчанию бесплатная версия
    }
  }

  // Активация Pro подписки через Gumroad
  static async activateProSubscription(user: User, gumroadPurchaseKey: string): Promise<boolean> {
    try {
      // В реальном приложении здесь должна быть проверка через Gumroad API
      // Для демонстрации просто сохраняем статус
      
      const subscriptionData = {
        type: 'pro',
        purchaseKey: gumroadPurchaseKey,
        activatedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 год
      };

      await ChromeApiService.setStorage(`subscription_${user.id}`, subscriptionData);
      
      return true;
    } catch (error) {
      console.error('Error activating pro subscription:', error);
      return false;
    }
  }

  // Получение лимитов для текущего пользователя
  static getLimitsForUser(subscriptionType: 'free' | 'pro'): FreemiumLimits {
    return subscriptionType === 'pro' ? this.PRO_LIMITS : this.FREE_LIMITS;
  }

  // Получение статистики использования
  static async getUserUsageStats(userId: string): Promise<UsageStats> {
    try {
      const stored = await ChromeApiService.getStorage(`usage_stats_${userId}`);
      
      if (stored) {
        const lastResetDate = new Date(stored.lastResetDate);
        const now = new Date();
        
        // Сбрасываем статистику каждый день (для анализа изображений)
        if (this.shouldResetDailyStats(lastResetDate, now)) {
          const resetStats: UsageStats = {
            favoritesUsed: stored.favoritesUsed || 0,
            imageAnalysisUsed: 0, // Сбрасываем ежедневно
            historyItemsUsed: stored.historyItemsUsed || 0,
            lastResetDate: now,
          };
          
          await ChromeApiService.setStorage(`usage_stats_${userId}`, resetStats);
          return resetStats;
        }
        
        return {
          favoritesUsed: stored.favoritesUsed || 0,
          imageAnalysisUsed: stored.imageAnalysisUsed || 0,
          historyItemsUsed: stored.historyItemsUsed || 0,
          lastResetDate: lastResetDate,
        };
      }

      // Инициализируем статистику для нового пользователя
      const initialStats: UsageStats = {
        favoritesUsed: 0,
        imageAnalysisUsed: 0,
        historyItemsUsed: 0,
        lastResetDate: new Date(),
      };

      await ChromeApiService.setStorage(`usage_stats_${userId}`, initialStats);
      return initialStats;
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return {
        favoritesUsed: 0,
        imageAnalysisUsed: 0,
        historyItemsUsed: 0,
        lastResetDate: new Date(),
      };
    }
  }

  // Обновление статистики использования
  static async updateUsageStats(
    userId: string, 
    type: 'favorites' | 'imageAnalysis' | 'history', 
    increment: number = 1
  ): Promise<UsageStats> {
    try {
      const currentStats = await this.getUserUsageStats(userId);
      
      switch (type) {
        case 'favorites':
          currentStats.favoritesUsed += increment;
          break;
        case 'imageAnalysis':
          currentStats.imageAnalysisUsed += increment;
          break;
        case 'history':
          currentStats.historyItemsUsed += increment;
          break;
      }

      await ChromeApiService.setStorage(`usage_stats_${userId}`, currentStats);
      return currentStats;
    } catch (error) {
      console.error('Error updating usage stats:', error);
      throw error;
    }
  }

  // Проверка можно ли выполнить действие
  static async canPerformAction(
    userId: string,
    action: 'favorites' | 'imageAnalysis' | 'history',
    subscriptionType: 'free' | 'pro'
  ): Promise<{ canPerform: boolean; reason?: string; currentUsage?: number; limit?: number }> {
    
    // Pro пользователи могут все
    if (subscriptionType === 'pro') {
      return { canPerform: true };
    }

    try {
      const stats = await this.getUserUsageStats(userId);
      const limits = this.getLimitsForUser('free');

      let currentUsage: number;
      let limit: number;

      switch (action) {
        case 'favorites':
          currentUsage = stats.favoritesUsed;
          limit = limits.favorites;
          break;
        case 'imageAnalysis':
          currentUsage = stats.imageAnalysisUsed;
          limit = limits.imageAnalysis;
          break;
        case 'history':
          currentUsage = stats.historyItemsUsed;
          limit = limits.historyItems;
          break;
        default:
          return { canPerform: false, reason: 'Unknown action' };
      }

      const canPerform = currentUsage < limit;
      
      return {
        canPerform,
        reason: canPerform ? undefined : `Достигнут лимит для бесплатной версии: ${limit}`,
        currentUsage,
        limit,
      };
    } catch (error) {
      console.error('Error checking action permission:', error);
      return { canPerform: false, reason: 'Ошибка проверки лимитов' };
    }
  }

  // Получение URL для покупки Pro версии
  static getProPurchaseUrl(): string {
    return this.GUMROAD_PRODUCT_URL;
  }

  // Проверка нужно ли сбросить дневные лимиты
  private static shouldResetDailyStats(lastReset: Date, current: Date): boolean {
    return (
      current.getFullYear() !== lastReset.getFullYear() ||
      current.getMonth() !== lastReset.getMonth() ||
      current.getDate() !== lastReset.getDate()
    );
  }

  // Показать должна ли отображаться реклама
  static shouldShowAds(subscriptionType: 'free' | 'pro', adsEnabled: boolean): boolean {
    return subscriptionType === 'free' && adsEnabled;
  }
}

export const freemiumService = FreemiumService;