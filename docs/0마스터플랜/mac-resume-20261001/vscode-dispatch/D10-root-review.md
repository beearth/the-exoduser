# D10 후보 인수와 정상 전투 회귀 — 2026-10-01

## 인수 결과

| 대상 | 실제 결과 | 남은 게이트 |
|---|---|---|
| ITEM D10 | 본편/easy 실제 activateGiantSlam 전체함수 VM 후보75검사, 소모 후 min(30,실제소모×저장롤) | 새instance 저장롤 binding·실게임 명중·세이브·패키지 |
| BALANCE 독립 | 실제 ITEM 모듈/제출함수 실행,148입력+두 연속시전 및 중복·재진입 등8그룹, 불일치0 | fixture U-N01 래치는 실제 미구현 U-N01 통합 검수가 아님 |
| UIUX | 정의/롤 모듈을 실제 소비한 한영 툴팁.10/15/20%, >=100소모/성공/최대30 표시 | 게임 툴팁이나 효과 활성화 아님 |
| root 통합 | 관련188검사 PASS. CSS 보강 후 관련12검사 PASS | 전체게임·최종제품 품질 완료 아님 |
| 정의 감사 |22정의·44원화·698정수 왕복, structurallyValid=true, 활성0/runtimeReady=false | 미채택·미구현110차단 유지 |

D10은 UI-10 흉갑만, giantSlam/giantSlam2만 대상으로 한다. enabled 기본false, 저장필드 추정없이 주입된 readStoredRoll만 허용한다. 성공적으로 실제 분노100 이상을 소모한 뒤 한 번만 환급한다. 원피해/악의/합체쿨/RNG/VFX 호출순서는 원함수와 비교했다. 소모99/99.5는 환급0,100.5의 소수 보존,상한검사1000은 정상플레이 수치 주장이 아니다. 토큰 위조·중복consume/finish·동기재진입·장착교체·실패는 추가환급하지 않는다. 원필드/드롭/게임라우터는 변경0.

## 브라우저 실제 확인

roll-values.mjs를 동일내용 roll-values.js로 이동했다. SHA256 `103d0460c738c117840586780eaaed7be7ebe0aba61fa50464db9d004b094975`. 실행중3340의 기존JS MIME을 사용, 서버파일/재시작0. 감사·테스트·BALANCE 증거 스크립트 import도 수정했다. definitions/roll/tooltip/review 실제HTTP200,디스크동일SHA 확인.

기존 공유회귀의 import1개 가정을 definitions+tooltip 두개로 수정했다. 원 실패로그와 후보diff는 보존. 최초화면은 좁은 D10카드로 행이 지나치게 늘어나 root가 D10만 전체너비로 배치하고 원화/문구를 나란히 두었다. 다른21종 내용·원화·정의는 유지.760px 이하에서 세로배치 규칙을 제공하지만 모바일 실화면은 미검수.

IAB1280×720 DPR2: 10 클릭→15 Enter→20 Space 실제문구/ARIA 확인,44이미지 로드·가로overflow0. IAB 캡처는960px 폭으로 잘리는 도구제약이 있어 전체시각증거로 쓰지 않았다. Chrome1352×666 DPR2:160px 원화·44로드·가로overflow0, 전체 D10카드/한영문구가 보이는 screenshot을 저장했다. `outputs/team-review-20261001/d10/review-chrome.png`가 최종 시각증거다. 22종 아트 채택 판정은 하지 않았다.

## QA-FIRE-NORMAL-REGRESSION: INCONCLUSIVE

관측기 새작성0. 기존 pass-through draw+rAF 관측기만 사용, 실제지원입력으로 플레이했다. 게임상태/처치/tick/적수/공격/품질 강제변경0. 프로파일러·WebGL wrapper0, 관측부하 미독립측정. CPU draw시간과 rAF간격은 별개이며 GPU/GL시간은 미측정이다. 종료 후 draw/listener 원복 및 게임탭 닫기 확인. 이번 표본은 전부 성능인수에서 제외하므로 유효한 첫처치·밀집 p95/p99는 산출하지 않는다. 원자료의 수치는 진단용일 뿐 PC329ms 또는 개선율 주장에 사용하지 않는다.

| 표본 | 관측 결과 | 제외 이유 |
|---|---|---|
| IAB preflight |1805행,82입력,적0 | 튜토리얼 구간,처치0 |
| IAB normal |494행,2입력,최대적44 | 공격배치가 자연사 뒤 도착,처치0 |
| Chrome first |53행,122입력,최대적5 | root가 약1.7초 만에 수동종료,첫처치 미포착 |
| Chrome followup |2행,4입력,시작HP0/누적처치2 | 관측기 재설치 전 자연처치/사망하여 처치순간 누락 |
| Chrome restart |923행,546입력,최대적53,누적처치2 고정 | 새처치 없음,atmos2→1 자동변화 기록. 위치가고정되어 정상 조작 충분성도 미충족 |

처음부터 끝까지 유지한 자연 전투 입력과 첫처치 포착을 다음회귀에서 먼저 확보해야 한다. 현재 실패는 성능회귀가 없다는 근거도, 새로운병목이 있다는 근거도 아니다. raw CDP Input은 지원하지 않는다는 도구응답으로 종료했으며 지원wrapper pressKey/click은 실제trusted입력이 됐다. 짧은keydown/up으로 홀드조작을 대체할 수 있다고 주장하지 않는다. native는 이번주기 Mac locked가 명시돼 잠금해제·권한변경을 하지 않았다.

소스 game SHA `8ebc3b7b52a651c1a3bc5e8c285b00d186c6dacc18429ada7499781acc72b0b9`, HTTP동일.3340 PID40609,격리서버저장 tmp/mac-migration-runtime/saves. 새 .localhost origin의 normal web localStorage 사용,사용자원점초기화0. IAB Chrome154 1280×720/Chrome152 1352×666,DPR2,high/100%/SSAA1/FPS cap0. Chrome parts100/diff5/atmos1(재시작초기2),추가옵션은 rawJSON참조. 새페이지지만 브라우저캐시/GPU cold 여부 UNKNOWN. 기존PC/IAB/이전소스와 A/B비교불가. `qa-verdict.json`에 각 환경/표본수/진단RAF·CPU draw/원복 기록.

## 팀 조율과 제한

D10 세팀은 기존세션으로 실제Read/Edit/제출 완료. BUILD 부총괄은14:13:14Z 실제Read 후 완료물/후속plan을 작성했으나 자신의CLI queue가state DB readonly(exit1)로 실패했다. 권한/DB/환경변경·우회0. 조율권한과 실행환경제약을 구분해 BUILD=검수·배정안 준비,root=기존 승인된 정상전송·최종인수로 정정했다.

root는 세팀 최신완료턴을 다시확인하고 본래공식CLI에서14:16:08Z binding독립3건을각1회전송(exit0). 직접권한설정/DB쓰기·BUILD환경완화0. queue조회API미제공으로 큐전체상태UNKNOWN이며 중복송신0. 실제후속Read/Edit는 TEAM_UTILIZATION의최신스냅샷과 binding전용영수증으로 분리한다. 아직D10생산적용을 의미하지 않는다.

기존Claude7팀은 이번주기idle 확인. ENEMY/ART/SKILL 수정지시는 native잠금으로미수신, MAP실화면/ANIM90Hz/SOUND실청취/BUILD패키지게이트대기.11팀동시실행완료로표시하지 않는다. 게임/easy/index/server diff0,원래Mac3333/PC/세이브/타팀WIP/초안보존. 이번체크포인트는 D10후보·검토UI·증거·관련docs만 포함하며 새binding작업은별도소유로제외한다.

14:18Z root가 세팀 최신턴을 읽어 새14:16:08Z턴의 실제 source Read exit0 및 ITEM 영수증/UIUX 어댑터·검사/BALANCE 영수증 fileChange 완료를 확인했다. 앱 interrupted 표시만으로 CLI중단을 단정하지 않으며 동시running수는UNKNOWN,새착수3팀근거는존재. 이 산출은 이번D10체크포인트에서제외한다.
