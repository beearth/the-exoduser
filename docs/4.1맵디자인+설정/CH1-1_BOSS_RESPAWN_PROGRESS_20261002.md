# CH1-1 보스 사망 후 필드 진행 보존 — 2026-10-02

사용자 관찰: CH1-1에서 보스에게 죽은 뒤 재도전하면 이미 열린 지옥문이 닫히고 필드 몬스터가 전부 다시 생성됐다. 생산의 재도전 경로에서 필드 진행을 복원/보존하도록 반영했다. 이 정본은 같은 페이지의 source 상태 계약이며 지형·원화·오브젝트 배치 설계를 바꾸지 않는다.

## 적용 범위와 분기 순서

| 경로 | 현재 동작 | 경계 |
|---|---|---|
| 일반 보스 구역 사망 | 진입 전 필드 진행 복원 | 시연 si=3 직접 재도전 선행 분기를 제외한 _bossArena + _preArenaBackup 경로 |
| CH1-1 해금 완료 필드 사망 | 현재 필드 진행 보존 | !G._bossArena 및 G._bossUnlocked 범위 |
| CH1-1 해금 전 필드 사망 | 기존 전체 스테이지 재시작 | 새 예외 적용하지 않음 |
| 그 외 일반 스테이지 사망 | 기존 재시작 | 동작 변경하지 않음 |
| 시연 si=3 보스 직접 재도전 | 기존 직접 보스 재도전 | _retryDruidFinale 경로 유지 |
| EXP·자원·사망 횟수·경과 시간 | 기존 사망/재도전 규칙 | 필드 백업으로 되감지 않음 |

정확한 순서는 `_retryDruidFinale()` → `G._bossArena&&_preArenaBackup` 또는 `G.stage===0&&!G._bossArena&&G._bossUnlocked` → 그 외 `G._zoneState={};initStage(G.stage)`다. 일반 arena는 보스 진입 직전의 backup, CH1-1 해금 완료 필드 사망은 재도전 시 현재 필드를 새로 capture하여 restore한다. 게이트가 열리기 전 CH1-1의 전체 재시작은 기존 계약이다.

## 실제 capture/restore 46개 필드

`_captureBossFieldState()`가 만든 런타임 객체를 `_restoreBossFieldState(b)`로 복원한다. 깊은 전체 게임 복제가 아니다. 배열/행/region 복사와 원 엔티티 참조 경계를 아래와 같이 유지한다.

| 그룹 | 정확한 key | 복사/복원 계약 |
|---|---|---|
| 맵·게이트 | `map`, `mw`, `mh`, `rooms`, `exits`, `curRoom`, `bossGate`, `bossGateOpen`, `bossSealed`, `_bossCx`, `_bossCy`, `_gateY`, `_bossEntY`, `_isTileRLE`, `_isOpenField` | map 각 행 복사; rooms/exits/bossGate 배열 복사(내부 객체 참조 유지), 나머지 스칼라 원값 |
| 필드 엔티티·상호작용 | `ens`, `mapObjs`, `worldItems`, `_fow`, `spawnHoles`, `rifts`, `_editorEyes` | 새 배열에 원 엔티티/오브젝트/아이템/소환굴/리프트/eye 참조 유지. 죽은 적 제거·부활·HP 재설정 없음. FOW typed array 복사. nullable eyes 원값 보존. mapObjs는 전역 MAP_OBJS로 복원 |
| 필드 진행 | `_bossUnlocked`, `_stageKills`, `_totalSpawned`, `_gateGuardKilled`, `_gateGuard`, `_deathSpawned` | 스칼라 원값, _gateGuard는 원 적 참조 |
| 지역 | `_regions`, `_regMidX`, `_regMidY`, `_regCurIdx`, `_regBannerCd`, `_regGateIdx` | 현재 평면 region 객체를 capture/restore 각각 얕게 복사, 메타데이터 원값. null/undefined 보존 |
| CH1 앵글러·화마귀 | `_fieldBoss`, `_fieldBosses`, `_fbDone`, `_fbSpawned`, `_fbAnnounced`, `_fbStage`, `_fireDevils`, `_fdSpawned`, `_fdAnnounced`, `_fdStage` | nullable 배열과 null 슬롯·원 엔티티 참조/HP/AI 유지, flags/stage 원값. CH1 진입에서 refs 분리; easy의 3개 CH1 가드는 본편과 동일 |
| 필드 곰치 | `_worms`, `_wmStage` | nullable 배열과 null 슬롯·원 refs 보존. 진입 시 일시 []와 _wmStage=G.stage, 복귀는 원 _wmStage 정확 복원. 일반 arena의 worm tick 가드 확대 없음 |

보스 진입 시 CH1의 `_fieldBoss/_fieldBosses/_fireDevils` 참조를 분리하고 곰치는 모든 일반 진입에서 일시 `G._worms=[];G._wmStage=G.stage`로 정렬한다. easy의 `_fbTick/_fdTick/_wmTick` CH1 arena early return을 본편과 맞췄다. 원 nullable 배열·null 슬롯·HP/AI·fb/fd/wm flags/stage는 필드 복귀에서 정확히 복원한다. 일반 arena worm tick 정책을 확대하지 않으며 시연 si=3 직접 재도전은 선행한다.

기존 restore의 `spawnRoomEns/spawnCorridorEns`, 합성 `boss_gate_col` 재생성, 빈 FOW 생성, `bossGateOpen/bossSealed` 강제 값, `_deathSpawned=false` 강제 덮어쓰기, 지연 `initMapObjects`를 제거했다. 미처치 적을 필터링·부활·HP 초기화하지 않고 이미 처치/사용한 필드 상태를 유지한다. `_stageKills`는 진입 전 snapshot 값으로 복원하여 arena 진입 때 임시 반영한 잔여 적 소멸 크레딧을 필드에 누적하지 않는다.

## 플레이어·자원·통계 및 저장 경계

| 항목 | 현재 계약 |
|---|---|
| EXP 손실 | `P.exp=Math.max(0,P.exp-~~(P.exp*0.3))`. 현재 EXP에서 30% 정수 손실; snapshot으로 복구하지 않음 |
| 자원 | 기존 `applyStats() → _refillRespawnResources()`: 최종 HP/MP/ST/shield 최대치, 공용 기동게이지  완충, 최종 돌진 최대 스톡, `chargeCd=0` |
| 공통 안전 | 기존 `iframes=300`, 화톳불 300f·반경 280 유지 |
| 누적 통계·시간 | `G._sStats/deaths`, `G.stageTime`를 snapshot에 넣지 않아 현재 사망 횟수·경과 시간 유지. 일반 `initStage` 분기의 초기화 규칙은 그대로 |
| snapshot 제외 | P, INV, EXP, 계정·저장 스키마. 필드 적/오브젝트 진행과 플레이어 획득·자원 상태를 혼합하지 않음 |
| 지역·보스 수치 | 4지역 클리어/가드 임계치, 앵글러 조건, 보스 HP/ATK/패턴, 비용·쿨다운·합체 변경 0 |
| 저장 | 현재 페이지 런타임 메모리 복원. 재도전의 `if(_dbReady)await dbSave()` 유지; field snapshot 저장 필드 추가 0, save/load의 스테이지 재생성 기존 계약 유지 |

| 새 CH1-1 필드 사망 분기만 | 기존 initStage에서 하던 플레이어 일시 상태 정리 |
|---|---|
| 0 | `P._webSlow`, `P._trapSlowT`, `P._freezeSlow`, `P.burnT`, `P.poison`, `P._ioT`, `P._altAtk`, `P._altDef`, `P._altSpd` |
| false | `P._ioActive`, `P._lastStandUsed`, `P._reviveOnceUsed` |
| 빈 배열 | `P._rbPoison`, `P._rbBurn` |
| 적용 범위 | `_fieldRetry`에서만 적용; 일반 arena 사망의 플레이어 정리 의미는 변경하지 않음 |

복귀 좌표는 기존 `(_bossCx+.5)*T,(_gateY+6+.5)*T`를 실제 `safePt`에 전달한다. safePt가 실패하면 원 목표 좌표를 쓰는 기존 fallback을 유지한다. 실제 `checkRooms` source fixture에서 `_fbDone`과 `_bossUnlocked`를 보존한 복귀는 `_bossLoadPhase=1`로 다시 진입하고, 앵글러 미완료 또는 지역이 미완료인 상태의 해금 latch 부족은 phase 0을 유지했다. 게이트 포털·미니맵의 시각 효과 인수는 별도다.

## 파생 상태 갱신

| 시점/대상 | 정확한 처리 | 검수 경계 |
|---|---|---|
| 복원 전 미니맵·배경 큐 | `_mmInitDone=true;_mmInitCtx=null;_mmDirty=1;`, `_bgInitQueue.length=0;_bgInitIdx=0;_bgInitDone=true;` | 이전 build context/오브젝트 초기화 큐가 복원 상태를 덮어쓰지 않게 함 |
| 출구·탐색 | `_cacheExitCenter()`, `G._fowDirty=true` | FOW 원 데이터 복원; 새 빈 FOW 생성 제거 |
| 적 공간 해시·시체 풀 | `_shDirty=true;shRebuild();rebuildDeadPool()` | `_shDirty`는 그림자가 아니라 적 공간 해시 dirty |
| 미니맵/방향 화살표 | `_mmRegOvlKey='';_raT=0;drawMM._enCnt=0;drawMM._enT=29;` | 현재 field 표시 파생 데이터 무효화, 실제 렌더 미검수 |
| 정적 조명 | `_slDirty=true;_litCamX=1e9;_litCamY=1e9;` | 다음 lighting 갱신 유도; GPU/첫 화면 미검수 |
| 충돌 | 복원 `MAP_OBJS`의 새 배열 identity → 실제 `safePt/isW`의 `_ensureColObjs` 재빌드 | 실제 collision 함수 source fixture 검수; 지형/충돌 설계 변경 0 |
| 맵 캐시·파생 조명 | `buildMapCache();initTorchLights()`; 지연 큐는 `initSwayObjects/initWallEyes/_initEyes/initGlowObjects` | `initMapObjects` 제외하여 상호작용 상태 재생성 방지. cache token/bitmap 경계는 source 읽기, 실제 idle/GPU 일정은 미실행 |

## 생산과 검수 영수증

| 파일 | 최종 SHA-256 | 실제 적용 위치(1-based line) |
|---|---|---|
| game.html | `7d579cd6de5d27c300bf06205a401f6e5420a149759b26c83cfaa9a815927f36` | capture 29511 / restore 29528 / enter 29545 / retry 61441 / field branch 61449 |
| game-easy-test.html | `1099267636a1cc379bcd17db7a86f793e73b3e7aef27e707594eb7104b1d7341` | capture 28344 / restore 28361 / enter 28378 / retry 59779 / field branch 59787 |

검수 영수증: `tmp/mac-migration-runtime/continued-review-20261002/boss-respawn-backup/receipt.json`, SHA-256 `dfd8f38b6e65a61ca1560ac8acddee1dc4bbcca626c656295efb808785c1cdb7`. 완료 UTC `2026-10-02T06:26:13.531561+00:00`; `productionAccepted=true`의 범위는 필드 capture/restore·CH1 해금 후 재도전·진입 특수 적 refs 격리·easy CH1 첫 tick 가드 source뿐이다.

| 근거 | 확정 결과 | 인정 범위 |
|---|---:|---|
| `test/bossRespawnFieldState.test.cjs` 최종 actual source | 30/30 PASS (양판 각 15), FAIL 0 | 실제 helper/enter/retry/checkRooms/genArena/특수 tick/소환굴·리프트/충돌·safePt/해시·시체 풀 추출 + controlled field fixture |
| 기존 `test/respawnResources.test.cjs` 인접 회귀 | 5/5 PASS, 최종 수정 후 1회 | 공통 자원 계약. 기존 전문팀 checks 재실행 없음 |
| 실제 inline/importmap 구문 | JS 12 / JSON 2 PASS | 최종 양판 SHA 대상으로 acorn/JSON.parse; 실행/렌더 인수 아님 |
| 변경 구역 밖 바이트 | 본편 2구역 / easy 5구역 밖 동일 | 생산 담당 영수증 근거, 다른 팀 코드 보존 |
| 원 코드 승인 baseline (이력) | 26 중 5 PASS / 21 FAIL | 현행 PASS에 합산하지 않음 |
| 첫 수정 후 새 경계 (이력) | 30 중 27 PASS / 3 FAIL | easy CH1 factory 1→13, 일반 arena factory 1→5 문제를 찾은 이력. 최종 easy CH1 가드·진입 wmStage 정렬 후 해소 |

factory·렌더·오디오·DB·스탯 재계산·배경 map builder는 대역이다. restored special의 asleep first tick은 전체 전투 AI를 검수하지 않는다. 맵 cache token/bitmap 보호는 actual source를 읽었으나 실제 background builder/idle/GPU 일정은 실행하지 않았다. 등록된 이벤트와 전체 update 루프, 네이티브·브라우저·실게임 이동·재도전, 카메라·시각·오디오·성능은 미인수(`runtimeAccepted/nativeAccepted/visualAccepted/audioAccepted=false`). safePt-null의 기존 좌표 fallback과 좌표가 없는 입력, 실제 화면 배치는 미검증이다. source PASS를 runtime/visual PASS로 바꾸지 않는다.

## 관련 정본과 문서 원문 보존

아래 정본에는 이 계약의 해당 시스템 경계를 append-only로 연결했다. 기존 문장의 전체 일반 재시작/오브젝트 재생성 규칙은 **2026-10-02 부록의 분기 예외가 우선**하며, 과거 QA와 검수 영수증은 원문을 보존한다. 원문 prefix 바이트와 기존 CRLF/혼합 개행은 보존한다. 전체 docs 키워드 검색 원문/파일 목록/동기화 분류는 ignored tmp 문서 백업의 검색 영수증에 보관한다.

- `docs/8.1보스디자인바이블/BOSS_BATTLE_SETTINGS.md`
- `docs/2_5 부활+에너지쉴드시스템/RESPAWN_RESOURCE_RESET.md`
- `docs/2_5 부활+에너지쉴드시스템/2_5 부활+에너지쉴드시스템.md`
- `docs/4.1맵디자인+설정/REGION_CLEAR_GATE_20260930.md`
- `docs/4.1맵디자인+설정/MAP_RUNTIME_ARCHITECTURE.md`
- `docs/4.1맵디자인+설정/맵오브젝트_에셋목록.md`
- `docs/15 세이브+데이터구조/15 세이브+데이터구조.md`
- `docs/4.1맵디자인+설정/MAP_QA_GATES.md`
- `docs/2게임디자인레벨디자인/클리어결과_점수랭크_20260930.md`
- `docs/4.1맵디자인+설정/_MAP_SSOT_INDEX.md`
- `docs/8.0몬스터디자인/몬스터_총관리.md`
- `docs/2게임디자인레벨디자인/2게임디자인레벨디자인.md`

## §23 MAP PRODUCTION REPORT

================= MAP PRODUCTION REPORT =================

STAGE: CH1-1 (si=0), 보스 사망 후 필드 진행 보존 source 계약

MASTER
- silhouette: 변경 없음; 현재 CH1-1 정본 승계, 새 시각 검수 없음
- regions: 기존 4지역 좌표·클리어 임계치 변경 없음; 완료 진행 복원/보존
- main route: 변경 없음; 시작 6시·출구 12시 계약 승계
- side spaces: 변경 없음; 이번 작업에서 신규 평가 없음

OUTER MASS
- LEFT: 변경 없음
- RIGHT: 변경 없음
- TOP: 변경 없음
- SOUTH: 변경 없음
- major holes: 수정·신규 평가 없음

LARGE
- source assets: 기존 원화·레이어 그대로; 신규 에셋 없음
- composites: 변경 없음
- overlap: 배치 변경·신규 평가 없음
- repeated silhouette: 신규 평가 없음

MEDIUM
- connections: 지형·통로 연결 변경 없음
- remaining holes: 수정·신규 평가 없음

GROUND
- shadow: 아트 변경 없음; 실제 복귀 첫 프레임 검수 미실시
- contamination: 변경 없음
- structure integration: 변경 없음

PLAYABLE
- main arenas: 보스 진입/사망 후 필드 상태 전달만 수정; 생성 지형 변경 없음
- travel space: 변경 없음; 실제 이동 검수 미실시
- breathing space: 변경 없음
- threat space: 배치 변경 없음; 필드 적 진행 보존 범위는 본문 상태 표 참조
- combat readability: 실게임 밀집 전투·VFX·적 가독성 검수 미실시

LANDMARK
- primary: 변경 없음
- secondary: 변경 없음
- tertiary: 변경 없음

CAMERA QA
- START: 미실시
- EARLY: 미실시
- ARENA: 미실시
- SIDE L: 미실시
- SIDE R: 미실시
- LANDMARK: 미실시
- LATE: 미실시
- EXIT: 미실시

TECH QA
- route: source 분기 검수 범위만; 실제 이동·통과 미검수
- collision: 복원 상태/cache source 검수 범위만; 실제 충돌 미검수
- pageerror: 브라우저 실행 없음, 미검수
- 404: 서버·브라우저 실행 없음, 미검수
- seam: 아트·렌더 변경 평가 없음, 미검수
- loading: 실제 등록 이벤트·비동기 렌더 완료 미검수
- performance: 실제 측정 없음, 미검수

FILES
- stage-owned: 본 전용 보고서와 관련 보스/부활/지역/맵/오브젝트/저장/QA/점수 정본 부록
- concurrent touched: 생산 담당의 game.html/game-easy-test.html 및 회귀 도구, root의 통합 기록은 각 담당 소유
- unrelated touched: 0; 타 팀 작업·과거 보고서·보호 문서 보존

GIT
- staged: 문서 담당 실행 0; root 인수 범위
- commit: 문서 담당 실행 0; root 인수 범위
- push: 문서 담당 실행 0; root 원격 SHA 검증 전 완료 주장 0
- deploy: 0

VISUAL VERDICT:
RETOUCH — 기존 MAP-020 전체 맵 역사 판정 유지. 이번 수정의 새 시각 판정은 미실시이며 source PASS가 visual PASS를 뜻하지 않음.

NEXT PASS:
실제 CH1-1에서 해금 완료 필드 사망 및 보스 구역 사망→재도전→기존 적/오브젝트 진행·게이트 개방·자원 완충 확인, 해금 전 일반 재시작과 si=3 직접 보스 재도전 확인. 그 뒤 기존 카메라 보드·시각 QA 미완료 목록을 담당 범위에서 수행. 자동 검수 결과로 미완료 Gate를 해제하지 않음.
