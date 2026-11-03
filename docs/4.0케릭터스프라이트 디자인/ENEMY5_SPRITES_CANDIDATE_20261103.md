# 1-1 일반몹 5종 스프라이트 후보 — 2026-11-03

20논리군/440개 저작 키의 오프라인 후보 제출. 사용자 승인 전 게임 반영0. 실제Player 1x·조명·접지·자연전투·독립검수 미검증이며 게임용아트PASS가 아니다.

|우선|visual species|한글명|실제40종 skin idx|2000seed 계획생성수|
|---:|---|---|---:|---:|
|1|bone_centipede_pro|뼈지네|8|12976|
|2|headless_knight|목없는 기사|23|10820|
|3|bone_archer|뼈궁수|35|9275|
|4|apostle_knight|사도기사|2|9255|
|5|gut_witch|내장마녀|27|9214|

Core114개를 읽기 전용으로 사용해 seed1..2000,14소환굴·168활성위치/판의 비보스 계획생성364831회를 집계했다. 이는 자연전투의 화면점유·생존시간 실측이 아니다. 3~8위의 수가 가까우므로 실제Player 빈도에 따라 후속 우선순위는 조정한다. 행동etype 빈도와 시각skin idx를 혼동하지 않는다. current-common-source-comparison/source-stability 및 population-2000.json을 보존한다.

|종|군|선택 경로|키|atlas|
|---|---|---|---:|---|
|뼈지네|idle8|enemy-bone_centipede_pro-idle8-r31|8|2048×1024|
|뼈지네|walk8|enemy-bone_centipede_pro-walk8-r31|32|2048×4096|
|뼈지네|attack8|enemy-bone_centipede_pro-attack8-r31|32|2048×4096|
|뼈지네|hurt8|enemy-bone_centipede_pro-hurt8-r31|16|1024×4096|
|목없는 기사|idle8|enemy-headless_knight-idle8-r31|8|2048×1024|
|목없는 기사|walk8|enemy-headless_knight-walk8-r31|32|2048×4096|
|목없는 기사|attack8|enemy-headless_knight-attack8-r32-body-camera|32|2048×4096|
|목없는 기사|hurt8|enemy-headless_knight-hurt8-r31|16|1024×4096|
|뼈궁수|idle8|enemy-bone_archer-idle8-r31|8|2048×1024|
|뼈궁수|walk8|enemy-bone_archer-walk8-r31|32|2048×4096|
|뼈궁수|attack8|enemy-bone_archer-attack8-r31|32|2048×4096|
|뼈궁수|hurt8|enemy-bone_archer-hurt8-r31|16|1024×4096|
|사도기사|idle8|enemy-apostle_knight-idle8-r31|8|2048×1024|
|사도기사|walk8|enemy-apostle_knight-walk8-r31|32|2048×4096|
|사도기사|attack8|enemy-apostle_knight-attack8-r31|32|2048×4096|
|사도기사|hurt8|enemy-apostle_knight-hurt8-r31|16|1024×4096|
|내장마녀|idle8|enemy-gut_witch-idle8-r32-material|8|2048×1024|
|내장마녀|walk8|enemy-gut_witch-walk8-r32-material|32|2048×4096|
|내장마녀|attack8|enemy-gut_witch-attack8-r33-staff-span|32|2048×4096|
|내장마녀|hurt8|enemy-gut_witch-hurt8-r32-material|16|1024×4096|

전종 원본256²→후보512²의 2배 텍셀 밀도. R30의 저작 여백768×640은 R31~33에서 투명영역만 제거했고 RGBA 원복 차이0을 증명했다. 선택20개 모두 셀512²/추가패딩0이다. 방향은 CW S,SE,E,NE,N,NW,W,SW(드루이드 CCW와 다름).

|계약|현재값 및 후보 요구|
|---|---|
|원점|기존Core 중심/판정/이동/시간 변경0, 원본pivot(.5,.5) 보존|
|배율|NativeSpriteFor PPU100 유지, 원본e.Radius*7/256→후보e.Radius*7/512 논리표현 제안|
|발|원본A64 하단×2와 후보하단 일치, 실제3D 바닥·판정 접지는 별도 검수|
|idle|8방향 정지 포즈. 방향턴테이블은 새 호흡모션 증거가 아님|
|walk|4키×8방향. 원본은 base+partial overlay, 새후보는fullbody. 상태소스 어댑터로 기존base를 숨겨야 함. drop-in 호환 아님|
|walk시간|원본distance/128 mod4 유지. 검토GIF150ms/키는 실게임 속도 아님|
|attack|원본idle alias 대비 새4키×8방향 제안, Core 공격시간/투사체 변경0·미바인딩|
|hurt|원본idle+redtint(1,.62,.62) 대비 새2키×8방향. 검토 idle300/impact100/recovery150/idle300ms, 실제Core시간 아님|
|normal|diffuse 동일alpha/규격 실루엣bevel4 추정, 내부재질 PBR 실측 아님|
|색·점|무디더링 BOX/alpha128/팔레트. 일반4종64→24색, 마녀는공통56색 재질분리 팔레트(보라8/붉은12/뼈12/의복피부24)|
|비교|원본셀128px 정규화1x와 후보1x/실제3x. 실제Unity 카메라1x 증거와 구분|

제작자 직접 검토: 전20군의 모든8방향·키를 1x matrix와 최대1152×960의 원시3배 folded 판에서 확인했다. 후처리 디더/그레인/노이즈 추가0, 외딴 잔점은 제거했다. 전체선택31 atlas 단일alpha점0/부분alpha0/normalalpha차0는 final-pixel-audit.json에 별도 기록하며 내부표현·실제Player 시각PASS의 대용이 아니다. 모든 무음MP4는video-only/전수디코드exit0. 실제UI 플레이백은 미검증이다.

수정 이력: 뼈지네E/W 선두머리 방향, hurt N/NW 후면; 목없는기사hurt SW/attack 목절단점 기준 몸카메라; 궁수attack S/N/NW 발사방향; 사도기사attack N ready 오른손; 마녀N 장비좌우/NE걷기 장구/ NW시전구체 방향을 교정했다. 마녀W걷기 발아래잔점이bbox 배율을 축소한 원인은 원시 연결성분을 분리해 제거하고 4키 공통배율로 재산출했다. 마녀NW시전은 올라간 구체가bbox를 키워 몸을 줄이던 별도 제공자카메라를 고정장비 기준1.15로 보정했다. 포즈별 정규화0이라고 주장하지 않는다. 이전시안·원시·실패패치 전부 I: 보존.

검토 산출물 G:/exoduser/tmp/design-review/20261102_sprites (실체 I:/EXODUSER-Storage/archive/G/exoduser/tmp/design-review/20261102_sprites). index.html에 각군 격자/GIF/무음MP4/atlas/normal/metadata 연결. 세부프롬프트38건과 파이프라인/카메라·장비 수정 영수증 포함. 외부 유료API 호출0, 내장imagegen 비용/모델·잔액은 도구에 노출되지 않아 금액0으로 단정하지 않는다.

다음: 사용자 검토 후 승인된 후보만 상태소스 어댑터와 별도 Player에 연결하고 실제 조명·접지·밀집전투 가독성 및 전사/드루이드와 같은 카메라로 재작업한다. 이번 산출물을 Desktop 설치게임의 자동교체·통합 완료로 보고하지 않는다.
Unity 반영: 대기(사용자 승인 전 채택0).
