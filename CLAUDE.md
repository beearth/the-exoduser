# CLAUDE.md — EXODUSER: HELL LORD

이 파일은 매 턴 컨텍스트에 실린다. 핵심만 둔다. 원문 전체와 상세 규칙은 `docs/CLAUDE_RULES_DETAIL.md`에 있고, 해당 작업을 할 때 필요한 절만 부분 읽기한다. 메모리(`MEMORY.md`)도 작업 시작 때 함께 확인한다.

## 토큰 절약 (기본값)

- `game.html`(약 4MB)은 통째로 읽지 않는다. `Grep`으로 위치를 찾고 `offset`/`limit`로 필요한 구간만 읽는다.
- docs 대형 문서(마스터 바이블 등)도 부분 읽기. 저장소 전체 재귀 검색 대신 경로를 좁힌다.
- 서브에이전트·병렬 위임은 사용자가 요청할 때만 쓴다.

## 모델

- 기본 model은 `claude-opus-5-5`. 임의로 하위 모델로 낮추지 않는다. 설정값만 보고 실제 응답 모델이 바뀌었다고 주장하지 않는다. (상세: DETAIL §모델 기준)

## 실행·빌드

- 서버: `cd G:\exoduser` 후 `& "C:\nvm4w\nodejs\node.exe" server.cjs` (포트 3333, `/api/slots` 포함). 맨 `node`는 깨진 shim이 잡히므로 전체 경로를 쓴다. python http.server 금지(API 404).
- 데모/정식 구분은 `build-target.js`의 `window.EXODUSER_BUILD_TARGET`. 웹 기본값은 데모, `?bic`은 BIC 부스 모드.
- PC 패키지: `node build-nwjs.mjs --target=full|demo --build-id=YYYYMMDD-HHMMSS`. 버전은 `release-version.json` 하나가 기준.
- Steam 업데이트: 하루 최대 1회, 패치노트 한·영 필수, Set Live와 게시는 사용자 확인 후. 상세: `docs/13출시·마케팅/STEAM_UPDATE_RULES.md`
- 예전 `G:\exoduser-DEMO`/`G:\exoduser-ea` 수동 복사·sed 동기화는 구 방식이다. 사용자가 지시할 때만 한다. (DETAIL §배포 전 필수)

## Git (절대 규칙)

- `git add -A` 금지. 자기 소유 경로만 `git add --`로 스테이징하고, 코드와 관련 docs를 한 커밋에 넣는다.
- 타 세션 WIP와 untracked 파일은 읽지도, 쓰지도, 스테이징하지도 않는다.
- push된 history는 재작성하지 않는다(reset/rebase/force-push 금지). 잘못 묶인 커밋은 provenance note로 기록한다.
- Git 반영만으로 이미 열린 실행본이나 서버가 갱신됐다고 보고하지 않는다. 사용자 창·서버를 자동 재시작하지 않는다.
- auto-sync cron이 `git add -A`로 커밋하므로 장시간 작업은 별도 브랜치나 worktree에서 한다. (DETAIL §동시 세션)

## 품질 (절대 규칙)

- "동작한다"는 완료가 아니다. 기능 동작, 디자인 톤 일치, 1x 실크기 가독성을 실제 스크린샷으로 확인해야 "완료"다. 디자인을 확인하지 못했으면 "기능만 완료, 디자인 미검수"라고 쓴다.
- 화면에 보이는 것을 만들기 전에 `docs/3.1 ui hud 디자인/UI_FOUNDATION_20260924.md`와 `UI_COMPOSITION_20260925.md`를 읽는다. 폰트는 게임 토큰(`--font-hell` 등)만 쓰고, 이모지 아이콘은 금지.
- 캔버스 외곽선은 `strokeText` 대신 fillText 오프셋으로 그린다(GPU 프록시 문제).
- AI 이미지: 캐릭터 DESIGN LOCK 사양을 그대로 쓰고, 점·디더링은 절대 금지. 기본 서비스는 MagicLight. (DETAIL §작업물 퀄리티 7~9)

## docs 동기화 (절대 규칙)

- docs/는 source of truth다. 코드를 바꾸면 관련 docs의 수치·이름·상수를 코드값과 100% 맞추고, 같은 커밋에 넣는다.
- 작업별로 읽고 갱신할 문서는 DETAIL §작업별 필수 문서 표를 따른다. 돌진·패링·방패 docs는 수정 금지.
- docs 검색은 관련 폴더부터 좁혀서 한다.

## DOM 안전

- 부모 컨테이너에 `textContent`/`innerHTML`을 대입하지 않는다. 교체 대상은 리프 노드나 특정 id/class만.

## 번역

- 게임에 표시되는 텍스트를 하나라도 추가하면 `docs/16번역·로컬라이제이션/번역대상_전체목록.md`에 번호를 붙여 등록하고, `_EN`과 `lang_*.js` 전체(27개)에 전파한다. 리스트 없이 번역을 시작하지 않는다. (DETAIL §번역·다국어)

## 게임 규칙 요약

- eShield: HP와 같은 추가 HP바. 모든 DR을 적용한 뒤 쉴드→HP 순서로 분배한다. DOT 제외, 단 `shieldHit:true`면 적용.
- 기검참: 7/7/7 콤보 승수에 `_skMul`(b:2.0)을 곱해 실제 14/14/14.

## 기타

- 원격 브라우저 작업은 Mac Chrome "Browser 2"로 한다. 대리 로그인 금지.
- docs 폴더 색인과 원문 규칙 전체: `docs/CLAUDE_RULES_DETAIL.md`
