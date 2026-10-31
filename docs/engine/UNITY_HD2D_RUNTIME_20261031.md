# HD-2D 본 적용 — 2026-10-31

사용자 hd2d-main-brief의 1→2→3 순서. 기존 분리시험과 제품 런타임을 구분한다. 원본/시안 리마스터는 별도이며 승인 전 적용하지 않는다.

| 항목 | 구현 계약 / 현재 상태 |
|---|---|
| 소유 | G:/exoduser-wt/codex-hd2d, 기존 codex/pc-hd2d-trial-20261031; 시험 writer의 Trial/Editor/Hd2dTrialBuilder/시험 docs 변경은 보존 |
| 기준 | origin/unity/main 15c8ed3c5, 착수 HEAD ae4777860. A2 승인 이미지와 기존 실게임 탐험 이미지를 직접 열어 비교. 기존은 3D 전사 표시로 HD2D 표현 요구 FAIL |
| 표현 | NativeHd2D.Enabled 기본 true. --legacy-models에서만 기존 NativeHeroView 연결. 기존 3D 코드 삭제0. 전사·CH1 적·드루이드 원본 시트를 유지 |
| 픽셀·발밑 | Point 샘플링, alpha>64 오프라인 발끝 1,848건(영웅240+적1,600+앵글러8). 캐릭터 카메라 facing·출력 화면1화소 스냅. 정지 발선 정렬; 구르기 회전은 접지점/그림자를 유지하고 중심 lift는 비회전 카메라up 기준. 원본 드루이드 pivot(.5,.14) 유지 |
| 광원 | URP 주광+추가광, ambient RGB(.55,.58,.63), rim(.12,.16,.20), 조명 상한2.2. 드루이드 additive 복제광은 HD2D에서 비활성화. 시각 수치는 실게임 검수 후 조정 |
| 그림자 | 월드XZ 평면의 부드러운 타원. alpha=.58×actor.color.a, 높이.018u, 고정폭=영웅Radius×.02×필드HeroScale(아레나1), 적Radius×.035, 드루이드Radius×.0465, 앵글러1.5u; .24~2.8u clamp, 깊이=폭×.6. 원본 idle베이스+부분보행overlay 합성을 유지하며 공통 발선·그림자1개 공유 |
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
