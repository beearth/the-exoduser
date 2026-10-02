import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {parse} from 'acorn';

// 정적 연결 지도만 검사한다. 생산/후보를 import, eval, 실행하지 않는다.
const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const owned='tools/team-followup-20261002/project-teams/ITEM/';
const startedAt=new Date().toISOString();
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const read=path=>fs.readFileSync(`${root}/${path}`,'utf8');
const command=(bin,args)=>{
  const r=spawnSync(bin,args,{cwd:root,encoding:'utf8',env:{...process.env,GIT_OPTIONAL_LOCKS:'0'}});
  assert.equal(r.status,0,`${bin}: ${r.stderr}`);return r.stdout;
};
const status=()=>command('git',['status','--short','--untracked-files=all']).trim().split('\n').filter(Boolean).length;
const head=command('git',['rev-parse','HEAD']).trim();
if(process.argv.includes('--verify-report')){
  const path=`${root}/${owned}evidence.json`,evidence=JSON.parse(fs.readFileSync(path,'utf8'));
  const protectedPaths=['game.html','game-easy-test.html','server.cjs','node-main.js','index.html','tools/team-followup-20261001/ITEM/d13-deferred-contract-candidate.mjs',`${owned}task.md`];
  const rows=protectedPaths.map(path=>{
    const before=evidence.staticReview.preserved.find(r=>r.path===path)?.sha256,after=hash(read(path));
    assert.ok(before,path);assert.equal(after,before,`읽기 전용 원문 drift: ${path}`);
    return {path,beforeSha256:before,afterSha256:after,unchanged:true};
  });
  const report=read(`${owned}result.md`);
  assert.equal(evidence.staticReview.passed,22);assert.ok(report.includes('22 PASS/0 FAIL'));
  assert.deepEqual(fs.readdirSync(`${root}/${owned}`).sort(),['checks.mjs','evidence.json','result.md','task.md']);
  parse(read(`${owned}checks.mjs`),{ecmaVersion:'latest',sourceType:'module'});
  evidence.status='정적 통합지도 산출·검수 완료 / 생산 미연결';
  evidence.preparationFailures=[{phase:'첫 정적 검사',exitCode:1,error:'Acorn SyntaxError: Unexpected token (2:10)',cause:'HTML importmap JSON을 JavaScript로 파싱',repair:'검수기의 비실행 JSON/importmap 제외 및 행 탐색 최적화',productionChanged:false},{phase:'보강 전 중간 검사',passed:20,final:false},{phase:'lazy/reset·누락 player 경계 보강 후 검사',passed:22,failed:0,final:true}];
  evidence.finalVerification={at:new Date().toISOString(),head,checks:4,failed:0,scope:'원문 보존/보고서 수치/정확3산출/검수기 AST',preserved:rows,outputs:['result.md','checks.mjs'].map(name=>({path:`${owned}${name}`,sha256:hash(read(`${owned}${name}`)),bytes:fs.statSync(`${root}/${owned}${name}`).size})),evidenceSelfHash:'자기참조 해시를 포함하지 않음; 총괄이 최종 바이트를 별도 대조'};
  evidence.events.push({phase:'보고서·최종 산출 보존 검수 완료',at:evidence.finalVerification.at,checks:4});
  evidence.changesObservations=[{phase:'시작',count:evidence.startingChanges,at:evidence.receivedObservationAt},{phase:'첫 산출 뒤 관찰',count:40,timeUnavailable:true},{phase:'정적 보강 검수 시작',count:evidence.staticReview.changesStart,at:evidence.staticReview.startedAt},{phase:'정적 보강 검수 종료',count:evidence.staticReview.changesEnd,at:evidence.staticReview.completedAt},{phase:'완료',count:status(),at:evidence.finalVerification.at}];
  fs.writeFileSync(path,JSON.stringify(evidence,null,2)+'\n');
  console.log(JSON.stringify({status:evidence.status,staticChecks:22,finalArtifactChecks:4,changes:evidence.changesObservations,readonlyPreserved:rows.length,ownedOutputs:evidence.ownedOutputs,finalAt:evidence.finalVerification.at,outputs:evidence.finalVerification.outputs},null,2));
  process.exit(0);
}
const changesStart=status(),checks=[],maps=[];
const check=(name,run)=>{run();checks.push({name,status:'PASS'});};
const reference=JSON.parse(read('tools/team-followup-20261001/ITEM/d13-deferred-contract-evidence.json')).sourceEvidence;
const candidatePath='tools/team-followup-20261001/ITEM/d13-deferred-contract-candidate.mjs';
const candidate=read(candidatePath);
const rootProof=JSON.parse(read('outputs/team-review-20261002/four-candidate-acceptance/item-root-independent.json'));
check('인수된 D13 후보 byte 보존',()=>assert.equal(hash(candidate),rootProof.currentSha256));
check('기본 비활성/proposal/runtimeReady=false 정적 계약',()=>{
  assert.match(candidate,/enabled=false,reviewOnly=false/);
  assert.match(candidate,/enabled === true && reviewOnly === true/);
  assert.match(candidate,/status:'proposal',runtimeReady:false/);
});
check('출처·시전·큐 및 callback 전환경계 정적 계약',()=>{
  for(const token of ['new WeakMap()','new Set()','pending=[]','beforeEpoch=epoch',"source?.kind === 'original'",'zone._pillarSpike !== true','epoch !== passEpoch || getZones() !== passZones','if(inPass || flushing)','function clear() {epoch++;sources=new WeakMap();usedCasts=new Set();pending=[];}'])assert.ok(candidate.includes(token),token);
});
const wanted=['activateSpikeTrap','hurtE','update','checkRooms','initStage','_enterBossArena','_fallenResolve','_loadCharAtlas','dbRestore','startGameFromDB','_startDemoNew','_startDemoSaved','_startTestChar','_startDemoTest','_boot','_dispatchSkillSlot'];
function inventory(path){
  const source=read(path),functions=[],calls=[],assignments=[],all=[];
  const slice=n=>source.slice(n.start,n.end);
  const newlines=[-1];for(let i=0;i<source.length;i++)if(source[i]==='\n')newlines.push(i);
  const line=offset=>{let lo=0,hi=newlines.length;while(lo<hi){const mid=(lo+hi)>>>1;if(newlines[mid]<offset)lo=mid+1;else hi=mid;}return lo;};
  function walk(n,owner,base,guards=[]){
    if(!n||typeof n!=='object'||!n.type)return;
    const absolute={...n,start:base+n.start,end:base+n.end};all.push(absolute);
    let current=owner;
    if(['FunctionDeclaration','FunctionExpression','ArrowFunctionExpression'].includes(n.type)){
      const name=n.id?.name||`anonymous@${line(absolute.start)}`;
      current={name,start:absolute.start,end:absolute.end};
      functions.push({...current,line:line(absolute.start),async:n.async===true,sha256:hash(slice(absolute)),bytes:Buffer.byteLength(slice(absolute))});
    }
    if(n.type==='CallExpression'&&n.callee.type==='Identifier')calls.push({name:n.callee.name,line:line(absolute.start),start:absolute.start,end:absolute.end,owner:current?.name||'top-level',sha256:hash(slice(absolute))});
    if(n.type==='AssignmentExpression'){
      const left=source.slice(base+n.left.start,base+n.left.end),right=source.slice(base+n.right.start,base+n.right.end);
      if(['G._fireZones','G._fireZones.length','P','G','_charIdx','INV.equipped'].includes(left))assignments.push({left,right:right.length<160?right:null,rightSha256:hash(right),operator:n.operator,line:line(absolute.start),owner:current?.name||'top-level',guards,kind:guards.includes('!G._fireZones')?'lazy-array-initialization':'state-assignment',sha256:hash(slice(absolute)),start:absolute.start,end:absolute.end});
    }
    for(const [key,v]of Object.entries(n))if(!['start','end','loc'].includes(key)){
      const next=n.type==='IfStatement'&&key==='consequent'?[...guards,source.slice(base+n.test.start,base+n.test.end)]:guards;
      if(Array.isArray(v))v.forEach(child=>walk(child,current,base,next));else if(v&&typeof v==='object')walk(v,current,base,next);
    }
  }
  let scripts=0;
  for(const match of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
    if(/\bsrc\s*=/.test(match[1])||!match[2].trim()||/type\s*=\s*['"](?:application\/json|importmap|speculationrules)['"]/.test(match[1]))continue;
    const base=match.index+match[0].indexOf('>')+1;
    let tree;
    try{tree=parse(match[2],{ecmaVersion:'latest',sourceType:/type\s*=\s*['"]module['"]/.test(match[1])?'module':'script'});}
    catch(error){throw new Error(`${path}:${line(base)} script ${match[1]}: ${error.message}`);}
    walk(tree,null,base);scripts++;
  }
  check(`${path} 모든 inline script AST 파싱`,()=>assert.ok(scripts>0));
  const named=functions.filter(f=>wanted.includes(f.name));
  check(`${path} 핵심 함수/수명 경계 식별`,()=>{
    for(const name of wanted.filter(n=>n!=='_startDemoSaved'))assert.equal(named.filter(f=>f.name===name).length,1,name);
  });
  // all의 자식 offset은 원 AST 기준이므로 블록은 원 시작점/조건 문자열로 찾는다.
  const zoneCandidates=all.filter(n=>n.type==='IfStatement'&&slice(n).startsWith('if(G._fireZones&&G._fireZones.length>0)'));
  const update=named.find(f=>f.name==='update');
  const zone=zoneCandidates.filter(n=>n.start>update.start&&n.end<update.end);
  check(`${path} update의 실제 장판 pass 유일성`,()=>assert.equal(zone.length,1));
  const block=zone[0],blockText=slice(block);
  const dot=calls.filter(c=>c.name==='hurtE'&&c.start>block.start&&c.end<block.end&&slice(c).includes("_lessonAttack:'spikeTrap'"));
  check(`${path} spikeTrap 원 hurtE 인수식 1곳`,()=>{
    assert.equal(dot.length,1);assert.equal(slice(dot[0]),reference.callsite.original);
  });
  check(`${path} 압축 종료 위치 및 실제 적별 겹침 cap`,()=>{
    assert.match(blockText,/G\._fireZones\.length=_fzW;/);
    assert.match(blockText,/if\(e\[_capKey\]>=1\)continue;/);
    assert.ok(dot[0].start<source.indexOf('G._fireZones.length=_fzW;',block.start));
  });
  check(`${path} 생산 D13 설치/롤 공급 부재`,()=>{
    for(const token of ['createD13DeferredReview','wrapOriginalTrap','invokeDot','wrapZonePass','_uTrapOffshoot','UI-13'])assert.ok(!source.includes(token),token);
  });
  const resets=assignments.filter(a=>a.left==='G._fireZones'&&a.right==='[]');
  check(`${path} stage/boss/death 실제 배열 reset 식별`,()=>{
    for(const name of ['initStage','_enterBossArena','_fallenResolve'])assert.equal(resets.filter(a=>a.owner===name).length,1,name);
  });
  check(`${path} lazy 배열 초기화와 lifecycle reset 구분`,()=>{
    assert.ok(resets.some(a=>a.kind==='lazy-array-initialization'));
    for(const name of ['initStage','_enterBossArena','_fallenResolve'])assert.equal(resets.filter(a=>a.owner===name&&a.kind==='state-assignment').length,1,name);
  });
  check(`${path} 캐릭터/복원/새 플레이어 경계 식별`,()=>{
    assert.ok(assignments.some(a=>a.owner==='_loadCharAtlas'&&a.left==='_charIdx'));
    assert.ok(assignments.some(a=>a.owner==='dbRestore'&&a.left==='INV.equipped'));
    for(const name of ['startGameFromDB','_startDemoNew','_startTestChar'])assert.ok(assignments.some(a=>a.owner===name&&a.left==='P'&&a.right==='mkP()'),name);
  });
  const owners=new Set([...named.map(f=>f.name),...assignments.map(a=>a.owner)]);
  const map={path,sha256:hash(source),inlineScripts:scripts,functions:functions.filter(f=>owners.has(f.name)),zonePass:{line:line(block.start),endLine:line(block.end),sha256:hash(blockText),bytes:Buffer.byteLength(blockText)},dot:{...dot[0],expression:slice(dot[0])},activationCallers:calls.filter(c=>c.name==='activateSpikeTrap'),lifecycleAssignments:assignments,lifecycleCallers:calls.filter(c=>['initStage','_enterBossArena','_fallenResolve','_loadCharAtlas','dbRestore','startGameFromDB'].includes(c.name))};
  if(path==='game.html')check('본편 인수된 전체 장판 pass SHA 동일',()=>assert.equal(map.zonePass.sha256,reference.zoneBlock.sha256));
  maps.push(map);
}
inventory('game.html');inventory('game-easy-test.html');
const docsQuery='U-D13|_uTrapOffshoot|자식 덫|자식덫|d13-deferred|d13-callback|G\\._fireZones|activateSpikeTrap';
const docsOutput=command('rg',['-n','--',docsQuery,'docs/']);
const docsMatches=docsOutput.trim().split('\n').filter(Boolean),docPaths=[...new Set(docsMatches.map(s=>s.split(':')[0]))];
const preservedPaths=['game.html','game-easy-test.html','server.cjs','node-main.js','index.html',candidatePath,`${owned}task.md`,'docs/7아이템디자인/ITEM_TEAM_MASTER.md','docs/7아이템디자인/UNIQUE_TOP8_HOOK_REVIEW_20261001.md','docs/7아이템디자인/유니크_어픽스_리스트.md'];
const preserved=preservedPaths.map(path=>({path,sha256:hash(read(path))}));
const result={task:'d13-integration-map',startedAt,completedAt:new Date().toISOString(),head,changesStart,changesEnd:status(),passed:checks.length,failed:0,checks,maps,preserved,docsSearch:{command:['rg','-n','--',docsQuery,'docs/'],lines:docsMatches.length,files:docPaths.length,outputSha256:hash(docsOutput),paths:docPaths},scope:'정적 AST/byte/source 지도만. 생산/후보 함수 실행·callback32 재실행·runtime·Git쓰기0'};
if(process.argv.includes('--record')){
  const p=`${root}/${owned}evidence.json`,prior=JSON.parse(fs.readFileSync(p,'utf8'));
  prior.staticReview=result;prior.events.push({phase:'실행·정적 검수 완료',at:result.completedAt,passed:checks.length});
  fs.writeFileSync(p,JSON.stringify(prior,null,2)+'\n');
}
console.log(JSON.stringify(process.argv.includes('--record')?{head,passed:checks.length,failed:0,changesStart,changesEnd:result.changesEnd,maps:maps.map(m=>({path:m.path,functions:m.functions.map(f=>({name:f.name,line:f.line,sha256:f.sha256})),zonePass:m.zonePass,resets:m.lifecycleAssignments.filter(a=>a.left==='G._fireZones'&&a.right==='[]').map(a=>({owner:a.owner,line:a.line})),players:m.lifecycleAssignments.filter(a=>a.left==='P').map(a=>({owner:a.owner,line:a.line})),activationCallers:m.activationCallers})),docsSearch:result.docsSearch}:result,null,2));
