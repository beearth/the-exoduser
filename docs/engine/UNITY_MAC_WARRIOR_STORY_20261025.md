# Mac 신규 전사 이야기 — 2026-10-25

캐릭터 슬롯 저장 단위 완료 뒤 승인된 다음 원본 흐름을 연결한다. 원본 character-story-player.js와 index.html _afterCharacterCreated/showCharGate를 대조했다. 생성 저장 성공 후에만 한 번 재생하고 영상 종료/스킵 뒤 같은 이름으로1.2초 입장 화면을 거쳐 새 미리보기 전투에 진입한다. 기존 전체 전투 세이브나 storySeen 영구 flag를 만들지 않는다.

## 원본 계약과 자산

- 원본 warrior_story_v23_clean.mp4 97,796,468B, SHA256277fbe09c4f5c0b70a98aae6376a8d820a7377cbd6f96a3bc62365cf0a166b34. 인코딩·영상 변경0. Git-backed30MiB4분할 및 restore-warrior-story.cjs로 동일 바이트 복구한다.
- 기존 지원 담당의 warrior_story.json을 동일 바이트 인수했다.22cut·29언어×22자막=638. 원본 VTT start/end/text와 언어를 보존한다. 지원 원본 해시/구조 검수는 unity/Tools/warrior-story에 기록했다. 다른 언어 글꼴·RTL 전체 검수 완료를 뜻하지 않는다.
- Enter/오른쪽/Space 첫 누름: 현재 video time+.05보다 큰 다음cut. 마지막 뒤에는완료. Space/Esc1.2초hold, 겹친 입력 출처 중 마지막 해제 때 초기화, focus 이탈 시 모두 취소.
-3초 이후 안내는0.4초fade, 뒤로seek해도 재표시하지 않는다. 일반 키·포인터가 영상 뒤 로비로 전파되지 않도록모달소유 유지.
- 자연 종료/스킵은 session seen=true. 재생 실패는원본처럼seen=false 상태로입장하며 실패 안내를 표시한다. 영상 실패가 생성 재시도·중복 슬롯을 만들지 않는다.
- 로비복귀/replay/다른 부팅은 지연 입장을 취소한다. 입장직전 선택 인덱스와 이름을 다시 대조한다. 생성에 쓴 Enter는 해제 전영상 다음대사로 전파하지 않고, 입장시마우스 공격도버튼해제까지차단한다.

## 검수 범위

새순수모델은원본22cut경계/epsilon·입력출처중첩·focus·지연입장취소·실패seen차이를검사한다. 기존슬롯저장16/삭제9 등통과군은반복하지않는다. 새story fixture만정상저장에접근하지않는메모리목록으로원본영상실제재생·자막·1.2초스킵·자연완주·파일없는실패·동일이름입장·취소를검수한다. 현재코드연결완료,빌드/실행검수는진행중이다.
