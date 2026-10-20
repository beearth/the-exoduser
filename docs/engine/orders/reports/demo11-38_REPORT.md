# DEMO11-38 — 종료 흐름·화면 비교 자료 준비

기준 origin/main **8dbbf2b0e699c36a93ca5cf41a2f3408be6da2c4**. 별도 기능 브랜치 merge 의존은 없고 main의 DEMO11-01 demo=true/stage=0/last_stage=0 권위를 소비한다. DEMO11-37 보스 사망 연동은 **미구현·미검증**이며 아래 신호를 테스트에서 직접 emit한다. 제품 보스 탐지·사망·부활·전투 수치 변경0.

| 계약 / 원본 | 구현·범위 |
|---|---|
| G43896,63661–63665 | clear의 실제 다음 버튼 → 마지막 demo 분기 → 종료 화면. 난이도 선택/다음 stage 생성 경로를 추가하지 않음. 실제 G.stage=0과 World/Player identity 유지 검증 |
| G41994–42003 | clear 제목/본문/데모 종료 CTA. Main.native_demo_boss_defeated(stage_index:int)를 **최종 사망·부활 판정 뒤** DEMO11-37이 emit. 현재 정책의 last_stage 및 실제 State stage 일치 시 한 번만 수락. 일반/잘못된 stage는 무시 |
| G43896의 stageCleared/on | 좁은 State writer만 stageCleared=true→false·on=false, 상태머신 clear→end→leaving. stage·enemy·피해·방패·이동·분노 값 쓰기0. 완료 Main의 process 비활성화+SceneTree pause로 명시 PAUSABLE World/Player까지 정지. 자기 CanvasLayer는 ALWAYS, 새 로비 ready에서만 unpause |
| G63668–63671 | 버튼 → wishlist_requested(url:String) → Main OS.shell_open. **원본 Steam store 루트 URL 그대로**, app id 없음/TODO 유지. 테스트는 OS 경계만 가로채 URL 검증하고 실제 브라우저를 열지 않음. OS 실패 안내/재시도 유지 |
| G63674–63681 | 복귀 클릭 → 별도 native demo11_lobby.tscn 전환 → 끝난 Main/World/Player 해제. 최소 데모 로비에서 재시작은 기존 main.tscn의 새 stage0. 중복 복귀/재시작 차단. 웹 로그인·캐릭터 슬롯·저장 로비 포팅 완료 주장은 아님 |
| 원본 G8544–8547/8104 | KO/EN 재사용, 신규 로비/실패 문구는 번역 전체목록에 등록. 실제 OPT.lang snapshot→복귀 언어 인계. KO 외 EN subset 폴백이며 전체 다국어 감수 미실행 |

## 공용 변경·검증

| 항목 | 결과·근거 |
|---|---|
| 공용 Main | 추가20/삭제0: 신호/preload/컨트롤러 필드, 부팅 말미 설치, URL/로비 내비게이션. 최종 줄 4–7,311–315,2903–2913 |
| 공용 State | 추가15/삭제0,1228–1241: 종료 전용 중복 guard와 writer. 기존 함수 줄 변경0. player/world/hud/resource authority·전투 핵심·docs/2_3·원본/에셋 변경0 |
| 화면 | 기존 Hell Gothic crest/frame 언어와 hell/hell_title/cinzel_hell 폰트 토큰. 뼈색·금빛 선·흑철·적갈 CTA, 이모지/이미지 생성0. 이벤트 기반, 추가 틱 경로/목록 생성 API0 |
| 관련 검증 | 신규 흐름 46/0(직접 신호 주입·실창 캡처), DEMO11-01 22/0. P2007a 115/0. 합 **183/0**, skip0·예상 밖 ERROR0, 두 기존 회귀 각1회 |
| 캡처 | L/captures/demoEnd-1920x1080.png + demoEnd-crop-1x.png(880×760, 무배율). 원래 viewport 픽셀을 Godot에서 저장하며 capture.json에 display server/좌표/phase 기록. 맥북총괄 시각 판정 대기 |

최소 로비는 native 데모 복귀 landing이며 계정·원본 웹 slot·save/load·G63678의 실제 dbSave는 이식하지 않았다. 저장 완료로 꾸미지 않으며 세이브 내용·형식·IO 변경0이다. DEMO11-37이 아직 없으므로 실제 보스전 종주 성공 주장0. 위시리스트 앱 등록/전용 URL·외부 브라우저 실제 열기·PC/Windows·게임패드 검수는 미실행이다.

원로그 L=`~/exoduser-wt/_out/demo11-38/`. 매 Godot pgrep count 2 이상 30초 대기, override 매 실행 별도 이름 후0byte. 새 격리 EXODUSER-demo11-38-Isolated-20261021, 기존은 각 파일 상수. 관련 테스트만1회(실패 시 해당 suite만 재실행), OS.execute 모든 chunk join·Node --node-bin. 정상 훅·경로 지정 staging·자기 branch 일반push·원격일치·DONE 작성 뒤 자기 WT제거. R 불변. 최종 수치/SHA/정리 상태는 아래와 L/DONE.txt를 따른다.

초기 실패도 보존했다: import 들여쓰기 parse2회, 신규 하니스 WeakRef 추론 경고 parse1회. 실제 신규 실행은 45/1 → 46/2 → **46/0**이다. 첫 실패를 프레임 경계 문제로 가정해 settle1프레임과 can_process 검사를 **추가**했으나 계속 진행함(7→8→12)이 확인됐다. 원인은 Main 자식 World/Player가 명시 PAUSABLE인 점이었고 부모 DISABLED만으로는 정지하지 않았다. 제품을 SceneTree pause로 수정한 최종 값은 **7→7→7**, can_process=false다. 실패 검사를 삭제하지 않았고 수는45→46으로 증가했다. 실패한 신규 suite만 재실행했고 통과한 기존 suite 반복0이다. 원로그 import/retry1/retry2 및 test/retry1/retry2/retry3가 모두 남아 있다.

최종 1920×1080 이미지와 880×760 무배율 crop을 직접 열어 KO 글꼴·CTA·패널 잘림을 확인했다. 폰트 토큰/이모지 금지 준수, 디자인 최종 판정은 맥북총괄 대기이며 “제작 완료” 판정으로 바꾸지 않는다. 캡처는 실제 macOS display server의 Main viewport이며 합성 목업이 아니다. Browser 경계는 테스트에서만 인터셉트했다.

최종 관련 검증은 **183/0**(46+22+115), skip0·exit0이다. DEMO11-01의 잘못된 stage 부팅 거부 ERROR **1개는 원래 테스트의 의도된 오류**이며 실제 로그 수1개를 확인했다. 예상 밖 ERROR0. 각 suite Camera2D interpolation WARNING는 원문 보존하고, 누수 경고 유무는 validation-summary.json의 원문 필터를 따른다. headless editor import3회(앞2회 parse 실패), 신규 실창4회(앞 parse1+실패2), 기존 관련2회로 Godot 총9회이며 실제 pgrep gate 기록을 보존했다. 통과 후 제품/테스트 코드 변경·추가 실행은 하지 않았다. Git/source 원본/공용 보호 파일 불변과 override0byte를 정적으로 확인했다. 최종 push SHA·원격 일치·DONE·WT제거는 L/final-receipt.json과 DONE.txt에 기록한다.
