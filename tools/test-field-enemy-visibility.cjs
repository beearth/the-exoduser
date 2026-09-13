const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function fn(s,name){const a=s.indexOf('function '+name+'(');assert.ok(a>=0);let d=0;for(let i=s.indexOf('{',a);i<s.length;i++){if(s[i]==='{')d++;if(s[i]==='}'&&!--d)return s.slice(a,i+1)}}
for(const file of ['game.html','game-easy-test.html']){
 const s=fs.readFileSync(file,'utf8'),shots=[];
 const c=vm.createContext({G:{cam:{x:0,y:0}},VW:1280,VH:720,P:{x:0,y:0},EL:{F:1},spawnProj:p=>shots.push(p),_fbEsca:m=>m,_fbElCol:()=>'',_fdEye:m=>m,SFX:{},shake(){},poolPart(){},_FB_EN_CHG:180,_FD_EN_CHG:180});
 for(const name of ['_fieldEnemyCanShoot','_fbFireEnergy','_fdFireEnergy','_wmFire'])vm.runInContext(fn(s,name),c);
 for(const [x,y,ok] of [[0,0,true],[576,296,true],[577,0,false],[0,297,false],[-700,0,false],[0,-500,false]])assert.equal(c._fieldEnemyCanShoot({x,y}),ok);
 for(const fire of ['_fbFireEnergy','_fdFireEnergy','_wmFire']){const before=shots.length;c[fire]({x:900,y:0,r:100,atk:10,el:1});assert.equal(shots.length,before);c[fire]({x:0,y:0,r:100,atk:10,el:1});assert.equal(shots.length,before+1)}
 for(const [name,obj,end] of [['_fbTickOne','fb','  // ═══ 순간이동:'],['_fdTickOne','m','  if(m.tpCd>0){']]){
  const code=fn(s,name),start=code.indexOf('  const _canShoot=');assert.ok(start>=0);
  const attack=code.slice(start,code.indexOf(end,start));
  c[obj]={x:900,y:0,r:100,atk:10,t:1,shotCd:0,enChg:1,burst:3,burstGap:0};
  const before=shots.length;vm.runInContext('{'+attack+'}',c);
  assert.equal(shots.length,before);assert.equal(c[obj].enChg,0);assert.equal(c[obj].burst,0);
  c[obj].x=0;vm.runInContext('{'+attack+'}',c);assert.equal(shots.length,before);assert.equal(c[obj].enChg,179,'re-entering starts a full visible charge');
 }
 c.G._camZoom=2;assert.equal(c._fieldEnemyCanShoot({x:300,y:0,_ch1StartMedium:true}),false);
 assert.ok(fn(s,'_emitEnemyShot').includes('if(e._ch1StartMedium&&!_fieldEnemyCanShoot(e))return null;'));
 assert.ok(fn(s,'_tickEnemyShotWarnings').includes('(e._ch1StartMedium&&!_fieldEnemyCanShoot(e))'));
}
console.log('PASS: both game variants block offscreen miniboss shots, cancel charged volleys, restart visible windup, and gate medium-eye delayed shots.');
