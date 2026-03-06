// ?먥븧??吏?μ쓽 湲???Game Server ?먥븧??
// ?쒖닔 Node.js (?몃? ?섏〈???놁쓬)
// ?ㅽ뻾: node server.js [port]

import { createServer } from 'http';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { buildPixelLabRequest } from './src/pixellabProxy.js';
import { toSafeHeaderValue } from './src/httpHeaderSafe.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = parseInt(process.argv[2]) || process.env.PORT || 3333;
const SAVE_DIR = join(__dirname, 'saves');
const GAME_FILE = join(__dirname, 'game.html');
const SERVER_STARTED_AT = new Date().toISOString();

// saves ?붾젆?좊━ ?앹꽦
if (!existsSync(SAVE_DIR)) mkdirSync(SAVE_DIR, { recursive: true });

function loadDotEnv() {
  const envPath = join(__dirname, '.env');
  if (!existsSync(envPath)) return;
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadDotEnv();

// MIME ???
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

function noCacheHeaders(extra = {}) {
  return {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
    'Surrogate-Control': 'no-store',
    ...extra,
  };
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

function sanitizeSlot(name) {
  // 슬롯 이름 안전하게 변환
  return String(name).replace(/[^a-zA-Z0-9가-힣_\-]/g, '_').slice(0, 50);
}

const PIXELLAB_BASE_URL = process.env.PIXELLAB_BASE_URL || 'https://api.pixellab.ai';
const PIXELLAB_API_KEY = process.env.PIXELLAB_API_KEY || process.env.PIXELLAB_KEY || '';

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  if (path === '/favicon.ico') {
    res.writeHead(204, noCacheHeaders({ 'X-Server-Source': 'node-server' }));
    return res.end();
  }

  try {
    // ?먥븧??API ?붾뱶?ъ씤???먥븧??

    // GET /api/slots ???몄씠釉??щ’ 紐⑸줉
    if (path === '/api/slots' && req.method === 'GET') {
      const files = readdirSync(SAVE_DIR).filter(f => f.endsWith('.json'));
      const slots = files.map(f => {
        try {
          const data = JSON.parse(readFileSync(join(SAVE_DIR, f), 'utf8'));
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

    // GET /api/debug/source ???꾩옱 ?대뼡 ?뚯씪???쒕튃 以묒씤吏 ?뺤씤
    if (path === '/api/debug/source' && req.method === 'GET') {
      const gm = existsSync(GAME_FILE) ? statSync(GAME_FILE).mtime.toISOString() : null;
      return sendJSON(res, 200, {
        ok: true,
        server: 'node-server',
        pid: process.pid,
        startedAt: SERVER_STARTED_AT,
        cwd: process.cwd(),
        gameFile: GAME_FILE,
        gameMtime: gm,
      });
    }

    // POST /api/save ??寃뚯엫 ???
    if (path === '/api/save' && req.method === 'POST') {
      const body = await readBody(req);
      const slot = sanitizeSlot(body.slot || 'default');
      const saveData = body.data;
      if (!saveData) return sendJSON(res, 400, { ok: false, error: 'No data' });
      writeFileSync(join(SAVE_DIR, slot + '.json'), JSON.stringify(saveData, null, 2), 'utf8');
      return sendJSON(res, 200, { ok: true, slot });
    }

    // GET /api/pixellab/status - ?쎌깘?????ㅼ젙 ?곹깭 ?뺤씤
    if (path === '/api/pixellab/status' && req.method === 'GET') {
      return sendJSON(res, 200, {
        ok: true,
        configured: !!PIXELLAB_API_KEY,
        baseUrl: PIXELLAB_BASE_URL,
      });
    }

    // POST /api/pixellab/proxy - 픽샐랩 API 프록시
    if (path === '/api/pixellab/proxy' && req.method === 'POST') {
      const body = await readBody(req);
      try {
        const reqCfg = buildPixelLabRequest({
          baseUrl: PIXELLAB_BASE_URL,
          apiKey: PIXELLAB_API_KEY,
          path: body.path,
          method: body.method || 'POST',
          body: body.body,
        });
        const upstream = await fetch(reqCfg.url, reqCfg.init);
        const ct = upstream.headers.get('content-type') || 'application/json';
        const raw = Buffer.from(await upstream.arrayBuffer());
        res.writeHead(upstream.status, {
          'Content-Type': ct,
          'Access-Control-Allow-Origin': '*',
        });
        return res.end(raw);
      } catch (e) {
        return sendJSON(res, 400, { ok: false, error: String(e?.message || e) });
      }
    }

    // GET /api/load/:slot ??寃뚯엫 濡쒕뱶
    if (path.startsWith('/api/load/') && req.method === 'GET') {
      const slot = sanitizeSlot(decodeURIComponent(path.slice(10)));
      const fp = join(SAVE_DIR, slot + '.json');
      if (!existsSync(fp)) return sendJSON(res, 404, { ok: false, error: 'Not found' });
      const data = JSON.parse(readFileSync(fp, 'utf8'));
      return sendJSON(res, 200, { ok: true, data });
    }

    // DELETE /api/save/:slot ???몄씠釉???젣
    if (path.startsWith('/api/save/') && req.method === 'DELETE') {
      const slot = sanitizeSlot(decodeURIComponent(path.slice(10)));
      const fp = join(SAVE_DIR, slot + '.json');
      if (existsSync(fp)) unlinkSync(fp);
      return sendJSON(res, 200, { ok: true });
    }

    // ?먥븧???뺤쟻 ?뚯씪 ?쒕튃 ?먥븧??

    // 寃뚯엫 ?섏씠吏 (/game, /game.html)
    if (path === '/game' || path === '/game.html') {
      const html = readFileSync(GAME_FILE, 'utf8');
      const gm = existsSync(GAME_FILE) ? statSync(GAME_FILE).mtime.toISOString() : '';
      res.writeHead(200, noCacheHeaders({
        'Content-Type': 'text/html; charset=utf-8',
        'X-Server-Source': 'node-server',
        'X-Served-File': toSafeHeaderValue(GAME_FILE),
        'X-Game-Mtime': gm,
      }));
      return res.end(html);
    }

    // 猷⑦듃 ??index.html (濡쒕퉬/濡쒓렇??
    if (path === '/') {
      const html = readFileSync(join(__dirname, 'index.html'), 'utf8');
      res.writeHead(200, noCacheHeaders({
        'Content-Type': 'text/html; charset=utf-8',
        'X-Server-Source': 'node-server',
        'X-Served-File': toSafeHeaderValue(join(__dirname, 'index.html')),
      }));
      return res.end(html);
    }

    // 湲고? ?뺤쟻 ?뚯씪
    const safePath = path.replace(/\.\./g, '');
    const filePath = join(__dirname, safePath);
    if (existsSync(filePath)) {
      const ext = extname(filePath);
      const mime = MIME[ext] || 'application/octet-stream';
      const content = readFileSync(filePath);
      res.writeHead(200, noCacheHeaders({
        'Content-Type': mime,
        'X-Server-Source': 'node-server',
        'X-Served-File': toSafeHeaderValue(filePath),
      }));
      return res.end(content);
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');

  } catch (err) {
    console.error('Server error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`
?붴븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븮
??  ?뵦 吏?μ쓽 湲???Game Server ?뵦     ??
??                                     ??
??  http://localhost:${String(PORT).padEnd(5)}              ??
??                                     ??
??  API:                               ??
??  GET  /api/slots     ?몄씠釉?紐⑸줉     ??
??  POST /api/save      寃뚯엫 ???     ??
??  GET  /api/load/:id  寃뚯엫 濡쒕뱶      ??
??  DEL  /api/save/:id  ?몄씠釉???젣    ??
?싢븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븴
  `);
});

