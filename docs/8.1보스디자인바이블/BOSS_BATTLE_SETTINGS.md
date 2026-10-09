## 2026-10-09 독탄 접촉 표시 소비

적대 Druid blackBean의 패링되지 않은 접촉만 `druid_poison_hit`로 분리했다. 반경120·수명72틱·피해·중독·Q전용 패링·SFX는 유지한다. [정본](../5.1임펙트디자인/DRUID_POISON_CONTACT_IMPACT_20261009.md). Node1/8그룹59조건 PASS와 통제 native Canvas 재생/종료 확인; 실제 정상 줌 보스전·청취·save는 미검수, RETOUCH.

## 2026-10-09 — Druid 최대 품질 원화의 SW 정지 검토

[현행 원화 비교 계약](../4.0케릭터스프라이트%20디자인/DRUID_HIGGSFIELD_MAX_ART_REVIEW_20261009.md). bossReview=1/bosstest=0/bossArtReview=druid-sw-max에서 현재 Druid·stage0·frozen idle·nativeDir1·image ready만 새 정지원화를 표시한다. AI 재개·공격·실패는 기존 consumer로 복귀한다. 기존 dh14.1r·idle body591/foot603/셀620에 후보 body3356/foot3386을 고정 등록하며 전투/판정/기존 모션·save를 바꾸지 않는다. 실제 main 화면·다방향/리깅/A급 미인수, RETOUCH.

# 보스 배틀 세팅 바이블

2026-10-09 현행: [Druid 독탄 core/잔광/키 배치](../5.1임펙트디자인/DRUID_PROJECTILE_READABILITY_20261009.md)와 [공개 발사·피격음](../6사운드디자인/DRUID_POISON_PUBLIC_SFX_20261009.md)을 main에 시험 연결했다. blackBean Q전용/E불가·물리E원/마법Q마름모·전투 수치는 유지하며, 본편 정상줌·실전 음질·A급은 미인수/RETOUCH다.

<a id="druid-transform-guide-20261009"></a>
## 2026-10-09 — 변신 24자세·야수 외형·보스전 안내

사용자가 승인한 해골·뿔 왕관을 유지하고 장식/발광을 줄인 새 원화의 **본편 검토 후보**다. 이 절이 아래 이전 특수 시트 유지 기록보다 우선한다. 24는 고정 상한이나 24fps가 아니며 실제 wind 시간 전체에 24자세를 배분한다. 일반 보행·공격은 아직 원본4프레임이며 전체 주요 캐릭터 전환 완료가 아니다.

| id / 적용 위치 | 현재 계약 |
|---|---|
| transform source | assets/sprites/boss/boss_dark_druid_transform_20261009.png?v=3; 3072×3072, 6×4/24자세; 8,549,347B/SHA256 0f4b9f9499b2aede0d2ac8eba913ccc27181c9f070dcf516333cc05bf230cfcc |
| beast source | assets/sprites/boss/boss_dark_druid_beast_20261009.png?v=3; 2048×1536, 4×2/S·SW·W·NW·N·NE·E·SE 정지8방향; 1,710,709B/SHA256 c1845f5c1dd74515cab82eed120175d8008fdf37087978d516c1ed13cbf83063 |
| 제작/정렬 | MagicLight Seedream5.0 Pro; 변신은 실제24 source pose, 불균등 원시 격자의 alpha 연결구간을 추출해 동일배율로 배치. 야수는 방향별 높이388px, 후면2개 별도 source. 공통 cell512×768/footY660; 원PNG 불변 |
| _druidTransformWind / _bossStartPattern | si0/si3 ib의 Charge/Jump/MultiDashWind 실제 state/max를 WeakMap에 캡처. 렌더 progress=clamp(1−st2/max,0,1), capture 불일치 fallback45; frame=min(23,floor(progress×24)). 짧은 wind/렌더 건너뜀에서24셀 모두 표시 보장 없음 |
| _loadDruidSheets | authored transform/beast 실패 시 1회 원본 경로 fallback; authored=false. 원본 transform8×1/8자세, beast4×2/8방향 유지 |
| _drawDruidBoss | authored dh=r×spec.dh×1.23, dw=dh×cw/ch, 목적지 y=−dh×.86; 소스발660과 런타임660.48의 완전 일치 주장 없음. 몸 부피/웅크림 높이는 보존하고 legacy lighter2패스는 authored에 생략. Canvas 특수경로이며 새3D/360° 아님 |
| 본편 소비 제외 | walk4×8/150ms, 기존 NORMAL borrowed rig·기타 공격/잠행/등장 원화, 판정·피해·수량·RNG·회복·전투 상태 시간·보상·save schema 그대로 |
| 보스전 가이드 진입 | 보스바 ‘보스전 가이드 · F1’, 설정 버튼 및 F1 토글. tools/engine/boss-combat-guide.mjs?v=20261009-2; dialog z-index100000, Escape/닫기/배경 닫기·focus 복귀. 설치 전 클릭은 loading 반환; 지연 open 없음 |
| 패링 탄막 | physical=크림색 원/현재 E(sBash) 바인딩, magic=보라색 마름모/현재 Q(sBlock) 바인딩. blackBean은 Q 전용, E 불가·Q 성공 시 blueBean 유도반사. 표식 반경 max(9,1.4×(r 또는 sz)), 글자11px |
| 독립 오브/바닥 | 큰 독립 ORB 반사 불가, 패링창은 접촉을 막을 수 있으나 회피 권장. 바닥 장판은 회피. Q 현재 모드(iceOrb/peaceShield/base)도 안내하며 EL.P만으로 Q/E를 정하지 않음 |
| 그로기 처형 | X 고정. 습득/쿨다운0/실제 살아있는 grog보스/idle·행동없음/자원 충족 필요. HP·MP·ST 각각 floor(max×.1), HP>비용·MP/ST≥비용. 기존 CD300기준frame/5초, 보스 HP최소1 남김·추가 타격 필요. Z는 일반 필살기 |
| 검토용 bossReview=1 | 문서 로컬 memory storage; fetch /api/ 및 non-GET/HEAD 차단403, XHR 동일 목적 차단·beacon false. 일반 URL 무변경. 통제 Gate 검증이며 실제 API호출0·durable save 불변 인수 아님 |
| 실행 증거 | 신규24 actual whole draw 통제Node1/4그룹PASS; legacy8fallback 별도. 에디터 새Node1/8그룹46조건PASS. 최초14구그림 Gate/5 delta Gate/준비실패 이력과 합산하지 않음 |
| 실제 화면 | 기존3387의 별도 actual main 검토18: chargeWind 중간 새변신·charge 새야수·Q마름모·가이드 위/아래·F1 focus 확인. testbed/GOD/r22/시각스케일4·frame STEP 통제; 정상CH1 unlock route/정상줌/전체24재생 연속성·성능·청취·보상save 인수 아님 |
| 시각 판정 | **VISUAL VERDICT: RETOUCH**. 중간 자세 점프·마지막변신→야수 팔/높이 변화·후면 부분직립·어두운 전투장 VFX 가림 남음. 사용자 검토표시 blocking0; A급/전체2.5D 완료 아님 |

변신 및 주요 캐릭터 프레임 제작 기준은 [엔진 애니메이션 정본](../5.0애니메이션파이프라인/EXODUSER_ENGINE_ANIMATION_20261009.md)과 [캐릭터 정본](../4.0케릭터스프라이트%20디자인/4.0케릭터스프라이트%20디자인.md)을 따른다. 최종 증거: E/druid-transform-guide-consumer-20261009/completion.json.


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

스테이지(si) → 허용 기술 Set. 현행 `BOSS_MOVES` 정의는 59개이며, idx41 `cageTrap`은 호환용 예약으로 모든 보스의 허용 풀에서 제외된다. 초기 미정의 Set은 마지막 si0~34 루프에서 채워지므로 si32~34도 `null`이 아니라 58개 ID의 명시적 Set이다. 허용 풀은 전투 선택·실행 성공 판정과 구분한다.

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
| 32~34 | 7장 지옥성 | 정의59 중 예약 cageTrap 제외 허용 풀58 | 명시적 Set(최종 보강 루프); 페이즈·거리·CD·점수 조건은 별도 |

현행 기술 정의 59개와 보스 허용 풀 58개를 구분한다. idx41 `cageTrap` 정의는 예약으로 보존하며, 전 보스에서 Set 제외·AI 점수 -1·강제 실행 recover/25f 종료를 유지한다. `9적ai패턴디자인/`의 역사적 49종 설계와 이번 source 선언 수를 같은 분모로 치환하지 않는다.

### `cageTrap` 뼈감옥 전투·VFX 계약 (2026-09-03)

> 2026-09-06: 다크드루이드(si0/si3)는 cageTrap 사용 금지. 무브셋에서 제외하고 강제 실행도 recover/25f로 종료하며 감옥·생성음을 만들지 않는다. 다른 보스와 플레이어 뼈감옥은 아래 계약 유지. 당시 드루이드 spec dw=9.3/dh=14.1(1.5배), r=44 피격 판정 불변. 20261009 normal walk/attack의 실제 폭은 원본 셀 비율 dw=dh×cw/ch를 우선하며 base8·특수는 기존 분기다.

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


---

## 2026-10-02 — 보스 사망 후 필드 진행 보존 (현행 재도전 계약)

기존 §2의 `_preArenaBackup`은 맵만 복원하는 경로에서 아래 필드 진행 계약으로 보강했다. 일반 arena 복원과 CH1-1 필드 사망 예외를 구분하며, 시연 si=3 직접 재도전은 맨 먼저 적용하는 기존 계약을 유지한다.

| 적용 경로 | 현재 계약 |
|---|---|
| 일반 `G._bossArena&&_preArenaBackup` | 진입 전 `_captureBossFieldState()`의 46개 key를 `_restoreBossFieldState(b)`로 복원. ens/MAP_OBJS/worldItems·탐색·소환굴/리프트·지역/해금·특수 적 refs/flags/stage 보존 |
| `G.stage===0&&!G._bossArena&&G._bossUnlocked` | 재도전 때 현재 필드를 capture/restore. `initStage`·방/통로 적 재스폰 없음 |
| 해금 전 CH1-1 및 다른 일반 필드 사망 | 기존 `G._zoneState={};initStage(G.stage)` 유지 |
| 보스 진입 격리 | CH1 앵글러/화마귀 refs 분리. 모든 일반 arena 진입 곰치 일시 `[]`, `_wmStage=G.stage`; 복귀 원 nullable refs/flags/stage 복원. easy CH1 3tick 가드 본편과 정렬; 일반 worm tick 정책 확대 없음 |
| 복귀 위치·사망 후처리 | 기존 게이트 남쪽 `(_bossCx+.5)*T,(_gateY+6+.5)*T`→safePt. EXP 30% 손실·최대치 완충·iframes 300·화톳불 300f/r280 유지. P/INV/EXP/사망 횟수/누적 stageTime snapshot 0 |
| 생성/배치/밸런스 | arena 크기·생성기·에셋·좌표 설계·보스 수치·공격 패턴 변경 0 |

맵 캐시·미니맵·적 공간 해시·조명은 현재 필드 기준으로 무효화/재빌드하고 `initMapObjects` 재생성은 제외한다. 정확한 복사 의미·플레이어 일시효과 정리·검수 경계는 [CH1-1 보스 사망 진행 보존 정본](../4.1맵디자인+설정/CH1-1_BOSS_RESPAWN_PROGRESS_20261002.md)를 따른다. 검수 영수증 `tmp/mac-migration-runtime/continued-review-20261002/boss-respawn-backup/receipt.json`: 양판 actual source 30/30 PASS(각 15), 공통 자원 인접 회귀 5/5 PASS(최종 후 1회), inline JS 12/importmap JSON 2 구문 PASS. SHA와 46개 필드·대역/미검증 범위는 전용 정본에 기록한다. 검수는 실제 source 추출 + controlled fixture에 한정한다. 실제 게임·등록 이벤트·카메라·시각·오디오·성능은 미인수이며 source PASS를 runtime/visual PASS로 대체하지 않는다.

## 2026-10-03 source9 생산 동기화 — windup 시각 계약·보스 소환 예외 회복

`game.html:39450` / `game-easy-test.html:38252`의 `bossSummonWind`를 root가 생산 양판에 적용했다. 최종 공동 소스와 공식 검사 pin은 [동기화 기록](../CHANGELOG_SYNC.md)의 같은 날짜 source9 절을 따른다. 원 Claude 후보·보스 단독 파생 후보와 최종 공동 생산 소스는 서로 다른 pin이다.

| 상태/항목 | 현재 구현값·계약 | 변경 경계 |
|---|---|---|
| `bossSummonWind` 전조 | 기존 소환 전조 55f 유지 | 새 전조 시간·공격 수치 변경 없음 |
| 완료 후 회복 | 기존 `recover`, `st2=70` | 소환 본문의 `try/finally`에서 정상 완료와 예외 모두 회복 상태 연결을 보장 |
| 예외 | 원래 던져진 예외를 그대로 전파 | 삼키는 `catch`, 자동 재시도, 새로운 소환 정책 없음 |
| 부분 삽입 | 실패 전에 있던 배열 prefix와 먼저 삽입된 소환수 유지 | rollback·배열 초기화·중복 소환 없음 |
| 정상 소환 | 기존 RNG·생성 인자·HP 절반·쉴드0·효과 호출 순서 유지 | stage0/3/34 synthetic fixture로 원문과 비교; 준비 중 상태도 유지 |
| 변경 크기 | 양판의 소환 case 각각 801→860B, +59B | 양판 전체 +246B 중 보스 변경분. 다른 함수 원문 보존 |

후보 보스 검수 10/10과 최종 공동 생산 검수 46/46은 같은 변경의 파생 검수 범위를 포함하므로 별도 완제품 성과로 합산하지 않는다. 실제 `Array.prototype.push`의 Proxy index-write 실패 fixture에서 기존 prefix2개·먼저 삽입된 소환수1개 유지, 동일 예외 전파, `recover/70f`를 확인했다. 자연 보스 도달·실게임 예외 재현·보스 사망/부활·실화면/실청취 검수는 완료하지 않았다. source9 앱 빌드·실행0이며 native/visual PASS를 뜻하지 않는다.

## 2026-10-03 source10 생산 동기화 — 고정 MP·안개 캐시·낙하 기절 상태 보존

| bossTeleDrop 분기 | 현재 정확 계약 | 불변값·후처리 |
|---|---|---|
| 외부 조건·패링 | 기존 radius/iframes<=0/P.s!='charge' 및 `if(isPWin())` ordinary-parry 분기 유지 | 거리80+e.r, 피해`e.atk×1.8×elMul` 유지 |
| 피해 후 순서 | 기존 `hurtP` → `_isFocusState()` 집중 message → B else-only | focus 분기 유지; 새 전체 case break0 |
| B 조건 | `else if(P.s!=='fallen'&&P.s!=='dead')`에서만 기존 pStun/FX | hurtP가 만든 fallen/dead 두 상태 보존. alive/HP/다른 terminal guard로 확대0 |
| 기절 | main300f / easy150f | [기존 보스 착지 특수 스턴](../14밸런스+수치테이블/PLAYER_GROGGY_3S_20260913.md)의 수치 유지 |
| case 후처리 | `e.s='bossRec';e.st2=35` 그대로 | 새 predicate main39693 / easy38495 |
| 패링 분류 | CH3+ 기존 ordinary-parry signature 불변 | teleDrop 전체Q전용 주장0. magic의 Q-only/E불가 규칙은 별도 원계약 유지 |

생산 양판에 적용했다. fresh live production resource/stun handler·dispatch·completion·case28/28 PASS1회(exit0/stderr0), inline12JS+2JSON syntax PASS1회다. 후보28/28은 같은 변경의 사전 의미검수이므로 fresh 생산 결과와 완제품 성과로 중복 합산하지 않는다. 이전source9 검사 반복0. source10 패키징·실행0, CH1 보스 사망/native·실화면·실청취·플레이 save 완료0이다. [최종 소스·공식 증빙](../CHANGELOG_SYNC.md)의 source10 절을 참조한다.


## 2026-10-03 source14 보스 사망 복귀 시 드루이드 임시 공격 정리

실제 접점은 `retryBtn.onclick`의 보스 구역/해금 완료 CH1 필드 복귀 분기다. 동일 초기화의 기존 선례는 `_enterBossArena`이며, `initStage`나 별도 `_retryBossArena` 함수로 오기하지 않는다.

| id / G key | 복귀 순간 값 | 적용·보존 경계 |
|---|---|---|
| druidOrbs / `_druidOrbs` | 새 빈 배열 `[]` | 이전 보스전 독립 ORB를 필드로 가져오지 않음 |
| druidOrbTimer / `_druidOrbT` | 0 | 이전 발사 타이머를 초기화. 이후 기존 update에서 다시 증가할 수 있음 |
| druidParryTimer / `_druidParryT` | 0 | 이전 Q 리듬탄 누적 타이머 초기화 |
| druidParryVolley / `_druidParryVolley` | 0 | 이전 리듬탄 웨이브 카운터 초기화 |
| 위치 | 기존 `_gSlamWave/_lavaField/_gwPillar` 정리 직후, `_restoreBossFieldState(b)` 이전 | 두 HTML 각70B 추가. 기존46 field key에는 네 key 없음 |
| 다른 분기 | 해금 전 일반 `initStage`, si3 `_retryDruidFinale` 선행 | 이번 분기 추가를 다른 사망 경로에 중복 적용하지 않음 |

기존 ORB 루프는 stage0/3 및 bossAlive가 참이면 bossRef가 null이어도 남은 배열을 이동·충돌 처리한다. 복귀 후 bossAlive=true/ref=null인 상태에서 이전 ORB가 필드에 남는 경계를 복귀 순간에 정리한다. 필드 map/ens/아이템/지역/열린 문을 새로 만들거나 초기화하지 않는다. 보스 공격 수치·110f 발사·3발·r26·속도6.8·피해0.6배 및 Q/패링/탄 보정은 변경하지 않는다. 실제 의미 검수·native 경계는 [복귀 정본](../4.1맵디자인+설정/CH1-1_BOSS_RESPAWN_PROGRESS_20261002.md)의 source14 절을 따른다.


## 2026-10-03 source23 — 보스 착지·탄막 전조 범위 동기화

| 상태 / 적용 위치 | 현재 표시값 | 실제 판정·보존 경계 |
|---|---|---|
| `bossJump` 바닥 fill/stroke | `e.jumpX,e.jumpY` 중심 반경300px 고정. 이전30~60px 및 후보300×진행도는 미사용 | 착지 즉시 피해 `dst(P,e)<300`·atk×1.8·무적/돌진 예외 유지. 충돌 없는 경로에서 목표=실착지 중심. 벽막힘 시 실제 `e.x/e.y`와 목표의 기존 괴리는 미해결 |
| `bossFanWind` arc·오브 각도 | `π×(.7+e._bossPhase×.06)`, 페이즈0~4에서126/136.8/147.6/158.4/169.2도 | 실제 발사 `fanW`와 동일식. 방향 표시 길이 `120+stage×3`은 사거리 표시가 아님. 탄 수·RNG·피해·수명·유도 불변 |
| 검수 / 적용 | 양판 각각 draw3접점만 수정, 역치환 source22 byte-exact. 신규8 PASS(원본4 PASS/4 FAIL); 실제 분기·기존 회귀 포함12 PASS | canvas는 호출 기록 대역이며 native·화면·GPU·시각 최종 인수 아님. source23 앱3398 포장·타이틀·HTTP 확인; source22/3397 앱은 기존 코드 보존 |

상세 수치·실제 분기·한계·§23 보고는 [source23 전조 계약](../5.1임펙트디자인/CH1_BOSS_LANDING_FAN_TELEGRAPH_20261003.md)을 따른다. 피해·패링·타이밍·맵 geometry·카메라·기존 앱/세이브는 변경하지 않았다.


## 2026-10-03 source24 — 현재 스테이지 콤보와 저장 최고 기록 분리

| id / 적용 위치 | 현행 값·공식 | 수명·보존 경계 |
|---|---|---|
| stageCombo / `G._sStats.comboMax` | `initStage`에서0. 기존 `hurtE` 처치 콤보 증가 뒤 `G.combo > (G._sStats.comboMax || 0)`일 때 갱신 | 콤보 종료 때 최대값은 유지. 새 스테이지 생성 때만 기존 다른 `_sStats`와 함께 리셋 |
| lifetimeCombo / `G.comboMax` | 기존 킬 최대값·`game.comboMax` 저장/복원 유지 | HUD·사망 화면은 기존 저장 최고 기록 사용. 본편 저장 빌더4곳/Easy3곳 및 복원 원문 불변 |
| clearScore / `_showClearResult` | `comboMax:_ss.comboMax || 0`, 콤보 기여×5 | 계수·시간·처치·지역·보스·사망/무피격·랭크 공식 불변. 이전 최고60/이번0은 기존+300 대신0 |
| clearStats / 현재 최대콤보 | `(_ss.comboMax || 0)` | 배지 콤보마스터≥50, 콤보광20~49. 이름·번역키·기존DOM/선택/버튼 구조 불변 |
| bossDeathReturn / capture→restore | `_sStats`는46-key 필드 snapshot에 포함하지 않음 | 현재 stage 최대콤보/사망 횟수 유지. 보스 진입 전 기록으로 rewind하지 않음. 해금 완료 CH1 필드 복귀도 `initStage` 미호출 |
| save / 재개 | 새 저장 필드 없음. `_sStats`는 기존대로 런타임 통계 | 로드로 새 stage를 생성하면 현재 통계는0부터 시작. 저장 최고와 기존 `_clearRecords`를 지우거나 과거 inflated 점수를 재계산하지 않음 |
| failure / 검증 | 최종 원본2PASS/8FAIL → 후보10PASS → 생산50PASS | 실제 reset/kill/clearStats/score/best/capture·restore source 실행. DOM 기록/필드 입력은 대역. 실제 Mac 플레이·화면·청취 인수 아님 |
| source / 적용 범위 | 양판 각6치환, 각+112B. 신규 `test/stageComboResult.test.cjs` | 역치환 원본 전체 byte-exact, index/전투 피해/RNG/저장 builder/capture·restore 함수 불변. source24 앱3399 포장·타이틀·HTTP 확인; source23 앱3398은 이전 코드 보존 |

최종 source 검증은 신규10 + 기존 클리어 공식6 + 보스 필드 복귀34 =50건이다. 테스트 준비 단계에서 기존 결측 통계의 무피격+500과 Easy 저장 빌더3곳을 잘못 가정한 fixture를 수정했고, 최초 결과를 보존한 뒤 최종 원본 실패대조·후보·생산 검증을 완료했다. 게임 코드의 버그 수정과 fixture 교정을 구분한다. 원자료는 `tmp/mac-migration-runtime/continued-review-20261003/root-stage-combo-source24/`의 before/candidate/baseline-test-corrected/candidate-test-corrected/production-test 및 영수증이다.

같은 후보 CH1-1 시작→전투/획득→4지역/보스문→보스 사망·부활→재도전의 실제 Mac 인수는 미완이며 source50PASS를 그 완료로 계산하지 않는다. 기존 사용자 게임·세이브·앱8·보호2_3·Q-only magic/E불가·어택티켓 금지·타인WIP는 보존했다.


## 2026-10-03 source25 — 사망·부활의 오디오 오류 격리

| 접점 | 현행 계약 |
|---|---|
| player | `die`의 궁극기 unmute·빔/방패 정지·사망/1회부활 음성과 `_fallenResolve`의 부활음·사망음·BGM fade/600ms 예약 callback 각각 오디오 예외를 기록하고 후속 게임 처리를 계속한다. 사망 판정300f·자원·확률·EXP30%·저장 변경0 |
| monster / boss | `deathFX`의 직접 사망음 블록만 catch하여 기존 파티클/혈흔을 후속 실행한다. 일반 보스180f 폴백의 부활음/확정사망음 catch. 부활HP50%/포인트10·55f숨김/40f VFX 보존; si3 전용 피날레 설정 변경0 |
| actual loop | 첫 `_sfxFrameReset` 호출의 catch로 update/draw/다음RAF까지 이어진다. 하위 `_playSampleNow`의 같은Error 전파와 dispatcher finally의 배치 폐기를 변경하지 않는다. context획득은 기존 finally 전이므로 그 실패 때 queue잔류 정책도 보존 |
| 검증 | 원본 공통36검사2PASS/34FAIL → 후보38PASS(정상동등2추가) → 생산38+기존field복귀34=72PASS. 양판 정상7시나리오 및 실제loop185콜백/184물리틱 state/events/RNG 대조. DOM·음향·clock·RAF/update 소비 대역이며 기기 청취/native완주 아님 |
| 적용/보존 | 양판 각12정확치환/+858B; 역치환으로source24원본전체exact. index/backend/flush함수·save·Q/E·보호2_3 불변. source25앱3400 포장·타이틀·HTTP 확인. source24앱3399는 이전 코드로 보존. 보스사망/부활/재도전·청취/저장/화면 인수는아직미완 |

정본: [사망·부활 오류 격리](../6사운드디자인/SOUND_DEATH_REVIVE_PROGRESS_20261003.md). 이전 source 검수와 앱 이력은 당시 결과로 보존한다. lazydecode pending 정리·음원복구/다른피격·입력caller 예외는 이번 범위 밖이며 모든 오디오 장애가 해결됐다고 판정하지 않는다.


## 2026-10-03 source25 Mac 실행본 — 사망·부활 오디오 오류 격리 포함

| 항목 | 이번 확인 범위 |
|---|---|
| 코드/후보 | `b9c1a2e6559fd907c6ba0b72b8a5f6d19b9f88b5` / job `a05224ef-0b57-4b87-ab0a-fba20aeb2a45` / port3400. die·fallenResolve·deathFX 및 실제loop의 음향예외 격리 포함 |
| 포장/기동 | 입력7918/기존runtime340/execute1회. payload7916 stage/app각SHA exact, 복사당6645490969B. 파생bootstrap2·arm64실행파일5. 실제 타이틀AX/JPEG2704×1696·HTTP4×200/정적3원문exact |
| 이전 검수 | source25 생산검사72PASS는 당시source검수이며 이번 포장단계test반복0. source24 콤보와 이전 필드복귀 수정 포함 |
| 실제 입력 | macOS ioreg의 `CGSSessionScreenIsLocked=true` 읽기확인. GUI입력0/새캐릭터0/잠금해제 새회신 대기. 인증·잠금 우회0 |
| 남은 목표 | 같은후보 CH1-1 시작·전투/획득/장착·4지역/보스문·사망/부활/재도전·저장/청취/visual 미인수. QA의retry BGM예외 후보는별도root실제handler검수/채택대기이며이번앱에포함했다고주장하지않음 |
| 보존 | source24/3399 포함기존10검수앱 존재/plist ID와profile/save 메타만대조. 사용자게임·세이브입력0/보호67/manager4 보존. 원래사용자앱59376baf/08cac1ce 정확경로UNKNOWN |

정확한 경로·SHA·검수 경계는 [source25 Mac 후보](../13출시·마케팅/MAC_CH1_SOURCE25_CANDIDATE_20261003.md)를 따른다. source24 타이틀·source17 부분플레이를 이번 같은후보 완주 근거로 합산하지 않는다.


## 2026-10-03 source26 — 재도전의 BGM 실패와 진행 분리

| id / 소비자 | 현재 오류 경계와 후속 처리 |
|---|---|
| R01 / `initStage` 마지막 스테이지 음악 | `try{BGM.play(BGM.stageKey(si));}catch(e){console.error("[BGM] stage start",e);}`. stageKey/play 동기 오류를 기록하고 함수 정상 반환. 앞선 맵 생성/캐시/조명 예외는 catch하지 않음 |
| R02 / `retryBtn.onclick` 필드·arena 복귀 음악 | 기존 컷신 보류 조건 그대로, 그 조건을 통과한 음악 호출만 catch/`[BGM] field retry` 기록. 공통 자원/idle/iframes300·화톳불300f/r280→최종스탯/완충→HUD/QS→G.on=true→준비된DB 저장 계속 |
| 진행·저장 | 기존 EXP30% 정수 손실·46-key 필드/열린 보스문/적 HP·지역/현재 P·INV·통계 보존. 해금 전 일반재시작 유지. dbSave 본문/schema/API 변경0; 저장 예외는 그대로 reject |
| 검수 | 신규16 원본4PASS/12FAIL→후보 신규16+기존34=50PASS. 생산50+기존음향36=86PASS. 실제 전체 retry handler·capture/restore 실행, 일반 initStage는 기존 생성대역 뒤 실제 마지막 음악 statement만 실행. 전체맵/native/기기청취·실저장 검수 아님 |
| 적용 경계 | 본편/Easy 각2호출부·+104B, 역치환source25전체exact. BGM 본체/stop/Promise·backend·음량·곡선택/RNG·공식·Q/E·보호2_3 불변. source26 앱3401 포장·타이틀·입력 전달 확인. source25 앱3400은 이전 코드로 보존; native 완주/청취/실세이브 인수 미완 |

정본은 `docs/6사운드디자인/SOUND_RETRY_PROGRESS_20261003.md`다. source25 사망·부활72PASS와 포장·타이틀 기록은 당시 인수 이력이며 이번 실제 Mac 사망/재도전 완료로 합산하지 않는다.


## 2026-10-03 source26 Mac 실행본 — 재도전 음악 오류 격리 포함

| 항목 | 이번 확인 범위 |
|---|---|
| source/실행본 | `d7cff1fb9ef030acfc837041f0ccea93756b4b54` / job `c3902d79-03c0-4c25-9e66-a43226d10288` / port3401. initStage 마지막·field/arena retry의 BGM 동기 오류 격리2caller 포함 |
| 포장/기동 | 입력7918/runtime340 재사용·execute1회, payload7916 stage/app 각SHA exact·복사당6645491177B. bootstrap2 exact/arm64실행파일5. 실제title AX/JPEG2704×1696·HTTP4×200/정적3현재원문exact |
| 입력 변화 | 처음ioreg locktrue였으나 현재flag없음/console·loginDone=true 확인. 새앱Return1 정상전달→world intro 진행. 인증·잠금해제시도0. stale9click는노드수명오류/전달0이며새화면AX로교정 |
| 검수 한계 | source86PASS는당시코드검수/이번포장test반복0. 캐릭터/CH1시작·전투/획득/장착·4지역/보스문·사망/부활/재도전·정상저장재로드/청취/visual 완주 미인수. 타이틀·인트로를그완료로합산하지않음 |
| 보존 | source25/3400 포함기존11검수앱 존재/ID/profile·save메타만대조. 옛전체재인벤토리/세이브내용읽기·입력0, source25는이새2caller미포함의이전본. 원사용자앱59376baf/08cac1ce 정확경로UNKNOWN/추측제어0 |

정확한 경로·SHA·증거와실제플레이 Gate는 `docs/13출시·마케팅/MAC_CH1_SOURCE26_CANDIDATE_20261003.md`를 따른다. 옛source17 부분플레이와source25 타이틀을이번같은후보완주근거로합치지않는다.


## 2026-10-03 source27 — 새 스테이지의 드루이드 공격 상태 초기화

| 정확 key / 적용 위치 | 현재 값·동작 | 보존 경계 |
|---|---|---|
| `G._druidOrbs` / 일반 `initStage(si)`의 기존 보스 패턴 정리 끝 | 새 빈 배열 `[]` | 이전 스테이지 ORB 객체는 수정·재사용하지 않음. 현 스테이지 ORB producer/접촉/피해/수명 코드 불변 |
| `G._druidOrbT` | 0 | 이후 실제 tick에서 다시 증가. 기존 110f/3발/6.8 frame 속도 불변 |
| `G._druidParryT` | 0 | 이전 스테이지 Q 리듬탄 누적 시간만 제거. 주기·수량·피해·Q/E 규칙 불변 |
| `G._druidParryVolley` | 0 | 이전 웨이브 번호 제거. 이후 기존 발사 시 다시 증가 |
| 양판 코드 | `G._lavaField=null;G._gwPillar=null;` 뒤 각70B 추가 | `_enterBossArena`·retry field 복귀에 이미 있는 네 초기화와 동일. 새 helper·전역정리·삭제0 |
| 다른 분기 | bosstest early-return는 기존 arena 초기화 위임 유지 | 사망 대기/부활 중 clear 추가0. HP50%/180f·si3 피날레·field snapshot46key·save schema·P/INV·플레이어 VFX 불변 |
| 검수 | 원본16개 중4PASS/12FAIL → 후보18PASS → 생산18+기존필드50+사망음향36=104PASS | 실제 전체 initStage 및 실제 ORB tick 원문 실행. 맵/적 생성·render/audio는 대역; 원본/후보 정상stage 전체G/P/events 동일. native·전체맵/청취 인수 아님 |
| Mac / 진행 | source27 코드 checkpoint 시점에는 새 앱 포장 전이었음(후속 현재 포장은 아래 표) | source26/3401은 이전 코드의 실제 숲1·일반 사망 retry·inventory 이력 보존. 이번 CUA 관측은 맥 잠금으로 중단, 사용자 해제 질문 대기. 보스/4지역/획득장착/저장재로드 미인수 |

정본·정확 SHA·대역/fixture·§23 보고는 `docs/8.1보스디자인바이블/DRUID_STAGE_TRANSIENT_LIFETIME_20261003.md`를 따른다. 기존 source14 복귀 정리와 source26 음악 예외 계약은 유지하며 이전 문단은 해당 시점 이력이다. native 보스 사망 시 문/몬스터 진행 보존의 완료 선언이 아니다.


## 2026-10-03 source27 Mac 별도 후보 — 포장/파일 검수 완료, 실제 기동 미실시

| 항목 | 현재 정확 상태 |
|---|---|
| 생산 코드 / job | `3c7dc6ab1cb0bc68cc3b969e27d06204fbe0f97f` / `953a5489-91eb-4d43-9c18-f05454ad27a7` / port3402. 일반 initStage 드루이드 ORB=[]/타이머3=0 각70B 포함 |
| 실제 포장 | frozen7918 입력/runtime340 재사용, 새job execute1회. stage/app payload7916 각각 전체SHA·coverage exact, 복사당6645491317B. source3 byte-exact/bootstrap2 역치환 exact/runtimearm64 실행파일5·plist ID 확인 |
| 증거 | physical 영수증31761B / SHA256 `94bcf7fe6ba1af2b39476511bc691b06b54c920ac636c8216f053ea638da385e` |
| 실제 기동 | 새앱 launch0/HTTP0/GUI입력0, profile/saveRoot 아직 존재하지 않음. CUA의 source26 화면 조회는 Mac 잠금으로 실패, 해제 질문 pending. 인증·잠금 우회0 |
| 인수 경계 | 생산104PASS는 이전 코드 검수이며 이번 포장 test반복0. 같은source27 CH1 시작·전투/획득/장착·4지역/보스문·보스 사망/부활/retry 진행보존·실저장·청취·시각 미인수 |
| 이전 실행본 | source26/3401 포함기존12검수앱 존재/plist ID/profile-save metadata만 확인. 내용hash·입력0. source26의 숲1·일반 사망retry·inventory는 이전 후보의 부분 플레이 이력이며 source27완주로 합산0 |
| 보존 | 기존67WIP/manager4/사용자23변경·원래게임/세이브 보존. 사용자 원래앱59376baf/08cac1ce 정확경로UNKNOWN/추측제어0. 삭제·cleanup·설치·새팀·새채팅0 |

앞선 source27 코드 checkpoint에서 “아직 포장하지 않음”은 당시 단계의 이력이다. 현재 실행 가능한 파일 후보는 준비됐으며 실제 Mac 플레이 인수는 대기다. 정확 앱/프로필·저장경로와 원문SHA는 `docs/13출시·마케팅/MAC_CH1_SOURCE27_CANDIDATE_20261003.md`를 따른다. source26 음악 예외·source14 field복귀·46key 진행 보존 계약은 그대로 포함한다.


## 2026-10-03 source28 Mac 파일 후보 / source27 실제 플레이 후속

이 절은 이전 포장·잠금 대기 이후의 상태다. 이전 날짜별 기록은 당시 이력으로 보존한다.

| 항목 | 확인한 상태와 남은 검수 |
|---|---|
| 최신 파일 후보 | source28 / job `2242869e-903a-4917-a38c-e0f6c02ff47c` / port3403 / 입력 커밋 `f376e3ce9c3524fa7874078c6738e1e5ab8a1e5b` / **PACKAGED_NOT_RUNTIME_ACCEPTED** |
| 포함 코드 | field 복귀의 `P.poison=0;P._rbPoison=[];P._rbBurn=[];` 양판 각44B 및 이전 initStage 드루이드 초기화. 생산89PASS는 경계 대역 포함 코드 검수 이력이며 실제 앱 완주 증거가 아님 |
| 실제 파일 검수 | frozen7918 입력 중 bootstrap2 파생. stage/app payload7916 각각 전체SHA 일치, source3 exact, bootstrap2 전체 역치환 exact, arm64 실행파일5와 plist ID 확인. 재빌드·검사 반복0 |
| source28 실제 플레이 | launch0/native입력0. 물리 검수 시 새 profile/saveRoot 미생성. 전투·보스 사망/부활·열린 문/몬스터 보존·실저장·청취·카메라 인수 미완료 |
| source27 실제 장착/일반retry | 정상 전사 시작→연습 건너뛰기→CH1 첫 필드. 장착4건 후 CP1857. 일반 사망→다시 일어서라로 HP549/549 MP376/376 SP279/279 및 장비 유지 확인 |
| source27 마지막 관찰 | 첫 처치1/32, EXP2/15, 악의997, 시간55초, HP0. Controls 설정 화면에서 대기. 앞선 완충 관찰을 현재 생존으로 계산하지 않음. 아이템 줍기·4지역·보스 해금/사망 미인수 |
| 보존 | source27 포함 기존13 검수앱 존재/Info.plist ID 확인. 기존 profile/save 내용 변경0. 원사용자 앱 정확 위치 UNKNOWN; 전체 원본hash 보존 검증으로 확대0 |
| 물리 영수증 | `tmp/mac-migration-runtime/continued-review-20261003/ch1-source28-build/physical-receipt.json` 32859B / SHA256 `2b677de448db516036e2d32069f5b326e5aec535104f7db0072c57b5d21e5bda` |

파생 port3403·격리 user-state는 원본 서버3333·저장 schema 변경이 아니다. source27 부분 플레이를 source28 제품 인수로 합산하지 않는다. 상세 successor 경로·SHA·장착 표는 `docs/13출시·마케팅/MAC_CH1_SOURCE27_CANDIDATE_20261003.md`의 후속 기록을 따른다.


## 2026-10-07 CH1 드루이드 단일보스 카메라 Y 프레이밍 — ROOT-CH1-BOSS-CAMERA-Y-FRAMING-20261007

카메라 정본의 좁은 예외다. 기존 §7 테스트베드 spawn/6시 진입/입력 및 §8 기본 추적 예제는 보존하고 아래 opt-in Y 예외를 우선 참조한다.

현행 `game.html` working은 4,082,515B / `a2fa7293ab4b14041d2d512fe7661f7b4d645f50985f6264f32c4bd15004fad2`, root owned HEAD+변경 blob은 4,082,330B / `2abd290f0deb4cb9fb0559b41d9925fdddb73e3c414c07b0a0a175a1c7cd16db`다. shared game의 타인 WIP185B를 그대로 보존한다. 이번 변경은 카메라 targetY 한 접점이며 기존 보스 시트·rig factory/adapter·원본 이미지·AI·충돌·전투·저장 수치를 바꾸지 않는다.

| 경계 | 현재 계약 |
|---|---|
| opt-in | `localhost`/`127.0.0.1`:3387의 명시적 `ch1Three=1&ch1Rig=1`; 기본 OFF, storage/schema 추가0 |
| 본편 범위 | 기존 `_ch1DruidScope()`의 stage0·smoothing·production_finish 범위 안에서 editor 아님, `G.on`, `_bossArena===true`, 현재 ens에 속한 단일 보스, NORMAL intent와 native animation/image/sheet ready일 때만 적용 |
| 시트 | slash/slam/windup 또는 DruidVolleyWind/Volley는 attack, walk는 walk, 나머지는 base8. 기존 선택 시트 ready 필요, 새 프레임 시계0 |
| 유지 | 기존 targetX, boss zoom0.80/일반1.0, dt 보간→정수화→최종 map clamp 순서 |
| 폴백 | field·si3/finale·특수 intent·dead/revive pending·복수 보스·no-opt-in·editor·소스 미준비·유효하지 않은 경계는 기존 targetY 유지 |
| 한계 | authored 본체 사각형+P.r 충돌원만 고려. 실제 alpha/플레이어 sprite/label/FX 또는 첫 보간 프레임 fit을 보장하지 않음 |

기존 테스트베드 P+lookahead/본편 보스 중간점 표·예제는 기본 추적 경로다. 아래 좁은 opt-in에서는 기본 targetY 계산 뒤 Y 허용 구간을 적용한다. targetX는 그대로이며 bosstest X를 무조건 보스 중간점으로 해석하지 않는다.

| 계산 | 현행 값/공식 |
|---|---|
| 보간 | `camSpd=1-pow(P.s==='dodge'?.85:P.s==='attack'?.95:.92,_dtSp)`; lookahead=`P.vx/vy*25`, smooth=`1-pow(.9,_dtSp)` |
| 기본 보스 추적 | `_btActive` 아님·살아 있는 bossRef이면 P/보스 각 .5 중간점+lookahead*.3; finale 기존 frame 우선 |
| 다음 zoom | `_czTgt=finaleFrame?finaleFrame.zoom:aliveBoss?0.80:1.0`; `_z0=G._camZoom||1`; `_zRate=1-pow(finaleFrame?(_czTgt<_z0?.88:.98):.94,_dtSp)`; `_zNext=_z0+(_czTgt-_z0)*_zRate` |
| 카메라 추정 본체 | `_dw=cb.r*cs.dw`, `_dh=cb.r*cs.dh`; 기존 spec dw9.3/dh14.1 calibration 유지. 실제 normal walk/attack 표시 폭의 원본 셀 비율 보정과 별도 |
| 기준 Y | `_mul=_btScaleMul||1`, `_off=_btOffsetY||0`, `_drop=cb._teleDropY||0`; `_base=cb.y+_off+_mul*(_drop-6)` |
| 호흡 | base8만 `_breath=abs(_mul)*2`, 그 외0. 부모 scale은 body 역scale과 상쇄하나 translation에는 남음 |
| 합성 bounds | left=`min(cb.x-dw/2,P.x-P.r)`, right=`max(cb.x+dw/2,P.x+P.r)`, top=`min(base-dh*.86-breath,P.y-P.r)`, bottom=`max(base+dh*.14+breath,P.y+P.r)` |
| intro | `_bar=_bossCine.active?VH*.1:0`; 활성일 때 위/아래 각각 최대 화면 높이10% 예약 |
| 맵 Y | half=`VH/(2*max(.3,_zNext))`, mapH=`G.mh*T`; mapH≤half*2이면 mapLo=mapHi=mapH/2, 그 외 mapLo=half/mapHi=mapH-half |
| 기하 구간 | lo=`max(bottom-(VH/2-bar)/zNext,mapLo)`, hi=`min(top+(VH/2-bar)/zNext,mapHi)` |
| 정수 구간 | `_loInteger=ceil(_lo)`, `_hiInteger=floor(_hi)`; 허용 정수 center가 있는 경우만 채택 |
| 유효성 | VW,VH,zNext,mul,dw,dh,P.r,targetY,camSpd,left,right,top,bottom,mapH,loInteger,hiInteger 모두 finite; VW,VH,zNext,mul,dw,dh,P.r,mapH 양수, `0<camSpd<=1`, `(right-left)*zNext<=VW`, `loInteger<=hiInteger` |
| 적용/oversize | 만족 시 `targetY=max(loInteger,min(hiInteger,round(targetY)))`, `_ch1CamFitY=true`. 가로 overflow·정수 구간 없음·비정상 수치이면 legacy targetY 유지. X 재중앙화/zoom 축소/맵·충돌 수정0 |
| 후속 정수화 | 이전Y를 `_ch1CamYBefore`에 보관하고 기존 camSpd 보간 후, `_ch1CamFitY`에서만 이전Y<targetY이면 ceil(Y), 그 외 floor(Y). flag false면 기존 `~~Y`; X는 항상 기존 `~~X`. 이후 기존 zoom/map clamp 순서 유지, 새 G 상태0. 첫 화면 fit은 별도 미인수 |

| 검수 epoch | 실제 결과와 인수 경계 |
|---|---|
| 최초044b CPU | 최초 Node1/VM60, 7그룹36조건 PASS/FAIL0/미도달0/exit0. 이 중 한계 관측은 PASS라는 이름으로 결함을 숨기지 않음: south130 상승 정착 bottom650.4 vs intro 가용하단648, 2.4CSS clip 반례를 발견 |
| 최초044b 미인수 | 첫 보간 screenTop−166.8352 vs intro72로 238.8352CSS 침범, 초기 zoom .988의 불가능 fit도 관측. 첫 보간/zoom 진입은 최종 directional rounding 이후에도 별도 미인수 |
| 철회된2306 CPU | 최초 한정1회 PASS0/FAIL1/미도달4그룹. `1/camSpd` 여유가 intro 허용 밴드보다 커 raw midpoint fallback, top−134.8352 관측. `ceil(lo+1/camSpd)`는 현재 계약에서 철회했으며 실패 원문 보존 |
| 최종a2fa CPU | 현재a2fa source의 최초 한정 Node1/VM53, 6그룹14복합조건 PASS/FAIL0/미도달0/unhandled0/exit0. 명시30case의 방향 정수화/정착 경계만 검증; south130 양방향 cam1954에서 top72.3648/bottom640.8, 단일 정수 band1954에서는 bottom648. universal/all-frame/actual alpha fit 인수0, 원36조건 재실행0 |
| 최초044b native | Chrome/context/page 각1, 기존 bosstest0 1280×720→1600×900 resize 2조건 PASS/FAIL0/미도달0/exit0; GL0·source5 exact·pageerror/HTTP failure0. 최종 directional rounding 전 이력이며 final native로 재사용하지 않음 |
| 최초044b 관측 | authored body+P.r snapshot 첫 screenTop81.8868/bottom591.0075, 둘째9.27929/518.39929, zoom 약.8000000034. rig quadTop80.5632/11.2104는 별도 read 시점 기하, PNG 동일 drawframe 인수0 |
| 최종a2fa native | 현재a2fa source의 최초 Chrome/context/page 각1, capture fit 1조건 PASS/FAIL0/미도달0/exit0, GL0/pageerror·HTTP failure0/source5 exact. trusted S 직후 delta130.0755였으나 90frame 뒤 보스가 약108 이동하여 capture delta54.5188; 고정 south130 native 인수0. 최종 authored top75.836074/bottom584.956853, rig quadTop73.97527은 capture 시점 관측만. POST /api/mats1 서버 도달 전 차단·user save0·owned browser 닫힘; physical GPU 해제 UNKNOWN |
| 직접 PNG 이력 | 최초 PNG2에서 큰 머리 잘림 개선·본체 식별, 둘째 뿔 상단 가장자리 가까움. label/FX/플레이어 겹침·반복 어두운 baked 지면으로 전체 VISUAL VERDICT: RETOUCH. 첫 PNG intro 검정 bar와 snapshot active=false 시점차 미해결 |
| 최종 직접 PNG 판독 | root가 현재 capture PNG를 직접 확인: full antler/body 식별, 아래 player/green FX 겹침·반복 baked 지면이 남아 RETOUCH. state bar0인데 PNG 검정 bar가 남아 intro draw/state 정렬은 UNKNOWN |
| 미인수 | 고정 south130 native, 완전 alpha/전방향 fit, 첫 보간/zoom 진입, normal route, 모든 resize, anatomical foot, native6/audio/reward/save, 전체 성능 |
| fixture | 기존 bosstest0 playerboost/pillar removal 포함. 정상 진행의 보스 진입 인수0. CPU/native/visual epoch별 별도 계수, clean 합산0 |

외부 증거 디렉터리: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-main-boss-camera-20261007/`. 최초 `camera-cpu-final-receipt.json` 8,969B / `d68d0679bb77ed45769cf87bfe128525fe10e788ef075faefc1b1acf0eafd35c`, 원결과 `camera-cpu-result.json` 31,138B / `0f862be1ba96ec337b9e052e15995a8afd7427ee896eec0da67ea20151a37dd9`, 최초 native `native-result.json` 8,562B / `c92d3982da42549996f0c261bacf1cd1a91911d7f72b17a485ebeddfea36cc50`는 보정 전044b epoch다. 철회된 중간 코드의 `quantization-implementation-receipt.json` 1,689B / `d5683e0a66d7f33cf4ef32b65863c13270e1927d049cd70bd86c418d107c4ae5`에 inverse exact/foreign185 보존이 기록된다. 해당 `camera-quantization-limited-receipt.json`은 1,660B / `88d4179ca7739f7f5aca088ad3dc302175c2b2328ebd9a30f4f700fd0c9b580e`다. 현재 최종 `directional-round-implementation-receipt.json` 2,666B / `d1ff0383c339fc0cb1ef4610ca959a8f941332a4c0e82c4725e555815080197d`의 rs3/inverse exact/foreign185 보존을 따른다. 최초 visual `visual-verdict.json` 4,437B / `c8767f12ab4d3c5ca4ab4e2d22522ad506f04db450ba8326000779e064a96626`와 최종 검수는 epoch를 분리한다. Git 사실은 같은 디렉터리 `remote-preservation-receipt.json`의 실제 normal commit/push/원격 정확 SHA로 확정하고 자기 commit SHA는 순환 삽입하지 않는다. 검수 관측 당시 checkpoint 전이며 deploy0이다.

최종 증거는 `camera-directional-limited-receipt.json` 1,194B / `ca55b57abcb6ca8dac42b1095bc6d0068e654d702788c7f558a7975190356e66`와 원결과 `camera-directional-limited-result.json` 27,932B / `eec9c743a15c2bbaf60aa67f95767676137927cac1a2dfe24a0b75e38f9c8f45`, `native-directional-result.json` 6,106B / `87217d74229d870ca564743d344da9dab690e11533b4e17a7ac30ac0caa2ee18`, `validation-receipt.json` 4,176B / `44b3be782d4c962d6bf2fcfefc3c7f7b4ef36d137e5ebd0ea63a8dc3e048521d`, `visual-verdict-final.json` 5,811B / `acf4a2165bb087d736815370ed1e55cca7485b73fe92f610d1b253d18411af2f`로 각각 보존한다. 최초044b36조건/native2조건·철회2306 FAIL1·현재a2fa CPU14/native1은 clean 전체 PASS로 합산하지 않는다.


## 2026-10-07 CH1 카메라 zoom과 마우스 조준 소비 — ROOT-CH1-CAMERA-MOUSE-AIM-20261007

이전 보스 카메라 Y 프레이밍은 그대로 두고 현재 실제 zoom을 마우스 조준 입력이 소비한다. 보스 크기·zoom 값·Y integerband/directional rounding은 이번 단위에서 수정하지 않는다.

현재 `game.html` working은 4,084,115B / `b3439a539397e73dcc929d565f172a720facdb282b654e741b9f495e8fc6e6f3`, root owned HEAD+변경 blob은 4,083,930B / `ae8244039d7ecc7383fc96076d7ad7bf9e17d7044330d8c0737a333240130073`다. 원래 타인 WIP185B를 보존한다. 이번 단위는 카메라를 바꾸는 대신 입력 좌표가 실제 현재 zoom을 소비하게 한다. camera framing·zoom 보간·시트·애니메이션·전투·AI·충돌·저장 수치는 변경하지 않는다.

전역 `_setMousePosition`의 finite client/rect/raw 위치 guard와 CH1 opt-in의 zoom 역변환은 적용 범위가 다르다. 범위 밖 valid raw/finale 수식은 유지하며, 새 CH1 scope만 current rect+저장 clientXY를 현재 `G._camZoom||1` positive finite 값으로 재투영한다(.3 cap 없음). scoped point 계산 완료 후에만 원자 게시하고 `_set`은 boolean을 반환한다. 일반 mousemove/mousedown의 facing은 true일 때만, 패드 해제 첫 이동은 기존 `_gpClearAll()` 뒤 scoped `_set` 성공 시만 추가 갱신한다. 정확 표/수식은 `docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md`의 같은 unit 절을 따른다.

| 검수 | 현재 상태/경계 |
|---|---|
| 신규 CPU | 현재b343 source의 신규 actual main 함수·실제 input callbacks VM 검수: 최초 Node1/VM24/DOM rect141, 7그룹28복합조건 PASS/FAIL0/미도달0/exit0. 통제 DOM/gamepad 경계이며 실제 GPU/하드웨어 gamepad 인수와 구분 |
| 신규 native | 현재b343 source의 최초 실제 main bosstest0 Chrome/context/page 각1, 3조건 PASS/FAIL0/미도달0/exit0. 동일 trusted mousemove의 effective point/facing 오차0; 같은 이벤트의 legacy 각도 오차는 −.3038275023834693rad. resize1280×720→1600×900에서 새 mousemove0·point 오차0·저장 facing 유지, trusted W 이동 중 저장 facing 유지. source5 exact·GL0·pageerror/HTTP failure0. POST /api/mats1 서버 도달 전 차단·user save0·owned browser 닫힘 |
| visual | root가 실제 PNG1을 직접 판독: Druid antler/body 식별, 아래 작은 player·green FX 겹침과 반복 평면 baked 지면 남음. VISUAL VERDICT: RETOUCH. 그림의 보스 alpha 지점에 실제 공격이 적중한다는 pixel target hit 인수는 아님 |
| 이력 분리 | 이전 AIM read-only 계획의 구현0은 작성 당시 상태다. 현재 구현은 위 source핀과 실제 검수로 판단하며 옛 camera14/native1/105검색·공식원문 보존을 새 성과로 재실행/합산하지 않음 |
| 미인수 | 하드웨어 GP·arena exit 잔여 zoom의 native·normal route·boss lifecycle·shake/round/interpolation/alpha alignment·performance·native6/audio/reward/save. controlled CPU의 GP/arena exit 케이스를 실제 native 인수로 승격하지 않음 |

외부 증거 디렉터리는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-main-camera-aim-20261007/`이다. `implementation-receipt.json` 4,493B / `045a27500ee5504a75440a7d913359badd5a0c72ed885352a8072bd5d9423c86`의 exact replacements/inverse exact/foreign185 보존을 따른다. Git 사실은 같은 디렉터리 `remote-preservation-receipt.json`의 실제 normal commit/push/원격 정확 SHA를 참조하고 자기 commit SHA는 순환 삽입하지 않는다. 검수 epoch checkpoint 전·deploy0이다.

최종 `aim-cpu-receipt.json` 1,124B / `f4a25b7ae304f8c4665d9f7f821ced2f89e23fbdeb8f168ae661cd39056b6c7c`, `native-result.json` 12,782B / `451a9070a4177502675978364ae877263d32ed7f6ba4e33ba98f216fa8dcf901`, `validation-receipt.json` 1,994B / `be8dc72efa2c1b886df9683a6f89ca7a4667ffd8fd9f05f9235c0d825ccf490e`, `visual-verdict.json` 4,764B / `22108e6e5e55733b0a4c83150f6ed31a791d3ce07900c29f85a94d8c740c593a`를 각각 보존한다. CPU28과 native3은 별도 검수이며 clean 전체 조건으로 합산하지 않는다. 0707 공식 raw6와 다음 retry 계획도 별도 원자료로, 이번 AIM 제품 인수에 합산하지 않는다.

기존 카메라 intro 예약식 _bossCine.active?VH*.1:0 자체는 변경하지 않는다. 이번 보충은 active의 맵 소유 소비 경계만 다룬다.

## 2026-10-08 보스 인트로의 맵 소유 소비 경계

작업 ID: `ROOT-BOSS-INTRO-MAP-OWNER-CONSUMER-20261008`. 아래는 현재 소스 계약이며, 기존 인트로·재도전 검수 기록은 해당 시점의 이력으로 보존한다. 본편 공통 `_bossCine` 소비자이며 CH1 또는 특정 URL opt-in으로 제한하지 않는다.

| 항목 | 현재 계약 |
|---|---|
| 초기 상태 | 기존 `_bossCine`에 `ownerMap:null` 추가 |
| 소유 포착 | 기존 `bE && _bossCine.lastBossId!==bE` 인트로 시작 분기에서 `ownerMap=G.map` 포착. 기존 보스 객체/진입 판정 유지 |
| 렌더 소비 | `draw()`의 기존 `if(!X)return;` 바로 뒤에서, active이고 `ownerMap!==G.map`이면 `active=false; _introFill=null;` |
| 지연 경계 | 맵 교체와 동시에 원자적으로 해제하는 계약이 아니다. X가 있는 첫 draw에서 소비하며 X가 없으면 기존 early return으로 이번 해제도 수행하지 않음 |
| 보존 | 같은 map의 active 상태 및 inactive 상태는 이 새 가드에서 변경하지 않음. t/maxT/name/phase/lastBossId 등 나머지 필드는 이 가드에서 초기화하지 않음 |
| 기본 시간 | 첫 인트로 기존 180f, HP fill 기존 90f 유지 |
| 조건부 Druid 재도전 | 기존 해당 분기의 60f 및 `_introFill=1` 유지. 일반 재도전 전체에 60f를 확대하지 않음 |
| 변경 범위 | game.html 3 hunk, +141B. 필드 capture/restore·retry 분기·보스 HP/AI·피해/자원·저장·오디오·기존 UI 문구 변경 없음 |

| 소스/검수 | 정확한 상태 |
|---|---|
| working game.html | 4114460B / `8d5c6db7d5c22dfad37ba5e4df22b814f45211b9fbe5789c2a9dac5d2e01ad97` |
| owned game.html | 4114275B / `c64dc26429d09e5b87c0c702a305ae67e1c298ed80e08add14fd31b0ac7f9319` |
| 바이트 보존 | ROOT implementation receipt의 working/owned inverse exact. game foreign185B는 미채택 |
| CPU | 첫 통제 CPU Node1/new Function factory18/VM0, 8그룹26조건 PASS(동적23·정적3), FAIL/setup/미도달/계측unhandled0·exit0. before 잔류 반례1 및 same-map 한계 probe1은 별도이며 PASS 합산0. 실제 선언/producer·helper2/entry·render·fill·arrow guard 발췌+통제 ports; whole draw/restore handler/DOM/native 실행 아님 |
| native/실화면 | NOT_RUN. 새 브라우저·실제 boss→field 왕복·실제 시각/청취/세이브 인수 없음 |
| 시각 판정 | 이번 UI NOT_ASSESSED / 전체 VISUAL RETOUCH. 소스 정적 계약을 화면 PASS로 세지 않음 |
| Git | ROOT 최종 completion/보존 영수증으로 확정. 이 초안은 commit/push 성공을 선기록하지 않음 |

외부 근거: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-boss-intro-map-owner-20261008/implementation-receipt.json`, `docs-search.json`, `docs-disposition.json`, `docs-sync-plan.json`. CPU 수치는 이번 validation-receipt.json 및 cpu-execution-receipt.json의 실제 결과를 사용했다. 옛 suite·route·native 결과와 합산하지 않는다.

한계: update/HUD가 이 draw보다 먼저 소비하는 경계는 원자적으로 막지 않는다. 같은 map의 in-place 변경·관측 사이 A→B→A는 미식별이며, ownerMap은 종료 뒤 다음 producer까지 해당 map 참조를 유지한다. 기존 bossBar 2000ms timeout 수명은 별도다.

### MAP PRODUCTION REPORT — 이번 consumer 단위

| 항목 | 결과 |
|---|---|
| STAGE | global main boss intro map-owner consumer; CH1 field-return compatibility |
| MASTER silhouette | unchanged / not assessed |
| MASTER regions | unchanged |
| MASTER main route | NOT_RUN |
| MASTER side spaces | not assessed |
| OUTER MASS LEFT | unchanged / not assessed |
| OUTER MASS RIGHT | unchanged / not assessed |
| OUTER MASS TOP | unchanged / not assessed |
| OUTER MASS SOUTH | unchanged / not assessed |
| OUTER MASS major holes | terrain/cliff materials/map blur/physical relief/common foot contact remain open |
| LARGE source assets | unchanged |
| LARGE composites | unchanged |
| LARGE overlap | not assessed |
| LARGE repeated silhouette | not assessed |
| MEDIUM connections | unchanged |
| MEDIUM remaining holes | not assessed |
| GROUND shadow | unchanged |
| GROUND contamination | unchanged |
| GROUND structure integration | not assessed |
| PLAYABLE main arenas | unchanged |
| PLAYABLE travel space | unchanged |
| PLAYABLE breathing space | not assessed |
| PLAYABLE threat space | not assessed |
| PLAYABLE combat readability | new map first valid draw closes old intro/fill in controlled slices; real pixels NOT_ASSESSED |
| LANDMARK primary | unchanged |
| LANDMARK secondary | unchanged |
| LANDMARK tertiary | unchanged |
| CAMERA QA | {"START": "NOT_RUN", "EARLY": "NOT_RUN", "ARENA": "NOT_RUN", "SIDE L": "NOT_RUN", "SIDE R": "NOT_RUN", "LANDMARK": "NOT_RUN", "LATE": "NOT_RUN", "EXIT": "NOT_RUN"} |
| TECH QA route | NOT_RUN |
| TECH QA collision | NOT_RUN |
| TECH QA page error | NOT_RUN |
| TECH QA 404 | NOT_RUN |
| TECH QA seam | NOT_RUN |
| TECH QA loading | NOT_RUN |
| TECH QA performance | NOT_RUN |
| TECH QA controlled CPU | 첫 통제 CPU Node1/new Function factory18/VM0, 8그룹26조건 PASS(동적23·정적3), FAIL/setup/미도달/계측unhandled0·exit0. before 잔류 반례1 및 same-map 한계 probe1은 별도이며 PASS 합산0. 실제 선언/producer·helper2/entry·render·fill·arrow guard 발췌+통제 ports; whole draw/restore handler/DOM/native 실행 아님 |
| FILES stage-owned | ["game.html: _bossCine declaration / sole intro producer / draw entry (3 hunks, +141B)"] |
| FILES concurrent touched | none; foreign game185B/settings3.3 2948B unadopted |
| FILES unrelated touched | none |
| GIT staged | PENDING; final completion receipt supersedes |
| GIT commit | PENDING; final completion receipt supersedes |
| GIT push | PENDING; final completion receipt supersedes |
| GIT deploy | NOT_RUN |
| VISUAL VERDICT | RETOUCH |
| UI | UI_NOT_ASSESSED |
| NATIVE | NOT_RUN |
| AUDIO | NOT_LISTENED |
| NEXT PASS | normal CH1 boss unlock/death/revive/retry real route and pixel acceptance; update-before-draw/hidden/no-X timing, same map reuse and existing DOM timeout remain outside this unit; audio/reward durable save not accepted |

기존 2026-10-03 source9 절의 55f·양판 적용 및 검수는 당시 epoch다. 이번 본편 2hunk와 easy판/구 검수는 분리한다.

## 2026-10-08 bossSummonWind 실제 소환수 반경 위치 소비

작업 ID: `ROOT-DRUID-SUMMON-SAFE-POSITION-CONSUMER-20261008`. 본편 `game.html` 공통 소환 상태의 현재 계약이다. CH1 또는 URL opt-in 한정 기능으로 해석하지 않으며, easy판·다른 스폰 소비자 수정/검수를 뜻하지 않는다. 원 source9 및 기존 검수 원문은 해당 epoch의 이력으로 보존하고 아래 현재 계약을 우선한다.

| id / 적용 위치 | 현재 계약 | 보존·미인수 경계 |
|---|---|---|
| `bossSummonWind` 위치 보정 | mkEn이 반환한 실제 소환수 `ne.r`로 안전 위치를 검증하고 성공한 결과만 `ne.x/ne.y`에 반영 | 보스 자신의 반경으로 소환수 footprint를 대신하지 않음 |
| 검색 null | 좌표를 새로 대입하지 않고 mkEn 반환 좌표 보존 | 보스 좌표로 강제 fallback 없음. null에서도 안전 배치가 보장된다는 뜻은 아님 |
| FX | 기존 `ens.push` 뒤 최종 `ne.x/ne.y`를 사용 | 기존 삽입/효과 순서 유지 |
| 수량·전투 | 기존 `3+trunc(stage×.5)`, HP 절반·shield0 유지 | RNG/생성 인자·전투식·저장 변경0 |
| 예외·회복 | 기존 `finally`의 recover70f 유지 | mkEn null의 기존 `ne.hp` 예외와 부분 삽입 prefix·원 예외 전파를 새 rollback/retry로 변경하지 않음 |
| 전조 시간 | 기존 `tele || 55` fallback, 소환 metadata `tele=45` 구분 | 기존 문서의 고정55f는 이전 표현이며 모든 실제 소환 전조가55f라는 뜻으로 사용하지 않음. 타이머 수치 변경0 |
| 맵 권한 | 기존 map/isW/canMv/safePt/nav 소비 유지 | geometry·stageLOCK·scene·원PNG·collision/route 설계 변경0 |

| 근거 | 상태 |
|---|---|
| working game.html | 4114570B / `2639d248b63b748a2bdc2f33dbabe6c22afe353a599e7bdba80d9a1db589a050` |
| owned game.html | 4114385B / `9466d5bccc5b3799f71adee0af0f6f6240cacaf0ac88043f621b299797c6d19e` |
| 변경 | 2hunk/+110B. ROOT implementation receipt의 working/owned inverse exact; foreign185B 미채택 |
| CPU | 첫 Node는 하네스 G04의 닫는 괄호 누락으로 module parse 실패/제품 조건0·20미도달. 해당1문자만 새 파일에 보정한 최초 제품 suite1은 Node1/newFunction2/fixture32/VM0, 6그룹20PASS(동적18·정적2), FAIL/setup/미도달0·exit0. before 벽겹침 반례1은 별도이며21clean으로 합산하지 않음. 물리Node총2. 실mkEn/전체update/실맵/native/음향/save 검수 아님. |
| native/시각 | whole-map native NOT_RUN/미인수. 실제 보스 자연 도달·벽 인접 소환 화면·전체 route·GPU·청취·저장 인수 없음 |
| 판정 | 최소 본편 구현·통제 CPU 한정 검수 완료이며 이번 화면 NOT_ASSESSED / 전체 VISUAL RETOUCH. 옛 source9 검사와 합산하지 않음 |
| Git | ROOT 최종 completion 및 remote-preservation 영수증에서 소유 code/docs 정상 보존 여부를 확인한다 |

외부 근거: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-druid-summon-safe-position-20261008/implementation-receipt.json`, `docs-search.json`, `docs-disposition.json`, `docs-sync-plan.json`. CPU 수치는 ROOT의 cpu-corrected-execution-receipt.json 기준이며 native/시각·청취·durable save로 승격하지 않는다.


## MAP PRODUCTION REPORT — ROOT-DRUID-SUMMON-SAFE-POSITION-CONSUMER-20261008

공통 가이드 전체와 현행 SSOT/LOCK을 적용했다. MASTER/OUTER/MEDIUM/GROUND 배치는 보존하고 이번 단계는 PLAYABLE의 소환 위치 소비와 한정 TECH QA다. 완성화면을 새로 평가하지 않았다.

| 구분 | 항목 | 결과 |
|---|---|---|
| STAGE | - | Global main bossSummonWind, including CH1-1 Druid si0. Fixed stage geometry/LOCK unchanged. |
| MASTER | silhouette | Unchanged; no visual reassessment |
| MASTER | regions | Unchanged |
| MASTER | mainRoute | Existing south START to north EXIT preserved |
| MASTER | sideSpaces | Unchanged |
| OUTER_MASS | LEFT | No change / not assessed |
| OUTER_MASS | RIGHT | No change / not assessed |
| OUTER_MASS | TOP | No change / not assessed |
| OUTER_MASS | SOUTH | No change / not assessed |
| OUTER_MASS | majorHoles | No change; unresolved visual holes remain |
| LARGE | sourceAssets | No new assets |
| LARGE | composites | No change |
| LARGE | overlap | Not assessed |
| LARGE | repeatedSilhouette | Not assessed |
| MEDIUM | connections | Unchanged |
| MEDIUM | remainingHoles | Not assessed |
| GROUND | shadow | Unchanged |
| GROUND | contamination | Unchanged |
| GROUND | structureIntegration | Unchanged |
| PLAYABLE | mainArenas | Unchanged |
| PLAYABLE | travelSpace | Unchanged |
| PLAYABLE | breathingSpace | Unchanged |
| PLAYABLE | threatSpace | Count/RNG/combat stats unchanged; successful actual-radius safe point consumed |
| PLAYABLE | combatReadability | Final spawn FX uses actual child position; new native pixels not assessed |
| LANDMARK | primary | Unchanged |
| LANDMARK | secondary | Unchanged |
| LANDMARK | tertiary | Unchanged |
| CAMERA_QA | START | NOT_RUN |
| CAMERA_QA | EARLY | NOT_RUN |
| CAMERA_QA | ARENA | NOT_RUN |
| CAMERA_QA | SIDE_L | NOT_RUN |
| CAMERA_QA | SIDE_R | NOT_RUN |
| CAMERA_QA | LANDMARK | NOT_RUN |
| CAMERA_QA | LATE | NOT_RUN |
| CAMERA_QA | EXIT | NOT_RUN |
| TECH_QA | route | Not run |
| TECH_QA | collision | Actual summon case + isW/canMv/safePt controlled fixture: 6 groups20 PASS (18dynamic2static); controlled mkEn, not authored map. |
| TECH_QA | pageerror | Not observed; no new browser |
| TECH_QA | HTTP404 | Not observed; no new browser |
| TECH_QA | seam | Not assessed |
| TECH_QA | loading | Not assessed |
| TECH_QA | performance | Not measured |
| FILES | stageOwned | game.html owned two hunks and five current docs |
| FILES | concurrentTouched | Foreign game185B and settings3.3 foreign2948B preserved/unadopted |
| FILES | unrelatedTouched | No new unrelated changes; whole foreign files not rehashed |
| GIT | staged | Only owned blobs |
| GIT | commit | PENDING |
| GIT | push | PENDING |
| GIT | deploy | NOT_RUN |
| VISUAL_VERDICT | - | RETOUCH |
| NEXT_PASS | - | Accept actual wall-adjacent summon and normal CH1 boss/death/revive/retry on an admitted runtime; no reuse of old suites or forced route. Current null search may retain blocked position. |

**VISUAL VERDICT: RETOUCH** — 새 native 화면/UI는 NOT_ASSESSED. CPU PASS가 시각 PASS를 대신하지 않는다. 최종 소유 commit/push SHA는 외부 completion의 같은 MAP PRODUCTION REPORT에 확정한다.


### 2026-10-08 — CH1 NORMAL rig의 HP·레벨 배치

| id / 소비 위치 | 현재 계약 |
|---|---|
| `_nameTopOff` / NORMAL Druid 성공한 본체1회 blit(20261009) | 실제 main 부모 scale/Y offset과 내부 inverse scale·anchorLocalY·frame.top을 합성하여 padded rig 상단에서10 world 단위 위에 배치. 마지막 current 검사 뒤에만 기록 |
| 폴백/내용 | 특수/로딩/실패·부모 인자 없는 preview는 기존 앵커. HP바·레벨 내용/HP·AI·모션 타이밍/전투/save 변경 없음 |
| 검수 | 첫 후보69확인은 부모 없는 fixture였고 정적 blocker1로 보정. 새 부모 포함 통제10그룹78확인 PASS/Node1(총Node2), 최종 source blocker0. 실제 화면/GPU/청취/save 미검수, RETOUCH/UI_NOT_ASSESSED |

정확 수식·caller·예외는 [방향별 리깅 정본](../4.0케릭터스프라이트%20디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md#ch1-druid-rig-name-anchor-20261008)을 따른다.

## 2026-10-08 — 드루이드 입체 본체 현행

`ROOT-CH1-DRUID-VOLUMETRIC-BOSS-20261008`: 기존 CH1 2.5D opt-in의 NORMAL idle/walk/attack은 새 solid 관절 드루이드가 소비된다. 평면·셀/밝기 보정 설명은 당시 이력으로 보존한다. 128solid+9shadow/25관절, 조명5, 양손 two-bone IK·골반/다리 stance, 실제 준비 countdown·Slam8f/Sweep14f·recover20f의 표시 연결, 본체 source-over1회. 특수·피격·사망은 기존 시트; 전체 보스 입체/실전·청취/save 완료 아님. 사용자 첫 모션 거절 뒤 양손·전신 연결을 재구현해 새7그룹/80자세와 실제 WebGL 미리보기로 한정검수. 이전 검수 이력과 합산0, 외형·타격 무게감/사용자 승인 미인수. VISUAL VERDICT: RETOUCH. 수치·API·검수·제한의 현행 정본: [입체 드루이드](../4.0케릭터스프라이트%20디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md). 기존 원본/전투/save 불변.

### 2026-10-08 — 입체 드루이드 외형 후속

위 `fd12d389` 입체 본체의 부품/geometry 수치는 당시 이력이다. 현재는 어깨 구형 덩어리를 겹치는 목질 뿌리로, 흉곽을 닫힌 비틀린 core로 교체: solid134+shadow9/geometry121·20,275정점·37,522삼각형. 관절25/material20/light5·양손 IK/준비·공격·회복 코드 불변. IAB15 정면·측면 외형 관측, 기존 suite 재실행0. RETOUCH/사용자 승인·본편 완주·성능·청취/save 미인수. [현행 수치·제한](../4.0케릭터스프라이트%20디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md).

### 2026-10-08 — 거절 모델 본편 제외 / 원본 유지

사용자가 원본과 다른 solid 모델 자체를 거절했다. 위 입체 본체/외형 후속은 보존된 미채택 이력·품질 FAIL_USER_REJECTED이며 A급/완성 진척으로 세지 않는다. 실제 adapter의 bossVolume 인수를 제거해 기본 false/원본 borrowedSheet 표시로 복구, game 두 import는 druid-original-20261008-v5. 원 PNG·전투·save 불변, 기존 사용자 main 무조작·실화면 자동복구 주장0. MD의 A급 이상·기존 AAA 목표는 원본 합치와 본편 실검수로 판단한다. [현재 계약](../4.0케릭터스프라이트%20디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md).

### 2026-10-08 — 본편 드루이드 원본 자세 보존

2026-10-08 원본 복구 v5 뒤 당시 game adapter 두 import와 factory import는 `druid-authored-pose-20261008-v6`였다. 2026-10-09 소환 표시 당시 game adapter 두 import는 `druid-summon-display-20261009-v7`, factory는 v6였다. 자체 엔진 모션 연결 당시 game adapter v8/factory v7이었다. 현행 본편은 game adapter `locomotion-phase-20261009-v10`/factory `locomotion-phase-20261009-v9`이며 borrowedSheet에만 alphaTest=1/255·transparent=true·depthWrite=false를 적용한다. 아래 모션 계약과 DIRECTIONAL의 `druid-original-alpha-20261009` 현행 재질 계약을 함께 따른다. borrowedSheet Druid의 pose()는 rest 복구 후 범용 흔들림·공격 변형을 생략한다. 그려진 셀/방향·프레임시간·전투/save는 보존. sheet 없는 기존 경로는 유지한다. 최초 준비 URL 오류(제품未도달)와 보정 뒤6그룹 CPU PASS는 별도 이력이며 본편 화면/GPU·입체 모델·A급 인수는 미완료다. [정본 계약](../4.0케릭터스프라이트%20디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md).


2026-10-09 normal 드루이드의 본체1회·밝기1.35/대비 제거·특수3회 유지 및 한정 native 검수의 정확 계약: [원본 명암 consumer](../4.0케릭터스프라이트%20디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md#druid-original-tone-20261009). 기존 검수 수치는 당시 epoch로 보존하며 본편/A급 완료로 세지 않는다.

## 2026-10-09 — 자체 엔진의 리그 모션 재생 연결

`ROOT-ENGINE-RIG-MOTION-CONSUMER-20261009`: 편집기와 실제 character-rigs/CH1 body adapter가 공통 clip을 소비한다. 명시 `authoredMotion={clip,authoredHeight,time}`만 적용하고 position은 rigHeight/authoredHeight로 환산한다. borrowed 그림은 전체 object position만 허용하며 Bone/회전/scale 덧변형은 거절한다. 기존 모션은 base pose 전에 복원하고 새 모션은 행렬·publication 전에 적용한다. 본편 producer의 자동 clip 선택은 아직 없으며 대표 공격·새 입체 모델·A급은 미완료다. 평면 Druid를 volumetric으로 잘못 보고하던 adapter/QA 값을 실제 artwork-skinned-plane으로 정정해 main의 기존 비율 보정 분기가 다시 선택된다. 실제 사용자 게임의 개선 픽셀은 미검수다.

새 CPU: 첫 Node에서6그룹 PASS 뒤 adapter pixel oracle(49.99999955372161 vs50, 허용오차1e−9) FAIL1/후속2그룹 미도달. Float32 display 기준1e−4로 oracle만 정정한 별도 adapter3그룹 PASS/Node1, 물리 Node총2·9clean 합산0. own IAB15 새 runtime seek/empty clip base 복원/기존 edited JSON 복구·재생3그룹 확인. arm-left 기본자세를0으로 가정한 UI assertion FAIL1은 실제 cos(0)×.012×.7=.0084 기준으로 정정/제품수정0. 기존 완료검사 재실행0, 사용자 main/save 무조작. **VISUAL VERDICT: RETOUCH**, 실전보스/native/audio/실save 인수0. 외부 `engine-rig-motion-consumer-20261009/completion.json`이 최종 보존 정본이다.


## 2026-10-09 — 자체 엔진 sprite clip의 확산탄 연결

`ROOT-DRUID-FAN-SPRITE-ENGINE-CONSUMER-20261009`: 실제 fan 준비의 성공한 본체 표시 후, 기존 발사 prefix 완료를 소비해 원본 attack 셀1→2→3을 선택한다. 기존 recover45/보스 cap20을 유지하며 st2>6은 시전2(초기45 포함),0<st2<=6은 복귀3(정확 선택은 clip sample 수식). 새 pattern/update 진입 prune과 G/map/ens/life/phase 소유검사, module 미로드 기존폴백. 전투 시간·피해·탄·RNG·원PNG/save 변경0. transform clip 자동선택/새 입체 모델은 미구현이다. 최초 새 CPU7그룹 PASS/Node1·before1별도, native 원본3자세와 clock 진행은 통제fixture 한정. 사용자 main 무조작·실전/청취/save/A급 미완료, **VISUAL VERDICT: RETOUCH**. [정확 계약](../4.0케릭터스프라이트%20디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md#druid-fan-sprite-engine-20261009). 최종 소유 Git·증거는 `E/druid-fan-sprite-engine-consumer-20261009/completion.json`.


## 2026-10-09 — 드루이드 보행·공격 원본 비율 보정

`ROOT-DRUID-ORIGINAL-ASPECT-CONSUMER-20261009`: actual main normal walk/attack의 폭만 dh×cw/ch로 원본 셀 비율을 소비한다. 높이14.1r·spec9.3·base8/특수·원PNG·전투/save 유지. 실제 whole draw/native Canvas+원본PNG 최초4그룹PASS(Node0), 대기·야수 픽셀 불변/임시 UI 제거 뒤 editor 편집 exact 보존. 실제 rig GPU/정상 본편 보스전·새입체 모델·A급은 미인수, **VISUAL VERDICT: RETOUCH**. [정확 계약](../4.0케릭터스프라이트%20디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md#druid-original-aspect-20261009). 최종 증거 `E/druid-original-aspect-consumer-20261009/completion.json`.


## 2026-10-09 — 드루이드 광역 발사 자세

`ROOT-DRUID-BURST-SPRITE-ENGINE-CONSUMER-20261009`: actual main `burst`의 준비 본체 성공과 실제 발사 prefix 완료를 소비해 원본 attack 셀1→2→3을 표시한다. 기존 sprite clip·recover50/보스 cap20·전투/원PNG/save 유지. 다음 pattern/update prune과 rig sheet/index 현재성 연결, 미로드·미관측은 기존 폴백. native detached Canvas3PASS/이전 반복 반례1별도, editor17 편집 exact·사용자 main 무조작. 새 입체 모델·정상 보스전·A급 미인수, **VISUAL VERDICT: RETOUCH**. [정확 계약](../4.0케릭터스프라이트%20디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md#druid-burst-sprite-engine-20261009). 최종 증거 `E/druid-burst-sprite-engine-consumer-20261009/completion.json`.


## 2026-10-09 — 실제 3D 보스 일반 일시정지 시간

`ROOT-BOSS3D-PAUSE-CLOCK-CONSUMER-20261009`. `game.html::_b3animate`는 일반 `G.paused` 동안 실제 3D 보스의 AnimationMixer와 dt 기반 피격 flash 시간을 멈춘다. `_b3clock.getDelta()`는 ready/pivot 가드를 통과한 콜백마다 기존 위치에서 소비하여 재개 때 정지 시간이 누적되지 않게 한다.

| 항목 | 현행 계약 |
|---|---|
| 코드 | `const _b3elapsed=_b3clock.getDelta(); const dt=typeof G!=='undefined'&&G.paused?0:_b3elapsed; if(_b3mixer)_b3mixer.update(dt);` |
| 적용 | 일반 설정·인벤토리 등 `G.paused`의 truthy 값. mixer pose와 `_b3flashT-=dt`만 dt0. 렌더·상태선택·기존 visibility 가드 유지 |
| 유지·미해결 | `_btFramePause/STEP`, `_btFrozen` AI 정지, `performance.now()` 기반 스턴 흔들림은 이 수정에서 변경하지 않음. 전체 시각 효과 동결·전투 상태와 clip 진행률 일치는 보장하지 않음 |
| 실제 검증 | 최초 신규 Node1, 실제 whole `_b3animate` 전후 source factory2/fixture16 및 로컬 Three.js AnimationMixer·NumberKeyframeTrack. 8그룹38조건 PASS/exit0. 기존 코드가 pause 중 전진한 before witness1은 별도. 30초 정지 clock 소비 후 재개 delta0.02초 확인 |
| 인수 범위 | 통제 CPU 실행. 새 GLB 로드/GPU/실제 본편 화면·정상줌·청취·성능·save 검증 없음. Druid `use2D` 경로의 새 모델·모션 제작이 아님. VISUAL VERDICT: UI_NOT_ASSESSED/RETOUCH |

외부 증거: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/boss3d-pause-clock-consumer-20261009/`의 `preflight.json`, `cpu-first-result.json`, `completion.json`. 최종 Git 상태는 completion 기록을 따른다.


## 2026-10-09 — 독립 ORB24 공통 엔진 연결

`ROOT-ENGINE-DRUID-ORB24-20261009`: 실제 `G._druidOrbs`만 새6×4/24셀/640px, fps300/7·loop .56초로 표시한다. `o.t/60`과 기존R=r×2.4·접촉/피해/반사불가를 유지하며 원본4×2/8셀·벽시간70ms는 실패 폴백이다. [현재 원화·리소스·시간·검수 계약](../5.1임펙트디자인/DRUID_ORB24_ENGINE_20261009.md). 기존 장판24·blackBean Q전용·SFX/save 불변. 마지막→첫 연결/실보스전·GPU·정상줌·청취/save/A급은 RETOUCH/미인수.
