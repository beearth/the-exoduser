# 데모 v0 드루이드 표현 후보 — 2026-10-30

브리프: `I:/EXODUSER-Storage/codex-takeover/boss-druid-brief.md`. 착수 소스 `10c49850f85dca6365cbf67b8067e6fa749b026d`, 최신 공통 `4fedb6a3f`의 악의구 원작성 변경을 정상 병합해 보존했다. 자기 표현 변경의 Core 수정은 0이다. 모델은 DESIGN LOCK v0.4 §16 형태 게이트 **FAIL**이며, 이번 독립 탄막 개선과 선택형 연결을 전체 보스 리마스터 완료로 세지 않는다. 모델 실패 실물은 [기존 임포트 기록](UNITY_BOSS_DARK_DRUID_3D_IMPORT_20261029.md)의 최신 절에 있다.

| 항목 | 구현·수치 | 검수 경계 |
|---|---|---|
| 기본 탄막 | `NativeBossView.DruidProjectile.cs`와 `Resources/Shaders/DruidProjectile.shader`. 드루이드 `DruidPoison`·`Orbs`만 새 표현. 물리=수피 핵 `(0.24,0.12,0.055)`·뼈빛 능선 `(0.78,0.72,0.56)`·국소 황록 테 `(0.58,0.72,0.12)`, 마법=녹색 독방울, Friendly/BlueBean/ParryBlueBean=청색. 좌표·속도·R·faction·ParryClass 읽기 전용. 지뢰·다른 필드탄은 기존 경로 | 실제 GPU·1x 판정은 아래 영수증으로 구분 |
| 핵 지름 | `max(2R,min(대형64/일반28,max(12,Sz×14)))`px. 물리 가시는 `max(위 값,18,4R)`. 쿼드는 핵 지름×2 | 큰 실제 판정원을 지름 상한으로 줄이지 않음. 이 값은 Core 충돌값이 아님 |
| 형태 재작업 2 | 물리=비대칭 목질 절단면·뒤쪽 삼각 가시 3개·수피 홈 2줄, 마법=기운 독 씨앗·붙은 짧은 꼬리/부리·분기 독맥 3줄. 물리 중심 핵 `.255−r`, 마법 `.505−r`를 합쳐 실제 판정 반경의 최소 1.02/1.01배를 보존 | 첫 GPU 후보의 녹색 테가 목질 색을 압도하고 마법탄이 구슬로 보인 결함은 **FAIL**. 이번 변경은 새 GPU 판정 전 |
| 광량·표면 | `halo=max(0,1-r/0.80)²×(물리 .006/마법 .025)`, `rim=exp(−65×abs(edge))×(.035/.10)`, 최종 rim 기여 `.35`. 독맥 `.13/.52`, 젖은 반사광 `.10/.34`, AA `max(.006,fwidth(edge)×.7)`, shader target 3.0. 긴 입자·넓은 링·난수 잔점 없음 | 밀집 탄·회복 장판과 겹친 실제 화면 확인 필요 |
| 같은 빌드 비교 | `--unity-original-druid-projectiles`이면 과거 독탄·오브 표현. `NativeReviewArgs.Any`에 포함해 전투 세이브 쓰기를 차단하고 검수 중 지역명 표시 허용 | 새 표현은 모델 공급과 독립 |
| 모델 연결 | `--unity-druid-3d` 기본 꺼짐. `Resources/Art/boss/dark_druid_3d/DarkDruid_Runtime.prefab`와 Idle·Walk·CastThorn·CastPoison·CastRoot·Slam·Hit·Death가 전부 유효할 때만 활성화. 현재 프리팹·새 모델 공급 없음 | 필수 자료가 없으면 기존 2D 시트 유지, 동일 누락 경고는 프로세스당 1회. 모델/리깅/동작의 채택 증거 없음 |
| 리그 입력 검증 | Instantiate 전에 활성 계층 Animator·유효 Generic Avatar(`isValid && !isHuman`), 면/정점 있는 스킨·동수의 본/바인드행렬, 모든 본의 같은 Animator 계층 소속, 유한·가역 행렬, 활성 스킨을 검사. 클립은 길이>0·비어 있지 않은 Generic 동작(`!legacy && !isHumanMotion && !empty`)이어야 함 | 메타데이터 검사이며 실제 변형 검수와 다름. 생성이 모두 끝나야 Ready, Dispose 즉시 Ready=false |
| 방향 | 정면 -Z인 모델의 Y 회전=`Core Facing×180/π−90`°. 동/남/서/북→−90/0/90/180° | 원래 반대 부호에서 남향이 등을 보이는 오류를 4방향 앞벡터 검사로 수정 |
| 3D 합성 계약 | 실제 스키닝을 55°·768² 투명 RT로 렌더한 뒤 기존 2D 아레나 정렬에 합성. 직교 크기 1.6m, 카메라 거리 6m·목표 높이 1.25m, 주광 1.25·보조광 0.48, 접지 타원 그림자 | 미실행 미래 연결. `NativeRemodel3D.Active`이면 모델 Draw/Sink는 기존 경로로 폴백한다. 실제 3D 아레나 직접 모델 표시는 미연결이며 조명·투영 그림자·디자인 PASS 아님 |
| 모션 시계 | `NativeDruidMotionClock`. Idle/Walk=180/96틱 루프, Hit=24틱, Death=90틱. Slam=48/6/70프레임, 접촉 48/124·회복 시작 54/124. 다른 Cast=예비 0~0.4·발동 0.4~0.48·회복 0.48~1. 실제 Core 상태·남은 timer로 수동 샘플 | 신규 동작 파일 제작·발 접지·지팡이 접촉 검증은 안 됨. 시계 수치 검사만 |
| 회복 연장·피격 | 회복 진행도 p는 남은 시간이 증가하면 유지하고, 감소하면 `p'=1−(1−p)×새 remaining/이전 remaining`으로 남은 자세만 재분배. 실제 패링 +30틱과 피격 중 연장/경과를 보존. Hit는 별도 진입 시각을 써서 기저 회복을 다시 시작하지 않음 | 70→50→80→40→0의 회복 시간 연장에서 강타 정규 자세 54/124→74/124→같은74/124→99/124→1. Core 패링 값·타이머 변경 없음 |
| 수명 | 새 런·OnDestroy에서 Graph·RT·무대·재질·스프라이트 정리 | 실제 모델 프리팹을 넣은 반복 새 런은 미검증 |
| 비교 영상 캡처 | `--unity-m1-check --unity-m1-boss-film -output <I:출력>`에서 기존 보스 싸움 첫 720틱, 2틱마다 PNG. 360장·30fps=12초. `film/film.json`에 tick·탄 수·상태와 검수 범위 기록 | 기존 M1의 직접 입장·체력 보조·HP 페이즈 진행·합성 장판이 포함됨. OS 손조작·자연 종주·새 3D 모션 영상이 아님. 일반 플레이 영향 없음 |

## 보스 접점과 배우 자세 정지 — 표현 전용 후보

`NativeDruidImpactClock`은 기존 `DispatchFeedback`의 매 Core틱에서 현재 si0 드루이드 본체 등록·id·좌표·반지름을 확인한다. Core 파일·상태·시간·피해·입력·탄 좌표·난수는 바꾸지 않는다. [기존 히트스톱 비활성 계약](UNITY_FEEDBACK_20261024.md)은 유지하며, 아래는 전투 전체를 멈추는 히트스톱이 아니라 **배우의 표시 자세만 유지하는 보강**이다.

| 항목 | 표현 계약 | 검수 경계 |
|---|---|---|
| 실제 사건 | `BossHit`/`EnemyCrit` 중 `IsBoss`·Etype·현재 좌표가 si0 본체와 유일하게 일치하는 사건. 알림에 actor id가 없어 같은 Etype의 여러 생존 보스 반경 안에 들면 모호하므로 생략. 원래 비DOT 피격음 알림의 8틱/치명타 12틱 쿨다운을 유지 | 보스가 맞았다는 알림이며 드루이드가 플레이어를 때렸다는 뜻이 아님. 모든 타격을 포괄하지 않음. 현재 틱만 허용. 필드 앵글러는 별도 `FieldBossState`이며 Core에서 아레나 진입 시 목록을 비우고, 관찰자도 `Stage.InArena` 밖에서는 끔 |
| 중복 억제 | 같은 틱의 일반·치명타는 치명타 하나. `KiSlashHit` 위치가 현재 드루이드 반경 안이면 기존 기검참 광을 쓰고 추가 보스 접점광만 생략 | 기존 KiImpactView의 4셀×3틱 광은 그대로. 자세 정지·보조 흔들림까지 끄는 분류는 아님 |
| 자세 정지 | 일반 2틱, 치명타 4틱. 2D는 시트/시간셀·호흡만 유지하고 최종 공격/걷기 row와 base8/beast의 방향 셀은 현재 방향으로 재조회. 선택형 모델은 Playable 표시 자세만 유지. 기저 시계와 현재 Core 위치·방향·크기·탄막·예고는 계속 진행하고 해제 즉시 현재 자세로 복귀. 죽음·지하·새 id·새 런은 즉시 해제 | 2D 원본 셀은 150ms 간격이므로 짧은 정지의 실제 체감은 GPU 영상에서 판정. 모델도 새 id에서 기저 시계 초기화. 현재 3D 모델/실제 아레나 미연결을 해결한 증거가 아님 |
| 국소 접점광 | 기존 `druid_hit` 원화. 일반 폭48px/6틱, 치명타 폭72px/8틱, 높이=폭×543/362. 알파 `.45×(1−age/life)`, 원화 24프레임을 수명에 분배, 동시4개 상한·이전 것부터 제거. 긴 입자·큰 화면 섬광 추가 없음 | 밀집 독·가시탄을 가리지 않는지 실제 1x 확인 전 미검증 |
| 슬램 접촉 | 매틱 기본 `bossSlam→recover` 또는 리모델 `bossSlam→bossRec` 전환에서 한 번만 폭72px/8틱 접점광·배우 자세4틱. 접점은 공개 예고 계약 `Facing+WeaponAng`, `R+DruidBoss.StaffReachExtra(70)`를 그대로 계산. 예비 동작 종료에서는 터뜨리지 않음 | 일반 피격과 같은 틱이면 자세 정지는 큰 값4틱. 실제 지팡이 그림과 접점 정렬은 GPU 검수 필요 |
| 카메라 | 일반2px/치명타·슬램 보조4px, 틱마다 `.86` 감쇠·8틱 종료. `max(기존 ShakeAmount,보조)×OptionShakeScale`로 사용자 옵션 한 번 적용. 기존 슬램14px·플레이어 피격4~16px를 중복 합산하지 않음 | `shake=0`에서 추가 흔들림0. Core ShakeAmount에 되쓰지 않음 |
| 진단 읽기값 | `LastContact`/`LastContactTick`은 실제 Hit/Slam을 Finish에서 처음 확정할 때만 갱신. 무접점·중복 틱은 덮지 않고 Reset은 default/−1로 초기화 | 기존 제품 행동을 바꾸지 않는 읽기값. QA는 피해 감소와 같은 틱의 새 사건·강도 필드를 함께 확인 |
| 실제 입력 검수 경로 | `--unity-playtest-capture --unity-druid-impact-capture --unity-boss-direct 0 --unity-basic-weapon -output <I:>` + 실행기의 격리 저장 필수. 정지 AI·기본검 `StepInput` 120틱×일반/치명 확률0/100, 단계 사이 해제12틱. 실제 충돌·피드백에서 피해 감소와 같은 새 틱의 일반/치명 강도·접점광·held 동시 관측 필수. 240 GPU PNG·`접점검사.json` | 별도 검수 하니스이며 효과 사건 직접 주입0. 일반 실행·M1 영향0. OS 손조작·자연 종주가 아니며 GPU 실행은 아직 미검증 |
| 증거·한계 | 누락 구현·기본 recover 누락·슬램 중첩·새 배우/방향/사건 식별 API RED 확인 뒤 순수 표현 검사90/0 × 두 옵션. `I:/EXODUSER-Storage/demo-art/boss-druid/impact-tests-green/검사결과.json` | Unity/GPU/실제 동작·가독성은 부모 최종 빌드 검수 전. M1의 틱 밖 합성 HurtEnemy는 다음틱까지 큐에 남을 수 있으므로 실제 공격 입력 또는 같은틱 배출 검수와 구분 |

## 검증과 반영 단계

| 검사 | 현재 증거 |
|---|---|
| 순수 표현·입력 검사 | 누락 구현·방향 오류·패링 회복 되감김·피격 중 경과 누락·접점 보강 RED 확인 후 모션/방향/리그/접점 표현 90/0 × 3D 옵션·원본 탄막 옵션. `C:/nvm4w/nodejs/node.exe unity/Tools/druid-presentation/run.cjs`. 최신 `I:/EXODUSER-Storage/demo-art/boss-druid/impact-tests-green/검사결과.json`. 실제 셰이더 색 분기 검사 `shader-color-check.cjs` 12/0(기존 녹색 가시에서 RED 확인). 젖은 반사광은 HLSL 음수 밑수 `pow` NaN을 재현한 뒤 `exp(-dot(wetUV,wetUV))`로 수정, 실제 식 UV 격자 441/0. GPU 판정과 별도 |
| 독립 C# 컴파일 | 설치 Unity 6000.6.7f1 DLL·현재 Core 전체 소스로 Core/Runtime 오류 0, 기존 경고 존재. 영상 도구 변수 이름 충돌 1건 수정 후 재검사 통과. Unity 전체·셰이더·Player 검사와 별도 |
| 첫 Unity 빌드 | 소스 `42b4b7982e108243f454a5ef03b811ec0296e32e`, `04afadd2`, Unity 6000.6.7f1 Win64, 컴파일·빌드 오류 0, 3,054,287,003바이트. 로그의 errorLogs=2는 빌드 목록의 `UnifiedRayTracingException.cs`·`PointOnEdgeException.cs` 파일명 오탐이며 실제 예외 아님. 새 셰이더 재작업 2는 이 빌드에 없음 |
| 첫 GPU·M1·시각 | Player `fc6cc177`, RX 9070 XT D3D11, exit 0·무창·격리 세이브 변경 0. 360장/12초 실영상 확보. **M1 22/23**: 검수 옵션 `--unity-druid-3d`가 의도대로 저장을 막아 저장/계속 단계가 실패했다. 필수 프리팹 누락은 1회 경고 후 기존 2D 폴백. 전체 M1 PASS 아님. 최종 소스에서 검수 저장차단 옵션 없이 다시 검사한다. 탄막 시각은 위 결함으로 FAIL |
| 제품 반영 | 자기 후보 브랜치만. `unity/main`·바탕화면 미반영, 새 유료 호출 0 |

탄막을 실제 검수하기 전 PASS로 올리지 않는다. 전체 브리프에는 마른 본체의 재조형·얼굴/음각·리깅/8동작·지팡이 접촉·임팩트 실게임 판정·실제 3D 보스전·지정 통합/바탕화면 갱신이 남아 있다.
