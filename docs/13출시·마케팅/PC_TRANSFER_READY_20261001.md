# PC → Mac 이전 자료 인수 — 2026-10-01

## Mac 이전 인수 완료 — 2026-10-01

PC의 기존 LAN 게임 서버에서 비Git 검수 ZIP을 직접 수신했다. 새 서버/제3자 업로드/방화벽 변경 없이 진행. 크기 151,030,223바이트, SHA256 `8282d037704cee13ff21ec35932a840f67aabef2812a9a56ebed7bbdf6b27ee2`, ZIP CRC, 파일 80개 및 PC transfer-manifest의 모든 개별 크기/해시가 일치한다. Mac 저장 위치는 `tmp/mac-migration-20261001/non-git-evidence.zip`, 별도 추출 위치는 `tmp/mac-migration-20261001/verified-evidence/`, 검증 영수증은 같은 디렉터리의 `verified-receipt.json`이다. 기존 자료 덮어쓰기 없이 인수 완료했다.

Node/의존성/개발 도구 설치, Claude Google 로그인, 실제 전투 3처치·불꽃 반지 획득과 재접속 복원, 관련 회귀 검사 32/32까지 완료했다. 기존 Mac 저장소 수정 22개 파일 해시와 HEAD를 다시 확인해 보존했다. 설치/자료 인수 범위는 완료이며 장시간 전체 콘텐츠 QA·Mac 배포 패키지·독립 SOUND 병합은 수행하지 않았다. 팀/자동화는 재개하지 않는다. 아래의 미수신·설치 대기 표기는 이전 이력이다.

현재 범위는 PC 자료 정리와 복구본 확정이다. Mac 파일 쓰기 권한이 아직 없으므로 설치·clone·파일 전송은 미완료다. 기존 PC 창·전원·게임 실행본·사용자 세이브는 변경하지 않는다. 11팀 상태는 [총괄 §17](../0마스터플랜/PROJECT_MANAGEMENT_MASTER.md#17-mac-이전-마감과-환경-인수-2026-10-01)이 기준이다.

| 자료 | 위치·기준 | 인수 상태 |
|---|---|---|
| 소스·에셋·docs·테스트 WIP | GitHub `beearth/the-exoduser`의 고유 `codex/backup-*` ref. 정확한 최종 ref/SHA는 `tmp/mac-migration-20261001/recovery-receipt.json` | 원격 ref SHA 확인 후 영수증 기록. main만 clone하면 WIP가 누락됨 |
| 독립 SOUND 결과 | `claude/admiring-albattani-dvaosd` / `49851bd893c74b502259cf49f6a6457919767465` | 원격 대조 완료. main 자동 병합 금지, 인수·청취 검수 별도 |
| 비Git 검수 자료 | `tmp/mac-migration-20261001/non-git-evidence.zip` | 로컬 준비: 80개, 151,030,223바이트, ZIP CRC·멤버 해시 검증. Mac 전송 전 |
| 검수 ZIP SHA-256 | `8282d037704cee13ff21ec35932a840f67aabef2812a9a56ebed7bbdf6b27ee2` | 추후 수신 파일과 대조 |
| 파일별 목록·PC 도구 목록 | `MAC_TRANSFER_INVENTORY_20261001.json`, 로컬 상세 `tmp/mac-migration-20261001/transfer-manifest.json` | VS Code 확장 설치 디렉터리 18개(구버전 중복 포함), 사용자 스킬 이름 22개. 설치 완료 증거가 아님 |
| 사용자 세이브·계정·비밀값 | 기존 PC/Mac 원래 경로 | 본 묶음·Git 업로드 제외, 그대로 보존. 따로 확인 없이 덮어쓰기·합치기 금지 |

Git 제외된 런타임 디렉터리 파일 87개를 조사했다. prologue 생성 후보·VFX 생성 후보·Unity Library 캐시와 이전 실버테일 `attack-remaster-v1.png`가 해당한다. 마지막 파일은 `.gitignore`에 현행 런타임 `attack-spin-v2.png`로 대체됐다고 기록돼 있다. 이 목록 전체를 필수 실행 파일로 복사하지 않는다. Mac 실행에서 추가 누락이 발견되면 실제 참조와 원본을 대조한다.

Mac 대상은 `/Users/fordeargamers/Projects/exoduser-migration-20261001`의 별도 체크아웃이다. 기존 `/Users/fordeargamers/the-exoduser`의 수정 21개·미추적 1개와 저장·3333 서버를 유지한다. 새로운 경로도 존재 여부를 다시 확인한 뒤 사용한다.

권한 변경 후 순서: 전달받은 정확한 원격 ref/SHA 대조 → 고유 Mac 브랜치에 복구 → Node 24.15.0 arm64·lockfile 의존성·canvas/sharp 로드 검증 → Mac 경로/PowerShell hook·서버 포트 계약 확인 → 로비·전투·설정·분리 저장/재실행 검수. 기존 Windows 빌드 스크립트의 win/x64·ffmpeg.dll을 Mac 패키지로 간주하지 않는다. 새 기능·팀 자동 재개는 사용자 재개 지시 전 보류한다.

현재 Mac 절전 방지는 2026-10-01 09:10 KST경 종료 예정이다(PID 21769, Mac 현장 assertion 확인). 설치가 지연되면 당시 상태를 다시 확인한다. 파일 쓰기 제한은 사용자 설정에서 해소해야 하며 설치 명령 우회나 보안 설정 완화는 하지 않는다.
