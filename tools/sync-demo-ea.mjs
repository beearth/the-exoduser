// DEMO/EA를 main 체크아웃의 실행 파일 전체로 맞춘다. 기준 목록 = build-nwjs.mjs(Steam 빌드)와 같은 파일·폴더, Git 추적 파일만.
// 덮어쓰는 파일은 먼저 백업, 삭제는 하지 않는다. 사용: node tools/sync-demo-ea.mjs [--dry] (G:/exoduser에서, 추적 파일 수정이 없을 때만)
import fs from 'node:fs';
import path from 'node:path';
import cp from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SRC=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const DESTS={demo:'G:/exoduser-DEMO',ea:'G:/exoduser-ea'};
const STAMP=new Date().toISOString().replace(/[-:]/g,'').replace('T','-').slice(0,15);
const BACKUP='I:/EXODUSER-Storage/backup/demo-ea-sync-'+STAMP;
const dry=process.argv.includes('--dry');

const build=fs.readFileSync(`${SRC}/build-nwjs.mjs`,'utf8');
const files=[...build.slice(build.indexOf('const FILES = ['),build.indexOf('];',build.indexOf('const FILES = ['))).matchAll(/'([^']+)'/g)].map(m=>m[1]);
const dirs=[...build.slice(build.indexOf('const DIRS = ['),build.indexOf('];',build.indexOf('const DIRS = ['))).matchAll(/'([^']+)'/g)].map(m=>m[1]);
// 실행본마다 따로 쓰는 파일은 건드리지 않는다. 데모용 html은 아래에서 sed로 만든다.
const keep=new Set(['build-target.js','package.json','indexdemo.html','gamedemo.html','index.html','game.html']);

const dirty=cp.execFileSync('git',['-C',SRC,'status','--porcelain','--untracked-files=no'],{encoding:'utf8'}).trim();
if(dirty)throw Error('main 추적 파일에 수정이 있다:\n'+dirty);
const tracked=cp.execFileSync('git',['-C',SRC,'ls-files','-z'],{encoding:'utf8',maxBuffer:1<<28}).split('\0').filter(Boolean);
const fileSet=new Set(files);
const list=tracked.filter(p=>!keep.has(p)&&(fileSet.has(p)||/^lang_[^/]+\.js$/.test(p)||/^atlas_[^/]+$/.test(p)||p==='node-main.js'||dirs.some(d=>p.startsWith(d+'/'))));
const missing=files.filter(f=>!keep.has(f)&&f!=='credits.html'&&!tracked.includes(f));
if(missing.length)throw Error('빌드 목록 파일이 main에 없다: '+missing.join(', '));

function same(a,b){
  const sa=fs.statSync(a),sb=fs.statSync(b);if(sa.size!==sb.size)return false;
  if(sa.size>64<<20)return sa.mtimeMs<=sb.mtimeMs; // 큰 영상은 크기+시각으로만
  return fs.readFileSync(a).equals(fs.readFileSync(b));
}
function put(name,dest,rel,data){
  const to=path.join(dest,rel);
  if(fs.existsSync(to)){
    if(data!==undefined?fs.readFileSync(to).equals(Buffer.from(data)):same(path.join(SRC,rel),to))return 'same';
    if(!dry){const bk=path.join(BACKUP,name,rel);fs.mkdirSync(path.dirname(bk),{recursive:true});fs.copyFileSync(to,bk);}
    if(!dry){data!==undefined?fs.writeFileSync(to,data):fs.copyFileSync(path.join(SRC,rel),to);}
    return 'updated';
  }
  if(!dry){fs.mkdirSync(path.dirname(to),{recursive:true});data!==undefined?fs.writeFileSync(to,data):fs.copyFileSync(path.join(SRC,rel),to);}
  return 'added';
}
function sub(text,from,to,label){const n=text.split(from).length-1;if(!n)throw Error('치환 대상 없음: '+label);return text.split(from).join(to);}

const game=fs.readFileSync(`${SRC}/game.html`,'utf8'),index=fs.readFileSync(`${SRC}/index.html`,'utf8');
let demoGame=sub(game,"const _BIC=location.search.includes('bic')","const _BIC=true",'_BIC');
// 지금 코드는 _DEMO_MODE를 build-target으로, _DEMO_LV_CAP을 100 고정으로 정한다(CLAUDE.md의 두 sed는 대상 없음). 현 DEMO 폴더와 같다.
if(!game.includes("const _DEMO_MODE=(window.EXODUSER_BUILD_TARGET||'demo')==='demo';")||!game.includes('const _DEMO_LV_CAP=100;'))throw Error('데모 플래그 정의가 예상과 다르다');
// _LOBBY_BUILD도 build-target에서 정한다(CLAUDE.md sed 대상 없음) — 현 DEMO/EA 폴더와 같이 그대로 복사.
if(!index.includes("const _LOBBY_BUILD=window.EXODUSER_BUILD_TARGET||'demo';"))throw Error('_LOBBY_BUILD 정의가 예상과 다르다');
const demoIndex=index,eaIndex=index;
const special={demo:{'game.html':demoGame,'gamedemo.html':demoGame,'index.html':demoIndex,'indexdemo.html':demoIndex},ea:{'game.html':game,'index.html':eaIndex}};

const report={dry,source:cp.execFileSync('git',['-C',SRC,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),files:list.length};
for(const [name,dest] of Object.entries(DESTS)){
  const count={same:0,updated:0,added:0},changed=[];
  for(const rel of list){const r=put(name,dest,rel);count[r]++;if(r!=='same'&&!rel.match(/^(assets|img|sprites|bgm|sfx|video)\//))changed.push(r[0]+' '+rel);}
  for(const [rel,data] of Object.entries(special[name])){const r=put(name,dest,rel,data);count[r]++;changed.push(r[0]+' '+rel);}
  report[name]={...count,codeChanged:changed};
}
fs.mkdirSync('I:/EXODUSER-Storage/backup',{recursive:true});fs.writeFileSync(BACKUP+(dry?'-dry':'')+'.json',JSON.stringify(report,null,1));
console.log(JSON.stringify({dry,files:list.length,demo:{same:report.demo.same,updated:report.demo.updated,added:report.demo.added,code:report.demo.codeChanged.length},ea:{same:report.ea.same,updated:report.ea.updated,added:report.ea.added,code:report.ea.codeChanged.length}}));
