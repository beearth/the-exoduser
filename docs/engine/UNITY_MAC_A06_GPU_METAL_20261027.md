# Mac A06 HUD Editor Metal 계측 — 2026-10-27

> 2026-10-27 후속: 아래 exit 2는 당시 구형 Inventory seed QA의 결과다. [유골함 포함 계약 정정·전체 Verify 재검](UNITY_MAC_INVENTORY_SEED_QA_20261027.md)에서 같은 Metal 장치의 전체 검사 exit 0/receipt PASS를 확인했다. 최초 실패 로그와 raw RGBA는 이력으로 보존한다.

## 범위·인수

PC `244fc4b0ed16f8a6140cd2c60d1cc1b77fd5328d`의 GPU 계측 patch SHA256 `39f78d63c42760a7bfafe2a6e5dcb92865939d3af56f9f6bc8f452ddfdc3725a`, `97bddd6bd7de3a1692870f2e22c187821e576d9e`의 웹 clipping 계약 patch SHA256 `9d3f3f5501019ce931f39c82bb599728de84ebb94fbc2a5e67126e4fc854f4f4`를 Mac `PortVerification.cs`의 해당 hunk에만 적용했다. Mac 수정 전 Editor SHA256은 `ff55017265a1939c45eb3d8dc65191dd67c5643ca0c1b0a243518fe05bbe620a`, 수정 후는 `e7b2813a44a51568a5d8163a788428cf95d0e1d1ea53858c49a849ae774e37e2`다. 수정 전 사본·두 patch·실행 로그는 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A06-GPU-METAL-20261027/`에 보존했다. Runtime, 셰이더, Gamma, 자원, 저장, 개인 앱은 변경하지 않았다.

## 현행 Editor QA 계약

| 검사·적용 위치 | 입력·수치 | 판정 |
|---|---|---|
| `VerifyUiComposition`, 논리 HUD | 1280×720, 1920×1080, 2560×1080; 화면을 `min(w/1920,h/1080)`으로 나눈 좌표 | 세 크기 모두 통과해야 `UNITY_UI_COMPOSITION_BOUNDS_PASS` |
| 유리 장식 frame | `ArtScale=0.9`; 가시 하단 `height−10+44×0.9=height+29.6`, 좌우 그룹 중심 `width/2−4×0.9`, 그룹 폭 `(2×490+263)×0.9=1118.7`; 허용 오차 0.1 | 웹 의도대로 장식 끝만 화면 아래. 가시 frame의 좌우/상단은 화면 안, 하단 위치는 정해진 값 |
| 실제 자원·조작 | 좌우 liquid 전체, 13개 `SlotRect(i)`와 `KeyLabelRect` 전체는 viewport 안; 각 슬롯은 `VisibleBar` 안 | 액체·슬롯·키 라벨 clipping 거부. 기존 중앙 전투 시야 및 인벤 너비 검사 유지 |
| `VerifyHudPixels`, 상태 0/1/2 | HP 최대 526, MP 330, ST 240, 쉴드 285; 상태 0=`526/330/240/285`, 상태 1=`263.9/82.9/180/142.5`, 상태 2=`0/0/0/0` | 기존 `HudPixelProbe`의 alpha<0.01·빨강/파랑/초록/암부 threshold·실패 예외를 그대로 사용. 세 상태 통과 시 `UNITY_HUD_GPU_RESOURCE_MASK_PASS` |
| 추가 읽기 전용 계측 | 상태 0에서 `graphicsDeviceType/name`, `QualitySettings.activeColorSpace`, HP `(2,2),(128,128)`, MP `(80,128),(180,128),(253,253)` | raw RGBA는 진단 출력. 기존 boolean과 판정 수치 변경 없음 |

## 실제 Mac Editor 1회

Unity `6000.6.7f1`에서 `-batchmode -quit -projectPath <Mac worktree>/unity -executeMethod PortVerification.Verify -receipt <QA>/verify-receipt.json -logFile <QA>/verify.log`로 **`-nographics` 없이** 단회 실행했다. 로그에 `Metal devices available: 1`, `Initializing Metal device caps: Apple M5 Pro`, `A06_HUD_GPU_DEVICE type=Metal name=Apple M5 Pro colorSpace=Gamma`가 기록됐다. `-nographics` Null Device의 이전 PC 실패를 Mac 결과로 혼동하지 않는다.

| 대상·좌표 | raw RGBA (r,g,b,a) |
|---|---|
| HP `(2,2)` | `(0.196078435,0.03137255,0.05882353,0)` |
| HP `(128,128)` | `(0.419607848,0.0627451,0.1254902,1)` |
| MP `(80,128)` | `(0.152941182,0.4,0.6666667,1)` |
| ST `(180,128)` | `(0.13333334,0.435294122,0.235294119,1)` |
| MP `(253,253)` | `(0.02745098,0.0392156877,0.0392156877,0)` |

동일 실행에서 `UNITY_UI_COMPOSITION_BOUNDS_PASS`와 `UNITY_HUD_GPU_RESOURCE_MASK_PASS`를 확인했다. 이는 **Mac Metal에서 기존 HUD GPU 자원 마스크와 갱신된 화면 좌표 검사 PASS**이며, 전체 Editor `Verify` PASS가 아니다. 그 다음 `VerifyInventory()`의 선재 기대 `worn==15, bag==10, affixes==20`에서 `Original inventory seed counts` 예외가 나서 **전체 프로세스 종료 코드는 2**, `UNITY_VERIFY_PASS` 및 receipt는 없다. 현재 JSON 원본은 `equipped` 17칸 중 non-null 16, `bag` 10, bag affix 총 20, empty-slot manifest `[8]`이다. 실제 `InventoryState` 결과 수는 이번 로그가 출력하지 않아 JSON 수치를 곧바로 런타임 worn 값으로 단정하지 않는다. 이 다음 검사 실패는 HUD GPU 판정과 구분해 별도 Inventory 계약 검토가 필요하다.

Unity import가 자동 재작성한 tracked `.meta` 411개와 신규 `.meta` 1개는 `<QA>/unity-generated.patch` 및 `<QA>/generated-untracked/`에 보존하고 원래 바이트로 복원했다. 새로운 Player 빌드·GUI 클릭·전체 웹 시각 판정은 0회다. PC AMD 정상 장치 결과는 이 Mac Metal 실행으로 검증한 것이 아니다.

## 2026-10-28 Linear 통합 뒤 HUD probe 정규화

`unity/main:444ee86fc`의 RM-0 결정 `0ebc103c0`으로 `m_ActiveColorSpace=1(Linear)`가 되었다. 기존 `NativeHud`는 shader float RGB를 기본 ARGB32 RenderTexture에 blit하고 `Texture2D(RGBA32,false)`로 readback한다. Mac Metal에서 이 readback의 `GetPixel`은 sRGB 부호화된 값이었다. 이전 Gamma의 HP 중앙 `(0.41961,0.06275,0.12549)`에 대응하는 Linear 실행 raw `(0.67843,0.27843,0.38824)`를 sRGB→linear로 환산하면 `(0.41789,0.06301,0.12477)`이다. 따라서 기존 `dark: max(R,G,B)<0.05`에 raw를 바로 넣으면 셰이더의 빈 영역 `8/255≈0.03137`도 readback `0.19216`으로 오판한다. HP/MP 실제 채움이 상단으로 새어 나온 증거가 아니다.

`NativeHud.ProbeColor`에서 **Linear일 때만** `Mathf.GammaToLinearSpace`로 읽은 RGB를 셰이더 값 공간에 돌려놓고 기존 색/암부 임계값을 그대로 적용한다. alpha/렌더 텍스처/셰이더/실제 표시·자원 비율/게임 수치 변경 0. `PortVerification.VerifyHudPixels`는 각 상태의 HP 중앙·상단·하단, MP 중앙·상단, ST 중앙의 raw와 정규화값 및 비율을 추가 출력한다.

| 상태 | HP translate / MP / ST | 핵심 readback raw→정규화 | 셰이더 위치 근거 |
|---|---|---|---|
| 0 full | 10% / 1 / 1 | HP 중앙 R `0.67843→0.41789`, MP 중앙 B `0.83529→0.66539` | 채워진 기준색 |
| 1 half | 53.5% / 0.2484848 / 0.75 | HP 상단 RGB `0.19216→0.03071`; MP 상단 B `0.19216→0.03071`; HP 하단 R `0.59608→0.31399` | HP 상단 y180의 top≈0.297<0.535, 하단 y80의 top≈0.688>0.535; MP 상단 y180≈0.703>0.248이라 두 상단은 빈 영역 |
| 2 empty | 97% / 0 / 0 | HP 중앙 RGB `0.19216→0.03071`; MP·ST 중앙 B `0.19216→0.03071` | 세 자원 모두 빈 영역 |

수정 전 Mac Verify 1회는 HUD 상태1 `hpUpperEmpty=false/manaUpperEmpty=false`로 종료2/receipt 없음. 수정 후 **같은 gate 1회**에서 `UNITY_UI_COMPOSITION_BOUNDS_PASS`와 세 상태 `UNITY_HUD_GPU_RESOURCE_MASK_PASS`, C# 오류0을 확인했다. 그 다음 **별개 A15 SFX 기대값**에서 `A15 SFX right must step by one and write once` 예외로 종료2/Unity receipt 없음. `NativePauseMenu.A15Web` 현재 `optSfx` range 키 단계는 5지만 A15 Editor 기대는 60→61(1)이다. A15 계약·소유자가 키 단계 1의 복구 여부를 판단해야 하며 이번 HUD 범위에서 고치거나 gate를 재실행하지 않았다. 첫·둘째 로그와 18개 raw/정규화 픽셀의 구조화 자료는 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-SYNC-20261028/hud-linear/gate-result.json`에 있다. 이는 **HUD GPU 수치 판정 PASS, 전체 Editor FAIL/HOLD**이며 실제 Player 화면·Windows/GPU·청음 검수는 아니다.

2026-10-29 후속: 위 전체 Editor HOLD는 PC A15 1% 원본 `2ac579319…` 인수 뒤 해소됐다. 같은 Mac Metal Editor 전체 `PortVerification.Verify` 1회 exit0/receipt PASS, 로그의 `UNITY_HUD_GPU_RESOURCE_MASK_PASS`와 `UNITY_A15_SETTINGS_NAV_SFX_CAPTURE_PASS` 및 `UNITY_VERIFY_PASS`를 확인했다. A06 GPU probe 수식과 제품 HUD는 추가 변경하지 않았다. [최종 gate 영수증](UNITY_MAC_A15_M1_FINAL_20261029.md).
