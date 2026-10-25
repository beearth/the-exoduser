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

첫 source35519bdce: ARM64 오류0, controller8/8 및720/1080 상단/하단4PNG 정상. 작은 화면에서도14px 상당 글자와 마지막 항목이 잘리지 않는 것을 직접 확인했다. 단, 결과/PNG 저장 직후 빠른 Application.Quit에서 Mono/native segv가 발생했다. 정상 종료 PASS로 계산하지 않는다. 검수 fixture만 영상 Close→native callback 정리1초→Quit으로 보정해 해당 짧은 검사만 재확인한다. 제품 저장·메뉴 동작을 이 종료 문제의 원인으로 단정하지 않는다.

최종 source `e8217784f411eb390fbb6cdae4009660e06eea50`: ARM64 빌드 오류0. 동일한 메뉴 controller8/8 통과, 영상 Close 이후 정상 정리 로그와 LaunchServices wait 종료0 확인, native crash 없음. Mono의 thread-finalization 경고는 남아 있으며 경고까지 없앴다고 주장하지 않는다. UI 코드는35519bdce와 같아 직접 검토한4PNG를 재사용한다. 사용자 사용 중인 이전 실행 앱과 저장은 그대로 보존했다. [결과 JSON](UNITY_MAC_LANGUAGE_MENU_PARITY_20261025.json).

다음 미완료 단위는 원본 마우스 hover 선택 강조와 클릭 경로다. 원본 row.onmousemove는 실제 포인터 이동 때만 선택 커서를 바꾸므로 키보드 선택을 정지한 포인터가 덮지 않게 유지해야 한다. 이전 CUA 좌표 전달 오류 때문에 OS마우스 PASS는 아직 미확정이다. 저장은 기존 인수 동작을 유지하며 전체 게임 진행 저장을 이 작은 메뉴 작업에 끼워 넣지 않는다.
