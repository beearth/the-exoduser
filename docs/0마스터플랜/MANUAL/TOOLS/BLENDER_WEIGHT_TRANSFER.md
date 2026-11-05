# TOOLS — Blender 웨이트 전사: Data Transfer 모디파이어 · Transfer Weights (2026-11-05, 클라우드 조사)

## ① 목적 · 단계
- 베이스 바디의 스킨 웨이트를 장비 파트(가슴·투구·장갑·각반·신발·망토 밑단)로 **전사**해 파트마다 다시 칠하지 않는다(CH 브리프 §1-3 "파트별로 뽑아 작업하는 게 쉽지 않다"의 해답 후보). 리깅(TOOLS 1) 뒤, 파트 분할(TOOLS 3)과 같은 세션에서 한다.

## ② 입력 형식
- 소스: 웨이트가 완성된 베이스 바디(Vertex Groups = DEF 표준 본 이름, Normalize All 완료).
- 대상: 같은 월드 위치에 놓인 장비 파트 메시(베이스 바디 위에 모델링, 겹침 상태). 아마추어 모디파이어는 전사 뒤에 추가.

## ③ 옵션 전수표
| 옵션 | 무엇을 바꾸나 | 우리 설정값 | 근거 출처 |
|---|---|---|---|
| Data Transfer: Source Object | 웨이트 원본 | 베이스 바디 | docs.blender.org/manual/en/dev/modeling/modifiers/modify/data_transfer.html `[발췌]` |
| Object Transform | 두 오브젝트의 월드 변환 고려 | 켬(겹쳐 놓았으면 둘 다 가능) | 〃 "월드에서 겹치지 않으면 끔" |
| Mix Mode / Mix Factor | 기존 값과 혼합 방식·비율 | Replace / 1.0 | 〃 |
| Vertex Data → Vertex Groups 토글 | 전사 데이터 종류 | Vertex Groups 켬(UV·Custom Normals 끔) | 〃 |
| Vertex Mapping: Topology / Nearest Vertex / Nearest Edge Vertex / Nearest Edge Interpolated / Nearest Face Interpolated / Projected Face Interpolated | 소스 정점을 찾는 법 | **Nearest Face Interpolated**(장비는 바디와 토폴로지가 다름). Topology는 복제 메시에만 | 〃; Python API POLYINTERP_NEAREST `[발췌]` |
| Max Distance / Ray Radius | 매핑 거리 제한 | Max Distance 켬 0.05m(두꺼운 장비 0.1) | 〃 |
| Layer Selection: Active / **By Name** / All Layers · Layer Mapping: By Name | 어떤 그룹을 어떤 그룹으로 | By Name / By Name(이름이 DEF 표준으로 같아야 함) | 〃; developer.blender.org/T47173 `[발췌]` |
| Generate Data Layers 버튼 | 대상에 없는 그룹 생성 | 전사 전 1회 | 〃 |
| Vertex Group(모디파이어) + Invert | 전사 영향 영역 제한 | 이음새·부착 부위만 전사할 때 사용 | 〃 |
| Weight Paint ▸ Weights ▸ Transfer Weights(연산자) | 모디파이어와 같은 엔진, 즉시 적용 | 간단 파트는 이것: Source Layers Selection **By Name**, Vertex Mapping Nearest Face Interpolated | docs.blender.org …/weight_paint/editing.html `[발췌]`; T47093 `[발췌]`(기본은 Active Layer만 → By Name으로 바꿔야 함) |
| Weights ▸ Normalize All(Lock Active 끔) | 정점 합 1 | 전사 뒤 1회 | docs.blender.org …/weight_paint/editing.html `[발췌]` |
| Weights ▸ **Limit Total** | 정점당 영향 본 수 상한 | 4(Unity Skin Weights 4·UE 기본 호환) | 매뉴얼 원문 미확인 `[미검증]`(이름·기본값 4는 통념); Unity 쪽 근거 QualitySettings.skinWeights `[발췌]` |
| Weights ▸ Clean(Subset All Groups, Limit 0.001, Keep Single) | 미세 가중치 제거 | 켬 | 〃 |
| Weights ▸ Smooth(Factor·Iterations·Expand) | 이음새 가중치 블렌드(정점 선택 마스크 필요) | 이음새 링에 Factor 0.5·Iterations 3 | 〃 |
| Vertex Weights 패널 수치 | 개별 정점 확인 | 이음새 정점 쌍이 **같은 값**인지 | 〃 |

## ④ 절차
1. 장비 파트를 베이스 바디 위 겹침 위치에 두고(원점·스케일 동일, 변환 적용), Vertex Groups 비움.
2. Data Transfer 모디파이어 추가 → Source 베이스 바디 → Vertex Data ▸ Vertex Groups → Nearest Face Interpolated → Layer Selection By Name / Layer Mapping By Name → `Generate Data Layers` → Apply.
3. Weight Paint: Normalize All → Limit Total 4 → Clean 0.001 → 이음새 링 정점만 선택해 Smooth.
4. Armature 모디파이어 추가(= TOOLS 1 리그), 파트 부모 = 리그. idle 포즈 2~3개로 뚫림 확인.
5. 두꺼운 장비(어깨 갑주·투구 챙)는 전사 뒤 바깥 쉘 정점에 상위 본 가중치를 100%로 손질(접힘 방지).

## ⑤ 출력 형식 · 네이밍
- 파트 .blend 안 오브젝트 `EQ_<슬롯>_<세트>`(예 `EQ_armor_A`), Vertex Groups = DEF 표준 이름만(빈 그룹 삭제). FBX는 TOOLS 3·5 규칙으로 함께 내보냄.

## ⑥ 검수 방법
- 같은 idle·attack 프레임에서 바디/장비 두 메시의 이음새 정점 가중치 표 5점 비교(수치 동일).
- 33° 1x·3x 캡처에서 겹침 뚫림 0(`MANUAL/img/tools-weights-{before,after}.png`, 전 = 전사 전 뚫림, 후 = 전사·Limit Total 뒤).
- Unity 임포트 뒤 Skin Weights 4로 같은 포즈 비교(Blender 뷰포트와 변형 일치).

## ⑦ 금지 · 흔한 실패
- Vertex Groups 이름이 DEF 표준과 다르면 By Name 매핑이 비어 전사 0(가장 흔함).
- Object Transform을 끈 채 월드 위치가 다르면 엉뚱한 정점 매핑.
- Limit Total 없이 내보내면 Unity가 5번째 이상 영향을 버려 Blender와 변형이 달라짐.
- 전사 뒤 Normalize 생략 → 합 ≠ 1로 늘어남·찌그러짐.
- 전사 뒤 베이스 바디 웨이트를 바꾸면 모든 파트 재전사(순서: 바디 완성 → 파트 전사).

## ⑧ 실습 기록
- Mac 실습 대기(과제 C2). 기록: 소스·대상 정점 수, 매핑 모드, Max Distance, 전·후 이미지, 뚫림 수, 소요 시간, SHA.
