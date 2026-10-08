'use strict';

// Local recording receiver only. The existing 3333 game server remains untouched.
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const HOST = '127.0.0.1';
const PORT = 3338;
const ORIGIN = `http://${HOST}:${PORT}`;
const UPSTREAM_PORT = 3333;
const OUTPUT_DIR = '/Users/fordeargamers/the-exoduser/output/marketing_video_20261008/natural-retake';
const MAX_BYTES = 200 * 1024 * 1024;
const SAFE_NAME = /^demo_manual_[0-9]{13}\.(webm|json)$/;

function json(res, status, body, extraHeaders = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...extraHeaders,
  });
  res.end(JSON.stringify(body));
}

async function saveRecording(req, res, url) {
  const names = url.searchParams.getAll('name');
  if (names.length !== 1 || [...url.searchParams.keys()].some(key => key !== 'name') || !SAFE_NAME.test(names[0])) {
    req.resume();
    json(res, 400, {ok: false, error: 'Expected name=demo_manual_<13-digit timestamp>.(webm|json)'});
    return;
  }
  const name = names[0];
  const contentLength = req.headers['content-length'];
  if (contentLength !== undefined && (!/^[0-9]+$/.test(contentLength) || Number(contentLength) > MAX_BYTES)) {
    req.resume();
    json(res, 413, {ok: false, error: 'Maximum recording size is 200 MiB'});
    return;
  }

  const chunks = [];
  let bytes = 0;
  let tooLarge = false;
  req.on('data', chunk => {
    bytes += chunk.length;
    if (tooLarge) return;
    if (bytes > MAX_BYTES) {
      tooLarge = true;
      chunks.length = 0;
      json(res, 413, {ok: false, error: 'Maximum recording size is 200 MiB'});
      return;
    }
    chunks.push(chunk);
  });
  req.on('error', () => { chunks.length = 0; });
  req.on('aborted', () => { chunks.length = 0; });
  req.on('end', async () => {
    if (tooLarge || req.aborted) return;
    const buffer = Buffer.concat(chunks, bytes);
    chunks.length = 0;
    if (!bytes) {
      json(res, 400, {ok: false, error: 'Empty recording body'});
      return;
    }
    try {
      if (name.endsWith('.webm')) {
        if (buffer.subarray(0, 4).toString('hex') !== '1a45dfa3') throw new Error('WebM EBML header required');
      } else {
        JSON.parse(buffer.toString('utf8'));
      }
    } catch {
      json(res, 400, {ok: false, error: 'Invalid WebM header or JSON body'});
      return;
    }

    const filePath = path.join(OUTPUT_DIR, name);
    let file;
    try {
      await fs.mkdir(OUTPUT_DIR, {recursive: true});
      file = await fs.open(filePath, 'wx', 0o600);
      await file.writeFile(buffer);
      await file.close();
      file = null;
      json(res, 201, {ok: true, name, bytes, path: filePath});
      console.log(`Saved ${name} (${bytes} bytes)`);
    } catch (error) {
      // Only remove a partial file created by this request; never remove an existing file.
      if (file) {
        await file.close().catch(() => {});
        await fs.unlink(filePath).catch(() => {});
      }
      if (!res.headersSent) json(res, error.code === 'EEXIST' ? 409 : 500, {
        ok: false,
        error: error.code === 'EEXIST' ? 'File already exists; overwrite refused' : 'Recording could not be saved',
      });
    }
  });
}

function proxyRead(req, res) {
  const upstream = http.request({
    hostname: HOST,
    port: UPSTREAM_PORT,
    method: req.method,
    path: req.url,
    headers: {...req.headers, host: `${HOST}:${UPSTREAM_PORT}`},
  }, response => {
    res.writeHead(response.statusCode, response.headers);
    response.pipe(res);
  });
  upstream.on('error', () => {
    if (!res.headersSent) json(res, 502, {ok: false, error: 'Existing game server on 127.0.0.1:3333 is unavailable'});
    else res.destroy();
  });
  res.on('close', () => upstream.destroy());
  upstream.setTimeout(120000, () => upstream.destroy(new Error('Upstream timed out')));
  upstream.end();
}

function createServer() {
  return http.createServer((req, res) => {
    if (req.headers.host !== `${HOST}:${PORT}` || (req.headers.origin && req.headers.origin !== ORIGIN)) {
      req.resume();
      json(res, 403, {ok: false, error: 'Local capture origin only'});
      return;
    }
    let url;
    try { url = new URL(req.url, ORIGIN); }
    catch { json(res, 400, {ok: false, error: 'Invalid URL'}); return; }
    if (url.origin !== ORIGIN) {
      json(res, 400, {ok: false, error: 'Local URLs only'});
      return;
    }
    if ((req.method === 'GET' || req.method === 'HEAD') && url.pathname === '/__health') {
      json(res, 200, {ok: true, origin: ORIGIN, upstream: `http://${HOST}:${UPSTREAM_PORT}`, outputDir: OUTPUT_DIR, maxBytes: MAX_BYTES});
      return;
    }
    if (req.method === 'POST' && url.pathname === '/__recording') {
      saveRecording(req, res, url).catch(() => {
        if (!res.headersSent) json(res, 500, {ok: false, error: 'Recording request failed'});
      });
      return;
    }
    if (req.method === 'GET' || req.method === 'HEAD') {
      proxyRead(req, res);
      return;
    }
    req.resume();
    json(res, 405, {ok: false, error: 'Only GET/HEAD proxy reads and manual recording POST are allowed'}, {Allow: 'GET, HEAD'});
  });
}

if (require.main === module) {
  const server = createServer();
  server.on('error', error => { console.error(`Capture receiver failed: ${error.message}`); process.exitCode = 1; });
  server.listen(PORT, HOST, () => {
    console.log(`Capture receiver ${ORIGIN}; GET/HEAD -> http://${HOST}:${UPSTREAM_PORT}`);
    console.log(`Manual recording output: ${OUTPUT_DIR}; max 200 MiB; no overwrite`);
  });
}

module.exports = {createServer};
