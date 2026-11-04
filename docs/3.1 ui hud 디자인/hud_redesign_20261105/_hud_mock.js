/* 전투 HUD 재디자인 시안 빌더 (2026-11-05, 레인 U1). mock_A.html·mock_B.html이 cfg만 바꿔 부른다.
   좌표는 1920×1080 설계 px. 색은 _stage.css 토큰만 쓴다(--res-mp*는 승인 대기 제안 토큰).
   구조 규칙(defects.md "뜸·안 맞음·듬성" 해결 규칙):
   R1 접지: 받침 레일(화면 맨 아래 rail.h px)을 깔고 구체·스킬판이 모두 그 위에 선다. 화면 밖으로 잘리는 원화 0.
   R2 비례: 판 높이 = 구체 바깥 지름 × plateRatio, 구체 고리가 판 끝을 overlap px 덮는다(틈 0).
   R3 밀도: 같은 묶음 안 간격 gIn, 묶음 사이 gOut. 빈 슬롯도 같은 소켓(검은 구멍·"—" 없음).
   R4 색: 금속·바탕 무채색, 빨강은 HP 액체·선택 슬롯 안쪽 빛·포이즈 눈·위험(분노)만. */
(function(){
var UI='../../../unity/Assets/Exoduser/Resources/Art/ui/',ART=UI+'skill_icons/';
// C안(cfg.art): 현재 원화(구체 틀·스킬바 가운데 볏)와 인벤토리 철 재질을 실버 헬 명도로 다시 칠해 재사용한다.
var ART_FILTER='grayscale(1) brightness(1.55) contrast(1.4)';
var NS='http://www.w3.org/2000/svg';
function el(tag,cls,style,parent){var e=document.createElement(tag);if(cls)e.className=cls;if(style)e.setAttribute('style',style);if(parent)parent.appendChild(e);return e}
function svg(w,h,inner,style,parent){var d=el('div','',style,parent);d.innerHTML='<svg xmlns="'+NS+'" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'">'+inner+'</svg>';return d}
var CHROME='<linearGradient id="CH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f5f2"/><stop offset=".34" stop-color="#c9c7c3"/><stop offset=".5" stop-color="#4f5352"/><stop offset=".63" stop-color="#c9c7c3"/><stop offset="1" stop-color="#8a8b88"/></linearGradient>';

window.buildHud=function(cfg){
  var st=document.getElementById('stage');
  var css=el('style');css.textContent=[
    '.hud *{box-sizing:border-box}',
    '.rail{position:absolute;background:linear-gradient(180deg,#18181b,#0b0b0d)}',
    '.rail::before{content:"";position:absolute;left:0;right:0;top:0;height:1.4px;background:linear-gradient(90deg,transparent,#8a8b88 8%,#c9c7c3 30%,#f6f5f2 50%,#c9c7c3 70%,#8a8b88 92%,transparent)}',
    '.plate{position:absolute;background:linear-gradient(180deg,rgba(20,20,23,.96),rgba(10,10,12,.97));box-shadow:0 -6px 18px rgba(0,0,0,.45)}',
    '.plate .edge{position:absolute;left:0;right:0;top:0;height:1.4px;background:linear-gradient(90deg,#4f5352,#c9c7c3 20%,#f6f5f2 50%,#c9c7c3 80%,#4f5352)}',
    '.plate .inner{position:absolute;left:7px;right:7px;top:6px;height:1px;background:rgba(201,199,195,.22)}',
    '.sock{position:absolute;border-radius:50%;background:radial-gradient(circle at 50% 42%,#1d1d21,#0b0b0d 72%);border:1px solid var(--sv-dk);box-shadow:inset 0 0 0 3px rgba(11,11,13,1),inset 0 0 0 4px rgba(201,199,195,.14),0 1px 0 rgba(0,0,0,.8)}',
    '.sock.full{border-color:var(--sv-md)}',
    '.sock img{position:absolute;inset:4px;width:calc(100% - 8px);height:calc(100% - 8px);border-radius:50%;object-fit:cover}',
    '.sock.empty::after{content:"";position:absolute;left:50%;top:50%;width:6px;height:6px;transform:translate(-50%,-50%) rotate(45deg);border:1px solid rgba(201,199,195,.16)}',
    '.sock.sel{border-color:var(--sv-lt)}',
    '.sock.sel::before{content:"";position:absolute;inset:3px;border-radius:50%;box-shadow:inset 0 0 14px rgba(194,26,16,.55);z-index:2}',
    '.cd{position:absolute;inset:4px;border-radius:50%;z-index:3}',
    '.cdn{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:600 var(--cdf) var(--f-num);color:var(--tx);text-shadow:0 1px 2px #000,0 0 6px #000;z-index:4}',
    '.chip{position:absolute;height:15px;padding:0 4px;min-width:17px;transform:translateX(-50%);background:rgba(10,10,12,.94);border:1px solid var(--sv-dk);border-radius:2px;font:600 10.5px/13px var(--f-num);letter-spacing:.06em;color:var(--tx-2);text-align:center;white-space:nowrap;z-index:5}',
    '.chip.dim{color:var(--tx-3)}',
    '.chip svg{display:block;margin:1px auto 0}',
    '.gauge{position:absolute;height:2px;z-index:5}',
    '.rv{position:absolute;text-align:center;line-height:1;white-space:nowrap;z-index:9;text-shadow:0 1px 2px #000,0 0 8px rgba(0,0,0,.9)}',
    '.cur{font:600 var(--cs) var(--f-num);color:var(--tx);letter-spacing:.02em}',
    '.max{font:400 var(--ms) var(--f-num);color:var(--tx-2);letter-spacing:.04em}',
    '.lab{font:600 var(--ls,10px) var(--f-num);color:var(--tx-2);letter-spacing:.2em}',
    '.hair{position:absolute;height:1px;background:linear-gradient(90deg,transparent,rgba(201,199,195,.55),transparent);z-index:9}'
  ].join('\n');document.head.appendChild(css);
  var hud=el('div','hud','position:absolute;inset:0',st);
  if(cfg.art)cfg.orbOuter=cfg.liquid*263/175;               // 원화 틀 263 : 액체 175 (NativeHudDockLayout.cs:20,38)
  var IRON='linear-gradient(180deg,rgba(201,199,195,.10),rgba(201,199,195,.03) 40%,rgba(0,0,0,.30)),url('+UI+'inventory/iron_480.png) center/240px repeat';
  var R=cfg.orbOuter/2, base=1080-cfg.rail.h;           // 레일 윗면 y
  var orbCY=base+cfg.orbSink-R;                         // 구체 바닥이 레일에 orbSink px 묻힘
  // 슬롯 줄 너비 계산
  var x=0,pos=[];cfg.groups.forEach(function(g,gi){if(gi)x+=cfg.gOut;g.forEach(function(k,ki){if(ki)x+=cfg.gIn;var d=k.big?cfg.sBig:cfg.s;pos.push({k:k,x:x,d:d});x+=d})});
  var rowW=x, plateW=rowW+cfg.padX*2, plateX=960-plateW/2, plateY=base-cfg.plateH;
  var lcx=plateX-(R-cfg.overlap), rcx=plateX+plateW+(R-cfg.overlap);
  // R1 받침 레일: 왼 구체 바깥 끝 ~ 오른 구체 바깥 끝
  el('div','rail','left:'+(lcx-R+18)+'px;top:'+base+'px;width:'+(rcx-lcx+2*R-36)+'px;height:'+cfg.rail.h+'px',hud);
  // 스킬판
  var plate=el('div','plate','left:'+plateX+'px;top:'+plateY+'px;width:'+plateW+'px;height:'+cfg.plateH+'px;clip-path:polygon(0 '+cfg.cham+'px,'+cfg.cham+'px 0,calc(100% - '+cfg.cham+'px) 0,100% '+cfg.cham+'px,100% 100%,0 100%)',hud);
  if(cfg.art)plate.style.background=IRON;
  el('div','edge','',plate);el('div','inner','',plate);
  // 가운데 보스(B안: 주공격 묶음 받침)
  if(cfg.boss){var bw=cfg.boss.w,bx=960-bw/2,by=plateY-cfg.boss.rise;
    var b=el('div','plate','left:'+bx+'px;top:'+by+'px;width:'+bw+'px;height:'+(base-by)+'px;clip-path:polygon(0 '+cfg.boss.cham+'px,'+cfg.boss.cham+'px 0,calc(100% - '+cfg.boss.cham+'px) 0,100% '+cfg.boss.cham+'px,100% 100%,0 100%)',hud);if(cfg.art)b.style.background=IRON;el('div','edge','',b);el('div','inner','',b);}
  // M3 가운데 마름모(진홍 점 1개만 허용)
  var topY=cfg.boss?plateY-cfg.boss.rise:plateY;
  if(cfg.art){var cw=220*cfg.crestScale,chh=62*cfg.crestScale;el('div','','position:absolute;left:'+(960-cw/2)+'px;top:'+(topY-chh*.86)+'px;width:'+cw+'px;height:'+chh+'px;background:url('+UI+'ui_bar_only.png) -'+(1120*cfg.crestScale)+'px -'+(100*cfg.crestScale)+'px/'+(2460*cfg.crestScale)+'px '+(546*cfg.crestScale)+'px no-repeat;filter:'+ART_FILTER+';-webkit-mask:linear-gradient(180deg,#000 80%,transparent 100%);mask:linear-gradient(180deg,#000 80%,transparent 100%);z-index:6',hud)}
  else svg(22,22,'<path d="M11 2 L20 11 L11 20 L2 11Z" fill="#0f0f10" stroke="#c9c7c3" stroke-width="1.2"/><circle cx="11" cy="11" r="2.2" fill="#c21a10"/>','position:absolute;left:949px;top:'+(topY-11)+'px;z-index:6',hud);
  // 바 양끝 작은 강철 가고일(현재 ui_bar_only.png 양끝 가고일을 잘라 은빛 처리): 판이 구체 고리에서 나오는 자리 위
  if(cfg.gargoyle){var gs=cfg.gargoyle.scale,gw=215*gs,gh=245*gs;[[lcx+cfg.gargoyle.dx,1],[rcx-cfg.gargoyle.dx-gw,-1]].forEach(function(q){
    // 원화 x150~365·y75~320(왼쪽 가고일)만 잘라 쓰고, 오른쪽은 좌우 반전. 판 쪽 가장자리 25%는 판 철 재질로 이어지게 흐리게 끝냄
    el('div','','position:absolute;left:'+q[0]+'px;top:'+(plateY-gh*cfg.gargoyle.rise)+'px;width:'+gw+'px;height:'+gh+'px;background:url('+UI+'ui_bar_only.png) -'+(150*gs)+'px -'+(75*gs)+'px/'+(2460*gs)+'px '+(546*gs)+'px no-repeat;filter:'+ART_FILTER+';transform:scaleX('+q[1]+');-webkit-mask:linear-gradient(90deg,#000 72%,transparent 100%);mask:linear-gradient(90deg,#000 72%,transparent 100%);z-index:9',hud)})}
  // 슬롯
  var rowX=960-rowW/2, cy=plateY+cfg.slotCY;
  pos.forEach(function(p){
    var k=p.k, sx=rowX+p.x, sy=(k.big&&cfg.boss?cy-cfg.bigLift:cy)-p.d/2;
    var s=el('div','sock'+(k.icon?' full':' empty')+(k.sel?' sel':''),'left:'+sx+'px;top:'+sy+'px;width:'+p.d+'px;height:'+p.d+'px',hud);
    if(k.icon){var im=new Image();im.src=ART+k.icon+'.png';im.alt='';s.appendChild(im)}
    if(k.cd){var c=el('div','cd','background:conic-gradient(rgba(8,8,10,.70) 0 '+(k.cd*360)+'deg,transparent '+(k.cd*360)+'deg 360deg)',s);var n=el('div','cdn','--cdf:'+Math.round(p.d*.36)+'px',s);n.textContent=k.cdn}
    if(k.rage){var r=el('div','cd','background:linear-gradient(0deg,rgba(126,13,7,.62) 0 '+(k.rage*100)+'%,transparent '+(k.rage*100)+'%);box-shadow:inset 0 0 0 1.5px rgba(194,26,16,'+(k.rage>=1?.9:.45)+')',s);var rn=el('div','cdn','--cdf:'+Math.round(p.d*.24)+'px;align-items:flex-start;padding-top:'+Math.round(p.d*.12)+'px',s);rn.textContent=Math.round(k.rage*100)+'%'}
    if(k.gauge!=null){el('div','gauge','left:'+(sx+p.d*.2)+'px;top:'+(sy+p.d-6)+'px;width:'+(p.d*.6)+'px;background:rgba(44,46,49,.95)',hud);
      el('div','gauge','left:'+(sx+p.d*.2)+'px;top:'+(sy+p.d-6)+'px;width:'+(p.d*.6*k.gauge)+'px;background:'+(k.gauge<.5?'var(--eye)':'var(--sv-lt)'),hud)}
    var ch=el('div','chip'+(k.icon?'':' dim'),'left:'+(sx+p.d/2)+'px;top:'+(sy+p.d-cfg.chipUp)+'px',hud);
    if(k.mouse){ch.innerHTML='<svg width="9" height="11" viewBox="0 0 9 11"><rect x=".6" y=".6" width="7.8" height="9.8" rx="3.9" fill="none" stroke="currentColor" stroke-width="1"/><path d="M4.5 .6 V4.6" stroke="currentColor" stroke-width="1"/><path d="'+(k.mouse=='L'?'M4.5 .9 A3.6 3.6 0 0 0 .9 4.5 V4.6 H4.5Z':'M4.5 .9 A3.6 3.6 0 0 1 8.1 4.5 V4.6 H4.5Z')+'" fill="#c9c7c3"/></svg>'}
    else ch.textContent=k.key;
  });
  // 구체
  function orb(cx,mp){
    var d=cfg.orbOuter,L=cfg.liquid,x0=cx-R,y0=orbCY-R;
    var g=el('div','','position:absolute;left:'+(cx-L/2)+'px;top:'+(orbCY-L/2)+'px;width:'+L+'px;height:'+L+'px;border-radius:50%;overflow:hidden;background:#08080a;z-index:7',hud);
    if(cfg.art){return orbArt(cx,mp,g,L,d)}
    if(!mp){el('div','','position:absolute;left:0;right:0;bottom:0;height:'+(cfg.hp*100)+'%;background:radial-gradient(ellipse 70% 80% at 50% 18%,#9a160c 0%,#6a0b06 42%,#3a0603 75%,#1c0302 100%);border-top:1px solid rgba(246,245,242,.30)',g)}
    else{var h=el('div','','position:absolute;inset:0;display:flex',g);
      el('div','','flex:1;position:relative',h).appendChild(el('div','','position:absolute;left:0;right:0;bottom:0;height:'+(cfg.mp*100)+'%;background:linear-gradient(0deg,var(--res-mp-dp) 0%,var(--res-mp) 60%,var(--res-mp-hi) 100%);border-top:1px solid rgba(246,245,242,.30)'));
      el('div','','width:1px;background:linear-gradient(180deg,transparent,rgba(201,199,195,.6),transparent)',h);
      el('div','','flex:1;position:relative',h).appendChild(el('div','','position:absolute;left:0;right:0;bottom:0;height:'+(cfg.st*100)+'%;background:linear-gradient(0deg,#1e1f22 0%,#4f5352 45%,#8a8b88 85%,#a7a49d 100%);border-top:1px solid rgba(246,245,242,.35)'));}
    el('div','','position:absolute;inset:0;border-radius:50%;background:radial-gradient(ellipse 46% 30% at 38% 22%,rgba(246,245,242,.10),transparent 70%),radial-gradient(circle at 50% 50%,transparent 62%,rgba(0,0,0,.55) 100%)',g);
    // 고리(M1 계열: 은빛 크롬 + 홈 + 위 눈 홈 + 레일 받침 두 개)
    var rr=R-1.5, ch=R-cfg.band/2-1, inner=L/2+1;
    var ringSeg='';
    if(mp&&cfg.mob!=null){var a=cfg.mob*2*Math.PI, rm=(inner+R-cfg.band)/2+cfg.band/4;
      var ex=R+rm*Math.sin(a), ey=R-rm*Math.cos(a);
      ringSeg='<path d="M'+R+' '+(R-rm)+' A'+rm+' '+rm+' 0 '+(cfg.mob>.5?1:0)+' 1 '+ex.toFixed(2)+' '+ey.toFixed(2)+'" fill="none" stroke="#cfccc6" stroke-width="3" stroke-linecap="butt" opacity=".9"/>';
      for(var t=1;t<5;t++){var aa=t*.2*2*Math.PI;ringSeg+='<line x1="'+(R+(rm-3)*Math.sin(aa)).toFixed(2)+'" y1="'+(R-(rm-3)*Math.cos(aa)).toFixed(2)+'" x2="'+(R+(rm+3)*Math.sin(aa)).toFixed(2)+'" y2="'+(R-(rm+3)*Math.cos(aa)).toFixed(2)+'" stroke="#0f0f10" stroke-width="2"/>'}}
    var feet='';[-38,38].forEach(function(deg){var a=(180+deg)*Math.PI/180,fx=R+(R-4)*Math.sin(a),fy=R-(R-4)*Math.cos(a);
      feet+='<path d="M'+(fx-9).toFixed(1)+' '+(d+cfg.orbSink-cfg.orbSink)+' L'+(fx-4).toFixed(1)+' '+(fy-2).toFixed(1)+' L'+(fx+4).toFixed(1)+' '+(fy-2).toFixed(1)+' L'+(fx+9).toFixed(1)+' '+d+'Z" fill="#141416" stroke="url(#CH)" stroke-width="1.2"/>'});
    var spikes='';for(var i=0;i<24;i++){var deg=i*15;if(deg<35||deg>325||Math.abs(deg-180)<58)continue;var a2=deg*Math.PI/180,len=(i%2?4:8),bw=(i%2?2.6:3.6),sx=Math.sin(a2),sy=-Math.cos(a2),px=-sy,py=sx;
      spikes+='<path d="M'+(R+(R-3)*sx+px*bw).toFixed(2)+' '+(R+(R-3)*sy+py*bw).toFixed(2)+' L'+(R+(R+len)*sx).toFixed(2)+' '+(R+(R+len)*sy).toFixed(2)+' L'+(R+(R-3)*sx-px*bw).toFixed(2)+' '+(R+(R-3)*sy-py*bw).toFixed(2)+'Z" fill="#c9c7c3" stroke="#000" stroke-width=".6"/>'}
    var eyeW=cfg.eyeW, eyeY=cfg.band/2+1;
    var eyes=(cfg.poise?'<circle cx="'+(R-6)+'" cy="'+eyeY+'" r="2.3" fill="#c21a10"/><circle cx="'+(R+6)+'" cy="'+eyeY+'" r="2.3" fill="#c21a10"/>':'<circle cx="'+(R-6)+'" cy="'+eyeY+'" r="2" fill="#2c2e31"/><circle cx="'+(R+6)+'" cy="'+eyeY+'" r="2" fill="#2c2e31"/>');
    svg(d+20,d+24,'<g transform="translate(10,10)"><defs>'+CHROME+'<radialGradient id="EG"><stop offset="0" stop-color="#c21a10" stop-opacity=".55"/><stop offset="1" stop-color="#c21a10" stop-opacity="0"/></radialGradient></defs>'+
      spikes+feet+
      '<circle cx="'+R+'" cy="'+R+'" r="'+(R-cfg.band/2)+'" fill="none" stroke="#18181b" stroke-width="'+cfg.band+'"/>'+
      '<circle cx="'+R+'" cy="'+R+'" r="'+rr+'" fill="none" stroke="#000" stroke-width="3"/>'+
      '<circle cx="'+R+'" cy="'+R+'" r="'+rr+'" fill="none" stroke="url(#CH)" stroke-width="1.6"/>'+
      '<circle cx="'+R+'" cy="'+R+'" r="'+inner+'" fill="none" stroke="url(#CH)" stroke-width="1.4"/>'+
      '<circle cx="'+R+'" cy="'+R+'" r="'+(R-cfg.band+2)+'" fill="none" stroke="rgba(201,199,195,.18)" stroke-width="1"/>'+
      ringSeg+
      (cfg.poise?'<ellipse cx="'+R+'" cy="'+eyeY+'" rx="'+(eyeW*.7)+'" ry="7" fill="url(#EG)"/>':'')+
      '<path d="M'+(R-eyeW/2)+' '+eyeY+' Q'+R+' '+(eyeY-9)+' '+(R+eyeW/2)+' '+eyeY+' Q'+R+' '+(eyeY+9)+' '+(R-eyeW/2)+' '+eyeY+'Z" fill="#0b0b0d" stroke="url(#CH)" stroke-width="1.3"/>'+eyes+
      '<path d="M'+(R-eyeW/2-7)+' '+eyeY+' l5 -2 v4z M'+(R+eyeW/2+7)+' '+eyeY+' l-5 -2 v4z" fill="#c9c7c3"/></g>',
      'position:absolute;left:'+(x0-10)+'px;top:'+(y0-10)+'px;z-index:8',hud);
    // 숫자
    if(!mp){var cy2=orbCY+cfg.numDy;
      var c=el('div','rv cur','left:'+(cx-L/2)+'px;width:'+L+'px;top:'+(cy2-cfg.hpCur*.62)+'px;--cs:'+cfg.hpCur+'px',hud);c.textContent=cfg.hpT[0];
      el('div','hair','left:'+(cx-22)+'px;width:44px;top:'+(cy2+cfg.hpCur*.48)+'px',hud);
      var m=el('div','rv max','left:'+(cx-L/2)+'px;width:'+L+'px;top:'+(cy2+cfg.hpCur*.48+5)+'px;--ms:'+cfg.hpMax+'px',hud);m.textContent=cfg.hpT[1];}
    else{[['MP',cfg.mpT,-1],['ST',cfg.stT,1]].forEach(function(r){var hx=cx+r[2]*L/4,w=L/2,cy3=orbCY+cfg.numDy;
      var l=el('div','rv lab','left:'+(hx-w/2)+'px;width:'+w+'px;top:'+(cy3-cfg.rsCur*.62-16)+'px',hud);l.textContent=r[0];
      var c=el('div','rv cur','left:'+(hx-w/2)+'px;width:'+w+'px;top:'+(cy3-cfg.rsCur*.62)+'px;--cs:'+cfg.rsCur+'px',hud);c.textContent=r[1][0];
      el('div','hair','left:'+(hx-14)+'px;width:28px;top:'+(cy3+cfg.rsCur*.48)+'px',hud);
      var m=el('div','rv max','left:'+(hx-w/2)+'px;width:'+w+'px;top:'+(cy3+cfg.rsCur*.48+4)+'px;--ms:'+cfg.rsMax+'px;color:var(--tx-2)',hud);m.textContent=r[1][1];})}
  }
  function orbArt(cx,mp,g,L,F){
    // 액체: 현재 HudOrb 형태(유리 반사·흰 수면선 없음). HP = 현재 와인빛 그대로, MP·ST = 위가 부드럽게 사라지는 세로 그라데이션
    if(!mp)el('div','','position:absolute;left:0;right:0;bottom:0;height:'+(cfg.hp*100)+'%;background:radial-gradient(circle at 50% '+(100-50/cfg.hp)+'%,#6b1020 0%,#3d0a12 50%,#1e050a 100%)',g);
    else{var h=el('div','','position:absolute;inset:0;display:flex',g);
      [[cfg.mp,'var(--res-mp-dp) 0%,var(--res-mp) 45%,var(--res-mp-hi) 80%,rgba(127,156,188,.25) 92%,transparent 100%'],[cfg.st,'var(--res-st-dp) 0%,var(--res-st) 45%,var(--res-st-hi) 80%,rgba(122,150,128,.25) 92%,transparent 100%']].forEach(function(q,i){
        if(i)el('div','','width:1px;background:linear-gradient(180deg,transparent,rgba(201,199,195,.45),transparent)',h);
        el('div','','flex:1;position:relative',h).appendChild(el('div','','position:absolute;left:0;right:0;bottom:0;height:'+(q[0]*100+6)+'%;background:linear-gradient(0deg,'+q[1]+')'))})}
    el('div','','position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 50% 50%,transparent 66%,rgba(0,0,0,.5) 100%)',g);
    var s=F/263, fx=cx-135.5*s, fy=orbCY-F/2;
    // 기동 고리(MP): 현재와 같은 자리(액체 +11,+18.65, 153) 3px 은빛 #CFCCC6
    if(mp&&cfg.mob!=null){var rr=153/2*L/175, ccx=cx-L/2+(11+76.5)*L/175, ccy=orbCY-L/2+(18.65+76.5)*L/175, a=cfg.mob*2*Math.PI;
      svg(2*rr+8,2*rr+8,'<path d="M'+(rr+4)+' 4 A'+rr+' '+rr+' 0 '+(cfg.mob>.5?1:0)+' 1 '+(rr+4+rr*Math.sin(a)).toFixed(2)+' '+(rr+4-rr*Math.cos(a)).toFixed(2)+'" fill="none" stroke="#cfccc6" stroke-width="3" opacity=".9"/>','position:absolute;left:'+(ccx-rr-4)+'px;top:'+(ccy-rr-4)+'px;z-index:9',hud)}
    var im=new Image();im.src=UI+(mp?'ui_globe_mp.png':'ui_globe_hp.png');im.alt='';im.setAttribute('style','position:absolute;left:'+fx+'px;top:'+fy+'px;width:'+F+'px;height:'+F+'px;filter:'+ART_FILTER+' drop-shadow(0 6px 14px rgba(0,0,0,.6));z-index:8');hud.appendChild(im);
    // 포이즈 눈: 뿔 해골 눈 자리(틀 좌표 128·145, 38.5 /263), 켜질 때만 진홍
    if(cfg.poise)[128,145].forEach(function(ex){el('div','','position:absolute;left:'+(fx+ex*s-3)+'px;top:'+(fy+38.5*s-3)+'px;width:6px;height:6px;border-radius:50%;background:#f16937;box-shadow:0 0 6px 2px rgba(194,26,16,.85),0 0 14px 4px rgba(194,26,16,.45);z-index:9',hud)});
    nums(cx,mp,L);
  }
  function nums(cx,mp,L){
    if(!mp){var cy2=orbCY+cfg.numDy;
      var c=el('div','rv cur','left:'+(cx-L/2)+'px;width:'+L+'px;top:'+(cy2-cfg.hpCur*.62)+'px;--cs:'+cfg.hpCur+'px',hud);c.textContent=cfg.hpT[0];
      el('div','hair','left:'+(cx-22)+'px;width:44px;top:'+(cy2+cfg.hpCur*.48)+'px',hud);
      var m=el('div','rv max','left:'+(cx-L/2)+'px;width:'+L+'px;top:'+(cy2+cfg.hpCur*.48+5)+'px;--ms:'+cfg.hpMax+'px',hud);m.textContent=cfg.hpT[1];}
    else{[['MP',cfg.mpT,-1],['ST',cfg.stT,1]].forEach(function(r){var hx=cx+r[2]*L/4,w=L/2,cy3=orbCY+cfg.numDy;
      var ls=cfg.labSize||10;var l=el('div','rv lab','left:'+(hx-w/2)+'px;width:'+w+'px;top:'+(cy3-cfg.rsCur*.62-ls-6)+'px;--ls:'+ls+'px;color:'+(cfg.labSize?'var(--tx)':'var(--tx-2)'),hud);l.textContent=r[0];
      var c=el('div','rv cur','left:'+(hx-w/2)+'px;width:'+w+'px;top:'+(cy3-cfg.rsCur*.62)+'px;--cs:'+cfg.rsCur+'px',hud);c.textContent=r[1][0];
      el('div','hair','left:'+(hx-14)+'px;width:28px;top:'+(cy3+cfg.rsCur*.48)+'px',hud);
      var m=el('div','rv max','left:'+(hx-w/2)+'px;width:'+w+'px;top:'+(cy3+cfg.rsCur*.48+4)+'px;--ms:'+cfg.rsMax+'px;color:var(--tx-2)',hud);m.textContent=r[1][1];})}
  }
  orb(lcx,false);orb(rcx,true);
  // 측정 안내선(?guides): 레일 윗면·구체 중심·슬롯 중심
  [[0,base,1920,0],[0,orbCY,1920,0],[0,cy,1920,0]].forEach(function(g){el('div','guide','left:'+g[0]+'px;top:'+g[1]+'px;width:'+g[2]+'px;height:0',st)});
  window.HUD_METRICS={orbCenterY:orbCY,orbOuter:cfg.orbOuter,liquid:cfg.liquid,orbBottom:orbCY+R,orbTop:orbCY-R,leftCX:lcx,rightCX:rcx,plate:[plateX,plateY,plateW,cfg.plateH],slotCY:cy,railTop:base,groupW:rcx-lcx+2*R,slotsInk:pos.reduce(function(a,p){return a+p.d},0),rowW:rowW};
};
window.fitStage=function(){function f(){var s=Math.min(innerWidth/1920,innerHeight/1080);document.getElementById('stage').style.transform='scale('+s+')'}addEventListener('resize',f);f();if(/guides/.test(location.search))document.body.classList.add('guides')};
})();
