const fs=require('fs'),vm=require('vm'),crypto=require('crypto'),argv=process.argv.slice(2),value=k=>argv[argv.indexOf(k)+1],source=value('--source'),output=value('--out'),extended=argv.includes('--extended');if(!argv.includes('--source')||!argv.includes('--out'))throw Error('--source 고정웹원문 --out 새JSON 필요');const src=fs.readFileSync(source,'utf8');
function cut(a,b){const i=src.indexOf(a),j=src.indexOf(b,i);if(i<0||j<0)throw Error('원문 경계 없음 '+a);return src.slice(i,j);}
const constants=cut('const _HARP_TIER_F=','const MBjust={}'),down=cut("  if(e.code==='ShiftLeft'&&G.on",'  // ═══ 기본 기동 입력'),up=cut("  if(e.code==='ShiftLeft'&&_dashHold&&", "  if(e.code==='Space')_handleDeathMenuKeyboard"),tick=cut('  // ── 사슬 게이지 자동 회복','  // ── 기동칼날개: 사슬기동 중 좌클릭');
const scenarios=[{name:'장기홀드',hold:100},{name:'탭',hold:1},{name:'중단계',hold:8},{name:'벽도우미',hold:100,wall:250},{name:'끝점벽보정',hold:1,wall:250},{name:'비행중재입력취소',hold:1,pressAgain:4},{name:'기절Shift탈출',hold:10,state:'pStun'}];
if(extended)for(const hold of [1,5,6,11,12,100])for(const wall of [0,250,715])for(const gauge of [0,1,44,98,225])for(const st of [0,1,2.99,3,100])scenarios.push({name:'자원벽경계-'+[hold,wall,gauge,st].join('-'),hold,wall,gauge,st});
if(extended)for(const state of ['stagger','pStun'])for(const hold of [1,8,100])for(const gauge of [0,1,225])scenarios.push({name:'자세경계-'+[state,hold,gauge].join('-'),state,hold,gauge});
const cases=[];for(const scenario of scenarios){
 const noop=()=>{},P={x:0,y:0,r:15,s:scenario.state||'idle',st2:100,st:scenario.st??100,mst:100,iframes:0,poise:scenario.state?0:4,skills:{},activeChargeSk:'charge',facing:0};
 const box={P,G:{on:true,paused:false},KH:{},K:{},window:{},MB:{},MBjust:{},_dtSp:1,_gpActive:false,_gameFrame:1000,e:{code:'ShiftLeft',repeat:false},_aimDir:()=>0,pChargeRange:()=>1,pChargeGauge:()=>1,isDimBreach:()=>false,_isFused:()=>false,_uEq:()=>0,_lEq:()=>0,_uqMoveRefund:noop,_addSkProf:noop,playSample:noop,_r:()=>1,_T:x=>x,addTxt:noop,showPH:noop,SFX:{slash:noop,magic:noop},addParts:noop,shake:noop,_gpVibrate:noop,playVFXAng:noop,shQuery:()=>[],_shCacheBuf:[],_shCacheFrom:noop,dst:(x,y,a,b)=>Math.hypot(x-a,y-b),canMvBlink:(x,y,r)=>!scenario.wall||x+r<scenario.wall};
 vm.createContext(box);vm.runInContext(constants,box);if(scenario.gauge!=null)vm.runInContext('_harpGauge='+scenario.gauge,box);const trace=[];let previous=false;
 for(let f=0;f<140;f++){
  const held=f<scenario.hold||(scenario.pressAgain===f);box.KH.ShiftLeft=held;box.K.ShiftLeft=held;
  if(held&&!previous)vm.runInContext(down,box);if(!held&&previous)vm.runInContext(up,box);
  vm.runInContext("{const _pDead=P.s==='fallen'||P.s==='dead'||P.s==='pStun';\n"+tick+'\n}',box);
  P.iframes=Math.max(0,P.iframes-1);P.st2--;
  // 후반 상태 분기는 현재 원문 그대로 실행하며 기절 첫 틱은 사슬 갱신 뒤 탈출한다.
  if(P.s==='pStun'||P.s==='stagger') {const state=cut("  case 'stagger':{",'  }\n\n  // ═══ 보스 몸통 충돌');box.isJust=id=>id==='charge'&&held&&!previous;box._canMobility=()=>false;box.activateMobility=noop;vm.runInContext("switch(P.s){\n"+state+"\n}",box);}
  trace.push(vm.runInContext('({frame:'+f+',x:P.x,y:P.y,st:P.st,state:P.s,iframes:P.iframes,poise:P.poise,gauge:_harpGauge,hold:_dashHold,holdF:_dashHoldF,harp:_harpActive,dash:_dashActive,tier:_harpTier,hx:_harpX,hy:_harpY,dist:_harpDist,maxDist:_harpMaxDist,left:_dashLeft})',box));previous=held;
 }
 cases.push({input:scenario,trace});
}
const path=output;if(fs.existsSync(path))throw Error('기존 원문 실행 결과 보존');fs.writeFileSync(path,JSON.stringify({원본SHA256:crypto.createHash('sha256').update(src).digest('hex'),범위:'현재 원문 Shift keydown/keyup·전체 사슬갱신 블록 직접 실행. 적 없음·파생스킬/합체/유니크/장비/재생0, 시각/오디오만 무동작. 기절/경직 후반 탈출은 원문 case. 범위 밖 효과의 실행은 허용하지 않음.',blocks:Object.fromEntries(Object.entries({constants,down,up,tick}).map(([k,v])=>[k,crypto.createHash('sha256').update(v).digest('hex')])),cases}));console.log(JSON.stringify({사례:cases.length,틱:cases.reduce((n,x)=>n+x.trace.length,0)}));
