# 문서 정본과 main 유지보수 범위

docs 정본은 **origin/unity/main**이다. main에는 웹(H5) Steam 라이브판 유지보수 문서와 코드·테스트·도구가 직접 참조하는 파일, 정본 위치 안내만 둔다. 새 개발 문서는 Unity 정본에서 찾는다.

```powershell
git fetch origin
git show "origin/unity/main:docs/DOCS_INDEX.md"
git show "origin/unity/main:<경로>"
```

같은 경로가 없으면 `docs/_archive/<docs 아래 원래 경로>`도 확인한다. main 고유 자료는 `codex/unity-docs-from-main-20261104` 브랜치에서 먼저 Unity 정본에 병합한 뒤 main 정리 브랜치를 병합한다. 병합 전 이전 자료는 `git show "origin/codex/unity-docs-from-main-20261104:<경로>"`로 읽는다.

main에 남은 설계·아트·번역·보스 문서 중 일부는 웹 코드·기존 도구·테스트가 파일로 읽기 때문에 보존한 호환 자료다. Unity의 현행 설계 상태는 Unity 정본을 따른다.

웹 서버 3333·DEMO/EA 동기화·Steam 웹 패치의 현행 운영은 루트 CLAUDE.md 부록 W를 따른다. 자동 커밋·배포·예약 작업을 새로 켜는 권한을 과거 문서에서 추론하지 않는다.
