# DEMO11-24 — 데모 장비 affix 소비

2026-10-21 · 기능 검증 제출 / 보호 소비 인계. 브랜치 `codex/demo11-24-20261021`. fetch한 `origin/main=0138c5bb9188d27cee10cb1a901d075092ddb88f`에 인수된 22r `d276e02ed3bc8c6610c2a3d5c1404c14a515fe3c` 정상 merge(FF). 다른 미병합 브랜치 반입 없음. R 체크아웃·인덱스·작업 파일 보존, main push·force·rebase·reset 없음.

| 구현·범위 | 결과와 원본 근거 |
|---|---|
| 데모 롤 확정·빈도순 | G16646–16650 `_DEMO_MODE`/stage0/금지7, G14364–14856 풀409레코드/407id, G15131–15178 롤·16슬롯, G16107–16114 팔찌2분기, G32002–32033 등급별 드랍. 후보398레코드/396id. 일반·엘리트·미니·스테이지보스 각각 성공한 드랍100,000회 원본 함수를 실행한 고정seed 관측표. 실제 몬스터 비율·합산 플레이 빈도는 미확인. 정확 확률·전투 자연 획득 실측으로 보고하지 않음 |
| 스탯형18 | G27902–27966 applyStats와 G16425–16432 recalcSt, `_grit*`/`pPredSpd` 원본 참조. 기존22r의 PC `equipment_refresh` 1회 재사용. 동일 장비 affix 없음/있음 대조·실제 INV 장착/해제·20필드 원본 JS exact Number 비교. 수식·tiers·소비 데이터 새 owner 없음. 결과에 effect id별 소비 receipt만 덧붙임 |
| 보호 소비 | hurtE 직접 소비72고유id/73레코드는 개별 `NOT_READY / PC_hurtE_protected`; 나머지306id는 `NOT_READY / consumer_not_verified`. 혼합 장착 receipt는 PARTIAL. 합산 캐시 값이 있다는 사실을 효과 구현 완료로 세지 않음. 전설19·유니크39 특수stat/implicit17은 ITEMS 추적 참조, 이번396 affix 분모에 합치지 않음 |
| PC 인터페이스 요청 | 전체 id별 원본행·등급별 빈도·소비 경로는 [docs/7 표](../../../7아이템디자인/DEMO11_24_EFFECT_CONSUMPTION_20261021.md). 외부 `pc-request-ids.json`에72id 전수·나머지306id·데모필터 차이7id 저장. 실제 hurtE 소비/상태·처치 readback 계약 요청. native drop 생성기는 정식경로로 demo 금지필터 비활성(:62), 호출자는 보호 hurtE여서 수정하지 않음. native 데모 허용 목록 적용 완료로 보고하지 않음 |
| 변경 줄·공용 | `native_inventory_equipment.gd:135` +1/-0: 성공 transaction receipt에 observer 결과 추가. Main0줄/State0줄/Player0줄/hurtE0줄/저장0줄. 새 observer는 실제 INV와 성공한 PC receipt만 관찰하며 기존 affix reader 재사용, 조회 전후 cache token identity 보존. tick callback·목록생성 API·공유 RNG·피해 호출0 |

| 검증 | 통과/실패·관측 범위 |
|---|---|
| 신규 `test_demo11_24_equipment_effects` | **639/0**. 실제 Main·18id 단일 affix fixture, bag↔장착/해제·단일 PC pass·20필드 원본 함수 비교·cache identity·World RNG 불변. hurtE id는 실제 장착해도 NOT_READY, 실패 refresh는 미완료. 자연 드랍 전투·피해 실행·저장 IO는 이 테스트 범위 아님 |
| 기존 장착·PC 회귀 | **735/0** = 기존22r 장착442/0 + PC runtime293/0. 각1회, 기존 파일 바이트 변경0. 장착 원문42사례168필드·PC 원문10사례200필드 비교. PC assertion 수는 동적 callback/환경 관측을 포함한 이번 실행값이며 과거286 수치를 복사하지 않음 |
| 종료·원로그 | 최종 관련 실행 전부 `--verbose`, ERROR/누수/잔류0 확인 후 제출. `_out/demo11-24/`에 gate·stdout/stderr·engine log·원본 oracle·보호파일 hash 보존. 기존 하니스 상수 격리 이름, 신규 `EXODUSER-demo11-24-Isolated-20261021`; 실제 사용자 저장 폴더 사용0·override 실행 후0byte |

빈도 표의 상위 스탯형 순서는 `defFlat → maxHPFlat → shieldFlat → maxMPFlat → maxSTFlat → dexFlat → intFlat → vitFlat → gritFlatR → strFlat → movSpeed → movSpeedOOC → maxHPPct → movSpeedCombat → injuredSpeed → gritFlatN → lifeMaxHP → lifeRegen`이다. 중간에 빈도가 높은 저항·공격·유틸 id도 전체 표에 남겼으며 스탯형보다 뒤라고 임의 재정렬하지 않았다. 빈도는 몹 등급·필터·표본에 따라 달라진다.

판단 근거: 스탯형은 PC 재계산 API에 이미 연결되어 있으므로 같은 효과의 수식·분기를 재구현하거나 재계산을 두 번 호출하지 않는다. 이번 변경은 18id 각각의 실제 소비를 입증하고 transaction 결과에 지원 범위를 명시한다. 단순 문구 변경이나 캐시 합산만을 실제 피해 효과로 포장하지 않는다. 보호 경로는 수정하지 않았고 미지원396−18=378id를 완료로 집계하지 않는다. UI 변경이 없으므로 새 캡처/번역 문자열은 없다. PC 실행·전투 피해·전원 차단·멀티프로세스 저장 검증을 주장하지 않는다.
