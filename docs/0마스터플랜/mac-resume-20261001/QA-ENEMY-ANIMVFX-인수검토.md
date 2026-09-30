# QA·ENEMY·ANIMVFX Mac 인수 검토

2026-10-01 KST. 담당 `/root/qa_review`. 총괄의 재개 지시 수신 후 파일·JSON 원본을 읽었고, 추가 소유 허용을 받아 계측 도구와 단위 검증을 보강했다. 게임·브라우저 실행, 생산 코드·Git index/commit·설정 변경은 하지 않았다. 실제 Mac 측정은 총괄이 단독 수행한다. 이 보고서는 3개 팀을 담당한 하위 에이전트 1개의 산출물이며, 3개 독립 팀 세션 개설을 뜻하지 않는다.

## 도구 보강 완료

아래 인수 검토에서 발견한 기록 포화·미회수는 총괄이 허용한 4개 파일에서 수정했다.

| 파일 | 완료한 변경 |
|---|---|
| tools/qa_first_kill_cpu_probe.js | 빠른 일반 2D는 집계, 대상 함수 자식/느린 2D/GL은 상세 기록. 최근 20,000개 순환 보관과 droppedCount/truncated. 이미지 src 수정. stop 멱등·재주입 복구·생성자 부재 처리. |
| tools/qa_frame_probe.mjs | 구간 측정 종료 후 stop·records/메타데이터를 회수해 기존 env/results와 함께 firstKill 필드로 저장. 회수 오류 표기. |
| test/qaFirstKillProbe.test.js | 실제 프로브 VM 실행 및 실제 하니스 최종 저장 블록 검증 5건. |
| docs/12퍼포먼스·최적화/FIRST_KILL_CPU_INVESTIGATION_20261001.md | 최신 Mac 보강 계약·원본 329.4ms 재대조·한계·다음 측정 기록. 이전 정지 이력 분리. |

Node 24.15.0 `--test test/qaFirstKillProbe.test.js` **5/5 PASS**, 두 도구 `--check` 및 범위 내 `git diff --check` 통과. 20,001개 일반 draw 뒤 첫 사망 기록 보존, 중첩 비용과 이미지 식별, 20,005개 업로드 포화 명시, 예외 전파·복구·재주입, 생성자 부재, stop 결과 저장·회수 실패 표기를 검증했다. 조기 하니스 실패로 최종 블록까지 도달하지 못한 경우 자동 회수 보장은 없으며, 브라우저 실측 설치·복구는 총괄 검수 대상이다.

## 인수 결론

- **329.4ms와 이어지는 100.1ms 간격의 PC 원본 표본은 존재한다. 원인은 여전히 미확정이다.** 원본 VFX 캡처는 호출별 CPU·GPU 귀속을 담고 있지 않다.
- 첫 처치 프로브에서 **2만 개 선착순 기록 포화와 종료 시 기록 미회수**를 확인해 위와 같이 보강했다. 생산 코드 수정 여부는 실제 귀속 뒤 판단한다.
- M2 원본은 전후 측정치가 맞지만 교전 부하가 달라 프레임 개선율의 근거로 삼을 수 없다. Windows 결과를 Mac 속도 기준으로 직접 비교하지 않는다.
- 현재 Mac `game.html` SHA-256은 `775237034c6fec4c9de26b56c771b5ed03bc1037353cc292c4bec187d0f53967`이다. ANIMVFX §11 수정본 해시와 일치하므로 **수명 수정은 포함됐고, 그 수정본의 정규 GL 재검수는 남았다.**

## 확인한 원본과 범위

저장소 기준: `/Users/fordeargamers/Projects/exoduser-migration-20261001`.

공통 규칙은 `AGENTS.md`, `docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md` §17·17.1, `TEAM_CONTINUATION_POLICY_20261001.md`, `docs/13출시·마케팅/BUILD_BACKUP_POLICY_20261001.md`를 읽었다. 파일의 Mac 이전 대기 문구는 역사적 상태이고 이번 총괄의 사용자 재개 인수 지시를 적용한다. 다른 팀 변경·세이브·PC 운영 상태는 보존한다.

수신 원본 기준 경로는 `tmp/mac-migration-20261001/verified-evidence/tmp/qa-perf-20261001/`이다. 이 아래 M2 JSON 5개와 VFX JSON 2개, 비교 소스 3개의 해시를 읽었다. 이번 검토는 이미지 육안 PASS를 새로 내리지 않는다.

### 329ms의 정확한 원본 위치

`vfx/vfx-cap0.json`:

| 항목 | 원본 값 / 위치 |
|---|---|
| 소스 SHA | `392fd13cf510290c2f4f5c0a3d380e76b1c2da5ad9258fb557edcdca4a159475` |
| 시각 | `2026-09-30T16:47:52.301Z` = 2026-10-01 01:47:52 KST |
| 부팅 | hidden=false, visible, focus=true, ensWarmDone=true, bootLoadActive=false |
| 화면 | inner 1920×1069, canvas 1920×1068, high, fpsCap=0 |
| 표본 | `seqs[0]`, file=`vfx-cap0-death-0.png`, deathAt=3 (원본 42·46행) |
| 사망 전환 | rows[3]: alive=false, hf=6, post=6, gl=0, dt=8.4 |
| 긴 간격 | rows[4].dt=329.4 (111행), rows[5].dt=100.1 (124행) |
| 중복 해석 주의 | death-1·death-2에도 동일 시간 간격이 실려 있다(510·523·909·922행). 같은 전투 프레임에서 복수 몹을 캡처한 것으로 보이며, 독립 329ms 사건 3회로 세면 안 된다. |

전체 GL 샘플 22,877·2D 162, pageerrors=[]는 JSON으로 재확인했다. CPU 스택·GL 타이머·동시 작업 귀속이 없어 `_addCorpse`나 픽셀 읽기를 직접 원인으로 확정할 수 없다. `ANIMATION_VFX_TEAM_MASTER.md:176`의 “플래시 코드와 무관”도 이번 원본 분석만으로 인과적으로 증명한 결론은 아니다. 정확한 표현은 “첫 처치 직후 긴 프레임, 호출 귀속 미확정”이다.

### M2 원본 재대조

비교 소스 해시:

| 파일 | SHA-256 |
|---|---|
| game-before.html | `b82e6824baf4f194542de208427d733722f6a89a553da6153e99ea9a45cd9fa5` |
| game-after2.html | `fba94723860db3db07b8e07dad5a06d3903143757f6f6ec2ff218dab9d0cd4b5` |
| game-after.html (M2 본표 아님) | `9a8258e5bdadcc485eeb57e31f3b210e12f0c64e166f6953f756f18ccaf9a127` |

M2-A1/A2의 `env.gameHtmlSha256.measured`는 before, M2-B1/B2와 L0는 after2 해시와 일치한다. 디스크/served SHA와 실제 variant의 measured SHA를 혼동하면 안 된다. 모든 JSON은 hidden=false, high/resScale=100/fpsCap=0, 1920×1080 조건이며 errors=[]다.

아래 값은 각 JSON `results`의 COMBAT 구간을 읽은 값이다(단위 ms).

| 실행 | p95 | p99 | max | >50ms | >100ms | 적 수 | 시스템 CPU |
|---|---:|---:|---:|---:|---:|---|---:|
| A1 before | 4.4 | 8.5 | 58.6 | 1 | 0 | 154–160 | 26.0% |
| B1 after | 4.4 | 8.5 | 41.6 | 0 | 0 | 119–134 | 21.8% |
| A2 before | 4.4 | 8.4 | 49.7 | 0 | 0 | 159–167 | 19.1% |
| B2 after | 8.3 | 12.4 | 62.7 | 1 | 0 | 113–139 | 24.2% |

각 파일에서 valid=true는 기록 수집의 유효 판정이지 동등한 교전 부하를 보장하지 않는다. 이 수치는 QA 마스터 175–204행 표·판정과 일치한다. 전후 처치 수·적 수가 다르며 before 신규 프로필/after 학습 프로필 조건이다. COMBAT2의 >50ms는 4회 모두 0이지만 PANELS에는 >100ms가 각각 4/1/3/3회 남는다. L0는 학습 실행으로 비교에서 제외한다. 전체 게임 프레임 개선·329ms 해결·Mac 패키지 완료를 선언할 근거가 아니다.

## 첫 처치 프로브 최초 검토와 보강 근거

다음 줄번호와 문제 설명은 보강 전 소스를 읽은 당시 기준이다. 실제 채택·검증 결과는 문서 첫 절과 저장소 조사 문서 최신 절을 따른다.

| 확인점 | 소스 근거 | 최소 제안 |
|---|---|---|
| 기록 포화 | `tools/qa_first_kill_cpu_probe.js:19`: 20,000개 후 버림. :31에서 모든 2D drawImage·clearRect 등을 감싼다. | `startedAt/endedAt/totalCalls/droppedCount/truncated`를 저장하고, 포화된 첫 처치 표본은 원인 귀속 무효로 표시한다. 첫 처치 직전에 설치하거나 기록 시작점을 따로 둔다. |
| 진단 후 기록 미회수 | `tools/qa_frame_probe.mjs:258`은 설치 순간 반환값만 env.injectResult에 보관. :426–432는 종료·JSON 저장·ctx.close만 하며 stop 회수 없음. | 프레임 측정을 먼저 종료하고 ctx.close 이전에 `__qaFirstKill.stop()`과 missing/메타데이터를 JSON에 저장한다. 실패도 captureError로 남긴다. 오류 종료에서도 wrapper 복구를 보장한다. |
| 소스 이미지 식별 누락 | 프로브 :22 `args.at(-1)?.src`는 Canvas drawImage에서 마지막 숫자(좌표/크기)를 보므로 대개 null이다. | `2d.drawImage`는 `args[0]`의 currentSrc/src·크기, GL은 overload별 source 위치를 구분해 보관한다. 픽셀 배열 원문은 저장하지 않는다. |
| 계측 오버헤드 | :13 매 호출 객체·performance.now 두 번, :19 기록 객체 생성. 포화돼도 래퍼 비용은 지속된다. | 본표는 래퍼 없는 짧은 기본 측정, 귀속은 별도 진단 실행으로 분리한다. 필요 시 2D 상세 기록은 대상 사망/드롭 함수 안쪽과 느린 호출만 남기고 전체 호출은 집계한다. 다음 draw의 GL 업로드도 관찰해야 하므로 사망 함수 밖 기록을 전부 제거하지 않는다. |
| GPU 시간 혼동 | :33–34 texImage2D/texSubImage2D의 동기 반환 시간 | 이름을 API CPU 경과 시간으로 기록. GPU 실행·큐 대기 분리는 지원되는 GPU 타이머 또는 trace 근거가 있을 때만 확정한다. |
| 설치 신뢰성 | :10 owner[key], :34 WebGL2RenderingContext 직접 참조 | 정상 WebGL2 부팅과 설치 missing 목록을 확인한다. 재설치가 필요하면 기존 래퍼 stop 후 한 번만 설치한다. absent constructor는 명시적 미설치 처리한다. |

권장 종료 산출물은 `{sourceSha, environment, firstKillAt, frameIntervals, profiler, firstKill:{records, missing, droppedCount, truncated, startedAt, endedAt}, restoreStatus}`다. 첫 처치의 사망 종류·etype·보상 호출 시각을 같이 기록한다. wrapper selfMs는 감싼 자식 호출만 제외한 값이며 순수 JS CPU 시간으로 부르지 않는다.

생산 코드 후보의 조사 위치는 `_fmDeathFx` 17716행, `_addCorpse` 23518행(128² 캡처), 실제 마지막 `_addHeadGib` 선언 23892행(48² 캡처), `_maskWorldDropBlack` 26359행, `_worldDropFxTile` 26372행이다. `_addHeadGib`의 앞 선언은 23687행으로 실제 활성 정의를 잘못 고치지 않아야 한다. `_worldDropFxTile`은 먼저 일반 2D context를 만든 후 `_maskWorldDropBlack`에서 willReadFrequently를 요청하므로 두 번째 getContext 호출만으로 CPU 캔버스 전환을 증명할 수 없다. CPU 캔버스 전환보다 기존 픽셀 경로의 부트 시 사전 생성은 기존 QA 후보이나, 현재 귀속 확인 전 채택하지 않는다.

## 팀별 다음 한 건과 소유 경계

| 팀 | 다음 한 건 | 소유·인수 기준 | 이번 상태 |
|---|---|---|---|
| QA | 위 최소 도구 보강 후 port 3340의 고정 SHA·해상도·옵션·FPS캡·프로필에서 첫 처치 CPU 귀속 + 짧은 밀집 전투 baseline | 총괄의 실제 측정 독점. 생산 update/loop 변경은 귀속 결과와 범위 검토 후. p95/p99/>50/>100, 저장 격리, visible 정상 부팅, CPU/GPU 구분 필수 | 원본 검토 완료, Mac 실측 미수행 |
| ENEMY | QA 첫 처치 표본의 사망 경로·첫 kill·보상 단일 실행을 분류하고 밀집 구간 F06 break 여부 인수 | ENEMY master:154·184: 재현·하니스는 ENEMY, 공용 update/loop는 QA. 과거 실측 대역은 break=0(162–170행), 합성 고부하만 기아 재현(172–182행). 측정 없이 soft-cap 또는 수치 변경하지 않음 | 계약·잠재 결함 검토 완료, 새 전투 재현 미수행 |
| ANIMVFX | 포함된 수정본의 cap60/가능한 고주사율 정규 GL 플래시 수명 및 사망→부활 첫 프레임 재캡처 | 현재 game:32888 고정 update 감쇠, :50624 사망 소거. 팀 MD:193–213. 시각 필드만 소유, hurtE·판정·보상·시체 수 불변. 기존 §3의 render 감소 설명은 §11과 상충하므로 최신 §11 기준으로 정리 필요 | 수정본 해시·위치 확인, 실제 수정 후 GL/부활 화면 미검수 |

ENEMY-F01 전 탄종 수명 및 F03 CH1 얼음몹 구성은 밸런스·맵 계약과 연결되므로 이 첫 처치 진단에 섞어 변경하지 않는다. ANIMVFX 신규 사망 디졸브는 첫 처치 비용을 추가할 수 있고 §6a의 `_addCorpse` 단일 관문 가정도 예외 경로 대조가 필요해 현재 우선 작업으로 선택하지 않는다.

## 검수 한계와 완료 증거

이번 산출물은 수신 JSON 재대조·소스 정적 검토·계측 도구와 5건 단위 검증이다. Mac 플레이, 새 profiler, 캡처, 커밋·push는 수행하지 않았다. 원본 329ms 확인을 “원인 해결”로 보고하지 않는다. 지정 보고서와 추가 소유된 4개 파일만 수정했다. 실제 브라우저 검수·총괄 CHANGELOG_SYNC 동기화·원격 SHA 확인은 총괄의 작업 단위로 남긴다.
