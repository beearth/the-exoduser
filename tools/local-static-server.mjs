import { createServer } from 'node:http';
import { createReadStream, promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.wav': 'audio/wav',
  '.webm': 'video/webm',
  '.webp': 'image/webp'
};

function send(res, status, body) {
  const text = body + '\n';
  res.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(text),
    'Content-Type': 'text/plain; charset=utf-8'
  });
  res.end(text);
}

function sendJson(res, status, body) {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(text),
    'Content-Type': 'application/json; charset=utf-8'
  });
  res.end(text);
}

function toSafeSlotName(slot) {
  return String(slot || '')
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .slice(0, 120);
}

function createRootPrefix(rootDir) {
  return rootDir.endsWith(path.sep) ? rootDir : rootDir + path.sep;
}

export function createStaticServer({ rootDir = process.cwd(), host = '127.0.0.1', port = 8080 } = {}) {
  const ROOT = path.resolve(rootDir);
  const ROOT_PREFIX = createRootPrefix(ROOT);
  const SAVES_DIR = path.resolve(ROOT, 'saves');
  const SAVES_PREFIX = createRootPrefix(SAVES_DIR);

  async function resolveFile(urlPath) {
    let safePath = urlPath === '/' ? '/game.html' : urlPath;
    safePath = decodeURIComponent(safePath);
    let filePath = path.resolve(ROOT, '.' + safePath);
    if (filePath !== ROOT && !filePath.startsWith(ROOT_PREFIX)) return null;
    let st;
    try {
      st = await fs.stat(filePath);
    } catch {
      return undefined;
    }
    if (st.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      try {
        st = await fs.stat(filePath);
      } catch {
        return undefined;
      }
    }
    return { filePath, st };
  }

  function resolveSavePath(slot) {
    const safeSlot = toSafeSlotName(slot);
    if (!safeSlot) return null;
    const filePath = path.resolve(SAVES_DIR, `${safeSlot}.json`);
    if (filePath !== SAVES_DIR && !filePath.startsWith(SAVES_PREFIX)) return null;
    return filePath;
  }

  async function readJsonBody(req) {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const text = Buffer.concat(chunks).toString('utf8');
    return text ? JSON.parse(text) : {};
  }

  return createServer(async (req, res) => {
    try {
      const reqUrl = new URL(req.url || '/', `http://${host}:${port}`);
      if (reqUrl.pathname === '/1_4') {
        res.writeHead(302, { Location: '/game.html?stage=3' });
        res.end();
        return;
      }
      if (reqUrl.pathname === '/1_4_editor') {
        res.writeHead(302, { Location: '/game.html?editor=1&editorStage=3' });
        res.end();
        return;
      }

      if (req.method === 'POST' && reqUrl.pathname === '/api/save') {
        const body = await readJsonBody(req);
        const filePath = resolveSavePath(body.slot);
        if (!filePath || body.data == null) {
          sendJson(res, 400, { ok: false, error: 'invalid payload' });
          return;
        }
        await fs.mkdir(SAVES_DIR, { recursive: true });
        await fs.writeFile(filePath, JSON.stringify(body.data, null, 2), 'utf8');
        sendJson(res, 200, { ok: true });
        return;
      }

      if (req.method === 'GET' && reqUrl.pathname.startsWith('/api/load/')) {
        const filePath = resolveSavePath(reqUrl.pathname.slice('/api/load/'.length));
        if (!filePath) {
          sendJson(res, 400, { ok: false, error: 'invalid slot' });
          return;
        }
        try {
          const text = await fs.readFile(filePath, 'utf8');
          sendJson(res, 200, { ok: true, data: JSON.parse(text) });
        } catch (err) {
          if (err && err.code === 'ENOENT') sendJson(res, 200, { ok: false, error: 'not found' });
          else throw err;
        }
        return;
      }

      if (req.method === 'DELETE' && reqUrl.pathname.startsWith('/api/save/')) {
        const filePath = resolveSavePath(reqUrl.pathname.slice('/api/save/'.length));
        if (!filePath) {
          sendJson(res, 400, { ok: false, error: 'invalid slot' });
          return;
        }
        await fs.rm(filePath, { force: true });
        sendJson(res, 200, { ok: true });
        return;
      }

      const resolved = await resolveFile(reqUrl.pathname);
      if (resolved === null) {
        send(res, 403, 'Forbidden');
        return;
      }
      if (!resolved) {
        send(res, 404, 'Not Found');
        return;
      }
      const { filePath, st } = resolved;
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        'Cache-Control': 'no-store',
        'Content-Length': st.size,
        'Content-Type': MIME[ext] || 'application/octet-stream'
      });
      if (req.method === 'HEAD') {
        res.end();
        return;
      }
      const stream = createReadStream(filePath);
      stream.on('error', () => {
        if (!res.headersSent) send(res, 500, 'Read error');
        else res.destroy();
      });
      stream.pipe(res);
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      send(res, 500, msg);
    }
  });
}

const THIS_FILE = fileURLToPath(import.meta.url);
const IS_MAIN = process.argv[1] && path.resolve(process.argv[1]) === THIS_FILE;

if (IS_MAIN) {
  const ROOT = process.cwd();
  const HOST = process.env.HOST || '127.0.0.1';
  const PORT = Number(process.env.PORT || process.argv[2] || 8080);

  if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    console.error(`[serve:test] invalid port: ${PORT}`);
    process.exit(1);
  }

  const server = createStaticServer({ rootDir: ROOT, host: HOST, port: PORT });
  server.listen(PORT, HOST, () => {
    console.log(`[serve:test] root: ${ROOT}`);
    console.log(`[serve:test] url: http://${HOST}:${PORT}/`);
    console.log(`[serve:test] play 1-4: http://${HOST}:${PORT}/1_4`);
    console.log(`[serve:test] editor shortcut: http://${HOST}:${PORT}/1_4_editor`);
    console.log(`[serve:test] editor 1-4: http://${HOST}:${PORT}/game.html?editor=1&editorStage=3`);
  });

  server.on('error', err => {
    console.error(`[serve:test] ${err.message}`);
    process.exit(1);
  });
}
