# 실버테일 Shift 도약·비행·착지

2026-09-24 사용자 요청: 전사 Shift 도약·비행·착지 구현과 함께 실버테일도 같은 모션을 추가한다. 실버테일 캐릭터 구조에 맞춰 독립 시트를 제작했다. 기존 idle/walk와 등검 공격 시트는 보존한다.

| 항목 | 계약 |
|---|---|
| 적용 | `exoduser_silvertail`만. Shift 사슬 이동의 준비/도약·끌림/착지 구간 |
| 시각 정체성 | 은회색 높은 포니테일, 흑철 갑주, 갈라진 치마, 등 상부 회전검 허브. 새 주무기를 손에 추가하지 않음 |
| 참조 | `img/exoduser_silvertail/attack-spin-v2.png` 등검 회전 포즈 + `img/exoduser_silvertail/south.png` 실제 본체 |
| 생성 | GPT Image API `gpt-image-2`, edit, high,1536×1280, 내부 이미지 도구. `.env` 인증을 프로세스 안에서만 사용 |
| 원화 | `output/imagegen/silvertail_dash_20260924/source.png`; 프롬프트 `prompt.txt` |
| 원화 배열 | 6×5 / 256px 셀, s/se/e/ne/n. 열0 웅크림,1 도약,2~3 비행,4 착지,5 회복 |
| 런타임 PNG | `img/exoduser_silvertail/dash-flight-v1.png`, RGBA384×512, 64px 셀,6열×8방향 |
| 방향 | s,se,e,ne,n,nw,w,sw. nw/w/sw는 ne/e/se 행 좌우 반전 조립 |
| 패킹 | `tools/pack-silvertail-dash-flight.py`; 원화의30개 8연결 포즈 분리, pure-green key, 공통축척 .22, 바닥y50/셀 중심x32 앵커 |
| 런타임 확장 | `WarriorDashFlight.apply(base,frameMap,done,'silvertail')`; 현재 공격 확장 뒤 시트 하단512px 추가. `dash[_start/_fly/_land]_{s,se,e,ne,n,nw,w,sw}`만 교체 |
| 실행 순서 | 본체→등검 공격 remaster→비행 시트. 공격 실패 때도 비행 시트를 로드. 잘못된 크기/로드 실패면 기존 기본 시트 유지. 선택 캐릭터/아틀라스 교체 시 늦은 콜백 무시 |
| 재생 | start2포즈×4틱, fly2포즈×4틱 반복, land2포즈×4틱. 기존 캐릭터 전투 상태/이동 시간을 유지 |
| 방향·높이 | 실제 사슬 속도 `atan2(_dashVY,_dashVX)`; 본체만 높이 `-12×sin(π×clamp(_dashLeft/_HARP_PULL_DUR[tier],0,1))`px. 공격/충돌 좌표 불변 |
| 착지 | 기존30틱 창에서 idle·정지 상태만 재생. 공격/이동 시 애니메이션을 양보. 원화 웅크림을 보여 주려고 전사 기본 squash만 실버테일에 한해 비활성 |
| 유지 | 기존48px 본체 idle2/walk4/atk4, 본체1.3배, 등검 회전 공격9프레임은 그대로 |
| 연결 | `game.html`, `game-easy-test.html` 공유 `warrior-dash-flight.js`; 코드·시트 버전 `20260924-flight1`. NW.js 파일 목록에 JS 포함 |
| 검수 | `tools/silvertail-dash-review.html` 실제 런타임 시트를 8방향으로 재생·정지·수동 진행 |
| 범위 | 실버테일 전용으로 생성. 다른 캐릭터/적은 적용하지 않음 |

같은 생성 포즈를 오른쪽 세 방향에서 좌우 반전해 왼쪽 세 방향을 만들기 때문에 반대 방향에선 칼 손의 화면 쪽이 뒤집힌다. 생성된 프레임의 미세 장비·머리카락 변화가 수작업 리깅과 같지 않음을 기록한다.
