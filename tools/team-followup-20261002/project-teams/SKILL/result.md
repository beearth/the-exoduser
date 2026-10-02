# SKILL mortar 생산 인수 회귀 준비

작업 ID `mortar-production-regression-ready`. **새 하니스 142 PASS/0 FAIL**, 양쪽 생산 가드는 미적용이다. 시작 local/원격 작업브랜치 SHA는 `96610b6546a31e882962470ea1f2164ce94edca6`로 일치했다. 기존 38/17/19를 재실행하거나 새 후보를 설계하지 않았다. 생산 반영·실제 입력 완료 판정은 하지 않는다.

수신과 task.md 전체 Read는 2026-10-02 03:43:36 UTC 첫 도구/clock 관찰로 기록했다(12:43:36 KST). 메시지 발송 시각은 추정하지 않았다. 실제 Node 실행 시작/종료, 개별 검사, HEAD, 입력/함수/하니스/공유 인덱스 SHA는 evidence.json의 executions에 있다. 원담당 CLI 접속·새 세션·하위 에이전트는0이며 기존 과제의 새 실행 근거를 만들거나 완료로 세지 않았다.

| source ID / 한글명 | 적용 위치 / 현행 계약 | 검수 / 한계 |
|---|---|---|
| mortar / 폭풍소환 | `mpCost('mortar')`, `_COST_BASE=50`, `_COST_DPS=.35`, 레벨 `P.skills.maliceMortar||1`; `~~(50×(1+(Lv−1)×.35)×pMagicCost())` | 실제 비용 helper 실행. 정수 절삭 후 Lv1=50/Lv10=207(할인1), 하한.4의 Lv10=83 |
| pMagicCost / 마력폭주 비용 | `max(.40,1−PASSIVES.pMagic×.04−_eqAffix('mpCostRed')−(_uEq('_uHelmMagic')||0))` | 패시브·어픽스·유니크 조회만 fixture. 확정 시 각 할인 변경 재검사 |
| maliceMortar / 조준·확정 | 실제 case → `if(P._mmAiming)` → `fireMaliceMortar` | MP 부족 시 발사/차감/쿨/직접 RNG/SFX 없음·조준 유지. 취소 우선, 실패 release 뒤 회복만으로 자동 재시도 금지 |
| maliceMortar / 발사 | 일반 `_mmCd=660f`, 범위 `400+(Lv−1)×18`, 투척 `maxT=40`; 충전 `150→1000`, `+24×sp/f` | 실제 호출부 world 좌표와 정상 성공 상태 비교. 게임 전체 update/물리/시각 미검수 |
| maliceMortar / throw 중 동일 슬롯 재입력 | dispatcher 첫 분기에서 기존 `G._mmBomb.t=G._mmBomb.maxT` 후 break | 추가 발사·MP 소비·RNG 호출 없이 기존 투척을 즉시 착지시킴. frozen/후보 동작 parity 유지 |
| iceMortar / 얼음소용돌이 | `iceOrb>=1 && _isFused('iceMortar')`; 성공 `_ioCd=600f`·`_mmCd=660f` | 일반/합체 성공의 전체 fixture 상태·직접 RNG 순서·음향 호출 인자 parity. 청취·전체 프로그램 RNG 검수 아님 |

| 새 검사 묶음 | PASS 수 | 기준 |
|---|---:|---|
| 원본/후보 바이트·적용 전후 선택·생산 상태·양쪽 parity·공유 파일 보존 | 8 | frozen SHA 고정, 승인 patch에서 추가 한 줄 재사용. 낯선 함수 드리프트 거부 |
| 실제 동적 비용 | 12 | 양쪽 각각 Lv1=50, Lv10=207, Lv5/패시브5=96, Lv20/어픽스.1=344, Lv10/할인하한=83, Lv5/유니크.25=90 |
| 비용−0.25의 클릭/릴리즈 부족 | 24 | 발사·소모·쿨·직접 RNG·음향 호출 없음, 조준 유지 |
| 정확 비용의 일반/합체 성공 상태·직접 RNG 순서 | 72 | 6비용 조합×2합체 상태×3voice 분기×2판본. frozen/검수 대상 전체 fixture 상태 대조 |
| 조준 중 각 할인 변경 | 6 | 패시브/어픽스/유니크 변경 뒤 확정 비용 상승 검사 |
| 실패 후 회복·새 클릭·자동 재시도 금지 | 4 | 클릭/릴리즈 실패 뒤8 fixture frame 입력 없음, 회복만으로 발사하지 않음 |
| RMB/Escape 동시 확정 취소 우선 | 8 | 충분/부족 MP, 클릭·릴리즈 동시, 취소 뒤 유령 클릭 무발사 |
| 중복 확정·기존 합체 상태·world 좌표 | 6 | 동일 폭탄·MP 보존, ioCd77 보존, 거리174 투척 목표·207 차감/잔여1.25 |
| 잘못된 상수50/경계≤ 가드 반례 | 2 | 단순 고정50 가드와 정확 비용까지 막는 가드를 실제 fixture 검사에서 검출 |
| 합계 | **142** | 신규 소스 회귀 한 묶음. 반복 실행 횟수를 검사 수에 합산하지 않음 |

하니스는 기존 `mortar-integration-targets.patch`에서 정확한 추가 한 줄을 읽고 frozen 함수에 메모리로만 적용한다. 현행 fire가 frozen이면 `unapplied`로 분류하고 메모리 후보를 검수한다. 생산 fire가 승인된 candidate와 바이트 일치하면 `applied`로 분류하여 **생산 함수 자체**를 검수한다. 후보를 이중 삽입하지 않는다. 다른 바이트 변경은 root 드리프트 검토 Gate로 실패한다. 전체 HTML 사본이나 기존 원담당 산출을 새로 쓰지 않았다.

첫 실행140 PASS/2 FAIL은 동일 슬롯 재입력이 기존 throw의 t를0→40으로 만드는 동작을 하니스가 금지한 가정 오류다. 실제 dispatcher의 기존 즉시 착지를 포함하여 frozen/후보 parity로 수정했다. 최초 실패/하니스 SHA/오류는 evidence.json에 보존했다. 생산 코드는 수정하지 않았다.

`--require-production` 실제 실행은140 PASS/2 FAIL·exit1로 **양쪽 미적용 Gate만** 거부했다. 이 결과는 기대한 음성 검사이며 생산 완료 PASS가 아니다. 적용 전·후 호출 방법은 다음과 같다.

```sh
# 현재 후보 준비 검수 (142 PASS); evidence.json을 갱신하려면 --record 추가
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node /Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/project-teams/SKILL/checks.mjs

# root가 양쪽 생산 가드를 순차 반영한 뒤에만 통과할 생산 인수 Gate
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node /Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/project-teams/SKILL/checks.mjs --require-production
```

코드 산출 뒤 docs 전체를 `mortar|maliceMortar|fireMaliceMortar|폭풍소환|_mmAiming|_mmCharging|iceMortar|mortar-production-regression-ready`로 rg 검색했다. **35문서/121매칭**, 원문·경로·행번호는 evidence.json의 docsSearch에 있다. 보호 문서2_3과 공유 docs는 쓰지 않았다. 이번 산출 계약은 위 표로 기록했고, 상세 SSOT의 생산 상태 변경은 root가 실제 적용 후 동기화한다.

| root 동기화 대상 | 정확한 변경안 / 적용 시점 |
|---|---|
| `docs/2_1 스킬관리+합체시스템+자원/자원리젠+소모공식.md`, `docs/14밸런스+수치테이블/스킬별_DPS_자원소비표.md`, `docs/14밸런스+수치테이블/스킬_밸런스_리포트.md`의 현행 교정 상단 | 현재 `확정입력 재검사 patch는 아직 미적용`은 정확하므로 유지. 실제 양쪽 적용과 production Gate PASS 뒤 이 문구만 `확정입력 재검사는 양쪽 fireMaliceMortar 진입에 반영됨. 비용 부족 시 조준 유지·무발사·무차감, 실제 입력/패드 검수는 별도`로 바꾸고 본 보고서/실제 적용 체크포인트 근거 링크 추가. 비용·피해 수치 유지 |
| `docs/2_1 스킬관리+합체시스템+자원/SKILL03_설치확정_자원검수_20261001.md` 말미 | 지금 인수 가능한 추가 문장: `2026-10-02 mortar 생산 인수용 새 회귀 하니스142 PASS. frozen/승인 patch를 재사용하고 적용 전 메모리 후보·적용 후 생산 함수를 구분한다. 생산 미적용이며 --require-production은 양쪽 미적용 Gate를 거부한다. 실제 KBM/물리 패드·오디오·패키지 검수는 별도.` 이후 적용/실입력 완료 시 해당 실제 근거로 상태 갱신 |
| `docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md`의 투척계열 입력 설명(398행 인근) | 추가 계약안: `maliceMortar는 throw 중 동일 슬롯을 재입력하면 기존 폭탄 t=maxT로 즉시 착지하며 새 발사·MP 차감·RNG 호출을 하지 않는다.` 실제 dispatcher source와 본 회귀 parity 근거로 보충. 새 조작/수치 설계 변경 아님 |

위 변경안은 공유 docs 적용 요청이며 이번 팀 쓰기는 지정 폴더3파일뿐이다. 한글 역사 NFD 백업과 원담당의 당시 고정 MP50/시각 기록은 그대로 보존했다. root가 code+docs checkpoint와 정확한 원격 ref 검증을 소유한다.

남은 Gate는 root의 양쪽 최소 가드 순차 반영 → `--require-production` 인수 → QA 슬롯에서 실제 KBM·물리 패드 조준 중 MP/할인 변경, 부족 후 회복 재클릭, 취소·릴리즈·중복·합체를 검수하는 순서다. 이번 Node VM은 실제 게임/DOM/전체 update/물리/청취를 실행하지 않았고, 오디오 내부 RNG 및 전체 프로그램 RNG도 검수하지 않았다. UI·서버·게임·성능 측정·빌드·설치·에셋·Git쓰기·자동화 변경0이다.

소유 산출: `checks.mjs`, `evidence.json`, `result.md`(3파일). task.md는 root 소유로 byte 보존했다. Changes 시작23→중간48→완료 관찰50은 타 팀 공유 산출을 포함하며 이번 팀 파일 수와 구분한다. 최종 SHA·보존 대조는 evidence.json의 completion에 기록한다.

작업 중 공유 체크포인트가 `31454dfa49c90bac77351273fc32f0c1eb937928`로 변경됐고 해당 원격 ref도 일치함을 읽기 전용으로 확인했다. 검수 대상 생산6파일·원담당 patch/frozen·task.md는142 PASS 입력과 바이트 동일하다. Node 검수 실행 중 공용 인덱스 SHA는 보존됐지만 완료 조회의 인덱스 SHA는 공유 HEAD 전환과 함께 달라졌다(완료 조회 staging은 비어 있음). 이를 본 팀의 변경으로 추정하거나 되돌리지 않았다. 본 팀 Git쓰기는0이고 공유 인덱스·타 담당 산출을 편집하지 않았다.
