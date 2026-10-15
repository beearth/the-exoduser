> **2026-10-15 native 현행:** 실제 Main 정지 UI에서 전사0/실버테일1 선택→실제 Player/profile/시트/발앵커를 연결했다. 원본 localStorage charIdx 복원은 미구현,선택 전 indexnull. 아래 고정 Warrior/selector 미구현 문구는 이전 이력이다. [현재 계약·새 검수·MAP PRODUCTION REPORT](FDG_GODOT_NATIVE_FIRST_20261013.md#native-명시-캐릭터-선택--2026-10-15-현행-계약).

| 변경 항목 | 현재 계약 |
|---|---|
| 선택0 / 선택1 | idle2/walk8·4/source_attack8·4/ready attack9·9,표시scale2.0·1.3. 원본R remaster 우선. 24고유장·24FPS 미달. |
| live API | Main.read_native_character_selection()(0)→Player.apply_native_character_selection(reader)(1)→get_native_character_profile_snapshot()(0). 유실시NR/본체숨김/새공격거부. original_storage_restoredfalse/latest_full_gamefalse. |
| 새 소비 / 검수 | 승인Silver body8+spin1 PNG9원바이트 최초소비. 최종격리GPU26PASS/새4프레임. publicplayfalse/VISUAL RETOUCH. 원수치/QE/physics/geometry/save/사용자창 불변. |

# FDG 캐릭터 원화·모션 계약

2026-10-10. 기존 영상의 실제 첫 24개 표시 프레임을 추출하여 신규 3종의 원화·모션 자료를 FDG 작업폴더에 보존한다. 결과 범위는 **reference-motion**이다. 원본의 배경과 브랜드 글자가 남는 불투명 영상 아틀라스이며, 본편의 8방향 플레이어 스프라이트·전투 동작·3D 모델링 완료를 뜻하지 않는다.

## 원천과 제작 결과

원천 루트는 실행자가 `--source-root`로 선택한다. 이 제작에서 사용한 루트는 `/Users/fordeargamers/Projects/exoduser-migration-20261001`이다. 도구 기본값은 도구가 들어 있는 현재 체크아웃이며 제품 R을 자동으로 찾거나 읽지 않는다. R의 파일·기존 원화·기존 완료 Druid 자료를 변경하지 않았다. 영상 파일은 복사하지 않았고 지정 원화 PNG 3개만 원본 바이트 그대로 보존했다.

| id / 한글명 | 원천 영상: 루트 기준 상대 경로 | 원화: 루트 기준 상대 경로 | 검토 상태 |
|---|---|---|---|
| `transmuter` / 변성술사 | `assets/video-tests/seedance-20260928/01-transmuter-gauntlet-idle.mp4` | `assets/video-bases/20260928/12-transmuter-gauntlet-scythe-v4.png` | `pending` |
| `hell_hunter` / 헬 헌터 | `assets/video-tests/seedance-20260928/02-hell-hunter-idle.mp4` | `assets/video-bases/20260928/13-hell-hunter-restrained-cloth-v3.png` | `pending` |
| `arcane_lancer` / 아케인 랜서 | `assets/video-tests/hailuo-20260928/08-arcane-lancer-thrust.mp4` | `assets/video-tests/hailuo-20260928/08-arcane-lancer-source.png` | 기존 `retouch` 유지 |

| 항목 | 실제 계약 |
|---|---|
| 원천 시간표 | 3종 모두 MP4 비디오 트랙 `mdhd`/`stts` 기준 **121 표시 샘플 / 24FPS / 121÷24=5.041666667초** |
| 출력 구간 | 첫 1초 `[0,1)`, 표시 프레임 **0..23**. 마지막 프레임의 시작 시간은 `23÷24=0.958333333초` |
| 아틀라스 | **6열×4행 / 24셀 / 셀768×432 / 전체4608×1728 PNG / 참고 재생24FPS** |
| 배치 | 좌→우, 상→하. 셀 `i`는 `(i%6, floor(i/6))` |
| 시간 검증 | 실제 `requestVideoFrameCallback`의 `mediaTime`을 기록. `round(mediaTime×24)===요청 index`와 시간 오차 `<=(0.01÷24)초` 요구 |
| 추출 | 첫 실제 디코드 프레임 뒤 순차 seek. 프레임 `i>0`의 seek 시간은 `(i+.25)÷24`; 셀은 callback의 실제 표시 프레임으로 그린다 |
| 크기 맞춤 | 원본 영상 비율을 `contain`으로 보존하여 셀에 축소한다. 남는 여백은 검정. 시간 보간·프레임 복제·포즈 생성 없음 |
| 알파 / 배경 | `alpha:false` Canvas, 불투명 결과. 원래 배경·브랜드 글자 포함. 크로마/배경 제거 없음 |
| 미완료 | 8방향·idle/walk/attack 전투 세트, 발 정렬·월드 스케일·충돌·모델/본/리그·본편 배선·사용자 품질 승인 |

| id | 원천 영상 크기 | 보존 원화 크기 | 아틀라스 바이트 | 원화 바이트 |
|---|---:|---:|---:|---:|
| `transmuter` | 1920×1080 | 2688×1520 | 18,696,916 | 6,821,177 |
| `hell_hunter` | 1920×1080 | 3456×2048 | 16,741,398 | 10,286,653 |
| `arcane_lancer` | 1248×704 | 2816×1584 | 14,544,044 | 7,279,245 |

브라우저의 PNG 인코더·버전이 바뀌면 재생성 파일 바이트/SHA는 달라질 수 있다. 현재 결과의 정확한 바이트와 SHA는 [manifest.json](../../assets/fdg/character-reference/manifest.json), 그 manifest 자체의 SHA는 [manifest.sha256](../../assets/fdg/character-reference/manifest.sha256)이 정본이다. MP4와 원화의 원천 SHA·참고 PNG의 SHA·도구/생성 모듈의 SHA도 manifest에 기록한다. 4608×1728 RGBA 디코드 메모리의 단순 환산은 장당 **31,850,496바이트(30.375MiB)**이며 실제 peak/GPU 비용은 미검수다. 소비자는 선택한 자료의 로딩 수명을 관리한다.

## 후보 API와 설계 보존

[character-drafts.js](../../engine/fdg/character-drafts.js)의 `createCharacterDrafts()`는 매 호출마다 깊은 복사된 JSON 후보 배열을 반환한다. 이 후보는 기존 FDG 프로젝트 `characters`의 플레이어 리소스와 별개이며, 스프라이트 필드에 끼워 넣어 플레이 가능 상태로 만들지 않는다.

| 필드 | 값 / 의미 |
|---|---|
| `id`, `name` | 위 표의 안정 ID와 한글명. 마케팅 문서의 변성술사·헬 헌터·아케인 랜서 명칭을 따른다 |
| `referenceSrc` | `assets/fdg/character-reference/<id>.reference.png` |
| `clip.src` | `assets/fdg/character-reference/<id>.motion24.png` |
| `clip.frameWidth`, `frameHeight` | `768`, `432` |
| `clip.columns`, `rows`, `frames`, `fps` | `6`, `4`, `24`, `24` |
| `designLocks` | 원화 정체성·무기 연결·검수 한계를 보존하는 문자열 배열 |
| `provenance.sourceVideo`, `sourceSha` | 원천 루트 기준 영상 상대 경로·SHA256 |
| `provenance.sourceFrames` | 24개 항목. 각각 `index`, `sourceFrameIndex`, 실제 `mediaTime`, `requestedTime`, 셀 RGBA `pixelSha` |
| `provenance.sourceFps`, `sourceFrameCount` | `24`, `121` |
| `provenance.sourceReference`, `sourceReferenceSha` | 지정 원화 상대 경로·원화 SHA256 |
| `provenance.scope` | `reference-motion` |
| `provenance.reviewStatus` | 변성술사/헬 헌터 `pending`, 아케인 랜서 `retouch` |
| `provenance.gameplayApplied`, `modelAvailable` | 모두 `false` |
| `provenance.alpha`, `backgroundIncluded` | 각각 `false`, `true` |
| `provenance.extraction` | 실프레임0..23·시간 보간 없음·비율 유지/검정 여백 설명 |

| 캐릭터 | 설계 보존 | 현재 모션 범위 |
|---|---|---|
| 변성술사 | 지정 v4 얼굴·갑옷·색·실루엣. **큰 푸른 구형 코어·발톱형 장갑이 주무기**, 장갑/코어 크기·연결 보존. 여성의 낫은 **날·자루·그립 전체가 순수 에너지이며 장갑에서 형성**, 물리 금속 자루로 변경하지 않음. 남성의 **푸른 활** 원형 보존 | 영상 첫 1초의 대기 참고 |
| 헬 헌터 | 지정 v3 얼굴·갑옷·**실린더 총기**, 견착/양손 그립·손/총기 연결. **평시 닫힌 작살형 총구→발사 시4날개 개방→중앙 단일 포구 발사→닫힘**, 붉은 천 절제 | 영상 첫 1초의 대기 참고. 발사/총구 개폐 완성의 증거가 아님 |
| 아케인 랜서 | 은발 여성·후드·검은 갑옷. **긴 가는 직선 창대·금속 창끝·브론즈 궤도 고리·양손**, 하나로 연결된 단일 축. **양발 가시성/발 접지** 검수 | 첫 1초의 준비·에너지 충전 참고. 원천 JSON의 찌르기 계획은 **1.8~2.3초**여서 이번 셀에는 포함되지 않음 |

이 설계 보존 항목은 다음 모델링/동작 제작의 요구사항이다. 첫 1초 참고 모션이 모든 항목을 구현·검수했다는 뜻으로 쓰지 않는다.

아케인 랜서의 원천 JSON은 효과가 창끝·고리 세부를 가리는 문제와 모든 손 프레임의 정밀 미승인을 `RETOUCH`로 기록한다. 이 아틀라스는 그 기존 판정을 승격하지 않는다. 출력 셀의 픽셀 SHA가 서로 다른 개수(`pixelDistinctFrameCount`)는 3종 모두 24지만, 영상 압축·광량·천 변화도 차이를 만들므로 **24개의 고유한 포즈·향상된 품질**의 증거로 쓰지 않는다.

## 제작 도구와 재현

[fdg-character-build.mjs](../../tools/fdg-character-build.mjs)는 기존 Node 서버와 설치되어 있는 Playwright/Chrome을 사용한다. 새 서버·브라우저 UI 탭·외부 생성 요청·본편 실행을 만들지 않는다. headless Chrome의 별도 context에서 도구 전용 HTML/MP4만 `route.fulfill`하고, Blob URL의 video를 디코드해 Canvas로 추출한다. 그 context의 나머지 네트워크는 차단한다.

```sh
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node \
  tools/fdg-character-build.mjs \
  --source-root /Users/fordeargamers/Projects/exoduser-migration-20261001 \
  --playwright-module /Users/fordeargamers/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs \
  --chrome-executable '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  --base-url http://localhost:3333
```

| 도구 인자 / 동작 | 계약 |
|---|---|
| `--source-root <dir>` | 지정 기존 소스 루트. 생략 시 현재 도구 체크아웃. R 절대경로 자동 탐색 없음 |
| `--playwright-module <file>` | 지정 설치 모듈. 생략 시 기존 `playwright` package. 설치/다운로드하지 않음 |
| `--chrome-executable <file>` | 지정 기존 Chrome. 생략 시 기존 `channel:chrome`. 설치하지 않음 |
| `--base-url <url>` | 기존 loopback Node 서버, 기본 `http://localhost:3333`. studio HEAD 확인 후 진행. 서버 기동 없음 |
| `--help` | 사용법만 표시, 원천/출력 읽기·쓰기 없음 |
| 사전 검사 | 지정 PNG 시그니처, MP4 비디오 트랙/CFR24/24개 이상 샘플, 기존 서버 확인 |
| 실패 처리 | 소스 누락·VFR·24가 아닌 FPS·잘못된 callback 프레임·seek/decode timeout은 실패. 조용한 보간/복제/재시도 없음 |
| 출력 시점 | 세 원천 모두 24프레임 디코드에 성공한 뒤 소유 출력만 기록. R와 source PNG 쓰기 없음 |
| 출력 8파일 | PNG6개 + `manifest.json` + `manifest.sha256`; 그 외 `engine/fdg/character-drafts.js` 생성 |
| manifest | 원천 시간표/크기/SHA, 출력 크기/바이트/SHA, 프레임별 실제 시각/해시, 제작 옵션/브라우저 버전/한계 |
| 생성 모듈 | `createCharacterDrafts()` factory; 브라우저/Node ES module 양쪽 사용 가능 |

## 이번 검수와 다음 제작 Gate

실제 추출에서 3종 각각 프레임0..23의 mediaTime/인덱스를 확인했다. 새 결과의 한정 검사에서 원천 영상/출력/도구/생성 모듈/manifest SHA·출력 크기·원화 byte-exact 보존·후보 중첩 깊은 복사·설계보존/preview-only 상태를 확인했다. PNG를 실제 inflate/unfilter하여 **장당7,962,624픽셀 모두 alpha255**인 것도 확인했다. 첫 검사의 `colorType===2` 가정은 FAIL1이었다. Chrome이 불투명 Canvas도 RGBA `colorType=6` PNG로 저장하므로, 제품/PNG 변경 없이 실제 디코드 알파 검사로 정정한 후 위 결과를 확인했다. 초기 실패와 정정 검사를 clean PASS로 합산하지 않는다. 이전 FDG 완료 suite·기존 Druid PNG/모델·본편 GLB 검사는 재실행하지 않았다.

3개 아틀라스를 실제 열어 검토했다. 얼굴·무기·원화 색 구성과 기존 시네마틱 배경/브랜드 글자가 보이며, 첫 1초의 몸 움직임은 작다. 셀별 손·무기 정합성과 자연스러운 반복 연결·투명 배경·전투 발접지·8방향/모델은 미인수다. **VISUAL VERDICT: RETOUCH**. 참고 모션 추출 완료와 신규 플레이어/모델 완성을 구분한다.

다음 제작은 원화 정체성을 잠근 뒤 실제 용도별 대표 동작과 방향 자료를 제작·검수하고, 발 기준·월드 크기·모델/리그 가용성과 소비 범위를 확정하는 것이다. 24를 맞추기 위해 같은 포즈를 복제하지 않는다. 모델이 없을 때 `modelAvailable:true`로 표시하지 않는다.

관련 문서는 코드 변경 뒤 `grep -r -n -E 'transmuter|hell.hunter|arcane.lancer|트랜스뮤터|헬 헌터|아케인 랜서|reference.motion|캐릭터.*24|24.*캐릭터' docs`로 검색했다. 마케팅의 [캐릭터 아트 티저](../13출시·마케팅/TRAILER_ART_REFRESH_20261009.md)는 기존 공개 원화/미플레이 구분을 보존하며, 이번 제작 사실·수치·API는 이 문서와 manifest가 정본이다.


## 드루이드 원화 선택 정정 · 2026-10-12
<a id="dark-druid-source-correction-20261012"></a>

사용자는 새 검은 드루이드가 있는데 구형 모델로 리깅한 점과 잘린 외투를 거절했다. 현재 엔진의 f0 리그는 **USER_REJECTED_OLD_MODEL / VISUAL FAIL**이며 신규 모델 제작 기준에서 제외한다. 이전 카메라 contained/화면 안 전신과 기술 검사 PASS는 내부 의상 접합·모델 품질 인수의 근거가 아니다. 원본 PNG·fixture·이전 commit은 그대로 보존한다.

| 자료 / 실제 경로 | 정확한 원본 | 현재 소비 / 승인 범위 |
|---|---|---|
| 구형 f0 / assets/sprites/boss/boss_dark_druid_f0.png | 355×541 / 479258B / SHA256 74060fc68eb5f6dd76771272e973b2c5038e2939286c411cb2bc9a5bbcf0fa68 | 구형 r3/r5 UV·rig의 source. 명시 legacy QA 이력으로만 보존; 신규 리깅·새 검은 원화 승격0 |
| 대기 정본 v3 / assets/sprites/boss/boss_dark_druid_8dir_v3.png | 1656×1240 / 3668669B / SHA256 ceb3843fc1d612601b63dcb33035298da9b92d4ae39e88d986805ec4216e1549 | migration의 9/27 채택 대기 원본을 엔진에 byte-exact 복사. 원본 쓰기0. 4열×2행, 실제8방향 셀414×620; α≥32 사방 경계0 |
| 검정 SW 후보 / migration의 assets/sprites/boss/review/druid_sw_higgsfield_max_20261009.png | 2336×3504 / 11600747B / SHA256 0327590c9bf2dd08337a911378a080a318962b7e937175225a6a8840d5fc038b | 2026-10-12 사용자 영웅형 외형 거절: USER_REJECTED_HEROIC_DESIGN. 이 후보의 exact source 질문 대기 종료·재질문0. 엔진에 파일 복사·정지 consumer·모델·전투 연결0. 완성 3D/24장/공격 리그 승인 파일로 주장0 |

| game.html 접점 | 실제 현재 계약 / 단위 |
|---|---|
| _loadDruidSheets | base8=8dir_v3.png, query ?v=ceb3843f. onload의 naturalWidth1656 AND naturalHeight1240이 일치해야 ready. 기존9종 sheet 경로/query20260825c 유지 |
| default idle | 기존 key 판정의 else에서 base8 / columns4 / rows2 / frame=nativeDir / dirless=true. 방향 맵 [6,7,0,1,2,3,4,5] 유지. 8방향은8장의 방향 원화이며24장 모션이 아님 |
| 크기 / 접지 | dh=e.r×spec.dh, dw=dh×414/620. 원 source 비율 유지. dest=(-dw/2,−dh×0.86,dw,dh), translate(e.x,e.y+tdY−6), inverseScale=1/(_btScaleMul||1). 기존 nameTopOff 유지; 새 actor/발 좌표 write0 |
| 원화 합성 | base8은 source-over / globalAlpha=sa 1회. 이전 lighter / sa×0.42 2회는 base8에서 제외해 칠해진 검은 깃털·명암 보존. walk/attack/변신의 기존 합성 수치는 유지 |
| 구형 리그 gate | fdgDruidSource=legacy-f0 AND (fdgDruidSlam=r3 OR (r5 AND _FDGDruidQaStorage.active)). query r3/r5만으로 f0 rig import0. 명시 legacy import query source-contract-20261012. 기존 fixture/clip/FSM/수치 보존 |
| source observation | frozen window._FDGDruidSourceSelection={idleSource,legacyRigExplicit,isReady,getDrawnSource}. idleSource frozen5필드 id/src/width/height/sha256. getDrawnSource(actor)는 actual bridge sourceIdentity 또는 마지막 native 성공 draw의 새 사본. kind=legacy-rig/directional-idle/legacy-motion. 동일 sheet/dir/frame/dimensions면 WeakMap metadata 재사용; 숨은 bossDruidUnder 또는 sheet not ready 때 이전 native record 삭제 |
| readiness | isReady()는 default에서 base8.ready, 명시 legacy에서 bridge 존재. QA는 source selection이 있으면 isReady(), 이전 source API 없는 scope는 기존 bridge 존재를 읽는다. 준비 때 scale·물리정지·HUD·qa-ready의 기존 동작 유지. QA import query source-readiness-20261012 |
| 남은 구형 모션 | walk/attack=4열×8행, 방향당4장, wallclock150ms/frame≈6.666667FPS,1cycle0.6초 유지. 신형 공격·걷기·지팡이 접지·24장/24FPS·8방향 완성으로 표시0 |
| gameplay / 보호 | native FSM·AI·wind/fire/hit/recover·impact tick·damage·탄수/속도/수명·nativeFacing·Q/E·blackBean Q-only/유도반사·save·맵/nav/LOCK 변경0. 어택티켓·강제single-hit·actor/탄 좌표주입0 |

### NORMAL 악마형 디자인 정정 · 2026-10-12

| 항목 | 현행 기준 / 근거 |
|---|---|
| 사용자 거절 | ROOT의 직접 사용자 turn `01a12d53-eaf8-7540-beeb-0f6a7fc49ebd`: “악마보스를 무슨 영웅같이 만들어놨어”. 10/9 SW 후보를 신형 정본으로 채택하지 않는다. |
| 제작 형태 기준 | 앞으로 쏠린 큰 흉곽, 한쪽 어깨·팔의 비대칭 목질 변형, 뒤틀린 짐승 관절, 몸에 파묻힌 작은 얼굴, 큰 턱·뿔의 윤곽. 정돈된 망토·독립 장식 지팡이를 늘리지 않고 공격기관이 어깨·팔의 뿌리/목질 구조에서 이어지도록 읽힌다. |
| 현재 자원 결손 | `APPROVED_DEMON_BODY_MISSING` / 승인 악마형 NORMAL 본체 자원 없음. 기존 v3 대기 원화, 구형 f0, 거절 SW 후보를 새 승인 본체로 치환하지 않는다. |
| 실제 소비 가능 범위 | 기존 v3 8방향 대기와 기존 native 공격 소비만 유지. 신형 본체·24장/24FPS·체중 모으기→내려꽂기→접촉점의 물리8+마법4 가시→뽑기/반동 회복은 미완이다. 새 수치/FSM/player Q-E/2_3/blackBean 규칙 변경0. |

### source 계약 API

| API / 필드 | 실제 동작 / 정확한 제한 |
|---|---|
| engine/fdg/rig-source-contract.js | createRigSourceContract(expectedSource), rigSourceIdentity(rig), RigSourceContractError. 선언한 source 정체성을 대조하며 PNG 재해싱/승인/자동texture 치환 기능은 아님 |
| expectedSource | {id,src,width,height,sha256}. id는 trim 후 비어 있지 않은 문자열·최대2048자·제어문자 금지. src는 최대2048자 local path, 공백/제어문자/backslash/외부scheme/선행///decoded . 또는 .. 경로 금지. width/height는 정수1..4096. SHA는64개 소문자 hex |
| 선택 snapshot | expected5필드를 첫 await 전에 copy/freeze. return contract와 expected frozen. 호출자가 이후 기대값을 바꿔도 선택 source가 바뀌지 않음 |
| 실제 identity | id=provenance.sourceId ?? provenance.source ?? material.texture.src ?? null. src/dimensions=materials[0].texture; sha256=provenance.sourceSha256 ?? null. 기대5필드 exact equality. 존재하는 provenance.source/sourceSize는 material src/dimensions와 내부 일치 필요 |
| 오류 | shape·필드·정체성 불일치는 RigSourceContractError(TypeError) / 독립 errors 사본. rig 검증은 기존 validateRigProject 유지. expected 미제공 API는 이전 SHA 미선언을 강제하지 않음 |
| load / install | loadDruidSlamNativeBridge(options.expectedSource)를 metadata 검사하고 Image 생성 전에 다른 source 리그 거부; install의 expectedSource도 동일 검사. 실제 decode의 natural dimensions 일치도 기존대로 필수. getRenderSnapshot(actor).sourceIdentity는 실제 선언의 clone |
| URL | expectedSource 제공 경로만 single-leading-slash local URL로 읽어 root-relative /assets/...도 외부host가 되지 않게 한다. expected 미제공 구 API URL 동작 보존 |
| 현재 legacy 기대값 | id=src=assets/sprites/boss/boss_dark_druid_f0.png / width355 / height541 / SHA74060fc68eb5f6dd76771272e973b2c5038e2939286c411cb2bc9a5bbcf0fa68. 새 원화 src만 이 JSON에 치환하는 방식 거부 |

### 새 검수와 현재 판정

| 검수 | 실제 결과 / 제한 |
|---|---|
| 새 source 계약 검사 | 담당 최초5/5 PASS397.642083ms. source mismatch·dimensions/SHA·내부 provenance·선택 mutation 격리·load-before-Image 등을 검수. root-relative 추가1/1 PASS180.993708ms는 별도 최초 결과. 기존5 재실행0 |
| native selection 검사 | root 최초4/4 PASS90.009875ms. 원본PNG SHA/크기/bytes, 실제8방향 source crop/aspect/single composite·actor 보존, legacy motion 표시와 잘못된 v3 dimensions 거부, r3/r5 query의 명시 legacy gate. 구 suite 재실행0 |
| 추가 readiness/observer 검사 | 새1/1 PASS73.817792ms. rig 없는 default source ready, 동일 draw metadata 재사용, 숨은 body source clear. 이전4 재실행0 |
| 첫 실제 실패 | bridge 해제 뒤 기존 QA ready가 _FDGDruidSlamBridge에 의존하여 ready=false / HUD0 / 공개 버튼 무반응이었다. v3-native-idle*.png/observation은 이 중간 실패 자료이며 최종 인수0 |
| 최종 실제 소비 | v3-native-idle-final.png + v3-native-idle-final-observation.json: game1280×720 / native idle / source base8-v3 / nativeDir1 / frame1 / legacyRig=false / sourceReady=true / QAready=true / 공개 compact 이벤트 / 실제HP499 / own settings writes0. 코드나 console에서 native actor 상태 주입0 |
| 실제 외형 | 뿔·지팡이·망토 자락·양발이 최종 방향 원화에 포함돼 화면 안에 표시됨. f0 split-cloth mesh는 소비0. 이 한 idle 방향 화면으로 공격 seam/관절/지팡이 꽂기/전체 방향/전체 전투 PASS를 주장0 |
| 보류 범위 | 10/9 SW 후보는 사용자 영웅형 외형 거절로 선택 대기 종료. APPROVED_DEMON_BODY_MISSING / 승인 악마형 NORMAL 본체 자원 없음. 이전 확인 이후 새 파일은 기존 v3 대기 시트 사본뿐이며 신형 본체 승인 근거가 아님. ART 중지·거절 경계/기존 보류 patch 재개0 |
| 시각 판정 | 대기 원화 source 연결은 관측 완료. 전체 신형 모델/교전의 VISUAL VERDICT: RETOUCH. 구형 f0 모델은 USER_REJECTED_OLD_MODEL / VISUAL FAIL 유지 |

새 E: /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-source-correction-20261012. UI viewport가0×0으로 시작하여 native 화면을 판독할 수 없었기 때문에1280×720 임시 override로 촬영한다. 최종 종료 전 override를 reset하며 사용자가 열어 둔 다른 탭은 변경하지 않는다. 임시 override의 중간 캡처와 최종1280×720 native 표본을 원래 화면 크기로 주장하지 않는다.

### MAP PRODUCTION REPORT · §23

| 항목 | 이번 단위 |
|---|---|
| STAGE / MASTER | 기존 CH1 NORMAL own QA 원화 source 선택·readiness. 새 맵 production/전체 route 인수 N/A |
| OUTER MASS / LARGE / MEDIUM | 기존 geometry·연결·source 환경·holes·composite 변경0 |
| GROUND | 지면/그림자 환경 변경0. 캐릭터 source crop/aspect/접지 등록만 위 표대로 유지 |
| PLAYABLE / COMBAT | native 공간·판정·위험 면적·맵/nav/collision/LOCK 변경0. 신형 대기 실제 표본만 검수 |
| LANDMARK | 변경0 |
| CAMERA QA | ARENA1280×720 최종 idle1표본. native envelope contained=true / safeRect left60,top90,right1050,bottom570. 화면 안 포함과 모델 intact는 별도 판단. START/EARLY/SIDE L/R/LANDMARK/LATE/EXIT 새 검수0 |
| TECH QA | 새 source/selection 검사만 인수. gameplay·Q/E·save roundtrip·pageerror/전체404·GPU perf benchmark·전체24장/24FPS 인수0 |
| FILES | root game/QA/source-selection test/byte-exact v3 asset/docs; 담당 source-contract helper/bridge/test. 타인WIP 보존 |
| GIT | owned code+asset+docs 정상 local checkpoint. push/deploy0; 이전 commit/fixture/source rollback0 |
| VISUAL VERDICT | RETOUCH(전체 신형 모델·교전). 구형 f0 모델은 FAIL |
| NEXT PASS | 승인된 악마형 NORMAL 본체의 exact source가 확보된 뒤 model/UV/rig를 재저작하고 준비→지팡이 접지→방출→반동→회복을 실제 NORMAL native 소비자로 검수. 원화 후보 승인/판정/FSM 임의변경0 |
