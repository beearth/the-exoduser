# ITEM-RING-INTEGRATION-BUNDLE 결과

2026-10-01 기존 세션 후속. **수신·실제 착수·인수묶음 작성 완료 / 생산 채택 보류.** 신규 세션·생산파일 수정·자산 이동 없음.

## 수신과 실제 착수

11:45:13 UTC NEXT_TASK.md 읽기와 현재 작업 개수84 확인. 이어 이전 결과·최소diff·후보·팀 MD·현재 `_worldItemSkin`을 읽었다. 이전 작업은 완료 상태이고 next receipt가 없어 중복 진행이 아닌 새 승인 한 건으로 기록했다. 세션ID는 배정 문서 제공값이며 별도 런타임 조회로 증명하지 않았다. 초기 복합 읽기 exit1은 아직 없는 next receipt를 cat한 결과이고 실제 소스 읽기는 성공했다.

## HEAD·함수 계약·적용 조건

Git 명령 없이 `.git/HEAD`와 지정 branch ref를 파일로 읽어 현재 `fe85bb0866b895b91adf82da54dfe48bb7f89f7f` 확인. 현재 생산 함수는26576행이며 직전 diff의 행 위치보다76행 이동했으나 선택·실패·마스크 계약은 유지된다. 원본 전체 game SHA는 이전과 다르므로 이전 전체파일 SHA를 이번 입력값으로 재사용하지 않는다.

| 대상 | SHA256 / 상태 |
|---|---|
| 현 game.html | `1fc7ac9a31eb516535bda52d300f1958bf5240f5620afbd4038d4ba7b36ecff5` |
| easy | `269411143e093319926948dce42740d83617b2a0e1305cc1180a59a6ecb75e58` |
| `_worldItemSkin` 함수 | `41cf68ff6b4b0ccefe690c9024191bb3a52f5178ad5896c4783c3a31edf03bf3` |
| 변환 후보 함수 | `38e8aaaf30ec0d52123e4943bbfbca04e4db0e53ed42089e692fd785debc57ab` (변환기의 URL 문자열은 double quote; diff는 single quote로 의미 동일) |
| `_maskWorldDropBlack` | `1a8a563ba924b94577e1c53164c373ffadc371c039ed6ab93ff37bb853ab226f` |
| 원화 ring_phys | `2f3a05692db24dbd36562681921ac72613fd97e44c3210083a4324805355137e` |
| 증거 PNG | `812b47358d293d3dc2c154ab5989470add22eb3f1bb7f2edf9f78cde16da0a96` |

`tools/team-followup-20261001/ITEM/integration-bundle-check.mjs`는 HEAD prefix·생산 함수/마스크 해시·PNG/원화 해시·단일행 변환·실제src 우회 계약이 다르면 실패한다. HEAD가 움직이면 자동 통합하지 말고 다시 인수한다. 최소diff의 위치를26583행으로 갱신했으며 내용은 한 줄 그대로다. 생산 경로 `img/ui/item-cutouts/ring_phys_masked.png`는 여전히 없으므로 총괄이 별도 승인 후 추가하기 전 효과를 주장할 수 없다. 전역컷아웃Set·DOM·easy·부트 확장 금지.

## 독립 실행 결과 / 판정표

| 검사 | 실제 결과·한계 |
|---|---|
| `node tools/team-followup-20261001/ITEM/integration-bundle-check.mjs` | exit0. 함수/자산 계약 및 offline alpha 검사 통과. RGBA 전체 동일을 보증하는 PASS 아님 |
| `node --test tools/team-followup-20261001/ITEM/ring-png-candidate.test.mjs` | exit0 / 11PASS·0FAIL·0skip |
| pending/null | 요청/교체 로딩 중 null, null 입력은 Image/요청0 |
| PNG404→raw | 원래 phys1회 폴백, 기존 마스크1회·동일Canvas 재사용 |
| raw404/양실패 | 총요청2회, handler 해제, 추가120호출에도 재시도0·null |
| PNG↔raw/교체 | 로드소스별 Image/Canvas 전환, 교체 후 새픽셀로 마스크 재생성·재사용 |
| 캐시 | ring1/ring2 같은 Image 공유, PNG 성공120회 추가마스크0 |
| 다른 속성·기존컷아웃 | ice/dark 원래 경로와 sword컷아웃 유지 |
| 늦은load | 기존 재가공 잔여 보존, 해결로 계산하지 않음 |

기존 전체 감사16개를 반복하지 않았다. 이번11개는 승인된 후보 계약의 현 소스 회귀이며 실제 HTTP404·사용자 입력·GPU 시험이 아닌 ControlledImage 기반이다. stdout 및 원자료는 `tools/team-followup-20261001/ITEM/integration-validation.txt`에 보존했다.

## 합성픽셀과 실제 PNG 근거 분리 — 중요 잔여

| 근거 | 256² | 34² | 판정 |
|---|---:|---:|---|
| 이번 실제 파일 offline native Canvas raw→현24/72마스크 대 PNG decode | alpha diff0, RGBA diff93,204바이트, maxΔ23 | alpha diff0, RGBA diff1,667바이트, maxΔ36 | **알파 동등 / RGB 동등 미충족** |
| 실제PNG alpha 분포 | 완전투명3,056픽셀·부분투명56,783픽셀 | 완전투명0·부분투명1,106픽셀 | 투명데이터 존재 확인, 배경이 모두 알파0인 것으로 과장 금지 |
| ControlledImage synthetic 2×1 | 검은 배경제거·색보존·캐시 통과 | 해당없음 | 실제PNG RGB/알파 비교와 별개 |
| 과거 Chrome 실제 RGBA 비교 | 0diff 보고 | 0diff 보고 | 기존 브라우저 검수 이력. 이번 offline결과를 덮어쓰지 않음 |

같은 해시 자산임에도 native Canvas 재구성 RGB가 다르다. 디코더/색관리/알파 roundtrip 영향은 가능 원인일 뿐 아직 귀속하지 않았다. 알파0diff만으로 새 RGBA동등 PASS를 선언하지 않는다. PNG를 다시 만들거나 인코딩하지 않았다. 총괄은 동일 Chrome 실제 Canvas 비교와34px 화면을 다시 확인하고 런타임에서0diff가 재현되더라도 backend 차이·패키지 검수 한계를 기록해야 한다.

## 인수와 남은 게이트

- 통합 후보 묶음: `ring-png-minimal.patch`, `ring-png-candidate.js`, `ring-png-candidate.test.mjs`, `integration-bundle-check.mjs`, `integration-validation.txt`.
- docs 전체 `rg -n 'ring_phys|_worldItemSkin|24/72' docs --glob '*.md'` 검색 완료, 결과 `next-docs-related.txt`. 코드 후보 추가와 새 RGB차이 근거는 본 결과에 기록. 공유 ITEM_TEAM_MASTER/진단/마스터의 생산미반영 상태는 유지하고, 채택 후 총괄이 경로·함수 계약·backend별픽셀근거를 동기화한다.
- 제한적 후보 검증은 가능하지만 **생산 채택 보류**. 실제 PNG RGB차이 귀속·Chrome alpha/RGBA·34px 시각·느린pending/HTTP404·자연드롭/획득/저장·패키지 포함·실제GPU/FPS/p95/p99는 미완료다.
- 파일+32.0%, 원본 폴백 보존시 설치69,119바이트 추가. 과거3쌍9.9→4.9ms는 요청→제출반환이며 GPU/FPS 개선이 아니다. 제작22.2ms는 사전 비용. 이번 성능 새 측정0.
- 게임/서버/브라우저/이미지생성/인코딩/대형빌드/PC/Git조작0. 다음 소유권 밖 게이트는 총괄에 인계한다.
