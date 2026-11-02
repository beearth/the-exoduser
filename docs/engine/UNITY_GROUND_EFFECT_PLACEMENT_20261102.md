# Unity 설치형 지면 배치 수정 — 2026-11-02

상태: **소스 수정·CPU 659회귀 PASS / 실제 Player 검증 대기**. 기준 공통 `1403c5ee6d52c540815ab1cf70d5666b9023aa75`. 사용자 요청은 장판뿐 아니라 지뢰·덫·현재 실행기에 존재하는 설치형 전체의 공중 배치를 고치는 것이다.

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

`NativeGroundSkillSurface.Mark`는 설치형 생산자가 명시적으로 호출한다. 이름/정렬값/속도0 추측으로 분류하지 않는다. 3D일 때 원 SpriteRenderer의 렌더만 forceRenderingOff하고 source는 그대로 두며, 자식 MeshRenderer로 원 sharedMaterial·전체 MaterialPropertyBlock(_Opacity 포함)·색·정확한 sprite.rect UV·flip·sorting layer/order를 전달한다. sprite.enabled=false 또는 부모 비활성화면 surface도 사라진다. pool이 공중탄으로 재사용될 때 Mark(false)로 원 sprite를 복원한다. 2D 전환은 RestoreAll로 원 forceRenderingOff 상태를 되돌리고 메시를 끈다. Destroy에서 registry·메시를 해제한다.

지면 메시: 16×16 subdivision, 289정점/512삼각형. Core X/100, -Y/100의 XZ 평면에서 원래 Z-roll을 회전하고 **정점별 NativeRemodel3D.GroundY**를 사용한다. 실제 A2FieldLayout.Height(등록된 목교 상판/접촉 포함)를 공유한다. 표면 +.025u, 링 +.03u는 z-fighting 방지용 표현 간격이며 Core 반경/위치/피해/시간을 바꾸지 않는다. 초기 전개 scale0은 singular inverse를 쓰지 않고 원문과 같이 표시하지 않는다.

## 검사와 남은 검증

| 검사 | 근거 / 판정 |
|---|---|
| 수정 전 CPU RED | helper 부재에서 실행 assertion `MISSING terrain-conforming ground skill placement` FAIL. 컴파일 자체는 성공 |
| 수정 후 CPU | 실제 Runtime 지면 수학 파일을 컴파일해 평지·경사·회전·72점 링·목교/주변 바닥의 659검사 PASS |
| 정적 C# | Core/Runtime 323소스 통합 Roslyn 컴파일 오류0, 경고477. 실제 Unity 빌드로 대체하지 않음 |
| Mac 실제 baseline/후보 | 기존 Mac 총괄이 QA 파일/실행·입력/변형 byte·사용자 prefs 원문 보존을 소유. 실제 FAIL→같은 검사 GREEN·1920 화면·같은 앱 M1·생성/소멸/풀 재사용·2D/3D 전환은 아직 대기 |
| 필수 시각 | 평지·경사·목교에서 각 설치형이 떠 있지 않고 원화/atlas/링이 올바른지 직접 확인. 정점 수학만으로 화면 PASS를 선언하지 않음 |

관련 docs 전체 키워드 검색 122행을 `I:/EXODUSER-Storage/ground-placement/20261102/docs-keyword-search.log`에 보존했다. 역사/웹/Godot의 동일 id·피해/수명·자원 표는 수치 불변이라 그대로 둔다. 현행 Unity 좌표·앵커 SSOT와 VFX 가이드/마스터에 이번 후보의 링크/상태를 연결한다. Core·지도/목교 형상·기존 셰이더/재질/원화·저장 형식 변경0.

CPU/컴파일/수정 전 byte 백업은 `I:/EXODUSER-Storage/ground-placement/20261102/`. 이 소스 후보만으로 공통/설치 완료를 주장하지 않는다.
