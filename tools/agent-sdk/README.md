# Agent SDK 대화창 (Console API 크레딧용)

Console의 프로모션 크레딧은 적용 대상이 Agent SDK·API·배치 API·Playground·관리형 에이전트이고, Claude Code 로그인 사용분에는 적용되지 않는다. 이 도구는 같은 Claude Code 엔진을 Agent SDK로 돌려서 그 크레딧으로 개발 작업을 하기 위한 것이다.

## 실행

1. Console에서 API 키를 만든다.
2. `tools\agent-sdk\run.bat`를 더블클릭한다. 처음 한 번은 설치 때문에 1~2분 걸린다.
3. API 키를 붙여 넣고, `요청>`에 할 일을 입력한다.

## 동작

| 항목 | 값 |
|---|---|
| 작업 폴더 | 저장소 루트. `CLAUDE.md`를 읽는다 |
| 모델 | `claude-opus-5-5` (환경변수 `EXO_MODEL`로 변경) |
| 질문당 비용 상한 | $3, 클라이언트 추정치 (환경변수 `EXO_BUDGET_USD`로 변경) |
| 권한 | 파일 읽기·수정은 자동, 명령 실행(Bash)은 막힘 |
| 대화 | 한 실행 안에서는 앞 대화를 기억한다. 창을 닫으면 끝 |

- API 키는 파일에 저장하지 않는다. 매번 붙여 넣거나, `setx ANTHROPIC_API_KEY "키"`로 PC에 등록한다(등록 후 새 창부터 적용). 키를 저장소에 커밋하지 않는다.
- 화면에 나오는 비용은 추정치다. 실제 차감액과 크레딧 적용 여부는 Console의 청구 화면에서 확인한다.
- `.venv/`는 `.gitignore` 대상이다.
