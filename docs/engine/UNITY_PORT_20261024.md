# Unity 이식 전환 · 첫 실행 후보 — 2026-10-24

사용자 최신 지시 “유니티는 잘 될 수도 있으니까 그냥 유니티하던가”에 따라 이식 구현의 현재 타깃을 **Unity**로 전환했다. 기존 Godot를 완성했거나 실패한 엔진으로 판정한 것이 아니다. Godot 후보와 복구 브랜치 `codex/port-takeover-20261023`의 원격 `7d67c418205f4ae513a320df854bcad3cf7c7770`을 보존한다.

| 경계 | 현재 값 |
|---|---|
| 작업 브랜치 | `codex/unity-port-20261024` |
| 현재 프로젝트 | `E:/exoduser-wt/codex-port-takeover-20261023/unity` |
| 기반 HEAD | `7d67c418205f4ae513a320df854bcad3cf7c7770` |
| 원격 main 참고 | `fab7a167c30c6421bda8cf6d4c2ee2e7753e87f3`; 이 후보를 main 병합으로 보고하지 않음 |
| 공유 G: | HEAD `5659d14d38b8068518cb5866a336bf930a1abbce`, 기존 staged480파일 및 WORK 보존 |
| Unity | 설치된 `6000.4.8f1 (f8b72d3d7343)`, Windows standalone 모듈 존재 |
| 실제 실행 검증 | **BLOCKED_LICENSE**. Editor 종료198, `No valid Unity Editor license found` |
| Hub | `G:/unity/Unity Hub/Unity Hub.exe`, 버전3.18.0 창/handle 확인. 로그인·활성화는 사용자 계정 단계 |

## 이번 구현과 검증

| 항목 | 구현 / 증거 |
|---|---|
| 실행 구조 | C# Simulation → Unity NativeGame → SpriteRenderer·Camera·IMGUI. WebView·JS runtime 없음 |
| 시간·좌표 | 고정60Hz, 웹 픽셀/+Y 아래 → Unity100px/unit·Y 반전. 카메라1920×1080 기준 zoom1, 플레이어 중심 |
| 시작 | `FirstPlayable.unity`·EditorBuildSettings·고정 GUID. 메뉴에서 기본 무기 모드를 명시 선택 |
| 원본 상태 | 원본 mkP/defaultItems/applyStats의 실제15장비 표본. HP526, ST240, MP330, 쉴드285, 녹슨 검ATK18. [수치·함수/미완료](UNITY_SOURCE_CORE_20261024.md) |
| 시작 악의 | 사용자 공유 저장소를 열지 않는 격리 새 실행 기본1000(`game.html:63958`), 처치당+4 |
| 원본 맵 |200×200/40px, 시작4020,7420; 청크64·props36·타일/언덕 경사로/19prop ellipse. 새 지형 제작 아님 |
| 미디어 |131복사 영수증/184,121,038bytes, 각 파일 원본↔목적지 SHA256 대조. `Tools/Fixtures/source_receipt.json`(I:); 신규 이미지 생성0 |
| 기본 전투 | 일반 etype0 HP875+쉴드875(레벨1), 기본 무기 비용5·5프레임 swing/남은3 경계 타격, 원본 회복시간; 스폰 링5/580px·safePt |
| 드랍 | 원본45% 장비 생성 요청까지. 실제 mkItem/inventory 없으면 R 획득을 거절함. 가짜 아이템 획득 없음 |
| 모델 회귀 | .NET8 독립36검사/0실패. 원본 isW/canMv 직접 실행2523좌표 결과 일치. `portable-final/core-receipt.json` |
| 시작 장비 | 오프라인 원본505난수/15장비, 설정23필드 대조23/23. raw JSON은 `Tools/Fixtures`(I:)에 보존, 실행은 C# 설정 사용 |
| 넉백 | 정적 검토 발견 +kb/.05 helper를 원본32764의 합성 충돌 kb×.5/감쇠.65로 수정. RED4실패→GREEN5/5 |
| 컴파일 | 설치 Unity assemblies에 대한 별도 .NET 정적 컴파일0오류/0경고. **Editor compile/import PASS 아님** |
| 검토 | core spec 제한범위 PASS; 코드 품질 검토에서 렌더120FPS/시뮬60Hz 걷기 깜빡임을 TickCount 캐시로 수정, 재검토 미해결P1/P2 없음. 실제 화면 인수 아님 |

원본 스냅샷 SHA256 `dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209`. 현재 G: 웹 핵심13함수는 동일하고 파일 전체 hash는 다르므로 최신 웹 전체 이식이라 부르지 않는다. 영수증과 첫 실패는 `I:/EXODUSER-Storage/qa/unity-port-20261024/`에 보존한다.

## 실행 차단과 다음 작업

1. Unity Hub 로그인·보유 라이선스 활성화. Personal 활성화의 공식 경로도 Hub다: [Unity 라이선스 관리](https://docs.unity.com/en-us/hub/manage-license).
2. Editor 실제 import/compile → 원본 texture 크기/씬 검증 → Windows 고유 출력 빌드.
3. 원본처럼 입력해 이동·공격·피해·처치·성장을 실제 Player에서 검수하고 화면/프레임/오류를 기록한다.
4. 기검참·장비 생성/인벤토리·전체 적/투사체·Q/E 보호 계약·사운드·저장·지역/보스/클리어를 원본 순서에 따라 확대한다. 현재 후보로 전체 이식 완료나 Unity 우위 확정을 주장하지 않는다.

Q/E 판정, 사용자 세이브, 웹/Godot 게임 코드, `2_3` 문서는 변경하지 않았다. 자동 서버 재시작·옛 팀 재가동·Steam 배포도 없다.

## 저장 정책

실제 Unity runtime C#·참조 미디어·실행 설정만 E:에 둔다. Library/Temp/Logs/UserSettings/Editor/Tools와 QA는 I:의 명시 단위로 분리했다. Junction 원본은 삭제하지 않는다. 라이선스/인증 파일은 Git이나 QA에 복사하지 않았다. Hub를 처음 띄울 때 `ALLUSERSPROFILE` 누락으로 경로 오류가 나서 해당 자식 프로세스에 실제 `ProgramData` 경로를 전달했으며 사용자 전역 환경은 바꾸지 않았다.

## MAP PRODUCTION REPORT

| §23 항목 | 이번 상태 |
|---|---|
| STAGE / MASTER | CH1-1 원본 데이터·전체 silhouette/regions/routes/side spaces 보존. 신규 master 제작 없음 |
| OUTER MASS / LARGE / MEDIUM | 원본64청크·36props 재사용. 배치·overlap·접합 변경 없음; 기존 웹 표현을 Unity에서 재검수해야 함 |
| GROUND | 원본 source_rect1,1/1024px → world1000px로 정렬. 그림자·안개·동적 생체 표현 미이식 |
| PLAYABLE | 원본 canMv2523표본 일치. 실제 Unity combat readability·경로종주 미검증 |
| LANDMARK | 원본 좌표 보존, 상호작용/보스 진행 미이식 |
| CAMERA QA | START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 모두 라이선스 차단으로 미검증 |
| TECH QA | 모델 충돌/코어·정적 compile만 통과. Unity loading/seam/GPU/performance/실행오류 검증 전 |
| FILES / GIT | unity 소스/에셋·자기 docs만. 타 팀/공용 staging/Godot 원본 무수정. 커밋·원격 SHA는 외부 DONE 영수증 |
| VISUAL VERDICT | **미검증 — PASS/RETOUCH/FAIL 판정 보류**. 실행할 수 없는데 시각 판정을 만들지 않음 |
| NEXT PASS | 라이선스 활성화 후 실제 import·실행·캡처 및 원본1x 비교 |

지정된 PASS/RETOUCH/FAIL 셋 중 현재 후보를 ‘완성 인수 가능’으로 판단하면 **FAIL(시각 미검증·기술 실행 차단)**이다. 이는 실제 렌더 화면을 본 시각 품질 평가와 구분한다.
