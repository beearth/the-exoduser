# UNITY RM-INT — 리모델 3D 씬 런타임 연결 (1단계: RM-1 필드) — 2026-10-28

## 2026-10-31 초광폭 화면 경계 보정 — Player 검수 대기

사용자 world-ultrawide 추가 지시로 화면 기반 사격·루팅은 기존 논리2D 카메라 대신 실제 HudCamera(2D/리모델3D)의 viewport를 따른다. NativeGame.WorldViewport의 WorldPointVisible은 Core margin을 네 모서리로 투영한다. FieldEnemyCanShoot는−64px(모두 안), IsLootOnScreen은0px다. 사격·수거·어그로 거리 수치와 저장 구조는 그대로다. DruidBoss.WorldPointVisible 선택 callback만 Core에 추가하여 일반 투사체가 기존 거리제곱6250000 밖에서도 화면 R+100px에 보이면 유지하며, null/offscreen·지뢰·빨콩·강제만료는 기존 계약을 보존한다. 실제Core/청크 회귀2364 PASS, 정식 새 Player/M1/4해상도 화면은 미검증이다. 상세 현행 계약은 UNITY_UI_ULTRAWIDE_20261031.md를 따른다. 아래2026-10-28의 Core무변경·항상2D 설명은 최초 연결 이력이며 위 경계는 후속 보정이다.

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
| `NativeGame.cs` | `Point` → `NativeRemodel3D.Point`, `ToGUI`·레벨업 폭발은 `HudCamera`, 마우스 조준은 `AimWorld()`, `IsLootOnScreen`은 초기 Point2D였으며 2026-10-31 실제 HudCamera/WorldPointVisible(0)로 보정, 실행 인자 한 줄 |
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
| 2D 카메라 `view` | 지우지 않는다. 카메라 클램프·보스 줌 같은 **논리 카메라**로 갱신되고(`FieldEnemyCanShoot`은2026-10-31 실제 HudCamera로 분리), 3D가 켜진 동안 컬링 마스크 0으로 화면만 지우는 역할을 한다. 로비가 월드를 숨기는 마스크는 3D 카메라가 따라 한다 |
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

## R5 전달 이후 야간 한 건 — 중심형 강타 앵커

현재 상세SSOT는 `UNITY_HERO_VFX_CENTER_ANCHOR_20261031.md`다. 새 제품ccde13cb9·빌드b970760a, 실제전후/고정탄39표본씩·같은빌드M1aaf2078e23/23, 정확새Core독립11/11완료. 중심앵커오류수정/머리·견갑개선PASS, 전체전사/VFX아트RETOUCH. 하단수평잘림·흰arc파지가림및자연밀집전투/움직이는탄막미검증은남긴다. 기존R5완료M1재사용아님. 크기/알파/밝기/카메라·전투판정변경0. 최초실행실패/대조정리경고와재검증채택을분리보존하고자기예약반환. 공통반영·Desktop은별도실제영수증을확인한다. 기존파생521byte동일·빌드재생성씬1변경(이전byte백업누락/복구미완료)은상세SSOT와생성씬보존영수증에명시한다.

### 중심 앵커 후속 공통 반영·실행본 전달 완료

지정 통합 담당이 expected968f2a324에서 bf9b2d25c28a44d4a90e8f2017a27f8d5f657394로 비강제FF했고원격SHA를읽어대조했다. 제품ccde13cb9와공통Unity tree동일, 새빌드b970760a·M1aaf2078e/실제3바이너리동일로 COMMON_RULES의유효검수재사용을적용했다. 새통합빌드/추가M1반복0이다.

일반Desktop은 `I:/EXODUSER-Storage/demo-art/hero/night-anchor-20261031/build/EXODUSER-Unity.exe`, 인자 `-force-d3d11 --remodel3d`, 작업폴더는EXE부모·아이콘EXE,0이다. 이전게임대조소스bce000073이현재제품조상임을확인한뒤현재링크SHA를CAS검사하고이전링크동일byteI백업→전달→별도PowerShell프로세스4속성/Runtime·Core·EXE SHAreadback을완료했다. 앱자동기동/사용자세이브쓰기0. 근거 night-anchor-20261031/validated-adoption.json·desktop-delivery.json·desktop-readback.json. Mac실제반영/실행은pending, 전체아트RETOUCH및위생성씬이전byte복구미완료는유지한다.
