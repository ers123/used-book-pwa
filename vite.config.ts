import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function devMockApiPlugin() {
  return {
    name: 'dev-mock-api',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
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
  };
}

export default defineConfig(({ command }) => ({
  plugins: [react(), ...(command === 'serve' ? [devMockApiPlugin()] : [])],
}));
