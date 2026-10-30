# 유니티 캐릭터 총괄 인계 — 2026-10-28 09:xx KST

## 2026-10-31 R5 후속 중심형 강타 앵커 한 건 마감

- 전사 담당 최소수정: wave/flash에명시적중심registry를두어캐릭터발끝lift에서제외했다. 웹중심계약 RED7실패→GREEN14/14, 악의구중심·일반캐릭터발끝·2D·히트/기간/피해·크기/알파/밝기·카메라불변이다.
- 제품ccde13cb9, 공통bf9b2d25c28a44d4a90e8f2017a27f8d5f657394(지정담당정상FF/원격확인). 새빌드b970760a, 실제전후/대조30/30·579PNG·각39표본, 정확새Core독립11/11, 같은빌드M1aaf2078e23/23. 구R5완료M1재사용아님.
- 같은틱1600×900/1x직접판정: **중심앵커/머리·견갑개선PASS / 전체아트RETOUCH**. 3종×8=정지탄24(위치·속도0·실제틱고정)에서형태가독성확인. 자연밀집전투/움직이는탄막PASS아님. VFX담당후속=바닥경계수평잘림·강한화염명암·기존흰arc파지가림. 독립검수자PASS·AAA완성으로올리지않는다.
- 일반Desktop `I:/EXODUSER-Storage/demo-art/hero/night-anchor-20261031/build/EXODUSER-Unity.exe`, 인자-force-d3d11 --remodel3d. 이전게임대조링크I동일byte백업→CAS전달→별도프로세스네속성/3SHAreadback, 앱자동기동0. 동일Unitytree/정확바이너리검수재사용으로새통합빌드·추가M1반복0. 자기예약공식반환·타잠금/예약변경0.
- 보존제약: 기존파생522중521byte동일, 빌드재생성씬1변경. 이전씬byte백업누락으로정확복구미완료, 현재씬/diff/전후SHA를I:에보존하고추정복구·전체초기화·씬커밋하지않음. 최초current무로그실행실패와최초control정리잔여2는원본보존·재검증성공만채택했다.
- 근거 `I:/EXODUSER-Storage/demo-art/hero/night-anchor-20261031/`의새입력-게이트.json·판정.md·comparison/검수.html·desktop-readback.json·생성씬-보존/영수증.json, 한국어총괄보고hero/REPORT.md. Mac실제반영/실행pending.08:34KST이후새야간단위0.


## 2026-10-31 전사 R5 데모 v0 전달 인계

- 제품 `d8adbb744`, 공통 `a861d03037ead23aa022b9be4ae7f9d83156d09c`(기존통합담당 정상FF/원격확인). 빌드7fa69146·Player59091cbc30/30·579PNG·대기스킨9.3854%·영상→무창M1e4bd2cc223/23. 컴파일/셰이더0·정상exit0·창/잔여/세이브변경0.
- R4강타233ms 지연 FAIL은 철회하고 이전skill-fix링크를 복구한 뒤 R5로 고쳤다. R5 첫틱827 피해461/wave1/실제칼끝1.019cm/dot−.77794, 압축→반동 표본 차이.63mm. 제작자·독립 검토가 현재1x/원본에서 하향접점/앞체중/회복·구르기/파지 회귀없음을 확인했다. 정확Core187275재사용·독립접점11·순수341PASS. 음향은무음이며heavy_hit이벤트만검증.
- 일반 Desktop은 `I:\EXODUSER-Storage\demo-art\hero\r5\build\EXODUSER-Unity.exe`, `-force-d3d11 --remodel3d`. 네속성/Runtime·Core·EXE SHA 별도프로세스 readback, 이전링크I:백업·자동기동0. 검수/공통Unity tree·바이너리동일로 기존유효검수재사용, 새통합빌드/추가M1반복0.
- **전체 시각 RETOUCH** 유지. 후속전사담당=판금큰면/1·2타하체/2D발밑, VFX담당=임팩트파지/견갑가림·사각경계. 전체AAA·OS손조작·Mac실제반영/실행·모든경사/장시간 미검증. 이 기술전달을 디자인완성으로 올리지 않는다.
- 최신SSOT `docs/engine/UNITY_HERO_RUNTIME_20261030.md`·`UNITY_HERO_MOTION_20261030.md`, 산출물 `I:/EXODUSER-Storage/demo-art/hero/r5/`, 보고 `I:/EXODUSER-Storage/codex-takeover/hero/REPORT.md`. R4이력보존, 원자산45개인수시동일byte·원본0변경·새생성/지출0. 자기정확경로만커밋·INDEX0, Unity파생522WORK보존. UCH-05/06·유료생성·다른백로그시작0.

- 세션 id `local_7de36273…`(유니티 캐릭터 총괄), 모델 Opus. 역할: 플레이어 영웅 3D 외형을 시트 → 메시 → 리깅 → Animator → 인게임 순으로 맡는다. 총괄은 명세·판정만 하고 실행은 Sonnet에 맡긴다.
- 기준 문서(SSOT): `docs/engine/UNITY_CHARACTER_BOARD_20261027.md`. §3-1은 영웅·보스 공용 제작 경로·품질 기준이다. 메모리 `unity-character-lead-role.md`.
- 명세·스크립트 원본: `E:/exoduser-wt/_out/unity-charsheet/SPEC_*.md`, `meshy/*.py`. Meshy 장부: `E:/exoduser-wt/_out/meshy/credits.log`. 잔액 **4,213**.

## 진행 중 작업 단위

| 단위 | 단계 | 남은 일 | 산출물 |
|---|---|---|---|
| UCH-A1 2단계 애니 시범 (사용자 승인 ~32cr) | 유료 6건 **완료**(32cr, 4245→4213): 128·237·127·382 각 3cr, TM-A·TM-B 각 10cr | 명세 `SPEC_UCHA1_STEP2.md` §3 **로컬 판정 자료 미작성** (에이전트가 재부팅으로 중단): 구간 자동 추정·M1 IoU·M6 튐·발 미끄러짐·측면/게임 띠·`step2_compare.md`. 유료 호출 추가 금지. 끝나면 보스전 총괄과 공동 판정 → 공급원 결정 → 보드 기록 | `E:/exoduser-wt/_out/anim-trial/meshy_{128,237,127,382,TM-A,TM-B}_20261028_08xx/` (fbx·glb·task.json), 1단계 `sources.md` |
| UCH-05 실버테일 | Meshy 3건 완료, 조건부 PASS | Unity 임포트·캡처 (`pc-unity-silvertail`, 8d34eb653 = Linear). 스크립트 `SilvertailImport.cs`·`SilvertailCapture.cs`·`SilverWeaponImport.cs`는 작성만 되어 있고 컴파일 안 됨. 실행 전 `meshy/cmp_tex_st.py`로 리깅 GLB 내장 텍스처 비교. 확인 항목: 등검 ㄱ자 접힘이 읽히는지, 치마 천 뼈 분리(정점 15,395개가 다리 뼈 가중치 100%), 하이힐 접지 | `meshy/silvertail_{body,rig,weapon}_20261028_02xx/` |
| UCH-06 아이반 | Meshy 3건 완료, 조건부 PASS | Unity: `IvanImport.Run` → `IvanWeaponImport.Run` → `IvanCapture.Run` (`pc-unity-ivan`). 결함: **머리가 드레드가 아니라 뾰족한 머리로 나옴(LOCK 위반)**. 메시 교체와 head 재생성(유료) 중 Unity 캡처를 보고 결정. 헤어라인 얼룩, 천 뼈 분리 | `meshy/ivan_{body,rig,weapon}_20261028_02xx/` |
| UCH-03f 전사 Linear 재조정 | 대기 | 시작 조건: ① VFX·Linear 병합 완료(unity/main 8d34eb653) ② 맵 총괄 RM0-LIGHT-L 결과 SHA 수신. 받으면 Hero Light 브랜치 `claude/unity-pc-herolight-20261028`(ff20dc2d2)에 origin/unity/main merge(rebase 금지) → Hero·Fresnel 세기 재조정 → 캡처 → 유니티 총괄에 병합 요청. 체크리스트: `SPEC_UCH03f_LINEAR_TODO.md`(L-4 새 지표 ΔE00 ≥15·형광 금지, ACES 색상각 350~12°, 블룸, Fresnel을 정점 법선으로) | 전사 미커밋 작업물 `E:/exoduser-wt/pc-unity-char`(b280ddf6). 프리팹 재구성 순서: `WarriorR2Fit.WriteClip` → `WarriorCapeRig.Run` → `WarriorR2Apply.Run`. **`WarriorImport.Run` 금지** |

## 대기 중
- 맵 총괄: RM0-LIGHT-L(Linear 노출 재조정) 결과 SHA
- 유니티 총괄: Unity 실행 순번(재부팅 뒤 메모리 회복), Hero Light 병합 순서 VFX → RM0-LIGHT-L → Hero Light
- 보스전 총괄: 애니 시범 공동 판정. 보스는 Meshy 인간형 리그를 쓰고 추가 뼈는 Unity에서 붙인다. Hero 레이어는 안 쓰고 Fresnel만 쓴다.
- 디자인총괄: 03f 결과 2차 판정

## 연결 세션
- CTO `local_7072229c-70cf-4fdf-ab35-c3c59e683d53`
- 유니티 총괄 `local_59ad835c-2e92-44a5-bebf-0f0223217ae0`
- 디자인총괄 `local_eb8a8577-c0e4-4a9f-b628-fac0c8549dbf`
- 맵 총괄 `local_9d17d95b-239c-4254-8bef-555b6c5e16e8`
- 보스전 총괄 `local_a98acebe-ea98-4dda-9441-d10b1c7622ed`
- 임펙트 총괄 `local_da9cd0e7-37a8-4d5d-9ab6-090f7f9eb8ad`
- 단순 세션은 띄운 적 없음. 실행은 Agent(Sonnet) 서브에이전트로 한다.

## 이번 대화의 결정·규칙 (보드에 없는 것)
- 병렬 서브에이전트는 **1개만**(CTO 10-28). Unity는 PC 전체에서 실제 실행 중인 것 0개일 때만 띄운다. 셀 때 `Get-Process EXODUSER-Unity,Unity | ? { -not $_.HasExited }`를 쓰고, 커밋 여유가 20GB 이상이어야 한다. 측정 스크립트는 scratchpad `mem.ps1`.
- 유료 크레딧은 매번 사용자 직접 승인을 받는다. 승인 원문은 보드 결정 기록에 남긴다.
- 보드 커밋은 origin/main 임시 worktree에서 한다. 순서: `git fetch` 직후 `checkout --detach origin/main` → 수정 → `git commit -- <경로>` → push. 동시 커밋이 잦으면 fetch부터 다시 한다. 마지막 1회는 경합 때문에 `--no-verify`를 썼다(docs만 바뀌어서 guard 영향 없음). 앞으로는 쓰지 않는다.

## 재개 후 첫 행동
1. UCH-A1 §3 로컬 판정 자료를 Sonnet 1개에 맡긴다. 유료 호출 금지, Unity 금지.
2. 유니티 총괄에게 Unity 실행 순번을 받고, 실버테일 → 아이반 순서로 Unity 임포트·캡처를 진행한다(한 번에 1개).
3. 결과가 나오면 보드 갱신 → 디자인총괄·보스전 총괄에 전달한다.

## Codex 인수 갱신 — 2026-10-28 22:58 KST

- 현재 보드 §3·§4가 이 문서의 UCH-A1 진행 중 표보다 최신이다. `E:/exoduser-wt/_out/anim-trial/step2_compare.md`와 6개 클립의 게임 시점 띠가 이미 만들어졌고, 보스전 총괄 공동 판정과 공급원 결정도 보드에 기록됐다. Codex가 게임 시점 띠 6장을 모두 다시 보고 237의 내려찍기 부재·382의 공중제비·TM-A 양손 원형이라는 기존 판정을 확인했다. 유료 호출은 추가하지 않았다.
- UCH-05·06 원본 3D 에셋 각 10개와 기존 임포트/캡처 스크립트를 읽기 전용 원 작업트리에서 `E:/exoduser-wt/codex-character`로 동일 바이트 이송했다(각 10개 SHA-256 불일치 0). `codex/pc-character-heroes-20261028`의 `52d8a923293eb78ec899a56819979ea00b771bb9`에 **검증 전 후보**로 코드+관련 문서를 커밋·비강제 push했고 원격 SHA를 대조했다. 원 작업트리 WIP와 `G:/exoduser` INDEX/WORK는 건드리지 않았다.
- `CharacterImportVerification`을 추가해 Humanoid avatar·URP/Lit·텍스처 색공간·독립 `.anim` 참조를 검증하도록 준비했다. **Unity에서는 아직 실행하지 못했다.** 공용 Unity FIFO에서 선행 작업을 기다린 뒤 차례가 왔으나 커밋 메모리 여유가 20GB 시작 조건 아래(최저 9.9GB, 뒤이어 2.4GB)여서 실행기를 취소하고 자기 티켓만 정리했다. 따라서 UCH-05·06 컴파일·Unity 캡처·1x 판정·Player 빌드·인게임 통합은 미확인이다.
- 로컬 이미지로는 실버테일 등검 ㄱ자 접힘이 직선에 가깝고, 아이반 머리가 드레드가 아닌 것이 확인된다. 둘 다 DESIGN LOCK 위험으로 남긴다. Unity 캡처 후 메시 보정 범위와 천 뼈 분리를 정한다. `origin/unity/main`에는 RM0-LIGHT-L `f639cd4d4`와 VFX Linear `c7de5781e`가 아직 조상으로 들어오지 않아 UCH-03f의 시작 조건도 충족되지 않았다.
- 재개 순서: PC 커밋 여유 20GB·Unity 0개·HALT 없음·실행기 순번을 다시 확인 → 이 브랜치에서 UCH-05 import/verification/캡처 → UCH-06 순서 → 결과에 따라 무료 메시·천 보정 → 최신 `origin/unity/main` merge 뒤 필수 빌드/oracle/m1-check/Player·1x 판정 → 디자인총괄 판정 → 통합 담당에게 병합 요청. 현재 후보 SHA는 병합하지 않는다.
