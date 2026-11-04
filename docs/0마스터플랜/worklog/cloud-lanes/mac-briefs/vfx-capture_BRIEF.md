# BRIEF — vfx-capture-batch: 임펙트 판정 재료 촬영 3건 (PC 무창 후보 촬영)

작성: 임펙트 총괄(Opus), 2026-11-04. 소스 수정 없이 **빌드·촬영·판정 재료 만들기**만 한다. 판정은 임펙트 총괄이 한다. 사용자 11-04 아침 결정으로 PC 무창·무음 후보 촬영이 허용됐다. 공용 실행기 `-PcException candidate`를 쓰고, 고정 후보 빌드에서만 찍는다.

## 공통
- 실행기: `I:/EXODUSER-Storage/unity-jobs/bin/exo-unity.ps1`. 사용법은 같은 폴더 `README.md`에 있다. 실행기는 **직접 호출**하고, 셸 스크립트 래퍼로 감싸지 않는다.
  - Player: `player -PcException candidate -Owner vfx-capture -Desktop hidden -TimeoutSec 1800`
  - 빌드 인자: 반드시 `-remodel-scenes,1`을 넣는다. 빠지면 3D 장면이 빠져 2D 폴백으로 찍힌다.
- 순서: ① → ② → ③. Player는 한 번에 하나만 띄운다. 다른 Player나 앞 티켓이 있으면 기다린다. HALT 파일이 생기면 그 자리에서 멈추고 보고하며, HALT 파일은 지우지 않는다.
- 판정 재료는 **ffmpeg로** 만든다(크롭·hstack/vstack·mp4). python은 금지다.
- 산출물은 각 고정 폴더에 덮어쓴다. 이전 판은 `prev/` 하위로 먼저 옮긴다.

## ① 적 피격 r4 재촬영 (U-VFX-13)
- 후 빌드는 이미 있다: `I:/EXODUSER-Storage/hits-candidate/build`. 소스는 `claude/unity-pc-vfx-hits-20261104` @ `61ef5d2ec`이고, 빌드 영수증과 작업본 HEAD로 확인한다. 전 빌드도 있다: `.../hits-candidate/build-before`.
- 인자: `--unity-impact-review --unity-mute --unity-qa-sandbox <고정>/profile -output <고정>/review -impact-width 1920 -impact-height 1080 --remodel3d --hero-render=rigpixel`. 후 촬영만 다시 찍어 `capture-after/`에 둔다. 전 촬영은 기존 것을 쓴다.
- 확인:
  - `impact-review.json`의 `world3D=true`·`contacts>0`·`lobbyVisible=false`. `passed=false`가 `flipbookFrames=0` 때문이면 알려진 일이라 실패로 세지 않는다.
  - 첫 명중 구간에서 피해 숫자 "312"가 후 프레임에 보이는지 프레임 번호로 적는다.
- 재료(`compare/`):
  - `core-trace.txt` 첫 명중(HP 첫 감소 행) 기준 +0·+1·+2·+4·+8·+12·+20 샷
  - 일반공격·기검참 3타 각각 640×360 원본 크롭, 위가 전·아래가 후 → `hit-normal-1x.png`, `hit-ki3-1x.png`
  - 접점 220×124 최근접 3배 → `hit-normal-3x.png`
  - 좌우 나란히 10초 무음 mp4
  - 첫 명중 위치는 1차 `compare.py`의 방식(크롭 중심 x-30)을 따라 ffmpeg 인자로 옮긴다.

## ② 앵글러(크라켄) 물 에너지탄 촬영 (U-VFX-14)
- 소스: `claude/unity-pc-vfx-angler-water-impl-20261104` @ `0409212b9`. 빌드 작업본 `E:/exoduser-wt/codex-vfx-capture`를 이 SHA로 새로 만든다. sparse는 `/unity/`, `/tools/`, `/release-version.json`이다. 이 작업본 Library는 새로 임포트한다.
- 빌드: 고정 폴더 `I:/EXODUSER-Storage/angler-candidate/build`, `-remodel-scenes,1`.
- 촬영 경로 찾기(코드 읽기만, 수정 금지):
  - 1-1 필드 보스 "심연의 앵글러"(`Simulation.FieldBoss.cs`, 남서 물 앵글러 포함 4마리)의 에너지탄이 화면에 나오는 기존 QA 촬영 모드를 찾는다. 후보는 `--unity-fullrun-qa` 지역 진행, A2 필드 캡처(`NativeGame.A2FieldCapture.cs`), 기타 `*Capture.cs`다.
  - 찾은 모드의 인자로 1920×1080 무창 촬영을 하고, 충전·발사·비행·플레이어 피격·(가능하면) Q 패링 5발 분열 장면을 연속 프레임으로 모은다.
  - 찾지 못하면 시도한 모드와 이유를 보고하고 멈춘다. 촬영용 코드를 새로 쓰지 않는다.
- 재료(`I:/EXODUSER-Storage/angler-candidate/review/`):
  - 장면별 1x 640×360 크롭 띠
  - 3x 크롭
  - 10초 무음 mp4

## ③ 튜토리얼 소환진 재촬영 (첫인상 4순위 RETOUCH)
- 소스: `claude/unity-pc-vfx-summon-silver-20261104` @ `c56bc4254`. 작업본 `E:/exoduser-wt/claude-vfx-summon`이 있다. **이 작업본에는 다른 커밋을 만들지 않는다.** HEAD가 `c56bc4254`인지만 확인한다.
- 빌드: `I:/EXODUSER-Storage/summon-candidate/build`, `-remodel-scenes,1`.
- 촬영: 전(`--unity-barrier-legacy`)과 후. 인자·샷 이름은 `I:/EXODUSER-Storage/summon-candidate/` 안 기존 실행 기록(`run_player.sh`·로그)에서 그대로 가져온다. 탄·먼 적 컷 `guide-1-bullets-1920`도 포함한다.
- 전 촬영이 캐릭터 생성에서 실패하면(`create=False`) 실패 로그만 모아 보고하고, 후 촬영은 진행한다.
- 재료(`I:/EXODUSER-Storage/summon-candidate/compare/`):
  - 1x 전후 같은 크기 나란히 `compare-1x.png`
  - 소환진 3x 크롭
  - 5초 무음 mp4 전·후
  - 바닥 대비 밝기: ffmpeg `signalstats`로 소환진 선 영역 p99와 주변 바닥 p99를 재서 배율을 적는다. 기준은 1.6 이하다.

## 금지
- 저장소 소스 수정, Core 수정, `git add -A`, `--no-verify`, force push.
- 창·소리 띄우기, 공용 실행기 밖 Unity·Player 실행, `-popupwindow`·전체화면.
- python 사용 금지(node·dotnet·ffmpeg로). 모든 명령은 `</dev/null`.
- `I:/EXODUSER-Storage` 전체 재귀 검색 금지. 필요한 하위 폴더만 지정한다.
- `taskkill /IM` 금지(자기 PID만). HALT 파일 삭제 금지.
- 같은 이유로 2회 실패하면 그 항목을 멈추고 다음 항목으로 넘어간다. 보고에 적는다.
- 사용자 세이브 접근, 다른 레인 작업본 수정 금지.

## 결과
같은 폴더 `REPORT.md` 맨 위에 항목별로 다음을 적는다.
- 빌드 소스 SHA·영수증(성공·오류·크기)
- 촬영 영수증: `world3D`·`contacts`·로비, 창 0, USER_SAVE 변화, 남은 프로세스
- 산출물 경로 목록
- 하지 못한 것과 이유
