// Simulates GitHub Pages: static files only, served from a /repo-name/ subpath,
// with no serverless runtime. Use this to catch subdirectory and API-fallback
// problems before pushing.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = '/kiwi-financial-site';
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.txt': 'text/plain', '.xml': 'application/xml'
};

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);

  if (!p.startsWith(BASE)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end(`Not found (Pages serves under ${BASE}/)`);
  }
  p = p.slice(BASE.length) || '/';
  if (p.endsWith('/')) p += 'index.html';

  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403).end('Forbidden'); return; }

  fs.readFile(file, (err, data) => {
    if (err) {
      // GitHub Pages has no serverless runtime - /api/* is simply missing.
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not found: ' + p);
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(8099, '127.0.0.1', () => console.log(`Pages simulation: http://127.0.0.1:8099${BASE}/`));
