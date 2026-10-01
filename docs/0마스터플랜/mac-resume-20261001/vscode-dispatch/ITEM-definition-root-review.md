# PM-009 정의 조회·검증 소비 연결 인수

## 변경

기존 ITEM의 실제22종 정의 모듈을 `unique-item-project/definitions.mjs`에 인수했다. UI-01~22 ↔ U-D01~22, 카탈로그 한국어명, 제안 슬롯/타입, 문서상 효과 stat를 읽기 전용 데이터로 제공한다. 전종 proposal/enabled=false, effect implemented=false, nameKey/runtimePath=null, art.accepted=false다. 원화/후보 경로는 출처이며 채택된 런타임 경로가 아니다.

`lookupDefinition`은 제안 ID 조회, `lookupItemProposal`은 슬롯/타입이 맞는 제안 조회, `lookupActiveItemDefinition`은 현재 모든 항목에서 null이다. 미등록 ID/기존 슬롯 유니크/유골함은 기존 소비자의 폴백 대상이며 아이템을 수정·삭제·재롤하지 않는다. game/easy 드롭·효과·그림·색·저장 연결은 이번 범위에 없다.

빈 프레임워크나 미사용 후보로 끝내지 않고 `audit-definitions.mjs` 소비 경로와 기존 `audit-art.mjs`에 연결했다. 감사는 원 계약§3·카탈로그·D절을 다시 읽어 실제 정의와 비교한다. 기본 명령 exit0은 제안 구조 일치만 뜻한다. `--require-ready`는 현 상태에서 exit1로 실패하며 게임 활성화를 허용하지 않는다. 구조 오류도 exit1이다.

## 실제 검증

| 항목 | 결과 |
|---|---|
| 담당 원 후보 |22PASS, 실제 데이터22/원화44, 제안 유효·활성 불가 |
| 인수 후 영구 회귀 |23PASS: 조회·고정성·기존 폴백·중복ID·슬롯/타입·없는 효과·허위 채택/활성 차단 및 실제 감사 CLI |
| 독립 문서 변이 | 슬롯/카탈로그명/효과stat 3종 불일치 검출. 임시 사본만 변경·정리 |
| 기존 원화 감사 실행 |22종44PNG/팀ID22, 정의 structural=true/runtimeReady=false/active0 |
| 활성 차단 |실제 원화 경로44개 제공 시110개(효과/번역/런타임아트/채택/제안상태 각22). 소스 원화가 없는 별도 fixture는 추가22차단 |
| 다운로드 대조 |현재 도구의 다운로드 위치에는22개가 없어 matched0/missing22. 이를 다운로드 SHA 대조 성공으로 표시하지 않음 |

root 최초 문서 이름 추출 regex가 뒤쪽 이미지 작업 ID 표까지 읽어22개 이름을 덮는 감사 구현 오류로21PASS2FAIL이었다. 효과ID가 있는 카탈로그 본표로 추출을 한정해 수정하고23PASS를 확인했다. 원 실패 로그 보존. 런타임 게임/화면·효과 밸런스·오디오·패키지 검수는 미실시다.

## 인수 경로

기존 ITEM 세션01a0f6e6-1fbe-7df0-8d02-a9c2d9df3750. 앱 메시지는 active writer 오류로 미전달. 공식 `codex queue`가01a0f7a9-af0f-7990-b525-79cb5637f359를 수락, 새 턴01a0f7a9-af10-7e81-9a89-84a3039f413b에서 지시Read exit0·정의/테스트 Edit·실행을 확인했다. 수신/Read 기록13:31:32Z, 담당 완료기록13:33:44Z. 새 세션·native입력 재시도0. 원 후보와 인수 모듈 바이트 동일이며 root가 소비 감사·영구 테스트만 추가했다.
