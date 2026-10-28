# RM-4 (Unity 1-4 기생수의 둥지, 필드만) 인계 — 2026-10-28

세션 "Unity RM-4 1-4 맵 리모델링 구조". 재개 담당 = 맵 총괄(`local_9d17d95b-239c-4254-8bef-555b6c5e16e8`). 보고는 맵 총괄에게 보내고 유니티 총괄(이름 "유니티 총괄")에 참조로 보낸다. 모든 채팅은 한국어.
작업 규칙: 컨텍스트 100K 이상이면 인계를 쓰고 재생성, 200K 이상이면 즉시 멈춘다(`get_usage(self)`, 작업 단위마다 확인). P1부터 모델은 Sonnet.

## 위치
- worktree `E:/exoduser-wt/pc-unity-rm4`, 브랜치 `claude/unity-pc-rm4-20261028`(시작 `origin/unity/main` 7aea256aa). 명세 `E:/exoduser-wt/_out/rm-ch1/SPEC_RM2_4.md`(N=4, 끝 절 = 시선 쐐기 공통 규칙). 큰 산출물은 `I:/EXODUSER-Storage/rm4/`.
- 내 파일: `unity/Assets/Exoduser/Remodel/CH1_4/**`, `unity/Assets/Exoduser/Editor/Rm4SliceBuilder.cs`, `tools/rm4/**`, `docs/engine/UNITY_RM4_*.md`. RM-1(`Remodel/CH1_1`, `Rm1SliceBuilder.cs`, `tools/rm1`)과 다른 RM 세션 파일은 읽기만 한다.
- 수정 금지: `Remodel/Common`, `Rendering/**`, `GlobalVolume_Hell`, `ProjectSettings`, `Packages`, `Runtime/Core`, game.html, maps_data.js. unity/main 직접 반영 금지(병합은 유니티 총괄).

## 커밋·판정 현황
| SHA | 내용 | 판정 |
|---|---|---|
| dc04bb7cc | P0: 웹 1-4 정답 추출·Core 대조(미이식)·배치 계획 | 맵 총괄 PASS(10-28) |
| 5ef65deaf | P0 조건 2건 반영: 빛 웅덩이 진홍 38→20 동선 중심, 뿌리 흐름선 42줄·등줄기 8줄·보스문 줄기 수렴, 시선 쐐기 공통 규칙, P1 창 | 맵 총괄 접수(등줄기는 조건부 승인) |
| cc7bb3c2b | P1 빌더 초안 `Rm4SliceBuilder.cs` + `ch1_4_build.json` + `Rm4PoolLightCuller.cs` + `tools/rm4/run-unity.ps1` | **미컴파일·미실행** |

P1 승인 사항: 범위 x0~199 × y32~199 + 지도 밖 띠, 보스방(x80~119 × y0~29)·게이트는 비움, 시선 쐐기 h ≤ 0.9 + tan(0.85)×D를 모든 덩어리에 적용.

## 웹 정답 요약 (si=3, origin/main 6d18a815b, 지금과 game.html·maps_data.js 차이 0)
- 200×200 거의 전체가 걷기(39,129/871). 막힘은 충돌물 52개(원형)와 보스방 기둥 36칸. 막힘 섬 56개(P1 창 안 42개), 소환굴 14, 시작 적 0, START (100,185), EXIT (99~101,7).
- si≠0은 `initStage` 뒤 `_tickBgInit(9999)`를 해야 충돌물이 생긴다(큐 전 1개 → 뒤 52개). maps-rough(7d59aa487)는 이 함정으로 충돌물 819칸이 빠져 있다.
- Unity Core: unity/main은 1-4 미이식(`ch1_map.json`은 1-1뿐). Core는 고치지 않았다.
- 데이터: `Remodel/CH1_4/Data/ch1_4_{walk,rooms,spawns,reach,receipt,core_compare,plan,build}.json`. 생성기 `tools/rm4/{extract,compare_core,plan,sketch}.mjs`(plan.mjs가 build.json까지 쓴다). 계획서 `docs/engine/UNITY_RM4_PLAN_20261028.md`, 탑뷰 `tools/rm4/ch1_4_plan_topview.png`.

## 다음 할 일 (순서)
1. **Unity 실행은 유니티 총괄이 알려 줄 때까지 하지 않는다.** 순번은 전체 12번이다(유니티 총괄 10-28 갱신): rmb1 → O-1(09b 진단) → HUD → UI → VFX② 독 폭발 → UCH-05 → UCH-06 → UCH-03f Hero Light → VFX① Gamma → RM-3 → RM-2 → **RM-4** → VFX③ 기검참. RM-3·RM-2가 끝나면 유니티 총괄이 RM-4에 직접 알린다. 그 전에는 `run-unity.ps1`도 돌리지 않는다(바쁘면 끝나는 스크립트도 포함).
   - Library 복사는 유니티 총괄이 허용했다(조건: 원본은 Unity가 안 쓰는 worktree, 버전 6000.6.7f1 동일, `/E /XJ`(/MIR·/MOVE 금지), 원본에 junction 없음, 대상 드라이브 여유 20GB 이상, 복사만 하고 Unity는 안 띄움).
   - **10-28 복사 완료:** 원본 `pc-unity-rm1/unity/Library`(버전 동일, junction 0개, E: 918GB 여유, Unity 프로세스 0개 확인) → `pc-unity-rm4/unity/Library`. 디렉터리 2,752 / 파일 31,211 / 5.95GB 복사, 실패·불일치 0, robocopy 종료 코드 1, 대상 junction 0개. 로그 `I:/EXODUSER-Storage/rm4/logs/library-copy.log`. 스크립트는 `I:/EXODUSER-Storage/rm4/diag/libcopy.ps1`. Git Bash에서 robocopy를 직접 부르면 `/E` 같은 옵션이 경로로 바뀌어 종료 코드 16이 난다(PowerShell 스크립트로 부를 것). 원본 Library에는 Unity가 한 번도 열지 않은 rm4 소스 변경(Rm4SliceBuilder 등)이 없으므로 첫 실행은 증분 임포트와 컴파일이 일어난다.
   - 컴파일 오류는 1회만 고쳐서 다시 돌리고, 두 번째도 실패하면 멈추고 보고한다. 병합은 맵 총괄 구조 PASS 뒤 유니티 총괄이 한다.
2. 실행 전 점검: `tools/rm4/run-unity.ps1`이 가드한다(Unity·EXODUSER-Unity 중 HasExited=false가 있으면 BUSY로 종료, 커밋 여유 20GB 미만이면 종료). 끝난 뒤 프로세스가 실제로 종료됐는지 확인한다. DOTNET env 4종은 스크립트가 설정한다.
   - `unity/Tools/restore-lobby-media.cjs`와 `restore-warrior-story.cjs`는 10-28에 이미 실행했다(`--project <unity 폴더>`). 미디어는 git 미추적이다.
3. 실행 4번(각각 `-Log`를 다르게): `Exoduser.Rm4SliceBuilder.Run` → `Wedge` → `Capture`(`-outDir I:/EXODUSER-Storage/rm4/cuts -cuts start,heart,gate,top`, 이어서 `-capsule 1`로 start,heart,gate) → `Fps`(`-out I:/EXODUSER-Storage/rm4/out/rm4-fps.json`). 컴파일 오류가 나면 원인을 고치고 한 번만 다시 돌린다. 같은 실패가 2번이면 멈추고 보고한다.
4. **등줄기 조건부 승인 처리**(맵 총괄 10-28):
   - 둔덕 꼭대기 걷기 칸에 캡슐(바닥 y=0 기준)을 세워 찍어서 발이 둔덕에 묻혀 보이지 않아야 한다.
   - 런타임이 캐릭터를 지형 높이에 올려 주는지 한 줄 적는다(`NativeFieldView`·RM-0 `SpriteLit3D`·`Rm0EngineSetup`을 읽는다).
   - **10-28 결정:** 런타임이 지형 높이로 올리지 않으므로(`NativeGame.Point` z=0, `NativeFieldView` 없음) 캡처 판정 없이 `RidgeH`를 0.04u로 낮췄다(맵 총괄). 캡처는 `-cuts ridge`(단독 실행, 캡슐 자동)로 `rm4_ridge_y0.png`(런타임과 같은 y=0)와 `rm4_ridge_ground.png`(지형 위)를 나란히 찍어 발 묻힘이 거의 없음을 확인한다. 타일·groundY는 `Data/rm4_ridge_cut.json`. 상수는 `Rm4SliceBuilder.ComputeHeights`의 `RidgeH`이고, 둔덕은 `rm4_walk_overlap.json`의 `rootRidgeReliefWalkTiles`로 따로 센다.
5. P1 보고(맵 총괄, 참조 유니티 총괄): SHA / 수치 5종 / 캡처 경로 / FPS / 수정하지 않은 공용 파일 확인.
   - 수치 5종: ① 걷기 칸 덮임 `Data/rm4_walk_overlap.json` ② NavMesh 차이 `rm4_navmesh_diff.json` ③ 보이지 않는 벽 `rm4_islands.json`(`uncoveredAfterFill`) ④ 시선 쐐기 `rm4_wedge.json` + 캡슐 컷 start/heart/gate ⑤ Hero 레이어 `rm4_hero_layer.json`.
   - 판정 파일 5종의 값은 생성 뒤 확인한다. 아직 값이 없다.

## 빌더 설계 메모 (cc7bb3c2b)
- 지형은 24타일 서·동 패딩, 16타일 남쪽 패딩에 y16에서 끝난다. 절차 컬러맵 `Generated/ch1_4_colormap.png`(12px/타일)는 확정 바닥 질감을 섞고 뿌리 마스크·핏줄·AO를 더한다.
- 강 리본 2줄은 지도 밖 띠에 있다(걷기 칸에 닿지 않는다). 독액 표면은 L3 섬(153~159 × 61~67)의 몸체 21칸뿐이다.
- 3×3 독액 스밈 2곳(31~33 × 151~153, 62~64 × 187~189)은 독액 표면 대신 젖은 데칼이다(덩어리가 가리기 때문). 맵 총괄이 조건부 승인(10-28): 데칼 색상각 40~65°(현재 `M_Decal4_wet` _Tint #5a5020 알파 0.9 = 약 49.7°)이고 P1 캡처에서 독액 스밈으로 읽혀야 한다. P1 보고에 편차와 색값을 적는다.
- 덩어리는 절차 LumpMesh(RM-1 복사)이고, 높이는 시선 쐐기 hMax의 0.97배 이하다(막힘 섬은 모두 D=0.2u라 hMax 1.13u).
- 외곽 덩어리는 3겹(가까운 낮은 것, 강 너머 중간, 먼 높은 것)이다. 북쪽 띠는 만들지 않는다(y<16은 지형 밖이고 북쪽 필드는 슬라이스 밖).
- 웅덩이 조명 33개는 `Lights/Pools` 아래에 `Pool_Hell_NN`·`Pool_Toxic_NN`으로 둔다. 총 개수는 UCH-03d 림광이 이름으로 읽는다.
  - URP Forward는 큰 오브젝트(지형)에 추가광 8개만 주기 때문에 `Rm4PoolLightCuller`가 카메라 근처 8개만 켠다(Light.enabled만 바꾸고 GameObject는 그대로).
  - 캐릭터 총괄에게 "disabled여도 이름·색·range는 읽힌다"는 점을 한 번 알려 주면 좋다.
- 흐름선은 절차 로프 텍스처 리본(`Flow_Lines`, `Flow_Ridges`)이고, 등줄기 릴리프(≤0.04u, 10-28 맵 총괄 결정으로 0.10u에서 낮춤)는 지형 높이이다. 충돌·덩어리가 아니다.
- 알려진 불확실: Unity 컴파일, `renderingLayerMask` 형식(`(uint)` 캐스트로 대비), 컬러맵 생성 시간(약 7.1M 픽셀), 지형 해상도 1025(0.09u).

## 금지·주의
- `python -`(stdin 대기 형태) 절대 금지. 스크립트는 파일로 저장해 실행한다. 10-28 초반에 실수로 한 번 실행해 C: Temp에 116MB 로그를 남겼다(`C:/Users/심도진/AppData/Local/Temp/claude/G--exoduser/126c319d-618a-488c-b542-3d0e9a4e1c4b/tasks/bg3v89mic.output`, 삭제 권한 없음, CTO에 넘김).
- 같은 테스트 반복 금지, 이미지·창 자동 열기 금지, `git add -A`·stash·reset·rebase·force 금지, 유료 호출·새 이미지 생성 금지, C 드라이브에 큰 파일 금지.
- pre-commit 훅이 `tools/guard.baseline.json`을 고쳐 놓으면 `git restore -- tools/guard.baseline.json`으로 되돌린다(내 변경이 아니다).
- 추출 함정: `--single-process` Chrome은 30분 멈추고 종료도 안 된다. `browser.close()`는 5초 race로 처리한다. Chrome PID 44328은 종료 요청에 접근 거부라 CTO에 넘겼다(약 1.7GB).
- 추출 도구는 이미 쓰고 끝났다. 웹 정답 재추출은 game.html·maps_data.js가 바뀐 경우만 한다.
- 동시 세션 메시지 상한(사용자 입력 뒤 10건)을 지킨다.
