# UIUX EXPANDED MINUS LIFETIME — 2026-10-02

확대 카드의 별도 minus 콜백 `_renderSkillRow._skUnclick`에 카드/캡처 grid 수명 guard를 생산 반영한 source 인수 기록이다. 문서 담당의 코드·검사 실행0이며 기존 비용·공식·밸런스·schema·환불·레벨·그룹·슬롯 원문을 보존한다.

| 접점 | source 적용 사실 |
|---|---|
| 실제 파일 / 위치 | `game.html:46434`, `game-easy-test.html:45037` |
| 소유 함수 | `_renderSkillRow(sk,grid)`의 compact-expanded `_skUnclick` |
| 최소 추가 | 첫 문장 `if(!d.isConnected||!grid.contains(d))return;` — 각 HTML +44 UTF-8 bytes |
| source fragment | 2411→2455 bytes; SHA `480040ace294023a3355f50d63532e0d38d696f9cbb4fbc503e0c9a75462ead7`→`3115328bdfa0a73e17aef58741b73e356b4833ae423e89026b3b7c6b15f27092` |
| 포함 판단 | 렌더 때 전달받아 캡처한 grid.contains(d); 추천 행 skWrap일 수도 있음. 현재 전역 #skillGrid를 재조회하지 않음 |
| 기존 common / 심볼 경계 | `_skClick`·`_skMinusClick` guard 보존; 현재 `_rfCards` 심볼0 |

| 기존 정상 source fixture | before→after 관측 | 해석 경계 |
|---|---|---|
| whirlwind ordinary | Lv3→2, SP100→101, 악의80→80 | actual upMat0; 비영 악의 환불/다른 스킬 미검수 |
| formed whirlDet 2성 | 멤버Lv6→5, SP100→102, 악의80→80 | Lv6≥minLv5. 합체 생성 gate 실행0; fused/빈6슬롯/ULT null/activeLMBSk 보존 |
| 무효 수명 wrapper | 은퇴 callback, 분리된 추천 카드 행, 다른 grid로 옮긴 연결 카드의 선택된 ordinary/fused 추가 효과0 | 레벨/환불/renderer/save/SFX sink 기준. wrapper stopPropagation1은 유지 |

| 검수 구분 | source 영수증 관측 |
|---|---|
| 새 생산 접점 회귀 | actual-source16/16 PASS |
| 생산 전 baseline | 16그룹 중8PASS/8FAIL — 수명 guard 부재 반례 이력, 최종 실패 아님 |
| 정상 옛 접점 대조 | guard44B를 제거한 원접점과 양판 ordinary/fused4개의 전체 fixture 상태·trace 동등; main/easy 정상 trace 동등 |
| 구문 | inline JavaScript12/importmap JSON2 통과, sourceworker 각1회. 스크립트 평가/모듈 import0 |
| 기존 검사 | 과거 common2GREEN·역할 raw·이전 root 검사 재실행/합산0 |

정상 fixture의 pickup/addTxt/부분 render/detailHTML/updateSkSlot/updateQS/dbSaveForce sink 각1과 하니스 RNG0는 선택된 source trace다. 실제 오디오 내부 RNG·저장 동작을 인수하지 않는다. stat counter는 부분 재렌더의 `_skDetailHTML` 호출 sink이며 플레이어 스탯/DPS 재계산·실제 표시 검수가 아니다.

실제 source의 collapsed onclick→expanded branch, helper/_bMin wrapper, clear와 추천 행 컨테이너 구성·append 일부를 추출했다. DOM containment/isConnected·P/G/slots·UI/save/SFX/detailHTML은 대역이며 P.lv1000은 합성값이다. 자연 진도 적법성, 전체 panel/category/recommendation/AI·입력·native·gamepad·저장·청취·시각·실게임은 미검수다. 미학습 helper 직접 호출은 합성 계측 경계이며 실제 미학습 UI의 minus 버튼은0이다.

이 guard는 버튼만 제거하거나 카드+캡처 컨테이너를 함께 재부착하는 경우, P/G 교체, hide/pause/epoch·live owner 검사까지 보장하지 않는다. 비용·기획·합체 생성 조건의 변경으로 해결했다고 쓰지 않는다. 실제 runtime/visual/audio/storage/nativeInputAccepted는 false/UNKNOWN이다.

기존3정본의7개 현재형 문장만 actual owner와 captured grid 의미로 교정하고 작은 부록을 추가했다. 과거 common2GREEN/2RED·한 fixture의 수치/당시 source 위치는 이력으로 보존하며 이번16그룹과 합산하지 않는다. [UIUX 정본](UI_UX_IMPROVEMENT_PROJECT_20260930.md), [스킬 정본](../2_1%20스킬관리+합체시스템+자원/2_1%20스킬관리+합체시스템.md), [자원 정본](../2_1%20스킬관리+합체시스템+자원/자원리젠+소모공식.md).

source 영수증 `tmp/mac-migration-runtime/continued-review-20261002/uiux-expanded-minus-backup/receipt.json` SHA `d1cb72a4888e18fde8b11b732d4431edfe9a2af2772aec0af4d4dd1105e912d5`; 새 검사 `test/uiuxExpandedMinusLifetime.test.cjs` SHA `30257b9462d09462b40ce0fe9212b24a144585c4098c95526740c2666da6c1b1`.

main SHA `8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b`; easy SHA `50f9a24bb11d95bd3b88fdd4d826594d4e0aac43d1d1760c6f44ac382e32a057`. sourceworker의 guard 밖 byte 동일·역치환 backup 동일을 인수했고, 문서 담당도 이 최종 pin을 유지했다. 원팀 raw3·보호2_3·타인 WIP를 보존하며 원래 user23 파일 전체 보존의 HEAD 비교는 root 소유 증거를 따른다.

문서 백업·7접점 역치환 원문 byte100%·기존 개행·최종 전수검색 및4문서 SHA는 ignored `tmp/mac-migration-runtime/continued-review-20261002/uiux-expanded-minus-docs-backup/`의 이번 `completion.json`에 기록한다. root CHANGELOG/CONTINUOUS-INTEGRATION/SUPERVISOR/Git/기타정본은 문서 담당 수정0이다.
