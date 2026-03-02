const http = require('http');
const fs = require('fs');
// THE EXODUSER — Electron Wrapper
// GPU 블록리스트 우회 + WebGPU 강제 활성화
const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');

// ═══ 패키징 감지 — dev vs production 경로 ═══
const IS_PACKAGED = app.isPackaged;

// ═══ GPU 플래그 — 브라우저 문제 완전 해결 ═══
// Chrome/Electron GPU 블록리스트 무시 (RX 9070 XT 같은 신규 GPU 지원)
app.commandLine.appendSwitch('ignore-gpu-blocklist');
// WebGPU 강제 활성화
app.commandLine.appendSwitch('enable-unsafe-webgpu');
// 하드웨어 가속 강제
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('enable-webgl');
app.commandLine.appendSwitch('enable-accelerated-2d-canvas');
// ANGLE 백엔드 — D3D11 직접 사용 (WARP 폴백 방지)
app.commandLine.appendSwitch('use-angle', 'gl');
// GPU 샌드박스 비활성화 (Windows DirectX 초기화 문제 방지)
app.commandLine.appendSwitch('disable-gpu-sandbox');
// V-Sync 비활성화 (144fps+ 허용)
app.commandLine.appendSwitch('disable-frame-rate-limit');

// ═══ 내장 HTTP 서버 (세이브/로드 API + 정적 파일) ═══
const PORT = 3333;
const ROOT = IS_PACKAGED
  ? path.join(process.resourcesPath, 'game')
  : path.join(__dirname, '..'); // dev: 프로젝트 루트, prod: resources/game
const SAVE_DIR = IS_PACKAGED
  ? path.join(app.getPath('userData'), 'saves')
  : path.join(ROOT, 'saves'); // prod: 사용자 데이터 폴더 (쓰기 가능)
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

    // ═══ 정적 파일 서빙 ═══
    let filePath;
    if (pathname === '/') filePath = path.join(ROOT, 'index.html');
    else if (pathname === '/game' || pathname === '/game.html') filePath = path.join(ROOT, 'game.html');
    else filePath = path.join(ROOT, pathname.replace(/\.\./g, ''));

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const mime = MIME[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime });
      return res.end(fs.readFileSync(filePath));
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

// ═══ Electron 윈도우 ═══
let mainWindow;

function createWindow() {
  const { screen } = require('electron');
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
  const winW = Math.min(sw, 1280), winH = Math.min(sh, 720);
  mainWindow = new BrowserWindow({
    width: winW,
    height: winH,
    fullscreenable: true,
    simpleFullscreen: true,
    title: 'THE EXODUSER — 지옥의 길',
    icon: path.join(__dirname, 'icon.png'),
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      // 게임 성능용
      backgroundThrottling: false,  // 백그라운드 프레임 제한 해제
    }
  });

  // 내장 서버에서 인트로부터 시작
  mainWindow.loadURL(`http://localhost:${PORT}/`);

  // 메뉴바 숨기기
  mainWindow.setMenuBarVisibility(false);

  // ═══ 키보드 — ESC는 게임에 전달, F12는 DevTools ═══
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') mainWindow.webContents.toggleDevTools();
  });
  // ESC로 전체화면이 풀리면 즉시 복구
  let _wantFS = false;
  mainWindow.on('enter-full-screen', () => { _wantFS = true; });
  mainWindow.on('leave-full-screen', () => {
    if (_wantFS) { _wantFS = false; setTimeout(() => mainWindow.setFullScreen(true), 50); }
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// ═══ IPC — 화면 모드 전환 ═══
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

// ═══ IPC — 해상도 변경 ═══
const RES_LIST = [
  [800, 600],   [1024, 768],  [1280, 720],  [1366, 768],
  [1600, 900],  [1920, 1080], [2560, 1440], [3200, 1800],
  [3840, 2160], [5120, 2880]
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

// ═══ 앱 시작 — 서버 → 윈도우 순서 ═══
app.whenReady().then(() => {
  server.listen(PORT, () => {
    console.log(`[Server] http://localhost:${PORT} (Electron 내장)`);
    // GPU 프로세스 초기화 대기 (100ms)
    setTimeout(createWindow, 100);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      // 이미 서버가 실행 중 (node server.js) → 그냥 윈도우만 생성
      console.log(`[Server] 포트 ${PORT} 사용 중 — 외부 서버 사용`);
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
