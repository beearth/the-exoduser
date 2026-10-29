# 데모 v0 전사 Blender 후보 — 2026-10-30

작업 범위는 데모의 전사 한 명이다. 실버테일·아이반·추가 로스터는 이번 작업에서 제외한다. 기준은 `WARRIOR_DESIGN_LOCK.md`와 `assets/charselect/warrior_cut.png`다.

## 실제 실행 대상과 입력

| 항목 | 확인 내용 |
|---|---|
| 키샷 소스 | `G:/exoduser-wt/codex-unity-visual/unity/Assets/Exoduser/Runtime/NativeGame.cs` 297~301: `SpriteRenderer`에 `Art/player/<direction>` 48×48 및 공격 80×80을 설정 |
| 현재 선택 | `NativeGame.M1Check.cs` 전사 선택→1-1 진입, 로비는 다른 네 외형을 Coming soon으로 표시 |
| 실제 화면 | `I:/EXODUSER-Storage/steam-keyshot/before/01-탐험.png` 직접 확인. 중앙 영웅은 스프라이트다 |
| 3D 입력 | `I:/EXODUSER-Storage/Meshy/warrior_rig_20261027_2025/rigged_character_glb.glb` — 승인 이력의 기존 전사 리그 |
| 차이 | 승인 3D 원형은 현재 런타임에 연결되지 않았다. Blender 후보 확보를 게임 적용으로 세지 않는다 |
| 소유 | `G:/exoduser-wt/demo-art-character`, `codex/demo-art-character-20261030`. 공용 조명·카메라·씬·Core 수정 없음 |

## 실물 제작과 비교 계약

| 항목 | 값 / 방법 |
|---|---|
| 실행 | `G:/blander/blender.exe -b -P character_candidate.py` |
| 출력 | `I:/EXODUSER-Storage/demo-art/character/warrior-r1/` |
| 보정 한 건 | 뒤쪽 암적색 천을 색·공간 마스크로 한정해 `CapeSilhouette_R1` shape key로 벌리고 후방 볼륨을 추가 |
| 범위 | 정규화 높이 0.16~0.78, 후방 깊이 0.055m 초과, R/G 1.16·R/B 1.10 초과. 천 lateral 오프셋 계수 0.48, 후방 최대 0.055m, 높이 sine 감쇠 |
| 보존 | Basis·정점 수·면 수·UV·스킨 가중치·본 rest matrix를 전후 fingerprint로 대조. 원본 파일 수정 없음 |
| 비교 | 정면·후면 768² before/after, 1920×1080 게임 크기 proxy before/after. 전후 카메라·조명·크기 동일 |
| 카메라 | 원본 `NativeRemodel3D.Pitch=0.85rad`, 영웅 높이 목표 9.5%. 정사영 Blender 근사이며 Unity 실제 카메라 캡처가 아님 |
| 재질 | 원본 텍스처·노멀 보존. 노멀 강도 manifest 기록. 카메라/광원으로 형태 결함을 숨기지 않음 |
| 투영 텍스처 | 미수행. 원화는 동작 포즈라 neutral rig와 투영 대응점이 불일치. 단순 평면 투영으로 얼굴·갑옷을 훼손하지 않음 |
| 리깅 | 새 Rigify/유료 리깅 불필요: 기존 24본/가중치 보존. 기존 클립과의 실제 변형·망토 관통은 별도 검수 필요 |

현재는 제작/오프라인 비교 단계다. 대검 조립·망토 다리 가중치·원화 투영/얼굴 확대검수·Unity import/Player 검수 전에는 제품 PASS로 올리지 않는다. 최종 수치·원본 해시·자체 판정은 산출 manifest와 기존 character REPORT에 기록한다.

## R1 실제 결과

| 게이트 | 결과 |
|---|---|
| Blender 실행 | exit 0, 정면/후면/게임 크기 before·after 총 6장, `.blend`·GLB 생성 |
| 보정 | 전체 97,656정점 중 24,196정점의 후보 shape key. 61,981면, 키 1.8500004m |
| 원본 SHA-256 | `10339894aa3e7f8c8ff50b5425ad193a323b19c7ce5d2c4ab256214a7da4c561` |
| 보존 대조 | Basis topology·UV·가중치·본 rest matrix 전후 동일. 원본 SHA 재확인 동일 |
| GLB 재임포트 | exit 0, 24본 이름 집합 보존·스킨 modifier 존재·`CapeSilhouette_R1` 기본값 1 확인 |
| 직접 본 이미지 | 원화·키샷 before 탐험·before/after 후면·after 정면·after 게임 크기 근사 |
| 자체 시각 판정 | **오프라인 망토 폭 탐색 RETOUCH**. 옆으로 벌어진 천 폭은 보이나 큰 찢김 틈이 드러나며, 대검 없는 중립 포즈라 원화의 전체 전투 실루엣 완성으로 세지 않음 |
| 게임용 전체 | **미검증/채택 보류**. 3D runtime 연결·실게임 배경·원화 투영 텍스처·얼굴 정밀 보정·클립 변형 검수 없음 |
| Export 경고 | 여러 texture node가 같은 texture sampler를 공유한다는 glTF 경고. Unity sampler/노멀 import 검사 필요 |
| 다음 실물 | 대검 소켓/파지와 망토 찢김/가중치를 실제 메시·포즈에서 보정한 후보. 색·광원으로 덮지 않음 |

`review.html`에 원화·후면 전후·게임 크기 근사를 연결했다. `validation.json`은 Blender GLB 재임포트 증거이며 Unity/Player 영수증이 아니다. 현재 키샷 담당의 파일·Unity 실행·바탕화면 빌드·통합 branch는 변경하지 않았다.
