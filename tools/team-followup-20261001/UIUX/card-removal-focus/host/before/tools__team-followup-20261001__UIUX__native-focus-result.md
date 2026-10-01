# UIUX-20261002-NATIVE-FOCUS 인계

## 범위와 기록
- 기존 UIUX 세션 한 건. 담당 MD·AGENTS·DOM 보존 규칙을 먼저 읽었다. 처음 소유 prefix에는 task.md만 있어 동일 제출 중복 없음.
- 첫 실제 Read/명령: 2026-10-01T16:11:10Z. 첫 코드 Edit: 2026-10-01T16:13:13Z(생성기 birthtime UTC). 최종 검사: 2026-10-01T16:15:40Z. 완료 UTC·최종 SHA는 receipt와 final-hashes에 기록한다.
- 기존 focus/DOM 후보·패치·host 등 10파일을 `native-focus/before/`에 byte 보존하고 원본과 SHA 재대조했다. 원파일·생산·공유 docs·Git·queue 수정 없음. 브라우저·게임·서버·빌드·새 세션·에이전트 실행 없음.

## 재기반과 원문 근거
| 대상 | 현재 전체 SHA256 | 함수 원문 대조 | 재기반 결과 |
|---|---|---|---|
| game.html | 7631f5a083672124624e0b8dc22b0716d10c8815dbb1e6aee98a5e2e51299993 | 10개 기존 SHA와 동일 | baseline/candidate 추출 합본 모두 기존 원문 동일 |
| game-easy-test.html | 7d68b80afab131562266c39ea7d5631716d12861dbe7e7e2e4477550c15ec6a4 | 9개 기존 SHA와 동일 | baseline/candidate 추출 합본 모두 기존 원문 동일 |
| inventory-space.css | dc6f6f4e6db2cbe8f7c94093427f6d28695184081c42f2033cb0f22d0876e650 | 실제 파일 읽음 | root CSS 토글 경로 연결 |

전체 파일 SHA 변화는 인벤토리 결함의 근거로 사용하지 않는다. 함수별 이름·1-based 줄·이전/현재 SHA는 `native-focus-manifest.json`, 정확 원문은 `native-focus/current-function-text.json`에 남겼다. 기존 두 factory를 읽기 전용 import하여 현재 소스로 focus 단독 및 DOM 합본 패치 각 2개를 재생성했다. 패치들은 미적용 상태다.

## 실제 제출
- `native-focus/host.html` → `controller.js` → `harness.js` / `source-data.js`: 브라우저 전이체인 전체가 로컬 `.js`이며 `.mjs`·Node·CDN import 없음.
- 현행 server.cjs 선언은 `.js` application/javascript, `.css` text/css이고 `.mjs`는 기본 application/octet-stream이다. 기존 서버 정적 파일 HEAD 5건은 fetch failed로 실제 HTTP MIME 미검수(`native-focus-http.json`). 서버 재시작·게임 요청은 하지 않았다.
- `.pbox` 구조를 보강하여 실제 CSS의 `#invPanel.panel[data-inventory-page=equipment] .pbox #invRight`와 연결했다. 기본 CSS link는 disabled이고 href도 없어 CSS 요청 없음. 토글 시 실제 `inventory-space.css`만 연결/해제한다. CSS에는 로컬 PNG 참조가 있어 연결 후 해당 에셋 요청은 가능하다.
- baseline/candidate, 본편/easy, KO/EN 전환과 hover 종료·재렌더·fixture 아이템 삭제·닫기/재열기를 제공한다. 장착/해제/분해 등 원 renderer의 inline 데이터 액션과 contextmenu는 capture 단계에서 차단한다. fixture 변경 외 게임 저장/데이터 연결 없음. 새 부모 textContent/innerHTML 전체교체는 추가하지 않았다.
- CSS의 visibility:visible!important는 baseline inline hidden을 가릴 수 있다. 상태에는 inline/computed visibility를 별도 표시하므로 CSS 미연결/연결을 반드시 나눠 비교해야 한다.

## 검수와 남은 게이트
`node --test tools/team-followup-20261001/UIUX/native-focus.test.mjs`: **12 PASS / 0 FAIL**. 새 controller/harness/generator 문법 검사 통과. 함수 원문 19개·before 10개·전이 import·CSS 경로/기본 미연결·실제 추출 render/hover/키보드/재구성/삭제/닫기 연결을 검사했다. 검사는 Node DOM 대역과 정적 계약이며 native DOM/실화면/패드 PASS가 아니다. Tab 기본 이동은 preventDefault 미호출 계약만 검사했고 OS의 실제 Tab 이동은 미검수다.

root 검수 경로: 기존 3340의 `/tools/team-followup-20261001/UIUX/native-focus/host.html`. 본편/easy × baseline/candidate × KO/EN × CSS off/on 16조건에서 실제 import/MIME, Tab/Enter/Space, repeat·수정키·중복, hover 종료, 행동 버튼 초점 후 재렌더/삭제, 닫기 opener·재열기, 숨긴 상세 초점 배제와 computed style을 확인한다. CSS·레이아웃·픽셀·실제 패드·생산 적용은 **UNKNOWN / root 결정 대기**다. 사용자 게임 탭은 건드리지 않았다.

## docs 반영안
docs 전체 키워드 검색 결과는 `native-focus-doc-matches.txt`에 보존했다(UI-04, _invClearHover, inventory-space.css, DOM 조작, 초점). 공유 문서는 수정하지 않았다. 승인 반영 시 UI-04에 함수별 SHA 재기반/독립 host 인수와 native CSS·키보드 미검수 게이트를 분리해 기록할 것을 제안한다. 본 제출로 생산 구현 완료 상태를 변경하지 않는다. 다음 범위는 시작하지 않고 root에 인계한다.
