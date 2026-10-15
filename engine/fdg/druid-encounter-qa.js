import { fitDruidCombatFrame } from './druid-combat-frame.js';
import { placeCombatLabel } from './druid-combat-readability.js';
import { CONTACT_VFX_AUTHORING_POLICY, contactVfxAlpha as resolveContactVfxAlpha } from './druid-contact-vfx.js';

// Explicit public controls for an isolated native encounter. No input or combat simulation.
export function installDruidEncounterQa(options) {
  const {scope,storage,getState,patterns,forcePattern,setPhase,saveNativeSettings,clearProjectiles,refreshHUD}=options;
  if(!storage.active)return null;
  const combatR7=options.combatFraming===true;
  const readabilityR8=options.combatReadability===true;
  const contactVfxR9=options.contactVfxReadability===true;
  const thornFirst=options.thornVolley===true;
  let readabilityFrame=null;
  const events=[],states=[],costs=[],wrappers=[];
  const settings=storage.ownSettings;
  const config={scale:1,distance:340,pattern:'slam',phase:0,...settings?.opt?.fdgDruidQaControls};
  let mode='ready',lastState='',ready=false,lastHp=null,lastBoss=null,drawWrapped=false,cameraLock=null,combatFrame=null;
  const observed=new WeakMap();
  const record=(type,detail={})=>{events.push({ms:Math.round(performance.now()),type,mode,...detail});if(events.length>512)events.shift();};
  const syncBoss=e=>{if(e&&e!==lastBoss){const replaced=lastBoss!==null;const {P}=getState();lastBoss=e;lastState='';lastHp=null;if(replaced&&P?.hp>0&&e.hp>0&&e.alive!==false)mode='ready';}return e;};
  const boss=()=>{const current=getState().ens.find(e=>e.ib&&e.alive!==false);if(current)scope._btBoss=current;return syncBoss(current||scope._btBoss);};
  const combatModes=new Set(['ready','forced-pattern','native-ai','player-dead']);
  // Frozen previews still need live render bounds; this never advances native physics.
  const combatFramingActive=e=>{if(!combatR7)return false;e=e===undefined?boss():e;return combatModes.has(mode)&&!!e&&e.alive!==false&&e.hp>0;};
  const wrap=(name,after,before)=>{
    const original=scope[name];if(typeof original!=='function')return;
    const replacement=function(...args){const context=before?.(args);const result=original.apply(this,args);after?.(args,result,context);return result;};
    scope[name]=replacement;wrappers.push({name,original,replacement});
  };
  wrap('_resetProj',(args)=>observed.delete(args[0])); // A pooled object begins a new shot when native spawn resets it.
  wrap('_bossStartPattern',(args)=>record('native-pattern-start',{id:args[1]?.id,phase:args[3],state:args[0]?.s,st2:args[0]?.st2}));
  wrap('doParry',(args)=>{
    const {P,projs}=getState();const q=!!(args[3]||P?.s==='sBlock'||P?.s==='peaceShield'||P?._sbParryT>0);
    const near=projs.find(p=>Math.hypot(p.x-(args[1]??P.x),p.y-(args[2]??P.y))<3);
    record('native-parry',{input:q?'Q':'E',impactKind:args[6]??null,projectile:near?{class:near.parryClass,blackBean:!!near.blackBean,blueBean:!!near.blueBean,fromRainbow:!!near._fromRainbow,elemBall:!!near.elemBall,druidStraight:!!near._druidStraight,friendly:near.friendly}:null});
  });
  wrap('hurtP',(args,result,previous)=>{
    const {P}=getState();if(previous&&P&&P.hp!==previous.hp)record('native-player-damage',{requested:args[0],delta:previous.hp-P.hp,hp:P.hp,opts:args[1]||null});
  },()=>{const {P}=getState();return P?{hp:P.hp}:null;});
  if(combatR7)wrap('hurtE',(args,result,previous)=>{
    const e=args[0];if(!previous)return;
    const {P}=getState(),hpDelta=previous.hp-e.hp,shieldDelta=previous.eShield-(e.eShield||0);
    if(hpDelta>0||shieldDelta>0)record('native-boss-contact',{requested:args[1],hpDelta,shieldDelta,hp:e.hp,eShield:e.eShield||0,playerState:P?.s,playerStateTicks:P?.st2,opts:args[4]||null});
  },args=>{const e=args[0];return e?.ib&&e===lastBoss?{hp:e.hp,eShield:e.eShield||0}:null;});
  wrap('updateE',(args)=>{
    const e=args[0];if(!e?.ib)return;
    const {P,G,projs}=getState();
    syncBoss(e);
    const key=e.s;if(key!==lastState){lastState=key;const state={ms:Math.round(performance.now()),mode,state:key,st2:e.st2,x:e.x,y:e.y,facing:e.facing,hp:e.hp,playerHp:P?.hp};states.push(state);if(states.length>256)states.shift();record('native-state',state);}
    for(const p of projs){
      if(!p._druidStraight)continue;
      const prior=observed.get(p);
      if(!prior){observed.set(p,{friendly:p.friendly,vx:p.vx,vy:p.vy});record('native-shot',{class:p.parryClass,blackBean:!!p.blackBean,elemBall:!!p.elemBall,speed:Math.hypot(p.vx,p.vy),damage:p.dmg,...(p._druidThornVolley?{thornVolley:true,lane:p._druidThornLane,x:p.x,y:p.y,vx:p.vx,vy:p.vy,life:p.life,ml:p.ml,homing:!!p.homing}: {})});}
      else if(!prior.friendly&&p.friendly){prior.friendly=true;record('native-reflection',{class:p.parryClass,fromRainbow:!!p._fromRainbow,blueBean:!!p.blueBean,elemBall:!!p.elemBall,homing:!!p.homing});}
    }
    if(lastHp!==null&&e.hp<lastHp)record('native-boss-damage',{delta:lastHp-e.hp,hp:e.hp});lastHp=e.hp;
    if(P?.hp<=0&&mode!=='player-dead'){mode='player-dead';record('native-player-death',{hp:P.hp,on:G.on});}
    if((e.hp<=0||e.alive===false)&&mode!=='boss-defeated'){mode='boss-defeated';record('native-boss-defeated',{hp:e.hp,on:G.on});}
  });
  const panel=document.createElement('section');panel.id='fdgDruidQaPanel';panel.setAttribute('aria-label',thornFirst?'드루이드 나무가시 공격 QA':contactVfxR9?'드루이드 접촉 VFX QA r9':readabilityR8?'드루이드 전투 QA r8':combatR7?'드루이드 전투 QA r7':'드루이드 네이티브 QA r4');
  panel.style.cssText='position:fixed;right:10px;top:10px;width:266px;max-height:88vh;overflow:auto;z-index:99999;padding:12px;background:rgba(10,17,18,.94);border:1px solid #65a88c;border-radius:8px;color:#e4eee8;font:12px system-ui;line-height:1.5';
  const leaf=(tag,text,parent=panel)=>{const n=document.createElement(tag);n.textContent=text;parent.append(n);return n;};
  leaf('strong',thornFirst?'DARK DRUID · 나무가시':contactVfxR9?'DARK DRUID · r9':readabilityR8?'DARK DRUID · r8':combatR7?'DARK DRUID · Combat QA r7':'DARK DRUID · Native QA r4');
  leaf('p','격리된 전투 시험 · Lv1 기본값\nQ 마법 / E 물리 · WASD 이동 · 방향 더블탭 / Shift 이동');
  leaf('p','패턴·위치·HP·페이즈 버튼은 QA 설정입니다. AI 시작은 기존 보스 AI를 실행합니다.');
  if(thornFirst)leaf('p','fan · 물리 가시 8발(E) + 마법탄 4발(Q) · 발사 후 직진 · 준비/발사/회복 포즈');
  const status=leaf('output','부팅 대기');status.style.cssText='display:block;white-space:pre-wrap;color:#acd8bf;margin:8px 0';
  const button=(text,action)=>{const b=leaf('button',text);b.style.cssText='margin:3px;padding:5px 7px;background:#223c32;color:#e4eee8;border:1px solid #547264;border-radius:4px;cursor:pointer';b.addEventListener('click',()=>{if(!ready)return;action();});return b;};
  let combatStyle=null;
  if(combatR7){
    combatStyle=document.createElement('style');
    combatStyle.textContent='#fdgDruidQaPanel.fdg-combat-compact{width:172px!important;padding:8px!important}#fdgDruidQaPanel.fdg-combat-compact>:not(strong):not(output):not(#fdgDruidCombatToggle){display:none!important}body.fdg-druid-combat-r7 #petSubtitle{visibility:hidden!important}';
    document.body.append(combatStyle);document.body.classList.add('fdg-druid-combat-r7');
    if(readabilityR8){
      combatStyle.textContent+='body.fdg-druid-readability-r8 #areaTitle{top:12px;left:285px;width:330px;text-align:left}body.fdg-druid-readability-r8 #areaTitle::before,body.fdg-druid-readability-r8 #areaTitle::after{width:8%}body.fdg-druid-readability-r8 #fdgDruidQaPanel.fdg-combat-compact{max-height:170px}';
      document.body.classList.add('fdg-druid-readability-r8');
    }
    if(contactVfxR9){combatStyle.textContent+='body.fdg-druid-contact-vfx-r9 #fdgDruidQaPanel.fdg-combat-compact{max-height:190px}';document.body.classList.add('fdg-druid-contact-vfx-r9');}
    const toggle=button('전투 보기 / 설정',()=>{panel.classList.toggle('fdg-combat-compact');record('qa-combat-view',{compact:panel.classList.contains('fdg-combat-compact')});});toggle.id='fdgDruidCombatToggle';
    leaf('p','r7 전투 카메라 · 전신/무기 경계 추적 · 펫 대사는 시험 화면에서만 숨깁니다. 원 대사와 발동은 유지됩니다.');
  }
  if(contactVfxR9)leaf('p','r9 저작용 표시 · 접촉 겹침만 잔광 16% / 연기 12%, 첫 8프레임 타격·패링 스파크 유지. 후반 60~100% 구간의 페이드는 native 수명과 판정을 바꾸지 않습니다.');
  if(thornFirst&&typeof options.previewParryContact==='function')button('Q 패링 효과 미리보기',()=>{options.previewParryContact();record('qa-contact-preview',{kind:'dark02'});});
  button('AI 시작',()=>{const e=boss();if(!e)return;mode='native-ai';if(combatR7){cameraLock=null;combatFrame=null;panel.classList.add('fdg-combat-compact');record('qa-combat-view',{compact:true});}scope._btPaused=false;e._btFrozen=false;e.bossPatT=30;scope._btFramePause=false;record('qa-ai-start',{...(combatR7?{cameraLockReleased:true,combatFraming:'r7'}:{})});});
  button('물리 정지 / 재개',()=>{scope._btFramePause=!scope._btFramePause;record('qa-physics-pause',{paused:scope._btFramePause});});
  button('1틱 진행',()=>{scope._btFramePause=true;scope._btFrameStep=true;record('qa-physics-step');});
  const select=leaf('select','');select.id='fdgDruidQaPattern';select.setAttribute('aria-label','QA 강제 패턴');select.style.cssText='display:block;width:100%;margin:8px 0';
  for(const p of patterns){const n=leaf('option',p.id,select);n.value=p.id;}select.value=config.pattern;
  select.addEventListener('change',()=>{config.pattern=select.value;});
  button('선택 패턴 실행',()=>{const e=boss();if(!e)return;mode='forced-pattern';scope._btPaused=true;clearProjectiles();scope._btFramePause=false;record('qa-force-pattern',{id:select.value});forcePattern(select.value);});
  button('선택 패턴 준비(정지)',()=>{const e=boss();if(!e)return;mode='forced-pattern';scope._btPaused=true;clearProjectiles();forcePattern(select.value);scope._btFramePause=true;record('qa-force-pattern',{id:select.value,paused:true});});
  button('카메라 고정 / 해제',()=>{const {G}=getState();cameraLock=cameraLock?null:{x:G.cam.x,y:G.cam.y,zoom:G._camZoom||1};record('qa-camera-lock',{locked:!!cameraLock,camera:cameraLock?{...cameraLock}:null});});
  button('프레임 카메라 ×0.5',()=>{const e=boss();if(!e)return;cameraLock={x:e.x+300,y:e.y-120,zoom:.5};record('qa-camera-lock',{locked:true,framing:'slam-five-poses',camera:{...cameraLock}});});
  const phase=leaf('select','');phase.id='fdgDruidQaPhase';phase.setAttribute('aria-label','QA 페이즈');
  for(let i=0;i<5;i++){const n=leaf('option',`QA 페이즈 ${i}`,phase);n.value=String(i);}phase.value=String(config.phase);
  button('페이즈 적용',()=>{config.phase=+phase.value;setPhase(config.phase);record('qa-phase',{phase:config.phase});});
  const place=(distance,angle)=>{
    const {P}=getState(),e=boss();if(!P||!e)return;
    const x=e.x+Math.cos(angle)*distance,y=e.y+Math.sin(angle)*distance;
    if(options.canPlace&&!options.canPlace(x,y)){record('qa-placement-rejected',{x,y,distance});return;}
    P.x=x;P.y=y;P.facing=Math.atan2(e.y-y,e.x-x);P.kb.x=0;P.kb.y=0;P.iframes=0;
    config.distance=distance;record('qa-placement',{distance,x,y});
  };
  leaf('p','QA 위치: 보스 기준 · 충돌 가능한 바닥만');
  button('정면 340px',()=>place(340,Math.PI/2));button('근접 100px',()=>place(100,Math.PI/2));button('옆 340px',()=>place(340,0));
  button('QA 상태 + HP 3000',()=>{const {P}=getState();if(!P)return;P.s='idle';P.st2=0;P.poison=0;P.burn=0;P.frozen=0;P.kb.x=0;P.kb.y=0;P.mhp=P.hp=3000;P.mst=P.st=500;P.mmp=P.mp=500;P.iframes=0;P.shield=0;P.mshield=0;record('qa-resources',{hp:3000,st:500,mp:500,poseReset:true});refreshHUD();});
  button('QA 보스전 재시작',()=>{mode='ready';lastState='';lastHp=null;record('qa-native-restart');options.restartNative?.();});
  const scale=leaf('input','');scale.id='fdgDruidQaScale';scale.type='range';scale.min='.5';scale.max='2';scale.step='.1';scale.value=String(config.scale);scale.setAttribute('aria-label','QA 보스 표시 배율');
  const scaleText=leaf('span',`QA 보스 배율 ×${config.scale}`);
  scale.addEventListener('input',()=>{config.scale=+scale.value;scope._btScaleMul=config.scale;scaleText.textContent=`QA 보스 배율 ×${config.scale}`;record('qa-scale',{scale:config.scale});});
  button('QA 설정 저장',()=>{
    const {OPT}=getState();OPT.fdgDruidQaControls={...config};saveNativeSettings();
    const native=JSON.parse(storage.getItem('hellcave_settings')||'{}');
    const safeParse=key=>{try{return JSON.parse(storage.getItem(key)||'null');}catch{return null;}};
    const own={...native,charIdx:+storage.getItem('_charIdx')||0,inputMode:storage.getItem('inputMode')||'kbm',gpKeyMap:safeParse('gpKeyMap'),language:storage.getItem('hellLang')||'ko',screen:safeParse('hellcave_screen'),presets:{1:safeParse('hellcave_preset_1'),2:safeParse('hellcave_preset_2')}};
    record('qa-settings-save',{ok:storage.saveOwn(own)});
  });
  leaf('p','자원 상태: 개구리 외형 PENDING_RESOURCE. 야수는 기존 네발 드루이드 시트를 사용합니다.');
  const inputListener=ev=>{if(ev.target?.closest?.('#fdgDruidQaPanel'))return;record('public-input',{event:ev.type,code:ev.code||null,button:ev.button??null});};
  for(const type of ['keydown','keyup','mousedown','mouseup'])document.addEventListener(type,inputListener,{passive:true});
  document.body.append(panel);
  const timer=setInterval(()=>{
    const {P,G,C}=getState(),e=boss();
    const sourceReady=scope._FDGDruidSourceSelection?scope._FDGDruidSourceSelection.isReady():!!scope._FDGDruidSlamBridge;
    if(!ready&&P&&e&&G._bossArena&&sourceReady){ready=true;scope._btScaleMul=+config.scale;scope._btFramePause=true;record('qa-ready',{hp:P.hp,level:P.lv,scale:scope._btScaleMul,map:[G.mw,G.mh]});refreshHUD();}
    if(ready&&!drawWrapped){drawWrapped=true;wrap('_drawDruidBoss',(args,result,start)=>{if(args[1]?.ib){costs.push(performance.now()-start);if(costs.length>240)costs.shift();}},()=>performance.now());}
    if(!P||!e){status.textContent='보스·캐릭터 부팅 대기';return;}
    const metrics=options.getMetrics?.()||{};
    status.textContent=`${mode} · ${scope._btFramePause?'물리 정지':'실행'}\n보스 ${e.s} · ${Math.round(e.hp)}/${e.mhp}${combatR7?` · 쉴드 ${Math.round(e.eShield||0)}`:''}\n플레이어 ${P.s} · HP ${Math.round(P.hp)}\n화면 ${Math.round(metrics.fps||0)} FPS · 이벤트 ${events.length}\n원본 저장/API 사용 0 · 설정 ${storage.receipt().successfulWrites}회`;
    if(readabilityR8&&panel.classList.contains('fdg-combat-compact'))status.textContent=`${mode} · ${scope._btFramePause?'물리 정지':'실행'}\n보스 ${e.s}\nHP ${Math.round(e.hp)} · 쉴드 ${Math.round(e.eShield||0)}\n플레이어 ${P.s} · HP ${Math.round(P.hp)}`;
    if(contactVfxR9&&panel.classList.contains('fdg-combat-compact'))status.textContent+='\n저작 · 잔광16% / 연기12%';
  },100);
  return {
    get cameraLock(){return !combatFramingActive()&&cameraLock?{...cameraLock}:null;},
    get combatFraming(){return combatFramingActive();},
    frozenBossAlpha(actor,spawnAlpha){
      if(!combatR7||!scope._btFramePause)return spawnAlpha;
      const e=boss();return combatFramingActive(e)&&(mode==='ready'||mode==='forced-pattern')&&actor===e?1:spawnAlpha;
    },
    get combatReadability(){return readabilityR8&&mode==='native-ai';},
    get contactVfxReadability(){return contactVfxR9&&mode==='native-ai';},
    contactVfxAlpha({kind,sheet,frame,progress,alpha,x,y,size}={}){
      if(!contactVfxR9||mode!=='native-ai'||!readabilityFrame||![x,y,size].every(Number.isFinite)||!(size>0))return alpha;
      const half=size*.5,overlap=readabilityFrame.obstacles.some(r=>x+half>r.left&&x-half<r.right&&y+half>r.top&&y-half<r.bottom);
      return resolveContactVfxAlpha({active:true,kind,sheet,frame,progress,alpha,overlap});
    },
    contactVfxSnapshot(){return contactVfxR9?{active:mode==='native-ai',policy:{...CONTACT_VFX_AUTHORING_POLICY},displayOnly:true,contactBoundsSource:'existing native body envelope and player ±100'}:null;},
    get readabilityWorldTransform(){return readabilityR8&&mode==='native-ai'&&readabilityFrame?[...readabilityFrame.transform]:null;},
    beginReadabilityFrame({transform,pixelScale,viewport}){
      if(!readabilityR8||mode!=='native-ai'){readabilityFrame=null;return;}
      const {P}=getState(),e=boss(),body=e?options.getBossBounds?.(e):null;
      if(!P||!body||!Array.isArray(transform)||transform.length!==6||!transform.every(Number.isFinite)||!(pixelScale>0)||!(transform[0]>0)||!(transform[3]>0)){readabilityFrame=null;return;}
      const [a,,,d,tx,ty]=transform;
      const worldRect=(l,t,r,b)=>({left:(l*pixelScale-tx)/a,top:(t*pixelScale-ty)/d,right:(r*pixelScale-tx)/a,bottom:(b*pixelScale-ty)/d});
      const safe=worldRect(60,90,viewport.width-230,viewport.height-150);
      readabilityFrame={transform:[...transform],pixelScale,viewport:safe,obstacles:[body,{left:P.x-100,top:P.y-100,right:P.x+100,bottom:P.y+100}],occupied:[],labels:[],moved:0,overflow:0};
    },
    placeReadabilityLabel(anchor,width,height){
      if(!readabilityR8||mode!=='native-ai'||!readabilityFrame)return null;
      const f=readabilityFrame,result=placeCombatLabel({anchor,width,height,obstacles:f.obstacles,occupied:f.occupied,viewport:f.viewport});
      if(result.rect)f.occupied.push({...result.rect});
      f.labels.push({anchor:{...anchor},width,height,...result});if(result.moved)f.moved++;if(result.overflow)f.overflow++;
      return result;
    },
    projectReadabilitySprite(x,y,width,height){
      if(!readabilityR8||mode!=='native-ai'||!readabilityFrame)return null;
      const {transform:[a,b,c,d,tx,ty],pixelScale:s}=readabilityFrame;
      return {x:(a*x+c*y+tx)/s,y:(b*x+d*y+ty)/s,width:width*a/s,height:height*d/s};
    },
    frameCombatCamera({width,height,dt,mapBounds}){
      if(!combatR7)return null;
      const {P,G,projs}=getState(),e=boss();if(!P||!combatFramingActive(e))return null;
      const body=options.getBossBounds?.(e);if(!body)return null;
      const player={left:P.x-100,right:P.x+100,top:P.y-100,bottom:P.y+100};
      const actorBounds={left:Math.min(body.left,player.left),right:Math.max(body.right,player.right),top:Math.min(body.top,player.top),bottom:Math.max(body.bottom,player.bottom)};
      const bounds=[body,player];let includedShots=0;
      for(const p of projs){
        if(!(p.life>0)||(!p._druidPoison&&!p._druidStraight&&!p.friendly))continue;
        if(p.x<actorBounds.left-240||p.x>actorBounds.right+240||p.y<actorBounds.top-240||p.y>actorBounds.bottom+240)continue;
        const r=Math.max(24,Math.min(64,(p.r||p.sz||12)*2));bounds.push(options.getProjectileBounds?.(p)||{left:p.x-r,right:p.x+r,top:p.y-r,bottom:p.y+r});includedShots++;
      }
      const safeRect={left:Math.min(60,width*.05),right:width-Math.min(230,width*.18),top:Math.min(90,height*.125),bottom:height-Math.min(150,height*.21)};
      combatFrame=fitDruidCombatFrame({bounds,viewport:{width,height},safeRect,previous:scope._btFramePause?undefined:{x:G.cam.x,y:G.cam.y,zoom:G._camZoom||1},dt,mapBounds});
      if(combatFrame)combatFrame={...combatFrame,includedShots,bodySource:body.source||'native-render-envelope'};
      return combatFrame;
    },
    snapshot(){const {P,G,projs,C}=getState(),e=boss();const sorted=[...costs].sort((a,b)=>a-b);return {ready,mode,config:{...config},paused:!!scope._btFramePause,cameraLock:cameraLock?{...cameraLock}:null,player:P?{x:P.x,y:P.y,s:P.s,st2:P.st2,hp:P.hp,mhp:P.mhp,st:P.st,mp:P.mp,shield:P.shield,facing:P.facing,level:P.lv,iframes:P.iframes}:null,boss:e?{x:e.x,y:e.y,s:e.s,st2:e.st2,hp:e.hp,mhp:e.mhp,facing:e.facing,phase:e._bossPhase,alive:e.alive,r:e.r}:null,game:{on:G.on,stage:G.stage,bossAlive:G.bossAlive,arena:G._bossArena,cam:{...G.cam},zoom:G._camZoom||1,frame:G.frame,map:[G.mw,G.mh],canvas:[C.width,C.height]},projectiles:projs.filter(p=>p._druidStraight).map(p=>({x:p.x,y:p.y,vx:p.vx,vy:p.vy,dmg:p.dmg,parryClass:p.parryClass,homing:p.homing,blackBean:!!p.blackBean,fromRainbow:!!p._fromRainbow,elemBall:!!p.elemBall,blueBean:!!p.blueBean,friendly:p.friendly,...(p._druidThornVolley?{thornVolley:true,lane:p._druidThornLane,life:p.life,ml:p.ml}: {})})),metrics:options.getMetrics?.()||{},drawCpu:{samples:costs.length,mean:costs.length?costs.reduce((a,b)=>a+b,0)/costs.length:0,p95:sorted.length?sorted[Math.floor((sorted.length-1)*.95)]:0},storage:storage.receipt(),events:[...events],states:[...states]};},
    combatSnapshot(){return combatFrame?JSON.parse(JSON.stringify(combatFrame)):null;},
    readabilitySnapshot(){return readabilityFrame?JSON.parse(JSON.stringify(readabilityFrame)):null;},
    uninstall(){clearInterval(timer);for(const {name,original,replacement} of wrappers)if(scope[name]===replacement)scope[name]=original;for(const type of ['keydown','keyup','mousedown','mouseup'])document.removeEventListener(type,inputListener);panel.remove();combatStyle?.remove();if(combatR7)document.body.classList.remove('fdg-druid-combat-r7');if(readabilityR8)document.body.classList.remove('fdg-druid-readability-r8');if(contactVfxR9)document.body.classList.remove('fdg-druid-contact-vfx-r9');}
  };
}
