const http = require('http');
const fs = require('fs');
// THE EXODUSER — Electron Wrapper
// GPU 블랙리스트 무시 + WebGPU 강제 활성화
const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');

// ═══ Steamworks 연동 (승인 후 steamworks.js 설치 시 활성화) ═══
let steamworks = null;
try {
  steamworks = require('steamworks.js');
  if (steamworks) {
    const client = steamworks.init(/* APP_ID: steam_appid.txt 참조 */);
    if (client) console.log('[STEAM] Steamworks 초기화 성공, user:', client.localplayer.getSteamId().steamId64);
  }
} catch (e) {
  // steamworks.js 미설치 시 무시 (개발 모드)
  console.log('[STEAM] Steamworks 미연동 (개발 모드)');
}

// dev vs production 경로 분기
const IS_PACKAGED = app.isPackaged;

// GPU 하드웨어 가속 강제 (RX 9070 XT 등 최신 GPU)
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-gpu');
app.commandLine.appendSwitch('enable-webgl');
app.commandLine.appendSwitch('enable-accelerated-2d-canvas');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-gpu-compositing');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder,CanvasOopRasterization,RawDraw');
// V-Sync + 프레임 리밋 완전 해제 (200fps+ 확보)
app.commandLine.appendSwitch('disable-frame-rate-limit');
app.commandLine.appendSwitch('disable-gpu-vsync');
// 렌더 간격 제한 해제
app.commandLine.appendSwitch('max-gum-fps', '0');
// DPI 스케일링 강제 1x — Windows 배율(125%,150%) 무시
app.commandLine.appendSwitch('force-device-scale-factor', '1');
if (process.platform === 'win32') app.setAppUserModelId('hell.exoduser');

// 내장 HTTP 서버 (세이브 로드 API + 정적 파일)
const PORT = 3333;
const ROOT = IS_PACKAGED
  ? path.join(process.resourcesPath, 'game')
  : path.join(__dirname, '..'); // dev: 프로젝트 루트, prod: resources/game
const FAVICON_ICO_PATH = path.join(ROOT, 'favicon.ico');
const FAVICON_PNG_PATH = path.join(ROOT, 'img', 'icon-256.png');
const APP_ICON_PATH = fs.existsSync(path.join(__dirname, 'icon.ico'))
  ? path.join(__dirname, 'icon.ico')
  : (fs.existsSync(FAVICON_ICO_PATH) ? FAVICON_ICO_PATH : (fs.existsSync(FAVICON_PNG_PATH) ? FAVICON_PNG_PATH : undefined));
const SAVE_DIR = IS_PACKAGED
  ? path.join(app.getPath('userData'), 'saves')
  : path.join(ROOT, 'saves'); // prod: 사용자 데이터 폴더 (앱 외부)
if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });

function loadDotEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, 'utf8');
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

const PIXELLAB_BASE_URL = process.env.PIXELLAB_BASE_URL || 'https://api.pixellab.ai';
const PIXELLAB_API_KEY = process.env.PIXELLAB_API_KEY || process.env.PIXELLAB_KEY || '';

function buildPixelLabRequest({ baseUrl, apiKey, path, method = 'GET', body }) {
  if (!apiKey || !String(apiKey).trim()) throw new Error('PixelLab API key is missing');
  if (!baseUrl || !String(baseUrl).trim()) throw new Error('PixelLab base url is missing');
  if (!path || typeof path !== 'string' || !path.startsWith('/')) throw new Error('path must start with /');

  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const normalizedPath = path.replace(/^\/+/, '');
  const url = new URL(normalizedPath, base).toString();
  const upperMethod = String(method || 'GET').toUpperCase();
  const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
  const init = { method: upperMethod, headers };
  if (body !== undefined && upperMethod !== 'GET' && upperMethod !== 'HEAD') {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  return { url, init };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // CORS preflight
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
    // ═══ API 엔드포인트 ═══

    // GET /api/slots — 세이브 슬롯 목록
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

    // POST /api/save — 게임 저장
    if (pathname === '/api/save' && req.method === 'POST') {
      const body = await readBody(req);
      const slot = sanitizeSlot(body.slot || 'default');
      const saveData = body.data;
      if (!saveData) return sendJSON(res, 400, { ok: false, error: 'No data' });
      fs.writeFileSync(path.join(SAVE_DIR, slot + '.json'), JSON.stringify(saveData, null, 2), 'utf8');
      return sendJSON(res, 200, { ok: true, slot });
    }

    // GET /api/pixellab/status — 픽셀랩 설정 상태 확인
    if (pathname === '/api/pixellab/status' && req.method === 'GET') {
      return sendJSON(res, 200, {
        ok: true,
        configured: !!PIXELLAB_API_KEY,
        baseUrl: PIXELLAB_BASE_URL,
      });
    }

    // POST /api/pixellab/proxy — 픽셀랩 API 프록시
    if (pathname === '/api/pixellab/proxy' && req.method === 'POST') {
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

    // GET /api/load/:slot — 게임 로드
    if (pathname.startsWith('/api/load/') && req.method === 'GET') {
      const slot = sanitizeSlot(decodeURIComponent(pathname.slice(10)));
      const fp = path.join(SAVE_DIR, slot + '.json');
      if (!fs.existsSync(fp)) return sendJSON(res, 404, { ok: false, error: 'Not found' });
      const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
      return sendJSON(res, 200, { ok: true, data });
    }

    // DELETE /api/save/:slot — 세이브 삭제
    if (pathname.startsWith('/api/save/') && req.method === 'DELETE') {
      const slot = sanitizeSlot(decodeURIComponent(pathname.slice(10)));
      const fp = path.join(SAVE_DIR, slot + '.json');
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
      return sendJSON(res, 200, { ok: true });
    }

    // 정적 파일 서빙
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

    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');

  } catch (err) {
    console.error('[Server] Error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

// Electron 윈도우 생성
let mainWindow;

function createWindow() {
  const { screen } = require('electron');
  const primary = screen.getPrimaryDisplay();
  const { width: sw, height: sh } = primary.size; // 실제 해상도 (workArea 아닌 전체)
  mainWindow = new BrowserWindow({
    width: Math.min(sw, 1280),
    height: Math.min(sh, 720),
    fullscreen: false,
    fullscreenable: true,
    simpleFullscreen: true,
    title: 'THE EXODUSER',
    icon: APP_ICON_PATH,
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    frame: false, // 타이틀바 제거 (풀스크린 게임)
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      backgroundThrottling: false,  // 백그라운드 프레임 제한 해제
      webgl: true,
      experimentalFeatures: true,   // WebGPU 활성화
    }
  });
  if (APP_ICON_PATH && typeof mainWindow.setIcon === 'function') {
    try { mainWindow.setIcon(APP_ICON_PATH); } catch (_) {}
  }

  // 내장 서버에서 일렉트론 시작
  mainWindow.loadURL(`http://localhost:${PORT}/`);

  // 메뉴바 숨기기
  mainWindow.setMenuBarVisibility(false);

  // F12: DevTools 토글
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') mainWindow.webContents.toggleDevTools();
  });
  mainWindow.on('closed', () => { mainWindow = null; });
}

// IPC: 화면 모드 전환
ipcMain.on('set-fullscreen', (e, mode) => {
  if (!mainWindow) return;
  if (mode === 'fullscreen') {
    mainWindow.setSimpleFullScreen(false);
    mainWindow.setFullScreen(true);
  } else if (mode === 'borderless') {
    mainWindow.setFullScreen(false);
    mainWindow.setSimpleFullScreen(true);
  } else {
    // windowed
    mainWindow.setFullScreen(false);
    mainWindow.setSimpleFullScreen(false);
    const { screen } = require('electron');
    const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
    mainWindow.setSize(Math.min(sw, 1280), Math.min(sh, 720));
    mainWindow.center();
  }
});

ipcMain.handle('get-display-mode', () => {
  if (!mainWindow) return 'windowed';
  if (mainWindow.isFullScreen()) return 'fullscreen';
  if (mainWindow.isSimpleFullScreen()) return 'borderless';
  return 'windowed';
});

// IPC: 해상도 변경
const RES_LIST = [
  [1280, 720],  [1366, 768],  [1600, 900],  [1920, 1080],
  [2560, 1080], [2560, 1440], [3440, 1440], [3840, 1600],
  [3840, 2160], [5120, 1440], [5120, 2160], [5120, 2880]
];

ipcMain.handle('get-resolutions', () => {
  const { screen } = require('electron');
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
  const cur = mainWindow ? mainWindow.getSize() : [sw, sh];
  return { list: RES_LIST.filter(r => r[0] <= sw && r[1] <= sh), current: cur, workArea: [sw, sh] };
});

ipcMain.on('set-resolution', (e, w, h) => {
  if (!mainWindow) return;
  // 전체화면이면 무시
  if (mainWindow.isFullScreen() || mainWindow.isSimpleFullScreen()) return;
  mainWindow.setSize(w, h);
  mainWindow.center();
});

// 앱 시작: 서버 → 윈도우 순서
app.whenReady().then(() => {
  try {
    const st = app.getGPUFeatureStatus();
    console.log('[GPU] featureStatus:', st);
    app.getGPUInfo('basic').then((info) => {
      console.log('[GPU] basicInfo:', JSON.stringify(info));
    }).catch((e) => {
      console.warn('[GPU] getGPUInfo failed:', e?.message || e);
    });
  } catch (e) {
    console.warn('[GPU] status read failed:', e?.message || e);
  }

  server.listen(PORT, () => {
    console.log(`[Server] http://localhost:${PORT} (Electron 내장)`);
    // GPU 프로세스 초기화 대기 (100ms)
    setTimeout(createWindow, 100);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      // 이미 서버가 실행 중 (node server.cjs) → 그냥 윈도우만 생성
      console.log(`[Server] 포트 ${PORT} 사용 중 → 기존 서버 사용`);
      setTimeout(createWindow, 100);
    } else {
      console.error('[Server] 서버 시작 실패:', err);
    }
  });
});

app.on('window-all-closed', () => {
  try { server.close(); } catch (e) {}
  app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
