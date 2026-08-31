import path from 'node:path';
import { createStaticServer } from './local-static-server.mjs';

const ROOT = process.cwd();
const HOST = process.env.MAP_HOST || '127.0.0.1';
const PORT = Number(process.env.MAP_PORT || process.argv[2] || 3334);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  console.error(`[serve:map] invalid port: ${PORT}`);
  process.exit(1);
}

const server = createStaticServer({
  rootDir: path.resolve(ROOT),
  host: HOST,
  port: PORT,
  mapTestMode: true
});

server.listen(PORT, HOST, () => {
  console.log(`[serve:map] root: ${ROOT}`);
  console.log(`[serve:map] hub: http://${HOST}:${PORT}/`);
  console.log(`[serve:map] direct: http://${HOST}:${PORT}/map/0 ... /map/34`);
});

server.on('error', error => {
  console.error(`[serve:map] ${error.message}`);
  process.exit(1);
});
