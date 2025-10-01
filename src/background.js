// Background script for AI Prompt Improver Chrome Extension

// Установка расширения
chrome.runtime.onInstalled.addListener((details) => {
  console.log('AI Prompt Improver installed:', details.reason);
  
  if (details.reason === 'install') {
    // Первая установка
    chrome.storage.local.set({
      'firstInstall': true,
      'installDate': Date.now()
    });
    
    // Открыть welcome страницу (опционально)
    // chrome.tabs.create({ url: 'welcome.html' });
  }
});

// Обработка сообщений от popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  switch (request.type) {
    case 'GET_AUTH_TOKEN':
      // Получение токена авторизации
      handleAuthToken(request, sendResponse);
      return true; // Асинхронный ответ
      
    case 'CLEAR_CACHE':
      // Очистка кэша
      chrome.storage.local.clear().then(() => {
        sendResponse({ success: true });
      });
      return true;
      
    case 'GET_STORAGE_USAGE':
      // Получение информации об использовании хранилища
      chrome.storage.local.getBytesInUse().then((bytes) => {
        sendResponse({ bytes });
      });
      return true;
      
    default:
      sendResponse({ error: 'Unknown message type' });
  }
});

// Функция для работы с токеном авторизации
async function handleAuthToken(request, sendResponse) {
  try {
    if (request.action === 'get') {
      const result = await chrome.storage.local.get(['google_access_token']);
      sendResponse({ 
        token: result.google_access_token,
        success: true 
      });
    } else if (request.action === 'clear') {
      await chrome.storage.local.remove(['google_access_token', 'google_id_token']);
      sendResponse({ success: true });
    }
  } catch (error) {
    console.error('Auth token error:', error);
    sendResponse({ 
      success: false, 
      error: error.message 
    });
  }
}

// Обработка обновлений расширения
chrome.runtime.onUpdateAvailable.addListener((details) => {
  console.log('Update available:', details.version);
  // Можно показать уведомление пользователю
});

// Отслеживание производительности
chrome.runtime.onStartup.addListener(() => {
  console.log('AI Prompt Improver started');
  
  // Очистка старых данных (старше 30 дней)
  cleanupOldData();
});

// Очистка старых данных
async function cleanupOldData() {
  try {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    // Здесь можно добавить логику очистки старых записей
    // из истории и кэша
    console.log('Cleanup completed');
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

// Обработка ошибок
self.addEventListener('error', (event) => {
  console.error('Background script error:', event.error);
});

// Обработка необработанных промисов
self.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

console.log('AI Prompt Improver background script loaded');