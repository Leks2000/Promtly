# 📦 Руководство по установке AI Prompt Improver

Полное руководство по установке и настройке Chrome Extension для улучшения промптов с помощью ИИ.

## 🎯 Системные требования

### Браузер
- **Chrome** 88+ (рекомендуется Chrome 120+)
- **Edge** 88+ (на базе Chromium)
- **Opera** 74+ (на базе Chromium)

### Разработка
- **Node.js** 18+ и npm/yarn
- **Git** для клонирования репозитория

## 🚀 Быстрая установка (для пользователей)

### Вариант 1: Загрузка готового расширения

1. **Скачайте готовую сборку**
   ```bash
   # Скачайте файл ai-prompt-improver-extension.zip
   # Или клонируйте репозиторий и выполните сборку
   ```

2. **Установка в Chrome**
   - Откройте Chrome и перейдите на `chrome://extensions/`
   - Включите режим разработчика (Developer mode)
   - Нажмите "Загрузить распакованное расширение" (Load unpacked)
   - Выберите папку с расширением

3. **Первый запуск**
   - Нажмите на иконку расширения в панели инструментов
   - Войдите через Google аккаунт
   - Настройте API ключи для ИИ провайдеров

### Вариант 2: Установка из Chrome Web Store

> 🚧 В разработке - расширение будет опубликовано в Chrome Web Store после завершения тестирования

## 🛠 Установка для разработчиков

### Шаг 1: Клонирование репозитория

```bash
# Клонируйте репозиторий
git clone https://github.com/your-username/ai-prompt-improver.git
cd ai-prompt-improver

# Или скачайте ZIP архив и распакуйте
```

### Шаг 2: Установка зависимостей

```bash
# Установка npm пакетов
npm install

# Или с yarn
yarn install
```

### Шаг 3: Конфигурация API

#### 3.1 Google OAuth настройка

1. **Перейдите в Google Cloud Console**
   - Откройте [Google Cloud Console](https://console.cloud.google.com/)
   - Создайте новый проект или выберите существующий

2. **Настройте OAuth 2.0**
   ```bash
   # В Google Cloud Console:
   # 1. APIs & Services → Credentials
   # 2. Create Credentials → OAuth 2.0 Client ID
   # 3. Application type: Chrome Extension
   # 4. Добавьте Application ID вашего расширения
   ```

3. **Обновите конфигурацию**
   ```typescript
   // src/services/auth.ts
   private clientId = 'your-google-client-id-here';
   ```

#### 3.2 API ключи для ИИ провайдеров

Создайте файл `.env` в корне проекта:

```bash
# .env файл
GOOGLE_CLIENT_ID=your_google_client_id
OPENROUTER_API_KEY=your_openrouter_key
HUGGINGFACE_API_KEY=your_huggingface_key
POE_TOKEN=your_poe_token
GOOGLE_ADS_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxxx
```

**Получение API ключей:**

1. **OpenRouter** (бесплатные модели)
   - Регистрация: [openrouter.ai](https://openrouter.ai)
   - Получите API key в личном кабинете
   - Бесплатные модели: WizardLM-2, Mixtral, LLaMA 3.1

2. **HuggingFace** (бесплатные endpoints)
   - Регистрация: [huggingface.co](https://huggingface.co)
   - Settings → Access Tokens → New token
   - Бесплатные модели: Mixtral, DialoGPT

3. **Poe API** (опционально)
   - Более сложная настройка, требует токен сессии
   - Бесплатные лимиты для Claude, GPT, Gemini

### Шаг 4: Сборка расширения

```bash
# Сборка для разработки
npm run dev

# Сборка для продакшн (Chrome Extension)
npm run build:extension

# Сборка с наблюдением за изменениями
npm run dev -- --watch
```

### Шаг 5: Загрузка в браузер

1. **Откройте Chrome Extensions**
   ```
   chrome://extensions/
   ```

2. **Включите Developer mode**
   - Переключите тумблер в правом верхнем углу

3. **Загрузите расширение**
   - Нажмите "Load unpacked"
   - Выберите папку `dist/` в проекте

## ⚙️ Настройка и конфигурация

### Настройка базы данных

Расширение использует встроенную Table API для хранения данных:

```bash
# Автоматическая инициализация таблиц при первом запуске
# - users (пользователи)
# - prompt_history (история промптов)  
# - favorites (избранное)
# - shared_prompts (расшаренные промпты)
```

### Настройка Google Ads (для монетизации)

1. **Подключите Google AdSense**
   ```typescript
   // src/components/AdBanner.tsx
   // Замените на ваш publisher ID
   data-ad-client="ca-pub-YOUR-PUBLISHER-ID"
   ```

2. **Настройте рекламные блоки**
   ```typescript
   // Создайте ad unit в AdSense консоли
   data-ad-slot="YOUR-AD-SLOT-ID"
   ```

### Настройка аналитики

```typescript
// Добавьте Google Analytics (опционально)
// В manifest.json добавьте разрешения для analytics
```

## 🧪 Тестирование

### Локальное тестирование

```bash
# Запуск в режиме разработки
npm run dev

# Открыть в браузере для тестирования
open http://localhost:5173
```

### Тестирование как расширение

```bash
# Сборка расширения
npm run build:extension

# Загрузите dist/ в chrome://extensions/
```

### Тестирование функций

1. **Авторизация Google**
   - Проверьте вход и выход
   - Проверьте сохранение сессии

2. **ИИ провайдеры**
   - Протестируйте каждый провайдер
   - Проверьте разные типы промптов

3. **Функции приложения**
   - Улучшение промптов
   - Сохранение в избранное
   - Поиск и фильтры
   - Расшаривание промптов

## 🎨 Кастомизация

### Изменение темы

```typescript
// src/tailwind.config.js
// Добавьте свои цвета
colors: {
  primary: {
    // Ваша цветовая схема
  }
}
```

### Добавление новых ИИ провайдеров

```typescript
// src/services/aiProviders.ts
// Добавьте новый класс провайдера
class YourAIClient {
  async improvePrompt(prompt: string): Promise<AIResponse> {
    // Ваша реализация
  }
}
```

### Изменение макета

```typescript
// src/components/Layout.tsx
// Измените расположение компонентов
```

## 🚀 Развертывание в продакшн

### Подготовка к публикации

1. **Обновите manifest.json**
   ```json
   {
     "version": "1.0.0",
     "name": "AI Prompt Improver",
     "description": "Улучшение промптов с помощью ИИ"
   }
   ```

2. **Создайте иконки**
   ```bash
   # Добавьте иконки в папку icons/
   icons/
   ├── icon16.png
   ├── icon32.png  
   ├── icon48.png
   └── icon128.png
   ```

3. **Соберите финальную версию**
   ```bash
   npm run build:extension
   ```

### Публикация в Chrome Web Store

1. **Подготовьте материалы**
   - Скриншоты интерфейса
   - Описание на русском и английском
   - Политика конфиденциальности

2. **Загрузите расширение**
   - Войдите в [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
   - Создайте новый элемент
   - Загрузите ZIP архив с расширением

3. **Заполните метаданные**
   - Название и описание
   - Категории и теги
   - Скриншоты и промо изображения

## 🐛 Устранение неполадок

### Частые проблемы

#### 1. Расширение не загружается
```bash
# Проверьте манифест
cat dist/manifest.json

# Проверьте ошибки в консоли
# chrome://extensions/ → Inspect views: background page
```

#### 2. Google OAuth не работает
```typescript
// Проверьте Client ID в auth.ts
// Проверьте redirect URI в Google Console
```

#### 3. ИИ API не отвечает
```typescript
// Проверьте API ключи
// Проверьте CORS настройки
// Проверьте квоты и лимиты
```

#### 4. База данных не работает
```typescript
// Проверьте инициализацию таблиц
// Проверьте разрешения storage в manifest
```

### Логи и отладка

```bash
# Включите подробные логи
localStorage.setItem('debug', 'true')

# Проверьте состояние приложения
console.log(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)
```

## 📋 Контрольный список установки

- [ ] Node.js 18+ установлен
- [ ] Репозиторий клонирован
- [ ] Зависимости установлены (`npm install`)
- [ ] Google OAuth настроен
- [ ] API ключи для ИИ настроены
- [ ] Расширение собрано (`npm run build:extension`)
- [ ] Расширение загружено в Chrome
- [ ] Авторизация Google работает
- [ ] ИИ провайдеры отвечают
- [ ] Все основные функции работают
- [ ] Google Ads настроены (опционально)

## 🆘 Поддержка

### Документация
- [README.md](./README.md) - Основная документация
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Руководство разработчика

### Связь с разработчиками
- **GitHub Issues**: [Создать issue](https://github.com/your-username/ai-prompt-improver/issues)
- **Email**: support@ai-prompt-improver.com
- **Discord**: [Присоединиться к сообществу](#)

### Часто задаваемые вопросы

**Q: Можно ли использовать без API ключей?**
A: Некоторые функции требуют API ключи, но базовый функционал работает без них.

**Q: Безопасно ли вводить API ключи?**
A: Да, все данные хранятся локально в браузере и не передаются третьим лицам.

**Q: Поддерживаются ли другие браузеры?**
A: Основная поддержка - Chrome и Chromium браузеры. Firefox поддержка в планах.

**Q: Можно ли использовать оффлайн?**
A: Базовый интерфейс работает оффлайн, но ИИ функции требуют интернет.

---

🎉 **Поздравляем!** Теперь у вас установлен и настроен AI Prompt Improver. Наслаждайтесь улучшением ваших промптов с помощью ИИ!