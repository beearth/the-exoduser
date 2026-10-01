# UIUX-DEMO-SCOPE-REGRESSION-REPAIR 결과

## 수신·실제 착수·판정

DEMO_SCOPE_TASK를 읽고 같은 과제 진행/산출이 없는 것을 확인했다. 수신 기록 UTC2026-10-01T12:59:49Z, 실제 원test/카드 함수/번역/문서 읽기 종료 기록12:59:55Z. 현재UIUX대장·데모노트·lobbyCardLanguage 및demoSaveRoute의 실제 fixture를 확인한 뒤전용demo-scope 후보만작성했다. 정확한메시지도착/명령시작초는UNKNOWN.

**제품 결함이 아니라 낡은 회귀 가정으로 판정했다.** 원demoScope는`DEMO CHARACTER`보다 뒤에 신규Lv문구가 있어야 한다는전역순서regex다. 현재 `_lobbyDemoCardLabel`은 앞쪽에서 실제이름함수와 신규/저장progress를 분기하고, 뒤쪽 `DEMO CHARACTER`는구저장명호환분기에 남아있다. 페이지 전역문자열순서는 카드 출력 계약이 아니다.

원본을본인복사에서 재실행한결과도 **10PASS1FAIL**이고실패는동일한scope두번째검사다. 과거 `_demoActivateSlot` 스텁오류는재현되지않았으며수정하지않았다.

## 원식·번역·보호 범위

| 계약 | 실제소스 근거 및후보검증 |
|---|---|
| 신규 | `_lobbyDemoCardLabel(card,null)` → `Lv.1 START · Stage 1-1 · Lv.100 Cap` |
| 저장 | progress.lv 및kills.toLocaleString(),Stage1-1,처치/브라우저저장번역.신규START/Cap 안내로대체되지않음 |
| 이름 | `_lobbyDemoCharacterName`:KO대검전사/EN Greatsword Warrior.실제 반환값과.char-name을함께검증 |
| 번역 | 원 `_lobbyLang`/`_TL` 함수와실제 `_LOBBY_EN` AST본문을실행.언어공급자getCurrentLanguage만KO/EN으로통제.실제EN은`Kills`/`Saved in this browser`이며고정stub번역으로대체하지않음 |
| DOM | 실제 `_lobbyCardLeaf` 실행,children없는특정리프mock만작성.실제브라우저/DOM게임실행은아님 |
| 게임/노트 | 기존Lv100 cap·lastStage0=1-1·addExp/nextStage 보호regex 및데모노트2개표검사·활성1-4계약금지검사를모두원문그대로보존 |
| 저장/캐릭터 | null/저장Lv46·처치1795/저장Lv100·처치0 ×KO/EN=6실행.진행객체freeze/불변검사.캐릭터개수·UI·생성·저장정책변경0 |

후보는test의import2줄 추가와낡은전역regex1개를함수실행검사로대체한것이다.기존3개test의개수/기존데모범위assert는유지한다.의존acorn은기존lobbyCardLanguage와동일한로컬의존성을사용했고추가설치없음.

## 현재 직접읽은입력

| 파일 | SHA-256 |
|---|---|
| index.html | `38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8` |
| test/demoScope.test.js | `2b36beee981411c3a8db3630f304ce03f80e77085de94034cfbe8e94c9ef3ef9` |
| test/demoSaveRoute.test.js | `fdbb132876dfd1e81fc4f2a00b811a32026f6682d262a86f973a518ed60ad955` |
| test/lobbyCardLanguage.test.js | `40af5af687e74a0e4a033cce8b52c603b68b3712d5002311019b4e328259ea2b` |

실제로 추출한 5개 함수의 본문·행 번호·SHA와 보호 대상 7개 파일의 SHA는 `demo-scope-validation.json`에 기록했다. 과거 값을 현재 소스로 간주하지 않고 생성 실행마다 현재 파일을 다시 읽어 검증한다.

최종 재검증: 2026-10-01T13:03:53Z. 빌더 구문 검사·전체 검증 성공, 보호 대상 7개 파일 해시 불변. 수신·첫 실제 Read·완료 기록은 전용 영수증에서 구분한다.

## 검수와실패이력

| 실행 | 실제결과 |
|---|---|
| `node --check …/demo-scope-build.mjs` 및후보Acornparse | exit0 |
| 원복사+현재demoSaveRoute | 10PASS1FAIL/exit1.현재낡은순서검사만실패하는음성기준선 |
| 수정복사+현재demoSaveRoute | 11PASS0FAIL/exit0 |
| 현재lobbyCardLanguage | 12PASS0FAIL/exit0.공용test편집0 |
| 신규Lv2 변이 | 2PASS1FAIL/exit1.수정후회귀가실제신규시작레벨결함을검출 |
| 저장Lv1고정 변이 | 2PASS1FAIL/exit1.실제저장progress누락을검출 |
| 실제EN처치번역 변이 | 2PASS1FAIL/exit1.고정형문자열패턴만으로PASS하지않고실제함수/번역변경을검출 |
| 표준contextdiff | 기대후보와메모리재구성전체텍스트동일.공유test에apply하지않음 |
| 보호해시 | index/game/easy·공유test3개·데모노트합계7파일읽기전후동일 |

처음임시복사의URL깊이를4단계로잘못옮겨8PASS/3FAIL(파일경로오류)이발생했다.소유폴더는3단계이므로경로만수정하여다시실행했고정상기준선10PASS1FAIL을확인했다.이는생산회귀나과거스텁실패의재현이아니다.배포용미적용diff에는임시경로변경을포함하지않는다.

## 산출·docs인계

- `tools/team-followup-20261001/UIUX/demo-scope.with-context.diff`:공유test/demoScope.test.js에대한표준미적용후보.
- `demo-scope-original.test.mjs`/`demo-scope-candidate.test.mjs`:본인범위검증복사.기존파일을수정하지않음.
- `demo-scope-validation.json` 및before/after/language/변이별log:명령·exit·현재원식·해시·음성검출근거.
- `demo-scope-doc-matches.txt`:docs전체관련함수/Lv1/브라우저저장/demoScope검색결과.

총괄동기화제안:UIUX대장에이번낡은검사교체후보와11+12회귀/실화면미실시를추가한다.데모노트의현행scope표Lv1→Lv100·1-1은유지한다.신규/저장카드의progress분기와KO/EN실제문구를검수기록으로보충하되과거단일슬롯·스텁실패이력을현재재현으로다시쓰지않는다.문서·제품·저장정책의범위밖정정은실행하지않았다.

**회귀수정후보PASS/생산·공유test미적용.** Git/게임/브라우저/서버/새세션/빌드는실행하지않았고실화면·패키지·FPS는UNKNOWN.다음은root의test후보통합과자기범위원격체크포인트다.
