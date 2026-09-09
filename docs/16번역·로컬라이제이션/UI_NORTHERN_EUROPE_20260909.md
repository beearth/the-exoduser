# 북유럽·네덜란드 UI 보완 — 2026-09-09

Steam 인터페이스·자막 목표 중 핀란드어·스웨덴어·덴마크어·노르웨이어·네덜란드어 MAIN 누락 문구를 보완했다. 전체 적용·검증 상태는 [언어 범위](STEAM_LANGUAGE_SCOPE_20260909.md), 공통 수치와 원문 계약은 [유럽권 통합 기록](UI_EUROPE_TRANSLATIONS_20260909.md) 및 [2차 보완 기록](UI_EUROPE_BATCH2_20260909.md)을 따른다. 더빙은 이번 작업에 포함하지 않는다.

## 소유 파일과 수량

| 코드 | 파일 | 필수 키 | 작성 키 | 자동 구조 검사 | 별도 원문·품질 검토 |
|---|---|---:|---:|---|---|
| fi | `localization/ui/fi.json` | 488 | 488 | PASS | PASS |
| sv | `localization/ui/sv.json` | 488 | 488 | PASS | PASS |
| da | `localization/ui/da.json` | 488 | 488 | PASS | PASS |
| no | `localization/ui/no.json` | 488 | 488 | PASS | 독립 검토 후 접기 버튼 교정 반영 |
| nl | `localization/ui/nl.json` | 488 | 488 | PASS | 통합 담당 전체 검토, 독립 검토 미완료 |
| 합계 | MAIN 5개 | 2,440 | 2,440 | 전부 PASS | — |

`ui-source.json` 576개 중 `ui-needed.json`의 언어별 작업 목록이 기준이다. 각 파일은 필요한 한국어 키를 그대로 유지하며 정확히 488개씩 작성했다. 스킬 긴·짧은 설명, 합체·강화 템플릿, 추천 빌드, 전투·보스 종료 안내, 스탯·패시브 투자와 환불, 인벤토리·제작, 로비·로딩·오류 문구를 포함한다. 외부 번역 API를 사용하지 않았다.

기존 기본명은 `tools/localization-catalog.mjs`의 `loadCatalogs().tables[code]`로 유효 MAIN을 확인했다. 잘못 삽입된 중복 `_BASE`의 값은 근거로 삼지 않았다. 각 언어의 `ui-extra` 66개는 별도 담당의 완성본을 읽어 참조했으며 수정하지 않았다. 공통 명칭 교정은 아래와 같이 통합 담당에게 보고했고, 담당이 `terminology.json`의 단독 키를 갱신했다.

## 명칭 계약

| 항목 | fi | sv | da | no | nl |
|---|---|---|---|---|---|
| 설치형 기본 뇌전창 | Salamapaalu | Blixtpåle | Lynpæl | Lynpåle | Bliksempaal |
| 합체 전격의창 | Salamakeihäs | Blixtspjut | Lynspyd | Lynspyd | Bliksemspeer |
| 근성 | Sitkeys | Uthållighet | Udholdenhed | Utholdenhet | Taaiheid |
| 만화방창 | Neulasuihku | Nålspärr | Nålesalve | Nålesalve | Naaldsalvo |
| 칼등날개 | Kilpisiipi | Sköldvinge | Skjoldvinge | Skjoldvinge | Schildvleugel |
| 기동칼날개 | Ketjumiekansiipi | Kedjebladsvinge | Kædeklingevinge | Kjedeklingevinge | Kettingbladsvleugel |
| 선택 공용 라벨 | Valinta | Val | Valg | Valg | Keuze |

기본 설치형 창과 합체 창, 칼등날개와 기동칼날개를 구별한다. 영웅 등급은 기존 MAIN의 Heroic 계열 명칭과 연결한다. 추가 합체 제목과 참조는 `ui-extra`와 맞췄다. 스킬명은 문장 안에서 해당 언어의 격변화나 합성어 형태로 사용한다.

| 언어 | 기존 문제 | 본문 및 공통 명칭에 적용한 교정 |
|---|---|---|
| fi | `Giant Isku`, `Kilpi Wing`, `Haamu Decoy`, `Spike Ansa`, `Jää Orb`, `Jää Storm`, `Tracking Salama`의 영어 혼합 | Jätti-isku, Kilpisiipi, Aavehoukutin, Piikkiansa, Jääpallo, Jäämyrsky, Hakeutuva salama. 추적암전의 중간안 Seuraava salama는 ‘다음 번개’로 읽힐 수 있어 최종적으로 Hakeutuva salama를 사용 |
| sv | 바늘 공격이 광선으로 번역됨, 회전기폭의 무의미한 표현, 명사 성·합성어 문제 | Nålspärr, Virveldetonation, Helig domän, Fantomlockbete, Genomborrningsdomän |
| da | 바늘 공격의 광선 오역, 회전기폭의 무의미한 표현, Åndeganggang 중복, 칼날개 어순·허수아비 명칭 문제 | Nålesalve, Hvirveldetonation, Åndevandring, Kædeklingevinge, Skjoldvinge, Fantomlokkemad, Eksplosiv lokkemad, Tornfælde |
| no | 바늘 공격의 광선 오역, 회전기폭의 무의미한 표현, Kjededestruction 영어 혼합, 칼날개 어순·합성어 문제 | Nålesalve, Virveldetonasjon, Kjedeknusing, Kjedeklingevinge, Ondskapsstorm, Fantomlokkemat, Eksplosiv lokkemat |
| nl | 바늘 공격의 광선 오역, 사슬 계열의 독일어 Ketten 혼합, Kwaaadstorm 오타와 합성어 문제 | Naaldsalvo, Kettingverwoesting, Kettingvlam, Kettingdash: Inslag / Kettingdash: Vlam, Kettingbladsvleugel, Schildvleugel, Kwaadstorm, Fantoomlokvogel |

도감 등록은 등록 동작, SP 부족은 뒤에 보유·필요량을 붙이는 경고로 번역했다. 저사양 모드는 저사양 PC용임을 명시한다. 배정된 스킬 키는 Space로 오해되지 않도록 ‘해당 능력에 배정된 키’로 썼다. 덴마크어 프레임은 액자를 뜻할 수 있는 billedrammer 대신 billeder로 교정했다.

## 수치·동작 보존

| 항목 | 번역에 반영한 계약 |
|---|---|
| 탄막블랙홀 성장 | 기본 ATK×8에 별도 배율 `_ult10xMul=1+(Lv-1)*9/19`가 적용되어 Lv20에서 최대×10에 도달한다. 매 레벨×10 누적 성장으로 번역하지 않았다. 이 설명에는 원문에 없는 숫자 20을 1개 보충했다. |
| 블랙홀 거리감쇠 | 감쇠 후 피해 하한 30%를 명시했다. 일률적인 30% 피해 감소로 쓰지 않았다. |
| 번개와 어둠 | 유령화 종료 `rainLightning`과 설치형 `maliceStorm`의 `EL.L`은 번개다. `darkPillar`는 `EL.D` 어둠 피해로 유지한다. |
| 악의기둥 합체 | 교정된 한국어 원문에 따라 지옥강타 2와 합체한다. |
| 4단 암전포이즈 | 원문과 보조 EN DarkPoise 표현을 유지하며 미확정 원소를 임의로 번개로 단정하지 않는다. |
| 공성쇠뇌 | 긴·짧은 설명 모두 설치 재사용 대기 20초를 보존했다. 무료·대기 무관 철거의 실제 동작은 공통 통합 기록을 따른다. |
| HP 조건 패시브 | 적 HP ≥70%, 적 HP ≤30%, 자신 HP ≤30%로 경계값 포함을 명시했다. |
| 독혈 자동발사 | 칼날 발사 시에 자동으로 발사된다는 발동 조건을 명시한다. |
| 초고속 바늘 | 보조 영어에 빠진 Lv당 피해 +100%를 한국어 원문대로 포함한다. |
| 화염 유도빔 | 직선 차징/재입력 발사·최대5초·레벨별 MP·시전속도에 의한 쿨다운으로 전체 언어를 교정했다. DEX는 적용되지 않는다. |
| 조작 | 물리탄 E, 보라·무지개 마법탄 Q를 유지한다. Shift/Space/CT/Ctrl/Q/E/F/L/R/T/K 등 키 철자를 바꾸지 않는다. |

## 검사 기록

| 검사 | 결과 |
|---|---|
| JSON 파싱 | 5개 파일 전부 성공 |
| 필요 키 누락 / 불필요 추가 키 / 빈 값 | 각각 0 |
| 치환 토큰 철자·중복 횟수 | `{p0}`·`{n}` 등을 멀티셋으로 비교해 전체 일치 |
| 숫자 | 원문 멀티셋과 일치. 위 블랙홀 Lv20 보충만 허용 |
| HTML 태그·`&nbsp;` | 전체 일치 |
| 한글 잔류 / 보조 영어와 동일한 긴 문장 | 각각 0 |

핀란드어·스웨덴어·덴마크어는 독립 원문·품질 검토 PASS와 선택적 명료화 요청 반영까지 완료했다. 노르웨이어는 독립 스펙 PASS 및 품질 검토의 `Slå sammen`→`Fold sammen` 교정을 반영했다. 네덜란드어는 통합 담당이 전체488행을 읽고 `돌진충전`을 `Afkoeltijd stormloop`, 설치창/전기 아크 피해를 `Paalschade`/`elektrische-boogschade`로 명료화했다. NL·EL 독립 검토 담당은 세션 사용량 제한으로 완료하지 못했으므로 독립 PASS로 표기하지 않는다. 스탯 약어·키 바인딩·코드 식별자·통용 차용어는 영어 미번역 문장으로 취급하지 않는다. 독립 검토 및 자동 검사를 원어민 감수나 브라우저 화면 검사 완료로 표시하지 않는다.

`rg -l '번역|로컬라이제이션|뇌전창|지옥강타' docs --glob '*.md'`로 관련 문서를 다시 검색했다. 번역 가이드·이전 번역 기록의 현행 계약을 적용했다. 이 작업에서 편집한 파일은 MAIN 5개와 이 문서뿐이다. EXTRA·게임 수치·런타임·컴파일러·번들·공통 명칭 파일 및 커밋은 통합 담당 범위다.
