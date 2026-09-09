# 중부 유럽 UI 보완 — 2026-09-09

| 언어 | MAIN 수량 | 상태 | 등급 / 근성 | 기본 뇌전창 / 합체 전격의창 |
|---|---:|---|---|---|
| cs 체코어 | 488 | 독립 스펙·품질 검토 통과 | Hrdinský / Vytrvalost | Bleskový kůl / Bleskové kopí |
| hu 헝가리어 | 488 | 독립 스펙·품질 검토 통과 | Hősi / Kitartás | Villámcövek / Villámlándzsa |

공통 `ui-needed.json`의 정확한 한국어 키·수치·HTML·치환 변수를 보존한다. 블랙홀 설명은 실제 Lv20 추가배율 최대10과 감쇠 후 최소피해30%를 명시한다. 기둥은 어둠 피해와 지옥강타2 합체, 공성쇠뇌는 설치20초다. HP≥70%/≤30% 경계와 칼날 발사 시점·두 번째 전격이동·배정된 스킬키 조건을 유지한다.

체코어 기본명은 기존 MAIN의 Příval jehel, Paprsek zkázy, Živlový hledač, Řetězové ničení, Řetězový plamen, Řetězové ostří를 따른다. 추가 합체명은 EXTRA의 Blesková spirála, Kostěný blesk, Úder sloupů 등과 맞춘다. 도감 등록=`Zapsat do kodexu`, 선택=`Výběr`로 동작 의미를 유지한다.

체코어 블랙홀과 기둥의 지속시간 표현은 `po dobu 5s`로 고쳐 5초 후가 아닌 5초 동안의 효과임을 명시했다. 헝가리어는 기존 기본명의 Tűszúrás Sortűz, Megsemmisítő Sugár, Elem Kereső, Lánc Zúzás, Lánc Láng 등을 참조하며 Szóköz는 Space 키다.

업화선 DEX 원문의 실제 시전속도 교정은 최종 통합에서 전체 언어에 적용할 계획이다. 원어민 감수 완료나 전체 언어 번들 완료를 의미하지 않는다.

### 업화선 원문 후속 교정 완료

이 문서의 초기 검토 당시 DEX·유도·MP10을 유지하거나 후속 교정으로 남긴 업화선 긴/짧은 설명은 최종 통합에서 교체했다. 현재 모든28비KO 설명은 직선 관통 차징(최대5초, 재입력 발사)·폭발·화상·레벨별 MP·시전속도 쿨다운을 따른다. 게임 수치 변경은 없다.
