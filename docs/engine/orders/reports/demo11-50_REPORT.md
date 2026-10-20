# DEMO11-50 — 설정 차단 해소·현재 OPT 설정 UI

## 2026-10-21 눈 검수 RETOUCH — 슬라이더·토글

사용자 PASS인 패널·탭·드롭다운·폰트 배치를 보존하고, HSlider의 흑철 트랙(8px)·금빛 채움·뼈색 테두리 마름모 손잡이(22×30)를 적용했다. 헤어라인은 rgba(164,147,115,.5), 채움 #9c8457/#b9a075다. panelFit 및 전체화면 CheckButton은 같은 테마의 88×40 아이콘과 26×26 손잡이, 켬 체크/끔 가로획으로 상태를 구분한다. 기존 native 키보드·드래그·toggled 신호와 commit 경로는 유지한다. 아이콘은 로컬 SVG 코드로 구성하며 원본 이미지 변경0, 새 표시 문구0/추가 번역키0이다. 최종 시각 승인은 맥북총괄 재검수 대기다.

최신 fetch origin/main `0138c5bb9188d27cee10cb1a901d075092ddb88f`를 정상 merge `61de88f365d56d202a70887ca13dd7bdaeeb495d`했다. add/add 충돌의 main 로비용 native_settings_lobby_bridge.gd 및 UID는 origin/main byte 그대로 보존했다. 자체 S10 구현은 native_settings_preferences.gd/UID로 이름만 분리(기존 구현 byte 동일)하고 pause preload27 한 줄을 바꿨다. 로비 언어·장치 API를 설정 저장 API로 덮어쓰지 않기 위한 판단이다. UI_FOUNDATION/WORK_BOARD 충돌은 양쪽 절/행을 모두 보존했다. main으로부터 들어온 변경과 이번 자체 변경은 구분하며 Main/State/전투 자체 수정0이다. 공용 자체 변경은 pause27 preload 1줄(+1/-1, merge 해결)뿐이고, retouch는 panel76·115·130 및146–169(+27/-2)다. 틱 함수/목록 생성API 추가0, 성능 벤치 미실시다.

실제 GPU 관련 통합 suite `test_demo11_50_settings.gd` **1회 53/0, skip0**, 종료0·ERROR0·override0bytes. 기존 실제 UI 조작/실패prefix/저장 및 새 Main 복원/보호BINDS·난이도 보존 검사까지 포함한다. stderr에는 Main264의 Camera2D physics interpolation WARNING1건이 있으며 원문 보존, 자체 경고 수정은 하지 않았다. 임포트 종료0·ERROR0. 다른 회귀 중복 실행0. 매 Godot 실행 전 프로세스 수 gate 로그를 남겼으며 실제 사용자 저장 폴더 접근0이다.

현재 캡처 `~/exoduser-wt/_out/demo11-50/captures/01-system.png`, `02-sound.png`는 각각1920×1080, 대응 `*-1x.png`는 좌표(410,10) 1100×1060 무배율 크롭이다. 두 전체 화면을 도구로 확인해 금빛 채움·손잡이와 OFF 토글의 테두리/가로획이 보이는 것을 확인했다. 최초 제출 캡처는 captures/pre-retouch-5ac5dcfc/에 보존한다. 새 원로그·gate·명령·tested byte 해시는 `_out/demo11-50/retouch-20261021/`, 최종 SHA/원격일치/R불변/제거는 DONE.txt 참조. PC 실행·동기화 미확인.

기준 origin/main `45be76e49d0090316b91a6b7b383d81835e29192`, 의존 DEMO11-09 `dc9f34ea49347de328c1ba66db85671ba442c9e6`, 정상 merge `319ca387c11f5ed9c2e17d4f0532eac6b3a7c768`. 브랜치 `codex/demo11-50-20261021`. CHANGELOG 충돌은 최신 main 전체 byte를 보존하고 의존09 절만 위에 유지했다. force/rebase/reset/main push0. R은 실제 실행 source가 아니며 sparse WT→동일 byte의 격리 project에서 검수했다. PC 실행/동기화는 미확인이다.

## 차단 해소와 공용 변경

| 파일/접점 | 이번 단위 diff / 최종 줄 | 구현·판단 근거 |
|---|---|---|
| source_options_state.gd | +33/-1,9·94–125 | game.html6311의 textScale100/panelFittrue/diffV2=1 초기화. 실제38필드·기존 Dictionary identity. 허용7필드 validation/commit은 이 owner 한 곳, read-time fallback/복제 OPT0 |
| demo_local_storage.gd | +4/-2,10·126–128 | 기존 DEMO11-05 IO/락/UTF-8/rename/영수증 재사용, 원본 hellcave_settings·hellLang·hellcave_screen 허용. settings 객체와 언어 원문 문자열을 구분, 기존 Player save 키 처리 불변 |
| project.godot | +1/-1,9 | 기본 native demo 폴더 EXODUSER-demo11-Demo. 기존 사용자 Native-First 폴더는 계속 adapter 거절/접근0. 설정 IO를 실사용 경로에 열지 않기 위한 필수 분리이며 시험은 별도 작업ID override만 사용 |
| native_demo_pause_menu.gd | +14/-8,10·17·27–28·48–49·65·71–76·161 | 새 bridge와 설정 panel 연결, 준비중/BLOCKED 반환을 실제 writer에 위임, Q 패링·E 방패(불꽃칼날) 안내. Esc/back/resume/review 우선순위 보존 |
| Main/State 및 전투 | 이번 자체변경0 | Main은 의존09 merge의 +10/-0만(4–6·332–334·1668·1679–1681). State/player/world/HUD/QE·hurtE/hurtP·분노·방패·docs2_3 자체변경0, 기준merge 대비 byte 동일 |

신규 native_settings_preferences.gd(S10, 최초 제출명 native_settings_lobby_bridge.gd)와 native_settings_panel.gd(S02/S04/S09)가 기존 OPT/입력/IO owner만 호출한다. 사용자 지정 S10은 이번 설정 저장·복원 허가로 인수하며, 최초 추적 순서안의 로비/장치 read-only 후보와 보호 HOLD를 임의로 전체 이식하지 않는다. S01 missing/loss 진단은 유지하고 실제 initializer의3필드를 보완했다. 원본 game.html SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`,6311·48876·48879–48904·49062–49066·49208–49255·49395–49437 근거. 원본/대형 JSON을 모델 출력으로 전수 덤프하지 않았다.

설정은 시스템/화면/사운드/조작4탭. 볼륨0..100, ko/en, 원본 cap30/60/**120**/144/244/0, fullscreen/windowed, textScale80..160/10·panelFit·shake를 한 제어씩 연결했다. 현재 Main 지원 언어가2개여서 다른 언어를 번역 완료처럼 제공하지 않는다. cap은 Engine.max_fps이고 물리60Hz 및 scheduler 본문을 수정하지 않는다. 안내 글자 확대는 현재 설정 UI의 소비 범위이며 전체 HUD/기존 guide 일괄 이식 완료가 아니다. 키 변경/리스닝/reset/장치 inputMode 변경은 제공하지 않는다.

S10은 원본 {binds,binds2,opt} JSON 및 별도 hellLang 원문·screen {mode,res}를 기존 adapter에 저장한다. 신규 payload는 실제 현재 입력 프로필을 캡처하고, 기존 정상 payload는 binds/binds2·보호/미확인 opt·상위 추가필드를 보존한 채 허용7필드만 갱신한다. 복원은 허용 opt→독립 최신 hellLang 순서이며 BINDS·난이도·구 QE/키 이관을 실제 owner에 적용하지 않는다. 테스트에서 disk parry=KeyF/diff10/미확인 필드를 보존해도 실제 Q/난이도5가 유지됨을 확인했다. 전체 Player/slot save 복원 증거가 아니다.

IO ready는 영수증 가용성이지 commit 성공이 아니므로 settled/committed/cleanup까지 확인한다. live OPT/consumer 반영 후 저장 실패는 그 prefix와 실패 문구로 노출하며 가짜 저장/자동 rollback0. JSON 숫자120.0은 정수값 검사 후 원본 cap120에 대응하고120.5는 거절한다. 저장소 진입 거절 시에도 허용 기본 OPT consumer(cap/locale)는 적용하며 저장 복원을 성공으로 표시하지 않는다.

## 검증 결과

| 검증(선택 scope/격리) | 결과 | 근거 |
|---|---|---|
| 신규 headless, 작업 격리 | 41/0, skip0 | 초기 통합 단계. 실제 OPT identity·각 UI 제어·IO lock 실패 prefix·잘못된 저장값·owner 상실·새 Main 복원 |
| 신규 실창 GPU, 작업 격리 | 53/0, skip0, ERROR0 | 보호 저장필드 보존3검사 추가, Window.mode fullscreen→windowed 실제 readback, 언어/120cap/물리60/포커스 유지 및 최초 캡처 |
| 최종 캡처 전용 | 10/0, skip0, ERROR0 | 시각 RETOUCH 뒤 crest/선택 색 보강. 기능 suite 반복 없이 실제 Main·기존 IO 복원으로2뷰+1x 재촬영 |
| S01 unit / actual_main | 112/0 +12/0, 각 group1회 | EXODUSER-settings-s01-Isolated-20261020. unit의 missing35 fixture는 그대로 NOT_READY. 실제 Main만38 READY 기대값으로 갱신, 저장 거절 namespace에서도기본cap0/physics60 확인 |
| 기존 pause / 저장 adapter | 25/0 +79/0, 각1회 | EXODUSER-demo11-09-Isolated-20261021 / EXODUSER-demo11-05-Isolated-20261021. blocked→ready 계약 assertions만 갱신, back/pause/review/InputMap/QE identity·기존 IO79검사 유지. 관련 회귀 합228/0 |
| 보호·성능·source | 원본/전투/Main/State byte 동일, 목록생성API0 | audit.json / source-contracts.json / final-source-files.json. 새 UI·bridge에 tick callback0, 별도 성능 벤치 미실시 |

초기 신규 new36중3실패·new-diagnostic37중3실패는 원로그 보존: JSON 복원 float120.0을 cap 정수 Array.has가 거절하고 Dictionary 비교가 int/float 캐리어 차이를 값 불일치로 취급했다. integral 검사+int cap 비교로 수정, 테스트 비교는 수치 정확일치(허용오차0)와 bool/string/키 수 엄격성 유지 후41/0, 이후 GPU53/0. 보호 입력/저장 체크를 삭제하거나 실패를 PASS로 세지 않았다.

S01 첫 호출은 하니스가 중복 `--`/불필요 node 인자를 붙여 test 진입 전 INVALID exit2(검사0). strict S01에는 --only 인자만 전달하도록 하니스를 바로잡고 재실행했다. 실제 unit/assertion은1회다. UI+IO는통과 후 시각 보강만 했고, IO 불가 시 기본 consumer 적용 분기는 S01 actual_main12/0에서 별도 확인했다. Camera2D physics interpolation WARNING는 원문 보존, WARNING0 주장0.

핵심 결함 주입은4종: invalid/protected setting 묶음(숫자/언어/범위/키), 실제 writer lock(IO prefix), 잘못된 저장 옵션, owner 상실. 원본 저장 어댑터 자체79검사 외 무차별 주입은 하지 않았다. 모든 실행 결과/명령/UTF-8 출력/실패 줄은 L에 리다이렉트. Godot 전 지정 pgrep>=2일 때30초 대기, 각 override는 지정 격리 이름/종료0byte. 실제 사용자 폴더/Steam/브라우저 저장 접근0.

## 화면·남은 범위·제출

VISUAL VERDICT: PASS（현재2뷰/1920×1080 범위, Mac 총괄 눈 검수 대기）. 최초4 PNG는 룩이 단조로워 RETOUCH로 판단해 captures/initial-retouch에 보존했다. 기존 crest PNG·붉은 선택탭·뼈색 현재탭 문자를 보강한 최종 01-system.png /02-sound.png와 무배율1100×1060 크롭 각1개를 직접 열어 글자·금빛선·선택 구분·잘림을 확인했다. 최종4파일의 크기/SHA는 captures/manifest.json. 새로운 이미지/폰트 자산 생성/변환0, 게임폰트 hell/hell_title/cinzel_hell·기존 crest byte 재사용, 새 산세리프/이모지0. 새 KO/EN23대상은 번역대상_전체목록 등록. viewport1920 외 모든 해상도 시각 PASS를 주장하지 않는다.

BGM 실제 재생 owner는 기존 HOLD라 bgmVol을 저장/복원하지만 소리를 재생했다고 주장하지 않고 UI에도 명시한다. 기존 SFX는 Main의현재 OPT gain reader에 연결(37검증)하며 이중 gain0. 전체 다국어/Steam 언어·기기/inputMode·키 변경·원본 난이도/QE 이관·자동Tier/프리셋/그래픽 전체 컨트롤은 범위 밖이다. 이 제한을 설정 UI/허용 S10 완료와 구분한다.

사용자 취침 중 질문 없이 판단한 핵심은 전용 demo namespace, 기존 저장 보호필드 보존, native 지원 ko/en 제한, 미연결 BGM을 UI에 명시한 것이다. 관련 상세 계약은 docs/3.3 키바인딩+설정/DEMO11_50_NATIVE_SETTINGS_20261021.md이며3.1 설정/FOUNDATION 및 원본 추적 현재 절도 갱신했다.

정상 pre-commit 훅·정확 경로 staging 후 자기 branch만 일반 push, 원격 SHA 일치→L/DONE.txt→자기 worktree/생성 test project 제거 순서다. 원로그·캡처·보고서 사본은 보존한다. L=`~/exoduser-wt/_out/demo11-50/`. 최종 SHA/정리/R 결과는 DONE.txt 및 submission.json.
