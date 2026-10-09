// Minimal static file server for local preview.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json'
};

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);

  if (p === '/api/rates') {
    delete require.cache[require.resolve('../api/rates.js')];
    return require('../api/rates.js')(req, res);
  }
  if (p === '/api/analytics') {
    delete require.cache[require.resolve('../api/analytics.js')];
    return require('../api/analytics.js')(req, res);
  }
  if (p === '/api/lead') {
    delete require.cache[require.resolve('../api/lead.js')];
    return require('../api/lead.js')(req, res);
  }

  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403).end('Forbidden'); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found: ' + p); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(8077, '127.0.0.1', () => console.log('Serving on http://127.0.0.1:8077/'));
