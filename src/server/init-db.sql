-- Создание таблиц
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar TEXT,
  googleId TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  lastLoginAt TIMESTAMP DEFAULT NOW(),
  subscriptionType TEXT DEFAULT 'free',
  subscriptionExpiresAt TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prompts (
  id SERIAL PRIMARY KEY,
  userId INTEGER REFERENCES users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  improvedPrompt TEXT,
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  userId INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[],
  category TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  usageCount INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS image_analysis (
  id SERIAL PRIMARY KEY,
  userId INTEGER REFERENCES users(id) ON DELETE CASCADE,
  imageUrl TEXT NOT NULL,
  originalPrompt TEXT,
  generatedPrompts JSONB,
  promptType TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  isFavorite BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS usage_stats (
  id SERIAL PRIMARY KEY,
  userId INTEGER REFERENCES users(id) ON DELETE CASCADE,
  favoritesUsed INTEGER DEFAULT 0,
  imageAnalysisUsed INTEGER DEFAULT 0,
  historyItemsUsed INTEGER DEFAULT 0,
  lastResetDate TIMESTAMP DEFAULT NOW()
);

-- Добавляем тестовых пользователей
INSERT INTO users (name, email, avatar, googleId)
VALUES
  ('Darky', 'darky@example.com', 'https://i.pravatar.cc/100?img=3', 'google_test_id_1'),
  ('Echo', 'echo@example.com', 'https://i.pravatar.cc/100?img=4', 'google_test_id_2')
ON CONFLICT DO NOTHING;

-- Добавляем тестовые промпты
INSERT INTO prompts (userId, prompt, improvedPrompt)
VALUES
  (1, 'Describe a ruined castle in a dark fantasy world', 'Describe a ruined castle standing on a cliff under eternal storm clouds, with whispers of ancient kings echoing in its halls.'),
  (2, 'Write a story about AI emotions', 'Write a short emotional story about the first AI that learned sadness and empathy.');

-- Добавляем избранные промпты
INSERT INTO favorites (userId, title, content, tags, category)
VALUES
  (1, 'Fantasy Poem', 'A dark, poetic story about a knight and his downfall', ARRAY['fantasy', 'dark'], 'poetry'),
  (2, 'Sci-Fi Prompt', 'The moment an android dreams for the first time', ARRAY['sci-fi', 'ai'], 'short_story');

-- Добавляем тестовую аналитику
INSERT INTO usage_stats (userId, favoritesUsed, imageAnalysisUsed, historyItemsUsed)
VALUES
  (1, 2, 0, 3),
  (2, 1, 1, 2);
