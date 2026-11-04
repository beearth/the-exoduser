# QA-003 — main 종료 리소스 잔류 소유자 진단 (2026-10-20)

작업ID `qa-003`, 브랜치 `codex/qa-003-20261020`. **인트로는 하니스 종료 정리, UI의 17개는 제품 소유권 결함**으로 분리한다. UI 제품 수정은 사용자 지시에 따라 BLOCKED로 남기고 원인·수정안만 제출한다. 전체 ERROR 0이나 UI 수정 완료로 보고하지 않는다.

## 실행 기준·보존

| 항목 | 근거 |
| --- | --- |
| 기준 main | 기존 `~/exoduser-wt/qa-003` 없음 확인 → R에서 `git fetch origin` → `origin/main=284d7faf49295b2f5061937a47ce96038032ed3c`로 새 worktree 생성 |
| 실행 경로 | `/Users/fordeargamers/exoduser-wt/qa-003/godot`; 원로그 `/Users/fordeargamers/exoduser-wt/_out/qa-003/` |
| R 보존 | `/Users/fordeargamers/Projects/exoduser-migration-20261001`; 시작 branch `codex/mac-live-play-time-main-20261017`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`, tracked INDEX/WORK 빈 상태. `preflight.json`·`final-evidence.json` 대조 |
| Godot | 기존 `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot`; 앱 복사·다른 버전 사용 없음. verbose 시작 로그에 `4.7.2.stable.official.ed1daf0bf` |
| 부하 제한 | 매 실행 직전 `pgrep -f "Godot.app/Contents/MacOS/Godot" \| wc -l`. 2 이상이면 30초 대기 후 재조회, 0/1일 때만 실행. 각 JSON `guard`에 시각·실제 개수 보존. 자체 실행은 직렬; 타 작업 프로세스 중단·재시작 없음 |
| 저장 격리 | 기존 suite는 각각 `EXODUSER-P2001I-Isolated-20261020`·`EXODUSER-P2007A-Isolated-20261020`. import와 새 진단 복사본은 `EXODUSER-qa-003-Isolated-20261020`. 각 실행마다 override.cfg 작성, finally에서 0byte로 비움 |
| 사전 백업 | `before-tests/`에 원본 테스트 2개 byte 백업. import 전 App Support/Godot 68파일을 `before-godot-appsupport/`에 복사·SHA-256 대조(`preflight.json`) |
| 편집 범위 | `test_p2001i_boot_intro.gd` 종료 대기 3줄과 본 보고서·CHANGELOG만. UI 테스트·제품 파일·공용6파일·타 담당 파일 0줄 |

## 최신 main 원본 값과 검사 보존

아래 행은 실행 기준 main의 실제 `game.html`이며 `source-evidence.txt`에 행·파일 해시를 보존했다. 과거 보고서 행을 현재 값으로 추정하지 않았다.

| 항목 | 현재 원본 근거 | 이번 보존 |
| --- | --- | --- |
| 인트로 전 적 비움·잠금 | `game.html:63279` ens.length=0; `:63282` G._intro=true/G.on=false/iframes9999 | 기존 부팅·키 입력·state 검사 유지 |
| 가이드 종료 | `:63342–63349` done/opacity0/pointer-events none, curtain 호출·900ms dispose | 기존 전이 기대값 유지 |
| 음성 | `:63403–63407` playSample('voice_wakeup',1,1), 비동기 decode 후 재생 | 제품 음소거·stop·stream null·재생률 조작 없음 |
| 커튼 링·모닥불 | `:63424–63429` 반경580·5마리; `:63431` t300/r280; `:63412` G.on=true/iframes600 | 5링·HUD·G.on·g_on·bonfire 단정 그대로 |
| 글꼴 | `:103–104` 로드 가족·굵기; `:115,117–118` body/hell/title 스택 | UI 115검사의 기대값·상수·임계값 그대로 |
| 레슨 적 임시 보관 | `parry-lesson.js:397–398` saved.ens와 ens=[]; `:689` ens=this.saved.ens | JS 배열과 Godot의 수동 Node 수명 차이를 진단; 원본 동작 변경 제안 없음 |

`no-weaken-proof.json`: 추가한 종료 3줄을 제거하면 인트로 원본 byte와 일치한다. UI 테스트는 원본 byte와 동일하다. `_check`·GROUPS·조건·임계값·기대값·skip·결과 판정 수정 0. 시드나 fallback 추가 0.

## 실측 결과

모든 실행은 `--verbose --headless`. 실행 당시 HEAD는 기준 main이며 수정 후 테스트 입력은 각 JSON의 source_sha256로 원본과 구분한다. ERROR는 `.err`의 `^ERROR:` 행, WARNING은 `.err`의 `^WARNING:` 행, 개별 leak/resource는 `.out`와 `.err`의 verbose 원문을 센다. exit 0과 assertion 실패 0만으로 통과 처리하지 않는다.

| 원로그 basename | 검사/실패 | exit | stderr ERROR | WARNING | Leaked instance | Resource still in use |
| --- | --- | --- | --- | --- | --- | --- |
| `import` | import | 0 | 0 | 0 | 0 | 0 |
| `baseline-intro` | 18/0 | 0 | 0 | 1 | 0 | 0 |
| `baseline-ui` | 115/0 | 0 | 21 | 3 | 66 | 18 |
| `probe-ui` | 115/0 | 0 | 24 | 3 | 66 | 18 |
| `owner-intro` | 18/0 | 0 | 1 | 2 | 2 | 1 |
| `owner-ui` | 115/0 | 0 | 21 | 3 | 66 | 18 |
| `fixed-intro-01` | 18/0 | 0 | 0 | 1 | 0 | 0 |
| `fixed-intro-02` | 18/0 | 0 | 0 | 1 | 0 | 0 |
| `fixed-intro-03` | 18/0 | 0 | 0 | 1 | 0 | 0 |
| `drain-ui` | 115/0 | 0 | 21 | 3 | 64 | 17 |

`baseline-intro`의 ERROR 0은 한 번 재현되지 않은 관측이다. `owner-intro`에서 같은 18검사를 유지한 진단 복사본으로 음성 리소스 1개를 재현했다. baseline UI는 원문의 17개에 음성 1개가 더 남아 18개였으며, 21 ERROR = 종료 시 orphan 노드 경로 조회 20회 + 리소스 요약 1회다. 경로 조회 오류는 테스트 본문 실패와 구분한다.

`probe-ui`는 첫 진단 도구가 Main을 트리에서 분리한 뒤 AudioStreamPlayer.get_path()를 조회해 추가 ERROR 3개를 만들었다. 이 진단 실패를 보존하며 검증 통과에 포함하지 않는다. 당시 소스는 `probe-ui-initial.gd`로 복원했고 실행 JSON의 source_sha256과 일치한다. 후속 `owner-*`는 name·ID만 읽어 이 부작용을 제거했다. 진단 복사본은 저장소에 추가하지 않았다.

## 인트로 1개 — 하니스 종료 타이밍

`native_intro_key_guide_panel.gd:625–634`: `VoiceWakeup` AudioStreamPlayer를 패널 자식으로 만들고 `:628`에서 voice_wakeup.mp3를 load, finished→queue_free 연결 후 play한다. `owner-intro`에서 실제 소유 객체 ID와 종료 verbose ID가 모두 일치했다.

| 객체 | 소유 노드에서 읽은 unsigned ID | 종료 leak ID 일치 |
| --- | --- | --- |
| AudioStreamMP3 | 9223372278077592481 | true |
| AudioStreamPlaybackMP3 | 9223372278127924127 | true |

GDScript JSON의 signed int ObjectID에 2^64 modulo를 적용해 verbose unsigned 표기와 비교했다(`intro-audio-id-comparison.json`). 같은 시점 lesson phase=idle/active=false여서 이 실행에는 아래의 detached lesson 적이 없다.

QA-002(`073c7a6af`에 병합된 B/C 방식)를 따라 `test_p2001i_boot_intro.gd:44–46`에 Main.free 뒤 process_frame 12회만 추가했다. AudioServer 정리 기회를 주는 테스트 종결 대기다. 제품 오디오를 조작하거나 음성 재생 검사를 건너뛰지 않는다. 12프레임을 모든 장치·부하에서 충분한 시간으로 일반화하지 않는다.

수정 후 실제 suite **3/3회 모두 18검사·실패0·SKIP0·exit0·ERROR0·ObjectDB 경고0·개별 leak0·잔류 리소스0**이다. 그룹 분모는 매번 8/5/5로 기존 baseline과 일치한다. Camera2D 보간 WARNING 1회/실행은 그대로 보존했다.

## UI 17개 — 제품 결함 확정 / 수정 BLOCKED

소유 흐름은 `native_parry_lesson_flow.gd:742–744`의 `_saved_enemies = world.detach_native_enemies_for_lesson()` → `world.gd:2857–2866`의 remove_child(enemy)·배열 보관이다. 완료 경로 `native_parry_lesson_flow.gd:757–768`에는 restore·배열 비우기가 있지만 영구 파괴 시 `_saved_enemies`의 트리 밖 Node를 free하는 종료 처리는 없다. Node는 RefCounted가 아니므로 배열 참조를 잃는 것으로 해제되지 않는다.

UI 두 번째 그룹은 실제 레슨 패널을 확인한 뒤 다음 `_boot(false)`에서 이전 Main을 free한다. 레슨 완료 전 해제된 실제 lesson owner가 부모 없는 적을 남긴다. 마지막 독립 host.queue_free만이 원인이라는 초기 가설은 verbose 소유자 대조로 기각했다. 하니스에서 `_finish()`를 강제 호출하거나 detached 적을 대신 free해 제품 결함을 숨기지 않았다.

`owner-ui`에서 `_saved_enemies`의 5마리 전부 parent=null·inside_tree=false·queued=false였고 다음 ObjectID가 종료 leak와 정확히 일치한다(`owner-id-comparison.json`).

| 적 | ObjectID | leak 일치 |
| --- | --- | --- |
| ch1_curtain_ring_01 | 246960622437 | true |
| ch1_curtain_ring_02 | 251087817589 | true |
| ch1_curtain_ring_03 | 251456916298 | true |
| ch1_curtain_ring_04 | 251826015048 | true |
| ch1_curtain_ring_05 | 252195113798 | true |

자식 CollisionShape2D 5개·Sprite2D 10개도 15/15 exact ID 일치. 해당 script ObjectID도 leak와 일치한다. `enemy_melee_flesh_crawler.gd:135–147`가 shape와 8방향 base/walk texture를 소유한다. 잔류 Resource 17개 = `enemy_melee_flesh_crawler.gd` 1개 + `atlas_ch1_8dir_{south,south_east,east,north_east,north,north_west,west,south_west}.png` 8개 + 대응 `atlas_ch1_8dir_walk_*.png` 8개. 음성 잔류는 별도 1개다.

`drain-ui`는 진단 복사본에만 마지막 Main.free 뒤 12 process_frame 대기를 넣은 비교다. 이 결과는 제품 결함을 하니스 대기만으로 해소할 수 있는지 확인하는 진단이며, 기존 UI 테스트 변경이나 최종 통과 증거로 사용하지 않는다. 실측은 **115/0·SKIP0·exit0이지만 ERROR21·leak64·리소스17**이다. 음성2객체/1리소스만 사라지고 제품의 적5마리·자식15개·관련 리소스17개는 남아 대기만으로 해소되지 않음을 확인했다. UI 그룹 분모 31/22/24/30/8도 baseline과 같다.

**제품 담당 수정안(미적용):** `native_parry_lesson_flow.gd`의 영구 파괴 알림(`NOTIFICATION_PREDELETE` 등)에서 이 owner가 보관한 `_saved_enemies` 중 유효하고 parent=null인 노드만 해제하고 배열을 비운다. 트리에 복원된 적은 World가 소유하므로 중복 해제하지 않는다. 단순 트리 이탈/재진입과 영구 파괴를 구분한다. 파괴 중 `_finish()` 전체를 호출하면 gameplay state·HP·좌표 복원을 건드리므로 별도 자원 해제 경로가 적합하다. 공용 world/main 수정 없이 소유 모듈에서 처리 가능한지 제품 담당이 확정한다.

**수정 후 인수 조건:** 제품 담당 변경으로 ①레슨 활성 중 Main 영구 파괴 시 detached 5마리·자식·17리소스 해제, ②정상 finish 시 적 복원 유지·중복 해제 없음, ③트리 이탈/재진입 계약 유지, ④원본 UI 테스트 115검사·실패0·SKIP0 및 verbose 리소스/ObjectDB/ERROR 0을 실제 확인한다. 이번 작업에서는 제품 수정·위 인수 완료를 주장하지 않는다.

## 제출·한계

- 인트로 하니스 수정과 UI 제품 진단을 자기 브랜치로만 제출한다. main push·force·훅 우회·git add -A 없음.
- 원로그·진단 복사본·실행 명령·시각·격리명·source_sha256·guard·정리 결과는 `_out/qa-003/`에 보존한다. 최종 branch/SHA/수치는 같은 디렉터리 `DONE.txt`를 따른다.
- 관련 docs 키워드 전수 검색 결과 `docs-keyword-search.txt` 보존. 기존 UI·부팅 기능 문서는 제품 동작 변경이 없으므로 역사 검수값을 덮어쓰지 않고 본 진단을 CHANGELOG에서 연결한다.
- 기존 Main/save·타 팀 격리 폴더·사용자 실행창 변경 0. Godot가 만든 로컬 import/UID 메타데이터와 빈 override.cfg는 커밋에 포함하지 않는다. PC·GUI·청감·장시간 제품 수명 검증은 이번 범위 밖이다.
