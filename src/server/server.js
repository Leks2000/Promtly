// server.js
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['chrome-extension://ghgmejponghmfeajohdkbknliomndfbh'],
  credentials: true
}));
app.use(express.json());

// Подключение к PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 🔹 Утилита для выполнения запросов
async function queryDB(sql, params = []) {
  try {
    const result = await pool.query(sql, params);
    return result.rows;
  } catch (err) {
    console.error('DB Error:', err);
    throw err;
  }
}

// ======================================================
//                    USERS
// ======================================================
app.post('/table/users', async (req, res) => {
  const { id, googleId, name, email, avatar, createdAt, lastLoginAt, subscriptionType, subscriptionExpiresAt } = req.body;

  try {
    const result = await queryDB(
      `INSERT INTO users 
        (id, "googleId", name, email, avatar, "createdAt", "lastLoginAt", "subscriptionType", "subscriptionExpiresAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [id, googleId, name, email, avatar, createdAt, lastLoginAt, subscriptionType, subscriptionExpiresAt]
    );
    res.json(result[0]);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.get('/table/users', async (req, res) => {
    try {
      const search = req.query.search;
  
      if (search) {
        // Ищем по googleId (или по email, если нужно)
        const result = await pool.query(
          'SELECT * FROM users WHERE "googleId" = $1 OR email = $1',
          [search]
        );
  
        res.json({ data: result.rows });
        return;
      }
  
      // Если без поиска — возвращаем всех
      const result = await pool.query('SELECT * FROM users ORDER BY id');
      res.json({ data: result.rows });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });
  
  app.patch('/table/users/:id', async (req, res) => {
    const { id } = req.params;
    const fields = req.body;
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map((k, i) => `${k}=$${i + 1}`).join(', ');
    try {
      const result = await queryDB(
        `UPDATE users SET ${setClause} WHERE id=$${keys.length+1} RETURNING *`,
        values
      );
      res.json(result[0]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update user' });
    }
  });
  
  // ======================================================
  //                PROMPT HISTORY
  // ======================================================
  app.get('/table/prompt_history', async (req, res) => {
    const { search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
  
    try {
      let sql = 'SELECT * FROM prompt_history';
      let params = [];
  
      if (search) {
        sql += ' WHERE userId = $1';
        params.push(search);
      }
  
      sql += ' ORDER BY timestamp DESC LIMIT $2 OFFSET $3';
      params.push(limit);
      params.push(offset);
  
      const result = await queryDB(sql, params);
      res.json({ data: result, page: Number(page), limit: Number(limit) });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch prompt history' });
    }
  });
  
  app.post('/table/prompt_history', async (req, res) => {
    const item = req.body;
    try {
      const result = await queryDB(
        `INSERT INTO prompt_history 
        (id, userId, originalText, improvedText, improvedBy, promptType, tags, 
         isFavorite, isShared, shareId, timestamp, model, tokensUsed)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
        [
          item.id,
          item.userId,
          item.originalText,
          item.improvedText,
          item.improvedBy,
          item.promptType,
          JSON.stringify(item.tags || []),
          item.isFavorite,
          item.isShared,
          item.shareId,
          item.timestamp,
          item.model,
          item.tokensUsed
        ]
      );
      res.json(result[0]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create history item' });
    }
  });
  
  app.delete('/table/prompt_history/:id', async (req, res) => {
    try {
      await queryDB('DELETE FROM prompt_history WHERE id=$1', [req.params.id]);
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: 'Failed to delete history item' });
    }
  });

  app.post('/table/prompt_history', async (req, res) => {
    const item = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO prompt_history 
          (id, "userId", "originalText", "improvedText", "improvedBy", "promptType", tags, "isFavorite", "isShared", "shareId", timestamp, model, "tokensUsed")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
        [
          item.id,
          item.userId,
          item.originalText,
          item.improvedText,
          item.improvedBy,
          item.promptType,
          JSON.stringify(item.tags || []),
          item.isFavorite,
          item.isShared,
          item.shareId,
          item.timestamp,
          item.model,
          item.tokensUsed
        ]
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error creating history item:', err);
      res.status(500).json({ error: 'Failed to create history item' });
    }
  });
 
  // ======================================================
  //                 FAVORITES
  // ======================================================
  app.get('/table/favorites', async (req, res) => {
    const { search } = req.query;
    try {
      let result;
      if (search) {
        result = await queryDB('SELECT * FROM favorites WHERE userId=$1', [search]);
      } else {
        result = await queryDB('SELECT * FROM favorites ORDER BY createdAt DESC');
      }
      res.json({ data: result });
    } catch {
      res.status(500).json({ error: 'Failed to fetch favorites' });
    }
  });
  
  app.post('/table/favorites', async (req, res) => {
    const f = req.body;
    try {
      const result = await queryDB(
        `INSERT INTO favorites (id, userId, title, content, tags, category, createdAt, usageCount)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [
          f.id,
          f.userId,
          f.title,
          f.content,
          JSON.stringify(f.tags || []),
          f.category,
          f.createdAt,
          f.usageCount
        ]
      );
      res.json(result[0]);
    } catch {
      res.status(500).json({ error: 'Failed to create favorite' });
    }
  });
  
  app.patch('/table/favorites/:id', async (req, res) => {
    const { id } = req.params;
    const fields = req.body;
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map((k, i) => `${k}=$${i + 1}`).join(', ');
    try {
      const result = await queryDB(
        `UPDATE favorites SET ${setClause} WHERE id='${id}' RETURNING *`,
        values
      );
      res.json(result[0]);
    } catch {
      res.status(500).json({ error: 'Failed to update favorite' });
    }
  });
  
  app.delete('/table/favorites/:id', async (req, res) => {
    try {
      await queryDB('DELETE FROM favorites WHERE id=$1', [req.params.id]);
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: 'Failed to delete favorite' });
    }
  });

  app.post('/table/favorites', async (req, res) => {
    const f = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO favorites (id, "userId", title, content, tags, category, "createdAt", "usageCount")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [
          f.id,
          f.userId,
          f.title,
          f.content,
          JSON.stringify(f.tags || []),
          f.category,
          f.createdAt,
          f.usageCount
        ]
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error creating favorite:', err);
      res.status(500).json({ error: 'Failed to create favorite' });
    }
  });

  // ======================================================
  //                 SHARED PROMPTS
  // ======================================================
  app.get('/table/shared_prompts/:id', async (req, res) => {
    try {
      const result = await queryDB('SELECT * FROM shared_prompts WHERE id=$1', [req.params.id]);
      if (!result.length) return res.status(404).json({ error: 'Prompt not found' });
      res.json(result[0]);
    } catch {
      res.status(500).json({ error: 'Failed to fetch shared prompt' });
    }
  });
  
  app.post('/table/shared_prompts', async (req, res) => {
    const p = req.body;
    try {
      const result = await queryDB(
        `INSERT INTO shared_prompts (id, title, content, type, tags, createdBy, createdAt, viewCount)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [
          p.id,
          p.title,
          p.content,
          p.type,
          JSON.stringify(p.tags || []),
          p.createdBy,
          p.createdAt,
          p.viewCount || 0
        ]
      );
      res.json(result[0]);
    } catch {
      res.status(500).json({ error: 'Failed to create shared prompt' });
    }
  });
  
  app.patch('/table/shared_prompts/:id', async (req, res) => {
    const { id } = req.params;
    const fields = req.body;
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map((k, i) => `${k}=$${i + 1}`).join(', ');
    try {
      const result = await queryDB(
        `UPDATE shared_prompts SET ${setClause} WHERE id='${id}' RETURNING *`,
        values
      );
      res.json(result[0]);
    } catch {
      res.status(500).json({ error: 'Failed to update shared prompt' });
    }
  });
  


  // ======================================================
  //                 TABLE SCHEMA
  // ======================================================
  app.post('/table-schema-update', async (req, res) => {
    const { name, fields } = req.body;
  
    try {
      const columns = fields.map(f => {
        let type;
        switch(f.type) {
          case 'text': 
          case 'rich_text': 
            type = 'TEXT'; 
            break;
          case 'number': 
            type = 'INTEGER'; 
            break;
          case 'bool': 
            type = 'BOOLEAN'; 
            break;
          case 'datetime': 
            type = 'TIMESTAMP'; 
            break;
          case 'array': 
            type = 'TEXT[]'; 
            break;
          default: 
            type = 'TEXT';
        }
        return `"${f.name}" ${type}`;
      }).join(', ');
  
      const query = `CREATE TABLE IF NOT EXISTS "${name}" (${columns});`;
      await pool.query(query);
  
      res.json({ success: true });
    } catch (error) {
      console.error('Error creating table:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ======================================================
  //                 SERVER START
  // ======================================================
  app.get('/', (req, res) => res.send('✅ API is running.'));
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));