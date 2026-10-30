# 돌진(사슬 이동) 경로 피격 — Unity Core 이식 (2026-10-28)

브랜치 `claude/unity-pc-dash-hit-20261028` (기준 unity/main d30ea8607 이후). 웹 원본 = `game.html` `_dashActive` 블록의 "경로상 적 히트" 루프(32475~32505, origin/main 5b652a35c).

## 웹 사실 (분석)

| 항목 | 사실 |
|---|---|
| 죽은 코드 | 34154 부근 `P.s==='charge'` 관통 돌진(`P.chargeHits`, `_hurtFieldMobs`)은 `P.s='charge'` 대입이 없어 웹에서도 도달 불가. 지금 Shift = 사슬 이동(`_harpActive` → 끌림 `_dashActive`). |
| 경로 피격 | 끌려가는 동안 `dst(P,e) <= e.r + 20`인 적을 사슬 시전당 한 번(`_harpHits`)씩 때린다. |
| 앵글러 | 사슬 이동 루프는 `_hurtFieldMobs`를 부르지 않는다 → **연결하지 않는 것이 웹과 같다.** |

## 이식한 규칙 (STR 분기)

| 항목 | 값 | 코드 |
|---|---|---|
| 도달 | `dst(P, e) <= e.r + 20`, 살아 있음, 이번 시전에서 안 맞음 | `ChainDash.IsPathHit` |
| 피해 | `~~(((ar().charge \|\| 10) + P.baseAtk) × cbMul × statStr() × (1 + dashBoost))`, `cbMul = lv>=1 ? 1.5 + (lv-1)×0.25 : 1`, `statStr()=1` | `ChainDash.PathHitDamage` |
| hurtE | `(e, dmg, ang, false, {kbMult:2, poiseHit:true, poiseMult:2.0}, ar().el)` | `Simulation.ApplyEnemyDamage(..., poiseMult: 2.0)` (새 선택 인자, 기본 null = 기존 동작) |
| 각도 | `atan2(e.y−P.y, e.x−P.x)` | `TickDashPathHits` |
| 넉백 가산 | `e.kb += (cos, sin) × 25` (hurtE 뒤) | 〃 |
| 흔들림 | `G.shake = 4 × OPT.shake / 100` (맞을 때마다) | `ShakeAmount` |
| 초기화 | 사슬 시전(`r.Fired`)마다 `_harpHits = []` | `Simulation.DashHits.Clear()` |

갑옷 `el` 없음: 웹 `ar().el`은 `undefined`지만 `elMul(undefined, d) == elMul(0, d)`가 모든 d(−1~7)에서 참(9개 확인)이라 Unity의 int `el`(기본 0)과 같다.

## 이식 범위 밖 (사유)

| 항목 | 사유 |
|---|---|
| magicBlink 화염 관통 + 화상 | 별도 화염 계약의 후보, 실제 Player 미검증 |
| dimBreach 합체 | 미이식 |
| 기동칼날개 광역 베기·검색 반경 확대(`_chainSlashActive`) | 스킬 미이식 |
| 합체(`_fuseMul`), 유니크 회수(`_uChainCrowdRefund`), 착지 슬램 | 스킬·유니크 미이식 |
| `G.hitStop` | Core에 모델 없음(`ShakeAmount`만 있음) |
| 연출(`🔱 관통!` 글자, 입자 8개) | 표현 층 |

## 검증

| 검사 | 결과 |
|---|---|
| `Tools/dash-hit-oracle` (원본 루프를 Node VM에서 실행한 160케이스·733타) | 15,338 검사, 불일치 0 |
| `Tools/dash-parry-oracle` (ChainDash 기존 수치) | 187,165 검사, 불일치 0 (회귀 없음) |
| `Tools/kill-wire-test` (실제 `Simulation`, 처치 꼬리 포함) | 31 검사, 불일치 0 (새 3개: 한 번만 맞음·재타격 없음·흔들림) |
| 에디터 컴파일 빌드 (PortVerification.Build) | exit 0, error CS 0 |

플레이어 실행 검증(m1-check 돌진 장면)은 플레이어 실행 중지 지시(NativeQaSandbox 병합 대기) 때문에 아직 하지 않았다.


## 2026-10-31 공용 사슬 경계 후속

경로 타격 식·적별1회·피해/넉백은 유지한다. 사슬 재발사마다 기존 DashHits를 비워 새시전1회 제한을 유지한다. 벽 도우미·끝점후퇴·장기홀드·재입력취소·경직/기절 탈출은 UNITY_CHAIN_BOUNDARY_PARITY_20261031.md의 현행 계약과 회귀 결과를 따른다. magicBlink/합체/칼날개/유니크는 여전히 미이식이다. 실제 Player·공통/바탕화면 검수는 HID 종료 문제로 미완료다.

### 2026-10-31 화염 사슬 후속

현행 실행·저장10종의 `magicBlink`는 [화염 사슬 계약](UNITY_MAGICBLINK_PARITY_20261031.md)을 따른다. 이전 절의 화염 미이식/HOLD 표시는 이전 후보의 범위다. 비합체 화염의 일반 Shift·후반 MP 취소·화염 관통·15틱 DOT·720틱 수명·저장 소유권을 연결했다. 기존 사슬충돌은 유지하며 합체/칼날개/기동불꽃·전체55종은 미완료다. CPU30묶음5,471,182단위0, 설치Unity Core/Runtime 오류0이다. 실제 동일 Player/M1·관리 저장3단계·제단6구슬·웹|Unity 영상·공통/바탕화면/Mac 검수는 미완료이며 NOT_READY다.
