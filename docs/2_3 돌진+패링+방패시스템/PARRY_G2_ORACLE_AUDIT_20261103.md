# 패링 G2 적 피격 oracle 21:40 원인 확정

분기점 b3cf7a682bd753d81952157ba2d5b7cd55392db4와 구현 f6ff63e333d6b6a15aeac28ef3b824eb22f3b223를 동일 oracle·동일 검사 프로그램으로 비교했다. 분기점 oracle 실행은 1회다. 기본값 변환 보정은 양쪽에 똑같이 적용했으며 fixture 원본을 수정하지 않았다.

| 분류 | 건수 | 원인·처리 |
|---|---:|---|
| 기존 불일치 | 1300 | EnemyHurt.Death.cs의 stage 제한 없는 BossLine die 호출. ba1069fe29(10-31) 변경이 이전 fixture에 반영되지 않아 22개 H3 사례에서 호출 수·순서·인자가 연쇄로 다름 |
| 기존 불일치 | 1018 | EnemyHurt.DeathTail.cs의 악의 + → 악의오브 + 문구. 2315838a7(10-31) 변경과 fixture의 이전 문자열 차이. H4 978·CH4 40 |
| 웹과 다름(A안) | 372 | §6: 분열 자식 etype3 316필드·etype15 56필드. projCd186개·projT186개를 480/초기대기2배로 조정. 별도 a-plan-expectations.json에 근거·분류 기록 |
| 이번 결함 | 6 | 비대상 etype50의 NoProj 엘리트 주기7999/6999/5949를9999로 덮음. 최종9999 고정 대상을 §4의0·4·6·19·29로 한정해 기존 보정 복원 |

기존 실패2,318개는 f6ff63e33의 실패 집합에 중복까지 모두 포함돼 있었고, 신규378개가 위372+6이다. 기존 사망 코드는 이번 진단에서 수정하지 않았다. 종전 보고의 “전체2,696개가 보스 사망 쪽” 분류를 정정한다.

## 수정·검증

- EnemyFactory의 강제9999는 A안5종에만 적용. 기존 NoProj의 엘리트/M02 계산을 보존한다. 나머지480·원거리240 정책은 유지한다.
- oracle.json의 Git blob은 양쪽 d0366e47b10f26409a81fb648a2b1516e083c73c로 같다. --a-plan 때만 G1 §6 기대값 덮개를 적용하며 원본 웹 기대값을 없애지 않는다. 덮은372개 값 각각에 웹 원값·새값·웹과 다름(A안)·G1 §6을 출력한다.
- 분열 자식은 생성 뒤 elite/mods를 지울 수 있어 기대값은 최종 자식 표시가 아니라 원본 웹 projCd의 생성 보정(엘리트/M02)을 복원해 계산한다. 142→285처럼 각 단계 정수화도 보존한다.
- 같은6,066,962검사에서 잔여2318(H3=1300/H4=978/CH4=40). 분기점과 실패 항목 전체를 중복까지 대조해 누락0·신규0. 전체 oracle PASS가 아니라 기존 불일치만 남았다는 판정이다.
- 규칙86개 실패0(비대상NoProj 회귀 포함). Unity Roslyn Player/Core·Runtime, Editor/Core·Runtime·Editor 총5개 어셈블리 오류0. PC Unity 실행·빌드·실게임 판정 없음.

## 재현 도구

- compare-baseline.cjs: Git archive 표준출력을 메모리의 Roslyn SyntaxTree로 읽는다. 작업본 전환·추가 작업본·프로젝트 복사·소스 추출 파일 없음. baseline-current/provenance.json·oracle-result.json으로 분기점·동일fixture를 기록한다.
- run.cjs --suite enemy-hurt-oracle --a-plan --out <output>: 현재 코드와 A안 기대값. --a-plan을 빼면 원래 웹 fixture 비교다.
- classify-oracle.cjs: baseline-current와 enemy-hurt-oracle의 전체 failureDetails 다중집합 대조. 판정은 oracle-audit.json.
- Windows 셸: C:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe -NoProfile -Command. Node 전체 경로 C:/nvm4w/nodejs/node.exe.

증거 고정 위치: I:/EXODUSER-Storage/codex-takeover/parry-g2/의 oracle-audit.json, classification-before-fix.json, baseline-current/provenance.json·baseline.log·oracle-result.json, enemy-hurt-oracle/oracle-result.json·rules.log, assembly-compile.log·compile-current/result.json. 바이너리/RSP는 확인 후 정리한다.

Mac §8 비율·회복·그로기·화면과 M1/자동3판/사람3판은 미확인이다.

## 최신 본편 병합 검증 (2026-11-03)

- G2 `87a77a11f700ceb32b1704700343895296a38869` 위에 최신 `origin/unity/main`의 `8e4e358e622bb6d1a6466cc7e1915fd47dc2bb33`를 병합했다(`8c5f967d7` 이후). Core 충돌은 없었다.
- 문서 2개는 양쪽 기록을 보존했다. 번역 목록의 최신 재번호 기록을 유지하고 G2 DANGER는 No.3667→4249 이력을 남겼다. NativeGame은 최신 사망 중 부활문구 차단과 새 VFX Update 인자를 유지하면서 G2 초기화·근접 예고를 연결했다.
- 최신 RETOUCH 3의 따뜻한 흰 선 스파크·근접 완벽 패링만 섬광·PARRY 글자 미표시를 유지했다. G2 근접 플래그와 흔들림 데이터도 연결했다. 기존 두 선택 인자 `--parry-feedback-push-in`(G2 위치 밀기)와 `--unity-parry-camera=pushin`(최신 VFX 확대)을 보존했으며 비교 검수에서는 각각 별도로 사용한다.
- 병합 뒤 G2 규칙 1회: 86개/실패0. 적 피격 oracle `--a-plan` 1회: 6,066,962개/기존2318건. 전체 실패 다중집합 대조 누락0·신규0, A안 기대값372개. 기존 분기점 결과를 재사용했으며 분기점 재실행은 하지 않았다.
- PC Unity Roslyn DLL 참조 컴파일 1회: Player Core126/Runtime263, Editor Core126/Runtime263/Editor58, 5개 어셈블리 오류0. Unity/Player 시작·게임 빌드 없음. 기존 다른 Unity 프로세스는 조작하지 않았다.
- `.meta`의 로컬 수정으로 병합이 거부되지 않아 동일내용 스테이징 우회는 사용하지 않았다. 병합 전부터 있던 누락 에셋·0바이트 로딩 PNG·guard baseline 변경은 커밋에서 제외했다.
- 최종 병합 SHA와 push 확인은 `I:/EXODUSER-Storage/codex-takeover/parry-g2/REPORT.md` 맨 위에 기록한다. CTO fast-forward·Mac 실게임/화면 판정은 별도다.
