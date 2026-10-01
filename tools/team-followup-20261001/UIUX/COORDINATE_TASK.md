# UIUX-HUD-COORDINATE-ADAPTER

기존 세션 01a0f6e5-8653-7ae2-8b2b-314e275c215c의 다음 승인 작업 한 건입니다. 기존 완료 결과·현재 팀 문서와 동일 과제 진행 여부부터 확인하세요. 이미 동일 작업이 진행 중이면 중복 실행하지 말고 그 근거를 기록하세요.

기존 P2 `layout-candidate.mjs`에 실제 게임의 world→논리화면 좌표 변환과 charge/drawNumStr bbox를 연결하는 독립 어댑터 및 미적용 hunk를 구현하세요. 카메라 round/shake, `_tzoom`, SSAA/DPR을 현재 game.html의 실제 draw 순서와 원식에 맞추세요. 실제 연결 코드가 빠진 채 기존 순수 후보14검사만 반복해서 완료하지 마세요. 좌표 역변환·그리기 이동과 논리/물리 픽셀 변환을 명확히 분리하고 입력 게임 객체를 변경하지 마세요.

현재 HEAD와 직접 읽은 game.html SHA256, 원식 추출 위치·본문 또는 해시를 기록하세요. 오래된 기준값이나 추정 시각을 복사하지 마세요. 줌1/.62, 양수·음수 좌표, 카메라 반올림·shake, 여러 해상도와 SSAA/DPR 조합에 대해 결정적 왕복/불변 검사를 구현하세요. charge/숫자 bbox가 실제 drawNumStr의 정렬·크기·스케일과 일치하는지 근거를 연결하고 hunk 적용 재구성·구문 검사를 수행하세요. 알려지지 않은 값/관측 없는 시각 판정은 UNKNOWN으로 남기세요.

소유: `tools/team-followup-20261001/UIUX/` 및 `docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/UIUX-coordinate-result.md`, `UIUX-coordinate-receipt.json` 두 전용 문서만. 기존 산출을 되돌리지 마세요. game.html/easy/공용 test/총괄 문서/타팀 경로는 수정 금지. Git 쓰기·게임·서버·브라우저·이미지 생성·대형 빌드·새 세션·PC 작업 금지. 작은 로컬 정적 검사는 허용됩니다. docs 관련 키워드 검색과 동기화 제안은 전용 결과에 남기고 공유 문서 통합은 root가 담당합니다.

문구·표시 개수·수명·알파·전투·저장 불변. 실제 시각·밀집 성능은 후속 QA 게이트로 유지하세요. 한국어로 수신·첫 실제 Read/명령 착수·완료를 구분해 영수증에 적고, 확인한 UTC 시각과 검사 명령/exit·남은 게이트를 기록하세요.
