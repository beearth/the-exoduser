# TOOLS — 모듈러 파트 분할 · 바디 파트 마스크 (2026-11-05, 클라우드 조사)

## ① 목적 · 단계
- 루팅 게임의 첫 요구(CH 브리프): **장비가 캐릭터에 보이고 갈아입혀진다.** 베이스 바디를 Core 장비 슬롯과 맞춘 파트로 나누고, 장비가 덮는 몸 부위를 숨겨(바디 마스크) 겹침 뚫림을 막는다. 리깅(TOOLS 1) → 분할(이 문서) → 웨이트 전사(TOOLS 2) → 조립(TOOLS 5).

## ② 입력 형식
- 리깅된 베이스 바디 1개(공용 스켈레톤), LOCK 시트, Core 장비 슬롯 목록(정답은 `Runtime/Core` — `ItemFactory.cs`·`InventoryData` 계열. 이 세션 grep으로 보인 슬롯 식별자: `weapon, shield, bow, helm/helmet, armor, gloves, pants, boots, belt, cloak, ring1/ring2, neck`. 표현 파트 대응은 CH 레인이 Core를 읽어 확정하며, **Core 수정 0**).

## ③ 옵션 전수표
| 옵션(결정·도구) | 무엇을 바꾸나 | 우리 설정값(1안 최소 / 2안 관례) | 근거 출처 |
|---|---|---|---|
| 파트 분할 수 | 드로우콜·스키닝 비용·이음새 수 | **1안(최소, 7)**: 머리(얼굴+머리카락) · 몸통 · 팔(상완~손) · 다리(허벅지~발) · 투구 · 가슴갑옷 · 장갑/각반/신발 묶음 / **2안(관례, 12~14)**: 머리·머리카락·몸통·상완·하완·손·허벅지·종아리·발 + 투구·가슴·장갑·각반·신발·망토 | polycount.com 모듈러 스레드 `[발췌]`; ss3d.gitbook.io body-clipping(절단선 손목·어깨 아래·무릎 위·발목 아래) `[발췌]`; forums.unrealengine.com "hide player model under clothing" `[발췌]` |
| 절단선 위치 | 이음새가 보이는가 | 장비 경계에 숨김: 손목(장갑)·발목(신발)·목(투구 하단)·골반(벨트) | ss3d body-clipping `[발췌]` |
| 숨김 방식 A: 메시 교체(몸 파트를 장비 파트로 통째 교체) | 파트 수·드로우콜 ↓, 몸 파트가 장비 덮개를 포함 | 1안 기본(가슴갑옷 파트에 몸통 피부 포함) | polycount `[발췌]`(몸 삭제·폴리 ↓ vs 뚫림 위험 양론) |
| 숨김 방식 B: 바디 영역 플래그(coversTorso 등) | 장비가 덮는 영역 ID 집합 → 몸 파트 렌더러 비활성 | 2안 기본: 영역 ID = `head, hair, torso, upperarm_L/R, lowerarm_L/R, hand_L/R, thigh_L/R, calf_L/R, foot_L/R` | UE 포럼 플래그 방식 `[발췌]`; mod-docs.playinzoi.com Masking System(UV2 영역 ID) `[발췌]` |
| 숨김 방식 C: 바디 마스크 텍스처(hidden face map, 셰이더 알파 클립) | 영역보다 세밀, 드로우콜 유지 | 소매·목선처럼 부분 노출에만 | fab.com MetaHuman outfit "Body Hidden Face Map" `[발췌]` |
| Blender Separate: Selection / By Material / By Loose Parts (`P`) | 메시를 파트 오브젝트로 분리 | Selection(절단선 루프 선택 뒤) | 통념(매뉴얼 원문 미확인) `[미검증]` |
| 분리 전 Edge Split 금지 · 이음새 정점 위치·노멀 일치 | 픽셀 렌더에서 이음새 선 | Data Transfer Custom Normals로 이음새 노멀 전사 | docs.blender.org data_transfer(Custom Normals) `[발췌]` |
| 파트별 Vertex Groups | 스키닝 공유 | 베이스에서 전사(TOOLS 2) | TOOLS 2 |
| 재질 슬롯 규칙 | 드로우콜·아틀라스 | 영웅 1개 아틀라스 2048(피부+머리) + 장비 세트별 아틀라스 2048, 등급 색은 마스크 틴트(과제 C4) | CH 브리프 §1-4 |
| 망토·천 | 본 체인 vs 엔진 클로스 | 1차 본 체인 `Cape_01..04`(픽셀 렌더에서 클로스 떨림이 노이즈로 읽힐 위험) | CH 브리프 §1-2 |
| 내보내기 단위 | FBX 1개 vs 파트별 | **스켈레톤 FBX 1 + 파트별 FBX**(같은 아마추어, 파트 메시만 선택) | discussions.unity.com(여러 메시 1 아마추어 임포트 정상) `[발췌]`; projects.blender.org #42135 `[발췌]` |

## ④ 절차
1. 리깅된 베이스 바디에서 절단선 엣지 루프 선택(손목·발목·목·골반) → 이음새 정점 위치를 정수 좌표로 스냅(양쪽 파트가 같은 정점 좌표).
2. `P ▸ Selection`으로 파트 분리, 이름 `BD_<영역>`(몸) / `EQ_<슬롯>_<세트>`(장비). 각 파트 원점 = 월드 원점(스켈레톤과 동일).
3. 장비 파트 모델링은 베이스 바디 복제 쉘에서 시작(Solidify 두께 0.01~0.03) → 디테일 → Data Transfer로 Custom Normals(이음새)·Vertex Groups(TOOLS 2) 전사.
4. 영역 ID 표(1안·2안)와 장비별 `covers = {…}`를 `docs/0마스터플랜/MANUAL/CHARACTER_PIPELINE_20261105.md` §2(CH 레인)로 넘긴다.
5. 내보내기: 아마추어 + 해당 파트만 선택, TOOLS 1 FBX 옵션. 파일 `CH_<영웅>_BD_<영역>.fbx`, `CH_<영웅>_EQ_<슬롯>_<세트>.fbx`.

## ⑤ 출력 형식 · 네이밍
- 오브젝트/파일 `BD_*`(몸 파트), `EQ_<슬롯>_<세트>`(장비, 슬롯 이름은 Core 식별자 그대로: `armor, helm, gloves, pants, boots, belt, cloak, weapon, shield, bow`), 영역 ID 소문자 스네이크. 파트당 삼각 예산은 매뉴얼 15 성능 예산 확정 전까지 영웅 전체 LOD0 ≤ 20k△ 가정(미검증).

## ⑥ 검수 방법
- 33° 1x·3x 캡처: 이음새 0, 겹침 뚫림 0, idle·walk·attack 포즈 3개(`MANUAL/img/tools-parts-{before,after}.png`, 전 = 분할 전 단일 메시, 후 = 1안 조립).
- 드로우콜·스키닝 비용 표(Unity Frame Debugger, 파트 수별).
- 저해상도 픽셀 렌더에서 장비 A↔B 실루엣 구분(과제 C3 기준).

## ⑦ 금지 · 흔한 실패
- 파트마다 다른 아마추어·다른 원점으로 내보내기(조립 시 위치·바인드 포즈 어긋남).
- 절단선을 장비 경계 밖(팔 중간 등)에 두어 이음새가 노출.
- 몸 파트를 전부 지워 장비만 남기면 소매·목선 노출 장비에서 피부가 비는 문제 → 1안도 노출 부위 몸 파트는 유지.
- 생성 메시·자리 채우기 큐브 금지, 중간 조잡 상태 캡처 금지(11-05 14:40).

## ⑧ 실습 기록
- Mac 실습 대기(과제 C1·C2). 기록: 파트 수·삼각 수·드로우콜, 이음새 캡처, 영역 ID 표 버전, SHA.
