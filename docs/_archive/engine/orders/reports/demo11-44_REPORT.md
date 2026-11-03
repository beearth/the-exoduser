# DEMO11-44 — 펫·아이리스와 실제 전투/클리어 owner 연결

기준 main `0138c5bb9188d27cee10cb1a901d075092ddb88f`. 지정 DEMO11-37 `05f41cc7b8ad220a3e573ee180d0dffcae29427b`와 연결 대상 DEMO11-31 `76bcae8d216d2242984c70a3b4fad45ae3e8a3b4`를 정상 merge했다. 구현 기준 merge `b0073340e6039dc8ac49337b123aa004b8987ad4`. Main/State 말미의 PC runtime stats·forge·37 progression을 모두 보존, rebase0. 31은 아직 main에 없어 승인된 연결 대상을 의존으로 반입했다. 맵 좌표/지형 제작0.

| 근거·접점 | 구현·경계 |
|---|---|
| P2-004B/native_pets, G9516–9523/9606–9612 | 실제 State HP·자원 읽기와 기존 Player telemetry 카운터 재사용. 생존/회복 안내이며 펫 자체 피해/회복 효과는 없다. 25b State/HP authority 회복 writer를 실제 통합 fixture에서 검증. 원본 G41496–41541에도 펫 공격/회복은 없다 |
| G9539–9553, G9675–9680/9693–9696 | 완료된 실제 arena actor snapshot에서 그로기/텔레그래프·phase·intro 읽기. 기존 원문·경계·티어/CD를 재사용. execution>=1의 _execCd는 미연결이므로 처형/그로기 선택 HOLD, 가짜 CD0/회복 없음 |
| P3→37 gate/reward/clear, 31 family_defeated | 실제 gate 신호의 긴급 대사, PC 최종 처치 수락 후 State 보상 신호의 강제 boss_kill, 중복/외부/교체 owner 거부. family final·Exit clear는 receipt 관측만. G9795/9810 정의의 chapter/speed callback은 원본 live 호출이 없어 새 자동 발화0 |
| Iris G41514–41541 | 기존 반경800·엄격거리·10틱 재탐색·부유 보간·xy>10 조건을 사용, 원본 ens 소속인37 boss snapshot만 읽기 후보로 추가. 별도 field 앵글러는 G41522 검색에서 제외되므로 포함하지 않는다. 최종 사망 뒤 stale boss 후보 제거. 일반 enemy registry/피해/HP/저장 writer 추가0 |
| 공용 변경 (의존 merge 대비) | Main357 추가1줄(bind 호출). State/World/Player/PC 피해·패링·저장0줄. NativePets20–21·59–126·305–309·322–338·384–385·565–574·607·612–622·719–728·921·933. catalog172/186/200/872/886/900/914/1592/2293의 connected만, generator9 연결 선언1줄. 실제 hunk는 common-ranges.diff. 틱 목록 생성 API0. 현재69/102(원문171불변). 기존 검사는 정확한102개 경계 및 신규9개 선언 검사로 갱신 |

| 검증 | 결과·한계 |
|---|---|
| 원본 JS 및 신규 실제 통합 | Node 원문9 ID 전체 필드/행 대조+미연결 보호10/0. 실제 원본 urgent JS56fixture를 UTF-8 파일로 받아 정책 대조, 포함 신규75/0·skip0·exit0·ERROR0, Camera 경고1. 실제 Main/State/owner를 사용하지만 HP/Marker·PC final 신호는 명시 fixture이며 자연 전투 사망/피해 증거가 아니다 |
| 기존 관련 회귀 | 각1회: P2-004B 대사794/0·runtime10/0·P2-004A20/0·37 encounter148/0 =972/0. ERROR0·skip0. 대사 외 Main 사용3종 Camera 경고각1, 원문 보존. 통과 스위트 반복0 |
| 번역·보존 | 기존 main 번역 목록4225 CRLF 바이트는 그대로 포함. 의존 merge의 새 prefix18 LF만 byte 단위 CRLF로 맞춤. 누락된 기존 대사4문장 KO/EN 추가. 전체 bare LF0, file/diff-stat 원로그로 확인. 새 UI 스타일·문구 창작0, 실제 언어 전환은 기존 HOLD |

원로그 `~/exoduser-wt/_out/demo11-44/`. 신규 격리 `EXODUSER-demo11-44-Isolated-20261021`; 기존은 각 파일 상수. Godot 전 pgrep>=2면30초 대기, override finally 제거. 소스·큰 JSON 전체 출력0. 원본·피해·HP writer를 수정하지 않았으며, 자연 전투/제품 MAP Marker 설치/PC 최종 producer/음성/실창/Windows·전체 게임 성능은 미확인이다. 펫·아이리스 직접 회복을 새로 만들지 않은 근거는 docs/2_4 최신 무료·비공격 규칙과 위 원본행이다.

후속 원본 감사에서 두 접점을 보완했다. G9524의 source ens에는 arena 보스가 포함되므로 별도 native boss snapshot도 평균 공격력/주변 수에 포함한다(별도 field는 제외). G41522는 ens만 검색하므로 최초 후보의 field Iris 추적을 제거하고 신규 기대값을 정확한 제외 검사로 교정했다. 예비 신규75/0은 이 교정 전 값으로 보존하며 최종 통과 수에 합산하지 않는다. 보스 평균 접점 집중5/0·exit0·ERROR0·Camera 경고1을 별도1회 검증했다. 교정한 신규 연결만 재확인하고 기존 통과 회귀는 반복하지 않는다. 전체 source clock 동치·Y키/크기 설정·언어 전환의 추가 이식은 이 이벤트 연결 범위에서 인수하지 않는다.

최종 교정 신규 연결은 `new-02`75/0·ERROR0·Camera 경고1. 최종 Godot 합은 신규75+집중5+기존972=**1,052/0**, Node10/0은 별도다. 예비75는 합산하지 않았다. 각 실행 원로그와 pgrep 대기는 보존하며 원본/source snapshot·PC 피해 writer·State writer는 구현 기준 merge와 byte 동일하다. 최종 R/원격 SHA/DONE·worktree 제거 영수증은 `_out/demo11-44/`에 남긴다.
