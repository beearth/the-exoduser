# ART-FINAL-CROP-FIX — 지원 담당 UIUX 결과

## 담당·수신·충돌 방지

원담당 ART Claude a489cbeb는 사용자/root 인계상 idle·native Mac locked·수정 지시 미수신으로 대기다. 지원 담당은 기존 UIUX이며 원 ART를 대신 재가동하거나 메시지/세션을 만들지 않았다. 초안/큐는 UNKNOWN이다. 지시문·ART-next 결과·ROOT_NEXT_REVIEW·submission-boundaries와 실제 game 원식을 읽었다. 첫 명령 UTC14:25:42Z, 실제 소스 Read 완료14:25:57Z. 정확한 메시지 도착 초는 UNKNOWN.

첫 Edit는 지원 영수증·독립 finalcrop 모듈 생성 apply_patch 성공이며14:25:57Z 이후~14:27:44Z 이전이다. 기존 ART finalcrop 신규 산출/영수증과 UIUX 지원 중복은 없었다. 마지막 파일 기반 점검14:28:18Z에서도 원담당 새수신/수정 산출을 발견하지 못했다. 이것을 실제 큐 조회·수신 부재 확정으로 보고하지 않는다. 원담당 새수신이 확인되면 지원 편집을 중지하고 root에 보고한다.

소유 UIUX/art-support-*와 본 전용 결과/영수증만 작업했다. root 인수 중 binding-* 수정0, 원 ART·생산·공유 docs·Git·게임·브라우저·서버·빌드·새세션·하위에이전트·이미지생성0.

## 실제 수정 후보

`art-support-finalcrop.mjs`는 원 ART의 correctedSampler/letterbox/ease/shake를 읽기 import하며 별도 `predictFinalCrop`을 제공한다. 원본 모듈의 base-cover 계산/시간축 후보를 수정하지 않았다. 예측 입력은 라인인덱스·라인시작·절대now다. 확대율 계산에서 기존 sampler의 표시용 반올림값을 재사용하지 않는다.

| 항목 | 실제 계산 |
|---|---|
| clip | 전체 화면좌표의 콘텐츠 사각형 `(lbX,lbY,cw,ch)`을 먼저 고정 |
| 전체 행렬 | `[z,0,0,z, lbX+cw/2+panX+shakeX-z*cw/2, lbY+ch/2+panY+shakeY-z*ch/2]` |
| 순서 | 콘텐츠clip→레터박스translate→중앙+pan+shake translate→zoom→역중앙translate→cover draw |
| cover | actual 원식의 fit-height/fit-width 분기와 `(ch-dh)*.1` 보존. base crop을 최종 판정으로 쓰지 않음 |
| 최종 손실 | 최종 drawRect와 고정clip 교집합. 네 변 손실/합산축비율·원본2560×1440 좌표의 가시영역/손실px 산출 |
| 판정 | 양의 손실이면 CROPPED. 기하무손실도 FULLFRAME_GEOMETRY일 뿐 눈/발/자막 PASS 아님 |
| fade0 | HIDDEN_FADE_NO_VISIBILITY_EVIDENCE. 숨겨진0ms를 원화보존 증거로 사용하지 않음 |
| 시간축 | 기존 correctedSampler를 동일 참조로 유지. lineElapsed=now-lineStartMs, shake는 절대now 사용 |

지원 후보는 진단 계산의 결함을 고친 것이다. 게임 카메라/원화 자체의 zoom·crop을 바꾸거나 그림 요소를 복구한 작업이 아니다.

## 원실패→수정 및 실제 원식 대조

`art-support-source-fixture.mjs`는 현재 game.html에서 실제 WA24 객체·_ease·_cutShake·letterbox·clip·카메라/cover draw 블록을 추출한다. 추출 원문을 VM fake Canvas의6계수 행렬에 실행하며 UIUX 예측과 네 변 비율·행렬6값·drawRect/clip4값을 각각 대조했다. 게임/브라우저 실행이 아니다. root submission 도구 전체를 실행해 타팀 SKILL fixture를 섞지 않고 ART 원식만 독립 재현했다.

| 실행 | 결과 |
|---|---|
| ART_SUPPORT_BASE_ONLY=1 독립 회귀 | **4PASS/12FAIL, exit1**. 원 ART 실제 base-cover 수치와 최종 source 손실이12조건 모두 불일치 |
| 수정 finalcrop 독립 회귀 | **16PASS/0FAIL, exit0**. 12조건 정확대조와 시간축/절대shake/zoom외pan/fade0/원자료 검사 |
| 초기 fixture 조립 실패 | 배열 안 WA24를 acorn으로 읽을 때 뒤 comma까지 SequenceExpression으로 추출하여16FAIL. 첫 ObjectExpression 경계를 사용하도록 fixture를 수정했다. `art-support-initial-fixture-failure.txt` 보존. 제품 결함으로 오인하지 않음 |

아래%는 확대 후 이미지 폭/높이에 대한 각 변 손실비율이다. 임의 자막/눈/발의 특정 픽셀 비율이 아니다. 원본 손실px·최종draw/clip·가시source rect는 `art-support-final-evidence.json`의12행에 기록했다.

| 화면 | ms | 좌% | 우% | 상% | 하% | 세로합% |
|---|---:|---:|---:|---:|---:|---:|
| 1920×1080 | 400 | 3.17378 | 3.17378 | 3.26049 | 3.08706 | 6.34755 |
| 1920×1080 | 1200 | 2.38095 | 2.38095 | 2.29277 | 2.46914 | 4.76190 |
| 1920×1080 | 2399 | 1.92308 | 1.92308 | 1.92308 | 1.92308 | 3.84615 |
| 2560×1080 | 400 | 3.17378 | 3.17378 | 3.26049 | 3.08706 | 6.34755 |
| 2560×1080 | 1200 | 2.38095 | 2.38095 | 2.29277 | 2.46914 | 4.76190 |
| 2560×1080 | 2399 | 1.92308 | 1.92308 | 1.92308 | 1.92308 | 3.84615 |
| 1920×1200 | 400 | 7.85640 | 7.85640 | 3.25182 | 3.09573 | 6.34755 |
| 1920×1200 | 1200 | 7.14286 | 7.14286 | 2.30159 | 2.46032 | 4.76190 |
| 1920×1200 | 2399 | 6.73077 | 6.73077 | 1.92308 | 1.92308 | 3.84615 |
| 1024×768 | 400 | 14.88033 | 14.88033 | 3.29572 | 3.05183 | 6.34755 |
| 1024×768 | 1200 | 14.28571 | 14.28571 | 2.25694 | 2.50496 | 4.76190 |
| 1024×768 | 2399 | 13.94231 | 13.94231 | 1.92308 | 1.92308 | 3.84615 |

16:9 세로합6.34755/4.76190/3.84615%는 root 원식과 일치한다. 21:9의lbX320도 가시영역 계산에 포함했다. **어떤 화면비에서도 상하무손실이라는 원 제출 결론은 성립하지 않는다.** 눈/발/중앙전사/자막이 보존되거나 읽힌다는 판정은 픽셀없음으로 모두 UNKNOWN.

## 소스·docs·남은 게이트

최종 재검수14:29:24Z: 구문3개 exit0, 원식 비교 원본4PASS/12FAIL→수정16PASS/0FAIL 재확인. 원담당 finalcrop 신규 산출/영수증 파일 미발견. 실제 큐 수신 상태는 여전히 UNKNOWN이다.

현재 game SHA256 `8ebc3b7b52a651c1a3bc5e8c285b00d186c6dacc18429ada7499781acc72b0b9`, 원 ART 모듈 `79193e10228007bfce1935c633156a208b719d6540b4b3b45b4889d32a1936e9`. 작업 전후 동일했다. 과거 root 검수의 e5518842를 현재 game 해시로 재사용하지 않았다. 실제 실행 원문·추출 SHA·줄번호는 증거JSON에 보존했다.

docs 전체 wa24/cin_fallhell_custom/상하손실/최종크롭/Ken Burns 검색 exit0, 원자료 `art-support-doc-matches.txt`. root가 ART-next의 상하손실0·어떤AR에서도눈/발보존·OK_FULLFRAME·SSOT 상하손실 삭제 권고를 정정해야 한다. base cover와 최종행렬 계산을 구분하며 시간축 수정 후보는 유지한다. 공유 docs는 편집하지 않았다.

인수 범위는 진단 후보·정적 원식 대조다. **실제 시각/눈/발/자막 가독성: UNKNOWN.** QA 실제1x픽셀·전환/가독성·게임성능 검수와 root 통합/체크포인트가 남는다.
