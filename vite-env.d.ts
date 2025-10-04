// vite-env.d.ts

/// <reference types="vite/client" />

interface ImportMetaEnv {
  // === Настройки OAuth и Базы Данных ===
  
  // Google Client ID (самый важный для авторизации)
  readonly VITE_OAUTH_CLIENT_ID: string; 
  
  // Supabase ключи
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_KEY: string;

  // === Настройки Приложения/Расширения ===
  
  // Имя и Версия приложения
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;

  // ID Расширения (используется для подстановки в манифест)
  readonly VITE_EXTENSION_ID: string;
  
  // Версия Манифеста (хотя это обычно константа, лучше добавить)
  readonly VITE_MANIFEST_VERSION: string;
  
  // Другие переменные, если они используются в коде, например, NODE_ENV
  readonly NODE_ENV: 'development' | 'production'; 
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}