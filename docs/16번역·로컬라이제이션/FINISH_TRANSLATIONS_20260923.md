# Steam 언어 마무리 번역 데이터 — 2026-09-23

## 범위와 입력

고정 Windows 검증 패키지의 누락 감사 `output/steam_languages_finish_20260923/missing.json`을 기준으로 27개 비한국어·비영어 로케일의 누락 40키씩, 총 1,080개 번역을 추가했다. 데이터 경로는 `localization/finish/<code>.json`이다. 원문 키는 정확한 한국어 런타임 문자열이며 한국어 수치·의미가 기준이다. 영어 참고의 `WingDMG`는 이 작업에서 **불꽃칼날 피해**로 해석했다.

| 항목 | 값 |
|---|---|
| 대상 로케일 | 27 |
| 로케일별 항목 | 40 |
| 전체 번역 | 1,080 |
| 원문/기존 용어 참고 | missing.json, missing-source.json, localization/terminology.json, localization/ui/*.json, localization/resume/*.json |
| 데이터 형식 | UTF-8 JSON 객체, 한국어 원문 키 → 대상 언어 문자열 |
| 통합 담당 | 빌더·런타임·패키지·커밋은 상위 통합 작업에서 처리 |
| 검증 범위 | 데이터 구조·원문 수치·변수·제어키·공식 보존 |
| 품질 판정의 범위 | 원어민 감수 인증이 아니며 실제 화면 줄바꿈·RTL·잘림은 통합 패키지 QA에서 확인 |

## 언어별 적용 현황

| 코드 | 경로 | 번역 수 | 키 집합·공백·변수·수치·공식 |
|---|---|---:|---|
| zh | localization/finish/zh.json | 40 | PASS |
| zht | localization/finish/zht.json | 40 | PASS |
| ja | localization/finish/ja.json | 40 | PASS |
| es | localization/finish/es.json | 40 | PASS |
| fr | localization/finish/fr.json | 40 | PASS |
| de | localization/finish/de.json | 40 | PASS |
| ru | localization/finish/ru.json | 40 | PASS |
| ptbr | localization/finish/ptbr.json | 40 | PASS |
| it | localization/finish/it.json | 40 | PASS |
| vi | localization/finish/vi.json | 40 | PASS |
| th | localization/finish/th.json | 40 | PASS |
| id | localization/finish/id.json | 40 | PASS |
| tr | localization/finish/tr.json | 40 | PASS |
| pl | localization/finish/pl.json | 40 | PASS |
| cs | localization/finish/cs.json | 40 | PASS |
| hu | localization/finish/hu.json | 40 | PASS |
| bg | localization/finish/bg.json | 40 | PASS |
| el | localization/finish/el.json | 40 | PASS |
| fi | localization/finish/fi.json | 40 | PASS |
| sv | localization/finish/sv.json | 40 | PASS |
| da | localization/finish/da.json | 40 | PASS |
| no | localization/finish/no.json | 40 | PASS |
| nl | localization/finish/nl.json | 40 | PASS |
| ro | localization/finish/ro.json | 40 | PASS |
| uk | localization/finish/uk.json | 40 | PASS |
| ar | localization/finish/ar.json | 40 | PASS |
| ms | localization/finish/ms.json | 40 | PASS |

## 원문 키 목록

아래 번호는 번역 데이터의 등록 순서이며 런타임 ID는 원문 키 자체다. `보유 `의 끝 공백 1개는 조합 UI를 위해 유지한다.

| 순번 | 원문 키 | 적용 위치 |
|---:|---|---|
| 1 | `사슬 이동과 공격에는 서로 다른 키를 지정하세요.` | game.html |
| 2 | `공통 피해 +10%/lv (합연산), ST비용 -4%/lv (최대-40%)` | game.html |
| 3 | `HP/ST리젠 +3%/lv, 물약쿨 -3%/lv (최대30%), 패링회복 +20%/lv` | game.html |
| 4 | `크리률 +1.5%, 크리뎀 +8%/lv` | game.html |
| 5 | `적 HP 70%↑: 뎀+20%/lv. 회복력+5%/lv (항상 적용)` | game.html |
| 6 | `부활확률 +2%/lv, 부활쿨 -30초/lv (최저100초). 부활 성공 시 HP/MP/ST 전부 회복` | game.html |
| 7 | `악의기둥 + 가시덫 → 합체: 기둥가시` | game.html |
| 8 | `칼등치기 + 불꽃칼날 → 합체: 처내기 강화` | game.html |
| 9 | `지옥강타 2 습득 — 기둥강타/용암형 강화용` | game.html |
| 10 | `[이동기] 방향키 더블탭으로 발동. 경직/기절 중에도 탈출 가능. 250유닛 순간이동, 무적(15프레임). MP[(10+(Lv-1)×5)×0.7] + 공용 기동게이지 0.7칸(31.5)을 소모한다. 기본 기동게이지 5칸, Shift 사슬과 공유. 착지 시 전류장판(10초+Lv×0.5초): INT 틱뎀 + 방어력↓(1렙10%, 렙당+5%, 캡50%)` | game.html |
| 11 | `기본 E 불꽃칼날. E 홀드 충전: 풀차지 1.5초. 스킬 Lv당 범위 +5%.` | game.html |
| 12 | `스킬 키로 마우스 위치에 즉시 소환 (최대 1000px, 패드: 조준 후 확정). 2스택 (25초/1충전, Lv10→3스택). 원형 해골벽이 적/투사체 차단. 솟을 때 데미지. 악의 12. 반경 280px+12.6px/Lv, 지속 3초+0.2초/Lv (최대 30초)` | game.html |
| 13 | `[선택: 1~4번] 현재 위치에 가시덫 설치 (1렙 반경300, 10렙435). 슬로우 91%(+2%/Lv, 최대95%)+출혈. INT×magicRef×pMagicMul×(14+5.6×(Lv-1))×0.75. 악의 10, 쿨 10초. Lv당 범위+15` | game.html |
| 14 | `불꽃칼날` | game.html |
| 15 | `E: 쿨타임 완료 시 불꽃을 두른 칼날을 크게 휘두릅니다. 일반 마법탄도 반사. 홀드 풀차지 1.5초, 스킬 Lv당 범위 +5%.` | game.html |
| 16 | `합체 Lv.{p0} \| 처내기뎀+{p1}% 불꽃칼날뎀+{p1}% 쿨감{p2}%` | game.html |
| 17 | `불꽃칼날은 기본 스킬입니다 (1레벨 유지)` | game.html |
| 18 | `불꽃칼날 강화분을 초기화하고 1레벨을 유지합니다.` | game.html |
| 19 | `클릭하여 결정 선택` | game.html |
| 20 | `일괄 작업은 선택한 분류에만 적용됩니다. 장착·해제는 인벤의 장비 소켓에서 가능합니다.` | game.html |
| 21 | `이 분류에 결정이 없습니다` | game.html |
| 22 | `보유 ` | game.html |
| 23 | `1개 분해` | game.html |
| 24 | `이 분류에 분해할 결정이 없습니다` | game.html |
| 25 | `지역 처치` | game.html |
| 26 | `불꽃칼날 [합체]` | game.html |
| 27 | `1레벨부터 기본 보유하는 E 불꽃칼날. E 홀드 풀차지 1.5초. 스킬 레벨마다 범위 +5%. 전방 파워웨이브·투사체 반사·그로기.` | game.html |
| 28 | `출시 준비 중` | 인트로/캐릭터 |
| 29 | `서버에서 삭제를 확인하지 못했습니다. 목록을 확인한 뒤 다시 시도하세요.` | index.html |
| 30 | `눈을 떠` | 인트로/캐릭터 |
| 31 | `정신 차려` | 인트로/캐릭터 |
| 32 | `이제 진짜 지옥이야` | 인트로/캐릭터 |
| 33 | `야! 몬스터다!!!` | 인트로/캐릭터 |
| 34 | `이동과 공격` | 인트로/캐릭터 |
| 35 | `패링과 이동` | 인트로/캐릭터 |
| 36 | `마법 패링 · 보호막` | 인트로/캐릭터 |
| 37 | `지옥강타 · 분노 폭발` | 인트로/캐릭터 |
| 38 | `CT 스킬 (뇌전걸음 / 얼음보주)` | 인트로/캐릭터 |
| 39 | `살아남아` | 인트로/캐릭터 |
| 40 | `클릭 / Enter / Space · 다음    Space 길게 / ESC · 건너뛰기` | 인트로/캐릭터 |

## 보존 계약

| 대상 | 보존한 계약 |
|---|---|
| 공통 피해 | +10%/lv 가산, ST 비용 -4%/lv, 최대 -40% |
| 회복 패시브 | HP/ST +3%/lv, 물약 쿨 -3%/lv 최대30%, 패링회복 +20%/lv |
| 크리티컬 | 확률 +1.5%, 피해 +8%/lv |
| HP 조건 | 적 HP≥70% 피해 +20%/lv, 회복력 +5%/lv 항상 적용 |
| 부활 | 확률 +2%/lv, 쿨 -30초/lv 최저100초, 성공시 HP/MP/ST 전부 회복 |
| 뇌전걸음 | 방향키 두 번, 경직/기절 탈출, 250유닛, 무적15프레임, MP[(10+(Lv-1)×5)×0.7], 공용게이지0.7칸(31.5), 기본5칸, Shift 사슬 공유 |
| 착지 전류장판 | 10초+Lv×0.5초, INT 틱 피해, 방어력 감소 1렙10%/렙당+5%/캡50% |
| 해골벽 | 마우스 즉시소환/최대1000px/패드 조준후확정, 2스택, 25초/1충전, Lv10→3스택, 원형/적·투사체 차단/솟을 때 피해, 악의12, 반경280px+12.6px/Lv, 지속3초+0.2초/Lv 최대30초 |
| 가시덫 | 선택1~4, 현재위치, 1렙반경300/10렙435, 슬로우91%(+2%/Lv 최대95%)+출혈, INT×magicRef×pMagicMul×(14+5.6×(Lv-1))×0.75, 악의10, 쿨10초, 렙당범위+15 |
| 불꽃칼날 | 기본E, 1레벨 유지, 홀드 풀차지1.5초, 스킬레벨당 범위+5%, 일반 마법탄 반사, 전방 파워웨이브·투사체 반사·그로기 |
| 합체 요약 | {p0} 1개, {p1} 2개, {p2} 1개; 처내기 피해와 불꽃칼날 피해를 각각 표기 |
| 결정 | 분류별 일괄 동작, 인벤 장비 소켓 장착/해제, 1개 분해, 보유 접두사 끝 공백 |
| 제어키 | Shift, E, CT, Enter, Space, ESC 식별자를 번역하지 않음 |

## 검증 기록

검증 스크립트: `output/steam_languages_finish_20260923/translations/validate.py`
결과: `output/steam_languages_finish_20260923/translations/validation.json`

| 검사 | 결과 |
|---|---|
| 로케일별 감사 원문 키 집합과 정확히 일치 | 27/27 PASS |
| 로케일별 40개, 비어 있지 않은 문자열 | 27/27 PASS |
| 원문·번역 placeholder 다중집합 일치 | 1,080/1,080 PASS |
| 원문·번역 숫자 다중집합 일치 | 1,080/1,080 PASS; 기존 스킬 이름의 II는 단계 2로 정규화 |
| 영어 참고 문장을 그대로 복사한 값 | 0 |
| 보유 접두사 끝 공백 유지 | 27/27 PASS |
| Shift/Enter/Space/ESC 발생 횟수 일치 | 1,080/1,080 PASS |
| MP·가시덫 공식 리터럴 보존 | 27/27 PASS |

## 용어와 후속 통합 검토

생성된 localization-data.js의 ui 값을 우선하고, 없는 키는 lang_<code>.js 기본 사전에서 조회하여 실제 표시 이름을 재사용했다. 지옥강타의 학습 안내에는 기존 2단계 이름(대부분 II)을 그대로 쓰고, 인트로의 일반 명칭은 1단계 이름의 단계 접미사를 생략한다. tr/el의 terminology.json 1단계 덮어쓰기 및 fi의 Jätti-isku를 반영한다. de는 실제 스킬 표시 Titanenschlag/Titanenschlag II를 따르며, 과거 튜토리얼 설명의 Königsschlag를 새 명칭으로 확장하지 않는다. 악의기둥·가시덫·얼음보주·기둥강타 및 악의 자원 명칭도 실제 사전과 일치시켰다.

| 코드 | 불꽃칼날 | 지옥강타 포함 조작 안내 |
|---|---|---|
| zh | 烈焰刀刃 | 大王击 · 怒气爆发 |
| zht | 烈焰刀刃 | 大王擊 · 怒氣爆發 |
| ja | 炎の刃 | 大王撃 · 怒りの爆発 |
| es | Hoja de Fuego | Gran Golpe · Explosión de ira |
| fr | Lame de Flamme | Frappe Colossale · Explosion de rage |
| de | Flammenklinge | Titanenschlag · Wutausbruch |
| ru | Огненный Клинок | Удар Великана · Всплеск ярости |
| ptbr | Lâmina Flamejante | Golpe Colossal · Explosão de fúria |
| it | Lama di Fiamma | Colpo Gigante · Esplosione d'ira |
| vi | Lưỡi Kiếm Lửa | Đập Khổng Lồ · Bùng nổ cuồng nộ |
| th | คมดาบเพลิง | ฟาดยักษ์ · ระเบิดความโกรธ |
| id | Bilah Api | Hantaman Raksasa · Ledakan amarah |
| tr | Alev Kılıcı | Dev Vuruş · Öfke patlaması |
| pl | Płomienne Ostrze | Wielkie Uderzenie · Wybuch furii |
| cs | Plamenná čepel | Úder obra · Výbuch zuřivosti |
| hu | Lángpenge | Óriás Csapás · Dühkitörés |
| bg | Пламтящо острие | Гигантски удар · Изблик на ярост |
| el | Φλεγόμενη Λεπίδα | Γιγάντιο Χτύπημα · Έκρηξη οργής |
| fi | Liekkiterä | Jätti-isku · Raivopurkaus |
| sv | Flamklinga | Jätteslag · Raseriutbrott |
| da | Flammeklinge | Kæmpeslag · Raserieksplosion |
| no | Flammeklinge | Kjempeslag · Raseriutbrudd |
| nl | Vlammenkling | Reuzenslag · Woede-uitbarsting |
| ro | Lamă de Flacără | Lovitură Gigantică · Explozie de furie |
| uk | Полум'яний клинок | Великий удар · Вибух люті |
| ar | نصل اللهب | ضربة عملاقة · انفجار الغضب |
| ms | Bilah Api | Hantaman Raksasa · Ledakan amarah |

자료 전체 검색은 `rg -l '불꽃칼날|로컬라이제이션|번역|사슬 이동과 공격|finish' docs`로 수행했다. 이번 변경은 번역 데이터만 추가하며 전투 수치나 동작은 변경하지 않는다. 상위 통합 문서에서 빌더 병합 순서와 실제 패키지 결과를 연결한다.
