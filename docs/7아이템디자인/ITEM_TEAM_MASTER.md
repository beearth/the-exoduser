# ITEM 팀 작업 대장 — 2026-10-01

> 담당: 고유아이템 모델·어픽스·밸런싱. [팀 연속 진행 규칙](../0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md)을 따른다. 현 상태는 **원화 후보 회수 완료, 시각 채택·본게임 연결 미완료**다.

## 현재 작업과 근거

| 항목 | 확인 결과 |
|---|---|
| 본인 MagicLight 작업 탭 | Chrome 탭 `110166448`, `https://magiclight.ai/toolbox/`. 2026-10-01에 직접 열린 상태와 아래 22개 Preview 작업 ID를 다시 확인했다. 타 팀 탭은 조작하지 않았다. |
| 본인 64/160px 검수 탭 | Chrome 탭 `110166586`, `http://localhost:3333/unique-item-project/review.html`. 자체 생성한 비교 페이지에서 두 크기의 전종 표시를 확인했다. 탭 ID는 브라우저 세션마다 바뀔 수 있으므로 경로를 영구 진입점으로 삼는다. |
| 원본 보존 | `assets/unique-items/ui-01~22.png` 기존안 22장과 `ui-01~22-seedream-candidate.png` 후보 22장, 총 44개 추적 파일. 원본과 후보는 서로 덮어쓰지 않는다. |
| 회수 대조 | `unique-item-project/audit-art.mjs` 실행: 작업 ID 22/22, PNG 44/44, 다운로드 파일 SHA-256 일치 22/22, 누락·해시 중복·목록 밖 PNG 0. MagicLight에서 추가 생성하지 않았다. |
| 이미지 기술 상태 | 기존안 1024×1024 RGB PNG 22장, Seedream 후보 1920×1920 RGB PNG 22장. 전부 알파 없음. 후보 원본을 게임에서 바로 사용하면 배경이 함께 그려진다. |
| 64/160px 예비 시각검수 | 비교 페이지에서 44개 이미지 로드와 전체 구조를 확인했다. 후보들은 기존안보다 64px에서 대체로 어둡고, UI-07의 3사슬·UI-20의 견갑·UI-21의 흉갑은 종류/핵심 구조 가독성이 특히 약하다. 최종 채택 판정이나 재생성 대상 확정은 아직 하지 않았다. |
| 게임 연결 | 본편/easy 저장 이름 보존 가드만 반영(2026-10-01). 새 22종의 `uniqueId`, 드롭·장착·효과·세이브·번역은 미구현. 기존 `UNIQUE_SPECIAL` 12종과 `rarity=5`는 그대로다. |

## MagicLight 작업 ID 대조표

모든 행은 MagicLight 화면의 완성 Preview ID, 다운로드 원본 `<작업 ID>-1.png`, 프로젝트 후보 `assets/unique-items/ui-XX-seedream-candidate.png`가 같은 대상을 가리킨다. 실제 파일 SHA-256은 `audit-art.mjs`로 재검사한다. UI-01~03·09의 프롬프트는 [프로젝트 장부](고유아이템_모델_어픽스_밸런싱_프로젝트_20260930.md), 나머지 18종은 [생성 배치](SEEDREAM_UNIQUE_ART_BATCH_20261001.md)를 따른다.

| UI | 작업 ID | UI | 작업 ID |
|---|---|---|---|
| 01 | `7511075533608345600` | 12 | `7511087722981380096` |
| 02 | `7511075606769590272` | 13 | `7511087809497313280` |
| 03 | `7511075691511336960` | 14 | `7511087819983081472` |
| 04 | `7511087453233131520` | 15 | `7511087836089176064` |
| 05 | `7511087470073270272` | 16 | `7511087850957996032` |
| 06 | `7511087481548865536` | 17 | `7511087937301925888` |
| 07 | `7511087497621454848` | 18 | `7511087950354612224` |
| 08 | `7511087678781825024` | 19 | `7511087964640432128` |
| 09 | `7511070399411146752` | 20 | `7511087983086948352` |
| 10 | `7511087690668466176` | 21 | `7511088031657021440` |
| 11 | `7511087704585191424` | 22 | `7511088043463954432` |

## 승인된 다음 작업

| 순서 | 작업 | 담당 범위·완료 근거 | 상태 |
|---:|---|---|---|
| 1 | 원화 회수·누락 대조·게임 적용 규격·카탈로그 기록 | 이 대장, [카탈로그](보라색_고유아이템_카탈로그_20260930.md), [적용 계약](UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md), 감사 도구와 비교 페이지 | 회수·기술 검수 완료. 최종 시각 채택은 별도 게이트 |
| 2 | PM-009 `uniqueId` 연결 계약 | `mkItem`·드롭·세이브·아이콘·툴팁 현행 경로와 22종 슬롯/타입 관계, 기존 유니크 호환 계획 | 문서 계약 정리 중. 공용 `game.html`은 타 팀 변경 보존 |
| 3 | TOP 8 어픽스 상호작용·상한 검토 | [정적 훅 검토](UNIQUE_TOP8_HOOK_REVIEW_20261001.md)에 8종 사건·상태와 U-D13/17 코드 간극을 기록. 장판 수·피해·프레임타임 실전 계측은 본게임 효과 연결 후 수행 | 정적 검토 완료 / 실전 미완료 |
| 4 | 채택 후 실제 연결·실전 밸런스 | 확정 원화·롤·드롭 가중치, UI/번역·세이브, 본게임/패키지 실측 | 미완료. 새 시스템·수치 결정과 팀 간 파일 소유권 조율 후 진행 |

QA 실측 중에는 별도 게임 장면·대형 빌드를 중복 실행하지 않는다. 원화 최종 채택은 64px 가독성, 160px 구조, 아이콘 합성, 실제 게임 화면에서 판정한다.


## Mac UI07/20/21 검수 인수 — 2026-10-01

기존 ITEM 세션a1c26e3a이6장 원본과연결/폴백을 읽었고, 총괄이 기존 review.html의 실제64/160px6이미지 로드·CSS크기·natural크기를 확인해 캡처했다. 같은 세션이 캡처3파일로 판독을 보완했다. UI07·21은 기존안의구조/종류판독 우세. UI20은 **기존ui-20.png=옆모습견갑**, 후보=중앙자수정방패형이며 최초팀답변의뒤바뀐설명을정정했다. UI20 발광가독성은후보가높지만견갑정체성은기존안이맞아밝기만으로채택하지않는다. 채택0·연결0 유지, 수치/저장/드롭·원화무변경.

[실제크기증거·한계·정정기록](../0마스터플랜/mac-resume-20261001/3팀-독립검토.md). 전용uniqueId/PNG미연결과공통스킨→물리PNG→SVG경로는정적검토이며게임연동PASS가아니다.


### 2026-10-01 Mac UI03 병행 후속 인수

기존 a1c26e3a 세션에서 승인 원본/가공본/미승인 후보 분리, uniqueId 스킨 경로/폴백 패치·검사 후보를 제출했다. 실제 읽기·산출 완료이며 코드 적용/게임 실행/패키지/실측 완료가 아니다. 원문 후보 및 정정은 [팀 산출](../0마스터플랜/mac-resume-20261001/ui03-evidence/ITEM-팀검토.md), 실제 수신/착수/다음 게이트는 [11팀 인수표](../0마스터플랜/mac-resume-20261001/11팀-UI03-병행후속.md)를 따른다.


### 2026-10-01 MAP020 병행 후보 실행 인수

실제하니스25PASS1FAIL. 본편cutout실패후RGBphys마스킹누락재현,후속수정대기. 쉬운판해당검사PASS. 기존CLI는읽기검토,지원에이전트와root가실제파일작성/실행했다. [실행근거·제약·다음게이트](../0마스터플랜/mac-resume-20261001/11팀-MAP020-실행검수.md). 이전UI03후보미실행상태는당시이력이다.


## Mac 월드 폴백 마스킹 수정 완료 — 2026-10-01

위 25PASS1FAIL은 MAP020 당시 발견 이력이다. 본편 `_worldItemSkin` 두 줄을 현재 img.src 기준으로 수정하여 감사26/26·회귀9/9 통과, 쉬운판 전체 바이트 보존. 실제 요청 차단으로 정상/물리 폴백/양쪽 실패와 1회 마스크·120회 재사용을 확인하고 R키로 bag10→12 획득했다. 검은 사각형 결함은 해소, 34px 정밀 가독성과 신규 고유 연결은 별도다. [검수·한계·증거](../0마스터플랜/mac-resume-20261001/ITEM-폴백마스킹-검수.md).


### 2026-10-01 R 입력·GL·11팀 신규 후속 인수

후속 R 조사는 초단 자동화 이벤트 사이 update가 없었던 누락을 분리했다. 일반 길이 DOM 입력12/12획득, 물리 사용자 입력 결함 미입증으로 생산 수정 없음. onHitFireball은 실제 hurtE36회에서도 조회/투사체0인 미연결 상태이며 새8PASS를 효과 구현 완료로 세지 않는다. [관측 원자료·진단 범위·한계](../0마스터플랜/mac-resume-20261001/R-입력과-GL-후속검수.md)


### 2026-10-01 — QA-B01 월드 스킨 첫 가공 진단 / 후보 기각

기준 정상 전투의 실제 dagger_phys 256² 첫 처리99.1ms 중 getImageData98.4ms, 읽기→쓰기 구간0.4ms, put0.1ms를 분리했다. 실제src/currentSrc·아이템ID·캐시객체를 기록했으며 과거repeater/hammer86.7/136.5ms 귀속은 여전히 시간상관 후보다. 최초2D컨텍스트 willReadFrequently 힌트는 137원화/40,958,608바이트0diff·폴백/재사용을 통과하고 정상후보 ring2종 read각0.4ms였으나, 별도동일repeater 최초draw41.4ms/총47.9ms(기준총9.8ms)로 늘어 **기각·생산 한 줄 원복**했다. 전체개선율/QA-B01완료 아님. 실제로드이벤트가 따뜻한캐시의앞선마스크를무효화하는별도사례도보존. 전스킨준비0·최종게임SHA원본동일·쉬운판/저장/전투불변. 다음은첫draw와read를함께줄이는좁은후보검증. [진단·기각근거·원자료](../0마스터플랜/mac-resume-20261001/Mac-아이템스킨-첫가공-검수.md).


### 2026-10-01 — QA-B01 두 스킨 부트 준비 제한 채택

본편은 `dagger_phys`·`repeater_phys` 두 256² 스킨을 렌더러 전에 기존 캐시와 원래 마스킹으로 준비한다. 협력적 예산 250ms, 신규 요청 최대 2개, 최종 Canvas 명목 512KiB다. 기존 캐시는 건너뛰며 로드 뒤 취소·epoch·소스를 검사한다. 실패·시간 초과 시 원래 lazy/null/컷아웃 폴백을 유지한다. `willReadFrequently`는 적용하지 않았다.

실제 준비 37.6ms(가공 합2.8/max1.6), 별도 후속 검사 1.2ms로 합38.8ms는 기준34.4ms보다 크다. **보편적 총비용·FPS 개선은 미입증**이며 두 스킨의 첫 가공을 부트로 이동한 범위만 채택했다. v3 진단10.9/7.6ms와 실패한 앞 시도도 모두 보존했다. 실제 월드 fixture846호출에서 추가 마스크0·동일 Canvas, 524288바이트 비교0diff, R획득 가방10→12 및 저장 재로드를 확인했다. 정상 전투13.096초/7처치/자연사에서는 대상 드롭0이며 다른 스킨91/97.4/104.6ms가 남는다.

회귀38개·guard·6inline 검사 PASS. 기존22경로·PC/3333·VSCode를 보존했고 easy·패키지는 미적용이다. [구현·모든 시도·원자료·한계](../0마스터플랜/mac-resume-20261001/Mac-아이템스킨-두종-부트준비-검수.md).


### 2026-10-01 — ring_phys 사전 마스크 PNG 진단 완료 / 생산 미반영

원래24/72마스크 Canvas를그대로 PNG화한 반지 후보는256² 및34² RGBA·알파0diff, 실제34px월드fixture 각987회 표시·소스교체/404/null계약을 통과했다. 관측기 없는3쌍의 요청→최초제출 반환 중앙값은 기존9.9ms/PNG4.9ms로 유망하다. 실제 화면표시·GPU완료/FPS·자연전투97.4ms 해결을 뜻하지 않는다. 추가6쌍은 기존경로에만 세부관측기가 있어 단계귀속자료로 분리했고 재접속diff5→10도 기록했다.

파일은52,346→69,119바이트(+32.0%), 제작22.2ms, PNG최초제출 호출은오히려0.6–1.3ms로증가했다. 부트준비확장0·생산/easy/원화변경0. 기존컷아웃없음, 기존20/70+crop도구는비동등하여미사용. 새7+기존13회귀20PASS. 다음제안은 `_worldItemSkin`의물리ring분기만PNG선택하고기존폴백을유지하는한건이며 아직적용하지않았다. [출처·원자료·한계·최소제안](../0마스터플랜/mac-resume-20261001/Mac-반지-PNG-재사용-진단.md).


## 2026-10-01 PM-009 저장 이름 호환 최소 통합

기존 ITEM의 unique-save 후보를 root가 본편/easy에 각한줄 반영했다. 비어 있지 않은 문자열 uniqueId의 이름을 구형 무기명 수리가 덮지 않는다. 전체 저장함수 격리84시나리오 및 root 실제마이그레이션 회귀 PASS. 신규고유 드롭/효과/아트 등록은0이며 기존 ring Chrome 인수는 별도다. 원후보·실패는 원격d9dd5151에 보존했다. 실제사용자저장/시각/패키지는 남는다.


## 2026-10-01 PM-009 제안 정의 조회·유효성 구현

기존 ITEM 담당이22종 실데이터 모듈/조회/검증을 구현했고 root가 unique-item-project/definitions.mjs 및 기존 원화 감사의 소비 경로로 연결했다. 영구23회귀 통과, 문서변이3종 검출. 원화44개 존재와 별개로 활성0/채택0, 효과·번역·런타임 PNG 준비 미완료를110개 차단 사유로 표시한다. 새 드롭/효과/색/저장 정책은 미구현 유지. [독립 인수·한계](../0마스터플랜/mac-resume-20261001/vscode-dispatch/ITEM-definition-root-review.md).


## 2026-10-01 PM-009 롤·검토 화면 인수

정의 데이터는 동일 SHA의 definitions.js로 이동하여 기존 서버의 올바른 JavaScript MIME으로 소비한다. BALANCE22종/698정수 롤 모듈을 감사에 연결하고 UIUX22카드/44원화 화면을 실제3340에서 확인했다. 통합101PASS, 활성0/원화채택0. [최종 근거·한계](../0마스터플랜/mac-resume-20261001/vscode-dispatch/PM009-roll-review-root.md).


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

### 2026-10-02 검토 bootstrap 인수·브라우저 host 후속

root가 명시 reviewOnly 설치/해제 후보23그룹을 실제 port·양쪽 mkItem/저장/복원으로 재검수했다. 신규 D10 RNG1/복원0, proposal/inactive/runtimeReady=false, 원 property/타주체 교체 보존. 생산 drop/effect/DB 라우터 연결0. 현재3340의 .mjs 응답은 application/octet-stream이고 .js는 application/javascript여서 전이 .js+독립 host 구현을 기존 ITEM에 배정·실제 Read/Edit 확인했다. [인수 기록](../0마스터플랜/mac-resume-20261001/vscode-dispatch/FOUR-SUBMISSIONS-HELLRAY-20261002.md).

- 2026-10-02 추가: ITEM 검토 host root12검사 및 실제 독립 브라우저 import/생성/JSON복원/해제 인수. 초기 inline-style CSP 진단은 미해결, production 비활성 유지. 상세 `FOUR-SUBMISSIONS-HELLRAY-20261002.md` 및 팀 활용표 참조.


### 2026-10-02 U-D17 실제 소스 어댑터 검토 인수

`tools/team-followup-20261001/ITEM/d17-source-adapter-callsite.mjs`는 실제 `fireBlackStar` 종료와 원본 `activateSpikeTrap` 생성 함수를 감싸는 검토 호출 집합이다. 고정 오라·폭풍은 검증된 생성 지점에만 별도 등록하며 private WeakMap으로 실제 객체 출처를 유지한다. 기본 `enabled=false`, `reviewOnly=false`, `runtimeReady=false`이고 생산 호출부에는 연결하지 않았다.

| 항목 | 현재 계약·근거 |
|---|---|
| 선택 | 기존 600px 이내, 저장 정수 롤 1~3. 최근접·배열 순 동률 처리는 검토 정책이며 확정 채택 아님 |
| 이동 | 원 객체 identity와 좌표 외 필드 보존, 선택 객체 x/y 쓰기 가능 여부 선검사. 추적형·불명 출처·보스·U-D13 자식 등록 경로 없음 |
| 종료·초기화 | 실제 casting true→false 뒤 1회, 중복 종료 거부. clear로 출처/token 폐기. 생산 clear 호출부는 미연결 |
| 검수 | root 실제 소스 추출 13그룹 재실행 PASS, 공개 호출 집합의 비활성/활성·원함수 반환값·identity 별도 검사 PASS |
| 남은 게이트 | 실제 caller/clear 수명주기·D17 저장롤 공급·브라우저·적별 중첩 피해 검수. 효과·드롭·장착·경제·생산 적용 완료 아님 |

원본 함수/literal SHA와 범위는 `d17-source-adapter-result.md`, root 근거는 `outputs/team-review-20261002/production-integration/item-root-check.json`에 기록했다.

### 2026-10-02 D17 생명주기·저장롤 독립 검토 후보

`tools/team-followup-20261001/ITEM/d17-lifecycle-roll-candidate.mjs`는 기존 adapter byte를 보존하며 실제 reset/load/character 경계6종을 감싸는 명시 호출 집합을 제공한다. 기본 비활성/reviewOnly opt-in/runtimeReady=false, 생산 연결0. 실제 원문 경계 AST fixture 및 원 종료/생성 함수 기반28그룹 PASS. 원함수 SHA8개와 대역 범위는 `d17-lifecycle-roll-evidence.json` 및 result에 기록했다.

| 항목 | 검토 상태 |
|---|---|
| clear | stage/보스입장/사망/캐릭터/restore/load 경계 전후 clear, player·캐릭터 키·zone 배열 교체 시 stale 출처 폐기 |
| 저장롤 | UI-17/helmet, uniqueRoll version1/effectId U-D17/stat _uBlackZoneGather/unit count/storedValue 정수1~3 제안. unknown/invalid/missing 효과0, RNG/자동보충0 |
| 실제 미연결 | 현 game.html에 uniqueRoll/UI-17/_uBlackZoneGather 공급필드 없음. D17 저장스키마 채택·생성·생산 장착 소비 완료가 아님 |
| 보존 | zone identity·좌표 외 상태/이전 후보/초안 보존.600px/최근접·tie 검토정책·경제·실전 DPS 변경0 |
| 남은 게이트 | 실제 호출부 순차 연결·저장 공급·비동기 경계 직렬화·demo/test 추가 초기화·브라우저/중첩 실전검수 |

### 2026-10-02 D17 비동기 경계 결함 수정 후보

기존 lifecycle 후보의 pending 중 출처 재등록/이동 및 늦은 finally의 후속 출처 삭제를 실제 원 생성·종료 함수 fixture로 각각 FAIL 재현했다. 기존28 PASS 증거는 덮지 않고 결함 재현과 구분한다. 새 `d17-async-boundary-candidate.mjs`는 기존 adapter/저장롤 검증을 재사용하고 고유 pending token Set으로 진행중 검토 등록·이동만 차단한다. 원함수 호출·게임 동작은 즉시 유지하며 완료는 자기 token만 삭제한다. explicit clear는 진행중 token을 임의 취소하지 않는다.

| 항목 | 실제 검토 결과 |
|---|---|
| 회귀 | 새 async30검사 + 기존28검사 새 후보 대상 PASS, 기존 실패2건 별도 기록 |
| 중첩/전환 | A/B resolve/reject 정·역순, pending 생성/시전/등록0, clear/player/character/zones 교체 뒤 늦은 정착 확인 |
| 보존 | this/인수/원함수1회/동기 반환·예외 identity/최종 resolve·reject 값 보존; 기존19파일 SHA 동일 |
| 제한 | Promise identity 및 추가 microtask는 달라짐. then getter1회/then 호출1회 관찰 부작용 있음; never-settle은 검토효과 계속 차단, 원 게임은 유지 |
| 남은 게이트 | root 독립검수/백업 및 생산 caller/저장 공급/브라우저/실전 중첩. 미채택 스키마·기본 비활성/runtimeReady=false/드롭·밸런스 변경0 |

원문 SHA·기존 실패·새 PASS·보존 manifest는 소유 `d17-async-boundary-evidence.json`, 구현/한계는 `d17-async-boundary-result.md`에 기록했다. 앞선 초안·인수구역은 보존했다.

### 2026-10-02 CSP 초기 원자료 진단 인수

기존 browser-host의 sourceFile/줄·열·후속 이력 누락을 수정했다. 초기 외부 self 리스너와 누적 원자료를 추가했고 CSP 정책은 동일하다. 담당 완료와 root 별도 11+12=23그룹 Node PASS를 확인했다. 실제 브라우저/원주입자 귀속은 UNKNOWN이며 QA 전용 게이트로 남긴다. startup 실행 전 사건은 미관찰이다. 상세: `tools/team-followup-20261001/ITEM/browser-csp-cause-result.md`, 실제 검수: `browser-csp-cause-qa-plan.md`. 생산 게임/드롭/저장 스키마 변경0.
