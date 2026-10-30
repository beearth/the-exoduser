# 전사 R5 후속 — 중심형 강타 앵커

상태: **새 빌드·실제 전후/고정탄·같은 빌드 M1 완료. 중심 앵커 수정 PASS / 전체 아트 RETOUCH. 공통 통합·실행본 전달은 아래 영수증에서 별도 확인**. 기존 R5 전달 완료와 이 새 소스 입력의 검증은 별도다. NIGHT_ROSTER_20261031 및 사용자8시간 야간 승인 중 다음 한 건이며08:34 KST 이후 새 단위는 시작하지 않는다.

## 원인과 최소 수정

원본 웹 `game.html`57123의 강타 시트는 `w.x-size/2,w.y-size/2`로 중심 배치한다. Unity NativeSkillView도 pivot(.5,.5)를 Core X/Y에 놓지만 NativeGame.Remodel3D의 공용 billboard가 pivot 반높이×스케일을 더해 하단을 지면에 붙였다. 이 캐릭터용 발끝 계약을 중심형 wave/flash에 적용한 오류다.

| 구분 | 수정 전 | 현재 소스 계약 |
|---|---|---|
| Lv1 강타648px wave | lift3.24m, pitch48.7014°에서Y+2.1383/Z+2.4341m | 중심형 registry 등록·lift0. 회전/배율/프레임/색/알파는 그대로 |
| 최대900px wave | lift4.5m | 중심 pivot 유지·lift0 |
| flash84/63/42px | lift.42/.315/.21m | 중심형 registry 등록·lift0 |
| 분류 | 기존 `IsCenteredMaliceSprite`만 예외 | `IsCenteredSkillSprite`가 기존 악의구 분류 또는 새 `centeredSlamSprites`를 조회 |
| 수명 | 강타 전용 등록 없음 | 생성 시wave/flash2개 등록, Drop·Reset에서해제. 악의구 registry는 별도 유지 |
| 유지 범위 | 원본 표시/전투 계약 | 악의구 중심·캐릭터/플레이어 발끝·2D 비활성경로·회전·카메라·히트/피해/기간·크기/알파/밝기·Core·저장 불변 |

소유 소스는 `NativeSkillView.cs`, `NativeGame.Remodel3D.cs`의 중심 앵커 구역뿐이다. `NativeGame.cs`·UI·보스·게임대조·Core는 수정하지 않는다. 신규비용/삭제/외부배포/새CLI·작업본0. 기존skill앱은 재개하지 않고 인계 조사 폴더는 읽기만 한다.

## 오프라인 회귀

`unity/Tools/hero-anchor-check/check.cjs`는 실제 wave/flash 생성문·분류 함수·lift 식을 추출해 수치 DTO에서 실행한다. 기존 코드의 RED12검사 중7실패(실제wave3.24/4.5/1.6m·flash.42/.315/.21m 및등록해제미구현), 최소 수정 뒤 GREEN14/14다. 추가2개는 구현된등록해제와 악의구 registry 분리를 검사한 것이다. 컴파일·Unity실제컴포넌트/GPU·밀집탄막/히트·M1 증거가 아니다.

근거: `I:/EXODUSER-Storage/demo-art/hero/night-anchor-20261031/red/`·`green/영수증.json`·`결과.log`, `착수-상태.json`, `원본-소스/`. 인수시HEAD/원격공통/자기branch=`a861d03037ead23aa022b9be4ae7f9d83156d09c`·INDEX빈상태·소유2소스WORK0·기존Unity파생522WORK보존. fetch/정상merge결과동일최신. 코드후전체docs키워드검색을수행하고 본문과Runtime/리모델SSOT에연결한다.

## 실제 검수 게이트

UI 최종 Desktop 완료 전 Unity/Player/빌드/선예약0. 완료 후 최신원격을정상병합하고 현재실제입력·파생WIP/생성씬을해시로기록한다. 단일PC 공식실행기로 같은R5시전/E틱의 전후1600×900·같은크기/1x를 확인하고, 고정 적탄의 종·수·위치·속도·틱을 기록한 별도 표본을검수한다. R5 fixture는Enemies.Clear/AI·자연생성OFF이므로 단독프레임으로 밀집적탄PASS를선언하지않는다.

새소스 변경영향 검증 뒤 같은빌드M1→MERGE_QUEUE→기존지정통합담당 정상반영→현재실행본4속성/3SHAreadback 순서다. 기존R5 완료M1을그대로반복하지않는다. 같은실패2회는중단/방법전환·FAIL채택0, 코드+관련docs 정확경로커밋/원격보존. 전체아트RETOUCH는새현재직접판정전해소로바꾸지않는다.

### 자기 회귀 Tools 준비·오프라인 컴파일

`Runtime/Tools/HeroAnchorCapture.cs`는 명시적 `--unity-hero-anchor-check`·기존 `--unity-hero-review`·세이브격리·출력인자가 모두 있어야 생성되는 검수 도구다. NativeGame.cs/기존 HeroCapture는 수정하지 않는다. 기존Player rsp 기반의 독립Roslyn컴파일은오류0·자기신규경고0/기존14경고다. `compile/영수증.json`·`결과.log`. Unity/빌드/Player실행으로보고하지않는다.

검수예정 고정탄은 **3종×8=24개**(물리입·번개마법혜성·불속성구), 열X오프셋−180/−90/90/180px와행Y−140/−84/−28/28/84/140px에순환배정한다. Vx=Vy=0·Dmg0·R4·Sz1·Life/Ml6000, 실제틱을그대로기록한다. 실제게임Simulation에는표본을넣지않고 별도표시용Simulation+기존NativeBossView로만그려 AI/히트/피해/RNG를건드리지않는다. 종류별그리기수·fallback·실제renderer/화면좌표·시트rect·wave나이/크기/색/좌표를실제3D카메라의렌더종료이벤트에서기록하고같은프레임스크린샷을요청한다. 기존HeroCapture는EndOfFrame직후다음Core틱을진행하므로후순위EndOfFrame코루틴의틱오염을피한다. 카메라설정/기존하네스소스변경0이다. 시간기반프레임이달라지는독구표본을피하고틱기반세종으로고정한다.

`baseline`은같은새빌드에서 새강타registry만비워R5기존lift를재현하는명시적QA대조다. 과거R5바이너리실행으로표시하지않는다. `current`는제품수정그대로, `control`은검수대조에서만wave/flash를숨겨탄표본/머리·견갑기준을읽는다. 일반실행의크기/색/알파/밝기는어느모드에서도제품코드로바꾸지않는다. 이도구작성·컴파일만으로실제시각/밀집탄막PASS를선언하지않는다.

## 2026-10-31 실제 새 입력 검수

| 항목 | 실제 근거·판정 |
|---|---|
| 입력 | 제품 ccde13cb95d21c7b71f4982af13193dbd356edd1, Unity tree f83cf2d7b26ad66091cc030431961d43a248f0af, Core tree57337696a4b4d6e6c264c0ee6c95b9b58bef7d67. 상위UI/게임대조/Core/MCP 공통을 정상 인수했으며 타소스 직접편집0 |
| 선행UI | candidate3 최종Desktop4속성/3SHA를확인한뒤예약·Unity착수. UI게이트전실행0 |
| 새 정식빌드 | b970760a, Unity6000.6.7f1, Win64/D3D11, 컴파일/셰이더오류0 |
| 전후대조 | 같은 새 빌드 baseline6546ee34/current5ec63959/control재검증8a016efd, 각각30/30·579PNG·실제렌더39표본. 전후같은틱·카메라·탄·크기/색/알파/나이일치 |
| 실제앵커 | current39표본wave/flash중심오차0. baseline초기실측tick828 size687.200012px/lift3.4359989m, 최대900px/4.5m. 오프라인648px/3.24m와구분 |
| 새 M1 | aaf2078e, 같은build/DLL23/23·exit0·창0·잔여0·사용자세이브변경0. 기존R5 M1 재사용아님 |
| 새 Core | 정확 DLL0f103172439451ada005e19726cfe32f79b1f15e3682de8bf0a9a408ac096266 독립접점11/11, 첫입력피해461/파동1/heavy_hit1·무입력피해0. 기존R5 DLL검사재사용아님 |
| 실제첫접점 | currenttick827, 피해461·파동1·칼끝.01019158m,대기높이.0938544. 기존R5모션회귀없음 |
| Runtime | a51b7b77740804f80df6f53452f8efec6a6a29b469762b5272a021e933c329bf |
| EXE | 9806abde4a406ed68647e9505852c49f6aa72a372f4f084e2aa2821affea57a2 |

제작자가실제1600×900원본및같은틱1x를직접확인했다. 중심앵커/머리·견갑개선PASS, 정지고정탄24가독성범위PASS, 자연밀집전투·움직이는탄막은미검증이다. 1x직접판정은 night-anchor-20261031/판정.md, 전후14틱비교는 comparison/검수.html. 하단수평잘림·강한화염명암·기존흰arc파지가림은남아전체아트RETOUCH이며VFX담당후속이다. 크기/알파/밝기/카메라·셰이더/깊이를변경해감추지않았다.

최초current무로그실행실패는원인미확정으로보존했고공식실행기의한파일진단경로에서재검증성공했다. 최초control871996ef의정리잔여2경고는성공으로덮지않고재검증8a016efd잔여0만채택했다. 새소스두번실패채택0. 최종채택3Player및M1은창/잔여/사용자세이브변경0, 자기예약공식반환.

보존제약: 빌드전522파생WORK는해시목록을기록했으나생성씬byte백업1건을누락했다. PortVerification이FirstPlayable.unity를재저장해521byte동일·생성씬1변경이다. 알려진UI백업및Git씬이전바이트와불일치하여추정복구/전체초기화하지않았고현재씬·diff·전후SHA를I:생성씬-보존/에보존했다. 기존생성씬의byte복구는미완료이며522전부보존이라고보고하지않는다. 해당씬은커밋에넣지않는다.
