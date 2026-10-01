# BUILD-20261002-PACKAGE-READY

runtime-acquire 완료 보고를 읽었다. root의 독립 네트워크에서 공식 ZIP을 확보했고 공식 SHASUMS256과 SHA 일치 및 arm64 Mach-O를 확인했다. `outputs/team-review-20261002/persistence/runtime-root-acquisition.json`의 cacheRoot/releaseInfoPath를 읽어라. 이는 root가 자신의 허용 범위에서 완료한 파일이다. 네 쓰기는 기존 허용된 BUILD/package-ready-*만 사용하고 외부 경로 쓰기/보안 우회는 하지 않는다.

다음 실제 패키지 준비 한 건: 기존108개 inputRoots 전체 목록·SHA·런타임 내부 링크/파일SHA를 확정하고 로컬 Git HEAD 트리와 대조하여 백업된 파일/미백업 입력을 구분하라. Git은 로컬 read-only만 허용, add/commit/push/네트워크/queue 금지. root AI저장 수정 두 HTML은 다음 커밋 예정이므로 그대로 미백업으로 보고하며 임의로 이전SHA를 채우지 않는다. LFS 포인터·누락·필수 에셋/동적 참조 차단을 실제로 판정하고 mac-packager plan에 쓸 실행 전 config를 준비한다. outputRoot는 repo/outputs/mac-package-ready 아래로 정하되 actual execute/앱실행/사용자게임/세이브변경은 아직0. 스캔 중 다른 팀 소유 도구/문서 변경은 build inputRoots와 구분한다. 막히면 정확한 파일 경로와 이유를 남긴다.

새 세션/에이전트/생산 수정0. 소유 prefix에 actual UTC 수신·Read·명령·완료, 실 input 수/용량/해시와 미완료 게이트를 기록 후 root 인계. 부하 큰 작업은 이 파일 목록·해시 검수에 한정하며 게임 성능 측정은 병행하지 않는다.
