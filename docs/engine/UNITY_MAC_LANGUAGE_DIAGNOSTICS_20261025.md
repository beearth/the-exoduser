# Mac 언어 목록 진단 마감 — 2026-10-25

실행본 `build-language-ui-probe` 한 개로 1280×720·2560×1080을 확인했다. 원본 로비/영상과 제품 입력 좌표는 변경하지 않았다.

- 720p: L 키로 29개 언어 목록이 열리고 경계 밖 잘림은 없었다. 글자 약10px·하단 안내8px로 작아 가독성 개선은 미완료다.
- 720p CUA 클릭 (972,174)은 Unity GUI (-312,926), Input (-312,-206)으로 관측됐다. 버튼 밖으로 전달되어 작은 버튼 마우스 검수는 실패/미완료다. 좌표 보정으로 숨기지 않았다.
- 초광폭: 실제 Screen2560×1080, 좌우320px 가운데 기준 화면. 29개 목록에 잘림·겹침 없음. 마우스 성공으로 확대하지 않는다.
- 개발 진단 스크립트: `unity/Tools/language-oracle/LanguageUiProbe.cs`. QA Assets에서 제거하여 다음 제품 빌드에 포함하지 않는다.
- 실행 로그/PNG: `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-LOBBY-20261025/language-ui-{720p,ultrawide}/`. 전체113초 영상 검사 반복 없음.

다음 제작은 인벤토리 비교와 일시정지/설정 화면이다. 마우스 자동입력 결함과 다국어 본문 글꼴 문제는 별도 미완료로 유지한다.

## 10/26 후속 범위 확인

위 인벤토리·설정 단위는 [설정 저장·복원](UNITY_MAC_SETTINGS_PERSISTENCE_20261026.md)과 [착용 안내](UNITY_MAC_INVENTORY_HINT_20261026.md)까지 인수했다. 다음 후보를 코드·로컬 폰트로만 좁혔다. 일반 world-intro 자막은 NativeLobby.cs:66의 caption 스타일에 `Art/fonts/NanumMyeongjo-Regular`를 지정하며79–80행에서 해당 스타일로 SubtitleText를 그린다. 메뉴의 Noto 계열과 구분한다.

실제 TTF `unity/Assets/Exoduser/Resources/Art/fonts/NanumMyeongjo-Regular.ttf`는3,058,408 bytes/SHA256 `7ed9e8653a8ed04285d51dc343ffea6eb3d9c73afc27383ea8929ee4ffd03205`이며 cmap에 우크라이나어 자막의 ї(U+0457)·є(U+0454)·і(U+0456) 세 문자가 없다. 로컬 Resources 폰트6종에서도 세 문자의 대안을 찾지 못했다. 이는 폰트 테이블 범위 확인이며 Unity 실제 렌더/자동 fallback 또는 shaping 결함을 확정한 결과가 아니다. 다음 작은 인수 범위는 이3문자의 실제 자막 표시 확인이다. 신규 폰트 취득·제품 변경·추가 Unity 실행은 아직 하지 않았다.

2026-10-26 후속: 위 마지막 문장은 당시 상태다. 공식 Noto Serif+OFL을 인수하고 `uk` 세계관 자막 전용 스타일을 연결했다. 현재 구현·SHA·cmap·컴파일 및 실제 화면 미검증 경계는 [자막 글꼴 지원](UNITY_SUBTITLE_FONT_COVERAGE_20261025.md#2026-10-26-우크라이나어-자막-전용-글꼴-인수)에 기록했다.
