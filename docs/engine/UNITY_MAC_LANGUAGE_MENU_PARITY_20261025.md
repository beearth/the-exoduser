# 웹 언어 목록 입력·표시 이식 — 2026-10-25

기준은 canonical-media/reference-files.json에 pin된 대조 index의 `_langPopKeydown`과 `_positionLangPop`이다. 웹은 단일 열·최대60vh 스크롤 목록, Up/Down1칸, Home/End, Enter/Space 선택, Esc/Tab 취소다. 기존 Unity2열·Down2칸·Space 무반응·Tab 다음항목은 차이였다.

| 항목 | 수정 계약 |
|---|---|
| 목록 | 원본29언어 순서 단일열, selector 아래, 최대60vh, 필요시 스크롤 |
| 글자 | 14px 상당, 행30px, 폭240px 상당. 원본 min-width200보다 긴 기존 대체 이름을 보존하는 여유 |
| 선택 | Up/Down1칸, Home/End, Enter/Space확정, Esc/Tab취소 |
| 재입력 | L과 확정/닫기 키는 KeyUp까지 반복 소비; L 길게누름의 반복토글 방지 |
| 영상 | 목록 열림 및 닫기 이후 키해제 전 컷/hold 입력차단 유지. 영상·음향·자막시점 무변경 |
| 마우스 | IMGUI 동일변환 hit testing, 클릭선택/바깥닫기. CUA 좌표오류는 제품 보정으로 숨기지 않음 |
| 저장 | 캐릭터 목록·선택 복원과 전체전투저장 범위 무변경 |

전용 `--unity-language-menu-smoke`는 사용자 저장을 열지 않고 무음으로 controller 계약8개와720/1080 상단/하단4PNG만 검수한다. OS마우스/키보드 전수검사라고 확대하지 않는다. 기존영상완주·저장53/Player16/언어536 검사는 반복하지 않는다. 새 빌드와 fixture 결과 대기.

남은 범위: hover로 커서이동, 브라우저Tab focus 순환, 29언어 shaping/RTL은 완전 동등 미확정. 기존23원문/6대체이름 보존. 이식→비교/누락수정→신규업데이트 순서다.
