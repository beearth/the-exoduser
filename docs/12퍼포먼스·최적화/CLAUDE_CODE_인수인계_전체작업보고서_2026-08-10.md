# Claude Code 인수인계 — 전체 작업 보고서

- 작성일: 2026-08-10
- 프로젝트: **지옥의 길 / HELL: EXODUSER**
- 작업 루트: `G:\exoduser`
- 현재 목표: 500여 엔티티 난전에서도 프레임 스파이크 없이 안정적인 60FPS를 유지하도록, 렌더·로딩·GC 비용을 단계적으로 낮춘다.
- 이 문서는 Claude Code가 현재 상태를 이해하고 **안전하게 다음 최적화만 이어서** 할 수 있게 만든 인수인계 원본이다.

## 1. 절대 규칙 및 실행 환경

1. `AGENTS.md`가 최우선이다. 코드 한 줄을 바꾸면 반드시 `rg/grep`으로 관련 `docs/`를 전수 검색하고, 코드·문서의 이름/수치/구현 상태를 동기화한다.
2. 메인 게임은 `game.html` 단일 파일이다. 서버는 `server.cjs`, 로비는 `index.html`, 데스크톱 진입점은 `Electron/main.js`다.
3. 개발 서버는 반드시 다음 명령을 쓴다. `python http.server`는 금지다.

   ```powershell
   cd G:\exoduser
   & "C:\nvm4w\nodejs\node.exe" server.cjs
   ```

4. Windows의 일반 `node` shim은 깨질 수 있다. 테스트도 `C:\nvm4w\nodejs\node.exe` 전체 경로를 사용한다.
5. `docs\2_3 돌진+패링+방패시스템\`은 수정 금지다. 무지개탄(`blackBean`) 패링 가능으로 바꾸지 말 것. 공격 티켓 시스템도 구현 금지다.
6. DOM 부모 컨테이너에 `textContent`/`innerHTML`로 덮어쓰지 말 것. 리프 노드 또는 명시 id/class만 갱신한다.
7. `git reset --hard`, `git checkout --` 등 롤백 금지. 작업 트리는 이미 광범위하게 dirty이므로, 관련 없는 변경을 되돌리거나 포맷하지 않는다.
8. 대형 수정 전에는 백업을 남긴다. 현재 기존 백업: `game.html.bak_20260809_before_8dir_enemy_instancing`.

## 2. 현재 코드/성능 구조

| 영역 | 현재 구조 | 유지 원칙 |
|---|---|---|
| 적 렌더 | 8방향 적 인스턴싱 버킷, 사전할당 CPU 전송 버퍼 | 2D Canvas 폴백과 충돌/AI를 바꾸지 않는다. |
| VFX | GPU VFX 버퍼 + Canvas 폴백, 대표 텍스처 워밍업 | 공격 VFX 외형은 사용자 요청으로 **손대지 않는다**. |
| 맵 | 스트리밍 청크 + 유휴 시간 청크 빌드 | `genFromTemplate` 사용, 시작 6시/출구 12시/상단 통로 보장. |
| GPU 웜업 | 오프스크린 실제 draw/flush, 로딩 중 또는 유휴 큐 | 게임 상태·세이브 데이터를 바꾸지 않는다. |
| 진단 | `?perf=1`에서만 콘솔 계측 활성화 | 기본 실행에서 로그가 프레임을 느리게 하지 않아야 한다. |
| 정적 서버 | HTML no-cache, 비HTML 1시간 캐시 + ETag | Range 이미지/오디오 스트리밍을 훼손하지 않는다. |
| 플레이어 투사체 | `_PPROJ_POOL=120`, 객체/일반 `hitSet` 재사용 | 적중·관통·데미지 수식은 불변이다. |

## 3. 이번 최적화 작업에서 완료한 내용

### 3.1 렌더·맵·GPU

- 적 8방향 인스턴싱과 VFX GPU 버퍼 경로를 유지·검증했다. 대량 적/VFX의 렌더 버퍼는 사전할당하며 Canvas 폴백을 보존한다.
- 적, VFX, 보호막 등 실사용 이미지의 실제 draw/flush 워밍업을 로딩/유휴 큐로 옮겼다. 첫 사용 텍스처 업로드성 스파이크를 로딩 화면 뒤로 보낸다.
- 대형 맵 스트리밍에서 화면 밖 청크 생성은 유휴 시간에 분산한다. 이동 중 맵이 꿈틀거리던 문제는 좌표계/뷰포트 캐시 정합성 수정으로 해결됐고, 사용자는 현재 끊김이 사라졌다고 확인했다.
- 보스 시작 보호막(화톳불 배리어) 텍스처 워밍업을 별도로 두었다. 이전 `[POST SPIKE]`의 bonfire 13ms대 1회성 비용과 분리해 추적 가능하다.

### 3.2 프레임 스파이크 진단

- 디버그 플래그: `?perf=1`일 때만 `_DEBUG_PERF=true`.
- 기본 실행에서는 `[drawP]`, `[S6-SUB]`, `[S7-SUB]`, `[S7-DETAIL]`, `[POST SPIKE]` 로그를 출력하지 않는다.
- 원시 rAF 간격이 34ms 초과일 때만 `[FRAME HITCH]`를 500ms 간격으로 출력한다. 기존 50ms 프레임 시간 clamp는 변경하지 않았다.
- Long Task API가 있는 브라우저에서는 `[LONG TASK]`를 디버그 모드에서만 관찰한다.
- 부트 단계별 시간은 `[BOOT PERF]`, 500ms 초과 에셋은 `[BOOT ASSET SLOW]`로 표시한다.
- Headless Chrome 검증으로 일반 부트는 약 2.42초, 첫 에셋 이벤트는 약 1.43~1.47초였다. 수십 에셋이 동시 큐에서 완료돼 단일 불량 파일은 확인되지 않았다. 그래서 근거 없이 에셋을 제거/지연하지 않았다.

### 3.3 반복 로딩 서버 최적화

`server.cjs`에 다음을 추가했다.

| 변경 | 동작 | 범위 |
|---|---|---|
| 비HTML ETag | `"<size hex>-<mtime hex>"`, `If-None-Match` 일치 시 304 | 이미지/오디오/JS/JSON 등 기존 1시간 브라우저 캐시 유지 |
| HTML gzip Buffer 캐시 | `size:mtime` 키로 gzip level 6 결과를 Promise/Buffer로 재사용 | `game.html`/`index.html`의 같은 서버 프로세스 내 반복 요청 |
| 자동 무효화 | 크기 또는 수정시각 변경 시 다음 요청에서 새 gzip 생성 | HTML은 계속 `no-cache, no-store` |

- 이미지·오디오·Range 요청과 HTML 이외 gzip 대상은 기존 스트리밍 경로를 유지한다.
- 이 변경은 **서버 재시작 후** 적용된다.

### 3.4 런타임 할당 감소 — 플레이어 투사체

- `_PPROJ_POOL=120`의 각 객체가 `_mkPProj()`에서 `_hitSet`을 한 번 만든다.
- `_resetPProj()`와 `_recyclePProj()`는 이 Set을 `clear()`한다.
- 청탄, 번개, 빙검, 악의 사냥, 역병 등 `_getPProj()` 기반 일반 스폰부는 `new Set()` 재할당 대신 `clear()`만 사용한다.
- 연쇄 분열탄의 `new Set(p._hitSet)`은 피격 이력을 자식탄에 복사하는 의미가 있으므로 그대로 유지했다.
- 피해, 관통, 적중/재히트 판정과 스킬 수치는 변경하지 않았다.

## 4. 오류/히치 대응 이력

| 관측 | 판단/조치 | 현 상태 |
|---|---|---|
| `necklace_fire.png`, `cape_fire.png`, `earring_fire.png` 404 반복 | 존재하지 않는 아이템 스킨 변형 요청의 폴백/누락 처리 경로를 점검·정리 | 반복 404가 프레임을 흔들 수 있으므로 재발 시 Network 탭에서 요청 원점을 먼저 확인 |
| `[POST SPIKE] ... bonfire:13.4ms` | 첫 화톳불 배리어 텍스처 업로드 가능성을 분리하고 사전 워밍업 경로 적용 | 현재 끊김은 사용자 확인상 해소 |
| `drawP S6/S7` 수십 ms | 구간/서브구간 진단을 `?perf=1`으로 제한하고, 보호막·펫·pProjs 분해 로그 제공 | 정상 실행에서는 로그 비용 없음 |
| 이동 시 맵 꿈틀거림 | 스트리밍 맵 캐시의 뷰포트 원점/청크 빌드 타이밍 정합성 점검 | 사용자 확인상 해소 |

## 5. 검증 자산과 최근 통과 결과

최근 통과한 테스트:

```powershell
& 'C:\nvm4w\nodejs\node.exe' --test `
  test\pProjHitSetPool.test.js `
  test\staticHtmlGzipCache.test.js `
  test\staticAssetEtagCache.test.js

git diff --check -- game.html server.cjs `
  test\pProjHitSetPool.test.js `
  test\staticHtmlGzipCache.test.js `
  docs\12퍼포먼스·최적화\12퍼포먼스·최적화.md `
  docs\12퍼포먼스·최적화\프레임최적화_전수조사_2026-05-21.md
```

결과: 테스트 3개 PASS, `git diff --check` PASS.

추가 성능/브라우저 검증 도구:

| 파일 | 용도 |
|---|---|
| `tools/verify_boot_stage_timing_browser.mjs` | `?perf=1` 부트 단계/지연 에셋을 Headless Chrome으로 수집 |
| `test/bootStageTimingDiagnostics.test.js` | 중앙 부트 단계 계측 계약 |
| `test/bootAssetSlowDiagnostics.test.js` | 지연 에셋 계측 계약 |
| `test/frameSpikeDiagnosticDebugGate.test.js` | 기본 실행의 프레임 로그 차단 계약 |
| `test/frameHitchGapDiagnostics.test.js` | raw rAF gap 진단 계약 |
| `test/longTaskDiagnostics.test.js` | Long Task 디버그 계측 계약 |
| `test/staticAssetEtagCache.test.js` | 비HTML ETag/304 계약 |
| `test/staticHtmlGzipCache.test.js` | HTML gzip 재사용/스트리밍 보존 계약 |
| `test/pProjHitSetPool.test.js` | 투사체 `hitSet` 풀 재사용 계약 |

## 6. 현재 보류 지점과 다음 권장 순서

### 역병 투사체 할당 감사 — 실측 완료·종결 (2026-08-10, 측정 기반 NO-GO)

**상태: 감사 완료. 실측 결과 GC 병목이 아님이 확인되어 고위험 구조 변경을 하지 않기로 종결.** 다음 세션은 이 항목을 재조사하지 말 것.

감사 대상 할당(`game.html`, 투사체 1발 수명당):

| 위치 | 할당 | 빈도 |
|---|---|---|
| `game.html:28002` `if(!p._plagueTargets)p._plagueTargets=[]` | 배열 1개 | 투사체당 1회(리셋 시 `null`→재할당, `13333`) |
| `game.html:28002` `.push({x:e.x,y:e.y})` | `{x,y}` 객체 | 적중당 1회, 최대 `_plagueCap`(≈90, 상한 100) |
| `game.html:28013` `const _peHit=new Set()` | Set 1개 | Finale당 1회 |

**결정적 사실 — 발사 케이던스가 쿨다운으로 하드캡됨:** 역병 투사체 스폰 지점은 단 2곳(`37076` 독혈해방 버스트, `37449` `firePlague` 스킬)이며 **둘 다 같은 `P._pbCd` 쿨다운**으로 게이트된다.
- `game.html:37046` `if(_isPlagueGF&&(P._pbCd||0)>0){return}` — 쿨 중이면 버스트 전체 스킵
- `game.html:37048` / `37441` `P._pbCd=Math.max(600,~~(900*(1+_cdRed())))` — 최소 600프레임(=10초), 최대 15초

즉 **역병 투사체는 최대 0.1발/초**다. "평타마다 난사"는 실제로 일어나지 않는다. 투사체 수명(비행 ~2~3초)도 짧아 동시 생존은 사실상 1발.

**마이크로벤치 실측(할당 패턴 200만 발-등가 재현, `--expose-gc` + `perf_hooks` gc 관측):**

| 지표 | 값 |
|---|---|
| 투사체 1발당 GC 정지 | 0.13 µs |
| 풀링 전환 시 절감분(A−B) | 0.06 µs/발 |
| **실제 케이던스(0.1발/s) 기여** | **0.0008 ms/분 ≈ 0** |
| 스트레스 ×100(10발/s, 물리적 불가) | 0.08 ms/분 |
| 비현실 ×1000(100발/s) | 0.81 ms/분 |

60fps 프레임 예산 16.7ms 대비, 비현실적 ×1000 스트레스에서도 프레임당 0.0000224ms로 4~5자릿수 아래다. **역병 할당은 GC 병목이 아니며, 쿨다운 구조상 병목이 될 수도 없다.** 인수인계 6.1 게이트 조건("실측에서 역병 난사 GC가 병목으로 확인")은 실측으로 불충족.

**보류(참고용) — 언젠가 진짜 병목이 확인되면 적용할 안전 수정안:** `_plagueTargets`를 풀링 배열로 상주시키고 `null` 대신 카운터(`_plagueTgtN`)를 0으로 리셋, 적중 시 기존 `{x,y}` 슬롯 재사용/부족 시만 push, Finale는 `.length` 대신 카운터로 순회. 코드에 이미 동일 선례 있음(`_trail`, `game.html:27812`). behavior-neutral. 제약: `_plagueCap`≤100 유지(30 고정버퍼 금지), Finale AoE 순서·반경(`_peR`)·중복판정(`_peHit`) 100% 불변. **단, 위 실측대로 이득이 없으므로 실기기 `?perf=1`에서 역병이 병목으로 재현되기 전에는 착수 금지.**

측정 스크립트 원본은 세션 스크래치패드의 `plague_alloc_bench.mjs`. 재현 필요 시 `tools/`로 이관 가능.

### 이후 우선순위

1. `?perf=1` 실기기 로그로 재현되는 병목 하나를 먼저 고른다.
2. 첫 실전 투사체/특정 VFX 히치가 다시 보이면, 이미 있는 워밍업 체계를 해당 **실제** 이미지/블렌드 경로에만 확대한다. 임의 웜업 금지.
3. 적/투사체 GPU 배칭은 드로우콜·텍스처 전환이 병목으로 확인된 경우에만 진행한다. 충돌/AI/밸런스와 분리한다.
4. map stream은 현재 안정화 상태이므로 재작업하지 않는다. 청크 생성이 재차 16ms를 넘는 실측이 있을 때만 검토한다.

## 7. Claude Code 작업 체크리스트

- [ ] 작업 전 해당 시스템 문서를 먼저 읽기
- [ ] 변경 전 관련 `docs/`를 `rg`로 전체 검색하기
- [ ] 큰 수정이면 백업 만들기
- [ ] 테스트를 먼저 추가하고 실패를 확인하기
- [ ] 최소 코드 변경 후 관련 테스트 + `git diff --check` 실행하기
- [ ] 코드/수치/구현 상태를 모든 관련 문서에 동기화하기
- [ ] 공격 VFX 외형, 돌진/패링/방패 확정 설계, 맵 필수 규칙을 건드리지 않기
- [ ] 공유 dirty worktree의 무관한 변경을 롤백/정리하지 않기

## 8. 핵심 참조 문서

- `AGENTS.md`
- `docs\12퍼포먼스·최적화\12퍼포먼스·최적화.md`
- `docs\12퍼포먼스·최적화\GPU_이관_적용성_조사와_실행_로드맵_2026-08-09.md`
- `docs\12퍼포먼스·최적화\성능최적화_보고서_2026-05-23.md`
- `docs\12퍼포먼스·최적화\프레임최적화_전수조사_2026-05-21.md`
- `docs\2_3 돌진+패링+방패시스템\2_3 돌진+패링+방패시스템.md` (읽기 전용)

이 보고서의 상태를 기준으로 Claude Code는 “실측 → 실패 테스트 → 최소 수정 → 문서 동기화” 순서를 유지해야 한다.
