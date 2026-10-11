import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

for(const file of ['game.html','game-easy-test.html']){
 const src=fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
 const start=src.indexOf('function _drawKiSlashFrame('),end=src.indexOf('// ── VFX 스프라이트시트 시스템',start);
 function setup(gpu,shadow=false){
  const quads=[],blends=[],draws=[],canvas={},img={width:1280,height:1280};
  const ctx={canvas:gpu?canvas:{},globalAlpha:1,save(){},restore(){},translate(){},rotate(){},drawImage(...a){draws.push(a)}};
  const c={x:30,y:40,ang:0,life:10,ml:20,step:1,silvArc:false,_th:0,trail:Array.from({length:5},()=>({x:20,y:40})),active:true};
  const env={C:canvas,_useGPU:false,_useGL:gpu,_tq:[0,1,2,3,4,5,6,7],_tQuad(){},_getTex:x=>x,_setTex(){},_quad:(...a)=>quads.push(a),_setBlend:b=>blends.push(b),_kiSlashPalette:c=>c.step===3?2:c.silvArc?1:0,
   _kiSlashRadiant:{surfaces:[img,img,img],shadow:shadow?img:undefined,fw:1280/3,fh:1280/3},_CRES_IMG:{complete:false},_CRES_MAX:2,_crescents:[c,{...c,step:3}],_drawKiHitShadows(){}};
  vm.createContext(env);vm.runInContext(src.slice(start,end),env);return {env,ctx,quads,blends,draws};
 }
 test(file+': native additive rendering preserves faint trails and restores the normal blend',()=>{
  const t=setup(true);t.env.renderCrescents(t.ctx);
  assert.deepEqual(t.blends,[true,false]);assert.equal(t.quads.length,8);
  assert.deepEqual(t.quads.map(q=>q[12]),[.08,.18,.18,1,.08,.18,.3,1]);
  for(const q of t.quads)assert.deepEqual(q.slice(12,16),Array(4).fill(q[12]));
 });
 test(file+': Canvas2D uses the same four sprite layers without touching GPU state',()=>{
  const t=setup(false);t.env.renderCrescents(t.ctx);
  assert.equal(t.draws.length,8);assert.equal(t.quads.length,0);assert.equal(t.blends.length,0);
 });
 test(file+': silver+black — black ink layer draws with normal blend under each blade, then additive resumes',()=>{
  const t=setup(true,true);t.env.renderCrescents(t.ctx);
  // 검기마다: 일반 합성(false)으로 검은 층 1장 → 가산(true) 복귀 → 실버 4층. 끝에 일반 합성 복구
  assert.deepEqual(t.blends,[true,false,true,false,true,false]);
  assert.equal(t.draws.length,2);assert.equal(t.quads.length,8);
  const t2=setup(false,true);t2.env.renderCrescents(t2.ctx);
  assert.equal(t2.draws.length,10);assert.equal(t2.blends.length,0);
 });
 test(file+': an idle scene causes no extra GPU blend changes',()=>{
  const t=setup(true);t.env._crescents.forEach(c=>c.active=false);t.env.renderCrescents(t.ctx);
  assert.equal(t.blends.length,0);assert.equal(t.quads.length,0);
 });
}
