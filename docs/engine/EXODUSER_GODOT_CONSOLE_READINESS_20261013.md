# EXODUSER Godot 시도와 PlayStation 이식 고려 — 2026-10-13

사용자 직접 지시: “고도한번 해보자 뭐 플스이식같은것도 생각해야지”. 기존 `godot/`의 작은 native 이식본으로 PC 플레이를 먼저 검토하고, 콘솔 대응에 필요한 입력·저장·플랫폼 경계를 초기 작업 기준으로 삼는다. 기존 제작팀의 소스와 사용자의 실행 중인 앱은 그대로 보존한다. 이 문서는 콘솔 지원 구현·등록 승인·전체 게임 이식 완료를 뜻하지 않는다.

## 실제 출발점과 독립 검토 사본

| 항목 | 확인 범위 |
|---|---|
| 제작팀 프로젝트 | `/Users/fordeargamers/the-exoduser/godot/project.godot` → `res://scenes/main.tscn` → `scripts/main.gd` |
| 현재 실행 버전 | 로컬 공식 실행 파일 `Godot 4.7.2.stable.official.ed1daf0bf`; 검토 사본의 실제 버전·입력 파일 해시는 영수증에 기록 |
| 현재 좁은 게임 범위 | CH1-1 이동·충돌·기검참 3타/충전. 10/13 읽기 전용 조사 시 README는 초기 16개체 중 지원 3/미지원 13으로 기록. 이후 제작 소스는 변할 수 있으므로 검토 사본의 고정 manifest를 기준으로 삼음 |
| 아직 없는 본편 연결 | 전체 진행·로비·인벤토리·게임 진행 저장·Q 방패/패링·오디오. 작은 씬의 Q 공격 취소를 본편 Q 패링으로 설명하지 않음 |
| 현재 사용자 앱 | 앞선 첫 한 적 소스의 fullscreen pause 앱이라는 담당 기록. 이번에는 닫기·재시작·재로드·입력 없음 |
| 새 검토 결과물 | `output/godot-first-review-20261013/`의 캐시 제외 고정 사본, 실행 명령 파일, manifest·로그·영수증. 원본 source 대신 사본만 검사 |
| 사본 변경 | `project.godot`의 표시 이름과 `config/custom_user_dir_name`만 고유 검토 이름으로 분리. 전투·조작·수치·물리 60Hz·렌더 cap 240은 원본 그대로 |
| 검수 한계 | headless import/startup과 launcher 구문 검사는 그래픽·플레이·패드·성능·청취·Windows·콘솔 검수를 대신하지 않음 |

원본의 QA 파일도 `user://qa/latest-session.json`에 쓰므로 단순 폴더 복사만으로 저장 격리가 성립하지 않는다. 고유 custom user dir를 설정한 사본만 실행한다. 제작팀 `player.gd`·`enemy_projectile_physical.gd`의 WIP를 편집하거나 대신 커밋하지 않는다. 소스의 Mac 장치명 metadata를 Windows 측정으로 인용하지 않는다.

상세 전투의 정본은 제작 체크아웃의 `docs/engine/FDG_GODOT_NATIVE_FIRST_20261013.md`, `FDG_GODOT_ENCOUNTER_FACTORY_20261013.md`와 각 소비자 문서다. 본 문서는 그 수치·담당 기록을 재작성하지 않는다.

## 콘솔을 고려한 다음 구현 기준

아래는 구현 지침이며 이번 작업에서 게임 소스에 적용한 기능 목록이 아니다. 기존 제작팀의 다음 단위에서 소비하며, 첫 우선순위는 **마우스 없이 조작 가능한 동일 작은 전투 구간**이다.

| 경계 | 현재 소스에서 확인한 미비점 | 다음 구현과 인수 기준 |
|---|---|---|
| 입력 | action에 키/좌클릭만 등록, 마우스 월드 좌표 직접 조준, Space 직접 keycode | 키마·패드가 동일 gameplay action을 호출. 좌스틱 이동·우스틱 조준, 데드존·마지막 유효 방향, 홀드/해제·취소 동작을 같은 전투에서 확인. 기존 브라우저 패드의 facing 규칙과 재바인딩 의도를 보존 |
| 메뉴 | HUD 버튼 `FOCUS_NONE`, 패드 탐색 없음 | 방향키/스틱으로 pause·설정·재개를 탐색하고 확인/취소 가능. 패드 분리 시 held 입력 해제·안전한 pause, 재연결 후 fresh 입력 확인 |
| 안내 | 현재 WASD·마우스 중심 안내 | 실제 입력 장치에 맞춘 버튼 글리프·안내, 큰 화면에서도 읽히는 문자. DualSense 전용 기능은 기반 패드 조작 검수 후 별도 단계 |
| 게임 저장 | 현재는 QA 보고서만 저장 | 게임 상태 직렬화와 플랫폼 저장 서비스를 분리. PC의 `user://` 파일과 콘솔 계정별 저장 어댑터를 교체 가능하게 구성. schema version·읽기 실패 보호·원자적 저장·슬롯 이동 검수; 기존 사용자 세이브 자동 변환/덮어쓰기 없음 |
| 플랫폼 서비스 | Steam API·콘솔 서비스 통합 없음 | 업적·사용자 식별·클라우드 저장 등 플랫폼 호출은 별도 어댑터. Steam 로그인/브라우저/Node 서버를 전투 실행의 필수 조건으로 결합하지 않음 |
| 수명 | 일반 pause는 있으나 콘솔 suspend/user 변경 대응 없음 | suspend/resume·사용자 전환·기기 끊김에서 입력·월드·저장 수명을 분리. 정확한 플랫폼 요건은 승인 후 SDK 문서에 맞춰 검수 |
| 성능 | Mac의 한 적 측정 이력, Windows 최소사양 미측정 | 실제 PC export에서 밀집 전투·투사체·VFX 부하와 프레임 간격/메모리 측정. physics 60Hz와 렌더 FPS를 분리하고 기존 게임 속도·피해·Q/E 계약을 보존. 콘솔 목표 수치는 실기 검수 전 확정하지 않음 |
| 자산·렌더러 | 현재 Compatibility, PC 로컬 이식본 | PC export 자산 누락·셰이더·폰트·오디오부터 확인. 콘솔 포팅 제공업체가 지원하는 렌더러와 Godot 버전을 확인한 후 장기 사용 버전 고정 |

Q/E와 무지개탄의 확정 설계 및 `docs/2_3 돌진+패링+방패시스템`을 변경하지 않는다. 패드 매핑은 기존 계약과 현재 실제 caller를 대조해 정하며 여기서 새 버튼 배치를 확정하지 않는다. 모션의 실제 고유 자세·타이밍 개선과 성능을 엔진 이름이나 출력 FPS만으로 달성했다고 표현하지 않는다.

## PlayStation 공개 요건과 버전 선택

Godot Foundation은 공식 콘솔 포트를 유지하지 않는다. 콘솔 출시에는 플랫폼 승인·공식 SDK·비공개 export 템플릿이 필요하며, 자체 포트 또는 서드파티 미들웨어/포팅 업체 경로를 검토해야 한다. 미들웨어가 게임의 플랫폼별 대응을 모두 대신하지 않는다. [Godot 공식 콘솔 지원](https://godotengine.org/consoles/).

Sony의 공개 안내는 PlayStation Partners에 스튜디오 정보와 Project Plan을 제출하고, 등록 승인 후 GDPA를 체결해 개발 도구·문서에 접근하는 순서다. FDG의 현재 승인·SDK 권한은 이번에 확인하지 않았으며 승인 기간·출시일을 추정하지 않는다. [Sony 공식 등록 안내](https://sonyinteractive.com/en/news/blog/showing-your-game-to-playstation/).

| 검토 항목 | 2026-10-13 공개 자료 확인 / 남은 결정 |
|---|---|
| PS5 포팅 예시 | W4 Consoles는 PS5용 상업 미들웨어를 제공. 해당 업체 채택·구매·견적 문의는 이번에 하지 않음 |
| 중요한 버전 차이 | W4 공개 FAQ의 PS5 지원 목록은 Godot 4.4·4.5·4.6. 현재 PC 검토본 4.7.2가 지원된다고 추정하지 않음. 포팅 경로의 지원 버전·업그레이드 정책을 확인한 뒤 장기 고정 버전 결정; 지금 타인 프로젝트를 임의 다운그레이드하지 않음 |
| 라이선스 비용 예시 | 공개 Starter는 회사 30명 이하·매출 또는 조달자금 $300,000 미만 조건, 플랫폼당 연 $800. 외부 포팅 업체와 함께 사용하는 경우 FAQ는 Enterprise를 요구하므로 별도 견적. 이 가격은 전체 포팅 비용이나 FDG 확정 견적이 아님 |
| 외부 필수 단계 | Sony 등록·계약, SDK/개발킷 접근, 제공업체 자격·계약·비용, 실기 검수·플랫폼 인증. 현재 확보 상태 미확인, 이번 외부 가입/동의/지출/연락 0 |

위 W4 사실은 [공급자 공식 조건·가격·FAQ](https://www.w4games.com/w4consoles)를 확인한 시점의 기록이다. 구매 시점에 다시 확인한다. PC 검토는 이 외부 단계와 독립적으로 진행한다.

## 이번 결과와 다음 한 건

실제 검토 패키지의 해시·버전·import/startup 결과·격리 경로는 `marketing/operations/godot-console-20261013/receipt.json`과 패키지의 `receipt.json`에 기록한다. 패키지 실행기의 보존 사본은 `tools/godot-review-20261013/run-review.command.txt`이며 텍스트 참조용이다. 실제 실행은 로컬 패키지 루트의 `run-review.command`를 사용한다.

| 이번 검토 결과 | 실제 관측 / 경계 |
|---|---|
| 고정 입력 | 제작 HEAD `08e5cac1c4f51f0a3e89af87b02b21f0646490a8`의 작업 트리 285파일 / 190,164,244bytes, WIP 두 파일 포함. 원본 전후 해시가 같은 시점에 1회 복사; 이후 담당자가 README를 바꿨지만 고정 사본은 유지 |
| config 격리 | 표시 이름 `EXODUSER · Godot 독립 검토본 20261013`, user dir `EXODUSER-Godot-Review-20261013-bf58def0ea`; 이 두 항목 외 원본 코드·수치 변경 없음 |
| 실제 엔진 버전 | `4.7.2.stable.official.ed1daf0bf`; 실행 파일 SHA256 `c7cccbf8fb143e34e02fd6521e09be2c2b974f0d5db080b19071c9c570718ccf` |
| import / startup | headless import 1회 exit0·ERROR0, 입력 없는 5프레임 startup 1회 exit0·ERROR0·READY marker1. Camera2D interpolation override 경고 1건은 원 로그에 보존; 원본 수정 없음 |
| 실행기 | `zsh -n` exit0. GUI 실행기 실행 0회, 화면·플레이·원음·패드·성능·Windows·콘솔 검수는 미완료 |
| 원본·저장 보존 | 원본 코드 작성 0, 기존 앱 입력/종료/재시작 0, 기존 user dir 파일은 검사 전후 동일. 검토용 새 로그만 별도 user dir에 생성 |
| manifest | SHA256 `68aeb6869a1f48fb216b9e3422424c5b77c72ee1d8a243dc6fbea5b507a7c373` |
| 별도 복구 입력 | `codex/backup-godot-review-20261013-bf58def0ea`, `recovery/godot-review-20261013/`에 고정 프로젝트·manifest·launcher·로그 보존. WIP이며 정식 통합/배포 커밋 아님. 원격 ref 대조 결과는 요약 영수증을 따름 |
| 제외 | `.godot` 캐시·사용자 데이터/세이브·smoke 중 생성된 시험 UID·Godot 실행 파일/SDK·타인 무관 파일. 원본 작업 브랜치와 공유 인덱스를 변경하지 않는 독립 index로 복구 tree 생성 |

복구 snapshot은 위 첫 headless 검사 후 고정 입력을 보존한 기록이다. 콘솔 빌드·사용자 GUI 검수 전에 확인하는 출발점이며 앞선 검사 전에 원격 보존을 마쳤다고 소급하지 않는다. 일반 마케팅 브랜치에는 이번 소유 문서·launcher 텍스트·요약 영수증만 기록하고, 고정 소스는 별도 WIP 복구 브랜치와 구별한다.

다음 제작 한 건은 같은 Godot 전투의 **패드 이동·조준·공격·취소·pause 메뉴**다. 완료 기준은 사용자 패드로 동일 구간을 조작해 입력 누락·홀드 잔류·메뉴 고립이 없는 실제 화면과 관측이다. 기존 제작 담당 경계를 유지하며 로컬 문서에 기준을 남긴다. 다른 채팅으로 새 작업 지시를 보냈다고 보고하지 않는다. 홍보는 기존 사용자 플레이→실제 화면 전체·원음 녹화→완성 미리보기 검수 순서를 계속 따른다.
