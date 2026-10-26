# Mac A06 HUD Editor Metal 계측 — 2026-10-27

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
