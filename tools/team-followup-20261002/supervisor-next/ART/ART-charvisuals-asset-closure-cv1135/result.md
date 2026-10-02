# ART — CHAR_VISUALS asset→consumer closure 검증 (cv1135, epoch capacity-after-8c317a73-1134, 2026-10-02)

감독 STATE가 지정한 다음 자율 백로그 **"CHAR_VISUALS portrait/poster/scene/idleVid 실제 참조와 소비자 경로/실파일 header 검증"** 을
`index.html`의 `CHAR_VISUALS[]`에서 **실제 소비 필드를 추출→경로 매핑→실파일 존재·header·suffix** 로 검사하는 Node validator(`checks.mjs`)로 수행했다.
용량 해제(allowNewOwnedFiles=true, changes 68) 확인 후 저장. 완료 cutscene33 반복 0, 이미지 생성/에셋 교체/캐릭터 정체성 PASS **0**.

> **결과: NO-FIX.** 5캐릭터 **32개 비주얼 참조 전부** 실존·header 정상·suffix 일치, 결손 0. 통제군(정상·누락)으로 검출력 증명.
> **파일 존재 ≠ 미술 LOCK/캐릭터 정체성 PASS.** 실게임/시각/GPU는 별도 Gate.

---

## 1. 실행 영수증 (evidence — result 내 보존)

| 항목 | 값 |
|---|---|
| Node | `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node` (v24.15.0) |
| 실행 UTC / exit | 2026-10-02T11:41Z / **exit 0** |
| 명령 | `node tools/team-followup-20261002/supervisor-next/ART/ART-charvisuals-asset-closure-cv1135/checks.mjs` |
| `index.html` SHA256 | `38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8` (이 시점값, HEAD 주장 아님) |
| `checks.mjs` SHA256 | `a07c590ba50b1e865d2404933363d8ea25e55ea560188e6e0750162aa65b7c3e` |
| capacity epoch | `capacity-after-8c317a73-1134` (allowNewOwnedFiles=true, maxNewOutputFilesPerRole=2, maxSavedIterationsPerRole=1) |
| root checkpoint | `8c317a73a2b68c0dd7b80e128aa4d50c3b0ef096` (원격 제공값; Git 독립조회 0) |
| assertion | **3 PASS / 0 FAIL** |

**소비자 구조(`index.html` CHAR_VISUALS[]):** 각 캐릭터 객체의 비주얼 필드 `portrait·bust·emblemImg·scene·sceneVid·idleVid·poster`를
`?v=` 쿼리 제거 후 그대로 파일경로로 사용. validator가 `id:'exoduser_*'` 단위로 분할해 필드별 참조를 추출한다(소스 변경 없음, anchor만).

---

## 2. 캐릭터별 closure 결과 (전부 결손 0)

| 캐릭터 | comingSoon | 필드수 | 결손 | 주요 header |
|---|---|---|---|---|
| exoduser_warrior | false(활성) | 7 | 0 | portrait warrior_cut 1223×986 / bust 1024×1536 / poster **3840×2160** / idleVid mp4 14.1MB / sceneVid mp4 |
| exoduser_silvertail | true | 7 | 0 | portrait silvertail_cut 1373×983 / poster **3840×2160** / idleVid mp4 11.6MB / sceneVid mp4 |
| exoduser_hellgunner | true | 6 | 0 | portrait=bust 1024×1536 / poster **1600×900** / idleVid mp4 (전용 bg/sceneVid 없음, scene=poster) |
| exoduser_transmuter | true | 6 | 0 | portrait=bust 1024×1536 / poster **1600×900** / idleVid mp4 |
| exoduser_spearmage | true | 6 | 0 | portrait=bust 1024×1536 / poster **1600×900** / idleVid mp4 |

- 전 참조(32개) **실존·header 유효**, MISSING/suffix 불일치/0바이트/LFS 포인터 **0**.
- suffix↔포맷 일치: `*_cut.png`·`portrait_warrior.png`·`portrait_silvertail.png`=PNG, 신규 3종 `portrait_*.jpg`=JPEG, `emblem_*.png`=PNG, `idle_*.mp4`/`*_loop.mp4`=MP4(ftyp) — 전부 일치.
- warrior/silvertail만 `scene`(bg_scene PNG)+`sceneVid`(loop mp4) 보유. 신규 3종은 `scene`=poster jpg 재사용·sceneVid 없음(comingSoon 잠금과 일관).

---

## 3. 통제군 (검출력 증명 — 가짜 PASS 방지)

| 통제 | ref | 기대 | 관측 | 판정 |
|---|---|---|---|---|
| 정상 | `assets/charselect/warrior_cut.png?v=3` | defect 0 | `[]` | **PASS** |
| 누락 | `assets/charselect/__cv1135_absent__.png` | MISSING | `["MISSING"]` | **검출 성공** |

→ validator는 실존 파일은 통과시키고 없는 파일은 반드시 결손으로 잡는다(always-pass counter 아님).

---

## 4. 미술 품질 관찰 (닫힘 결함 아님 — PASS 아님, 백로그 인계용)

1. **poster 해상도 비대칭:** warrior/silvertail = **4K(3840×2160)**, 신규 3종(hellgunner/transmuter/spearmage) = **1600×900**. 캐릭터 선택 카드 일관성 측면 추후 업스케일/재생성 검토 대상.
2. 신규 3종은 `portrait=bust=scene`를 **단일 jpg로 공유**(전용 bust/bg 아트 없음) — comingSoon 잠금이라 현재 정상.
3. 이들은 **파일 존재 ≠ 미술 LOCK / 캐릭터 정체성 PASS**. 신원·정체성은 별건이며 이번에 PASS 선언 0.

---

## 5. docs 동기화 인계 (root 소유 — 본 세션 쓰기 0)

| canonical 후보 | 제안 문안 |
|---|---|
| `docs/17게임아트팀/ART_TEAM_MASTER.md` 또는 `docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md` | "2026-10-02 CHAR_VISUALS asset→consumer closure: 5캐릭터 32참조(portrait/bust/emblem/scene/sceneVid/idleVid/poster) 전부 실존·header 정상·결손0. poster 해상도 비대칭(활성 4K ↔ 신규3종 1600×900)은 미술 백로그. 파일존재는 미술/정체성 PASS 아님. 검증: tools/…/ART-charvisuals-asset-closure-cv1135/." |

(공유 docs 반영·Git은 root. protected 문서 수정 0.)

---

## 6. 실제품 Gate / 경계
| Gate | 상태 |
|---|---|
| CHAR_VISUALS asset→consumer closure (이번) | **PASS (NO-FIX)** — 32참조 실존·header 정상, 통제 검출력 증명 |
| 미술 LOCK / 캐릭터 정체성 / poster 해상도 균일 | **본 과제 아님** — §4 백로그 관찰로만 인계 |
| 실게임 캐릭터선택 렌더·idle 재생·GPU/시각 | **미수행(0)** — source PASS를 실게임 PASS로 치환 안 함 |

`productionApplied=false`, `runtimeAccepted=false`. 원자료/에셋 변경 0, 새 이미지 0.

---

## 7. 완료 체크
- ✅ index.html CHAR_VISUALS 실제 소비 필드 추출 → 경로 매핑 → 실파일 존재/header/suffix/LFS/0바이트 검사, 통제군으로 검출력 증명.
- ✅ 새 파일 **2개(result.md + checks.mjs)** — epoch 한도(역할당 1반복·2파일) 준수. 이전 cutscene33/emg1 검사 반복 0.
- ✅ Git 조회 0, 이미지 생성/교체 0, production/공유docs 쓰기 0, 사용자 게임/세이브 보존.
- ✅ no-fix 결과여도 primary validator 완성(exit 0) + 실근거(§1~3) 보고.
