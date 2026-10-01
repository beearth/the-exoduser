# ART-20261002-LIVE-CALLSITE

직전 owner 통합 후보를 root가 재실행해 31+38 PASS 확인했고 `ART/wa24-finalcrop.mjs`를 정식 export로 추가했다. 이제 adapter만 추가하는 단계를 끝내고 기존 `wa24-observer.cjs` 실제 호출부의 시간축 오류와 누락 연결을 수정한다. 이 파일은 아직 `_cutsceneStartMs`/L.t의 seq-time으로 activeCut을 고르며, delta-probe의 검수된 correctedSampler와 다른 상태다. 실제 엔진은 _cutLineIdx+_cutLineStartMs/_cutsceneGetLines 순서를 사용한다.

소유 쓰기: 기존 `ART/wa24-observer.cjs`, `ART/wa24-observer.test.mjs`, `ART/README.md`, 신규 `ART/live-callsite-*` 및 이 폴더 `OWNER_IMPL_20261002-{receipt.json,result.md}`. 다른 ART 완료 원문과 UIUX 지원 원본은 보존한다. 브라우저용 UMD를 Node 전용 require(ESM)으로 깨뜨리지 않는다. 필요한 검수된 샘플러/크롭은 의존 주입 또는 명시 로더 계약으로 연결하고 기본자동실행 확대0. actual line-index 경로를 쓴 결과가 canonical finalcrop과 맞게 연결한다.

검사: wa24 시작시각을 의도적으로 늦춘 fixture에서 기존 관측기가 다른 라인을 읽는 RED → 실제 owner GREEN. PRO/비PRO, line idx/시각 누락·역행, 무표본은 미확정. 4비율×3시점 geometry 기존31 보존, 눈/발/자막 픽셀 UNKNOWN. 설치/cleanup/예외 회귀도 기존37? 등 실제 개수를 실행해 기록한다. 이미 연결돼 있으면 중복하지 않고 경로를 검증한다.

사용자 게임 입력/리로드/닫기/계측/새 게임·브라우저·서버·빌드·이미지생성0. game/easy/index/server·공유docs·타팀 수정0. Git/queue/새세션/새에이전트0. 기존 세션에서 한 건만 진행. 시작 전 중복/입력초안 확인, 실제 Read/코드 Edit/검수시각 receipt, 결과·docs 반영안을 소유폴더에 남긴다. 추측 시각PASS나 패키지 완료 금지.
