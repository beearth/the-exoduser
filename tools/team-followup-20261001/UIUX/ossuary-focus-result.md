# UIUX-OSSUARY-FOCUS 한 건 인계

## 수신·Read·소유
기존 UIUX 세션의 다음 한 건. 시작 시 ossuary-focus prefix에는 담당 task.md만 있어 동일 진행/대기 결과·초안 중복 없음. 첫 실제 Read/명령 2026-10-01T18:14:14Z, 첫 코드 Edit 2026-10-01T18:15:53Z(prepare.mjs birthtime UTC). 시작 HEAD는 지시 기준 8e4ed4e446329c863ed4d2d556d386c37f3ae310와 일치했다. 실제 검사/완료 UTC는 전용 receipt에 기록한다.

AGENTS, UI-04, 기본/현행 인벤토리 SSOT, 이전 filter 결과를 먼저 읽었다. 양쪽 실제 renderOssPanel·중앙/골격 선택 이벤트·_boneRegister/registerBonePart·withdrawBonePart·mkBonePart·equipItem의 bonePart 인터셉트·unequipItem·닫기 및 실제 ui-panels inventory composition을 읽고 추출했다. 유골함 최초 지급 _grantOssuaryIfNeeded는 읽기 SHA만 기록하고 실행하지 않았다.

## 실제 원식의 확인된 결함
renderOssPanel은 최초 구성한 골격/행동 버튼을 보존한다. 선택 유골 해제는 실제 withdrawBonePart가 등록 record를 삭제하고 selectedPart를 비운 뒤 renderInv→renderOssPanel을 호출한다. 이때 활성 oss-withdraw가 disabled가 된다. 유골함 해제도 실제 unequipItem이 장착을 비운 뒤 활성 oss-unequip을 disabled로 만든다. 기존 factory는 이 두 유골함 행동을 카드/상세/필터 owned token으로 추적하지 않으며 renderOssPanel에도 초점 복귀 호출이 없다.

| 원식 실행 경로 | retain 모델 RED | disable→blur 모델 RED | 최소 후보 GREEN |
|---|---|---|---|
| 실제 선택 유골 해제 onclick→withdrawBonePart→renderInv→renderOssPanel | disabled oss-withdraw에 초점 잔류 | BODY | invClose |
| 실제 유골함 해제 onclick→unequipItem→renderInv→renderOssPanel | disabled oss-unequip에 초점 잔류 | BODY | invClose |

양쪽×KO/EN×비활성화2모델×해제2경로 = **16개 원식 RED→후보 GREEN**. 두 disabled 모델은 Node DOM의 브라우저 동작 가정 두 가지이며 실제 브라우저가 어느 동작을 하는지는 미검수다. 결함 근거는 실제 이벤트·수집/해제·렌더 원문과 합성 데이터 실행이며 native 실패 증거로 과장하지 않는다.

## 최소 미적용 후보
ossuary-focus-main.patch / ossuary-focus-easy.patch. factory에 releaseOssuaryAction을 추가하여 이전 활성 유골함 행동이 비활성/숨김 상태가 되고 현재 초점이 그 노드 또는 BODY일 때만 invClose로 복귀한다. 닫힌 패널·다른 활성 컨트롤·외부 초점은 강탈하지 않는다. 닫기가 가려져 복귀 불가능하면 disabled 내부 잔류만 blur한다. 기존 usable/focus 검사를 재사용한다.

renderOssPanel 진입 시 activeElement를 포착하고 take/remove 상태 갱신 뒤 두 행동만 검사한다. 등록/해제/생성/장착 함수와 수치·경제·필터·전투·저장·RNG 원문은 바꾸지 않았다. 특히 disabled setter가 BODY로 먼저 이동시키는 경우도 갱신 전 포착값으로 처리한다. 새 부모 textContent/innerHTML 전체교체나 레이아웃/CSS 변경 없음.

## 검사한 경계
`node --test tools/team-followup-20261001/UIUX/ossuary-focus.test.mjs`: **34 PASS / 0 FAIL**. candidate/fixture 문법 검사 통과.

| 경계 | 실제 실행 / 제한 |
|---|---|
| renderOssPanel | **no-op 아님**. 최초 제단·중앙 button·골격4개·action2개 생성과 반복 갱신 원문 실행. 데이터 선택/aria-label/aria-pressed와 연결 노드 identity 유지 검사 |
| 유골함↔인벤토리 탭 | 실제 ui-panels inventory callback→실제 _invChangeCategory→renderInv/hover 경로, aria-hidden·탭 초점·닫기 opener 복귀 확인 |
| 중앙 선택 | 실제 urn onclick으로 INV.selected='eq:ossuary'와 재렌더·같은 urn 초점 유지 확인. 중앙 클릭만으로 상세의 픽셀/내용·전체 상세 생성이 완료됐다고 주장하지 않음 |
| 선택 소멸 | 외부 합성 record 삭제 후 실제 재렌더에서 take disabled→invClose. 선택 골격 button은 데이터 없음 상태에도 보존됨 |
| 실제 등록 | 실제 가방 bonePart 카드 Space→상세 후 equipItem의 등록 인터셉트→_boneRegister/registerBonePart. 가방에서 소비/도감 r,t 기록·카드 소멸 invClose 확인, 하위 등록 거부는 가방/저장 호출 보존 |
| 실제 해제 | withdrawBonePart/mkBonePart/unequipItem 실제 실행. 반환 item의 가방 이동·도감 삭제·장착 비움 확인. 용량/배치 실패는 도감/장착/가방과 유효 초점 보존 |
| 안전 경계 | 외부 초점 강탈0, 숨긴 invClose focus0, 기존 생산/공유/후보303개 자료 SHA 불변. 등록/해제/생성 함수는 후보 전후 원문 byte 동일 |

fixture의 경제·아이템·도감은 합성 메모리에만 존재한다. dbSaveForce는 **호출 계수만 기록**하고 실제 저장0. 통계 재계산·사운드·notify·glyph/card fields/비교 표현·가방 배치 좌표 일부는 명시적 대역이다. 실제 mkBonePart의 Date/Math.random은 합성 반환 item id 생성에만 호출하며 생산 RNG 함수는 수정하지 않았다. 이미지 src는 Node 요소 속성에만 기록하여 다운로드/디코딩0. 인물 초상 노드가 없는 보호 분기이므로 portrait onload/onerror·초상 품질은 미검수다. 저장 실전·전대 소환·일반 장비 장착·유골함 최초 지급은 실행하지 않았다.

## 원문·보존·재실행
양쪽 전체 before HTML과 ui-panels 원문은 소유 prefix에 보존했다. 원 함수43개/factory SHA·1-based 줄은 ossuary-focus-before.json, 추가 실제 equipItem 2개 SHA는 ossuary-focus-extra-source.json에 있다. 기존 자료303개·공유 SSOT/CSS·원 후보/초안/증거는 읽기만 하며 원본 그대로 보존했다. 다른 담당 변경·stage를 되돌리지 않았다.

준비는 `node tools/team-followup-20261001/UIUX/ossuary-focus-prepare.mjs` 최초 한 번만 실행하며 기존 before를 발견하면 중복 생성 거부. 재검사는 위 test 명령으로 보존된 원식 RED와 후보 GREEN을 모두 실행한다. 소스가 후속 변경되면 SHA 인수 검사 실패를 숨기지 않는다. 의존/변경 파일·최종 SHA는 ossuary-focus-dependencies.json / final-hashes.json 참조.

## docs 반영안·QA 게이트
docs 전체 관련 검색은 ossuary-focus-doc-matches.txt에 남겼다. 공유 docs/SSOT/팀 기존 MD는 수정하지 않았다. 승인 반영 시 인벤토리 키보드 SSOT에 “선택 유골/유골함 해제로 현재 행동 disabled 시 닫기 복귀, 닫기 숨김이면 내부 잔류 blur; native 검수 별도”를 추가할 것을 제안한다. UI-04 전체 완료 상태는 변경하지 않는다.

QA 단독 런타임에서 양쪽 KO/EN의 실제 Tab/Enter/Space로 유골 선택→해제 및 유골함 해제를 격리 합성 슬롯에서 확인한다. 정상 재렌더 노드 유지, record 소멸, 빈 가방/가득 참/배치 실패, invClose→외부 opener, 유골함↔장비 복귀, CSS off/on의 실제 가시성과 패드 이동을 별도로 대조한다. 생산 사용자 저장·경제를 쓰는 검수는 담당이 수행하지 않는다. OS키·패드·CSS 레이아웃·전체 유골함 시각·실게임/앱 PASS는 **UNKNOWN**.

생산 HTML/ui-panels/CSS/공유SSOT 수정0. 게임탭1573846373·앱·세이브·HTTP·서버/listen·빌드·권한변경·Git쓰기·queue·새 팀/세션/에이전트 접촉/실행0. 이 한 건을 root에 인계하며 다음 범위는 시작하지 않는다.
