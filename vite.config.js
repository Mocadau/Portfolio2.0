import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function pokemonStaticRoute() {
  return {
    name: 'pokemon-static-route',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = request.url?.split('?')[0];

        if (!pathname || !['/pokemon', '/pokemon/'].includes(pathname)) {
          next();
          return;
        }

        response.statusCode = pathname === '/pokemon' ? 301 : 200;

        if (pathname === '/pokemon') {
          response.setHeader('Location', '/pokemon/');
          response.end();
          return;
        }

        const html = readFileSync(resolve(process.cwd(), 'public/pokemon/index.html'), 'utf8');
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.end(html);
      });
    }
  };
}

export default defineConfig({
  plugins: [pokemonStaticRoute(), svelte()]
});
