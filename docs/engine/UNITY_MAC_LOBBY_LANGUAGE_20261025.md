# Mac 로비 자막 언어 선택 — 2026-10-25

범위: 로비의 ko/en 토글을 29개 자막 선택 목록으로 연결하고, 선택 자막과 실제 메뉴 언어(ko/en)를 구분한다. native 자국어 이름/폰트/RTL 전체 인수를 주장하지 않는다.

| 항목 | 현재 동작 |
|---|---|
| 로비 selector | 한국어는 `자막: 한국어`, 나머지는 `Subtitles: CODE`. 별도로 `메뉴: 한국어` 또는 `Menu: English` 표시 |
| 목록 | 원본 cinLang의 29개 순서. 현행은 2열×15행 이름+코드·선택 강조. 23개 원문 이름과6개 메뉴언어 대체 이름을 표시한다. [가독성 검수](UNITY_MAC_LANGUAGE_NAMES_20261025.md) |
| 지역별 코드 | 원본 JS Normalize와 동일: ko-KR→ko, zh-Hant/TW/HK/MO→zht, pt-BR/pt→ptbr, nb/nn→no. 미지원/null→en |
| 데이터 | 기존 29×32 자막·시간을 그대로 사용. 메뉴 번역은 기존 ko/en 경로 |
| 팝업 | 열려 있는 동안 하위 로비 버튼 비활성화. 선택 또는 selector 재클릭으로 닫힘. Esc/바깥 클릭/키보드 이동은 후속 [팝업 조작](UNITY_MAC_LOBBY_POPUP_20261025.md)에서 연결 |
| 소유 | ROOT NativeLobby 통합. 지원 담당의 순수 LobbyLanguage.cs를 SHA 확인 후 수용. Core 변경은 언어 helper만 |

지원 모듈 SHA-256: `261f8e09e0710723d07754bf116c853ad6aca02e5fa04845f1b5167cd23c5545`.
지원 manifest 9개 파일 해시를 대조했고, PC 담당은 G:/exoduser/index.html:684 select#cinLang의 29 code/name/order가 모듈 catalogue와 같음을 독립 확인했다. PC 전체 HTML 동일성이나 최신 영상 승인에 대한 결론은 아니다.

검수: 원본 JS 159입력 및 원문 목록 기반 536/536, 실제 통합 NativeLobby 42/42. 첫 실제 렌더에서 JSON 배열 순서가 원본 selector 순서와 다른 것을 확인해 helper.GetCode 순서로 수정했다. 수정 후 최종 빌드/렌더 결과는 인접 JSON에 기록한다. 언어 probe는 별도 빌드에만 포함하며 반사로 목록을 연다. 정상 앱 CUA에서는 기본 한국어 표시와 메뉴 구분을 확인했으나 selector 클릭 한 번으로 목록이 열리지 않았다. 기존 자동 입력 좌표 문제와 실제 제품 클릭을 구분할 근거가 부족하므로 OS 클릭 PASS로 기록하지 않는다.

기존113초/20검사 및 pause/focus9검사는 반복하지 않았다. 기존 영상·BGM·offset·Steam·맵·HUD/인벤토리·전투·저장·계정은 수정하지 않았다. 원본 ProjectVersion은 유지하고 Mac6000.6.7f1 별도 소스 복사본으로만 빌드한다.

후속 팝업 조작은 구현·실제 키보드 검수를 마쳤다. 다음은 언어 목록 가독성과 기존 폰트 지원 범위다. 폰트/RTL·29언어 완전 현지화는 별도 미완료다.
