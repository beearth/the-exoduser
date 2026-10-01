# U-D13 원본 덫 출처·지연 생성 경계 검토 인계

새 독립 후보19그룹 PASS. 생산 적용/게임/브라우저/서버/API/세이브/Git/빌드/새세션 실행0. D17/CSP 재검사0. 기존 초안·후보·타팀 변경 되돌림0.

검수 UTC: 2026-10-01T18:20:09.620Z. 원블록 SHA `a78c383ab58ccdd9bf67893ed3b742cdcd3c82a21f94b539486a2a075c868c11`, game SHA `6a8b523a4c91fdeaa300e85c3e5cfe25eb51cd8be705c395f5112d0771f6065b` 고정. 이전 작업에서 달라진 전체 HTML은 타팀 변경으로 보존하며 되돌리지 않는다.

## 정적 간극에서 실제 실행 증거로 좁힌 결과

현재 activateSpikeTrap/hurtE **전체 함수 원문** 및 update의 G._fireZones 조건문 **전체22,471byte**를 AST 추출해 작은 VM에서 실행했다. 핵심 for루프를 가짜 축약 루프로 대체하지 않았다. 검토 경로는 spikeTrap DOT의 hurtE 호출1개만 인수식 그대로 review.invokeDot로 치환하고 전체 블록의 모든 순회·캡·틱·부가 상태·압축 코드를 그대로 실행한다. 역치환하면 원문 byte가 같다는 검사 포함.

| 표본 | 실제 관측 | 해석 |
|---|---|---|
| 원본 hurtE 일반 적 사망 뒤 즉시 array.push 합성 child | 같은 tick child.t=1/_tickTimer=1, 원HP=-9, RNG9회 | 배열 length를 매 반복 다시 읽어 신규 객체도 순회. **child 피해 틱 발생 증명은 아님** |
| 종료 뒤 검토 callback에서 동일 합성 child append | 직후 child.t=0/_tickTimer=0, 원HP=-9, RNG8회; 다음 pass에 t=1 | 압축 완료 이전에 신규 객체를 처리하지 않음 |
| payload 생성 없는 후보 vs 원 loop | 원HP=-9/kill1/배열 identity·순서·효과 호출·RNG8회 동일 | 검토 출처·큐만으로 추가 피해/배열 수정/RNG0 |

합성 child는 실제 생성된 원본 객체를 t/timer0으로 복사한 **순회 경계 증명용 입력**이다. D13 자식 피해/반경/지속 정책으로 채택하거나 생산에 저장하지 않는다. 고정 RNG=.5의 해당 일반적 경로에서만9/8 관측했으며 전체 RNG 경로·실전 성능/DPS 판정 아님.

## 명시 포트와 미적용 연결 계약

`createD13DeferredReview({enabled=false,reviewOnly=false,onOriginalTrapKill})` → proposal/runtimeReady=false.

- wrapOriginalTrap(actualActivateSpikeTrap,getZones)는 실제 원함수 실행 후 새 객체만 private WeakMap에 original 출처·시전 token으로 기록한다. 원본 생성 실패·합체 흡수 return에는 등록0. _pillarSpike:true는 original 기록 거부.
- recordFusion(actualFusionZone)/recordChild(syntheticZone)는 구분 기록만 하고 원본 처치 callback에는 참여하지 않는다. 이미 기록한 객체 재분류는 거부. 태그를 기존 zone의 owner/source 필드인 것처럼 생성하지 않는다. 포트는 신뢰된 실제 생성 지점용이며 거짓 출처를 검증하는 보안 경계는 아님.
- 실제 호출 식 `hurtE(e,fz.dmg,Math.atan2(...),true,{dot:true,shieldHit:true,_lessonAttack:'spikeTrap'},EL.P)`를 인수식 그대로 invokeDot(zone,actualHurtE,receiver,args)에 전달한다. actualHurtE가 정상 반환하고 해당 적의 alive true/hp>0→alive false/hp<=0을 관찰했을 때만 현재 pass 큐에 넣는다. 비처치/쉴드흡수/실제87 부활은 불발.
- wrapZonePass(actualZoneBlockFunction,getZones)는 동기 원블록이 **전체 압축까지 정상 완료**한 뒤 FIFO callback을 실행한다. 원배열 참조 교체/explicit clear/블록 예외면 큐 폐기. 원본 시전 token당 최대1건은 기존 D절 계약만 반영한다. 전역 활성 cap·겹침 피해 상한은 정하지 않았다.
- callback은 합성 관측/생성 fixture 전용이며 child zone 생성 수치나 save payload를 제공하지 않는다. callback 예외는 inspect().callbackErrors에 기록하며 이미 실행한 원 피해/반환값을 바꾸지 않는다. 배열 압축 순서·원 object identity·동기 this/인수/호출1 유지.

실제 패치 적용0. fixture.mjs에 재현 가능한 AST 추출·호출부 변환을 제공하며 root가 생산 호출부를 연결할 때 source/함수 SHA를 먼저 대조해야 한다. clear는 caller의 검토 fixture 수명 경계에서만 명시 호출한다. 동기 pass 전용, 재진입/비동기 originalPass는 지원 계약이 아니다.

## 대역과 정확한 미확정 경계

일반 etype0, 중립 어픽스·방어/STR1/crit0, 고정 RNG, 합성 P/G/INV/적 배열만 사용했다. shQuery는 합성 ens 목록 공급(실제 공간색인/깊이버퍼 구현 아님), 시각/SFX/loot/XP/potion/방·맵 전환 의존은 대역. actual hurtE의 피해·사망 분기/캡·후처리 자체는 원문 실행이다. rollDrop/addExp/addPotion/checkRooms를 대역으로 둬 실제 경제/DB/맵/사용자 저장에 연결하지 않았다.

실제 hurtE 끝의 checkRooms는 사망 직후 호출된다. 원 checkRooms에는 _enterBossArena 등 전환 경로가 있어 전체 실행을 안전한 단일 적 fixture로 주장하지 않는다. 배열 교체/clear 대역 반례는 stale callback 폐기를 검수한 것이지 실제 모든 전환 PASS가 아니다. 10킬 자동저장 등 경로도 본 표본 범위 밖이며 실행0. onCrit/연쇄·재귀 피해/희귀·보스 최종 사망/실제 공간버퍼·성능·전역 자식 cap/겹침정책·저장롤 스키마는 미확정 게이트.

fixture 준비 중 _dpsDmg/_txtPerFrame/_addImpact/addPotion/checkRooms 누락 ReferenceError를 단계별 확인해 합성 계수/대역만 보충했다. 생산 소스 변경으로 우회하지 않았다. sourceEvidence에 전체블록 원문, activate/hurt/update/checkRooms4함수 SHA, actual fusion literal 및 원 호출부 SHA를 남겼다.

## 실행·파일·문서

`node tools/team-followup-20261001/ITEM/d13-deferred-contract-check.mjs`

검사19그룹: 실제 즉시push/지연·다음pass, 피해/배열/RNG 대조, 기본/한쪽opt-in3종, actual fusion 원문·자식/불명 출처, 출처변형, 시전당1/새시전·FIFO, 압축 만료/순서, 원함수/후반particle 예외·callback예외, 전환경계 폐기, this/인수/반환, 전체원문 역치환, 생존/쉴드/부활.

소유 신규 파일: receipt/candidate/fixture/check/evidence/result (d13-deferred-contract- prefix). 의존은 기존 binding-save-harness.mjs의 extract/acorn 및 Node fs/vm/crypto/assert, source game.html 읽기뿐. 기존 D17/CSP/browser/UI 모듈 import·쓰기0.

docs 전체 U-D13/_uTrapOffshoot/자식 덫 검색과 TOP8/D절/밸런스 SSOT Read 완료. 팀MD 본인 새 섹션만 동기화하고 공용 총괄/CHANGELOG·다른 docs 수정0. D절의20~40%/180f/150px 등의 제안은 확인했지만 본 후보에 child payload로 구현하지 않았으며 미결 보호 상태를 유지한다. 담당 후보 PASS와 실제 효과/드롭·밸런스/성능 인수는 구분한다. root 독립검수/백업·생산 호출부 연결 승인 대기, 원격8e4ed4... 인수 확인은 실행하지 않았다.
