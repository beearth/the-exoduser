# 지옥의 틈 — 두 규모의 이동 가능한 맵 후보

기준: 2026-10-05 KST 사용자 최신 지시. 상태: **ISOLATED_CANDIDATE_NOT_ADOPTED / VISUAL VERDICT: RETOUCH**. 현재 미리보기 기본 화면은 새 `interspace` 원화·보행 후보이며 최초 `chapter/stage` 후보는 전환 버튼으로 보존한다.

## 확정 범위와 후보의 경계

지옥의 틈은 **모든 장 사이와 스테이지 사이**에 있다. 최하층에서 위로 탈출하는 여정 중, 아직 괴물이 되지 않았으나 변형 중인 망자들이 머물거나 다음 상승을 준비한다. 첫 장간 틈은 썩은 숲 전체 완료 뒤 벌레굴로 올라가기 전에 둔다. 물건을 맡기거나 위층의 누군가를 구해 달라는 주민 이야기는 사용자 확정 방향이다.

장간 큰 거점(`chapter`)과 스테이지간 작은 쉼터(`stage`)의 규모 구분은 이번 제작 제안이다. 두 개의 **반복 배치용 원형**을 만든 것이며, 각 경계의 고유 지형·주민·다음 목적은 후속 제작한다. 기존 7장·35필드 배정이나 CH1-1 완료 판정을 바꾸지 않는다. 부패의 현실 시간 타이머·자동 사망·NPC 소멸은 구현하지 않았다.

## 최신 외형 지시와 최초 후보의 이력

사용자 최신 지시: **건물 마을이 아니라 사람들이 머무는 기묘한 이공간**. 오리와 ‘위키드’를 예로 든 빛·깊이·회화적 재질·맵 완성도 요구를 적용한다. 아래 두 이동 후보의 천막·갑각·좌표·검증은 최초 제작 이력이며 최신 외형의 완료 주장으로 사용하지 않는다. 원화 생성과 새 지형 검수는 별도 기록한다.

## 최초 두 후보의 산출물과 실행

| 산출물 | 역할 |
|---|---|
| `tools/hell-rift-map.html` | 별도 미리보기. 장/스테이지 두 후보 전환, 전체 보기/걸어보기, 방향키·WASD·화면 버튼·클릭 경로 이동 |
| `tools/build_hell_rift_map.py` | 기존 에셋을 합성하고 이미지·보행 데이터·출처 SHA를 생성하는 빌더 |
| `assets/map/hell_rift/candidate_20261005/chapter-master.png` | 큰 거점 2048×2048 RGB |
| `assets/map/hell_rift/candidate_20261005/stage-master.png` | 작은 쉼터 2048×2048 RGB |
| 같은 폴더 `layout.json` / `layout.js` | 200×200 보행 RLE·POI·충돌 footprint·지역·출처. JS는 file://에서 fetch 없이 읽기 위한 표현 |

HTML을 브라우저에서 직접 열어 사용한다. 새 게임 서버·실게임 세션·빌드가 필요하지 않다. 빌더 의존성은 기존 bundled Python의 Pillow/numpy이며 새 설치는 하지 않았다.

`genFromTemplate`는 **미리보기 안의 독립 RLE 해석 어댑터**다. 본편 동명의 함수와 stage 런타임에 연결한 것이 아니다. `genGauntlet` 사용은 없다. `game.html`, 생산 템플릿, 사용자 세이브, 기존 NPC 명단과 원본 이미지는 변경하지 않았다. 미리보기에서 다음 맵 전환·실제 주민 캐릭터·대화·상점·보상·퀘스트·저장·부활·화톳불 보호는 미연결이다. 주민은 위치 표식으로만 보인다.

## 공간·이동 계약

| 항목 | 후보의 실제 값 |
|---|---|
| 격자 / T / 월드 | 200×200 / 40 / 8000×8000. 본편에 채택한 값은 아님 |
| 시작 / 출구 tile | (100,179) / (100,16). 이동 대상은 타일 중앙 +0.5 |
| 보행 속도 / dt 상한 | 8 tile/s / 0.05s |
| 충돌 여유 / 이동 substep | 축 방향 ±0.4 tile 검사 / 최대 0.2 tile |
| 클릭 이동 | 4방향 BFS, 실제 연속 이동. 순간이동 없음 |
| 중앙 균열 | 비보행 polygon. 양측 우회와 북측 합류 |
| 전투 / 저장 | `spawns=[]`, `hazards=[]`, `saveEnabled=false`, `productionIntegrated=false` |
| 소품 배치 | 수작업 지정. 랜덤 scatter 없음 |

## 지역 설계

### 장 사이 큰 거점

| 지역 | 역할 | anchor(tile) | 형태·밀도 | 진행 방향 | 랜드마크 | 바닥 정체성 | 전이 |
|---|---|---|---|---|---|---|---|
| 남쪽 진입 | 하층 도착 | [100, 177] | 압축 진입 / 낮음 | 북서 | 하층의 턱 | 마른 흙 | 입장→야영 |
| 멈춘 자의 야영지 | 대화·양도 후보 | [59, 150] | 서쪽 주머니 / 높음 | 북동 | 야영 천막 | 밟힌 흙 | 도착→광장 |
| 잔불 광장 | 정비·휴식 | [104, 140] | 넓은 비대칭 여백 / 낮음 | 북 | 잔불 화로 | 회갈색 흙 | 야영→갈림 |
| 골문 아래 쉼터 | 주민·정비 후보 | [61, 119] | 서측 테라스 / 중간 | 북동 | 낡은 골문 | 재 섞인 흙 | 광장→서측 우회 |
| 부탁을 맡기는 자리 | 구출 부탁 후보 | [144, 133] | 동측 포켓 / 중간 | 북서 | 준비 중인 야영지 | 짙은 흙 | 광장→동측 우회 |
| 깊은 틈 | 주요 랜드마크·비보행 | [97, 85] | 비대칭 균열 / 비보행 | 양측 우회 | 심연 | 깊은 푸른 그림자 | 남측 갈림→북측 합류 |
| 상승 준비의 턱 | 다음 목적 확인 | [104, 49] | 합류와 상승 / 낮음 | 북 | 상층의 문 | 차가운 회갈색 | 우회→출발 |
| 북쪽 상승문 | 다음 지역 출발 후보 | [100, 16] | 압축 출구 / 중간 | 북 | 갑각 문틀 | 상층 오염 | 틈→다음 지역 |

모든 지역의 전투 기능은 휴식 후보이며 적 스폰은 없다.

### 스테이지 사이 작은 쉼터

| 지역 | 역할 | anchor(tile) | 형태·밀도 | 진행 방향 | 랜드마크 | 바닥 정체성 | 전이 |
|---|---|---|---|---|---|---|---|
| 남쪽 진입 | 이전 스테이지 도착 | [100, 179] | 압축 진입 / 낮음 | 북서 | 하층의 턱 | 마른 흙 | 입장→쉼터 |
| 작은 야영지 | 잠시 정비 | [68, 137] | 서측 주머니 / 중간 | 북동 | 천막 | 밟힌 흙 | 도착→잔불 |
| 잔불 | 휴식 후보 | [107, 142] | 열린 여백 / 낮음 | 북 | 화로 | 회갈색 흙 | 야영→갈림 |
| 작은 틈 | 비보행 랜드마크 | [96, 93] | 작은 심연 / 비보행 | 양측 우회 | 균열 | 깊은 그림자 | 갈림→합류 |
| 출발 준비 | 다음 스테이지 목적 | [100, 55] | 열린 합류 / 낮음 | 북 | 상층의 턱 | 차가운 흙 | 합류→문 |
| 북쪽 문 | 다음 스테이지 출발 후보 | [100, 16] | 압축 출구 / 중간 | 북 | 갑각 문틀 | 상층 오염 | 틈→다음 스테이지 |

모든 지역의 전투 기능은 휴식 후보이며 적 스폰은 없다.

## 주민·정비 자리 좌표

| 후보 | id | 이름 | tile | 현재 기능 |
|---|---|---|---|---|
| chapter | gift | 물건을 맡기는 망자 | (59,150) | 미리보기 경로 이동·표식 |
| chapter | request | 구출을 부탁하는 망자 | (144,133) | 미리보기 경로 이동·표식 |
| chapter | rest | 잔불 — 기능 미연결 | (104,140) | 미리보기 경로 이동·표식 |
| chapter | prepare | 정비 자리 — 기능 미연결 | (61,119) | 미리보기 경로 이동·표식 |
| chapter | exit | 상승문 — 전환 미연결 | (100,16) | 미리보기 경로 이동·표식 |
| stage | rest | 잔불 — 기능 미연결 | (107,142) | 미리보기 경로 이동·표식 |
| stage | prepare | 작은 야영지 | (68,137) | 미리보기 경로 이동·표식 |
| stage | exit | 상승문 — 전환 미연결 | (100,16) | 미리보기 경로 이동·표식 |

## 기술 검증

| 후보 | 보행 타일 | 시작에서 도달한 타일 | POI | 출구 최단경로 | 보행 데이터 SHA-256 |
|---|---|---|---|---|---|
| chapter | 13731 | 13731 | 전부 도달 | 195 tile | `0e8367ee491e432926a42f058a56d4a7929319ef1267193326b5cdf7b7990a02` |
| stage | 9780 | 9780 | 전부 도달 | 179 tile | `c494a3a72b13a443681725cfd00144a08a49819c24b2abb3ca28dfc16b7ab296` |

전체 40000 tile RLE 길이·nav SHA·기존 원본 11개 SHA 일치를 확인했다. 플레이어 충돌 여유를 포함한 경로 검사에서 모든 보행 타일과 POI·출구에 도달했다. 두 후보 모두 남쪽 시작부터 북쪽 출구까지 실제 프레임 진행으로 클릭 경로 종주를 확인했다. 큰 거점 195 tile, 작은 쉼터 179 tile이며 최종 플레이어 위치는 모두 (100.5,16.5)다. 격리 Chrome에서 이미지 로딩·variant 전환·방향키 실제 이동·클릭 경로 실제 이동·중앙 균열 클릭 거부·390×844 화면 버튼 이동을 확인했다. pageerror=0, 이미지 오류=0. 휴대폰은 브라우저 크기 모사이며 사용자의 실제 휴대폰 인수는 아니다.

검수 영수증: `/Users/fordeargamers/.codex/visualizations/hell-rift-qa-20261005/`의 `route-qa.json`, `browser-qa.json`, `continuous-walk-qa.json`, `final-browser-qa.json`, overview/mobile 캡처와 8점 camera sheet. 이 증거를 본편 전투·종주·NPC·청취·성능 인수로 계산하지 않는다.

## 최초 두 후보의 MAP PRODUCTION REPORT

STAGE: 지옥의 틈 독립 후보 chapter/stage. 기존 stage LOCK·생산 후보 대체 없음.

MASTER
- silhouette: 남쪽 압축 진입, 비대칭 열린 테라스, 균열 양측 우회, 북쪽 상승문.
- regions: chapter 8 / stage 6. 위 지역 표가 정본.
- main route: 남쪽→잔불/야영→균열 우회→상승 준비→북쪽 문.
- side spaces: 물건 양도·구출 부탁 후보 자리. 작은 쉼터는 정비·잔불 중심.

OUTER MASS
- LEFT: 갑각 능선·깊이 아치·남서 절벽을 큰 덩어리로 조합.
- RIGHT: 능선·아치·남동 절벽의 비대칭 배치.
- TOP: 북쪽 문 양측 큰 덩어리.
- SOUTH: 진입 턱 전경. 보행면과 돌출 전경의 시각 구분 추가 손질 필요.
- major holes: 중앙 심연은 의도한 비보행 공간. 외곽 빈 깊이는 배경 재질로 연결.

LARGE
- source assets: 아래 출처 표의 기존 11개, 원본 수정 없음.
- composites: chapter/stage 각각 하나의 2048² master. 외곽·바닥·랜드마크 사전 합성.
- overlap: 배경/중경/전경 조합, 접지 그림자. 외곽 시각 돌출물의 실제 footprint 정밀화는 미완료.
- repeated silhouette: 크롭·방향·크기 변형. 두 천막의 반복 인상은 RETOUCH 항목.

MEDIUM
- connections: 연속 바닥 어깨와 재질·AO로 연결.
- remaining holes: 입구 전경의 접지·실루엣 연결 추가 보강 필요. 중앙 균열은 결손이 아닌 의도된 공간.

GROUND
- shadow: 큰 구조물 접지 그림자와 외곽 AO.
- contamination: 저채도 흙·생체 재질의 두 스케일 합성.
- structure integration: 공통 월드 정렬. 균열 단면의 입체 깊이·바닥 반복 추가 손질 필요.

PLAYABLE
- main arenas: 전투 아레나 없음, 휴식·대화 후보 공간.
- travel space: 중앙 심연 양측 넓은 우회와 북측 합류.
- breathing space: 잔불 광장과 동서 주민 포켓.
- threat space: 비보행 심연을 시각적 위험으로 표현, 피해/낙하 규칙 미구현.
- combat readability: 전투 스폰 없음. 본편 캐릭터/VFX/카메라 전투 인수 미실시.

LANDMARK
- primary: 비대칭 중앙 균열.
- secondary: 북쪽 갑각 문틀·잔불.
- tertiary: 야영지·골문·우물·뼈 잔해.

CAMERA QA
- START (100,177): 남쪽 턱과 올라갈 보행면. 전경 겹침 보강 필요.
- EARLY (65,145): 큰 거점 야영지. 작은 쉼터에서는 공통 anchor 비교만 수행.
- ARENA (104,140): 잔불과 휴식 여백. 실제 전투 아레나라는 의미는 아님.
- SIDE L (61,119): 골문 아래 포켓.
- SIDE R (144,133): 구출 부탁 자리, 경계 안쪽으로 수정 후 접근 가능.
- LANDMARK (97,85): 중앙 균열. 어두운 평면처럼 보이는 단면 RETOUCH.
- LATE (104,49): 합류와 북쪽 접근.
- EXIT (100,16): 북쪽 문. 실제 장 전환 미연결.
- 위 8점은 동일 viewport 범위의 정적 crop 시각 확인. 실제 본편 카메라 종주 인수가 아니다.

TECH QA
- route: 양 후보 모든 보행 타일·POI·출구 연결. 위 정량 표 참조.
- collision: 독립 격자/소품 footprint/±0.4 여유 검사, 균열 클릭 이동 거부.
- pageerror: 격리 미리보기 0.
- 404: file:// 직접 로딩, HTTP 요청 없음. 이미지 load 오류 0.
- seam: 작은 타일 seam 검증으로 판정하지 않음. master 재질 반복·외곽 접합 RETOUCH.
- loading: 두 2048² 이미지 ready 확인, 외부 서비스·유료 생성 없음.
- performance: 본편 FPS·메모리·오디오 성능 미인수.

FILES
- stage-owned: 빌더, HTML, candidate 폴더, 이 문서. 기획서·맵 인덱스에 후보 링크 보강.
- concurrent touched: 기존 기획서/인덱스 원문 보존, 현재 범위 및 새 후보 참고만 반영.
- unrelated touched: 없음. game.html·보호 2_3·원본 에셋·사용자 세이브 변경 없음.

GIT
- staged: 완료 후보 소유 8경로만 체크포인트. 타인 staging 제외.
- commit: 첫 후보의 미채택 보존 체크포인트. 코드2·이미지/데이터4·이 문서1.
- push: 같은 소유 범위 원격 보존 후 정확 ref SHA 영수증 대조.
- deploy: 없음. 원격 보존을 생산 채택이나 출시로 계산하지 않음.

VISUAL VERDICT: **RETOUCH**

독립 이동 검증과 맵 이미지 제작은 완료했다. 중앙 균열 입체감, 외곽 돌출물과 보행 경계 정합성, 천막 반복 인상, 본편 카메라·캐릭터 비율을 보강해야 생산 시각 PASS로 바꿀 수 있다. 실제 NPC·장/스테이지 전환·저장 연동은 별도 구현 범위다.

## 사용한 기존 에셋

| 역할 key | 경로 | 원본 SHA-256 |
|---|---|---|
| soil | `assets/map/ch1/ground_dark_soil.png` | `9d6c7d93aeffe958f8e98791a0c2a42fefeb39a7b34052ddf93db164fde078e9` |
| nest_soil | `assets/map/ch2/ground.png` | `a211c411aa851002412417b691c3a62cab5a5895024f180fd0fa9ada5513d486` |
| ridge | `assets/map/ch2/mega/wall_ridge_l.png` | `3a422fb44ac252462c6cceb0bee00885e7f776a512685c29dad419aaf484491d` |
| cliff | `assets/map/ch2/mega/slime_cliff.png` | `31ec354639589938631a1be7ab5e212e6883240126e59d38b64a3b25a46b5515` |
| depth | `assets/map/ch2/mega/wall_skin_depth_arch.png` | `d43bce8079942f60c3e9f013811e2687a8eb67bedb8afb91e069e476a241c396` |
| camp | `assets/map/ch1/collision/prop_camp.png` | `d9ecd4d4b1bf8f79b37f21813f109f2360b56c5b57e9319ad3525cfebda21ebf` |
| arch | `assets/map/ch1/collision/mega_chapel.png` | `4ae85d19b036c63651d40138b1c04a2b4ef7927c9ccb5f8fd5594aa074220131` |
| bones | `assets/map/ch1/collision/mega_ribs.png` | `9176b30d56a3d8fd714295ba5fdeb2b19e85464385ac7ad7c4dac51134875cdc` |
| well | `assets/map/ch1/collision/prop_well.png` | `c49984d9e3b5f94b2c7d50ad549ad204b5cb4c5aa3d77d22ec01d7beba25abe5` |
| brazier | `assets/map/ch4/collision/prop_brazier.png` | `6334b66893d9efa30f8861cd4f69c1683702d8bf08943ad75fc6eae0108304a7` |
| exit | `assets/map/ch2/mega/exit_organic_frame.png` | `bdb33fbb965ce22ecaf0f4057bbf88dec47be1725e87c8cfbd77686e01fb7e80` |

제작 순서는 `EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md`의 MASTER→OUTER→MEDIUM→GROUND→PLAYABLE→LANDMARK→DETAIL→CAMERA→TECH를 적용했다. 원본·기존 생산 맵을 대체하지 않은 후보 참고 문서이며 사용자 최신 지시와 stage별 LOCK/SSOT가 우선한다.


## 최신 interspace 원화·보행 후보

### 생성과 실제 파일

| 항목 | 실제 값·경계 |
|---|---|
| 서비스·모델 | MagicLight Toolbox / Seedream 5.0 Pro. 기존 Chrome 로그인에서 생성. 신규 인증·설치·결제 없음 |
| 생성 경로 | Toolbox UI의 Image→Create. 직접 API 호출은 이번 연결에서 제공되지 않아 실행하지 않았다. API 실행 완료로 보고하지 않음 |
| 작업 ID | 7512746338260033536, 1:1 한 장. Create 표시 비용 100포인트, 표시 잔액 58,540은 조회 시점 값이며 계정 전체 증감을 작업 비용으로 환산하지 않음 |
| 원화 | assets/map/hell_rift/interspace_20261005/hell-rift-painterly-v2.png / 1920×1920 RGB / 6,892,248 bytes |
| 원화 SHA256 | a3d95a005924692626321cedf384d1e4e90282ba990d9e19e86a3aa73a1563d4 |
| 원화 변경 | 다운로드 원본을 그대로 복사. 이미지 편집·재합성·기존 원화 덮어쓰기 없음 |
| 데이터 | 같은 폴더 layout.json/layout.js. 200×200 RLE, 총 40000 타일, 보행 4107, T40, 화면 대응 월드 8000×8000 |
| 시작·출구 | (100,193)→(100,43), 이동 시 +0.5. 최초 두 후보의 (100,179)→(100,16)과 별개이며 생산 LOCK 변경 없음 |
| 보행 SHA256 | 52bd839614a9d1adad767d472357438c1d58a338ac52639705e9b8ad20a3bbdb |
| 이미지 소비 | tools/hell-rift-map.html 기본 interspace. assetRoot=../assets/map/hell_rift/interspace_20261005/. 로딩 실패 표시·예전 후보 전환 유지 |
| 빌더 | tools/build_hell_rift_map.py --interspace는 원본 SHA를 확인하고 보행 데이터만 생성. 인자 없는 기존 동작은 최초 후보 재생성용. 새 PNG를 생성하거나 편집하지 않음 |
| 이동 | 기존 8tile/s·dt최대0.05s·substep최대0.2tile·축방향 ±0.4tile·4방향 BFS 계약 동일 |
| 런타임 경계 | 원화 표면을 따른 보수적 2D 화면 경로. 높이·계단 물리·낙하·가림 순서·생체 애니메이션 미구현. 그림의 사람은 구워진 배경이며 NPC 캐릭터 구현 아님 |
| 본편 연결 | productionIntegrated=false, saveEnabled=false, spawns=[]·hazards=[]. 게임 코드·사용자 세이브·현재 앱·전투 규칙 변경 없음 |

실제 생성 프롬프트(482자):

```text
Painterly dark fantasy ARPG map, elevated top-down square. Hell Rift: an impossible interspace between rotten forest and insect abyss. Asymmetric suspended stone and organic ledges around a deep luminous fissure; wide readable paths enter bottom, branch both sides, reunite at upper ascent. Tiny exhausted human souls sit, wait or prepare by isolated embers. Layered blue mist, ochre rim light, tactile brushwork, strong depth. No village, houses, tents, UI, text or repeated props.
```

### 지역·관심 지점

| 지역·역할 | anchor(tile) | 형태·밀도·진행 | 랜드마크·바닥·전이 |
|---|---|---|---|
| 하층의 입구 / 도착 | 100,193 | 넓은 진입·낮음·북서/북동 | 갈라지는 턱·빛이 닿는 흙/돌·입구→양측 |
| 멈춘 망자의 턱 / 양도 이야기 후보 | 39,122 | 서측 굴곡·중간·북 | 잔불과 머무는 망자·갈라진 돌·서측→북쪽 |
| 부탁을 품은 턱 / 구출 이야기 후보 | 145,116 | 동측 생체 돌출·중간·북서 | 몸을 낮춘 망자·생체/돌·동측→북쪽 |
| 깊은 균열 / 비보행 주요 랜드마크 | 102,102 | 세로 심연·비보행·양측 우회 | 심연의 빛·청회색 안개·두 길 사이 |
| 상승 준비 / 다음 목적 | 137,70 | 유기적 돌턱·낮음·북서 | 상층을 보는 자리·갑각/돌·동측→합류 |
| 북쪽 상승로 / 출발 후보 | 100,43 | 두 길 합류/계단·낮음·북 | 밝은 균열 너머 계단·회갈색 돌·틈→다음 구간 |

| POI id | 표시 이름 | tile | 실제 기능 |
|---|---|---|---|
| gift | 멈춘 망자의 자리 | 39,122 | 접근 후보, 양도 미연결 |
| request | 위층을 바라보는 망자 | 145,116 | 접근 후보, 구출 미연결 |
| rest | 남쪽 잔불 | 79,170 | 접근 후보, 화톳불 미연결 |
| prepare | 상승 전 머무는 턱 | 137,70 | 접근 후보, 정비 미연결 |
| exit | 북쪽 상승로 — 전환 미연결 | 100,43 | 접근 후보, 장 전환 미연결 |

### interspace MAP PRODUCTION REPORT

STAGE: 지옥의 틈 첫 이공간 원화 후보. 장/스테이지 모든 경계의 완성본은 아님.

MASTER
- silhouette: 비대칭 떠 있는 두 지형과 세로 심연, 남쪽 진입·북쪽 합류.
- regions: 위 6구역.
- main route: 하층→동서 두 길→북쪽 상승로.
- side spaces: 멈춘 자·부탁한 자·잔불·상승 준비의 서로 다른 턱.

OUTER MASS
- LEFT: 부서진 돌·죽은 나무의 수직 질량.
- RIGHT: 굽은 생체·갑각 덩어리, 좌측과 다른 실루엣.
- TOP: 큰 두 벽 사이의 빛과 계단.
- SOUTH: 넓은 진입면과 전경 돌턱.
- major holes: 중앙 심연과 주변 안개는 의도된 빈 깊이.

LARGE
- source assets: 새 MagicLight 원화 한 장.
- composites: 원본 한 장 그대로, 추가 소품 합성 없음.
- overlap: 원화의 전경/중경/후경, 실시간 가림은 미구현.
- repeated silhouette: 천막·건물 반복 없음.

MEDIUM
- connections: 돌턱·계단·생체 뿌리로 이어진 각 측 경로.
- remaining holes: 경사·단면과 실제 보행 마스크의 세부 정합성 미인수.

GROUND
- shadow: 원화에 구워진 접지와 명암.
- contamination: 좌측 부패한 숲 잔재·우측 유기적 벌레굴 재질.
- structure integration: 통일된 그림 재질. 동적 조명·높이 구현 없음.

PLAYABLE
- main arenas: 전투 공간 없음, 체류·상승 후보.
- travel space: 원화 표면을 따라 좁게 지정한 보수적 화면 경로.
- breathing space: 남쪽 진입면과 양측 여러 턱.
- threat space: 중앙 비보행 균열, 낙하 피해 규칙 미구현.
- combat readability: 실전 캐릭터·적·VFX·카메라 검수 미실시.

LANDMARK
- primary: 깊은 세로 균열.
- secondary: 북쪽 계단과 빛.
- tertiary: 서로 다른 자세로 머무는 망자와 잔불.

CAMERA QA
- START (100,193): 전체 원화와 독립 초기 화면 검토.
- EARLY (79,170): 전체 원화에서 진입 후 좌측 굴곡 확인, 별도 실게임 카메라 미인수.
- ARENA (39,122): 서측 체류 턱. 전투 아레나 의미 없음.
- SIDE L (47,86): 원화에서 서측 연결 확인, 확대 경계 정밀 검수 잔여.
- SIDE R (145,116): 원화에서 생체 돌턱과 머무는 사람 확인, 정밀 경계 잔여.
- LANDMARK (102,102): 깊이·안개 확인, 비보행 중앙.
- LATE (137,70): 상층 재질과 북쪽 합류 확인, 실시간 높이 없음.
- EXIT (100,43): 독립 미리보기 종주 결과로 검토. 본편 전환 없음.

TECH QA
- route: 전체 보행 연결·POI·연속 종주 검사 결과는 아래 검수 영수증을 따른다.
- collision: 2D 경로 마스크. 시각 경계·높이·계단의 생산 인수 미완료.
- pageerror / 404 / loading: 격리 파일 미리보기 결과는 아래 기록.
- seam: 원화 한 장이므로 배경 청크 접합 없음. 실제 게임 청크 미검수.
- performance: 실제 게임 FPS·군중·메모리 인수 없음.

FILES
- stage-owned: 새 원화·layout.json/js, 빌더·독립 미리보기, 해당 보고서·기획서·인덱스·CHANGELOG_SYNC.
- concurrent touched: 기존 타인 WIP·감독 파일 미수정.
- unrelated touched: 없음.

GIT
- staged: 이번 완료 소유 9경로만 보존. 기획서의 앞선 원총괄 작성 내용도 함께 보존하며 타인 파일 제외.
- commit: 최신 이공간 후보·정정 기획·코드와 docs 동기화.
- push: 같은 브랜치 보존 후 원격 정확 SHA 대조.
- deploy: 없음.

VISUAL VERDICT: **RETOUCH**

분위기·비대칭 질량·중앙 깊이·천막 반복 제거는 확인했다. 오리나 특정 ‘위키드’ 작품과 같은 완성도를 달성했다고 판정하지 않는다. 실제 게임 카메라에 맞는 투영·인물 비율·보행면 밝기·높이/가림·정밀 충돌은 남았다.

NEXT PASS: 원화의 구조를 게임 카메라 기준으로 검토하고 높이·층 가림·보행면을 실제 엔진 계약에 맞게 분리. 주민 스프라이트·대화·보상·전환·저장을 후속 구현·인수한다.

확대 검수 정정: 첫 화면 경로의 북쪽 목표 (100,23)가 그림의 빈 빛 영역에 놓이는 오류를 발견했다. 원화는 그대로 두고 북쪽 계단 위 (100,43), 상단 합류와 준비 지점 (137,70)으로 경로를 수정했다. 수정 전 검사 영수증은 verification-before-north-correction.json으로 보존한다. 확대 시 원화의 입자·수직 투영 한계도 RETOUCH에 포함한다.

### 수정 후 독립 검수 영수증

전체 보행 4107/도달 4107, 관심 지점 5개 도달·경로 수락, 중앙 (102,102) 클릭 거부, 방향키 실제 이동을 확인했다. 남쪽에서 북쪽 계단 (100.5,43.5)까지 실제 프레임 연속 종주 완료. 새 원화 로딩과 이전 chapter/stage 전환 유지, pageerror=0·이미지 오류=0, 390×844 모바일 크기 가로 넘침=false. 원화·nav SHA를 원본과 대조했다. 높이·낙하·실제 휴대폰·본편 NPC·6단계 플레이·청취 인수는 아니다.

증거: /Users/fordeargamers/.codex/visualizations/hell-rift-interspace-20261005/verification.json 및 interspace-start.png·interspace-exit.png·interspace-mobile.png. 확대 화면에서 북쪽 목표가 계단 위에 있는 것을 확인했다. 시각 판정 RETOUCH 유지.


## 2026-10-05 — 승인 원화의 부분 깊이 레이어와 기존 전사 보행

사용자가 기존 원화의 방향을 좋다고 확인하고, 계곡·낭떠러지의 공간 깊이를 레이어로 쌓아 직접 만들어 보라고 지시했다. 이 절이 독립 미리보기의 최신 상태다. 앞 절의 단일 이미지·점 플레이어 표기는 이전 제작 이력이다. **원화 방향 승인과 생산 시각 인수는 구분한다. VISUAL VERDICT: RETOUCH.** 자동 실행·다른 제작팀 재개 없음.

`tools/hell-rift-depth.js`를 `tools/hell-rift-map.html`에 연결했다. 원본 원화는 무변이며 runtime Canvas 마스크·부분 전경 재그리기·별도 심연 이미지·기존 전사 RGBA를 합성한다. 전체 바닥/절벽의 완전한 투명 분리·가려진 지면 복원·3D 지형·높이 물리·생산 GPU 렌더러 이식은 아직 아니다. 사람들은 여전히 원화에 구워진 배경 인물이며 NPC 구현으로 계산하지 않는다.

### 에셋·생성 출처

| 항목 | 실제 값 |
|---|---|
| 새 후경 | `assets/map/hell_rift/interspace_20261005/hell-rift-abyss-v3.png`, 1920×1920 RGB, 6350749 bytes |
| SHA-256 | `ace0c853cc27cbb4d2b807104273399a1144df77d31b1003e574141fed10f991` |
| 공급자 / 모델 | 기존 로그인된 MagicLight Toolbox / Seedream 5.0 Pro |
| 생성 | 1:1 / 출력 1 / Create 표시 비용 100 points / 작업 `7512750092166275072` |
| 조회 잔액 | 이번 제출 전 표시 58440 points. 최종 잔액 추정으로 기록하지 않음 |
| 참조 업로드 | 로컬 파일 업로드는 브라우저 파일 접근 권한 부족으로 실패. 권한 변경·우회 없음. 별도 후경은 텍스트만으로 신규 생성했으며 원화 참조 업로드 성공으로 보고하지 않음 |
| 생성 경로 | Toolbox UI. 직접 API 호출 미실행. 로그인·설치·결제 없음 |
| 원본 보존 | 승인 원화 SHA `a3d95a005924692626321cedf384d1e4e90282ba990d9e19e86a3aa73a1563d4` 유지. 별도 후경의 다운로드 원본도 보존 |
| 캐릭터 | 기존 `img/exoduser_warrior/{east,south-east,south,south-west,west,north-west,north,north-east}.png` 재사용. 신규 캐릭터 생성·원본 변경 없음 |

제출한 498자 프롬프트:

```text
Game background layer ONLY: painterly bottomless Hell canyon in blue-grey atmospheric mist, distant vertical crags on left and right edges, pale luminous mist column in the middle, faint warm ochre light high at top. Elevated top-down square, dramatic depth with many receding cliff walls, soft distant detail. This is the far background behind suspended foreground paths. No walkways, bridges, stairs, characters, trees, buildings, tents, text, UI. Keep center mostly open mist; no horizon or sky.
```

### 실제 합성·동작 계약

| 순서 / id | 내용·수치·적용 위치 |
|---|---|
| 1 painted-terrain | 승인 원화 전체 200×200 tile 화면 합성. 구워진 지면·절벽 단면·망자 유지 |
| 2 far-abyss-in-fissure | 별도 후경을 중앙 심연 내부에만 합성 α0.38. 원경 시차 walk 모드 `(cameraTile−100)×0.035`, overview는 0. 지면/충돌/전경은 시차 없음 |
| 후경 경계 | runtime mask 200². 다각형 내부 경계 최단거리 d, `v=min(1,d/3)`, alpha=`round(255×v²×(3−2v))`. 경계에서 0으로 감쇠. 후경 scratch canvas1024²에 매 프레임 합성 후 mask 적용. PNG 편집/재저장 없음 |
| 3 contact-shadow | 검정 α0.46 타원, 반경 x0.8/y0.3 tile, 중심 y−0.1 tile |
| 4 existing-warrior | 48×48 RGBA 셀, 출력 7 tile 사각, 발 피벗 y−size×0.88. 이동 프레임 `2+floor(t/110ms)%8`, idle `floor(t/850ms)%2`. 이동거리>0.0001이면 8방향 atan2/π÷4 반올림; 초기 north. 최소 이미지 폭480/높이48 확인. 실패 시 반경max(3px,scale×0.55)의 점 폴백 |
| 5 footline-foreground | 아래 3개 원화 부분 실루엣을 발 기준선 앞/뒤 재그리기. player.y≥foot면 전경 패스 제외. 플레이어 중심 x와 y−[0.8,2,3.5,5] tile 표본 중 다각형 내부가 있으면 α0.38, 아니면1. 전경 제거/충돌 변경 없음 |
| 6 fissure-mist | 중앙 심연 안 6개 radial gradient. 최대 α0.025→가장자리0. x=`100+sin(t/11000+i×1.7)×7`, y=`82+i×14+sin(t/14000+i)×3`, r=`9+i×0.8` tile. 걷는 바닥 전체를 덮는 안개 없음 |
| 화면 설정 | 깊이 레이어 기본 ON, 버튼으로 비교 OFF/ON. 장소 이름 기본 OFF. 이전 chapter/stage 선택 시 기존 배경·점 플레이어 경로 보존 |
| 폴백 | 후경 미로드/실패면 승인 원화 그대로. 전사 방향 이미지 실패면 점 표시. 오류 목록은 깊이 snapshot으로 제공. 자산 전체 준비 전 ready=false이며 이동/기본 지면은 유지 |
| 기존 보행 | grid200²/T40/start100,193/exit100,43/속도8tile/s/dt≤0.05/축 여유±0.4/substep≤0.2/BFS4방향·4107보행·nav SHA 무변 |

중앙 심연 polygon(tile):
```json
[[103,61],[106,69],[102,74],[110,81],[111,91],[115,101],[113,111],[111,120],[111,131],[106,143],[97,157],[91,163],[86,163],[83,157],[74,150],[77,141],[79,137],[76,130],[81,122],[79,116],[85,108],[82,104],[85,100],[88,91],[85,85],[90,80],[94,73],[102,65]]
```

| 전경 id | foot(tile y) | polygon(tile) |
|---|---:|---|
| west-root | 134 | [[66,116],[65,121],[62,123],[63,127],[59,129],[57,132],[53,133],[56,134],[63,132],[66,128],[68,123],[69,121]] |
| east-horn | 108 | [[146,83],[149,83],[147,89],[147,94],[150,99],[149,105],[146,108],[141,108],[142,104],[143,100],[143,95]] |
| south-root | 173 | [[123,157],[124,162],[128,165],[131,169],[130,172],[126,173],[124,169],[121,167],[118,165],[119,161]] |

### MAP PRODUCTION REPORT — 레이어 슬라이스

STAGE: 지옥의 틈 독립 interspace 후보. 본편 stage/LOCK 대체 없음.

MASTER
- silhouette: 승인 원화의 양측 비대칭 절벽/중앙 계곡/북측 계단 보존.
- regions: 기존 6지역과 5POI 보존; 위 이전 원화 후보 표가 좌표 정본.
- main route: 남쪽→두 측면 경로→상단 합류→계단. 보행 데이터 무변.
- side spaces: 망자 체류·잔불·준비 자리; 실제 기능 미연결.

OUTER MASS
- LEFT: 썩은 숲 돌턱과 원화의 수직 단면 보존.
- RIGHT: 유기적 갑각과 돌턱 보존, east-horn 부분 전경.
- TOP: 원화 북쪽 계단과 빛 보존.
- SOUTH: 원화 진입면과 south-root 부분 전경.
- major holes: 심연에 별도 먼 절벽/안개 층. 보행 타일과 polygon 중심 겹침 0.

LARGE
- source assets: 승인 원화+새 심연 배경+기존 전사 8방향 PNG.
- composites: runtime Canvas 합성; 승인 PNG 수정0.
- overlap: 원경 시차와 3부분 전경/전사 교차. 완전한 환경 clean plate 제작은 잔여.
- repeated silhouette: 천막 추가0, 원화의 비대칭 형태 유지.

MEDIUM
- connections: 기존 화면 보행 경로 그대로.
- remaining holes: 전체 절벽의 투명 분리·가려진 지면 복원·지역별 별도 전경 필요.

GROUND
- shadow: 전사 발밑 접지 타원 추가.
- contamination: 원화의 부패/갑각 재질 보존.
- structure integration: 원본 좌표의 부분 실루엣 사용, 높이 물리 미구현.

PLAYABLE
- main arenas: 휴식 후보, 전투 없음.
- travel space: 기존 경로에서 기존 전사로 연속 이동.
- breathing space: 원화 테라스와 남쪽 진입면 보존.
- threat space: 중앙 비보행 계곡, 낙하 피해 없음.
- combat readability: 실게임 적/VFX/청취 인수 미실시. 전사 Pixel RGBA와 회화 원화의 재질 조화 잔여.

LANDMARK
- primary: 중앙 계곡과 겹친 안개 깊이.
- secondary: 북쪽 계단과 상층 빛.
- tertiary: 기존 잔불/원화 인물, 실제 NPC 아님.

CAMERA QA
- START: 독립 확대 남쪽 진입/발밑 접지/전사 크기.
- EARLY: 연속 이동 y170 부근 남동 연결과 south-root.
- ARENA: 휴식 후보로 전투 아레나 검수 대상 없음.
- SIDE L: 전체 보기 좌측 실루엣 확인; 서측 연속 플레이 세부 인수 잔여.
- SIDE R: 연속 이동 y145/y120/y100 부근 원화 지형과 전사.
- LANDMARK: 전체 보기 심연; 1차의 다각형 경계 FAIL을 감쇠 마스크로 보정.
- LATE: 연속 이동 y80/y60 부근 상측 연결.
- EXIT: 전사 최종100.5,43.5 계단. 본편 전환 없음.

TECH QA
- route: 기존 nav/4107도달은 이전 영수증. 이번 독립 종주·키보드·OFF/ON·가림 검증은 새 검수 영수증을 따른다.
- collision: RLE 무변, 중앙 계곡 클릭 거부. 높이 물리 없음.
- pageerror: 격리 브라우저 기록 확인; 본편 인수로 계산하지 않음.
- 404: file:// 정적 이미지 검사; 서버 HTTP 상태 검수 아님.
- seam: 다각형 hard edge를 3tile 경계 감쇠로 수정. 부분 전경은 원본 좌표 유지.
- loading: 실제 PNG·8방향 전사 로딩과 후경 실패 원화 폴백 검수.
- performance: 1024² 합성 canvas1/200² mask1. 독립 Chrome 검수만, 실게임 FPS/메모리/밀집 전투 미인수.

FILES
- stage-owned: preview HTML, depth JS, 새 후경 PNG, 이 보고서/기획서/맵 인덱스/CHANGELOG_SYNC.
- concurrent touched: 다른 팀/감독/공용게임/세이브 변경0.
- unrelated touched: 없음.

GIT
- staged: 완료 소유 위7경로만.
- commit: 코드+에셋+관련 docs를 함께 보존.
- push: 원격 동일 SHA 검증 후 로컬 검수 영수증에 기록.
- deploy: 미실행.

VISUAL VERDICT: RETOUCH.
NEXT PASS: 전체 환경 clean plate/투명층, 원화 인물과 실제 캐릭터 스케일·재질, 생산 카메라·GPU·장 전환 인수.

검수 영수증은 `/Users/fordeargamers/.codex/visualizations/hell-rift-layers-20261005/`에 보존한다. 원화 방향 승인, 독립 레이어 구현, 실제 본편 완성 판정을 서로 대체하지 않는다.

### 이번 레이어 후보의 검수 결과

- 격리 Chrome file://: 새 후경과 기존 전사8방향 로딩, pageerror0/asset오류0. 중앙 심연 클릭 거부. 기존 전사로 남쪽100.5,193.5에서 키보드 북향 이동 후 연속 경로 종주, 북쪽100.5,43.5 도착.
- 이동 중 y170/145/120/100/80/60 부근6화면과 시작/출구 확대 확인. 후경 다각형 hard edge는 수정 전 이력이며 현재 3tile 감쇠 화면으로 재검수.
- 출구에서145.5,107.5로 실제 이동해 east-horn 뒤 가림 확인. fadedOverlaps1, 동일 위치 깊이 ON/OFF 화면 비교. 전경이 전사를 지우는 대신 부분 감쇠해 식별 유지.
- 중앙 심연 polygon에 속하는 보행 타일 중심0. 원화 SHA/보행RLE 보존. 이전chapter 선택 동작 유지. 390×844 브라우저 모사에서 가로 넘침0, 실제 휴대폰 인수 아님.
- 후경 요청을 실패시킨 별도 격리 페이지에서 abyss오류 기록/원화 폴백/기본 보행 유지 확인. ready=false는 자산 완전 준비 실패 표시이며 지형 제거가 아니다.
- 모든 결과는 verification.json, overview.png, start.png, route-*.png, exit.png, occlusion-on.png, occlusion-off.png, mobile.png에 보존.
- VISUAL VERDICT RETOUCH: 환경 전체 분리·production GPU·캐릭터 재질 조화·NPC·실제 높이·장 전환·실게임 성능/청취 미인수.


## 최신 사용자 후속 — 맵 에디터 우선 제작 (2026-10-05 KST)

사용자 최신 직접 지시로 기존 MAP팀 수동 제작 한 건을 재개하고, 곧이어 맵 에디터를 우선하도록 변경했다. 지옥의 틈 완성보다 **승인 원화·레이어·보행 경계를 편집하고 전사로 시험할 수 있는 맵 에디터**가 먼저다. 자동화·다른 팀·새 세션의 재개는 승인하지 않았다.

이 보고서의 기존 원화·후경·부분 레이어·nav와 검수 증거는 변경하지 않았다. MAP은 기존 에디터 재사용을 조사한 뒤 독립 소유 후보를 작성하고 원총괄에 연결 위치를 인계한다. 기능·경계와 수동 한 건의 소유는 [콘텐츠 계획 §21](../0마스터플랜/EXODUSER_GAMEPLAY_CONTENT_PLAN_20261004.md)을 따른다. 원총괄이 오더담당에게 요청한 상태이며 에디터 완료·본편 적용으로 계산하지 않는다. 원화 미리보기의 VISUAL VERDICT는 RETOUCH 그대로다.


### 에디터 품질 요구 보충 — 2026-10-05 KST

사용자 Unity 수준 맵 제작 요구를 [콘텐츠 계획 §22](../0마스터플랜/EXODUSER_GAMEPLAY_CONTENT_PLAN_20261004.md)에 기록했다. 이 지옥의 틈은 그 에디터에서 실제 편집·프로젝트 왕복·전사 종주할 첫 검수 씬이다. 기존 원화/nav/부분 깊이의 데이터와 VISUAL RETOUCH는 그대로이며, 원화 하나에서 완전한 레이어/높이를 자동 추정했다는 주장이 아니다. 본편 채택·native/청취 인수는 별도다.


외부 맵 에셋 요구도 같은 에디터에 추가됐다. [콘텐츠 계획 §23](../0마스터플랜/EXODUSER_GAMEPLAY_CONTENT_PLAN_20261004.md)의 import→팔레트→배치→왕복 저장을 현재 기존 자산으로 검수한다. Unity 모델/프리팹과 현재 회화 원화의 렌더·사용권·변환 경계를 구분하며 원화/nav/본편 후보를 임의 교체하지 않는다.


### MAP PRODUCTION REPORT — 에디터 소스 인수 후속

- TARGET: 기존 MAP 소유 Hell Rift editor 후보 한 파일, 원화/생산맵 수정 없음.
- CHANGE: Unity 씬 제작·외부자산 요구 기록과 후보 소스 진단. 원총괄 후보 코드 변경 없음.
- TECH QA: 구문 컴파일 PASS. 실제 doImport의 부분 JSON 실패 시 현재 씬 보존 FAIL. Undo/렌더 순서/DOM 안전은 소스 보완 항목.
- CAMERA/PLAY/ASSET QA: 브라우저 직접 선택 미해소. 새 화면/임포터/프로젝트 왕복/종주 증거 없음.
- EVIDENCE: 콘텐츠 계획 §22~23 인수 현황 및 외부 source-diagnostic.json. 대상 SHA256 795818616e80a81cfa8b21438cdce0c8397f84ab41b2727efad68d417ba5c03b.
- NEXT PASS: MAP 기존 소유 후보 수정, Unity 씬·외부자산 보완 실제 수신/작성, 사용자 브라우저 선택 뒤 UI 인수.
- VISUAL VERDICT: RETOUCH (기존 판정 유지; 이번 소스 검사로 visual PASS 선언 없음).


### 전팀 연결 후속 — 2026-10-05 KST

[콘텐츠 계획 §24](../0마스터플랜/EXODUSER_GAMEPLAY_CONTENT_PLAN_20261004.md)에 사용자 전문15팀 동원, 에디터/자산/NPC/대화/UI/음향·효과/입력/안전씬/진행 gate·검수 계약을 기록했다. 원총괄이 두 오더담당에 배정했고, 전문팀 실제 착수·완료를 가정하지 않았다. 기존 MAP WIP/Chrome 사용자선택/3보완큐와 원화·nav·VISUAL RETOUCH는 보존. 생산/native/청취 인수는 미완료다.


### 최신 우선 및 담당상태 정정 — 2026-10-05

[콘텐츠 계획§25](../0마스터플랜/EXODUSER_GAMEPLAY_CONTENT_PLAN_20261004.md)/[CH1-1 A급 정본](CH1_1_A_GRADE_PRODUCTION_20261005.md)에 따라 첫 품질 인수는1-1이다. 본 틈·맵에디터/Unity 자산 요구·원화/nav·기존MAP HTML/WIP/3보완큐·RETOUCH는 보존한다. 본편연결·native/청취 완료0.

기존MAP Chrome 사용자선택 대기는 당시 등록의 이력이다. 최신 Claude 담당 감사에서 기존8 UUID/PID 등록이 모두 사라졌고 현재다른8 idle의 공식역할 handoff 미확인으로 현재MAP 세션/상태 재연결0. Codex7도 후속송신이 자동승인 검토 승인필요/never로 거절되어 실제 새전달0. 과거에 큐에 넣었다는 근거를 현재 수신/착수로 바꾸지 않는다. 미송신 우선범위 준비/정상공식handoff 읽기 확인만 하며 채널·브라우저 임의대체·재시도·새세션/정책변경 우회0.


## 현행 후속 — 공유 씬 에디터 실제 구현

사용자 스크린샷 크기 개선·맵 에디터 직접 제작 지시에 따라 root 공유 editor.html의 기본 작업 영역이 이미지 씬 편집으로 구현됐다. [실제 구현 계약](MAP_SCENE_EDITOR_20261005.md)에 원화·전경3 mask·레이어/world 크기/pivot/회전·이미지 임포트·길 브러시·전사 보행·JSON 왕복·PNG 및 검수15그룹을 기록했다. 기존 틈 nav4107·200²/T40·원본과 MAP팀 WIP SHA795818616e80a81cfa8b21438cdce0c8397f84ab41b2727efad68d417ba5c03b는 무변이다. 이전 미인수 진단은 해당 별도 WIP의 이력이며 새 공유 구현의 검수 결과와 혼합하지 않는다.

에디터의 actual Chrome 페이지/이동/왕복 검수 완료, 본편/NW/native/주민대화/장전환/청취 연결은 후속. 그림 전체가 자동으로 full clean plate·3D·높이 맵으로 변환된 것은 아니다. MAP PRODUCTION REPORT는 위 구현 계약§7. **VISUAL VERDICT: RETOUCH.**


## 2026-10-06 — 에디터 구성 결과

사용자 요청으로 [잔류자의 계곡](HELL_RIFT_EDITOR_RESULT_20261006.md) editable scene 제작. 공유editor에서 정확JSON 로드·레이어 편집·PNG/JSON 내보내기·기존전사8방향 보행을 연결했다. 원화6 crop+전경3+심연1=10객체/6층. 원본 PNG/layout 보존, 균열mask고정/sourceParallax.965·내부feather120. 실제 영상의 바닥 경계·전경 인수는 결과보고서를 따른다. NPC/대화·음향·장전환·높이물리·본편채택은 후속이며 최초·부분깊이 당시 검수는 이력으로 보존.


### 2026-10-06 결과 씬 보행 정합 보정

저장된 잔류자의 계곡 scene JSON은 초기 허공 통과를 수정해 동측 그림 바닥·계단에 맞춘 34점/반폭2.75tile corridor로 변경했다. 현행 walkable1192 / radius12 BFS1185 / navSHA a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179. 원본 PNG/layout와 기본 프리셋 nav4107은 그대로다. 실제 키종주267tiles/158turns/36.445초·오류0, 편집 결과는 본편 미채택. 정확 좌표·시각 한계·검수는 HELL_RIFT_EDITOR_RESULT_20261006.md를 따른다.


### 2026-10-06 최신 — 틈 editor 분위기 consumer

최초 Claude8 원자료8/8는 정확 원격 `15f5e64b9221b7bfbf8d5ca41d5328fcc9afe4a0`에 보존됐다. root 완료ID **ROOT-RIFT-AMBIENCE-INTEGRATION-20261006**에서 ANIMVFX 원문을 보존한 world/nav/mask adapter로 저장된 틈의 안개·잔불을 에디터에 연결했다. 직전 consumer0/완료7은 당시 이력이다. [정확 계약/수치/검사 정본 §9](MAP_SCENE_EDITOR_20261005.md#9-2026-10-06--저장된-틈의-안개잔불-consumer), [최신 §23 제작 보고](HELL_RIFT_EDITOR_RESULT_20261006.md#2026-10-06-최신--안개잔불의-실제-에디터-연결), [CH1 §14](CH1_1_A_GRADE_PRODUCTION_20261005.md#14-root-틈-분위기-consumer-완료--2026-10-06-kst)를 따른다. 실제 보행·장식·토글/PNG/reduced-motion 검사 및8카메라 시각확인 완료, scene/nav1192/본편 무변. NPC/대화/보상·장 gate·본편6단계/청취/A급 인수는 미완료·**VISUAL RETOUCH**. 자동화중지/유일오더·관리3/전문15=18·새팀/세션/권한변경0, 다른 WIP·live STATE/LOG·세이브·기존23 보존.


## 2026-10-06 최신 — 틈 대화 consumer / 오늘19시 보고

공식 완료ID **ROOT-RIFT-DIALOGUE-PREVIEW-INTEGRATION-20261006**. 이전 NPC/대화consumer0와 모든자동화PAUSED는 당시 이력이다. 현재 에디터에 하란·베린·네사·도릭의 F근접대화/선택/시험기록/재방문을 연결했다. 실제선물·퀘스트등록/완료·가방실패·장gate·본편·native6단계·청취/A급인수는0, **VISUAL RETOUCH**. source/raw/scene/nav1192·core/actor/game/index 불변; source STORY SHA be14b1416838ab345eb1c2a150b92403566ccfdc43cd3f3b317cf2913840dfdc. 대화15/실제Chrome12그룹·4보행/원본UI15/core29/안개10 PASS.

오늘 사용자 “작업을해서 저녁까지 보고해”를 따라2026-10-06 KST19:00에 실제완료·미완료/화면·검수·Git을한번보고한다. 기존4자동화PAUSED유지, 오늘만exoduser-2가1시간간격으로승인작업을계속하고 변화없으면알림0/19시보고뒤PAUSED. 기존1분루프·아침email/음성발송·Windows재개0. Codex7/Claude8 유일오더·관리3/전문15=18/새팀·새세션0, 전문TASK중복0, production/docs/Git root소유 유지. 현재slot4의재사용worker/read-only검수를전체16팀가동으로보고하지않는다. liveSTATE/LOG/WIP·보호2_3/Q-only·어택티켓금지·세이브·기존23 보존. 이번완료code6+관련docs11만exactcheckpoint/remoteSHA영수증, 80부터완료소유보존/100전신규산출중단.

초기천막/독립미리보기와후속editor현재결과를구분한다. [현재대화표시·접근·preview한계](MAP_SCENE_EDITOR_20261005.md#10-2026-10-06--지옥의-틈-망자-대화-시험), [실제화면·보행검사§23](HELL_RIFT_EDITOR_RESULT_20261006.md#2026-10-06-최신--네-망자에게-실제-접근하는-대화-시험). 원자료POI4를수정하지않고현행navlogical앵커4만adapter주입. 새건물/천막/주민bitmap0.

### 2026-10-06 — 맵 에디터 발 기준 찍기 현행

공식 완료ID **ROOT-EDITOR-FOOT-PIVOT-INTEGRATION-20261006**. 공유 이미지 씬 에디터의 선택된 이미지에 `발 기준 찍기`와 `MapSceneCore.reanchor`를 구현했다. 그림의 화면 위치·source/crop/mask·길을 유지한 채 기존 v1의 `x/y/pivotX/pivotY`만 하나의 Undo/Redo 거래로 바꾼다. 회전·좌우반전도 보정하며 잠긴/숨긴 레이어와 보행 중에는 차단한다. 모바일≤760px에서 찍기 시작 시 속성창을 접고 성공 클릭 또는 Esc 후 복원한다. 기존 기준점 숫자 입력의 동작은 변경하지 않았다.

정확 API·수식·범위·UI·저장·검수 계약은 `docs/4.1맵디자인+설정/MAP_SCENE_EDITOR_20261005.md` §11, MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 발 기준 pass를 따른다. core33/33, 실제 포인터/휴대폰13그룹, 최종 기존 UI15그룹 PASS. PNG byte 동일·source/nav·사용자 세이브 불변. 코드4+관련 docs12만 checkpoint하고 원격 exact SHA는 외부 `pivot-integration-20261006/receipt.json`에 보존한다.

**VISUAL VERDICT: RETOUCH**. 발 기준 편집 구현을 주민 크기 통일·clean plate·독립 NPC body·본편/native/청취·A급 맵 인수로 계산하지 않는다. 원본 그림·STORY·결과 씬은 불변이다. 기존 paused 자동화/아침메일 재개0. 오늘 19시 결과보고 조건은 유지한다.


## 2026-10-06 독립 주민 레이어 후보 반영 — ROOT-RIFT-RESIDENT-LAYERS-PREVIEW-20261006

현재 root 소비자는 승인 원화 유래 인물 없는 배경과 투명 주민4명을 별도 에디터 후보에서 렌더·크기 편집·현재 foot 기반 대화에 연결했다. 이전 절의 원본 baked/clean plate·독립body 후속 표기는 해당 시점과 원본 결과 씬의 이력이다. 원본을 교체하거나 본편 FIELD NPC 구현 상태를 바꾼 것이 아니다.

| 항목 | 현재 계약·근거 |
|---|---|
| 후보 | `assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json`, SHA256 `c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a`, `ISOLATED_EDITOR_RESULT_NOT_ADOPTED` |
| 그림 | built-in imagegen, clean plate/atlas1254². 원본1920²의 정확 픽셀 추출이 아니며 세부 지형/재질이 바뀐 별도 후보. 두 생성 PNG를 byte 그대로 사용 |
| 주민 | 하란/네사/도릭 최초 본체80world px, 앉은 베린 `80*352/578`. pivot(.5,1), alpha crop>8. 유효 aspect/foot을 유지한 사용자 크기 편집 허용; 편집 후80 고정 강제0 |
| 하란 v2 | foot(4660,6660), 접근(4660,6700). body와 south-root bbox 사이35.77854671280277world px, 접근 전사 폭80 기준20px. 이전 v1(4780,6460)의 발 가림은 미채택 이력으로 보존 |
| 씬 | 원본10개 지형 객체의 world/mask·nav1192·BFS1185·r12·시작(4020,7740)/출구(4020,1740) 유지. 6layers/14assets/14objects, foot=기존3+주민4 |
| 대화 | `residentDialogueAnchors(scene)`는 현재 body x/y/height. 편집 확정 시 controller/ambience 무효화, 보행 시작 전 재생성. F범위140, 최대240·접근step20/r12·64전이·22nodes/37options는 기존 session-only 계약 |
| PNG | 2048² export, CPU readback context `willReadFrequently:true`, `imageSmoothingQuality='high'`. 보행 전후 각각 멈춘 상태에서 export한 PNG byte 동일 SHA `f7e03969aa26b4eeaf227c513e0b6e5dfd28df992aabb74f0c7e309f5d34ed84` |
| 검증 | builder 의미19/19, 기본 UI15/15, 실제4주민 보행·분기10그룹 완료 뒤 PNG 차이 FAIL을 보존. 샘플링 수정 후 targeted8/8 PASS(실제3보행, 이전 위치 F닫힘/이동 위치 F열림·Undo·JSON/PNG). pageerror/HTTP누락0 |
| 기획/운영 | §16의 전문15+root통합1=제작16 유지. Claude8 raw8 공식완료는 미채택 보존, Codex7 새7착수0(송신 자동승인 검토 거절: 승인 필요/never). 기존 paused 자동화/아침메일 재개0; 오늘19시 한 번 실제결과 보고 |

정확 구현 표는 `docs/4.1맵디자인+설정/MAP_SCENE_EDITOR_20261005.md` §12, MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 독립주민 후보 절. 저장/실제지급·부탁/장 gate·높이물리·주민애니메이션·Unity package/Prefab/FBX/PSD 임포트·본편/native6단계·실청취는 미인수. 확대 grain/전사와 주민의 재질·접지 그림자·전체 절벽 실루엣 분리는 추가 개선 대상. **VISUAL VERDICT: RETOUCH.**

완료소유 코드10+관련docs12만 checkpoint한다. 원본 scene/PNG/STORY, game.html/index.html, live supervisor STATE/LOG·타인WIP·보호2_3/Q-only·어택티켓 금지·사용자세이브·기존23 유지. 원격 exact SHA와 최초 실패/최종 화면·영상은 외부 receipt에 보존한다.


### 2026-10-06 주민 접지 그림자 소비자 — ROOT-RIFT-RESIDENT-GROUNDING-20261006

현재 구현은 독립주민 v2의 정적 발접지 그림자다. 이전 독립주민 절의 접지그림자 미구현·builder19·PNG f7e03969…는 그 시점 이력이며, 현재는 아래 계약을 따른다. 원화/atlas/scene/nav 수치와 본편 구현 상태를 바꾸지 않는다.

| 항목 | 코드와 일치하는 현재 계약 |
|---|---|
| 대상 | scene SHA `c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a`, strict `residentPaintingProfile(scene)`의 독립4body. generic CH1/원본 baked 씬은 비활성 |
| API | `createResidentGrounding(scene,canWalk)` → 유효 factory 또는 null. `snapshot()`는 매번 현재 scene/body를 검증, 실패[]; `draw(ctx)`는 그린 shadow 수. 읽기 전용 editor 진단 `EXODUSER_SCENE_EDITOR.grounding()` |
| 판정 | 현재 foot에서 `canWalk(scene,x,y,12)===true`. Promise/throw/false/다른 truthy는 해당body 제외. ellipse를 겹치는 tile 중심의 `canWalk(scene,cx,cy,0)===true`인 셀에 clip; 현재tile40 |
| 수식 | `rx=clamp(body.width*.42,2,32)`, `ry=clamp(body.height*.08,1,8)` world px. tileSize 양수유한·cols/rows 정수필수. clipping cell `{x,y,width,height}`는 world rect, 임의 심연/벽 보행 추가0 |
| 페인트 | ellipse 정규화 반경1 radial gradient: stop0 `rgba(8,9,6,.34)`, stop.55 `rgba(8,9,6,.15)`, stop1 `rgba(8,9,6,0)`. clip→translate foot→scale rx/ry→fillRect(-1,-1,2,2), ctx finally restore |
| 기본 하란 | foot(4660,6660), rx20.346020761245676 / ry6.4 |
| 기본 베린 | foot(6020,5580), rx21.10173010380623 / ry3.8975778546712805 |
| 기본 네사 | foot(6300,5020), rx16.09360146252285 / ry6.4 |
| 기본 도릭 | foot(5220,2500), rx17.341935483870966 / ry6.4 |
| 렌더·편집 | 바닥 뒤 foot층의 기존뿌리/전사/주민 y-sort 전에 shadow 1회. changed() 시 scene cache 무효화, 열린 drag 중에도 live body 재검증. 숨김/등록변형/잘못된profile은0. 유효resize에 그림자도 비례, 하란height120일 때 ry8 cap |
| 로드 | residents import/factory는 STORY fetch/parse와 별도 try. STORY HTTP503 주입 시 대화null·grounding4 유지. 캐릭터·원화·보행 경계·inventory/save변경0 |
| PNG | overlay=false에도 grounding 포함. 멈춘 보행 전후/숨김Undo복구 2048² PNG 7018879B SHA `24230e778be6a955108e83a16a0086c510e6f82781324c837fb6fd7ef9f06ed4` byte 동일. 실행중 player는 렌더될 수 있음 |
| 의미·화면 | 기존19+접지 negative8=unit27 PASS(동일검사 반복0). browser10 PASS/실제4WASD접근·하란F/드래그·높이·숨김Undo·JSON정확·STORY503/기본씬비활성. 정상 pageerror/HTTP/console0. 새 동영상0 |
| 픽셀 | 기존 무그림자 export와 비교해 발ellipse 근방72픽셀만 달라짐, 외부0. 원본/derived PNG·scene/nav·STORY source hash불변. 전체화면 A급 품질이나 실제광원/높이물리 인수로 승격0 |

검수 시4접근 화면 및 resize 화면을 육안 확인했다. 작은 발 그림자는 구현됐지만 확대grain/재질의 차이·정적인물·전체절벽 alpha/height·실제지급/진행save·장gate·본편/native6단계·실청취는 미인수. **VISUAL VERDICT: RETOUCH.** 본편 code patch0. 외부 backup/최초실패/현재검수/PNG/원격exact SHA: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-grounding-integration-20261006/receipt.json`. code3+관련docs12만 checkpoint, 보호2_3/Q-only/어택티켓금지/타인WIP·liveSTATE/LOG·사용자세이브·기존23 유지. Claude8 원0324 raw8는 후보 미채택 보존 완료(c9b873cb…+7d12ede3…); 현재 memory후속은 쓰기0이며 본편채택으로 계산0. Codex7 새7은 정상송신 자동승인 검토 거절(승인 필요/정책never) hold. 기존paused/메일 재개0, 오늘19시 실제결과 한 번 보고.


### 2026-10-06 — 독립 주민 대화 차단 분리·마스크 출력 안정화

공식 완료ID `ROOT-RIFT-RESIDENT-DIALOGUE-ISOLATION-20261006`. 현행 독립 주민 후보 `c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a`의 editor consumer만 수정한다. 원본 baked 씬·그림·STORY·nav·body 값은 불변이며 이전 PASS/PNG 핀은 당시 이력으로 남긴다.

| 항목 | 현재 구현·검수 경계 |
|---|---|
| 독립 주민 보행 | strict profile/원문/중복 없는 정확4 anchor 구조 유지. 각 발 `canWalk(scene,x,y,12)===true`; 최소1명이 유효하면 controller 유지하고 막힌 주민만 근접/대화에서 제외. 전원 무효면 초기 null/열린 세션 inactive-scene |
| 원본 baked·무효 profile | 원본 그림의4 logical 발은 모두 strict true여야 생성·유지. 잘못된 source/body/profile은 전체 비활성. 검증 안 된 씬에는 이전 baked 진단 anchor를 표시하지 않음 |
| 접근·수락 | 직선 경로 간격≤20world px의 모든 검사 strict true 필수; Promise/1/throw는 실패. 대화 중 발이 막히면 선택 처리 전에 out-of-range로 닫고 새 선물/부탁 기록0. trial은 editor-session-only/actualGrant=false |
| 마스크 합성 | maskedPicture의 mask/sample/image 2D context `willReadFrequently:true`, image 합성 `imageSmoothingQuality='high'`. 캐시≤8·최대 변1024px·feather sample 최대 변256px·mask/source/world/직렬화 규격 불변. FPS 개선 주장0 |
| 실제 검수 | 의미19/19(1회). 최초 실제 XY/F/WASD 3확인·3보행 후 PNG 불일치 FAIL 보존. 합성 수정 후 Undo/무효 profile/JSON/새로고침/일반·baked/error불변6/6 PASS, 보행 재실행0. pageerror/HTTP/console0 |
| §14 검수 당시 PNG (현행은 아래 주민 환경광 절) | 멈춘2048² export7018386B SHA `21b2651252851355d6e2dee865b5e58282576585ad28a0097b5c08be90efb78a`; 편집→Undo·fresh reload/cache rebuild byte 동일. 직전24230e77…/7018879B는 수정 전 이력이며 현재 핀으로 사용0 |
| 제작·보존 | root완료 code3+관련docs12 한정checkpoint. 실제72+15=87부터 완료소유를 보존해72로 복귀; live owner STATE/LOG·타인WIP/기존23/세이브·보호2_3/Q전용·어택티켓 금지 유지. 원문8후속 메모는 미채택·idle, 중복TASK/새팀0 |
| 품질·잔여 | VISUAL VERDICT: RETOUCH. 정적 주민의 확대 grain/재질·전사와 원근/절벽 alpha·높이·실제 지급/quest/save/상승·본편/native6단계/청취 미인수. 계획이나 fixture를 게임완료로 계산0 |

정본 계약은 `MAP_SCENE_EDITOR_20261005.md` §14, 맵 가이드§23 제작보고는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 해당 완료ID를 따른다. 외부 근거=`/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-dialogue-isolation-20261006/`의 receipt.json·first-browser-failure.json/log·browser-qa/browser-final-verification.json·실제 베린/네사 대화 PNG. 정상 code+docs commit/push와 remote exact SHA는 영수증에 기록; 새 build/server/game/게시0. 오늘19시 한 번 보고·기존paused/메일 재개0.
### 2026-10-06 — Unity 단일 Sprite 이미지 규격 consumer

완료ID `ROOT-EDITOR-UNITY-SINGLE-SPRITE-IMPORT-20261006`. 실제 checkout의 격리 editor3387에서 PNG와 동명 .png.meta2파일을 함께 읽고 단일Sprite(TextureImporter textureType8/spriteMode1)의 PPU·alignment·피벗을 기본 배치에 적용했다. 원본 full crop/data URI, 반복 배치·Undo/Redo·JSON v1 왕복 유지. ordinary PNG/JPEG/WebP의 alpha crop/400world px·pivot(.5,1)은 그대로다.

| 항목 | 현재 사실 |
|---|---|
| 단위·규격 | PPU=spritePixelsToUnits .001~1,000,000, worldPixelsPerUnit 기본40·1~32,000, width/height=원본px÷PPU×단위 각1~32,000. Custom editor pivot=(x,1−y), fixed alignment0~8별enum. 범위밖 clamp0 |
| 파일·consumer | PNG≤10,000,000B + meta fatalUTF8≤256,000B·정확2동명파일. `MapSceneUnity.parseMeta` + `MapSceneCore.unityPlacement` + assets[].unitySprite(kind='unity-single-sprite-v1'). 중복/부적합모드·메타/부분crop·PPU/피벗오류는 현재씬/history 유지 |
| 실물 출처 | 기존 UI/button.png122×69/8956B SHA9fcb41bc8c54d83414161a44bd79acfba540c5fbc04a9c084bcc954971a5e5ec + meta2082B SHA3c7aa428101710c2a830de30618a5ffc559d2c02f2e80d468dec44b03cb54c1c → PPU100/단위40/center48.8×27.6world px. QA임시배치이며 틈v2채택0 |
| 의미검수 | 새Unity suite16/16PASS·실제총4회. 1차UMD로더14실패/2차cameras fixture2실패를 외부조건기록으로 보존, 3차15PASS 뒤 plain userData apostropheP2 제품수정·회귀추가 후4차16PASS. 다른 기존suite 재실행0 |
| 화면·입력 | 실제 브라우저23고유그룹PASS·실행5회(최초16+plain문자1+남은4+실제viewport1+버튼줄바꿈1), 성공한 다른검사 반복0. 390px/scale1/viewport내 속성toggle·실제tap/파일선택/배치, 단위44px·버튼55px/2줄문구확인. pageerror/404/외부서버요청0 |
| 소유·보존 | code5(editor.html/map-scene-editor.js/map-scene-core.js/map-scene-unity.js/test-map-scene-unity.cjs)+관련docs12=17만 정상commit/push. 완료소유 checkpoint 실제89→72, 원격exactSHA는 외부receipt 기록 |
| 남은 GATE | Multiple/9slice/.unitypackage/Prefab/FBX/PSD·Unity shader/script·3Dheight/runtime bridge 미구현. 틈4NPC/nav/STORY/source/game·사용자save 불변. 전체맵RETOUCH·실제grant/quest/save/상승·본편/native6단계/청취 미인수 |

정확 계약은 `MAP_SCENE_EDITOR_20261005.md` §15, §23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 같은완료ID. 근거는 `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/unity-sprite-import-20261006/`의 receipt·first-unit-failure.json·browser-qa. 전팀가동/A급/Unity전체호환/음성·메일발송 선언0. 두오더담당 유일송신·전문팀 중복TASK/새팀·세션0, 기존paused/아침메일 재개0·오늘19시한번보고 조건 유지.

### 2026-10-06 — 독립 주민 접근 검사 inspector

완료ID `ROOT-RIFT-RESIDENT-ACCESS-INSPECTOR-20261006`. 현재 격리 editor3387에서 네 주민의 발과 시작점 연결·대화 접근 위치를 수동 검사하는 읽기 전용 편집 도구를 구현했다. 원자료·고정 approach를 생산 씬에 새로 저장하지 않으며, 기존 controller의 현재 발 대상·trial-only 대화 계약은 유지한다.

| 항목 | 현재 구현 경계 |
|---|---|
| 대상·API | `tools/map-scene-resident-access.mjs`의 `inspectResidentAccess(scene,canWalk)`. strict 독립 profile만 `mode=independent`/4rows, review가 있지만 불일치=`invalid-profile`, 원본 baked·generic=`unsupported`, 함수 누락=`invalid-query`; 실패 rows[]·추정 fallback0 |
| 판정·단위 | radius12/range140/line step20/minApproachDistance40world px/maxCells40000. nav0/1과 world를 검증하고 시작→자기 cell중심/4방향 BFS edge/중심→foot 및 추천점→foot 모두 양끝 포함≤20 간격 stricttrue. Promise/throw/1 통과0 |
| 현재 위치·접근점 | body 현재 x/y와 objectId/npcId 사용, 고정 anchor.approach 무시. 연결된 tile중심 중 거리40…140 후보를 distance→y→x로 정렬하여 유효직선 최초1 선택. foot-blocked/start-blocked/no-route/no-approach/ready 구분, 다른 주민 차단 전파0 |
| 편집 화면 | inspector 주민 접근 검사 버튼,4카드의 이름/발/새 접근점/거리/상태, 발 위치 보기=선택과 camera만 변경. 모바일 보기 뒤 inspector닫힘; teleport/배치/nav/자동저장·History 변경0 |
| 갱신·export | 검사 버튼당 새 query1회, RAF/BFS자동재실행0. position/size input·드래그/첫brush/changed·Undo·import(save=false포함) 즉시 이전결과 무효화. 표시 토글/원형범위140·십자6screenpx·접근점5screenpx·실선1.5screenpx; 편집 overlay만, 보행/drag/pending/PNG에 표시0 |
| 의미검수 | 신규 suite12/12 PASS·실제1회·실패0. 실제4ready/이동·독립차단/고립섬/start seed/foot중심/중간구간/r12/invalid/failclosed/비변이. 기존 성공suite 반복0 |
| 화면검수 | 신규 Chrome12/12그룹PASS·실제launch1·실패/pageerror/404/외부서버요청0. overlay on/off의PNG7018386B SHA21b2651252851355d6e2dee865b5e58282576585ad28a0097b5c08be90efb78a 정확동일·JSON c508e70d…불변. 390px/scale1 touch에뮬레이션·버튼180×44px·가로넘침0·camera보기PASS. 보호14핀 before/after불변+승인원화a3d95a…확인. 원본4주민WASD재실행0;F대화가드1은하란만시작근처로옮긴외부fixture시험이며실플레이인수0 |
| 보존·인수 | source v2 c508e70d…/STORY be14b141…/game4f4eba25…/주민모듈·core 불변. 검수완료 root소유 code4+관련docs12=16만 정상checkpoint 범위이며 변경88개에서 타인72개와 분리; exactSHA·보존후실제수는 외부receipt 기록; live STATE/LOG·타인72WIP·기존23/save/2_3/Q-only/어택티켓 금지 보존 |
| 잔여 | VISUAL VERDICT: RETOUCH. 후보 원화 재질/정적 주민/높이/실제grant·quest·save·상승/본편native6단계·실청취 미인수. 시작연결 PASS는 실제 게임 이동·전투·보상 인수가 아님 |

정확 계약은 `MAP_SCENE_EDITOR_20261005.md` §16, §23 제작보고는 `HELL_RIFT_EDITOR_RESULT_20261006.md` 같은완료ID. 외부 백업·의미검수·화면·Git영수증=`/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-access-inspector-20261006/`. 두오더담당 유일송신/전문팀 중복TASK·새팀·실행세션0, 기존paused/아침메일 재개0·오늘19시 실제결과 한 번 보고 조건 유지.

### 2026-10-06 — 이미지별 다음 배치 크기·발 기준 규격

완료ID `ROOT-EDITOR-WORLD-PLACEMENT-PRESETS-20261006`. 일반 이미지를 편집한 크기·기준점으로 반복 배치하려면 매번 숫자를 다시 입력해야 했다. 선택 객체의 width/height/pivotX/pivotY 네 값만 자산별 기본 규격으로 보존하는 editor3387 consumer를 구현했다. 현재 객체를 일괄 확대하거나 본편 자산을 교체하지 않는다.

| 항목 | 현행 계약과 인수 경계 |
|---|---|
| JSON v1 | assets[].placementPreset 선택 `{kind:'world-placement-v1',width,height,pivotX,pivotY}`. world 크기 각 Number 유한1…32000, 피벗 각0…1. 잘못된 kind/null/array/문자수치/비유한/범위밖은 validate와import/History에서거절 |
| API·우선순위 | `MapSceneCore.placementDefaults(asset)`는 기존 unityPlacement를 먼저 검증한 뒤 preset이 있으면 fresh4값, 없으면 Unity기본 또는null. 다음 pointer배치=preset > UnityPPU·피벗 > 기존library너비/일반400·crop비율·pivot(.5,1). 저장된height도명시적으로적용 |
| 규격 저장 | `capturePlacement(asset,object)`는 Unity유효성과일치assetId+현재4값을검증해 freshkind+4값 반환, 입력쓰기0. UI는선택한assetId의optional메타만 History1트랜잭션에저장. 회전/반전/opacity/mask/좌표/레이어복사0 |
| 복원·왕복 | 기본규격복원은asset의placementPreset만제거, Unity메타/기존객체불변. 다음배치는Unity또는기존library/400으로복귀. 프로젝트JSON/로컬씬복구/Undo/Redo에서규격왕복; 게임세이브를사용하지않음 |
| 화면·가드 | scene-placement-save/reset/status(리프role=status·aria-live=polite), 버튼전체너비·min-height44px·문구줄바꿈. 선택없음/internal자산/마스크객체/잠금/숨김/busy/보행/대화중 저장·복원차단. 현재선택또는팔레트자산의다음규격만표시 |
| 주민 안내 | 접근검사의40…140world px타일중심조건을실제안내문에명시. controller거리0대화허용/최소거리/고정approach/계산규격변경0 |
| 새 의미검수 | 신규suite14/14PASS·실제1회·실패0. 일반·Unityoverride/restore·strict거절·detached/원본불변·JSONv1·History/invalidimport원자성·실제v2등록/body/nav보존검수. 기존성공검사반복0 |
| 새 화면검수 | 신규 Chrome14/14그룹PASS·실제launch1·실패0. 실제PNG/pointer/Unity·규격저장·반복배치·JSON왕복/Undo/복원·가드·390px touch 에뮬레이션은외부QA기록을따른다. 기존성공suite/원본4주민종주반복0, 휴대폰/native 인수0 |
| 소유·보존 | code4(editor.html/map-scene-editor.js/map-scene-core.js/test-map-scene-placement-presets.cjs)+관련docs12=16완료범위. 실제NUL88의완료소유만정상checkpoint·원격exactSHA/후속72대조는외부receipt. 타인72/기존23·liveSTATELOG/보호2_3/Q전용·어택티켓금지·사용자세이브보존 |
| 남은 GATE | VISUAL VERDICT: RETOUCH. 정적주민·확대원화흐림/높이·본편 실제grant/quest/save/상승·같은후보native6단계·실청취미인수. 규격도구PASS를맵A급·Unity전체호환·실플레이완료로계산0 |

정확 계약은 `MAP_SCENE_EDITOR_20261005.md` §17, 가이드§23 제작보고는 `HELL_RIFT_EDITOR_RESULT_20261006.md` 같은완료ID. 외부백업·핀·의미/화면·Git근거=`/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/placement-presets-20261006/receipt.json`. 새팀/전문팀중복TASK/빌드·서버·게임/Windows0. 기존paused/아침메일재개0·오늘19시실제결과한번보고조건유지.

### 2026-10-06 — 활성 레이어 객체 목록·직접 선택

완료ID `ROOT-EDITOR-LAYER-OBJECT-LIST-20261006`. 격리 editor3387에서 전경 뒤에 가린 NPC·소품도 이름으로 찾아 직접 선택한다. 이미지를 추가하거나 주민·길을 움직이는 대신 선택과 카메라를 제어하는 제작 도구다.

| 항목 | 현행 계약·인수 경계 |
|---|---|
| 목록 API | `inspectLayerObjects(scene,layerId,query='',page=0)`, 현재 층만 조회, 한 페이지 50행. 검색은 이름/id/assetId에 trim·소문자 includes, 최대160자. page 정수0…1000000, 범위초과는 마지막 페이지; 0매칭은 page0/pages0. fresh rows만 반환 |
| 앞뒤 순서 | flat은 배치 배열 역순, foot은 y 오름차순 안정 정렬 후 역순. 같은 y에서도 나중 배치한 그림이 앞이다. canvas hit도 이 역순으로 수정했으며 alpha threshold8/mask/좌표 변환은 유지 |
| 선택·보기 | fresh layer/object ID 재조회. 선택은 selected/layer/tool/palette/held key 상태만, 발 보기는 시차를 반영한 camera 중심+기존900×600 zoom/clamp만 변경. scene/nav/source/History/autosave/대화 데이터 쓰기0 |
| 가드·화면 | busy·playing·dialogue 및 숨김·잠금 층은 선택/보기 차단. parallax0은 직접 선택만 허용하고 발 보기 차단. 검색/선택/보기/이전/다음 min-height44px, 지정 목록 replaceChildren·리프 text만. Enter/Space는 새 버튼의 기본 활성 동작을 유지 |
| 의미·화면 | 새 의미검사14/14 PASS·실제1회·실패0. 신규 Chrome 16/16 고유 그룹 PASS, 실제 launch 1. 최초 실패와 후속이 있으면 외부 기록을 그대로 보존한다. 기존 성공 suite·네 주민 종주·대화 분기 반복 0. 모바일은 390px/scale1 touch 에뮬레이션이며 물리 휴대폰 인수가 아니다. |
| 보존·Git | code5(editor.html/map-scene-editor.js/css/map-scene-object-list.mjs/test-map-scene-object-list.cjs)+관련docs12 정확17 완료 범위만 정상 checkpoint. 실제 NUL89→72 및 HEAD=remote exact SHA, 타인72/보호8 핀 대조는 외부 receipt. live STATE/LOG·기존23·save·2_3·Q전용·어택티켓금지 유지 |
| 남은 GATE | 도구 선택/입력 검수와 전체 맵을 구분한다. VISUAL VERDICT: RETOUCH. 원화 확대 재질/높이·정적 주민·실제 grant/quest/save/상승·본편 native6단계·실청취 인수는 남아 있다 |

정확 API/UI 계약은 `MAP_SCENE_EDITOR_20261005.md` §18, 가이드§23 제작보고는 `HELL_RIFT_EDITOR_RESULT_20261006.md` 같은 완료ID. 백업·의미/화면·검색·Git 근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/layer-object-list-20261006/receipt.json`. 새 전문팀/세션/중복 TASK/빌드·게임·서버/Windows/게시0, 기존 paused 자동화와 아침메일 재개0. 오늘19시 단일 보고 조건 유지.

### 2026-10-06 — 여러 그림의 상대 간격을 유지하는 동시 이동

완료ID `ROOT-EDITOR-BATCH-TRANSLATE-20261006`. 격리 editor3387에서 현재 층의 NPC·소품·구조물을 체크해서 함께 이동한다. 같은 이동 거리만 적용하므로 서로의 간격·각 그림 크기와 발 기준은 유지된다.

| 항목 | 정확 현행 계약·인수 경계 |
|---|---|
| 읽기 전용 계산 | `MapSceneCore.translateObjects(objects,dx,dy)` → fresh `[{objectId,x,y}]`. 배열1…2000, ID≤160·중복거절, 입력/결과좌표−40000…40000, 공통dx/dy−80000…80000 유한 Number. 한 개라도 잘못되면 전원 거절; 입력쓰기/개별snap·clamp0 |
| 선택·수명 | 활성층 하나의 UI Set만. 체크/검색/페이지 유지, 현재층 모두선택은 검색과 무관하게 전부. 층 변경/import/UndoRedo/보행 시작/팔레트 선택/단일 목록 선택·보기/다른객체hit/빈곳hit/Esc에 해제. JSON v1에 그룹/선택id 필드 추가0 |
| 소비자 | 수치dxdy와 묶음drag 모두 공통delta에만 tileSize snap1회(OFF면 소수 유지). 한 History로 x/y만 적용, Undo1회 복원. 수치0delta는 History/autosave0. drag 범위 초과는 전원 gesture 시작좌표 복귀; 다음 유효 입력부터 재개 |
| 가드·입력 | busy/playing/dialogue/잠금/숨김/fresh ID 검사. 다중 선택 중 단일 크기·발 기준·회전·mask/규격/복제/삭제/층이동 차단. workspace focusin INPUT/SELECT/TEXTAREA는 held 이동/Space 해제, 씬·대화 상태 쓰기0. 그룹 선택 checkboxlabel와 수치·버튼 min-height44px |
| 실제 검증 | 신규 의미13/13 PASS·최초1회·실패0. 신규 Chrome 16/16 고유 그룹 PASS / 실제 launch 2. 최초 실패·필요 후속이 있으면 browser-qa 원본에 보존하며 성공 suite·네 주민 종주·F 분기 반복0. 390px touch 에뮬레이션이며 실물폰 인수0. |
| 보존·체크포인트 | code5+docs12 정확17 완료 범위만 정상commit/push. actualNUL89→72·원격exactSHA/보호8·타인72 대조는 외부 receipt. 두 담당 STATE/LOG는 본인 소유로 동시 갱신 가능, root덮어쓰기0. 기존23/save/2_3/Q-only/어택티켓금지 보존 |
| 팀 실행 근거 | ROOT-RESTART-FOLLOWUP-20261006-0644. Claude 기존8 실제peer8, 06:48 첫 수집 source6·QA선행1·BOSS대기1은 이력. 06:51:12 수집은 source8·end+idle3(SKILL/BOSS/STORY)·busy5·WriteEdit0·오류0. 완료3은 메모리 diff 미채택; SKILL composer 전체에 BOSS reward HOLD 포함, BOSS count/pet/time-attack 의미 변경 및 STORY save잠금 전 stage·중복confirm 불일치는 추가 검수 대상. Codex7 전문팀 송신은 자동승인심사 거절(approval required, policy never), 새 전달/착수0. 16팀 전원 실행·완료를 선언하지 않음 |
| 남은 GATE | VISUAL VERDICT: RETOUCH. 도구 UI/그룹이동 PASS와 환경 재질·높이·정적주민·본편grant/quest/save/상승/native6단계·실청취 미인수 분리. 발 정렬/그룹 크기 변형은 미구현 |

정확 계약=`MAP_SCENE_EDITOR_20261005.md` §19. 가이드§23 MAP PRODUCTION REPORT=`HELL_RIFT_EDITOR_RESULT_20261006.md` 같은ID. 백업·핀·신규검사·화면·docs검색·정상Git 근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/batch-translate-20261006/receipt.json`. 새 전문팀/채팅/실행세션·중복TASK0, 기존paused자동화·아침메일재개0. 오늘19시 단일실제결과보고 조건 유지.


### 2026-10-06 — 주민 재질의 정적 환경광 · 현재 PNG와 소비자 범위

완료ID `ROOT-RIFT-RESIDENT-LIGHTING-20261006`. 현재 독립 주민 렌더 계약은 `MAP_SCENE_EDITOR_20261005.md` §20을 따른다. 앞선 §14의 “현재 PNG”21b26512…·7018386B와 접지/재질 미개선 표기는 해당 시점 이력이다. 현재 PNG는 아래 표이며 원본 atlas·scene·world 크기/발 위치와 본편은 동일하다.

| 항목 | 현행 정확 계약·실제 인수 |
|---|---|
| 소비자 | 독립editor3387의 strict residentPaintingProfile(scene)+exact4body/asset/crop만 정적grade. prefix/다른src/crop/transform/duplicateID/참조불일치는 원래이미지로폴백. 기존원화/atlas/scene/nav/STORY/game/feet/height쓰기0 |
| 페인트 | 원본crop1:1canvas에 세로gradient stop0 rgba(116,126,130,0.14), .55 rgba(116,126,130,0), 1 rgba(206,120,92,0.16)를 source-atop 합성. warmRGB상수로 전구간 계산0; 투명중간stop도실제색보간에 관여. 지면반사광/추가그림자/동적광원0 |
| 캐시·가드 | 최대4슬롯, imageidentity/src/resolvedURL/crop x/y/w/h+object/asset참조검사. 실패null캐시와 원래draw폴백; publicclear는통계도0. prepare render1회,128assets/24layers/2000objects 상한, live profile편집·import/scene교체시무효화 |
| 축소·그리기 | exactsame destinationrect/foot y-sort. actualtargettransform×body크기가 sourcecrop보다작은축이있을때만 해당주민 smoothinghigh. DPR/zoom포함, 일반pixelart·upscale의quality강제0. target와cropcontext finallyrestore. staticPNG에포함, ambient/reducedmotion과독립 |
| 현재 PNG | 2048² / 7018384B SHA `c0ff307db2b2a6abfe55ead8a54fcd48c932cb9047fb6e3b585b8d9973524a21`. 조명OFF동일코드대조는7018386B/21b26512…와exactsame, import/reload 후새PNG동일. 신규변화657pixels=하란222/베린116/네사162/도릭157, 네body rect밖0·최대채널차34 |
| 의미·화면 | 신규unit14/14 actual1/실패0. Chrome고유12 실행항목PASS, actuallaunch3/context4. 최초11PASS+표본harnessFAIL1→2차색보간가정harnessFAIL1→3차미완료group2만PASS. 제품수정0/성공11그룹·이전suite반복0. 오류/404/외부요청0 |
| 픽셀 검증의 범위 | 충분한alpha≥128 RGB표본486/319/348/264개,4251채널·최대오차1.9412/동일per-alpha경계3…4 위반0. source해상도crop alphaMismatch/outsideAlpha/outsideRGB=0의 명시영수증은 하란1명만; 최초중단으로다른3의값은저장되지않아 네명전체alpha정밀인수로계산0. 최종PNG4body영역외0·RGB4명검수는별도실측근거 |
| 시각·GATE | 네원본crop전후board+실제editor300%4명상세·전체맵확인. 주민조명 VISUAL PASS / 전체맵 VISUAL VERDICT RETOUCH. 확대바닥해상도/전체환경재질·높이·정적주민·본편grant/quest/save/상승/native6·실청취·실물폰/A급 미인수 |
| 팀원자료·채택 | ROOT-RESTART-FOLLOWUP-20261006-0644: Claude8기존8 memory전부완료/end8/idle8/write0(06:59:28 이력). ART좁은downsample·ANIM정적bodygrade 제안만 rooteditorconsumer채택; 무제한cache/prefix판정/groundbounce/기타6 wholeDiff·본편채택0. Codex7송신거절(approval required/policy never) 새전달0·재시도/우회0. 전16팀제작완료 선언0 |
| 보존·운영 | code3+docs12 정확15 완료소유만 정상commit/push·원격exactSHA. 실제NUL87→72/타인72status·68bytepin·owner4본인갱신/root쓰기0·검수18sourcepin은외부receipt. 보호2_3/Q-only/어택티켓금지/기존23·세이브보존. 새팀/실행세션/중복TASK0·paused자동화/아침메일재개0, 오늘19시 단일실제결과보고 조건유지 |

근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-lighting-20261006/receipt.json`. 최초실패2·마지막미완료후속·핀/PNG/화면·docs검색은외부보존. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의동일완료ID 및외부보고서다.


### 2026-10-06 — 선택 이미지의 전사 기준 크기·원본 대비 화면 배율

완료ID `ROOT-EDITOR-SCALE-COMPARISON-20261006`. 현행 독립 에디터의 읽기 전용 비교 계약은 `MAP_SCENE_EDITOR_20261005.md` §21이다. 앞선 크기 편집·발접지·조명 계약은 그대로이며 새 카드가 현재 크기와 확대 상태를 설명한다.

| 항목 | 현행 정확 구현·증거 |
|---|---|
| 소비자 | editor3387 single selected object. 높이/전사 기준80, 실제비율72px 막대, world/crop/CSS 크기, X/Y source 배율. refresh/dirtytick 갱신; 다중/선택없음/모듈실패 숨김 |
| 수치 | heightRatio=H/80; bars=72*(80 또는 H)/max(80,H). CSS=W/H*zoom; source배율=CSS*(canvas.width/size.w)/crop.w/h. 최대축 >1 확대경고, ===1 native, <1 축소. 별도DPR cap·min-height·원본 자동보정0 |
| 예외·표기 | mask배열 배율null·선명도판정제외, 높이비교유지. ko-KR 최대소수3/0<값<.001 '< 0.001'. 회전전표시영역·투명여백/포즈의체감차이 명시. 리프DOM만 갱신 |
| 검증 | 신규unit14/14·actual1/실패0. 신규Chrome14/14 고유그룹·actual launch 3/contexts 8, 실패 이력은 외부 원본summary. 이전suite/주민종주/F분기/native6 반복0. QA중제품변경1: 일반마스크도1024buffer를쓰는듯한안내문구만정정, 계산/renderer수정0. 390touch에뮬레이션·실물폰0 |
| 추가 근거의 경계 | 최초11PASS+harness3FAIL→실패05/06/13부분만후속3PASS, 마스크안내문구만별도1증분PASS; actual18 check executions/Chrome3/context8. 최초390px tap/44px/넘침 assertions와화면은보존됐으나callback중단으로수치값은미반환. PNG exact측정은run1/문구정정전이며정정후재export0; 문구는PNG그리기에참여하지않음 |
| 보존 | 원본·feet·geometry·nav·scene/game/source·JSON/history/view-only storage 쓰기0. 현재PNG2048²/7018384B/c0ff307db2b2a6abfe55ead8a54fcd48c932cb9047fb6e3b585b8d9973524a21와 exact동일. 정상code5+docs12 한정checkpoint·actualNUL89→72/원격SHA·타인72status/68pin/owner4본인기록은외부receipt |
| 인수 | 도구 크기비교 UI의 화면/의미 인수와 전체맵 VISUAL VERDICT RETOUCH 분리. 바닥확대해상도·실높이·정적주민·본편grant/quest/save/상승/native6·실청취·A급 미인수. 새팀/실행세션/중복TASK0·paused자동화/아침메일재개0·19시단일결과보고 조건유지 |

백업·현재정확핀·화면·실패이력·docs전체검색과disposition·정상Git/원격근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/scale-comparison-20261006/receipt.json`. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 동일 완료ID다. Claude/Codex 전문팀 작업전원완료를 뜻하지 않으며, 이 개선은 root지원 구현을 독립 consumer에 채택한 것이다.
