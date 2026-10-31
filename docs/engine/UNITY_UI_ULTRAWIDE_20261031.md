# Unity 초광폭의 화면 가장자리와 중앙 UI — 2026-10-31

## 2026-10-31 확장 지시 적용 — 현행, Player 재검수 대기

이 절이 이전의 모든 UI를 안전영역에 넣는 설명과 순검정 외곽 규격보다 우선한다. 사용자 ui-ultrawide-brief의 가장자리/중앙 구분과 sidepanel-edge, 스킬 창, 성장/메달, 로딩 인계를 따른다. 현재 독립 컴파일 결과와 정식 Player 검수는 별도이며 공통 반영·Desktop 완료 전에는 전달 완료가 아니다.

| 구분 / 적용 위치 | 현재 코드 계약 |
|---|---|
| 중앙 | NativeUiSafeArea.Fit(W,H), s=min(W/1920,H/1080), 원점((W−1920s)/2,(H−1080s)/2). 무대·제목·모달·HP/MP/ST 구슬·중앙 13슬롯은 논리1920×1080 유지 |
| 가장자리 | NativeUiEdgeArea.Fit(W,H), e=H/1080, 논리폭 W/e. EdgeMatrix는 원점0, RightMatrix는 논리1920의 오른쪽을 실제 화면 오른쪽에 정렬. 로비560·캐릭터420·미니맵·SP/CP·레벨/처치·일반 알림·실습 안내의 폭과 글자는 높이에 비례 |
| 배경 / 키아트 | 로비 환경 전체는 비율 유지 cover. 캐릭터/타이틀 인물은 중앙 contain, 바깥은 직업별 동일 정지 원화의 어두운 블러로 확장. 캐릭터 오른쪽 어둠480은 실제 가장자리의 투명→검정alpha0.66 선형 그라데이션만 사용, 로비560. 캐릭터 전체 가로 비네트(18%/64%/84%)를 제거하고 기존 하단30%/alpha0.72 세로 비네트는 유지. 타이틀도 전체 세로/외곽 비네트와 왼쪽 가로 판 음영을 분리해, 가로 음영은 실제 왼쪽720 논리폭에만 적용. 판 뒤 어둠은 해당 고정폭에 한정. 영상·PNG를 가로 늘이기하지 않음 |
| 포인터 | 중앙 포인터는 기존 원점/s 역변환, 가장자리 포인터는 x/e,(H−y)/e. 한국어5해상도 WM 실제 생성 클릭도 RightMatrix의 물리 좌표와 동일 |
| 상태 / 실습 | 미니맵(8,8,141.1,141.1), 자원(16,188,108,58.3), 레벨/처치(오른쪽20,위16,216×153.39). 실습 중에도 상태판 표시. 안내의 실제 Panel 외곽(실습 outset8 포함) 상단은 상태판 아래16, 하단은 실제 HP/MP 프레임 위16. 실습 폭400·오른쪽56, 내용만 스크롤·시작/건너뛰기/진행선 푸터 고정 |
| 초기4장 안내 | 중앙 패널도 outset24 테두리까지 포함해 상태판·구슬 프레임 사이16 공간 예약. 전체 안내 그라데이션은 물리 화면을 덮고 중앙 박스만 안전영역. 내용 스크롤, 아래86px 푸터 고정, 패널 밖 클릭은 진행하지 않음. 보호막·커튼·월드는 기존 흐름 유지 |
| 공통 제목 | 다섯 창 모두 높이64, 승인 title_eye_medallion_20261031 256×256 RGBA를40×40, 아래24px 글자/Hahmlet300 22px(긴 글자 최소16), 금빛 선의 중앙±26 단절. 기존 큰 투구/제목 적층 제거 |
| 성장 | Viewport(271,136,1174,805), 기존(271,317,1174,624)에서181px 반환. 분석 내용(1489,198,372,597.2), 기존379/416.2 대비181px 확대. 중복 큰 눈/붉은 바늘 배경 제거, 단일 제목 메달. AP 표시24px이며 미이식 상태를 실제 잔고로 만들지 않음 |
| 대장간 | 중복 큰 눈 배경을 제거하고 기존 원화 외곽을 보존. 본문은117px 위로, GridView 높이570→687, 카테고리는 같은 내용 시작선에 배치 |
| 설정 / 인벤토리 | 설정 본문 Y196/H787로60px 확보, 탭Y153. 인벤 제목은 중앙64px, 전투력 왼쪽/악의 값 오른쪽 유지. 전체 창은 중앙 안전영역 |
| 스킬 | 설명판 실제 왼쪽24·폭270·패딩16·제목23·본문15, 실제 설명 높이 바로 아래 강화/SP. 합성 계열 없으면 오른쪽 로드맵 생략. 초광폭 중앙 최대1800, 슬롯 줄 중앙. 13기존 슬롯+구르기/X처형/T자동석궁=16표시. 구르기·처형 고정/교체불가, 나머지 전용과 구분. 실제 장착 기술명·KeyBindings 표시. RMB=마법, E=칼등 처내기 아이콘 정정. Space/Z 미장착은 실제 습득 필요/장착 필요이며 Lv50 슬롯 잠금 신설0 |
| 로딩 실제 목록 | 이미지 정본 f3086ea61f4215ada6365655ba974ece0469eb36의19×3 무손실 반입은 이력. 후속 사용자 폐기 afcb65b0aac2a7e52bba915c83e5ba29d707a5e6대로13·14·17을 제외하여 현행16원본+48확장=64로딩PNG, 메달/소켓/부츠/석궁/로고7까지 총71PNG. 폐기3종 자기 반입12PNG/24경로는 I:SHA보관 후 런타임에서 제거, 웹 원본/확장판은 보존. 기존 manifest·보호RGB·decodedRGBA 증거는 보존하며 활성48판에 적용 |
| 로딩 선택 / 구도 | W/H>2560/1080이면32, >1920/1080이면21, 그 외16. 승인 확장판은 전체 화면 cover하되 원래 보호 피사체 영역을 유지. 누락만 동일 원본 블러 밝기.28+전체 contain. 실제 없는 리소스를 요청해 폴백 검사 |
| 로딩 상태 | 전체 높이 원화 위 하단 clamp(150px,22vh,300px), rgba(5,5,6,0)→.32@35%→.78 그라데이션. 상단여백 clamp(44px,7vh,96px), 하단 clamp(18px,3vh,44px), 뼈색 제목400 clamp(16px,2.1vh,26px)/1.5·자간.12em, 층정보400 clamp(11px,1.35vh,17px)/1.4·자간.08em, 실제 항목을 하단 정렬·8px 간격, 금빛 진행선1px·폭min(32vh,80vw). 전환 callback/LoadPhase/시간 변경0 |
| 실제 컴포넌트 검사 | 감사기의 실제 OnGUI 변환 후 frontend-right/shade, hud-minimap/objective/hp-frame/mp-frame/skills, startup-guide/practice-panel/guide-frame/content/footer, loading-art/source-canvas/status/title, frontend-subject-canvas, common-title 경계를 기록. 글자 검사와 별도로 가장자리 앵커·중앙 정렬·안내/구슬/상태판 충돌 검사 |
| 새 캡처 목표 | 공통76상태×5해상도×ko/de/fr=1140 + 한국어 전환원화16종/확장실패1종×5=85, 합1225 PNG(실제 최장 언어 선택 결과가3언어일 때). 5해상도는1920×1080,2560×1080,3840×1080,1600×900,2560×1600. 보관함/봉안함/결정체·대장간6탭·일반알림·부활·사망·지역유도8방향·지역진입/정화 배너·시네마틱 재생/언어/일시정지·신규 연출/대사완료도 포함. 기존 전투 펫 대화는 Unity 런타임에 경로가 없어 웹 전투 펫 완료로 확대하지 않으며, 실제 구현된 사망 펫 대화는 사망 화면에서 검수. 이전480장은 변경 전 이력 |
| 보호 / 검증 경계 | Core 투사체·적 가시/리시의 선택 callback 경계5파일만 아래 월드 계약대로 변경. 전투 수치·저장 형식 변경0. 미이식 고정기술·성장 상태는 이 UI 변경으로 이식 완료가 되지 않음. 기존 미채택3D 무대·원본520WIP는 보존하며 순수 후보에서 제외. 정식 -remodel-scenes 1 빌드→동일 빌드 M1→PNG/1x/웹 비교→MERGE_QUEUE→unity/main 비강제 병합→Desktop 순서 유지 |

웹 비교 기준은 기존3f19b0b·월드9780db0c·불투명로고7dc96cd·최종35장 로딩을 포함한 이미지 정본 f3086ea61f4215ada6365655ba974ece0469eb36 및 후속 폐기 목록 afcb65b0aac2a7e52bba915c83e5ba29d707a5e6을 구분한다. 실제 UI 웹 비교는 afcb65b0a로 동결하며 이후 선택형Web3D/전투표현 변경은 본 Unity UI 이식 범위가 아니다. 초기31파일 반입 영수증과 신규 로고 영수증은 I:/EXODUSER-Storage/demo-art/unity-ui/ultrawide/에 보존한다. 최종로딩_반입영수증.json의 최초57판 decoded 픽셀 동일/현재 활성48판 부분집합 확인은 Player 화면 검수를 대신하지 않는다.

직업5종+세계관+타이틀+FDG=8종×해상도5×실제 선택언어의 영상은 VideoPlayer 준비·실제Texture 규격·파일명·0.35초 전후 프레임 진행과 isPlaying을 따로 기록한다. 정지 포스터로 동영상 재생을 대신하지 않는다. 화면 캡처 제한시간은1800초이며 기존 고정 실행기 파일은 변경하지 않는다.

분석 보고서는 프레임을 하나씩 읽고 전체 원소/가림/교차 근거를 JSON에 순차 기록하며, 요약만 overlap-summary.json에 둔다. 전체1225장을 배열에 누적하지 않는다. 지역 배너의 실제 검정 그림자(radius5/dy4)는 명시 region-banner-black-shadow일 때만 최대alpha0.064·본문반경9.2s로 연결한다. 일반 CP 광휘의alpha0.03/5.5s 및 다른 글자/일반 중복 검출은 그대로다. 이 계측은 배너 실제 픽셀/호출/알파를 바꾸지 않는다. 새 그림자 회귀7건을 포함한 보고서 순차 기록1건을 포함한 폐기 목록 검증을 포함한 분석 회귀44건 PASS.

## 인게임 월드 초광폭 — 실제 Player 검수 대기

| 항목 | 구현·검수 계약 |
|---|---|
| 카메라 | 실제 HudCamera를 사용. 3D 카메라 세로FOV46.9453·pitch48.7014·distance14·lookAhead1.45 보존, rect전체·RT없음·가로 시야 확대를 4해상도에서 계측. 월드에 중앙 UI 마스크 적용0 |
| 적 사격 / 루팅 | FieldEnemyCanShoot는 실제 2D/3D 카메라에 Core64px 사방을 투영하여 네 모서리가 모두 안일 때 허용. IsLootOnScreen은 동일 카메라0margin. 사격·어그로·수거 거리 규칙 수치 변경0 |
| 일반 적 활성 / 리시 | Simulation.EnemyAi의 고정1600×900 기본 컬링을 실제 카메라 callback으로 대체. EnemyTickContext.WorldPointVisible은 null이면 원래 직사각형. 시야 여유300, 보스/피격/돌진 commit/30px 예외와 AI 거리/티어 유지. 리시2500px 밖의800~1200 후보가 실제 화면 R+100에 보이면 이동하지 않으며 기존 난수2회는 먼저 소비. 소환굴은 화면 기반이 아니라 기존2000px 거리 트리거라 변경0. EnemyHurt의 전역1e6 넉백 문맥도 변경0 |
| 일반 투사체 | DruidBoss.WorldPointVisible 선택 callback, null이면 기존 로직. Life<=0일 때 기존 거리제곱6250000 밖이어도 실제 화면과 R+100px 영역이 겹치면 Life=1로 유지. 화면 밖/강제만료Life<=−900은 기존 정리. 지뢰·빨콩 별도 수명 그대로 |
| 2D 청크 | camera Core중심의 floor(x/1000),floor(y/1000), radiusX=max(2,ceil(halfWidth/1000)), radiusY=max(1,ceil(halfHeight/1000)). 기존1920 기본 반경2/1 유지, 확대/광폭 화면의 보이는 청크를 보존 |
| 월드 피해 글자 | NativeFloatingTextLayout.SetHorizontalBounds는 기본8..1912를 보존하며 실제 실행은 ScreenInDesign의 좌우+8/−8을 전달. 중앙으로 끌어오지 않고 기존 사건 반경·집계·수명·세로128..864 유지. 실제 가장자리 미니맵/자원/상태판·실습·알림을 중앙 논리좌표로 역변환해 공간 예약. 1920 기본 좌표 동일·광폭 양쪽 표시·화면 밖 미표시·실제 상태판 회피 회귀 포함 |
| 지역 방향표시 | NativeRegionHud.Safe.screen은 실제 물리 화면의 중앙 논리 좌표. 대상이 실제 화면 안이면 숨김. 회전96px 원화·18px소스 패딩 글로우·실측 두줄 라벨을 합친 footprint 전체가 화면24px/하단 구슬장식12px 및 실제 미니맵/자원/상태/시계/알림12px 밖인 가장 가까운 후보를 선택. 기준점만 밀었다가 다시 clamp해 패널 안으로 돌아오던 경로 제거. 3비율×8방향과 기존 글자 배치 총96검사 PASS, 실제 Player8방향×5×3언어는 대기 |
| Core 회귀 | 실제 UpdateProjectiles RED→GREEN 및 4비율×3zoom×5X×3Y 청크 포함 검사 총2373 PASS. 기본 null/offscreen 동작·2500 정확 경계·지뢰/빨콩/강제수명·실제 Simulation callback 연결·광폭 가시 적 활성·화면 안 리시 거부/난수순서 검사 |
| 기존 원문 oracle | 저장된2acaa1b8 원문1240케이스는 승인 공통15c8ed3c와 현재 모두3,261,210검사/889실패(_tellS 기본0/undefined 등), 기록된 실패/통과 표본 동일. 기존 원문 전수PASS로 주장하지 않음. 새 callback 실제동작2373검사와 별도이며 I:기존oracle_공통대조.json 보존 |
| 전체 맵 의존 | 공통 기존 RM1 지형은 원본200² 중 일부 범위뿐임을 확인. A2 R3 전체80×80u가 담당 검수·공통 인수 전 NOT_READY이므로 미검수 후보 직접 채택0. 지형/충돌/장식 WIP 수정0 |
| 실화면 목표 | 1920×1080·2560×1080·3840×1080·2560×1600의 시작/초반/전투/좌측/우측/랜드마크/후반/보스앞32장과 가로·세로 이동24장(합56). 카메라 실제 viewport/픽셀Rect/FOV/지면범위·보행가능 위치 기록. 추가5위치의 명목 좌표는 기존 A2 field-screen fixture의 QA 위치만 참고했으며 미검수 지형/제품 로직 반입이 아니다. 원래 지정3위치×4의 웹 동일크기 비교는 별도로 유지. 가로/세로는360틱(60Hz 시뮬레이션6초, PNG대기 등의 실경과는 별도)·120틱 간격3장씩이며 실제 이동40px 이상과 Core1000px 청크 경계1개 이상 통과를 요구. 3D 지형 자체의 이음 판정은 같은 PNG의1x 직접검수와 구분. 모든 시각 캡처 뒤1920/3840은 실제 SourceStarterFixture seed·적32 초기 ID/종류/HP/좌표/크기/속도/방향/상태틱 직렬화/SHA 동일·종료32 유지·필드보스/소환굴/자동석궁 격리·4초·직접60Hz 입력 표본 FPS, 자연 플레이/장시간 보증과 별도 |
| 픽셀 증거 한계 | 동일 결합 후보의1920의 같은8위치 렌더 반복/viewport 유지 비교와 실제 비검정 픽셀/최대채널을 기록. 과거 다른 빌드와의 변경픽셀0 증거로 확대하지 않음. 최종 비교 범위는 실제 영수증 기준 |
| 로고 | 승인7dc96cd의logo_exoduser_solid.png(1506×719), SHA256167e8465a0aec6fa5e8cd90131f203a86a27dccca2aa913a317cffe93c7d413d. 원본 보존·일반 alpha blend·비율/높이 기준. gate/메뉴/로비/로딩의 경로 통일. 영상 합성 로고는 별도 |

## 이전 중앙 안전영역 후보·검수 이력 — 현행 전달 근거 아님

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

공식 실행기 후속(08시대 UTC): A2 D3D12 장치제거/Editor 종료 보고에 따라 start 전용 ForceD3D11 선택 인수를 추가했다. 생략 시 graphics 빈 배열, 명시 시 -force-d3d11 한 개이며 실제 -File DryRun 두 건 exit0. Acquire-Slot 구간/QueueTurn byte 불변. 기존14인수/15예약 재실행 명령은 spawn EPERM으로 미실행이며 이전 통과 이력과 구분한다. 실제 GPU 실행 성공은 각 담당이 따로 검수한다. 실행기 새 안정 경계는 I:실행기_안정경계.json.

로딩 순환 선택: NativeLoadingSelection의1,2,3,4,5,6,7,8,9,10,11,12,15,16,18,19만 사용. Native StageIndex는 이16장 배열을 순환하고 Picture에도 동일 허용 목록을 적용한다. 전투/Core 난수·전환 시간 변경0. 실제 캡처 목록도 같은 C# 목록을 기록하며 분석기는 승인16개와 정확 일치를 요구한다. 좌표240+선택181=421 C#검사 PASS. 최초 NuGet환경 실패/기존dotnet run 출력경로 실패는 따로 보존했으며, 실제 I:생성DLL 직접실행으로 확인했다.

### 월드 검수 fixture 수치 — 게임 수치 변경과 구분

|카메라/표본|명목 Core 좌표 또는 조건|
|---|---|
|시작|Map.Data.startX/startY, 실제 보행 가능 후보를 기록|
|초반|3500,6250|
|전투|4020,4820, 실제 적32/실제 공격 입력8틱|
|좌측 / 우측|2200,4400 / 6500,4400|
|랜드마크 / 후반 / 보스 앞|4600,3500 / 4000,1850 / 4020,620|
|보행 후보|현재 player.Radius로 CanMove, 실패 시24고리×20px/16방향(π/8), 최대480px에서 검색|
|포즈 안정|입력 없는6틱과0.35초, actual PNG/OnGUI 수집의0.18초 대기. 8위치×4해상도32장|
|동일32적|최대256시도, 각도n×2.399963, 반경180+(n%8)×36, etype=n%4, CanMove 반경20. 부족하면 FAIL|
|이동|수평 왼쪽/수직 위360틱,120/240/360틱에 각3장. 최소40px·Core1000 청크 경계1개 이상. 총24장|
|성능|같은 SourceStarterFixture.Seed/초기32적 서명, warm1초 후4초, 직접60Hz 누적입력, 적 종료32, VSync0/targetFrameRate−1. 필드보스·소환굴·자동석궁 제외, 무적1000000. 자연플레이 성능과 구분|
|픽셀|1920의8위치에서 같은 프레임 RT reference/self/current 각3장=24raw PNG. RGBA 변경0·self0·비검정1000픽셀 초과·최대채널16초과 필요. 과거 다른 빌드와 동일 주장0|
|추가 UI fixture|실제8방향 유도 투영, 지역진입/정화 배너 age1, 사망 age3·fallen180. 모두 상태전환/시계 QA이며 자연플레이가 아님|
|직업 영상|8종×5해상도×선택언어(3언어이면120기록), 준비10초 한도·0.35초 전후 프레임 진행·isPlaying/Texture 규격 기록|

검수 예외 종료도 부분 coverage/월드영수증을 보존하고, 자기 미디어/오디오를 닫아1초 drain 후 exit2로 실패한다. 전체 완료/누락 조건을 완화하지 않는다.

### 시네마틱 실제 모서리 — 최신

|항목|현재 계약|
|---|---|
|영상/자막|중앙16:9. 바깥 미디어 마스킹은 조작부를 그리기 전에만 수행하여 실제 가장자리 조작부를 덮지 않음. FDG 브랜드는 기존 중앙 마감 유지|
|언어/목록|RightMatrix, 논리 trigger(1683.2,32.4,160,29): 실제 오른쪽76.8e·위32.4e. 목록도 같은 실제 오른쪽 좌표계|
|건너뛰기|RightMatrix, 원 중심(1830,990), 반경34/선3. 원·두줄 라벨 전체 Rect(1770,954.5,120,95.5), 실제 오른쪽/아래30e|
|일시정지/오류 재생|EdgeMatrix, Rect(28,26,240,48). 오류 문구(28,86,1300,100), 실제 왼쪽 위. 자막은 계속 중앙|
|신규 연출|미디어/자막 중앙 마감 후 RightMatrix hint(1300,1032,600,24), 진행선(1780,1052,120,3). 실제 오른쪽20e/아래24e|
|실제 검수 상태|StartGate/TogglePlayback/언어 Toggle 제품 API, 현재 언어에서 가장 긴 실제 cue를 start+offset0.4+min(0.5,duration×0.25)로 seek. 준비10초·진행0.35초/실제 캡션 기록. 자연 재생/완주 증거와 구분|
|신규 연출 캡처|실제 BeginCharacterEntry(false)로 Nemesis 상태 확인 후1초에 OnGUI/PNG 수집. 정지 원화 교체나 문자열 주입0|

대사 완료 표식은 대사 오른쪽 Rect(1794,min(984,1080−subH×0.2),40,30)에 둔다. 본문 오른쪽1766.4와27.6px를 비우고, 건너뛰기 hint 위18px 이상을 확보한다. 원래 x1740/하단 위치가16:9에서 hint와 같은 공간을 쓰던 경로를 분리했다. 제품의0.5초 blink 주기는 유지하고 검수에만 ForceStartupContinue=true로 완료 표식을 고정한다. 신규연출완료는 실제 Advance API로 전문 표시 후1초 안정·실제 본문/표식/hint 컴포넌트 교차0을 요구한다.

### 장시간 캡처의 입력 소유권

UI/월드 캡처 coverage가 생성된 동안 NativeGame.Update는 UiOverlapOwnsInput을 보존해 AutomatedInput을 매 프레임 유지한다. 자기 PID UnityWndClass의 WM Down/Up 역변환 표본(.12초 누름/.2초 해제 대기) 동안만 overlapPhysicalClick으로 입력을 열고 finally에서 회수한다. BeginCharacterEntry(false)는 정상 신규 입장 API가 검수 shortcut으로 빠지지 않도록 호출 순간에만 AutomatedInput=false로 두며, 호출 직후 true로 복귀해 실제 상태의 Tick/재생과 검수 API 전환만 진행한다. 일반 플레이는 coverage=null로 기존 입력 규칙이 같다. 실제 5해상도 클릭과 신규 Loading→Nemesis→Guide, 시네마틱은 새 동일 Player에서 확인한다.

각 실제 Repaint 저장 직전 UiOverlapOwnsInput·AutomatedInput을 확인하며, 입력 소유권이 없으면 해당 캡처를 실패시킨다. coverage.inputIsolationChecks는 실제 PNG frame 수와 같아야 한다. 월드 전용 검수는 lobby 비활성 상태이므로 UI 입력 카운트 조건에서 제외한다.

### URP 원시 픽셀 비교 경로

1920 여덟 위치의 reference/self/current는 실제 프레임 렌더 종료(WaitForEndOfFrame) 뒤 URP SingleCameraRequest(destination=1920×1080 RenderTexture)와 RenderPipeline.SubmitRenderRequest로 동기 렌더한다. SupportsRenderRequest가 false면 실패이며 빈 타깃끼리 일치를 통과시키지 않는다. 이후 ReadPixels/PNG를 보존하고 targetTexture·RenderTexture.active·camera.rect를 원복한다. 본편 상시 카메라/렌더 코드는 변경하지 않는다. 설치 URP ffe395a3a1d1 UniversalRenderPipeline.cs의 IsRenderRequestSupported/ProcessRenderRequests와 [Unity 공식 사용법](https://docs.unity.com/en-us/engine/6000.0/manual/cameras/urp/multiple/user-render-requests)을 대조했다. 실제 픽셀0·비검정 렌더 검수는 새 Player에서 별도다.

### 빌드 입력의 후보 밖 코드 차단

현재 디스크와 후보 Git tree의 Unity 파일을 전수 대조한 뒤, Assets/Packages/ProjectSettings에서 현재 HEAD tracked 파일·미추적 파일도 후보 밖에 남아 있지 않은지 검사한다. Assets 아래 실제 .cs/.shader/.compute/.hlsl/.cginc/.asmdef/.asmref도 별도로 스캔해 gitignore 여부에 기대지 않는다. 새 확인 영수증은 extraHeadTracked/extraUntracked/extraCompiled/influencingExtras가 모두0이며 passed=true여야 한다. 기존 브랜치에서만 tracked인 미채택 NativeLobby.CharacterStage.cs 한 파일을 원본byte로 잠시 둔 실제 음성 표본에서 구 검사 exit0(누락)→신 검사 exit1(차단)을 확인했다. 표본은 SHA보관 후 정확히 회수했고, 순수 입력3454파일·후보 밖0으로 재확인했다. 이 검사는 자기 Unity/Player를 실행하지 않는다. Source별 실제 개수는 최신 source-input.json을 따른다.

| 입력 안전 항목 | 확인 경계 |
|---|---|
| Git tree·실제 디스크 | Assets뿐 아니라 Packages/ProjectSettings/Tools 포함 Unity tracked 파일 전체 byte 대조 |
| 후보 밖 compiled 입력 | 기존 HEAD tracked·미추적·실제 소스 파일 스캔의 합집합을 실패 처리 |
| 원본 WIP | 초기520 tracked·56미추적을 별도 보존. 최초격리60 중4개는 이번 작업 신규 safearea/viewport cs/meta |
| 최신공통 뒤 복원 | 구 restore-input5는 사용 차단. 원본 브랜치 정상병합과 원 WIP 정확byte 복원으로 승인공통 신규파일 유지 |
| 독립 컴파일 | 최신 전체 Runtime 신규 partial/검수 파일도 실제 플레이어 RSP 입력에 포함. 정식 Unity build/Player 증거와 분리 |


## 2026-10-31 R5 순수맵과 동일 Player 기술 공동검수

|항목|계약|
|---|---|
|인수|맵 SourceReady `1a3d758352fb10b6facace12a61a64253b7a9e76`, 최신 승인공통 `19c6ccec8f7056acdc554b45de72d43a78c12ec6` 조상. release READY와 구분|
|범위|정확633 Unity/검수 입력 + 맵SSOT5. 제작도구84·미인수 StageClear/Devtools 문서2는 결합 후보에서 제외. 기존 상속UI/실행기 반입0|
|정상 결합|UI54b680a24와 맵1a3d75835의 두 부모 병합. NativeGame legacyFixture 단일 충돌은 `--unity-world-ultrawide-check`와 A2Requested의 Editor/Steam keyshot/field-screen 조건을 함께 유지|
|검수|한 번의 `-remodel-scenes 1` 빌드 → 같은 EXE 무창M1 → 맵 `--unity-field-screen --remodel3d` 기본8곳+거목 재현3곳×2해상도22장/실제필드-메시검수.json → UI76상태×5해상도×선택언어 → 월드56장/1920 raw24장/동일32적4초FPS → 웹1x. 실제 순서는 실행 영수증 참조|
|판정|SourceReady는 기술검수 허용만 의미한다. R4 Editor FAIL을 R5 Player에 소급하지 않으며 실제 같은 EXE 맵 담당 검토 뒤 공통/Desktop 채택 판단|
|보존|원본38 브랜치는 미채택 캐릭터 시안이 있어 공통 전체병합 금지. 최종 원본복원은 정상2부모 병합+자기 초기UI 충돌의 최종후보 해소+원본 전용 시안/두 hook 보존+520 WIP/56 미추적 정확byte 복원을 사용. 구 복원기 차단 유지|

맵 담당 요청 재현 좌표는 Core `(4790.811,7142.689)`, `(3320,7500)`, `(3320,7000)`이다. 같은 `--unity-field-screen` Player에서 기존8곳 뒤에 추가하고 정상 프레임 수를22로 검증한다. 일반 게임·56장 월드 검수 좌표는 바뀌지 않는다.


## 실제 Player RED: 직업 모달 공유 영상 소유권

|항목|확인/변경|
|---|---|
|실패|9ff/Runtime93cc86d75 실제2560×1600 ko 캡처035459db는8PNG 뒤실버테일 준비10초초과로종료2. 입력격리8/8 정상|
|원인|DrawLobby의뒤선택전사 DrawSelectedCharacter와앞직업모달 DrawSilverScene이 같은 재생기를 한OnGUI에서0/1로반복Open. 로그OPEN7..12로재현|
|수정|characterStep==1인 전체화면 직업선택 모달 동안 뒤 로비 DrawSelectedCharacter의 영상갱신을 건너뛰어 앞모달이 재생기를소유. 타임아웃10초/실제Prepared·프레임진행 필수유지|
|재검수|새 source/build/M1/실제5직업/8미디어/전체해상도 캡처로재검수. 이전M1/field22는이전DLL범위만증명하며새DLL PASS로소급0|


## R3 실제 결함 수정·검수 계약 — 2026-10-31

R2 source e357a344/정식build feecb283/M1 07fa19ed 23/23/field bb5d6a48 22장/맵 담당 동일EXE 기술PASS·전체아트RETOUCH를 확보했다. UI24f2c0ec는1225PNG·입력격리1225·실제영상120·5해상도 실제WM선택을 수집했으나 품질FAIL이다. 컴포넌트199건은 초기Guide HUD누락120·전환로딩64·봉안함제목15다. 월드41168019는56PNG+1920 raw24장/실제 이동·FPS를 수집했으나 raw자기차이최대65145/viewport차이64413으로FAIL. 이 결과를 새DLL 증거로 소급하지 않는다.

|항목|R3 계약|
|---|---|
|초기Guide HUD|StartupHudVisible은Guide와Curtain에true. 상태판/미니맵/중앙구슬·스킬바를 실제로 페인트. Core규칙·4단계·입력 fence/시계불변|
|초기Guide 위치|EdgeMatrix/높이1080기준 폭최대720·오른쪽56. 실제Panel outset24를 포함해 상태판 아래16·실제구슬장식 위16 예약. top=상태Top+Height+gap+24, bottom=min(ToEdge(HP/MP장식).y)−gap−24. 내용만scroll/고정footer86|
|초기Guide 음영|화면전체startupGuideGradient 제거. 기존검정Panel의폭으로한정. 중앙bonfire barrier는기존중앙Matrix로계속그림|
|스킬본문|NativeSkillBodyArea.Top=max(308,(safe.Y+300s)/e+8), Bottom=min(974,(safe.Y+998s)/e−24), Height=max(300,Bottom−Top). 중앙슬롯상태잉크의294끝과실제닫기998을독립예약. e=H/1080, s=min(W/1920,H/1080). 설명·트리·로드맵은같은Top오프셋. 중앙최대1800/좌설명270/도로접힘은유지|
|스킬글자|fieldSub와오브Lv를기존값보다4design아래로옮겨실제서체잉크가교차하지않게함. 설명뒤강화/SP와실제학습/키계약유지|
|봉안함|공통제목rect는다른인벤페이지와같이x700/y72/w520/h64. 기존본문x518/폭1390설계와분리|
|부활대기|중앙panel cy−56/높이136, 보조문구cy+50. 숫자56px/부활확률·카운트수명·저장규칙불변|
|UI QA 틱격리|overlapUiFreeze+coverage가있는UI fixture만FixedUpdate를정지. 각실제샷전후Simulation.TickCount일치를검증하고simulationFrozenChecks=frames필수. 정상게임/직접틱월드 fixture는변경0. 새전환로딩전수실제원화·fallback계측필수|
|raw 결정성|URP ffe395a3a1d1 AAOPass118/GTAOPass443의blue-noise index가요청마다증가하는원인확인. QA3요청전같은실제AO pass index를snapshot/restore하고finally원상복원. AO효과/셰이더/패키지/게임RNG비활성화0. aoExpected·aoSamplerStates를기록하고AO활성일때0이면FAIL. 실제self/viewport차이0기준유지|
|그림자검사|작은검정stroke는그림자끼리연쇄병합하지않고실제후행본문에3.1physical이내직접대조. 명시region광휘는반경9.2s/알파.064, 기본광휘5.5s/.03, 사망외곽선death-black-outline4.2s/알파최대1.001. source/내용/후행순서/동일clip/치수/중간칠을대조하며다른본문·미선언큰그림자·중복본문은계속검출. 원본계측과decorationElements에스타일페인트근거보존|
|CPU 회귀|스킬구역은기존식에서실제2560×1600 RED→수정436검사PASS. 그림자회귀는추가12개를포함한56개PASS. 월드검수기는정상및14음성계약을검증. 실제R3 Player/M1/해상도캡처는별도필수|
|순번|R2종료후UI공식반환. 기존Main→impact뒤UI후순번으로재등록. 타인Unity·공통·Desktop중복writer0|

안내의 예약 gap은최소물리16px다. `gap=max(16,16/e)`를edge단위로사용해1600×900 축소에서도상태판/구슬 외곽사이를최소16px비운다. 1080p이상은기존높이기준16design이상유지. R2 1600×900실제실습위/아래13.333px를RED로보존하고새실제Player로확인한다.

전면 DrawSpaced의기존검정1px/±.5px·3px 패스도frontend-black-shadow로명시한다. 실제배율기준반경3.1×edgeScale·알파≤1.001·같은후행본문을검증하며큰일반그림자허용치를늘리지않는다. 사망제목과펫대사는기존stroke그림을유지하고death-black-outline에같은본문호출source를연결한다. 두패스모두원본paint자료/decorationElements를보존한다.


## R4 실제 실패 보정 — 2026-10-31

|항목|현행 계약|
|---|---|
|선택 URP pass|설치 URP ffe395a3a1d1의 m_AAOPass는 필수, m_GTAOPass는 MODERN_SSAO 컴파일 기호가 있을 때만 존재한다. GTAO 필드 부재만 건너뛰고 AAO 필드/실제 pass index 부재와 활성 AO sampler 0개는 계속 실패한다. 3요청 전 상태 복원/finally 원복·AO 활성·raw 차이0 요구 유지|
|실제 RED|R3 24bf/Runtime15403e28/builda4c686b6/M1 1b7d828c 23/23/field8439c439 22장 뒤 world83c09328은 선택 m_GTAOPass 필드 부재로12초에 실패했다. 1PNG만 있으며 raw/FPS PASS 근거가 아니다|
|펫 대사|NativeDeathOverlay.PetText는 size22 Noto Sans KR Bold, 줄간격 lh=max(27.6, 각 줄 GUIStyle.CalcSize 높이+4design). Wrap/본문/상자 위치/가운데 정렬/초상·로테이션 유지. 실제2560×1600의 본문 높이42.48px와 기존 줄간격36.8px가5.68px 교차한 RED를 보존|
|검수|보정한 새 같은 DLL로 정식 remodel-scenes1 build→M1→field/UI/world/웹/1x를 다시 수행한다. R3 UI나 과거 M1을 새 DLL 증거로 소급하지 않는다|
|순번|R3 UI 실행 직후 공식 unreserve. R4는 기존 Main/Map/Impact 뒤 큐 끝 재등록. 타인 예약·프로세스·공통/Desktop 쓰기0|
