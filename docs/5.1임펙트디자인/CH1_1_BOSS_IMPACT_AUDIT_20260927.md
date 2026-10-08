# 1-1 다크드루이드 임팩트 23종 조사 — 2026-09-27

## 범위와 판정

- 일반 1-1 `si0` 보스의 `_BOSS_MOVESET[0]` 23종을 `game.html`의 시작·갱신·렌더 경로에서 모두 추적했다. 데모/bic 전용 `si3` 피날레 5종은 별도 계약이다.
- `?bosstest=0` 실제 화면에서 `groundFissure`, `tideWave`, `chaseAoe`의 시작·진행 화면을 우선 확인했다. 23종 전체의 전 페이즈, 타격 프레임 영상 검수 완료라는 뜻은 아니다.
- 우선 교체 기준은 공격 본체가 단색 원·굵은 단일 선으로 보이거나, 드루이드의 녹색 독·흙·뿌리와 시각적으로 충돌하는 경우다. 판정 경계와 안전 틈은 게임 정보로 유지한다.

| ID | 코드상 현행 본체 / 시각 경로 | 조사 판정 | 2026-09-27 조치 |
|---|---|---|---|
| slashCombo | 드루이드 attack 시트·근접 타격 | 시트 경로 유지, 타격 프레임 추가 육안 검수 | 변경 없음 |
| slam | 근접 충격·`druid_shockring` 경로 | 전용 시트 경로 유지 | 변경 없음 |
| sweep | 근접 부채꼴 타격 | 범위 가독성 추가 육안 검수 | 변경 없음 |
| charge | transform→beast 시트·돌진 | 전용 애니메이션 경로 유지 | 변경 없음 |
| jump | 순간이동 Prep/Warn에 `emerge` 8f 분기 존재, 로더 누락 | **결함**: 전용 애니메이션 분기 미실행 | `emerge.png` 로더 연결 |
| burst | 광역 충격·파티클 | 타격 프레임 추가 육안 검수 | 변경 없음 |
| shock | `druid_shockring` 8f 기반 충격 | 전용 시트 경로 유지 | 변경 없음 |
| fan | 부채꼴 탄막 | 드루이드 소유 독탄 경로 유지 | 변경 없음 |
| groundFissure | 판정 폭 `140`의 단색 직선, 종착 단색 원 | **낮음**: 흙 파열보다 색 선으로 읽힘 | 흙층·뿌리맥·곁가지 3층 균열, 흙 파편 16개, 질감 있는 종착 경고와 `druid_hit` 8f 연결 |
| poisonTrail | 드루이드 `aoe` 8f 장판 | 전용 시트 경로 유지 | 변경 없음 |
| spin | 피해 반경 `500+stage×15`, 기존 전조·발동 도형은 `50+stage×3` | **결함**: 경고가 실제 피격 범위의 1/10만 표시 | 전조·발동 표시 반경을 판정과 일치. 위험 면·경계·회전 호 3개로 표시 |
| grab | 근접 잡기 | 포획 순간 추가 육안 검수 | 변경 없음 |
| multiDash | beast/transform 돌진 애니메이션 | 전용 애니메이션 경로 유지 | 변경 없음 |
| tideWave | 판정 폭 `60`의 굵은 원호 두 겹 | **낮음**: 평면 고리로 읽힘 | 흙층·줄기·발광맥과 바깥 잔뿌리, 이동 반짝임 12개와 갭 끝 매듭; `gapSize=.8` 안전 틈 유지 |
| chaseAoe | 10회 장판, 붉은 단색 원 경고·원형 폭발 | **낮음**: 드루이드 재질·색과 불일치 | 토양 그라디언트·뿌리 경고, 불투명도 최대 `.13`의 바닥 채움, 폭발시 불규칙 흙 원판·`druid_hit` 8f·녹색 파편 |
| elemBall | 소유자 표시를 거친 16f 녹색 독탄 | 전용 텍스처 경로 유지 | 변경 없음 |
| beanStorm | 보스 소유 콩탄 | Q/E 분류·독탄 계약 유지 | 변경 없음 |
| summon | 몬스터 소환 | 소환 유닛 별도 시각 범위 | 변경 없음 |
| mine | 공용 `mine_trap_ward` 시트, 실패시 도형 폴백 | 정상 로딩 시 시트 경로 | 변경 없음 |
| seekerMines | 드루이드 소유 녹색 16f 텍스처, 240px | 2026-09-06 개선 경로 유지 | 변경 없음 |
| lavaPools | 드루이드 `aoe` 8f 장판 | 전용 시트 경로 유지 | 변경 없음 |
| rapidMissile | 소유자 표시를 거친 녹색 독탄 | 전용 텍스처 경로 유지 | 변경 없음 |
| burrowStrike | `dive` 애니메이션, `druid_dust`·`druid_hit`·`druid_roots` | 잠행 두둑의 단색 타원은 보스 크기에 비해 작고 평면적 | 반경 `e.r×5.5`의 불규칙 흙두둑·방사 그라디언트·7갈래 뿌리·9개 토양 파편으로 보강 |

## 현행 구현 계약

| 항목 | 값 / 적용 위치 |
|---|---|
| 대상 식별 | `e.ib && (G.stage===0 || G.stage===3)`에서 생성 객체의 `druid` 플래그. 다른 보스의 기존 색·렌더 유지 |
| 균열 | 피해 폭 `w=140`, `spd=20`, 최대 `140f`, 종착 폭발 반경 `min(750,maxLen×.3)` 불변. 새 균열은 판정 중심선을 따라 3층 스트로크와 작은 가지를 그림. 종착 시 `druid_hit` 362×543, 8f 재생 |
| 조류파 | 2~4개, `w=60`, `spd=15`, 최대 `120f`, `gapSize=.8` 불변. 3층 유기적 원호를 안전 갭 바깥에만 그림 |
| 추적 장판 | 10회, 간격 `60f`, 지연 `90f`, 반경 `450` 불변. 녹색 `🌿 추적 장판!` 안내·경고 테두리·수축 링·토양 무늬와 폭발시 `druid_hit` 362×543, 8f 재생. 피해·넉백·Q/E 경로 불변 |
| 순간이동 | `assets/sprites/boss/boss_dark_druid_emerge.png`, 4열×2행/8f 로드. Prep 침강 0→7, Warn 부상 7→0. 기존 분기와 타이밍 사용 |
| 8방향 본체 | 기본 대기 `boss_dark_druid_8dir_v3.png` 1656×1240/4열×2행, 방향별 414×620셀. Higgsfield GPT Image 2.5의 3312×2480 원본을 프리멀티플라이 알파 평균으로 1/2 축소. 이동·공격은 기존 `walk.png`·`attack.png` 887×1774/4열×8행. 각 셀 경계는 정수 픽셀로 반올림해 이웃 셀 번짐을 줄임. 기본 호흡 위치 ±2px. 공격·이동 프레임 타이밍 150ms 유지 |
| 드로잉 게이트 | 스킬 전체 경계선 숨김(`__hideSkillBoundary`) 상태에서도 드루이드 전용 균열·파동의 재질 선은 저장된 원본 `stroke`를 호출해 표시. 다른 스킬 경계선은 기존 게이트 유지 |
| 테스트 카메라 | `?bosstest=0` 초기 플레이어를 보스 남쪽 `10T`→`4T`→`2T`→`3T`, 카메라 Y는 `P.y-4T`→`P.y-T`→`P.y-2T`. 최종 카메라는 보스 화면 위치를 유지하며 플레이어 시작점을 발 아래서 1타일 분리. 실제 아레나 스폰·전투 수치 불변 |
| 상반신 조명 | 2D 다크드루이드(si0/si3)만 기존 발밑 광원 외에 `boss.y−boss.r×spec.dh×.62` 위치에 반경 560/강도 .58의 어둠 마스크 전용 광원 1개. `ci=-1`은 색 원판 합성에서 제외. 보스 뿔·얼굴·가슴이 플레이어 등불 거리 밖에서 사라지던 원인을 보정 |
| 회전참 경고·발동 | 공용 보스 `bossSpinWind`/`bossSpin` 표시 반경을 실제 근접 피격식 `500+G.stage×15`와 일치. 전조는 낮은 알파의 위험 면·외곽 경계·55% 내부 고리, 발동은 위험 면·경계·회전 호 3개. 피해·지속시간·투사체·패링 판정은 변경 없음 |
| 부하 | 균열당 최대 3층×13점, 파동당 3층×65점+16 잔뿌리. 이펙트 풀 상한 20 기존 계약 사용. 다수 중첩 시 FPS 검수 필요 |

## 검수 기록과 남은 품질 과제

- `http://localhost:3333/game.html?bosstest=0` 새로고침 후 `tideWave`의 녹색 뿌리 고리와 안전 갭을 화면에서 확인했다. 이전 두꺼운 단색 고리보다 형태가 분명하다.
- `groundFissure`와 `chaseAoe`를 강제 실행해 페이지가 정상 진행하는 것을 확인했다. 이동·난전 때문에 폭발 정점과 23종 전체의 명확한 클로즈업은 아직 확보하지 못했다.
- 후속 화면 QA에서 `?bosstest=0` 기본 ×4 배율의 정지/리셋 상태로 드루이드 전신을 다시 보았고, 상단 뿔이 뷰포트 안으로 들어온 것을 확인했다. 테스트베드의 ×2 수동 확대는 별도 축척이므로 상단이 다시 잘릴 수 있다. 실제 전투 카메라는 플레이어·보스 중간점 추종 경로이며 이번 변경에서 손대지 않았다.
- `test/ch1DruidAssignment.test.js` 2개, `bossTelegraphReadability.test.js` 1개, `druidPoisonProjectiles.test.js` 1개 통과. `fieldBossSpawnEmerge.test.js`는 14개 중 13개 통과, 1개 실패: 크라켄 대형탄 패링 반경 문자열 기대와 현행 코드가 다르며 작업 전 백업에도 같은 불일치가 있다. 이 임팩트 변경의 회귀로 분류하지 않는다.
- 후속 수정 뒤 관련 테스트 4/4 통과, `game.html`의 인라인 JavaScript 4개 문법 파싱 통과. 브라우저 기본 대기 렌더와 강제 패턴 UI 작동 확인. 전 프레임 시각 PASS나 장시간 성능 PASS를 뜻하지 않는다.
- `emerge.png`와 `druid_hit_impact.png` 파일 존재, 개발 서버의 수정된 `game.html` 응답 200 확인. 브라우저 전체 리소스 로딩 실패·프레임별 외형·장시간 FPS는 별도 확인 대상이다.
- `burrowStrike`의 단색 잠행 두둑은 교체했다. `spin`은 전조 화면에서 10배 범위 불일치를 확인해 표시를 수정했다. `grab`·`burst` 타격 순간과 수정된 `spin` 발동 프레임은 시각 검수 후보로 남긴다. 검증하지 않은 패턴을 최종 시각 승인으로 표시하지 않는다.
- 원본 `walk.png`·`attack.png`는 887÷4, 1774÷8이 정수가 아니며 일부 뿔·의상·발광 픽셀이 셀 외곽에 닿는다. 샘플링 경계 보정으로 이웃 프레임 혼입은 줄지만 이미 잘린 원화 픽셀을 되살리지는 못한다. 원본 `8dir.png`도 일부 방향에서 알파가 셀 가장자리에 닿아 아래 새 대기 시트로 교체했다.
- Higgsfield 브라우저 업로드로 기존 `8dir.png`를 참조 이미지로 전달했다. 참조 없이 만든 1차본은 갑옷·뿌리 디테일이 부족했고, 원본만 참조한 2차본은 4×2 구도가 무너져 모두 기각했다. 3차본은 1차본의 배열과 원본의 외형을 함께 참조해 8방향 전신을 생성했다. 모델 `gpt_image_2_5`, `quality=high`, `resolution=4k`, `background=transparent`, `aspect_ratio=4:3`; 생성 작업 ID `c03d8399-7370-4b63-81c2-bf16fb2f844b`. 프롬프트는 첫 이미지의 정확한 4×2 셀·동일 접지·투명 여백, 둘째 이미지의 뿔·나무/금속 갑옷·망토·뿌리 지팡이·녹색 발광 유지, 잘린 부위·배경·문자 금지를 지시했다. 생성 원본은 프로젝트 `tmp/boss_dark_druid_8dir_v3_master.png`, 런타임 파일은 `assets/sprites/boss/boss_dark_druid_8dir_v3.png`.
- 3차본 생성 원본 URL: `https://d8j0ntlcm91z4.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/hf_20260927_131421_c03d8399-7370-4b63-81c2-bf16fb2f844b.png`. 요청 프롬프트: “Create a production-quality TRANSPARENT 2D game boss sprite sheet. Image 1 is the EXACT layout template: preserve its full 4 columns x 2 rows, eight complete full-body figures, equal cell sizes, centered feet and generous transparent gutters. Image 2 is the EXACT character appearance reference: the same dark druid boss, branching antler crown, bark and dark metal armor, tattered mossy robe, crooked root staff, intricate sculpted textures and small poisonous green glow. Transfer the richer character design and rendering detail of image 2 onto the eight full-body poses of image 1. Keep every figure entirely within its own cell; NO cropped antlers, staff, hands, robe or feet. All eight figures same scale and silhouette. Different facing direction in each cell. No scenery, ground, words, grid lines, color key, or background. Real transparent alpha outside figures. Crisp coherent high-resolution dark fantasy game art, refined material shading, readable contours, no extra limbs.”
- 3차 생성 원본의 8개 셀은 828×1240px, 유효 알파(>16) 외곽 여백은 좌 64~116·상 14~24·우 97~157·하 30~49px이며 경계 2px 이내 유효 픽셀 0개다. 게임용 1/2 축소 후 414×620px 셀에서도 사방 여백을 유지한다. 실제 `?bosstest=0` 기본 ×4 화면에서 보스 전신을 확인했다. 기존 walk/attack으로 전환되는 순간의 외형 차이와 셀 외곽 손실은 잔여 과제다.
- 게임용 축소본은 3,668,669바이트(생성 원본 13,496,860바이트)이며 8개 셀의 유효 알파 외곽 여백은 좌 32~58·상 7~12·우 48~79·하 15~24px, 경계 2px 이내 유효 픽셀 0개다. 로더는 `20260927-edge3`로 새 파일을 요청한다. 로딩 실패 시 기존 `spec.use2D` 플레인 스프라이트 렌더가 폴백이다.
- 최종 수정 뒤 관련 Node 테스트 4/4, `game.html` 실행용 인라인 스크립트 4개 구문 검사 통과. 브라우저 테스트베드에서 게임용 축소본 로드와 대기 전신을 확인했다. 걷기·공격 32프레임의 셀 외곽·전 패턴 FPS는 완료로 판정하지 않는다.
- 기존 보행 원본과 새 대기 시트를 함께 참조해 앞방향 4프레임(2×2) 재생성을 시험했다(작업 ID `c7e2e9e7-0675-48e0-bb72-6aff375bc70d`). 뿔과 망토의 여백은 생겼지만 지팡이가 프레임마다 좌우로 바뀌고 첫 포즈에 지팡이 2개가 보여 실제 보행 시트로 채택하지 않았다. 이동·공격은 기존 시트를 유지한다.
- 후속 전투 화면 QA에서 조명은 보스 발 위치(r=520)만 비춰 높이 약 620px의 뿔·얼굴이 어둠 마스크에 남는 원인을 확인했다. 상반신 마스크 광원을 추가한 뒤 `?bosstest=0`에서 뿔·얼굴·가슴 형태가 식별되는 것을 확인했다. 별도 녹색/주황색 원판은 보이지 않았다. 테스트 시작점은 `boss.y+3T`, 카메라는 `P.y-2T`로 조정해 전신 구도를 유지하며 플레이어 초기 간격을 늘렸다. 전투 중 돌진하면 두 캐릭터가 다시 겹칠 수 있다.
- `gpt_image_2_5`에 4프레임 가로 보행 스트립도 재요청했다(작업 ID `71767473-5f8d-4711-b541-5a5786ad872d`, 3840×1648/21:9). 지팡이 손은 통일됐지만 전신 대신 뿔·머리·상체만 4개 그려져 하반신이 전부 없다. 이 결과도 기각했다. 2×2 생성은 지팡이·포즈 일관성 실패, 가로 스트립은 전신 구도 실패이므로 기존 32프레임 보행 시트를 자동 생성본으로 덮어쓰지 않는다.
- 2026-09-28: `spin`을 테스트베드 0.1×에서 확인했다. 수정 전 원형 전조가 실제 피격 반경의 약 1/10만 나타나는 원인을 코드에서 확인하고, 경고·발동 범위를 `500+stage×15`에 맞췄다. 새로고침 후 발동 중 넓은 외곽 경계가 보이는 것을 확인했다. 관련 보스 테스트 4/4, 실행용 인라인 JS 4개 구문 검사 통과.
- 같은 화면에서 `burst` 전조를 강제 확인했지만 보스 주변에 화마귀와 다른 오브젝트가 겹쳐 타격 정점 품질은 판정하지 않았다. `grab` 강제 실행은 거리 `305>120`으로 설계상 `bossChargeWind`로 전환되어 붙잡기 프레임 검수가 아니다. 테스트베드 리셋 뒤 카메라에서 보스가 화면 모서리로 이동하는 구도도 확인했으며 테스트베드 조작 화면에 한정한 미해결 사항이다.

**VISUAL VERDICT: RETOUCH** — 저품질로 확정한 3개 발동/전조와 잠행 두둑, 대기 본체 렌더·테스트 화면 구도를 개선했다. 원본 이동·공격 시트의 외곽 손실과 전 패턴 전 페이즈 영상·성능 검수가 남아 최종 PASS가 아니다.

### 2026-09-28 추가 확인

테스트베드 `📍 텔레포트`는 `P.x/P.y`만 즉시 이동시키고 카메라는 이전 좌표에서 따라와 검수 직후 보스 전신이 화면 상단에 잘렸다. 조작 시 `G.cam.x/y=P.x/y`도 즉시 맞추도록 수정했다. 실제 보스 아레나 카메라 추적 로직은 변경하지 않았다.

새로고침 후 `📍 텔레포트` 직후 화면에서 드루이드 뿔·지팡이·발까지 프레임 안에 들어온 것을 확인했다. 보스 주변에 독립 화마귀는 보이지 않았다.

화마귀·지상뱀장어·필드 앵글러는 `ens` 외부 독립 배열이라 기존 `_enterBossArena`의 `ens=[]`에 포함되지 않았다. `_fbTick`·`_fdTick`·`_wmTick`이 si0 보스 아레나에서 필드 몬스터를 재생성했다. 진입 시 세 배열을 정리하고 틱 재스폰을 차단했다. `?bosstest=0` 새로고침 뒤 드루이드 주변을 가리던 화마귀가 사라진 화면을 확인했다. 보스 `summon`의 일반 `ens` 소환수는 유지한다.

관련 `ch1DruidAssignment`·`fireDevilSpawn`·`druidFinalePacing` Node 테스트 26/26 통과. `game.html` 실행용 인라인 JS 4개는 별도 문법 검사 대상이다. 화면에서 남은 어설픈 지점은 구 walk/attack 시트의 경계 잘림과 새 대기 시트로 전환할 때의 외형 차이, 보스 발밑으로 파고드는 플레이어 및 보스 소환수에 따른 가림, `grab` 거리 조건을 반영하지 못하는 테스트베드 강제 버튼이다.

`grab` 전조를 근거리에서 재검수했다. 기존 일반·보스용 두 렌더 경로가 모두 40프레임을 하드코딩하여 si0 60프레임 전조의 초반 진행도가 음수가 됐고, 일반 경로의 경고는 실제 판정 `e.r+P.r+200`보다 작은 몸통 주변에 머물렀다. 시작 시 `_grabWindMax=e.st2`를 저장하고, 전조 전 구간을 0~1로 제한하며, 판정과 같은 반경의 원형 바닥 경계·옅은 내부·집게 표식을 표시한다. 보스용 중복 부채꼴 경고는 판정 모양과 달라 제거했다. 0.1× `bossGrabWind` 화면에서 녹색 뿌리 경계가 보이나 보라색 원형 경고의 실제 대비와 타격 프레임은 추가 검수 대상이다. 이 패턴을 시각 PASS로 기록하지 않는다.

## MAP PRODUCTION REPORT — 보스 테스트 카메라 한정

| §23 항목 | 이번 작업 결과 |
|---|---|
| STAGE / MASTER | si0 `?bosstest=0` 시야 검수. 마스터 실루엣·region·메인 경로·사이드 공간 변경 없음 |
| OUTER MASS / LARGE / MEDIUM | 좌·우·상·하 외곽, 에셋 합성·겹침·반복·접합·큰 빈틈 변경 없음 |
| GROUND | 그림자·오염·구조물 통합 변경 없음. 보스 VFX의 토양 표현만 변경 |
| PLAYABLE | 실제 아레나·이동로·collision 변경 없음. si0 아레나에 잘못 남던 독립 필드몹 3종의 진입 정리·재스폰 차단. 테스트베드 플레이어 시작점은 `boss.y+3T` |
| LANDMARK | 1-1 주 랜드마크·보조·소형 랜드마크 변경 없음 |
| CAMERA QA | START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 전체 보드 재검수 미수행. `?bosstest=0`에서 `boss.y+3T` 시작·카메라 `P.y-2T`·기본 ×4의 전신과 상반신 조명 확인. 테스트베드 순간이동 직후 카메라 좌표 동기화 추가 |
| TECH QA | 경로·충돌·seam·성능 전수 재검수 미수행. 테스트베드 페이지 로드와 보스 관련 테스트 4/4, 실행용 인라인 JS 4개 문법 확인. 회전참 0.1× 발동 경계 실화면 확인 |
| FILES | stage 소유: `game.html`, `assets/sprites/boss/boss_dark_druid_8dir_v3.png`, 이 문서, `CH1_1_DRUID_BOSS_ASSIGNMENT.md`, 애니메이션 파이프라인/몬스터 기준 문서, `CHANGELOG_SYNC.md`; 동시 작업 파일이 많은 작업트리에서 무관 변경 보존 |
| GIT | 작업트리에서 타 작업 변경이 계속 추가된다. `exec_command`가 명령 시작 전 `CreateProcessW` 오류로 실패해 이번 조명·테스트 구도 수정은 커밋하지 못했다. 타 작업 변경은 보존; 푸시·배포 없음 |
| VISUAL VERDICT / NEXT PASS | **RETOUCH**. walk/attack 원본 외곽 재작업, 23종 패턴의 타격 정점·프레임별 시각 QA 및 성능 측정 필요 |


## 2026-10-03 source23 — 보스 착지·탄막 전조 범위 동기화

| 상태 / 적용 위치 | 현재 표시값 | 실제 판정·보존 경계 |
|---|---|---|
| `bossJump` 바닥 fill/stroke | `e.jumpX,e.jumpY` 중심 반경300px 고정. 이전30~60px 및 후보300×진행도는 미사용 | 착지 즉시 피해 `dst(P,e)<300`·atk×1.8·무적/돌진 예외 유지. 충돌 없는 경로에서 목표=실착지 중심. 벽막힘 시 실제 `e.x/e.y`와 목표의 기존 괴리는 미해결 |
| `bossFanWind` arc·오브 각도 | `π×(.7+e._bossPhase×.06)`, 페이즈0~4에서126/136.8/147.6/158.4/169.2도 | 실제 발사 `fanW`와 동일식. 방향 표시 길이 `120+stage×3`은 사거리 표시가 아님. 탄 수·RNG·피해·수명·유도 불변 |
| 검수 / 적용 | 양판 각각 draw3접점만 수정, 역치환 source22 byte-exact. 신규8 PASS(원본4 PASS/4 FAIL); 실제 분기·기존 회귀 포함12 PASS | canvas는 호출 기록 대역이며 native·화면·GPU·시각 최종 인수 아님. source23 앱3398 포장·타이틀·HTTP 확인; source22/3397 앱은 기존 코드 보존 |

상세 수치·실제 분기·한계·§23 보고는 [source23 전조 계약](CH1_BOSS_LANDING_FAN_TELEGRAPH_20261003.md)을 따른다. 피해·패링·타이밍·맵 geometry·카메라·기존 앱/세이브는 변경하지 않았다.


## 2026-10-08 — 드루이드 휩쓸기 가독성 현행 보충

| 범위 | 현재 코드 |
|---|---|
| 준비·발동 | SweepWind 셀1 유지. Sweep의 기존14f 진행도 clamp(1−st2/14,0,1)에서 .15<진행도<.85는 셀2, >=.85는 셀3, 나머지는 셀1. 공통 recover는 기존 idle 유지; 기타 공격은 150ms 선택 유지 |
| 정상 본체 첫 pass | 밝기1.2·대비1.08·1.5px 윤곽(alpha .8); 기존 filter 합성·finally 복구. 비문자열 filter는 원 draw. rig/native 기존 crop·목적 영역, lighter2pass·hit flash 유지 |
| 검증·한계 | 최초 통제 Node1/12그룹31PASS/FAIL0, before 반례1 별도. 실제 GPU·pixel·전체 모션·전투·청취·save 미인수. RETOUCH / UI_NOT_ASSESSED |

[상태별 표시·정확 consumer 정본](../4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md#druid-sweep-readability-20261008). 앞선 150ms 전체 공격 설명과 과거 검수는 각 당시 epoch이며 현재 Sweep 예외를 덮어쓰지 않는다. 원본 PNG·시간·AI·피해·세이브 변경0.
