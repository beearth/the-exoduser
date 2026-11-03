# 2026-10-21 DEMO11-42 눈 검수 RETOUCH 수정 재제출

기준/동일 branch: `749d0c6e12447cedf539688fea0262b9e6378a8d`, `codex/demo11-42-20261021`. Mac 총괄의 이전 판정 RETOUCH를 기준으로 세 지적을 수정했다. 아래 최초 제출의 자체 PASS/수치/구현 상태는 이전 이력이며 현재 판정으로 대신하지 않는다. DEMO11-50은 별도 branch5ac5dcfc로 먼저 제출했고 이 branch에 섞지 않았다.

- 오른쪽 구슬: 개발 문구 `미이식` 제거. 실제 State MP/mmp를 왼쪽 파랑 반구/MP 라벨/수치에 연결, owner 부재·비유효이면 숨기고 fill0. 오른쪽은 ST/st/mst 초록 반구로 명확화. 현재 웹의 레거시 SP 표기는 성장 SP와 혼동되므로 이번 사용자 지시 및 HUD 리디자인의 ST 명칭을 우선했다. 원본 game.html2640–2665/60300–60305의 MP-left/ST-right·#0c2244→#3388cc/#0c3322→#2a8844·#88bbff/#88dd88 규칙. 자원 writer 변경0.
- 상시 정보 띠: 중복 ST/MP/SP/악의 UI 행을 제거했다. 같은 값은 readback snapshot에만 남는다. 기존 원본 #skBarTip(705–708)처럼 rgba(12,6,4,.94)/1px#6d4330/radius6/그림자12·황금색 명조의320×40 슬롯 툴팁으로 축소. 유휴 시 숨기고 슬롯 hover 또는 요청 뒤2.5초만 표시, 게임 입력을 소비하지 않는다. 미연결 실행기의 플레이어 문구도 `사용 불가`/`지금 사용할 수 없습니다.`로 바꿔 개발 연결 사정을 노출하지 않는다.
- 보스 HP: 사용자가 PASS한 생성·갱신 블록은 byte 동일(audit.json). Main/State/player/world/NativeSkillSlots/보스 actor/game.html 및 전투·저장 변경0. 보스바와 기존 슬롯/프레임 배치를 바꾸지 않았다.

이번 공용 diff는 hud.gd +20/-6(21,258,260–265,333,336–341,414,425–428), native_demo11_hud_owner.gd +29/-16(14삭제,19,69,71–75,92,100,109–123,128–129,142,144,146,166). 새 tick 목록 생성 API0. 추가 MP getter는 기존 owner를 읽을 뿐 비용/타이머/피해를 집행하지 않는다. 폰트는 기존 cinzel_hell/hell 토큰, 원본 이미지/폰트 byte 재사용이며 새 에셋 생성/변환0.

검증: 최종 실제 Main GPU **46/0**, skip0·ERROR0. 기존 P2-002a HUD 회귀 **36/0**, skip0·ERROR0·1회. 독립 MP/ST 수치·fill, 미연결 MP 숨김/재연결, 유휴 툴팁 비표시, 개발 문구 부재, 기존 owner readonly 및 보스 계약을 검사했다. 자원 차감17ST/23MP는 하니스가 pause 전 기존 실제 cost owner로 준비한 fixture이며 HUD가 자원을 쓰지 않는다. 기존 combat/dispatch/actor suite는 바뀌지 않아 반복하지 않았다.

첫 GPU는45중5실패/ERROR14를 원문 보존했다. 리소스 fixture를 pause 뒤 요청해 기존 정상 pause gate가 거절했고, 신규 캡처 하위 폴더가 없어 PNG 저장이 실패했다. 하니스에서 fixture를 pause 앞으로 옮기고 출력 폴더를 생성한 뒤 실패한 신규 suite만 재실행46/0. 제품 gate 완화/실패 삭제0. Camera2D 선재 WARNING는 그대로 보존, WARNING0 주장0.

최종 캡처는 동일3뷰(ready/failure/ULT refusal)1920×1080 + 기존 보스580×110/스킬760×265 1x 크롭 + 오른쪽 구슬300×265 1x 크롭 각3개, 총12 PNG. 01 전체·03 스킬/자원1x를 직접 열어 MP/ST 분리·개발 문구 부재·상시 띠 제거·플레이어 거절 문구·보스 유지 확인. 자체 VISUAL VERDICT: PASS(이3뷰 범위), **Mac 총괄 재눈검수 대기**. 기존 스킬 아이콘 부분집합 등 다른 이식 경계를 완료로 확대하지 않는다.

최신 파일은 `_out/demo11-42/captures/`, 이전749 PNG는 그 아래 pre-retouch-749d0c6e에 보존했다. 상세 raw/result/manifest/수정 전 보고서는 `_out/demo11-42/retouch-20261021/`. 실제 사용자 저장 폴더 접근0. Godot 전 pgrep>=2이면30초 대기, 모든 실행 override 종료0byte. 정상 훅·동일 branch 일반 push·원격 SHA 일치·DONE 기록 뒤 자기 WT/생성 project만 제거하며 R 보존. 새 SHA는 최종 DONE에 기록한다.

---

# DEMO11-42 — HUD 실제 owner 연결 보고서

기준/의존: fetch 후 origin/main `ac3764bfe5476b56e2f2388b1f2d9baeff731885`에서 분기. DEMO11-34 actor가 이미 main에 포함되어 별도 merge 의존 없음. 브랜치 `codex/demo11-42-20261021`. 실제 작업/검수 source는 sparse worktree 및 동일 byte의 `_out/demo11-42/project`; R은 checkout/index/work를 변경하지 않는다. PC 실행·동기화는 미확인.

## 구현과 판단 근거

| 접점 | 연결/범위 | 공용 변경(최종 줄) |
|---|---|---|
| 실제 부팅 | DEMO11-34 설치 직후 display-only owner를 PublicHUD 자식으로 설치. 중복 설치 거절, 인트로의 기존 부모 숨김을 따름 | Main 329, +1/-0 |
| 선택 아이콘 | dispatcher의 1–4/F/Space/Ctrl/Z와 같은 slot_rules.slot_value. 배정/습득 owner를 읽고 기존 텍스처/쿨 sweep 유지. Q/E/Shift/LMB/RMB의 기존 표시·실행 분기는 보존 | hud.gd 732–737, +6/-0 |
| 결과 관찰 | 키 입력과 Main 호출이 모두 기존 dispatcher를 한 번 실행한 뒤 복제 결과 신호 1회. 기존 dispatch 본문 이하 모든 실행/피해 코드는 기준 byte 동일 | native_skill_slots.gd 153–160 구간에 +7/-0 |
| 보스/선택/자원/실패 | 신규 native_demo11_hud_owner.gd. 실제 actor.snapshot HP/mhp, source slot catalog name, 실제 cooldown getter, State P/G의 ST/MP/SP/악의. 마지막 요청 키의 현재 배정, 거절 3초/성공 시 지움. 10Hz 표시만 | State/player/world/보스 actor/피해·패링·방패·분노/저장/docs2_3 0줄 |

화면 배치를 새로 설계하는 스킬 창은 PC 개편 대기이므로 손대지 않았다. 선택 스킬은 새 클릭 UI 없이 마지막 dispatcher 요청 키(초기 1)의 현재 배정을 표시한다. 미연결 ULT는 `연결 대기`이며 실행/비용/피해를 만들어내지 않는다. 기존 cast_gate_refused는 세부 원인이 합쳐진 반환값이므로 특정 자원 부족을 추측하지 않고 `자원 또는 재사용 대기`라고 표시한다. Q/E/Space 보호 전투 상태를 이 HUD가 새로 소유하지 않는다.

보스는 actor가 dormant/분리/오류/비유효HP/죽음이면 바를 숨긴다. WAITING_OWNER에서도 관측된 HP는 표시하며 실제 prefix·HP commit·전체 전투가 연결됐다고 주장하지 않는다. 새 보스바는 기존 웹 HUD 스타일을 이식한 표시 전용 재사용이다. 근거 game.html 387–396(상단 중앙18px,500×14),954–958(흑철/붉은 그라데이션),16689·16706(stage0 다크드루이드),35831–35845(캐시된 보스 HUD, HP/mhp). 원본 source SHA 및 제한 행 발췌는 `_out/demo11-42/source-contracts.json`. game.html 수정0.

UI_FOUNDATION/UI_COMPOSITION의 Hell Gothic을 적용했다. 기존 NATIVE_UI_FONTS의 hell/hell_title/cinzel_hell 정적 캐시를 재사용(본문 명조, 제목 Cinzel Decorative→명조), 뼈색 #dfd6c2·금빛 헤어라인 #a49373·흑철·붉은 지옥불. 새 산세리프/이모지0, 기존 HUD 자산/오브/스킬 창 배치 변경0. 신규 문구10종은 번역대상_전체목록에 KO/EN 등록했다. 현재 KO 실행이며 전언어 적용/감수 완료는 아니다.

## 검증

| 스위트/근거 | 결과 | 범위/격리 |
|---|---|---|
| 신규 owner 통합(headless) | 25/0, skip0 | EXODUSER-demo11-42-Isolated-20261021, 실제 Main·State·dispatcher·actor. fixture-only 슬롯/HP readback 명시 |
| DEMO11-16 dispatcher | 393/0, skip0, 1회 | EXODUSER-demo11-16-Isolated-20261021; 원본 Node72케이스 포함, node --node-bin 명시, 기존 OS.execute join |
| P2-002a 기존 HUD | 36/0, skip0, 1회 | EXODUSER-P2002A-Isolated-20261020, 기존 fixture actor field2 유지 |
| DEMO11-34 actor | 162/0, skip0, 1회 | EXODUSER-demo11-34-Isolated-20261021 |
| GPU 캡처 | 33/0, skip0, ERROR0 | 1920×1080 전체3뷰 및 무리샘플 1x 크롭(보스/하단)6개 |
| 보호/성능/안전 | 원본·State·전투 body byte 동일, 목록 생성 API0 | audit.json, process-gate.jsonl, 실행별 override 및 result.json. 관련 회귀 합계591/0 |

핵심 결함 주입4종: 보스 NaN HP, HP0, HP>mhp(시각비율만 clamp), actor 분리. paused 상태에서 표시를20회 읽어 P/G·actor snapshot·쿨을 변경하지 않음을 확인했다. 실제 피해/보스 격파·실드·포이즈 writer는 시험/구현하지 않았다. 신규 모듈/변경 공용 파일에 get_method_list/get_property_list/get_signal_list 0건; 타이머나 cost를 HUD에 복제하지 않았다. 별도 성능 측정은 필요하지 않아 실시하지 않았다.

초기 신규 테스트 new와 new-diagnostic 각25중1실패를 원로그에 보존했다. 실제 bar 비율/픽셀은 맞았으나 관측 snapshot merge의 기본 overwrite=false로 boss_visible=false가 남는 결함이었다. overwrite=true로 수정 후 실패한 신규 스위트만 재실행25/0. GradientTexture의 intrinsic minimum이 바 높이를 늘리지 않도록 expand-ignore-size도 명시했다. 기존 회귀는 최종 코드에 각각1회만 실행했다. Camera2D physics-interpolation 선재 WARNING는 원문 유지하며 WARNING0을 주장하지 않는다.

Godot 실행 전 지정 pgrep 검사를 매회 수행하고 2이상이면30초 대기했다. 격리 override는 실행마다 기록하고 종료 후0byte. 중복 실행 시도1건은 override guard가 실행 전에 차단했으며 Godot 추가 실행/회귀 재실행은 없었다. import 완료0/ERROR0 뒤 예약된 불필요 import-final 대기는 Godot 시작 전에 취소했다. 원로그를 숨기거나 PASS로 세지 않는다. 실제 사용자 저장 디렉터리는 사용하지 않았다.

## 캡처와 인수 범위

VISUAL VERDICT: PASS（이번 owner 표시의 가독성/연결 범위, Mac 총괄 눈 검수는 대기）. 최종 01-owner-ready.png를 직접 열어 상단 보스62.5%·숫자·타이머 분리, 하단 선택/쿨/자원 판독과 기존 HUD 프레임 보존을 확인했다. 02-owner-failure-skills-1x.png 및 03-ultimate-hold-skills-1x.png를 1x로 열어 실패 문구·금빛 헤어라인·명조 글자 및 미연결 ULT 구분을 확인했다. 3전체뷰1920×1080 + 580×110 보스/760×265 하단 크롭 각3개(총9개), 무리샘플 PNG의 크기/SHA는 captures/manifest.json.

첫 GPU는32/0이었지만 실제 이미지에서 아직 진행 중인 인트로 커튼이 HUD를 가려 시각 인수에 부적합했다. 9장은 captures/initial-curtain/에 보존했다. 하니스의 GPU 캡처 분기에만 기존 real-time curtain 종료1.1초 대기와 종료 확인1개를 추가해 재촬영33/0. 제품 코드/회귀는 다시 바꾸거나 반복하지 않았다. 새 렌더러는 OpenGL compatibility, macOS GPU이며 1920×1080 캡처 크기를 실제 이미지에서 확인했다.

기존 skill_icons는 첫 전투12종 부분집합이므로 미연결 ULT blackStar 아이콘은 빈 기존 슬롯을 유지하고 선택 이름/연결대기를 새 행에서 표시한다. 기존 자원 오브의 SP 표기는 보존했으며 새 authoritative 행은 ST와 성장 SP를 구분한다. 이 기존 art/표기 범위를 이번 단위에서 전체 스킬 UI 완성으로 확대하지 않는다.

캡처는 실제 Main HUD/기존 월드 렌더 위에서 fixture-only 보스 HP62.5%, 슬롯3 재배정/쿨·미연결 ULT 상태를 보여준다. arena 진입/실제 보스 피해/보스 전투 완성 증거가 아니다. 사용자 눈 검수용 원본과 1x 크롭은 `_out/demo11-42/captures/`에 둔다. 신규 이미지 에셋은 만들지 않았고 기존 에셋은 byte 그대로 COW 복제해 격리 import 캐시만 생성했다.

정상 pre-commit 훅과 경로 지정 staging을 거쳐 자기 branch만 일반 push한다. 원격 SHA 일치·R 보존·DONE 작성 후 자기 worktree/생성 검수 project를 제거하고 원로그·캡처·보고서 사본은 유지한다. 최종 SHA는 `_out/demo11-42/DONE.txt`.


## INTEG-10 수명 보충 (2026-10-22)

| 관측 | 처리 |
|---|---|
| starter의 source_state 해제 후 HUD refresh line124 | typed Node 대입 자체가 유효성 검사 전에 SCRIPT ERROR. hud/source_state를 Variant 수신 후 is_instance_valid 검사 |
| 동적 slot icon 참조 | Variant 수신 후 유효한 Control일 때만 좌표/hover 조회 |
| 제품 범위 | 기존 레이아웃·문구·주기0.1초·선택2.5초·거절3초 그대로. 게임 상태 쓰기0. 최초 재현 로그와 해당 suite 재검수는 DEMO11_STATUS INTEG-10 참조 |
