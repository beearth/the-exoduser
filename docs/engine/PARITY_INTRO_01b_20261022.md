# PARITY-INTRO-01b — Mac PC 이동 회귀 진입 복구

기준 `a08bd885d590e42397f72d662fa7d1e268576ede`, 같은 parity-intro 브랜치. PC 테스트·oracle·제품 인트로 코드는 수정하지 않는다.

## 원인과 계약

| 파일·행(기준 소스) | 계약 / 관측 |
|---|---|
| tests/test_pc_move_skills.gd:229–249 | `native_intro_boot="intro"`, Main add_child 뒤 10 physics frame 안 world/player/source_state/native_move_skills 준비. owner가 player 앞, 가이드 finish 후 lesson skip, G.on=true |
| scripts/native_story_intro.gd:25–27 | custom SceneTree 및 explicit intro는 story를 자동 재생하지 않음. bf538259와 a08bd885 동일 |
| scripts/main.gd:188–195 | storage는 off 인자가 없으면 활성. open_boot HOLD면 world/player 생성 전에 return. bf538259와 a08bd885 동일 |
| port_modules/save_adapter/demo_local_storage.gd:22–31 | 제품 namespace 또는 EXODUSER-demo11-만 허용. PC fixture의 EXODUSER-pc-move-skills-Isolated-20261022는 저장 namespace가 아님 |
| _out/PARITY-HUD-02b/run.py | 이전 Mac 실행은 해당 fixture에 storage=off 누락. 로그 첫 실패는 move_skills_owner_installed, 뒤 Nil 연쇄. 인트로 변경으로 계약이 깨졌다는 가설은 소스 비교로 지지되지 않음 |
| tests/mac_harness.py / run | PC fixture script를 실행하고 storage 인자가 없을 때만 --demo11-storage=off 추가. 명시 on/off는 존중. 제품/다른 suite 기본 동작 유지 |

PC 계약 변경 필요 없음. 실행 설정 복구이며 검증 조건·assertion·전투 수치·제품 저장 namespace 허용을 완화하지 않는다. 웹 동일 3구간 화면·실제 Space 홀드 경로는 기존 그대로다. E2E는 --demo11-storage=on, 주입0으로 별도 검증한다.

## 검증

PC 단회 256 assertions / 0 failures, skipped0, exit0, SCRIPT ERROR0. forced_test_fields134는 기존 PC fixture 개입이며 E2E와 별개다. PC 기기 실행·동기화 증거는 아니다. 로그·argv·PID·override 복원 증거: `~/exoduser-wt/_out/PARITY-INTRO-01b/`.

재현: Mac에서 `mac_harness.run(project, out, engine, name, "EXODUSER-pc-move-skills-Isolated-20261022", ["--headless", "--script", "res://tests/test_pc_move_skills.gd"], ["--node-bin=<실행 가능한 Node 절대경로>", "--artifacts-dir=<격리 출력>"])`를 사용한다. 공통 하니스가 storage=off를 추가한다. 원시 Godot CLI는 동일 인자를 `--` 뒤에 직접 명시해야 한다. 하니스를 거치지 않은 CLI의 기본값을 바꾸지는 않는다.

| 단회 실행 | 결과 |
|---|---|
| test_pc_move_skills | 256 assertions / 0 failures, skipped0, exit0 |
| Mac HUD toast | 26 checks / 0 failures, exit0 |
| Mac intro | 12 checks / 0 failures, exit0 |
| E2E / --demo11-storage=on | PASS, injections0, 실제 로비 Escape 홀드 → 생성 UI → 전사 Space 홀드 → 첫진입 INTRO Space 홀드 → 가이드 Space 홀드 → field_on=true, story_handoff=1 |

모든 실행 SCRIPT ERROR0, 자기 child 종료·override 복원 확인. PID81277 조작0, 동시 상한3 준수. E2E 원본은 출력 JSON 경로만 이번 _out으로 옮긴 외부 사본이며 상태·저장·시계 주입 없음. 기존 화면 RETOUCH/영상 HOLD는 그대로이며 이번 실행을 새 1x 시각 동등성 승인으로 해석하지 않는다.
