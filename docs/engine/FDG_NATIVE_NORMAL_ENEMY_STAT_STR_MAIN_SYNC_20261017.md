# Normal stat_str 메인·R 소스 통합 — 2026-10-17

| 항목 | 인수된 소스와 통합 계약 |
|---|---|
| 이전 main | d47af4a462cfa989fee190c5fc10c3c4377a0e23. 실제 원격 ref를 새로 확인한 값으로 expected_sha/force=false를 적용한다. |
| 인수 소스 | 원 로컬 0ea40a3ad8064853c52c9722621dd84c7ddf5ccc / 원격 WIP 9f3eaee5ec1d14552171531d4bce1dccd0b79aa6, 동일 tree e3f32a3887b094a84f0478cf0ac3c797e140144a. 원 branch와 ref를 보존한다. |
| 정확한 범위 | 인수 코드2 + 인수 docs17을 그대로 유지하고 이 통합 문서와 FDG_PC_MAC_GIT_SYNC_20261016.md만 추가 갱신한다. union21개. 인수19 blob 재업로드0. |
| 실제 공개 API | formula.stat_str()->Dictionary(0), Services.read_normal_enemy_strength_multiplier()->Dictionary(0), callback stat_str. 원 STAT_STR=1.0을 같은 소유자의 기존 _ok로 반환한다. |
| raw / 실패 | 정상 raw는 status/value(float1.0)/non_finite=false/source/undefined_reads=[]/reason. 실제 Main/Services/Providers 및 formula 객체·Script·수명 전후 검증. 실패 NOT_READY, query 후 raw read_result 보존, 최상위 numeric value 폴백0. |
| 현행 노출 | eq_affix/u_eq/p_atk_mul/melee_ref/parry_lesson_active/player_view/stat_str, 7/25·미18. V5의 scalar 세 위치는 아직 typed 미지원이며 실제 V5 바인딩0/unused kernel copy0. 25 presence 불변. |
| 첫 검사 이력 | 새25/25 PASS, exit0·양로그 오류/leak0, 별도 정적10/10. 실제 full formula 새 reader/own _ok 및 정확 추출 Services·명시적 Main/actor/holder/provider 대역 범위. 전체 Main configure/자연 수명/게임플레이/V6 caller 실행 아님. 기존 성공 suite 재실행0. |
| 선행 보존 | I/R exact union42행84 WORK/HEAD slots: 실제 복사78/absent6. INDEX/WORK 별도 scoped clean 및 각 복사 전 source/destination ancestor nonlink/realpath·개별 UTC 기록을 저장한 manifest 뒤에 통합 작업한다. |
| R 반영 | 교체 직전에 exact union21개의 fresh WORK/HEAD·scoped INDEX/WORK·nonlink guard를 다시 보존하고 저장한 manifest 이후 정상 fast-forward한다. 기존 원 branch/WIP·타인 파일 유지. |
| Git 경고 | R의 기존 absolute-path promisor 경고를 원문 로그로 보존한다. config 정리0. local object reuse fetch는 filter 인자를 쓰지 않고 origin은 정상 filtered fetch. 네트워크/blob 전송 byte 수는 NOT_RECORDED. |
| 완료 증거 | source main/I/R 실제 SHA/tree/upstream, scoped INDEX/WORK, union 실제 파일 대조는 이번 새 통합 경계 static1회와 외부 finalreceipt가 확정한다. 소스 검사와 실행판 최신화를 구분한다. |
| 실행/품질 한계 | runtime/Web export/PC 기동/사용자 창·서버·save·asset/import 변경0. 실사용 host/URL 미확정. full25/full hurtE/latest_full_game=false/content_parity=INCOMPLETE. VISUAL VERDICT 신규 판정 없음, 기존 RETOUCH 유지. |
| 후속 | 기존 ENEMY V6의 stat_str 세 원 query 위치만 typed 소비하도록 별도 인수한다. V6 미인수를 실제 consumer 완료로 올리지 않는다. |

[실제 API·원형·검수 범위](FDG_NATIVE_NORMAL_ENEMY_STAT_STR_OWNER_20261017.md)를 따른다. 이전 source 동기화 기록의 pin·검사·품질 한계는 당시 이력으로 보존한다.
