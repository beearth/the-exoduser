// BX-02/03/05 oracle exporter: runs the ORIGINAL game.html code of the 1-1 dark druid in a Node VM and writes oracle.json (never typed by hand).
// Executed original code: the BOSS_* tables, _bossScore, _bossStartPattern, _bossPhaseCheck, _bossIdleMove, _bossAI, the updateE head lines the port reproduces
// (telegraph timer, sight aggro + facing + chase, ATK reset, _tickProjCharge, st2 clock), the boss dispatcher + the whole `switch(e.s)` (boss states), _spawnBossProjectile,
// spawnProj with its helpers, _fireChargedProj, and the update() hazard blocks (chase AoE, fissure, tide wave, seeker mine, poison pool, druid rhythm volley, druid orb,
// lava pool). NOT covered: the enemy projectile FLIGHT / hit loop (450 lines of shared Q/E parry code) — spawn parameters only.
// Visual-only Math.random() calls (particles) are routed to a second stream (`_vr`) so both sides draw the gameplay stream in the same order.
// usage: node export.cjs [--source G:/exoduser/game.html] [--out oracle.json] [--cases N]
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i<0?d:process.argv[i+1];};
const SRC=path.resolve(arg('--source','G:/exoduser/game.html')),OUT=path.resolve(arg('--out',path.join(__dirname,'oracle.json')));
const text=fs.readFileSync(SRC,'utf8'),lines=text.split('\n'),sha=s=>crypto.createHash('sha256').update(s).digest('hex'),blocks=[];
function at(prefix,occ=0,from=0){let n=0;for(let i=from;i<lines.length;i++)if(lines[i].trimStart().startsWith(prefix)){if(n++===occ)return i+1;}throw new Error('source drift: no line starts with "'+prefix+'"');}
function rec(a,b,label){const body=lines.slice(a-1,b).join('\n');blocks.push({label,from:a,to:b,sha256:sha(body)});return body+'\n';}
function line(prefix,occ=0,from=0){const n=at(prefix,occ,from);return rec(n,n,prefix.slice(0,40));}
function fnFrom(a,label){let depth=0,started=false,str=null,esc=false;
 for(let i=a-1;i<lines.length;i++){const s=lines[i];for(let c=0;c<s.length;c++){const ch=s[c],nx=s[c+1];
  if(str){if(esc)esc=false;else if(ch==='\\')esc=true;else if(ch===str)str=null;continue;}
  if(ch==='/'&&nx==='/')break;if(ch==="'"||ch==='"'||ch==='`'){str=ch;continue;}
  if(ch==='{'){depth++;started=true;}else if(ch==='}')depth--;}
  if(started&&depth===0)return rec(a,i+1,label);}throw new Error('unbalanced '+label);}
function fn(prefix,occ=0,from=0){return fnFrom(at(prefix,occ,from),prefix.slice(0,40));}
function between(a,b,label){return rec(a,b,label);}
const visual=new Set();   // lines whose Math.random() draws are particle-only
const VISCALL=/poolPart\(|addParts\(|deathFX\(|playVFXAng\(|_addBoom\(|_addImpact\(|_spawnSmoke\(|_addBlastLight\(|_addTp[A-Za-z]+\(/;
const GAMEPLAY=/_spawnBossProjectile\(|hurt[PE]\(|mkEn\(|spawnProj\(/;
// A Math.random() is particle-only when its line calls a particle function, or when the line only declares loop variables and the NEXT line calls one
// (`for(...){const a=..,sp=4+Math.random()*5;` / `const spd2=3+Math.random()*4;` followed by the poolPart line). Every routed line is listed in oracle.json (visualLines).
function vis(src){
 const ls=src.split('\n');
 return ls.map((l,i)=>{
  if(!l.includes('Math.random()'))return l;
  const next=ls[i+1]||'';
  const own=VISCALL.test(l)&&!GAMEPLAY.test(l);
  const loopVars=!VISCALL.test(l)&&VISCALL.test(next)&&!GAMEPLAY.test(l+next)&&/^\s*(for\(.*\)\{)?\s*(const [^;]*;)+\s*$/.test(l.replace(/\/\/.*$/,'').replace(/^\s*for\(.*?\)\s*\{/,'{').replace(/^\{/,''));
  if(own||loopVars){visual.add(l.trim().slice(0,110));return l.replace(/Math\.random\(\)/g,'_vr()');}
  return l;
 }).join('\n').replace(/poolPart\(/g,'_NOP&&poolPart(');
}

// ---- original code ----
const iUpdate=at('function updateE(e,sp){');
const T0=at('const BOSS_MOVES=['),T1=at("_BOSS_MOVESET[0]=new Set(_BOSS_MOVESET[3]);");
const SRC_TABLES=between(T0,T1,'BOSS tables');
const SRC_AIFN=[fn('function _bossScore('),line('const _HELL_ABERRANT_FACE'),line('const _PARRYABLE_ATK'),fn('function _bossStartPattern('),fn('function _bossPhaseCheck('),fn('function _bossIdleMove('),fn('function _bossAI(')].join('');
const SRC_HELP=[line('function _isNormalDruidBoss('),fn('function _isDruidFinale('),fn('function _spawnBossProjectile('),fn('function spawnProj('),fn('function _mkProj('),fn('function _resetProj('),fn('function _projectileParryClass('),
 line('function _isEnemyMagicBullet('),line('function _normalizeEnemyBulletSpeed('),line('const ENEMY_BULLET_SPEED_MIN'),line('const ENEMY_BULLET_SPEED_MAX'),line('const ENEMY_MAGIC_BULLET_SPEED_MIN'),line('const ENEMY_MAGIC_BULLET_SPEED_MAX'),
 line('const ENEMY_RAINBOW_BULLET_SPEED_MIN'),line('const ENEMY_RAINBOW_BULLET_SPEED_MAX'),line('function _rollEnemyBulletSpeed('),line('function _rollEnemyMagicBulletSpeed('),line('function _rollEnemyRainbowBulletSpeed('),
 fn('function _prepareDarkSphere('),fn('function _druidPoisonPoolTargets('),fn('function _druidParryVolleySpec('),fn('function _fireChargedProj('),fn('function _tickProjCharge('),fn('function _cancelProjCharge('),line('function elMul('),fn('function safePt('),line('function canMv('),fn('function _ffMoveE('),fn('function _poiseReset(')].join('');
// updateE head lines the port reproduces
const iL1=at('if(e.stunned>0)e.stunned-=sp;');
const SRC_L1=[line('if(e.stunned>0)e.stunned-=sp;'),line('if(e._hitStun>0)e._hitStun-=sp;',0,iL1-1),line('if(e._pImmune>0)e._pImmune-=sp;',0,iL1-1),line('if(e.stunned<=0&&e._maxStunned)',0,iL1-1),line('if(e.reviveIframes>0)e.reviveIframes=Math.max(0,e.reviveIframes-sp);',0,iL1-1)].join('');
const SRC_TELE=line('if(e._telegraphT>0){e._telegraphT-=sp',0,iUpdate)+line('if(e.reviveIframes>0){e.reviveIframes=Math.max(0,e.reviveIframes-sp);}',0,iUpdate);
const K0=at('if(Math.abs(e.kb.x)>.1||Math.abs(e.kb.y)>.1){',0,iUpdate),K1=at('// 이동 판정: 이전 위치와 비교',0,K0)-1;
const SRC_KB=between(K0,K1,'updateE knock-back + hit-stun + stun');
const H0=at("if(!e._alerted&&d<800&&(e.s==='idle'||e.s==='recover')&&hasLOS",0,iUpdate),H1=at('// 회전참 피격 스택 감소',0,H0)-1;
const SRC_HEAD=between(H0,H1,'updateE sight aggro + chase');
const SRC_ATKRESET=line('e.atk=_isDruidFinale(e)?_druidFinaleAtk(e):e.baseAtk;',0,iUpdate);
const SRC_PCHG=line('_tickProjCharge(e,sp);',0,iUpdate);
const SRC_CLOCK=line('const _fd0=_ffDir(e.x,e.y);e._moveAng=',0,iUpdate);
const D0=at('if(e.ib&&e.alive)_bossPhaseCheck(e,sp);',0,iUpdate),D1=at("case'eCircle':{",0,D0)-1;
const SRC_DISPATCH=between(D0,D1,'boss dispatcher + switch');
// hazards
const SRC_HAZ={
 chase:fnFrom(at('if(G._chaseAoes&&G._chaseAoes.length>0){'),'chaseAoe update'),
 fissure:fnFrom(at('if(G._fissures&&G._fissures.length>0){'),'fissure update'),
 tide:fnFrom(at('if(G._tideWaves&&G._tideWaves.length>0){'),'tide update'),
 seeker:fnFrom(at('if(G._seekerMines&&G._seekerMines.length>0){'),'seeker update'),
 poison:fnFrom(at('if(G._poisonPools&&G._poisonPools.length>0){'),'poison pool update'),
 volley:(()=>{const a=at('// [DRUID-PARRY-RHYTHM]');return fnFrom(a+1,'druid rhythm volley');})(),
 orb:(()=>{const a=at('// [다크드루이드] orb 탄막');return fnFrom(a+1,'druid orb');})(),
 lava:fnFrom(at('if(G._lavaPools&&G._lavaPools.length>0){'),'lava pool update')};
const tableLineChk=SRC_TABLES;if(!tableLineChk.includes('_BOSS_MOVESET[3].delete(\'cageTrap\')'))throw new Error('source drift: cageTrap');

// ---- seeded RNG (shared with Program.cs) ----
function lcg(seed){let s=seed>>>0;const f=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;f.n++;return s/4294967296;};f.n=0;return f;}
const noop=()=>{};
const W=128*40,H=108*40,Tn=40;
const isWf=(x,y)=>x<80||y<80||x>W-80||y>H-80||(Math.abs(x-W/2)<60&&Math.abs(y-H/2)<60);

const SRC_ALL=vis(SRC_TABLES)+vis(SRC_AIFN)+vis(SRC_HELP)+
 'function bossTick(e){\n'+vis(SRC_L1)+vis(SRC_TELE)+vis(SRC_KB)+'\nlet d=dst(P.x,P.y,e.x,e.y);\n'+vis(SRC_HEAD)+vis(SRC_ATKRESET)+vis(SRC_PCHG)+'\n'+vis(SRC_CLOCK).replace(/const _fd0=_ffDir\(e\.x,e\.y\);e\._moveAng=_fd0\?Math\.atan2\(_fd0\.y,_fd0\.x\):Math\.atan2\(P\.y-e\.y,P\.x-e\.x\);/,'')+'\n'+vis(SRC_DISPATCH)+'}\n}\n'+
 'function hazards(){\n'+['chase','fissure','tide','seeker','poison','volley','orb','lava'].map(k=>vis(SRC_HAZ[k])).join('\n')+'\n}\n'+
 'return {bossTick,hazards,dropCnt:()=>_eProjDropCnt};';
if(process.argv.includes('--dump'))fs.writeFileSync(OUT+'.src.js',SRC_ALL);
const FACT=new Function('scope','with(scope){let _eProjDropCnt=0;let _gcT=0;const sp=1;'+SRC_ALL+'}');
if(!SRC_CLOCK.includes('e.st2-=sp'))throw new Error('source drift: st2 clock');
if(!/e\.st2-=sp;/.test(SRC_CLOCK))throw new Error('source drift: st2 clock 2');

function makeScope(c,rng,vrng,out){
 const e=JSON.parse(JSON.stringify(c.boss));e.kb={x:0,y:0};e._moveCDs=new Array(59).fill(0);e._lastMoves=[];
 const P={x:c.player.x,y:c.player.y,r:15,facing:0,iframes:0,s:'idle',hp:1000,mhp:1000,baseAtk:100,kb:{x:0,y:0},skills:{},poison:0,_webSlow:0,parryBank:0};
 const mapRows=[];for(let ty=0;ty<108;ty++){const row=[];for(let tx=0;tx<128;tx++)row.push(isWf(tx*40+20,ty*40+20)?1:0);mapRows.push(row);}
 const G={stage:c.stage,mw:128,mh:108,map:mapRows,rifts:[],frame:0,bossAlive:true,_bossRef:e,_pStats:{avgDist:200,parryRate:c.stats.parryRate,dashRate:c.stats.dashRate,healRate:c.stats.healRate,kiteRate:c.stats.kiteRate,aggroRate:c.stats.aggroRate,_pH:0},
  shake:0,hitStop:0,slowMo:0,_flashT:0,atkTickets:0,maxAtkTickets:4};
 const projs=[];const st={parryOpen:false};
 const rec=(...a)=>out.ev.push(a);
 const scope={Math:Object.assign(Object.create(Math),{random:rng}),_vr:vrng,_NOP:0,e,P,G,projs,_projFree:[],T:Tn,EL:{P:0,F:1,I:2,D:3,L:4,H:5,E:6},ELC:['#bbbbbb','#ff5522','#3388ff','#9933cc','#ffee00','#ff88cc','#88aa44'],
  window:{},OPT:{bossDebug:false,hitStop:100,shake:100},_HS:{bossPhase:12},_BOSS_PHASE_AURA:['#fff','#fa0','#f80','#f40','#f00'],
  _T:a=>a,_L:(a,b)=>a,addTxt:noop,addParts:noop,poolPart:noop,deathFX:noop,shake:noop,playVFXAng:noop,playSample:noop,_r:()=>1,_reviveVFX:noop,_bossSfx:()=>null,setTimeout:noop,
  _addBlastLight:noop,_addTpSmoke:noop,_addTpImpact:noop,_addTpBolt:noop,_addTpStar:noop,_addTpVland:noop,
  SFX:new Proxy({},{get:()=>noop}),_recycleProj:noop,_ancestorTargetForEnemy:()=>null,_druidFinaleUpdate:()=>false,_druidFinaleAI:noop,_druidFinaleAtk:()=>0,_druidFinaleAct:()=>0,_druidFinaleTrackBurrow:noop,
  _FDG_DRUID_THORN_FIRST:false,
  dst:(a,b,cc,d)=>Math.sqrt((cc-a)**2+(d-b)**2),
  isW:isWf,
  hasLOS:()=>true,_ffDir:(x,y)=>{const a=Math.atan2(P.y-y,P.x-x);return {x:Math.cos(a),y:Math.sin(a)}},atkTicketRelease:noop,isPWin:()=>st.parryOpen,
  hurtP:(d,o)=>rec('hurtP',d,o&&o.dtype==='magic'?1:0),hurtE:(en,d)=>rec('hurtE',d),_poiseHit:(en,a)=>rec('poiseHit',a),doParry:()=>rec('doParry'),
  wp:()=>({atk:50,enh:0}),enhMulAtk:()=>0,pParryDmg:()=>1,ar:()=>({el:0}),_isFocusState:()=>false,_eqAffix:()=>0,
  mkEn:(x,y,s,et,ib,el,room)=>({x,y,hp:1000,mhp:1000,eShield:5,eShieldMax:5,_spawn:[x,y,et,el]}),ens:[],shQuery:(x,y,r)=>[e],
  _ETYPE_SFX:[],_ARCH_SFX:[],ETYPE_RANGE:[400],_noProjEtypes:{},_eMouthXY:()=>({x:0,y:0}),
  _isKiCharging:()=>false,_isFused:()=>false,_now:0,_DEMO_MODE:false,_DEMO_LAST_STAGE:0};
 scope.ens.push(e);
 return {scope,e,P,G,projs,st};
}
const FIELDS=['x','y','s','st2','facing','hp','_bossPhase','bossPatT','bossPatCd','stunned','atk','speed','maxPoise','_comboIdx','_feinting','_meleeStreak','_projChargeT','projT','shockR','_dashIdx','_slashIdx','_bsWave','_weaponAng','_ptT','reviveIframes','_telegraphT','_bossOrbitAng','_bossStrafeCd','_strafeDir','_idleRBT','_alerted','_combatSt','_diveTx','_diveTy','_grabAng','iframes','kbx','kby'];
function snap(e){const o={};for(const k of FIELDS){let v=k==='kbx'?e.kb.x:k==='kby'?e.kb.y:e[k];o[k]=v===undefined?null:(typeof v==='number'&&!Number.isFinite(v)?String(v):(typeof v==='boolean'?(v?1:0):v));}
 o._lm=(e._lastMoves||[]).join(',');o._cs=e._comboSeq?e._comboSeq.join(','):'';o._cd=(e._moveCDs||[]).reduce((a,b)=>a+b,0);return o;}
const R6=v=>typeof v==='number'?(Number.isFinite(v)?Math.round(v*1e6)/1e6:String(v)):v;
function hazSnap(G,P){
 const f=(a,ks)=>(a||[]).map(o=>ks.map(k=>R6(typeof o[k]==='boolean'?(o[k]?1:0):o[k]===undefined?null:o[k])));
 return {chase:(G._chaseAoes||[]).map(c=>[c.cnt,R6(c.t),R6(c.interval),(c.zones||[]).map(z=>[R6(z.x),R6(z.y),R6(z.t),z.hit?1:0,R6(z.explT||0)])]),
  fis:f(G._fissures,['x','y','ang','len','t','exploded','explR']),tide:f(G._tideWaves,['r','t','hitT','gapAng']),mine:f(G._seekerMines,['x','y','vx','vy','t','armT','maxT']),
  pp:f(G._poisonPools,['x','y','t','tickT','dmg']),lava:f(G._lavaPools,['x','y','t','tickT','warnT','dmg']),orb:f(G._druidOrbs,['x','y','vx','vy','t','dmg']),vt:R6(G._druidParryT||0),ot:R6(G._druidOrbT||0),vn:G._druidParryVolley||0};
}
const PROJK=['x','y','vx','vy','dmg','el','life','ml','sz','r','homing','redBean','blackBean','mine','elemBall','_druidPoison','_druidStraight','_druidParryVolley','parryClass','fireMagic','_commit','col','_missileTrail'];
function projSnap(p){return PROJK.map(k=>{const v=p[k];return R6(typeof v==='boolean'?(v?1:0):v===undefined?null:v);});}

function runCase(c){
 const rng=lcg(c.seed),vrng=lcg(c.seed^0x9e3779b9),out={ev:[]};
 const {scope,e,P,G,projs,st}=makeScope(c,rng,vrng,out);
 const api=FACT(scope);
 const ticks=[];let pcount=0;
 for(let t=0;t<c.ticks;t++){
  const s=c.script[t]||c.script[c.script.length-1];
  P.x=s.x;P.y=s.y;P.facing=s.f;st.parryOpen=!!s.parry;P.iframes=s.iframes||0;G.frame=t;
  if(s.hp!==undefined)e.hp=s.hp;
  out.ev=[];const drawsBefore=rng.n,kx=P.kb.x,ky=P.kb.y,px0=P.x,py0=P.y,po0=P.poison,ws0=P._webSlow;
  api.bossTick(e);
  // the web update(): enemy projectile loop (not run) then the hazard blocks
  api.hazards();
  const sp=projs.slice(pcount).map(projSnap);pcount=projs.length;
  const minions=out.ev.filter(a=>false);
  ticks.push({draws:rng.n-drawsBefore,e:snap(e),ev:out.ev.map(a=>a.map(R6)),kb:[R6(P.kb.x-kx),R6(P.kb.y-ky)],pp:[R6(P.x-px0),R6(P.y-py0)],piframes:R6(P.iframes),poison:R6(P.poison-po0),webSlow:R6(P._webSlow),spawn:sp,haz:hazSnap(G,P),drop:api.dropCnt(),
   mq:(scope.ens.length-1)});
  P.kb.x=0;P.kb.y=0;P._webSlow=Math.max(0,P._webSlow);
  // grab sets P.x/P.y: the script position is re-applied next tick
  G._pStats=G._pStats;
 }
 return {id:c.id,seed:c.seed,stage:c.stage,boss:c.boss,player:c.player,stats:c.stats,script:c.script,ticks:ticks.length,out:ticks};
}
function baseBoss(r,lv){
 const mhp=[21017,116532,19656000,1500000000][lv%4],atk=[46,62,219,780][lv%4];   // EnemyState.Hp is an int: the Lv500 boss (2.3e9 hp) is out of range there
 return {x:Math.round(W/2+(r()-.5)*800),y:Math.round(H/2+(r()-.5)*800),r:44,hp:mhp,mhp,atk,baseAtk:atk,speed:.5,baseSpd:.5,maxPoise:mhp,poise:mhp,poiseR:0,ib:true,etype:0,el:0,col:'#bbbbbb',alive:true,s:'idle',st2:+(30+r()*50).toFixed(4),facing:+(r()*6.283).toFixed(4),
  projCd:50,projT:+(70+r()*50).toFixed(4),bossPatCd:35,bossPatT:+(30+r()*20).toFixed(4),_bossPhase:0,_combatSt:'engage',_bossOrbitAng:+(r()*6.283).toFixed(4),_bossStrafeCd:0,reviveIframes:0,stunned:0,room:0,lv:100,_alerted:false,deaths:0};
}
function makeCases(n){
 const cases=[],r=lcg(20261027);
 for(let i=0;i<n;i++){
  const kind=i%8,stage=i%5===4?3:0,seed=1000+i*7919;
  const boss=baseBoss(r,i);
  const cx=W/2+(r()-.5)*600,cy=H/2+(r()-.5)*600;
  const ticks=[900,1100,1400][i%3];
  const script=[];let ang=r()*6.28;
  for(let t=0;t<ticks;t++){
   let x,y;
   if(kind===0){x=cx+120;y=cy;}                                     // statue next to the boss area: melee loop
   else if(kind===1){ang+=.012;x=cx+Math.cos(ang)*260;y=cy+Math.sin(ang)*260;}   // slow orbit
   else if(kind===2){ang+=.03;x=cx+Math.cos(ang)*420;y=cy+Math.sin(ang)*420;}   // fast wide orbit
   else if(kind===3){x=cx-300+((t*1.7)%600);y=cy+Math.sin(t*.02)*200;}          // strafing
   else if(kind===4){x=boss.x+60;y=boss.y+10;}                                   // hugging the boss
   else if(kind===5){x=boss.x+700;y=boss.y;}                                     // far (range moves)
   else if(kind===6){ang+=.02;x=boss.x+Math.cos(ang)*150;y=boss.y+Math.sin(ang)*150;}
   else {x=cx;y=cy+((t%200)<100?0:90);}
   x=Math.min(W-200,Math.max(200,x));y=Math.min(H-200,Math.max(200,y));
   const s={x:+x.toFixed(3),y:+y.toFixed(3),f:+(Math.atan2(boss.y-y,boss.x-x)).toFixed(4)};
   if(i%3===0&&t%97>=40&&t%97<56)s.parry=1;          // E window pulses
   if(i%4===1&&t%150<30)s.iframes=20;                // iframe pulses
   // HP drops walk the four phase transitions
   const hf=t<ticks*.15?1:t<ticks*.35?.75:t<ticks*.55?.5:t<ticks*.75?.3:.1;
   if(i%2===0&&(t===0||[Math.floor(ticks*.15),Math.floor(ticks*.35),Math.floor(ticks*.55),Math.floor(ticks*.75)].includes(t)))s.hp=Math.floor(boss.mhp*hf);
   script.push(s);
  }
  cases.push({id:'c'+i,seed,stage,boss,player:{x:script[0].x,y:script[0].y},stats:{parryRate:i%5===1?.5:0,dashRate:i%6===2?.6:0,healRate:i%7===3?.4:0,kiteRate:i%7===4?.4:0,aggroRate:i%9===5?.6:0},ticks,script});
 }
 return cases;
}
const n=+arg('--cases','24');
const cases=makeCases(n).map(runCase);
// coverage: which states / moves / draws the cases reached (a case set that never reaches a move proves nothing)
const states=new Set(),moves=new Set();let totalTicks=0,totalDraws=0,spawns=0;
for(const c of cases)for(const t of c.out){states.add(t.e.s);totalTicks++;totalDraws+=t.draws;spawns+=t.spawn.length;}
fs.writeFileSync(OUT,JSON.stringify({generated:new Date().toISOString(),source:sha(text),blocks,visualLines:[...visual],cases,coverage:{states:[...states].sort(),ticks:totalTicks,draws:totalDraws,spawns}}));
console.log('cases',cases.length,'ticks',totalTicks,'draws',totalDraws,'projectile spawns',spawns,'states',[...states].sort().join(','));
console.log('visual-only lines routed to _vr:',visual.size);
