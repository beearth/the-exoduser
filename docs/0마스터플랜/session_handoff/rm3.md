# RM-3 (Unity 1장 1-3 맵 리모델링 구조) 인계 — 2026-10-28

## 역할·위치
- 담당: 1-3 구역(웹 si2) 구조 블록아웃. 명세 `E:/exoduser-wt/_out/rm-ch1/SPEC_RM2_4.md`(N=3, 끝의 "시선 쐐기" 절 포함). 판정·보고 = 맵 총괄 `local_9d17d95b-239c-4254-8bef-555b6c5e16e8`, 순번·병합 = 유니티 총괄 `local_59ad835c-2e92-44a5-bebf-0f0223217ae0`. 재개 담당 = 맵 총괄.
- worktree `E:/exoduser-wt/pc-unity-rm3`, 브랜치 `claude/unity-pc-rm3-20261028`(origin/unity/main 60a48a668까지 병합), 최신 push `fb5d2fb6b`. unity/main 직접 반영 금지(병합은 유니티 총괄).
- 내 소유: `unity/Assets/Exoduser/Remodel/CH1_3/**`, `unity/Assets/Exoduser/Editor/Rm3SliceBuilder.cs`, `tools/rm3/**`, `docs/engine/UNITY_RM3_*.md`. RM-1(`Remodel/CH1_1`, `Rm1SliceBuilder`, `tools/rm1`)·공용 URP·`Remodel/Common`·Core는 읽기만. RM-1 재질·셰이더는 경로로 읽기 전용 참조.

## 끝난 것
- **P0 PASS**(맵 총괄 판정, SHA 2d0be50f8): 웹 정답 추출·Core 대조(미이식: NativeGame.cs:54가 항상 1-1 ch1_map 읽음)·배치 계획.
  - 웹 1-3 = `_cloneField11(2)`, `_MAP_COMPOSE[2]`에 basin/path 없음 → 200×200 전부 열린 들판(tileRLE [1,40000]), 지형은 소품 충돌물 47개가 만든다. 걷기 38862·막힘 1138·막힌 섬 50개, 격자 끝까지 걷기, START (100,185), 출구 (99~101,7), 보스문 y5, 소환굴 13, 고정 몹 0, 무작위 없음(무시드 5회·시드 3회 동일). origin/main f103990b0 커밋 blob 기준.
  - 데이터 `Remodel/CH1_3/Data/ch1_3_{walk,rooms,spawns,reach,blocked_islands,source_receipt}.json`, 추출기 `tools/rm3/extract.mjs`(si≠0은 initMapObjects가 `_bgInitQueue`에서 돌아 `_tickBgInit(9999)`로 비운 뒤 재야 한다), 섬 분석 `islands.mjs`, 스케치 `sketch.mjs`→`tools/rm3/ch1_3_plan_topview.png`, 계획 데이터 `plan_rm3.json`, 계획서 `docs/engine/UNITY_RM3_PLAN_20261028.md`(§5 판정 결과, §6 P1 메모, §7 시선 쐐기 결정).
- **P1 코드 작성·push**(WIP, 컴파일·실행 전): `Rm3SliceBuilder.cs` 한 파일. 씬 `Remodel/CH1_3/RM3_Slice.unity`.

## 맵 총괄 결정(그대로 지킬 것)
- D-1 규칙 우선: 걷기 격자(Core)가 정답, 미로로 바꾸지 않는다. "거대 버섯"은 들판 안 낮고 넓은 갓(0.9u 이하) + 격자 밖 북·서·동 띠 키 큰 장벽 + LM2 심장 군집. 가림 페이드는 쓰지 않는다(공용 후속).
- D-2 격자 끝까지 걷기, 외곽 덩어리·강은 격자 밖. 맵 가장자리: 지형이 이어지다 FOG-LOW 어둠으로 사라진다(순검정 띠·남색 void 금지).
- 빈 둥지에 아이 뼈·형체 없음(STY-D17), 글자·묘비 금지. 굴 입구는 남향(카메라 쪽).
- 시선 쐐기: h ≤ 0.9+1.14×D. P1은 전부 0.9u라 PASS 기준에 맞고, 쐐기로 높이는 것은 P2 선택(LM2 등). 쓰면 `rm3_wedge_masses.json`(h·D·통과)+캡슐 캡처 필요.

## 다음 할 일
1. **Unity 실행은 사용자 재부팅 전까지 금지**(CTO). 재부팅 뒤 순번은 유니티 총괄이 알린다(맵 RM은 RM-3 → RM-2 → RM-4 요청됨, 앞 순번 rmb1·RM-0·HUD·UI). 실행 조건: 실행 중 Unity 0개(HasExited=false만 셈) + 커밋 여유 20GB 이상(`Get-Counter '\Memory\Committed Bytes','\Memory\Commit Limit'`).
2. 실행: `powershell -NoProfile -ExecutionPolicy Bypass -File I:/EXODUSER-Storage/rm3/run-rm3.ps1`(Unity `G:\unity\Editor\6000.6.7f1\Editor\Unity.exe`, `-executeMethod Exoduser.Rm3SliceBuilder.All`, 로그 `I:/EXODUSER-Storage/rm3/run1.log`, 컷 `I:/EXODUSER-Storage/rm3/cuts`, FPS `rm3_fps.json`). DOTNET env 4종은 스크립트에 들어 있다. 시작 전 `unity/Tools/restore-lobby-media.cjs`·`restore-warrior-story.cjs --project E:/exoduser-wt/pc-unity-rm3/unity`는 이미 한 번 실행함(재실행해도 무해). Library는 rm1에서 robocopy로 복사해 둠(`MSYS_NO_PATHCONV=1` 필요).
3. 컴파일 오류가 나면 로그에서 고쳐 **1회만** 재실행, 같은 실패가 2번이면 멈추고 보고. 재실행 반복 금지.
4. 결과 수치 5종: ① 걷기 칸 덮임 `Data/rm3_walk_overlap.json`(0이어야) ② NavMesh 차이 `rm3_navmesh_diff.json` ③ 막힌 섬 노출 `rm3_islands.json`(uncoveredTiles 0) ④ 카메라 쪽 높이 `rm3_camera_occlusion.json`(overLimit 0)+캡슐 캡처 START·heart·cave ⑤ Hero 렌더링 레이어 `rm3_hero_layer.json`(nonDefault 0). 캡처 `rm3_{start,heart,cave,front,river}_cap.png`+`rm3_top_walk_overlay.png`, FPS 3D 켬/끔 각 1회. 결과 json은 `Data/`에 생기므로 경로 지정으로 커밋(.meta는 CH1_3 폴더 것만).
5. 커밋: 경로 지정(`git add -- <경로>`), `tools/guard.baseline.json`은 훅이 고쳐 놓으므로 `git checkout -- tools/guard.baseline.json`으로 되돌린 뒤 push. 비강제 push만. 보고는 맵 총괄(SHA·수치 5종·캡처 경로·FPS·미수정 공용 파일 확인), 참조로 유니티 총괄.
6. P1 PASS 뒤 P2(톤: si2 손그림 컬러맵 W1, 쐐기 보강 등)는 맵 총괄 지시로.

## 주의(사고 기록)
- `python -`(stdin 대기) 금지. 스크립트는 파일로 저장해 `node`/`python -I <파일>`로 실행. 오늘 02:11 빈 heredoc python이 로그 733MB를 만들어 CTO가 종료함.
- 메모리: 종료된 EXODUSER-Unity 프로세스 6개가 커밋을 붙잡아 재부팅 전엔 20GB 여유가 안 난다. 다른 세션 프로세스는 건드리지 않는다.
- headless Chrome `browser.close()`가 이 PC에서 멈출 때가 있어 추출기는 5초 race + `process.exit(0)`.
- 큰 산출물은 I:(`I:/EXODUSER-Storage/rm3`), C: 금지. 이미지·창 자동 열기 금지. 컨텍스트 100K↑이면 인계 갱신, 200K↑이면 재생성(맵 총괄이 재개).
