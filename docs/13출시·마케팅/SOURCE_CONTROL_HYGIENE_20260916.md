# 소스 제어 변경 목록 정리 — 2026-09-16

사용자가 VS Code 소스 제어의753개 변경 표시 정리를 요청했다. 작업 파일은 보관하고, 확인한 로컬 산출물 경로만 `.gitignore`에 추가했다.

| 항목 | 수량·처리 |
|---|---|
| 정리 전 | `git status --porcelain=v1 -uall`:753개 |
| output 산출물 | 아래24개 작업 폴더의 미추적684개. 백업·원본 후보·검수 캡처·중간 패킹·임시 스크립트·인덱스/패치 등을 로컬 보관하며 변경 목록에서 제외 |
| 제출용 사본 | `지스타2026_제출사진_10장/`의 이미지10개 로컬 보관·제외 |
| 불채택 공격 시트 | `img/exoduser_silvertail/attack-remaster-v1.png`1개 로컬 보관·제외. 현행은 추적 중인 `attack-spin-v2.png` |
| 보존 검증 | 제외한695개 파일 모두 처리 전후 SHA-256 일치. 파일 삭제·이동 없음 |
| 실제 작업 | 기존 추적 파일 변경49개+새 문서6개+새 테스트3개=58개 유지 |
| 정리 직후 | 정리용 `.gitignore` 변경1개 포함59개. 정리 커밋 후 기준58개(병렬 작업에 따라 추가 증감 가능) |
| 적용 범위 | 최초 날짜별24개 output 폴더에 더해, 신규 검수·백업 경로를 아래 규칙으로 즉시 제외. output 전체를 제외하지 않음 |
| 기존 추적 자료 | 이미 커밋된 원본·프롬프트·검수 화면·런타임 에셋은 계속 추적. Git 인덱스에서 제거하지 않음 |
| 후속 제작 | 제외 폴더에 새 결과를 의도적으로 보관할 때 `git add -f -- 정확한파일경로` 사용. 새 제작 작업은 새 날짜 폴더 사용 가능 |
| 코드 | 게임 실행 코드·문서의 기존 미커밋 작업은 이번 정리에 포함하지 않음 |

## 확인한 로컬 산출물 폴더

| 경로 | 정리 시 미추적 파일 수 |
|---|---:|
| `output/charselect_quality_20260913/` | 26 |
| `output/fdg_startup_20260911/` | 8 |
| `output/flame_blade_20260913/` | 36 |
| `output/ground_trap_visibility_20260913/` | 12 |
| `output/gstar_2026_selection/` | 25 |
| `output/image_texture_cleanup_20260913/` | 144 |
| `output/intro_quality_20260913/` | 60 |
| `output/kislash_q_cancel_20260916/` | 2 |
| `output/lobby_image_review_20260913/` | 127 |
| `output/lobby_redesign_20260913/` | 27 |
| `output/parry_base50_20260913/` | 9 |
| `output/player_motion_audit_20260915/` | 7 |
| `output/resource_cost_20260913/` | 10 |
| `output/resource_pause_20260913/` | 17 |
| `output/silvertail_attack_20260915/` | 44 |
| `output/silvertail_e_arc_20260916/` | 11 |
| `output/silvertail_sprites_20260915/` | 45 |
| `output/silvertail_walk_fix_20260915/` | 28 |
| `output/spike_half_20260913/` | 12 |
| `output/steamdeck_20260914/` | 10 |
| `output/trap_shield_20260913/` | 10 |
| `output/tutorial_resource_sets_20260913/` | 4 |
| `output/warrior_swing_20260915/` | 2 |
| `output/warrior_swing_weight_20260915/` | 8 |

보존 해시 기록: `tmp/source-control-preserved-files-20260916.json`. 정리 전 목록: `tmp/source-control-before-20260916.json`. tmp는 기존 로컬 제외 경로다.

## 새 검수 파일이 다시 쌓이는 문제 보완

| 항목 | 2026-09-16 후속 처리 |
|---|---|
| 원인 | 새 `steam_review_20260916` 및 `physical_contrast_20260916/originals`가 날짜별 목록 밖에서 생성. 자동 커밋은 실제 코드의 관련 docs/CHANGELOG 미갱신 때문에 보류 |
| 규칙 | `/output/*_review_*/`, `/output/**/backups/`, `/output/**/originals/`, `/output/**/before/`, `/output/**/profiles/`, `/output/**/captures/`, `/output/**/*.log` |
| 처리 | 조사 시176개 중 검수·백업167개 즉시 제외. 설정 파일 변경1개를 포함10개로 감소. 제외 파일 모두 원래 위치에 보존 |
| 경계 | docs/test/tools/런타임 코드와 이미 Git에 추적된 원본·검수 자료는 유지. 해당 폴더에서 새 파일을 의도적으로 추적할 때는 정확 경로에 `git add -f` 사용 |
| 자동 커밋 | 실제 변경의50개·60초 정지·문서/테스트 검증 조건은 유지 |
