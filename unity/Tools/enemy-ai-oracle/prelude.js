var window=this;var _useGPU=false,_useGL=false,_ESPRITES=[];
var P={x:1000,y:1000,lv:100,r:10,iframes:0,s:'idle',facing:0,kb:{x:0,y:0},_freezeSlow:0,mhp:1000},OPT={diff:5},G={stage:0,_stageDiffOff:0,rifts:[],atkTickets:0,maxAtkTickets:3,kills:0};
var _DEMO_MODE=false,_DEMO_LAST_STAGE=0,ens=[],IS_MOBILE=false,VW=1600,VH=900,_gameFrame=0,_mSfxPlaying=0,_deadPool=[],projs=[];
var __seq=[],__i=0,__log=[],__clock=[],__ci=0,__setup=null,__SNAP=[];
Math.random=function(){if(__i>=__seq.length)throw new Error("random sequence exhausted");return __seq[__i++];};
function __arg(a){if(a&&typeof a==='object'){const i=ens.indexOf(a);if(i>=0)return {e:i};throw new Error('unknown object argument');}return a===undefined?null:a;}
function __rec(name){const a=[];for(let i=1;i<arguments.length;i++)a.push(__arg(arguments[i]));__log.push([name].concat(a));}
function canMv(x,y,r){return true;}function _canMvTile(x,y,r){return true;}function isW(x,y,f){return false;}function hasLOS(a,b,c,d){return false;}function _eWallStuck(x,y){return false;}
function _ffMoveE(e,sp,mul){e.x+=sp*mul;e.y+=sp*mul*0.5;}function _ffDir(){return null;}
function _pushOutWall(e){}function hurtE(e,d,a,ns,o,el){if(o&&o.dot)__rec('hurtE',e,d,a,!!ns,!!o.dot,!!o.shieldHit,!!o.maliceHunt,el);}function _cancelProjCharge(e){e._projChargeT=0;e._projChargeCol=null;e._projChargeBean=null;e._projChargeParryClass=null}
function _T(s){return s;}function _L(a,b){return a;}function addTxt(x,y,s,c,l){__rec('txt',s);}function addParts(x,y,c,n){__rec('parts',n);}
var SFX={block:function(){__rec('sfx','block');},charge:function(){__rec('sfx','charge');},groggy:function(){__rec('sfx','groggy');},magic:function(n){__rec('sfx','magic');},detonate:function(){__rec('sfx','detonate');}};
function shake(n){__rec('shake',n);}function playSample(n,v,r){}function _r(a,b){return a+b*0.5;}function poolPart(){}function _addBoom(){}function bigImpact(){}
var performance={now:function(){if(__ci>=__clock.length)throw new Error('clock exhausted');return __clock[__ci++];}};
function hurtP(d,o){__rec('hurtP',d,!!(o&&o.dtype==='magic'));}
function ar(){return {el:P.__armEl===undefined?0:P.__armEl};}
function isPWin(){return !!P.__pwin;}
function doParry(a,x,y,f,el){__rec('doParry',a,x,y);}function _poiseHit(e,a){__rec('poiseHit',e,a);}
function shQuery(x,y,r){const out=[];const cx0=~~((x-r)/128),cx1=~~((x+r)/128),cy0=~~((y-r)/128),cy1=~~((y+r)/128);
 for(const o of ens){if(!o.alive)continue;const cx=~~(o.x/128),cy=~~(o.y/128);if(cx>=cx0&&cx<=cx1&&cy>=cy0&&cy<=cy1)out.push(o);}return out;}
function _reviveVFX(){}
function teleportE(e,nx,ny,col,n){if(!canMv(nx,ny,e.r))return false;const r=e.r||12;e.x=nx;e.y=ny;__rec('tp',nx,ny);
 if(!e.ib&&P.iframes<=0&&P.s!=='charge'){const landR=(r+10)*2;if(dst(P.x,P.y,nx,ny)<landR+P.r){hurtP(~~(e.atk*10.5*elMul(e.el,ar().el)));eModHitP(e);const la=Math.atan2(P.y-ny,P.x-nx);P.kb.x+=Math.cos(la)*120;P.kb.y+=Math.sin(la)*120;addTxt(P.x,P.y-25,'충격파!',col,30);}}return true;}
function _emitEnemyShot(e,p){__rec('shot',p.x,p.y,p.vx,p.vy,p.dmg,p.el,p.life,p.ml,p.col,p.sz,!!p.redBean,!!p.homing,!!p.fireMagic,!!p._commit,!!p.web);return null;}
function spawnProj(p){__rec('proj',p.x,p.y,p.vx,p.vy,p.dmg,p.el,p.life,p.ml,p.col,p.sz,!!p.redBean,!!p.homing,!!p.fireMagic,!!p.blackBean,!!p._commit);return null;}
function _spawnBossProjectile(e,p){if(e&&!e.ib&&!p.friendly&&(p.vx||p.vy)){__rec('shot',p.x,p.y,p.vx,p.vy,p.dmg,p.el,p.life,p.ml,p.col,p.sz,!!p.redBean,!!p.homing,!!p.fireMagic,!!p._commit,!!p.web);return null;}
 __rec('zone',p.x,p.y,p.life,p.sz,p.dmg,p.web?'web':p.trap?'trap':p.iceZone?'iceZone':p.blizzard?'blizzard':'?',p.el);return null;}
function _druidFinaleUpdate(){return false;}function _bossPhaseCheck(){}function _bossIdleMove(){}function _bossAI(){}function _recycleProj(){}
function playVFXAng(){}function _isKiCharging(){return false;}function _isFused(){return false;}function pDotDur(){return 1}function pDotDmg(){return 1}

// 예고음은 기존 playSample처럼 이 전투 상태 하니스의 음향 범위 밖이다.
function _playTell(){}
