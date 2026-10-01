# 정상 최초 로드 경계·live 자료 독립 인수

## 수신·실제 작업·판정
- 수신/첫Read 2026-10-01T15:09:31Z(한국시간10월2일00:09:31). 사용자 AGENTS·하위AGENTS 검색(추가없음), 총괄18.41, 전용task, BALANCE physical-prewarm-load 결과/후보, 실제game/공유test, fixture-final 및 live세JSON을 읽었다. 기존15/17 결과는 보존했고 동일소유 완료없음.
- 첫Edit: 2026-10-01T15:10:27Z, 소유check/receipt 생성(파일mtime근거). 검수 15:10:27.882Z~15:10:27.965Z, 결과정리·최종SHA대조 완료15:11:30.752Z.
- 명령 `node tools/team-followup-20261001/BUILD/physical-load-live-check.mjs`: **23PASS/0FAIL**. 기존synthetic Canvas/fake clock 하니스만 재사용하며 실제 현재game함수를 추출하고 독립입력을 실행했다.
- `node --test test/physicalImpactPrewarm.test.mjs test/darkSphereIdentity.test.js`: **22PASS/0FAIL**, 약311ms. 실제출력은 전용regression.txt.
- 판정: 정상로드 경계 수정과 단일live기록의 제한된 주장은 인수가능. 신규 코드실패 반례없음. 전체FPS 개선·CPU/GPU원인·cold 최초로드 실기증명은 인수하지 않는다.

## 입력 SHA-256
| 파일 | SHA-256 |
|---|---|
| game.html | 21235538c9766a28b04dcf529aed9883a8aa11bdbfef8e9e2ce35d5cc927c5cf |
| test/physicalImpactPrewarm.test.mjs | cda2575021087423bf7e45d8b9b61f85d9dd6401039776f1014c5431ddfe733a |
| BALANCE/physical-prewarm-candidate.js | e80f74f25fcc0ffa2144897ba4290c0b383e46c570f9a7eb4941ef90f29101b0 |
| physical-fixture-final.json | dd2b59b8e5c7e8ffbafe21726c7d182f15599b613296cb445d4c25199dcbe427 |
| live-prewarm/preflight.json | 10978cc4f12268e7699921c4d85031ecb098d35c5ab29396db019b4d7a29f5ae |
| live-prewarm/raw.json | 16fcf4917ae4463dc1d50abbbc727267a3e927398349c2f4fe1d9f909b17aea9 |
| live-prewarm/analysis.json | e7fe6b52fcfc166c689c72c5c98fae4b8305601d4bf4fd9e9206ea6211e15edc |

BALANCE는 tools/team-followup-20261001 아래, fixture/live는 outputs/team-review-20261001/draw-attribution 아래. 검사전후7입력SHA동일. gameSHA는preflight.gameSha와 일치하고 함수는 BALANCE후보·fixture.pixel.source와 문자열 일치한다. 원격4fb217eaae985b196a9ff0b90fdd1ed1eb02ceca는 preflight의 로컬/원격일치기록을 읽은 것이며 Git으로 별도조회하지 않았다.

## 정상 확정 경계 실제 실행
기본최소입력: 같은객체, src=https://fixture.invalid/sheet.png, currentSrc='', srcset='', sizes='', complete=false. 대기후 currentSrc=src/complete=true/naturalWidth=naturalHeight=512로 바꾸고load 발화.

| 독립 변경입력 | 기대/실제 |
|---|---|
| 기본정상확정 | prepared/read1. 다음reused, 원WeakMap동일객체, 추가read0 |
| 상대src 또는 srcset필드누락 | stale/read0 |
| 처음부터srcset/sizes비어있지않음 | stale/read0 |
| 대기중srcset/sizes변경 | stale/read0 |
| currentSrc다른주소/실제src변경/객체교체 | stale/read0 |
| complete=false인채load발화 | stale/read0 |
| width256, height512로완료 | load-failed/read0 |
| epoch/G.on/killed/bootActive동시취소 | cancelled우선/read0 |
| 250ms기한후정상확정 | timeout/read0 |

모든경계에서 정상timer/listener0. 실제원helper/tint를 실행했으며 기대값을 실행대역으로 넣지 않았다. 정상 빈값→불변절대src 허용은 수정확인 PASS. 이미확정currentSrc변경 등 기존22회귀도 통과했다. 폴링사이 변경후원복의 이력까지 증명하는 guard는 아니며 scheme문법은 네트워크신뢰검증이 아니다.

## live 원자료 대조
| 주장/지표 | 독립 확인 |
|---|---|
| 실제부트준비3.9ms | raw.physicalImpact.bootStats.status=prepared, total3.899999976158142/sync3.799999952316284ms, 오류[] |
| 정상전투25.007초/19처치 | end.at-firstInput.at=25007ms, end.kills-initial.kills=19 |
| physical55회동일캐시/tint0 | raw누적calls55/tintCalls0/samePreparedSheet=true/cacheReady=true/cacheSize512²; analysis와일치 |
| 첫physical호출 | at71611.70000004768, kills7, 선택측정구간내. 원시src/currentSrc일치 |
| 정리완료 | stopped=true/dropped0/events[]/cleanupErrors[], restored.draw/listeners와physical.sheet/tint 모두true |
| 전체rAF | n647,p95=50.3,p99=58.4,max166.7ms, >50 50개/>100 2개 |
| 전체draw동기경과 | n648,p95=2.1,p99=6.9,max156.5ms, >50 2개/>100 2개 |
| snapshot/draw시작간격 | 각n647,p99=58.7/58.6ms,max206.3/162.1ms |
| 첫처치 | 첫입력+4224.899999976158ms에batch2관측. 정확한개별사망시각아님 |

네분포를 최근접순위ceil(n*p), 엄격한>50/>100으로 독립재산출하여 저장analysis와정확일치. raw rows/draws각650중입력후선택648, 간격647. 전경/on/unpaused/hp>0 및모든trusted입력 확인. 시작/끝옵션동일·이벤트없음은기록근거이며 row마다옵션전체증거는없어 미기록순간변경까지증명하지않는다.

55회는raw누적계수와동일객체판정기록으로확인했다. 55개개별호출trace가없어 각호출/객체를별도로재구성할수없다. maxCallMs0은타이머기록값이지실제비용절대0증명이아니다. 이조건안에서root주장과원자료일치.

## 픽셀 증거·남은 한계
- fixture.pixel은전수1,048,576바이트0diff/maxDifference0, 양쪽hash b31bc9fb30293b3d019bb9ec68c50c83c772565962f1a498d033485db414bbee, 동일cache/reused기록을유지한다. 저장결과읽기대조이며이번실기재측정아님.
- **fixture.delayed.initial은 complete=true/currentSrc가이미주소다.** 따라서이저장fixture만으로실제DOM의빈값→최초확정전환을증명할수없다. 함수경계는독립VM으로증명했고live는부트prepared를증명한다. 정상cold지연전환실기인수까지확대하지않는다. 필요시root후속증거에는호출전complete=false/currentSrc=''과load뒤값을동일객체로기록해야한다. 새측정은실행하지않았다.
- 기존Chrome/새origin/캐시UNKNOWN/배경부하미격리/관측오버헤드미측정/GPU타이밍미측정유지. 단일관측으로전체FPS개선확정금지. draw156.5ms잔여원인추정0. synchronousDrawCPU는동기wall경과시간이며CPU계산전용/GPU완료가아니다. alive>=30은화면내적수가아니다.
- 250ms협력예산/동기가공선점불가/청소API거부잔존가능은기존제약그대로. 실제전체전투·세이브·보호설계인수로확장하지않는다.

## 인계·소유 준수
결과/receipt/evidence/regression/docs검색만 BUILD/physical-load-live-*에 기록했다. 이전15/17원자료·생산·타팀·공유docs수정0. 게임/브라우저/서버/대형빌드/Git/권한/queue/새세션/에이전트0. 작은검사는종료했고자동메시지·백그라운드작업0. root에현재자료범위인수와cold지연증거한계를한번제출한다.
