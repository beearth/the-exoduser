# SUPPORT-TRIPLE-INDEPENDENT-ACCEPTANCE

**ENEMY tick경계PASS / ART 12조건기하PASS·픽셀UNKNOWN / SKILL RETOUCH(정리반례2건).** 독립33검사중31PASS/2FAIL,exit1. 원/지원팀의26·66·16PASS를합산해완료로보고하지않는다.

## 수신·Read·명령·완료

수신/첫Read2026-10-01T14:38:24Z. 사용자제공AGENTS의보호규칙·총괄18.38·전용task·세지원task/receipt/result·원소스·후보·ART실제sourcefixture·SKILL실제양쪽충전블록과SSOT검색을읽었다. 원담당폴더/생산은읽기전용. BUILD에는task만있고독립acceptance결과가없어중복아님을확인했다. 원지원3팀은완료후보/생산미반영이며native draft/queue는UNKNOWN이다.

실제명령 `node tools/team-followup-20261001/BUILD/support-acceptance-check.mjs` 최종exit1,31PASS2FAIL. 첫실행14:40:13Z에도동일결과,원install reader누수대조를추가한최종검수14:40:37Z. 증거는support-acceptance-evidence.json에원입력/원결과/후보결과/해시/정밀시각/반례로기록했다. 기존지원검사실행으로지원evidence를덮어쓰지않았다.

## ENEMY 독립 인수

- null/missing/NaN/Infinity/stalled ×451rAF를원probe/실지원probe VM에동일주입했다. 지원은전부INCONCLUSIVE·inRangeTicks0·rafSamples451. null원본FAIL_NO_FIRE/inRange451과후보를원자료에직접대조했다.
- 정상460물리tick×4refresh=1840rAF: 후보inRange/alive/physicalAdvances460,FAIL_NO_FIRE. 예산후backward→회복시도는INCONCLUSIVE/elapsed null 유지. tick을rAF로증식하지않는다.
- 실제wrapper의orig커밋여부를대조:projs증가시PASS,미증가FAIL_PATH. 이후foreign wrapper는stop이덮어쓰지않고자기wrapper만복원,자기예약취소확인.
- 이번PASS는VM관측기계약이며실제etype3 AI결함수정/탄발사/자연플레이검수가아니다. sourceHash `92cbecd7cb38ad13b83cc5cc00938dcb69e8687de9c36fa38f0046708bd5f1a8`.

## SKILL 정상경계 및 반례

endpoint rech100→99/stk0→1/조준true→false는원본recharge1 오판을직접재현,지원은recharge0/refund0/UNKNOWN. updateSeq와각before/after·sp·max를가진완전2update trace는실제충전원식(스택2/3,sp감소,만료1증가,다음1500/최대0)과맞을때만충전2회. partial trace·잘못된before/timer/sp/seq는UNKNOWN. trace는검증fixture이며실게임공급완료가아니다.

install reader throw는원본listener3누수를직접대조했고후보listener0/예약0/UNKNOWN. rAF readRaw throw도동일정리확인. remove3종각각throw에서는나머지2정리를계속하고남은1을기록·재dispose로정리하는회귀PASS.

### S1 — cancel 실패가 실제 예약을 남겼을 때 id를 잃음

정확한입력: rAF가id1을Map에등록; `cancelAnimationFrame(1)`이**취소전**throw. dispose는listener3개를정리하지만rafId=0으로지운다. cancel실패를해제한뒤재dispose해도이미disposed/remainingListeners0이므로early return. 결과pending1→1,attempts에는cancel:1만있고id1재취소없음. 기대는취소실패예약id를보존하고재정리를시도할수있는계약이다. 후보콜백은disposed상태라나중에실행되면무동작이므로실제게임루프재발동이나무한예약으로과장하지않는다.

최소권고: cancel성공전까지해당rafId/취소실패상태를보존하고early-return조건에서미정리예약을함께검사. host가계속거부하면완료가아닌UNKNOWN과잔여자원을기록. 이번검사는host실패를취소이후throw로만모형화한기존지원검사보다엄격하다.

### S2 — readRaw 반환 후 필드 읽기 예외가 전체정리를 우회

정확한입력: 초기readRaw 정상,다음rAF의raw.zones getter가`Error('zones-getter')`throw. readRaw자체는성공했으므로현재try/catch밖diffZones에서예외가누출된다. 실제thrown='zones-getter'/listeners3/disposedfalse/verdictUNDETERMINED·errors미기록. 기대는해당관측예외기록/UNKNOWN/정리다.

최소권고: readRaw뿐아니라raw필드/trace/zone처리영역을관측try/catch로보호하고실패시phase기록·dispose. 또는custom reader가plain안전snapshot만반환한다는명시입력계약을root가확정. **이것은injected custom reader 반례**이고기본reader가현재동일getter를생성한다는증거는아니다. 서버/실게임예외로단정하지않는다. 실제원본및지원소스변경0.

SKILL SHA `18ab8391ea2490edac74fd631e81245a6808b6112a3d00049e3446b5de593532`. 지원보고의원66GREEN은기존관측가정검사다. 같은옛기대값으로지원후보는52PASS/14FAIL;증거부족을UNKNOWN으로바꾼정정기대66PASS는관측계약정정이며14개게임버그가해결됐다는뜻이아니다. 이번원식/경계검사와새반례는그숫자보고를그대로반복한것이아니다.

## ART 독립 기하 대조

1920×1080/2560×1080/1920×1200/1024×768 ×400/1200/2399ms의12조건에서지원모듈을실제import하고현재game의wa24/letterbox/clip/draw/shake/ease sourcefixture를VM실행했다. clip와matrix6성분/drawRect를대조,별도clip inverse를계산해visibleSourceRect를검사했다. 원base cover 예측도같은입력으로기록했다.

12조건PASS. 16:9 세로손실은약6.34755/4.76190/3.84615%. 초기fade0은HIDDEN_FADE_NO_VISIBILITY_EVIDENCE이고eye/foot/subtitle는항상UNKNOWN. 기하크롭보정PASS가실제눈/발/자막가독성PASS나최종art채택이아니다. source fixture는현재draw원식과해시를원자료에보존했으나픽셀을읽지않았다.

ART지원 SHA `aa73c00b4e9f74acf0a5c8898969b1f5430e82bddbf9dbdcf1fbcb6192875018`;sourcefixture SHA `daa71b38b9cdc4cae4aa6db4067dac19ee6645ecfc1ffc29598373c3a332a9b3`. 지원처음16FAIL은wa24 SequenceExpression 추출조립오류이고최종4PASS/12FAIL 원기하대조와구분해팀receipt를읽었다. 이번검사는정정된fixture만읽어실원식12조건을독립대조했다.

## 보존·인계

전입력9파일(생산양쪽/원3/지원3/ARTfixture)시작·종료SHA불변검사PASS. 실제전체해시는evidence.json. docs 전체wa24/아이스스톰/FAIL_NO_FIRE/INCONCLUSIVE/1500/_gameFrame 검색원자료는support-acceptance-docs.txt. 공유SSOT정정은root에게S1/S2의정리제약·현재관측UNKNOWN/trace조건·ART기하/픽셀분리로인계한다.

root인수순서권고: ENEMY tick/ART기하후보는해당범위정적인수가능;SKILL은S1/S2를수정하거나명시입력/정리계약을좁힌후새회귀. 그뒤체크포인트및root실전QA가별도다. QA새신호없었으며33소형검사외부하작업0. queue/DB·권한/EPERM재시도/Git/새세션/하위에이전트/게임/브라우저/서버/대형빌드/공유파일/타팀쓰기0. 원실패·지원결과는불변,전용산출만작성했다.
