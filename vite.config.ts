import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'dev-mock-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!req.url) return next();
          if (!req.url.startsWith('/api/quote')) return next();

          const url = new URL(req.url, 'http://localhost');
          const isbn = url.searchParams.get('isbn');

          res.statusCode = isbn ? 200 : 400;
          res.setHeader('content-type', 'application/json');
          res.end(
            JSON.stringify(
              isbn
                ? {
                    isbn,
                    title: 'Sample Title',
                    aladin: { is_buyable: false, price: 0 },
                    yes24: { is_buyable: false, price: 0 },
                    recommendation: 'none',
                  }
                : { error: 'isbn is required' }
            )
          );
        });
      },
    },
  ],
});
