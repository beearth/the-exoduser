# Unity 설치형 실제 지면 투영 — 2026-11-02

상태(2026-11-03): **수정 후보는 존재하지만 사용자 PC 실행본에는 미반영인 전달 결함 확인**. PID28152의 unity-latest/build는 source1318877800c93d622f521af76fb54b1cf20b92d6, Runtime SHA256 2bad5c6c8ace951017cee6c3673921692bc2a2a309ca5b5b0d23f1fbc471ff0a이며 NativeGroundSkillSurface/NativeGroundSkillProjection 타입이 모두 없다. 사용자 새 붉은 원 스크린샷은 해결 증거가 아니라 기존 결함 재현이다. 최신 origin/unity/main1d89b0c186281d5641156c3c8610679dadca253e와 충돌 없이 정상 병합했고 최신 UI/사운드를 보존했다. 병합 후 Player Core117/Runtime224, Editor Core117/Runtime224/Editor57 소스 Roslyn 검사 오류0(완전 입력 검사)이다. 처음 두 검사는 희소 작업본의 기존 Rm4/Rm3 모듈 누락으로 실패했고, 원격과 동일 바이트의 필수 코드 입력 인수 뒤 통과했다. 실제 Unity/셰이더 검사는 별도다. 기존 Mac 표적 접지·수명·M1 결과는 아래 한정 범위로 유지하며 PC 새 패키지 검수/실행본 갱신은 아직 미완료다.

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
| ground pass | Unity6000.6.7f1/URP17.6.0, 현재 package source ffe395a3a1d1 API. depth texture Load에 필요한 shader target3.5. BeforeRenderingTransparents에 receiver-depth→projection 두 RenderGraph raster pass. Depth input+intermediate texture 요구. 같은 raster orientation의 SV_POSITION.xy로 depth를Load하고, 원래 raster.xy*_ScreenSize.zw로world를복원한다(URP projector 방식, normalized UV 이중flip 금지). original material/renderer asset 파일 변경0 |
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

NativeGroundSkillProjection.RequestProbe(createdRGBAFloatRT,mode)는 target 소유권을 받지 않고 wrapper만 빌린다(transferOwnership=false). CancelProbe는 wrapper만 해제한다. RenderGraph가 매probe처음clearColor0을 보장하고 독립One/Zero override material로 같은 renderer PB/동일 shader를 실행한다. GPU 완료 후 ReadPixels→CancelProbe→caller target 정리 순서. ProbeSerial 증가를 확인한다. active volume의 정상프레임을 한 번 렌더한 뒤 공개FrameSize(cameraTargetDescriptor 실제크기)에 target을 맞춘다. NativeHd2D 내부RT/URP renderScale로 Screen과 다를 수 있다. 요청 이후해상도가바뀌면fail-closed로probe를실행하지않는다.

| mode | RGBAFloat 출력 |
|---|---|
|1 | actual world XYZ + effective contribution weight |
|2 | actual packed texture UV + max(preblendRGB) + weight |
|3 | scene eye depth / receiver eye depth / abs차이 / weight |
|4 | 원래preblendRGBA(가산형alpha0 유지). visible mask는 mode1/2/3 weight로 판단 |

이 probe는 tone map 이후 화면색과 구분한다. source atlas/Opacity/Flat/색, ring 단색 band, actor 제외, 실제.02 접촉, source2D/공중 대조, 생멸/pool·2D복원, large/dense frame time, 원본1920/direct3840 및 같은패키지M1·자연실행은 실제Mac QA가 소유한다. source proxy vertex나 legacy CPU 수학으로 대신하지 않는다.

## Mac 첫 실제 실행과 필터 참조 원인

제품 소스는8f391fea6f157433fcaea2df611d0a9b146c6604, 두 번째 검증 앱 소스는0d9ca921cb68836d8d0c61999bf6262fa0fb6e87이다. 제품 변경 없이 QA 전용 sampler만 추가했다. 첫 흙 Lv1 한 건이며 전체 설치형·대형·밀집·자연플레이·공통 앱 설치의 합격은 아니다.

| 항목 | 실제 관측과 해석 |
|---|---|
| 제품 호출 | 첫 UpdateViews3.2235ms / Remodel3DLate1.6049ms. PNG/readback 제외 한 번의 CPU 호출이며 전체 GPU frame/FPS 수치가 아니다 |
| feature/화면 | receiver287/volume1, FrameSize1920×1080, Available=true/Error 없음. 첫 모드1 유효 world 픽셀96,632개. 원본 PNG4,173,019B/SHA7b87f8a2e421907d70080a91b5627c1adc0a23658e6d33e39d57014641c367e3를 PC 수신·검산·직접 확인, 흙 가시덫 접지와 actor 앞표시를 한 장 범위에서 확인 |
| 독립 깊이 | 두 번째 실행 mode3 PASS, scene/receiver eye 깊이 최대차.0198097229u로 기존.02 안. mode4 유한값/출력존재 PASS는 원본RGBA 대조 합격을 뜻하지 않음 |
| 기존 참조 FAIL | mode2 기존 bilinear cache weight 최대차.0464395359 > 기존2/255=.0078431373. RGB최대차.0077691916는 같은허용 안. 원래 실패값·캐시를 보존 |
| 원인 분리 | textureAnisoLevel1/QualitySettings.anisotropicFiltering=ForceEnable. 정확Texture2D.Load↔기존cache RGB/alpha 차0, 직접SampleLevel↔cache alpha최대.0003750324. 단순Level 기준weight차.0464192554지만 같은UV·gradient GPU 기준weight차는최대.0003179401. 비등방성 footprint를 무시한 단순bilinear 참조가 불일치 원인 |
| 다음 판정 | 제품 shader·원화/import·전역필터·허용2/255 변경0. 기존bilinear 진단을 보존하고 올바른GPU gradient기준 weight/RGB/RGBA를 같은허용으로 대조. 현재gradient는 유효이웃finite difference로 exact fragment quad와 구분, invalid를 합격처리하지 않음. 전체 교정검사 아직 진행 중 |
| 보존 | 두 번째 진단 종료2는 기존mode2 FAIL 유지 결과. 원래sim reference/private graph 동일. prefs26raw/27typed cache는 복구 immediate/2s/7s 정확 일치. 한 파일3334 전송 서버는 수신검산 뒤 소유PID4498만 정상 종료 |

근거: Mac profile-guard-runs/20261102T032130171914Z-3872/receiver47/ground-receiver-smoke.json 및 20261102T034052091757Z-6432/receiverSampler/ground-receiver-smoke.json·receiver-mode2-sampler-reference.json. PC images-8f/received.json과 source-candidate-depth.json.

## 전체 161행 수집과 정리 예외 수정

Mac 앱822756730d260b43a2ef952a0c5a9972a812f5ea로37분 실제 실행을 마쳤다. 제품 표시 소스는8f와 동일하다. 결과100행 PASS/61행 FAIL을 보존하며 전체 통과로 보고하지 않는다.

| 관측 항목 | 실제 결과/범위 |
|---|---|
| coverage |149상태+12밀집=161행, 누락0. 큰반경12는149상태의부분집합 |
| 표시 메타데이터/접지 | statePassed161/161은표시메타데이터이며수명행동완료수치가아니다. depthFailures0, uvFailures0, derivativeInvalid0. 실제층1,185개/선택표본35,570. depth최대.0199956894u, ring distance최대.0000069700u/stroke차.0001443401 |
| 색상 모델 |60행의QA FullEvidence clone↔독립SampleGrad 모델 비교FAIL, 최대weight차.3122860789/RGBA차.4807712734. 이는아직제품shader출력FAIL로확정하지않음. 같은fixture에서공개원제품RequestProbe2/4, clone, 모델을별도대조중이며2/255불변 |
| 수명 | 두수명행의GPU·표시메타데이터값은행동최종결과가아니다. ring-lifecycle 마지막Dispose에서이미Destroy한parent의orb.go.SetActive(false)가NullReferenceException. 그뒤두행동결과를최종row에합치는단계가실행되지않았다. 따라서실제pool행동완료PASS도아직미검증이며, 수정앱에서원래두수명행동을별도로끝까지실행·저장해야한다. 원결과소급PASS금지 |
| 현재 제품 수정 | NativeSkillView.Reset에서orb C#참조뿐아니라Unity GameObject생존도검사: orb != null && orb.go != null. 살아있는orb의비활성화·전투·표시·RNG·원화수식변경0. parent파괴후Dispose의실제회귀는다음앱에서별도검증예정 |
| 보존 | full raw26/typed cache27은종료후지연저장까지복구확인. 원시float약348.5MB/PNG약1.948GB,retention절단0. 원실패·전체receipt와100/61결과보존 |

PC에추가수신한정상전층PNG3개는images-full-822/received.json의원본SHA와모두일치하고직접확인했다. 뿌리spike/Seeker는상면에붙어보이며,dense8Lv20에서는actor와효과가실제겹치고actor가앞에정상표시된다. 이3장만으로난간전체·높은줄기·바위제외나미세색오차원인까지판정하지않는다.

## 최종 후보의 표적 수명·표현 복원·M1 실제 결과

일반 Mac 후보는80d0ae89ca1af2a08987ec7b6f47340231a36bff이다. 제품16파일은root e33/guard316과byte동일하고Core는공통1403과동일하다. 이후복원보완은QA정리코드만바꿨으며제품지면/원화/색수식추가변경0이다. 현재문서·Win전달도구tip438eea1e2bbbc1ce7af8c5de78cfc9209c268d69와앱빌드source80d0은구분한다.

| 검사/범위 | 실제 결과와 한계 |
|---|---|
| 원제품/복제 두fixture | bf3e 앱에서rootSpike6,345·rootSeeker2,041 positive각각전부P/C mask불일치0, UV/weight/maxRGB/RGBA차0. 예전실패점2/2·7/7 재관측. 옛32점중5+4는미관측이라전체selectedCoverage/productClone gate false를보존 |
| 독립참조 | fine-gradient SampleGrad R은여전히P/C와다르다. 같은camera pass bias=(0,1) 확인으로해당두장면의mipBias누락가설은배제. 원60행모델FAIL/2/255/old9미관측을보존하고제품색오류라고단정하지않음 |
| guard316 정리 회귀 | 실제orb 생성6GO/4renderer/4material →ownparentDestroy→2frame→Dispose 정상반환. managed wrapper존재/Unity-null상태를함께확인하고event/registry/ownmaterial/Core보존,error0. 원예외폐회로PASS |
| 원래 두수명행동 | 같은bf3e에서FullPool/FullRing의disable/GO/ice→air→ice실제pool/arena2D/remove/Destroy/Dispose를끝까지실행하고각actionRow를finally저장·merge. action/GPU/metadata/merged모두true. 고립ring time13.269844055175781만동일인수비교에사용,제품맥동·전역TimeScale변경0 |
| QA표현 복원 | triad의58개oldref실패보존후별도80d0 narrow semanticPASS/exit0,error0. 원Core/ref/tick/event,fixture known2callback CAS원복후전체graph diff0/hash exact, 적16 body/walk/contact·필요ground10·registry/camera/root·생존원renderer flags/material/texture/savedSprite복원true |
| identity 한계 |80d0 원Renderer1,429개중파괴된old50참조는false유지(적32/contact16/ground2). 재생성객체의의미상복원과oldreference동일성을혼동하지않음 |
| 동일후보 M1 |80d0 app/source/product/Runtime/Core/exe strict일치,23/23PASS/exit0. headless-rendertexture1600×900, GUI repaint/bridge0: 자연조작검증대체아님 |
| 후보criticalSHA256 |Runtime8f9e54651f83bef314b241283b271ab3a15498c48665db6dfbefccef6f943516; Core4a3e09bceb59d4a8a186e23a669014acf8c0be8096c3c2800bbf69d0a6ab213d; exe23f97deeddb5ebc86fb858349ca40881ed6c7eb2f8632c7b1554db6c19aaedb7 |
| 보호 |80d0 두실행각raw26/typedcache27 즉시·2s·7s exact복구. Mac공유HEAD/index/WIP25파일exact,기존설치1403의핵심5파일유지. PCdesktop도기존d8링크SHA185f...동일이며원본1,236B를I:에별도보존,아직교체0 |
| 남은 실제검수 | CUA가Mac잠금/물리입력감지로수동unlock요구. 다른OS입력으로우회하지않고사용자에게해제상태확인을요청. 실제OS이동/공격/자연전투·실행본서명/설치·Win64빌드/PC반입·실행/desktop최종반영미완료. 시작화면only프레임통계를전투성능으로확대하지않음 |

원full161=100PASS/61FAIL은정정하지않는다. 새표적정리/두수명행동과semantic복원·M1 PASS는위각패키지/범위의별도후속근거다. 자동객체별마스크는새선행framework로만들지않고실제효과겹침이있는원본1x관측을연결한다. 현재VISUAL VERDICT: RETOUCH(실제자연플레이/최종실행본인수대기).

## 폐기 후보와 증거

| 단계 | 실제 근거/판정 |
|---|---|
| 원문1403 | 실제ARM64 baseline136행=112FAIL/24PASS, 원sim/rng 복원. Spike pivot lift.8403094m/정점잔차1.692096m. baselineM1 23/23 |
|95 정점격자 |148 정점·원화전달·상태 PASS/M1 23PASS. 그러나 실제반경 face내부최대.881259u, 추가GPU alpha기여표본도약16~97cm → 반영불가 |
|3c 적응면 |CPU3136/정적323 0err. 실제size-spikeTrap-Lv1 UpdateViews3.1ms 뒤 제품Late>=96초 미반환 → 반영불가. 강제종료본은미완료, 원문prefs/raw+cache 복원 |
|6e hash분산 |PC 독립8.5u diagonal677→37ms, output XYZUV+indices SHA동일. 총3151CPU PASS. 그러나 Mac100k actualField 호출3c420.078ms/6e418.668ms, flat각10.686/9.057ms/slope8.639/7.021ms. 모두100k budget 중단이며 완료/성능PASS가 아님 |
| 현재방법 | 위지연으로CPU적응면을 실제consumer에서 제거. NativeGroundSkillGeometry.Tessellate는 이전진단/회귀용 public 수학만 보존하고 제품표시에서는 호출0. 새GPU방법은 위 첫 실제 한 건을 확인했고 전체 교정검사 진행 중 |

원본95 PNG8장은 PC images-95d4/received.json·verified.json에 저장하고 Mac whitelist 원문8SHA 전부대조했다. root가baseline/목교holy·spike/뿌리spike/흙holy 원본을직접봤다. 소유3334서버종료확인. Code/input·진단·source byte·로그는 I:/EXODUSER-Storage/ground-placement/20261102 및 Mac _out/mac-installable-ground-qa-20261102/. Mac 제품QA/helper/실행·prefs보호·빌드/설치/Unity통합은 기존 총괄 담당, PC 제품수정·정상Win반입/검수/바탕화면·main문서연결은본작업담당이다.

## MAP PRODUCTION REPORT — 현재 gate

범위: 환경 제작이 아닌 설치형 지면 표현 결함과 사용자 실행본 전달. Reference는 사용자 2026-11-03 스크린샷 및 같은 원본 Player의 흙/뿌리/목교다. 현재 사용자 실행 DLL에 수정 타입 둘 다 없으므로 해당 화면은 FAIL이고, 수정 후보 자체의 제한된 시각 판정은 RETOUCH를 유지한다. 제품 16파일을 최신 공통 소스와 정상 병합하되 지형/충돌/전투 수식 변경0이다. 최신 병합 소스의 실제 빌드·동일 패키지 장판/지뢰/원형 효과·M1·자연플레이·자동 갱신된 unity-latest DLL 포함과 사용자 경로를 확인한 뒤 전달 완료를 판정한다. 사용자 실행 중 프로세스·세이브·바로가기 고정 경로와 공용 WIP/index를 보존한다. VISUAL VERDICT: RETOUCH(후보 한정), 사용자 현재 실행 화면 FAIL.


## 2026-11-03 13:40 P0 후속 — PC 구현 / Mac 판정 대기

기존 수신깊이 투영의 장애 시 직립 sprite 복원, 늪 미등록/그리기 순서, scene 깊이 재구성과 절대 깊이차 조건을 보완한다. proxy/volume bit30·수면 bit31로 수신/그리기 목록을 구분하고 위쪽 법선 성분0.2 미만의 측면을 제외한다. 원형·부채·선형 vertex-colour 예고도 기존 삼각형을 수직16m 볼륨으로 압출해 같은 수신깊이에서만 출력한다. 이전 CPU 적응면은 재도입하지 않는다. Core 위치·반경·각도·시간·피해·RNG 변경0.

이 후속의 설계·범위·Mac 판정표는 [UNITY_GROUND_AOE_P0_20261103.md](UNITY_GROUND_AOE_P0_20261103.md). PC는 컴파일1회·개인 브랜치 push까지만 하며, 이전 후보/과거 GPU/사용자 화면의 판정을 이 후속 PASS로 사용하지 않는다. 새 시각 판정은 미검증이다.
