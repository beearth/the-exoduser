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
- [ ] combat clear 정상 (80% 게이트 개방 35591, 클리어=보스 후 출구 도달 35626).
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
