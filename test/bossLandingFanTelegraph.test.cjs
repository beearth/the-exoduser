const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=process.env.EXODUSER_TEST_SOURCE_ROOT||path.join(__dirname,'..');
const slice=(html,from,to)=>{
  const a=html.indexOf(from),b=html.indexOf(to,a+from.length);
  assert.ok(a>=0&&b>a,`source boundaries: ${from}`);
  return html.slice(a,b);
};
function harness(){
  const arcs=[],projectiles=[],hits=[];
  const X={globalAlpha:.7,arc(...args){arcs.push(args)},beginPath(){},fill(){},stroke(){},moveTo(){},ellipse(){},save(){},translate(){}};
  const e={alive:true,ib:true,x:100,y:200,r:44,s:'idle',st2:20,facing:.4,_bossPhase:0,atk:100,el:0,col:'#00ff00',jumpOx:100,jumpOy:200,jumpX:500,jumpY:600};
  const P={x:750,y:600,iframes:0,s:'idle',kb:{x:0,y:0}};
  const ctx=vm.createContext({X,e,P,G:{stage:0,frame:1,shake:0},OPT:{shake:100},_now:1000,sa:.7,EL:{P:0},
    _spawnBossProjectile(_,p){projectiles.push(p)},SFX:{magic(){},groggy(){}},addParts(){},deathFX(){},
    canMv(){return true},dst:(ax,ay,bx,by)=>Math.hypot(ax-bx,ay-by),ar:()=>({el:0}),elMul:()=>1,
    hurtP(dmg){hits.push(dmg)}});
  return {ctx,arcs,projectiles,hits,e,P};
}
for(const file of ['game.html','game-easy-test.html']){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  const fanDraw=slice(html,"    if(e.s==='bossFanWind'){",'    // ═══ 빨강');
  const jumpDraw=slice(html,"    if(e.s==='bossJump'){",'    // ── 레이저 렌더링');
  const fanFire="switch(e.s){"+slice(html,"  case'bossFanWind':",'  // ── 보스 돌진:')+'}';
  const jumpLand="switch(e.s){"+slice(html,"  case'bossJump':{",'  // ── 레이저:')+'}';
  test(`${file}: landing warning covers a player the actual landing branch hits, throughout flight`,()=>{
    for(const remaining of [40,39,20,1]){
      const h=harness();h.e.s='bossJump';h.e.st2=remaining;
      const before=JSON.stringify({e:h.e,P:h.P,G:h.ctx.G});
      vm.runInContext(jumpDraw,h.ctx);
      assert.equal(h.arcs.length,2);
      for(const a of h.arcs){assert.equal(a[0],h.e.jumpX);assert.equal(a[1],h.e.jumpY);assert.equal(a[2],300);assert.ok(a[2]>250,'warn about the 250px player before impact')}
      assert.equal(JSON.stringify({e:h.e,P:h.P,G:h.ctx.G}),before,'presentation does not mutate combat');
      assert.equal(h.hits.length,0,'drawing itself deals no damage');
      h.e.st2=0;vm.runInContext(jumpLand,h.ctx);
      assert.equal(h.e.x,h.e.jumpX);assert.equal(h.e.y,h.e.jumpY);
      assert.deepEqual(h.hits,[180]);assert.equal(h.e.s,'bossShock');assert.equal(h.e.shockMax,800);
    }
  });
  test(`${file}: actual landing retains strict radius, invulnerability and charge exemptions`,()=>{
    for(const [distance,iframes,state,expected] of [[299,0,'idle',1],[300,0,'idle',0],[301,0,'idle',0],[250,1,'idle',0],[250,0,'charge',0]]){
      const h=harness();h.e.s='bossJump';h.e.st2=0;h.P.x=h.e.jumpX+distance;h.P.iframes=iframes;h.P.s=state;
      vm.runInContext(jumpLand,h.ctx);assert.equal(h.hits.length,expected);
    }
  });
  test(`${file}: fan warning edges match real first and last emitted projectiles in every phase`,()=>{
    for(let phase=0;phase<=4;phase++){
      const h=harness();h.e.s='bossFanWind';h.e._bossPhase=phase;
      const before=JSON.stringify({e:h.e,P:h.P,G:h.ctx.G});
      vm.runInContext(fanDraw,h.ctx);
      assert.equal(h.ctx.X.globalAlpha,.7);assert.equal(JSON.stringify({e:h.e,P:h.P,G:h.ctx.G}),before);
      assert.equal(h.projectiles.length,0);
      const edge=h.arcs[0];assert.equal(edge[2],120);
      h.e.st2=0;vm.runInContext(fanFire,h.ctx);
      assert.equal(h.projectiles.length,Math.trunc(10*(1+(phase-1)*.12)));
      const first=h.projectiles[0],last=h.projectiles.at(-1);
      assert.ok(Math.abs(Math.atan2(first.vy,first.vx)-edge[3])<1e-12);
      assert.ok(Math.abs(Math.atan2(last.vy,last.vx)-edge[4])<1e-12);
      assert.equal(h.e.s,'recover');assert.equal(h.e.st2,45);
      assert.ok(h.projectiles.every(p=>p.life===400&&p.ml===400));
    }
  });
  test(`${file}: unrelated states do not draw either warning`,()=>{
    for(const state of ['idle','bossShock','recover','bossLaserWind']){
      const h=harness();h.e.s=state;vm.runInContext(fanDraw+jumpDraw,h.ctx);assert.equal(h.arcs.length,0);
    }
  });
}
