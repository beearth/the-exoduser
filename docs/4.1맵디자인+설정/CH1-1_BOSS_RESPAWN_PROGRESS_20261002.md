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
| 적용 범위 | 위 전체 정리는 `_fieldRetry`에서만 적용. source28부터 그 블록 뒤에 `P.poison=0;P._rbPoison=[];P._rbBurn=[];`를 추가하여 일반 arena 복귀도 이 세 지속 피해만 정리. 버프·1회효과·나머지 상태는 기존대로 보존 |

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


## 2026-10-03 source14 이전 드루이드 공격의 복귀 순간 정리

필드의 열린 지옥문·기존 몬스터·획득 아이템을 보존하는 위46 key 계약은 그대로다. 보스 전투에서 남은 독립 ORB는 이 field snapshot에 포함되지 않으므로 별도로 정리한다.

| 정확한 key / 소비자 | 복귀 순간 값 | 경계 |
|---|---|---|
| `G._druidOrbs` | 새 `[]` | 이전 전투 ORB의 필드 이동·접촉 효과 제거 |
| `G._druidOrbT` | 0 | 이후 기존 update에서 재증가 가능; 영구0 아님 |
| `G._druidParryT` | 0 | 이전 리듬탄 타이머 제거 |
| `G._druidParryVolley` | 0 | 이전 리듬탄 웨이브 번호 제거 |
| `retryBtn.onclick` | 기존 `G._bossArena&&_preArenaBackup` 또는 해금 CH1 field 분기 | 기존 보스 공격 배열 정리 후, `_restoreBossFieldState(b)` 전에 각70B 추가 |
| snapshot / 저장 | 46 key 유지·새 schema0 | 네 key를 backup/DB에 추가하지 않음 |
| 유지 | map/gate·ens/아이템/오브젝트·nullable 필드 적·지역·처치·FOW refs/복사 계약 | 재스폰·HP 초기화·문 잠금·geometry/배치 변화 없음 |
| 다른 경로 | si3 finale 직접 재도전·그 외 initStage | 기존 선행/폴백 분기 유지 |

기존 ORB update는 stage0/3 및 bossAlive=true에서 bossRef=null이어도 이미 있던 ORB를 처리한다. 이를 복귀 순간 배열 제거로 차단한다. 접점의 기존 네 초기화 선례는 `_enterBossArena`다. EXP30% 정수 손실·최종 applyStats/완충·iframes300·화톳불300f/r280·DB 저장 순서·공격 수치는 변경하지 않는다. source14는 시각/카메라/실청취/native 보스 사망 검수를 추가 인수하지 않으며 검수 source11 앱도 덮어쓰지 않는다.


### source14 실제 소스 검수 결과·고정 핀

| 항목 | 검증·인수 경계 |
|---|---|
| 최소 변경 | 양판 실제 retry callback 각4053→4123B(+70B), 해당 분기 초기화 네 대입만 추가. 역치환 시 source13 전체 byte exact |
| 본편 | 4030105B, SHA `00519cdf518a5a9eb6147c536c7f77886cc6d11e79ac5ad8f181280a8495150f` |
| easy | 3907372B, SHA `87f36138e07055fcaa5237a116bbddd5c62759983427cf5851cc00f1c0d44152` |
| 후보·생산 회귀 | 신규 memory 원본24PASS/12RED→최종36PASS, 실제 생산36PASS; 각각 전체12JS+2JSON PASS. 첫 fixture 실패0 |
| 실제 추출 | 등록된 async retry callback의 소스·capture/restore·si3 retry/predicate·공통 refill·드루이드 ORB IfStatement. snapshot46 key와 helper/Orb update byte 유지 |
| 잔류 재현 | source fixture의 bossRef=null/bossAlive=true: 원본 남은구슬 t12→13, hurtE 기록1/ORB FX leaf12/hurtP0(무적300). 최종 남은구슬 처리/기록0, OrbT 복귀0→다음sp1 tick1 |
| 보존 대조 | arena backup 복원·해금CH1 현재필드 capture/restore·46 key 복사/원 참조·P/INV/통계/시간·현재EXP30% 손실·최종 자원/기동 충전·DB 순서·일반 및 si3 선행 |
| 대역 | geometry/cache/DOM/FX/DB/stat/equipment leaf, initStage·enterArena 분기 sentinel, hurtE/hurtP 기록 대역. 실제 저장/피해함수·DOM입력·시각·native 사망 인수로 확대하지 않음 |
| 원자료 | `test/druidRetryTransientAcceptance.test.cjs`; ignored `root-druid-retry-source14/memory-receipt.json`(28044B, SHA `87d4e745d20f7975a7eba9a0b854005978596090c9e5aa56f2ae7f031dfe9f63`) 및 live-receipt |
| 기존 성과 | 이전30/30·자원5/5 검사 재실행/이번 성과 합산0. source11 앱·사용자 게임/세이브·원자료·타인WIP 보존 |


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


## 2026-10-03 source28 — 보스 재도전의 이전 전투 지속 피해 정리

| id / 적용 경계 | 현재 정확 계약 |
|---|---|
| DOT01 / `retryBtn.onclick`의 일반 arena→field 및 해금 CH1 field 복귀 | 기존 `if(_fieldRetry)` 뒤에 `P.poison=0;P._rbPoison=[];P._rbBurn=[];` 추가. 본편/Easy 각44B. 사망 후 자원 완충 전에 이전 전투의 세 지속 피해만 제거 |
| 제외 / 기존 분기 | `_retryDruidFinale()`가 먼저 처리하는 si3 직접 보스 재도전 및 해금 전 일반 `initStage`는 변경0. field-only 기존 디버프·버프·1회효과 정리 블록은 그대로 |
| arena 플레이어 보존 | `_webSlow/_trapSlowT/_freezeSlow/burnT`, `_ioActive/_ioT`, `_altAtk/_altDef/_altSpd`, `_lastStandUsed/_reviveOnceUsed`는 기존대로 보존. 전체 field-only 블록을 arena로 이동하지 않음 |
| 피해/시간 공식 | `P.poison`은 idle tick에서 `sp*.02` 감소, 기존 중독 피해 `~~(P.mhp*.008)` 유지. `_rbPoison/_rbBurn`의 producer t600f·tick30f·총량/20·최대10중첩 불변. 일반 전투의 독 부여·소비·소멸 변경0 |
| 진행·저장 | 기존46 field key, 적/시체 HP와 원 참조·지역·열린 보스문·아이템·현재 INV/EXP·시간/사망 통계 보존. EXP30% 정수 손실·iframes300·화톳불300f/r280·최종 applyStats→완충→DB 저장 순서 유지. save schema/API 변경0 |
| 검증 | 실제 전체 retry/capture/restore+전체 hurtP+AST 원문 DOT3분기/iframes 감소 실행. 원본68검사54PASS/14FAIL→후보68PASS→생산 관련3파일89PASS. 신규18개 중 정상 전투6control 유지; 새sp1/2 재도전12개는 이전 지속 피해를 차단 |
| 검증 한계 | 필드/장비·pet/visual/audio/DB/stat 재산정은 fixture 또는 경계 대역. 전체 game loop·native·실저장·청취·시각 완주 검수 아님. 실제 시연 앱3402는 source27이며 source28을 포함하지 않음 |

원자료는 `tmp/mac-migration-runtime/continued-review-20261003/source28-retry-dot/`의 원본 백업·baseline/candidate/production 기록이다. 수정 전에는 부활 무적300f 동안 timer만 감소한 뒤 잔여 독/화상이 HP 또는 쉴드를 다시 깎았다. 이번 수정은 해당 복귀 시 지속 피해만 끊으며 새 생애의 정상 전투 DOT는 그대로 작동한다. 보호2_3·Q 전용 magic 패링·E 불가·어택티켓 금지는 변경하지 않았다.

### source28 MAP PRODUCTION REPORT

| 항목 | 이번 범위 |
|---|---|
| STAGE / MASTER PLAN | CH1-1 보스 사망→필드 복귀. 이전 전투의 DOT 제거와 이미 열린 문/기존 몬스터 보존 |
| LARGE OUTER MASS / MEDIUM CONNECTION / GROUND CONNECTION | 지형·통로·외곽·충돌·좌표 변경0 |
| PLAYABLE/COMBAT | 기존46-key snapshot·적/시체 HP·게이트를 실제 callback fixture에서 검증. 정상 전투 DOT는 유지 |
| LANDMARK/CENTER / SMALL DETAIL | 오브젝트·아트·VFX 에셋 변경0 |
| CAMERA QA | 기존 cam/safePt/캐시 원문 불변. 실제 카메라 검수 미실시 |
| TECH QA | 생산89PASS, 전체 retry/hurtP와 실제 DOT 분기 실행. 렌더·오디오·장비/DB 경계 대역 명시 |
| VISUAL VERDICT | RETOUCH — native 보스 사망/부활/재입장 및 같은 후보 전체플레이 미인수. 자동 PASS를 visual PASS로 계산하지 않음 |


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


## 2026-10-07 사망 메뉴의 재도전 1회 소비 — ROOT-CH1-RETRY-MENU-CONSUMER-20261007

기존46-key 필드 진행 보존 본문을 그대로 유지하는 UI 진입 gate다. `retryBtn.onclick`의 실제 이름은 이제 `_retryFromDeath`이며 현재 onclick identity를 검사한다.

현재 `game.html` working은 4,084,755B / `7e4002066c089e2a0d3fc6a6d2af5499d75aa4a3e677b08e4d10c9552f5080ec`, root owned HEAD+변경 blob은 4,084,570B / `8ba1a816d1a656d646f2967edc0431c087075d73b6bbedb75532d2aa0756402a`다. shared game의 타인 WIP185B를 보존한다. 변경은 현재 사망 메뉴가 첫 재시도 입력을 동기 소비하는 UI 접점이다. 기존 본문·EXP·field snapshot·자원·음악·save schema/API/backend를 변경하지 않는다.

현재 connected retryBtn의 named onclick selfidentity와 connected death.on·replay off·P.dead·!G.on을 먼저 검사한다. 통과하면 외부 게임 helper 전에 death.on을 동기 제거하고 death 하위 focus만 blur하고 settings.on일 때만 기존 closePanel('settings')로 그 패널과 pause를 해제한 뒤 invalidate와 기존 본문을 실행한다. OPT/다른 panel은 유지하며 closeAllPanels0이다. repeat Enter/NumpadEnter/Space만 preventDefault+stopPropagation; 첫 입력/Tab/패드 click은 유지한다. `_retryBusy`/finally/새 state는 없으므로 저장 pending 중 새 실제 사망은 그 메뉴의 guard가 성립하면 독립 재시도한다. await 이후 UI mutation0, backend의 늦은 save 효과 UNKNOWN. 정확 표/순서는 `docs/2_5 부활+에너지쉴드시스템/RESPAWN_RESOURCE_RESET.md`의 같은 unit 절을 따른다.

| 검수 | 현재 상태/경계 |
|---|---|
| 이전4249 CPU | 최초 Node1/VM21, 8그룹35복합조건 PASS/FAIL0/미도달0/unhandled0/exit0. 이 source 뒤 settings pause 반례를 추가 보정했으므로 최종7e4002 전체 PASS로 승격하지 않음. 재실행0 |
| 최종7e4002 CPU | 최종7e400 source의 settings 한정 최초 Node1/VM3, 3그룹6조건 PASS/FAIL0/미도달0/unhandled0/exit0. 실제 전체 final handler+기존 closePanel을 추출하되 새 settings 소비만 검증; normal init/stats/refill/finale/QS는 통제 ports·_dbReady=false. 이전4249 35조건은 재실행하지 않았으며 clean41/최종전체PASS로 합산하지 않음 |
| 신규 native | 최종7e400 source 최초 Chrome/context/page 각1: normal field 실제 적 피해10회→frame1109 HP0/P.dead/G.on false/death.on true의 자연사망 N1 PASS1. trusted Escape로 settings.on/G.paused true 관측은 재도전 전조건이다. trusted Tab40회에도 BODY에서 retryBtn 초점 미도달: phase/setupFAIL1·conditionFAIL0·N2/N3未도달2·exit1. 실제 retry activation/소비·settings closure·pause release·부활·재도전 후 이동·저장 미인수, 재실행0/추가Chrome0 |
| visual | root가 death/first-failure PNG를 직접 판독: 중앙 “부활 불가 1s” countdown과 설정/사망 패널 겹침으로 RETOUCH. death.on snapshot은 retry 버튼이 visible/focusable이라는 증거가 아니며 Tab 미도달의 원인 UNKNOWN. 실제 재도전/전체 visual PASS 인수0 |
| 브라우저 전 준비실패 | 최초 --root-ack 누락으로 CLI guard exit1/Chrome0/조건0/제품FAIL0. 원자료 보존 후 기존 root GO를 명시 인자로 공급한 실행이 위 최초 브라우저1회; 준비오류를 native condition FAIL이나 제품 suite 재시도로 합산하지 않음 |
| 네트워크/GL/저장 | pageerror0/HTTP failure0이나 의도적 external font 차단3·intro media abort3는 별도 관측이다. GL=`UNKNOWN_NO_RENDERER_WRAPPING_OR_NEW_CONTEXT`로 실GL0 주장0. synthetic mats2는 서버 도달0, 실save0·durable ACK 미인수, physical GPU 해제 UNKNOWN |
| 이력 | 이전 source별 retry/EXP/field46key/자원/음향 PASS는 해당 epoch 이력으로 보존. 이전 AIM28/native3/search51과 camera검사를 이번 메뉴 소비 성과로 재실행/합산하지 않음 |
| 미인수 | 실제 retry activation/repeat guard/settings closure/pause release·부활/완충/재도전 후 이동·pending 실save 중 다음사망 생애·boss death/열린문·정상 route 전체/native6·audio/reward/durable save·backend 늦은 save 효과·시각 전체 PASS. N1은 자연 필드사망만이며 boss 사망/native6로 승격하지 않음 |

외부 증거 디렉터리는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-main-retry-menu-20261007/`이다. 이전 `implementation-receipt.json` 1,914B / `2491d197877b441d5703306b3ccf4a9c1b289d6d001ab2910f18c1a05310d909`와 `retry-cpu-receipt.json` 4,373B / `05082a5cef7fef3d8848d57e652567c5452a1fd3f74b896a2d19c515ba8ceae4`는4249 source 이력이다. 현재 `implementation-final-receipt.json` 2,737B / `781b5167f12c6f855cffd63998982e878799a345ee065c77eca5d3c8bdafeec6`의 exact2치환/inverse exact/foreign185 보존을 따른다. Git 사실은 같은 디렉터리 `remote-preservation-receipt.json`의 실제 normal commit/push/원격 정확 SHA를 참조하며 자기 commit SHA를 순환 삽입하지 않는다. 이 증거 epoch는 checkpoint 전이며 deploy0이다.

최종 settings 한정 원문 `settings-receipt.json` 4,178B / `f2c077c5c7a57faa3df8e9c095f549f52eecd6bb6ec772434b0965cf31c80a9d`와 `settings-result.json` 7,267B / `812f248743b349671f522578d074d2ed459fcf596a74f66c2ec7a3c9fc0550d6`, 실제 native `native-retry-result.json` 133,977B / `b2dee048ac3e347415e7437c7df68daf8014e39ff8ca48677e7ba414bc780d55`, 브라우저 전 `native-cli-preflight-failure.json` 438B / `bc42a5c8fdea6b50bb73e4ec0e82949abade971f8bd16e508d2fe95b9f137d4a`, `validation-receipt.json` 6,019B / `3a367fd511c8819cbe74c2f2d75fa77c25ed4be3f820b7ee496d0f3b9f4d7978`, `visual-verdict.json` 5,268B / `e56ffe0466fd799cc972ff2cf63d883018170ff1604a3b5126fb930ea8af6aa7`를 별도로 보존한다. 새 editor N3 기대거절 원문 `codex-editor-import-official-manifest.json` 502B / `316193c436db197ec40a28b0e80dae5035b8e1718cde5debf01114ea123c6712`는 root가 미채택 보존한 자료이며 필수 hunk0·이번제품/검수채택0이다.

## 2026-10-08 ROOT-CH1-TIMEWARP-SPACE-LIFETIME-20261008 — field restore와 시간왜곡 기록 분리

| 항목 | 현재 계약 |
|---|---|
| 46-key snapshot | 기존 map/field 진행 capture→restore와 원 참조·복사 범위 그대로. timeWarp ringbuffer를 이 snapshot에 추가하지 않음 |
| 필드 복귀 위치 | 기존 (_bossCx+.5)×T, (_gateY+6+.5)×T→safePt 및 기존 fallback 유지 |
| timeWarp owner | G/P/map identity 및 stage/mw/mh/Boolean(arena)를 producer/consumer 첫행에서 비교. 다른 map 또는 arena 값이면 idx/filled0 |
| 새 기록 | 같은 stage/G/P여도 복원 map 교체는 새 공간. 기존 300buffer·최소10record를 새 공간에서 다시 채운 뒤 소비 |
| 변경하지 않은 권한 | EXP/자원/사망·시간/문/적/아이템 진행·진입조건·재도전/save 변경0 |

이는 실제 main 전역 시간왜곡 수명 보정이며 CH1 전용 또는 URL opt-in이 아니다. 이전 문서의 field backup 보존은 과거 arena/field 좌표 기록의 재사용 허가가 아니다. 실행 비용식은 기존 50+5×(lv−1) 그대로이며 Lv20=145로 DPS·유니크 표만 동기화했다. 기존 코드의 150 주석은 실행값 권한이 아니다.

최종 source working4,113,146B/`30b33fab3c562cd2c98baa545954d0b79a4ee67be4a63d32d866da91987ed770`. 통제 actual wholefunction CPU Node1/VM13·7그룹74PASS/exit0은 이전 원소스 Node1/VM1 반례관측과 별도다. 실제 보스 진입/사망/귀환/시간왜곡 native 검수0, Chrome0·IAB13 old-loaded 무조작·새 시각평가 없음/전체 **RETOUCH**. 실제 pause/hidden 및 rejection 집계 인수0. 상세는 [2_1 정본](<../2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md>) 같은 TASK 절을 따른다.

기존 필드 진행/좌표/배열 복원 및 재도전 권한은 그대로다. 이번 보충은 map identity가 교체된 뒤 남은 보스 인트로 표시의 소비만 중단하며 restore 함수 내부를 바꾸지 않는다.

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
