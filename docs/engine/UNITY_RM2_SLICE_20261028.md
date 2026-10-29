# Unity RM-2 슬라이스 (1-2 뒤틀린 숲길) 구현 현황 — 2026-10-28

브랜치 `claude/unity-pc-rm2-20261028`. 명세 `E:/exoduser-wt/_out/rm-ch1/SPEC_RM2_4.md`, 계획 `UNITY_RM2_PLAN_20261028.md`(P0 PASS 2cbbf73b4). 판정: 맵 총괄(구조), 디자인총괄(톤, ① VFX 렌더 병합 뒤).

## 상태 (P1 구조 블록아웃)
- **코드 작성·컴파일 확인 완료, Unity 실행은 아직 안 했다.** CTO 지시(10-28)로 사용자 재부팅 전까지 Unity 실행 금지, 실행 순번은 재부팅 뒤 8번(RM-3 → RM-2 → RM-4).
- 컴파일 확인: 에디터 설치본의 UnityEngine/UnityEditor 모듈 DLL + RM-1 Library의 Cinemachine·Navigation·URP DLL을 참조한 Roslyn(csc 8.0.301) 단독 컴파일 — 오류 0, 경고만(RM-1과 같은 `FindFirstObjectByType` 계열 deprecated). 에디터 실행이 아니다(메모리 공지 준수). 실제 동작은 첫 실행에서 확인한다.
- 아래 "이번 단계에서 뺀 것"은 구조 판정 PASS 뒤 룩 단계로 넘긴다.

## 파일
| 경로 | 내용 |
|---|---|
| `unity/Assets/Exoduser/Editor/Rm2SliceBuilder.cs` | 멱등 빌더. `Run`(씬 생성), `Capture`(컷·탑뷰), `Wedge`(시선 쐐기 캡슐 검사), `Fps`. RM-1 코드는 읽기만 하고 필요한 부분(LumpMesh·TubeMesh·카메라·NavMesh)을 복사해 씀 |
| `unity/Assets/Exoduser/Remodel/CH1_2/Data/ch1_2_walk.json` 외 | 웹 정답(P0). 빌더는 `rows`(걷기 격자)와 `blockedIslandsInsideWalk`를 읽음 |
| `Data/rm2_build.json` | 계획(`tools/rm2/ch1_2_plan.json`)을 풀어 쓴 빌더 입력. `node tools/rm2/gen_build_data.mjs`로 생성(막힘 칸만, 걷기 칸 제외) |
| `tools/rm2/run-rm2.ps1` | 실행기. Unity/EXODUSER-Unity 실행 중이면 대기(exit 2), 커밋 여유 20GB 미만이면 대기(exit 3), 끝나면 프로세스 종료 확인. Library는 RM-1에서 `robocopy /E /XJ` |

실행(순번이 되면): `tools/rm2/run-rm2.ps1 -Step Run` → `-Step Cap` → `-Step Wedge` → `-Step Fps`. 산출물(캡처·로그·FPS)은 `I:/EXODUSER-Storage/rm2/`, 판정 json은 `Remodel/CH1_2/Data/rm2_*.json`.

## 만드는 것
| 항목 | 방식 |
|---|---|
| 씬 | `Remodel/CH1_2/RM2_Slice.unity` (World / Blockout / Toxic / Lights / Shafts / NavWalk / Main Camera / CM LOOK-001 / Player Marker(START 100,185)) |
| Terrain | 타일 x20~180 y4~198, 걷기 칸 높이 0. 막힘 칸은 걷기까지 거리로 솟되 **시선 쐐기로 상한**(`h ≤ (0.9 + tan0.85 × D) × 0.92`). 독액 칸 −0.34 함몰, 마른 물길 −0.04. 스플랫 3레이어(RM-1 확정 바닥 floor_v01b~03b 읽기 전용 참조, 세부 질감) |
| 덩어리 | RM-1 LumpMesh(슈퍼엘립스 풋프린트 상한, 밑동 로브, 테이퍼, 기울임, 노이즈, 돔형·부러진 윗면). 걷기 칸에 닿으면 8번까지 줄여 보고 안 되면 배치 안 함. 높이는 쐐기 상한 |
| 랜드마크 | LM1 쓰러진 거목(섬 위 뿌리판 + 눕힌 통나무 ≤0.9u), LM2 둑(낮은 덩어리 + 뿌리 둘), LM3 기운 쌍둥이 고목(서로 기울임 + 아치 가지), LM4 이랑 버섯밭(이랑 4 + 줄기 달린 큰 버섯 16), LM5 매달린 고목(가지 셋 + 줄에 매달린 고치 셋) |
| 채움 | 웹 충돌 섬 전부(F1 첫 눈버섯, F2 제단, F3 야영지, F4 고치, F5 게이트 기둥, F6 보스방 기둥 4) + TX4 웅덩이 섬 그루터기. 남는 칸은 `IslandFill_*` 작은 덩어리(막힘 칸 안만) |
| 독액 | `M_ToxicFlow_RM2`(`EXODUSER/ToxicFlow` 셰이더 재사용), TX1~TX4를 막힘 칸 타일 사각형으로. 마른 물길(DRY)은 독액 아님 |
| 조명 | RM0-LIGHT 기본값(키 (1,.80,.70)×0.6, Trilight, `GlobalVolume_Hell`), `Lights/Pools/Pool_Hell_01~14`(범위 5.6u, 6.5), `Pool_Toxic_01~04`, 빛줄기 3, 안개 FOG-LOW |
| 카메라 | LOOK-001(pitch .85, 14u, FOV 35.6°) + Cinemachine Follow, 마커 START |
| NavMesh | 걷기 타일 메시를 반경 0.1u로 직접 굽고 Core 걷기 격자와 대조 |

## 판정 수치 5종 — 어디서 나오나
| # | 수치 | 산출 |
|---|---|---|
| 1 | 걷기 칸 덮임 (중심 / 0.5칸 이상) | `Run` → `Data/rm2_walk_overlap.json`, 탑뷰 `Cap -cuts top` → `rm2_top_walk_overlay.png` |
| 2 | NavMesh 차이 (NavMesh만 / Core만) | `Run` → `Data/rm2_navmesh_diff.json` |
| 3 | 보이지 않는 벽 (섬 11개 덮임) | `Run` → `Data/rm2_islands.json` (`uncoveredBeforeFill`, `uncoveredAfterFill`) |
| 4 | 카메라 쪽 가림 — 시선 쐐기 | `Run` → `Data/rm2_wedge.json`(0.9u 초과 덩어리 목록·h·D·cap), `Wedge` → `Data/rm2_wedge_result.json`(캡슐 머리·몸통 가시 여부) + `wedge/rm2_wedge_sheet_NN.png`. START + REP-A·B·C 캡슐 컷은 `Cap` |
| 5 | `Hero` 렌더링 레이어 사용 0 | `Run` → `Data/rm2_hero_layer.json`(전 렌더러 기본 마스크) |
| 6 | 렌더된 객체 위치 (RM-3 교훈: 수치 PASS여도 메시가 원점에 쌓일 수 있음) | `Run` → `Data/rm2_render_bounds.json`(World·Blockout 항등 변환, 모든 MeshRenderer 경계 중심이 터레인 창 +6u 안·원점 0개) |
| — | FPS 3D 켬/끔 | `Fps` → `rm2_fps.json` |

## 이번 단계에서 뺀 것 (구조 PASS 뒤 룩 단계)
- W1 바닥 컬러맵(맵 총괄 결정: si1 전용 기존 그림 landmark_center 지면 1안, 1-1 청크 재배치 비교용 2안) — 8192² 마스터에서 컬러맵을 만드는 도구가 먼저 필요하다. 구조 단계는 RM-1 바닥 질감 스플랫 3레이어로 대체.
- 풀 detail, 데칼(피 웅덩이·젖은 기슭·마른 물길 갈라짐), 전경·배경 카드, 버섯 눈·고치 흔들림 같은 W4~W6 요소. 독액 색·기포는 ① VFX 렌더 병합 뒤.
- 보스방 연출(보스전 총괄 범위): 게이트·기둥은 0.9u 이하 구조 블록만.

## 알려진 위험
- 첫 Unity 실행 전이라 Library가 없다(RM-1에서 복사 필요), 컴파일은 확인했으나 런타임 동작(예: NavMesh 굽기 시간, MeshCollider cooking, 터레인 해상도 메모리)은 미확인이다.
- 쐐기 캡은 풋프린트 가장자리 기준 보수 계산이다. 통과해도 Wedge 캡슐 검사로 따로 확인한다.

## 실행 규칙 (맵 총괄 10-28 사용자 지시 반영)
- 무창·무음: `run-rm2.ps1`은 `-batchmode`(`-nographics` 없음 = GPU RenderTexture 캡처)·`Start-Process -WindowStyle Hidden`, 빌더 진입점 4개(Run·Capture·Wedge·Fps) 모두 `AudioListener.volume = 0`. `-popupwindow`·전체화면·보조 모니터 창 없음.
- Unity 잠금: 실행 전에 `I:\EXODUSER-Storage\unity-jobs\_pc_lock.json`을 `CreateNew`로 만들고(owner `rm-2`, pid) 끝나면 `finally`로 지운다. 이미 있으면 기록된 pid가 죽었을 때만 stale로 보고 교체, 아니면 `WAIT`(exit 2). Library를 복사할 원본이 없으면 커밋 여유 30GB, 있으면 20GB.
- 좌표 패턴 점검(RM-3 "로컬 값을 월드로 넘김"): 빌더의 모든 위치는 월드 값(`SetPositionAndRotation`·월드 좌표 메시 정점)이며 `World`·`Blockout`이 항등 변환이라 맞다. 이 전제를 `RenderBoundsCheck`가 실행 때마다 검사한다.
- 에디터 캡처는 RM-INT 전까지 참고용이다. 보고에 "런타임 미연결"을 적는다.
