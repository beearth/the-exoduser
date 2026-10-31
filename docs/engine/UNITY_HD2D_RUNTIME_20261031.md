# HD-2D 본 적용 — 2026-10-31

사용자 hd2d-main-brief의 1→2→3 순서. 기존 분리시험과 제품 런타임을 구분한다. 원본/시안 리마스터는 별도이며 승인 전 적용하지 않는다.

| 항목 | 구현 계약 / 현재 상태 |
|---|---|
| 소유 | G:/exoduser-wt/codex-hd2d, 기존 codex/pc-hd2d-trial-20261031; 시험 writer의 Trial/Editor/Hd2dTrialBuilder/시험 docs 변경은 보존 |
| 기준 | origin/unity/main 15c8ed3c5, 착수 HEAD ae4777860. A2 승인 이미지와 기존 실게임 탐험 이미지를 직접 열어 비교. 기존은 3D 전사 표시로 HD2D 표현 요구 FAIL |
| 표현 | NativeHd2D.Enabled 기본 true. --legacy-models에서만 기존 NativeHeroView 연결. 기존 3D 코드 삭제0. 전사·CH1 적·드루이드 원본 시트를 유지 |
| 픽셀·발밑 | Point 샘플링, alpha>64 오프라인 발끝 1,848건(영웅240+적1,600+앵글러8). 캐릭터 카메라 facing·출력 화면1화소 스냅. 정지 발선 정렬; 구르기 회전은 접지점/그림자를 유지하고 중심 lift는 비회전 카메라up 기준. 원본 드루이드 pivot(.5,.14) 유지 |
| 광원 | URP 주광+추가광, ambient RGB(.55,.58,.63), rim(.12,.16,.20), 조명 상한2.2. 드루이드 additive 복제광은 HD2D에서 비활성화. 시각 수치는 실게임 검수 후 조정 |
| 그림자 | 월드XZ 평면의 부드러운 타원. alpha=.58×actor.color.a, 높이.018u, 고정폭=영웅Radius×.02×HD2D HeroScale(필드/아레나 모두2), 적Radius×.035, 드루이드Radius×.0465, 앵글러1.5u; .24~2.8u clamp, 깊이=폭×.6. 원본 idle베이스+부분보행overlay 합성을 유지하며 공통 발선·그림자1개 공유 |
| 2단계 | 탄·장판 중심 정렬 / 지면 높이·조준 역변환 / 프레임 대조는 아직 구현·검수 전 |
| 3단계 | 틸트시프트·블룸·높이 안개·점광원·카메라는 시험 실물 판정 이후 이식 예정 |
| 보존 | I:/EXODUSER-Storage/demo-art/hd2d-main/20261031/baseline에 변경 전 정확 바이트·SHA. Core 변경0, 사용자세이브 변경0 |
| 검증 | Runtime/Editor 격리csc 오류0, 드루이드 원본oracle 불일치0, 자기체크포인트 원격대조완료. 실제Unity셰이더/Win빌드/같은빌드 무창M1/1920·3840탐험전투/통합/Desktop 미완. 컴파일이나 정지렌더는 아트PASS 증거가 아님 |

표현 기준은 Ori의 깊이층·윤곽광과 HD2D의 픽셀 캐릭터·3D 디오라마·틸트시프트다. 노레위는 조명·밀도·원근·동작 무게만 참고한다. 기존 시험 writer 소유의 예약을 중복 획득하지 않는다.

검증 갱신: Runtime 격리 csc 컴파일 오류0(기존 경고 보존). 드루이드 oracle은 origin/main 원본48케이스·54,400틱·5,421,635대조·불일치0. 최초 NuGet 실패는 자식에 APPDATA가 빠진 것으로 확인해 해당 프로세스에만 기존 표준 폴더를 보충, 전역설정 변경0. 실제 Unity 셰이더/Player/M1·화면 판정은 여전히 미완.

1단계 명세 검수 보완: InArena에서는 기존3D필드가 꺼지므로 NativeGame.UpdateViews의 끝에서 별도 XY카메라 actor 투영/스냅/접지그림자를 실행한다. 필드 그림자는XZ, 아레나는XY이며 기존Core/아레나 구조는 변경하지 않는다. 아레나 픽셀·조명·그림자 실물 검수는 후속 Player에서 확인한다.

드루이드의 발선은 파일명 추정 대신 NativeHd2D.Actor(r,true)로 명시한다. EmergeCell의 무명 런타임 텍스처도 pivot(.5,.14) 추가 상승0으로 유지하며 실제 EmergeCell3을 사용하는 아레나 접지 회귀 검사에 포함한다. 파괴된 actor의 보조 그림자도 다음 투영에서 자기것만 정리한다.

앵글러1774×887의 반화소 셀(443.5px)8개도 원본 알파로 발선을 측정했다. 발선은 float로 보존해 소수 셀 경계 절삭에 의한 접지 오차를 피한다.

1단계 정적명세 검수: 아레나 접지/스냅·드루이드 명시발선·앵글러8셀·고정그림자폭 보완 확인. Runtime/Editor 최종 격리 csc 오류0. 아래 체크포인트는 빌드전 원격복구용이며 제품완료 영수증이 아니다. 실제Unity/Player/M1·같은크기1x·통합/Desktop은 미완료다.

카메라 실행순서 보완: HD2D필드의 CinemachineBrain을 ManualUpdate로 두고 매LateUpdate에서 marker/lens→Brain.ManualUpdate→actor스냅 순서를 보장한다. 기본 LateUpdate 순서에 의존한 이전 카메라 기준 스냅을 방지한다. Legacy모델 경로는 기존 순서를 유지한다. 실제 이동영상/연속프레임 검수는 별도다.

코드품질 검수 보완: 원본 보행시트에 투명/부분셀이 있으므로 웹처럼 idle body+walk overlay를 유지한다. overlay는 base프레임의 발선/보정을 공유하고 접지그림자를 중복 생성하지 않는다. 빈셀 이동에서 적이 사라지는 회귀를 방지한다.

코드품질 후속: 구르기180°에서 lift가뒤집혀 땅아래로 내려가지 않도록 회전과lift를분리했다. 배우가회전하는중심은지면위, 논리접지점/그림자는고정한다. spawn/sink 그림자alpha도 actor알파를따라 fade한다. 원본부분보행/수명/카메라순서보완을함께검수하며 실제구르기전체실루엣은 Player연속프레임으로확인한다.

실제Player 검수: --unity-hd2d-capture -output <I출력>는1920×1080/3840×1080에서 탐험·전투·드루이드,90틱이동/구르기45장씩과hd2d-player.json을기록한다. 탐험AI정지/추가적·아레나ForceUnlock을표시하는시각fixture이며 자연완주/OS손조작증거가아니다. 최종Late카메라기준발밑/Core gap≤.75px·정수화소gap≤.02px를검사하고격리세이브가없으면실행하지않는다. M1은같은빌드별도공식실행기로검수한다.

검수fixture 구르기구간은 시작에 HP/idle·Harp225만 격리상태에서 정리하고 충돌이유지되는300px직선 방향을 찾아 실제Core roll발생을확인한다. 제품기본값변경0. FootLift는Sprite별캐시로 다수적의매프레임문자열할당을제거했다.

최종 시각fixture의JSON scope에도 이동전 HP/idle·Harp225정리를명시한다. 실제플레이/자연완주와검수용고정조건을혼동하지않도록한다.

2단계 적용 전 피격프레임 기준자료: I:/EXODUSER-Storage/demo-art/hd2d-main/20261031/phase2-hit-baseline. origin/main fc9b6290d의 공통탄 원본478줄을 VM에서 그대로 실행하고 같은 Core DruidBoss.TickWorld와 대조했다. 정지플레이어/보통마법탄/기본장비/벽·소환체·패링없음108조건×60틱=6,480틱에서 피격프레임불일치0, 둘다활성인탄위치불일치0. 화면밖2500px 제거의 기존수명차444틱(고속빗나감12조건)은 별도기록하며 전체탄동등성PASS가아니다. 최초진단의테스트호스트벽경계불일치는명시된벽없음조건으로수정했고제품Core변경0. 실제웹·Unity옆비교PNG는아직없다.

맵통합조건: 맵후보6cd30df0b에는 NativeGame.HellLighting.cs의Late 재질대입과A2EnemyGrounding 메시그림자가있으나 현재공통15c8ed3c5/HD2D66e15에는해당파일이없다. 향후검증된맵후보와정상병합시HD2D배우의SpriteLit재질을덮지않고기존맵의적그림자를중복생성하지않도록조율한다. 환경주광/화로/불꽃은보존하며최종Late재질과그림자1개를실제Player에서검증한다. 맵WIP복사0.

1단계실물검수 보완: fixture는목표60fps/수동Core틱이며각해상도에서드루이드전투360틱·3틱간격120장(60Hz Core시간기준20fps)을추가한다. 드루이드상태/텍스처rect/최종재질과영웅최종Shader/접지그림자가활성인지JSON에기록하고재질덮어쓰기를실패로검출한다. 공격을안하는좌우회피입력으로실제BossAI를관찰하며중간피격·사망을숨기지않는다. 자연플레이증거로쓰지않는다.

촬영완료계약: 새빈출력폴더만허용한다. 최종PNG336개(각해상도스틸3+영웅45+드루이드120)의IHDR해상도·IEND완료를검사하고최대15초배출대기뒤누락/부분/해상도오류를실패기록한다. 드루이드360번째틱후사망도별도실패검사한다. 고유run폴더를재사용/덮어쓰지않는다.

2026-10-31 촬영밀도 보완: 빠른공격을3.3fps의정지목록만으로판단하지않도록드루이드간격을18→3틱으로변경했다. 360틱/60Hz=6초·120고유PNG를20fps논리시간영상으로검토한다. 영웅은90틱/2=45장·30fps다. 촬영IO와수동틱때문에실제벽시계fps/프레임성능증거로세지않는다. 원시기존코드/문서는I:capture20fps-before-*에보존,제품Core/밸런스변경0이며실제Player촬영은아직미실행이다.

최종재질검수범위: 각캡처프레임의활성·현재등록된모든Sprite배우에서actorCount/actorShaderFailures를기록하고SpriteLit이외재질을실패로잡는다. 표시중인드루이드본체의bossMaterial도별도실패검사한다. 주인공만확인해서적/보스의Late재질덮어쓰기를놓치는것을방지한다. 아직실제Player실행결과가아닌검수fixture보완이다.


## 2026-10-31 원본 전사 공격 표시 복원

| 항목 | 구현 계약 |
|---|---|
| 적용 상태 | wWindup / wSwing / wRecover / sBash / sRecover 모두 기존 attack-bat-v1 80px·9셀·8방향 사용 |
| 원본 | 최신 웹62bae8a50의 warrior-bat-swing.js SHA256 6a1d0932a4e39584f31b2cb6e73b622c165b105a36a7d443969d8c9228040921 |
| 속도 | 원본 .85. 회복 초반 duration×(1/.85−1) 지연으로 베기를 끝낸 뒤 6/7/8로 검을 내림 |
| 일반/기검참 | wSwing duration5, 원본 windup=max(1,Int(10/(WeaponSpeed 또는1))), recovery=max(1,Int(16/((WeaponSpeed 또는.3)×AttackSpeedMultiplier))) |
| E 공격 | sBash duration20, 경과2/4/7/8/11/14 경계로0…6. sRecover는 기존 ParryRules.SRecoverTicks(PParry)만 읽음 |
| 검증 범위 | 원본JS에서5상태×windup3종×recovery5종의모든정수남은틱1,344조건추출. 기존표시1,234불일치(일반화windup입력포함), 순수제품표시함수0불일치. 실제게임경로1,234건고장이라는뜻이아님 |
| 보존 | Core·피해·공격/회복시간·공속·E패링 규칙 변경0. 기존3D모션코드유지. 실제Player프레임검수는별도미완 |

기존 표시가 wSwing/KiCharge만 공격시트를 쓰고 회복/E에서 기본시트로 즉시 바뀌던 차이를 복원했다. 원본 byte와 RED/GREEN 검사·API 로그는 I:/EXODUSER-Storage/demo-art/hd2d-main/20261031/sprite-attack-timing에 보관한다. 로비/Core는 현재 전사만 해금되어 있으므로 이 수정으로5영웅플레이완료를주장하지않는다.


## 반복 투영·writer 원본 자세 (2026-10-31 실제 Editor 검수)

| 항목 | 현재 계약·근거 |
|---|---|
| 원본 pose | NativeHd2D registry는 renderer의 원본 parent/localPosition/localRotation과 최초 source roll을 보존한다. ProjectActor는 저장 원본에서 매번 화면 스냅/lift/카메라 회전을 재계산한다. 현재 투영된 transform을 누적 입력으로 쓰지 않는다. |
| writer 경계 | UpdateViews 시작의 기존 Remodel3DRestoreBillboards 다음에 RestoreSourcePoses를 실행하고, 기존 Core Point writer 뒤 Actor가 새 원본을 확정한다. 위치만 쓰는 일반적·드루이드에도 이전 billboard 회전이 섞이지 않는다. |
| 소유권 | IsActor는 frameCount 대신 살아 있는 registry 등록을 판별한다. writer 없는 프레임에도 재질 소유권·카메라 재투영을 유지한다. destroy 시 원본 pose와 자기 접지 그림자를 함께 정리한다. |
| 역할 전환 | bossDruidUnder는 ReleaseActor(main) 후 기존 흙더미 표현을 사용한다. 잠복 mound를 이전 배우 foot/contact로 재투영하지 않는다. |
| RED | 실제 D3D11 Editor의 같은 원본 2회 투영에서 76px, 카메라 왕복에서 228px 오차 재현. 당시 제품 소스와 실행 영수증은 I:/EXODUSER-Storage/demo-art/hd2d-main/20261031/editor-repeat-projection에 보존. |
| GREEN | 동일 최소 재현의 반복/왕복 오차 각각0px. 확장 RepeatedProjection 640회(평면/필드, 원근/직교, pivot-foot/alpha-foot, roll4방향, 카메라 왕복/부모 이동/위치-only writer), 최대0.0002441406px. 기존 ActorAnchors 12건 최대0.474586px, RollCentre 4방향, DruidPivotFoot 0.42429px, Shaders 통과. |
| 한계 | 실제 Editor 기술검수다. Player 연속 프레임·전투/이동/구르기 실루엣·시각 품질·같은 build M1·공통 통합·Desktop은 이 결과만으로 완료하지 않는다. 실패 상태 Map a5491d8c0 인수0. |


## 첫 Player 실패와 원거리 스냅·아레나 재작업

| 항목 | 현재 계약·검수 범위 |
|---|---|
| 첫 빌드6f2e16b15 | BuildSucceeded/오류0, 212파일3,102,459,308bytes, 실제DLL160 MCP파일·참조0. 현재제품Core114개 고정바이트로 druid48조건/54,400틱/5,421,635검사,실제패링26,특수탄48,708,피격3,000조건/47,559검사 모두불일치0. |
| M1 | 같은 빌드 f9ddef48 D3D11·batch 23항목모두ok, 사용자창/잔류/세이브변경0. remodel의batch 캡처는 비활성view 참조로 검은화면이며GUI Repaint/bridge0이다. 기능 검수만 인정하고 실화면/HUD 검수는별도hidden ScreenCapture를쓴다. |
| 실제 Player FAIL | b4945464는1920/3840의드루이드360틱중292틱에서사망하여PNG292장. motion8 스냅0.02069488px가한계0.02px초과. druid 정지화면은상단잘림·작은영웅도직접확인. 같은 실패본과5개failure/모든rawPNG 보존. 합격으로올리지않음. |
| 원거리 역투영 | SnapAnchor의ScreenToWorldPoint 후카메라평면에서출력화소잔차를3회보정한다. projection.m00/m11·pixelWidth/Height·depth로원근/직교world/화소단위를구한다. original camera depth를유지하고기존0.02px허용치를늘리지않음. |
| 실제 Editor 스냅 | Player범위와먼좌표를포함한원근1024조건 RED332/max0.07608262px. 수정후원근/직교·1920/3840·4X×4Z×32높이 총2048조건 max0.001556396px/실패0. 반복투영640 max0.00006103516px, 기존앵커12 max0.4744214px·회전4·드루이드0.42429px·shader PASS. |
| 영웅 표시 크기 | HD2D는field/arena/flat에서2×HeroScale2=scale4. legacy는기존2×(field일때HeroScale2,그외1)보존. 접지폭의배율도같다. Core Radius/히트박스/이동/공격 수치변경0. |
| 아레나 구도 (e623 당시·아래 방식으로 대체) | 기존 view 카메라를사용한다. writer가드루이드/영웅을갱신한뒤,실제드루이드bounds와영웅예정foot-lift bounds union을x.08~.92/y.20~.88 안전영역에맞춘다. halfHeight=max(기존줌,높이/(2×.68),너비/(2×.84×aspect)). centreY.54,전투중필요최대half유지·필드복귀시초기화. 새카메라0. |
| 카메라 순서·흔들림 | 최종아레나카메라→teleView.Update 1회→flat actor projection. 원본피격shake의같은2난수offset을구도centre에더해보존. field/legacy의기존카메라동작은유지. |
| 아레나 Editor | 실제body sprite/idle·fanWind·charge·dive·플레이어3위치·두해상도24조건:전신viewport안전영역,흔들림offset보존,ortho AimWorld XY왕복 통과. 실제arena edge/background·연속카메라품질은재Player에서판정. |
| 촬영 fixture 입력 | boss 정지/모션시작을보스동쪽650px의실제CanMove점으로옮긴다. 모션시작Harp225 한회설정후,거리650 유지원회피+70틱중30틱에실제SetRollInput,회피당45소모. EnemyAi=true/360틱·120샘플유지. Core/피해식변경0. 자연플레이검증아님. |
| 전술 사전검사 | Play모드 없이실제Editor의제품Simulation·SourceStarterFixture·원본맵·초기shield0/iframes0에서16seed 모두360틱생존,실제5roll·최저HP254.7343. 이는전체Player 진입RNG와동일하지않으며다음빌드합격증거아님. y구간제한arc는1seed사망하여채택하지않음. |
| Map 후속 | Map은담당전달최신f54534e664/NOT_READY이며인수0. 이후HellArenaCamera와view 구도를동시에적용하지않고실제최종HudCamera한곳에통합한다. 뒤늦은Clamp로다시잘리지않도록edge/telegraph/Aim·원본흔들림을같은후보로검수. |

다음 새소스빌드·같은M1·336PNG·실물구도/이동/전투·MERGE_QUEUE/공통/Desktop은아직미완료다. 기록경로는 I:/EXODUSER-Storage/demo-art/hd2d-main/20261031/editor-translated-snap, stage1-product-oracle-6f2e16b15, build-input-6f2e16b15를따른다.


## 입구 거리 고정 줌 재작업 (e623 실제336장 뒤)

| 항목 | 현행·근거 |
|---|---|
| e623 기술/시각 분리 | build fb08b284 오류0, same-build M1 b4fc7fea 23ok, hidden Player06945194는336PNG/360틱2회완료·foot최대.67703664px/pixel최대.00048828125px/배우shader0fail. 창/잔류/세이브변경0. 실제1920드루이드에서배우가작고화면외검은영역이커시각FAIL. |
| 원인 RED | halfHeight의encounter전체최댓값에입구~보스거리까지저장해근접해도줌이돌아오지않음. actualEditor 입구2000px→근접650px에서18.952446→18.952446,새근접장면6.75와달라실패. |
| 현행 구도 | NativeDruidBody.Anchor를기준으로드루이드local상대bounds의형태최댓값만보존한다. 이를현재anchor로옮긴뒤현재영웅bounds와union하여매번halfHeight/centre를다시계산한다. 입구거리최댓값은저장하지않는다. 필드복귀시형태cache초기화. 안전영역/기존기본줌·shake·telegraph순서는그대로다. |
| actualEditor GREEN | 입구18.9520321→근접6.75,새근접6.75로같음. 기존24조건전신/흔들림/조준왕복도통과. 형태변화때본체가잘리지않도록body-relative bounds만남겼다. |
| 미완료 | 이수정의새소스build/same M1/실제1920·3840 336PNG/영웅가독성·arenaedge는재검수전. 이전e623기술PASS를새소스시각합격으로대체하지않는다. Core114개변경0/리마스터채택0/Map인수0. |


## 1단계 최종 제품 검수 — 087d32acb

| 항목 | 실제 결과·한계 |
|---|---|
| 소스/빌드 | 087d32acbeceee2c345e5c1128d703964b10efab → 공식 build04000ad8, D3D11, 오류0. I:/EXODUSER-Storage/unity-builds/hd2d-main/087d32acb-stage1. 212파일/3,102,460,844bytes, DLL160/MCP파일·참조0. Runtime DLL SHA256 7c78af66ece98cc77a22857d88ddd3bc7048892c54595c138d1d734e506af0fd. |
| 같은빌드 M1 | 0a4f412f, 23/23 ok. 실제 D3D11, 사용자창0/잔류0/사용자세이브변경0. 기능검수이며 batch 검은화면을 시각근거로 쓰지 않음. |
| 같은빌드 Player | cb4326ac,1920×1080/3840×1080 탐험·전투·드루이드336PNG. 각360틱완료/종료HP526, 실제roll샘플74. foot최대0.6646174788px/pixel최대0.00048828125px/actorShaderFailures0. 오류·누락0. |
| 입력 표시 보충 | 970c117b,1600×900 E/LMB54PNG/160frames/7checks/실패0. 가상InputSystem→FixedUpdate 경로. AIoff·iframes100000 fixture이므로 자연플레이·피격·패링합격증거아님. |
| PNG 원본 | 390파일1,697,030,764bytes의IHDR/IEND/해상도/SHA 전수감사PASS. 플레이원본1x와A2옆비교에서플레이픽셀변경0. 참조A2는1664×936→1920×1080로만규격화했다고명시. |
| 규칙 검증 | 제품Core114파일이 기존actual oracle입력과바이트동일. druid48/54,400틱/5,421,635검사,actualparry26,특수탄48,708,피격3,000/47,559 모두불일치0. 현재공통15c8ed3c5대비Core diff0. |
| 직접 시각 판정 | 정지6장과선택이동/구르기/드루이드공격/E/LMB 원본·native crop을제작자와독립검수자가확인. 1단계배우전환/기본구도/표시연결샘플PASS, 전체아트RETOUCH. 336장전체연속재생·자연완주·실측fps검증은아님. |
| 잔여·담당 | 원본드루이드공격셀상단절단→sprite writer, 구르기서있는몸회전→모션/리마스터, 영웅대비/접지→3단계조명, 분리된파란shield arc→2단계, 옛RM1/황록수면/3840검은외곽→Map인수·3단계. 리마스터사용자승인전채택0. |
| 상속범위 | 사용자가시험브랜치계속사용지시. 공통대비262경로에Trial77/WoodbridgeR3 161가상속됨. 제품build scenes는FirstPlayable+RM1_Slice이며Trial제외. 이두장면에서상속시험/RF3의120GUID직접참조0. Map R4 런타임인수0과상속RF3에셋존재를구분. 임의삭제/되돌림0. |
| 보존/운영 | build유래tracked538개정확바이트I보존후CAS원본복원,초기untracked57바이트동일/기존guard WIP보존/INDEX0. 공식GPU예약반환/자기Unity·Player0. |
| 인수경계 | SOURCE_READY / COMMON_APPLY_WAIT_PAUSE. Pause가현사용자지시로공통/Desktop단독소유,종료영수증전중복쓰기0. 공통정상병합후새공통빌드·동일M1·Desktop갱신은아직미완료. 단계2/3도아직미적용이며이번PASS에포함하지않음. |

상세 근거: I:/EXODUSER-Storage/demo-art/hd2d-main/20261031/STAGE1_FINAL_VISUAL_REVIEW.md, stage1-review-087d32acb/raw-png-audit.json, inherited-trial-audit.json, STAGE1_GPU_RETURNED.json. 앞 절의각과거미완료는해당당시상태이며이절의087실검수로갱신한다. 기능상수·밸런스변경0.

순수공통인수 보충: 상속Trial/RF3는자기branch에보존하고공통전체branch무조건병합하지않는다. MainRuntime10+Resources6+Editor검수2+관련docs4(Trialdoc제외) 총22경로의정확바이트manifest를인수범위로제안한다. 087빌드는Trial코드가컴파일된실검수원본이다. 순수공통에서DLL이바뀌므로새빌드/같은M1/Player/실화면/Desktop을필수로재검증하며087영수증을순수본동일입력이라주장하지않는다. manifest는stage1-review-087d32acb/pure-intake-manifest.json.


## 순수 제품 입력으로 시험 자료 분리

| 항목 | 현행 계약·근거 |
|---|---|
| 공통 기준 | Pause 완료118a9421a67965905e89931b4d5faa9a8356f3bc와정상병합. 통합담당순수842bae975de0296c9ead831c1e7af416a7a26bcc의22경로입력을따른다. NativeGame의Pause PlayerDown복귀조건과HD2D표현을함께보존. |
| 시험 자료 | 상속Trial/RF3/시험문서240경로,308,929,304bytes를I:/EXODUSER-Storage/demo-art/hd2d-main/20261031/stage1-pure-source-intake/original에정확보관. HEAD Git blob·현재WORK·보관readback SHA모두대조했다. reparse부모0/현재파일정규경로검증뒤해당240만정상forward제외. 기존aef원격이력도보존. 원본영구삭제/타인WIP삭제0. |
| 실행 입력 | 제외후Unity Git tree는통합담당순수842와정확히같다. Trial Runtime/Editor코드와미사용RF3는제품컴파일입력에넣지않는다. 자기기존branch/worktree를계속사용하며새writer/worktree0. |
| 보호 | 기존guard WIP·초기미추적57경로를정확바이트로보존,미추적C#0. 보관영수증archive-receipt.json/입력보존untracked-before-merge.json. 복구용미추적백업branch는정식모듈채택이아니다. |
| Core 경계 | 현재Core는Pause공통과동일하며HD2D1단계가추가한Core변경0. 이전087의114전체바이트동일주장은15c기준의당시증거이고,이번PauseNavigation변경을포함한순수제품입력의새빌드/같은M1/Player검수를별도로진행한다. 2단계Core·surface·리마스터후보는여전히I미적용. |
| 검증 상태 | Unitytree동일성은새실행검증의준비다. 순수새DLL/build/M1/1600·1920·3840Player/1x/공통Desktop은이정리커밋만으로완료하지않는다. 앞선4공식GPU예약을보존하고기존Main owner로꼬리한건만검수한다. |


## 순수1단계 같은빌드 재검수 — 985daefcf r2

|항목|실제새증거·범위|
|---|---|
|입력/빌드|985daefcf6343c9221731249ed85aeecebb3e989(Unitytree95af39c39dec5bb607c2b92ea3f4418e137480c0)→공식35ab5195/Succeeded/builder오류0/3,102,479,948bytes. 원로그errorLogs2/기존importer·licensing경고보존|
|같은Runtime|ae1c4cf27663d1786222e0a0da0d5078505835f74005c87c9a9e0d805bc5822b. 실제212파일/DLL160/MCP파일·참조0, 3실행전후EXE/Runtime/Core SHA동일|
|Core검사|순수985정확114입력4suite(드루이드5,421,635/실제패링26/특수48,708/피격47,559검사)모두0. PauseNavigation포함현재입력을빌드후114byte재대조0. 이전087입력으로대신하지않음|
|M1|ecddc37a/23항목ok/D3D11/batch기능만|
|Player|9bf3b4da/1920·3840×1080/336PNG·336frame/footMax .6790987849px/pixelMax .00048828125px/배우Shader실패0/각360틱종료HP526|
|조작표시|98695705/1600×900/E·LMB54PNG/7checks0. 실제가상InputSystem→FixedUpdate. 자연피격·패링·OS손조작아님|
|PNG감사|총390개1,704,217,584bytes/IHDR·IEND·SHA전수0실패. 원본수정0/원본1x부분추출비교|
|보존|build유래519경로를I에정확보존후CAS원본복원519. INDEX0/trackedUnity clean/guard WIP·기존57 byte불변. 창/사용자세이브/잔류각0. 공식GPU반환exit0|
|시각|선택정지·이동/회피·예고·E/LMB원본1x직접검토: 1단계배우전환·발선/재질·기본프레임/표시연결표본PASS, 전체아트RETOUCH. 드루이드원본상단잘림/회피뻣뻣함/영웅대비약함/분리shield arc/옛RM1수면은유지해후속담당명시|
|다음인수|R5 1a3기술게이트는R2같은DLL/M1·실제field22로별도충족/전체아트RETOUCH. 순수맵+HD호환4함수정상병합후새실행검수. UI아직FAIL후보0. 공통·Desktop지정단독writer통합/단계2·3·리마스터채택은아직미완|

실물판정/근거는 I:/EXODUSER-Storage/demo-art/hd2d-main/20261031/STAGE1_PURE_VISUAL_REVIEW_985_R2.md, STAGE1_PURE_BUILD_LINK_985_R2.json, stage1-pure-validation-985-r2/receipt.json, stage1-pure-review-985-r2/raw-png-audit.json. 옛087/실패내역은역사그대로보존하며새순수본증거로덮지않는다.


## R5 순수맵과 HD-2D 1단계 정상 결합 — 새 실행 검수 전

|구역|현재결합계약·검수경계|
|---|---|
|인수|맵source1a3d758352fb10b6facace12a61a64253b7a9e76는19c6공통기반순수맵. R5-R2 같은DLL/M1·field22 기술게이트PASS/전체아트RETOUCH. 실패중인UI확장후보는인수0. 이전순수985실행본에는이맵이없었음|
|정상충돌해소|NativeDruidBody Anchor와PresentationScale를함께보존. R3최종marker→ManualUpdate→HDProjectActor순서유지, nonHD fallback은MapNativeEnemyFootprint를사용. NativeGame의Pause복귀/HD배우/Map·기존공통Sound를함께보존|
|재질|HellLightingLate의actorMaterial대입과shadow해제를 !HD또는!IsActor에한정해최종HD SpriteLit/접지소유권을덮지않음. 기존환경주광·화로·불꽃보존|
|일반적그림자|A2EnemyGrounding은기존AimWorld85px최근접target ID갱신후HD등록body/walk의추가메시만제외. HD그림자1개유지, 기존42출력px상태표시보존|
|AA|A2Field는HD일때AntialiasingMode.None/legacy는기존SMAA. Source와point filtering/pixelSnap을후처리AA로흐리지않게구분|
|아레나|HD는기존view의body-relative+hero프레임을그대로사용하고새MapHellArenaCamera는disabled. 드루이드PresentationScale=1/legacy=.72. Map별도zoom·viewmask0재적용은!HD경로만, Map중복boss/playercontact는HDoff. 원래arena지면·횃불·국소광·A2ArenaSetup보존|
|입력불변|Core114/Pause기준수치·판정·저장변경0, SourceMap보행/LOS40000과Map좌표·목교상부변경0. 단계2Core/surface·단계3post/water·리마스터반영0|
|현재검사|동결정상3way I후보 Core114/Runtime196/Editor55 C# API모두0. 실제merge소스와준비후보를byte로재대조. API는Shader·최종카메라·새Player·M1·실제화면검수가아님|
|남은게이트|새소스정상commit/remote복구→새고유build→같은M1·실제1920/3840 field/arena·조작→제작자1x판정→MERGE_QUEUE→지정integrator common/Desktop. 기존35ab/985영수증을새Runtime에재사용하지않음|

근거 I:/EXODUSER-Storage/demo-art/hd2d-main/20261031/stage1-map-r5-combined-api, 맵담당 R5-R2-기술검수-아트판정.json. 맵조형·카펫형바닥/반복원형뿌리/원경높이층은Map담당RETOUCH, 독액색·약반사·기포·실교각물결은Main3단계미완으로구분한다.
