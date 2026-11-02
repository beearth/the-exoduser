# Unity 설치형 실제 지면 투영 — 2026-11-02

상태: **GPU receiver-depth 방법 소스·324 C# 정적 컴파일 오류0/경고477 / 실제 GPU·성능·시각·설치·공통 반영 검증 대기**. 기준 공통1403c5ee6d52c540815ab1cf70d5666b9023aa75. 사용자 요청은 장판뿐 아니라 지뢰·덫·현재 설치형 전체의 공중 배치를 고치는 것이다. CPU 회귀3151은 보존된 수학/UV·이전 적응면 검사이며 새 GPU 투영의 합격 증거가 아니다.

## 원인과 현재 적용

공용 Remodel3DBillboards가 중심형 강타·악의구 외 SpriteRenderer 전부에 actor FootLift와 카메라 tilt를 적용했다. 설치형 중심 pivot에도 반높이가 더해졌다. VfxWorld도 별도로 y=0 TODO였다. 설치형 생산자가 Mark를 명시 호출하며 이름/정렬/속도0으로 추정 분류하지 않는다. Core·판정·반경·시간·원화 파일은 변경하지 않는다.

| 적용 위치/id | 현재3D 표시 | 보존 |
|---|---|---|
| FireZones.spikeTrap/holyDome | 실제 등록 지면 depth에 원화 UV 투영 | 원래 반경·전개·roll·tint·alpha·수명 |
| holyDome 링2개 | 같은 실제 지면에72각형 centre-line band | radius pulse·widthMultiplier.03·WebLitHolyDomeRing.03·색/sort·원LineRenderer2D |
| FieldZones.trap | ward sheet 오른쪽 cell 투영 |112px·pulse/회전·Opacity |
| FieldZones.iceZone/blizzard | 기존3겹 disc 각각 투영 | 색·반경·alpha·감속/수명 |
| SeekerMines/DruidMine/Projectiles.Mine | ward 왼쪽 cell·점멸 ring 투영 | Core 이동/arm·추적·폭발·피해,112/106px |
| LavaPools/PoisonPools | 원 atlas frame·rim 투영 | timing·1.12r·색/alpha·판정 |
| ChaseAoes/Fissures/TideWaves/ShockClip | 기존 지면 ring·균열/파도 disc·shock 원화만 투영 | 피해·gap·종·시계·크기·색/수명 |
| VfxWorld.ToWorld/ToWorldMetres | Active일 때 GroundY+height | 비활성의 기존y=height, X/Z/단위. 기존DecalProjector consumer는 실제receiver 방식 그대로 |
| 일반 공중탄·악의구·강타·배우 | 기존 actor/중심 경로 | FootLift/중심 registry·색/크기/높이 |
| NativeDruidTelegraphView | flat 보스방 기존2D mesh | gap·안전영역·glint/눈빛·수치 |

## 실제 depth 경로

NativeGroundSkillSurface는 source SpriteRenderer를 수정하지 않고 렌더만 forceRenderingOff한다. 같은 부모의 중립 cube proxy가 실제 표시를 담당한다. source enabled/active·원forceOff·destroy·pool Mark(false)·2D 전환은 원래 source 상태로 복원한다. 링의 원LineRenderer는 항상 원문72점 XY를 보존하고 Active3D에서만 forceOff한다. 링 Source disable/active/destroy도 mapped draw에 반영한다. SurfaceRenderer/RingSurface(LineRenderer)/GeometryRevision/UsesReceiverDepth를 QA가 조회할 수 있다. proxy8정점은 투영 부피이며 실제 표시 면의 정점이 아니므로 vertex-contact PASS로 세지 않는다.

| id/위치 | 계약/값 |
|---|---|
| volume | 공용cube8정점/12삼각형, 좌표±.5. source footprint 외접extent와 사전 전달최종extent의 max, scale=(2extent,16,2extent). y±8은 탐색부피이며 표시 높이가 아니다 |
| source 좌표 | Core X/100,-Y/100의 worldXZ. 원rect/pivot/PPU/lossyScale/roll/flip로 TextureMap U/V를 만들고 atlas offset.xy/scale.zw를 그대로 전달 |
| actual surface | receiver depth와 camera scene depth의 LinearEyeDepth 차이<=.02u인 실제 픽셀. scene depth에서 UNITY_MATRIX_I_VP로 world 위치 복원. 별도표면+.025/링+.03 오프셋 없이 같은 surface에 합성하며 ZWriteOff라 z-fighting 없음 |
| volume clip | abs(worldToObject(world)) 각축<=.50001. far-depth 유효성epsilon1e-7. 실제receiver가 없거나 앞의 비수신물체가 가리면 출력하지 않음 |
| ground pass | Unity6000.6.7f1/URP17.6.0, 현재 package source ffe395a3a1d1 API. BeforeRenderingTransparents에 receiver-depth→projection 두 RenderGraph raster pass. Depth input+intermediate texture 요구. original material/renderer asset 파일 변경0 |
| runtime feature | 현재camera의 ScriptableRenderer protected rendererFeatures getter를 캐시해 본인 transient feature만 append. 타feature/asset/전역설정 재작성0. 해당r3Camera/Active/visible volume이 있을 때만 실행 |
| dynamic geometry | runtime Surface/링 update에서 Tessellate 호출0, GroundY 대량조회0. cube/UV·uniform만 갱신. 원writer의Point anchor GroundY는 그대로 |

등록 receiver는 기존 지면/보행지원 생산 지점에서만 만든다. 보이는 원본 mesh·material·transform·collider를 바꾸지 않으며, 전용 LightMode의 보이지 않는 depth proxy를 붙인다. 일반 URP forward/shadow에 참여하지 않는다.

| receiver | 명시 등록/범위 |
|---|---|
| RM1 HellGround | HellGroundSetup의 실제 MF, 공유mesh. 원본 enabled/forceOff와 mesh교체를 추적 |
| A2 전체지면 | A2FieldGround의 각 실제 청크 MF, 공유mesh |
| 낮은 뿌리/고목/그루터기 | 기존 A2FieldRegister 지점. 원본vertex/index를 복사한 mask만 만들고 vertex별TerrainHeight..TerrainHeight+.9 범위로clip. 원본모델·Core경계는 그대로 |
| 목교 | 기존deck등록과 같은 XZ det abs>=.000001/max vertexY<=go.position.y+.4 삼각형만 mask. rail/high side 제외, min clip=-10000. 실제 plank와sceneDepth가 일치하는 픽셀만 표시 |

따라서 actor 발의2/4/6cm 이웃접촉 폴백을 넓은 장판 면으로 연결하지 않고, 캐릭터·나무 높은 부분·목교 난간 앞에서는 해당 실제 receiver depth가 다르므로 출력하지 않는다. water/fog 등 transparent는 원래 후속 합성 순서를 따른다.

## 원화·재질/링 계약

SkillAdditive/KiSlashAdditive 두 원shader는1403 원blob byte로 복원했다. 2D/공중/중심형 source의 shader변경0이다. 새GroundSkillProjection만 다음 동일 수식을 사용하며 전체 source PB를 복사하고 필요한 source값을 별도로 전달한다. sharedMaterial identity는 바뀌므로 Raw false를 숨기지 않고 수식/입력/실제RGBA로 검증한다.

| source mode | premultiplied RGB / 출력alpha |
|---|---|
|0 SkillAdditive | half a=texture.a*tint.a; Flat1이면 a*=max(texture.rgb), RGB=(Flat?1:texture.rgb)*tint.rgb*a; NormalBlend1이면alpha=a, 아니면0 |
|1 KiSlashAdditive | RGB=texture.rgb*texture.a*Opacity, alpha0. sourceTint를 곱하지 않는 기존 수식 유지 |
|2 Sprites/Default | half4 c=texture*tint(default material Color 포함); RGB=c.rgb*c.a, alpha=c.a |
| blend | 원material DstBlend를 사용(현재One1/OneMinusSrcAlpha10), source material/PB와 source texture 수정0 |
| ring | step=2pi/72, edge angle=(floor(atan2(z,x)/step)+.5)*step, distance=dot(planar,normal)-radius*cos(step/2). width/2 띠를fwidth AA로 표시, 원ring RGB/alpha·blend/sort/layer. 본체cube공유/추가height query0 |

## 같은 GPU pass 증거 API

NativeGroundSkillProjection.RequestProbe(createdRGBAFloatRT,mode)는 target 소유권을 받지 않고 wrapper만 빌린다(transferOwnership=false). CancelProbe는 wrapper만 해제한다. RenderGraph가 매probe처음clearColor0을 보장하고 독립One/Zero override material로 같은 renderer PB/동일 shader를 실행한다. GPU 완료 후 ReadPixels→CancelProbe→caller target 정리 순서. ProbeSerial 증가를 확인한다. target은 해당 camera render resolution과 맞춘다.

| mode | RGBAFloat 출력 |
|---|---|
|1 | actual world XYZ + effective contribution weight |
|2 | actual packed texture UV + max(preblendRGB) + weight |
|3 | scene eye depth / receiver eye depth / abs차이 / weight |
|4 | 원래preblendRGBA(가산형alpha0 유지). visible mask는 mode1/2/3 weight로 판단 |

이 probe는 tone map 이후 화면색과 구분한다. source atlas/Opacity/Flat/색, ring 단색 band, actor 제외, 실제.02 접촉, source2D/공중 대조, 생멸/pool·2D복원, large/dense frame time, 원본1920/direct3840 및 같은패키지M1·자연실행은 실제Mac QA가 소유한다. source proxy vertex나 legacy CPU 수학으로 대신하지 않는다.

## 폐기 후보와 증거

| 단계 | 실제 근거/판정 |
|---|---|
| 원문1403 | 실제ARM64 baseline136행=112FAIL/24PASS, 원sim/rng 복원. Spike pivot lift.8403094m/정점잔차1.692096m. baselineM1 23/23 |
|95 정점격자 |148 정점·원화전달·상태 PASS/M1 23PASS. 그러나 실제반경 face내부최대.881259u, 추가GPU alpha기여표본도약16~97cm → 반영불가 |
|3c 적응면 |CPU3136/정적323 0err. 실제size-spikeTrap-Lv1 UpdateViews3.1ms 뒤 제품Late>=96초 미반환 → 반영불가. 강제종료본은미완료, 원문prefs/raw+cache 복원 |
|6e hash분산 |PC 독립8.5u diagonal677→37ms, output XYZUV+indices SHA동일. 총3151CPU PASS. 그러나 Mac100k actualField 호출3c420.078ms/6e418.668ms, flat각10.686/9.057ms/slope8.639/7.021ms. 모두100k budget 중단이며 완료/성능PASS가 아님 |
| 현재방법 | 위지연으로CPU적응면을 실제consumer에서 제거. NativeGroundSkillGeometry.Tessellate는 이전진단/회귀용 public 수학만 보존하고 제품표시에서는 호출0. 새GPU방법은 실제재검증대기 |

원본95 PNG8장은 PC images-95d4/received.json·verified.json에 저장하고 Mac whitelist 원문8SHA 전부대조했다. root가baseline/목교holy·spike/뿌리spike/흙holy 원본을직접봤다. 소유3334서버종료확인. Code/input·진단·source byte·로그는 I:/EXODUSER-Storage/ground-placement/20261102 및 Mac _out/mac-installable-ground-qa-20261102/. Mac 제품QA/helper/실행·prefs보호·빌드/설치/Unity통합은 기존 총괄 담당, PC 제품수정·정상Win반입/검수/바탕화면·main문서연결은본작업담당이다.

## MAP PRODUCTION REPORT — 현재 gate

범위: 환경 제작이 아닌 지면 효과 표현 결함. 지형/원본맵/충돌/전투핵심 변경0. Reference는 현재같은원본Player의흙/뿌리/목교이다. source/CPU·324컴파일은기술부분확인, 새RenderGraph shader/접촉픽셀/성능·1x·M1·자연플레이·앱설치/공통/PC전달은진행전이다. VISUAL VERDICT: RETOUCH(새후보GPU미검수). 기존사용자앱/세이브·PC공용WIP와index는보존하며 소스후보만으로완료를주장하지않는다.
