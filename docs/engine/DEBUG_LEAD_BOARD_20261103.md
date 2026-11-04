# 디버깅 총괄 보드 (2026-11-03~)

## 1. 역할

- 2026-11-03 사용자 지정 "디버깅 총괄". 최신 원격 main(H5)을 실제로 돌려 **오류·잘못된 동작·보이는 값과 실제 값 불일치**를 찾고, 원인을 코드에서 확정한 뒤 직접 고치고 회귀 테스트·화면 검수까지 한다.
- 최신버전 테스트 총괄(`LATEST_BUILD_TEST_BOARD_20261028.md`)은 사용자처럼 플레이해 결함을 넘기는 역할, 이 보드는 결함의 **원인 확정과 수정**이 주 범위다. 디자인 품질 판정은 각 담당 총괄 몫이며 여기서 디자인 PASS를 주지 않는다.
- Unity는 웹 Core를 이식했으므로 웹에서 고친 규칙 결함은 Unity 담당에 같은 내용으로 넘긴다(웹·Unity 동기화 규칙).
- 2026-11-04부터 이 보드의 정본은 unity/main이다(CLAUDE.md 11-03: docs 정본 unity/main). main 사본은 11-03 웹 수정(D-001~D-011)까지의 기록이다. 11-04부터는 CTO 배정으로 Unity Core·M1 결함(D-012~)을 같은 방식(재현 → 원인 → 수정 → oracle 대조)으로 맡는다. PC에서는 컴파일과 .NET 하니스까지만 하고, Player 실행·화면 판정은 Mac에서 한다.

## 2. 작업 환경

| 항목 | 값 |
|---|---|
| 작업본 | `I:/exoduser-wt/claude-debug` (detached origin/main). git은 `git -c safe.directory=I:/exoduser-wt/claude-debug`로 명령 범위 예외만 쓴다 |
| 검수 서버 | 작업본에서 `PORT=3346 node server.cjs` (3333은 최신 main 자동 갱신본, 수정 전 기준 비교용) |
| 브라우저 | headless Chrome + `--mute-audio`, POST `/api/**`는 가짜 200으로 막아 세이브를 쓰지 않는다. 창·소리 0 |
| 산출물 | `I:/EXODUSER-Storage/debug/<주제>-<날짜>/` (스크린샷·결과 JSON·TAP) |
| 1-1 완주 검사 | `tools/debug-run11-browser.mjs <출력폴더> [기준URL]` — 컷신 스페이스 길게→연습 건너뛰기→필드 전투→지옥문→보스 아레나→보스전→처치→출구→다음 버튼. 단계별 상태·pageerror·console error·HTTP 4xx/5xx 기록 |

웹판은 데모(`build-target.js` 기본 `demo`, `_DEMO_LAST_STAGE=0`)라 1-1 클리어 뒤 "데모 종료"가 정상이다. 스테이지 2 이후 순회는 정식 대상(`EXODUSER_BUILD_TARGET='full'`)에서만 의미가 있다.

## 3. 단위 테스트 기준선

| 시각 | 커밋 | 결과 | 비고 |
|---|---|---|---|
| 2026-11-03 | origin/main `e260f712f` | 2569건 중 통과 2254·실패 280·건너뜀 35 (66초, 동시 4) | TAP `I:/EXODUSER-Storage/debug/unit-e260f712f.tap` |

실패 280건 분류(첫 판독):
- **모듈 없음 3**: `canvas`·`acorn`·`sharp` — 작업본에 node_modules가 없는 환경 문제(G: 본체에는 있음).
- **낡은 소스 문자열 검사**: 코드가 바뀐 뒤 정규식을 갱신하지 않은 테스트(예: `ANC_ROSTER`, `doParry(...)`, `giantSlam2`, `_gritTotal`). 동작 결함이 아니라 테스트 부채.
- **함수 추출 하니스 누락**: `X is not defined`(`_FDG_RUINED_FOREST_FIRST`, `_resetInteractInput`, `_applyBlinkWeakPath`, `window`, `fetch`, `requestAnimationFrame` 등) — game.html에서 블록만 떼어 실행하는 테스트가 새 의존을 모른다.
- **실제 값 불일치 의심**: `victory text fits the actual WebGL text atlas`, `kiSlash fired from a bow recovery hits as hard as the ordinary combo`, `17 stable equipment ids` 등 기대값 비교 실패. 하나씩 원인 확정 필요(백로그 D-T1).

규칙: 테스트는 고친 뒤 영향 범위만 1회. 같은 테스트를 수정 없이 다시 돌리지 않는다. 전체 실행은 기준선 갱신 때만.

## 4. 결함 목록

| ID | 증상 | 원인 | 상태 |
|---|---|---|---|
| D-001 | 첫 컷신 우하단 "SPACE 길게 눌러 건너뛰기"의 `SPACE` 글자 위에 대사 진행 ▼가 겹쳐 그려짐(1600×900 확인) | ▼ 위치 `cw*.92, ch-subH*.2`가 스킵 안내(`_fullW-20, _fullH-34`)와 같은 높이 | **수정**: ▼ 높이를 `ch-max(subH*.2,58)`로 제한. 1280×720·1600×900·1920×1080 크롭 확인, 겹침 0 |
| D-002 | 사냥꾼 패시브(정예/보스 추가 피해 +10%/Lv)가 보스·정예에 적용 안 됨 | `_hunterMul`이 어디서도 설정되지 않는 `e.isBoss`/`e.isElite`를 봄. 실제 필드는 `e.ib`/`e.elite` | **수정**: `e.ib||e.elite||e.etype>=90` |
| D-003 | 사망 화면 피해 기록에 보스가 `몬스터(0)`, 일반 적이 `몬스터(etype)` 내부 번호로 표시 | `_logDmg`도 `e.isBoss`를 봄 + 일반 적 이름 대신 etype 숫자 | **수정**: 보스=스테이지 보스명, 정예=`정예 몬스터`, 일반=`몬스터`(No.3845~3846, 28언어) |
| D-004 | 장비 툴팁의 망토·왕관 DEF가 실제 피격 방어에 안 들어감, 유골함 속성방어도 누락 | `hurtP` 합산식에 cape/helmet `.def`, ossuary `.eDef` 없음 | **수정**: `_playerDefTotals()`로 합산(7칸 DEF, 15칸 eDef) |
| D-005 | 스탯창 방어 수치가 실제 피격 방어와 다름 | 스탯창은 강화 9부위 합산·근성 eDef 누락, 피격은 강화 3부위(shield/armor/cape)·근성 포함 | **수정**: 스탯창·피격이 같은 `_playerDefTotals()` 사용. 스탯창 세부 줄에 망토·왕관 표시 |
| D-006 | 보스 테스트 도구 `_btBoss`가 다시 소환 뒤 보스를 못 찾음 | `ens.find(e=>e.isBoss)` | **수정**: `e.ib` |

| D-010 | 3333 최신 웹이 11-02 23:53(b1a26271c)에 4시간 멈춤. 예약 `EXODUSER_LatestWeb3333`은 5분마다 결과 0으로 돌았고 로그 0줄 | ① 다른 세션이 3333 서빙 체크아웃 `G:/exoduser-wt/latest-web`의 `docs/API연결_가이드.md`·`docs/CHANGELOG_SYNC.md`를 직접 고쳐 ff가 "Aborting". ② `refresh.ps1`이 merge 직후 `git rev-parse`로 `$LASTEXITCODE`를 0으로 덮어써 실패를 기록하지 못함 | **수정**: 미커밋 수정은 `I:/EXODUSER-Storage/backup/latest-web-wip-20261103-0330/`(패치+원본 2개)에 보존 후 되돌려 4cf4d74eb까지 ff. `refresh.ps1`이 merge 종료코드를 보관하고 실패 시 막은 추적 파일명을 로그에 남김. latest-web에는 문서를 쓰지 않는다(작업은 각자 작업본) |

| D-011 | 로비 묘왕 바르칸이 원형 단 중앙에 서지 않음(사용자 11-03 스크린샷: 단 오른쪽) | Unity `DrawAncestor`는 발을 가로 960 고정(단 중심 660과 300px 차이), 웹은 배경 가로33%·세로84% 고정이라 와이드 확장판(원본 영상을 가운데 상자로 옮김)에서 어긋남. 둘 다 스프라이트 기준점이 가슴(x182)이라 두 발 중점(x207)과 25px 차이 | **수정**: 배경 원본이 실제 그려진 사각형 안 단 동심원 중심(660,850)/(1920,1088)에 두 발 중점·발바닥 높이 중간(207,596)을 맞춤. 웹 main, Unity unity/main(+`--unity-ancestor-lobby-capture` 검수 모드). 웹 1920×1080·1600×900·2560×1080·3840×1080 캡처로 확인 |
| D-012 | Unity M1 09c(SWAP2 eaf67fae9): 아귀 전멸·지역 4/4·플래그인데 `BossUnlocked=false`, 진행 기록 17/18에서 조기 종료 | Core 결함이 아님. 마지막 지역은 15프레임 지역 판정에서, 지옥문은 그 뒤 첫 30프레임 룸 판정에서 열려 1~44틱 걸린다(웹 `_regionTick`·`checkRooms`와 같음). 검사는 마지막 처치 뒤 30틱만 진행했다. 패링 G2는 위상만 옮겼다 | **수정**(unity/main 병합 db26d55f6): M1 09c가 개방까지 최대 +45틱 대기(강제 개방 없음). `Tools/region-test` 450위상 재현(최대 44틱, 30틱 시점 봉인 105/450) 124/0. 상세 `UNITY_M1_REGION_RB_20261028.md` §9 |
| D-013 | Unity Core 시험 36/1: canMv 대조 2,523표본 중 2개(4018.5,104.7 r10 / 4042.9,207.9 r15) 불일치 | oracle 입력 누락. 웹 맵 생성이 `MAP_OBJS`에 넣는 `boss_gate_col`(원 반경 100)이 정적 맵 export에 없음. Unity(벽 13타일+게이트 타일 차단, 3ed856bf6)가 실제 웹과 같은 판정 | **수정**(db26d55f6): `map-oracle.cjs`에 같은 원 추가 → 36/0. Core·맵 무변경. 게이트 주변 2px 격자에서는 타일 근사와 원의 테두리 모양이 5,156/157,383표본 다름(새 통로·막힌 길 없음, 출구·아레나 진입 무영향). 정확 일치는 맵 총괄 판단 후보 |
| D-U1 | Unity 사냥꾼 패시브(pHunter)가 보스·정예에 적용 안 됨. 스탯창도 "보스·정예 별칭 분기 미연결" 안내 | `Simulation.EnemyBridge`의 HunterMul이 `etype>=90`만 봄. D-002 이전 웹(안 쓰이는 `isBoss/isElite`)의 실제 동작을 그대로 이식한 것 | **수정**: `Simulation.HunterMul(w, rank)` = `ib \|\| elite(참) \|\| etype>=90 ? 1+0.10×rank : 1`(웹 06ac6882b `_hunterMul`). 스탯창 미지원 안내 삭제. `Tools/hunter-oracle`: 웹 원문 280사례 불일치 0(수정 전 규칙 96/280), 실제 피격 경로 pHunter 3 = 보스·정예·레어 ×1.3, 일반 ×1 |
| D-U2 | Unity 피격 방어가 웹과 다름: 물리방어에 망토·왕관 def·장비 근성 없음, 에너지방어(마법·패링 피해) 0 고정, 장비 방어 어픽스(physDR·barrier·healthyDef·injuredDR·dotDR·farDR) 무효. 1-1 드랍 갑옷·방패·바지·망토에도 붙는 어픽스 | 이식(B09) 당시 장비·어픽스 층이 없어 입력 0으로 둔 자리가 장비 이식 뒤에도 연결되지 않음 | **수정**: `InventoryState.CalculateStats`가 웹 `_playerDefTotals()`(7칸 def + 15칸 eDef + defFlat/eDefFlat + 강화 + ⌊(⌊Lv/2⌋+장비 근성)/2⌋) 계산, `Simulation.Growth`가 SP 근성의 방어 증가분은 물리·에너지 모두에, `pArmor×20`은 물리방어에만 더함, `ApplyEquipment`가 `PlayerEnergyDefense` 연결. `HurtPlayer`가 웹 순서대로 physDR(물리만) → barrier → 조건부 DR(캡 50%). 웹은 `opts.src`를 문자열로만 넘겨 bossDR은 죽은 경로, far/close는 원점 거리(|x|+|y|)라 라벨 붙은 독 DOT에만 farDR(Unity도 같게 `HurtOptions.Labeled`). burnDR은 Unity에 플레이어 화상 DOT가 없어 미연결. `Tools/defense-oracle`: 웹 원문 장비 240건·피격 11,520건 불일치 0(수정 전 239/240·8,601/11,520) |
| D-014 | oracle 일괄 점검(Codex 레인 debug-oracle-sweep 14ae05cbb, Core bea021bcf / 웹 06ac6882b): C# 76개 중 FAIL 10 | 판정: **게임 결함 0**. ① 적 AI 61,645·생성 7,543·피격 분열 372 = 사용자 G0 선택 패링 A안(`PARRY_G2_20261103.md`) 투사체 정책(대상 5종 0·4·6·19·29 끔, 원거리풀 240 유지, 나머지 주기 2배, 1-1 첫 구간 돌격형→etype0)과 그 이동·상태 여파뿐(적 종류×필드 전수 집계). 생성 중 13필드 7,000여 건은 하니스가 C01-AI 값형 필드를 "웹 undefined"로 센 표현 차이 ② 저장 `game.stageDiffOff` = Unity가 다음 스테이지 난이도를 저장하는 의도된 확장(웹 세이브는 0으로 읽음) ③ 피격 `flashT/scrFlashA` = Unity Core는 feel 끈 상태를 들고 화면은 `KiImpactView.FeelEnabled`일 때 그리지 않음(웹 `?feel=0` 분기와 같음) ④ 낡은 기대값 4개(어픽스 문구 2, 키 20→21, 인트로 29언어×27줄) ⑤ `STG[33].bn` Killu = e9898f795 의도된 로캘 이름(7-2) ⑥ 스킬창 13 대 16 = 웹 10-31 9a5be1fac 고정 기술 3칸 표시(D-U4) | **하니스 수정**(Tools만, Core 무변경): 생성 AI 필드 예외, 저장 Unity 전용 키, 피격 feel=0 기준, 낡은 기대값 4개, 적 AI 시나리오별 실패 집계. 재실행: 피격 47,559/0·저장 2,604/0·설정 91/0·인트로 29/0·어픽스 PASS. 적 AI·생성·피격 분열은 A안 기대값 층이 없어 FAIL로 남음(D-T3) |

회귀 테스트: `test/bossEliteFlagsAndDefenseTotals.test.js` 3건 통과. 영향 테스트 22파일 138건 재실행 — 실패 16건은 전부 기준선부터 실패하던 것, 새 실패 0.

## 5. 백로그 (다음 순서)

| ID | 내용 | 근거 |
|---|---|---|
| D-T1 | 단위 테스트 "실제 값 불일치 의심" 묶음을 하나씩 원인 확정(코드 결함인지 테스트 부채인지) | §3 |
| D-T2 | 낡은 소스 문자열 검사·추출 하니스 누락 테스트를 현행 코드로 갱신하거나 폐기 판단. 11-04 일괄 점검 NEEDS-INPUT 9개(CoreTests·enemy-tick·LobbyTests·comparison·feedback·hud·inventory·ki-slash 2) 포함 | §3·D-014 |
| D-007 | `DOCS_SYNC_AUDIT_20261028.md` 코드 의심 버그 4번: strFlat/dexFlat/intFlat 어픽스가 ATK 기준값에 안 들어감 | 감사 문서 |
| D-008 | 같은 문서 5·8번: critDmgA/critDmgB, blastShot/bladeShot 사장 경로 확인 | 감사 문서 |
| D-009 | 1-1 완주 검사의 보스 처치 단계 완성. 3회차 추적: 다크드루이드(최대HP 33,332)에 최대HP 20% 타격 40회 — `bossChargeWind`·`bossDruidDive` 중 피해 0(부활·휴식 `reviveIframes` 추정), 20% 아래 타격에서 `recover`로 33,332 전체 회복(부활 단계 추정). 보스 SSOT(`8.1보스디자인바이블`, `2_5 부활`)와 대조해 설계인지 확정한 뒤, 하니스는 처치까지 타격 횟수·간격을 늘린다 | 2026-11-03 실행 |
| D-U3 | **도구 병합·불일치 측정, Core 수정 대기**. Unity 최대 HP·MP·ST에 장비 근성이 빠짐: 웹 `_gritHpFlat/_gritMpFlat/_gritStFlat` = `_gritTotal()`(SP 근성 + ⌊Lv/2⌋ + 장비 `bGrit` + `gritFlatN/R`)인데 Unity는 SP 근성·레벨분만 더함. 같은 대조 때 `maxSTFlat`·`maxMPFlat` 등 자원 어픽스도 함께 확인 | 웹 `recalcStats` 28354·28361, `recalcSt` 16773 |
| D-T3 | 적 AI·생성·피격 oracle에 패링 A안 기대값 층 추가: 지금은 A안 의도 차이로 항상 FAIL이라 이 영역 회귀를 못 잡음. 웹 원문 결과에 A안 투사체 정책(대상 5종 9999, 원거리 240, 나머지 2배·projT 2배, 엘리트·M02 배율)을 씌운 기대값으로 비교하고, 대상 5종 근접 상태는 G2 전용 검사(`parry-g2-tests`)로 넘긴다 | D-014 |
| D-U4 | Unity 스킬창에 웹 10-31(9a5be1fac) 고정 기술 3칸(Space 구르기·X 처형 고유기, T 활)이 없음. Core `SkillUiState.SlotCount=13`, `skill_ui.json` 13칸. 표현층이라 UI 담당 판단(웹은 비교 기준) | D-014 |

## 6. 실행 기록

| 시각 | 대상 | 결과 |
|---|---|---|
| 11-03 | 3333 최신 main, headless 60초 스모크 | pageerror 0, console error 0 |
| 11-03 | 3333, 1-1 완주 검사 | 필드 60회 입력·처치 37, 지옥문→아레나 진입 정상, pageerror 0. 하니스가 보스 처치 전 플레이어 사망(D-009). 사망 기록 `몬스터(0)` 발견(D-003) |
| 11-03 | 3346 수정본, 컷신 3해상도·스탯창 | pageerror 0, ▼ 겹침 0, 스탯창 물리방어 합계에 망토 60·왕관 70 반영 |
| 11-03 | 3346 수정본, 1-1 완주 검사 3회 | pageerror 0·console error 0. 보스 사망 기록 `투사체 [다크드루이드]` 확인(D-003). 2회차 필드 복귀는 하니스가 사망 뒤 Space로 '다시 일어서라'를 누른 것(게임 결함 아님) → 하니스가 매 입력 HP·무적을 채우도록 수정. 3회차 보스 아레나 유지, 보스 미처치(D-009) |

| 11-03 | 4cf4d74eb 배포 | main 비강제 푸시(e260f712f→4cf4d74eb). 3333(latest-web) 4cf4d74eb 반영. DEMO/EA 동기화를 latest-web에서 실행(G: 메인은 옛 커밋이라 사용 안 함): DEMO 갱신 30·EA 29, 추가·삭제 0. 두 실행본 game.html에 `_playerDefTotals` 확인, DEMO `_BIC=true` 유지 |

관찰(결함 아님): 아레나 진입 순간 처치 수가 남은 필드 적 수만큼 증가 — `_enterBossArena`의 "던전 잔여 몹 소멸 = 킬로 카운트" 의도 규칙. 웹판 `bgm/intro.mp4` requestfailed는 `preload="metadata"` 범위 요청 중단으로 파일은 정상(206).

## 2026-11-04 D-U3 원문 대조 도구 병합 보충

병합 `9a38c9564`(도구 `7e7f68e32`), 감사 기준 `3abbea79e`. `unity/Tools/resource-oracle`는 원문 applyStats/recalcSt를 실행하고 Core ApplyEquipment의 Config·Player 최대 HP/MP/ST/쉴드를 비교한다. 고정 시드873220, 합성530사례(기준32·단독138·혼합360), 자원 관련 어픽스115종이다.

| 확인 | 값·한계 |
|---|---|
| 기존 결과 입력 | 웹 `06ac6882b550cb6373f2953ede3b2acc6f69e211`, Core `bea021bcf1b2d20689e9f014834456879c5a722a` |
| 기존 result.json 재독 | 530사례 중 불일치372(단독12·혼합360), Config-Player 불일치0. 단독 원인 이름11개 중 장비 항10개와 SP VIT 1개이며, 장비 bGrit는 일반/allocated 두 사례로 집계된다 |
| 실행 결과 의미 | compare 종료0=동일,2=수치 불일치,1=하니스/입력 오류. 자원별 실패 수와 사례 수는 다른 단위다. 최대치 효과가 양쪽0인 회복·흡수 항을 구현 PASS로 해석하지 않는다 |
| 인수·재사용 | run.cjs 필수 `--source --out --web-commit --core-commit --dependency-root`. `--reuse-build`는 Program/Core가 같을 때만 사용한다. .NET SDK8.0.301, 외부 NuGet 소스 없음 |
| 남은 일 | 이 기준본에는 후속 Core 수정이 병합되지 않았다. 수정 담당이 새 SHA의 결과를 별도로 인수해야 한다. 자연 플레이·드랍 확률·UI·Player·Mac 판정은 이 하니스 범위 밖이다 |

원본 영수증: `I:/EXODUSER-Storage/debug/resource-oracle-20261104/result.json`. 이번 감사는 읽기만 했고 재실행·Core 변경0이다. D-014의 C#76개 집계는 resource-oracle을 제외한다. 최초 sweep 전체124항목은 프로젝트76(56 PASS/10 FAIL/9 NEEDS-INPUT/1 SKIP) + 추출기48(33 PASS/15 NEEDS-INPUT)이며, 추출기 통과를 Core 규칙 통과로 합산하지 않는다.
