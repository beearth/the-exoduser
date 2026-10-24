# 원본 기준 재감사 — 2026-10-24

**최신 승인 기준 미확인.** `ffa85d620`과 `2c37d3817`은 복구 체크포인트다. v22b라는 번호, 최신 파일시각, 복사 SHA 일치, 과거 Windows PASS로 최신 승인본을 판정하지 않는다. 이번에 교체한 영상/원화는 없다.

| 기준 | 확인 경로·식별자 | 실행/승인 경계 |
|---|---|---|
| 기존 Mac ROOT | `/Users/fordeargamers/Projects/exoduser-migration-20261001`, `dd49171c5b88e211575a41f185395d6c0a14b184` | index는 world_intro_v15_clean_en 선택. 현재 실행 중인 본편이라고 확인되지 않음 |
| 원격 main | `fab7a167c30c6421bda8cf6d4c2ee2e7753e87f3` | index는 v17_blood_en 선택. 846889174에서 v15→v17 변경. Git 반영은 확인했으나 최종 사용자 연출 승인과 별개 |
| Unity 후보 | `/Users/fordeargamers/exoduser-wt/UNITY-MAC-20261024`, 원본 checkpoint2c37d381710377048586eeb49e5c5a41e52c4c27 | NativeLobby.OpenForPage는 v22b_paint_en 선택. PC manifest와 복사본 일치만 확인 |
| 현재 Mac 앱 | CUA inventory에서 Hub 실행, Godot·INTEG12c/15b/17d 비실행. Chrome에 게임 탭 없음 | 현재 실제 게임 소스 경로를 특정할 증거 없음. 게임을 임의 실행/재시작하지 않음 |
| 최근 승인 조회 | 해당 Mac Claude 프로젝트의 v22b 메시지 검색 결과 없음. PC 소스 채팅 read_thread 오류 | 승인 확인 불가를 부재/거절 증명으로 바꾸지 않음 |

## 구간과 동작 차이

| 구간 | 실제 selector / 차이 | 승인·검수 |
|---|---|---|
| FDG | ROOT/main video/fdg_intro.mp4 → NativeLobby.Begin fdg_intro.mp4. 영상 동일 | 포스터 동일. 최신 승인 미확인; Mac 재생/청취 미검수 |
| 여성 타이틀 | ROOT/main title_motion_hd_20260929, SD fallback → Unity 같은 이름. 동일 영상 | 컨테이너 길이/음원 byte 동일. 노출 타이밍·재생 루프는 Mac 미검수 |
| ENTER 문 | ROOT/main video/intro.mp4 → Unity intro.mp4, 첫 프레임 gate_poster 변환 | Unity Gate 볼륨.6/BGM.6. 실제 페이드·동기 청취 미검수 |
| 세계관 | ROOT v15 / main v17 / Unity v22b. v22b 실제 원본 경로는 manifest상 G:output/cinematic/a04_demonic_remaster_20261016 | Mac ROOT/main에 해당 v22b 경로 없음. 복구4부분으로 조립한 파일 SHA만 확인. 최신 기준 미확인, 자동 v17 회귀도 하지 않음 |
| 세계관 음성·자막 | Unity VoiceGain 및 Resources/Data/lobby_frontend의 자막 cue 선택 | PC의113.291667초·v17음성동일 보고는 독립 Mac 청취/타임라인 검증 아님. v15/v17/v22b 컷/자막 동기 차이 미확인 |
| 로비 영상·포스터 | 원본 loop_v2 / poster_v2 동일. Unity는 호환 H264변환 영상과 WebP→PNG 포스터 | 영상 SHA가 다른 것은 인코딩 변환. manifest12.083333초/290프레임, Mac 화면·소리 미검수 |
| 로고·버튼·캐릭터 | logo_exoduser, lobby_enter/banner, varkan_idle_v3/first_v3는 ROOT/main 같은 blob, Unity 일치. title_logo/enter_art는 alpha 변환 | 파일 동일성 확인. 최신 사용자 선택·UI 구도 승인 미확인 |
| HUD·인벤 | 현재 소스는 전체폭44px받침/양끝 구슬/전체화면3열. 최신 사용자 중앙 HUD·양측 패널 방향과 불일치 | 이번 UI 후보로 재설계. 과거 도킹 VISUAL PASS는 좁은 범위의 이력 |

30개 Unity 자산 모두 복사 manifest SHA와 일치한다. 27개 source 항목은 Mac ROOT와 remote main의 동일 Git blob 및 실제 파일 SHA를 대조했다. 예외는 v22b 원본 부재, index 차이, OFL 소스 경로 부재다. 동일 파일이 중복 사용되는 항목을 포함한 개수다. 원격 index SHA는 c90b894714140d1c9e6c45d3bd778e44503d82bd8bdb70e32f15ff9e5e182e50, PC manifest index SHA는8bff9fd683b274fc538df531e7b007ec7c5e60e7317744948ffc2e5b4f088621로 다르다.

## 자산 SHA 근거

전체 원본 경로·Git blob·SHA·변환은 [기계 판독 감사표](UNITY_SOURCE_AUDIT_20261024.json) 및 기존 lobby-assets/inventory-assets/source_receipt manifest에 보존했다. 아래 main SHA는 ROOT/main blob 동일성을 먼저 확인하고 실제 ROOT 파일을 해시한 값이다. 이것은 최신성 승인 표시가 아니다.

| source | main source SHA256 | Unity SHA256 | 관계 |
|---|---|---|---|
| `video/fdg_intro.mp4` | `cf5e27b0d4ddf86146971661052a4512aa008b997cd370c605615fdb2b26b806` | `cf5e27b0d4ddf86146971661052a4512aa008b997cd370c605615fdb2b26b806` | byte 동일 |
| `video/intro.mp4` | `0891964d17e19c9080fe07da97e7ee00e26918b5e51da8909b3d11e149f99620` | `0891964d17e19c9080fe07da97e7ee00e26918b5e51da8909b3d11e149f99620` | byte 동일 |
| `video/title_motion_hd_20260929.mp4` | `0bd68c5ba2790a2cc45f89421412028946e346df58ad8ac080a72631190b7b2b` | `0bd68c5ba2790a2cc45f89421412028946e346df58ad8ac080a72631190b7b2b` | byte 동일 |
| `video/title_motion_20260929.mp4` | `ac24111767033a28b81cab298d5d92a424b9a10abcbd3389ad66b037975c7e5b` | `ac24111767033a28b81cab298d5d92a424b9a10abcbd3389ad66b037975c7e5b` | byte 동일 |
| `output/cinematic/a04_demonic_remaster_20261016/world_intro_v22b_paint_en.mp4` | `미확인` | `cd9fa7486fd1cf18952605408f5b1bae416a97b2307806476bc329498413199e` | byte 동일 |
| `assets/lobby/lobby_varkan_crypt_loop_v2.mp4` | `53dae74bda02d0b1abe10f1da467868515ff470a910adb02c6aece55b9340a5c` | `26252471c7ef248cd7b04b8f0e6d7709858d5d9de8aaffe1285a11027b482616` | 변환본: manifest 참조 |
| `img/logo_exoduser.png` | `dffad452cffa7aaf074ff80d2fbb9258858fdef1cbde750e8b07f3f3b264efbd` | `dffad452cffa7aaf074ff80d2fbb9258858fdef1cbde750e8b07f3f3b264efbd` | byte 동일 |
| `assets/lobby/lobby_enter_btn.png` | `160b91140127f838f71228d04561ff431a281156ed8aae20da5b5228d74c6d79` | `160b91140127f838f71228d04561ff431a281156ed8aae20da5b5228d74c6d79` | byte 동일 |
| `assets/lobby/lobby_banner_btn.png` | `b86813d27dd0b06c0dc6aabb71289bdd61bb05d32f9bffd3d7f3eeeb36eb137f` | `b86813d27dd0b06c0dc6aabb71289bdd61bb05d32f9bffd3d7f3eeeb36eb137f` | byte 동일 |
| `img/fdg_intro/fdg_reference.png` | `bfd3e392984e2523fab72c3f23dd96207b1e526ceb430857b635f220164f60ef` | `bfd3e392984e2523fab72c3f23dd96207b1e526ceb430857b635f220164f60ef` | byte 동일 |
| `img/fdg_wolf/fdg_wolf_emblem.png` | `cb9083e6a5f81ba6276ad9519293908b663699892b824c080849f1b2cd93325d` | `cb9083e6a5f81ba6276ad9519293908b663699892b824c080849f1b2cd93325d` | byte 동일 |
| `img/title_clean_plate_20260929.png` | `7df3b5aed3826373e083937181fe9faac529bf3aa8a5f8a900f2f094a5d7b09c` | `7df3b5aed3826373e083937181fe9faac529bf3aa8a5f8a900f2f094a5d7b09c` | byte 동일 |
| `assets/lobby/varkan_idle_v3.png` | `12a5dec2194c21715f5c57ecd73c5621759e4d3e7a11b99d8543ebbca6776df4` | `12a5dec2194c21715f5c57ecd73c5621759e4d3e7a11b99d8543ebbca6776df4` | byte 동일 |
| `assets/lobby/varkan_idle_first_v3.png` | `85cadaa9b872c9b5c7f01d799e6f05be5471aada786c6ae823d7a1df72318108` | `85cadaa9b872c9b5c7f01d799e6f05be5471aada786c6ae823d7a1df72318108` | byte 동일 |
| `assets/lobby/lobby_varkan_crypt_poster_v2.webp` | `c79e0e0d40954b1ea924c8a48c06eacd38f9c7884bcba792803986c6429d961f` | `e2f4a8c153dde16fe3e63cfd8f5951a4b3bd4d2d71ed6cb586ebc0cf725ab64a` | 변환본: manifest 참조 |

확정 가능한 교체 경로: 없음. 최신 승인본이 확인되지 않아 영상·원화 교체는 보류하며, 허용된 UI 구조 재설계는 독립 진행한다. 원본/기존 후보/Godot/사용자 저장은 보존한다.
