# 전사 Shift 도약·비행·착지

사용자 요청: Shift 이동 때 서 있는 자세를 없애고, 예전에 있던 비행 후 착지 모션을 다시 만든다. 기존 `CHAR_LIST`는 `dashN:1`이어서 세 단계 클립이 생성되지 않고 한 장의 `dash`로 폴백했다. 백업의 구 16프레임을 참조하고 현재 전사 외형으로 새 모션을 제작했다.

| 항목 | 현행 값/계약 |
|---|---|
| 대상 | `exoduser_warrior` 전사 Shift 사슬 이동. 실버테일 기존 시트 유지 |
| 생성 | OpenAI GPT Image API, `gpt-image-2`, edit, high, 1536×1280. `.env`의 연결된 인증을 메모리로만 사용 |
| 외형 참조 | `img/exoduser_warrior/attack-bat-v1.png` |
| 원화 | `output/imagegen/warrior_dash_20260924/source.png`, 정면·후면 방향 보정 `source_v2.png` |
| 프롬프트 | 같은 디렉터리 `prompt.txt`, `direction-fix-prompt.txt`에 생성·보정 전문 저장 |
| 원화 배치 | 6열×5행, 명목 셀256×256, s/se/e/ne/n. 실제 셀 경계를 넘어간 포즈는 연결요소 기준으로 추출 |
| 런타임 PNG | `img/exoduser_warrior/dash-flight-v1.png`, RGBA384×512, 64×64 셀, 6열×8행 |
| 방향 행 | s,se,e,ne,n,nw,w,sw. nw/w/sw는 ne/e/se 좌우 반전 |
| 프레임 열 | 0준비, 1도약, 2~3공중 비행, 4착지, 5회복 |
| 패커 | `tools/pack-warrior-dash-flight.py`: 8연결요소30개, 공통 축척0.205, 어두운 하단 갑옷 중심x32/바닥y50 정렬 |
| 투명 처리 | G>100 및 G>1.35R, G>1.35B 크로마 제거, 경계 G≤max(R,B), LANCZOS 축소. Canvas 기본 source-over |
| 로더 | `WarriorDashFlight.apply`: 공격 확장 완료 후 아틀라스 아래512px 추가, 폭max(기존,384). `dash`와 `dash_start/fly/land`의8방향만 연결 |
| 순서·폴백 | 기존 본체→WarriorBatSwing→WarriorDashFlight 순서. 공격 로드 실패여도 대시 로드 진행. 대시 실패/치수 불일치는 기존 아틀라스 유지. 캐릭터/아틀라스 교체 뒤 늦은 응답 무시 |
| 클립 | `dash_start`=0~1 단발, `dash_fly`=2~3 반복, `dash_land`=4~5 단발; 공통4틱/프레임 |
| 시작/비행 전환 | 사슬 비행 중 start 재생, 완료 후 fly. 실제 당김 시작 시 즉시 fly. 게임 시간7/11/16틱 이동 유지 |
| 착지 | 기존 `_harpLandT=30` 유지. idle이며 보행하지 않을 때만 착지 표시. 움직임/공격/피격 상태를 덮지 않음. 전사는 기존 착지 squash를 중복 적용하지 않음 |
| 방향 | 비행/착지는 `atan2(_dashVY,_dashVX)`, 사슬 발사는 `atan2(_harpVY,_harpVX)`. 영벡터는 기존 `P.facing` 폴백. 실제 조준·이동값 변경 없음 |
| 공중 높이 | 본체만 `-12×sin(π×clamp(_dashLeft/_HARP_PULL_DUR[tier],0,1))` px. 충돌/월드 위치/공격 범위 불변 |
| 기본 데이터 | 기존48px 본체·CHAR_LIST `dashN:1`은 로드 실패 폴백으로 유지. 일반/E 공격9프레임·idle2·walk8 유지 |
| 연결·배포 | game.html, game-easy-test.html, build-nwjs.mjs. 모듈·PNG 버전 `20260924-flight1` |
| 미리보기 | `/tools/warrior-dash-review.html`, 8방향 재생/일시정지/프레임 이동 |

## 검증

- `warriorDashFlight`의 8방향 클립, 공격·보행 보존, 실패/오류 크기 폴백, 방향, 착지 중단,48셀 투명 경계/크로마 제거/서로 다른 포즈 검사 통과.
- 기존 `warriorBatSwing`, `playerMotionContinuity`, `chainPartialGauge`, `gameHtmlInlineSyntax` 포함 총34개 검사 통과.
- 실제 브라우저에서 전사 아틀라스 fly2/attack9 동시 로드를 확인. 저장 비활성 `testchar=1&dropPreview=1` 검증 탭 사용.
- 실제 `drawP()`를 도약/비행/착지/대기 상태로 호출해 `dash_start`→`dash_fly`→`dash_land`→`idle` 선택과 그림자·본체 높이를 확인했다. 비교 이미지 `output/imagegen/warrior_dash_20260924/runtime-poses.png`. 테스트 탭 종료로 임시 검증 상태 제거.
- 패킹된8방향 비행·착지의 투명 배경과 실루엣을 미리보기에서 시각 확인. 좌측3방향은 대칭이라 검을 잡는 손도 반전되며, 생성 포즈의 세부 픽셀은 기존 원본과 완전히 동일하지 않음.
