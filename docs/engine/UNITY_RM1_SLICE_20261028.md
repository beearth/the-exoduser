# Unity RM-1 슬라이스 (1-1 R1 START ~ R2) 구현 현황 — 2026-10-28

브랜치 `claude/unity-pc-rm1-20261027`. 명세 `E:/exoduser-wt/_out/rm1/SPEC.md`(맵 총괄), 판정: 맵 총괄(구조), 디자인총괄(시각), 톤은 ① VFX 렌더 병합(Linear·후처리) 뒤.

## 생성 방법 (멱등)
- 씬 `unity/Assets/Exoduser/Remodel/CH1_1/RM1_Slice.unity`, 빌더 `unity/Assets/Exoduser/Editor/Rm1SliceBuilder.cs`.
- `Unity -batchmode -executeMethod Exoduser.Rm1SliceBuilder.Run` (씬 생성), `.Capture -outDir <dir> -cuts start,r2,river,close,trunk,top [-capsule 1] [-shape 1]` (1600x900 컷, top=3200x2160 정사영+걷기 칸 초록), `.Fps -out <json>`.
- 좌표: 웹 px → 월드 x=px/100, z=-px_y/100 (1타일=0.4u). Core(`Runtime/Core`)는 건드리지 않고 3D 층은 렌더 전용.
- 슬라이스 창: 타일 x60~140 y138~192(패딩 포함 지형 x48~152 y126~200).

## 구조 판정 수치 (최종 빌드)
| 항목 | 값 | 파일 |
|---|---|---|
| 3D 덩어리가 덮는 걷기 칸 (중심 / 0.5칸 이상 깊이) | 0 / 0 | `Data/rm1_walk_overlap.json` |
| NavMesh vs Core 걷기 격자 (4320칸) | NavMesh만 걷기 0, Core만 걷기 0 | `Data/rm1_navmesh_diff.json` |
| 막힘 섬·돌출부 전수 점검 4건 | 모두 3D 물체로 덮임 | `Data/rm1_islands.json` |
| FPS (editor batch camera.Render, RX 9070 XT, 1600x900, START) | 3D 켬 767·934 / 끔 2286 | `Data/rm1_fps.json` |

- NavMesh는 걷기 칸 메시를 에이전트 반경 0.1u(복셀 0.04u)로 직접 굽는다. 몹 간격은 NavMeshAgent 반경으로 맞춘다.
- 카메라 쪽(걷기 칸이 북쪽 16칸 이내) 덩어리는 높이 0.9u 이하.

## 재질·실루엣
- `M_RottenWoodMembrane`(덩어리·채움), `M_CursedBark`(둥치·뿌리·가지·W8 소품): 기존 확정 아트 map3d `mass_v01`(+normal) 사용, 새 생성 이미지 없음.
- 덩어리·둥치는 절차 메시(`LumpMesh`: 슈퍼엘립스 풋프린트 상한, 밑동 로브, 테이퍼, 기울임, 노이즈, 돔형 윗면, 둥치는 부러진 윗면). 풋프린트는 항상 막힘 칸 안.
- 독액 `M_ToxicFlow`(`EXODUSER/ToxicFlow`, 불투명): 보스 아레나 수로에서 재사용. 색은 ① 병합 뒤 재조정.
- 전경 카드 `M_FgRoots`(카메라 하위, 화면 아래 모서리), 배경 카드 `M_BgTree`(바깥 덩어리 너머 6장), 풀 detail(LIFE1 색, 군락 36칸): 절차 알파 텍스처.

## 못 한 것 / 대기
- 독 스킬 터진 프레임: VFX 세션 산출물(기포·독 스킬 이펙트) 도착 뒤.
- 풀 detail·전경 카드는 어두운 Gamma 화면에서 거의 안 보임 — ① 병합 뒤 톤에서 재판정.
- 톤·색 수치(독액 노랑 등): ① 병합 뒤. `Rendering/` 자산은 ④ 차례 전까지 손대지 않음.
- 데칼은 쿼드 메시(URP Decal Projector 아님).
