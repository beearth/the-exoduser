# INTEG-6c — main 반영 전 PC 요청·보스 BGM 통합

## 기준·merge

- 원격 expected SHA: `codex/demo11-integ6-20261021` = `d5b842df7a55ec8202bfbe721c1daafc0b4c867d`. 시작과 push 전 ls-remote 동일 확인.
- 같은 branch / 별도 sparse worktree `~/exoduser-wt/INTEG-6c`, 초기 tracked INDEX/WORK clean. R은 readonly Git 조회만, R import/게임실행/편집0.
- PC branch `claude/demo11-boss-bgm-20261021` = `3baceb7340fe578fccc63bacfe38737d236eeec0`를 **merge**. merge commit `8c6f086ebb4d60b1abdc96ebda14feb31fb3e396`, 부모 d5b842df + 3baceb734. cherry-pick/rebase 없음.
- 사운드 문서의 SFX Forge append와 새 보스 BGM append를 양쪽 보존. 최초 정상 hook이 CHANGELOG 누락을 거절하여 CHANGELOG를 추가한 뒤 정상 commit. hook 우회0.
- 데모 boss=`bgm/1장_썩은숲/Ashen Druid - Boss.mp3` (PC 인수 −12.4 LUFS), 원본 공용 카탈로그·웹 그대로. AUDIO-01 코드 그대로: FIELD_DB −14dB / BOSS_LIFT_DB +7dB → boss −7dB; 필드120~180초/휴지20~40초·전투duck−5dB/attack.2s/release1.5s 유지.

## override와 제품 기본 저장소

확인한 origin/main=`abc3dd442a478f53a540a352e9526837bebf6ecc`. 파일 내용만 Git object로 확인했으며 실제 저장 폴더를 읽거나 실행하지 않았다.

| 항목 | 전 | 후 |
|---|---|---|
| project.godot custom_user_dir_name | EXODUSER-demo11-Demo | EXODUSER-Godot-Native-First (origin/main 현재 기본값) |
| use_custom_user_dir | true | true (동일) |
| override.cfg Git | tracked, 모든 checkout에 EXODUSER-DEMO-PLAY-20261021 강제 | git rm --cached + .gitignore /godot/override.cfg |
| override 로컬 byte | EXODUSER-DEMO-PLAY-20261021 설정 | 원 byte 유지, 최종 외부 결과 폴더에 로컬 사본 보존 |
| Windows/Web stage·export | 로컬 override 복사 가능 | 공용 stage_project 복사 제외 + 두 export preset 제외 필터 override.cfg 추가 |

제품 새 이름 생성0. main_scene/다른 project 값 변경0. 모든 Godot 실행은 임시 격리 override 후 존재 여부·원 byte까지 복원. `mac_harness.py`를 run_integ_fix·run_integ6c·기존 tools/run_demo11_47h가 공용 사용한다. 기존 E2E CLI도 nonempty override를 덮어 버리거나 0byte로 지우지 않는다. 빌드 stage의 소형 임시 fixture 검증에서 원 override 유지/사본 제외/project byte 유지 PASS. 실제 export·배포0. Python5개 compile 및 두 기존 CLI --help 성공.

## Mac 테스트 현행 계약

| suite | 전제 | 검사/실패 | exit | ERROR | 로그 |
|---|---|---:|---:|---:|---|
| bgm_override | MAP11 ON (제품 카탈로그) | 18/0 | 0 | 0 | validation/bgm_override.json |
| 41 | --map11=off (수동 intro·boss 신호·음악 계약) | 66/0 | 0 | 0 | corrected/41.json |
| AUDIO-01 | 맵 없음 (mix fixture) | 30/0 | 0 | 0 | validation/AUDIO-01.json |
| 37 | MAP11 ON (제품 provider/arena/clear) | 148/0 | 0 | 0 | corrected/37.json |
| 42 | --map11=off (HUD owner·수동 intro) | 37/0 | 0 | 0 | final/42.json |
| 44_average | MAP11 ON (제품 arena boss 평균) | 5/0 | 0 | 0 | corrected/44_average.json |
| 44_pets | MAP11 ON (제품 provider·pet observer) | 75/0 | 0 | 0 | corrected/44_pets.json |
| 43 | --map11=off (자체 spawn provider/legacy 적) | 40/0 | 0 | 0 | validation/43.json |
| 23b | MAP11 ON (dormant intro observation fixture) | 5/0 | 0 | 0 | corrected/23b.json |
| E2E | MAP11 ON + --demo11-storage=on | PASS13/NR5/0 | 0 | 0 | final/E2E.json |

전부 최종 실패0, diagnostic skip0. 42는 headless에서 GPU 캡처만 명시적으로 제외(`capture_skipped_headless=true`), `--captures` 경로를 주어도 frame_post_draw/get_texture/save_png에 진입하지 않는다. UI 개발문구 검사는 캡처 조건 밖에서 유지하여 총37 assertion. 헤드리스 GPU 캡처 QA PASS를 주장하지 않는다.

37/44는 제품 geometry 없이 옛 arena 진입을 요구하던 오류를 고쳤다. 실제 MAP11 provider의 단일 bind·중복/외부 거부·실제 Marker entry/보상/clear 검사를 유지하고 37의 NOT_READY skip 분기를 없앴다. 44 평균은 실제 Boss Marker로 Player를 배치해 기존 반경500 평균의 정확값을 검사한다. 이 suite의 HP/최종시그널 fixture는 기존 명시적 계약 검사이며 자연 보스전 증거가 아니다.

41은 native_demo_life 설치 뒤 legacy player_died가 성급한 사망 음악을 시작하지 않는지 추가 검사하고, 실제 life consumer가 쓰는 공개 request_native_music_scene("death")로 terminal 음악·fade 검사를 계속한다. 23b는 현재 Main이 읽는 phase 필드를 observation fixture에 추가하고 dormant를 명시하여 정상 TAB 검사와 guide 소유권 검사를 분리했다. PC 코드·PC 테스트 수정0.

## 하니스 안전장치

- 공용 GDScript `mac_harness_safety.gd`: headless can_capture=false, ALWAYS 감시 노드. 일반 suite120초 / E2E420초 뒤 SceneTree.quit(124). 초기화 때만 load/트리 추가, 게임 제품 경로 연결0.
- 공용 Python `mac_harness.py`: ps의 실제 /Godot executable 기준 PID 수3 미만에서 바로 실행, PID81277 보존. SCRIPT ERROR/ERROR/검사 실패 감지 또는 일반240초(회귀180초)/E2E450초/import600초에서 비0 처리. 이미 요청한 quit에 .5초를 주고 미종료 시 자기 Popen 자식만 terminate,5초 후 kill. finally에서 원 override 복원 및 child exit 영수증.
- `mac_harness_safety_probe.gd`(검증 당시 test_mac_harness_safety.gd와 동일 byte, gitignore test_* 충돌을 피한 이름): headless no-capture exit0, paused stall timeout exit124, 의도 SCRIPT ERROR 후 timeout exit124. 실패 경로를 확인하는 negative controls이며 로그의 의도 ERROR/FAIL은 예상 결과다. 첫 controls는 외부 감시기가 quit보다 먼저 terminate(-15)하여 .5초 유예를 보강했다. 최종3 controls 모두 기대대로 종료·원 override 복원.
- E2E 후보에서 신규 적의 없는 contact timer를 float(null)로 바꾸던 오류: 실제 숫자 timer가 확인된 자연 소유 actor만 후보. cooldown0·HP·피해·RNG·life/최종사망 시그널 주입0. 원 E2E의 XP reward 입력 등 기존 checkpoint는 유지하며 whole-route PASS로 포장하지 않는다.

## E2E 최종 단회

수정된 E2E 1회: **PASS13 / NOT_READY5 / FAIL0 / ERROR0 / exit0**, validator `[]`, storage=on. 전체 continuous E2E는 NOT_READY다.

| 단계 | 결과 |
|---|---|
| isolation | PASS |
| new_game | PASS |
| character_create | PASS |
| intro_skip | PASS |
| field_MAP11 | PASS |
| enemy_kill | PASS |
| item_pickup | PASS |
| equip | PASS |
| auto_potion | PASS |
| level_up | PASS |
| stat_passive_invest | PASS |
| revival_interface | PASS |
| bossroom_gate | NOT_READY |
| boss_defeat_signal | NOT_READY |
| clear | NOT_READY |
| demo_end | NOT_READY |
| save_handoff | PASS |
| lobby_return | NOT_READY |

자동물약 uses0→1, mats1004→1003; HP 직접쓰기false. revival HP478.0525→0, 실제 자연 접촉1052프레임/14998ms, fallen_enter 및 resolution APPLIED, harness damage requests0. 완전 부활 성공으로 해석하지 않는다. 보스 gate 미충족·PC boss 최종사망/연속clear/로비 미완료 유지. CPU 계측 자료는 기존 driver 출력에 남지만 새 성능 PASS·목표8.33ms 달성을 주장하지 않는다.

## 실행 이력·제한

요청한 최초 시도 로그를 버리지 않았다. import1회, bgm/AUDIO/43 각1회; 41/44avg/44pet/23b는 첫 실패 후 계약·fixture 수정본 각1회 추가. 37 최초 off 실행은 arena_geometry NOT_READY skip이어서 제품 MAP11 검사로 갱신하고1회 추가. 42 최초33/0 후 headless에서도 기존 문구4검사를 유지하도록 보강한 최종37/0 1회 추가. E2E 최초 SCRIPT ERROR로 8단계에서 감시종료, timer형 검사 수정 후 최종18단계1회 추가. 반복 실행으로 실패를 숨기지 않는다.

최종 import ERROR0; 최종 일반 suites ERROR0; 음원CoreAudio 계약검사 성공이나 실제 스피커 청음은 미검수. Camera2D interpolation 경고(기존), 최초42 ObjectDB 잔존 경고2개는 이력 보존. PC 실행/동기화·자연보스전·배포 미검증.

원로그: `~/exoduser-wt/_out/INTEG-6c/{validation,corrected,final,safety,safety-final}/`. R 작업·세이브·타인 INDEX/WIP·전투코어·PC 계약·PC 테스트·맵 비주얼·번역 목록 byte 변경0. 자기 프로세스 종료 확인, 기존81277 보존. 최종 commit/원격 SHA/정리는 외부 DONE.txt.
