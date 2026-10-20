# MAPLOOK-HOLE REPORT

## ① 원본 근거 / 디자인 의도

| 항목 | 근거·불변 경계 |
|---|---|
| 기준 | worktree `G:\exoduser-wt\codex-maplook-hole`, branch `codex/maplook-hole-pc-20261020`, 시작 `e556b617190c325ca39f5add04357f5dea5ca87e`. tracked INDEX/WORK clean 확인·fetch만 실행, main merge/checkout 없음 |
| 위치·크기 | `game.html:30486~30522,30574~30599,30681` 배치 → 실제 owner가 기록한 `G.spawnHoles`. 렌더 직경 `52622`: `150 + size*150` |
| 트리거·제거 | `35647~35653` `_triggered`·90틱, `35687~35691` 완료 제거. 모듈은 읽기만, 스폰·타이머·수명·처치 분모·RNG 변경 없음 |
| 기존 렌더 | `52616~52642` void_black 시트·확대 글로·라벨을 기존 owner가 계속 그림. 이 작업은 원본 이식이 아닌 사용자 승인 강화 표시 |
| 레퍼런스 원리 | 밝은 중심 구 대신 검은 음공간·어두운 자주/핏빛 림, 국소 위험만 읽히는 명암 계층. 서로 다른 위상의 느린 생체 호흡→소환 중 빠른 호흡, 중심으로 가속하는 긴 먼지 흐름. PoE2/No Rest의 생동감·명암 원리만 적용, 고유 자산·코드 반입 없음 |
| 광원 | module은 **unshaded + blend_mix / light_mask=1**, 별도 광원0. CanvasModulate .30에 코어/림이 이중 감광되지 않는 자체발광 표면(기존 CanvasLayer 후처리까지 면제되는 것은 아님). 총괄의 보랏빛 PointLight(.62,.10,.34)는 주변 바닥·소품을 비추는 역할, 이 모듈은 생성/수정하지 않음 |

설계·정확한 표시 수치: [MAPLOOK_HOLE_20261020.md](../../../4.1맵디자인+설정/MAPLOOK_HOLE_20261020.md).

## ② 변경 파일 / 설치

| 파일 | 변경 |
|---|---|
| `godot/scripts/maplook/spawn_hole_fx.gd` | 실제 state/G 읽기·고정 seed·identity 유지·트리거 보간·제거 fade·복제 snapshot. 한 world 자식 아래 자기 mesh만 |
| `godot/assets/vfx/maplook_spawn_hole.gdshader` | 연속 림 변형·어두운 코어·사라지는 비동기 림·굴당7개 흡입 streak. 스크린 텍스처 복사 없음 |
| `godot/tests/test_maplook_hole.gd` | actual Main 14개·실좌표/직경·RNG 무소비·G/map 불변·기존 canvas 불변·광원0·splice/fade/재등장·snapshot 복제 검사 |
| `godot/tests/capture_maplook_hole.gd` | actual Main 실창1920×1080, 목표(3780,6220), 전/후·시퀀스·1x 크롭·동일 정지 장면 10초 A/B |
| 관련 docs | 작업판·맵 개선 프로젝트/SSOT 인덱스·소환굴 문서·VFX 마스터·CHANGELOG_SYNC·이 보고서·표시 계약 |
| 공용/보호 파일 | main/world/player/hud/native_screen_lighting/native_spawn_hole_system/native_map_look/native_source_new_run_state **직접 변경 각각0줄**. map.json·세이브·Q/E·레슨·docs/2_3 불변 |

총괄 설치 한 줄(아직 제품 연결 안 함):

```gdscript
preload("res://scripts/maplook/spawn_hole_fx.gd").install(world, map_data, player)
```

## ③ 검증 명령·실측·원로그

출력 루트: `G:\exoduser-wt\_out\MAPLOOK-HOLE-pc\`. 실행 전에 tasklist의 Godot 이미지 수 확인, 2개 이상이면 30초 대기. 실제 작업은 동시 Godot가 0개로 줄어든 뒤 실행. 사용자 프로세스 종료·서버3333 조작 없음.

```text
bash C:/Users/심도진/AppData/Local/Temp/claude/G--exoduser/01df6303-6873-40fb-a2e6-1c93fb00612e/scratchpad/run_godot_tests.sh G:/exoduser-wt/codex-maplook-hole/godot G:/exoduser-wt/_out/MAPLOOK-HOLE-pc/green test_maplook_hole:EXODUSER-MAPLOOK-HOLE-PC-Isolated-20261020
Godot_v4.7.2-stable_win64_console.exe --headless --path G:/exoduser-wt/codex-maplook-hole/godot --import
Godot_v4.7.2-stable_win64_console.exe --path G:/exoduser-wt/codex-maplook-hole/godot --audio-driver Dummy --position 4000,4000 --rendering-method gl_compatibility --resolution 1920x1080 --script res://tests/capture_maplook_hole.gd
```

격리: 테스트/캡처 `EXODUSER-MAPLOOK-HOLE-PC-Isolated-20261020`, 기존 회귀는 각 테스트의 지정 이름. override.cfg 실행 뒤0byte, 커밋 제외. 캡처 출력은 환경변수 `MAPLOOK_HOLE_OUT`. 전체 gate/실행 wrapper는 산출물 `run.cjs`(비제품/비커밋).

| 실행 | 실제 결과 | 로그 |
|---|---|---|
| 테스트 초회 | test 타입추론 parse error1(detached 사전 타입 누락), 실행되지 않은 검사. 타입만 명시 후 재실행 | `red/*.log` |
| TDD RED | checks2/failures1: 모듈 부재 의도한 실패 | `red-valid/*.log` |
| import 1회 | exit0 | `import/engine.log` |
| 신규 actual Main | **67검사/0실패**, errLines0. 테스트 fixture 정지 상태, 자연 플레이 증거 아님 | `green/test_maplook_hole.{out,err}.log` |
| 실창 1차 | exit0·full/1x PNG 각5. 림이 시트와 떨어져 보여 **RETOUCH**. 밑바닥 줄무늬·기존 라벨은 원본 그대로 | `visual-01/engine.log`, PNG, `capture_result.json` |
| 1차 성능 | OFF 10.001175초/2716표본 평균3.6823/최대81.675ms, ON 10.000300초/10715표본 평균.9333/최대7.251ms. 큰 순서·워밍 편차로 **성능 개선/예산 PASS 근거로 사용 안 함** | `visual-01/capture_result.json` |
| 2차 실창·성능 | exit0. 림 접합은 개선됐으나 먼지 가독성 추가 보강. 첫 OFF 평균63.7086ms/최대194.049ms와 뒤 OFF 평균1.0459ms가 크게 달라 **예산 판정 제외**. 원로그 보존 | `visual-02/engine.log`, PNG, `capture_result.json` |
| 3차 최종 실창 | exit0, SCRIPT ERROR0, full/1x 각5(기준·대기2·소환2). 모든 PNG save_error0,1920×1080. benchmark 전후 실제 G 동일 | `visual-03/engine.log`, PNG, `capture_result.json` |
| 소환굴 원본 회귀 | `test_p3002_spawn_holes` **6그룹·298단정/0실패·SKIP0**, exit0·ERROR0. 실제14굴 완료·168스폰, 실제액터10/unported158(기존 정직 정지 유지) | `regression-holes/test_p3002_spawn_holes.{out,err}.log` |
| 초기 상태 회귀 | `test_native_main_source_starter_state` **5그룹·148검사/0실패**, exit0·ERROR0 | `regression-starter/test_native_main_source_starter_state.{out,err}.log` |
| 계약 회귀 | `test_contracts` **5그룹 통과/실패단정0**, exit0·ERROR0 | `regression-contracts/test_contracts.{out,err}.log` |

후속 실제 실행 명령(각각 기존 테스트 격리 이름, wrapper 안에서 위 지정 bash helper 호출):

```text
C:/nvm4w/nodejs/node.exe G:/exoduser-wt/_out/MAPLOOK-HOLE-pc/run.cjs tests regression-holes test_p3002_spawn_holes:EXODUSER-P3002-Isolated-20261020
C:/nvm4w/nodejs/node.exe G:/exoduser-wt/_out/MAPLOOK-HOLE-pc/run.cjs tests regression-contracts test_contracts:EXODUSER-MAPLOOK-HOLE-PC-Isolated-20261020
C:/nvm4w/nodejs/node.exe G:/exoduser-wt/_out/MAPLOOK-HOLE-pc/run.cjs tests regression-starter test_native_main_source_starter_state:EXODUSER-MainSourceStarter-Isolated-20261014
```

성공한4종 합계 **513개 단정/검사 실패0 + contracts5그룹 실패단정0**(contracts 그룹을 단정 수에 합산하지 않음). 기존 Camera2D physics interpolation 경고는 Main 실행 로그에 보존하며 경고0이라 주장하지 않는다. 원본 RNG·기존 테스트 기대값·halt 검사를 변경하지 않았다. 최종 소스4개 SHA-256은 산출물 `source_manifest.json`, 보고서 구현 SHA는 아래④에 기록한다.

1차 이후 림 반경 .91→.82, 굴 원본과 겹치는 폭 .065·lip폭 .13, y배율1.38→1.10, 외곽선 감쇠 .10~1.0·먼지 길이/폭/명도 보강. 전체 화면 굴절 대신 국소 윤곽 왜곡이라는 경계는 그대로다. 성능 하니스는 완료된 렌더 프레임 신호 기준·조건마다3초 워밍·OFF/ON/ON/OFF 각10초로 보강(순서 편향 줄임).

### 최종 캡처·1x·성능

최종 폴더: **`G:\exoduser-wt\_out\MAPLOOK-HOLE-pc\visual-03\`**.

| 목적 | 실제 캡처 파일·검수 |
|---|---|
| 비교 기준 | `baseline.png`, `baseline_1x.png` — 원본 시트/라벨 유지, 추가 module만 숨김 |
| 트리거 전 | `idle.png`, `idle_1x.png`, `idle_sequence.png`, `idle_sequence_1x.png` |
| 소환 중 | `summoning.png`, `summoning_1x.png`, `summoning_sequence.png`, `summoning_sequence_1x.png` |
| 1x 원좌표 | 1920×1080 원본에서 **x760/y210/w400/h300** 무보간 크롭. 굴 중심 실제 화면(960,360), 월드(3780,6220). 이미지 확대·AI 보정 없음 |
| 육안 판정 | 검은 중심·어두운 자주/핏빛 끊어진 림·희미한 긴 흡입 흐름이 읽힘. 1차 분리된 외곽선은 원본 시트와 겹치는 림으로 개선. 밝은 점/디더 추가0, 자기 노드는 지면 z대역이라 플레이어/HUD 위를 덮지 않음. 국소 작업자 판정 **PASS**, 전체 맵/총괄 광원 통합 승인과 구별 |
| 별도 화면 관측 | 최종 소환 full 샷에서 HUD 구슬 내부가 빈 프레임으로 보임(대기 샷에는 표시). 모듈의 HUD 접근/프로퍼티 변경은0이며 fixture 정지·수동 source 진행 중 관측이다. 원인 미분리, HUD 정상 플레이/전체 화면 PASS 주장 안 함. 다른 담당 HUD 코드는 수정하지 않음 |
| 움직임 보조 수치 | 최종 1x의 [25,10,375,275] ROI, RGB 차이: 대기 시퀀스 changed23622px/max33/평균.2463, 소환 changed32082px/max46/평균.6918(0~255). 전체 움직임 양 증명만, 모든 변화가 먼지라고 주장하지 않음. PIL 읽기 전용 `motion_probe.py` |

캡처는 Main/소환굴을 실제 부팅하고 플레이어(3780,6400)·카메라를 이동한 **연출 fixture**다. 기존 시뮬레이션 자동 진행은 정지시키고 owner.advance_native(1.0)를121회 호출해 실제 근접 트리거·90틱 지연·첫 소환을 진행한다. 최종 capture seed20261020 고정. 최종 owner 관측 triggered5/spawned5/actual actor0/unported5(정직 정지). 정상 플레이 전체 이식 증거 아님. 초회와 실제 액터 수가 다른 것은 테스트 seed 고정 전/후 차이이며 모듈의 RNG 소비로 바꾼 결과가 아니다.

캡처용 CanvasModulate(.30,.31,.34)·플레이어 등불반경560/색(1,.70,.46)만 추가. **총괄 소환굴 광원 통합본이 아님**. 별도 소환굴 광원은 capture/module 모두0.

### 성능 (최종 3차, 같은 정지 장면)

AMD Radeon RX 9070 XT / OpenGL Compatibility /1920×1080, source/G·적·카메라 동일. 실제14개 기록 중 이 카메라에서2개 표시. 초기10초 ON 워밍 후 조건마다3초 워밍, OFF/ON/ON/OFF 각10초. VSync OFF·엔진 FPS cap 해제. Engine process frame 번호 중복 제외, process_frame 이후 [RenderingServer.frame_post_draw](https://docs.godotengine.org/en/latest/classes/class_renderingserver.html#class-renderingserver-signal-frame-post-draw)까지 기다린 **완료 렌더 프레임 간격**(OS/다른 작업 지터 포함). GPU 단독 처리시간이나 정상 플레이 FPS가 아니다.

| 순서 | 초 | 실제 frame 번호 증가 / 표본 | 평균 ms | 최대 ms | p95 ms |
|---|---:|---:|---:|---:|---:|
| OFF A1 | 10.000014 | 9813/9813 | 1.019058 | 4.224 | 2.986 |
| ON B1 | 10.002421 | 9020/9020 | 1.108916 | 5.328 | 2.855 |
| ON B2 | 10.002467 | 8714/8714 | 1.147862 | 5.714 | 3.008 |
| OFF A2 | 10.000385 | 9861/9861 | 1.014135 | 4.904 | 2.965 |

동일 길이 두 구간의 평균: OFF1.016596 / ON1.128389 → **추가평균 +0.111792ms (≤0.5ms)**. 평균 예산은 이 장면에서 충족. 관측 최대 OFF4.904 / ON5.714 → **최대 편차 +0.810ms**; 최대/모든 프레임까지0.5ms를 보장하지 않으며, 최악 지연의 원인이 모듈인지 OS/동시 작업인지는 미분리. raw에 TIME_PROCESS 모니터 값도 보존했지만 CPU/GPU 비용 판정으로 대체하지 않았다. 소환굴14개가 모두 화면에 들어오는 확대/다른 플랫폼/총괄 조명 통합본은 미측정.

임시 수동 force_draw/force_sync 하니스 방안은 실행본으로 채택하지 않았고, 최종 캡처 소스는 위에서 실제 검증한 frame_post_draw 방식이다. 통과한 신규67검사를 불필요하게 반복하지 않았으며, 셰이더 가독성 변경은 실제 렌더로 재검증했다.

## ④ 커밋·원격

| 단계 | 실제 SHA·확인 |
|---|---|
| 구현·검수 커밋 | **`2d4a6ed792350e453f320a5a5969665bbc335fe8`**, 16파일·608추가줄. 제품 신규 module96줄/shader52줄, 공용 제품 파일0줄 |
| 원격 보존 | `git push origin HEAD` 성공 후 `git ls-remote --heads origin codex/maplook-hole-pc-20261020`가 위 구현 SHA와 일치. push 전 해당 원격 branch 미존재 확인(새 branch 정상 생성) |
| 보고서 후속 커밋 | 이 보고서④에 실제 구현 SHA를 기록하는 docs-only 커밋을 같은 branch에 추가·push한다. 자기 SHA 순환을 피하며 최종 docs HEAD/원격 read-back은 최종 응답에 별도 보고 |
| index/work | 경로 지정 `git add --`, tests/uid만 `git add -f --`. commit hook이 바꾼 `tools/guard.baseline.json`은 **비커밋·미복구로 남김**, 자기 제품 변경과 분리. override.cfg0byte 확인·비커밋 |
| 금지 경계 | main push/merge/branch 전환·본 폴더 변경 없음. 테스트 통과 반복 없음. stdout/stderr 실패 원로그 전부 산출물에 보존 |

## ⑤ 남은 것

- 총괄 설치·보랏빛 광원 통합 후 G8/전체 맵 시각 승인. 현재 독립 강화 표시이며 기본 실행 미연결.
- 실제 정상 플레이·밀집 전투·완주·저사양/Mac 성능·장시간 검수는 미실행. 정지 fixture 실창 검수와 구별.
- 소환 fixture full 샷의 HUD 구슬 내부 빈 표시 관측은 미진단이며, 총괄 자연 플레이 통합 검수에서 별도 확인 필요. 국소 굴 크롭 승인과 구별.
- P2-008b 적 이식은 사용자 전환 지시에 따라 중단. 이전 브랜치 변경을 이 브랜치에 가져오지 않음.

## MAP PRODUCTION REPORT (§23)

| 항목 | 이번 국소 패스의 범위·판정 |
|---|---|
| STAGE / MASTER | CH1-1 썩은 숲; silhouette/region/main route/side spaces 기존 불변 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH 불변. 외곽 mass 재설계 아님. major holes=원본 실제 소환굴14개 표시만 |
| LARGE / MEDIUM | 기존 void_black owner 유지·새 이미지/배치/오버랩/접합/실루엣 반복 수정0 |
| GROUND | 코어 음영·림 연속 변형·흡입 흐름으로 원본 굴의 접지/활동 표시 강화 |
| PLAYABLE | arena/travel/breathing/threat 공간·충돌·동선 불변. 정지 카메라에서 플레이어·바닥 위협 계층 확인 대상 |
| LANDMARK | primary/secondary/tertiary 구성 불변. 새로운 대형 랜드마크 아님 |
| CAMERA QA | EARLY (3780,6220) 전/중+1x. START/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 이번 작업 미검수 |
| TECH QA | route/collision/geometry 데이터 무수정. 신규67/0·소환굴298/0·starter148/0·contracts5그룹/0. pageerror/404는 브라우저 아님=N/A. seam/전체 맵 로딩 미검수. 추가평균+.111792ms, 최대 편차+.810ms(원인 미분리) |
| FILES | 독립 module/shader/test/docs만. concurrent touched0, unrelated touched0(guard hook baseline 제외·비커밋) |
| GIT | 자기 branch만, main/다른 WT 변경0, deploy없음 |
| VISUAL VERDICT | **국소 작업자 PASS / 총괄 통합 미검수**. G1 음공간·G2 가독·G3 톤·G4 시퀀스·G5 신규 잔점 없음·G6 불변 경계 확인. G7 평균만 예산충족/최대지연보장 아님. G8 소환굴 PointLight 통합은 총괄 미검수 |
| NEXT PASS | 총괄 설치·공동 조명·자연 플레이·G8 통합 판정 |
