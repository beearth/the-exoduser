## 2026-10-14 원본 OBJ metadata 현재owner 반영

| 현재 범위 | 코드·최초 검증 |
|---|---|
| originalsameWorld metadata | 원초기77→CHDECO250in-place merges/기존31sameDict/현재296key. RHS28원JSfalsy·optionalfield조건보존/knownundefined4226은present키+null+declaredUndefinedmask/untouchedabsent와분리. |
| 원current후처리쓰기 | 실제edge4현재Canvas교체뒤samecurrentMeta _edgeErasednumeric1작성/원Metaamount유지/metadatawritegap4해소. CSS5실처리미완 _filterBakedwrite0/strictfullOBJ·WaitStageNR/sourceG.onfalse. |
| API·수명 | get_source_object_meta_publication()0arg / get_native_source_object_meta(key,field="")2arg(currentref/present/mask) / signal native_source_object_meta_changed(key,meta,phase). INITIALIZED77+MERGED250+CALLBACK_WRITE4=331events/epoch·ref·lifetime/신호재진입취소guard/namespacewithdraw. |
| 새검수 | actualMain1 FIRST13/13 PASS7.985673초/ERROR0/CameraWarning1/product수리0. 기존OBJ14/extra23+2/원성공군·PNG자료재검수재연0/신규helper·testleaf·assetcopyhashimport0. |

정확API·28필드·296/4226값·원JSmerge/필터미완·nullmask외부쓰기한계는 [중앙 엔진 정본](../engine/FDG_ENGINE.md)의 「원본 OBJ metadata 실제 현재 소유·후처리 쓰기」를 따른다. 이전meta원writer4미연결은당시이력이다. MAP PRODUCTION REPORT: currentmetadata+flagwriteronly,geometry/nav/collision/placement/outermass/renderer변경0/CAMERA QA미실행/TECH새13scope만. **VISUAL VERDICT: RETOUCH.**

# GIANT BOSS PRESENCE LADDER — 거대보스 존재감 사다리 (Section D)

> **역할**: 거대 보스를 boss arena에서만 등장시키지 않고, 탐험 중 단계적 존재감으로 빌드업 → 아레나 실 엔티티 전환까지 5단계 정의.
> **원칙**: 신규 프레임워크 최소. 기존 `_enterBossArena`(25217)/`_preArenaBackup`/MAP_OBJS/OUTER 재사용.
> **상태**: 2026-08-23. 코드 변경 없음.

---

## 0. 사다리 개요

```
LADDER-1 원거리 실루엣  (OUTER, 탐험 초반)
   ↓ 접근
LADDER-2 환경 반응     (지형/소리/진동, 근접할수록)
   ↓ 더 접근
LADDER-3 신체 일부     (RIM에 촉수/발/뿌리 실물, 비충돌→준충돌)
   ↓ 관문 접근
LADDER-4 공격 징후     (스크립트 프레즌스: 그림자 스윕/낙석/포효)
   ↓ GATE 통과 + 로딩
LADDER-5 ARENA ENTITY (실 보스 스폰, full AI)
```
- LADDER 1~4 = **성능 무부담**(full AI 미가동, draw/audio/스크립트만). LADDER 5만 실 엔티티.

---

## 1. 단계 정의

### LADDER-1 — 원거리 실루엣
- **무엇**: OUTER-A/B에 거대 보스 실루엣(움직이는 원경 오브젝트). "저 멀리 거대한 것이 있다."
- **구현 후보**: OUTER 레이어(패럴랙스 재활성, `9631`) 또는 MAP_OBJS 비충돌 대형 스프라이트. 저해상도 캐시 캔버스 drawImage.
- **gameplay 영향**: 없음(순수 시각).
- **크기 감**: 화면을 넘는 스케일감(줌 0.80 고려).

### LADDER-2 — 환경 반응
- **무엇**: 근접할수록 지형이 반응 — 바닥 진동(화면 흔들림), 원경 보스 소리(포효/발소리), 안개/먼지, 조명 점멸.
- **구현 후보**: 근접 트리거(거리 기반, 필드보스 `_fbTick` `_FB_WAKE=1000` 기상 패턴 재사용) + 오디오 + 기존 shake.
- **CH1-1 현행**: 심연의 앵글러 4각(SW물/SE화/NW암/NE뇌)이 LADDER-2 실전투 엔티티. 지옥문([REGION] 2026-09-30)=4분면 지역 4곳 클리어(지역별 80%+각 지역 담당 앵글러 사망).
- **gameplay 영향**: 없음~미미(시야/청각 압박).

### LADDER-3 — 신체 일부
- **무엇**: RIM/맵 가장자리에 보스 신체 일부(촉수/거대 발/뿌리/눈) 실물 등장. 지나가며 관찰.
- **구현 후보**: MAP_OBJS 대형 오브젝트(비충돌 → 특정 부위만 충돌메타 `_OBJ_META`). WALL_EYES(`20440`) 같은 부위 애니 참고.
- **gameplay 영향**: 선택적(부위가 약공격/방해 가능하나 본체 전투 아님).

### LADDER-4 — 공격 징후
- **무엇**: 관문 직전 스크립트 프레즌스 — 거대 그림자 스윕, 낙석/불기둥 예고, 포효로 화면 정지감. "곧 싸운다."
- **구현 후보**: 스크립트 이벤트(존 진입 훅, ROADMAP P5) + 기존 AoE VFX(gate-well/wall-push/poison-pool, 49338–49392) 재사용.
- **gameplay 영향**: 환경 위험(회피 요구), 본체 미등장.

### LADDER-5 — ARENA ENTITY
- **무엇**: GATE 통과 → 로딩 → 실 보스 아레나. full AI 엔티티 스폰.
- **구현**: **기존 그대로** — 출구 밟기(`35606`) → `_bossLoadPhase` 스테이트머신 → `_enterBossArena`(25217): `_preArenaBackup` → 풀 클리어 → `G.map=arena.map` → `mkEn(ib=true)` → 5페이즈. **신규 코드 불필요.**
- **gameplay 영향**: 본 보스전.

---

## 2. 단계별 배치 규칙

| 단계 | 트리거 | 위치 | 성능 | 신규 구현량 |
|---|---|---|---|---|
| 1 실루엣 | 스테이지 진입 | OUTER | 무부담 | 소(오브젝트/레이어) |
| 2 환경반응 | 거리 근접(~2000px) | 원경+화면효과 | 무부담 | 소(트리거+오디오) |
| 3 신체일부 | 특정 존 진입 | RIM | 저 | 중(대형 오브젝트+부위) |
| 4 공격징후 | GATE 근접 | GATE 앞 | 저 | 중(스크립트 이벤트) |
| 5 아레나 | GATE 통과+로딩 | 별도 맵 | full | **0 (기존 재사용)** |

- 모든 스테이지가 5단계 전부일 필요 없음. **장보스 스테이지(각 챕터 마지막 si)**는 1→5 전체, 일반 스테이지는 1~2만(원경 존재감).

## 3. 최저위험 경로 (Q9 답)

- LADDER 5는 이미 완성(재사용). LADDER 1~4는 **시각/오디오/스크립트 레이어**로 실 엔티티 없이 존재감만. → 성능 봉인 유지하며 스케일 확보.
- 우선순위: **LADDER-1(원거리 실루엣)부터**(OUTER 재활성과 함께, ROADMAP P2+P7). 2→3→4는 점진.

## 4. 디자인 언어 연동
- 거대보스 = 융합 그로테스크(`BOSS_CANONICAL_MAPPING.md §4`). 실루엣 단계부터 비대칭 융합 실루엣으로 각인.
- 로어 정체성(장보스) 기준. runtime-only 중간보스는 사다리 1~2 위주(원경 존재감).

## 5. CODE CHANGE
**NONE.** 사다리 기획 전용.
