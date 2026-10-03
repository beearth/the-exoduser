# 천공쇄기 별도 필드 몬스터 피해 연결 — source17 (2026-10-03)


## 2026-10-03 source17 천공쇄기 필드 피해 연결

본편/Easy의 천공쇄기는 일반 `shQuery`/`hurtE` 대상 외에 별도 `G._fieldBosses`(단일 `_fieldBoss` 폴백 포함), `G._worms`, `G._fireDevils`에도 기존 `_hurtFieldMobs`로 착탄·잔불·파편 피해를 전달한다. 원래 세 update 접점에서 연결이 빠져 별도 필드 대상에게 피해0이었으며 각 판에 연결3줄만 추가했다.


| ID / 적용 위치 | 필드 피해 연결 | 기존 조건·수치 |
|---|---|---|
| skyCrusher / update 착탄 | `_hurtFieldMobs(sc.x,sc.y,sc.r,sc.dmg)` | `!sc.impacted && sc.t>=sc.impactT`, 기존 impacted 플래그로 1회 |
| skyCrusher / update 잔불 | `_hurtFieldMobs(sc.x,sc.y,sc.fireRadius,~~(sc.dmg*sc.dotMul))` | 착탄 후 `sc.t>=sc.nextDotT && sc.t<=sc.maxT`, 기존 dotEvery30f·dotMul0.05·nextDotT 증가 유지 |
| skyCrusher / update 파편 | `_hurtFieldMobs(sc.x,sc.y,sc.r,~~(sc.dmg*.35))` | `!sc.sharded && sc.t>=sc.shardT`, 기존 sharded 플래그로 1회 |
| giantSlam / giantSlam2 | `_gSlamHit`의 기존 `_hurtFieldMobs(P.x,P.y,range,dmg)` | 양판 이미 연결됨, 코드 수정0·중복 소비자 추가0 |

위 천공쇄기 분류·피해 표의 EL.P/EL.F·magic·포이즈/넉백/중심 기절은 기존 일반 `hurtE` 경로의 계약이다. 별도 필드 몬스터는 기존 scalar `_fmApply` 경로를 사용하며 일반 저항·포이즈·기절을 새로 이식하지 않는다. helper의 strict `< hitR+mobRadius`, 숨음/사망/출현 상태 검사·필드보스 순간이동 좌표·hitCd8f 및 피해 `max(1,~~dmg)`를 유지한다. source13의 사망 stale 대상 재피해 방지와 필드보스 최초 사망 재료4 지급도 유지한다.

MP80·최대3충전·기본900f 재충전과 기존 `_cdRed` 클램프, 조준1000px, 반경 `260+(Lv−1)×12`, 착탄 `max(24,36−floor((Lv−1)×0.65))`, 파편+15f·35%, 잔불180f·30f마다5%·반경 `round(r×0.65)`는 변경하지 않았다. 정상 sp1에서 잔불6틱이며 프레임 점프 시 기존 if 기반 tick 처리는 그대로다. 상단 잔불 명목배율의 오래된2.1/18.06은 코드 `60×0.05=3.0`, `516×0.05=25.8`로 정정했다. 실제 피해는 시전시 스냅샷 `sc.dmg`의 정수화와 각 타격 정수화를 따른다.

신규 메모리 원본20그룹12PASS/8FAIL→후보20/20·fixture0, 실제 생산 current-only20/20·fixture0 및 양판 inline12JS+2JSON PASS. 과거 source16 장비47/source15 실패48 재실행·합산0. VM 입력/일반 hurtE sink·FX/SFX는 일부 기록용 mock이며 실제 world AI·native·시각·청취·전체 RNG 스트림은 미검수다. source15 일반 필드0처치 사망을 이 수정의 실제 플레이 증거로 계산하지 않는다.

### 정확 source와 검증 범위

| 파일 | 변경 전 source16 SHA256 | 변경 후 source17 SHA256 | bytes / 차이 |
|---|---|---|---:|
| game.html | 399fd8b0b37b62ba9a95eb177e56693cba1b77827cde2146f3d2a3799f2ddc51 | 7ae190a940fe6983c6e8fe8c7463f8f77348ab398c354b7d8f66f0bea9d04b7c | 4030511 / +166 |
| game-easy-test.html | a88404ed79083753a1383ca6f7b82533bb3f198923cd63abcf34379f7b25afb9 | db2b15bee93f7588064398af082ef25cdd498382f4f24ea01a00b3d261286249 | 3907797 / +166 |

각 판의 전체 역치환은 source16 원문과 byte exact다. 입력 keyboard callback·슬롯 dispatcher·천공쇄기 producer/스펙·충전·공용 필드 helper·일반 적 기존 소비자 원문은 그대로이며 update의 세 접점만 바뀌었다. source12 수동강화·source13 사망/재료·source14 보스 retry 보존·source15 해제 실패·source16 성공 장비 자원 계약을 되돌리지 않았다.

실제 생산 영수증 `root-live-receipt.json`은 50063B·SHA `2c1fc6aeb9a1bc64effbe1668c43630cb02e47afde066bb1be6bf72c000d094c`다. 테스트 `test/fieldSlamDamageAcceptance.test.cjs`는 `--live` 또는 역사 `--memory-source16`를 명시하고 새 `--output`을 제공해야 한다. 기본 실행은 exit2/검사0/PASSnull이며 현재 exact source17 양판20그룹만 실행했다. source16은 전체 역치환·기존 함수 byte 대조를 위해 추출만 했고 baseline 함수를 실행하지 않았다. 선택 `--baseline-receipt`의 과거 메모리 영수증은 SHA 고정 대조, 미제공이어도 current-only 검수 가능하다. root/tmp 아래 새 JSON만 작성하고 심링크 부모·덮어쓰기를 거절한다.

| 검증 | 근거·한계 |
|---|---|
| 일반 Space 입력 | 실제 callback→dispatcher→producer→update→필드 helper를 추출해 실행. 지옥강타 기배선도 양판 한 번만 타격 |
| 대상·타이밍 | 정상 착탄/파편/6DOT, 경계 반경·숨음·죽은 stale 대상·순간이동 좌표·hitCd8f·재료 최초4 한 번 검사 |
| 명목 예제 | synthetic Lv1 magicRef10·INT1·pMagic1.4·배율60→sc.dmg840, 착탄840+파편294+잔불42×6=1386. 고정 게임 밸런스 수치가 아닌 fixture의 산출 예제 |
| 입력 거절 | MP79·충전0·paused/off/dead/repeat에서 추가 생성/비용0 확인 |
| 일반 적 | 기존 ordinary-only sink8회와 원문/역치환 보존·과거 summary 대조. hurtE의 실제 저항·상태효과 전체 실행은 아님 |
| 미검수 | full world update/AI·GL·실제 오디오·전체 RNG seed/call 스트림·네이티브·세이브0. 추가 필드 타격이 실제 FX/RNG를 소비할 수 있음 |
| 준비 오류 | 최초 VM callback const/property 연결 TypeError1은 fixture 준비 실패로 원자료 보존, 제품 RED와 분리. 정상 원본/후보 비교1회·현재 live1회 |

관련 docs 전체 490행/91경로 검색 후 2_1 정본을 보충하고 잔불 명목배율 두 숫자를 정정했다. 14밸런스 공식·DPS 표의60/516·3/25.8·총합99/851.4는 기존부터 현행식과 일치하여 보존한다. 다른 스킬·번역·이전 날짜별 감사·관리자 STATE/LOG 원자료는 역사/다른 소비자다. 코드2·테스트1·docs4(정본/이문서/MASTER/CHANGELOG)만 scoped checkpoint하며 기존 타인67·관리자4·사용자/기존앱·세이브를 보존한다.

### Mac 현황과 다음 인수

현행 생산은 source17이나 최신 실물 앱은 source16 code `8883c59cb18e4c1bd3ad5cb83911fbe07242df12`/job00072ed5-e133-4c61-9c39-59dd6271c0d5/3392이며 이 천공쇄기 수정을 포함하지 않는다. source16 실물 확인은 별도 원격 docs 체크포인트 `d93f1fc2aacfcfb294b373fae4bdda42e1771d17`에 보존했다. Mac 재잠김 때문에 이후 실제 부활 입력0이며 source17 앱·실제 전투/획득·4지역·보스방·보스 사망/부활/재도전·청취는 미인수다. 다음은 새 통합 앱과 정상 UI 검수이며 강제 state/teleport/킬/저장 패치는 사용하지 않는다.
