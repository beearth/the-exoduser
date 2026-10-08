# 애니메이션·VFX팀 마스터 (ANIMVFX)

> 총괄: Codex의 [PROJECT_MANAGEMENT_MASTER.md](../0마스터플랜/PROJECT_MANAGEMENT_MASTER.md). 이 문서는 애니메이션·VFX팀의 책임·소유 범위·작업 대장·검수 근거·미해결·다음 백로그를 관리한다.
> 연속 진행·한국어 응대는 [TEAM_CONTINUATION_POLICY_20261001.md](../0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md)를 따른다.
> 상세 수치·계약은 기존 SSOT([5.0애니메이션파이프라인](../5.0애니메이션파이프라인/5.0애니메이션파이프라인.md), [VFX_구현가이드](VFX_구현가이드.md), 캐릭터/스킬/몬스터 SSOT)를 따르고, 이 문서는 운영 현황을 관리한다.

## 1. 팀 역할과 경계

| 구분 | 담당 | 경계(타 팀) |
|---|---|---|
| ① 프레임·상태 전환 | 공격 준비/발동/회수, 루프/취소/사망 전환, 방향·피벗·발 접지, 프레임-판정 동기 | 상태·판정 자체는 스킬/몬스터팀, 외형·원화는 아트팀 |
| ② 전투 VFX·피격 피드백 | 타격 플래시·틴트·임팩트, 효과 생명주기·중복·투명도·가독성 | 피해·쿨다운·판정·맵 충돌은 변경 금지(시각 명목으로도) |
| ③ 실제 시각·성능 검수 | 실제 카메라 전후 비교, 밀집 전투 가독성·프레임 비용 | 렌더러 공통 핫패스는 QA팀과 수정 범위 조율 |

- 보호 설계 불변: 돌진/패링/방패(`docs/2_3`), Q/E 패링 규칙, 어택 티켓 금지, PixelLab 캐릭터 생성 금지.
- 이미지 생성은 MagicLight 우선. 새 에셋은 런타임 연결·로딩 폴백·패키지 포함 확인.
- 공용 파일(`game.html`)은 전체 소유 주장 금지 — 편집 범위를 함수·데이터로 기록하고 타 팀 변경 보존.

## 2. 운영 기록(검수 환경)

- 검수 탭 ID: **110166571** (Claude in Chrome, `http://localhost:3333/game.html`). 타 팀 탭 이동·재사용 금지.
- 서버: 기존 포트 3333 재사용(응답 200 확인). `python http.server` 금지.
- 실행 위치: Antigravity Terminal 7, Claude(연속성 정책 표 기준).
- **브라우저 하니스 주의**: 동시 세션들이 같은 Chrome을 공유해 탭 그룹·탭이 반복 소멸/이동됨. 검수 시 전용 탭을 새로 만들고 ID를 갱신 기록한다.
- **렌더 관측 제약(중요)**: 탭이 백그라운드면 `document.hidden===true`라 `game.html`의 메인 루프가 `loop()` 초입에서 업데이트·렌더를 건너뛴다(`game.html:59289 부근 if(document.hidden){...return}`), rAF도 0Hz로 동결됨. 관측 시 visibility를 강제하고 `loop(ts)`를 수동 구동해 프레임을 전진시킨다. 단, 강제 부팅(`_bootLoadActive=false`+`hideBootLoading()`)으로 진입한 하니스는 정규 렌더 함수(`_prepEnemyInstanced` 호출부 `game.html:50611`)를 구동하지 않아 몹이 2D 폴백 경로로만 그려진다(`_dbgEnsGL=0`, `_ens8GLTotal=0`). → GL 인스턴싱 경로의 실화면 검증은 정규 풀부팅(QA 조율 게임 실행)에서 해야 한다.

## 3. 담당 함수·데이터 소유(현재)

| 영역 | game.html 위치(내용 기준) | 비고 |
|---|---|---|
| 몹 피격 플래시(2D 폴백) | 일반 적 2D 렌더 루프 내 "피격 플래시" 블록(`e._hitFlash>0 && !_ensGLQueued`) | `_ensGLQueued`로 GL 몹 제외(이중 방지) |
| 몹 피격 플래시(GL 인스턴싱) | `_prepEnemyInstanced` 말미, `_drawEnemy8DirInstanced()` 직후 additive 패스 | `_ensGLMode===1` 몹만, `_hitFlash` 감소도 여기서 |
| 피격 플래시 세팅원 | `hurtE` 내 `e._hitFlash=6`(일반)/`=4`(회전참) | 값 변경 없음. 렌더만 복원 |

## 4. 작업 대장

| ID | 작업 | 상태 | 검수 근거 | 미해결 |
|---|---|---|---|---|
| PM-014 | CH1 동작·VFX 첫 결함 개선(몹 피격 플래시 복원) | 구현·2D 실화면 검증 완료 / GL 실화면 대기 | §5 | GL 경로 실화면 스크린샷(정규 풀부팅) |

## 5. PM-014 — CH1 몹 피격 플래시 복원

### 5.1 결함(재현·근거)
- CH1(1장 썩은 숲) 전투에서 몹을 때려도 **피격 표시(플래시)가 전혀 없다**. 타격감의 핵심 피드백이 누락.
- 코드 근거: `hurtE`가 `e._hitFlash=6`(일반)/`=4`(회전참)로 타이머만 세팅(`game.html` hurtE 내 40534·40552 부근)하는데, 렌더는 `if(e._hitFlash>0){ e._hitFlash-=1 }`로 **타이머만 감소시키고 아무것도 그리지 않았다**(주석 "타이머만 감소, 원형 제거" — 과거 붉은 원을 제거하면서 대체 연출을 넣지 않은 죽은 코드).
- 이는 "기존 구현의 누락 연결"에 해당(신규 시스템·수치 변경 아님). 피해·쿨다운·판정·맵 충돌 불변.

### 5.2 구현(승인 범위 내 최소 변경)
- 히트 시 **해당 몹의 8방향 아틀라스 셀을 가산(additive) 1장으로 덧그려 스프라이트 실루엣을 밝게 팝**시킨다. 어두운 CH1 배경에 어울리는 발광형 피드백(흑철 지옥 톤 유지). 원색 원/이모지 미사용.
  - 강도: `_hfT=min(1,_hitFlash/6)`로 1→0 페이드, 알파 `_hfT*0.8`(2D는 ×sa), 크기 `baseSz*(1+0.05*_hfT)`로 히트 순간 살짝 팝.
  - 신규 에셋·신규 텍스처 없음(기존 `_ch8Atlas` 셀 재사용) → 신규 VRAM 0.
- **두 렌더 경로 모두 처리**(CH1 몹은 정규 빌드에서 GL 인스턴싱, 캡 초과·비GL 시 2D 폴백):
  - GL 인스턴싱: `_prepEnemyInstanced`에서 GL 스프라이트 배치 그린 직후(`_drawEnemy8DirInstanced()` 다음)에 `_ensGLMode===1`이며 `_hitFlash>0`인 몹만 additive 덧그림+`_hitFlash--`. GL 인스턴싱 스트라이드에는 tint가 없어(알파만) 셰이더 hot-path·정점 포맷은 건드리지 않음.
  - 2D 폴백: 기존 "피격 플래시" 블록에서 `!_ensGLQueued`인 몹만 additive 덧그림+`_hitFlash--`.
  - **이중 방지**: GL 몹은 GL 경로에서만, 2D 몹은 2D 경로에서만 그리고 감소(각각 `_ensGLMode`/`_ensGLQueued` 게이트).
- 합성 처리: GPU 프록시에서 `X.globalCompositeOperation` set은 no-op이라 additive는 `_setBlend(true/false)`로, 실제 Canvas2D 폴백에선 `globalCompositeOperation='lighter'`로 — 코드베이스 VFX 패턴대로 둘 다 지정.

### 5.3 검수 근거
- **구문 검사**: `game.html` 인라인 스크립트 파싱 PASS(주 게임 스크립트 오류 0. 잔여 3건은 파일 말미 `importmap`/`type=module` — 본 변경과 무관·기존).
- **실화면 검수(2D 폴백 경로)**: 검수 탭 110166571, CH1 실전 몹(etype 4)에 대해 동일 위치·동일 프레임으로 A/B 캡처.
  - 플래시 OFF: 붉은갈색 살덩이 몹, 어두운 기본 톤.
  - 플래시 ON(`_hitFlash=6` 피크): 스프라이트 실루엣 전체가 뚜렷하게 밝아짐(발광 팝). 육안으로 피격 즉시 식별 가능.
  - `_hitFlash` 6→5 감소 확인(2D 블록 실제 실행 검증).
- **GL 인스턴싱 경로**: 코드·구문 검증 + 2D와 동일 로직·API. 실화면 스크린샷은 §2 하니스 제약으로 대기.

### 5.4 미해결·다음 행동
- [대기] GL 인스턴싱 경로 실화면 A/B — 정규 풀부팅 게임 실행 필요. QA 실측 구간과 겹치지 않게 조율 후 확인.
- [관찰] 히트 발광이 원색 스프라이트(예: 붉은 몹)에선 붉게 밝아짐 — 순백 플래시가 필요하면 셀별 흰 실루엣 캐시 방식을 검토(단, GPU 프록시가 임의 오프스크린 캔버스 텍스처를 수용하는지 확인 후). 현 additive 방식은 신규 VRAM 0으로 안전.

## 5b. 피격 플래시 수명·전환·폴백 계약 검수 (2026-10-01, 순수 소스 코드 검수)

> 게임 실행 없이 실제 소스 경로만 대조한 회귀 검수(M2 조율: 새 실행·렌더/VFX 변경 없음). 라인은 조회 시점 기준(공용 파일이라 이동 가능). 정규 GL 실화면은 QA 인계분 인수 전까지 "검수 대기" 유지.

### 관련 소스 경로(확정)
- GL 경로: `_prepEnemyInstanced` — 진입부 `ens[i]._ensGLMode=0` 전체 리셋(5111) → GL 큐 성공 시 `_ensGLMode=1`(8-dir 5150 / atlasE 5168) → 말미 `_drawEnemy8DirInstanced()`(5189) 직후 피격 플래시 루프(5191–5213): `_ensGLMode===1`&`_hitFlash>0`인 몹만 additive 덧그림 후 `_hitFlash--`(5210, 그리기 실패해도 감소).
- 2D 경로: 적 렌더 루프(draw() 내 50612~). 죽은 몹 분기는 `continue`(50655), 뷰 컬링 `continue`(50657). 살아있는 몹은 50786에서 `_ensGLQueued=e._ensGLMode||0` 캡처. 피격 플래시 블록(51576)은 `e._hitFlash>0 && !_ensGLQueued`일 때만 덧그림+`_hitFlash--`(51595).
- 프레임 내 순서: draw()가 `_prepEnemyInstanced()`(50611)를 먼저 호출(여기서 GL 몹 `_ensGLMode` 확정+GL 플래시 감소) → 이어 2D 루프(50612). 두 구간 사이에서 `_ensGLMode`를 바꾸는 코드 없음.

### 계약 판정

| 검수 항목 | 동작(소스 근거) | 판정 |
|---|---|---|
| 이중 감소(한 프레임 2회↓) | GL은 `_ensGLMode===1`(5198)만, 2D는 `!_ensGLQueued`(=`_ensGLMode||0` falsy)(51576)만 감소. 한 프레임 내 `_ensGLMode` 불변 → 한 몹은 정확히 한 경로만 | PASS(이중 감소 없음) |
| 이중 그리기 | 위와 동일 상호배타 → 한 몹 플래시 1회/프레임 | PASS |
| GL↔2D 전환(큐 진입/이탈) | 매 프레임 `_ensGLMode` 재평가. GL 실패(캡 초과 등)→0→2D 폴백이 감소. 프레임마다 정확히 1회 감소 | PASS(전환 시 잔상·누락 없음) |
| 캡 초과 폴백(`_queueEnemy8DirInstanced` false) | `_ensGLMode` 0 유지 → 2D 폴백 경로가 플래시+감소 | PASS |
| 사망 몹 잔상 | GL: `!e.alive` 가드(5198) skip. 2D: 죽은 몹 `continue`(50655)로 플래시 블록 미도달. 둘 다 안 그림·안 감소 | PASS(사망 잔상 없음) |
| 비8-dir GL 몹(타 챕터) | `_ensGLMode===1`이나 `e._mob8dir&&e._mobCh` 불만족 → 그리기 skip, `_hitFlash--`는 실행(5210) | PASS(스택 없음. CH1 범위 밖, 플래시 미표시는 기존과 동일) |

### 확인된 경미 사항(수정 보류 — 기록만)
1. **뷰 밖 피격 `_hitFlash` 정지**: 두 경로 모두 뷰 컬링(GL=`_eIter` 인뷰만 / 2D=50657 continue)이라, 피격 직후 화면 밖으로 나간 몹은 `_hitFlash`가 감소하지 않고 얼어붙었다가 **복귀 시 잔여 프레임(≤6f≈0.1초)만큼 한 번 반짝**일 수 있음. 화면 밖이라 비가시·짧음이며, `_hitFlash`는 hurtE가 세팅하고 렌더가 소비하는 기존 수명 의미와 동일. 심각 잔상 아님.
2. **`_eIter` 이중 스캔**: GL 플래시는 `_anyHF8` 사전 스캔(5194)+본 루프(5197)로 `_eIter`를 2회 순회. 뎁스슬라이스 OFF 시 `_eIter=ens`(전체). CH1(≈16몹)에선 무시 가능하나 대규모 군집에서 미세 비용 → QA 성능 검수 시 참고.

### QA 정규 GL 실화면 캡처 조건(인계 확인용)
- 진입: CH1(stage 0) 정규 풀부팅(`visibilityState='visible'`, `_ensWarmDone=true`, `_dbgEnsGL>0`·`_ens8GLTotal>0`로 GL 인스턴싱 구동 확인).
- (A) 단발 A/B: 화면 내 8-dir 몹 1마리, `_ensGLMode===1` 확인 후 피격 직전/피격 프레임(_hitFlash 6)/페이드 프레임 캡처 → 발광 팝·페이드 확인.
- (B) 연속 피격: 동일 몹에 연속타 → 매 프레임 밝기 유지·이중 그리기/과포화 없음, 타격 멈춘 뒤 ≤6f 내 소멸(잔상 없음) 확인.
- (C) 전환: 몹 다수로 GL 캡 근처 유도하거나 화면 경계 이동으로 GL↔2D 전환 중 플래시 깜빡임·이중 표시 없음 확인.
- (D) 사망: 피격 직후 처치 → 사망 순간/직후 프레임에 플래시 잔상 없음(시체로 즉시 전환) 확인.

## 6. 다음 백로그(승인 범위 — 동작·가독성·효과수명)

> Explore 코드 조사에서 확인된 CH1 후보. 착수 전 담당 함수·검수 기준 기록, 실제 카메라 검수. 타 팀 소유(상태·판정=몬스터/스킬팀)와 겹치면 조율.

| 후보 | 성격 | 팀 경계 판단 |
|---|---|---|
| 몹 사망 트랜지션(즉시 팝 소멸→경량 페이드/스쿼시) | 사망 전환(①) · VFX(②) | ANIMVFX 단독 가능(사망 판정 불변, 시각 전환만) |
| 근접몹 공격 예고(❗ `_enemyWindupRemaining(e)>0` 연결) | 예고 표시(②) | ENEMY pure helper의 비보스·생존·windup 및 스턴·빙결·피격경직 제외 계약을 읽음. 상태·타이머·판정은 유지. 자연 보스/native/visual 검수 미완 |
| 몹 발 접지(중심앵커→발밑앵커, 그림자 정합) | 피벗·접지(①) | ANIMVFX, 단 다수 드로우 지점 → 신중·QA 조율 |
| 전사 회수(recover) 전용 프레임 부재 | 프레임 전환(①) | 아트팀 에셋 의존(신규 원화 필요 시) |

## 6a. 사망 트랜지션 결함 — 설계·적용 범위 검토 (2026-10-01, 구현 보류)

> 총괄 허용: 설계·적용 범위 검토까지. **hurtE·죽음 판정·보상·시체 수 변경 금지**. 구현·실화면 검증은 정규 GL 실화면 경로 확보 후. 순수 소스 코드 검수 기반.

### 결함 재확인(소스 경로)
- 주 처치 사이트(hurtE 내 40954~): `atkTicketRelease(e); e.alive=false; G.kills++; …_regKill(e)` → `deathFX`(40960/40962, 파티클) → `_spawnLargeMonsterDeathFx`(40972) → `_addCorpse(e,_killAng,_cp)`(40974, "모든 사망" 시체 잔존).
- 렌더: 다음 프레임 2D 루프 50614 `if(!e.alive){…}continue`(GL도 `!e.alive` skip) → **살아있는 스프라이트가 한 프레임에 사라지고** 정적 시체+파티클로 대체. 즉 완전 소멸은 아니나 **사망 모션(디졸브/스쿼시) 부재 → "팝" 전환**.
- `_spawnLargeMonsterDeathFx`(23925)는 파티클 버스트만, `_isLarge`(`e.ib||e.r>=18||e.mhp>=220`)만. 스프라이트 디졸브 없음 → 제안과 중복 아님. 소형 CH1 몹은 `deathFX`+시체만.

### 개선 설계(비침투 VFX 레이어 — 제안)
- **연출**: 사망 순간 몹의 마지막 8-dir 스프라이트 셀을 캡처 → ~10–14f 동안 짧은 디졸브(알파 1→0) + 살짝 가라앉음(scaleY 1→0.8, 아래 4~8px 싱크). 어두운 살빛 바닥으로 녹아드는 Hell Gothic 톤. 밝은 poof·이모지·원색 금지. 기존 `deathFX` 파티클·`_addCorpse` 시체와 병행(겹쳐 자연 전환).
- **훅 지점(단일)**: `_addCorpse(e,killAng,power)`(23517) 진입부에서 신규 `_addMobDeathFade(e)` 병렬 호출. `_addCorpse`가 모든 사망의 단일 관문이라 사이트별 편집 불필요. `deathFX`는 묵음 분기(40960) 등 호출 조건이 갈려 부적합. `_addCorpse`의 시체 생성 로직·개수는 불변(병렬 VFX만 추가).
- **렌더 경로**: 신규 풀 `_mobDeathFades[]`(캡 ~24, 뷰 컬링), 적 렌더 직후(시체 위)로 합성. 8-dir 아틀라스 셀 재사용 → 신규 에셋·VRAM 0. 디졸브는 일반 알파(source-over)가 적합(가산 아님). GPU 프록시/2D 동일 처리.
- **대상 범위**: CH1 8-dir 몹(`_mob8dir&&_mobCh`) 우선. 보스·구울·레어·대형몹(별도 death FX 보유)은 후속 검토.

### 금지 준수 경계
- 불변: `hurtE`, `hp≤0`→사망 판정, `e.alive`, EXP/드랍(`rollDrop`/`addExp`)·`G.kills`/`G._stageKills`/콤보, `atkTicketRelease`, `_addCorpse`의 시체 **개수/수명**. 추가되는 것은 시각 전용 페이드 VFX 1종뿐.

### 남은 선행·검증(구현 전)
- `_addCorpse` 시체 페이드 수명과 디졸브 타이밍 정합(시체가 나타나기 전/동안 스프라이트가 자연히 사라지도록) — 실화면 필요.
- 밀집 사망(다수 동시) 시 `_mobDeathFades` 캡·프레임 비용 — QA 성능 검수 조율.
- 디졸브 vs 시체 겹침 순서(z) 실화면 확인.
- **결론**: 설계·적용 범위 확정. 구현·실화면 검증은 정규 GL 실화면 경로 확보 + QA 조율 후 착수.

## 7. 결정·조율 기록

| 날짜(KST) | 내용 |
|---|---|
| 2026-10-01 | ANIMVFX 팀 신설·본 문서 생성. PM-014 착수: 몹 피격 플래시 복원(2D 실화면 검증, GL 코드 검증). |
| 2026-10-01 | `_prepEnemyInstanced` 말미 additive 플래시 추가는 렌더러 준-핫패스 — 가산 오버레이(히트 몹 한정, 캡 내)로 최소화하고 셰이더·정점 포맷 불변. QA와 공통 핫패스 조율 대상으로 기록. |
| 2026-10-01 | GL 실화면 캡처는 QA(정상 가시 headed 실행)에 인계·착수 확인 → hidden 탭 부팅 재시도 중단. M2 중 새 실행·렌더/VFX 변경 없이 순수 코드 검수 진행. |
| 2026-10-01 | 피격 플래시 수명·GL/2D 전환·캡 초과 폴백 계약 **코드 검수 PASS**(§5b): 이중 감소/이중 그리기 없음·사망/전환 잔상 없음·폴백 커버. 경미 2건(뷰 밖 _hitFlash 정지·_eIter 이중 스캔)은 기록만. QA 정규 GL 증거 인수 전까지 GL 검수 대기 유지. |
| 2026-10-01 | 사망 트랜지션 결함 **설계·적용 범위 검토**(§6a): `_addCorpse` 단일 훅으로 비침투 디졸브 VFX 제안. hurtE·죽음판정·보상·시체 수 불변. 구현·실화면은 GL 경로 확보 후. (총괄 지적: `_addCorpse` 단일경로 가정은 ENEMY 예외 경로와 대조 필요 — 구현 착수 시 확인) |
| 2026-10-01 | **QA GL 캡처 인수(§10) + 발견 1·2 수정(§11)**: GL 경로 코드 동작 QA 정규 런타임 확인→인수. 주사율 의존 수명(240Hz 25ms)→고정스텝 update 감쇠로 주사율 독립 ≈100ms(Node 재현 60/144/240/30Hz). 부활 잔상→사망 분기 `_hitFlash=0` 리셋. render 감소 제거. hurtE·death/alive·보상·시체 수·경직·쿨다운 불변. 구문 PASS. 가독성(가림)·수정본 GL 실캡처는 QA 재캡처/후속(별도). |
| 2026-10-01 | **git 커밋 소유권**: `game.html` 워킹트리에 다수 타 팀의 미커밋 변경(save/load·텍스처·셰이더·스킬·exp·loop 등, 158삽입 중 대부분 타 팀)이 섞임. 내 변경은 피격 플래시 2블록뿐이며 경로지정 커밋으로도 분리 불가 → **본 세션에서 game.html을 직접 커밋하지 않고** SessionEnd auto-sync의 통합 커밋에 맡긴다(타 팀 변경 일괄 커밋·history rewrite 금지 규칙 준수). 본 문서·VFX_구현가이드가 provenance를 남긴다. |

## 9. 미해결 의존성(총괄·QA 조율 필요)

- **GL 인스턴싱 경로 실화면 검증 블로커(2026-10-01 확정 근거)**: 검수 탭 110166571에서 클린 리로드·클릭·28s 대기·수동 `loop()` 896틱 구동을 모두 시도했으나 부팅 미완료. 진단 결과:
  - `document.hasFocus()===true`(클릭으로 포커스 획득)이지만 `document.visibilityState==='hidden'`, `document.hidden===true` — 탭이 OS상 **가시(visible) 포그라운드 탭이 아님**. rAF는 focus가 아니라 visibility 기준으로 동결되므로 실제 rAF가 돌지 않음.
  - 결과로 `_ensWarmDone===false`(GPU 아틀라스 워밍업 미완), `_bootLoadActive===true`(정규 부팅 미완)가 지속.
  - 부팅을 강제(`_bootLoadActive=false`+`hideBootLoading()`+`_ensWarmDone=true`)하고 튜토리얼 스킵·run 진입 후 `loop()`을 구동해도 `_dbgEnsGL===0`, `_ens8GLTotal===0` — 정규 `draw()`가 `_prepEnemyInstanced`로 GL 인스턴싱을 타지 않음(강제부팅 렌더 상태는 정규 게임 draw 경로와 다름). `_useGL/GL/_ensGLProg/_ensGLVao`는 모두 준비됨에도 GL 경로가 호출되지 않아, 억지로 GL을 찍으면 워밍업 안 된 텍스처로 깨진 프레임이 나와 거짓 검증이 됨.
  - **필요 조치**: MCP Chrome 탭을 `visibilityState==='visible'`인 실제 포그라운드 탭으로 만들어 60fps 정규 부팅을 완료하거나, QA/총괄이 정규 게임 실행에서 GL 몹 피격 A/B·연속 피격·사망 잔상/이중 표시를 실화면 캡처한다. 2D 폴백은 실화면 검증 완료(동일 로직)이나 증거 확보 전까지 GL 경로는 "검수 대기" 유지.
  - 검수 소스 해시: `game.html` SHA-256 `d7255da10090ec1dbd93431f77dade8578e6cf1075d7f062d57ea2b9d642a857`(조회 시점 기준, 공용 파일이라 타 팀 편집으로 변동 가능).

## 8. 총괄 전달 요약(PM-014)
- 몹 피격 플래시(피격 표시) 결함을 코드로 확정하고 두 렌더 경로에 발광 플래시로 복원. 2D 폴백은 실화면 A/B로 확인, GL 인스턴싱은 코드·구문 검증(실화면은 정규 풀부팅에서 확정 예정). 피해·판정·쿨다운·에셋 불변. 필요한 결정: 없음(자율 범위). 남은 검수: GL 경로 실화면(QA 게임 실행 조율).

## 10. QA 인계 — PM-014 GL 경로 실화면 캡처 (QA·성능팀, 2026-10-01 01:45~01:49 KST)

> 작성: QA·성능팀. 이 절만 QA가 추가했고 위 내용은 수정하지 않았다. 판정·후속 결정은 ANIMVFX 소유.

**조건 (정규 런타임)**: `http://127.0.0.1:3333/game.html` 디스크 본문 SHA-256 `392fd13cf510290c…`, Chrome 153 headed·전면 창, `document.visibilityState='visible'`·`hidden=false`, `_ensWarmDone=true`·`_bootLoadActive=false`(정규 부팅 완료, 강제 플래그 없음), WebGL2(RX 9070 XT), 1920×1069, high/resScale 100, 데모 신규 Lv1. 컷신은 길게 누르기 스킵과 같은 `_cutsceneEnd()`, 가이드·연습은 화면 버튼 클릭. `loop()`·`draw()`를 직접 호출하지 않았다 — 정규 `loop()`가 끝난 직후 캔버스에서 몹 주변 220×220을 떠서 저장했다. QA 조작: 몹 추가 스폰(시드 고정, 2마리 중 1마리 HP 1e12 — 비치명 피격 관찰용, 이름표에 거대 HP가 보이는 것은 이 조작 때문), 플레이어 HP 보충, 저장 차단, 음소거. 공격은 실제 마우스 좌클릭 홀드. 시작 전 시스템 CPU 19~24%.

도구: `tools/qa_vfx_hitflash_capture.mjs`. 원본: `tmp/qa-perf-20261001/vfx/` (`vfx-cap0-*.png` 프레임 제한 없음 240Hz, `vfx-cap60-*.png` fpsCap 60, 각 `.json`에 프레임별 `_hitFlash`·`_ensGLMode`·생존·휘도·프레임 간격).

| 확인 항목 | 결과 |
|---|---|
| GL 경로 동작 | 추적 몹 프레임 샘플 GL 인스턴싱(`_ensGLMode=1`) 22,877건 · 2D 162건(240Hz 실행). 피격 순간 `_hitFlash` 6→5→4→3→2→1→0이 **GL 모드에서** 프레임마다 감소 — GL 경로 플래시 블록이 정규 런타임에서 실행됨 |
| A/B (피격 전 hf=0 ↔ 피크 hf=6) | `vfx-cap0-single-{3,4,5}.png`, 확대본 `vfx-cap0-single-4-zoom.png`·`single-5-zoom.png`. 크롭 평균 휘도 65→93(single-5), 73→83(single-3), 77→81(single-4). **다만 휘도 상승 대부분은 같은 프레임의 기검참 VFX·데미지 숫자·"그로기!" 텍스트다.** 실전 화면에서는 몹 몸통이 이 요소들에 덮여 가산 플래시 자체는 눈으로 구분하기 어려웠다 — 가독성 판정은 ANIMVFX 몫 |
| 연속 피격 | `vfx-cap0-rehit-6.png`: 6→5→4 도중 재피격으로 **6으로 재시작**(누적·중첩 없음) 후 정상 감쇠 |
| 사망 | `vfx-cap0-death-{0,1,2}.png`, `vfx-cap60-death-*`: 치명타 프레임부터 몹 스프라이트가 사라지고 시체·피 효과로 전환. 사망 뒤 **몹 실루엣 잔상·이중 표시는 크롭에서 보이지 않았다** |
| 발견 1 — 지속 시간이 주사율에 비례 | 감소가 draw 1회당 1이라 플래시 6프레임 = **240Hz에서 약 25ms, 60fps 제한에서 약 100ms**(`vfx-cap60`, 같은 hf 값이 rAF 4회 유지). 고주사율 사용자에게는 플래시가 1/4 길이로 보인다 |
| 발견 2 — 사망 뒤 `_hitFlash`가 6에 고정 | 죽은 몹은 GL 블록의 `!e.alive` 조건에서 건너뛰어 감소하지 않는다(모든 사망 시퀀스에서 hf=6 유지). 지금은 그려지지 않아 화면 영향이 없지만, 같은 객체가 **부활**(구울·보스 부활 경로)하면 부활 첫 프레임에 플래시가 남아 있을 수 있다 — 부활 경로 미검증 |
| 발견 3 — 첫 처치 끊김(QA 소관) | 첫 사망 프레임 전후 간격 329ms·100ms(`vfx-cap0.json`의 death-0 시퀀스 dt 열). 첫 시체·고어·드롭 빔 생성 비용으로 추정 — QA 백로그 QA-B01·B05에서 처리. 플래시 코드와 무관 |
| 한계 | 캡처는 CPU로 읽어 낸 캔버스라 최종 합성(HUD DOM·버스트 캔버스)은 빠져 있다. `vfx-cap60`의 "REHIT" 표기는 도구가 rAF(240Hz)마다 기록하고 draw는 4회에 1번이라 생긴 **도구 표기 오류**다(실제 재피격 아님). 2D 폴백 경로는 이번 실행에서 162건뿐이라 별도 판정하지 않았다 |

QA 판단: GL 경로 **코드 동작은 정규 런타임에서 확인**했다. **시각 PASS 판정은 하지 않는다** — 실전 가독성과 발견 1·2의 처리 여부는 ANIMVFX가 결정해 달라.

## 11. ANIMVFX 인수·수정 — 주사율 의존 수명 + 부활 잔상 (2026-10-01)

> QA §10 인계 인수. GL 경로 **코드 동작 = 검수 완료로 인수**(정규 런타임 `_ensGLMode=1` 22,877샘플). QA 발견 1·2를 수정했다. 수정 소스 `game.html` SHA-256 `775237034c6fec4c9de26b56c771b5ed03bc1037353cc292c4bec187d0f53967`(조회 시점).

### 원인(실제 소스 경로)
- 게임 루프는 **고정스텝 update**(`while(_acc>=PHYS_STEP){update();_acc-=PHYS_STEP}` `game.html:59536`)로 update를 실시간 60Hz로 돌리고, **draw는 렌더레이트(60/240)**로 돈다.
- 기존 `_hitFlash` 감소가 render(GL `_prepEnemyInstanced` 말미·2D 폴백 블록)에 있어 **draw당 1 감소** → 6프레임 수명이 240Hz 25ms / 60fps 100ms로 **주사율 의존**(QA 발견 1 = Node 재현과 일치).
- 죽은 몹은 두 render 경로가 `!e.alive`로 건너뛰어 `_hitFlash`가 마지막 값(6)에 고정 → 부활(구울/보스) 첫 프레임 잔상 위험(QA 발견 2).

### 수정(시각 상태만 소유, 4개 편집)
| # | 위치 | 변경 |
|---|---|---|
| 1 | update 타이머 구역(`game.html` "타이머 감소(컬링/짝홀 상관없이 항상 실행)", `_hitStun-=sp` 다음) | `if(e._hitFlash>0)e._hitFlash=Math.max(0,e._hitFlash-sp);` 추가 — 고정스텝 60Hz 감쇠(주사율 독립). `sp`로 slowmo/hitstop·뷰 밖도 기존 타이머(reviveIframes 등)와 동일 처리 |
| 2 | GL 플래시 루프(`_prepEnemyInstanced` 말미) | `e._hitFlash--` 제거 — 그리기만 |
| 3 | 2D 폴백 플래시 블록 | `e._hitFlash -= 1` 제거 — 그리기만 |
| 4 | 2D 사망 분기(`if(!e.alive){` 진입부) | `if(e._hitFlash)e._hitFlash=0;` 추가 — 죽은 몹 잔여값 즉시 소거(모든 사망 enemy의 매 프레임 단일 처리점 → 부활 첫 프레임 잔상 차단) |

### 검수 근거(게임 실행 없이 — M2 조율 준수)
- **주사율 독립 수명(발견 1 해소)**: 루프 누산기+고정스텝 update+render 분리를 Node로 재현(`tmp/` 시뮬). 수정 후 hf 6→0 실시간 = **60fps 100ms · 144Hz 104ms · 240Hz 100ms · 30fps 100ms**(update 6틱 고정, render 프레임 수만 달라짐). 수정 전 재현 = 60fps 100ms · **240Hz 25ms**(QA cap0 실측과 일치). → 60fps 베이스라인 보존, 고주사율 4× 단축 해소.
- **부활 잔상(발견 2 해소)**: 사망 분기 리셋으로 죽은 몹 `_hitFlash`=0. 사망 분기는 ghoul/boss/일반몹 분기 이전(2D 루프 최상단)이라 모든 부활 대상 커버. render는 살아있는 몹만 그리므로 사망 순간 손실 없음(죽은 몹은 어차피 미표시).
- **연타/중첩(발견 없음 유지)**: hurtE가 매 히트 `_hitFlash=6` 재세팅(값 불변) → 누적·중첩 없음(QA rehit 관찰과 동일). 감소가 update 단일 지점이라 이중 감소 불가.
- **GL/2D 전환·이중 방지**: 그리기 상호배타(GL `_ensGLMode===1` / 2D `!_ensGLQueued`) 유지, 감소는 update 단일 지점 → 경로와 무관하게 프레임당 정확히 1회(고정스텝). 이중 감소/이중 그리기 없음.
- **구문**: 인라인 JS 파싱 PASS(주 게임 스크립트 오류 0).

### 불변 계약(보존 확인)
- `hurtE`의 `_hitFlash=6/4` 세팅 원본 불변. `hp≤0`→death/`e.alive`·보상(`rollDrop`/`addExp`/`G.kills`/`G._stageKills`)·시체(`_addCorpse` 개수)·경직(`_hitStun` 별도)·쿨다운·판정 모두 불변. 변경은 `e._hitFlash`(시각 상태) 감쇠 위치와 사망 시 소거뿐.

### 가독성 판정(QA가 ANIMVFX로 이관 — 발견 A/B)
- **판정**: 현 가산(additive) 발광은 어두운 배경엔 어울리나, QA 정규 캡처대로 피격 순간 몹 몸통이 **기검참 VFX·데미지 숫자·그로기 텍스트에 자주 가려** 실전 식별성이 약하다. 특히 근접 피격은 플레이어 공격 이펙트가 몹 위에 겹치는 구조적 가림이 있다. AoE·투사체·원거리 피격에서 상대적으로 유효.
- **후속(별도 결정·범위 확장)**: 식별성 강화는 이번 수명/잔상 수정과 분리한다. 후보 — (a) 순백에 가까운 틴트(셀별 흰 실루엣 캐시, GPU 프록시 임의 텍스처 수용 확인 선행) 또는 (b) 짧은 림라이트/외곽 강조. 둘 다 실제 카메라 A/B로 강도·색을 튜닝해야 하므로 정규 GL 실화면(QA 조율) 확보 후 별도 착수. 확정 전 현 발광 유지.

### QA 재캡처 요청(수정본 확인용)
- 동일 도구/조건으로 **수정본** 재캡처: ① cap0(고주사율)·cap60에서 hf가 update 기준으로 감쇠해 두 경우 **실시간 수명 ≈100ms 수렴**(cap0가 25ms→100ms로 늘어남) 확인 — JSON의 프레임별 hf와 dt로 실시간 적분. ② 부활 경로(가능하면 구울/보스) 사망→부활 첫 프레임 `_hitFlash`=0·잔상 없음 확인.


### 2026-10-01 Mac 플래시 후속 읽기 인수
기존 ANIMVFX 세션이 §11의 본편 update 감쇠·GL/2D 감소 제거·사망 소거4영역을 대조하고 GL60/고주사율·연타·GL↔2D·사망·부활6검수 조건을 정리했다. 실제 GL 캡처는 아직 미실시다. easy의 이전 플래시 구현과 본편을 혼동하지 않는다. 팀 보고의77523703…은 줌 수정 전 해시이며, 현재 본편은 boundary 호출·캐시 키2줄만 달라져 나머지 플래시 바이트가 보존됐음을 총괄이 확인했다. 부활 잔상0을 실제 검수 완료로 보고하지 않는다. [후속 인수](../0마스터플랜/mac-resume-20261001/3팀-후속검토.md).


### 2026-10-01 Mac UI03 병행 후속 인수

기존 720a6335 세션에서 GL·고정 update·rAF 분리 플래시/사망/부활 관찰 하니스 후보를 제출했다. 실제 읽기·산출 완료이며 코드 적용/게임 실행/패키지/실측 완료가 아니다. 원문 후보 및 정정은 [팀 산출](../0마스터플랜/mac-resume-20261001/ui03-evidence/ANIMVFX-팀검토.md), 실제 수신/착수/다음 게이트는 [11팀 인수표](../0마스터플랜/mac-resume-20261001/11팀-UI03-병행후속.md)를 따른다.


### 2026-10-01 MAP020 병행 후보 실행 인수

관측도구작성·10스모크PASS. 실제10초update602/draw1188/rAF1188. GL게이트false·부활표본0이므로GL수명/부활PASS아님. 기존CLI는읽기검토,지원에이전트와root가실제파일작성/실행했다. [실행근거·제약·다음게이트](../0마스터플랜/mac-resume-20261001/11팀-MAP020-실행검수.md). 이전UI03후보미실행상태는당시이력이다.

최종관측도구보강은12/12스모크PASS. GL미존재와실제상실을구분하며이전raw의contextLost=true는상실증거가아니다.


### 2026-10-01 R 입력·GL·11팀 신규 후속 인수

정규 webgpu=0 부팅의 WebGL2/프로그램/VAO/context/warm 게이트를 확인했다. 실제 hurtE fixture 피격8개는6 update에서 hf0, 사망8개 첫 after-draw hf0/mode0, 같은 객체 본모습 부활5개 첫 after-draw hf0/GL 증거. 구울3개는 새 객체라 제외. 실제 draw 약30~31Hz로 고주사율·자연 공격·정확100ms 검수는 별도다. 이전 GL=false/부활0 이력 이후의 제한된 신규 인수이며 생산 플래시 코드는 그대로다. [관측 원자료·진단 범위·한계](../0마스터플랜/mac-resume-20261001/R-입력과-GL-후속검수.md)


## Mac 첫 머리 캡처 전투 전 준비 (2026-10-01 17:19 KST)

본편 `_warmHeadCapture2d`를setBootLoading의100%완료에연결했다. 기존ready CH1 south atlas→scratch48²→inactive split0의64²를한번복사하고양쪽정리,성공후에만done. 전투중·비GL·옵션OFF·미준비·활성슬롯은생략하며optional예외도부트종료를막지않는다. 기존사망함수·파편수/크롭/수명/물리·RNG·GL캐시·저장·품질불변,쉬운판/배포본미적용.

동일맥/화면/DPR1 자연관측의첫복사8.6→0.3ms,첫시체포함9.2→0.6ms,준비비용8.9ms를로딩으로이동했다. 표본7/3처치·랜덤장비·초기atmos차이로전체프레임개선율은판정하지않는다. 최종오류격리강화후부트8.5ms·실제두캔버스RGBA전부0·slot비활성/life0·자연처치/실화면확인. 관련21테스트/guard/6inline구문PASS·독립검토완료. 기존76.7ms·PC329ms및이번긴rAF공백원인미귀속.

[전체근거·시행내역·최종계약](../0마스터플랜/mac-resume-20261001/Mac-시체캡처-첫사용-준비.md). 과거수정0·미실행문구는해당시점이력이다.


### 2026-10-01 — QA-B01 빔 20타일 부트 준비 인수

본편 `_preloadAssets` 뒤·렌더러 전에 기존20타일 캐시를1장씩 yield하며 준비한다. 새5초 협력적 예산/취소/동일Promise/성공cache재사용/기존lazy폴백. 원래가공·색/알파24/72·180ms·60×160·layerLv/rarity·드롭/RNG/저장 불변. 실제20타일 전체픽셀0diff, 관련30테스트·guard·6inline PASS. 정상2표본 빔0으로 보완1회(진단부트사본의wrapper전투전복원) 추가: 자연rarity3 첫 빔·25초620호출 최대0.1ms, 빔마스크0. 모든표본 보존, 조건차이로 전체개선율 없음. 생산부트339.5ms(가공81.5/max34.6), 진단관측시작→로딩숨김10904.3ms/준비372.8ms. RGBA20MiB, 관측JSheap증가 약101.72MiB는다른로딩/GC포함·GPU총량미측정. 획득·저장·재로드는 분리fixture로 확인. worldItemSkin86.7/136.5ms·기타긴프레임 잔여, easy/패키지/배포 미적용. [전체 근거와 한계](../0마스터플랜/mac-resume-20261001/Mac-드롭빔-부트준비-검수.md).


### 2026-10-02 sparse C5 추가 반례와 원담당 수정

root가 sparse8+데모2를 재실행했지만 중간 record의 draws 누락을 dD=0처럼 판정해 전체 고주사율 PASS로 승격하는 반례를 재현했다. clockMissing의 draws 누락과 첫 record 검수 경계도 함께 보강할 필요가 있어 기존 patch 통합은 보류했다. 원바이트 before 보존 후 같은 ANIMVFX에 실제 canonical gate 수정·통합 한 건을 전달하고 Read 확인. 실제 >=90Hz 실측은 UNKNOWN, 생산 VFX/GL probe/게임 변경0. [실패 입력·SHA·후속](../0마스터플랜/mac-resume-20261001/vscode-dispatch/FIVE-OWNER-INTEGRATION-20261002.md).

## 2026-10-02 일반 body texture-failure Gate — 정적 인수

`ANIMVFX-texture-failure-body-0548`의 기존6 기록을 현재 queue/draw/body/facing 원문과 대조했다. 이 작업은 생산·테스트 변경 0, 기존6/18/57/11 및 root 검사 재실행 0이다. §5b/§10/§11의 피격 플래시 상호배타·수명·정규 GL 이력은 해당 효과의 검수이며 일반 body의 픽셀 중복 방지나 실패 복구 PASS로 확장하지 않는다.

| 백로그/Gate | 인수 내용 | 상태 |
|---|---|---|
| 일반 8dir body | 현재 `_eDrew=!!_ensGLQueued` 뒤의 `if(_a8)` 본문은 queued guard 없이 실행. 기존 선택 fixture의 idle/walk upload-prefix 입력과 별도 `X.drawImage` 호출만 확인 | 정적 source-sink 인수; 실제 GL 인스턴스/픽셀 수 미관측 |
| draw-time walk 실패 | 합성 `_getTex=null`에서 walk upload-prefix는 0, body walk 호출은 1. 그러나 정상 GL의 X도 GPU proxy이며 같은 `_getTex`를 사용하므로 독립 CPU/Canvas2D 구제·보행 픽셀 무누락 UNKNOWN | 실제 backend 실패/전체 caller 미실행 |
| 안전한 최소 후보 | queue-only/body-skip 단독 채택 금지. 등록 성공/양수 제출 반환/non-null 텍스처만으로 유효 알파·픽셀을 인수할 수 없음 | 생산 미채택; 후보 미정 |
| 유지 | 기존 hitFlash 계약·corpse fade 보류·발 앵커 UNKNOWN·스킨/프레임/좌표/전투 수치 | 이 작업 변경 0 |

원팀의 ‘idle 이중 출력’은 서로 다른 sentinel-prefix/일반 body 호출의 합산 기록이며 같은 UV·좌표·알파의 가시 중복 증거가 아니다. 정확 대역·함수/행·투명 텍스처 실패 정책·검색 분류·승인한 정본 수정은 [새 body Gate](../8.0몬스터디자인/ENEMY_GL_2D_BODY_FALLBACK_GATE_20261002.md)에 기록한다. 현재 실게임/native/GL/DOM/픽셀/청취 검수는 0이다.

## 2026-10-03 source9 생산 동기화 — windup 시각 계약·보스 소환 예외 회복

현재 근접몹 예고 백로그 행은 root 생산 적용에 맞춰 helper 연결 상태로 정정했다. 2026-10-01 코드 조사에서 `e._atkWindup`이 죽은 예고 조건으로 관측된 사실과 당시 팀 협의 필요 판단은 과거 이력이다. 원 literal 후보는 보스까지 새 ❗ 표시를 넓혀 미채택했으며 root corrected helper가 적용됐다.

| 시각 항목 | 현재 연결값 | 보존·검수 경계 |
|---|---|---|
| 예고 조건 | `if(_enemyWindupRemaining(e)>0){` | main52041 / easy50530. 이전 `if(e._atkWindup>0){` 조건만 교체 |
| 비보스 제외 | helper의 `!e.ib` | renderer에 전체 `!ib` guard가 있다고 주장하지 않음; 기존 `_b3Active` continue는 별도 조건 |
| 표시 대상 | 살아 있는 비보스의 일반 windup; 스턴·빙결·피격경직 제외 | 유한 양수 `st2`를 읽는 pure helper, AI 상태·판정·타이머 쓰기 없음 |
| ❗ 글꼴·위치·투명도 | 기존 font16, alpha0.9, `y-r-8` | 렌더 블록·원문 guard·스타일 불변 |
| 변경 크기 | helper174B + LF1B + 조건12B = 양판 각각187B | 기존 AI producer의 windup/attack 수치는 변경하지 않음 |
| 검수 | root corrected 후보36/36, 최종 공동 production46/46 | helper+조건의 synthetic 의미검수; 동일 파생 범위를 별도 완제품 성과로 더하지 않음 |

일반8f/etype3 5f는 windup 소진 뒤의 attack 타이머이며 windup은 진입 경로별 `st2`다. synthetic boss fixture에서 ❗ 제외를 확인한 결과를 자연 보스의 실제 렌더·픽셀 또는 native/visual PASS로 확대하지 않는다. source9 앱 빌드·실행0, 실화면·실청취 검수0. [최종 소스·공식 검사 pin](../CHANGELOG_SYNC.md)을 참조한다.

## 2026-10-03 CH1 사망 디졸브 원후보 보존 — 생산 미적용

source9 기준의 완료 ENEMY·ANIMVFX 원패치2를 불변 보존한다. source10 생산 소스(8bcdd163)의 변경은0이며, 이 원후보는 공동 의미검수에서 HOLD다. §6a의 사망 판정·보상·기존 시체 개수/수명 보존 원칙을 유지한다.

| 항목 | 실제 원후보·검수 결과 | 다음 최소 보완 / 경계 |
|---|---|---|
| 사망 연결 | 실제 `_addCorpse`는 `e.alive=false` 후 호출. 원 helper의 alive 필수 guard 때문에 양판 정상 dead에서 corpse1/fade0 | snapshot이 사망 시점을 수용해야 함. actor의 alive 임시 복구0 |
| 크기 | 원 helper의 `max(r×3.5,30)`은 보조 경로. 현행 일반 body는 `max(r×7,80)` | 현행 live metadata를 사용; 별도 크기 축소 팝0 |
| pose·방향 | 원 snapshot은 idle base crop. live 방향 미준비 시 south-ready fallback과 이동 overlay를 반영하지 않음 | 실제 현재 sprite crop·fallback 계약 완성 필요 |
| 초기화 | 원 pool은 `_clearDeathDecals`의 기존 initStage/arena 정리 후에도 잔상1 잔류 | 기존 cleanup에 active/img 정리 연결. 모든 scene reset으로 일반화0 |
| 수명·합성 | 원 consumer는 draw 경로에서 감쇠. pause/`_dtSp=0` 시 벽시계 만료 보장0; source-over는 상속 | fixed update 수명 및 local save/restore·source-over 정합 보완 필요 |
| 최신 제작목표 값 | 20f / cap24 / scaleY1→0.8 / 아래6px / 기존 atlas만 | 이전10–14f·4~8px는 2026-10-01 설계 제안. 현재 목표는 후보값이며 생산 도입0 |

검수는 실제 `_addCorpse`+원 pool/hook/draw의 메모리 연결1회다. 자연 hurtE·전체 renderer·픽셀·GL·native·성능 인수0. draft SHA 변경으로 축 실행 전1회 중단한 이력은 제품 실패로 계산하지 않는다. root의 corrected metadata/consumer 제작은 별도 다음 목표이며, 이 원패치 자체는 수정하지 않는다. 실제 증빙 `tmp/mac-migration-runtime/continued-review-20261003/root-deathfade-source11/receipt.json` SHA `415e5d2d8b3f552aec3ea31a1cf354539e71915ab020b65cd561430429320c4a`.


## 2026-10-03 source23 — 보스 착지·탄막 전조 범위 동기화

| 상태 / 적용 위치 | 현재 표시값 | 실제 판정·보존 경계 |
|---|---|---|
| `bossJump` 바닥 fill/stroke | `e.jumpX,e.jumpY` 중심 반경300px 고정. 이전30~60px 및 후보300×진행도는 미사용 | 착지 즉시 피해 `dst(P,e)<300`·atk×1.8·무적/돌진 예외 유지. 충돌 없는 경로에서 목표=실착지 중심. 벽막힘 시 실제 `e.x/e.y`와 목표의 기존 괴리는 미해결 |
| `bossFanWind` arc·오브 각도 | `π×(.7+e._bossPhase×.06)`, 페이즈0~4에서126/136.8/147.6/158.4/169.2도 | 실제 발사 `fanW`와 동일식. 방향 표시 길이 `120+stage×3`은 사거리 표시가 아님. 탄 수·RNG·피해·수명·유도 불변 |
| 검수 / 적용 | 양판 각각 draw3접점만 수정, 역치환 source22 byte-exact. 신규8 PASS(원본4 PASS/4 FAIL); 실제 분기·기존 회귀 포함12 PASS | canvas는 호출 기록 대역이며 native·화면·GPU·시각 최종 인수 아님. source23 앱3398 포장·타이틀·HTTP 확인; source22/3397 앱은 기존 코드 보존 |

상세 수치·실제 분기·한계·§23 보고는 [source23 전조 계약](CH1_BOSS_LANDING_FAN_TELEGRAPH_20261003.md)을 따른다. 피해·패링·타이밍·맵 geometry·카메라·기존 앱/세이브는 변경하지 않았다.


## 2026-10-08 현재 계약 — ROOT-CH1-HITFLASH-CURRENT-FRAME-20261008

이 절은 이번 본편 피격 효과의 현재 구현 계약이다. 앞선 2026-10-01 등의 “idle 셀 1장/고정 크기” 설명과 기존 검수는 당시 구현의 이력으로 보존한다. 현재 일반 8방향 본체는 base와 조건을 통과한 walk를 덧그리므로, flash도 같은 render에서 실제 소비한 레이어 순서를 재사용한다. 전용 CH1 중형 육괴는 자기 시트·crop·종횡비를 사용한다. 전투 수치나 hitFlash 수명 변경은 없다.

| id / 적용 위치 | 현재 정확 계약 |
|---|---|
| 소유 / 범위 | ROOT, game.html own 10 hunks. 기존 일반 8방향 enemy pipeline 및 CH1 전용 중형 renderer. stage/URL opt-in 한정 기능이 아니다. 보스·다른 특수 renderer 전체 완료를 뜻하지 않는다. |
| 프레임 저장 | private `_enemyHFFrames: Map(e → layers)`, `_enemyHFSubmitted: Set(bucket)`. animation·이미지 resource의 소유권은 받지 않는다. |
| 초기화 | `_prepEnemyInstanced` 진입에서 두 collection을 clear한다. GL 준비 실패/비활성 조기 반환보다 먼저 실행한다. |
| 기록 Gate | `e._hitFlash>0`일 때만 `[img,sx,sy,sw,sh,x,y,w,h,bucket]`을 기록한다. Canvas 기본 bucket=-1. 현재 e 객체가 key이며 좌표가 같은 다른 e와 공유하지 않는다. |
| GL queue | `_queueEnemyHFFrame(e,...)`가 기존 queue의 true 반환 뒤에만 기록한다. 화면 중심 좌표를 nominal world rect로 복원: `x-VW*.5+G.cam.x-w/2`, `y-VH*.5+G.cam.y-h/2`. 새 zoom 보정은 없다. |
| GL 제출 | `GL.drawArraysInstanced`가 throw 없이 반환한 뒤 bucket 표식을 넣는다. flash는 submitted 표식과 `_ens8GLImgs[bucket]===img`가 모두 필요하다. queue true만으로 제출/실 GPU 업로드 성공을 선언하지 않는다. |
| Canvas body | `_drawEnemyHFBody`는 원 `X.drawImage` 호출 뒤 `!e._ensGLMode`일 때 `e.x+x,e.y+y,w,h`를 기록한다. throw면 기록하지 않는다. 기존 queued body를 flash용으로 중복 기록하지 않는다. |
| 실제 레이어 | base→walk의 실제 image/crop/rect 순서를 재사용한다. walk queue 용량 초과·텍스처 미제출·미준비는 해당 레이어를 새로 만들어 flash하지 않는다. 캡처 이후 선택 정보/위치 변경으로 crop을 재계산하지 않는다. |
| pop | `1+.05*Math.min(1,e._hitFlash/6)`. 각 rect 중심을 유지해 `x+w*(1-pop)/2,y+h*(1-pop)/2,w*pop,h*pop`. |
| alpha / blend | GL `Math.min(1,e._hitFlash/6)*.8`; Canvas는 여기에 기존 `sa`를 곱한다. 원 save/restore와 lighter/`_setBlend` 경로 유지. base+walk 겹침 밝기는 실화면 미인수다. |
| 일반 body 크기 | 기존 `Math.max(e.r*7,80)` 등 실제 선택된 rect 그대로. flash가 별도 일반 atlas idle 셀을 재선택하지 않는다. |
| 전용 중형 | `_drawCh1StartMediumEyeMass`의 실제 image/sx/sy/fw/fh와 `drawH=Math.max(240,e.r*7)`, `drawW=drawH*(fw/fh)` 재사용. 기존 4×8 선택·방향·공격 column 권한은 그대로다. |
| 불변 | 기존 hitFlash 설정 6/4, 고정 update 감쇠·사망 소거, 피해/timing/CC/보상/자원/스킨 할당/시체/PNG/scene/nav/save 변경 없음. 새 RAF/timer/Image/fetch/resize/borrowed image close/dispose 없음. |
| 비용 / 한계 | Map/Set와 hit 중 per-layer 배열이 추가된다. 성능·메모리 비용 UNKNOWN. GL 제출은 pixel ACK가 아니다. 기존 GL/Canvas body duplication, texture 실패 후 기존 _ensGLMode, parent proxy silent failure는 미해결/미인수다. zoom/shake/모든 화면 pixel 정렬·동일 canvas pixel 재쓰기 탐지·해부학 foot도 미인수다. |

| 정확 완료 source / 검수 | 값 / 실제 범위 |
|---|---|
| working game | 4113269B / SHA256 `0b423864dc59271a8a0161a2632cac415cc9b27c5aa53c6ea0e018673a6bd49e` |
| owned game | 4113084B / SHA256 `6430cbdce791414bdd6299a8de99b7115105eb6a99529a5e3a51f39b3ca83ffd` |
| foreign 보존 | game foreign185B와 설정3.3 foreign2948B 미채택. working/HEAD 각각 외부 fullbytes 선 백업, 동일 own hunk 적용, inverse exact, owned blob만 부분 stage. |
| 최초 CPU | 실제 main 함수/normal body·flash 블록 + 통제 Canvas/GL/atlas metadata. Node1/VM15/11그룹/34조건 PASS, FAIL0/setup0/미도달0/exit0, unhandled 계측0. PNG decode/GPU/Chrome/audio/save0. |
| CPU Gate | idle·base+walk·south fallback·queue 용량·texture 실패·GL throw·bucket image identity·frame clear·actor 분리·Canvas throw·전용 중형 비정사각 aspect·alpha/transform/restore. 기존 suite 재실행/clean 합산 없음. |
| source 정적 peer | 최종 own hunk Gate4 연결 확인, 신규 blocking finding0. 정적 검토는 GPU/실화면 인수가 아니다. |
| native / UI | NOT_RUN / UI_NOT_ASSESSED. 새 PNG0, 청취0, durable Save ACK0. 기존 사용자 IAB13 old-loaded source를 닫거나 재로드하지 않았고 새 코드가 적용됐다고 주장하지 않는다. |
| docs 검색 | 코드 후 새 전체 관련 검색1회: eligible text1022/Markdown818 → 42매칭경로/1839행/1898회. 현재 정본8개 정확 동기화. 42문서 전수 fullread 주장은 하지 않는다. 과거 asset 목록·역사/보호 문서는 그대로 보존한다. |
| 증거 위치 | `E/ch1-hitflash-current-frame-20261008/`: implementation-receipt, cpu-execution-receipt, cpu-result, final-source-peer, validation-receipt, visual-verdict, docs-disposition, docs-completion-receipt, remote-preservation-receipt. E는 승인된 외부 영수증 루트다. |

MAP PRODUCTION REPORT (§23): STAGE=CH1-1 전투 가독성 source consumer. MASTER(silhouette/regions/main route/side spaces), OUTER MASS(LEFT/RIGHT/TOP/SOUTH/major holes), LARGE(assets/composites/overlap/repetition), MEDIUM(connections/remaining holes), GROUND(shadow/contamination/integration), PLAYABLE(arenas/travel/breathing/threat/readability), LANDMARK(primary/secondary/tertiary), CAMERA QA(START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT), TECH QA(route/collision/pageerror/404/seam/loading/performance), FILES/GIT의 표준 세부 항목은 위 외부 `visual-verdict.json`에 기록했다. 이번 geometry·원화·nav 변경0, 실카메라/환경 시각 QA NOT_RUN, physical relief0/확대 흐림/절벽 전경·공통 발 접지는 미완료다. GIT의 최종 staged/commit/push는 같은 단위 completion/remote 영수증을 우선하며 이 절의 검수 시점을 사후 성공으로 바꾸지 않는다.

**VISUAL VERDICT: RETOUCH.** 이번 기능의 실화면 미검수이며 통제 CPU PASS를 시각 PASS로 승격하지 않는다. 다음은 허용된 새 실제 화면의 피격 가독성·normal CH1-1 보스 개방/사망/부활/재도전·청취·실보상 save 인수다.

## 2026-10-08 — 드루이드 본체 피격 플래시 연결

`ROOT-CH1-DRUID-BODY-HIT-FEEDBACK-20261008`: normal rig의 현재 canvas 또는 native 폴백의 같은 crop에 기존 `min(1,_hitFlash/6)*.8*sa` alpha·`1+.05*min(1,_hitFlash/6)` 중심 pop을1장 적용한다. 상시3pass는 유지하고 special/hit/death는 제외한다. 현재 부모 변환 안에서 그리며 `_enemyHFFrames` 등록0·타이머/전투/save 변경0. [정확 계약](VFX_구현가이드.md#ch1-druid-body-hit-feedback-20261008). 최초 통제10그룹97확인/Node1 exit0·before 반례1 별도; 실제 화면/GPU/청취/save 미검수, RETOUCH/UI_NOT_ASSESSED. 외부 `ch1-druid-body-hit-feedback-20261008/completion.json`이 최종 보존 정본이다.
