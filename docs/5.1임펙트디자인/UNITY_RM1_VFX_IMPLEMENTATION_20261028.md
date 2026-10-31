# RM-1 VFX 통합 구현 기록 — 2026-10-28

## 2026-10-31 타격·스킬·탄막 r2 후보 — 실제 Player 재검수 전

| 범위 | 현재 후보·수치 |
|---|---|
| 브랜치·기준 | `codex/pc-impact-remaster-20261031`, 공통 `15c8ed3c522de317d22cdbfd185b1ceca494b56f`. 현행 실행 영웅 스킬 `PortedSkillIds` 5종 전체·기검참·독/가시/어둠 탄 표현을 연결. 미이식 스킬의 실행기 추가·완료 주장은 하지 않음 |
| 표현 정지 | `ImpactResponse`·`NativeGame.Impact`: 3D 월드와 XY 아레나 모두 일반55ms, 치명프로필75ms, 대검끝타/강타90ms. 타격한 적과 공격 중 영웅의 뷰만 유지. 영웅은 접점 포즈를 한 번 그린 뒤 유지하며 HD-2D 스프라이트 경로도 적용. 치명프로필은 아직 실제 이벤트 미연결. Core Tick/입력/피해/쿨다운/넉백/난수/저장·`Time.timeScale` 수정 없음 |
| 카메라·피격 | 방향성 반동 일반2.2px/치명프로필3.5px/강공4.5px·180ms감쇠·설정배율. 3D는 표시 marker, XY는 렌더 projection만 이동. AI 발사·루팅 콜백이 읽는 논리카메라 Transform 불변. 피격 틴트100ms 이내·Core넉백은 뷰정지 뒤 따라감. 전용 드루이드 sprite도 같은 피격 틴트·포즈 유지 경로 연결 |
| 접점·잔여 | `Resources/VFX/Impact/VFX_ImpactBurst.vfx`: 기존 RM1 그래프 기반 전용 자산·노출 프리셋, 코어 0.24/0.38m·`#fff4d0` HDR4, 파편 0.035~0.065/0.09m·방향 속도 2.8/3.8m/s, 먼지 0.5/0.8m·0.35~0.65초·알파0.14 |
| 예산·조명 | 같은 관찰 프레임 접점2, 같은 적 재발광 최소80ms, 효과 인스턴스8·최소재사용900ms, 국소 무그림자 라이트 동시2·100ms 이내·반경1.5/2.2m·초기강도2/3 |
| 그을음 | 전용 `SG_ImpactScorch.shadergraph`·참조 재질. 불규칙 알파와 알베도 분리·발광0·색 `#1b1410`, 반경0.28/0.5m, 동시8, 최대fade0.6·2초 수명·마지막1.2초 소멸. r2는 바닥+0.12m·깊이0.3m로 인물 투영 억제. 풀 재사용마다 라이트 반경·강도 갱신 |
| 비교 장치 | `--unity-impact-review`·`--unity-impact-baseline`, r2 1600×900·30fps 480장/16초·같은 입력 Core 추적 SHA. 일반공격/기검참 각120틱, 현행5스킬 각144틱·얼음보주110틱 Space 파쇄. 매 구간 실제 Core 탄3종 합성 배치·이동/수명도 추적. AI 중지·불사 표적 fixture이며 자연 플레이 증거 아님 |
| r1 실제 근거 | source `88ca4c3` → build `912c9e52` 성공/오류0 → Player MCP 파일·참조0(212파일/160DLL) → M1 `1d5bc9ab` PASS → 전후 `f8362a14`/`4f7c29d1` 각각12초. Core SHA `69cee82a…b2fb` 동일·피해50388 동일·접점50/생성46/최대입자65. 숨은Desktop 창노출0·잔류0·사용자세이브0. 연속120프레임에서 기존 큰 붉은 가시문양·두꺼운 기검참·밝은 얼음덩어리 결함 확인, r2 재작업. r1 전체스킬 아트 PASS 아님 |
| r2 검증 경계 | 독립계약428개 통과, 설치 Unity DLL 기준 runtime C# 오류0(기존경고437). 새 Lit Shader Graph·스킬 Graph·탄막·XY 아레나 표현은 정식 임포트/Player 미검증. r1 MCP `bd0ac1fe`와 r1 M1은 r2 검증을 대신하지 않음 |

M1 `07e`는 원래17발 분류(물리/입4·혜성7·원소보주6)를 유지한다. 새 표현이 실제로 그린 Core 탄 객체만 해당 분류에 더하고 기존 sprite 수와 합산한다. 없는 탄을 더하거나 기대17발/폴백0 기준을 낮추지 않는다. 새 Graph/물질·독/가시/어둠 표시 여부는 16초 별도 fixture에서 함께 검사한다.

### r2 스킬·탄막 표현 수치

새 경로는 `NativeSkillRemaster`가 읽기 전용으로 관찰한다. 비교 baseline 또는 자산 누락 시 기존 경로를 사용한다. 현행 HD-2D 인물/적 스프라이트 방향을 변경하지 않는다. `SG_SkillMatter`는 기존 Lit 그래프 구조 기반·거친 결/약한 발광 혈관·금속0/매끈함0.35, `SG_SkillGround`는 끊긴 불규칙 가장자리와 낮은 채움. `VFX_SkillMatter`는 별도 Graph 자산의 코어·파편·먼지 시스템, 팔레트/크기는 아래 읽기 전용 프리셋으로 공급한다. `ImpactSpace`는 3D 지형의 XZ·높이 또는 기존 XY 아레나의 발밑과 카메라 방향 높이로 위치·파편속도·물질회전을 변환한다. XY 바닥은 DecalProjector 대신 같은 색·낮은 채움의 투명 Lit `SG_SkillFloor` 쿼드로 표시한다(바닥 레이어 -19000, 그을음 -18999). 기존 아레나 sprite가 데칼을 받는다고 가정하지 않는다.

| id·대상 | 크기·형태 | 색·빛·잔상 |
|---|---|---|
| `spikeTrap` 가시덫 | Core `z.R/100` 안 18개 가시, 황금각137.5도·면적균등 배치, 12틱 전개·마지막30틱 축소. 폭0.22m·높이0.28/0.46/0.64m | 목질 `#30281b`/끝 `#b3a17c`, glow0.12, 바닥fade0.2·발광0. 붉은 원화 문양 사용 안 함 |
| `holyDome` 회복영역 | Core `z.R/100`, 15틱 전개, 작은 결정7개·0.045m, 마지막30틱 소멸 | 녹색 계약 유지 `#627548`/`#b6d58b`, glow0.5, 바닥fade0.11·가장자리발광0.03. 큰 네온 원판 억제 |
| `giantSlam` 지옥강타·E 강타 | 웹 sprite 외곽 지름 `MaxR*0.9*(0.72+0.28*min(1,progress*3.5))` 보존. 둘레 파편14개·0.12~0.20m, 진행 끝0.38 구간 소멸 | 흙 `#393026`/뼈 `#c3a87a` 또는 E회청 `#91a7ac`, glow0.1·바닥fade0.28. 시작20%만 따뜻한빛·강도최대2·반경최대4m. `gSlamWindup`의 실제 접점에도 뷰정지 |
| `iceOrb` 얼음보주 | Core·웹 R식 유지. 반경1.45R 궤도 결정14개·0.10×0.28~0.46×0.12m, 웹6.6R 외곽 안. Core 파쇄로 생긴 blade는0.11×0.4×0.11m | `#4f6c75`/`#b7d1d2`, glow0.38. 바닥fade0.08·가장자리0.08·빛반경1.8m/강도0.45. 인물·탄이 보이는 빈 중심 |
| `fireball` 악의구 | Core R에 따라 조각5개, 궤도0.5R·폭0.65R/높이1.2~1.68R, 웹지름5R 안. 실제 폭발 이벤트 반경으로 먼지폭최대1.8m | 어둠 `#28232f`/`#c5bad4`, glow0.65·빛반경1.1m/강도0.5. 폭발 `#e4dcf4`→`#6a6381`→`#211d2b` |
| 기검참·충전 | 1/2타192px·3타252px×Core ChargeScale 외곽, ±1.3rad 얇은 초승달·최대두께외곽의0.025. 충전40틱마다3단계 작은결정 크기0.045→0.1m | 뼈 `#9c978b`/`#ede8d8` glow1.5, 큰5겹 흰 원화 대신 물질 경계. 코어 판정/수명 불변 |
| 적 독·가시·어둠탄 | Core R→0.045~0.3m 표시반경. 독·어둠은5조각, 가시는3개 방향성 파편. 물리탄 분류 우선, 독은전용우선. mine/friendly/blue/black/bw bean·나머지원소탄 기존경로 | 독 `#28301c`/`#c8d999`, 가시 `#352b1c`/`#e0cf9c`, 어둠 `#211d2c`/`#c7bed9`. glow0.9/0.35/0.9. Q/E 패링계약·탄 이동·피해 불변 |
| 공통예산 | 활성핸들96·넘친 적탄은 기존 표시 유지, Graph풀12·재사용0.8초, 프레임당이벤트6·Graph 잔여0.8초, 스킬라이트동시2·바닥법선방향 높이0.75m | 코어HDR1.5·코어크기프리셋×0.24·파편0.06~0.12×size, 먼지size×0.8·0.24~0.5초·알파0.02~0.14. 스킬별재발생0.12~0.36초, 강타1회 |

출력·실패 원본: `I:/EXODUSER-Storage/demo-art/impact/`. 실제 영상 판정 전 제품 PASS·MERGE_READY·바탕화면 갱신으로 보고하지 않는다. 브리프의 최종 전체 범위와 지정 통합 담당의 권한은 유지한다.

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
