# vfx-simple 세션 인계 (2026-10-28, 임펙트 총괄 지시로 재생성)

- 세션: RM-1 VFX 구현(Sonnet), 시작 = 임펙트 총괄(`local_da9cd0e7`), 명세 = `docs/5.1임펙트디자인/UNITY_RM1_VFX_SPEC_20261027.md` v2.1(main). 재개 담당 = 임펙트 총괄.
- 대기 사유: PC 메모리 조건 미달(커밋 메모리 여유 20GB 미만·Unity 동시 실행). 작업은 전부 멈춤, 폴링 금지, 임펙트 총괄이 다시 지시할 때까지 시작하지 않는다.

## 재개 순서 (조건: 실제 실행 중인 Unity 0개 + 커밋 여유 20GB 이상. 개수는 `Get-Process EXODUSER-Unity,Unity | Where-Object { -not $_.HasExited }`)

1. **unity/main `8d34eb653` 빌드 검증**(유니티 총괄 요청)
   - worktree `E:/exoduser-wt/pc-unity-main-verify`를 detach로 받는다. 이전 시도는 `git worktree add`가 `packfile ... cannot be mapped: File too large`(커밋 메모리 고갈)로 실패해 **아직 만들어지지 않았다**.
   - 빌드 전에 `unity/Tools/restore-lobby-media.cjs`, `restore-warrior-story.cjs`를 `C:\nvm4w\nodejs\node.exe` 전체 경로로 `unity` 폴더에서 실행(로비 영상은 git 조각에서 조립).
   - `PortVerification.Build -buildTarget Win64 -output <dir> -receipt <file>` 1회. Library 생성·텍스처 임포트 시간을 단계별로 기록, 커밋 메모리 여유는 1분 간격 로그(백그라운드 PowerShell 한 줄, 끝나면 종료). 실패하면 원인 수정 후 1회만 재시도, 또 실패하면 멈추고 보고.
   - 성공하면 `--unity-m1-check -output <dir>` 1회(창 모드, 플레이어 실행. 끝난 뒤 내가 띄운 `EXODUSER-Unity.exe`만 종료). 산출 = `E:/exoduser-wt/_out/vfx-rm1/main_verify/`.
2. **Gamma/Linear UI 쌍**(웹 대조는 **포트 3341**, UI 세션 소유·재시작 금지. 3333은 147커밋 뒤처진 옛 화면이라 쓰지 않는다)
   - `0840fc1ef`(후처리만, Gamma) worktree `E:/exoduser-wt/pc-unity-vfx-gamma`(detach, Library 복사됨, Gamma 재임포트 중 두 번 실패: 오디오 임포트 예외·시작 세그폴트. 둘 다 메모리 고갈 추정). 빌드 후 로비·설정 0~3탭(1600×900)·1-1 진입(02)·드루이드 웅덩이(11c) 캡처.
   - 비교 대상 Linear 캡처는 이미 있음: `E:/exoduser-wt/_out/vfx-rm1/shared_render/ui/`(설정 `unity-settings-N-1600.png`), `shared_render/m1/caps/`(`01`·`02`·`11c`는 1920×1080). 표본 RGB 표 + 차이 히트맵 1장(반투명 패널·글자 색·버튼 알파 위주) → `shared_render/gamma_vs_linear/`.
3. **기검참**(명세 §3.1·§5)
   - 병렬 세션(독 폭발 A/B, 별도 브랜치)이 `VfxBridge.cs` 독 폭발 블록과 `gen_vfx_poison.py`를 맡으므로 **`VfxBridge.cs`를 고치지 않는다.** 기검참 연결은 새 파일 `Runtime/Vfx/KiSlashVfxView.cs`(FeedbackEvent 사본 + `Simulation.Projectiles`)에서. 생성기는 `gen_vfx.py`에 기검참 함수만 추가(기존 공통 함수 시그니처 불변).
   - 설계안(임펙트 총괄 승인 대기): ① 코어 섬광 = VFX Graph(`VFX_CoreTest` 방식, 크기는 오브젝트 스케일) ② 조각 6~10개 = C# 풀링 쿼드(속도 방향 정렬) ③ 궤적 = TrailRenderer. ②③은 VFX Graph 속도 방향 정렬 블록 추가가 막혀 임시 선택이고 명세 §3.1의 「VFX Graph 스트립」과 다르다. ④ 3타 베인 자국 데칼은 공유 렌더가 unity/main에 병합됐으므로(`2f41eddf2`·`8d34eb653`) 연결 가능. 이벤트 연결에 `NativeGame.DispatchFeedback` 한 줄(`kiVfx?.Handle(e)`)이 필요 → 공유 파일이라 유니티 총괄 확인.
   - 판정 자료: 1600×900 정점 캡처, 0/0.033/0.066/0.1/0.2/0.35초 띠, top1%·정점 틱·환경 번짐·밴딩 → `E:/exoduser-wt/_out/vfx-rm1/kislash/`. **커밋 전에 임펙트 총괄에 보고하고 1x 판정을 기다린다.**

## worktree·브랜치

| 용도 | 경로 | 브랜치/커밋 | 상태 |
|---|---|---|---|
| 작업 | `E:/exoduser-wt/pc-unity-vfx-rm1` | `claude/unity-pc-vfx-rm1-20261027` = `d5943d1c4`(push됨) | Library = Linear 임포트 완료. 미커밋: `VfxRm1SharedCapture.cs`(파이프라인 로그·픽셀 비교 추가), Unity 부작용 `.meta`·`GraphicsSettings.asset` |
| 공유 렌더 | `E:/exoduser-wt/pc-unity-vfx-shared` | `claude/unity-pc-vfx-shared-render-20261028` = `0ebc103c0`(push됨, unity/main에 `2f41eddf2`·`8d34eb653`로 병합) | Linear Library. 더러움: `BlockMat.mat`·`GraphicsSettings`·`QualitySettings` Unity 부작용(미커밋·무시) |
| Gamma 비교 | `E:/exoduser-wt/pc-unity-vfx-gamma` | detach `0840fc1ef` | 빌드 2회 실패, 산출 없음 |
| 빌드 검증 | `E:/exoduser-wt/pc-unity-main-verify` | (예정) `8d34eb653` detach | **미생성** |

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
