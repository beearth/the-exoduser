# PC-SKILL-WRITERS 계약 — SkillForge '일괄 레벨업'·'추천 자동' writer

2026-10-22 KST, PC Claude. 기준 Mac PARITY-UI-04 `e867f9b3`(base INTEG-11 `6c389948`), 브랜치 `claude/pc-skill-writers-20261022`, worktree `G:\exoduser-wt\pc-skill-writers`.
원본 = 고정 스냅샷 `godot/source_snapshot/game.html`(SHA256 `4d911cdd…85e5d4`, main `game.html`과 같음). 보고서: [orders/reports/pc-skill-writers_REPORT.md](orders/reports/pc-skill-writers_REPORT.md).

UI-04는 스킬창 하단 두 버튼을 PC writer가 없어 비활성(HOLD)으로 두었다. 이 작업은 **writer와 Mac이 부를 API만** 제공한다. 버튼 표시·활성화·피드백 그리기는 Mac 소유다.

## 1. 원본 행

| 원본 | 내용 |
|---|---|
| G3090 | `#skBatchUpBtn onclick=_skillBatchUp()`, `#skRecAutoBtn onclick=_skillRecAuto()`(닫기 옆). skill-forge.js408–409는 문구만 바꾼다 |
| G47188–47233 `_skillBatchUp` | 레벨락 `min(20, ~~(P.lv/50)+1)`, 최대 20. ① `_FUSE_PAIRS` 중 `_isFused` 키를 멤버 수 내림차순(동률은 원래 순서) 정렬, 멤버가 전부 이미 처리됐으면 건너뜀, 그룹 레벨 `min(P.skills[id]||1)`부터 `_fuseUpSpCost(lv, 멤버수)` SP로 멤버 전체 `max(cur, lv+1)`. 악의 없음. ② `SKILL_LIST` 순서로 `sk.up`·미흡수·습득(≥1) 스킬을 `_skillUpSpCost(lv)` SP + `_malCost(upMat)` 악의로 강화. SP·악의가 모자라면 그 스킬만 멈춤 |
| G47226–47229 | 강화 1건 이상: `SFX.levelup`, addTxt `일괄 레벨업 ×N`(#ffcc44, 70), `renderSkillPanel`·`updateSkSlot`·`updateQS`·`dbSaveForce` |
| G47231 | 0건: `showPH('레벨업 가능한 스킬 없음', '#ff8844')` |
| G47235–47273 `_execFuse` | 성급×3 SP 선차감 → 멤버 미습득은 Lv1, Lv>1은 SP·악의 환불 후 Lv1 → `_fused[key]=true` → LMB 회전참·stormBeam 히든 → 흡수 슬롯 정리 → 호스트 자동 슬롯 → `_syncActiveSkAfterReset` |
| G47274–47295 `_learnSkillAuto` | SP·악의(matCost) 게이트만. 슬롯 자동배정·활성 스킬 선택 |
| G47296–47326 `_skillRecAuto` | `SKILL_REC_PATH`(G44094–44110) 15단계 순회. pick 단계(6단계)는 필살기 미보유 시 첫 후보 습득. 각 단계 미습득 스킬 중 `reqLv<=P.lv`만 `_learnSkillAuto`, 이어 `_canFuse(fuse)`(G44608–44617, `_DEMO_MODE`면 `_DEMO_FUSE_ALLOWED` G16649만)면 `_execFuse` |
| G47318–47322 | 1건 이상: `_skHierTab='rec'`, `_fuseSelId=null`, `SFX.levelup`, addTxt `추천 자동: 습득 N / 합체 M`(#ffcc44, 90), `_closeSkPop`, `updateQS`·`updateSkSlot`·`renderSkillPanel`·`dbSaveForce` |
| G47324 | 0건: `showPH('추천 진행할 항목 없음', '#ff8844')` |
| G3913–3925, G28081–28085 | `_skillUpSpCost`(Lv1~20 모두 1), `_fuseUpSpCost`(기본+성급−1, Lv9+ 캡 2~3성 6·4성 8), `_malCost`(0이면 0, 아니면 max(1, ceil(v×0.5))) |

원본 사실(현재 스냅샷): 모든 스킬 `upMat`은 0이다. 그래서 일괄 레벨업은 악의로 막히지 않는다. 추천 자동은 `spCost` 검사만 하므로 SP 0이어도 `spCost` 0 스킬(chainSlash)은 습득한다.

## 2. 이식 구조 (수식 복제 없음)

| 위치 | 내용 |
|---|---|
| `port_modules/skill_management_source/batch_recommend.gd` (기존 SK-S05e, 수정 0) | `batch_preview`·`recommend_preview` — 위 원본 순서를 사본 원장에서 실행. 학습은 `learn.gd._apply_shadow`, 합체는 `fuse_commit.gd._apply_shadow`, 비용은 `core_support`→`skill_management_cost_source` 재사용 |
| `scripts/native_source_new_run_state.gd` `commit_native_skill_management` | `action` `batch`·`recommend` 분기 추가. 기존 learn_up/fuse/minus/reset과 **같은** 트랜잭션: 재진입 차단·request_id 재생·필드 화이트리스트·active 투영 검증 → 실제 `_p.skills/sp/_fused/active*/skillSlots/ultSlot`, `_g.mats` 기록 |
| 같은 파일 `_native_skill_bulk_plan` / `_native_skill_bulk_feedback` | 계획 선택(추천은 실제 데모 부팅 정책이 READY·demo·build_target=demo일 때만 `demo=true`로 `_canFuse` 적용 — `fuse` 액션과 같은 게이트), 원본 마지막 피드백 문구·색 데이터 |
| `scripts/main.gd` | 공개 API 2개(아래) |

## 3. API (Mac이 부르는 것)

```gdscript
main.request_skill_batch_level_up(request_id: String) -> Dictionary
main.request_skill_recommend_auto(request_id: String) -> Dictionary
```

둘 다 `main.request_native_skill_management({"request_id":id,"action":"batch"|"recommend","skill_id":"","confirmed":false})`와 같다. **UI-04 `native_skill_forge.gd`의 `manage("batch","")`/`manage("recommend","")`가 이미 정확히 이 명령을 보낸다.** 따라서 Mac은 두 `Surface.button(..., false)`의 비활성 인자만 풀면 된다(저장은 기존 `manage()`의 `save_native_demo11_current()` 경로 = 원본 `dbSaveForce`).

- `request_id`: 1~96자 문자열. 같은 id·같은 명령 재호출은 `replayed:true`로 같은 영수증(재차감 0). 같은 id·다른 명령은 `request_id_conflict`.
- `skill_id`는 반드시 `""`(아니면 `bulk_action_takes_no_skill_id`).
- 게임 일시정지 중에도 가능(원본 K 버튼에 `G.paused` 검사 없음, learn_up과 같음).

### 성공 영수증 (`committed:true`, `accepted:true`)

| 필드 | 값 |
|---|---|
| `status` / `branch` | `COMMITTED` / `batch` 또는 `recommend` |
| `before` / `after` / `current` | 스킬 원장 스냅샷(`p.lv/sp/skills/_fused/exp/maxExp/active*`, `g.mats`, `slots`, `ultimate`) |
| `counts` | batch `{upgrades:N}` / recommend `{learned:N, fused:M}` — 원본 `_total` / `_nL`·`_nF` |
| `fused_keys` | 이번에 새로 합체된 키 목록(recommend) |
| `source_feedback` | `{kind:"addTxt", ko, en, color:"#ffcc44", life:70|90, dy:-30, sfx:"levelup", source, pending:[...]}` — 표시 owner가 그릴 원본 문구 |
| `prefix` | `["ledger","active_selection","slots"]` |
| `fusion_combat_handoff` | 합체가 있으면 `{status:"HOLD", fusion_keys:[...]}` — 합체 전투 효과는 기존 fuse와 같이 HOLD |
| `handoff` | 바인딩된 PC/Mac 표시 owner 응답. 미바인딩이면 `presentation_owner_unbound` + pending 목록(기존 계약 그대로) |

### 거절 영수증 (`committed:false`, `prefix:[]`, 원장 변화 0)

| `reason` | 언제 | `source_feedback` |
|---|---|---|
| `nothing_to_level_up` | 일괄 레벨업 0건(SP 부족·레벨락·전부 20·미습득만) | `{kind:"showPH", ko:"레벨업 가능한 스킬 없음", en:"No skills to level up", color:"#ff8844"}` |
| `nothing_to_auto_build` | 추천 자동 학습·합체 0건 | `{kind:"showPH", ko:"추천 진행할 항목 없음", en:"Nothing to auto-build", color:"#ff8844"}` |
| `actual_demo_fusion_policy_required` | 추천 자동인데 데모 부팅 정책이 READY 아님 | 없음 |
| `bulk_action_takes_no_skill_id` | `skill_id`가 비어 있지 않음 | 없음 |
| `request_id_conflict`, `skill_transaction_in_progress`, `skill_owner_lost`, `actual_skill_management_owner_or_reentry_gate`, `invalid_skill_command`, `unsupported_command_field` | 기존 DEMO11-17 공통 게이트 | 없음 |

## 4. 원본에 없는 동작·범위 밖

- 새 비용·배율·제약 없음. SFX·addTxt·showPH·`_closeSkPop`·`_skHierTab`는 그리지 않고 데이터로만 넘긴다(Mac 표시 소유).
- `_execFuse` 내부 연출(voice_fuse, `G.shake=8`, 합체 이름·슬롯 배정 addTxt)은 기존 fuse 액션과 같이 미표시 pending.
- shieldFuse: 원본 추천 9단계는 `_canFuse('shieldFuse')`면 합체한다. PC는 새 게임에서 shieldFuse가 이미 합체돼 있고(`apply_native_new_game_starting_skills`) shieldFuse 리셋은 HOLD라 이 분기는 현재 도달 불가다. 사본 원장은 원본대로 둔다.
- 최대치 20은 P.lv≥950이 필요해 데모(Lv100 캡, 락 3)에서 실제 도달 불가. 사본 원장 fixture 행(Lv1000)으로만 원본 대조했다.
- 세이브 형식 변경 없음.
