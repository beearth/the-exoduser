# UIUX-20261002-INVENTORY-DOM

root가 inventory-focus 21검사·기존9검사를 직접 통과했고 양쪽 빈 상세6경로의 기존 잔류를 확인했다. 공용 game/easy에는 아직 적용하지 않았다. full candidate는 실제 renderInv 재구성/hover 종료/키보드 삭제 후 초점 연결을 독립 인수해야 한다. 기존21 fixture를 다시 만들지 말고 실제 호출 연결에서 남은 실패 한 건을 고친다.

소유: `UIUX/inventory-dom-*`와 `UIUX/inventory-dom/`뿐. 기존 inventory-focus-*는 읽기 전용으로 import/파생하되 원본 대조를 남겨라. root는 이번 공용 game/easy의 hellRay 확정 구역만 순차 수정할 예정이며 인벤토리 production은 담당이 쓰지 않는다. UI-04/인벤토리/DOM 보존 계약을 먼저 읽어라.

특히 키보드 Enter로 카드→상세에 초점 후 실제 `_invClearHover`가 무조건 `invRight.style.visibility='hidden'`로 만드는 경로와, renderInv가 기존 anchor/행동 버튼을 제거한 뒤 Tab/삭제/해제의 복귀 대상을 확인하라. 실제 소스 함수와 DOM 연결을 사용하는 작은 독립 host/회귀에서 하나를 RED→GREEN으로 입증하고 최소 호출부 수정 후보를 내라. 전체게임/대역-only 순수함수 성공을 실DOM 검수로 주장하지 않는다. 소멸한 anchor 대신 현재 연결된 카드 또는 invClose, 창 닫기 opener, Space/Enter 중복/수정키·Tab 기본 이동·KO/EN·숨긴 상세를 초점 대상으로 삼지 않는 계약을 보존한다. 새 레이아웃/밸런스/저장/장착·분해 설계0. 실패 미재현이면 솔직히 보고하고 억지 수정0.

원본 patch는 보존하고 새 양쪽 minimal patch와 기존 검사의 결과를 기록하라. 브라우저 확인용 DOM-only host를 만들 수 있으나 실제 브라우저 확인은 root가 담당한다. 사용자 탭/게임/서버/설치/대형빌드/Git/queue/새세션·에이전트/공유docs/타팀/production 수정0. 수신·Read·첫 Edit·검수/완료 실제UTC와 원본SHA, 남은 실화면/패드 게이트를 소유 receipt/result에 기록 후 한 건 인계.
