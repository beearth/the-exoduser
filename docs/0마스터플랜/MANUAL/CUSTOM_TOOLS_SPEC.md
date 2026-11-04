# Unity 커스텀 제작 도구 설계

작성: 2026-11-05 KST. 상태: **설계안 / 총괄 검토 대기**. 구현·컴파일·Player·시각 판정 결과가 아니다.

## 1. 범위와 기준

- 작업본: `E:/exoduser-wt/codex-study-combat-team`, 브랜치 `codex/unity-tools-spec-20261105`.
- 기준: `75add6ff4a6209e2590a7a626ffb4c37b5f0268e`. 시작 시 작업본 변경 없음. `ProjectVersion.txt`와 `Packages/manifest.json` Git 객체에서 **Unity 6000.6.7f1 / URP 17.6.0** 확인.
- 이번 산출물은 이 파일 하나다. 코드·에셋·설정·다른 문서 수정, stage·commit·push, Unity·Player 실행, Python·유료 도구 사용은 하지 않는다. 모든 셸 명령은 표준입력을 닫고 사용한다.
- 클라우드 TC 레인과 독립이다. **MANUAL 폴더의 다른 문서는 읽지 않았다.** 향후에도 그 레인의 산출물·스키마를 이 설계의 선행 의존성으로 삼지 않는다. 폴더 밖 공통 운영·작업 매뉴얼의 정본 위치 안내만 따라 운영 규칙을 확인했다.
- 아래 데이터 형식·메뉴·저장 경로는 모두 **후속 구현 제안**이다. 지금 만들어진 기능이나 파일로 해석하지 않는다. 기존 자료에 없는 수치와 작업량은 `[추정]`, 기기 측정이 필요한 값은 `[실측 필요]`, API 연결이 미검증인 부분은 `[확인 필요]`로 쓴다.

### 읽은 근거

| 근거 | 사용 범위와 한계 |
|---|---|
| `I:/EXODUSER-Storage/codex-takeover/tools-spec/our_tech_audit.md` §3–9 | 같은 기준 SHA의 모델·텍스처·Resources 정적 집계, 렌더 요청·메시 복제·임포트 위험. §4의 예산 기준값은 비어 있으므로 임의 보충하지 않음 |
| 같은 폴더 `codex_asset_size.md` §1·3·5–7 | 원본 byte와 imported payload·설치·다운로드·상주 메모리의 분리, 동적 Resources 키와 폴백 보존, A2R 별도 보존분 |
| 같은 폴더 `MOODLAB_HANDOFF.md` 맨 위 최신 보정 보고 | a–d 최신 의미, 34° 카메라, 12u 표식, WB/LUT와 b/c 광학 overlay의 차이. 아래의 최초 시안 표보다 최신 보고를 우선함. 현재 작업본에 MoodLab이 병합됐다는 증거는 아님 |
| 현재 `unity/Assets/Exoduser/Editor` | LookDev·MapLint·임포터·임포트 검사·캐릭터 검사·기존 빌더의 재사용 범위 |
| 현재 `unity/Assets/Exoduser/Runtime` | A2Field/A2Forest·높이·조명 writer, 캡처·음소거·성능 probe. 코드의 존재와 Player 동작 보증을 구별함 |
| `HEAD:unity/Tools/devtools/exo-unity.ps1` | 공용 실행기로 전달하는 구조, 큐·예약·숨김 실행 인터페이스. 실행하지 않음 |
| 별도 로컬 ref `codex/unity-a2r-keep-20261105` / `3c07e220658ddf819929fd5f538a2f5f5067ab6f`의 코드 | `Editor/A2RBuilder.cs`, `Runtime/A2RGroundPainting.cs`, `Runtime/A2RProps3D.cs`를 Git 객체로 읽음. checkout·반입 없이 중복 범위만 확인 |

경로 약어: `E/`는 `unity/Assets/Exoduser/Editor/`, `R/`는 `unity/Assets/Exoduser/Runtime/`. Git 객체로 읽은 별도 브랜치 기능을 현재 HEAD 기능이라고 표시하지 않는다.

## 2. 공통 구조와 재사용 경계

다섯 도구는 기존 DevTools의 제작 UI와 검증 경로를 확장한다. 실행 서버·큐·빌드 체계·이미지 지표 엔진을 새로 만들지 않는다. 제작 데이터와 판정 영수증을 분리하고, Player에는 필요한 확정 데이터와 최소 적용부만 포함한다. `UnityEditor` 참조와 제작 창은 Editor 어셈블리에만 둔다.

| 기존 도구 | 재사용 | 추가할 부분 / 그대로 쓰면 안 되는 부분 |
|---|---|---|
| 공용 `I:/EXODUSER-Storage/unity-jobs/bin/exo-unity.ps1`, `E/DevTools/JobServer` | 소유자·worktree·예약·순번·로그·실행 종료 관리. 프로젝트 실행기 사본은 공용본으로 전달 | 도구별 작업 입력·결과만 연결. 새 잠금·예약 서버·직접 Unity 실행 우회는 만들지 않음. 이 문서 작업은 엔진을 실행하지 않아 슬롯을 취득하지 않음 |
| `E/DevTools/LookDev` | Shot 데이터, 임시 프리셋 적용/복원, PNG 입출력·휘도/색 지표·비교판 | 1-1 카메라 LOCK, 원본 크기 강제 검사, overlay·깜박 비교, Player 영수증 연결 추가. 기존 비교판은 reference를 자동 리사이즈하므로 엄격 비교에서는 사전 차단 필요 |
| `E/DevTools/LookDev/Harness~` | Unity 밖 C# 이미지 지표 코어와 고정 입력 검증 구조 | 하니스는 GPU·Metal·Player·본선 조명 검증기가 아님. Python 비교 스크립트는 이번 사용 금지이며 실행하지 않음 |
| `E/DevTools/MapLint` | 통행 격자·메시/Collider·Terrain·가림 검사와 문제 위치 표시 | 기본 카메라 오프셋과 pitch는 옛 48.70°/14u. 34° 전용 프로필로 입력을 맞춰야 함. 평면 walkPlaneY 가정은 A2Field의 실제 높이와 대조 필요 |
| `E/Rm1SliceBuilder.cs` 등 Terrain 빌더 | 기존 Terrain·레이어·색 지도·걷기 격자·잔디 제작 결과 | 지형·보행 경계의 소유권 유지. 소품 브러시는 지형 높이와 페인트를 다시 쓰지 않음 |
| `R/NativeGame.A2Field.cs`, `NativeGame.A2Forest.cs`, `NativeRemodel3D.cs` | 본선 조립·기존 모델·높이 함수·좌표 변환·접지 계약 | 매 인스턴스 메시 복제/정점 변형을 브러시가 그대로 반복하지 않음. Field.Height가 우선하는 높이 계약을 유지 |
| 별도 A2RBuilder·GroundPainting·Props3D | A2R 레인을 대상으로 할 때 기존 BuildPlayer·셰이더 검사·페인트 투영·3D 소품 조립 경로 재사용 | 현재 HEAD에 없음. 가져왔다고 가정하지 않음. A2RBuilder를 범용 도구 빌더로 복제하지 않으며, 일반 본선에는 해당 레인의 빌더를 자동 선택하지 않음 |
| `R/NativeGuiCapture.cs`, `NativeGame.A2FieldCapture.cs`, `Tools/NativeQaCaptureWriter.cs`, `NativeMuteGuard.cs` | 무창 RT+IMGUI 합성·본선 필드 QA·제한된 쓰기 큐·음소거 | 기존 캡처의 강제 이동/AI 정지는 구도 검수에 한정. 자연 플레이 성능·완주 판정으로 승격하지 않음 |
| `R/NativePerfProbe.cs`, `NativeGame.PerfProbe.cs` | 상태/해상도별 프레임 측정과 렌더 counter 연결 | 기존 평균 counter만으로 p95·최대 초과 판정 불가. counter 유효성·표본 수·누락 상태를 보강하는 후속 설계 필요 |
| SourceTexture/SourceAudioImporter, CharacterLab, SilverUi/Enemy3DImportCheck | 기존 경로별 임포트 writer와 검사 | 별도 postprocessor가 같은 필드를 덮어쓰지 않게 기존 writer 안에서 규칙을 공유. 검사 결과를 통합 UI에서 모음 |

공통 영수증은 도구·규칙 버전, 소스 SHA와 미커밋 변경 유무, 입력 데이터 버전, 대상 맵/프리셋/Shot ID, 실제 OS·그래픽 API·Unity/URP·품질·Renderer, 측정 조건, 결과·누락 이유, 이미지/로그 경로를 가진다. SHA가 같아도 미커밋 변경이 다르면 같은 소스로 보지 않는다. 후속 Mac 빌드는 총괄이 확정한 커밋에서 만든다.

결과 상태는 `PASS`, `FAIL`, `PENDING_MEASUREMENT`, `PENDING_MAC`, `SETUP_FAILED`로 구분한다. 누락·미측정·지원되지 않는 counter를 0이나 PASS로 바꾸지 않는다. 실측·판정 전에는 진단 출력까지 허용하되 **본선 승격·배포 적격 표시는 차단**한다. 로그에는 수정 대상과 실제값·기준·단위·근거를 남기고 게임 화면에는 개발 상태 문구를 넣지 않는다.

## 3. ① 소품 군집 스캐터 브러시

### 목적·v0 범위

낙엽·버섯·작은 돌·잔해를 군집 단위로 배치하면서 뜸·과도한 매몰·통행 침범·먼 적 가림·밀도 폭증을 배치 시점에 막는다. 데모 v0은 **1-1의 승인된 작은 정적 소품 팔레트**에 한정한다. 거목·교량·루트 메시의 재조형, 지형 페인트, 수동 랜드마크 이동, AI/충돌 규칙 변경은 별도 작업이다.

Terrain은 높이·표면층·detail/tree 시스템을 맡고, 기존 페인터/색 지도·A2R GroundPainting은 바닥 색과 흔적을 맡는다. 이 브러시는 그 위의 입체 소품 레이어다. 낙엽이 페인트와 메시 양쪽에 중복되지 않도록 팔레트에 표현 방식과 소유 레이어를 적는다. A2R의 원화 투영을 Terrain 페인트나 새 소품으로 자동 변환하지 않는다.

### 입출력

- 입력: 소유 맵/영역, 기존 prefab·모델 팔레트, 군집 seed, 반경·falloff·밀도(개/u²), 최소 간격, 가중치, 크기·yaw 범위, 접촉점/발판, 허용 경사·높이차·매몰량, 제외 마스크, 기존 통행 격자와 실제 높이 제공자, 승인 카메라, 도구④ 예산 프로필.
- 접지·밀도 수치는 팔레트별 미술 검토와 실제 1-1 측정으로 확정한다. **v0 기본값의 확정 수치는 `[실측 필요]`**다. 필수 값이 빈 팔레트는 미리보기만 허용하며 적용을 막는다. 코어 RNG와 분리한 도구 전용 seed를 사용한다.
- 출력: 재현 가능한 배치 레코드(안정 ID, 자원 키, 위치·회전·스케일, seed, 규칙/높이 버전), 승인/기각 수와 사유, 예상 기하·인스턴스 수, MapLint·가림 결과. Editor의 GUID는 출처 추적용이며 Player 자원 조회 키로 직접 쓰지 않는다.
- 현재 A2 본선은 런타임 조립이므로 Editor 씬에 prefab만 저장해 끝내면 게임에 반영되지 않는다. v0 제안은 작은 배치 카탈로그 `Resources/Data/CustomTools/A2Scatter`를 기존 맵 조립부가 읽어 소유 루트에 한 번 적용하는 방식이다. 기존 모델을 참조하며 복사본은 만들지 않는다. **이 카탈로그와 소비부는 후속 구현 대상**이고, Resources 증가량도 ④에 포함한다.

### UI 흐름·배치 규칙

1. DevTools의 스캐터 창에서 맵·높이 제공자·팔레트·예산을 고른다. 기존 배치 소유 레이어를 표시하고 수동 소품은 읽기 전용으로 둔다.
2. Scene 뷰 브러시를 움직이면 군집의 중심 소품→주변 소품 순으로 ghost를 보인다. 포인터 이벤트 수나 프레임 수로 밀도가 늘지 않도록 거리 기반 stroke 표본과 seed를 사용한다.
3. 후보마다 실제 표면의 접촉점과 발판 여러 점을 검사한다. Terrain에서는 SampleHeight+Terrain 위치, A2Field에서는 Field.Height 계약을 쓴다. 렌더 메시/교량은 명시적 표면 Collider raycast를 사용한다. Terrain 범위 밖 질의를 clamp하여 유효 접지처럼 처리하지 않는다.
4. 발판의 뜸·매몰·기울기, 수면/교량 층, 최소 간격, 통행·입구·아이템/텔레그래프 보호 구역을 검사한다. 중심점만 맞추거나 Renderer bounds 최하단만으로 비정형 소품의 접지를 확정하지 않는다. 적합한 표면을 못 찾으면 기각한다.
5. 영역별 밀도는 기존 레코드까지 합산하며, 카메라 전방 통로와 먼 적 실루엣 보호 구역의 점유를 별도 제한한다. 통행 격자를 바꾸거나 플레이어 충돌을 추가하지 않는다. 장식 footprint와 실제 물리 Collider는 분리한다.
6. 적용 전에 기각 이유·예상 비용과 34° 미리보기를 본다. 도구④의 승인된 정적 임계 초과는 stroke 전체를 차단하고, 실측이 필요한 렌더 비용은 후보 상태로 남긴다. 한 stroke를 Undo 한 번으로 되돌리고, 지우기는 자기 레코드만 대상으로 한다.
7. 재생성은 같은 ID를 갱신하고 중복을 만들지 않는다. 맵 빌더 재실행 뒤에도 배치 카탈로그를 다시 적용한다. Terrain/Field 버전이 바뀌면 접지 검사를 무효화한다. 확정 후 도구③으로 실제 Player를 비교한다.

### Unity API 구분

| 구분 | 사용할 API와 확인 상태 |
|---|---|
| Editor 전용 | `EditorWindow`, `SerializedObject`, `AssetDatabase`, `PrefabUtility.InstantiatePrefab`은 기존 Editor 코드 사용 확인. `SceneView.duringSceneGui`는 [공개 API 확인](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/SceneView-duringSceneGui.html). `HandleUtility.GUIPointToWorldRay`, `Handles`, `Undo.RegisterCreatedObjectUndo`·`Undo.RecordObject`·`Undo.DestroyObjectImmediate`·Undo 그룹 처리의 설치 버전 연결은 **[확인 필요]** |
| 런타임에서도 사용 가능 | `Terrain.SampleHeight`, `TerrainData.GetInterpolatedNormal`, `Physics.Raycast`, Transform/Bounds, `Resources.Load`, `Object.Instantiate` 및 기존 높이/좌표 helper. 제작 중 호출하더라도 Editor 전용 API로 분류하지 않음. 런타임은 확정 카탈로그 적용만 수행하며 브러시·매 프레임 접지 스캔을 포함하지 않음 |

규모 **[추정] 5–7인일**, 우선순위 **P1**. 데모 v0 기여는 접지된 소규모 드레싱을 반복 제작하고 중복/밀도 실수를 줄이는 것이다. 위험은 실제 렌더 지면과 높이 함수의 차이, 재빌드로 배치 소실, prefab별 Collider 오염, 메시 복제로 배칭/메모리 악화다. 서로 다른 높이·소유 레이어에서는 적용을 거부하며, 공유 메시 유지가 기본이다. 승인 시험은 같은 seed 재적용의 멱등성, Undo, 기각 사유, 맵 재조립, Mac 34° Player의 접지·통로·먼 적 확인이다.

## 4. ② 분위기 프리셋 관리자

### 목적·v0 범위

MoodLab 실험값을 검토 가능한 **본선 후보 VolumeProfile과 환경 설정 묶음**으로 승격한다. Volume으로 표현되는 후처리와, Volume 밖의 Light·RenderSettings·재질 효과를 분리한다. 적용은 조명 writer 한 곳에서 수행하며 프리셋 창과 본선 초기화가 서로 덮어쓰지 않게 한다.

최신 인계의 a는 기준판, b는 높이 안개+림, c는 연속 매질+공기 원근, d는 WB+LUT다. 최초 인계의 다른 b/c/d 색감 표를 섞지 않는다. b/c는 불투명 메시 광학 overlay 근사이므로 **URP 내장 Volume 효과나 실제 volumetric으로 표시하지 않는다.** v0은 a와 Volume으로 옮길 수 있는 색 보정/WB/LUT부터 연결하고, b/c의 본선 효과 이식은 별도 가독·GPU 관문을 통과할 때만 포함한다.

### 입출력

- 입력: 총괄이 확정한 MoodLab 소스/데이터 버전, 프리셋 ID, 기존 본선 환경과 Volume, 실제 URP/Renderer·색 공간·품질, 기준 레퍼런스, 카메라 LOCK, 먼 적 검사 Shot, ④ 예산.
- 프리셋 구성: Volume의 ColorAdjustments·Tonemapping·WhiteBalance·ColorLookup 및 override 상태, Volume priority/weight/layer, 방향광·ambient·거리 안개, 별도 효과의 사용 여부/의존성. Camera 값은 소유하지 않고 LOCK 참조만 보관한다.
- 출력: 본선 후보 VolumeProfile과 환경 설정 데이터, 기존값 대비 diff, 효과별 지원 상태, Mac 판정 연결. b/c 효과 누락 시 유사한 기본 안개로 대체하고 같은 이름의 PASS를 주지 않는다.
- d의 LUT는 MoodLab에서 메모리 생성이다. 본선에서는 선택된 LUT 데이터의 영속 참조 또는 같은 생성 규칙·버전이 필요하다. 임시 Texture 참조만 VolumeProfile에 저장하지 않는다. N²×N 스트립, 활성 LUT 크기, linear 데이터·no-mip·Bilinear·Clamp와 톤 매퍼 순서를 검증한다.

### UI 흐름·LOCK·가독 관문

1. 기존 LookDev 창에서 MoodLab 버전과 대상 1-1 환경을 고른다. 현재 HEAD에 MoodLab이 없으면 반입 대기 상태를 표시하고 승격을 막는다. 인계문만 보고 소스 동기화 완료로 간주하지 않는다.
2. 읽기 전용 a와 후보를 나란히 표시한다. Volume 값과 환경 값을 별도 diff로 보고 임시 profile 인스턴스에서 미리보기한다. 취소/오류 시 원래 Light·fog·profile 참조를 복원한다.
3. **1-1 ForestA2 피치 34° / 거리 16.5u / 수직 FOV 46.9453° LOCK**. 본선 target/lookAhead·카메라 위치/clip·배우 크기도 영수증에 기록한다. `NativeRemodel3D`의 ForestA2 분기를 사용하며 비A2 48.7° 설정으로 되돌리지 않는다. 분위기 변경으로 카메라/배우 스케일을 보정하지 않는다.
4. MoodLab의 1.61u 표식을 0/7/12u에 놓은 동일 배치로 a–d를 비교한다. 인계의 **12u 표식 중심(y=.805u) 투과율 83% 기준**은 그 실험의 보조 관문이다. a/d 발끝 참고값 82.678%까지 83%를 충족한다고 쓰지 않는다. 안개 거리는 플레이어 반경이 아닌 camera eye-depth로 계산한다.
5. 본선에서는 실제 암색 적·리그픽셀 합성·이동/공격 자세와 발/피격 anchor를 확인한다. 12u는 실험 기준점이며 실제 최대 교전/가시 거리는 **[실측 필요]**다. 먼 적의 실루엣·움직임·텔레그래프가 안개·어둠·거목·색 보정에 묻히면 FAIL이다. 평균 휘도나 투과율만으로 PASS하지 않는다.
6. 1920×1080·3840×1080에서 1x 비교와 3x 확대를 보고, a→b→c→d→a 전환 시 효과 잔류·밴딩·점/그레인·색 공간·LUT 이상을 검사한다. d만 통과했다고 b/c를 통과시키지 않는다.
7. 후보 저장 → 도구③ Mac 본선 캡처/자연 플레이 → ④ 실측 예산 → 총괄의 본선 채택 순서다. 후보 저장 단계에는 PENDING_MAC을 유지한다. 기존 `NativeGame.A2Field`·`HellLighting`·`A2Forest`의 Volume/fog 변경 위치를 정리한 뒤, 맵 준비 완료 시 한 적용부가 최종 writer가 되게 한다.

### Unity API 구분

| 구분 | 사용할 API와 확인 상태 |
|---|---|
| Editor 전용 | `EditorWindow`, `SerializedObject`, `AssetDatabase.CreateAsset`·`AddObjectToAsset`·`SaveAssets`, `EditorUtility.SetDirty`. 새 profile과 override 구성요소의 subasset 저장·Undo 연결은 설치 버전에서 **[확인 필요]**. 원본 profile에 대한 미리보기 쓰기 금지 |
| 런타임에서도 사용 가능 | `Volume`, `VolumeProfile.Add<T>`·`TryGet<T>`, 각 `VolumeParameter.Override`, `ColorAdjustments`, `Tonemapping`, Light, `RenderSettings`는 기존 코드 또는 [Core 17.6 VolumeProfile](https://docs.unity3d.com/Packages/com.unity.render-pipelines.core@17.6/api/UnityEngine.Rendering.VolumeProfile.html)로 확인. `WhiteBalance`, `ColorLookup.texture/contribution/ValidateLUT()`는 최신 인계와 [URP 17.6 ColorLookup](https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@17.6/api/UnityEngine.Rendering.Universal.ColorLookup.html) 기준이며 설치 패키지 링크·Mac 셰이더 결과는 **[확인 필요]** |

규모 **[추정] 4–6인일**. b/c overlay의 별도 본선 이식·최적화는 이 범위를 넘으면 재산정한다. 우선순위 **P1**, 데모 v0 기여는 승인된 1-1 분위기의 재현과 임의 노출/안개 변경 방지다. 위험은 복수 writer, Volume 우선순위·camera layer 차이, rigpixel에 적용되지 않는 림/안개, overlay 추가 draw·24표본 fragment 비용, 임시 LUT 유실이다. Mac의 같은 소스 Player와 실제 원경 적 판정 전에는 채택하지 않는다.

## 5. ③ 키샷 비교판 자동 캡처

### 목적·입출력

같은 카메라·해상도·장면 상태로 만든 본선 Player 이미지와 레퍼런스를 한 판에서 비교한다. Editor LookDev는 빠른 사전 검토로 재사용하고, 최종 근거는 Mac의 같은 소스 Player 캡처다.

- 입력: Shot ID, source/build SHA, 기준 이미지와 그 카메라/해상도 정보, ② LOCK, 정확한 출력 해상도, 맵·seed·배우 위치·자세/틱·표식 위치, 분위기·품질·Renderer·AA·renderScale·동적 해상도 상태, HUD 포함 여부, 예열 완료 조건, QA sandbox와 공용 실행 작업 정보.
- 출력: raw 프레임, 같은 좌표의 레퍼런스 overlay, 좌우 비교판, 1x crop와 3x 최근접 확대, 렌더 상태/설정 일치 영수증, Mac 판정·핵심 로그. 고정 `capture-current` 안의 Shot/해상도별 명명으로 **최신 한 세트**만 유지한다. 시도별 폴더를 쌓지 않는다.
- reference의 크기나 카메라 근거가 다르면 strict 비교를 차단한다. 미술 콘셉트 그림처럼 카메라 일치가 성립하지 않는 자료는 방향 비교로만 표시한다. 자동 stretch·잘라맞춤·정합으로 동등한 구도처럼 보이게 만들지 않는다.

### UI 흐름·무창/무음·Mac 판정

1. LookDev의 Shot 목록에서 시작 목교·전투 통로/원경·보스 입구 등 v0 핵심 구도를 선택한다. 필요한 구도만 캡처하며 전체 지도를 매 변경마다 돌지 않는다.
2. 카메라와 render target 실측값을 입력 계약과 대조한다. 기존 GameLook001의 높이에 따른 FOV 계산을 1-1에 무조건 적용하지 않는다. 승인된 explicit pose 또는 본선 카메라 상태를 사용한다. 같은 해상도끼리 비교하고 16:9와 32:9는 각각 별도 기준판을 쓴다.
3. PC에서 필요한 후속 컴파일은 공용 실행기의 큐·소유권을 사용한다. Mac 담당은 기존 Mac 무창 실행 절차로 같은 커밋을 한 번 빌드하고, 확보된 Player로 필요한 Shot들을 촬영한다. **Mac 숨김 실행 인터페이스/무포커스 보장은 [확인 필요]**이며 Windows 옵션을 Mac에도 통한다고 가정하지 않는다. 숨김·무음·세이브 격리를 보장하지 못하면 실행을 중단한다.
4. 렌더링에는 GPU가 필요하므로 `-nographics`를 쓰지 않는다. batchmode 여부만으로 정상 화면을 보장하지 않는다. `NativeGuiCapture`의 RT+IMGUI 경로를 재사용하고 최종 카메라·후처리·HUD가 포함됐는지 검사한다. `--unity-mute`/기존 mute guard와 AudioListener pause/volume 0, VideoPlayer 경로까지 유지한다. 데스크톱 노출·포커스 탈취·오디오 출력은 허용하지 않는다.
5. 본선 캡처는 기존 QA sandbox와 인자 충돌 검사를 통과해야 한다. MoodLab은 전용 `--moodlab` 인자 묶음을 사용하며 `--remodel3d` 등 다른 검수 모드와 혼합하지 않는다. 일반 본선 Shot은 별도 본선 하니스를 사용한다. 현재 인계의 MoodLab 인자만으로 자동 캡처가 된다고 가정하지 않는다.
6. 장면·Resources·셰이더 준비와 지정 자세 안정화를 기다린 뒤 raw를 저장한다. timeout·검은 프레임·누락 자원·카메라 불일치·쓰기 실패·HUD 요청인데 IMGUI RepaintFrames=0이면 SETUP_FAILED다. 단순 밝기 수치 하나로 검은 프레임 여부를 확정하지 않고 예상 표식/내용의 존재도 확인한다.
7. 원본 raw는 그대로 두고 후처리 비교판에만 0–100% opacity 슬라이더·깜박 비교·동일 좌표 crop를 제공한다. 전체 축소판은 탐색용, 1x는 판정용이다. 기존 C# PNG/지표 코어를 사용하고 overlay 합성·strict 해상도 검사는 추가한다.
8. Mac 담당은 같은 Player의 자연 이동/전투도 확인하고 reference 옆의 1x/3x 화면에서 PASS/RETOUCH와 Shot별 이유를 기록한다. 정지 Shot의 강제 이동·AI 정지는 가독/접지 구도 확인일 뿐 자연 플레이 성공이나 성능 PASS가 아니다. 확인 완료 빌드는 보관하지 않고 확정 SHA·최신 판정 이미지·핵심 로그를 남긴다. 사용자가 여는 실행본/배포본은 정리 대상에서 제외한다.

### Unity API 구분

| 구분 | 사용할 API와 확인 상태 |
|---|---|
| Editor 전용 | LookDevShot/EditorWindow, `EditorSceneManager.OpenScene`, 임시 검토용 preview scene. 저장하지 않은 사용자 씬을 무인으로 닫지 않음. dirty 씬이면 작업을 거부하고 깨끗한 작업 상태에서 실행. scene 저장/dirty 규칙은 §8 적용 |
| 런타임에서도 사용 가능 | Camera/RenderTexture, `Texture2D.ReadPixels`·`Apply`, `ImageConversion.EncodeToPNG`, `NativeGuiCapture`, 기존 capture writer/mute guard. 기존 rig renderer의 `RenderPipeline.SubmitRenderRequest`와 [URP 17.6 SingleCameraRequest](https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@17.6/api/UnityEngine.Rendering.Universal.UniversalRenderPipeline.SingleCameraRequest.html)는 카메라 RT 검토에 재사용 가능. 전체 camera stack·IMGUI가 자동 포함된다고 가정하지 않음 |
| 연결 확인 필요 | LookDev의 `Camera.Render()` 경로는 기존 코드가 있다는 사실만 확인했다. 6000.6.7f1 URP·Metal에서 실제 지원/동등성은 **[확인 필요]**. 불가하면 기존 render request 경로를 검토하되, 마지막 화면과의 일치를 Mac에서 확인. 무창 Player에서 WaitForEndOfFrame/ScreenCapture만을 유일한 완료 조건으로 두지 않음 |

규모 **[추정] 3–5인일**, 우선순위 **P0·첫 착수**. 데모 v0 기여는 화면 수정의 동일 조건 증거와 Mac 판정 시간을 줄이는 것이다. 위험은 색 공간·readback 상하 반전·AA/renderScale·camera stack·폰트/HUD 누락, capture 중 GC/파일 쓰기 부하다. 성능 계측 구간과 PNG readback/인코딩/저장 구간은 분리한다. 하니스는 이미지 지표 회귀에만 쓰고 화면 합격을 자동 부여하지 않는다.

## 6. ④ 예산 검사기

### 목적·입출력·판정 방식

폴리곤·텍스처·draw call·Resources의 **승인된 임계 초과를 본선 적용/빌드 적격 단계에서 차단**한다. 검사만으로 자산을 삭제·축소·압축·이동하거나 코어 적 수/규칙을 바꾸지 않는다.

입력은 대상 OS/기기·그래픽 API·품질·해상도·맵/콘텐츠 flavor, 자산/의존성 목록, 실측 영수증, 승인 예산 프로필이다. 각 규칙은 지표·단위·집계 범위·상한·통계(p95/최대 등)·근거·측정 환경·소유자·승인 버전·예외 만료 조건을 가진다. 출력은 항목별 실제값/기준/초과량/원인 자산·경로와 통합 판정이다.

**our_tech_audit §4는 예산 기준값을 비워 두었다. 이 설계도 그 공백을 임의의 ‘영웅 5만 tri’, ‘draw 500’ 등으로 메우지 않는다.** 감사 수치는 현황이고 합격 상한이 아니다. 아래 모든 미정 예산은 총괄이 동일 콘텐츠 baseline을 실측한 뒤 승인해야 한다.

| 지표 | 감사의 현황·근거 | 검사·차단 기준 |
|---|---|---|
| 폴리곤/정점 | R7 FBX 삼각형 환산 93,437/제어점 142,733. EyeMass 12,504/25,168. r3 거목 19,888 tri, 전경 로그 45,719 tri | imported Mesh/submesh/LOD별 정점·삼각형, 인스턴스 수, 가시/그림자/반사/적 RT별 제출량을 분리. **자산별·화면별 상한 [실측 필요]**. FBX 제어점 수를 Unity vertexCount나 동시 화면량으로 대체하지 않음 |
| 텍스처 | A2/PBR importer는 max2048·HQ·밉 사용. 원화/pixel 정책은 다름. 감사의 atlas 400MiB·와이드 한 장 63.28MiB는 RGBA32 가정 | 경로별 import 규칙 위반은 확정 계약으로 차단(⑤). 실제 imported 폭/높이·format·mipmapCount와 상주 MiB 별도 수집. **상주 texture/RT 메모리 상한 [실측 필요]**. PNG 원본 byte에 압축률을 곱해 VRAM을 만들지 않음 |
| draw/SetPass/batches | 감사에는 실제 frame 값 없음. 적마다 render request, 수면 반사·overlay·개별 재질이 후보 | OS/API·품질·해상도별 자연 전투 p95와 최대/초과 지속 조건을 승인. **상한·관측 시간·허용 초과 조건 모두 [실측 필요]**. SRP Batcher ON을 draw 합쳐짐의 증거로 쓰지 않음 |
| Resources 원본 | `.meta` 제외 1,417파일 / **2,881,554,015 byte = 2,748.06MiB** | Git tree 원본 합계·그룹별 변화량을 검사. **원본 총량/증가 허용 상한은 정책 승인 필요**. 현재 합계를 자동 상한으로 삼지 않음. sparse 디스크 누락을 0으로 합산하지 않음 |
| 빌드 포함량·설치·다운로드 | 감사에서는 실제 빌드 미측정. `codex_asset_size`의 다운로드≤1.0GiB/설치≤2.0GiB는 내부 제안 | BuildReport의 imported 포함량, OS별 설치 파일, 실제 depot 다운로드를 다른 지표로 관리. **실측/총괄 승인 전 제안값의 hard gate 사용 금지**. Resources 원본을 설치 용량으로 보고하지 않음 |
| A2R 보존분 | 별도 ref의 797파일 / 1,247,335,249 byte, 현재 HEAD Resources에는 없음 | 현재 분모에 더하거나 제거 절감으로 잡지 않음. 반입 결정 시 별도 포함 목록·실측·예산 프로필 필요 |

### UI 흐름·측정 계약

1. DevTools 예산 창에서 자산 선택/맵/데모 빌드 범위를 고른다. 현재 importer·기하·Resources 원본 집계와 baseline 차이를 먼저 읽기 전용으로 표시한다.
2. 정적 메시 합계는 asset GUID의 고유 원본량과 실제 인스턴스별 제출 예상량을 나눠 표시한다. 삼각형 topology만 indexCount/3으로 세고 다른 topology는 별도 보고한다. unreadable mesh를 읽으려고 Read/Write를 자동 켜거나 런타임 clone을 만드는 것은 금지한다.
3. Resources는 동적 키·LoadAll 폴더·카탈로그·직렬화 의존성을 보존해 집계한다. ‘스크립트에서 키 미발견’을 자동 삭제/빌드 제외로 바꾸지 않는다. 필요하면 AssetDatabase 의존성 검사와 BuildReport를 대조한다.
4. 실측은 같은 소스 Player에서 타이틀/로비→1-1 진입→실제 밀집 전투/보스→복귀의 해당 구간을 사용한다. N(전체 적)/V(가시 적), 리그픽셀/기본 표현, 활성 카메라/RT, 그림자·반사·효과·품질을 기록한다. PC D3D11/D3D12와 Mac Metal의 결과를 섞지 않으며 실제 선택된 URP 자산 이름도 남긴다.
5. 기존 NativePerfProbe를 연결하되 counter별 Valid/표본 수를 보고한다. 현재 평균값 보고를 p95/최대값으로 해석하지 않는다. 필요한 원시 통계의 후속 보강 전에는 해당 항목을 PENDING_MEASUREMENT로 둔다. GPU timing=0은 미지원/설정 누락 가능성이므로 비용 0으로 처리하지 않는다.
6. 승인된 정적 상한 초과는 ① 적용·② 승격·일반 빌드 사전 검사에서 FAIL. draw/상주 메모리처럼 실행 뒤 아는 상한은 Player QA 뒤 본선/배포 적격 판정을 막는다. 누락 기준·서로 다른 SHA/설정·유효 표본 부족도 같은 적격 단계에서 차단한다.
7. **baseline용 진단 빌드는 허용**해야 측정을 채울 수 있다. 모드를 영수증에 명시하고 후보 배포·본선 승격과 구분한다. 빌드 전에는 알려진 정적 초과와 규칙 무결성을 검사하고, 빌드 후에는 실제 BuildReport와 Player 실측을 대조한다. 예외는 자산·사유·소유자·만료 버전을 기록한 승인 항목만 허용하며 무기한 전체 bypass는 두지 않는다.

### Unity API 구분

| 구분 | 사용할 API와 확인 상태 |
|---|---|
| Editor 전용 | `AssetDatabase` 자산/의존성 조회, `ModelImporter`·`TextureImporter`, `BuildPipeline.BuildPlayer`·`UnityEditor.Build.Reporting.BuildReport`. `IPreprocessBuildWithReport`는 [공개 6000.6 API 확인](https://docs.unity3d.com/6000.6/Documentation/ScriptReference/Build.IPreprocessBuildWithReport.html). `IPostprocessBuildWithReport`·`BuildFailedException`·BuildReport의 파일별 상세 접근은 설치 버전/빌드 옵션에서 **[확인 필요]**. 최신 빌드가 끝나기 전에 그 최종 크기를 안다고 가정하지 않음 |
| 런타임에서도 사용 가능 | `Mesh.vertexCount`·`subMeshCount`·`GetIndexCount`·`GetTopology`, Texture2D 크기/format/mipmapCount, `ProfilerRecorder`, `FrameTimingManager`, SystemInfo/QualitySettings/GraphicsSettings. `GetIndexCount`와 probe API는 기존 코드 사용 확인; [ProfilerRecorder 6000.6](https://docs.unity3d.com/6000.6/Documentation/ScriptReference/Unity.Profiling.ProfilerRecorder.html) 공개 확인. counter 이름·지원·포함 범위와 실제 상주 GPU byte 수집 경로는 **[확인 필요]** |

규모 **[추정] 4–6인일**, 우선순위 **P0**. 기기별 baseline 확보/실측 대기 시간은 별도다. 데모 v0 기여는 자산 증가와 잘못된 임포트가 검토 없이 들어가는 것을 막고, 실측 공백을 가시화하는 것이다. 위험은 계측 자체 부하, 평균값의 순간 비용 은폐, 정적 기하와 패스별 기하 중복 합산, 원본/상주/설치 단위 혼동이다. 확정 임계 경계의 정상/초과/누락 입력과 허용된 진단 모드만 후속 검사하며, Unity 없이 성능 예산 PASS를 주장하지 않는다.

## 7. ⑤ 에셋 임포트 규칙 자동 적용

### 목적·입출력

신규/재임포트 때 기존 제약을 유지하고, 현재 `.meta`·Default·플랫폼 override·postprocessor·실제 imported 결과의 불일치를 한 창에서 찾는다. 새 정책 엔진이 기존 임포터와 경쟁하지 않도록 **현재 writer를 재사용**한다. 파일명만 보고 프로젝트 전체 규칙을 덮어쓰지 않는다.

입력은 경로/자산 종류·명시 예외·기존 importer와 플랫폼 설정·규칙 버전, 출력은 미리보기 diff·대상 한정 적용 목록·실제 artifact 검사 결과·의도치 않은 meta 변화 목록이다. 미분류 자산은 자동 변경하지 않고 분류 대기로 둔다.

### 유지할 규칙과 우선순위

| 범위 | 유지 계약·충돌 방지 |
|---|---|
| 원화 UI 예외 | `SourceTextureImporter.OriginalUiNoMipmaps`의 lobby_poster 및 silver_hell의 btn_/lobby_enter_/visual_/name_/panel_frame/panel_corner/guide_button_glow를 최우선 유지. **mipmapEnabled=false, 실제 Texture2D.mipmapCount=1, Bilinear**. 사용자 표현의 mipCount=1은 실제 API 이름 mipmapCount로 검사 |
| 추가 원화 UI 검사 | 기존 SilverUiImportCheck의 `CharacterSelect/UI/button_iron.png` no-mip/Bilinear·meta 보존 계약도 유지. SourceTextureImporter 범위 밖이므로 범용 UI 규칙에 끌어들이지 않음 |
| 일반 silver UI | 위 예외를 제외한 기존 silverUi 분기는 mip ON/Trilinear. ‘UI는 모두 no-mip’로 바꾸지 않음. wide/loading/원화도 현행 경로 정책과 개별 예외를 먼저 대조 |
| A2/PBR | 기존 지정 A2와 hell_lighting PBR 경로는 max2048·CompressedHQ·mip ON·Trilinear·aniso8. normal과 color 판별에 따라 TextureImporterType/sRGB를 유지. A2 ground Repeat, 그 밖 A2 Clamp 등 기존 wrap 분기 보존 |
| pixel player/enemy | 현행 Point·no-mip·NPOT None·8192 상한 정책 유지. 적 atlas를 임의 2048로 낮춰 프레임 좌표/가독성을 깨뜨리지 않음. meta 상위 max와 Default의 차이는 실제 artifact에서 확인 |
| TitleSignboard/A | Default Texture2D·no-mip·8192·Uncompressed·Clamp·Bilinear·alphaIsTransparency=false, motion-mask는 linear. 다른 타이틀 경로에 같은 규칙을 무작정 확대하지 않음 |
| 3D 모델·리그 | CharacterLab과 Enemy3DImportCheck의 clip·bone/socket·재질/submesh·bounds 검사 유지. R7 법선 정리와 A2 메시 변형처럼 CPU 읽기가 필요한 모델은 isReadable 자동 해제 금지. normal/mask linear·albedo sRGB를 종류별로 유지 |
| 오디오 | SourceAudioImporter 재사용. Bgm은 실제 코드의 CompressedInMemory+MP3/quality .7·preload OFF·background ON·PreserveSampleRate. 나머지는 현행 PCM/DecompressOnLoad·preload ON. 주석의 ‘stream’만 보고 Streaming으로 바꾸지 않음 |
| 별도 A2R | 반입된 경우 A2RWebTextureImport/A2RModelsImporter 영역을 별도 규칙 소유자로 유지. C10/Web와 현재 Resources/Art를 같은 범위로 합치지 않음. 반입 전 이 경로의 자동 임포트 적용 없음 |

압축/해상도 최적화는 ④의 경고와 별개 변경안이다. `codex_asset_size`의 BC7·4096 시험을 이미 승인된 기본값으로 취급하지 않는다. 최종 플랫폼 포맷과 UI 글자·알파·어두운 그라데이션·화면비 품질은 Mac Player에서 확인한다.

### UI 흐름·Unity API

1. 임포트 창에서 선택 폴더/자산을 검사한다. 일치한 규칙·예외 우선순위·현재값·기대값·플랫폼 override를 읽기 전용 표로 보여 준다.
2. 충돌 규칙은 적용을 차단한다. 기존 source importer와 다른 postprocessor가 같은 필드를 쓰면 writer를 한 곳으로 정리하는 후속 변경이 먼저다. 이번 문서에서는 코드를 바꾸지 않는다.
3. 명시적으로 고른 변경분만 저장·대상 한정 재임포트한다. OnPreprocess 콜백 안에서 SaveAndReimport를 다시 호출하지 않는다. 전체 Assets 재임포트/Refresh를 상시 자동 실행하지 않는다. 신규 자산은 자기 경로의 기존 OnPreprocess에서 자동 적용한다.
4. Mac에서 SilverUiImportCheck의 기존 **같은 대상 두 번 임포트 후 meta 불변·mipmapCount=1** 관문을 재사용한다. 두 번은 이 검사 계약의 멱등성 확인이며 테스트 실패의 무수정 재시도와 구별한다. 일반 임포트는 필요한 대상만 한 번 수행한다. 리그는 Enemy3DImportCheck/CharacterLab 검사를 연결하고 실제 Player 판정은 분리한다.
5. 변경이 없는 자산은 재저장하지 않는다. 실패한 적용은 경로·필드 diff로 보고하고 다른 자산으로 확산하지 않는다. importer/meta 변경의 되돌림은 해당 소유 경로의 Git diff/커밋 기준으로 처리하며 프로젝트 사본을 만들지 않는다.

Editor 전용 API는 `AssetPostprocessor.OnPreprocessTexture/OnPreprocessAudio/OnPreprocessModel`, `AssetImporter.GetAtPath`, `TextureImporter`·`ModelImporter`·`AudioImporter`, `SaveAndReimport`, `AssetDatabase.ImportAsset/LoadAssetAtPath`다. 기존 코드 사용과 [6000.6 OnPreprocessTexture](https://docs.unity3d.com/6000.6/Documentation/ScriptReference/AssetPostprocessor.OnPreprocessTexture.html)를 확인했다. 규칙 순서를 위한 `GetPostprocessOrder`, 플랫폼 설정의 Get/Set 호출 조합·우선순위는 **[확인 필요]**이며 구현 전 설치 버전에서 대조한다.

런타임에서는 `Texture2D.mipmapCount`·format·크기와 로드된 모델/clip/socket을 QA로 읽는다. importer 설정·재임포트를 Player에서 실행하지 않는다.

규모 **[추정] 2–3인일**, 우선순위 **P0**. 데모 v0 기여는 원화 UI 퇴행과 잘못된 모델/텍스처 임포트를 초기에 차단하는 것이다. 위험은 postprocessor 순서, GetVersion 변경에 따른 광범위 재임포트, 잘못된 normal 판별, platform override로 인한 기대값 불일치다. 정책 확대 없이 기존 예외 보존과 실제 artifact 검사부터 제공한다.

## 8. API·저장 안전성의 공통 관문

- **API 존재 / 현재 소스 사용 / 설치 어셈블리 컴파일 / 실제 실행**은 서로 다른 증거다. 위 표의 공개 확인은 API 이름의 근거이며 6000.6.7f1 C#·URP·Metal 컴파일 성공을 뜻하지 않는다. 구현 착수 때 설치된 패키지/어셈블리의 실제 시그니처와 가시성을 먼저 대조한다. 확인 못 한 항목은 [확인 필요] 상태로 남긴다.
- `EditorSceneManager.MarkSceneClean`은 사용 후보에서 제외한다. 저장 상태를 속여 경고를 없애지 않는다. 실제 편집은 Undo와 [EditorSceneManager.MarkSceneDirty](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/SceneManagement.EditorSceneManager.MarkSceneDirty.html), 명시 저장은 기존 코드의 SaveScene을 쓴다. 검토용 변경은 메모리/preview scene에서 복원하고 dirty 씬의 자동 폐기·자동 저장을 하지 않는다.
- 프로필·배치·import 설정 저장은 사용자 worktree의 실제 소유 파일에만 한다. 읽기 전용 미리보기에서는 공유 VolumeProfile/Material/Mesh·씬·URP asset을 저장하지 않는다. 임시 자원은 취소·오류·종료에도 해제하고 domain reload 뒤 잔류를 확인한다.
- 카메라/Volume 반영·RT/Texture 생성·readback 등 Unity 객체 접근은 Unity 허용 스레드에서 한다. `NativeQaCaptureWriter`에는 인코딩을 마친 byte와 파일 쓰기만 넘긴다. 큐 포화·IO 오류·비어 있는 결과는 성공 영수증으로 끝내지 않는다.
- 새 RenderGraph·커스텀 renderer·서드파티 패키지를 도구 공통 기반으로 도입하지 않는다. b/c 효과 등 별도 런타임 렌더 변경이 필요하면 해당 범위와 검증 비용을 별도로 명시한다.

## 9. 구현 순서·공수·검토 완료 조건

| 순서 | 범위 | 규모 | 데모 v0에서 먼저 얻는 결과 |
|---|---|---|---|
| 1 | ③ strict Shot/비교판·Mac 전달 계약 | [추정] 3–5인일 | 동일 조건 화면 판정의 공통 증거 |
| 2 | ⑤ 기존 임포트 규칙 표시·대상 한정 적용·기존 검사 연결 | [추정] 2–3인일 | UI no-mip/리그/색 공간 퇴행 방지 |
| 3 | ④ 정적 예산 검사·실측 영수증 연결·적격 차단 | [추정] 4–6인일 | 미측정과 초과를 구별하고 무근거 PASS 방지 |
| 4 | ② a/Volume 항목의 본선 후보 적용 | [추정] 4–6인일 | 34° LOCK 아래 분위기 선택/복원 |
| 5 | ① 작은 소품 팔레트·배치 데이터 소비부 | [추정] 5–7인일 | 재빌드에도 유지되는 접지·밀도 드레싱 |
| 통합 | 다섯 도구 입력/영수증·동일 Player Mac 확인 | [추정] 2–3인일 | 한 번의 본선 검토 흐름 |

합계 **[추정] 20–30인일**. 기존 도구가 그대로 연결되고 단일 구현자가 작업하는 가정이다. 기기 확보·총괄/Mac 판정 대기, 새 렌더 기법 이식, 모델 재제작·자산 대량 최적화는 제외한다. 병렬 인원수만큼 단순히 달력 기간이 줄어든다고 보장하지 않는다. 총괄은 데모 v0에 ③⑤④를 먼저 연결하고, ②①은 승인된 작은 범위부터 선택할 수 있다.

후속 구현 완료는 문서나 컴파일만으로 판정하지 않는다. API/패키지 확인 → 변경 범위의 필요한 검사 → 같은 확정 소스의 Mac 빌드 1회 → 핵심 Shot와 관련 자연 플레이 → 총괄 판정의 흐름을 따른다. 무수정 반복 빌드·대량 캡처·매 빌드 byte manifest는 요구하지 않는다. 확정 임계가 비어 있거나 Mac 무창 캡처가 미확인인 상태는 해당 도구의 인수 미완료로 남긴다.

**현재 인계:** 설계 문서만 작성. 다섯 도구 구현·Unity API 설치 버전 컴파일·예산 실측·Mac 화면·본선 채택은 모두 미실행/미확인이다. 총괄 검토 뒤 커밋하며 이 레인에서는 commit·push하지 않는다.
