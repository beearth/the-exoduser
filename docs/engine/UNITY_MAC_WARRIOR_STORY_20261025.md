# Mac 신규 전사 이야기 — 2026-10-25

2026-10-27 QA 전용 의미 프레임으로 실제 `NativeLobby`의 전사 Next·짧은 hold 해제·1.2초 완료와 안내/필드 연결을 검수했다. [16/16 영수증·검토 앱·물리 패드 HOLD](UNITY_MAC_FRONTEND_PAD_INTEGRATED_QA_20261027.md).

## 2026-10-27 기존 네이티브 패드 입력의 전사 이야기 연결

`FrontendPadPolicy`는 Unity 입력 번호를 직접 해석하지 않는 순수 프레임 정책이다. `NativeLobby`가 현재 프로젝트의 Submit/Confirm(버튼 0), Cancel(버튼 1), 기존 Start 처리(버튼 7/9)를 읽어 전달한다. 웹 원본의 추가 Next 버튼 2/3을 새 물리 매핑으로 추정해 연결하지 않았다.

| 화면·입력 ID | 적용 위치 | 동작·수치 | 범위 |
|---|---|---|---|
| 전사 이야기 Confirm Down | `NativeLobby.CharacterStory` → `NextCharacterStory` | 한 edge에 다음 cut 1회, 마지막 cut 뒤 기존 완료 경로 | 버튼 0 기존 매핑만 |
| 전사 이야기 Cancel 또는 Start Held | `FrontendPadPolicy.Hold` → `WarriorStoryState.SetHeld("pad-skip")` | 기존 1.2초 hold, 해제·focus 이탈 시 0부터 재시작 | 버튼 1 및 기존 Start 7/9만 |
| 진입·씬 전환·focus | `FrontendPadPolicy.Reset`/release fence | 눌린 버튼은 모두 해제되기 전 Next/Skip 0회; 프레임 번호당 판정 1회 | 캐릭터 저장·영상·컷·게이트 변경 없음 |

순수 논리 Editor 검사 20/20은 프레임 중복, release/focus/씬 전환 fence, 1.2초 미만/초과 hold를 확인했다. Unity 6000.6.7f1 ARM64 Settings QA 빌드 1회 오류 0. **실제 OS 패드 입력과 모든 기종의 버튼 표기·웹 버튼 2/3 동등성은 미검수/HOLD**다. 기존 키보드·포인터와 로스터·미디어는 변경하지 않았다.

2026-10-27 일반 생성 → 정본 영상 자연완주 → 네메시아 입장 시네마틱 → 시작 안내 1/4의 실제 키보드 QA는 [별도 시간표와 화면 증거](UNITY_MAC_WARRIOR_NATURAL_QA_20261027.md)에 기록했다. 네메시아 첫 대사는 영상 정지가 아니며 입력 대기다. 제품 코드 최종 변경 없이 PASS, 이번 청각 검수는 HOLD다.

## 2026-10-27 A04 생성 뒤 외형별 이야기 분기

PC 후보 `08af46705af26291d9d5add4904ad82a268142c1`의 `NativeLobby.Characters.cs` 한 줄을 Mac에 인수했다. `CreateCharacter()`는 기존대로 `TryCreate`와 `CommitCharacters`가 성공한 뒤 선택 표시·생성창 닫기를 수행하며, 그 뒤 `characterVisual==0`일 때만 `BeginCreatedCharacterStory()`를 호출한다. 원본 `index.html` `_afterCharacterCreated(name, visualIdx)`의 외형 0 분기와 일치한다.

| 외형 인덱스·한글명 | 현재 일반 UI/로스터 | 저장 성공 뒤 Mac 호출 | 이야기·자동 입장 |
|---|---|---|---|
| 0 전사 | 생성 허용 | `BeginCreatedCharacterStory()` 1회 | 기존 전사 영상·입장 경로 유지 |
| 1 실버테일 | `ConfirmCharacterVisual`·`CharacterRoster.Validate`에서 잠김 | 해당 호출 0회 | 0회; 미래 생성 허용 시 로비에 남음 |
| 2 헬거너 | 위와 같음 | 0회 | 0회; 미래 생성 허용 시 로비에 남음 |
| 3 트랜스뮤터 | 위와 같음 | 0회 | 0회; 미래 생성 허용 시 로비에 남음 |
| 4 창마법사 | 위와 같음 | 0회 | 0회; 미래 생성 허용 시 로비에 남음 |
| 생성·저장 실패 | 기존 오류 반환 | 0회 | 0회 |

PC 추출 메서드 검사는 수정 전 RED(외형 1의 이야기·입장 1/1), 수정 후 6/6 GREEN이었다. 이 검사는 잠긴 외형 1–4의 제품 UI 재현이 아니다. Mac에서는 수정 전 소스를 별도 `_out/UNITY-MAC-A04-STORY-GUARD-20261027/before/`에 백업했고 수정 전·후 SHA256은 각각 `ac46fafc5a48b5123b0dbafa5e560249ae42b8af714e0af291c6d708eb2da7d6`, `2a614ea20fbe3302bfa6479b1ca589d2d4124eb6d9ae04953d74e316add8bd22`다. Unity 6000.6.7f1 Mac Editor `-batchmode -nographics -quit` import·컴파일 1회는 종료0, C# 오류·경고0이며 기존 `NativeCharacterPresentationPlayback.Video` UAC1001만 로그에 2회 기록됐다. 로그는 `_out/UNITY-MAC-A04-STORY-GUARD-20261027/compile.log`에 있다. Unity가 자동 재작성한 기존 `.meta` 411개와 신규 1개는 변경 patch·사본을 `_out`에 백업하고 원래 바이트로 복원했다. 로스터/save·영상·다른 Runtime/Resources 제품 변경은 없다. 아래 2026-10-25 Player 합격 기록은 당시 소스의 전사 정상 경로 기록이며 이 한 줄의 새 Player 검수가 아니다.

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


## 원본 계약 인수와 첫 실행 검수

[지원 원본 계약](UNITY_WARRIOR_STORY_SOURCE_20261025.md)을 인수했다. native는 기존 focus 시 영상 일시정지 정책을 유지하며, 원본 JS의 blur=hold취소와 구분한다. 원본과 같은 실패 후 자동진입에1.2초 실패문구만 표시한다. 2026-10-25 당시 구현은 키보드/마우스만이었다. 위 2026-10-27 후속에서 기존 Confirm/Cancel/Start 논리 연결을 추가했지만 실제 OS 패드와29언어글꼴/RTL은 미검수다.

소스 b45d7af0f42f9f1ce3d0516bd4a414b09b9cb856 ARM64빌드 오류0/1,533,203,669B. 모델41/41, 실제Player skip15/15·missing-video7/7 통과. 원본 첫자막·다음cue·hold해제/focus취소·gate·동일이름진입·중복슬롯없음·로비복귀시늦은진입취소를 확인했다. 자연완주 검수는 이어서 진행한다. AVFoundation은 원본 영상의 color primaries fallback 경고를 남겼으며 영상을 재인코딩하지 않았다. 색상 완전동등성을 주장하지 않는다.


## 최종 인수

자연완주8/8도 종료0으로 통과해 실제 Player3프로세스 총30/30이다. 자연재생은50초 중간 화면과 끝난 뒤 같은 이름의 플레이 화면까지 확인했다. 첫 자막·입장화면·플레이 화면을720p, 직접 키 입력은1080p로 확인했다.

기존 격리 character-store-smoke-d04230fd4 폴더로 실제키 검수를 했다. N→Enter→한글붙여넣기 이야기검수→Enter1.6초에도 첫대사 유지, Esc0.5초는 미스킵, Esc3초는 스킵+1.2초gate 뒤 같은 이름의 플레이 진입과 일시정지 입력 누출0을 확인했다. 디스크 revision5→6/목록1개/선택0이므로 생성·스토리·입장 중 저장은한번이다. 정상 사용자목록에는쓰기0, 검수 앱은 종료0. IME직접조합은 별도다.

한글 실행파일 경로를 NFD로 CLI호출한 뒤 CUA 전체app경로로붙이면 이번에는같은PID32788에연결되어중복실행없이격리검수가가능했다. 이전NFC호출PID32780은검수자료만읽은뒤종료했고제품코드/시스템설정변경으로우회하지않았다.

[검수 영수증](UNITY_MAC_WARRIOR_STORY_20261025.json). 실행본: `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-LOBBY-20261025/build-warrior-story/EXODUSER-Unity.app`. 캐릭터생성·목록저장→원본전사이야기→동일이름의미리보기진입단위완료. 전체게임이식·전투저장·패드·29언어폰트/RTL·전체화면은완료주장범위밖이다. 다음남은메뉴단위는일시정지/설정의키보드조작과메뉴간focus복귀다.
