# BUILD-20261002-MAC-PACKAGER

기존 preflight28검사 root 재실행 PASS. 현재 runtime 미발견·실제 .app 미생성, 공용 빌더 Windows전용 판정 인수. 보고서 반복 대신 설치된 nw-builder API에 맞는 Mac 실제 packager 연결 후보 한 건을 구현한다. 소유 `BUILD/mac-packager-*`와 `BUILD/mac-packager/`만; 기존 preflight·공용build/server/package는 읽기전용.

AGENTS·BUILD/백업정책·실제 build-nwjs와 설치 nw-builder index/bld/osx 구현을 읽어라. process.platform darwin→nw-builder osx, 실제 process.arch arm64 또는 명시 검증 arch, 버전0.111.2·명시 로컬 runtime/cache 경로·고유 출력·전체 명시 입력 SHA/원격 근거를 실제 packager 호출 인자로 연결한다. 라이브러리 rm(outDir)/자동 download 경로를 조사해 기존 출력 덮어쓰기와 암묵 다운로드를 차단한다. plan/execute 경계를 분리하고 기본 dry-run, import만으로 I/O·실행0. 실제 실행 adapter는 승인된 입력·runtime을 받아 nw-builder 호출까지 연결하되 이번에는 fixture 주입으로만 실행한다. runtime 없는 상태에서 성공/.app 완료를 내면 안 된다.

세이브·profile·기존 dist/out/.app는 입력 제외, 고유 stage/output를 독점 예약하고 소유한 새 생성물만 다루는 계약. 현 Mac source/port3340/user게임과 원본3333보존. package/node-main의 포트·user-data-dir·save 경로를 고유 값에 맞추는 최소 파생도 연결하며 전역 설치/다운로드/실제복사·압축/대형빌드/게임실행0. 실제 설치 라이브러리 shape와 fixture spy 호출 인자·충돌/누락/SHA/symlink·실패정리 검증. 새환경/권한/네트워크 완화0. Git/queue/새세션·에이전트/공유docs/타팀/production 수정0.

마지막 원격 확인은 root가 98aedab7dd3df41a57c2311bfc4cf79731057e60을 이번 시작에도 조회했다. 이 SHA가 이후 변경의 보존을 보장하지 않으므로 정확 입력별 backup SHA 별도 검증. receipt에 수신/실제Read/Edit/완료UTC, 구현·fixture·미생성.app·runtime BLOCKED를 구분 후 한 건 인계.
