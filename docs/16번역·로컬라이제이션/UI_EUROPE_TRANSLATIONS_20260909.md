# 유럽권 UI 번역 보완 — 2026-09-09

현재 Steam 인터페이스·자막 목표의 진행 기록이다. 전체 언어 완료 선언이 아니다. 오디오/더빙은 제외한다.

| 언어 / 파일 | MAIN 보완 키 | EXTRA 키 | 검토 상태 |
|---|---:|---:|---|
| es | 493 | 66 | MAIN 원문 대조·품질 검토 PASS, EXTRA 원문 대조·품질 검토 PASS |
| fr | 488 | 66 | MAIN 원문 대조·품질 검토 PASS, EXTRA PASS |
| de | 488개 완료 | 66 | MAIN·EXTRA 독립 스펙·품질 PASS, 2차 보완 기록 참조 |
| ptbr | 488개 완료 | 66 | MAIN·EXTRA 독립 스펙·품질 PASS, 2차 보완 기록 참조 |
| it | 489개 완료 | 66 | MAIN·EXTRA 독립 스펙·품질 PASS, 2차 보완 기록 참조 |
| ru | 488개 완료 | 66 | MAIN·EXTRA 독립 스펙·품질 PASS, 2차 보완 기록 참조 |
| uk | 488개 완료 | 66 | MAIN·EXTRA 독립 스펙·품질 PASS, 2차 보완 기록 참조 |

위 EXTRA 7개 언어 462개와 일본어 EXTRA 66개, 합계528개는 함께 검토했다. 필수 키·중복·치환 변수·숫자·HTML·입력 바인딩·BGM ID를 대조했다. 원어민 감수 결과를 의미하지 않는다.

## 일관성 보정

| 항목 | 적용 계약 |
|---|---|
| 기본/합체 스킬 구별 | `terminology.json`의 뇌전창을 기본 스킬 이름으로 사용. 예: ES Estaca de Trueno / FR Pieu de foudre. 합체 전격의창은 ES Lanza del trueno / FR Lance du tonnerre |
| 등급 필터 | 영웅 이상은 기존 MAIN의 영웅(Heroic 계열) 등급명과 일치. Epic 계열로 새로 번역하지 않음 |
| 환불 대상 근성 | ES Tenacidad, PTBR Resistência. 확인창과 능력치 화면의 명칭 일치 |
| 배정된 스킬 키 | ES `tecla asignada a la habilidad`. Space 키라는 오해가 생기는 표현 제거 |
| ES 기존 스킬명 | Penitencia, Señuelo Fantasma/Explosivo, Rayo Rastreador, Torbellino-Det, Torbellino, Detonación, Ala Escudo를 제목·선행조건·합체 설명에 일관 적용 |
| 합체 제목 | 기본 MAIN과 EXTRA를 실제 우선순위로 합친 뒤 제목·참조 일치 여부 검토. 오염된 중복 `_BASE` 문자열을 실제 MAIN 값으로 오인하지 않음 |
| 안전한 분해 안내 | PTBR 즐겨찾기 보호 문구는 분해하지 않음을 명시. RU 전체 쓰레기 분해에 원문에 없는 선택 조건을 추가하지 않음 |

## 원문 설명과 런타임 사이의 확인 사항

| 항목 | 현재 확인된 사실 / 후속 처리 |
|---|---|
| 탄막블랙홀 성장 | `_ult10xMul=1+(Lv-1)*9/19`. Lv1=1, Lv20=10이며 기본8에 곱함. 한국어 `Lv당×10 성장`은 매 레벨10배로 오독 가능. ES/FR은 레벨에 따라 추가 배율이10배까지 성장한다는 의미로 번역 |
| 탄막블랙홀 거리감쇠 | `max(0.3,1-d/blastR)`로 최소30% 유지. 피해가 일률적으로30% 줄어든다는 뜻이 아님 |
| 악의기둥 합체 | 현재 합체 정의 `giantSlam2 + darkPillar`에 맞춰 한국어·영어 원문과 작성 완료9언어를 지옥강타2로 보정. 피해는 `EL.D` 어둠이며 번개로 오역된 ZH/ZHT/ES/FR도 수정 |
| 공성쇠뇌 재사용 | 실제 설치 게이트 `_gxCd=1200`으로20초. 긴/짧은 한국어·영어 설명, `SKILL_LIST.cd=1200`, 작성 완료9언어 및 원본/작업 레지스트리 동시 보정. 철거는 무료·재사용 대기와 무관 |

위 불일치는 기존 동작을 변경할 근거로 사용하지 않는다. 후속 보정은 실제 동작에 설명을 맞추는 범위로 처리한다.
