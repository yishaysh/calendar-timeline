import { neon } from '@neondatabase/serverless';

function getDb(envUrl?: string) {
  const dbUrl = envUrl || process.env.DATABASE_URL;
  if (!dbUrl) {
    return null;
  }
  return neon(dbUrl);
}

function sendResponse(res: any, status: number, data: any) {
  if (typeof res.status === 'function') {
    res.status(status);
    if (typeof res.json === 'function') {
      return res.json(data);
    }
  } else {
    res.statusCode = status;
  }
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(data));
}

// Convert DB snake_case row to TimelineItem
function toItem(row: any) {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    category: row.category,
    importance: Number(row.importance) || 1,
    startYear: Number(row.start_year),
    endYear: row.end_year !== null && row.end_year !== undefined ? Number(row.end_year) : undefined,
    description: row.description || '',
    imageUrl: row.image_url || undefined,
    tags: Array.isArray(row.tags) ? row.tags : (typeof row.tags === 'string' ? JSON.parse(row.tags) : []),
    links: Array.isArray(row.links) ? row.links : (typeof row.links === 'string' ? JSON.parse(row.links) : []),
    color: row.color || undefined,
    tradition: row.tradition || 'jewish',
    createdAt: Number(row.created_at) || Date.now(),
  };
}

async function ensureTable(sql: any) {
  await sql`
    CREATE TABLE IF NOT EXISTS timeline_items (
      id VARCHAR(120) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      type VARCHAR(30) NOT NULL,
      category VARCHAR(100) NOT NULL,
      importance SMALLINT NOT NULL DEFAULT 1,
      start_year INT NOT NULL,
      end_year INT,
      description TEXT DEFAULT '',
      image_url TEXT,
      tags JSONB DEFAULT '[]'::jsonb,
      links JSONB DEFAULT '[]'::jsonb,
      color VARCHAR(50),
      tradition VARCHAR(30) DEFAULT 'jewish',
      created_at BIGINT NOT NULL
    );
  `;
}

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || 'admin123';
}

function verifyAdmin(req: any): boolean {
  const adminSecret = getAdminPassword();
  if (!adminSecret) return true; // If no password configured, permit

  const clientKey =
    req.headers?.['x-admin-key'] ||
    req.headers?.['x-admin-password'] ||
    (req.headers?.['authorization']?.startsWith('Bearer ')
      ? req.headers['authorization'].slice(7).trim()
      : '');

  return Boolean(clientKey && clientKey === adminSecret);
}

export default async function handler(req: any, res: any, customDbUrl?: string) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Admin-Key, X-Admin-Password, Authorization'
  );

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') {
      return res.status(200).end();
    }
    res.statusCode = 200;
    return res.end();
  }

  // Admin verification endpoint
  if (req.method === 'GET' && (req.url?.includes('verify-admin') || req.query?.action === 'verify-admin')) {
    const isValid = verifyAdmin(req);
    return sendResponse(res, isValid ? 200 : 401, {
      success: isValid,
      isAdmin: isValid,
      message: isValid ? 'Admin verified' : 'Invalid admin credentials',
    });
  }

  // Protect state-modifying requests (POST, PUT, DELETE)
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    if (!verifyAdmin(req)) {
      return sendResponse(res, 401, {
        success: false,
        error: 'הרשאת מנהל נדרשת לביצוע שינויים (Admin authorization required). אנא הזן סיסמת מנהל תקפה.',
      });
    }
  }

  const sql = getDb(customDbUrl);
  if (!sql) {
    return sendResponse(res, 200, {
      connected: false,
      message: 'DATABASE_URL environment variable is not defined on server',
      items: [],
    });
  }

  try {
    await ensureTable(sql);

    // GET - Fetch all items
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT * FROM timeline_items ORDER BY start_year ASC
      `;
      const items = rows.map(toItem);
      return sendResponse(res, 200, {
        connected: true,
        count: items.length,
        items,
      });
    }

    // POST - Add or Upsert items (single item or array of items)
    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          body = [];
        }
      }
      const rawItems = Array.isArray(body) ? body : [body];

      for (const item of rawItems) {
        if (!item || !item.id || !item.title) continue;
        const tagsJson = JSON.stringify(item.tags || []);
        const linksJson = JSON.stringify(item.links || []);
        const endYear = item.endYear !== undefined && item.endYear !== null ? item.endYear : null;
        const importance = item.importance || 1;
        const tradition = item.tradition || 'jewish';
        const color = item.color || null;
        const imageUrl = item.imageUrl || null;
        const createdAt = item.createdAt || Date.now();

        await sql`
          INSERT INTO timeline_items (
            id, title, type, category, importance, start_year, end_year,
            description, image_url, tags, links, color, tradition, created_at
          ) VALUES (
            ${item.id}, ${item.title}, ${item.type}, ${item.category}, ${importance}, ${item.startYear}, ${endYear},
            ${item.description || ''}, ${imageUrl}, ${tagsJson}::jsonb, ${linksJson}::jsonb, ${color}, ${tradition}, ${createdAt}
          )
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            type = EXCLUDED.type,
            category = EXCLUDED.category,
            importance = EXCLUDED.importance,
            start_year = EXCLUDED.start_year,
            end_year = EXCLUDED.end_year,
            description = EXCLUDED.description,
            image_url = EXCLUDED.image_url,
            tags = EXCLUDED.tags,
            links = EXCLUDED.links,
            color = EXCLUDED.color,
            tradition = EXCLUDED.tradition;
        `;
      }

      return sendResponse(res, 200, { success: true, processed: rawItems.length });
    }

    // DELETE - Delete item by ID
    if (req.method === 'DELETE') {
      const urlObj = new URL(req.url, 'http://localhost');
      const id = req.query?.id || req.body?.id || urlObj.searchParams.get('id');
      if (!id) {
        return sendResponse(res, 400, { error: 'Missing id parameter' });
      }
      await sql`DELETE FROM timeline_items WHERE id = ${id}`;
      return sendResponse(res, 200, { success: true, deleted: id });
    }

    return sendResponse(res, 405, { error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Neon DB API Error:', error);
    return sendResponse(res, 500, {
      connected: false,
      error: error.message || 'Database query error',
    });
  }
}
