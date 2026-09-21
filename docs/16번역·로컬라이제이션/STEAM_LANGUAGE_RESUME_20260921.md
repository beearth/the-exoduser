# Steam 언어지원 재개 — 2026-09-21

9월 16일 미완료 영어 감사와 9월 20일 재심사 제출 기록을 기준으로 재개했다. 상점 지원 표시는 한국어 인터페이스·자막만이며, 이번 변경은 로컬 소스의 전투·자원·시스템 안내 영어 보완이다. 영어부터 완성한 뒤 나머지 언어를 진행한다. 재패키징·업로드·상점 체크 복원은 아직 수행하지 않았다.

## 시스템 안내 구현

| 항목 | 현행 계약 |
|---|---|
| 파일 | system-lesson.js |
| 범위 | 획득·인벤토리·장착 확인·능력치·스킬·대장간·자동회복 7단계, 제목·설명·상태·버튼·접근성 레이블 |
| 번역 함수 | t(ko,en,values) → 기존 _L(ko,en,values). _L이 없는 독립 테스트 환경만 KO 템플릿 치환 |
| 원본 레지스트리 | this.t 호출의 KO·EN 34개 고유 키. tools/localization-catalog.mjs의 collect가 수집 |
| 변수 | key, done, total, skipped. 문장 번역 후 치환하여 현재 키바인딩과 진행 수치 보존 |
| 단계 메타데이터 | steps getter가 현재 언어의 label/title/text를 제공 |
| 열린 안내 | bindingSignature에 BINDS·BINDS2·OPT.lang 포함. 보이는 안내의 다음 tick에서 리프 문구·aria-label 갱신 |
| 상태 메시지 | lastStatus에 id·skipped 저장 후 현재 언어로 다시 표시. 완료·건너뛰기 체크와 패널 자식 유지 |
| 타 언어 | 기존 카탈로그가 있으면 해당 번역, 없으면 영어 폴백. 신규 27언어 완성으로 집계하지 않음 |
| 전투·저장 | 실습 완료 판정·보상·입력·세이브 값 변경 없음 |

## 확인한 검사

- test/systemLessonLocalization.test.cjs: 수정 전 2개 실패 → 수정 후 2개 통과. 영어 7단계·완료 상태·버튼, KO→EN→KO, 건너뛰기·DOM 자식·HP 보존 확인.
- tools/test-system-lesson.cjs: 실제 획득/장착 성공·실패, 자동 회복, 퍼즈 중 패널, 키 재지정, 입력 해제 전달, 양쪽 HTML 구문 검사 통과.
- test/systemLessonCatalog.test.js: this.t 호출 수집 누락을 실패로 재현하고 수집기를 보완. 수정 후 번역 런타임·커버리지·수집·시스템 안내 통합 13개 검사 모두 통과.
- 브라우저 시각 검증 및 Steam 설치본 검증은 이번 변경에 대해 아직 수행하지 않았다.

## 남은 작업

| 대상 | 상태 / 다음 작업 |
|---|---|
| parry-lesson.js | 영어 92개 원본·12단계 연결 완료. 실제 첫 이동 화면 KO→EN 확인 |
| resource-practice.js | 영어 78개 원본·활성 8단계 및 보존 3단계 표시 검사 통과 |
| 캐릭터 소개 | CHAR_VISUALS 신규 설명·직업·특성의 영어 및 타 언어 보완 필요 |
| 수료 배지 등 | 배지 표시와 후속 신규 UI 감사 필요 |
| 캐릭터 생성 영상 | warrior_story_v22_bgm.mp4의 영상 내 한국어 22큐. 현재 구형 PRO 21큐와 별개로 영상·실제 타이밍 대응 자막 필요 |
| 타 언어 | 새 실습·소개 등 27개 비KO/EN 언어 실번역 후 단계별 표시 검증 |
| Steam | 언어별 실제 UI·영상 검증, 패키징·설치 확인 이후 지원 체크 복원 판단 |

후보 수는 주석 제외 고유 문자열/템플릿 조각이며 내부 표기·비활성 단계·접근성 레이블도 포함한다. 문장 수나 번역 완료율로 사용하지 않는다.

## 시스템 안내 KO·EN 원본

| KO 키 | 영어 기본값 |
|---|---|
| 장비 획득 | Pick up equipment |
| 전리품을 챙겨보세요 | Collect your loot |
| 장비 가까이 다가가 [{key}]로 주우세요. 빈 장착 슬롯이면 자동으로 장착됩니다. 가방이 가득 차 획득하지 못한 경우에는 완료되지 않습니다. | Move close to equipment and press [{key}] to pick it up. It is equipped automatically if its slot is empty. A failed pickup due to a full inventory does not complete this step. |
| 인벤토리 열기 | Open inventory |
| 가방과 장비를 살펴보세요 | Inspect your inventory |
| [{key}]로 인벤토리를 열어보세요. 가방의 장비와 현재 장착한 장비를 확인할 수 있습니다. | Press [{key}] to open your inventory and inspect carried and equipped items. |
| 장비 장착 확인 | Inspect equipped gear |
| 장착한 장비를 확인하세요 | Check your equipped gear |
| [{key}]로 인벤토리를 열고 장착 슬롯의 장비를 선택하세요. 또는 가방의 장비를 선택해 장착하세요. 교체 시 요구 레벨과 강화 이전 비용을 확인하세요. | Press [{key}] to open your inventory and select an equipped item, or equip an item from your bag. Check the level requirement and upgrade transfer cost before replacing gear. |
| 능력치 살펴보기 | Explore stats |
| 내 능력치를 확인하세요 | Check your stats |
| [{key}]로 능력치 화면을 열어 스탯과 패시브를 살펴보세요. 지금 포인트를 사용할 필요는 없습니다. | Press [{key}] to inspect your stats and passives. You do not need to spend any points now. |
| 스킬 살펴보기 | Explore skills |
| 전투 스킬을 확인하세요 | Check your combat skills |
| [{key}]로 스킬 화면을 열어 습득한 스킬과 구성을 살펴보세요. | Press [{key}] to inspect your learned skills and loadout. |
| 대장간 살펴보기 | Visit the forge |
| 강화 메뉴를 확인하세요 | Explore upgrades |
| [{key}]로 대장간을 열어 강화 메뉴와 필요한 비용을 살펴보세요. 실제 강화를 하지 않아도 이 안내는 완료됩니다. | Press [{key}] to visit the forge and inspect upgrades and their costs. You do not need to perform an upgrade to complete this step. |
| 자동 회복 경험 | Experience auto-healing |
| 악의로 자동 회복합니다 | Malice fuels auto-healing |
| 부족한 체력이 물약 회복량 이상이고 재사용 대기시간이 끝나면 악의 1개를 소비해 자동 회복합니다. 악의를 남겨두고 평소처럼 전투하세요. 일부러 피해를 받을 필요는 없으며, 이 항목은 건너뛸 수 있습니다. | When your missing HP reaches the potion healing amount and its cooldown is over, auto-healing consumes 1 Malice. Keep some Malice and fight normally. You do not need to take damage on purpose; you can skip this step. |
| 설정에서 키 배정 | Assign a key in Settings |
| 시스템 튜토리얼 | System tutorial |
| 시스템 안내 접기 | Collapse system guide |
| 이 항목 건너뛰기 | Skip this step |
| 안내 종료 | Close guide |
|  · 건너뜀 |  · Skipped |
|  · 완료 |  · Complete |
| 시스템 안내 펼치기 | Expand system guide |
| {done} / {total} 완료 | {done} / {total} complete |
| 시스템 안내를 마쳤습니다 | System guide finished |
| 시스템 기본을 익혔습니다 | System basics complete |
| {done}개 완료 · {skipped}개 건너뜀. 안내 종료를 누르면 닫힙니다. | {done} complete · {skipped} skipped. Select Close guide to dismiss this panel. |
| 획득·장비·성장 메뉴와 자동 회복을 모두 확인했습니다. 안내 종료를 누르면 닫힙니다. | You have explored loot, equipment, progression menus and auto-healing. Select Close guide to dismiss this panel. |

[전투·자원 실습 후속 계약](TUTORIAL_ENGLISH_20260921.md).
