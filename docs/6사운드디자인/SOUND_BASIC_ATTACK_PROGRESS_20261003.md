# 기본 근접·활 발사음 오류의 공격 진행 보존 — source30

## 문제와 반영

일반 근접 공격의 `SFX.slash()` 동기 오류가 `update()`의 해당 분기를 빠져나가게 했다. `fireBow()`는 악의와 탄환을 이미 처리한 뒤 발사음 오류가 나면 `bowRecover` 전환과 성공 반환에 도달하지 못했다. 본편과 Easy에 음향 호출만 격리한 최소 후보를 반영했다. 기준 HEAD는 `8116329fc9b3824d2c7461237843412a90621a2b`다.

| id | 적용 위치·입력 | 변경·오류 기록 | 보존하는 후속 처리 |
|---|---|---|---|
| SFX-BASIC-MELEE-IDLE-DISPATCH | `update`의 `isAct('weapon')&&useStPct('weapon')` 일반 LMB 분기에서 기검참이 아닌 `SFX.slash()` | 해당 호출만 try/catch. `[SFX] basic melee dispatch error:`와 원 Error를 기록 | 비용·공격 보너스·통계·모션·음성·공격 상태, 분기 이후 진행. 전체 update/다음 프레임 인수는 별도 |
| SFX-BASIC-BOW-FIRE-RECOVERY | 전체 `fireBow`의 석궁 `playSample('crossbow_shot',.7,_r(1,.1))` 및 나머지 활 `SFX.bow()` | 각 음향 호출만 try/catch. `[SFX] fireBow dispatch error:`와 원 Error를 기록. `bw()` 타입 조회는 catch 밖 | 기존 탄환 1개·악의 1 소모·보너스 초기화 후 `P.s='bowRecover'`, `P.st2=~~(45/(pBowSpd()*(1+_eqAffix('bowAtkSpd'))))`, `return true` |

두 경계에 음향 호출 3곳을 감싼 변경이다. 범용 SFX/오디오 backend, 비음향 모션·장비·탄환 풀 오류의 전파 정책은 바꾸지 않았다. 기본 공격 외 음향 호출은 이 후보에 포함하지 않는다. 오류 발생 후 실제 음향 복구나 비동기 rejection 처리를 완료했다고 주장하지 않는다.

## 수치·호출 계약

| 항목 | 현재 계약·보존값 |
|---|---|
| 일반 근접 | ST 5, `_atkBon=~~(_lastCost*1.5)`, `_atkC` 1회 증가, `wSwing`, `st2=5`, `swProg=0`, 현재 facing을 atkArc로 사용 |
| 기검참 | ST `10+((P.skills.kiSlash||1)-1)*2`; 기존 3타 충전/검기 호출·콤보 경로 유지 |
| 기본 근접 소리 | sword_swing1/2/3 중 랜덤, volume .85, `_r(1,.08)` |
| 일반 활 소리 | bow_shot, volume .85, `_r(1,.08)` |
| 일반 석궁 소리 | crossbow_shot, volume .7, `_r(1,.1)` |
| 일반 근접 음성 | `Math.random()<.35` 조건·선택·피치 순서 유지. 이번 격리 대상 밖인 음성 오류는 기존처럼 전파 |
| 활 피해·탄환 | `(~~(bowRef()*pBowMul()*10)+(P._bowBon||0))*3`; 이후 `_bowBon=0`, 관통 0, normalBow=true, 기존 거리·속도·속성 유지 |
| 활 소모·반환 | `G.mats<=0`이면 idle·false, 음향/탄환 생성 0. 발사 성공이면 악의 1 소모·회복 상태·true. 새로운 환불/재발사 정책 추가 없음 |

## 검증과 한계

| 단계 | 실제 결과 | 범위 |
|---|---|---|
| 변경 전 대조 | 신규 34개 중 26 PASS / 8 FAIL | 본편/Easy 각 석궁·활 발사음 오류 2개, 음성 유무 2조건의 일반 근접 swing 오류 2개. 첫 실행은 reporter 원자료를 보존했으나 shell의 마지막 tail 때문에 테스트 프로세스 exit를 별도 캡처하지 못함 |
| 최소 후보 | 34 PASS, 프로세스 exit 0 | 실제 전체 fireBow와 일반 LMB 분기, 실제 SFX.slash/bow·_r·stCost/useStPct 실행. 입력/스탯/탄환 풀/playSample는 대역 |
| 실제 생산 | 39 PASS, 프로세스 exit 0 | 신규 34 및 기존 basicAttackDamage/kiSlashSwingSound 회귀 5. 정상 상태·호출 순서·RNG 동등, 같은 Error 기록, 비음향 오류 전파, ST 부족·악의 0·기검참 경로 보존 |
| 구문 | inline JS 12 / importmap JSON 2 PASS | 양판 전체 inline script AST/JSON 파싱 |
| 최소 변경 | 양판 각각 +194B, 전체 역치환 byte-exact | 두 변경 경계 외 전체 원본과 일치. index·수치·진행·저장·보호2_3·Q-only magic/E불가·어택티켓 금지 유지 |
| 제품 검수 | NOT_ACCEPTED | 전체 update/다음 프레임, 실제 native 전투·청취·화면·장치 입력 미검수. 상태 주입으로 제품 통과를 대체하지 않음 |

`test/basicAttackAudioProgress.test.cjs`에서 회귀를 유지한다. 실제 전체 fireBow의 성공 반환과 회복 상태는 실행한 결과다. 근접 분기 끝의 fixture continuation witness를 전체 게임 프레임 완료로 해석하지 않는다.

## 정확한 입력·인계·백업

| 파일 | 변경 전 SHA256 | 변경 후 bytes / SHA256 |
|---|---|---|
| game.html | `04f47273bc2e8d4d4d1694108d7cd5ee838e14621d3088de41dd132dd66a830e` | 4035164 / `44946fa036c2e1189b512cb82354105f17ad8686a5fd77ff15b8ec89a6c32ddc` |
| game-easy-test.html | `e93e66c18bdcd68ae855c431582a61b69f35dec09dea07b0e7d673883f5b7d37` | 3912833 / `e1e132e2e4965a3d0c494609955fc3bae16c4fe8833c928a7ff5f0f857d37b02` |

Codex SOUND `SUPERVISOR-SOUND-0617` 완료 인계(runtime045738 / assemblya7a222 / docs21d38a), turn `01a10069-2c3d-74c2-a39e-b8598951697d`, 실제 후보 도구 `exec-448703b0-d8bf-46d4-9431-4df0225554d5`의 수정안 두 경계를 채택했다. 다른 누적 음향 후보를 합쳐 적용하지 않았다.

원본 4파일·67개 타인 WIP 핀, 후보·생산 검사와 docs 전체 검색은 `tmp/mac-migration-runtime/continued-review-20261003/source30-basic-attack-audio/`에 보존한다. 코드 변경 후 docs 전체에서 관련 키워드 검색을 다시 수행하며, 변경 없는 공격 공식/기검참/장착음 설명은 기존 계약과 일치하므로 그대로 보존한다. 코드·테스트·관련 docs만 같은 커밋에 포함하고 원격 정확 SHA를 확인한다.

## 기존 Mac 검수 앱

현재 살아 있는 source29 전용 앱은 job `e771c364-291e-4c7a-b983-1a7496d505aa`, port3404, main52515다. 이 앱에는 이번 source30 변경이 포함되지 않는다. 기존 격리 profile/save와 사용자 앱·세이브를 보존했다. 재기동·새 빌드 0회.

이번 정상 Space 입력 후 AX 상태는 불변이고 화면은 이전 네메시아 목마 대사에 머물렀다. 새 화면 기준 클릭은 `noWindowsAvailable`로 실패했다. 과거 Mac 잠금 오류는 이력으로 보존하며 현재 입력 오류를 자동으로 잠금 해소/앱 종료로 해석하지 않는다. 같은 최신 후보의 전투·획득/장착·4지역/보스문·보스 사망/부활·재입장·필드 상태 보존·저장 재실행·실청취·카메라 인수는 계속 미완료다.
