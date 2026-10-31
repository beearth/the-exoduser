// Generated from current game.html drawP ground pass. No terrain/actor/native world render.
window._Web3DDrawNativeGround=function(ctx){const previous=X;X=ctx;try{
  if(_DCP.on)_DCP._setSource(_DCP_SRC.PLAYER);
  const _dpStart=performance.now();
  const sp=(G.slowMo>0?.35:1)*_dtSp;
  const _pViewBounds=_fdgNativePerspective?.active?_fdgNativePerspective.bounds():null;
  const _vl=G.cam.x-2600,_vr=G.cam.x+2600,_vt=G.cam.y-2600,_vb=G.cam.y+2600;
  const fl=P.iframes>0&&~~(P.iframes/3)%2;if(fl)X.globalAlpha=.3;
  const t=_now;
  const _pScale=2,_pR=P.r*_pScale; // 캐릭터 비주얼 2배
  _dsPSnap.on=0; // [DEPTH-SLICE] 아틀라스 본체 브랜치에서만 고스트 스냅샷 채움
  if(P._bladeEchoRun)_drawBladeEchoVfx(X,P._bladeEchoRun,P.x,P.y,t);
  else if(P._bladeEchoAfterglow&&P._bladeEchoAfterglow.until>t)_drawBladeEchoVfx(X,P._bladeEchoAfterglow,P.x,P.y,t,(P._bladeEchoAfterglow.until-t)/180);

  // ══ CHARGE — armor element (stylish) ══
  if(P.s==='charge'){
    const ae=ar().el, ac=ELC[ae];
    const ck=P.chargeKills||0;
    // Outer blast aura (grows with chain kills)
    const auraR=_pR+10+ck*3;
    X.globalAlpha=.5+Math.sin(t/30)*.25;X.fillStyle=ac;
    X.beginPath();X.arc(P.x,P.y,auraR,0,Math.PI*2);X.fill();
    // Chain kill golden aura
    if(ck>0){X.globalAlpha=.3+ck*.08;X.fillStyle='#ffdd44';X.beginPath();X.arc(P.x,P.y,auraR+4,0,Math.PI*2);X.fill()}
    // Inner bright core
    X.globalAlpha=.8;X.fillStyle=ELG2[ae];
    X.beginPath();X.arc(P.x,P.y,_pR+3,0,Math.PI*2);X.fill();
    // Trail afterimages (5 layers, perspective scaling)
    for(let i=1;i<=5;i++){
      X.globalAlpha=.28/i;X.fillStyle=ck>0?'#ffee44':ac;
      X.beginPath();X.arc(P.x-P.chargeDx*9*i,P.y-P.chargeDy*9*i,_pR+5-i*.8,0,Math.PI*2);X.fill();
    }
    // Speed lines (radial from movement direction)
    X.globalAlpha=.5;X.strokeStyle=ac;X.lineWidth=2;
    for(let i=0;i<6;i++){
      const spread=(Math.random()-.5)*1.2;
      const a=Math.atan2(-P.chargeDy,-P.chargeDx)+spread;
      const ox=(Math.random()-.5)*14,oy=(Math.random()-.5)*14;
      const d=12+Math.random()*18;
      X.beginPath();X.moveTo(P.x+ox,P.y+oy);X.lineTo(P.x+ox+Math.cos(a)*d,P.y+oy+Math.sin(a)*d);X.stroke();
    }
    // Element streaks (wider, more intense)
    X.globalAlpha=.65;X.strokeStyle=ac;X.lineWidth=3;
    for(let i=0;i<5;i++){
      const a=P.facing+Math.PI+(Math.random()-.5)*1.0;
      const d=10+Math.random()*18;
      X.beginPath();X.moveTo(P.x,P.y);X.lineTo(P.x+Math.cos(a)*d,P.y+Math.sin(a)*d);X.stroke();
    }
    X.globalAlpha=1;
    // Trail particles (optimized)
    if(Math.random()>.5){
      const pc=ck>0?'#ffee44':ELP[ae];
      poolPart(P.x+(Math.random()-.5)*12,P.y+(Math.random()-.5)*12,-P.chargeDx*2.5+Math.random()-.5,-P.chargeDy*2.5+Math.random()-.5,pc,3+Math.random()*5,12+Math.random()*10);
    }
    // Extra spark particles on chain
    if(ck>0&&Math.random()>.7){
      poolPart(P.x+(Math.random()-.5)*16,P.y+(Math.random()-.5)*16,(Math.random()-.5)*6,(Math.random()-.5)*6,'#ffffff',2+Math.random()*2,6+Math.random()*6);
    }
  }
  // ══ CHARGE RECOVER — finisher ready glow ══
  if(P.s==='cRecover'){
    const ae=ar().el,ac=ELC[ae];
    // Pulsing ready ring
    const pulse=.3+Math.sin(t/50)*.2;
    X.globalAlpha=pulse;X.strokeStyle='#ffcc44';X.lineWidth=2;
    X.beginPath();X.arc(P.x,P.y,_pR+6+Math.sin(t/60)*3,0,Math.PI*2);X.stroke();
    // Fading afterimage at last position
    X.globalAlpha=.15;X.fillStyle=ac;
    X.beginPath();X.arc(P.x-P.chargeDx*8,P.y-P.chargeDy*8,_pR+2,0,Math.PI*2);X.fill();
    X.globalAlpha=1;
  }

  _dpS0=performance.now(); // S0=charge/recover 끝
  // ══ 참회 조준 인디케이터 ══
  if(P._hrAiming){
    const _hrLv=P.skills.hellRay||1;const _hrAimR=200+(_hrLv-1)*22; // 악의폭풍과 동일 크기
    let _hrTx=mouse.x-VW/2+G.cam.x,_hrTy=mouse.y-VH/2+G.cam.y;
    {const _hrD2=dst(P.x,P.y,_hrTx,_hrTy);if(_hrD2>1000){const _hrA2=Math.atan2(_hrTy-P.y,_hrTx-P.x);_hrTx=P.x+Math.cos(_hrA2)*1000;_hrTy=P.y+Math.sin(_hrA2)*1000}}
    const _hrt2=_now*.005;
    X.save();
    // 범위 원
    X.globalAlpha=.1+.04*Math.sin(_hrt2*6);X.fillStyle='rgba(255,215,0,.08)';
    X.beginPath();X.arc(_hrTx,_hrTy,_hrAimR,0,Math.PI*2);X.fill();
    X.globalAlpha=.3;X.strokeStyle='#ffd700';X.lineWidth=2;X.setLineDash(_D8_6);X.lineDashOffset=-_now*.1;
    X.beginPath();X.arc(_hrTx,_hrTy,_hrAimR,0,Math.PI*2);X.stroke();X.setLineDash(_D0);
    // 예상 오망성 프리뷰
    const _hrPa=_hrt2*2;const _hrPR=_hrAimR*.35;
    X.globalAlpha=.25;X.strokeStyle='#ffd700';X.lineWidth=2;
    X.beginPath();
    for(let _pi=0;_pi<5;_pi++){const _pa=_hrPa-Math.PI/2+_pi*Math.PI*4/5;
      if(_pi===0)X.moveTo(_hrTx+Math.cos(_pa)*_hrPR,_hrTy+Math.sin(_pa)*_hrPR);
      else X.lineTo(_hrTx+Math.cos(_pa)*_hrPR,_hrTy+Math.sin(_pa)*_hrPR);}
    X.closePath();X.stroke();
    // 중심 점
    X.globalAlpha=.5;X.fillStyle='#ffd700';
    X.beginPath();X.arc(_hrTx,_hrTy,3,0,Math.PI*2);X.fill();
    // 반경 숫자 텍스트 제거 — 링이 이미 반경 표시(정보 중복), _hrR 값·공식 불변
    X.restore();
  }
  // ══ 폭풍소환 조준 인디케이터 (마우스 커서 위치 — 악의폭풍과 동일) ══
  if(P._mmAiming){
    const _mmSlvR=P.skills.maliceMortar||1;const _aimR=400+(_mmSlvR-1)*18; // 실제 소용돌이 반경(_mmR)과 일치 — 조준 미리보기 정합
    const _iceFuse=P.skills.iceOrb>=1&&_isFused('iceMortar');
    const _mmTx=P.x+Math.cos(P.facing)*(P._mmDist||150),_mmTy=P.y+Math.sin(P.facing)*(P._mmDist||150);
    const _mt=_now*.06;
    X.save();
    // 착지점 소용돌이 범위 미리보기
    X.globalAlpha=.08+Math.sin(_mt)*.04;X.fillStyle=_iceFuse?'#224466':'#330044';
    X.beginPath();X.arc(_mmTx,_mmTy,_aimR,0,Math.PI*2);X.fill();
    // 소용돌이 회전 링
    for(let ri=0;ri<3;ri++){
      const _rr=_aimR*(1-ri*.2);const _ra=_now*.003*(ri%2?1:-1);
      X.globalAlpha=.15+.05*Math.sin(_mt+ri);X.strokeStyle=_iceFuse?(ri%2?'#66ccff':'#aaeeff'):(ri%2?'#cc44ff':'#8822aa');
      X.lineWidth=2;X.setLineDash(_D10_8);X.lineDashOffset=-_now*.15*(ri%2?1:-1.5);
      X.beginPath();X.arc(_mmTx,_mmTy,_rr,_ra,_ra+Math.PI*2);X.stroke();X.setLineDash(_D0);
    }
    // 십자선
    X.globalAlpha=.4;X.strokeStyle=_iceFuse?'#88ddff':'#ff00ff';X.lineWidth=1;
    X.beginPath();X.moveTo(_mmTx-12,_mmTy);X.lineTo(_mmTx+12,_mmTy);X.moveTo(_mmTx,_mmTy-12);X.lineTo(_mmTx,_mmTy+12);X.stroke();
    // 텍스트
    X.globalAlpha=.8;X.fillStyle=_iceFuse?'#88ddff':'#cc88ff';X.font='bold 10px monospace';X.textAlign='center';
    X.fillText((_iceFuse?'❄ ':'🌪️ ')+_T('폭풍소환'),_mmTx,_mmTy-_aimR-8);
    X.restore();
  }
  // ══ 악의폭풍 조준 인디케이터 (마우스 커서 위치) ══
  if(P._msAiming){
    const _msLv=P.skills.maliceStorm||1;
    const _msBF=_isFused('boneStorm')||_isFused('elecRepent');
    const _bwLv=P.skills.boneWall||1;
    const _msAimR=_msBF?(~~((200+(_bwLv-1)*22)*3/2)):(200+(_msLv-1)*22);
    let _msTx=mouse.x-VW/2+G.cam.x;
    let _msTy=mouse.y-VH/2+G.cam.y;
    const _msDst3=dst(P.x,P.y,_msTx,_msTy);if(_msDst3>1000){const _msA3=Math.atan2(_msTy-P.y,_msTx-P.x);_msTx=P.x+Math.cos(_msA3)*1000;_msTy=P.y+Math.sin(_msA3)*1000}
    const _mst=_now*.005;
    X.save();
    if(_msBF){
      // 해골번개 조준 — 뼈+암흑 테마
      X.globalAlpha=.08+.03*Math.sin(_mst*6);X.fillStyle='#334433';
      X.beginPath();X.arc(_msTx,_msTy,_msAimR,0,Math.PI*2);X.fill();
      X.globalAlpha=.4;X.strokeStyle='#55cc77';X.lineWidth=14;X.setLineDash(_D8_6);X.lineDashOffset=-_now*.12;
      X.beginPath();X.arc(_msTx,_msTy,_msAimR,0,Math.PI*2);X.stroke();X.setLineDash(_D0);
      // 뼈기둥 미리보기
      const _bpCnt=12;
      for(let i=0;i<_bpCnt;i++){
        const a=Math.PI*2*i/_bpCnt+_mst*1.2;
        const px=_msTx+Math.cos(a)*_msAimR,py=_msTy+Math.sin(a)*_msAimR;
        X.globalAlpha=.2+Math.sin(_mst*4+i)*.08;X.fillStyle='#ccbb99';
        X.fillRect(px-3,py-8,6,16);
      }
      // 십자선
      X.globalAlpha=.4;X.strokeStyle='#55cc77';X.lineWidth=1;
      X.beginPath();X.moveTo(_msTx-12,_msTy);X.lineTo(_msTx+12,_msTy);X.moveTo(_msTx,_msTy-12);X.lineTo(_msTx,_msTy+12);X.stroke();
      // 암흑 파편 미리보기
      for(let i=0;i<3;i++){
        const a=Math.random()*Math.PI*2;const d=Math.random()*_msAimR*.7;
        const bx=_msTx+Math.cos(a)*d,by=_msTy+Math.sin(a)*d;
        X.globalAlpha=.3;X.fillStyle=Math.random()>.5?'#55cc77':'#6644aa';
        X.fillRect(bx-2,by-2,4,4);
      }
      X.globalAlpha=.8;X.fillStyle='#55cc77';X.font='bold 11px monospace';X.textAlign='center';
      if((P._bnsCd||0)>0)X.fillText('\u{1F9B4}'+Math.ceil(P._bnsCd/60)+'s',_msTx,_msTy-_msAimR-8);// 정수초·완료시 미표시(글리프 churn 제거)
    }else{
      // 반투명 스카이블루 원
      X.globalAlpha=.1+.03*Math.sin(_mst*8);X.fillStyle='#2288cc';
      X.beginPath();X.arc(_msTx,_msTy,_msAimR,0,Math.PI*2);X.fill();
      // 점선 외곽
      X.globalAlpha=.5;X.strokeStyle='#55ccff';X.lineWidth=2;X.setLineDash(_D8_5);X.lineDashOffset=-_now*.1;
      X.beginPath();X.arc(_msTx,_msTy,_msAimR,0,Math.PI*2);X.stroke();X.setLineDash(_D0);
      // 십자선
      X.globalAlpha=.4;X.strokeStyle='#55ccff';X.lineWidth=1;
      X.beginPath();X.moveTo(_msTx-12,_msTy);X.lineTo(_msTx+12,_msTy);X.moveTo(_msTx,_msTy-12);X.lineTo(_msTx,_msTy+12);X.stroke();
      // 미니 번개 미리보기 4개
      for(let i=0;i<4;i++){
        const a=Math.random()*Math.PI*2;const d=Math.random()*_msAimR*.8;
        const bx=_msTx+Math.cos(a)*d,by=_msTy+Math.sin(a)*d;
        const ba=Math.random()*Math.PI*2;const bl=6+Math.random()*15;
        X.strokeStyle='#55ccff';X.lineWidth=.8;X.globalAlpha=.4;
        X.beginPath();X.moveTo(bx,by);X.lineTo(bx+Math.cos(ba)*bl+(Math.random()-.5)*5,by+Math.sin(ba)*bl+(Math.random()-.5)*5);X.stroke();
      }
      X.globalAlpha=.8;X.fillStyle='#55ccff';X.font='bold 11px monospace';X.textAlign='center';
      X.fillText('\u26A1 '+_T('악의폭풍'),_msTx,_msTy-_msAimR-8);
    }
    X.restore();
  }
  // 악의기둥 조준 인디케이터 삭제 (즉시 발동으로 변경)
  // ══ 아이스스톰 조준 인디케이터 (마우스 클릭 설치, 1000px 클램프) ══
  if(P._isAiming){
    const _isLv=P.skills.iceStorm||1,_isAimR=200+(_isLv-1)*22;
    let _isTx=mouse.x-VW/2+G.cam.x,_isTy=mouse.y-VH/2+G.cam.y;
    {const _isD2=dst(P.x,P.y,_isTx,_isTy);if(_isD2>1000){const _isA2=Math.atan2(_isTy-P.y,_isTx-P.x);_isTx=P.x+Math.cos(_isA2)*1000;_isTy=P.y+Math.sin(_isA2)*1000}}
    X.save();
    X.globalAlpha=.1+.03*Math.sin(_now*.04);X.fillStyle='#2288cc';
    X.beginPath();X.arc(_isTx,_isTy,_isAimR,0,Math.PI*2);X.fill();
    X.globalAlpha=.5;X.strokeStyle='#88ddff';X.lineWidth=2;X.setLineDash(_D8_5);X.lineDashOffset=-_now*.1;
    X.beginPath();X.arc(_isTx,_isTy,_isAimR,0,Math.PI*2);X.stroke();X.setLineDash(_D0);
    X.globalAlpha=.4;X.strokeStyle='#88ddff';X.lineWidth=1;
    X.beginPath();X.moveTo(_isTx-12,_isTy);X.lineTo(_isTx+12,_isTy);X.moveTo(_isTx,_isTy-12);X.lineTo(_isTx,_isTy+12);X.stroke();
    for(let i=0;i<5;i++){const a=Math.random()*Math.PI*2,d=Math.random()*_isAimR*.8;
      const sx=_isTx+Math.cos(a)*d,sy=_isTy+Math.sin(a)*d;
      X.globalAlpha=.35;X.fillStyle=Math.random()>.5?'#aaeeff':'#fff';
      X.save();X.translate(sx,sy);X.rotate(Math.random()*Math.PI);
      X.beginPath();X.moveTo(0,-3);X.lineTo(2,0);X.lineTo(0,3);X.lineTo(-2,0);X.closePath();X.fill();X.restore();}
    X.globalAlpha=.8;X.fillStyle='#88ddff';X.font='bold 11px monospace';X.textAlign='center';
    X.fillText('❄ '+_T('아이스스톰'),_isTx,_isTy-_isAimR-8);
    X.restore();
  }
  // ══ 벽소환 조준 인디케이터 (마우스 클릭 설치, 1000px 클램프) ══
  if(P._bwAiming){
    const bwSlv=P.skills.boneWall||1;
    let bwTx=mouse.x-VW/2+G.cam.x,bwTy=mouse.y-VH/2+G.cam.y;
    const _bwD2=dst(P.x,P.y,bwTx,bwTy);if(_bwD2>1000){const _bwA2=Math.atan2(bwTy-P.y,bwTx-P.x);bwTx=P.x+Math.cos(_bwA2)*1000;bwTy=P.y+Math.sin(_bwA2)*1000}
    const bwR=~~((200+(bwSlv-1)*22)*3/2); // 악의폭풍의 1/2 (lv1≈100, lv10≈199, lv20≈309)
    const _bwt=_now*.06;
    X.save();
    // 원형 범위
    X.globalAlpha=.08+Math.sin(_bwt)*.04;X.fillStyle='#ccbb88';X.beginPath();X.arc(bwTx,bwTy,bwR,0,Math.PI*2);X.fill();
    // 둘레 뼈벽 미리보기
    X.globalAlpha=.4;X.strokeStyle='#ddccaa';X.lineWidth=14;X.setLineDash(_D8_6);X.lineDashOffset=-_now*.12;
    X.beginPath();X.arc(bwTx,bwTy,bwR,0,Math.PI*2);X.stroke();X.setLineDash(_D0);
    // 뼈기둥 미리보기 (16개)
    const bwPilCnt=16;
    for(let i=0;i<bwPilCnt;i++){
      const a=Math.PI*2*i/bwPilCnt+_bwt*.2;
      const px=bwTx+Math.cos(a)*bwR,py=bwTy+Math.sin(a)*bwR;
      X.globalAlpha=.2+Math.sin(_bwt+i)*.08;X.fillStyle='#ccbb99';
      X.fillRect(px-4,py-10,8,20);
    }
    // 십자선
    X.globalAlpha=.35;X.strokeStyle='#bbaa77';X.lineWidth=1;
    X.beginPath();X.moveTo(bwTx-12,bwTy);X.lineTo(bwTx+12,bwTy);X.moveTo(bwTx,bwTy-12);X.lineTo(bwTx,bwTy+12);X.stroke();
    // 사거리 점선
    X.globalAlpha=.25;X.strokeStyle='#bbaa77';X.lineWidth=1;X.setLineDash(_D4_8);
    X.beginPath();X.moveTo(P.x,P.y);X.lineTo(bwTx,bwTy);X.stroke();X.setLineDash(_D0);
    const bwD=Math.sqrt((bwTx-P.x)*(bwTx-P.x)+(bwTy-P.y)*(bwTy-P.y));
    X.globalAlpha=.8;X.fillStyle='#ddccaa';X.font='bold 10px monospace';X.textAlign='center';X.fillText(~~bwD+'px',(P.x+bwTx)/2,(P.y+bwTy)/2-3);
    X.restore();
  }
  // ══ 뇌전창 조준 인디케이터 ══
  if(P._tsAiming){
    let _tsTx=mouse.x-VW/2+G.cam.x,_tsTy=mouse.y-VH/2+G.cam.y;
    const _tsD2=dst(P.x,P.y,_tsTx,_tsTy);if(_tsD2>1000){const _tsA2=Math.atan2(_tsTy-P.y,_tsTx-P.x);_tsTx=P.x+Math.cos(_tsA2)*1000;_tsTy=P.y+Math.sin(_tsA2)*1000}
    const _tst=_now*.005;
    X.save();
    // 설치 포인트 — 전기 깜빡임
    X.globalAlpha=.15+.05*Math.sin(_tst*12);X.fillStyle='#44ddff';
    X.beginPath();X.arc(_tsTx,_tsTy,20,0,Math.PI*2);X.fill();
    // 창 미리보기 (세로 창)
    X.globalAlpha=.5+.1*Math.sin(_tst*8);X.fillStyle='#88eeff';
    X.fillRect(_tsTx-2,_tsTy-28,4,40);
    X.fillStyle='#ffffff';X.fillRect(_tsTx-4,_tsTy-28,8,6); // 창날
    // 기존 창과의 아크 미리보기 점선
    if(G._thunderStakes){
      X.strokeStyle='#44ddff';X.lineWidth=1;X.setLineDash(_D4_6);X.globalAlpha=.3;
      for(let _ti=0;_ti<G._thunderStakes.length;_ti++){
        const ts=G._thunderStakes[_ti];
        if(dst(ts.x,ts.y,_tsTx,_tsTy)<=600){
          X.beginPath();X.moveTo(ts.x,ts.y);X.lineTo(_tsTx,_tsTy);X.stroke();
        }
      }
      X.setLineDash(_D0);
    }
    // 십자선
    X.globalAlpha=.4;X.strokeStyle='#44ddff';X.lineWidth=1;
    X.beginPath();X.moveTo(_tsTx-12,_tsTy);X.lineTo(_tsTx+12,_tsTy);X.moveTo(_tsTx,_tsTy-12);X.lineTo(_tsTx,_tsTy+12);X.stroke();
    // 사거리 점선
    X.globalAlpha=.2;X.strokeStyle='#44ddff';X.lineWidth=1;X.setLineDash(_D4_8);
    X.beginPath();X.moveTo(P.x,P.y);X.lineTo(_tsTx,_tsTy);X.stroke();X.setLineDash(_D0);
    // 스택 표시
    const _tsMax2=(P.skills.thunderStake>=10)?6:5;
    X.globalAlpha=.8;X.fillStyle='#44ddff';X.font='bold 11px monospace';X.textAlign='center';
    X.fillText('\u26A1 '+_T('뇌전창')+' '+(P._tsStk||0)+'/'+_tsMax2,_tsTx,_tsTy-36);
    X.restore();
  }
  // ══ 활성 뇌전창 + 전기 아크 렌더 ══
  if(G._thunderStakes&&G._thunderStakes.length>0){
    X.save();
    const _tst2=_now*.005;
    // 각 창 렌더
    for(let _ti=0;_ti<G._thunderStakes.length;_ti++){
      const ts=G._thunderStakes[_ti];
      const _tsProg=ts.t/ts.maxT;
      const _tsFade=_tsProg>.8?1-(_tsProg-.8)/.2:1;
      // 지면 전기 파동
      X.globalAlpha=.35*_tsFade;X.fillStyle='#44ddff';
      X.beginPath();X.arc(ts.x,ts.y,25+5*Math.sin(_tst2*10+_ti*2),0,Math.PI*2);X.fill();
      // 창대 (세로)
      X.globalAlpha=.9*_tsFade;X.fillStyle='#88ccee';
      X.fillRect(ts.x-2,ts.y-30,4,42);
      // 창날
      X.fillStyle='#ffffff';
      X.beginPath();X.moveTo(ts.x,ts.y-36);X.lineTo(ts.x-5,ts.y-26);X.lineTo(ts.x+5,ts.y-26);X.closePath();X.fill();
      // 전기 깜빡임
      X.globalAlpha=(.5+.3*Math.sin(_tst2*15+_ti*3))*_tsFade;
      X.globalCompositeOperation='lighter';
      X.fillStyle='#44ddff';
      X.beginPath();X.arc(ts.x,ts.y-30,8+3*Math.sin(_tst2*20),0,Math.PI*2);X.fill();
      X.globalCompositeOperation='source-over';
    }
    // 전기 아크 렌더 (600px 이내 쌍)
    if(G._thunderStakes.length>=2){
      X.globalCompositeOperation='lighter';
      for(let _ti=0;_ti<G._thunderStakes.length;_ti++){for(let _tj=_ti+1;_tj<G._thunderStakes.length;_tj++){
        const _ta=G._thunderStakes[_ti],_tb=G._thunderStakes[_tj];
        const _td=dst(_ta.x,_ta.y,_tb.x,_tb.y);if(_td>1000)continue;
        const _taF=(_ta.t/_ta.maxT>.8?1-(_ta.t/_ta.maxT-.8)/.2:1);
        const _tbF=(_tb.t/_tb.maxT>.8?1-(_tb.t/_tb.maxT-.8)/.2:1);
        const _arcFade=Math.min(_taF,_tbF);
        // 전류강화 판정: 아크 선분이 iceStorm 존과 교차하는지 (물→전기 반응, 2026-05-08 holyDome 제외)
        let _arcBoosted=false;
        if(G._fireZones){for(let _fzi=0;_fzi<G._fireZones.length;_fzi++){
          const fz=G._fireZones[_fzi];if(fz.type!=='iceStorm')continue;
          const _ldx=_tb.x-_ta.x,_ldy=_tb.y-_ta.y,_ll2=_ldx*_ldx+_ldy*_ldy;
          let _lt=_ll2>0?((fz.x-_ta.x)*_ldx+(fz.y-_ta.y)*_ldy)/_ll2:0;
          _lt=_lt<0?0:_lt>1?1:_lt;
          if(dst(fz.x,fz.y,_ta.x+_lt*_ldx,_ta.y+_lt*_ldy)<fz.r){_arcBoosted=true;break}
        }}
        // 메인 번개 라인 (지그재그)
        for(let _ln=0;_ln<2;_ln++){
          X.globalAlpha=((_arcBoosted?.95:.8)-.1*_ln)*_arcFade;
          X.strokeStyle=_arcBoosted?(_ln===0?'#ff6644':'#ffaa88'):(_ln===0?'#44ddff':'#aaeeff');
          X.lineWidth=_arcBoosted?(_ln===0?6:3):(_ln===0?5:2);
          X.beginPath();X.moveTo(_ta.x,_ta.y-20);
          const _segs=8;
          const _sdx=(_tb.x-_ta.x)/_segs,_sdy=((_tb.y-20)-(_ta.y-20))/_segs;
          for(let _s=1;_s<_segs;_s++){
            const _jx=(Math.random()-.5)*24,_jy=(Math.random()-.5)*24;
            X.lineTo(_ta.x+_sdx*_s+_jx,_ta.y-20+_sdy*_s+_jy);
          }
          X.lineTo(_tb.x,_tb.y-20);X.stroke();
        }
        // 중간 전기 파티클
        if(Math.random()<.3){
          const _mp=Math.random();
          const _mx2=_ta.x+(_tb.x-_ta.x)*_mp,_my2=(_ta.y-20)+(_tb.y-20-(_ta.y-20))*_mp;
          X.globalAlpha=.4*_arcFade;X.fillStyle=_arcBoosted?'#ffccaa':'#ffffff';
          X.fillRect(_mx2-2,_my2-2,4,4);
        }
      }}
      X.globalCompositeOperation='source-over';
    }
    X.restore();
  }
  // ══ 활성 해골무덤 렌더 ══
  if(G._boneWalls&&G._boneWalls.length>0){
    X.save();
    for(let bwi=0;bwi<G._boneWalls.length;bwi++){
      const bw=G._boneWalls[bwi];
      const prog=Math.min(bw.t/bw.riseT,1);
      const _bwSh=_VFX_SHEETS.boss_cageTrap;
      if(_bwSh&&_bwSh.img){
        const _bwExitProg=bw.phase==='crumble'?Math.min(1,Math.max(0,(bw.t-(bw.maxT-60))/60)):0;
        const _bwFr=bw.phase==='rise'?Math.min(5,~~(prog*6)):bw.phase==='crumble'?Math.max(0,5-Math.min(5,~~(_bwExitProg*6))):5;
        const _bwSz=bw.ringR*3.35;
        const _bwFade=bw.phase==='crumble'?1-_bwExitProg:1;
        X.globalAlpha=_bwFade;
        X.drawImage(_bwSh.img,(_bwFr%3)*512,~~(_bwFr/3)*512,512,512,bw.x-_bwSz/2,bw.y-_bwSz*.54,_bwSz,_bwSz);
      }else{// 스프라이트 로드 전 절차식 해골벽 폴백
        const pilCnt=~~(Math.PI*2*bw.ringR/18);// 뼈기둥 개수 (간격 ~18px)
        if(bw.phase==='rise'){
          // 솟아오르는 해골무덤
          const h=22*prog;
          for(let i=0;i<pilCnt;i++){
            const a=Math.PI*2*i/pilCnt;
            const px=bw.x+Math.cos(a)*bw.ringR,py=bw.y+Math.sin(a)*bw.ringR;
            X.globalAlpha=.5+prog*.4;X.fillStyle=i%3===0?'#bbaa88':'#ccbb99';
            X.fillRect(px-4,py+10-h,8,h);
            if(i%4===0){X.fillStyle='#aa9977';X.fillRect(px-2,py+10-h,2,h)}
          }
          // 바닥 균열
          if(prog<.7&&Math.random()>.7){
            const ra=Math.random()*Math.PI*2;
            poolPart(bw.x+Math.cos(ra)*bw.ringR,bw.y+Math.sin(ra)*bw.ringR,0,-1.5,'#887766',2,8);
          }
        }else if(bw.phase==='stand'){
          // 완전체 해골무덤
          for(let i=0;i<pilCnt;i++){
            const a=Math.PI*2*i/pilCnt;
            const px=bw.x+Math.cos(a)*bw.ringR,py=bw.y+Math.sin(a)*bw.ringR;
            X.globalAlpha=.85;X.fillStyle=i%3===0?'#bbaa88':'#ccbb99';
            X.fillRect(px-4,py-12,8,24);
            if(i%5===0){X.fillStyle='#aa9977';X.fillRect(px-2,py-12,2,24);X.fillRect(px+2,py-12,2,24)}
            // 해골 장식 (일부 기둥)
            if(i%8===0){X.globalAlpha=.6;X.fillStyle='#ddd';X.font='7px monospace';X.textAlign='center';X.fillText('\u2620',px,py+2)}
          }
        }else{
          // 붕괴 페이드아웃
          const crProg=Math.min((bw.t-(bw.maxT-60))/60,1);
          for(let i=0;i<pilCnt;i++){
            const a=Math.PI*2*i/pilCnt;
            const px=bw.x+Math.cos(a)*bw.ringR,py=bw.y+Math.sin(a)*bw.ringR;
            const shrink=crProg*10;
            X.globalAlpha=.85*(1-crProg);X.fillStyle='#aa9977';
            X.fillRect(px-4,py-12+shrink,8,24-shrink*2);
          }
        }
      }
      // 남은 시간
      if(bw.phase==='stand'){
        const rem=(bw.maxT-bw.t)/60;
        if(rem<3){X.globalAlpha=.6;X.fillStyle='#ff8844';X.font='bold 9px monospace';X.textAlign='center';X.fillText(rem.toFixed(1)+'s',bw.x,bw.y-bw.ringR-8)}
      }
    }
    X.restore();
  }
  _dpS1=performance.now(); // S1=조준인디+해골무덤 끝
  // ══ 천공쇄기 — 예고 원·45도 메테오 쇄기·지면 관통 ══
  if(G._skyCrushers&&G._skyCrushers.length){for(let _sci=0;_sci<G._skyCrushers.length;_sci++){const sc=G._skyCrushers[_sci];
    X.save();
    if(!sc.impacted){
      const _scFall=Math.min(1,sc.t/sc.impactT),_scEase=_scFall*_scFall*_scFall,_scPulse=.6+.3*Math.sin(_now*.018);
      X.globalAlpha=_scPulse;X.strokeStyle='#ff5a36';X.lineWidth=5;X.setLineDash([18,10]);
      X.beginPath();X.ellipse(sc.x,sc.y,sc.r,sc.r*.48,0,0,Math.PI*2);X.stroke();X.setLineDash([]);
      X.globalAlpha=.15+.3*_scFall;X.fillStyle='#170907';X.beginPath();X.ellipse(sc.x,sc.y,sc.r*_scFall,sc.r*.48*_scFall,0,0,Math.PI*2);X.fill();
      X.globalAlpha=.75*_scFall;X.strokeStyle='#ffad55';X.lineWidth=2;X.beginPath();X.ellipse(sc.x,sc.y,sc.r*(.28+.28*_scFall),sc.r*(.12+.14*_scFall),0,0,Math.PI*2);X.stroke();
      const _scAirX=sc.x-(1-_scFall)*720,_scAirY=sc.y-(1-_scFall)*720,_scH=430+sc.r*.55,_scW=_scH*1.125;
      const _scFrame=Math.min(3,Math.floor(_scFall*4));
      X.translate(_scAirX,_scAirY);X.globalAlpha=.78+.22*_scEase;X.shadowColor='#ff4a16';X.shadowBlur=12+24*_scFall;
      if(!_drawSkyCrusherFrame(_scFrame,_scW,_scH)){
        X.rotate(-Math.PI*.25);X.fillStyle='#24201d';X.strokeStyle='#d09b58';X.lineWidth=5;X.beginPath();X.moveTo(-_scW*.22,-_scH*.78);X.lineTo(_scW*.22,-_scH*.78);X.lineTo(_scW*.12,-_scH*.08);X.lineTo(0,_scH*.08);X.lineTo(-_scW*.12,-_scH*.08);X.closePath();X.fill();X.stroke()
      }
    }else{
      const _persistT=sc.t-sc.impactT,_persistFade=Math.min(1,Math.max(0,(sc.persistT-_persistT)/30));
      const _embedFrame=Math.floor(_persistT/6)%8;
      const _embedH=500+sc.r*.55,_embedW=_embedH*.75,_embedJolt=Math.sin(_persistT*2.4)*5*Math.max(0,1-_persistT/10);
      // 깊이 동기화: 박힘 시트 자체의 지면 파편을 사용하고 별도 원형 장판은 그리지 않음
      X.save();X.translate(sc.x+_embedJolt,sc.y);X.globalAlpha=_persistFade;X.shadowColor='#ff3b0b';X.shadowBlur=18;
      if(!_drawSkyCrusherBurnFrame(_embedFrame,_embedW,_embedH))_drawSkyCrusherFrame(11,_embedW*1.5,_embedH);
      X.restore();
    }
    X.restore();
  }}
  // ══ 불장판 렌더 (투명도 60%로 적 가시성 확보) ══
  if(G._fireZones&&G._fireZones.length>0){
    const _fzAlphaMul=0.3; // 장판 전체 투명도 계수
    for(let _fzi=0;_fzi<G._fireZones.length;_fzi++){
      const fz=G._fireZones[_fzi];
      const _fzProg=fz.t/fz.maxT;
      const _fzFade=(_fzProg>.8?1-(_fzProg-.8)/.2:1)*_fzAlphaMul;
      if(fz.type==='dim'){
        // 차원 장판 — 렌더 제거 (이미지 결계로 대체)
        0;
      }else if(fz.type==='dimPoison'){
        // 독길 — 렌더 제거
        0;
      }else if(fz.type==='dimLightning'){
        // 사슬이동:강화 번개길 — 바닥/테두리 제거, 미니 번개만 유지
        const _dlSf=~~(fz.t);
        if(!fz._bolts||_dlSf%3===0){
          fz._bolts=[];const _dlBc=3+~~(Math.random()*3);
          for(let _bi=0;_bi<_dlBc;_bi++){const pts=[];
            const cx=fz.x+(Math.random()-.5)*fz.r*1.2,cy=fz.y+(Math.random()-.5)*fz.r*1.2;
            const len=6+Math.random()*15,ang=Math.random()*Math.PI*2,segs=2+~~(Math.random()*2);
            for(let s=0;s<=segs;s++){const t=s/segs;pts.push({x:cx+Math.cos(ang)*len*t+(Math.random()-.5)*5,y:cy+Math.sin(ang)*len*t+(Math.random()-.5)*4})}
            fz._bolts.push({pts,w:.4+Math.random()*.8,a:.4+Math.random()*.4});
          }
        }
        for(let _bi=0;_bi<fz._bolts.length;_bi++){const b=fz._bolts[_bi];
          X.strokeStyle='#eeff00';X.lineWidth=b.w;X.globalAlpha=b.a*_fzFade;
          X.beginPath();X.moveTo(b.pts[0].x,b.pts[0].y);for(let p=1;p<b.pts.length;p++)X.lineTo(b.pts[p].x,b.pts[p].y);X.stroke();
          if(b.w>.8){X.strokeStyle='#ffffff';X.lineWidth=b.w+1;X.globalAlpha=b.a*.25*_fzFade;
            X.beginPath();X.moveTo(b.pts[0].x,b.pts[0].y);for(let p=1;p<b.pts.length;p++)X.lineTo(b.pts[p].x,b.pts[p].y);X.stroke()}
        }
      }else if(fz.type==='shockField'){
        // ═══ 전격이동 전류장판 — Power Lightning 스프라이트 (악의폭풍과 동일 에셋) ═══
        const _sfFade=(_fzProg>.8?1-(_fzProg-.8)/.2:1)*0.24; // 겹치는 전기 스프라이트가 탄막을 가리지 않도록 제한
        if(!fz._spr){
          fz._spr={f0:Math.random()*16, f1:Math.random()*12, f2:Math.random()*9,
            sc:fz.r/60, rot:Math.random()*Math.PI*2, flip:Math.random()>.5?-1:1};
        }
        const _spT=fz.t;
        // 매 30프레임마다 회전 변경
        if(~~(_spT)%30===0&&_spT>1){fz._spr.rot=Math.random()*Math.PI*2;fz._spr.flip=Math.random()>.5?-1:1}
        const _blend2=X.globalCompositeOperation;
        X.globalCompositeOperation='lighter';
        const s=fz._spr;
        if(_msStormImg1&&_msStormImg1.width>0){
          const fw1=_msStormImg1.width/4, fh1=_msStormImg1.height/4;
          const fi1=~~((s.f0+_spT*0.15)%16);
          const sx1=(fi1%4)*fw1, sy1=~~(fi1/4)*fh1;
          const sz1=fw1*s.sc;
          X.globalAlpha=_sfFade;
          X.save();X.translate(fz.x,fz.y);X.rotate(s.rot);X.scale(s.flip,1);
          X.drawImage(_msStormImg1,sx1,sy1,fw1,fh1,-sz1/2,-sz1/2,sz1,sz1);
          X.restore();
        }
        if(_msStormImg2&&_msStormImg2.width>0){
          const fw2=_msStormImg2.width/4, fh2=_msStormImg2.height/3;
          const fi2=~~((s.f1+_spT*0.18)%12);
          const sx2=(fi2%4)*fw2, sy2=~~(fi2/4)*fh2;
          const sz2=fw2*s.sc*1.1;
          X.globalAlpha=_fdgDruidDecorAlpha(_sfFade,fz.t);
          X.save();X.translate(fz.x,fz.y);X.rotate(s.rot+0.5);X.scale(s.flip,1);
          X.drawImage(_msStormImg2,sx2,sy2,fw2,fh2,-sz2/2,-sz2/2,sz2,sz2);
          X.restore();
        }
        if(_msStormImg3&&_msStormImg3.width>0){
          const fw3=_msStormImg3.width/3, fh3=_msStormImg3.height/3;
          const fi3=~~((s.f2+_spT*0.12)%9);
          const sx3=(fi3%3)*fw3, sy3=~~(fi3/3)*fh3;
          const sz3=fw3*s.sc*0.6;
          X.globalAlpha=0.7*_sfFade;
          X.save();X.translate(fz.x,fz.y);X.rotate(s.rot-0.3);X.scale(s.flip,1);
          X.drawImage(_msStormImg3,sx3,sy3,fw3,fh3,-sz3/2,-sz3/2,sz3,sz3);
          X.restore();
        }
        X.globalCompositeOperation=_blend2;
        // ── 착지 번개 기둥 렌더링 (착지 시 1회 생성됨) ──
        if(!fz._thunder)fz._thunder=[];
        {let _tw=0;for(let ti=0;ti<fz._thunder.length;ti++){
          const th=fz._thunder[ti];th.life--;
          if(th.life<=0)continue;fz._thunder[_tw++]=th}fz._thunder.length=_tw}
        for(let ti=0;ti<fz._thunder.length;ti++){
          const th=fz._thunder[ti];
          const ta=th.life/th.maxLife;
          const flash=th.life>th.maxLife-4?2:1;
          X.lineCap='round';
          // 기둥 2레이어: 파랑메인→흰코어 (4→2레이어로 절반 감소)
          const _lA={wMul:1.3,col:'#6677ee',alp:.7};const _lB={wMul:.5,col:'#eeeeff',alp:.9};
          for(let li=0;li<2;li++){const L=li===0?_lA:_lB;
            X.strokeStyle=L.col;X.lineWidth=th.baseW*L.wMul;X.globalAlpha=li===0?_fdgDruidDecorAlpha(L.alp*ta*flash*_sfFade,th.maxLife-th.life):L.alp*ta*flash*_sfFade;
            X.beginPath();X.moveTo(th.pts[0].x,th.pts[0].y);
            for(let p=1;p<th.pts.length;p++)X.lineTo(th.pts[p].x,th.pts[p].y);
            X.stroke();
          }
          // 분기: 코어 레이어만 (4→1세트)
          X.lineWidth=th.baseW*.5;X.globalAlpha=_lB.alp*ta*.5*flash*_sfFade;X.strokeStyle=_lB.col;
          for(let b=0;b<th.br.length;b++){
            X.beginPath();X.moveTo(th.br[b][0].x,th.br[b][0].y);
            for(let p=1;p<th.br[b].length;p++)X.lineTo(th.br[b][p].x,th.br[b][p].y);X.stroke();
          }
        }
        X.lineCap='butt';
      }else if(fz.type==='darkPillar'){
        // ═══ 악의기둥 — 기둥 VFX만 (범위 가이드 없음) ═══
        _drawDarkPillar(X,fz,_fzFade,_now);
      }else if(fz.type==='storm'||fz.type==='boneStorm'){
        // ═══ 악의폭풍 / 해골번개 — 이오닉 스톰 (바닥 접지형 전기장 + 밀집 번개) ═══
        const _isBoneStormVFX=(fz.type==='boneStorm');
        if(!fz._spr){
          fz._spr=[];
          const _cnt=12+~~(Math.random()*5); // 12~16개 (밀집)
          for(let i=0;i<_cnt;i++){
            const a=Math.random()*Math.PI*2;
            const d=Math.random()*fz.r*0.85;
            fz._spr.push({
              ox:Math.cos(a)*d, oy:Math.sin(a)*d,
              f0:Math.random()*16, f1:Math.random()*12, f2:Math.random()*9,
              sc:0.9+Math.random()*0.7, rot:Math.random()*Math.PI*2,
              flip:Math.random()>.5?-1:1
            });
          }
        }
        const _spT=fz.t;
        // 매 30프레임(0.5초)마다 위치 셔플 (더 자주 번쩍)
        if(~~(_spT)%30===0&&_spT>1){
          for(let i=0;i<fz._spr.length;i++){
            const a=Math.random()*Math.PI*2;
            const d=Math.random()*fz.r*0.85;
            fz._spr[i].ox=Math.cos(a)*d;fz._spr[i].oy=Math.sin(a)*d;
            fz._spr[i].rot=Math.random()*Math.PI*2;
            fz._spr[i].flip=Math.random()>.5?-1:1;
          }
        }
        const _blend=X.globalCompositeOperation;
        const _stDeploy=Math.min(1,_spT/15);
        // ── 바닥 격자 번개 (타일에 달라붙는 느낌) ──
        X.globalCompositeOperation='screen';
        const _gridN=4+~~(fz.r/80); // 격자 줄 수
        X.globalAlpha=(.25+.15*Math.sin(_now*.005))*_fzFade;
        X.strokeStyle=_isBoneStormVFX?'#446622':'#6644cc';X.lineWidth=1;
        for(let gi=0;gi<_gridN;gi++){
          const gy=fz.y-fz.r*_stDeploy+gi*(fz.r*2*_stDeploy/_gridN);
          X.beginPath();X.moveTo(fz.x-fz.r*_stDeploy,gy);
          for(let gx=fz.x-fz.r*_stDeploy;gx<fz.x+fz.r*_stDeploy;gx+=12){
            X.lineTo(gx,gy+(Math.random()-.5)*4);
          }
          X.stroke();
        }
        // ── 밀집 번개 스프라이트 (스케일 작게, 수 많게) ──
        for(let i=0;i<fz._spr.length;i++){
          const s=fz._spr[i];
          const px=fz.x+s.ox*_stDeploy, py=fz.y+s.oy*_stDeploy;
          if(_msStormImg1&&_msStormImg1.width>0){
            const fw1=_msStormImg1.width/4, fh1=_msStormImg1.height/4;
            const fi1=~~((s.f0+_spT*0.2)%16);
            const sx1=(fi1%4)*fw1, sy1=~~(fi1/4)*fh1;
            const sz1=fw1*s.sc*0.8;
            X.globalAlpha=.25*_fzFade;
            X.save();X.translate(px,py);X.rotate(s.rot);X.scale(s.flip,1);
            X.drawImage(_msStormImg1,sx1,sy1,fw1,fh1,-sz1/2,-sz1/2,sz1,sz1);
            X.restore();
          }
          if(_msStormImg2&&_msStormImg2.width>0){
            const fw2=_msStormImg2.width/4, fh2=_msStormImg2.height/3;
            const fi2=~~((s.f1+_spT*0.25)%12);
            const sx2=(fi2%4)*fw2, sy2=~~(fi2/4)*fh2;
            const sz2=fw2*s.sc*0.9;
            X.globalAlpha=.22*_fzFade;
            X.save();X.translate(px,py);X.rotate(s.rot+0.7);X.scale(s.flip,1);
            X.drawImage(_msStormImg2,sx2,sy2,fw2,fh2,-sz2/2,-sz2/2,sz2,sz2);
            X.restore();
          }
          if(_msStormImg3&&_msStormImg3.width>0){
            const fw3=_msStormImg3.width/3, fh3=_msStormImg3.height/3;
            const fi3=~~((s.f2+_spT*0.18)%9);
            const sx3=(fi3%3)*fw3, sy3=~~(fi3/3)*fh3;
            const sz3=fw3*s.sc*0.5;
            X.globalAlpha=.20*_fzFade;
            X.save();X.translate(px,py);X.rotate(s.rot-0.4);X.scale(s.flip,1);
            X.drawImage(_msStormImg3,sx3,sy3,fw3,fh3,-sz3/2,-sz3/2,sz3,sz3);
            X.restore();
          }
        }
        // ── 해골번개 오버레이 (뼈 파편 + 암흑 스파크) ──
        if(_isBoneStormVFX){
          if(!fz._bones||~~(fz.t)%3===0){
            fz._bones=[];
            for(let _bi=0;_bi<10;_bi++){
              const _ba=Math.random()*Math.PI*2;const _bd=Math.random()*fz.r*.85;
              fz._bones.push({x:fz.x+Math.cos(_ba)*_bd,y:fz.y+Math.sin(_ba)*_bd,
                a:Math.random()*Math.PI,w:2+Math.random()*3,h:1+Math.random()*2,
                c:Math.random()>.5?'#ccbb99':'#bbaa77',al:.3+Math.random()*.4});
            }
          }
          for(let _bi=0;_bi<fz._bones.length;_bi++){
            const b=fz._bones[_bi];
            X.save();X.translate(b.x,b.y);X.rotate(b.a);
            X.globalAlpha=b.al*_fzFade;X.fillStyle=b.c;
            X.fillRect(-b.w,-b.h,b.w*2,b.h*2);
            X.restore();
          }
          for(let _si=0;_si<5;_si++){
            const _sa=Math.random()*Math.PI*2;const _sd=Math.random()*fz.r*.8;
            X.globalAlpha=(.2+Math.random()*.3)*_fzFade;
            X.fillStyle=Math.random()>.5?'#6644aa':'#55cc77';
            X.beginPath();X.arc(fz.x+Math.cos(_sa)*_sd,fz.y+Math.sin(_sa)*_sd,1+Math.random()*1.5,0,Math.PI*2);X.fill();
          }
        }
        // ── 외곽 전기 아크 (바깥 테두리에 번개 가닥) ──
        X.globalAlpha=(.4+.2*Math.sin(_now*.004))*_fzFade;
        X.strokeStyle=_isBoneStormVFX?'#55cc44':'#8866ff';X.lineWidth=1.5;
        for(let ai=0;ai<8;ai++){
          const aa=ai*Math.PI/4+Math.sin(_now*.002+ai)*.3;
          X.beginPath();
          let ax=fz.x+Math.cos(aa)*fz.r*0.3*_stDeploy;
          let ay=fz.y+Math.sin(aa)*fz.r*0.3*_stDeploy;
          X.moveTo(ax,ay);
          for(let seg=0;seg<5;seg++){
            ax+=(Math.cos(aa)*fz.r*0.14+((Math.random()-.5)*12))*_stDeploy;
            ay+=(Math.sin(aa)*fz.r*0.14+((Math.random()-.5)*12))*_stDeploy;
            X.lineTo(ax,ay);
          }
          X.stroke();
        }
        X.globalCompositeOperation=_blend;
      }else if(fz.type==='iceStorm'){
        // ═══ 아이스스톰 — 블리자드 소용돌이 장판 (iceVortex 스타일) ═══
        const _ist=_now*.001;const _isf=~~(fz.t);
        const _isDeployT=Math.min(1,fz.t/20);
        const _isSz=fz.r*2*_isDeployT;
        // 1) 소용돌이 이미지 (iceVortex와 동일 에셋, 역회전)
        if(!G._vortexImg){G._vortexImg=new Image();G._vortexImg.src='sprites/spike_trap/vortex.png'}
        const _isVImg=G._vortexImg;
        if(_isVImg.complete&&_isVImg.naturalWidth>0){
          X.globalAlpha=(.4+.2*Math.sin(_ist*3))*_fzFade;
          X.save();X.translate(fz.x,fz.y);
          X.rotate(-_now*0.00006);
          X.drawImage(_isVImg,-_isSz/2,-_isSz/2,_isSz,_isSz);
          X.restore();
          // 2차 레이어 (작게, 반대 회전)
          X.globalAlpha=(.25+.1*Math.sin(_ist*5))*_fzFade;
          X.save();X.translate(fz.x,fz.y);
          X.rotate(_now*0.00009);
          X.drawImage(_isVImg,-_isSz*.35,-_isSz*.35,_isSz*.7,_isSz*.7);
          X.restore();
        }
        // 2) 바닥 서리 원 (범위 가이드)
        X.globalAlpha=(.12+.06*Math.sin(_ist*2))*_fzFade;
        X.strokeStyle='#88ddff';X.lineWidth=2;
        X.beginPath();X.arc(fz.x,fz.y,fz.r*_isDeployT,0,Math.PI*2);X.stroke();
        // 3) 얼음 파편 — 다이아몬드
        if(!fz._iceShards||_isf%3===0){
          fz._iceShards=[];
          for(let _bi=0;_bi<14;_bi++){
            const _ba=Math.random()*Math.PI*2;const _bd=Math.random()*fz.r*.9;
            fz._iceShards.push({x:fz.x+Math.cos(_ba)*_bd,y:fz.y+Math.sin(_ba)*_bd,
              a:Math.random()*Math.PI,sz:2+Math.random()*3,
              c:Math.random()>.5?'#aaeeff':'#ccf0ff',al:.3+Math.random()*.5});
          }
        }
        for(let _bi=0;_bi<fz._iceShards.length;_bi++){
          const s=fz._iceShards[_bi];
          X.save();X.translate(s.x,s.y);X.rotate(s.a);
          X.globalAlpha=s.al*_fzFade;X.fillStyle=s.c;
          X.beginPath();X.moveTo(0,-s.sz);X.lineTo(s.sz*.6,0);X.lineTo(0,s.sz);X.lineTo(-s.sz*.6,0);X.closePath();X.fill();
          X.restore();
        }
        // 4) 눈보라 스파크 점
        for(let _si=0;_si<10;_si++){
          const _sa=Math.random()*Math.PI*2;const _sd=Math.random()*fz.r*.85;
          X.globalAlpha=(.3+Math.random()*.4)*_fzFade;
          X.fillStyle=Math.random()>.4?'#ffffff':'#88ddff';
          X.beginPath();X.arc(fz.x+Math.cos(_sa)*_sd,fz.y+Math.sin(_sa)*_sd,1+Math.random()*1.5,0,Math.PI*2);X.fill();
        }
      }else if(fz.type==='vortex'||fz.type==='iceVortex'){
        // ═══ 폭풍소환 소용돌이 / 얼음소용돌이 — 이미지 기반 ═══
        const _vIce=fz.type==='iceVortex';
        const _vt=_now*.001;const _vProg=fz.t/fz.maxT;const _vFade=_vProg>.8?1-(_vProg-.8)/.2:1;
        const _deployT=Math.min(1,fz.t/15);
        const _vSz=fz.r*2*_deployT;
        if(!G._vortexImg){G._vortexImg=new Image();G._vortexImg.src='sprites/spike_trap/vortex.png'}
        const _vtImg=G._vortexImg;
        if(_vtImg.complete&&_vtImg.naturalWidth>0){
          X.globalAlpha=(.5+.3*Math.sin(_vt*3))*_vFade*_fzFade;
          X.save();X.translate(fz.x,fz.y);
          X.rotate(_now*0.00008*(_vIce?-1:1));
          X.drawImage(_vtImg,-_vSz/2,-_vSz/2,_vSz,_vSz);
          X.restore();
        }
      }else if(fz.type==='fireAura'){
        // ═══ 지옥진 — 지진 + 80회 순차 화염기둥 ═══
        const _faProg=fz.t/fz.maxT;
        const _faFade=_faProg>.85?1-(_faProg-.85)/.15:1;
        // ── 플레이어 근처 바닥 균열 스프라이트 ──
        const _quakeStr=Math.sin(fz.t*0.4)*3+Math.sin(fz.t*0.7)*2;
        if(_gcReady&&_gcFW>0){
          const _gcFi=~~(fz.t*.08)%_GC_FRAMES;
          const _gcSz=fz.r*2.5; // 1렙 r=200 → 500px
          X.globalAlpha=(.3+.075*Math.sin(fz.t*.1))*_faFade; // 2026-04-16 균열 진하기 반감
          X.save();X.translate(fz.x+_quakeStr,fz.y+_quakeStr*.5);
          X.rotate(fz.t*.015);
          X.drawImage(_GC_IMG,_gcFi*_gcFW,0,_gcFW,_gcFH,-_gcSz/2,-_gcSz/2,_gcSz,_gcSz);
          X.restore();
        }
        // ── 화염기둥 80회 순차 솟아오름 ──
        if(_faReady){
          const _faTotal=80;
          const _faInterval=~~(fz.maxT/_faTotal);
          const _faPLife=35;
          if(!fz._seeds){
            fz._seeds=[];
            for(let i=0;i<_faTotal;i++){
              const a=Math.PI*2*((i*0.618033+i*i*0.1)%1);
              const d=0.2+((i*13+7)%19)/19*0.8;
              const sz=0.35+((i*11+3)%13)/13*0.3;
              const rot=((i*17+5)%11)/11*0.5-0.25;
              const flip=(i%3===0)?-1:1;
              fz._seeds.push({a,d,sz,rot,flip});
            }
          }
          for(let _ei=0;_ei<_faTotal;_ei++){
            const _localT=fz.t-_ei*_faInterval;
            if(_localT<0||_localT>=_faPLife)continue;
            const _eT=_localT/_faPLife;
            const _riseProg=_eT<.25?1-Math.pow(1-_eT/.25,2):1;
            const _fadeProg=_eT>.55?Math.pow(1-(_eT-.55)/.45,2):1;
            const _eFr=Math.min(_FA_FRAMES-1,~~(_eT*_FA_FRAMES));
            const sd=fz._seeds[_ei];
            const _eX=fz.x+Math.cos(sd.a)*fz.r*sd.d;
            const _eY=fz.y+Math.sin(sd.a)*fz.r*sd.d;
            const _pillarSz=fz.r*sd.sz;
            const _riseOff=(1-_riseProg)*_pillarSz*0.35;
            const _scaleY=.5+_riseProg*.5;
            const _wobX=Math.sin(_localT*0.35+_ei)*1.5+_quakeStr*.3;
            const _wobY=Math.cos(_localT*0.3+_ei*2)*1+_quakeStr*.2;
            X.globalAlpha=_riseProg*_fadeProg*_faFade;
            X.save();
            X.translate(_eX+_wobX,_eY+_wobY+_riseOff);
            X.rotate(sd.rot);
            X.scale(sd.flip,_scaleY);
            X.drawImage(_FA_IMG,_eFr*_FA_FW,0,_FA_FW,_FA_FH,
              -_pillarSz/2,-_pillarSz/2,_pillarSz,_pillarSz);
            X.restore();
            // 기둥 솟을 때 작은 충격파 (처음 30%만)
            if(_eT<.3){
              const _impR=_pillarSz*.6*(_eT/.3);
              X.globalAlpha=(.3-_eT)*_faFade;X.strokeStyle='#ff8844';X.lineWidth=1;
              X.beginPath();X.arc(_eX,_eY,_impR,0,Math.PI*2);X.stroke();
            }
          }
        }
        // 지속적 미세 화면 흔들림
        if(_faFade>0.1)G.shake=Math.max(G.shake,~~(1.5*_faFade*OPT.shake/100));
      }else if(fz.type==='spikeTrap'){
        // ═══ 가시덫 — 붉은 가시 마법진 (얇은 선이 배경을 가리지 않도록 약한 screen 합성) ═══
        const _deployT=Math.min(1,fz.t/12);
        const _stSz=fz.r*2*_deployT;
        if(!G._spikeTrapImg){G._spikeTrapImg=new Image();G._spikeTrapImg.src='sprites/spike_trap/spike_thorn.png'}
        const _stImg=G._spikeTrapImg;
        if(_stImg.complete&&_stImg.naturalWidth>0){
          X.globalAlpha=(.43+.04*Math.sin(_now*.003))*_fzFade;
          const _prevComp=X.globalCompositeOperation;
          X.globalCompositeOperation='screen';
          X.save();X.translate(fz.x,fz.y);
          X.rotate(_now*0.00005);
          X.drawImage(_stImg,-_stSz/2,-_stSz/2,_stSz,_stSz);
          X.restore();
          X.globalCompositeOperation=_prevComp;
        }
      }else if(fz.type==='weakPhys'||fz.type==='weakMag'||fz.type==='weakPj'||fz.type==='weakRev'){
        // ═══ 싱글 영역 — 십자 이미지 + 색상 틴트 ═══
        const _wt=_now*.001;
        if(!G._zoneSingleImg){G._zoneSingleImg=new Image();G._zoneSingleImg.src='sprites/zone_single.png';G._zoneTinted={}}
        const _zsImg=G._zoneSingleImg;
        if(_zsImg.complete&&_zsImg.naturalWidth>0){
          // 타입별 틴트 캔버스 (최초 1회 생성)
          const _tKey=fz.type;
          if(!G._zoneTinted[_tKey]){
            const _tc=document.createElement('canvas');_tc.width=_zsImg.width;_tc.height=_zsImg.height;
            const _tx=_tc.getContext('2d');
            _tx.drawImage(_zsImg,0,0);
            _tx.globalCompositeOperation='source-atop';
            const _tCol=fz.type==='weakPhys'?'#ff6644':fz.type==='weakMag'?'#aa66ff':fz.type==='weakPj'?'#44aaff':'#ff4488';
            _tx.fillStyle=_tCol;_tx.fillRect(0,0,_tc.width,_tc.height);
            _tx.globalCompositeOperation='source-over';
            G._zoneTinted[_tKey]=_tc;
          }
          const _wkDeploy=Math.min(1,fz.t/15);
          const _wkSz=fz.r*2*_wkDeploy;
          X.globalAlpha=(.5+.3*Math.sin(_wt*3))*_fzFade;
          X.save();X.translate(fz.x,fz.y);
          X.rotate(_now*0.00005);
          X.drawImage(G._zoneTinted[_tKey],-_wkSz/2,-_wkSz/2,_wkSz,_wkSz);
          X.restore();
        }
      }else if(fz.type==='holyDome'){
        // ═══ 회복의 영역 — 녹색 치유 마법진 + 수증기 ═══
        const _hdt=_now*.001;
        const _hdDeploy=Math.min(1,fz.t/15);
        const _hdSz=fz.r*2*_hdDeploy;
        if(!G._holyDomeImg){G._holyDomeImg=new Image();G._holyDomeImg.src='sprites/holy_dome.png'}
        const _hdImg=G._holyDomeImg;
        if(_hdImg.complete&&_hdImg.naturalWidth>0){
          if(!G._holyDomeHealGlow){
            G._holyDomeHealGlow=_tintHolyDome(_hdImg,182,255,84);
          }
          X.save();X.globalCompositeOperation='lighter';X.globalAlpha=(.52+.12*Math.sin(_hdt*3))*_fzFade;
          X.shadowColor='#b6ff54';X.shadowBlur=18;
          X.translate(fz.x,fz.y);X.rotate(-_now*0.00005);
          X.drawImage(G._holyDomeHealGlow,-_hdSz*.51,-_hdSz*.51,_hdSz*1.02,_hdSz*1.02);
          X.restore();
        }
        X.save();X.globalCompositeOperation='lighter';
        for(let _ri=0;_ri<2;_ri++){
          const _rp=(Math.sin(_hdt*(2.1+_ri*.35)+_ri*2.4)+1)*.5;
          X.globalAlpha=(.64+_rp*.18)*_fzFade;X.strokeStyle='#d5ff72';X.lineWidth=3;
          X.beginPath();X.arc(fz.x,fz.y,fz.r*(.62+_ri*.19+_rp*.09)*_hdDeploy,0,Math.PI*2);X.stroke();
        }
        if(!fz._healMist){
          fz._healMist=[];
          for(let _mi=0;_mi<9;_mi++)fz._healMist.push({a:Math.random()*Math.PI*2,d:.16+Math.random()*.66,p:Math.random(),s:.11+Math.random()*.09,w:Math.random()*Math.PI*2});
        }
        X.fillStyle='#e4ffb0';
        for(let _mi=0;_mi<fz._healMist.length;_mi++){
          const _m=fz._healMist[_mi],_life=(_hdt*_m.s+_m.p)%1,_md=fz.r*_m.d;
          const _mx=fz.x+Math.cos(_m.a+_hdt*.16)*_md;
          const _my=fz.y+Math.sin(_m.a+_hdt*.16)*_md-_life*fz.r*.14;
          X.globalAlpha=Math.sin(_life*Math.PI)*.32*_fzFade;
          X.beginPath();X.arc(_mx,_my,2+_life*3+Math.sin(_hdt*2+_m.w),0,Math.PI*2);X.fill();
        }
        X.restore();
      }else if(fz.type==='holyPrison'){
        // 감옥은 별도 렌더 (27793행 부근) — 여기서 skip
      }else if(fz.type==='hellRay'){
        // ═══ 참회 — 마법진 이미지 (회전 + 맥동) ═══
        var _hrSz=fz.r*1.8;
        var _hrPulse=Math.sin(_now*.004); // 느린 맥동
        X.save();X.translate(fz.x,fz.y);X.rotate(fz.ang||0);
        X.globalCompositeOperation='lighter';
        if(_hrRepentImg.complete&&_hrRepentImg.naturalWidth){
          // 1) 외곽 글로우 레이어
          var _hrGsz=_hrSz*(1.15+_hrPulse*.06);
          X.globalAlpha=(.35+.15*_hrPulse)*_fzFade;
          X.drawImage(_hrRepentImg,-_hrGsz/2,-_hrGsz/2,_hrGsz,_hrGsz);
          // 2) 메인 레이어 (0.5~1.0 맥동)
          var _hrMsz=_hrSz*(1+_hrPulse*.03);
          X.globalAlpha=(.75+.25*_hrPulse)*_fzFade;
          X.drawImage(_hrRepentImg,-_hrMsz/2,-_hrMsz/2,_hrMsz,_hrMsz);
          // 3) 코어 레이어 (선명도 부스트)
          var _hrCsz=_hrSz*(.7-.04*_hrPulse);
          X.globalAlpha=(.4+.2*-_hrPulse)*_fzFade;
          X.drawImage(_hrRepentImg,-_hrCsz/2,-_hrCsz/2,_hrCsz,_hrCsz);
        }else{
          var _hrH=fz.r*.9,_hrW=_hrH*.75;
          X.globalAlpha=(.4+.15*Math.sin(_now*.008))*_fzFade;X.fillStyle='#ffee88';
          X.fillRect(-_hrW,-4,_hrW*2,8);X.fillRect(-4,-_hrH,8,_hrH*2);
        }
        X.globalCompositeOperation='source-over';X.globalAlpha=1;X.restore();
      }else if(fz.type==='assaultFlame'){
        // 기동불꽃 불바닥 — 3중폭 스택별 차별화
        const _afS=fz._afStk||0;
        if(_flameImgs.length>=4){
          if(!fz._fp){
            fz._fp=[];const _fnC=Math.max(5,~~(fz.r*fz.r*.002))+_afS*8;
            for(let _fi=0;_fi<_fnC;_fi++){
              const _fa=Math.random()*Math.PI*2;const _fd=Math.random()*fz.r*.8;
              fz._fp.push({x:Math.cos(_fa)*_fd,y:Math.sin(_fa)*_fd,
                fr:~~(Math.random()*4),spd:.8+Math.random()*1.5,sc:(.7+Math.random()*.8)*(1+_afS*.35)});
            }
          }
          const _fFr=_now*.005;
          for(let _fi=0;_fi<fz._fp.length;_fi++){
            const fp=fz._fp[_fi];
            const _idx=(~~(_fFr*fp.spd+fp.fr))%4;
            const _fImg=_flameImgs[_idx];if(!_fImg)continue;
            const _fw=14*fp.sc,_fh=_fImg.height/_fImg.width*_fw;
            X.globalAlpha=(.5+.25*Math.sin(_now*.01+_fi))*_fzFade;
            X.drawImage(_fImg,fz.x+fp.x-_fw*.5,fz.y+fp.y-_fh,_fw,_fh);
          }
          if(_afS>=2&&Math.random()>.5){
            const _pa=Math.random()*Math.PI*2;const _pd=Math.random()*fz.r*.6;
            poolPart(fz.x+Math.cos(_pa)*_pd,fz.y+Math.sin(_pa)*_pd,
              (Math.random()-.5)*1.5,-3-Math.random()*4-_afS,
              _afS>=3?'#ff0000':'#ff4400',3+Math.random()*3+_afS,14+_afS*3);
          }
        }
      }else{
        // 화염 장판 — 스프라이트 불꽃만
        if(_flameImgs.length>=4){
          if(!fz._fp){
            fz._fp=[];const _fnC=Math.max(3,~~(fz.r*fz.r*.0012));
            for(let _fi=0;_fi<_fnC;_fi++){
              const _fa=Math.random()*Math.PI*2;const _fd=Math.random()*fz.r*.85;
              fz._fp.push({x:Math.cos(_fa)*_fd,y:Math.sin(_fa)*_fd,
                fr:~~(Math.random()*4),spd:.5+Math.random()*1.5,sc:.6+Math.random()*.6});
            }
          }
          const _fFr=_now*.004;
          for(let _fi=0;_fi<fz._fp.length;_fi++){
            const fp=fz._fp[_fi];
            const _idx=(~~(_fFr*fp.spd+fp.fr))%4;
            const _fImg=_flameImgs[_idx];if(!_fImg)continue;
            const _fw=12*fp.sc,_fh=_fImg.height/_fImg.width*_fw;
            X.globalAlpha=(.5+.2*Math.sin(_now*.008+_fi))*_fzFade;
            X.drawImage(_fImg,fz.x+fp.x-_fw*.5,fz.y+fp.y-_fh,_fw,_fh);
          }
        }
      }
    }
    X.globalAlpha=1;
  }
  _dpS2=performance.now(); // S2=fireZone(5종장판) 끝
  // ══ 유령 허수아비 — 렌더 ══
  if(!window._scImgs){window._scImgs=[];for(var _sci=0;_sci<2;_sci++){var _im=new Image();_im.src='img/vfx_scarecrow/scarecrow_idle_'+(_sci+1)+'.png';window._scImgs.push(_im)}}
  if(G._voidScarecrow){
    const _vs=G._voidScarecrow;const _vt=_now*.001;
    const _vsF=Math.sin(_vt*2.5)*3;const _vsB=.35+.15*Math.sin(_vt*1.8);
    // 스프라이트 렌더 시도 (2프레임 교대)
    var _scFrame=~~(_now/300)%2;var _scImg=window._scImgs[_scFrame];
    if(_scImg&&_scImg.complete&&_scImg.naturalWidth){
      var _scSz=128;
      // 합체 부풀기: 폭발 허수아비와 동일 (크기 팽창 + 떨림 + 빨간 틴트)
      if(_vs.exploding>0){
        const _swProg=1-_vs.exploding/60;
        const _abRatio=_vs.absorbed/Math.max(1,_vs.maxAbsorb);
        _scSz=128*(1+_abRatio*1.5)*(1+_swProg*0.5);
        X.globalAlpha=0.6+_swProg*0.4;
        // 빨간 틴트
        if(!window._vsTC){window._vsTC=document.createElement('canvas');window._vsTC.width=256;window._vsTC.height=256;window._vsTX=window._vsTC.getContext('2d')}
        const _tc=window._vsTC,_tx=window._vsTX;
        _tx.clearRect(0,0,256,256);_tx.drawImage(_scImg,0,0,256,256);
        _tx.globalCompositeOperation='source-atop';
        const _rA=0.3+_swProg*0.5;
        _tx.fillStyle='rgba(255,30,10,'+_rA.toFixed(2)+')';_tx.fillRect(0,0,256,256);
        _tx.globalCompositeOperation='source-over';
        const _shX=(Math.random()-.5)*_scSz*0.08;
        const _shY=(Math.random()-.5)*_scSz*0.08;
        X.drawImage(_tc,_vs.x-_scSz/2+_shX,_vs.y+_vsF-_scSz/2+_shY,_scSz,_scSz);
      } else {
        X.globalAlpha=_vs.aggroOn?0.7:0.4;
        X.drawImage(_scImg,_vs.x-_scSz/2,_vs.y+_vsF-_scSz/2,_scSz,_scSz);
      }
      X.globalAlpha=1;
    }
    // 허수아비 눈 글로우 제거됨
    const _vsR2=_vs.absorbed/_vs.maxAbsorb;
    X.globalAlpha=.5;X.fillStyle='rgba(20,10,30,.6)';
    X.fillRect(_vs.x-15,_vs.y+_vsF+20,30,4);
    X.fillStyle=_vs.aggroOn?'#bb77ee':'#ddaa44';X.globalAlpha=.7;
    X.fillRect(_vs.x-15,_vs.y+_vsF+20,30*_vsR2,4);
    // 흡수량 텍스트
    X.globalAlpha=.7;X.font='10px "Noto Sans KR"';X.fillStyle=_vs.aggroOn?'#cc99ff':'#aaa';X.textAlign='center';
    X.fillText(_vs.absorbed+'/'+_vs.maxAbsorb,_vs.x,_vs.y+_vsF+17);
    {
      X.globalAlpha=.6;X.font='10px "Noto Sans KR"';X.textAlign='center';
      X.fillStyle=_vs.aggroOn?'#9977bb':'#aa8844';
      X.fillText(_vs.aggroOn?_T('흡수 중...'):_T('흡수 완료 — 재입력으로 회수'),_vs.x,_vs.y+_vsF+32);
    }
    X.globalAlpha=1;
  }
  // ══ 폭발 허수아비 — 렌더 (빨간 틴트 + 흡수량 크기 증가) ══
  if(G._explodeScarecrow){
    if(!window._scImgs){window._scImgs=[];for(var _sci2=0;_sci2<2;_sci2++){var _im2=new Image();_im2.src='img/vfx_scarecrow/scarecrow_idle_'+(_sci2+1)+'.png';window._scImgs.push(_im2)}}
    const _es=G._explodeScarecrow;const _et=_now*.001;
    const _esF=_es.exploding?0:Math.sin(_et*3)*2;
    var _scFrame2=~~(_now/250)%2;var _scImg2=window._scImgs[_scFrame2];
    if(_scImg2&&_scImg2.complete&&_scImg2.naturalWidth){
      // 빨간 틴트: 임시 캔버스
      if(!window._esTC){window._esTC=document.createElement('canvas');window._esTC.width=256;window._esTC.height=256;window._esTX=window._esTC.getContext('2d')}
      const _tc=window._esTC,_tx=window._esTX;
      _tx.clearRect(0,0,256,256);
      _tx.drawImage(_scImg2,0,0,256,256);
      _tx.globalCompositeOperation='source-atop';
      // 흡수량에 따라 빨간색 강화: 0% → 투명 빨강, 100% → 진한 빨강+주황 발광
      const _abRatio=_es.absorbed/Math.max(1,_es.maxAbsorb);
      const _rA=0.25+_abRatio*0.55; // 0.25 → 0.80
      _tx.fillStyle='rgba(255,'+(~~(40-30*_abRatio))+','+(~~(20-15*_abRatio))+','+_rA.toFixed(2)+')';
      _tx.fillRect(0,0,256,256);
      // 만충 가까울수록 주황 발광 오버레이
      if(_abRatio>0.5){_tx.fillStyle='rgba(255,160,0,'+((_abRatio-.5)*0.4).toFixed(2)+')';_tx.fillRect(0,0,256,256)}
      _tx.globalCompositeOperation='source-over';
      // 흡수량에 따라 허수아비 크기 증가: 128 → 최대 320 (2.5배)
      var _esSz=128*(1+_abRatio*1.5);
      // 부풀기 애니: exploding 중 추가 1.5배 팽창 + 떨림
      if(_es.exploding>0){
        const _swProg=1-_es.exploding/60; // 0→1
        _esSz*=(1+_swProg*0.5);
        X.globalAlpha=0.6+_swProg*0.4;
      } else {
        X.globalAlpha=_es.aggroOn?0.8:0.5;
      }
      const _eShkX=_es.exploding>0?(Math.random()-.5)*_esSz*0.08:0;
      const _eShkY=_es.exploding>0?(Math.random()-.5)*_esSz*0.08:0;
      X.drawImage(_tc,_es.x-_esSz/2+_eShkX,_es.y+_esF-_esSz/2+_eShkY,_esSz,_esSz);
      X.globalAlpha=1;
    }
    {
    // 축적 게이지 (빨간색)
    const _esR=_es.absorbed/_es.maxAbsorb;
    X.globalAlpha=.5;X.fillStyle='rgba(30,10,10,.6)';
    X.fillRect(_es.x-15,_es.y+_esF+20,30,4);
    X.fillStyle=_es.aggroOn?'#ff4422':'#ffcc00';X.globalAlpha=.7;
    X.fillRect(_es.x-15,_es.y+_esF+20,30*_esR,4);
    X.globalAlpha=.7;X.font='10px "Noto Sans KR"';X.fillStyle=_es.aggroOn?'#ff6644':'#ffaa00';X.textAlign='center';
    X.fillText(_es.absorbed+'/'+_es.maxAbsorb,_es.x,_es.y+_esF+17);
    X.globalAlpha=.6;X.font='10px "Noto Sans KR"';X.textAlign='center';
    X.fillStyle=_es.aggroOn?'#cc4433':'#ffaa44';
    X.fillText(_es.aggroOn?_T('축적 중...'):_T('만충! 재입력→폭발'),_es.x,_es.y+_esF+32);
    X.globalAlpha=1;
    }
    // 축적 중 불꽃 파티클
    if(_es.absorbed>0&&_es.aggroOn&&!_es.exploding&&Math.random()<.15){
      const _fa=Math.random()*Math.PI*2;
      poolPart(_es.x+Math.cos(_fa)*15,_es.y+_esF+Math.sin(_fa)*15,(Math.random()-.5)*.5,-1-Math.random(),Math.random()<.5?'#ff4422':'#ffaa00',1.5,8+Math.random()*5,1,0,0);
    }
  }
  // ══ 철갑 전대 — 단일 거대 전대 렌더 (입체 그림자·대검 흡수장) ══
  if(G._ancestorReturns&&G._ancestorReturns.length){
    X.save();X.globalCompositeOperation='lighter';
    for(const orb of G._ancestorReturns){
      for(let j=0;j<12;j++){
        const phase=j*Math.PI/6+orb.t*.12,r=(1-orb.t/60)*36;
        const ox=orb.x+Math.cos(phase)*r,oy=orb.y+Math.sin(phase)*r*.6;
        X.fillStyle=['#ff5555','#5599ff','#55ff99'][j%3];
        X.beginPath();X.arc(ox,oy,4,0,Math.PI*2);X.fill();
      }
    }
    X.restore();
  }
  if(G._ancestors&&G._ancestors.length){
    if(!window._ancImgPool){
      window._ancImgPool=_ANC_SPRITE_POOL.map(src=>{const im=new Image();im.src=src;return im});
      window._ancTCPool=new Array(_ANC_SPRITE_POOL.length).fill(null);
    }
    if(!window._ancEmergeImg){window._ancEmergeImg=new Image();window._ancEmergeImg.src=_ANC_EMERGE_SHEET;}
    if(!window._ancPlantImg){window._ancPlantImg=new Image();window._ancPlantImg.src=_ANC_PLANT_SHEET;}
    if(!window._ancWalkImg){window._ancWalkImg=new Image();window._ancWalkImg.src=_ANC_WALK_SHEET;}
    if(!window._ancSwingImg){window._ancSwingImg=new Image();window._ancSwingImg.src=_ANC_SWING_SHEET;}
    for(let _ai=0;_ai<G._ancestors.length;_ai++){
      const a=G._ancestors[_ai];const _at=_now*.001+_ai*1.7;
      _drawAncestorSummonCircle(X,a);
      _drawAncestorRedAura(X,a,_at);
      if(a._stompRingT>0){
        const _sp=1-a._stompRingT/30,_sr=(24+176*_sp)*(a.big||1);
        X.save();X.globalAlpha=(1-_sp)*.8;X.strokeStyle='#d6b88b';X.lineWidth=(5-3*_sp)*(a.big||1);
        X.beginPath();X.ellipse(a.x,a.y+56*(a.big||1),_sr,_sr*.32,0,0,Math.PI*2);X.stroke();X.restore();
      }
      const _planting=a._swordT>0;
      const _aF=0; // authored walk/swing sheets supply their own motion; idle armor remains ground-anchored.
      const _fade=1; // 전대는 시간으로 페이드하지 않고 HP가 0일 때만 제거된다.
      if(a._spr===undefined)a._spr=0;
      const _si=a._spr%window._ancImgPool.length,_im=window._ancImgPool[_si];
      // 원본 검은 철갑·마모 금장·적색 망토 팔레트를 1회 캐시한다. 전역 청색 틴트는 입히지 않는다.
      if(!window._ancTCPool[_si]&&_im&&_im.complete&&_im.naturalWidth){
        const _cacheBox=_ancestorPortraitBox(_im.naturalWidth,_im.naturalHeight,1);
        const _c=document.createElement('canvas');_c.width=_cacheBox.cacheW;_c.height=_cacheBox.cacheH;
        const _atx=_c.getContext('2d');
        _atx.drawImage(_im,0,0,_c.width,_c.height);
        window._ancTCPool[_si]=_c;
      }
      const _tc=window._ancTCPool[_si];
      if(_tc){
        const _portrait=_ancestorPortraitBox(_im.naturalWidth,_im.naturalHeight,a.big||1);
        const _aH=_portrait.drawH,_aW=_portrait.drawW; // 키 240px 기반 세로 실루엣 — 구 180² 압축 제거
        // 대검을 박은 지점: 아래에서 본 타원 그림자 + 청기 문양 + 빨려드는 고리. 캐릭터보다 먼저 그려 깊이를 만든다.
        if(_planting){
          const _redCharge=a._recalling&&a._swordT<=60;
          if(_redCharge)_drawAncestorAbsorbAura(X,a,_at);
          const _sx=a._swordX,_sy=a._swordY,_sp=1-a._swordT/Math.max(1,a._swordMaxT),_sr=_ancestorSwordAbsorbRadius(a),_swordGlow=.35+.65*Math.sin(_at*8+_sp*8)**2;
          X.save();X.translate(_sx,_sy+30);
          X.globalAlpha=(.24+.16*_sp)*_fade;X.fillStyle='#02040b';X.beginPath();X.ellipse(0,0,_sr*.9,_sr*.27,0,0,Math.PI*2);X.fill();
          X.globalAlpha=(.26+.42*_swordGlow)*_fade;X.strokeStyle=_redCharge?'#ff4a28':'#78bdff';X.lineWidth=2.5+_swordGlow*1.5;X.beginPath();X.ellipse(0,0,_sr,_sr*.30,0,0,Math.PI*2);X.stroke();
          X.globalAlpha=.18*_fade;X.strokeStyle=_redCharge?'#ffd6b8':'#d3efff';X.lineWidth=1;for(let _ri=0;_ri<3;_ri++){const _rr=_sr*(.24+_ri*.22+(_at*.45%1)*.12);X.beginPath();X.ellipse(0,0,_rr,_rr*.3,0,0,Math.PI*2);X.stroke();}
          X.restore();
          if(_redCharge)for(let _pi=0;_pi<5;_pi++){const _pa=_at*2.4+_pi*Math.PI*2/5;const _pr=_sr*(.46+.16*Math.sin(_at*3+_pi));X.globalAlpha=(.32+.52*_swordGlow)*_fade;X.fillStyle='#ffc4a3';X.beginPath();X.arc(_sx+Math.cos(_pa)*_pr,_sy+14+Math.sin(_pa)*_pr*.3,2.2+_swordGlow,0,Math.PI*2);X.fill();}
        }
        if(a._swordBlastT>0){
          const _bp=1-a._swordBlastT/Math.max(1,a._swordBlastMaxT||72),_br=(a._swordBlastR||240)*(.20+.80*_bp);
          X.save();X.translate(a._swordX,a._swordY+28);X.globalAlpha=(1-_bp)*.75*_fade;X.strokeStyle='#d8f3ff';X.lineWidth=7*(1-_bp)+1;X.beginPath();X.ellipse(0,0,_br,_br*.32,0,0,Math.PI*2);X.stroke();X.globalAlpha=(1-_bp)*.25*_fade;X.fillStyle='#82bfff';X.beginPath();X.ellipse(0,0,_br,_br*.32,0,0,Math.PI*2);X.fill();X.restore();
        }
        // ── 절차적 공격 스윙 모션: 윈드업(뒤로)→강타(앞으로 회전)→복귀 + 돌진·펀치·슬래시 ──
        const _t=a._atkT||0, _adir=(a._atkDir!=null?a._atkDir:0), _fdir=(a.face<0?-1:1);
        let _sw=0;                                            // 스윙 회전각
        if(_t>0.72)_sw=-0.42*((_t-0.72)/0.28);                //  윈드업  0 → -0.42(뒤로 젖힘)
        else if(_t>0.30)_sw=-0.42+1.10*((0.72-_t)/0.42);      //  강타    -0.42 → +0.68(앞으로 후려침)
        else if(_t>0)_sw=0.68*(_t/0.30);                      //  복귀    +0.68 → 0
        const _strike=(_t>0.30&&_t<0.74)?1:0;                 // 강타 구간
        const _atkE=Math.sin(_t*Math.PI);                     // 돌진/펀치 세기(0→1→0)
        const _lx=Math.cos(_adir)*27*_atkE, _ly=Math.sin(_adir)*16*_atkE; // 앞으로 돌진
        const _punch=1; // Keep body size fixed even while a sheet is loading.
        const _breath=1; // scale pulsing moves the feet, so the grounded idle does not use it.
        const _drawTc=_tc;
        const _rot=(a._moving?Math.sin(_at*9)*0.05:0)+_sw*_fdir;
        const _emergeImg=window._ancEmergeImg;
        const _emerging=a._emergeT>0&&_emergeImg&&_emergeImg.complete&&_emergeImg.naturalWidth;
        // 새 6×1 시트는 정규화 단계에서 셀 가장자리에 29px 투명 여백을 강제했다. 각 동작은 프레임을 넘지 않는다.
        const _plantImg=window._ancPlantImg;
        const _plantingSprite=_planting&&_plantImg&&_plantImg.complete&&_plantImg.naturalWidth;
        const _swingImg=window._ancSwingImg;
        const _swingingSprite=false; // 기본 공격은 몸 스윙 대신 독립적인 검기만 발사한다.
        const _walkImg=window._ancWalkImg;
        const _stompingSprite=!_plantingSprite&&a._stompT>0&&_walkImg&&_walkImg.complete&&_walkImg.naturalWidth;
        const _walkingSprite=!_plantingSprite&&!_swingingSprite&&!_stompingSprite&&a._moving&&_walkImg&&_walkImg.complete&&_walkImg.naturalWidth;
        if(_emerging){
          const _emergeP=1-a._emergeT/Math.max(1,a._emergeMaxT||96);
          const _emergeFrame=Math.min(5,Math.floor(_emergeP*6));
          const _emergeFW=_emergeImg.naturalWidth/6,_emergeFH=_emergeImg.naturalHeight;
          const _eb=_ancestorDrawBox('emerge',_emergeFW,_emergeFH,a.big);
          const _emergeDW=_eb.w,_emergeDH=_eb.h;
          X.save();X.globalAlpha=(.55+.45*_emergeP)*_fade;
          X.drawImage(_emergeImg,_emergeFrame*_emergeFW,0,_emergeFW,_emergeFH,a.x-_emergeDW*.5,a.y+_eb.centerY-_emergeDH*.5,_emergeDW,_emergeDH);
          X.restore();
        }else if(_plantingSprite){
          // 첫 72f(1.2초)는 대검을 꽂는 0→5 프레임, 나머지 흡수 시간은 마지막 고정 자세를 유지한다.
          const _plantP=Math.min(1,Math.max(0,((a._swordMaxT||300)-(a._swordT||0))/72));
          const _plantFrame=Math.min(5,Math.floor(_plantP*6));
          const _plantFW=_plantImg.naturalWidth/6,_plantFH=_plantImg.naturalHeight;
          const _pb=_ancestorDrawBox('plant',_plantFW,_plantFH,a.big);
          const _plantDH=_pb.h,_plantDW=_pb.w;
          X.save();X.translate(a.x,a.y+_pb.centerY);
          if(a.face<0)X.scale(-1,1);
          X.globalAlpha=.96*_fade;
          X.drawImage(_plantImg,_plantFrame*_plantFW,0,_plantFW,_plantFH,-_plantDW*.5,-_plantDH*.5,_plantDW,_plantDH);
          if(a._recalling){
            // 검은 갑옷도 확실히 점화: 원본 알파로 마스킹한 적색 시트를 1회 캐시.
            if(!_plantImg._ignitionRed){
              const _redSheet=document.createElement('canvas');
              _redSheet.width=_plantImg.naturalWidth;_redSheet.height=_plantImg.naturalHeight;
              const _redCtx=_redSheet.getContext('2d');
              _redCtx.drawImage(_plantImg,0,0);
              _redCtx.globalCompositeOperation='source-in';_redCtx.fillStyle='#ff1808';
              _redCtx.fillRect(0,0,_redSheet.width,_redSheet.height);
              _plantImg._ignitionRed=_redSheet;
            }
            const heat=Math.max(0,Math.min(1,1-a._swordT/60));
            X.globalAlpha=(.25+.65*heat)*_fade;
            X.shadowColor='#ff2008';X.shadowBlur=8+24*heat;
            X.drawImage(_plantImg._ignitionRed,_plantFrame*_plantFW,0,_plantFW,_plantFH,-_plantDW*.5,-_plantDH*.5,_plantDW,_plantDH);
          }
          X.restore();
        }else if(_swingingSprite){
          const _swingFrame=_ancestorSwingFrame(a._atkT);
          const _swingFW=_swingImg.naturalWidth/8,_swingFH=_swingImg.naturalHeight;
          const _sb=_ancestorDrawBox('swing',_swingFW,_swingFH,a.big);
          const _swingDH=_sb.h,_swingDW=_sb.w;
          X.save();X.translate(a.x,a.y+_sb.centerY);
          if(a.face<0)X.scale(-1,1);
          X.globalAlpha=.98*_fade;
          X.drawImage(_swingImg,_swingFrame*_swingFW,0,_swingFW,_swingFH,-_swingDW*.5,-_swingDH*.5,_swingDW,_swingDH);
          X.restore();
        }else if(_stompingSprite){
          const _stompFrame=a._stompT>12?1:2;
          const _walkFW=_walkImg.naturalWidth/6,_walkFH=_walkImg.naturalHeight;
          const _wb=_ancestorDrawBox('walk',_walkFW,_walkFH,a.big);
          X.save();X.translate(a.x,a.y+_wb.centerY+(a._stompT>12?-8*(a.big||1):0));
          if(a.face<0)X.scale(-1,1);
          X.globalAlpha=.96*_fade;
          X.drawImage(_walkImg,_stompFrame*_walkFW,0,_walkFW,_walkFH,-_wb.w*.5,-_wb.h*.5,_wb.w,_wb.h);
          X.restore();
        }else if(_walkingSprite){
          const _walkFrame=Math.floor((a._walkT||0)/8)%6;
          const _walkFW=_walkImg.naturalWidth/6,_walkFH=_walkImg.naturalHeight;
          const _wb=_ancestorDrawBox('walk',_walkFW,_walkFH,a.big);
          const _walkDH=_wb.h,_walkDW=_wb.w;
          X.save();X.translate(a.x,a.y+_wb.centerY);
          if(a.face<0)X.scale(-1,1);
          X.globalAlpha=.96*_fade;
          X.drawImage(_walkImg,_walkFrame*_walkFW,0,_walkFW,_walkFH,-_walkDW*.5,-_walkDH*.5,_walkDW,_walkDH);
          X.restore();
        }else{
          const _ib=_ancestorDrawBox('idle',_im.naturalWidth,_im.naturalHeight,a.big);
          X.save();
          X.translate(a.x,a.y+_ib.centerY);
          X.rotate(_rot);
          if(a.face<0)X.scale(-1,1);
          X.scale(_punch,_punch*_breath);
          X.globalAlpha=.92*_fade;
          X.drawImage(_drawTc,-_ib.w/2,-_ib.h/2,_ib.w,_ib.h);
          X.restore();
        }
        // 내려찍기·팔로스루 프레임에만 짧게 뻗는 은백색 검기.
        _drawAncestorKiWaves(X,a,_fade);
      }else{
        // 이미지 미로드 폴백: 고스트 실루엣
        X.globalAlpha=.5*_fade;X.fillStyle='#88aaff';
        X.beginPath();X.arc(a.x,a.y+_aF,18,0,Math.PI*2);X.fill();
      }
      // 발밑 발광 + HP 게이지 (시간 제한 없음)
      const _hpR=Math.max(0,Math.min(1,(a.hp||0)/Math.max(1,a.mhp||1)));
      X.globalAlpha=.18*_fade;X.fillStyle='#6688ff';
      X.beginPath();X.arc(a.x,a.y+_aF+34,13,0,Math.PI*2);X.fill();
      X.globalAlpha=.6*_fade;X.fillStyle='rgba(10,15,40,.6)';X.fillRect(a.x-14,a.y+_aF+44,28,3);
      X.fillStyle=_hpR>.3?'#d5c27a':'#e85f4f';X.fillRect(a.x-14,a.y+_aF+44,28*_hpR,3);
      X.globalAlpha=1;
    }
  }
  // ══ 공성쇠뇌 터렛 — 렌더 ══
  if(_gxTurret){
    const _gxt=_now*.001;
    const _gxX=_gxTurret.x,_gxY=_gxTurret.y,_gxA=_gxTurret.ang;
    // 1) 바닥 감지 범위 (은은한 원)
    X.globalAlpha=.04+.02*Math.sin(_gxt*3);
    X.strokeStyle='#88aadd';X.lineWidth=1;X.setLineDash(_D4_8);
    X.beginPath();X.arc(_gxX,_gxY,XBOW_RANGE,0,Math.PI*2);X.stroke();X.setLineDash(_D0);
    // 2) 유령 석궁 본체 — 회전하는 석궁 모양 (×2 스케일)
    X.save();X.translate(_gxX,_gxY);X.rotate(_gxA);X.scale(2,2);
    // 석궁 몸통
    X.globalAlpha=.55+.15*Math.sin(_gxt*5);
    X.strokeStyle='#aaccff';X.lineWidth=3;
    X.beginPath();X.moveTo(-8,0);X.lineTo(12,0);X.stroke(); // 화살대
    X.beginPath();X.moveTo(-6,-10);X.quadraticCurveTo(2,-4,2,0);X.stroke(); // 위 활
    X.beginPath();X.moveTo(-6,10);X.quadraticCurveTo(2,4,2,0);X.stroke();  // 아래 활
    // 화살촉
    X.fillStyle='#ddeeff';X.beginPath();X.moveTo(14,0);X.lineTo(10,-2);X.lineTo(10,2);X.closePath();X.fill();
    X.restore();
    // 3) 유령 글로우
    X.globalAlpha=.08+.04*Math.sin(_gxt*4);
    X.drawImage(_rgStampC('gxGlow',60,null,_RG_GX),_gxX-60,_gxY-60,120,120);
    // 4) 떠다니는 파티클
    for(let _gi=0;_gi<3;_gi++){
      const _ga=_gxt*2+_gi*Math.PI*2/3;
      const _gr=28+Math.sin(_gxt*3+_gi)*8;
      X.globalAlpha=.25+.15*Math.sin(_gxt*6+_gi);
      X.fillStyle='#aaccff';
      X.beginPath();X.arc(_gxX+Math.cos(_ga)*_gr,_gxY+Math.sin(_ga)*_gr,3,0,Math.PI*2);X.fill();
    }
    X.globalAlpha=1;
  }
  // ══ 방패던지기 / 파워웨이브 — 렌더 ══
  if(G._stProjs&&G._stProjs.length>0){X.save();
    for(const st of G._stProjs){
      const _stR=st.r;const _stA=st.ang;
      if(st.wave){
        // ═══ 파워웨이브 렌더 — 파티클만 (검기 삭제) ═══
        X.save();X.translate(st.x,st.y);X.rotate(_stA);
        X.restore();
      }else{
        // ═══ 일반 방패던지기 렌더 ═══
        // ── 회전 잔상 트레일 (부채형) ──
        if(OPT.trail){
          for(let _ti=1;_ti<=2;_ti++){
            const _ta=_stA-_ti*0.8;
            const _tx=st.x-st.vx*_ti*1.2,_ty=st.y-st.vy*_ti*1.2;
            X.save();X.translate(_tx,_ty);X.rotate(_ta);
            X.globalAlpha=.12/_ti;
            X.fillStyle='#88ccff';
            X.beginPath();X.moveTo(0,0);X.arc(0,0,_stR*(1-_ti*.1),-Math.PI*.55,Math.PI*.55);X.closePath();X.fill();
            X.restore();
          }
        }
        // ── 방패 본체 (부채/카이트형) ──
        X.save();X.translate(st.x,st.y);X.rotate(_stA);
        X.globalAlpha=.25;
        X.fillStyle='#66aadd';X.beginPath();X.moveTo(0,0);X.arc(0,0,_stR+5,-Math.PI*.6,Math.PI*.6);X.closePath();X.fill();
        X.globalAlpha=.95;
        X.fillStyle='#8899aa';
        X.beginPath();X.moveTo(0,0);X.arc(0,0,_stR,-Math.PI*.55,Math.PI*.55);X.closePath();X.fill();
        X.strokeStyle='#ccddee';X.lineWidth=2;
        X.beginPath();X.moveTo(0,0);X.arc(0,0,_stR,-Math.PI*.55,Math.PI*.55);X.closePath();X.stroke();
        X.fillStyle='#ddeeff';
        for(let _ri=0;_ri<5;_ri++){
          const _ra=-Math.PI*.45+_ri*(Math.PI*.9/4);
          X.beginPath();X.arc(Math.cos(_ra)*_stR*.75,Math.sin(_ra)*_stR*.75,2.5,0,Math.PI*2);X.fill();
        }
        X.fillStyle='#aaddff';X.beginPath();X.arc(_stR*.35,0,_stR*.15,0,Math.PI*2);X.fill();
        X.strokeStyle='#88aacc';X.lineWidth=1.5;X.stroke();
        X.restore();
        // ── 스파크 파티클 ──
        if(OPT.parts>=40&&Math.random()>.5){
          const _sa=_stA+Math.PI*.55*(Math.random()>.5?1:-1);
          poolPart(st.x+Math.cos(_sa)*_stR,st.y+Math.sin(_sa)*_stR,(Math.random()-.5)*3,(Math.random()-.5)*3,'#aaddff',1.5+Math.random()*2,8+Math.random()*6);
        }
      }
    }
    X.globalAlpha=1;X.restore();
  }
  // ══ 지옥강타 1 진동파 링 — 렌더 ══
  if(G._gSlamWave&&G._gSlamWave.length>0){
    for(let _wi=0;_wi<G._gSlamWave.length;_wi++){
      const w=G._gSlamWave[_wi];
      const _wP=w.t/w.maxT;
      const fade=Math.max(0,1-_wP);
      const _t2=_now;
      const _isGSlam=!w.col; // col 없으면 지옥강타 1, 있으면 불꽃칼날/기타
      if(w.kind==='chainSlam'){_drawChainSlamCleave(w);continue}
      const _isSlamHero=_isGSlam;
      // 지옥강타 1(Shift+좌클릭): 지진 링과 구분되는 대지 압착 중심부.
      // 먼저 지면 데칼을 깔아 영웅급 스프라이트 아래에서 묵직하게 눌리는 느낌을 만든다.
      if(_isGSlam&&w.kind==='giant'){
        const _earthImpactP=Math.min(1,_wP*5);
        const _earthCraterR=w.maxR*(.12+.24*_earthImpactP);
        X.save();
        X.globalCompositeOperation='source-over';
        X.globalAlpha=(.52-.22*_wP)*fade;
        X.fillStyle='#160f0a';
        X.beginPath();X.ellipse(w.x,w.y,_earthCraterR,_earthCraterR*.34,0,0,Math.PI*2);X.fill();
        X.globalAlpha=(.5-.18*_wP)*fade;
        X.strokeStyle='#7d5632';
        X.lineWidth=4+8*(1-_earthImpactP);
        X.beginPath();X.ellipse(w.x,w.y,_earthCraterR*1.08,_earthCraterR*.37,0,0,Math.PI*2);X.stroke();
        X.restore();
      }
      // 1) API 영웅급 임팩트 시트 (지옥강타 1/지옥강타 2 + 기동강타)
      if(_isSlamHero){
        const _slamVfx=(w.vfxKind==='inferno'||w.kind==='inferno')?_infernoSlamVfx:_giantSlamVfx;
        const _slamFrame=Math.min(3,~~(Math.pow(_wP,.6)*4)); // VFX-10: 용암 몸체 정점 당김
        const _slamSx=(_slamFrame%2)*512,_slamSy=~~(_slamFrame/2)*512;
        const _slamGrow=.72+.28*Math.min(1,_wP*3.5);
        const _slamSize=w.maxR*(w.kind==='inferno'?.98:.9)*_slamGrow;
        const _slamAlpha=_wP<.62?1:Math.max(0,(1-_wP)/.38);
        if(_slamVfx.ready){
          X.save();X.globalAlpha=_slamAlpha;
          if(w.vfxKind==='inferno'||w.kind==='inferno')X.globalCompositeOperation='screen';
          X.drawImage(_slamVfx.img,_slamSx,_slamSy,512,512,w.x-_slamSize/2,w.y-_slamSize/2,_slamSize,_slamSize);
          X.restore();
        }else{
          const _crR=w.maxR*.4;
          if(_craterReady){
            X.globalAlpha=Math.min(1,fade*1.5);
            const _img=_craterFrames[_slamFrame];
            X.drawImage(_img,w.x-_crR,w.y-_crR,_crR*2,_crR*2);
          }else{
            X.globalAlpha=fade;
            X.drawImage(_rgStampC('crater',_crR,null,_RG_CRATER),w.x-_crR,w.y-_crR,_crR*2,_crR*2);
          }
          X.globalAlpha=1;
        }
      }
      // 2) 중앙 폭발 플래시 (지옥강타 1 전용)
      if(_isGSlam){
      // VFX-10: 화면 덮던 베이지 원판(반지름 maxR*.4) → 국소 백열 코어(SSOT §2.7 원칙 2·5)
      const _flashP=Math.max(0,1-_wP*4);
      if(_flashP>0){const _fR=Math.min(w.maxR*.4,42)*(.55+.45*_flashP);
        X.globalAlpha=.9*_flashP*_flashP*fade;X.fillStyle='#fff4d0';
        X.beginPath();X.arc(w.x,w.y,_fR,0,Math.PI*2);X.fill();}
      }
      // 지옥강타 1만의 방사 균열: 기존 원형 지진파 위에 실제 지면이 갈라지는 실루엣을 더한다.
      if(_isGSlam&&w.kind==='giant'){
        const _earthCrackR=w.maxR*(.16+.34*Math.min(1,_wP*5));
        X.save();
        X.globalCompositeOperation='lighter';
        X.lineCap='round';
        X.globalAlpha=(.86-.4*_wP)*fade;
        X.strokeStyle='#f6d08a';
        X.lineWidth=3.5*(1-_wP)+1.5;
        for(let _crack=0;_crack<12;_crack++){
          const _crackA=Math.PI*2*_crack/12+Math.sin(_crack*17.31)*.15;
          const _inner=_earthCrackR*(.2+(_crack%3)*.025);
          const _outer=_earthCrackR*(.72+(_crack%4)*.075);
          const _bend=_crackA+Math.sin(_crack*5.7)*.16;
          X.beginPath();
          X.moveTo(w.x+Math.cos(_crackA)*_inner,w.y+Math.sin(_crackA)*_inner*.55);
          X.lineTo(w.x+Math.cos(_bend)*(_outer*.58),w.y+Math.sin(_bend)*(_outer*.58)*.55);
          X.lineTo(w.x+Math.cos(_crackA)*_outer,w.y+Math.sin(_crackA)*_outer*.55);
          X.stroke();
        }
        X.restore();
      }
      // 3) 이중 충격파: 밝은 압축파 + 후행 재질파
      const _ringCol=w.col||(w.kind==='inferno'?'#ff4a12':'#e8c08a');
      const _ringHi=w.col||(w.kind==='inferno'?'#ffd06a':'#fff0c8');
      const _ringW=12*(1-_wP*.55)+5;
      X.globalAlpha=Math.min(1,1.1*fade);X.strokeStyle=_ringCol;X.lineWidth=_ringW;
      X.beginPath();X.arc(w.x,w.y,w.r,0,Math.PI*2);X.stroke();
      X.globalAlpha=.7*fade;X.strokeStyle=_ringHi;X.lineWidth=Math.max(2,_ringW*.28);
      X.beginPath();X.arc(w.x,w.y,w.r*1.075,0,Math.PI*2);X.stroke();
      if(_isGSlam){
        X.globalAlpha=.48*fade;X.strokeStyle=_ringCol;X.lineWidth=3+4*fade;X.setLineDash([18,12]);
        X.beginPath();X.arc(w.x,w.y,w.r*.72,0,Math.PI*2);X.stroke();X.setLineDash([]);
      }
    }
    X.globalAlpha=1;
  }
  // ══ 기동칼날개 — 스프라이트 날개 렌더 ══
  if(G._chainBlades&&G._chainBlades.length>0){
    for(let _bi=0;_bi<G._chainBlades.length;_bi++){
      const b=G._chainBlades[_bi];
      const _bP=b.t/b.maxT;
      const fade=Math.max(0,1-_bP);
      X.save();
      X.translate(b.x,b.y);
      X.rotate(b.ang); // Sprite reference dash direction is right; rotation is baked into its 8 frames.
      X.globalAlpha=fade;
      if(_chainBladeReady){
        const _bw=b.r*2.6,_bh=_bw; // Core at 65% X; the spiral wake trails behind the player.
        const _bf=Math.floor(((b.phase||0)+b.t)/1.5)%8; // 12 game frames per revolution.
        const _cw=_CHAIN_BLADE_IMG.naturalWidth/4,_ch=_CHAIN_BLADE_IMG.naturalHeight/2;
        X.drawImage(_CHAIN_BLADE_IMG,(_bf%4)*_cw+1,Math.floor(_bf/4)*_ch+1,_cw-2,_ch-2,-_bw*.65,-_bh*.5,_bw,_bh);
      }else{
        // 폴백: 날카로운 은빛 프로시저럴 칼날
        const len=b.r;
        X.globalAlpha=.42*fade;X.fillStyle='#a9bfd0';
        X.beginPath();X.moveTo(-len,0);X.lineTo(-len*.24,-18);X.lineTo(0,-7);X.lineTo(len*.24,-18);X.lineTo(len,0);X.lineTo(len*.3,7);X.lineTo(0,2);X.lineTo(-len*.3,7);X.closePath();X.fill();
        X.globalAlpha=.9*fade;X.strokeStyle='#f8fbff';X.lineWidth=2;
        X.beginPath();X.moveTo(-len,0);X.lineTo(0,-7);X.lineTo(len,0);X.stroke();
      }
      X.restore();
    }
    X.globalAlpha=1;
  }
  // ══ 유탄 — 렌더 (레거시) ══
  if(G._gsBombs&&G._gsBombs.length>0){const _gbt=_now*.08;X.save();
    for(const gb of G._gsBombs){if(gb.phase!=='fly')continue;
    const gbSz=7;
    X.globalAlpha=.85;X.fillStyle='#442200';X.beginPath();X.arc(gb.x,gb.y,gbSz,0,Math.PI*2);X.fill();
    X.fillStyle='#884400';X.beginPath();X.arc(gb.x-1,gb.y-1,gbSz*.65,0,Math.PI*2);X.fill();
    const gfAng=Math.atan2(-gb.vy,-gb.vx)+Math.sin(_gbt*5)*.4;
    const gfx=gb.x+Math.cos(gfAng)*(gbSz+2),gfy=gb.y+Math.sin(gfAng)*(gbSz+2);
    X.globalAlpha=.9;X.fillStyle='#ffaa44';X.beginPath();X.arc(gfx,gfy,2+Math.random(),0,Math.PI*2);X.fill();
    }
    X.restore();
  }
  // ══ [LAVA-ERUPT] 지진폭풍 용암분출 렌더 ══
  if(_lavaBoomSpr.ready&&_lavaBoomSpr.w>0){for(let _lei=0;_lei<_LAVA_ERUPT_MAX;_lei++){const le=_lavaErupts[_lei];if(!le.active)continue;
    const _lep=le.t/le.mt;const _lfi=Math.min(8,~~(_lep*9));
    const _lfCol=_lfi%3,_lfRow=~~(_lfi/3); // 3x3 그리드
    const _lSz=le.r*1.8*Math.pow(Math.min(1,_lep*2.5),.4);
    X.save();X.globalAlpha=le.rage?(_lep<.7?1:Math.max(0,(1-_lep)/.3)):Math.max(0,1-Math.pow(_lep,1.5)*.9);
    X.drawImage(_lavaBoomSpr.img,_lfCol*_lavaBoomSpr.w,_lfRow*_lavaBoomSpr.h,_lavaBoomSpr.w,_lavaBoomSpr.h,le.x-_lSz/2,le.y-_lSz/2,_lSz,_lSz);
    X.restore();
  }}
  // ══ [TP-SMOKE] 순간이동 연기 스프라이트 렌더 ══
  for(let _si=0;_si<_TP_SMOKE_MAX;_si++){const sm=_tpSmokes[_si];if(!sm.active)continue;
    sm.t+=sp;if(sm.t>=sm.mt){sm.active=false;continue}
    const _sp=sm.t/sm.mt;
    const _sImg=sm.type===0?_tpSmokeOut:_tpSmokeIn;
    if(!_sImg.complete||!_sImg.naturalWidth)continue;
    X.save();X.globalCompositeOperation='lighter';
    if(sm.type===0){
      // 출발: 커지면서 투명해짐 + 회전
      const _sc=1+_sp*1.8;const _sSz=sm.sz*_sc;
      X.globalAlpha=Math.max(0,(1-_sp*_sp)*.85);
      X.translate(sm.x,sm.y);X.rotate(sm.rot+_sp*1.5);
      X.drawImage(_sImg,-_sSz/2,-_sSz/2,_sSz,_sSz);
    }else{
      // 도착: 크게 시작→축소되며 선명해졌다가 사라짐
      const _sc=2.2-_sp*1.6;const _sSz=sm.sz*Math.max(.6,_sc);
      const _al=_sp<.4?(_sp/.4):Math.max(0,1-(_sp-.4)/.6);
      X.globalAlpha=_al*.9;
      X.translate(sm.x,sm.y);X.rotate(sm.rot-_sp*1.2);
      X.drawImage(_sImg,-_sSz/2,-_sSz/2,_sSz,_sSz);
    }
    X.restore();
  }
  // ══ [TP-IMPACT] 텔포 도착 불꽃 스프라이트 렌더 ══
  if(_tpImpSpr.ready&&_tpImpSpr.w>0){for(let _ti=0;_ti<_TP_IMP_MAX;_ti++){const ti=_tpImps[_ti];if(!ti.active)continue;
    ti.t+=sp;if(ti.t>=ti.mt){ti.active=false;continue}
    const _tp=ti.t/ti.mt,_tfi=Math.min(3,~~(_tp*4));
    const _tfCol=_tfi%2,_tfRow=~~(_tfi/2);
    const _tSz=ti.sz*(0.6+_tp*0.6); // 커지면서 사라짐
    X.save();X.globalCompositeOperation='lighter';
    X.globalAlpha=Math.max(0,1-_tp*_tp);
    X.drawImage(_tpImpSpr.img,_tfCol*_tpImpSpr.w,_tfRow*_tpImpSpr.h,_tpImpSpr.w,_tpImpSpr.h,ti.x-_tSz/2,ti.y-_tSz/2,_tSz,_tSz);
    // 중심 글로우
    if(_tp<.5){X.globalAlpha=.5*(1-_tp*2);X.fillStyle=ti.col;X.beginPath();X.arc(ti.x,ti.y,_tSz*.2,0,Math.PI*2);X.fill()}
    X.restore();
  }}
  // ══ [TP-BOLT] 텔포 이동 번개 경로 렌더 ══
  for(let _bi=0;_bi<_TP_BOLT_MAX;_bi++){const bl=_tpBolts[_bi];if(!bl.active)continue;
    bl.t+=sp;if(bl.t>=bl.mt){bl.active=false;continue}
    const _bp2=bl.t/bl.mt,_ba=1-_bp2*_bp2;
    X.save();X.globalCompositeOperation='lighter';
    // 외곽 글로우
    X.globalAlpha=_ba*.35;X.strokeStyle=bl.col;X.lineWidth=8+Math.sin(_now*.5)*2;X.lineCap='round';
    X.beginPath();X.moveTo(bl.segs[0].x,bl.segs[0].y);
    for(let s=1;s<bl.segs.length;s++)X.lineTo(bl.segs[s].x,bl.segs[s].y);X.stroke();
    // 코어 (밝은 흰색)
    X.globalAlpha=_ba*.8;X.strokeStyle='#ffffff';X.lineWidth=2+_ba*2;
    X.beginPath();X.moveTo(bl.segs[0].x,bl.segs[0].y);
    for(let s=1;s<bl.segs.length;s++)X.lineTo(bl.segs[s].x,bl.segs[s].y);X.stroke();
    // 분기 번개 (세그먼트마다 확률적)
    X.globalAlpha=_ba*.4;X.strokeStyle=bl.col;X.lineWidth=1.5;
    for(let s=1;s<bl.segs.length-1;s++){if(Math.random()>.5)continue;
      const sg=bl.segs[s],ba2=Math.atan2(bl.dy-bl.oy,bl.dx-bl.ox)+((Math.random()>.5?1:-1)*(.5+Math.random()*.8));
      const bl2=15+Math.random()*20;X.beginPath();X.moveTo(sg.x,sg.y);X.lineTo(sg.x+Math.cos(ba2)*bl2,sg.y+Math.sin(ba2)*bl2);X.stroke()}
    X.restore();
  }
  // ══ [TP-STAR] 순간이동 출발 별 버스트 렌더 (시안 4점 별) ══
  for(let _si2=0;_si2<_TP_STAR_MAX;_si2++){const ts=_tpStars[_si2];if(!ts.active)continue;
    ts.t+=sp;if(ts.t>=ts.mt){ts.active=false;continue}
    const p=ts.t/ts.mt,al=1-p*p;
    X.save();X.globalCompositeOperation='lighter';X.translate(ts.x,ts.y);
    // 중심 글로우
    const gR=ts.sz*.4*(1-p*.5);
    X.globalAlpha=al*.6;X.fillStyle='#ffffff';X.beginPath();X.arc(0,0,gR*.3,0,Math.PI*2);X.fill();
    X.globalAlpha=al*.3;X.fillStyle='#44ddff';X.beginPath();X.arc(0,0,gR,0,Math.PI*2);X.fill();
    // 4점 별 팔 (뾰족한 다이아몬드)
    const rot=ts.ang+p*.8; // 살짝 회전
    for(let ai=0;ai<ts.arms.length;ai++){
      const arm=ts.arms[ai],aa=arm.a+rot;
      const armLen=ts.sz*arm.len*(p<.3?p/.3:1); // 빠르게 뻗음
      const armW=ts.sz*arm.w*(1-p*.7); // 점점 가늘어짐
      const tipX=Math.cos(aa)*armLen,tipY=Math.sin(aa)*armLen;
      const perpX=Math.cos(aa+Math.PI/2)*armW,perpY=Math.sin(aa+Math.PI/2)*armW;
      // 외곽 글로우
      X.globalAlpha=al*.4;X.fillStyle='#0088cc';
      X.beginPath();X.moveTo(0,0);X.lineTo(perpX*1.5,perpY*1.5);X.lineTo(tipX,tipY);X.lineTo(-perpX*1.5,-perpY*1.5);X.closePath();X.fill();
      // 코어 (밝은 시안→백)
      X.globalAlpha=al*.9;X.fillStyle=p<.4?'#ffffff':'#66eeff';
      X.beginPath();X.moveTo(0,0);X.lineTo(perpX*.5,perpY*.5);X.lineTo(tipX,tipY);X.lineTo(-perpX*.5,-perpY*.5);X.closePath();X.fill();
    }
    // 슬래시 트레일 (대각선 하나, 레퍼런스처럼)
    if(p<.6){
      const slA=ts.ang-.4,slLen=ts.sz*1.5*Math.min(1,p/.2);
      X.globalAlpha=al*.5;X.strokeStyle='#44ddff';X.lineWidth=3;X.lineCap='round';
      X.beginPath();X.moveTo(Math.cos(slA+Math.PI)*slLen*.3,Math.sin(slA+Math.PI)*slLen*.3);
      X.lineTo(Math.cos(slA)*slLen,Math.sin(slA)*slLen);X.stroke();
      X.globalAlpha=al*.8;X.strokeStyle='#ffffff';X.lineWidth=1.2;X.stroke();
    }
    X.restore();
  }
  // ══ [TP-VLAND] 순간이동 도착 V자 번개 충격 렌더 (금색) ══
  for(let _vi=0;_vi<_TP_VLAND_MAX;_vi++){const vl=_tpVlands[_vi];if(!vl.active)continue;
    vl.t+=sp;if(vl.t>=vl.mt){vl.active=false;continue}
    const p=vl.t/vl.mt,al=1-p*p;
    X.save();X.globalCompositeOperation='lighter';
    // V자 번개 2줄기
    const boltAlpha=p<.15?p/.15:al; // 빠르게 나타남
    for(const segs of vl.bolts){
      // 외곽 글로우 (금색)
      X.globalAlpha=boltAlpha*.4;X.strokeStyle='#ff8800';X.lineWidth=10+Math.sin(_now*.8)*3;X.lineCap='round';
      X.beginPath();X.moveTo(segs[0].x,segs[0].y);for(let s=1;s<segs.length;s++)X.lineTo(segs[s].x,segs[s].y);X.stroke();
      // 코어 (밝은 금→백)
      X.globalAlpha=boltAlpha*.9;X.strokeStyle='#ffdd44';X.lineWidth=3;
      X.beginPath();X.moveTo(segs[0].x,segs[0].y);for(let s=1;s<segs.length;s++)X.lineTo(segs[s].x,segs[s].y);X.stroke();
      X.globalAlpha=boltAlpha*.7;X.strokeStyle='#ffffff';X.lineWidth=1.2;
      X.beginPath();X.moveTo(segs[0].x,segs[0].y);for(let s=1;s<segs.length;s++)X.lineTo(segs[s].x,segs[s].y);X.stroke();
      // 분기 번개
      X.globalAlpha=boltAlpha*.3;X.strokeStyle='#ffaa00';X.lineWidth=1.5;
      for(let s=1;s<segs.length-1;s++){if(Math.random()>.4)continue;
        const sg=segs[s],ba3=Math.atan2(vl.y-segs[0].y,vl.x-segs[0].x)+((Math.random()>.5?1:-1)*(.4+Math.random()*.7));
        const bL=10+Math.random()*18;X.beginPath();X.moveTo(sg.x,sg.y);X.lineTo(sg.x+Math.cos(ba3)*bL,sg.y+Math.sin(ba3)*bL);X.stroke()}
    }
    // 착지점 중심 폭발 플래시
    const flashP=Math.max(0,1-p*3); // 처음 1/3에서만 강하게
    if(flashP>0){
      X.globalAlpha=flashP*.8;X.fillStyle='#ffffff';X.beginPath();X.arc(vl.x,vl.y,vl.sz*.25*flashP,0,Math.PI*2);X.fill();
      X.globalAlpha=flashP*.5;X.fillStyle='#ffcc00';X.beginPath();X.arc(vl.x,vl.y,vl.sz*.5,0,Math.PI*2);X.fill();
    }
    // 충격파 링 (확산)
    vl.ringR+=(vl.sz*1.5-vl.ringR)*.12*sp;
    if(al>.05){
      X.globalAlpha=al*.5;X.strokeStyle='#ffaa22';X.lineWidth=3*(1-p);
      X.beginPath();X.arc(vl.x,vl.y,vl.ringR,0,Math.PI*2);X.stroke();
      // 두 번째 링 (느리게)
      const r2=vl.ringR*.6;
      X.globalAlpha=al*.3;X.lineWidth=2*(1-p);
      X.beginPath();X.arc(vl.x,vl.y,r2,0,Math.PI*2);X.stroke();
    }
    // 바닥 균열선 (방사형)
    if(p<.7){
      X.globalAlpha=(1-p/.7)*.4;X.strokeStyle='#ffdd44';X.lineWidth=1.5;
      for(let ci=0;ci<6;ci++){const ca=Math.PI*2*ci/6+.3;const cLen=vl.sz*(.3+p*.8);
        X.beginPath();X.moveTo(vl.x,vl.y);X.lineTo(vl.x+Math.cos(ca)*cLen,vl.y+Math.sin(ca)*cLen);X.stroke()}
    }
    X.restore();
  }
  // ══ 폭산탄 — 렌더 (fly만) ══
  if(G._bsBombs&&G._bsBombs.length>0){X.save();
    for(const bb of G._bsBombs){if(bb.phase!=='fly')continue;
      X.globalAlpha=.85;X.fillStyle='#552200';X.beginPath();X.arc(bb.x,bb.y,7,0,Math.PI*2);X.fill();
      X.fillStyle='#ff4400';X.beginPath();X.arc(bb.x,bb.y,4.5,0,Math.PI*2);X.fill();
      const _ffa=Math.atan2(-bb.vy,-bb.vx)+Math.sin(_now*.4)*.4;
      X.globalAlpha=.9;X.fillStyle='#ff8833';X.beginPath();X.arc(bb.x+Math.cos(_ffa)*8,bb.y+Math.sin(_ffa)*8,2+Math.random(),0,Math.PI*2);X.fill();
    }X.restore();
  }
  // ══ [BOOM-VFX] 공통 폭발 이펙트 렌더 ══
  for(let _bvi=0;_bvi<_BOOM_MAX;_bvi++){const _bv=_booms[_bvi];if(!_bv.active)continue;
    if(_bv.x<_vl-_bv.r||_bv.x>_vr+_bv.r||_bv.y<_vt-_bv.r||_bv.y>_vb+_bv.r)continue;
    const _ep=_bv.t/_bv.mt;const bx=_bv.x,by=_bv.y;
    const _er=_bv.r*Math.pow(_ep,.35);
    const _isIce=_bv.col==='ice',_isLtn=_bv.col==='lightning',_isDark=_bv.col==='dark',_isRb=_bv.col==='rainbow',_isBlk=_bv.col==='black';
    const _bvPrevAlpha=X.globalAlpha;
    if(window._FDGDruidParryContact?.draw(X,{kind:_bv.col,x:bx,y:by,ageFrames:_bv.t,active:!!(window._FDGDruidQaStorage?.active&&_FDG_DRUID_THORN_FIRST)})){
      X.globalAlpha=_bvPrevAlpha;continue;
    }
    // ═══ 모든 boom: 스프라이트시트 기반 (링 제거) ═══
    // 속성별 시트 매핑
    const _boomSheetMap={
      black:['Dark_DarkSmoke_FBF_4x4.png'],
      plague:null, // 전용 스프라이트
      redbean:['Fire_FBF_4x4.png'],
      fire:['Fire_FBF_4x4.png'],
      bossFireImpact:['Fire_FBF_4x4.png'],
      ice:['Ice_ImpactIce_Sheet.png','Ice_MistSmoke_FBF_4x4.png'],
      waterImpact:['Water_ImpactWater_Sheet.png'],
      bossWaterImpact:['Water_ImpactWater_Sheet.png'],
      physical:['Fire_ImpactFire_Sheet.png'],
      holy:['Light_ImpactLight_Sheet.png'],
      earth:['Earth_ImpactEarth_Sheet.png'],
      lightning:['Lightning_ImpactLightning_Sheet.png','Lightning_Lightning_FBF_4x3.png'],
      dark:['Dark_MediumImpact.png','Dark_DarkSmoke_FBF_4x4.png'],
      dark02:['Dark_MediumImpact.png'],
      bossFireQImpact:['Dark_MediumImpact.png'],
      explosion:['Fire_ImpactFire_Sheet.png'],
      fire_medium:['Fire_MediumImpact.png'],
    };
    const _boomColMap={
      ice:{c:4,r:4},lightning:{c:4,r:4},'Lightning_Lightning_FBF_4x3.png':{c:4,r:3},
      'Ice_ImpactIce_Sheet.png':{c:4,r:4},'Ice_MistSmoke_FBF_4x4.png':{c:4,r:4},
      'Lightning_ImpactLightning_Sheet.png':{c:4,r:4},
    };
    if(_bv.col==='bossWaterImpact'&&_drawBossWaterImpactClip(X,_bv,_ep)){
      // The new single cell is complete; the original generic path is its failure fallback.
    }else if(_bv.col==='bossFireImpact'&&_drawBossFireImpactClip(X,_bv,_ep)){
      // One authored fire-contact cell; originalfire16 stays the failure fallback.
    }else if(_bv.col==='bossFireQImpact'&&_tvfx2Imgs['Dark_MediumImpact.png']?.complete&&_drawBossFireImpactClip(X,_bv,_ep)){
      // FD fire Q reuses the approved24 clip; originalDark16 remains its fallback.
    }else if(_bv.col==='druid_poison_hit'){
      _drawDruidPoisonImpact(X,_bv,_tvfx2Imgs);
    }else if(_bv.col==='plague'){
      if(_plagueBoomSpr.ready&&_plagueBoomSpr.img){
        const _fi=Math.min(5,~~(_ep*6));
        const _drawSz=_bv.r*3.2*_boomGrow(_ep);
        X.globalAlpha=Math.max(0,1-_ep*.5);
        X.drawImage(_plagueBoomSpr.img,_fi*_plagueBoomSpr.w,0,_plagueBoomSpr.w,_plagueBoomSpr.h,bx-_drawSz/2,by-_drawSz/2,_drawSz,_drawSz);
      }
    }else
    // rainbow_light(무지개 피격 폭발): 알록달록 다원소 레이어 콤보
    if(_bv.col==='rainbow_light'){
      const _alpha=Math.max(0,1-_ep*.5);
      const _rbSheets=['Poison_MediumImpact.png','Dark_DarkSmoke_FBF_4x4.png','Light_ImpactLight_Sheet.png','Ice_ImpactIce_Sheet.png'];
      for(let _ri=0;_ri<_rbSheets.length;_ri++){
        const _rImg=_tvfx2Imgs[_rbSheets[_ri]];
        if(!_rImg||!_rImg.complete)continue;
        const _rC=4,_rFw=~~(_rImg.naturalWidth/_rC),_rFh=~~(_rImg.naturalHeight/_rC);
        const _rEp=Math.min(1,Math.max(0,_ep-_ri*.03)/Math.max(.01,1-_ri*.03));
        const _rFi=Math.min(15,~~(_rEp*16)),_rFc=_rFi%_rC,_rFr=~~(_rFi/_rC);
        const _rSz=_bv.r*(2.8+_ri*.3)*_boomGrow(_rEp);
        const _rRot=_ri*Math.PI*.5;
        X.save();X.translate(bx,by);X.rotate(_rRot);
        X.globalAlpha=_alpha*(1-_ri*.15);
        X.globalCompositeOperation='lighter';
        X.drawImage(_rImg,_rFc*_rFw,_rFr*_rFh,_rFw,_rFh,-_rSz/2,-_rSz/2,_rSz,_rSz);
        X.restore();
      }
    }else
    // rainbow(무지개 소멸): Power Dark 콤보
    if(_bv.col==='rainbow'){
      const _alpha=Math.max(0,1-_ep*.5);
      const _ds1=_tvfx2Imgs['Dark_DarkSmoke_FBF_4x4.png'];
      if(_ds1&&_ds1.complete){const _fw1=~~(_ds1.naturalWidth/4),_fh1=~~(_ds1.naturalHeight/4);
        const _fi1=Math.min(15,~~(_ep*16)),_c1=_fi1%4,_r1=~~(_fi1/4);
        const _sz1=_bv.r*3.6*_boomGrow(_ep);
        X.globalAlpha=_alpha;X.drawImage(_ds1,_c1*_fw1,_r1*_fh1,_fw1,_fh1,bx-_sz1/2,by-_sz1/2,_sz1,_sz1);}
      if(_ep>.05){const _ds2=_tvfx2Imgs['Dark_Smoke_Sheet_6x6.png'];
      if(_ds2&&_ds2.complete){const _fw2=~~(_ds2.naturalWidth/6),_fh2=~~(_ds2.naturalHeight/6);
        const _ep2=Math.min(1,(_ep-.05)/.95);const _fi2=Math.min(35,~~(_ep2*36)),_c2=_fi2%6,_r2=~~(_fi2/6);
        const _sz2=_bv.r*4.2*_boomGrow(_ep2);
        X.globalAlpha=_alpha*.8;X.drawImage(_ds2,_c2*_fw2,_r2*_fh2,_fw2,_fh2,bx-_sz2/2,by-_sz2/2,_sz2,_sz2);}}
      const _ds3=_tvfx2Imgs['Dark_BasicImpact.png'];
      if(_ds3&&_ds3.complete){const _fw3=~~(_ds3.naturalWidth/3),_fh3=~~(_ds3.naturalHeight/3);
        const _fi3=Math.min(8,~~(_ep*9)),_c3=_fi3%3,_r3=~~(_fi3/3);
        const _sz3=_bv.r*1.6*_boomGrow(_ep);
        X.globalAlpha=_alpha*.6;X.drawImage(_ds3,_c3*_fw3,_r3*_fh3,_fw3,_fh3,bx-_sz3/2,by-_sz3/2,_sz3,_sz3);}
    }else
    {
      // 통합 스프라이트시트 boom (black/redbean/fire/ice/lightning/dark/dark02/explosion)
      const _sheets=_boomSheetMap[_bv.col]||_boomSheetMap.fire;
      const _bAlpha=Math.max(0,1-_ep*.5);
      for(let _si=0;_si<_sheets.length;_si++){
        const _sImg=_tvfx2Imgs[_sheets[_si]];
        if(!_sImg||!_sImg.complete)continue;
        const _isLtn3=_sheets[_si]==='Lightning_Lightning_FBF_4x3.png';
        const _sCols=_isLtn3?4:(_sheets[_si].includes('Basic')?3:4);
        const _sRows=_isLtn3?3:(_sheets[_si].includes('Basic')?3:4);
        const _sFw=~~(_sImg.naturalWidth/_sCols),_sFh=~~(_sImg.naturalHeight/_sRows);
        const _sTotal=_bv.col==='physical'?4:_sCols*_sRows;
        const _sEp=Math.min(1,Math.max(0,_ep-_si*.04)/Math.max(.01,1-_si*.04));
        const _sFi=Math.min(_sTotal-1,~~(_sEp*_sTotal));
        const _sFc=_sFi%_sCols,_sFr=~~(_sFi/_sCols);
        const _sSz=_bv.r*(3.0+_si*.4)*_boomGrow(_sEp);
        const _sNativeAlpha=_bAlpha*(1-_si*.2);
        const _sContactQa=window._FDGDruidEncounterQa?.contactVfxReadability?window._FDGDruidEncounterQa:null;
        X.globalAlpha=_sContactQa?_sContactQa.contactVfxAlpha({kind:_bv.col,sheet:_sheets[_si],frame:_sFi,progress:_ep,alpha:_sNativeAlpha,x:bx,y:by,size:_sSz}):_sNativeAlpha;
        const _sDraw=_bv.col==='physical'?_physicalImpactSheet(_sImg):_sImg;
        X.drawImage(_sDraw,_sFc*_sFw,_sFr*_sFh,_sFw,_sFh,bx-_sSz/2,by-_sSz/2,_sSz,_sSz);
      }
    }
    X.globalAlpha=_bvPrevAlpha;
  }
  // ═══ [DET-BLAST-VFX] 기폭 전용 폭발 렌더 ═══
  for(let _dvi=0;_dvi<_DET_VFX_MAX;_dvi++){const _dv=_detVfx[_dvi];if(!_dv.active)continue;
    if(_dv.x<_vl-_dv.r||_dv.x>_vr+_dv.r||_dv.y<_vt-_dv.r||_dv.y>_vb+_dv.r)continue;
    const _dp=_dv.t/_dv.mt,_dinv=1-_dp,bx=_dv.x,by=_dv.y;
    X.save();
    // 1) 중심 섬광 (밝은 흰→주황 페이드)
    if(_dp<.3){const _fR=_dv.r*.4*(1-_dp/.3)*(_dv.chg*.3+.7);
      X.globalAlpha=(1-_dp/.3)*.9;
      X.fillStyle='#fff8e0';X.beginPath();X.arc(bx,by,_fR,0,Math.PI*2);X.fill();
      X.globalAlpha=(1-_dp/.3)*.5;
      X.fillStyle='#ff8800';X.beginPath();X.arc(bx,by,_fR*1.4,0,Math.PI*2);X.fill();}
    // 2) 충격파 링 (다중, 시차 확산)
    for(let _ri=0;_ri<_dv.rings.length;_ri++){const rng=_dv.rings[_ri];
      const rt=_dv.t-rng.delay;if(rt<0)continue;
      const rp=rt/(_dv.mt-rng.delay);if(rp>=1)continue;
      const rR=_dv.r*Math.pow(rp,.4)*rng.spd*1.2;
      const rA=Math.max(0,(1-rp)*1.0);
      X.globalAlpha=rA;X.strokeStyle=_ri===0?'#ffcc44':'#ff6622';
      X.lineWidth=(6-_ri*2)*(1-rp*.5);
      X.beginPath();X.arc(bx,by,rR,0,Math.PI*2);X.stroke();
      // 내부 얇은 링
      if(_ri===0&&rp<.5){X.globalAlpha=rA*.5;X.strokeStyle='#ffffff';X.lineWidth=2;
        X.beginPath();X.arc(bx,by,rR*.85,0,Math.PI*2);X.stroke();}}
    // 3) 방사 스파크 라인 (중심에서 바깥으로 뻗는 불꽃)
    if(_dp<.7){X.globalAlpha=_dinv*.9;
      for(let _si=0;_si<_dv.sparks.length;_si++){const sk=_dv.sparks[_si];
        const sLen=_dv.r*sk.len*Math.min(1,_dp*5)*(1-_dp*.4);
        const sW=sk.w*(1-_dp*.7);if(sW<.5)continue;
        const sa=sk.a+_dp*.4*sk.spd;
        const sx1=bx+Math.cos(sa)*_dv.r*.08,sy1=by+Math.sin(sa)*_dv.r*.08;
        const sx2=bx+Math.cos(sa)*sLen,sy2=by+Math.sin(sa)*sLen;
        X.strokeStyle=_si%3===0?'#ffee44':_si%3===1?'#ff7722':'#ff4400';
        X.lineWidth=sW;X.beginPath();X.moveTo(sx1,sy1);X.lineTo(sx2,sy2);X.stroke();}}
    // 4) 외곽 열기 글로우
    if(_dp<.5){const gR=_dv.r*Math.pow(_dp/.5,.3)*1.1;
      X.globalAlpha=.4*(1-_dp/.5);
      X.fillStyle='#ff4400';X.beginPath();X.arc(bx,by,gR,0,Math.PI*2);X.fill();}
    X.restore();
  }
  // ══ 폭풍소환 기원 투척 / 기존 폭탄 렌더 ══
  if(G._mmBomb){const mb=G._mmBomb,_mt=_now*.08,_mbR=mb.r;X.save();
    if(mb.phase==='throw'&&mb.vortex){
      // ── 소용돌이 기원 투척 렌더 ──
      const prog=Math.min(1,mb.t/mb.maxT);const _vIce=mb.iceFuse;
      // 착지점 소용돌이 범위 미리보기 (회전)
      X.globalAlpha=.06+prog*.15;X.fillStyle=_vIce?'#224466':'#330044';
      X.beginPath();X.arc(mb.tx,mb.ty,_mbR,0,Math.PI*2);X.fill();
      for(let ri=0;ri<3;ri++){
        const _rr=_mbR*(1-ri*.2);const _ra=_now*.003*(ri%2?1:-1);
        X.globalAlpha=(.1+prog*.15);X.strokeStyle=_vIce?(ri%2?'#66ccff':'#aaeeff'):(ri%2?'#cc44ff':'#8822aa');
        X.lineWidth=1.5+prog;X.setLineDash(_D10_8);X.lineDashOffset=-_now*.15*(ri%2?1:-1.5);
        X.beginPath();X.arc(mb.tx,mb.ty,_rr,_ra,_ra+Math.PI*2);X.stroke();X.setLineDash(_D0);
      }
      // 날아가는 기원 구체
      const bSz=8+Math.sin(_mt*4)*2+prog*4;
      X.globalAlpha=.9;X.fillStyle=_vIce?'#003355':'#330044';
      X.beginPath();X.arc(mb.x,mb.y,bSz,0,Math.PI*2);X.fill();
      X.fillStyle=_vIce?'#2288cc':'#8800cc';
      X.beginPath();X.arc(mb.x-1,mb.y-1,bSz*.6,0,Math.PI*2);X.fill();
      // 회전 이펙트 (작은 소용돌이 선)
      X.globalAlpha=.5;X.strokeStyle=_vIce?'#88ddff':'#cc88ff';X.lineWidth=1.5;
      for(let si=0;si<3;si++){
        const sa=_now*.01+Math.PI*2*si/3;const sr=bSz*1.3;
        X.beginPath();X.arc(mb.x,mb.y,sr,sa,sa+.8);X.stroke();
      }
      // 트레일 파티클
      if(Math.random()>.3){
        const _tc=_vIce?(Math.random()>.5?'#aaeeff':'#66ccff'):(Math.random()>.5?'#cc88ff':'#8844dd');
        poolPart(mb.x+(Math.random()-.5)*8,mb.y+(Math.random()-.5)*8,
          (Math.random()-.5)*2,1+Math.random(),_tc,2+Math.random()*2,8+Math.random()*5);
      }
    }else if(mb.phase==='throw'&&mb.iceFuse){
      // ── 얼음포격: 악의포격 폭탄 + 아이스 색감 ──
      const prog=Math.min(1,mb.t/mb.maxT);
      // 착지점 범위 표시 (얼음)
      X.globalAlpha=.06+prog*.12;X.fillStyle='#44aacc';X.beginPath();X.arc(mb.tx,mb.ty,_mbR,0,Math.PI*2);X.fill();
      X.globalAlpha=.3+prog*.3;X.strokeStyle='#88ddff';X.lineWidth=1.5+prog*2;X.setLineDash(_D8_6);X.lineDashOffset=-_now*.12;
      X.beginPath();X.arc(mb.tx,mb.ty,_mbR,0,Math.PI*2);X.stroke();X.setLineDash(_D0);
      // 날아가는 폭탄 (악의포격 스타일, 아이스 색감)
      const bSz=10+Math.sin(_mt*3)*2;X.globalAlpha=.9;X.fillStyle='#003366';X.beginPath();X.arc(mb.x,mb.y,bSz,0,Math.PI*2);X.fill();
      X.fillStyle='#2288cc';X.beginPath();X.arc(mb.x-1,mb.y-1,bSz*.65,0,Math.PI*2);X.fill();
      // 냉기 트레일
      if(Math.random()>.5){poolPart(mb.x+(Math.random()-.5)*8,mb.y+(Math.random()-.5)*8,(Math.random()-.5)*2,-1-Math.random(),Math.random()>.5?'#aaeeff':'#66ccff',1.5+Math.random()*2,8+Math.random()*5);}
    }else if(mb.phase==='iceOrb'){
      // ── 얼음포격: 착지 후 어둠 보주 (얼음보주 스프라이트 + hue-rotate 어둠) ──
      const _ioFP=Math.min(1,(mb.iceT||0)/180);const _ioFR=P.r+32+Math.sin(_ioFP*Math.PI)*10;
      const _ioSh=_VFX_SHEETS['ice_orb'];
      if(_ioSh&&_ioSh.img){
        mb._ioFormT2=(mb._ioFormT2||0)+_dtSp;
        const _ioFD=60;
        const _ioFrm=mb._ioFormT2<_ioFD?8-Math.min(8,~~(mb._ioFormT2/_ioFD*9)):0;
        const _ioCol=_ioFrm%_ioSh.cols,_ioRow=~~(_ioFrm/_ioSh.cols);
        const _ioDraw=_ioFR*6.6;
        X.filter='hue-rotate(200deg) saturate(1.4)';
        X.globalAlpha=.85+.1*Math.sin(_ioFP*6);
        X.drawImage(_ioSh.img,_ioCol*_ioSh.fw,_ioRow*_ioSh.fh,_ioSh.fw,_ioSh.fh,mb.tx-_ioDraw/2,mb.ty-_ioDraw/2,_ioDraw,_ioDraw);
        X.globalCompositeOperation='lighter';
        X.globalAlpha=.15+.1*Math.sin(_ioFP*8);
        X.drawImage(_ioSh.img,_ioCol*_ioSh.fw,_ioRow*_ioSh.fh,_ioSh.fw,_ioSh.fh,mb.tx-_ioDraw/2,mb.ty-_ioDraw/2,_ioDraw,_ioDraw);
        X.globalCompositeOperation='source-over';X.filter='none';
      } else {
        X.globalAlpha=.75+.1*Math.sin(_ioFP*6);
        X.drawImage(_rgStampC('ioFG',_ioFR,_RG_IO_IN,_RG_IO),mb.tx-_ioFR,mb.ty-_ioFR,_ioFR*2,_ioFR*2);
      }
      // 어둠 파티클
      if(Math.random()>.6){const pa=Math.random()*Math.PI*2;
        poolPart(mb.tx+Math.cos(pa)*_ioFR,mb.ty+Math.sin(pa)*_ioFR,Math.cos(pa)*1.5+(Math.random()-.5),-1-Math.random()*2,Math.random()>.5?'#bb88ff':'#6622aa',1.5+Math.random()*2.5,12+Math.random()*8);}
      // 타이머
      const _ioFSec=((180-(mb.iceT||0))/60).toFixed(1);
      X.globalAlpha=.9;X.fillStyle='#cc88ff';X.font='bold 13px monospace';X.textAlign='center';
      X.fillText(_ioFSec+'s',mb.tx,mb.ty-_ioFR-10);X.textAlign='left';
      // 어둠 범위 표시
      X.globalAlpha=.08;X.fillStyle='#552288';X.beginPath();X.arc(mb.tx,mb.ty,_ioFR+60,0,Math.PI*2);X.fill();
      X.globalAlpha=.25;X.strokeStyle='#aa66ff';X.lineWidth=1;X.setLineDash(_D6_4);X.lineDashOffset=-_now*.1;
      X.beginPath();X.arc(mb.tx,mb.ty,_ioFR+60,0,Math.PI*2);X.stroke();X.setLineDash(_D0);
    }else if(mb.phase==='icePull'){
      // ── 얼음포격 10렙: 빙결 소용돌이 렌더 ──
      const _ipProg=Math.min(1,(mb.pullT||0)/(mb.pullMax||90));const _ipR=_mbR*1.2;
      // 흡인 범위 바닥
      X.globalAlpha=.08+_ipProg*.12;X.fillStyle='#225577';X.beginPath();X.arc(mb.tx,mb.ty,_ipR*(1-_ipProg*.3),0,Math.PI*2);X.fill();
      // 소용돌이 링
      for(let ri=0;ri<3;ri++){
        const _rr=_ipR*(1-_ipProg*.4)*(1-ri*.25);const _ra=_now*.003*(ri%2?1:-1);
        X.globalAlpha=.15+_ipProg*.2;X.strokeStyle=ri%2?'#66ccff':'#3388aa';X.lineWidth=2+_ipProg*2;
        X.setLineDash(_D12_8);X.lineDashOffset=-_now*.2*(ri%2?1:-1.5);
        X.beginPath();X.arc(mb.tx,mb.ty,_rr,_ra,_ra+Math.PI*2);X.stroke();X.setLineDash(_D0);
      }
      // 중심 코어 (냉기 맥동)
      const _icCoreR=8+_ipProg*18;const _icPulse=1+Math.sin(_now*.015)*.3;
      X.globalAlpha=.4+_ipProg*.4;X.fillStyle='#44aacc';X.beginPath();X.arc(mb.tx,mb.ty,_icCoreR*_icPulse,0,Math.PI*2);X.fill();
      X.globalAlpha=.7+_ipProg*.3;X.fillStyle='#88ddff';X.beginPath();X.arc(mb.tx,mb.ty,_icCoreR*.5*_icPulse,0,Math.PI*2);X.fill();
    }else if(mb.phase==='throw'){
      const prog=Math.min(1,mb.t/mb.maxT);
      X.globalAlpha=.06+prog*.15;X.fillStyle='#aa00ff';X.beginPath();X.arc(mb.tx,mb.ty,_mbR,0,Math.PI*2);X.fill();
      X.globalAlpha=.3+prog*.4;X.strokeStyle='#ff44ff';X.lineWidth=1.5+prog*2;X.setLineDash(_D8_6);X.lineDashOffset=-_now*.12;
      X.beginPath();X.arc(mb.tx,mb.ty,_mbR,0,Math.PI*2);X.stroke();X.setLineDash(_D0);
      const bSz=10+Math.sin(_mt*3)*2;X.globalAlpha=.9;X.fillStyle='#440066';X.beginPath();X.arc(mb.x,mb.y,bSz,0,Math.PI*2);X.fill();
      X.fillStyle='#8800cc';X.beginPath();X.arc(mb.x-1,mb.y-1,bSz*.65,0,Math.PI*2);X.fill();
    }else if(mb.phase==='pull'){
      // 흡인 페이즈: 소용돌이 + 맥동 원
      const _pp=mb.pullT/mb.pullMax;const _pullR=_mbR*1.5;
      // 외곽 흡인 범위
      X.globalAlpha=.08+_pp*.12;X.fillStyle='#660088';X.beginPath();X.arc(mb.tx,mb.ty,_pullR*(1-_pp*.3),0,Math.PI*2);X.fill();
      // 소용돌이 링
      for(let ri=0;ri<3;ri++){
        const _rr=_pullR*(1-_pp*.4)*(1-ri*.25);const _ra=_now*.003*(ri%2?1:-1);
        X.globalAlpha=.15+_pp*.15;X.strokeStyle=ri%2?'#cc00ff':'#8800aa';X.lineWidth=2+_pp*2;
        X.setLineDash(_D12_8);X.lineDashOffset=-_now*.2*(ri%2?1:-1.5);
        X.beginPath();X.arc(mb.tx,mb.ty,_rr,_ra,_ra+Math.PI*2);X.stroke();X.setLineDash(_D0);
      }
      // 중심 코어 (점점 커짐)
      const _coreR=8+_pp*20;const _corePulse=1+Math.sin(_now*.015)*.3;
      X.globalAlpha=.4+_pp*.4;X.fillStyle='#aa00ff';X.beginPath();X.arc(mb.tx,mb.ty,_coreR*_corePulse,0,Math.PI*2);X.fill();
      X.globalAlpha=.7+_pp*.3;X.fillStyle='#cc44ff';X.beginPath();X.arc(mb.tx,mb.ty,_coreR*.5*_corePulse,0,Math.PI*2);X.fill();
    }
    X.restore();
  }
  _dpS3=performance.now(); // S3=방패/유탄/폭발VFX/포격 끝
  // ══ 블랙 — 시전 중 검은 오망성 (7초 전체 지속, 점점 커지다가 펑) ══
  if(P._bsCasting){
    const _bsLv=P.skills.blackStar||1;
    const _bsDurR=420+(_bsLv-1)*30; // 실제 흡인 지속시간과 동기화
    const prog=Math.min(1,P._bsT/_bsDurR);
    const cx=P._bsX,cy=P._bsY;
    const r=80+prog*240; // 작게→크게
    const rot=-_now*0.001; // 천천히 회전
    if(!G._blackStarImg){G._blackStarImg=new Image();G._blackStarImg.src='img/vfx_pentagram_purple.png'}
    X.save();
    // 1) 어두운 배경 원 (점점 진해짐)
    X.globalAlpha=(.08+prog*.3);X.fillStyle='#220033';
    X.beginPath();X.arc(cx,cy,r+60,0,Math.PI*2);X.fill();
    // 2) 펜타그램 이미지 — 7초간 점점 커짐 + 마지막 10% 펑 터짐
    if(G._blackStarImg.complete&&G._blackStarImg.naturalWidth>0){
      const _bsBurst=prog>.9?(prog-.9)/.1:0; // 마지막 10%에서 팽창+페이드
      const _bsR=r*(1+_bsBurst*2); // 펑 터질 때 3배
      const _bsFlk=.5+.5*(.5+.5*Math.sin(_now*.008))*(.6+.4*Math.sin(_now*.025));
      const _bsFade=_bsBurst>0?Math.max(0,1-_bsBurst*1.2):1; // 펑 터지며 사라짐
      X.save();
      X.translate(cx,cy);X.rotate(rot);
      X.globalCompositeOperation='lighter';
      // 글로우
      X.globalAlpha=(.25+prog*.35)*_bsFlk*_bsFade;
      X.drawImage(G._blackStarImg,-_bsR*1.15,-_bsR*1.15,_bsR*2.3,_bsR*2.3);
      // 메인
      X.globalAlpha=(.5+prog*.4)*_bsFlk*_bsFade;
      X.drawImage(G._blackStarImg,-_bsR,-_bsR,_bsR*2,_bsR*2);
      X.restore();
    }
    // 3) 외곽 원
    X.globalAlpha=.3+prog*.4;X.strokeStyle='#6600aa';X.lineWidth=1.5+prog*2;
    X.beginPath();X.arc(cx,cy,r,0,Math.PI*2);X.stroke();
    // 4) 흡인 파티클
    if(Math.random()>.3){const pa=Math.random()*Math.PI*2,pd=r+50+Math.random()*100;
      poolPart(cx+Math.cos(pa)*pd,cy+Math.sin(pa)*pd,-Math.cos(pa)*(3+prog*3),-Math.sin(pa)*(3+prog*3),Math.random()>.5?'#aa00ff':'#440066',2+Math.random()*3,10)}
    // 5) 남은시간 표시
    const _bsRem=Math.max(0,((_bsDurR-P._bsT)/60)|0);
    X.globalAlpha=.7;X.fillStyle='#111';X.fillRect(cx-40,cy-r-20,80,8);
    X.fillStyle='#aa00ff';X.fillRect(cx-40,cy-r-20,80*prog,8);
    X.strokeStyle='#666';X.lineWidth=1;X.strokeRect(cx-40,cy-r-20,80,8);
    X.globalAlpha=.8;X.fillStyle='#cc44ff';X.font='bold 12px monospace';X.textAlign='center';
    X.fillText(_bsRem+'s',cx,cy-r-25);
    X.restore();
  }
  // ══ 필살기 신규 이펙트 텍스처 (Higgsfield 생성, 콘텐츠 크롭본) ══
  // Only blackStar uses this burst texture; retired holy/lava textures must not request resources.
  if(!G._ultImg){G._ultImg={black:new Image()};
    G._ultImg.black.src='assets/vfx/boss/ult_black_c.png';}
  // 블랙 — 시전 중 소용돌이(흡인 시각화, 회전)
  {const _bi=G._ultImg.black;
   if(P._bsCasting&&_bi.complete&&_bi.naturalWidth>0){
    const _bp=Math.min(1,(P._bsT||0)/120);const _bw=520+_bp*560,_bh=_bw*_bi.naturalHeight/_bi.naturalWidth;
    X.save();X.globalCompositeOperation='lighter';
    X.translate(P._bsX,P._bsY);X.rotate(_now*0.0045);
    X.globalAlpha=(0.5+_bp*0.4)*(0.82+0.18*Math.sin(_now*0.01));
    X.drawImage(_bi,-_bw/2,-_bh/2,_bw,_bh);
    X.restore();
   }}
  // 필살기 발동 버스트 (용암/신성=기둥[바닥 앵커], 블랙=소용돌이[중앙], scale-in+fade)
  if(G._ultBurst){
    const ub=G._ultBurst;const _uimg=G._ultImg[ub.kind];
    if(_uimg&&_uimg.complete&&_uimg.naturalWidth>0){
      const p=Math.min(1,ub.t/ub.maxT);
      const inP=Math.min(1,p/0.2);const ease=inP*inP*(3-2*inP);
      const iw=_uimg.naturalWidth,ih=_uimg.naturalHeight;
      const w=((ub.kind==='black')?660:600)*(0.4+ease*0.82)*(1+p*0.12);
      const h=w*ih/iw;
      const alpha=p<0.16?(p/0.16):Math.max(0,1-(p-0.16)/0.84);
      X.save();X.globalCompositeOperation='lighter';X.globalAlpha=alpha;
      X.translate(ub.x,ub.y);
      if(ub.kind==='black'){X.rotate(ub.rot||0);X.drawImage(_uimg,-w/2,-h/2,w,h);}
      else{X.drawImage(_uimg,-w/2,-h*0.93,w,h);} // 기둥: 분화구(하단)가 시전 지점
      X.restore();
    }
  }
  // ══ 탄막블랙홀 — 작은 특이점 코어 + 넓은 탄막 흡수장 ══
  if(P._lvCasting){
    const _lvDur=_bulletBlackHoleDuration();
    const prog=Math.min(1,P._lvT/_lvDur);
    const cx=P._lvX,cy=P._lvY;
    const fieldR=_bulletBlackHoleAbsorbRadius(P.skills.lavaSummon||1);
    const _lvAnimSize=(238+prog*34)*(1+Math.sin(_now*.018)*.025);
    const coreR=_lvAnimSize*.31;
    X.save();
    // 넓은 흡수 범위는 얇은 원 두 겹으로만 표시해 전투 시야를 가리지 않는다.
    X.globalCompositeOperation='source-over';X.globalAlpha=.11+.05*Math.sin(_now*.006);
    X.strokeStyle='#ff5422';X.lineWidth=2;X.beginPath();X.arc(cx,cy,fieldR,0,Math.PI*2);X.stroke();
    X.globalAlpha=.08;X.strokeStyle='#7b1022';X.lineWidth=5;X.beginPath();X.arc(cx,cy,fieldR*.72,0,Math.PI*2);X.stroke();
    // API 생성 8프레임: 검은 코어 맥동 + 용암 강착 고리 회전.
    X.translate(cx,cy);const _lvImg=_bulletBlackHoleSheet;
    if(_lvImg.complete&&_lvImg.naturalWidth>=2048){
      const _lvFrame=(((_now/80)|0)%8);
      const _lvSx=(_lvFrame%4)*512,_lvSy=((_lvFrame/4)|0)*512;
      X.globalCompositeOperation='source-over';X.globalAlpha=.96;
      X.drawImage(_lvImg,_lvSx,_lvSy,512,512,-_lvAnimSize/2,-_lvAnimSize/2,_lvAnimSize,_lvAnimSize);
    }else{
      // 로딩 실패/첫 프레임 폴백: 기존 붉은 오망성을 작게 유지한다.
      const _lvPentaR=92;X.rotate(_now*.0028);X.globalCompositeOperation='lighter';X.globalAlpha=.58;
      X.drawImage(_pentaRed,-_lvPentaR,-_lvPentaR,_lvPentaR*2,_lvPentaR*2);
      X.globalCompositeOperation='source-over';X.globalAlpha=.96;X.fillStyle='#030006';X.beginPath();X.arc(0,0,coreR*.72,0,Math.PI*2);X.fill();
      X.strokeStyle='#ff4a1e';X.lineWidth=4;X.beginPath();X.arc(0,0,coreR*.75,0,Math.PI*2);X.stroke();
    }
    X.restore();
    // 바깥 탄막이 중심으로 빨려 들어가는 가벼운 궤적.
    if(Math.random()>.15){const pa=Math.random()*Math.PI*2,pd=coreR+90+Math.random()*Math.min(560,fieldR-coreR-90);
      const px=cx+Math.cos(pa)*pd,py=cy+Math.sin(pa)*pd;
      poolPart(px,py,-Math.cos(pa)*(7+Math.random()*4),-Math.sin(pa)*(7+Math.random()*4),Math.random()>.45?'#ff5a22':'#5a0830',2+Math.random()*3,18);}
    // 남은 시간과 누적 흡수량.
    const _lvRem=Math.max(0,Math.ceil((_lvDur-P._lvT)/60));
    X.save();X.globalAlpha=.82;X.fillStyle='#120007';X.fillRect(cx-55,cy-coreR-42,110,8);
    X.fillStyle='#ff4c22';X.fillRect(cx-55,cy-coreR-42,110*prog,8);
    X.strokeStyle='#6f2a22';X.lineWidth=1;X.strokeRect(cx-55,cy-coreR-42,110,8);
    X.globalAlpha=.95;X.fillStyle='#ffb36b';X.font='bold 13px monospace';X.textAlign='center';
    X.fillText(_lvRem+'s  ABSORB '+(P._lvAbsorbed||0),cx,cy-coreR-49);X.restore();
  }
  // ══ 용암소환 — 화면 빨간 오버레이 (10초) ══
  if(G._lavaField){
    const lf=G._lavaField;
    const prog=lf.t/600;
    const fadeIn=Math.min(1,prog*5);
    const fadeOut=prog>0.8?Math.max(0,(1-prog)*5):1;
    const alpha=fadeIn*fadeOut;
    const pulse=1+Math.sin(_now*0.008)*0.15;
    X.save();X.setTransform(1,0,0,1,0,0);
    X.globalAlpha=alpha*0.08*pulse;
    X.fillStyle='#ff2200';X.fillRect(0,0,C.width,C.height);
    // 화면 하단 용암 느낌
    X.globalAlpha=alpha*0.06;
    const grd=X.createLinearGradient(0,C.height*0.6,0,C.height);
    grd.addColorStop(0,'transparent');grd.addColorStop(1,'#ff3300');
    X.fillStyle=grd;X.fillRect(0,0,C.width,C.height);
    // 남은시간 표시
    const rem=((10-10*prog)|0);
    X.globalAlpha=alpha*0.7;X.fillStyle='#ff4400';X.font='bold 14px monospace';X.textAlign='center';
    X.fillText('🌋 '+_T('화상')+' '+rem+'s',C.width/2,30);
    X.restore();
  }
  _dpS4=performance.now(); // S4=궁극기 렌더 끝
  const __hideSkillBoundary=true;
  const __strokeBak=__hideSkillBoundary?X.stroke:null;
  const __dashBak=__hideSkillBoundary?X.setLineDash:null;
  if(__hideSkillBoundary){X.stroke=function(){};X.setLineDash=function(){};}
  // ══ 추적 장판 (chaseAoe) 렌더 ══
  if(G._chaseAoes){
    for(let ci=0;ci<G._chaseAoes.length;ci++){
      const ca=G._chaseAoes[ci];if(!ca.zones)continue;
      for(let zi=0;zi<ca.zones.length;zi++){
        const z=ca.zones[zi];
         if(z.hit){
           const _ep=z.explT/z.explMax;
            if(z.druid){_drawDruidGroundRing(X,z.x,z.y,z.r*(1+_ep*.25),(1-_ep)*.68,zi*.67);
            }else{X.globalAlpha=(1-_ep)*.18;X.fillStyle='#ff4400';X.beginPath();X.arc(z.x,z.y,z.r*(1+_ep*.3),0,Math.PI*2);X.fill();}
           if(!z.druid){X.globalAlpha=(1-_ep)*.8;X.strokeStyle='#ffaa00';X.lineWidth=3*(1-_ep);
             X.beginPath();X.arc(z.x,z.y,z.r*(1+_ep*.5),0,Math.PI*2);X.stroke();}
         }else if(z.druid){
           // 부패한 뿌리 장판: 중앙을 비워 캐릭터가 보이게 한다. 피해 판정 반경은 그대로 둔다.
           const _zP=Math.min(1,z.t/z.delay),_pulse=.78+Math.sin(_now*.018+zi)*.22;
           _drawDruidGroundRing(X,z.x,z.y,z.r,_zP*(.55+.12*_pulse),zi*.67);
         }else{
          // 안내 원 (점점 밝아짐)
          const _zP=Math.min(1,z.t/z.delay);
          // 바닥 원
          X.globalAlpha=_zP*.12;X.fillStyle='#ff2200';
          X.beginPath();X.arc(z.x,z.y,z.r,0,Math.PI*2);X.fill();
          // 테두리 (점멸)
          X.globalAlpha=_zP*(.3+Math.sin(_now*.02+zi)*.15);X.strokeStyle='#ff4400';X.lineWidth=2+_zP*2;
          X.beginPath();X.arc(z.x,z.y,z.r,0,Math.PI*2);X.stroke();
          // 수축 링 (터지기 직전 경고)
          if(_zP>.5){
            const _shrink=1-((_zP-.5)*2); // 1→0
            X.globalAlpha=(.5-_shrink*.3);X.strokeStyle='#ffcc00';X.lineWidth=1.5;
            X.beginPath();X.arc(z.x,z.y,z.r*_shrink,0,Math.PI*2);X.stroke();
          }
          // 십자 표시
          X.globalAlpha=_zP*.25;X.strokeStyle='#ff6644';X.lineWidth=1;
          X.beginPath();X.moveTo(z.x-z.r*.7,z.y);X.lineTo(z.x+z.r*.7,z.y);X.stroke();
          X.beginPath();X.moveTo(z.x,z.y-z.r*.7);X.lineTo(z.x,z.y+z.r*.7);X.stroke();
        }
      }
    }
    X.globalAlpha=1;
  }
  // ══ 용암 장판 렌더 ══
  if(G._lavaPools&&G._lavaPools.length>0){
    for(let li=0;li<G._lavaPools.length;li++){
      const lp=G._lavaPools[li];
      // [다크드루이드] stage3 lavaPools = 커스텀 녹색 가시 장판 아트(빨간원 대체)
      const _dzl=((G.stage===0||G.stage===3)&&typeof _druidSheets!=='undefined'&&_druidSheets.aoe&&_druidSheets.aoe.ready)?_druidSheets.aoe:null;
      if(_isDruidFinale(G._bossRef)){_drawDruidFinalePool(X,lp,_dzl,__strokeBak);continue;}
      if(G.stage===0||G.stage===3){
        const _la=lp.t<lp.warnT?lp.t/lp.warnT*.42:lp.t>lp.maxT*.8?(1-(lp.t-lp.maxT*.8)/(lp.maxT*.2))*.65:.65;
        if(_drawDruidPoolClip(X,lp,_la))continue;}
      if((G.stage===0||G.stage===3)&&_druidGroundRing.complete&&_druidGroundRing.naturalWidth){
        const _la=lp.t<lp.warnT?lp.t/lp.warnT*.42:lp.t>lp.maxT*.8?(1-(lp.t-lp.maxT*.8)/(lp.maxT*.2))*.65:.65;
        _drawDruidGroundRing(X,lp.x,lp.y,lp.r,_la,li*.73);continue;}
      if(_dzl){const im=_dzl.img,cw=im.naturalWidth/4,ch=im.naturalHeight/2,fr=Math.min(7,~~(lp.t/lp.maxT*8)),sx=(fr%4)*cw,sy=(~~(fr/4))*ch,R=lp.r*1.4;
        const _la=lp.t<lp.warnT?(lp.t/lp.warnT*.18):(lp.t>lp.maxT*.8?(1-(lp.t-lp.maxT*.8)/(lp.maxT*.2))*.26:.26);
        X.globalAlpha=_la;X.drawImage(im,sx,sy,cw,ch,lp.x-R,lp.y-R,R*2,R*2);
        X.globalAlpha=Math.min(1,_la*1.8);X.fillStyle='#a9d76a';X.beginPath();X.arc(lp.x,lp.y,lp.r,0,Math.PI*2);X.arc(lp.x,lp.y,Math.max(0,lp.r-1.2),0,Math.PI*2,true);X.fill();X.globalAlpha=1;continue;}
      if(lp.t<lp.warnT){
        // 경고 원
        const _wp=lp.t/lp.warnT;
        X.globalAlpha=_wp*.12;X.fillStyle='#ff2200';
        X.beginPath();X.arc(lp.x,lp.y,lp.r,0,Math.PI*2);X.fill();
        X.globalAlpha=_wp*(.3+Math.sin(_now*.02+li)*.15);X.strokeStyle='#ff4400';X.lineWidth=2+_wp*2;
        X.beginPath();X.arc(lp.x,lp.y,lp.r,0,Math.PI*2);X.stroke();
        if(_wp>.5){const _shr=1-((_wp-.5)*2);
          X.globalAlpha=(.4-_shr*.3);X.strokeStyle='#ffcc00';X.lineWidth=1.5;
          X.beginPath();X.arc(lp.x,lp.y,lp.r*_shr,0,Math.PI*2);X.stroke();}
      }else{
        // 활성 용암
        const _fade=Math.min(1,(lp.maxT-lp.t)/60);
        X.globalAlpha=.15*_fade;X.fillStyle='#ff2200';
        X.beginPath();X.arc(lp.x,lp.y,lp.r,0,Math.PI*2);X.fill();
        X.globalAlpha=(.08+Math.sin(_now*.01+li)*.04)*_fade;X.fillStyle='#ff8800';
        X.beginPath();X.arc(lp.x,lp.y,lp.r*.7,0,Math.PI*2);X.fill();
        X.globalAlpha=.4*_fade;X.strokeStyle='#ff4400';X.lineWidth=2;
        X.beginPath();X.arc(lp.x,lp.y,lp.r,0,Math.PI*2);X.stroke();
      }
    }
    X.globalAlpha=1;
  }
  // ══ 화염비 렌더 ══
  if(G._fireRains&&G._fireRains.length>0){
    for(let fi=0;fi<G._fireRains.length;fi++){
      const fr=G._fireRains[fi];
      if(fr.hit){
        const _ep=(fr._fadeT||0)/20;
        X.globalAlpha=(1-_ep)*.18;X.fillStyle='#ff4400';
        X.beginPath();X.arc(fr.x,fr.y,fr.r*(1+_ep*.3),0,Math.PI*2);X.fill();
        X.globalAlpha=(1-_ep)*.8;X.strokeStyle='#ffaa00';X.lineWidth=3*(1-_ep);
        X.beginPath();X.arc(fr.x,fr.y,fr.r*(1+_ep*.5),0,Math.PI*2);X.stroke();
      }else{
        const _fp=Math.min(1,fr.t/fr.delay);
        if(_pentaRed.complete&&_pentaRed.naturalWidth){
          X.save();X.translate(fr.x,fr.y);X.rotate(_now*.00028);
          X.globalAlpha=.07+_fp*.09;X.drawImage(_pentaRed,-fr.r*.88,-fr.r*.88,fr.r*1.76,fr.r*1.76);X.restore();
        }
        X.globalAlpha=_fp*.1;X.fillStyle='#b50022';
        X.beginPath();X.arc(fr.x,fr.y,fr.r,0,Math.PI*2);X.fill();
        X.globalAlpha=_fp*(.55+Math.sin(_now*.02+fi)*.2);X.strokeStyle='#ff2438';X.lineWidth=2+_fp*2;
        X.beginPath();X.arc(fr.x,fr.y,fr.r,0,Math.PI*2);X.stroke();
        if(_fp>.5){const _shr=1-((_fp-.5)*2);
          X.globalAlpha=(.5-_shr*.3);X.strokeStyle='#ff4455';X.lineWidth=1.5;
          X.beginPath();X.arc(fr.x,fr.y,fr.r*_shr,0,Math.PI*2);X.stroke();}
      }
    }
    X.globalAlpha=1;
  }
  // ══ 전격 격자 렌더 ══
  if(G._shockGrids&&G._shockGrids.length>0){
    for(let si=0;si<G._shockGrids.length;si++){
      const sg=G._shockGrids[si];
      const _fade2=Math.min(1,(sg.maxT-sg.t)/30);
      if(sg.t<sg.warnT){
        // 경고: 점선
        const _wp2=sg.t/sg.warnT;
        X.globalAlpha=_wp2*.3;X.strokeStyle='#44ccff';X.lineWidth=sg.w*_wp2;
        X.setLineDash(_D8_6);
        X.beginPath();X.moveTo(sg.x,sg.y);
        X.lineTo(sg.x+Math.cos(sg.ang)*sg.len,sg.y+Math.sin(sg.ang)*sg.len);X.stroke();
        X.setLineDash(_D0);
      }else{
        // 활성 전격
        const pulse2=.6+Math.sin(_now*.03+si)*.3;
        X.globalAlpha=.15*pulse2*_fade2;X.strokeStyle='#44ccff';X.lineWidth=sg.w;
        X.beginPath();X.moveTo(sg.x,sg.y);
        X.lineTo(sg.x+Math.cos(sg.ang)*sg.len,sg.y+Math.sin(sg.ang)*sg.len);X.stroke();
        X.globalAlpha=.5*pulse2*_fade2;X.strokeStyle='#88eeff';X.lineWidth=sg.w*.3;
        X.beginPath();X.moveTo(sg.x,sg.y);
        X.lineTo(sg.x+Math.cos(sg.ang)*sg.len,sg.y+Math.sin(sg.ang)*sg.len);X.stroke();
        X.globalAlpha=.8*pulse2*_fade2;X.strokeStyle='#ffffff';X.lineWidth=2;
        X.beginPath();X.moveTo(sg.x,sg.y);
        X.lineTo(sg.x+Math.cos(sg.ang)*sg.len,sg.y+Math.sin(sg.ang)*sg.len);X.stroke();
      }
    }
    X.globalAlpha=1;
  }
  // ══ 도넛 장판 렌더 ══
  if(G._donutSlams&&G._donutSlams.length>0){
    for(let di=0;di<G._donutSlams.length;di++){
      const ds=G._donutSlams[di];
      if(ds.hit){const _ep=Math.min(1,(ds.t-ds.warnT)/(ds.maxT-ds.warnT));
        X.globalAlpha=(1-_ep)*.16;X.fillStyle='#ff2200';
        X.beginPath();X.arc(ds.x,ds.y,ds.outerR,0,Math.PI*2);X.arc(ds.x,ds.y,ds.innerR,0,Math.PI*2,true);X.fill();
      }else{const _wp=ds.t/ds.warnT;
        X.globalAlpha=_wp*.1;X.fillStyle='#ff0000';
        X.beginPath();X.arc(ds.x,ds.y,ds.outerR,0,Math.PI*2);X.arc(ds.x,ds.y,ds.innerR,0,Math.PI*2,true);X.fill();
        X.globalAlpha=_wp*(.4+Math.sin(_now*.02)*.2);X.strokeStyle='#ff4444';X.lineWidth=3+_wp*3;
        X.beginPath();X.arc(ds.x,ds.y,ds.outerR,0,Math.PI*2);X.stroke();
        X.globalAlpha=_wp*.1;X.fillStyle='#44ff44';X.beginPath();X.arc(ds.x,ds.y,ds.innerR,0,Math.PI*2);X.fill();
        X.globalAlpha=_wp*(.5+Math.sin(_now*.015)*.2);X.strokeStyle='#44ff44';X.lineWidth=2+_wp*2;
        X.beginPath();X.arc(ds.x,ds.y,ds.innerR,0,Math.PI*2);X.stroke();
        if(_wp>.4){const _shr=1-((_wp-.4)/.6);X.globalAlpha=.4;X.strokeStyle='#ffcc00';X.lineWidth=2;
          X.beginPath();X.arc(ds.x,ds.y,ds.innerR+(ds.outerR-ds.innerR)*_shr,0,Math.PI*2);X.stroke();}
      }
    }X.globalAlpha=1;
  }
  // ══ 안전지대 축소 렌더 ══
  if(G._safeCorners&&G._safeCorners.length>0){
    for(let si2=0;si2<G._safeCorners.length;si2++){
      const sc=G._safeCorners[si2];
      if(sc.hit){const _ep=Math.min(1,(sc.t-sc.warnT)/(sc.maxT-sc.warnT));
        X.globalAlpha=(1-_ep)*.5;X.fillStyle='#ff0000';X.beginPath();X.arc(sc.cx,sc.cy,sc.fullR,0,Math.PI*2);X.fill();
      }else{const _wp=sc.t/sc.warnT;
        X.globalAlpha=_wp*.1;X.fillStyle='#ff0000';X.beginPath();X.arc(sc.cx,sc.cy,sc.fullR,0,Math.PI*2);X.fill();
        X.globalAlpha=_wp*(.3+Math.sin(_now*.02)*.15);X.strokeStyle='#ff2200';X.lineWidth=4;
        X.beginPath();X.arc(sc.cx,sc.cy,sc.fullR,0,Math.PI*2);X.stroke();
        X.globalAlpha=_wp*.25;X.fillStyle='#44ff44';X.beginPath();X.arc(sc.safeX,sc.safeY,sc.safeR,0,Math.PI*2);X.fill();
        X.globalAlpha=_wp*(.6+Math.sin(_now*.01)*.2);X.strokeStyle='#44ff44';X.lineWidth=3+_wp*3;
        X.setLineDash(_D8_4);X.beginPath();X.arc(sc.safeX,sc.safeY,sc.safeR,0,Math.PI*2);X.stroke();X.setLineDash(_D0);
        X.globalAlpha=_wp*.4;X.strokeStyle='#88ff88';X.lineWidth=2;
        X.beginPath();X.moveTo(sc.safeX-sc.safeR*.6,sc.safeY);X.lineTo(sc.safeX+sc.safeR*.6,sc.safeY);X.stroke();
        X.beginPath();X.moveTo(sc.safeX,sc.safeY-sc.safeR*.6);X.lineTo(sc.safeX,sc.safeY+sc.safeR*.6);X.stroke();
      }
    }X.globalAlpha=1;
  }
  // ══ 쐐기 소멸 렌더 ══
  if(G._crossWipes&&G._crossWipes.length>0){
    for(let ci=0;ci<G._crossWipes.length;ci++){
      const cw=G._crossWipes[ci];const _cwWL=~~(cw.maxT/cw.waves);const _cwWv=~~(cw.t/_cwWL);
      const _cwLoc=cw.t-_cwWv*_cwWL;const _cwA2=_cwWv*(Math.PI/4);
      const _cwAct=cw.t>=cw.warnT&&_cwLoc>=30;const _fade3=Math.min(1,(cw.maxT-cw.t)/30);
      for(let a2=0;a2<4;a2++){const _ca=_cwA2+Math.PI/2*a2;
        const _ex=cw.x+Math.cos(_ca)*cw.len,_ey=cw.y+Math.sin(_ca)*cw.len;
        if(_cwAct){const p3=.5+Math.sin(_now*.03+a2)*.3;
          X.globalAlpha=.2*p3*_fade3;X.strokeStyle='#ff44ff';X.lineWidth=cw.w;
          X.beginPath();X.moveTo(cw.x,cw.y);X.lineTo(_ex,_ey);X.stroke();
          X.globalAlpha=.6*p3*_fade3;X.strokeStyle='#ffaaff';X.lineWidth=cw.w*.3;
          X.beginPath();X.moveTo(cw.x,cw.y);X.lineTo(_ex,_ey);X.stroke();
          X.globalAlpha=.9*p3*_fade3;X.strokeStyle='#fff';X.lineWidth=2;
          X.beginPath();X.moveTo(cw.x,cw.y);X.lineTo(_ex,_ey);X.stroke();
        }else{const _wp2=Math.min(1,cw.t/cw.warnT);
          X.globalAlpha=_wp2;X.strokeStyle='#ff44ff';X.lineWidth=cw.w*_wp2;
          X.setLineDash(_D10_8);X.beginPath();X.moveTo(cw.x,cw.y);X.lineTo(_ex,_ey);X.stroke();X.setLineDash(_D0);}
      }
    }X.globalAlpha=1;
  }
  // ══ 파도 밀기 렌더 ══
  if(G._tidalWipes&&G._tidalWipes.length>0){
    for(let ti=0;ti<G._tidalWipes.length;ti++){
      const tw2=G._tidalWipes[ti];const _pA2=tw2.ang+Math.PI/2;
      if(tw2.t<tw2.warnT){const _wp3=tw2.t/tw2.warnT;
        X.globalAlpha=_wp3*(.3+Math.sin(_now*.02)*.15);X.strokeStyle='#4488ff';X.lineWidth=4+_wp3*4;
        X.beginPath();X.moveTo(tw2.x+Math.cos(_pA2)*tw2.w/2,tw2.y+Math.sin(_pA2)*tw2.w/2);
        X.lineTo(tw2.x-Math.cos(_pA2)*tw2.w/2,tw2.y-Math.sin(_pA2)*tw2.w/2);X.stroke();
        for(let ar2=0;ar2<5;ar2++){const _ad=40+ar2*60;
          const _ax=tw2.x+Math.cos(tw2.ang)*_ad*_wp3,_ay=tw2.y+Math.sin(tw2.ang)*_ad*_wp3;
          X.globalAlpha=_wp3*.2;X.fillStyle='#4488ff';X.beginPath();
          X.moveTo(_ax+Math.cos(tw2.ang)*10,_ay+Math.sin(tw2.ang)*10);
          X.lineTo(_ax+Math.cos(_pA2)*8,_ay+Math.sin(_pA2)*8);
          X.lineTo(_ax-Math.cos(_pA2)*8,_ay-Math.sin(_pA2)*8);X.fill();}
      }else{const _twCx2=tw2.x+Math.cos(tw2.ang)*tw2.dist,_twCy2=tw2.y+Math.sin(tw2.ang)*tw2.dist;
        const _f4=Math.min(1,(tw2.maxT-tw2.t)/20);
        X.globalAlpha=.35*_f4;X.strokeStyle='#2266ff';X.lineWidth=tw2.thick;
        X.beginPath();X.moveTo(_twCx2+Math.cos(_pA2)*tw2.w/2,_twCy2+Math.sin(_pA2)*tw2.w/2);
        X.lineTo(_twCx2-Math.cos(_pA2)*tw2.w/2,_twCy2-Math.sin(_pA2)*tw2.w/2);X.stroke();
        X.globalAlpha=.7*_f4;X.strokeStyle='#88ccff';X.lineWidth=tw2.thick*.3;
        X.beginPath();X.moveTo(_twCx2+Math.cos(_pA2)*tw2.w/2,_twCy2+Math.sin(_pA2)*tw2.w/2);
        X.lineTo(_twCx2-Math.cos(_pA2)*tw2.w/2,_twCy2-Math.sin(_pA2)*tw2.w/2);X.stroke();}
    }X.globalAlpha=1;
  }
  // ══ 재단참 렌더 ══
  if(G._judgeCuts&&G._judgeCuts.length>0){
    for(let ji=0;ji<G._judgeCuts.length;ji++){
      const jc=G._judgeCuts[ji];const _jP=jc.t/jc.maxT;
      if(jc.t<jc.delay){
        // 전조: 보라색 원 점멸
        const _wp=jc.t/jc.delay;
        X.globalAlpha=_wp*.15;X.fillStyle='#cc00cc';X.beginPath();X.arc(jc.x,jc.y,jc.r,0,Math.PI*2);X.fill();
        X.globalAlpha=_wp*(.4+Math.sin(_now*.015)*.2);X.strokeStyle='#ff44ff';X.lineWidth=2;
        X.setLineDash(_D4_6);X.beginPath();X.arc(jc.x,jc.y,jc.r,0,Math.PI*2);X.stroke();X.setLineDash(_D0);
        // 십자 전조
        X.globalAlpha=_wp*.3;X.strokeStyle='#cc44ff';X.lineWidth=1;
        X.beginPath();X.moveTo(jc.x-jc.r,jc.y);X.lineTo(jc.x+jc.r,jc.y);X.stroke();
        X.beginPath();X.moveTo(jc.x,jc.y-jc.r);X.lineTo(jc.x,jc.y+jc.r);X.stroke();
      }else{
        // 칼바람 폭발 비주얼
        const _ap=(jc.t-jc.delay)/(jc.maxT-jc.delay);
        const _fade=_ap>.7?(1-(_ap-.7)/.3):1;
        // 난무 선 (방사형 칼날)
        X.globalAlpha=_fade*.6;X.strokeStyle='#ff44ff';X.lineWidth=2;
        for(let k=0;k<8;k++){
          const a=Math.PI*2*k/8+_now*.02;const ir=jc.r*.2;const or=jc.r*(0.6+_ap*.4);
          X.beginPath();X.moveTo(jc.x+Math.cos(a)*ir,jc.y+Math.sin(a)*ir);
          X.lineTo(jc.x+Math.cos(a)*or,jc.y+Math.sin(a)*or);X.stroke();
        }
        // 외곽 원
        X.globalAlpha=_fade*.4;X.strokeStyle='#cc00cc';X.lineWidth=3;
        X.beginPath();X.arc(jc.x,jc.y,jc.r*(.5+_ap*.5),0,Math.PI*2);X.stroke();
        // 중심 플래시
        X.globalAlpha=_fade*.2;X.fillStyle='#ff88ff';X.beginPath();X.arc(jc.x,jc.y,jc.r*.3*(1-_ap),0,Math.PI*2);X.fill();
      }
    }X.globalAlpha=1;
  }
  if(__hideSkillBoundary){X.stroke=__strokeBak;X.setLineDash=__dashBak;}
  // ══ 지옥기둥 렌더 ══
  if(G._pillars&&G._pillars.length>0){
    for(let pi=0;pi<G._pillars.length;pi++){
      const pl=G._pillars[pi];const _plCol=ELC[pl.el]||'#ff4400';
      const _plVis=pl._pillarSpike?0.2:1;
      if(pl.t<pl.delay){
        // 전조 원
        const _wp=pl.t/pl.delay;
        X.globalAlpha=_wp*.2*_plVis;X.fillStyle=_plCol;X.beginPath();X.arc(pl.x,pl.y,pl.r,0,Math.PI*2);X.fill();
        // 전조 경계선 제거 (경계선 숨김)
      }else{
        const _ap=(pl.t-pl.delay)/(pl.maxT-pl.delay);
        const _fade=_ap>.8?(1-(_ap-.8)/.2):Math.min(1,_ap*5);
        // 기둥 (수직선)
        const _plH=60+_fade*40;
        X.globalAlpha=_fade*.15*_plVis;X.fillStyle=_plCol;X.fillRect(pl.x-pl.r,pl.y-_plH,pl.r*2,_plH);
        X.globalAlpha=_fade*.4*_plVis;X.fillStyle=_plCol;X.fillRect(pl.x-pl.r*.5,pl.y-_plH*.8,pl.r,_plH*.8);
        // 바닥 글로우
        X.globalAlpha=_fade*.2*_plVis;X.beginPath();X.arc(pl.x,pl.y,pl.r*1.5,0,Math.PI*2);X.fill();
        // 상단 불꽃
        X.globalAlpha=_fade*.6*_plVis;X.fillStyle='#ffffff';X.beginPath();X.arc(pl.x,pl.y-_plH,pl.r*.4+Math.sin(_now*.03)*2,0,Math.PI*2);X.fill();
      }
    }X.globalAlpha=1;
  }
  // ══ 환영검 렌더 ══
  if(G._phantomSwords&&G._phantomSwords.length>0){
    for(let pi=0;pi<G._phantomSwords.length;pi++){
      const ps=G._phantomSwords[pi];
      if(ps.t<ps.delay){
        // 대기 중: 보스 주위 떠도는 검
        const _rem=ps.swords-ps.fired;
        for(let si=0;si<_rem;si++){
          const _sA=_now*.003+Math.PI*2*si/_rem;
          const _sR=30+Math.sin(_now*.005+si)*8;
          const _sx=ps.x+Math.cos(_sA)*_sR,_sy=ps.y+Math.sin(_sA)*_sR;
          X.globalAlpha=.6+Math.sin(_now*.01+si)*.2;X.strokeStyle=ps.col;X.lineWidth=2;
          X.beginPath();X.moveTo(_sx-Math.cos(_sA+.5)*8,_sy-Math.sin(_sA+.5)*8);
          X.lineTo(_sx+Math.cos(_sA+.5)*8,_sy+Math.sin(_sA+.5)*8);X.stroke();
          X.globalAlpha=.3;X.fillStyle=ps.col;X.beginPath();X.arc(_sx,_sy,3,0,Math.PI*2);X.fill();
        }
      }else{
        const _rem=ps.swords-ps.fired;
        for(let si=0;si<_rem;si++){
          const _sA=_now*.004+Math.PI*2*si/Math.max(1,_rem);
          const _sR=25+si*5;
          const _sx=ps.x+Math.cos(_sA)*_sR,_sy=ps.y+Math.sin(_sA)*_sR;
          X.globalAlpha=.5;X.strokeStyle=ps.col;X.lineWidth=2;
          X.beginPath();X.moveTo(_sx-6,_sy-6);X.lineTo(_sx+6,_sy+6);X.stroke();
        }
      }
    }X.globalAlpha=1;
  }
  // ══ 암흑영역 렌더 ══
  if(G._darkZones&&G._darkZones.length>0){
    for(let di=0;di<G._darkZones.length;di++){
      const dz=G._darkZones[di];const _dzP=dz.t/dz.maxT;
      const _dzFade=_dzP>.85?(1-(_dzP-.85)/.15):Math.min(1,_dzP*4);
      // 어둠 원 (스탬프 캐시 + fade=globalAlpha)
      X.globalAlpha=_dzFade;
      X.drawImage(_zoneGradStamp('dz',dz.r,_DZ_STOPS),dz.x-dz.r,dz.y-dz.r,dz.r*2,dz.r*2);
      X.globalAlpha=1;
      // 보라 테두리 맥동
      X.globalAlpha=_dzFade*(.3+Math.sin(_now*.008)*.15);X.strokeStyle='#6600aa';X.lineWidth=3;
      X.beginPath();X.arc(dz.x,dz.y,dz.r,0,Math.PI*2);X.stroke();
      // 내부 입자
      for(let k=0;k<4;k++){
        const _pa=_now*.002+Math.PI*2*k/4;const _pr=dz.r*(.3+Math.sin(_now*.003+k)*.2);
        X.globalAlpha=_dzFade*.4;X.fillStyle='#440066';
        X.beginPath();X.arc(dz.x+Math.cos(_pa)*_pr,dz.y+Math.sin(_pa)*_pr,5+Math.sin(_now*.005+k)*2,0,Math.PI*2);X.fill();
      }
    }X.globalAlpha=1;
  }
  // ══ 거울분신 렌더 ══
  if(G._mirrorClones&&G._mirrorClones.length>0){
    for(let mi=0;mi<G._mirrorClones.length;mi++){
      const mc=G._mirrorClones[mi];const _mcF=Math.min(1,mc.t/mc.delay);
      const _mcA=mc.t<mc.maxT*.85?(.3+_mcF*.3):(.3+_mcF*.3)*(1-(mc.t-mc.maxT*.85)/(mc.maxT*.15));
      X.globalAlpha=_mcA;X.fillStyle=mc.col||'#aa66ff';X.beginPath();X.arc(mc.x,mc.y,mc.r,0,Math.PI*2);X.fill();
      X.globalAlpha=_mcA*.6;X.strokeStyle='#cc88ff';X.lineWidth=2;X.beginPath();X.arc(mc.x,mc.y,mc.r+3,0,Math.PI*2);X.stroke();
      // 눈
      const _ex=mc.x+Math.cos(mc.facing)*mc.r*.4,_ey=mc.y+Math.sin(mc.facing)*mc.r*.4;
      X.globalAlpha=_mcA*.8;X.fillStyle='#ffffff';X.beginPath();X.arc(_ex,_ey,3,0,Math.PI*2);X.fill();
    }X.globalAlpha=1;
  }
  // ══ 균열 렌더 ══
  if(G._fissures&&G._fissures.length>0){
    for(let fi=0;fi<G._fissures.length;fi++){
       const fs2=G._fissures[fi];const _fCol=ELC[fs2.el]||'#ff4400';
       const _hx=fs2.x+Math.cos(fs2.ang)*fs2.len,_hy=fs2.y+Math.sin(fs2.ang)*fs2.len;
       if(fs2.druid){
         // 판정 폭 140과 종착 폭발 반경을 시각적으로 유지하는 흙 균열 + 뿌리 결.
         const ca=Math.cos(fs2.ang),sa=Math.sin(fs2.ang),px=-sa,py=ca;
         X.save();X.lineCap='round';X.lineJoin='round';
         for(let layer=0;layer<3;layer++){
           X.globalAlpha=[.31,.56,.84][layer];X.strokeStyle=['#1c2418','#364327','#a5c568'][layer];
           X.lineWidth=[fs2.w,fs2.w*.56,Math.max(7,fs2.w*.09)][layer];X.beginPath();
           for(let k=0;k<=12;k++){const q=k/12,j=k===0||k===12?0:(Math.sin(k*2.7+fi)*5+Math.sin(k*5.1)*3);
             const x=fs2.x+ca*fs2.len*q+px*j,y=fs2.y+sa*fs2.len*q+py*j;
              if(k===0)X.moveTo(x,y);else X.lineTo(x,y);}
            __strokeBak.call(X);
         }
         X.strokeStyle='#8ca758';X.lineWidth=4;X.globalAlpha=.5;
          for(let k=2;k<12;k+=2){const q=k/12,side=k%4===0?1:-1;
            const bx=fs2.x+ca*fs2.len*q,by=fs2.y+sa*fs2.len*q;
             X.beginPath();X.moveTo(bx,by);X.lineTo(bx+px*side*fs2.w*.44+ca*25,by+py*side*fs2.w*.44+sa*25);__strokeBak.call(X);}
          X.globalAlpha=.48;X.fillStyle='#a8bd6d';X.beginPath();
          for(let k=1;k<=16;k++){const q=k/17,side=k%2?1:-1;
            const bx=fs2.x+ca*fs2.len*q+px*side*fs2.w*.34,by=fs2.y+sa*fs2.len*q+py*side*fs2.w*.34;
            X.moveTo(bx,by);X.lineTo(bx+ca*(8+k%4*4)+px*side*6,by+sa*(8+k%4*4)+py*side*6);
            X.lineTo(bx+ca*4-px*side*4,by+sa*4-py*side*4);X.closePath();}X.fill();
          if(fs2.exploded&&fs2._visExplAt==null)fs2._visExplAt=fs2.t;
          const _ep=fs2.exploded?Math.min(1,(fs2.t-fs2._visExplAt)/30):0;
          const _markR=fs2.exploded?fs2.explR*(1+_ep*.12):fs2.explR;
          _drawDruidGroundRing(X,_hx,_hy,_markR,fs2.exploded?(1-_ep)*.48:.32+Math.sin(_now*.018)*.035,fi*.69,.78);
          // 낮은 대비의 뿌리 테두리 조각으로 실제 폭발 경계만 또렷하게 표시한다.
          X.lineCap='round';X.lineWidth=Math.max(2,Math.min(4,_markR*.004));
          for(let seg=0;seg<18;seg++){
            const a0=seg*Math.PI/9+fi*.19,a1=a0+Math.PI/9*(.56+(seg%3)*.10);
            const rr=_markR*(.985+Math.sin(seg*2.7+fi)*.013);
            X.globalAlpha=(fs2.exploded?1-_ep:1)*(.24+(seg%4)*.045);
            X.strokeStyle=seg%5===0?'#a6b568':'#746d48';X.beginPath();
            X.arc(_hx,_hy,rr,a0,a1);__strokeBak.call(X);
          }
          X.restore();continue;
       }
       // 균열 선
      X.globalAlpha=.6;X.strokeStyle=_fCol;X.lineWidth=fs2.w;X.lineCap='round';
      X.beginPath();X.moveTo(fs2.x,fs2.y);X.lineTo(_hx,_hy);X.stroke();
      X.globalAlpha=.3;X.strokeStyle='#000000';X.lineWidth=fs2.w*.6;
      X.beginPath();X.moveTo(fs2.x,fs2.y);X.lineTo(_hx,_hy);X.stroke();
      // 끝점 경고
      if(!fs2.exploded){X.globalAlpha=.3+Math.sin(_now*.02)*.15;X.fillStyle=_fCol;
        X.beginPath();X.arc(_hx,_hy,fs2.explR*.3,0,Math.PI*2);X.fill();}
      else{const _eP=(fs2.t-fs2.maxT+40)/40;
        X.globalAlpha=(1-_eP)*.4;X.fillStyle=_fCol;X.beginPath();X.arc(_hx,_hy,fs2.explR*(1+_eP*.3),0,Math.PI*2);X.fill();}
    }X.globalAlpha=1;
  }
  // ══ 조류파 렌더 ══
  if(G._tideWaves&&G._tideWaves.length>0){
    for(let ti=0;ti<G._tideWaves.length;ti++){
       const tw=G._tideWaves[ti];const _twCol=ELC[tw.el]||'#4488ff';
       const _twFade=tw.t>tw.maxT*.8?(1-(tw.t-tw.maxT*.8)/(tw.maxT*.2)):1;
       if(tw.druid){
         // 안전 갭은 비워 두고, 전진하는 뿌리파를 흙층/줄기/발광맥 3층으로 렌더한다.
         const gs=tw.gapAng+tw.gapSize,ge=tw.gapAng-tw.gapSize+Math.PI*2;
         X.save();X.lineCap='round';X.lineJoin='round';
         for(let layer=0;layer<3;layer++){
           X.globalAlpha=_twFade*[.4,.65,.9][layer];X.strokeStyle=['#1b291d','#54783c','#b1ce6d'][layer];
           X.lineWidth=[tw.w,tw.w*.45,Math.max(5,tw.w*.1)][layer];X.beginPath();
           for(let k=0;k<=64;k++){const a=gs+(ge-gs)*k/64;
             const rr=tw.r+(k===0||k===64?0:Math.sin(k*2.3+ti)*4+Math.sin(k*5.7)*2);
             const x=tw.x+Math.cos(a)*rr,y=tw.y+Math.sin(a)*rr;
              if(k===0)X.moveTo(x,y);else X.lineTo(x,y);}
            __strokeBak.call(X);
         }
          X.strokeStyle='#8eaf5b';X.lineWidth=4;X.globalAlpha=_twFade*.65;
          for(let k=2;k<18;k++){const a=gs+(ge-gs)*k/18,rr=tw.r;
            X.beginPath();X.moveTo(tw.x+Math.cos(a)*rr,tw.y+Math.sin(a)*rr);
             X.lineTo(tw.x+Math.cos(a+.035)*(rr+tw.w*.55),tw.y+Math.sin(a+.035)*(rr+tw.w*.55));__strokeBak.call(X);}
          X.fillStyle='#d4e5a1';X.globalAlpha=_twFade*.46;X.beginPath();
          for(let k=1;k<13;k++){const a=gs+(ge-gs)*k/13,rr=tw.r+Math.sin(tw.t*.11+k*2.1)*tw.w*.18;
            const x=tw.x+Math.cos(a)*rr,y=tw.y+Math.sin(a)*rr;
            X.moveTo(x+Math.cos(a)*10,y+Math.sin(a)*10);
            X.lineTo(x+Math.cos(a+.36)*3,y+Math.sin(a+.36)*3);
            X.lineTo(x-Math.cos(a)*7,y-Math.sin(a)*7);X.closePath();}X.fill();
          X.globalAlpha=_twFade*.85;X.fillStyle='#b9d87b';
          for(const a of [gs,ge]){const x=tw.x+Math.cos(a)*tw.r,y=tw.y+Math.sin(a)*tw.r;
            X.beginPath();X.ellipse(x,y,tw.w*.22,tw.w*.12,a,0,Math.PI*2);X.fill();}
          X.restore();continue;
       }
       X.globalAlpha=_twFade*.4;X.strokeStyle=_twCol;X.lineWidth=tw.w;
      // 갭 있는 원 (arc로 그림)
      const _gS=tw.gapAng-tw.gapSize,_gE=tw.gapAng+tw.gapSize;
      X.beginPath();X.arc(tw.x,tw.y,tw.r,_gE,_gS+Math.PI*2);X.stroke();
      // 내부 글로우
      X.globalAlpha=_twFade*.15;X.lineWidth=tw.w*2;
      X.beginPath();X.arc(tw.x,tw.y,tw.r,_gE,_gS+Math.PI*2);X.stroke();
    }X.globalAlpha=1;
  }
  // ══ 추적지뢰 렌더 ══
  if(G._seekerMines&&G._seekerMines.length>0){
    for(let mi=0;mi<G._seekerMines.length;mi++){
      const sm=G._seekerMines[mi];const _armed=sm.t>sm.armT;
      // 2026-10-29 사용자 "모든지뢰는 어둠지뢰 저걸로 바꿔라 디자인을 일단": 추적지뢰(드루이드 포함)도 어둠 지뢰와 같은 진홍 결계진(_mineTrapWardSheet 왼쪽 칸). 판정·이동은 그대로, 외형만
      if(_mineTrapWardSheet.complete&&_mineTrapWardSheet.naturalWidth>0){const _sw=_mineTrapWardSheet.naturalWidth/2,_sh=_mineTrapWardSheet.naturalHeight,_sz=sm.r*2,_mp=.5+Math.sin(_now*.015)*.5;
        X.save();X.translate(sm.x,sm.y);X.rotate(_now*.00035);X.globalCompositeOperation='screen';X.globalAlpha=_armed?.78+_mp*.18:.46;
        X.drawImage(_mineTrapWardSheet,0,0,_sw,_sh,-_sz/2,-_sz/2,_sz,_sz);X.restore();X.globalAlpha=1;X.globalCompositeOperation='source-over';continue;}
      if(sm._druidMine){_drawDruidPoisonShot(sm,_armed?1:.65);continue;}
      const _pulse=_armed?(.6+Math.sin(_now*.015)*.4):.45;
      X.save();X.globalCompositeOperation='lighter';
      // 외곽 위험 글로우
      X.globalAlpha=_pulse*(_armed?.4:.28);X.fillStyle=_armed?'#ff2a00':'#ff5522';X.beginPath();X.arc(sm.x,sm.y,sm.r+12,0,Math.PI*2);X.fill();
      // 본체
      X.globalAlpha=_pulse*.75;X.fillStyle=_armed?'#ff3010':'#ff6a33';X.beginPath();X.arc(sm.x,sm.y,sm.r,0,Math.PI*2);X.fill();
      // 밝은 코어
      X.globalAlpha=_armed?.9:.6;X.fillStyle=_armed?'#ffaa66':'#ffcc99';X.beginPath();X.arc(sm.x,sm.y,sm.r*.45,0,Math.PI*2);X.fill();
      X.restore();
      // 경고 링
      X.globalAlpha=_pulse*.7;X.strokeStyle=_armed?'#ff3a00':'#ff7744';X.lineWidth=2.5;
      X.beginPath();X.arc(sm.x,sm.y,sm.r+4+(_armed?_pulse*3:0),0,Math.PI*2);X.stroke();
    }X.globalAlpha=1;
  }
  // ══ 되감기참 렌더 ══
  if(G._rewindMarks&&G._rewindMarks.length>0){
    for(let ri=0;ri<G._rewindMarks.length;ri++){
      const rw=G._rewindMarks[ri];const _rwP=Math.min(1,rw.t/rw.delay);
      if(!rw.hit){
        X.globalAlpha=_rwP*.15;X.fillStyle='#00ccff';X.beginPath();X.arc(rw.x,rw.y,rw.r,0,Math.PI*2);X.fill();
        X.globalAlpha=_rwP*(.4+Math.sin(_now*.012)*.2);X.strokeStyle='#00aaff';X.lineWidth=2;
        X.setLineDash(_D5_5);X.beginPath();X.arc(rw.x,rw.y,rw.r,0,Math.PI*2);X.stroke();X.setLineDash(_D0);
        // 시계 마크
        const _cA=_rwP*Math.PI*2;X.globalAlpha=_rwP*.6;X.strokeStyle='#66ddff';X.lineWidth=2;
        X.beginPath();X.moveTo(rw.x,rw.y);X.lineTo(rw.x+Math.cos(_cA-Math.PI/2)*rw.r*.4,rw.y+Math.sin(_cA-Math.PI/2)*rw.r*.4);X.stroke();
      }else{
        const _eP2=(rw.t-rw.delay)/40;
        X.globalAlpha=(1-_eP2)*.5;X.fillStyle='#00ccff';X.beginPath();X.arc(rw.x,rw.y,rw.r*(1+_eP2*.5),0,Math.PI*2);X.fill();
      }
    }X.globalAlpha=1;
  }
  // ══ 중력우물 렌더 ══
  if(G._gravityWells&&G._gravityWells.length>0){
    for(let gi=0;gi<G._gravityWells.length;gi++){
      const gw=G._gravityWells[gi];const _gwF=gw.t>gw.maxT*.8?(1-(gw.t-gw.maxT*.8)/(gw.maxT*.2)):Math.min(1,gw.t*3/gw.maxT);
      X.globalAlpha=_gwF;
      X.drawImage(_zoneGradStamp('gw',gw.r,_GW_STOPS),gw.x-gw.r,gw.y-gw.r,gw.r*2,gw.r*2);
      X.globalAlpha=1;
      // 소용돌이 선
      X.globalAlpha=_gwF*.4;X.strokeStyle='#6644ff';X.lineWidth=2;
      for(let k=0;k<3;k++){const _sA=_now*.005+Math.PI*2*k/3;
        X.beginPath();X.arc(gw.x,gw.y,gw.r*(.3+k*.2),_sA,_sA+Math.PI*1.2);X.stroke();}
      X.globalAlpha=_gwF*.6;X.fillStyle='#8866ff';X.beginPath();X.arc(gw.x,gw.y,8+Math.sin(_now*.008)*3,0,Math.PI*2);X.fill();
    }X.globalAlpha=1;
  }
  // ══ 벽밀기 렌더 ══
  if(G._wallPushes&&G._wallPushes.length>0){
    for(let wi=0;wi<G._wallPushes.length;wi++){
      const wp2=G._wallPushes[wi];const _wpF=Math.min(1,wp2.t*4/wp2.maxT)*(wp2.t>wp2.maxT*.7?(1-(wp2.t-wp2.maxT*.7)/(wp2.maxT*.3)):1);
      const _wpCx=wp2.x+Math.cos(wp2.ang)*wp2.dist,_wpCy=wp2.y+Math.sin(wp2.ang)*wp2.dist;
      const _wpPerp=wp2.ang+Math.PI/2;const hw=wp2.w/2;
      X.globalAlpha=_wpF*.7;X.strokeStyle='#ff8844';X.lineWidth=4;
      X.beginPath();X.moveTo(_wpCx+Math.cos(_wpPerp)*hw,_wpCy+Math.sin(_wpPerp)*hw);
      X.lineTo(_wpCx-Math.cos(_wpPerp)*hw,_wpCy-Math.sin(_wpPerp)*hw);X.stroke();
      X.globalAlpha=_wpF*.3;X.fillStyle='#ff6622';
      X.beginPath();X.moveTo(_wpCx+Math.cos(_wpPerp)*hw,_wpCy+Math.sin(_wpPerp)*hw);
      X.lineTo(_wpCx-Math.cos(_wpPerp)*hw,_wpCy-Math.sin(_wpPerp)*hw);
      X.lineTo(_wpCx-Math.cos(_wpPerp)*hw-Math.cos(wp2.ang)*20,_wpCy-Math.sin(_wpPerp)*hw-Math.sin(wp2.ang)*20);
      X.lineTo(_wpCx+Math.cos(_wpPerp)*hw-Math.cos(wp2.ang)*20,_wpCy+Math.sin(_wpPerp)*hw-Math.sin(wp2.ang)*20);
      X.closePath();X.fill();
    }X.globalAlpha=1;
  }
  // ══ [다크드루이드] 독립 orb 탄막 — 24셀/game time, 원본8셀 폴백 ══
  if(G._druidOrbs&&G._druidOrbs.length){
    const legacy=typeof _druidSheets!=='undefined'&&_druidSheets.orb&&_druidSheets.orb.ready?_druidSheets.orb.img:null;
    for(let oi=0;oi<G._druidOrbs.length;oi++){const o=G._druidOrbs[oi];
      if(_drawDruidOrbClip(X,o))continue;
      if(!legacy)continue;
      const cw=legacy.naturalWidth/4,ch=legacy.naturalHeight/2,fr=(~~(_now/70))%8,sx=(fr%4)*cw,sy=(~~(fr/4))*ch,R=o.r*2.4;
      X.drawImage(legacy,sx,sy,cw,ch,o.x-R,o.y-R,R*2,R*2);}
  }
  // ══ 독웅덩이 렌더 ══
  if(G._poisonPools&&G._poisonPools.length>0){
    for(let pi=0;pi<G._poisonPools.length;pi++){
      const pp=G._poisonPools[pi];const _ppF=pp.t>pp.maxT*.8?(1-(pp.t-pp.maxT*.8)/(pp.maxT*.2)):Math.min(1,pp.t*5/pp.maxT);
      // [다크드루이드] stage3 독장판 = 커스텀 8프레임 솟는 장판 아트
      const _dz=((G.stage===0||G.stage===3)&&typeof _druidSheets!=='undefined'&&_druidSheets.aoe&&_druidSheets.aoe.ready)?_druidSheets.aoe:null;
      if((G.stage===0||G.stage===3)&&_drawDruidPoolClip(X,pp,_ppF*.68))continue;
      if((G.stage===0||G.stage===3)&&_druidGroundRing.complete&&_druidGroundRing.naturalWidth){
        _drawDruidGroundRing(X,pp.x,pp.y,pp.r,_ppF*.68,pi*.81);continue;}
      if(_dz){const im=_dz.img,cw=im.naturalWidth/4,ch=im.naturalHeight/2,fr=Math.min(7,~~(pp.t/pp.maxT*8)),sx=(fr%4)*cw,sy=(~~(fr/4))*ch,R=pp.r*1.5;
        X.globalAlpha=_ppF*.25;X.drawImage(im,sx,sy,cw,ch,pp.x-R,pp.y-R,R*2,R*2);
        X.globalAlpha=_ppF*.55;X.fillStyle='#a9d76a';X.beginPath();X.arc(pp.x,pp.y,pp.r,0,Math.PI*2);X.arc(pp.x,pp.y,Math.max(0,pp.r-1.2),0,Math.PI*2,true);X.fill();X.globalAlpha=1;continue;}
      X.globalAlpha=_ppF;
      X.drawImage(_zoneGradStamp('pp',pp.r,_PP_STOPS),pp.x-pp.r,pp.y-pp.r,pp.r*2,pp.r*2);
      X.globalAlpha=1;
      // 독 거품
      X.globalAlpha=_ppF*.5;X.fillStyle='#66ff22';
      for(let k=0;k<3;k++){const bx=pp.x+Math.cos(_now*.003+k*2.1)*pp.r*.5,by=pp.y+Math.sin(_now*.004+k*1.7)*pp.r*.4;
        X.beginPath();X.arc(bx,by,2+Math.sin(_now*.01+k)*1.5,0,Math.PI*2);X.fill();}
    }X.globalAlpha=1;
  }
  // ══ 감옥 렌더 ══
  if(G._cageTraps&&G._cageTraps.length>0){
    for(let ci=0;ci<G._cageTraps.length;ci++){
      const ct=G._cageTraps[ci];const _ctF=ct.t<ct.warnT?ct.t/ct.warnT:ct.t>ct.maxT-30?(1-(ct.t-(ct.maxT-30))/30):1;
      if(ct.t<ct.warnT){// 경고 원
        X.globalAlpha=_ctF*.4;X.strokeStyle='#ff4444';X.lineWidth=2;X.setLineDash(_D5_5);
        X.beginPath();X.arc(ct.x,ct.y,ct.r,0,Math.PI*2);X.stroke();X.setLineDash(_D0);
      }else{// 가시 감옥
        const _ctSh=_VFX_SHEETS.boss_cageTrap;
        if(_ctSh&&_ctSh.img){
          const _ctRise=Math.min(1,(ct.t-ct.warnT)/36);
          const _ctExit=ct.t>ct.maxT-30?Math.min(1,(ct.t-(ct.maxT-30))/30):0;
          const _ctFr=_ctExit>0?Math.max(0,5-Math.min(5,~~(_ctExit*6))):Math.min(5,~~(_ctRise*6));
          const _ctSz=ct.r*3.35;
          X.save();X.globalAlpha=_ctF;
          X.drawImage(_ctSh.img,(_ctFr%3)*512,~~(_ctFr/3)*512,512,512,ct.x-_ctSz/2,ct.y-_ctSz*.54,_ctSz,_ctSz);
          X.restore();
        }else{// 스프라이트 로드 전 절차식 폴백
          X.globalAlpha=_ctF*.6;X.strokeStyle='#886644';X.lineWidth=3;
          X.beginPath();X.arc(ct.x,ct.y,ct.r,0,Math.PI*2);X.stroke();
          X.fillStyle='#aa6633';
          for(let k=0;k<12;k++){const a=Math.PI*2*k/12+_now*.002;
            const sx=ct.x+Math.cos(a)*ct.r,sy=ct.y+Math.sin(a)*ct.r;
            X.beginPath();X.moveTo(sx,sy);X.lineTo(sx+Math.cos(a)*8,sy+Math.sin(a)*8);
            X.lineTo(sx+Math.cos(a+.3)*4,sy+Math.sin(a+.3)*4);X.fill();}
        }
      }
    }X.globalAlpha=1;
  }
  // ══ 연쇄번개 렌더 ══
  if(G._chainLights&&G._chainLights.length>0){
    for(let li=0;li<G._chainLights.length;li++){
      const cl=G._chainLights[li];const _clF=Math.min(1,cl.t*4/cl.maxT)*(cl.t>cl.maxT*.7?(.3+Math.random()*.7):1);
      X.globalAlpha=_clF*.8;X.strokeStyle='#ffee44';X.lineWidth=3;
      let px=cl.pts[0]?cl.pts[0].x-30:0,py=cl.pts[0]?cl.pts[0].y-30:0;
      for(let k=0;k<=Math.min(cl.idx,cl.pts.length-1);k++){const cp=cl.pts[k];
        X.beginPath();X.moveTo(px,py);
        // 지그재그 번개
        const mx=(px+cp.x)/2+(Math.random()-.5)*20,my=(py+cp.y)/2+(Math.random()-.5)*20;
        X.lineTo(mx,my);X.lineTo(cp.x,cp.y);X.stroke();
        // 타격점 발광
        X.fillStyle=cp.hit?'rgba(255,100,100,.5)':'rgba(255,238,68,.6)';
        X.beginPath();X.arc(cp.x,cp.y,cl.r*.5,0,Math.PI*2);X.fill();
        px=cp.x;py=cp.y;}
    }X.globalAlpha=1;
  }
  // ══ 궤도탄 렌더 ══
  if(G._orbWeaves&&G._orbWeaves.length>0){
    for(let oi=0;oi<G._orbWeaves.length;oi++){
      const ow=G._orbWeaves[oi];const _owF=ow.t>ow.maxT*.85?(1-(ow.t-ow.maxT*.85)/(ow.maxT*.15)):Math.min(1,ow.t*4/ow.maxT);
      const ox=(ow.src&&ow.src.alive)?ow.src.x+Math.cos(ow.ang)*ow.r:ow._lx||0;
      const oy=(ow.src&&ow.src.alive)?ow.src.y+Math.sin(ow.ang)*ow.r:ow._ly||0;
      X.globalAlpha=_owF;
      X.drawImage(_rgStampC('orbW',ow.orbR,null,_RG_ORB),ox-ow.orbR,oy-ow.orbR,ow.orbR*2,ow.orbR*2);
      // 잔상
      X.globalAlpha=_owF*.3;X.fillStyle='#cc44cc';
      const tx=ox-Math.cos(ow.ang)*8,ty=oy-Math.sin(ow.ang)*8;
      X.beginPath();X.arc(tx,ty,ow.orbR*.6,0,Math.PI*2);X.fill();
    }X.globalAlpha=1;
  }
  // ══ 영혼속박 렌더 ══
  if(G._soulAnchors&&G._soulAnchors.length>0){
    for(let ai=0;ai<G._soulAnchors.length;ai++){
      const sa=G._soulAnchors[ai];const _saF=sa.t>sa.maxT*.8?(1-(sa.t-sa.maxT*.8)/(sa.maxT*.2)):Math.min(1,sa.t*3/sa.maxT);
      X.globalAlpha=_saF;
      X.drawImage(_rgStampC('soulA',sa.r,null,_RG_SOUL),sa.x-sa.r,sa.y-sa.r,sa.r*2,sa.r*2);
      // 사슬선
      if(dst(P.x,P.y,sa.x,sa.y)<sa.r*1.5){
        X.globalAlpha=_saF*.4;X.strokeStyle='#aa44cc';X.lineWidth=2;X.setLineDash(_D4_4);
        X.beginPath();X.moveTo(sa.x,sa.y);X.lineTo(P.x,P.y);X.stroke();X.setLineDash(_D0);}
      // 닻 아이콘
      X.globalAlpha=_saF*.6;X.fillStyle='#cc66ff';X.beginPath();X.arc(sa.x,sa.y,6,0,Math.PI*2);X.fill();
    }X.globalAlpha=1;
  }
  // ══ 분신 렌더 ══
  if(G._doppelgangers&&G._doppelgangers.length>0){
    for(let di=0;di<G._doppelgangers.length;di++){
      const dg=G._doppelgangers[di];const _dgF=dg.t>dg.maxT*.85?(1-(dg.t-dg.maxT*.85)/(dg.maxT*.15)):Math.min(1,dg.t*4/dg.maxT);
      X.globalAlpha=_dgF*.5;X.fillStyle='#444466';
      X.beginPath();X.arc(dg.x,dg.y,dg.r,0,Math.PI*2);X.fill();
      // 눈
      X.fillStyle='#ff2200';const ex1=dg.x+Math.cos(dg.ang)*dg.r*.3-4,ey1=dg.y+Math.sin(dg.ang)*dg.r*.3-2;
      X.beginPath();X.arc(ex1,ey1,2,0,Math.PI*2);X.fill();
      X.beginPath();X.arc(ex1+8,ey1,2,0,Math.PI*2);X.fill();
      // HP바
      const hpR=dg.hp/(dg.src?~~(dg.src.maxHp*.12):dg.hp);
      X.fillStyle='#222';X.fillRect(dg.x-15,dg.y-dg.r-8,30,4);
      X.fillStyle='#cc4444';X.fillRect(dg.x-15,dg.y-dg.r-8,30*Math.max(0,hpR),4);
    }X.globalAlpha=1;
  }
  // ══ 뇌전걸음 — 전기 기둥 이펙트 ══
  if(G._gwPillar){
    const gp=G._gwPillar;
    const prog=gp.t/gp.maxT;
    const fadeIn=Math.min(1,prog*6);
    const fadeOut=Math.max(0,1-prog);
    const alpha=fadeIn*fadeOut;
    const _gwR2=gp.r||200;
    X.save();
    // 전체화면 플래시 (초반)
    if(prog<0.2){
      X.restore();X.save();X.setTransform(1,0,0,1,0,0);
      X.globalAlpha=(1-prog/0.2)*0.5;X.fillStyle='#aaddff';
      X.fillRect(0,0,C.width,C.height);
      X.restore();X.save();_xWorld();
    }
    // 바닥 충격파 링
    X.globalAlpha=alpha*.6;X.strokeStyle='#44ddff';X.lineWidth=3+gp.stk*.1;
    X.beginPath();X.arc(gp.x,gp.y,_gwR2*prog*1.5,0,Math.PI*2);X.stroke();
    // 바닥 전기 원
    X.globalAlpha=alpha*.2;
    X.drawImage(_rgStampC('gwGround',_gwR2,null,_RG_GW),gp.x-_gwR2,gp.y-_gwR2,_gwR2*2,_gwR2*2);
    // 전기 기둥 (중앙에서 위로)
    const pilH=600+gp.stk*10;
    const pilW=50*(1-prog*0.3);
    const pgrd2=X.createLinearGradient(gp.x,gp.y-pilH,gp.x,gp.y);
    pgrd2.addColorStop(0,'rgba(255,255,255,0)');
    pgrd2.addColorStop(0.15,'rgba(136,221,255,'+alpha*.4+')');
    pgrd2.addColorStop(0.5,'rgba(68,170,255,'+alpha*.8+')');
    pgrd2.addColorStop(0.8,'rgba(100,200,255,'+alpha+')');
    pgrd2.addColorStop(1,'rgba(255,255,255,'+alpha+')');
    X.fillStyle=pgrd2;X.fillRect(gp.x-pilW/2,gp.y-pilH*fadeIn,pilW,pilH*fadeIn);
    // 기둥 글로우
    X.globalAlpha=alpha*.08;X.fillStyle='#44aaff';
    X.fillRect(gp.x-pilW*1.5,gp.y-pilH*fadeIn,pilW*3,pilH*fadeIn);
    // 전기 지그재그 (기둥 위에 번개줄)
    X.lineCap='round';
    for(let li=0;li<30;li++){
      const _ba=Math.PI*2*li/30;
      const _bd=Math.random()*_gwR2*.9;
      const _bx=gp.x+Math.cos(_ba)*_bd,_by=gp.y+Math.sin(_ba)*_bd;
      X.globalAlpha=alpha*(.4+Math.random()*.4);
      X.strokeStyle=li%3===0?'#ffffff':li%2===0?'#aaeeff':'#88ddff';
      X.lineWidth=1+Math.random()*1.5;
      X.beginPath();X.moveTo(_bx,_by);
      for(let sy=0;sy<pilH*fadeIn;sy+=18+Math.random()*10){
        X.lineTo(_bx+(Math.random()-.5)*30,_by-sy);
      }X.stroke();
    }X.lineCap='butt';
    // 상승 전기 파티클
    if(Math.random()>.4&&prog<0.7){
      const px2=gp.x+(Math.random()-.5)*pilW*2;
      poolPart(px2,gp.y,(Math.random()-.5)*3,-4-Math.random()*7,Math.random()>.5?'#88ddff':'#aaeeff',3+Math.random()*4,15+Math.random()*10);
    }
    // 라벨
    X.globalAlpha=alpha*.9;X.fillStyle='#44ddff';X.font='bold 18px "Noto Sans KR"';X.textAlign='center';
    X.fillText('⚡ '+_T('뇌전걸음')+' ⚡',gp.x,gp.y-pilH*fadeIn-12);
    X.restore();X.globalAlpha=1;
  }
  // ══ 레인라이트닝 — 번개 왕복 이펙트 ══
  if(G._gwLightning){
    const gl=G._gwLightning;
    const prog=gl.t/gl.maxT;
    const fadeOut=Math.max(0,1-prog);
    const allLines=[gl.pts,gl.ptsBack];
    const lCols=[['#ffffff','#88ddff','#44aaff'],['#ffee44','#ffaa22','#ff8800']];
    X.save();X.lineCap='round';
    for(let li=0;li<allLines.length;li++){
      const pts=allLines[li];if(!pts||pts.length<2)continue;
      const delay=li===0?0:0.15; // 복귀선은 약간 딜레이
      const lineP=Math.max(0,Math.min(1,(prog-delay)/(1-delay)*3));
      const drawEnd=Math.min(pts.length-1,~~(pts.length*lineP));
      if(drawEnd<1)continue;
      const cols=lCols[li];const offY=li*4;
      for(let pass=0;pass<3;pass++){
        X.globalAlpha=fadeOut*(pass===0?.7:pass===1?.3:.1);
        X.strokeStyle=cols[pass];
        X.lineWidth=pass===0?(3+gl.stk*.08):(pass===1?(8+gl.stk*.15):(22+gl.stk*.3));
        X.beginPath();X.moveTo(pts[0].x,pts[0].y+offY);
        for(let i=1;i<=drawEnd;i++){
          const jx=(Math.random()-.5)*(pass===0?14:5);
          const jy=(Math.random()-.5)*(pass===0?14:5);
          X.lineTo(pts[i].x+jx,pts[i].y+jy+offY);
        }
        X.stroke();
      }
      for(let i=0;i<=drawEnd;i++){
        if(Math.random()>.65)continue;
        X.globalAlpha=fadeOut*(.35+Math.random()*.3);
        X.strokeStyle=li===0?(Math.random()>.5?'#ffee44':'#88ddff'):(Math.random()>.5?'#ffcc00':'#ff8844');
        X.lineWidth=1+Math.random();
        const ba=Math.random()*Math.PI*2;const bl=12+Math.random()*25;
        X.beginPath();X.moveTo(pts[i].x,pts[i].y);
        X.lineTo(pts[i].x+Math.cos(ba)*bl+(Math.random()-.5)*8,pts[i].y+Math.sin(ba)*bl+(Math.random()-.5)*8);
        X.stroke();
      }
      const tip=pts[drawEnd];
      X.globalAlpha=fadeOut*.5;
      X.drawImage(_rgStampC(li===0?'tipB':'tipY',35,null,li===0?_RG_TIPB:_RG_TIPY),tip.x-35,tip.y-35,70,70);
    }
    X.lineCap='butt';X.restore();
    X.globalAlpha=1;
  }
  _dpS5=performance.now(); // S5=보스패턴30종 끝
    // ══ BLINK LAND — 블링크 착지 이펙트 ══
  if(P.s==='blinkLand'){
    const _blProg=1-P.st2/18; // 0→1 진행
    // 착지 충격파 링 (확장)
    const _blR=((wp().wRange||50)+(wp().bonusRange||0)*4)*2.6;
    X.globalAlpha=.4*(1-_blProg);X.strokeStyle='#aa66ff';X.lineWidth=3;
    X.beginPath();X.arc(P.x,P.y,_blR*_blProg,0,Math.PI*2);X.stroke();
    // 내부 마법 글로우
    X.globalAlpha=.5*(1-_blProg);X.fillStyle='#7744cc';
    X.beginPath();X.arc(P.x,P.y,_pR+20*(1-_blProg),0,Math.PI*2);X.fill();
    // 출발점→착지점 잔상 연결선
    if(P.blinkOx!==undefined){
      X.globalAlpha=.2*(1-_blProg);X.strokeStyle='#cc88ff';X.lineWidth=2;
      X.beginPath();X.moveTo(P.blinkOx,P.blinkOy);X.lineTo(P.x,P.y);X.stroke();
      // 출발점 잔상
      X.globalAlpha=.15*(1-_blProg);X.fillStyle='#8855cc';
      X.beginPath();X.arc(P.blinkOx,P.blinkOy,_pR,0,Math.PI*2);X.fill();
    }
    // 마법 파티클
    if(Math.random()>.4){
      const _bpa=Math.random()*Math.PI*2;const _bpr=Math.random()*_blR*_blProg;
      poolPart(P.x+Math.cos(_bpa)*_bpr,P.y+Math.sin(_bpa)*_bpr,(Math.random()-.5)*2,-1-Math.random()*2,Math.random()>.5?'#aa66ff':'#6644cc',2+Math.random()*3,10+Math.random()*8);
    }
    X.globalAlpha=1;
  }

  // ══ DIM BREACH LAND — 사슬이동:강화 착지 (뇌전걸음 기둥은 _gwPillar가 렌더) ══
  if(P.s==='dimBreachLand'){
    const _dbProg=1-P.st2/15;
    // 출발점 잔상 연결 (전기 스파크 선)
    if(P.blinkOx!==undefined){
      X.globalAlpha=.25*(1-_dbProg);X.strokeStyle='#44ddff';X.lineWidth=2;
      X.beginPath();X.moveTo(P.blinkOx,P.blinkOy);X.lineTo(P.x,P.y);X.stroke();
      X.globalAlpha=.12*(1-_dbProg);X.fillStyle='#44aaff';
      X.beginPath();X.arc(P.blinkOx,P.blinkOy,_pR,0,Math.PI*2);X.fill();
    }
    // 전기 파티클
    if(Math.random()>.4){
      const _dpa=Math.random()*Math.PI*2;const _dpr=Math.random()*80;
      poolPart(P.x+Math.cos(_dpa)*_dpr,P.y+Math.sin(_dpa)*_dpr,(Math.random()-.5)*3,-2-Math.random()*4,
        Math.random()>.5?'#88ddff':Math.random()>.3?'#ffffff':'#ffee44',2+Math.random()*3,8+Math.random()*8);
    }
    X.globalAlpha=1;
  }

  // ══ THUNDER BURST — 뇌전걸음 이펙트 (카운트 비례 스케일) ══
  if(P._gwActive){
    const _gwP=Math.min(1,(P._gwT||0)/300);
    const _gwC=P._gwCount||0;
    const _gwScale=1+_gwC*0.036; // 카운트당 +3.6% (50회=2.8배)
    const _gwPulse=.35+.2*Math.sin(_gwP*25);
    const _gwOraR=(_pR+25)*_gwScale;
    // 전기 오라 — fillRect 근사 (createRadialGradient 제거)
    X.save();
    X.globalAlpha=Math.min(.3,(_gwPulse+_gwC*0.01)*.4);
    X.fillStyle='rgba(60,160,255,1)';X.beginPath();X.arc(P.x,P.y,_gwOraR*.6,0,Math.PI*2);X.fill();
    X.globalAlpha=Math.min(.15,(_gwPulse+_gwC*0.01)*.2);
    X.fillStyle='rgba(30,100,220,1)';X.beginPath();X.arc(P.x,P.y,_gwOraR,0,Math.PI*2);X.fill();
    // 전기 스파크 링
    X.globalAlpha=.3+.15*Math.sin(_gwP*16)+_gwC*0.008;
    X.strokeStyle=_gwC>=35?'#ffffff':_gwC>=18?'#88ffff':'#44ddff';
    X.lineWidth=2+_gwC*0.09;
    X.beginPath();X.arc(P.x,P.y,(_pR+15)*_gwScale+Math.sin(_gwP*10)*6,0,Math.PI*2);X.stroke();
    // 번개 스파크 — 개수+길이 카운트 비례
    const _spkCnt=4+~~(_gwC*0.4);
    const _spkLen=(6+_gwC*1.2);
    X.strokeStyle=_gwC>=25?'#ffffff':'#88eeff';X.lineWidth=1.5+_gwC*0.05;X.globalAlpha=.4+.2*Math.sin(_gwP*30)+_gwC*0.006;
    for(let _si=0;_si<_spkCnt;_si++){
      const _sa=_gwP*15+_si*Math.PI*2/_spkCnt;
      const _sr=(_pR+8)*_gwScale+Math.sin(_gwP*20+_si)*10;
      const _sx=P.x+Math.cos(_sa)*_sr,_sy=P.y+Math.sin(_sa)*_sr;
      const _ex=_sx+Math.cos(_sa+.5)*(_spkLen+Math.random()*_spkLen),_ey=_sy+Math.sin(_sa+.5)*(_spkLen+Math.random()*_spkLen);
      X.beginPath();X.moveTo(_sx,_sy);X.lineTo(_ex,_ey);X.stroke();
    }
    // 카운트 표시 — 크고 굵게, 머리 위
    if(_gwC>0){
      const _cFS=Math.min(40,18+_gwC*0.7);
      X.globalAlpha=1;X.textAlign='center';
      X.font='bold '+~~(_cFS)+'px monospace';
      X.fillStyle=_gwC>=40?'#ffffff':_gwC>=25?'#ffdd44':_gwC>=10?'#88eeff':'#44ddff';
      X.strokeStyle='#000';X.lineWidth=3;
      const _gwCapHud=Math.min(50,(P.skills.ghostWalk||1)*5);
      X.strokeText(_gwC+'/'+_gwCapHud,P.x,P.y-_pR*_gwScale-20);
      X.fillText(_gwC+'/'+_gwCapHud,P.x,P.y-_pR*_gwScale-20);
      X.textAlign='left';
    }
    // 타이머
    const _gwSec=((300-(P._gwT||0))/60).toFixed(1);
    X.globalAlpha=.7;X.fillStyle='#44ccff';X.font='bold 12px monospace';X.textAlign='center';
    X.fillText(_gwSec+'s',P.x,P.y-_pR*_gwScale-6);X.textAlign='left';
    X.restore();X.globalAlpha=1;
  }

  // ══ ICE ORB — 얼음보주 vfx_ice_orb 스프라이트 ══
  if(P._ioActive){
    const _ioP=Math.min(1,(P._ioT||0)/180);
    const _ioLvScale=1+((P.skills.iceOrb||1)-1)*.1;
    const _ioR=(_pR+32+Math.sin(_ioP*Math.PI)*10)*_ioLvScale;
    const _ioSh=_VFX_SHEETS['ice_orb'];
    X.save();
    if(_ioSh&&_ioSh.img){
      // 생성: 물리 60틱(1초), 인접 프레임 보간. draw는 상태를 진행시키지 않는다.
      const _ioFloat=_iceOrbFormationFrame(P._ioT||0);
      const _ioFrm=Math.floor(_ioFloat),_ioMix=_ioFloat-_ioFrm;
      const _ioDraw=_ioR*6.6;
      for(let layer=0;layer<2;layer++){
        X.globalCompositeOperation=layer?'lighter':'source-over';
        const alpha=layer?.2+.12*Math.sin(_ioP*8):.85+.1*Math.sin(_ioP*6);
        for(let blend=0;blend<2;blend++){
          const weight=blend?_ioMix:1-_ioMix;if(weight<=0)continue;
          const frame=Math.min(8,_ioFrm+blend);
          X.globalAlpha=alpha*weight;
          X.drawImage(_ioSh.img,(frame%_ioSh.cols)*_ioSh.fw,Math.floor(frame/_ioSh.cols)*_ioSh.fh,_ioSh.fw,_ioSh.fh,P.x-_ioDraw/2,P.y-_ioDraw/2,_ioDraw,_ioDraw);
        }
      }
      X.globalCompositeOperation='source-over';
    } else {
      X.globalAlpha=.75;
      X.fillStyle='#66aacc';X.beginPath();X.arc(P.x,P.y,_ioR,0,Math.PI*2);X.fill();
    }
    const _ioSec=(Math.max(0,120-(P._ioT||0))/60).toFixed(1);
    X.globalAlpha=.9;X.fillStyle='#88ddff';X.font='bold 13px monospace';X.textAlign='center';
    X.fillText(_ioSec+'s',P.x,P.y-_ioR-10);
    X.restore();X.globalAlpha=1;
  }

  // ══ 차징 검격 (sDraw/kiGather 응축) — API 룬 아크로 처내기 범위만 표시 ══
  // 릴리즈 비주얼은 진짜 sBash(+_sBashChgMul 배율) — 아크/모션/진동파 전부 기본 E 경로가 배율로 확장 처리
  if((P.s==='sDraw'||P.s==='kiGather')&&P.hp>0){
    const _kgFrm=G.frame||0;
    const _kgT2=P._kgTier||0;
    // 현재 연속 배율 (릴리즈와 동일 공식): 미리보기 반경에 사용
    const _kgTs=P.s==='sDraw'?0:Math.min(3,(P._kgChg||0)/60);
    const _kgMulNow=Math.min(3,1+0.5*Math.min(_kgTs,2)+Math.max(0,_kgTs-2));
    const _kgPvR=_eSwingRadius(_kgMulNow);
    _drawSilvertailChargeRange(X,P.x,P.y,_kgPvR,P.facing,_kgT2,_kgFrm);
  }

  // ══ WHIRLWIND — 회전참 이펙트 ══
  if(P.s==='whirlwind'){
    const _wa=P.wwAng||0;
    const _wwFusedV=P.skills.detonate&&_isFused('whirlDet');
    const _wwBankV=_wwFusedV?Math.min(1,(P.parryBank||0)/500):0;
    const _wwGrowV=Math.min(1,_wa/63)+_wwBankV;
    const _wwLvV=P.skills.whirlwind||1;
    const _wwBaseR=((wp().wRange||50)+(wp().bonusRange||0)*4)*1.3+(_wwLvV-1)*11;
    const _wwMaxV=200+(_wwLvV-1)*15; // 타격과 동일: 1렙200, 10렙335
    const _wwR=100+(_wwMaxV-100)*Math.min(1,_wwGrowV);
    const _wc=ELC[wp().el]||'#ffcc44';

    // ── 대검 스프라이트 회전 + 모션블러 ──
    {
      const _blR=_wwR*1.05;
      X.save();X.translate(P.x,P.y);
      // 모션블러 부채꼴 (뒤로 페이드)
      const _steps=12;
      const _span=Math.PI*(1.8+_wwGrowV*.15);
      const _step=_span/_steps;
      for(let i=0;i<_steps;i++){
        const t=i/_steps;
        X.globalAlpha=(.18+_wwGrowV*.06)*Math.pow(1-t,2);
        X.fillStyle='#000';
        X.beginPath();X.moveTo(0,0);
        X.arc(0,0,_blR,_wa-i*_step,_wa-(i+1)*_step,true);
        X.closePath();X.fill();
      }
      // 대검 스프라이트 (현재 각도에 회전)
      if(_wwBladeReady&&_wwBladeImg.complete){
        const _bAspect=_wwBladeImg.naturalWidth/_wwBladeImg.naturalHeight;
        const _bH=28+_wwGrowV*8; // 검 높이
        const _bW=_bH*_bAspect; // 비율 유지
        // 잔상 3개
        for(let _gi=3;_gi>=1;_gi--){
          const _gA=_wa-_gi*0.25;
          X.save();X.rotate(_gA);
          X.globalAlpha=(.3-_gi*.08);
          X.drawImage(_wwBladeImg,-_bW*.15,-_bH/2,_bW,_bH);
          X.restore();
        }
        // 메인 대검
        X.save();X.rotate(_wa);
        X.globalAlpha=.9;
        X.drawImage(_wwBladeImg,-_bW*.15,-_bH/2,_bW,_bH);
        X.restore();
      }
      X.restore();
    }
    X.globalAlpha=1; // 모션블러 후 알파 리셋
    // 합성 회전기폭: DMG 수치 + 충전바만 표시 (시야 확보)
    if(P.skills.detonate){
      const _pt=P.parryT||0;const _pb=P.parryBank||0;
      if(_pb>0){
        X.globalAlpha=.7;X.fillStyle='#ff8844';X.font='bold 12px monospace';X.textAlign='center';
        X.fillText(_pb+'',P.x,P.y+P.r+18);
        const _cBars=Math.min(3,1+~~(_pt/60));
        for(let _bi=0;_bi<3;_bi++){
          const _bx=P.x-12+_bi*10,_by=P.y+P.r+22;
          X.globalAlpha=.5;X.fillStyle=_bi<_cBars?(_cBars>=3?'#ff2200':_cBars>=2?'#ffaa00':'#ff6600'):'#333';
          X.fillRect(_bx,_by,8,5);X.strokeStyle='#000';X.lineWidth=1;X.strokeRect(_bx,_by,8,5);
        }
        X.textAlign='left';
      }
    }
    // ═══ 암전나선 렌더: 멸살광선 스타일 (글로우+메인+코어 3패스 + 끝점 글로우 + 파티클) ═══
    if(_isFused('stormBeam')&&P._sbPtsCnt&&P._sbPts){
      const _sbElCols=['#050505','#080808','#0a0a0a','#060606','#070707','#090909']; // 블랙
      for(let _bi=0;_bi<6;_bi++){
        const _cnt=P._sbPtsCnt[_bi];if(_cnt<2)continue;
        const _pts=P._sbPts[_bi];
        const _ec=_sbElCols[_bi];
        // 외곽 글로우 (넓고 투명)
        X.globalAlpha=.25;X.strokeStyle=_ec;X.lineWidth=10;
        X.beginPath();X.moveTo(_pts[0],_pts[1]);
        for(let _si=1;_si<_cnt;_si++)X.lineTo(_pts[_si*2],_pts[_si*2+1]);
        X.stroke();
        // 메인 번개 (색상)
        X.globalAlpha=.8;X.strokeStyle=_ec;X.lineWidth=3;
        X.beginPath();X.moveTo(_pts[0],_pts[1]);
        for(let _si=1;_si<_cnt;_si++)X.lineTo(_pts[_si*2],_pts[_si*2+1]);
        X.stroke();
        // 블랙 코어
        X.globalAlpha=.9;X.strokeStyle='#080808';X.lineWidth=1.2;
        X.beginPath();X.moveTo(_pts[0],_pts[1]);
        for(let _si=1;_si<_cnt;_si++)X.lineTo(_pts[_si*2],_pts[_si*2+1]);
        X.stroke();
        // 끝점 글로우
        const _ex=_pts[(_cnt-1)*2],_ey=_pts[(_cnt-1)*2+1];
        X.globalAlpha=.6;X.fillStyle=_ec;X.beginPath();X.arc(_ex,_ey,8,0,Math.PI*2);X.fill();
        X.globalAlpha=.12;X.fillStyle=_ec;X.beginPath();X.arc(_ex,_ey,18,0,Math.PI*2);X.fill();
        // 파티클
        if(Math.random()>.7){const _ri2=Math.min(~~((_cnt/2)*Math.random())*2,Math.max(0,(_cnt-1)*2));
          poolPart(_pts[_ri2],_pts[_ri2+1],(Math.random()-.5)*3,(Math.random()-.5)*3,_ec,2+Math.random()*2,5+Math.random()*5)}
      }
    }
    X.globalAlpha=1;
  }

  // ══ 회전참 잔상 (이동 시 반투명 스프라이트 복사) ══
  if(P.s==='whirlwind'&&OPT.trail&&P._wwTr&&P._wwTrN>0){
    const _trN=P._wwTrN,_trH=P._wwTrH;
    const _wc2=ELC[wp().el]||'#ffcc44';
    for(let _gi=_trN;_gi>=1;_gi--){
      const _idx=((_trH-_gi+5)%5)*2;
      const _gx=P._wwTr[_idx],_gy=P._wwTr[_idx+1];
      const _gDx=_gx-P.x,_gDy=_gy-P.y;
      if(_gDx*_gDx+_gDy*_gDy<9)continue; // 3px 미만 스킵
      const _gAlpha=(.55-_gi*0.09);
      if(_gAlpha<=0)continue;
      if(_atlasPReady&&P._sa){
        const _apDir2=_facingDir8(P.facing);
        const _apHD2=!!P._sa.fm[P._sa.anim+'_'+_apDir2];
        const _pFlip2=!_apHD2&&Math.abs(P.facing)>Math.PI/2;
        X.save();X.translate(_gx,_gy);X.scale(_pScale,_pScale);
        X.globalAlpha=_gAlpha;
        SpriteAnimator.draw(P._sa,X,0,0,_pFlip2,_apHD2?_apDir2:null);
        X.restore();
      }else if(_playerReady){
        const _bw2=32*_pScale,_bh2=38*_pScale;
        X.save();X.translate(_gx,_gy);X.globalAlpha=_gAlpha;
        if(Math.abs(P.facing)>Math.PI/2)X.scale(-1,1);
        X.scale(.95,.95);
        if(_pS)X.drawImage(_pS,0,0,_pS.width/2,_pS.height,-_bw2/2,-_bh2/2-2,_bw2,_bh2);
        X.restore();
      }else{
        // 프로시저럴 폴백: 반투명 원
        X.save();X.globalAlpha=_gAlpha;X.fillStyle=_wc2;
        X.beginPath();X.arc(_gx,_gy,P.r*.9,0,Math.PI*2);X.fill();X.restore();
      }
    }
    X.globalAlpha=1;
  }


  _drawEnemyShotWarnings();_drawPhysicalBites();_renderBloodSplats(X,G.cam);

}finally{X=previous;}};

window._Web3DDrawNativeProjectile=function(ctx,projectile,friendly){const previous=X;X=ctx;try{const projs=[projectile],pProjs=[projectile],_visProjs=[0],_vl=-Infinity,_vr=Infinity,_vt=-Infinity,_vb=Infinity,_PP_DRAW_MAX=9999;let _ppDrawN=0;if(friendly){for(let _ppi3=0;_ppi3<pProjs.length;_ppi3++){const p=pProjs[_ppi3];
    if(p.x<_vl-20||p.x>_vr+20||p.y<_vt-20||p.y>_vb+20)continue;
    if(++_ppDrawN>_PP_DRAW_MAX)break;
    
    const ang=Math.atan2(p.vy,p.vx);const ac=p.plagueBlade?'#cc0033':(ELC[p.el]||'#fff');const ag=p.plagueBlade?'#880022':(ELG2[p.el]||'#fff');
    const fa=Math.min(1,1-p.dist/p.maxDist*.3);
    if(p.normalBow&&_bowArrowReady){
      // ── 석궁 화살: 속성별 미리 틴트된 캔버스 사용 ──
      const _tSrc=_bowTinted[p.el||0]||_bowArrowImg;
      const _aw=_tSrc.width,_ah=_tSrc.height;
      X.save();X.translate(p.x,p.y);X.rotate(ang);
      X.globalAlpha=p.ghostXbow?fa*.6:fa;
      X.drawImage(_tSrc,-_aw/2,-_ah/2,_aw,_ah);
      X.restore();X.globalAlpha=1;
    }else if(p.fireBeamProj){
      // ── 업화선: 화염빔 투사체 스프라이트 ──
      if(_fbSReady){
        const _fbFi=~~(_now*.15+p.x*.05)%_FB_FRAMES;
        const _fbAng=Math.atan2(p.vy,p.vx);
        const _fbW=80,_fbH=35; // 투사체 크기 (30% 축소)
        X.save();X.translate(p.x,p.y);X.rotate(_fbAng);
        X.globalAlpha=fa;
        X.drawImage(_FB_IMG,_fbFi*_FB_FW,0,_FB_FW,_FB_FH,-_fbW*.6,-_fbH/2,_fbW,_fbH);
        X.globalCompositeOperation='lighter';X.globalAlpha=fa*.5;
        X.drawImage(_FB_IMG,_fbFi*_FB_FW,0,_FB_FW,_FB_FH,-_fbW*.6,-_fbH/2,_fbW,_fbH);
        X.restore();
      }else{
        X.globalAlpha=fa;X.fillStyle='#ff4400';X.beginPath();X.arc(p.x,p.y,p.r,0,Math.PI*2);X.fill();
      }
      // 꼬리 파티클
      if(Math.random()>.4)poolPart(p.x-p.vx*2+(Math.random()-.5)*8,p.y-p.vy*2+(Math.random()-.5)*8,(Math.random()-.5)*2,(Math.random()-.5)*2,Math.random()>.5?'#ff6600':'#ffaa00',2+Math.random()*2,6+Math.random()*4);
      X.globalAlpha=1;continue;
    }else if(p.fireball){
      // ── 악의구: 마법 오브 스프라이트 ──
      if(_charIdx===1&&_silvMaliceOrbReady){
        const _smSz=p.r*6.2;
        const _smFrame=Math.floor(_now/_SILV_MALICE_ORB_FRAME_MS)%6;
        const _smRect=_SILV_MALICE_ORB_RECTS[_smFrame],_smFS=_SILV_MALICE_ORB_FRAME_SIZE;
        X.save();X.translate(p.x,p.y);X.rotate(_now*Math.PI*2/_SILV_MALICE_ORB_SPIN_MS-_SILV_MALICE_ORB_POSE_DEG[_smFrame]*Math.PI/180);
        X.globalAlpha=fa;
        X.drawImage(_silvMaliceOrbSurface||_silvMaliceOrbImg,_smRect[0],_smRect[1],_smFS,_smFS,-_smSz/2,-_smSz/2,_smSz,_smSz);
        X.globalCompositeOperation='lighter';X.globalAlpha=fa*.18;
        X.drawImage(_silvMaliceOrbSurface||_silvMaliceOrbImg,_smRect[0],_smRect[1],_smFS,_smFS,-_smSz*.54,-_smSz*.54,_smSz*1.08,_smSz*1.08);
        X.restore();X.globalAlpha=1;
      }else if(_moReady){
        const _moFi=~~(_now*.12+p.x*.1)%_MO_FRAMES;
        const _moC=_moFi%_MO_COLS,_moR=~~(_moFi/_MO_COLS);
        const _moSz=p.r*5;
        X.save();X.translate(p.x,p.y);
        X.globalCompositeOperation='lighter';X.globalAlpha=fa*.85;
        X.drawImage(_MO_IMG,_moC*_MO_CW,_moR*_MO_CH,_MO_CW,_MO_CH,-_moSz/2,-_moSz/2,_moSz,_moSz);
        X.restore();X.globalAlpha=1;
      }else{
        X.globalAlpha=fa*.9;X.fillStyle='#bb44ff';
        X.beginPath();X.arc(p.x,p.y,p.r*1.5,0,Math.PI*2);X.fill();X.globalAlpha=1;
      }
    }else if(p.blueBean){
      // ── 파란콩: 간소화 (12→3 draw calls) ──
      const _bb=3.5;
      // 글로우 + 코어 (2 calls)
      X.globalAlpha=fa*.15;X.fillStyle='#00ccff';
      X.beginPath();X.arc(p.x,p.y,_bb*2.5,0,Math.PI*2);X.fill();
      X.globalAlpha=fa*.85;X.fillStyle='#00aadd';
      X.beginPath();X.arc(p.x,p.y,_bb,0,Math.PI*2);X.fill();
      // 트레일 (1 call)
      X.globalAlpha=fa*.2;X.strokeStyle='#00bbee';X.lineWidth=_bb*1.2;
      X.beginPath();X.moveTo(p.x,p.y);X.lineTo(p.x-p.vx*5,p.y-p.vy*5);X.stroke();
      X.globalAlpha=1;
    }else if(p._parryMagicShot){
      // ── 대형탄 패링 분열체: 기존 일반 마법탄의 혜성 시트 재사용 ──
      const _pmLen=_normalMagicCometLength(4)*2;
      if(!_drawCometBullet(p.x,p.y,_pmLen,ang,fa,_now/80,p.el)){
        X.save();X.translate(p.x,p.y);X.rotate(ang);X.globalAlpha=fa;
        X.fillStyle=ac;X.beginPath();X.moveTo(17,0);X.lineTo(-9,-5);X.lineTo(-15,0);X.lineTo(-9,5);X.closePath();X.fill();
        X.globalAlpha=fa*.9;X.fillStyle='#ffffff';X.beginPath();X.arc(10,0,2.5,0,Math.PI*2);X.fill();
        X.restore();X.globalAlpha=1;
      }
    }else if(p.arcMissile){
      // ── 6원소 유도탄: 미사일형 곡선 투사체 ──
      X.save();X.translate(p.x,p.y);X.rotate(ang);
      const _amR=p.r,_amP=.7+Math.sin(_now/50+p.x*.3)*.3;
      // 꼬리 화염
      X.globalAlpha=fa*.2*_amP;X.fillStyle=ac;
      X.beginPath();X.moveTo(_amR*.4,0);X.quadraticCurveTo(-_amR*.3,-_amR*.8,-_amR*2.5,0);X.quadraticCurveTo(-_amR*.3,_amR*.8,_amR*.4,0);X.fill();
      // 본체
      X.globalAlpha=fa*.8;X.fillStyle=ac;
      X.beginPath();X.arc(0,0,_amR,0,Math.PI*2);X.fill();
      // 코어 하이라이트
      X.globalAlpha=fa*.9;X.fillStyle='#fff';
      X.beginPath();X.arc(_amR*.2,0,_amR*.45,0,Math.PI*2);X.fill();
      X.restore();X.globalAlpha=1;
    }else if(p.magic&&p.chainMax&&!p.ltnChaser){
      // ── 체인 라이트닝: 뾰족 꼬불 레이저 (프리얼로케이션) ──
      const _lAng=Math.atan2(p.vy,p.vx);
      const _stk=p._gwStk||0;
      const _lLen=24+_stk*6;
      const _perpA=_lAng+Math.PI/2;
      const _segs=10;
      const _cpx=_perpA>0?Math.cos(_perpA):Math.cos(_perpA),_cpy=Math.sin(_perpA);
      // 꼬불거림 → 프리얼로케이션 정적 배열에 기록 (GC 제거)
      for(let s=0;s<=_segs;s++){
        const f=s/_segs;
        const wob=Math.sin(s*1.7+_now*.012+p.x*.1)*3*(1+_stk*.04);
        _clBufX[s]=p.x-Math.cos(_lAng)*_lLen*f+_cpx*wob;
        _clBufY[s]=p.y-Math.sin(_lAng)*_lLen*f+_cpy*wob;
        _clBufT[s]=Math.sin(f*Math.PI);
      }
      const _gwMax=7+_stk*.2;
      // 외곽 글로우 (방추형 폴리곤)
      X.globalAlpha=fa*.12;X.fillStyle='#ffdd00';
      X.beginPath();
      for(let s=0;s<=_segs;s++){const w=_clBufT[s]*_gwMax*1.8;
        X[s?'lineTo':'moveTo'](_clBufX[s]+_cpx*w,_clBufY[s]+_cpy*w)}
      for(let s=_segs;s>=0;s--){const w=_clBufT[s]*_gwMax*1.8;
        X.lineTo(_clBufX[s]-_cpx*w,_clBufY[s]-_cpy*w)}
      X.closePath();X.fill();
      // 메인 빔 (방추형 폴리곤, 노란색)
      X.globalAlpha=fa*.8;X.fillStyle='#ffee44';
      X.beginPath();
      for(let s=0;s<=_segs;s++){const w=_clBufT[s]*_gwMax;
        X[s?'lineTo':'moveTo'](_clBufX[s]+_cpx*w,_clBufY[s]+_cpy*w)}
      for(let s=_segs;s>=0;s--){const w=_clBufT[s]*_gwMax;
        X.lineTo(_clBufX[s]-_cpx*w,_clBufY[s]-_cpy*w)}
      X.closePath();X.fill();
      // 백색 코어 (가는 방추)
      X.globalAlpha=fa;X.fillStyle='#ffffee';
      X.beginPath();
      for(let s=0;s<=_segs;s++){const w=_clBufT[s]*_gwMax*.35;
        X[s?'lineTo':'moveTo'](_clBufX[s]+_cpx*w,_clBufY[s]+_cpy*w)}
      for(let s=_segs;s>=0;s--){const w=_clBufT[s]*_gwMax*.35;
        X.lineTo(_clBufX[s]-_cpx*w,_clBufY[s]-_cpy*w)}
      X.closePath();X.fill();
      // 선단 빛점
      X.globalAlpha=fa*.3;X.fillStyle='#ffdd00';X.beginPath();X.arc(p.x,p.y,3+Math.sin(_now*.06),0,Math.PI*2);X.fill();
      X.globalAlpha=fa*.3;X.fillStyle='#ffee66';X.beginPath();X.arc(_clBufX[_segs],_clBufY[_segs],2+Math.sin(_now*.08),0,Math.PI*2);X.fill();
    }else if(p.magic){
      // ── MAGIC PROJECTILE — element-specific visuals ──
      const mt=_now;const me=p.el;
      // PNG 스프라이트 시도: 샤드(fire/dark/holy) 또는 볼트(전속성)
      let _pSprD=false;
      if(!p.bladeOrb&&!p.bladeShard&&!p.mhBlade&&!p.iceBlade&&!p.plagueBlade){
        const _mSz=p.r*2+12;
        _pSprD=_drawShardSprite(p.x,p.y,me,_mSz,ang,fa)||_drawBoltSprite(p.x,p.y,me,_mSz,ang,fa);
        if(_pSprD){
          X.globalAlpha=fa*.08;X.fillStyle=ac;X.beginPath();X.arc(p.x,p.y,_mSz*.4,0,Math.PI*2);X.fill();
          X.globalAlpha=1;
          if(Math.random()>.7)poolPart(p.x+(Math.random()-.5)*6,p.y+(Math.random()-.5)*6,-p.vx*.2+(Math.random()-.5),-p.vy*.2+(Math.random()-.5),ELP[p.el]||ac,2+Math.random()*2,5+Math.random()*4);
        }
      }
      if(!_pSprD){
      X.save();X.translate(p.x,p.y);
      if(me===1){// ── FIRE: blazing fireball ──
        const fr=p.r+Math.sin(mt/40)*1.5;
        X.globalAlpha=fa*.02;X.fillStyle='#ff4400';X.beginPath();X.arc(0,0,Math.min(fr*.5+1,4),0,Math.PI*2);X.fill();
        X.globalAlpha=fa*.2;X.fillStyle='#ff6600';X.beginPath();X.arc(0,0,fr*.7,0,Math.PI*2);X.fill();
        X.globalAlpha=fa*.5;X.fillStyle='#ffaa22';X.beginPath();X.arc(0,0,fr*.5,0,Math.PI*2);X.fill();
        X.globalAlpha=fa*.3;X.fillStyle='#ffee88';X.beginPath();X.arc(0,0,fr*.2,0,Math.PI*2);X.fill();
        if(Math.random()>.55)poolPart(p.x+(Math.random()-.5)*6,p.y+(Math.random()-.5)*6,-p.vx*.3+(Math.random()-.5)*2,-p.vy*.3+(Math.random()-.5)*2,'#ff6600',2+Math.random()*3,6+Math.random()*4);
      }else if(me===2){// ── ICE: crystalline shard ──
        X.globalAlpha=fa*.015;X.fillStyle='#44ddff';X.beginPath();X.arc(0,0,Math.min((p.r+2)*.5,4),0,Math.PI*2);X.fill();
        X.rotate(ang);
        X.globalAlpha=fa*.8;X.fillStyle='#88eeff';
        X.beginPath();X.moveTo(p.r+4,0);X.lineTo(0,-p.r*.7);X.lineTo(-p.r-2,0);X.lineTo(0,p.r*.7);X.closePath();X.fill();
        X.globalAlpha=fa;X.fillStyle='#ccffff';
        X.beginPath();X.moveTo(p.r+2,0);X.lineTo(0,-p.r*.35);X.lineTo(-p.r,0);X.lineTo(0,p.r*.35);X.closePath();X.fill();
        if(Math.random()>.6)poolPart(p.x+(Math.random()-.5)*8,p.y+(Math.random()-.5)*8,(Math.random()-.5),(Math.random()-.5),'#aaeeff',1+Math.random()*2,8+Math.random()*6);
      }else if(p.venomBlade){// ── VENOM SNAKE: 독사 — 녹색 독 바늘 ──
        X.rotate(ang);
        const _vPulse=.85+Math.sin(_now/60+p.x*.2)*.15;
        X.globalAlpha=fa*.9*_vPulse;X.fillStyle='#22cc44';
        X.beginPath();X.moveTo(22,0);X.lineTo(1,-2);X.lineTo(-8,0);X.lineTo(1,2);X.closePath();X.fill();
        X.globalAlpha=fa*.4;X.fillStyle='#88ff44';
        X.beginPath();X.moveTo(18,0);X.lineTo(2,-1);X.lineTo(-4,0);X.lineTo(2,1);X.closePath();X.fill();
        X.globalAlpha=fa*.25;X.strokeStyle='#aaffaa';X.lineWidth=.8;
        X.beginPath();X.moveTo(-6,0);X.lineTo(20,0);X.stroke();
        if(p._trail&&p._trLen>0){
          const _cs=Math.cos(-ang),_sn=Math.sin(-ang);
          for(let ti=0;ti<p._trLen;ti++){
            const _tt=p._trail[(p._trH-1-ti+p._trail.length)%p._trail.length];
            const _tf=1-ti/p._trLen,_ts=_tf*.4;
            const _dx=_tt.x-p.x,_dy=_tt.y-p.y;
            const _lx=_dx*_cs-_dy*_sn,_ly=_dx*_sn+_dy*_cs;
            X.globalAlpha=fa*_tf*.2;X.fillStyle='#44dd44';
            X.beginPath();X.moveTo(_lx+8*_ts,_ly);X.lineTo(_lx-5*_ts,_ly-1*_ts);X.lineTo(_lx-5*_ts,_ly+1*_ts);X.closePath();X.fill();
          }
        }
      }else if(p.ltnChaser){// ── LIGHTNING BOLT: 뇌전추격자 체인라이트닝 스타일 ──
        X.rotate(ang);
        const _lcPulse=.7+Math.sin(_now/25+p.x*.5)*.3;
        // ── 지그재그 번개 볼트 (워크래프트 체인라이트닝) ──
        const _lcSegs=6,_lcLen=56,_lcSegL=_lcLen/_lcSegs;
        // 외곽 글로우 (넓은 번개)
        X.globalAlpha=fa*.12*_lcPulse;X.strokeStyle='#2244ff';X.lineWidth=12;X.lineCap='round';
        X.beginPath();X.moveTo(-10,0);
        for(let _s=1;_s<=_lcSegs;_s++){const _sx=_s*_lcSegL-10,_sy=((_s&1)?1:-1)*(2+Math.sin(_now*.09+p.y*.3+_s*2.1)*3);X.lineTo(_sx,_sy)}
        X.stroke();
        // 메인 볼트 (푸른 번개)
        X.globalAlpha=fa*.85*_lcPulse;X.strokeStyle='#4499ff';X.lineWidth=3.5;
        X.beginPath();X.moveTo(-10,0);
        for(let _s=1;_s<=_lcSegs;_s++){const _sx=_s*_lcSegL-10,_sy=((_s&1)?1:-1)*(2+Math.sin(_now*.09+p.y*.3+_s*2.1)*3);X.lineTo(_sx,_sy)}
        X.stroke();
        // 백색 코어 (가는 번개)
        X.globalAlpha=fa*.95;X.strokeStyle='#eef4ff';X.lineWidth=1.2;
        X.beginPath();X.moveTo(-10,0);
        for(let _s=1;_s<=_lcSegs;_s++){const _sx=_s*_lcSegL-10,_sy=((_s&1)?1:-1)*(2+Math.sin(_now*.09+p.y*.3+_s*2.1)*3);X.lineTo(_sx,_sy)}
        X.stroke();
        // 분기 번개 (매 2세그먼트마다 짧은 가지)
        X.globalAlpha=fa*.4*_lcPulse;X.strokeStyle='#88bbff';X.lineWidth=1;
        for(let _s=2;_s<=_lcSegs;_s+=2){
          const _bx=_s*_lcSegL-10,_by=((_s&1)?1:-1)*(2+Math.sin(_now*.09+p.y*.3+_s*2.1)*3);
          const _bdir=(_s&2)?1:-1;
          X.beginPath();X.moveTo(_bx,_by);X.lineTo(_bx+4,_by+_bdir*(4+Math.sin(_now*.12+_s)*2));X.lineTo(_bx+8,_by+_bdir*(2+Math.sin(_now*.08+_s*3)*1.5));X.stroke();
        }
        X.lineCap='butt';
        // 선단 전기 구체
        X.globalAlpha=fa*.5*_lcPulse;X.fillStyle='#88ccff';X.beginPath();X.arc(46,0,4+Math.sin(_now*.07)*1.5,0,Math.PI*2);X.fill();
        X.globalAlpha=fa*.9;X.fillStyle='#eeffff';X.beginPath();X.arc(46,0,1.8,0,Math.PI*2);X.fill();
        // 트레일: 전기 잔상 지그재그
        if(p._trail&&p._trLen>0){
          const _cs=Math.cos(-ang),_sn=Math.sin(-ang);
          X.strokeStyle='#4488ff';X.lineWidth=1.5;X.lineCap='round';
          for(let ti=0;ti<p._trLen;ti+=2){
            const _tt=p._trail[(p._trH-1-ti+p._trail.length)%p._trail.length];
            const _tf=1-ti/p._trLen;
            const _dx=_tt.x-p.x,_dy=_tt.y-p.y;
            const _lx=_dx*_cs-_dy*_sn,_ly=_dx*_sn+_dy*_cs;
            X.globalAlpha=fa*_tf*.2;
            X.beginPath();X.moveTo(_lx,_ly);X.lineTo(_lx-4,_ly+(ti&2?-3:3)*_tf);X.lineTo(_lx-8,_ly);X.stroke();
          }
          X.lineCap='butt';
        }
        // 전기 파티클 (10%로 제한 — 다수 분열 시 과다 파티클 방지)
        if(Math.random()>.9)poolPart(p.x+(Math.random()-.5)*10,p.y+(Math.random()-.5)*10,-p.vx*.15+(Math.random()-.5)*2,-p.vy*.15+(Math.random()-.5)*2,'#4499ff',1.5+Math.random()*2.5,4+Math.random()*5);
      }else if(p.mhBlade){// ── BLADE: 악의사냥/독혈해방 물리칼날 ──
        X.rotate(ang);
        const _mhF=p.mhFused;
        const _mhP=p.mhPlague; // 독혈해방 여부
        // 메인 칼날: 좁고 긴 다이아몬드 (24x3) — 독혈해방 합체 칼날도 흰색 유지
        X.globalAlpha=fa*.95;
        X.fillStyle=_mhF?'#ddeeff':'#ccccdd';
        X.beginPath();X.moveTo(24,0);X.lineTo(2,-2.5);X.lineTo(-10,0);X.lineTo(2,2.5);X.closePath();X.fill();
        // 칼날 엣지 하이라이트
        X.globalAlpha=fa*.5;X.strokeStyle='#ffffff';X.lineWidth=.8;
        X.beginPath();X.moveTo(24,0);X.lineTo(2,-2.5);X.lineTo(-10,0);X.stroke();
        // 중심 빛줄기
        X.globalAlpha=fa*.3;X.strokeStyle=_mhF?'#aaccff':'#ddddee';X.lineWidth=1.2;
        X.beginPath();X.moveTo(-8,0);X.lineTo(22,0);X.stroke();
        // 트레일: 좁은 잔상
        if(p._trail&&p._trLen>0){
          const _cs=Math.cos(-ang),_sn=Math.sin(-ang);
          for(let ti=0;ti<p._trLen;ti++){
            const _tt=p._trail[(p._trH-1-ti+p._trail.length)%p._trail.length];
            const _tf=1-ti/p._trLen,_ts=_tf*.5;
            const _dx=_tt.x-p.x,_dy=_tt.y-p.y;
            const _lx=_dx*_cs-_dy*_sn,_ly=_dx*_sn+_dy*_cs;
            X.globalAlpha=fa*_tf*.25;X.fillStyle=_mhF?'#aabbcc':'#bbbbcc';
            X.beginPath();X.moveTo(_lx+10*_ts,_ly);X.lineTo(_lx-6*_ts,_ly-1.5*_ts);X.lineTo(_lx-6*_ts,_ly+1.5*_ts);X.closePath();X.fill();
          }
        }
      }else if(p.plagueBlade){// ── RED BLADE: 폭독칼날 핏빛 (빨간콩 스타일) ──
        X.rotate(ang);
        const _pbPulse=.8+Math.sin(_now/50+p.x*.3)*.2;
        // 1) 위험 글로우 오라 (넓게)
        X.globalAlpha=fa*.12*_pbPulse;X.fillStyle='#ff0000';
        X.beginPath();X.ellipse(0,0,28,10,0,0,Math.PI*2);X.fill();
        // 2) 중간 화염 오라
        X.globalAlpha=fa*.2;X.fillStyle='#ff2200';
        X.beginPath();X.ellipse(0,0,20,6,0,0,Math.PI*2);X.fill();
        // 3) 메인 칼날: 빨간콩색 — gradient→고정색 (핫패스)
        X.globalAlpha=fa*.95;
        X.fillStyle='#ff2200';
        X.beginPath();X.moveTo(24,0);X.lineTo(2,-2.5);X.lineTo(-10,0);X.lineTo(2,2.5);X.closePath();X.fill();
        // 4) 밝은 코어 라인
        X.globalAlpha=fa*.6;X.strokeStyle='#ff4400';X.lineWidth=1.2;
        X.beginPath();X.moveTo(-8,0);X.lineTo(22,0);X.stroke();
        // 5) 뾰족한 끝 핫스팟
        X.globalAlpha=fa*.7;X.fillStyle='#ffccaa';
        X.beginPath();X.arc(20,0,1.5,0,Math.PI*2);X.fill();
        // 트레일
        if(p._trail&&p._trLen>0){
          const _cs=Math.cos(-ang),_sn=Math.sin(-ang);
          for(let ti=0;ti<p._trLen;ti++){
            const _tt=p._trail[(p._trH-1-ti+p._trail.length)%p._trail.length];
            const _tf=1-ti/p._trLen,_ts=_tf*.5;
            const _dx=_tt.x-p.x,_dy=_tt.y-p.y;
            const _lx=_dx*_cs-_dy*_sn,_ly=_dx*_sn+_dy*_cs;
            X.globalAlpha=fa*_tf*.2;X.fillStyle='#ff0000';
            X.beginPath();X.ellipse(_lx,_ly,8*_ts,3*_ts,0,0,Math.PI*2);X.fill();
            X.globalAlpha=fa*_tf*.35;X.fillStyle='#ff2200';
            X.beginPath();X.moveTo(_lx+10*_ts,_ly);X.lineTo(_lx-6*_ts,_ly-1.5*_ts);X.lineTo(_lx-6*_ts,_ly+1.5*_ts);X.closePath();X.fill();
          }
        }
      }else if(me===3){// ── DARK: swirling shadow orb ──
        const sw=Math.sin(mt/30)*4;
        X.globalAlpha=fa*.015;X.fillStyle='#8844cc';X.beginPath();X.arc(sw*.3,sw*.2,Math.min((p.r+3)*.5,4),0,Math.PI*2);X.fill();
        X.globalAlpha=fa*.08;X.fillStyle='#6622aa';X.beginPath();X.arc(0,0,p.r*.7,0,Math.PI*2);X.fill();
        X.globalAlpha=fa*.5;X.fillStyle='#aa44ff';X.beginPath();X.arc(0,0,p.r*.5,0,Math.PI*2);X.fill();
        X.globalAlpha=fa*.3;X.fillStyle='#ddaaff';X.beginPath();X.arc(sw*.2,-sw*.15,p.r*.2,0,Math.PI*2);X.fill();
        if(Math.random()>.55)poolPart(p.x+(Math.random()-.5)*10,p.y+(Math.random()-.5)*10,(Math.random()-.5)*1.5,(Math.random()-.5)*1.5,'#8844cc',2+Math.random()*2,5+Math.random()*5);
      }else if(me===4){// ── LIGHTNING: electric bolt ──
        X.globalAlpha=fa*.02;X.fillStyle='#ffff44';X.beginPath();X.arc(0,0,Math.min((p.r+2)*.5,4),0,Math.PI*2);X.fill();
        X.rotate(ang);
        X.globalAlpha=fa;X.fillStyle='#ffee00';
        X.beginPath();X.moveTo(p.r+5,0);X.lineTo(2,-4);X.lineTo(4,-1);X.lineTo(-p.r-2,2);X.lineTo(-1,1);X.lineTo(-3,4);X.closePath();X.fill();
        X.globalAlpha=fa*.7;X.fillStyle='#ffffff';
        X.beginPath();X.moveTo(p.r+3,0);X.lineTo(1,-2);X.lineTo(2,0);X.lineTo(-p.r,1);X.lineTo(0,0);X.lineTo(-1,2);X.closePath();X.fill();
        if(Math.random()>.5){const za=Math.random()*Math.PI*2;poolPart(p.x+Math.cos(za)*5,p.y+Math.sin(za)*5,Math.cos(za)*3,Math.sin(za)*3,'#ffff88',1+Math.random()*2,3+Math.random()*3)}
      }else if(p.bladeOrb){// ── 붉은꽃: 회전 꽃잎 오브 (3배) ──
        const _bsA=p._orbAng||0;
        // 중심 — 붉은 꽃심
        X.globalAlpha=fa*.3;X.fillStyle='#ff2244';X.beginPath();X.arc(0,0,15,0,Math.PI*2);X.fill();
        X.globalAlpha=fa*.12;X.fillStyle='#ff6644';X.beginPath();X.arc(0,0,24,0,Math.PI*2);X.fill();
        // 꽃잎 5장
        for(let _bi=0;_bi<5;_bi++){
          X.save();X.rotate(_bsA+Math.PI*2/5*_bi);
          // 꽃잎 외곽 (어두운 빨강)
          X.globalAlpha=fa*.4;X.fillStyle='#aa1122';
          X.beginPath();X.moveTo(p.r+36,0);X.quadraticCurveTo(18,-18,0,0);X.quadraticCurveTo(18,18,p.r+36,0);X.fill();
          // 꽃잎 내부 (밝은 빨강)
          X.globalAlpha=fa*.6;X.fillStyle='#ff3355';
          X.beginPath();X.moveTo(p.r+27,0);X.quadraticCurveTo(15,-12,3,0);X.quadraticCurveTo(15,12,p.r+27,0);X.fill();
          X.restore();
        }
        // 중심 하이라이트
        X.globalAlpha=fa*.7;X.fillStyle='#ffccaa';X.beginPath();X.arc(0,0,7.5,0,Math.PI*2);X.fill();
        X.globalAlpha=fa*.2;X.strokeStyle='#ff4466';X.lineWidth=2;X.beginPath();X.arc(0,0,p.r+6,0,Math.PI*2);X.stroke();
        if(Math.random()>.7)poolPart(p.x+(Math.random()-.5)*42,p.y+(Math.random()-.5)*42,-p.vx*.12+(Math.random()-.5)*2,-p.vy*.12+(Math.random()-.5)*2,Math.random()>.5?'#ff3344':'#ff8866',3+Math.random()*4,10+Math.random()*6);
      }else if(p.bladeShard){// ── 붉은꽃 꽃잎 파편 (3배) ──
        X.rotate(ang+_now*.015);
        X.globalAlpha=fa*.5;X.fillStyle='#aa1133';
        X.beginPath();X.moveTo(p.r+18,0);X.quadraticCurveTo(6,-12,-p.r-6,0);X.quadraticCurveTo(6,12,p.r+18,0);X.fill();
        X.globalAlpha=fa*.8;X.fillStyle='#ff3355';
        X.beginPath();X.moveTo(p.r+12,0);X.quadraticCurveTo(4.5,-7.5,-p.r,0);X.quadraticCurveTo(4.5,7.5,p.r+12,0);X.fill();
      }else if(p.iceBlade){// ── 얼음보주 파편 (날카로운 얼음 칼날) ──
        X.rotate(ang+_now*.012);
        // 외곽 글로우
        X.globalAlpha=fa*.15;X.fillStyle='#66ccee';
        X.beginPath();X.moveTo(p.r+14,0);X.lineTo(2,-7);X.lineTo(-p.r-6,1);X.lineTo(2,7);X.closePath();X.fill();
        // 얼음 파편 본체 — 불규칙 삼각 칼날 (칼날부채와 유사)
        X.globalAlpha=fa*.5;X.fillStyle='#7cc8e8';
        X.beginPath();X.moveTo(p.r+12,0);X.lineTo(4,-6);X.lineTo(6,-2);X.lineTo(-p.r-4,1);X.lineTo(-2,2);X.lineTo(-4,6);X.closePath();X.fill();
        // 중심 밝은 칼날
        X.globalAlpha=fa*.85;X.fillStyle='#aaeeff';
        X.beginPath();X.moveTo(p.r+10,0);X.lineTo(3,-4);X.lineTo(5,-1);X.lineTo(-p.r-2,0.5);X.lineTo(-1,1);X.lineTo(-2,4);X.closePath();X.fill();
        // 하이라이트 (가장 밝은 핵심)
        X.globalAlpha=fa;X.fillStyle='#ddf4ff';
        X.beginPath();X.moveTo(p.r+7,0);X.lineTo(2,-2);X.lineTo(3,0);X.lineTo(-p.r+2,0.3);X.lineTo(0,0);X.lineTo(-1,2);X.closePath();X.fill();
        // 날카로운 엣지 라인
        X.globalAlpha=fa*.6;X.strokeStyle='#ffffff';X.lineWidth=.8;
        X.beginPath();X.moveTo(p.r+10,0);X.lineTo(-p.r-2,0.5);X.stroke();
        // 냉기 트레일 파티클
        if(Math.random()>.5){const _ica=Math.random()*Math.PI*2;
          poolPart(p.x+Math.cos(_ica)*5,p.y+Math.sin(_ica)*5,
            -p.vx*.3+(Math.random()-.5)*2,-p.vy*.3+(Math.random()-.5)*2,
            Math.random()>.5?'#88ddff':'#cceeff',1.5+Math.random()*2,6+Math.random()*5);}
      }else{// ── PHYSICAL: white magic bolt ──
        X.globalAlpha=fa*.02;X.fillStyle='#dddddd';X.beginPath();X.arc(0,0,Math.min(p.r*.5+1,4),0,Math.PI*2);X.fill();
        X.globalAlpha=fa*.1;X.fillStyle='#cccccc';X.beginPath();X.arc(0,0,Math.min(p.r*.5,3),0,Math.PI*2);X.fill();
        X.globalAlpha=fa*.5;X.fillStyle='#ffffff';X.beginPath();X.arc(0,0,Math.min(p.r*.5,2.5),0,Math.PI*2);X.fill();
      }
      X.restore();
      } // end if(!_pSprD)
    }else if(p.burstBolt){
      // ── 산탄 볼트: 두꺼운 짧은 볼트 ──
      X.globalAlpha=fa*.15;X.strokeStyle='#ff8866';X.lineWidth=2;
      X.beginPath();X.moveTo(p.x,p.y);X.lineTo(p.x-p.vx*2,p.y-p.vy*2);X.stroke();
      X.save();X.translate(p.x,p.y);X.rotate(ang);
      X.globalAlpha=fa*.7;X.fillStyle='#886644';X.fillRect(-6,-1.5,10,3); // 굵은 몸통
      X.globalAlpha=fa*.9;X.fillStyle='#cc6644'; // 넓은 화살촉
      X.beginPath();X.moveTo(8,0);X.lineTo(2,-4);X.lineTo(2,4);X.closePath();X.fill();
      X.globalAlpha=fa*.4;X.fillStyle='#ffffff'; // 하이라이트
      X.beginPath();X.moveTo(7,0);X.lineTo(3,-1.5);X.lineTo(3,0);X.closePath();X.fill();
      X.restore();
    }else{
      // ── ARROW projectile: 스프라이트 + 속성 트레일 ──
      X.globalAlpha=fa*.15;X.strokeStyle=ac;X.lineWidth=1.5;
      X.beginPath();X.moveTo(p.x,p.y);X.lineTo(p.x-p.vx*3,p.y-p.vy*3);X.stroke();
      if(!_drawProjPNG(p.x,p.y,'arrow',p.el,p._sprFr,22,ang,fa)&&!_drawProjSprite(p.x,p.y,_PA_ARROW[p.el]||0,22,ang,fa))
        _drawProcArrow(p.x,p.y,p.el,ang,22,fa);
    }
  }}else{for(let _vi=0;_vi<_visProjs.length;_vi++){const p=projs[_visProjs[_vi]];
    const _sceneBillboard=_FDG_RUINED_FOREST_FIRST&&_fdgNativePerspective?.active&&!p.trap&&!p.mine&&!p.iceZone&&!p.blizzard;
    if(_sceneBillboard)_fdgNativePerspective.pushBillboard(p.x,p.y);
    try{
    
    const pc=p.friendly?'#ffdd00':ELC[p.el]||p.col||'#ff4444';
    const _isSpecial=p.redBean||p.blackBean||p.blueBean||p.bwBean||p.gbBean||p.waterBean||p.elemBall;
    if(_isSpecial){}else{}
    const fa=(p.mine||p.bomb)?Math.min(1,p.life/(p.ml||60)):1;
    if(p._druidPoison&&!p.friendly){_drawDruidPoisonShot(p,fa);X.globalAlpha=1;continue;}
    if(p.bomb&&!p.blueBean){
      // 폭탄: 심플 원 + 깜빡임
      const _bCol=ELC[p.el]||'#ff8800';
      const _bPulse=.7+Math.sin(_now*.02+p.x)*.3;
      X.globalAlpha=fa*.9*_bPulse;X.fillStyle=_bCol;
      X.beginPath();X.arc(p.x,p.y,5,0,Math.PI*2);X.fill();
      X.globalAlpha=fa*.5;X.fillStyle='#ffffff';
      X.beginPath();X.arc(p.x,p.y,2,0,Math.PI*2);X.fill();
      X.globalAlpha=fa*.15;X.strokeStyle=_bCol;X.lineWidth=1;
      X.beginPath();X.arc(p.x,p.y,8+_bPulse*3,0,Math.PI*2);X.stroke();
      X.globalAlpha=1;continue;
    }
    if(p.trap){
      // 영구 덫: 확대된 진홍색 육각 속박진. 지뢰의 원형 폭발 인장과 구별되는 그물 구조.
      const _trP=.5+Math.sin(_now/200)*.5;
      if(_mineTrapWardSheet.complete&&_mineTrapWardSheet.naturalWidth>0){
        const sw=_mineTrapWardSheet.naturalWidth/2,sh=_mineTrapWardSheet.naturalHeight;
        X.save();X.translate(p.x,p.y);X.rotate(-_now*.00018);X.globalCompositeOperation='screen';X.globalAlpha=.78+_trP*.18;
        X.drawImage(_mineTrapWardSheet,sw,0,sw,sh,-56,-56,112,112);
        X.restore();X.globalAlpha=1;X.globalCompositeOperation='source-over';continue;
      }
      X.save();X.translate(p.x,p.y);X.rotate(-_now*.00018);
      X.globalCompositeOperation='lighter';X.globalAlpha=.15+_trP*.12;
      X.fillStyle='#d91e3c';X.beginPath();X.arc(0,0,54,0,Math.PI*2);X.fill();
      X.globalCompositeOperation='source-over';
      const _tc='#ff4658';
      X.globalAlpha=.9;X.strokeStyle=_tc;X.lineWidth=2.8;
      // 육각 경계와 안쪽 얽힘 고리
      for(let ring=0;ring<2;ring++){const r=ring?30:50;X.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3-Math.PI/2,x=Math.cos(a)*r,y=Math.sin(a)*r;k?X.lineTo(x,y):X.moveTo(x,y)}X.closePath();X.stroke()}
      // 여섯 가닥 속박선, 끝의 갈고리 룬
      X.globalAlpha=.78;X.lineWidth=2;
      for(let k=0;k<6;k++){const a=k*Math.PI/3-Math.PI/2,ca=Math.cos(a),sa=Math.sin(a);
        X.beginPath();X.moveTo(ca*8,sa*8);X.lineTo(ca*30,sa*30);X.lineTo(ca*50,sa*50);X.stroke();
        X.beginPath();X.moveTo(ca*44-sa*4,sa*44+ca*4);X.lineTo(ca*52,sa*52);X.lineTo(ca*44+sa*4,sa*44-ca*4);X.stroke();}
      X.globalAlpha=.94;X.fillStyle='#260b17';X.beginPath();X.arc(0,0,14,0,Math.PI*2);X.fill();
      X.strokeStyle=_tc;X.lineWidth=3;X.beginPath();X.moveTo(0,-10);X.lineTo(10,0);X.lineTo(0,10);X.lineTo(-10,0);X.closePath();X.stroke();
      X.globalAlpha=.8+_trP*.2;X.fillStyle='#fff0cf';X.beginPath();X.arc(0,0,4,0,Math.PI*2);X.fill();
      X.restore();X.globalAlpha=1;X.lineWidth=1;continue;
    }
    if(p.web){
      // 흰 링 거미줄탄도 원본 뱀형 표시 사용. 패링 불가/둔화 판정은 유지.
      const _webScale=Math.max(1.2,Math.min(4,(p.sz||1)*1.5))*.7*2;
      _drawPhysMouth(p.x,p.y,22.05*_webScale*.55,Math.atan2(p.vy,p.vx),fa,0);
      p._eyeSkin=1;
      X.globalAlpha=1;continue;
    }
    if(p.mine){
      // 지뢰: 약 2배 확대한 진홍색 원형 결계진. 덫의 육각 그물과 구별되는 폭발 인장.
      const mp=p.life/(p.ml||180);
      const _mPul=.5+Math.sin(_now/(80+mp*100))*.5;
      const _mBlink=mp<.35;
      const _mc=_mBlink?'#ffd84a':'#ff354f',_mi=_mBlink?'#fff0a0':'#ffd1c9';
      if(_mineTrapWardSheet.complete&&_mineTrapWardSheet.naturalWidth>0){
        const sw=_mineTrapWardSheet.naturalWidth/2,sh=_mineTrapWardSheet.naturalHeight;
        X.save();X.translate(p.x,p.y);X.rotate(_now*.00035);X.globalCompositeOperation='screen';X.globalAlpha=(_mBlink ? .84 : .76)+_mPul*.18;
        X.drawImage(_mineTrapWardSheet,0,0,sw,sh,-56,-56,112,112);
        if(_mBlink){X.globalCompositeOperation='lighter';X.globalAlpha=.3+_mPul*.2;X.strokeStyle='#ffd84a';X.lineWidth=2;X.beginPath();X.arc(0,0,53,0,Math.PI*2);X.stroke()}
        X.restore();X.globalAlpha=1;X.globalCompositeOperation='source-over';continue;
      }
      X.save();X.translate(p.x,p.y);X.rotate(_now*.00035);
      X.globalCompositeOperation='lighter';X.globalAlpha=.2+_mPul*.14;
      X.fillStyle=_mBlink?'#ffb51c':'#e51e42';X.beginPath();X.arc(0,0,50,0,Math.PI*2);X.fill();
      X.globalCompositeOperation='source-over';
      // 얇은 이중 결계선과 네 방향 룬 눈금
      X.globalAlpha=.9;X.strokeStyle=_mc;X.lineWidth=2.8;
      X.beginPath();X.arc(0,0,42,0,Math.PI*2);X.stroke();
      X.globalAlpha=.64;X.lineWidth=2;X.beginPath();X.arc(0,0,30,0,Math.PI*2);X.stroke();
      X.globalAlpha=.94;X.lineWidth=3;
      for(let k=0;k<8;k++){const a=k*Math.PI/4,ri=k%2?36:32,ro=k%2?42:44;
        X.beginPath();X.moveTo(Math.cos(a)*ri,Math.sin(a)*ri);X.lineTo(Math.cos(a)*ro,Math.sin(a)*ro);X.stroke();}
      // 어두운 인장 바탕, 위험색 마름모, 발광 중심핵
      X.globalAlpha=.96;X.fillStyle='#260b17';X.beginPath();X.arc(0,0,20,0,Math.PI*2);X.fill();
      X.strokeStyle=_mc;X.lineWidth=3;X.beginPath();X.moveTo(0,-14);X.lineTo(14,0);X.lineTo(0,14);X.lineTo(-14,0);X.closePath();X.stroke();
      X.globalAlpha=1;X.fillStyle=_mi;X.beginPath();X.arc(0,0,5+_mPul*2,0,Math.PI*2);X.fill();
      X.restore();X.globalAlpha=1;X.lineWidth=1;continue;
    }
    if(p.iceZone||p.blizzard){
      // 바닥 지대: 어둠속성(빙판슬라임/눈보라마법사)=진보라, 얼음속성(보스 등)=하늘색
      const _zDark=(p.el===EL.D);
      const _zR=(p.sz||2)*5;
      const _zp=.5+Math.sin(_now/250+p.x)*.3;
      X.globalAlpha=.12*_zp;X.fillStyle=_zDark?'#1a0033':'#2a4a66';X.beginPath();X.arc(p.x,p.y,_zR,0,Math.PI*2);X.fill();
      X.globalAlpha=.26*_zp;X.fillStyle=_zDark?'#3a0070':'#4488aa';X.beginPath();X.arc(p.x,p.y,_zR*.6,0,Math.PI*2);X.fill();
      X.globalAlpha=.46*_zp;X.fillStyle=_zDark?'#5e10a8':'#88ccff';X.beginPath();X.arc(p.x,p.y,_zR*.28,0,Math.PI*2);X.fill();
      X.globalAlpha=1;continue;
    }
    if(p.fdEnergy){
      if(typeof _fdDrawFly==='function'&&_fdDrawFly(p)){X.globalAlpha=1;continue}
    }
    if(p.fbEnergy){ // 크라켄 거대 에너지탄: 물줄기 어뢰 스프라이트
      if(typeof _fbDrawFly==='function'&&_fbDrawFly(p)){X.globalAlpha=1;continue}
    }
    if(p.elemBall){
      // 물리/빙 계열 대형탄은 크라켄 물회오리, 나머지는 속성별 제작 시트. 구형 다중 원 구체는 폐기.
      const _ebAng=Math.atan2(p.vy,p.vx),_ebDrawSz=Math.max(96,(p.sz||18)*5.3);
      if((p.el===EL.P||p.el===EL.I)&&_drawKrakenShot(p,fa,170)){X.globalAlpha=1;continue}
      if(_drawElemOrb(p.x,p.y,p.el,_ebDrawSz,_ebAng,fa)){X.globalAlpha=1;continue}
      _drawCometBullet(p.x,p.y,_ebDrawSz,_ebAng,fa,p._sprFr,p.el||EL.I);
      X.globalAlpha=1;continue;
    }
    if(p.poisonZone){
      // 독안개/독가스: 반투명 녹색 원
      const _pzR=p.sz*5,_pzA=p.life/(p.ml||300);
      X.globalAlpha=.12*_pzA+Math.sin(_now/300)*.04;X.fillStyle=p.col||'#33aa22';X.beginPath();X.arc(p.x,p.y,_pzR,0,Math.PI*2);X.fill();
      X.globalAlpha=.2*_pzA;X.strokeStyle=p.col||'#33aa22';X.lineWidth=2;X.beginPath();X.arc(p.x,p.y,_pzR*.7+Math.sin(_now/200)*_pzR*.1,0,Math.PI*2);X.stroke();
      for(let _bi=0;_bi<4;_bi++){const _ba=_now/400+Math.PI*2*_bi/4;
        X.globalAlpha=.15*_pzA;X.beginPath();X.arc(p.x+Math.cos(_ba)*_pzR*.5,p.y+Math.sin(_ba)*_pzR*.5,3+Math.sin(_now/200+_bi)*1.5,0,Math.PI*2);X.fill()}
      X.globalAlpha=1;continue;
    }
    if(p.dimRift){
      // 차원 균열: 보라색 포탈 소용돌이
      X.globalAlpha=.3+Math.sin(_now/150)*.15;X.fillStyle='#220033';X.beginPath();X.arc(p.x,p.y,16,0,Math.PI*2);X.fill();
      X.globalAlpha=.6;X.strokeStyle='#9900ff';X.lineWidth=2;X.beginPath();X.arc(p.x,p.y,12,_now/200,_now/200+Math.PI*1.3);X.stroke();
      X.strokeStyle='#cc44ff';X.lineWidth=1;X.beginPath();X.arc(p.x,p.y,8,-_now/250,-_now/250+Math.PI);X.stroke();
      X.globalAlpha=.8;X.fillStyle='#bb66ff';X.beginPath();X.arc(p.x,p.y,3,0,Math.PI*2);X.fill();
      X.globalAlpha=1;continue;
    }
    const _ps=Math.max(1.2,Math.min(4.0,(p.sz||1)*1.5))*.7; // 탄막 크기 상한 2.0→4.0 (sz 2배 시각 반영)
    const ra=Math.atan2(p.vy,p.vx);
    // ── 회전 애니메이션 (크기 고정) ──
    const _spin=p.redBean?.005:p.blackBean?.005:p.blueBean?.004:.002;
    const _sRa=ra+_now*_spin+p.x*.1;
    const _sSc=_ps*_physicalProjectileMultiplier(p,2);
    // ── 검기파: 심플 원 ──
    if(p.swordWave&&_projectileParryClass(p)!=='physical'){
      const _swC=ELC[p.el]||'#ff2200';
      X.globalAlpha=fa*.9;X.fillStyle=_swC;
      X.beginPath();X.arc(p.x,p.y,4*_sSc,0,Math.PI*2);X.fill();
      X.globalAlpha=fa*.6;X.fillStyle='#ffffff';
      X.beginPath();X.arc(p.x,p.y,1.5*_sSc,0,Math.PI*2);X.fill();
      X.globalAlpha=1;continue;
    }
    // ── 거대괴수 혈안탄 (titanEye): 눈깔 시트. 빨콩 베이스(유도·E패링)지만 그림만 눈깔 ──
    if(p.titanEye){
      const _teAng=Math.atan2(p.vy,p.vx),_teSz=21.7*_sSc; // 대형 눈깔만 추가-30% (31→21.7)
      if(_titanEyeReady){
        const _tfi=((_gameFrame>>2)+(~~(p.x*.02)))%8,_ttc=_tfi%4,_ttr=_tfi>>2;
        X.save();X.translate(p.x,p.y);X.rotate(_teAng+Math.PI);X.globalAlpha=fa;
        X.drawImage(_titanEyeImg,_ttc*300,_ttr*300,300,300,-_teSz/2,-_teSz/2,_teSz,_teSz);X.restore();
        p._eyeSkin=1;
      }else if(_drawEyeBullet(p.x,p.y,_EYE_ROW[EL.F]||0,_teSz,_teAng,fa)){p._eyeSkin=1}
      else{
        X.globalAlpha=fa*.85;X.fillStyle='#ff2233';X.beginPath();X.arc(p.x,p.y,10*_sSc,0,Math.PI*2);X.fill();
        X.globalAlpha=fa*.6;X.fillStyle='#ffffff';X.beginPath();X.arc(p.x,p.y,4*_sSc,0,Math.PI*2);X.fill();
      }
      X.globalAlpha=1;continue;
    }
    // ── 빨간콩탄: 위협적인 화염구 ──
    if(_projectileParryClass(p)==='physical'){ // All E-parry flying variants use the same readable mouth.
      X.save();
      _drawPhysMouth(p.x,p.y,22.05*_sSc*.55,Math.atan2(p.vy,p.vx),fa,0);
      p._eyeSkin=1;
      X.restore();X.globalAlpha=1;continue;
    }
    // ── 무지개탄: 리얼블랙 코어 + 화이트/네온 무지개 (최초 프로시저럴) ──
    if(p.blackBean){
      _drawClassicRainbow(p,fa,_sSc);continue;
    }
    // ── 블루콩: 최초 무지개탄 비주얼 ──
    if(p.blueBean){
      _drawClassicRainbow(p,fa,_sSc);continue;
    }
    // ── 암흑 구체 (Q 전용): 보라색 고정. 무지개는 blackBean 전용이다. ──
    if(p.gbBean){
      _drawDarkSphere(p,fa,_sSc);continue;
    }
    // ── 물속성 파란콩: 옛 시안 구체 (패링반사 blueBean/무지개 아님, Q패링) ──
    if(p.waterBean){
      _drawWaterBean(p,fa,_sSc);continue;
    }
    // ── 빠른탄: 물리=이빨입, 원소=유저 오브 시트. 무지개 경로 아님 ──
    if(p.fast){
      const _fEl=p.el||0;const _fSz=18*_sSc;const _fAng=Math.atan2(p.vy,p.vx);
      if(_fEl===EL.P){ // 물리탄 — 기존 유지(이빨입→눈알)
        if(_drawPhysMouth(p.x,p.y,_fSz*1.19,_fAng,fa,0))p._eyeSkin=1;
        if(!p._eyeSkin&&_drawEyeBullet(p.x,p.y,_EYE_ROW[_fEl]!==undefined?_EYE_ROW[_fEl]:0,_fSz*1.5,_fAng,fa))p._eyeSkin=1;
      }else{ // 마법탄 — 무지개 혜성 단일 스프라이트 (원소 오브/눈알 버전 제거)
        if(_drawCometBullet(p.x,p.y,_fSz*2.2*_enemyMagicCometVisualScale(_fEl),_fAng,fa,p._sprFr,_fEl))p._eyeSkin=1;
      }
      if(!p._eyeSkin&&!_drawBoltSprite(p.x,p.y,_fEl,_fSz,_fAng,fa)){
        const _fC=_fEl===0?'#ff6633':(ELC[_fEl]||'#ff4444');
        X.globalAlpha=fa*.9;X.fillStyle=_fC;X.beginPath();X.arc(p.x,p.y,3*_sSc,0,Math.PI*2);X.fill();
      }
      if(!p._eyeSkin){X.globalAlpha=fa*.08;X.fillStyle=ELC[_fEl]||'#ff6633';X.beginPath();X.arc(p.x,p.y,_fSz*.5,0,Math.PI*2);X.fill()}
      X.globalAlpha=1;continue;
    }
    // ── 일반탄: 물리=이빨입(그대로), 마법=무지개 혜성 스프라이트로 통일 ──
    {const _nEl=p.el||0;const _nSz=20*_sSc;const _nAng=Math.atan2(p.vy,p.vx);
    if(_nEl===EL.P){ // 물리탄 — 기존 유지(이빨입→눈알)
      if(_drawPhysMouth(p.x,p.y,_nSz*1.19,_nAng,fa,0))p._eyeSkin=1;
      if(!p._eyeSkin&&_drawEyeBullet(p.x,p.y,_EYE_ROW[_nEl]!==undefined?_EYE_ROW[_nEl]:0,_nSz*1.5,_nAng,fa))p._eyeSkin=1;
    }else{ // 마법탄 — 무지개 혜성 단일 스프라이트 (원소 오브/눈알 버전 제거)
      if(_drawCometBullet(p.x,p.y,_normalMagicCometLength(p.sz)*_enemyMagicCometVisualScale(_nEl),_nAng,fa,p._sprFr,_nEl))p._eyeSkin=1;
    }
    if(!p._eyeSkin&&!_drawBoltSprite(p.x,p.y,_nEl,_nSz,_nAng,fa)){
      const _nC=_nEl===0?'#ff6633':(ELC[_nEl]||'#ff4444');
      X.globalAlpha=fa*.9;X.fillStyle=_nC;X.beginPath();X.arc(p.x,p.y,3*_sSc,0,Math.PI*2);X.fill();
    }
    if(!p._eyeSkin){X.globalAlpha=fa*.08;X.fillStyle=ELC[_nEl]||'#ff6633';X.beginPath();X.arc(p.x,p.y,_nSz*.5,0,Math.PI*2);X.fill()}
    X.globalAlpha=1;}
    }finally{if(_sceneBillboard)_fdgNativePerspective.popBillboard();}
  }}}finally{X=previous;}};
