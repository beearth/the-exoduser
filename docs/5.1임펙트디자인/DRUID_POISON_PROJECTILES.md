# 드루이드 녹색 독탄 — 2026-09-06

> **2026-09-09 피날레 v0.4:** 데모/bic 마지막 si3 보스의 HP는 `floor(22278×(1+.055n+.0015n²)×dm)`, n=max(0,monLv−1); 초기 쉴드=HP, 부활력20, 최대1회 35% HP 저항(확률clamp(1−신성력,0,1)), phase ATK는 base×1/1.12/1.25/1.4/1.6이다. 3막 음악·HUD·120f 카드 및 보스 바로 재도전/60f 인트로의 [현행 계약·검증](../8.1보스디자인바이블/DARK_DRUID_FINALE_PACING_v04.md)을 따른다. 일반 모드와 공용 패링 계약은 기존대로다. 아래 이전 버전의 HP/부활 유지 표현은 당시 이력이다.


> **2026-09-08 데모 피날레 예외:** `?demo`/`?bic`의 마지막 보스(si3)는 [다크드루이드 피날레 v0.2](../8.1보스디자인바이블/DARK_DRUID_DEMO_FINALE_DESIGN.md) §0을 따른다. 전용 3막·5종 패턴, 동작별 Q독탄(48f 전조/막별1·2·3웨이브/간격30f/수명90f), 돌진·잠행 뒤96f 회복, 잠행 표적 고정, 제자리 HP페이즈 전환, 반투명 독늪을 적용했다. 이 조건의 독립 ORB·상시 리듬탄·idle 자동탄은 생성하지 않는다. 일반 si0/si3와 다른 보스의 수치·부활·Q/E 규칙은 기존 계약 유지. 아래 이전 드루이드 설명은 해당 예외를 제외한 기존 계약/이력이다.

> **2026-09-06 드루이드 독탄 최신 계약:** si0/si3 보스 소유 탄은 녹색 독탄으로 통일한다. 기존 화염 혜성 외형 설명보다 `docs/5.1임펙트디자인/DRUID_POISON_PROJECTILES.md`가 우선한다. 화마귀16f 구체의 녹색 질감 버전을 사용하고 피해 EL.P 및 실제 HP 피해시 중독+3을 적용한다. 기존 Q/E 분류는 보존한다. 추적지뢰도 드루이드만 녹색 구체240px로 교체; 다른 보스/소환 잡몹은 제외. 독립 녹색 ORB는 유지. 교체목록 전체 완료는 아님.

| 항목 | 구현 계약 |
|---|---|
| 대상 | si0/si3의 ib=true 보스가 발사한 탄. `_spawnBossProjectile(e,props)`에서 `_druidPoison` 표식 부여. 소환 잡몹 및 다른 보스 제외 |
| 독 속성 | 독 전용 EL 번호는 만들지 않는다. 기존 독의 EL.P=0 기반 피해와 P.poison 상태이상을 사용. col=#66dd22 |
| 패링 | 변환 전 `_projectileParryClass` 값을 p.parryClass에 보존. Q/E/패링금지 구분 유지, blackBean은 Q 전용 유지. 반사 후에는 기존 아군 탄 외형 사용 |
| 비행 아트 | 화마귀 `img/proj_firedevil_orb.png` 4×4/16f를 1회 grayscale→multiply #66dd22→원본 alpha 마스크로 베이크. 픽셀 질감 유지. 프레임70ms, source-over |
| 비행 크기 | 기본 일반 max(96,min(180,(sz\|\|4)×24))px, elemBall 및 추적지뢰240px. 2026-09-10부터 적대 원본 physical만 `_physicalProjectileMultiplier(p,2)=2`을 곱해 일반192~360px; 원본 magic/forbidden·추적지뢰는×1. 피해 EL.P만으로 물리 배율을 정하지 않음. 판정 반경은 시각 크기로 변경하지 않음 |
| 리듬탄 | 기존 발사 속도/주기/발수 입력 유지. 화염 입력 프로필을 owner wrapper에서 독으로 정규화. 집광/Q 텍스트 녹색 |
| 피격 | `_hurtProjectilePlayer`가 druidPoison 옵션 전달. hurtP에서 최종 HP 피해 a>0일 때 P.poison+=3. 무적/회피/무피해에는 신규 독 부여 없음. 기존 중독 감소/틱 공식 재사용 |
| 화상 | 드루이드 빨콩의 기존 _rbBurn 추가는 금지. 중독으로 대체 |
| 추적지뢰 | `_druidMine` 소유 표식, 녹색 화마귀 구체240px, 대기alpha .65/활성1. 실제 피해시 중독+3. 기존 추적/준비/수명 유지 |
| 독립 ORB | 이미 녹색 드루이드 8f 시트와 중독+3/속박을 쓰는 별도 G._druidOrbs 경로 유지 |
| 풀 재사용 | spawnProj 재사용시 _druidPoison=false, _druidParryClass=null 초기화. 다른 적에게 표식 누수 방지 |
| 범위 제외 | 보스 근접공격 및 모든 장판 재디자인은 이번 탄막 요청 범위가 아님. 보스 VFX 교체 목록 전체 작업은 별도 |

## 검증

- owner-aware 테스트: stage0/3/4 × ib true/false에서 드루이드 소유자만 표식 획득.
- 관련 테스트 7개 PASS(소유자, 리듬탄, 풀, 문법).
- `tmp/verify_druid_poison.py`: 실제 브라우저에서 드루이드 탄 poison=true/el0/green/Q, 일반 몬스터 false/el1 확인, pageerror0.
- `captures/druid_poison_projectiles.png`: 녹색 재질·16f 시트 경로/일반과 대형 크기 확인. 모든 패턴 장시간 교전 검수는 미실시.

## 2026-09-16 투사체 재검수

| 변경 | 현재 상태 |
|---|---|
| 검수 보강·예외 수정 | 실제 돌진형22/30/43의 충전 완료 발사와 물리6프로필 외형 확인. 드루이드 이미지 실패 시에도 녹색 본체를 표시. [검수 범위·폴백 수치·69개 테스트](../8.0몬스터디자인/PHYSICAL_PROJECTILE_AUDIT_20260916.md) |


## 2026-10-03 source27 — 새 스테이지의 드루이드 공격 상태 초기화

| 정확 key / 적용 위치 | 현재 값·동작 | 보존 경계 |
|---|---|---|
| `G._druidOrbs` / 일반 `initStage(si)`의 기존 보스 패턴 정리 끝 | 새 빈 배열 `[]` | 이전 스테이지 ORB 객체는 수정·재사용하지 않음. 현 스테이지 ORB producer/접촉/피해/수명 코드 불변 |
| `G._druidOrbT` | 0 | 이후 실제 tick에서 다시 증가. 기존 110f/3발/6.8 frame 속도 불변 |
| `G._druidParryT` | 0 | 이전 스테이지 Q 리듬탄 누적 시간만 제거. 주기·수량·피해·Q/E 규칙 불변 |
| `G._druidParryVolley` | 0 | 이전 웨이브 번호 제거. 이후 기존 발사 시 다시 증가 |
| 양판 코드 | `G._lavaField=null;G._gwPillar=null;` 뒤 각70B 추가 | `_enterBossArena`·retry field 복귀에 이미 있는 네 초기화와 동일. 새 helper·전역정리·삭제0 |
| 다른 분기 | bosstest early-return는 기존 arena 초기화 위임 유지 | 사망 대기/부활 중 clear 추가0. HP50%/180f·si3 피날레·field snapshot46key·save schema·P/INV·플레이어 VFX 불변 |
| 검수 | 원본16개 중4PASS/12FAIL → 후보18PASS → 생산18+기존필드50+사망음향36=104PASS | 실제 전체 initStage 및 실제 ORB tick 원문 실행. 맵/적 생성·render/audio는 대역; 원본/후보 정상stage 전체G/P/events 동일. native·전체맵/청취 인수 아님 |
| Mac / 진행 | source27 코드 checkpoint 시점에는 새 앱 포장 전이었음(후속 현재 포장은 아래 표) | source26/3401은 이전 코드의 실제 숲1·일반 사망 retry·inventory 이력 보존. 이번 CUA 관측은 맥 잠금으로 중단, 사용자 해제 질문 대기. 보스/4지역/획득장착/저장재로드 미인수 |

정본·정확 SHA·대역/fixture·§23 보고는 `docs/8.1보스디자인바이블/DRUID_STAGE_TRANSIENT_LIFETIME_20261003.md`를 따른다. 기존 source14 복귀 정리와 source26 음악 예외 계약은 유지하며 이전 문단은 해당 시점 이력이다. native 보스 사망 시 문/몬스터 진행 보존의 완료 선언이 아니다.


## 2026-10-03 source27 Mac 별도 후보 — 포장/파일 검수 완료, 실제 기동 미실시

| 항목 | 현재 정확 상태 |
|---|---|
| 생산 코드 / job | `3c7dc6ab1cb0bc68cc3b969e27d06204fbe0f97f` / `953a5489-91eb-4d43-9c18-f05454ad27a7` / port3402. 일반 initStage 드루이드 ORB=[]/타이머3=0 각70B 포함 |
| 실제 포장 | frozen7918 입력/runtime340 재사용, 새job execute1회. stage/app payload7916 각각 전체SHA·coverage exact, 복사당6645491317B. source3 byte-exact/bootstrap2 역치환 exact/runtimearm64 실행파일5·plist ID 확인 |
| 증거 | physical 영수증31761B / SHA256 `94bcf7fe6ba1af2b39476511bc691b06b54c920ac636c8216f053ea638da385e` |
| 실제 기동 | 새앱 launch0/HTTP0/GUI입력0, profile/saveRoot 아직 존재하지 않음. CUA의 source26 화면 조회는 Mac 잠금으로 실패, 해제 질문 pending. 인증·잠금 우회0 |
| 인수 경계 | 생산104PASS는 이전 코드 검수이며 이번 포장 test반복0. 같은source27 CH1 시작·전투/획득/장착·4지역/보스문·보스 사망/부활/retry 진행보존·실저장·청취·시각 미인수 |
| 이전 실행본 | source26/3401 포함기존12검수앱 존재/plist ID/profile-save metadata만 확인. 내용hash·입력0. source26의 숲1·일반 사망retry·inventory는 이전 후보의 부분 플레이 이력이며 source27완주로 합산0 |
| 보존 | 기존67WIP/manager4/사용자23변경·원래게임/세이브 보존. 사용자 원래앱59376baf/08cac1ce 정확경로UNKNOWN/추측제어0. 삭제·cleanup·설치·새팀·새채팅0 |

앞선 source27 코드 checkpoint에서 “아직 포장하지 않음”은 당시 단계의 이력이다. 현재 실행 가능한 파일 후보는 준비됐으며 실제 Mac 플레이 인수는 대기다. 정확 앱/프로필·저장경로와 원문SHA는 `docs/13출시·마케팅/MAC_CH1_SOURCE27_CANDIDATE_20261003.md`를 따른다. source26 음악 예외·source14 field복귀·46key 진행 보존 계약은 그대로 포함한다.
