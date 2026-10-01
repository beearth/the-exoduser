# ITEM-RING-PNG-REVIEW 독립 검토 결과

2026-10-01. 입력 HEAD `30a204a7aa348a88b90bdc922862c610a7da938f`. **배정된 후보 작성·작은 검증 완료. 제한적 통합 검증 후보로 채택 권고, 생산 채택은 보류.**

## 산출물과 계약

| 산출물 / 항목 | 결과 |
|---|---|
| `tools/team-followup-20261001/ITEM/ring-png-minimal.patch` | 본편 `_worldItemSkin`의 cutoutSrc 선택 한 줄만 변경하는 미적용 diff |
| `ring-png-candidate.js` | 기존 진단기의 소스 변환을 담당 폴더에 복사·축소. 해당 한 줄과 동일한 후보, 시그니처 변경 시 실패 |
| `ring-png-candidate.test.mjs` | 기존 7검사 사본에 null·ring1/ring2 공유 캐시 2검사 추가. 현행 HTML 함수·상수 추출, ControlledImage와 native Canvas 사용 |
| PNG 선택 | 정규화된 base=ring, el=phys일 때만 `img/ui/item-cutouts/ring_phys_masked.png`. 전역 `_ITEM_CUTOUT_BASES`·DOM 경로·부트 준비 불변 |
| PNG 성공 | 같은 Image 반환, 반복120회 마스크/Canvas 추가0 |
| PNG404 | 기존 phys URL로 동일 Image에서 1회 폴백. 로딩 중 null, 성공 후 기존24/72 마스크1회·Canvas 재사용 |
| 양실패 | 요청2회 후 null, onerror=null, 재시도 루프 없음 |
| 소스 교체 | 실제 img.src와 최초 PNG 절대주소 일치 여부로 Image/Canvas 선택. pending null, load 시 이전 마스크 무효화 |
| 잔여 계약 | 따뜻한 raw 전환 직후 가공 후 늦은 onload가 오면 다시 가공하는 기존 동작 보존. 해결했다고 보고하지 않음 |
| 원화·생산·easy·세이브 | 변경0. PNG 복사·자산 이동·게임/서버/브라우저·빌드·Git 쓰기 실행0 |

목표 런타임 PNG 경로는 아직 존재하지 않는다. 총괄이 채택 후 증거 PNG를 원본 보존 방식으로 별도 추가해야 한다. 현재 diff만 적용하면 의도적으로 404→원래 phys 폴백이므로 최적화 효과는 없다.

## 실제 실행 근거

| 명령 | exit / 결과 |
|---|---|
| `node --test tools/team-followup-20261001/ITEM/ring-png-candidate.test.mjs` | 0 / 9 PASS, 0 FAIL |
| `node --test test/worldItemSkinFallback.test.js test/ringPngDiagnostic.test.js` | 0 / 16 PASS, 0 FAIL |
| `git apply --check tools/team-followup-20261001/ITEM/ring-png-minimal.patch` | 최종0 / 생산 파일에 쓰지 않고 적용 가능성 확인 |
| 최초 zero-context diff의 apply-check | 실패: patch does not apply. 주변4줄 context를 추가해 최종 통과. 실패 시도 보존 |
| `rg -n 'ring_phys\|cutoutSet\|_worldItemSkin\|24/72' docs --glob '*.md'` | 0 / 75행, 전체 검색 결과 `tools/team-followup-20261001/ITEM/docs-related.txt` 보존 |
| `shasum -a 256 game.html game-easy-test.html …/ring_phys_masked.png` | 0 / 아래 SHA 확인 |
| `unzip -l …/evidence.zip`, `unzip -p … plain-summary.json`, `unzip -p … browser-contracts.json` | 0 / 기존 원자료33파일·비대칭 측정과 소스교체 잔여 확인 |

실행 stdout: 새9검사와 기존16검사 모두 fail/cancelled/skipped/todo=0. 기존 테스트16개는 새 후보 전체 회귀16개라고 계산하지 않는다. 신규 후보 테스트9개만 이번 후보를 직접 주입했다.

| 입력 | SHA256 |
|---|---|
| game.html | `593a7a9d84c78402f04c50c94ae169e237e49751ad58d8640e78e672850728f2` |
| game-easy-test.html | `269411143e093319926948dce42740d83617b2a0e1305cc1180a59a6ecb75e58` |
| 증거 PNG | `812b47358d293d3dc2c154ab5989470add22eb3f1bb7f2edf9f78cde16da0a96` (manifest 일치) |

## 채택 근거·보류 사유

기존 원자료의 관측기 없는3쌍에서 요청→최초 draw/_flush **반환** 중앙값9.9→4.9ms. 이는 화면표시·GPU완료가 아니다. 기존경로만 관측한6쌍은 단계 귀속으로 분리하고 성능 주근거로 합산하지 않는다. PNG 최초제출 호출0.6–1.3ms(중앙1.1ms)는 기존 중앙0.2ms보다 증가했다. PNG 제작22.2ms는 사전 일회 제작 비용이며 런타임 부트 개선으로 세지 않는다.

파일52,346→69,119바이트(+16,773/+32.0%). 원본 폴백을 유지하므로 설치 총량은 **69,119바이트 추가**다. Canvas 한 장의 명목262,144바이트가 없어질 수 있으나 실제 CPU/GPU/GC 메모리 절감은 미측정이다. 과거256²/34² RGBA·알파0diff와 월드987회는 이전 root 검수 증거이며 이번 새 실화면 검수가 아니다. 실제GPU/FPS·자연전투97.4ms·PC329ms 해결 미검증.

## 총괄 인계 / 미완료 게이트

1. 목표 PNG를 추가할 때 증거 SHA·256² RGBA8를 대조하고 원본 phys를 보존한다. 다른속성 ring·기존컷아웃·DOM 스킨·쉬운판·부트 준비 확대 금지.
2. QA 단독 구간에서 후보 실제34px 화면·느린PNG pending·PNG404→phys·양404·따뜻한 PNG↔raw·재사용을 확인한다. 사본 테스트의 synthetic pixels는 실제 PNG 알파 재검증을 대체하지 않는다.
3. 관측기 없는 순서교대 동조건 자연 물리반지 드롭의 긴 프레임 p95/p99·첫 draw/read·전체 FPS/GPU 제출을 검증한다. fixture/명시 decode 대기와 자연경로를 분리한다.
4. 실제 R획득·격리 저장 재로드·패키지 자산 포함·PC 회귀 검수 후 생산 채택을 판단한다. GPU완료를 측정하지 않으면 계속 미검증으로 표기한다.
5. 통합 시 ITEM_TEAM_MASTER, Mac-반지-PNG-재사용-진단, 마스터§18.19의 생산미반영 상태를 실제 반영 상태로 정정하고 실제경로·해시·폴백·비용을 표로 동기화한다. 현재는 공유문서 직접 수정 금지이므로 이 결과에 정정 요구를 기록했다.

Git status는 종료 전69경로로100미만. 기존 정규화 차이·타 팀 WIP·인덱스 보존. 커밋/푸시/원격 체크포인트는 배정상 총괄 담당이며 이번 실행에서 완료하지 않았다. 다음 소유권 밖 작업은 실행하지 않고 인계한다.
