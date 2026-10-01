# 장비 강화 가능→차감→저장 객체 계약 검수

## 작업 기록
- 수신·첫 실제 Read 2026-10-01T15:26:19Z. AGENTS, 전용 task, BALANCE_ECONOMY_TEAM_MASTER, 인벤토리/수치표/악의 자원표/저장 SSOT, 기존 비용·환수/장비 저장 회귀, 실제 본편/easy 강화·저장 호출부 및 ITEM binding API를 읽었다. 동일 prefix 산출은 task만 존재: 중복 구현 없음.
- 첫 코드 Edit 15:27:43Z, 최종 검수 15:28:17.106Z. UTC 기준. 소유 prefix 밖 수정0.
- 결과·receipt 완료 15:28:58Z.
- 초기 fixture 오류2건: 같은 VM의 const 재선언 → 실행 블록 격리; easy에 headband2가 있다고 잘못 가정 → 실제 선언 슬롯 목록 기준으로 교정. 원게임 오류로 보고하지 않는다.

## 결과
`node tools/team-followup-20261001/BALANCE/enhancement-resource-validator.mjs`: **2,880 입력 + 56 경계 기록 PASS**, assertion 실패0. 각 입력에서 여러 assert를 수행하며 이 수치를 Node test 그룹 수로 부르지 않는다.

| 실제 계약 | 검수 범위/판정 |
|---|---|
| 등급/비용 | rarity0~5, 배율 .5/.7/1/1.3/1.8, unique5는 전설4 경제. raw ceil→등급 ceil→50% ceil 순서 일치 |
| 강화 단계 | 0/1/99/100/1000/200000. 상한 없음, isMax=false. 200000→200001 가능; 새 상한0 |
| 자원/RNG | 0·요구액−1·정확액·+1 × 성공0/실패. 부족은 RNG/차감/아이템 변경/저장 모두0. 충분하면 성공·실패 모두 동일 비용 차감 |
| 수동 실제 콜백 | UI slots.forEach 실행 후 생성된 onclick 직접 실행. 최신 it.enh 재계산; 렌더 뒤 +1 변경 시 옛 가격으로 실행하지 않음 |
| 실제 저장 | dbSaveNow 실제500ms debounce 함수 실행, 메모리 타이머 전달. 실제5개 dbSave의 saveData/sd 객체식 각각 실행·JSON 스냅샷. enh/자원/legacy _enhRefund/uniqueRoll 보존·스냅샷 후 원객체 변경 비공유 |
| 공유/데모 차이 | 기본/로컬/standalone 객체 game.mats=0, 공유 악의 fixture는 차감 후 값. demo500/demo 객체는 game.mats=차감후 값이며 해당 저장본문에 공유호출 없음. 이것을 공유 저장 실패라고 단정하지 않음 |
| 불가 대상 | 빈장착/목록외 unknown은 버튼0. 본편17슬롯, easy16슬롯으로 headband2 버튼없음. 실제 선언만 사용했으며 콘텐츠 차이 임의수정0 |
| AI 실제 소비/콜백 | aiEnhance 및 _doAiEnhance 직접 실행. 단일 목표·예산 요구액±1, 성공/실패, null/목표달성/예산0 경계. 실제 비용 차감 일치 |

요청한 비용등급·올림·할인·게이트/차감 불일치는 이 범위에서 발견되지 않았다. **비용 patch 없음**, 실제 호출부 계약 validator 제출. signed32 환수/PM013C 무료스킬강화 재작업0, 환수정책/드롭/보호설계 변경0. 기대 계산은 독립 assert에만 사용하며 실제 후보처럼 반환하지 않는다.

## 저장 한계·별도 관측
AI _doAiEnhance는 직접 dbSaveNow/dbSaveForce 호출이 없다. 실제 콜백 실행에서 차감/아이템 변경 뒤 타이머0·저장호출0이며, 명시적으로 이후 저장 객체를 실행하면 상태는 일치한다. 따라서 **AI 즉시 저장 완료를 주장하지 않는다**. autosave/창닫기 경로까지 영속화 보장이 되는지는 root의 후속 인수 판단 사항이다. 이번 비용 계약 수정 없이 저장 스케줄 정책을 임의 추가하지 않았다.

검증은 메모리 DOM/타이머와 실제 저장 객체식 투영이다. 전체 dbSave의 sanitize/DB·fetch/localStorage 전송/재시도/디바운스 경쟁·전체 dbRestore를 실행한 검증이 아니다. 공유 악의 sink도 메모리 fixture이며 사용자세이브/서버 접근0. ITEM browser-bootstrap·D10 API는 읽기만 했으며 생성/저장 adapter 재구현0. 실제 HTML 전체게임 실행/브라우저 인수0.

인접 기존검사 `node --test test/itemSaveEconomyBoundary.test.js test/balanceSkillUpgradeCost.test.js test/maliceEconomyRegression.test.js`는 **11 PASS / 1 FAIL**. 실패는 기존 `parry grants 2000 base malice and applies the optional resource multiplier`의 보호패링 정규식 기대 불일치이며 이번 장비 코드 변경과 무관하다. 원로그 enhancement-resource-adjacent-tests.txt에 보존, 수정0.

## 해시·docs 인계
| 대상 | SHA-256 |
|---|---|
| game.html | 21235538c9766a28b04dcf529aed9883a8aa11bdbfef8e9e2ce35d5cc927c5cf |
| game-easy-test.html | 4c408f1e7b57210900ddfa8a0646502f91b6a0bbc798a24338eb159cb613d874 |
| enhancement-resource-validator.mjs | 83f97c542a0d91fd9e6835807f4a6b828d9e5e5819a29db55175dd1bdceb42a2 |

본편/easy 입력 검사전후 해시 불변. 전체 docs 관련검색 enhancement-resource-doc-search.txt, 입력별 실제결과 enhancement-resource-evidence.json, 검사요약 enhancement-resource-tests.txt.
docs 변경 제안: 강화 SSOT에 수동 실패도 비용 소비·최신 가격 재검사·무상한 계약과 저장500ms 호출 기록 추가; 저장 SSOT에 demo/demo500의 mats 보유 방식과 일반 공유풀 mats0 구분 및 AI 즉시저장 호출 부재를 명시. easy headband2 슬롯 차이는 ITEM/root 소유 후속 판단. 공유 docs 직접수정0.
완료 후 root 인계만 수행. 사용자 Chrome 유지; 게임/브라우저/서버/설치/대형빌드/생산/Git/queue/새세션/새에이전트0.
