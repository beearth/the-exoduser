import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const write=fs.writeFileSync;
const original=fileURLToPath(new URL('./inventory-focus-reproduction.json',import.meta.url));
const redirected=new URL('./inventory-dom-existing-reproduction.json',import.meta.url);
fs.writeFileSync=function(path,...args) {
  const resolved=path instanceof URL?fileURLToPath(path):path;
  if(resolved===original)return write.call(fs,redirected,...args);
  throw new Error('원 후보 검사에서 승인되지 않은 쓰기 시도');
};
await import('./inventory-focus.test.mjs');
