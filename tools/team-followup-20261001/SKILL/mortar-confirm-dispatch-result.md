# Mac SKILL — mortar 확정 경로 통합 결속 결과 (SKILL-mortar-confirm-dispatch)

세션 `203377cc-64c4-47ea-af27-95b66ae829fa` 연속 · HEAD `f965a15b65fa99729ca0c6ea1f9aeeabde7d9706`

## 수신·착수·완료 (UTC)

- **17:28 수신** `mortar-confirm-dispatch-task.md`. **17:30 첫 Read**: aim-start `case 'maliceMortar':`, 확정 `if(P._mmAiming){…}`, `fireMaliceMortar`(현 위치), 기존 mortar-confirm-source.
- **중복 확인**: `mortar-confirm-dispatch-*` 부재(task.md만) → 신규. 기존 후보·17검사 **보존**(재실행 17/17 PASS 확인).
- **17:40 첫 코드 Edit / 17:48 완료**: 통합 제어흐름 회귀 **19/19 PASS**, 기존 17검사 그대로 통과.

## 판정: 기존 결함 확인, 신규 결함 없음 (EXISTING_DEFECT_CONFIRMED_NO_NEW_DEFECT)

- `fireMaliceMortar` 현 SHA `cdeeead948d5518c`(양쪽 동일) = mortar-confirm-source frozen과 **동일(함수 무변)**.
- 기존 `mortar-confirm-source-game.patch`·`-easy.patch`가 현 HEAD에서 **dry-run APPLIES CLEAN**.
- 통합 흐름(진입 게이트 → 멀티프레임 홀드/릴리즈 → 확정 위임 → 함수 발사)에서 **추가 결함 미발견**. 따라서 **신규 patch 생성 안 함**, 기존 후보 가드만 재검증.

## 소유권 겹침 확인

mortar 가드는 `fireMaliceMortar` 함수 내부 1개소. 다른 SKILL 후보(iceStorm/hellRay/thunderStake = 인라인 확정블록, 각자 블록 내 가드)와 **guard/함수 소유 겹침 없음**. 최소 patch(함수 진입 1줄)만으로 적용 가능 — mortar-confirm-source patch 그대로 재사용.

## 통합 하니스 (actual source ↔ fixture 분리)

실제 소스 3슬라이스를 원문 그대로 추출해 제어흐름을 돌리고, 환경·프레임 드라이버만 fixture로 제공:

| 구분 | 출처 |
|---|---|
| aim-start | `case 'maliceMortar':` 본문(진입 MP≥50 && `_mmCd<=0` 게이트) — `switch(1){case 1:…}`로 `break` 합법화만, 로직 원문 |
| confirm | `if(P._mmAiming){…}`(MBjust[0]/릴리즈 `_mmRel`, RMB/Escape 취소 우선 → `fireMaliceMortar` 위임) 원문 |
| fire | `function fireMaliceMortar(…)` 원문(원본/가드본 각각) |
| fixture | P/G/KH/MBjust/K/sp·mpCost·useMp·SFX/RNG 카운터·프레임 드라이버 |

후보 가드 = `fireMaliceMortar` 진입 `if(P.mp<mpCost('mortar')){showPH(_T('MP 부족!'),'#4488ff');return}` (mortar-confirm-source와 동일 변환).

## 검수 (node, exit0) — 19/19 PASS (game.html · game-easy-test.html 각)

| 시나리오 | 원본(RED) | 후보(GREEN) |
|---|---|---|
| A 조준중 MP30 → 홀드/릴리즈 확정 | **무료 발사·mp0·_mmCd660 [결함]** | 발사0·mp30·조준유지·cd0·'MP 부족!'·SFX/RNG/shake 0 |
| B 저MP 유지 → MP 회복 → 재클릭 | — | 정상 발사·mp0·cd660·조준해제 |
| C 취소 우선(RMB·Escape, 클릭 동시) | — | 무발사·조준해제·무차감 |
| D 성공 후 중복 입력 | — | 조준 off 재클릭 무발사 + `_mmCd>0`로 재조준 거부 |
| E 합체(iceMortar) | — | 성공 `_ioCd600`/`_mmCd660` 보존, 저MP 무발사·`_ioCd` 미설정·조준유지 |
| 호출수 비교 | 저MP 발사1·sfx1 | 저MP 발사0·sfx0 (제거된 무료 발사 1·sfx 1), 정상 MP 경로는 양측 동일 |

증거 수치는 `mortar-confirm-dispatch-evidence.json`.

## 산출물 (SKILL 소유 `mortar-confirm-dispatch-*`)

| 경로 | 내용 |
|---|---|
| `mortar-confirm-dispatch.test.mjs` | 통합 제어흐름 회귀 19 assertion |
| `mortar-confirm-dispatch-evidence.json` | 판정·호출수 비교 증거 |

기존 `mortar-confirm-source-{before.txt,test.mjs,game.patch,easy.patch}` 및 17검사 **보존**(미수정).

## 범위 밖 유지 / 인계

- **thunderStake duration 900(코드) vs 600(SSOT)**: 별도 근거 불일치로 **유지**, 임의 수치변경 0.
- **생산 적용은 root**: 신규 patch 없음. mortar는 기존 mortar-confirm-source patch 적용으로 충분(양쪽 dry-run clean). 적용 후 실게임 조준중 MP 변화 실측은 root/QA.
- 메모리 슬라이스 실행만(게임/브라우저/서버/리로드/계측/대형빌드 0). production/공유docs/Git/queue/새세션 쓰기 0, 게임탭 입력/리로드/닫기 0. 기록은 이 소유폴더에만.
