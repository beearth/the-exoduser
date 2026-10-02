# 캐릭터 입장 취소 후 지연 재입장 차단 — 2026-10-02

현재 index.html의 showCharGate가 예약한1200ms 이동은 로비 수명이 바뀌면 수행하지 않는다. 소스 인수이며 실제 overlay 입력·인증 서비스·저장·앱 시연은 미검수다.

| id / 접점 | 정확 현재 계약 |
|---|---|
| source | index.html 342119B / SHA1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7 |
| showCharGate | :4176 / 726→799B(+73B), SHA95f6006067cbf2903a3ddbff87f2771ebec67b4b89b7d2a8d741955d11823e2d |
| 캡처 | :4177 const request=_characterLoadSeq; 기존 번호 조회만, 증가0. 삽입35B |
| 지연 guard | :4185 if(request!==_characterLoadSeq)return; 이후 기존 location.href. 삽입38B, 타이머1200ms·타이머 취소/재예약0 |
| 기존 무효화 | _goLogin :2675/번호 증가:2681, _goCinematic :2703/증가:2709. 다른 번호 변경의 무효화는 정적 조건이며 모든 lifecycle 동적 PASS가 아니다. |
| 온라인 취소 입구 | 실제 showLobby 생성 lobbyLogout.onclick→signOut 전달 대역→실제 등록 SIGNED_OUT callback(:2865~2874)→전체 _goLogin. 메모리 번호0→1 뒤 옛 이동0 |
| 데모 취소 입구 | 실제 replayCinBtn inline(:718)→전체 _goCinematic. 번호0→1 뒤 옛 이동0. auth 등록은 init의 _testMode return 뒤에 있으므로 데모 오프라인 SIGNED_OUT 실행으로 확대0 |
| demo URL | game.html?test=1&slot=demo&demo=1 |
| local URL | game.html?test=1&slot=encodeURIComponent(charId) |
| online URL | game.html?char=charId&slot=encodeURIComponent(_selectedSlotName||charId) |
| story | storySeen이 truthy일 때 &story=warrior-v21 추가. 기존 URL 표현식·영상·대사·상수 변경0 |
| 데모 저장 | 실제 _demoSlotRead/_demoSyncActiveSave/_demoActivateSlot, hellsave_demo_0~4의5슬롯, hellsave_demo_active·hellsave_demo. 타이머 전에 활성화하므로 취소 뒤 이미 실행된 저장 유지/롤백0 |
| 미발견 슬롯 | 오류 표시·hideLoading·timer0. 실제 선행 sync 쓰기까지0으로 일반화하지 않음 |
| 첫 setItem 예외 | 실제 activation의 hellsave_demo setItem에 주입한 같은 Error 전달/timer0. 새 catch0, native DOM 예외 보고·실저장 오류/원자성은 미검수 |

| 단계 | 증거·구분 |
|---|---|
| 실제 원문 baseline | 새8그룹6PASS/취소2FAIL, fixture 파일0. 당시 원문 기록 보존 |
| 생산 새 회귀 | 8/8 PASS = 정상4+취소2+미발견1+첫 setItemError1. 별도 옛 원문 역치환 대조4의 serializable event/URL/storage/lifecycle trace 동등. 정상4는8 안에 포함 |
| 구문 | index inlineJS4/JSON0,1회 통과. 외부 scripts11은 미검수 |
| 실제/대역 | gate/login/cinematic/showLobby/생성후처리/선택초기화/loading/데모 helper 및 실제 입장 listener·auth callback·다시보기 inline 추출 실행. DOM/style/media/timer/Map 저장/Image/번역/BGM·화면은 대역, 목록 요청은 대역 |
| 제외 | 전체 페이지/init/온라인·로컬 목록 생산자/실제 캐릭터 renderer·story 영상·패드·auth 서비스·사용자 저장/API/schema/실게임/build 인수0 |
| 기존 앱 | c927/dd333 snapshot에 이번 index 변경 미포함. 앱 생성과 실제 연결 플레이 Gate는 기존 보고서대로 별도 |

원팀 공식 완료01a0fc89-7574-7940-893c-4bc7cef1a761의 미적용 후보와 이번 생산 반영을 구분한다. 기존 검사 재실행0. 두 접점 밖 바이트·전체 역치환·원자료·ITEM game2핀 보존은 source 영수증에 있다.

| 근거 | SHA256 |
|---|---|
| test/charGateCancellationAcceptance.test.cjs | 09022056ddd6c0c53a1904ac2753b210e93f4ec57c325e5045fc7d73377bb85a |
| tmp/mac-migration-runtime/continued-review-20261002/char-gate-cancellation-acceptance/final-receipt.json | 8573548814afa0dfcf19cfac1866998b19a999a4644c26615355b534b2ac1fdb |
| source 적용 후 전체 docs 검색 | 191행/33문서, rawSHA05d086f5fcd1bf45d4cbefb5cccce378dc6b4331533046169333c0d8a359b989. 행별 분류와 원문은 char-gate-cancellation-docs-backup에 보존 |

기존 정본3에는 이 지연 수명·저장 예외를 append하고 기존 생성 Promise/슬롯/스킵1200ms/출시 이력은 보존했다. [서사](../11내러티브·로어디자인/11내러티브·로어디자인.md), [출시](13출시·마케팅.md), [저장](../15%20세이브+데이터구조/15%20세이브+데이터구조.md).
추출 source PASS는 실제 입장·native·visual·auth/실저장 PASS를 대신하지 않는다.
