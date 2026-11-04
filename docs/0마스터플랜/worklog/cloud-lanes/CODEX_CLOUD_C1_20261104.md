# Codex 클라우드 레인 C1 — combo4 병합 후속 docs 2건 (구현 레인)

- 배정: 클라우드 CTO. 공용 작업표 `docs/0마스터플랜/worklog/cloud-lanes/LANES_CLOUD.md`. 너는 **구현 레인**이다. PC·I: 드라이브·Unity·다른 세션에는 닿지 않으니 그런 일은 하지 않는다.
- 먼저 `CLAUDE.md`를 읽는다(규칙 정본). 금지: `git add -A`, force·reset·rebase·stash, gc·repack·prune, `--no-verify`, Core(`unity/Assets/Exoduser/Runtime/Core`) 수정, 코드 수정, python(node 사용).
- 브랜치: `codex/unity-cloud-c1-postmerge-docs-20261104` — **`origin/claude/unity-pc-candidate-combo4-20261104`(a8618d9bf)에서 시작**한다. combo4는 병합 대기 5개 브랜치의 합과 코드가 같다(클라우드 L1 확인). 병합은 CTO가 한다. unity/main·main에 push하지 않는다.

## 할 일 (docs만)
1. `docs/16번역·로컬라이제이션/번역대상_전체목록.md`: 감사 표에 남은 "4274~4287 미반영"을 실제 상태와 맞춘다(행 4274~4287의 현재 등록·번역 상태를 확인해 표기). **CRLF 파일 — 줄 끝 보존**(파일별 줄 단위 CR 개수를 수정 전후 비교).
2. `docs/15 세이브+데이터구조/`: options-wave2가 추가한 설정 파일 `lang` 키와 프리셋 구조를 코드(설정 저장·로드 코드, 파일:줄 근거) 그대로 문서화. 옛 설정 파일 호환(키 없을 때 기본값)도 적는다.
3. `docs/CHANGELOG_SYNC.md`에 절 1개 추가(CRLF 보존).
4. 결과 문서 `docs/0마스터플랜/worklog/cloud-lanes/C1-postmerge-docs_20261104.md`: 바꾼 파일·줄, 근거 코드 파일:줄, CR 개수 전후.

## 커밋·보고
- `git add -- <경로>`, `git commit -- <경로…>`. 커밋 끝 `Co-Authored-By: Codex <noreply@openai.com>`. push 뒤 `git ls-remote`로 원격 SHA 대조.
- 같은 검사 2회 실패면 멈추고 보고. 하지 않은 확인을 성공으로 쓰지 않는다.
- 마지막 보고(한국어 3~5줄): 브랜치·SHA·바꾼 것·미확인 항목. 이 SHA를 Claude 독립 검수가 본다.
