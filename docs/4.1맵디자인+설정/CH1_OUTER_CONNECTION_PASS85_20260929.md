# CH1-1 피부 바닥–사목 접합 85차 — 2026-09-29

본편 cache/bakeVersion은 **20260929-outer-85**다. 서측 하단의 피부 바닥과 쓰러진 사목 사이에 남은 고사리 일부를 낮은 부패 수피·괴사막으로 교체했다. 84차 위에 한 개의 국소 레이어를 추가했으며, 실제 디스크 반영과 새로고침한 게임 화면을 검수했다. 전체 맵의 식생 반복·밀집 전투 가독성은 계속 리터치 대상이다.

## 제작 순서와 범위

공통 제작 가이드 v0.9 전체 → 맵디테일의 확정 콘셉트 → _MAP_SSOT_INDEX → 현행 원화·실제 게임 화면 순으로 확인했다. MASTER PLAN/큰 외곽 구도는 유지하고, MEDIUM CONNECTION → GROUND CONNECTION → PLAYABLE/COMBAT → CAMERA QA → TECH QA를 진행했다. 새 랜드마크나 중앙 장식은 추가하지 않았다.

확정 콘셉트는 넓은 전투공간, 피부 같은 바닥, 꿈틀거리는 동맥, 부패한 생체나무의 음침한 살아 있는 지옥이다. 이번 패치는 **정적 원화**이며 새 생체 모션은 없다. 기존 61차 Ch1LivingDetail·늪·동맥 기능은 유지된다.

## 현행 런타임·합성 계약

| id / 적용 위치 | 수치·공식·결과 |
|---|---|
| OUTER85_RUNTIME / game.html:_CH1_START_OUTER.chunks | 20260929-outer-84 → **20260929-outer-85**. 기존 64개 URL의 버전값만 변경. 다른 렌더·게임플레이 코드는 이번 작업에서 변경하지 않음 |
| OUTER85_DIMENSIONS | master8192×8192 / world8000×8000 / tile40 / 맵200×200. 청크8×8=64개, core1024 / bleed1 / 파일1026×1026 |
| OUTER85_BASE | 실제 합성 입력 master84 SHA256 `b1f55342c80c06b01e41ce6141bf19acdcd75d2d986511b8732a9560b0ccd35c` |
| OUTER85_CROP | master 좌표[1024,5120,3072,7168], 2048×2048. 저장 레이어 x1024/y5120/width2048/height2048 |
| OUTER85_REGION | crop-local ellipse[cx485,cy1510,rx300,ry210]. q=((x−485)/300)²+((y−1510)/210)², t=clamp((1−q)/.3,0,1), region=t²(3−2t), opacity=.94 |
| OUTER85_PRIOR_PROTECTION | 73..82 및84차 mask 보호(73차 alpha>12, 나머지 alpha>0). 83차는 전체 암부 채움이므로 이 국소 보호 합집합에서 제외. 이전 패치 보호 해제 창은 crop-local[210,1300,790,1740]의 반열린 범위 안뿐 |
| OUTER85_SNAGS | 보호 rect[330,1320,420,1590], [0,1610,330,2048], [540,1720,850,2048], [0,1760,2048,2048], [0,0,2048,1260]. 줄기 보호 MaxFilter25 / GaussianBlur18 |
| OUTER85_FLOOR | authored200² grid: row=min(199,int((y+5120)/40.96)), col=min(199,int((x+1024)/40.96)), nav>0인 보행 픽셀 alpha0. 40.96=8192/200인 master 픽셀 간격. 보행 경계 보호 MaxFilter81 / GaussianBlur25, alpha에 (1−floorProtect) 곱함. 계단 형태의 날카로운 경계를 완화 |
| OUTER85_BLEND | protect=GaussianBlur18(MaxFilter25(core×255))/255. alpha=region×(1−protect)×.94×(generatedAlpha/255)×(1−floorProtect), core·floor alpha0. alpha=uint8(alpha×255)/255. paintRGB=clip(generatedRGB,24,255). RGB=uint8(base×(1−alpha)+paint×alpha), master 기존 alpha 유지 |
| OUTER85_RETOUCH_FILE | preblended RGB와 binary alpha0/255. 기존 applyRetouchLayers로 전체 마스터를 정확히 재현. 저장 mask는 최종 양자화 alpha |
| OUTER85_LAYERS | skin65 + outer66..85 = **21개**. 앞선 20개 레이어 파일 유지. 런타임은 완성 청크를 사용하며 이 빌드 레이어를 개별 draw하지 않음 |
| OUTER85_PIXELS | 변경101764px 전부 비보행. 보행0 / 핵심 보호3579735px 중 변경0 / 이전 mask 변경43225px은 해제 창 안, 창밖0 |
| OUTER85_BOUNDARY | 타원밖0 / zero-mask0 / crop밖0. 전체 마스터 비교로 동일성 확인 |
| OUTER85_DARK_PIXELS | 선택2048² crop maxRGB≤12/18/22는 각각17392/63422/122945 → 같은 값. 이번 패치가 어두운 픽셀을 추가하지 않으며 검정 픽셀을 모두 제거했다는 뜻이 아님 |
| OUTER85_CHUNKS | chunk_1_6.png 한 개 변경 / 나머지63개 동일. 전체64개가 clamped master와 픽셀차0. 경계 strip224개 동일 |
| OUTER85_MASTER_SHA256 | `d9580b0be15524398a52956b288697528365b288d98fc101bdaa8f449ef38a76` |
| OUTER85_BACKUP | tmp/ch1-production-pre85: 변경 전 master84·chunk1_6·composition·preview·retouch manifest·game 및 초기 관련 docs 보존 |
| OUTER85_GAMEPLAY | geometry / collision / route / MAP_OBJS / 몬스터 수치 / 진행·세이브 계약 변경0. 패치는 저대비 비보행 외곽에만 적용 |

## 생성 출처

| 항목 | 값 |
|---|---|
| 공급자 / 모델 | Higgsfield / GPT `gpt_image_2_5` |
| job | `af7aa493-9031-4465-8cec-3e04880867ef` — 한 번 제출한 결과를 마스크 보정에 재사용 |
| 확인된 참조 media | `b27be7cc-c007-40e6-b4f3-94f786f857dc` / **master80 crop**. 현행84를 업로드했다고 표기하지 않음 |
| 참조–합성 입력 차이 | 현재84 선택부와 참조의 픽셀차76359. 이후 암부·접합 보정으로 생긴 차이. 생성 이미지 전체를 교체하지 않고 보호된 국소 영역만 사용 |
| 생성 옵션 | 1:1 / 2k(2048²) / high / opaque / count1 / 사전 확인 cost2.75credits |
| 생성 의도 | crop-local 중심(470,1470), 요청창 x230..730/y1320..1640의 낮은 잎·이끼를 부패 수피·회보라 괴사막·짧은 목질 섬유·탁한 적색 연결 섬유로 교체. 고목·넓은 보행 바닥·다른 구역 고정, 새 나무·빛·건강한 식생 금지 |
| 생성 원본 SHA256 | `e301818fbff0d91eae91dbdd1e895a8db7623b95ebcb3c928088e231b9c26369` |
| 저장 경로 | assets/map/ch1/production_finish/outer85_sources/{outer85_patch.png,outer85_mask.png,source-provenance.zip} |
| 출처 ZIP | edited_connection.png / generation.json(전체 프롬프트·옵션·출처) / prep.json(합성 수치) / manifest.json. 4개 항목·SHA 검증 완료 |

## 새로고침한 본편 검수

Chrome의 독립 QA 탭, 논리2534×1235/DPR1/viewport override0에서 실제 production 파일을 새로고침했다. 후보 청크 메모리 대체 없이 본편 URL의85차 버전을 사용했다. 각 시점은 위치·카메라를 설정한 다음 새 draw3회 이상과 visible/drawn 청크 일치를 기다리고 캡처했다. 카메라별 확인이므로 시작부터 출구까지 연속 도보 종주했다는 뜻은 아니다.

| 카메라 | tile 좌표 | 실제 화면·계약 확인 |
|---|---|---|
| START | [100,185] | 시작 공터·6시 진입·카메라 하단 클램프 유지 |
| EARLY | [100,157] | 초반 넓은 피부 바닥과 외곽 유지 |
| ARENA | [100,120] | 중앙 전투 여백·좌우 우회 유지 |
| SIDE L | [49,151] | 서측 접합·피부 바닥·그림자 유지 |
| SIDE R | [151,136] | 동측 늪·오염 및 기존 원화 유지 |
| LANDMARK | [102,90] | 시체나무 랜드마크 유지 |
| LATE | [100,48] | 후반 진입 통로·위협 여백 유지 |
| EXIT | [100,15] | 12시 출구·상단 통로 유지 |
| JOIN85 | [38,161] | 새 막과 사목 접합, 고목 윤곽·보행 경계 유지 |
| COMBAT85 | [44,157] | 24적 추가 후 공격·Q·적 투사체·사망/추가 적 관측 |

- 8개 기본 카메라·접합·전투 위치 = 고유10개 위치. 8개 기본 화면을 다시 저장하여 runtime 기록은18개다. 모든 표본에서 G.map 불변·outerErrors0·visible/drawn 일치.
- 이동: 게임 keydown/keyup 핸들러로 전달한 합성 DOM S/W 이벤트 각650ms. [38,161]에서 S 이동2.9300worldpx(남쪽 충돌 경계), W 이동114.2713worldpx. native CUA 단발 S 입력은 프레임 이동0이므로 지속 홀드 성공으로 계산하지 않았다.
- 전투: 합성 DOM mousedown으로 좌클릭 공격 유지, Q keydown/keyup120ms를 표본0/3/6/9에 전달. 12×2500ms 표본과 준비 시간을 포함한 공격 유지39.3664초. 처음24적을 추가했고, 전투 중 살아 있는 적22..29·투사체0..16을 관측했다. HP100ms 복구/무적63f를 사용했으므로 난이도·생존 밸런스 검수가 아니다.
- 별도 QA slot에서 API 쓰기7회 차단, 임시 카메라·HP타이머·이벤트·추가 적은 해당 탭 종료로 정리. 실제 세이브 복원 검수는 이번 범위가 아니다.
- 게임 window error0 / WebGL context lost·restored 이벤트0. 콘솔에는 Monica 브라우저 확장 content.js의 contains TypeError1회가 있었으며 게임 코드 오류로 합산하지 않았다.
- 본편 청크64개를 no-store로 다시 요청해 실패0/마스터 HEAD200 확인. 원화21레이어 전체 픽셀 재현·64청크·224경계 검사 PASS. 기존 회귀4파일 **55PASS/0FAIL**. 테스트 환경 GLib manifest 경고1개는 로그에 보존했으며 실패로 판정되지 않았다.
- 과거83차 실제GPU 흰 화면의 원인 해결·장시간 안정성·FPS 개선은 이번 검수로 확정하지 않는다. 새 런타임 draw/atlas 추가0이며 성능 개선율 미측정.

커밋 가드의 기준 파일 재저장 실패도 수정했다. 검사 결과와 기존 기준 파일이 바이트 단위로 동일할 때만 쓰기를 생략한다. 실제 내용이 바뀌면 저장하며 쓰기 실패·보호 검사 실패는 계속 차단한다. 회귀5개는 RED4PASS/1FAIL → GREEN5PASS. 맵55개와 합계60PASS이며 실제 커밋 hook에서 인라인/module6개 구문 검사도 실행한다. [저장 분기·변수·진단 SSOT](../13출시·마케팅/GUARD_BASELINE_PERSISTENCE_20260929.md).

소스 보존: 기존 master LFS 설정을 유지하고,136875785byte의 outer76_81-provenance.zip도 .gitattributes의 정확한 해당 경로에 filter=lfs/diff=lfs/merge=lfs/-text로 등록했다. 이미지·ZIP 원본의 위치와 bytes는 바꾸지 않는다. 커밋 분리는 경로별 clean filter를 적용하며 두 LFS pointer의 SHA256을 실제 파일과 대조한다. LFS 서버 업로드·푸시는 이번 작업에서 수행하지 않는다.

검수 파일: [runtime.json](../../captures/ch1_outer85/live/runtime.json), [55개 회귀](../../captures/ch1_outer85/tests.log), [현재21레이어 재현](../../captures/ch1_outer85/layer-verification-current.log), [64청크·224경계](../../captures/ch1_outer85/production-verification.json), [전후 비교](../../captures/ch1_outer85/detail.jpg), [접합 화면](../../captures/ch1_outer85/live/JOIN85.png), [전투 화면](../../captures/ch1_outer85/live/COMBAT85.png).

## 84차 상태 기록 보정

앞선 문서의 “추가 카메라·전투·베이크 검수 중” 및 captures/ch1_outer84/REPORT.md의 “본편 미적용”은 초기 후보 단계의 기록이었다. 저장된 promotion·live/runtime·로그와 작업 시작 시 실제84차 파일을 대조해 최종 적용·18카메라·24적30초 전투·마스터/64청크 동일 검수가 끝난 사실을 확인했다. 초기 후보의38525px/보행0 수치와 최종109465px(보행재질12058/비보행97407) 수치는 서로 다른 마스크 단계다. 이 둘을 같은 결과로 합치지 않는다. 84차 기록은 제작 이력으로 보존하며 현행은85차다.

## MAP PRODUCTION REPORT

| 구분 | 필수 항목 | 이번 결과 |
|---|---|---|
| STAGE | 대상 | CH1-1/stage0, 정적 피부–사목 외곽 접합85차 |
| MASTER | silhouette / regions / main route / side spaces | 기존200²/8구역/큰 실루엣·6시→12시 주동선·양쪽 공간 유지 |
| OUTER MASS | LEFT / RIGHT / TOP / SOUTH / major holes | LEFT 하단 국소 수정, RIGHT/TOP/SOUTH 배치 유지. 새 검정 공동 증가0; 다른 구역의 큰 암부와 식생 잔여 |
| LARGE | source assets / composites / overlap / repeated silhouette | GPT crop 편집1, 국소 합성1. 큰 줄기·사목·이전 패치 보호. 다른 고사리 반복은 잔여 |
| MEDIUM | connections / remaining holes | 피부 바닥과 사목의 낮은 괴사막·수피 연결. 새로운 장식/빈 공동 추가0 |
| GROUND | shadow / contamination / structure integration | 보행재질 변경0, 부패 조직의 낮은 접지·부드러운 경계. 기존 피부·오염·그림자·늪 유지 |
| PLAYABLE | main arenas / travel space / breathing space / threat space / combat readability | 넓은 공터·이동·회피 여백 유지. 실제 게임 이벤트 기반 이동·공격/Q 확인. 밀집 VFX와 숫자 중첩은 잔여 |
| LANDMARK | primary / secondary / tertiary | 시체나무 / 늪·야영지·제단 / 뼈아치·출구 유지, 신규0 |
| CAMERA QA | START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 8개 모두 새로고침한 본편 화면 확인·저장, 접합·전투 추가2개. 오류0/G.map동일 |
| TECH QA | route / collision / pageerror / 404 / seam / loading / performance | map 불변·S/W 이동, 게임error0,64청크 응답실패0,224경계 동일,ready 청크draw 일치. 55PASS/21레이어 정확 재현. 성능 개선율 미측정 |
| FILES | stage-owned / concurrent touched / unrelated touched | 원화·chunk1_6·preview·composition·retouch manifest·outer85소스·관련 docs. 공유 game은 버전값 한 곳만, CHANGELOG는85차 기록·필수 가드 저장 보정만. tools/guard.js·회귀5개·가드SSOT·해당 ZIP LFS 경로 추가. 타 작업 유지 |
| GIT | staged / commit / push / deploy | 맵73..85 원화·빌드소스·game cache값·85차 보고서/요약 및 필수 가드 저장 보정만 분리 커밋 대상. 기존 타 작업 스테이징 보존. 실제 ID·성공 여부·검증은 [체크포인트](../../captures/ch1_outer85/git-checkpoint.json). 푸시·배포0 |
| VISUAL VERDICT | 판정 | **RETOUCH** — 이번 접합 개선·바닥/고목 보호는 확인. 전체 식생 반복·검정 공동·밀집 효과와 과거GPU 안정성은 후속 대상 |
| NEXT PASS | 후속 순서 | 다른 외곽의 건강한 잎 형태를 큰 실루엣부터 국소 교체, 검정 빈공간 감소/보행 여백 유지 → 실제 공격 프레임·장시간GPU 검수 |

이번 결과를 전체 맵 AAA 완성이나 새 생체 모션 구현 완료로 보고하지 않는다.
