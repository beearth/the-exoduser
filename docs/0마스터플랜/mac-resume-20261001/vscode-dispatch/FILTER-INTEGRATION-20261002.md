# UI-04 필터 초점 생산 인수

변경 전 HEAD/원격 `49eaec385cc97cfb260217a7676ffb897512774c` 일치, 공유 index empty 및 양쪽 HTML clean을 확인했다. 기존 UIUX 완료 turn과 소유19파일을 읽고 sourceFactory·renderInv·ui-panels.js 실제 탭 이벤트를 대조했다. 본편/easy의 필터 버튼 재생성 뒤 초점이 BODY로 빠지는 기존32반례를 보존하여 후보를 인수했다.

## 반영 범위와 검수

각 HTML 변경은 12줄 diff(11추가/1삭제): mkF에 key/value dataset을 부여하고 beforeRender에 활성 필터 token, afterRender에 새 동일 버튼 복귀를 추가했다. 대상이 숨김/disabled/누락이면 invClose를 사용하고 패널이 닫히면 외부 초점을 유지한다. renderInv의 필터 값/조건·순서·onclick·ui-panels.js·유골함 탭·저장/경제/전투/키설정/CSS는 변경하지 않았다. 생산 전체가 connectFilter(frozen before)와 byte 일치하며 담당 후보 SHA와 같다.

| 검수 | 실제 결과 |
|---|---|
| 후보 독립 사전검수 | 원 source 및 composition, Node DOM 26+추가6=32그룹 PASS |
| 생산 추출 검수 | 현재 HTML과 현재 ui-panels.js를 읽은 동일32그룹 PASS; 기존32 RED→GREEN 유지 |
| 인접 회귀 | 실제 카드 Enter/Space/Tab 계약·hover·빈 상세/소멸·열기/닫기 opener·저장 함수 보존23그룹 PASS |
| 전체 inline 구문 | 양쪽 classic4/module2/importmap1씩 실행 없이 parse/check 통과 |
| 보존 | UIUX 소유19파일 SHA 동일. docs 동기화 직전 기존285파일 모두 SHA 동일. ui-panels.js/CSS 및 비소유 생산 변경0 |

생산 기준 총55검사 그룹이며 후보 사전32를 중복 가산하지 않는다. 추가6은 두 HTML×disabled/missing/panel-closed 경계다. 인접 검사의 최초4실패는 이전 production-integration fixture가 최근 저장 보류분 수정을 포함하지 않아 생긴 byte/저장 함수 비교 불일치였다. 생산은 수정하지 않고 이번 작업 직전 frozen before로 파생 검사의 비교 기준만 바꿨다. 첫 실패 로그와 기존 원검사는 보존한다.

`node tools/team-followup-20261001/root-review/filter-integration.mjs --production`

`node tools/team-followup-20261001/root-review/filter-adjacent.mjs`

root 파생 하니스는 기존 owner 결과를 덮지 않는다. frozen before의 RED와 생산의 GREEN을 비교한다. 과거 문서 인수 이력은 동기화될 수 있어 파생 실행 검사에서 제외하고, 과거 선택적 기록 파일은 있으면 SHA 검사한다. 모든 실행 import·fixture 의존은 필수다. 별도 before-checkpoint 및 보존 인수에서 실제285파일을 검증했다. 원 owner 검사는 생산 변경 전 SHA를 요구하므로 변경 후 재실행 명령으로 사용하지 않는다.

## 실제 UI의 한계

Node DOM의 CSS on은 visibility important 최소 모델이며 OS의 실제 네이티브 버튼 Enter/Space 활성화·Tab 이동·패드·화면 배치가 아니다. renderOssPanel과 전대 수집 등은 대역이다. 유골함 중앙 버튼/골격 노드/수집·해제 전체 동작은 미검수다. Native/실게임/실제 세이브/전체 UI-04 PASS를 주장하지 않는다.

사용자 잠금 해제 응답이 없어 실제 QA와 기존7팀 지시 전달은 Mac 잠금 대기를 유지한다. 추가 맹목 UI 입력/잠금 우회/새 세션 생성0. 사용자 플레이탭·세이브·실행 중 앱/서버는 접촉하지 않았다. 기존 ITEM 진단·BUILD/BALANCE 서버 소스 인수와 이번 UIUX 인수는 각각 완료했고 실제 런타임 게이트는 별도다.

생산 SHA: 본편 `6a8b523a4c91fdeaa300e85c3e5cfe25eb51cd8be705c395f5112d0771f6065b`, easy `e81a708e97710a7fe8d45c6e4071edba79ff8464116de955bc801552b5746ec2`. 전체 근거: outputs/team-review-20261002/filter-integration. GitHub 원격 검증은 커밋 후 별도 remote-checkpoint-final.json으로 기록한다.
