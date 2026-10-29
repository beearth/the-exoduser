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
| 카메라 | 씬의 `Main Camera` + `CinemachineBrain` + `CM LOOK-001`(CinemachineFollow, 월드 공간 추적, 댐핑 0, 오프셋 (0, 10.52, −9.24), 피치 0.85rad = 48.70°, 거리 14u). 추적 대상 `Player Marker`를 매 프레임 플레이어의 지형 위 점으로 옮긴다. 세로 FOV는 매 프레임 실제 `Screen.height`로 `2·atan(Screen.height/(2·1400))`를 계산한다. 1600×900은 **35.65°**, 1920×1080은 **42.17°**이며 논리 2D 카메라 값은 그대로다 |
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


## 2026-10-30 Steam 키샷 조명 작업 — 검수 중

브리프 `I:/EXODUSER-Storage/codex-takeover/steam-keyshot-brief.md`, 전용 브랜치 `codex/pc-unity-steam-keyshot-20261030`. 현재 카메라·조명 변경은 제작/검수 중이며 Steam 합격·통합 완료가 아니다. Core·기존 UI 규칙은 변경하지 않는다.

| 항목 | 구현값·범위 |
|---|---|
| 3D 카메라 | 피치48.70도·거리14u 유지, 세로FOV24.5도 고정. 논리2D 카메라·판정은 유지 |
| 비교 기준 | 검수 인자 `--unity-keyshot-baseline`이면 기존 해상도별FOV와 기존 조명 유지. 일반 실행은 `--remodel3d`에서만 새 필드 조명 |
| 키라이트·지옥불 | 차가운 키라이트0.7, 기존지옥불5광원 색(1,.32,.075)·강도11·반경4.7u·소프트그림자. 붉은Shafts 비활성 |
| 영웅 림광 | 색(.53,.72,1)·강도3.2·반경3.5u, 마커를 따라감. 실제영웅·일반적은 기존SpriteLit3D·그림자 |
| 톤 | ACES·노출-.15EV·대비16·채도-8·차가운그림자/따뜻한하이라이트·Bloom.16/threshold1.1·비네트.13·그레인없음 |
| 재질 | 기존원화/노멀 유지, TerrainLayer 런타임사본의 노멀.8·smoothness.32/.22. 원본 TerrainLayer 파일은 수정하지 않음 |
| 광원 기구 | 기존 `assets/map/ch1/diablo_field_torch_base_v1.png`·`diablo_field_torch_flame_v1.png`를 동일byte Resources/Art/map/hell_lighting에 인수. 불꽃4열2행8프레임·12fps, 신규 이미지 생성/지출0 |
| 검수 | `--unity-steam-keyshot --unity-boss-direct 0 --remodel3d -output <폴더>`, 1920×1080 실제 Player·직접입장·생존보조·스크립트입력. 적/탄 직접주입0. 불투명 몸체 높이는 스프라이트 알파경계로 측정하며 투명 셀 전체 bounds와 구분 |

실제 캡처·비교·최종 판정은 `I:/EXODUSER-Storage/steam-keyshot/REPORT.md`에 모은다. 기존 보스 아레나 2D 전환·아트 품질 한계는 현재 유지되며 새 조명으로 전체 보스 리마스터 완료를 주장하지 않는다.

보스전 조명 추가 검수: 기존 2D 아레나·논리 카메라·Core 판정은 유지하고 별도 표현 카메라만 직교크기×.53/북쪽1u로 조정한다. HUD/조준은 실제 표현 카메라를 사용한다. 기존 흙 원화에 3texel 간격 높이기울기 노멀·반사광(지수40/강도.22)을 적용하는 ArenaSoilLit, 국소광3개(강도9/7/3·반경7u)를 연결했다. 기존 보스 스프라이트를 교체한 3D 리모델은 아니며 미검수 상태다.

현재 실행 차단: 기존 Player 3개(일반1·미리보기2)가 이 작업 소유가 아니어서 안전 실행기가 후보 빌드를 시작하지 않았다. C# 독립 컴파일 오류0, 새 GPU/셰이더/1080p 후보·M1은 미검증. 종료 허용/직접 종료를 요청한 상태이며 소스 복구 checkpoint만 보존한다. SSAO·높이/볼류메트릭안개·최종시각판정·공통줄기/바로가기는 미완료다.

## 사용자 바탕화면 기준 1~5 재작업 — 2026-10-30

전 기준은 사용자 제공 I:/EXODUSER-Storage/steam-keyshot/user_baseline_20261030.webp(1913×1055)와 USER_BASELINE_CRITIQUE.md다. 사용자 프레임과 새 촬영은 플레이 상태가 다르므로 같은 사건 A/B라고 주장하지 않는다.

| 번호 | 구현·검수 대상 | 현재 상태 |
|---|---|---|
| 1 | 원본 피부에 돌18~60%·탄화토12~35%를 넓은 사인장으로 혼합. TerrainData 런타임사본, 높이/충돌 불변. 텍스처6개·2048², 타일3u/4u, 노멀.75/.45. smoothness 돌=.72-.60×rough·탄화토=.28-.23×rough. diffuse remap(.48,.49,.50), 금속0·AO1 | 소스 구현·GPU 미검증 |
| 2 | Shaft 루트 비활성. 대각선 막 대신 지옥불5개·국소광원/기구 | 소스 구현·GPU 미검증 |
| 3 | 3/4 피치 유지·FOV24.5도·림광. 불투명 몸체 알파경계로 화면높이8~10% 확인 | 소스 구현·실측 대기 |
| 4 | 점광원5개 소프트그림자·차가운그늘/뜨거운불빛·높이산란16샘플. 밀도.065·높이감쇠1.8·기준.4u. 전체해상도SSAO 강도.6·반경.18·직광영향.12·High샘플/블러 | 설정/소스 구현·Unity/GPU 미검증 |
| 5 | 카메라 Foreground Cards 비활성. 메시 없는 나무 그림자형 카드 제거 | 소스 구현·GPU 미검증 |

무료재질 출처: [Rock Ground](https://polyhaven.com/a/rock_ground)·[Burned Ground 01](https://polyhaven.com/a/burned_ground_01), 제작자 Rob Tuytel, [CC0](https://polyhaven.com/license). 원본6개는 I: pbr-source와 PBR-원본출처.json의 URL/MD5/SHA256 대조 후 실제 Resources만 SSD에 인수. 제품은 API에 연결하지 않음. 비용/크레딧0·신규 이미지생성0.

Exoduser.KeyshotRenderSetup.Run은 기존 PC 렌더러에 HellSsaoFeature/HellFogFeature와 높이안개 재질을 추가한다. 실제3D카메라+새조명 활성 조건에서만 실행하고 baseline/2D/로비에는 새패스를 넣지 않는다. 안개는 깊이복원광선의 고정16위치에서 높이밀도·국소불빛을 적분하며 랜덤 디더링/필름그레인/점노이즈 없음. 그림자광선적분은 없어 그림자있는 볼류메트릭으로 확대하지 않는다.

렌더러 설정 실실행 40d8203b: Unity6000.6.7f1 오류로그0·정상종료0·세이브격리, SSAO/안개 자산 생성 및 셰이더 오류검사 통과. 이것은 Player 화면/성능/Steam시각합격과 별도다.
