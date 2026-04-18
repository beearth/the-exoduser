const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// .env 로드
const _envPath = path.join(__dirname, '.env');
if (fs.existsSync(_envPath)) {
  fs.readFileSync(_envPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^\s*([^#=]+?)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  });
}

const PORT = 3333;
const ROOT = __dirname;
const SAVE_DIR = path.join(ROOT, 'saves');
const FAVICON_ICO_PATH = path.join(ROOT, 'favicon.ico');
const FAVICON_PNG_PATH = path.join(ROOT, 'img', 'icon-256.png');
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
    if (fs.existsSync(FAVICON_ICO_PATH)) {
      res.writeHead(200, { 'Content-Type': 'image/x-icon', 'Access-Control-Allow-Origin': '*' });
      return fs.createReadStream(FAVICON_ICO_PATH).pipe(res);
    }
    if (fs.existsSync(FAVICON_PNG_PATH)) {
      res.writeHead(200, { 'Content-Type': 'image/png', 'Access-Control-Allow-Origin': '*' });
      return fs.createReadStream(FAVICON_PNG_PATH).pipe(res);
    }
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
            charIdx: data.charIdx ?? 0,
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

    // ═══ 악의(mats) 공유 풀 — 서버 동기화 ═══
    const MATS_FILE = path.join(SAVE_DIR, '_sharedMats.json');
    if (pathname === '/api/mats' && req.method === 'GET') {
      try {
        if (fs.existsSync(MATS_FILE)) {
          const d = JSON.parse(fs.readFileSync(MATS_FILE, 'utf8'));
          return sendJSON(res, 200, { ok: true, mats: d.mats || 0 });
        }
      } catch (e) {}
      return sendJSON(res, 200, { ok: true, mats: 0 });
    }

    if (pathname === '/api/mats' && req.method === 'POST') {
      const body = await readBody(req);
      const n = Math.max(0, Math.min(Math.floor(+body.mats || 0), Number.MAX_SAFE_INTEGER));
      fs.writeFileSync(MATS_FILE, JSON.stringify({ mats: n, ts: Date.now() }), 'utf8');
      return sendJSON(res, 200, { ok: true, mats: n });
    }

    // ═══ GPT 이미지 생성 API ═══
    if (pathname === '/api/gpt-image' && req.method === 'POST') {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return sendJSON(res, 500, { ok: false, error: 'OPENAI_API_KEY not set' });
      const body = await readBody(req);
      const prompt = body.prompt;
      const size = body.size || '1024x1024';
      const model = body.model || 'gpt-image-1';
      const quality = body.quality || 'auto';
      const n = Math.min(body.n || 1, 4);
      if (!prompt) return sendJSON(res, 400, { ok: false, error: 'No prompt' });

      const postData = JSON.stringify({ model, prompt, n, size, quality });
      const result = await new Promise((resolve, reject) => {
        const r = https.request({
          hostname: 'api.openai.com',
          path: '/v1/images/generations',
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + apiKey,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
          }
        }, (resp) => {
          const chunks = [];
          resp.on('data', c => chunks.push(c));
          resp.on('end', () => {
            try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
            catch (e) { reject(e); }
          });
        });
        r.on('error', reject);
        r.write(postData);
        r.end();
      });

      if (result.error) return sendJSON(res, 400, { ok: false, error: result.error.message });

      // base64 이미지를 파일로 저장
      const imgDir = path.join(ROOT, 'img', 'gpt_gen');
      if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });
      const saved = [];
      for (let i = 0; i < (result.data || []).length; i++) {
        const d = result.data[i];
        const fname = `gpt_${Date.now()}_${i}.png`;
        if (d.b64_json) {
          fs.writeFileSync(path.join(imgDir, fname), Buffer.from(d.b64_json, 'base64'));
          saved.push({ file: 'img/gpt_gen/' + fname, revised_prompt: d.revised_prompt });
        } else if (d.url) {
          saved.push({ url: d.url, revised_prompt: d.revised_prompt });
        }
      }
      console.log('[GPT-IMG] Generated', saved.length, 'images for:', prompt.slice(0, 50));
      return sendJSON(res, 200, { ok: true, images: saved });
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
    else filePath = path.join(ROOT, decodeURIComponent(pathname).replace(/\.\./g, ''));

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const stat = fs.statSync(filePath);
      const ext = path.extname(filePath);
      const mime = MIME[ext] || 'application/octet-stream';
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10) || 0;
        const end = Math.min(parts[1] ? parseInt(parts[1], 10) : stat.size - 1, stat.size - 1);
        if (start >= stat.size || start > end) {
          res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` });
          return res.end();
        }
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        file.on('error', (err) => { console.error('[Stream] Range error:', err.message); if (!res.headersSent) res.writeHead(500); res.end(); });
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
        const file200 = fs.createReadStream(filePath);
        file200.on('error', (err) => { console.error('[Stream] Read error:', err.message); if (!res.headersSent) res.writeHead(500); res.end(); });
        return file200.pipe(res);
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
