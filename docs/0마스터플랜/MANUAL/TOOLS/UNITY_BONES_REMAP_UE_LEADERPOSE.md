# TOOLS — 장비 갈아입기: Unity SkinnedMeshRenderer.bones 재매핑 · UE Leader Pose (2026-11-05, 클라우드 조사)

## ① 목적 · 단계
- 장비 파트 FBX(같은 스켈레톤에 스키닝, TOOLS 2·3)를 런타임에 캐릭터 본 계층에 **메시 교체만으로** 붙인다(과제 C3 "A↔B·투구만 교체"). Core 인벤토리 이벤트 → 표현 교체의 연결은 CHARACTER_PIPELINE §4에서 명세(코드 변경은 승인 뒤).

## ② 입력 형식
- 캐릭터 프리팹(스켈레톤 FBX, Humanoid 아바타, 본 이름 = DEF 표준), 장비 파트 프리팹(SkinnedMeshRenderer 1개, `bones` 이름이 같은 표준, bindposes 포함).

## ③ 옵션 전수표
| 옵션 | 무엇을 바꾸나 | 우리 설정값 | 근거 출처 |
|---|---|---|---|
| Unity 교체 방식 A: **bones 재매핑**(파트 SMR의 `bones[]`를 이름으로 캐릭터 본에 다시 연결, `rootBone` 교체) | 메시 1개 추가로 갈아입기, 바인드 포즈는 파트 메시 것 유지 | **채택**(이름 기반, 누락 본 카운트) | discussions.unity.com 797976·200209 재매핑 스크립트 `[발췌]`; docs.unity3d.com class-SkinnedMeshRenderer(비최적화 메시는 본 순서 의존, Optimize면 이름 기반·`bones` 비어 있음) `[발췌]` |
| Unity 방식 B: 프리팹에 모든 장비 SMR을 미리 넣고 enable 토글 | 가장 단순, 메모리 ↑ | 데모 v0 세트 ≤3개면 허용(백업안) | discussions.unity.com 591197 `[발췌]` |
| Unity 방식 C: `Mesh.CombineMeshes`로 하나로 합침(bindposes = `bone.worldToLocalMatrix * root.localToWorldMatrix`) | 드로우콜 최소, 교체마다 재합성 비용 | 보류(픽셀 렌더에서 드로우콜 병목 확인 뒤) | discussions.unity.com 423207 코드(2015, 구버전) `[발췌]` |
| Optimize Game Objects(Rig) | 켜면 `SkinnedMeshRenderer.bones`가 비어 재매핑 방식 A가 **불가** → 이름 기반 자동 매칭에 의존 | 장비 교체 실험 중 **끔**(Extra Transforms 불필요), 최종은 실측 뒤 결정 | docs.unity3d.com class-SkinnedMeshRenderer `[발췌]` |
| `SkinnedMeshRenderer.quality` / Quality ▸ Skin Weights | 정점당 본 수 | 4 Bones | docs.unity3d.com SkinnedMeshRenderer.quality `[발췌]` |
| `updateWhenOffscreen` · `localBounds` | 파트별 바운드 | 파트는 캐릭터 바운드 복사 | 통념 `[미검증]` |
| 재질 슬롯·틴트 | 등급 색 변주(마스크 틴트) | 세트 아틀라스 1 + MaterialPropertyBlock 틴트 | CH 브리프 §1-4(과제 C4) |
| UE 방식 A: **Leader Pose Component**(`SetLeaderPoseComponent`) | 자식 메시는 본 트랜스폼 버퍼 없이 리더를 따름, 설정 최소·게임스레드 최저, **자식 스켈레톤은 리더의 부분집합이며 본 추가·건너뛰기 불가**, 렌더 비용은 그대로 | **채택**(파트 = 같은 스켈레톤) | dev.epicgames.com working-with-modular-characters `[발췌]`; SetLeaderPoseComponent API `[발췌]` |
| UE 방식 B: Copy Pose From Mesh(AnimGraph) | 일치 본만 복사, 나머지 레퍼런스 포즈; 물리·독립 애니 가능, 가장 비쌈 | 망토 물리 실험에만 | 〃 |
| UE 방식 C: Skeletal Mesh Merge | 런타임 병합, 렌더스레드 최저·설정 비용 최고 | 보류 | 〃(설정 절차 미확인 `[미검증]`) |
| UE 임포트: Skeleton 지정(기존 스켈레톤 재사용) | 파트가 같은 Skeleton 에셋 공유 | 스켈레톤 FBX의 Skeleton 선택 | 통념 `[미검증]` |

## ④ 절차
1. 장비 파트 FBX 임포트: Rig ▸ Humanoid ▸ **Copy From Other Avatar**(캐릭터 아바타), Optimize Game Objects 끔(실험 중).
2. 교체 컴포넌트(표현 레이어): 캐릭터 본 사전 `Dictionary<string, Transform>`를 1회 구축 → 파트 프리팹 인스턴스의 SMR에 대해 `bones[i] = dict[part.bones[i].name]`, `rootBone = dict["Hips"]`, 누락 본은 로그 후 `Hips`로 대체(0이어야 정상) → 파트 자체 아마추어 오브젝트 삭제 → 캐릭터 루트 자식으로 이동.
3. 슬롯 교체: `Dictionary<slot, GameObject>`로 현재 장비 보관, 같은 슬롯 장착 시 이전 파트 Destroy/풀 반환, 바디 영역 숨김은 TOOLS 3 영역 ID 표로 `BD_*` 렌더러 enable 토글.
4. 재질: 세트 아틀라스 재질 공유, 등급 틴트는 MaterialPropertyBlock.
5. UE: 캐릭터 BP Construction Script에서 베이스 바디를 리더로, 각 파트 SkeletalMeshComponent에 `Set Leader Pose Component(Target = 파트, New Leader = 바디)`; 교체는 `SetSkeletalMeshAsset` 교체만.

## ⑤ 출력 형식 · 네이밍
- Unity 프리팹 `CH_<영웅>`(스켈레톤+BD 파트), `EQ_<슬롯>_<세트>` 파트 프리팹(SMR 1, 아마추어 없음). 교체 컴포넌트 이름은 CH 레인 설계서에서 확정.

## ⑥ 검수 방법
- A↔B 세트 교체·투구만 교체·무기 교체(TOOLS 4) 각 3회: 즉시 반영, 누락 본 로그 0, 이전 파트 잔류 0.
- 1x 픽셀 렌더에서 A·B 실루엣 구분(과제 C3 합격선), 33° 1x·3x 캡처(`MANUAL/img/tools-swap-{before,after}.png`).
- Frame Debugger 드로우콜 표(1안·2안 파트 수별), Skin Weights 4 변형 일치.
- UE 같은 조립 1회(과제 C5)에서 Leader Pose 자식이 리더 애니를 따름.

## ⑦ 금지 · 흔한 실패
- 파트 FBX의 본 이름이 하나라도 다르면 재매핑 누락 → 늘어난 메시(이름 표준 TOOLS 1 위반).
- Optimize Game Objects를 켠 상태에서 `bones` 재매핑 시도(`bones` 비어 있음).
- 파트 SMR을 추가하면서 파트 자신의 아마추어를 남겨 두 스켈레톤이 공존(애니 덮어쓰기 사례).
- UE Leader Pose 자식에 리더에 없는 본(망토 체인)을 넣으면 불가 → 망토는 리더 스켈레톤에 미리 포함.
- Core 인벤토리 코드 수정 금지. 표현 레이어만, 승인 뒤 구현.

## ⑧ 실습 기록
- Mac 실습 대기(과제 C3·C5). 기록: 교체 방식(A/B), 누락 본 수, 드로우콜, 교체 지연, 캡처, UE Leader Pose 결과, SHA.
