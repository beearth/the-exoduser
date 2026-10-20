# LOOK-001 — 비교 자료 준비

작업ID `look-001` · 브랜치 `codex/look-001-20261020` · 제품 채택은 사용자 비교 판정 대기.

## 기준·재개와 보호 범위

- 재부팅 전 worktree HEAD `81de9c3ee156bc2d4ba67f94718ee666f9c5c4b7`와 미커밋 코드를 먼저 확인했다. `~/exoduser-wt/_out/look-001/resume-20261020/resumed-WIP.tar.gz` 및 tracked patch/status로 보존 후 fetch했다. 기존 WORK_BOARD WIP는 별도 Git stash에도 보존했다.
- fetch 시점 origin/main `284d7faf49295b2f5061937a47ce96038032ed3c`까지 정상 fast-forward했다. 이 SHA의 전략 문서 §5와 CLAUDE.md 퀄리티 절을 기준으로 진행했다.
- R `/Users/fordeargamers/Projects/exoduser-migration-20261001`의 파일 변경 0. 공용6파일·기존 테스트·원본 자산·project.godot·main.tscn·game.html 변경 0. 추가 코드는 기본 게임 진입 경로에서 참조되지 않는다. 보호 파일 SHA 대조는 `resume-20261020/code-ownership.json`.
- 정상 훅을 유지하며 자기 파일만 명시적으로 stage한다. PNG·import 캐시·실행 로그·가상환경·override.cfg는 커밋하지 않는다. main push·force·git add -A 없음.

## 토글·재현

저장소 루트에서 `./godot/run-look-001.command --mode A|B|C|D`로 선택한다. 생략 시 A. 영구 옵션·기본 실행 화면에는 손대지 않는다. C/D 렌더러 전환은 프로세스 재시작으로 수행한다.

| 안 | 렌더러·구성 |
|---|---|
| A | 기존 Main 2D·Compatibility, 강화 레이어를 생성하지 않음 |
| B | 기존 Main 위 파생 CanvasTexture normal·PointLight2D·LightOccluder2D·연속 안개·색보정. 원본 texture/material/visible 값을 교체하지 않고 별도 프록시와 가역 cull mask 사용 |
| C | 기존 원근 뷰 + 기존 authored mass. Metal Forward+, DirectionalLight3D 그림자·WorldEnvironment 볼류메트릭 안개·SSAO·glow |
| D | C와 같은 카메라/geometry/material/light 상수. Compatibility가 지원하는 일반 fog·방향광 그림자·단순 SCREEN glow. volumetric/SSAO/SSIL/SSR/SDFGI는 명시적으로 비활성 |

실행기는 작업 전용 lock으로 LOOK-001 Godot 동시 1개만 허용한다. 매 실행 직전 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`과 같은 프로세스 조건을 Python subprocess로 세며, 2 이상이면 30초마다 재확인한다. `process-guard.jsonl`에 실측 count를 남긴다. 2개로 관측된 대기도 로그에 보존했다. 실행 종료/예외 때 override.cfg를 0byte로 비운다. 신규 캡처·import 격리명은 `EXODUSER-look-001-Isolated-20261020`, 기존 회귀는 파일의 USERDIR 또는 ISOLATED_DIRECTORY를 사용한다.

파생 PNG는 `godot/assets/derived/look001/`에만 생성한다. `sources.json`·`manifest.json`·README와 `tools/look001_derive_normals.py`, `tools/look001_requirements.txt`로 재현한다. NumPy 1.26.4/Pillow 10.4.0, alpha 가중 luma → Gaussian sigma2 → 프레임별 Sobel/8 → strength2 → OpenGL normal. 원본 크기·알파 유지, AI 생성 0. 색 밝기에 기반한 재질 요철 추정이며 실제 높이·실측 기하가 아니다. 원본/출력19개와 도구 해시를 재개 후 전부 대조했다. 재부팅 전 selftest를 보존한 뒤 별도 `resume-20261020/normal-selftest/`에서 다시 실행해10항목 전부 통과했다(반복 byte·입력순서·atlas 프레임 격리·알파 보존·기울기 방향·평탄면 포함).

## 후보 조명·후처리 상수

| 적용 | 현재 값 |
|---|---|
| B ambient/key | ambient RGB(.80,.81,.80), key RGB(.95,.84,.67), player 기준(-680,-520), 반경1850·energy.90·높이220 |
| B player/torch/hole | player 반경520·energy.55·높이110, torch450·.72·90, spawn hole280·.32·45. PCF5·smooth2.5, shadow rgba(.015,.012,.01,.66) |
| B 재질·후처리 | specular RGB(.10,.095,.085)·shininess8, grade saturation.92·contrast1.04·RGB배율(1.025,1.005,.985), 안개 색(.16,.185,.19)·연속 sin veil·추가 난수0, post layer6/HUD10 |
| C/D key/fill | key 위치(-900,1500,-1100), RGB(.86,.80,.69)·energy1.05. fill(700,950,1100), RGB(.40,.44,.48)·energy.48. ambient RGB(.45,.43,.40)·energy.68 |
| C/D 그림자·재질 | shadow거리5000·opacity.60·blur1.5·bias.045·normal bias.65·4split. C angular size.12도(PCSS), D0도(지원 filtered shadow). floor roughness.94, mass.91 |
| C/D fog/glow/grade | 일반fog density.00006·RGB(.10,.115,.12), glow intensity.20·bloom.025·HDR threshold.82, brightness1.02·contrast1.06·saturation.86 |
| C 추가 기능 | volumetric density.00008·길이5000·albedo(.38,.40,.37)·anisotropy.35·ambient inject.18. SSAO radius44·intensity1.10·power1.25·detail.4·light affect.35 |

## 장면·캡처·측정 조건

- 실제 `scenes/main.tscn`의 정상 초기화를 사용한다. 초점 `(4020,7420)`, native frame0, 고정 seed20261020, 셰이더 TIME2초, 스프라이트 pose 고정, 시뮬레이션 틱 전진0. 같은 세계 중심이며 A/B는 동일 2D 카메라, C/D는 동일 기존 원근 카메라다. 원근에 따른 화면 범위 차이는 유지한다.
- 최신 기준 main game.html:16631의 `T=40`, 31564~31566의 시작방 선택·`(tile+.5)*T`를 그대로 따른다. 기존 map.json의 start room `(100,185)`가 `(4020,7420)`이다. 임의 게임 수치 재작성 0. 원본 행 발췌는 `resume-20261020/source-main-start-lines.json`.
- PNG는 OS 화면 캡처가 아닌 Godot `root.get_texture().get_image()`로 내부 viewport1920×1080에서 저장한다.
- Mac Apple M5 Pro·16GPU cores·24GB, Godot4.7.2 official ed1daf0bf. VSync off, 과부하 예방 공통120FPS 상한. 각 안은 렌더 준비 후 30초의 `RenderingServer.frame_post_draw` 벽시계 간격을 기록한다. 평균=전체 frame수/실제초, 최저(1초)=완료한 1초 bin 최저, 순간최저=가장 긴 frame간격의 역수.
- 정지 장면의 렌더링 수치이며 전투/AI/플레이 FPS가 아니다. 120FPS 상한에 닿은 안끼리의 무제한 처리량 우열은 판단할 수 없다. 동시에 다른 담당 Godot가 실행된 경우는 프로세스 count 로그로 남겼다.

## 실측·검수

| 안 | 실제 측정초 | 평균 FPS | 최저 1초 FPS | 순간 최저 FPS |
|---|---:|---:|---:|---:|
| A | 30.006385 | 120.041 | 119.872 | 50.625 |
| B | 30.000670 | 119.964 | 117.558 | 25.580 |
| C | 30.003650 | 120.019 | 119.728 | 83.001 |
| D | 30.007077 | 120.005 | 119.398 | 39.410 |

최저 FPS 두 정의를 함께 제공한다. 네 캡처 모두 exit0·capture_error0·stderr ERROR0, 기존 Camera2D interpolation 경고 각1개를 보존했다. B 수정 전 1차 결과는 `resume-20261020/B-before-ambient/`에 보존하며 위 표는 환경광 수정 후 재측정이다.

| 기존 회귀 | 실제 검사 | 실패 | exit |
|---|---:|---:|---:|
| test_contracts | 5 | 0 | 0 |
| test_p2002a_hud | 36 | 0 | 0 |
| test_p2003a_lighting | 12 | 0 | 0 |
| test_native_main_source_starter_state | 148 | 0 | 0 |
| test_native_main_sprite_readiness | 29 | 0 | 0 |
| test_native_source_update_clock_play_time | 30 | 0 | 0 |
| test_p1002g_kislash_hurte | 220 | 1 | 1 |

contracts의5는 그룹 수이며 나머지255검사 통과(36+12+148+29+30), p1002g는220중1실패다. 모든 회귀 stderr ERROR/SCRIPT ERROR0. HUD는 기존 Camera2D 경고 외 ObjectDB2개 잔존 경고, p1002g는 Camera2D와 ObjectDB4개 잔존 경고가 있다. 다른 Main 회귀는 Camera2D 경고1개씩이다. 실패/경고를 삭제하거나 전체 PASS로 합산하지 않았다.

**회귀 0 조건 BLOCKED**: p1002g `per_enemy_coverage`의 `no native_hurte_halt emitted across combat` 검사1실패, halt_count6. LOOK-001 코드/공용6파일/기존 테스트를 수정해 기대값을 완화하지 않았다. LOOK-001 scripts/tests 경로를 제외하고 기준 main tracked 코드/데이터의 Git object hash를 모두 대조한 별도 baseline 프로젝트에서도220검사·1실패·halt6·같은 그룹 결과를 재현했다(exit1). 큰 원본 texture/import는 symlink로 공유하며 editor/import는 실행하지 않았다. 신규 회귀 증가0으로 관측했지만 기존 실패를 PASS로 승격하지 않는다. 공용 수정은 담당에게 남긴다. 실제 원로그는 `resume-20261020/regression/`.


## 산출물·변경 파일

모든 바이너리·원로그는 `~/exoduser-wt/_out/look-001/`에 둔다.

| 파일 | 내용 |
|---|---|
| A.png / B.png / C.png / D.png | 각 안 내부 viewport1920×1080 |
| {A,B,C,D}-crop-player-contact.png | (800,440)~(1120,696), 320×256, 1x |
| {A,B,C,D}-crop-living-tree.png | (160,320)~(544,704), 384×384, 1x |
| {A,B,C,D}-crop-skin-ground.png | (1120,560)~(1504,816), 384×256, 1x |
| LOOK-001-grid-2x2-1x.png | A/B 위, C/D 아래. 원본 크기 타일3840×2288, 라벨64px씩, resample0 |
| {A,B,C,D}.json / *_frame_intervals_us.json | renderer·driver·상태·30초 raw intervals·FPS |
| *.stdout.log / *.stderr.log / *-command.json / *-exit.json | 실제 명령·실행 결과·경고 |
| sheet-manifest.json / resume-20261020/* | 크롭 좌표·해시·소유 검증·회귀·중단 WIP 백업 |
| DONE.txt | 최종 브랜치·SHA·수치·제출 상태 |

변경 파일: 신규 `godot/scripts/look001/look_2d_variant.gd`, `look_2d_fog.gdshader`, `look_2d_grade.gdshader`, `look_3d_variant.gd` 및 자기 UID; 신규 `godot/tests/capture_look001.gd`와 UID; 신규 `godot/run-look-001.command`; 신규 `tools/look001_run_compare.py`, `look001_derive_normals.py`, `look001_assemble_sheet.py`, `look001_requirements.txt`; 파생 폴더의 text manifest/sources/README; 이 보고서·CHANGELOG_SYNC 맨 위 절·WORK_BOARD 자기 행.

## 시각 판정·제약

1x 실제 화면을 직접 확인했다. B는 2D 구도/HUD를 유지하면서 지면·나무의 재질 조명 후보를 제공한다. collider footprint를 16각형으로 근사한 그림자라 artwork 실루엣/높이 기반 차폐와 다르다. 시작점 선택 범위에 실제 횃불이 없어 횃불 광원 수는0이며, 실제 authored torch를 만났을 때만 생성한다. 플레이어·소환굴·보조 key 광원은 실제 장면에 생성됐다.

C/D는 스프라이트를 기존 3D 공간에 투영한 후보로, 게임용 3D 캐릭터 제작 결과가 아니다. 기존 perspective view의 평탄 지형·screen-space label/custom draw VFX 미이식 등 제한을 유지하며, 2D에서 보이는 펫·custom draw 효과 일부가 3D에는 빠지고 캐릭터가 기울어져 세부가 작아진다. 베이크된 그림자와 새 투영 그림자의 중첩 가능성이 있다. C는 안개·SSAO로 D보다 어둡고, D는 지면 밝기/재질 디테일이 더 선명하다. 어느 안도 AAA 달성이나 제품 채택으로 판정하지 않는다.

재부팅 전 `source-final/A.png`와 이번 A를 비교하면 RGB146픽셀 차이(bbox953,542~967,558)가 남는다. 이 비교를 pixel-identical PASS로 세지 않았다. 기존 제품 코드/기본 진입 경로는 바이트 동일이며, 이전 캡처의 작은 동적 시각 차이는 별도 증거 `A-prior-pixel-comparison.json`으로 남긴다.

최종 상태는 **비교 자료 준비 / 기존 main 회귀 0 조건 BLOCKED**이며, 사용자 B/C/D/보류 선택을 기다린다. 기준 main 재현 근거는 `resume-20261020/p1002g-baseline-comparison.json`·`baseline-284d7faf/`에 있다.
