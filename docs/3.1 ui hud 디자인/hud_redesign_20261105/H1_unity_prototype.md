# H1 Unity HUD A/B 실화면 시안 — 2026-11-05

- 후보 브랜치: `codex/unity-hud-proto-20261105`, 기준 `75add6ff4a6209e2590a7a626ffb4c37b5f0268e` (작업 시작 fetch 시 origin/unity/main 최신).
- 관문: 코드 시안 구현·오프라인 검증. **화면 미검수(Mac)**. 본선 화면 패치 동결을 유지하며 병합·실행본 갱신·디자인 채택을 하지 않는다.
- 비교 원본: U1 `8af73fc3a39bb96beeb0d4f308de334a5c68e7d0`의 이 폴더 `mock_A.html`·`mock_B.html`·`_hud_mock.js`·`_stage.css`·`G0_BRIEF.md`·`defects.md`·`layout_3840.svg`. 원본 브랜치 파일 변경 0.
- 현재값 기준: H2 `b95b8ead075ec6b77c946af1b271d30c1b061099`의 `current_measure.md`. 하단 HUD만 opt-in 교체하며 상단/모서리 HUD는 그대로다.

## 선택·좌표 계약

`--hud-proto=a` / `--hud-proto=b`만 시안을 선택한다. 인자 없음과 미지원 값은 기존 HUD다. 1920×1080 설계 px에서 A/B 수치를 바로 사용하고 기존 아트 배율 0.9를 다시 곱하지 않는다. 실제 배율 `k=min(W/1920,H/1080)`, 좌표 오프셋 `((W-1920k)/2,(H-1080k)/2)`는 기존 `NativeUiSafeArea.cs:7–10` / `NativeUiViewport.cs:13–14`를 따른다. 3840×1080은 배율 1·x+960이며 양옆은 기존 월드다. 1280×720은 2/3, 3840×2160은 2배다.

## 시안 내부 차이와 선택 근거

1. 실행 `_hud_mock.js:50`의 레일은 양끝 18px를 들인다(A 1025, B 1123). `layout_3840.svg:18` / `defects.md:40`의 전체 묶음 폭(A 1061, B 1159)과 다르다. **실행 HTML 값을 사용**한다.
2. B 주공격 두 칸 평균 x=991, 받침 중심 x=960으로 31px 다르고, RMB 오른쪽은 받침보다 14.5px 나온다. 실행 HTML 수치 그대로이며 임의 재정렬하지 않는다. Mac에서 의도 여부를 판정한다.
3. A 주석의 구체 중심 ±443(`mock_A.html:6`)은 실제 ±435.5와 다르다. `_hud_mock.js:48` 계산을 따른다.
4. 빈 슬롯은 브리프의 “기호 없음”과 달리 실행 `_hud_mock.js:27`에 옅은 6×6 회전 마름모가 있다. 실행 시안대로 표시하고 기존 “—”는 시안 경로에서 쓰지 않는다.
5. MP `#16212e/#3b5f86/#7f9cbc`는 U1 제안 토큰이다. H1 A/B 시안 인자 안에서만 쓰며 정식 실버 헬 토큰·본선 승인으로 확대하지 않는다.
6. U1의 RMB=maliceSwipe/E=fireball 등은 정적 예시다. 실제 `NativeHudSkills.cs:34–35`의 장착/고정 슬롯 연결을 그대로 읽고 HP·MP·ST·쿨다운·분노·기동·포이즈·쉴드는 실제 상태를 표시한다. 예시 397/552·102/120·60/100·45%를 고정하지 않는다.
7. U1의 “선택 후 Mac 구현”은 최신 H1의 A/B 동시 opt-in 구현 배정으로 대체된다. Mac의 실화면 판정은 남아 있다.

HP 액체 높이는 기존 읽기 전용 projection을 유지한다. `Runtime/Core/HudValues.cs:58`의 `10+(100-hpRatio*100)*.87` (%)를 `NativeHud.cs:59`에서 받아 기존 전환을 적용한다. 따라서 HP72%의 정지 상태에서 translate34.36%·채움65.64%이며 U1의 정적 CSS 높이72%와 다르다. 이는 HP 수치·판정 수정이 아닌 기존 표현 입력 유지이며, 최대값 아래의 슬래시는 시안 표시에서만 제거한다(원본 문자열/게임 상태 유지). 쉴드는 HTML 예시에 없지만 G0:40의 유지 지시에 따라 새 홈에 표시한다.

## 폰트·자산

숫자/칩은 기존 `Resources/Art/fonts/Cinzel-600.ttf`, 최대값은 `Cinzel-400.ttf`, 한글 상태 설명은 `Hahmlet-300-ko.ttf`를 사용한다. 해당 파일은 기준 커밋에 모두 있다. 임의 시스템 폰트 대체 없이 사용하며 기존 `CinzelDecorative-Bold` 경로는 기본 HUD에 보존한다. 키 약어 SHFT·CTRL·SPC는 번역 목록 No.4300~4302에 29언어 공통 물리 키 이름으로 등록했다.

아이콘은 기존 `Art/ui/skill_icons/orb/*.png`를 재사용한다. 금속 판·레일·고리·눈·가시·소켓·마우스 그림은 코드/전용 셰이더로 그린다. 유료 생성·이모지·디더·노이즈·원화 파일 수정 0. 글리프 실제 ink 폭, 브라우저 CSS와 Unity의 안티앨리어싱·그림자·최종 색 합성은 화면 미확인이다.

## px 대조표

좌표는 `(x,y,w,h)`, A/B 순서다. 아래 런타임 경로의 약칭 `Layout` = `unity/Assets/Exoduser/Runtime/NativeHudPrototypeLayout.cs`. 시안 근거의 JS는 U1 `_hud_mock.js`이며 구현 값은 순수 C# 실행 검사로 대조한다.

| 항목 | 시안값 A / B | 구현값 A / B | 구현 파일:줄 / 시안 근거 |
|---|---|---|---|
| 외곽원 지름·액체 지름·띠 | 190·156·17 / 212·176·18 | 동일 | Layout:40 / A:16, B:16 |
| 눈 홈 폭 | 30 / 34 | 동일 | Layout:40 / A:16, B:16 |
| 좌·우 구체 중심 x | 524.5·1395.5 / 486.5·1433.5 | 동일 | Layout:49 / JS:48 |
| 구체 중심 y | 975 / 964 | 동일 | Layout:43 / JS:44 |
| 왼쪽 외곽원 rect | (429.5,880,190,190) / (380.5,858,212,212) | 동일 | Layout:50 / JS:76 |
| 오른쪽 외곽원 rect | (1300.5,880,190,190) / (1327.5,858,212,212) | 동일 | Layout:51 / JS:76 |
| 왼쪽 액체 rect | (446.5,897,156,156) / (398.5,876,176,176) | 동일 | Layout:52 / JS:77 |
| 오른쪽 액체 rect | (1317.5,897,156,156) / (1345.5,876,176,176) | 동일 | Layout:53 / JS:77 |
| 판 rect | (605.5,992,709,74) / (576.5,982,767,84) | 동일 | Layout:45–46 / JS:47,52 |
| 판 모서리 chamfer | 12 / 14 | 동일 | Layout:40 / A:17, B:17 |
| 레일 rect | (447.5,1066,1025,14) / (398.5,1066,1123,14) | 동일 | Layout:55 / JS:50 |
| 구체·판·레일 하단 | 1070·1066·1080 / 동일 | 동일 | Layout:42–55 / JS:43–50 |
| 레일에 묻힘·판과 고리 겹침 | 4·14 / 4·16 | 동일 | Layout:42–43,49 / JS:44,48 |
| 슬롯 줄 폭·판 좌우 여백 | 665·22 / 727·20 | 동일 | Layout:42,44–45 / JS:46–47 |
| 소켓 일반·주공격 지름 | 44·44 / 48·56 | 동일 | Layout:44 / A:17, B:17 |
| 그룹 내·사이 간격 | 5·16 / 5·14 | 동일 | Layout:44 / A:17, B:17 |
| 일반·주공격 중심 y | 1022·1022 / 1018·1010 | 동일 | Layout:56–57 / JS:61–63 |
| B 주공격 받침 | 없음 / (885,966,150,100), cham12 | 동일 | Layout:47 / B:18, JS:55–56 |
| M3 전체 rect | (949,981,22,22) / (949,955,22,22) | 동일 | Layout:48 / JS:58–59 |
| 기능 소켓 폭/판 폭 | 572/709=80.677% / 640/767=83.442% | 동일 | Layout:44–45 / JS:46–47 |
| HP 현재·최대 글꼴 | 26·13 / 30·14 | 동일 | Layout:41 / A:20, B:21 |
| MP/ST 현재·최대 글꼴 | 18·11 / 20·12 | 동일 | Layout:41 / A:20, B:21 |

### 13개 슬롯 좌표

`Layout:44,56–60` (시안 JS:46,61–70). 열은 `x / y / 지름 / 칩 top`이며 구현과 시안 값이 같다. 칩 높이는 모두 15. 너비는 글리프 측정 결과에 padding/border를 더하며 가로 눌림을 하지 않는다.

| 키 | 시안값 A | 구현값 A | 시안값 B | 구현값 B |
|---|---|---|---|---|
| 1 | 627.5/1000/44/1036 | 동일 | 596.5/994/48/1034 | 동일 |
| 2 | 676.5/1000/44/1036 | 동일 | 649.5/994/48/1034 | 동일 |
| 3 | 725.5/1000/44/1036 | 동일 | 702.5/994/48/1034 | 동일 |
| 4 | 774.5/1000/44/1036 | 동일 | 755.5/994/48/1034 | 동일 |
| F | 834.5/1000/44/1036 | 동일 | 817.5/994/48/1034 | 동일 |
| Z | 883.5/1000/44/1036 | 동일 | 870.5/994/48/1034 | 동일 |
| 마우스 왼쪽 | 943.5/1000/44/1036 | 동일 | 932.5/982/56/1030 | 동일 |
| 마우스 오른쪽 | 992.5/1000/44/1036 | 동일 | 993.5/982/56/1030 | 동일 |
| SHFT | 1052.5/1000/44/1036 | 동일 | 1063.5/994/48/1034 | 동일 |
| E | 1101.5/1000/44/1036 | 동일 | 1116.5/994/48/1034 | 동일 |
| Q | 1150.5/1000/44/1036 | 동일 | 1169.5/994/48/1034 | 동일 |
| CTRL | 1199.5/1000/44/1036 | 동일 | 1222.5/994/48/1034 | 동일 |
| SPC | 1248.5/1000/44/1036 | 동일 | 1275.5/994/48/1034 | 동일 |

### 표현 세부 대조

아래 약칭: `R`=`unity/Assets/Exoduser/Runtime/NativeHud.Prototype.cs`, `A`=같은 Runtime의 `NativeHudPrototypeArt.cs`, `T`=`NativeHudPrototypeTextShadow.cs`, `S`=`unity/Assets/Exoduser/Resources/Shaders/HudPrototype.shader`, `B`=같은 Shaders의 `HudPrototypeTextShadow.shader`. “동일”은 코드 입력·계산 규격 대조이며 실제 최종 픽셀 PASS가 아니다.

| 항목 | 시안값 | 구현값 | 구현 파일:줄 / 시안 근거 |
|---|---|---|---|
| 아이콘 | 소켓 inset4, A36/B40·48, 원형 cover | 동일, 실제 장착 아이콘 | S:109–114, R:154–156 / JS:26,65 |
| 소켓 바탕·테두리 | #1d1d21→#0b0b0d, 외곽1px 빈#4f5352/채움#8a8b88/선택#c9c7c3 | 동일 토큰·원형 | S:101–108 / JS:24–28 |
| 빈 소켓 마름모 | border-box6×6, 회전45°, 테두리1, 은빛α.16 | 동일; L1중심3.535534/반폭.707107 | S:33–34,115 / JS:18,27 |
| 선택 빛 | inset3, 반경14, #c21a10α.55 | 동일 | S:116 / JS:29 |
| 쿨다운 | inset4 원형 시계방향, #08080aα.70 | 동일; 실제 cd/total | S:117, R:157,162 / JS:30,66 |
| 쿨다운 숫자 | round(d×.36)=16/17/20, Cinzel600 | 동일; 실제 남은 틱/60 올림 | R:167 / JS:31,66 |
| 분노 채움·내선 | #7e0d07α.62, 선1.5 #c21a10α.45/만충.9 | 동일; 실제 RageFill | S:118–119, R:158 / JS:67 |
| 분노 숫자·top | round(d×.24)=11/12, round(d×.12)=5/6 | 동일 크기; 기존 raw Rage 정수+% 표시 유지 | R:168 / JS:67 |
| Shift 게이지 | x+.2d, bottom−6, .6d×2; A(1061.3,1038,26.4,2)/B(1073.1,1036,28.8,2) | 동일 | R:169–171 / JS:68–69 |
| Shift 게이지 색 | track#2c2e31α.95, <.5 #c21a10 / 나머지#c9c7c3 | 동일; 기존 HarpGauge/HarpGaugeMax | R:170–171, NativeHud.cs:155 / JS:68–69 |
| 키 칩 | 높이15, border1, radius2, 좌우padding4, min17, 아래8 겹침 | 동일; 글자 폭+10(양쪽padding+border) | R:179–184, A:122–128 / JS:32,70 |
| 키 글자 | Cinzel600 10.5px, line box13, tracking.63, #a7a49d/빈#6b6964 | 동일; 21px를 균등.5로 그려10.5, 가로눌림0 | R:57–62,69–80,184 / JS:32–33 |
| 마우스 칩 그림 | 9×11, SVG margin-top1 + 칩border1 | 동일, 칩y+2, 코드로 그린 좌/우 버튼 | R:183, A:131–137 / JS:34,71 |
| HP 현재 top | A954.88 / B941.4 | 동일 | R:131–133 / JS:110–111 |
| HP 선·최대 top | A983.48/988.48 / B974.4/979.4, 선44×1 | 동일 | R:134–135 / JS:112–113 |
| MP/ST 이름 top | A943.84 / B931.6, font10 | 동일 | R:144–145 / JS:115 |
| MP/ST 현재 top | A959.84 / B947.6 | 동일 | R:146 / JS:116 |
| MP/ST 선·최대 top | A979.64/983.64 / B969.6/973.6, 선28×1 | 동일 | R:147–148 / JS:117–118 |
| 숫자 색·자간·서체 | 현재#e6e3dc/600/.02em, 최대#a7a49d/400/.04em, 이름10/600/.24em | 동일, 슬래시는 표시만 제거 | R:133–150 / JS:37–39 |
| 자원 그림자 | (0,1) blur2 검정 + (0,0) blur8 검정α.9 | 실제 font atlas alpha → 두 축 Gaussian, 동일 설계 크기 | T:58–84, B:26–41 / JS:36 |
| 쿨다운·분노 그림자 | (0,1) blur2 + (0,0) blur6 검정 | 동일, 키칩엔 그림자0 | R:167–168,184, T:58–84 / JS:31–32 |
| 숫자 구분선 색 | 은빛α.55 가운데, 양끝0 | 동일 | A:118–120 / JS:40 |
| 판 면·크롬·안쪽선 | rgba(20,20,23,.96)→(10,10,12,.97), 위1.4, 안쪽x7/y6/h1 은α.22 | 동일 | A:56–64 / JS:21–23 |
| 판 외부 blur | CSS선언(0,−6) blur18 blackα.45, 동일요소 clip-path | 별도 바깥그림자 없음, polygon 경계 유지. 원본 clip-path의 외부shadow 잘림은 Mac/브라우저 대조 미확인 | A:58–64 / JS:21,52,56 |
| 레일 색·상단선 | #18181b→#0b0b0d, 위1.4px; transparent→강철8%→은30%→hi50%→은70%→강철92%→transparent | 동일 | A:48–54 / JS:19–20 |
| 크롬 색·stop | #f6f5f2/#c9c7c3/#4f5352/#c9c7c3/#8a8b88, 0/.34/.5/.63/1 | 동일 색·stop | A:10,18–21 / JS:13 |
| 고리 | body R−band/2 폭17/18; outer R−1.5 black3+chrome1.6; inner L/2+1 chrome1.4; 홈 R−band+2 은α.18 폭1 | 동일 | A:92–96 / JS:85,99–103 |
| 가시 | 12개, 15°격자에서 지정각만; 길이4/8·반폭2.6/3.6, 검정stroke.6 | 동일 | A:74–90 / JS:93–94 |
| 받침발 | 2개, 180°±38°, 아래y=d, 좌우하단±9/상단±4, chrome1.2 | 동일 | A:81–91 / JS:91–92 |
| 눈 홈·포이즈 | 폭30/34, top y=band/2+1, Q제어±9, stroke1.3; 눈중심±6, r2.3 on/r2 off | 동일, 실제 PoiseEyes 4개를 각각 표시 | A:97–108, R:126–130 / JS:95–107 |
| 눈 glow | 폭eyeW×1.4, 높이14, #c21a10 중심α.55→외곽0 | 동일 규격; 실제 눈이 하나라도 켜질 때 | A:110–115, R:128 / JS:97,105 |
| M3 | 전체22×22, path11/2→20/11→11/20→2/11, border1.2, 중앙점r2.2 | 동일 | A:66–69 / JS:59 |
| HP 액체 색 | #9a160c/#6a0b06/#3a0603/#1c0302, stop0/.42/.75/1 | 동일 색; 채움높이는 기존 HpTranslatePercent | S:63–69 / JS:78 |
| MP 색 | #16212e/#3b5f86/#7f9cbc, stop0/.6/1 | 동일, 시안 전용 제안색 | S:48–51 / JS:80, CSS:16 |
| ST 색 | #1e1f22/#4f5352/#8a8b88/#a7a49d, stop0/.45/.85/1 | 동일 | S:52–55 / JS:82 |
| 액체 경계·분리선·광택 | 상단1px hiα.30(HP/MP)/.35(ST), MP/ST 분리1px 은α.6, 광택α.10·가장자리흑α.55 | 동일 코드 규격 | S:69–81 / JS:78–83 |
| 기동 홈 | 반경A82.75/B93, 은빛#e6e3dd stroke3 α.9 | 동일; 실제 기동 게이지 | R:94–96, S:85–98 / JS:87–89 |
| 기동 눈금 | 실제 cell 경계마다 선폭2·방사길이6, #0f0f10 | 동일, 기본.2/.4/.6/.8; cell을 Core에서 읽음 | S:35–36,91–98, NativeHud.cs:156 / JS:90 |
| 보호막·피격·스킬상태 | 정적 HTML에는 없음, G0:40에서 보호막 유지 | 보호막 같은 홈 #3296ff, 실제 hurt #c21a10, 기존 상태14 Hahmlet·충전160×2 유지 | R:93–96,190–200, S:82,90 / G0:40 |

H2 현재값 대비 A/B 차이: 액체157.5→156/176, 원화 frame236.7→정의된 원형190/212, 소켓33.3×40.5→44×44/48×48(주공격56×56), 키15px가로압축→10.5px균등배율, 원화하단−29.6/바하단10.2→구체10/판14/레일0px. H2의 코드상 알파 경계 모델와 새 원형 정의는 다른 측정량이므로 “기존 실제 원형지름236.7”로 해석하지 않는다.

판 그림자의 clip 해석, CSS radial/크롬 보간의 최종 픽셀, glyph 실제 기준선·폭, 선형 색 공간과 알파 합성은 Mac 실화면 대조가 남았다. Shader의 입력 색과 코드 px 일치가 GPU 결과 일치 증거는 아니다.

## 검증

| 검사 | 결과 | 근거·범위 |
|---|---|---|
| 인자·A/B 기하·13슬롯·히트영역·접지·초광폭 | **344/0** | `unity/Tools/hud-proto-tests/run.cjs` → 실제 `NativeHudPrototypeLayout.cs` + `Program.cs` 컴파일/실행 |
| 마름모6×6·눈금6×2·soft-shadow 계약 | **16/0** | `unity/Tools/hud-proto-tests/render-math.cjs`; 셰이더 상수/명세 식의 정적 검사이며 GPU 실행 증거 아님 |
| 기본 HUD 본문·줄 끝 보존 | **PASS** | `unity/Tools/hud-proto-tests/legacy-path.cjs`: `NativeHud.cs`의 Draw/Dispose + `NativeHudSkills.cs`의 Pointer hook 총3곳만 제거하면 기준 커밋과 바이트 동일. 각205/89줄, CR0 유지. 기존 DockLayout/NativeGame/HudPresentation/HudOrb shader 동일 |
| 오프라인 Roslyn C# | **5/5, 오류0** | Player Core133/Runtime298, Editor Core133/Runtime298/Editor64 소스. 기존 Bee RSP를 읽기만 함. 전체 경고155(새 H1 소스 경고0), 경고를 오류0과 혼동하지 않음 |
| 소유·금지 범위 | **코드 Core/HP·피해·카메라·어택티켓·다른 레인 수정0** | 기존 C# 파일2곳은 opt-in 삽입3개만, 새 표현 파일과 문서/검사 도구 추가 |
| Unity·GPU·Mac 실화면 | **미실행 / 화면 미검수(Mac)** | Unity import/Metal shader 컴파일·실제 입력·동적 프레임·글리프/그림자 일치·최종 RGB는 이 검증에 포함하지 않음 |

기본 분기 근거: `NativeHud.cs:84`, `NativeHud.cs:202`, `NativeHudSkills.cs:13`. `NativeHud.Prototype.cs:100`은 모드 None이면 새 자원 로드 전에 false로 돌아오고 기존 본문을 실행한다. 인자 parser는 `NativeHudPrototypeLayout.cs:19–30`에 있으며 미지정·잘못된 값·중복 선택은 None이다. 시안 자원은 최초 opt-in Draw에서만 생성되고, 완전 초기화 후 레이아웃을 공개한다(`NativeHud.Prototype.cs:32–55`). 초기화 실패 시 부분 리소스도 해제한다.

문자 그림자는 최대32개 LRU 완성 RT만 보관하고, 교체·종료 때 해제한다(`NativeHudPrototypeTextShadow.cs:13,35–42,106–109`). 이후 동적 font atlas가 재구성돼도 캐시에 오래된 UV가 남지 않는다. 실제 atlas 기준선과 IMGUI 전경의 픽셀 정렬은 Mac 판정 대상이다.

검사 이력: 구현 전 의도된 RED는 실패 규칙에서 제외했다. 그림자 추가 후 첫 C# 검사에서 Unity6.6의 `GetInstanceID` 폐기 API 오류1건을 발견해 Font 참조 식별로 고친 뒤 **수정 재검사 통과**했다. 진짜 실패는 같은 컴파일 검사1회였고 2회 실패 기준에 도달하지 않았다. 범위 검토에서 발견한 초기화 예외 처리는 재검사 전에 함께 수정했다. 기하·본문 보존 검사는 이후 소유 파일/레이아웃 입력이 바뀌지 않아 불필요하게 반복하지 않았다.

명령:

`C:/nvm4w/nodejs/node.exe unity/Tools/hud-proto-tests/run.cjs`

`C:/nvm4w/nodejs/node.exe unity/Tools/hud-proto-tests/render-math.cjs`

`C:/nvm4w/nodejs/node.exe unity/Tools/hud-proto-tests/legacy-path.cjs`

`./unity/Tools/devtools/buildloop/compile-check.ps1 -Project G:/exoduser-wt/codex-h1-hud-proto/unity -LibraryProject G:/exoduser-wt/codex-unity-parity-1102/unity -Output I:/EXODUSER-Storage/devtools/h1-hud-proto`

로그: `I:/EXODUSER-Storage/devtools/h1-hud-proto/result.json` 및 Player/Editor 어셈블리별 log. Git 안 요약 로그는 이 폴더 `H1_validation.log`. 오프라인 DLL은 확인 후 삭제하고 로그만 남긴다.

## Mac 캡처 인계

현재/A/B를 같은 후보 커밋·같은 해상도·동일 캐릭터/장착/상태·같은 카메라 구도에서 각각 촬영한다. `--hud-proto` 유무만 바꾼다. Mac 공용 실행기에 아래 Player 인자를 전달하며, 실행기는 Mac 담당의 기존 무창·무음 절차를 쓴다. 이 PC에서는 실행하지 않았다.

| 비교 | 공통 인자에 추가 |
|---|---|
| 현재 | 없음 |
| A | `--hud-proto=a` |
| B | `--hud-proto=b` |

공통 정지구도: `--remodel3d --unity-field-screen -screen-width 1920 -screen-height 1080 -screen-fullscreen 0 -batchmode -nosound --unity-qa-sandbox <Mac 절대 QA 저장 경로> -output <Mac 절대 출력 경로>`. 모드별 출력·샌드박스는 current/a/b로 나누고 사용자 저장을 사용하지 않는다. 렌더가 필요하므로 `-nographics`를 넣지 않는다. 기존 `NativeGame.cs:172`가 `A2FieldCapture`로 진입하며, `NativeGame.A2FieldCapture.cs:69–73`이 같은 좌표 목록과 1920×1080/3840×1080을 순서대로 촬영한다. 피치 34°를 바꾸는 인자는 없다.

| 장면 | 같은 구도·상태의 확인 항목 |
|---|---|
| 01-시작 (4020,7420), 1920×1080 현재/A/B | 하단 레일 접지, 구체·판 겹침, 13칸·키 칩, 상단 HUD 무변화 |
| 03-전투공터 (4000,5000), 1920×1080 현재/A/B | 밝고 어두운 바닥 위 금속 대비·1x 가독성·양쪽 구체 중심 |
| 08-보스입구 (4020,500), 1920×1080 현재/A/B | 상단 보스 HUD/목표 패널과 시각적 충돌, 구체보다 먼 적·탄막의 우선 가독성은 별도 전투 확인 |
| 같은 세 장면, 3840×1080 | 중앙 x+960, 폭 불변, 양옆 월드 유지 |
| 실제 전투 또는 동일 QA 상태 재현 | HP/MP/ST full·partial·empty, shield·poise, 모든 slot cooldown·분노·Shift 기동 게이지, 마우스 클릭·상태 설명 |

보조로 `--remodel3d --unity-hud-blend-smoke -batchmode -nosound --unity-qa-sandbox <절대경로> -output <절대경로>`에 현재/A/B 선택 인자를 붙여 같은 idle/charge tier2/tier3를 비교할 수 있다(`NativeGame.HudBlendCapture.cs:29–45`). 이 하니스는 720p도 추가 촬영하며 `hud-blend-capture.json` 기하가 기존 dock에 고정돼 있다. **그 JSON의 PASS·좌표를 A/B 기하 검증으로 사용하지 않는다.** 기본 `--unity-hud-smoke`의 녹색 ST/원본 색 GPU 기대값 역시 시안 색 검증에 사용하지 않는다.

Mac은 전체 프레임과 하단 1x/3x 크롭을 U1 시안 옆에서 비교하고, 10초 무음 영상으로 전환·쿨다운·깜빡임을 확인한다. CSS와 Unity 폰트 raster 차이, 셰이더 import/Metal 오류, B 받침의 31px 편차 의도, 외곽 가시·받침발 잘림, 손상감 표시와 스킬 상태 설명 겹침은 남은 판정 항목이다. 이 턴에서 Mac 실행을 기다리지 않는다.

END
