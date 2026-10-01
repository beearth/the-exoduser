function activateGiantSlam(srcId){
  const _d10Cast=_d10Candidate.begin(P,INV.equipped,srcId);
  let _d10Succeeded=false;
  try{
  G._dbgSlam=120;
  srcId=srcId||'giantSlam';
  const slv=P.skills[srcId]||P.skills.giantSlam||1;
  _addSkProf(srcId);
  if(!window._parryLesson?.active&&G.mats<_malCost(20)){showPH(_T('악의 부족!'),'#ff4444');return}
  useStPct('giantSlam');if(!window._parryLesson?.active)G.mats-=_malCost(20);
  const _gslBase=(srcId==='giantSlam2'&&_isFused('pillarSlam'))?420:(srcId==='giantSlam2'&&_isFused('infernoSlam'))?420:Math.max(60,1800-(slv-1)*12);
  P._gslCd=~~(_gslBase*(1+_cdRed()));
  P._gslDir=P.facing;P._gslLv=slv;
  P.s='gSlamWindup';P.st2=10;
  G._sbBurst=null; // 지옥강타 1 시 보호막 버스트 VFX(기폭팔색) 억제
  // 상태 변경 없이 즉시 발동 (이동 유지)
  SFX.slam();{const _ve=['voice_grunt','male_grunt'];playSample(_ve[~~(Math.random()*2)],1,_r(1,.15))}
    // 즉시 히트 (hitStop/slowMo 억제)
  G._noHitStopT=60;
  const _gs1R=500+(slv-1)*15;
  // 분노게이지: 풀100%=20× (테스트값, 기존 11×에서 상향) + 분노폭주 패시브: 분노 데미지 +10%/lv + 어픽스 rageDmg
  const _rageDmgAf=1+(_eqAffix('rageDmg')||0);
  const _rageMul=1+(P.rage*0.19*(1+(PASSIVES.pRage||0)*0.10)*_rageDmgAf);
  const _gs1Dmg=~~(meleeRef()*statStr()*_skMul('giantSlam')*_rageMul); // pAtkMul is applied once by _gSlamHit
  if(P.rage>0){
    const _rageP=P.rage;
    addTxt(P.x,P.y-50,_T('🔥분노 ')+_rageP+'% → +'+~~(_rageP*19*(1+(PASSIVES.pRage||0)*0.10)*_rageDmgAf)+'%!','#ff2200',45);
    // ═══ 분노 폭발 VFX — 20%당 기폭팔 폭발(explosion_spritesheet) 1덩이 ═══
    const _rageBombs=~~(_rageP/20); // 20%=1, 40%=2, 60%=3, 80%=4, 100%=5
    for(let _rb=0;_rb<_rageBombs;_rb++){
      const _ra=Math.PI*2*_rb/Math.max(1,_rageBombs)+(Math.random()-.5)*.4;
      const _rd=80+_rb*35+Math.random()*40;
      _addLavaErupt(P.x+Math.cos(_ra)*_rd,P.y+Math.sin(_ra)*_rd,120+_rb*30,60+_rb*8,true);
    }
    P.rage=0;
    _d10Candidate.consume(_d10Cast,_rageP);
    window._parryLesson?.rageCast(_rageP);
  }
  const _gs1El=wp().el||0;
  _gSlamHit(P.facing,_gs1R,Math.PI,_gs1Dmg,_gs1El,0,1.0);
  G.hitStop=0;G.slowMo=0;
  G.shake=14*OPT.shake/100;
  const _slamKind=(srcId==='giantSlam2'&&_isFused('infernoSlam'))?'inferno':'giant';
  // 지옥강타 1의 지면 충격 재질은 유지하고, 영웅 시트만 붉은 지옥진으로 교체한다.
  const _slamVfxKind=srcId==='giantSlam'?'inferno':_slamKind;
  // 원형 충격파 파편: 물리 강타는 암석/먼지, 지옥강타 2는 용암/불티로 재질 분리
  const _slamPartCols=_slamKind==='inferno'?['#fff0a0','#ff9a18','#ff3a08','#63130c']:['#f4d28b','#9a7048','#574238','#2b2422'];
  for(let j=0;j<32;j++){const _a=Math.PI*2*j/32+(Math.random()-.5)*.12;const _d=50+Math.random()*(_gs1R*1.25);
    poolPart(P.x+Math.cos(_a)*_d,P.y+Math.sin(_a)*_d,Math.cos(_a)*(7+Math.random()*7),Math.sin(_a)*(7+Math.random()*7),_slamPartCols[j%4],4+Math.random()*7,18+Math.random()*14)}
  // 진동파 이펙트 링
  if(!G._gSlamWave)G._gSlamWave=[];
  G._gSlamWave.push({x:P.x,y:P.y,r:60,maxR:_gs1R*2,t:0,maxT:45,kind:_slamKind,vfxKind:_slamVfxKind});
  _detonateAssaultFlames(); // 지옥강타 1로 불바닥 일괄폭발
  // 지진폭풍: 지옥강타 1 시 자동 기폭팔 발동
  if(_isFused('slamStorm')&&P.skills.detonate>=1){
    P.parryBank=Math.max(P.parryBank||0,200);P.parryT=Math.max(P.parryT||0,120);
    _slamStormBlast(true); // 지진기폭 — _detonateBlast 강제 tier3 버그 방지, 일관된 ×19 공식
  }
  // 기둥강타: 지옥강타 2 시 악의기둥 자동 발동 (9기둥 + pillarSpike 가시덫 포함)
  if(srcId==='giantSlam2'&&_isFused('pillarSlam')&&P.skills.darkPillar>=1){
    activateDarkPillar(); // 9기둥 전개 + pillarSpike 가시덫 자동 적용
    
  }
  // 지옥강타 2: 발동 시 지옥진 자동 발동 (5초)
  if(srcId==='giantSlam2'&&_isFused('infernoSlam')&&P.skills.fireAura>=1){
    const _ifLv=P.skills.fireAura||1;
    const _ifR=400+~~(400*(_ifLv-1)*0.10); // 2배 상향
    const _ifDmg=~~(magicRef()*statInt()*pMagicMul()*(6+(_ifLv-1)));
    if(!G._fireZones)G._fireZones=[];
    G._fireZones.push({type:'fireAura',x:P.x,y:P.y,r:_ifR,dmg:_ifDmg,el:EL.F,t:0,maxT:300,lv:_ifLv,_tickCd:0,follow:false,_faFr:0});
        playSample('fireball',.5,_r(0.8,.1));
  }
  // 이동스킬 — 모든 멈춤 강제 제거
  G.hitStop=0;G.slowMo=0;
  _d10Succeeded=true;
  }finally{_d10Candidate.finish(_d10Cast,_d10Succeeded);}
}
