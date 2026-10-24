import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import handler from './api/items';

function neonApiPlugin() {
  return {
    name: 'neon-api-dev',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url?.startsWith('/api/items')) {
          return next();
        }

        const env = loadEnv('development', process.cwd(), '');
        const dbUrl = env.DATABASE_URL || process.env.DATABASE_URL;
        process.env.ADMIN_PASSWORD = env.ADMIN_PASSWORD || env.VITE_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'admin123';

        // Collect body if POST/PUT/DELETE
        if (['POST', 'PUT', 'DELETE'].includes(req.method || '')) {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk;
          });
          req.on('end', async () => {
            req.body = body;
            await handler(req, res, dbUrl);
          });
        } else {
          await handler(req, res, dbUrl);
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), neonApiPlugin()],
  server: {
    port: 3000,
    open: false,
  },
});
