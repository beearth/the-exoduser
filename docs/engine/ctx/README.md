# DEMO11 Context Pack

1-1 데모 이식자가 원본 `game.html` 전체를 다시 훑지 않도록 만든 시스템별 원본 계약 요약이다. 먼저 대상 pack과 연결한 SOURCE TRACE를 읽는다. 아래 pack의 원본 행·구현 현황은 작성 당시 R `game.html` 65,692행/sha256 `4d911cdd…e5d4` snapshot이며 현행 완료 현황이 아니다.

2026-10-23 인수 기준 코드는 G04-02 `9734e2e79`, 고정 원본은 `godot/source_snapshot/SNAPSHOT.json`의 SHA256 `dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209`이다. 구현 시 현재 snapshot에서 함수/식 위치를 재확인한다. PC 인수 후보·남은 범위는 [PORT-TAKEOVER-01](../orders/reports/PORT-TAKEOVER-01_REPORT.md)을 따른다. 원격 main에만 있는 후속 웹 UI를 native가 모두 포함한다고 해석하지 않는다.

| pack | 예상 토큰 | 초점 |
|---|---:|---|
| MOVEMENT_CHAIN | 900 | 이동·대시·사슬 |
| PARRY_SHIELD | 1,050 | Q/E 보호 경로 |
| RAGE | 650 | 분노 상태/입력 |
| SKILLS | 1,150 | 슬롯·비용·CD·합체 |
| PROGRESSION | 900 | XP·레벨·AP/SP |
| INVENTORY | 1,250 | 드랍·가방·장착·affix |
| POTION | 850 | 자동 물약 |
| FORGE | 900 | 강화·분해·소켓 |
| SAVE | 1,000 | 저장·복원 |
| ENEMY_AI | 950 | 적 생성·AI·처치 |
| BOSS_DRUID | 1,050 | 다크드루이드 |
| FIELD_BOSSES | 850 | 앵글러·곰치·화마귀 |
| DEATH_REVIVE | 850 | 사망·부활·실드 |
| DEMO_MODE | 750 | demo/BIC/cap gate |
| HUD_SOUND | 900 | HUD·사운드 이벤트 |

각 파일은 (1) 원본 행/핵심 식, (2) tick·이벤트 순서, (3) origin/main Godot의 현재 대응(존재는 전체 완성을 뜻하지 않음), (4) docs, (5) 보호·소유 경계를 제공한다. 행이 필요한 구현은 pack을 출발점으로 삼되 R 부분 검색으로 재확인하며, `docs/2_3 돌진+패링+방패시스템/` 및 PC 전투 핵심은 읽기 전용이다.
