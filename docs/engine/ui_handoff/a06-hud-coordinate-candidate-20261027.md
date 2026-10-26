# A06 HUD 좌표 후보 — 2026-10-27

웹 기준 `d209075ec471176ca5224d4c21c4912a3e72ed0a`과 격리 E: Unity 후보의 정적 계약이다. 이 커밋은 검토·복구용 후보이며 Mac 적용, Unity Editor/Player 시각·입력, 릴리스 검수는 별도다. 기존 `docs/engine/UNITY_PORT_MASTER_20261026.md`는 현재 branch에 없어 공유 G: WIP를 이 체크포인트에 섞지 않았다.

## 02:25 후속: E: 격리 좌표 후보, QA 전 freeze

원격 웹 `d209075…`의 독립 CSS/DOM oracle과 위 Mac 원격 byte 대조를 기준으로, E:의 **`NativeHudDockLayout.cs` 배치/slot/key-row rect**와 **`NativeHudSkills.cs`의 `SkillSlotRect` 위임 1행**만 수정했다. `NativeHud.cs`, `NativeHudPresentation.cs`, `NativeGame.cs`의 byte는 수정 전과 같다. foundation 생성 코드·아트·게임/스킬/자원 수치·키 바인딩·전투는 변경하지 않았다. 다만 foundation도 공통 `ArtScale`을 소비하므로 표시 크기는 **873.6×110.8→1008×127.8px**로 함께 커진다. 새 구슬 배치와의 윤곽 접점은 시각 HOLD다. I:의 `a06-hud-before/`는 수정 전 5파일 SHA 동일 복사이며 `a06-hud-coordinate-candidate.REVIEW.patch`는 이 두 파일만 담은 **검토용 delta**다. 제품 후보의 기본 릴리스 채택·Mac 이송·원격 반영은 0이다.

| 계약 항목 | 수정 전 | E: 후보 | 웹 source 근거 |
| --- | --- | --- | --- |
| 공통 그림 배율 | `.78` | `.9` | `game.html` 185–186, 310행. `NativeGame`의 화면 min-scale은 그대로 추가 적용 |
| 구슬 액체 중심 | 1920 기준 x≈605.7/1320.6 | x=519/1401 | 웹 중앙 ±441. frame x는 원본 art에서 액체 중심이 frame left+135.5×.9인 것을 반영해 좌우 액체 중심을 대칭으로 둠 |
| 구슬 액체 하단 | frame 기준 약 42.3px 위 | 화면 하단 10px | 웹 `.globe-container` bottom inset10, glass inset−44. frame 직사각형은 화면 아래 29.6px까지 뻗음 |
| 슬롯바 | 폭639.6px, 보이는 alpha 바닥 약8px | 폭738px, 원본 요소 bottom −15px; 보이는 alpha 바닥 약10.2px | 웹 820×182×.9, `bottom:10−25`; PNG alpha y462/546 |
| 13 슬롯 draw/click rect | `128+44i`×.78, 37×77×.78 hitbox | source x `128,173,…,654`×.9, top70×.9, **37×45×.9**. `ActiveSlot`, `SkillSlotRect`, pointer 억제와 버튼이 `dock.SlotRect`를 공유 | `game.html` 711–724행 슬롯 CSS. 원래 클릭 처리·키 이름·배정 함수는 그대로 |
| 키라벨 행 | 화면 아래 y44·높이31 고정 | 슬롯바 안 y121×.9·높이18×.9, x는 같은 슬롯 목록 | 웹 `#skKeyBar`/`_updateSkBarKeyLabels` 행. 라벨 문자열·GUIStyle은 유지 |

**독립 테스트:** `a06-hud-oracle/A06HudOracle.csproj`는 Unity Editor 없이 실제 E: `NativeHudDockLayout.cs`를 작은 `Rect` stub과 함께 컴파일해 실행한다. 수정 전 scale **0.780 vs oracle 0.900** 실패를 확인했고, 슬롯/키행 검증을 추가한 다음 키행 **y1036 vs oracle1040.1** 실패를 확인했다. 해당 수정 후 1920×1080, 1280×720, 2560×1080에서 bar 폭·구슬 중심·바닥·13개 slot/key-row rect가 모두 PASS였다. 이 .NET 수치 검사는 Unity 전체 C# import/Editor·Player·실제 클릭·시각 품질 검증이 아니다. 요구한 QA compile 전에 후보를 freeze한다.

**기존 Editor QA의 의도 충돌:** `E:\...\unity\Assets\Exoduser\Editor\PortVerification.cs` 101–108행의 과거 `VerifyUiComposition`은 `VisibleFrame.yMax<=height−4`, frame 좌우 bounding-box 완전 대칭, 전체 폭 `<=1100`을 요구한다. 웹 CSS의 glass가 하단으로 44×.9 뻗는 이번 후보에서는 frame yMax=`height+29.6`, frame bounding-box 중심=`mid−3.6`, 전체 폭≈1118.7이어서 이 구형 geometry 검사는 실패 예상이다. 액체 중심·바닥과 실제 art alpha가 웹 위치와 맞는지는 별도다. 이 Editor 파일은 소유 범위 밖이라 수정하지 않았다. QA는 **컴파일 결과와 구형 composition assertion**을 분리하고, 해당 assertion의 oracle 갱신 여부를 UI/QA 소유자가 검토해야 한다.

**시각/입력 HOLD:** art 크기·구슬 간격·foundation 접점은 1920×1080/1280×720/2560×1080의 동일 상태 웹·Unity 전체 프레임+하단 crop으로 비교해야 한다. 13개 슬롯의 시각 rect와 클릭 rect가 일치하는지 실제 OS pointer로 확인하고, 슬롯 바깥 클릭이 기존 무기 입력으로 이어지는지 별도로 검수한다. 이번 후보는 숫자 oracle PASS만 있으며 **VISUAL VERDICT: HOLD / 실화면 미검수**다. QA Editor, Mac 빌드·GUI, 자연 플레이, 저장/릴리스는 미검수다.

관련 `docs/` 검색은 `NativeHudDockLayout`, `ArtScale`, `스킬바`, `구슬`, `HUD 좌표`로 수행했다. 현재 웹 축척 SSOT `docs/3.1 ui hud 디자인/UI_SCALING_20260929.md`는 변경하지 않는다. Unity 포트 운영 표의 `docs/engine/UNITY_PORT_MASTER_20261026.md` A06 행에 이 후보의 **좌표 구현/독립 수치 검증/Editor·시각·입력 HOLD**를 게시해야 하지만 공유 G: 문서는 이 격리 코드 소유자가 수정하지 않는다. 본 I: 문서가 이번 후보의 docs 동기화 초안이며 후속 문서 소유자가 정상 체크포인트와 함께 반영한다.

## QA 독립 검수 — 2026-10-27 02:49 KST

QA가 후보 원격 `741d97ba1245631a8098d9cecac5589332252189`와 E: freeze manifest의 SHA를 재확인했다. Runtime C# 77개 중 `NativeHudDockLayout.cs`·`NativeHudSkills.cs`만 변경됐고 75개는 동일 byte다. 후보의 `game.html`과 기존 웹 oracle의 HUD CSS·`applyUIScale()`·13슬롯 좌표·pointer 규칙은 동일하다.

| 화면 | 바 rect 웹↔Unity 최대 차이 | 구슬 액체 중심 | 13슬롯 rect | Unity draw↔자체 pointer 변환 |
| --- | ---: | ---: | ---: | ---: |
| 1920×1080 | 0px | 0px | 0px | 0px |
| 1280×720 | 0.0246px | 0.0147px | 0.00846px | 0px |
| 2560×1080 | 0px | 0px | 0px | 0px |

720p의 잔차는 웹 `toFixed(4)=0.6667`과 Unity의 `2/3` 배율 차이다. A06-1 배율·A06-2 구슬/바/슬롯 앵커의 **정적 좌표 PASS**만 확정한다. 실제 OS 클릭 전달과 GUI.matrix 이벤트 처리는 검증되지 않았다. 공통 ArtScale을 소비하는 A06-3 foundation의 픽셀·접점 품질은 **VISUAL HOLD**다.

Unity 6000.6.7f1 격리 Editor를 `-batchmode -nographics -noUpm -quit`로 한 번 실행해 exit 0, 스크립트 컴파일 로그 확인, 컴파일 오류 0, 실행 중 Runtime C# 변경 0을 기록했다. Editor lease는 해제됐다. 구형 `PortVerification.VerifyUiComposition`은 **실행하지 않았다**. 후보의 웹 하단 앵커와 구형 frame assertion의 계약 충돌 가능성은 위 초안의 예상 사항이며 이번 검수의 관측 실패가 아니다. Player·시각·실입력·Mac 통합·저장·main 통합은 **HOLD/미검증**이다.

상세 원시 근거는 I: `qa-contract/a06-hud-final-qa.md` SHA-256 `FD01AC466031F0EAD950F0A35DF641AFF24E4E7BDEAAF273DA7BDDB26C6A6D9F`, 좌표 JSON `EAE577CDA4FD8E8BEBB3625F13D98D430FFDCD288357074A4AFD049A75A38F49`, 컴파일 JSON `77037B3150288C1E0621F5B24FFB2E098744CB2E51AB3A80BC2D97ED8354B65B`, Editor 로그 `4852948859EE0EF0F5A9DA63C560F6325B68AA6866DEC6E14573C139D2D9FB4B`이다.

## 구형 composition 검사 계약 정정 후보 — 2026-10-27

기존 `PortVerification.VerifyUiComposition`을 변경 없이 한 번 실행하자 첫 1280×720에서 `HUD frame clipped`가 발생하고 Editor가 exit **2**로 끝났다. 이는 실제 구형 검사 FAIL이다. 기존 Editor SHA-256은 `4547037525479D248220A269C89EA7FF9C27A88634E6C373291B2676A69B33BA`, 후보는 `A3006751B50F07F09C279BCF0359CC86CA7688B916EFCFC831F6DE53A28BF4E7`다.

웹의 `.globe-container`는 `overflow:visible`, 유리 장식은 `inset:-44px; margin-left:-4px`이다. 전체 그림 배율 `.9`, 바닥 여백 `10×uiScale`에서 유리 프레임 아래끝은 viewport 아래로 `29.6×uiScale` 내려간다: **720p 19.733px**, **1080p/2560×1080 29.6px**. 유리 그룹 중앙은 가상 화면 중앙보다 **3.6px 왼쪽**, 전체 폭은 가상 **1118.7px**이다. 기존 장식 frame 완전 포함·완전 대칭·폭 1100 상한은 이 웹 계약과 충돌한다.

수정 후보는 `VerifyUiComposition`의 장식 경계를 웹 수치 ±0.1 가상 px로 고정한다. 장식과 달리 **자원 액체, 원본 바의 가시 영역, 13개 클릭 슬롯, 13개 키 글자 rect**는 viewport 안에 남는지 검사한다. 슬롯 아래끝은 1080p **1034.7px**/720p **689.8px**, 키 글자 아래끝은 1080p **1056.3px**/720p **704.2px**이다. 인벤토리 중앙 폭 및 전투 시야 위쪽 제한도 유지한다. 검사 삭제나 무조건 허용은 아니다.

후보 재실행에서 `UNITY_UI_COMPOSITION_BOUNDS_PASS`를 관측했다. **Composition 단계 PASS**다. 그 다음 `VerifyHudPixels`의 `Native HUD GPU pixel mismatch`로 전체 `PortVerification.Verify`는 다시 exit **2 / FAIL**이었다. GPU 픽셀 실패 원인은 이 변경 범위에서 판정하지 않는다. 앞선 독립 좌표 PASS·Editor 스크립트 컴파일 0오류와 이 전체 Verify FAIL을 구분한다. QA는 Runtime C# 77개 중 기존 A06 HUD 두 파일 외 75개 byte 불변, Player·실클릭·새 시각 캡처 0, Editor lease 해제를 기록했다. Mac A06 실화면은 Mac 별도 영수증이다.

원시 I: 근거: `qa-contract/a06-composition-contract-resolution.md` SHA-256 `DDDE42D4CBE55D463DC7133907FA491F3BF8103B9341F7E3EA74EEB44C5B293E`, 구조화 JSON `3168F0D97269C46592ADE6CDA4A1B5DC176FB40C10DC9529DD8DEAACE54CF365`, 구형 실패 로그 `A3391216C7FD81524225F3A621E86BE4CDCC816E22329ED8AABE10E40D00E723`, 후보 후속 실패 로그 `17930E66CA811D801A8B405433BEDB7F5B109BC342446A7887F30E7666EAD103`. 이번 체크포인트는 Editor QA 계약 후보와 문서만 담는다. GPU 실패를 PASS 처리하거나 Mac 제품에 적용하지 않았다.

## GPU 계측 시도와 미해결 게이트 — 2026-10-27

앞의 전체 `PortVerification.Verify` 후속 GPU 픽셀 실패를 원인 확정 없이 보존한다. 과거 두 실패 실행은 모두 `-nographics` / `Renderer: Null Device`였고, probe 영수증에는 색·투명도 판정 boolean만 있어 실제 RGBA가 없다. Null 렌더러가 유력한 가설이지만 제품 HUD shader·RenderTexture·probe 기대 좌표 중 무엇이 원인인지 현재 분리되지 않았다.

QA는 Runtime 동결 원격 `08af46705af26291d9d5add4904ad82a268142c1`과 E: SHA를 확인한 뒤, 기존 색상 predicate를 유지한 채 장치 정보와 원시 RGBA만 읽는 단회 정상 GPU 검사를 시도했다. `-nographics`를 뺀 Editor는 **AMD Radeon RX 9070 XT**를 초기화했다. 그러나 새 QA 계측의 `Texture2D.GetPixel32()`가 Unity 6000.6.7f1에서 **CS1061**로 컴파일 실패해 Editor exit **1**이었고 `PortVerification.Verify` 및 픽셀 probe까지 도달하지 못했다. **실제 GPU RGBA 0개, GPU probe 판정 UNTESTED**다. 이 컴파일 실패는 QA 계측 오류이며 HUD 제품 오류가 아니다.

QA는 미검증 계측을 제거하고 E: `PortVerification.cs`를 앞서 composition PASS를 얻은 SHA-256 `A3006751B50F07F09C279BCF0359CC86CA7688B916EFCFC831F6DE53A28BF4E7`로 정확히 복구했다. 따라서 이번 체크포인트에는 **Editor 소스 변경이 없다**. 종료 후 Unity 프로세스는 0이지만 E: 프로젝트에 0 byte `Temp/UnityLockfile`이 남았다. 정확한 파일의 비재귀 정리 명령이 자동 승인 검토에서 **`blocked by policy`**로 거부돼 우회·재실행하지 않았다. 잠금이 정상 해소되기 전에는 새 Editor 검사를 완료했다고 할 수 없다.

다음 구분 검사는 lock 해소와 소스 SHA 재고정 뒤 지원되는 `GetPixel()` QA 계측을 사용해 정상 GPU batchmode에서 **한 번** 실제 RGBA와 기존 predicate를 함께 기록하는 것이다. 기대 색·알파 조건을 결과에 맞춰 낮추지 않는다. GPU 장치 초기화 사실을 HUD 픽셀 PASS로 옮기지 않는다. Player·실클릭·물리 GUI는 이번 시도 범위 밖이다.

I: 원시 근거: `qa-contract/a06-gpu-probe-investigation.md` SHA-256 `64A01425944E03B8F0559744BCE3AD176599CF7A3A815242646BD3A7D4C09D21`, 시도 JSON `F57AEF7DCEBB3238B01DE89A94295E9E300ACEF091560FFCAE93229E09E6387C`, Editor 실행 영수증 `98B344434A8B150EF12D01D9ED36ADF7F5722169D2AA5EBF2679D0B9124C5C64`, 로그 `86292246D7447D5ECEE526E4403045B6F4BE08B1AA754EB1C213B40A19988AD9`.
