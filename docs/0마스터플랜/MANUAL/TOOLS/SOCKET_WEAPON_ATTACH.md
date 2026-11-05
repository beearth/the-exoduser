# TOOLS — 소켓 · 무기 부착 (Blender 소켓 본/Empty → Unity Transform · UE Socket) (2026-11-05, 클라우드 조사)

## ① 목적 · 단계
- 무기·방패·활·배낭을 손/등 소켓에 붙이고 즉시 교체한다(과제 C3 "무기 소켓 교체"). 소켓은 공용 스켈레톤(TOOLS 1)에 **비변형 본**으로 두어 엔진 독립으로 가져간다.

## ② 입력 형식
- 공용 스켈레톤(`Weapon_R`, `Weapon_L`, `Back` 본 포함), 무기 메시(원점 = 손잡이 그립점, +Y 또는 -Z 칼끝 방향 통일, 스케일 1).

## ③ 옵션 전수표
| 옵션 | 무엇을 바꾸나 | 우리 설정값 | 근거 출처 |
|---|---|---|---|
| 소켓 표현 A: 아마추어 안 **비변형 본**(Deform 끔) `Weapon_R` 부모 `RightHand` | 모든 엔진에서 본 Transform으로 수입, 애니 FBX에 함께 기록 | **채택** | discussions.unity.com weapon-socket thread(소켓 본 애니 미전달 사례 → Extra Transforms로 해결) `[발췌]`; Unity 포럼 "weapon bone 추가가 관례" `[발췌]` |
| 소켓 표현 B: Empty, Parent Type **Bone** | FBX에 Null 노드로 수입; UE는 `SOCKET_` 접두 Empty를 소켓으로 자동 수입(부분 성공 보고) | UE 실험용 보조 | forums.unrealengine.com "Unable to import Sockets from Blender FBX" `[발췌]` |
| Unity Rig ▸ Optimize Game Objects ▸ **Extra Transforms to Expose** | 비맵핑 본은 제거되므로 소켓 본을 예외 노출 | `Weapon_R, Weapon_L, Back` 체크 → Apply | docs.unity3d.com/Manual/FBXImporter-Rig.html(2021.1) `[발췌]` |
| Unity 런타임 부착: `weapon.transform.SetParent(socket, false)` + localPosition 0 · localRotation identity | 그립 오프셋은 무기 프리팹 안 자식에 둠 | 소켓 본 직접 부모화 | discussions.unity.com attach-mesh threads `[발췌]` |
| Unity 소켓 찾기: 이름 경로 `transform.Find` vs `Animator.GetBoneTransform(HumanBodyBones.RightHand)` | Humanoid 본만 GetBoneTransform 가능, 소켓 본은 이름 검색 | 소켓 본은 이름(`Weapon_R`) 캐시, 손 본은 GetBoneTransform | 〃(GetBoneTransform 경로는 발췌 없음 `[미검증]`) |
| 오프셋 보정 Empty | 리그마다 손 본 축이 달라 무기 회전 어긋남 | 무기 프리팹 루트 아래 `Grip` 자식에 보정값, 소켓 본은 0 유지 | discussions.unity.com Mixamo hand axis 사례 `[발췌]` |
| UE: Skeleton ▸ Add Socket(본 선택) · Parent Socket 속성 · Attach Actor/Component To Component 노드 | 에디터 소켓 정의·런타임 부착 | 소켓 `Weapon_R` 본 위에 `S_Weapon_R`, 미리보기 메시는 프리뷰용(영구 부착 아님) | dev.epicgames.com skeletal-mesh-sockets `[발췌]`; forums.unrealengine.com 72431 `[발췌]` |
| 양손 무기·활 | 보조 손 IK 목표 | `Weapon_L`에 IK 타깃 본 `Grip_L` 추가는 D-MO 결정 뒤 | — |
| 등 소켓 `Back` | 미장착 무기·망토 고리 | Spine(UpperChest) 자식, 위치 LOCK 시트 | — |

## ④ 절차
1. Blender 리그 편집 모드: `RightHand` 자식에 `Weapon_R`(Deform 끔, 길이 0.1, 축 = 무기 그립 방향), `LeftHand` 자식 `Weapon_L`, `UpperChest` 자식 `Back`. 이름은 §③ 표준.
2. 무기 메시: 원점 그립점, 축 통일, 별도 FBX `WP_<이름>.fbx`(아마추어 없음).
3. 스켈레톤·애니 FBX 재내보내기(TOOLS 1 옵션, Only Deform Bones **켬**이어도 비변형 소켓 본은 변형 자식이 없어 빠질 수 있음 → 소켓 본을 Deform 켬 + 가중치 0으로 두거나 Only Deform Bones 끄고 ORG/MCH 삭제본으로 내보냄. 어느 쪽인지 실습에서 확정 `[미검증]`).
4. Unity: Rig ▸ Optimize Game Objects ▸ Extra Transforms(`Weapon_R, Weapon_L, Back`) → Apply. 무기 프리팹 `WP_<이름>`(루트 → `Grip` 보정 자식 → 메시).
5. 런타임(표현 레이어, Core 무수정): 장착 이벤트 → 소켓 Transform에 SetParent(false), 이전 무기 반환. 교체 지점 명세는 CHARACTER_PIPELINE §4(CH 레인).
6. UE: Skeleton 에디터에서 `S_Weapon_R` 소켓 추가 → 프리뷰 메시로 그립 확인 → 블루프린트 AttachToComponent(소켓 이름).

## ⑤ 출력 형식 · 네이밍
- 본 `Weapon_R/L`, `Back`; UE 소켓 `S_Weapon_R/L`, `S_Back`; 무기 FBX `WP_<이름>.fbx`, 프리팹 `WP_<이름>` 루트 아래 `Grip`.

## ⑥ 검수 방법
- attack1 동작 중 10 프레임 캡처: 무기가 손을 따라가고 그립이 벌어지지 않음(1x·3x).
- 교체 테스트: 검→활→방패 교체 3회, 즉시 반영, 이전 무기 잔류 0(`MANUAL/img/tools-socket-{before,after}.png`, 전 = 손 본 직접 부모화 오프셋 어긋남, 후 = 소켓 본 + Grip 보정).
- UE 같은 동작 1개로 소켓 위치 일치.

## ⑦ 금지 · 흔한 실패
- Optimize Game Objects를 켠 뒤 Extra Transforms에 소켓 본을 넣지 않아 런타임에 소켓이 사라짐.
- 무기 메시 원점이 바운딩 중심이면 그립이 손 밖으로 나감(원점 = 그립점 규칙).
- 소켓 본에 가중치를 칠하거나 애니 키를 직접 넣지 않는다(손 본의 자식으로만 움직임).
- 손 본에 무기를 직접 부모화하고 오프셋을 코드 상수로 박는 것(리그 바뀌면 전부 깨짐) 금지.

## ⑧ 실습 기록
- Mac 실습 대기(과제 C3). 기록: 소켓 본 내보내기 방식(③-3 확정값), 교체 지연 ms, 캡처 경로, SHA.
