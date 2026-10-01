# 저장 쓰기 실패 — BALANCE 미적용 후보

완료·root 인계 UTC: 2026-10-01T17:56:17Z. 원본 server SHA 최종 재대조 동일.

수신/첫 Read UTC 2026-10-01T17:54:23Z, 첫 코드 Edit 17:55:17Z. AGENTS/팀 MD/저장 SSOT/이전 disk 결과와 실제 server.cjs를 읽었다. 동일 prefix에는 task만 있어 중복 작업 없음. 초안·타팀·생산 보존.

## 재현 및 후보: 메모리 fs 13 PASS

실제 POST /api/save 원문과 sanitizeSlot을 추출해 vm에서 실행했다. fs 대역이 기존 파일에 17문자를 기록한 후 EIO를 던지자 기존 JSON이 깨졌다. 이는 실패 주입으로 입증한 직접 덮어쓰기의 손상 경계이며 실제 사용자 파일 사고를 확인한 것은 아니다.

`save-write-failure-candidate.mjs`는 같은 디렉터리에 wx 독점 임시 파일을 열고 JSON 전체 기록→close→rename 순서로 교체한다. 실패 시 자신이 만든 임시 파일만 정리하고 기존 파일을 삭제하지 않는다. 충돌 EEXIST는 다른 파일을 지우지 않고 실패한다. 최소 호출부 후보는 `save-write-failure-integration.patch`이며 **미적용**이다. root는 함수별 SHA를 대조한 뒤 통합해야 한다.

| 경계 | 결과 |
|---|---|
| 원문 부분 기록 EIO | 기존 JSON 손상 재현 |
| 후보 open/write/close/rename 실패 | 이전 bytes 보존 |
| unlink 실패 | 이전 bytes 보존, 부분 임시 파일 잔존을 명시 |
| wx 충돌 | 이전 bytes·다른 임시 파일 보존, unlink0 |
| 신규/기존 성공 및 반복 저장 | 새 snapshot 정확히 교체, 임시 파일0 |
| 슬롯 sanitization/default/50문자·스키마·200 JSON | 원문과 동일 |
| No data 400 / 순환 JSON | 쓰기0, 원문 파일 보존 |

검사 UTC 2026-10-01T17:55:17.109Z, 13 PASS. 두 mjs의 node --check도 17:55:24Z exit0. 명령은 `node tools/team-followup-20261001/BALANCE/save-write-failure-test.mjs`; 로그/evidence는 동일 prefix. docs 전체 검색은 `save-write-failure-doc-search.txt`에 보존하고 팀 MD 본인 추가 구역에만 기록했다.

## SHA-256 및 한계

| 입력/산출 | SHA-256 |
|---|---|
| server.cjs 전후 동일 | 339fad6ab51cba92f6ca7a386c8aeb251f68cdb58cdfa55c109f57b1758a42ad |
| POST route 원문 | 4a356c1d618bdbc8e1d933463997d0646fa1b678fc3b2fc998258df264308873 |
| sanitizeSlot 원문 | 1be40f5b0490a3a37b229e05c75143a728df7974981e39d94bcd32e184e156d0 |
| 후보 mjs | 3cebbd984a6f5114ae36163810cd7e260ee34dd803954f748e25eb9ca37d9cf7 |
| 검사 mjs | 43c0209b4f9cc4cd22f45aa3313760651d3e972baaa835e7545af3e09fe77b5b |

검사는 메모리 fs뿐이다. rename 실패는 원파일을 보존하도록 모델링했다. 실제 OS/파일시스템의 교체 원자성, Windows 기존파일 교체, 전원손실, 프로세스 크래시, fsync/디렉터리 sync, 실제 HTTP ACK는 미검수다. close가 계속 실패하면 descriptor 해제는 보장할 수 없고 unlink가 거부되면 임시 파일이 남는다. 재시도 루프·기존파일 삭제 fallback·시작시 임시파일 청소는 넣지 않았다. serialize/write/rename 오류는 기존 서버 outer catch로 전달하며 성공 ACK는 rename 뒤만 반환한다. 외부 catch 응답의 실제 HTTP 전송은 검사하지 않았다. 공유 mats API와 다른 쓰기 경로는 변경 대상이 아니다. 이전 EPERM 통합 검수는 여전히 미완료다.

import는 node:fs/path/vm/assert/strict/crypto와 전용 후보 모듈뿐이다. fs 실사용은 소스 읽기·전용 evidence 출력에 한정하며 합성 저장은 전부 Map이다. 네트워크/listen/서버/브라우저/게임/사용자 세이브/빌드/Git/권한변경/새 세션/에이전트0. 완료 후 root 인계, 생산 적용 판단과 실제 디스크 검수는 root 게이트로 남긴다.
