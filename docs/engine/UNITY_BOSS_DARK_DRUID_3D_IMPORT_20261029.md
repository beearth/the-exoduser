# 드루이드 3D 임포트 후보 — BX-12 첫 단위 (2026-10-29)

기준: `UNITY_BOSS_BATTLE_BOARD_20261026.md` §8, `UNITY_BOSS_RM1_DARK_DRUID_20261027.md` §10, `docs/11내러티브·로어디자인/DARK_DRUID_DESIGN_LOCK.md` v0.3. 이 문서는 **후보 제작 상태**를 기록한다. 게임 아레나 3D 채택이나 전체 보스 리마스터 완료 판정이 아니다.

| 항목 | 입력 / 구현 | 현재 판정 |
|---|---|---|
| 몸·리그 | 승인된 Meshy `dd_rig_20261028_2247/rigged_character_fbx.fbx`를 `Assets/Exoduser/Remodel/Boss/DarkDruid/Source/00_Druid_Rig.fbx`로 동일 바이트 복사. SHA-256 `83A00D5FF69146A9DBA4FB57E2BE36011DACC067EB71964FCD33E3F6611E68BD`. 원본 GLB는 I:에 보존 | 24관절 / 높이 2.70m / 정점 가중치 합 오류 0은 앞선 GLB 정적 검사. Unity Humanoid와 변형은 별도 확인 필요 |
| 재질 | 같은 rigged GLB에 내장된 BaseColor·Normal·MetalRough 이미지를 추출. `Druid_MetalSmooth.png`는 glTF B=metallic, G=roughness를 URP R=metallic, A=smoothness로 변환. URP Lit, 망토 양면 | 조명·거칠기·문양은 1x 판정 전 후보 |
| 걷기 | 같은 리그의 `basic_animations_walking_fbx.fbx` → `11_Walk.fbx`. SHA-256 `EB828804A839F8DE7D224B132D7F80AA44E3F9008F15A1B6F56CF383B63D74E1` | Core 걷기 1.1px/틱과 발 접지·루트 이동 분리를 확인해야 함 |
| 2번 공격 원형 | 승인된 127 `Charged_Ground_Slam` 원본 FBX → `10_Slam127.fbx`. SHA-256 `6A44BDA495E0FCB044B25C5D2F7FBB2688F9BE75E1B746EA0FF14A659E9ED278` | 30fps GLB 측정 기준 원형 91f 중 예비 41 / 발동 12 / 회복 37. Core 60fps 목표 48 / 6 / 70. 아직 재타이밍·왼손 Mirror·지팡이 부착·튀는 키 수정 전 |
| 제작 도구 | `DarkDruidAssetBuilder.Run`은 Humanoid FBX 임포트, PBR 재질·후보 프리팹 생성, 55°/측면 1600×900 127 원형 표본 캡처. 텍스처 추출은 `unity/Tools/boss/extract_druid_textures.py` | 실행 결과는 아래 기록. 후보 씬은 기존 아레나를 교체하지 않음 |
| 런타임 | `--remodel3d`는 현재 필드용이며 아레나 진입 시 2D로 돌아감 (`NativeGame.Remodel3D.cs`) | 보스 3D 표시·Animator 동기화·실제 Player 전투 미연결 |

## 임포트·시각 확인 결과

| 실행 | 결과 | 증거 경계 |
|---|---|---|
| Unity 6000.6.7f1 첫 실행 `0a15fc2d` | 컴파일 중단: Unity 6에 없는 `ModelImporter.importMaterials` 사용. `materialImportMode`로 수정 | 코드 컴파일 실패. 로그 `I:/EXODUSER-Storage/unity-jobs/codex-boss/logs/0a15fc2d.log` |
| 수정 후 재실행 `a218424b` | 컴파일 오류 0. 세 FBX의 `FBXImporter` 동작 확인. 머티리얼 생성 전 `Generated` 디렉터리 누락으로 `CreateAsset` 예외 | 프리팹·씬·PNG 없음. 로그 `.../a218424b.log` |
| 사후 수정 | `Generated`를 머티리얼 생성 전에 만들도록 수정 | 두 차례 실패 후 공통 규칙에 따라 Unity 추가 실행 중단. 이 최종 코드의 Unity 재검증·Humanoid Avatar 유효성·1x 시각 판정은 **미확인** |

Unity 첫 임포트가 기존 `.meta` 432개와 `.asset` 1개를 다시 썼다. `I:/EXODUSER-Storage/codex-takeover/boss/unity-autoimport-20261029.patch`에 diff를 보존하고, 작업 전 HEAD에서 이 433개만 원상 복원했다. 새 작업 경로 밖에 자동 생성된 `.meta` 8개도 제거했다. 타 팀 코드·사용자 세이브 변경은 없었다(두 영수증 모두 `userSaveChanged=0`).

## 다음 제작 경계

1. 원형 127을 드루이드 리그에 리타깃하여 왼손 거울 반전, 지팡이 소켓, 48/6/70 재타이밍, 발 접지와 Key 튐을 손본다. 발동 첫 프레임과 지팡이 충돌이 일치해야 한다.
2. LOCK의 이마 인장(고리 1개를 세 뿌리가 관통), 장식·발광 범위, 망토/수염/전면 패널 추가 뼈, 1x 측·후면 변형을 디자인총괄이 판정한다.
3. 1-1 아레나의 3D 표시와 Core 좌표/상태 기반 Animator를 연결한 뒤 기능 캡처와 Player 전투를 각각 검증한다. 1-4는 같은 모델·리그를 재사용하고 L4 추가분을 제작한다. 그 다음 1-2, 1-3 순서로 진행한다.

새 유료 호출 0. 다른 보스 모델·애니메이션의 신규 유료 비용은 승인 잔여량을 확인한 뒤 진행한다.

## 2026-10-30 데모 v0 인수와 현재 형태 게이트

현행 기준은 `origin/main:docs/11내러티브·로어디자인/DARK_DRUID_DESIGN_LOCK.md` **v0.4 §16**이다. 위의 기존 Meshy 몸체·리그는 기술 참고이며, 넓은 전사형 체형의 제품 채택 판정은 **FAIL**이다. 이전 임포트·가중치 검사로 이 판정을 올리지 않는다.

| 범위 | 이번 실물·검수 | 결과·다음 경계 |
|---|---|---|
| 레퍼런스 | 키프레임 B, 노레위 `launch-boss-timeline.jpg`의 실제 81~84초 연속 프레임, LOCK v0.4, 기존 본체·지팡이·Cloth 실패 기록을 직접 확인 | 모델 → 동작 → 연출 → Unity 순서 유지. 유료 호출 0 |
| 본체 재작업 | 기존 Meshy 머리·사지·수의를 남기고 넓은 흉부 면을 절제한 뒤 늑골·쇄골·목 표면을 별도 재저작. Blender 5.2.3 무창 렌더. `I:/EXODUSER-Storage/demo-art/boss-druid/rebuild_anatomy.py`, `anatomy-review/Druid_Anatomy_Rebuild.blend` | **형태 FAIL**. 늑골이 인위적인 패널로 읽히고 목·몸 경계가 부자연스러우며 기존 깃털 어깨도 남음. 실제 수작업 조형 또는 품질이 검증된 본체 원형이 필요. 같은 자동 표면 재구성 반복 중단 |
| 증거 경계 | `anatomy-review/front.png`, `side.png`, `game55.png`, `game_size.png`, `material_front.png`는 1600×900 Blender 정적 연구. 앞·옆 근접 렌더는 전신 상하가 잘렸고, `game_size.png`에서 전신 확인 | Unity 실게임·리깅/동작·아트 PASS 증거가 아님. 원본 부모 스케일 0.01을 놓친 첫 실행은 `anatomy-rebuild/`에 별도 보존하고 판정에서 제외 |
| 런타임 채택 | 새 모델·프리팹·애니메이션을 Resources에 넣지 않음 | 모델 게이트 미통과이므로 이 후보의 후속 리깅·127 재타이밍·제품 통합·바탕화면 반영 없음 |
| 독립 표현 작업 | 기존 2D 보스에 적용 가능한 독·가시 탄과, 유효 프리팹이 없으면 기존 시트를 유지하는 선택형 3D 연결을 별도 제작 중 | 기능·빌드·Player 검수 결과는 후속 영수증으로 구분. 전체 3D 리마스터 완료 아님 |
