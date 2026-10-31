# M1-REGION R-B — 심연의 앵글러 4마리 + 후속 2건 (PC, 2026-10-28)

명세: `E:/exoduser-wt/_out/m1-region/SPEC.md` §R-B (맵 총괄), 유니티 총괄 배정(10-28). R-A(지역 4분할, `UNITY_M1_REGION_RA_20261028.md`) 위에서 이어 간다. 웹 원본 = `origin/main` game.html 커밋본(65,958줄).
패링 반사(청콩)는 unity-rmb1이 따로 Core로 옮기는 중이라 건드리지 않았다. 앵글러는 `ProjSpec`을 기존 적 투사체 입구(`SpawnFieldProjectile`)에 넘기기만 한다.

## 1. 웹 기준 → Unity

| 항목 | 웹 (줄) | Unity |
|---|---|---|
| 개수·위치 | `_FB_COUNT=4`, `_FB_SITES=[[58,158],[148,150],[52,42],[148,42]]` (SW 물 / SE 화 / NW 암 / NE 뇌), 타일 중심 `(tx+.5)*T` | `Simulation.FieldBoss.cs` `FieldBossSites`, `MakeFieldBoss` |
| 속성 | `_FB_ELS=[2,1,3,4]` = EL.I 물 / F 화 / D 암 / L 뇌 | `FieldBossElements` |
| 수치 | `hp=~~((1800+lv*350)*7.5)` (`lv||1`), `atk=~~((20+P.lv*3)*1.2)`, `r=120`, 생성 시점의 플레이어 레벨 | `FieldBossHp`, `MakeFieldBoss` (Lv1 hp 16125 atk 27, Lv10 hp 39750 atk 60) |
| 생성 | `_fbTick`: stage 0, 보스 아레나 밖, 첫 tick에 4마리를 한꺼번에(`_fbSpawned`). 아레나 안에서는 `_fbClear` | `TickFieldBosses` (`EnableFieldBosses()` 뒤, `Stage.Enabled`, `InArena`이면 목록 비움) |
| 기상 | 플레이어가 `_FB_WAKE=1000` 안이면 `asleep=0`, 54프레임 등장(`tpT=54, hid=1, spawnIn=1`), 첫 기상에 `showPH('심연의 앵글러', 속성색)` | `TickFieldBoss` 상단, `StageEventKind.AnglerWoke` |
| 몸 | `!hid`일 때 통과 불가(플레이어를 r+P.r 밖으로 밀어냄), 거리 < r+P.r+8 이고 `P.iframes<=0`, `P.s!=='charge'`이면 `hurtP(atk)` | 같음. 밀어낸 뒤의 **실시간** 플레이어 좌표를 쓴다(웹 `P.x`) |
| 에너지탄 | `canShoot && shotCd<=0 && !hid && !tpT && !enChg` → `shotCd=enChg=180`, 180프레임 모은 뒤 `_fbFireEnergy`: 더듬이 끝(`_fbEsca`)에서 속도 10, `dmg=~~(atk*2.8)`, 물, life 320, sz 48, r 20, elemBall | `FieldBossFireEnergy` → `ProjSpec` → `SpawnFieldProjectile` |
| 혈안 3연사 | 에너지 발사 직후 `burst=3, burstGap=18`, 이후 24프레임 간격, `_emitEnemyShot` → 60프레임 경고 링 뒤 발사(`dmg=~~(atk*1.6)`, 화, 속도 9, life 260, homing·redBean) | `FieldBossEmitBurst` + `FieldBossWarnings`(60프레임). **웹에서도 실제로는 발사되지 않는다 — §3 참조** |
| 순간이동 | 에너지 발사 때 `tpCd=600`(이미 0보다 크면 유지). 0이 되고 거리 < 2200이면 플레이어 위치로 예고(`tpT=54, hid=1`), 아니면 `tpCd=600`. 착지 때 거리 < r+110이면 `hurtP(atk)` + 넉백 18 + "💥심해강타!" | `TickFieldBoss` |
| 시전 가능 | `_fieldEnemyCanShoot`: 화면 중심에서 `VW/2-64`, `VH/2-64` 안일 때만. 벗어나면 `enChg=burst=burstGap=0` | `FieldEnemyCanShoot(x,y)` 호스트 콜백. 기본값 = 플레이어 중심 1920x1080. `NativeGame`이 실제 HudCamera(2D/리모델3D)에 Core±64px 네 모서리를 투영해 모두 viewport 안인지 확인한다(2026-10-31 초광폭 후속). 기본 Core 폴백과 사거리 수치는 보존 |
| 피격 | `_fmCanHit`(완전히 숨었을 때만 무적, 등장·예고 중에는 맞음), `_fmXY`(예고 중에는 도착지), `_fmApply`(`hitCd` 8프레임, dmg ≥ 1, 방어·속성·치명 없음), `_hurtFieldMobs` | `HurtFieldMobs`, `FieldBossApply` |
| 피격 호출 5곳 | 20025 기검참 초승달, 34154 돌진 관통, 35466 플레이어 투사체, 37832 `hitArc`, 46824 `_gSlamHit` | 기검참(`KiSlash.cs`), 볼트(`Simulation.Crossbow.cs`), 악의구(`Skills/Simulation.Fireball.cs`), 무기 휘두르기(`Simulation.HitArc`), 대지 강타(`GiantSlamHit`)와 E 칼등 처내기(`BashStrike`). **돌진 관통(34154)은 Unity에 해당 코드가 없어 미이식** |
| 처치 | `_fbMarkDead`: 슬롯을 null로, 살아 있는 앵글러가 0이면 `G._fbDone=true`. `showPH('필드보스 처치!')`(플래그가 서 있지 않을 때) | `FieldBossMarkDead` → `Stage.FieldBossDone`, `StageEventKind.AnglerSlain` |
| 지역 연결 | `_regionFbAlive(r)`: `fbIdx<0 \|\| stage!=0 \|\| _fbDone`이면 죽음, `!_fbSpawned`이면 생존, 아니면 해당 슬롯의 hp>0 | `FieldBossAliveForRegion` (`RegionFbAlive`가 위임). 슬롯 `_REG_FB_TO_REG=[2,3,0,1]`는 R-A에서 이미 연결 |
| 지옥문 | 출구 + 스테이지 0 + `!_fbDone` → "심연의 앵글러를 모두 처치하라"(42101). 개방은 `krakenOk` = `_fbDone`가 필요 | 기존 `StageFlow`(`GateAnglerBlocked`, `krakenOk`) 그대로. **`NativeGame.StageFlow.cs`의 `FieldBossDone = true` 강제를 지웠다** |

호출 순서: 웹 update에서 `_fbTick()`(32326) → `_regionTick()`(32327), `_tickEnemyShotWarnings`(34833)는 같은 프레임 뒤쪽. Unity도 `TickFieldBosses`(앵글러 → 경고 해제) → `TickRegions` → `Stage.Tick`.

## 2. 표시 (최소)

`NativeGame.FieldBoss.cs`: 웹 시트 `img/fieldboss_angler.png`(1774x887, 4열 2행 8프레임)를 `Resources/Art/enemy/fieldboss_angler.png`로 복사, `_fbFaceFrame` 프레임을 300 px 폭으로 본체 중심에 그림(흔들림·떠오름 포함). HP바는 웹 레이아웃(220x10, 본체 위 172 px, 속성색), 이름표, 피해 숫자. 기상·처치 배너 두 개(웹 `showPH` 500ms).
미표시(자리표시 목록, UI·VFX 담당): 순간이동 소멸/등장 프레임(`_fbDrawVanishFrame`), 충전 더듬이 빛(`fieldboss_angler_charge.png`), 연기·번개·폭발, 착지 충격파, 사망 파편. 3D 외형은 보스전 총괄 범위.

## 3. 웹 원본의 특성 — 혈안 3연사는 나오지 않는다 (웹과 같게 이식, 명세와 다름)

명세(§R-B)는 "에너지 모으기 180 → 에너지탄 1발 → 혈안 3연사 → tpCd 600"으로 적었지만, 웹 코드를 그대로 실행해 보면 **3연사가 발사되지 않는다.**
원인(웹 61353~61366): 에너지탄을 쏘는 프레임 A에 `shotCd`는 1이다. A+1 프레임에 `shotCd`가 0이 되고 `!(fb.enChg>0)`이므로 곧바로 **다음 에너지 충전이 시작되어 `enChg=180`**이 된다. 3연사 블록은 `!(fb.enChg>0)`일 때만 도는데 충전이 계속 이어져, `burstGap`(18)이 0에 닿지 못한다. 결과는 에너지탄이 180프레임마다 반복되는 것뿐이다.
증거: 웹 oracle(24개 시나리오, 총 에너지탄 73발)에서 혈안탄(`titanEye`)은 0발. Unity 실측(실제 1-1 맵): 기상 후 +299, +479, +659, +839 프레임에 에너지탄, 혈안탄 0발.
조치: 웹이 정답이라 그대로 이식했다(수정하지 않음). 3연사를 의도대로 내려면 웹 코드를 고치는 별도 결정이 필요하다 — 맵 총괄 판정 요청.

## 4. 후속 2건 (유니티 총괄이 맵 총괄 지적으로 배정)

| 건 | 웹 | Unity 상태 → 조치 |
|---|---|---|
| 1. 벽 끼임 정리 사망 | 34625(`EnemyTick`): 벽 안에 끼어 5타일 안에 빠져나갈 곳이 없으면 죽이고 `G.kills++`, `_stageKills++`, `_regKill` | **Unity에서는 이 분기 자체가 죽어 있다**: 틱 컨텍스트가 `WallStuck`을 항상 false, `Map`을 1x1, `PushOutWall`을 빈 함수로 스텁한다. 처치 콜백 `RegKill`만 `KillEnemy`(kills·지역·드롭·경험치)에 연결했다 — 리플렉션으로 콜백을 직접 불러 kills 0→1, 지역 0→1 확인. **분기 활성화(WallStuck/Map/PushOutWall 연결)는 하지 않았다**: 웹은 벽 모서리에 닿은 적을 최대 5타일 밖으로 옮기므로 벽 근처 모든 적의 이동이 달라지고 enemy-tick 이식 전반에 영향을 준다. 적 AI 담당 판단 필요 |
| 2. 적 700마리 상한 정리 | 34540~34562: 목록이 800을 넘으면 700으로 줄임. 보스·부활 대기 우선 보존, 나머지는 플레이어와의 거리 pivot(4회 이분)으로 가까운 쪽만 남기고 **나머지는 처치로 센다**(G.kills, _stageKills, _regKill). 제자리 압축이라 앞쪽 일부 항목이 사라지고 센 적이 다시 채워지는 웹의 특성이 있음 | **Unity에는 이 상한이 없었다**(`SpawnHoles`의 `AliveEnemies() >= 700` 스폰 제한만 있음). `Simulation.EnemyCap.cs` `CapEnemies()`를 웹과 같은 제자리 방식으로 이식하고 `Tick`의 적 갱신 직후에 호출. 뷰는 `PruneEnemyViews()`가 목록에서 사라진 적의 렌더러를 정리 |

## 5. 검증

### 5.1 웹 oracle

| oracle | 내용 | 결과 |
|---|---|---|
| `Tools/fieldboss-oracle` (신규) | 원본 `_fbHp`·`_fbMk`·`_fbTick`·`_fbTickOne`·`_fbMarkDead`·`_fbFaceFrame`·`_fbEsca`·`_fbFireEnergy`·`_fmCanHit`·`_fmXY`·`_fmApply`·`_hurtFieldMobs`·`_fieldEnemyCanShoot`·`_emitEnemyShot`·`_tickEnemyShotWarnings`·`_regionFbAlive`를 Node VM에서 그대로 실행. 상수·공식, 얼굴 프레임 400, 시나리오 24개(무작위 21 x 1500프레임 — 플레이어가 앵글러 주변을 걷고 무작위 피격 — + 4마리를 차례로 깨워 죽이는 순회 3)에서 프레임별 위치·타이머·플래그·플레이어 밀림·접촉 피해·발사체·알림·피격 결과를 비교 | **302,271 checks / 0 failures** |
| `Tools/region-oracle` (R-A 확장) | 위 R-A 항목 + 700 상한 120케이스(가장 가까운 700 유지, 처치 수 일치) | **204,391 checks / 0 failures** |

민감도(되돌림): 기상 거리 1000→900이면 11,314건 실패, 피격 쿨다운 8→7이면 2,294건 실패.

### 5.2 실제 1-1 맵 테스트 (`Tools/region-test`)

**113 checks / 0 failures** (R-A 55 + R-B 58).

| 항목 | 결과 |
|---|---|
| 위치·수치 | Lv1: (58,158) 물 / (148,150) 화 / (52,42) 암 / (148,42) 뇌, hp 16125 atk 27. Lv10: hp 39750 atk 60. 모두 걸을 수 있는 땅 |
| 지역 연결 | 북서←site2, 북동←site3, 남서←site0, 남동←site1 |
| 기상 | 1001 px는 잠듦, 1000 px에서 깨어남(`tpT=54`, 숨음), 알림 1회, 54프레임 뒤 선 상태 |
| 공격 순서 | 기상 +54 등장, 에너지탄 +299(+479, +659, +839 반복), 혈안탄 0발(§3), 순간이동 예고 에너지탄 +599(tpCd 600이 같은 프레임에 한 번 줄어듦), 착지 예고 +54 |
| 지역 | 북동 48/60(≥80%)인데 북동 앵글러가 살아 있으면 미클리어 → 앵글러를 죽이면 다음 15프레임 판정에서 클리어, 알림 1회, 남은 3마리 동안 필드보스 플래그 내려감 |
| 한 판 | 네 지역 모두 80%인데 앵글러가 살아 있으면 클리어 0/4 → 앵글러를 NE, SW, NW, SE 순으로 처치(지역 클리어 120, 210, 300, 375 tick) → 4번째에서 플래그 올라감 → 4/4 + 플래그로 지옥문 개방 → 아레나(앵글러 목록 비움) → 보스 처치 → 출구 → StageCleared (tick 1066) |
| 출구 | 플래그가 내려 있으면 "심연의 앵글러를 모두 처치하라" 이벤트, 아레나 진입 안 함 |
| 후속 1 | `RegKill` 콜백 호출 시 kills 0→1, 북서 0→1 |

### 5.3 회귀 (베이스 `b280ddf61`·`32f374bda`와 같은 수)

dash-parry 187,165/0 · skill-oracle 8,416/0 · enemy-pool 26,271/0 · c01-field 448/0 · skill-sim-test 67/0 · start-mobs-test 24/0 · weapon-xbow-oracle 통과(베이스도 통과; 저장소의 csproj가 `Core/Skills/*.cs`를 포함하지 않아 로컬에서만 포함해 실행) · enemy-spawn-oracle 205,123 checks/531 failures(베이스 동일) · enemy-tick-oracle 3,253,978 checks/7,232 failures(베이스 동일) · stage-flow-oracle 7,076 checks/1 failure(베이스 동일).

### 5.4 Unity 6000.6.7f1 (빌드·m1-check)

(아래 §6)

## 6. 실행 결과 (Unity)

빌드: StandaloneWindows64, Unity 6000.6.7f1, **Succeeded, errors 0** (`E:/exoduser-wt/_out/fixedmobs/build-receipt7.json`).

| m1-check 실행 방식 | 결과 | 결과 파일 |
|---|---|---|
| `-batchmode -nographics` | **20/20 ok** | `E:/exoduser-wt/_out/fixedmobs/m1-rb-batch2/m1-check.json` (로그 `m1-rb-batch2.log`) |
| 창 모드 (`run-fixedmobs-m1.ps1`, 보조 모니터 5120,0 1920x1080) | **20/20 ok** (두 번 실행, 둘 다) | `E:/exoduser-wt/_out/fixedmobs/m1-rb-window/m1-check.json`, `m1-rb-window2/m1-check.json` |

- 새 항목 `03b`: 첫 틱에 앵글러 4마리가 (58,158)·(148,150)·(52,42)·(148,42), 속성 물·화·암·뇌, hp 16125 / atk 27(Lv1), 잠든 채로 서 있음.
- 새 항목 `07d`: 07c의 소환굴 걷기가 북동 앵글러(5940,1700)에서 320 px 떨어진 곳까지 가서, 앵글러가 실제 게임 안에서 깨어남(기상 알림, 1마리가 서 있음, 에너지탄 8발).
- **시나리오를 두 군데 고쳤다.** ① `07c` 뒤에 플레이어를 시작 위치로 되돌린다: 이제 북동 앵글러가 깨어나 때리므로, 소환굴 옆에 선 채로 이어 가던 `09`(레벨업)·`09b`(스킬)가 첫 `-batchmode` 실행에서 실패했다(09: 처치 0, 09b: 신성 돔·얼음 보주 미발동). 원인은 앵글러가 의도대로 동작한 결과라서 시나리오 쪽을 고쳤고, 고친 뒤 1회 재실행해 20/20. ② `10`단계 직전에 `FieldBossDone = true`를 둔다: 점검은 앵글러 4마리 전투를 걷지 않으므로, 플래그가 내려가 있으면 출구 타일이 "심연의 앵글러를 모두 처치하라"만 낸다. 앵글러 흐름은 fieldboss-oracle과 region-test가 덮는다.
- LT-10 후속(2026-10-28): 위 ②는 당시의 하네스 처리다. 현재 M1 `09c`는 앵글러 네 마리를 실제 `HurtFieldMobs`·사망 경로로 처리하고 `FieldBossDone` 및 4/4 지역 클리어·지옥문 자연 개방을 확인한다. 플래그 강제 설정과 `ForceUnlock()`은 제거했다. 결과 영수증은 `UNITY_LT10_LT11_20261028.md`에 기록한다.
- 창 모드 실행 뒤 플레이어 프로세스가 스스로 종료하지 않아 PowerShell 스크립트가 900초 TIMEOUT으로 끝난 적이 있다(결과 JSON은 이미 20/20으로 써진 뒤). 같은 시각 다른 세션(`a18`, `parry-reflect`)의 창 모드 플레이어도 남아 있었고 bash의 fork 실패가 겹쳐서 환경 쪽 문제로 판단한다. 내 프로세스(16000, 75328)만 종료했다.

## 7. 미이식·차이

| 항목 | 내용 |
|---|---|
| 혈안 3연사 | 웹도 발사하지 않는 동작을 그대로 이식(§3) |
| 돌진 관통 피격(34154) | Unity에 해당 코드가 없음 |
| 얼음 보주 등 나머지 플레이어 투사체 | Unity에서 피해가 투사체 루프 대신 구역·폭발 처리라 앵글러 피격 훅을 달지 않음. 훅 대상은 기검참·볼트·악의구·무기 휘두르기·대지 강타·칼등 처내기 |
| 악의구가 앵글러에 닿을 때 | 웹 투사체 루프처럼 `p.dmg`를 직접 주고 폭발(`OrbExplode`)시킨다. 폭발은 일반 적에게만 적용 |
| 발사체 속도 정규화·패링 | `_normalizeEnemyBulletSpeed`, `fbEnergy` 패링 제외 등은 투사체 입구(Druid 투사체 시스템)와 unity-rmb1의 반사 이식 몫 |
| 스프라이트 외 연출 | §2 |
| 번역 | 문구는 웹 원문(`심연의 앵글러` No.3001, `필드보스 처치!` No.3002, `심연의 앵글러를 모두 처치하라` No.3022 — 번역 목록에 등록돼 있음) |

## 8. 병합 뒤 상태 (미완 1건)

- 병합 이력: 최초 구현 커밋 `fe1e6c73c`, 이후 `origin/unity/main`(A18 패링 5단계, RM-B1 드루이드 Core)을 두 번 병합. 충돌 없음.
- 병합 **뒤** .NET 검증은 모두 통과: fieldboss-oracle · region-oracle · dash-parry-oracle exit 0, 실제 맵 테스트 113/0.
- Unity 빌드와 m1-check(§6)는 **병합 전 코드**로 batchmode 20/20, 창 모드 20/20. 병합 뒤 Unity 빌드는 아직 못 돌렸다: 에디터가 두 번 크래시했다(첫 번째는 메모리 할당기, 두 번째는 Bee 빌드 캐시 손상 뒤 실행 중 크래시, 로그 `E:/exoduser-wt/_out/fixedmobs/build8.log`, `build8c.log`). 같은 시각 창 모드 플레이어 좀비 프로세스 6개가 커밋 한도를 차지하고 있었다. 이후 "빌드는 PC 전체에서 한 번에 하나, 차례는 유니티 총괄이 알림" 규칙이 생겨 차례를 요청해야 한다. 차례를 받으면 `Library/Bee`를 새로 만들고(옛 것은 `_out/fixedmobs/Bee.stale-0231`로 옮겨 둠) 빌드 → m1-check batchmode·창 모드를 한 번씩 돌린다.

