# ITEM — D13 원본 가시덫 parent·child payload 접점

**접점·설계 결정 인계 완료. 새 VM/child 후보는 만들지 않았다.** D13 SSOT는 원본 spikeTrap DOT 처치만 허용한다. mineTrap은 본편에서 결계진 에셋 변수명으로 검색되며, D13 parent로 승인된 문서 근거가 없다. 원본 하나의 생성→효과→종료만 분석했다. 제공 기준7e69495046323b3120578f67635c20feb48b2a4f는 총괄 전달값이며 Git 조회0/HEAD 독립 관측0이다.

## 먼저 인수한 완료 근거

앞선 공급검토3입력/5그룹, 기존 callback32·caller22·data12+JSON1·D10/롤 감사는 읽기만 했고 실행/import/합산0이다. 기존 D13 후보는 private original/fusion/child 출처, 시전 token, 최종 사망 큐, 전체 pass 성공 뒤 callback을 제공한다. callback clear/array 교체 반례도 이미 인수됐으므로 재현0. 기존 합성 child append는 순회 경계용 원본 복사이며 실제 D13 payload 구현 근거가 아니다. 이번 새 실행 parent 입력0·합성 binding 주입0·대역0·비교 VM0다.

## 현행 source 한 경로

본편 읽은 시각 UTC 2026-10-02T05:36:08.076Z; game.html SHA 2e45ee0e9ad909b378bf1a7b864818ce442a4c3e17b12360b42e363dc7d0bd94. 종료 UTC 2026-10-02T05:36:08.200Z; SHA 2e45ee0e9ad909b378bf1a7b864818ce442a4c3e17b12360b42e363dc7d0bd94. 전체 소스 동일=true. 이전 보고 source SHA를 현재값으로 복사하지 않았으며 총괄의 동시 UI minus 변경을 되돌리지 않았다. easy는 보존 SHA만 기록했고 이 parent 경로를 중복 조사/실행하지 않았다.

| 실제 source | 행 | 원문 SHA-256 | 전달 방향·접점 |
|---|---|---|---|
| activateSpikeTrap | game.html:43997 | f5d9f41ee12c8f51a0d8a1b116588a6133a3bc801aec73bb0532d3c02fc2dd19 | 생성: 원본 성공 직후만 private source 등록 |
| _spikeTrapDmg | game.html:43996 | d55cbafbe9652a35e6e573b06bfd833507031581f46991ca6404b6a1bb0fde89 | 피해 원식: helper 미실행 |
| _spikeTrapSlowPct | game.html:43995 | 48adfa475ec9ad1a42ac4ee7abc5e50b5c7be72d92cb5e6cb8d1a74fd8941a48 | 슬로우 원식: helper 미실행 |
| _uEq | game.html:15806 | 4cc4a751997836db9d65382b937941e9971c1678cd4320337ccd2aa3aa7b3242 | 직접 필드 첫 truthy 반환; 합산/nested binding 소비 아님 |
| recalcSt | game.html:15702 | 994fa2b29e5be2edc9a0333d24fd3d10c269746b6da2d3d1e380daff38528e99 | ST·캐시 갱신; D13 소비 아님 |
| hurtE | game.html:40713 | a8578d764819733816dce0ed677f5d2e2d4bae35040425c9f1762b7fd69771f2 | 정상 반환 뒤 최종 alive/hp edge 인수; 전체 피해 helper 미실행 |
| slot caller | game.html:12541 | 819c7c63deaa00f0d0b1a00cce5ba5fd262c92a1db3a5f1821d3933f5662227c | slot 성공 가드; 이미 완료한 caller 지도 반복검사0 |
| parent push | game.html:44006 | 2c6966f7a10eff3959bc00c623bf4a807a2c73b69d04b6b45d594ee0e2e91bc1 | parent 필드의 유일 생성 |
| pass entry/cap reset | game.html:35851 | 432a2a2ce12ff4747dbe3526edbff4c99c1fbed9113a465f80df79e6fb1099b2 | cap reset→parent t+=sp |
| timer/hit/cap | game.html:36070 | accd24a9d3f22e81f4be39700929d37aee3e8b7bd8808a09505e2e2c4561415c | spikeTrap 25f→alive/radius→same-type >=1 |
| spikeTrap effect branch | game.html:36122 | 6bf62a43954d66dd9c9ebd6e723e5c71c689d5edfd306b7711c71b63b4c82f73 | audio RNG→hurtE DOT→bleed→slow |
| pass expiration/compression | game.html:36235 | 580988238da5c00183dcd56963ad1729add43985986895ff3712fa41790f3f63 | 효과/파티클 후 만료 및 제자리 압축; drain 접점은 전체 pass 다음 |
| fusion parent excluded | game.html:44787 | 6779927122793cd2d94a75b52aa71312eb28fa3ff23eb6759b47a83e9467c636 | 허용 original 아님 |
| death immediate room check | game.html:41648 | d01ca9886e5f2ffd384532271b6a3c3672f776a989ec6efdae4ea87b60a68c06 | hurtE 내부 전환 가능; callback epoch/array 대조 유지 |

1. slot caller는 악의/쿨 가드 뒤 activateSpikeTrap을 호출한다. parent 함수는 pillarSpike 흡수 시 반환하고, 악의 또는 쿨 부족 시 반환한다. 성공 시 숙련→악의 차감/쿨 설정→레벨/반경/피해 helper→존 push→설치 sample의 RNG helper→shake 순서다. 피해 helper·비용·RNG를 실제 실행하지 않았으므로 이번 자원/RNG 정상 동등성은 UNKNOWN이다.
2. parent는 r=300+(lv−1)×15, t0/maxT600, el=EL.P, dmg=_spikeTrapDmg(), lv, type spikeTrap이다. 피해 원식은 ~~(magicRef()*statInt()*pMagicMul()*_skMul('spikeTrap')*.75). base 악의10은 _malCost(10), base 쿨600f는 ~~(600*(1+_cdRed()))이며 helper를 고정값으로 치환하지 않았다.
3. pass는 cap counter 초기화→t+=sp→타이머25f 도달→공간 query/거리/alive→cap→가시덫 효과 분기 순이다. cap의 실제 조건은 >=1이며 주석2존을 구현값으로 채택하지 않는다. 이는 parent의 현행 동작이고 child cap 선택을 승인한 것이 아니다.
4. 가시덫 분기는 audio RNG 이후 hurtE(e,fz.dmg,...,true,{dot:true,shieldHit:true,_lessonAttack:'spikeTrap'},EL.P)를 호출한다. 이어 bleedT 최소300, bleedStk 최대10, stk<10일 때 pool += pDotPool()*fz.dmg*.10, bleed1; slow90f 갱신·lv 저장을 한다. slowPct=min(.95,.91+(max(1,lv||1)−1)*.02). 원 hurtE 정상 반환 직후 original alive true/hp>0→false/hp<=0만 큐 eligible이다. bleed pool의 후속 독립 DOT 사망을 새 originalTrapKill로 인정하는 연결은 없다.
5. 피해/부가효과/파티클 후 t<maxT일 때만 압축 배열에 보존한다. 전체 G._fireZones.length=_fzW 완료 뒤에만 기존 큐 callback을 연결해야 한다. 만료 검사가 이 generic branch 효과 뒤라는 순서를 바꾸지 않는다. hurtE 내부 checkRooms로 배열/epoch가 바뀌면 기존 후보의 stale 폐기 대조를 유지한다. stage/death/retry 전체 clear 지도는 이번에 반복하지 않았다.

## 장착 binding과 child 전달 접점

| 접점 | 현재 사실 | 총괄이 인수할 연결/결정 |
|---|---|---|
| 장착 읽기 | _uEq(stat)는 SLOT_NAMES 순으로 item[stat] 첫 truthy값만 반환한다. 합산도 nested uniqueRoll reader도 아니다. recalcSt는 ST 계산/캐시 무효화다 | UI-13/belt의 검토 binding reader가 canonical fraction을 반환해야 함. 직접 _uTrapOffshoot 필드를 중복 저장하거나 _uEq 합산 방식으로 바꾸지 않음 |
| trusted supply | rollDrop→mkItem에서 D13 resolver/binding 공급이 아직 없음. 앞선 factory는 대역 | 생산 생성·저장 데이터 계약 선인수. 로드/장착에서 생성·보충·재롤0. 4플래그false 유지 |
| binding 전달 위치 | 기존 wrapOriginalTrap은 source.kind/castToken만 저장하고 ratio를 캡처하지 않음. 이벤트는 mutable zone/enemy 참조와 사망x/y를 전달 | 성공한 원본 생성 직후 zone+castToken에 검증된 fraction을 전달할 private 접점 필요. 시전/적중/처치 중 어느 시점 장착값을 읽을지 SSOT 미결이므로 snapshot 정책 임의 확정0 |
| payload 접점 | onOriginalTrapKill(event)은 parent zone/사망좌표를 제공하지만 child factory 없음 | ratio 검증 인수 후 parent.dmg×fraction, x/y=사망좌표, r150, maxT180, t0, type spikeTrap를 전달할 후보가 필요. 추가 반올림/피해 재계산/parent 좌표·dmg 변경0; 초기 tick timer 방식은 인수 전 미정 |
| 재귀 방지 | 기존 recordChild는 private kind child 등록 포트다. invokeDot는 original만 허용하며 pillarSpike 제외 | child를 original wrapper로 생성하지 않고 생성 성공 시 recordChild 등록. child direct DOT/후속 출혈 죽음/fusion/불명 출처가 추가 생성하지 않는 계약 유지. 전체 사망 helper 대신 가짜 hp 대입 검사로 구현 증명하지 않음 |
| 부가효과 | 현행 spikeTrap 분기의 슬로우/출혈이 fz.lv·fz.dmg를 사용함 | child가 이어받을 lv와 제한된 dmg를 전달하되 bleed/slow 강도/지속 추가 변경0. child timer/캡 정책과 분리하여 인수 |
| 상한 | 기존 usedCasts가 첫 eligible 처치에 token을 사용 처리; callback 실패에도 이미 사용됨 | 시전당 최대1 유지. payload reject/factory 실패 때 token 환급 여부는 새 정책이므로 여기서 바꾸지 않음. 전역 child cap 미정 |
| 겹침·clear | child를 type spikeTrap로 push하면 현행 _stHitCap 및 순서의 영향을 받음. 자연 만료 후 source 등록 제거/clear 전환 구현은 미연결 | child cap 참여/우선순위/전역 수/수명 종료 정리와 장착변경/캐릭터·stage/retry/load clear 적용 Gate를 먼저 인수. 새 cap·clear 구현0 |

## 이번 검증과 상태

| 구분 | 입력/전후·명령 | 결과·한계 |
|---|---|---|
| source 읽기/AST 위치 | 지정 Node --input-type=module로 원문 함수/구간 line·SHA 추출, fs 읽기만 | exit0. 함수 VM/생성/피해/비용 helper 실행0; source 동작 PASS 주장0 |
| 전후 보존 | 16 읽기경로의 시작/종료 SHA; 앞선 ITEM3파일 포함 | 16/16 동일. 타팀 WIP 전체 검수나 현재 HEAD 확인 아님 |
| 새 비교 검사 | parent 입력0, binding 주입0, 후보0, 이전검사 반복0 | 안전한 child 후보 정의 전 미결 정책이 있어 NEXT 허용한 callsite/결정/Gate 인계 경로 사용 |
| 생산/게임 | schemaAdopted=false, enabled=false, runtimeReady=false, productionApplied=false | 게임/UI/저장/서버/빌드0. 실제 피해·RNG 순서·품질·성능 UNKNOWN |

## canonical docs 인계 문안

코드후보0이나 관련 docs 전체 rg도 수행했다: 169행/49파일; command/output SHA/file 목록은 evidence에 있다. 공유 docs는 수정하지 않았다.

| 정본 | 정확한 추가 문안 |
|---|---|
| ITEM_TEAM_MASTER D13 | “2026-10-02 parent/payload 접점: D13 허용 parent는 original spikeTrap다. 현행 _uEq는 직접 stat 첫값 reader이며 nested uniqueRoll 소비가 아니다. 원본 생성 성공 직후 private cast context의 검증 fraction 전달 접점과 pass 압축 후 child factory 접점이 필요하다. child payload/cap/겹침/clear·장착롤 snapshot 시점 미결로 새 후보/VM0, 생산0·4플래그false. 상세 continuous/ITEM/lifecycle/result.md.” |
| TOP8 D13 간극 | “기존 deferred callback은 zone/사망좌표/castToken만 전달하며 ratio와 child factory가 없다. mutable zone 참조를 snapshot으로 오인하지 않는다. child는 parent 틱피해×정규fraction0.20~0.40, 반경150px, 지속180f, 시전당최대1을 유지한다. parent natural expiry는 효과 뒤 압축이고 child의 cap 참여·전역 상한·초기 tick/장착값 읽기 시점·clear 정책은 별도 Gate다.” |
| D절 보충 | “mineTrap 에셋명을 D13 parent 승인 근거로 사용하지 않는다. original spikeTrap의 직접 DOT 최종 처치만 허용하며 child/fusion/불명 및 별도 출혈 DOT 사망으로 재귀하지 않는다. source helper 실행·실제 피해/RNG 동등성은 아직 UNKNOWN이다.” |

최종 인수 순서: 총괄 데이터 공급 계약→장착 reader/롤 snapshot 시점→payload 및 실패/상한/겹침/clear 결정→허용 범위 source helper 정상 대조→실전 Gate. 자동 다음 일감/다른 팀 메시지0. 쓰기는 lifecycle/result.md·evidence.json 두 파일만이며 checks.mjs는 만들지 않았다. NEXT/COMMON/앞선 산출/production/공유docs/Git/삭제/세이브 보존.
