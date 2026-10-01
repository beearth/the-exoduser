# UIUX-HUD-COORDINATE-ADAPTER — 좌표 연결 후보 인수

## 수신·실제 착수·범위

COORDINATE_TASK와 이전 완료 결과·현재 UIUX 팀 MD를 읽었다. 소유 폴더/UIUX 문서 검색에는 이번 지시 파일만 있었으며 동일 과제 진행 영수증/어댑터 산출은 없었다. 동일 기존 대화에서 직접 소스를 읽고 구현했다. 첫 지시 읽기 종료 UTC는2026-10-01T12:17:42Z, 실제 draw/resize/숫자/charge 소스 읽기와 팀 문서 대조 종료 UTC는12:17:53Z다. 메시지 도착/명령 시작의 정확한 시각은 UNKNOWN이며 조회된 종료 시각을 복사/추정한 시작 시각으로 사용하지 않았다.

쓰기 소유는 UIUX 폴더와 전용 coordinate 결과/영수증뿐이다. 기존 P1/P2 산출을 변경하거나 되돌리지 않았다. 이번 좌표 어댑터·연결 hunk·독립 회귀 산출은 완료했고 **생산 적용/실제 시각/밀집 성능은 UNKNOWN**이다.

## 현재 직접 읽은 입력과 원식

| 항목 | 직접 확인 값 |
|---|---|
| 첫 HEAD | `753bde9d0e66ae3b61e32025373bfe737dd84c3f` |
| 후속 HEAD 조회(12:21:14Z) | `219dd6fb86510c33572a6f7ceda883795bc830fc` — 병행 작업 중 HEAD 변경 관측. 본팀 Git 쓰기0. 과거 HEAD로 현재 전체를 판정하지 않음 |
| 본편 SHA-256 | `e5518842324d17fb63da44457e6092af138b4fcfbaf49c1cb03ef791431dc115` — 첫 Read, 후보 생성/회귀 및12:21:14Z 조회 모두 동일 |
| 원식 보존 | `coordinate-source-evidence.json`에 직접 추출한5본문·시작 행·SHA-256·생성 UTC·후보 hash를 기록. 생성기는 오래된 행번호로 치환하지 않고 실제 유일 앵커를 확인 |

| 추출명 | 현재 game.html 위치 | 본문 SHA-256 |
|---|---|---|
| drawTransform | 49883 | `29d5201c7a3ec8bd0bc2dd210e48e544dc7b751f55c6f88117dd2823f50b8a99` |
| resizeContract | 4344 | `521cb49cbcf59310e830798f5ef6d8fe5229e580b247dc9167ef868bdd825da3` |
| chargePainter | 22910 | `7097b6a7a62edbba6b20cf18d1a2936f8bba0c615117805696e9b9105a3b60c7` |
| numberPainter | 42425 | `0607ddf15c6784ce951f124ac5a33c18e37195fed7269c2aafd0698821ad5ef8` |
| damageStateAndDraw | 52922 | `1023598cce6d4ff8d95e90dd97191a04e4c1f4c5387d7a79ba5f7676f1a4f539` |

## 구현된 좌표 계약

파일: `tools/team-followup-20261001/UIUX/coordinate-adapter.mjs`. 기존 P2를 import해 사용한다.

| 단계 | 실제 코드와 연결한 식 |
|---|---|
| 카메라 이동 | tx=Math.round(VW/2−cam.x+sx), ty=Math.round(VH/2−cam.y+sy). shake를 먼저 더한 뒤 반올림. 음수 Math.round를 trunc/floor로 바꾸지 않음 |
| world→논리 | lx=VW/2 + zoom×(wx+tx−VW/2), ly=VH/2 + zoom×(wy+ty−VH/2). zoom은 실제 `_ez*_cz`인 `_tzoom`. clamp된 `_vpMul`은 culling 값이므로 좌표 배율로 쓰지 않음 |
| 논리→world | wx=(lx−VW/2)/zoom+VW/2−tx, y도 동일 |
| world 그리기 이동 | 배치 deltaLogical/zoom을 X.translate에 전달. 원래 glyph x/y를 바꿔 ~~를 다시 적용하지 않음 |
| 논리↔GPU 백킹 | backing=logical×실제ssaa, inverse=backing/ssaa. 실제 백킹 C.width/height를 별도로 받으므로 even rounding 차이를 보존 |
| 백킹↔CSS | CSS좌표=rect.left/top + backing×rect.width/height÷C.width/height. 고정 해상도/렌더스케일/비균등 stretch를 추정 innerWidth로 대체하지 않음 |
| DPR | 현재 rz()는 `_dpr=1`, `_ssaa=1`을 강제한다. devicePixelRatio를 다시 곱하지 않는다. 어댑터 dpr는 관측 metadata이며 실제 viewport/백킹 입력이 변환을 결정. SSAA1.5/2·DPR1.5/2 검사는 합성 조합이지 현재 게임에서 활성화한 사실이 아님 |
| gap/viewport | 4CSS px 후보 간격을 두 축 변환비 중 큰 값으로 환산해 양축 최소간격 유지. 실제 보이는 논리 범위=backingWidth/ssaa × backingHeight/ssaa |

## charge·숫자 실제 bbox

| 대상 | 원식 연결/보존 |
|---|---|
| charge | 기존 캐시로 측정한tw. 중심 cy=y−r−25, fill 폭tw+14/높이20. lineWidth1.5 테두리까지 .75씩 확장한 bbox=(x−(tw+14)/2−.75, cy−10−.75, tw+15.5,21.5). 실제 painter를 VM mock에서 실행해 fillRect 치수와 대조 |
| drawNumStr | 숫자 입력의 String(~~num), scale||1, dw=~~(48×scale),dh=~~(56×scale),gap=~~(18×scale),tw=s.length×gap,ox=x−tw/2. 숫자 이외 문자 위치도 gap을 소비하지만 glyph는 건너뜀. 각 실제 destination=(~~(ox+i×gap),~~y,dw,dh)의 union |
| 중요한 정렬 차이 | 실제 셀 폭48과 gap18이 다르므로 bbox 폭은 s.length×gap이 아님. 음수 ~~는0쪽 절삭이므로 Math.floor로 바꾸지 않음. 원 glyph cell은 보수적 bbox이며 투명 잉크 경계/시각 bbox는 UNKNOWN |
| damage 시점 | 현재 life/ml 기반 age/bounce/shake/alpha를 그대로 계산하는 damageState를 원식 VM 실행과 대조. 실제 hunk는 원래 루프가 계산한 `_sc/_sk/_ta`를 직접 인수하므로 이중 계산/게임객체 갱신 없음 |
| 보호 | 숫자문자열·색 row·셀 크기/원위치 ~~·수명·alpha 불변. 이동은 원래 renderer 바깥 translate로만 적용. 일반 텍스트 bbox는 측정하지 않아 기존 즉시 렌더 유지/UNKNOWN |

## 실제 연결 미적용 hunk

`coordinate.candidate.diff`는 현재 본편에 대한5hunk다. 기존 P1 diff와 **중복 적용하지 않는다**. 새 hunk에 필요한 P2·adapter를 IIFE 내부로 포함해 module 추가 로더 없이 독립적으로 연결한다.

1. charge를 큐로 연결하고 기존 painter를 분리한다. ctx/label/font 폭캐시 및 font-loading 무효화는 유지한다.
2. draw 시작에 전 프레임 큐/프레임 값을 회수한다.
3. 실제 sx/sy·_tzoom이 계산된 직후 VW/VH·cam·shake·SSAA·C.width/height·CSS rect·_dpr를 snapshot한다. 변환 뒤에 새 random/shake를 계산하지 않는다.
4. 기존 **비트맵 숫자 분기**를 동일 인수/alpha의 paint callback으로 큐에 넣는다. 숫자만 이동하고 일반 문구의 조건/표시/루프는 그대로 둔다. glyph 없는 문자열도 callback은 보존한다.
5. world restore 직전 P2 배치→역이동→damage 먼저/charge 뒤 paint→큐 회수한다. 입력 게임 객체를 직접 변경하지 않는다. frame 관측 누락은 UNKNOWN 및 원위치 callback fallback이며 실제 paint 예외는 숨기지 않고 save/restore/finally로 회수한다.

실제 Canvas 코드를 실행한 것이 아니라 생성한 helper+원 painter를 VM mock에서 실행했다. `coordinate-runtime-fixture.js`는 이 연결 검사 원자료이며 생산 로딩 파일이 아니다.

## 검증·실패 이력

| 명령/검사 | 실제 결과 |
|---|---|
| adapter/build/test `node --check` | exit0 |
| `node tools/team-followup-20261001/UIUX/build-coordinate-candidate.mjs` | exit0,실행inline4개 구문 PASS,5hunk 메모리 재구성 전체 텍스트 일치,생산 본편 재읽기 동일 |
| `node tools/team-followup-20261001/UIUX/coordinate-adapter.test.mjs` | exit0,**91/91**. 기존 P2 14검사 반복만으로 완료한 것이 아님 |
| 실제 원 draw snippet matrix/왕복 | 3해상도(1280×800/1324×982/390×844)×zoom1/.62×SSAA1/1.5/2×DPR1/1.5/2=54조합. 각 양수/음수/0좌표에 대해 원 draw 순서 VM mock matrix와 일치,world/논리/백킹/CSS 왕복 |
| 실제 drawNumStr 셀 대조 | 숫자/긴 숫자/소수접미문구/음수문구/빈문구/number 입력×scale0/.62/1/1.5=24조합. 원 함수 drawImage destination과 bbox 셀 동일 |
| 실제 연결 검사 | enqueue 즉시paint0→flush damage2glyph/charge1,실제 nonzero 이동·원glyph절삭좌표·alpha .6 보존,큐0. UNKNOWN frame fallback glyph2 보존. paint 예외에도 restore |
| 첫 생성 실패 | 부분행 앵커가 기존 주석을 포함하지 않아 hunk 재구성 assert/exit1. 원본 전체행을 앵커로 바꿔 재실행 성공. 생산 수정/오류가 아님 |
| docs 검색 | `rg -n '_tzoom|drawNumStr|_ssaa|_dpr|_chargeLabelMetrics|피해숫자' docs/ --glob '*.md'` exit0. 원자료 coordinate-doc-matches.txt |
| 최종 재검증12:22:55Z | 구문3파일·후보재생성·91회귀 전부exit0. HEAD219dd6fb… 및 본편e5518842… 직접 재조회. 공유 변경122경로로100기준 초과 관측: 타팀 보존/Git쓰기 금지 때문에 정리·커밋하지 않고 총괄 인계 |

검사 상세 로그 `coordinate-validation.txt`, 직접 읽은 원식/해시/구문·hunk 결과 `coordinate-source-evidence.json`을 보관했다. module/importmap은 실행inline 구문 검사에서 제외한다. 실제 렌더러·폰트 리소스·GPU batching 검증으로 확대하지 않는다.

## UNKNOWN 및 인계 게이트

| 항목 | 미완료/위험 |
|---|---|
| 시각/밀집성능 | 게임/브라우저/서버 실행0. 후처리 atmosphere·늦은 VFX·글자 잉크·픽셀대비·CPU/GC 비용은 UNKNOWN |
| 대상 연계·시간 안정성 | P2가 leader 좌표를 반환하지만 선은 아직 paint하지 않는다. queue ID는 프레임 순서이며 영구 enemy 생성ID/텍스트 풀 슬롯 재사용 안정성은 UNKNOWN. 실제 튀는 이동과 적 식별을 QA해야 함 |
| 포화·일반 텍스트 | 분리 슬롯 없으면 원위치 및 unresolved 유지. ordinary text/플레이어/DOM HUD 예약 bbox는 이번 연결에 입력하지 않음. collision-free 전체 PASS 아님 |
| 현재 SSAA/DPR | rz의실제1과 합성 미래조합을 구분. GL/WebGPU가 실제 동일 transform/state stack을 적용하는지는 QA 관측 필요 |
| 쉬운판 | 경고 기능을 새로 만들지 않음. 이번 diff는본편만. 쉬운판 bbox/동작 연결은 별도 소유권 검토 필요 |
| 배포/백업 | Git 쓰기/생산적용/빌드/배포0. 총괄이 최신 HEAD 및 본편SHA를 다시 인수한 뒤 자기 소유 범위에서 체크포인트 |

총괄 docs 동기화 제안: UIUX 작업대장에는 **좌표 연결 후보/91정적검사 완료·시각 UNKNOWN**으로 기록한다. `FRAME_DROP_HUD_TEXT_20260928.md`/SSAA 문서에는 실제 rz DPR1/SSAA1 및 logical/backing/CSS 분리를 유지하고 숫자 bbox가 전체 glyph destination union임을 추가한다. 탄막 SSOT에는 채택 시에만 링 기존 패스/예고 텍스트 최종 world 패스를 분리해 기록한다. 보호 설계·공유 문서는 직접 변경하지 않았다.

## root 독립 인수 — 생산 미적용

팀 완료 후 root가 원 draw transform·charge·drawNumStr·damage 분기와 후보 연결 코드를 직접 대조했다. 좌표91검사와 실제 import 의존 P2의14검사를 재실행하여 exit0을 확인했고, 원식5본문의 현재 파일 유일 위치·행·SHA를 별도로 검증했다. 전체 후보 hash는 `f90799726bd1a3b949d7a73056ff1c10c882176561f811127cb5e8ada9842110`이다.

원 제출 `coordinate.candidate.diff`는 주변 context가 없어 기본 `git apply --check`가 실패하며 `--unidiff-zero`에서만 통과한다. root는 원 제출을 보존하고 같은 후보 바이트에서 주변3행을 포함한 `coordinate.with-context.diff`를 생성했다. 이 파일은 기본 `git apply --check`를 통과하고 후보 hash도 동일하다. 생산파일에 실제 적용하지 않았다. `coordinate-root-validation.json`에 근거와 한계를 기록했다.

인수는 **독립 구현 후보·정적 검사 완료**다. 화면 겹침 해소·적과 라벨 연계·프레임 간 이동 안정성·GL 프록시·폰트·CPU/GC 비용은 여전히 미검증이며 출시/생산 적용 인수가 아니다.
