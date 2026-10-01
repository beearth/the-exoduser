# ITEM-RING-RGB-ATTRIBUTION 완료

수신/실제 첫Read 2026-10-01 11:51:57 UTC. 이전검사 소스를 읽고 `rgb-attribution.mjs` 작성·실행. 추가 귀속 assertions 후 재실행했다. 두 실행 exit0, 같은 파생 SHA와 수치 재현. **93204바이트 차이는 부분알파 premultiply 양자화의 버림/반올림 차이에 귀속. 자체 native PNG roundtrip은0diff. 생산 자동 적용 없음.**

## 입력과 실행

| 항목 | 값 |
|---|---|
| 원본 SHA256 | `2f3a05692db24dbd36562681921ac72613fd97e44c3210083a4324805355137e` |
| 기존 증거PNG SHA256 | `812b47358d293d3dc2c154ab5989470add22eb3f1bb7f2edf9f78cde16da0a96` |
| 실제 마스크 함수 SHA256 | `1a8a563ba924b94577e1c53164c373ffadc371c039ed6ab93ff37bb853ab226f` |
| backend | node-canvas3.2.3 / Cairo1.18.4 / Node v24.15.0 |
| 실행 명령 | `node tools/team-followup-20261001/ITEM/rgb-attribution.mjs` |
| 원자료 | `rgb-stages.json` (각 단계diff·부분/완전알파 분포·모델 비교) |

PNG 파일 RGBA는 pngjs lossless decode로 따로 읽어 native Canvas draw/read와 구분했다. 실제 게임의 `_maskWorldDropBlack`를 추출 실행하며24/72 원공식 외 임의 픽셀 보정은 없다. 입력 SHA와 함수 SHA를 잠갔다. 부동소수 연산의 모델 일치는 이번 자산의 전픽셀에서 검증한 것으로 모든 이미지/backend에 일반화하지 않는다.

## 단계별 귀속

모든 아래 단계 alpha diff0. diff는 픽셀 수가 아닌 **다른 RGB 채널 바이트 수**다.

| 단계 비교 | RGB diff | 최대Δ | 해석 |
|---|---:|---:|---|
| 원본파일 → native decode/draw/read |0|0|불투명 RGB 원본 decode는 차이 없음 |
| 원24/72 exact배열 → native put/read |178,916|25|알파 도입 후 premultiply/unpremultiply로 RGB 양자화. alpha0 RGB 소실8,820 포함 |
| 원24/72 exact배열 → 기존증거 PNG파일 |150,721|25|기존PNG도 exact배열이 아닌 Canvas 경유 결과. alpha0 RGB 소실8,820·부분알파141,901·불투명차이0 |
| 기존PNG파일 → native decode/draw/read |47,621|1|PNG straight RGB를 native surface로 재변환하는 양자화 |
| native 마스크Canvas → 기존PNG decodeCanvas |93,204|23|이번 재현. 차이 전부 부분알파 채널, 불투명/alpha0 차이0 |
| 두 native premultiplied BGRA surface 직접 비교 |93,204|1|surface상 차이는채널1. 작은알파의 unpremultiply가 최대23으로 확대 |
| native 마스크Canvas → 같은크기 Canvas draw |0|0|same-size 복사에서 추가오차0 |
| native 마스크 read → 자체PNG파일 RGBA |85,836|1|read와 PNG직렬화의 straight RGB 반올림 표현 차이. 이 자체를 roundtrip 실패라고 세지 않음 |
| native 마스크Canvas → 자체PNG decode/draw/read |0|0|자체 backend roundtrip은 완전동등 |
| 자체PNG파일 → 기존PNG파일 |93,221|23|파일색상이 다른 backend 파생물. 원자료93204와 다른 비교임 |
|34px resize: native mask → 기존PNG|1,667|36|기존차이를 보간/축소해 증폭·전파. 부분알파1,665/불투명2채널 |
|34px resize: native mask → 자체PNG|0|0|자체 roundtrip 동등은34px에서도 유지 |

### 양자화 모델 검증

exact배열의 RGB를 C, alpha를 A라 할 때 두 모델을 오직 진단용으로 비교했다.

- `P=floor(C*A/255)`, read `A?floor(P*255/A):0`: 실제 native 마스크Canvas와 **전RGBA0diff**.
- `P=round(C*A/255)`, 같은 read: 기존증거PNG를 native decode한 Canvas와 **전RGBA0diff**.
- 두 surface의 실제 premultiplied 차이는1이며 모든93204차이채널을 설명한다. local 소스 `node_modules/canvas/src/CanvasRenderingContext2d.cc` 923~926행의 `b/g/r * alpha`→byte 대입(버림),1143~1146행 역premultiply 정수변환도 native측 귀속을 지지한다.

**결론:** 원본 decode/alpha공식 오류가 아니라 alpha를 넣을 때 native put의 버림 경로와 기존PNG가 재현하는 반올림 surface의 차이. Chrome 내부가 어느 코드로 반올림했는지는 이번에 실행/조사하지 않았으므로 기존PNG decoded표현의 모델 일치와 Chrome 구현 자체의 증명을 구분한다. 임의 색보정으로 증거PNG에 맞추지 않았다.

## 최소 파생 후보 / 채택 판정

`ring_phys_native_roundtrip.png`:256×256,60,427바이트, SHA256 `268e264a5df8c0c00f63c5c13412640c53d5f33fef6fb726d12bf5043b802831`.

기존 native 마스크Canvas를 그대로 `toBuffer('image/png')`한 한 장이다. 원화/기존증거/런타임경로를 덮어쓰지 않는다. decode 후256² 및34² readback0diff로 **native 전용 비교 후보**는 완성. 원본52,346 대비+8,081바이트(+15.4%), 원본 폴백 보존시 설치60,427바이트 추가. Chrome용 기존후보를 이 PNG로 자동 교체하면 다른색상이 될 수 있어 **Chrome 생산 대체 채택 보류**. 파일 크기나native PASS로 Chrome 채택을 강제하지 않는다.

## Chrome 인수 조건과 정확한 한계

1. root/QA의 허용된 단일Chrome 검수 구간에서 동일원본 SHA·현24/72마스크를 확인한다. 이번작업은 Chrome/게임/서버 실행0이며 과거Chrome256²/34²0diff를 새로운native 결과와 합산하지 않는다.
2. 타이밍 없는 별도 픽셀 검수에서 실제 Chrome마스크Canvas·기존증거PNG·새nativePNG를 각각 decode하고256²/34² RGBA/알파diff를 별도 표로 기록한다. 실제source/currentSrc·브라우저/backend·draw/read/resize 조건과 PNG SHA를 저장한다.
3. 기존PNG가 Chrome0diff를 유지하면 이native93204차이만으로 Chrome후보를 기각할 근거는 없다. 반대로 native후보0diff는 Chrome동등 증거가 아니다. target별동등과 실제34px가독성을 기준으로 root가 선택한다.
4. 이번own roundtrip0diff는 모든backend의 PNG 직렬화 동등을 보증하지 않는다. GPU/FPS·자연드롭·획득저장·패키지·PC 성능은 미검증, alpha동등만으로 색동등을 선언하지 않는다.

## 보존·docs·완료 구분

실제명령: 위 비교 두 회(exit0), local native 소스 rg(exit0), `shasum -a 256` 원본/증거/game/easy(exit0), docs 전체 `rg -n 'ring_phys|24/72|_maskWorldDropBlack' docs --glob '*.md'`(exit0). docs검색 원자료 `rgb-docs-related.txt`. 기존 공용문서의Chrome0diff 이력은 그대로 보존하고 native모델/파생조건/채택보류는 본 자기범위결과에 추가했다.

원본/증거SHA는시작·종료동일. easy SHA `269411143e093319926948dce42740d83617b2a0e1305cc1180a59a6ecb75e58` 유지. 현장game SHA는 `e5518842324d17fb63da44457e6092af138b4fcfbaf49c1cb03ef791431dc115`로 이전제출값과 다르다. 이번에 game을 쓰지 않았으며 타작업의 변화 가능성이 있어 전체파일불변을 선언하지 않는다. 검사에 추출한mask SHA는위잠금값과일치했다.

수신·명령실행·원인검증·최소native후보 완료. Chrome/생산 인수는미완료로root에인계. 원본·기존PNG·game/easy·공용docs·다른팀·Git쓰기0, 새세션/대형인코딩0. 허용된 작은PNG실험저장1종만 자기폴더에 수행했다.
