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
| 카메라 | 현행 수치는 `Resources/Data/remodel_camera.json` 한 곳. 피치48.7014126°, 거리14u, 세로FOV46.9453° 고정, 영웅 표시배율2, 북쪽 전방 추적1.45u. `NativeRemodelCamera`를 실제 게임과 `Rm1SliceBuilder`가 공유. 화면 높이에 따른 FOV 변경을 제거해 영웅의 화면 비율을 유지한다. 논리 2D 카메라·Core 판정은 그대로다 |
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

첫 후보 실제1080p d44633a4는 크기검사통과(필드9.54%·보스8.11%)이나 전체시각FAIL. AO/안개→그림자→PBR→후처리 순의 동일장면분리7d75d133에서 PBR혼합을 끌 때 점무늬가 사라졌다. 후속은 샘플방법 변경: 타일6u·Trilinear/밉바이어스2/이방성8, 돌8~34%·탄화토6~18%·피부잔여, 노멀.3/.18, 돌smoothness=.50-.25×rough·탄화토=.20-.12×rough. 단순노출튜닝으로 점무늬를 가리지 않는다.
후속조명: EV.25·키라이트색(.85,.89,1)/강도1, 지옥불(1,.60,.28)/강도5, 기구높이1.6u/불꽃.14배·영웅rim강도2.2. 전경/Shaft제거 유지. 보스표현카메라는 실제영웅·본체Bounds의합집합에 맞추며 기본직교×.53을유지하되 본체가크면 높이를늘려 잘림을방지한다. 논리카메라·Core는불변. 바닥의기본광/세국소광은 원화노멀광계산을 사용하고 영웅은 최소주변광.85로 식별한다.


후보2 직접 검수 FAIL: 탐험 하단 가로줄/검은 카드, 보스 원화 과대/영웅 HUD 근접, 보스 바닥 과도한 검정이 남았다. 분리 진단 7d75d133/b2fb6794 후속: AO·안개·광원 그림자를 꺼도 가로줄/실루엣 유지. 후보3은 단순 강도 재조정 대신 Shafts/Foreground Cards/Background Cards의 런타임 인스턴스를 폐기한다(원본 씬 보존). 보스 바닥은 기존 흙 단독에서 CC0 rock_ground 디퓨즈 월드6u 혼합80%로 변경, 노멀 기울기 .15. 드루이드 표현 스프라이트 크기 .72, Core 반경/AI/공격 판정 불변. 아레나 카메라는 합친 bounds 높이×.63+.3와 논리크기×.53 중 큰 값, 중심 y-.15. 검수 플레이어는 보스(+260,-150)px로 배치하고 직접 주입 없는 실제 AI 탄을 촬영한다. 새 시각 판정·M1 전에는 통합하지 않는다.

후보3 54faacac 직접 검수: 전경·배경 카드/빛줄기 인스턴스가 렌더러 목록에서 제거됐지만 하단 가로줄·검은 실루엣은 유지됨. 카드만으로 원인이 설명된다는 가설 기각. QA 전용 누적 분리실험(모든 MeshRenderer→영웅 외 SpriteRenderer→Terrain 높이맵)을 추가해 실제 렌더링 범위를 확인한다. 프로덕션에서 이 필터는 기본0이고 --unity-keyshot-diagnostic만1이상으로 변경한다.

분리 촬영: 모든 메시를 끄면 검은 실루엣은 사라지지만 가로줄은 유지, 영웅 외 스프라이트 제거 후도 가로줄 유지, 지형 높이맵 제거 시 사라짐. 지형만 복원한 AO/안개·풀·인스턴싱·전체그림자 순차 분리를 추가한다. 촬영 하네스는 --unity-keyshot-location X:Ypx 위치 선택, 전투 공격이 쉬는 tick%120>=85, 보스 자연 UI 애니메이션 대기2.8초를 사용한다.

지형 분리 6ab53d73 후속: AO·안개·풀·인스턴싱·전체그림자 OFF에서도 가로줄 유지. 기존 Terrain 렌더링을 중단하고 동일 TerrainData 높이맵의 2칸 간격 513×513 일반 메시(524288 삼각형)로 표면만 교체한다. TerrainCollider/NativeRemodel3D.SampleHeight/Core/원본 TerrainData 보존. HellGroundPBR은 기존 피부 컬러맵·노멀 + 돌/재6u 블렌드, URP UniversalFragmentPBR·ShadowCaster·DepthOnly·DepthNormals 사용. 원인 범위는 Terrain 표면 경로까지 확인됐으며 Unity/드라이버의 정확한 내부 원인은 미확정이다. 키 방향광 높이62도/방위35도로 길게 늘어진 오프스크린 그림자를 줄인다. 새 메시 실제 시각·성능은 후속 검수한다.

지형 분리 Player01bc0c75는 이미지8장 이후 QA 전용 구형 루프가 폐기된 Shafts 루트를 참조해 NullReferenceException으로 멈추었고 180초 제한 종료됐다. USER_SAVE변경0·남은프로세스0. 루트 null 검사를 추가했다. 일반 촬영 경로와 구분하며 해당 진단 전체를 PASS로 기록하지 않는다.

표면 메시 6c8ee055/Player2b619f69 직접 관찰: 같은 탐험 위치에서 가로줄 소실, 기존 Terrain 경로에서만 발생한 문제를 우회한 것. 첫 메시 후보의 전투 순간은 큰 KiSlash가 화면 상단을 덮어 재촬영 대상. 최종 조정은 QA 입력을160tick 이후 공격 해제하고280tick 이후 실제 탄3개 이상 때 촬영한다. 프로덕션은 화면 밖 메시 중심(뷰포트 x.05~.95,y.12~.95,z>0 밖)의 그림자 캐스팅을 끄고 카메라 안 메시·영웅·적·화로 그림자는 유지한다. PC 추가광 그림자 atlas4096(기존2048), 보스/영웅 2D 접촉음영2.2×.45u/.48×.12u 알파.32, 바닥위에 표시. Core/충돌 불변.


## 2026-10-30 최신 인계 재개 — Blender 환경 연결 후보

현재 요청 브랜치 codex/pc-unity-steam-keyshot-20261030에서 환경 원본을 인수했다. 기존 별도 final 체크아웃의 실행 입력은 수정하지 않는다. 원 체크아웃 미커밋 14경로는 I:/EXODUSER-Storage/steam-keyshot/reprise-2026-10-30T00-16-19.875Z에 SHA와 함께 보존했다. guard.baseline.json은 기존 WIP이며 커밋 제외한다.

| 항목 | 현행 후보 계약 |
|---|---|
| 제작·실행 | Blender 무창 제작 FBX10종을 최신 최종후보-파일영수증.json SHA로 인수. HellLightingSetup의 Terrain 처리 뒤 HellEnvironmentSetup 호출. --remodel3d의 새 조명 경로에서만 활성 |
| 큰 질량 | 기존 보행 덤프를 따른 좌우 암반·부패 그루터기74개. 큰 모듈 중심은 차단 셀, Collider 추가0. 전체 메시 발자국·가림은 실제 Player에서 별도 판정 |
| 접합 | 바닥 접합58개, sy 최대.35, 영웅 기준(35.4,-74u) 반경1.65u 보호. 총132개는 입력 명세이며 개수 자체가 합격 기준은 아님 |
| 돌 | Poly Haven rock_ground, tint(.68,.71,.74), smoothness.26, world tile2.2u |
| 목질 | Poly Haven bark_brown_02 디퓨즈·GL노멀·러프니스 2K, tint(.65,.53,.46), smoothness.12, tile1.3u. Rob Tuytel/CC0, 원본 URL·SHA는 I: pbr-source/bark-출처.json |
| 뼈 | rock_ground 표면, tint(.76,.71,.59), smoothness.12, tile.8u |
| 재질 샘플 | Trilinear·이방성8·밉바이어스1. 표면 smoothness = 지정값 × (1−rough×.65), 기존 피부 높이맵·충돌 유지 |
| 촬영 | --unity-keyshot-location X:Ypx 지정 시 탐험과 전투 시작점을 공유. 직접 입장·생존 보조·스크립트 입력, 실제 적/탄 AI. baseline 플래그로 같은 바이너리의 구 조명 경로 비교 가능 |
| 입력 검사 | environment-input.test.cjs: 누락 리소스 FAIL 재현 후 132배치 리소스·유한좌표·양수scale·큰모듈 차단셀·낮은 접합·영웅 보호 검사 PASS. GPU·Steam시각 판정 별도 |

직접 본 기준: 사용자 PoE2 ref_07, NRFTW contact_sheet_2 6장, Blender 모듈 렌더, mesh-after 탐험/드루이드 원본. 현재 핵심 차이는 외곽 입체 질량·높낮이·접지·깊이감이다. 큰 질량→접합→바닥→전투 가독성 순서로 실제 장면을 검수한다. 시각 미검증 후보이며 Steam 합격/통합 완료가 아니다.


### 환경 후보1 실제 판정과 제작법 변경

환경1 빌드0773279c: 컴파일오류0·BuildReport Succeeded·USER_SAVE변경0. environment1-caps 원본3장 직접 확인: 외곽 높이는 생겼지만 암반 평판 형태·표면 줄무늬·기존 블록아웃의 긴 그림자가 남아 VISUAL FAIL. 이 후보는 Steam 채택하지 않는다. 촬영 중 REPL30초 중단으로 부모 추적이 끊겨 안전 영수증은 미확보이며 PNG/크기검사만으로 Player 안전 PASS를 주장하지 않는다. 자동임포트451경로는 environment1-import-auto에 SHA 보존 후 시작 시 clean이던 HEAD byte로 복원. 첫 호출30초 중단 후 남은18경로만 처리했다.

| 후보2 변경 | 현행 구현·근거 |
|---|---|
| 재질 방법 | 사용자 정의 HellEnvironmentLit 대신 Unity URP/Lit. FBX smart UV·_BaseMap·_NORMALMAP, BumpScale 돌/기존목질.35·스캔목질.5. custom shader는 보존 자료이며 현재 모듈 렌더에서 미사용 |
| 실제 원인 | 기존 rock_ground_nor_gl 메타는 textureType0/sRGB1/mipmap0. 노멀을 선형 normal map으로 임포트하고 diffuse/normal/rough mipmap1·Trilinear·aniso8로 수정. 리소스 누락/컴파일 통과만으로 이 설정을 올바르다고 가정하지 않음 |
| 암반 큰 형태 | Blender4종의 넓게 잘린 상부를 제거하고 굴곡·절리 면을 재조형. 원본/수정 FBX와 blend는 I:에 보존 |
| 고목 큰 형태 | 기존 map R2의 CC0 tree_stump_01/dead_tree_trunk_02 LOD1 FBX(6899tri)·1K tinted albedo/normal4개를 manifest SHA 대조 후 후보로 연결. 기존 HOLD는 실제 Unity 검수 전 상태이며 이번 연결을 채택/PASS로 올리지 않음 |
| 스캔 재질 | 파트 이름 stump/trunk에 맞춘 각 고유 albedo/normal, tint(.72,.78,.82), smoothness.24. 원본/CC0 출처는 I:/EXODUSER-Storage/demo-art/map/r2/import-manifest.json·HANDOFF.md |
| 그림자 | 기존 소유 후보54601c962의 블록아웃 cast 제거를 출처로 인수. 새 바닥·Blender/스캔 환경·영웅·적·화로 그림자는 유지. 환경 전체 그림자 제거로 결함을 덮지 않음 |
| 같은 카메라 | --unity-keyshot-baseline --unity-keyshot-fixed-camera이면 구 조명/표현과 FOV24.5를 함께 사용. 새 후보와 같은 위치·피치·거리·영웅 비율로 비교 |
| 탄막 촬영 | 초기40tick만 공격하고180tick 뒤 실제 보이는 탄3개 이상을 기다림. 입력 영수증은 필드탄3/보스탄6 미만이면 FAIL. 적/탄 직접 주입0 |

Core·충돌·보행로 변경0. 기존 독립 oracle는2523표본 중2불일치이며 north gate 주변(4018.543,104.749,r10)/(4042.906,207.936,r15)이다. 원본 스냅샷과 현재 ch1_map의 북쪽 게이트 타일 계약 차이를 확인했으며 이 후보의 Core 수정/새 회귀로 단정하지 않는다. 전체 oracle PASS는 미확보 상태로 남긴다.


### 보스 촬영의 입장 동선 보정

환경1 보스 프레임의 본체 중심은(35.42,-37.15u)로 아레나 중심(25.8,-21.8u)에서 멀었다. StageFlow는 연출 진행 중에도 입구에 놓인 플레이어를 향해 보스 AI를 갱신한다. 기존 하네스는 LoadPhase0까지 기다린 뒤 플레이어를 옮겨 보스가 남쪽 외곽까지 이동한 화면을 촬영했다. 검은 바깥 경계를 노출 조정으로 덮지 않는다.

촬영 하네스만 보정: Stage.InArena 최초 확인 때 실제 Arena.RoomCx/Cy 중심(+.5타일)에서 플레이어를(+260,-150px)에 1회 배치하고, 이후 원래 AI/실제 발사로 촬영한다. 적/보스/탄 직접 배치나 Core/입장 동선의 제품 규칙 변경0. 이 보정 전 환경2 Player와 보정 후 새 빌드를 구분하며, 새 실제 보스 화면을 확인해야 수정 완료다.


### 환경 후보3 — 구도·재질 단계로 복귀

환경2 빌드0c1988ab 오류0·USER_SAVE0, Player6b8887d5(AMD9070XT/D3D11,1920×1080) 사용자 창0·잔여0·세이브변경0이나 실제 필드탄0으로 exit3/FAIL. 원본3장을 직접 확인했다. 암반 형태는 개선됐으나 rock_ground 자갈 무늬가 암반에서 잔점처럼 읽히고 기존 CursedBark 블록아웃/Decals_root가 검은 실루엣을 만들며 영웅이 적에 가려졌다. 같은 강도 조정을 반복하지 않고 큰 구도·표면 선정 단계로 돌아간다.

| 항목 | 후보3 구현·판정 경계 |
|---|---|
| 암반 표면 | 공식 Poly Haven Rock Face https://polyhaven.com/a/rock_face, Dario Barresi/Greg Zaal·CC0. Diffuse/GLnormal/Rough 1K3개 공식 API MD5·SHA대조, tint(.48,.58,.68)·smoothness.18·URP/Lit. 넓은 풍화 면을 직접 열어 자갈 무늬와 구분. 구매/지출0 |
| 기존 블록아웃 | 새환경 자식·새 바닥을 제외한 M_RottenWoodMembrane/M_CursedBark/Decals_root* 렌더러만 새조명 런타임에서 비활성. 씬/원본 메시·충돌 불변. 기존 blood/bone/river/광원 유지 |
| 전경 큰 질량 | 스캔 고목1개를(33.7,-73.8u), scale(.5,.65,.5), yaw20°에 추가. 원본 차단영역 접합. 기존 외곽75/접합58=133개, 입력 안전 검사 PASS. 실제 가림/발자국 확인은 Player에서 별도 |
| 영웅 초점 | 부모 Player Marker의(0,4,0u), 아래방향 spot·색(.72,.84,1)·강도14·range7u·outer58°/inner40°·Soft 그림자강도.65·normalBias.1. 기존림/불빛/ACES 유지 |
| 실제 탄막 입력 | 같은 Core/원본 맵으로 독립 입력 재현. 3540:7400은1800tick까지 탄과 거리 조건 동시충족 실패를 재현. 3700:7400에서240tick 중30tick 실제공격+75tick 이후 정지촬영 조건은1422tick에 가시탄4/처치2. 적/탄 주입0 |
| 실제 캡처 | 3700:7400px, 1800tick 한도·240tick 중30tick 공격·phase>75/가시탄≥3/최근접 적>100px에서 촬영. 보스도1800tick 한도. CPU 입력진단은 실제 GPU 시각 PASS가 아님 |
| 임포트 진단 | --unity-steam-keyshot에만 모듈별 첫1회 원본 FBX rotation/scale와 실제 Renderer.bounds 로그를 남겨 실제 크기·축을 확인 |

필드 입력 진단 첫 실행은 자식 APPDATA 경로 누락으로 NuGet 시작 전 실패했다. 기존 확인된 Windows 자식 환경을 적용한 동일 진단은 정상 실행됐으며 dotnet/호스트 영구설정 변경0. 환경 후보3은 새 실제 화면·M1·전후 비교 전까지 미검증이다.


### 후보4 — 실제 화로와 촬영 하네스 진단 방법 변경

후보3 c8f93b05 빌드오류0·USER_SAVE0. Player e4a9b14d 창0·잔여0·USER_SAVE0이나 필드탄2로 exit3. 고정 원운동 입력을 두 번 연속 같은 탄막 미달로 실패했으므로 해당 방식은 중단했다. 독립 진단과 Unity 실제 장비/상태가 다를 수 있어 그대로 반복하지 않는다.

| 항목 | 후보4 계약 |
|---|---|
| 실제 화로 | Blender 제작 볼·말린 테두리·철 다리3/리벳12, 메시3000면·높이.737u. 기존 화로 위치5곳에 실제 FBX를 배치. URP/Lit 색(.15,.17,.20), metallic.8/smoothness.45. 1.6u 횃불 그림판과 그 알파 그림자를 대체. 기존 불꽃8프레임12fps/.14배는 bowl+.74u에서 유지 |
| 보스 바닥 | Rock Face 알베도/GLnormal 월드4u, 기존 흙 혼합 잔여5%·노멀.25. 원화 밝기의 미세 기울기로 노멀을 만들던 방식을 제거. 보스·AI·판정·바닥Collider 변경0 |
| 새 입력 | 8방향40/80px 위치의 원본 CanMove(r15)를 확인, 실제 최근접 적 거리300px를 목표로 clearance 오차와 중심이탈.1 가중을 최소화. 240tick 중30tick 실제 공격·phase>75·가시탄≥3·적거리>100px 조건 유지 |
| 입력 진단 | 무조건 멀어지는 첫 진단은 실제 적 사거리까지 벗어나 탄0. 거리300px 유지 진단은 원본 Core에서 4020:6880/3700:7400 각각1062/1100tick에 가시탄3·처치4/5. 실제 Unity 결과는 별도 판정 |
| 전환 검수 | QA에만 Arena LoadPhase 동안 EnemyAiEnabled=false, 연출 종료 뒤 true로 복구. 실제 보스 생성 위치/원래 AI 발사로 촬영. 제품 연출 중 보스 이동 규칙 수정이 아니며 이 보조 조건을 감추지 않음 |
| 탄 검사 | 필드 Active&&!Friendly, 아레나 Active&&!Friendly&&DruidPoison만 카운트. 이전 필드 잔탄으로 보스전 합격하지 않음 |
| 전후 비교 | baseline+fixed-camera는 아레나에도 동일 표현카메라/본체scale.72를 쓰고 새 조명·바닥·접촉음영은 제외. 시점을 고정한 조명/표면 비교이며 원래 큰 FOV 그대로인 전경으로 주장하지 않음 |
| 새 진단 증거 | 실제-촬영설정.json, 실제-입력추적.txt(tick·좌표·전체/가시탄·적거리)를 새 촬영 폴더에 저장. 캡처 조건을 미달한 채 PASS로 완화하지 않음 |

Unity가 직접 기록한 FBX 원본 회전0/scale1과 실제경계로 축·단위를 확인했다. 스캔 고목은 실제 세로높이2.94u 범위가 있어 단순 평면이 아님. 동일점의 잔여 형태/그림자는 새 화로를 포함한 새 실제 프레임에서 다시 확인한다.


저장 정책 마감: 더 이상 참조하지 않는 자기 후보의 root_0~2 FBX/메타, HellEnvironmentLit/메타, 미사용 rough2세트, torch_base/메타 총14파일은 문자열·GUID 참조0을 확인하고 I:/EXODUSER-Storage/steam-keyshot/unused-owned-runtime에 SHA 대조 보존 뒤 SSD 사본만 정리했다. 활성 화로·스캔고목·바닥·불꽃·원본 H5 자산은 유지한다. 삭제 채택이 아니라 중간 후보 보관 위치 분리다.


## UI 우선 사용자 지시 확인 후 마감 — 2026-10-30

최신 MERGE_QUEUE의 CTO09:4x 행과 canonical CTO_STATE actor1은 UI unity/main 병합·실제 바탕화면 갱신 전 키샷 Unity/Player/새 빌드를 중지하도록 명시했다. 확인 당시 후보4 PS58500은 Unity 시작 전 예약 대기였으므로 자기 PS만 중단하고 steam-keyshot-environment 예약을 해제했다. 타인 프로세스 종료0, 후보4 Unity 실행0. 해당 마감은 I: UI우선-대기.json에 기록했다.

| 게이트 | 실제 현재 상태 |
|---|---|
| 소스 | 요청 브랜치 source52ca9f20b4ed3afa91b68507016b2c6e0a95561c 원격 ref 대조. 이 뒤 마감 docs만 추가하며 Unity tree는 동일 |
| 컴파일/빌드 | 환경1/2/3는 오류0 빌드 영수증0773279c/0c1988ab/c8f93b05. 후보4는 대기 중 취소, 컴파일/셰이더/GPU 검수 미실행 |
| 실제 캡처 | environment1~3-caps 각1920×1080 원본3장. 최신 실제 Player e4a9b14d는 필드탄2로 exit3이며 Steam 채택 FAIL. 창·잔여·USER_SAVE0 |
| 새 화로 | Blender FBX 재수입·640² 중립 형태 렌더 확인. 첫 렌더의 BSDF 이름 조회 실패를 type 조회로 수정한 뒤 실제 PNG 생성 확인. Unity 재질·불꽃·접지는 아직 미검증 |
| 안전 보존 | automatic-import-final에 자동 임포트462경로 SHA 보존 후 시작 clean이던 HEAD byte로 복원. tracked WORK는 시작 WIP guard.baseline.json만, 원래 SHA9414ce48870885726bd4bd6db7df52d6d3ad8aa63edcb7f67c6cb3f63c4bb8ca 동일. INDEX 비어 있음. 타인 미추적 메타/WIP 보존 |
| 전체M1/통합 | 이 후보의 전체M1·공통줄기·바로가기 갱신 미완료. 다른 후보627113829의 b50ce3b5 23/23을 현재 Runtime에 소급하지 않음 |
| Steam 판정 | 현재 합격3장 없음. 빌드·소스 백업·부분 형태 개선을 Steam 완료로 올리지 않음 |

### 재개 시 재사용할 새 근거

독립 조명 인계 steam-keyshot-lighting-handoff.md와 source47e519f41984a3124995d4b70a1169550110644c를 확인했다. 긴 검은 나무형 무늬의 실제 원인은 Decals_blood/Decals_blood_drag 원본 혈흔이며, 실제 메시 그림자 제거만으로는 남는다고 명시했다. 이 원인 수정은 현재52ca 후보에 아직 인수하지 않았다. UI 게이트 뒤 자기 환경/화로 변경을 보존하는 3way 대조로 정확 부분만 인수해야 한다. 같은 인계의 회복/대기 보스 프레임 선택·순수 돌 노멀/알베도와 현행 맵 oracle2523/36검사0 근거도 비교하며, 과거 Godot맵의 북문13칸 차이2불일치와 구분한다. 새 입력으로 판정 기준을 낮추지 않는다.

### MAP PRODUCTION REPORT — 현재 범위와 다음 미완료 단위

| 항목 | 실제 상태 |
|---|---|
| STAGE / MASTER | CH1-1 키샷 구간. 기존200²맵·남→북 진행·전투장·상단 통로·Core/Collider 보존. 전체 맵 재설계 아님 |
| OUTER MASS | LEFT는 실제 암반/스캔고목 높이 관찰, RIGHT/TOP/SOUTH는 같은 후보의 전체 카메라 QA 미완료. 심연/먼 폐허/다층 안개의 원근감은 미구현이며 최신1순위 미충족 |
| LARGE | 실제 FBX 축0/scale1·경계 확인. 전경 그루터기·암반으로 높이 추가, 어두운 표면·반복·공간 조화는 RETOUCH. 화로 새 후보는 Unity 미검증 |
| MEDIUM / GROUND | 낮은 뿌리·잔해 접합58개. 표면 메시의 원본 높이/충돌 유지. 혈흔의 나무형 무늬·전체 접합과 바닥 잔점은 최신 인계 수정 인수 후 재검수 필요 |
| PLAYABLE | Core/Collision 수정0. 실제 스크립트 이동·생존 보조 전투 관찰. 최신 촬영2/3 탄막조건 FAIL, 새 거리유지 입력은 CPU 진단만 확인 |
| LANDMARK | 기존 지옥불 광원·스캔 고목1개 시각 초점. 주/보조 랜드마크 전체 위계 미완료 |
| CAMERA QA | START 근처 탐험·필드전투·보스3장 직접 열람. EARLY/SIDE L/SIDE R/LANDMARK/LATE/EXIT 전체8뷰는 미검증. 실제 PNG는1x로 확인했고 PoE2원본/NRFTW6장 격자보드와 비교 |
| TECH QA | 3후보 컴파일/Win빌드 오류0, 최신2Player의 창/잔여/세이브0. 후보4 컴파일·GPU·M1·성능·전후 합성 미검증. Core/원본 데이터/사용자 앱 불변 |
| FILES / GIT | 자기 Runtime/Shader/Resources와 본 SSOT만 정확 경로 commit·비강제 push. inactive14파일은 I: SHA 보존. 사용자 guard/다른 untracked 보존. 배포/구매/크레딧0 |
| VISUAL VERDICT | Steam 제출 FAIL. 후보4는 미검증. 부분 형태·초점 개선을 전체 PASS로 승격하지 않음 |
| NEXT PASS | UI 공통 SHA/바탕화면 실제 갱신 영수증 → 최신unity/main 정상merge → 조명 인계의 혈흔/회복프레임/현행oracle 정확 인수 → 새 후보4 실제검수 → 외곽 원근감 제작·동크기비교 → 정확실행본 전체M1 → 지정통합/바로가기 |

외곽 원근감의 다음 제작 단위는 임의 소품 추가가 아니다. 보행과 연결된 바닥은 유지하고, 바깥과 연결된 비보행 구역만 시각 표면을 낮추는 절벽/하부 질량, 먼 덩어리, 깊이에 따른 안개층을 실제 카메라 구도로 설계한다. Core 권위·TerrainCollider·플레이어 높이 질의는 지키며, 고립된 충돌 소품 영역을 심연으로 오인하지 않도록 별도 분류해야 한다. 아직 구현하지 않았고 UI 이전에 새 제작/빌드를 시작하지 않는다.


## 2026-10-30 Blender 독립 환경 키트 — Unity 실행 없는 인계

blender-env-brief의 독립 제작 범위: 전용 브랜치 codex/pc-blender-env-20261030, I:/EXODUSER-Storage/demo-art/blender-env/REPORT.md. Unity/Player/기존 layout·Core·UI 변경0.

| 항목 | 현재 산출·계약 |
|---|---|
| 자산 | 절리 암반/절벽/접합/스캔 고목/낮은 뿌리/석벽/기둥/뼈/사슬/재·자갈/먼 아치 11FBX, 총31735tri. delivery/Assets/Exoduser/Art/Environment/CH1_1, 11재질·77PNG·메타 포함202파일 |
| 베이크 | BaseColor/Normal/AO/Curvature/Roughness/Metallic/MetallicSmoothness. 큰 질량4종2048²·나머지1024², R=metallic/A=1-roughness. 큰 면·저채도·곡률/AO, 점/그레인 생성0 |
| 출처 | Poly Haven CC0 Rock Face/Bark Brown02/Burned Ground01. 고목은 기존 map/r2 packed 스캔을 읽기만 하여 휜 형태/UV/8071tri/2048 베이크 재구성. 출처-실물대조.json·고목-스캔전환.json SHA |
| 임포트 | 기존 URP/Lit GUID 대조, _BumpScale .7/_OcclusionStrength .6, mipmap/Trilinear/aniso8·BaseColor sRGB/Normal·마스크 linear. FBX재질 외부 remap·GUID 정적 연결, Collider0 |
| 피벗 | Blender Z-up/meter, FBX -Z/Y. 고목·재는 지면 피벗, 음수 하부를 묻음. Unity 실제 고도·축·바닥 접합은 미검증 |
| 증거 | 동일52°/같은광원 1600×1000 정면·측면22장, 노레위 나란히 비교11장. 최신11FBX SHA 재수입·퇴화면/고립정점/UV 오류0, GUID 중복/유실0 |
| 한계 | 모듈 정적 검수와 실게임 PASS 분리. 조립 시연 RETOUCH, 실제8카메라/탄/충돌/성능/M1 미검증. UI 완료 뒤 키샷 담당 인수. 현재 runtime에 자동 연결하지 않음 |

세부 ID·삼각형·맵·원본·실패/수정·MAP PRODUCTION REPORT는 위 REPORT와 source/모듈명세.json. 레시피는 tools/blender-env, 실체는 I: code-checkpoint(junction/SHA검증). 같은 퇴화면 실패를 구 영수증으로 오인한 절차 오류는 보존하고, 최종은 실제 면 수정 뒤 최신 SHA 11개 재수입만 근거로 쓴다. Steam 합격·unity/main 반영·PC/Mac 동기화로 확대하지 않는다.

## 2026-10-30 최신 콘셉트 — 썩은 숲·독액 강가·다리 독립 키트

새 브리프11시 및 keyframe_A2를 읽고 독립 Assets11종을 추가 제작했다. 이전 키트202파일은 SHA 변경0. 인수는 I:/EXODUSER-Storage/demo-art/blender-env/forest-r1/delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest, 상세는 같은 폴더 상위 REPORT.md·최종-인계영수증.json. Unity/Player 실행0·게임 반영0·원본 맵/세이브/UI 작성 변경0. 이 브랜치의 상속 키샷 Runtime을 병합하라는 요청이 아니다.

| ID | 삼각형 | 맵 규격 |
|---|---:|---:|
| RF_Ancient_Rotten_Tree | 21479 | 4096² |
| RF_Fallen_Log | 9762 | 2048² |
| RF_Withered_Shrub | 2814 | 1024² |
| RF_Rotten_Wood_Bridge | 7540 | 2048² |
| RF_Hanging_Moss | 3946 | 1024² |
| RF_Riverbed | 1232 | 1024² |
| RF_Broken_Stone_Bridge | 6378 | 2048² |
| RF_Fungal_Colony | 2832 | 1024² |
| RF_Corroded_Riverbank | 1666 | 2048² |
| RF_Foam_Bank | 3228 | 1024² |
| RF_Forest_Vista_Card | 2 | 2048×1024 |

총60879tri, FBX11/재질11/PNG77/고정GUID 메타 포함202파일. BaseColor/Normal/AO/Curvature/Roughness/Metallic/MetallicSmoothness, R=metallic/A=1−roughness. 거목은 CC0 실물 목질+비대칭 큰 가지, 원본UV/새UV 분리4096·로우 MikkT 노멀 기저. 나머지9개3D는 공통UV 하이 베이크, 후경 카드는22×11m/2tri·2048×1024 RGBA 및6상수맵. 물/독액 수면·Collider·Animator는 만들지 않았다.

URP/Lit GUID933532a4fcc9baf4fa0491de14d08ed7, BumpScale.7/OcclusionStrength.6, BaseColor sRGB·나머지linear, mipmap/Trilinear/aniso8. 유기물 roughness≥217/255, 이끼·덤불≥232/255. 카드만 투명 양면·ZWrite0·ShadowCaster 비활성. 실제 Unity 임포터 수용 여부는 미검증.

Blender 원본2개의 packed 데이터/현재 PNG byte 일치도 확인했다(packed-검사.json). 최신11FBX SHA 재수입·축/크기<.003m·퇴화면/고립정점/UV 오류0, 강바닥 양끝13쌍<.00001m, GUID103 중복/유실0. 같은52°·같은광원 정면/측면22장·노레위 비교11장·1x4장·A2조립 비교 직접 확인.5종 메시+7맵40파일 byte 불변으로 같은 입력 렌더를 재사용했다.

VISUAL VERDICT: RETOUCH — 독립 조립 시연, 실제 게임 미검증. 회색 강바닥·짧은 단일 아치·외곽 반복·경계가 남아 A2 장면과 차이가 크다. 게임용 아트/Steam PASS로 올리지 않는다. UI 이후 기존 키샷 담당이 별도 인수하여 수면·조명·다리 접근/연속 구성·후경 알파·실제1080p/1x·전투·같은 후보M1을 검수한다.

첫 UV edit-mode native crash, 잘못 추출한 재작업 루프의6종 High 누락,139성분 고립 투영 폐기는 REPORT/source 실패보존에 남겼다. 최종은 누락 수정·새 기하/UV·합성 거목 뒤의 최신 영수증만 근거로 사용한다. 레시피 forest_*는 tools/blender-env, 실체는 I: code-checkpoint. 바이너리/렌더는 I: 보관이며 GitHub 업로드·unity/main 통합·PC/Mac 동기화가 아니다.

## 2026-10-30 사용자 승인 나무다리 기준 — Blender woodbridge-r2

최신 승인 기준은 APPROVED_1-1_keyframe_A2_woodbridge.png다. r1은 보존하고 독립 후보를 I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2/delivery/Assets에 제작했다. FBX17/재질17/PNG119/메타 포함310파일, 94337tri. Unity/Player/게임 코드/상속 Runtime 병합/실게임 검수0.

| ID | 역할 | 삼각형 | 텍스처 |
|---|---|---:|---:|
| RF_Riverbed | 10×6m 강바닥 형태, 장축 양끝 동일·중앙 수심. 시각 메시, 충돌 별도 | 1232 | 1024×1024 |
| RF_Broken_Stone_Bridge | A2용 낮은 아치 돌다리·상판과 하부 구조 분리·무너진 난간 | 6378 | 2048×2048 |
| RF_Corroded_Riverbank | 독액 강가 부식 암반·하부 올리브 오염·노출 뿌리 | 1666 | 2048×2048 |
| RF_Foam_Bank | 강가에 붙이는 낮은 연속 거품막·정적 메시 | 3228 | 1024×1024 |
| RF_Ancient_Rotten_Tree | 검게 썩은 거대 속빈 줄기·비대칭 부러진 가지·넓은6판근·실물스캔 밑동 | 11762 | 2048×2048 |
| RF_Rotten_Wood_Bridge | 상판 약11.2m·지지구조 약11.62m 썩은 나무다리·29판자·10말뚝·목재난간·밧줄 | 10164 | 2048×2048 |
| RF_Fallen_Log | 비대칭으로 겹친 부패 고목·실물스캔 파단 목질 | 15128 | 2048×2048 |
| RF_Foreground_Roots | 화면 아래 전경용 넓은 판근과 실물파단 목질·비보행 | 7885 | 2048×2048 |
| RF_River_Stake_Cluster | 독액 강가의 썩고 부러진 말뚝7개·낮은 접지뿌리 | 616 | 1024×1024 |
| RF_Bridge_Torch_Holder | 다리 끝 목재 횃불받침·녹슨 철제바구니. 불꽃·광원 제외 | 928 | 1024×1024 |
| RF_Fractured_Stump | 강가 낮은 파단 그루터기·속빈 내부·찢긴 림·여섯 판근 | 4558 | 2048×2048 |
| RF_Gnarled_Split_Trunk | 옆으로 굽은 비대칭 파단 줄기·크고 작은 가지 분기·판근 | 4700 | 2048×2048 |
| RF_Foreground_Branch_Frame | 카메라 아래 전경용 휘어진 부패 가지 프레임·갈라진 세 분기 | 272 | 1024×1024 |
| RF_Withered_Shrub | 13마른줄기·52잔가지·52갈림의 낮은 시든 덤불, 신선한 잎 없음 | 2704 | 1024×1024 |
| RF_Forest_Vista_Card | 22×11m 후경용 투명 숲 실루엣 카드, 비보행 BACK 전용 | 2 | 2048×1024 |
| RF_Fungal_Colony | 닫힌 층상 부후균15개·낮은 대비 성장고리·얇은테·휘어진 균사 | 2124 | 1024×1024 |
| RF_Hanging_Moss | 회갈색 부패 수염이끼·5다발/125가는섬유·가늘어진 끝·정적 메시 | 20990 | 1024×1024 |

새 줄기의 부착 가지·두꺼운 판근·스캔 밑동/UV, 불규칙 나무다리와 받침, 닫힌 층상 부후균, 분기 덤불, 회갈색 수염이끼, 낮은 파단/휜 줄기/전경 가지 변주, 새 먼 숲 카드 하단24% 알파를 제작했다. Normal/AO/Curvature/PBR 실제 베이크, CC0 목질 거칠기, R=metallic/A=1−roughness. URP/Lit/임포트 계약은 위 r1과 같으며 새 유기물 roughness 하한205/255·이끼235/255, 기존 불변 맵은 r1 값 유지. 카드6상수맵은3D베이크로 표시하지 않는다.

현재 FBX17 SHA 재수입·축/크기<.003m·퇴화면/고립정점/UV 오류0·강바닥13쌍<.00001m·GUID157 중복/유실0·PNG119 규격/색공간/금속평활 전픽셀·packed원본2개 연결 이미지 byte 검사 PASS. 동일52도34렌더·원화/노레위 비교각17·1920×1080 조립/1x는 REPORT에 직접 판정한다.

독액 기준 linear(.075,.080,.023)/sRGB#4D502A/roughness.43/emission0. Blender 정적 수면은 색 대리물이며 Unity 셰이더가 아니다. 조립은 추정 약37도/40mm, 개별 모듈52도이며 원화와 정확한 카메라 보정을 한 것은 아니다.

**VISUAL VERDICT: RETOUCH. 브리프의 큰 차이0·게임용 아트/Steam 완료 미달.** 일부 큰 줄기/판근의 단순한 조형과 지면·오염 연결/층별 빛/독액 표면 차이가 남는다. Blender 담당의 형태/중간 접합 추가 재작업을 남기고, UI 후 기존 키샷 담당의 실제1080p·1x·탄막/8카메라/M1은 별도다. 기술 PASS를 시각 PASS로 올리지 않는다. 원본 r1 202파일·시작guard WIP SHA 보존. 정확한 근거/실패/저장 순서/다음 작업은 I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2/REPORT.md·최종-인계영수증.json.
## 2026-10-30 사용자 플레이 결함 재현

| 항목 | 계약·상태 |
|---|---|
| 기준 | 사용자 settings-r4 / source 2584e36e4, 실행 인자 -force-d3d11 --remodel3d |
| 재현 검사 | --unity-playtest-capture -output <경로>. 가상 Input System 키보드·마우스를 기존 FixedUpdate에 전달하고 13개 입력의 Core 좌표·조준 오차·화면 위치·연속 프레임을 기록. OS 손조작과 구분 |
| 입력 | LMB/RMB/Shift/E/Q/Ctrl/Space/1~4/F/Z. 기본 미배정 2~4/Z는 무시, 가시덫·회복의 영역은 고정형이 정상 |
| 확인 중인 경계 | legacy 마우스와 ExoInput 좌표 혼용, 부모 이동 후 billboard 높이 보정 누적. 제품 수정 전 동일 코드 재현 검사를 먼저 수행 |
| 근거 위치 | I:/EXODUSER-Storage/demo-art/playtest-fix. 컴파일·oracle·3D 재현·M1·통합·바탕화면은 각각 별도 게이트이며 현재 미완료 |

재현 검사 종료 시 로비·스토리·캐릭터 영상과 효과음을 닫고 1초 배출 후 종료한다. 기준 B07은 35/35·사슬700px이나 종료 지연으로 안전 완료 아님. 첫 빌드 UPM 시작 실패 a9c02bdb는 컴파일 미진입·USER_SAVE0이며, 기존 성공 프로세스 환경 래퍼로 원인을 분리한다.

종료 차단 원인을 분리하기 위해 스킬 계측은 legacyFixture로 시작하고 LobbyFlow 상태만 전투로 전환한다. 영상 Open을 한 번도 호출하지 않는 전투·스킬 전용 fixture이며 로비·인트로·일반 입장 검수로 확대하지 않는다.

### 실제 재현과 원인 수정

| 경계 | 수정 전 실제 결과 | 수정 계약 |
|---|---|---|
| 조준 | 가상 Input System 마우스와 legacy 마우스가 분리되어 13입력 조준 오차 약1035px, 사슬 이동 중 최대1598px | AimWorld가 버튼과 같은 ExoInput.MousePosition만 읽음. 3D는 플레이어 높이 평면 역투영, 2D는 기존 ScreenToWorldPoint 유지 |
| 악의구 위치 | Core는410px 진행하지만 부모 이동마다 SpriteRenderer lift가 다시 더해져 최대21.300u 이탈, 실제 연속 프레임에서 구체가 화면 위로 떠오름 | UpdateViews의 모든 writer 전에 직전 로컬 위치·회전을 복원. LateUpdate에 한 번만 tilt/lift 적용. 부모만 이동하는 파편·악의구도 누적0 |
| 재현 판정 | source16b4f54f4, 빌드6c9148c9(errors0/USER_SAVE0), 1040프레임·14실패 | 원본 Core 규칙·속도·판정 수치는 변경0. 수정 후 동일 항목 재검수 예정 |
| 실행 경로 | hidden 종료 지연은 영상 Open0에서도 조사 중, UI담당의 별도 batch M1은 정상 종료 | 이후 스킬 검사는 Desktop=batch의 실제 world camera RT로 연속 캡처. HUD/OS 손조작/자연 입장 검수와 구분 |

### 구도·접지와 최종 연속 검수 계약

| 항목 | 현행 구현·근거 |
|---|---|
| 기준 | 승인 A2 woodbridge 이미지 직접 열람, 동일16:9 비교. 각도48.7014126°·거리14u 유지, FOV46.9453°·영웅2배·전방1.45u로 큰 전투 시야와 영웅 초점을 조정. 실제 시각 판정은 후속 캡처로 확정 |
| 발 접지 | 원본 전사9시트의 알파>64인 발끝240프레임을 오프라인 측정해 같은 JSON에 저장. 투명 하단 여백만 제외, 런타임GPU readback0. 피벗/소스 그림·판정 크기 변경0 |
| Space+이동 | 기존 어댑터는 스킬 키를 먼저 채워 구르기1회와 강타1회가 함께 발동·악의1000→990·gSlamWindup. `SetRollInput` 뒤 `SetSkillKeys`로 순서를 맞춰 구르기1회·시전0·악의1000·bladeDash. Core 수식 변경0 |
| 연속 검수 | 기존13입력+이동Space 구르기=14항목, 고정60Hz 실행·3틱 간격20fps PNG. Ctrl150틱으로 자동파쇄·파편도 확인. batch는 동일 Remodel3DLate/Cinemachine ManualUpdate 후 실제 월드카메라 RT1600×900을 저장하며 HUD는 미포함 |
| 시점 보정 | 첫 수정 fb88e95e는 조준최대0.03104px·나머지입력통과, 악의구는 Late 전 측정으로 매번고정0.300u 검사실패. 최종 검수는 Late 후 측정으로 수정. exit2/창·잔여·USER_SAVE0, 실패를 PASS로 바꾸지 않음 |


## 2026-10-30 사용자 플레이 결함 수정 최종 실행 증거

| 항목 | 실제 검증 범위와 결과 |
|---|---|
| 코드 후보 | ef75f883e03fdc355392ff853bde4813e8412053, Core 트리546cad24a1e4f2988fb1a268ba35a43b67a90d19 유지 |
| 정식 빌드 | Unity6000.6.7f1 Win64, 6bcf428c, 컴파일 오류0·종료0 |
| 전 입력 | 16c7536f, LMB/RMB/Shift/E/Q/Ctrl/Space/1~4/F/Z/이동+Space 14사례·44검사 통과, 1190틱·20fps401장 |
| 표현/조준 | 조준오차 최대0.021356374px, 투사체 표현 위치오차 최대2.980232238e-8u, 구르기175px·중복스킬0 |
| M1 | 72cd32e1, 23단계 전부ok·firstBlocked 없음, D3D11 RX9070XT, exit0 |
| 실행 안전 | 최종 두 Player batch 실행 창0·잔여0·사용자 세이브 변경0. 임의 OS 손조작/전체 자연 플레이의 증거는 아님 |
| 촬영 방식 | 실제 FixedUpdate/Input System/Core/실제 카메라 렌더. batch RT는 HUD 제외. 자동 검사 강제 진행은 별도 표기 |
| 원본 대조 | 스킬8416·검기93·사슬/패링187165검사 불일치0. 최신H5 관련24섹션 대조만 확인, 미이식 기동스킬까지 최신 전체동등으로 확대하지 않음 |
| 산출물 | I:/EXODUSER-Storage/demo-art/playtest-fix/final-player, final-m1, final-build, oracles |

기술 범위는 입력·스킬 이동·누적 billboard·공통 카메라 설정 수정이다. 승인 A2의 숲/목교/재질/조명 전체 환경 제작은 이 후보에 포함되지 않으며 실제 현재 환경은 여전히 차이가 크다. 카메라/영웅 가독성 개선은 RETOUCH, 전체 A2 아트 PASS 아님. 기존 hidden Player 종료 지연은 같은 경로 두 번 확인 후 중단했으며 정상 종료가 검증된 공식 batch 경로만 최종 영수증에 사용했다.


## 웹/Unity 전수 비교 최종 자료

- 웹은 고정 origin/main18aef1218의 실제 update/draw와 실제 브라우저 키/마우스 이벤트로1190틱·20fps401장. 제품 소스 수정0, 시작결계·대사·적/자동석궁만 QA상태로 격리했다. API는 QA메모리응답이며 실제백엔드·저장 검수 아님.
- 검기224px·악의구410px·사슬700px·구르기175px는 웹/Unity 일치. Q는sBlock, E는sDraw/sBash, Ctrl얼음보주·Space강타·1가시덫/F회복장판·미배정2~4/Z를 나란히 직접 확인했다.
- 자료: I:/EXODUSER-Storage/demo-art/playtest-fix/스킬-전수-비교.html (원본1600×900,1x·20fps슬라이더), 웹-Unity-14입력-연속비교.mp4, 전수-비교-축소목록.png, 악의구-수정전후-연속비교.png, A2-현재-동일크기.png, A2-영웅-1x.png. 축소목록만으로1x판정을 대체하지 않았다.
- 실제 웹pageerror0. 정적 URL18개(기존 UI이미지3·글꼴2·음원13)가 읽기용G자산경로에 없어404기록; 전체웹자산로딩 PASS로 주장하지 않는다. 스킬 원본 이미지와 궤적은 비교 자료에 포함됐다.
- 웹 첫 촬영482d71ff는240초 제한종료, 재촬영b533b4f8는14입력/1190틱/401장·JSON저장 완료 후 browser.close 지연. 격리프로필로 소유 확인한 Chrome44840/56660·촬영Node27320만 종료요청했다. Chrome HasExited=true 확인. 정상종료 PASS로 세지 않으며 실행기 잔류 감지의 WMI 사후목록과 실제HasExited를 구분한다. 같은 촬영 경로 추가 반복0.
- 카메라/영웅 가독성 RETOUCH. A2의3D영웅·숲/목교 질량·재질·조명과 현재화면의 차이는 남아 있다. Q/E의 잔광·링크 및 장판표현도 원본과 조형/잔상 차이가 있어 전체 VFX아트 PASS가 아니다. 기존 맵/캐릭터/VFX 담당의 후속범위다.

영상 순서(초): LMB0~1.35, RMB1.35~2.70, Shift2.70~4.05, E4.05~5.40, Q5.40~6.75, Ctrl6.75~9.25, Space9.25~10.60, 1키10.60~11.95, 2키11.95~13.30, 3키13.30~14.65, 4키14.65~16.00, F16.00~17.35, Z17.35~18.70, 구르기18.70~20.05. 왼쪽웹/오른쪽Unity, 각1600×900.

웹 실행기 b533b4f8 최종 영수증은 ok=false/exit=-1/창0/사용자세이브변경0, 잔류1(PID56288)을 실행기가 정리했다. 해당PID와 실행기5172는 최종조회에서없음, 두Chrome은HasExited=true다. 두임시프로필은 chrome_debug.log EBUSY로 완전삭제 미완료이며 browser-profile-cleanup.json에 정확경로를 남겼다. 사용자앱/브라우저·시스템설정 변경0. 영상은3200×900·20fps·401프레임·20.05초로 인코딩/추출프레임 직접확인 완료.


## 2026-10-30 승인 A2 조립 후보

최신 구현·수치·MAP PRODUCTION REPORT는 [A2 제작 SSOT](UNITY_KEYSHOT_A2_20261030.md)를 따른다. --unity-a2-forest 명시 활성화 후보이며 일반 게임 채택0. 10-31 재개는 최신공통a861d0303의 UI·진입·전사R5를 병합하고 검수된R3 17종/185파일을 정확 인수했다. R4 HOLD 인수0, Decals_blood 제외·수면반영·실제전사메시 크기검사 후보를 추가했다. 이전 독립C#0오류는 새소스에 소급하지 않으며 현재 Unity/GPU/1920시각/M1·공통/바로가기 미검증이다.

## 2026-10-31 A2 수로 구조 재작업

A2에서만 SourceMap 생성 시 선택적 additionalBlocked= A2ForestLayout.BlockedCore를 전달한다. Blocked·CanMove는 수로/거목, LineOfSight·ProjectileBlocked는 세 번째 SolidCore 콜백의 거목 경계를 쓰며, 원본 ch1_map byte와 비A2 생성자 호출의 동작은 보존한다. Core 변경은 없다. 수면·다리 수치와99910표본/101점 회귀 근거는 UNITY_KEYSHOT_A2_20261030.md가 SSOT다. A2 카메라만38°/18u/TargetOffset+(3,0,.6), 비A2 LOOK-001 그대로다. Editor 첫 화면은 FAIL이며 새 구조의 Player/GPU/M1은 미검증이다.

## R5 전달 이후 야간 한 건 — 중심형 강타 앵커

현재 상세SSOT는 `UNITY_HERO_VFX_CENTER_ANCHOR_20261031.md`다. 새 제품ccde13cb9·빌드b970760a, 실제전후/고정탄39표본씩·같은빌드M1aaf2078e23/23, 정확새Core독립11/11완료. 중심앵커오류수정/머리·견갑개선PASS, 전체전사/VFX아트RETOUCH. 하단수평잘림·흰arc파지가림및자연밀집전투/움직이는탄막미검증은남긴다. 기존R5완료M1재사용아님. 크기/알파/밝기/카메라·전투판정변경0. 최초실행실패/대조정리경고와재검증채택을분리보존하고자기예약반환. 공통반영·Desktop은별도실제영수증을확인한다. 기존파생521byte동일·빌드재생성씬1변경(이전byte백업누락/복구미완료)은상세SSOT와생성씬보존영수증에명시한다.

### A2 원본 진행 경로 보호

수로는 북동쪽으로 굽어 남동 고정앵글러(148,150)를 덮지 않는다. 기존 위치/전투/원본MapData는 유지하고, 새 수로/거목 경계만 SourceMap 선택 콜백으로 반영한다. 단순 출구 BFS에 더해 네 앵글러 모두300px 내 도달/시야를 검사했으며 현재20검사PASS다. 상세식·숫자·실제 현재화면 판정은 A2 SSOT를 따른다.

### 2026-10-31 A2 촬영·낮은 수로 회귀
A2 이전824b67a99 실제빌드599c790b/M1dab0f945 23단계 통과, 촬영adc6e95f 검정3장FAIL. 현재 URP SingleCameraRequest 촬영/평균휘도>.01 검정방지, 비활성스킨 측정 제외, 침식BankHeight2u/수면+.22u, 실제CC0PineRoots2종 및 지면접합 낙엽, Linear안개14~64u로 재작업. 현재 GPU/M1 증거로 이전빌드를 재사용하지 않음.
