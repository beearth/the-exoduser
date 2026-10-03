// Execute real stage reset, kill accounting, result/stat rendering and field restore.
// Canvas/DOM/audio/native gameplay are not exercised by these source fixtures.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {parse}=require('acorn');
const root=process.env.EXODUSER_TEST_SOURCE_ROOT||path.resolve(__dirname,'..');
function walk(n,visit){
  if(!n||typeof n!=='object')return;
  if(n.type)visit(n);
  for(const v of Object.values(n)){
    if(Array.isArray(v))for(const c of v)walk(c,visit);
    else if(v&&typeof v==='object')walk(v,visit);
  }
}
function extract(file){
  const html=fs.readFileSync(path.join(root,file),'utf8'),nodes=[];
  let scripts=0,maps=0;
  for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
    if(/\bsrc\s*=/i.test(m[1]))continue;
    const type=/\btype\s*=\s*["']([^"']+)["']/i.exec(m[1])?.[1]||'';
    if(type==='importmap'){JSON.parse(m[2]);maps++;continue;}
    if(type&&!['module','text/javascript','application/javascript'].includes(type))continue;
    const ast=parse(m[2],{ecmaVersion:'latest',sourceType:type==='module'?'module':'script'});
    scripts++;walk(ast,n=>nodes.push({n,src:m[2]}));
  }
  assert.equal(scripts,6);assert.equal(maps,1);
  const pick=predicate=>{
    const matches=nodes.filter(({n,src})=>predicate(n,src));
    assert.equal(matches.length,1,'unique actual fragment in '+file);
    const {n,src}=matches[0];return src.slice(n.start,n.end);
  };
  const fun=name=>pick(n=>n.type==='FunctionDeclaration'&&n.id?.name===name);
  const reset=pick((n,s)=>n.type==='ExpressionStatement'&&s.slice(n.start,n.end).startsWith('G._sStats={'));
  const hurt=fun('hurtE'),a=hurt.indexOf('G.combo++;'),z=hurt.indexOf('if(G.combo>=1000',a);
  assert.ok(a>0&&z>a);
  const rooms=fun('checkRooms'),lo=rooms.indexOf('{const _csTime='),hi=rooms.indexOf('const cur=STG[G.stage];',lo);
  assert.ok(lo>0&&hi>lo);
  const defs=['_clearParTime','_clearParScore','_clearScoreCalc','_clearRankCalc','_clearRecordMerge',
    '_clearFmtNum','_clearFmtMS','_showClearResult','_captureBossFieldState','_restoreBossFieldState'].map(fun);
  for(const name of ['_RANK_ORD','_RANK_COL'])defs.push(pick(n=>n.type==='VariableDeclaration'&&n.declarations.some(d=>d.id?.name===name)));
  return {html,reset,kill:hurt.slice(a,z),stats:rooms.slice(lo,hi),defs};
}
function context(parts){
  const els=new Map(),G={stage:0,stageTime:600,_totalSpawned:10,_stageKills:10,combo:0,comboTimer:0,comboMax:60,
    map:[[0,1],[1,0]],rooms:[],exits:[],spawnHoles:[],rifts:[],_regions:[],_sStats:{deaths:0,dmgTaken:1,comboMax:0}};
  const c=vm.createContext({G,ens:[],MAP_OBJS:[],worldItems:[],e:{ib:false},
    _taKillPct:1,_taKills:10,_taTotal:10,_regionClearedCount:()=>4,
    $:id=>{if(!els.has(id))els.set(id,{innerHTML:''});return els.get(id);},_T:x=>x,_L:x=>x});
  vm.runInContext(parts.defs.join('\n'),c);
  return {c,G,els,run:text=>vm.runInContext(text,c)};
}
for(const file of ['game.html','game-easy-test.html']){
  const p=extract(file);
  test(file+': new stage resets stage peak without erasing saved lifetime peak',()=>{
    const {G,run}=context(p);G._sStats.comboMax=51;
    run(p.reset);assert.equal(G._sStats.comboMax,0);assert.equal(G.comboMax,60);
  });
  test(file+': actual kill accounting tracks stage peak across combo expiry and boss kill',()=>{
    const {G,c,run}=context(p);run(p.reset);
    for(let i=0;i<23;i++)run(p.kill);
    assert.equal(G._sStats.comboMax,23);assert.equal(G.comboMax,60);assert.equal(G.comboTimer,1200);
    G.combo=0;G.comboTimer=0;c.e.ib=true;run(p.kill);
    assert.equal(G._sStats.comboMax,23);assert.equal(G.comboTimer,1800);
    G.combo=70;run(p.kill);assert.equal(G._sStats.comboMax,71);assert.equal(G.comboMax,71);
  });
  test(file+': stage score uses current stage peak, preserves previous best, missing stats is zero',()=>{
    const {G,c}=context(p);
    c._showClearResult();
    const expected=c._clearScoreCalc({kills:10,regions:4,bossKilled:true,clearSec:10,parSec:115,deaths:0,dmgTaken:1,comboMax:0}).total;
    assert.equal(G._clearRecords[0].s,expected);assert.equal(G.comboMax,60);
    G._sStats.comboMax=19;c._showClearResult();assert.equal(G._clearRecords[0].s,expected+95);
    G._sStats.comboMax=0;c._showClearResult();assert.equal(G._clearRecords[0].s,expected+95);
    G.stage=1;G._sStats=undefined;c._showClearResult();
    assert.equal(G._clearRecords[1].s,expected+500); // missing damage stats also preserves the existing no-hit bonus
  });
  test(file+': actual clear stats and badge thresholds ignore previous stage/lifetime peaks',()=>{
    const {G,run,els}=context(p);G._sStats.comboMax=19;
    run(p.stats);let text=els.get('clearStats').innerHTML;
    assert.match(text,/최대콤보 [^<]*<span[^>]*>19<\/span>/);
    assert.ok(!text.includes('콤보광')&&!text.includes('콤보마스터'));
    for(const peak of [20,49,50]){
      G._sStats.comboMax=peak;run(p.stats);text=els.get('clearStats').innerHTML;
      assert.equal(text.includes('콤보마스터'),peak>=50);
      assert.equal(text.includes('콤보광'),peak>=20&&peak<50);
    }
    assert.equal(G.comboMax,60);
  });
  test(file+': real boss field capture/restore keeps current stage peak and death count',()=>{
    const {G,c}=context(p);const before=c._captureBossFieldState(),stats=G._sStats;
    G._sStats.comboMax=37;G._sStats.deaths=2;G._stageKills=40;c._restoreBossFieldState(before);
    assert.strictEqual(G._sStats,stats);assert.equal(G._sStats.comboMax,37);assert.equal(G._sStats.deaths,2);
    assert.equal(G._stageKills,10);assert.equal(G.comboMax,60);
    assert.equal((p.html.match(/clearRecords:G\._clearRecords\|\|\{\},comboMax:G\.comboMax\|\|0/g)||[]).length,file==='game.html'?4:3);
    assert.ok(p.html.includes('G.comboMax=d.game.comboMax||0'));
  });
}
