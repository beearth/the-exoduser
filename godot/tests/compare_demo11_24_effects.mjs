import fs from 'node:fs';import {spawnSync} from 'node:child_process';import path from 'node:path';import {fileURLToPath} from 'node:url';
const arg=n=>process.argv.slice(2).find(x=>x.startsWith(n+'='))?.slice(n.length+1);
const output=arg('--out-file'),actual=arg('--observations-file');
const run=spawnSync(process.execPath,[path.join(path.dirname(fileURLToPath(import.meta.url)),'pc_runtime_stat_refresh_oracle.mjs'),...process.argv.slice(2).filter(x=>!x.startsWith('--observations-file='))],{encoding:'utf8'});
if(run.status!==0)throw Error(run.stderr);
const p=JSON.parse(fs.readFileSync(output,'utf8'));const observations=JSON.parse(fs.readFileSync(actual,'utf8'));
function equal(a,b){if(a===b)return true;if(a&&b&&typeof a==='object'&&typeof b==='object'){const ak=Object.keys(a),bk=Object.keys(b);return ak.length===bk.length&&ak.every(k=>Object.hasOwn(b,k)&&equal(a[k],b[k]));}return false;}
p.comparisons=p.rows.map((r,i)=>({name:r.name,error:r.error,fields:Object.keys(r.p).map(field=>({field,equal:equal(r.p[field],observations[i]?.[field]),expected:r.p[field],actual:observations[i]?.[field]}))}));
p.exact_js_number=true;fs.writeFileSync(output,JSON.stringify(p));
