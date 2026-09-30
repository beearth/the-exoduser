# PC → Mac 이전 자료 인수 — 2026-10-01

**06:43 KST 최신 상태:** PC 자료 준비, Mac 설치·개발 검수, 비Git 증거 80개 수신·개별 해시 대조를 완료했다. Mac 설치 마감 커밋도 GitHub 원격 SHA와 일치한다. 이전 읽기 전용·미수신 기록은 해소됐으며 팀과 관리 자동화는 계속 대기한다. [총괄 §17](../0마스터플랜/PROJECT_MANAGEMENT_MASTER.md#17-mac-이전-마감과-환경-인수-2026-10-01).

| 자료·단계 | 위치·기준 | 인수 상태 |
|---|---|---|
| PC 소스·에셋·docs·테스트 WIP | `codex/backup-20261001-031534` / `955a2758fa2f1865a9c1c5d3900418d543f3a3d3` | GitHub 원격 SHA 재대조 일치. main만 clone하면 WIP 누락 |
| Mac 설치 마감 | `codex/mac-environment-20261001` / `dd4c12b94b4ce90afc14bee15809b70c1a541863` | Mac 일반 push 보고, 총괄 원격 SHA 대조 일치 |
| 독립 SOUND 결과 | `claude/admiring-albattani-dvaosd` / `49851bd893c74b502259cf49f6a6457919767465` | 원격 보존. 병합·청취·패키지 인수는 별도 미실시 |
| 비Git 검수 ZIP | 양쪽 프로젝트의 `tmp/mac-migration-20261001/non-git-evidence.zip` | 80개, 151,030,223바이트. Mac 수신·CRC·개별 크기/해시 검증 완료 |
| ZIP SHA-256 | `8282d037704cee13ff21ec35932a840f67aabef2812a9a56ebed7bbdf6b27ee2` | PC 원본과 Mac 수신 파일 일치 |
| Mac 수신 영수증·추출 | `tmp/mac-migration-20261001/verified-receipt.json`, `verified-evidence/` | 파일 경로·개별 해시 기록. 기존 소스 덮어쓰기 없음 |
| 파일별·PC 도구 목록 | `MAC_TRANSFER_INVENTORY_20261001.json`, PC `tmp/mac-migration-20261001/transfer-manifest.json` | 확장 디렉터리 18개(구버전 중복), 스킬 이름 22개는 인벤토리. 전체 플러그인·설정 1:1 복제 완료를 뜻하지 않음 |
| 사용자 세이브·계정·비밀값 | 기존 PC/Mac 원래 경로 | ZIP·Git 업로드 제외, 보존 |

Mac 프로젝트는 `/Users/fordeargamers/Projects/exoduser-migration-20261001`이다. 기존 `/Users/fordeargamers/the-exoduser`의 HEAD·22개 파일 해시와 3333 서버를 보존했다는 현장 결과를 확인했다. 새 개발 검수는 3340에서 진행했다. 설치 도구·실행 검수 근거는 [Mac 환경 인수서](MAC_ENVIRONMENT_HANDOFF_20261001.md)를 따른다.

Git 제외 런타임 디렉터리 87개는 prologue/VFX 생성 후보·Unity Library 캐시·현행 파일로 대체된 `attack-remaster-v1.png` 등을 포함한다. 이 목록 전체를 필수 실행 파일로 복사하지 않았다. 실제 참조 누락이 발견되면 원본과 대조한다.

전송에는 기존 PC Node 서버와 기존 LAN 연결만 사용했다. PC GUI·전원·게임 실행본·사용자 세이브를 변경하지 않았으며 새 서버·공유·방화벽 설정을 만들지 않았다. Mac 절전 방지는 앞선 PID 21769 assertion 확인 당시 09:10 KST경까지였고 이번 자료 전달에서 연장하지 않았다.

**남은 별도 범위:** 전체 콘텐츠 장시간 QA·성능 원인 규명, Mac 실행 패키지, SOUND 병합·청취, 팀 운영 재개. 설치와 자료 이전 완료를 이 범위의 완료로 확대하지 않는다. 사용자 재개 지시 전 신규 백로그를 시작하지 않는다.
