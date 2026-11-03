# 인수된 native source의 main·R 소스 정렬 계약 — 2026-10-17

| 항목 | 범위 / 판정 |
|---|---|
| TASK | `ROOT-ACCEPTED-NATIVE-SOURCE-MAIN-SYNC-20261017` |
| 승인 source 기준 | local `c7dc6bbe57e2d9e1ad0a4d823cbdeb0e9c89fc46` / remote `c43d164c8c5909df2180b3ae373de95fe602e402`; 같은 tree `fce4b2b6f30ad2b994fc6a4be94c1c086c3bb511` |
| 사전 실제 관측 | 작업 시작 GitHub main과 R HEAD는 `f8a8889846e53f5c063c24f469b080c8de415b6e`. 승인 소스12단위가 별도 branch에만 있었음. 이 값은 사전관측이며 이후 최신 HEAD를 대신하지 않음 |
| main 반영 정책 | fresh expectedSHA를 확인하고 `force=false`/정상 fast-forward로 승인 source와 이 통합 docs만 반영. lease 거부/foreign·held 충돌은 보존하고 별도 보고 |
| source 정렬 완료 조건 | 실제 remote main·I·R의 HEAD/tree/upstream 일치, exact 승인 whitelist WORK/INDEX clean, 새 변경경계 static 확인. 실제 최종 SHA/시각/판정은 아래 외부 final receipt에 기록하며 이 문서 존재만으로 완료를 추정하지 않음 |
| 실행 / 출시 구분 | R의 **disk source** 정렬과 열린 창·상주 process·기존 export·PC·Steam 실행을 구분. reload/input/restart/서버GET/save/asset/import를 수행하지 않는 단위 |

## 인수 source와 exact whitelist

| 항목 | 고정 범위 |
|---|---|
| graph | 공통 f8 기준 단일 parent source12개. local/remote 각12 tree가 동일하고 f8는 remote c43의 ancestor. 현재 Git graph metadata로 확인했으며 옛 검사/수송 증거를 다시 회수하지 않음 |
| source path union | 50경로 = Godot code16 + 관련 docs34. 각 인수 commit의 path union과 최종 f8→c7 netdiff가 일치 |
| 이번 새 쓰기 | 통합 상태·미완 범위 docs2만 추가: 이 문서와 `FDG_PC_MAC_GIT_SYNC_20261016.md` appendix. 기능 코드 새 개발0 |
| 최종 적용 whitelist | 위50 + 통합docs2 = exact52경로. prewrite manifest에 경로·I/R WORK/HEAD·INDEX/WORK·scope untracked·realparent/non-symlink·실제 copy시각을 기록 |
| 제외 | 별도 crossbow `7aa/2742`, 옛R9/보존R30, ART/LAVA/HUD/GL/rig/asset/save 및 held/foreign/미인수 경로. 이미 base main에 있던 파일 전체를 이번 새 승인으로 세지 않음 |
| 정상 Git | 기존 local source ref를 보존하고 새 branch/정상 FF를 사용. force/reset/clean/amend/전체stage/타인unstage/인증·호스트 우회0 |

| 순서 | local 승인 단위 | remote 대응의 의미 |
|---|---|---|
| 1 | `da20f0b0b8bad70a32643d754eaf9b9c737cf652` / fireball actual state/resource owner | paired immutable tree 동일; 새 기능/전체게임 완료로 확대하지 않음 |
| 2 | `3cf53bd18a8ecbeef0d7ff4ba48fc1cfc9fd3acd` / player projectile packet store | paired immutable tree 동일; 새 기능/전체게임 완료로 확대하지 않음 |
| 3 | `58bde81426dc4111ffc8af7ee9dcb7ac9adb8c04` / fireball finish/lesson/sample dispatch | paired immutable tree 동일; 새 기능/전체게임 완료로 확대하지 않음 |
| 4 | `ba507e4a23b8d935f2bc9c94e0b1b609e49f9406` / fireball World flight consumer | paired immutable tree 동일; 새 기능/전체게임 완료로 확대하지 않음 |
| 5 | `1f18250f80927b83895aece0147a1757f23f7633` / current equipment affix public owner | paired immutable tree 동일; 새 기능/전체게임 완료로 확대하지 않음 |
| 6 | `d282fdd14eab82da954a29c04bba75e31c784375` / current source sample globals | paired immutable tree 동일; 새 기능/전체게임 완료로 확대하지 않음 |
| 7 | `0eaa2365527dfec06c90f563d73616b42d6ee644` / native platform render input | paired immutable tree 동일; 새 기능/전체게임 완료로 확대하지 않음 |
| 8 | `fa6daca6ec9f01e27f86139961e01260bdf0cfef` / source clock input authority | paired immutable tree 동일; 새 기능/전체게임 완료로 확대하지 않음 |
| 9 | `39c619f88473d153e966e09e1a15da5a399cd320` / native source frame callback | paired immutable tree 동일; 새 기능/전체게임 완료로 확대하지 않음 |
| 10 | `f6efa6fbfcf9ca3d293fba510da74dd6033cad20` / exact normal actor current fields | paired immutable tree 동일; 새 기능/전체게임 완료로 확대하지 않음 |
| 11 | `80d5dca2a7e9d6cd298ac2144ec2e7281a469a70` / synchronous normal poise owner | paired immutable tree 동일; 새 기능/전체게임 완료로 확대하지 않음 |
| 12 | `c7dc6bbe57e2d9e1ad0a4d823cbdeb0e9c89fc46` / normal source KB momentum owner | paired immutable tree 동일; 새 기능/전체게임 완료로 확대하지 않음 |

## 유지하는 실제 미완과 검수 한계

| id | 현재 실제 한계 |
|---|---|
| source frame / DCP | timestamp·현재 OPT fpsCap까지만 연결. 첫 `gap_frame_callbacks`의 current `_DCP.on`/owner 미소유. 사용자 저장소/URL·일반 false 가정으로 진행하지 않음. 관련 인간 질문 미응답과 별개 source 정렬 |
| source update clock | 원 전체 acc/update/sp/_dtSp/GC·렌더·return body 연결 미완. native frame/delta를 원 source clock으로 치환하지 않음 |
| full hurtE | 현재 normal field/poise/KB는 exact partial. poise break는 actual core 뒤19985 `_uqScCtx`부터 미소유 tail. KB42482는 momentum만, offscreen42483·geometry/full kill/RNG·후속은 미완 |
| 실제 전투 / startup | source root의 complete startup·CSS5/world cache·모든 skill/character·원 save/equipment 복원·공용 audio/RNG·모든 boss/type/field owner 연결 미완. 기존 승인된 범위와 HOLD를 그대로 유지 |
| 시각 / native export | 기존 config는 `fdg-godot-web-native-first-20261013`를 가리키며 export_timestamp/native_code_checkpoint는 NOT_RECORDED. sourceCombat pin `9a4534b42f74093095ebc3364a25dd104e93b379`은 최신 전체 content 증명이 아님. 라벨을 새 것으로 바꾸거나 export/import를 실행하지 않음 |
| 품질 / 전체 상태 | `latest_full_game=false`, content parity INCOMPLETE. 전체 캐릭터 24고유장/24FPS·원근/시각·실전·성능·PC/Steam 최신 실행 완료로 세지 않음 |
| 과거 실패 | 각 source 단위의 최초 parse/fixture 실패·부분 적용/NR·receipt handler 오류·후속 영향검사 구분을 기존 docs/외부 raw에 그대로 보존. sync 성공으로 과거 first_whole_clean=false를 true로 바꾸지 않음 |
| 이번 새 검수 | 새 통합 경계 static만 수행. 옛 21/2/15/37/24/29 및 Frame/prefix/parse·통과 suite·성공blob 수송 재연0 |

## 현재 관측 파일

| 파일 / 위치 | 용도 |
|---|---|
| `prewrite-manifest.json` | exact52와 승인12graph/50union·사전 I/R 상태·필수 백업·scope guards |
| `graph-and-normal-git-boundary.json` | current remote/local12 tree pair, expected main, metadata-only filtered fetch와 정상 Git hook 경계 |
| `main-update-receipt.json` / `R-pre-ff-manifest.json` | 실제 expectedSHA/비강제 반영과 R 쓰기 직전 새 상태/보존 기록 |
| `final-static-result.json` / `final-receipt.json` | 실제 main·I/R HEAD/tree/upstream/52경로 정렬·새 static 판정과 적용하지 않은 runtime 범위 |

새 evidence 절대경로: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/ACCEPTED-NATIVE-SOURCE-MAIN-SYNC-20261017/`. source 정렬의 실제 완료 여부는 final receipt의 관측으로 판정한다. 코드16/기존docs34의 기존blob은 재업로드하지 않고 새 통합docs2만 공식 Git objects에 추가한다. 시작 경계는 ROOT가 허용한 직전 주간45 관측 재사용이며 일간UNKNOWN/공유 계정 소비다.
