# 지옥의 틈 현재 코드 읽기 전용 조사 · 2026-10-08

**최신 운영 결정: 자연플레이 홍보 녹화는 안정화 뒤 재개를 판단하되, 짧은 QA 컷을 활용한 개발단계 프리뷰 v0.1 공개는 허용한다.** 사용자 최신 지시 “아니면 버전0.1로 그냥 개발단계다”, “다음버전또올리면됨”, “물량많이허용·너무극혐저퀄리만아니면”을 따른다. 명백한 소실·뷰포트 변경·심한 끊김이 있는 컷은 제외하고 출처와 WIP 성격을 표시한다. **새 가로15초 WIP 개발일지는 별도 제작 중이며 아직 완성·게시로 기록하지 않는다.** 기존 가로34초·세로20초·Discord 파생본은 모션 QA FAIL로 게시 제외를 유지한다. 현재 런타임 원인은 미확정이며, 이 갱신은 버그 수정 완료 기록이 아니다.

관측 기준: 2026-10-08 15:05:51 KST, migration 체크아웃 `/Users/fordeargamers/Projects/exoduser-migration-20261001`, HEAD `474b9aae4d5454a12e62589044b9dfa7abf2943f`. 아래 경로는 모두 이 체크아웃 기준이다. 공유 작업트리는 다른 담당에 의해 변경될 수 있다. **사용자 IAB13의 query·로드된 소스·현재 배우·프레임 상태는 UNKNOWN**이며 기존 탭을 읽거나 조작·재로드하지 않았다.

AGENTS·운영메모리·MASTER 현재 머리말, 맵 가이드 v0.9 전체, `_MAP_SSOT_INDEX.md` 읽기 순서·현행 틈 포인터, `HELL_RIFT_2_5D_SLICE_20261006.md` 및 `DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 해당 계약을 선행했다. held STORY/WOLF 후보 파일 내용·해시·실행에는 접근하지 않았다.

## 적용 경로

`game.html:3579`의 exact origin `http://127.0.0.1:3387` + `ch1RiftView=1` opt-in → `game.html:3637–3646`의 `createMainRiftViewHost/openView` → `tools/2_5d/main-rift-host.mjs:7,249–250`의 동일 `tools/2_5d-world-lab.html` iframe + `main-character` + `view-only=1` → `tools/2_5d-world-lab.html:18`의 lab 모듈.

후보는 독립 world-lab와 이 iframe을 쓰는 **actual main 둘러보기**에 관련된다. 일반 main 전투 화면 `drawP`에 같은 원인이 있다고 확대하지 않는다. 현재 사용자 탭의 실제 실행 경로·소스는 미확정이다.

## 후보와 한계

| 후보 | 현재 코드 근거 | 확정하지 않은 점 |
|---|---|---|
| 전경 뒤 몸 가림 | lab `:447,665,672`는 actor·전경을 transparent/발 Y 순서/depthTest·write=false로 합성. `:455–456`의 fade는 발 좌표 AABB이며 OFF면 opacity1, ON·겹침이면 .32. terrain `:174–183` nav mask는 전경의 보행 픽셀 제거 | 발이 보행 영역이어도 상체와 비보행 전경의 화면 중첩 가능성은 남음. 실제 소실 프레임의 visible·전경·픽셀 관측 없음 |
| 막혀도 보행 포즈 지속 | lab `:419–433`은 목적점→X→Y 이동 가능성을 검사. `:435–444`는 실제 변위 대신 held 키 dx/dy를 pose에 전달. visual-pose-consumer `:105,133`이 입력으로 moving·walk/run 선택 | 벽에서 좌표가 정지해도 보행·관절 움직임은 지속 가능. 사용자가 본 왕복의 직접 원인은 UNKNOWN |
| 원화와 별도 관절 흔들림 | character-rigs `:228–240`은 torso/head/robe/arm/foot sin·cos 변형을 추가. `:264–270`은 mode 변경 때 elapsed=0 및 셀 선택. catalog `:40–43`은 poseStrength=.012/walk=.15s/run=.10s | 원화 셀 전환·추가 관절 변형·모드 전환 위상 초기화가 시각 떨림 후보. 실제 픽셀 떨림·원화 프레임 고유 이동·발 접지 미측정 |
| 특수모션 의도적 숨김 | lab `:449–450`은 special.active 동안 원 actor 숨김. baked-special-motion `:139`도 spec.hidden에 따라 대체 mesh 숨김 | lab `:712→189` 이동키는 special 취소·actor 복원. 일반 보행 소실 원인으로 확정 불가, 실제 special 상태 UNKNOWN |

위 표의 lab=`tools/2_5d-world-lab.mjs`, terrain=`tools/2_5d/rift-terrain.mjs`다. visual-pose-consumer=`tools/2_5d/visual-pose-consumer.mjs`, character-rigs=`tools/2_5d/character-rigs.mjs`, catalog=`tools/2_5d/character-rig-catalog.mjs`, baked-special-motion=`tools/2_5d/baked-special-motion.mjs`다.

충돌 코어 `tools/map-scene-core.js:145–151`은 중심+반경12 대각4점 타일 질의이며 좌표를 직접 수정하지 않는다. lab의 일정 방향 입력에서 반대 방향으로 밀어내는 보정 코드는 확인하지 못했다. 대각 충돌 시 X 우선 slide로 축이 바뀔 수 있으나 실제 왕복 재현은 없다.

방향은 lab `:427` 및 visual-pose `:50–53,90–94`에서 정수 키 벡터의 8방향으로 선택한다. 같은 키 벡터에서 부동소수 경계로 자동 방향 왕복한다고 볼 근거는 없다. 카메라는 lab `:466–467`에서 발을 고정 각도로 직접 추적한다. 실제 프레임 시간·GPU 부하·초점 손실은 미관측이다. character-rigs `:175`의 frustumCulled=false 때문에 actor frustum culling은 우선도가 낮다. 특정 후보를 반드시 수정해야 한다고 결론 내리지 않는다.

## 개발일지 공개와 자연플레이 촬영 기준

개발일지 v0.1은 개발단계/WIP임을 명시하고, 출처를 표시한 짧은 QA 컷 중 명백한 소실·뷰포트 변경·심한 끊김이 없는 구간으로 공개할 수 있다. 의미 있는 다음 버전은 후속 영상으로 기록한다. 기존 FAIL 편집본 전체를 공개 허용으로 승격하지 않는다. **아래 8~12초 연속 자연보행 gate는 향후 자연플레이 홍보 녹화에만 적용하며, 개발일지 v0.1의 게시 차단 조건이 아니다.**

향후 자연플레이 홍보 녹화는 개발 안정화 뒤 승인된 격리 환경에서 같은 source epoch을 명시한 **8~12초 연속 보행 원본**부터 확인한다. 사용자 열린 탭을 임의 재로드하지 않는다.

1. 직선·대각·벽 접촉·전경 앞뒤에서 몸 식별이 유지되고 의도하지 않은 소실·반짝임·미세 왕복이 없어야 한다.
2. 같은 프레임의 world 좌표/실제 변위·blocked·키/방향·mode/frame·actor.visible·special·전경 order/opacity·프레임 간격을 대조해 좌표 왕복/원화·관절 떨림/가림/렌더 끊김을 구분한다.
3. 원본과 편집본을 구분해 연속 화면을 직접 판독한 뒤 재개 여부를 판단한다. CPU PASS·앵커 일정·decode 성공만으로 시각 PASS를 선언하지 않는다.

## Source pin

| 파일 | bytes | SHA256 |
|---|---:|---|
| tools/2_5d-world-lab.mjs | 60594 | `3a5b3e650a99f36e5734d5539ea80e27f58d85f8a40315bb628951c2bd315960` |
| tools/2_5d/character-rigs.mjs | 23787 | `d666c9eb1a9aac11c224b496c8c025ef23a505030f931519392319d8f2c45f9a` |
| tools/2_5d/rift-terrain.mjs | 19118 | `9625933e3f2284f5084e6302c6d5fd2b07c9ff217d7f7804b4e6f39d92d76bc7` |

## MAP PRODUCTION REPORT · 가이드 §23

| 항목 | 이번 조사 |
|---|---|
| STAGE | 기존 Rift lab 및 actual main view-only iframe의 정적 후보 조사 |
| MASTER · silhouette/regions/main route/side spaces | 변경0·새 제작/인수0 |
| OUTER MASS · LEFT/RIGHT/TOP/SOUTH/major holes | 변경0·현재 화면 미관측 |
| LARGE · source/composites/overlap/repeated silhouette | 기존 지형·전경 소비 코드만 읽음. 원PNG·geometry·배치 변경0 |
| MEDIUM · connections/remaining holes | 변경0·새 검수0 |
| GROUND · shadow/contamination/integration | 변경0·해부학 발 접지 미검수 |
| PLAYABLE · arenas/travel/breathing/threat/combat readability | 정적 분석만. 새 보행·전투 실행0 |
| LANDMARK · primary/secondary/tertiary | 변경0·새 검수0 |
| CAMERA QA · START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT | 모두 이번 NOT_RUN/NOT_ASSESSED |
| TECH QA · route/collision/pageerror/404/seam/loading/performance | 실행0. 충돌 source 계약만 확인, 런타임 상태 UNKNOWN |
| FILES | migration 변경0. ROOT output 본 보고서1개 작성 및 사용자 최신 공개 기준 갱신. 타인 변경 보존 |
| GIT · staged/commit/push/deploy | 모두0 |
| VISUAL VERDICT | **기존 SSOT의 RETOUCH 유지. 이번 현재 런타임 새 시각 판정은 NOT_ASSESSED** |
| NEXT PASS | 개발일지 v0.1은 출처·WIP 표시와 명백한 결함 컷 제외 후 공개 허용. 새 가로15초는 제작 중. 자연플레이 홍보 재촬영은 안정화 뒤 8~12초 gate 적용. 기존34/20/Discord FAIL 게시 제외 유지 |
