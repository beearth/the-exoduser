# RM-1 구현 인계 — 2026-10-28 (재생성 직전, 컨텍스트 492K)

- 역할: Unity RM-1(1-1 맵 리모델링) 구현 단순작업 Sonnet 세션. 맵 총괄 기록상 id `local_82ed6674`. 판정=맵 총괄(`local_9d17d95b`), 병합=유니티 총괄(`local_59ad835c`). 재개 담당=맵 총괄.
- 명세 `E:/exoduser-wt/_out/rm1/SPEC.md`, 첫 인계 `E:/exoduser-wt/_out/rm1/HANDOFF_pc.md`, 구현 현황 `docs/engine/UNITY_RM1_SLICE_20261028.md`(브랜치 안).
- worktree `E:/exoduser-wt/pc-unity-rm1`, 브랜치 `claude/unity-pc-rm1-20261027`. 이 파일을 올린 커밋이 브랜치 끝.

## 지금 상태
- 구조(78643578a)·보이지 않는 벽 0(d88b53c5a)·실루엣(aadd0623b) 모두 맵 총괄 PASS. unity/main 병합: 구조 4469bf89a, 실루엣 8084d06b5. 로컬 HEAD는 origin/unity/main 8d34eb653까지 병합(fast-forward).
- 워킹트리는 깨끗(untracked 잡파일만: `NativeGame.HudBlendCapture.cs.meta`, `ProjectSettings/SceneTemplateSettings.json` — 내 것 아님, 커밋하지 말 것).
- **대기 중**: ② RM0-LIGHT-L PASS + 유니티 총괄 병합 → 맵 총괄 알림 → 톤 재캡처. 그 전에는 Unity를 실행하지 않는다(CTO: 재부팅 전 금지, 이후 PC 전체 1개·커밋 여유 20GB 이상·`Get-Process EXODUSER-Unity,Unity | ?{-not $_.HasExited}` 0개 확인). 플레이어 빌드는 더 돌리지 않는다(유니티 총괄 지시).
- 플레이어 빌드 검증은 8d34eb653 위에서 2회 실패(시스템 리소스 부족 → 에디터 텍스처 임포트 중 크래시). RM-1 코드 오류 아님, 유니티 총괄이 VFX 세션 worktree에서 비교 빌드 중. 78643578a 이전 빌드는 errors 0 Succeeded.

## 재개 후 할 일 (순서)
1. 시작 전 점검: 실행 중 Unity 0, 커밋 여유 ≥20GB, `git fetch` 후 `git merge --no-edit origin/unity/main`(rebase 금지).
2. 톤 재캡처(에디터 배치 1개): `powershell -NoProfile -File E:/exoduser-wt/_out/rm1/run-rm1.ps1 -Method Exoduser.Rm1SliceBuilder.Capture -Log capN.log -Extra "-outDir <dir> -cuts start,r2,river -capsule 1"`. 늪 1곳은 `trunk` 컷(동쪽 둥치 웅덩이). 1600x900 + 1x 크롭, 이미지 자동 열기 금지(경로만). 씬이 바뀌었으면 먼저 `Run`으로 재빌드(Library가 이미 있어 빠름).
3. 톤 단계 항목(맵 총괄이 넘긴 것): 뿌리가 검은 쐐기로 보임·Pool_Toxic 높이(광원 새로 추가 금지), 동쪽 외곽 분홍·고사리·꽃 무늬(콜러맵), 독액 노랑·밑동 노란 고리(`M_ToxicFlow` 색을 바이블 §6 #3a2e0a~#4a3a0c, 발광 L35 이하로), 맵 가장자리는 숲이 FOG-LOW 어둠으로 사라지게(남색 void 금지), 풀 detail·전경 카드 가시성 재판정.
4. `Rendering/`(GlobalVolume_Hell·URP 자산)은 유니티 총괄이 "④ 차례"라고 알리기 전까지 절대 손대지 않는다. ④ 차례에는 Volume에 톤매핑·색보정·안개 값을 추가만 하고 새 Global Volume은 만들지 않는다.
5. 독 스킬 터진 프레임 1장: VFX 세션(`pc-unity-vfx-rm1`, 브랜치 `claude/unity-pc-vfx-rm1-20261027`)에 독 이펙트 자산이 생기면. 없으면 "못 함"으로 보고.
6. 판정 PASS 후 SHA만 유니티 총괄에 보고(unity/main 직접 푸시 금지). `M_ToxicFlow` 경로(`unity/Assets/Exoduser/Remodel/CH1_1/Materials/M_ToxicFlow.mat`, 셰이더 `EXODUSER/ToxicFlow`)는 맵 총괄→보스전 총괄에 이미 전달 대상.

## 만든 것 (파일)
- 씬 `unity/Assets/Exoduser/Remodel/CH1_1/RM1_Slice.unity`, 빌더 `unity/Assets/Exoduser/Editor/Rm1SliceBuilder.cs`(멱등). 메서드: `Run`(씬 생성), `Capture`(`-outDir -cuts start,r2,river,close,trunk,top -capsule 1 -shape 1`), `Fps`(`-out json`).
- `-shape 1` = 중립 조명 형태 확인용(저장 씬은 안 건드림). `-capsule 1` = 1.6u 캡슐로 가림 확인. `top` = 3200x2160 정사영 + Core 걷기 칸 초록 반투명.
- 데이터 `Remodel/CH1_1/Data/`: `unity_1_1_walk_dump.json`(Core 걷기 격자), `toxic_river_path.json`·`toxic_bubble_spawns.json`(VFX 기포, 시드 1101·1102), `rm1_walk_overlap.json`(침범 0/0), `rm1_navmesh_diff.json`(0/0, 반경 메모 note), `rm1_islands.json`(막힘 섬 4건 전수), `rm1_fps.json`.
- 재질 `Materials/`: `M_RottenWoodMembrane`·`M_CursedBark`(map3d `mass_v01` 확정 아트 + normal), `M_ToxicFlow`, `M_FgRoots`·`M_BgTree`(절차 알파 카드, 셰이더 `Shaders/FgCard.shader`), 데칼 `M_Decal_*`. 새 이미지 생성·유료 호출 없음.
- 좌표 규칙: 웹 px → 월드 x=px/100, z=-px_y/100(1타일=0.4u). 카메라 LOOK-001(pitch .85, 14u). Core(`Runtime/Core`)·`Rendering/`·`Remodel/Common` 변경 0줄.

## 수치·규칙 (유지해야 함)
- 걷기 칸 침범 0(중심·0.5칸 이상 둘 다), NavMesh vs Core 0/0, 막힘 섬 4건 모두 3D 물체, 카메라 쪽(걷기 칸이 북쪽 16칸 이내) 덩어리 높이 ≤0.9u, Hero 렌더링 레이어 미사용, 빛 웅덩이 `Lights/Pools/Pool_Hell_NN`·`Pool_Toxic_NN`.
- NavMesh는 걷기 칸 메시를 에이전트 반경 0.1u·복셀 0.04u로 직접 굽는다(몹 간격은 NavMeshAgent 쪽). Not Walkable 볼륨 방식은 이웃 걷기 칸을 깎아 폐기.
- FPS(편집기 배치, RX 9070 XT, 1600x900): 3D 켬 767·934 / 끔 2286.
- R2 동쪽 둥치 4.6u는 랜드마크라 높이 유지(맵 총괄 결정). 재질 단계에서 "저주나무 둥치"로 읽혀야 함(현재 PASS).

## 함정 (겪은 것)
- Unity 배치는 실행마다 `.cs`를 다시 컴파일한다. 체인(`Run && Capture && Fps`)을 돌리는 동안 소스를 수정하면 뒤 단계가 깨진다. 수정은 체인이 끝난 뒤.
- 큰 소스 수정은 `python -I 파일.py`로 문자열 치환(스크립트는 반드시 파일로 저장 — `python -` stdin 금지, 임시파일+os.replace). Bash heredoc에 큰 Python을 넣으면 파싱 오류가 나므로 Write 도구로 파일 작성.
- 메시 감김 방향: Unity 앞면 = `Vector3.Cross(b-a, c-a)`가 바깥을 향하는 순서. 위치가 다른 점의 방향으로 검사하면 뒤집힘(실제로 한 번 겪음).
- 어두운 Gamma 화면에서 뿌리·풀·전경 카드는 거의 안 보인다. 형태 판정은 `-shape 1`, 톤은 ① 병합(Linear·후처리) 뒤 화면으로.
- 빌드가 `Rendering/URP_*.asset`·`ProjectSettings`·`Resources/**/.meta`·`StreamingAssets/Lobby/*.meta`를 고쳐 쓴다 → 커밋하지 말고 `git checkout --`로 되돌린다. 로비 mp4 9개는 git 미추적(pc-unity-d01에서 복사해 둠, 건드리지 말 것).
- 커밋은 경로 지정(`git add -- 경로`)만, `git add -A`·force·rebase 금지. 커밋 메시지 끝에 `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.

## 못 한 것
- 독 스킬 터진 프레임, 톤 판정용 캡처(① 병합 후), 독액 색·밑동 노란 고리·동쪽 외곽 무늬·가장자리 FOG-LOW(톤 단계), 데칼 Projector 전환(지금은 쿼드 메시), 전경 카드·풀 detail 가시성 재판정.

## 작업 도구 경로
- 실행기: `E:/exoduser-wt/_out/rm1/run-rm1.ps1 -Method ... -Log ... -Extra "..."`(Unity 6000.6.7f1, `-batchmode`, 소리 없음), 빌드 `run-build.ps1`(쓰지 말 것), 산출물·로그 `E:/exoduser-wt/_out/rm1/`(cuts_*/ 캡처, runN.log·capN.log).
- 최신 캡처: `E:/exoduser-wt/_out/rm1/cuts_sil4/`(일반 `*_cap.png`, 형태용 `*_shape.png`, 탑뷰 `rm1_top_walk_overlay.png`).
