# source6 Mac 정상 경로 실플레이 부분 인수 (2026-10-03)

실제 root 격리 앱 `3dd1813f-7e53-4987-acb4-03df340810a5`/3387을 CUA로 실행했다. [앱 생성·물리 핀](MAC_CH1_SOURCE6_CANDIDATE_20261003.md)의 source3과 일치한다. source7 소스 통합 이후에도 앱 내부 파일을 수정하지 않았다.

| 단계 | 실제 관측 | 인수 경계 |
|---|---|---|
| 실행 | root source4 앱 메뉴 Quit→PID48587/3386 listener 종료. source6 정상 `index.html?demo=1` 실행/PID88947/3387 loopback listener | 구앱·profile·save 삭제0, 사용자 게임3333/3340 및 다른 앱 보존 |
| 정상 진입 | 입장 버튼→세계관 영상 Enter다음→데모 입장→빈 정상 로비→새 전사→이름 `맥검수6`→전사 이야기 Enter다음 | 슬롯/레벨/좌표/세이브 상태 주입0 |
| 게임 시작 | 정상 index가 `game.html?test=1&slot=demo&demo=1&story=warrior-v21`로 이동→안내4장→실습1/12→표시된 연습 건너뛰기 | URL의test는 정상로비 생성값이며 직접 시험경로 삽입0. 실습12완료로 계산0 |
| 필드 | Lv1/HP525/525·MP261/261·ST301/301·CH1-1/지역0/32 | `03-normal-field-start.png` |
| 공격 입력 | 좌클릭·E·Space·F 정상입력 후 SLAM표시/최대피해637·스킬쿨·MP411/411·보상변동 | 중간에 일반필드 사망 기록과 재시작 상태가 있으나 제어한 사망→부활 검수는0, 보스사망아님 |
| 후속 전투 | XP0→2/15, 악의988→992, HP516/525→520/525 | CUA실제AX 관측. 전역처치와 원스폰지역에 귀속하는 표시지역0/32는 별개. 개체·전리품획득·장착 완료 미확정 |
| 도구 입력 | 클릭/Enter/스킬 키 전달 성공. 단독Shift API는 modifier-only 오류; 정상shift+w 조합은 전달 | 홀드/keyDown API 없음, 장거리 보행·지속좌클릭을 했다고 주장0 |
| 잠금 | 다음 WASD/획득/인벤 입력 시 CUA가 Maclocked를 명시적으로 반환 | 해당 묶음 실행완료0. 기존 사용자 잠금해제 요청 대기, 자동잠금/권한 설정 변경0 |
| 저장 | 정상 게임이 새 앱 격리save에 공유악의 JSON생성. GET `/api/slots`200/`ok:true,slots:[]` | DEMO 캐릭터 실제저장/재시작 인수0. 구root 공유악의31B SHA불변 |

물리 본편4028973B `1e4591caea739887ce749492db4ea72547292f583fba1f8e4fcafe88071f8bb8`, easy3906420B `17f490d5d5e38b0fac39085578115acd4b35e48263e84dd542b9a2f298e3ccf5`, index342119B `1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7`. 증거는 `tmp/mac-migration-runtime/continued-review-20261003/source6-native-play/`의 `native-start-receipt.json`과01~04PNG다. 다른 일반화면/이전source4/소스fixture를 이 앱 실플레이로 계산하지 않는다.

남은필수: 실제획득·장착,4지역굴/보스방해금, CH1-1 첫보스 사망→기존필드/열린보스방 유지→재도전, 실제청취, 정상저장→앱재실행,8카메라시각인수. 실제실행경로 부분 관측이며 native6전체PASS·GPU첫처치 개선측정PASS가 아니다.

```text
================= MAP PRODUCTION REPORT =================
STAGE: CH1-1 / source6 정상필드 부분관측, geometry 수정0
MASTER
- silhouette / regions / main route / side spaces: 기존source6, 전체인수미실시
OUTER MASS
- LEFT / RIGHT / TOP / SOUTH / major holes: 전체미검수
LARGE
- source assets / composites / overlap / repeated silhouette: 새생성·수정0, 전체미검수
MEDIUM
- connections / remaining holes: 전체미검수
GROUND
- shadow / contamination / structure integration: 정상START 부분노출, 전체미검수
PLAYABLE
- main arenas / travel space / breathing space / threat space: 필드입력·스킬반응만관측
- combat readability: START 부분화면,밀집전투/보스미인수
LANDMARK
- primary / secondary / tertiary: 미인수
CAMERA QA
- START: 부분관측
- EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT: 미인수
TECH QA
- route / collision / pageerror / 404 / seam: 전체미인수
- loading: normalindex→game 완료
- performance: HUD메모리964MB→805MB 관측만,측정개선주장0
FILES
- stage-owned: 변경0
- concurrent touched: source7레벨자원통합은별도생산범위/이앱불변
- unrelated touched:0
VISUAL VERDICT: RETOUCH
========================================================
```
