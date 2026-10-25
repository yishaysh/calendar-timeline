import { neon } from '@neondatabase/serverless';

function getDb(envUrl?: string) {
  const dbUrl = envUrl || process.env.DATABASE_URL;
  if (!dbUrl) return null;
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

async function ensureSettingsTable(sql: any) {
  await sql`
    CREATE TABLE IF NOT EXISTS timeline_settings (
      key VARCHAR(100) PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at BIGINT NOT NULL
    )
  `;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');

  if (req.method === 'OPTIONS') {
    return sendResponse(res, 200, { ok: true });
  }

  const sql = getDb();
  if (!sql) {
    return sendResponse(res, 200, {
      success: false,
      warning: 'DATABASE_URL is not configured. Running in offline/local mode.',
    });
  }

  try {
    await ensureSettingsTable(sql);

    // GET /api/settings?key=...
    if (req.method === 'GET') {
      const url = new URL(req.url, 'http://localhost');
      const key = url.searchParams.get('key');

      if (key) {
        const rows = await sql`
          SELECT key, value, updated_at FROM timeline_settings WHERE key = ${key} LIMIT 1
        `;
        if (rows.length > 0) {
          return sendResponse(res, 200, { success: true, setting: rows[0] });
        }
        return sendResponse(res, 200, { success: true, setting: null });
      }

      const allRows = await sql`
        SELECT key, value, updated_at FROM timeline_settings
      `;
      return sendResponse(res, 200, { success: true, settings: allRows });
    }

    // POST /api/settings (Save or update a setting)
    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          return sendResponse(res, 400, { success: false, error: 'Invalid JSON body' });
        }
      }

      const { key, value } = body || {};
      if (!key || value === undefined) {
        return sendResponse(res, 400, { success: false, error: 'Missing key or value' });
      }

      const now = Date.now();
      await sql`
        INSERT INTO timeline_settings (key, value, updated_at)
        VALUES (${key}, ${String(value)}, ${now})
        ON CONFLICT (key) DO UPDATE
        SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
      `;

      return sendResponse(res, 200, { success: true, key, value });
    }

    return sendResponse(res, 405, { success: false, error: 'Method not allowed' });
  } catch (err: any) {
    console.error('Settings API Error:', err);
    return sendResponse(res, 500, { success: false, error: err.message || 'Server error' });
  }
}
