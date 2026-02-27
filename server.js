// ═══ 지옥의 길 — Game Server ═══
// 순수 Node.js (외부 의존성 없음)
// 실행: node server.js [port]

import { createServer } from 'http';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = parseInt(process.argv[2]) || process.env.PORT || 3000;
const SAVE_DIR = join(__dirname, 'saves');
const GAME_FILE = join(__dirname, 'game.html');

// saves 디렉토리 생성
if (!existsSync(SAVE_DIR)) mkdirSync(SAVE_DIR, { recursive: true });

// MIME 타입
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

  try {
    // ═══ API 엔드포인트 ═══

    // GET /api/slots — 세이브 슬롯 목록
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

    // POST /api/save — 게임 저장
    if (path === '/api/save' && req.method === 'POST') {
      const body = await readBody(req);
      const slot = sanitizeSlot(body.slot || 'default');
      const saveData = body.data;
      if (!saveData) return sendJSON(res, 400, { ok: false, error: 'No data' });
      writeFileSync(join(SAVE_DIR, slot + '.json'), JSON.stringify(saveData, null, 2), 'utf8');
      return sendJSON(res, 200, { ok: true, slot });
    }

    // GET /api/load/:slot — 게임 로드
    if (path.startsWith('/api/load/') && req.method === 'GET') {
      const slot = sanitizeSlot(path.slice(10));
      const fp = join(SAVE_DIR, slot + '.json');
      if (!existsSync(fp)) return sendJSON(res, 404, { ok: false, error: 'Not found' });
      const data = JSON.parse(readFileSync(fp, 'utf8'));
      return sendJSON(res, 200, { ok: true, data });
    }

    // DELETE /api/save/:slot — 세이브 삭제
    if (path.startsWith('/api/save/') && req.method === 'DELETE') {
      const slot = sanitizeSlot(path.slice(10));
      const fp = join(SAVE_DIR, slot + '.json');
      if (existsSync(fp)) unlinkSync(fp);
      return sendJSON(res, 200, { ok: true });
    }

    // ═══ 정적 파일 서빙 ═══

    // 게임 페이지 (/game, /game.html)
    if (path === '/game' || path === '/game.html') {
      const html = readFileSync(GAME_FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    }

    // 루트 → index.html (로비/로그인)
    if (path === '/') {
      const html = readFileSync(join(__dirname, 'index.html'), 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    }

    // 기타 정적 파일
    const safePath = path.replace(/\.\./g, '');
    const filePath = join(__dirname, safePath);
    if (existsSync(filePath)) {
      const ext = extname(filePath);
      const mime = MIME[ext] || 'application/octet-stream';
      const content = readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': mime });
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
╔══════════════════════════════════════╗
║   🔥 지옥의 길 — Game Server 🔥     ║
║                                      ║
║   http://localhost:${String(PORT).padEnd(5)}              ║
║                                      ║
║   API:                               ║
║   GET  /api/slots     세이브 목록     ║
║   POST /api/save      게임 저장      ║
║   GET  /api/load/:id  게임 로드      ║
║   DEL  /api/save/:id  세이브 삭제    ║
╚══════════════════════════════════════╝
  `);
});
