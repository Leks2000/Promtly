# 🚀 AI Prompt Improver - Полное руководство по развертыванию

Подробная инструкция по установке, настройке и развертыванию Chrome Extension для улучшения промптов с ИИ.

## 📋 Содержание

- [Системные требования](#системные-требования)
- [Быстрая установка](#быстрая-установка)
- [Детальная настройка](#детальная-настройка)
- [API ключи и настройки](#api-ключи-и-настройки)
- [Развертывание и публикация](#развертывание-и-публикация)
- [Монетизация и платежи](#монетизация-и-платежи)
- [Устранение неполадок](#устранение-неполадок)

## 🔧 Системные требования

### Обязательные
- **Node.js** >= 16.0.0
- **npm** >= 8.0.0 или **yarn** >= 1.22.0
- **Git** для клонирования репозитория
- **Chrome Browser** >= 88.0.0 для тестирования расширения

### Рекомендуемые
- **VS Code** с расширениями:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter

## ⚡ Быстрая установка

### 1. Клонирование проекта
```bash
git clone https://github.com/yourusername/ai-prompt-improver.git
cd ai-prompt-improver
```

### 2. Установка зависимостей
```bash
npm install
# или
yarn install
```

### 3. Создание конфигурации
```bash
cp .env.example .env
```

### 4. Сборка расширения
```bash
npm run build:extension
```

### 5. Загрузка в Chrome
1. Откройте `chrome://extensions/`
2. Включите "Режим разработчика"
3. Нажмите "Загрузить распакованное расширение"
4. Выберите папку `dist/`

## 🔑 API ключи и настройки

### Google OAuth (Обязательно)

#### 1. Создание проекта в Google Cloud Console
```bash
# Переходим в Google Cloud Console
https://console.cloud.google.com/
```

#### 2. Настройка OAuth 2.0
1. **Создать проект** или выбрать существующий
2. **APIs & Services** → **Credentials** 
3. **Create Credentials** → **OAuth 2.0 Client ID**
4. **Application type**: Chrome Extension
5. **Application ID**: Ваш Extension ID из Chrome

#### 3. Конфигурация .env
```bash
# Основные настройки
GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
```

### AI Providers

#### OpenAI (Рекомендуется для анализа изображений)
```bash
# Получение API ключа
https://platform.openai.com/api-keys

# .env конфигурация
OPENAI_API_KEY=sk-proj-xxx...xxx
IMAGE_ANALYSIS_PROVIDER=openai
```

**Модели для анализа изображений:**
- `gpt-4o`: Лучшее качество анализа
- `gpt-4-turbo`: Быстрая обработка  
- `gpt-4-vision-preview`: Специально для изображений

#### OpenRouter (Бесплатные модели)
```bash
# Регистрация
https://openrouter.ai/

# .env конфигурация  
OPENROUTER_API_KEY=sk-or-xxx...xxx
```

**Доступные бесплатные модели:**
- `microsoft/wizardlm-2-8x22b`: Мощная модель для промптов
- `meta-llama/llama-3.1-8b-instruct`: Быстрая обработка
- `mistralai/mixtral-8x7b-instruct`: Универсальная модель

#### HuggingFace
```bash
# Получение токена
https://huggingface.co/settings/tokens

# .env конфигурация
HUGGINGFACE_API_KEY=hf_xxx...xxx
```

#### Poe (Опционально)
```bash
# Получение токена через браузер
POETOKEN=xxx...xxx
```

### Платежные системы (Pro подписки)

#### Stripe (Рекомендуется)
```bash
# Регистрация в Stripe
https://dashboard.stripe.com/

# .env конфигурация
STRIPE_PUBLISHABLE_KEY=pk_test_xxx...xxx
STRIPE_SECRET_KEY=sk_test_xxx...xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx...xxx
```

**Настройка продуктов:**
1. **Dashboard** → **Products** → **Add Product**
2. **Pro Monthly**: $9.99/month
3. **Pro Yearly**: $99.99/year (популярный план)

#### PayPal (Альтернатива)
```bash
PAYPAL_CLIENT_ID=xxx...xxx
PAYPAL_CLIENT_SECRET=xxx...xxx
```

## 🏗 Развертывание и публикация

### 1. Подготовка к производству

#### Обновление manifest.json
```json
{
  "oauth2": {
    "client_id": "ВАШ_РЕАЛЬНЫЙ_GOOGLE_CLIENT_ID",
    "scopes": ["openid", "email", "profile"]
  },
  "externally_connectable": {
    "matches": [
      "https://вашдомен.com/*"
    ]
  }
}
```

#### Настройка иконок
```bash
# Размещаем иконки в icons/
icon16.png   (16x16)
icon32.png   (32x32) 
icon48.png   (48x48)
icon128.png  (128x128)
```

### 2. Сборка для production
```bash
# Полная сборка
npm run build:extension

# Проверка размеров
npm run analyze

# Минификация дополнительная
npm run optimize
```

### 3. Публикация в Chrome Web Store

#### Подготовка пакета
```bash
# Создание ZIP архива
cd dist/
zip -r ../ai-prompt-improver-v2.0.0.zip .
```

#### Процесс публикации
1. **Chrome Web Store Developer Dashboard**
2. **Upload New Item**
3. **Заполнение информации:**
   - Название: "AI Prompt Improver"
   - Описание: "Enhance your AI prompts with advanced analysis"
   - Категория: Productivity
   - Языки: English, Russian
4. **Загрузка скриншотов** (1280x800)
5. **Настройка цены** (бесплатно с Pro подписками)

### 4. Серверная инфраструктура

#### Backend API (Node.js/Express)
```bash
# Структура проекта
backend/
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── services/
├── package.json
└── server.js
```

#### База данных (PostgreSQL/MongoDB)
```sql
-- Пользователи
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  is_pro BOOLEAN DEFAULT FALSE,
  pro_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- История промптов
CREATE TABLE prompt_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  original_text TEXT NOT NULL,
  improved_text TEXT NOT NULL,
  prompt_type VARCHAR(50) NOT NULL,
  ai_provider VARCHAR(50) NOT NULL,
  model_used VARCHAR(100),
  tokens_used INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Анализ изображений
CREATE TABLE image_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  image_url TEXT NOT NULL,
  file_name VARCHAR(255),
  general_prompt TEXT,
  midjourney_prompt TEXT,
  stable_diffusion_prompt TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Подписки
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  plan_id VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Развертывание на сервере
```bash
# Heroku
heroku create ai-prompt-improver-api
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main

# Railway
railway login
railway init
railway add --database postgresql  
railway deploy

# DigitalOcean App Platform
doctl apps create --spec app-spec.yaml

# Vercel (для статики)
vercel --prod
```

## 💰 Монетизация и платежи

### 1. Настройка Stripe подписок

#### Создание продуктов
```bash
# Stripe CLI
stripe products create \
  --name="AI Prompt Improver Pro Monthly" \
  --description="Unlimited history and advanced features"

stripe prices create \
  --product=prod_xxx \
  --unit-amount=999 \
  --currency=usd \
  --recurring='{"interval":"month"}'
```

#### Webhook конфигурация
```javascript
// webhook.js
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  switch (event.type) {
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionCanceled(event.data.object);
      break;
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;
  }
  
  res.json({received: true});
});
```

### 2. Google Ads интеграция

#### AdSense настройка
```html
<!-- В popup.html -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxxxxxxx" crossorigin="anonymous"></script>
```

```javascript
// AdBanner.tsx
const AdBanner = () => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.log('AdSense error:', err);
    }
  }, []);

  return (
    <ins className="adsbygoogle"
         style={{display:'block'}}
         data-ad-client="ca-pub-xxxxxxxx"
         data-ad-slot="xxxxxxxxx"
         data-ad-format="auto"></ins>
  );
};
```

### 3. Аналитика и отслеживание

#### Google Analytics 4
```javascript
// analytics.js
gtag('config', 'G-XXXXXXXXXX', {
  custom_map: {
    custom_parameter_1: 'user_type',
    custom_parameter_2: 'subscription_status'
  }
});

// Отслеживание событий
gtag('event', 'subscription_purchase', {
  event_category: 'monetization',
  event_label: 'pro_monthly',
  value: 9.99
});
```

## 🔧 Устранение неполадок

### Частые проблемы

#### 1. OAuth ошибки
```
Error: redirect_uri_mismatch
```
**Решение:**
- Проверьте Extension ID в Google Console
- Убедитесь что redirect_uri правильный
- Пересоберите расширение после изменений

#### 2. API лимиты
```
Rate limit exceeded for OpenAI API
```
**Решение:**
```javascript
// Добавление retry логики
const retryApiCall = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
};
```

#### 3. Content Security Policy
```
Refused to load script due to CSP
```
**Решение в manifest.json:**
```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'; style-src 'self' 'unsafe-inline';"
  }
}
```

#### 4. Проблемы с изображениями
```
Failed to analyze image: File too large
```
**Решение:**
```javascript
// Сжатие изображений
const compressImage = (file, maxSize = 1024 * 1024) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(800 / img.width, 800 / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(resolve, 'image/jpeg', 0.8);
    };
    
    img.src = URL.createObjectURL(file);
  });
};
```

### Мониторинг и логирование

#### Sentry интеграция
```javascript
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "https://xxxxx@sentry.io/xxxxx",
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Фильтрация чувствительных данных
    if (event.exception) {
      const error = event.exception.values[0];
      if (error.value?.includes('API_KEY')) {
        return null;
      }
    }
    return event;
  }
});
```

### Производительность

#### Оптимизация размера
```bash
# Анализ бандла
npm install --save-dev webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/static/js/*.js

# Lazy loading компонентов
const ImageAnalysisTab = lazy(() => import('./tabs/ImageAnalysisTab'));
const ProSubscription = lazy(() => import('./ProSubscription'));
```

#### Кэширование
```javascript
// Service Worker для кэширования
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.open('api-cache').then(cache => {
        return cache.match(event.request).then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  }
});
```

## 🚀 Что дальше?

### Расширение функционала
1. **Мобильная версия** (PWA)
2. **Firefox Extension**  
3. **Desktop приложение** (Electron)
4. **API для разработчиков**
5. **Интеграция с IDE** (VS Code extension)

### Масштабирование бизнеса
1. **Enterprise планы** для команд
2. **White-label решения**
3. **Партнерская программа**
4. **Международная экспансия**

### Техническое развитие
1. **Микросервисная архитектура**
2. **Собственные AI модели**
3. **Edge computing** для скорости
4. **Blockchain интеграция** для NFT промптов

---

## 📞 Поддержка

- **GitHub Issues**: [Создать issue](https://github.com/yourusername/ai-prompt-improver/issues)
- **Email**: support@ai-prompt-improver.com
- **Discord**: [Сообщество разработчиков](https://discord.gg/ai-prompt-improver)
- **Telegram**: [@ai_prompt_improver](https://t.me/ai_prompt_improver)

## 📝 Лицензия

MIT License - подробности в файле [LICENSE](./LICENSE)

---

⭐ **Успехов в развертывании!** Если руководство помогло, поставьте звезду на GitHub!