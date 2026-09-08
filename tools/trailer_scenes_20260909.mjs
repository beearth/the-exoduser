// Runtime staging for local, unsaved trailer takes. No production save writes.
export const resetScene = `window.__resetTake=(count=0,level=35,radius=270)=>{
 G.on=true;G.paused=true;G._fbSpawned=true;G._fdSpawned=true;G._fieldBosses=[];G._fieldBoss=null;G._fireDevils=[];G.spawnHoles=[];G.pets=null;G._irisOff=true;
 ens.length=0;projs.length=0;pProjs.length=0;worldItems.length=0;G._fireZones=[];G.txts.length=0;_vfxAnims.length=0;_fireExps.length=0;_corpses.forEach(c=>c.active=false);G._gSlamWave=null;G._flashT=0;G.chromaT=0;G.shake=0;G.hitStop=0;G.slowMo=0;
 P.x=4000;P.y=5840;G.cam.x=P.x;G.cam.y=P.y;P.s='idle';P.st2=0;P.hp=P.mhp;P.mp=P.mmp;P.st=P.mst;P.iframes=999999;P._dead=false;P._ioActive=false;P._ioCd=0;P._gslCd=0;P._ancCd=0;P._lvCd=0;P._sbCd=0;P._sbParryT=0;P._fused={};P.skills.guardian=0;P.skills.fireAura=0;P.skills.holyDome=0;P._hdCd=999999;
 P.activeChargeSk='charge';P.activeCtSk='iceOrb';P.activeQSk='detonate';BINDS.charge='ShiftLeft';BINDS.beam='mouse2';BINDS.weapon='mouse0';
 for(const k in K)K[k]=false;for(let i=0;i<3;i++){MB[i]=false;MBjust[i]=false;}_harpActive=false;_dashActive=false;_dashHold=false;_harpGauge=_HARP_GAUGE_MAX;
 const oldLevel=P.lv;P.lv=level;
 for(let i=0;i<count;i++){const angle=i*2.3999632297,r=radius+(i%9)*20;const e=mkEn(P.x+Math.cos(angle)*r,P.y+Math.sin(angle)*r,0,[0,1,3,4,6,7][i%6],false,EL.P);if(e)ens.push(e);}
 P.lv=oldLevel;shRebuild();return {count:ens.length,monsterLevel:level,hp:ens[0]?.hp,shield:ens[0]?.eShield};
};`;
export const rageEvents=[];
for(let i=0;i<5;i++){
 const t=1+i*1.05;
 rageEvents.push({at:t,code:`for(let i=0;i<3;i++){const a=${i}*.8+i*2.094;spawnProj({x:P.x+Math.cos(a)*320,y:P.y+Math.sin(a)*320,vx:-Math.cos(a)*5,vy:-Math.sin(a)*5,el:EL.F,magic:true,fireMagic:true,dmg:12,r:8,sz:14,life:240,_commit:true});}`});
 rageEvents.push({at:t+.25,code:"K.KeyQ=true;"},{at:t+.65,code:"K.KeyQ=false;"});
}
rageEvents.push({at:7.3,code:'G.paused=true;'});
export const fireEvents=[];
for(let i=0;i<6;i++){
 const t=1+i;
 fireEvents.push({at:t,code:`mouse.x=VW/2+${i%2?-800:800};mouse.y=VH/2;dispatchEvent(new KeyboardEvent('keydown',{code:'ShiftLeft',key:'Shift',bubbles:true}));`},
  {at:t+.055,code:"dispatchEvent(new KeyboardEvent('keyup',{code:'ShiftLeft',key:'Shift',bubbles:true}));"},
  {at:t+.12,code:'MB[2]=true;MBjust[2]=true;'},
  {at:t+.42,code:'MB[2]=false;MBjust[2]=false;'});
}
fireEvents.push({at:7.5,code:'_detonateAssaultFlames();'},{at:10.4,code:'G.paused=true;'});
