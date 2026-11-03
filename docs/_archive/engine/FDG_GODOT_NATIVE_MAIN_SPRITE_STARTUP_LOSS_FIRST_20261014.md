# 실제 Main · 캐릭터 자원 부족 시 시작 중단 · 2026-10-14

이전99f6bf31은 실제 기존 Player의 자원 검사를 기록했지만 NOT_READY여도 camera/HUD/capture 생성으로 진행했다. 현재 Main은 첫 검사 실패 시 **새 실행의 Player·source holders·World를 제거하고 physics/unhandled input을 꺼서 시작을 중단**한다. 실패 report와 accepted source prefix 진단은 유지한다. 원화/model/24장 제작 완료가 아니다.

| 적용 위치 / 현재 계약 | 동작·값 |
|---|---|
| Main._ready 기존 actualPlayer 검사 직후 | status != READY → _stop_source_player_startup(native_player_sprite_not_ready:<reason>), world.free/null, set_physics_process(false), set_process_unhandled_input(false), return |
| 종료 대상 | 이 실행에서 새로 만든 Player/sourceState/sourceResources/World. 기존 인간 Main·registry·save reset 없음 |
| 이후 생성 | signal 연결·GameplayCamera·HUD·PerformanceCapture·metricsTimer·ready print까지 진행0 |
| frozen startup snapshot | 최초 inspector report와 startup_readonly_calls=1 유지; 실패를 cached READY로 치환하지 않음 |
| live getter | 제거된 실제 Player → NOT_READY / reason actual_player_missing / targets0 / frames0 |
| 오류 출력 | 예상 ERROR 1: Native source player startup rejected: native_player_sprite_not_ready:target_queued_for_deletion |
| 재생/품질·source startup | 현재2/8/8/9장·1.25/7.5FPS, 목표24고유장·24FPS0/32는 그대로. source wait/GPU/fullMain/publicPlay 미인수; sourceG.on/lesson.advance 게시0 |

## 새 실패 episode · 첫12검증

새 `tests/test_native_main_sprite_startup_loss.gd`는 실제 Main 생성자1회, public child_entered_tree→원 Player.ready signal을 통해 **원래 Player가 만든 Warrior만 queue_free 1회** 한다. fake Actor/Texture/HP/G/clock/원식·원화 수정 없이 실제 Node 수명 손실을 재현한다.

| 검증 묶음 | 현재 증거 |
|---|---|
| 실제 원 노드 fault | Player1회/Warrior 실제child/queue_free1회 |
| 소비와 실패 | 최초 검사1회, NOT_READY target_queued_for_deletion, 원 error 보존 |
| 정리 | 새Player/World weakref 소멸, replacement0 |
| 시작 중단 | camera/HUD/capture 필드·트리노드 없음, Main physics/input off |
| 실패 조회 | live NR/0frame/0target, frozen report·read count 보존 |
| 범위 | native_loaded_resources / full_main_ready=false / public_play_proven=false / source_wait_complete=NOT_PROVEN / stage_complete_published=false |
| 합계 | 첫12checks PASS / failed0 / exit0 / SCRIPT0 / Parse0 / 예상push_error1 / 예상밖ERROR0 / WARNING0 |

실행1.851974083초, product/test 수리0, 성공 suite 재연0. 앞선99f6의29개 PASS와 ROOT32/117/145/88/71은 동결이며 이번에 다시 실행·복사·읽지 않았다. 서로 다른 episode의 수를 합산해 전체 엔진 검증으로 세지 않는다. 첫 실패 검사 뒤 cleanup comment3줄만 수정했으며 executable source 동일; 재연0. source SHA와 comment-only comparison은 증거에 별도 기록한다.

새UID1(primary WORK·stage 부재 확인) 생성0.254949334초/exit0/error0/import0/duplicate0/runtime group0. code/cache metadata 격리 사본+readonly assets/data/imported 링크, userdata EXODUSER-MainSpriteStartupLoss-Isolated-20261014. qa/latest-session.json 생성false; gameplaySave/API/server3333/인간Main37406/browser 조작0. 실패가 capture 생성 전이라 QA session도 생성하지 않았다. 전체 load/자동 physics tick/GPU/공개 픽셀은 이번 검사 계측 없음.

기존 새 자원 inspector의 scope와 current24 gap은 [Main 자원 연결](FDG_GODOT_NATIVE_MAIN_SPRITE_READINESS_FIRST_20261014.md)을 따른다. map geometry/collision/outer mass/카메라 원근 수정0. **VISUAL VERDICT: RETOUCH**, 원화 치마·전신·무기와 모델링/움직임/VFX는 실제 시각 인수가 필요하다.

증거 E/dependency-native-main-sprite-startup-loss-first/{before-edit,stage-preparation.json,metadata/first-receipt.json,tests/attempt01-preledger.json,tests/attempt01-receipt.json,tests/comment-only-final-sync.json,docs-search,checkpoint}. code+docs 정상 checkpoint는 checkpoint/checkpoint-receipt.json.
