# UIUX — 분리된 이전 스킬 카드 + 콜백 수명 검수

양판에서 **source 2 RED → 메모리 후보 2 GREEN**. 같은 일반 스킬 한 시나리오의 본편/easy × 현행/후보 비교 4회가 완료됐다. 이전 인벤토리 source16 RED/후보16 PASS는 인수만 했으며 재실행·합산0이다. **source fixture PASS ≠ runtime/visual PASS**, **productionApplied=false**.

| 인수/소유 항목 | 확인 |
|---|---|
| checkout 실제 경로 | `/Users/fordeargamers/Projects/exoduser-migration-20261001` — realpath 동일 |
| TASK 실제 경로 | `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/codex-half/UIUX/TASK.md` — realpath/소유 경계 동일 |
| 읽기 참조 | AGENTS, UI_UX_IMPROVEMENT_PROJECT_20260930, UI_COMPOSITION, 스킬관리/자원리젠/자원게이트 SSOT, 이전 UIUX result/evidence/candidate.patch |
| 이전 같은 경계 | docs + 기존 UIUX 산출의 수명/옛 카드/_skClick/isConnected 검색0행(exit1). 빈 출력 SHA `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| 이번 실행 시각 | 실제 fixture 시작 2026-10-02T04:35:59.769Z, 완료 2026-10-02T04:35:59.972Z; 수신 시각·HEAD 추정0 |
| write 소유 | checks.mjs, result.md, evidence.json 최대3파일. TASK immutable |
| Changes | 현행 count 미관측. 총괄 TASK의 기존 사용자 변경23항목만 과거 인수. 이전 과제52는 현행 count로 사용하지 않음 |

| id·한글명 | 조건 | 원래 학습 비용 | 슬롯·공식 |
|---|---|---|---|
| spikeTrap · 가시덫 | P.lv=1, skills={}, _fused={}, SP20, 악의80, SKILL_SLOTS 빈6칸; 일반 펼침 카드, reqLv/requires/ult/fixed 없음 | SK.spCost=10, matCost=80; _malCost(80)=max(1,ceil(80×0.5))=40. 두 번분을 실제 비용으로 준비 | cat=phys, act=true. 실제 _skById/_canAssignSkillSlot/_findAutoSkillSlot에 따라 1~4 첫 빈칸, index0 자동 배정. Space/F는 비움 |
| 강화 경계 | 첫 렌더 slv0/learned=false. 새 렌더 slv1/learned=true | _skillUpSpCost 실제 helper 추출. 강화 호출0 | _skMaxLv20, _skLvLock=min(20,~~(P.lv/50)+1)=1. 새 카드 canUp=false |

현재 연결 카드의 + 함수를 보관하고 정상 첫 호출을 실행했다. 원문 renderSkillPanel의 grid.innerHTML='' 경계로 이전 카드/버튼이 분리되고 새 카드가 생성됨을 DOM 대역의 isConnected/contains로 확인했다. 그 뒤 **보관한 옛 + 함수를 직접 호출**했다. 네이티브 사용자가 detached 노드를 클릭했다는 실측이 아니다.

| 단계 (양판 동일) | 스킬Lv | SP / 악의 | 슬롯 | render / save / slotUpdate / quickUpdate / SFX |
|---|---:|---|---|---|
| 호출 전 | 0 | 20 / 80 | 빈6칸 | 1 / 0 / 0 / 0 / 0 |
| 정상 첫 호출 — source/후보 완전 동일 | 1 | 10 / 40 | [spikeTrap,null,null,null,null,null] | 2 / 1 / 1 / 2 / 1 |
| source 보관 detached 재호출 | 1 | 0 / 0 | 같은 슬롯 | 3 / 2 / 2 / 3 / 2 |
| 후보 보관 detached 재호출 | 1 | 10 / 40 | 같은 슬롯 | 2 / 1 / 1 / 2 / 1 |

source의 옛 함수는 여전히 learned=false를 참조하여 Lv1을 다시 대입하고 SP10/악의40을 재차 차감한다. 습득 SFX/showPH/addTxt와 저장/렌더/슬롯 UI 갱신도 다시 호출된다. 새 렌더가 learned=true여도 옛 클로저의 캡처는 바뀌지 않는다.

최소 메모리 후보는 실제 _skClick의 첫 문장에 아래 한 줄만 추가한다. + handler 연결과 기존 비용·슬롯·상태 변경문은 그대로 유지한다. 후보 변환은 checks.mjs와 evidence 안에만 있으며 patch 파일·생산 적용0이다.

`if(!d.isConnected||!grid.contains(d))return;`

| 후보 동등성/효과 | 결과 |
|---|---|
| 연결 정상 첫 호출 | 상태·비용·슬롯·캡처·저장/렌더/표시/SFX 호출 trace 전체 deepEqual PASS |
| 분리된 재호출 | Lv/SP/악의/슬롯 변화0, save/render/slotUpdate/quickUpdate/SFX/showPH/addTxt0 |
| handler 자체 | 원래 ev.stopPropagation()는 두 호출 모두 실행한다. 후보 detached에도 이 호출1은 유지하며 게임 상태 효과0과 구분 |
| RNG | 실제 실행 fragment의 Math.random 직접 호출 source/후보 모두0. SFX는 호출 기록 대역이므로 오디오 내부 RNG는 미검수 |
| 대역 | 기존 inventory-dom/node-dom.mjs의 createDocument를 읽기 전용 import. 추가 DOM 구현0. P/G·일반 카드의 비합체 flag와 표시/저장/사운드 sink만 합성 |
| 실제 코드 | 원래 SK 행, _malCost, 슬롯 함수·정의, _FUSE_PAIRS/_isFused/_getAllAbsorbed, slv/learned/eligibility, _skClick 전체, + handler, grid clear/append를 추출. fake _skClick0 |
| 실행 범위 | 원문 fragment를 조립한 renderSkillPanel 대역. 전체 HTML 복사/생산 부트0. 전체 렌더의 추천/탭/상세/compact 등은 미검수 |
| 미검수 | 브라우저/게임패드/native input/시각/저장 실제 IO/오디오, 강화/합체/다른 스킬, P 교체/async reset |

| 적용 원문 | 본편 행 | easy 행 | 정확한 UTF-8 원문 SHA256 |
|---|---|---|---|
| renderSkillPanel 선언 | 45793 | 44401 | `ff47284bfb81597da7055c8efee85d5b2da87b7d2e28cd7e381c11d01d0a089f` (양판 동일) |
| 현재 grid 비움 | 45804 | 44412 | `d4c6890dd1e5a9ecc8614a17f90d55dc0132b5515b31bc40c4e53c2f444774de` (양판 동일) |
| SK 가시덫 원문 | 42734 | 41531 | `b50ed97a993a9f7c287b8ab13f41432b83ff49ab7ac2b42ddd839222ac6fb693` (양판 동일) |
| 원래 _malCost | 26867–26872 | 25742–25747 | `afd7124eb44c1b3724bf31484a2a7aa2ae962ab3c3cd7728484e1c4baeff94d2` (양판 동일) |
| 원래 강화 SP helper | 3892–3896 | 3661–3665 | `7d914171c725c0443840156cf94ea5af8c3a211991ac1247d1d2792ef7e7584a` (양판 동일) |
| 원래 슬롯 판정·자동배정 | 42746–42764 | 41543–41561 | `a8784fdd271f7f80a8d2da45a338a327e62fdf7238146e25597b63bd17db4849` (양판 동일) |
| 원래 SKILL_SLOT_DEFS | 42796–42837 | 41593–41634 | `bc3584ab89e4ad656461801568bba77ca9f3421bdfbeedb73d75ab195413828c` (양판 동일) |
| 원래 _FUSE_PAIRS | 42972–43005 | 41768–41800 | `904b0768d5ba2d802224033ba21110082cf99cef93c9161daeee5de888ed349f` / easy `3aeed1c77303a23f9677701a66958724c5b4a9ac27f22962af29b3a42d0edafe` |
| 원래 _isFused | 43007 | 41802 | `f8866059e0766a852995178775588bc7b125be3ccc09b80951527526d932307d` (양판 동일) |
| 원래 _getAllAbsorbed | 43139–43147 | 41934–41942 | `666ff756943b3894af94f54c71f6eb41b7690224d78332f200aca6a34dc84e9c` (양판 동일) |
| slv/learned/canLearn 캡처 | 46175–46182 | 44777–44784 | `50fcfe538c3fb4b131ade8202e9f1130a09f3e33dad097f515ac52973f65d4e4` (양판 동일) |
| canUp·카드 생성 | 46193–46196 | 44795–44798 | `5202074aacea454465252bce2a6a8b75fbb1e5afa5d05bdbff9594478bcf025d` (양판 동일) |
| 실제 _skClick 전체 | 46747–46797 | 45348–45398 | `50c5dc27b4eb86f5c9c897446ea35afc1ce35970b3b3a80057bfe0e7a5d59845` (양판 동일) |
| 실제 일반 +/- 버튼 | 46803–46831 | 45404–45432 | `9b89eecee470b1eeec11cc7ac80177207c6bd0e883cfe4bb7e47f650361342d6` (양판 동일) |
| 현재 grid에 카드 추가 | 46847 | 45448 | `45111ca46990c19399098f8161cd3f52cbd1d0c0a663e9757eb0a2125395a355` (양판 동일) |
| 실제 + onclick 연결 | 46827 | 45428 | `b5bfce9515f1db524b491931621686ca59041b28c7897b07571e348124be01e6` (양판 동일) |

원문 전체 SHA256: game.html `30ae8544524d7cd710383ebd10f4911bea3247e90b18a46c51c253e73ce9ba3f`, game-easy-test.html `9c7c25c131f6175a464cffe2e981e946cf2a0af70ed04b969cc5292403799af8`. 양판 _skClick SHA가 동일하며 _FUSE_PAIRS만 양판 차이가 있어 각각 실제 원문을 추출했다. 본 시나리오의 _fused={}에서는 흡수 목록이 빈 배열이다. 각 조각의 원문 전체/행/SHA와 실행별 trace·후보/renderer SHA는 evidence.json에 있다.

코드 산출 후 docs 전체를 rg로 검색했다. 패턴은 `renderSkillPanel|_skClick|skillGrid|spikeTrap|가시덫|learned|_malCost|SKILL_SLOTS|_findAutoSkillSlot|spCost|matCost|분리된.*카드|detached|isConnected`이며 제한 glob 없이 docs/ 전체를 대상으로 했다. **293행 / 66파일**, 출력 SHA256 **`4fecaf2f35224bbcbdc6e78b152b3bfcb6ab962b4d70fb6086fccda01084988e`**. 정확한 명령·전체 매칭 원문·문서별 SHA를 evidence.docsSearch에 보존했다.

| 동기화 인계 대상 | 정확한 추가/연결안 |
|---|---|
| UI_UX_IMPROVEMENT_PROJECT_20260930.md | ‘2026-10-02 분리된 스킬 카드 + 콜백 수명 — source fixture / 생산 미적용’ 절에 위 id/조건/학습 원가80→40/일반 index0/소스2RED→후보2GREEN/원문 행·SHA/대역·미검수 표 추가. productionApplied=false 명시 |
| UI_COMPOSITION_20260925.md | 스킬 작업공간 ‘조작 보존’ 표 옆에 위 감사 링크와 후보 미적용 상태 추가 |
| 2_1 스킬관리+합체시스템.md | ‘두 개의 스킬 창’ 절에 동일 수명 결함·미적용 후보 링크. 기존 비용·슬롯 계약은 유지 |
| 자원리젠+소모공식.md | 악의 소비 절에 가시덫 학습 원가80/최종40 기록과 시전 비용 별개 링크 |
| SKILL_자원게이트_감사_20261001.md | 시전 자원 gate 감사와 학습 UI 콜백 수명 감사 범위 구분 링크 |
| 다른 검색 매칭 파일 | 공통 키워드/동일 스킬/역사 근거 목록으로 인계. 이번 생산 수치·설계 변경0이므로 기존 공격·피해·시전·UI 크기·이력 값 수정안0 |
| 잠금 문서 | 2_3 돌진+패링+방패시스템 수정0 |

공유 docs 쓰기는 TASK에서 0으로 고정했다. 위 표와 evidence.docsProposal이 총괄의 동기화 인계안이며 생산 채택 전에 구현 완료로 적지 않는다.

| # | 전체 검색 매칭 파일 목록 |
|---|---|
| 1 | `docs/0마스터플랜/EA/HELL_EA_BUILD_CHECKLIST.md` |
| 2 | `docs/0마스터플랜/mac-resume-20261001/BUILD-SOUND-잔여팀-인수검토.md` |
| 3 | `docs/0마스터플랜/mac-resume-20261001/map020-evidence/BALANCE-읽기근거.json` |
| 4 | `docs/0마스터플랜/mac-resume-20261001/map020-evidence/팀실행-영수증.json` |
| 5 | `docs/0마스터플랜/mac-resume-20261001/map020-zoomfix-evidence/SKILL-팀검토.md` |
| 6 | `docs/0마스터플랜/mac-resume-20261001/map020-zoomfix-evidence/team-receipts.json` |
| 7 | `docs/0마스터플랜/mac-resume-20261001/ui03-evidence/BALANCE-팀검토.md` |
| 8 | `docs/0마스터플랜/mac-resume-20261001/ui03-evidence/SKILL-팀검토.md` |
| 9 | `docs/0마스터플랜/mac-resume-20261001/ui03-evidence/team-receipts.json` |
| 10 | `docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/FOLLOWUP_RECEIPT.md` |
| 11 | `docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/UIUX-result.md` |
| 12 | `docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/persistence-review-result.md` |
| 13 | `docs/11내러티브·로어디자인/펫_대사_스크립트.md` |
| 14 | `docs/12퍼포먼스·최적화/12퍼포먼스·최적화.md` |
| 15 | `docs/13출시·마케팅/13출시·마케팅.md` |
| 16 | `docs/13출시·마케팅/AUTO_CLEANUP_50_20260916.md` |
| 17 | `docs/13출시·마케팅/GAMEPLAY_TRAILER_V22_20260909.md` |
| 18 | `docs/14밸런스+수치테이블/14밸런스+수치테이블.md` |
| 19 | `docs/14밸런스+수치테이블/BALANCE_ECONOMY_TEAM_MASTER.md` |
| 20 | `docs/14밸런스+수치테이블/EARLY_COMBAT_5_7_1_20260910.md` |
| 21 | `docs/14밸런스+수치테이블/MAGIC_ATTACK_DAMAGE_20260910.md` |
| 22 | `docs/14밸런스+수치테이블/SPIKE_TRAP_HALF_20260913.md` |
| 23 | `docs/14밸런스+수치테이블/스킬_밸런스_리포트.md` |
| 24 | `docs/14밸런스+수치테이블/스킬데미지공식표.md` |
| 25 | `docs/14밸런스+수치테이블/스킬별_DPS_자원소비표.md` |
| 26 | `docs/14밸런스+수치테이블/자원소비량표.md` |
| 27 | `docs/15 세이브+데이터구조/15 세이브+데이터구조.md` |
| 28 | `docs/16번역·로컬라이제이션/FINISH_TRANSLATIONS_20260923.md` |
| 29 | `docs/16번역·로컬라이제이션/RESUME_LANGUAGE_INTEGRATION_20260923.md` |
| 30 | `docs/16번역·로컬라이제이션/STEAM_LANGUAGE_RESUME_20260921.md` |
| 31 | `docs/16번역·로컬라이제이션/TUTORIAL_ENGLISH_20260921.md` |
| 32 | `docs/16번역·로컬라이제이션/UI_SOUTHEAST_EUROPE_20260909.md` |
| 33 | `docs/16번역·로컬라이제이션/UI_TRANSLATIONS_20260909.md` |
| 34 | `docs/16번역·로컬라이제이션/번역대상_전체목록.md` |
| 35 | `docs/16번역·로컬라이제이션/번역대상_펫대사.md` |
| 36 | `docs/1전체그래픽세팅/맵_화면효과_전수조사.md` |
| 37 | `docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md` |
| 38 | `docs/2_1 스킬관리+합체시스템+자원/SKILL_자원게이트_감사_20261001.md` |
| 39 | `docs/2_1 스킬관리+합체시스템+자원/신규캐릭_스킬프로젝트_20260930.md` |
| 40 | `docs/2_1 스킬관리+합체시스템+자원/자원리젠+소모공식.md` |
| 41 | `docs/2_1 스킬관리+합체시스템+자원/자원리젠+소모공식__NFD_0628_2305_백업.md` |
| 42 | `docs/2_1 스킬관리+합체시스템+자원/추천빌드_SKILL_REC_PATH.md` |
| 43 | `docs/2_4 펫시스템/대사_스크립트.md` |
| 44 | `docs/2_5 부활+에너지쉴드시스템/2_5 부활+에너지쉴드시스템.md` |
| 45 | `docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md` |
| 46 | `docs/2게임디자인레벨디자인/PARRY_TUTORIAL_20260912.md` |
| 47 | `docs/2게임디자인레벨디자인/RESOURCE_PRACTICE_20260912.md` |
| 48 | `docs/2게임디자인레벨디자인/SPIKE_TRAP_PRACTICE_20260913.md` |
| 49 | `docs/2게임디자인레벨디자인/TUTORIAL_GAP_AUDIT_20260913.md` |
| 50 | `docs/2게임디자인레벨디자인/TUTORIAL_MISSION_DETAILS_20260913.md` |
| 51 | `docs/3.1 ui hud 디자인/INTRO_FOUR_CUTS_20260914.md` |
| 52 | `docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md` |
| 53 | `docs/3.1 ui hud 디자인/exoduser-hud-redesign.md` |
| 54 | `docs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md` |
| 55 | `docs/3.2메타·진행시스템/3.2메타·진행시스템.md` |
| 56 | `docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md` |
| 57 | `docs/3.3 키바인딩+설정/게임패드_매핑표.md` |
| 58 | `docs/5.1임펙트디자인/PHASE_V1_MOTION_FIREZONE_SEAL.md` |
| 59 | `docs/5.1임펙트디자인/VFX_구현가이드.md` |
| 60 | `docs/5.1임펙트디자인/ZONE_LIGHT_CLASSIFICATION_20260910.md` |
| 61 | `docs/5.1임펙트디자인/장판_가시성_2026-09-27.md` |
| 62 | `docs/7아이템디자인/ITEM_TEAM_MASTER.md` |
| 63 | `docs/7아이템디자인/UNIQUE_TOP8_HOOK_REVIEW_20261001.md` |
| 64 | `docs/7아이템디자인/보라색_고유아이템_카탈로그_20260930.md` |
| 65 | `docs/7아이템디자인/유니크_어픽스_리스트.md` |
| 66 | `docs/CHANGELOG_SYNC.md` |

| 최종 제한/검증 | 결과 |
|---|---|
| 재현 하니스 | 한 시나리오 × 양판 × source/메모리 후보 = 4비교 assertions PASS, 현행 desired invariant2 RED / 후보2 GREEN, fixture 실패0. 이전16 재실행·합산0 |
| 재실행 명령 | `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node tools/team-followup-20261002/codex-half/UIUX/checks.mjs` |
| 입력 보존 | fixture 전후 생산2HTML·AGENTS·선행5docs·TASK·이전3산출·기존DOM대역 전부 SHA 동일. 최종 감사는 evidence.finalAudit |
| 산출 소유 | checks.mjs/result.md/evidence.json만3파일. TASK 부모 소유 보존 |
| 금지 행동 | Git/index/commit/push/server/HTTP/game/app/native UI/audio/build/생성/install/new session/하위팀/다른 채팅 메시지/삭제/이동/외부 write 전부0 |
| 읽기 탐색 오류 | 초기 game-easy.html 및 추정 dom-fixture/inventory-focus-fixture 경로는 없었음. 실제 game-easy-test.html 및 inventory-dom/node-dom.mjs로 해결. fixture 실행 실패0 |

이 한 건의 검수와 미적용 후보 비교는 완료다. 생산 수정·공유 docs 동기화·런타임/시각 검수는 이번 소유 범위 밖이며 완료로 주장하지 않는다.
