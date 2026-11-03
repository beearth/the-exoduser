# Normal lesson active-only 메인·R 소스 통합 (2026-10-17)

| 항목 | 소스 통합 계약 |
|---|---|
| 기존 main | fresh GitHub main216126d70c2b1d280b55bd578fde2d24e15a3d23 확인, 이 expected SHA로 force=false 정상 FF만 사용한다. |
| 승인 단위 | local5e096983bc5652aaacb5175580e176a8d26987a6 / remotea0d36a20fdbf94e410e2a1fd0ae44874ccff9b37 / tree9a5964836c73e9dd325bfaef1501d91e8269b8db, code2/docs9. 원 local/remote WIP ref 보존. |
| 정확 변경 | 새 구현 코드0. 이 통합 문서 및 PC_MAC_GIT_SYNC만 갱신한다. 전체 source union13경로(code2/docs11); 승인된11 blob 재업로드0. |
| 실제 API | SourceLesson.read_active_status() 및 Main.read_native_normal_enemy_lesson_status(). 기존 current/authority/optional weak publisher/epoch만 사용, active1회/chapter0. 선언 weak publisher 유실은 CURRENT와 witness 모두 NR. 새state/epochcounter/그림자 없음. |
| 미준비 | UNKNOWN을 false로 만들지 않고 active 키를 생략한다. Main 교체/epoch변경은 원 read_result 보존. 기존 regen/finish/controller 본문은 변경하지 않는다. |
| 검수 이력 | 첫 fixture seed 이름이 내장함수와 충돌하여 parse실패/exit0/result없음/기능0. fixture명만 수리한 새49PASS/양로그0, 별도 정적10PASS. first_whole_clean=false. literal protected-call0은 선언 scope이며 실제 실행 계측값이 아니다. |
| 실행 범위 | 실제 수정 SourceLesson의 fresh 기존필드seed·Main 메서드추출 검수. 자연publication/전체Main/실게임/PC/export 수명 통합은 미검증. 기존49/31/9/108/oldproof/parse 재연0. |
| 새 사전보존 | 정확13경로×I/R26행, WORK/HEAD52슬롯=46copy+6absent. 첫 doc쓰기 전에 각복사 시각·nonlink ancestor/realpath·분리INDEX/WORK 저장. R은 FF 직전 같은 union만 새로 재보존한다. 과거 steering의 별도ancestor시각 미기록은 유지/소급0. |
| 정상 Git | 승인 a0 부모에서 docs commit→main expectedSHA/forcefalse→I filtered fetch/새tracking branch→R 로컬 I 객체재사용/정상 origin fetch→merge --ff-only --no-overwrite-ignore. 원 refs/foreignWIP 보존. |
| R Git 경고 | 기존 promisor/config shorthand 경고는 소스 정렬 성공과 별개로 보존한다. config 정리/원 부재 추정0, 전송byte 미기록을 0으로 주장하지 않는다. |
| 완료 판정 | 새13경로의 I/R 실제26파일↔최종commit blob 일치를 새 정적검사1회로 확인하고 외부 final receipt에 actual main/I/R commit/tree를 기록한다. |
| 남은 실제 연결 | normal parry_lesson_active callback 미등록. 기존 ENEMY v5는 API팩을 받아 같은SID에서 source/parse 대기 중이라는 ROOT 인수 시점 기록이며 제작/등록 완료가 아니다. 다른21 owner·전체25/sourceclock/hurtE/effects·전체게임 최신성은 미완/미검증이다. |

정확 API·원 first-failure/새49·한계는 FDG_NATIVE_NORMAL_ENEMY_LESSON_ACTIVE_20261017.md를 따른다. actual normal callback이 아직 추가되지 않았으므로 기존 typed4 map은4이고, 기존 미연결 callback 수는21이다. v5 후보가 오더에 배정됐다는 사실로 그 수를20으로 줄이지 않는다.

최종 정상 소스 정렬의 exact pin/새guard/정적결과는 NORMAL-HURTE-LESSON-ACTIVE-MAIN-SYNC-20261017/final-receipt.json에 남긴다. source 정렬은 사용자가 보고 있는 served 게임/export/PC의 최신버전 증거가 아니다. GUI/server/API/save/original media read/copy/import0.
