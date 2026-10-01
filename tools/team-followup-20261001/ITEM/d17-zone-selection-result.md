# U-D17 비활성 순수 선택 후보 인계

완료 UTC: 2026-10-01T16:30:21Z (실제 date 명령). 생산 적용0. Node 24그룹 PASS. 게임/브라우저/서버/빌드/Git/queue 실행0, 사용자 탭 접근0.

## 실제 계약과 API

`d17-zone-selection-candidate.mjs`의 `selectD17Zones`는 기본 disabled, proposal/runtimeReady=false. 명시적 검토 입력 enabled:true에서만 새 배열/선택 객체의 x/y 복사본을 반환한다. 원본 장판/배열/이벤트/시전 기록 변경0. 반환값은 생산 G에 연결하지 않았다.

| 항목 | 후보 계약 |
|---|---|
| 종료 사건 | kind:black-end, sourceId:blackStar, castId, x/y; 실제 fireBlackStar의 성공 가드 뒤 중심 P._bsX/P._bsY를 root adapter가 전달해야 함 |
| 저장값 | 정수1/2/3만; 누락·문자열·분수·범위초과 거부, RNG/임의 보충0 |
| 선택 | 중심 반경600px 포함, 살아있는 spikeTrap/storm 및 follow:false fireAura만 |
| 제외 | holyDome/shockField/boneStorm/기타 타입/추적형/만료/비유한 좌표/미확정 출처/보스 |
| 출처 | playerZones는 **이동 허용 출처가 독립 확인된 객체 참조 목록**. 전체 G 배열을 무조건 전달하면 안 됨. bossZones 제외가 우선 |
| 제한 | 동일 객체 중복1개, 저장롤 상한, 최근 처리 castId 재입력 거부. 유효 사건의 빈 스캔도 소비 |
| 보존 | t/maxT/dmg/el/lv/r 및 모든 enumerable 비좌표 필드, _tickCd/_faFr와 중첩 상태 참조 동일. 적별 틱/캡 객체는 접근0 |
| 우선순위 | 거리 가까운 순, 동률 원배열 순. 이는 SSOT에 명시되지 않은 검토 선택안이지 채택 정책 아님 |

root 소비 형식: selectD17Zones({enabled,event,storedRoll,zones,playerZones,bossZones,processedCastIds}) → {status,zones,moved,processedCastIds}. 시전 기록은 caller가 성공 반환 후 보관해야 한다. 후보에 전역 상태/자동 훅/장착 판정 없음. caller는 맵 종료 시 기록 수명 정리와 실제 저장 계약의 검증된 U-D17 값을 전달해야 한다.

## 실제 원문 검수

`game.html:45262` fireBlackStar는 casting 가드, 종료 처리, 중심 P._bsX/Y, 쿨7200 기반이며 자체 피해 호출 없음. 실제 MP30% 입력 경로도 읽기 확인. 해당 코드는 수정하지 않았다. 장판 생성 literal 9개를 AST 추출하고 합성 수치 의존성만 VM 공급했다. 실제 게임 전체 실행이나 실제 적 틱 재생은 하지 않았다.

원함수 SHA/행번호와 literal 원문/SHA는 evidence.json에 고정. game SHA `7631f5a083672124624e0b8dc22b0716d10c8815dbb1e6aee98a5e2e51299993`. fireBlackStar SHA `11fd34ebf4a12ef9957203d93e2aff9245b9009a9f086fe641ffd027054c5824`. 함수 기준 SHA가 다르면 root 적용 전 재대조 필요.

검사: 기본 비활성, 롤1~3/무효8종, 실제7타입·follow, 보스 우선제외/출처 미확정,600경계,거리동률,수명/좌표,객체중복,시전중복/빈스캔,잘못된사건,모든 비좌표 상태 및 원본 보존,RNG0. 재실행: `node tools/team-followup-20261001/ITEM/d17-zone-selection-check.mjs`.

최초 검사는 shockField 의존 _thPts 등 누락으로 실패했다. 합성 의존 데이터만 보충 후 통과했으며, 최종 literal 추출 실패0. 생산 함수를 모사 재작성하지 않았다. fixture 좌표/경과시간은 경계 검사를 위해 합성 변경하며 실제 세이브 접근0.

## 남은 게이트 / 공유 문서 변경 제안

- 현 장판 object에 보편적인 소유·보스 태그가 없으므로 실제 플레이어 출처 목록 공급은 root의 미구현 adapter 게이트. 가짜 boss 플래그를 현행 필드로 주장하지 않음.
- U-D13 자식 덫 이동 정책은 미결. playerZones에 자식/미확정 출처를 넣지 않아야 함. 실제 _pillarSpike 합체 literal을 추출했지만 자식 정책과 동일시하지 않음.
- immutable 복사본은 외부 zone identity 참조 연결에 영향을 줄 수 있음. 생산 적용 여부/제자리 좌표 adapter는 root 검토 대상. 이 후보는 일반 현행 enumerable plain object 대상이며 getter/비열거 필드/특수 prototype 보존을 보장하지 않음.
- 적별 틱·겹침 피해는 상태 필드 변경0만 증명. 실전 중첩 DPS/최종 게임효과 검수는 UNKNOWN. 생산활성/드롭/경제/효과 채택0.
- docs 전체 rg로 U-D17/장판 수렴 관련7문서 확인. 공유 수정0. 제안: TOP8 리뷰에 출처 확인 목록·시전 기록 caller 계약·검토 거리순 정책·미연결 상태를 추가하고 오래된 함수 행번호는 root SHA 대조 후 갱신. 현재 D절600px/롤1~3/추적 제외 계약 변경 없음.
