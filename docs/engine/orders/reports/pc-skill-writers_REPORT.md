# PC-SKILL-WRITERS — SkillForge '일괄 레벨업'·'추천 자동' writer 이식 보고

2026-10-22 KST, PC Claude. 기준 Mac PARITY-UI-04 `e867f9b3`(base INTEG-11 `6c389948`), 브랜치 `claude/pc-skill-writers-20261022`, worktree `G:\exoduser-wt\pc-skill-writers`. main 미병합.
계약: [PC_SKILL_WRITERS_CONTRACT_20261022.md](../../PC_SKILL_WRITERS_CONTRACT_20261022.md). 원본 = 고정 스냅샷 `godot/source_snapshot/game.html`(SHA256 `4d911cdd…`). 로그·캡처: `G:/exoduser-wt/_out/pc-skill-writers/`.

**판정: 두 버튼의 writer는 원본과 같은 결과를 낸다(원본 VM 14행 0불일치, 실제 웹 버튼 클릭 결과 원장 = Godot 원장). 스킬창 화면에서 writer가 바꾸는 값(슬롯 이름, 스킬 Lv, SP·악의·LV 줄)은 웹과 같다. 스킬창 전체 화면은 Mac 소유 표시 차이가 남아 있어 '같다'로 판정하지 않는다(RETOUCH, Mac 소유). 버튼은 아직 Mac UI에서 비활성이다.**

## 1. 변경 파일

| 파일 | 내용 |
|---|---|
| `godot/scripts/native_source_new_run_state.gd` | `commit_native_skill_management`에 `batch`·`recommend` 분기, `_native_skill_bulk_plan`·`_native_skill_bulk_feedback` |
| `godot/scripts/main.gd` | `request_skill_batch_level_up(id)`, `request_skill_recommend_auto(id)` |
| `godot/tests/test_pc_skill_writers.gd` (신규) | 실제 Main 시나리오 14건 + oracle 행 출력 |
| `godot/tests/capture_pc_skill_writers.gd` (신규) | 나란히 캡처용 Godot 장면 |
| docs | 계약(신규), 이 보고서, `2_1 스킬관리+합체시스템.md`, `추천빌드_SKILL_REC_PATH.md`, `CHANGELOG_SYNC.md` |

수식·비용은 새로 쓰지 않았다. 기존 SK-S05e 사본 원장 `batch_recommend.gd`(학습 `learn.gd`, 합체 `fuse_commit.gd`, 비용 `skill_management_cost_source`)를 DEMO11-17 실제 원장 트랜잭션에 연결했다. Mac 소유 파일(`native_skill_forge.gd` 등) 수정 0, docs/2_3 수정 0, 세이브 형식 변경 0.

## 2. 원본에서 확인한 사실

- 버튼 G3090 → `_skillBatchUp` G47192–47233, `_skillRecAuto` G47299–47326. 상세 행은 계약 §1.
- 모든 스킬 `upMat`=0이다. 일괄 레벨업은 악의 0이어도 SP·레벨락만 맞으면 진행된다.
- 추천 자동의 학습 게이트는 `P.sp>=spCost`와 `matCost` 악의뿐이다. SP 0이어도 `spCost` 0인 chainSlash(15단계)는 습득된다. 이 사실을 2_1·추천빌드 문서에 추가했다.
- 2_1 문서의 "필살기 pick 4단계"는 코드상 6단계(`SKILL_REC_PATH[5]`)라 고쳤다.
- 최대치 Lv20은 P.lv≥950이 필요해서 데모(Lv100, 레벨락 3)에서는 도달할 수 없다.

## 3. 원본 node VM oracle

`godot/tests/demo11_17_source_oracle.mjs`(기존, 수정 0)로 확인했다. 이 도구는 스냅샷에서 `_skillBatchUp`·`_skillRecAuto`·`_execFuse`·`_learnSkillAuto` 등 21개 원문 함수를 VM에서 실행하고, Godot이 낸 행과 깊은 비교를 한다. SP·악의는 double 비트까지 비교한다.

| 항목 | 결과 |
|---|---|
| 행 | 14(batch 8, recommend 6). 실제 Main 12건과 fixture 2건(Lv1000에서 Lv19→20, 20에서 0건) |
| 불일치 | **0**. SP·악의 double 비트 28개 일치 |
| 음성 대조 | 행 2개를 일부러 바꿔서(darkPillar 레벨, upgrades 수) 넣었다. 2/2 불일치로 잡혔다 |

| 시나리오(실제 Main, 실제 XP만 사용) | 결과(웹 = Godot) |
|---|---|
| S1 일괄 Lv1 SP0 | 거절 `nothing_to_level_up`, 원장 변화 0 |
| S2 추천 Lv1 SP0 (SP 부족) | 부분 진행: chainSlash 1개 습득, 합체 0 |
| S2b 추천 반복 | 거절 `nothing_to_auto_build` |
| S3 일괄 Lv49 SP144 (레벨락 1 = 최대치) | 거절 |
| S4 추천 Lv49 | 습득 11, 합체 5(pillarSpike·boneStorm·thunderGhost·dimBreach·bladeFuse). SP 144→4, 악의 1000→520. reqLv 미달 스킬과 데모 금지 합체는 그대로 |
| S5 추천 반복(SP 4) | 거절 |
| S6 일괄 Lv52 SP13 (SP 부족) | 7회 강화 후 SP 0에서 멈춤. 바로 다시 계획하면 0건 |
| S7 반복 | 거절 |
| S8 일괄 Lv99 (게임 일시정지 중) | 9회 강화, SP 141→132 |
| S9 일괄 Lv100 악의 0 (실제 소비 API로 0을 만듦) | 16회 강화, 악의 0 유지. upMat 0이라 악의로 막히지 않음 |
| S10 추천 Lv100 악의 0 | 거절 |
| S13 추천 일시정지 중 | 거절(진행할 항목 없음) |

이 밖에 테스트로 확인한 것: 같은 request_id 재호출은 재차감 0, 같은 id에 다른 액션은 `request_id_conflict`, skill_id가 비어 있지 않으면 거절, owner를 잃으면 거절, Forge `manage("batch"/"recommend","")` 경로가 writer까지 도달. 이 테스트는 80 assertions / 0 failures다.

## 4. 나란히 캡처

Mac UI-04의 두 버튼은 비활성이다. 그래서 Godot에서는 **임시 테스트 훅**을 썼다. 버튼이 부를 경로와 같은 `forge.manage("recommend"/"batch","")`를 캡처 스크립트에서 직접 불렀다. 버튼 자체를 누른 것은 아니다. 웹에서는 실제 `#skRecAutoBtn`·`#skBatchUpBtn`을 Playwright로 클릭했다(헤드리스·음소거, 1920×1080, 서버 3399, 격리 save dir).

같은 상태 맞추기: Godot에서 실제 XP로 Lv49와 Lv52를 만들었다. 그 before 원장(JSON)을 웹 P/G/SKILL_SLOTS/ULT_SLOT에 그대로 넣었다.

| 격자 | 판정 |
|---|---|
| `compare_rec_before.png` / `_after.png` | writer 결과 같음. 슬롯 1–4가 '가시덫·빈칸'에서 '악의 해방·기둥가시·해골번개·아이스스톰'으로 바뀐다. SP 4 · 악의 520 · LV 49 |
| `compare_rec_*_crop_slots.png`, `_crop_info.png` (1x) | 위 값을 1x로 직접 확인 |
| `compare_batch_before.png` / `_after.png` | writer 결과 같음. 기검참 Lv1/20 → Lv2/20, SP 13 → 0, 'Lv100 도달 시 해금' 문구 |
| `compare_batch_*_crop_info.png`, `_crop_slots.png` (1x) | 위 값을 1x로 직접 확인 |
| 원장 수치(`state_compare.json`) | 웹 클릭 후 원장 = Godot 원장. 두 장면 모두 skills·_fused·SP·악의·slots·ultimate·active 필드의 차이 0 |

화면 전체는 같지 않다. 남은 차이는 모두 Mac 표시 소유다. 3D 제단 원판이 없다. 슬롯 원판의 테두리와 재질이 다르다. 해골번개(boneStorm) 아이콘이 Godot에서 초록·보라 격자로 깨져 보인다. 에셋 PNG 자체는 정상이고 원인은 확인하지 못했다. 미습득 칩 문구가 웹은 '미습득', Godot은 'Lv 0'이다. 강화+ 비활성 색도 다르다. 웹 캡처에서는 addTxt 피드백이 패널 아래에 그려져 보이지 않는다. Godot은 피드백을 아직 그리지 않는다(PSW-M2).

## 5. 회귀 (최종 코드, 순차 각 1회 — `logs/final_summary.txt`)

INTEG-11부터 Main의 데모 저장소가 기본으로 켜진다. 이 저장소는 user dir 이름이 `EXODUSER-demo11-`로 시작해야 한다. 그래서 PC 테스트를 지시 인자 그대로(A) 돌리면 기존 PC 격리명에서 Main 부팅이 멈춘다. 이 현상은 DEMO11_STATUS의 INTEG-11 표에 이미 적혀 있다("default storage vs legacy/PC namespace"). 그래서 B(`--demo11-storage=off` 인자만 추가, 테스트 코드 수정 0)를 실질 회귀로 삼았다. 신규 테스트도 저장 IO를 막기 위해 B로만 돈다.

| 테스트 | B (storage off) | A (지시 인자 그대로) | base 대조 |
|---|---|---|---|
| test_pc_skill_writers (신규) | **80/0**, SCRIPT ERROR 0, oracle 14/0 | — | — |
| test_demo11_17_skill_management (Mac skill) | **105/0**, ERROR 0 (demo11 격리명이라 기본 인자) | 같음 | — |
| test_pc_move_skills | 256/1 `render_pose blade_dash_squash_idle_frames` | 8/3, Main 부팅 정지(SCRIPT ERROR 90) | 아래 flaky 표 참조. A는 base에서도 같은 8/3 |
| test_pc_recalc_st | 49/0 | 시간 초과(150s), 부팅 정지 | — |
| test_pc_runtime_stat_refresh | 288/0 | 시간 초과, 부팅 정지 | — |
| test_native_qe_binding | 155/0 | 155/0 | — |
| test_pc_combat_pack_b | 378/0 | 14/4, 부팅 정지 | — |
| test_pc_combat_pack_b_mac | 306/29 (pci05 carrier 벽 모델) | 13/4, 부팅 정지 | **base B도 같은 29 실패** |
| test_pc_player_life | 101/0 | 시간 초과, 부팅 정지 | — |
| test_pc_final_death | 61/0 | 시간 초과, 부팅 정지 | — |
| test_pc_enemy_revive | 51/0 | 시간 초과, 부팅 정지 | — |
| E2E `--demo11-storage=on` | isolation PASS → new_game PASS → test 204행 `native_natural_enemies` Nil SCRIPT ERROR 1 → guard 종료(exit 124, 421s) | — | **base도 같은 단계·같은 오류**(INTEG-11 기록과 같음). UI-04 보고의 'intro_phase=done까지'는 PC에서 재현되지 않았다. 원인 미확인 |

pms flaky 대조. 같은 PC, 같은 인자(B)로 내 변경을 stash한 base와 비교했다. 일부는 다른 Godot 실행과 겹친 시간대였다.

| 버전 | 실행 | 실패 |
|---|---:|---|
| base | 8 | 4회. 모두 `blade_dash_squash_idle_frames`(물리 1프레임+process 1프레임 직후 스케일 검사) |
| 이 브랜치 | 8 | 6회. 같은 검사이고, 그중 1회는 `dash_pull_lift_negative`·perf 검사도 함께 실패(실행 37s, 부하 시간대) |

writer 코드는 이 테스트에서 실행되지 않는다. 실패 검사는 모두 프레임 타이밍을 보는 렌더·perf 검사다. 그래서 기존 flaky로 판단한다. 다만 실패 비율 차이(4/8과 6/8)가 무관하다는 것은 통계적으로 증명하지 못했다.

진행 중 사고: 처음 띄운 회귀 묶음을 중단했을 때 부모 셸만 죽고 하위 체인이 남아, 약 35분간 내 다른 실행과 겹쳤다(같은 worktree의 override.cfg를 공유한다). 남은 프로세스는 명령줄에 이 worktree 경로가 있는 것만 종료했다. 실사용 폴더 `EXODUSER-Godot-Native-First`는 10-21 이후 수정되지 않았음을 확인했다. 위 표는 그 뒤 동시 실행 없이 순차로 다시 돌린 결과다.

## 6. Mac 요청

| ID | 내용 |
|---|---|
| PSW-M1 | `native_skill_forge.gd` 하단 `Surface.button("일괄 레벨업"/"추천 자동", …, false)`의 비활성 인자를 풀기. `manage()`가 이미 정확한 명령을 보내고 저장도 한다 |
| PSW-M2 | `last.source_feedback` 그리기. 성공은 addTxt(#ffcc44, life 70/90, 플레이어 위 −30), 0건은 showPH(#ff8844). `SFX.levelup` 재생. 추천 성공 시 `_closeSkPop`·`_skHierTab='rec'`에 해당하는 표시 처리 |
| PSW-M3 | 해골번개(boneStorm) 아이콘이 Forge 슬롯에서 격자로 깨져 보임. 에셋 PNG는 정상, 원인 미확인 |
| PSW-M4 | 스킬창 표시 잔여: 3D 제단, 원판 재질, 미습득 칩 문구('미습득' vs 'Lv 0'), 강화+ 비활성 색 |

## 7. 미확인·미실행

- Mac UI 버튼을 실제로 눌러서 확인하지는 않았다(비활성 상태). 이 부분은 임시 훅 캡처로만 확인했다.
- 합체 연출(voice_fuse, G.shake, 합체 이름 addTxt)과 전투 효과는 기존 fuse와 같이 HOLD다.
- 실제 `--demo11-storage=on` 저장 왕복(버튼 → dbSaveForce 대응 저장 → 재로드)은 이번에 실행하지 않았다.
- PC 실사용 창, Steam, Mac 실기에서는 실행하지 않았다.
