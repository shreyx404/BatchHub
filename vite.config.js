import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dotenv from 'dotenv';

// Load environment variables for dev server
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

function devApiPlugin() {
  return {
    name: 'dev-api-server',
    configureServer(server) {
      // Helper to execute serverless handler with polyfills
      const handleServerless = async (modulePath, req, res) => {
        const urlObj = new URL(req.url, 'http://localhost');
        const query = Object.fromEntries(urlObj.searchParams.entries());
        req.query = query;

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            req.body = body ? JSON.parse(body) : {};
          } catch {
            req.body = {};
          }

          // Polyfill Vercel/Express helper methods on res
          res.status = (code) => {
            res.statusCode = code;
            return res;
          };
          res.json = (data) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return res;
          };

          try {
            const mod = await server.ssrLoadModule(modulePath);
            const handler = mod.default;
            await handler(req, res);
          } catch (err) {
            console.error(`Dev API (${modulePath}) error:`, err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
          }
        });
      };

      // Admin API
      server.middlewares.use('/api/admin', async (req, res) => {
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          res.statusCode = 204;
          res.end();
          return;
        }
        await handleServerless('/api/admin.js', req, res);
      });

      // Calendar API
      server.middlewares.use('/api/calendar', async (req, res) => {
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.statusCode = 204;
          res.end();
          return;
        }
        await handleServerless('/api/calendar.js', req, res);
      });

      // Auto-archive Cron API
      server.middlewares.use('/api/cron/auto-archive', async (req, res) => {
        await handleServerless('/api/cron/auto-archive.js', req, res);
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [
      react(),
      tailwindcss(),
      devApiPlugin(),
    ],
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-markdown': ['react-markdown'],
            'vendor-utils': ['date-fns', 'lucide-react', 'react-hot-toast'],
          },
        },
      },
    },
  };
});


