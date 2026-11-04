# 우리 프로젝트 기술 정적 분석

작성: 2026-11-05 / 정적 분석 전용 / 실행 성능 판정 보류

## 1. 범위와 증거 기준

- 작업본: `E:/exoduser-wt/codex-study-combat-team`, 브랜치 `codex/unity-audit-our-tech-20261105`.
- 기준 HEAD: `75add6ff4a6209e2590a7a626ffb4c37b5f0268e`. 시작 시 tracked 변경·untracked 파일 없음.
- 소유 산출물은 이 문서 하나다. 코드·에셋·설정·CHANGELOG 수정, checkout·sparse 변경, stage·commit·push, Unity·Player 실행, 빌드·캡처·프로파일링은 하지 않았다. 일반 운영 규칙의 커밋·CHANGELOG 요구보다 이번 사용자의 **문서 한 개 / 커밋 금지** 지시를 우선한다.
- Runtime 전체 파일 목록에서 Unity 메시지 Update/FixedUpdate/LateUpdate/OnGUI 및 같은 이름의 수동 호출 메서드를 검색한 뒤 주요 호출자→피호출자·상태 가드를 읽었다. Editor는 임포터·품질 선택 근거로 조사했으며 Editor 비용을 Player 프레임에 합치지 않았다.
- 크기 근거는 `git ls-tree -r -l HEAD -- unity/Assets`다. 수치는 **Git blob 원본 byte**이며 sparse 디스크 점유·압축 Player 크기·상주 RAM·VRAM과 다르다. Resources 집계에서 .meta와 폴더 항목을 제외했다.
- FBX88개를 Node로 파싱했다. 바이너리는 `git cat-file blob HEAD:<경로>`로 지정된 `I:/EXODUSER-Storage/codex-takeover/study-combat-team/our-tech-audit-blob.tmp`에 하나씩 추출·읽고 즉시 삭제했다. PNG는 큰 원본 상위40개와 적 atlas·대표 지면/캐릭터를 합친 **57개 표본**의 IHDR를 읽었다. 전체 텍스처 해상도를 표본에서 외삽하지 않았다. Unity 메시 YAML asset38개도 Node로 읽었다.
- PowerShell 입력을 닫고 Node 자식 Git의 stdin을 ignore로 닫았다. Python, I: 저장소 전체 재귀 검색, 프로세스 강제 종료는 사용하지 않았다. 별도 스크립트·JSON 산출물은 남기지 않았다.

**표기:** `[사실]`은 기준 SHA의 정적 코드에서 확인한 분기·생성·루프·상수다. 자산 수치는 `[정적 집계]`이며 Player 실측이 아니다. 실행 비용·위험 순위·메모리 가정은 `[추정]`이다. 오류 재현·개선 효과·배포 실행 옵션은 미확인이다.

경로 약어: `R/`=`unity/Assets/Exoduser/Runtime/`, `E/`=`unity/Assets/Exoduser/Editor/`, `A/`=`unity/Assets/Exoduser/`, `P/`=`unity/ProjectSettings/`. 파일:줄은 기준 SHA의 줄이다. 바이너리에는 줄이 없으므로 연결 .meta와 원본 파싱 표를 함께 제시한다.

## 2. 호출 빈도와 플랫폼

F=렌더 프레임/초, T=진행 중 Simulation 틱/초, G=OnGUI 호출/초, N=적 수, V=가시 리그 적 수, L=조명 수다. **G=F로 고정하지 않는다.** IMGUI의 Layout·Repaint·입력 이벤트별 작업과 실제 draw 제출은 다르다.

| 경로 | 정적 호출 조건·빈도 | 해석 |
|---|---|---|
| `R/NativeGame.cs:104`, `:259`, `:330` | [사실] Awake에서 fixedDeltaTime=1/60·targetFrameRate=120 지정. FixedUpdate 가드 통과 시 Tick1회(:345). Update는 로비·포커스·패널별 반환 존재 | T≈60, 실제 F·catch-up 횟수 미측정. P/TimeManager.asset:7의 초기 약0.02초를 제품50Hz로 오인하지 않음. 저장 FPS 옵션도 별도 적용됨 |
| `R/NativeGame.cs:566` | [사실] OnGUI가 패널/HUD·적 상태·플로팅 텍스트로 분기. 루트 전체의 Repaint 제한은 없음 | GUI 계산은 G회 가능, draw call은 별도 확인 |
| `R/NativeGame.Remodel3D.cs:35`, `:170` | [사실] --remodel3d 요청·씬 준비·Active 가드 통과 후 Late 표현 | 2D 전용 실행과 구분. R/NativeRemodel3D.cs:11의 Requested는 static 초기화 |
| `R/NativeGame.Enemy3D.cs:4`, `R/NativeEnemyRigPolicy.cs:8` | [사실] --enemy-render rigpixel 또는 --enemy-render=rigpixel 명시 시 리그 연결. renderer:60에서 3D Active도 요구 | 모든 기본 실행에서 활성이라고 단정하지 않음. 배포 옵션 미확인 |
| QA 검색 | [사실] R/NativeMuteGuard.cs:14는 mute 플래그 때만 host 설치, 비디오 Find는0.25초 간격(:23). R/NativePerfProbe.cs:49는 game 없을 때1초 간격 | 일반 플레이 매 프레임 Find로 집계하지 않음 |

### PC·Mac·백엔드 차이

| 항목 | PC 쪽 정적 값 | Mac 쪽 정적 값 | 적용 경계 |
|---|---|---|---|
| URP 자산 | A/Rendering/URP_PC_High.asset:28 MSAA4, :46 주광 shadow2048, :48 추가광8, :49 추가광shadow1, :57 거리45, :58 cascade3 | A/Rendering/URP_Mac_Balanced.asset:28 MSAA2, :46 shadow1024, :48 추가광6, :49 추가광shadow0, :57 거리32, :58 cascade2 | [정적 집계] 이름은 의도. E/Rm0EngineSetup.cs:84는 **OS 대신 quality index≥3=PC, 미만=Mac** 배정. P/QualitySettings.asset:341 Standalone 기본5. Mac에서 PC 자산을 쓸 가능성은 [추정]; 실제 pipeline 이름 필요 |
| 배칭 | 두 URP 자산 :72 SRP Batcher1, :73 Dynamic Batching0 | 동일 | [정적 집계] SRP Batcher ON은 draw call 병합 증거가 아님 |
| Renderer feature | A/Rendering/URP_PC_High_Renderer.asset:13 접촉음영, :39 Decal, :116 높이광산란, 각각active1 | A/Rendering/URP_Mac_Balanced_Renderer.asset:67 Decal active1. 같은 접촉음영/높이광산란 feature 이름은 이 자산에 없음 | [정적 집계] 실제 renderer 선택·런타임 추가 feature까지 확인 필요 |
| 반사 | R/A2RiverReflection.cs:25는 **Direct3D12이면 강도0·컴포넌트 비활성화** | Metal 전용 차단은 이 메서드에 없음 | [사실] D3D12 폴백 코드 확인. 주석의 과거 크래시는 이번 재현 증거가 아님. D3D11/D3D12/Metal 비용을 합치지 않음 |
| 임포트 | Texture Standalone override는 전부0, Audio overrides는 전부{} | 별도 Mac override는 조사한 meta에 없음 | [정적 집계] 공통 정책≠같은 GPU포맷·디코더 성능. P/ProjectSettings.asset:300 API목록은[]여서 실제 API 확정 불가 |
| intro 음성 | R/NativeLobbyVideo.cs:63 VideoPlayer/AudioSource 생성 | :81 주석은 macOS intro 음성 누락 배경 | [사실] 실제 fallback(:82)은 OS 매크로가 아닌 intro.mp4 && audioTrackCount==0. :83 Clip과 :86 동기화 Update host 사용 |

이후 공통 문제는 OS 분기가 없는 코드 경로다. 어느 OS가 더 느린지는 측정 전까지 판정하지 않는다.

## 3. 상위 문제 30개

**정적 위험도 순서이며 실측 병목 순위가 아니다.** 수정은 제안만 했다. 난이도 소/중/대는 Core 순서·화면 품질 보존 검증을 포함한다. 영향란 CPU/GPU/MEM/AUD/BUILD는 §7의 **실측·후속 확인 필수 관문**이다.

| 순위·문제 | 파일:줄 | 근거 | 호출 빈도·조건 | 예상 영향·확인 관문 | 고치는 법 | 난이도 |
|---|---|---|---|---|---|---|
| 01 전역 SpriteRenderer 검색 | R/NativeGame.Remodel3D.cs:217, :224; R/NativeGame.cs:418 | [사실] UpdateViews에서 투영 목록을 복원·비운 뒤 Late에서 FindObjectsByType 전체 순회. 같은 프레임 중복 가드 있음 | remodel3d Active, 일반적으로F회; 씬 sprite 수에 비례 | [추정] 검색 결과 배열·전역 스캔·Transform 작업 확대. CPU/MEM | 생성·파괴·풀 활성 때 등록, 대상 목록만 투영. 복원/최종 writer 순서 보존 | 중 |
| 02 적마다 카메라 렌더 요청 | R/NativeEnemyRigRenderer.cs:85, :95, :104 | [사실] 가시성 가드 통과 Actor마다 SubmitRenderRequest, 개별RT. 이 루프에 거리별 주기/프레임 분산 없음 | rigpixel+3D Active, 최대V×F 요청/초; 화면 밖·죽음 종료 제외 | [추정] camera 준비·culling·스키닝·제출이 적 수에 비례. CPU/GPU/MEM | 공유RT atlas·배치 캡처·거리별 주기·pose 재사용 검토. 피격정지/발 anchor 검증 | 대 |
| 03 sprite cache hit도 문자열 생성 | R/NativeGame.cs:445, :470, :471, :528 | [사실] 리소스/좌표/크기/pivot 문자열 결합 후 조회. idle/walk 경로도 매번 결합 | UpdateViews마다 적당2회+영웅 등; rigpixel 소스sprite 숨기기 전에도 수행 | [추정] 예열 뒤에도 문자열 생성 지속. CPU/MEM | 값 타입 키 또는 방향/프레임별 미리 만든 Sprite 배열로 인덱싱 | 중 |
| 04 매 틱 적 목록 ToArray | R/Core/Simulation.cs:145; R/Core/Simulation.PlayerCombat.cs:114; R/NativeGame.cs:345 | [사실] Enemies.ToArray 후 틱 루프. 조건부 공격 경로에도 추가 복사 | T≈60, N개/틱+조건부 추가 | [추정] x64참조8byte·N800 가정, 원소만6.4KB/틱≈0.37MiB/초. 헤더·다른복사 제외. CPU/MEM | 재사용 snapshot/지연 add-remove 큐. 사망·분열·소환 순서 보존, 단순foreach 치환 금지 | 대 |
| 05 AI query 새 목록·전체 탐색 | R/Core/Simulation.EnemyAi.cs:232, :249; R/Core/Simulation.EnemyBridge.cs:107 | [사실] cell범위를 계산해도 webEns 전체 필터. NearbyWebs/DeadPool도 새 List·전체순회 | 해당 AI/공격/query마다 | [추정] query수×N 탐색 및 반환목록 할당. CPU/MEM | 틱별 공간/사체 인덱스·호출자 소유 버퍼. 중첩 query 버퍼 덮임 방지 | 대 |
| 06 근접 연출 배열·Tuple·캡처 | R/NativeGame.MeleeParry.cs:19, :21, :24, :28 | [사실] new[]{body,walk}/new[]{core,halo}, Tuple.Create. marker정리는 p 캡처 List.Find | 연출 UpdateViews/Late, 대상 적/marker마다; 정리는 marker수×N | [추정] 작은 객체·중복 자세작업·탐색 비용. CPU/MEM | 두 원소 직접 처리, 값 타입 pose, 적ID 생존조회. 실행 writer 1곳으로 정리 | 중 |
| 07 숨긴2D 지면도 청크 관리 | R/NativeGame.cs:400, :402, :410, :434; R/NativeGame.Remodel3D.cs:184 | [사실] 비아레나 UpdateViews에서 HashSet/List생성·chunk순회. 3D Late는 해당 renderer를 숨김 | 비아레나 UpdateViews마다,3D에서도 호출 문맥 존재 | [추정] 보이지 않는 바닥 준비·해제 비용 가능. CPU/MEM | 범위 변경 때만 갱신·scratch 재사용. 2D폴백 복귀 준비 유지 | 중 |
| 08 드롭 HashSet 매 프레임 생성 | R/NativeGame.WorldDrops.cs:88, :92, :126; R/NativeGame.cs:482 | [사실] alive Set생성 후 Loot/drops순회. 제거 List는 필요할 때만 생성 | UpdateViews마다, 드롭0이어도 Set객체 생성 | [추정] 드롭 누적 시 관리·GC 상승. CPU/MEM | 이벤트 갱신 또는 scratch Set.Clear, 가시드롭만 bob/beam 갱신 | 소~중 |
| 09 숨은 적도 리그 pose 평가 | R/NativeEnemyRigRenderer.cs:53, :61, :65; R/NativeEnemyRigAnimator.cs:13, :32 | [사실] Sync의 Sample→graph.Evaluate는 Late 가시성검사보다 앞. AlwaysAnimate, 같은tick Sample skip없음. gone List도매Sync | rigpixel+3D, 등록N×UpdateViews | [추정] 안 그리는 적도 pose/bounds 비용. CPU/MEM | tick cache·거리/가시성 sampling. 재진입·죽음·피격 anchor 강제갱신 보장 | 중~대 |
| 10 Actor별 조명 순회·빈 결과 재Find | R/NativeEnemyRigRenderer.cs:80, :102; R/NativeRigPixelHero.cs:197, :240 | [사실] 캡처마다 L순회해4개선별. Find는120frame주기지만 Length0도조건. hero별도cache | V×F×L 선별; 빈결과면 매호출 Find 가능 | [추정] 조명·적 수 동반증가, 빈씬 검색반복. CPU/MEM | 공통 조명등록소·공간버킷, 빈cache도 scan시각까지 유효 처리 | 중 |
| 11 HUD 글리프별 측정·그리기 | R/NativeObjectivePanel.cs:48, :52, :55; R/NativeUiTextRun.cs:30; R/NativeFieldHud.cs:173 | [사실] 캡처람다·GUIContent, spacing이면 text-element별순회·그림자/본색 Label. 시계도글자별측정 | HUD OnGUI G회, 글자·필드수에 비례 | [추정] GUI/할당·그리기 횟수 확대. draw병합 미측정. CPU/GPU/MEM | 값/언어/폰트/크기 변경 시 layout캐시. 가능한 run은통합, 자간·복합문자 보존 | 중 |
| 12 플로팅 텍스트 후보 목록 | R/NativeFloatingTextLayout.cs:52, :54, :65, :67; R/NativeGame.cs:607 | [사실] dead List/Request class/Place후보 List생성. 점유상자마다후보추가·겹침검사 | HUD G회, 신규/재배치 요청수에 비례 | [추정] 다수 피해숫자에서 할당·탐색 집중. CPU/MEM | 요청/후보버퍼 풀·frame별배치 재사용. 우선순위·수명·숫자병합 보존 | 중 |
| 13 검수OFF에도 provenance 문자열 | R/NativeUiAudit.cs:33, :180, :243, :259 | [사실] GroupText/UV texture/GUIContent Label overload는 Source를먼저계산. 일반 DrawTexture(:174)/string Label(:258)은이미가드 | 해당 wrapper 호출마다, 검수OFF 일반GUI도해당 | [추정] 파일명/줄 결합문자열 발생. CPU/MEM | 호출부 Active가드 안에서 Source생성. 검수ON기능보존 | 소 |
| 14 적 상한 발동 임시 컨테이너 | R/Core/Simulation.EnemyCap.cs:19, :23, :25, :53 | [사실] 800초과→700목표 정리에서 배열/List3개/HashSet생성. 보통틱은반환 | N>800일 때만 | [추정] 최대밀집순간 GC/정리 겹침. CPU/MEM | capacity확보 scratch. in-place덮어쓰기·kill/재충원순서 oracle보존 | 중~대 |
| 15 JS 객체 이벤트 boxing | R/Core/EnemyHurtContext.Tail.cs:10, :11, :12; R/Core/EnemyHurt.DeathTail.cs:21, :27, :136 | [사실] double/bool을 KeyValuePair<string,object>에저장해boxing. BeanShot은수치다수, 새JsObj/List | 해당사망꼬리·탄생성분기마다, 무조건매프레임아님 | [추정] 연속처치/분열탄 burst 할당. CPU/MEM | typed DTO/tagged value. null/undefined·키순서·숫자의미 보존 | 대 |
| 16 반복 GetComponent | R/NativeGame.Remodel3D.cs:199; R/Vfx/NativeSkillRemaster.cs:163; R/Vfx/VfxBridge.cs:479 | [사실] Late의 CinemachineFollow, Surface의part MeshRenderer, decal Late의Projector 반복조회. MeshFilter(:144)는생성사건성 | 각각3D F회/part갱신/live decal×F | [추정] native조회누적. 조회자체를GC로단정안함. CPU | 생성/연결때참조저장. 값바뀔때만 size/MPB 전달검토 | 소~중 |
| 17 수면 반사 추가 패스 | R/A2RiverReflection.cs:25, :27, :31, :49 | [사실] 960×540 ARGBHalf+depth24. request생성/제출. 0.1초가드는 시간AND작은이동AND작은회전일때만return | 정지약10Hz, 이동임계넘으면F까지. D3D12는OFF | [추정] 추가월드culling/렌더·RT비용. CPU/GPU/MEM | 이동과무관한최대주기·수면가시성별갱신. 백엔드별실제반사품질비교 | 중 |
| 18 개별 합성/데칼 머티리얼 | R/NativeEnemyRigRenderer.cs:50, :98; R/Vfx/KiSlashVfxView.cs:214; R/Vfx/VfxBridge.cs:255 | [사실] 적별composite Material/RT, scar별Material복제. stain은pool확장때생성후재사용 | Actor/scar생성·stain pool확장, 활성기간상태분리 | [추정] material/texture·decal상태가배칭제약가능. GPU/MEM | 공유RT atlas/material·decal atlas/한정pool검토. MPB가항상SRP Batcher에유리하다고가정금지 | 중~대 |
| 19 작은 적에도 원본약1.2만tri | A/Resources/Enemies3D/EyeMass.fbx.meta:34; R/NativeEnemyRigRenderer.cs:38, :104 | [정적 집계] 적30종tri12,240~13,047. EyeMass정점25,168/tri12,504. 원본Geometry합산 | 해당Actor생성/캡처, 상주/가시수미확인 | [추정] V100·평균12,500tri면캡처약125만tri/갱신. 실제스키닝정점/패스미측정. CPU/GPU | 실루엣/anchor보존저폴리·거리LOD와캡처주기동시검토 | 대 |
| 20 고밀도 영웅·초기 표면 정리 | A/Art/Characters/Warrior/RemasterR7/Warrior_R7.fbx.meta:34; R/NativeRigPixelHero.cs:33, :144, :150, :171 | [정적 집계] R7정점142,733/tri93,437. [사실] 초기화4pass법선·주변27cell탐색·배열/Dictionary·mesh복제 | 초기화/재생성때, 매frame smoothing아님. 이후캡처별도 | [추정] 초기전환CPU/할당spike·clone메모리·스키닝부담. CPU/GPU/MEM | 법선/재질영역Editor bake, 원본1x품질보존LOD/리토폴로지 | 대 |
| 21 반복 숲 모듈·개별 메시 변형 | R/NativeGame.A2Field.cs:145, :163; R/NativeGame.A2Forest.cs:184, :212, :215, :224 | [정적 집계] r3거목각19,888tri/Hollow26,876/전경로그45,719. [사실] 반복Instantiate·일부mesh복제/접지/법선접선재계산 | 필드조립시인스턴스마다, 이후가시월드/그림자/반사참여가능 | [추정] 조립지연·clone메모리·기하량. 먼나무shadowOFF가기하LOD증거는아님. CPU/GPU/MEM | 접지bake/cache, 먼거리저폴리/카드·공유mesh instancing/청크검토 | 대 |
| 22 광범위 8192·무압축 정책 | E/SourceTextureImporter.cs:17, :39, :40; A/Resources/Art/FullscreenWide/58-32.png.meta:74 | [사실] A2/PBR예외외Resources/Art기본max8192·Uncompressed. [정적 집계] Default압축0=853/Default cap8192=846 | 임포트결정, 로드·표시시비용. 전부동시상주아님 | [추정] 로딩/GPU/RAM부담. PNG압축byte≠VRAM. MEM/BUILD | 종류별크기/압축정책. 원본UI글자·선·Normal/mask/색공간예외보존 | 중~대 |
| 23 8방향 적 atlas 메모리 | R/NativeGame.cs:470, :471; A/Resources/Art/enemy/atlas_ch1_8dir_walk_south.png.meta:74, :77 | [정적 집계] idle8장2048×1280/walk8장8192×1280, Default cap8192·압축0·밉0. [사실] rigpixel전소스sprite루프도사용 | 방향/프레임첫조회에서로드, spriteCache참조유지 | [추정] 원본크기RGBA32로전16장상주가정idle80+walk320=400MiB. 실제포맷/장수미확인. MEM/BUILD | 리그사용시불필요소스atlas지연, 폴백보장·방향별수명/압축정책검토 | 중~대 |
| 24 와이드 원화 캐시 수명 | R/NativeFullscreenArtwork.cs:10, :23; A/Resources/Art/FullscreenWide/58-32.png.meta:74 | [정적 집계]128파일/1,112,785,500byte, 대표7680×2160. [사실] 방문texture를static cache에보관, 이클래스해제경로없음 | wide화면원화첫방문마다추가 | [추정] RGBA32한장≈63.28MiB. 방문이력참조유지가능. MEM/BUILD | 화면별세트·한정LRU/명시수명. 원본/wide중복상주측정 | 중 |
| 25 meta·Default·postprocessor 차이 | E/SourceTextureImporter.cs:36; A/Resources/Art/map/a2/r3/Textures/RF3_Ancient_Tree_A_Normal.png.meta:34, :74, :77 | [정적 집계] normal원본4096², 상위max4096/Default2048·압축2/Standalone2048·override0. [사실] A2임포터2048/HQ재설정. walk상위2048/Default8192 | clean import·버전변경·재임포트시 | [추정] 잘못된품질/메모리예산. meta만으로최종artifact확정불가. MEM/BUILD | Default/override/정책을정리하고actual import결과확인. 원본4K를곧VRAM4K로계산금지 | 중 |
| 26 밉 스트리밍 미사용 | P/QualitySettings.asset:305; E/SourceTextureImporter.cs:35, :39, :43 | [정적 집계] streamingMipmaps0=1,057, mip0=569/1=488. 모든quality의streamingActive0. [사실] A2/PBR·UI·pixel정책상이 | 로드/축소표시, 활성set에따라영향 | [추정] 월드큰texture의residency부담. 밉없는pixel/UI는의도일수있음. GPU/MEM | 실제상주량후월드만streaming검토. 원본UI/pixel에일괄밉ON금지 | 중 |
| 27 PCM preload·BGM설명 차이 | E/SourceAudioImporter.cs:10, :13, :18; R/NativeFeedbackAudio.cs:58; R/NativeGameMusic.cs:35, :73 | [정적 집계]138clip load0/PCM0/preload1/background0, BGM16 load1/압축값3/preload0/background1. [사실] BGM코드는CompressedInMemory, 주석stream과다름 | SFX사전로드·ambient생성·곡전환시 | [추정] 긴음성/loop PCM확대·초기로딩, BGM압축상주/decode CPU. AUD/MEM | 짧은SFX/긴loop/음성/BGM별정책. PreserveSampleRate이므로override44100을실제레이트로확정금지 | 중 |
| 28 음향 flush 임시목록·누적로그 | R/NativeFeedbackAudio.cs:40, :285, :329, :334, :382, :390; R/NativeGame.cs:389 | [사실] Flush마다Dictionary2개, 재생/일부drop마다문자열Lines.Add. Reset에Lines.Clear없음 | UpdateGameMusic의Flush마다, 로그는사건수비례 | [추정] 프레임할당·긴플레이retained heap증가. CPU/MEM | Dictionary재사용, 제품로그bounded ring/검수옵션화. receipt유지 | 소~중 |
| 29 논리48 vs real32 voice | R/NativeFeedbackAudio.cs:262, :338, :362, :363, :380; P/AudioManager.asset:13, :14; R/NativeAmbientSources.cs:49, :87 | [사실] SFX논리48/hit3/tell2/일반6·category2. 프로젝트real32/virtual512. 환경·BGM·비디오는48풀외부. priority는Voice필드기록 | 동시전투/환경/영상. 소스pool수≠가청실제수 | [추정] 중요tell가상화·누락/DSP부담위험. AUD/CPU | 전source군총합/native priority확인, 중요도예산통합. real수를무조건올리지않음 | 중 |
| 30 Resources 큰 원본 세트 | R/NativeFullscreenArtwork.cs:23; R/NativeEnemyRigRenderer.cs:38; R/NativeGameMusic.cs:73; §6트리집계 | [정적 집계]1,417파일/2,881,554,015byte≈2.684GiB. FullscreenWide1.036GiB/fonts110,748,202byte. QA/미방문원화도존재 | Resources빌드입력범위. 최종import포함byte미확인; 미로드≠빌드제외 | [추정] 데모설치/패치·로딩관리부담. 전파일동시RAM상주주장아님. BUILD/MEM | demo/정식·언어·챕터포함계약후배포/로딩분리검토. string경로보존 | 대 |

완화 요인: [사실] R/NativeHud.cs:75 등의 GUIStyle은 초기화·재사용하며, 드롭 mask/beam material도 R/NativeGame.WorldDrops.cs:103에서 null일 때만 만든다. 이것을 매 프레임 new Material로 세지 않았다. R/NativeGraphicsOptions.cs:53의 죽은 Volume/Bloom 목록은 이미 재사용하고, 옵션OFF의 Volume Find는 :37에서30프레임 간격이다. R/NativeGame.SettingsOptions.cs:47의 showFps 스타일과 R/NativeGame.cs:612, :619의 notice 스타일 반복생성은 위30개 밖의 작은 개선 후보다.

### 할당·LINQ·boxing 해석

- [사실] 표는 참조 타입 컨테이너·배열·GUIContent·Tuple·캡처를 명시했다. new Vector3/Rect/Color와 값 타입 Box 자체를 힙 할당으로 세지 않았다.
- [사실] R/Core/Simulation.PlayerCombat.cs:3에 System.Linq import는 있지만 핫패스 근거는 :114의 ToArray다. List 자체 ToArray와 LINQ확장을 혼동하지 않았다. 조사한 주요 Runtime 경로에서 Where/OrderBy 연쇄를 병목으로 확정할 근거는 없었다. Editor LINQ는 제품 프레임에서 제외했다.
- [사실] noncapturing lambda(R/NativeGame.cs:495 RemoveAll, R/NativeFloatingTextLayout.cs:55 Sort)를 매회 closure로 단정하지 않았다. MeleeParry.cs:28의 p와 ObjectivePanel.cs:52의 지역변수는 캡처다. 실제 생성byte는 컴파일된Player에서 확인해야 한다.
- [사실] R/NativeUiAudit.cs:202의 new object[]에는 Rect/Color32/bool boxing이 있고 :204 이후 reflection/GetValue도 반복한다. 그러나 :225의 Active가드 뒤인 **검수ON 비용**이다. 일반 플레이 확정병목으로 넣지 않았으며, 13번의 가드이전 문자열과 구분했다.

## 4. 예산 대비 표

`codex_tech_budget.md`는 다른 레인이 작성 중이며 이 작업본에서 읽거나 추정해 채우지 않았다. **기준값 칸은 의도적으로 비웠다. 모든 판정은 ‘병합 때 대조’다.** 원본총량과 프레임 실제량을 서로 비교하지 않는다.

| 지표·단위 | 정적 관찰값 / 실측 공백 | 기준값 | 예산 판정 | 후속 확인 |
|---|---|---|---|---|
| Simulation 틱 | [사실] Awake에서60Hz, ms/tick미측정 | | 병합 때 대조 | CPU ms/tick·catch-up |
| CPU frame p50/p95/p99·최악ms | 미측정;전역Find·query·pose 후보 | | 병합 때 대조 | CPU 관문·옵션/N/V별 |
| GPU frame ms | 미측정;적별render request·반사 | | 병합 때 대조 | 실제API/카메라별 |
| GC Alloc B/frame·B/tick | 미측정;ToArray·문자열·컨테이너·GUI캡처 | | 병합 때 대조 | Update/Fixed/Late/GUI별stack |
| SetPass·draw/batch/frame | 미측정;개별RT/material/decal,SRP Batcher1/Dynamic0 | | 병합 때 대조 | Frame Debugger |
| 가시적/캡처수/frame | V미측정;조건부최대V request/frame | | 병합 때 대조 | 옵션·상주Actor·가시성 |
| 영웅 정점/tri | [정적 집계]R7 FBX142,733/93,437 | | 병합 때 대조 | 실제mesh/submesh/스키닝/패스 |
| 적 정점/tri | [정적 집계]EyeMass25,168/12,504;30종tri12,240~13,047 | | 병합 때 대조 | N/V·LOD |
| 월드 module 정점/tri | [정적 집계]r3거목11,699/19,888;전경로그27,064/45,719 | | 병합 때 대조 | 가시인스턴스/그림자/반사 |
| 전체원본모델 | [정적 집계]FBX88:정점2,108,625/tri환산1,653,385;meshasset38:정점276,706/tri152,174 | | 병합 때 대조 | 파일총량,씬/frame예산과직접비교금지 |
| texture GPU MiB | 미측정;가정RGBA32라면적atlas16장400MiB/7680×2160한장63.28MiB | | 병합 때 대조 | 실제format·mip·resident set |
| texture import | [정적 집계]1,057개;Default압축0=853/cap8192=846;밉569off/488on | | 병합 때 대조 | 실제artifact해상도·압축 |
| mesh CPU/runtime clone MiB | 미측정;Model meta Readable1=46/0=18/키없음24 | | 병합 때 대조 | native/managed복사량 |
| audio memory·DSP CPU | 미측정;138PCM/preload,16BGM compressed-in-memory | | 병합 때 대조 | 길이/채널/decodedbyte/CPU |
| audio 동시voice | [사실]SFX논리48/hit3/tell2;real32/virtual512,환경/BGM/영상별도 | | 병합 때 대조 | 전체총합/가상화/native priority |
| 필드진입/로드ms | 미측정;R7표면정리/A2접지/동기로드 | | 병합 때 대조 | load/assembly/첫가시frame |
| Resources 원본byte | [정적 집계]2,881,554,015byte/1,417파일,최종빌드크기미확인 | | 병합 때 대조 | demo/정식Build Report |
| StreamingAssets 원본byte | [정적 집계]68,692,282byte/12파일,Resources와별도 | | 병합 때 대조 | 포함영상/패키지 |
| PC/Mac 품질 | [정적 집계]두자산값상이,Standalone기본quality5 | | 병합 때 대조 | 실제pipeline/renderer/API |

## 5. 텍스처·오디오 설정 집계

### 텍스처

[정적 집계] TextureImporter meta1,057개. Read/Write1=24/0=1,033, textureType0=1,015/1=42. Standalone override1은0개다. 아래는 **직렬화 필드**이며 postprocessor 적용 후 artifact 실측이 아니다.

| 필드 | 값별 개수 |
|---|---|
| 상위 maxTextureSize |64:1 /256:4 /1024:47 /2048:631 /4096:85 /8192:289 |
| DefaultTexturePlatform maxTextureSize |1024:13 /2048:194 /4096:4 /8192:846 |
| Default textureCompression |0:853 /1:27 /2:177 |
| enableMipMap |0:569 /1:488 |
| streamingMipmaps |0:1,057 |

상위 max와 Default cap은 다르다. 원본 해상도만 보고 ‘4K가 그대로 GPU에 올라간다’고 쓰지 않는다. E/SourceTextureImporter.cs:35는 A2/PBR에 밉·HQ압축·max2048·Trilinear·aniso8을 지정하고, :39 이후 일반 원화·pixel atlas 정책은 다르다. 57개 IHDR 표본의 원본 해상도와 두 cap을 §9에 병기했다. CPU 합성/GetPixels가 필요한 texture와 GPU표시용을 구분한 뒤 Read/Write를 줄여야 한다.

### 오디오

[정적 집계] AudioImporter154개 모두 Resources/Audio 클립, forceToMono0, sampleRateSetting0, 플랫폼 override {}. sampleRateOverride44100은 실제44.1kHz 재샘플링 증거가 아니다. SourceAudioImporter는 PreserveSampleRate을 명시한다.

| 종류 | 개수 | loadType·압축 | preload·background | 정적 해석 |
|---|---:|---|---|---|
| Bgm |16 |1/compressionFormat3/quality0.7 |0/1 |E/SourceAudioImporter.cs:13의 CompressedInMemory+MP3. Streaming으로 표기하지 않음 |
| 나머지 SFX·앰비언트·로비 |138 |0/compressionFormat0/quality1 |1/0 |:18의 DecompressOnLoad+PCM. 개별duration/decoded PCM byte 미측정 |

[사실] NativeFeedbackAudio에는 일반pending6/flush·category2, low hit3동시, tell2동시, 동일키/tell 시간간격, 최대48논리활성 및 우선순위 교체가 있다. ‘무제한 재생’이라고 쓰면 틀리다. 다만 NativeAmbientSources의 강/늪/나무, NativeGameMusic의 music/bed/arenaBed, NativeLobbyVideo voice는 이 풀 밖이다. 전체real32에서 중요소리가 가상화되는지 AUD 관문에서 확인해야 한다.

## 6. Resources 빌드 포함 원본 범위

[정적 집계] Resources 경로의 .meta 제외 **원본 입력** 총량이다. 씬 미참조·아직미로드만으로 빌드 제외를 가정하지 않았다. imported object·의존성·플랫폼변환·shader stripping·build tool filtering에 따른 **최종 포함byte는 미측정**이다. 원본 byte를 설치용량으로 단정하지 않는다.

| Resources 하위 (A/Resources/) | 파일 수 | Git 원본 byte | MiB |
|---|---:|---:|---:|
| Art | 1135 | 2,639,706,495 | 2517.42 |
| Audio | 157 | 138,608,912 | 132.19 |
| Characters | 1 | 10,113 | 0.01 |
| Data | 51 | 2,437,965 | 2.33 |
| Enemies3D | 32 | 99,711,618 | 95.09 |
| QA | 1 | 1,227 | 0.00 |
| Shaders | 27 | 85,886 | 0.08 |
| VFX | 13 | 991,799 | 0.95 |
| 합계 | 1417 | 2,881,554,015 | 2748.06 |

Art 하위 주요 범위:

| Art 하위 | 원본파일 수 | 원본byte |
|---|---:|---:|
| FullscreenWide |128 |1,112,785,500 |
| fonts |30 |110,748,202 |
| enemy |17 |27,507,104 |
| lobby |24 |43,659,500 |
| map |348 |586,511,657 |

fonts30파일에는 폰트 외 부속 입력도 포함된다. 실제 ttf14개37,034,704byte+otf3개73,658,848byte다. CJK jp/sc/tc OTF3개 합이73,658,848byte이므로 언어별 배포·fallback glyph 계약 없이 줄이지 않는다.

별도 unity/Assets/StreamingAssets는 .meta 제외12파일/68,692,282byte이며 Resources 합계에 넣지 않았다. QA폴더나 원본파일은 이름만으로 ‘미사용’ 판정·삭제 제안으로 바꾸지 않는다.

## 7. 프로파일러 실측·후속 확인 필수 항목

아래는 **이번에 수행한 테스트가 아니라 후속 관문**이다. Unity·Player는 실행하지 않았고 전부 미확인이다. 예산문서가 병합된 뒤 조건·기준값·판정을 작성한다.

| 관문 | 연결 문제 | 측정 항목 | 조건·판정 경계 |
|---|---|---|---|
| CPU |01~17,19~21,28~29 |Main/Render thread p50/p95/p99, GC Alloc 호출stack, ms/tick, Find/query/pose/GUI, catch-up |동일SHA Player, 일반/remodel3d/rigpixel 분리. N/V/G·해상도·FPS제한 기록. QA 자체부하 분리 |
| GPU |02,11,17~23,26 |카메라별GPU ms·request수·draw/SetPass/batch·스키닝·shadow/decal/반사·overdraw |PC D3D11/D3D12,Mac실제API 각각. Frame Debugger는원인분석, 도구부하를정상프레임시간과구분 |
| MEM |01~28,30 |actual texture format/해상도/mip/resident byte, source/clone mesh, RT/depth, retained heap/cache/Lines |초기→필드→밀집전투→원화여러장방문→복귀 비교. Resources총량을RAM으로대체금지 |
| AUD |27,29 |DSP/Streaming CPU·decoded/압축clip메모리·real/virtual voice·중요tell 가청·peak source |환경/BGM/전투/비디오중첩. 정상청감판정은담당Mac레인, 이번감사청감PASS없음 |
| BUILD |22~27,30 |Build Report의Resources/의존성포함byte·actual import artifact·배포목록 |demo/정식·OS별분리, 원본SHA와실행빌드SHA연결. 임포트확인은이번작업밖 |

‘감소 예상’은 개선효과 확정이 아니다. Core 목록/RNG/사망·분열 순서, 34°카메라·발/피격 anchor·원본UI 글자품질을 보존해야 하며 이 정적 문서로 제품 PASS를 주지 않는다.

## 8. 모델 파싱 근거와 전체 FBX 목록

[정적 집계] Assets 안 확장자 기준 FBX88개, GLB/GLTF/OBJ/독립 .mesh0개. FBX88/88에서 유효 정점·polygon indices를 읽었다. 합계정점2,108,625/삼각형환산1,653,385. Rigged/Run/Walk는 별개 원본으로 합산했으므로 **동시에 그려지는 서로 다른 모델 합계가 아니다.**

Node parser는 Kaydara FBX Binary magic·offset23 version을 확인하고, version≥7500이면64bit/미만이면32bit node header를 재귀 순회했다. Geometry/Vertices array length÷3=제어점 정점이다. Geometry/PolygonVertexIndex의 zlib배열을 풀고 음수로 끝나는 face마다 max(0,index수-2)를 합산했다. 이는 n-gon의 **삼각형 수량 환산**이다. Unity 실제 분할 모양·UV/normal분리 후 vertexCount·mesh최적화·submesh·LOD를 재현한 것이 아니다. Geometry 수는 submesh 수와 다르다.

바이너리에는 줄이 없으며 git 경로·기준HEAD·FBX node가 근거다. Model meta meshCompression0=88개, isReadable1=46/0=18/키없음24개다. 키없음을0으로 추측하지 않았다. R/NativeRigPixelHero.cs:146와 R/NativeGame.A2Forest.cs:214는 readable을 요구하므로 일괄해제는 안전한 수정안이 아니다.



<!-- AUDIT_MODEL_TABLE -->
| 모델 경로 (unity/Assets/Exoduser/ 기준) | Git 원본 byte | 제어점 정점 | 삼각형 환산 | Geometry |
|---|---:|---:|---:|---:|
| Art/Characters/Ivan/Ivan_Rigged.fbx | 18440908 | 105556 | 61522 | 1 |
| Art/Characters/Ivan/Ivan_Run.fbx | 18453404 | 105556 | 61522 | 1 |
| Art/Characters/Ivan/Ivan_Walk.fbx | 18461452 | 105556 | 61522 | 1 |
| Art/Characters/Ivan/Weapon/Ivan_Gun.fbx | 13702188 | 9901 | 19845 | 1 |
| Art/Characters/Silvertail/Silvertail_Rigged.fbx | 18477772 | 92665 | 61410 | 1 |
| Art/Characters/Silvertail/Silvertail_Run.fbx | 18490220 | 92665 | 61410 | 1 |
| Art/Characters/Silvertail/Silvertail_Walk.fbx | 18498236 | 92665 | 61410 | 1 |
| Art/Characters/Silvertail/Weapon/Silvertail_Dagger.fbx | 14153404 | 10025 | 20035 | 1 |
| Art/Characters/Warrior/RemasterR7/Warrior_R7.fbx | 6988236 | 142733 | 93437 | 1 |
| Art/Characters/Warrior/Warrior_Rigged.fbx | 19569020 | 97656 | 61981 | 1 |
| Art/Characters/Warrior/Weapon/Warrior_Greatsword.fbx | 14140604 | 9615 | 19176 | 1 |
| Remodel/Boss/DarkDruid/Source/00_Druid_Rig.fbx | 18576700 | 99643 | 61063 | 1 |
| Remodel/Boss/DarkDruid/Source/10_Slam127.fbx | 18196988 | 97656 | 61981 | 1 |
| Remodel/Boss/DarkDruid/Source/11_Walk.fbx | 18597212 | 99643 | 61063 | 1 |
| Resources/Art/map/a2/Models/RF_Ancient_Rotten_Tree.fbx | 937740 | 12953 | 21479 | 1 |
| Resources/Art/map/a2/Models/RF_Broken_Stone_Bridge.fbx | 287180 | 3327 | 6378 | 1 |
| Resources/Art/map/a2/Models/RF_Corroded_Riverbank.fbx | 88860 | 847 | 1666 | 1 |
| Resources/Art/map/a2/Models/RF_Fallen_Log.fbx | 339948 | 4883 | 9762 | 1 |
| Resources/Art/map/a2/Models/RF_Foam_Bank.fbx | 126604 | 1618 | 3228 | 1 |
| Resources/Art/map/a2/Models/RF_Forest_Vista_Card.fbx | 19436 | 4 | 2 | 1 |
| Resources/Art/map/a2/Models/RF_Fungal_Colony.fbx | 110060 | 1438 | 2832 | 1 |
| Resources/Art/map/a2/Models/RF_Hanging_Moss.fbx | 159820 | 2065 | 3946 | 1 |
| Resources/Art/map/a2/Models/RF_Riverbed.fbx | 66876 | 661 | 1232 | 1 |
| Resources/Art/map/a2/Models/RF_Rotten_Wood_Bridge.fbx | 278476 | 3832 | 7540 | 1 |
| Resources/Art/map/a2/Models/RF_Withered_Shrub.fbx | 115244 | 1435 | 2814 | 1 |
| Resources/Art/map/a2/foreground/Models/A2_Scanned_Foreground_Log.fbx | 1702204 | 27064 | 45719 | 1 |
| Resources/Art/map/a2/hollow/Models/A2_Hollow_Loft_Tree.fbx | 647516 | 13510 | 26876 | 1 |
| Resources/Art/map/a2/r3/Models/RF3_Ancient_Tree_A.fbx | 704860 | 11699 | 19888 | 1 |
| Resources/Art/map/a2/r3/Models/RF3_Ancient_Tree_B.fbx | 707676 | 11699 | 19888 | 1 |
| Resources/Art/map/a2/r3/Models/RF3_Bridge_Torch_Holder.fbx | 50092 | 486 | 928 | 1 |
| Resources/Art/map/a2/r3/Models/RF3_Dead_Leaf_Litter.fbx | 45596 | 720 | 768 | 1 |
| Resources/Art/map/a2/r3/Models/RF3_Fallen_Log.fbx | 1005980 | 14028 | 22265 | 1 |
| Resources/Art/map/a2/r3/Models/RF3_Foreground_Branch_Frame.fbx | 1833180 | 28056 | 44530 | 1 |
| Resources/Art/map/a2/r3/Models/RF3_Forest_Vista_Card.fbx | 23532 | 4 | 2 | 1 |
| Resources/Art/map/a2/r3/Models/RF3_Fungal_Colony.fbx | 73500 | 840 | 1620 | 1 |
| Resources/Art/map/a2/r3/Models/RF3_Hanging_Moss.fbx | 448172 | 11016 | 11200 | 1 |
| Resources/Art/map/a2/r3/Models/RF3_Moss_Cushion.fbx | 35964 | 313 | 332 | 1 |
| Resources/Art/map/a2/r3/Models/RF3_Moss_Rock_1.fbx | 309388 | 4698 | 8250 | 1 |
| Resources/Art/map/a2/r3/Models/RF3_Moss_Rock_2.fbx | 311420 | 4809 | 8247 | 1 |
| Resources/Art/map/a2/r3/Models/RF3_Moss_Rock_3.fbx | 151692 | 2116 | 3750 | 1 |
| Resources/Art/map/a2/r3/Models/RF3_River_Stake_Cluster.fbx | 969756 | 15471 | 20035 | 1 |
| Resources/Art/map/a2/r3/Models/RF3_Root_Stump.fbx | 659516 | 8860 | 14365 | 1 |
| Resources/Art/map/a2/r3/Models/RF3_Rotten_Wood_Bridge.fbx | 501852 | 8663 | 16938 | 1 |
| Resources/Art/map/a2/r3/Models/RF3_Withered_Shrub.fbx | 1125772 | 23520 | 33148 | 1 |
| Resources/Art/map/a2/raisedroots/Models/A2_Raised_Root_Cluster.fbx | 1712284 | 18181 | 36040 | 1 |
| Resources/Art/map/a2/rootrelief/Models/A2_Root_Cluster_Patch.fbx | 1723756 | 18181 | 36040 | 1 |
| Resources/Art/map/a2/roots/Models/A2_PineRoots_A.fbx | 747164 | 10339 | 16324 | 1 |
| Resources/Art/map/a2/roots/Models/A2_PineRoots_B.fbx | 737308 | 9907 | 16213 | 1 |
| Resources/Art/map/a2/stump/Models/A2_Scanned_Stump.fbx | 909900 | 12033 | 20523 | 1 |
| Resources/Art/map/keyshot/brazier.fbx | 164796 | 3006 | 5808 | 1 |
| Resources/Art/map/keyshot/fallen_root.fbx | 46812 | 542 | 1064 | 1 |
| Resources/Art/map/keyshot/ribs.fbx | 44476 | 508 | 956 | 1 |
| Resources/Art/map/keyshot/rock_0.fbx | 16044 | 66 | 128 | 1 |
| Resources/Art/map/keyshot/rock_1.fbx | 16060 | 66 | 128 | 1 |
| Resources/Art/map/keyshot/rock_2.fbx | 16076 | 66 | 128 | 1 |
| Resources/Art/map/keyshot/rock_3.fbx | 16028 | 66 | 128 | 1 |
| Resources/Art/map/keyshot/rotten_mass.fbx | 358748 | 5584 | 6899 | 2 |
| Resources/Art/map/keyshot/rubble.fbx | 352444 | 5821 | 11606 | 1 |
| Resources/Enemies3D/BerserkApostle.fbx | 2794140 | 21805 | 12443 | 1 |
| Resources/Enemies3D/BloatedApostle.fbx | 2686892 | 21103 | 12480 | 1 |
| Resources/Enemies3D/CarapaceApostleV2.fbx | 2784316 | 20152 | 12473 | 1 |
| Resources/Enemies3D/CleaverApostle.fbx | 2621052 | 22233 | 12434 | 1 |
| Resources/Enemies3D/DuelistApostle.fbx | 2627372 | 23678 | 12808 | 3 |
| Resources/Enemies3D/EyeMass.fbx | 2294748 | 25168 | 12504 | 1 |
| Resources/Enemies3D/FetalDemon.fbx | 5208396 | 17914 | 12520 | 1 |
| Resources/Enemies3D/FrozenZombie.fbx | 2657212 | 24714 | 12307 | 1 |
| Resources/Enemies3D/GiantApostle.fbx | 3033452 | 20121 | 12521 | 1 |
| Resources/Enemies3D/GlacierGolem.fbx | 2534220 | 17719 | 12478 | 1 |
| Resources/Enemies3D/HexerApostle.fbx | 2765356 | 24998 | 12390 | 1 |
| Resources/Enemies3D/IcicleBat.fbx | 4823996 | 21746 | 12287 | 1 |
| Resources/Enemies3D/Imp.fbx | 2426348 | 14020 | 12560 | 1 |
| Resources/Enemies3D/IroncladApostle.fbx | 2860460 | 25108 | 12471 | 1 |
| Resources/Enemies3D/LesserApostle.fbx | 2692940 | 25391 | 12481 | 1 |
| Resources/Enemies3D/MotherApostle.fbx | 4408236 | 19228 | 12459 | 1 |
| Resources/Enemies3D/RitualApostle.fbx | 2839964 | 28135 | 12987 | 2 |
| Resources/Enemies3D/SageApostle.fbx | 3334956 | 27134 | 12321 | 1 |
| Resources/Enemies3D/ShadowApostle.fbx | 2943404 | 20444 | 12410 | 1 |
| Resources/Enemies3D/ShadowTwin.fbx | 3201804 | 22553 | 12323 | 1 |
| Resources/Enemies3D/SpiderApostle.fbx | 4793916 | 21718 | 12519 | 1 |
| Resources/Enemies3D/SpineApostle.fbx | 2530620 | 15589 | 12495 | 1 |
| Resources/Enemies3D/SplitWorm.fbx | 4825036 | 21157 | 12240 | 1 |
| Resources/Enemies3D/SwampSlime.fbx | 2087740 | 11959 | 12472 | 1 |
| Resources/Enemies3D/TrapperApostle.fbx | 2940172 | 23619 | 12415 | 1 |
| Resources/Enemies3D/VampireApostle.fbx | 2519900 | 17846 | 12391 | 1 |
| Resources/Enemies3D/Warden.fbx | 3984572 | 27684 | 13047 | 2 |
| Resources/Enemies3D/WingedApostle.fbx | 2583612 | 19596 | 12353 | 1 |
| Resources/Enemies3D/WombApostle.fbx | 7217452 | 18713 | 12334 | 1 |
| Resources/Enemies3D/Wraith.fbx | 4601804 | 20844 | 12472 | 1 |

## 9. PNG 원본 해상도 표본 57개

[정적 집계] Assets 전체 PNG는1,014개다. 아래57개만 IHDR를 읽었으며 그 외 PNG957개와 JPG등의 실제해상도는 이번에 읽지 않았다. 상위max와 Default cap을 모두 기록한다. Standalone override는0이므로 별도의 강제플랫폼값으로 취급하지 않았다. 모든 최종 GPU포맷·해상도·상주byte는 미확인이다. 표의 압축0/1/2는 DefaultTexturePlatform 직렬화값이다.

<!-- AUDIT_TEXTURE_TABLE -->
| PNG 경로 (unity/Assets/Exoduser/ 기준) | 원본 해상도 | 원본 byte | 상위 maxTextureSize | Default cap | 밉 | Read/Write | Default 압축값 |
|---|---|---:|---:|---:|---:|---:|---:|
| Art/Characters/Warrior/RemasterR7/BaseColor.png | 4096×4096 | 21843096 | 2048 | 2048 | 1 | 0 | 2 |
| Art/Characters/Warrior/RemasterR7/Normal.png | 4096×4096 | 20104459 | 2048 | 2048 | 1 | 0 | 2 |
| Remodel/CH1_1/Materials/Ground/ch1_1_r1r2_colormap.png | 3276×2212 | 10293589 | 2048 | 2048 | 1 | 0 | 1 |
| Remodel/CH1_1/Materials/Ground/ch1_1_r1r2_colormap_wide.png | 4260×3031 | 18711299 | 8192 | 8192 | 1 | 0 | 2 |
| Remodel/CH1_1/Materials/Ground/ch1_1_r1r2_normal.png | 4260×3031 | 20901077 | 4096 | 4096 | 1 | 0 | 1 |
| Resources/Art/FullscreenWide/58-32.png | 7680×2160 | 26392054 | 8192 | 8192 | 0 | 0 | 0 |
| Resources/Art/enemy/atlas_ch1_8dir_east.png | 2048×1280 | 693012 | 2048 | 8192 | 0 | 0 | 0 |
| Resources/Art/enemy/atlas_ch1_8dir_north.png | 2048×1280 | 761588 | 2048 | 8192 | 0 | 0 | 0 |
| Resources/Art/enemy/atlas_ch1_8dir_north_east.png | 2048×1280 | 729568 | 2048 | 8192 | 0 | 0 | 0 |
| Resources/Art/enemy/atlas_ch1_8dir_north_west.png | 2048×1280 | 722767 | 2048 | 8192 | 0 | 0 | 0 |
| Resources/Art/enemy/atlas_ch1_8dir_south.png | 2048×1280 | 798229 | 2048 | 8192 | 0 | 0 | 0 |
| Resources/Art/enemy/atlas_ch1_8dir_south_east.png | 2048×1280 | 808193 | 2048 | 8192 | 0 | 0 | 0 |
| Resources/Art/enemy/atlas_ch1_8dir_south_west.png | 2048×1280 | 804413 | 2048 | 8192 | 0 | 0 | 0 |
| Resources/Art/enemy/atlas_ch1_8dir_walk_east.png | 8192×1280 | 2206104 | 2048 | 8192 | 0 | 0 | 0 |
| Resources/Art/enemy/atlas_ch1_8dir_walk_north.png | 8192×1280 | 2359161 | 2048 | 8192 | 0 | 0 | 0 |
| Resources/Art/enemy/atlas_ch1_8dir_walk_north_east.png | 8192×1280 | 2299434 | 2048 | 8192 | 0 | 0 | 0 |
| Resources/Art/enemy/atlas_ch1_8dir_walk_north_west.png | 8192×1280 | 2335058 | 2048 | 8192 | 0 | 0 | 0 |
| Resources/Art/enemy/atlas_ch1_8dir_walk_south.png | 8192×1280 | 2493613 | 2048 | 8192 | 0 | 0 | 0 |
| Resources/Art/enemy/atlas_ch1_8dir_walk_south_east.png | 8192×1280 | 2425791 | 2048 | 8192 | 0 | 0 | 0 |
| Resources/Art/enemy/atlas_ch1_8dir_walk_south_west.png | 8192×1280 | 2373359 | 2048 | 8192 | 0 | 0 | 0 |
| Resources/Art/enemy/atlas_ch1_8dir_walk_west.png | 8192×1280 | 2239339 | 2048 | 8192 | 0 | 0 | 0 |
| Resources/Art/enemy/atlas_ch1_8dir_west.png | 2048×1280 | 655038 | 2048 | 8192 | 0 | 0 | 0 |
| Resources/Art/lobby/varkan_idle.png | 3072×7488 | 18349778 | 2048 | 8192 | 0 | 0 | 0 |
| Resources/Art/map/a2/r3/Textures/RF3_Ancient_Tree_A_BaseColor.png | 4096×4096 | 22408050 | 4096 | 2048 | 1 | 0 | 2 |
| Resources/Art/map/a2/r3/Textures/RF3_Ancient_Tree_A_Normal.png | 4096×4096 | 38163736 | 4096 | 2048 | 1 | 0 | 2 |
| Resources/Art/map/a2/r3/Textures/RF3_Ancient_Tree_B_BaseColor.png | 4096×4096 | 22458490 | 4096 | 2048 | 1 | 0 | 2 |
| Resources/Art/map/a2/r3/Textures/RF3_Ancient_Tree_B_Normal.png | 4096×4096 | 38167055 | 4096 | 2048 | 1 | 0 | 2 |
| Resources/Art/FullscreenWide/59-32.png | 7680×2160 | 17666904 | 8192 | 8192 | 0 | 0 | 0 |
| Resources/Art/FullscreenWide/14-32.png | 5406×1520 | 16923120 | 8192 | 8192 | 0 | 0 | 0 |
| Resources/Art/FullscreenWide/22-32.png | 5406×1520 | 16830378 | 8192 | 8192 | 0 | 0 | 0 |
| Resources/Art/FullscreenWide/58-21.png | 5120×2160 | 16507689 | 8192 | 8192 | 0 | 0 | 0 |
| Resources/Art/FullscreenWide/20-32.png | 5406×1520 | 16208189 | 8192 | 8192 | 0 | 0 | 0 |
| Resources/Art/FullscreenWide/19-32.png | 5406×1520 | 16048614 | 8192 | 8192 | 0 | 0 | 0 |
| Resources/Art/FullscreenWide/10-32.png | 5406×1520 | 15387987 | 8192 | 8192 | 0 | 0 | 0 |
| Resources/Art/FullscreenWide/01-32.png | 5918×1664 | 15296602 | 8192 | 8192 | 0 | 0 | 0 |
| Resources/Art/FullscreenWide/24-32.png | 5406×1520 | 15148033 | 8192 | 8192 | 0 | 0 | 0 |
| Resources/Art/FullscreenWide/15-32.png | 5406×1520 | 15061285 | 8192 | 8192 | 0 | 0 | 0 |
| Resources/Art/FullscreenWide/23-32.png | 5406×1520 | 14843020 | 8192 | 8192 | 0 | 0 | 0 |
| Resources/Art/FullscreenWide/13-32.png | 5406×1520 | 14655545 | 8192 | 8192 | 0 | 0 | 0 |
| Resources/Art/FullscreenWide/07-32.png | 5406×1520 | 14644612 | 8192 | 8192 | 0 | 0 | 0 |
| Resources/Art/FullscreenWide/12-32.png | 5406×1520 | 14638933 | 8192 | 8192 | 0 | 0 | 0 |
| Resources/Art/FullscreenWide/21-32.png | 5406×1520 | 14570263 | 8192 | 8192 | 0 | 0 | 0 |
| Resources/Art/FullscreenWide/11-32.png | 5406×1520 | 14296110 | 8192 | 8192 | 0 | 0 | 0 |
| Resources/Art/FullscreenWide/08-32.png | 5406×1520 | 13960889 | 8192 | 8192 | 0 | 0 | 0 |
| Resources/Art/FullscreenWide/09-32.png | 5406×1520 | 13748956 | 8192 | 8192 | 0 | 0 | 0 |
| Resources/Art/map/a2/r3/Textures/RF3_Ancient_Tree_A_AO.png | 4096×4096 | 12929040 | 4096 | 2048 | 1 | 0 | 2 |
| Resources/Art/map/a2/r3/Textures/RF3_Ancient_Tree_B_AO.png | 4096×4096 | 12928268 | 4096 | 2048 | 1 | 0 | 2 |
| Resources/Art/FullscreenWide/16-32.png | 5406×1520 | 12849390 | 8192 | 8192 | 0 | 0 | 0 |
| Resources/Art/FullscreenWide/01-21.png | 3945×1664 | 12810914 | 8192 | 8192 | 0 | 0 | 0 |
| Resources/Art/FullscreenWide/32-32.png | 5120×1440 | 12522662 | 8192 | 8192 | 0 | 0 | 0 |
| Resources/Art/FullscreenWide/17-32.png | 5406×1520 | 12266042 | 8192 | 8192 | 0 | 0 | 0 |
| Resources/Art/FullscreenWide/14-21.png | 3603×1520 | 11500635 | 8192 | 8192 | 0 | 0 | 0 |
| Resources/Art/FullscreenWide/18-32.png | 5406×1520 | 11190000 | 8192 | 8192 | 0 | 0 | 0 |
| Resources/Art/FullscreenWide/22-21.png | 3603×1520 | 11154008 | 8192 | 8192 | 0 | 0 | 0 |
| Resources/Art/FullscreenWide/20-21.png | 3603×1520 | 10954831 | 8192 | 8192 | 0 | 0 | 0 |
| Resources/Art/FullscreenWide/25-32.png | 4096×1152 | 10778332 | 8192 | 8192 | 0 | 0 | 0 |
| Resources/Art/map/a2/ground/A2_FieldMoss_Normal.png | 2048×2048 | 10708761 | 2048 | 2048 | 1 | 0 | 2 |

## 10. Unity 메시 asset 38개

[정적 집계] git grep의 YAML class43 Mesh 결과38개를 Node로 읽었다. m_VertexCount와 첫 m_SubMeshes 블록의 topology0 indexCount÷3을 집계했다. blend-shape 등의 다른 vertexCount를 중복합산하지 않았다. 모두이표에서는서브메시1개다. 합계정점276,706/삼각형152,174. 원본FBX와 같은 계열 파생mesh가 있으므로 두합계를동시화면량으로더하지 않는다. NavWalk는이름만으로렌더된다고확정할수없다. binary/native직렬화나씬내embedded mesh·실행중생성/변형mesh를포괄한전체Player기하집계가아니다.

<!-- AUDIT_MESH_TABLE -->
| 메시 asset 경로 (unity/Assets/Exoduser/ 기준) | m_VertexCount | 삼각형 (indexCount/3) | 서브메시 | Read/Write |
|---|---:|---:|---:|---:|
| Art/Characters/Warrior/Warrior_Rigged_Cape.asset | 96114 | 61324 | 1 | 1 |
| Remodel/CH1_1/Generated/Decals_blood.asset | 136 | 68 | 1 | 1 |
| Remodel/CH1_1/Generated/Decals_blood_cracked.asset | 8 | 4 | 1 | 1 |
| Remodel/CH1_1/Generated/Decals_blood_drag.asset | 32 | 16 | 1 | 1 |
| Remodel/CH1_1/Generated/Decals_blood_drops.asset | 48 | 24 | 1 | 1 |
| Remodel/CH1_1/Generated/Decals_bone.asset | 8 | 4 | 1 | 1 |
| Remodel/CH1_1/Generated/Decals_bone_ribs.asset | 12 | 6 | 1 | 1 |
| Remodel/CH1_1/Generated/Decals_bone_skull.asset | 8 | 4 | 1 | 1 |
| Remodel/CH1_1/Generated/Decals_root.asset | 48 | 24 | 1 | 1 |
| Remodel/CH1_1/Generated/Decals_root_branch.asset | 36 | 18 | 1 | 1 |
| Remodel/CH1_1/Generated/Decals_root_tangle.asset | 28 | 14 | 1 | 1 |
| Remodel/CH1_1/Generated/Decals_wet.asset | 232 | 116 | 1 | 1 |
| Remodel/CH1_1/Generated/NavWalk.asset | 22028 | 11014 | 1 | 1 |
| Remodel/CH1_1/Generated/Pool_R2_EAST_TOXIC_ROOT_POOL.asset | 80 | 40 | 1 | 1 |
| Remodel/CH1_1/Generated/River_L.asset | 280 | 278 | 1 | 1 |
| Remodel/CH1_1/Generated/River_R.asset | 232 | 230 | 1 | 1 |
| Remodel/CH1_1/Generated/Shaft_Hell_01.asset | 4 | 2 | 1 | 1 |
| Remodel/CH1_1/Generated/Shaft_Hell_02.asset | 4 | 2 | 1 | 1 |
| Remodel/CH1_3/Generated/Decals_blood.asset | 208 | 104 | 1 | 1 |
| Remodel/CH1_3/Generated/Decals_blood_cracked.asset | 88 | 44 | 1 | 1 |
| Remodel/CH1_3/Generated/Decals_blood_drag.asset | 216 | 108 | 1 | 1 |
| Remodel/CH1_3/Generated/Decals_blood_drops.asset | 240 | 120 | 1 | 1 |
| Remodel/CH1_3/Generated/Decals_bone.asset | 32 | 16 | 1 | 1 |
| Remodel/CH1_3/Generated/Decals_bone_ribs.asset | 28 | 14 | 1 | 1 |
| Remodel/CH1_3/Generated/Decals_bone_skull.asset | 32 | 16 | 1 | 1 |
| Remodel/CH1_3/Generated/Decals_root.asset | 236 | 118 | 1 | 1 |
| Remodel/CH1_3/Generated/Decals_root_branch.asset | 76 | 38 | 1 | 1 |
| Remodel/CH1_3/Generated/Decals_root_tangle.asset | 132 | 66 | 1 | 1 |
| Remodel/CH1_3/Generated/NavWalk.asset | 155448 | 77724 | 1 | 1 |
| Remodel/CH1_3/Generated/Pool_1.asset | 29 | 28 | 1 | 1 |
| Remodel/CH1_3/Generated/Pool_2.asset | 29 | 28 | 1 | 1 |
| Remodel/CH1_3/Generated/R3_Shaft_Hell_01.asset | 4 | 2 | 1 | 1 |
| Remodel/CH1_3/Generated/R3_Shaft_Hell_02.asset | 4 | 2 | 1 | 1 |
| Remodel/CH1_3/Generated/R3_Shaft_Hell_03.asset | 4 | 2 | 1 | 1 |
| Remodel/CH1_3/Generated/River_E.asset | 240 | 238 | 1 | 1 |
| Remodel/CH1_3/Generated/River_W.asset | 264 | 262 | 1 | 1 |
| Remodel/CH1_3/Generated/SporePit_1.asset | 29 | 28 | 1 | 1 |
| Remodel/CH1_3/Generated/SporePit_2.asset | 29 | 28 | 1 | 1 |

## 11. 인계 상태

정적 분석 문서 작성. 성능/예산 준수/제품 화면 판정은 보류다. 지정 문서 외 수정과 Git 커밋·push는 하지 않았고, 추출용 고정 임시 파일은 삭제했다. 총괄은 codex_tech_budget.md 병합 후 빈 기준값을 대조하고 §7의 측정을 배정해야 한다.
