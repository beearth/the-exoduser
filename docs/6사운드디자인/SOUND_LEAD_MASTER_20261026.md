# 사운드 총괄 마스터 — 지옥의 길 (2026-10-26 신설)

> 사용자 지시(2026-10-26): 「사운드총괄」. 이 문서가 사운드 전 영역(SFX·BGM·보이스·믹스·Unity 이식 F04)의 현황·백로그·결정 기록 SSOT다.
> 상세 계약은 [6사운드디자인.md](6사운드디자인.md)와 개별 기록 문서에 두고, 여기에는 **현재 상태·다음 할 일·판정 기준**만 둔다.

## 1. 역할과 판정 기준

| 항목 | 내용 |
|---|---|
| 담당 | 사운드 총괄(PC Claude 세션). 방향·명세·청음 후보 선별·문서. 반복 작업(일괄 생성·매핑 연결)은 Sonnet 단순작업 세션에 명세로 넘긴다 |
| 디자인 기준 | 통합 디자인 컨셉의 「음습하고 아름다운 지옥」. 소리 쪽 해석: 무겁고 짧은 타격·마른 감쇠·탁한 저역, 금속은 녹슨 흑철, 마법은 탁한 지옥불. 맑은 차임·밝은 판타지·긴 리버브 금지 |
| 채택 규칙 | AI 생성 후보는 **사용자 청음 선택 후에만** `sfx/` 반영(`promote`). 수치(길이·피크)가 맞아도 청음 전 채택 금지 |
| 크레딧 | ElevenLabs는 넉넉함(starter 90,000/월, 11-13 초기화) — 후보 3~4개씩 생성 OK, 전후 잔액 보고. Higgsfield는 사운드에 쓰지 않음 |
| 웹↔Unity | Unity 이식은 웹 소리를 그대로 옮기는 것이 기준(같은 파일·같은 키·같은 음량·우선순위). 새 소리는 웹 게임에 먼저 넣고 Unity가 따라간다 |

## 2. 현황 (2026-10-26 실측)

### 2.1 웹 게임 에셋

| 구분 | 수량 | 비고 |
|---|---:|---|
| `sfx/` 폴더 21개 | 315 파일 | death 106·voice 67·monster 25·skillsound 23·hit 14·pet 10·storm 10 등 |
| `bgm/` 장별·공통·컷신 | 장1 25~28 / 장2~7 각 2~4 / 공통 30 / cutscene 8 | 아래 2.3 중복 문제 있음 |
| 재생 진입점 | `game.html` `playSample(key,vol,rate,pri)` (12358행 부근) | 우선순위 `_SFX_PRI`, 프리로드 정책은 6사운드디자인.md |

### 2.2 SFX Forge 후보 (ElevenLabs)

| 상태 | 내용 |
|---|---|
| 생성 | 카탈로그 14종 × 후보 3개 = **42개 생성 완료** (`G:\exoduser-wt\_out\sfx_forge\<분류>\<key>\v1~v3.mp3`) |
| 청음 페이지 | `G:\exoduser-wt\_out\sfx_forge\index.html` |
| 1차 추천 | 2026-10-26 완료 — [SFX_FORGE_RECOMMEND_20261026.md](SFX_FORGE_RECOMMEND_20261026.md). 바로 채택 가능 8 · 가공 후 채택 4 · 재생성 권장 2(crit_heavy·button_confirm). 추천순 청음 페이지 `G:\exoduser-wt\_out\sfx_forge\review_20261026.html` |
| 사용자 청음·선택 | **미완** — 선택 0건, `promote` 0건, 게임 매핑 0건 |
| 대상 | skill 4(ki_slash_cast·giant_slam_cast·ice_orb_cast·spike_trap_cast) / hit 4(blade_flesh·blade_bone·parry_clang·crit_heavy) / ui 5(menu_open·menu_close·button_hover·button_confirm·skill_learn) / ambient 1(hell_forest_bed) |

### 2.3 발견된 문제

| ID | 문제 | 영향 | 상태 |
|---|---|---|---|
| SND-D1 | `bgm/` 한글 폴더가 Git에 **NFC·NFD 두 벌**로 추적됨(예: `1장_썩은숲` NFC·NFD 각 25파일, `공통` 각 30파일). Mac에서 넣은 NFD 경로가 Windows에서 별도 폴더로 보임 | 저장소·빌드 용량 중복, DEMO/EA `cp -r` 동기화 시 두 벌 복사, 어느 쪽이 실제 참조되는지 혼동 | 정리 완료(2026-10-27) → [보고서 ⑦](BGM_NFC_NFD_AUDIT_20261026.md) |
| SND-D2 | `SFX_FORGE_ELEVENLABS_20261021.md` §6이 「생성 0건」으로 남아 있었음 | 문서-실물 불일치 | 2026-10-26 정정 |
| SND-D3 | ElevenLabs MCP 연결 실패(CONNECTION_CLOSED) | 대화 중 MCP 직접 생성 불가 | SFX Forge(`npm run sfx:forge`, SDK 직접 호출)로 우회 가능 |

### 2.4 Unity 이식 (마스터 보드 F04·A15·B09)

| 보드 ID | 항목 | Unity 현재 |
|---|---|---|
| F04 | BGM·SFX·보이스 전체 | 상태 1. `NativeFeedbackAudio.cs`가 5샘플(sword_swing1~3·scarecrow_charge·sword_parry)만 로드. 로비/시작 BGM·보이스 10파일(`Resources/Audio/Lobby`, `Startup`) |
| A15 | 설정 사운드 탭 | 마스터 음량만 있음 |
| B09 | 피격·넉백·히트 피드백·사운드 | 타격음 일부 |

웹 대비 미이식: 몬스터 이동·피격·사망(카테고리·동시사망 버스트), 보스 프로필 `_BOSS_SFX`, 스테이지 BGM 큐(장 우선→공용 혼합), 우선순위 `_SFX_PRI`, 아이템 장착·습득·드랍, 스킬 사운드, 펫, 보이스 이벤트 디렉터, 설정 BGM/SFX/VOICE 분리 음량.

## 3. 백로그 (우선순위 순)

| 순위 | ID | 할 일 | 담당 | 완료 조건 |
|---:|---|---|---|---|
| 1 | SND-01 | SFX Forge 42후보 사용자 청음 → 키별 채택 1개 선택 | 사용자 청음 / 총괄이 1차 추천 | 14키 각각 채택 또는 「재생성」 판정 — **R2 4키 청음·채택 완료(2026-10-27, 총괄 추천 가공본)**, 나머지 키는 해당 문서 참조 |
| 2 | SND-02 | 채택본 `promote` → `game.html` 매핑 연결(기존 키 교체 or 신규 키) → 문서 표 갱신 → DEMO/EA 동기화 | 총괄 명세 / Sonnet 구현 | 게임 안 실제 재생 청음 확인 — **R2 4키 반영 완료(2026-10-27, `SND02_ADOPT_R2_20261027.md`)**, 게임 안 청음 대기 |
| 3 | SND-03 | `bgm/` NFC·NFD 중복 대조(파일명·해시) → 정리안 | 총괄 | 정리안 문서 + 사용자 확인 |
| 4 | SND-04 | Unity F04 이식 명세: 웹 사운드 시스템 표(키·파일·음량·rate·우선순위·쿨다운) 추출 → Unity `AudioDirector` 계약 | 총괄 명세 / 맥북 총괄·Codex 구현 | 명세 문서 + PC_TO_MAC_INBOX 양쪽 통보 |
| 5 | SND-05 | 6사운드디자인.md 「예정 항목」(보이스 키 매핑, 포맷 규칙) 정리 | 총괄 | 표로 완결 |
| 6 | SND-06 | 2장 이후 BGM 보강(장2~7 각 2~4곡뿐) — Suno 프롬프트 기획 | 총괄 기획 / 사용자 생성 | 장별 최소 곡 수 목표 합의 |
| 7 | SND-07 (AD3) | 적 공격 예고음 범주 `TELL` 신설·예고음 오용 7곳 제거·새 예고음 3키 — `AD3_ENEMY_TELL_SFX_20261027.md` | 총괄 명세 / Sonnet 구현 / 사용자 청음(2단계) | 1단계 반영 + 2단계 후보 청음 선택 |

## 4. 결정·작업 기록

| 날짜 | 내용 |
|---|---|
| 2026-10-26 | 사운드 총괄 신설. 현황 실측, SND-D1~D3 기록, 백로그 SND-01~06 작성 |
| 2026-10-26 | SND-01 1차 추천 작성(42후보 수치 측정 + 파형/스펙트로그램 눈 확인). 사용자 청음 대기 |
| 2026-10-26 | SND-03 조사 완료: NFC·NFD 71쌍 해시 동일·NFD 전용 0·누락 참조 15개 전부 죽은 코드(`bgmPlay` 호출처 0)·`build-nwjs.mjs`가 두 벌 모두 패키징. 보고서 `BGM_NFC_NFD_AUDIT_20261026.md`, 정리 실행은 사용자 확인 대기 |
| 2026-10-27 | SND-03 정리 실행(사용자 승인): NFD 중복 71경로를 origin/main·로컬 G:에서 제거(`git ls-files bgm` 152→81), DEMO·EA 작업 폴더의 NFD 파일 각 71개 제거(해시 동일 확인분만). DEMO/EA에만 있는 곡 3개(Rotten Forest - Ashen Gate 계열)는 보존. 상세 보고서 ⑦ |
| 2026-10-27 | AD3 조사: 예고음은 프로시저럴 `SFX.charge()` 하나(58곳), 플레이어 3곳·명중 결과 4곳 오용(A4 위반), 일반몹 근접·원거리 예고 무음, 프로시저럴은 우선순위 밖이라 노드 한도에서 드롭. 1~3단계 결정(SND-07) |
| 2026-10-27 | SND-01/02 R2 4키(`crit_heavy`·`ui_button_hover`·`ui_button_confirm`·`amb_hell_forest_bed`) 사용자 청음 채택 → 반영(sound-simple). 신규 연결 4곳: `hurtE` 치명타(12f 쿨다운)·document hover/click 위임·`BGM.play('hell1')` 앰비언스 루프. 발견: `_startLoop` 이름 중복(오디오용이 메인 루프 시작기에 가려짐, 미수정). 상세 `SND02_ADOPT_R2_20261027.md`·`6사운드디자인.md` §SND-02 |
