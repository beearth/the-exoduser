# MAP QA GATES — EXODUSER: HELL LORD

> **역할**: 맵/레벨 구현의 최소 검증 게이트. 각 PHASE(특히 P12)와 모든 맵 변경 후 통과 필수.
> **상태**: 2026-08-23 초판. 코드 변경 없음. 근거 식별자는 `MAP_RUNTIME_ARCHITECTURE.md` 참조.

---

## 1. Geometry (공간 무결성)

- [ ] 모든 intended PLAY 영역 접근 가능 (`isW===false` 경로로 START→전 존 도달).
- [ ] OUTER 진입 불가 (RIM 경계 밖 walkable 0).
- [ ] 의도하지 않은 틈 없음 (PLAY 내 고립 셀 0, 연결로 끊김 0).
- [ ] 통로 최소폭 **10타일(400px) 이상** 유지 (CH1 LOCK).
- [ ] 사이드포켓 **2입구 유지** (막다른 길 0).
- **검증법**: 디버그 오버레이 walkable 맵 + 존 박스, 연결성 `_tValidateConnectivity`(23575) 참고.

## 2. Combat (전투)

- [ ] enemy spawn 정상 (COMBAT 존 내부, `canMv` 게이트 통과).
- [ ] 적이 배경(RIM/OUTER)으로 탈출하지 않음 (스폰/AI = isW 경계 공유).
- [ ] boss arena 정상 (`_enterBossArena` 진입/스왑/복귀).
- [ ] combat clear 정상 ([REGION] 2026-09-30: 4분면 지역 4곳 전부 클리어 시 게이트 개방 — 지역별 처치 80% + 게이트 지역 문지기 보너스 10%, CH1-1은 각 지역 담당 앵글러 사망 포함(`G._fbDone` 이중 안전망 유지). 소형 맵(한 변 180타일 미만 — 던전·소환굴·보스아레나) 폴백=구 전역 80% `checkRooms`. 클리어=보스 후 출구 도달).
- [ ] [REGION] 지역 시스템 정상 (입장 배너 히스테리시스 1.5타일/쿨다운 5s, 지역 클리어 배너 (N/4), 화면 가장자리 방향 화살표, 미니맵 십자선/딤/자물쇠/앵글러 마커, 빈 지역 자동 클리어로 데드락 0).
- [ ] 적 하드캡 700 유지 (`[ENS-CAP]` 28487), 밀도 봉인 미악화.

## 3. Navigation (동선)

- [ ] START → EXIT 도달 가능 (메인 루트 지그재그).
- [ ] side zone 진입/복귀 가능 (2입구 왕복).
- [ ] 길찾기 막힘 없음 (소프트락 0, 게이트 미개방 데드락 0).
- [ ] 시야 유도 성립 (넓은 전투장 방향 랜드마크/조명).

## 4. Minimap

- [ ] 실제 공간과 일치 (`drawMM` G.map 기반 51400, 스케일 정합).
- [ ] player marker 정상 (`_mmDrawPlayerMarker` 초상+방향 51366).
- [ ] boss/event/gate 위치 정상 **(PHASE 6 이후)** — 현재는 마커 미존재(갭).
- [ ] `_mmCache` 스테이지 전환 시 재빌드(stale 0).

## 5. Transition (전환)

- [ ] stage exit 정상 (출구타일 트리거 35606).
- [ ] next stage load 정상 (`showStageTransition`→`nextStage` 53750).
- [ ] state leakage 없음 (`_preArenaBackup` 복원, 풀 클리어, `_stageKills` 리셋 25870).
- [ ] 스테이지 내부 무로딩 (스트리밍 청크 무중단).

## 6. Performance (성능 봉인 — 절대 기준)

- [ ] 평상시 **140fps 이상**.
- [ ] **700마리 60fps**.
- [ ] 격전 폭타 **17ms / 55fps**.
- [ ] map object 증가로 frame regression 없음 (`_colObjs` 프리필터 유지).
- [ ] OUTER/데코 추가 후 draw 카운트 회귀 없음 (`?perf=1` [FRAME HITCH] 52143, [MAP STREAM SPIKE] 20351 비교).
- [ ] 청크 스트리밍 스파이크 없음 (퇴거/재합성 43605+, chunk build <16ms).
- [ ] 워밍업(18540–18584) 미변경.
- **검증법**: `?perf=1` 진입, 전/후 [FRAME HITCH]·[MAP STREAM SPIKE] 로그 수집, `_PERF_PROF`(51728) 필요 시.

---

## 7. 게이트 통과 규칙

- 각 PHASE 종료 시 **관련 섹션 전 항목 체크**. 하나라도 실패 시 그 PHASE ROLLBACK.
- Performance 봉인은 **모든 PHASE 공통 게이트** — 어느 PHASE도 성능 악화 시 진행 불가.
- 회귀 발견 시 신규 기능 추가 중단, 결함 수정 우선.

## 8. CODE CHANGE
**NONE.** 검증 기준 정의 전용.


---

## 2026-10-02 — 보스 사망 후 필드 진행 보존 (현행 재도전 계약)

§5 “_preArenaBackup restore/잔여 몹 full-clear/_stageKills reset” 체크는 무조건 초기화 판정이 아니다. 현행 분기별 Gate는 아래와 같으며 기존 자동 검사로 실게임/시각 Gate를 해제하지 않는다.

| Gate | 기대/증거 | 현재 인수 |
|---|---|---|
| 일반 arena 사망 | 진입 전 field 46key·적/오브젝트 상태·해금 복원, 적/오브젝트 재생성 없음 | actual source fixture에 한정 |
| 해금 완료 CH1-1 필드 사망 | currentfield capture/restore, 기존 플레이어 일시 상태 정리·자원 완충, stageTime/사망 통계 유지 | actual source fixture에 한정 |
| 정상 초기화 분기 | 해금 전 CH1-1/다른 일반 필드 initStage, demo si=3 직접 retry 선행 | actual source fixture에 한정 |
| 캐시/충돌 | MM context/bg queue 취소·hash/deadpool·MAP_OBJS collision·정적 조명/cache dirty | source fixture/소스 읽기; 실제 idle/GPU/첫 프레임 미검수 |
| 전체 source 회귀 | 30/30 PASS(양판15), 기존 자원 5/5 PASS(최종 후1회), inline12/importmap2구문 PASS | source만 |
| 실제 플레이/카메라/시각/오디오/성능 | 등록 이벤트·전체 루프·왕복 이동·게이트 통과·render 확인 필요 | 미실시/미인수 |
| 전체 맵 visual | 기존 MAP-020 RETOUCH 역사 판정 유지 | 이번 수정 새 visual PASS 0 |

[CH1-1 보스 사망 진행 보존 정본](CH1-1_BOSS_RESPAWN_PROGRESS_20261002.md)는 제작 가이드 §23 MAP PRODUCTION REPORT 전체 항목과 각 미검수 범위를 포함한다. `tmp/mac-migration-runtime/continued-review-20261002/boss-respawn-backup/receipt.json`를 증거로 연결하며 과거 baseline/중간 실패를 최종 PASS에 합산하지 않는다.
