# CH3-04 — si12 원본·독립 소비자

## 1. CH3-03 source-node provenance 실패 판정과 선행 수정

**main6d의 동일 선재 실패로 분류하지 않는다. CH3 체인의 검사 결함으로 판정해 si12 구현 전에 수정했다.** `6d987cb8a31d0aadd2b6a8cf1e9a781d1fb76d4d`에는 `test/fdgCh3Stage10Source.test.mjs`와 `godot/data/ch3_map_source/si10.json` 자체가 없다. 따라서 main6d에서 같은 suite가 1실패한다고 주장할 수 없다. 두 `git show`의 exit128·경로 부재는 OUT/main-presence-*에 보존했다.

CH3-03 `8366ba8de03a7e1adfddecd9291439f106eb7a24` 체인에서 기존 검사를 실제 재현하면 11건 중10통과/1실패다(`provenance-before`). 실패는 snapshot의 기록 `source.main_sha=0119f304`와 현재 ref의 SHA를 내용과 함께 직접 비교했기 때문이다. 원 `game.html`은 두 기록 커밋·main6d·작업 시작 최신main 모두 SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`로 동일하다. 원문 gameplay 데이터 회귀와 구분한다.

사용자 지시에 따라 CH3 소유 테스트만 먼저 고쳤다. 두 기록 main commit의 실제 game bytes를 읽어 snapshot의 선언 SHA 및 서로의 SHA가 모두 같은지 먼저 단정하고, 그 후 main_sha와 기존에 허용하던 extraction_head만 정규화한다. 나머지 전필드·타일·배치·굴·자산·undefined 증거 비교는 그대로다. 가짜 SHA를 양쪽에 함께 넣어도 거절하고 타일 차이가 정규화로 숨겨지지 않는 음성검사를 추가했다. artifact·게임 원본·공용 코드 수정0이다.

수정 후 `provenance-fixed`: **12통과/0실패/0SKIP**, exit0. 기존11개가 전부 통과했고 추가 음성검사1개도 통과했다. 이 수정은 si12 구현 전 별도 정상 커밋으로 보존한다. 최종 제출은 이 커밋을 포함한 자기 CH3-04 branch만 push한다. 원로그 `~/exoduser-wt/_out/ch3-04/`.

## 2. si12 진행 상태

의존은 사용자 지정 CH3-03 `8366ba8de03a7e1adfddecd9291439f106eb7a24`. 독립 소비자 구현·검수 결과는 선행 수정 후 이 절 아래에 기록한다. 현재 이 문서의 선행 수정 시점에는 si12를 구현했다고 주장하지 않는다.
