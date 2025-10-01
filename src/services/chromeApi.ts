// Chrome Extension API Service
export class ChromeApiService {
  // Storage API wrapper
  static async getStorage(key: string): Promise<any> {
    try {
      const result = await chrome.storage.local.get([key]);
      return result[key];
    } catch (error) {
      console.warn('Chrome storage not available, using localStorage', error);
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : undefined;
    }
  }

  static async setStorage(key: string, value: any): Promise<void> {
    try {
      await chrome.storage.local.set({ [key]: value });
    } catch (error) {
      console.warn('Chrome storage not available, using localStorage', error);
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  static async removeStorage(key: string): Promise<void> {
    try {
      await chrome.storage.local.remove([key]);
    } catch (error) {
      console.warn('Chrome storage not available, using localStorage', error);
      localStorage.removeItem(key);
    }
  }

  // Tabs API wrapper
  static async getCurrentTab(): Promise<chrome.tabs.Tab | null> {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      return tab || null;
    } catch (error) {
      console.warn('Chrome tabs API not available', error);
      return null;
    }
  }

  // Runtime API wrapper
  static async sendMessage(message: any): Promise<any> {
    try {
      return await chrome.runtime.sendMessage(message);
    } catch (error) {
      console.warn('Chrome runtime API not available', error);
      return null;
    }
  }

  // Check if running in Chrome extension context
  static isExtensionContext(): boolean {
    return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
  }

  // Check if APIs are available
  static checkApiAvailability() {
    const apis = {
      storage: typeof chrome !== 'undefined' && chrome.storage,
      tabs: typeof chrome !== 'undefined' && chrome.tabs,
      runtime: typeof chrome !== 'undefined' && chrome.runtime,
    };

    console.log('Chrome API Availability:', apis);
    return apis;
  }
}

// Fallback for development mode when Chrome APIs are not available
export const mockChromeApi = {
  storage: {
    local: {
      get: async (keys: string[]) => {
        const result: any = {};
        keys.forEach(key => {
          const item = localStorage.getItem(key);
          if (item) {
            result[key] = JSON.parse(item);
          }
        });
        return result;
      },
      set: async (items: any) => {
        Object.entries(items).forEach(([key, value]) => {
          localStorage.setItem(key, JSON.stringify(value));
        });
      },
      remove: async (keys: string[]) => {
        keys.forEach(key => localStorage.removeItem(key));
      },
    },
  },
};

// Initialize Chrome API fallback for development
if (!ChromeApiService.isExtensionContext() && typeof window !== 'undefined') {
  (window as any).chrome = mockChromeApi;
}