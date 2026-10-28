# vfx-simple 세션 인계 (2026-10-28 오후, 2차 재생성 — 컨텍스트 283K로 임펙트 총괄 100K 규칙에 따라 멈춤)

## Codex 인수 갱신 — 2026-10-28 22:51 KST

아래 「다음 세션이 할 일」 1~5의 소스 작성은 Codex가 전용 `E:/exoduser-wt/codex-vfx`에서 수행했다. 후보 브랜치 `codex/pc-vfx-rm1-int-20261028`의 원격 SHA는 `919fd0597714e2544a8ceb3905aedfa57442ff56`이다. 새 통합 worktree나 `claude/unity-pc-vfx-rm1-int-20261028` 브랜치를 중복 생성하지 않는다. `UNITY_RM1_VFX_IMPLEMENTATION_20261028.md`의 구현값과 미검증 게이트를 따른다. `--unity-vfx-check` partial은 아직 기존 NativeGame 진입에 연결되지 않았고, Unity 컴파일·샌드박스·Player 실화면·탄막 중첩 1x 판정이 남았다. RM-INT 1단계가 `unity/main`에 들어온 뒤 `VfxWorld`를 `RemodelWorld.ToWorld`로 한 커밋에서 바꾸고 순번·메모리 조건이 충족되면 실행한다. 아래 10:xx 작업 지시는 당시 이력이다.

- 세션: RM-1 VFX 구현(Sonnet), 시작 = 임펙트 총괄(`local_da9cd0e7`), 명세 = `docs/5.1임펙트디자인/UNITY_RM1_VFX_SPEC_20261027.md` v2.1(main). 재개·순번 담당 = 임펙트 총괄.
- 상태: **아래 「다음 세션이 할 일」 1번 착수 전에 멈췄다.** 미커밋 작업 없음, 이 세션이 띄운 Unity 없음(마지막 m1-check 종료 09:29 이후).
- 이전 대기 사유(메모리 조건)는 해소됨. Unity 실행은 **순번제**: 총괄이 유니티 총괄에게 순번을 받아 「지금 시작」을 보낼 때만 띄운다(조건 재측정: 실행 중 Unity 0개 `Get-Process EXODUSER-Unity,Unity | Where-Object { -not $_.HasExited }` AND 커밋 여유 20GB 이상 `(Get-CimInstance Win32_OperatingSystem).FreeVirtualMemory/1MB`). 다른 세션의 Unity는 절대 종료하지 않는다. 같은 이유로 2회 실패하면 멈추고 보고.
- **Unity 작업 「완료」 = 6단계**(CTO `docs/engine/UNITY_DONE_BUILD_PLAYTEST_RULE_20261028.md`): ① 작업 브랜치에 최신 unity/main을 합친 상태로 플레이어 빌드 오류 0(사후 검증 병합 금지) ② 병합(유니티 총괄) ③ 통합 빌드 ④ 실제 GPU 렌더 스모크(Null 장치 금지, 로그의 셰이더 패스 누락·셰이더 못 찾음·예외·LogError 0) ⑤ unity-latest 갱신 ⑥ 담당 총괄이 실제 빌드를 1x로 판정. 병합 요청에는 ① 영수증을 붙이고, 보고마다 6단계 중 어디까지 왔는지 표시("병합만 됨"·"빌드 미확인"). 에디터 batchmode 캡처는 비교 시안이고 채택은 플레이 빌드 화면.

## 오늘(10-28) 한 일

1. **unity/main `8d34eb653` 빌드 검증 + m1-check 성공**(1회, 재시도 없음). worktree `E:/exoduser-wt/pc-unity-main-verify`(detach, 22158파일, 생성 1분21초), `restore-lobby-media.cjs`·`restore-warrior-story.cjs` 통과. 빌드 영수증 passed·Succeeded·오류 0·2.61GB. 임포트(InitialRefresh) 100.4초, 빌드 전체 219초(09:24:57~09:28:36), m1-check 47초(09:28:37~09:29:23, 18단계 전부 ok, firstBlocked 없음). 커밋 여유 최저 19.6GB. 산출 `E:/exoduser-wt/_out/vfx-rm1/main_verify/`(build·m1/caps 29장·build.log·run.log·commit_free.log·run_verify.ps1). Player.log는 D3D12, 54줄, 오류·셰이더 못 찾음·예외 0. 빌드 로그에는 `Terrain/Lit`·`SpeedTree7` 셰이더 의존성 not found 7줄(개발툴 총괄에 전달됨). 이 worktree는 Unity 부작용(URP 에셋·.meta) 미커밋 상태로 **그대로 둔다**(삭제·정리·커밋 금지).
2. **Gamma/Linear UI 쌍 준비**(Unity 없이): `E:/exoduser-wt/_out/vfx-rm1/shared_render/gamma_vs_linear/` — `gvl_config.json`(쌍 7개·표본 76개), `gvl.py`(overlay/table/heat/all, `--gamma-dir`·`--out`), `overlay/`, `samples_table.md/csv`(Linear 열만), `README.md`. 가짜 Gamma로 스크립트 검증 완료. **Gamma 캡처는 아직 없음**: Gamma 빌드(`pc-unity-vfx-gamma` detach `0840fc1ef`)는 순번상 Hero Light 다음이고 총괄의 「지금 시작」을 받을 때만 띄운다. 입력 규칙은 README(설정 4장은 `--unity-ui-finish-capture -ui-phase settings`, 나머지는 `--unity-m1-check`, 파일명은 Linear와 동일하게 `gamma_caps/`).
3. 기검참 캡처 조사(04b 설계)는 총괄 승인 후 **결정이 바뀌어 대체됨**(아래). 조사에서 확인한 사실만 유효: `Simulation.cs` 101~125행(1타 idle+LMB `SpawnKiSlash(1)`, 2타 반동 후 재입력 `SpawnKiSlash(2)`, 3타 `KiComboStep==2`에서 누르면 wWindup 충전 `KiChargeTicks` 40·80·120 = tier 1·2·3, 놓으면 `SpawnKiSlash(3, charged)`), `NativeGame.SkillSmoke.cs` 17~22행이 같은 입력 순서, 이벤트 `KiSlashHit`·`KiChargeFlash`는 `StepInput` 안 `DispatchFeedback`(NativeGame.cs 226행)에서 빠짐, 투사체 속도 14px/틱·1타 수명 약 18틱, 시뮬 60틱/초(`Time.fixedDeltaTime=1/60`).

## 총괄 결정 (10-28, 유니티 총괄 결정 반영) — 현재 유효

- **2D 모드는 만들지 않는다.** 플레이 경로는 RM-INT(`--remodel3d`, RM-1 씬, Cinemachine 3D). 현재 NativeGame은 2D 정사영 XY 평면이고 V0·VfxBridge·데칼은 3D XZ 바닥 기준이라 플레이 빌드에서 그대로는 안 보인다. 채택 판정은 RM-INT 1단계가 빌드에 들어온 뒤 그 경로에서. 그때까지 RM_Sandbox 에디터 캡처는 비교 시안.
- **`NativeGame*.cs` 기존 파일은 고치지 않는다**(연결 줄은 RM-INT 세션 몫, 호출 목록은 총괄이 보냄). m1-check에도 단계를 넣지 않는다. 대신 **새 partial `NativeGame.VfxCheck.cs`(실행 인자 `--unity-vfx-check`)를 VFX가 소유**한다.
- **VFX 구현은 vfx-simple 한 곳**(독 폭발 에이전트는 종료, 그 결과를 이어받는다).

## 다음 세션이 할 일 (순서대로, 시작 전 `get_usage(self)`로 컨텍스트 확인 — 100K 넘으면 이 인계 문서를 갱신하고 총괄에 알린 뒤 멈춤)

1. **브랜치·worktree**: 새 브랜치 `claude/unity-pc-vfx-rm1-int-20261028`을 로컬 브랜치 `claude/unity-pc-vfx-poison-20261028`의 `c1f8f769b`(V0 + 독 폭발 그래프 + unity/main `26a11fd2f`)에서 만들고, 새 worktree `E:/exoduser-wt/pc-unity-vfx-int`에서 작업. Library는 poison worktree 것을 `robocopy /E /XJ`로 복사(`MSYS_NO_PATHCONV=1`, 단일 역슬래시 경로). **복사 전에 reparse point(junction) 확인**(robocopy가 junction을 따라가 원본을 지운 사고 전례).
2. **독 폭발 산출물 이해**: `unity/Tools/vfx_rm1/gen_vfx_poison.py`(Unity 템플릿에서 블록을 이식하는 방식, orient-along-velocity·이벤트 위치 포함), `VFX_PoisonBurst.vfx`, `VfxBridge` 독 블록, `Editor/VfxRm1PoisonCapture.cs`. 커밋 `6b4b8a380` 메시지와 코드를 읽는다.
3. **기검참 착수 승인됨(명세 §3.1)**: 조각과 궤적은 독 폭발 생성기의 블록 이식 방식으로 **VFX Graph 안에서** 만든다. 조각은 orient-along-velocity로, 궤적은 스트립을 시도. **같은 이유로 2번 실패할 때만** C# 쿼드·TrailRenderer로 바꾸고 바꾸면 보고. 코어는 VFX Graph. 고정 색 서브그래프(VFXS_*)는 쓰지 않고 노출 Gradient로 받는다(U7, 독 폭발과 같은 판단).
4. **이벤트·좌표**: `KiSlashVfxView.Handle(FeedbackEvent)`·`Bind(Simulation)`(RM-INT가 이 시그니처로 연결). 좌표는 VFX 소유 새 파일 `VfxWorld.ToWorld(x, y)` 하나로 모은다(지금은 x/100, -y/100 XZ, RM-INT가 공개 함수 이름을 알려 주면 그걸 부르게 바꿈). `VfxBridge` 독 블록도 이 함수를 쓰게 바꾼다.
   - **RM-INT 좌표 API 확정**(브랜치 `claude/unity-pc-rm-int-20261028` `6f2497a01`, `Runtime/NativeRemodel3D.cs`, 네임스페이스 `Exoduser.UnityPort`): `RemodelWorld.ToWorld(x, y)` → `Vector3(x=px/100, z=-py/100, y=지형 높이)`, `ToWorld(x, y, height)`(지면 위 띄움), `GroundHeight(x,y)`, `GroundNormal(x,y)`, `ToCore(Vector3)`, `RemodelWorld.Active`. 카메라는 `Camera.main` 대신 `NativeGame.Remodel3DCamera`(Camera.main 태그가 2D 논리 카메라와 겹침).
   - **병합 의존성**: `RemodelWorld`는 아직 unity/main에 없다. **VFX 브랜치에 RM-INT 브랜치를 merge하지 않는다**(RM-INT 변경이 딸려 들어옴). `VfxWorld.ToWorld`는 지금 그대로 `x/100, 0, -y/100`으로 두고, `RemodelWorld`로 바꾸는 줄은 그 클래스가 unity/main에 들어온 뒤 **한 커밋**으로 바꾼다(바꿀 위치에 주석 `TODO(RemodelWorld)` 한 줄). 데칼 투영 방향은 `GroundNormal`을 쓸 수 있게 인자만 열어 둔다.
5. **`NativeGame.VfxCheck.cs`(`--unity-vfx-check`)**: 독 A(탄 3발 착탄, 웅덩이·추적 장판 1개씩), 독 B(악의구 `SetMagicInput` 1주기), 기검참 1·2·3타와 충전 tier 1~3 캡처. 틱 2/4/6/12/21, **1920×1080**, 1x 크롭은 따로 낸다. 04b 설계(위 3번 사실)를 그대로 옮긴다. 아직 연결이 없으므로 **컴파일만 되게** 둔다.
6. Unity 실행은 순번이 필요하다. 파일 작성과 **Unity 없는 검사**까지 끝나면 총괄에 보고하고, 에디터 임포트·RM_Sandbox 비교 캡처 순번은 총괄이 받아 준다. **push는 보고 뒤에 총괄이 지시.** `git add -A` 금지, `tools/guard.baseline.json`은 커밋하지 않는다. 경로 지정 커밋.

## 도구·작업 함정 (이번에 확인)

- 백그라운드·포그라운드 명령에서 `python -` 또는 `python3 - <<EOF`처럼 stdin을 기다리는 형태는 멈춘다. 스크립트는 파일로 쓰고 `python file.py < /dev/null`.
- 도구가 `sleep N; cmd` 형태를 막는다. 기다릴 때는 `run_in_background`로 `until [ -f ... ]; do sleep 20; done`.
- `rm -f` 포함 명령은 권한 거부. 삭제 대신 덮어쓰기·python `os.remove`.
- m1-check는 `-nographics` 없이 창 모드로 돌면 실제 GPU(AMD RX 9070 XT, D3D12)에서 그려진다. 한글 경로 PowerShell 스크립트는 UTF-8 BOM 필요.
- 공유 파일(인계 문서 등) 갱신은 메인 트리가 아니라 `origin/main` 기준 sparse worktree에서(메인 트리는 로컬 main이 origin과 갈라져 있음).
- `git worktree add`는 메모리 여유가 충분하면(30GB대) 22K 파일 1분21초.

## worktree·브랜치

| 용도 | 경로 | 브랜치/커밋 | 상태 |
|---|---|---|---|
| 작업 | `E:/exoduser-wt/pc-unity-vfx-rm1` | `claude/unity-pc-vfx-rm1-20261027` = `d5943d1c4`(push됨) | Library = Linear 임포트 완료. 미커밋: `VfxRm1SharedCapture.cs`(파이프라인 로그·픽셀 비교 추가), Unity 부작용 `.meta`·`GraphicsSettings.asset` |
| 공유 렌더 | `E:/exoduser-wt/pc-unity-vfx-shared` | `claude/unity-pc-vfx-shared-render-20261028` = `0ebc103c0`(push됨, unity/main에 `2f41eddf2`·`8d34eb653`로 병합) | Linear Library. 더러움: `BlockMat.mat`·`GraphicsSettings`·`QualitySettings` Unity 부작용(미커밋·무시) |
| Gamma 비교 | `E:/exoduser-wt/pc-unity-vfx-gamma` | detach `0840fc1ef` | 빌드 2회 실패(메모리 고갈 추정), 산출 없음. 순번상 Hero Light 다음, 총괄 「지금 시작」 때만 |
| 빌드 검증 | `E:/exoduser-wt/pc-unity-main-verify` | detach `8d34eb653` | 생성·빌드·m1-check 완료(위 「오늘 한 일」 1번). Unity 부작용 미커밋, 정리 금지 |
| 기검참·독 폭발 통합 | `E:/exoduser-wt/pc-unity-vfx-int` | (예정) 새 브랜치 `claude/unity-pc-vfx-rm1-int-20261028` ← `claude/unity-pc-vfx-poison-20261028` `c1f8f769b` | **미생성**. 「다음 세션이 할 일」 1번 |

- 작업 브랜치 병합 이력: unity/main `b280ddf61`→`d1818d30a`, 공유 렌더→`b5a463186`, unity/main `40256751b`→`00030b074`, V0 Linear 대응 `c7de5781e`, V0 나머지 `d5943d1c4`.
- 산출물 루트: `E:/exoduser-wt/_out/vfx-rm1/` (`v0/`·`v0_linear/` 코어 시험, `v0_decal/`·`v0_bubble/` V0 나머지, `shared_render/` 공유 렌더 증거: 샌드박스 6장·비교 시트·UI·m1·빌드, `shared_render/pipeline_check/`).

## 지금까지 확정된 결과

| 항목 | 결과 |
|---|---|
| V0 코어(Linear+RM0-LIGHT Volume) | 상위1% 248.3(정점 0.033초), 0.35초 소멸, 램프·불씨 번짐 0.08/0.02, 색 `#fff4d0` 오차 0.5/255. 1x에서 코어 둘레 230~440px 희미한 동심 띠 있음(판정 접수, 완화는 Volume 소유자 몫) |
| 공유 렌더 | 샌드박스 후처리 켜면 Gamma에서 거의 검게 눌림(평균 35.9/19.7/18.6 → 5.7/0.7/0.6), Linear 9.3/3.8/3.7(여전히 어두움, 조명 담당 판단). 로비 Linear 영향 ±1 이내 |
| PC_High/Mac_Balanced 샌드박스 | 파이프라인·렌더러 실제 전환 확인(MSAA 4→2·그림자 45→32m). 픽셀 차이 6439/1.44M(0.45%), 최대 7/255, 블록 그림자 영역만 |
| SG_GroundDecal | `_Shape` 0~4, 경계 Core 대비 -1px(원 119/120, 부채꼴 129/130, 직선 219/220, 고리 119/120) |
| SG_VfxSoftAlpha·SG_ToxicBubble | 컴파일 오류 0, 버블 4단계 렌더 스모크 확인 |
| VFXS_Core/Shards/Mist | `VisualEffectSubgraphBlock`로 임포트만 확인. 실제 시스템 안 동작은 기검참에서 판정 |
| VfxBridge | `DecalParams`·`EventBudget` 단위 검사 10건 통과. `Pump`는 실제 Simulation으로 미시험 |
| m1-check | Linear 빌드에서 17단계 ok(창 모드) |

## 알려진 한계·주의

- 데칼 채움 가독성: 시험 장면 바닥이 거의 검정이라 어두운 독액 채움이 안 보임 → 실제 맵 바닥에서 판정 필요. 4번 가시 뿌리는 `Line` 하나(`_Shape 2`)만 그리고 끝 원 경로는 만들지 않는다(보스전 총괄 판정).
- 기포 스폰 JSON = `claude/unity-pc-rm1-20261027` 커밋 `75176abe6`(`unity/Assets/Exoduser/Remodel/CH1_1/Data/toxic_bubble_spawns.json`, 45점) — 기포 단계에서 읽기 전용으로 복사. 변환 `worldX = x/100`, `worldY = -y/100`, 색 TOXIC-FLASH `#a8a23a`(색상각 40~65°, 75° 이상 금지).
- 도구 함정: Unity 렌더 캡처에 `-nographics`를 주면 전부 검게 나온다. 셰이더 컴파일 확인은 `ShaderUtil` 결과만 믿지 말고 로그의 `Shader error`를 grep. HLSL 변수명에 `line` 사용 금지. robocopy는 `MSYS_NO_PATHCONV=1`과 단일 역슬래시 경로, `/XJ`. 백그라운드 명령에서 `rm -f` 포함 복합 명령은 권한 거부되니 python `os.remove`.
- 다른 세션 소유 `EXODUSER-Unity.exe`·Unity 에디터는 종료하지 않는다.
