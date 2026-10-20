# P2-001i — 실제 부팅 → 인트로 → 커튼 오픈 자동 연결 (2026-10-20)

## 원본 부팅 흐름표 (현 리포 game.html 행)
| 단계 | 행 | 원문 | Godot |
|---|---|---|---|
| 부팅 분기 | 64483 | bosstest → 즉시 G.on=true·iframes 300 | 하니스 우회에 상응(아래) |
| 〃 | 64484 | G.stage===0 → 인트로 컷신 → 인트로 | **이번 배선 경로** — 컷신(영상/대사)은 첫 이식본 범위 밖이라 '컷신 완료 후' 분기로 바로 진입(근거 기록) |
| 〃 | 64486~64487 | 비0 스테이지 → 즉시 on·300 | 해당 없음(stage0 고정) |
| 인트로 시작 | 63277~63293 | _startIntro: **ens.length=0**(63279)·OPT.diff=5 강제(63358)·bonfire.t=0·G._intro=true·G.on=false·iframes 9999·커튼 닫힘 | sequence.begin — **ens 전제거 이번에 구현**(world.clear_native_enemies_for_intro) + HUD 숨김 |
| 가이드 | 63357~63407 | 4컷 키 안내(Enter/Space 진행·Esc/2s홀드 스킵·250ms 쓰로틀) | 키 입력(Enter/Space/Esc)·쓰로틀 동작, **패널 UI는 잔여 목록** |
| 종료 | 63342~63348 | _finishIntroGuide → _openIntroCurtain | sequence.finish |
| 커튼 오픈 | 63411~63441 | G.on=true·iframes600·퍼지·**580px 오각 5링**·bonfire(t300,r280)·0.8s 열림·+900ms 정리 | P2-001h 그대로 + **HUD .on 표시(63414) 이번 배선** |

## 변경 (main.gd **3줄**: const 1·var 1·_ready 호출 1)
- `main.gd`: `source_intro_sequence = IntroCurtainSequenceScript.install_native_boot(self)`.
- `native_intro_curtain_sequence.gd` `install_native_boot(main)` static: 정상 부팅(기본
  SceneTree)이면 자동 begin — **커스텀 SceneTree 스크립트(테스트 하니스) 부팅은 원본
  테스트 우회 분기(63278 _wantPlateTest / 64483 _bossTestReq)에 상응해 휴면 설치**(기존
  테스트 기준선 불변). 하니스가 인트로를 원하면 add_child 전
  `main.set_meta("native_intro_boot","intro")`.
- `world.clear_native_enemies_for_intro()`: 63279 `ens.length=0` — 설치/동적 적 전부
  제거(레지스트리·order맵·phase 엔트리 정리; encounters 리포트는 동결 기록 유지 —
  원본도 레코드가 아니라 live 배열을 비움).
- `hud.set_native_intro_hud_visible(bool)`: 63414 .on 토글(hud/hudTop/hudCorner/mmWrap/
  skBar/mmLvl/globeHP/globeMP) — 이 포트의 해당 요소는 전부 PublicHUD 루트 아래라 루트
  가시성이 같은 의미(63287 부트로딩 숨김 포함). 커튼 뷰는 형제라 영향 없음. (hud.gd
  추가 ~9줄, 표시 플래그 연결만.)
- sequence begin/finish에 위 둘 배선(+configure 5번째 선택 인자 hud).

## 첫 스테이지 초기 적 구성 — 원본과 동일해졌는가 (지시 2)
원본 stage0 신규 게임: initStage가 다안육괴 2+게이트 무리를 깔아도 **_startIntro(63279)가
전부 제거** → 커튼 오픈의 5링만 남고, 이후는 소환굴 타이머 스폰. Godot 부팅(인트로 경로):
encounters 설치분(현 6 액터)이 begin에서 전부 제거(E2E 실측 intro_enemies_cleared=6) →
커튼 오픈 후 정확히 5링만(E2E: world.get_enemies()==5·전원 ch1_curtain_ring_*) — **동일**.
잔여 차이는 소환굴 후속 스폰 시스템 미이식(기존 잔여)뿐.

## update clock / 타이머 상태 (정직 보고)
G.on 점등(P2-001h state owner)으로 **g_on 게이트(32580)는 열림** — E2E가 실제 state G
dict에 producer를 적용해 증명(인트로 중 RETURNED → 오픈 후 CONTINUE). 단 **라이브
파이프라인은 g_on보다 앞의 미소유 관측**(phase_system_lesson presence — services의
observation이 `{}` 스텁)에서 NOT_READY로 멈춰 있어 stageTime 실진행(32742)은 아직 안
열린다(그 뒤 panel_inputs 등 gap도 미소유). 이는 P1-002.D services 소관 잔여로, E2E가
live update_clock_result를 관측 기록한다.

## 검증 (원로그 G:\exoduser-wt\_out\p2-001i\logs_final\)
- 신규 `test_p2001i_boot_intro` **18/0**(격리 EXODUSER-P2001I-Isolated-20261020): 부팅
  자동 기동(메타 intro), 커튼 닫힘·HUD 숨김·ens 전제거·G._intro/on·iframes9999, 실키
  입력(Enter 1스텝·Esc 스킵), 오픈 후 G.on=true·g_on CONTINUE·정확히 5링·HUD 표시·
  bonfire 진행·clear 계수.
- `test_p2001h_curtain_spawn` **124/0**(begin의 ens 전제거 단언 반영 갱신).
- 회귀: p1002e 80/0 · p1002f 269/0 · p1002g 220/0 · p2001a 31/0 · p2001b 37/0 ·
  p2001c 45/0 · p2002a 38/0 · p2002b 16/0(신규 에셋 --import 후) · update_clock 30/0 ·
  intro_curtain 2종 PASS · contracts 5/0 · encounter_factory 3=기준선 · etype0 1=기준선 ·
  initialization 2실패=병합 main 선재(P2-001h 문서 기록 동일).
- 화면·영상: `G:\exoduser-wt\_out\p2-001i\godot_boot_curtain_720p.mp4`(0.54MB, 커튼
  닫힘→오픈→+5초, 20fps·실창 149fps) / `web_boot_curtain_720p.mp4`(1.31MB, 같은 구간 —
  웹은 커튼 직후 **패링 레슨이 자동 개입**(미이식 잔여)해 레슨 스킵 후 구간으로 정렬) /
  정지 대조 `cmp_p2i_open_phase.png` — 금빛 결계·HUD·5링 접근 구도 정합.

## 잔여 (목록)
1. 가이드 4컷 패널 UI(원본 텍스트/레이아웃 63357~63407)·voice_wakeup — 입력 진행만 이식.
2. ~~커튼 직후 패링 레슨 자동 시작~~ — **P2-001j에서 흐름 슬라이스 이식**(`FDG_P2_001J_LESSON_FLOW_AND_CLOCK_20261020.md`).
3. 인트로 컷신(영상/대사, _startIntroCutscene)·로비/캐릭터 선택 선행 화면.
4. ~~stageTime 실진행~~ — **P2-001j에서 개통**(관측·영수증 소유, HUD 타이머 진행 검증).
5. OPT.diff=5 강제 저장(63358, 설정 owner 분리).
6. initialization 테스트 2실패(병합 main 선재 — HUD/이동 트랙).
