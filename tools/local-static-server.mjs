import { createServer } from 'node:http';
import { createReadStream, promises as fs } from 'node:fs';
import path from 'node:path';

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

const ROOT = process.cwd();
const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || process.argv[2] || 8080);
const ROOT_PREFIX = ROOT.endsWith(path.sep) ? ROOT : ROOT + path.sep;

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  console.error(`[serve:test] invalid port: ${PORT}`);
  process.exit(1);
}

function send(res, status, body) {
  const text = body + '\n';
  res.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(text),
    'Content-Type': 'text/plain; charset=utf-8'
  });
  res.end(text);
}

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

const server = createServer(async (req, res) => {
  try {
    const reqUrl = new URL(req.url || '/', `http://${HOST}:${PORT}`);
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
