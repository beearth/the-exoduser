# RM-1 인계 — 2026-10-28 (Sonnet 단순작업 세션 정리, Codex 브리프용)

- 역할: Unity RM-1(1-1 맵 리모델링) 구현. 맵 총괄 기록상 이전 담당 `local_82ed6674`(Sonnet, 이 세션은 정리됨). 판정=맵 총괄(`local_9d17d95b`), 병합=유니티 총괄(`local_59ad835c`). 이어서 하는 담당은 Codex CLI.
- worktree `E:/exoduser-wt/pc-unity-rm1`, 브랜치 `claude/unity-pc-rm1-20261027`(커밋 e82b4656f까지 push됨, 이 파일을 올린 커밋이 브랜치 끝). **unity/main 직접 푸시 금지** — 맵 총괄 PASS 뒤 SHA만 유니티 총괄에 보고하고 병합은 유니티 총괄이 한다.
- 이 파일의 사본이 main에도 있다(`docs/0마스터플랜/session_handoff/rm1.md`). 둘 다 같은 내용으로 맞춘다.
- 명세: 필드 `E:/exoduser-wt/_out/rm1/SPEC.md`·`HANDOFF_pc.md`, 아레나 `E:/exoduser-wt/_out/rm-arena/SPEC_ARENA_CH1.md`(§4 보스전 총괄 보충, §5 P0 판정). 구현 문서(브랜치 안): `docs/engine/UNITY_RM1_SLICE_20261028.md`(필드, 맨 끝 "Core → 월드 좌표 변환" 절), `docs/engine/UNITY_RM1_ARENA_20261028.md`(아레나).

## 지금 상태 (SHA는 브랜치 기준)
| 단위 | 상태 | SHA |
|---|---|---|
| 1-1 필드 슬라이스 구조 | 맵 총괄 PASS, unity/main 병합됨 | 78643578a (병합 4469bf89a) |
| 보이지 않는 벽 0 | PASS | d88b53c5a |
| 실루엣 | PASS, unity/main 병합됨 | aadd0623b (병합 8084d06b5) |
| 아레나 A1 P0(코드 읽기·좌표·계획) | **맵 총괄 PASS** | 5e8b64f20, 판정 반영 4d0525f66 |
| Core→월드 좌표 변환 문서(런타임 연결용) | 맵 총괄 접수, 연결 담당 unity-m1-sonnet에 전달 | 05770b035 |
| 카메라 리그 `RM1_CameraRig` 묶기(빌더 코드만) | 맵 총괄 승인, **저장된 씬은 아직 안 다시 굼** | 3c102aae7 |
| Run·Capture·Fps 무음(`AudioListener.volume=0`) | 완료, 컴파일 미확인 | e82b4656f |
| 브랜치에 병합한 unity/main | 28커밋(M1-REGION R-B, RM-B1 드루이드 등) | 5f24cbb00 |

워킹트리는 깨끗하다. 추적 안 되는 잡파일(`Data/rm1_fps.json.meta`, `Runtime/NativeGame.HudBlendCapture.cs.meta`, `ProjectSettings/SceneTemplateSettings.json`)과 `tools/guard.baseline.json` 수정은 **내 것이 아니다 — 커밋하지 말 것**.

## 남은 일 (순서)
1. **톤 재캡처** — RM0-LIGHT-L은 디자인 PASS(postExposure 1.85)가 났지만 톤매핑을 Neutral로 바꾼 뒤 재측정(RM-0 3d6a16ce5)과 유니티 총괄 병합이 남아 있다. 병합 뒤 **맵 총괄이 신호**를 보낸다. 그 전에는 Unity를 실행하지 않는다.
   - 시작 전: `git fetch` → `git merge --no-edit origin/unity/main`(rebase 금지). 씬이 바뀌었으면 `Rm1SliceBuilder.Run`으로 재빌드(이때 `RM1_CameraRig`도 반영됨).
   - 캡처: `Exoduser.Rm1SliceBuilder.Capture -outDir <dir> -cuts start,r2,river -capsule 1`(늪 1곳은 `trunk` 컷). 1600x900 + 1x 크롭. 이미지는 자동으로 열지 않고 **경로만** 보고. `-shape 1`은 중립 조명 형태 확인용.
   - 톤 단계 항목: 뿌리가 검은 쐐기로 보임·`Pool_Toxic` 높이(광원 새로 추가 금지), 동쪽 외곽 분홍·고사리·꽃 무늬(콜러맵), 독액 노랑·밑동 노란 고리(`M_ToxicFlow` 색을 바이블 §6 #3a2e0a~#4a3a0c, 발광 L35 이하로), 맵 가장자리는 숲이 FOG-LOW 어둠으로 사라지게(남색 void 금지), 풀 detail·전경 카드 가시성 재판정.
2. **A1 아레나 P1** — `Editor/Rm1ArenaBuilder.cs`(멱등, `Run`·`Capture`·`Fps`)와 `Remodel/CH1_1/Arena/**` 새로 작성. 순서는 빌더 1개 → 씬 `RM1_Arena.unity` → 캡처 3컷(진입 남쪽, 기둥 2개 보이게, 탑뷰). 반드시 지킬 것:
   - 위치는 Core에서 읽는다: `BossArenaLayout.Generate(0)`(격자 128×108, 1타일 40px), `DruidRemodelData.Set`/`BossRemodelSet`의 `PillarCount`·`PillarRingFraction`·`PillarRadius`·`PillarStartDeg`. 빌더에 4를 기본값으로 두지 않는다. 계산 결과는 `Remodel/CH1_1/Arena/Data/rm1_arena_layout.json`과 대조해 다르면 실패.
   - **수로 = 중심 (2580, 2180)px(타일 원 중심) · 안쪽 반지름 2070 · 바깥 2210px의 완전한 원**(맵 총괄 승인 조건: 안쪽 가장자리가 타일 계단 톱니로 보이면 안 됨). 걷기 타일 모서리 최대 2067.85px이라 걷기 칸 위 0셀. 진입(남)·출구(북)는 x 2580±200px에서 끊는다. 명세의 r 2060~2200 고리(Core 중심 기준)는 걷기 칸 342셀을 침범해서 쓰지 않는다.
   - 기둥은 Core 아레나 중심 (2560, 2160)px 기준, 반지름 80px(0.8u), 위치 Unity (33.5337,−29.5337)(17.6663,−29.5337)(17.6663,−13.6663)(33.5337,−13.6663), 발자국 허용 ≤ 8px.
   - 룬(5) 288칸은 걷기 칸 = 흙 그대로. 그을린 뿌리 테두리는 벽 쪽 입술(0~20px, h ≤ 0.9u)에만.
   - **바닥에 독 광택을 굽지 않는다**(보스 VFX 독 예고가 읽혀야 함). 바닥 = 마른 검붉은 흙.
   - 연출 파라미터: `Rm1ArenaChannel.Level`(0~1, 수로 메시 Y 이동 −0.08u~+0.12u), `Rm1ArenaPillar.Rise`(0~1, 땅속~솟음). 공용 `EXODUSER/ToxicFlow` 셰이더는 고치지 않는다(수위 파라미터 없음).
   - 바깥: 입술 → 수로 → 가시숲 3겹. 시선 쐐기 `h ≤ 0.9 + tan(0.85)×D`. 격자 경계 여유가 북 120·남 80px뿐이라 수로·숲은 Core 격자 밖 월드까지 나간다.
   - 판정 수치: 걷기 칸 덮임 0 / 수로 픽셀이 걷기 칸 위 0 / 기둥 발자국 ≤ 8px / 쐐기 위반 0 / 보이지 않는 벽 0 / FPS / 공용 파일 미수정. 탑뷰에서 수로 안쪽 가장자리가 매끈한지 확인.
   - 런타임 훅(`NativeGame.StageFlow.cs:96-111`)과 카메라 3D 교체는 공용 파일이라 **유니티 총괄 결정**(RM-INT 연결 담당 `unity-m1-sonnet`, 브랜치 `claude/unity-pc-rm-int-20261028`)이다. 고치지 말 것.
3. **독 스킬 터진 프레임 1장** — VFX 세션(`pc-unity-vfx-rm1`, 브랜치 `claude/unity-pc-vfx-rm1-20261027`)에 독 이펙트 자산이 생기면. 없으면 "못 함"으로 보고.
4. `Rendering/`(`GlobalVolume_Hell`·URP 자산)은 유니티 총괄이 "④ 차례"라고 알리기 전까지 절대 손대지 않는다. ④ 차례에는 Volume에 톤매핑·색보정·안개 값을 추가만 하고 새 Global Volume은 만들지 않는다.
5. 데칼 Projector 전환(지금은 쿼드 메시), 필드를 1-1 전체로 넓히는 일은 개발툴의 json 공용 빌더가 나온 뒤 맵 총괄이 정한다.

## 완료 기준 (사용자 규칙, 모든 맵 세션 공통, 기준 문서 origin/main `docs/engine/UNITY_DONE_BUILD_PLAYTEST_RULE_20261028.md`)
① 병합 전 Windows 플레이어 빌드 오류 0(최신 unity/main을 합친 상태) → ② 유니티 총괄 병합 → ③ 통합 빌드 → ④ 실제 GPU 렌더 스모크(로그 오류 0) → ⑤ 바탕화면 unity-latest 갱신 → ⑥ 맵 총괄이 실제 빌드로 판정. 병합 요청에는 **빌드 영수증**(오류 0, 최신 unity/main을 포함한 SHA)을 붙인다. RM-INT(1-1 런타임 연결) 전까지 에디터 캡처는 참고용이고 보고에 "런타임 미연결"이라고 적는다. 사용자가 직접 봐야 하는 항목(화면 판정 등)은 승인 전에 반영하지 않고 맵 총괄에 보낸다.

## 실행 방법 (모든 Unity 실행은 공용 실행기로만)
공용 실행기 `unity/Tools/devtools/exo-unity.ps1`(unity/main, DT-01). 설명서 `unity/Tools/devtools/README.md`.
```powershell
$x  = 'E:\exoduser-wt\<최신 unity/main을 가진 워크트리>\unity\Tools\devtools\exo-unity.ps1'
$wt = 'E:\exoduser-wt\pc-unity-rm1'
& $x status                                   # 잠금·Unity 프로세스·커밋 메모리 여유·HALT
& $x queue                                    # 잠금 보유자 + 예약 순서
& $x reserve -Owner rm-1 -Note 'RM-1 톤 재캡처' -TtlMin 120
& $x run -Worktree $wt -Method Exoduser.Rm1SliceBuilder.Capture -Args '-outDir','I:/EXODUSER-Storage/rm1/cuts','-cuts','start,r2,river','-capsule','1'
& $x run -Worktree $wt -Method Exoduser.Rm1SliceBuilder.Run          # 씬 재생성(멱등, 첫 Refresh 때문에 오래 걸릴 수 있음)
& $x unreserve -Owner rm-1
```
- 서버(`start`)가 없으면 같은 잠금 아래 `-batchmode -quit -executeMethod` 1회 실행으로 대체된다. `-Args`는 `-File` 모드에서 쉼표로 잇거나 `-ArgsJson '["-outDir","I:/x"]'`.
- 잠금 파일 `I:\EXODUSER-Storage\unity-jobs\_pc_lock.json`, 순번 큐 `...\queue\`. 이 실행기를 거치지 않고 Unity를 직접 띄우지 않는다(세이브 오염·창·소리 사고 이력). 시작 조건: 커밋 여유 12GB(Library 있음)/20GB(없음), 동시 1개. `HALT` 파일이 있으면 종료 코드 3.
- 이전에 쓰던 개인 스크립트 `E:/exoduser-wt/_out/rm1/run-rm1.ps1`은 개인용 대체(잠금·큐 처리 포함)이고, 공용 실행기가 있으면 그쪽을 쓴다. 산출물·로그는 `E:/exoduser-wt/_out/rm1/`(cuts_*/ 캡처, runN.log·capN.log). 최신 캡처 `cuts_sil4/`(일반 `*_cap.png`, 형태용 `*_shape.png`, 탑뷰 `rm1_top_walk_overlay.png`).

## 맵 검사·룩데브 (개발툴, 브랜치 상태는 병합 요청 중이라 unity/main에 있는지 먼저 확인)
- **MapLint(DT-02)** `Exoduser.DevTools.MapLint.MapLintBatch.RunBatch`(브랜치 `claude/unity-pc-devtools-maplint-20261028`). 인자 `-scene Assets/...unity -grid Assets/...json -out <결과.json> [-profile Assets/....maplint.json] [-shot <탑뷰.png>] [-repeat n]`, `-scene` 여러 번 가능. 씬은 열기만 하고 저장하지 않는다. 종료 코드 0=전부 PASS, 1=위반, 2=실행 오류. 검사: L1 걷기 칸 덮임·L1b 머리 위 덮개·L2 NavMesh↔Core·L3 막힌 섬·L3b 보이지 않는 벽·L4 시선 쐐기·L5 Hero 누수·L6 원점 쌓임·L7 경고. RM-1 슬라이스 기준 결과와 정확한 인자는 `I:\EXODUSER-Storage\devtools\dt02\RESULT.md`·`rm1_run3.json`(RM-1: L2 0/0, L3 0, L3b PASS, L5 PASS, L6 PASS, L1/L4는 데칼·트렁크 높이 항목이 맵 총괄 판정 대기).
- **LookDev(DT-03)** `Exoduser.DevTools.LookDev.LookDevCapture.RunBatch`(브랜치 `claude/unity-pc-devtools-lookdev-20261028`). 인자 `-shots builtin|<폴더> -out <dir> [-only 이름] [-override postExposure=1.85] [-withBase 1] [-ref 웹기준PNG] [-failOnWarn 1]`. 샷 프리셋에 `RM1_Start`·`RM1_Capsule3Way`·RM_Sandbox. 결과에 화면 중앙값·바닥 luma·R/G·색상각 + 렌더 상태 json, 어두운 화면이면 `DARK` 경고. 톤 재캡처 판정 때 같이 돌린다. 결과 `I:\EXODUSER-Storage\devtools\dt03\RESULT.md`.
- 두 도구의 에디터 창은 batchmode 검증만 됐고 눈 검수 전이다.

## 수치·규칙 (유지해야 함)
- 필드: 걷기 칸 침범 0(중심·0.5칸 이상 둘 다), NavMesh vs Core 0/0, 막힘 섬 4건 모두 3D 물체, 카메라 쪽(걷기 칸이 북쪽 16칸 이내) 덩어리 높이 ≤0.9u, Hero 렌더링 레이어 미사용, 빛 웅덩이 `Lights/Pools/Pool_Hell_NN`·`Pool_Toxic_NN`. R2 동쪽 둥치 4.6u는 랜드마크라 높이 유지(맵 총괄 결정).
- NavMesh는 걷기 칸 메시를 에이전트 반경 0.1u·복셀 0.04u로 직접 굽는다(몹 간격은 NavMeshAgent 쪽). Not Walkable 볼륨 방식은 이웃 걷기 칸을 깎아 폐기.
- 좌표: 웹 px → 월드 x=px/100, z=−px_y/100(1타일=0.4u), 씬 루트 이동·회전·스케일 없음. 카메라 LOOK-001(피치 0.85rad=48.70°, 거리 14u). Core(`Runtime/Core`)·`Rendering/`·`Remodel/Common` 변경 0줄. 아레나 중심 (25.60,−21.60)u, 필드 창(x 19.2~60.8, z −80~−50.4)과 겹치지 않는다. 지형 창은 타일 x48~152·y126~200(정식 데이터는 x60~140·y138~192), 창 안에서만 검증하고 `SampleHeight`는 창 안으로 클램프해서 부른다.
- FPS(편집기 배치, RX 9070 XT, 1600x900): 3D 켬 767·934 / 끔 2286.

## 금지사항
- `Runtime/Core/**`, `Rendering/**`(④ 차례 전), `Remodel/Common`, `ProjectSettings`, `Packages`, 공용 `ToxicFlow` 셰이더, NativeGame*·NativeHud* 파일은 고치지 않는다.
- `git add -A`·force push·rebase·reset·stash 금지. 커밋은 `git add -- 경로`로 자기 소유 경로만, 커밋 메시지 끝에 `Co-Authored-By: ...`. unity/main에 직접 푸시하지 않는다.
- 빌드가 `Rendering/URP_*.asset`·`ProjectSettings`·`Resources/**/.meta`·`StreamingAssets/Lobby/*.meta`를 고쳐 쓴다 → 커밋하지 말고 `git checkout --`로 되돌린다. 로비 mp4 9개는 git 미추적(건드리지 말 것).
- Unity는 공용 실행기(`exo-unity.ps1`)로만, 창 0·소리 0(`-batchmode`, GPU가 필요하면 `-nographics`만 뺀다·`-nographics` 자체는 캡처에서 금지, `AudioListener.volume=0`, `-popupwindow`·전체화면·보조 모니터 창 금지). 이미지·폴더를 자동으로 열지 않고 경로만 보고. 큰 산출물·Playwright 프로필은 I:/E: 드라이브(C 금지), 쓰고 나면 지운다.
- 백그라운드에서 `python -`처럼 stdin 대기 형태를 쓰지 않는다. 스크립트는 파일로 저장해 실행. 같은 파일을 한 줄로 읽고 쓰지 않는다(임시파일+`os.replace`).
- 유료 호출·새 이미지 생성 없음(현 자산 `mass_v01`·절차 알파로 처리). 테스트·캡처 실패 시 반복 재실행하지 말고 원인을 고친 뒤 1회.

## 함정 (겪은 것)
- Unity 배치는 실행마다 `.cs`를 다시 컴파일한다. `Run && Capture && Fps` 체인을 돌리는 동안 소스를 수정하면 뒤 단계가 깨진다. 수정은 체인이 끝난 뒤.
- 큰 소스 수정은 파일로 저장한 Python으로 문자열 치환. 메시 감김 방향은 Unity 앞면 = `Vector3.Cross(b-a, c-a)`가 바깥을 향하는 순서.
- 어두운 Gamma 화면에서 뿌리·풀·전경 카드는 거의 안 보인다. 형태 판정은 `-shape 1`, 톤은 Linear·후처리가 들어간 화면으로.
- 플레이어 빌드 검증은 8d34eb653 위에서 2회 실패(시스템 리소스 부족·에디터 텍스처 임포트 중 크래시)한 적이 있다. 코드 오류가 아니라 PC 커밋 메모리(Claude 세션·node 자식 프로세스) 문제였다. 78643578a 이전 빌드는 errors 0 Succeeded.
- 이 브랜치의 `Rm1SliceBuilder`는 마지막 두 수정(RM1_CameraRig 묶기, AudioListener.volume=0)이 **컴파일 확인 없이** 커밋됐다. 다음 Unity 실행의 첫 확인 사항.

## 만든 것 (파일)
- 필드: 씬 `unity/Assets/Exoduser/Remodel/CH1_1/RM1_Slice.unity`(저장본은 카메라 리그가 아직 예전 배치), 빌더 `unity/Assets/Exoduser/Editor/Rm1SliceBuilder.cs`(멱등; `Run`·`Capture`(`-outDir -cuts start,r2,river,close,trunk,top -capsule 1 -shape 1`)·`Fps`(`-out json`)). 데이터 `Remodel/CH1_1/Data/`: `unity_1_1_walk_dump.json`·`toxic_river_path.json`·`toxic_bubble_spawns.json`·`rm1_walk_overlap.json`·`rm1_navmesh_diff.json`·`rm1_islands.json`·`rm1_fps.json`. 재질 `Materials/`: `M_RottenWoodMembrane`·`M_CursedBark`(map3d `mass_v01` 확정 아트 + normal)·`M_ToxicFlow`(`EXODUSER/ToxicFlow`)·`M_FgRoots`·`M_BgTree`(`Shaders/FgCard.shader`)·데칼 `M_Decal_*`.
- 아레나: `Remodel/CH1_1/Arena/Data/rm1_arena_layout.json`(Core 값 좌표), 계산기 `unity/Tools/rm1-arena-layout/arena_p0.py`(Pillow·numpy)·`smooth_band.py`(수로 원 2070 근거), 탑뷰 `E:/exoduser-wt/_out/rm-arena/rm1_arena_top.png`.
