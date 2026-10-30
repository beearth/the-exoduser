# Godot 보존 · Unity 비교 시험 — 2026-10-24

현재 최우선 단위는 사용자 지정 [게임 로비·인트로/시네마틱 이식](UNITY_LOBBY_20261024.md)이다. 드랍/전투 확장보다 FDG·타이틀·지옥문·세계관 영상·로비의 실제 동작/시각 검수를 먼저 한다.

## 최신 사용자 확정 — UI/UX 먼저, 이후 Unity에서 재제작

UI/UX와 재사용할 기존 아트·데이터를 우선 제대로 이식하고, 맵·모션·이펙트 등은 이후 Unity에서 대부분 새로 제작하는 방향으로 작업 우선순위를 변경했다. 기존 표현은 임시 실행·비교용으로 보존한다. 직전 드랍 생성/획득 우선 순서는 UI/UX 우선으로 교체한다. [현재 범위·검수·자동 진행 기준](UNITY_UI_FIRST_REBUILD_20261024.md)이 아래 초기 비교 시험 기록보다 우선한다. Godot본·사용자 세이브는 계속 보존한다.

## 아래 내용은 초기 비교 시험 당시 기록

사용자 최신 정정 “고도는 남겨두고 유니티도 해보는거야 뭐가 더 쉽나”가 현재 방향이다. **Godot를 유지하면서 Unity도 시험하고, 어느 쪽이 원본 이식·수정·검수에 수월한지 비교한다. 최종 엔진은 확정하지 않았다.** 이전에 ‘Unity 전환 확정’으로 적은 해석을 정정한다. Godot 후보와 복구 브랜치 `codex/port-takeover-20261023`의 원격 `7d67c418205f4ae513a320df854bcad3cf7c7770`을 보존한다.

| 비교 기준 | 적용 |
|---|---|
| 같은 범위 | 같은 원본 snapshot·CH1 시작구간·시작장비 seed·60Hz·입력/전투 조건을 기준으로 비교. Godot 코드는 현재 보존하고 승인 없이 폐기/교체하지 않음 |
| 이식 난이도 | 실제 기록한 구현 시간, 오류 원인 파악/수정과 회귀 부담, 원본 수치·입력·시각 재현, 반복 빌드/실행의 안정성. 추정 작업시간이나 테스트 개수로 순위 매기지 않음 |
| 현재 판단 | Unity는 부분 전투 실행까지 확인했으나 기존 Godot와 구현 범위가 다름. Unity가 기존 Godot에서 정리한 맵/에셋/원본 자료를 재사용한 이점도 분리함. **어느 엔진이 더 쉽다는 결론은 보류** |

| 경계 | 현재 값 |
|---|---|
| 작업 브랜치 | `codex/unity-port-20261024` |
| 현재 프로젝트 | `E:/exoduser-wt/codex-port-takeover-20261023/unity` |
| 기반 HEAD | `7d67c418205f4ae513a320df854bcad3cf7c7770` |
| 원격 main 참고 | `fab7a167c30c6421bda8cf6d4c2ee2e7753e87f3`; 이 후보를 main 병합으로 보고하지 않음 |
| 공유 G: | HEAD `5659d14d38b8068518cb5866a336bf930a1abbce`, 기존 staged480파일 및 WORK 보존 |
| Unity | 설치된 `6000.4.8f1 (f8b72d3d7343)`, Windows standalone 모듈 존재 |
| 실제 실행 검증 | 초기 license 종료198 이후 활성화 확인. 실제 Editor 검사 PASS → Windows Development 빌드 PASS(오류0,860,830,571bytes) → 실제 Player 자동 이동·차지/해제·4처치와 PNG확인. 수동 플레이/전체 이식은 별도 |
| Hub | `G:/unity/Unity Hub/Unity Hub.exe`, 버전3.18.0 창/handle 확인. 최종 Editor에서 entitlement/license 초기화와 실제 import를 확인 |

## 이번 구현과 검증

| 항목 | 구현 / 증거 |
|---|---|
| 실행 구조 | C# Simulation → Unity NativeGame → SpriteRenderer·Camera·IMGUI. WebView·JS runtime 없음 |
| 시간·좌표 | 고정60Hz, 웹 픽셀/+Y 아래 → Unity100px/unit·Y 반전. 카메라1920×1080 기준 zoom1, 플레이어 중심 |
| 시작 | `FirstPlayable.unity`·EditorBuildSettings·고정 GUID. 원본 기본 기검참, 메뉴의 기본 무기 검증 모드도 유지 |
| 원본 상태 | 원본 mkP/defaultItems/applyStats의 실제15장비 표본. HP526, ST240, MP330, 쉴드285, 녹슨 검ATK18. [수치·함수/미완료](UNITY_SOURCE_CORE_20261024.md) |
| 시작 악의 | 사용자 공유 저장소를 열지 않는 격리 새 실행 기본1000(`game.html:63958`), 처치당+4 |
| 원본 맵 |200×200/40px, 시작4020,7420; 청크64·props36·타일/언덕 경사로/19prop ellipse. 새 지형 제작 아님 |
| 미디어 |132복사 영수증/184,855,995bytes, 각 파일 원본↔목적지 SHA256 대조. 기검참 원본 실버 시트 추가. `Tools/Fixtures/source_receipt.json`(I:); 신규 이미지 생성0 |
| 기검참 표현 | 원본3×3 시트/9프레임,192/252px×chargeScale, 잉크1.14배·잔상2개0.9배·glow1.08배·본체. 원본5슬롯 trail 사용. 차지40/80/120f 단계와2겹 시트/3개 표시선. Additive ONE/ONE 및 opacity RGB premultiply, 잉크 RGB5/4/6·밝기×2.4. Canvas blur5px는11×11 Gaussian shader 근사. 실제 build/GPU D3D12 렌더·차지/발사 화면 확인; 원본 pixel동등성·성능 미검증 |
| 기본 전투 | 일반 etype0 HP875+쉴드875(레벨1), 기본 무기 비용5·5프레임 swing/남은3 경계 타격, 원본 회복시간; 스폰 링5/580px·safePt |
| 기검참 판정 | 원본ST10,1·2타 즉시발사/3타 홀드 후 해제,40/80/120f에2/4/8배·최대120f, 검기 speed14·수명선감소·벽/LOS·actor identity별1회 관통. 시작장비 Lv1검기1940. 독립 원본 대조93/93; `Tools/ki-slash-oracle/runs/green-03-poise.json` |
| 일반 적 포이즈 | 신규 검토에서 stun종료 즉시완전회복 오류를 발견해 제거. 원본 실제loop처럼 marker만clear, hitstun/stun 조기반환 뒤 eligible200f마다최대15% 회복·새타격시타이머0. 실제 원문 prefix oracle RED7실패→GREEN7/7; `runs/green-poise.json` |
| 드랍 | 원본45% 장비 생성 요청까지. 실제 world mkItem factory가 없어 R 획득을 거절함. 시작 가방/장착 UI는 후속 UNITY-INVENTORY-01에서 별도 연결하며 가짜 드랍 획득 없음 |
| 모델 회귀 | .NET8 독립36검사/0실패. 원본 isW/canMv 직접 실행2523좌표 결과 일치. `portable-final/core-receipt.json` |
| 시작 장비 | 원본505난수/15장비와 추가887난수까지의 마법가방10/20어픽스. 후속 [UNITY-INVENTORY-01](UNITY_INVENTORY_20261024.md)에서 typed seed·C# stat 재계산·Tab화면·장착/해제·정리/이동 연결. 조건부 전투 어픽스/저장/드랍생성은 미완료 |
| 넉백 | 정적 검토 발견 +kb/.05 helper를 원본32764의 합성 충돌 kb×.5/감쇠.65로 수정. RED4실패→GREEN5/5 |
| 컴파일 | 설치 Unity assemblies에 대한 별도 .NET 정적 컴파일0오류/0경고. **Editor compile/import PASS 아님** |
| 검토 | core spec 제한범위 PASS; 코드 품질 검토에서 렌더120FPS/시뮬60Hz 걷기 깜빡임을 TickCount 캐시로 수정, 재검토 미해결P1/P2 없음. 실제 화면 인수 아님 |

원본 스냅샷 SHA256 `dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209`. 현재 G: 웹 핵심13함수는 동일하고 파일 전체 hash는 다르므로 최신 웹 전체 이식이라 부르지 않는다. 영수증과 첫 실패는 `I:/EXODUSER-Storage/qa/unity-port-20261024/`에 보존한다.

추가 기검참/포이즈8함수도 현재 G:와 snapshot의 원문이 일치한다(`ki-slash-oracle/oracle.json`의 `live_comparison`). 포이즈 수정 후 기본/맵36/36 회귀를 다시 통과했고 기검참 spec 재검토는 제한범위 PASS다. 렌더러는 `_Opacity`를 MaterialPropertyBlock으로 명시 전달해 SpriteRenderer 파이프라인별 색상 전달에 의존하지 않는다. Editor 검증 진입점의1254×1254 시트와 ShaderHasError 검사는 초기 license 차단 후 실제 실행까지 통과했다.

코드 품질 검토의 `PoiseTests.csproj` Git누락 P2는 ignore예외와 정확 경로 stage로 해결했다. index의 Core/검사 입력만 I: 새 폴더에 복원한 검사도 수행했다. SDK10에서는93/93·7/7 통과했으나, 명시 SDK8 구성에서 `dotnet run`이 custom OutputPath와 다른 기본 apphost를 찾아 실행 실패했다. 원인은 빌드가 아니라 runner의 실행 경로였으며 공통 `runner.cjs`가 build→생성 DLL 직접 실행하도록 수정했다. `global.json`은8.0.301/latestFeature, NuGet소스는 외부 package가 없어 clear한다. 최종 새 입력22파일 복원본 `I:/EXODUSER-Storage/qa/unity-port-20261024/fresh-ki-2026-10-24T04-03-59-821Z/RECEIPT.json`: SDK8 build0경고/0오류, 기검참93/93·포이즈7/7. 이 최소 복원 검사는 전체 game clone/Unity Player 실행이 아니다. 수정된 runner를 포함한 최종 코드 품질 재검토의 미해결 P1/P2는 없다.

## 실제 Windows Player 실행과 다음 작업

최신 진행 단위는 [UNITY-HUD-01](UNITY_HUD_20261024.md)이다. 빈 구슬의 실제 HP/MP-ST 수위·쉴드/포이즈와 실행 중 기검참 아이콘을 연결했다. 실제 Editor GPU3상태·Windows build0오류·HUD Player6검사·전투4처치/소리8회 회귀 및PNG검토를 확인했다. 전체 원본1x/자연 플레이/모든기능 인수는 별도이며 전체시각 RETOUCH를 유지한다.

최신 후속 **UNITY-FEEDBACK-01**은 [별도 보고서](UNITY_FEEDBACK_20261024.md)의 실제 새 Editor/build/Player까지 통과했다. 명중광·완충 섬광·5원음 연결,실제 요청8회/재생8회/출력peak.30688885·4처치·PNG5종을 확보했다. 아래 UNITY-PORT-04의 ‘명중광 미이식’ 판정은 이전 빌드 이력이며 현행 전체 시각 판정은 HUD fill/아이콘·원본1x·동적 환경 등이 남아 **RETOUCH**를 유지한다. 원본 hitstop은 소비 직전 비활성화하므로 미완료 기능으로 임의 freeze를 구현하지 않는다.

1. 초기 라이선스 차단 이후 최종 재시도에서 실제 import가 시작됐다. 계정/인증 파일을 변경하거나 복사하지 않았다.
2. 첫 실제 import는 이미지가 `textureShape:2` Cubemap으로 들어가 `Resources.Load<Texture2D>`가 null인 실패였다. D3D11 재현에서도 동일했다. Importer에 Texture2D 명시와 GetVersion1을 추가하고 재import해 Editor 검사를 통과했다. [공식 shape enum](https://github.com/Unity-Technologies/UnityCsReference/blob/master/Editor/Mono/AssetPipeline/TextureImporterEnums.cs).

   2026-10-30 keyshot2 후속: 위 Cubemap 수정 이력은 유지한다. 현행 SourceTextureImporter는 version2이며 `Resources/Art/map/hell_lighting`의 돌·재·수피 PBR7개만 Repeat/밉맵/올바른 normal·linear 규칙으로 분리했다. 원본 스프라이트·UI 경로의 기존 계약은 그대로다. [정확한 이름·수치와 실제 재임포트 검수](UNITY_RM_INT_RUNTIME_HOOK_20261028.md#외곽-깊이지형-밀도-인수-후보--keyshot2).
3. 실제 Windows 빌드와 Player 자동 입력을 완료했다. 자연 종주·사람의 입력/손맛·프레임 성능·원본1x 비교는 후속이며 아래 영수증 범위와 구분한다.
4. 후속 [UNITY-FEEDBACK-01](UNITY_FEEDBACK_20261024.md)에서 기검참 명중광·차지 섬광·원음5개를 연결한다. 원본은 hitstop을 소비 직전0으로 비활성화하므로 임의 화면 정지는 추가하지 않는다. 시작장비/가방 UI는 [UNITY-INVENTORY-01](UNITY_INVENTORY_20261024.md)로 연결하며 실제 검수 단계는 해당 보고서를 따른다. 화면 흔들림·slowMo, world 장비 생성·전체 인벤토리/어픽스·전체 적/투사체·Q/E 보호 계약·저장·지역/보스/클리어는 남아 있다. 현재 후보로 전체 이식 완료나 Unity 우위 확정을 주장하지 않는다.

Q/E 판정, 사용자 세이브, 웹/Godot 게임 코드, `2_3` 문서는 변경하지 않았다. 자동 서버 재시작·옛 팀 재가동·Steam 배포도 없다.

`--unity-smoke`는 실제 Player에서 같은 StepInput→Tick 경로로 이동30회·공격300회,120f 차지 후 해제를 실행하는 자동 fixture다. 플레이어 X4020→4101.58496, maximumCharge120, charged/released=true, 활성 검기 최대1, 시작 적5중4처치, totalDamage48509, 로드청크10을 기록했다. 전체 HUD 포함 시작/차지/해제/전투후 PNG4종을 저장하고 새 시작 메뉴로 돌아왔다. .NET 모델 결과와 별개인 실제 Player 실행이며 사람의 직접 입력 QA와 구분한다.

| 실제 산출물 | 위치 / 결과 |
|---|---|
| Editor PASS | `I:/EXODUSER-Storage/qa/unity-port-20261024/verify-2026-10-24T04-07-35-255Z/receipt.json` |
| Windows build | `I:/EXODUSER-Storage/qa/unity-port-20261024/build-2026-10-24T04-10-39-891Z/EXODUSER-Unity.exe`; `receipt.json` Succeeded/errors0 |
| Player | `I:/EXODUSER-Storage/qa/unity-port-20261024/player-2026-10-24T04-11-41-989Z/player-smoke.json`; D3D12, HWND 실제 창 확인 |
| 화면 | 같은 Player폴더의 `unity-first-playable.png`, `unity-ki-charge.png`, `unity-ki-release.png`, `unity-after-combat.png`; 첫3종 실제 픽셀 검토 |
| 오류 경계 | Player log에 Exception/ERROR/Shader error/InvalidOperation/Missing 매칭0. D3D12 debug info queue 조회 실패와 swapchain frame statistics fallback 경고가 있으므로 완전 무경고/성능 검증이라고 부르지 않음 |
| 시각 판정 | **RETOUCH**. 원본 바닥/props·플레이어/적·실버 검기·차지 표시를 실제로 확인. 빈 HUD orb/슬롯의 실제 fill/아이콘·가림/그림자·안개/생체 움직임·명중광 등 미이식. 전체 원본과 시각 동등성 인수는 아님 |

## 저장 정책

사용자 추가 지시 “고도본도 저장해두고 유니티도 한번 해봐”에 따라 Godot 물리 파일4,979개/2,071,696,605bytes를 `I:/EXODUSER-Storage/archive/E/exoduser-wt/godot-preserved-2026-10-24T03-53-13-702Z`에 복사했다. 전 파일 source-before/source-after/destination SHA256·원본 크기/mtime 대조를 통과했다. `PRESERVATION.json`에 파일별 hash와 두 Junction 목적지를 기록했다. `.godot` 재생성 cache는 제외했고 기존 tests/tools의 I: 실체는 보존했다. `godot-source.bundle`은 기반 `9734e2e79`를 prerequisite로 요구하는 증분 Git 번들이며 `git bundle verify`를 통과했다. 웹 source-root 미디어·Junction 대상·사용자 AppData 세이브까지 포함한 독립 실행 패키지라고 주장하지 않는다. Godot 원격 브랜치 `7d67c418205f4ae513a320df854bcad3cf7c7770`도 보존했다.

실제 Unity runtime C#·참조 미디어·실행 설정만 E:에 둔다. Library/Temp/Logs/UserSettings/Editor/Tools와 QA는 I:의 명시 단위로 분리했다. Junction 원본은 삭제하지 않는다. 라이선스/인증 파일은 Git이나 QA에 복사하지 않았다. Hub를 처음 띄울 때 `ALLUSERSPROFILE` 누락으로 경로 오류가 나서 해당 자식 프로세스에 실제 `ProgramData` 경로를 전달했으며 사용자 전역 환경은 바꾸지 않았다.

## MAP PRODUCTION REPORT

| §23 항목 | 이번 상태 |
|---|---|
| STAGE / MASTER | CH1-1 원본 데이터·전체 silhouette/regions/routes/side spaces 보존. 신규 master 제작 없음 |
| OUTER MASS / LARGE / MEDIUM | 원본64청크·36props 재사용. 배치·overlap·접합 변경 없음; 기존 웹 표현을 Unity에서 재검수해야 함 |
| GROUND | 원본 source_rect1,1/1024px → world1000px로 정렬. 그림자·안개·동적 생체 표현 미이식 |
| PLAYABLE | 원본 canMv2523표본 일치. 실제 Player 자동이동30회·공격300회/4처치 확인. 수동 combat readability·경로종주 미검증 |
| LANDMARK | 원본 좌표 보존, 상호작용/보스 진행 미이식 |
| CAMERA QA | START의 실제 Player PNG4종 확보/첫3종 검토. EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 및 원본1x 비교 미검증 |
| TECH QA | 모델/충돌·실제 Editor import/compile/shader·Windows build·Player 이동/공격·캡처 통과. loading비용/seam전체/GPU성능/장기실행 미검증 |
| FILES / GIT | unity 소스/에셋·자기 docs만. 타 팀/공용 staging/Godot 원본 무수정. 커밋·원격 SHA는 외부 DONE 영수증 |
| VISUAL VERDICT | **RETOUCH** — 시작구간 원본 미디어/실버 검기는 실제 확인했지만 HUD fill/아이콘·동적 환경·명중광/시각 동등성 미완료 |
| NEXT PASS | 원본1x 대조·HUD/효과/오디오·자연 플레이/경로종주·전체 기능 확대 |

이 판정은 실제 시작구간의 부분 시각 검토다. 전체 게임 완성 인수나 다른 카메라 구간의 visual PASS로 확대하지 않는다.

2026-10-24 로비/인트로 재작업 검수: v22b 실제113.2507초 자연끝·2718frame·20/20PASS·오디오폐기0. 로비타이포 후속33cb빌드0오류·별도UI12/12PASS·잘림수정확인, 완주재생코드SHA동일. 고정 E:/EXODUSER-Unity-Play/EXODUSER-Unity.exe, UDP/TCP0/개발연결없음. Godot·웹·사용자저장보존. 생성/저장/계정·일반OS입력/29언어/전체해상도·CSS인수는미완료, 전체VISUAL RETOUCH. 세부SSOT: [UNITY_LOBBY_20261024](UNITY_LOBBY_20261024.md).

2026-10-24 UI-DOCK 통합: 실제1920/1280/2560의HUD·인벤6런/PNG18장·기존자원/장착핸들러검수PASS. 독립시각7PNG검토에서이번도킹VISUAL PASS. 고정E:실행152파일갱신·SHA대조, I:원본/검수보존. 사람직접입력/전체UI/게임·인트로재완주는이결과와별도. [배치·실패·완료근거](UNITY_UI_DOCK_20261024.md).
