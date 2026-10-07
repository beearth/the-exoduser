# [REGION] 4분면 지역 클리어 가이드 + 지역 기반 보스게이트 개방 (2026-09-30)

> **SSOT.** 큰 오픈맵(200×200)에서 "남은 몹이 어디 있는지 모른다"는 문제를 해결하는 시스템.
> 유저 확정 스코프: (a) 4지역 분할 + 입장 배너, (b) 미니맵 마커, (c) 화면 가장자리 방향 화살표,
> (d) 기존 "지역 처치 X/Y" HUD = 현재 지역 진행도, (e) **보스게이트 개방 = 4지역 전부 클리어** (구 전역 80% 규칙 대체).
> 적용 파일: `game.html` + `game-easy-test.html` (동일 반영). 테스트: `test/regionClearGate.test.js` 7건.

## 1. 지역 분할

| 항목 | 값 |
|---|---|
| 분할 기준 | 타일 중점 `midX=G.mw/2`, `midY=G.mh/2` — 4분면 |
| 지역 idx | 0=북서(NW), 1=북동(NE), 2=남서(SW), 3=남동(SE). `idx=(ty<midY?0:2)+(tx<midX?0:1)` |
| 적용 맵 | **한 변 180타일 이상 오픈필드 전부**(`G.mw>=180&&G.mh>=180`, `_isOpenField` 관례 — CH1-1 fixed tileRLE 오픈필드·gauntlet 포함). **소형 맵(한 변 180타일 미만 — 던전·소환굴·보스아레나) 제외**(`G._regions=null`, 구 규칙 폴백). 보스 아레나(128×108)는 크기 조건으로 자동 제외. 타임어택은 클리어 시 기록 로직으로 [REGION] 무관 — 기존 90% 규칙 유지 |
| 초기화 | `_regionInit(si)` — `initStage` 내 소환굴 확정(플레이어 근접 소환굴 splice + `_MAP_QA_MODE` 클리어) **이후** 호출. 재도전(retry)도 initStage 경유라 자동 리셋. 세이브는 스테이지 중간상태를 저장하지 않으므로(로드=스테이지 재시작) 별도 직렬화 없음 |
| 상태 | `G._regions[4]` = `{id, nameKo, nameEn, x0,y0,x1,y1(타일), total, kills, cleared(래치), fbIdx}` + `G._regMidX/_regMidY/_regCurIdx/_regBannerCd/_regGateIdx` |

### 지역명
| idx | 일반 스테이지 | CH1-1 (si0, 앵글러 속성 테마) | 근거 |
|---|---|---|---|
| 0 NW | 북서 / Northwest | 북서 · 어둠 / Northwest · Dark | `_FB_SITES` NW(52,42)=암(EL.D) |
| 1 NE | 북동 / Northeast | 북동 · 번개 / Northeast · Lightning | NE(148,42)=뇌(EL.L) |
| 2 SW | 남서 / Southwest | 남서 · 물 / Southwest · Water | SW(58,158)=물(EL.I) |
| 3 SE | 남동 / Southeast | 남동 · 불 / Southeast · Fire | SE(148,150)=화(EL.F) |

> CH1 맵 docs(CH1_1_BLOCKOUT_MASTER 등)에 4분면 고유 지명이 없어(방위 서술만 존재) 유저 예시안(방위+속성)을 그대로 채택. `_REG_FB_TO_REG=[2,3,0,1]` (fb 배열 인덱스→지역 idx).

## 2. 처치 귀속 / 지역 total

| 항목 | 규칙 | 이유 |
|---|---|---|
| 지역 total | 해당 분면 소환굴의 `_spawnHoleCount(size,si)` 합 | `G._totalSpawned`과 동일 산정 기준. 방/복도 스폰·소환몹은 구 규칙에서도 total 미포함 → 동일하게 미포함 |
| 지역 kills | `_regKill(e)` — **스폰 위치** `e._homeX/_homeY`(mkEn이 기록, 불변) 기준 귀속. 사망 위치 아님 | 몹이 지역 경계를 넘어 쫓아와도 원래 지역에 크레딧 |
| 카운트 대상 | `G._stageKills`를 올리는 **모든** 킬 사이트 8곳(메인 사망/균열/부패/소멸/환영/구조실패/ENS-CAP 컬링 2곳)에 `_regKill` 후크. 보스(`ib`) 제외 | 구 전역 규칙이 방/복도/소환몹 킬도 `_stageKills`로 세던 것과 동일한 관대함 유지 → 체감 난이도 등가 |
| kills>total 가능 | 가능(방 스폰 킬 등). HUD는 total로 캡 표기, 클리어 판정은 그대로 넘침 허용 | 구 규칙도 비율>1 가능했음 |
| 아레나 전환 잔존몹 일괄 킬(`_survCnt`) | `_regKill` 미적용 | 게이트 개방 후에만 발생 — 지역 판정 무의미 |

## 3. 지역 클리어 / 게이트 개방

| 항목 | 값 |
|---|---|
| 클리어 조건 | `_regionRatio(r,i) >= 0.8 - 1e-9` AND `!_regionFbAlive(r)`. 래치(해제 없음) |
| `_regionRatio` | `total>0 ? kills/total + 보너스 : 1`. 보너스 = `G._gateGuardKilled && i===G._regGateIdx ? 0.10 : 0` |
| **문지기 보너스 결정** | 구 규칙의 전역 +10%를 **문지기 스폰 지역 1곳의 +10%**로 매핑(`G._regGateIdx`=문지기 좌표, 없으면 보스방/게이트 좌표). 전역 총량 10% ≈ 한 지역 총량의 10%×4지역 중 1 — 게이트 앞 지역(대개 소환굴 밀집)의 부담을 낮춰 체감 난이도를 구 규칙과 대략 등가로 유지 |
| 앵글러 요구 | si0 한정, `fbIdx>=0` 지역: 담당 앵글러 생존 시 클리어 불가. 미스폰(`!G._fbSpawned`)=생존 취급, `G._fbDone`=전부 사망 취급 |
| 빈 지역 | total 0 + 앵글러 없음 → `_regionInit`에서 **조용히**(배너 없음) 클리어 — 소프트락 0 |
| 부동소수 보정 | `0.7+0.1<0.8` JS 오차 → 임계 비교에 `-1e-9` |
| **게이트 개방** | `G._regions` 존재 시 `_krakenOk && _regionClearedCount()>=4` → `G._bossUnlocked=true`. `_krakenOk`(si0 `_fbDone`)는 이중 안전망으로 유지(지역 조건이 이미 포함하므로 논리상 잉여) |
| 폴백(구 규칙) | `G._regions==null`(소형 맵): `_totalSpawned<=0` 즉시 개방, 아니면 `_stageKills/_totalSpawned + 문지기 0.10 >= 0.8` |
| 개방 연출 | 기존 유지: `🔥 지옥문이 열렸습니다` + `SFX.victory` + `boss_gate_open` 펫 대사 + 포탈 빨강→파랑 |
| 클리어(정화) 연출 | **[2026-09-30 3차 디자인]** N<4일 때만: 전용 `#regionBanner`(purge 모드) — KR `{지역명} — 정화`(--font-hell-title 금-뼈색) / EN `REGION PURGED · N / 4`(Cinzel caps) + 금 젬 + 지옥불 플레어(`regionFlare` 1.4s) + `SFX.magic(1)` + `region_clear` 고양이 대사 + `_mmDirty=1`. **4/4은 기존 지옥문 개방 연출에 인계(배너 생략)**. 구 showPH 초록 토스트/addTxt 제거 |

## 4. 지역 입장 배너

- `_regionTick()` — update 루프에서 매 프레임 호출, 내부 15프레임 스로틀. `G._bossArena`/`_bossLoadPhase>0` 중 정지.
- 히스테리시스: 플레이어가 중앙 십자 경계선에서 **1.5타일 이상** 들어와야 지역 전환 인정(경계 왕복 스팸 방지) + 배너 쿨다운 **300프레임(5초)**.
- **[2026-09-30 3차 디자인] 전용 `#regionBanner` 요소** (#areaTitle 계열, top 28% — areaTitle(18%)·펫 대사·구슬과 비충돌): KR 지역명(--font-hell-title, ls .16em, 뼈색 rgba(223,214,194,.92)) 양옆 속성색(채도 완화 `_raDesat(ELC)`) 다이아 젬 + 금 헤어라인(::before/::after, **4차: areaTitle 비례와 동일 left/right 0·width 21%**) / EN 지역명 대문자(Cinzel, ls .32em) / 상태줄 `처치 k / t (· 앵글러 생존)`(--font-hell, **4차: 13~15px rgba(219,208,190,.92) — 지역명에 종속되되 1x 판독 보장**), 정화된 지역 재진입 시 `정화`. blur-in/out `regionBanner` 2.7s(areaTitle과 동일 타이밍 언어). 이모지·원색 없음. 구 showPH 토스트 제거.
- `G._regCurIdx`는 HUD '지역 처치' 카운터의 현재 지역 인덱스로도 사용.

## 5. HUD (3.1 ui hud 문서에도 동기화)

| 요소 | 변경 |
|---|---|
| `#killCnt` (지역 처치 X / Y) | **현재 지역** `min(kills,total) / total`. 지역 없는 맵은 기존 `_stageKills / _totalSpawned` 폴백 |
| `#stageProgressFill` | **지역 클리어 N/4 비율** (0/25/50/75/100%). 게이트 조건이 지역 단위가 되었으므로 킬 비율보다 클리어 진행이 더 정확 — 문서화된 선택. 지역 없는 맵은 기존 킬 비율 폴백 |
| 봉인 메시지 | `지옥문이 봉인됨 — 지역 클리어 N/4` (45프레임 주기, 기존과 동일) |
| 포탈 라벨 | `▼ 지옥문 봉인 (지역 N/4) ▼` / 개방 시 `▼ 보스방 ▼` (기존) |

## 6. 미니맵 (drawMM)

| 레이어 | 내용 | 비용 |
|---|---|---|
| 정적(캐시 `_mmTickBuild` 완료 블록) | 4분면 경계 십자선 `rgba(255,255,255,.14)` 1px — **`source-atop`으로 바닥 픽셀 위에만**(오프맵 회색 영역 침범 없음, 2026-09-30 2차 폴리시). 완료 시 `_mmRegOvlKey=''`로 틴트 오버레이 무효화 | 캐시 빌드 시 1회 |
| 동적(오버레이 캐시) | 클리어 지역 틴트 `#1e3c1e` @ alpha .45 — **바닥 타일 한정**(`_mmRegOvlEnsure`: `_mmCache` 알파에 clip+`source-in`, 벽/오프맵 회색 영역 제외). **클리어 셋 변경 시에만 리빌드**(스테이지당 최대 4회 + 캐시 리빌드 시), 프레임당은 drawImage 1회 | 리빌드 ≤4회/스테이지 |
| 동적 | si0 앵글러: 생존 개체만 속성색(ELC) 원 **r3(최소 보장) + 검정 외곽 1px**. 사망=제거. 미스폰 시 `_FB_SITES` 사이트 좌표 표기 | 최대 4 arc |
| 동적 | 지옥문 자물쇠: **벡터 드로잉 `_mmDrawLock`**(이모지 제거 — 폰트 무관 색 일관). 봉인=빨강(#ff4444) 닫힌 고리 / 개방=파랑(#44aaff) 젖힌 고리, 몸통 7×6px+고리, 검정 외곽. `(G._bossCx+.5, G._gateY+.5)` 타일 좌표 | 패스 3회 |

캐시는 리빌드하지 않음(지역 클리어/개방 시 `_mmDirty=1`은 20프레임 스킵 즉시 해제용). 핫패스 규칙(12퍼포먼스) 준수: per-frame 할당 0.

## 7. 방향 화살표 (`_drawRegionArrow`) — 2026-09-30 가독성 폴리시 반영

- draw() 말미(미니맵 직전), 화면공간(`X.setTransform(_ssaa,...)` — 논리px=CSS px, DPR은 _ssaa 백킹으로 대응).
- **형태 [2026-09-30 3차 디자인]**: 고딕 창날(spearhead — **4차: 20% 확대, 선단 32px** + 미늘 2쌍 + 꼬리 홈, `_raPath`), 흑철 외곽(2px rgba(16,11,9,.92)) + 오프셋 드롭섀도 + 내부 엠버 코어(작은 창날 rgba(244,229,198,.92), 타겟색 `shadowBlur 9` 글로우 코어 한정). 절제 펄스 `0.72+0.16sin(0.09f)`.
- **라벨**: 이름 = **명조 700 14px 뼈색 rgba(228,214,185,.96)**, 거리 = **Cinzel 600 12px `{n}m`** 이름 바로 아래 +16px 금-은은 rgba(201,184,145,.92). 그림자 = **fillText 8방향 오프셋**(GPU 프록시에서 `strokeText`는 GL층 위 텍스트 캔버스에 그려져 글씨를 덮으므로 사용 금지). 라벨은 펄스 알파 미적용. 중앙 방향 **42px** 오프셋(화살표에 근접). (64px=1m)
- **타겟별 색/라벨(전부 채도 완화 — 원색·네온 금지)**: 미클리어 지역/잔존몹=금-앰버 `#d8b778` + 지역명(예: `남서 · 물 33m`) / 앵글러=`_raDesat(ELC[el])`(원색 60%+뼈회색 40% 혼합, `_raToneCache`) + `앵글러 · {속성} 120m`(`_REG_EL_KO/EN`) / 개방 후 지옥문=`_raDesat('#66ccff')` + `지옥문 145m`.
- **HUD 회피 세이프존**(`_raMeasureSafe`, DOM rect **90프레임 캐시** — per-frame 레이아웃 읽기 없음): 상단 타이머(`#stageClock`) 아래·하단 스킬바(`#skBar`)/HP·MP 구슬(`.hp-globe/.mp-globe`) 위로 클램프 + 코너 블록(미니맵 `#mmWrap`, 우상단 스탯 `#mmLvl`, 펫 대사 `#petSubtitle`(표시 중일 때만)) 침범 시 최소 이동 축으로 밀어냄.
- 타겟(20프레임마다 `_regionArrowTarget` 재계산, `Float64Array(12)` 고정 버퍼 — per-frame 할당 0):
  1. 개방 후 → 지옥문(채도 완화 게이트 블루).
  2. 미클리어 지역 중 **타겟점이 플레이어와 가장 가까운 지역**: 킬 충족+앵글러만 잔존 → 앵글러 좌표, 그 외 → 살아있는 귀속몹 centroid → (없으면) 생존 앵글러 → 미스폰 앵글러 사이트 → 지역 기하 중심.
- 숨김: 타겟이 화면 안(여백 52px), `!G.on`, 보스 아레나, `_bossLoadPhase>0`, `stageCleared`, `G.paused`, `_bossCine.active`, **튜토리얼(`_parryLesson.active`/`_systemLesson.active`)**, 지역 없음. **펫 대사 중에는 숨기지 않음**(세이프존으로 대사 박스만 회피).

## 8. 번역 (16번역 No.3073~3087)

신규 15키(No.3073~3087): 방위 4 + CH1 테마명 4 + `클리어!`/`클리어됨`/`앵글러 생존` + 봉인 문구 2 + 펫 대사 2.
추가 6키(No.3088~3093, 화살표 라벨): `앵글러`/`지옥문`/`어둠`/`번개`/`물`/`불`.
3차 디자인 추가(No.3105~3107): `정화`(배너)/`지역 정화`(결과 breakdown)/`사망 감점`(결과 breakdown) — 28언어 전파. 구 키 `클리어!`(3081)/`클리어됨`(3082)은 배너 재디자인으로 미사용 전환(테이블 잔존, 무해).
`game.html` `[REGION]` 블록의 `Object.assign(_EN,{...})` + 27개 `lang_*.js` 말미 `Object.assign(_XX,{...})` 전파 완료(28언어).
구 키 `지옥문이 봉인됨 — 처치 `/`지옥문 봉인 (80% 처치)`는 소형 맵 폴백 경로에서 계속 사용. 구 펫 대사 키(`구역을 클리어하면…`)는 미사용 잔존.

## 9. 코드 위치 (game.html 2026-09-30 기준, 타세션 편집으로 유동)

| 훅 | 위치 |
|---|---|
| `[REGION]` 본체 블록(상수/init/판정/tick/화살표) | `// ═══ 필드보스: 심연의 앵글러` 섹션 직전 (~58040) |
| `_regionInit(si)` 호출 | initStage, `if(_MAP_QA_MODE)G._bonfire=null;` 직후 |
| `_regionTick()` 호출 | update, `_fbTick();` 직후 |
| `_drawRegionArrow()` 호출 | draw, `drawMM();` 직전 |
| `_regKill(e)` 후크 8곳 | 각 `G._stageKills=(G._stageKills||0)+1` 직후 |
| 게이트 개방 | `// ═══ 지옥문 개방: 4지역 전부 클리어` 블록 |
| 봉인 메시지/포탈 라벨/HUD/미니맵 | 기존 지점 인라인 분기(`G._regions?...:구규칙`) |

## 10. 미구현 / TODO

- 사이드포켓·상승통로 미니맵 마커(PHASE 6 잔여).
- 지역별 보상(클리어 보너스 드랍 등) — 기획 미확정.

## git provenance

- 이 문서의 REGION 시스템·CLEAR-RESULT·Hell Gothic 디자인 재작업(4차) 전체는 2026-09-30 타세션 커밋 `a8d275507`("art(intro): remaster goddess and warrior intro cutscenes … sync pending session work")에 번들되어 main에 반영됐다. 전용 커밋 없음 — history rewrite 금지 규칙에 따라 재분리하지 않고 사실만 기록.


---

## 2026-10-02 — 보스 사망 후 필드 진행 보존 (현행 재도전 계약)

기존 “retry도 initStage를 거쳐 자동 리셋” 문장은 **일반 재시작 분기**에 적용한다. 일반 arena 필드 복원과 해금 완료 CH1-1 필드 사망은 아래 현행 예외이며, 이전 문장은 변경 전 일반 동작 설명으로 보존한다.

| 경로 | 지역/게이트 진행 |
|---|---|
| 일반 arena + backup | `_regions` 각 평면 객체를 capture/restore에서 얕게 clone. `_regMidX/_regMidY/_regCurIdx/_regBannerCd/_regGateIdx` 원값 복원 |
| CH1-1 `stage===0&&!_bossArena&&_bossUnlocked` 사망 | 현재 `_regions`·`_bossUnlocked`·`_stageKills/_totalSpawned`·`_gateGuardKilled/_gateGuard`·`_fbDone` 등 필드 상태 보존. initStage/_regionInit·적 재스폰 없음 |
| 일반 재시작 | 해금 전 CH1-1·다른 일반 필드는 기존 initStage→_regionInit 리셋 유지 |
| 해금/클리어 조건 | 기존 4지역·80% 및 gate 가드 10%·CH1 앵글러 완료 조건·보상/표시 공식 변경 0 |
| 실제 source gate 경계 | 복원 후 기존 checkRooms: _fbDone+_bossUnlocked 유지면 _bossLoadPhase 1; 앵글러 미완료/불완전 지역의 해금 부족은 phase 0 |
| 저장/시연 | 중간 필드 진행 저장 스키마 추가 0, load=스테이지 재생성 기존 규칙. 시연 si=3 직접 재도전 선행 |

[CH1-1 보스 사망 진행 보존 정본](CH1-1_BOSS_RESPAWN_PROGRESS_20261002.md)의 source/메모리 경계가 우선한다. 검수 영수증 `tmp/mac-migration-runtime/continued-review-20261002/boss-respawn-backup/receipt.json`: 양판 actual source 30/30 PASS(각 15), 공통 자원 인접 회귀 5/5 PASS(최종 후 1회), inline JS 12/importmap JSON 2 구문 PASS. SHA와 46개 필드·대역/미검증 범위는 전용 정본에 기록한다. 검수는 실제 source 추출 + controlled fixture에 한정한다. 실제 게임·등록 이벤트·카메라·시각·오디오·성능은 미인수이며 source PASS를 runtime/visual PASS로 대체하지 않는다.


---

## 2026-10-07 본편 출구 표시의 앵글러 완료 조건 — ROOT-CH1-EXIT-LABEL-DISPLAY-20261007

이 절은 기존 §5의 포털 라벨과 §7의 지옥문 방향 분기에 대한 **현재 본편 적용 규칙**이다. 2026-09-30 본편/Easy 공통 지역 구현 기록은 당시 이력으로 보존하며, 이번 표시 변경은 본편에만 적용한다. 기존 해금·진입 설계나 Easy의 현재 구현을 수정했다고 해석하지 않는다.

표시용 `_bossGateDisplayOpen()`는 `!!G._bossUnlocked && (G.stage!==0 || !!G._fbDone)`만 반환하며 상태를 쓰지 않는다. CH1은 해금과 앵글러 완료가 모두 참일 때 표시상 개방이고, 다른 stage는 기존 해금 플래그를 따른다. 실제 진입·해금 생산자·지역 정화·전투·재도전·저장 순서는 변경하지 않는다.

| 항목 | 현재 본편 계약 |
|---|---|
| 표시 개방 | `_bossGateDisplayOpen()` = `!!G._bossUnlocked&&(G.stage!==0||!!G._fbDone)` |
| 출구 포털·라벨 | `_gUnlk`가 helper 결과를 사용; 봉인/개방의 기존 색과 그리기 위치 유지 |
| 나무 포털 | `_drawPortalTinted`의 개방 인자에 같은 helper 사용 |
| 미니맵 자물쇠 | `_mmDrawLock`의 개방 인자에 같은 helper 사용 |
| 방향 화살표 | `_regionArrowTarget()`의 지옥문 안내 분기가 같은 helper를 사용; 기존 지역 타겟·재계산 주기·버퍼 유지 |
| CH1 지역 4/4, 앵글러 미완료 | 표시상 봉인; `지옥문 봉인 · 앵글러 목표 미완료` / `Gate Sealed · Angler objective incomplete` |
| 기타 봉인 문구 | 기존 `지역 N/4`, 지역 없는 맵의 `80% 처치` 유지 |
| 실제 진입 | 기존 `G.stage===0&&!G._fbDone` 거절 뒤 `_bossUnlocked` 검사 유지; helper가 진입을 허용하거나 latch를 만들지 않음 |
| 상태·진행 | `_regionClearedCount()`는 cleared 플래그 수를 읽음. `_fbDone`, `_bossUnlocked`, 적·전투·재시도·자원·save 변경 없음 |
| 언어 | 새 문구는 `_L` 인라인 한영 쌍. 한국어 외에는 기존 `_T` 및 영문 fallback 경로를 사용; 새 28언어 번역 완료 아님 |

지역이 있고 CH1에서 `_regionClearedCount()>=4`이지만 `!G._fbDone`이면 `지옥문 봉인 · 앵글러 목표 미완료` / `Gate Sealed · Angler objective incomplete`를 표시한다. 이는 완료 플래그 설명이며 앵글러가 살아 있다고 단정하지 않는다. 나머지 지역 N/4 및 지역 없는 맵의 80% 라벨은 유지한다.

모든 지역이 cleared인데 CH1 `!G._fbDone`이면 기존 미완료 지역 탐색은 타겟을 찾지 못해 `_raHas=0`을 유지한다. 이번 표시 수정은 새 앵글러 목표를 만들거나 지역·개방 상태를 바꾸지 않는다. 이 모순 플래그 상태의 정상 경로 도달 여부는 미확정이다.

### 이번 코드와 검수 근거

본편 `game.html` working 4088007B / `dd3e24dd9b02929e2e4a71cebc57c8b3362cc4a10bebfd667a17b1861f53192f`. HEAD+소유 변경 blob 4087822B / `f8104295b740a645bc233a3b78370d444a161fbe30ea25a78cfbec1d2585313b`이며 foreign 185B는 보존한다. Easy는 이번 변경 대상이 아니다.

CPU 최초 Node 1회·36 VM·5그룹 35조건 PASS, FAIL·미도달·준비 실패·unhandled 0, exit 0. 실제 helper/방향 함수 전체와 라벨·포털·미니맵 소스 조각을 통제 VM에서 검사했고 working/owned 전후 및 역변환이 정확했다. 별도 Canvas2D 소스 조각은 최초 Chrome/context/page 각 1회에서 한영 6조건 PASS, FAIL·미도달 0, exit 0이다. 두 단위를 합산하지 않으며 실제 게임 초기화·P/G·정상 경로 인수는 0이다.

| 새 검수 | 실제 범위 | 남은 경계 |
|---|---|---|
| CPU 5그룹/35조건 | CH1 지역 0/3/4×플래그·한영, 다른 stage, 지역 없는 폴백, 4표시 불일치 방지, 권한 원본 역변환 | 정상 플레이에서 모순 플래그 상태의 실제 도달 여부는 미확정 |
| Canvas2D 조각 6조건 | 실제 source 조각의 지역 3/4·앵글러 미완료·개방 한영 라벨 | 실제 게임 초기화/route/실제 UI 배경/실제 webfont 미인수 |

통제 Canvas의 640 CSS 폭 cell에서 13px 선언의 한영 문구 6개는 잘리지 않았다. 실제 webfont는 로드하지 않아 resolved face는 UNKNOWN이다. 실제 맵·포털·미니맵·화살표·정상 게이트 도달, 전체 native6·음향·실저장 ACK는 미인수다. VISUAL VERDICT: RETOUCH. 과거 실버테일 공격 검수와 합산하거나 재실행하지 않는다.

상세 정본: `docs/4.1맵디자인+설정/REGION_CLEAR_GATE_20260930.md`의 이번 후속 절. 외부 근거: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-exit-label-display-20261007/display-cpu-receipt.json`, `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-exit-label-display-20261007/native-display-fixture-result.json`, `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-exit-label-display-20261007/validation-receipt.json`, `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-exit-label-display-20261007/visual-verdict.json`. Git 사실은 같은 디렉터리의 `remote-preservation-receipt.json`에서 정상 commit/push 및 원격 정확 SHA로 확정한다. 이 문서 안에 자기 commit SHA를 순환 기입하지 않는다.
