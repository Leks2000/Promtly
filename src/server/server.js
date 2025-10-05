// server.js
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Подключение к PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ----------- ЭНДПОИНТЫ -----------

// GET /users
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /prompts
app.get('/prompts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM prompts ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
});

// GET /favorites
app.get('/favorites', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM favorites ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// GET /image-analysis
app.get('/image-analysis', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM image_analysis ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch image analysis' });
  }
});

// POST /users
app.post('/users', async (req, res) => {
  const { name, email, avatar, googleId } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, avatar, googleId) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, email, avatar, googleId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// POST /prompts
app.post('/prompts', async (req, res) => {
  const { userId, prompt, improvedPrompt } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO prompts (userId, prompt, improvedPrompt) 
       VALUES ($1, $2, $3) RETURNING *`,
      [userId, prompt, improvedPrompt]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create prompt' });
  }
});

// POST /favorites
app.post('/favorites', async (req, res) => {
  const { userId, title, content, tags, category } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO favorites (userId, title, content, tags, category) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, title, content, tags, category]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create favorite' });
  }
});

// POST /image-analysis
app.post('/image-analysis', async (req, res) => {
  const { userId, imageUrl, originalPrompt, generatedPrompts, promptType, isFavorite } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO image_analysis (userId, imageUrl, originalPrompt, generatedPrompts, promptType, isFavorite) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, imageUrl, originalPrompt, JSON.stringify(generatedPrompts), promptType, isFavorite]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create image analysis' });
  }
});

// ----------- СТАРТ СЕРВЕРА -----------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
