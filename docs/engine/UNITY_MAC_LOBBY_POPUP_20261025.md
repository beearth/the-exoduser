# Mac 로비 팝업 조작 — 2026-10-25

> Current menu contract: [single-column web parity](UNITY_MAC_LANGUAGE_MENU_PARITY_20261025.md). Two-column/Tab cycling/CODE[L] below are historical results.

언어 선택 후속. 로비에서 L로 목록을 열고 닫고, 방향키/Tab/Shift+Tab/Home/End로 이동하며 Enter로 적용, Esc로 취소한다. 선택 후보는 밝은 두께2 테두리, 현재 적용 언어는 금색 테두리다. 목록 아래 조작 안내와 상단 L 안내를 표시한다. 당시 팝업은 (1388,187,488,294)였고 후속 이름 표시에서 (1388,187,488,552)·2열로 바뀌었다. 기존 영상 영역·선택 29코드·원본 순서는 유지한다.

바깥 클릭은 IMGUI 자체 hit testing을 써서 팝업만 닫는다. 클릭 프레임에도 하위 로비 버튼은 비활성화 상태로 먼저 처리되어 preview/Steam/replay가 같이 실행되지 않는다. 종료 확인 중에는 selector와 하위 로비 버튼도 비활성화하고 Esc 또는 바깥 클릭으로 취소하도록 연결했다. 종료 확인의 직접 마우스 조작은 이번에 검수하지 않았다.

일반 Mac ARM64 빌드 Succeeded/오류0, 진단 소스 없는 앱에서 CUA 실제 키 입력으로 다음을 확인했다.

| 입력 | 실제 관측 |
|---|---|
| L | 한국어 목록 열림, 29개 코드/조작 안내/현재 KO 테두리 표시 |
| Down 두 번 → Enter | FR 적용·목록 닫힘, Subtitles: FR와 Menu: English 구분 |
| L → Right → Esc | 선택을 바꾸지 않고 목록 닫힘, FR 유지 |
| L → End → Right → Down → Enter | 마지막 AR에서 범위 밖으로 이동하지 않음, AR 적용 |
| L → Tab → Enter | 마지막 AR에서 처음 KO로 순환, 한국어 복귀 |
| L 후 바깥 클릭 | 목록 닫힘·로비 유지, 미리보기 화면 전환 없음 |

현재 CUA 작은 selector 클릭은 여전히 목록을 열지 못했다. 큰 바깥 영역 클릭 성공을 정밀 좌표 입력이나 모든 마우스 동작 PASS로 확대하지 않는다. Unity 설치/라이선스/빌드/Player 실행 차단은 없다. 사진은 대화의 native CUA 이미지이며 로컬 PNG 저장을 주장하지 않는다. 재현 빌드/코드 SHA·로그는 인접 JSON에 기록했다.

기존536/42와113초/20 및 pause/focus9검사는 반복하지 않았다. 이번 변화는 로비 팝업 동작에 한정하며 시네마틱 selector·미디어·offset·저장·전투는 그대로다.

다음 UI 단위: 로비 언어 목록의 자국어 이름 가독성 및 기존 폰트 지원 범위 조사. 29개 언어의 전체 자막 폰트/RTL 동등성은 별도 미완료다.


후속 이름 표시·현행 크기와2열 방향키 검수: [언어 이름 가독성](UNITY_MAC_LANGUAGE_NAMES_20261025.md).


2026-10-25 시네마틱 후속: 로비와29개 이름/2열 키보드 목록을 공유. 실제 EN 자막 선택, 목록 Esc6초의 skip 차단, 키 해제 후 정상 skip·KO 로비복귀 확인. 일반 build errors0. 전체29자막 글꼴/RTL·정밀 마우스와 구분. [검수](UNITY_MAC_CINEMATIC_LANGUAGE_20261025.md).

2026-10-29 패치 노트 버튼 통합 전 Tab 계약: 로비에서 빈 초점의 첫 Tab은 이름 붙인 `lobby-language` selector로 이동하며 Return/Space로 기존 29언어 팝업을 연다. 팝업을 연 뒤의 방향키·Tab·Esc 처리와 언어 데이터는 기존 `ProcessLanguageMenuKey` 그대로다. 1280×720 ARM64 Settings QA 5/5 격리 Player에서 첫 Tab 테두리와 Return 목록 열기를 확인했다. [조건별 순환과 증거](UNITY_LOBBY_20261024.md#2026-10-29-통합-전-tab-포커스-계약-표적-수정).
