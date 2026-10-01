# D17 생명주기·저장롤 검토 인계

28그룹 PASS: 2026-10-01T17:14:40.756Z. 생산 미연결, 기본 enabled=false/reviewOnly=false, runtimeReady=false. 이전 후보/증거 및 사용자 초안 변경0. 게임/UI/서버/빌드/인코딩/설치/Git/새세션 실행0.

## 구현 API와 저장 경계

`createD17LifecycleReview`는 기존 source adapter/callsite를 그대로 소비한다. getPlayer/getCharacterKey/getZones의 참조·캐릭터 키 변경을 검사해 오래된 private provenance를 폐기하고 현재 player용 호출 집합을 새로 만든다. 같은 player의 새 cast는 기존 어댑터 token으로 구분한다.

`createD17LifecycleCalls(options, originals)`는 실제 함수 initStage/_enterBossArena/_fallenResolve/_loadCharAtlas/dbRestore/startGameFromDB를 제공받아 명시적인 boundaries 호출 집합을 반환한다. 자동 설치나 생산 전역 교체 없음. 동기 반환값/예외를 보존하고 경계 진입/완료 양쪽 clear; Promise 완료/실패에도 clear한다. 비동기 wrapper는 원 Promise identity를 보장하지 않으며 원 내부 lexical 호출까지 대체하지 않는다. root/UIUX가 실제 호출 지점을 순차 연결해야 한다.

`inspectD17ReviewRoll(item)`은 existing definitions/roll-values에 근거한 **검토 저장 제안**을 읽는다. 실제 game.html에는 uniqueRoll/UI-17/_uBlackZoneGather 매칭이 없다. 생산 D17 공급이 있다고 주장하지 않으며 이 후보는 생성/굴림/세이브 수리 API가 아니다.

| 필드 | 후보 유효 계약 |
|---|---|
| identity/slot | own enumerable data uniqueId:UI-17, slot:helmet |
| 저장 컨테이너 | uniqueRoll plain record, version:1 |
| 효과/단위 | effectId:U-D17, stat:_uBlackZoneGather, unit:count |
| 값 | storedValue 정수1/2/3; 현 fromStoredValue 검증 재사용 |
| 실패 | unknown/invalid/missing → value:null → 기존 어댑터 효과0 |
| 변경 | RNG/누락값 보충/restore 재롤/아이템 수정0 |

unit:count/version1/uniqueRoll 이름은 D10 컨테이너 방식과 D17 count 롤 정의를 참고한 **미채택 D17 계약**. D10 fraction binding을 D17 유효값으로 받아들이지 않는다. 접근자 읽기0, own toJSON 거부. 같은 realm Object.prototype 또는 null prototype만 허용하므로 외부 realm 객체는 fail-closed; Proxy 보안 격리는 아님. 실제 소비는 호출 시 getEquippedHelmet에서 전달된 항목만 확인하고 가방이나 다른 장착 부위로 대체하지 않는다.

## 실제 소스 fixture

원함수 전체 SHA와 추출 경계 원문은 evidence.json에 기록. initStage/보스입장/사망의 실제 G._fireZones=[]; _loadCharAtlas의 _charIdx=idx; dbRestore의 INV.equipped=d.inv.equipped||...; startGameFromDB의 P=mkP()를 AST로 추출해 VM에서 실행했다. 함수 전체의 DB/이미지/전투/맵 부작용은 실행하지 않았다. mkP는 합성 새 player 대역이며 저장 DB·사용자 세이브 접근0. fireBlackStar/activateSpikeTrap은 전체 원문 실행, 시각/SFX 외부 의존만 fixture 대역이다.

검사: 1/2/3·무효7종·누락/오ID/오슬롯, getter 미실행, JSON 왕복/RNG0, identity·좌표 외 상태, 동일 객체 새 cast, 실제 reset3곳 stale provenance 폐기, 실제 캐릭터 assignment·새 player, 실제 restore equipped 경계, 참조/캐릭터 자동 clear, 실제 load player교체, 명시 lifecycle6포트, 비활성, 동기실패/비동기성공/실패 clear.

전체 source SHA c868284af349c996d42087e93eba47a10614d73cb8f55f4db5ae01dde89da31a. 이전 source adapter 증거와 전체파일은 다를 수 있으나 대상 black/trap 함수 SHA는 동일. 적용 전 함수별 SHA 재대조 필요. 최근접/tie는 기존 검토 정책 그대로이며 채택/경제/실전 DPS 변경0.

## 파일·의존성·남은 게이트

신규 소유 파일: d17-lifecycle-roll-receipt.json / candidate.mjs / check.mjs / evidence.json / result.md. ITEM_TEAM_MASTER에 본 작업만 추가 동기화. 공용 총괄/CHANGELOG 수정0. docs 전체 관련검색 및 저장 SSOT 확인.

로컬 의존: candidate→unique-item-project/definitions.js, roll-values.js→definitions.js, 기존 d17-source-adapter-callsite.mjs→candidate.mjs→d17-zone-selection-candidate.mjs. check→candidate 및 binding-save-harness.mjs(acorn, Node fs/vm/crypto/assert). 기존 의존 파일 쓰기0.

실행: `node tools/team-followup-20261001/ITEM/d17-lifecycle-roll-check.mjs`.

남은 게이트: 실제 D17 저장 스키마 채택/공급, 생산 lifecycle 내부 호출 연결, 캐릭터 키의 신뢰된 공급, await 진행 중 생성 호출의 직렬화, 추가 demo/테스트 초기화 호출부 적용 검토, 실브라우저 MIME/실전 중첩 피해. 경계 wrapper는 임의 동시 작업을 직렬화하지 않는다. 본 검사는 미연결 후보 인수 근거이며 생산 효과/G5 PASS가 아니다.
