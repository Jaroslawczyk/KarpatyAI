import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');
const prefix = '/course/';
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};
// The test server deliberately mounts under a subdirectory like GitHub Pages.
// Тестовый сервер намеренно использует подпапку, как GitHub Pages.
http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      if (!url.pathname.startsWith(prefix)) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const relative = decodeURIComponent(url.pathname.slice(prefix.length)) || 'index.html';
      const file = path.resolve(root, relative);
      if (file !== root && !file.startsWith(root + path.sep)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      const body = await fs.readFile(file);
      res.writeHead(200, {
        'Content-Type': types[path.extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  })
  .listen(4173, '127.0.0.1', () =>
    process.stdout.write('Production preview: http://127.0.0.1:4173/course/\n'),
  );
