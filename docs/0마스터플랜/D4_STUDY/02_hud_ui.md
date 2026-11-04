# D4 연구 02 — 디아블로4 전투 HUD·UI는 어떻게 만들었나 (공부, 복제 아님) — 2026-11-04

- 레인: D4-2(연구·문서만). 배정: 클라우드 CTO. 사용자 지시: "철저하게 분석해서, 카피 말고 공부하라."
- 계기: 우리 전투 HUD가 "붕 뜨고, 안 맞고, 듬성듬성, 색이 구리다"(사용자).
- 쓰는 곳: U1 HUD 재디자인 레인(`claude/unity-cloud-hud-redesign-g1-20261105`)의 G0 브리프·G1 배치안.
- 선행 문서: [실버 헬](../../3.1%20ui%20hud%20디자인/DESIGN_CONCEPT_SILVER_HELL_20261028.md)(최상위 톤), [DIABLO4_UI_RESEARCH_20260924](../../3.1%20ui%20hud%20디자인/DIABLO4_UI_RESEARCH_20260924.md)(창·설정 화면 위주 1차 조사). 이 문서는 **전투 HUD**만 다룬다.
- 코드 수정 0. 게임 파일·프레임 캡처 분석 0. 이미지 반입 0(측정값·설명만).

## 조사 한계 (먼저 읽을 것)

1. **이 세션은 웹 페이지 본문을 열 수 없었다.** 클라우드 네트워크 정책이 news.blizzard.com·pcgamer.com·artstation.com·behance.net·techraptor.net 등을 막았다(WebFetch DNS 실패). 근거는 전부 **검색 엔진이 돌려준 요약·발췌**다. 아래 "확인한 사실"은 서로 다른 출처 두 곳 이상의 요약이 같은 말을 한 것만 올렸다. 원문 문장 대조는 Mac 브라우저에서 다시 해야 한다(§9 후속 1).
2. **디아블로4 HUD의 픽셀 실측을 공개한 매체는 찾지 못했다.** 구체 지름·슬롯 크기·하단 HUD 높이 비율 같은 숫자는 공개 자료에 없다. 그래서 이 문서의 비례 숫자는 모두 **"우리 제안(추정)"**이고, D4 값이라고 쓰지 않는다. 실측이 필요하면 직접 플레이 화면을 1920×1080에서 사람이 재야 한다(§9 후속 2).
3. Game UI Database의 D4 항목은 검색으로 목록을 확인하지 못했다(DB 자체는 존재 확인).
4. 공식 개발 블로그(2020-02)는 **출시 3년 전** 설계 의도다. 출시판과 다를 수 있다.

표기: **[사실]** = 출처 2곳 이상 일치, **[사실·1]** = 공식 1곳만, **[추정]** = 관찰·원리에서 끌어낸 우리 판단, **[제안]** = 우리 HUD에 쓸 수치.

---

## 0. 우리 HUD에 바로 적용할 규칙 10개

기준 해상도 1920×1080 논리 px(현행 IMGUI `GUI.matrix` 높이 기준 배율, 720p = 2/3). 3840×1080에서도 같은 논리 px로 중앙 묶음에 둔다. 색은 실버 헬 토큰 이름으로 쓴다. 현행 HUD는 **13칸**(키 `1,2,3,4,F,Z,LMB,RMB,Shift,E,Q,Ctrl,Space`)이고, 칸 수·배정·발동은 바꾸지 않는다(Core 무변경). 제작 도구·방식은 §11 결정안.

| # | 규칙 | 수치 [제안] | 근거 |
|---|---|---|---|
| R1 | **하단 HUD는 한 덩어리다.** 체력 구체·스킬 슬롯 줄·자원 구체·물약을 **한 장의 베이스 판** 위에 올리고, 셋이 같은 바닥 정렬선을 쓴다. 구체는 판 양 끝에 반쯤 박히고(판 윗선이 구체 중심보다 아래), 슬롯은 판 안에 들어간다. 아무것도 판 밖에 홀로 떠 있지 않다 | 판 아랫변 = 화면 아래 0px(붙임). 구체 아래 끝 = 화면 아래 4~8px. 구체 중심 높이 = 판 윗선 + 구체 반지름의 20~30% | D4 하단 묶음(구체 좌·우, 스킬 가운데) [사실]. "판에 박는다"는 붙는 원리 [추정]. "붕 뜸" 대응 |
| R2 | **중앙 묶음, 화면 비율과 무관.** 묶음 가로 중심 = 화면 중심. 16:9·21:9·32:9 모두 같은 px 폭. 화면 끝으로 늘리지 않는다 | 묶음 폭 940~980px(1920의 49~51%, 13칸 기준). 3840×1080에서도 같은 px. 현행 foundation 1008px과 비슷하되 구체를 안쪽으로 당긴다(현행 액체 중심 간격 882px → 제안 약 800px) | D4 PC 기본 = 하단 가운데, 옵션 좌하단 [사실]. 울트라와이드에서 "Centered"가 구체를 시야 안에 둠 [사실·커뮤니티 2곳] |
| R3 | **하단 HUD 높이 상한.** 전투 화면을 덜 가리게 | 판 높이 ≤ 화면 높이 7%(76px), 구체 꼭대기까지 ≤ 13%(140px) | D4가 처음 구석 배치를 택한 이유가 "전투 영역 시야" [사실]. 비율은 [추정·제안] |
| R4 | **비례 고정.** 구체 : 슬롯 : 간격 : 장식 두께 | 구체 지름(틀 포함) 132px. 13칸을 두 크기로: 스킬 그룹 52px(구체의 0.39), 동작 그룹 40px(0.30). 칸 간격 5px(칸의 0.1), 그룹 사이 12px. 어느 키가 어느 그룹인지는 U1이 배정표로 정한다. 현행은 구체 틀 236.7 : 칸 33.3×40.5 = 0.14로 구체가 칸의 7배다 — "안 맞음"의 1순위 원인 [사실·문서]. 슬롯 테두리 2px, 판 외곽 은빛 1.4px + 검정 3px(실버 헬 §5 창 틀과 같은 선). 장식(가시·문양)은 구체 테두리에만, 두께 ≤ 구체 지름의 6% | [제안]. 장식을 구체에 몰아 주고 나머지는 선 하나로 — D4 구체 장식이 "과하다"는 그래픽 디자이너 피드백 [사실·1, 포럼]도 상한 근거 |
| R5 | **빈 슬롯은 "빈 홈"이다.** 슬롯 줄 길이와 간격은 늘 같고, 비어 있으면 아이콘 대신 어두운 홈만 남긴다. 슬롯을 빼서 줄을 줄이지 않는다 | 빈 홈 바탕 `--sv-dp`~`--iron`, 테두리 `--sv-dk` 1px 유지, 안쪽 밝기 ≤ 15%. 키 라벨은 남기되 `--tx-3` | "듬성듬성" 대응. 줄 길이가 바뀌면 정렬선이 흔들림 [추정] |
| R6 | **틀은 어둡고 낮은 대비, 내용이 가장 밝다.** 틀(철)은 명암 3~4단계, 위쪽 모서리에만 은빛 하이라이트 1px. 아이콘 바탕은 밝기·채도를 낮춘다 | 틀 명도 6~32%(`--iron`→`--sv-dk`), 하이라이트 `--sv-lt` 1px 위쪽 1/3만. 아이콘 칸 바탕 밝기 ≤ 12%, 채도 ≤ 10% | D4 2020: 아이콘 바탕 밝기·채도를 낮추고 희귀도는 테두리 장식으로 [사실]. 금색 화려함이 "구리다"의 원인 후보 [추정] |
| R7 | **자원 색은 구체 안에서만 강하다.** 체력 = 진홍 액체, 자원 = 직업 색. HUD에서 채도가 높은 면은 두 구체 안쪽뿐이다 | 체력 액체: 색상 0~6°, 채도 75~90%, 명도 30~45%, 가장 밝은 심지 ≤ 60%(`--eye`·`--eye-hot` 계열). 자원 액체: 채도 55~75%, 명도 30~45%. 빈 부분은 같은 색의 명도 8~12% | [제안]. 실버 헬 "빨강은 눈에만" 규칙과 충돌 → §8 충돌 1 |
| R8 | **글자는 1x에서 읽힌다.** 키 라벨·숫자 크기 3단계 고정, 밝은 글자 + 어두운 받침 | 키 라벨 18px(최소, Cinzel 600), 쿨다운 초 24px(Cinzel 700), 구체 숫자(마우스 올림·옵션) 20px. 외곽선 대신 2px 아래 그림자(검정 .8) + 라벨 뒤 어두운 반투명 판. 대비 ≥ 4.5:1. 글자 크기 옵션 3단(작게·보통·크게 = 0.85·1·1.25) | XAG 101: PC 1080p 최소 글자 몸높이 18px, 콘솔 26px, 200%까지 확대 가능해야 [사실]. XAG 102: 대비 4.5:1(큰 글자 3:1), 고대비 모드 7:1 [사실]. D4 글자 크기 3단 옵션 [사실] |
| R9 | **쿨다운 = 어둡게 + 시계 방향 + 숫자.** 아이콘을 어둡게 덮고 덮개가 12시에서 시계 방향으로 걷히며, 남은 시간 숫자를 가운데 쓴다. 다 차면 짧은 은빛 섬광 | 덮개 검정 알파 .55, 숫자 1초 이상 정수·1초 미만 소수 1자리, 준비 순간 테두리 `--sv-hi` 200ms. 자원 부족 = 아이콘 채도 0·밝기 50% + 비용 칸 진홍(모양 변화 동반) | D4 시계식 덮개 [추정, 출처 1곳·D4 한정 불확실]. 숫자 표시 [추정]. 지속형 스킬은 아이콘 위 작은 막대가 줄어듦 [사실·커뮤니티 2곳] |
| R10 | **상태는 구체에 직접, 색만으로 말하지 않는다.** 보호막·강화·취약은 구체 자체의 모양 변화로 보여 주고, 버프·디버프 줄은 슬롯 줄 바로 위에 붙인다 | 보호막 = 구체 위 별도 층(밝은 막 + 바깥 고리), 강화 = 구체 둘레 쇠 고리, 취약 = 구체 금 간 무늬. 버프 아이콘 32px, 간격 4px, 슬롯 줄 윗선 + 8px에 왼쪽 정렬, 아이콘 아래 지속 막대 3px. 디버프는 테두리 모양(톱니)으로 구분 | D4 구체: 보호막 층·강화 쇠고리·취약 금 [사실, Wowhead·mein-mmo·Icy Veins]. XAG 102 "색만으로 정보 전달 금지" [사실]. 단, D4 구체 상태가 "복잡해서 헷갈린다"는 보도 [사실·2곳] → 우리는 3종까지만 |

---

## 1. 레이아웃 체계 — "뜨지 않음"의 원리

### 무엇을
- [사실] 하단 묶음: 왼쪽 체력 구체, 오른쪽 자원 구체, 가운데 스킬 줄(마우스 좌·우 + 숫자 1~4, 기본 6칸). 물약은 체력 구체 쪽(Q). (gamepressure 인터페이스 가이드, pcinvasion "자원 미터는 스킬 줄 오른쪽", 여러 초보 가이드)
- [사실] 2020-02 공식 분기 업데이트: 데모(2019 블리즈컨)는 스킬 줄을 **왼쪽 아래 구석**에 뒀다. 테스트·피드백 결과 PC에서 잘 안 맞아 **PC 기본 = 아래 가운데, 옵션 = 왼쪽 아래**. 콘솔은 시야각·거리 때문에 왼쪽 아래 유지. (Blizzard News 2020-02-26, TechSpot·Den of Geek·mmorpg.com·RPGSite 보도)
- [사실·커뮤니티 2곳] 울트라와이드에서 HUD가 화면 끝으로 퍼지지 않고 가운데에 모인다("Centered" 설정).

### 왜
- [사실] 구석 배치의 이유는 "전투 영역을 더 보이게"였고, 가운데로 돌아온 이유는 PC 사용자 시선(캐릭터가 화면 가운데)과 피드백이다. 즉 **시선 중심(캐릭터)과 HUD 중심을 같은 세로선에 두는 것**이 PC의 답이다.
- [추정] 콘솔·TV는 화면이 멀어 시선이 넓게 움직이므로 구석에 몰아도 된다. PC 모니터는 가까워서 가운데 아래가 눈 이동이 가장 짧다.

### 어떻게 만들었나
- [추정] 구체·슬롯·물약이 하나의 하단 장식 판 위에 같은 바닥선으로 놓인다. 구체는 판 양 끝에서 위로 솟고, 판은 화면 아래에 붙는다. 각 요소가 "자기 위치"를 따로 갖는 게 아니라 **판 하나의 자식**이다. 그래서 해상도가 바뀌어도 서로 간격이 안 변한다.
- [추정] 안전 영역: 콘솔 TV 오버스캔 대비로 왼쪽 아래 배치는 화면 가장자리에서 띄운다. PC 가운데 배치는 아래에 붙인다.

### 우리 Unity에서 같은 결과를 내는 법 (현행 IMGUI 구조 그대로, §11 결정안 S4)
1. 배율은 지금처럼 `GUI.matrix` 높이 기준 하나(1080 = 1, 720 = 2/3). 가로가 넓어져도 HUD 논리 px은 그대로다.
2. `NativeHudDockLayout`의 dock 사각형 하나를 **유일한 기준**으로 둔다: 가로 중심 = `Screen.width/2/배율`, 아랫변 = 화면 아래. 구체·13칸·물약·버프줄 좌표는 모두 dock 기준 상대값으로만 계산하고, 각자 화면 좌표를 갖지 않는다(현행도 대부분 이렇게 돼 있다 — 웹 좌표 `519/1401` 같은 절대값이 남은 곳을 상대값으로 바꾼다).
3. 베이스 판(9-slice 원화)은 dock 바닥에 붙인다. 구체는 판 양 끝, 구체 중심을 판 윗선보다 위로(R1). 현행처럼 유리 끝이 화면 아래로 29.6px 나가는 것은 허용하되, 액체 바닥은 화면 안 4~8px.
4. 21:9·32:9에서는 dock가 그대로 가운데에 있다. 양옆 빈 공간에 아무것도 늘리지 않는다(검은 판·블러 채움 금지, CLAUDE.md 4.2-4).
5. 콘솔용 왼쪽 아래 옵션은 v0 범위 밖. dock 기준점 하나만 바꾸면 되게 해 둔다.
6. (나중에 UGUI로 옮길 경우의 대응: Canvas Screen Space–Overlay, CanvasScaler 1920×1080 Match=1, 아래 가운데 앵커 RectTransform 하나에 모든 HUD를 자식으로. §11 S4 참고.)

---

## 2. 비례와 밀도

### 무엇을
- [사실 없음] 공개 실측 없음(조사 한계 2).
- [사실·1, 포럼] 그래픽 디자이너 플레이어 피드백: 어두운 금속 테두리는 좋지만 커서·체력 구체 주변 장식은 과하다.

### 왜 (원리)
- [추정] 구체가 크고(정보의 핵심 = 생존), 슬롯은 구체의 절반 이하로 작아야 **위계**가 선다. 둘이 비슷한 크기면 "안 맞음"으로 읽힌다.
- [추정] 슬롯 간격이 슬롯 폭의 1/10 근처면 한 줄로 읽히고, 1/4을 넘으면 낱개로 흩어져 "듬성듬성"이 된다.
- [추정] 장식은 한 곳(구체)에 모으고 나머지는 선 하나. 장식이 고르게 퍼지면 정보보다 장식이 먼저 보인다.

### 우리 수치 [제안]
| 부품 | 1920×1080 px | 비율 |
|---|---|---|
| 구체 지름(틀 포함) | 132 | 1 |
| 구체 안 액체 지름 | 108 | 0.82 |
| 스킬 그룹 칸(7칸 가정) | 52×52 | 0.39 |
| 동작 그룹 칸(6칸 가정) | 40×40 | 0.30 |
| 칸 간격 / 그룹 사이 | 5 / 12 | 칸의 0.1 |
| 13칸 줄 전체 폭 | 7×52+6×5 + 12 + 6×40+5×5 = 671 | |
| 구체–칸 줄 간격 | 16~20 | |
| 베이스 판 높이 | 72~76 | 구체의 0.56 |
| 칸 테두리 | 2 | |
| 구체 장식(가시) 두께 상한 | 8 | 구체의 6% |

묶음 폭 = 132 + 18 + 671 + 18 + 132 ≈ 971. 7/6 그룹 나눔은 가정이다. U1 레인이 키 배정표로 그룹을 정하고, 첫 목업을 1x로 본 뒤 ±10% 안에서 조정한다.

### 현행과의 차이 (10-27 A06 문서 기준 — 그 뒤 바뀐 값은 U1이 코드로 다시 확인)
| 항목 | 현행 | 제안 |
|---|---|---|
| 구체 틀 | 236.7² | 132² |
| 칸 hit rect | 33.3×40.5(세로로 긴 칸) | 52² / 40²(정사각) |
| 칸 x 간격(중심) | 39.6 안팎, 일정하지 않음(`{128,173,217,…}×0.9`) | 57 / 45, 일정 |
| 키 라벨 높이 | 16.2 | 18 이상(XAG PC 최소) |
| 액체 중심 x | 519 / 1401(간격 882) | 약 560 / 1360(간격 약 800) |
| foundation | 1008×127.8 | 약 971×74 |

### 빈 슬롯
- [제안] R5 그대로. 13칸은 늘 그린다. 빈 칸은 "홈"(파인 자리)처럼 그림자 안쪽으로 그려, 장비하지 않은 자리라는 뜻만 준다.

---

## 3. 재질과 색

### 무엇을
- [사실] 2020 공식: 인벤토리 아이콘 배경의 **밝기·채도를 낮추고**, 희귀도는 **테두리 장식**으로 알린다. 아이콘은 회화풍에서 **3D 모델에 가까운 직접적인 그림**으로 바꿔 작은 크기에서도 물건이 읽히게 했다. (Blizzard News 2020-02, 여러 매체 재보도)
- [사실] 같은 글의 방향: "거친(gritty) 인터페이스"와 "쓰기 쉬움"의 균형. 플레이어 목표와 게임 비전을 같이 저울질하되 무엇을 알리는지가 분명해야 한다. (Angela Del Priore, Lead UI Designer)
- [사실] 구체 표현: 보호막(Barrier)은 체력 앞에 덮이는 밝은 층, 강화(Fortify)는 구체 둘레의 무거운 쇠·가시 고리, 취약(Vulnerable)은 구체에 금이 간다. (Wowhead Health Globe 가이드, mein-mmo, Icy Veins, gamepressure)
- [사실·1, 80.lv] 체력 구체의 "출렁이며 차는 액체"는 셰이더로 재현 가능한 동적 채움이다(외부 개발자의 UE5 재현 기사). 원작 제작법이 아니라 재현이다.

### 왜
- [추정] 바탕(틀·아이콘 칸)을 어둡고 무채색으로 누르면, 채도가 있는 곳(구체 액체·희귀도 테두리·위험)이 저절로 눈에 들어온다. **채도를 쓰는 면적을 줄이는 것**이 "색이 고급스러운" 느낌의 원리다.
- [추정] 금속은 텍스처 디테일보다 **명암 단계 수**로 읽힌다. 3~4단계(그늘·바탕·중간·위쪽 하이라이트)면 1x에서 쇠로 읽히고, 그 이상 잔무늬는 1x에서 노이즈가 된다(우리 "점 금지" 규칙과 같은 방향).

### 우리 Unity에서
1. 틀 텍스처는 **2배 해상도로 그려 1x로 표시**(예: 구체 틀 264px 원본 → 132px 표시). 밉맵 끄고 Bilinear. 잔무늬·그레인 0.
2. 명암: 실버 헬 토큰 `--iron #0f0f10` → `--sv-dp #2c2e31` → `--sv-dk #4f5352` → 위쪽 하이라이트 `--sv-lt #c9c7c3` 1px. 금·황동 없음.
3. 구체 액체: 현행처럼 `NativeHud`의 RenderTexture + 머티리얼(`Graphics.Blit`) 경로를 쓴다. 파라미터는 채움 높이(0~1) + 표면 물결(사인 2개, 진폭 2px) + 위쪽 안쪽 반사광(타원 1개). 파티클·노이즈 텍스처는 쓰지 않는다.
4. 아이콘 칸 바탕은 R6 수치. 희귀도·상태는 테두리 모양·두께로.

---

## 4. 글자

### 무엇을
- [사실] 2023-04 Blizzard 발표: 베타의 산세리프 게임 글꼴을 **새 세리프 글꼴로 교체**. 반응은 "분위기에 맞다" vs "가독성이 떨어진다"로 갈림. (Wowhead 2023-04, gamepressure)
- [사실] 게임 내 글자 크기 3단(작게·보통·크게), 커서 크기 조절, 자막 색·배경 불투명도 조절. (Blizzard 접근성 블로그 2023, PCGamesN·GameSpot·mp1st·Wowhead 보도)
- [사실] Blizzard는 UI 글꼴 이름을 공개하지 않았다. (팬 글꼴 분석 글 다수가 "미공개"라고 씀)
- [사실] XAG 101(Xbox 접근성 지침): 글자 크기 = 몸높이(가장 낮은 내림획~가장 높은 올림획). 최소 기본값 **PC 1080p 18px, 콘솔 1080p 26px(4K 52px)**, 200%까지 내용 손실 없이 키울 수 있어야. (Microsoft Learn·devdocs.xbox.com XAG 101, v3.2)
- [사실] XAG 102: 일반 글자·요소 대비 **4.5:1**, 큰 글자 **3:1**, 고대비 모드 **7:1**. 색만으로 정보를 전하지 말 것. (Microsoft Learn XAG 102)

### 우리 Unity에서
- 폰트는 CLAUDE.md 4.2-2 그대로: 숫자·키 라벨 Cinzel, 한글 설명 Hahmlet/나눔명조. 현행 IMGUI `Font`+`GUIStyle`에서는 그림자를 **두 번 그리기**로 만든다: 검정 .8을 (0,+2) 논리 px에 먼저, 본 글자를 위에. 사방 외곽선(4~8번 그리기)은 쓰지 않는다 — 1x에서 글자가 뭉친다 [추정]. 글자 크기는 `GUIStyle.fontSize`를 배율 뒤 실제 px로 계산해 18px 미만으로 내려가지 않게 한다(720p에서는 18 × 2/3 = 12px이 되므로, 720p 하한은 XAG 비례 기준인 12px로 둔다).
- 크기 단계 R8. 키 라벨은 슬롯 **오른쪽 아래 안쪽 4px**에, 라벨 뒤 어두운 반투명 사각(알파 .6) — 아이콘 그림과 겹쳐도 읽히게 [추정].
- 1x 판정: 1920×1080 실화면을 100% 크롭해 키 라벨 6개·쿨다운 숫자가 한눈에 읽히는지. 대비는 라벨 글자 vs 바로 뒤 바탕 픽셀로 잰다.
- 글자 크기 옵션은 HudDock 안 글자만 배율(0.85·1·1.25). HUD 전체 배율 옵션은 공개 자료에서 D4에 있다는 확인을 못 했다 → v0에서는 넣지 않고 보류.

---

## 5. 상태 표현

| 상태 | D4 공개 자료 | 판정 | 우리 [제안] |
|---|---|---|---|
| 쿨다운 | 아이콘 위 시계식 음영 — D4 한정 확인 불확실(위키 1곳) | [추정] | R9: 검정 .55 덮개, 12시→시계 방향, 가운데 숫자 24px, 준비 섬광 200ms |
| 지속형 스킬 | 아이콘 위 작은 막대가 지속시간 동안 줄어듦, 활성 표시 | [사실·커뮤니티 2곳] | 슬롯 윗변 안쪽 3px 은빛 막대 |
| 자원 부족 | 시각 표시 확인 못 함. "자원 부족" 캐릭터 대사는 끌 수 있음 | 대사 끄기 [사실·1, GamesRadar] | 아이콘 채도 0·밝기 50%, 비용 숫자 진홍, 사용 시도 시 구체가 한 번 흔들림(4px, 120ms). 화면 가운데 큰 글자 경고는 쓰지 않음 |
| 보호막 | 체력 앞 밝은 층 | [사실] | 구체 위 반투명 막 + 바깥 고리. 우리 보호막(에너지쉴드) 색은 기존 파랑 유지(실버 헬 6.1 손 수정 기록) |
| 강화 | 구체 둘레 쇠 고리 | [사실] | v0 범위 밖(Core에 같은 개념이 없으면 넣지 않음) |
| 취약 | 구체 금 감 | [사실] | 우리 Core 디버프에 대응하는 것이 있을 때만 |
| 버프·디버프 줄 | 스킬 줄 위 아이콘 줄. 버프 줄이 혼잡해 개선 요구 많음(포럼). 정적 버프를 빼고 스킬 줄로 옮긴 변경 보도는 D3 2.4.0과 섞였을 가능성 | 위치 [추정], 개선 방향 [사실·1] | R10: 슬롯 줄 위 8px, 32px, 최대 8개, 지속 막대. 상시 버프(패시브)는 줄에 올리지 않는다 |
| 구체 상태가 너무 많음 | "구체 표시가 복잡해 설명을 봐도 헷갈린다" 보도 | [사실·2곳, mein-mmo·gamepressure] | **반면교사**: 구체 위 상태는 3종 이하 |

---

## 6. 제작 파이프라인 (공개 자료가 말한 범위)

- [사실] 2020 공식: **기능·조작 흐름을 먼저 반복하고, 시각 마감은 뒤에** 한다. UI는 시스템이 바뀔 때마다 정기적으로 다시 손본다.
- [사실·1] Diablo IV Lead UI Artist 채용 공고(LinkedIn): Illustrator·Photoshop·After Effects·Figma 사용, 사용성 원칙 이해, 5년 이상 인터랙티브 디자인 경력. → 목업(Figma/Photoshop) → 모션(After Effects) 흐름 [추정].
- [사실·1] D4 시니어 UI 디자이너(Scott Hernandez)의 팬 리디자인 글: 패널 아래에 입력 안내·설명 글 자리를 따로 비워 둔다. PC·콘솔이 같은 클라이언트·같은 UI를 쓰는 통합 조작이 전제.
- [사실] PC와 콘솔이 **한 클라이언트**(D3는 따로였음) — 2023 개발자 대담 요약(커뮤니티) + Del Priore 2023 인터뷰("여러 입력과 플랫폼을 동시에 지원한 것이 가장 자랑스럽다").
- [확인 못 함] 9-slice/트림 방식, 엔진 조립 방식, 해상도 대응의 내부 절차. 공개 GDC 발표도 찾지 못했다.

### 우리 순서 [제안] — v4 관문에 맞춤 (단계별 도구·절차·합격 기준은 §11)
1. **G1 배치도(회색 상자)**: 1920×1080 한 장에 dock 약 971×140, 구체 2개 132, 13칸(52/40), 간격 5. 색 없음. 3840×1080에 같은 상자를 가운데 놓은 판도 같이 → 위치·비례만 판정.
2. **기능 상자 조립**: Unity에서 단색 사각형으로 dock 구조를 먼저 바꾼다(쿨다운 덮개·숫자·자원 부족·버프 줄 동작까지). 실게임 1-1 전투에서 먼 적·발밑이 가려지지 않는지 확인한다(카메라 LOCK).
3. **재질 원화**: 2배 해상도로 틀·구체·칸을 만든다(실버 헬 토큰만). 장식은 구체 테두리에만.
4. **9-slice 분할**: 베이스 판은 가로 3분할(양 끝 장식 고정, 가운데만 늘림), 칸 틀은 크기별 9-slice 원화 1개씩을 재사용, 구체 틀은 통짜 원(늘리지 않음).
5. **엔진 조립**: 현행 IMGUI에 9조각 직접 그리기(§11 S4)와 dock 상대 좌표로 넣는다. 액체는 현행 RenderTexture 머티리얼을 쓴다.
6. **해상도 판정**: 1920×1080·3840×1080 실화면, 1x·3x 크롭, 10초 무음 영상, 웹 정본 HUD 옆 비교판(CLAUDE.md 4.2-4).

---

## 7. "붕 뜨고, 안 맞고, 듬성듬성, 색이 구리다" — 원인 가설과 대응

| 사용자 표현 | 원인 가설 [추정] | 대응 규칙 |
|---|---|---|
| 붕 뜬다 | 구체·슬롯이 각자 화면 앵커를 갖고 바닥선이 다르다. 화면 아래에 붙은 판이 없다 | R1·R2, §1 Unity 2~3 |
| 안 맞는다 | 구체·슬롯·장식 비례가 제각각, 선 두께가 부품마다 다르다 | R4, §2 표 |
| 듬성듬성 | 슬롯 간격이 넓거나 빈 슬롯을 빼서 줄 길이가 변한다 | R4 간격 0.1, R5 |
| 색이 구리다 | 채도 있는 면이 넓다(금·황동·원색), 틀이 내용보다 밝다 | R6·R7, 실버 헬 토큰 |

현행 수치로 본 진단(§2 "현행과의 차이" 표, 10-27 A06 문서 기준):
- 안 맞는다: 구체 틀이 칸보다 7배 크다(236.7 vs 33.3). 위계가 아니라 크기 단절로 읽힌다.
- 듬성듬성: 구체 액체 중심 간격이 882px이다. 칸 13개는 각각 세로로 긴 33×40에 x 간격도 일정하지 않다.
- 1x 가독성: 키 라벨 16.2px로 XAG PC 최소 18px 미만.
- 이 레인은 코드를 고치지 않았다. 그리기 방식(IMGUI `GUIStyle`·`GUI.matrix`, 액체 RenderTexture+`Graphics.Blit`)은 `NativeHud.cs` 헤더만 읽어 확인했다. 10-30 UI 원화 반영(`docs/engine/UNITY_UI_ASSETS_20261030.md`) 이후 값이 바뀌었을 수 있으니 U1이 코드로 다시 잰다.

---

## 8. 충돌·보고

1. **실버 헬 "빨강은 눈에만"(§1·§3) vs 체력 구체 진홍 액체(R7).** 체력 구체는 화면에서 가장 넓은 빨강 면이 된다. 제안: 체력 구체 액체를 실버 헬의 "위험·초점" 범주에 넣는 예외로 명시(`--eye`·`--eye-dp` 계열만 사용, 틀은 은빛). 디자인총괄·CTO 결정 필요.
2. **우리 보호막 파랑**(실버 헬 6.1 손 수정 "보호막 의미라 유지")은 R10과 충돌하지 않는다. 다만 "색만으로" 금지에 맞춰 보호막에 모양(바깥 고리)을 더한다.
3. CLAUDE.md·실버 헬과 다른 옛 문구는 이번 조사에서 새로 찾지 못했다.

---

## 9. 후속

1. Mac Chrome에서 출처 원문(특히 Blizzard News 2020-02, 2023 접근성 블로그) 문장 대조 — "확인한 사실"의 인용 정확도 보강. 이 세션은 본문 접근 불가였다.
2. D4 실화면 1920×1080 사람 측정(구체 지름·슬롯 크기·하단 높이) — 공개 실측이 없으므로, 필요하면 사용자 승인 아래 직접 플레이로. 측정값만 기록, 이미지 반입 금지.
3. Game UI Database D4 항목을 Mac 브라우저로 직접 열어 HUD 상태 화면(쿨다운·자원 부족) 관찰 기록.
4. 다른 레퍼런스(PoE2·노레위·Last Epoch) HUD 공통점 대조 — 한 게임만 따르지 않기(CLAUDE.md 4.1).

---

## 10. 출처 (검색 요약 기준, 날짜는 확인된 것만)

| 출처 | 날짜 | 쓴 곳 |
|---|---|---|
| Blizzard News, Diablo IV Quarterly Update — February 2020 — https://news.blizzard.com/en-gb/article/23308274/diablo-iv-quarterly-updatefebruary-2020 | 2020-02-26 | §1·§3·§6 |
| TechSpot, Blizzard has some UI tweaks for Diablo IV — https://www.techspot.com/news/84193-blizzard-has-ui-tweaks-diablo-iv-including-expanded.html | 2020-02 | §1 |
| Den of Geek, Diablo 4 Updates Include "Gritty" UI and PC Controller Support — https://www.denofgeek.com/games/diablo-4-updates-pc-controller-support | 2020-02 | §1·§3 |
| PC Gamer, Diablo 4 developer update showcases UI changes — https://www.pcgamer.com/diablo-4-developer-update-showcases-ui-changes-and-darker-more-gritty-monsters/ | 2020-02 | §1 |
| mmorpg.com, Diablo IV Quarterly Update Looks at UI Design — https://www.mmorpg.com/news/diablo-iv-quarterly-update-looks-at-ui-design-monster-families-and-more-2000117362 | 2020-02-27 | §1 |
| RPGSite, Diablo IV discusses UI Design — https://www.rpgsite.net/news/9492-diablo-iv-discusses-ui-design-co-op-controller-support-and-cannibals-in-first-quarterly-update | 2020-02 | §1 |
| Blizzard News, Combatting Demons with Accessibility in Diablo IV — https://news.blizzard.com/en-gb/article/23954932/combatting-demons-with-accessibility-in-diablo-iv | 2023 | §4 |
| PCGamesN, Diablo 4 accessibility features — https://www.pcgamesn.com/diablo-4/accessibility-features | 2023 | §4 |
| GameSpot, Diablo 4 accessibility options revealed — https://www.gamespot.com/articles/diablo-4-accessibility-options-revealed/1100-6514358/ | 2023 | §4 |
| Wowhead, Blizzard announces Diablo IV in-game font change — https://www.wowhead.com/diablo-4/fr/news/blizzard-announces-diablo-iv-in-game-font-change-332477 | 2023-04 | §4 |
| gamepressure, This Minor Change Could Make or Break Your Diablo 4 Experience — https://gamepressure.com/newsroom/diablo-4-blizzard-showed-interface-changes-and-divided-players/z154d4 | 2023-04 | §4 |
| Microsoft Learn, XAG 101 Text display — https://learn.microsoft.com/da-dk/gaming/accessibility/xbox-accessibility-guidelines/101 (devdocs.xbox.com 동일) | XAG v3.2 | §4·R8 |
| Microsoft Learn, XAG 102 Contrast — https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/102 | XAG v3.2 | §4·R8·R10 |
| Wowhead, Health Globe User Interface Guide — https://www.wowhead.com/diablo-4/guide/gameplay/health-globe-ui | 시즌 12 | §3·§5 |
| mein-mmo, One of the most important displays in Diablo 4 is so complicated… — https://mein-mmo.de/en/one-of-the-most-important-displays-in-diablo-4-is-so-complicated-that-fans-are-baffled-even-after-the-explanation,1008579 | 2023 | §5 |
| gamepressure, Key Diablo 4 Indicator is Confusing Player — https://www.gamepressure.com/newsroom/key-diablo-4-indicator-is-confusing-player-by-beinbg-too-complica/z45ae9 | 2023 | §5 |
| Icy Veins, Fortify and Barrier Health Visual Explanation — https://wp-prod.icy-veins.com/?p=10196 | 2023 | §5 |
| gamepressure, Diablo 4: Interface — https://www.gamepressure.com/diablo-iv/interface/z0109a5 | 2023 | §1 |
| PC Invasion, What are resource draining effects in Diablo 4 — https://www.pcinvasion.com/what-are-resource-draining-effects-in-diablo-4/ | 2023 | §1 |
| GamesRadar, Diablo 4 lets you disable your character's "out of mana" bark — https://gamesradar.com/psa-diablo-4-lets-you-disable-your-characters-annoying-out-of-mana-bark | 2023 | §5 |
| Wowhead, Devolution of the buff UI in Diablo 4 — https://wowhead.com/news=342546/devolution-of-the-buff-ui-in-diablo-4 | 날짜 미확인 | §5 |
| Last Epoch forum, The UI should display active ability durations — https://forum.lastepoch.com/t/the-ui-should-display-active-ability-durations/73882 | 미확인 | §5 |
| Blizzard D4 forum, The buff and debuff bar needs changes — https://us.forums.blizzard.com/en/d4/t/the-buff-and-debuff-bar-needs-changes/40731 | 미확인 | §5 |
| Blizzard D3 forum, [Diablo IV] UI/UX feedback from a graphic designer — https://us.forums.blizzard.com/en/d3/t/diablo-iv-ui-ux-feedback-from-a-graphic-designer/9549 | 2019~2020 | §2 |
| Blizzard D4 forum, Super-ultrawide 32:9 support — https://us.forums.blizzard.com/en/d4/t/super-ultrawide-329-5120x1440-support/34882 | 미확인 | §1 |
| Evetech, Best Diablo 4 monitor (ultrawide) — https://evezone.evetech.co.za/gear-review/best-diablo-4-monitor-2026-ultrawide-4k | 2026 | §1 |
| LinkedIn, Lead UI Artist – Diablo IV — https://www.linkedin.com/jobs/view/lead-ui-artist-diablo-iv-at-blizzard-entertainment-3496001664 | 2023 | §6 |
| Medium, Diablo Inventory UI Fan Redesign Part II (Scott Hernandez) — https://medium.com/@superscott597/diablo-inventory-ui-fan-redesign-figma-principle-ue4-part-ii-3ba681e2bdf0 | 미확인 | §6 |
| ArtStation Magazine, Diablo IV Concept Art/UI Art Blast — https://magazine.artstation.com/2023/07/blizzard-entertainment-diablo-iv-concept-art-ui-art-blast/ | 2023-07 | §6(UI 아트 담당자 이름만: Juyoung Oh·Doro Kollo·Fernando Forero) |
| 80.lv, Diablo-style health orb shader made with UE5 — https://80.lv/articles/diablo-style-health-orb-shader-made-with-unreal-engine-5 | 미확인 | §3 |
| Aftermath, Game UI Database — https://aftermath.site/game-ui-database | 미확인 | 조사 한계 3 |

---

## 11. 도구·방식 결정안 (CTO 공통 추가, 11-04)

전제: Unity 6000.6.7f1 URP, 현행 HUD는 IMGUI(`NativeHud*.cs`: `GUIStyle`·`GUI.matrix`, 액체 RenderTexture+머티리얼). 판정은 Mac(M5 Pro), PC는 컴파일까지만 한다. 생성 도구 목록은 [API연결_가이드](../../API연결_가이드.md)를 따른다(11-01: 2D는 작업에 맞는 가용 도구, 3D Meshy·Tripo). Figma는 이 프로젝트의 연결·계정 목록에 없다. 비용은 **추가 지출 0원**이 기본이다. 유료 생성은 S2-보조에서만, 승인 범위 안에서 하고 SPEND_LOG에 적는다.

### 요약 표

| 단계 | (a) D4가 쓴 도구·방식(공개 근거) | (b) 우리 후보 → **추천** | 비용 |
|---|---|---|---|
| S1 배치도·목업 | Figma·Illustrator·Photoshop·After Effects(Lead UI Artist 채용 공고 [사실·1]). 기능을 먼저 반복하고 시각 마감은 나중에(2020 공식 [사실]) | HTML/CSS 목업 + headless Chromium 캡처 / Figma → **HTML/CSS** | 0원 |
| S2 원화(틀·구체·판·칸) | 도구 미공개. 아이콘을 회화풍에서 "3D 모델 같은" 직접적인 그림으로 바꿈 [사실] | Blender 모델→정사영 렌더 / 이미지 생성 → **Blender** (이미지 생성은 장식 아이디어 시안에만) | 0원 (시안 생성은 승인 시) |
| S3 슬라이스·트림 | 미공개 | 원화 단계에서 조각별로 렌더 / 큰 판 하나를 렌더해 잘라내기 → **조각별 렌더 + node 트림 스크립트** | 0원 |
| S4 엔진 조립 | 자체 엔진, 미공개. PC·콘솔 한 클라이언트·한 UI [사실] | 현행 IMGUI 유지 / UGUI로 이전 → **IMGUI 유지(v0)**. UI Toolkit은 후보에서 뺀다 | 0원 |
| S5 상태 표현(쿨다운·액체·상태) | 구체 위 보호막 층·쇠 고리·금 [사실]. 쿨다운 방식은 미확인 | 기존 HUD 머티리얼에 파라미터 추가 / 프레임 시퀀스 텍스처 → **머티리얼 파라미터** | 0원 |
| S6 해상도 대응 | PC 기본 하단 가운데·울트라와이드 가운데 모음 [사실] | `GUI.matrix` 높이 배율 + dock 중심 / 비율별 레이아웃 표 → **높이 배율 + dock 중심** | 0원 |
| S7 판정 | — | Mac 공용 실행 경로 캡처 + 비교판 | 0원 |

### S1 배치도·목업 — HTML/CSS 추천
- **이유**: 실버 헬 시안 보드가 이미 HTML로 만들어져 있다(`concept_board.html`). 토큰을 CSS 변수로 그대로 쓰고 §2 수치를 변수 하나씩으로 두면, 숫자를 바꾸는 즉시 다시 캡처된다. Git으로 추적하고 headless로 1920·3840 캡처를 자동으로 뜰 수 있다(무창·무음). Figma는 계정·연결이 없고, 우리 토큰·수치와 따로 놀며, 에이전트가 직접 조작할 수 없다.
- **절차**: ① HTML 한 장에 회색 상자(dock·구체 2·13칸·버프줄·물약)를 그리고 크기·간격은 CSS 변수(`--globe:132px; --slot-a:52px; --slot-b:40px; --gap:5px; --dock-h:74px`)로 둔다. ② 1920×1080과 3840×1080 두 크기로 headless Chromium(`--mute-audio`)으로 캡처한다. ③ 배경에는 Unity 1-1 실화면 캡처(Mac에서 뜬 것)를 깔아, 먼 적·발밑이 HUD에 가려지지 않는지 본다. ④ 회색 상자가 통과하면 같은 파일에 토큰 색을 칠한 2차 목업을 만든다. 산출 PNG는 Git 밖(`I:\EXODUSER-Storage\` 또는 Mac `_out/`)에 두고, HTML만 커밋한다.
- **합격**: 바닥선·구체 중심선·칸 줄 중심선 3개가 일치(±1px). dock 중심이 화면 중심과 ±1px. §2 비례 ±10%. 3840×1080에서 양옆에 아무것도 없음. 1-1 실화면 위에서 HUD 꼭대기가 화면 높이 13% 이하. CTO가 G1 판정.

### S2 원화 — Blender 추천
- **이유**: 구체 틀·칸 틀·판은 **대칭·정원·일정한 선 두께**가 생명이다. 모델링은 이 셋을 정확히 지키고, 은빛 금속의 명암 3~4단계를 조명으로 통제할 수 있다. 2배·3배 해상도로 몇 번이고 다시 렌더할 수 있고 잔점이 생기지 않는다(CLAUDE.md 4.2-7). Mac M5 Pro에서 무료로 돈다. 이미지 생성은 비대칭·잔무늬·디더링 위험이 있고, 9-slice 경계(늘어나는 가운데가 균일해야 함)를 맞출 수 없으며, 같은 부품을 크기별로 일관되게 다시 만들기 어렵다 → **장식 모양 아이디어 시안 2~4장에만** 쓴다(승인·SPEND_LOG, 결과는 블러 구도 참고로만 쓰고 원화로 쓰지 않는다).
- **절차**: ① Blender(Mac)에서 부품별 모델: 구체 틀(토러스 + 가시 32개, 실버 헬 M1 눈 고리 문법), 칸 틀 2종(각진 링, 두께 2px 상당), 베이스 판(왼쪽 끝·가운데·오른쪽 끝 3조각). ② 카메라는 정사영, 정면. 렌더 해상도 = 표시 크기 ×2(구체 264², 칸 104²·80², 판 끝 조각 각 2× 원래 폭, 가운데 조각 8px 폭). ③ 렌더 엔진 Eevee, 색 관리 **Standard**(AgX·Filmic 끔 — 토큰 색이 틀어지지 않게), 배경 투명(RGBA PNG). ④ 재질: Principled, Metallic 1, Roughness .35~.5, Base `#8a8b88`. 그늘 쪽 명도가 `--sv-dk`~`--sv-dp`에 오도록 조명 세기를 맞춘다. ⑤ 조명: 위 왼쪽 키 1개 + 뒤 림 1개. 위쪽 모서리에만 `--sv-lt` 하이라이트가 서게 한다. ⑥ 샘플을 충분히 두고, 그레인이 남으면 디노이즈 대신 샘플을 올린다. ⑦ 빨강은 원화에 넣지 않는다(눈동자·위험은 엔진에서 따로 그린다). .blend 파일과 렌더 설정은 Git(LFS 규칙에 맞게) 또는 Storage에 두고 경로를 문서에 남긴다.
- **합격**: 3x 크롭에서 점 0. 토큰 색 대비 ±4(8비트). 1x에서 구체·칸·판의 실루엣이 구분된다. 웹 정본 HUD 옆 비교판에서 "같은 게임"으로 읽힌다(Mac·CTO). 두 번 연속 같은 결함으로 FAIL이면 방법을 바꾼다(CLAUDE.md 4.1).

### S3 슬라이스·트림 — 조각별 렌더 + node 트림 추천
- **이유**: 처음부터 조각으로 렌더하면 9-slice 경계에서 이음새가 생기지 않는다. 큰 판 하나를 잘라 내면 가운데 조각에 조명 그라데이션이 남아, 늘렸을 때 얼룩이 된다.
- **절차**: ① 판 가운데 조각은 가로 방향으로 균일해야 한다(조명이 가로로 변하지 않게 렌더). ② 칸 틀은 9-slice 테두리를 원화 기준 24px(표시 12px)로 둔다. ③ node 스크립트(파일로 저장해 실행, `C:\nvm4w\nodejs\node.exe` / Mac node)로 투명 여백을 자르되 2px bleed를 남긴다. 원화 크기·border 값을 JSON 한 장에 기록한다. ④ python은 쓰지 않는다.
- **합격**: 칸 틀을 40·52px로, 판을 900~1000px로 늘렸을 때 이음새·얼룩 0(3x 크롭). border 값 JSON과 실제 원화가 일치.

### S4 엔진 조립 — IMGUI 유지(v0) 추천
- **비교**:

| 기준 | 현행 IMGUI 유지 | UGUI(Canvas)로 이전 | UI Toolkit |
|---|---|---|---|
| 사용자 불만 4가지(붕뜸·비례·듬성·색) 해결 | 된다 — 넷 다 좌표·비례·원화 문제이고, 그리는 방식 문제가 아니다 | 된다 | 된다 |
| 기존 자산 | 13칸 hit rect·클릭·`HudPixelProbe`·hud-blend-smoke 55항·720p 배율을 그대로 쓴다 | 클릭·QA 프로브·스모크를 다시 써야 한다. 다른 화면(일시정지·사망)은 IMGUI라 두 체계가 공존한다 | UGUI와 같은 문제에 더해, 액체 머티리얼 연결 방식이 다르다 |
| 글자 1x 품질 | 동적 Font. 그림자는 두 번 그리기로 만든다 | TMP SDF Underlay가 더 깨끗하다 | 좋다 |
| 9-slice | 9조각 직접 그리기(`GUIStyle.border`는 2배 원화에 맞지 않음, 아래 반입 설정) | Image Sliced | `-unity-slice-*` |
| 위험 | 낮음 | 데모 v0 일정 안에서 회귀 위험이 크다 | 높음 |

- **결정**: v0는 **IMGUI 유지**. 그리기 방식을 바꾸지 않고 `NativeHudDockLayout` 수치·dock 상대 좌표·원화만 바꾼다. 글자 그림자가 1x에서 부족하면 그때(v0 뒤) HUD 글자만 TMP/UGUI로 옮기는 안을 따로 판정한다. UI Toolkit은 기존 구조와 셰이더 연결이 가장 멀어 제외한다.
- **반입 설정(IMGUI용 Texture2D)**: Texture Type Default(IMGUI는 Sprite가 필요 없음), sRGB 켬, Alpha Is Transparency 켬, Mipmap 끔, Filter Bilinear, Wrap Clamp, Compression None(또는 Mac 판정에서 차이가 없으면 High Quality), Max Size ≥ 원화. 원화가 2배이므로 논리 크기로 축소해 그린다. 주의: IMGUI `GUIStyle.border`는 텍스처 px 값을 화면(GUI 논리) 모서리 크기로도 그대로 쓰기 때문에, 2배 원화에 border 24를 넣으면 모서리가 2배 굵게 그려진다. 그래서 9-slice는 **9조각을 `GUI.DrawTextureWithTexCoords`로 직접 그리는 작은 함수 하나**로 만든다(텍스처 좌표는 원화 px 24, 화면 모서리는 논리 px 12). 이 방법이 맞는지는 U1이 첫 조립 때 1x·3x 크롭으로 확정하고 이 문서를 고친다.
- **합격**: PC 참조 컴파일 오류 0. Mac 빌드에서 hud-blend-smoke 기하 검사를 새 좌표로 갱신해 PASS(검사를 완화해서 PASS로 만들지 않는다). 13칸 클릭 hit rect가 그려진 칸과 일치.

### S5 상태 표현 — 머티리얼 파라미터 추천
- **이유**: 액체가 이미 RenderTexture+머티리얼 경로라 같은 머티리얼에 채움·물결·보호막 층 값을 더하면 된다. 프레임 시퀀스(예: 쿨다운 36장)는 텍스처가 늘고 단계가 끊겨 보인다.
- **절차**: ① 쿨다운: 칸 크기 사각형에 각도 파라미터 하나(0~1)로 12시부터 시계 방향으로 걷히는 덮개(검정 .55)를 그린다. IMGUI에서는 Repaint 이벤트에서 `Graphics.DrawTexture(rect, tex, mat)`로 그린다. 숫자는 그 위 `GUIStyle`. ② 준비 섬광: 테두리 알파 1→0, 200ms. ③ 자원 부족: 아이콘 그리기 색 `GUI.color`를 회색(채도 0 근사, 밝기 .5)으로. 비용 숫자는 `--eye`. ④ 보호막: 기존 shield RenderTexture 위에 바깥 고리 하나를 더한다(색 + 모양). ⑤ 수치는 Core에서 읽기만 한다(쿨다운·비용 값 변경 0).
- **합격**: 10초 무음 영상에서 쿨다운이 시계 방향으로 끊김 없이 걷힌다. 숫자 1x 판독. 회색 처리만으로도 자원 부족이 구분된다(색맹 필터 없이 명도만으로).

### S6 해상도 대응 — 높이 배율 + dock 중심 추천
- **절차**: ① 배율 = `Screen.height / 1080`(현행 유지). ② dock 가로 중심 = `Screen.width / 2 / 배율`. ③ 1280×720·1920×1080·2560×1080·3840×1080·3840×2160을 확인한다.
- **합격**: 모든 크기에서 dock 중심이 ±1 논리 px. 21:9·32:9에서 HUD 폭이 1920 때와 같은 논리 px. 720p에서 키 라벨 실제 12px 이상.

### S7 판정
- Mac에서 공용 실행 경로로 빌드·캡처한다(창 0·소리 0, CLAUDE.md 3.3). 1920×1080·3840×1080, 1x·3x 크롭, 10초 무음 영상. 비교판은 웹 정본 HUD 옆에 같은 크기로 놓는다. D4 화면은 반입하지 않으므로 D4와는 §0·§2의 측정 원리로만 대조한다.
- 완료 보고는 CLAUDE.md 4.2-5 문구 규칙대로 쓴다(디자인 미검수면 "기능만 완료").

### 일정 감 [추정]
S1 0.5일 → S2 1~2일(부품 4종) → S3 0.5일 → S4 1일 → S5 1일 → S6·S7 0.5일. 합계 4.5~5.5일, 추가 지출 0원.
