# RM-1 VFX 통합 구현 기록 — 2026-10-28

기준: `UNITY_RM1_VFX_SPEC_20261027.md` v2.1 §3.1·3.2·§7, `VFX_LEAD_MASTER_20261026.md` §2.7. 이 기록은 Unity 후보 브랜치의 실제 표현 코드 상태를 설명한다. Core 판정·피해·속도 수치는 변경하지 않았다.

## 소유 파일과 연결 상태

| 항목 | 코드/에셋 | 현재 상태 |
|---|---|---|
| 기검참 그래프 | `unity/Assets/Exoduser/Resources/VFX/RM1/VFX_KiSlash.vfx` | 생성됨, Unity 임포트·실화면 미검증 |
| 그래프 생성기 | `unity/Tools/vfx_rm1/gen_vfx_ki.py` | Unity 17.6 패키지 템플릿 기반, YAML 참조·흐름 오프라인 검증 |
| 기검참 뷰 | `unity/Assets/Exoduser/Runtime/Vfx/KiSlashVfxView.cs` | `Bind(Simulation)`·`Handle(FeedbackEvent)`·`Update()` 및 3타 그을음 데칼 구현, NativeGame 연결 전. 생성자에 RM-1 `SG_GroundDecal` Material 전달 필요 |
| 좌표 어댑터 | `unity/Assets/Exoduser/Runtime/Vfx/VfxWorld.cs` | Core px → `(x/100, 0, -y/100)` XZ. `RemodelWorld`가 unity/main에 들어오면 지형 높이 API로 교체할 TODO |
| 독 폭발 브리지 | `unity/Assets/Exoduser/Runtime/Vfx/VfxBridge.cs` | 기존 A/B 신호와 그래프는 유지, 월드 배치만 `VfxWorld` 경유. NativeGame 연결 전 |
| Player 검수 장치 | `unity/Assets/Exoduser/Runtime/NativeGame.VfxCheck.cs` | `VfxCheck(bridge, ki, renderCamera)` 작성, `--unity-vfx-check` 진입 연결 전. RM-INT가 3D 카메라를 전달해야 실행 가능 |

## 기검참 실제 구현 수치

| 대상 | 이벤트/속성 | 수치·색 | 적용 위치 |
|---|---|---|---|
| 명중 코어 | `OnKiHit`, `CoreSize`, `CoreGradient` | 1타 0.24m, 2타 0.28m, 3타 0.36m × Core `ChargeScale`(tier 0~3 = 1/1.4/1.8/2.2). `#fff4d0` 선형 HDR ×4. 수명 0.25초, 크기 정점 수명 15%(60Hz 약 +2.25틱), 알파 정점 16%(약 +2.4틱), 40% 시점 0.225 | `KiSlashVfxView.Handle`, `gen_vfx_ki.py` |
| 명중 조각 | `OnKiHit`, `ShardSize`, `ShardVelMin/Max`, `ShardGradient` | 8개, 0.12m × `ChargeScale`, 0.08~0.20초, 속도 방향 정렬. 은·뼈색 `#efe6d2` → `#9a8a72` | 같은 파일 |
| 이동 궤적 | `OnKiTrail`, `TrailSize`, `TrailGradient` | Core 투사체마다 별도 `VisualEffect`, 매 틱 스트립 점 1개, 1스트립 16점, 점 수명 0.12초, 폭 `min(0.09m, 0.07m × ChargeScale)`. 앞날 HDR 뼈금 → 후미 바랜 뼈색 | `KiSlashVfxView.Update`, 그래프 strip context |
| 충전 섬광 | `OnKiCharge`, `CoreSize` | Core의 `KiChargeFlash`에서 0.18m, 3타 tier 3 신호만 사용 | `KiSlashVfxView.Handle` |
| 3타 바닥 자국 | `SG_GroundDecal` `_Shape=2` | 길이 1.5m × `ChargeScale`, 반폭 0.08m × `ChargeScale`, `_EdgeGlow=0`, 뼈금 `#9a8a72`·그을음 `#2a2220`, fade 최대 0.42, 90틱(1.5초), 동시 8개 | `KiSlashVfxView.SpawnScar/UpdateScars` |
| 위치 | 이벤트 `position` | Core `(X,Y)` → `VfxWorld.ToWorld(X,Y,0.25m)`; 독 폭발도 동일 좌표 어댑터 경유 | 두 뷰·브리지 |

그래프는 `CoreGradient`, `ShardGradient`, `TrailGradient` 등 8개 속성을 노출한다. 그래프가 읽는 이벤트 attribute는 `position`이며, 방향·tier 크기는 C#이 해당 인스턴스의 노출 속성으로 설정한다. 드루이드 텔레그래프 3종과 독액 기포의 추가 구현은 별도 잔여 범위다.

## 검증 경계

| 게이트 | 결과 |
|---|---|
| 그래프 생성 재현 | 2회 동일 SHA256, YAML 183문서·노출 속성 8개·구조 오류 0 |
| 정적 소스 점검 | `git diff --cached --check` 통과, Roslyn C# 구문 오류 0(`nostdlib` 파싱 검사이며 Unity 타입 컴파일 증거 아님), Core·기존 `NativeGame.cs` 수정 없음 |
| Unity 6000.6.7f1 임포트/컴파일 | 미실행. 타인 Unity 프로세스가 실행 중이고 사용 가능 메모리 18.9GB로 순번 조건 20GB 미달 |
| RM-1 샌드박스 비교 | 미실행 |
| `--remodel3d` Player 1920×1080, 적 탄막 겹침, 1x 크롭 | 미실행. `RemodelWorld`/3D 카메라와 NativeGame 진입 연결이 unity/main에 필요 |
| 완료 정의 6단계 | ① 최신 unity/main 병합만 수행, 빌드 영수증 없음. ②~⑥ 미완료. `VISUAL VERDICT: PENDING` |

`VfxCheck`는 A에서 Core 독 탄 3발 착탄·웅덩이 1·추적 장판 1을 검수용 상태로 주입하고 독 탄 3발을 화면에 남긴다. B는 `SetMagicInput`으로 실제 `MaliceOrbBlasts` 증가를 기다린다. 기검참은 Core `SpawnKiSlash` 검수 API로 1/2/3타와 3타 충전 40/80/120틱을 만들고 실제 적 명중 `FeedbackEvent`를 확인한다. 각 신호 뒤 2/4/6/12/21틱에 1920×1080 원본과 400×400 1x 크롭을 저장한다. 이 장치는 아직 실행되지 않았으며, A의 검수용 주입은 자연 플레이 재현의 증거가 아니다.

## 다음 통합 순서

1. RM-INT 1단계가 `unity/main`에 들어오면 VFX 브랜치에 최신 `unity/main`을 비강제 병합하고 `VfxWorld.ToWorld`만 `RemodelWorld.ToWorld`로 전환한다. RM-INT 작업 브랜치 자체를 합치지 않는다.
2. Unity 순번·메모리 조건을 확인한 뒤 그래프 임포트, 컴파일, RM-1 샌드박스 비교 캡처를 실행한다. 오류가 나면 원인 수정 뒤 1회만 재시도한다.
3. 병합 전 Player 빌드 영수증을 유니티 통합 담당에게 전달한다. 통합 후 실제 GPU Player와 `--remodel3d` 1x 화면에서 웹 기준 크기·톤·탄막 가시성을 판정한다. 캡처에는 적 독 탄이 겹친 장면을 포함한다.
