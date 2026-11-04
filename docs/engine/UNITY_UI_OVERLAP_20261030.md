# Unity UI 글자 겹침 수정과 전 화면 상시 검사

> 2026-11-04 HUD·탭바·대장간 기존 목록 감소 후보: `known-overlaps.json` 381항목/707건 → 69항목/86건. 소스에서 분리한 HUD300·탭바177·대장간144건의 항목을 제거했으며 키 목록38·스킬48건은 보존했다. 소스/래칫8검사·텍스트 런90검사·공용 참조 컴파일5어셈블리 오류0. 새 Player 측정·디자인 PASS·CTO 병합·실행본 교체 전이며 실제621건 감소 판정으로 사용하지 않는다. [원인·오탐 의심 목록·인계](../3.1%20ui%20hud%20디자인/UNITY_UI_OVERLAP_BURN_20261104.md).

> 현행 후보: 2026-11-03 20:20절. 이전 Internal_GetTextRectOffset 단독/네이티브 Event.QueueEvent 검수 경로는 아래 실패 이력이며 현행 구현이 아니다. docs 정본 unity/main.

> 2026-10-31 최신: 사이드 판·미니맵·상태·알림·실습은 실제 화면 끝, 무대·제목·모달·구슬/스킬바는 중앙. 다섯 창64px 메달 제목·성장 본문181px 확대·스킬16표시·최종 확장원화+하단 그라데이션 로딩 규격은 [초광폭 현행 SSOT](UNITY_UI_ULTRAWIDE_20261031.md)의 첫 절을 따른다. 아래 이전 수치/검수는 이력이며 새 Player 검수 대기. 공통76상태·실제 직업/세계관/타이틀/브랜드 영상 준비/프레임 진행·활성16로딩/실패 폴백을 검사하며, 프레임별 전체 근거 순차 저장으로 대량 보고서 메모리 누적을 없앴다. 명시 지역 검정 그림자/일반 CP 광휘의 별도 한도를 포함한 분석 회귀44건 통과.

사용자 인계: `I:/EXODUSER-Storage/codex-takeover/ui-overlap-brief.md`. 기준 공통 `10c49850f`를 현재 UI 브랜치에 정상 fast-forward했다. 기존 519개 작업 변경과 미추적 메타는 보존한다.

| 항목 | 구현·검수 계약 |
|---|---|
| 원인 | 높이900의 아이콘 시작726+54+출시안내30+높이20=830. 행동 버튼은816에 시작해14px 침범 |
| 참조 | 웹 `index.html`의 레일 아래18px 여백, 행동 간격12px, 직업별 원화·흐림·잠금. 사용자 캡처를 실제 열람 |
| 검사 | 스키마2: 실제 Player OnGUI Repaint의 글자·의미 영역과 별도 칠 영역(surface), 순서·GUI.depth·실효 불투명도 증명·실제 클립을 기록. 현재 변경의 새 Player 수집은 미실행 |
| 범위 | 첫 화면·메뉴·로비·직업5개·이름 입력·로딩·튜토리얼4개·HUD·일시정지·종료확인·설정4탭/스크롤/선택목록·클리어 |
| 규격 | 1920×1080,1600×900,한국어와 독일어 긴 번역. 추가 최장 언어 선정과 결과 검증은 후속 기록 |
| 판정 | 증명된 불투명 영역을 뺀 보이는 조각끼리 기하 교차 후보 검사. 불명 가림은 적용하지 않고 완료 판정 차단. 실제 수집·PNG 1x 전까지 시각 PASS 아님. 다른 문자열/소스 전체 제외0 |
| 회귀 | 사용자900px 겹침·자기 버튼 포함·경계 침범·글자 충돌·화면 이탈·그림자 중복을 Node 검사. 실제 화면 자동 검사는 별도 필수 |
| 근거 보관 | `I:/EXODUSER-Storage/demo-art/unity-ui/overlap/` |

현재는 계측 구현 후보다. UI 수정·정식 빌드·겹침0·실제1x·M1·MERGE_QUEUE·공통 병합·바탕화면 갱신 전으로 완료/PASS가 아니다.

## 구현 후보와 재현

| 항목 | 변경·증거 |
|---|---|
| 수정 전 | 정식 빌드8ad82072 오류0,실제GPU36d4b41b 정상종료·사용자창0·잔여0.900px에서 출시 안내↔취소/생성 버튼의 실제 충돌 검출. 나머지 튜토리얼 반복 상태는 아래 결함 때문에 완료 근거로 사용하지 않음 |
| 하단 레일 | 이름/출시 안내를76px 폭으로 실제 줄바꿈 측정. 아이콘54/64px+이름 앞9px+안내 앞9px+실측 두 텍스트 높이를 예약하고 행동 행 시작(h−84) 앞18px를 확보. 버튼 간 기존20px는 보존 |
| 잠금 | 기존 흑백 직업 원화 보존·대각선 X 사슬 제거·작은 금속 자물쇠. 이모지0·신규 이미지 생성/비용0 |
| 짧은 화면 | 정보판 높이132→156px. 두 줄 독일어 설명이 판 경계 밖으로 나가지 않게 함 |
| 가림/스크롤 | 기존 스키마1의 누락/오판은 아래 독립 검수 이력에 보존. 스키마2 오프라인 보완과 회귀는 마지막 절 참조. 실제 수집에서 내부 클립 읽기·GPU 알파 판독이 유효한지는 아직 미검증 |
| 메뉴 | 초기 후보에 전경 메뉴 시 HUD보다 먼저 메뉴를 처리하는 분기를 추가했으나, baseline PNG의 HUD는 이미 설정창 뒤에 가려져 있다. 이 오탐을 제품 UI 결함으로 보거나 해당 분기를 시각 개선 증거로 사용하는 설명은 철회. 이번 피드백 처리에서 제품 동작 변경0 |
| 언어 | 동봉29언어 중 기존 RTL영문 폴백 ar를 제외한28언어를 서체 폭으로 실측. 설정 총폭 최장은fr47421.55px,직업선택 최장은de15876.57px. ko/de/fr를 각각 두 해상도로 검사 |
| 재현 검사 | Node9/9. 포함/경계 침범뿐 아니라 먼저 그린 안내가 나중 버튼 안에 완전히 들어간 충돌도 검출. 검정 그림자로 명시된 그리기만3.1px 이내 같은 문자열의 본문과 통합하며, 같은 내용의 본문 중복은 충돌로 남김. 나중 전체 배경이 덮은 이전 버튼도 가림 처리. 슬라이더/체크 조작부 침범도 검출 |
| QA 수정 | r1은 첫 한국어 구간 겹침0 뒤 독일어의 실제 튜토리얼 상태 검사에서 실패. 같은 이름의 격리 캐릭터에 전투 자동저장이 생겨 재입장이 이어하기로 분기한 원인. 각 조합에 고유 캐릭터를 사용하고 로딩/튜토리얼 실제 상태를 강제 확인. 실패는 즉시 종료하도록 보강 |
| 상시 등록 | check.ps1에서 M1→UI를 연속 실행. buildloop에서도 M1 뒤필수 호출·0건/화면/언어/PNG 누락 검증. 실패/미실행은 인도 FAIL |

r1 실패 검수는 자기 Player만 경로/로그/PID 확인 후 중단했다. 사용자/타인 실행 종료0. 빌드 고리 전체 재실행·일반 앱 자동 실행·자동화 추가0. 현재 r2는 공통 실행기에서 타 담당의 기존 작업 완료를 기다린다.

실측 보강: `TextClipping.Overflow`는 배정 상자에 임의로 자르지 않고 실제 조판 폭/높이를 기록한다. 이로써 r2의 독일어/프랑스어 긴 특성 설명이 다음 특성 제목·판 경계를 침범하는 결함을 검출했다. 1080px 특성판의 행 높이는27px 제목+실측 본문(최소35px)+12px 간격, 판 높이는72px 헤더+행 합계+8px로 확장한다. 900px의 본문 생략·44px 행 정책은 유지한다. 직업명이 한 글자만 다음 행에 남는 경우에는 두 행 최대 폭을 최소화하는 분할점을 사용한다. 원래 글자·직업명·번역 내용은 보존한다.

기존 계측 스키마1은 본문/검정 그림자 구분까지만 기록했다. 현재 스키마2는 가림 메타데이터도 요구한다. UI 검수 manifest에 현재 DLL의 SHA-256·Unity 버전·GPU 이름/종류를 기록하고, 실행 전후 실제 DLL과 대조한다. 이전 스키마·Null GPU·가림 근거/검사 누락은0건이어도 통과시키지 않는다. 기존 바탕화면 실행기는 entry-flow/build를 가리키며 새 검수 완료 전 변경하지 않는다.

1x 추가 결함: 이름 입력창의 `name_cancel.png`/`name_create.png`에는 취소/생성이 구워져 있었다. 그 위 번역 DrawSpaced가 중복 인쇄되어 KO/DE/FR에서 실제 겹침을 확인했다. 기존 글자 없는 ActionPlate(173×47,edge22,outset2)로 교체하고 각 번역은 한 번만 그린다. 기존 두 비트맵을 다시 사용할 때도 Image 계측이 고정 글자30×18px를 기록해 중복을 검출한다. 제목은 가짜Bold·글자별 Clip 조판 대신 Hahmlet/지역 폴백의 단일 Normal 행을358×42(y+35)에 표시하며24→최소16px로 실제 폭에 맞춘다. 입력2~8자·취소/생성 콜백·IME·저장 정책은 보존한다. 신규 자산 생성·원본 이미지 수정0.

추가1x의 프랑스어 설정 이름 `Grade Minimum de Ramassage`가 고정250px 시작 슬라이더 손잡이와 붙었다. 이름 예약 폭을max(230,실제17px 폭+12),슬라이더 시작을min(열 폭50%,이름 폭+20)으로 계산한다. 값 영역의 최소112/최대열34% 예약·옵션값/범위/입력 계산은 보존한다. 슬라이더·체크·선택 상자·공통 상단 탭의 실제 그리기 영역도 계측하며 이름과 조작부가 겹치면 실패한다.

최종 검사 범위는 인장 첫 화면뿐 아니라 실제 FDG 브랜드 인트로도 별도 포함한28화면×두 해상도×ko/de/fr=168장이다. 현재 대기 후보는 코드/관련 문서만 원격 작업 브랜치에 보존했으며, 공용 예약 때문에 새 컴파일·M1·0건 판정·통합/인도 전이다. 이전162장이나 정식 빌드를 이 후보의 완료로 소급하지 않는다.

## 이전 게이트 이력 — 2026-10-30 21:10 KST

제품 소스d500725c7은 실제 Player RSP·Unity SDK Roslyn 독립컴파일 exit0/오류0/DLL1156096바이트를 확인했다. 출력SHA256 `10d1f38ee1167ab5e698dd11083e3153b1c94ed809009a4f42fcb0314bd112a5`, 근거 `overlap/final-compile/영수증.json`. 이 DLL은 독립 컴파일 산출물이며 실행 빌드에 교체하지 않았다.

정식 r3 빌드는 공통 실행기에서15분 기다린 뒤 실행 전 시간 초과했다. Unity실행0개 관측과 별개로 `codex-skill-fix`의 기존 예약이22:51KST까지 유지되어 슬롯을 받지 못했다. 예약 원본SHA256 `9e83393320164ce8dfd2b99ddb1d0e1404f0d32d2650fdaed01a6abf89b5a642`를 I:에 보존했으며 해제0. 유휴 예약 변경 여부를 사용자 비동기 질문으로 요청했고 응답 전 임의 변경하지 않는다.

현 상태 **HOLD/최종 시각 미검증**. 미완료는 정식 빌드→최종 M1/168장0건→같은 후보1x→준비된 MERGE_QUEUE 영수증→unity/main 비강제 통합→바탕화면 갱신이다. 기존 공통10c49850f·entry-flow 바로가기를 보존한다. 상세와 재개 명령은 `I:/EXODUSER-Storage/demo-art/unity-ui/overlap/REPORT.md`.

## 독립 검수 피드백 처리 — 2026-10-30 21:13 KST

현재 ui-overlap 한 건의 검수 정정이다. 공식 CLI5388 소유·실행 순번을 유지하며 Unity/Player/빌드·새 제작·후속 단위 배정·예약 변경0. 기존 PNG3장과 원본 JSON/현재 검사기만 오프라인 대조했다.

| 검수 항목 | 확인 결과 |
|---|---|
| 1600×900 한국어 | 출시 안내y811.9650269+h16.0700073=828.0350342,취소y827.1350098+h21.7299805. 실제 수직 교차0.9000244px. 원본 JSON을 현재 검사기에 그대로 넣어도 해당 글자-글자 충돌을 계속 검출 |
| 1920×1080 한국어 | 안내의 y953.965+h16.070과 버튼 글자y1007.135 사이 약37.10px 간격. 같은 안내↔취소 쌍은0건.1920만으로 수정 완료를 판단하지 않음 |
| 1920-de 설정3 | 원본 HUD L(id1,x1699/y32.8)↔설정 탭 치(id189,x1693.78/y42.86) 교차는 실제 PNG에서 뒤 HUD가 가려진 오탐. 원본 panel은id0/id89뿐이며 설정 배경·상단 불투명 탭의 가림 기록 누락 확인 |
| 가림 대조군 | 실제 소스의 비활성 탭 사각형(1516.8,32,363.2,40)을 보충한 오프라인 대조군에서 위 쌍0건. 보충 데이터이며 실제 계측 수정/새 Player PASS 근거가 아님 |
| 당시 분석기 한계 | 모든 panel을 불투명하다고 가정. GUI 깊이 미반영. 부분 가림 뒤의 원래 전체 글자 상자를 유지. 반투명/불투명도 불명/뒤 깊이/부분 가림4조건이 오프라인 회귀에서 미충족. 이 실패 이력은 아래 구현 후에도 보존 |
| 수치 정정 | 독립 검수의 중간 partial-analysis.json 96프레임/834교차와 다른 단계의 교차 총계는 기하 후보 수다. 전부 확정 시각 결함으로 집계하거나 가림 누락 데이터를 이용해 전체0건 PASS로 해석하지 않음 |

처리 근거는 `overlap/독립검수_재현.cjs`와 `overlap/독립검수_처리결과.json`이다. 입력3개 JSON SHA도 함께 남겼다. 소스명·문자열 전체를 제외하는 규칙은 추가하지 않았다. 기존 Node9/9는 제한된 검사 범위의 결과이며 추가 가림 검수4조건을 대체하지 않는다.

동일 단위의 검사기 완료 조건은 실제 그리기 순서/GUI 깊이, 원본·클립 후 사각형, 실효 불투명도와 실제 불투명 배경/탭 영역을 계측하고, 부분 가림을 보이는 조각에만 적용하는 것이다. 불투명도/가림 근거가 없으면 미검증으로 남긴다. 위 오탐을 제거하면서 원본1600의0.9000244px 실제 충돌이 계속 검출되는지 함께 확인해야 한다. 현 판정은 **HOLD — 보이는 글자만 검사한다는 주장 미충족**이다.

## 가림 검사기 오프라인 보완 — 2026-10-30 21:42 KST

같은 CLI5388/작업 경로/브랜치의 필수 의존 작업 한 건이다. 시작 HEAD `ed7a7a72fa2ec9ef0372bd877f30493ded1cab1a`, INDEX 비어 있음과 사용자 지정 입력 SHA 2개를 직접 대조했다. 기존 docs 수정·다른 자산/메타/씬 WIP를 보존했다. 입력과 과거 실패 JSON/REPORT는 `overlap/occlusion-input/`에 복사했다. 새 세션/작업본/후속 단위 생성0, Unity/Player/빌드 실행0이다.

| 항목 | 현재 구현 |
|---|---|
| 스키마2 필드 | `order`, `depth=GUI.depth`, `unclippedRect`, 클립 후 `rect`, `hasClip`, `clipRect`, `clipKnown`, `opacityKnown`, `effectiveOpacity`, `opacityProof`, `axisAligned`, `ownerId` |
| 실제 칠 수집 | 기존 그리기 호출부 37개 파일의 DrawTexture/DrawTextureWithTexCoords를 동일 인자 전달 계측으로 교체. 설정 window_base와 탭의 단색 Fill도 포함. 의미상 panel 포함만으로 가림을 추정하지 않음 |
| 알파 증명 | whiteTexture의 실제 GUI.color.a, alphaBlend=false의 비혼합 칠, 단일 밉 Texture2D의 GPU RGBAFloat 알파 판독. 유효 불투명도 정확히1인 증명 영역만 사용. 전체가 불투명하지 않으면16px 타일+인접1px까지 알파1인 내부를 합쳐 수집. 텍스처 updateCount 변경 시 재판독 |
| 보수적 제한 | 동적 텍스처·밉 체인·판독 실패·내부 상태별 GUIStyle 바탕·비활성 GUI·회전/불명 메타데이터는 불투명 가림으로 쓰지 않음. 반투명 합성 여러 장을 임의로 완전 불투명으로 올리지 않음. 불명 표면/클립은 검사 완료를 차단 |
| 클립 | 매 기록 시 GUIClip.visibleRect 실제 값을 화면 좌표로 변환하고 기존 중첩 Group/ScrollView 클립과 교차. 내부 API 조회 실패는 clipKnown=false. 실제 Player에서 이 경로의 유효성 실증은 남음 |
| 앞뒤 순서 | 낮은 GUI.depth가 앞, 같은 깊이는 뒤 그리기 호출이 앞. 모든 필요한 순서/클립/축 정렬/알파 증명이 있어야 마스크로 사용 |
| 부분 가림 | 불투명 사각형의 차집합을 최대4조각으로 분할하고 다음 마스크에도 반복. 남은 조각과 교차 영역을 결과 JSON의 visibleRects/intersections에 보존 |
| 임계값 | 기존 교차 판정 가로/세로0.5px 초과를 유지. 차집합에는 이 허용오차를 쓰지 않아 작은 잔여 조각도 삭제하지 않음. 문자열·소스명 전체 제외0 |
| 완료 방지 | frame/coverage 스키마2 및 visibilityComplete 필수. 구 JSON·불명 가림으로 교차0이어도 전체 PASS 금지 |

| 검증 그룹 | 수정 전 | 수정 후 |
|---|---|---|
| 기존 analyze.test.cjs | 9/9 | 9/9. 기존8번의 전체 판 가림 의도에 불투명도·깊이·클립 증명을 명시했으며 제외/완화하지 않음 |
| 새 occlusion.test.cjs 4조건 | 0/4, 4실패 | 4/4: 반투명·불명·뒤 깊이·부분 가림 |
| visibility.test.cjs 추가 근거 | 신규 | 7/7: 원본1600/1920, 설정 HUD 대조군, 잔여 교차, 클립, 깊이 순서, 불명 완료 방지 |
| 원본 JSON | 3개 고정 | 3/3 SHA 동일. 1600 실제 준비문구↔취소0.9000244px 계속 검출. 1920 동일 쌍0 |
| 설정 뒤 HUD | 원본의 가림 누락 | 원본은 후보 유지. 소스의 실제 비활성 탭 사각형/불투명도를 보충한 대조군에서만 해당 쌍0. 반투명/불명/뒤 깊이로 바꾸면 다시 검출. 새 Player 계측 증거 아님 |
| C# 독립 컴파일 | 기존 d500 영수증과 분리 | 현재 Player RSP/Roslyn exit0·오류0·DLL1168384바이트. 정식 Unity 빌드/실행0 |

근거: `overlap/occlusion-results/검증.json`, 그룹별 Node 로그, `occlusion-compile/checkpoint/영수증.json`. 현재 NativeUiAudit SHA256 `654cf76d3b036b6a24e76f05990c95d8262a8d3a3716e669f62dd716651f2f9d`, 분석기 `316cedf7fd94ac9b362ea4ca5c74cda2cafbb58f584f1cc6e1bd5444a0e1f1dd`, 독립 DLL `ed72a01ae46fde8920d45dc1529f209d412a3c72d9e52a86e0ca278b479955b4`다. 그리기 호출 전달 동일성37/37도 오프라인 확인했다. 전체 입력 파일별 SHA는 검증 JSON에 있다.

API 대조 근거는 Unity 공식 [그리기/비율 계산 소스](https://github.com/Unity-Technologies/UnityCsReference/blob/master/Modules/IMGUI/GUI.cs)와 [실제 GUIClip 바인딩](https://github.com/Unity-Technologies/UnityCsReference/blob/master/Modules/IMGUI/GUIClip.bindings.cs)이다. 로컬 Unity6000.6.7f1 참조를 사용한 독립 컴파일과, 향후 실제 수집 확인은 별도다.

**오프라인 보완 완료 / 전체 UI는 HOLD·최종 시각 미검증**. 이전 r1 실패·r2 교차·독립 검수4실패·RETOUCH 이력은 초기화하지 않는다. 정상 예약 반환 요청은 소유 담당에게 이미 단회큐 `01a18cb9-759a-7030-808f-5bfc0d4e8619`로 수락됐으며 실제 해제는 미확인이다. 추가 질문/해제/잠금 변경0. 입력이 바뀌었으므로 d500725c의 과거 r3 지시는 폐기하고 이 새 소스/해시로 고정한다. 예약 반환과 실행 안전 조건 확인 후 실제 가림 계측→168장/M1/같은 후보1x→정상 통합→Desktop 순서는 같은 기존 UI 완료 게이트로 남긴다.

## 실행 직전 재확인 — 2026-10-30 21:54 KST

사용자가 기존 스킬 예약 소비 작업의 정상종료와 잠금 반환을 확인해 같은 UI 최종 게이트 재개를 지시했다. 담당이 실행 직전 다시 확인한 결과 다른 담당의 현존/새 예약2건이 있어 **빌드 시작 전 HOLD**했다. 타인 예약이 이미 있으면 현재 사실만 남기라는 최신 지시를 적용했으며 공식 실행기 build/player 호출·예약/잠금 직접 변경·타인 종료·세이브/실행본/바로가기 변경·테스트 반복 모두0이다. 이번 보류는 실행 실패나 같은 원인2실패 카운터의 새 실행으로 세지 않으며 기존 실패/RETOUCH 이력은 유지한다.

| 항목 | 직접 확인한 현재 사실 |
|---|---|
| 확인 시각 | 2026-10-30T12:54:05.7825818Z, 원격·입력 재확인12:54:27.889Z |
| 소유 | 공식 CLI5388·기록01a18c95-7cee-7322-88d1-047d754e88d9·같은 경로/브랜치. 새 writer/세션/작업본0 |
| UI 입력 | HEAD/작업 원격4787e09a932d319016e95c13704cce1cb49c4006 일치. INDEX 비어 있음·자기 Runtime/분석기 WORK 깨끗함. NativeUiAudit/분석기 SHA는 위654cf76d…/316cedf7… 그대로 |
| 실제 예약1 | 20261030T124618982_codex-boss-druid.json. 소유codex-boss-druid, 생성12:46:18.983Z, 기록 만료14:46:18.979Z. 드루이드 탄막 후보 빌드·M1·동일빌드 A/B 캡처 |
| 실제 예약2 | 20261030T125346805_codex-skill-fix.json. 소유codex-skill-fix, 생성12:53:46.806Z, 기록 만료14:53:46.802Z. 공통4fedb6a3f 통합빌드·설치본 확인·Desktop 전달. 이전 반환된 예약과 다른 새 예약 |
| 잠금/실행 | _pc_lock.json 없음·HALT 없음·Unity/Player CIM0. 빈 잠금/프로세스만으로 예약 우선순위를 무시하지 않음 |
| 여유 | 커밋 여유49.28GiB, E: 여유1520.17GiB |
| 최신 공통 원격 | unity/main=4fedb6a3f22a9cc601f0e2df7731823f190985ee. 과거10c49850f expected를 재사용하지 않음. UI에 통합하지 않았으며 이후 Unity 입력 변경 시 필요한 검증은 별도 |
| 실제 바로가기4속성 | target=I:/EXODUSER-Storage/demo-art/entry-flow/build/EXODUSER-Unity.exe; arguments=-force-d3d11 --remodel3d; workingDirectory=같은entry-flow/build; icon=같은exe,0. 변경0 |
| 인도 전 SHA | 바로가기ac3c966fa11a9ffa837446a72428ed7718e20caabf4588303d6afc642bfa568b; Runtime b5bfe912ccec2a1df294be8db777678354d255b7a28aabbf98163b119409d49a; Core c63a59cd26ba349f73a6084fed8aa4770fc8eb062eb1ed1f12ac64a56fd165cf |

근거는 `overlap/final4787/실행전_현황.json`과 `입력과_중단근거.json`이다. 원본 예약2개의 내용과 SHA도 기록했다. 이는 실제 UI 빌드/실게임 PASS가 아니다. 현재 미완료는 동일하게 새 입력의 정식 빌드→실제 가림 메타데이터 완전성→168장/M1→같은 후보 동일크기·1x→MERGE_QUEUE 준비→최신 공통 정상통합과 필요한 재검증→실제 Desktop 전달이다. 다른 담당 예약을 건드리거나 과거 d500/r3 결과를 재사용하지 않았다.

## 정상 반환 후 실제 실행과 계측 재작업 — 2026-10-30

13:33UTC 담당 재확인에서 타 예약0·잠금/HALT0·Unity/Player0·커밋 여유48.96GiB였다. 실제 Desktop은 skill-fix/release-build, Runtime `6a6ce52d982cbfbc29107fec264a24b239b0ac8e1c0e97e5bf1696074a021bbc`, Core `adf65e41bfa315c1cbdfb208c1e449459d3d90c3d543561905b0916d5e3b2fba`로 사용자 expected와 일치했다. 공식 reserve로 자기 순번을 확보하고 공통 `f27c9d1f9db3a83fd2ba8f9721c8c229a86e36e1`을 정상 병합했다. 병합 HEAD `ca984da45ea7d94daa08bae99c77cd7f065c66e7`, Unity tree `54ddf46dd17ec6400139e7d6c78e72354debbe68`, 기존 WIP520개 파일 byte 보존·INDEX 비어 있음을 확인하고 작업 원격에 보존했다.

| 단계 | 실제 결과 |
|---|---|
| 순번 | 전사 선행 FIFO와 UI 예약이 역순 대기. 전사 담당이 자기 티켓만 안전 취소한 뒤 UI 진행. UI의 타인 티켓/예약/프로세스 변경0 |
| 정식 빌드 | 공식 a5a55986, build.json Succeeded/errors0, compileErrors0, sandbox 세이브 변경0. 일반 errorLogs2와 컴파일 오류0은 구분 |
| 현재 후보 DLL | Runtime eb965b9e0c36d6fc43100f708e68ee62b4d9adb021304fe9aac18f485a2d6d42, Core dfb9c3f0db87869b06c6b22e44e37b1443e8cafce802a6e3d148557dff7299b0 |
| 실제 Player | 공식1244729a, AMD Radeon RX9070XT/D3D11, 168장, exit0/windows0/leftovers0/desktopClosed. 사용자 세이브 변경0 |
| 가림 판정 | FAIL. 168프레임의 교차 후보48건, 가림 완전성 미충족162프레임. 48건은 HUD의8쌍×6조합이며 실제 PNG에서 그림자다. 확정 제품 겹침48건으로 세지 않음 |
| 미충족 원인 | 동적/다중 밉 텍스처 알파 미수집, GUI.enabled를 DrawTexture에 잘못 적용, 회전 칠의 외접 상자만 기록, GUIStyle Label 바탕 상태 미수집. HUD 검정 그림자가 GUI.color로 지정돼 shadow로 태그되지 않음 |
| 실행 스크립트 | 최초 PS 실행은 Player 시작 전 실패/자기 stale 잠금. 이후 공식 실행이 자기 stale 잠금 정상 회수 후1244729a 실행. 종료 뒤 PowerShell5의 기본 인코딩으로 한글 JSON을 잘못 읽는 오류를 확인. UTF8 명시 후 이미 수집된 JSON은 Node로 분석했으며 캡처 재실행0 |

원본 근거는 `overlap/final-ui-20261030/candidate/`에 보존한다. 검사기 소스 보완 동안 공식 unreserve로 자기 예약을 정상 반환했으며 다른 담당의 슬롯을 독점하지 않았다. 현재 실패는 실제 계측 완전성 1회 실패로 유지하며 다음 같은 원인 실제 실패 때 중단한다. 이전 r1/r2/독립 검수/RETOUCH 이력은 초기화하지 않는다.

| 계측 보완 | 구현 계약 |
|---|---|
| 실제 알파 | 검수 전용 UiAuditAlpha 셰이더가 tex2Dlod로 실제 GPU의 모든 밉을 RGBAFloat로 읽음. RT는 수집 프레임마다 재판독하고 정적 Texture2D는 updateCount 기준 캐시. 실효 불투명도는 모든 밉의 보수적 최솟값×GUI.color.a. 최솟값이 정확히1일 때만 전체 영역 가림으로 사용하며 불명은 여전히 실패 |
| 부분 텍스처 | 단일 밉만16px 타일과 인접1px의 알파1을 증명해 부분 가림에 사용. 여러 밉을 mip0만 보고 불투명으로 승격하지 않음. 최솟값0인 영역을 임의로 가림 처리하지 않음 |
| 메타데이터 | 실제 GUI/content/background 색, GUI.enabled, 텍스처명·밉 수·알파 최솟값/최댓값·표본 설명·칠 꼭짓점 quad를 추가. DrawTexture는 GUI.enabled와 무관하게 실제 전달 색으로 그리는 API이므로 이를 opacityKnown=false로 만드는 오류 수정 |
| 회전/클립 | 외접 상자로 가리지 않고 실제 quad를 클립한 볼록 다각형의 차집합으로 처리. 남은 visiblePolygons와 외접 visibleRects, 실제 교차 다각형 경계로 충돌 계산. 기존0.5px 교차 임계값 유지. 불명 도형/클립은 여전히 완료 차단 |
| Label 바탕 | Windows Player의 실제 GUI.Label hover/normal 상태와 GUI.backgroundColor를 적용해 해당 바탕 알파 수집. 제어 ID를 추측해야 하는 다른 상태는 여전히 불명으로 남김 |
| 그림자 | style.normal.textColor뿐 아니라 GUI.color×GUI.contentColor까지 곱한 최종 검정 잉크를 shadow로 기록. 문자열/소스명 제외0, 비그림자 중복 글자 검출 유지 |
| 수집 시점 | 촬영 직전 실제 Repaint에서만 계측 활성화, capturedFrame과 저장 시점 Time.frameCount 일치 필수. 대기 중 GPU 판독을 반복하지 않음 |
| 오프라인 결과 | 기존9/9 + 추가4/4 + 가림7/7 유지, 회전/클립5/5 추가. 초기 회전 차집합의 중복 꼭짓점 1실패를 보존하고 수정 후 통과. 독립 컴파일의 GUIUtility.pixelsPerPoint API 1실패도 보존하고 실제 지원 경로로 수정 후 오류0 |

현재 보완은 독립 컴파일까지 통과한 새 후보이며 새 정식 빌드/실제 168장/M1/1x는 미검증이다. 정식 빌드와 새 입력 검증 전에 이전 후보168장을 새 후보 PASS로 사용하지 않는다. 관련 docs 전체 검색은 `overlap/occlusion-docs-search.txt`에 남겼다.

재접수 준비 검토에서 회전 판이 클립 뒤 빈 도형이 되는 경우를 추가했다. 빈 마스크의 차집합이 뒤 글자를 지워0으로 만들 수 있는 오프라인 결함2개를 먼저 재현하고, 빈 마스크는 원본 조각을 그대로 보존하도록 수정했다. 현재 회전/클립7/7, 전체9+4+7+7=27/27이며 원본1600의0.9000244px 검출도 유지한다. 초기 회전 중복 꼭짓점1실패와 이번 빈 마스크2실패를 모두 보존한다. C#·셰이더는5dc623237의 독립 컴파일 입력과 동일하다.

공식 빌드가 FirstPlayable.unity를 생성해 기존 WIP와 달라진 것을 발견했다. 자기 빌드 생성본(2a4f2b64…)과 diff를 candidate에 별도 보존하고, 시작 시 복사·SHA 검증한 기존 WIP(2ff71d24…)를 동일 byte로 복원했다. 다른 WIP519개는 변경 없으며 자기 코드/문서9개 외 커밋0이다. 근거 `candidate/씬보존_영수증.json`. 새 빌드에도 생성 씬과 사전 WIP를 별도 보존하며 빌드 입력/생성 결과를 구분한다.

보완 후보5dc623237은 작업 원격에 보존했다. 공식 자기 예약을 다시 등록한 현재 순서는 MCP→전사→보스→UI다. FIFO/예약 역순 교착 방지를 위해 자기 예약이 맨 앞이 되기 전에는 CmdRun 빌드 티켓을 생성하지 않는다. 타인 잠금/예약/프로세스 변경0이다.

추가 호출 순서 검토: 고정 글자가 구워진 원화는 칠과 글자가 한 이미지다. ImageText 계측을 이미지 칠 뒤에 기록해 자기 이미지의 불투명 영역이 자기 구워진 글자를 지우는 오판을 막았다. 실제 GUI.DrawTexture 인자/횟수와 제품 표시 변경0이며, 이전에 제거한 name_cancel/name_create 원화를 다시 사용할 때의 중복 검출 보호를 유지한다.

촬영 fixture는 기존 공개 SetGameFocus(true) API로 게임/메뉴 포커스를 함께 설정한다. 숨은 데스크톱의 OS 포커스와 혼동하지 않으며 기존 pauseSmoke의 포커스 손실 무시 정책을 사용한다. 메뉴 Reset은 Focused를 복구하지 않으므로 초기 포커스 손실 시 ObserveReleased(false)도 작동하지 않을 수 있음을 소스로 확인한 보강이다. 실제 OS 입력/자연 플레이 PASS 근거가 아니며, 비활성 GUIStyle 바탕은 여전히 불명 상태일 때 실패한다.

그림자 통합의 방해 칠도 실제 두 호출 사이 순서와 교차 도형으로 한정했다. 다른 위치의 앞 GUI 깊이 판 때문에 정상 그림자 통합이 막히는 경우를1실패로 재현하고 보완했으며, 두 글자 사이에 부분 칠이 있으면 남은 다른 글자는 계속 별도 검출한다. 기존9+추가4+가림7+회전/클립7+그림자2=29/29. 실제 교차 도형도 결과의 intersectionPolygons로 보존한다. 문자열/소스명 제외와 임계값 변경0이며 C# 입력은f60cce6f0와 동일하다.

GPU 판독 자체도 실제 대조군으로 검증한다. 첫 수집 Repaint에서 RGBAFloat 2×2의 알파[0,0.25,0.5,1], 직접 작성한3개 밉의 최솟값[1,0.5,0], 같은2×2를 Blit한 RenderTexture의4개 알파를 실제 셰이더/ReadPixels 경로로 읽어 원소별 정확 일치를 요구한다. 결과와 proof를 모든 프레임 JSON에 기록하고 대조군 불일치 때 해당 알파는 가림으로 쓰지 않으며 전체 검사도 실패한다. 전부0/전부1 판독·밉 누락·RT 반전·완료 플래그만으로 PASS가 되지 않는 Node2검사를 추가해 전체31/31이다. 이는 충돌 임계값 완화가 아닌 판독 정확성 대조군이며, 현재는 독립 컴파일 오류0까지의 후보로 실제 GPU 결과는 자기 다음 순번에서 확인한다.

최신 공통 a62b515d66a23c59bd9f2acb60555fbb6a669e90을 사전 병합했다. NativeGame.cs에서 같은 위치에 추가된 --unity-ui-overlap-check/--unity-hero-review 두 실행 분기만 충돌하여 각각의 코루틴과 Running=false를 모두 보존했다. 기존 WIP520개는 동일 byte로 유지하며 이 새 입력의 정식 빌드/실게임 검증은 아직 전이다.

## 전사 R4 철회에 따른 현재 인도 조건 — 2026-10-31 00:00 KST

전사 담당이 R4의 지옥강타 Core 즉시 피해와 실제 몸 접점 사이233ms 지연을 FAIL로 정정했다. UI는 R4를 검증 완료/최종 전달 근거로 사용하지 않는다. 이미 병합한 a62 입력은 기록용으로 보존하며 R5의 새 게이트와 공통을 확인한 뒤 최종 UI 통합/인도를 진행한다. UI의 현재 자체 실패 이력은 실제 가림 완전성1회 FAIL이며 별개 전사 결함을 UI 검사기 실패 카운터로 세거나 기존 기록을 지우지 않는다.

15:00:28UTC 실제 일반 링크가 skill-fix/release-build로 동일 byte 복구됐음을 직접 재확인했다. 네속성은 해당 EXE·`-force-d3d11 --remodel3d`·같은 작업폴더·같은 EXE아이콘, 링크 SHA `e90cacc1bfdfd6833b3881956488b67df07cc76f0d2af49913853aba16ead33e`, Runtime `6a6ce52d982cbfbc29107fec264a24b239b0ac8e1c0e97e5bf1696074a021bbc`, Core `adf65e41bfa315c1cbdfb208c1e449459d3d90c3d543561905b0916d5e3b2fba`다. 직전 hero/r4 링크 관측/원본 백업도 보존한다. 실제 UI 전달 직전 다시 대조하며 이번 UI의 링크/실행본 변경0이다. 근거 `final-ui-20261030/desktop-observations/20261030T150028494/관측.json`.

현재 예약은 보스→UI→전사 순이며 UI 새 빌드/FIFO는 아직0이다. 자기 차례의 독립 UI 계측 검증과 최종 제품 인도 게이트를 구분한다. 알려진 전사 FAIL 입력을 그대로 최종 PASS로 승격하거나 d500/r3 영수증을 재사용하지 않는다.

## 보완 수집기의 실제 재검증 — 2026-10-31 00:15 KST

공식 CLI5388·자기 선두 예약에서 최신 공통 a62b515d66a23c59bd9f2acb60555fbb6a669e90을 fetch 대조했다. HEAD 771352f01c8bf4879832221f83651839ba4867f9, Unity tree 6156602ade35f34b5b1e62c88739cc8f7c5f700b, 기존 WIP520개 동일 byte·INDEX 비어 있음을 고정했다. 공식 빌드161977db 오류0/Succeeded, Player a542bd52 실제 D3D11/RX9070XT 정상exit0·windows0·leftovers0·숨은 데스크톱 정상폐쇄다.

| 게이트 | 실제 결과 |
|---|---|
| 화면·해상도·언어 | 28화면×1920/1600×ko/de/fr = 168/168, 누락0, 충돌0 |
| 실제 가림 완전성 | 불명 불투명도0, 불명 clip0, 미완전 프레임0; 실제 surface16068·회전 요소3072 |
| GPU 대조군 | 168장 모두 RGBA/RT [0,0.25,0.5,1], 3밉 [1,0.5,0] 원소별 정확 일치, 불일치0 |
| 동일 실행본 M1 | Player8bf1a273, 23/23 ok, 정상exit0·windows0·leftovers0 |
| Runtime SHA | 130d06f4521fc0548afdf4489a6b466b331013ef555fa45803b320b5ff37a78b |
| Core SHA | dfb9c3f0db87869b06c6b22e44e37b1443e8cafce802a6e3d148557dff7299b0 |
| 기존 실패 이력 | 첫 수집 실제 가림 완전성1회 FAIL 유지. 보완 후 이번 재검증 PASS이며 카운터/RETOUCH 초기화0 |
| 미완료 | 현재 후보168장 1x·동일크기 직접판정, R5 최신 공통 정상반영 후 새 입력 검증, MERGE_QUEUE 준비·공통 비강제 반영·Desktop 전달 |

생성 씬 f62b7241…을 별도 보존 후 기존 WIP2ff71d24…로 동일 byte 복구했다. 근거는 final-ui-20261030/candidate2/의 고정_입력.json·씬보존_영수증.json·build.json·verify/overlap/가림_완전성_요약.json·verify/m1/m1-check.json이다. 문자열/소스명 제외0·충돌 임계값 변경0이며 기존9/9+추가4/4+가림7/7+회전/클립7/7+그림자2/2+알파대조2/2=31/31의 오프라인 영수증과 실제 결과를 구분한다.

15:15UTC 자기 예약을 공식 unreserve했다. 오프라인 직접검수 중 유휴 슬롯을 잡지 않으며 R4 철회 입력 후보의 제품 전달0이다.

168장 각각의 원본 크기1x 크롭, 전체 배치6장, 웹/Unity1920 동일크기와 사용자 결함 전후1x를 제작자가 직접 열었다. 현재 UI 겹침 범위 VISUAL VERDICT: PASS. 1600 한국어 준비문구/취소 분리·잠금X 제거·이름창 중복 없음·설정 뒤 HUD 비노출을 확인했다. 현재 NativeGame.OnGUI는 menu 분기에서 HUD 전 return하므로 새 설정 원계측에는 뒤 HUD 자체가 없다. 이를 가림 검사기의 실측 마스킹 성공으로 오해하지 않는다. 실제 HUD 프레임의 글자/도형/깊이와 실제1920-de-설정3의 칠/알파/clip을 결합한 별도 재생 대조에서는 충돌0·전면 탭 유지, 칠 제거 음성 대조에서는 HUD 교차30건이 다시 검출된다. HUD 전체를 버리지 않고44글자의 남은 부분을 보존한다. 이 재생 대조는 실제 같은 프레임 동시 그리기 영수증이나 제품 PASS 입력으로 사용하지 않는다. 최초 진단 스크립트의 source명/전체 문자열 가정1실패와 재생 HUD 전체소거 가정1실패도 보존하며 생산 분석기 변경0이다. 근거 candidate2/verify/overlap/실제HUD_가림대조.json 및 직접검수/직접판정.json. 기존 영문 폴백/일부 한국어 설명과 긴 BGM 내부식별자 접미부 클립은 이 단위의 번역/전체UI 완성 PASS로 확대하지 않는다. R5 새 공통 입력 검증과 최종 인도는 여전히 남아 있다.

## R5 정상 통합 후 UI 최종 후보 검수 — 2026-10-31

공식 CLI5388·기존 기록/작업본에서 자기 순번을 확보하여 R5 공통 a861d03037ead23aa022b9be4ae7f9d83156d09c을 정상 병합했다. 빌드 입력 HEAD 59ff9d02284cf440d617caeb923943c3254ab14e, Unity tree b0e63e30e651d8904797bdb14a20300ac8eb2ffe, 기존 tracked WORK520개 overlay는 기존WIP_입력.json의 별도 고정 입력이다. HEAD tree만으로 전체 디스크 입력을 주장하지 않으며 타인 WIP를 채택/커밋하지 않았다. 생성 씬 SHA 2c61a2d6d5c5f6ffdb0e3c9d7c130714060c0a5b462cc533489121c69230fde6를 보관 후 기존 씬/WIP 전체 byte를 보존했다. 뒤에 갱신된 공통202b32c85는 Mac 검수 문서1개만 정상 병합했고 Unity 입력 tree 불변을 확인했다.

| 게이트 | 실제 결과 |
|---|---|
| 정식 빌드 | 49d0ded4, Succeeded, 컴파일/빌드 오류0, 총3096044965 bytes |
| 실제 Player | 0045b681, D3D11/RX9070XT, 28화면×1920/1600×ko/de/fr 168/168, 충돌0·누락0 |
| 가림/clip/alpha | surface16068·회전3072, 불명 불투명도0·불명 clip0·불완전 프레임0; 실제 GPU RGBA/RT [0,.25,.5,1] 및 3밉 [1,.5,0] 168장 정확 일치 |
| 동일 실행본 M1 | 52b63aa2, 23/23 ok |
| 실행 안전 | 빌드/두 Player 모두 정상exit0·USER_SAVE변경0, Player 창0·잔여0·강제종료0 |
| Runtime SHA | c783571aa39dc01b3c5ac82eae3b97b5ba7613d17a236f48d6e4b9fd65569218 |
| Core SHA | dfb9c3f0db87869b06c6b22e44e37b1443e8cafce802a6e3d148557dff7299b0 |
| EXE SHA | 9806abde4a406ed68647e9505852c49f6aa72a372f4f084e2aa2821affea57a2 |
| 직접 시각 판정 | 개별168장 1x·전체배치6장·웹1920 동일크기·사용자 전후1x 직접 열람. UI 겹침 범위 PASS |
| 오프라인 회귀 구분 | 기존9/9, 추가요청4/4, 가림7/7, 회전/클립7/7, 그림자2/2, GPU대조2/2 =31/31; 소스 불변의 기존 영수증 |

빌드 래퍼 errorLogs2를 빌드 오류2로 오인하지 않는다. 원문에는 Licensing Access token unavailable 및 FallbackError라는 기본 셰이더 이름이 있으며 실제 Build errors0/compileErrors[]다. 문자열/소스 blanket 제외0·충돌 임계완화0, 원래1600 한국어0.900024414px 양성 충돌 회귀를 유지한다. 1920 음성 대조도 유지한다.

현재 설정 프레임은 NativeGame.OnGUI 메뉴 조기 return 때문에 뒤 HUD 자체를 그리지 않는다. 이번168장0을 숨겨진 HUD 마스킹 실증이라고 주장하지 않는다. 기존 원계측 HUD/설정의 실제 도형·칠 재생 대조0/칠제거30·남은 조각44는 candidate2의 별도 회귀 근거로 보존하며 실제 동시 그리기 영수증과 구분한다. 불투명도/clip 불명은 PASS 불가, 부분 가림은 남은 영역 보존이다.

최초 실제 가림 완전성 FAIL1회와 과거 r1/r2/RETOUCH·오프라인 실패 이력은 그대로 유지한다. 긴 BGM 내부식별자 접미부 클립, 긴 프랑스어 직업명 단어 중간 줄바꿈, 기존 영문 폴백/일부 한국어 설명은 남은 한계이며 전체 번역/아트/게임 AAA PASS로 확대하지 않는다. 자기 예약은 실제 작업 종료 뒤 공식 반환했으며 타인 예약/잠금 변경0·타인 종료0·기존 실행본/세이브 덮기0다.

근거: final-ui-20261030/candidate3/최종게이트_요약.json·공식영수증/목록.json·verify/overlap/직접검수/직접판정.json. 이 시점 MERGE_QUEUE READY 준비 완료이며 공통 비강제 반영·일반 Desktop 네속성/해시 전달 결과는 다음 영수증에 기록한다.

## 현재 UI 단위 제품 전달 완료 — 2026-10-31 01:10 KST

MERGE_QUEUE READY 뒤 expected공통202b32c85df19ce0b2a11db118e313298948a416을 보존하여 fd83657f3e494ff01d3b4c619a967afc10ea17eb를 정상 비강제 push하고 원격 동일SHA·검증 Unity tree b0e63e30e651d8904797bdb14a20300ac8eb2ffe 일치를 재조회했다. 빌드 이후 정상병합은 문서만 바뀌었으므로 새 Unity/Player 검사를 반복하거나 새 통합 빌드 영수증으로 표시하지 않았다. 검수한 같은 Runtime/Core 실행본을 전달했다.

일반 바탕화면 지옥의 길(Unity).lnk는 직전 R5 링크 SHA c5acbfd74c91e27d17b5a5ef331b5ff66e68b603d5ee66c884a0e6067d5bd404 및 이전 Runtime/Core를 다시 대조한 뒤 원본 byte를 I:에 백업하고 갱신했다. 별도 PowerShell readback에서도 네속성과 EXE/Runtime/Core SHA가 동일하다.

| 실제 전달 항목 | 값 |
|---|---|
| Target | I:\EXODUSER-Storage\demo-art\unity-ui\overlap\final-ui-20261030\candidate3\build\EXODUSER-Unity.exe |
| Arguments | -force-d3d11 --remodel3d |
| WorkingDirectory | I:\EXODUSER-Storage\demo-art\unity-ui\overlap\final-ui-20261030\candidate3\build |
| Icon | I:\EXODUSER-Storage\demo-art\unity-ui\overlap\final-ui-20261030\candidate3\build\EXODUSER-Unity.exe,0 |
| 링크 SHA256 | 42a45f0af653eecc4e6a37d29f5013ed0e4264b61d24cde021b42a1a505d5d97 |
| Runtime SHA256 | c783571aa39dc01b3c5ac82eae3b97b5ba7613d17a236f48d6e4b9fd65569218 |
| Core SHA256 | dfb9c3f0db87869b06c6b22e44e37b1443e8cafce802a6e3d148557dff7299b0 |
| EXE SHA256 | 9806abde4a406ed68647e9505852c49f6aa72a372f4f084e2aa2821affea57a2 |
| 독립 readback | desktop-observations/20261030T161001397/관측.json |
| 안전·보존 | 사용자 앱 자동기동0·기존 실행본 덮기0·세이브변경0·강제종료0·타인 예약/잠금 변경0, 자기 예약 공식반환 |

최종 근거는 candidate3/최종게이트_요약.json·공식영수증/목록.json·verify/overlap/직접검수/직접판정.json·공통반영_영수증.json·Desktop_전달.json이다. 같은 후보 정식빌드/실제168장·가림완전성/동일M1/1x/UI겹침PASS/일반Desktop 전달을 완료했다. PC 현재 소유 checkout과 GitHub 공통 소스는 확인했으며 Mac 실제 checkout 반영은 미확인이다. 전체 아트/번역/게임 품질 RETOUCH와 기존 실패 이력을 유지한다. 다른 담당은16:10UTC 정상 자기 실행 잠금을 사용 중이며 UI는 더 실행/예약하지 않는다.


## 2026-10-31 안전 영역 후속

현행 UI의 중앙 제목·모달·HP/MP/스킬 묶음은 논리1920×1080을 min(W/1920,H/1080)로 균등 fit하고 origin에 배치한다. 로비/캐릭터 정보판·미니맵·상태·안내·알림은 높이기준 H/1080 배율로 실제 화면 끝에 붙이며 가로폭으로 늘이지 않는다. 2560×1600의 중앙 origin은 y80, 3840×1080은 x960이다. 이 중앙 origin을 전체화면 검정 띠로 해석하지 않는다. 월드는 전체 physical viewport/고정세로FOV·수평확장이고, 배경·승인 확장 로딩은 각각의 비율/cover 계약을 따른다. 위 과거 전체폭/순검정 검수는 이력이다. 5개 해상도·파일명 W×H·글자 검사/실제 입력·검수 상태는 [현행 안전 영역 계약](UNITY_UI_ULTRAWIDE_20261031.md)을 따른다.

2026-10-31 확장 검수 입력은 coverage가 살아 있는 동안 UiOverlapOwnsInput으로 AutomatedInput을 유지한다. 정상 신규 입장 API 호출 순간과 자기 PID WM 클릭 .12/.2초 표본만 명시적으로 입력을 연다. 매 프레임 일반 Update가 플래그를 덮어 캡처에 사용자 키가 섞일 수 있던 경로를 분리했다. 실제 검수는 새 동일 Player·5해상도 클릭 영수증으로 판정하며 CPU 확인으로 실제 입력 PASS를 대신하지 않는다.


2026-10-31 R3: UI실제1225프레임은입력격리와함께simulationFrozenChecks=frames를필수로기록·검증한다. 작은검정stroke는후행본문과직접3.1physical유계로연결하고그림자끼리연쇄병합하지않는다. 명시광휘/외곽선은동일본문의스타일페인트로분리해decorationElements에보존하며이웃실제본문교차는계속검출한다. 기본광휘5.5s/.03·region9.2s/.064·death-black-outline4.2s/1.001프로필의source/순서/clip/치수/중간칠을대조한다. 추가12음성/양성회귀포함56PASS. 실제R3전화면/가림/PNG1x는별도필수이며R2의Guide/스킬FAIL을지우지않는다.

R3 전면자간글자의기존1px·±.5px/3px검정그림자는frontend-black-shadow/3.1×edgeScale/알파≤1.001명시프로필이다. 사망제목·펫대사동일source로명시stroke를연결한다. 일반미선언큰그림자허용범위는확대하지않았다.


## 2026-10-31 시네마틱 재생 버튼의 명시 바탕

|항목|현재 계약|
|---|---|
|실제 RED|R3 UI bd9ff69e1225장 전수분석은사망펫본문15교차와시네마틱일시정지15장의GUIStyle내부바탕미증명으로FAIL. 계측미증명을제외하거나알파1로추정하지않음|
|수정|NativeLobby의재생/재시도버튼은기존취소/종료에쓰던명시페인트공통함수LobbyActionButton을사용. NativeSilverHellUi.ActionPlate(edge28/outset6),호버Focus/pressed,글꼴공통/크기18/가운데배치,GUIStyle.none hit영역으로그림과클릭을분리. 회복Rect(28,26,240,48)·실제왼쪽위EdgeMatrix·TogglePlayback·오류재시도조건유지|
|보존|기존취소/종료의기능/외형은같고공통함수명만변경. NativeUiAudit의불명상태차단·불투명도/가림판정엄격조건·actualGPU대조군은완화하지않음|
|검수|새동일Player에서전5해상도/3언어시네마틱일시정지·실제영상·원시계측완전성·겹침0과1x를확인. R3의1225PNG/안전0/컴포넌트0/화면경계0을새DLL증거로소급하지않음|


## 2026-11-01 R5 전환로딩 팁 전수

R4의전환로딩팁행누락을수정한다. NativeLoadingTips 승인4종/실제키·KO/EN폴백, 물리11..16px·실제서체높이+4px·진행선아래8px는 UNITY_UI_ULTRAWIDE_20261031.md R5절을따른다. 전환로딩16종과실제누락폴백17샷을KO뿐아니라선택3언어모두수집하여총1395PNG/입력격리1395/틱정지1395가필수다. 추가팁255샷에서원시loading-tip component·실제Visible본문/서체높이·오버레이포함·진행선간격·누락/클립/겹침0을검사한다. 실제미디어120기록은변하지않는다. R4 1225장·웹400장의증명범위와새R5 DLL1395장을구분하며새Runtime SHA가있는실제Player와M1로검증한다.

- R5 실제 입력 키 검수: 각 5해상도×ko/de/fr에서 전환로딩06/07 캡처에만 인벤토리 V·수거 F2를 제품 KeyBindings API로 설정하고, 캡처 직후 원래 두 primary를 복원한다. secondary·사용자 설정 파일은 쓰지 않는다. coverage.tipKeyChanges 30행과 실제 audit 글자 V/F2·복원 여부를 함께 확인한다. API 상태 검수이며 OS 입력/자연 플레이 증거와 구분한다.


## 2026-11-01 인수·사용자 도타 보호 — 실화면 미완료

|항목|확인된 결과와 경계|
|---|---|
|R5 실제 빌드|source 0a60cbcee273e1150ba7df8909acb77dd9f18edc, Unity tree c692d38d808b02d31f84ef60b61229662a617f57, 빌드전 입력4088 exact. 공식 build 00078cc6/exit0/BuildReport errors0/remodel-scenes1, USER_SAVE0. CPU702·compile35는 기존 통과 근거이며 이번에 반복 실행하지 않음|
|실제 패키지|212파일·전체160DLL/Managed153·승인8영상·MCP파일/참조0은 기존 빌드 검증. Runtime a3f4267e537f6dd6d88e96248f4ac041d790c8ea64b63ce65050d886f7961505. 인수 시 EXE/Runtime/Core 3개 SHA 재대조 일치. 전체패키지 재해시·새실행은 하지 않음|
|M1 중단|후속 M1 연결 exit1. 실행 가드 done/Player로그/M1 결과가 없어 실제 Player 생성과 기능·안전 판정은 미확인. 런처 PID34712의 오래된 잠금 기록을 Player실행 증거로 간주하지 않음. 원인 미확정, 무검증 재시도0. 필드22/월드56/UI1395/새팁255·변경키30 캡처 미실행|
|소스 인수|4.91MB의 코드/셰이더/assembly 479개가 R5 빌드입력과 정확 일치. 새 컴파일·제품코드 변경0. 중앙/실제끝 계약이 남아 있던 소유6문서 정리는 docs-only 체크포인트로 보존|
|원본 WIP|520개 1,591,192bytes·미추적56개40,065bytes의 보관본 SHA 전부 일치. 현재 원본520 중517일치/URP_PC_High·parry-plaque meta·FirstPlayable 3경로는 빌드overlay여서 미복원. 미추적56은 현행도 byte일치. 전체 원복 완료로 주장하지 않음. 공용HEAD38edf98a/INDEX0 유지|
|도타 보호|dota2.exe 어느 PID든 생존하면 새 Unity/Player/빌드·인코딩·무거운 CPU/GPU/브라우저 검수 금지. 기존 I: 검수 진입부16개에 단발 fail-closed 프로세스 확인, 기존CLI/Queue byte불변. 인수 시 실제 도타 프로세스에서 차단 exit2 확인; 문법만 검사하고 본문 실행0. 새 대기자/예약/작업본/팀 생성0·프로세스 우선순위/affinity 변경0|
|재개 전제|실제 도타 부재와 기존 공식FIFO·메모리·무음·세이브 조건을 확인한 뒤 현재 빌드/3핵심SHA·새소스Unity tree 일치를 다시 대조. 기존 실패 원인을 먼저 확인하고 같은 패키지 M1부터 인수하며 성공 빌드를 자동 재빌드하지 않음. 그후 실제필드/월드/UI·같은크기/1x·MQ READY·기존단독통합자 공통/Desktop·정상 원본복원 필요|

R4는 필수 로딩팁 누락 FAIL을 유지한다. R5는 소스/빌드 준비와 부분이식4팁만 확인되었고 실제시각 PASS·공통/바탕화면 완료가 아니다. 새 main API목록을 이 Unity 후보 위로 자동 merge하지 않았고, 외부 생성·유료 API 사용0이다.


## 2026-11-01 R5 M1 시작 연결 읽기 진단 — 새 실행 없음

|구분|근거와 한계|
|---|---|
|확인|기존 Windows PowerShell 이벤트에서 PID34712의 실제 m1-expanded-r5.ps1 호출과 EngineAvailable 16:14:00.5425824Z를 회수했다. 마지막 기록된 파이프라인은 HiddenDesktop.psm1 Add-Type(16:14:01.2998662Z)이다. 새 sandbox75644772 생성16:14:01.300Z·기존잠금16:14:01.402Z·부모실패처리16:14:02.829Z까지 연결된다. sandbox의 M1ID 귀속은 동시각 유일성에 따른 추론이다|
|종료코드|관찰된 exit1은 바깥 Node package/M1 작업 결과다. 당시 자식 PowerShell의 exit/signal/close를 따로 기록하지 않아 원시자식종료코드1이나 강제종료를 확정하지 않는다. 실제 Player 생성·게임크래시·기능FAIL 모두 미확인|
|메모리/로그|입구표본 commitFree34.2GB/Unity0, 반환표본34.3GB/Unity0. 기록된입구표본이지 전구간 원인배제는 아니다. 후보ID의 Player로그/guarddone/M1결과/기존trap파일은 없다. Application1000/1001/1026은16:13:50~16:14:10Z 창에서0건, EngineStopped403도해당창에없으나 종료원인의확증으로쓰지않음|
|한도가설|확인가능한사용한도오류16:09:25/26Z보다276.829초뒤 후속실패다. 그사이빌드완료와뒤의Node실패처리·예약반환이실행됐다. 사용한도오류가직접원인이라는가설은확인되지않았고 지연정리·외부종료까지완전배제하지않음|
|범위축소|진입스크립트전체미실행/패키지검사에서중단한것은아니다. 잠금쓰기 이후 슬롯확인·SaveSnapshot·숨은데스크톱/프로세스생성·guard후처리 중 정확지점은 원문오류부재로미확정. 빈sandbox는이전성공M1도같아Player미실행의증명이아님|
|최소보완|I: 소유 package-and-m1-r5-tip.cjs와 m1-expanded-r5.ps1만 보완. 다음실행에서실제argv/cwd/스크립트SHA·자식PID/exit/signal/close/error·원문stdout/stderr·PS script-enter/before-cli/after-cli/terminating-error 위치/stack를별도파일로남긴다. 기존상위로그tee와도타차단을보존. 현재는문법만확인하고본문실행0|
|다음M1만|기존package-and-m1-r5-tip.cjs --m1-only 선택경로를준비했다. 기존패키지검사반복없이저장된근거/Unity tree/실행전3핵심SHA를대조한뒤M1만시작하는미실행경로다. 전체212파일재해시나새패키지검사PASS주장0. 도타부재·기존공식FIFO/메모리/무음/세이브조건확인전사용금지|
|보존|frozenCli68b7/Queue8a00·제품Core/Runtime소스·공용INDEX0/WORK635·원본3overlay불변. 새Unity/Player/빌드/브라우저/인코딩/대형검수·예약·대기자·재시도0. 진단보완은게임실행이나전체완료가아니다|

원문근거와가설구분은 I:/EXODUSER-Storage/demo-art/unity-ui/ultrawide/R5_M1_읽기진단.json 및 recovery-20261101/m1-readonly/PowerShell_PID34712_기존이벤트.json을 따른다. 기존 R4 로딩팁누락FAIL·R5실화면/공통/Desktop미완료는유지한다.


## 2026-11-03 P0 전환 통합 뒤 실제 마우스 검사

실제 PostMessage 누름/해제와 잠긴직업 차단·이름입력 열림 검사는 유지한다. 해제 후0.2초만 기다리고 즉시 characterStep을 검사하던 fixture는 새500ms 검정→실제 준비→600ms 복귀보다 먼저 판정하여8db8dd46에서12프레임 뒤 FAIL했다. 이제 해제 이벤트가 처리되는 실제 OnGUI 프레임 끝을 통과한 다음 NativeScreenTransition.Busy가 종료될 때까지 최대15초(제품 준비12초+양쪽fade와프레임여유)를 기다리고, 제품 전환failed/timeout은 여전히 FAIL한다. 좌표·입력·제품500/600ms·12초제한·잠금검사·분석기 임계 변경0. 새패키지 전체검수 전 미검증이다.

같은 fixture의 신규입장 즉시 Loading assert도 실제제품계약으로교정했다. BeginCharacterEntry(false)는검정경계를요청하고onBlack에서loadingAlreadyShown=true로Nemesis를연다. 이요청중에는검수의AutomatedInput 우회를해제한채실제callback을기다린다. callback실행뒤입력격리를복원하고Preparing의실제완전검정Repaint를로딩프레임으로즉시캡처한다(기존.18초정지대기없이). 이후fade완료와Nemesis를모두검사한다. 옛1.2초로고페이지를다시삽입하지않고, 전체페이지수/언어·해상도·클립/글자분석·입력격리assert는유지한다. 제품전환코드변경0.


### P0 그룹 좌표 교정 R3 — 제품 그리기와 계측 분리

R2의물리픽셀그룹+기존배율은실제그리기의그룹원점을중복확대하여정보/제작내용을판밖으로밀었다. 실제PNG를보고VISUAL FAIL로철회했으며부분분석0건은인도근거가아니다. 제품GUI.BeginGroup과GUI.matrix는기존배치로복원한다. 활성Repaint계측때만BeginGroup직전의부모보정포함화면원점과직후GUIUtility의원점차이를groupCorrection으로기록한다. ScreenRect의4꼭짓점·quad·실제clip에같은차이를적용하고중첩그룹끝/프레임시작에스택을복원한다. 픽셀을움직이지않고계측좌표를실제배치에맞추며, 문자열/소스제외·겹침임계완화0. 새Player의실제글자경계/원래판안배치·전체겹침재검수전미검증이다.


### 2026-11-03 P0 로딩 관측 분리 — 1410장 검수 후보

| 항목 | 현행 검수기 계약 | 검증 상태 |
|---|---|---|
| 신규입장검정 | 실제 BeginCharacterEntry의 onBlack 뒤 Preparing Repaint를 별도 페이지로 보존. 문구1000ms 이전 검정도 정상 | R3 실제 검정 표본의 visibleText0/겹침0/경고0. 실제 상태 assert 유지 |
| 필수 로딩 페이지 | 이미 검수하던 실제 Simulation.Stage.LoadPhase2의 승인 첫 이미지1을 로딩으로 추가 수집. 별도 전환로딩01도 보존 | 같은 R3 실제 전환로딩01 표본은 원래 관측 조건 true/겹침0/경고0. 새 후보 Player는 대기 |
| 장수 | 공통77상태×5해상도×ko/de/fr=1155 + 전환17상태×5×3=255, 합1410. 종전1395는 R5/R3 이력 | 입력격리/틱정지1410 필수. 팁255/키변경30/실제미디어120 유지 |
| 실패 보존 | 글자 없는 검정 표본만 로딩으로 쓰면 원래 requiredPages의 가시문자 조건에 미관측 | 분석기·필수페이지·임계·제외·제품전환시간 변경0. 새 정식/M1/1410 전수 통과 전 미검증 |


### 2026-11-03 P0 잔여18건 — 로드맵 칸 폭 교정 후보

| 항목 | 실제 결과 / 수정 계약 | 상태 |
|---|---|---|
| R3 전체 | 1395PNG·입력격리/틱정지각1395, 겹침18/로딩관측누락15. Player65df27ef 정상exit0/창0/잔여0/USER_SAVE0 | 전체 FAIL 보존. 147→18이며0건아님 |
| 18건 원인 | 슬롯04·09,1920×1080/1600×900/2560×1600×ko/de/fr. 안내의 마지막 ]와합성로드맵첫합실제겹침 | 실제1920원본에서확인. 분석기문자/소스제외없음 |
| 웹 실제 칸 | 1920에서제단끝1587,격자간격12,로드맵바깥1599/270. 제목시작1622/폭224/오른끝1846 | 웹3333실제E모체로드맵DOM와PNG수집. 기존Native1562/284/끝1846가왼쪽60침범 |
| 최소 수정 | DrawRoad의영역/제목/구분선/본문만x1622·폭224. 오른쪽끝1846·기존y/서체·제단안내·나머지배치유지 | 새정식/M1/1410장·실제1x전미검증 |
| 실행 구분 | R4정식38489478/errors0. M1은23단계·32PNG결과후종료지연,새완료PASS로세지않음 | 정상종료/정리결과별도확인. R3/R4/R5증거혼용금지 |


## 2026-11-03 CTO 스크롤 원점 누락 교정 / Mac 게이트

BeginGroup 보정만으로 BeginScrollView 안의 글자 위치를 보장할 수 없었다. 두 스크롤 오버로드에서 호출 전 expected를 부모의 groupCorrection까지 포함해 구하고, 실제 GUI.BeginScrollView 반환 clamped scroll와 view.position으로 p0=-Round(-scroll-view.position)을 구한다. Repaint 계측일 때 이전 보정을 push하고 expected−(GUIToScreenPoint(p0)−origin)을 적용하며 EndScrollView에서 pop한다. GUI 그리기·matrix·반환 scroll·겹침 분석기의 임계·문자/소스 제외는 바꾸지 않는다.

실제 잉크 대조는 Tools/ui-overlap/scroll-ink.py 및 fixtures/scroll-ink/manifest.json에 있다. 실제 R3 ko 튜토리얼0/보관함의 2560×1600·1600×900 무보간 crop4개(원본 PNG/JSON SHA 포함)를 직접 보고 선택했다. 알려진 잉크 상자 양성4/4와 기존 실제 감사 Rect 음성4/4를 구분하며, R3 전체 PNG/JSON에 --candidate를 실행하면 네 건 모두 FAIL을 반환한다. 글자 선택 source·text와 물리 ROI는 manifest에 명시한다. 이 대조군은 제품 새 캡처를 만들거나 좌표를 수정한 증거가 아니다.

Mac은 새 HEAD 정식 패키지의 실제 캡처 폴더에 --candidate를 실행하여 네 실제 글자가 계측 Rect 안에 포함되는지 확인해야 한다. 누락·빈 잉크·거대한 대체 상자·해상도 불일치는 실패한다. 새 양성 결과는 Mac 대기다. --self-test만으로 제품 PASS를 선언하지 않는다. PC는 Core/Runtime compile0/0 및 오프라인 대조군만 실행했고, 최신 CTO 요청 후 정식 빌드·M1·Player·1410분석은 실행하지 않았다. Mac 정식1회→동일 패키지 M1 23/23 정상종료→1410장 issue0/로딩누락0/중단0·5해상도 실제잠김/이름열기true·웹3333 슬롯04/09/제작1x를 모두 통과해야 공통 병합을 진행한다. 이전 계측의 부분0건·R5 실행 정상 종료를 새 교정 검증으로 승격하지 않는다.


## 2026-11-03 13:20 CTO Mac FAIL 후속

근거는 qa/mac-captures-20261103@a049ef5c40e5bb442027b9ef3cc37abd56dc1367의 qa/unity-parity/5b6b4fce9/이다. REPORT와 실제 settings_footer_x3·stash_ink_x3·tutorial_ink_x3를 직접 열었다. Mac 정식 오류0/M1 23/23 정상종료/로딩270관측은 PASS지만 겹침18·가림증명누락30·scroll-ink1/4로 전체 FAIL이다. 기존 결과를 새 SHA의 PASS로 세지 않는다.

| 항목 | 변경 | 확인 경계 |
|---|---|---|
| GUIStyle 바탕 | GUI.Label의 hover/normal 선택은 플랫폼 공통 Unity DoLabel 계약으로 계측. Windows 전용 제한 제거. 나머지 상태 불명 표면은 TextField와 공통으로8상태·노출 HiDPI·모든 밉 GPU 알파의 공통 하한을 기록 | null 바탕은 하한0, disabled는 하한0. 실제 알파를 모르면 unknown 유지. 불투명하다고 추정하거나 분석기 제외/임계 변경하지 않음. 누락30→0은 Mac 대기 |
| 글자 원점 | 수동 padding/center 계산 대신 GUIStyle.Internal_GetTextRectOffset에 실제 CalcSize/CalcHeight를 전달해 네이티브 정렬·반올림 원점을 기록. metricProof 추가. API 부재는 fail-closed | BeginGroup/BeginScrollView 원점 스택 및 p0 계약 유지. 제품 그리기·matrix/scroll 반환값 변경0. 보관함 상단 ink 포함은 새 Mac 캡처로 판정 |
| 설정 하단 | 웹 autosave Rect(96,1004,500,20)는 유지. 추가 native/QA 안내는 y1022에서 시작해 감사와 같은 TextLayoutBounds로 경계를 계산한다. 현재 GUI.matrix의 세로 배율 기준 한 화면 픽셀 간격을 확보하도록 올림하고 최대4회 보정. 안내 폭1200·높이18·서체11 유지 | 2560ko/fr의0.620px 교차 재검수. 전역 겹침 허용오차 변경0 |
| QA 번역 | NativePauseMenu.QaLabels.cs의 native QA 전용 표: ko/en/de/fr. qa settings-not-saved 문장을 Normalize(locale)로 조회, 다른 언어는 영어 fallback | fr: Les paramètres ne sont pas enregistrés pendant ce test QA. de: Einstellungen werden während dieses QA-Tests nicht gespeichert. 웹 정본43 exact ID 및29언어 원본 카탈로그 변경0 |
| 잉크 선택 | 절대 gray60/G35 대신 ROI 안의 gray 밝기/green 우세도 분포를 Otsu로 분리. dynamic range12 미만·빈 ROI·전체70% 초과 선택은 실패. 최소 픽셀 조건과 실제 감사 상자 포함 판정은 유지 | 밝은 회색 배경·G35 미만 녹색·빈/단색 판 음성·실제4개 crop 및 잘못된 상자 padding 음성 회귀5/5. 구 R3 좌표 음성은 계속 실패. Mac 원본4쌍 PNG/JSON 추가 요청 중. 표시선이 있는 x3 진단 이미지를 제품 양성으로 쓰지 않음 |
| 이름 검사 | --unity-ui-overlap-check --unity-name-gate-only로 같은 Player에서5해상도 ko의 잠긴 직업/이름 열기만 검사, 정상 종료. Windows 기본은 자기 숨은 HWND WM 클릭. Mac은 sandbox 전용 NativeLobby.OnGUI 입력 Event down/up 큐, Windows에서도 --unity-gui-clicks로 선택 가능 | 실제 제품 Draw/hit-test/전환을 통과하며 결과를 API로 설정하지 않음. queue는 명시 QA sandbox/overlap run에서만 허용. 입력 차단·전환대기15s·전달2s·이번 클릭 이후 전환 id 범위 실패 확인. Mac 공통 입력 경로는 런타임 미검증 |

PC는 Core/Runtime 컴파일 오류0, UNITY_STANDALONE_OSX 조건부 소스 컴파일0(PC 컴파일러이며 Mac 런타임 증거 아님)까지 확인했다. 이름 열기만 PC Player1회로 확인할 계획이며, 정식 빌드·M1·1410장 실행/분석은 하지 않는다. 이름 전용은 기존 자기 R5 격리 패키지에 이번 컴파일 DLL만 임시 결합한 별도 fixture이며 정식 패키지 PASS로 승격하지 않는다. 원본 DLL은 정확 SHA 백업/검증 후 사용하고 실행 종료 finally에서 원래 바이트로 복원한다. 최종 결과와 push SHA는 I: REPORT 맨 위에 기록한다.


잉크 검사의 새 후보 샘플은 계측 Rect 바깥2px까지 읽어 글자 상단이 상자를 넘는지 검출한다. 포함 판정에는 padding을 주지 않는다. 독립 R3 위치 중심에서24px 이상 벗어나면 다른 글자를 잡지 않고 실패하며, 기존 Rect 크기 제한·최소 실제 잉크 수·단색/과선택 실패도 유지한다. 고정 작은 PC ROI가 Mac의 작은 글자 정렬 차이로 비는 문제와 상자 밖 획을 잘라 버리는 문제를 분리한다. 네 원본 위치/기존 좌표는 manifest에 보존하고 구 절대 threshold는 legacy 기록으로 이름을 명확히 했다. 2px 바깥의 실제 잉크가 잘못된 상자를 통과시키지 않는 음성 검사도 추가했다. 새 Mac 전체 원본의 판정 결과는 별도다.


### PC 이름 열기 전용 1회 결과 — 기능 PASS / 공용 가드 FAIL 분리

| 해상도 | lockedBlocked | nameOpened | 입력 |
|---|---|---|---|
| 2560×1600 | true | true | 자기 숨은 HWND WM 마우스 |
| 1920×1080 | true | true | 자기 숨은 HWND WM 마우스 |
| 2560×1080 | true | true | 자기 숨은 HWND WM 마우스 |
| 3840×1080 | true | true | 자기 숨은 HWND WM 마우스 |
| 1600×900 | true | true | 자기 숨은 HWND WM 마우스 |

공용 bin Player 7603230d 한 프로세스, 30.964초, native exit0·timedOut=false·expectedKill=false. 이름 관련10PNG·inputIsolation/simulationFrozen각10, 1600×900 이름 창 원본을 직접 열어 확인했다. Runtime9d1244ea89439c66ef37f054b0c24aa1f1024858ab6431cf04568039e3a41683은 이번 컴파일 입력과 일치한다. 이는 기존 R5 QA 패키지에 새 Core/Runtime DLL만 임시 적용한 이름 전용 fixture이며 정식 패키지 검수/M1/전체UI PASS가 아니다. 공용 순번·숨은 데스크톱·무음 사용, 사용자 데스크톱 창0·잔여0·숨은 데스크톱 닫힘true. 새 정식 빌드·M1·1410실행/분석0, 두 DLL은 finally에서 원래 SHA로 복원/대조했다.

공용 가드는 USER_SAVE changed=1로 전체 ok=false/runner exit5다. 관측 파일은 C:/Users/심도진/AppData/LocalLow/ForDearGamers/EXODUSER · Unity 이식 검증판/Player.log 하나(4440→979B)이며 원인은 미확정이다. 검사 전부터 사용자 unity-latest Player47956이 실행 중이었다는 별도 관측만 남긴다. 사용자의 로그를 덮어쓰거나 가드 제외/허용오차를 바꾸지 않았다. USER_SAVE0·전체 실행 PASS로 올리지 않고 추가 Player도 실행하지 않는다. 이름 기능 판정과 가드 판정은 별도다.

증거는 I:/EXODUSER-Storage/codex-takeover/unity-parity-1102/mac-gate-1320/의 name-only/실제_마우스_역변환.json·coverage.json·10PNG, name-player-launch.log·name-dll-manifest.json·name-dll-restored.json 및 공용 _exec/done/7603230d.json이다. 밝은배경/어두운녹색/단색판/잘못된 상자/실제4crop의 오프라인 회귀5/5도 통과했다. 기존 Mac x3 진단그림의 글자는 새 분류기로4영역 모두 관측되며 배경 전체선택을 하지 않았다(mac-diagnostic-ink.json). 표시선 있는 x3 그림은 새 좌표 양성이나 새 제품 PASS 근거가 아니다.

최신 공통25356462dede7e0045de71bf5df7a2f87dc58010을 정상 병합(5062b5701)했다. check.ps1 충돌은 같은 공용 bin 경로의 슬래시 표기만 통일했으며 타 레인 코드와 외부 guard WIP를 보존했다. 다음은 Mac 새 HEAD 정식/M1/1410·issue18→0/가림누락30→0/새 scroll-ink4/4·웹1x 확인이다. Mac 새 Event 경로도 실제5해상도 판정이 필요하다.


## 2026-11-03 15:39 중단 복구 — 푸터·감사 정렬식 일치

origin/unity/main 044c82d760을 자기 브랜치에 정상 병합했다. 13:20 대응의 GUIStyle 알파 증명·스크롤 원점·네이티브 텍스트 정렬·Otsu 잉크 분리·fr QA 문구는 72c395db5에 보존되어 있었다. 남은 푸터 수동 savedH/noticeH 계산은 감사의 네이티브 정렬과 달라 반올림 차이를 보장할 수 없어 제거했다.

TextLayoutBounds가 CalcSize/CalcHeight + GUIStyle.Internal_GetTextRectOffset + 실제 clipping을 한 번 정의하며, 감사 Text와 추가 안내 위치 계산 양쪽이 이를 사용한다. 웹 autosave Rect(96,1004,500,20)는 그대로다. 추가 안내만 y1022에서 시작해 네이티브 saved bottom 뒤 한 화면 픽셀(1/abs(GUI.matrix.m11))을 확보하도록 물리 픽셀 단위로 올림한다(최대4회). 겹침 판정 임계·글자 제외·감사 상자 padding 변경0. 프랑스어 QA 문장은 기존 언어표를 유지한다.

PC는 현재 Core121/Runtime241 소스의 컴파일 오류0만 새로 확인했다. Player·정식 빌드·M1·전체 UI·scroll-ink 재실행0. 직전 Player7603230d의 이름 기능5/5와 Player.log 한 건의 가드 FAIL은 과거 결과 그대로이며 새 실행 PASS로 재사용하지 않는다. 새 후보의 issue18→0·가림누락30→0·실제 ink4/4는 Mac 재검수 대기다.


## 2026-11-03 19:00 Mac FAIL — G0·수정 경계

| G0 항목 | 확인·적용 |
|---|---|
| 목표·실제 연 증거 | qa/mac-captures-20261103@642a2affe: qa/unity-parity/3668262/REPORT.md, 2560x1600_menu_full.png, 2560x1600_character4_full.png와 두 3x 크롭. 12/1410 중단·메뉴48+직업선택10. 개별 좌표 JSON은 이 Git 증거에 없음 |
| 레퍼런스 공통 관례 | [Diablo IV 공식 UI 개선](https://news.blizzard.com/en-us/article/23938289/diablo-iv-open-beta-retrospective-transforming-feedback-into-change)의 입력/메뉴 동작 정합, [Last Epoch 공식 UI 변경](https://forum.lastepoch.com/t/last-epoch-shattered-omens-patch-notes/80571/)의 읽기 쉬운 일관된 서체·키/패드 메뉴 탐색·클릭 가능한 스크롤바를 확인. 두 게임에서 도출한 적용 체크리스트: 문구 가독성/입력 수단별 동일한 의미 동작=있음, 표시 위치와 실제 클릭 위치 일치=이번 QA 경로 수정, 모달 뒤 입력 차단/초점 복귀=있음. 새 UI 스킨/자산 제작은 이번 결함 범위에서 뺌 |
| 가장 큰 차이·선택 제작법 | 실제 화면 자체는 읽히지만 QA 클릭 실패가 나머지1398장을 차단. UI의 실제 Rect·기존 IMGUI 버튼/콜백을 재사용하고 Event.QueueEvent로 네이티브 이벤트 루프에 전달. 제품 상태를 직접 설정한 것을 hit-test 성공으로 세지 않음 |
| 그림자 조사 | 자간 조판의 외곽 검정 그림자 두 패스는 y+3·x±0.5 디자인px. 네이티브 정렬의 픽셀 반올림으로 16:10에서 (±1,5)물리px가 되면 기존3.1×1600/1080=4.593px 소유 반경을 초과(거리5.099). 메뉴/footer와 직업선택 공통 DrawSpaced 경로의 과도한 외곽 패스를 줄이며 판정 반경은 늘리지 않음. 실제58건 각각이 이 원인인지 새 Mac 원계측으로 확인 필요 |
| 첫 실물·합격 조건 | PC 컴파일 후 새 SHA로 Mac 정식 빌드1회→동일 패키지 M1 23/23·정상 종료→1410장 issue0/가림 누락0/로딩270장 누락0/scroll-ink4/4. 이름 입력은5해상도 실제 이벤트 전달·lockedBlocked/nameOpened 모두true만 PASS |
| 중단·미검증 | PC Player/빌드/M1/캡처 실행0. Mac 입력 API 미지원·전달 실패는 해당 입력만 UNVERIFIED로 보존하고 화면 API 준비와 구분해 나머지 수집 계속. 전달된 실제 버튼 동작 불일치는 FAIL 유지. 새 Mac 실제 화면 전 VISUAL VERDICT RETOUCH |

| 이번 구현 | 현행 계약 |
|---|---|
| 실제 포인터 | NativeLobby의 실제 생성 버튼 Rect를 Repaint에서 GUIToScreenPoint→identity ScreenToGUIPoint로 관측. 창 원점·DPI·중앙/오른쪽 GUI.matrix를 Unity에 맡김. 기존1790/1018 재계산 제거. PC/Mac 기본은 Event.QueueEvent 네이티브 루프이며 --unity-win-mouse-clicks만 Windows HWND 진단 경로 |
| 이벤트 수신 | Layout 교체/복원0. down/up별 고유 commandName이 실제 OnGUI에 도착했을 때만 serial 완료. 프레임·좌표·rawType·hotControl 전후·Used를 실제_마우스_역변환.json events에 기록. 전달 제한2s·이후 자기 전환 id 실패/취소 확인·전환 제한15s 보존 |
| 판정·계속 | checks의 status=PASS/FAIL/UNVERIFIED, lockedBlocked/nameOpened 원값 보존. 전송 API 없음/수신 시간초과는 UNVERIFIED, 전달 후 상태 불일치는 FAIL. 입력 실패만으로 전체 수집을 throw하지 않음. 필요할 때만 수집 화면을 제품 API로 준비하고 capturePreparedByApi=true; 이 준비는 입력 PASS에 포함하지 않음 |
| 검정 그림자 | DrawSpaced의 세 패스 (0,+1)/alpha.9, (+.5,+2)·(-.5,+2)/alpha.3. 종전 외곽 y+3에서+2로 축소. 실제본문/번역/자간/글자 크기·기하 교차 .5px·frontend-black-shadow 허용반경3.1×화면높이/1080·분석기 제외 정책 불변 |
| 증거 한계 | 메뉴48+직업선택10은 직전 Mac 실패값. 제품/검수 코드 변경 후 새 숫자는 PC에서 측정하지 않음. 58→0·nameOpened·1410장·scroll-ink 통과 주장은 Mac 새 실행 전 하지 않음 |

PC 확인: 최초 공통 cbdcbc282(병합7dc05359c) 이후 추가9dc27dea5도 정상 병합(d746ea4b6). 실제 Core121·Runtime243 소스(새 스토리/조상 캡처 포함)를 설치된 Unity6000.6.7f1 Roslyn으로 한 묶음 컴파일, 두 exit0/C# 오류0. Runtime 경고521건(CS0219/CS0162/CS0618/CS0649/CS0169/CS0414/UAC1001/UAC0007)은 오류0과 별도이며 경고0이라고 보고하지 않는다. 실제 Unity Editor/정식 빌드/Player 실행은0. 고정 출력 mac-gate-1320/compile-current의 로그·rsp만 보존하고 확인된 DLL4개는 정리한다. 새 Mac 실행은 아직 없음.


## 2026-11-03 20:20 Mac FAIL — G0/G1 원인 확정

| 항목 | 증거·설계 |
|---|---|
| 목표·현재 차이 | qa/mac-captures-20261103@39c3ae380, qa/unity-parity/1e81002/의 REPORT와 설정·보관함 PNG를1x로 직접 확인.1410장/로딩270장 완주·메뉴48→0은 직전 SHA 성과. 남은 이름 입력5/5 UNVERIFIED·9103건·scroll-ink2/4를 고침 |
| G0 공통 관례 | 이전19:00절의 공식 Diablo IV/Last Epoch 입력/표시 정합·가독성 체크리스트 재사용. 있음: 실버 헬 서체·입력 차단·실제버튼. 이번에 넣음: 제품 OnGUI 버튼 경계에서 직접 down/up 전달·실제 TextCore 정렬 계측. 뺌: 새 스킨·제품 배치 개편(이번 결함은 도구/조판 정합) |
| 병합 출처 | 5b6b4fce9↔실패1e810024dd의 NativeLobby.SilverHell.cs/NativeKeyBindList.cs/NativeInventoryDock.cs는 각각diff0. febeb55b2(쓰레기 분해·일시정지 실버 헬)는1e810024dd의 조상이 아님. 따라서9103건을 해당 새 병합 탓으로 돌리지 않음. 네이티브 정렬 감사로 바꾼871a5c25e/366826269 경로부터 바로잡음 |
| 계측 원인 | [Unity6000.6 GUIStyle.GetCursorPixelPosition](https://github.com/Unity-Technologies/UnityCsReference/blob/6000.6.7f1/Modules/IMGUI/GUIStyle.cs)은 TextCore의 정렬된 cursor 좌표에 Internal_GetTextRectOffset을 더함. 기존 감사는 후자만 사용하여 가운데/오른쪽/세로 정렬을 빠뜨리고, 줄바꿈 높이에 줄바꿈 전 전체 폭을 합침. 실제 보관함 PNG의 전기 전투화 잉크는 기존623px ROI에 있으므로 ROI를 옮기지 않음 |
| G1 계측 | 실제 GUIStyle cursor와 같은 IMGUITextHandle의 line/character 데이터를 사용. 각 행 origin/xAdvance/ascender/descender를 GUI 좌표로 변환하고 실제 클립 적용. 스타일 정렬을 독자적으로 추정하지 않음. 구체 실제 새 좌표와0건은 Mac에서 판정 |
| G1 입력 | 네이티브 Event.QueueEvent가 수신0인 방식 폐기. 실제 NativeLobby.OnGUI의 제품 GUI.Button 호출 직전에만 mouse event와 실제 inverse GUI 좌표를 주입. down/up은 서로 다른 실제 OnGUI 프레임, hotControl/Used/클릭 결과와 반복 Layout/Repaint를 기록. hotControl 강제 설정·제품 API로 입력 성공 만들기 금지 |
| 합격·첫 실물 | PC 컴파일 후 Mac 같은 새 정식 패키지 M1 23/23,1410장 issue0/관측 누락0/로딩270,scroll-ink4/4,이름5해상도 실제입력 PASS. 이전 실패는 재실행해 지우지 않고 새 SHA로 한 회차 확인 |
| 중단 | Mac 실제 판정 전 미검증. 입력 도구 실패만UNVERIFIED로 보존·전체수집 계속, 실제 제품 실패는FAIL. PC Unity Editor/Player/정식빌드0. 모든 docs의 정본은unity/main |

| 이번 수정 | 현행 수치·판정 |
|---|---|
| TextLayoutBounds | GUIStyle.GetCursorPixelPosition의 실제 native 원점 + 동일 IMGUITextHandle의 정렬된 행 origin/xAdvance/ascender/descender. fixedWidth/fixedHeight·padding·pixelsPerPoint·wordWrap·실제clip 반영. 줄바꿈 전 폭과 줄바꿈 후 높이를 섞지 않음. reader/필수행 없음·Advanced Text 미지원은 오류로 닫으며 가짜0건으로 진행하지 않음 |
| 원계측 추가 | textLayoutRect(배정상자의 실제 화면좌표),textAlignment,textFont,textFontSize,textWordWrap,textPixelsPerPoint를 text 원소에 함께 보존. analyzer의.5px 교차·가림·그림자 반경은 불변 |
| 키 목록 | ls=0이고 해당문자에 아틀라스 토큰이 없으면 문자열 전체를 기존 font/px·32px 높이 중앙으로 한 번 조판. Width와Run은 같은 GUIStyle.CalcSize 전체 폭. 개별 glyph의 round/커닝 차이를 문자열 충돌로 세지 않음. 자간/아틀라스·키판 Rect·입력/저장/글꼴/크기 불변 |
| 실제 버튼 | NativeUiAudit.Button이 실제 GUI.Button 직전에만 sandbox/overlap run의 대기 이벤트를 주입. 실제NativeLobby.OnGUI Layout에서만·한 프레임1회·현재 생성 버튼 Rect/matrix 일치 때 적용. root→screen→현재GUI 역변환 뒤주입,호출 뒤 원래event복구. down/up은 다른 실제 프레임,hotControl은 읽기만 함 |
| 입력 증명 | events: serial/frame/type/loopPhase/root·local좌표/실제button/inside/enabled/Used/clicked/hotControl전후. onGuiSamples: 대기중 최근64회 실제 Layout/Repaint·hotControl·입력차단 상태. lockedBlocked는 실제 내부hit의 disabled down/up2개와단계1 유지 필요. nameOpened 단계2+실제 mouse-up GUI.Button clicked가 함께 있어야PASS |
| scroll-ink | ROI623/388과분류·밀도·24px위치제한·2px표본halo·실제rect무패딩 포함조건 불변. 새 GUIStyle.GetCursorPixelPosition/IMGUITextHandle metricProof도 productionPassed 필수조건으로 추가(종전표시만하던조건을필수로강화). ROI를잘못된583/364에옮기지않음 |
| 설치 API 확인 | .NET Framework ReflectionOnly 형식 로드는 netstandard 참조 문제로2회실패,반복중단. PE metadata reader로 바꿔 설치Unity6000.6.7f1의8타입/필수메서드·행필드·GUIContent·GUIUtility속성 존재 확인. Unity어셈블리/네이티브실행0이며 Mac 런타임 PASS 아님 |

Mac 다음 증거는 overlap-summary.json, 실제_마우스_역변환.json와 남은 각유형/상위출처의 a/b rect·textLayoutRect·metricProof·font·alignment 표본5개를짧은 JSON으로남긴다. 원본전체1.4GB보고서를복제하거나,PNG만남겨다음원인추적을막지않는다. 새1410장/9103→0/입력5/5/잉크4/4는PC에서판정하지않는다.

PC 컴파일 결과: 추가 공통b04ddd73b를fe236a8bc로 정상 병합한 뒤 Core121개 소스 exit0. 최초 Runtime은 내부 GUIUtility.pixelsPerPoint를 직접 접근한2개 CS0117로 실패했다. 설치 DLL의 해당 내부 속성을 캐시한 PropertyInfo로 읽도록 고치고, 불변 Core를 반복하지 않고 Runtime249개만 다시 컴파일해 exit0·오류0을 확인했다. Runtime 경고531건은 남아 있으며 경고0이라고 보고하지 않는다. 설치 DLL8타입의 필수 API 존재를 PE 메타데이터로 확인했다. 이는 Mac 런타임·UI 통과 증거가 아니다.


## 2026-11-03 21:50 BuildLoop 다중 패스 게이트 — G0/G1

| 항목 | 설계·근거 |
|---|---|
| 목표/실제 표본 | BuildLoop cb77ca96f의 기존1410장 원계측을 읽기만 함. 실제 메뉴 O는 본문1+그림자3, 봉안함1656은 본문1+광휘16. 기존 분석에서 각각 자기끼리3/10건 재현. 새 Player 생성0 |
| 공통 관례 | 이전 G0의 공식 Diablo IV/Last Epoch UI 가독성·한 의미 라벨 관례 유지. 있음: 은빛 서체·스타일 패스. 이번에 넣음: 같은 원점의 논리 글자 식별자. 뺌: 새 배치·스킨·제품 표현 변경 |
| 새 원계측 | 각 실제 다중 패스 발행 함수가 원래 글자 상자/문자열의 GroupText scope를 명시. 같은 frame의 고유 paintGroupId·paintGroupText·원점·발행 source를 모든 패스에 기록. 동일 source/문자열/정확한 원점/깊이의 반복 호출은 같은 ID. 같은 ID라도 본문 두 개는 병합하지 않음 |
| 묶기 조건 | 같은 ID/문자열/원점/발행 source, 본문 정확히1개, 나머지 증명된 shadow/paint 패스만 연결. 본문 두 개·다른 글자·다른 원점은 경고와 원래 충돌을 유지. 다른 본문/조작부/화면 이탈 검사는 계속 적용 |
| 이전 JSON | 새 식별자가 없는 기존 표본은 선언된 profile의 실제 offset 목록과 픽셀 반올림의 floor/ceil 차이로만 원점을 복원. 임의 반경 확대·전이적 그림자 사슬·문자열/source 전체 제외0. 전체 원계측과 장식 패스를 보존 |
| 합격/중단 | 실제 실패 표본과 중복 본문/다른 글자/잘못된 원점/클립 회귀 통과, 기존 회귀 유지, PC C# 컴파일 뒤 push. 기존1410장 재분석은 과거 입력의 분석기 증거이며 새 패키지/바탕화면 갱신 PASS가 아님. Mac에서 새 패키지 판정 |

구현/PC 증거: 실제 글자 발행 함수(전면 메뉴·CP광휘·인벤 그림자·키 라벨·사망2종·지역 배너)에 GroupText를 연결했다. 지역 색상 blur도 장식으로 명시하며 렌더링 색/좌표/패스 수는 바꾸지 않았다. 본문의 실제 textLayoutRect가 있으면 선언 원점과 정확히 일치해야 한다. 잘못된 실제 원점 RED를 확인한 뒤 전체 회귀66/66 PASS. Core121/Runtime255 PC C# 컴파일 오류0(현재 공통 추가분 재병합 전), Runtime 경고520.

기존 cb77ca96f 1410장 JSON 읽기 전용 재분석: 논리 그룹75936, 잔여8363(글자-글자7784/글자-버튼152/화면이탈250/글자-판177), 같은 내용 쌍819. 실제 메뉴/봉안함 표본 자기 충돌0. 잔여 상위는 SilverHell5744·KeyBindList1469이며 TextCore 이전 metricProof와 개별 글자 조판을 담은 과거 데이터다. 20:20 수정은 이번 코드에 보존되어 있지만 기존 JSON을 새 좌표로 변조하거나 임의로 제외하지 않는다. 원점 ID가 없는 예전 사망/지역 그림자는 보수적 매칭을 못 한357/92건도 남긴다. 새 패키지의 실제 잔여/이름/잉크는 Mac에서 판정한다. PC Player 실행0, BuildLoop 원본/바탕화면 수정0.

최종 공통 병합: origin/unity/main f579841cef를0241b147ca로 정상 병합했다(앞선0082cdfa84 포함). CHANGELOG_SYNC 충돌은 양쪽 기록을 보존했고 실제 코드 충돌은 없다. 추가 rigpixel 소스가 포함된 최종 Core121/Runtime259 컴파일 exit0·오류0, Core 경고2/Runtime 경고522. 컴파일만 수행했으며 셰이더/Player 판정은 Mac 대기다.

사용자 최신 통합 지시 후 origin/unity/main 8c5f967d74를 자기 브랜치에 추가 병합했다. CHANGELOG_SYNC 두 충돌의 양쪽 원문을 모두 보존했고 docs/Unity/CLAUDE/AGENTS의 충돌 표시0·미해결 경로0을 확인했다. 공통에도 있던 game.html.bak_20260611_conflictfix의 오래된 표시6개는 해당 파일이 origin과 동일함을 확인하고 보존했다. .meta 로컬 수정 거부는 없었다. 병합된 실제 소스로 PC 컴파일1회: Core121/Runtime259 exit0·오류0, 경고2/522. Player0. 새 Mac 게이트 대기는 유지한다.


## 2026-11-04 00:50 잔여 원인 분류 및 조판 수정 — G0/G1

| 묶음 | 근거/수정 | 유지 계약 |
|---|---|---|
| 공통 출처5744 | NativeSilverHellUi.Label이 호출 파일/행을 소실해 모든 화면을 wrapper11행으로 기록했다. CallerFilePath/Line을 실제 NativeUiAudit.Label까지 전달해 다음 Mac에서 실제 발행부로 분류한다 | rect·텍스트·색·alpha·스타일·그리기 호출 불변 |
| HUD 무자간 글자 | 경험치/지역 처치/악의오브·숫자를 한 글자씩 Label로 그려 각각의 native 원점 반올림/커닝이 갈라졌다. ls0은 전체 문자열1회 조판하고 Width도 같은 전체 CalcSize를 사용한다 | 기존 panel/row/좌우anchor/폰트/크기/색/문구/수치/그림자·원화 유지 |
| 봉안함/비교판 폭 | Serif는 ls0에서 전체 문자열을 그리는데 SerifWidth는 글자별 폭 합이었다. 같은 NativeUiTextRun.Layout으로 측정/그리기를 통일해 중앙/우측 anchor가 실제 문자열 폭과 일치하도록 한다 | 기존 rect/좌우anchor/폰트/자간/색·장식 보존, 생략·font 축소·판정 완화0 |
| Unicode | 자간이 있을 때도 결합문자/서로게이트를 쪼개지 않고 text element로 그린다. 기존 BMP 한 글자의 .4px 등 양수 자간과 trailing advance는 그대로 | 논리 문자열을 모든 출력 문자열 concat으로 원문과 정확히 대조 |

기존 G0의 같은 게임 가독성/의미 라벨 관례와 이전 PNG를 기준으로 한다. 직접 본 cb77 실습안내2560 및 de 설정1600 PNG는 제목/상태/키 라벨이 실제로 분리되어 있다. 반대로 예전 계측은 실습 왼쪽/오른쪽 라벨을 동일x1919.999로 기록했다. 이전 TextCore/키 목록 수정은 보존하고 이 예전 좌표에 맞춰 정상 레이아웃을 임의 이동하지 않는다. Unity 공식 IMGUI/GUIStyle/TextHandle 참조는 글자 조판·cursor의 역할을 확인하는 용도로만 읽었다. 제품/폰트 코드 반입0.

이번 수정은 판·원화·표시 문구·색·폰트·행/앵커를 없애지 않는다. 디자인 요소 손실0은 소스 변경 검토와31개 조판 계약 검사의 범위다. 새 Player의 같은 해상도 PNG 전후 비교·디자인총괄 판정은 Mac 대기이며 PC에서 확인했다고 보고하지 않는다. .5px 충돌/알파/clip/화면 경계·원계측은 불변.

참고한 엔진 계약: [GUIStyle cursor](https://github.com/Unity-Technologies/UnityCsReference/blob/master/Modules/IMGUI/GUIStyle.cs), [IMGUITextHandle](https://github.com/Unity-Technologies/UnityCsReference/blob/master/Modules/IMGUI/IMGUITextHandle.cs). 실제 설치본의 컴파일 확인과 공개 최신 참조의 범위를 구분하며, 참조 코드 복제0. PC 검증은 실제 NativeUiTextRun 소스로31검사PASS, Core126/Runtime262 컴파일 오류0·경고2/529.

00:50 요청의 기존 JSON 재분석1회 완주: cb77 원본1410장, 잔여8363(글자-글자7784/글자-버튼152/화면이탈250/글자-판177), 동일내용819, 993.216초. 분석기·원본 JSON/PNG 변경0이므로 이전 재분석과 동일하다. 새 C# 렌더링은 이 과거 입력에 들어 있지 않아 실제 감소 수치로 쓰지 않는다. 새 Mac 수집에서 기존 상위 source를 실제 caller별로 분류하고 HUD·봉안함/비교판의 actual ink·경계·텍스트 보존을 같은 크기 PNG로 판정한다. 이 인계는 제품 전체 겹침0/디자인 PASS가 아니다.


## 2026-11-04 01:20 CTO 순회 — 폭 초과 흐름 배치 후보

공통5c9dd3673861b4b5086884dac664068b4d87f370(93a09dccb 이후)을 먼저584b27ba7c로 병합했다. CHANGELOG_SYNC 충돌 양쪽 원문을 보존했고 docs/Unity 충돌 표시0·미해결0을 확인했다. 앞선63ad75d9b의 Mac/디자인총괄 대기는 유지한다.

| 원인/범위 | 변경 | 기본/디자인 보존 |
|---|---|---|
| 긴 스킬 이름154px | 실제 GUIStyle 폭으로 text-element 경계/단어에서 줄바꿈. 원래 첫 줄 Rect/28px 글꼴 유지, 추가 줄만큼 Lv/설명/버튼/스크롤 내용 높이를 같이 이동 | 한 줄이면 shift0, 이름 생략/축소0. 아이콘·제단·원화·글꼴·색 변경0 |
| 자원 푸터200px | SP/악의오브/LV 전체 문구를 폭 안에서24px 행으로 나누고 추가 행만 카드 내용/scroll 높이에 더함 | 한 줄이면 기존 위치/56px 끝 여백 동일. 수치/Core/구슬/문구 보존 |
| 조작 이름↔키 캡슐 | 실제 main/alt 캡슐 폭 뒤10px 간격을 남긴 영역에 이름을 분리. 양쪽 같은 줄의 최대 높이를 사용하고 캡슐/삭제 hit 영역을 같은 행 중앙에 배치. 초기화·ContentHeight도 실제 row 합을 사용 | 짧은 문구는 기존56px 행과 좌표 동일. 원본 판/키/삭제/입력정책/폰트17·14px 보존 |

기존1600 슬롯04 PNG를 직접 보았다. 짧은 회복의영역 제목/레벨이 시각적으로 분리돼 있으므로 과거 JSON 경계만 보고 기본 한 줄을 벌리지 않았다. 새 변경은 폭을 넘는 문구에만 흐름 배치를 적용하며 로비·실버 헬 원화 요소를 건드리지 않는다. 디자인 요소 손실0은 소스·글자 보존 검사 범위이며 새 같은 크기 PNG/디자인총괄 판정은 Mac 대기다.

### 화면별 전후 수치 — CPU 스트레스 폭 모델, 실제 Player 아님

실제 제품에 연결한 NativeUiTextRun/NativeUiTextFlow를 테스트에서 사용했다. 입력 폭은 시험용 glyph provider(Hangul28/Latin14/공백8)이며 실제 폰트 실측값이 아니다. 폭발허수아비·큰 자원 수치·긴 조작 설명의 가로 폭 초과를 센다. 아래15→0은 이런 CPU 모델 후보 수이며 1410장 전체UI의8363건이 줄었다는 뜻이 아니다.

| 해상도 | 스킬 정보판 폭초과 후보(전→후) | 조작 목록 후보(전→후) | 이름/푸터/조작 폭초과 px(전→후) |
|---|---|---|---|
|1920×1080|2→0|1→0|22.00/290.00/161.70→0/0/0|
|2560×1080|2→0|1→0|22.00/290.00/161.70→0/0/0|
|3840×1080|2→0|1→0|22.00/290.00/161.70→0/0/0|
|1600×900|2→0|1→0|18.33/241.67/134.75→0/0/0|
|2560×1600|2→0|1→0|32.59/429.63/239.56→0/0/0|

회귀67/67 PASS(기존31 포함). 새 계약 RED1회→구현 후 GREEN1회, 같은 테스트2회 실패 없음. 통합 PC 컴파일1회 Core126/Runtime267 exit0·오류0, 경고2/531. Player/정식 빌드/새 캡처0. 분석기 임계/알파/clip/문자열/source 제외 변경0. 입력이 같은 옛1410장 전수 재분석은 반복하지 않았다. 실제 전후 수치는 새 Mac 같은 해상도 캡처를 받은 후 기록한다.

## 11-04 가방 개수 줄 퇴보 30건 (바탕화면 교체 래칫 9e97b55ae)

- 출처: NativeInventoryWebLayout.cs:104(Txt)와 NativeInventoryOssuary.cs:59(Serif)가 "가방 ("·숫자·"/"·"300"·")"를 맞대어 그림. 0 끝 606.63+8.5=615.13, "/" 시작 615.1(SerifWidth). 측정 방식 차이로 0.03px 겹침.
- 수정: 조각 사이 1px(NativeInventory.CountRunGap), Serif 묶음 칸=실제 advance, 개수 줄 Txt·Serif 칸=실제 폭. 인벤토리(Dock)·봉안함·보관함 3곳.
- 검증: inventory-count-runs 5/0, 참조 컴파일 오류 0. 후보 빌드 겹침 검사와 1x 전후 비교는 다음 단계.
