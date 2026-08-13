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

### 6.3 엔티티 부하 프레임 실측 — 주 병목 재현 완료 (2026-08-11)

6.2의 "재현되는 병목 하나 선택"을 수행. 두 종의 실측을 돌렸다.

**(A) 부트 단계 실측** (`tools/verify_boot_stage_timing_browser.mjs`, headless):
- 부트 총 ~2.36초 중 단일 "9%" 에셋 로딩 스테이지가 ~1.31초(55%). 지연 에셋 타임스탬프가 파도(wave)로 뭉침(~1.31s/1.58s/1.76s/2.01s/2.24s) = **HTTP/1.1 커넥션 한도(~6) 직렬화**. 부트 중 정적 에셋 404 없음(과거 necklace/cape/earring 404는 부트 시 미발생). 유일한 404는 `/api/load/t1`(세이브 없음—정상), `bgm/intro.mp4` 1건 abort.
- **판정**: 이 1.3s는 로컬 dev 서버(HTTP/1.1) 아티팩트로, 프로덕션(Vercel HTTP/2+CDN)에선 병렬화되어 대부분 사라진다. 임의 에셋 지연은 3.2 경고에 걸리므로 **부트에는 안전한 코드 이득이 없다**. 실기기/프로덕션 `?perf=1`에서 부트가 재차 문제로 확인될 때만 재검토.

**(B) 엔티티 부하 프레임 프로파일** (`tools/verify_entity_load_cpu_profile.mjs`, **HEADED 실 GPU 필수**):
`?bosstest=3&perf=1` god 아레나에서 `mkEn`으로 적을 단계적으로 늘려 `_prof.u`(CPU update)·`_prof.d`(GPU draw)·`_prof.t`(프레임) 측정. 플레이어 주변 링 밀집 스폰(초선형 비용 상한 관측용).

| N(적) | U(CPU update) | D(GPU draw) | T(프레임) | 판정 |
|---|---|---|---|---|
| 100 | 0.21ms | 1.41ms | 1.64ms | 여유 |
| 300 | 1.10ms | 3.59ms | 4.71ms | 여유 |
| **500** | **5.58ms** | **12.77ms** | **18.36ms** | **예산 16.7ms 초과 (~54fps)** |
| 700 | 16.66ms | 19.93ms | 36.65ms | 붕괴 (~27fps) |

`[PERF avg]`(>300 auto-on): **drawCalls 19k→53k 폭증**, ai 1.5→5.9ms, coll ~0.1ms(워커 오프로드로 저렴), render 4.5→9.9ms, dom 0.

**핵심 발견 — 주 목표(500엔티티 60fps)의 실측 재현된 병목:**
1. **U(CPU AI update)가 초선형(~O(n²)) 증가**: 300→500→700에서 1.1→5.6→16.7ms. 밀집 시 이웃질의(적-적 분리/타깃 스캔/shQuery) 밀도 비례 비용으로 추정. coll(워커)은 저렴하므로 병목은 워커 밖 AI 로직.
2. **드로우콜/프로그램 전환**: render 4.5→9.9ms. 6.2-3이 "드로우콜/텍스처 전환이 병목으로 확인된 경우에만" GPU 배칭 착수하라던 **그 증거 확보**.

**드로우콜 정밀 분석 (렌더 경로 정적 조사, 2026-08-11):**
- **적 몸체는 이미 잘 배칭됨**: 8방향 인스턴싱(`game.html:4155~4274`), 텍스처 버킷(8dir×idle/walk=16)당 `drawArraysInstanced` 1콜 → 전체 적이 ≤16 드로우콜. 여기는 건드릴 필요 없음.
- **GPU 배칭 결론 — 이득 없음(이미 배칭됨)**: `mkEn`(24073)은 끝에서 `_assignMobSkin(_e)`(24323)를 호출해 **모든 비-보스 적에 `_mob8dir=true`를 무조건 설정**(17819). 즉 실게임 일반 적은 **전부 8방향 인스턴싱 경로**(4386~4415)를 탄다. 이 분기의 렌더는: 스프라이트=`_queueEnemy8DirInstanced`(인스턴싱, 버킷당 1콜) + 그림자=`X.ellipse().fill()`(4404, 전부 `_whiteTex`라 자기들끼리 배칭). 이 분기에 `drawImage`/아틀라스 텍스처 없음 → **적별 텍스처/셰이더 thrash 없음.** ProxyX(4895~)는 정교한 단일 쿼드 배처이고 `globalAlpha`는 셰이더 전환이 아니라 정점색에 굽힘(4912) → alpha 변경도 flush 안 함.
- **초기 진단(프로그램 전환/패스 분리)은 rare 아틀라스 폴백 경로(4417~)에만 해당** → 8방향인 실게임엔 무의미. 정정: 적 렌더는 이미 잘 배칭돼 있어 **드로우콜 배칭 최적화 대상이 아니다.**
- **dense 500의 D(draw)≈12.8ms 원인 = 미확정 (NOT concluded)**: 오버드로우(대형 스프라이트/그림자 겹침) 가설이 있으나, 이 비용이 GPU fill/overdraw인지 CPU 이웃질의/공간질의(spatial-query) 비용인지 아직 분리하지 못함. **확정하지 않는다** — 실기기 `?perf=1` 실측으로 귀속을 확정해야 함.
- **측정 편차**: 같은 N=500에서 런간 T가 2.5~18ms로 크게 흔들림 = 프레임 비용이 **적 군집/밀집도에 강하게 의존**(스웜이 플레이어에 몰릴 때 병목 실제화).

**최종 결론 (통일 표현 — 이 표현으로 고정):**

> Enemy render batching investigation: CLOSED / NO-GO.
> Remaining bottleneck attribution unresolved: GPU fill/overdraw vs CPU neighbor-density/spatial-query cost.

- **확정된 것 (CONFIRMED)**: (a) GPU draw-call batching = **CLOSED / NO-GO**. (b) 그림자 pass 분리 = 실게임 8dir 경로에는 **무의미**. (c) 이 조사 범위에서 **game.html 수정 불필요**.
- **아직 확정하지 않은 것 (NOT concluded — 추가 실측 전까지 단정 금지)**: dense 500이 fill-bound라는 것 / AI 밀도 문제가 design 문제라 코드 이득이 없다는 것 / 엔진 전체가 이미 충분히 최적화됐다는 것. 이 셋은 실기기 `?perf=1` 귀속 실측 전까지 **미확정**으로 둔다.

**주의/한계**: (a) 헤드리스 SW렌더(swiftshader)로는 이 측정 불가 — 수백 엔티티에서 렌더러 크래시 + `document.hidden`으로 sim 미실행(U=0). 반드시 headed 실 GPU. 이것이 6.2가 "실기기 로그"를 요구한 실제 이유다. (b) 링 밀집 스폰이라 실제(맵 전역 분산)보다 AI 이웃 밀도가 높을 수 있음 → 초선형 비용의 **상한** 관측치. 실제 분산 난전은 이보다 완만할 수 있으나, 스웜이 플레이어에 몰릴 때 이 밀집 조건이 실제로 발생한다.

**다음 후보:**
- (1) AI 이웃질의/공간질의(spatial-query) 비용: 밀집 셀 이웃 상한/샘플링, 분리력 계산 주기 분할(_gcT 스태거) 등 — **단, 위 귀속(fill/overdraw vs CPU) 미확정 상태이므로 실기기 실측으로 원인 확정 후에만 착수.** 핫패스 고위험, 충돌/밸런스 분리, TDD 우선.
- (2) ~~적/투사체 GPU 배칭~~ → **CLOSED / NO-GO**: 실게임 적은 전부 8방향 인스턴싱이라 이미 배칭됨. 드로우콜 배칭 최적화 대상 아님.

### 6.4 병목 귀속 실측 시도 — GPU-fill vs CPU-spatial-query (2026-08-11)

**측정 방법**: 게임 자체 `[PERF avg]`(크래시 전 안정 실행 구간) + shQuery 런타임 계측(page.evaluate 래핑, game.html 무수정).

**CONFIRMED**
- dense combat 안정 측정 구간에서:
  - coll ≈ 0.1ms
  - ai/update ≈ 5~8ms
  - render/draw() wall-time ≈ 12~14ms
  - shQuery ≈ 130~175 calls/frame (@ 약 300 active enemies)
- 현재 프로파일러가 측정한 CPU-side 구간 중 render/draw() wall-time이 가장 큰 성분이었다.
- AI/update 전체가 render/draw() wall-time보다 작았으므로, CPU spatial-query가 전체 프레임의 단독 최대 병목일 가능성은 낮아졌다.
- collision은 현재 조건에서 지배 병목이 아니다.

**NOT CONFIRMED**
- shQuery 자체가 ai 5~8ms 중 실제 몇 ms를 차지하는지는 미측정.
- render 12~14ms가 GPU fill/overdraw 비용이라는 결론은 **금지**.
- render 12~14ms는 draw() CPU wall-time 측정이므로 GPU execution과 CPU submission을 분리하지 못했다.
- 따라서 GPU fill/overdraw vs CPU render submission 귀속은 여전히 **unresolved**.

**최종 판정**

> evidence insufficient for GPU-fill vs CPU-submit attribution.
> CPU AI/spatial path is currently secondary at aggregate level; render/draw path is the leading measured component.

**Headless 실험 한계 (사실 기록)**
- timer query / resScale / seeded RNG / movement 등 원인 후보를 하나씩 제거하며 반복했으나 renderer crash가 재현되어 GPU-vs-submit 분리 실험을 완주하지 못했다.
- renderer crash인데 process exit code가 0으로 끝난 사례가 있어, **현재 attribution 실험 하니스는 신뢰 가능한 회귀 자산이 아니다.**
- Git 사실관계: Unstable attribution harness was accidentally committed by auto-sync in `9c88158f` and removed in `9ae5ef29`. It is not retained in the current tree as a regression/profiling asset. (history rewrite/force push 없이 전진 커밋으로 제거함.)
- 기존 안정 프로파일러(`tools/verify_entity_load_cpu_profile.mjs`)는 유지한다. 필요 시 향후 browser/page crash를 감지해 non-zero exit 하도록 별도 수정한다.

### 6.5 정상 교전 병목 재귀속 — headed 실GPU 실측 (2026-08-12)

6.4의 미해결 귀속을, **headed 실GPU Chrome(Playwright, `game.html?perf=1`) + frame-total 트리거 + U/D·섹션별 히스토그램 + update tick/frame 분해 + CDP V8 GC 트레이스**로 재실측했다. 계측은 전부 `?perf=1` 게이트 진단 전용(`_HITCH`/`_UPROF`/`shQuery` 카운터), 게임 동작 무변경.

**측정 조건 (정상 교전 레짐)**: stage0, 약 373 active enemies(정지 플레이어에 aggro/공격 활성, 투사체 ~600·입자 ~150), baseline ~66fps, teleport 미사용, summoner 과증식(600~700) 런은 제외. 별도로 stage2(오브젝트 185)·stage19/32(streamMap=true) 등 실 stage 전수(0~34) 진입 측정.

#### CLOSED / NO-GO
- enemy 8dir body batching (실게임 적 전부 8방향 인스턴싱, 이미 배칭)
- shadow pass separation
- frame-wide GL draw-call batching
- **map chunk streaming / eviction–rebuild churn** — stage32(290×290) serpentine 전체맵 스윕에서 실제 churn 확보: builds=393, evicts=420, rebuilds=293. chunk-work 프레임=490(2.39%), chunk-work 프레임 maxTot≈9.6ms, cache 섹션 p99≈0, 전 프레임 hitch와 상관 없음. → 스트리밍은 예산 내 완전 흡수, 병목 아님.
- **spatial query(shQuery)** — 정상 교전에서 calls≈46/frame, candidates≈4375/frame, **aggregate time≈0.05ms/frame**. 호출수가 아니라 시간으로 측정한 결과 무시 가능. CPU update 병목 아님.

#### STEADY-STATE (건강)
- 정상 교전은 전반적으로 건강. **단일 draw section이 반복적으로 16.7ms를 초과하지 않음**(ens/proj/para/mobj/cache 전부 section-self >16.7 = 0). draw 섹션 p99: ens 6.0 / proj 4.0 / para(=parallax, stage종속) ≤3.5.
- `ens`는 가장 큰 지속 draw contributor(draw-dominant hitch의 77%)지만 **standalone frame-budget breaker 아님**(max 13.6ms). ens를 최종 후보로 삼았던 이전 판정은 **철회**.
- parallax는 stage 종속 고정비(stage0 ≈2.7ms, stage19 ≈0.13ms) — 보편값 아님, hitch 원인 아님.
- 670-enemy 24fps 과부하 런은 catch-up 다중 tick로 U가 인위 증폭되므로 정상 플레이 귀속 자료에서 **제외**.

#### FIRST-USE / WARMUP CLASS (별도 축, 이번 작업과 분리)
관측된 first-use/warmup 계열 스파이크(각 별도 축으로 기록):
- mobj first-region build: max ≈ 29.2ms (미방문 밀집영역 첫 진입 시 static-object-canvas 1회 빌드; p99=0, steady 아님)
- worldItems first-use spike: ≈ 51.9ms (worldItems 20개 상한, `_worldItemSkinCache` 첫사용 Image + 첫 draw 텍스처 업로드/드랍빔 아틀라스 계열 추정)
- 과거 enemy/atlas 계열 ≈ 96.7ms sample (부팅 아틀라스 워밍으로 자동재현 억제되어 규모 미재현)

> Multiple first-use/warmup-class spikes have been observed, but their underlying mechanisms have not yet been proven identical.

warmup preload 최적화는 CPU update 귀속이 끝난 뒤 별도로 다룬다.

### 6.6 intermittent CPU update spike attribution — 완료 (2026-08-12)

6.5에서 설정한 NEXT TARGET(`intermittent CPU update spike attribution`)을 실측 완료.

**update 구조 (실측 기준 coarse 분해)**: `update()`는 프레임당 catch-up으로 0~3회 tick. 섹션 경계(재사용/신규 boundary) — pre(player+skill+cleanup+`_rest` 거리정렬), ai(enemy 루프: 뷰포트 컬링 + 4단계 티어링 T1~T4 → per-enemy `updateE()`; 기존 12ms 버짓 early-break 존재), proj(projs+pProjs), tail(소환굴+킬체인+상태/VFX). 분리력(separation)은 Web Worker(`_dispatchColWorker`) off-thread, 플로우필드(`_ffBuild`)도 Worker 오프로드.

**정상 교전 분포 (90s, 5950 frames, ~66fps, 373 enemies)**:
- ticks/frame: 0=904, 1=4628, 2=416, 3=2 (avg 0.92) — 정상 레짐은 대개 1 tick, 느린 프레임에서만 2 tick catch-up.
- U/frame: p50 5.5 / p95 14.5 / p99 21.0 / max 27.1 / >16.7 = 201(3.4%)
- U/tick: p50 6.0 / p95 10.5 / p99 12.5 / max 23.2 / single-tick>16.7 = 6
- section/frame mean(p99,max): **ai 3.28(11.0, 20.7)**, proj 1.85(7.0, 14.4), pre 0.90(4.0, 5.4), tail 0.09(0, 6.6)
- **U/frame>16.7 dominant: ai=195(97%)**, proj=6, pre/tail=0
- worst-U 프레임 전부 sum(pre+ai+proj+tail)≈U/frame, 스파이크 구성 = ai(8~12) + proj(5~9) 동반, 대부분 ticks=2.

**GC 트레이스 (CDP disabled-by-default-v8.gc, 교전 30s)**:
- MinorGC(V8.GCScavenger): n=177(≈6/sec), max 12.72ms, sum 144.6ms
- MajorGC(MarkCompactor): n=31, max 8.17ms
- GC 이벤트 >5ms = 102, >10ms = 4
- (CDP 트레이스 오버헤드로 해당 창의 hitch율 자체는 비대표적. GC 이벤트 duration/빈도는 실측 신호.)

**중간 표현(당시)**: "sum≈tick"은 GC 배제 근거가 아니며 GC 일시정지가 ai 섹션 시간창에 흡수될 수 있다 — 이는 **overlap 검증 전 추론**이었다. 아래 6.7에서 직접 검증하여 정정한다.

### 6.7 GC 인과 검증 → allocation/GC 가설 기각 (2026-08-12)

6.6의 MIXED 추론을 **직접 검증**했다. headed 실GPU, 정상~heavy 교전(적 450~532, 투사체 387~523, uf16 593~964), CDP `disabled-by-default-v8.gc` 트레이스 + HeapProfiler allocation sampling.

**A/B 트레이스 교란**: tracing OFF vs ON에서 fps·U/tick p50/p95/p99·section 거의 동일(OFF 88fps U/tick p99 11 / ON 97fps p99 10.5) → **GC trace는 무교란·신뢰 가능**.

**Allocation 실측 랭킹 (HeapProfiler self-size, heavy 25s)**: **총 0.60MB(≈24KB/s) — 극히 낮음.** 게임이 공격적으로 풀링(`_projFree`/`_pprojFree`/파티클/`_shBufs`/`_shCellPool`)한 결과. 상위: `shRebuild` 168KB(27.6%, 이미 셀풀 사용·잔여는 배열 grow), `update` 144KB, `loop` 56KB, `isW` 36KB, `updateE` 24KB, **`spawnProj` 5KB(0.8%, 풀링됨)**. `_rest=[]`는 `if(ens.length>800)` 게이트라 정상 레짐 미실행.

**GC magnitude (heavy 45s)**: Scavenger 300회(6.7/sec)이나 **max 7.7ms, >10ms = 0**(>5ms=101). 6.6의 12.7ms는 희소 이상치.

**직접 timestamp overlap (측정 완료)**: 마커를 `performance.mark`(cat `blink.user_timing`, 이벤트명=마크명)로 교체하니 캡처됨(이전 실패는 `performance.measure`가 `UserTiming::Measure`로 뜨고 `console.timeStamp`는 `devtools.timeline` 카테고리라 필터 불일치였음). **모든 tick을 preallocated Float64에 할당 없이 기록**(GC 교란 회피). **clock alignment 검증**: UCLOCK 45마크로 CDP trace µs ↔ page performance.now offset 산출, spread **0.16ms**(정렬 유효). overlap = interval intersection.

heavy 교전(적 537, 투사체 623, 2814 ticks) 실측:
- baseline **P(GC|all ticks) = 3.52%**
- U/tick>10ms: 2263개, GC-overlap 94 = **4.2%** → enrichment **1.18×(무의미)**
- U/tick>16.7ms: 196개, GC-overlap 19 = **9.7%** → enrichment **2.76×(극단 tail에서만 약함, 그마저 90%는 GC-free)**
- GC-overlap slow tick vs non-GC slow tick: ai **8.3 vs 7.2ms**, U p95 20.1 vs 18.1 — **거의 동일** (GC 유무가 tick 심각도를 좌우 안 함)
- MinorGC 272회(6/sec) dur p50/p95/p99/max = 0.52/1.54/8.69/**11.69ms** · MajorGC 32회 max 8.65ms

**최종 판정 (6.6 정정)**

> **AI/state work PRIMARY; GC causal contribution SECONDARY (하향 — CONFIRMED 아님).**
> - 지속·간헐 지배 = **enemy AI(`updateE`) 실작업**(+proj), catch-up 2-tick 증폭. draw-side/spatial(0.05ms)/collision(worker)/streaming 배제.
> - **GC는 최우선 lever 아님**: slow tick(>10ms)의 95.8%가 GC-free, enrichment 1.18×(무의미). GC-overlap tick과 non-GC tick의 ai·U 분포 거의 동일 → slow tick은 ai 자체 시간 증가로 설명됨.
> - GC는 극단 tail(>16.7ms)에서만 **2.76× 약한 enrichment**(19/196=9.7%만 overlap) → **secondary tail 기여**이나 "대부분 overlap" 기준 미충족 → CONFIRMED 아님.
> - steady allocation 18~24KB/s(고도 풀링), MinorGC max 11.69ms(희소). "max U tick = AI + Scavenger 합" 류 확정 문구는 **폐기**.

**Allocation 최소수정 미착수 (근거)**: (1) GC 인과 미확정(secondary/하향) → 유저 게이트("GC 확정 뒤에만 allocation 수정") 미충족. (2) 안전·고임팩트 후보 부재 — `shRebuild`(최상위)는 이미 셀풀·잔여는 배열 grow(제거=구조변경, 금지), `spawnProj` 무시(풀링), `_rest` 미실행. (3) allocation 18~24KB/s에서 제거 가능분의 U-tail 개선이 noise 이하로 예측. **"실측으로 효과가 입증되지 않으면 유지하지 마" 원칙에 따라 투기적 수정을 하지 않는다.** production 코드 무변경.

**실제 lever (다음 단계 후보, 이번 미착수)**: 병목이 AI 실작업이므로 — AI tiering/budget은 이미 존재(뷰포트 컬링 + T1~T4 + 12ms early-break). 추가 여지는 close-band(T1/T2) 스태거 정교화나 per-`updateE` 핫패스 산술 캐시 등이나, **AI 단순화·cadence 변경 금지 범위 내에서만** 별도 실패테스트로 검증 후 판단.

### 6.8 Enemy AI CPU hotspot 귀속 → isW MAP_OBJS 선형스캔 확정 (2026-08-12)

6.6/6.7에서 PRIMARY로 확정된 AI/state work의 **함수/분기 수준 hotspot**을 CDP CPU sampling profiler(120µs)로 귀속. 정상 교전(stage0, 380 enemies, 투사체~490, ~48–53fps). per-enemy timer 없이 CPU profile + 집계 카운터(isW 호출수/MAP_OBJS 스캔량/tier 분포, `?perf=1` 게이트).

**A/B 교란**: profiler OFF 48fps(U/tick p99 15) → ON 36fps(p99 16.5) → **profiler는 ~25% 부하**. 절대 self-time은 부풀려짐, **상대 랭킹은 유효**.

**CPU profile top self-time (41s)**: **`isW` 34.8%** (2위 draw 8.2% / drawImage 6.8% / update 6.6% / **updateE 4.5%** / _ffBuild 3.1% / canMv 1.8%). `isW`가 압도적 1위(4배).

**updateE 서브트리(29.7% of CPU) 내부 self-time**: **`isW` 73.8%**, updateE self 15.2%, `canMv` 6.1%(내부가 isW 4회), `_ffMoveE` 2.8%, `shQuery` 1.1%, `spawnProj` 0.2%. → **updateE 비용의 대부분이 isW**.

**정량화 (집계 카운터, 380 enemies)**:
- `MAP_OBJS`=125, 그중 **collision meta 보유 = 22개**.
- **isW 호출 ≈ 2421/frame**, 각 호출이 전 MAP_OBJS 선형스캔 → **≈302,649 MAP_OBJS iteration/frame** (= calls×125). 22개만 실제 충돌체 → **103개 비충돌 오브젝트를 매 호출 `_OBJ_META` 조회+분기로 무의미 스캔**.
- tier exec/frame: T1 130 · T2 135 · T3 19 · T4 14 · updateE-exec 204. → 근접(T1/T2) 다수가 updateE→(knockback/이동)→canMv(isW×4)→isW 다발.
- **slow frame(U/frame>16.7) isW 호출 = 4353/frame vs 전체 2421 → enrichment 1.80×** (slow tick = isW 호출 급증).

**60fps+ 정상 레짐 재검증 (268 enemies, profiler OFF 89fps — 유저 60fps+ 요건 충족)**:
- U/tick p50/p95/p99/max = 5/9/11/19.1, ai mean 2.19, catch-up 최소.
- isW **997 calls/frame** × 125 = 124,666 iter/frame, collision 22/125.
- **slow frame enrichment: isW 2.81× / T1 2.76× / T2 2.70× / updateE-exec 2.74×** — isW·tier·updateE-exec가 **함께** 급증(일관) → slow tick의 원인 = 근접(T1/T2) enemy 클러스터링 → updateE-exec 급증 → 각 updateE의 isW×MAP_OBJS 스캔이 곱해져 AI section spike.
- CPU profile(268, profiler ON 64fps): **isW 25.1% self(#1, 2위 drawImage 11.3%의 2배+)**, updateE 서브트리 isW 73.8% — **60fps+에서도 isW 지배 유지 확정**.
- A/B: profiler OFF 89fps(U/tick p99 11) → ON 64fps(p99 11.5) — ~28% 부하이나 U/tick·랭킹 불변.
- **isW는 main-thread scan** — off-thread collision worker(`_dispatchColWorker`, update 서브트리 0.2%)·spatial shQuery(0.05ms, CLOSED)와 **별개 병목**(혼동 금지).

**근본 원인**: `isW(px,py)`(벽/충돌 판정)가 tile 검사(O(1)) 후 **전 MAP_OBJS를 매번 선형 순회**. 이미 `_bgInit`에 MAP_OBJS 충돌용 공간그리드 `_moGrid`(200px 셀)가 존재하나 **isW는 이를 사용하지 않는다**.

**AI hotspot 최종 판정**

> **AI CPU hotspot = `isW()`의 MAP_OBJS 선형스캔** (self-time 34.8%, updateE의 73.8%). 근접 enemy 밀도 × canMv/isW 호출수 × 전 MAP_OBJS(125) 스캔이 곱해져 302K iter/frame. 유저 5요건(정상레짐 반복 / 큰 self-time / slow-tick 1.80× enrichment / behavior-preserving 수정 가능 / 실패테스트 가능) 모두 충족.

**선정 후보 (단 하나): `isW`의 MAP_OBJS 선형스캔 제거.**

**최소수정 형태 (behavior-preserving, 이번 미구현)**:
- (1순위, 최안전) **collision-only prefilter**: MAP_OBJS 변경 시 `_colObjs`=충돌체(22개)만 미리 필터, isW가 이를 순회 → 125→22(5.7× 감소), 순회 대상·판정 로직 **완전 동일**(비충돌체는 어차피 skip되던 것). MAP_OBJS 변경(init/파괴)시 `_colObjs` 재빌드.
- (2순위, 더 큰 win) **`_moGrid` 공간질의**: isW가 (px,py) 셀+이웃만 조회. 단 `_moGrid`가 colR 단일반경만 저장 → colW/colH 타원판정 fidelity 위해 셀에 **오브젝트 인덱스 저장 후 동일 상세판정** 필요.
- 금지 준수: AI tier/cadence·적 수·공격빈도·투사체·행동·시각 무변경. 위는 "필요없는 branch skip / 공간 lookup hoist"에 해당.

**실패테스트 설계 (구현 전)**: 고정(stage0, enemy band 350–400, 정지 교전, 투사체 활성, 60s). before 측정: `_iswReport`의 **isW iter/frame(≈302K)**, U/tick p95/p99(11.5/14.5), AI section p95/p99(10.5/13.5), CPU profile isW self%(≈35%). behavior invariant: enemy 수/공격 cadence/투사체/damage/kill/이동/충돌결과 동일(충돌 판정 로직 불변이므로 자명). after: isW iter/frame 및 AI section·U/tick p99 하락, isW self% 하락 확인. RNG 비결정 → 고정 duration 통계 threshold + 3회 variance.

### 6.9 isW collision-only prefilter — 최소수정 완료 (2026-08-13)

6.8 후보(isW의 MAP_OBJS 선형스캔)를 TDD(실측→differential→최소수정→before/after)로 적용.

**ROOT CAUSE**: `isW(px,py)`가 collision object 판정 시 **전 MAP_OBJS(125)를 매 호출 선형순회**. collision meta(`_OBJ_META[type].collision||col`) 보유는 stage0 기준 **22개뿐** — 103개 비충돌체를 매 호출 무의미 스캔. isW predicate는 순전히 `type` 기반(정적), 동적 상태(alive/destroyed) 미참조.

**CHANGE (production diff = +6 / −1 줄)**:
- `_colObjs`(collision object 배열) + `_rebuildColObjs()` + `_ensureColObjs()` 추가.
- isW: MAP_OBJS 루프 → `_colObjs` 루프. **collision 판정 수식 한 글자도 안 바꿈**. `_ensureColObjs()`가 MAP_OBJS **identity 또는 length 변경 시에만** rebuild(O(1) 체크). `_moGrid` 미사용(이번 스코프 제외).
- MAP_OBJS lifecycle: stage/보스 셋업에서 `=[]` 재할당(identity 변경 감지) + `boss_gate_col` 런타임 push(length 변경 감지) + 에디터 splice — 전부 rebuild 트리거로 커버. combat 중 collision object 불변.

**CORRECTNESS (differential, legacy full-scan = oracle)**:
- object-only diff: stage 0/3/8/14/19/26/34 + lifecycle(push/splice/재할당) **233,721 query mismatch=0**.
- full-isW(tile+bone+object) live vs legacy: 5 stage + 298마리 실교전 좌표 **130,162 query mismatch=0**.
- object 중심/경계(colR·colW/colH ellipse)/그리드/랜덤/skipBone 양쪽 커버. → **100% 동일**.

**AFTER (동일 harness, stage0 ~250–290 enemies, 60fps+, 3회)**:
| metric | BEFORE | AFTER |
|---|---|---|
| isW scan iter/frame | 124,666 (=997×125) | 13,427~21,353 (=calls×22) — **약 82.9% 감소(결정적)** |
| isW CPU self% | 25.1% (#1) | **5.4%** (draw가 #1로 밀림) |
| AI section mean | 2.19ms | **0.47~0.91ms** |
| U/tick p99 | 11ms | **4~6ms** |
| U/tick max | 19.1ms | 11~16.3ms |
| fps(OFF) | 89 | **101~140** |
- isW **calls/frame은 불변**(호출수 아닌 per-call scan만 감소 = 설계대로). CPU profiler A/B 교란: 최적화 후 OFF/ON 거의 동일(isW가 더 이상 병목 아님).

**VERDICT: PASS.** differential mismatch=0 · scan −82.9% · isW CPU −4.6× · AI/U-tail 대폭 하락 · gameplay invariant(충돌 판정 불변으로 자명, differential로 실증). `_moGrid`(2순위)는 **불필요** — collision object가 stage당 1~28개로 적어 prefilter만으로 충분.

**diagnostic 처리**: 조사용 계측(`_HITCH`/`_UPROF`/tick recorder/`_ISW`/HTICK/shQuery·chunk·tier 카운터, `?perf=1` 게이트)은 **일회성 실험 코드로 분류 → production commit에서 제거**. game.html 최종 diff는 isW 최적화(+6/−1)만. (계측 스크립트는 scratchpad 보존: `hitch_stream.js`/`cpu_profile.js`/`gc_enrich.js`/`isw_diff.js`/`isw_regress.js`.)

### 6.10 Fresh post-isW baseline — passive vs skill-use (2026-08-13)

isW 최적화(d074f3a9) 후 CPU 구조가 바뀌어 hotspot 순위를 재측정. **측정만**(production 무변경). 진단(`_HITCH`/`_UPROF`)은 임시 진단본으로 측정 후 game.html은 `d074f3a9`와 byte-equivalent 복원(hash MATCH).

**Passive 정상 교전 (플레이어 공격/스킬 미사용, 적 250~350, 3회)**:
- fps 111~127, frame p50/p95/p99/max ≈ 7/12/**16**/23~45, **U p99 3.5~4.5**(isW 제거로 미미), **D p99 12~13**, hitch>16.7 0.34~1.30%.
- Clean production CPU profile(303적, profiler A/B OFF86/ON69fps): **drawImage 14.3%(#1)** · draw 13.6% · loop 7.9% · **isW 5.4%(25.1%→5.4% sanity 확인)** · update 4.7% · bufferSubData 4.4% · updateE 3.4%. **subtree total: update 18% vs draw 63%.**
- → **passive steady-state = draw-bound**(drawImage/ens/GL submission). 전부 이미 GPU 8dir 인스턴싱 배칭(CLOSED), 비휴리스틱 intrinsic 렌더. **behavior-preserving 큰 이득 없음 → passive는 NO-GO(headroom 충분).**

**Skill-use 교전 (Lv100 전스킬 43개, heavy 슬롯 maliceStorm/maliceMortar/ghostXbowTurret/plagueBurst/giantSlam2/holyDome + ULT blackStar, 스킬 연속 발동)** — 유저 지적("스킬 쓸 때 끊긴다") 반영:
- fps 106, frame p99 **17.0**, **max 57.0ms**, hitch>16.7 1.35%(>33=2, >50=1). U **max 44.8ms**.
- **worst-U 프레임 6/6 전부 `proj` dominant**: #최악 U/frame=44.8 → **proj=41.9ms**(shq=586, 그 프레임 586 투사체 homing), 이하 proj 12~19.5ms. → **간헐 stutter의 CPU-update 원인 = 대량 스킬 투사체의 homing/neighbor query(O(투사체×적))**.
- draw-side: **ens-dominant hitch 51%**(11~14.6ms, 스킬 화면효과로 악화) + parallax(9.6ms)·post(9.2ms)·part(VFX) 간헐 spike + kill 드랍 items(22ms).
- Skill-use CPU 평균 profile: 여전히 drawImage 14.9%/draw 13.1% 상위(대부분 프레임은 draw-bound)이나 **간헐 44ms proj spike는 평균에 안 잡힘** — 평균이 아니라 worst-frame 분석으로 stutter 원인 특정.

**판정**:
> isW = CLOSED/PASS. **Passive steady-state = draw-bound intrinsic → NO-GO.** 실제 유저 체감 "스킬 끊김" = **간헐 `proj` 업데이트 스파이크(대량 스킬 투사체 homing, ~44ms/최악프레임)** + ens/VFX 렌더 hitch. → **다음 후보 = 대량 스킬 투사체 homing/투사체 업데이트 비용**(behavior risk: homing 정확도·투사체 수 불변 필수 — 별도 실패테스트로 신중히). 이번 단계 **미착수**(측정만).

**caveat**: 측정 harness는 스킬을 140ms마다 연속 발동(인간보다 공격적) → hitch **빈도는 과장**, 단 spike **magnitude(proj 44ms)는 실재**. game.html 계측은 미커밋·측정 후 제거, `d074f3a9` 복원 확인.

### 6.11 skill-use proj 스파이크 = per-hit SFX 오분류 확정 + 최소수정 완료 (2026-08-13)

6.10의 "proj 스파이크"를 함수/분기 수준까지 귀속. pProjs 루프에 branch counter + 함수별 프레임 타이머 진단 삽입 → spike enrichment 분석(측정 후 byte-복원 MATCH).

**귀속 경로 (가설 순차 기각)**:
- shQuery(spatial query) = **0.10ms** 기각(6.x 기확정) · hurtE aggregate <0.8% 기각 · candidate dst 루프 = **고hitCand·저hits(hitCand 3517, hits 30) → 2.15ms** 기각 · trail allocation = **A/B(재할당 68→48 감소해도 스파이크 불변)** 기각 · homing = iceBlade 제외 homCand=0 · GC aggregate 1.3%.
- 스파이크 프레임(ms 22.83) **함수별 분해**: `playSampleAt` **16.87ms(74%)** · `hurtE` 3.90ms(17%) · `playVFXAng` 0.30ms → **합 92% 설명**. hits enrichment 155.78x(hits 2→374/frame), **per-hit ≈60µs**(hurtE 7.2µs의 8배).

**ROOT CAUSE**: iceBlade(및 venomBlade/bladeShard/maliceHunt) 히트마다 `playSampleAt('chain_fly')`. `chain_fly`는 `chain_` prefix라 `_isSkillSfx`→SKILL(10)로 분류돼 **PROJ(5)·HIT(3) 동시재생 하드캡 + 30ms dedup을 전부 우회** → 대량 명중 시 한 프레임에 수백 회, `_MAX_ACTIVE_NODES=48` 포화까지 WebAudio 노드 생성.

**최소수정(behavior-preserving, 사용자 승인)**: `playSampleAt`/`_playSampleNow`에 옵셔널 `priOverride` 추가(미전달=기존 동작, 하위호환). 두 히트음 호출부에 `_SFX_PRI.PROJ` 전달 → 탄막 히트음답게 동시 5개 캡. `playSampleAt` 반환값 미사용이라 **게임플레이 상태 완전 불변**(투사체 수/궤적/데미지/hit timing/충돌). 상세: `docs/6사운드디자인/6사운드디자인.md` "우선순위 오버라이드(2026-08-13)".

**BEFORE→AFTER (mass iceBlade 히트 재현, rAF+playSampleAt 래퍼 계측)**:
| 지표 | BEFORE | AFTER |
|---|---|---|
| playSampleAt 총시간/60s | 637ms | **45ms** (−93%) |
| 최악 프레임 playSampleAt | 158.8ms | **9.2ms** (−94%) |
| per-call | ~45µs | **~1.7µs** |
| sfx 스파이크 프레임(>5ms) | 17 | **1** |
| 대형 스터터(dt>33ms) | 69 | **30** (−57%) |
| 실측 FPS | 73 | **90** |
| 투사체 mean/max·적 수(sanity) | 39/95·301 | 40/96·301 (동일) |

**판정**: proj 스파이크의 **PRIMARY(74%)=per-hit SFX 오분류 → CLOSED/PASS**. 잔여(dt>16.7 스파이크 588회)는 draw/ens/기타(6.10의 draw-bound 축) — SFX와 무관, 별도 축. hurtE(17%)는 부차로 잔존하나 단독 스파이크 유발 안 함.

### 6.12 pProjs homing `_anyAlive` memoize — candidate-loop 잔여 O(k²) 제거 (2026-08-13)

§6.10이 지목한 미착수 후보 "대량 스킬 투사체 homing/proj 업데이트 비용"의 candidate-loop(§6.11 실측 2.15ms, hitCand 3517)에서 **provably behavior-preserving(byte-identical)한 잔여 낭비만** 제거. 나머지 proj 경로는 §6.11에서 measured-minor 또는 draw-bound NO-GO로 종결됐으므로 **hot combat loop의 거동 위험 수정은 배제**.

**대상 코드**: `game.html` pProjs per-frame 업데이트 루프(≈L27837), homing 타겟 재획득 내부.
- **문제**: `plagueHoming`/`mhBlade`(역병·악의사냥, 관통 800+) 투사체가 타겟 재획득 시, 이미-때린 생존적 후보를 만날 때마다 `_anyAlive`(안 때린 생존적 존재?) 를 `_neH` 전체 재스캔 → **이미-때린 생존적이 N개면 O(N²)**. maliceHunt(=mhBlade)는 §6.11 heavy 시나리오에 포함.
- **불변식**: `_anyAlive`는 `(_neH, _hitSet)`만의 함수. **TRUE면 루프 중 값 불변**(clear 미발생), **FALSE면 `_hitSet.clear()` 후 해당 분기 재진입 불가**(빈 set). → 프레임당 1회만 계산해도 `bestE` 선택·`clear` 타이밍이 **원본과 완전 동일**.
- **수정**: `_aaChk` 플래그로 memoize — `if((p.plagueHoming||p.mhBlade)&&!_aaChk){_aaChk=true; …기존 스캔…}`. 2줄(선언 1 + 조건 1). 투사체 수/궤적/데미지/hit timing/충돌 **전부 불변**.

**검증**:
- **동등성 fuzz**: `test/homingAnyAliveMemo.test.js` — OLD/NEW 내부 타겟팅 로직 재현, seed-42 LCG로 20,000 시나리오(plague/mh/venom/일반 × 생존·피격 랜덤) → `bestE`·`clear`·`bestD` **전부 일치(0 mismatch)**. 스캔 카운트: anyAlive=TRUE+이미-때린 다수 시 OLD 4회→NEW 1회.
- **전체 스위트 회귀**: game.html 변경 순수 영향 대조(내 테스트 격리) → 실패셋 **A(변경본)=33 vs B(pristine)=33, NEW_ONLY=0·FIXED_ONLY=0**(byte-identical 실패셋). 33건은 전부 기존 HEAD-서술 baseline(parry malice·grit·earthBreaker·map cache 등, homing 무관).

**판정**: candidate-loop pierce-heavy 성분의 잔여 O(k²) → O(k) 축약, **byte-identical 확정 → CLOSED/PASS**. live 프로파일 없이도 안전 정당화 가능한 유일한 잔여 최적화였음(제거 후 proj 경로는 measured-minor/draw-bound NO-GO만 남음 = perf 트랙 최종 종점).

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
