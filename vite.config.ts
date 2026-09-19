import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { sendSMS } from './send-sms.js';

function vonageSmsPlugin(): Plugin {
  return {
    name: 'vonage-sms-plugin',
    configureServer(server) {
      server.middlewares.use('/api/send-sms', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const { to, text } = data;

            if (!to || !text) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Missing required parameters: to and text' }));
              return;
            }

            // Support multiple recipients separated by & or comma
            const phones = String(to).split(/[&,]/).map((p) => p.trim()).filter(Boolean);
            const results = [];

            for (const phone of phones) {
              const resObj = await sendSMS({ to: phone, text });
              results.push(resObj);
            }

            const allSuccessful = results.length > 0 && results.every((r) => r.success);
            res.statusCode = allSuccessful ? 200 : 207;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: allSuccessful,
              results,
              messageUUID: results[0]?.messageUUID || null
            }));
          } catch (err: any) {
            console.error('[Vite Plugin] Error in /api/send-sms handler:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message || String(err) }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), vonageSmsPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      headers: {
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      headers: {
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
      }
    }
  };
});
