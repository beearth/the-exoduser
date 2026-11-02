# Unity 설치형 지면 배치 수정 — 2026-11-02

상태: **1차 정점·속성·상태148행 PASS / 실제 큰 반경 면 내부 결함 발견 → 회전 분리 후보 CPU3136 PASS / 재검증 대기**. 기준 공통 `1403c5ee6d52c540815ab1cf70d5666b9023aa75`. 사용자 요청은 장판뿐 아니라 지뢰·덫·현재 실행기에 존재하는 설치형 전체의 공중 배치를 고치는 것이다.

## 원인과 적용 계약

`NativeGame.Remodel3D.Remodel3DBillboards`가 중심형 강타·악의구 이외의 모든 SpriteRenderer에 캐릭터 FootLift와 카메라 tilt를 적용했다. 설치형의 중심 pivot에도 반높이가 더해졌다. `VfxWorld`는 별도로 지면 y=0 고정 TODO를 남겨 실제 지형/목교 높이를 사용하지 않았다. 미반영 `1684eaa4c`는 FireZones만 다루고 atlas UV 및 보스의 pooled renderer 재사용을 다루지 않아 후보 전체를 병합하지 않았다.

| 적용 위치 / id | 현재 소스 계약 | 보존할 값 |
|---|---|---|
| FireZones.spikeTrap | 명시적 ground surface; 지면 점마다 높이 샘플 | 기존 원화·반경·배치 회전·전개·알파·수명 |
| FireZones.holyDome | 본체 ground surface + 72점 링별 지형/목교 높이 | 지정 연두/원문 색·WebLitHolyDome .11·링 .03·기존 회복 판정 |
| FieldZones.trap | ward sheet 오른쪽 atlas cell만 지면 메시로 표시 | 112px·pulse/회전·_Opacity |
| FieldZones.iceZone/blizzard | 세 겹 원을 각각 ground surface로 표시 | 원래 암흑/얼음색·반경/알파·감속/수명 |
| SeekerMines / DruidMine | ward 왼쪽 cell을 지면에 표시 | Core 이동·arm·추적·패링·폭발·피해 |
| Projectiles.Mine | ward 왼쪽 cell과 임박 점멸 링을 지면 표시 | 112px·106px 링·수명/점멸·폭발/피해 |
| LavaPools / PoisonPools | 애니메이션 atlas frame과 얇은 테두리 지면 표시 | 기존 frame timing·1.12r·색/알파·판정 반경 |
| ChaseAoes / Fissures | GroundRing 및 균열 구슬만 명시적 ground surface | 전조/폭발·줄기·피해·gap 수치 |
| TideWaves / ShockClip | 지면 파도 구슬과 shock ring만 ground surface | Core 종·생성수·시계·반경/회전·색·수명 |
| VfxWorld.ToWorld/ToWorldMetres | RM-INT Active일 때만 GroundY+height | 비활성 도구/2D의 기존 y=height; X/Z/단위 |
| 공중 표현 / 일반 탄·악의구·강타·캐릭터 | 기존 경로 유지, ground로 분류하지 않음 | 기존 actor foot / 중심 registry 및 색/크기/높이 |
| NativeDruidTelegraphView | flat 보스방의 기존 2D Mesh 유지 | 원·부채꼴·라인·gap·안전영역·glint/눈빛 계약 |

`NativeGroundSkillSurface.Mark`는 설치형 생산자가 명시적으로 호출한다. 이름/정렬값/속도0 추측으로 분류하지 않는다. 3D일 때 원 SpriteRenderer의 렌더만 forceRenderingOff하고 source는 그대로 두며, source와 같은 부모 아래 별도 MeshRenderer로 원 sharedMaterial·전체 MaterialPropertyBlock(_Opacity 포함)·색·정확한 sprite.rect UV·flip·sorting layer/order를 전달한다. sprite.enabled=false 또는 부모 비활성화면 surface도 사라진다. pool이 공중탄으로 재사용될 때 Mark(false)로 원 sprite를 복원한다. 2D 전환은 RestoreAll로 원 forceRenderingOff 상태를 되돌리고 메시를 끈다. Destroy에서 registry·메시를 해제한다.

지면 메시: 최초16×16을 시작점으로 삼각형의 edge/centroid/barycentric7점과 world XZ bounding box4점을 원본 GroundY와 대조하고, 표본 오차.005u 또는 XZ변.35u 초과면 최대8단계로 적응 분할한다. 접촉이 끊기는 최종 극소 면은 생략하여 목교 끝을 공중 경사면으로 잇지 않는다. UV는 원화 평면 좌표를 그대로 유지하며 기존 material/MPB/색을 변경하지 않는다. 표면 +.025u, 링 +.03u는 z-fighting 방지 간격이다. Core 위치/반경/피해/시간은 불변이다. Geometry API가 반환하는 omitted triangle 수를 component가 공개하고 QA에서 실제 잔여 면적도 확인한다. 정점수가65535 초과면 UInt32 인덱스를 쓴다.

고정 설치형의 footprint·transform·지면/Field 참조가 같으면 geometry를 캐시한다. tint/opacity와 atlas frame/flip은 기존 writer를 따라 별도 갱신한다. 초기 scale0은 원문과 같이 표시하지 않는다. 전개 중 scale/회전/위치가 바뀌는 프레임은 다시 접지하므로 **실제 Player frame timing/밀집 배치 검증이 필수이며 CPU 검사만으로 성능 PASS를 선언하지 않는다**.

1차 Mac 정상 후보95d4 + QA0fe68452는 정점/원화전달/풀·상태148행을 통과했지만 실제 Lv1/20 큰 반경에서 삼각형 내부 ground 오차 최대.881259u를 발견했다. 양·음 오차가 있어 뜸/관통 둘 다 존재하며 원화 alpha별 가시성 진단은 Mac QA가 소유한다. 148행 PASS의 범위는 정점·속성·상태이며 완성된 면의 시각 PASS가 아니다. 후보 설치/공통 통합은 이 단계에서 보류했다.

적응 분할 CPU 검사는 평지/경사/곡면/불연속 목교/좁은 뿌리에 1.12·6·10.4·11.7·18u footprint를 회전 배치한다. refinement 표본과 다른11개 barycentric 점으로 emitted triangle 내부 높이 오차<=.02u, 유효 면적>=98%를 검증한다. 실제735 assertion PASS, 합성 표본 최대 오차.006984u, 최소 면적보존99.9264%. 최대 합성 footprint 생성351ms 관측이므로 실제 Field 생성비용/프레임은 후속 실제 검수 대상이다. 이 합성값을 제품 성능으로 보고하지 않는다.

## 회전·전개 캐시 보완 — 후속 후보

d08 적응 분할의 matrix 캐시는 장판 둘의 연속 roll(.05rad/s)이 변할 때 다시 생성됐다. 최종 후보는 메시를 source의 중립 자세 sibling으로 두고 원화와 독립한다. 장판 생성 시 최종 R의 sqrt(2) 외접 extent를 미리 전달(spike R*.01*sqrt2, holy R*.0102*sqrt2), 실제 source.rect/pivot·현재 scale·roll/flip은 TextureMap 행렬과 atlas rect를 child MPB에 전달한다. mesh는 모든 roll을 덮는 world-aligned square에 한 번 접지하고, GPU가 원래 0..1 footprint 밖을 clip한다. 전개/회전/atlas는 mesh 재생성 없이 원문 그대로 움직인다. 위치·지형참조 변경 또는 준비된 extent보다 큰 source에만 다시 생성한다. extent는.25u 단위 올림이며 판정 반경이나 표시 원화 크기를 바꾸지 않는다. GeometryRevision/SurfaceRenderer 공개값으로 QA가 실제 메시 재사용과 geometry를 추적한다. source.enabled/forceOff·2D·pool 규칙은 동일하다.

| 셰이더 / 재질 | 현재 계약 |
|---|---|
| SkillAdditive / KiSlashAdditive | _GroundUvClip 기본0의 기존 sprite vertex/frag/blend 수식은 그대로. ground child만1: _GroundUvU/V(중립 local XZ→회전된 원화 UV), _GroundUvRect(offset.xy/scale.zw)로 footprint clip 후 정확 atlas cell을 샘플. RGB·Flat·NormalBlend·Opacity·depth/blend 불변 |
| Sprites/Default 소비자 | source 재질은 그대로. ground child에 SkillAdditive의 _NormalBlend1/_DstBlend10(OneMinusSrcAlpha)/Flat0을 사용해 기존 premultiplied RGB/alpha 수식을 유지. native producer는 default white material/RendererColor를 사용. 이 경로의 child sharedMaterial identity는 같지 않으므로 identity 대신 동일 수식/색·alpha·텍스처를 실제 QA로 검증 |
| 기타 재질 | GroundUvClip property가 없으면 기존 실제 footprint 적응 메시/직접 UV 경로를 유지. 현재 producer의 세 재질 외 기능을 추정 변환하지 않음 |

기존 geometry735 + 회전/비정사각 pivot/40시점/flip/외접 footprint2401 =3136 assertion PASS. 독립 원화 좌표 검사이며 실제 GPU shader/성능 PASS로 대체하지 않는다. source323 정적 compile 오류0/경고477. shader compile 및 실제 mesh 재생성0회(전개·roll), actual alpha/atlas/동일 frame·다중 설치 성능은 Mac 실제 검증 대상이다.

## 검사와 남은 검증

| 검사 | 근거 / 판정 |
|---|---|
| 수정 전 CPU RED | helper 부재에서 실행 assertion `MISSING terrain-conforming ground skill placement` FAIL. 컴파일 자체는 성공 |
| 수정 후 CPU | 실제 Runtime 지면 수학 파일을 컴파일해 평지·경사·회전·72점 링·목교/주변 바닥의 기존659검사 + 면 내부/면적76검사 =735 PASS |
| 정적 C# | 적응 분할 포함 Core/Runtime 323소스 통합 Roslyn 컴파일 오류0, 경고477. 실제 Unity 빌드로 대체하지 않음 |
| Mac 실제 baseline/후보 | 기존 Mac 총괄이 QA 파일/실행·입력/변형 byte·사용자 prefs 원문 보존을 소유. 실제 FAIL→같은 검사 GREEN·1920 화면·같은 앱 M1·생성/소멸/풀 재사용·2D/3D 전환은 아직 대기 |
| 필수 시각 | 평지·경사·목교에서 각 설치형이 떠 있지 않고 원화/atlas/링이 올바른지 직접 확인. 정점 수학만으로 화면 PASS를 선언하지 않음 |

관련 docs 전체 키워드 검색 122행을 `I:/EXODUSER-Storage/ground-placement/20261102/docs-keyword-search.log`에 보존했다. 역사/웹/Godot의 동일 id·피해/수명·자원 표는 수치 불변이라 그대로 둔다. 현행 Unity 좌표·앵커 SSOT와 VFX 가이드에 이번 후보의 링크/상태를 연결한다. VFX 마스터는 웹 main 소유 문서이므로 이 Unity 줄기에 축약 사본을 생성하지 않고 최종 main 문서 동기화에서 기존 본문을 보존해 연결한다. Core·지도/목교 형상·원화·저장 형식 변경0. 기존 셰이더 두 파일은 아래 ground-only flag 계약을 추가하며 기본 sprite 경로는 flag0이다.

CPU/컴파일/수정 전 byte 백업은 `I:/EXODUSER-Storage/ground-placement/20261102/`. 이 소스 후보만으로 공통/설치 완료를 주장하지 않는다.
