# Unity 전 화면 16:9 안전 영역 — 2026-10-31

사용자 브리프: I:/EXODUSER-Storage/codex-takeover/ui-ultrawide-brief.md. 기존 UI 담당/작업본 재사용. 전 화면 안전영역 구현과 실제 Player 검수 결과다. 공통·Desktop 전달 상태는 I:/EXODUSER-Storage/demo-art/unity-ui/ultrawide/최종_전달영수증.json을 별도로 읽는다.

| 항목 | 현행 계약 |
|---|---|
| 공통 | NativeUiSafeArea.Fit(W,H), s=min(W/1920,H/1080), 원점((W−1920s)/2,(H−1080s)/2), 논리1920×1080 |
| 배경 | 종횡비 유지, 원본 contain/cover 방식 유지. 안전 영역 밖 순검정. 장식/영상의 넘침도 마지막 Repaint에서 차단 |
| 캐릭터 생성 | modal identity/실제 Screen.width,height 혼용 제거. 직업5개·이름입력 모두 공통 matrix/논리1920×1080. 패널/아이콘/버튼/서체가 안전 영역 높이에 비례 |
| 튜토리얼 | 논리1920×1080·같은 matrix. 4장 안내·커튼·보호막·스크롤의 동일 좌표 유지. 바깥 클릭은 진행하지 않음 |
| HUD | 본편/시작 HUD 모두 논리1920×1080. objective/지역/연습/구슬/13슬롯을 안전 영역 안에 배치 |
| 포인터 | bottom-origin 화면좌표 → ((mouseX−originX)/s,(H−mouseY−originY)/s). 슬롯 공격차단·연습패널·실제 GUI 클릭에 동일 원점. 인벤 keyboard 강조폭1920 |
| 나머지 UI | 첫 화면·메뉴·로비·로딩·설정·일시정지·인벤/스킬/대장간/능력치는 기존 중앙 균등 fit 유지. 클리어 panel/Next hitbox도 공통 배율. 사망 키아트는 안전 영역 기준 cover |
| 해상도 | 1920×1080 원점0,0/s1; 2560×1080 원점320,0/s1; 3840×1080 원점960,0/s1; 1600×900 원점0,0/s5/6; 2560×1600 원점0,80/s4/3 |
| 검사 | 32화면×5해상도×ko/de/fr 예상480장. 파일명 W×H-language-page로 2560×1080/1600 충돌 방지. 기존 실제 가림/clip/alpha·글자 겹침 검사 유지 |
| 코드 외 경계 | 전투/Core/세이브/기존 영상·원화 byte 변경0. 미채택3D 무대는 본 단위 제외 |

C# 공통 좌표/포인터 회귀215개 통과. 실제 사용자32:9 이미지의 전체폭 키아트/가장자리 작은 정보판을 재현 근거로 사용한다. 정식6000.6.7f1 컴파일→무창M1→동일 빌드 해상도 격자/웹 비교/1x→MERGE_QUEUE→공통 비강제 반영→Desktop 순서로 완료하며 -remodel-scenes 1 필수. 산출물 I:/EXODUSER-Storage/demo-art/unity-ui/ultrawide/.

인게임 고정 안내/로딩/부활은 같은 균등 matrix를 사용한다. 적 체력·피해 글자·월드 표식은 Camera.WorldToScreenPoint 결과를 안전영역 역변환하므로 월드의 실제 위치를 유지하며 글꼴을 가로로 늘이지 않는다.

한국어 5해상도에서 자기 숨은 UnityWndClass/PID만 WM 마우스로 실제 클릭한다. 잠금 직업 생성 거부→전사 생성/이름창 진입을 검증하며 전역 포인터·사용자 창 입력0이다. 사용자 손조작과 구분한다.

별도 Arabic 자막 RenderTexture도1920×1080 고정 논리해상도로 합성하여 초광폭에서 자막이 눌리지 않게 한다. 다른 언어와 같이 최종 GUI matrix로 균등배율 적용하며 문자 shaping/RTL/문구는 보존한다.

배경 마스킹 경계: 로비/시네마틱/캐릭터생성/시작안내의 전면 배경 밖만 순검정이다. 실제 전투 월드는 기존 초광폭 시야를 유지하고 UI/텍스트만 안전영역 좌표로 합성한다. 인게임 설정/일시정지 등 기존 배경 암전은 유지한다.

월드 전체 피격/흰 섬광과 스테이지 로딩 암전은 물리 화면 전체를 칠하고, 명패/글자/HUD는 안전영역으로 합성한다. 사망 키아트 밖은 같은 fade의 검정으로 마감한다. 게임 카메라·전투 시야/색·알파/타이밍은 보존한다.

검수 의존 실행기 보완: 예약이 있을 때 선두 Owner 우선, 예약이 없을 때 살아 있는 batch 티켓 FIFO. 실제 역순 UI/sound 교착 RED→15개 GREEN, 기존 Acquire-Slot 본문은 바이트 불변. 타인 프로세스/티켓/예약 조작0.

2560×1600 검수는 1440px 물리 모니터의 Screen.SetResolution 높이 제한 때문에 Player 내부에서 자기 PID/UnityWndClass를 다시 확인하고 GetClientRect/GetWindowRect 차이만큼 SetWindowPos로 보정한다. NOMOVE|NOZORDER|NOACTIVATE이며 시스템 해상도·사용자 창 변경0. 실제 Screen 크기 불일치면 여전히 FAIL. 검수 전용 분기이며 일반 UI/플레이 경로에서는 호출하지 않는다. 이 제한을 먼저 확인하도록 16:10부터 캡처한다.

480장 분석 보고서는 전체 원소/가림/교차 근거를 보존한 채 프레임 단위 JSON으로 순차 기록한다. 한 문자열로 합치면 V8 Invalid string length가 발생했으며 검수 임계값/이슈/누락 검사를 완화하지 않는다. 이 보고서 직렬화 보완은 Player 컴파일 입력(Assets/Packages/ProjectSettings)을 변경하지 않는다.

확장 패널 계측: 인벤 CP의 CSS text-shadow 두 고리16회는 명시 장식 패스로 기록하고 실제 본문1회는 독립 글자로 유지한다. 같은 글자의 일반 중복은 계속 충돌이다. TextField 바탕은 내부 focus/hot 상태를 추측하지 않고 normal/hover/active/focused/on4종과 공개 HiDPI 텍스처의 GPU 모든 밉 알파 공통 하한만 사용한다. null 상태의 하한0, 읽기 불명은 여전히 완료 차단. 그림/문구/좌표/광휘 알파·고리 수/텍스트필드 그리기 호출은 보존한다.

| 광휘 분석 항목 | 고정 기준 |
|---|---|
| 명시 근거 | shadow=true, 명시 CSS text-shadow source 접미사, 실제 불투명도 계측 |
| 최대 광휘 알파 | 0 이상 0.03 이하 |
| 본문 연결 반경 | 5.5×min(W/1920,H/1080)+0.01 물리 px |
| 서체 영역 오차 | 폭·높이 차이 각각 0.01px 미만 |
| 연결 경계 | 같은 글자·source·depth·clip, 뒤에 그린 일반 본문, 중간 가림 표면 없음 |
| 유지 검사 | 일반 본문 중복·다른 내용·근거 없는 광휘는 계속 검출, 기존 3.1px 그림자 규칙 변경0 |
| 회귀 | 실제 16:10 CP 프레임에서 RED78→GREEN0, 전체35개 통과 |

| 최종 Player 검수 | 근거 |
|---|---|
| 빌드 입력 | 17c6c202aec17994a2be56813f3a2946dfd7c32b, 3252파일 Git blob 일치·차이0 |
| 빌드 | 3f641994, 6000.6.7f1 Win64, 오류0, -remodel-scenes 1, level0/level1 |
| M1 | f88ef97a, 23/23, --remodel3d, 사용자창0/잔류0/USER_SAVE0 |
| 화면 | dce97701, 32화면×5해상도×ko/de/fr=480 PNG, 실제 Runtime fc3001cf797a69c011758ccaea04df63249f9373155962ba3f008b097cfe004b 일치 |
| 글자/가림/클립 | 전체480장 PASS, 교차0·누락0. 35개 분석 회귀 PASS |
| 실제 포인터 | 한국어5해상도 잠금생성거부·전사이름입력 진입 PASS, 전역포인터0 |
| 수학 회귀 | 공통 안전영역/포인터215개 PASS |
| 자원/보존 | 05:33UTC 공식 예약반환 후 뒤순번 재등록. 원래615파일 복원, 기존WIP520 SHA변경0 |
| 내부 식별자 | NativeUiAudit.DrawingTextShadow, TextFieldBackground, 분석기 decorativeOwnerId는 검수 계측용이며 게임 문구/색/배치/입력 동작을 바꾸지 않음 |

기술/안전/레이아웃 판정은 게임 전체 아트·번역 완성과 별도다. 기존 독일어 튜토리얼 영어 폴백, 프랑스어 직업명 분절 등 로컬라이징/일반아트 RETOUCH와 Arabic32자막 cue 전체 재검수 미실시는 그대로 남긴다. API 상태전환/M1 fixture이며 사용자 자연 클리어 증거로 쓰지 않는다. 최신 웹 비교 기준은 main513d14fb46a8ccb6679c05b512bc1c6bb4d9bfa3로 고정하며 웹 원본/INDEX/WIP를 교체하지 않는다.

여백 정밀검수 재작업: candidate4의 로비/캐릭터에서 바깥 장식16px(32:9)·44px(16:10) FAIL을 보존했다. 별도 RuntimeInitialize Bars Host는 실제 감사 페인트가 없었다. 마스킹은 NativeLobby.Draw 마지막의 NativeUiViewport.MaskFrontend 직접 호출로 바꾸고 독립 Boot/Host를 제거한다. 바깥 픽셀 허용치0은 유지한다. 최종 새 Player 검수 전에는 여백 PASS/전달 완료를 선언하지 않는다.

예약 대기 보완: 선두 예약 전에는 batch 티켓을 생성하지 않아 다른 구버전 FIFO 담당을 막지 않는다. 같은 실제 우선순위 함수를 재사용하고 WaitMin/PollSec으로 대기한다. 원래 Acquire-Slot 안전 게이트는 그대로이며 다른 담당의 잠금/티켓/프로세스는 변경하지 않는다.
