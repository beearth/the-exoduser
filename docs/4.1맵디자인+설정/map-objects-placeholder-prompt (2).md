# 맵 오브젝트 플레이스홀더 구현 — 클코 프롬프트

> game.html에 바로 넣을 것. 스킨 없이 색 도형+기능만.

---

## 컨텍스트

```
game.html 단일 파일. T=40 (타일 사이즈).
G.map[ty][tx] = 0:바닥, 1:벽, 3:경계벽.
G.rooms[] = {x,y,w,h,cx,cy,cleared,type}. type: 'start','forge','boss','combat'.
worldItems[] = 기존 아이템/대장간/상자. 건드리지 마.
_tseed(tx,ty) = 결정론적 시드 RNG. 이미 있음.
initStage(si) = 스테이지 초기화. 끝에 initSwayObjects/initWallEyes/initGlowObjects 호출함.
update() = 8636줄. isJust('interact') = R키 1회 감지.
draw() = 16836줄 부근에서 worldItems 렌더.
dst(x1,y1,x2,y2) = 거리 함수. addTxt(x,y,text,col,life). addParts(x,y,col,n).
SFX.pickup() = 줍기 효과음. P = 플레이어 {x,y,hp,mhp,st,mst,mp,mmp,shield,mshield,iframes}.
G.stage = 현재 스테이지 번호. hell = Math.min(6, ~~(G.stage/10)).
BINDS.interact = 'KeyR'. keyName(bind) = 키 표시명.
_MTHEME[hell] = {w,f,ac} 테마 색상.
성능 중요 — 뷰포트 컬링 필수. 기존 코드 존중.
```

---

## 프롬프트 (통째로 복붙)

```
game.html에 맵 오브젝트 시스템을 추가해줘. 
스킨 없이 플레이스홀더(색 도형)로 구현. 나중에 비주얼만 교체할 거야.

=== 1. 전역 변수 추가 (worldItems 선언 근처, 2974줄 부근) ===

let MAP_OBJS = []; // worldItems와 별도 — 맵 구조 오브젝트 전용

=== 2. initMapObjects() 함수 추가 ===

initStage() 끝에 호출. initGlowObjects() 다음에.
MAP_OBJS = [] 초기화 후 아래 오브젝트들을 _tseed 기반으로 배치.

배치 규칙 공통:
- G.map[ty][tx] === 0 인 바닥 타일에만
- 기존 worldItems(forge/chest)와 겹치지 않게
- 오브젝트 간 최소 3타일(120px) 거리 유지
- 보스방(room.type==='boss')에는 함정/파괴물 안 넣음

--- 2a. 안식처 (bonfire) ---
배치: 스테이지당 1~2개.
- 1번째: forge방 아닌 combat방 중 가장 보스방에 가까운 방 중앙
- 2번째: 10스테이지마다 추가 1개 (start방과 forge방 사이 combat방)
구조: {type:'bonfire', x, y, hell, lit:false, hp:999}

--- 2b. 로어 비석 (lore) ---
배치: 스테이지당 2~3개.
- 막다른 방(인접 방이 1개뿐인 방) 구석에 배치
- _tseed(tx+700, ty+700) 기반
- 벽 인접 바닥 타일 선호
구조: {type:'lore', x, y, hell, read:false, textIdx: 스테이지*3+순서}

--- 2c. 파괴 가능 오브젝트 (breakable) ---
배치: combat방마다 0~3개 (R() < 0.3).
- _tseed(tx+800, ty+800) 기반
- 방 가장자리(벽 인접) 바닥 타일에
구조: {type:'breakable', x, y, hell, hp:3, maxHp:3, alive:true, loot:'mat'}
  - loot: 'mat'(80%), 'potion'(15%), 'none'(5%)

--- 2d. 함정 (trap) ---
배치: 맵 전역 바닥 타일에 ~100개, 최소 150px 간격.
- _tseed(stage*59+7, hell*43+3) 기반
- 바닥 타일 전체에서 랜덤 배치 (뛰엄뛰엄)
- 보스방, start방, forge방에는 _moOk로 자동 제외
- 비주얼: pit_blood_anim.png 스프라이트 시트 (3x3, 9프레임, 300ms 애니)
구조: {type:'trap', x, y, hell, active:true, cooldown:0, dmgPct:0.10}
  - 모든 지옥: 10%mhp 데미지 + "피웅덩이!" 텍스트
  - 밟으면 active=false → 즉시 소멸 (1회용, 쿨다운 재활성 없음)

--- 2e. 버프 제단 (altar) ---
배치: 스테이지당 0~1개 (5스테이지부터 등장).
- forge방도 boss방도 아닌 방 중앙
구조: {type:'altar', x, y, hell, used:false}

=== 3. update()에서 MAP_OBJS 처리 ===

update() 함수 안, isJust('interact') 블록 맨 앞에 MAP_OBJS 상호작용 추가.
기존 worldItems interact 로직 앞에 넣어서 MAP_OBJS가 우선.

--- 3a. 안식처 상호작용 ---
if(isJust('interact')) 안:
  for MAP_OBJS에서 type==='bonfire' && dst(P,bonfire) < 60:
    - P.hp = P.mhp, P.st = P.mst, P.mp = P.mmp, P.shield = P.mshield
    - bonfire.lit = true
    - addTxt(x, y-20, 'HP/MP/ST 회복!', '#44ff44', 60)
    - addParts(x, y, '#ffcc44', 12)
    - SFX.pickup()
    - break (1개만 처리)

--- 3b. 로어 비석 상호작용 ---
  for MAP_OBJS에서 type==='lore' && !it.read && dst < 60:
    - it.read = true
    - 화면 중앙 상단에 텍스트 표시: addTxt(P.x, P.y-40, '비문 발견...', '#8888ff', 90)
    - addParts(x, y, '#8888ff', 6)
    - break

--- 3c. 파괴 가능 오브젝트 --- (공격으로 파괴, interact 아님)
update()의 플레이어 공격 히트 판정 부분에 추가하지 말고,
별도로 update() 루프 안에서 매 프레임:
  for MAP_OBJS에서 type==='breakable' && it.alive:
    // 플레이어 공격 판정: P.s==='atk' && P.atkTimer가 특정 프레임일 때
    // 간단하게: P.s에 'atk' 포함 && dst(P, breakable) < 50 && 이번 프레임에 한번만
    - 이거 복잡하니까 간단 버전: interact 키로도 파괴 가능하게
    - R키 누르면 dst < 50인 breakable의 hp -= 1
    - hp <= 0이면: alive = false, 보상 드롭
      - loot==='mat': G.mats += 1+~~(Math.random()*3), addTxt
      - loot==='potion': worldItems.push({type:'potion', potType:'hp', potCount:1, ...})
    - addParts(x, y, '#aa8844', 4) 파편
    
--- 3d. 함정 --- (자동 감지, interact 아님)
update() 안에서 매 프레임 (interact 밖에서):
  for MAP_OBJS에서 type==='trap' && it.active:
    if it.cooldown > 0: it.cooldown -= sp; continue
    if dst(P.x, P.y, it.x, it.y) < 30 && P.iframes <= 0:
      - hell === 0 (얼음): P._trapSlowT = 90 (이미 있는 감속 시스템 활용)
        addTxt(it.x, it.y-15, '빙판!', '#44ddee', 30)
      - hell === 2 (화염): P.hp -= ~~(P.mhp * it.dmgPct)
        addTxt(it.x, it.y-15, '용암!', '#ff6633', 30)
      - hell === 4 (암전): P.hp -= ~~(P.mhp * 0.08), P.stunned = 30 (있으면)
        addTxt(it.x, it.y-15, '전기!', '#ffcc44', 30)
      - 그 외: P.hp -= ~~(P.mhp * 0.05)
        addTxt(it.x, it.y-15, '가시!', '#ff4444', 30)
      - P.iframes = 30 (무적 부여해서 연속 피해 방지)
      - it.cooldown = 120 (2초 쿨다운)
      - addParts(it.x, it.y, '#ff4444', 6)
      - G.shake = 3

--- 3e. 버프 제단 ---
  if(isJust('interact')) 안:
    for MAP_OBJS에서 type==='altar' && !it.used && dst < 60:
      - it.used = true
      - 랜덤 버프 1개 적용 (간단 버전):
        const buffs = [
          {name:'피의 축복', stat:'atkMul', val:1.15},
          {name:'뼈의 방벽', stat:'defMul', val:1.20},
          {name:'광기의 속도', stat:'spdMul', val:1.15}
        ];
        const pick = buffs[~~(Math.random()*buffs.length)];
        - P[pick.stat] 이 없을 수도 있으니, G._altarBuff = pick 으로 저장
        - addTxt(x, y-20, pick.name+'!', '#ffaa44', 90)
        - addParts(x, y, '#ffaa44', 12)
      - 실제 스탯 적용은 나중에 (지금은 텍스트만 표시해도 됨)

=== 4. draw()에서 MAP_OBJS 렌더링 ===

draw()에서 worldItems 렌더 직전에 MAP_OBJS 렌더 추가.
뷰포트 컬링 동일하게 적용 (_wvl, _wvr, _wvt, _wvb).

--- 플레이스홀더 비주얼 (색 도형) ---

for(const mo of MAP_OBJS) {
  if(mo.type==='breakable' && !mo.alive) continue;
  if(mo.x < _wvl || mo.x > _wvr || mo.y < _wvt || mo.y > _wvb) continue;
  
  const b = Math.sin(_now/300 + mo.x) * 2; // 미세 흔들림
  X.textAlign = 'center';
  
  switch(mo.type) {
    case 'bonfire': {
      // 노란 원 + 불꽃 맥동
      const pulse = mo.lit ? (.7 + Math.sin(_now/500)*.3) : .3;
      // 글로우 반경
      X.globalAlpha = .08 * pulse;
      X.fillStyle = mo.lit ? '#ffcc44' : '#886622';
      X.beginPath(); X.arc(mo.x, mo.y, 50, 0, Math.PI*2); X.fill();
      // 베이스 원
      X.globalAlpha = .6 * pulse;
      X.fillStyle = '#884400';
      X.beginPath(); X.arc(mo.x, mo.y+2, 12, 0, Math.PI*2); X.fill();
      // 불꽃 (삼각형)
      X.globalAlpha = pulse;
      X.fillStyle = mo.lit ? '#ffaa22' : '#664400';
      X.beginPath();
      X.moveTo(mo.x-6, mo.y);
      X.lineTo(mo.x+6, mo.y);
      X.lineTo(mo.x, mo.y - 14 - Math.sin(_now/200)*4);
      X.closePath(); X.fill();
      // 점화 상태 코어
      if(mo.lit) {
        X.globalAlpha = .8;
        X.fillStyle = '#ffdd66';
        X.beginPath(); X.arc(mo.x, mo.y-4, 3, 0, Math.PI*2); X.fill();
      }
      // 상호작용 힌트
      if(!mo.lit && dst(P.x,P.y,mo.x,mo.y) < 80) {
        X.globalAlpha = 1;
        X.font = '12px "Noto Sans KR"';
        X.fillStyle = '#ffcc44';
        X.fillText('['+keyName(BINDS.interact)+'] 안식', mo.x, mo.y+22);
      }
      // 이미 점화됐어도 회복 가능 표시
      if(mo.lit && dst(P.x,P.y,mo.x,mo.y) < 80 && P.hp < P.mhp) {
        X.globalAlpha = 1;
        X.font = '12px "Noto Sans KR"';
        X.fillStyle = '#44ff44';
        X.fillText('['+keyName(BINDS.interact)+'] 회복', mo.x, mo.y+22);
      }
      break;
    }
    
    case 'lore': {
      // 파란 사각형 + ? 마크
      X.globalAlpha = mo.read ? .3 : (.5 + Math.sin(_now/400)*.2);
      X.fillStyle = mo.read ? '#334466' : '#4466aa';
      X.fillRect(mo.x-8, mo.y+b-14, 16, 20);
      // 비문 선
      X.strokeStyle = '#6688cc';
      X.lineWidth = .5;
      for(let i=0; i<3; i++) {
        X.beginPath();
        X.moveTo(mo.x-5, mo.y+b-10+i*5);
        X.lineTo(mo.x+5, mo.y+b-10+i*5);
        X.stroke();
      }
      // 상호작용 힌트
      if(!mo.read && dst(P.x,P.y,mo.x,mo.y) < 80) {
        X.globalAlpha = 1;
        X.font = '12px "Noto Sans KR"';
        X.fillStyle = '#8888ff';
        X.fillText('['+keyName(BINDS.interact)+'] 읽기', mo.x, mo.y+18);
      }
      break;
    }
    
    case 'breakable': {
      if(!mo.alive) continue;
      // 초록-갈색 사각형 (상자/항아리 느낌)
      const hpRatio = mo.hp / mo.maxHp;
      X.globalAlpha = .5 + hpRatio * .3;
      X.fillStyle = '#886633';
      X.fillRect(mo.x-10, mo.y+b-10, 20, 20);
      // 균열 표시 (HP 감소 시)
      if(hpRatio < 1) {
        X.strokeStyle = '#443300';
        X.lineWidth = 1;
        X.beginPath();
        X.moveTo(mo.x-4, mo.y+b-8);
        X.lineTo(mo.x+2, mo.y+b+6);
        X.stroke();
      }
      if(hpRatio < 0.5) {
        X.beginPath();
        X.moveTo(mo.x+3, mo.y+b-6);
        X.lineTo(mo.x-3, mo.y+b+4);
        X.stroke();
      }
      // 상호작용 힌트
      if(dst(P.x,P.y,mo.x,mo.y) < 60) {
        X.globalAlpha = 1;
        X.font = '11px "Noto Sans KR"';
        X.fillStyle = '#aa8844';
        X.fillText('['+keyName(BINDS.interact)+'] 파괴', mo.x, mo.y+18);
      }
      break;
    }
    
    case 'trap': {
      // pit_blood_anim.png 스프라이트 시트 (3x3, 9프레임, 300ms) 사용
      // 쿨다운 중이면 어둡게, 활성 시 맥동
      const onCd = mo.cooldown > 0;
      const dp = onCd ? .15 : (.5 + Math.sin(_now/150)*.15);
      const _tSpr = _OBJ_SPR['pit_blood_a']; // pit_blood_anim.png
      if(_tSpr && _tSpr.complete && _tSpr.naturalWidth > 1) {
        const _tSz = 60;
        const _tOfs = ((~~(mo.x*7+mo.y*13))&0x7fffffff) % (300*9);
        const _tFr = ~~(((_now+_tOfs) % (300*9)) / 300);
        const _tFw = ~~(_tSpr.naturalWidth/3), _tFh = ~~(_tSpr.naturalHeight/3);
        X.globalAlpha = dp;
        X.drawImage(_tSpr, (_tFr%3)*_tFw, ~~(_tFr/3)*_tFh, _tFw, _tFh,
                    mo.x-_tSz/2, mo.y-_tSz/2, _tSz, _tSz);
      } else {
        // 폴백: 색상 원
        X.globalAlpha = dp;
        X.fillStyle = onCd ? '#332222' : '#aa2222';
        X.beginPath(); X.arc(mo.x, mo.y, 28, 0, Math.PI*2); X.fill();
      }
      break;
    }
    
    case 'altar': {
      // 보라 다이아몬드 + 맥동
      const pulse = mo.used ? .2 : (.5 + Math.sin(_now/600)*.3);
      // 글로우
      X.globalAlpha = .06 * pulse;
      X.fillStyle = '#aa44ff';
      X.beginPath(); X.arc(mo.x, mo.y, 40, 0, Math.PI*2); X.fill();
      // 다이아몬드 형태
      X.globalAlpha = pulse;
      X.fillStyle = mo.used ? '#443355' : '#8844cc';
      X.beginPath();
      X.moveTo(mo.x, mo.y-16);
      X.lineTo(mo.x+12, mo.y);
      X.lineTo(mo.x, mo.y+16);
      X.lineTo(mo.x-12, mo.y);
      X.closePath(); X.fill();
      // 중심점
      X.globalAlpha = pulse * 1.2;
      X.fillStyle = '#cc88ff';
      X.beginPath(); X.arc(mo.x, mo.y, 3, 0, Math.PI*2); X.fill();
      // 상호작용 힌트
      if(!mo.used && dst(P.x,P.y,mo.x,mo.y) < 80) {
        X.globalAlpha = 1;
        X.font = '12px "Noto Sans KR"';
        X.fillStyle = '#cc88ff';
        X.fillText('['+keyName(BINDS.interact)+'] 제단', mo.x, mo.y+26);
      }
      break;
    }
  }
  X.globalAlpha = 1;
}

=== 5. 미니맵에 MAP_OBJS 표시 ===

미니맵 렌더링 부분 (19267줄 부근, rooms 렌더 후)에 추가:
  for(const mo of MAP_OBJS) {
    const mx = ox + (mo.x/T) * sc;
    const my = oy + (mo.y/T) * sc;
    if(mo.type==='bonfire') { MX.fillStyle=mo.lit?'#ffcc44':'#886622'; MX.fillRect(mx-2,my-2,4,4); }
    else if(mo.type==='trap') { MX.fillStyle='#ff4444'; MX.fillRect(mx-1,my-1,2,2); }
    else if(mo.type==='altar' && !mo.used) { MX.fillStyle='#aa44ff'; MX.fillRect(mx-2,my-2,4,4); }
  }

=== 6. initStage() 수정 ===

initStage() 끝, initGlowObjects() 다음에:
  initMapObjects();

=== 7. 주의사항 ===

- worldItems 배열은 건드리지 마. MAP_OBJS는 완전 별도 시스템.
- _tseed 함수 자체를 수정하지 마. 호출만 해.
- 각 오브젝트 배치 시 기존 worldItems의 forge/chest 위치와 겹침 체크 해줘.
- 배치 후 오브젝트 간 최소 거리 3타일(120px) 체크.
- draw()에서 뷰포트 컬링 반드시 적용.
- update()에서 MAP_OBJS 순회는 프레임당 1회, 길이가 보통 10~15개라 성능 문제 없음.
- P._trapSlowT 이 이미 코드에 있는지 확인하고, 없으면 P 초기화에 추가.
- 함정 데미지 후 P.iframes = 30 꼭 설정 (연속 피해 방지).
- console.log로 initMapObjects 결과 한번 찍어줘: 
  console.log('[MAP_OBJS]', MAP_OBJS.length, MAP_OBJS.map(m=>m.type));
```
