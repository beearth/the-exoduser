# MAP IMPLEMENTATION ROADMAP — EXODUSER: HELL LORD

> **역할**: 세미 오픈월드 맵 시스템의 단계별 구현 순서. 각 PHASE는 **한 세션에서 끝날 크기**로 독립 분리(§14 Task 규격).
> **원칙**: Existing system first → Minimal extension second → Rewrite last.
> **상태**: 2026-08-23 초판. 코드 변경 없음. **기획 승인 후 PHASE 1만 착수.**
> **선행 게이트**: 각 PHASE는 이전 PHASE의 PASS + 성능 봉인(평상시 140fps / 700마리 60fps / 격전 17ms 55fps) 미악화가 조건.

---

## PHASE 순서 요약

```
P0  Documentation / baseline lock        ← 현재 문서 세트 (완료 대기)
P1  Playable geometry / collision boundary
P2  RIM / OUTER separation
P3  Zone system (데이터)
P4  Enemy spawn / AI boundary
P5  Combat zone lifecycle
P6  Minimap integration
P7  Giant boss presence (배경 표현)
P8  Boss arena runtime
P9  Gate / loading / transition
P10 Art dressing
P11 Performance
P12 Regression / QA
```

각 PHASE는 CH1 vertical slice(si0) **단일 스테이지만** 대상. CH2~7 확산은 CH1 P1~P12 통과 후 별도.

---

## PHASE 0 — Documentation / baseline lock
- **GOAL**: 월드/규칙/런타임/CH1/로드맵/QA 6문서로 SSOT 확정, 충돌·갭 기록.
- **INPUT**: 코드+docs 전수 조사(완료).
- **CODE SCOPE**: NONE.
- **NON-GOALS**: 구현·에셋·밸런스 일절.
- **IMPLEMENTATION IDEA**: 본 문서 세트.
- **RISKS**: 낮음. 유일 리스크 = 유저 미확정 항목을 LOCKED로 오기.
- **TEST**: 6문서 존재 + 참조 정합 + UD 목록.
- **PASS**: 유저가 UD-MAP-01(크기), UD-MAP-02(보스참조) 확정.
- **ROLLBACK**: 문서 삭제(코드 무영향).
- **NEXT GATE**: 유저 기획 승인.

## PHASE 1 — Playable geometry / collision boundary
- **GOAL**: CH1 si0에서 실제 PLAY 영역과 외곽(RIM/OUTER)을 런타임에서 명확 분리. invisible wall 체감 제거.
- **INPUT**: `CH1_VERTICAL_SLICE.md` 존 타일박스, `isW`/`_fillVoidWithFloor`.
- **CODE SCOPE**: si0 한정. `_MAP_COMPOSE[0]` 데이터 확장 or RIM 오브젝트 배치(비침습). isW 로직 **불변**.
- **NON-GOALS**: minimap/enemy AI/boss/art/CH2~7 금지.
- **IMPLEMENTATION IDEA**: 맵 경계를 RIM 오브젝트(절벽/뼈 — 충돌메타 or 시각만)로 두르고, 경계 밖은 기존 `[EDGE-FADE]`(9801) 유지. PLAY walkable은 tileRLE 그대로.
- **RISKS**: 경계 오브젝트가 PLAY 침범 → 통행 차단. `_colObjs` 재빌드 비용.
- **TEST**: 디버그로 intended PLAY 전역 도달 / OUTER 진입 불가 / 콜리전 회귀 없음.
- **PASS**: intended space accessible, outer inaccessible, no collision regression, debug validation complete.
- **ROLLBACK**: 데이터/오브젝트 제거(git checkout game.html).
- **NEXT GATE**: PLAY/RIM 경계 확정 + isW 회귀 0.

## PHASE 2 — RIM / OUTER separation (렌더)
- **GOAL**: OUTER 배경(원경 실루엣/깊이) 렌더 재활성으로 세계 스케일 확보.
- **INPUT**: 비활성 패럴랙스 config(`game.html:9631–9636`, `_bgLayers=null` @43539), Vista 경로(9725).
- **CODE SCOPE**: 배경 렌더 조건부 복구(si0). 패럴랙스 or Vista 택1.
- **NON-GOALS**: PLAY 콜리전 변경, 보스, minimap.
- **IMPLEMENTATION IDEA**: `_bgLayers`를 si0에서 조건부 활성, 저해상도 캐시 캔버스 1~2장 drawImage(엔티티당 draw 아님). 저채도 후퇴.
- **RISKS**: draw 증가 → 프레임 회귀. 패럴랙스-바닥 정합 드리프트.
- **TEST**: `?perf=1`로 [FRAME HITCH]/draw 카운트 비교(전/후).
- **PASS**: OUTER 가시 + 성능 봉인 미악화 + 바닥/경계 정합.
- **ROLLBACK**: `_bgLayers=null` 복구.
- **NEXT GATE**: 성능 델타 승인.

## PHASE 3 — Zone system (데이터)
- **GOAL**: START/CORRIDOR/COMBAT/SIDE/EVENT/MINIBOSS/BOSS/GATE + PLAY/RIM/OUTER를 데이터로 태깅(코드 시스템 최소).
- **INPUT**: `_MAP_COMPOSE`, 미사용 `fm.zones`.
- **CODE SCOPE**: `_MAP_COMPOSE[0].zones` 필드 추가(읽기 전용 메타). 게임플레이 영향 0.
- **NON-GOALS**: zone 기반 스폰/AI 변경(→ P4/P5), 렌더 변경.
- **IMPLEMENTATION IDEA**: 존 = `{tag,x0,y0,x1,y1}` 배열(CH1 타일박스 그대로). 비침습 read-only.
- **RISKS**: 낮음(데이터만). 오탐 시 후속 PHASE 오작동.
- **TEST**: 디버그 오버레이로 존 박스 시각 검증 = CH1 초안 좌표 일치.
- **PASS**: 존 데이터 로드 + 좌표 정합 + 게임플레이 diff 0.
- **ROLLBACK**: zones 필드 제거.
- **NEXT GATE**: 존 좌표 확정.

## PHASE 4 — Enemy spawn / AI boundary
- **GOAL**: 적 스폰/AI가 PLAY(및 COMBAT 존) 경계 준수, RIM/OUTER 탈출 0.
- **INPUT**: `mkEn`/`spawn*`/`canMv`/`safePt`, P3 존 데이터.
- **CODE SCOPE**: 스폰 위치를 COMBAT 존 우선으로(기존 `canMv` 게이트 유지). AI 경계 = 기존 isW.
- **NON-GOALS**: 밸런스(수량/난이도) 변경 금지, boss 금지.
- **IMPLEMENTATION IDEA**: `spawnTileRLEEns`/`spawnHoles`가 COMBAT 존 내부 우선 배치(존 데이터 참조). 이미 `canMv` 게이트라 경계 보장.
- **RISKS**: 스폰 밀도 편중, 존 밖 소외.
- **TEST**: 적이 RIM/OUTER로 넘어가지 않음, COMBAT에 집중, 수량 봉인 유지.
- **PASS**: spawn 정상, 배경 탈출 0, 밸런스 diff 무.
- **ROLLBACK**: 스폰 존참조 제거.
- **NEXT GATE**: 스폰 분포 승인.

## PHASE 5 — Combat zone lifecycle
- **GOAL**: COMBAT 존 진입→전투→클리어 리듬(선택적 봉인/개방).
- **INPUT**: P3/P4, 기존 게이트(80% 처치) 로직.
- **CODE SCOPE**: 존 진입 트리거 + (선택) 임시 봉인. 기존 stageClear/게이트 미변경.
- **NON-GOALS**: 보스, 미니맵.
- **IMPLEMENTATION IDEA**: 존 진입 시 이벤트 훅(적 활성/사이드 개방). 기존 `checkRooms` 흐름 재사용.
- **RISKS**: 봉인 소프트락, 진행 정지.
- **TEST**: 존 클리어→다음 개방, 소프트락 없음.
- **PASS**: 리듬 성립, 진행 막힘 0.
- **ROLLBACK**: 훅 제거.
- **NEXT GATE**: 리듬 승인.

## PHASE 6 — Minimap integration
- **GOAL**: 미니맵에 보스게이트/이벤트/사이드포켓/상승통로 마커 추가(세계 가독성).
- **INPUT**: `drawMM`(51400), 존 데이터, `G.exits`/`bossGate`.
- **CODE SCOPE**: `drawMM` 마커 레이어 확장. `_mmCache` 정합.
- **NON-GOALS**: 미니맵 데이터소스 교체(G.map 유지), 신규 미니맵 시스템 금지.
- **IMPLEMENTATION IDEA**: 정적 마커(게이트/포켓)는 `_mmCache`에 베이크, 동적(플레이어)은 오버레이. DOM 안전규칙 준수.
- **RISKS**: 실제 공간과 마커 어긋남, 캐시 stale.
- **TEST**: 마커 위치 = 실제 좌표 일치, 스테이지 전환 시 갱신.
- **PASS**: minimap 실공간 일치, 마커 정상.
- **ROLLBACK**: 마커 레이어 제거.
- **NEXT GATE**: 좌표 일치 검증.

## PHASE 7 — Giant boss presence (배경 표현)
- **GOAL**: 탐험 중 거대 보스를 배경 실루엣/그림자/신체일부/소리로 존재감 부여(실 엔티티 아님).
- **INPUT**: MAP_OBJS(비충돌 실루엣), OUTER 레이어(P2), 보스 디자인(8.1).
- **CODE SCOPE**: 비충돌 배경 보스 오브젝트 타입 + 스크립트 프레즌스(오디오/셰이더). AI 엔티티 미가동.
- **NON-GOALS**: 실 보스전(P8), 밸런스.
- **IMPLEMENTATION IDEA**: OUTER에 거대 실루엣 draw + 근접 시 소리/그림자 이벤트. 성능 무부담(full AI 미가동).
- **RISKS**: draw/오디오 비용, 스케일 정합.
- **TEST**: 배경 보스 가시+청각, 성능 봉인 유지, AI 미가동 확인.
- **PASS**: presence 성립, 성능 미악화.
- **ROLLBACK**: 오브젝트/훅 제거.
- **NEXT GATE**: presence 연출 승인.

## PHASE 8 — Boss arena runtime
- **GOAL**: 배경 표현 → 실 보스 아레나 전환(기존 스왑 재사용).
- **INPUT**: `_enterBossArena`(25111)/`_preArenaBackup`/`genBossArena`(25059).
- **CODE SCOPE**: 진입 트리거를 배경보스 근접/게이트와 연결. 아레나 스왑 **로직 불변**.
- **NON-GOALS**: 보스 무브셋/밸런스(8.1 소관).
- **IMPLEMENTATION IDEA**: 배경보스 관문 밟기→기존 `_bossLoadPhase` 스테이트머신→아레나. 신규 프레임워크 없음.
- **RISKS**: 백업/복원 순서 붕괴, 상태 누수.
- **TEST**: 전환 정상, 사망 복귀, state leakage 0.
- **PASS**: 아레나 진입/이탈 정상, 백업 무결.
- **ROLLBACK**: 트리거 연결 해제.
- **NEXT GATE**: 전환 무결성.

## PHASE 9 — Gate / loading / transition
- **GOAL**: 층/스테이지 경계 로딩을 관문 은유로 시각화, 내부 무로딩 확인.
- **INPUT**: `showStageTransition`(53641), 게이트 스월, 스트리밍.
- **CODE SCOPE**: 관문 연출 + 로드 커튼 타이밍. `nextStage` 흐름 유지.
- **NON-GOALS**: 세이브 구조 변경.
- **IMPLEMENTATION IDEA**: 관문 오브젝트(성문/뿌리/승강) → 커튼 → 다음맵. 스테이지 내부 스트리밍 무로딩 재확인.
- **RISKS**: 커튼 타이밍/스트리밍 스파이크.
- **TEST**: exit 정상, next load 정상, 내부 무로딩, state leakage 0.
- **PASS**: transition 정상, 내부 seamless.
- **ROLLBACK**: 연출 제거.
- **NEXT GATE**: 로딩 경계 확정.

## PHASE 10 — Art dressing
- **GOAL**: RIM/OUTER/랜드마크 아트 배치(가독성 유지).
- **INPUT**: `_CH_DECO[0]`, `m_mega_ribs`, blueprint/minimap 참조.
- **CODE SCOPE**: 데코 배치 데이터. 콜리전 무영향(비충돌 위주).
- **NON-GOALS**: 신규 에셋 제작(별도), Y-sort/전경 occluder(planned only).
- **IMPLEMENTATION IDEA**: hand-placed rim props(초안 리스트), 개활도 65~72% 유지.
- **RISKS**: 장식이 PLAY 가독성 저해, draw 증가.
- **TEST**: 개활도 목표, 가독성, 성능.
- **PASS**: 가독성+개활도+성능 유지.
- **ROLLBACK**: 데코 데이터 제거.
- **NEXT GATE**: 아트 가독성 승인.

## PHASE 11 — Performance
- **GOAL**: 대형 존/OUTER/데코 추가분 성능 검증·최적화.
- **INPUT**: `?perf=1`([FRAME HITCH] 52143, [MAP STREAM SPIKE] 20351), `_PERF_PROF`.
- **CODE SCOPE**: 컬링/캐시/청크 튜닝(로직 회귀 금지).
- **NON-GOALS**: 봉인 워밍업(18540) 변경 금지.
- **IMPLEMENTATION IDEA**: OUTER 캐시캔버스, 청크 퇴거/합성 튜닝, MAP_OBJS 순회 상한.
- **RISKS**: 최적화가 렌더/충돌 회귀 유발.
- **TEST**: 봉인 기준(140fps/700마리 60fps/17ms 55fps) 전 항목.
- **PASS**: frame regression 0, map object 증가로 회귀 0.
- **ROLLBACK**: 튜닝 되돌림.
- **NEXT GATE**: 성능 봉인 통과.

## PHASE 12 — Regression / QA
- **GOAL**: 전 범위 회귀 검증(`MAP_QA_GATES.md`).
- **INPUT**: QA 게이트 전 항목.
- **CODE SCOPE**: 없음(검증). 발견 결함만 수정.
- **NON-GOALS**: 신규 기능.
- **IMPLEMENTATION IDEA**: Geometry/Combat/Navigation/Minimap/Transition/Performance 게이트 순회.
- **RISKS**: 잔존 결함.
- **TEST**: `MAP_QA_GATES.md` 전 항목 PASS.
- **PASS**: 모든 게이트 통과.
- **ROLLBACK**: 해당 PHASE 되돌림.
- **NEXT GATE**: CH1 슬라이스 완성 → CH2~7 확산 착수 판단.

---

## 14. 독립 Task 규격 (Codex/세션 분리용 예시)

```
TASK: MAP-P1-PLAYABLE-BOUNDARY
GOAL   CH1 vertical slice(si0)에서 실제 플레이 영역과 외곽 영역을 runtime에서 분리한다.
SCOPE  CH1 target stage(si0) only. game.html 편집(str_replace), 데이터/RIM 오브젝트 한정.
NON-GOALS  minimap 금지 / enemy AI 변경 금지 / boss 변경 금지 / CH2~7 금지 / art 변경 금지 / isW 로직 변경 금지
PASS   intended space accessible / outer inaccessible / no collision regression / debug validation complete
PASS 후 STOP.
```
- 각 PHASE는 위 형식으로 잘라 **한 세션 크기**로 발주. `INPUT`의 라인번호는 발주 시점 grep 재확인(파일 드리프트).

---

## 15. CODE CHANGE
**NONE.** 로드맵 기획 전용. 기획 승인 후 PHASE 1만 착수.
