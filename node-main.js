// NW.js node-main: 정적 파일 서버 + OAuth 라우트 (정식버전, port 3333)
const http = require('http');
const fs = require('fs');
const path = require('path');
const urlMod = require('url');

const LOG_FILE = path.join(__dirname, 'oauth-debug.log');
function dlog(msg) {
  try {
    const line = '[' + new Date().toISOString() + '] ' + msg + '\n';
    fs.appendFileSync(LOG_FILE, line);
  } catch (e) {}
}
dlog('=== EXODUSER RELEASE Server started ===');

const PORT = 3333;
const APP_DIR = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.mp3':  'audio/mpeg',
  '.ogg':  'audio/ogg',
  '.wav':  'audio/wav',
  '.mp4':  'video/mp4',
  '.webm': 'video/webm',
  '.gif':  'image/gif',
};

// OAuth 토큰 저장소 (메모리, 단일 세션) — Supabase: access_token + refresh_token
let _oauthTokens = null;
let _oauthError = null;

// 세이브 폴더: %APPDATA%\EXODUSER-HELL\saves\ (EA와 동일 경로 공유)
const APPDATA = process.env.APPDATA || require('os').homedir();
const SAVE_DIR = path.join(APPDATA, 'EXODUSER-HELL', 'saves');
if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });

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
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString())); } catch(e){ reject(e); } });
    req.on('error', reject);
  });
}

http.createServer(async (req, res) => {
  let pathname = urlMod.parse(req.url).pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
    return res.end();
  }

  // ── OAuth 라우트 ──
  if (pathname === '/oauth-callback') {
    dlog('oauth-callback hit: ' + req.url);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<!DOCTYPE html><meta charset=utf-8><title>EXODUSER Login</title><style>html,body{background:#0a0004;color:#fff;font-family:-apple-system,sans-serif;margin:0;height:100%;overflow:hidden}.box{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh}.s{width:48px;height:48px;border:4px solid #cc3300;border-top-color:transparent;border-radius:50%;animation:r 1s linear infinite;margin-bottom:24px}@keyframes r{to{transform:rotate(360deg)}}h2{color:#cc3300;font-size:1.5rem;margin:0 0 8px}p{color:#aaa;margin:4px 0}.ok{color:#00ff88}.err{color:#ff5577}.cd{color:#ffcc44;font-size:0.85rem;margin-top:16px}</style><div class=box><div class=s id=spin></div><h2 id=t>로그인 처리 중...</h2><p id=m>잠시만 기다려주세요</p><div class=cd id=cd></div></div><script>(function(){var h=new URLSearchParams(location.hash.slice(1));var at=h.get("access_token"),rt=h.get("refresh_token"),e=h.get("error");var payload=e?{error:e}:(at?{access_token:at,refresh_token:rt||""}:{error:"no_token"});fetch("/oauth-deposit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}).then(function(){var ti=document.getElementById("t"),me=document.getElementById("m"),sp=document.getElementById("spin"),cd=document.getElementById("cd");if(e||!at){sp.style.display="none";ti.className="err";ti.textContent="로그인 실패";me.textContent=e||"토큰 없음";return}sp.style.display="none";ti.className="ok";ti.textContent="✓ 로그인 완료";me.textContent="게임으로 돌아갑니다";var n=3;function tick(){if(n>0){cd.textContent=n+"초 후 이 창이 닫힙니다";n--;setTimeout(tick,1000)}else{try{window.close()}catch(_){}}}tick()})})()</script>');
    return;
  }

  if (pathname === '/oauth-deposit' && req.method === 'POST') {
    dlog('oauth-deposit POST received');
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const d = JSON.parse(body);
        if (d.error) { _oauthError = d.error; _oauthTokens = null; dlog('deposit error: ' + d.error); }
        else { _oauthTokens = { access_token: d.access_token, refresh_token: d.refresh_token }; _oauthError = null; dlog('deposit tokens OK at_len=' + (d.access_token ? d.access_token.length : 0)); }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{"ok":true}');
      } catch(e) { res.writeHead(400); res.end('{"ok":false}'); }
    });
    return;
  }

  if (pathname === '/oauth-poll') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    if (_oauthTokens) {
      const t = _oauthTokens; _oauthTokens = null;
      dlog('poll: tokens delivered');
      res.end(JSON.stringify({ access_token: t.access_token, refresh_token: t.refresh_token }));
    } else if (_oauthError) {
      const e = _oauthError; _oauthError = null;
      res.end(JSON.stringify({ error: e }));
    } else {
      res.end('{}');
    }
    return;
  }

  // ── 세이브 API ──
  if (pathname === '/api/slots' && req.method === 'GET') {
    const files = fs.readdirSync(SAVE_DIR).filter(f => f.endsWith('.json'));
    const slots = files.map(f => {
      try {
        const d = JSON.parse(fs.readFileSync(path.join(SAVE_DIR, f), 'utf8'));
        return { name: f.replace('.json',''), ts: d.ts||0, lv: d.player?.lv||1, stage: d.game?.stage||0, kills: d.game?.kills||0, charIdx: d.charIdx??0 };
      } catch { return null; }
    }).filter(Boolean);
    return sendJSON(res, 200, { ok: true, slots });
  }

  if (pathname === '/api/save' && req.method === 'POST') {
    const body = await readBody(req);
    const slot = sanitizeSlot(body.slot || 'default');
    if (!body.data) return sendJSON(res, 400, { ok: false, error: 'No data' });
    fs.writeFileSync(path.join(SAVE_DIR, slot + '.json'), JSON.stringify(body.data, null, 2), 'utf8');
    return sendJSON(res, 200, { ok: true, slot });
  }

  if (pathname.startsWith('/api/load/') && req.method === 'GET') {
    const slot = sanitizeSlot(decodeURIComponent(pathname.slice(10)));
    const fp = path.join(SAVE_DIR, slot + '.json');
    if (!fs.existsSync(fp)) return sendJSON(res, 404, { ok: false, error: 'Not found' });
    return sendJSON(res, 200, { ok: true, data: JSON.parse(fs.readFileSync(fp, 'utf8')) });
  }

  if (pathname.startsWith('/api/save/') && req.method === 'DELETE') {
    const slot = sanitizeSlot(decodeURIComponent(pathname.slice(10)));
    const fp = path.join(SAVE_DIR, slot + '.json');
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
    return sendJSON(res, 200, { ok: true });
  }

  // ── 정적 파일 서빙 ──
  if (pathname === '/' || pathname === '') pathname = '/index.html';
  const filePath = path.join(APP_DIR, decodeURIComponent(pathname).replace(/\.\./g, ''));

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found: ' + pathname); return; }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Access-Control-Allow-Origin': '*' });
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', () => {
  dlog('HTTP server listening on port ' + PORT);
});
