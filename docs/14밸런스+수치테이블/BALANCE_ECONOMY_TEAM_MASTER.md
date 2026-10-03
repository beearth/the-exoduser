# BALANCE 전투 밸런스·성장 경제팀 운영 대장

## BALANCE 본인 추가: SAVE-WRITE-FAILURE 미적용 후보 (2026-10-02)

| 범위 | 근거·현재 상태 | 남은 게이트 |
|---|---|---|
| server.cjs POST /api/save 읽기 전용 | 원문 추출·메모리 fs 부분쓰기 EIO로 기존 JSON 손상 재현. 같은 디렉터리 wx 임시쓰기/close/rename 후보와 실패/정리/호환 13 PASS | 생산 미적용. 실제 디스크/OS 교체/크래시/fsync/HTTP 미검수 |
| 소유 산출 | tools/team-followup-20261001/BALANCE/save-write-failure-* 전용 후보/patch/검사/evidence/receipt/result | root 함수 SHA 검수 후 통합 판단. 이전 disk-save-restart EPERM 미완료 유지 |

상세 근거: [전용 결과](../../tools/team-followup-20261001/BALANCE/save-write-failure-result.md). 사용자 저장·공유 악의·강화수치 변경0, 서버/네트워크 실행0. 기존 팀 기록과 타팀 초안은 보존했다.

## 2026-10-02 저장 보류분 생산 통합

| 대상 | 현재 상태·계약 | 검수·남은 인수 |
|---|---|---|
| 본편/easy 저장 구역 | dbSaveNow 컨텍스트 보류와 _drainPendingSaveNow, 세 _saving=false 종료 호출을 생산 반영(각 HTML 4hunk). 일반500ms/force5초/비용/RNG/schema 불변 | 생산 추출22 PASS, 양쪽 inline6개 구문검수, 승인범위 밖 전체byte·인벤토리 및 기존후보/증거 보존 |
| 보류분 처리 | 같은 charId/idx/P/dbSave와 DB준비 확인, pending 먼저 소비한 뒤 dbSave 즉시 호출. 완료 후 재500ms 제거 | dispatch/ACK/메모리persist 분리. 실제 서버/사용자 save/재실행/unload 미검수 |
| 소유 인계 | UIUX 반환 뒤 BALANCE 단독 저장 구역 통합. 완료 후 HTML은 root에 반환 | Git checkpoint/총괄·CHANGELOG는 root 담당. [결과·의존성](../../tools/team-followup-20261001/BALANCE/production-integration-result.md) |

기준: 2026-10-01 KST. 총괄 작업 [PM-013](../0마스터플랜/PROJECT_MANAGEMENT_MASTER.md). 수치의 확정 근거는 각 시스템 SSOT와 실제 코드이며, 이 문서는 조사·검수·인계 상태를 관리한다.

## 책임과 공용 편집 범위

| 역할 | 책임 | 이번 담당 함수·데이터 | 경계 |
|---|---|---|---|
| 전투 수식·빌드 검증 | 피해·자원·중첩·상한·발동 조건 대조 | 수치표, 계산 경계 테스트 | 개별 스킬·아이템·몬스터 구현은 각 제작팀 |
| 드롭·성장·강화 경제 | 획득·소비·강화 비용 및 진행 구간 비교 | `_calcMaxExp`, `_restoreExpProgress` 경험치 값; 수동·일괄 스킬 강화의 악의 게이트 | 기존 확정 공식·보호 패링 설계 유지 |
| 데이터·실플레이 검수 | 격리 데이터·실화면 증거 구분 | `test/balanceExpCurve.test.js`, `test/balanceSkillUpgradeCost.test.js` | 사용자 세이브와 공유 악의 저장소 미접촉 |

PM-013 수정 소유 구역: `game.html`과 `game-easy-test.html`의 `_calcMaxExp` 초월 분기, `dbRestore`의 `lv/exp/maxExp` 대입, 공용 스킬 수동 강화 `canUp`·일괄 강화 `_matGate`의 악의 검사만 BALANCE 팀장이 순차 편집했다. 기존 MAP·UI 등 타 팀 diff를 보존했다. 개별 콘텐츠 함수 `activateBlastShot`은 스킬팀 인계 항목으로 유지하며 다른 팀에 이 문서가 전달됐다고 가정하지 않는다.

## 본편·데모·쉬운 테스트판의 현재 수치 경계

| 구분 | 실행·진행 범위 | 주요 수치와 차이 | 증거 수준 |
|---|---|---|---|
| 본편 설계·공통 코드 | Lv 상한 없음, 7장 전체 성장식·아이템·강화식이 공통 코드에 존재. 다만 현행 `index.html`의 `_LOBBY_BUILD='demo'`, `game.html`의 `_DEMO_MODE=true`라 현재 로비→메인 HTML로 본편 분기에 진입할 수 없다 | Lv<1000 XP=`floor((15+2.5Lv+0.05Lv²)×1.001^Lv)`, Lv≥1000 XP=`5,000,000+(Lv−999)²×10,000`; 난이도 배율 아래 공통행 | 코드·설계 확인. 현재 본편 실플레이와 대상 패키지 미확인 |
| 공개 데모 `game.html` | 데모 모드 고정, Lv100 상한, `_DEMO_LAST_STAGE=0`으로 CH1-1 뒤 종료. 보통 새 캐릭터 악의 1,000, 시작 스킬은 난이도 조건·강제 지급 경로를 따른다 | 공통 피해·자원·강화 계산을 쓰되 Lv100 이후 XP는 막는다. 문서의 과거 si3 피날레 수치는 현재 공개 데모 범위가 아님 | 코드 확인. 이번 PM-013 실제 플레이 미실시 |
| 쉬운 테스트판 `game-easy-test.html` | 독립 사본. URL의 BIC/데모 분기에서 Lv100/500 상한, 데모가 아니면 본편형 진행 분기 | 공통 난이도·XP·강화식 + 플레이어 최종 피격 피해 0.5배, 지정 그로기 시간 0.5배, 고정 풀스턴 150f 등 전용 보정. 이 사본의 본편형 분기는 기본 본편 수치로 취급하지 않음 | 코드·[테스트판 SSOT](EASY_BALANCE_TEST_20260912.md) 확인. 이번 실플레이 미실시 |

| 공통 계산 항목 | 현재 값·조건 | 적용 위치·제약 |
|---|---|---|
| 난이도 | `DIFF_MUL[0..10]=[0.45,0.55,0.65,0.76,0.88,1,1.12,1.25,1.40,1.58,1.78]`; index5 일반 | 두 게임 HTML의 `DIFF_MUL`, 몬스터 HP/ATK. 난이도 오프셋과 스테이지 오프셋은 [수치표](14밸런스+수치테이블.md) |
| 방어·피격 | 물리·속성 DR은 각각 `DEF/(DEF+2500)` 기반, 상한 75%; 한 번의 피해는 HP의 33% 선캡, 캡 발동 시 60f 무적 | `hurtP`; 보호된 Q/E 설계와 독립. 쉬운판은 지정 경로의 최종 피격 0.5배 추가 |
| 성장 보상 | 레벨마다 SP +3, 짝수 레벨 AP +1; Lv1000 이상 몹 XP 일반1/정예2/보스10, 하루 레벨업 1회 | `addExp`; 기존 저장 SP/AP를 레벨에서 다시 계산하지 않음 |
| 강화 지출 | `enhCostRaw=max(20000,ceil((20000+3500n)×1.5))`, 실제 악의=`_malCost(ceil(raw×등급배율))`; 등급배율 0.5/0.7/1/1.3/1.8, 유니크는 경제상 전설 | 0강 희귀15,000·100강 희귀277,500·1000강 희귀2,640,000 악의. 성공률 `max(0.5,99×0.99^n)%` |
| 드롭 횟수·가중치 | 일반 45%×`statDropBonus`/1롤, 정예1롤, 레어2롤, 스테이지보스3롤, 챕터보스5롤(첫 전설) | `rollDrop`; 6등급 가중치 표는 [아이템 SSOT](../7아이템디자인/exoduser-item-system-full.md). 필터·인벤 수용량·실제 픽업은 별도 |

## 스킬·아이템 적용 감사와 성장 구간

| ID / 계열 | 피해·자원·발동·중첩/상한 대조 | 판정·다음 행동 |
|---|---|---|
| COMBAT-01 방어·조건부 피해 | 적 HP≥70%의 `pAbund`, ≤30%의 `pPred`는 해당 적 HP 구간에서 적용. 물리·속성 DR 75%, 플레이어 한방 33%/60f 상한은 코드·수치표 일치 | 정적 계약 확인. 실제 빌드별 타수·생존은 미측정 |
| SKILL-01 자원 | `_malCost(v)`는 원가 50% 올림. 악의구 MP Lv1/5/10=10/24/41, 지옥강타 ST는 DPS 비례·최대 ST 90% 캡과 악의 원가20, 천공쇄기 MP80 고정·최대3충전/900f | [자원표](자원소비량표.md) 기준 정적 대조. 적중 시 실소비·재생 포함 효율은 미측정 |
| ITEM-01 어픽스 | `stCostRed` T0~T4 값 −5/−8/−14/−22/−30%, 벨트·팔찌 롤. `onHitFireball`은 무기 적중 확률 4/7/11/16/22% 데이터. `rollDrop`의 드롭 보너스는 LCK·패시브·어픽스·결정 합산 후 탐욕 저주 중 절반 | 데이터 정의 확인. 다중 장착 중첩·프록 재귀·실제 발동 횟수는 런타임 미검수이므로 확정 판정 보류 |
| ECON-01 분해 환수 | `salvageVal`과 장비 교체 `_enhRefund`는 현행 강화 지출식과 다른 과거 단위 누적식. 희귀2등급 +1에서 실제 강화 지출 15,000 대비 강화분 환수 1, +10에서 268,125 대비 15. [인벤토리 SSOT](../2_7%20인벤토리+장비시스템/2_7%20인벤토리+장비시스템.md)에 식 차이 기재 | 아이템팀·총괄과 환수 목표 조율 필요. 경제 영향이 커 확정 환수 수치 임의 변경 금지 |
| SKILL-02 폭산탄 | 원가5 차감(`_malCost(5)=3`)인데 `activateBlastShot` 게이트는 원가8(`_malCost(8)=4`), 자동 석궁 라우터는 3 악의만 확인하고 발사 성공 표시. 격리 실행 시 두 HTML 모두 악의3·ST10·쿨0에서 폭탄0개/자원 변화0 | 스킬팀 함수 소유 인계 필요. 개별 함수 미수정, 확정 비용 변경 제안 아님 |
| ECON-02 스킬 강화 악의 게이트 | 수동 `canUp`·일괄 `_matGate`가 `upMat||100`을 검사했으나 실제 차감은 `upMat||0`. 현행 `upMat=0` 스킬은 0 악의 차감임에도 50 악의가 필요했던 두 판본 공용 오류 | 게이트만 실제 차감식에 맞춤. 새 비용 제안이나 개별 스킬 데이터 변경 없음 |

| 진행 구간 | 빌드 다양성 확인 대상 | 현재 판정 |
|---|---|---|
| 시작 Lv1 | 기본 장비·기검참/악의구, 초기 ST/MP | 기준 장비 계산만 기존 [장부](BALANCE_WORKBOOK.md)에 있음 |
| 초반 Lv5·10 | 근접/마법/석궁과 자원 유지, 일반·정예 차이 | Lv10 기본 대조군의 밀리5·구체7·분노100 강타1은 기존 런타임 검증. 정상 획득 장비군은 미측정 |
| 성장 Lv20·30 | STR/INT/혼합, 드롭·스킬·강화 선택 | 가정한 T0 투자 계산만 기존 기록. 정상 루팅 빌드 미측정 |
| 이후 Lv50·100 및 500·501·1000 | 장비·어픽스·자동 석궁·전설/유니크·초월 비용 | 정상 성장 빌드 실전 표본 없음. 데모 Lv100 경계와 본편 분기 구분 필요 |

**신규 밸런스 제안:** 현재 확정 제안 없음. 수치 임의 변경 대신 위 미측정 구간의 같은 장면·시드·실제 장비 목록과 처치 시간/자원 순소비를 확보한다. 시장 규모·매출 추정은 이 대장의 범위가 아니다.

## 작업대장

| ID | 상태·반영 단계 | 근거·현재 결과 | 남은 검수 |
|---|---|---|---|
| PM-013-A | 소스·격리 데이터 검수 완료 / 실플레이·패키지 미검수 | Lv1462 확정식 2,148,690,000 대비 수정 전 두 파일 `~~` 결과 −2,146,277,296. `_calcMaxExp` 초월 분기 `Math.floor`로 수정. 저장 음수 `maxExp`만 재계산·음수 `exp` 0 보정, 정상 저장 유지. 격리 Node RED 4→GREEN 4; `dbRestore` 실제 대입부를 추출한 JSON 왕복 fixture 포함. 실제 사용자 저장·공유 악의 서버 미접촉 | 현행 공개 데모 Lv100이어서 해당 경계 실플레이 불가. 본편형 Lv1462 패키지 플레이·장시간 성장 미검수 |
| PM-013-B | 격리 재현 완료 / **SKILL 수정 완료(2026-10-01, SKILL팀)** | `tools/balance-blast-repro.mjs`가 두 HTML의 실제 비용·발동 함수를 추출해 실행. 원가5의 실비3을 보유하고 ST10·쿨0인 Lv1에서 폭탄0개, 악의/ST/쿨 그대로. 자동 석궁 라우터는 3을 만족해 성공으로 표시함 | **→ SKILL 처리(commit 0e26bfa01)**: `activateBlastShot` 게이트 `_malCost(8)`→`_malCost(5)` 정렬(차감·T라우터·확정원가5와 일치). 수정 후 repro 두 HTML 악의3→발동(악의0/ST9/폭탄1/쿨30), 부족(악의2) 미발동. 회귀 `test/skillBlastShotGate.test.js` 6/6 GREEN. 공용 `_malCost`·강화(PM-013-C)는 미접촉 보존. 라우터는 이미 원가5라 무변경. 인게임 T-발사 실플레이는 시작플로우·클로저스코프 제약으로 유보(추출 하니스=실제 라이브 함수 실행이 권위 근거) |
| PM-013-C | 공용 계산 적용 수정·격리 검수 완료 / 실플레이·패키지 미검수 | 두 HTML의 수동 `canUp`·일괄 `_matGate`를 실제 차감 `_malCost(sk.upMat||0)`과 일치. `upMat=0`에서 게이트50·차감0 오류를 실제 코드 평가로 RED 2건 재현하고 수정 후 무료·유료 경계 4건 GREEN. 경험치 테스트 포함 8/8 통과 | QA 실측 중이므로 별도 게임/빌드 미실행. 스킬 패널 실제 클릭과 자동 강화의 본편형 패키지 검수는 후속 |
| PM-013-D | 계산 차이 실측 / 설계 결정 대기 | `tools/balance-refund-audit.mjs`가 두 HTML의 실제 `enhCost`·`salvageVal`을 추출. 희귀2등급 +1/+10/+100 누적 지출 15,000/268,125/14,493,750, 기본 분해액 제외 강화분 환수 1/15/656으로 두 판본 일치 | 주석의 ‘강화 투자분 50%’와 실제 환수는 다름. 환수 목표·이전 장비 회계는 ITEM·총괄 결정 필요. 현재 소스·확정 수치 미변경 |

검수 상태는 마지막 작업 단계에 다시 기록한다. 실플레이·패키지·배포 판정은 독립 증거가 필요하다.

## PM-013 검수·인수 기록

| 단계 | 확인 결과 | 한계·인수 |
|---|---|---|
| 재현 | `test/balanceExpCurve.test.js`를 두 HTML의 실제 `_calcMaxExp`·저장 복원 대입부에 연결. 수정 전 4건 RED, Lv1462는 설계값 2,148,690,000 대신 −2,146,277,296 | 앱 화면 조작 결과가 아닌 격리 계산 재현 |
| 수정 후 | 동일 4건 GREEN. Lv1000·1461·1462·1500 경계, 구버전 음수 fixture와 정상 Lv10/Lv1462 JSON 직렬화·복원 대입 확인. `node --check` 통과 | `dbRestore` 전체 부트·실제 서버 저장/재실행은 실행하지 않음. 사용자 세이브·`saves/_sharedMats.json` 미접촉 |
| 주변 회귀 | `test/demoScope.test.js`·`test/demoSaveRoute.test.js`와 함께 실행한 15건 중 13건 통과, 2건 실패. 실패는 `index.html`의 `_demoActivateSlot` 테스트 스텁 누락과 옛 단일 데모 카드 문구 기대값이며 이번 XP 수정 함수와 다른 영역 | 두 회귀 실패를 PM-013 수정의 통과 근거로 사용하지 않음; 로비·세이브 담당에 인계 필요 |
| 문서 | `rg`로 docs 전체의 `_calcMaxExp/maxExp` 검색 후 수치표·세이브 SSOT·메타 개요·장부·본 대장 반영. Windows CMD의 `grep` 실행 파일은 없어 동일 범위를 `rg`로 검색 | 공용 문서의 타 팀 변경 보존 |
| 후속 공용 게이트 | `upMat`·`_malCost`를 docs 전체 검색하고 스킬 SSOT·메타·세이브 설명을 현재 코드와 동기화. `test/balanceSkillUpgradeCost.test.js`가 실제 `_malCost`, 수동·일괄 게이트 및 차감식을 두 HTML에서 읽어 평가. 수정 전 무료 강화 2건 RED(게이트50·차감0), 수정 후 4건 GREEN; 경험치 포함 8/8 GREEN | 실제 패널·패키지 검수와 스킬팀 폭산탄 수정은 별도. 타 팀 스테이징 파일 미접촉 |
| 다음 계산 불일치 재현 | `tools/balance-blast-repro.mjs`로 실제 `activateBlastShot`와 `_malCost`를 격리 실행. 두 HTML 모두 악의3·ST10에서 라우터 요구3 충족, 직접 게이트4로 발동 거부, 폭탄0/쿨0/자원 변화0 확인 | SKILL 개별 콘텐츠 함수 소유. 이 검수 스크립트는 저장·서버·게임 루프를 건드리지 않음. 실플레이는 QA 실측 이후 |
| 강화·분해 경제 정량 대조 | `tools/balance-refund-audit.mjs`로 희귀2등급 +1/+10/+100의 실제 누적 강화 지출과 강화분 환수를 두 HTML에서 동일하게 확인. +10은 지출 268,125·환수 15(기본 분해액 10,000 제외) | 코드 주석의 50% 목표를 현행 실효값으로 오인하지 않음. 대규모 경제 변경이므로 ITEM·총괄 설계 결정 전 수정 없음 |
| Git·반영 | 소스와 docs는 공유 작업 트리의 미커밋 상태. `game.html`에는 타 팀 스테이징·맵 변경이 있고 다수 팀이 동시에 편집 중이므로 해당 공유 파일을 경로째 스테이징·일괄 커밋하지 않음 | 총괄 통합 순서에서 우리 hunk와 관련 docs만 실제 diff·staging을 확인해 체크포인트 커밋. 패키지·업로드·배포는 이번 근거 없음 |

현재 팀 판단: PM-013의 **첫 확인 오류와 다음 공용 강화 게이트 오류 수정·격리 검수**는 끝났다. 본편 도달 가능 빌드의 레벨1462 실플레이, 정상 성장 장비의 구간별 빌드 다양성, 프록 중첩·재귀와 폭산탄 게이트, 경제 환수 목표는 후속 검수·담당 팀 조율 항목이다. QA 성능 측정에 게임/빌드 부하를 겹치지 않도록 이번에는 대형 시뮬레이션·별도 브라우저 플레이를 실행하지 않았다.


## Mac 비용·환수식 읽기 검토 인수 — 2026-10-01

기존BALANCE1fd751d8이강화비용식과docs를대조했다. 희귀0강15000/100강277500/1000강2640000실비일치. `enhCostRaw`주석의1000강533만은공식528만과다른문구오기이며주석수정후보로만기록(게임파일변경0). 기존PM-013-D의희귀+10지출268125/강화분환수15는설계대기항목으로유지하며새회귀나새실플레이로세지않는다. 환수식변경0, 기존8검사재실행0, 실제패널검수는별도. [근거/한계](../0마스터플랜/mac-resume-20261001/3팀-독립검토.md).


### 2026-10-01 Mac UI03 병행 후속 인수

기존 1fd751d8 세션에서 533→528만 및 환수 주석 old/new 후보, 무료/유료 경계 케이스·old문구 재확인를 제출했다. 실제 읽기·산출 완료이며 코드 적용/게임 실행/패키지/실측 완료가 아니다. 원문 후보 및 정정은 [팀 산출](../0마스터플랜/mac-resume-20261001/ui03-evidence/BALANCE-팀검토.md), 실제 수신/착수/다음 게이트는 [11팀 인수표](../0마스터플랜/mac-resume-20261001/11팀-UI03-병행후속.md)를 따른다.


### 2026-10-01 MAP020 병행 후보 실행 인수

실제경계10검사PASS. 양쪽HTML주석533→528만및레거시환수설명4곳적용,경제식불변. 총35검사재통과. PM013D환수설계대기유지. 기존CLI는읽기검토,지원에이전트와root가실제파일작성/실행했다. [실행근거·제약·다음게이트](../0마스터플랜/mac-resume-20261001/11팀-MAP020-실행검수.md). 이전UI03후보미실행상태는당시이력이다.


### 2026-10-01 R 입력·GL·11팀 신규 후속 인수

test/onHitFireballStack.test.js가 양쪽 실제 _eqAffix/hurtE를 추출하여36적중을 실행했다. 8PASS/2SKIP/0FAIL은 onHitFireball 조회0·투사체0인 MISSING_HOOK 상태를 확인한 결과다. 재귀는 NOT_REACHED라 SKIP이며 효과 완성이 아니다. 4/7/11/16/22% 데이터·실제 fireOnHit·경제식은 변경하지 않았다. 정상 무기 롤과 강제 복수 장착 fixture를 구분했다. [관측 원자료·진단 범위·한계](../0마스터플랜/mac-resume-20261001/R-입력과-GL-후속검수.md)


## 2026-10-01 PM-013 레거시 환수 정수 경계 통합

환수정책 결정과 별개로 현행 누적식의 signed32 오버플로만 수정했다. 본편/easy salvageVal·equipItem _enhRefund의 ~~를Math.floor로 교체했다. 6등급 최초경계직전/직후·일반값96표본 및 legacy기록48표본 통과. root는 전체equipItem의 이전비용차감/부족거부/장착/저장스냅샷과 JSON후dropItem 분해 지급을 실행해 검수했다. rarity4 enh145627의 강화분2147506212 및 rarity4 enh200000 최종4050427500. 실제지출50%환수 전환·강화상한·기존음수저장추정복구0, PM013D정책대기는 유지한다. 실제UI/사용자저장/패키지는 별도다.


## 2026-10-01 PM-009 롤 단위 모듈 인수

기존 BALANCE가 D절22종/698정수에 대해 균등 정수 선택·명시 하중상·저장/표시 모듈을 구현했고 root가 실제 감사 소비로 연결했다. D10 10–13/14–16/17–20 유지, percent raw/100·나머지 정수, frame은60fps 변환 표시. 잘못된 입력/저장값 거부,69전용 및101통합 검사 PASS. 수치 정책·효과/드롭 활성 변경 없음. [인수·검수](../0마스터플랜/mac-resume-20261001/vscode-dispatch/PM009-roll-review-root.md).


### 2026-10-01 D10 독립 후보 검수

| 범위 | 현재 상태 | 실제 근거 |
|---|---|---|
| UI-10/U-D10 | 신규제안·미채택·게임비활성 | 흉갑/지옥강타 성공 실제소모>=100,저장롤10~20%,잔여 min(30,소모×롤) 후보 |
| 전투 후보 | ITEM75검사·독립148입력 포함8그룹 PASS | 원피해/악의/합체쿨/RNG 유지,중복·실패·재진입 방어 |
| 검토 UI | 한영10/15/20% 소비,22카드44원화 유지 | Chrome 실화면/160px/44로드/가로overflow0, IAB Enter·Space |
| 롤 모듈 | roll-values.js 현행 | .mjs에서 동일바이트이동, HTTP JavaScript MIME, 서버변경0 |
| 남은 게이트 | 새instance 저장binding·실전·패키지 | 활성0/runtimeReady=false/110차단,실제U-N01 미구현 |

관련188검사와 최종화면수정후12검사 통과. 독립후보 완료와 게임효과 적용은 구분한다. [상세·실패 포함 근거](../0마스터플랜/mac-resume-20261001/vscode-dispatch/D10-root-review.md).


### 2026-10-01 D10 저장 binding 후보 인수

| 대상 | 계약 |
|---|---|
| identity | `uniqueId:'UI-10'`, `slot:'armor'` |
| 저장 필드 | `uniqueRoll:{version:1,effectId:'U-D10',stat:'_uSlamEmberRage',unit:'fraction',storedValue:0.15}` |
| 값 | 10~20 정수%의 정규 소수 .10~.20만 허용. raw는 중복 저장하지 않고 기존 fromStoredValue로 읽는다 |
| 생성 | 명시 신규 생성 호출에만 주입 RNG 정확1회. plain JSON 데이터 snapshot이며 입력/중첩 객체 보존 |
| 읽기 | 필수 identity/slot/binding/schema/value는 own enumerable data 필드. 접근자·직렬화 훅·잘못된 prototype/schema/version/unit/value를 유효 binding으로 인정하지 않음 |
| 복원 | restoreD10Instance는 전달된 로드 객체를 그대로 반환. 신규 생성·수리·재롤·legacy 자동변환 없음 |
| 소비 | readStoredRoll→기존 createD10Consumer; 기본 enabled=false. UIUX는 실제 readD10Binding→기존 tooltip, 항상 active=false |
| 잘못된 값 | legacy/missing/invalid는 툴팁 없음과 상태 설명. 누락 값을 15%로 채우지 않음 |
| 한계 | 임의 Proxy를 실행 격리하는 보안 경계가 아님. 생성 API는 호출자가 새 아이템임을 보장해야 하며 저장된 missing UI10을 보충하는 API가 아님 |

`createNewIdentifiedD10Instance`는 명시 새 생성 fixture/호출자용 포트다. plain JSON 내용만으로 객체의 생성 이력을 증명할 수는 없다. 실제 생산 연결 때에는 fresh mkItem 생성 경로에서만 호출해야 한다. 현재 read/restore/tooltip이 이 생성 API를 호출하지 않는 회귀를 확인했다. 이 제약을 이유로 사용자가 일상 필드명을 선택하도록 반복 질문하지 않는다.


Node 후보 연결과 root 보강 회귀61PASS. 게임 생성/드롭/저장라우터·실제UI·패키지 연결은 미완료이며 활성0을 유지한다. 기존 소켓누락 마이그레이션 RNG·affixes 보충은 그대로다. [실제 검수·반례·제한](../0마스터플랜/mac-resume-20261001/vscode-dispatch/BINDING-root-review.md).

### 2026-10-02 강화 계약 root 인수

실제 본편/easy 수동/AI 강화와 저장 객체식 validator2880입력+56경계를 root가 재실행해 통과했다. 비용·올림·할인·게이트/차감 mismatch 미발견, 수치변경0. AI _doAiEnhance 직접 저장 예약0은 확인했지만 전체영속화 손실과 구분하여 실제 debounce/dbSave/dbRestore·닫기/자동저장 source fixture 후속을 기존 BALANCE에 배정했다. 보호 패링 정규식 기존1FAIL은 이전 증거로 분리했고 보호코드/검사 수정0. [인수·한계](../0마스터플랜/mac-resume-20261001/vscode-dispatch/FOUR-SUBMISSIONS-HELLRAY-20261002.md).


### 2026-10-02 실제 디스크 저장·재기동 검수 차단

생산 pending-save drain의 기존 소스 22검사 PASS 이후 실제 격리 API 검수를 준비했다. 빈 포트 선확인에서 EPERM으로 중단되어 서버 child 0·API 0·통합 검사 0·합성 저장 파일 0이다. Root는 최종 하니스 문법만 확인했고 재실행·바인딩 변경·권한 우회를 하지 않았다. 실제 ACK→디스크→종료→재기동→load는 미검수다. 근거: `tools/team-followup-20261001/BALANCE/disk-save-restart-result.md`, `docs/15 세이브+데이터구조/BALANCE_DISK_SAVE_RESTART_20261002.md`.


### 2026-10-02 서버 합본 생산 반영 인수

BUILD suffix 처리와 BALANCE 임시파일 교체 후보를 root가 server.cjs에 순차 적용했다. 원소스339fad6a→합본6a7c1083, 실제 생산 Range23+저장13+전체handler4=40그룹 PASS. 기존 실패 RED/원본과 담당20파일 SHA 보존. 저장 스키마/반환 JSON/GET 캐시·gzip 계약 유지. 실제 디스크·크래시·fsync·HTTP·영상 원인·앱 재실행은 미검수, 기존 EPERM 우회0. 상세: [서버 통합 인수](../0마스터플랜/mac-resume-20261001/vscode-dispatch/SERVER-INTEGRATION-20261002.md). 앞선 미적용 후보 기록은 제출 당시 이력이다.


### 2026-10-02 조건부 Range 및 실제 합성 파일 I/O 인수
root가 정확단일INM304 우선·If-Range 전체응답 후보를 server.cjs에 반영했다. 현재 조건부31+이전소스40+전용 합성 실제파일7=78그룹 PASS, 완료 owner24파일 보존. INM weak/list/wildcard·IMS·ETag 강도·HEAD wire·실HTTP·미디어·앱 재실행은 미검수다. 파일 검수의 write/rename EIO는 주입, ENOENT/EEXIST는 실제OS이며 크래시/fsync/Windows 검수와 다르다. 기존 EPERM을 우회하지 않았다. [인수](../0마스터플랜/mac-resume-20261001/vscode-dispatch/CONDITIONAL-ATOMIC-INTEGRATION-20261002.md).

### 2026-10-02 공유 악의 실제 파일 후보 인수

shared-mats-atomic 미적용 후보의 담당 실제 파일14 검사를 root가 출력 경로를 분리한 하니스로 현행 server.cjs/node-main.js에서 재실행하여 14 PASS를 확인했다. 양쪽 GET/POST/helper 추출, 신규/교체/반복·clamp/schema, 부분 write·rename EIO 주입 후 기존 bytes 보존, 실제 ENOENT 및 원문 손상 RED를 구분한다. 기존 memory16과 별개이며 생산 반영0이다. fsync·전원손실·동시 writer·Windows·HTTP·앱은 미검수. 근거: outputs/team-review-20261002/four-candidate-acceptance/balance-root-file14.json. 담당 증거는 덮어쓰지 않았다.


### 2026-10-02 NW.js 공유 악의 실패 응답 생산 보강

| 대상·경로 | 현재 실패 응답 | 상태·검증 |
|---|---|---|
| node-main.js / POST /api/mats | readBody·JSON·clamp·직접 write 실패는 HTTP500 JSON `{ok:false,error:"Internal Server Error"}`를 headers/end 각1회로 마감. 성공은 기존 `{ok:true,mats}`이며 catch 밖에서 응답 | 생산 반영; 기존 test/nodeMainMats.test.js 4PASS(정상·malformed JSON·stream rejection·실제 ENOENT) |
| server.cjs / POST /api/mats | 기존 외부 catch의 HTTP500 text/plain 유지 | 파일 변경0. NW.js JSON과 wire 형식 차이를 보존 |

직접 write·clamp·정상 저장 계약과 세이브 슬롯 형식은 유지한다. 원자쓰기 후보·close/unlink cleanup 정책 미채택. 실제 HTTP/NW.js·성공 디스크 저장·재시작·Windows·fsync/crash/concurrency는 미검수이며 실물 앱 재빌드0이다. [저장 현행 계약](../15%20세이브+데이터구조/15%20세이브+데이터구조.md).


## 2026-10-03 source7 레벨업·예약 투자 자원 갱신

| 소유 결과 | 반영 단계 | 남은 검수 |
|---|---|---|
| BALANCE1756+1812+1818 | 원총괄이 양판 `addExp`와 본편 `_processPassiveQueue` 최소3곳을 source7에 생산 반영. 전체역변환source6일치/함수후보SHA일치/12script+2JSONparse | 생산 회귀는 `test/levelUpResourceRefreshAcceptance.test.cjs`; 실제UI예약·저장·source7native미검수 |
| 성장 계약 | 최종최대치 갱신·현재자원보존·기존20%회복호출당1회. 공식/SP/AP/레벨상한/globalapplyStats불변 | [현행 재계산·자원 보존 계약](LEVEL_UP_RESOURCE_REFRESH_20261003.md) |

이전 단순 레벨 재계산 후보는 강인/마력그릇 중간clamp로 현재자원 손실이 있어 채택하지 않았다. 이전 source6 실플레이는 source7의 실행 결과로 계산하지 않는다.


## 2026-10-03 source56 선택분해 확인 전후 객체 재검사

| 항목 | 현행 계약 |
|---|---|
| 적용 위치 | 양판 renderInv의 invSalvageBtn 연결 onclick만 변경. 바깥 미리보기 _isCnt/_isTot 및 salvageVal 공식 불변 |
| 클릭 시 대상 | _invSalSel 인덱스를 현재 INV.bag 객체로 변환, Set으로 같은 객체 참조를 중복 제거하여 _pendingSelected에 보관. 이후 선택 인덱스 변경은 새 대상을 추가하지 않음 |
| _canSelected | truthy 객체, fav가 false인 값, 현재 INV.bag.includes(it), INV.equipped의 값에 같은 객체 없음, salvageVal(it)가 Number.isFinite이고 0 이상. junk 여부는 조건이 아님 |
| 확인 전 | 유효 대상이 없으면 확인창 없음. _pendingTotal은 대상 salvageVal 합계이며 유한·0 이상일 때만 확인. 기존 한/영 문구 p0는 유효 객체 수, p2는 이 합계 |
| 확인 후 | 승인 시 원래 _pendingSelected를 같은 조건으로 다시 걸러 _currentSelected 생성. 유효 대상 또는 유한·0 이상 _currentTotal이 없으면 분해·보상·선택 초기화·분해 SFX/저장/최종 렌더 없음 |
| 소비·보상 | INV.bag.filter로 현재 유효한 원래 객체만 제거, G.mats += _currentTotal. 남은 객체 순서·참조·필드는 보존하나 가방 배열 자체는 새 배열. 같은 참조가 여러 칸에 있으면 해당 별칭 모두 제거하고 보상은 한 번 |
| 성공 후 | _invSalSel.clear() → INV.selected=null → SFX.pickup() → dbSaveNow() → renderInv() 기존 순서. 0원 유효 분해도 소비·성공 후 효과 수행. 취소는 소비 없음; 중복 클릭은 기존 gameConfirm 재진입 거절 계약 유지 |
| 실제 소스 재현 | 등록 keydown → KeyF → actual gameConfirm → 연결된 선택분해 콜백을 대역 이벤트로 실행. 확인 대기 중 A.fav=true가 된 뒤 원본은 A를 삭제·1000 지급, 수정본은 A/B·악의500 보존. KeyF 자체의 junk/fav 변경·렌더 효과와 분해 성공 효과는 별도 |
| 합성 경계 | 배열 삽입/삭제/교체, 장착 상태, 선택 인덱스, 환수값 변경은 합성 상태로 검사. 실제 native에서 이 변경들이 modal 중 발생하는지 전체 호출자 도달은 미검수 |
| 검사 | test/selectedSalvageConfirmConsumption.test.cjs 양판24조건씩48 PASS; 명시 source55 원본16 PASS·32 FAIL. 정상·취소·KeyX·중복클릭·0원 등16대조는 원본 동등. 32 FAIL은 조건별 음성 대조 수이며 별개 결함32개로 계산하지 않음 |
| 한계 | DOM/event transport·문자열·레이아웃·저장·음향은 대역. full renderInv/실키/native/localStorage/시각/청취 인수0. getter/throw 원자성, 기존 G.mats 합산 overflow, 비정상 강화 루프 종료 보장0 |
| 보존 | salvageVal·enhCost·_enhRefund·등급/환수식 불변, PM-013-D 설계 결정 대기 유지. 신규 저장 필드0. 보호2_3/Q전용패링/E금지/어택티켓금지/사용자23·타인WIP 변경0. 실행 앱source29/3404에는30~56 미반영 |

경제 목표나 환수율을 재설계한 변경이 아니다. 선택분해 합계만 확인 전후 재계산하며 PM-013-D 기존 검산 수치와 결정 대기 상태를 유지한다.
