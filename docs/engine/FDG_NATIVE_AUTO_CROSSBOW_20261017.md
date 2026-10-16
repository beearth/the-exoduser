# Native normal 자동 석궁 — 2026-10-17

상태: **통합 작업 중, I 작업본만 변경. R/공식 main 미반영. 게임 기능 완료 아님.**
원본 기준은 GitHub main f8a8889846e53f5c063c24f469b080c8de415b6e의 game.html이다.
화살 public visual provider는 미확정이며, 새 controller는 실제 화살 표시 factory가 없으면 발사를 거부한다. 적 comet·절차형 대체 화살·보이지 않는 볼트를 완료본으로 사용하지 않는다.

| 계약 | 현재 구현/원본 값 |
|---|---|
| 입력 | game.html:13220 KeyT, 게임 동작 중·일시정지 아님·repeat 아님. Main의 auto_crossbow=KEY_T → 실제 controller.toggle |
| 시작 | 원 _xbowEquipped=true. 현재 원 옵션 xbowAuto가 bool일 때만 초기 덮어쓰기. native T 변경은 현재 세션만, 저장 API 호출 없음 |
| 현재 장비 | 실제 SourceState INV.equipped.bow 필요. 새 장비·빈 장비 대체 생성 없음 |
| 현재 계산 | bowRef는 기존 reference_for_kind의 bow/dex/Dex 경로. 공통 강화×0.25·flat·baseAtk·DEX·레벨·봉인 평가 순서 재사용 |
| 피해 패시브 | 기존 pass_dmg_sum에 bow: pBow×0.15, xbow: (pXbow 또는0)×0.05 추가. 공통 pAtk×0.10·altAtk·pHuman×0.05·최종×0.7 보존 |
| 기본 발사 피해 | ToInt32(bowRef×pBowMul×pXbowMul×bowType.atkMul+28)×3. normal은 statDex를 별도로 곱하지 않음 |
| 종류 | crossbow 범위800/속도22/atkMul1.0; repeater 700/22/0.65; arcane 840/22/1.4. 원 bow type 미지정/미등록 시 crossbow type 기본값만 재사용 |
| 범위 | max(220,(max(bowRange 또는0,type.range)+(bonusRange 또는0)×12)×(1+pBow×0.08)) |
| 간격 | 120/((bowSpd 또는1)×(1+(pXbow 또는0)×0.05)), 원 World tick 사용 |
| 표적 | 기존 World query 명부, alive이며 거리<range인 최근접. 같은 거리에서는 먼저 읽힌 대상 보존, 새 적/명부 생성 없음 |
| 발사 gate | 현재 Player HP>0, T ON, 실제 장비, interval 도달, 표적, ST>최대ST×0.2. 충분한 전체 비용 gate를 추가하지 않음 |
| 비용 | (1.5+(fanShotLv 또는0)×1.5)×max(0.60,1-pBow×0.04)×(1+min(0,stCostRed)). 발사 후 보관한 ST에서 max(0,before-cost), Q/E 비용 함수 재사용 없음 |
| 볼트 | 원점+방향×10, 반경3, normalBow/ghostXbow, 기본 관통확률0/횟수0, 직진·비유도 |
| 수명/벽 | 이동→거리>range 만료→벽. 절반거리 이전에는 최대2회 반사, 원 5회 추가 stepback 및 축 반전 순서 보존 |
| 적 접촉 | 거리<적 반경+3, 현재 factory element_id에 원 elMul 적용 후 ToInt32. 살아남은 첫 적에서 소멸, 처치한 적은 1회 기록하고 kill-pierce |
| 원소 | F↔I, D↔L, D↔H, E↔L=2; 같은 비물리=0.5; 그 외1 |
| 생존 독립성 | 생성된 볼트는 T OFF/장비 제거/플레이어 사망 후에도 기존 World tick에서 전진, 현재 World 폐기 시 함께 종료 |
| 소유 | Main mount·입력, World의 실제 clock/query, 현재 source provider bundle, 기존 resource authority의 별도 normal 비용 commit |
| 실행 순서 | controller physics priority1로 기존 priority0 World/Player phase 이후 소비. 새 전역 clock 없음 |
| 거부 범위 | 비normal bow skill, pet xbow 원점, 양수 _lBowCrit/_uBowPoisonRicochet, 누락·비유한 값·지원하지 않는 scalar shape |
| 현재 receiver 한계 | 기존 Enemy.receive_damage raw 경로. full hurtE의 crit/쉴드/affix/상태·희귀몹 반응 이식 완료 아님. 기존 HP/ATK/poise/QE 수식 수정 없음 |
| 시각/소리 | 원 arrow public provider 미확정. 시각 factory 미바인딩은 명시 NOT_READY. 원 샘플/파티클·cosmetic RNG 이식 미완료 |
| 검증 | 최초 owned headless 81개 PASS. 이후 pre-fire ST capture 순서 교정의 영향 runtime18개 PASS(기존49원소/참조계산 재실행 없음). fixture만 실행, 실제 Main/게임·전체 asset import·사용자 창·저장·API·PC 실행 없음 |
| 전체 버전 | latest_full_game=false 유지. 이 단위와 최신 원본 전체 이식 완료를 구별 |

다음 조건을 모두 확인해야 플레이 가능한 normal 자동 석궁의 인수를 요청할 수 있다: 승인된 실제 원 화살 표시 연결, 실제 Main T→controller→표적/발사/후비용→독립 수명 연결, 해당 새 범위 검증, receiver와 미이식 효과의 정확한 범위 공개. 순수 계산 helper/합성 fixture 통과만으로 완료를 기록하지 않는다.

검사 이력: 첫 oracle 준비 regex 과이스케이프 오류는 실행 전 수정했다. 최초 Godot81 검사는 PASS. ST 보관 위치를 원 발사 전으로 교정한 후 별도 runtime18 subset을 만들다가 fixture local 누락으로 parse 실패했으며, 해당 fixture만 수정해 PASS했다. firstWholeClean=false이며 이력을 성공으로 소급하지 않는다. 제품 코드 파싱 실패나 실제 게임 실행 결과로 바꾸어 보고하지 않는다.
