# busy 보류분의 완료 직후 배수 — 미적용 후보

## 수신·실제 착수
- 수신/첫Read 2026-10-01T16:41:42Z. AGENTS·담당경제MD·저장SSOT·전용task·QA busy-save-independent 결과/R1·실행코드·원 save-inflight 후보를 읽었다. 같은 prefix는 task만 존재: 중복산출없음.
- 첫 코드 Edit 16:42:28Z(실제 candidate.mjs UTC mtime 확인). 원후보를 immediate-drain-prior-before.mjs로 byte동일 보존, 생산원문은 immediate-drain-before.json에 함수별로 고정했다. 원후보 수정0.
- 첫 실제검사명령은 16:43:29Z~16:43:30Z. 최종검수 16:44:37Z: `node --test tools/team-followup-20261001/BALANCE/immediate-drain.test.mjs` **17PASS / 0FAIL**. 비교행8개와 다중경계 그룹이며 이 수치를 서버저장 성공횟수로 세지 않는다.

## R1 전후와 최소 변경
| 순서/경계 | 기존 save-inflight 후보 | 즉시 후보 |
|---|---|---|
| A의 첫 요청 snapshot+0 hold→상태+1 변경→now500ms | pending1, 첫전송1 | 동일 |
| 첫전송 완료epilogue fake UTC100500 | dbSaveNow 재예약, 추가dispatch0 | **dbSave 직접호출, 추가dispatch1** |
| 완료후300ms | 여전히첫dispatch뿐 | 최신+1 요청snapshot 존재 |
| 최신요청의ACK/메모리persist를 아직 주지않음 | 미완료 | **동일하게 미완료**. 추가dispatch를서버저장완료로세지않음 |
| 명시메모리persist 후 ACK | 500ms뒤보류분전송하여보존 | 추가재디바운스없이 보류분전송하여보존 |

원후보 대비 변경은 `_drainPendingSaveNow`의 마지막 **`dbSaveNow();` → `dbSave();` 한 줄**이다. pending을먼저지우고 같은charId/idx/P객체/dbSave함수·DB준비상태를대조하는원guard는그대로다. 일반dbSaveNow의500ms 디바운스·비용·AI콜백·force5초정책 불변.

`immediate-drain-candidate.mjs`는 순수 함수텍스트 후보를export한다. 실제등록/저장/타이머는 import만으로실행되지않는다. `immediate-drain-candidate.diff`는 현재production 원문 기준 양쪽4hunk씩(now+helper, 3개_saving=false finalizer)이며 기존미적용pending후보의호출부연결을포함한다. **기존후보→즉시후보 차이는한줄**, 현재production→후보전체패치와구분한다. 양쪽diff를memory에만적용하여 실제실행텍스트와완전일치 검수.

## 독립 fixture·경계 검수
이전29검사하니스를복제하지않고 새메모리시계/sink를작성했다. 현재실제5개dbSave·dbSaveForce 원문을before에서VM으로실행한다. 강화수치검사를다시작성하지않았으며 상태변경입력만주입한다. 관련없는 sanitize/UI/공유저장 hook은명시stub, 캐릭터스냅샷객체는실제dbSave가구성한다.

| 검사 | 실제 판정 |
|---|---|
| 기본DB/로컬fetch × 본편/easy | 두경로모두완료epilogue에서같은fake시각에최신snapshot dispatch |
| 재귀·중복 drain | pending을호출전에삭제. 직접save가재진입해drain을호출하는순수fixture도1회만실행. 실제async경로중복drain추가전송0 |
| 성공/실패+_pendingForce 동시 | 실제finalizer/force검사순서유지. 즉시후속save가_saving=true라중복강제호출은원guard로return. 추가전송1회; pendingForce해제; 실패후10000ms에도자체반복0 |
| 2회 busy | 첫대기중상태+1→보류분dispatch, 두번째대기중상태+2→두번째pending→완료시추가dispatch. 순서+0/+1/+2 보존 |
| A/B 교대 | A저장종료후B의새P/idx/id 적용, local은B slot/override재생성모델. B요청/보류분의snapshot·대상B 일치 |
| 보류중id/idx/P/override 변경·DB미준비 | 컨텍스트폐기, 신캐릭터오저장0 |
| force5초·일반debounce499/500ms | 원force함수와일반now정책유지: 경계이전전송0/정확경계전송1 |
| 보류분뒤새now timer | 기존새500ms timer를지우지않음. 새요청이실제로발화하면추가busy/pending으로처리. 정당한새요청과같은pending의중복배수를구분 |
| demo500/demo/standalone | 현재동기override원문경로도정상동작, 불필요network0. demo별도복원정책검증으로확대하지않음 |

snapshot은 **요청API진입시 JSON복제**한다. `persist(index)`는메모리sink만갱신하고 `ack(index)`는별도Promise를끝낸다. 두번째dispatch직후 첫persist+0만존재하고 새요청acked=false/persisted=false를assert했다. 실서버쓰기/ACK를가정하지않았으며 beforeunload를호출하지않았다. fake시계의같은시각은재500ms대기가없다는증거이지 실환경0ms완료보장아니다.

## 인수 한계
- drain은 **_saving=false 바로뒤**호출하는계약이다. 임의busy시점에서helper만따로호출하는공개저장API로확대하지않는다.
- 완료되기전강제종료/전송영구대기/미완료ACK·persist는여전히보장0. 기존unload의비동기호출위험을해결했다고선언하지않는다.
- 새사용자요청이계속들어오면그요청들에맞는후속전송은가능하다. 요청없이실패만으로자체무한재시도하지않음을검사했다.
- force-only 진행중요청의기존5초검사잔여, old전송이캐릭터전환뒤전역저장시각에미치는기존동작, 변경후같은identity로원복된이력/epoch까지수정하지않는다. demo 공유악의/선택복원도범위밖.
- 실제Supabase SDK/서버persist/브라우저/사용자게임·세이브 검수없음. Mac앱빌드부하와중복실행0.

## SHA·docs·root 인계
| 원문/산출 | SHA-256 |
|---|---|
| 보존원후보 | 96750107f0da4dceb756bbe3a14017d1e58e29015f91fb76cf91bea4301bfb5b |
| 새candidate.mjs | b8a18fc3748d8248cb95c9554ae0b4fa2e786d804257b080e8a999bb43fdee19 |
| 새candidate.diff | 5acc71f59ac6e9d9f88cb87d1cff0814a039c5adedccb7f606a35d71ea692269 |
| 양쪽현재 dbSaveNow raw | f31e1ecf47f3df722978ff68fed54ee98977edd78fefc8cb59e871d8557ea71c |
| 양쪽현재 dbSaveForce raw | 9e6f375e6a2856522d55791f7e76d7f93705699cc35d96f187373a3406aa1b21 |
| 본편현재기본 dbSave raw | 2152c5b37d34f6deb0d1fc4a8a06be6744c205bd93ada63157a31ee392bfa0a9 |
| easy현재기본 dbSave raw | 19eb6a0a97937ed20d2c3d7afcdf7ac7c4cb1bbc7d3c8a025ca408944eb68a48 |

5개 분기각raw SHA 및JSON배열SHA는evidence.json/before.json에저장, 원후보byte동일과현재원구역불변을최종검수했다. QA의원함수앞16 SHA와본편값일치. 전체production파일고정 대신함수구역을고정하여root 타구역순차수정과구별한다.
결과·receipt 완료 UTC: 2026-10-01T16:45:42Z.
docs 전체검색 immediate-drain-doc-search.txt. 제안: pending보류분의완료후재500ms를제거하는미적용단계와dispatch≠ACK≠persist 제한을저장SSOT에분리기록. 공유docs직접수정0.
root에게현재원함수SHA/diff·독립경쟁검수·최종채택판단을인계한다. 원후보/생산/타팀/공유docs/Git/queue/새세션/에이전트/앱/브라우저/게임/사용자세이브 변경/실행0. **이한건완료후root대기**, 새범위착수0.
