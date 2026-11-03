// Conservative VFX reference audit. --delete uses only path-scoped git rm.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
process.chdir(root);
const expectedHead = '5ac7d7b612ebf0c09d826f22558fbbf85e440f4a';
const evidence = 'tools/vfx-cleanup/audit.json';
const report = 'docs/5.1임펙트디자인/VFX_CLEANUP_VFX06_20261103.md';
function git(args) { return cp.execFileSync('git', args, {cwd:root,encoding:'utf8',windowsHide:true,maxBuffer:64*1024*1024}); }
const read = p => fs.readFileSync(p,'utf8');
const esc = s => s.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&');
const tracked = git(['ls-files','-z']).split('\0').filter(Boolean);
const scope = p => /^(assets\/vfx\/|img\/vfx\/|img\/balls\/|sprites\/)/.test(p) || /^output\/(?:vfx\/|ki_slash_radiant_[^/]+\/|kraken_water_[^/]+\/|silvertail_e_arc_[^/]+\/)/.test(p);
const extension = p => /\.(png|webp|jpe?g|json|mp4)$/i.test(p);
function safe(p) {
  const abs=path.resolve(root,p);
  if(!abs.startsWith(root+path.sep)||p.includes('..')||fs.lstatSync(p).isSymbolicLink())throw Error('Unsafe path '+p);
}
function walk(dir) {
  if(!fs.existsSync(dir))return [];
  if(fs.lstatSync(dir).isSymbolicLink())throw Error('Symlink directory '+dir);
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(dir+'/'+e.name):[dir+'/'+e.name]);
}
function hit(text,p) {
  const base=path.posix.basename(p),stem=base.slice(0,-path.posix.extname(base).length);
  return {full:text.includes(base),stem:new RegExp('(?<![A-Za-z0-9_.-])'+esc(stem)+'(?![A-Za-z0-9_.-])').test(text)};
}
function activeLines(text) {return text.split(/\r?\n/).map(s=>/^\s*\/\//.test(s)?'':s).join('\n');}
const game=read('game.html');
function gameHash(){return crypto.createHash('sha256').update(fs.readFileSync('game.html')).digest('hex');}
function staticPaths(text) {
  const paths=new Set();
  // Whole quoted literals. No evaluation of game code.
  const rx=/(["'\x60])((?:\\.|(?!\1)[^\\\r\n])*)\1/g;
  for(const m of text.matchAll(rx)) {
    const s=m[2].split(/[?#]/)[0].replace(/^\.\//,'').replace(/^\//,'');
    if(s.includes('://')||s.includes('\\')||s.includes('$'+'{'))continue;
    const rootLoad=/(?:\b(?:src|href)\s*=\s*|(?:\bfetch|\bimport|\bAudio)\s*\(\s*)$/.test(text.slice(Math.max(0,m.index-70),m.index));
    if(/^(?:assets|img|sprites|data|engine|tools|fonts|audio|sounds|music|video|videos|css|js|lib|lang)\/[A-Za-z0-9_./@%+() -]+\.[A-Za-z0-9]{1,8}$/.test(s)||(rootLoad&&/^[A-Za-z0-9_.-]+\.(?:js|mjs|css|html|json|woff2?|ttf|png|webp|jpe?g|mp[34]|ogg|wav|webm)$/.test(s)))paths.add(s);
  }
  return [...paths].sort();
}
function dynamicPatterns() {
  const patterns=[];
  const range=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
  function add(pattern,names,reason,kind='resolved'){patterns.push({pattern,names:[...new Set(names)].sort(),reason,kind});}
  add("'assets/vfx/fire_'+fi+'.webp' (fi=1..4)",range(1,4).map(i=>'assets/vfx/fire_'+i+'.webp'),'game.html:8865,19752; both loops load four frames');
  for(const suffix of ['_sheet.png','_boss_sheet.png'])add("'assets/vfx/impact_el'+e+'"+suffix+"' (e=0..5)",range(0,5).map(i=>'assets/vfx/impact_el'+i+suffix),'game.html:19273-19277');
  add("'assets/vfx/malice_mortar_explode/sprite-384px-9-frames/frame_'+String(i).padStart(3,'0')+'.png'",range(0,8).map(i=>'assets/vfx/malice_mortar_explode/sprite-384px-9-frames/frame_'+String(i).padStart(3,'0')+'.png'),'game.html:19330-19331; _MM_EXP_FRAMES=9');
  const combo=game.slice(game.indexOf('const _TVFX2_COMBOS='),game.indexOf('const _tvfx2Imgs='));
  add('_TVFX2_PATH+l.src',[...combo.matchAll(/src:'([^']+)'/g)].map(m=>'assets/vfx/'+m[1]),'game.html:19187-19244; layer table');
  const start=game.indexOf('const _V3_SHEETS=');
  const v3=game.slice(start,game.indexOf('// 개별 텍스처',start));
  add("_V3_SS+'filename'",[...v3.matchAll(/_V3_SS\+'([^']+)'/g)].map(m=>'assets/vfx/'+m[1]),'game.html:65790-65813; 3D preload');
  const els=['phys','fire','ice','dark','ltn','holy'];
  add("'img/balls/proj_bolt_'+n+'.png'",els.map(n=>'img/balls/proj_bolt_'+n+'.png'),'game.html:14681,24654-24655');
  add("'img/balls/proj_shard_'+p[0]+'.png'",['fire','dark','holy'].map(n=>'img/balls/proj_shard_'+n+'.png'),'game.html:24660-24661');
  add("'img/balls/proj_'+pt+'_'+en+'.png' with overrides/skip",['bolt','shard'].flatMap(pt=>els.flatMap((el,i)=>pt==='shard'&&[2,4].includes(i)?[]:['img/balls/proj_'+pt+'_'+(pt==='shard'&&el==='phys'?'dark':pt==='shard'&&el==='ltn'?'fire':el)+'.png'])),'game.html:24310-24326; shard_2/4 skipped; shard_phys/ltn override to dark/fire');
  add("'ki_slash_hit_'+i",['assets/vfx/ki_slash_hit_silver_sheet.png'],'In-memory tinted surfaces, not filenames: game.html:19770-19776','in-memory');
  add("'parry_impact_el'+n",range(1,5).map(i=>'assets/vfx/parry_impact_el'+i+'.png'),'Registered IDs map to explicit paths; no parry_fx/parry_new loader');
  const prefixes=[...activeLines(game).matchAll(/(['"])((?:assets\/vfx\/|img\/vfx\/|img\/balls\/|sprites\/)[^'"\r\n]*)\1\s*\+/g)].map(m=>m[2]);
  const known=['assets/vfx/fire_','assets/vfx/impact_el','assets/vfx/malice_mortar_explode/sprite-384px-9-frames/frame_','img/balls/proj_bolt_','img/balls/proj_shard_','img/balls/proj_'];
  for(const prefix of new Set(prefixes))if(!known.includes(prefix))add(prefix+' + unresolved',tracked.filter(p=>p.startsWith(prefix)),'Unknown concatenation: preserve all matching files','uncertain');
  return patterns;
}
function check(paths){return {checked:paths.length,missing:paths.filter(p=>!fs.existsSync(p))};}
function scan() {
  if(git(['rev-parse','HEAD']).trim()!==expectedHead)throw Error('HEAD changed');
  if(git(['diff','--name-only','HEAD','--','game.html']).trim())throw Error('game.html changed');
  const roots=['assets/vfx','img/vfx','img/balls','sprites','output'];
  const targets=roots.flatMap(walk).filter(p=>scope(p)&&extension(p)).sort(),trackSet=new Set(tracked);
  const index=new Map(git(['ls-files','-s','-z']).split('\0').filter(Boolean).map(row=>{const m=row.match(/^\d+ (\w+) \d\t(.*)$/s);return [m[2],m[1]];}));
  const unityRef=git(['rev-parse','origin/unity/main']).trim(),unity=new Map();
  for(const row of git(['ls-tree','-r','-z','origin/unity/main','--','unity/Assets/Exoduser/Resources']).split('\0').filter(Boolean)){
    const m=row.match(/^\d+ blob (\w+)\t(.*)$/s);if(m){if(!unity.has(m[1]))unity.set(m[1],[]);unity.get(m[1]).push(m[2]);}
  }
  const required=tracked.filter(p=>(/^(game\.html$|index\.html$|gamedemo(?:\.html$|\/)|indexdemo(?:\.html$|\/)|engine\/|data\/|lang_[^/]*\.js$|node-main\.js$|server\.cjs$|tools\/build-nwjs\.mjs$|build-nwjs\.mjs$)/.test(p)&&/\.(html|[cm]?js|json|css)$/i.test(p))||p.endsWith('.css'));
  const additional=tracked.filter(p=>/\.(?:[cm]?js|py|ps1|html|json)$/i.test(p)&&!required.includes(p)&&(p.startsWith('tools/')||!p.includes('/'))&&!p.startsWith('tools/vfx-cleanup/'));
  const primary=required.filter(p=>fs.existsSync(p)).map(p=>({p,text:read(p)})),extra=additional.filter(p=>fs.existsSync(p)).map(p=>({p,text:read(p)}));
  const patterns=dynamicPatterns(),dynamic=new Set(patterns.flatMap(p=>p.names)),uncertain=new Set(patterns.filter(p=>p.kind==='uncertain').flatMap(p=>p.names));
  const rows=[];
  console.log('Scanning '+targets.length+' target files, '+primary.length+' required sources, '+extra.length+' tooling sources');
  for(const p of targets){
    safe(p);
    const refs=primary.flatMap(s=>{const h=hit(s.text,p);return h.full||h.stem?[{source:s.p,...h}]:[];});
    const extraRefs=extra.filter(s=>{const h=hit(s.text,p);return h.full||h.stem;}).map(s=>s.p);
    const unityPaths=unity.get(index.get(p))||[],original=/\/(?:source|src|original|originals)\//i.test(p);
    const status=!trackSet.has(p)?'불확실':refs.length||dynamic.has(p)||unityPaths.length?'유지':uncertain.has(p)||original||extraRefs.length?'불확실':'삭제 후보';
    const reasons=[!trackSet.has(p)?'untracked: 삭제 금지':'',refs.length?'정적 이름 참조 '+refs.length+'개 소스':'',dynamic.has(p)?'동적 경로/등록 이름 전개 일치':'',unityPaths.length?'Unity Resources 동일 Git blob':'',extraRefs.length?'제작/검수 도구 등 추가 참조 '+extraRefs.length+'개':'',original?'원본 경로: 보존':'',status==='삭제 후보'?'정적/동적 참조 0; Unity 동일 blob 0; tracked':''].filter(Boolean);
    rows.push({path:p,size:fs.statSync(p).size,tracked:trackSet.has(p),blob:index.get(p)||null,refs,extraRefs,dynamic:dynamic.has(p),unityPaths,status,reasons});
  }
  console.log('Reference scan complete; reading path history');
  const dates=new Map();let date='';
  for(const line of git(['-c','core.quotepath=false','log','--format=DATE:%cI','--name-only','--',...roots]).split(/\r?\n/)){
    if(line.startsWith('DATE:'))date=line.slice(5);else if(line&&!dates.has(line))dates.set(line,date);
  }
  for(const r of rows)r.lastCommit=dates.get(r.path)||'untracked';
  const statics=staticPaths(activeLines(game)),dynamics=[...new Set(patterns.filter(p=>p.kind!=='uncertain').flatMap(p=>p.names))].sort();
  console.log('History complete; searching docs');
  const needles=new Set(rows.map(r=>path.posix.basename(r.path))),docMatches=[];
  for(const p of tracked.filter(p=>p.startsWith('docs/')&&p.endsWith('.md')&&p!==report&&fs.existsSync(p))){
    const text=read(p),matches=[...needles].filter(n=>text.includes(n));if(matches.length)docMatches.push({path:p,names:matches});
  }
  return {head:expectedHead,unityRef,created:new Date().toISOString(),requiredSources:required,additionalSourceCount:additional.length,rows,patterns,docMatches,staticPaths:statics,dynamicPaths:dynamics,baselineStatic:check(statics),baselineDynamic:check(dynamics),gameHash:gameHash(),removal:null};
}
const bytes=n=>n.toLocaleString('en-US')+' B ('+(n/1048576).toFixed(2)+' MiB)';
const sum=rows=>rows.reduce((a,r)=>a+r.size,0);
function writeReport(a) {
  const deleted=a.rows.filter(r=>r.status==='삭제'),candidates=a.rows.filter(r=>r.status==='삭제 후보'),keep=a.rows.filter(r=>r.status==='유지'),uncertain=a.rows.filter(r=>r.status==='불확실');
  const after=check(a.staticPaths),dynAfter=check(a.dynamicPaths);
  a.verification={static:after,dynamic:dynAfter,newStaticMissing:after.missing.filter(p=>!a.baselineStatic.missing.includes(p)),newDynamicMissing:dynAfter.missing.filter(p=>!a.baselineDynamic.missing.includes(p)),gameUnchanged:gameHash()===a.gameHash};
  const lines=['# VFX-06 폐기 후보 정리 — 2026-11-03','',
    '- 기준 HEAD: '+a.head+' (detached). Unity 비교 ref: '+a.unityRef+' (로컬 origin/unity/main). fetch/브랜치 변경/commit/push 없음.',
    '- 끝의 표준 규칙(워크트리 밖 쓰기 금지)에 따라 검사 스크립트와 결과도 이 워크트리 안에 둔다.',
    '- 기존 game.html/실행 코드 수정 없음. 브라우저/Unity/유료 API 실행 없음. tracked 파일만 git rm 대상이다.',
    '- 파일 참조 정리 판정이며 아트 품질/실게임 PASS가 아니다. 원격 최신 상태/런타임 로드는 미검증이다.','',
    '| 판정 | 파일 수 | 용량 |','|---|---:|---:|',
    ...[['삭제',deleted],['삭제 후보(미실행)',candidates],['유지',keep],['불확실 유지',uncertain]].map(([label,rows])=>'| '+label+' | '+rows.length+' | '+bytes(sum(rows))+' |'),'',
    '삭제 실행: '+(a.removal?a.removal.error||'git rm 정상 완료':'아직 미실행'),
    ...(a.removal?.error?['','남은 문제: 이 워크트리의 Git 인덱스는 G:/exoduser/.git/worktrees/codex-vfx-cleanup/에 있으며 현재 세션은 쓰기 권한이 없다. git rm 첫 묶음이 index.lock 생성 전에 실패하여 실제 삭제/스테이징은 0개다. 대체 인덱스나 직접 파일 삭제로 우회하지 않았다.']:[]),'',
    '## 검사 범위','',
    '- 필수 소스 '+a.requiredSources.length+'개: game/index, 존재하는 demo, engine/, data/, lang_*.js, 전체 CSS, 빌드/서버 코드. 확장자 포함 이름과 stem 토큰 모두 검색한다. 주석 참조도 유지 쪽으로 처리한다. 추가 제작/검수 소스 '+a.additionalSourceCount+'개 참조도 불확실 보존한다.',
    '- assets/vfx/, img/vfx/, img/balls/, sprites/의 png/webp/jpg/jpeg/json/mp4. output/는 vfx/, ki_slash_radiant_*, kraken_water_*, silvertail_e_arc_*를 VFX 후보로 식별했다. 캐릭터 동작/마케팅/시네마틱/음원과 GIF/SVG/TXT는 범위 밖이다.',
    '- Unity Art 포함 Resources 전체 Git blob 비교. 이름이 달라도 blob이 같으면 유지. tools/vfx/src/*_orig.png는 범위 밖 보존 원료이며 source/original도 불확실 유지.',
    '- docs/ 전체 Markdown 파일명 검색: '+a.docMatches.length+'개 문서 매칭. 문서 참조만으로 런타임 사용이라 판정하지 않는다. 전체 매칭/소스 목록은 audit.json에 있다.',
    '- untracked는 실제 디렉터리 순회로 포함하고 삭제하지 않는다. 알 수 없는 동적 접두사는 일치 파일 전부 불확실 유지.','',
    '## 경로 검증','',
    '| 검사 | 삭제 전 누락 | 삭제 후 누락 | 새 누락 |','|---|---:|---:|---:|',
    '| game.html 전체 정적 로컬 경로 '+a.staticPaths.length+'개 | '+a.baselineStatic.missing.length+' | '+after.missing.length+' | '+a.verification.newStaticMissing.length+' |',
    '| VFX 동적 경로 '+a.dynamicPaths.length+'개 | '+a.baselineDynamic.missing.length+' | '+dynAfter.missing.length+' | '+a.verification.newDynamicMissing.length+' |','',
    'game.html 바이트 불변: '+a.verification.gameUnchanged+'. 주석 전용 줄/원격 URL/쿼리 제외 문자열 검사이며 실게임 검증은 아니다. 기존 누락이 있으면 전체 누락 0 목표 미충족으로 보고한다. 코드 수정 금지에 따라 기존 누락은 수정하지 않는다.','',
    '기존 정적 누락:','',...a.baselineStatic.missing.map(p=>'- '+p),'','기존 동적 누락:','',...a.baselineDynamic.missing.map(p=>'- '+p),'',
    '## 동적 패턴과 펼친 이름','',...a.patterns.flatMap(p=>['### '+p.pattern,'',p.reason+' ('+p.kind+')','',...p.names.map(n=>'- '+n),'']),
    '## 파일별 판정','',
    '| 경로 | 크기(B) | 마지막 커밋 날짜 | 참조 검사 | 판정 | 근거 |','|---|---:|---|---|---|---|',
    ...a.rows.map(r=>'| '+r.path+' | '+r.size+' | '+r.lastCommit+' | 정적 '+r.refs.length+' / 동적 '+Number(r.dynamic)+' / Unity '+r.unityPaths.length+' | '+r.status+' | '+r.reasons.join('; ')+(r.refs.length?' / '+r.refs.slice(0,3).map(h=>h.source).join(', '):'')+(r.extraRefs.length?' / '+r.extraRefs.slice(0,3).join(', '):'')+' |'),'',
    '## 불확실하여 유지한 항목','',...uncertain.map(r=>'- '+r.path+': '+r.reasons.join('; ')),'',
    '## 실행/재현','',
    '- 조사: C:\\nvm4w\\nodejs\\node.exe tools/vfx-cleanup/audit.cjs --audit',
    '- 삭제: C:\\nvm4w\\nodejs\\node.exe tools/vfx-cleanup/audit.cjs --delete (후보/HEAD/INDEX/WORK 재대조, git rm만 사용)',
    '- 삭제 후 검증: C:\\nvm4w\\nodejs\\node.exe tools/vfx-cleanup/audit.cjs --verify',
    '- 정상 인덱스 쓰기 권한이 있는 총괄 환경에서 검수 후 실행할 정확한 목록: [delete-paths.txt](../../tools/vfx-cleanup/delete-paths.txt). 명령: git rm --pathspec-from-file=tools/vfx-cleanup/delete-paths.txt (이 세션에서는 권한 거부 후 재시도하지 않음).',
    '- 상세: [audit.json](../../tools/vfx-cleanup/audit.json) / [result.md](../../tools/vfx-cleanup/result.md)',''];
  fs.writeFileSync(report,lines.join('\n'));
  fs.writeFileSync(evidence,JSON.stringify(a,null,2)+'\n');
  fs.writeFileSync('tools/vfx-cleanup/delete-paths.txt',candidates.map(r=>r.path).join('\n')+'\n');
  const result=['삭제 '+deleted.length+'개 / '+bytes(sum(deleted)),
    '유지 '+keep.length+'개, 불확실 유지 '+uncertain.length+'개, 미실행 삭제 후보 '+candidates.length+'개',
    '정적 누락 '+after.missing.length+'개(기존 '+a.baselineStatic.missing.length+', 신규 '+a.verification.newStaticMissing.length+'), 동적 누락 '+dynAfter.missing.length+'개(신규 '+a.verification.newDynamicMissing.length+'), game.html 불변 '+a.verification.gameUnchanged,
    '문서: '+report,'워크트리 밖 출력 금지로 I: result.md 대신 이 파일 사용. commit/push 없음.',a.removal?.error||'','END'].filter(Boolean).join('\n')+'\n';
  fs.writeFileSync('tools/vfx-cleanup/result.md',result);console.log(result);
}
if(process.argv.includes('--refresh-paths')) {
  const a=JSON.parse(read(evidence));
  if(a.removal||a.gameHash!==gameHash())throw Error('Baseline cannot be changed after deletion or game changes');
  a.staticPaths=staticPaths(activeLines(game));a.baselineStatic=check(a.staticPaths);writeReport(a);
} else if(process.argv.includes('--review')) {
  const a=JSON.parse(read(evidence));
  const rows=a.rows.filter(r=>r.status==='불확실');
  console.log(JSON.stringify(rows.map(r=>({path:r.path,extra:r.extraRefs,reasons:r.reasons})),null,2));
  console.log('missing',a.baselineStatic.missing);
  console.log('staticPaths',a.staticPaths.length,'dynamicPaths',a.dynamicPaths.length,'Unity kept',a.rows.filter(r=>r.unityPaths.length).length,'candidateBytes',sum(a.rows.filter(r=>r.status==='삭제 후보')));
} else if(process.argv.includes('--audit')) {
  const a=scan();writeReport(a);
  console.log('CANDIDATES\n'+a.rows.filter(r=>r.status==='삭제 후보').map(r=>r.path).join('\n'));
} else if(process.argv.includes('--delete')) {
  const a=JSON.parse(read(evidence));
  if(a.removal)throw Error('Deletion already attempted; do not retry unchanged failure');
  if(git(['rev-parse','HEAD']).trim()!==a.head)throw Error('HEAD changed');
  if(git(['diff','--name-only','HEAD']).trim())throw Error('Tracked INDEX/WORK changed since audit');
  if(git(['rev-parse','origin/unity/main']).trim()!==a.unityRef)throw Error('Unity comparison ref changed');
  const candidates=a.rows.filter(r=>r.status==='삭제 후보');
  const index=new Map(git(['ls-files','-s','-z']).split('\0').filter(Boolean).map(row=>{const m=row.match(/^\d+ (\w+) \d\t(.*)$/s);return [m[2],m[1]];}));
  for(const r of candidates)if(!r.tracked||index.get(r.path)!==r.blob)throw Error('Candidate changed: '+r.path);
  a.removal={attemptedAt:new Date().toISOString(),error:null};
  try {
    for(let i=0;i<candidates.length;i+=40) {
      const batch=candidates.slice(i,i+40);for(const r of batch)safe(r.path);
      git(['rm','--',...batch.map(r=>r.path)]);for(const r of batch)r.status='삭제';
    }
  } catch(e){a.removal.error=String(e.stderr||e.message).trim();}
  writeReport(a);if(a.removal.error)process.exitCode=2;
} else if(process.argv.includes('--verify')) {
  const a=JSON.parse(read(evidence));writeReport(a);
  const removed=a.rows.filter(r=>r.status==='삭제'),staged=git(['diff','--cached','--name-only','--diff-filter=D','-z']).split('\0').filter(Boolean);
  const okay=removed.every(r=>!fs.existsSync(r.path)&&staged.includes(r.path))&&a.verification.gameUnchanged&&!a.verification.newStaticMissing.length&&!a.verification.newDynamicMissing.length;
  console.log(JSON.stringify({referenceIntegrity:okay,cleanupCompleted:!a.removal?.error&&!a.rows.some(r=>r.status==='삭제 후보'),removed:removed.length,stagedDeletions:staged.length,newStaticMissing:a.verification.newStaticMissing,newDynamicMissing:a.verification.newDynamicMissing,preexistingStaticMissing:a.baselineStatic.missing.length}));
  if(!okay)process.exitCode=1;
} else console.log('Use --audit, --delete, or --verify.');
