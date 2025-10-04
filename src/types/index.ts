export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  googleId?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface PromptHistoryItem {
  id: string;
  userId: string;
  originalText: string;
  improvedText: string;
  improvedBy: AIProvider;
  promptType: PromptType;
  tags: string[];
  isFavorite: boolean;
  isShared: boolean;
  shareId?: string;
  timestamp: Date;
  model?: string;
  tokensUsed?: number;
}

export interface FavoritePrompt {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  createdAt: Date;
  usageCount: number;
}

export type AIProvider = 'openrouter' | 'poe' | 'huggingface';

export type PromptType = 'civitai' | 'universal' | 'textual' | 'general' | 'flux' | 'stable-diffusion';

export type Language = 'en' | 'ru';

export type Theme = 'light' | 'dark';

export type TabType = 'improve' | 'analyze' | 'history' | 'favorites' | 'settings' | 'profile';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  free: boolean;
  contextLength: number;
  description: string;
}

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey?: string;
  baseUrl?: string;
  enabled: boolean;
  rateLimit: {
    requests: number;
    window: number; // minutes
  };
}

export interface AppSettings {
  theme: Theme;
  language: Language;
  defaultProvider: AIProvider;
  defaultPromptType: PromptType;
  aiProviders: AIProviderConfig[];
  showAds: boolean;
  cacheEnabled: boolean;
  autoSave: boolean;
}

export interface SearchFilters {
  query?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  promptType?: PromptType;
  isFavorite?: boolean;
  provider?: AIProvider;
}

export interface ShareablePrompt {
  id: string;
  title: string;
  content: string;
  type: PromptType;
  tags: string[];
  createdBy: string;
  createdAt: Date;
}

export interface ImageAnalysis {
  id: string;
  userId: string;
  imageUrl: string;
  originalPrompt?: string;
  generatedPrompts: {
    general: string;
    flux: string;
    stableDiffusion: string;
  };
  promptType: 'general' | 'flux' | 'stable-diffusion';
  createdAt: Date;
  isFavorite: boolean;
}

export interface AppState {
  currentTab: TabType;
  user: User | null;
  isLoggedIn: boolean;
  history: PromptHistoryItem[];
  favorites: FavoritePrompt[];
  imageAnalyses: ImageAnalysis[];
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
  searchFilters: SearchFilters;
  selectedProvider: AIProvider;
  selectedModel: AIModel | null;
}