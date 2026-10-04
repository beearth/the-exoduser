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

### 2026-10-02 U-D13 원본 출처·지연 생성 경계 검토 후보

실제 activateSpikeTrap/hurtE 전체 및 G._fireZones 전체22,471byte 조건문을 AST 추출 실행한19그룹 Node PASS. 루프 중 사망 뒤 즉시 push한 합성 object는 같은 tick t/timer1·RNG9회를 관측했고, 압축 완료 뒤 callback append는 t/timer0·RNG8회였다. 이는 순회/타이머 부작용 재현이며 자식 틱피해·실전 DPS/성능 PASS가 아니다.

| 항목 | 검토 계약 |
|---|---|
| 출처 | private WeakMap의 original/fusion/child 명시 포트, actual _pillarSpike:true 원본 등록 거부. 생산 owner/출처 태그 추가0 |
| 큐 | 실제 spikeTrap DOT 호출1개를 인수식 그대로 감싼 미적용 fixture. 원본 최종 사망 에지만 기록, 동기 전체 압축 성공 뒤 FIFO callback. 원본 시전당1은 D절 그대로 |
| 보존 | payload 없는 후보 vs 원문에서 피해·배열 identity/순서·부가 상태/효과 호출·RNG 동일, 생산 활성/새 child payload0 |
| 대역 | 일반 적·중립 어픽스·고정RNG 및 query/SFX/VFX/loot/XP/potion/checkRooms 대역. actual 부활/쉴드불발·전환 대역 stale 폐기도 검수 |
| 미결 | 자식 피해/슬로우/출혈 구현·전역 cap·겹침·저장롤 스키마·실제 전환/연쇄/보스·성능·생산 연결 미확정 |

소유 근거 `d13-deferred-contract-evidence.json`에 원블록/호출부 원문과4함수 SHA, 재실행 `d13-deferred-contract-check.mjs`, 한계 `d13-deferred-contract-result.md`. D17/CSP 반복0, 타팀 checkout/초안 보존. root 독립검수·백업 대기다.

### 2026-10-02 D13 callback 경계 root 인수

첫 callback의 clear()/배열 교체 뒤 두 번째 stale callback이 실행되는 두 반례를 root가 실제 후보 import로 독립 재현했다. callback마다 epoch·배열 identity를 재검사하고 drain 재진입을 막는 담당 최소 수정 후 두 반례는 callbacks 2→1이다. 담당 13+기존19 검사를 root도 재실행해 32 PASS를 확인했다. 전환 뒤 신규 등록 보존, 원 피해·RNG·기본 비활성은 유지한다. 생산 연결0, 자식 수치/cap/중첩/저장 계약 및 native 검수는 여전히 미결이다. 근거: outputs/team-review-20261002/four-candidate-acceptance/item-root-independent.json, item-root-callback13.json, item-root-adjacent19.json.

### 2026-10-02 D13 데이터 공급 대표 경로 검수 인수 — 생산 미연결

`continuous/ITEM`의 새 검수는 명시 신규 D13·일반 아이템·로드된 UI-13 missing binding의 **3입력 / 5경로 / 5주장 그룹 PASS, 최종 exit0·실패0**다. 검수 근거를 인수하며 생성·장착 효과·저장 스키마를 채택하지 않는다. 기존 callback32/caller22/data12+JSON1/D10/698 완료검사는 이번에 재실행하거나 새 수치에 합산하지 않았다.

| 항목 / 적용 위치 | 정확한 검수 범위와 현재 상태 |
|---|---|
| 대표 source 경로 | `game.html`의 rollDrop(30760)→mkItem(15177)→worldItems→R pickupItem(15675)→INV.bag→equipItem(15571)→INV.equipped.belt→dbSave inv 식(3537)→메모리 JSON→dbRestore bag/equipped 대입(3615/3616)→binding 읽기 후보. 줄번호는 제출 당시 source snapshot 기준 |
| 현재 공급 누락 | mkItem의 rarity>=5는 기존 UNIQUE_SPECIAL만 공급한다. UI-13/U-D13/uniqueRoll/_uTrapOffshoot 생성 및 rollDrop D13 선택 resolver·장착 D13 효과 소비는 미연결. rarity5/belt 또는 uniqueId만으로 D13 선택이나 새 생성 출처를 증명하지 못함 |
| 신규 공급 제안 | 새 mkItem 반환 직후 world item 공개 전에 신뢰된 caller가 UI-13 / U-D13 / 번지는 뿌리의 띠 / belt와 이미 결정한 정수 rawPercent20~40을 명시 공급하는 계약 후보. 실제 caller 연결 완료가 아니며 mkItem factory는 합성 base 반환 대역 |
| 검토 shape | `uniqueRoll:{version:1,effectId:'U-D13',stat:'_uTrapOffshoot',unit:'fraction',storedValue:0.30}`. rawPercent÷100으로 .20~.40, 대표값30→.30. raw·직접 stat 필드 중복 저장0이며 이 shape는 미채택 |
| 실제 메모리 실행 | pickupItem/equipItem 전체 source 함수를 empty belt·강화 없음·crystal 이전 없음 조건으로 VM 실행. UI/음향/1×1 grid/recalcSt/save는 대역. 정상 drop 확률·필터·획득 UI와 mkItem/rollDrop 전체 실행은 없음 |
| 저장·복원 경계 | dbSave 전체가 아니라 inv 식, dbRestore 전체가 아니라 bag/equipped 두 대입식만 실행하고 native JSON stringify/parse로 운반. adapter 이전 중첩 입력 보존과 JSON 이후 로드 객체 identity를 각각 확인; JSON 전후 동일 참조를 주장하지 않음 |
| 5그룹 PASS | 생산 공급·소비 누락 확인 / 명시 factory·선택 후보의 기존 중첩값 보존 / 일반 아이템 source 동등 pass-through / loaded missing의 missing 유지·수리 및 fresh 추론0 / 제한된 복원·읽기의 생성·추가 metadata0 |
| 활성 상태 | `schemaAdopted=false`, `enabled=false`, `runtimeReady=false`, `productionApplied=false`. 검토 consumer는 canonical 값 반환만 하며 실제 효과 소비가 아님 |
| 미결 Gate | 데이터 공급 계약 인수 뒤 실제 caller·source lifecycle/payload·저장 공급·전투 소비 연결을 순차 검수. child 피해20~40%·반경150px·지속180f·원 시전당1의 구현, 전역 cap·겹침은 미결 |

RNG throw guard 미발동과 restoreGeneration/RNG/repair0은 위 추출식·후보 경로에만 해당하며 실제 소켓/affix 마이그레이션 전체 RNG0 근거가 아니다. `fromStoredValue`는 원본 읽기만 했으며 import0, 완전 schema 감사나 생산 소비 완료가 아니다. 실제 DB/API·사용자 세이브·공유 STORAGE·브라우저·전투·시각·GPU·패키지 검수는 수행하지 않았다.

검수 main snapshot SHA-256 `6c77ec6f571f4de9cb199a2ac425eb3f0450205bcf6f1d883ac8d13135ac4b43`; easy SHA-256 `c40ea16180305a3d0043d1c9dfa9091096820e589e537a893d5d28fff56528d0`는 보존 관측만이며 easy 경로 실행 근거가 아니다. 원문/대역/수치 근거: [담당 결과](../../tools/team-followup-20261002/continuous/ITEM/result.md), [evidence](../../tools/team-followup-20261002/continuous/ITEM/evidence.json). 이번 문서 보강은 기존 원문을 보존한 추가 기록이며 생산 적용0이다.


## 2026-10-04 ITEM-0038 색상·재질 후보 원자료 보존

0038-MATERIAL/fa1ace 완료 turn `01a1045d-f397-7f42-a120-059fe94925d8`, final `msg_0dc2542c5744bc89016ac1a16b3e0087d0a44a2ee8877e3ee0`, 2026-10-04 09:44:41 KST. 기존 원화 유지·색상 다양화 직접 사용자 요청을 따른 22행 HEX와 UI-08 7영역 지시안을 문서에 보존했다. 제출 후보 보존만 인수하며 실제 픽셀 적용·아트 채택·게임 등록·native 시각/청취 인수0. 원화44장·생산 코드·등급 식별색 불변; codeEpoch60 및 CH1-1 같은후보6단계 미인수 유지. 추가 완료0044-MATERIAL/ac8757 UI-04 6영역 지시안·원화1193169B/64dc6276e9da33c424ea4a7d643310c22bda5f78e06eb5319104125d44fbe21d도 같은 계약에 미채택 보존. 독립 영역 마스크·반사 HEX 미제출 유지. Codex7 소유0049-MATERIAL UI-02 새 turn·실제 원화 도구 확인/root 중복송신0. 두 오더 담당 STATE/LOG·타인WIP 보존.

[정확한 색상표·영역·원화 핀·남은 Gate](UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-기존-원화-보존22종-색상-다양화-후보-원자료-인수).


## 2026-10-04 UI-02 영역안·UI-08 붉은색 시안 미채택 보존

0049-MATERIAL/5f8438 UI-02 7영역 지시안은 공식 완료ID·final·1163525B/SHA로 후보 미채택 보존했다. root UI-08 내장 이미지 편집1회로 붉은 계열 별도 시안1장을 생성·checkout 검토 캐시에 복사했다. 1254×1254/1333662B/SHA d89150081449c4e2cad5fd5cebe9eca5396556da42760d27529fa27cc3d05d3a. 원본44장 불변. 일부 세부 선·명암 및 출력 규격 차이로 VISUAL VERDICT: RETOUCH; 실제 슬롯64/160/34/96px·알파·실게임/native·청취 미검수. 원본 교체·게임 연결·아트 최종채택0, codeEpoch60·CH1-1 같은후보6단계 미인수 유지. UI-10 후속은 Codex7 담당 소유/root 중복송신0.

[정확한 완료 핀·시안 SHA·RETOUCH 사유·남은 Gate](UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-02-영역안-보존ui-08-재색칠-미채택-시안).


## 2026-10-04 UI-04 빙청색 시안·새 재질 후보 보존

UI-08 붉은색 시안에 대한 사용자의 직접 “그래 좋네” 응답을 색상 방향의 긍정 응답으로 보존했다. UI-04 빙청색 별도 시안1장이 추가돼 root 시안은 누적2장; 1254×1254/1776096B/SHA 8229330786ce01c72ab8a9cc90cf7b906c381ae658b95e038c23968f715948fa. 출력 규격·미세 세부 차이로 VISUAL VERDICT: RETOUCH, 64/160/34/96px·알파·실게임/native 시각/청취 미검수. 원화44장·생산 코드 불변, 원본 교체·게임 연결·최종 아트 채택0. 추가 공식 완료0054/e7b223 UI-10 7영역·0059/811b4a UI-12 8영역 지시안은 정확 turn/final·bytes/SHA로 후보 미채택 보존했다. Codex7 후속 소유/root 중복송신0.

[원화/시안 핀·직접 응답·RETOUCH 사유·신규 공식 완료](UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-04-빙청색-시안ui-08-색상-방향-응답).


## 2026-10-04 UI-02 녹청·라임 시안 및0104·0109 보존

UI-02 별도 녹청/라임 시안1장을 생성해 root 시안은 누적3장이다. 1254×1254/1604926B/SHA `a98f0330c4d4f2d47b8c5e937ee9231436b22b8264407adf1cd6c86abeb93ade`. 뱀 머리2개·보석3개 배치를 확인했으나 미세 묘사·규격 차이로 VISUAL VERDICT: RETOUCH. 64/160/34/96px·알파·실게임/native·청취 미검수. 영역별 색 배정은 root 시안 선택이며 담당 미제출 마스크/상세값 인수로 확대하지 않는다. 원화44장·생산 코드 불변, 원본 교체·게임 연결·아트 최종채택0; codeEpoch60·CH1-1 같은후보6단계 미인수 유지. 공식 완료0104/974fb2 UI-06 6영역 및0109/f51c33 UI-03 8영역은 정확 turn/final·원화 bytes/SHA로 후보 미채택 원자료 보존했다. 담당 파일/이미지/픽셀0, Codex7 후속 소유/root 중복 송신0.

[시안·원화 핀·RETOUCH·공식 완료 원자료](UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-02-녹청라임-시안-및01040109-원자료-보존).


## 2026-10-04 UI-10 흑철·구리 시안 수정 및0114·0119 보존

UI-10 흑철/구리/주황 시안을 생성하고 v1의 원본에 없던 목 아래 장식을 수정1회로 제거했다. v1/v2 모두 보존, v2 1961758B/1254×1254/SHA `39d273796b1ee720ed8b93d1d1ccb4ffd5b75bc011f3d658625f61d8ce1f3770`. 미세 균열·판금 선·발광 폭/규격 차이가 남아 VISUAL VERDICT: RETOUCH; 실제64/160/34/96px·알파·실게임/native·청취 미검수. root 시안 대상4종/생성 결과5장, 원화44장·생산 코드 불변, 원본 교체·최종 아트 채택·게임 연결0. 공식 완료0114/076ae7 UI-01 및0119/b43503 UI-05 각각8영역 지시안을 정확 turn/final·원화 bytes/SHA로 후보 미채택 보존했다. 담당 파일/이미지/픽셀0, Codex7 후속 소유/root 중복 송신0. codeEpoch60·CH1-1 같은후보6단계 미인수 유지.

[v1 결함·v2 수정·시안/원화 핀·새 공식 완료](UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-10-흑철구리주황-시안-및01140119-원자료-보존).


## 2026-10-04 UI-12 뼛빛·금색 시안 및0124 보존

UI-12 견갑의 뼛빛/금색/따뜻한 백색 시안을 생성·보존했다. 1603138B/1254×1254/SHA `5fabad3395749a38056257accec9dd871748faac34455c5813bdabd3edd525a7`; 비대칭 판2개·종1개/둥근 추 구도 확인, 미세 질감·문양 경계·규격 차이로 VISUAL VERDICT: RETOUCH. root 시안 대상5종/생성 결과6장, 원화44장·생산 코드 불변·게임 연결/최종 아트 채택0. 로컬 정적34/64/96/160px 비교 HTML을 준비했으나 IAB URL 보안 정책이 file 프로토콜 열기를 거절해 실제 축소 검토는 미완료다. 우회 시도0·게임/native/청취 인수0. 공식 완료0124/8f0895 UI-07 8영역 지시안은 정확 turn/final·원화1147357B/SHA로 후보 미채택 보존했다. Codex7 후속 소유/root 중복 송신0, codeEpoch60·CH1-1 같은후보6단계 미인수 유지.

[시안/원화 핀·보안 정책 거절·공식 완료 원자료](UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-12-뼛빛금색-시안-및0124-원자료-보존).


## 2026-10-04 UI-06 황동·녹청·민트 시안 및0130 보존

UI-06의 황동/녹청/민트 시안을 생성·보존했다. 1274506B/1254×1254/SHA `439a721d5aa8249df1cd42dcbd595659fceb80e1c45dd095d86e9f05c081b35a`; 상단이 끊어진 고리1개·표식3개·부유 수정1개 배치 확인, 수정면·표면·발광 폭/규격 차이로 VISUAL VERDICT: RETOUCH. root 시안 대상6종/생성 결과7장, 원화44장·생산 코드 불변·게임 연결/최종 아트 채택0. 실제34/64/96/160px·알파·실게임/native·청취 미검수. 공식 완료0130/cd6cb8 UI-09 8영역 지시안은 정확 turn/final·원화1103563B/SHA로 후보 미채택 보존했다. Codex7 후속 소유/root 중복 송신0, codeEpoch60·CH1-1 같은후보6단계 미인수 유지.

[시안/원화 핀·RETOUCH 사유·공식 완료 원자료](UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-06-황동녹청민트-시안-및0130-원자료-보존).


## 2026-10-04 UI-03 은회색·황동·금빛 시안 및0135 보존

UI-03 은회색/황동/금빛 별도 시안을 생성·보존했다. 1476976B/1254×1254/SHA `ae4d2801d7ec0a4542a639b89d854c6d44f8f3c40294cbcf05fcc6e152d460de`; 대각 장검·중앙 프리즘·갈고리 가드/빈 공간 구도 확인, 미세 면/선·발광 폭/규격 차이로 VISUAL VERDICT: RETOUCH. root 시안 대상7종/생성 결과8장, 원화44장·생산 코드 불변·게임 연결/최종 아트 채택0. 실제34/64/96/160px·알파·실게임/native·청취 미검수. 공식 완료0135/840789 UI-11 8영역 지시안은 정확 turn/final·원화983582B/SHA로 후보 미채택 보존했다. Codex7 hb0140 완료 인계·UI-13 후속 accepted 확인, 새turn/실tool/완료 별도 pending. root 중복 송신0, codeEpoch60·CH1-1 같은후보6단계 미인수 유지.

[시안/원화 핀·RETOUCH 사유·공식 완료 원자료](UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-03-은회색황동금빛-시안-및0135-원자료-보존).


## 2026-10-04 UI-01 청록·은색·민트 시안 및0140·0145 보존

UI-01 청록 천/은색 안감/민트 시안을 생성·보존했다. 1705457B/1254×1254/SHA `b091ed41c31430557f0fd0be7b0e33c52c051fdcbaf82b61b5d8894bf1555967`; 후드·찢어진 꼬리2개·브로치2개/사슬 구도 확인, 안감 반사 폭/밝기·가장자리/봉제선·규격 차이로 VISUAL VERDICT: RETOUCH. root 시안 대상8종/생성 결과9장, 원화44장·생산 코드 불변·게임 연결/최종 아트 채택0. 실제34/64/96/160px·알파·실게임/native·청취 미검수. 공식 완료0140/89347a UI-13 7영역 및0145/e29245 UI-14 8영역 지시안을 정확 turn/final·원화 bytes/SHA로 후보 미채택 보존했다. Codex7 후속 소유/root 중복 송신0, Claude8 상태 유지, codeEpoch60·CH1-1 같은후보6단계 미인수 유지.

[시안/원화 핀·RETOUCH 사유·공식 완료 원자료](UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-01-청록은색민트-시안-및01400145-원자료-보존).


## 2026-10-04 UI-05 남색·구리·금빛 시안 및0150 보존

UI-05 남색 가죽/구리 판금/금빛 시안을 생성·보존했다. 1753611B/1254×1254/SHA `27e24033ce973afd5b6316985a2845f19c6d9eeb247ddcce1ebbd2475158baa5`; 비대칭 장화 한 쌍·열린 굽2개 구도 확인, 주름/조각선·발광 폭/규격 차이와 구리 하이라이트의 금색 근접으로 VISUAL VERDICT: RETOUCH. root 시안 대상9종/생성 결과10장, 원화44장·생산 코드 불변·게임 연결/최종 아트 채택0. 실제34/64/96/160px·알파·실게임/native·청취 미검수. 공식 완료0150/4b5bea UI-15 8영역 지시안을 정확 turn/final·원화1113041B/SHA로 후보 미채택 보존했다. Codex7 후속 소유/root 중복 송신0, Claude8 상태 유지, codeEpoch60·CH1-1 같은후보6단계 미인수 유지.

[시안/원화 핀·RETOUCH 사유·공식 완료 원자료](UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-05-남색구리금빛-시안-및0150-원자료-보존).


## 2026-10-04 UI-07 갈색·철·호박색 시안 및0155 보존

UI-07 갈색 가죽/회색 철/호박색 시안을 생성·보존했다. 1623780B/1254×1254/SHA `9fc5b0f2cd643efd33702e0f5330b3856a62aaacdbaac59597d1ea17cef37195`; 띠1개·고리3개·사슬/추3개·보석2개 구도와 비발광 금속 추 확인, 가죽/봉제·이음/면·홈 폭/규격 차이로 VISUAL VERDICT: RETOUCH. root 시안 대상10종/생성 결과11장, 원화44장·생산 코드 불변·게임 연결/최종 아트 채택0. 실제34/64/96/160px·알파·실게임/native·청취 미검수. 공식 완료0155/f21f9d UI-16 8영역 지시안을 정확 turn/final·원화1255134B/SHA로 후보 미채택 보존했다. Codex7 후속 소유/root 중복 송신0, Claude8 상태 유지, codeEpoch60·CH1-1 같은후보6단계 미인수 유지.

[시안/원화 핀·RETOUCH 사유·공식 완료 원자료](UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-07-갈색철호박색-시안-및0155-원자료-보존).


## 2026-10-04 UI-09 구리·뼛빛·청록 시안 및0200 보존

UI-09 구리 외피/뼛빛 패딩/청록 시안을 생성·보존했다. 1606884B/1254×1254/SHA `923ecc90c37c4e4062aff2004f7ac67c628e0c330624516d62a4468eb4795cb3`; 두 반쪽·전극 연결·하단 틈 구도 확인, 패딩/금속 세부·아크/홈 폭과 곡선/규격 차이로 VISUAL VERDICT: RETOUCH. root 시안 대상11종/생성 결과12장, 원화44장·생산 코드 불변·게임 연결/최종 아트 채택0. 실제34/64/96/160px·알파·실게임/native·청취 미검수. 공식 완료0200/a27137 UI-17 7영역 지시안을 정확 turn/final·원화1125666B/SHA로 후보 미채택 보존했다. UI-17 공허 보라는 국소 방향이며 전체 보라 tint로 확대하지 않는다. Codex7 후속 소유/root 중복 송신0, Claude8 상태 유지, codeEpoch60·CH1-1 같은후보6단계 미인수 유지.

[시안/원화 핀·RETOUCH 사유·공식 완료 원자료](UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-09-구리뼛빛청록-시안-및0200-원자료-보존).


## 2026-10-04 UI-11 은회색·적갈색·금빛 시안 및0205 보존

UI-11 은회색 금속/적갈색 가죽/금빛 시안을 생성·보존했다. 1394069B/1254×1254/SHA `67949808aee1075c47d28a674bed7f6bfafecd1b2c85aab671d85c7dc9bc07a9`; 비대칭 망치·사슬·중앙 수정과 비발광 뼈 구도 확인, 수정/고정 장식·감김/이음·발광 폭/규격 차이로 VISUAL VERDICT: RETOUCH. root 시안 대상12종(UI-01~12)/생성 결과13장, UI-13~22 시안 미생성. 원화44장·생산 코드 불변·게임 연결/최종 아트 채택0. 실제34/64/96/160px·알파·실게임/native·청취 미검수. 공식 완료0205/4be804 UI-18 8영역 지시안을 정확 turn/final·원화1080016B/SHA로 후보 미채택 보존했다. Codex7 후속 소유/root 중복 송신0, Claude8 상태 유지, codeEpoch60·CH1-1 같은후보6단계 미인수 유지.

[시안/원화 핀·RETOUCH 사유·공식 완료 원자료](UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-11-은회색적갈색금빛-시안-및0205-원자료-보존).


## 2026-10-04 UI-13 올리브·갈색·녹색 시안 및0210 보존

UI-13 올리브 뿌리/갈색 가죽/녹색 시안을 생성·보존했다. 1733648B/1254×1254/SHA `5b661e783ae320874ea9c42919f9169423b1399185cc6064268ed6e0aa85d9a7`; 타원 띠·중앙 버클·좌우 열린 뿌리 고리/끝 갈래 구도 확인, 가죽결/봉제·나무 홈/얇은 가지·발광 폭/규격 차이로 VISUAL VERDICT: RETOUCH. root 시안 대상13종(UI-01~13)/생성 결과14장, UI-14~22 시안 미생성. 원화44장·생산 코드 불변·게임 연결/최종 아트 채택0. 실제34/64/96/160px·알파·실게임/native·청취 미검수. 공식 완료0210/5923aa UI-19 8영역 지시안을 정확 turn/final·원화1331348B/SHA로 후보 미채택 보존했다. Codex7 hb0215 UI-20 후속 accepted 인계는 새turn/실tool/완료 pending으로 구분한다. root 중복 송신0, codeEpoch60·CH1-1 같은후보6단계 미인수 유지.

[시안/원화 핀·RETOUCH 사유·공식 완료 원자료](UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-13-올리브갈색녹색-시안-및0210-원자료-보존).


## 2026-10-04 UI-14 청록·은색·청색 시안 및0215·0220 보존

UI-14 청록 나선 금속/은색 연결부/청색 시안을 생성·보존했다. 1611306B/1254×1254/SHA `c9edb0e6317fea1c3996d1bb4d1d1a61aa2a7cc9fa58d396a3aedfc20933337e`; 목줄·삼각 연결부·고리·나선/어두운 코어 구도 확인, 금속 질감/밝기·칼날 세부·홈 폭/코어 반사·규격 차이로 VISUAL VERDICT: RETOUCH. root 시안 대상14종(UI-01~14)/생성 결과15장, UI-15~22 시안 미생성. 원화44장·생산 코드 불변·게임 연결/최종 아트 채택0. 실제34/64/96/160px·알파·실게임/native·청취 미검수. 공식 완료0215/b841a1 UI-20 및0220/844a37 UI-21 각각8영역 지시안을 정확 turn/final·원화 bytes/SHA와 관측 완료문으로 후보 미채택 보존했다. 미공개 RAM 상세·독립 HEX·마스크는 미조회/미인수. Codex7 후속 소유/root 중복 송신0, Claude8 상태 유지. codeEpoch60·CH1-1 같은후보6단계 미인수 유지, 새 해제 근거 없는 native 입력/빌드 반복0.

[시안/원화 핀·RETOUCH 사유·공식 완료 원자료](UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-14-청록은색청색-시안-및02150220-원자료-보존).


## 2026-10-04 UI-15 황갈색·회녹색·황록색 시안 및0225 보존

UI-15 황갈색 목재/회녹색 금속/황록색 독액 시안을 생성·보존했다. 1550361B/1254×1254/SHA `91090ea989344ba9d008423ad6b229c19837aa725d2aaec02204c9ecdbe6778d`; 대각 석궁·곡선 활/시위·실린더/호스·방아쇠울·감긴 손잡이 구도 확인, 화살촉/금속 세부·나무결/감김·실린더 반사/호스 밝기·규격 차이로 VISUAL VERDICT: RETOUCH. root 시안 대상15종(UI-01~15)/생성 결과16장, UI-16~22 시안 미생성. 원화44장·생산 코드 불변·게임 연결/최종 아트 채택0. 실제34/64/96/160px·알파·실게임/native·청취 미검수. 공식 완료0225/1e14aa UI-22 8영역 지시안을 정확 turn/final·원화987117B/SHA로 후보 미채택 보존했다. Codex7 후속 소유/root 중복 송신0, Claude8 상태 유지. codeEpoch60·CH1-1 같은후보6단계 미인수 유지, 새 해제 근거 없는 native 입력/빌드 반복0.

[시안/원화 핀·RETOUCH 사유·공식 완료 원자료](UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-15-황갈색회녹색황록색-시안-및0225-원자료-보존).


## 2026-10-04 ITEM0230 실제 아이콘 연결 부재 보존

공식 완료 `SUPERVISOR-ITEM-0230-ICON-BINDING/1c743d`의 실제 소스·완료문을 보존했다. Main/Easy 공통 `_itemSkin`·`_worldItemSkin` caller는 있으나 UI-01~22 원화 선택 consumer와 정의 레지스트리 연결은 없다. 별도 정의표 전종 `accepted=false/runtimePath=null/enabled=false` 유지. 이 TASK 범위의 미제출 승인작업 없음·코드 후보0·적용0·테스트0이며 채택 투명 파생본/확정 경로/게임 등록/실제 binding이 남은 의존성이다. 문서 §1 옛 행 번호·보라 방향은 2026-10-01 조사 이력으로 명시하고 현행 codeEpoch60 아이콘 접점 표를 추가했다. 시안15종/16장·원화44장·생산 코드 불변, 실게임/native6단계·시각/청취 미인수 유지. root 중복 TASK0.

[정확한 현행 호출부·소스 핀·미적용 의존성](UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-item0230-실제-아이콘-연결-부재와-후보-범위-종료).
