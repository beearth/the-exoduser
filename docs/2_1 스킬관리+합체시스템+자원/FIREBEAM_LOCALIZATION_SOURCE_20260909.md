# 업화선 번역 원문 교정 — 2026-09-09

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
