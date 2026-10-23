# SWEEP-B PC 인수 — 웹 UI·게임 시스템 전 화면 동일성 (2026-10-22~23)

Mac SWEEP-B(`codex/sweep-b-20261022` 8d9dc158, 차이 목록 `SWEEP_B_20261022.md` 102행)를 PC가 이어받아 수정했다.
원칙은 "웹 그대로 이식, 개선 금지"이고, 판정은 웹과 Godot을 1x로 나란히 놓고 직접 보는 것으로 한다. 테스트 통과는 필요조건일 뿐이다.

## 1. 기준과 방법

| 항목 | 값 |
|---|---|
| 작업 브랜치 | `claude/pc-sweep-b-20261022`(8d9dc158에서 분기), worktree `G:/exoduser-wt/pc-hud-stats` 재사용 |
| 웹 기준 | origin/main 커밋본 `846889174`의 game.html(sha `dee094fd…`, Godot 원본 스냅샷과 같음). 로컬 main HEAD(5659d14)는 갈라져 있어 쓰지 않음. 작업 사본에서 origin/main과 다른 웹 파일(index.html 미커밋 charselect 변경 등 23개)은 Playwright route로 origin/main blob을 돌려줌 |
| 웹 실행 | `G:/exoduser`에서 `PORT=3394 node server.cjs`, Playwright 헤드리스·음소거·1920×1080·격리 프로필 |
| Godot 실행 | 4.7.2, override.cfg 격리 user dir(`EXODUSER-demo11-pc-sweep-b-Isolated-20261022` 등), APPDATA=`_out/pc-sweep-b/appdata`. 캡처는 엔진 내부 viewport만 사용 |
| 창 위치 | 오른쪽 보조 모니터. **Godot 좌표는 가장 왼쪽 모니터가 0**이므로 Windows x=5120은 `--position 7040,0`이다(실측: 5120을 주면 Windows x=3200 메인 모니터에 떴다가 옮겨짐). borderless, 캡처 창은 마우스 통과(실제 커서 hover가 화면을 바꾸지 않게) |
| 도구 | `tools/parity/sweep_b_pc_web.cjs`(웹 캡처+계산 스타일 probe), `tools/parity/sweep_b_pc_capture.gd`(Godot 캡처, 모드 lobby/game/death/clear/forge/growth/lesson/settings), `tools/parity/sweep_b_pc_cmp.py`(나란히·확대 비교) |

## 2. 장면 짝 판정 (최종 재캡처, 1x 직접 판정)

"같음"은 레이아웃·색·글자·장식이 1x 나란히에서 구분되지 않는 경우다. 웹의 시간·랜덤 상태(악의 1000/1017, 랜덤 시작 장비 수치, 테스트용 이름)만 다른 경우는 같음으로 센다. 그 밖에 남은 차이가 하나라도 있으면 "다름"이다(P2 포함).

| 영역 | 짝 | 같음 | 다름 | 일치율 | 다름 내역 |
|---|---|---|---|---|---|
| 로비·종료·삭제 | 6 | 6 | 0 | 100% | — |
| 캐릭터 선택 | 2 | 0 | 2 | 0% | 배경 아이들 영상(장미창) 대신 정지 포스터 — VIDEO-01 |
| 이름 생성 창 | 4 | 4 | 0 | 100% | — |
| 인트로 첫 컷·가이드 4장 | 5 | 5 | 0 | 100% | (인트로 전 컷 타이밍 정밀대조는 범위 밖: Mac VIDEO-01·INTRO) |
| 커튼 직후·레슨 | 2 | 0 | 2 | 0% | 레슨 패널 표시 시점, 레슨 중 구역 제목 오버레이(P1) |
| HUD | 1 | 0 | 1 | 0% | 레슨 적 이름표 미표시, 시계 00:00(PC-SYS) |
| 인벤토리 | 1 | 0 | 1 | 0% | 요약 힌트 줄바꿈 1줄/2줄(P2) |
| 스킬 | 1 | 0 | 1 | 0% | 3D 코인 유리 질감·선택 2중 회전 링, 정보 아이콘 테(P2) |
| 성장(게임/성장 모드) | 3 | 0 | 3 | 0% | 노드 링 모양·학습 경로 금선 굵기·원점 ✦(P2) |
| 대장간 기본+6탭 | 7 | 7 | 0 | 100% | — |
| 설정 | 1 | 0 | 1 | 0% | 캐릭터 선택 상자 높이·카드 설명 줄바꿈(P2) |
| 사망(fallen 1s/4s, dead) | 3 | 1 | 2 | 33% | 부활 가능 판정·전환 시점(PC-SYS) |
| 클리어·데모 종료·로비 복귀 | 3 | 1 | 2 | 33% | 클리어 배경 장면(fixture 위치), 데모 종료 펫 대사 없음(P2) |
| **합계** | **39** | **24** | **15** | **61.5%** | |

웹 단독 캡처(짝 없음): `003b_quit_closed`, `024_warrior_story_t2_5s`(영상), 대장간 탭 하단 6장. Godot 단독: `111_dead_t13s`, 설정 3탭(화면·사운드·조작 — 웹 짝 미촬영). 이들은 위 분모에서 뺐고 **미확인**이다.

대표 비교판(위 웹 / 아래 Godot): `docs/engine/parity_refs/sweep_b/*.jpg` 20장.

## 3. 차이 목록과 상태

P0 = 화면 구조·주요 요소 누락, P1 = 눈에 띄는 배치·상태 차이, P2 = 세부 질감·글꼴·미세 위치.

| 번호 | 영역 | 차이 | 등급 | 상태 | 근거·커밋 |
|---|---|---|---|---|---|
| B-01 | 로비 | 슬롯 카드(철판 셰이더·점선/실선/선택 테두리·::before 막대)·저장 먼저 VIEW=2·새 캐릭터 점선 카드 | P0 | 고침 | 14fc5b921 |
| B-02 | 로비 | ENTER 비활성(grayscale·brightness .45)·푸터선·DEMO 표기·종료 전원 아이콘·버전 오버레이 | P1 | 고침 | 14fc5b921 |
| B-03 | 로비 | 선택 슬롯 키아트·캐릭터 이름 표시(아래 정렬·text-wrap balance·글로) | P1 | 고침 | 14fc5b921 |
| B-04 | 로비 | 로고 rect 중심 5px 어긋남 → `.lobby-brand-logo` 실측(1507.2,195,249.5,104) | P2 | 고침 | 7a610f48e |
| B-05 | 로비 | 버전 클릭 시 패치노트 패널 미이식 | P2 | 남음 | SWEEP-B2 `db7c044f7f57e7f3f028d014583488ecb2bddf16`: 버전 클릭 패치노트·스크롤·닫기/Escape/포커스 이식. 1x에서 제목·본문 세로 간격/글꼴·스크롤바 잔차. |
| B-06 | 로비 | 슬롯 스크롤 화살표 대신 ScrollContainer, 삭제 모달 radius 8 | P2 | 고침 | SWEEP-B2 `db7c044f7f57e7f3f028d014583488ecb2bddf16`: 3슬롯 위/아래 화살표·범위·disabled·21px 재배치, 삭제 외곽 radius8. 3장 1x 비교. |
| B-07 | 공통 글꼴 | CSS letter-spacing이 한글 대체 글꼴에 안 붙음 → `native_ui_fonts.apply_spacing`이 fallbacks에도 같은 자간 복제 | P1 | 고침 | 71af08d35 |
| B-08 | 공통 글꼴 | 같은 Nanum Myeongjo 파일이 FreeType에서 Chrome 1x보다 가늘게 나옴 → embolden 0.35(3배 확대 대조) | P1 | 고침 | 71af08d35 |
| B-09 | 공통 글꼴 | Cinzel Decorative Regular face 없음(Bold로 대체), 웹 `serif` 한글 대체=Windows 바탕 vs Godot Noto Serif KR('캐릭터 선택' 제목) | P2 | 남음 | SWEEP-B2 `db7c044f7f57e7f3f028d014583488ecb2bddf16` 조사: I40은 Decorative400 요청. 저장소에 Regular/Batang 없음. 외부 다운로드 금지에 따라 기존 글꼴 보존. |
| C-01 | 캐릭터 선택 | 헤더 Cinzel Decorative 38.4/700·부제·좌측 직업/이름/설명·특성 상자·아이콘 위치(713+106i)·취소/생성 버튼 | P0 | 고침 | 7408841f0 |
| C-02 | 캐릭터 선택 | 엠블럼 셰이더가 텍스처를 두 번 곱해 어두움 → vertex modulate 분리, CSS grayscale/brightness(선택 none·미선택 .5/.62·잠김 1/.35) | P1 | 고침 | 7408841f0 |
| C-03 | 캐릭터 선택 | 특성 상자 반투명 그라디언트·inset 3px·코너 20px·크레스트 ✦, 이모지 세피아(.ti-g), 설명 231px 줄바꿈 | P1 | 고침 | 7408841f0 |
| C-04 | 캐릭터 선택 | 대형 PNG 밉맵 없는 축소의 점 무늬 → 고품질 축소, 사슬 원형 클립(overflow:hidden) | P2 | 고침 | 7408841f0 |
| C-05 | 캐릭터 선택 | 배경 아이들 영상(장미창) 대신 정지 포스터 | P2 | 남음 | Mac VIDEO-01 |
| C-06 | 캐릭터 선택 | 잠김 사슬 두께(브라우저 축소 품질 차이) | P2 | 남음 | SWEEP-B2 `db7c044f7f57e7f3f028d014583488ecb2bddf16` 조사: 웹/네이티브 사슬 PNG 동일 SHA256 1f29f35b…; 기존70px Lanczos·원형clip 보존. 축소 두께 시각차 남음. |
| N-01 | 이름 창 | 웹 `_visualConfirm`은 캐릭터 선택을 닫고 로비 위에 이름 창 → 같은 구조로 | P1 | 고침 | 7408841f0 |
| N-02 | 이름 창 | 모달 제목 disp_title·오류 시 +46px·버튼 테두리/하단 막대/포커스선 | P1 | 고침 | 14fc5b921 |
| S-01 | 레슨 | 패널 세로 간격·체크리스트 행(16px 상자, 38.4 피치)·하단 버튼 47/97.7×36 | P1 | 고침 | bace4e6c4 |
| S-02 | 레슨 | 레슨 중 구역 제목 오버레이가 보임(웹은 이 시점에 없음), 커튼 직후 웹은 레슨 패널이 이미 열림 | P1 | 고침 | SWEEP-B2 `db7c044f7f57e7f3f028d014583488ecb2bddf16`: G62300 초기 HUD 시점에 제목 시작, 가이드 동안 종료. 커튼 후 레슨 패널 열림 1x 확인. |
| S-03 | 레슨 | 펫 대사 페이드 시점 | P2 | 고침 | SWEEP-B2 `db7c044f7f57e7f3f028d014583488ecb2bddf16`: G32113/parry-lesson.js484 early return 동안 대사 타이머 정지. 레슨 intro 페이드 시점 1x 확인; 자막 글꼴/줄바꿈 별개. |
| H-01 | HUD | 빈 숫자 퀵슬롯 `.qs.empty`(opacity .3·grayscale) | P1 | 고침 | 71af08d35 |
| H-02 | HUD | `#skKeyBar` RMB/E 키 캡 | P1 | 고침 | 71af08d35 |
| H-03 | HUD | 목표 패널 글자 12.64px(→13), 스테이지 시계 상단선·글자색·자간·Cinzel 700 | P2 | 고침 | 71af08d35 |
| H-04 | HUD | 레슨 적 이름표("깨어난 망자 · 1/6 처치") 미표시 | P2 | 남음 | SWEEP-B2 `db7c044f7f57e7f3f028d014583488ecb2bddf16` 조사: 지정 G/I·parry-lesson.js·system-lesson.js·캡처 도구에 해당 문구/6처치 원문 없음. 현재 웹050 재캡처에도 미관측. 문구/단계 발명 없이 보류. |
| V-01 | 인벤 | 요약 상세(현재 전투 구성) 좌표·글꼴·구분선 실측값 | P1 | 고침 | 71af08d35 |
| V-02 | 인벤 | 요약 힌트가 Godot은 한 줄(웹 두 줄) | P2 | 고침 | SWEEP-B2 `db7c044f7f57e7f3f028d014583488ecb2bddf16`: G49684/inventory-space.css148–152 WORD wrap·deferred360×40.8. 두 줄1x 확인. |
| K-01 | 스킬 | 슬롯 행은 웹에서 3D 코인(sf-3d) — 실측 지름 44px(선택 49px) | P1 | 고침 | 71af08d35 |
| K-02 | 스킬 | 정보 패널 버튼(.sf-btn/fire/ghost, disabled .48+saturate .3), 경고문 위치, 구분선, SP 줄 천 단위 | P1 | 고침 | 71af08d35 |
| K-03 | 스킬 | 빈 코인 유리 질감, 선택 2중 회전 링, 정보 아이콘 테 색 | P2 | 남음 | SWEEP-B2 `db7c044f7f57e7f3f028d014583488ecb2bddf16`: 정보 아이콘64px/2px #5a4b3c/scale1.18 이식. THREE 유리·선택 halo/회전 링 근사 차이는 남음. |
| G-01 | 성장 | 인스펙터·경로 목록·필터·하단 버튼·실시간 능력치 링크 | P0 | 고침 | 28973a1e3 |
| G-02 | 성장 | 트리 배경 기사 일러스트 없음 → 웹 원본 바이트 사본 + `growth-tree-fixed-background.css` 방식 | P0 | 고침 | 4d7bf27ed |
| G-03 | 성장 | 하단 disabled saturate(.3), 배율 표기 `×2.00`(stat-panel-ui.js 284)·현재값 위치 | P1 | 고침 | 71af08d35, aaefeaf0b |
| G-04 | 성장 | 노드 링 모양·학습 경로 금선 굵기·원점 ✦ 노드 | P2 | 남음 | SWEEP-B2 `db7c044f7f57e7f3f028d014583488ecb2bddf16`: 중심44/54·스탯radius9·원점27/별17·경로1.35/2/2.5 반영. 노드 배경 그라디언트/다중 링·그림자 1x 잔차. |
| F-01 | 대장간 | #forge 전체(470,12,980,1056)·탭 6종·재료판·격자·확인 대화 | P0 | 고침 | 9f30198ad |
| F-02 | 대장간 | 스크롤 막대 비표시(기본·분해·리롤) | P2 | 고침 | 71af08d35, aaefeaf0b |
| T-01 | 설정 | 버튼 굵기·위험 버튼 적동·섹션 모서리·Language 선택 상자 | P1 | 고침 | 8b2bb94f6 |
| T-02 | 설정 | 섹션 헤더 잘못된 테두리 제거·그라디언트, 섹션 테두리 복원, 스크롤 막대 비표시 | P1 | 고침 | 71af08d35 |
| T-03 | 설정 | 캐릭터 선택 상자 높이(약 56px 큼)·카드 설명 줄바꿈 | P2 | 남음 | SWEEP-B2 `db7c044f7f57e7f3f028d014583488ecb2bddf16`: 현재 웹 카드245.3px는 기준JSON과 같음(이전+56px 재현 안 됨). deferred 설명 두 줄 복원, 한글 줄 경계/캐릭터 미세배치 차이 남음. |
| R-01 | 클리어 | 카드 위치(#stageClear 실측)·#clearStats 6줄·제목 양옆 선 | P1 | 고침 | 9790a12a3 |
| R-02 | 클리어 | 데모 종료 화면에 펫 대사 오버레이 없음 | P2 | 남음 | SWEEP-B2 `db7c044f7f57e7f3f028d014583488ecb2bddf16`: clear 이벤트에서만 자막121>end120, 평상시9 유지. clear 자막60Hz/end정지. 표시 복원됐으나 현 캡처 fixture의 화자·문구·시점 다름, 자연 보스 종료 동일성 미확인. |
| R-03 | 클리어 | 클리어 캡처 배경 장면(웹 fixture는 보스방, Godot은 시작 지점) | — | 남음 | 캡처 fixture 차이, 표시 차이 아님 |

## 4. PC-SYS (수치·시스템 원인 — SWEEP-B에서는 표기만, 2026-10-23 PC-SYS 작업에서 처리)

처리 브랜치 `claude/pc-sys-leftovers-20261023`(기준 065068322). 상세 근거·테스트: [pc-sys-leftovers_REPORT.md](orders/reports/pc-sys-leftovers_REPORT.md)

| 번호 | 내용 | 관측(SWEEP-B) | 상태 | 원인·수정(원본 행) |
|---|---|---|---|---|
| SYS-1 | 스테이지 시계가 레슨을 건너뛴 뒤에도 00:00 | 웹은 3초 뒤 00:03 | 고침 | 최종 캡처는 00:00이 아니라 00:08(웹 00:03). Godot update()가 렌더 프레임마다 1회(vsync 끔·max_fps 240) 돌아 G.stageTime이 최대 4배 빨랐다. 원본 loop 누산기(G61813·61822·61827~61829·61836~61839·61878~61884, PHYS_STEP G60469) 그대로 update() 횟수를 정한다. 레슨 시작 시점 stageTime 웹 34~35 / Godot 53~54(커튼 G._intro 900ms), 건너뛴 뒤 초당 웹 60·Godot 61 |
| SYS-2 | 사망 후 부활 가능 판정 | 웹은 fallen 1s에 '부활 불가', 4s에 dead 화면. Godot은 '부활의 …' 5s→2s 카운트다운 뒤 dead(약 9~13s) | 고침 | ① 판정 차이는 시작 팔찌 brType 무작위(G16108, 악마 50%면 _iRevPow 5~12)로 웹 캡처가 생명 팔찌였을 뿐 공식은 같음(웹에 악마 10.86 고정 시 '부활력 10.86%' 동일). ② 전환 시점: 원본은 fallen 중 P.st2를 틱당 2 감소(G32794+G32991) → 웹 2506ms, Godot은 1씩 줄여 5초였다 → 2씩. ③ 문구 G58932는 _T 없음·Number#toString(5.140000000000001 등) → 원문 그대로. ④ 쓰러짐 오버레이를 화톳불 배리어(6)·조명(5) 아래 레이어 4로(웹 1x: 마법진이 패널 위) |
| SYS-3 | G._sStats 세션 통계 미누적(코드 확인) | 클리어 카드의 일부 통계 항목. 최종 캡처 카드 값과 웹 값의 항목별 대조는 미확인 | 고침(일부 원본 경로 미이식) | Godot G에 initStage 리터럴(G31571/G62284)이 없어 모든 `if(G._sStats)` 게이트가 거짓이었다. State가 리터럴을 두고 deaths·dmgDealt·maxHit·crits·dmgTaken·parries·potions·walked·dashDist를 원본 지점에서 누적. 2초 D 이동: 웹 walked 322.6 / Godot 310.0. dodges·dashCount는 해당 원본 경로(hurtP 회피·chargeStocks 사슬)가 Godot에 없어 0. 표: `2게임디자인레벨디자인.md` 클리어 통계 아래 |
| SYS-4 | 대장간 AI 자동 강화(aiEnhance) 미이식 | 버튼을 눌러도 화면 변화 없음(원본에 없는 안내 문구는 넣지 않음, 로그만) | 고침(SFX·파티클 시각 제외) | aiEnhance G28125~28139·_doAiEnhance G28141~28185 이식(applyStats·addTxt·shake·renderForge·dbSaveNow). #aiEnhResult는 원본도 renderForge가 즉시 비워 화면에 남지 않음(웹 실측). AI 영역 비용·보유·부족분 천 단위 쉼표(G50672·G50683 toLocaleString) 누락도 고침. 웹 대조 값 일치: 1000→소비 0, 200000·목표3→소비 26,438·+3·악의 173,562 |
| SYS-5 | 퀵슬롯 물약 표시 미이식 | 웹은 물약이 있으면 아이콘·개수 | 해당 없음(코드 변경 없음) | 관측 전제가 원본과 다르다. updateQS G28271 `const s={type:null,count:0}; // 포션 퀵슬롯 폐지` — 물약 분기(G28340~28358)는 도달 불가, useQuickslot(G28204)은 호출처 0. 웹 실측: QSLOTS[0]={type:'hp',count:1}이어도 qs0=가시덫 스킬, qs1~3=`qs empty`, 물약 아이콘·개수 없음(악의는 자동 물약 G35895~35912만). Godot도 같은 표시(스킬바 1x 비교 동일). 물약 HUD를 새로 만들면 원본에 없는 동작 추가라 넣지 않음 |
| SYS-6 | 키 캡 패드 모드·재바인딩 표기 전환 미이식 | RMB/E는 기본 BINDS 고정 | 고침(inputMode 저장 제외) | _updateSkBarKeyLabels G28559~28577·_SK_SLOTS G28544~28558 이식: 모드 문자열 (pad/kbm)+BINDS.shield+BINDS.beam이 바뀔 때만 다시 그림. KBM=bind 있는 슬롯만(RMB/LMB/keyName), 패드=13칸 pd 라벨(.5rem). _gpActive 전환 G13452~13478·G13873~13876(패드 연결·의도적 버튼/축>0.5 켬, 연결 끊김·키 입력·마우스 이동>3 끔). 웹 대조 1x 3모드(KBM RMB/E, BINDS shield=KeyR·beam=mouse0 → LMB/R, 패드 LT+A…B) 같음. 캡 글자가 캡 아래로 내려가던 문제(Label 최소 높이) 같이 고침. 미이식: localStorage inputMode 저장·복원(G13450), Godot 재바인딩 UI 자체(BINDS 리더는 기본값 고정) |

PC-SYS 회귀·테스트 변경·범위 밖 발견은 [pc-sys-leftovers_REPORT.md](orders/reports/pc-sys-leftovers_REPORT.md).

HP/MP/◇·인벤 수치 차이는 랜덤 시작 장비 때문이라 비교에서 뺐다(최종 050 짝은 HP 654로 같음).

## 5. 낡은 테스트 기대값 갱신 (판정 약화 없음, 웹 기준)

| 테스트 | 바꾼 것 | 조건 | 결과 |
|---|---|---|---|
| test_demo11_04_lobby | crest·텍스트 brand → 웹 로고 이미지 rect·자산·아트 밖 위치, 슬롯·이름 입력·삭제 문구 글꼴 Noto Sans KR(웹 계산값), 슬롯 번호 대신 보이는 카드 '저장 이름 먼저+빈 슬롯 —', 생성 진입은 '+ 새 캐릭터' 카드 | storage on, 헤드리스 | 55/0 |
| test_demo11_07_lobby_entry | 잠긴 캐릭터: 선택은 되나 생성 disabled+'출시 준비 중'+사슬(웹 selectVisual), 생성 직후 전사 스토리 영상 확인 후 finish(), 부팅 저장(DEMO11-06)이 생긴 뒤에도 '메타데이터가 게임 저장으로 복사되지 않음' 의도 유지, 대기 저장 가드는 메타데이터 슬롯 3으로 | storage on, 창 모드(캡처 사용) | 56/0 |
| test_demo11_09_pause | 웹 Escape=togglePanel('settings'): 설정 패널 바로 열림, 재입력·닫기[ESC]=재개 | storage on, 헤드리스 | 27/0 |
| test_demo11_50_settings | 위와 같은 Escape 경로, 웹 탭 배치(게임: Language·'전체화면 (F11)' 토글 버튼 / 화면: 흔들림·글자 크기·panelFit·FPS range=CAPS 인덱스) | storage on, 창 모드(OS 전체화면 확인) | 49/0 (헤드리스는 OS 전체화면 불가로 1실패) |
| e2e_parity_intro_01 | 생성 클릭 좌표를 웹 #visualCreateBtn(1273,1027)으로. PC에서는 `HOME`으로 결과 폴더 지정 | storage on, 창 모드 | PASS |

## 6. 회귀 (각 1회)

| 테스트 | 결과 | ERROR / SCRIPT ERROR | 조건 |
|---|---|---|---|
| sweep_b_ui_check | 18/0 | 0/0 | storage off |
| test_parity_ui_01 | 7/0 | 0/0 | storage on(off에서는 저장 경로 필요 단정 2실패 — 조건 문제) |
| test_parity_ui_05 | 15/0 | 0/0 | storage off |
| test_parity_ui_06 | 24/0 | 0/0 | storage off |
| test_parity_hud_01 | 17/0 | 0/0 | storage off |
| test_demo11_17_skill_management | 105/0 | 0/0 | storage off |
| test_demo11_23b_inventory | 1281/0 | 0/0 | storage on |
| test_demo11_growth_ui | 36/0 | 0/0 | storage off |
| test_demo11_27_forge | 1918/0 | 0/0 | storage off |
| test_demo11_salvage | 35/0 | 0/0 | storage off |
| test_pc_skill_writers | 80/0 | 0/0 | storage off |
| test_pc_hud_stats | 199/0 | 0/0 | storage off |
| test_pc_move_skills | 256/0 | 0/0 | storage off |
| test_pc_combat_kill | 47/0 | 0/0 | storage off |
| test_demo11_47h_e2e | 실패 0 | 0/0 | storage on, `--source-root` 지정(빠뜨리면 컷신 이미지 ERROR 52). overall 값 NOT_READY는 테스트 설계상 그대로 |
| test_demo11_04/07/09/50, e2e_parity_intro_01 | §5 | 0 | §5 |

test_demo11_29_workshop은 기준선(8d9dc158)에서도 3실패+SCRIPT ERROR(131행)+종료 정지로 같아 이번 변경과 무관하다(미갱신, Mac 소유 범위). test_demo11_salvage `--input-only` 모드는 G 키가 웹처럼 대장간을 열도록 바뀐 뒤로 'G가 분해 창을 연다'는 기대와 충돌한다(미실행 모드, 기록만).

## 7. 자산

| 파일 | 출처 | 확인 |
|---|---|---|
| `godot/assets/ui/parity_sweep_b/growth_tree_bg_hf_20260927_102905.png` | https://d8j0ntlcm91z4.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/hf_20260927_102905_7c7fc782-eb73-4bf0-9f4b-4de19dfa79ae.png (웹 growth-tree-*.css가 쓰는 이미지) | 1,897,663B, PNG 시그니처, sha256 `6be0fa2ceee433f14d83c843eeda027c3c33718883eb99827feda58083691645` 두 번 일치. 사용자 승인 후 총괄 세션이 받음, 바이트 그대로 복사 |
| `godot/scripts/native_source_glyphs.gd` | game.html ICONV 54종 SVG 문자열(대장간 아이콘) | 원문 그대로 |

## 8. 미확인

- 인트로 전 컷 타이핑·전환 시간, 로비/전사 영상(Mac VIDEO-01 범위).
- 설정 화면·사운드·조작 탭의 웹 짝 캡처(Godot만 촬영).
- 27개 추가 언어 전체 화면(로비 KO/EN만).
- 실제 Mac 실기 화면, 사용자 플레이 창의 최신 반영 여부(Git 반영만으로 열린 실행본이 갱신됐다고 보지 않음).

## 9. 2026-10-23 SWEEP-B2 후속 (지정12항목)

이번 후속의 상태는 §3 해당 행과 [상세 보고](SWEEP_B2_20261023.md)를 따른다. **요청 범위 고침4 / 남음8**. §2의39짝 합계는 PC 인수 당시 기록이며 이번12항목 검수를 합쳐 재계산한 전체 일치율이 아니다. C-05/R-03는 이번 제외. 캡처는 `~/exoduser-wt/_out/SWEEP-B2/captures/<ID>_compare_1x.png`. 남음은 이식 일부·소스 조사·동작 테스트를 시각 같음으로 올리지 않았다.

후속 검증: 관련 UI7종1598확인/실패0, 최종 import ERROR0. 마지막 E2E1회 PASS13/NOT_READY5/FAIL0·overallNOT_READY. 보스방/최종처치 선행조건 미충족으로 clear/end/lobby-return 자연 흐름 미검증. 상세는 SWEEP_B2_20261023.md와 외부 DONE.txt.
