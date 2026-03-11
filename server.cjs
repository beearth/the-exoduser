const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3333;
const ROOT = __dirname;
const SAVE_DIR = path.join(ROOT, 'saves');
if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });

const MIME = {
  '.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css',
  '.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg',
  '.gif':'image/gif','.svg':'image/svg+xml','.ico':'image/x-icon',
  '.wav':'audio/wav','.mp3':'audio/mpeg','.ogg':'audio/ogg',
  '.mp4':'video/mp4','.webm':'video/webm',
};

function sanitizeSlot(name) {
  return String(name).replace(/[^a-zA-Z0-9가-힣_\-]/g, '_').slice(0, 50);
}

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  if (pathname === '/favicon.ico') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*' });
    return res.end();
  }

  try {
    if (pathname === '/api/slots' && req.method === 'GET') {
      const files = fs.readdirSync(SAVE_DIR).filter(f => f.endsWith('.json'));
      const slots = files.map(f => {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(SAVE_DIR, f), 'utf8'));
          return {
            name: f.replace('.json', ''),
            ts: data.ts || 0,
            lv: data.player?.lv || 1,
            stage: data.game?.stage || 0,
            kills: data.game?.kills || 0,
          };
        } catch { return null; }
      }).filter(Boolean);
      return sendJSON(res, 200, { ok: true, slots });
    }

    if (pathname === '/api/save' && req.method === 'POST') {
      const body = await readBody(req);
      const slot = sanitizeSlot(body.slot || 'default');
      const saveData = body.data;
      if (!saveData) return sendJSON(res, 400, { ok: false, error: 'No data' });
      fs.writeFileSync(path.join(SAVE_DIR, slot + '.json'), JSON.stringify(saveData, null, 2), 'utf8');
      return sendJSON(res, 200, { ok: true, slot });
    }

    if (pathname.startsWith('/api/load/') && req.method === 'GET') {
      const slot = sanitizeSlot(decodeURIComponent(pathname.slice(10)));
      const fp = path.join(SAVE_DIR, slot + '.json');
      if (!fs.existsSync(fp)) return sendJSON(res, 404, { ok: false, error: 'Not found' });
      const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
      return sendJSON(res, 200, { ok: true, data });
    }

    if (pathname.startsWith('/api/save/') && req.method === 'DELETE') {
      const slot = sanitizeSlot(decodeURIComponent(pathname.slice(10)));
      const fp = path.join(SAVE_DIR, slot + '.json');
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
      return sendJSON(res, 200, { ok: true });
    }

    let filePath;
    if (pathname === '/') filePath = path.join(ROOT, 'index.html');
    else if (pathname === '/game' || pathname === '/game.html') filePath = path.join(ROOT, 'game.html');
    else filePath = path.join(ROOT, pathname.replace(/\.\./g, ''));

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const stat = fs.statSync(filePath);
      const ext = path.extname(filePath);
      const mime = MIME[ext] || 'application/octet-stream';
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${stat.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': mime,
        });
        return file.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': stat.size,
          'Content-Type': mime,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        });
        return fs.createReadStream(filePath).pipe(res);
      }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');

  } catch (err) {
    console.error('[Server] Error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`Server on ${PORT} (no-cache)`);
});
