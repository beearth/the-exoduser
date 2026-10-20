# P2-009a PC — 레벨업·자원 부족·줍기 피드백

**부분 구현·검수 대기 / VISUAL VERDICT: RETOUCH.** 전체 웹 동등성·정상 플레이·오디오 청감 PASS가 아니다. 보호된 입력/레슨/Q·E/세이브/드랍 담당 파일은 수정하지 않았다.

## ① 원본 근거

기준 `G:/exoduser-wt/codex-p2-009a-feedback-ui`, baseline `c7c910fd04559a78be0e64295a97390d01fd2d09`. 착수 시 fetch 후 origin/main 동일, tracked INDEX/WORK 비어 있음. `G:/exoduser` 본 폴더·사용자 서버3333 미조작.

| 원본 | 이식·제약 |
|---|---|
| game.html 679~680·43609 | showPH 원문/색·500ms/2500ms·현재 공지 교체·.1s fade·bottom180px·25px glow. 번역 기존0338/0339/0340/1044/1049, 동적1523+5 사용. 다른 언어는 기존 World ko identity 범위 밖 |
| 12917·12922~12923·13000~13011 | 얼음보주 차단·ST/악의/MP 부족 알림. 기존 gate if/cost/cooldown은 보존, 공지 호출만 추가. 쿨 단독 거절에 새 문구를 만들지 않음 |
| 43159~43167 | 실제 addExp 성공/levels>0만 연출. PASSIVES 인간/악마 #ffdd00/#d38aff. 기존 SP/AP 텍스트·보상 중복 방출 없음 |
| level-up-vfx.js 4~55·69~131 | 원본 프로시저럴 도형·그라디언트·ADD·3/3.5초·merge .24초·strength 상한1.12·low10/기본18개. 새 그림/AI 생성 없음 |
| game.html 12764~12776·12465~12492·12515~12543 | levelup17층·pickup3층 합성 인자와 스케줄. 원본 JS 직접 실행 oracle. 런타임 합성은 worker로 분리 |
| 28250~28259·54833~54839 | hp→악의 성공 SFX.pickup, st/mp는 버림·무음. SP/AP·+N은 원본 일반 모드 whitelist에 걸려 화면에 숨겨짐 — 억지로 표시하지 않음 |
| 10151·12332~12341·12366 | silvertail_resource_fail 원본16,762bytes 복사·10초 반복 차단·pitch .92~1.08. [자산 명세](P2-009a_ASSETS.json) 1/1 SHA256 동일 |
| 16266~16271 | 장비 drop/pickup은 P2-006a 결과를 읽기 전용 참조. `claude/p2-006a-drop-pickup-20261020` SHA `48f0d8e7874ba0a7ca7c4e1897c9b799d8a03ce6`. 이 기준선에는 해당 어댑터가 없고 복사/병합/중복 소리를 넣지 않음 |

game.html SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`, VFX JS SHA256 `184ebc2114aca1688bb9be07d41d9c115ed0e8a6f86db563898d5ead4c5c8259`. 수치 상세는 [SSOT](../../FDG_P2_009A_FEEDBACK_20261020.md).

## ② 변경 파일·소유권

| 범위 | 변경 |
|---|---|
| 신규 실행자 | native_feedback.gd, native_level_up_vfx.gd, native_feedback_audio.gd, native_feedback_synth.gd, shaders/source_level_up.gdshader·source_ph_glow.gdshader |
| 공용 main.gd | **+1/−0줄**: _ready에 연출 설치. 입력 함수 무변경 |
| 공용 native_source_new_run_state.gd | **+7/−4줄**: 신호·성공 보상 연출 요청·미연결 미이식 목록 유지. 보상 공식·저장 필드 무변경 |
| native_skill_slots.gd | **+21/−5줄**: 공지 호출/도우미·주석/미이식 표기만. 총126개 정적 보호 검사에 원본 gate 조건 존재 검증 포함 |
| 공용 나머지 | hud.gd·world.gd·player.gd·native_normal_enemy_hurte.gd **0줄**, 레슨·docs/2_3·장비 드랍 어댑터 **0줄** |
| 검수 | test_p2009a_feedback/recheck/source_oracle/extra_contracts/worker_audio/audio_gain.gd, visual_p2009a_feedback.gd, tools/verify-p2009a-feedback.cjs |
| 문서 | 본 보고서·자산 명세·작업판·신규 SSOT/UI 인계·P2-001c/005b/005c/005d 현행 미이식 표기·6사운드디자인 동기화 |

새 원본 MP3만 추가하여 지정 엔진 headless import **1회**, exit0/ERROR0. 기존 캐시에서 import/uid 산출물이 다수 생성되었지만 자기 신규 파일의 메타만 경로 지정 스테이징한다. 그 외 untracked·override.cfg는 커밋하지 않는다. 원본 나눔명조/Cinzel 폰트 소유 P2-007a는 건드리지 않는다.

## ③ 테스트 명령·수치·원로그

엔진 `G:/godot-engine/4.7.2/Godot_v4.7.2-stable_win64_console.exe`, `4.7.2.stable.official.ed1daf0bf`.
로그 루트 **`G:/exoduser-wt/_out/P2-009a-pc/`**. 각 헬퍼 실행 폴더의 command.json에 완전한 argv, `<test>.out.log`/`.err.log`와 runner.log에 원문을 보존했다. 헬퍼 exit0만으로 PASS를 세지 않고 SCRIPT ERROR/ERROR도 확인했다.

공통 헬퍼: `bash C:/Users/심도진/AppData/Local/Temp/claude/G--exoduser/01df6303-6873-40fb-a2e6-1c93fb00612e/scratchpad/run_godot_tests.sh G:/exoduser-wt/codex-p2-009a-feedback-ui/godot <로그폴더> <아래spec>`.
CMD에서 bash가 PATH에 없어 output의 run-tests.cjs가 `C:/Program Files/Git/bin/bash.exe`를 배열 인수로 호출했다. 모든 Main 테스트에 지정 격리명을 사용했고 실행 후 override.cfg를 비웠다. 실제 사용자 저장 폴더는 사용하지 않았다.

| spec / 실행 | 로그폴더 | 결과·경계 |
|---|---|---|
| test_p2009a_feedback:EXODUSER-P2009A-Isolated-20261020 | red | **1검사/1실패**, 소비자 부재 RED |
| 같은 spec 최초 구현 | first | **27/4실패**, 23통과 보존. MP를 P에 직접 쓴 fixture가 read_current_p의 자원 authority 동기화에 덮였고, 의도치 않은 보주 발동이 다음 쿨 검사를 오염. 짧은 실제 시간 여유를 전제로 한 timer 검사도 실패 |
| test_p2009a_recheck 같은 격리 | targeted | **1/0처럼 출력됐지만 SCRIPT ERROR 1건**, PASS 제외. Player.mana도 권위 필드가 아님을 원로그로 확인 |
| 같은 recheck, 실제 commit_native_skill_mana_spend fixture·충분한 timer 여유 | recheck-fixed | **6/0·ERROR0**. 실패4항목+준비/설치. 통과한 최초23항목은 반복하지 않음 |
| `node tools/verify-p2009a-feedback.cjs <로그루트>/source --copy-source-voice` | source | 원본 직접 실행 36 VFX 조합·17/3층 오디오 oracle·1개 자산 바이트 대조. 신규 아트/음원 파일 생성 없음 |
| test_p2009a_source_oracle | targeted | **1260/0·ERROR0** = VFX1098+오디오162. 픽셀·청감 동등성 검사가 아님 |
| test_p2005b_giant_slam:EXODUSER-P2005B-Isolated-20261020 | targeted | **12/0**, 종료 resource ERROR1·ObjectDB2 누수 경고. 이를 완전 PASS로 세지 않음 |
| 위 stderr 실패의 verbose 진단만 재실행, 지정 엔진 `--headless --verbose --script res://tests/test_p2005b_giant_slam.gd` | giant-leak-diagnosis | **12/0·ERROR0**, 누수 재현 안 됨. RNG/수명 의존 원인은 확정 못 했으며 기존 one-shot 경로를 임의 수정하지 않음. 원래 ERROR를 삭제/해결 주장하지 않음 |
| test_p2005c_spike_holy:EXODUSER-P2005C-Isolated-20261020 | targeted | **20/0·ERROR0** |
| test_p2005d_ice_orb:EXODUSER-P2005D-Isolated-20261020 | targeted | **20/0·ERROR0** |
| test_p2001c_kill_rewards:EXODUSER-P2001C-Isolated-20261020 | targeted | **41/0·ERROR0**, 실제 처치 경로·보상/드랍 회귀. 수치/RNG에 적응하는 원래 검사 수 변동 유지 |
| test_p2009a_extra_contracts:EXODUSER-P2009A-Isolated-20261020 | extra-contracts | **13/0·ERROR0**, 악마화 색·번역 번호·보이스 gain/반복·stage 취소·원본 텍스트 whitelist |
| 오디오 이관 후 source_oracle 오디오 부분만(`P2009A_ORACLE_AUDIO_ONLY=1`) | worker-audio | **162/0·ERROR0**. VFX1098은 변경 없어 반복하지 않음 |
| test_p2009a_worker_audio:EXODUSER-P2009A-Isolated-20261020 | worker-audio | **8/0·ERROR0**, 워커·연속 요청·새 파형·보상 비변경·종료 정리 |
| test_p2009a_audio_gain:EXODUSER-P2009A-Isolated-20261020 | audio-gain | **4/0·ERROR0**, 선형gain 0/.6/.36. 0을 −80dB 대용으로 바꾸지 않음 |
| `node G:/exoduser-wt/_out/P2-009a-pc/audit-scope.cjs` 정적 보호 검사 | protected-scope.json | **126/0**, 원본 gate 조건·보호 경로·Main 한 줄·자산·빈 override. 동작 전체 검사가 아님 |

선택된 성공 실행의 Godot 검사는 **1,384 assertions/0 assertion failures**(오디오 이관 재검사162는 기존162를 대체, 중복 합산 안 함). 최초27/4·무효 recheck·giant 초기 stderr ERROR는 이 수치로 지우지 않는다. Camera2D physics interpolation 경고는 기존대로 남는다.

### 실제 창·1x 화면 검수

지정 엔진 `--path <worktree>/godot --resolution 1920x1080 --position 0,0 --script res://tests/visual_p2009a_feedback.gd`, userdir **EXODUSER-P2009A-Visual-Isolated-20261020**. output/run-engine.cjs가 명시 격리 override를 잠시 설정하고 종료 후 비웠다. 자기 검수 앱은 정상 quit했고 기존 사용자 앱/서버를 종료하지 않았다.

| 실행 | 산출물·관측 |
|---|---|
| visual-first | 실제 OpenGL AMD Radeon RX9070XT·1920×1080. DisplayServer.screen_get_image에서 **자기 창 client 영역만 저장한 OS 캡처**와 viewport readback 별도 보존. levelup/ST/MP/pickup 각 원배율 PNG |
| 대상 crop | levelup `(780,245,360,365)`, ST/MP `(650,815,620,115)`, pickup `(780,390,360,240)`의 **1x get_region, 리사이즈0**. 실제 player screen `(960,540)` |
| visual-glow | 초기 shadow-outline 근사를 제거한 뒤 **변경된 공지 3종만** 재검수(`-- --notice-only`). LEVEL UP!/ST/MP OS 1920×1080 및 위 알림 crop. 새 임의 디자인/문구 없음 |
| 판정 | 알림 원문·위치·색·가독성, 원본형 빛기둥·링·Lv.2 확인. +N/SP 비표시는 원본 whitelist와 같음. **RETOUCH:** 나눔명조/Cinzel 및 Canvas/Godot 래스터 동등·수동 전투는 미확인 |

스크린샷은 원본 크기로 직접 열어 확인했다. 하니스는 보상 소유자 직접 호출·G.on 활성·ST fixture1회·MP 권위자 drain1회·기존 텍스트 소비자 호출을 포함한다. 자연 처치로 레벨업한 정상 무개입 플레이 증거가 아니다. 장비 바닥/줍기 소유자는 이 브랜치에서 부팅하지 않았다.

### 지연 진단과 최소 수정

visual-glow에서 최초 게임 스레드 합성 **50,396µs** 관측. 그대로 품질 PASS하지 않고 합성을 RefCounted worker로 이동했다. worker-audio 원로그: 첫 요청 dispatch **673µs**, 준비 파형 사용까지 **746µs**, worker 자체 **50,237µs**. 연속 두 번째 levelup dispatch **655µs**, 완료 대기 **83,566µs**, worker **50,412µs**. 실행 조건이 다른 단발 관측이므로 FPS 개선율·p95/p99로 주장하지 않는다. cold/연속 소리 지연은 남고 게임 스레드에서 파형 생성을 하지 않도록 분리한 것만 확인했다.

## ④ 커밋·원격

브랜치 `codex/p2-009a-feedback-ui-pc-20261020`에만 경로 지정 commit/push한다. 구현·검수·문서 본체 SHA는 이 보고서를 갱신하는 후속 receipt commit에서 기록한다. 최종 receipt SHA와 원격 ref 대조는 최종 메시지로 보고한다. main 병합/push·태그·배포 없음.

## ⑤ 남은 것

1. P2-006a 장비 drop/pickup 실제 통합은 총괄이 선행 브랜치를 인수한 뒤 필요. 해당 코드·189개 기존 자산을 중복 커밋하지 않음.
2. 원본 공용 EQ3·soft-knee compressor·global audio cap/우선순위, 물리 스피커 청감, 여러 효과가 겹친 동등성 미이식/미검수. 부분 합성/보이스 연결을 전체 SFX 이식으로 부르지 않음.
3. 나눔명조/Cinzel(P2-007a 소유), 정수 폰트 양자화(28.8px/.2em→29px/6px), Canvas/Godot 픽셀 동등성, 수동 전투/자연 레벨업·장비 줍기 검수 미완.
4. giant-slam 첫 종료 resource ERROR는 verbose에서 재현 안 돼 **원인 미확정 잔여**. 오디오 이관 후 새 worker/gain 테스트는 ERROR0이나 해당 기존 경로가 고쳐졌다고 주장하지 않음.
5. holyDome 성공 pickup·추가 미이식 스킬·초월 게이트·예약 패시브 큐/그 공지·세이브는 건드리지 않음. PC/Mac/main 전체 동기화·export/package/배포 검수 아님.
