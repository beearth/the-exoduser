const http = require('http');
const fs = require('fs');
// THE EXODUSER ??Electron Wrapper
// GPU 釉붾줉由ъ뒪???고쉶 + WebGPU 媛뺤젣 ?쒖꽦??
const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');

// ?먥븧???⑦궎吏?媛먯? ??dev vs production 寃쎈줈 ?먥븧??
const IS_PACKAGED = app.isPackaged;

// ?먥븧??GPU ?뚮옒洹???釉뚮씪?곗? 臾몄젣 ?꾩쟾 ?닿껐 ?먥븧??
// Chrome/Electron GPU 釉붾줉由ъ뒪??臾댁떆 (RX 9070 XT 媛숈? ?좉퇋 GPU 吏??
app.commandLine.appendSwitch('ignore-gpu-blocklist');
// WebGPU 媛뺤젣 ?쒖꽦??
app.commandLine.appendSwitch('enable-unsafe-webgpu');
// ?섎뱶?⑥뼱 媛??媛뺤젣
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('enable-hardware-overlays', 'single-fullscreen');
app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder,CanvasOopRasterization');
app.commandLine.appendSwitch('enable-webgl');
app.commandLine.appendSwitch('enable-accelerated-2d-canvas');
// ANGLE 諛깆뿏?????쒖뒪??湲곕낯媛??ъ슜
app.commandLine.appendSwitch('use-angle', 'd3d11');
app.commandLine.appendSwitch('use-gl', 'angle');
app.commandLine.appendSwitch('disable-software-rasterizer');
// GPU ?뚮뱶諛뺤뒪 鍮꾪솢?깊솕 (Windows DirectX 珥덇린??臾몄젣 諛⑹?)
app.commandLine.appendSwitch('disable-gpu-sandbox');
// V-Sync 鍮꾪솢?깊솕 (144fps+ ?덉슜)
app.commandLine.appendSwitch('disable-frame-rate-limit');
// DPI ?ㅼ??쇰쭅 媛뺤젣 1x ??Windows 諛곗쑉(125%,150%) 臾댁떆, 1CSS px = 1臾쇰━ px
app.commandLine.appendSwitch('force-device-scale-factor', '1');

// ?먥븧???댁옣 HTTP ?쒕쾭 (?몄씠釉?濡쒕뱶 API + ?뺤쟻 ?뚯씪) ?먥븧??
const PORT = 3333;
const ROOT = IS_PACKAGED
  ? path.join(process.resourcesPath, 'game')
  : path.join(__dirname, '..'); // dev: ?꾨줈?앺듃 猷⑦듃, prod: resources/game
const SAVE_DIR = IS_PACKAGED
  ? path.join(app.getPath('userData'), 'saves')
  : path.join(ROOT, 'saves'); // prod: ?ъ슜???곗씠???대뜑 (?곌린 媛??
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
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*' });
    return res.end();
  }

  try {
    // ?먥븧??API ?붾뱶?ъ씤???먥븧??

    // GET /api/slots ???몄씠釉??щ’ 紐⑸줉
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

    // POST /api/save ??寃뚯엫 ???
    if (pathname === '/api/save' && req.method === 'POST') {
      const body = await readBody(req);
      const slot = sanitizeSlot(body.slot || 'default');
      const saveData = body.data;
      if (!saveData) return sendJSON(res, 400, { ok: false, error: 'No data' });
      fs.writeFileSync(path.join(SAVE_DIR, slot + '.json'), JSON.stringify(saveData, null, 2), 'utf8');
      return sendJSON(res, 200, { ok: true, slot });
    }

    // GET /api/pixellab/status - ?쎌깘?????ㅼ젙 ?곹깭 ?뺤씤
    if (pathname === '/api/pixellab/status' && req.method === 'GET') {
      return sendJSON(res, 200, {
        ok: true,
        configured: !!PIXELLAB_API_KEY,
        baseUrl: PIXELLAB_BASE_URL,
      });
    }

    // POST /api/pixellab/proxy - 픽샐랩 API 프록시
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

    // GET /api/load/:slot ??寃뚯엫 濡쒕뱶
    if (pathname.startsWith('/api/load/') && req.method === 'GET') {
      const slot = sanitizeSlot(decodeURIComponent(pathname.slice(10)));
      const fp = path.join(SAVE_DIR, slot + '.json');
      if (!fs.existsSync(fp)) return sendJSON(res, 404, { ok: false, error: 'Not found' });
      const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
      return sendJSON(res, 200, { ok: true, data });
    }

    // DELETE /api/save/:slot ???몄씠釉???젣
    if (pathname.startsWith('/api/save/') && req.method === 'DELETE') {
      const slot = sanitizeSlot(decodeURIComponent(pathname.slice(10)));
      const fp = path.join(SAVE_DIR, slot + '.json');
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
      return sendJSON(res, 200, { ok: true });
    }

    // ?먥븧???뺤쟻 ?뚯씪 ?쒕튃 ?먥븧??
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

// ?먥븧??Electron ?덈룄???먥븧??
let mainWindow;

function createWindow() {
  const { screen } = require('electron');
  const primary = screen.getPrimaryDisplay();
  const { width: sw, height: sh } = primary.size; // ?ㅼ젣 ?댁긽??(workArea ?꾨땶 ?꾩껜)
  mainWindow = new BrowserWindow({
    width: Math.min(sw, 1280),
    height: Math.min(sh, 720),
    fullscreen: false,
    fullscreenable: true,
    simpleFullscreen: true,
    title: 'THE EXODUSER',
    icon: path.join(__dirname, 'icon.png'),
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    frame: false, // ??댄?諛??쒓굅 (??ㅽ겕由?寃뚯엫)
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      // 寃뚯엫 ?깅뒫??
      backgroundThrottling: false,  // 諛깃렇?쇱슫???꾨젅???쒗븳 ?댁젣
      webgl: true,
      experimentalFeatures: true,   // WebGPU ?쒖꽦??
    }
  });

  // ?댁옣 ?쒕쾭?먯꽌 ?명듃濡쒕????쒖옉
  mainWindow.loadURL(`http://localhost:${PORT}/`);

  // 硫붾돱諛??④린湲?
  mainWindow.setMenuBarVisibility(false);

  // ?먥븧???ㅻ낫????ESC??寃뚯엫???꾨떖, F12??DevTools ?먥븧??
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') mainWindow.webContents.toggleDevTools();
  });
  // ESC濡??꾩껜?붾㈃???由щ뒗 寃?諛⑹?: ?꾩껜?붾㈃ ?댁젣 ??利됱떆 蹂듦뎄
  mainWindow.on('closed', () => { mainWindow = null; });
}

// ?먥븧??IPC ???붾㈃ 紐⑤뱶 ?꾪솚 ?먥븧??
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

// ?먥븧??IPC ???댁긽??蹂寃??먥븧??
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
  // ?꾩껜?붾㈃?대㈃ 臾댁떆
  if (mainWindow.isFullScreen() || mainWindow.isSimpleFullScreen()) return;
  mainWindow.setSize(w, h);
  mainWindow.center();
});

// ?먥븧?????쒖옉 ???쒕쾭 ???덈룄???쒖꽌 ?먥븧??
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
    console.log(`[Server] http://localhost:${PORT} (Electron ?댁옣)`);
    // GPU ?꾨줈?몄뒪 珥덇린???湲?(100ms)
    setTimeout(createWindow, 100);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      // ?대? ?쒕쾭媛 ?ㅽ뻾 以?(node server.js) ??洹몃깷 ?덈룄?곕쭔 ?앹꽦
      console.log(`[Server] ?ы듃 ${PORT} ?ъ슜 以????몃? ?쒕쾭 ?ъ슜`);
      setTimeout(createWindow, 100);
    } else {
      console.error('[Server] ?쒕쾭 ?쒖옉 ?ㅽ뙣:', err);
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

