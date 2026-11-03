> 2026-10-21 MAP11-30c 제품 카메라/캐릭터 후속: [축척·접지·검수 계약](../4.1맵디자인+설정/MAP11_30C_SCALE_INTEGRATION_20261021.md). 전투 source 도형/범위 보존, 카메라는 최대.8/근접source framing으로 변경. 아래 기존 차수 캡처/성능은 당시 이력.

# BOSS11-03 — 1-1 보스 카메라·예고 색감

기준 `cae5158026394499b4e9a6e5b378ca46385c7fe4`, branch `codex/boss11-03-20261021`. 변경은 그리기/카메라와 격리 검수만. PC 전투 코어·판정·피해·타이머·저장·번역 목록 byte 변경0, 새 에셋0. 기존 PID81277 보존.

## 결정한 현재 규칙

| 항목 | 값 | 근거/적용 위치 |
|---|---|---|
| arena zoom | .36 단일 값 | boss11_camera.gd. .28 대비 선형×1.285714, 기존 약20px→약26px. field .70, smoothstep1초, center weight.85, shake offset writer 불변 |
| 최대 slam | 원본 phase4 R1320 불변 | 지름2640×.36=950.4px. 900px 화면에 온전히 담는 이론상 최대 zoom=.340909 (HUD 제외 전). 요청 .36~.42 범위에서는 전체 수용 불가능하며 .36이 잘리는 양 최소. 패턴별 동적 zoom 사용0 |
| 채움 색 | RGB(1,.46,.24) | 뼈색에서 붉은 주황으로. 의식 원보다 밝은 주황 경계, 검은 ink 유지 |
| 채움 alpha | 미충전 .07, 충전 .17 | 이전 .16/.38보다 낮춰 바닥 대비 유지 |
| 충전/섬광 | RGB(1,.94,.72), 전면 alpha +.38 / 섬광 +.3 | 기존 +.16에서 충전 전면을 더 밝힘. 타이머/charge 계산/flash .12 구간 불변 |
| 외곽선 | 밝은 경계 alpha.95 / ink.94 | AA/폭4.5~3.5px,2.5~1.7px 불변; 궤적 alpha×.38 불변 |
| 화면 밖 표시 | 방향 화살표 길이11px, 반폭5px, ink6px+warm2px | boss11_screen_cues.gd. RGB(1,.74,.40,.95)/ink(.04,.02,.02,.92). 화면 x18/W-18, 상단125, 하단H-205. HUD 하단110px는 가림 영역으로 간주. 좌우 y100..H-215, 상하 x48..W-48로 제한 |
| 표시 범위 | 보수적 원/sector/ring bounds, 회전 strip AABB | mark pool32의 현재 값만 읽음. 실제 위험 밖의 방향을 표시하며 안전 통로/정확한 피해 경계 판정으로 쓰지 않음. 여러 mark는 같은 위치에 겹칠 수 있음 |
| 플레이어 발 | 검은 접촉 ellipse R9px, Y scale.42, rim RGB(1,.89,.64,.90),1.8px/32 segments | bind 시 기존 get_native_projection_metadata().world_foot을 actor local offset으로 캐시. 틱 snapshot/list/ResourceLoader/material 생성0. 경고가 있을 때 CanvasLayer6에서 채움 위에 그림. 기존 본체 rim 그대로 |
| renderer | 기존 공유 ShaderMaterial1개/Polygon2D32 | CanvasLayer+screen cue 노드는 ready1회 생성. 프레임에는 기존 mark/actor 좌표 읽기와 redraw만 |

## 검수 계약과 한계

`~/exoduser-wt/_out/BOSS11-03/captures/`에 slam/groundFissure/tideWave/projectiles/charge50% before-after 1600×900와 640×600 무리사이즈1x crop(480,150). before는 BOSS11-02의 after/charge50 PNG를 동일 byte로 보존한다. projectiles before는 그 커밋에 보존된 이전 .60 fixture 표본이며 .28 재촬영이 아니다. after는 .36에서 같은 5개 blue/green 대비 도형 재촬영. 자연 탄/패링/피해 테스트가 아닌 정지 구성 표본이다. charge50은 시간 중간 한 프레임이며 연속 타이밍 QA를 뜻하지 않는다.

눈 검수: .36에서 캐릭터 실루엣과 발 위치가 더 읽히고, 베이지 장막이 줄어 바닥의 붉은 질감이 보인다. 밝은 충전 경계/주황 외곽선은 의식 원과 분리된다. slam 하단 화살표와 fissure 우측 화살표 확인. tideWave 안전 틈은 채우지 않는다. 전체 slam을 담았다는 판정은 하지 않는다. fissure 종착은 외곽 나무에 일부 가리고, 캐릭터 크기는 약26px로 여전히 작다. **VISUAL VERDICT: RETOUCH** — 요청 범위 내 개선 확인, 전체 최대 원 수용/자연 전투 완성 인수 아님.

관련 visual contract 1회: 18 checks, failures0. 원본 enemy/G 불변·공유 material·각 timer·wave half-gap·변경된 camera midpoint/진입/복귀/shake 보존 확인. 기존18검사 기반이며 화면 밖 표시/발은 캡처 눈 검수로 확인. 로그 `test-visual.log`. 렌더 조정 중 첫 발 ellipse가 머리를 덮는 문제를 실제 source foot anchor 캐시로 수정, 최종 PNG에 반영했다.

성능과 Git SHA/원격 검증은 외부 DONE.txt에 기록. 단회 측정 실패 시 focus에 한해 최대1회 재시도. 실제 저장 폴더 사용0, 모든 Godot은 override.cfg의 EXODUSER-BOSS11-03-Isolated 사용. 자체 GUI/테스트/import Godot 동시1개, PID81277 종료0. 정상 hook/경로지정 add/비강제 자기 branch push, main 병합·push0.

운영 예외: 최초 fetch를 R cwd에서 수행하여 R 읽기 전용 지시를 위반했다. R tracked/INDEX/branch/HEAD 변경0이나 공용 Git remote refs/FETCH_HEAD가 갱신될 수 있다. 이후 worktree cwd 확인과 set-e를 사용했다.

## MAP PRODUCTION REPORT

| 항목 | 결과 |
|---|---|
| STAGE | CH1-1 boss camera/color only, guideline v0.9 전문 적용 |
| MASTER | silhouette/regions/main route/side spaces 불변 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH 불변, fissure 종착 가림 유지 |
| LARGE | 기존 atlas/assets/composites/overlap/repetition 불변 |
| MEDIUM | connections/holes 불변 |
| GROUND | contamination/structure 불변; 플레이어 contact 표시 추가 |
| PLAYABLE | arena/travel/breathing/threat geometry와 판정 불변; 전투 가독성 개선 |
| LANDMARK | primary/secondary/tertiary 불변 |
| CAMERA QA | ARENA 4패턴+charge50 표본. START/EARLY/SIDE L/SIDE R/LANDMARK/LATE/EXIT 범위 밖 |
| TECH QA | route/collision/seam 변경0, loading 정상, visual18 통과. 성능 외부 benchmark.json/DONE.txt |
| FILES | boss11 camera/shader/pool/reader/screen cues, 격리 capture/test, 관련 docs |
| GIT | 소유 경로만 stage/정상 hook/자기 branch push; SHA/제거는 DONE.txt |
| VISUAL VERDICT | RETOUCH: 가독성/바닥 분위기 개선, 최대 원 수용의 수학적 한계 명시 |
| NEXT PASS | 총괄 눈 검수로 .36 거리/기존 잔여 가림 인수 판단; 새 작업 자동 착수0 |

성능 최종: GUI 명목 arena, 1920×1080, 실제 Player 입력600틱(관측611틱), 자체 Godot1개+PID81277 공존. 최초 focus_lost1517 / 원시p95 8.324ms, 재시도 focus_lost1532 / 원시p95 8.170ms. 두 표본 모두 INVALID이므로 **유효 p95=N/A**, 성능 통과/악화 없음 미입증. 추가 재측정0. provider product_space=field인 arena view 명목 표본이며 자연 보스전 성능으로 확장하지 않음. 외부 benchmark.json/performance.log/focus-activation.txt 보존.
