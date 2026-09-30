# 보스 배틀 세팅 바이블

> **2026-09-09 피날레 v0.4:** 데모/bic 마지막 si3 보스의 HP는 `floor(22278×(1+.055n+.0015n²)×dm)`, n=max(0,monLv−1); 초기 쉴드=HP, 부활력20, 최대1회 35% HP 저항(확률clamp(1−신성력,0,1)), phase ATK는 base×1/1.12/1.25/1.4/1.6이다. 3막 음악·HUD·120f 카드 및 보스 바로 재도전/60f 인트로의 [현행 계약·검증](DARK_DRUID_FINALE_PACING_v04.md)을 따른다. 일반 모드와 공용 패링 계약은 기존대로다. 아래 이전 버전의 HP/부활 유지 표현은 당시 이력이다.


> **2026-09-08 데모 피날레 예외:** `?demo`/`?bic`의 마지막 보스(si3)는 [다크드루이드 피날레 v0.2](DARK_DRUID_DEMO_FINALE_DESIGN.md) §0을 따른다. 전용 3막·5종 패턴, 동작별 Q독탄(48f 전조/막별1·2·3웨이브/간격30f/수명90f), 돌진·잠행 뒤96f 회복, 잠행 표적 고정, 제자리 HP페이즈 전환, 반투명 독늪을 적용했다. 이 조건의 독립 ORB·상시 리듬탄·idle 자동탄은 생성하지 않는다. 일반 si0/si3와 다른 보스의 수치·부활·Q/E 규칙은 기존 계약 유지. 아래 이전 드루이드 설명은 해당 예외를 제외한 기존 계약/이력이다.

> **2026-09-06 최종 확정 — 해골무덤 플레이어 전용:** 드루이드만이 아니라 **전체 보스(si0~34)의 cageTrap 사용을 금지**한다. 아래 보스 사용 계약은 이전 기록이다. 모든 무브셋에서 제외, 관련 콤보 2개 제거, AI 점수 -1, 강제 실행도 생성·피해·소리 없이 recover/25f 종료. idx41 정의는 배열 인덱스 호환용 예약으로 보존한다. 플레이어 boneWall/boneStorm과 공용 boss_cageTrap 이미지·음향은 유지한다. 기존 보스용 잔여 배열/렌더는 호환용이며 신규 생성 경로는 없다. 회귀 검사: 35개 stage 강제 호출 모두 생성 0, 플레이어 공용 시트·음향 포함 관련 테스트 7개 PASS.

> **2026-09-06 현행 보스 배정 우선:** 1-1(si0)은 **다크드루이드**다. 이 문서의 흑요염 파괴자 si0 배정·화염 전용 지정·`_isLargeBoss=true`는 이전 구현 기록이며 현행 배정에서 제외한다. 드루이드의 si3 전용 기술/VFX는 이제 **si0·si3 공통**이다. 원본 흑요염 에셋/음성 카탈로그는 삭제하지 않는다. 정확한 현행 계약은 `docs/4.1맵디자인+설정/CH1_1_DRUID_BOSS_ASSIGNMENT.md`를 따른다.

> 최종 업데이트: 2026-09-05
> 담당 코드: `game.html` — `genBossArena()`, `_enterBossArena()`, `_b3animate()`, `_poiseReset()`, 보스 테스트베드
> 전투 정체성/전조/페이즈 연극 옵트인 기획: [`../4.0케릭터스프라이트 디자인/캐릭터_몬스터_보스_최적화디자인_v1.md`](../4.0케릭터스프라이트%20디자인/캐릭터_몬스터_보스_최적화디자인_v1.md) Track C. 본 파일의 보스 HP(실제 ×24, §3 참조)·포이즈·아레나 수치는 유지. `2_3` 불변.

---

## 1. 아레나 생성 (`genBossArena`)

### 맵 크기

| 항목 | 값 |
|---|---|
| 맵 너비 | `mw = 128` (타일) |
| 맵 높이 | `mh = 108` (타일) |
| 유효 영역 | `il=2, it=2, ir=126, ib=106` |
| 중심 | `cx = 64, cy = 54` |

### 아레나 타입 — 챕터별

| 챕터(hell) | 스테이지(si) | 타입 | 형태 |
|---|---|---|---|
| 0 (썩은 숲) | 0~3 | `0` | 원형 투기장 (기둥 없음) |
| 1 (벌레굴) | 4~9 | `1` | 대성당 (직사각형 전체) |
| 2 (지옥의 겨울) | 10~13 | `2` | 십자형 (armW=30%, armH=30%) |
| 3 (화염지대) | 14~20 | `3` | 팔각형 |
| 4 (군단) | 21~25 | `4` | 타원형 |
| 5 (사도의 마굴) | 26~31 | `0` | 원형 (재사용) |
| 6 (지옥성) | 32~34 | `1` | 대성당 (재사용) |

### 주요 좌표

| 위치 | 계산식 |
|---|---|
| 플레이어 진입 | `entY = ib-3 = 103` (하단 중앙) |
| 보스 스폰 | `(cx, cy) = (64, 54)` (아레나 정중앙) |
| 출구 | `exitX = cx`, `exitY = it` 부근 (보스 사망 시 개방) |
| 경계 룬 타일 | `tile=5` (바닥 중 벽 인접 셀) |

---

## 2. 보스 진입 흐름 (`_enterBossArena`)

```
보스 게이트 접촉
  → G._bossLoadPhase=1 (페이드 아웃 50f)
  → G._bossLoadPhase=2 (보스 네임카드 130f)
  → _enterBossArena() 호출
    1. _preArenaBackup 저장 (사망 시 복원용)
    2. genBossArena(si) 로 새 맵 생성
    3. ens/projs/worldItems/G 상태 전체 초기화
    4. 플레이어를 entryX, entryY로 이동
    5. mkEn() 으로 보스 스폰 (ib=true, _isLargeBoss=true when si===0)
    6. G._bossArena=true, G.bossSealed=true 설정
    7. 봉인 파티클 32개 + 보스 포효 SFX
```

---

## 3. HP / ATK 배율 (2026-10-01 감사 정정)

> **정정:** 아래 상수 `BOSS_HP_MULT=8`·`BOSS_ATK_MULT=3`·`FINALBOSS_HP_MULT=15`·`FINALBOSS_ATK_MULT=5`·`MON_BASE_HP=60`·`MON_BASE_ATK=8`은 `game.html`에 **정의만 되어 있고 어디서도 참조되지 않는 dead 상수**다(각 식별자 소스 전체 1회 = 정의만). 실제 보스 HP/ATK는 이 상수가 아니라 `mkEn`의 레벨 커브에서 나온다. 수치 SSOT는 [몬스터_공격시스템 §HP공식/§ATK공식](../8.0몬스터디자인/몬스터_공격시스템.md)이며 본 섹션은 그 값을 따른다. (검증: `test/bossHpAtkLayerAudit.test.js`. 이번 정정은 문서만 — 코드·전투수치 불변.)

**실제 적용 공식 (`game.html` `mkEn`):**
| 항목 | 공식 / 값 | 소스 |
|---|---|---|
| HP 기본커브 | `(Lv≤500? 0.4·Lv³+199·Lv+100 : 5e7·1.0014^(Lv−500))×2.925` | `game.html:29632` |
| HP pacing | `_enemyHpPacing(Lv)=1/(1+min(9,max(0,Lv−1))/18)` (Lv1=1, Lv10+=2/3) | `29607` |
| 보스 HP 배율 | **`_bossMul = ib?24:1`** (일반 보스·최종 보스 공통 ×24, 별도 최종보스 배율 없음) | `29633` |
| HP 최종 | `floor( floor(기본커브·pacing·24·dm·et.hpMul) · (1+stage·0.02) )` | `29634` |
| 보스 ATK | `floor( ((75 + Lv·2.9)·0.6) · dm · et.atkMul )` (일반몹은 50/1.95) | `29638-29639` |
| 최종 보스(si3 데모/bic 피날레) | 별도 `_druidFinaleHp` (상단 v0.4 주석) | `29636` |

**현행값 (dm=1·et 배율=1·stage=0, 감사 하니스 산출):**
| Lv | 일반몹 HP | 보스 HP(×24) | 일반몹 ATK | 보스 ATK |
|---:|---:|---:|---:|---:|
| 1 | 875 | 21,017 | 31 | 46 |
| 10 | 4,855 | 116,532 | 41 | 62 |
| 100 | 819,000 | 19,656,000 | 147 | 219 |
| 500 | 97,694,220 | 2,344,661,280 | 615 | 915 |

> 참고: dead 상수로 해석하면 보스 HP≈480·ATK≈24(base×배율)로 실제(21,017/46)와 전혀 다르다. 초기 쉴드=HP이므로 보스 직접공격 유효체력은 표의 2배다.

---

## 4. 포이즈(Poise) / 그로기 시스템

### 핵심 함수

| 함수 | 역할 |
|---|---|
| `_doPoise(e, amt, stunT, label)` | 포이즈 데미지 적용 |
| `_poiseReset(e)` | 그로기 종료 후 포이즈 100% 회복 |

### 포이즈 데미지 흐름

```
_doPoise(e, amt) 호출
  → e.ib && e._pImmune > 0 → 면역: return false (적용 안 함)
  → e.poise -= amt
  → e.poise <= 0 → 그로기 발동:
      e.stunned = stunT
      e._maxStunned = stunT
      e.ib → e._pImmune = 300 (5초, 60fps 기준)
      SFX.groggy() + addTxt('💥 그로기!')
```

### 그로기 종료 → 포이즈 재충전

```javascript
// game.html line ~24408
if(e.stunned<=0 && e._maxStunned){
  e._maxStunned=0;
  if(e.ib){
    _poiseReset(e);           // poise = maxPoise (100% 회복)
    e._pImmune = Math.max(e._pImmune||0, 300); // 면역 300f 보장
    e.s='idle'; e.st2=30; e._teleDropY=0;
  }
}
```

### 포이즈 HUD 표시 로직

| 상태 | 색상 | 표시 |
|---|---|---|
| 그로기 중 (`stunned > 0`) | `#ff8800` 주황 | 게이지 0% |
| 면역 충전 중 (`_pImmune > 0`) | `#4455cc→#8899ff` 파란 그라데이션 | 0→100% (300f 동안 채워짐) |
| 정상 | `#cc3300→#ff6600` 빨간 | 현재 poise / maxPoise % |

---

## 5. 페이즈 전환 시스템 (`_bossPhaseCheck`)

### HP 임계값 / BOSS_PHASES 테이블

| 페이즈 | HP 범위 | spdM | teleM | cdM | label |
|---|---|---|---|---|---|
| 0 | 80~100% | 1.15 | 0.75 | 0.50 | PHASE 1 |
| 1 | 60~80% | 1.25 | 0.65 | 0.40 | ⚠ PHASE 2 |
| 2 | 40~60% | 1.40 | 0.50 | 0.35 | ⚠ PHASE 3 |
| 3 | 20~40% | 1.55 | 0.40 | 0.25 | 🔥 PHASE 4 |
| 4 | 0~20%  | 1.75 | 0.25 | 0.15 | 💀 광폭화! |

### 전환 로직 (`_bossPhaseCheck` 호출 위치: 매 프레임 보스 업데이트)

전환 조건: `hpR <= 임계값 && _bp > e._bossPhase`

### 전환 시 처리 순서

| 순서 | 내용 |
|---|---|
| 1 | HP 회복 — 페이즈 상한까지 (`e.mhp × ph.hp[1]`) |
| 2 | 무적 1.5초 (`reviveIframes = 90`) |
| 3 | 스탯 강화 — atk×1.3, speed×1.15, maxPoise×1.2 / 현재 포이즈 그대로 유지 (회복 없음, 2026-05-13) |
| 4 | 상태 초기화 — stunned=0, s='recover', 콤보/딜레이 리셋 |
| 5 | 텔레포트 — 플레이어 등 뒤 (거리 `80+_bp*25`) + 파티클 VFX |
| 6 | 충격파 — 반경 `100+_bp*30`, 데미지 `atk*(0.4+_bp*0.1)` |
| 7 | 분노 탄막 방사 — `8+_bp*4`발 (빨콩 50% + 무지개 50% 교대) |
| 8 | 연출 — 텍스트, `_reviveVFX()`, HitStop, SlowMo, **셰이크, 포효** |

### 연출 수치 (8번 — 2026-05-08 업데이트)

```javascript
G.hitStop = ~~((_HS.bossPhase + _bp*3) * OPT.hitStop/100)
G.slowMo  = Math.max(G.slowMo, 60 + _bp*15)  // 페이즈별 75~120f
shake(14 + _bp*4)                              // 페이즈별 18~30
// 포효: 즉시 SFX.groggy() + 120ms 딜레이 후 _bossSfx().howl
```

| 페이즈 | slowMo(f) | shake |
|---|---|---|
| 1→2 | 75 | 18 |
| 2→3 | 90 | 22 |
| 3→4 | 105 | 26 |
| 4→광폭 | 120 | 30 |

---

## 6. 보스 무브셋 (`_BOSS_MOVESET`)

스테이지(si) → 허용 기술 Set. `null` = 전체 49종 사용.

| si | 챕터 | 보스명 | 특이 기술 추가 |
|---|---|---|---|
| 0 | 1장 썩은 숲 | 흑요염 파괴자 | 기본 18종 (no summon), `lavaPools`, `charge`, `slam` 중심 |
| 1 | 1장 | 독버섯 거인 | + `summon, mine` |
| 2 | 1장 | 사냥꾼 | + `cageTrap` |
| 3 | 1장 | 기생수 | + `seekerMines`; `lavaPools`는 중앙=`P+진행축×120px`, 좌/우=`중앙±수직축×360px` 3지점(`r=150`, 여백 60px, 전조 55/73/91f, 300f, `floor(atk×0.9)`) |
| 4~9 | 2장 벌레굴 | 벌레 수호자~여왕 구더기 | 점진 해금: `fanWave→wallPush→shieldBash2→spiralBullet` |
| 10~13 | 3장 지옥의 겨울 | 얼음 망령~봉인 괴물 | + `laser, safeCorner, teleStrike, delaySlash, perilThrust, gravityWell` |
| 14~20 | 4장 화염지대 | 화염 악마~화염 감옥지기 | + `meteor, radialLaser, swordWave, pillars, burstCounter, chainLightning` |
| 21~25 | 5장 군단 | 전쟁의 잔해~군단 지휘관 | + `mirrorGuard, rewindStrike, orbWeave, mirrorClone` |
| 26~31 | 6장 사도의 마굴 | 살점의 수호자~대사도 | + `itemSteal` |
| 32~34 | 7장 지옥성 | 전체 49종 해금 | `null` (필터 없음) |

전체 기술 49종 목록은 `9적ai패턴디자인/` 참조.

### `cageTrap` 뼈감옥 전투·VFX 계약 (2026-09-03)

> 2026-09-06: 다크드루이드(si0/si3)는 cageTrap 사용 금지. 무브셋에서 제외하고 강제 실행도 recover/25f로 종료하며 감옥·생성음을 만들지 않는다. 다른 보스와 플레이어 뼈감옥은 아래 계약 유지. 드루이드 본체 dw=9.3/dh=14.1(1.5배), r=44 피격 판정 불변.

| ID | 한글명 | 생성 위치 | 반경 | 경고 | 총 수명 | 피해 | 타격 조건 |
|---|---|---|---:|---:|---:|---:|---|
| `cageTrap` | 뼈감옥(가시 감옥) | 발동 순간 플레이어 좌표 `P.x/P.y` | `110px` | `40f` | `210f` | `floor(보스 ATK × 0.8)` | 경고 종료 후 감옥 테두리와의 거리 `<20px`, 재타격 간격 `20f`, 플레이어 무적 프레임 적용 |

| 항목 | 현재 값 | 적용 위치 |
|---|---|---|
| 판정 데이터 | `{t:0,warnT:40,maxT:210,r:110,dmg:floor(e.atk×.8),el:e.el,src:e,hitT:0}` | `_bossDoAction()`의 `case 'cageTrap'` |
| 경고 표시 | `t<40f` 동안 빨간 점선 원, 진행도에 따라 alpha `0→0.4` | 감옥 렌더 블록 |
| 스프라이트 | `assets/vfx/boss/boss_cageTrap.webp`, 투명 WebP `1536×1024`, `3×2`, 셀 `512×512`, `6f`, `source-over` | `registerVFX('boss_cageTrap',...)` |
| 성장 타이밍 | 경고 종료 뒤 `36f` 동안 `frame 0→5`, 이후 마지막 프레임 유지 | `_ctRise=min(1,(t-warnT)/36)` |
| 화면 배치 | 정사각 렌더 크기 `r×3.35=368.5px`, 좌상단 `(x-size/2, y-size×0.54)` | 감옥 렌더 블록 |
| 퇴장 | 마지막 `30f` 동안 frame `5→0` 역재생+alpha `1→0` | `_ctExit`, `_ctFr`, `_ctF` |
| 생성음 | `skull_summon` vol `0.6`, pitch `0.9±0.15` + `SFX.magic(2)` | `G._cageTraps.push()` 직후 각 1회 |
| 로드 실패 | 기존 갈색 원+12가시 절차식 표현 유지 | `_VFX_SHEETS.boss_cageTrap` 미준비 분기 |
| 패링 | 패링 가능 목록 유지. 성공 시 소스 보스 poise `-15`, `doParry()` 호출 | `_PARRYABLE_ATK`, 감옥 업데이트 블록 |

이번 변경은 시각 교체만이다. 반경·피해·속성·경고/수명·타격 주기·패링 판정은 변경하지 않는다. 에셋 제작·정규화 상세는 `../5.1임펙트디자인/BOSS_CAGE_TRAP_VFX.md`를 따른다.

### 보스 mine 액션 사거리 수정 (2026-05-09)
- `mine` 액션 range: `[0, 999]` → `[0, 220]`
- 이유: 원거리에서 지뢰 설치 방지 — 보스가 플레이어 근처에 있을 때만 사용

### 바닥 지뢰 어둠속성·진보라 통일 (2026-06-27, 진보라 심화 2026-06-28)
- 바닥에 깔리는 지뢰류를 모두 **어둠속성(EL.D)** + **진보라** 비주얼로 통일
- 대상: `mine`(설치형 지뢰), `seekerMines`(추적지뢰), `trap`(덫), `iceZone`/`blizzard`(빙판슬라임·눈보라마법사), etype16 지뢰몹 오라
- 속성 변경: 두 액션 모두 `el:e.el`(보스 속성) → **`el:EL.D`** — 데미지 계산 시 어둠 상성(elMul) 적용
- 색상 변경: 노랑/주황(`#ffcc00`/`#ffaa00`/`#ff8800`/`#ff4400`) → 보라(`#a833ff`/`#d488ff`) → **최종 진보라(`#5e10a8` 메인 / `#7a14c8` 하이라이트)** — 설치 파티클·렌더·폭발 파티클·예고 텍스트 전부. seekerMines 미점화 dim상태 `#552288`/`#663388` 유지
- **지뢰류(mine·seekerMines) 붉은색 전환 (2026-06-30, 가독성)**: 바닥 지뢰가 어두운 맵에서 안 보여서 **강한 붉은색 + 가산합성(lighter) 글로우**로 변경. `mine`(~43300): 외곽`#ff2a00` r22/중간`#ff3010` r12/코어`#ff8855` r5/흰중심`#ffeecc`+경고링`#ff3a00`(점화임박`#ffee00`). `seekerMines`(~46764): armed`#ff2a00`/`#ff3010`/코어`#ffaa66`, dim`#ff5522`/`#ff6a33`. 속성·데미지·예고텍스트는 그대로(EL.D). `trap`은 진보라 유지.
- 이유: 바닥 함정(덫)은 진보라 통일, 단 **지뢰류(mine·seekerMines)는 가독성 위해 붉은색 예외**
- **지뢰(mine)·덫(trap) 솔리드 강화 (2026-07-05, 1개 가시성)**: 기존 전(全) 가산합성 반투명이라 어두운 배경에서 흐릿해 1개면 안 보임 → **불투명 솔리드 본체+검은 테두리** 추가. `mine`(~43314): 가산 외곽글로우`#ff2200` r26/`#ff3010` r15 → **솔리드 본체 `#ff2000` r8 + 검은테두리(`#000` lw2) + 흰코어 `#fff` r3** → 경고링 `#ff3a00` r18(펄스). 폭발임박(life<35%)엔 본체·링 `#ffe000`/`#ffee00` 노랑. 스폰 `col` `#5e10a8`→`#ff2000`(fallback 대비). `trap`(덫사도, ~43522): 동일 솔리드 처리 + **빨강 통일**(`#ff2000` 본체+검은테두리+흰코어+`#ff3a00` 링) — 덫도 지뢰처럼 패링 반사·자원수급 가능해 `빨강=패링가능` 색언어로 동질감(이전 "덫=진보라 구분" 규칙 폐기). `seekerMines`는 이전 그대로. **덫·지뢰 모두 패링 반사 대상**(noParry 없음).

---

## 6. Three.js 3D 보스 오버레이

### 개요

| 항목 | 값 |
|---|---|
| 캔버스 | `<canvas id="boss3dCvs">` |
| z-index | `5000` (2D 게임 캔버스 위. `vfx3dCvs`=4999, `chest3dCvs`=4998) |
| 렌더러 | `THREE.WebGLRenderer` (alpha:true) |
| 2D 보스 숨김 방법 | `window._b3Active=true` + `bE._spawnT=999` 이중 보호 — 3D 활성 시 2D 렌더 완전 차단 |
| 메쉬 컬링 | `THREE.DoubleSide` — 이동 중 facing 회전 시 텍스처 소실 방지 |

### 독립 테스트 하니스 = 본게임 오버레이 사용 (2026-08-16 정합)

`game_boss3d_test.html`은 **자체 3D 보스를 그리지 않는다.** `game.html`을 iframe으로 띄우고 디버그 키(F10 보스전 / F9 무적 / F8 프로파일 / Shift+R 리셋)만 주입하며, 화면에 보이는 3D 보스는 **game.html 내장 오버레이(`#boss3dCvs`/`_b3*`)** 가 그대로 렌더한 것이다 → 테스트 = 본게임 보스전과 정의상 100% 동일.

> **폐기된 구버전 (2026-08-16 이전)**: 하니스가 iframe 위에 별도 `<canvas id="overlay3d">`(부모 문서, z-index 50)를 얹어 **자체 Three.js 오버레이로 보스를 이중 렌더**했다. 이 외부 오버레이는 내장 `_b3`와 어긋난 낡은 값을 써서 유저가 "비율/배치가 다르다"고 관측:
> - 스케일 `bossRcss * 2.0`만 사용 → 챕터 `scaleMul`(1장 `0.4`) 누락으로 **약 2.5배 과대**
> - Y배치 하드코딩 `worldY - 100`(중심 기준) → 내장은 발 기준 `worldY - bossRcss`
> - 모델 `boss_01.glb` 고정 → 내장은 챕터별 스왑
>
> 외부 오버레이를 제거해 이중 렌더·불일치를 근본 차단했다. 부수효과로 하니스의 여분 WebGL 컨텍스트 1개가 사라져 컨텍스트 소실(§ Mac 컨텍스트 소실) 압력도 완화된다. 백업: `game_backup_boss3d_test_pre_align.html`.

### 챕터 모델 선택·비동기 교체 (2026-08-16 LOCK)

`_b3animate()`는 매 프레임 `SI_TO_HELL[G.stage]`로 필요한 hell index를 계산하고, 현재 모델과 다르면 `window._b3loadModel(hellIdx)`를 호출한다. `window._b3loadModel`은 classic/module 스코프 경계를 넘어 테스트·보스 진입 코드에서 쓸 수 있도록 노출한 동일 함수다.

| hell index | 챕터 | 모델 세트 | runtime idle | 전용 배율(`scaleMul`) | 비고 |
|---:|---|---|---|---:|---|
| `0` | 1장 썩은 숲 | Vinebound Sentinel | `assets/3d/Meshy_AI_Vinebound_Sentinel_biped_Animation_Idle_withSkin.glb` | `0.4` | 직립 휴머노이드. 전역 보스 시각 배율 4.0×와 곱해 실제 화면에서 발 정렬·전신 가시성을 유지 |
| 그 외 / 미등록 | 해당 챕터 | 기존 Meshy_AI_1 fallback | `assets/3d/Meshy_AI_1_biped_Animation_Alert_withSkin.glb` | `1.0` (암묵) | 기존 모델·애니메이션 경로 유지 |

| Vinebound action id | GLB | 슬롯/사용 위치 |
|---|---|---|
| `idle` | `Meshy_AI_Vinebound_Sentinel_biped_Animation_Idle_withSkin.glb` | 기본 loop |
| `walk` | `Meshy_AI_Vinebound_Sentinel_biped_Animation_Walking_withSkin.glb` | `eWalk`/`eWander`/`ePatrol`/`bossRec`/`eRetreat` |
| `aggro`, `run`, `chargeWind`, `charge`, `multiDashWind`, `multiDash`, `spinWind`, `spin` | `Meshy_AI_Vinebound_Sentinel_biped_Animation_Running_withSkin.glb` | 추적·돌진·회전 상태 |
| `slamWind`, `slam` | `Meshy_AI_Vinebound_Sentinel_biped_Animation_Charged_Ground_Slam_withSkin.glb` | slam windup/실행 |
| `hit` | `Meshy_AI_Vinebound_Sentinel_biped_Animation_Dead_withSkin.glb` | 현행 hit/stagger 매핑. 별도 품질 작업 전까지 유지 |

`Unsteady_Walk_withSkin.glb`는 **hit에 연결하지 않는다**. 길이 약 3초, `Hips` translation이 있고 평면 이동 범위가 약 17.45 source units인 locomotion clip이므로 피격 제자리 모션 후보가 아니다.

Vinebound의 UUID/raw 다운로드 GLB 2개는 runtime 경로에서 제거하지 않고 `assets/3d/raw/vinebound/`에 provenance로 보관한다. 코드가 참조하는 production GLB는 `assets/3d/` 루트의 deterministic animation 이름만 사용한다.

#### generation guard

| 항목 | 구현/규칙 |
|---|---|
| generation | `_b3loadGeneration`은 실제 `_b3loadModel` 요청마다 증가. 각 GLTF load는 시작 시 `loadGeneration`을 캡처 |
| stale idle model | callback에서 `loadGeneration !== _b3loadGeneration`이면 `_b3disposeGltf(gltf)` 후 return. `_b3anchor`/`_b3model`/`_b3mixer`/`_b3actions`에 설치 금지 |
| stale action GLB | generation 불일치 또는 mixer identity 불일치면 dispose 후 return. 이전 skeleton mixer에 action을 붙이지 않음 |
| current model | 현재 generation만 scene anchor, mixer, action map을 교체 가능 |
| 회귀 검증 | headed Chrome에서 `hell 0 → hell 1 → hell 0`의 첫 Vinebound idle 응답을 1.2초 지연. 최종 `Model loaded (hell:0)` 1회, `sceneChildren=4`(조명 3+anchor 1), `anchorChildren=1`, console error 0 PASS |

### 위치/스케일 계산 (`_b3animate`)

> **수정 (2026-05-07 v1.5)**: `_btOffsetY`가 피벗 Y에만 반영되고 클리핑 평면에 미반영돼 50px 어긋나던 버그 수정. `_footY = _b3floorY + _b3yOff`로 피벗과 클리핑 동기화.
>
> **수정 (2026-05-07 v1.6)**: 클리핑 평면(`_b3clipFloor`) 완전 제거. 발좌표 `window._b3footScreenX/Y` 전역 노출.
>
> **수정 (2026-05-08 v1.7)**: xRot 발 기준 회전 구조 변경. `_b3anchor` 그룹 추가 — anchor=발 위치, pivot=회전만. 모델 origin을 bounding box 중심→발 하단으로 이동 (`_b3model.position.y += _modelSz.y * 0.5`).

### 씬 그래프 구조 (v1.7~)

```
_b3s (Scene)
  └─ _b3anchor (Group) ← position.x/y만 (발 위치 = _footY)
       └─ _b3pivot (Group) ← rotation.set(xRot, facing, 0) + scale + 스턴 흔들림
            └─ _b3model (gltf.scene) ← position.y = +_modelSz.y*0.5 (발→중앙 오프셋)
```

- 이전 구조: `_b3pivot`이 위치·회전 동시 담당 → xRot 시 허리 기준 회전으로 머리가 땅에 박힘
- 신규 구조: anchor(위치) / pivot(회전) 분리 → xRot이 발 기준으로 회전

### 위치/스케일 계산 상세

```javascript
// 보스의 게임 좌표 → CSS 픽셀
cssX = bE.x/scale - camX + innerWidth/2
cssY = bE.y/scale - camY + innerHeight/2

// 발 위치 (Three.js Y: 위가 양수, physY 기반)
_b3floorY = -((physY/scale + bossRcss) - H/2)
_b3yOff   = window._btOffsetY || 0
_footY    = _b3floorY + _b3yOff

// anchor = 발 위치
_b3anchor.position.x = cssX - W/2
_b3anchor.position.y = _footY          // tgtH*0.5 불필요 — 모델 origin이 발 기준

// 발좌표 전역 노출 (blob shadow 등 외부 활용)
window._b3footScreenX = cssX
window._b3footScreenY = cssY + bossRcss

// 스케일 (pivot에 적용)
tgtH = (bE.r / scale) * 2.0 * (window._btScaleMul || 1) * (_B3_ANIMS.scaleMul || 1)
_b3sc = Math.max(0.1, tgtH / _b3size.y)
_b3pivot.scale.setScalar(_b3sc)

// 회전 (pivot에 적용 — 발 기준)
_b3pivot.rotation.set(window._btRotX || 0, -bE.facing + Math.PI/2, 0)

// 스턴 흔들림 (pivot 로컬 오프셋)
if(bE.stunned>0){ _b3pivot.position.x+=sin(...); _b3pivot.position.y+=cos(...) }
```

### Y 위치 공식 변경 이력

| 버전 | 공식 | 문제 |
|---|---|---|
| 초기 | `-(cssY-H/2) - 100` | 5x 스케일 시 모델이 땅속에 박힘 |
| v1.4 (2026-05-06) | `-(cssY-H/2) + tgtH*0.5` | 발 위치 기준으로 모델 중앙 올림 → 해결 |
| v1.5 (2026-05-07) | `_footY + tgtH*0.5` (`_footY=_b3floorY+_b3yOff`) | `_btOffsetY`를 클리핑 평면에도 반영 — 피벗/클리핑 50px 어긋남 수정 |
| v1.6 (2026-05-07) | 동일 (`_footY + tgtH*0.5`) | 클리핑 평면 완전 제거 — `clippingPlanes=[]`, 발좌표 `window._b3footScreenX/Y` 전역 노출 |
| v1.7 (2026-05-08) | `_b3anchor.position.y = _footY` (tgtH*0.5 제거) | anchor/pivot 분리 — 발 기준 xRot 회전. 모델 origin 발 하단으로 이동 |

### X 회전 이력

| 버전 | rotation.x | 효과 |
|---|---|---|
| 초기 | `0` | 기본 (누워있는 느낌) |
| v1.4 (2026-05-06) | `-0.28` (~-16°) | 모델을 약간 세워 정면 강조 |

---

## 7. 보스 테스트베드 (`?bosstest=N`)

### 실행

**node `server.cjs` :3333 에서만 연다.** `python http.server` 금지(API 404).

```
http://127.0.0.1:3333/game.html?bosstest=0
http://127.0.0.1:3333/game.html?bosstest=2
```

`N` = 스테이지 인덱스 (0~34). 지정 스테이지 **원형 보스 아레나**에 즉시 소환.

| 항목 | 값 |
|---|---|
| 서버 | `C:\nvm4w\nodejs\node.exe server.cjs` 포트 3333 |
| 필드 | `initStage` 필드/고정맵 **생성 금지** (`_bossTestReq>=0`이면 `_enterBossArena()` 직행) |
| 인트로 | `_startIntroCutscene` 스킵 (`G._cutsceneDone=true`, `G.on=true`) |
| 테스트베드 | `G._bossArena` 준비 후 버프/UI. 필드 `initStage`를 다시 호출하지 않음 |
| si2 | 지옥기형 (`?bosstest=2`) |

> 2026-08-18: 예전엔 부트가 `initStage`(1장 필드)를 만든 뒤 2초 후 아레나로 바꾸려다, 부트가 더 느리면 필드가 아레나를 덮어썼다. 지금은 `?bosstest`면 필드 자체를 만들지 않는다.

### 기능

| 기능 | 설명 |
|---|---|
| 보스 동결 (`_btFrozen`) | 보스 AI 정지 (`bossPatT=99999`) |
| 스케일 슬라이더 | `window._btScaleMul` 조절 (기본 4.0×, 본게임 동기화) |
| 프레임/속도 제어 | `_btSetSpeed`로 0.1/0.25/0.5/1/2× 버튼 또는 0.1~3.0× 슬라이더, PAUSE·STEP 제공 |
| 갓 모드 | 플레이어 무적 + 스킬 프로필 MAX |
| 보스 재소환 | `_enterBossArena()` 재호출 후 300ms 대기로 `_btBoss` 갱신 |

본게임 `_enterBossArena()`는 플레이어를 6시 입구에 둔다. **`?bosstest=N`만** 보스 남쪽 3타일(`P.y = boss.y + 3*T`)에 세우고 초기 카메라를 `(P.x,P.y-2*T)`에 둔다. 테스트베드 활성 중(`window._btActive=true`)에는 본게임의 플레이어+보스 중간점 카메라 분기를 사용하지 않고 `P.x/y + look-ahead`를 추적한다. `📍 텔레포트` 버튼은 플레이어를 보스 앞 80px로 옮기는 동시에 카메라를 플레이어 좌표에 맞춰 전신 잘림을 줄인다. 본게임 보스 아레나 카메라·클램프·6시 입구 규칙은 변경하지 않는다. si0 보스 아레나의 독립 필드몹 3종은 진입과 갱신에서 차단한다.

### 주요 전역 변수

| 변수 | 기본값 | 역할 |
|---|---|---|
| `window._btScaleMul` | `4.0` 기본값, 테스트베드 버튼 `0.5/1/2/3/5/8×` | Three.js + 2D 캔버스 보스 시각 배율 |
| `window._btRotX` | `0.0` (rad) | 보스 3D X축 회전 |
| `window._btOffsetY` | `0` (px) | 실제 게임 기본값. 보스 Y 오프셋 — 2D 캔버스 스케일 피벗 Y + Three.js 피벗 Y에 반영. 양수=위로 이동. 이전 `-200`은 실제 3D 발 위치를 화면 아래로 200px 밀어 모델을 가리므로 폐기 |
| `window._b3footScreenX` | `cssX` | 보스 발 스크린 X 좌표 (blob shadow 등 외부 활용) |
| `window._b3footScreenY` | `cssY + bossRcss` | 보스 발 스크린 Y 좌표 (blob shadow 등 외부 활용) |
| ~~`_b3clipFloor`~~ | ~~`Plane(0,1,0)`~~ | **제거됨 (v1.6)** — `clippingPlanes=[]`, 클리핑 비활성화 |
| `window._b3Active` | `true/false` | 3D 오버레이 활성 여부 — true면 2D 보스 렌더 완전 차단 |
| `_btBoss` | `ens.find(e=>e.ib)` | 테스트베드 보스 참조 |
| `_btGod` | `true` | 플레이어 무적 |
| `_btPaused` | `false` | 게임 루프 일시정지 |
| `_btSlow` | `false` | 슬로우모션 활성 |

### `_btScaleMul` 적용 위치

| 위치 | 적용 방식 |
|---|---|
| Three.js 3D 모델 (`_b3animate`) | `tgtH *= _btScaleMul` → `_b3pivot.scale` |
| 2D 캔버스 (`_drawBossWalk`) | `_largeMul = _btScaleMul` |
| 2D 캔버스 (ext atlas, int atlas) | `_eLargeMul / _bLM = _btScaleMul` |
| 2D 캔버스 렌더 래퍼 | `X.translate(e.x, e.y+_bYOff); X.scale(_bScMul, _bScMul)` — `_btOffsetY`도 피벗 Y에 반영 (2026-05-13) |

### 알려진 이슈 — 검정 배경 (WebGL 컨텍스트 소실) (2026-06-28 수정)

**증상**: `?bosstest=N` 진입 시 맵/배경 전체가 검정으로 렌더. 콘솔에 `CONTEXT_LOST_WEBGL` 로그.

**원인**: 테스트베드는 동시에 WebGL 컨텍스트를 다수 생성 (메인 월드 + BOSS3D `_b3r` + VFX3D + Vinebound `_v3r` + CHEST3D `R` + FOG ≈ 9개). 브라우저 동시 컨텍스트 한도를 넘으면 **메인 월드 webgl2 컨텍스트가 먼저 소실** → 맵이 안 그려져 검정.

**복구 핸들러** (`game.html` line ~4602, `C._glCtxHandlers` 가드로 최초 1회만 등록):

| 이벤트 | 동작 |
|---|---|
| `webglcontextlost` | `ev.preventDefault()`; `_useGL=false`, `GL=null`; instanced 리셋; 렌더 함수 no-op化 |
| `webglcontextrestored` | `_initWebGL()`로 파이프라인 통째 재구축 → `_buildProxyX()` 재빌드 → `_shDirty=true` + `_queueMapCacheRefresh()`로 텍스처 자동 재업로드 |

> webgl2 캔버스는 `getContext('2d')`가 `null`이라 Canvas2D 폴백 불가 — 반드시 컨텍스트 재구축 경로로 복구.
> **복구일 뿐 예방은 아님.** 근본 해결은 3D 오버레이 렌더러(`_b3r`/`_v3r`/CHEST `R`)의 지연 생성으로 컨텍스트 수를 줄이는 것 (미구현).

### HP 표시 오버플로우 수정 (2026-06-28)

`_btUpdateInfo` 의 HP 표기가 `~~`(ToInt32) 32비트 절단으로 HP > 2³¹ 시 음수 쓰레기값(`-7851003392`) 출력 → `Math.floor(...).toLocaleString()` 으로 교체. HP/maxHP/Poise 동일 적용.

---

## 8. 카메라 시스템 (보스 아레나)

### 보스 아레나 카메라 동작

| 동작 | 평상시 | 보스 아레나 |
|---|---|---|
| 추적 대상 | 플레이어 (`P.x/y + look-ahead`) | 플레이어+보스 중간점 (`.5+.5` 믹스) |
| 룩어헤드 반영 | 100% (`G._camLkX/Y`) | 30%만 반영 |
| 줌 (`G._camZoom`) | `1.0` | `0.80` (줌아웃) |

### 카메라 코드 (`game.html` — 업데이트 루프)

```javascript
// look-ahead
const _lkX=(P.vx||0)*25, _lkY=(P.vy||0)*25;
G._camLkX += (_lkX - G._camLkX) * _lkSmooth;
G._camLkY += (_lkY - G._camLkY) * _lkSmooth;

// 추적 타겟
let targetX = P.x + G._camLkX, targetY = P.y + G._camLkY;
if(G._bossRef && G._bossRef.alive){
  targetX = (P.x + G._bossRef.x) * .5 + G._camLkX * .3;
  targetY = (P.y + G._bossRef.y) * .5 + G._camLkY * .3;
}
G.cam.x += (targetX - G.cam.x) * camSpd;
G.cam.y += (targetY - G.cam.y) * camSpd;

// 줌아웃
const _czTgt = (G._bossRef && G._bossRef.alive) ? 0.80 : 1.0;
if(!G._camZoom) G._camZoom = 1.0;
G._camZoom += (_czTgt - G._camZoom) * (1 - Math.pow(0.94, _dtSp));
```

### 렌더 적용 (`draw()`)

```javascript
const _cz = (!_EDITOR_MODE) ? (G._camZoom || 1) : 1; // 보스 줌아웃
const _tzoom = _ez * _cz;
if(_tzoom !== 1){
  X.translate(C.width/2, C.height/2);
  X.scale(_tzoom, _tzoom);
  X.translate(-C.width/2, -C.height/2);
}
X.translate(Math.round(C.width/2 - G.cam.x + sx), Math.round(C.height/2 - G.cam.y + sy));
```

- 줌은 화면 중앙 기준으로 적용 → 카메라 타겟(플레이어+보스 중간점)이 항상 화면 중심에 유지
- 에디터 모드(`_EDITOR_MODE`)에서는 `_cz=1` 고정, 에디터 줌(`_ez`)만 사용

---

## 9. 보스 플래그 일람

| 플래그 | 타입 | 설명 |
|---|---|---|
| `e.ib` | bool | 보스 여부 (isBoss 약자) — 핵심 식별자 |
| `e._isLargeBoss` | bool | si===0 (흑요염 파괴자)만 true |
| `e._pImmune` | int | 포이즈 면역 남은 프레임 (300 = 5초) |
| `e.poise` | float | 현재 포이즈 |
| `e.maxPoise` | float | 포이즈 최대값 |
| `e.stunned` | int | 그로기 남은 프레임 |
| `e._maxStunned` | int | 그로기 최대값 (애니메이션용) |
| `e.bossPatT` | int | 패턴 타이머 (99999 = AI 동결) |
| `e._spawnT` | int | 2D 드로우 타이머 (999 = 2D 숨김, Three.js만 표시) |
| `e._btFrozen` | bool | 테스트베드 동결 플래그 |
## 2026-09-05 `bossRec` 회복 상태 머신 보정

| 상태 | 생성 경로 | 진입 타이머 | 종료 조건 | 종료 상태 | 적용 코드 |
|---|---|---:|---|---|---|
| `bossRec` | `fanWave` 충격파 발사 후 | `40f` | `st2<=0` | `idle` (보스는 `3~8f` 대기) | `updateE()` `case 'bossRec'` |
| `bossRec` | `radialLaser` 2차 발사 종료 후 | `50f` | `st2<=0` | `idle` (보스는 `3~8f` 대기) | `updateE()` `case 'bossRec'` |
| `bossRec` | `teleStrike` 착지 후 | `35f` | `st2<=0` | `idle` (보스는 `3~8f` 대기) | `updateE()` `case 'bossRec'` |

- `updateE()`가 매 프레임 `st2`를 감소시키며, `bossRec`는 공격 후 회복 애니메이션을 유지한 뒤 반드시 `idle`로 복귀한다.
- `bossRec` 처리 분기 누락으로 `fanWave`, `radialLaser`, `teleStrike` 종료 후 보스가 영구 정지하던 버그를 수정했다.
- 공격 피해, 전조 시간, 패턴 쿨다운, 포이즈, 사거리 수치는 변경하지 않았다. 회복 상태의 정상 종료 연결만 보정했다.
- 회귀 테스트: `test/bossRecRecovery.test.js`; 브라우저 검증: `?bosstest=3`에서 세 패턴 종료 후 `idle`/다음 패턴 진행 확인.

## 2026-09-13 정지 덫 가시성 수정

| 대상 | 변경 |
|---|---|
| trap | 중앙점4px→8px, 코어1.6→3px. 실제 접촉 반경28px에 고정 경계·반투명 채움 추가. 수명 음수인 영구 덫도 계속 표시 |
| 렌더 | source-over, 빨강 채움 .24, 어두운 외곽5px, 밝은 경계2.5px·alpha .85~1. 기존 작은 가산 글로우7px 대체 |
| 유지 | 피해·접촉·감속·Q 패링·영구 지속·누적50개 상한. 일반 지뢰/추적지뢰 변경 없음 |
| 기준 | `docs/5.1임펙트디자인/GROUND_TRAP_VISIBILITY_20260913.md`. 이전 중앙점만 남기는 크기 축소 설명보다 이 계약이 우선 |


## 2026-09-23 보스 레이저 — 예고 고정 스윕/발사 임팩트

기존 `laser` 무브의 허용 보스·선택 조건·피해·사거리·지속시간은 유지한다. 변경은 `updateE()`의 `bossLaserWind → bossLaser` 실행 계약뿐이다.

| id/필드 | 값 | 적용 위치 | 의도 |
|---|---:|---|---|
| `laser` 허용 구간 | si 10~13부터 | `_BOSS_MOVESET` | 기존 해금 구간 유지. 1장 보스 무브셋에는 추가하지 않음 |
| `bossLaserWind` | 기존 전조 중에만 플레이어 추적 | `e.laserAng += diff×0.04×sp` | 플레이어에게 명확한 예고선을 제공 |
| `_laserLockAng` | 전조 종료 시점의 `e.laserAng` | 발사 전 1회 저장 | 빔이 발사 뒤 플레이어를 재추적하지 않게 고정 |
| `_laserSweepDir` | `-1` 또는 `1` | 발사 전 1회 무작위 | 좌/우 중 한 방향으로만 스윕 |
| `_laserSweepT` | `0`에서 매 틱 `+sp` | `bossLaser` | 프레임 배율을 반영하는 누적 스윕 시간 |
| 빔 각도 | `_laserLockAng + _laserSweepDir×0.0065×_laserSweepT` rad | `bossLaser` 80f | 약 0.52rad(30°)를 일정 속도로 훑어 예고 후 회피 가능 |
| 발사 중 보스 이동/재조준 | 없음 | `bossLaser` | 빔 원점과 각도가 플레이어를 따라붙지 않게 해 안전한 회피 경로를 보장 |
| 발사 임팩트 | flash 3f, shake 8×`OPT.shake/100`, 파티클 14개 | 전조→발사 전환 | 기존 빔 렌더를 유지하면서 발사 시작점을 또렷하게 표시 |
| 불변 수치 | `st2=80f`, `laserLen=1400+stage×60`, 기존 판정/피해/패링/회복 | `bossLaser` | 난이도·보상 계약은 변경하지 않음 |

- 회귀 테스트: `test/bossTelegraphReadability.test.js`는 전조 종료의 방향 잠금, 누적 스윕, 발사 중 재조준 제거를 검사한다.

## 2026-09-29 필살기 미사용 이미지·3D 애니메이션 자원 로딩 수정

| id / 적용 위치 | 현행 계약 및 검증 |
|---|---|
| 실제 오류 | localhost 게임 탭의 G._ultImg.lava가 complete=true/naturalWidth0. 같은 로드에서 SFX Failed to fetch·GLTF blob 텍스처 실패·WebGL context lost가 함께 기록됨. PNG는 서버HTTP200/4072255바이트/디스크와 SHA256 동일,1743×1890 RGBA 디코드 약12.57MiB. 호스트 freeRAM 약41.74GiB였으므로 시스템 RAM 부족으로 단정하지 않음 |
| 미사용 VFX | draw 초기화의 G._ultImg에는 black:new Image() 및 assets/vfx/boss/ult_black_c.png만 보관. ult_holy_c.png·ult_lava_c.png 초기 요청은 제거. 실제 _ultBurst 생성은 kind:black이며 탄막블랙홀 재분출은 기존 원형 보존 반사탄을 사용. 파일 자체·블랙 회전/버스트·신성 필살기의 기존 별도 렌더는 유지 |
| VFX 수명 | 기존 G._ultImg 가드로 같은 게임 상태에서 한 번만 요청. 로딩 실패 시 이미지 complete/naturalWidth 기존 가드를 사용하며 프레임마다 재요청하지 않음. 새 자동 재시도·추가 이미지·해상도 변경 없음 |
| _b3loadActions | idle 모델 설치 뒤12개 상태를 src별 Map으로 묶음. walk/aggro/run/hit/chargeWind/charge/multiDashWind/multiDash/spinWind/spin/slamWind/slam. 동일GLB는 한 번만 fetch/parse하고 각 상태에는 AnimationClip.clone() 후 개별 name을 지정해 mixer.clipAction에 등록 |
| 동시 요청 | 애니메이션 job의 inFlight<2일 때만 시작. idle은 먼저1개 로드하며, 완료 뒤 애니메이션 GLB 최대2개. 성공·실패·동기 load 예외 모두 슬롯을 반환. 실패그룹은 로그 후 나머지 job을 계속 진행하며 무제한 재시도하지 않음 |
| 임시 자원 | 현재 generation의 성공 GLB도 clip 추출 후 _b3disposeGltf(g2)로 scene의 geometry/material/texture/skeleton을 각 객체별1회 dispose하고 소유 ImageBitmap을 close. stale generation 또는 mixer 불일치도 같은 해제를 사용하며 action 설치 및 다음 대기 job 시작을 차단. 표시 중 idle 모델은 임시해제 대상이 아니며 교체 시 _b3releaseModel에서 해제 |
| 실제 파일 수 | Vinebound: idle/walking/running/dead/charged_ground_slam의5파일, 기존idle1+상태12=13회 load→5회. Meshy_AI_1 fallback도 idle/Walking/Monster_Walk/Running/Unsteady_Walk의5파일. 상태13개(idle+12),기존 경로·애니메이션 매핑·모델 스케일·위치 유지 |
| 회귀 | test/resourceLoading.test.js6건:미사용 VFX/GLB중복/동시상한/임시해제/실패후진행/stale가드. 수정 전2PASS·4FAIL→6PASS. 관련 bulletBlackHoleVfx·bulletBlackHoleUltimate·audioBootLoading·bootAssetSlowDiagnostics 포함20PASS. game.html inline/classic/module 스크립트6개 acorn 구문 PASS |
| 실제 브라우저 | 격리127.0.0.4의 Node 서버 게임에서 실제 Escape→안내 건너뛰기로 G.on=true 진입. black 텍스처1857×1849 complete/naturalWidth 정상,holy/lava resource 요청0. window._b3loadModel(0) 실호출의 신규 네트워크 기록은truncated=false, GLB5파일/동시peak2/실패0/13상태 등록 로그 확인. 새 게임 console error0,기존 Multiple instances of Three.js 경고1은 별도 현행 제약 |
| 검수 경계 | 새 게임 시작 초기 전체 네트워크 버퍼는truncated이므로 전체 부트의 네트워크 실패0으로 확대 해석하지 않음. 수정 뒤 별도 모델 로드 구간은 유실 없이 수집. 장시간 전투·모든 GPU 환경·WebGL 컨텍스트 소실 예방 전체 해결·3D 모든 공격 모션의 시각 승인은 주장하지 않음. 사용자 기존 게임 탭은 강제 새로고침하지 않고 검수 탭만 정리 |
| 기록·소스 제어 | tmp/resource-loading-20260929에 game-before.html,docs 전체 검색,red/green 테스트,검수 summary 및 changes.patch. .git 읽기 전용으로 커밋 미완료,타 작업 변경·스테이징 보존. UI 크기·배율은 변경하지 않음 |


## 2026-09-29 별도 안개 컨텍스트 복원 계약

| 적용 위치 | 현행 계약 |
|---|---|
| fogGL / _fogGLInit | 기존 _fogThree가 있으면 새 렌더러·resize listener를 생성하지 않음. 소실 이벤트에서 preventDefault 및 _fogGLR=false, Three.js 내부 복원 뒤 유효한 컨텍스트이면 true |
| _fogGLRender | 사전 isContextLost 검사로 소실 중 render/시간 증가를 생략. render 도중 예외는 실제 컨텍스트 소실일 때만 정지 처리하고 그 외 예외는 전파 |
| 별도 경계 | 메인 C/GL의 기존 소실 복구 계약과 UI 크기는 그대로 유지. 당시 남아 있던 r128/r160 중복은 아래 로컬 단일 런타임 계약으로 대체(2026-09-29). 컨텍스트 통합은 별도 |
| 검증·수치·제약 | [안개 소실 보호 상세 계약](../12퍼포먼스·최적화/12퍼포먼스·최적화.md#2026-09-29-안개-webgl-컨텍스트-소실-보호복원). 관련26PASS, 실제 게임 소실 시 메인 draw 지속, 동일 안개 코드의 실제 GPU 복원 및 error0 확인. 전체 게임 장시간 복원 QA와 커밋은 미완료 |

## 2026-09-29 보스 모델 교체 자원 수명 수정

| id / 적용 위치 | 현행 계약·검증 |
|---|---|
| 원인 | _b3loadModel의 이전 모델 정리는 scene.remove와 mixer.stopAllAction 및 참조 초기화만 실행하여 geometry/texture/skeleton GPU 자원이 남음. 안개 소실 보호와 별개의 재현된 자원 누적이며 ERR_INSUFFICIENT_RESOURCES 전체의 유일 원인으로 단정하지 않음 |
| _b3releaseModel | 실제 교체 시작 시 기존 mixer.stopAllAction → 기존 model의 mixer.uncacheRoot → _b3applyFlash(false) → _b3disposeGltf({scene:_b3model}) → scene에서 anchor 제거. anchor/mixer/model/pivot/meshes/origMats/actions 초기화, state=idle,window._b3dbg=null로 이전 모델 디버그 참조 제거 |
| 공용 피격 재질 | _b3applyFlash(false)로 각 mesh에 원래 material을 복원한 뒤 폐기. 공용 _b3flash는 해제하지 않으며 새 모델의 피격 flash에 계속 사용 |
| _b3disposeGltf 소유권 | 해당 GLTF scene의 mesh geometry/material/texture/skeleton/ImageBitmap만 해제. 각 종류별 Set으로 동일 객체의 dispose/close를 한 번만 호출. 배열 material,같은 texture를 쓰는 여러 material 속성,여러 mesh가 공유하는 skeleton을 처리 |
| decoded 이미지 | texture.image가 ImageBitmap이면 bitmap.close()로 디코드 이미지도 해제. 배열 image도 지원. texture.dispose()만으로 CPU 디코드 이미지 해제를 대체하지 않음. 현재 loader의 파일별 소유권 계약을 사용하며 game에서 Three.Cache.enabled=true를 설정하지 않음. 향후 외부 GLTF 사이 texture/bitmap 공유 캐시 도입 시 이 해제 계약도 함께 변경해야 함 |
| skeleton | skeleton.dispose()로 renderer에 생성된 boneTexture를 해제. geometry/material/texture dispose와 별개이며 중복 skeleton은 1회 처리 |
| 비동기 안전 | 기존 generation/mixer identity 가드와 GLB src별 중복 제거·현재 generation 애니메이션 job 최대2개는 유지. stale idle/action GLTF에도 동일 자원 해제를 사용. 이미 같은 hell의 ready 모델 재요청은 기존 early return으로 자원과 mixer를 유지 |
| 보존 계약 | 보스 GLB 경로·13상태 매핑·scaleMul·색상/조명·카메라·UI 크기·resScale·안개 복원 계약 변경 없음. 당시 r128/r160 중복 경고는 아래 로컬 단일 런타임 계약에서 제거(2026-09-29). 컨텍스트 수 감소는 별도 |
| 자동 회귀 | test/resourceLoading.test.js에 실제 모델 교체/mixer 해제,flash 상태 교체,동일 ready 모델 보존,공유자원 중복 해제 방지의4테스트 추가. 수정 전13PASS·3FAIL →16PASS. 관련4파일을 합쳐30PASS,game.html 실행 스크립트6개 구문 PASS |
| 실제 GPU 대조 | 같은 실제 r160/GLB/보스 모듈을 추출한 격리 QA에서 수정 전 fallback→hell0→hell1→hell0: renderer.info.memory geometries1→2→3→4,textures2→4→6→8. sceneChildren4/actions13/programs1은 같으므로 장면에서 제거만 해서는 GPU 해제가 되지 않는 경로를 직접 확인 |
| 수정 후 실제 반복 교체 | fallback 피격 flash→hell0 전환 및 hell1→0→1→0의4추가 교체에서 각 기존 geometry/material/texture/boneTexture의 dispose event1회,기존 bitmap width/height0,이전 mixer stats.actions.total=0/bindings.total=0. renderer geometries1/textures2/programs1,sceneChildren4/actions13 유지. 공용 flash dispose0,window error0,contextLost=false |
| 시각·검수 경계 | 실제 fallback/Vinebound의 텍스처와 모델 표시를 브라우저에서 확인. QA 전용 확대180·카메라 z1000/far2000은 renderer.html에만 사용하며 production에는 적용하지 않음. 전체 게임 보스 전투·발 위치/전신 구도·모든 공격 모션의 시각 승인·장시간 자연 컨텍스트 소실 예방까지 완료한 것은 아님 |
| 기록·커밋 | tmp/boss-model-lifetime-20260929의 before,tests-red/green,renderer-before.html/renderer.html,docs-search,browser-summary,changes.patch. UI 파일은 이번 작업에서 수정하지 않음. .git 읽기 전용으로 커밋 미완료,타 작업 staging/dirty 변경 보존 |
| API 근거 | [Three r160 AnimationMixer uncacheRoot](https://github.com/mrdoob/three.js/blob/r160/src/animation/AnimationMixer.js),[Skeleton.dispose](https://github.com/mrdoob/three.js/blob/r160/src/objects/Skeleton.js),[GLTFLoader ImageBitmap 경로](https://github.com/mrdoob/three.js/blob/r160/examples/jsm/loaders/GLTFLoader.js) |


## 2026-09-29 Three.js 로컬 단일 런타임 동기화

| 적용 위치 | 현행 계약·검증 |
|---|---|
| main/easy boot·importmap | `three-runtime.js`와 boss/chest import가 `assets/vendor/three-r160/build/three.module.js`의 동일 namespace 공유. r160/0.160.0, 코어 요청1/three.min.js 요청0/CDN Three 요청0 |
| 안개/VFX 색상 | `_fogGLStart` 기존500ms+공유 Promise 대기. fog/VFX `LinearSRGBColorSpace` 출력 및 `_v3legacyColor` 명시 색공간으로 기존 채널 보존. boss/chest SRGB 출력·카메라·UI 크기·resScale 유지 |
| 실제 검증 | 관련35PASS/0FAIL, 두 HTML inline6개씩 구문 통과. 두 게임 native 입력으로 G.on=true, 공유 보스 pivot/안개 renderer 및 상자/VFX API 정상, 앱 warn/error0. 안개 및 가시성용 QA VFX GPU 대조 각각131072 bytes/차이0 |
| QA 경계 | VFX 대조는 기존 mirrored Y+FrontSide culling을 제거하는 QA 전용 DoubleSide fixture. production side/카메라 변경 없음; 전체 공격 가시성·장시간 전투 QA는 별도 |
| 배포·소스 제어 | NW.js FILES 및 web 필수 목록에 새 boot/로컬 JS 포함. MIT LICENSE·provenance도 함께 추적/배포 필요. .gitignore의 전역 build/ 예외는 assets/vendor/three-r160/build/three.module.js와 상위 디렉터리로 한정. .git 쓰기 제한으로 커밋 미완료, 실제 패키징/업로드 미실행 |
| 세부 SSOT | [파일·숫자·SHA256·수명·검증 범위](../12퍼포먼스·최적화/THREE_LOCAL_SINGLE_RUNTIME_20260929.md) |
