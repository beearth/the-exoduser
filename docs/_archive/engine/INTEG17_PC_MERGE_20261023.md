# INTEG-17 — PC 3브랜치 소스 통합, Mac 검수 BLOCKED (2026-10-23)

세 재료를 순서대로 merge했다. 소스 통합만 인수하며 런타임·PC Windows·시각 검수 완료가 아니다. R 파일 변경·R Godot/import·GUI·실플레이·캐시 복제·main push 없음.

## 재료와 충돌

| 원격 ref | fetch 후 ls-remote SHA |
|---|---|
| refs/heads/claude/pc-boot01-20261022 | `bfaee6fd61b676c952c5aef6011fa9e2c8cec4f8` |
| refs/heads/claude/pc-boss-chase-20261022 | `1fee6d8c8aa3632d6de9372c10fc52517c2ba9a1` |
| refs/heads/claude/pc-sweep-b-20261022 | `0650683223133c5539bf1d562a8f1729cc9c1c17` |
| refs/heads/codex/demo11-integ16b-20261022 | `ff23449e61a25dc91eb1b4517292b6868de8fe9a` |

merge1 ea76c400aff1f0b87cdf1cab02091963cdd14196: 충돌0. merge2 124cf43857fddf6321192d5b41a0c46126514b8f 및 merge3 19b0e68026aece9054a28255a13e090fbd78986c: 각각 CHANGELOG 상단 추가 충돌1, 양쪽 원문을 함께 보존했다. 로비·World는 Git 자동 병합 후 관련 경로를 리뷰했다. cherry-pick/rebase/reset 없음.

## PC가 변경한 Mac 소스 인수 범위

| 파일 | 보존·리뷰한 훅과 경계 |
|---|---|
| main.gd | staged 메타일 때만 준비 본문 단계 사이 프레임 양보·트리/하위 콜백 정지와 복구, 직접 하니스 동기 경로 유지 |
| world.gd | onload 픽셀 순수 커널·예열 소비/동기 fallback + bind_native_arena_flow 일회 바인딩·arena 방향 분기 공존 |
| native_demo_lobby_entry.gd | 기존 launch와 launch_staged 공유 begin/finish, 준비 완료 대기 후 진입 권한 |
| native_demo_lobby_screen.gd | 16b continue=false/new=true story 분기, PC preload→로딩→대기→frame_post_draw→launch_staged 순서 + SWEEP-B 화면. 로딩 layer101은 영상100 위에 놓이는 BOOT-01 의도 보존 |
| native_world_drops.gd | configure에서 예열 빔 소비·같은 검정 마스크 정적 함수 및 동기 fallback |
| native_story_intro.gd | 이미지 예열 작업표·순수 커널·기존 로딩 fallback |
| parity_video_intro.gd | 정적 frame_assets 함수 |
| player.gd | BOOT-01 함께 병합한 Esc 정지 중 release 기록; 원본 Esc 의미 보존, PC 소유 |
| PC 신규 owner/기타 UI | arena BFS·첫 틱 필드 워커 방향·데모 금지 어픽스 필터·SWEEP-B UI/웹 기준 테스트는 PC 소유 원변경 보존 |

틱 경로에 목록 API/ResourceLoader/매틱 할당을 추가하는 수동 변경은 없다. 이번 수동 변경은 CHANGELOG 충돌 표식 제거와 문서뿐이다. 상세 리뷰 diff는 외부 mac-hooks.diff에 보존. docs 전체 관련키워드 검색 결과는 외부 docs-matches.txt. 기존 보고 수치는 당시 플랫폼의 과거 결과로 유지한다.

## 단회 검증 결과

첫 fresh import는 이 worktree에서만 실행했으며 exit -11(SIGSEGV), ERROR 문자열0. 로그 마지막은 BlackHanSans-Regular.ttf import 시작이다. 정확한 crash 원인은 미확정이며 ERROR0 성공으로 인정하지 않는다. 이어진 테스트에서 .godot/imported/*.ctex 미생성에 따른 preload/compile 오류가 발생했다. import 재실행·캐시 복제는 하지 않았다.

| 검증 | 횟수 | 결과 | 실패 소유 |
|---|---|---|---|
| import | 1 | exit -11, ERROR 문자열0, 미완료 | Mac 엔진/import 환경, 원인 미확정 |
| test_pc_boot01_prewarm | 1 | assertions90/failures0/world40, exit0이나 ERROR74 → 무효 | Mac import 의존; PC 기능 PASS로 집계 금지 |
| boss_parity | 1 착수 | 캐시/preload 오류·startup 거절, 후속 hang을 자기 PID93965 종료 | Mac import 의존; PC 회귀로 단정 금지 |
| combat_kill | 0 | BLOCKED: import 선행조건 실패 | Mac import 의존 |
| pack_b(_mac) | 0 | BLOCKED: import 선행조건 실패 | Mac import 의존 |
| skill_writers | 0 | BLOCKED: import 선행조건 실패 | Mac import 의존 |
| move_skills | 0 | BLOCKED: import 선행조건 실패 | Mac import 의존 |
| 04 lobby | 0 | BLOCKED: import 선행조건 실패 | Mac import 의존 |
| 07 lobby_entry | 0 | BLOCKED: import 선행조건 실패 | Mac import 의존 |
| 09 pause | 0 | BLOCKED: import 선행조건 실패 | Mac import 의존 |
| 50 settings | 0 | BLOCKED: import 선행조건 실패 | Mac import 의존 |
| e2e_parity_intro_01 | 0 | BLOCKED: import 선행조건 실패 | Mac import 의존 |
| Mac hud | 0 | BLOCKED: import 선행조건 실패 | Mac import 의존 |
| Mac intro | 0 | BLOCKED: import 선행조건 실패 | Mac import 의존 |
| Mac ui06 | 0 | BLOCKED: import 선행조건 실패 | Mac import 의존 |

검증 실행마다 새 namespace를 사용했다. 고정 guard 테스트의 USERDIR는 실행 중에만 고유 suffix로 바꾸고 원 byte로 복원했다. PC storage=off. override.cfg는 원래 부재 상태로 복원했다. runner93940 및 자기 Godot93965 종료 확인, 최종 Godot PID81277만 존재하며 해당 PID는 건드리지 않았다. 테스트 재실행0.

## E2E 18단계

E2E는 import 선행조건 실패로 미실행(0회). 아래는 실제 측정 결과가 아닌 차단 목록이다. 이전 INTEG-16b의 PC 13/5/0을 이번 결과로 재사용하지 않는다.

| 순서 | 단계 | 결과 |
|---|---|---|
| 1 | isolation | BLOCKED_IMPORT (미실행) |
| 2 | new_game | BLOCKED_IMPORT (미실행) |
| 3 | character_create | BLOCKED_IMPORT (미실행) |
| 4 | intro_skip | BLOCKED_IMPORT (미실행) |
| 5 | field_MAP11 | BLOCKED_IMPORT (미실행) |
| 6 | enemy_kill | BLOCKED_IMPORT (미실행) |
| 7 | item_pickup | BLOCKED_IMPORT (미실행) |
| 8 | equip | BLOCKED_IMPORT (미실행) |
| 9 | auto_potion | BLOCKED_IMPORT (미실행) |
| 10 | level_up | BLOCKED_IMPORT (미실행) |
| 11 | stat_passive_invest | BLOCKED_IMPORT (미실행) |
| 12 | revival_interface | BLOCKED_IMPORT (미실행) |
| 13 | bossroom_gate | BLOCKED_IMPORT (미실행) |
| 14 | boss_defeat_signal | BLOCKED_IMPORT (미실행) |
| 15 | clear | BLOCKED_IMPORT (미실행) |
| 16 | demo_end | BLOCKED_IMPORT (미실행) |
| 17 | save_handoff | BLOCKED_IMPORT (미실행) |
| 18 | lobby_return | BLOCKED_IMPORT (미실행) |

후속 필요: Mac import crash 원인 해결 후 사용자 재실행 금지 범위 변경 없이는 검증을 재개하지 않는다. PC Windows 구현·테스트·실플레이·GUI는 PC 소유이며 이번 미확인. 소스는 검수 차단 후보로 원격 보존한다.
