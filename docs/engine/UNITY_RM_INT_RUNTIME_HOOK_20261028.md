# UNITY RM-INT — 리모델 3D 씬 런타임 연결 (1단계: RM-1 필드) — 2026-10-28

배정: 유니티 총괄(local_59ad835c). 판정: 맵 총괄(걷기·충돌 일치) · 디자인총괄(톤). 브랜치 `claude/unity-pc-rm-int-20261028`(`4ceb18b51`에서 분기). 이 문서는 구현 상태이고, 검증 결과는 §6에 채운다.

## 1. 결정 기록 (유니티 총괄 2026-10-28, 그대로)

리모델 씬은 **표현 전용 스위치**로 연결하고 **Core는 무변경**. RM-1 1-1을 먼저 연결하고, Core 틱 일치 + 맵 총괄 판정 뒤 A1 → RM-3/2/4를 같은 훅에 붙인다. 지형 높이는 표현 쪽 샘플로만 처리한다.

## 2. 스위치

| 항목 | 내용 |
|---|---|
| 켜는 법 | 실행 인자 `--remodel3d` (`NativeRemodel3D.Requested`). 나중에 설정값으로 옮겨도 된다 |
| 꺼짐 | `NativeRemodel3D.Active`가 false인 채로 남고 `Point()`는 예전 2D 매핑 `(x/100, -y/100, 0)`과 같은 값을 돌려준다. 새 파일의 코드는 실행되지 않는다(`Remodel3DSync`는 첫 줄에서 반환). 기존 m1-check·oracle은 꺼진 상태 기준이다 |
| 씬을 빌드에 넣기 | 기본 빌드는 그대로. `PortVerification.Build ... -remodel-scenes 1`일 때만 `RM1_Slice.unity`가 빌드 씬 목록에 같이 들어간다(씬 이름 로드는 빌드 목록이 필요) |

## 3. 연결 지점과 변경 파일

새 코드는 새 파일에 있고, 기존 파일은 한 줄씩이다.

| 파일 | 변경 |
|---|---|
| `Runtime/NativeRemodel3D.cs` (신규) | `Point2D`(옛 매핑) / `Point`(꺼짐=2D, 켜짐=지형 위 월드 좌표) / `GroundY`(지형 창 안으로 클램프한 `SampleHeight`) |
| `Runtime/NativeGame.Remodel3D.cs` (신규) | 씬 additive 로드, 카메라 리그 연결, 켜기/끄기, 빌보드, 조준 |
| `Runtime/NativeGame.Remodel3DCheck.cs` (신규) | `--unity-rmint-check` 하네스(§5) |
| `NativeGame.StageFlow.cs` | `StageFlowSyncViews` 첫 줄에 `Remodel3DSync();` |
| `NativeGame.cs` | `Point` → `NativeRemodel3D.Point`, `ToGUI`·레벨업 폭발은 `HudCamera`, 마우스 조준은 `AimWorld()`, `IsLootOnScreen`은 `Point2D`(Core 콜백이라 항상 2D), 실행 인자 한 줄 |
| `KiSlashView`·`NativeBossView`·`NativeDruidBody`·`NativeSkillView`·`KiImpactView` | 각자의 private `Point`가 `NativeRemodel3D.Point`를 부르도록 한 줄 |
| `Editor/PortVerification.cs` | 위 `-remodel-scenes 1` 한 줄 |

Core(`Runtime/Core`)는 바꾸지 않았다.

## 4. 좌표·카메라·높이

출처: RM-1 문서 `UNITY_RM1_SLICE_20261028.md` "Core → 월드 좌표 변환"(브랜치 `claude/unity-pc-rm1-20261027` 05770b035·3c102aae7).

| 항목 | 값 |
|---|---|
| 변환(한 곳) | `NativeRemodel3D.Point`: x_월드 = px/100, z_월드 = −py/100, y = 지형 높이. 1타일 = 40px = 0.4u. 씬 루트는 이동·회전·스케일 없음 |
| 높이 | `Terrain.SampleHeight(wx,0,wz) + terrain.transform.position.y`. 지형은 타일 x48~152·y126~200 창만 덮어서 질의를 그 창 안으로 클램프한다(창 밖은 가장자리 높이). Core의 z는 0 그대로 |
| 카메라 | 씬의 `Main Camera` + `CinemachineBrain` + `CM LOOK-001`(CinemachineFollow, 월드 공간 추적, 댐핑 0, 오프셋 (0, 10.52, −9.24), 피치 0.85rad = 48.70°, 거리 14u). 추적 대상 `Player Marker`를 매 프레임 플레이어의 지형 위 점으로 옮긴다. 과거 세로 FOV는 매 프레임 실제 `Screen.height`로 `2·atan(Screen.height/(2·1400))`를 계산한다. 1600×900은 **35.65°**, 1920×1080은 **42.17°**이며 논리 2D 카메라 값은 그대로다 |
| 리그 이름 | 구운 씬(루트에 `Main Camera`·`Player Marker`·`CM LOOK-001` 따로) 과 다시 구운 씬(`RM1_CameraRig` 아래)을 모두 이름으로 찾는다. 씬 안 `AudioListener`와 `Marker Sprite`(대역 스프라이트)는 끈다 |
| 2D 카메라 `view` | 지우지 않는다. 카메라 클램프·보스 줌·`FieldEnemyCanShoot`(Core 콜백) 같은 **논리 카메라**로 그대로 갱신되고, 3D가 켜진 동안 컬링 마스크 0으로 화면만 지우는 역할을 한다. 로비가 월드를 숨기는 마스크는 3D 카메라가 따라 한다 |
| HUD 앵커 | `ToGUI`와 레벨업 폭발은 3D가 켜져 있으면 씬 카메라로 변환 |
| 마우스 조준 | 3D가 켜져 있으면 카메라 광선을 플레이어 높이의 수평면에 맞춰 Core 입력 좌표로 변환 |
| 아레나 | `Stage.InArena`이면 3D 층이 물러나고(씬 루트 비활성, `view` 복구) 기존 2D 아레나 뷰가 그대로 나온다. 1단계 PASS 뒤 A1(`RM1_Arena`)을 같은 훅에 붙인다 |

## 5. 표시

| 항목 | 내용 |
|---|---|
| 2D 지면·소품 | 3D가 켜진 동안 지면 청크·소품 렌더러는 매 프레임 끈다(`LateUpdate`, 청크 스트리밍이 새로 만들어도 깜박이지 않게) |
| 캐릭터·적·드랍·이펙트 | 지금 스프라이트를 그대로 **빌보드**로 쓴다(1단계 범위, 3D 영웅은 캐릭터 총괄 트랙). 기울임 `Euler(48.70, 0, 0)`(슬라이스 `Marker Sprite`와 같음) × 2D 코드가 준 회전(구르기·투사체 각도). 스프라이트 아래 가장자리를 Core 점에 놓는다(피벗 → 아래 가장자리를 스프라이트 위 방향으로 이동) |
| 재질 | 기본 스프라이트 재질 그대로(조명 받는 `SpriteLit3D`는 톤 판정 뒤 디자인총괄·맵 총괄과 정함) |
| 그림자·가림 | 1단계 범위 밖 |

## 6. 검증 (1단계) — 결과

실행: 공용 실행기 `exo-unity.ps1`(예약 큐·잠금·`--unity-qa-sandbox`·USER_SAVE 비교), 플레이어 `-batchmode`(창 0, GPU AMD Radeon RX 9070 XT, 무음), 브랜치 `claude/unity-pc-rm-int-20261028`(최신 unity/main 병합, 하네스 보정 180615ae1 이후).

| 항목 | 결과 |
|---|---|
| 코드 컴파일(Unity 없이 Roslyn, `E:/exoduser-wt/_out/rmint/roslyn.sh`) | 0 오류 (베이스도 0 오류로 방식 검증) |
| 빌드(에디터 batch, `-remodel-scenes 1`) | Succeeded, errors 0, 씬 포함 번들 약 2.68GB |
| **Core 틱 기록 일치(켜짐/꺼짐)** | **PASS** — `--unity-rmint-check` 1,800틱, 두 모드 모두 `ResetRun()`으로 같은 Core에서 시작. `logHash` 11640a5da4a88c94 = 11640a5da4a88c94, 10틱마다의 기록 180개(플레이어 좌표·HP, 처치, 살아 있는 적 수·좌표·HP 해시) 전부 동일 |
| m1-check | 꺼짐 20/20 · 켜짐 20/20(1차 실행, 창 없음). 그 실행은 QA 격리 인자 도입 전이라 사용자 세이브를 건드렸고(총괄 확인), 이후 격리 실행기로 바꿨다. 격리 뒤에는 m1-check를 다시 돌리지 않았다 |
| 3D 캡처(1600×900, 2D와 같은 지점 start·mid·north·east) | 캐릭터가 2D와 같은 화면 위치·크기로 나온다. 지면은 RM-1 지형·조명(어두움 — 톤은 ① 렌더 병합 뒤 디자인총괄 판정). 나란히 `E:/exoduser-wt/_out/rmint-batch/side/*_2d_3d.png`, 플레이어 1x 크롭 `*_player_1x.png` |
| 높이 샘플 | 시작 지점 지형 높이 −0.004, 스프라이트는 피벗→아래 가장자리만큼 올라가(월드 y 0.312, z −59.639) 발이 지면에 닿는다. 지형 창 가장자리 클램프는 이 지점들에서 확인되지 않음 — 창 밖 걷기는 맵 총괄 판정 영역 |
| 진단 | 3D 카메라 위치 = 마커 + (0, 10.52, −9.24), 피치 48.70°, 세로 FOV 42.18°, 파이프라인 URP_PC_High |

1차 실행에서 캐릭터가 안 보였던 원인은 제품 코드가 아니라 하네스 타이밍이었다: 캡처가 `LateUpdate`(빌보드 패스) 전 상태를 찍어 스프라이트 하단 절반이 지형 아래에 묻혔다(지형을 끈 샷에서는 정상 크기). 캡처를 `WaitForEndOfFrame` 뒤로 옮겨 해소.
1차 틱 불일치의 원인도 제품 코드가 아니라 하네스가 리플레이 전의 프레임 의존 구간(첫 연습·씬 로드)을 같이 비교한 것이었다.

판정 대기: 맵 총괄(걷기·충돌 일치 — 이번 캡처는 같은 지점 비교, 이동 경로 비교는 후속), 디자인총괄(톤).

## 7. 남은 것 (이후 단계)

- A1 `RM1_Arena` · RM-3/2/4를 같은 훅에 연결(1단계 PASS 뒤).
- 지형 높이 샘플 검증 후 맵의 0.04u 제한 해제는 맵 총괄 결정.
- 조명 받는 스프라이트 재질, 그림자, 가림, 적 표시 높이 세부 조정, 성능(`FindObjectsByType<SpriteRenderer>`는 매 프레임이라 1단계 한정, 이후 목록 캐시).
- 3D 영웅 교체는 캐릭터 총괄 트랙.


## 8. 사용자 기준 Steam 키샷 조명 후보 — 2026-10-30

전 기준: I:/EXODUSER-Storage/steam-keyshot/user_baseline_20261030.webp(1913×1055), USER_BASELINE_CRITIQUE.md. 새 캡처는 사건/좌표가 다르므로 동일 플레이 사건 A/B라고 주장하지 않는다. 현재 소스는 최종 빌드·M1·직접 시각 검수 전 후보다. 결과는 REPORT.md와 영수증으로 확정한다.

| 항목 | 현재 구현·수치 |
|---|---|
| 1 바닥 | 원본 Terrain 높이1025의2칸 간격513×513 표면 메시,524288삼각형. 충돌/높이 질의/Core는 원본 Terrain 유지. Terrain.drawHeightmap/foliage=false. 피부 컬러맵/노멀(.45)+CC0 돌·재6u 혼합. 돌8~34%,재6~18%,나머지피부. 넓은 삼각함수 가중치,랜덤/디더 없음 |
| PBR | HellGroundPBR·URP UniversalFragmentPBR. 돌 디퓨즈(.55,.56,.58),돌노멀.3,smoothness=.50-.25×rough,피부.24,금속0/AO1. CC0텍스처 Trilinear/mipBias2/aniso8. ShadowCaster/DepthOnly/DepthNormals |
| 2 빛줄기 | Shafts·Foreground Cards·Background Cards 런타임 인스턴스 폐기. 원본 씬/아트 보존 |
| 3 영웅 | 필드FOV24.5°/피치48.7°/거리14u. 영웅점광(.68,.8,1)/강도2.2/반경3.5u/로컬(-.3,1.8,.6). SpriteLit3D ambient.3/normalTilt.4. 기존 UI 수치/배치 유지 |
| 4 광원 | 지옥불 점광5개(1,.60,.28)/강도5/반경4.7u/soft그림자.8/bias.025/normalBias.1. 방향광(.85,.89,1)/강도1/그림자.85/회전(62,35,0). PC추가광그림자 atlas4096 |
| 광원 위치 | 타일(95,183),(109,174),(100,156),(112,142),(80.5,152.5). 월드 x=.4×tx,z=-.4×ty. 기존 torch_base/torch_flame 재사용. 받침높이1.6u,불꽃오프셋 up.93+right.34,스케일.14,RGB(1.5,1.2,1),4×2시트8프레임12fps |
| 기본조명 | Trilight sky(.18,.20,.24)/equator(.09,.115,.15)/ground(.04,.045,.055). 지수안개밀도.023/RGB(.035,.065,.085) |
| Volume | ACES/postExposure+.25EV/contrast16/saturation-8. Split shadow(.43,.48,.54)/highlight(.55,.51,.46)/balance-12. Bloom.16/threshold1.1/scatter.48. Vignette.13/smoothness.65. FilmGrain 비활성 |
| 높이산란 | HellFogFeature/HellHeightFog:16고정샘플/density.065/height falloff1.8/기준.4u. 차가운산란(.06,.12,.16)+5개불빛산란(.6,.35,.15). 산란 shadow ray는 없으므로 그림자까지 계산한 볼류메트릭이라고 주장하지 않는다 |
| SSAO | HellSsaoFeature·URP기반/전체해상도/Intensity.6/Radius.18/DirectLightingStrength.12/DepthNormals/High샘플·High bilateral. 필드 표현카메라만 적용. 로비/기본2D/보스 새필드패스 미적용 |
| 5 검은실루엣 | 카드제거+기존 블록아웃 메시 shadowCasting Off. 거대한 합성 bounds는 중심만 화면안이어도 화면밖 나무그림자가 남아 제외함. 새 표면메시/영웅/적/화로 그림자 유지 |
| 보스구도 | 기존2D아레나/논리카메라/Core 유지. 별도표현카메라 max(논리직교크기×.53,합친bounds높이×.63+.3u),중심y-.15. 드루이드 표현크기.72,반경/공격판정/AI불변. HUD/조준은 실제 표현카메라 사용 |
| 보스바닥 | ArenaSoilLit:흙20%+CC0돌80%/월드6u/3texel기울기×.15/ambient(.62,.67,.73). 국소광3개9/7/3·반경7·warm(1,.6,.3)/cool(.55,.68,.85). 마지막광원 영웅추적. 보스/영웅 접촉음영2.2×.45u/.48×.12u·알파.32. 실제3D보스 리모델 완료 아님 |

### 검수·소유 경계

- --unity-steam-keyshot --unity-boss-direct 0 --remodel3d -output <폴더>: 실제 NativeGame·격리세이브·직접입장·생존보조·스크립트입력. 적/탄 직접주입0. 탐험/실제AI탄막/드루이드1920×1080. 알파>64 불투명 몸체높이8~10%가 수치조건이며 시각합격과 별개다.
- 전투1100tick상한/90tick마다 사각이동/40tick이전만공격. 180tick이후 화면내실탄3개/가장가까운적100px초과때촬영. 보스촬영 플레이어는 보스(+260,-150)px,자연UI대기2.8초. AI/공격수치 불변.
- QA전용 --unity-keyshot-diagnostic는 메시/스프라이트/지형/안개/AO/풀/인스턴싱/그림자를 순차분리한다. 필터 기본0. --unity-keyshot-location X:Y는 탐험위치 선택. --unity-keyshot-baseline만 과거 해상도별FOV를 사용한다.
- 최초PBR점무늬는 재질혼합OFF때소실(AO/그림자OFF로는유지). 필터·노멀·반사·가중치 재작업. 하단가로줄은 Terrain만남겨도유지·TerrainOFF때소실. 일반메시6c8ee055/Player2b619f69에서 같은구도 가로줄소실. Unity/드라이버 내부원인 미확정. 진단01bc0c75는 폐기루트 null참조로시간초과,해당루프 null검사수정. 해당진단을PASS로기록하지않음.
- 원본·후보·비교·기록: I:/EXODUSER-Storage/steam-keyshot/. CC0출처·SHA는 PBR-원본출처.json. https://polyhaven.com/a/rock_ground / https://polyhaven.com/a/burned_ground_01 / https://polyhaven.com/license . 신규지출0. 미사용 탄화토normal/rough2종은 unused-source로hash대조이관.
- 기존 codex-unity-visual의 공유WIP보호:09fe65b8840에서 G:/exoduser-wt/codex-unity-keyshot-final·codex/pc-unity-keyshot-final-20261030으로분리. 자기입력11경로 byte보존이송. 인수미확인 HellEnvironment모듈/호출은 독립후보에서제외. 기존guard WIP원위치보존.

최종후보36c97a89/촬영은 큰 합성메시 bounds중심 방식으로 실루엣이 남고,160tick공격으로 원거리 적이 죽어 전투탄1개만남아 재작업. 기존블록아웃 메시그림자 전체를끄고 새바닥/영웅/적/화로 그림자 유지. 촬영도40tick공격만 사용,전투탄3개/보스탄6개 미만은 receipt FAIL로강화. Legacy Core36검사 중35PASS/맵2523표본2불일치가 관찰됨. Core·SourceMap·ch1_map·구형oracle·원본입력은 공통c122746b9와byte동일,이번조명변경과분리하며 해당검사를PASS라하지않는다.
