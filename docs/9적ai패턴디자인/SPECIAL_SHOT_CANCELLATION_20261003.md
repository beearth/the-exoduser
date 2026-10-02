# 특수 탄막 스턴·빙결 취소 (2026-10-03 source8)

Claude ENEMY 완료 `de1e281f-c089-4395-b228-cd855ed0fca6`의 최소 후보를 현재 source7에 재기준화해 양판에 반영했다. 문서의 ‘발사 전 스턴/빙결 취소’와 달리 특수 `eShootWind` 예약은 일반 차징 취소 helper에 남아 상태 해제 후 늦게 발사될 수 있었다. `updateE`의 기존 두 취소 분기에서 특수 예약만 함께 제거한다.

| 조건·필드 | 현행 계약 | 적용 위치 |
|---|---|---|
| 스턴 | `e.stunned>0`이고 앞선 피격경직 return을 통과했을 때 기존 일반 차징 취소 뒤 특수 예약 취소 | 양판 `updateE` 스턴 분기 |
| 빙결 | `e._frozen>0`이고 앞선 피격경직/스턴 return을 통과했을 때 기존 일반 차징 취소 뒤 특수 예약 취소 | 양판 `updateE` 빙결 분기 |
| 특수 예약 판별 | `e.s==='eShootWind'`인 경우만 새 처리 | 두 콜사이트의 동일 guard |
| `_swFire` | 기존 발사 callback을 `null`로 폐기. 해제 후 예전 발사 예약 재개 없음 | 특수 취소 guard |
| `_swChargeEl` | 예고 속성 `null`로 폐기 | 특수 취소 guard |
| 상태·타이머 | `e.s='idle'`, `e.st2=0` | 특수 취소 guard. 해제 뒤 기존 idle AI의 새 판단 가능 |
| 일반 차징 | `_cancelProjCharge` 본문 불변. 본편은 T/Col/Bean/ParryClass 초기화, easy는 기존 T/Col/Bean 초기화 유지 | 일반 helper 수정0 |
| 다른 상태 | 특수 guard 미진입: `e.s/st2/_swFire/_swChargeEl`을 새로 변경하지 않음 | 일반 차징 취소만 기존대로 |
| 기존 수치 | 정상 특수 준비60f, 스턴 cap180f, 빙결 `-=sp`와 해제 면역 보스300/일반120f 유지 | 해당 분기 원문 불변 |
| 다른 계약 | 탄 피해/속도/밀도·Q 전용 무지개/E 불가·포이즈·별도 쿨다운/`projT`·어택 티켓·맵/세이브 불변 | 새 수치·구조·정책 추가 없음 |

`_hitStun>0`은 기존 선행 return으로 AI를 건너뛴다. 그 분기에서 새 취소를 수행하는 변경은 없으며, 특수 예약 즉시 취소를 모든 피격경직까지 보장하지 않는다. 스턴/빙결 분기에 실제 도달해야 새 취소가 적용된다. 본편 외부 mainloop는 스턴을 먼저 감소시키고 컬링·AI 티어링으로 `updateE`를 건너뛸 수 있으므로, 취소 분기 도달 전에 스턴이 끝나는 경계도 남는다. 이번 수정은 모든 적·모든 프레임의 스턴 취소를 보장하지 않는다. 상태가 풀리면 예전 예약을 이어 쏘는 대신 기존 idle AI가 새 행동을 결정한다. 새 대기 시간이나 공격 제한은 도입하지 않았다.

| source 핀 | byte / SHA256 |
|---|---|
| 입력 main source7 | 4029344 / `e255bfd27047715105d1dda90bb73f7ed42653391380dcda788dbd245374dae0` |
| 출력 main source8 | 4029496 / `794d29274331d6c2fca1d213e27ccc6e7fe0f7e5ebd2f5edfdb63540b9572842` |
| 입력 easy source7 | 3906611 / `11e0d9a96b4e4412d719787c6aaf353a478b57bdd921da66efcbc6b3de6d5a67` |
| 출력 easy source8 | 3906763 / `2ee66501acee9c4822152987c4904a17d84f742833458381aa234db92212c03d` |
| 본편 `updateE` | `3c4ac262baf503b2da7f0ad46793361305331259d2a709ca24b7ce90f4433fd2` |
| easy `updateE` | `971b69566ac6f448ca58eadeaf9ac7352d7bdb8a322baa1cb641bb17b8dbb1c0` |
| 최소 recipe | `if(e.s==='eShootWind'){e._swFire=null;e._swChargeEl=null;e.s='idle';e.st2=0}` 76B×2콜사이트/각 HTML +152B |
| byte 보존 | 각 앵커1회·전체 역치환 source7 exact. 기존 source7 레벨업·예약투자 함수 및 `applyStats`/일반 취소 helper SHA 불변 |

구문 검수: 양판 전체 실행 inline script12개와 importmap JSON2개 PASS. 신규 지속 회귀 `test/enemySpecialShotCancellationAcceptance.test.cjs` 최종22/22 PASS(양판11개씩, 정상 옛 접점 대조4+옛 취소 누락 재발사 대조4 포함, Node24.15). 현재 전체 `updateE`와 실제 etype42 준비 callback/`eProjAt`/`_emitEnemyShot`/일반 차징 취소·완료 helper를 읽어 실행했다. 첫21PASS/1오류는 easy 일반탄 정상 피해20과 본편 dark25를 같게 기대한 검사 오류이며, 실제 판본 차이를 유지하도록 fixture 기대값만 수리해 1회 재실행했다. 생산 코드 수리나 기존 검사 재실행으로 계산하지 않는다. 최종 시험 경계·횟수·실행 영수증은 `tmp/mac-migration-runtime/continued-review-20261003/root-special-shot-source8/`에 보존한다. 팀의 source6 역사 후보 SHA를 현재 source8 SHA나 새 검사 건수로 대체하지 않는다.

검수 경계: 특수 생산자는 etype42만 실행했다. 외부 mainloop의 stunned/hitStun 감소는 실행하지 않고 복귀 상태를 명시 선택했다. `spawnProj`는 요청 관측 sink이며 실제 pool/전역 속도 정규화/충돌·world/geometry/LOS/flowfield/연출·전체 렌더/음향/저장은 미검수 또는 대역이다. 취소 결과를 실제 게임 전체 프레임·모든 특수 etype 검수로 확대하지 않는다.

실제 Mac 실행 앱은 source6/port3387이며 source8를 덮어쓰지 않았다. 실제 공격 예고/취소 렌더·발사·청취와 CH1 보스 사망/부활 보존은 별도 미검수다. 현재 Mac 잠금으로 native 입력이 중단되어 있다.
