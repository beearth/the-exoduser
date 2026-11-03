# 적 3D Unity 연결 바탕 — 2026-11-04 01:00 재개

상태: **PC 정책103/0·전체 참조 컴파일5개 오류0 / RETOUCH_GAME_QA_PENDING.** 실제 임포트·Player 화면·동작 완성·성능은 미판정이다.
기준: origin/unity/main ec89d5166082e053b60cb23bf461bbeb143dace9. 브랜치 codex/unity-enemy3d-20261104, 작업본 G:/exoduser-wt/codex-parry. 최신 본편을 먼저 병합했고 CHANGELOG 양쪽 기록을 보존했다.

## 모델 선택

| 표현 키 | 리소스 | 동작 현황 | 표시 데이터 |
|---|---|---|---|
| etype1, startEyeMass=false | Enemies3D/SpineApostle | Meshy24본, Walk 클립 연결 | baseRadius10, height1.35, chestRatio.618, stride80, deathTicks45 |
| etype4, startEyeMass=true | Enemies3D/EyeMass | Meshy+Tripo20본, 제공 클립 없음 | baseRadius16, height1.05, chestRatio.55, stride80, deathTicks45 |
| etype4, startEyeMass=false | 현재 아틀라스 | 갑각 사도 3D 준비 전까지 유지 | 기존 Core/스프라이트 표시 |
| 모델 없음·보스·구울 | 현재 표시 | 보스 전용 경로 포함 | 기존 표시 유지 |

표: Resources/Data/enemy_rig_models.json. 기존 AnchorRatio·ImpactRatio·chestRatio/height/deathTicks 및 --enemy-render=rigpixel 이름과 의미를 유지했다. startEyeMass 키와 EnemyState.IsStartEyeMass만 추가했다. 기존 시작 로그에는 개체 ID가 없어 문자열/좌표 추정 대신 StartMobs에서 해당 두 개체에 비직렬화 표현 태그를 붙인다. Core 수정은 필드 선언+대입 두 줄뿐이며 전투 규칙에서는 읽지 않는다. 정예·스폰 좌표 해시는 새 모델 선택에 쓰지 않는다.

Spine height/chestRatio는 총괄의 0차 측정값(1.35/.618), Eye height1.05/chestRatio.55와 stride80은 잠정값이다. 실제 눈 높이·보폭은 G3.5/Mac 캡처로 보정한다. 일반 갑각 사도를 EyeMass로 바꾸던 이전 키 결함은 수정했다.

## 렌더 연결

- --enemy-render=rigpixel opt-in. NativeRemodel3D.Active일 때만 적 리그를 표시한다. 기본값과 2D 구역은 기존 스프라이트다. 영웅과 직접 비교할 때 --hero-render=rigpixel도 함께 쓴다.
- NativeGame.Enemy3D → NativeEnemyRigRenderer. 영웅과 같은 Shaders/RigPixelToon·RigPixelComposite·HD2DContact를 공유한다. 화면 높이에 따른 NativeRigPixelPolicy의 정수 텍셀 배율, Point·비MSAA·비밉맵 RT, 발밑 픽셀 스냅과 같은 외곽선 합성이다. 셰이더 사본은 만들지 않았다.
- 전용 레이어28(기존 지면 QA29·영웅30과 분리), 공유 캡처 카메라1개, 보이는 개체마다 RT1개. 포착할 리그만 일시적으로 켜고 월드 카메라에는 원본 메시를 숨긴다. 34도 카메라·거리·판정 원은 바꾸지 않는다.
- 실제 RenderRequest 성공 뒤에만 본체/걷기 스프라이트를 숨긴다. 모델/셰이더/Animator/RT 실패는 해당 개체를 스프라이트로 돌리고 경고를 한 번 기록한다. 재시작·소멸 때 RT·재질·Playables를 정리하고 카메라 마스크의 자기 비트만 복구한다.
- 기존 피격 포즈 홀드 중에는 모델도 마지막 자세를 유지한다. 모델 없는 etype의 렌더는 그대로다.

## Animator와 Core 틱

Generic Animator + PlayableGraph(Manual), applyRootMotion=false. 상태마다 JSON 클립 슬롯을 바꿀 수 있고 샘플링 시각은 아래 Core 값에서 구한다. 벽시계/Animator 자동 전이로 전투 시점을 만들지 않는다.

| 상태 | 시계/근거 |
|---|---|
| Idle | Core 틱, 기본 반복120틱 |
| Move | 기존 ev.distance / stride로 보행 위상 |
| Tell | g2Tell: MeleeTellMax-MeleeTimer / 탄:60-_projChargeT |
| Active | g2Active: MeleeActiveMax-MeleeTimer / 탄 충전 종료 후 표시3틱 |
| Recover | g2Gap 또는 MeleeFreezeUntil·MeleeParriedTick / 탄 표시 복귀9틱 |
| Hit | HurtTicks·HitStun, 표시10틱 |
| Stagger | Stunned·MaxStunned, 포이즈 붕괴 |
| Death | 첫 사망 관측 Core 틱부터 definition.deathTicks에 맞춰 클립 샘플링, 이후 표시 종료 |

탄 발동3/복귀9·Hit10은 표시용 길이이며 Core 발사/피해 수치를 바꾸지 않는다. 근접 판정은 기존 G2 타이머를 그대로 읽는다. 동작 클립이 없는 슬롯은 bind pose로 남고 missingClips/로그에 드러난다. **제공되지 않은 공격·피격·사망 동작을 제작 완료로 판정하지 않는다.** EyeMass는 리그만 있어 모든 동작이 이 상태이며, 모델/렌더 연결 검수용이다.

## VFX 연결 계약

- NativeEnemyRigRenderer.ImpactAnchor(FeedbackEvent,Camera) → nullable EnemyRigImpactAnchor. 필드 Point/Ground/WorldHeight/ProjectedHeightPx/ChestRatio/DeathStartTick/DeathTicks/Large.
- TargetId 우선. ID가 없는 이벤트는 etype+동일 좌표의 유일한 표시 개체만 쓴다. 후보가 겹치면 추정하지 않고 기존 Core 반경 방식을 유지한다.
- 표시 리그 Renderer.bounds의 8꼭짓점을 투영한다. Point는 발밑 화면Y+투영 높이×AnchorRatio(chestRatio), 몸 투영 bounds 안으로 제한한다. WorldHeight는 그 투영 높이를 해당 깊이의 월드 길이로 환산한 값이다.
- CombatImpactView.EnemyRigAnchor 선택적 콜백으로 일반 피격·치명·사망의 접점을 몸으로 옮긴다. 최종 시트 폭은 WorldHeight×ImpactRatio(일반.6/치명·사망1.0, 큰 적 상한1.2)이며 Blood Stretch도 최종 폭에 포함해 상한을 넘기지 않는다. null이면 기존 경로 그대로다. Core 이벤트 자체의 X/Y/Size는 수정하지 않는다.
- 사망 이벤트를 Dispatch에서 먼저 관측하므로 모델 사망 샘플링 시작과 기존 피 시트·바닥 혈흔 생성은 같은 Core 틱이다. 바닥 혈흔은 발밑에 남긴다. deathTicks 뒤에도 이미 생성된 피 시트가 발밑으로 튀지 않도록 마지막 리그 접점을 유지한다. 실제 무너짐 클립은 아직 없다.

## 검증·남은 관문

- 하니스 Core/Skills 재귀 열거 수정 후 지정 재검사1회:65개/실패0.
- 시작 스폰 태그·공유 etype 선택·리소스 존재·8개 상태·정지 틱·접점 bounds/비율 확장 검사1회:103개/실패0. 정책만 검사했으며 Unity 런타임 모의 PASS가 아니다.
- 전체 PC Unity DLL 참조 컴파일1회: Player Core126/Runtime268, Editor Core126/Runtime268/Editor59, 총5개 오류0. 기존 Core 경고 CS0219 2개는 유지.
- 기존 다른 작업본 Library의 RSP/DLL은 읽기 참조만. Unity/Player/빌드 실행0, 유료0. PC에서 임포트나 화면 검사를 실행하지 않았다.
- FBX·JSON·코드의 고정 GUID .meta를 추가했다. 실제 Generic 리그/클립 임포트는 Mac에서 확인한다. 이전 변환 FBX/8재질 면은 G3.5 수정 전 시범 자산이며 외형 채택 판정은 아니다.
- Mac: 1920×1080·3840×1080, 위/중간/아래 bounds와 접지, 일반4 아틀라스/시작4 육괴 구분, G2 예고·발동(겹친3마리), 일반/치명/사망 피격, 영웅 옆1x·3x, 10초 무음 영상, 30마리 성능. 모든 누락 동작 클립 제작 후 자연 플레이 판정이 필요하다.
- -output을 주면 종료 시 enemy3d-render.json에 개체키·모델·현재상태·누락클립·렌더수·폴백·최근 렌더시간을 쓴다. NativeGame.WriteEnemyRigReceipt(directory)로 Mac 하니스에서 중간 기록도 가능하다.

증거 고정 위치: I:/EXODUSER-Storage/codex-takeover/parry-g2/REPORT.md(최종 SHA), enemy3d-check/policy.log, enemy3d-compile.out.log, compile-current/result.json·assembly-sources.json·Player/Editor/*.log. 바이너리 중간물은 확인 후 정리한다.

이전 중단 이력: 3d3c186106은 예상 RED1회와 하니스 소스 열거 오류1회 뒤 중단한 WIP였다. 01:00 브리프가 재개를 승인했고 이번 첫 재검사가 통과해 그 중단 사유는 해소됐다. 이전 failure JSON은 과거 기록이며 이번 검증 결과는 아니다.
