# QUESTNPC 후속 — firstItem 표시 수락 전 소비 경계

작업 ID: **continuous-QUESTNPC-first-item**  
실제 checkout: **/Users/fordeargamers/Projects/exoduser-migration-20261001**  
완료 범위: 신규 소스 경계 조사·메모리 후보 대조·인계. **생산 수정/채택 없음. 최소 후보는 적용 HOLD.**

본편과 easy 모두 앞선 정상 안내의 말풍선이 남은 상태에서 firstItem에 도달하며, _petSayCD=false인데 _petTut.firstItem=true가 된다. 말풍선/CD를 가짜로 주입하지 않고 실제 tut_start와 pickupItem을 통해 생성한 입력에서 확인했다. 새 checks.mjs 1회 실행, 8개 근거 그룹 PASS(exit0), 현행 결함 기대 동작 실패 2건을 관측했다. 이전 지도/검사는 입력으로 읽었으며 재실행·합산하지 않았다.

후보는 거절 시 firstItem을 남겨 재진입에서 한 번 수락하게 한다. 성공 즉시 경로는 추출한 상태·문구·순서·CD가 동일했다. 다만 무조건 return을 유지한 반복 재시도는 뒤쪽 대사 평가를 계속 건너뛸 수 있다. 따라서 8/8은 전체 디스패처 안전성·실게임 PASS가 아니며, 이 한 줄 후보를 그대로 생산 적용하지 않는다.

## 기준과 운영 이탈

| 항목 | 실제 기록 |
|---|---|
| 총괄 제공 생산 commit | 7e69495046323b3120578f67635c20feb48b2a4f. COMMON/배정 메시지에서 제공된 기준이며 독립 현재 HEAD 확인값으로 전용하지 않음 |
| 총괄 제공 TASK checkpoint | cd675f24. 제공된 짧은 ref이며 전체 SHA/원격 존재를 독립 조회하지 않음 |
| 수신·착수 관측 시각 | evidence.json UTC/KST. 최초 계약 Read 묶음 직후 clock 관측값이며 메시지 시스템의 송달 시각은 제공되지 않음 |
| 읽기 전용 Git 이탈 | COMMON 내용을 처리하기 전에 N04 git rev-parse HEAD, N05 git status --short --untracked-files=all 2회를 실행. 실제 HEAD 관측 75b616dc0fe5e0e3daa26f6efe02ee7e16dc8a3f, Changes 23행. 쓰기/복구 없음. 이후 Git 호출 0 |
| 총괄 문구 정정 | 후속 지시에 따라 현재 HEAD 문구를 제공 commit 출처/시각 기록으로 정렬한 TASK를 N37 재독. TASK 직접 수정 0 |
| Changes 완료 관측 | COMMON의 Git 조회0에 따라 추가 조회하지 않음. 완료 개수 UNKNOWN, 시작 23행을 완료 개수로 쓰지 않음. 80/100 기준 확인·checkpoint는 총괄 소유 |
| 현재 입력 SHA | N10/N39/N45/N51 및 fixture의 sources/fragments. 이전 인수 SHA와 별도로 실제 현재 파일에서 기록 |
| 도구·스킬 | exec_command·apply_patch·clock 실제 호출. 별도 SKILL/API/MCP/브라우저/외부 앱 0. 로컬 소스와 허용 Node VM으로 처리 가능해 추가 연결/생성 도구 불필요 |

## 실제 도달 chain과 반환 계약

아래 경로는 모두 위 checkout 기준이다. 생존·전투 실습·입력 guard를 생략한 하위 함수 단독 반례를 만들지 않았다. world spawn/물리 수거 입력은 source Read만 했고 fixture는 pickupItem 성공 경계부터 실행한다.

| 단계 / id | 현재 source / 조건·부수효과 | 이번 확인 |
|---|---|---|
| C1 update 선행 guard | game.html:30857–30881 / easy:29675–29698. systemLesson.tick → !G.on return → parryLesson.tick=true return → editor return → 패널 입력 → G.paused return | 이 원문 prefix를 실행. 정상은 on=true·실습 종료/seen=true·editor=false·paused=false·단축키 없음. parry-lesson.js:467–471은 완료 seen의 tick=false를 허용 |
| C2 펫 caller | main:30910,40091–40099 / easy:29727,38891–38899. G.pets가 있으면 updatePet, 이동 함수 뒤 _checkPetDialogue | 실제 updatePet 원문 사용. movement body는 명시적 대역 |
| C3 체크 첫 guard·우선순위 | main:9184–9229 / easy:8635–8680. !G.on 또는 !G.pets return, _updatePetBubble, 생존 입찰/중간 _petFireBid, lv>500 return | 실제 prefix와 긴급/입찰/발화 함수 실행. **말풍선 활성 또는 T1 CD를 이유로 caller가 firstItem 진입을 막는 guard는 없음** |
| C4 Stage0·선행 튜토리얼 | main:9231–9243 / easy:8682–8694. si===0·P.lv≤200. start/공격/피격/사슬/패링/킬/bow 분기를 먼저 평가하며 해당 시 return | 초기 카운터 0, start는 실제 첫 tick에서 수락·소비. 다음 tick에는 다른 앞선 조건이 성립하지 않아 firstItem 도달 |
| C5 가방 획득 | main:15675–15701; 수거 입력:31551,31656–31665. easy:14782–14818; 입력:30368,30473–30481 | 본편은 일반 장비 가방행. easy는 빈 슬롯 자동 장착 후 같은 슬롯의 다음 장비가 가방행. fixture는 두 번의 실제 ordinary headband pickupItem으로 bag≥1 생성. 공간/SFX/stats/save는 대역 |
| C6 firstItem 소비 | main:9243 / easy:8694. !firstItem·bag≥1에서 **true 대입 → _petSayCD 호출 → 무조건 return** | 앞선 tut_start가 실제 만든 crow t=300·T1 CD=720 상태에서 다음 체크가 도달. _updatePetBubble이 한 tick 감소한 뒤에도 표시 거절 가능 |
| C7 _petSayCD | main:9148–9156 / easy:8599–8607. MAP QA false 반환; ID CD/bubble 활성 false; 해당 tier CD false; _petSay의 ok 반환. **ok일 때만** ID CD/tier CD 대입 | tut_firstItem은 T1, CD 값/배열은 실제 원문. 거절 시 firstItem ID CD 생성 없음 |
| C8 _petSay | main:9066–9078 / easy:8521–8533. 피날레 정책·bubble·ID CD 검사; crow 상태/응답 pair를 채우고 show/SFX 호출 뒤 true | true는 동기 디스패처 수락. DOM 자막 실제 표시·cat 응답 완료·음성 완료 증명 아님 |
| C9 표시·pair tick | main:9046–9065,9159–9181 / easy:8501–8520,8610–8632. DOM 없으면 show는 return. bubble 종료 시 pair를 cat으로 전환, pair=null | tick 원문 실행, show/DOM/SFX sink는 대역. show 부재를 _petSay의 true가 판별하지 않는 현행 계약은 별도 UIUX Gate |

### 선택한 정상 입력

1. 기존 일반 진행 Stage0·lv1·HP/MP/ST 정상, 전투실습이 완료된 상태와 systemTutorial=0을 사용했다. 실제 systemLesson.eligible은 false여서 새 안내 UI를 생성하지 않는다.
2. 실제 pickupItem으로 ordinary headband를 획득한 뒤 update prefix→updatePet→체크를 실행한다. tut_start가 먼저 crow 5초/응답 cat 5초와 T1 720f를 만든다. firstItem은 아직 false다.
3. 같은 슬롯 장비를 다시 실제 pickupItem으로 획득한다. main은 가방, easy는 이미 채운 슬롯 때문에 가방 경로다. 공격·킬·피격 카운터를 임의로 증가시키거나 bubble/CD를 직접 대입하지 않는다.
4. 다음 정상 caller가 firstItem에 도달한다. 표시기는 앞선 bubble을 이유로 false를 돌려주지만 현행 flag는 이미 true다.
5. 정상 tick으로 bubble/pair·티어 CD가 자연 종료돼도 현행은 firstItem을 다시 호출하지 않는다. 메모리 후보는 false를 유지해 허용 시 1회 수락한다.

이는 source 경로와 최소 환경에서의 도달성이다. 월드 드롭 생성 확률, 실제 입력 타이밍·맵·렌더링·전투 실습 전체·사용자 세이브로 재현한 플레이 기록은 아니다.

## 표시 성공·거절/중단·정상 재진입 수명 표

| 상태 / 전이 | 현행 firstItem / 최소 후보 | bubble·CD 변경 주체 | 시스템 튜토리얼·배지 / 저장 의미 |
|---|---|---|---|
| 새 페이지 원문 초기화 | 둘 다 false | module const에서 bubble t0·pair=null, dlgCD={}, tierCD0 | _petTut은 소스 주석상 런 내 임시 플래그. 새 저장 필드 없음 |
| 앞선 tut_start 성공 | firstItem은 둘 다 false, start=true | _petSay가 crow mt/t300·cat pair mt300; _petSayCD가 start ID599940f·T1 720f | companion 안내이며 실제 pickup/equipment 성공 체크와 독립 |
| 앞선 안내 중 firstItem 거절 | **현행 true / 후보 false** | 체크 첫 tick이 기존 bubble/CD를 감소. _petSayCD=false라 firstItem ID CD·새 bubble/pair·firstItem SFX는 생성하지 않음 | 가방 획득은 이미 성공했을 수 있음. 표시 거절을 획득 실패·배지 skip으로 바꾸지 않음 |
| 거절 뒤 정상 재진입 | 현행 true 유지·재호출0 / 후보 허용 시 true·수락1 | _updatePetBubble의 자연 tick 뒤 bubble 비고 T1 CD0이면 _petSayCD가 수락 | 실제 체크/배지·보상 추가 호출 없음. fixture에서는 guide 비활성·checks/skipped 빈 상태 보존 |
| firstItem 수락 성공 | 둘 다 true | crow 5초=300f·cat 응답 4초=240f 예약, ID9999초=599940f·T1 720f. 매 tick _dtSp로 감소 | 수락은 장착/시스템 수료 아님. 최소 후보는 이 기존 숫자·원문·화자·순서를 바꾸지 않음 |
| 수락 후 생존 경고 중단 | 둘 다 true 유지. 정상 재진입해도 firstItem 재수락 없음 | _petFireBid의 T5가 t0/pair=null 후 생존 경고 생성. 원래 디로이 firstItem pair가 사라질 수 있음 | fixture에서 firstItem 수락1·디로이 원문 표시0 관측. 별도 완료/취소 토큰 없음 |
| 시스템 안내 항목 skip/close | source상 firstItem 직접 변경 없음 | system-lesson.js:65–71은 skipped.add 또는 closed=true/active=false/panel.remove. 펫 bubble/CD에 연결 없음 | skip은 성공 아님, close는 guide 종료. _petTut이나 companion 대사 전체 취소 API로 계산하지 않음. 이번 UI/skip 실행 없음 |
| 실제 사망 화면 | 이 경로에서 firstItem을 되돌리는 대입 미발견 | main:42390/easy:41187 G.on=false, _deathDlgStart main:42353–42356/easy:41150–41153이 t0/pair=null·opacity0. ID/tier CD/firstItem 직접 초기화는 해당 구역에 없음 | 중단 후 부활/재도전의 전체 수명은 이번 static 근거와 별도 실게임 Gate. 저장 배지 삭제/새 보상 없음 |
| nextStage·initStage·페이지 재접속 | Stage0 바깥에서는 firstItem 분기 비대상. 두 HTML의 firstItem 직접 쓰기는 초기 선언/true 대입만 발견 | main:30295–30329,42415 / easy:41212는 stage/플레이 상태 변경. 다른 모듈·동적 reset 전체를 미발견만으로 부정하지 않음 | 같은 page의 run flag와 새 page 초기화를 구분. 슬롯 배지는 별도 localStorage 계약; 재접속 세이브 왕복 미실행 |

async request/cancel callback·AbortController·promise 기반 firstItem 수명 API는 조사한 표시 함수에 없다. 동기 bool/프레임 상태와 실제 T5·사망 정리 경로만 근거로 기록했다.

## 표시 수락 후 소비 최소 후보 — 메모리 검토용 / 생산 HOLD

생산에서 확인한 한 줄을 검사 VM 안에서만 아래와 동등하게 대조했다. result.md와 checks.mjs의 메모리 후보만 존재하며 HTML/공유 docs 적용은 없다.

~~~js
if(!_petTut.firstItem&&INV.bag.length>=1){
  if(_petSayCD('tut_firstItem','crow',
      'TAB을 눌러. 가방을 열고 장비를 입어야 한다.',5,9999,
      'cat','주웠으면 껴야지! TAB!',4)){
    _petTut.firstItem=true;
  }
  return;
}
~~~

| 비교 | 현행 | 후보 / 판정 |
|---|---|---|
| firstItem 표시 거절 | flag 선소비·이후 재안내 없음 | flag false 유지·허용 후 수락1. 선택 경계 복구 확인 |
| 처음부터 수락 가능한 정상 경로 | 기존 원문·화자·pair·CD·flag | 같은 추출 입력에서 전체 상태/호출 순서 동등 |
| 이미 수락한 뒤 긴급 중단 | flag true 유지·cat pair가 유실될 수 있음 | 동일. 디로이 후발 문장 완독/재생 보장 후보가 아님 |
| 획득·장착 | 본편 가방/easy 자동장착·실패 계약 | 실제 pickupItem 원문 유지, 신규 equip/보상/배지/저장 호출 없음 |
| 나머지 튜토리얼 코드 | 별도 분기와 순서 유지 | 텍스트 자체 수정0. **재시도 중 return의 반복으로 평가 횟수/도달성이 달라질 수 있어 전체 보호 완료 판정 금지** |
| ID/메모리 상태 | firstItem·tut_firstItem | 새 questId/대기 큐/세이브 필드/배지 정책/취소 필드 없음 |

**적용 HOLD 근거:** 현행은 실패해도 firstItem=true라 다음 tick에는 뒤쪽 평가로 넘어간다. 후보는 false를 남기면서 return도 유지해, 첫 안내가 수락되기 전까지 potionCraft·탄막 안내·키 안내·boss_elem/boss_summon/near_boss 등의 뒤쪽 평가를 반복 생략한다(main:9244–9272, easy:8695–8723). 긴급 T5 블록은 앞쪽이라 이번 중단 검사는 통과했지만, 비긴급 상위 티어까지 보호됐다는 뜻은 아니다. 이번 고립 입력에서 후보 호출720회 중 수락은1회였다. “720번 화면 출력”이 아니며 새 재시도/CD 숫자도 아니다.

총괄은 **실패 시 return/뒤쪽 디스패치 유지 계약**을 인수한 뒤 생산안을 결정해야 한다. 실패 시 fallthrough나 입찰 방식 변경은 현재 미검증 대안이며 이 보고서에서 추가 패치로 확정하지 않는다. 다른 튜토리얼의 flag 소비 오류까지 범위를 넓히지 않았다.

## 이번 신규 검사와 한계

| 검사 그룹 | main | easy | 해석 |
|---|---|---|---|
| caller 통과·앞선 발화 생성→firstItem 거절→정상 재진입 | PASS, 현행 원하는 재안내 실패 관측 / 후보 수락1 | 동일 | 선택한 선소비 결함 source proof |
| 표시 가능한 정상 경로 전체 추출 상태 동등 | PASS | PASS | 문구/순서/flag/bubble/pair/ID·tier CD/SFX sink/획득 객체/save 대역 호출/guide·badge 상태 비교 |
| 정상 수락→실제 T5 함수 중단→건강한 재진입 | PASS | PASS | firstItem 수락1, 해당 디로이 응답0. 성공 bool의 한계 확인 |
| 실제 update caller guard 5종 × 현행/후보 | PASS | PASS | G.on=false, paused=true, parry tick=true, editor=true, pets=null에서는 start/firstItem 미소비·요청0 |

새 실행1, 근거 그룹8/8, exit0. 내부 assertion 수를 과거 검사 수와 합산하지 않았다. fixture는 현재 파일의 함수·상태 선언·guard를 읽어 추출하며 marker 중복/누락이면 오류로 중단한다. 후보는 firstItem 대입 순서만 메모리에서 변경한다.

실제 사용 fragment별 파일/행/SHA는 evidence.json의 fixtureResult.fragments에 있다. update의 guard prefix와 pet 호출 사이의 게임플레이/AI/worker는 실행하지 않았다. _checkPetDialogue는 Stage0 튜토리얼 블록까지로 제한했다. system-lesson.js와 tutorial-badges.js는 실제 전체 원문을 VM에 로드했으나 DOM/DOMContentLoaded·번역·오디오·모션·가방 그리드·통계·save는 대역이다. 화면 표시/패드/한국어·영어/실저장/HTTP/실게임/빌드/GPU 검수 0이다.

배지 수료 코드 경로의 기존 7항목 완료·중복·slot 저장 검사를 다시 수행하지 않았다. 이번 확인은 companion 재시도가 기존 성공 체크를 직접 호출하지 않는다는 범위다. 실제 활성 시스템 안내와 동시 진행은 총괄 적용 전 Gate다.

## canonical 보충 인계 문안 — 공유 docs 실제 수정0

| 대상·절 | 그대로 사용할 수 있는 문안 / 반영 단계 |
|---|---|
| docs/11내러티브·로어디자인/펫_대사_스크립트.md:39,89–93 | **tut_firstItem 현행:** Stage0·Lv≤200·가방 길이≥1·firstItem=false 조건은 앞선 튜토리얼과 긴급 입찰 뒤 평가한다. 현행은 _petTut.firstItem=true를 _petSayCD 반환 전에 설정하므로 앞선 말풍선/티어 CD로 표시가 거절돼도 flag가 소비될 수 있다. 표시 수락 bool 뒤 소비하는 최소 후보는 source fixture에서 선택 경계를 복구했으나 무조건 return의 반복으로 후속 대사 평가를 생략할 수 있어 생산 미적용/HOLD다. 승인 원문과 화자·지속시간·CD를 유지한다. |
| docs/2_4 펫시스템/대사_스크립트.md:11–37,98 | **tut_firstItem 수명:** T1 글로벌 CD720f, 선발 crow5초/응답 cat4초, ID CD9999초를 사용한다. _petSayCD=true는 선발 대사의 동기 수락·pair 예약이며 cat 응답 표시/완독·음성 완료 증명이 아니다. 생존 T5·사망 화면 정리는 pair를 취소할 수 있고 firstItem을 자동 미소비로 되돌리는 계약은 이번 조사 구역에서 확인되지 않았다. 새 취소/완료/저장 상태를 추가하지 않는다. |
| docs/2_4 펫시스템/2_4 펫시스템.md:58–73 | **firstItem 후속 검토:** 일반 대사는 v7 티어별 글로벌쿨을 따른다. 이 절의 과거 단일15초 설명을 tut_firstItem의 T1 720f로 해석하지 않는다. 선소비 거절 경계는 양쪽 source에서 확인했으며 최소 성공 후 소비 후보는 미채택이다. 전체 디스패처 후속 평가 보존과 실제 HUD/패드·음성 인수 전에는 반영하지 않는다. |
| docs/2게임디자인레벨디자인/SYSTEM_TUTORIAL_20260912.md:5–25 | **동료 안내와 실습 구분:** firstItem companion 대사는 가방 상태에 반응하며 _systemLesson의 pickup/equipment 성공·개별 skip/close와 독립이다. firstItem 재시도/수락만으로 checks를 채우거나 systems 배지를 지급하지 않는다. 본편 일반 장비는 가방행, easy 빈 슬롯 자동장착은 유지한다. companion 소비 순서 후보는 생산 미적용이며 기존 7항목 실제 행동·skip 정책을 변경하지 않는다. |
| docs/2게임디자인레벨디자인/TUTORIAL_BADGES_20260912.md:7–17,45 | **보존:** systems는 기존 7개 실제 성공만 지급하며 skip은 성공이 아니다. exoduser:tutorial-badges:v1:<slot>의 획득 시각·중복 차단·장식용 정책은 그대로다. firstItem 수락/중단/재시도를 배지 재지급이나 저장 동기화로 전용하지 않는다. 신규 배지/보상 없음. |
| docs/15 세이브+데이터구조/15 세이브+데이터구조.md:35–41,170–177,188–221 | **런 상태:** _petTut.firstItem·bubble/ID·tier CD는 source 주석상 런 내 안내 상태이며 이번 후보는 저장 필드를 추가하지 않는다. 시스템 checks/skipped·slot-local 배지·game.cutsceneDone/플레이 기록을 서로 다른 계약으로 유지한다. 같은 page 중단/재진입과 새 page 초기화를 구분하며 실제 세이브 왕복은 미실행이다. |

PETS_DESIGN_LOCK의 디로이/핵터 인물·외형, WORLD_CORE의 동료/거점 역할과 충 보유 TBD는 읽기만 했으며 수정/새 로어/새 인물/맵 배치 제안0이다. 보호2_3·Q 전용 무지개탄·전투/경제 수치 변경0이다.

## docs 전체 검색 영수증

fixture 작성 뒤 N47에서 관련 키워드를 docs/ 전체 rg로 검색했다. 31개 매칭 행 / 14개 파일, exit0, 출력 잘림0. 검색 원문과 명령은 evidence.json의 docsSearch에 기록한다. rg 기본 ignore/hidden/binary 정책이며 docs 밖 backup은 범위가 아니다. 모든 매칭 본문을 완독했다고 주장하지 않는다.

패턴: tut_firstItem|_petTut\.firstItem|_petSayCD|_petTierCD|_PET_TIER_COOL|_checkPetDialogue|_petBubble|건너뛰기는 성공|시스템 7항목|tutorial-badges:v1

| 매칭 파일 | 행 수 |
|---|---|
| docs/2_4 펫시스템/2_4 펫시스템.md | 4 |
| docs/2_4 펫시스템/대사_스크립트.md | 9 |
| docs/2_4 펫시스템/대사_개편_v7_설계.md | 2 |
| docs/16번역·로컬라이제이션/번역대상_전체목록.md | 1 |
| docs/CHANGELOG_SYNC.md | 1 |
| docs/16번역·로컬라이제이션/번역대상_펫대사.md | 2 |
| docs/16번역·로컬라이제이션/LOCALIZATION_RUNTIME_20260909.md | 1 |
| docs/11내러티브·로어디자인/펫_대사_스크립트.md | 4 |
| docs/8.1보스디자인바이블/BOSS_00_FOREST_NORMAL_EYE_SENTINEL.md | 1 |
| docs/8.1보스디자인바이블/DARK_DRUID_FINALE_PACING_v04.md | 1 |
| docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md | 1 |
| docs/2게임디자인레벨디자인/SYSTEM_TUTORIAL_20260912.md | 2 |
| docs/2게임디자인레벨디자인/TUTORIAL_BADGES_20260912.md | 1 |
| docs/0마스터플랜/mac-resume-20261001/gap-attribution-evidence/attribution.json | 1 |

## 총괄 적용 전 Gate / 완료 경계

| Gate | 이번 상태 / 필요한 인수 |
|---|---|
| 선택 경계 도달성 | source prefix/caller 포함 반례 성립. bubble/CD 직접 주입 없음. actual world spawn/R·포털 우선 처리까지 실행한 플레이는 미실행 |
| 성공 뒤 소비 판단 | 선택 거절 복구·정상 성공 동등성 확인. 최소 후보는 검토용 |
| 기존 대사·우선순위 보호 | **HOLD:** 반복 return으로 후속 튜토리얼/T3·T4 경쟁 평가를 생략하는 영향. 전체 dispatcher 소비/return 계약 확정 필요 |
| 디로이 pair 완료 | **미보장:** _petSayCD true는 crow 수락. 긴급/사망 취소 뒤 pair 보장 여부는 별도 정책·UIUX Gate. 이번 새 상태 추가0 |
| 실제 표시·입력 | UIUX의 DOM 존재/표시, 활성 guide 동시성, 패드·언어·일시정지·죽음/재도전 화면 인수 필요 |
| 런/저장/배지/경제 | 새 save/reward/배지/퀘스트/NPC 배치 적용0. 실제 세이브·음성·게임·HTTP 검수0 |
| 보존/통합 | 검사 직후 N51까지 source 5개·이전 산출3개 SHA 동일. 이후 N59에서 main/easy·save SSOT 전체 SHA 변경 관측(본 팀 수정0, 소유자/원인 UNKNOWN). N62–65에서 선택 경계/호출 guard를 재독했으며 동일 행 확인. 신규 전체 소스 통합은 미검사. TASK는 총괄 정정 후 재독·SHA 기록. 소유 산출3개만 작성 |
| 이전 검수 | 이전 검사 실행0·재합산0. 새 검사1회만 실행. 완료 후 같은 검사를 반복하지 않음 |

생산과 공유 docs의 실제 수정·Git 쓰기·서버/UI·삭제/cleanup·이동·새 세션/하위 팀·외부 메시지·API/설치/인증/게시0이다. 읽기 전용 Git 조회 이탈2회는 위에 별도 기록했으며 “Git0”로 보고하지 않는다.

이 한 건의 소스 경계 검토는 완료했다. 총괄의 후보 인수/피드백 또는 다음 지시를 기다린다.
