# 2026-10-02 AI 강화 저장 인수와 Mac 앱 준비

## 생산 인수
본편과 easy의 `_doAiEnhance`에 실제 소비 `res.used>0`일 때 `dbSaveNow()`를 부르는 한 줄씩만 추가했다. 성공·실패 모두 500ms 저장을 예약하고 무시도는 예약하지 않는다. 비용·확률·RNG·효과는 그대로다. root의 실제 추출 저장/복원 회귀32 PASS와 QA 독립10 PASS, 각 파일 inline 스크립트6개 구문검사를 통과했다. QA10은 이 기록 직전 root가 다시 실행했다.

500ms 이전 종료, 이미 진행 중인 저장에 겹친 요청의 유실, demo의 별도 복원 정책까지 해결한 변경은 아니다. BALANCE save-inflight 후보29검사는 제출 완료이고 아직 생산 인수 전이다.

## UIUX 실제 브라우저 인수
native-focus 후보의 .js import와 실제 inventory-space.css 연결을 확인했다. 본편/한국어에서 Enter·Space로 상세 초점 이동, Tab으로 행동 버튼 진입, hover 종료 시 초점 유지, 재렌더 후 새 카드 복귀를 확인했다. 그러나 카드에 초점이 있는 상태에서 fixture 아이템을 삭제하면 activeElement가 BODY로 떨어진다. CSS on에서는 inline hidden과 computed visible도 다르다. 후보 전체 인수와 생산 적용은 보류한다. easy/영어/패드/전체 게임 CSS 검수는 완료하지 않았다. JSON과 스크린샷: outputs/team-review-20261002/persistence/uiux-native-focus.*. 사용자 게임 탭은 보존했다.

## BUILD
공식 NW.js 0.111.2 osx-arm64 ZIP을 별도 runtime 폴더에 확보했다. 공식 체크섬 efda00a9f91353be1b78b7b38ab6fab12b5871c50e5648c6632fb44059da33f8과 일치하고 arm64 Mach-O를 확인했다. 이는 실행 엔진 확보이며 EXODUSER .app 완성이 아니다.

BUILD의 읽기 전용 스캔은 입력7925파일/6701632473bytes, 런타임340개를 기록했다. HTML 두 파일은 이번 체크포인트 대상이다. LFS 포인터3경로, 제작 provenance ZIP 보호 거부5경로, 출력 폴더 미생성 및 동적 참조 검수 게이트가 남았다. 원본을 삭제하거나 보호 규칙을 완화하지 않는다. 필수 실행 참조와 제작 원본을 구분한 입력 명세 확정 후 앱을 만든다. 실제 앱 빌드·실행0.

## 팀 인수 및 상태
- QA: persistence 독립10 PASS root 확인 완료.
- ITEM: browser-csp 제출 완료. root native 진단에서 Codex overlay의 shadow style과 시작 시 CSP 위반이 함께 관측됐다. 호스트 자체 inline style은 발견되지 않았다. 원인을 확정하거나 CSP를 완화하지 않는다.
- UIUX: native 후보 제출 완료, root 반례로 생산 인수 보류.
- BUILD: package-ready 스캔 및 후속 분기 검수 진행 기록 확인. notLoaded 표시를 작업 완료나 실행중으로 대체하지 않는다.
- BALANCE: AI29 원본 반례 인수, 생산32+QA10 PASS. busy-save29 후보는 독립 인수 전.
- ART: 기존 observer46+canonical11 체크 인수. wa24-preview 새 제출 완료, native 시각 인수 전.
- MAP: 이전 lifecycle22 검사 통과에도 root 초기숨김·clearInterval 재시도 실패 반례2개 발견. cleanup-retry 수정 제출 완료, root 재인수 전.
- SKILL: hellRay 이후 thunderStake 자원 확인 후보 제출 완료, 아직 생산 반영 전.
- ENEMY: 기존 roundrobin9 검사 통과에도 음수/signed32 반례 발견. roundrobin-boundary 새 후보 제출 완료, 아직 생산 반영 전.
- ANIMVFX: sparse gate의 누락 draws 반례 보강 검수 완료. flash-transition 기존 세션 Read/조사 확인, 완료 미확인.
- SOUND: 기존 S-11-HOWL 완료 상태 보존. 다음 과제는 접근 제한으로 미전달이며 우회하지 않았다.

UIUX/BUILD에 이번 새 발견의 후속 메시지를 공식 도구로 보내려 했으나 active writer 오류로 전달되지 않았다. 수신·착수로 기록하지 않으며 중복 전송하지 않았다. 나머지 원세션 실제 Read/Edit 기록은 claude-final.json, 직전 네 Codex 수신 기록은 codex-dispatch.json을 따른다. 새 팀·세션은 만들지 않았다.

## 다음 실행 순서
1. 이번 생산 수정과 필수 회귀·docs를 원격 체크포인트로 보존한다.
2. Mac 앱 입력에서 LFS 원본/제작 ZIP의 실행 의존성을 판정하고 완전한 입력 명세를 만든다.
3. UIUX 카드 소멸 초점 반례를 수정·재검수한 뒤 생산 적용을 결정한다.
4. busy-save 후보와 각 완료팀 제출은 함수별 원문·실제 회귀를 대조한 후 순차 인수한다.
