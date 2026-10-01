# ART-OWNER-NEXT-20261002 결과 — 지원 finalcrop 을 원담당 호출부에 인수 연결

- 담당: ART / 터미널 2 (세션 `a489cbeb…` 연속). 기준 HEAD `30a204a7` 유지, Git 변경·커밋 없음.
- **경로 정정(사용자 턴중 지시)**: receipt/result 는 `tools/team-followup-20261001/ART/` 아래(`OWNER_NEXT_20261002-receipt.json`/`-result.md`). `docs/…/vscode-dispatch/` 에 만든 사본은 제거함.
- 중복 점검: `owner-integration-*`·`OWNER_NEXT_20261002-*` 산출 없음 → 신규 착수.
- **지원 finalcrop 재작성 안 함.** 이미 root 검수 완료된 `UIUX/art-support-finalcrop.mjs`(clip→zoom→shake→cover, 실 draw 원문과 4화면비×3시점 대조, 눈·발·자막 UNKNOWN; 근거 `SUPPORT-root-review.md` UIUX→ART 행 원4PASS12FAIL→후보16PASS)를 **원담당 내보내기 표면/호출부에 인수 연결**만 했다.

## 1. 고친 누락 연결

원담당 `wa24-delta-probe.cjs`(SHA256 `79193e10…`, **미변경**)는 **cover-only `predictWa24Crop`** 만 내보냈다. 이는 레터박스+cover 만 계산하고 **Ken Burns 줌(1.08→1.04)·shake·clip 을 무시**한다. 따라서 16:9 뷰포트에서 `OK_FULLFRAME` 으로 판정하지만, 실제 최종 렌더는 줌 때문에 상하가 잘린다(검수 증거 6.35%/4.76%/3.85% @400/1200/2399ms).

지원팀이 구현·검수한 최종 변환 `predictFinalCrop`(원담당 `EASE`·`cutShake`·`fadeAlpha`·`predictLetterbox`·`correctedSampler` 를 그대로 사용)을 **원담당 표면에 합성**해 호출부가 실제 크롭을 얻도록 연결했다.

## 2. 산출물 (소유 `tools/team-followup-20261001/ART/`, 이번 접두사)

| 파일 | SHA256 | 내용 |
|---|---|---|
| `owner-integration-finalcrop.mjs` | `7854d66985beb60a7d561ed82125324519fc60a3bdd305257b35abb04d77eb02` | 원담당 API 전체 + 인수한 `predictFinalCrop`/`predictWa24FinalCrop`/`compareOwnerBaseVsFinal`. 원 모듈 객체 변형 없이 `Object.freeze({...art, ...})` 합성. `correctedSampler===art.correctedSampler` 불일치 시 throw(시간축 보증) |
| `owner-integration-finalcrop.test.mjs` | `bd38967d4a3fd6ef81a169b7a0b1634ba8824c57b020e06f57801a56634d4cd2` | 4비율×3시각 + 시간축 보존 + 누락연결 해소 + UNKNOWN 회귀. fs 쓰기 없음 |

- 원본 보존: `wa24-delta-probe.cjs`, `UIUX/art-support-finalcrop.mjs`, `UIUX/art-support-source-fixture.mjs` 모두 **import 만**(수정 0). 타팀 `UIUX/`·`root-review/` 파일 변경 없음.

## 3. 회귀 결과 (실행 명령·exit — 실제 실행함)

```
node --check owner-integration-finalcrop.mjs        # OK
node --check owner-integration-finalcrop.test.mjs   # OK
node owner-integration-finalcrop.test.mjs           # exit=0 → 31 PASS / 0 FAIL
node wa24-delta-probe.test.mjs                       # exit=0 → 38 PASS / 0 FAIL (원담당 무결성 유지)
```

- 환경: Node v24.15.0 / macOS Darwin 25.6.0. (게임/브라우저/서버 미실행)
- **[A] 4비율×3시각(12행)**: 인수 경로 `ownerApi.predictFinalCrop` 가 실 draw 원문(fixture `actualDraw`, game.html VM 실행)과 `fractions/matrix/drawRect/clip` **1e-11 일치**. 전 12행 `geo=CROPPED`. `predictWa24FinalCrop`(원담당 WA24 상수)도 실 draw 일치 → WA24 상수=게임 소스 라인 확인.
- **[B] 누락 연결 해소**: 16:9 에서 cover-only `OK_FULLFRAME`(놓침) vs 최종 `CROPPED`(줌 상하 크롭 포착), `missingConnectionResolved=true`. 상하손실 백분율 6.3476/4.7619/3.8462% 가 root 검수값과 1e-5 내 재현.
- **[C] 시간축 보존**: `correctedSampler===art.correctedSampler`(동일 참조). `lineStartMs=80000, now=81200 → lineElapsed=1200`(라인 상대, `WA24.t=73600` 무관 → seq-time 회귀 아님). `timeBase='line-index'`. 드리프트 시각에도 실 draw 일치. `legacySampler`(seq-time)는 다른 결과 — 회귀 아님 확인.
- **[D] UNKNOWN 유지**: 눈/발/자막 `UNKNOWN`, `visibilityEvidence=GEOMETRY_ONLY`, fade0 → `HIDDEN_FADE_NO_VISIBILITY_EVIDENCE`(가시성 증거 아님).

## 4. 한계 / 실행하지 않은 항목

- **픽셀 가독성 UNKNOWN 유지**: 눈·발·자막의 실제 잘림/대비/겹침은 캔버스 픽셀 판독 필요. 본 인수는 **기하(geometry) 크롭까지만** 확정하며 시각 가독성은 판정하지 않는다. (QA 종료 인계 후 실브라우저 1x 검수 필요.)
- **실브라우저/게임/서버 미실행**, production `game.html`·`index`·`easy` 미변경(읽기만), 지원 `art-support-finalcrop.mjs` 미수정. Git add/commit/push·이미지생성·인코딩·대형빌드·청취·새세션·새에이전트·타팀 메시지 0. root 실전측정은 종료 상태(인수 아님).
- 기하 크롭의 "허용 임계(첨탑/눈/발이 실제로 프레임 밖인지)"는 **콘텐츠 영역 좌표 LOCK 이 없어** 미정 — fractions 수치만 제공. 실제 피사체 좌표 기준 판정은 다음 게이트.

## 5. 인계 (소유권 밖 — 공유/타팀 미편집)

1. **원담당 모듈 머지 권고**: `wa24-delta-probe.cjs` 의 내보내기에 `predictFinalCrop`(또는 본 `owner-integration-finalcrop.mjs`)을 정식 포함해, 다운스트림(예: `wa24-observer.cjs`, 향후 QA 인수 콘솔)이 cover-only 대신 최종 크롭을 쓰도록. 단, 원담당 `.cjs` + 지원 `.mjs` 혼용(모듈 포맷) 정리는 통합 담당 판단.
2. **docs 정정 후보**(본 세션 미편집): wa24 크롭 서술에 "**16:9 정합에서도 Ken Burns 줌으로 상하 3.8~6.3% 크롭**"을 추가. cover-only "16:9 무크롭"은 줌 미반영 표현.
3. **다음 잔여 게이트**: QA 종료 인계 후 (a) 피사체 좌표 LOCK 기준 눈/발/첨탑 실제 프레임 이탈 판정, (b) 자막 가독성 UNKNOWN 해소. 본 한 건 종료, 인계.
