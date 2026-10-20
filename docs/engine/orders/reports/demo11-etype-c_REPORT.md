# DEMO11-etype-c — DEMO11-63~67 자연 소환 인수 BLOCKED

**완료 아님: etype13~17 모두 현 기준에서 NOT_READY, 등록/생성0.** 전투 핵심은 PC 인터페이스 호출만 허용한다는 범위 때문에 Player 상태·급강하 근접 패링·hurtE 사망 중간 순서를 Mac에서 새 writer로 만들지 않았다. 타입별 이유는 서로 다르며 하나의 거부로 다른 타입을 일괄 차단하는 제품 코드는 추가하지 않았다. 미완 적을 단순 generic actor/다른 원소로 대신 등록하지 않는다.

기준 fetch origin/main `0138c5bb9188d27cee10cb1a901d075092ddb88f`; DEMO11-43 `9b763da9900c3c225fa60caa556f5b8c9ea227a3`는 이 main을 포함한다. `git merge --no-edit 9b763da9`의 정상 fast-forward 결과를 작업 기준으로 삼았다(새 merge commit 없음). 브랜치 `codex/demo11-etype-c-20261021`. 갭 문서는 main에 없어 지정 기준 `61ab71be`의 §4.1 DEMO11-63~67 행을 읽기 참조했으며 문서/제품을 임의 merge하지 않았다. sparse WT만 사용, R tracked 상태 보존. 원본 game.html SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`.

## etype별 결과와 원본 계약

다음은 정적 인수 판정이며 실행한 hurtE 거부 테스트 결과가 아니다. 아직 hurtE opts 요청 자체를 하지 않았으므로 `hurte_opts_unsupported`가 실제 발생했다고 주장하지 않는다. 원본 `_CH1_OPENING_EXCLUDED_ET`(30992·31121)는 [2,22,30,43]이므로 C5종을 제외하는 데모 분기를 꾸며내지 않는다. 공통 mkEn31126–31151의 레벨·난이도/elite·HP·ATK·속도·반경 권위는 유지 대상으로, 카탈로그 HP/ATK를 최종 HP/ATK로 사용하지 않는다. 공통 projCd240/첫projT180+U×120 및 charge60(31152이후·40499–40515)은 타입 특수 패턴과 별개다.

| ID / etype | 원본 행·상태/탄/사망 계약 | 결과·필요 접점 |
|---|---|---|
| DEMO11-63 /13 거미사도 | 31206 webCd120+U×40, webT40+U×20. 38991–38998 idle에서 webT−sp; 30<d<1200일 때 속도3, 물리, floor(atk×.5), life/ml200, sz1.2, web:true. 16917 Q 분류 forbidden, 35083–35084 접촉은 HP 피해가 아니라 Player._webSlow=90;33005/33022 감소·이동×.5 | **NOT_READY**. Player 공개 web 둔화 admission/소비 interface 없음. freezeSlow 대체는 원본 별도 필드·상태 정화 순서를 바꿈. emitter의 web 필드/13 identity 미지원은 Mac 탄 소비자 후속 범위지만 PC status 접점 전 활성화 불가 |
| DEMO11-64 /14 날개사도 | 31208 swoopCd140+U×60, swoopT50+U×30. 39000–39015 d60~1200, 궤도각+.04sp·반경150; eSwoop18·방향 고정.40540–40548 속도6, 벽 recover25·접촉/만료recover35. isPWin→parryBank+(atk||10), doParry, poise20; 아니면 !charge에서 floor(atk×1.8×elMul), eModHitP·kb6 | **NOT_READY**. Player/QE 현재 접점은 projectile 반사이며 eSwoop 근접 actor 접촉 순서를 받는 PC interface가 없음. receive_damage만 호출하면 패링/반동/poise 분기 소실; fake projectile로 반사시키는 대체 금지 |
| DEMO11-65 /15 분열사도 | 31212 _splitDone=false.42792–42800 hurtE 사망 중간에서2자식; 각 각도πi+U·거리18+U×8로 mkEn15, 자식 HP floor(새hp×.35), mhp=hp, shield0, r=max(5,floor(부모r×.6)), speed×1.3, splitDone=true | **NOT_READY**. 현재 hurtE648은42769–42944 특수 사망 효과가 타입 가드로 단락된다고 명시하지만15를 인수하면 실제 원문 분열 분기가 활성화됨. 이 위치의 PC death-prefix 콜백/인수 receipt가 필요. actor 사망 write 직후 임의 소환하면 원본 고어/체인/이후 보상 순서를 바꿈. 자식 위치도 MAP11 Marker 요청으로 해석할 제품 계약 필요 |
| DEMO11-66 /16 덫사도 | 31214 trapCd200+U×60, trapT60+U×30.39017–39029 d<250에서 정지탄floor(atk×1.5),el=e.el,life/ml600,sz.8,trap:true; 전역 cap50 초과 시 최소life swap-pop. **먼저**34690–34707 밟기 반경28·!charge, iframe면 피해/slow 건너뛰어도 제거; 피해·kb8·trapSlowT=floor(120×(1−min(.5,slowRes))), 반사시 제거·수명만료 제거 없음.35085–35088 후행 일반접촉에는 별도30틱 stagger guard | **NOT_READY**. PC trapSlow 저항 조회/부여와 선행 밟기·Q magic 반사 접점 필요. Player 공개 slowRes 기반 trap 상태 API 없음. 후행30틱만 구현하거나 life600 종료로 대체하면 선행 무기한 덫 계약 위반 |
| DEMO11-67 /17 모체사도 | 31216 motherCd300+U×100, motherT100+U×50.39031–39047 near200 shQuery count<8이면2+floor(U×2) 거미13, 원문 원형반경25·canMv6·element/room상속; timer reset, 아니면60. d<150 후퇴 | **NOT_READY**. 자식13 status 선행 의존. adapter.snapshot126의 dynamic_budget_changes=HOLD_owner_receipts: 자연 자식의 Marker 위치/부모 origin 귀속/추가 분모·취소 receipt 결정 필요. 원본 원형 좌표를 새 MAP11에 직접 복사하거나 기존 분모에 무단 추가하지 않음 |

## PC 요청·A/B 통합 후보

아래 이름은 **필요 계약의 설명**이며 실제 존재하는 API나 새로 구현한 helper 이름이 아니다. 현재 `receive_native_projectile_contact`(player932–963)의 기존 피해·방패 경로는 그대로 재사용하고, 부족한 상태/근접/사망 중간 호출만 PC에 요청한다. hurtE 옵션이 거부되면 해당 etype의 활성화만 중단하고 이미 적용된 prefix/다른 etype를 되돌리지 않는 receipt가 필요하다.

| 현재 Godot 위치 | 필요한 승인/후속 접점 |
|---|---|
| player.gd922–963/1052·기존 freeze API, web/trap 상태 필드0 | PC: web90·trap slowRes/120, source clock·정화·무적/charge 순서를 소유하는 공개 상태 request. 직접 Player 필드 쓰기0 |
| native_combat_qe_adapter.gd326–368 | PC: eSwoop actor/피해·패링·poise·kb/eModHitP를 원순서로 처리하는 근접 contact receipt. 현재 projectile 반사 API로 대체0 |
| native_normal_enemy_hurte.gd648 / game42792 | PC: 분열 사망 분기의 정확한 중간 prefix hook. spawn 성공/거부 prefix, 이후 보상/지역 kill 순서 명시. hurtE 파일 수정0 |
| native_element_projectile_emitter.gd89–90·98–108·290–294 | **A/B와 통합 후보**: 13~17 원소 identity·공통 차징 탄 지원 확대(현재3/7/21 한정). web/trap 신규 특수탄은 PC 접점 인수 뒤 C 소비자에서 추가, 기존 일반 탄 profile 변조/검증 약화0 |
| world.gd2920–2937 / native_stage_spawn_adapter.gd104–114·126 | **A/B와 통합 후보**: 기존 spawn_hole 등록은 etype0 script만 허용. 타입별 실제 actor 등록·origin 결합 접점을 한 번에 합의. 공용 helper 새로 만들지 않음. C5종 빈 shell 허용0 |
| DEMO11-43 adapter/향후 MAP11 provider | 자식15·13도 MAP11 Marker 후보만 사용. region 원점 고정·동적 추가/취소 분모는 원본 효과와 새 맵 방침을 함께 정해야 함. scheduler/고정좌표 우회0 |

## 범위·검증·제출

자체 제품/공용 Main·State·World·Player·hurtE/hurtP·저장·테스트·에셋 변경은 **각0줄**. 새 helper/틱/목록 생성 API0. 커밋 대상은 자기 보고서·docs/8.0 인수 경계·CHANGELOG_SYNC 절3문서뿐이다. A/B 작업 폴더/브랜치와 다른 담당 파일 수정0, 메신저 전달0. 분열·모체의 좌표를 Marker로 바꾸는 제품 결정도 임의로 구현하지 않았다.

관련 게임 테스트 **미실행(통과/실패 수 없음)**, Godot **실행0회**. 5종 실제 동시 스폰이 인수 불가하므로 고정 N 물리 벽시계120fps 예산 벤치 **미실행**. 빈 actor·요청 거부 루프/모델만 재어 5종 벤치 PASS로 보고하지 않는다. PC 접점 인수 뒤 실제5종×N틱, elapsed/mean/p95/p99/max·8333.333µs 예산을1회 측정해야 한다. 코드 변경0이어서 관련 스위트를 형식상 재실행하지 않았고 UI 추가0으로 캡처/번역0이다.

정적 증거: `_out/demo11-etype-c/source-lines.txt`의 행번호 원문 발췌, `native-interface-audit.json`의 실제 소스 해시·관련 API/필드, `gap-c-rows.txt`, `basis.json`, 정상 merge 로그. 원본/큰 JSON 통째 출력0. 첫 merge는 --no-checkout 상태에서 checkout 전 시도해 Git이 거절했고, sparse read-tree 후 정상 fast-forward했으며 거절 로그도 별도 보존한다. 관련 문서 동기화·정상 훅·자기 branch 일반 push/remote SHA·DONE 뒤 자기 WT 제거, R start/end 비교 결과는 원로그 DONE.txt. **최종 판정 BLOCKED; DEMO11-63~67 제작 완료 아님.**
