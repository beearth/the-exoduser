# 업화선 번역 원문 교정 — 2026-09-09

> **2026-09-10 마법 공격 2배:** `pMagicMul(forAttack=true)=_passDmgSum('magic')×(1+_uHelmMagic)×2`. 아래 공식의 `pMagicMul()`에 이미2배가 포함되므로 스킬 계수·후속 폭발·DOT에 다시 곱하지 않는다. `pMagicMul(false)`는 Q패링 장비스케일 전용으로 기존 값을 유지한다. 계수 표의 숫자는 이 공통 배율을 곱하기 전 값이다. [상세 계약](../14밸런스+수치테이블/MAGIC_ATTACK_DAMAGE_20260910.md).


번역 감사에서 발견한 MP10·DEX·유도 오기는 기존 실행 코드와 달랐다. 긴/짧은 KO·EN 설명과 27개 추가 언어를 실제 동작으로 교정했다. 아래는 현재 실행 코드의 계약이며 게임플레이 변경은 없다.

| 항목 | 현재 값·공식 | 적용 위치 |
|---|---|---|
| id / 이름 | fireBeam / 업화선 | 스킬 도감·장착 팝업 |
| 시작 / 발사 | 우클릭으로 차징 시작, 재입력으로 발사. 300프레임=5초에 자동 발사 | `_startFireBeamCast`, update |
| MP | `floor(50*(1+(Lv-1)*0.12))`, 차징 시작에 지불. Lv1=50, Lv5=74, Lv10=104 | `_startFireBeamCast` |
| 쿨다운 | `floor(60/pMagicSpd())` 프레임. 초 단위 정확값 `floor(60/pMagicSpd())/60`. UI의 `1/시전속도`는 프레임 내림 전 표기 | `fireHellfireBeam` |
| 시전속도 | `(2+PASSIVES.pMagic*0.08)*(1+castSpeed+headbandCastSpd)` | `pMagicSpd`; DEX 미사용 |
| 차징 | `sec=min(P._fbT,300)/60`, `chargeMul=max(10,sec*40)` | 즉발×10, 1초×40, 5초×200 |
| 스킬배율 | `_skMul=3+(Lv-1)*2.4*0.5` | `_SK_MUL.fireBeam`, `_skMul` |
| 직접 피해 | `floor(magicRef()*statInt()*pMagicMul()*pBeamMul()*_skMul('fireBeam')*_fuseMul('fireBeam')*chargeMul)` | `fireHellfireBeam` |
| 관통 | `pierce=1`, `pierceMax=floor(100+sec*20)` | 즉발100, 최대200회 |
| 이동 | 조준 방향 직선 투사체, vx/vy 각 방향성분×14, 유도 없음 | `fireBeamProj` |
| 사거리 | `700+(Lv-1)*50` | Lv1=700, Lv10=1150 |
| 폭발 | 반경 `floor((100+Lv*8)*2)`, 피해 `floor(직접피해*0.6)` | `explR`, `explDmg` |
| 속성 | `EL.F` 화염·화상 | 투사체 속성 |

자원 소비율은 차징 시간과 발사 후 쿨다운에 따라 달라지므로 고정 MP10/초 또는 단일 DPS 순위를 표시하지 않는다. 기존 밸런스 보고서의 MP10·DEX·유도 기반 순위는 과거 분석이다.

### 2026-10-03 root source42 — 투구 beamDmg 비숫자 소비 방어

| 항목 | 현행 계약 / 검수 근거 |
|---|---|
| 변경 위치 | game.html / game-easy-test.html pBeamMul 각각 unary + 1바이트 추가 |
| 공식 | pBeamMul = 1 + Math.max(0,(+hm().beamDmg \|\| 0)) * 0.08 |
| 정상 값 | 숫자 및 숫자 문자열은 기존 Math.max도 숫자 변환한다. 5와 "5"는 모두 1.4배; 음수는 0보너스. 정상 동작/수치 변경 없음 |
| 잘못된 문자열 | "ab"가 복원되면 기존 NaN 배율로 업화선 투사체 dmg=0; 수정 후 0보너스=1배. raw 저장 필드 자체는 바꾸지 않음 |
| 실제 소비 검증 | whole dbSave/dbRestore/equipItem/hm/pBeamMul/fireHellfireBeam/hurtE + update의 실제 투사체 피해 계산/호출 구간 추출. 충돌 대상은 시험이 공급하며 full update/충돌 탐색/폭발/사망/AI/native는 실행하지 않음 |
| 재현값 | magicRef=10, INT=2, pMagicMul=2, skill=3, fuse=1인 합성 조건: 차징0/60/300f의 투사체 1200/4800/24000. 기존 "ab"는 dmg0→적 HP 최소피해1, 수정은 1200/4800/24000. 실제 플레이어 피해로 보고하지 않음 |
| 검사 | test/beamDamageConsumption.test.cjs 38PASS; 수정 전 24PASS/14 assertion FAIL은 같은 결함의 사례. 정상11값 양판, bag→장착/장착복원, 차징3시점, JSON저장 재복원, 비활성시전 방어. inline JS12/importmap2 문법 검사 포함 |
| 유지 | 정상 helmet 생성 beamDmg=1.5+tier*1.2 후 소수1자리 number; beamDmgPct 어픽스/기존 피해 공식·배율·스킬비용·쿨다운·관통·보호2_3 변경0. Infinity 등 유한범위 방어는 이번 수정 범위 아님 |
| 검수 한계 | ordinary omniBeam/hellRay의 전체 공격 상태머신 및 native 플레이/화면/청취 미인수. _beamDmgBase는 local const이며 독립 whole function이 아니다. 원 보고의 전체 빔 0 HP피해 주장은 채택하지 않음 |
| 실행 앱 | 기존 앱 source29/3404는 source42 소스를 포함하지 않는다. 같은 후보의 시작→획득→게이트→보스사망/부활→재도전 native6 인수 대기 |

원 후보 QA0847 completion 934bbe9d-f58c-4e59-917f-dbb6f624cb66을 codeepoch41 위에서 root 검증했다. 백업·원 완료·후보·전후 docs전체 pBeamMul/beamDmg/_beamDmgBase/fireHellfireBeam 검색·전후 검사·정확 HTML역치환·보호67경로 SHA·Git/원격 영수증은 tmp/mac-migration-runtime/continued-review-20261003/source42-beam-damage/에 보존한다. scope8=HTML2/test1/docs5. 감독의 docsraw checkpoint cd5a03ad와 코드epoch을 구분하며 기존 팀 TASK/원자료 핀을 소급 변경하지 않는다.
