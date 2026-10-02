# ITEM — D13 저장 데이터 VM 경계 검토

검토 우선순위는 **신뢰된 새 생성/저장/장착 소비 → source lifecycle/payload → runtime**이다. 이번 검토 shape는 VM 안의 미채택 제안이며 생산 연결0이다. proposal, runtimeReady=false, enabled=false, schemaAdopted=false, productionApplied=false를 유지한다. **source/data fixture PASS ≠ runtime/visual PASS.**

## 실제 정의와 검토 schema

| id·한글명/필드 | 현행 정의·검토 계약 | 적용/한계 |
|---|---|---|
| UI-13 / U-D13 | 번지는 뿌리의 띠, belt, _uTrapOffshoot | 실제 lookup 확인; enabled=false·effectStatus=unimplemented·active lookup=null |
| uniqueRoll | {version:1,effectId:'U-D13',stat:'_uTrapOffshoot',unit:'fraction',storedValue} | checks 내부 VM에서만 정의, schema 채택0 |
| 롤/단위 | 정수20~40%, 하20~26/중27~33/상34~40; 정규 저장0.20~0.40 | fromStoredValue('UI-13',stored) 재사용. raw/100 === stored 확인. raw 중복 저장0·기본값 보충0 |
| 입력·읽기 | own enumerable data 필드, plain record | D10 plainRecord/ownData 방식 참고; get 함수 실행0 |
| restore | 전달 객체 그대로 반환 | 생성/수리/재롤0; missing/legacy/invalid를 구분하며 변환0 |

lookup 전 실제 source SHA를 확보했다. definitions.js 3f04bcc5ac90b039454f32dc9323e60bbe44dda27be7fd439a97633d1f25118a; roll-values.js 103d0460c738c117840586780eaaed7be7ebe0aba61fa50464db9d004b094975; binding-d10.mjs b16bb29314e64cc2161f4eadd921678af2303a164e95080fdf879042fa4303f1. 상세 lookup 객체와 모두의 최종 동일 SHA는 evidence에 있다.

## 최소 입력별 결과

| 입력 | 판정 | 저장값/읽기 raw | identity·중첩 보존 | 수리/RNG/getter/변이 |
|---|---|---|---|---|
| 하한0.20 | valid PASS | 0.2 / 20 | 같은 객체/descriptor 유지 | 0/0/0/0 |
| 상한0.40 | valid PASS | 0.4 / 40 | 같은 객체/descriptor 유지 | 0/0/0/0 |
| UI-13 binding 누락 | missing PASS | null / null | 같은 객체/descriptor 유지 | 0/0/0/0 |
| uniqueId 없는 legacy | legacy PASS | null / null | 같은 객체/descriptor 유지 | 0/0/0/0 |
| 잘못된 armor 슬롯 | invalid PASS | null / null | 같은 객체/descriptor 유지 | 0/0/0/0 |
| 잘못된 effectId | invalid PASS | null / null | 같은 객체/descriptor 유지 | 0/0/0/0 |
| 잘못된 stat | invalid PASS | null / null | 같은 객체/descriptor 유지 | 0/0/0/0 |
| 잘못된 percent 단위 | invalid PASS | null / null | 같은 객체/descriptor 유지 | 0/0/0/0 |
| 잘못된 version2 | invalid PASS | null / null | 같은 객체/descriptor 유지 | 0/0/0/0 |
| 비정규0.205 | invalid PASS | null / null | 같은 객체/descriptor 유지 | 0/0/0/0 |
| 문자열0.20 | invalid PASS | null / null | 같은 객체/descriptor 유지 | 0/0/0/0 |
| own enumerable getter1개 | invalid PASS | null / null | 같은 객체/descriptor 유지 | 0/0/0/0 |

12입력 모두 PASS. 원 입력/uniqueRoll 참조·각 property descriptor 전후 동일이다. getter1개는 enumerable own이지만 value descriptor가 없어 invalid이며 실행0이다. valid plain JSON1개를 VM에서 host로 딱1회 왕복했고 uniqueId/slot/version/effect/stat/unit/0.20 내용 동일, raw 저장 없음, host 객체를 VM restore에 전달한 뒤 같은 객체 반환을 확인했다. JSON parse 결과가 원 입력과 같은 객체라는 뜻은 아니다.

D10의 cross-realm native Object prototype 판정 방식을 VM 안에 참고했다. same/native Object prototype 또는 null prototype의 plain record만 허용하며 이번 host→VM plain JSON 사례만 확인했다. 임의realm/Proxy/직렬화hook 실행 격리 보장이나 보안감사로 확대하지 않는다. getter fixture는 JSON.stringify하지 않았다. 생성/굴림/전투/저장함수와 기존 D13 callback은 호출하지 않았다.

## 범위·결함·후속 Gate

| 구분 | 결과/근거 | 미검수·다음 인수 |
|---|---|---|
| 실제 source 소비 | 허용한 definitions.js/roll-values.js pure data 모듈만 import; fromStoredValue는 정규 저장 검증 | 신규 item 생성의 출처 보장, 실제 장착/세이브 소비 |
| 후보 VM | 지정12입력＋JSON왕복1 PASS; RNG/getter/수리/변이0 | schema 미채택·productionApplied=false. missing/legacy 자동 보충 없음 |
| 보존 | 생산5파일·기존 후보/완료산출/데이터·immutable TASK 포함 12경로 SHA 동일 | 타팀 WIP 전체를 검수했다는 주장은 하지 않음 |
| 기존 완료 | callback32·caller 지도22·D10·698롤 감사 반복0 | child payload·cap·겹침·비동기 clear/source 연결은 별도 |
| 실제 제품 | 서버/HTTP/게임/앱/UI/빌드/실저장0 | 브라우저/전환·연쇄·보스/실전성능/visual·패키지 Gate |

첫 Node 명령은 보고서 template literal의 backtick 때문에 module parse에서 실패했고 VM 실행0이었다. 본인 검수기 문자열만 수정한 뒤 VM 입력12/JSON1을 통과했다. VM 데이터 결함0이며 준비 단계 문법 실패1을 evidence에 보존했다. 검토 shape와 모듈 자체의 전체 보안·완전한 schema 검사를 입증한 것은 아니다. rawReadOnly는 인수 결과에만 기록하며 아이템/uniqueRoll에 넣지 않는다.

## docs 동기화 인계안

코드 산출 후 docs 전체 관련 키워드 rg: 89행/27파일. 경로 목록/명령/출력 SHA는 evidence.docsSearch에 보존했다. 공유 docs 수정0이며 총괄에게 다음 문장을 인계한다.

| 대상 | 정확한 추가 기록안 | 유지사항 |
|---|---|---|
| ITEM_TEAM_MASTER D13 말미 | “D13 data-only binding VM 검토: UI-13/belt·fraction0.20~0.40, 최소12입력＋JSON1왕복 PASS. getter/RNG/수리/변이0, schema 미채택·생산연결0. 상세 codex-half/ITEM/result.md.” | 기존callback32/지도22와 별도, 구현완료로 변경0 |
| 저장SSOT D13 검토 구역 | “uniqueRoll version1/effectId U-D13/stat _uTrapOffshoot/unit fraction은 VM 검토 shape. restore 동일 객체 유지; missing/legacy/invalid 보충/재롤0. 생산 저장 schema 채택 아님.” | 기존 INV 통짜 저장·구세이브 migration 불변 |
| TOP8/D절 | “D13 저장 데이터 최소 경계 검토 인수, 실제 생성/저장/장착 공급→source lifecycle/payload→runtime Gate 유지.” | 20~40%·150px·180f·시전당1·미결cap/겹침 그대로 |

## 실행/운영 기록

실행 2026-10-02T04:34:12.316Z→2026-10-02T04:34:12.408Z. Node 절대경로는 /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node. 경로 realpath가 지정 체크아웃/소유 폴더와 같고 symlink=false를 확인했다. 산출은 checks.mjs/result.md/evidence.json 3개만, TASK·소유밖 쓰기/삭제/cleanup0이다.

**운영 예외:** TASK 전체 Read와 병렬인 초기 명령에서 읽기 전용 Git 상태/HEAD 조회 각1회를 실행했다. TASK의 Git 명령0 지시 확인 후 추가 조회0·Git쓰기0이며 당시 관찰은 evidence.protocolException에 격리 기록한다. HEAD/Changes를 이후 추정하지 않고 최종 인수는 총괄에게 남긴다. 기존 완수/원후보는 보존하고 다른 채팅 메시지·자동 다음 일감·새세션/하위팀0이다.
