# A06 GPU 계측 독립 patch 인계 — 2026-10-27

## 부모와 두 hunk

- 원격 `97bddd6bd7de3a1692870f2e22c187821e576d9e`의 `unity/Assets/Exoduser/Editor/PortVerification.cs`는 SHA-256 `A3006751B50F07F09C279BCF0359CC86CA7688B916EFCFC831F6DE53A28BF4E7`이다. E: PC Editor 파일도 미검증 계측 제거 후 정확히 이 SHA로 복귀했다. E:에는 `Temp/UnityLockfile`이 남아 있으므로 이 인계는 PC Editor 재실행 요청이 아니다.
- **별도 hunk 1 — composition 계약 정정:** `a06-composition-from-40e1.patch` SHA-256 `9D3F3F5501019CE931F39C82BB599728DE84EBB94FBC2A5E67126E4FC854F4F4`는 이전 `40e1a188617563e39abc6de98f48d71b9f313ced`의 Editor SHA `4547037525479D248220A269C89EA7FF9C27A88634E6C373291B2676A69B33BA`에서 부모 `97bddd6`로 가는 이미 게시된 commit diff다. 원래 `HUD frame clipped (1280.00, 720.00)`와 웹 장식 clipping 근거는 `a06-composition-contract-resolution.md`에 있다. 이 patch를 GPU hunk와 섞지 않는다.
- **별도 hunk 2 — GPU 읽기 전용 계측:** `a06-gpu-probe-on-97bddd.patch` SHA-256 `39F78D63C42760A7BFAFE2A6E5DCB92865939D3AF56F9F6BC8F452DDFDC3725A`. 적용 전 SHA는 위 `A3006751…`, 적용 후 I: 후보 `PortVerification.a06-gpu-probe-candidate.cs` SHA-256 `3BEC30C1F1CC559C8A1622BEA367B11125DFD6431F4F43C74A22EB720BE2652A`다. I: 격리 사본에 `git apply --check` exit 0 뒤 적용한 파일이 이 후보와 동일 SHA임을 확인했다.

## Unity 6000.6.7f1 API 증거

설치본 `E:\Unity\Editors\6000.6.7f1\Editor\Data\Managed\UnityEngine\UnityEngine.CoreModule.xml`은 `Texture2D.GetPixel(System.Int32,System.Int32)`와 `GetPixels32()` 및 `ReadPixels(UnityEngine.Rect,System.Int32,System.Int32,System.Boolean)`을 문서화한다. 실제 `UnityEngine.CoreModule.dll` 메서드 목록에도 `UnityEngine.Color GetPixel(Int32, Int32)`, `UnityEngine.Color32[] GetPixels32()`, `Void ReadPixels(UnityEngine.Rect, Int32, Int32)`, `Void ReadPixels(UnityEngine.Rect, Int32, Int32, Boolean)`이 있다. 단일 `GetPixel32()`는 없다. 이전 정상 GPU 시도 로그 `a06-gpu-device-editor.log`의 CS1061은 QA가 존재하지 않는 단일 API를 호출한 오류였다.

새 hunk는 설치본에서 확인한 `GetPixel(0,0)`만 쓴다. 첫 HUD 상태에서 `SystemInfo.graphicsDeviceType/name`, `QualitySettings.activeColorSpace`와 HP `(2,2),(128,128)`, MP `(80,128),(180,128),(253,253)`의 원시 RGBA float를 로그에 남긴다. `hud.Probe()`의 기존 기대 색·alpha threshold, 실패 조건, Runtime/Gamma/shader, 자원값, 키, Player 코드는 바꾸지 않는다. Reflection은 QA에서 private RenderTexture `hp`/`mana`를 읽는 데만 쓰며, 읽기 오류는 별도 진단 로그로 보존한다.

## 관측 범위와 검증 게이트

기존 `-nographics` 전체 Verify는 `Renderer: Null Device`에서 상태 0 색/투명도 boolean 모두 false였다. 이후 `-nographics`를 뺀 시도에서 `Renderer: AMD Radeon RX 9070 XT (ID=0x7550)`까지 초기화됐지만 QA CS1061로 Editor 스크립트 컴파일이 실패해 Verify/GPU probe가 실행되지 않았다. 따라서 **정상 GPU raw RGBA와 predicate 결과는 아직 0건**이다. 실패 원인을 Unity Null backend 가설로 기록하되 제품 PASS 또는 결함으로 확정하지 않는다.

PC `UnityLockfile` 정리 명령은 자동 승인 검토에서 `blocked by policy`로 거부됐고 다른 경로로 우회하지 않았다. PC E: Editor 재기동 0, Player/사용자 창/세이브 조작 0. 이 patch는 문서 담당이 전송·게시해 Mac 정상 Metal GPU에서 source SHA를 고정하고 검증할 입력이다. Mac의 실제 GPU 결과, 전체 `Verify` 종료 코드, 픽셀값·시각·클릭 판정은 별도 영수증이 필요하다. 설치본 API 확인과 I: patch 적용 검증은 **Unity Editor 컴파일 또는 GPU PASS가 아니다**.
