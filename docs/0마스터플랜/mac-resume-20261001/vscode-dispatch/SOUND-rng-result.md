# SOUND 난수 보존 후보 — root 독립 검수

생산 미적용. 본편/easy의 phase2 seal howl만 최종 enqueue를 생략하고, key 변환·volume gate·priority·30ms 중복 억제·시각 갱신·rate 난수 소비 순서는 원본대로 실행하는 후보다. 입장·phase-up·일반 효과음은 기존 경로를 유지한다.

## 원자료와 수정 구분

기존 SOUND 세션 aa3ac0ed-f4e5-44ad-a0b2-d4d2da045b84가 12:30:59.837Z 지시를 받고12:31:04.694Z RNG_TASK를 Read했으며12:35:18.112Z 답변을 제출했다. 답변·원 diff·원 테스트는 tools/team-followup-20261001/SOUND/rng-submission.md 및 *.submitted.*에 보존했다.

원 테스트는 seal 끝의 // 주석과 닫는 코드가 같은 줄로 결합되어 SyntaxError였다. root는 두 결합 지점에 줄바꿈만 추가했다. 원 diff는 hunk 줄 수가 틀려 표준 context diff로 재구성했으며 기능 내용은 같다. rng-preserving-regression.cjs가 수정본, rng-main.context.diff/rng-easy.context.diff가 표준 적용 검사본이다. 원 실패 로그도 보존한다.

## 검증 범위

| 검사 | 결과 | 의미 |
|---|---|---|
| 수정된 제출 회귀 | 8/8 PASS | RNG/시각/queue 계약 |
| 독립 실제 소스 경계 | 6/6 PASS | 본편/easy 각각144조합, 총288조합과 실제 seal→입장→phase-up→일반음 시퀀스8개 |
| 표준 patch 검사 | 2/2 PASS | 현재 본편/easy에 git apply --check; 미적용 |
| 실제 게임 소리·NW | UNKNOWN | 실행/청취하지 않음 |

독립 검사는 실제 playSample 전체와 _r 본문을 사용했다. null/alias/없는 key, 작은 volume, priority, 중복 기준29/30/31ms, skip 유무를 비교했다. 없는 key를 새 로딩 gate로 취급하지 않는다. 외부 voice 변환/skill·footstep 판별은 양쪽에 같은 stub이므로 전체 arena 검증이 아니다. 첫 root 실행의 조합수 assertion은 실제144를288로 잘못 적어 실패했으며144로 정정했다. 최종14그룹 PASS와 초기 실패를 구분한다.

본편 SHA256 e5518842324d17fb63da44457e6092af138b4fcfbaf49c1cb03ef791431dc115. 정확한 easy/후보/테스트 해시와 최종 실행 결과는 rng-root-evidence.json을 따른다. 기존 dedup guard 후보보다 정적 상태 보존 근거가 개선됐으나, 실제 소리와 정상 보스 진입 인수를 대신하지 않는다.

문서 동기화: docs 전체에서 playSample/_noEnq/보스포효/난수를 검색해88개 매칭을 기록했다. 시스템 원식은 생산에 미적용이므로 현행 공식은 바꾸지 않고 후보/정적 통과/청취 대기 단계를 본 결과·총괄·상태표에 반영했다.
