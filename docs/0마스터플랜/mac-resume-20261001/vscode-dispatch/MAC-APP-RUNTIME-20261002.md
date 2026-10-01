# 2026-10-02 Mac 앱 실물 실행 검수

## 현재 확인
97db3f1a 기준 7,918개 입력을 실제 app.nw에 포함한 arm64 앱을 생성했다. 생성 증거는 outputs/team-review-20261002/mac-app/execute-result.json이다. 최초 PID8841은 NSAlert modal에서 대기했고 서버3381/profile이 없었다. 경고 본문은 확보되지 않아 원인 메시지 자체는 UNKNOWN이다.

생성 앱 package.json의 `--user-data-dir="/무공백/절대경로"`에서 인자 내부 literal double quote만 제거했다. 원 manifest는 launch-original-package.json에 보존했다. 부모 mkdir·보안 flag·서명·quarantine 변경 없이, 종료에 반응하지 않던 본인 테스트 PID만 종료 후 다시 실행하자 profile 생성·127.0.0.1:3381 LISTEN·네이티브 NW.js 로비가 확인됐다(16:39:44Z). 사용자 기존 Chrome 게임/프로필/세이브는 조작하지 않았다. crashpad의 초기 기본 metadata 경로 사용이 관측되어 모든 NW 내부 로그까지 고유 job으로 격리됐다고 주장하지 않는다.

BUILD가 동일 오류의 재발 방지를 packager에 반영했다. 공백 없는 절대 프로필을 따옴표 없는 토큰으로 생성하고 공백·단/쌍따옴표·제어문자·DEL 경로는 PLAN BLOCKED한다. 미검수된 공백 경로 지원을 주장하지 않는다. root가 코드 diff와 43회귀 PASS를 확인했다. 생산 게임 코드는 변경하지 않았다. 실행 앱은 현재 수동 파생 수정본이며 새 빌더 결과의 실물 검수는 별도 기록한다.

## 네이티브 검수 진행
- 로비 입장, 세계관 영상과 한국어 자막, 데모 로비, 전사 캐릭터 생성 UI를 확인했다.
- 격리 프로필에서 MacTest 이름으로 생성 절차를 진행했다. demo의 실제 진입 URL은 `game.html?test=1&slot=demo&demo=1&story=warrior-v21`이다. 일반 캐릭터 슬롯의 영속성으로 확대하지 않는다.
- 전사 이야기 재생 및 화면 클릭/Enter로 다음 대사 진행 후 game.html 에셋 로딩 완료까지 확인했다. 설정·게임플레이·저장·재실행은 아직 검수 중이다.
- 캐릭터 선택의 비디오 요소에서 네이티브 AX에 “미디어를 재생할 수 없습니다”가 나타났다. 원인/코덱 단정0, 전체 미디어 품질 PASS 아님.

## UIUX 카드 소멸
실제 추출 렌더러의 새 후보 host에서 본편/easy × KO/EN × 실제 CSS off/on 8조합을 브라우저로 검수했다. Enter/Space 상세 진입 → 실제 Tab → 장착 버튼 → hover 종료 → 재렌더 카드 복귀 → 카드 삭제 시 invClose → 닫기 후 실제 opener 복귀 모두 확인했다. 상세 텍스트 선택/렌더 구조는 판본마다 달라 Tab 횟수는 본편2/easy1이다. CSS on의 inline hidden/computed visible은 별도로 기록했으며 아이템 소멸 초점은 올바르게 복귀한다. 증거 uiux-native-matrix.json. DOM 기능 후보를 인수하지만 전체 게임 화면·물리패드·생산 통합 인수는 아직 아니다.

## 다른 팀 제출의 root 확인
MAP cleanup24 + root before2/after2, SKILL thunderStake23, ENEMY boundary8, ART preview13, BALANCE save-inflight29는 앞 검수에서 확인했다. 이번에는 QA busy-save7, BALANCE unload25, ITEM U-D17 24그룹, ART engine-parity24, ENEMY 순서 fixture, ANIM 부활 reachability 모델을 root가 재실행했다. 함수/모델검사를 실제 게임 성능·시각 PASS로 대체하지 않는다. 생산 미적용 후보는 그대로다.

QA는 busy 저장이 끝난 뒤 보류분을 다시500ms 디바운스하는 잔여 유실창을 발견했다. 기존 BALANCE에 immediate-drain 한 건을 배정했다. BUILD 프로필 영구수정도 기존 세션에서 수행했다. 새 세션/하위 에이전트0.

## 팀 현황의 증거 정정
팀별 실제 수신/Read/Write/최종 응답은 기존 Claude JSONL과 공식 read_thread 결과에서 대조했다. MAP 등 일부 소유 receipt의 미래 시각 및 30a204… HEAD는 현재 사실로 인수하지 않았다. 기존 행은 해시별 history JSON에 보존하고 TEAM_UTILIZATION_20261001.json을 실제 사건시각/현재 과제 단위로 갱신했다. 완료·검수대기는 가동으로 세지 않는다. SOUND는 접근 차단으로 미전달 상태 유지. 현재 원격SHA는 갱신 시 실제 ls-remote 결과/시각을 따른다.
