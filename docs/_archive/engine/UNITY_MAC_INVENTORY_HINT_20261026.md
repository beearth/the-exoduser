# Mac 소지품 착용 안내 줄바꿈 — 2026-10-26

NativeInventoryComparison.cs의 착용 안내는20px 공유 글꼴·520 논리 픽셀 콘텐츠 폭에서 마지막 마침표가 단독 줄로 내려갔다. 기존 `ui-smoke/inventory-equipped.png`(1280×720, SHA256 `0c0b7ec102473f026c66fb543aa0225e2bbafa9d05efe239449c3bc6829abfe1`)에서 재확인했다. 두 번째 문장만 `소지품에서 장비를 선택해 비교하세요.`로 짧게 바꿨다. 글꼴·viewport·스크롤바 여유·비교 수치·장비 장착 동작은 유지한다.

기존 `--unity-ui-smoke -ui-phase equipped-guide -output <격리경로> --quit-after-ui-smoke`는 현재 장착된 시작 무기만 선택하고 SetInventory로 열어1080p/720p 두 장을 촬영한다. 파일 쓰기 완료를 기다리고 전용 JSON 후 자동 종료한다. 기존 전체15검사/다른8화면은 실행하지 않는다. settings store/directory와 캐릭터 roster directory가 비어 있음을 확인하며 소유권·저장을 바꾸지 않는다. OS 입력 검수로 확대하지 않는다.

ROOT 최종 source `837636a267fba0c78ae50bb9f1620bd6678bb59f`, QA/정상 ARM64 빌드 오류0. 실제 Player8/8 PASS. 두 PNG를 직접 열어 안내가 정확히 두 줄이며 마침표 단독 줄·잘림·겹침이 없음을 확인했다. 일반 prefs/캐릭터 JSON·lock의 전후 hash도 동일하다. [인수 영수증](UNITY_MAC_INVENTORY_HINT_ACCEPTANCE_20261026.json).

최신 누적 일반 실행본: `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-INVENTORY-HINT-20261026/build-hint-release/EXODUSER-Unity.app` · 1,971,685,902 bytes. 설정 저장·복원을 포함한다. 기존 앱38141/48476/52157은 보존했고 최신본으로 자동 교체하지 않았다. 기존 저장/설정/영상/전체 소지품 suite는 반복하지 않았다.
