# FEATURE-INVENTORY 작업 보고 — 검수 대기

## 1. 작업 기준·원본 근거

- 작업ID `FEATURE-INVENTORY`, 브랜치 `codex/feature-inventory-pc-20261020`, worktree `G:/exoduser-wt/codex-feature-inventory`.
- 시작 HEAD `2845f96e97d4803e4fb8ab4f3d5c0ff8e80d4353`. 시작 tracked INDEX/WORK 모두 비어 있었음. 원격 fetch 후 관측 origin/main `7c4a2442bfc46f5d25c1bd9bf287a9324d8d5e5a`와 다름. 이 작업은 지정 worktree의 고정 소스를 감사했고 main을 merge/pull하지 않았음.
- `WORK_BOARD.md`와 `MAC_ORDERS_20261020.md` 작업7, 계획 작업표·실제 godot/scripts/port_modules/data/tests를 읽고 판정함. 게임 실행·신규 이미지·에셋 복사·런타임 코드 수정 없음.

| 원본 | 사용 범위·행 근거 |
|---|---|
| game.html:44161 | 실제 SKILL_LIST 55종(삭제 주석 제외) |
| game.html:44324,44453 | 합체 그룹/쌍 각각32키 |
| game.html:27690,27699 | 스탯4·패시브26 |
| game.html:30823,30955 | etype0~89·레어90~99 총100행 |
| game.html:31045,31083 | 정예modifier31·오라4 |
| game.html:16633,16688 | 7장35에리어·35보스 전투 슬롯(고유 이름34) |
| game.html:9820 | BOSS_MOVES59개(idx 비연속) |
| game.html:15863,15886 | 근접 무기7·석궁3 |
| game.html:14370,14858 | 어픽스409레코드/407고유id, 이름맵417키와 분리 |
| game.html:15016,15037,15084,15190 | 고정옵션17·전설효과19·유니크효과39·결정18 |
| game.html:6254,44022 | 재지정 행동20·메인 패널5 |
| game.html:9243,32824,60310,10381 | 펫·월드 상호작용·HUD·BGM |
| game.html:3533,3935,43128,63995 | 저장/자동저장·경험치·시작 스킬 |
| index.html:3026,3522 | 온라인·로컬 캐릭터 목록/로비 |

모든 leaf 행에는 원본 행과 실제 Godot 코드/테스트/작업ID를 기재함. 이름을 확정할 수 없는 항목은 id를 유지했고, 옛 요약(보스19·활5·합체16·어픽스55·무브49)을 억지로 현재 소스에 맞추지 않았음. 특히 보스19종의 과거 taxonomy와 현재35전투슬롯 사이 대응은 미확인으로 남김.

원본 해시:
- game.html SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`.
- index.html SHA256 `36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12`.

## 2. 변경 파일

| 경로 | 변경 |
|---|---|
| docs/engine/FDG_FEATURE_INVENTORY_20261020.md | 분모 정의·상태/비율·legacy 불일치·25분류 1,061개 기능행·각 원본/이식/검수 경계 |
| docs/engine/FDG_GAME_DEVELOPMENT_PLAN.md | 기존 이력/전체 진행률 금지 규칙을 보존한 채 고정 snapshot 검토본 링크·숫자 단락만 추가 |
| docs/engine/orders/WORK_BOARD.md | 사용자 최신 PC 배정/소유 파일·검수 대기 기록만 추가. 다른 담당 행 무수정 |
| docs/engine/orders/reports/FEATURE-INVENTORY_REPORT.md | 본 보고서 |

공용 게임 파일 변경 **0줄**: main.gd·hud.gd·world.gd·player.gd·native_normal_enemy_hurte.gd·native_source_new_run_state.gd 모두 무변경. 레슨·Q/E·세이브 형식·보호 docs/2_3·사용자 서버 무변경.

## 3. 집계·테스트·원로그

### 기능 판정(이 HEAD snapshot 한정)

| 분류 | 항목 수 |
|---|---:|
| 없음 | 387 |
| 일부 | 665 |
| 완료(격리 검수) | 6 |
| 실플레이 인수 | 0 |
| 미확인 | 3 |
| 합계 | 1,061 |

단순 격리 완료 비율 `(6+0)/1061 = 0.57%`, 실플레이 인수 `0/1061 = 0.00%`. UI 표시 등 좁은 기능6개만 완료(격리 검수)이며 관련 테스트와 기존 검수 문서를 연결함. 어픽스407행 등은 생성/reader 데이터만 일부 이식되어 있을 수 있음. 이 비율은 공수·품질·최신 프로젝트 전체 이식률이 아니며, 일부를 완료 분자에 넣거나 가중치·ETA를 제시하지 않음.

### 이번 실행한 정적 검수

실행 환경: CMD + `C:/nvm4w/nodejs/node.exe`. 원로그·스크립트·manifest는 모두 `G:/exoduser-wt/_out/FEATURE-INVENTORY-pc/`.

```text
C:/nvm4w/nodejs/node.exe G:/exoduser-wt/_out/FEATURE-INVENTORY-pc/catalog.cjs
C:/nvm4w/nodejs/node.exe G:/exoduser-wt/_out/FEATURE-INVENTORY-pc/generate.cjs metadata
C:/nvm4w/nodejs/node.exe G:/exoduser-wt/_out/FEATURE-INVENTORY-pc/validate.cjs static-01
C:/nvm4w/nodejs/node.exe G:/exoduser-wt/_out/FEATURE-INVENTORY-pc/validate.cjs format-02 markdown_tables_no_headerless_continuations
C:/nvm4w/nodejs/node.exe G:/exoduser-wt/_out/FEATURE-INVENTORY-pc/validate.cjs classification-03 status_counts_and_simple_ratio,classification_revision_rows_and_document_counts
git diff --check
```

| 검사 | 결과 | 원로그 |
|---|---|---|
| 원본 등록 추출 | 원 선언 리터럴만 격리 평가. game 전체/브라우저는 실행하지 않음 | catalog.json |
| 첫 정적 감사 | **23검사군 중22통과·1실패, exit1** | static-01.json |
| 첫 감사에서 통과한 범위 | 1,061 ID 중복 없음·원본 enum 전체 ID 대응·3389개 source/evidence 경로/행 유효·407어픽스 포함 native 생성표7종 원본 exact 대조·합계/비율·웹2파일 해시·모든행 존재/열수 | static-01.json의 각 evidence |
| 첫 서식 실패 원인 | 큰 표를 chunk로 저장하며 경계15곳에 빈 줄이 들어가 후속 행이 headerless가 됨. 데이터·판정은 불변 | static-01.json의 실패 위치 |
| 해당 서식만 최소 수정 후 재검사 | **1검사군/1통과·0실패, exit0**. 이미 통과한22검사 재실행 없음 | format-02.json |
| 원본/행 manifest | 각 leaf 상태·앵커·해시·snapshot HEAD·작성 시점 포함 | inventory-data.json |
| 의미 검토 후 상태 보수화 | 25행을 일부→없음으로 정정. 기본 키 매핑을 재지정 기능으로, raw grit reader를 XP 복원으로, options reader를 NPC 상호작용으로 세지 않음. 결정 부착·리프트 입장·고정 viewport 역시 실제 player consumer 없음을 반영 | classification-revision.json; 최초 상태는 inventory-data-initial.json에 보존 |
| 판정 수정 영향만 재검사 | **2검사군/2통과·0실패, exit0**. 변경된 상태 집계1군과 변경25행/계획/보고서의 수치 일치 신규1군만 실행. 나머지 통과 검사는 재실행하지 않음 | classification-03.json |

통과22와 별도1을 합쳐 첫 감사 전체23 PASS로 소급하지 않음. 실제 근거 단위(3389참조)는 검사의 assertion군 수23과 다른 분모임. 원본 숫자필드 `hell:0`을 문자열 따옴표로 찾던 생성 보조도구의 초기 앵커 오류는 입력형(숫자/문자열)별 패턴으로 수정했으며 제품 버그나 Godot 테스트 실패가 아님.

판정 보수화 편집의 최초 patch는 데이터 순서와 문서 분류 순서가 달라 역방향 hunk 검증에서 거부되었다. 실제 줄 순서로 정렬한 patch로 수정했으며, 원오류와 진단은 `classification-patch-first-error.txt`에 보존했다. 최초 정적 감사의 집계는 당시 `inventory-data-initial.json`, 최종 집계는 `inventory-data.json`/`classification-03.json`을 따른다.

**Godot 신규 테스트 실행 0회, 실창 실행 0회, 실플레이 인수 0건.** 문서에 연결한 P1/P2 Godot 테스트는 존재·코드/보고서 연결을 조사한 것이며 이번 새 PASS가 아니다. 과거 격리 검수와 실플레이 인수는 별도 유지.

## 4. Git·전달

- 경로 지정으로 이 작업 문서4경로만 stage/commit하고 현재 브랜치에만 `git push origin HEAD` 수행. 최종 SHA·원격 ref 대조는 마감 단락 및 출력 폴더 DELIVERY.md에 기록.
- 자체 최종 commit SHA는 자기 본문에 미리 기입할 수 없어 첫 구현(문서) 체크포인트 SHA를 후속 보고 커밋에 기재하고 최종 remote HEAD는 별도 검증한다.
- main push/병합 없음. P3-003 원래 worktree는 이번 지시 이후 쓰기/커밋/push 없음. **이전 P3 문서 제출 SHA 091490d8d76b12fccb7422094242082139448c5d도 codex/p3-003-pc-20261020 브랜치 전용이며 main에 직접 push한 사실은 없음.**

## 5. 남은 것

1. 총괄의 taxonomy·1061행 분모 인수. 무브/어픽스·UI leaf의 동일 가중 집계는 단순 항목 비율일 뿐이며 변경 시 목록 revision 필요.
2. 최신 main의 P3-003/P3-002·레슨·펫·QA 등 후속 통합을 실제 같은 source tree에서 확인해 판정표 갱신. 다른 브랜치가 있다는 이유만으로 현재 행을 상향하지 않음.
3. 보스19종 요약의 원 분류와 현재35stage/34이름 대응, 기존 요약 활5·합체16·어픽스55·무브49의 명칭/범위 정리는 관련 담당 검토 필요. 여기서는 실제 등록을 그대로 열거하고 설계값을 바꾸지 않음.
4. 표시/데이터 일부와 자연 행동 효과를 분리한 실전 연결 검수. PC/Mac 실플레이·사용자 인수·성능/패키지/전달/Steam은 모두 별도 증거가 필요.
