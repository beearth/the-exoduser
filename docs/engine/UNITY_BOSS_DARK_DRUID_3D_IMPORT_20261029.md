# 드루이드 3D 임포트 후보 — BX-12 첫 단위 (2026-10-29)

기준: `UNITY_BOSS_BATTLE_BOARD_20261026.md` §8, `UNITY_BOSS_RM1_DARK_DRUID_20261027.md` §10, `origin/main:docs/11내러티브·로어디자인/DARK_DRUID_DESIGN_LOCK.md` §16(2026-10-29 사용자 체형 교정). 이 문서는 **실패한 원본의 보존·진단 상태**를 기록한다. 게임 아레나 3D 채택이나 전체 보스 리마스터 완료 판정이 아니다.

| 항목 | 입력 / 구현 | 현재 판정 |
|---|---|---|
| 몸·리그 | 과거 Meshy `dd_rig_20261028_2247/rigged_character_fbx.fbx`를 `Assets/Exoduser/Remodel/Boss/DarkDruid/Source/00_Druid_Rig.fbx`로 동일 바이트 복사. SHA-256 `83A00D5FF69146A9DBA4FB57E2BE36011DACC067EB71964FCD33E3F6611E68BD`. 원본 GLB는 I:에 보존 | 24관절 / 높이 2.70m / 가중치 합 오류 0, Unity Humanoid 유효. **§16 사용자 직접 VISUAL FAIL: 넓은 어깨·전사형 체형이라 런타임 채택 금지** |
| 재질 | 같은 rigged GLB에 내장된 BaseColor·Normal·MetalRough 이미지를 추출. `Druid_MetalSmooth.png`는 glTF B=metallic, G=roughness를 URP R=metallic, A=smoothness로 변환. URP Lit, 망토 양면 | 조명·거칠기·문양은 1x 판정 전 후보 |
| 걷기 | 같은 리그의 `basic_animations_walking_fbx.fbx` → `11_Walk.fbx`. SHA-256 `EB828804A839F8DE7D224B132D7F80AA44E3F9008F15A1B6F56CF383B63D74E1` | Core 걷기 1.1px/틱과 발 접지·루트 이동 분리를 확인해야 함 |
| 2번 공격 원형 | 승인된 127 `Charged_Ground_Slam` 원본 FBX → `10_Slam127.fbx`. SHA-256 `6A44BDA495E0FCB044B25C5D2F7FBB2688F9BE75E1B746EA0FF14A659E9ED278` | 30fps GLB 측정 기준 원형 91f 중 예비 41 / 발동 12 / 회복 37. Core 60fps 목표 48 / 6 / 70. 아직 재타이밍·왼손 Mirror·지팡이 부착·튀는 키 수정 전 |
| 제작 도구 | `DarkDruidAssetBuilder.Run`은 Humanoid FBX 임포트, PBR 재질·**검사용** 프리팹 생성. `Capture`는 bind/walk/slam127의 정면 55°·측면·후면 1600×900 캡처 30장과 발 본 위치 CSV를 생성한다. `Audit`은 메시/본 구조, `BuildLeanStudy`·`BuildCursedStudy`는 원본과 분리된 리그 비율 시안을 생성한다. 텍스처 추출은 `unity/Tools/boss/extract_druid_textures.py` | 원본·두 비율 시안 모두 VISUAL FAIL. 도구는 관찰용이며 기존 아레나를 교체하지 않음 |
| 런타임 | `--remodel3d`는 현재 필드용이며 아레나 진입 시 2D로 돌아감 (`NativeGame.Remodel3D.cs`) | 보스 3D 표시·Animator 동기화·실제 Player 전투 미연결 |

## 임포트·시각 확인 결과

| 실행 | 결과 | 증거 경계 |
|---|---|---|
| Unity 6000.6.7f1 첫 실행 `0a15fc2d` | 컴파일 중단: Unity 6에 없는 `ModelImporter.importMaterials` 사용. `materialImportMode`로 수정 | 코드 컴파일 실패. 로그 `I:/EXODUSER-Storage/unity-jobs/codex-boss/logs/0a15fc2d.log` |
| 수정 후 재실행 `a218424b` | 컴파일 오류 0. 세 FBX의 `FBXImporter` 동작 확인. 머티리얼 생성 전 `Generated` 디렉터리 누락으로 `CreateAsset` 예외 | 프리팹·씬·PNG 없음. 로그 `.../a218424b.log` |
| 새 작업 차수 `d48c4898` | `Generated` 생성 순서 수정 후 `Run` 성공. 컴파일 오류 0·Humanoid 유효·검사 프리팹/재질/씬/12 PNG 생성 | 기술 임포트 통과. 디자인 판정과 별개 |
| 카메라·접지 검사 `024e1f50`, `0069d3b5` | 55° 정면/후면과 측면 1600×900으로 bind·walk·slam127 30 PNG 및 발 본 CSV 생성. 두 실행 모두 컴파일·실행 오류 0·사용자 세이브 변경 0 | `I:/EXODUSER-Storage/codex-takeover/boss/druid3d-fourth/`. 정면에서 수평 깃털 어깨·두꺼운 흉부·대칭 직립 확인. 127 f53 측면은 몸이 크게 쏠리고 발이 뜸. **VISUAL FAIL** |
| 메시/비율 시안 `05a5ed87`, `4a75135c`, `994d3c3e`, `17b92298`, `8154c7fc` | 원본은 skinned renderer 1개/정점 97,685개/24본. E: 35.1GB 상태에서 원본을 보존한 채 본 스케일 두 시안 생성·30 PNG씩 촬영. 컴파일 오류 0, 사용자 세이브 변경 0 | `druid3d-audit/`, `druid3d-lean-study/`, `druid3d-cursed-study/`. 두 시안 모두 흉갑 같은 깃털·근육 텍스처·큰 발·정중앙 자세를 해결하지 못함. **VISUAL FAIL**, 원본 리그에 채택하지 않음 |
| 제작법 변경 실험 `f401a10f`, `9a2d935d`, `09abf5b4`, `0ac82cb4` | 본 스케일 두 번 실패 뒤 원본 두개골·뿔만 남겨 별도 유기형 회색 조형을 리그에 붙인 블록아웃, 그리고 원본 97,685정점의 부위별 조형 복사본을 각각 제작·30 PNG 촬영. 두 실험 모두 Unity 컴파일 오류 0·사용자 세이브 변경 0 | `druid3d-resculpt-blockout/`: 어깨·팔·다리 이음새가 끊기고 임시 원시형이 노출. `druid3d-vertex-sculpt/`: 복부 UV가 늘어나고 원본의 갑옷형 흉부·망토가 남음. 둘 다 **형태 FAIL**, 도구/프리팹은 I: 실험 보관소에만 보존하고 제품 브랜치에 넣지 않음 |

Unity 첫 임포트가 기존 `.meta` 432개와 `.asset` 1개를 다시 썼다. `I:/EXODUSER-Storage/codex-takeover/boss/unity-autoimport-20261029.patch`에 diff를 보존하고, 작업 전 HEAD에서 이 433개만 원상 복원했다. 새 작업 경로 밖에 자동 생성된 `.meta` 8개도 제거했다. 타 팀 코드·사용자 세이브 변경은 없었다(두 영수증 모두 `userSaveChanged=0`).

### 발 접지·동작 측정

`foot_positions.csv`는 본 기준이다. 원본 bind의 좌/우 발 본 Y=0.202/0.208m, walk 0/15/30f는 0.352/0.219, 0.219/0.416, 0.402/0.216m다. slam127 53f는 0.338/0.299m로 두 발이 같이 상승한다. 발 메시 바닥과 동일한 값은 아니지만, 55° 1x 및 측면 정지 사진에서 53f의 공중 쏠림과 일치한다. Root Y는 모든 표본에서 0이다. 127 원형은 48/6/70 재타이밍·왼손 Mirror·접촉 키 보정 전이다.

## 다음 제작 경계

1. §16에 맞춰 **새 본체를 원형부터 조형하고 UV/텍스처·스킨을 다시 만든다.** 목표는 정수리 2.30m/뿔 끝 2.70m, 몸통 폭 0.44m/망토 포함 0.70m, 처진 비대칭 어깨, 꺼진 흉곽, 긴 전완, 가는 종아리와 작은 발이다. 기존 FBX·비율 시안·실패한 절차 조형은 참고/실패 증거만 남긴다. 폭 축소·기존 메시 정점 밀기·원시형 리그 조립을 반복하지 않는다. 새 유료 생성·리깅은 승인 상한 밖이라 이 차수 0회. 55° bind/walk/slam의 무채색 1x에서 전사형 V와 부위 이음새가 사라지는 것을 먼저 검수한다.
2. 새 리그가 이 기준을 통과하면 원형 127을 리타깃하여 왼손 Mirror, 48/6/70 재타이밍, 발 접지·접촉 키를 손본다. 그 뒤 지팡이 소켓, 정본 인장(고리 1개를 세 뿌리가 관통), Emission `#9ea83a`, 망토/수염 추가 뼈를 검수한다.
3. 1-1 아레나의 3D 표시와 Core 좌표/상태 기반 Animator를 연결한 뒤 기능 캡처와 Player 전투를 각각 검증한다. 1-4는 같은 모델·리그를 재사용하고 L4 추가분을 제작한다. 그 다음 1-2, 1-3 순서로 진행한다.

새 유료 호출 0. 다른 보스 모델·애니메이션의 신규 유료 비용은 승인 잔여량을 확인한 뒤 진행한다.
