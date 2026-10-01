# 카드 소멸 초점 최소 후보 인계

## 수신·원 증거
기존 UIUX 한 건이며 담당 task.md만 존재해 제출 중복 없음. 첫 Read/명령 2026-10-01T16:25:17Z, 첫 코드 Edit 2026-10-01T16:26:10Z(파일 birthtime UTC). root의 uiux-native-focus.json과 .jpg를 모두 읽었다. CSS on/game/ko에서 상세·장착 버튼 hover 유지와 재렌더 후 새 카드 초점은 확인됐지만 카드 삭제 후 BODY였다. CSS off 상세에서 직접 삭제는 invClose였다. close 기록만으로 opener 복귀 PASS를 주장하지 않는다.

## 원인과 최소 변경
직전 derivedFactory의 beforeRender는 상세·행동 버튼 초점만 owned로 기록한다. afterRender가 새 카드로 초점을 되돌린 후, 그 카드가 삭제되면 owned=false이고 DOM 제거로 BODY가 된 상태를 복구하지 않는다. 삭제 이후 resolve()는 null이므로 소멸 전 identity는 **currentCards의 실제 등록 노드**에서 읽어야 한다.

새 후보는 beforeRender에서 등록 카드의 item identity도 token에 보존하고, afterRender가 token.item으로 현재 카드 또는 invClose에 복귀하도록 한다. 같은 active 노드가 usable인 경우에도 item이 현 렌더에 존재할 때만 조기 반환한다. CSS visible!important로 빈 상세가 computed visible인 경우를 정상 아이템 생존으로 오인하지 않게 하는 동일 소멸 경계다. 랜덤·저장·장착/분해·필터·레이아웃 변경 없음. renderInv/hover 호출 연결은 기존 후보 그대로이며 factory 부분만 변경했다.

| 제출 | 계약 |
|---|---|
| card-removal-focus-candidate.mjs | 기존 후보 읽기 전용 import, 4개 정확 문맥 치환 |
| main/easy-minimal.patch | 직전 DOM 합본 대비 최소 미적용 변경 |
| main/easy-combined.patch | 현재 생산 원문 대비 합본 미적용 변경 |
| card-removal-focus/host/host.html | 기본 CSS 미연결·패널 닫힘, 실제 opener 클릭으로 begin→열기→render |
| host/controller.js → harness.js/source-data.js | 전이 전체 로컬 .js, CSS 상대 경로 연결/해제, 데이터 액션 capture 차단 |

## 보존·SHA
기존 native-focus 제출 전체, 원 focus/DOM 후보·patch·host, 공유 CSS·참조 원화 PNG, root JSON/JPG를 소유 host/before에 byte 보존한다. 보존 전후 SHA는 card-removal-focus-provenance.json에 기록하며 검사에서 원파일과 다시 대조한다. 생산 전체 SHA는 정보로 남기고, 양쪽 인벤토리 함수 19개의 정확 원문/SHA가 직전 native 기준과 동일함을 확인했다. 원파일은 수정하지 않았다. 새 부모 textContent/innerHTML 교체는 추가하지 않았고, 원 렌더의 기존 DOM 처리는 추출 원문 그대로다.

## 검수 경계
독립 회귀 **18 PASS / 0 FAIL**. 양쪽 × KO/EN × CSS off/on 모델의 8개 반례는 직전 후보 BODY(RED) → 새 후보 invClose(GREEN). Space 상세 진입·직접 삭제, 새 item identity의 카드 재렌더·삭제, 실제 host opener 열기/닫기/재열기, 반복·수정키 Enter 무동작, Tab preventDefault 미호출, hover 유지, 원본 SHA와 로컬 .js 체인을 검사했다. CSS on은 visibility:visible!important만 재현한 **Node DOM 최소 대역**이며 실제 CSS 로딩/레이아웃 PASS가 아니다. root native 자료는 원후보 실패의 실제 근거이고 새후보 native 성공 증거는 아직 없다.

root 브라우저 경로: 기존 3340 `/tools/team-followup-20261001/UIUX/card-removal-focus/host/host.html`. source/version/language 선택 뒤 fixture 재설정, 실제 “인벤토리 열기” 버튼 클릭. 양쪽 × KO/EN × CSS off/on에서 Enter 또는 Space→실제 Tab으로 장착 버튼→hover 종료→재렌더→fixture 소멸→invClose를 대조한다. 상세에서 직접 삭제, 활성화 전 Tab 카드의 소멸, 닫기 후 opener 복귀·재열기, Enter/Space 반복·수정키·중복, 숨긴 상세 초점 배제를 추가 확인한다. CSS는 inline/computed 값을 별도로 표시한다. 제거/hover/재렌더 제어의 pointer mousedown은 초점을 빼앗지 않는다. 데이터 장착/해제/분해 click 및 contextmenu는 차단된다.

실제 Tab 이동·native .js MIME/로딩·새후보 computed CSS·픽셀·실화면·물리 패드·생산 적용은 **root 검수 대기/UNKNOWN**. 게임·브라우저·서버·사용자 저장·Git·queue·공유 docs·원 후보 수정 없음. docs 전체 검색은 card-removal-focus-doc-matches.txt에 보존했다. UI-04에는 등록 카드 소멸 token/item 복귀 후보와 native 인수 대기를 별도로 반영할 것을 제안하며 완료 상태는 변경하지 않았다. 다른 작업은 시작하지 않고 이 한 건만 인계한다.

재실행: `node tools/team-followup-20261001/UIUX/card-removal-focus-generate.mjs` 다음 `node --test tools/team-followup-20261001/UIUX/card-removal-focus.test.mjs`. generator는 소유 prefix/host 안에만 출력한다. 실제 UTC·최종 hash·검수 기록은 전용 receipt/provenance/final-hashes 참조.
