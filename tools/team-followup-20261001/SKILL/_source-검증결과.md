# R-input 5팀 후보 파일화·정적 검증

ART·MAP·SKILL·ENEMY·ANIMVFX의 팀 보고서에서 JS 펜스를 각각 원문 그대로 추출했다. 각 보고서에 JS 펜스가 하나씩 있어 `ART.js`, `MAP.js`, `SKILL.js`, `ENEMY.js`, `ANIMVFX.js` 총 5개다. 추출 후 Node v24.15.0 `--check` **5/5 PASS**. 후보 코드를 평가하거나 브라우저에서 실행한 횟수는 **0**이다.

`validation-manifest.json`에는 원문 경로·SHA·펜스 행 번호, 추출 파일 SHA·원문 동일 여부, 실제 검사 명령·종료 코드, 게임 소스 SHA, 식별자 검색 근거와 아래 정적 판정이 들어 있다. 후보는 수정하지 않았다. 전체 검사는 출력 폴더에서 수행했고 저장소 파일·Git은 변경하지 않았다.

## 실행 전 게이트

| 후보 | 구문 | 상태 변경·정리 판정 | 실행 전 필요한 조치 |
|---|---|---|---|
| ART.js | PASS | 게임 데이터 직접 변경 없음. rAF와 timeout·window 이름 생성. cleanup은 rAF만 취소하고 timeout과 이름은 남김(`:75`, `:79`). | PRO 시퀀스 확인, wa24 실제 표본·경계 포착 필수화, timeout 및 namespace 정리. 표본 0에서도 `within_pm2`가 true가 될 수 있음(`:70`). |
| MAP.js | PASS | **읽기 전용 아님**. `K[]` 직접쓰기·합성키 입력(`:28`), P 좌표 순간배치(`:52`). 외부 취소·finally·오류 시 키 해제가 없음. | 상태 변경 SETUP으로 분류, 실게임/바인드/포커스/생존 게이트, 키·interval 정리. flatline은 기록만 하고 중단하지 않으므로 문구 또는 구현 정정(`:42`, `:44`). |
| SKILL.js | PASS | 게임 데이터 직접 변경 없음. passive capture 리스너3개·rAF 생성. dispose가 둘 다 해제하지만 중복 설치 시 이전 핸들을 잃음(`:1`, `:53`). | 설치 전 기존 dispose, 유효 표본/정상 설치 양성대조/단계별 입력 확인. flags 없음만으로 PASS 불가. 타 MP 소비와 장판 만료도 분리해야 함. |
| ENEMY.js | PASS | 공용 함수 wrapper 교체. stop이 복원하나 wrapper 소유 확인/중복 설치 방어 없음. | **수정 전 실행 금지 권고**. root.G/P/ens/ETYPE_RANGE와 lexical 전역의 차이(`:27–37`), 차징 시작 판정(`:100`), rAF 횟수를 simulation tick처럼 세는 부분(`:95`)을 바로잡아야 함. |
| ANIMVFX.js | PASS | 게임 데이터 직접 변경 없음. 그러나 임시 WebGL2 컨텍스트를 생성하고 참조를 버림(`:20`); 자원 정리 없음. | 임시 GL 생성을 제거하거나 명시적으로 정리. `flashPathReady`에 실제 플래시 모드 `_ensGLMode===1`과 게임 진행/일시정지 조건을 반영. GL null 구분 자체는 타당. |

모든 대상 식별자는 `game.html`에서 토큰으로 발견됐다. 이는 해당 페이지 realm에서 접근 가능하거나 window 속성으로 노출됐다는 증명은 아니다. 특히 `game.html:15778`의 G, `:15783`의 P/ens는 `let`, `:29359`의 ETYPE_RANGE는 `const`이며, ENEMY 후보는 이들을 `window` 속성으로 읽는다. 검사한 game.html에서 이 이름의 window 공개 대입을 찾지 못했다.

ENEMY는 추가로 `game.html:38856`의 차징 시작에서 `e.projT=e.projCd`로 즉시 리셋된다는 사실을 반영하지 않았다. rAF에서 `projT<=0 && _projChargeT>0`을 기다리면 차징 시작을 놓칠 수 있다. 대상 사망 후 다른 개체로 바뀔 때 누적치가 섞이고, 원함수 호출 전에 firstFire를 기록하므로 실제 투사체 커밋 성공을 증명하지도 않는다. 상세 수정 게이트는 manifest에 보존했다.

ART의 자막 고정 필드는 소스 추론이며 시각 실측이 아니다. SKILL의 의심 플래그는 다른 MP 소비나 표본 누락으로도 달라질 수 있다. ANIMVFX의 Mac WebGPU 설명은 가능한 원인을 제시할 뿐 과거 raw의 실제 원인을 이번에 측정한 것이 아니다. **구문 PASS를 후보 실행 준비 완료 또는 게임 기능 PASS로 확대하지 않는다.**

## BUILD LFS 3건 정정

원래 `build/asset-manifest.json`과 `build/실행결과.md`의 **957파일·3 FAIL·exit1은 수정하지 않았다.** 이 실패는 `build-nwjs.mjs`의 재귀 복사 대상에 실자산 바이트 대신 LFS 포인터 3개가 포함된다는 소스 입력 완전성 검사 결과다.

| 경로 (`assets/map/ch1/production_finish/` 아래) | 최신 CLI 분류와 독립 읽기 근거 |
|---|---|
| `CH1_1_PRODUCTION_MASTER.png` | 오프라인 베이크 제작 원본. `tools/build_ch1_production_finish.mjs:146`의 master이며 `VERCEL_UPLOAD_FAILURE_20260913.md:11`은 웹 빌드에서 사용하지 않는다고 명시. |
| `outer76_81-provenance.zip` | 생성 출처 아카이브. BUILD CLI의 저장소 참조 조사에서는 docs/출처 기록으로 분류했고 직접 런타임 참조를 찾지 못함. ZIP이라는 확장자 자체만으로 런타임 사용 불가를 단정하지 않음. |
| `outer90_sources/outer90_patch.png` | 베이크 합성용 원본. `composition.json:183`, `retouch-layers.json:182`의 입력. 실제 `ch1-border-foreground.js:99` 참조는 별도 `rotforest_mass_0{variant}.png`. |

따라서 **런타임 필수 시각 자산 3개가 누락됐거나 실제 패키지가 실패했다는 뜻은 아니다.** 제작 원본 2개·출처 자료 1개가 미복원된 상태로 복사될 수 있다는 판정이다. 실제 패키지 생성·로드·화면 검수를 수행하지 않았으므로 BUILD CLI의 “런타임 비주얼 영향 없음/렌더 정상”은 이번 증거 범위보다 강한 표현이다. 정정 표현은 **“조사한 직접 참조 기준으로 런타임 필수 누락 근거를 찾지 못했으며, 제작 원본·출처 자료의 실바이트 미복원은 남아 있다”**이다.

LFS 다운로드·원본 복원·생산 반영은 수행하지 않았다. 다음 실행자는 기존 포인터 검사 결과와 이 역할 분류를 함께 인수해야 한다.
