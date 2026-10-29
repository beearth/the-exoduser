

## 2026-10-29 미리보기 통합 중 보스 부활 예외 수정

| 항목 | 확인·변경 |
|---|---|
| 실패 근거 | M1 `player-8628b9b7.log`에서 보스 사망 시 `RunWebDeath` NullReferenceException. 기존 kill-wire-test도 `Simulation.Death.cs:143`에서 동일 실패 |
| 원인 | `EnemyHurt.DeathHead`는 BossRevive·Decoy·Doppelganger 조기 반환 시 `null`을 돌려준다. 침강 위험요소 제거 분기가 반환값을 무조건 역참조했다 |
| 최소 수정 | `head != null`일 때만 `_sinkDruid`를 읽고 `Druid.ClearSinkHazards()`를 호출한다. 실제 침강 시 정리는 보존하고 부활 판정·난수·수치는 바꾸지 않는다 |
| 회귀 | 기존 `kill-wire-test` 수정 전 예외 재현 → 수정 후 **31검사 / 0실패**. 보스 즉시 부활·최종 침강·보상·사망 꼬리 연결 검사 포함 |
| 범위 | 미리보기 전용 브랜치. Unity 재빌드·최종 M1 결과는 `UNITY_PC_PREVIEW_ALL_20261029.md`에서 갱신한다 |

증거: `I:/EXODUSER-Storage/unity-preview/resume-brief2/kill-wire-red.log`, `kill-wire-green.log/json`.
