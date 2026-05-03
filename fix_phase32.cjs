// Phase 32 — 전체 바이너리 스위치 → _L() 전환 종합 스크립트
const fs = require('fs');
const BASE = 'G:/hell';

let src = fs.readFileSync(`${BASE}/game.html`, 'utf8');

// ── 헬퍼 ────────────────────────────────────────────────────────────────────
function rep(from, to) {
  if (!src.includes(from)) {
    console.warn('NOT FOUND:', from.slice(0, 80));
    return;
  }
  src = src.replace(from, to);
}

// ════════════════════════════════════════════════════════════════════════════
// 1. 전역 _L 함수 추가 (function _T 정의 직후)
// ════════════════════════════════════════════════════════════════════════════
rep(
  'function _T(s){',
  'function _L(ko,en){if(OPT.lang===\'ko\')return ko;const _lt=_T(ko);return _lt===ko?en:_lt}\n'+
  'function _T(s){'
);

// ════════════════════════════════════════════════════════════════════════════
// 2. 헬퍼 함수 수정
// ════════════════════════════════════════════════════════════════════════════
rep(
  "function _diffName(i){return OPT.lang!=='ko'?DIFF_NAME_EN[i]:DIFF_NAME[i]}",
  "function _diffName(i){return _L(DIFF_NAME[i],DIFF_NAME_EN[i])}"
);
rep(
  "function _rarName(i){return OPT.lang!=='ko'?RARITY_N_EN[i]:RARITY_N[i]}",
  "function _rarName(i){return _L(RARITY_N[i],RARITY_N_EN[i])}"
);
rep(
  "function _slotName(i){return OPT.lang!=='ko'?SLOT_EN[i]:SLOT_KR[i]}",
  "function _slotName(i){return _L(SLOT_KR[i],SLOT_EN[i])}"
);
rep(
  "function _rarLabel(i){return OPT.lang!=='ko'?RAR_LABEL_EN[i]:RAR_LABEL[i]}",
  "function _rarLabel(i){return _L(RAR_LABEL[i],RAR_LABEL_EN[i])}"
);
rep(
  "function _skN(info){return OPT.lang!=='ko'&&info.nameEn?info.nameEn:info.name}",
  "function _skN(info){return _L(info.name,info.nameEn||info.name)}"
);
rep(
  "function _skD(info){return OPT.lang!=='ko'&&info.descEn?info.descEn:info.desc}",
  "function _skD(info){return _L(info.desc,info.descEn||info.desc)}"
);
rep(
  "function _fuseName(key){return OPT.lang!=='ko'?(_FUSE_NAMES_EN[key]||key):(_FUSE_NAMES[key]||key)}",
  "function _fuseName(key){return _L(_FUSE_NAMES[key]||key,_FUSE_NAMES_EN[key]||key)}"
);
rep(
  "function _crDescTxt(cd){const d=_CR_DESC[cd.stat];return d?(OPT.lang!=='ko'?d.en:d.ko):cd.stat}",
  "function _crDescTxt(cd){const d=_CR_DESC[cd.stat];return d?_L(d.ko,d.en):cd.stat}"
);
rep(
  "function _crStarN(s){return OPT.lang!=='ko'?s.en:s.name}",
  "function _crStarN(s){return _L(s.name,s.en)}"
);

// ════════════════════════════════════════════════════════════════════════════
// 3. 키 바인딩 이름 (lines ~4575-4580)
// ════════════════════════════════════════════════════════════════════════════
rep("if(!code)return OPT.lang!=='ko'?'None':'없음';",
    "if(!code)return _L('없음','None');");
rep("if(code==='mouse0')return OPT.lang!=='ko'?'LMB':'좌클릭';",
    "if(code==='mouse0')return _L('좌클릭','LMB');");
rep("if(code==='mouse1')return OPT.lang!=='ko'?'MMB':'휠클릭';",
    "if(code==='mouse1')return _L('휠클릭','MMB');");
rep("if(code==='mouse2')return OPT.lang!=='ko'?'RMB':'우클릭';",
    "if(code==='mouse2')return _L('우클릭','RMB');");
rep("if(code==='mouse3')return OPT.lang!=='ko'?'Mouse4':'마우스4';",
    "if(code==='mouse3')return _L('마우스4','Mouse4');");
rep("if(code==='mouse4')return OPT.lang!=='ko'?'Mouse5':'마우스5';",
    "if(code==='mouse4')return _L('마우스5','Mouse5');");

// ════════════════════════════════════════════════════════════════════════════
// 4. F4 안개 / T 자동석궁 토글
// ════════════════════════════════════════════════════════════════════════════
rep(
  "showPH((_nf?(OPT.lang!=='ko'?'Fog ON':'안개 ON'):(OPT.lang!=='ko'?'Fog OFF':'안개 OFF'))",
  "showPH(_nf?_L('안개 ON','Fog ON'):_L('안개 OFF','Fog OFF')"
);
rep(
  "showPH(_xbowEquipped?(OPT.lang!=='ko'?'Auto Crossbow ON':'석궁 자동발사 ON'):(OPT.lang!=='ko'?'Auto Crossbow OFF':'석궁 자동발사 OFF'),_xbowEquipped?'#ffe066':'#888888');",
  "showPH(_xbowEquipped?_L('석궁 자동발사 ON','Auto Crossbow ON'):_L('석궁 자동발사 OFF','Auto Crossbow OFF'),_xbowEquipped?'#ffe066':'#888888');"
);
// settings checkbox handler
rep(
  "showPH(_xbowEquipped?(OPT.lang!=='ko'?'Auto Crossbow ON':'석궁 자동발사 ON'):(OPT.lang!=='ko'?'Auto Crossbow OFF':'석궁 자동발사 OFF'),_xbowEquipped?'#ffe066':'#888888')};",
  "showPH(_xbowEquipped?_L('석궁 자동발사 ON','Auto Crossbow ON'):_L('석궁 자동발사 OFF','Auto Crossbow OFF'),_xbowEquipped?'#ffe066':'#888888')};"
);

// ════════════════════════════════════════════════════════════════════════════
// 5. 결정 슬롯 UI
// ════════════════════════════════════════════════════════════════════════════
rep(
  "return(OPT.lang!=='ko'?'Slots: ':'슬롯: ')+cd.slots.map(s=>_slotName(SLOT_NAMES.indexOf(s))).join(',');}",
  "return _L('슬롯: ','Slots: ')+cd.slots.map(s=>_slotName(SLOT_NAMES.indexOf(s))).join(',');}"
);
rep(
  "h+='<span onclick=\"_crBagFilter=\\'s'+si+'\\';renderCrystalBag()\" style=\"cursor:pointer;padding:1px 6px;font-size:.75rem;border:1px solid '+(_crBagFilter==='s'+si?CRYSTAL_STAR[si].color:'#443322')+';color:'+(_crBagFilter==='s'+si?CRYSTAL_STAR[si].color:'#887766')+';border-radius:3px\">'+(si+1)+(OPT.lang!=='ko'?'★':'성')+'</span>';",
  "h+='<span onclick=\"_crBagFilter=\\'s'+si+'\\';renderCrystalBag()\" style=\"cursor:pointer;padding:1px 6px;font-size:.75rem;border:1px solid '+(_crBagFilter==='s'+si?CRYSTAL_STAR[si].color:'#443322')+';color:'+(_crBagFilter==='s'+si?CRYSTAL_STAR[si].color:'#887766')+';border-radius:3px\">'+(si+1)+_L('성','★')+'</span>';"
);
rep(
  "notify((OPT.lang!=='ko'?'Can only equip on: ':'장착 가능: ')+_cd.slots.map(s=>_slotName(SLOT_NAMES.indexOf(s))).join(', '));",
  "notify(_L('장착 가능: ','Can only equip on: ')+_cd.slots.map(s=>_slotName(SLOT_NAMES.indexOf(s))).join(', '));"
);

// ════════════════════════════════════════════════════════════════════════════
// 6. 레벨 부족 / 강화 이전
// ════════════════════════════════════════════════════════════════════════════
rep(
  "notify(_T('레벨 부족! (요구: Lv.')+item.reqLv+(OPT.lang!=='ko'?', Current: Lv.':', 현재: Lv.')+P.lv+')');return;",
  "notify(_T('레벨 부족! (요구: Lv.')+item.reqLv+_L(', 현재: Lv.',', Current: Lv.')+P.lv+')');return;"
);
rep(
  "notify(OPT.lang!=='ko'?`⚒ +${fromE} Enhancement transferred (-${xc.toLocaleString()} Malice)`:`⚒ +${fromE} 강화 이전 완료 (-${xc.toLocaleString()}악의)`);",
  "notify(`⚒ +${fromE} `+_L('강화 이전 완료','Enhancement transferred')+` (-${xc.toLocaleString()}`+_L('악의)',' Malice)'));"
);
rep(
  "try{addTxt(P.x,P.y-25,'⚒ +'+fromE+(OPT.lang!=='ko'?' Transfer':' 이전'),enhColor(fromE),80)}catch(_e){}",
  "try{addTxt(P.x,P.y-25,'⚒ +'+fromE+_L(' 이전',' Transfer'),enhColor(fromE),80)}catch(_e){}"
);
rep(
  "notify(OPT.lang!=='ko'?`Not enough Malice! Transfer cost ${xc.toLocaleString()} (Have: ${(G.mats||0).toLocaleString()})`:`악의 부족! 강화 이전 비용 ${xc.toLocaleString()}악의 (보유: ${(G.mats||0).toLocaleString()})`);",
  "notify(_L('악의 부족! 강화 이전 비용 ','Not enough Malice! Transfer cost ')+xc.toLocaleString()+_L('악의 (보유: ',' (Have: ')+(G.mats||0).toLocaleString()+')');"
);
rep(
  "if(_crMsg.length>0)notify(OPT.lang!=='ko'?'💎 Crystal to bag: '+_crMsg.join(', '):'💎 결정 주머니로: '+_crMsg.join(', '));",
  "if(_crMsg.length>0)notify(_L('💎 결정 주머니로: ','💎 Crystal to bag: ')+_crMsg.join(', '));"
);
rep(
  "else if(item.crystals.some(c=>c))notify(OPT.lang!=='ko'?'💎 Crystals transferred':'💎 결정 자동 전승 완료');",
  "else if(item.crystals.some(c=>c))notify(_L('💎 결정 자동 전승 완료','💎 Crystals transferred'));"
);

// ════════════════════════════════════════════════════════════════════════════
// 7. 강화 달성 / 쿨타임 's'
// ════════════════════════════════════════════════════════════════════════════
rep(
  "addTxt(P.x,P.y-30,'+'+res.to+(OPT.lang!=='ko'?' Achieved!':' 달성!'),enhColor(res.to),100);",
  "addTxt(P.x,P.y-30,'+'+res.to+_L(' 달성!',' Achieved!'),enhColor(res.to),100);"
);
src = src.replace(/\(OPT\.lang!=='ko'\?'s':'초'\)/g, "_L('초','s')");

// ════════════════════════════════════════════════════════════════════════════
// 8. ST/Malice 부족
// ════════════════════════════════════════════════════════════════════════════
rep(
  "addTxt(P.x,P.y-25,OPT.lang!=='ko'?(P.st<_cbCost?'ST':'Malice')+' needed!':(P.st<_cbCost?'ST':'악의')+' 부족!','#ff4444',30)",
  "addTxt(P.x,P.y-25,(P.st<_cbCost?'ST':_L('악의','Malice'))+_L(' 부족!',' needed!'),'#ff4444',30)"
);

// ════════════════════════════════════════════════════════════════════════════
// 9. 상자 개봉 / 히트카운트 / 흡수
// ════════════════════════════════════════════════════════════════════════════
rep(
  "addTxt(it.x,it.y-15,_dNm+(OPT.lang!=='ko'?' Opened!':' 개봉!'),_dCol,50)",
  "addTxt(it.x,it.y-15,_dNm+_L(' 개봉!',' Opened!'),_dCol,50)"
);
src = src.replace(/\+(OPT\.lang!=='ko'\?' Hit':'타')\)/g, "+_L('타',' Hit')");
rep(
  "addTxt(p.x,p.y-10,(p.redBean?(OPT.lang!=='ko'?'🕊️Red absorb -':'🕊️빨콩 흡수 -'):(OPT.lang!=='ko'?'🕊️Absorb -':'🕊️흡수 -'))+_absDmg,p.redBean?'#ff6644':'#ffaadd',25);",
  "addTxt(p.x,p.y-10,(p.redBean?_L('🕊️빨콩 흡수 -','🕊️Red absorb -'):_L('🕊️흡수 -','🕊️Absorb -'))+_absDmg,p.redBean?'#ff6644':'#ffaadd',25);"
);

// ════════════════════════════════════════════════════════════════════════════
// 10. 엘리트 부활 / 보스 상태
// ════════════════════════════════════════════════════════════════════════════
rep(
  "addTxt(e.x,e.y-30,(OPT.lang!=='ko'?'Revive! Power ':'부활 성공! 부활력 ')+e._revPts+'/'+e._maxRevPts,'#ff8844',60);",
  "addTxt(e.x,e.y-30,_L('부활 성공! 부활력 ','Revive! Power ')+e._revPts+'/'+e._maxRevPts,'#ff8844',60);"
);
rep(
  "const _phLbl=_deathN>0?(' ['+(_deathN<=3?'⚠':'🔥')+' '+_deathN+(OPT.lang!=='ko'?' Revive':' 차 부활')+']'):'';",
  "const _phLbl=_deathN>0?(' ['+(_deathN<=3?'⚠':'🔥')+' '+_deathN+_L(' 차 부활',' Revive')+']'):'';"
);
rep(
  "_poiL.textContent=(OPT.lang!=='ko'?'Groggy! ':'그로기! ')+(bE.stunned/60).toFixed(1)+'s';_poiL.style.color='#ffaa00';",
  "_poiL.textContent=_L('그로기! ','Groggy! ')+(bE.stunned/60).toFixed(1)+'s';_poiL.style.color='#ffaa00';"
);
rep(
  "_poiL.textContent=(OPT.lang!=='ko'?'Immune ':'면역 ')+(bE._pImmune/60).toFixed(0)+'s';_poiL.style.color='#8888ff';",
  "_poiL.textContent=_L('면역 ','Immune ')+(bE._pImmune/60).toFixed(0)+'s';_poiL.style.color='#8888ff';"
);
rep(
  "_poiL.textContent=(OPT.lang!=='ko'?'Poise ':'그로기 ')+~~(_poisePct)+'%';_poiL.style.color=_poisePct<30?'#ff6644':_poisePct<60?'#ffcc44':'#dddddd';",
  "_poiL.textContent=_L('포이즈 ','Poise ')+~~(_poisePct)+'%';_poiL.style.color=_poisePct<30?'#ff6644':_poisePct<60?'#ffcc44':'#dddddd';"
);

// ════════════════════════════════════════════════════════════════════════════
// 11. 방향 배열 (보스 패턴)
// ════════════════════════════════════════════════════════════════════════════
rep(
  "const _dirNames=OPT.lang!=='ko'?['Top→Bottom','Right→Left','Bottom→Top','Left→Right']:['위→아래','오른→왼','아래→위','왼→오른'];",
  "const _dirNames=[_L('위→아래','Top→Bottom'),_L('오른→왼','Right→Left'),_L('아래→위','Bottom→Top'),_L('왼→오른','Left→Right')];"
);

// ════════════════════════════════════════════════════════════════════════════
// 12. 악의 도둑질 / 소환 / 설치
// ════════════════════════════════════════════════════════════════════════════
rep(
  "addTxt(P.x,P.y-20,'-'+steal+(OPT.lang!=='ko'?' Malice!':' 악의!'),'#ddcc00',30)",
  "addTxt(P.x,P.y-20,'-'+steal+_L(' 악의!',' Malice!'),'#ddcc00',30)"
);
src = src.replace(/addTxt\(e\.x,e\.y-20,OPT\.lang!=='ko'\?cnt\+' Summoned!':cnt\+'체 소환!',/g,
  "addTxt(e.x,e.y-20,cnt+_L('체 소환!',' Summoned!'),");
rep(
  "SFX.charge();addParts(e.x,e.y,'#ffcc00',12);addTxt(e.x,e.y-20,OPT.lang!=='ko'?mc+' Placed!':mc+'개 설치!','#ffcc00',35);",
  "SFX.charge();addParts(e.x,e.y,'#ffcc00',12);addTxt(e.x,e.y-20,mc+_L('개 설치!',' Placed!'),'#ffcc00',35);"
);

// ════════════════════════════════════════════════════════════════════════════
// 13. 클리어/탈출 화면
// ════════════════════════════════════════════════════════════════════════════
rep(
  "addTxt(P.x,P.y-80,_T('⏱ 타임어택 ')+(_taPrev?(OPT.lang!=='ko'?'New Record! ':'신기록! '):(OPT.lang!=='ko'?'Clear! ':'클리어! '))+_taM+':'+((_taS<10?'0':'')+_taS),'#44ddff',120);",
  "addTxt(P.x,P.y-80,_T('⏱ 타임어택 ')+(_taPrev?_L('신기록! ','New Record! '):_L('클리어! ','Clear! '))+_taM+':'+((_taS<10?'0':'')+_taS),'#44ddff',120);"
);
rep(
  "addTxt(P.x,P.y-80,_T('처치율 ')+~~(_taKillPct*100)+(OPT.lang!=='ko'?'% (90% needed)':'% (90% 필요)'),'#aa8866',80);",
  "addTxt(P.x,P.y-80,_T('처치율 ')+~~(_taKillPct*100)+_L('% (90% 필요)','% (90% needed)'),'#aa8866',80);"
);
rep(
  "showPH(_T(HELL_NAMES[hellIdx])+(OPT.lang!=='ko'?' Escaped!':' 탈출!'),'#44ffaa');",
  "showPH(_T(HELL_NAMES[hellIdx])+_L(' 탈출!',' Escaped!'),'#44ffaa');"
);
rep(
  "addTxt(P.x,P.y-50,'🔓 '+_T(HELL_NAMES[hellIdx])+(OPT.lang!=='ko'?' Escaped!':' 탈출!'),'#44ffaa',100);",
  "addTxt(P.x,P.y-50,'🔓 '+_T(HELL_NAMES[hellIdx])+_L(' 탈출!',' Escaped!'),'#44ffaa',100);"
);
rep(
  "$('clearTitle').textContent='🔓 '+_T(HELL_NAMES[hellIdx])+(OPT.lang!=='ko'?' Escaped!':' 탈출!');",
  "$('clearTitle').textContent='🔓 '+_T(HELL_NAMES[hellIdx])+_L(' 탈출!',' Escaped!');"
);
rep(
  "$('clearSub').textContent=OPT.lang!=='ko'?'The next sub-hell awaits...':'다음 소지옥이 기다리고 있다...';",
  "$('clearSub').textContent=_L('다음 소지옥이 기다리고 있다...','The next sub-hell awaits...');"
);
rep(
  "$('nextBtn').textContent=OPT.lang!=='ko'?'Next Sub-hell ▶':'다음 소지옥으로 ▶';",
  "$('nextBtn').textContent=_L('다음 소지옥으로 ▶','Next Sub-hell ▶');"
);
rep(
  "$('clearTitle').textContent=OPT.lang!=='ko'?'Area Clear!':'구역 클리어!';",
  "$('clearTitle').textContent=_L('구역 클리어!','Area Clear!');"
);
rep(
  "$('clearSub').textContent=OPT.lang!=='ko'?'Prepare and move on':'정비 후 다음으로 이동하세요';",
  "$('clearSub').textContent=_L('정비 후 다음으로 이동하세요','Prepare and move on');"
);
rep(
  "$('nextBtn').textContent=OPT.lang!=='ko'?'Next Area ▶':'다음 구역으로 ▶';",
  "$('nextBtn').textContent=_L('다음 구역으로 ▶','Next Area ▶');"
);

// ════════════════════════════════════════════════════════════════════════════
// 14. 엘리트 처치 / 장비 토해냄
// ════════════════════════════════════════════════════════════════════════════
rep(
  "addTxt(e.x,e.y-55,_T('💀 ')+e.deaths+(OPT.lang!=='ko'?' Revive! ':'차 부활! ')+_revPct+'%',_revPct>=80?'#ff2244':_revPct>=50?'#ff8844':'#ffcc44',50);",
  "addTxt(e.x,e.y-55,_T('💀 ')+e.deaths+_L('차 부활! ',' Revive! ')+_revPct+'%',_revPct>=80?'#ff2244':_revPct>=50?'#ff8844':'#ffcc44',50);"
);
rep(
  "addTxt(e.x,e.y-70,(OPT.lang!=='ko'?'Revive Power -':'부활력 -')+_revCost+' ('+e._revPts+'/'+e._maxRevPts+')',_revCost>=13?'#ffdd44':'#ffffff',60);",
  "addTxt(e.x,e.y-70,_L('부활력 -','Revive Power -')+_revCost+' ('+e._revPts+'/'+e._maxRevPts+')',_revCost>=13?'#ffdd44':'#ffffff',60);"
);
rep(
  "if(G.combo>=1000&&G.combo%1000===0){const _cbPct=~~((~~(G.combo/100)*0.05+(OPT.diff||0)*0.10)*100);addTxt(P.x,P.y-40,'🔥 '+G.combo+' COMBO!'+(_cbPct>0?' +'+_cbPct+(OPT.lang!=='ko'?'% Bonus':'%보상'):''),'#ffaa00',50)}",
  "if(G.combo>=1000&&G.combo%1000===0){const _cbPct=~~((~~(G.combo/100)*0.05+(OPT.diff||0)*0.10)*100);addTxt(P.x,P.y-40,'🔥 '+G.combo+' COMBO!'+(_cbPct>0?' +'+_cbPct+_L('%보상','% Bonus'):''),'#ffaa00',50)}"
);
rep(
  "addTxt(e.x,e.y-30,_T(ELITE_TIERS[e.elite].name)+(OPT.lang!=='ko'?' Defeated!':' 처치!'),ELITE_TIERS[e.elite].col,50)",
  "addTxt(e.x,e.y-30,_T(ELITE_TIERS[e.elite].name)+_L(' 처치!',' Defeated!'),ELITE_TIERS[e.elite].col,50)"
);
rep(
  "addTxt(e.x,e.y-e.r-10,OPT.lang!=='ko'?e._eatenItems.length+' gear spat out!':_T('장비 ')+e._eatenItems.length+'개 토해냄!','#ffcc44',40);",
  "addTxt(e.x,e.y-e.r-10,_T('장비 ')+e._eatenItems.length+_L('개 토해냄!',' gear spat out!'),'#ffcc44',40);"
);

// ════════════════════════════════════════════════════════════════════════════
// 15. 근접 몬스터/보스/레어 이름
// ════════════════════════════════════════════════════════════════════════════
rep(
  "if(_nrE.isBoss)_nrName=STG[G.stage]?_T(STG[G.stage].bn):(OPT.lang!=='ko'?'Boss':'보스');",
  "if(_nrE.isBoss)_nrName=STG[G.stage]?_T(STG[G.stage].bn):_L('보스','Boss');"
);
rep(
  "else if(_nrE.etype>=90)_nrName=OPT.lang!=='ko'?'Rare Mob':'레어몹';",
  "else if(_nrE.etype>=90)_nrName=_L('레어몹','Rare Mob');"
);
rep(
  "else _nrName=(OPT.lang!=='ko'?'Monster(':'몬스터(')+_nrE.etype+')';",
  "else _nrName=_L('몬스터(','Monster(')+_nrE.etype+')';"
);

// ════════════════════════════════════════════════════════════════════════════
// 16. 사망 정보 / 리플레이 스킵
// ════════════════════════════════════════════════════════════════════════════
rep(
  "const _dlSrc=(opts&&opts.src)||(_isDot?(OPT.lang!=='ko'?'DoT':'도트'):(OPT.lang!=='ko'?'Projectile':'투사체'));",
  "const _dlSrc=(opts&&opts.src)||(_isDot?_L('도트','DoT'):_L('투사체','Projectile'));"
);
rep(
  "$('drTime').textContent='-'+(totalSec-origSec).toFixed(1)+'s  '+(OPT.lang!=='ko'?'(Click: Skip)':'(클릭: 건너뛰기)');",
  "$('drTime').textContent='-'+(totalSec-origSec).toFixed(1)+'s  '+_L('(클릭: 건너뛰기)','(Click: Skip)');"
);
// death info line
rep(
  "const _eL=OPT.lang!=='ko';\n  const _hn=_T(HELL_NAMES[STG[G.stage].hell]);\n  const infoTxt=_eL?`💀 ${G.kills} kills | ${_hn} | EXP -${expLoss} | 🔥 Max Combo ${G.comboMax}`:`💀 ${G.kills} 처치 | ${_hn} ${STG[G.stage].kr} | 경험치 -${expLoss} | 🔥 최대콤보 ${G.comboMax}`;",
  "const _hn=_T(HELL_NAMES[STG[G.stage].hell]);\n  const infoTxt=`💀 ${G.kills} `+_L('처치','kills')+` | ${_hn} | EXP -${expLoss} | 🔥 `+_L('최대콤보','Max Combo')+` ${G.comboMax}`;"
);

// ════════════════════════════════════════════════════════════════════════════
// 17. 스킬창 (K창)
// ════════════════════════════════════════════════════════════════════════════
// skill popup: descEn
rep(
  "d.innerHTML=`<span class=\"sk-opt-emoji\">${sk.emoji||'🔮'}</span><span class=\"sk-opt-name\">${_T(sk.name)}</span><span class=\"sk-opt-desc\">${(OPT.lang!=='ko'?(sk.descEn||sk.desc):sk.desc).slice(0,30)}</span>`;",
  "d.innerHTML=`<span class=\"sk-opt-emoji\">${sk.emoji||'🔮'}</span><span class=\"sk-opt-name\">${_T(sk.name)}</span><span class=\"sk-opt-desc\">${_L(sk.desc,sk.descEn||sk.desc).slice(0,30)}</span>`;"
);
// click: set fuse
rep(
  "d.innerHTML='<span class=\"sk-opt-emoji\">'+ct.fuseName.split(' ')[0]+'</span><span class=\"sk-opt-name\">'+ct.fuseName.split(' ').slice(1).join(' ')+'</span><span class=\"sk-opt-desc\">'+(OPT.lang!=='ko'?'Click: Set':'클릭: 세팅')+'</span>';",
  "d.innerHTML='<span class=\"sk-opt-emoji\">'+ct.fuseName.split(' ')[0]+'</span><span class=\"sk-opt-name\">'+ct.fuseName.split(' ').slice(1).join(' ')+'</span><span class=\"sk-opt-desc\">'+_L('클릭: 세팅','Click: Set')+'</span>';"
);
// fuse set confirm / unset
rep(
  "addTxt(P.x,P.y-30,ct.fuseName+(OPT.lang!=='ko'?' Set!':' 세팅!'),'#ffcc44',40)",
  "addTxt(P.x,P.y-30,ct.fuseName+_L(' 세팅!',' Set!'),'#ffcc44',40)"
);
// various " Set!" → _L
src = src.replace(
  /\(OPT\.lang!=='ko'\?' Set!':' 세팅!'\)/g,
  "_L(' 세팅!',' Set!')"
);
rep(
  "d.innerHTML='<span class=\"sk-opt-desc\">'+(OPT.lang!=='ko'?'No skills learned':'스킬 미습득')+'</span>';",
  "d.innerHTML='<span class=\"sk-opt-desc\">'+_L('스킬 미습득','No skills learned')+'</span>';"
);
// slotRestore
rep(
  "dNone.innerHTML='<span class=\"sk-opt-emoji\">❌</span><span class=\"sk-opt-name\">'+_T('해제')+'</span><span class=\"sk-opt-desc\">'+(OPT.lang!=='ko'?'Restore to potion slot':'포션 슬롯으로 복원')+'</span>';",
  "dNone.innerHTML='<span class=\"sk-opt-emoji\">❌</span><span class=\"sk-opt-name\">'+_T('해제')+'</span><span class=\"sk-opt-desc\">'+_L('포션 슬롯으로 복원','Restore to potion slot')+'</span>';"
);
// slot unset
rep(
  "const _slL=slotIdx<4?(_e?'Slot ':'슬롯')+(slotIdx+1):slotIdx===4?(_e?'SP Slot':'SP슬롯'):(_e?'F Slot':'F슬롯');addTxt(P.x,P.y-20,_slL+(_e?' Unset':' 해제'),'#888',30)}};",
  "const _slL=(slotIdx<4?_L('슬롯','Slot ')+(slotIdx+1):slotIdx===4?_L('SP슬롯','SP Slot'):_L('F슬롯','F Slot'));addTxt(P.x,P.y-20,_slL+_L(' 해제',' Unset'),'#888',30)}};"
);
// K창 헤더
rep(
  "_si.innerHTML='LV.'+P.lv+' | SP: '+P.sp+(OPT.lang!=='ko'?' | Malice: ':' | 악의: ')+G.mats+(OPT.lang!=='ko'?' | Harpoon: ':' | 작살: ')+~~_harpGauge+'/'+_HARP_GAUGE_MAX;",
  "_si.innerHTML='LV.'+P.lv+' | SP: '+P.sp+_L(' | 악의: ',' | Malice: ')+G.mats+_L(' | 작살: ',' | Harpoon: ')+~~_harpGauge+'/'+_HARP_GAUGE_MAX;"
);
rep(
  "const _cb=$('skCompBtn');if(_cb)_cb.textContent=_skCompact?(OPT.lang!=='ko'?'Expand [K]':'펼치기 [K]'):(OPT.lang!=='ko'?'Collapse [K]':'접기 [K]');",
  "const _cb=$('skCompBtn');if(_cb)_cb.textContent=_skCompact?_L('펼치기 [K]','Expand [K]'):_L('접기 [K]','Collapse [K]');"
);
// SKILL_CATS nameEn
rep(
  "const _catRaw=OPT.lang!=='ko'?(cat.nameEn||cat.name):cat.name;",
  "const _catRaw=_L(cat.name,cat.nameEn||cat.name);"
);
// SKILL_HIER title tooltip
rep(
  "d.title=(_skDef?(OPT.lang!=='ko'?(_skDef.nameEn||_skDef.name):_skDef.name):skId)+' ['+sd.key+']'}",
  "d.title=(_skDef?_L(_skDef.name,_skDef.nameEn||_skDef.name):skId)+' ['+sd.key+']'}"
);
// need SP
rep(
  "'<div style=\"color:#886644;font-size:.8rem;margin-bottom:4px\">'+(learned?'':(OPT.lang!=='ko'?'Need: ⭐'+sk.spCost+' SP | 👿'+_malCost(sk.matCost||0)+' Malice':'필요: ⭐'+sk.spCost+' SP | 👿'+_malCost(sk.matCost||0)+' 악의'))+'</div>'",
  "'<div style=\"color:#886644;font-size:.8rem;margin-bottom:4px\">'+(learned?'':_L('필요: ⭐','Need: ⭐')+sk.spCost+' SP | 👿'+_malCost(sk.matCost||0)+_L(' 악의',' Malice'))+'</div>'"
);
// unfuse confirm
rep(
  "if(!confirm(_fuseNm+(OPT.lang!=='ko'?' unfuse\\n'+_names.join('+')+' all reset\\n⭐ SP +'+_totalSp+' refund':' 합체 해제\\n'+_names.join('+')+' 모두 리셋\\n⭐ SP +'+_totalSp+' 환불')))return;",
  "if(!confirm(_fuseNm+_L(' 합체 해제\\n'+_names.join('+')+' 모두 리셋\\n⭐ SP +'+_totalSp+' 환불',' unfuse\\n'+_names.join('+')+' all reset\\n⭐ SP +'+_totalSp+' refund')))return;"
);
// base skill no reset
rep(
  "notify(_T(sk.name)+(OPT.lang!=='ko'?' is a base skill (no reset)':'은 기본 스킬입니다 (리셋 불가)'));return}",
  "notify(_T(sk.name)+_L('은 기본 스킬입니다 (리셋 불가)',' is a base skill (no reset)'));return}"
);
// reset confirm
rep(
  "if(!confirm(_T(sk.name)+(_isFreeBase?(OPT.lang!=='ko'?' reset upgrades':' 강화분 리셋'):(OPT.lang!=='ko'?' reset':' 리셋'))+'?\\n⭐ SP +'+_rSp+(OPT.lang!=='ko'?' refund (Malice not returned)':' 환불 (👿 악의는 반납되지 않습니다)')))return;",
  "if(!confirm(_T(sk.name)+(_isFreeBase?_L(' 강화분 리셋',' reset upgrades'):_L(' 리셋',' reset'))+'?\\n⭐ SP +'+_rSp+_L(' 환불 (👿 악의는 반납되지 않습니다)',' refund (Malice not returned)')))return;"
);
// reset text
rep(
  "addTxt(P.x,P.y-30,_T(sk.name)+(OPT.lang!=='ko'?' Reset!':' 리셋!'),'#ff6666',60);",
  "addTxt(P.x,P.y-30,_T(sk.name)+_L(' 리셋!',' Reset!'),'#ff6666',60);"
);
// learned
rep(
  "SFX.levelup();showPH(_T(sk.name)+(OPT.lang!=='ko'?' Learned!':' 습득!'),'#ff4400');",
  "SFX.levelup();showPH(_T(sk.name)+_L(' 습득!',' Learned!'),'#ff4400');"
);
rep(
  "addTxt(P.x,P.y-30,_T(sk.name)+(OPT.lang!=='ko'?' Learned!':' 습득!'),'#ff4400',80);",
  "addTxt(P.x,P.y-30,_T(sk.name)+_L(' 습득!',' Learned!'),'#ff4400',80);"
);
// auto-assign slot
rep(
  "if(_emptyIdx>=0&&!SKILL_SLOTS.includes(sk.id)){SKILL_SLOTS[_emptyIdx]=sk.id;const _e=OPT.lang!=='ko';const _asLbl=_emptyIdx<4?(_e?'Slot ':'슬롯 ')+(_emptyIdx+1):_emptyIdx===4?(_e?'SP Slot':'SP슬롯'):(_e?'F Slot':'F슬롯');addTxt(P.x,P.y-50,_asLbl+(_e?' Assigned!':' 배정!'),'#ff8844',40);updateQS()}",
  "if(_emptyIdx>=0&&!SKILL_SLOTS.includes(sk.id)){SKILL_SLOTS[_emptyIdx]=sk.id;const _asLbl=(_emptyIdx<4?_L('슬롯 ','Slot ')+(_emptyIdx+1):_emptyIdx===4?_L('SP슬롯','SP Slot'):_L('F슬롯','F Slot'));addTxt(P.x,P.y-50,_asLbl+_L(' 배정!',' Assigned!'),'#ff8844',40);updateQS()}"
);
// level lock
rep(
  "if(slv>=_skLvLock&&slv<_skMaxLv)showPH('Lv'+(_skLvLock*100)+(OPT.lang!=='ko'?' to unlock!':' 도달 시 해금!'),'#ff8844');return;}",
  "if(slv>=_skLvLock&&slv<_skMaxLv)showPH('Lv'+(_skLvLock*100)+_L(' 도달 시 해금!',' to unlock!'),'#ff8844');return;}"
);

// ════════════════════════════════════════════════════════════════════════════
// 18. 인벤토리 창
// ════════════════════════════════════════════════════════════════════════════
rep(
  "depHdr.textContent=OPT.lang!=='ko'?`▼ Deposit (Bag ${INV.bag.length})`:`▼ 보관 (가방 ${INV.bag.length}개)`;",
  "depHdr.textContent=_L(`▼ 보관 (가방 ${INV.bag.length}개)`,`▼ Deposit (Bag ${INV.bag.length})`);"
);
rep(
  "const nm=document.createElement('div');nm.textContent=OPT.lang!=='ko'?(cur.nameEn||cur.name):cur.name;",
  "const nm=document.createElement('div');nm.textContent=_L(cur.name,cur.nameEn||cur.name);"
);
// auto pot label
rep(
  "$('optAutoPotVal').textContent=OPT.lang!=='ko'?'HP '+this.value+'% or below':'HP '+this.value+'% 이하';saveSettings()}",
  "$('optAutoPotVal').textContent='HP '+this.value+_L('% 이하','% or below');saveSettings()}"
);
// optMinLv label (x2 occurrences)
src = src.replace(
  /t\+\(OPT\.lang!=='ko'\?\`T \(\$\{l\}Lv\+\)\`:`단 \(\$\{l\}Lv\+\)`\)/g,
  "t+_L(`단 (${l}Lv+)`,`T (${l}Lv+)`)"
);
// crAutoFuse / crAutoEnh labels
rep(
  "const _crAutoFuseLabel=v=>v<0?_T('사용 안 함'):(v+1)+(OPT.lang!=='ko'?'★ and below':'성 이하');",
  "const _crAutoFuseLabel=v=>v<0?_T('사용 안 함'):(v+1)+_L('성 이하','★ and below');"
);
rep(
  "const _crAutoEnhLabel=v=>v<0?_T('사용 안 함'):(v+1)+(OPT.lang!=='ko'?'★ and above':'성 이상');",
  "const _crAutoEnhLabel=v=>v<0?_T('사용 안 함'):(v+1)+_L('성 이상','★ and above');"
);
// FPS bench
rep(
  "$('diagBenchFps').textContent=avgFps+' FPS '+(OPT.lang!=='ko'?'(120-frame avg)':'(120프레임 평균)');",
  "$('diagBenchFps').textContent=avgFps+' FPS '+_L('(120프레임 평균)','(120-frame avg)');"
);
// tier desc
rep(
  "const tierDesc=OPT.lang!=='ko'?{S:'Ultra',A:'High',B:'Medium',C:'Low'}:{S:'최고 품질',A:'고품질',B:'중간 품질',C:'저사양 모드'};",
  "const tierDesc={S:_L('최고 품질','Ultra'),A:_L('고품질','High'),B:_L('중간 품질','Medium'),C:_L('저사양 모드','Low')};"
);
// preset saved/loaded messages
rep(
  "$('saveMsg').style.color='#44cc88';$('saveMsg').textContent=OPT.lang!=='ko'?'Preset '+slot+' saved!':'세팅'+slot+' 저장 완료!';",
  "$('saveMsg').style.color='#44cc88';$('saveMsg').textContent=_L('세팅'+slot+' 저장 완료!','Preset '+slot+' saved!');"
);
rep(
  "if(!raw){$('saveMsg').style.color='#ffaa44';$('saveMsg').textContent=OPT.lang!=='ko'?'Preset '+slot+' no saved data':'세팅'+slot+' 저장된 설정 없음';setTimeout(()=>{$('saveMsg').textContent=''},2000);return}",
  "if(!raw){$('saveMsg').style.color='#ffaa44';$('saveMsg').textContent=_L('세팅'+slot+' 저장된 설정 없음','Preset '+slot+' no saved data');setTimeout(()=>{$('saveMsg').textContent=''},2000);return}"
);
rep(
  "$('saveMsg').style.color='#6699cc';$('saveMsg').textContent=OPT.lang!=='ko'?'Preset '+slot+' loaded!':'세팅'+slot+' 불러오기 완료!';",
  "$('saveMsg').style.color='#6699cc';$('saveMsg').textContent=_L('세팅'+slot+' 불러오기 완료!','Preset '+slot+' loaded!');"
);
// autoPotVal on load
rep(
  "if($('optAutoPot')){const _apV=~~((OPT.autoPotThr||0.99)*100);$('optAutoPot').value=_apV;$('optAutoPotVal').textContent=OPT.lang!=='ko'?'HP '+_apV+'% or below':'HP '+_apV+'% 이하'}",
  "if($('optAutoPot')){const _apV=~~((OPT.autoPotThr||0.99)*100);$('optAutoPot').value=_apV;$('optAutoPotVal').textContent='HP '+_apV+_L('% 이하','% or below')}"
);
// inv help text
rep(
  "`${OPT.lang!=='ko'?'LMB: Select | RMB: Equip | Space: Junk | F: Lock':'좌클릭: 선택 | 우클릭: 장착 | Space: 쓰레기 | F: 잠금'}`",
  "_L('좌클릭: 선택 | 우클릭: 장착 | Space: 쓰레기 | F: 잠금','LMB: Select | RMB: Equip | Space: Junk | F: Lock')"
);
// equip with enhance cost
rep(
  "const _lbl=_fe>0?_T('장착')+' (\\u2692+'+_fe+' \\u2192 '+_xc.toLocaleString()+(OPT.lang!=='ko'?' Malice':'악의')+((G.mats||0)<_xc?' \\u26A0':'')+')'  :_T('장착');",
  "const _lbl=_fe>0?_T('장착')+' (\\u2692+'+_fe+' \\u2192 '+_xc.toLocaleString()+_L('악의',' Malice')+((G.mats||0)<_xc?' \\u26A0':'')+')'  :_T('장착');"
);

// ════════════════════════════════════════════════════════════════════════════
// 19. 결정/인벤 정보바
// ════════════════════════════════════════════════════════════════════════════
rep(
  "{const _rb=$('invResBar');if(_rb)_rb.innerHTML=OPT.lang!=='ko'?'Crystals '+CRYSTAL_BAG.length+'/'+CRYSTAL_BAG_MAX+' | Dust: <span style=\"color:#cc88ff\">'+CRYSTAL_DUST+'</span> | Malice: <span style=\"color:#cc66ff\">'+G.mats+'</span>':'결정 '+CRYSTAL_BAG.length+'/'+CRYSTAL_BAG_MAX+' | 가루: <span style=\"color:#cc88ff\">'+CRYSTAL_DUST+'</span> | 악의: <span style=\"color:#cc66ff\">'+G.mats+'</span>'}",
  "{const _rb=$('invResBar');if(_rb)_rb.innerHTML=_L('결정','Crystals')+' '+CRYSTAL_BAG.length+'/'+CRYSTAL_BAG_MAX+' | '+_L('가루: ','Dust: ')+'<span style=\"color:#cc88ff\">'+CRYSTAL_DUST+'</span> | '+_L('악의: ','Malice: ')+'<span style=\"color:#cc66ff\">'+G.mats+'</span>'}"
);
// bag expand
rep(
  "eb.textContent=OPT.lang!=='ko'?`+6 slots (👿${cost})`:`+6칸 (👿${cost})`;",
  "eb.textContent=_L(`+6칸 (👿${cost})`,`+6 slots (👿${cost})`);"
);
rep(
  "}else{const mx=document.createElement('span');mx.style.cssText='font-size:.95rem;color:#555';mx.textContent=OPT.lang!=='ko'?'MAX':'최대';expDiv.appendChild(mx)}",
  "}else{const mx=document.createElement('span');mx.style.cssText='font-size:.95rem;color:#555';mx.textContent=_L('최대','MAX');expDiv.appendChild(mx)}"
);
rep(
  "'<div style=\"color:#bb88ff;font-size:.75rem;font-weight:700\">'+(OPT.lang!=='ko'?'Crystal':'결정')+' ('+CRYSTAL_BAG.length+'/'+CRYSTAL_BAG_MAX+')</div>'+",
  "'<div style=\"color:#bb88ff;font-size:.75rem;font-weight:700\">'+_L('결정','Crystal')+' ('+CRYSTAL_BAG.length+'/'+CRYSTAL_BAG_MAX+')</div>'+",
);
rep(
  "if(CRYSTAL_BAG.length===0)_crDiv.innerHTML+='<span style=\"color:#555;font-size:.75rem\">'+(OPT.lang!=='ko'?'No crystals':'결정 없음')+'</span>';",
  "if(CRYSTAL_BAG.length===0)_crDiv.innerHTML+='<span style=\"color:#555;font-size:.75rem\">'+_L('결정 없음','No crystals')+'</span>';"
);
rep(
  "if(confirm(_crStarN(cs)+' '+_crDefN(cd)+(OPT.lang!=='ko'?' decompose?\\nCrystal dust +'+dust:' 분해?\\n결정가루 +'+dust))){",
  "if(confirm(_crStarN(cs)+' '+_crDefN(cd)+_L(' 분해?\\n결정가루 +'+dust,' decompose?\\nCrystal dust +'+dust))){"
);

// ════════════════════════════════════════════════════════════════════════════
// 20. 분해 버튼 / 쓰레기 일괄
// ════════════════════════════════════════════════════════════════════════════
rep(
  "_isBtn.style.display='';_isBtn.textContent=OPT.lang!=='ko'?`Salvage (${_isCnt} -> +${_isTot} Malice)`:`선택분해 (${_isCnt}개 -> 악의 +${_isTot})`;",
  "_isBtn.style.display='';_isBtn.textContent=_L(`선택분해 (${_isCnt}개 -> 악의 +${_isTot})`,`Salvage (${_isCnt} -> +${_isTot} Malice)`);"
);
rep(
  "if(!confirm(OPT.lang!=='ko'?`Salvage ${_isCnt} items.\\n👿 ${_isTot} Malice gained.\\n\\n⚠️ Cannot undo!`:`${_isCnt}개 아이템을 분해합니다.\\n👿 ${_isTot} 악의 획득.\\n\\n⚠️ 복구 불가!`))return;",
  "if(!confirm(_L(`${_isCnt}개 아이템을 분해합니다.\\n👿 ${_isTot} 악의 획득.\\n\\n⚠️ 복구 불가!`,`Salvage ${_isCnt} items.\\n👿 ${_isTot} Malice gained.\\n\\n⚠️ Cannot undo!`)))return;"
);
rep(
  "_jkSelBtn.style.display='';_jkSelBtn.textContent=OPT.lang!=='ko'?`Mark all junk (${_nonJunk.length})`:`전체 쓰레기 지정 (${_nonJunk.length}개)`;",
  "_jkSelBtn.style.display='';_jkSelBtn.textContent=_L(`전체 쓰레기 지정 (${_nonJunk.length}개)`,`Mark all junk (${_nonJunk.length})`);"
);
rep(
  "_jkBtn.style.display='';_jkBtn.textContent=OPT.lang!=='ko'?`Salvage all junk (${_jkItems.length} -> +${_jkTot} Malice)`:`쓰레기 전부 분해 (${_jkItems.length}개 -> 악의 +${_jkTot})`;",
  "_jkBtn.style.display='';_jkBtn.textContent=_L(`쓰레기 전부 분해 (${_jkItems.length}개 -> 악의 +${_jkTot})`,`Salvage all junk (${_jkItems.length} -> +${_jkTot} Malice)`);"
);
rep(
  "if(!confirm(OPT.lang!=='ko'?`🗑️ Bulk salvage ${_jkItems.length} junk items.\\n👿 ${_jkTot} Malice gained.\\n\\n⚠️ Favorited items excluded.\\n⚠️ Cannot undo!`:`🗑️ 쓰레기 ${_jkItems.length}개를 일괄 분해합니다.\\n👿 ${_jkTot} 악의 획득.\\n\\n⚠️ 중요잠금 아이템은 제외됩니다.\\n⚠️ 복구 불가!`))return;",
  "if(!confirm(_L(`🗑️ 쓰레기 ${_jkItems.length}개를 일괄 분해합니다.\\n👿 ${_jkTot} 악의 획득.\\n\\n⚠️ 중요잠금 아이템은 제외됩니다.\\n⚠️ 복구 불가!`,`🗑️ Bulk salvage ${_jkItems.length} junk items.\\n👿 ${_jkTot} Malice gained.\\n\\n⚠️ Favorited items excluded.\\n⚠️ Cannot undo!`)))return;"
);

// ════════════════════════════════════════════════════════════════════════════
// 21. 대장간 (Forge)
// ════════════════════════════════════════════════════════════════════════════
// slot list
rep(
  "const slots=[['weapon','⚔️ 무기'],['shield','🛡️ 견갑'],['armor','🦺 갑옷'],['helmet','👑 왕관'],['boots','👢 부츠'],['bow','🏹 활'],['gloves','🧤 장갑'],['pants','👖 바지'],['belt','🥋 벨트'],['necklace','📿 목걸이'],['ring1','💍 반지1'],['ring2','💍 반지2'],['cape','🧣 망토'],['bracelet','⭕ 팔찌'],['headband','🎀 귀걸이']].map(([k,v])=>[k,OPT.lang!=='ko'?_slotEN[k]:v]);",
  "const slots=[['weapon','⚔️ 무기'],['shield','🛡️ 견갑'],['armor','🦺 갑옷'],['helmet','👑 왕관'],['boots','👢 부츠'],['bow','🏹 활'],['gloves','🧤 장갑'],['pants','👖 바지'],['belt','🥋 벨트'],['necklace','📿 목걸이'],['ring1','💍 반지1'],['ring2','💍 반지2'],['cape','🧣 망토'],['bracelet','⭕ 팔찌'],['headband','🎀 귀걸이']].map(([k,v])=>[k,_L(v,_slotEN[k])]);"
);
// enhanced!
rep(
  "addTxt(P.x,P.y-20,'+'+it.enh+(OPT.lang!=='ko'?' Enhanced!':' 강화!'),_ec2,60);",
  "addTxt(P.x,P.y-20,'+'+it.enh+_L(' 강화!',' Enhanced!'),_ec2,60);"
);
// potion enhance
rep(
  "if(!maxed&&lvOk)d.onclick=()=>_fgSelect(label,item.n+(OPT.lang!=='ko'?' Enhance Lv.':' 강화 Lv.')+(lv+1),cost,()=>{POT_LV[item.type]++;G.mats-=cost;addTxt(P.x,P.y-20,item.n+' Lv.'+POT_LV[item.type]+'!','#ffcc00',50);renderForge()});",
  "if(!maxed&&lvOk)d.onclick=()=>_fgSelect(label,item.n+_L(' 강화 Lv.',' Enhance Lv.')+(lv+1),cost,()=>{POT_LV[item.type]++;G.mats-=cost;addTxt(P.x,P.y-20,item.n+' Lv.'+POT_LV[item.type]+'!','#ffcc00',50);renderForge()});"
);
// forge salvage confirm
rep(
  "sumDiv.innerHTML=OPT.lang!=='ko'?`<div style=\"color:#aa8855;font-size:.9rem;margin-bottom:6px\">Selected <span style=\"color:#ff6644;font-weight:700\">${selArr.length}</span> items -> <span style=\"color:#cc66ff;font-weight:700\">${totalMats}</span> Malice expected</div>`:`<div style=\"color:#aa8855;font-size:.9rem;margin-bottom:6px\">선택 <span style=\"color:#ff6644;font-weight:700\">${selArr.length}</span>개 -> <span style=\"color:#cc66ff;font-weight:700\">${totalMats}</span> 악의 획득 예상</div>`;",
  "sumDiv.innerHTML=`<div style=\"color:#aa8855;font-size:.9rem;margin-bottom:6px\">`+_L('선택','Selected')+` <span style=\"color:#ff6644;font-weight:700\">${selArr.length}</span>`+_L('개 ->','  ->')+` <span style=\"color:#cc66ff;font-weight:700\">${totalMats}</span> `+_L('악의 획득 예상','Malice expected')+`</div>`;"
);
rep(
  "btn.textContent=OPT.lang!=='ko'?`Salvage (${selArr.length} -> ${totalMats} Malice)`:`분해 (${selArr.length}개 -> 악의 ${totalMats})`;",
  "btn.textContent=_L(`분해 (${selArr.length}개 -> 악의 ${totalMats})`,`Salvage (${selArr.length} -> ${totalMats} Malice)`);"
);
rep(
  "if(!confirm(OPT.lang!=='ko'?`Salvage ${selArr.length} items.\\n👿 ${totalMats} Malice gained.\\n\\n⚠️ Cannot undo!`:`${selArr.length}개 아이템을 분해합니다.\\n👿 ${totalMats} 악의 획득.\\n\\n⚠️ 복구 불가!`))return;",
  "if(!confirm(_L(`${selArr.length}개 아이템을 분해합니다.\\n👿 ${totalMats} 악의 획득.\\n\\n⚠️ 복구 불가!`,`Salvage ${selArr.length} items.\\n👿 ${totalMats} Malice gained.\\n\\n⚠️ Cannot undo!`)))return;"
);
rep(
  "SFX.forge();addTxt(P.x,P.y-20,'👿 +'+totalMats+(OPT.lang!=='ko'?' Malice':' 악의'),'#cc66ff',80)",
  "SFX.forge();addTxt(P.x,P.y-20,'👿 +'+totalMats+_L(' 악의',' Malice'),'#cc66ff',80)"
);
// reroll header
rep(
  "rHdr.textContent=OPT.lang!=='ko'?'Reroll — Reset prefix/suffix | Malice '+REROLL_COST:'리롤 — 접두/접미 재설정 | 악의 '+REROLL_COST;",
  "rHdr.textContent=_L('리롤 — 접두/접미 재설정 | 악의 '+REROLL_COST,'Reroll — Reset prefix/suffix | Malice '+REROLL_COST);"
);
// affix reroll btn
rep(
  "btnRow.appendChild(mkBtn(OPT.lang!=='ko'?'Affix Reroll':'어픽스 리롤',REROLL_COST,",
  "btnRow.appendChild(mkBtn(_L('어픽스 리롤','Affix Reroll'),REROLL_COST,"
);
// crystal info bar (forge)
rep(
  "cInfo.innerHTML=OPT.lang!=='ko'?'Owned: '+CRYSTAL_BAG.length+'/'+CRYSTAL_BAG_MAX+' | Dust: <span style=\"color:#cc88ff\">'+CRYSTAL_DUST+'</span> | Malice: <span style=\"color:#cc66ff\">'+G.mats+'</span>':'보유: '+CRYSTAL_BAG.length+'/'+CRYSTAL_BAG_MAX+' | 가루: <span style=\"color:#cc88ff\">'+CRYSTAL_DUST+'</span> | 악의: <span style=\"color:#cc66ff\">'+G.mats+'</span>';",
  "cInfo.innerHTML=_L('보유: ','Owned: ')+CRYSTAL_BAG.length+'/'+CRYSTAL_BAG_MAX+' | '+_L('가루: ','Dust: ')+'<span style=\"color:#cc88ff\">'+CRYSTAL_DUST+'</span> | '+_L('악의: ','Malice: ')+'<span style=\"color:#cc66ff\">'+G.mats+'</span>';"
);
// crystal enhance cost
rep(
  "'<div style=\"color:#cc66ff;font-size:.85rem\">'+(OPT.lang!=='ko'?'Cost':'비용')+': 👿'+cost+' + 💎'+_crStarN(s)+' '+_crDefN(d)+' ×1'",
  "'<div style=\"color:#cc66ff;font-size:.85rem\">'+_L('비용','Cost')+': 👿'+cost+' + 💎'+_crStarN(s)+' '+_crDefN(d)+' ×1'"
);
rep(
  "+(ok?'':(!hasFeed?' <span style=\"color:#ff4444\">'+(OPT.lang!=='ko'?'(no feed crystal)':'(재료 결정 없음)')+'</span>':' <span style=\"color:#ff4444\">'+(OPT.lang!=='ko'?'(insufficient)':'(악의 부족)')+'</span>'))+'</div>');",
  "+(ok?'':(!hasFeed?' <span style=\"color:#ff4444\">'+_L('(재료 결정 없음)','(no feed crystal)')+'</span>':' <span style=\"color:#ff4444\">'+_L('(악의 부족)','(insufficient)')+'</span>'))+'</div>');"
);
rep(
  "btn.textContent=_T('강화')+' ('+(OPT.lang!=='ko'?'Malice ':'악의 ')+cost+' + '+(OPT.lang!=='ko'?'Crystal ×1':'결정 ×1')+')';",
  "btn.textContent=_T('강화')+' ('+_L('악의 ','Malice ')+cost+' + '+_L('결정 ×1','Crystal ×1')+')';"
);
// crystal star bar
rep(
  "b.textContent=(si+1)+(OPT.lang!=='ko'?'★ ('+cost+' Dust)':'성 ('+cost+'가루)');",
  "b.textContent=(si+1)+_L('성 ('+cost+'가루)','★ ('+cost+' Dust)');"
);
// crystal craft div
rep(
  "craftDiv.innerHTML='<div style=\"color:'+s.color+';font-size:.9rem;font-weight:700\">'+cd.emoji+' '+_crStarN(s)+' '+_crDefN(cd)+'</div><div style=\"color:#887766;font-size:.8rem\">'+(OPT.lang!=='ko'?'Cost: Dust ':'제작 비용: 가루 ')+dustCost+(CRYSTAL_DUST<dustCost?(OPT.lang!=='ko'?' <span style=\"color:#ff4444\">(insufficient)</span>':' <span style=\"color:#ff4444\">(부족)</span>'):'')+'</div>';",
  "craftDiv.innerHTML='<div style=\"color:'+s.color+';font-size:.9rem;font-weight:700\">'+cd.emoji+' '+_crStarN(s)+' '+_crDefN(cd)+'</div><div style=\"color:#887766;font-size:.8rem\">'+_L('제작 비용: 가루 ','Cost: Dust ')+dustCost+(CRYSTAL_DUST<dustCost?(' <span style=\"color:#ff4444\">'+_L('(부족)','(insufficient)')+'</span>'):'')+'</div>';"
);
// 1★ craft header
rep(
  "secHdr3.textContent=OPT.lang!=='ko'?'Craft 1★ Crystal ('+_crMatsCost+' Malice)':'악의로 1성 결정 제작 ('+_crMatsCost+' 악의)';",
  "secHdr3.textContent=_L('악의로 1성 결정 제작 ('+_crMatsCost+' 악의)','Craft 1★ Crystal ('+_crMatsCost+' Malice)');"
);
// equipment crafting slot names
rep(
  "const _csNames=OPT.lang!=='ko'?{weapon:'Weapon',bow:'Bow',armor:'Armor',shield:'Shield',helmet:'Crown',pants:'Pants',gloves:'Gloves',boots:'Boots',belt:'Belt',necklace:'Necklace',ring:'Ring',cape:'Cape',bracelet:'Bracelet',headband:'Earring'}:{weapon:'무기',bow:'활',armor:'갑옷',shield:'견갑',helmet:'왕관',pants:'바지',gloves:'장갑',boots:'부츠',belt:'벨트',necklace:'목걸이',ring:'반지',cape:'망토',bracelet:'팔찌',headband:'귀걸이'};",
  "const _csNames={weapon:_L('무기','Weapon'),bow:_L('활','Bow'),armor:_L('갑옷','Armor'),shield:_L('견갑','Shield'),helmet:_L('왕관','Crown'),pants:_L('바지','Pants'),gloves:_L('장갑','Gloves'),boots:_L('부츠','Boots'),belt:_L('벨트','Belt'),necklace:_L('목걸이','Necklace'),ring:_L('반지','Ring'),cape:_L('망토','Cape'),bracelet:_L('팔찌','Bracelet'),headband:_L('귀걸이','Earring')};"
);
// equipment crafting header
rep(
  "chdr.textContent=OPT.lang!=='ko'?'🔨 Equipment Crafting':'🔨 장비 제작';",
  "chdr.textContent=_L('🔨 장비 제작','🔨 Equipment Crafting');"
);
// craft cost info
rep(
  "cInfo.innerHTML=(OPT.lang!=='ko'?'Cost: <span style=\"color:#ffaa44;font-weight:700\">'+CRAFT_COST+'</span> Malice per craft &nbsp;|&nbsp; Malice: <span style=\"color:#cc66ff;font-weight:700\">'+G.mats+'</span>':'비용: <span style=\"color:#ffaa44;font-weight:700\">'+CRAFT_COST+'</span> 악의 &nbsp;|&nbsp; 보유: <span style=\"color:#cc66ff;font-weight:700\">'+G.mats+'</span>')+'<br><span style=\"color:'+RARITY_C[3]+'\">'+_T('영웅')+'90%</span> &nbsp; <span style=\"color:'+RARITY_C[4]+'\">'+_T('전설')+'10%</span>';",
  "cInfo.innerHTML=_L('비용: ','Cost: ')+'<span style=\"color:#ffaa44;font-weight:700\">'+CRAFT_COST+'</span> '+_L('악의 &nbsp;|&nbsp; 보유: ','Malice per craft &nbsp;|&nbsp; Malice: ')+'<span style=\"color:#cc66ff;font-weight:700\">'+G.mats+'</span><br><span style=\"color:'+RARITY_C[3]+'\">'+_T('영웅')+'90%</span> &nbsp; <span style=\"color:'+RARITY_C[4]+'\">'+_T('전설')+'10%</span>';"
);
// craft tip
rep(
  "cTip.textContent=OPT.lang!=='ko'?'Click a slot to craft, or expand ▶ to pick from sidebar':'슬롯을 클릭하면 제작, 좌측에서 개별 선택도 가능';",
  "cTip.textContent=_L('슬롯을 클릭하면 제작, 좌측에서 개별 선택도 가능','Click a slot to craft, or expand ▶ to pick from sidebar');"
);
// craft slot names (2nd occurrence)
rep(
  "const slotNames=OPT.lang!=='ko'?{weapon:'Weapon',shield:'Shield',armor:'Armor',helmet:'Crown',boots:'Boots',bow:'Bow',gloves:'Gloves',pants:'Pants',belt:'Belt',necklace:'Necklace',ring:'Ring',cape:'Cape',bracelet:'Bracelet',headband:'Earring'}:{weapon:'무기',shield:'견갑',armor:'갑옷',helmet:'왕관',boots:'부츠',bow:'활',gloves:'장갑',pants:'바지',belt:'벨트',necklace:'목걸이',ring:'반지',cape:'망토',bracelet:'팔찌',headband:'귀걸이'};",
  "const slotNames={weapon:_L('무기','Weapon'),shield:_L('견갑','Shield'),armor:_L('갑옷','Armor'),helmet:_L('왕관','Crown'),boots:_L('부츠','Boots'),bow:_L('활','Bow'),gloves:_L('장갑','Gloves'),pants:_L('바지','Pants'),belt:_L('벨트','Belt'),necklace:_L('목걸이','Necklace'),ring:_L('반지','Ring'),cape:_L('망토','Cape'),bracelet:_L('팔찌','Bracelet'),headband:_L('귀걸이','Earring')};"
);
// craft header slot
rep(
  "hdr.textContent=OPT.lang!=='ko'?`🔨 ${slotEmoji[slot]} Craft ${slotNames[slot]}`:`🔨 ${slotEmoji[slot]} ${slotNames[slot]} 제작`;",
  "hdr.textContent=`🔨 ${slotEmoji[slot]} ${slotNames[slot]}`+_L(' 제작',' Craft').trimEnd();"
);
// matsDiv
rep(
  "matsDiv.innerHTML=OPT.lang!=='ko'?`Malice: <span style=\"color:#cc66ff;font-weight:700\">${G.mats}</span> &nbsp;|&nbsp; Cost: <span style=\"color:#ffaa44;font-weight:700\">${CRAFT_COST}</span>`:`보유 악의: <span style=\"color:#cc66ff;font-weight:700\">${G.mats}</span> &nbsp;|&nbsp; 제작 비용: <span style=\"color:#ffaa44;font-weight:700\">${CRAFT_COST}</span>`;",
  "matsDiv.innerHTML=_L('보유 악의: ','Malice: ')+`<span style=\"color:#cc66ff;font-weight:700\">${G.mats}</span> &nbsp;|&nbsp; `+_L('제작 비용: ','Cost: ')+`<span style=\"color:#ffaa44;font-weight:700\">${CRAFT_COST}</span>`;"
);
// craft btn
rep(
  "btn.textContent=OPT.lang!=='ko'?`🔨 Craft (👿${CRAFT_COST})`:`🔨 제작 (👿${CRAFT_COST})`;",
  "btn.textContent=_L(`🔨 제작 (👿${CRAFT_COST})`,`🔨 Craft (👿${CRAFT_COST})`);"
);
// items crafted
rep(
  "if(_done>1)notify(_done+(OPT.lang!=='ko'?' items crafted!':'개 제작 완료!'));",
  "if(_done>1)notify(_done+_L('개 제작 완료!',' items crafted!'));"
);

// ════════════════════════════════════════════════════════════════════════════
// 22. C창 (캐릭터)
// ════════════════════════════════════════════════════════════════════════════
// refund confirm
rep(
  "if(!confirm(OPT.lang!=='ko'?`Refund all stats ${totalSP} SP + passives ${totalAP} AP.\\nContinue?`:`스탯 ${totalSP} SP + 패시브 ${totalAP} AP 전부 환불합니다.\\n계속?`))return;",
  "if(!confirm(_L(`스탯 ${totalSP} SP + 패시브 ${totalAP} AP 전부 환불합니다.\\n계속?`,`Refund all stats ${totalSP} SP + passives ${totalAP} AP.\\nContinue?`)))return;"
);
// SP Left
rep(
  "$('spRemain').textContent=(OPT.lang!=='ko'?'SP Left: ':'남은 SP: ')+P.sp;",
  "$('spRemain').textContent=_L('남은 SP: ','SP Left: ')+P.sp;"
);
// STAT name/desc
rep(
  '`<div class="stat-name" style="color:${sd.col};font-size:1.6rem;font-weight:700;letter-spacing:.05em">${OPT.lang!==\'ko\'?sd.nameEn:sd.name}</div>`',
  '`<div class="stat-name" style="color:${sd.col};font-size:1.6rem;font-weight:700;letter-spacing:.05em">${_L(sd.name,sd.nameEn)}</div>`'
);
rep(
  '`<div class="stat-desc" style="font-size:1.1rem;color:#665544;margin-top:4px">${OPT.lang!==\'ko\'?sd.descEn:sd.desc}</div>`',
  '`<div class="stat-desc" style="font-size:1.1rem;color:#665544;margin-top:4px">${_L(sd.desc,sd.descEn)}</div>`'
);
// GRIT
rep(
  "`<div class=\"stat-name\" style=\"color:#ffaa33;font-size:1.6rem;font-weight:700;letter-spacing:.05em\">${OPT.lang!=='ko'?'GRIT':'근성 (GRIT)'}</div>`",
  '`<div class="stat-name" style="color:#ffaa33;font-size:1.6rem;font-weight:700;letter-spacing:.05em">${_L(\'근성 (GRIT)\',\'GRIT\')}</div>`'
);
rep(
  "`<div class=\"stat-desc\" style=\"font-size:1.1rem;color:#665544;margin-top:4px\">${OPT.lang!=='ko'?'HP/MP/ST +1, DEF/eDEF +0.5':'HP/MP/ST +1, 방어력/속성방어 +0.5'}</div>`",
  '`<div class="stat-desc" style="font-size:1.1rem;color:#665544;margin-top:4px">${_L(\'HP/MP/ST +1, 방어력/속성방어 +0.5\',\'HP/MP/ST +1, DEF/eDEF +0.5\')}</div>`'
);
// AP Left
rep(
  "$('apRemain').textContent=(OPT.lang!=='ko'?'AP Left: ':'남은 AP: ')+(P.ap||0);",
  "$('apRemain').textContent=_L('남은 AP: ','AP Left: ')+(P.ap||0);"
);
// offense/support headers
rep(
  "_hdr.textContent=OPT.lang!=='ko'?'⚔ OFFENSE':'⚔ 공격 패시브';",
  "_hdr.textContent=_L('⚔ 공격 패시브','⚔ OFFENSE');"
);
rep(
  "_hdr2.textContent=OPT.lang!=='ko'?'🛡 SUPPORT':'🛡 서브 패시브';",
  "_hdr2.textContent=_L('🛡 서브 패시브','🛡 SUPPORT');"
);
// passive cost
rep(
  "const costTxt=isMax?'MAX':(OPT.lang!=='ko'?`Next: ${nextCost} AP`:`다음: ${nextCost} AP`);",
  "const costTxt=isMax?'MAX':_L(`다음: ${nextCost} AP`,`Next: ${nextCost} AP`);"
);
// passive name/desc
rep(
  '`<div class="passive-name" style="color:${pd.col};font-size:1.6rem;font-weight:700">${OPT.lang!==\'ko\'?(pd.nameEn||pd.name):pd.name}</div><div class="passive-desc" style="font-size:1.2rem;color:#665544;margin-top:4px">${OPT.lang!==\'ko\'?(pd.descEn||pd.desc):pd.desc}',
  '`<div class="passive-name" style="color:${pd.col};font-size:1.6rem;font-weight:700">${_L(pd.name,pd.nameEn||pd.name)}</div><div class="passive-desc" style="font-size:1.2rem;color:#665544;margin-top:4px">${_L(pd.desc,pd.descEn||pd.desc)}'
);
// passive tab button (passive list item)
rep(
  "b.textContent=OPT.lang!=='ko'?p.nameEn:p.name;",
  "b.textContent=_L(p.name,p.nameEn||p.name);"
);
// stat summary toggle btn
rep(
  "$('smToggleBtn').innerHTML=isExp?(OPT.lang!=='ko'?'Stat Summary ▼':'능력치 요약 ▼'):(OPT.lang!=='ko'?'Close Summary ▲':'요약 닫기 ▲');",
  "$('smToggleBtn').innerHTML=isExp?_L('능력치 요약 ▼','Stat Summary ▼'):_L('요약 닫기 ▲','Close Summary ▲');"
);
// remove local _L and _e defs in C-panel
rep(
  "  const _e=OPT.lang!=='ko';\n  const _L=(ko,en)=>{if(OPT.lang==='ko')return ko;const _lt=_T(ko);return _lt===ko?en:_lt};",
  "  // _L and _e removed — using global _L()"
);

// ════════════════════════════════════════════════════════════════════════════
// 23. HUD
// ════════════════════════════════════════════════════════════════════════════
rep(
  "$('stageLbl').textContent=OPT.lang!=='ko'?`Hell${_s.hell+1} ${_s.n} (Lv.${P.lv||1}${_dOff>0?' +'+_dOff:''})`:`${_s.hell+1}지옥 ${_s.kr} (Lv.${P.lv||1}${_dOff>0?' +'+_dOff:''})`",
  "$('stageLbl').textContent=OPT.lang==='ko'?`${_s.hell+1}지옥 ${_s.kr} (Lv.${P.lv||1}${_dOff>0?' +'+_dOff:''})`:(`Hell${_s.hell+1} `+(_L(_s.kr,_s.n))+` (Lv.${P.lv||1}${_dOff>0?' +'+_dOff:''})`)"
);
rep(
  "const rtype=room?room.type:'';const rtName=OPT.lang!=='ko'?(rtype==='boss'?'Boss Arena':rtype==='forge'?'Forge':rtype==='start'?'Start':'Plaza'):(rtype==='boss'?'보스광장':rtype==='forge'?'대장간':rtype==='start'?'시작점':'광장');",
  "const rtype=room?room.type:'';const rtName=rtype==='boss'?_L('보스광장','Boss Arena'):rtype==='forge'?_T('대장간'):rtype==='start'?_L('시작점','Start'):_L('광장','Plaza');"
);
rep(
  "$('roomLbl').textContent=OPT.lang!=='ko'?`${rtName} — Enemies ${_hudAlive}${G.bossAlive?'':' | Exit Open'}`:`${rtName} — 적 ${_hudAlive}${G.bossAlive?'':' | 출구 개방'}`;",
  "$('roomLbl').textContent=`${rtName} — `+_L('적','Enemies')+` ${_hudAlive}`+(G.bossAlive?'':_L(' | 출구 개방',' | Exit Open'));"
);
rep(
  "if($('matLbl'))$('matLbl').textContent=OPT.lang!=='ko'?'MALICE':'악의';",
  "if($('matLbl'))$('matLbl').textContent=_L('악의','MALICE');"
);

// ════════════════════════════════════════════════════════════════════════════
// 24. 대기/구역 화면
// ════════════════════════════════════════════════════════════════════════════
rep(
  "name.textContent=(OPT.lang!=='ko'?'Zone '+(SI_TO_FLOOR[nextStg]+1)+' — ':((SI_TO_FLOOR[nextStg]+1)+'구역 — '))+_T(HELL_NAMES[hell]);",
  "name.textContent=(OPT.lang==='ko'?(SI_TO_FLOOR[nextStg]+1)+'구역 — ':_L('Zone ','Zone ')+(SI_TO_FLOOR[nextStg]+1)+' — ')+_T(HELL_NAMES[hell]);"
);
rep(
  "info.textContent=(OPT.lang!=='ko'?(stg.n+' Zone '+depth):(stg.kr))+' | Lv.'+stg.monLv+' | '+depth+'/'+ch.stages;",
  "info.textContent=(OPT.lang==='ko'?stg.kr:_L(stg.kr,stg.n)+' Zone '+depth)+' | Lv.'+stg.monLv+' | '+depth+'/'+ch.stages;"
);

// ════════════════════════════════════════════════════════════════════════════
// 25. 로딩 스크린 스테이지명
// ════════════════════════════════════════════════════════════════════════════
rep(
  "X.fillText(OPT.lang!=='ko'?_stg2.n:_stg2.kr,_cw/2,_ch*.64);",
  "X.fillText(OPT.lang==='ko'?_stg2.kr:_L(_stg2.kr,_stg2.n),_cw/2,_ch*.64);"
);

// ════════════════════════════════════════════════════════════════════════════
// 끝: 저장
// ════════════════════════════════════════════════════════════════════════════
fs.writeFileSync(`${BASE}/game.html`, src);
console.log('Phase 32 게임 코드 수정 완료');

// ── 남은 OPT.lang!=='ko' 수 확인 ─────────────────────────────────────────
const remaining = (src.match(/OPT\.lang!=='ko'/g)||[]).length;
const remainingEq = (src.match(/OPT\.lang==='ko'/g)||[]).length;
console.log(`남은 OPT.lang!=='ko': ${remaining}`);
console.log(`남은 OPT.lang==='ko': ${remainingEq}`);
