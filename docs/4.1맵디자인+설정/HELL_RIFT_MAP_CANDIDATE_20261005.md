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


### 2026-10-06 — 주민 접근점에서 임시 보행 시험

완료ID `ROOT-RIFT-RESIDENT-PREVIEW-ENTRY-20261006`. 현행 정확 계약은 `MAP_SCENE_EDITOR_20261005.md` §22이며, 이전 접근 진단의 읽기 전용 계약은 유지한다. 새 보행 시험 버튼만 transient player/view를 변경하고, 기존 scene.start와 일반 보행 시작은 유지한다.

| 항목 | 현재 구현·인수 경계 |
|---|---|
| 독립 consumer | 접근검사4카드의 이름별 시험 버튼. fresh 시작연결 검사와 nearest 정확대상 확인 후 현재 접근점에서 시작. 자동대화0, F 명시대화·ESC닫기→ESC원편집상태복귀 |
| 조건·수치 | 정확4 NPC/object ID, ready/footWalkable/startConnected/유한좌표. 기존 r12/거리40…140/step20/40000cells 재사용, scene.start 및 nav/feet 불변. 시험zoom=min(stageW/900,stageH/600); 카메라clamp 유지, 카드 min-height44px |
| 조작·수명 | busy/playing/dialogue/drag/pending/multi>1 차단. Enter/Space native 버튼, heldkeysrelease. 성공import/changed/UndoRedo/tool/일반보행은 origin폐기, 실패import 이전상태유지. 모듈실패 새disabled/기존에디터유지 |
| 의미·화면 | 신규unit12/12 actual1 실패0. 신규Chrome 고유12그룹PASS, 실제launch1/contexts3; 원본raw/실패이력은 외부summary. 이전full4walk/분기/scale/old suites 반복0. 직접DOM guard와 actualpointer/390tap 별도기록 |
| 보존·Git | source scene/start/feet/nav/story/game·renderer코드/원본PNG 파일 불변, preview의JSON/history/autosave/user-save쓰기0. 시험중 새PNG에는 현재전사가 포함되는 기존동작 유지·이번export미검수. code3+docs12 정확15 한정checkpoint·actual NUL87→72·원격exactSHA는 receipt. 타인72status/68pins·owner4본인기록 보존/rootwrites0 |
| 시각·남은 것 | 도구 접근점 진입 UI 인수와 전체맵 VISUAL VERDICT RETOUCH 분리. 바닥해상도/주민실높이/애니메이션/본편진행·실지급/save/native6/청취/A급/실물폰 인수0. 새팀·실행세션·중복TASK0; paused자동화/아침메일재개0, 19시단일결과보고 조건유지 |

정확코드핀·수정전백업·검색전체/disposition·검사·화면·Git: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-preview-entry-20261006/receipt.json`. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 동일완료ID를 따른다. 이 기록은 root지원 구현의 독립 consumer 채택이며 전문팀 전원 제작완료를 의미하지 않는다.


### 2026-10-06 — 보행 시험 버튼의 현재 비활성 상태 표시

완료ID `ROOT-RIFT-PREVIEW-STATE-UI-20261006`. 정확현행계약은 `MAP_SCENE_EDITOR_20261005.md` §23. §22의 pending/drag/busy enabled외형잔존 관찰은 당시이력이며, 이번변경으로 현재표시가 guard와동기화된다.

| 항목 | 현재 구현·검수 |
|---|---|
| 표시 consumer | 현재4카드 button/ready 캐시. report무효화·카드재생성시캐시/상태키 초기화. 기존RAF에서 blockedboolean전이일때만 disabled=blocked||!ready 갱신 |
| 성능·동작 | 동일상태 DOM조회/disabled쓰기/카드재생성/BFS0, 기존tick O(1)비교만. 새타이머0/진입handler·source/player/view/nav/history/storage/renderer·대화 규칙 변경0 |
| 종료 정책 | propertyblur/성공import는 기존report/card무효화 후재검사로fresh활성. pan종료는현재캐시활성복귀, 객체·브러시편집drag종료는기존changed가보고서무효화후재검사. busy workspace.inert 유지. 비ready행은blocked해제후에도disabled |
| 의미·화면 | node --check actual1 PASS; 새unit0. 신규Chrome상태3그룹PASS actuallaunch2/contexts2, 실제propertyfocus·middlepointer·asyncbusy→종료/fresh검사와안정상태leaf쓰기0확인. 별도비활성시각근거1을추가했고 성공3그룹/72·30RAF측정 재실행0. 이전unit12/entry12/분기/종주/native6/PNG재검사0 |
| 보존·Git | code1+docs12 정확13 한정checkpoint·actualNUL85→72/원격exactSHA 외부receipt. 보호24·타인72status/68핀·owner4본인기록 유지, root타인쓰기0 |
| 인수 경계 | 표시 UI PASS, 전체맵 VISUAL VERDICT RETOUCH. 실제높이/바닥해상도·주민애니메이션·본편grant/quest/save/상승/native6·실청취/실물폰/A급 미인수. 새팀/실행세션/중복TASK0·paused자동화/아침메일재개0·19시단일보고 조건유지 |

코드핀·수정전백업·실제화면/원본검사·docs전체검색/disposition·정상Git/원격근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-preview-state-ui-20261006/receipt.json`. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 동일완료ID.


### 2026-10-06 — 선택 주민 배치 규격 진단

완료ID `ROOT-RIFT-REGISTRATION-DIAGNOSTICS-20261006`. 정본은 `MAP_SCENE_EDITOR_20261005.md` §24. 앞선 크기비교/접근검사/접근점보행/현재비활성표시 계약은 유지된다.

| 항목 | 현재 구현·인수 |
|---|---|
| 신규consumer | 선택한4주민의 배치규격일치/첫실패 대상·field·현재값·필요값 카드. propertyinput에서 다음dirtytick반영, 다른 주민·배경이원인이면 그대상명시. 자동보정/새JSON필드0 |
| 의미·수치 | 공유strictvalidator의 기존허용조건 보존. near1e-6/좌표0≤값<8000/height1…32000/1254²등록/foot sort·parallax1/pivot(.5,1) 유지. 크기80 자동강제0. 읽기전용·BFS0·안정결과leaf쓰기0 |
| 실제검사 | unit 신규14최종PASS actual2(초기테스트기대값1ULP실패1보존→실패1만수정재검사), old/new540동등 actual1PASS; module syntax1/rootJS2 PASS. Chrome 신규6그룹PASS·실제launch1/contexts3, 실패이력은 raw/summary. 기존성공검사/전체보행/분기/PNG/native6반복0 |
| 채택·Git | 독립editor3387에 code4+docs12 정확16한정정상checkpoint; actualNUL88→72/원격exactSHA 외부receipt. source22핀·타인72status/68exactpins·owner4본인기록 보존/root타인쓰기0. 그림·scene/start/feet/nav/story/main/save변경0 |
| 인수·남은문제 | 진단UI와전체맵분리, VISUAL VERDICT RETOUCH. 바닥해상도/실높이/정적주민/애니메이션/본편grant·quest·save·상승/native6/청취/실물폰/A급미인수. 전팀생산완료주장0·새팀/실행세션/중복TASK0·paused자동화/아침메일재개0. 19시단일보고조건유지 |

수정전백업·코드핀·docs전체검색/disposition·원본실패/후속·실제화면·정상Git/원격근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-registration-diagnostics-20261006/receipt.json`. helper unit의 `ROOT-RIFT-RESIDENT-REGISTRATION-DIAGNOSTICS-20261006` raw표기는 이root완료ID에 연결된 지원검사alias이며 별도생산완료가 아니다. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 동일root완료ID를 따른다.


### 2026-10-06 — 독립주민 발 고정 미세 호흡 소비자 채택

완료ID `ROOT-RIFT-RESIDENT-IDLE-20261006`. 현행 정본 `MAP_SCENE_EDITOR_20261005.md` §25. 앞선 정적주민·애니메이션 미인수 표기는 당시 이력이다. 이번에 editor의4주민 미세호흡만 구현하며, 골격/걷기/본편 주민 애니메이션은 미인수다.

| 항목 | 정확 현재 구현·검수 |
|---|---|
| 원자료→consumer | Claude ANIMVFX 공식ID `0f9a4f78-e7c5-4509-bb98-9d7a4cdb9857`/09:18:50.110Z/raw SHA `9e3480641c6a516f1074fb5a6908d8c81919c7ff69326b4fe327ec443f050f17`. 원문·기존pin preserved. root는 최신 strict profile와 exact4 첫 객체/발기준/설정·편집·export gate를 추가하고 phase를 index*.137로 확정 |
| 수치·범위 | period2600ms/amplitude.014, scaleY=1+.014*sin(2PI*((t/2600+index*.137)%1)); index H/B/N/D=0/1/2/3. 최대±1.4%·H80=1.12worldpx·B48.72=.68208. 좌표/원화/JSON/기존등록·lighting·nav값변경0 |
| 동작·보존 | on-screen+overlays에만 prepare/targetctx에만 verticalscale. ambientOFF/reducedON/busy/drag/pending off; selected+batch 해당주민scale1. PNG/offscreen 정적·onscreen Map 보존. module실패 editor유지, 읽기전용 detached snapshot. 기존30Hz만/새RAF·timer0 |
| 실제검수 | 새unit10/10 actual1·syntax각1 PASS. 신규 Chrome 고유8기능그룹 PASS·실제launch2/context시도5·ready성공4·pages시도6/성공4·QA중제품수정0; 최초harness4FAIL 보존→raw01/07정확f32분석·미완료02/08만후속, 영상인코더부재/미제작. 새 renderer 영향으로 정적PNG1회 비교·원본결과 raw보존. 기존성공suite/540/종주/F분기/native6 반복0. 영상 인코더 미존재로 영상미제작. 현재시각2스크린/raw256body+640generic/발screen anchor변화0은 browser-qa raw에명시. Canvas scale입력은f32/DOMMatrix곱double; 저장raw 모델오차0·임의tolerance확대0. PNG는이전baseline byte exact, 개별 offscreen matrix는첫1개만검사/4명전부matrix인수로과장0 |
| 실제채택·Git | code3+docs12 정확15경로 정상checkpoint, 실제NUL87→72·원격exactSHA 외부receipt. 수정전백업·보호25핀·타인72status/68exactpins·owner4본인기록 보존/root타인쓰기0. 본편/game/scene/source원화·세이브 변경0 |
| 팀·실플레이경계 | Claude8는 새공식원자료8개 제출/각1회인계·그중이번ANIM소비자만별도채택. 다른7개는 의존성과 의미검수전 미채택. Codex7 전문팀송신은 자동승인검토거부·actual0이며 담당본인 소스조사만 완료. 전문전원제작/본편완료주장0·새팀/실행세션/중복TASK0 |
| 인수·남은문제 | 전체맵 VISUAL VERDICT RETOUCH. 바닥확대해상도·실높이·골격/걷기·본편grant/quest/원자저장·상승/native6·실청취/실물폰/A급 미인수. paused자동화·아침메일 재개0/19시단일결과보고조건유지 |

백업·코드pin·공식원자료/raw·docs전체keyword검색/disposition·새unit/화면/PNG/영상 존재·정상Git/원격근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-idle-20261006/receipt.json`. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 동일완료ID를 따른다.


## 2026-10-06 바닥 재질 상세 consumer — 최신 상태

완료ID ROOT-RIFT-GROUND-MATERIAL-20261006. 지옥의 틈 주민 v2의 원형 지형을 유지한 editor 전용 바닥 재질 consumer를 구현했다. 전체 landscape 재원화 후보 v1의 VISUAL FAIL/미채택은 그대로다. 원본1254² 배경의 픽셀밀도를 복원한 것이 아니며 **전체맵 및 근접 재질 VISUAL VERDICT: RETOUCH**다.

| 항목 | 현행 값 / 실제 근거 |
|---|---|
| 코드 | tools/map-scene-editor.js + tools/map-scene-rift-ground-detail.mjs + tools/test-map-scene-rift-ground-detail.cjs |
| 원자료 / 소비 | assets/map/hell_rift/resolution_detail_20261006/arrival-detail-v1.png 1024×1536 / crop{x:320,y:1120,w:240,h:240}만 소비. 원자료 전체 맵 채택0 |
| 표현 | 4방향mirror480² pattern, worldSpan160/period320, alpha.4/soft-light. world고정·200² nav mask·비보행alpha0. foot 전경/주민/전사 전 합성. 기본enabled=true, groundDetailEnabled(boolean)은 저장하지 않는 view-only 진단 |
| 등록 / 보존 | strict 주민 v2+분위기 등록+abyss.visible===true. world200²/tile40/8000², nav1192, start(4020,7740)/exit(4020,1740), 기존 주민4 발·높이·원화·atlas·JSON/History 계약 유지. module등록 상세는 MAP_SCENE_EDITOR_20261005.md §26 |
| 새 검수 | unit12/12 PASS 실제1회 + 구문2파일 각각1회. browser Chrome1/context1/page1 기능11PASS·하네스FAIL1(픽셀 QA getImageData 성능 경고3). 재실행0/제품 pageerror·HTTP오류·예기치 않은request실패·API/외부요청0; 원문 및 파생 경고 감사 별도 보존 |
| 실제 화면 | Haran120% 및207.36% 전후, pan 고정, 심연 중앙 변화0표본, 네 주민 접근점→첫F대화→ESC복귀. 선택0/branch0/보상·questcommit0. 정적2048² PNG export1회 |
| 미완료 | 큰돌·절벽·뿌리·불 원본 흐림, 남쪽 뿌리 삼각형 접합, 근접 반복감. 본편 소비/grant·save·상승·실제높이·native6·실청취·실물폰·A급 미인수 |
| docs 검색 | 최초 Markdown302행22문서 검색 원문 경로 충돌 사실 유지; 원문보존 module검색142행28paths, 후속 전체확장자457행23문서 검색→파생 Markdown302행22문서, 현행동기화12/이력보존10/오더STATE보존1/추가consumer충돌0. 원문 재검색·복구 위장0; 보호2_3 매치/수정0 |
| Git / 운영 | 소유code3+docs12만 보존. exact commit/push/remoteSHA·foreign/protected핀은 외부 receipt.json. 19:00 단일보고 완료/exoduser-2 실제PAUSED. 이 변경은 이후 직접 요청 처리이며 기존자동화·아침메일 재개0/새팀·전문팀중복지시0 |

근거: /Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/ground-detail-20261006/receipt.json, browser-qa/run1/raw-result.json, browser-qa/root-warning-audit.json, root-visual-review.json, docs-audit-summary.json. 성공검사와 원본이력의 수치/핀은 해당 시점 근거로 보존하며 이번 표현 추가로 과거 결과를 새 PASS로 바꾸지 않는다.


## 현행 독립 3387 NPC·맵 연결 동기화 — 2026-10-06T14:40:05.634520+00:00

현행 목표 `CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006`. 이전clip2260×1400·주민미연결·실editor미인수 설명은 이전 관측이다. 아래는 최신 tools/2_5d-world-lab과 해당 파생 consumer의 실제 상태이며 다른stage LOCK/본편 계약을 바꾸지 않는다.

| 항목 | 코드와 같은 현행 상태 |
|---|---|
| 맵/카메라 | RIFT_TERRAIN.clip 0/0…8000/8000, groundTriangles32, source nav1192 불변. centre5430/3900·reset5480/3740, 정사영50°/scale400/기본높이3.5, 배우 위치를추종. physicalHeight UNKNOWN/depth240/inset.9 |
| 지면/절벽 | 2026-10-06 이력: skirt shade=1−.78f/maskFeatherApplied=false. 2026-10-07 현행: 고정globalUV·28선분 최단거리/120worldpx/opacity.38 sRGB 합성을 skirt·backplane 공용 불투명재질로 소비, shader 연결 뒤 maskFeatherApplied=true. ground-only sRGB soft-light alpha.4/nav1192/mirror480²/period320. sourcePNG1254²·1920²불변/원해상도 확대흐림 RETOUCH |
| NPC4 표시 | 기존1254²atlas SHA ff20e1f5… /displayScale1.8/정적billboard. sourcefeet 하란4660/6660·베린6020/5580·네사6300/5020·도릭5220/2500 불변. 배우/주민order=30+(footY−4320)/8000×10/뿔30 |
| 접근·대화 | displayApproach 하란4780/6660·베린5900/5580·네사6180/5020·도릭5100/2500/각120거리. nearest일치·navradius12검사. R/KeyR대화, 기존createRiftDialogue/session Map 사용; range140/line step≤20/radius12. 원본접근검사40거리/source.start·exit/nav변경0 |
| 선택·종료 | 실제베린gift1·재방문중복0·네사quest1, 총trial2/actualGrantfalse/editor-session-only. 이동·외형/모션/위치변경·pause·Escape·닫기·pagehide에서닫음. 대화중neutralidle/facing. 본편grant·quest등록·save·chaptergate0 |
| cue 소비 | interaction-cue-lifetime.mjs의mesh2 pool/추가RAF·timer0. 접근ring0xcdbb86/opacity.55/size.16/lift.003·열림marker0xc8623a/opacity.8/size.12/lift.42. NPC원본foot에표시/order=NPC+.5. pulse1.6Hz/depth.22; reduced-motion정적/캐시최대4·guard실패숨김·종료해제 |
| API·에디터 | scene-registration.editorRoundtrip이async save/load. format-only=FORMAT_VERIFIED/realEditorfalse, provider없음PENDING. 실제다운로드/import·90767B원본SHA c508e70d…동일검수5PASS. browser evidence의savedUTF8 SHA 불일치/input변조/async실패FAIL. lab metric-editor는provider미공급PENDING |
| 실관측 | 새최종Chrome/3387 actual23검사PASS/pageerror0/HTTP실패0/NPCatlas핀변조readyfalse·RAF0/pagehidecueNPC해제. 스냅샷복사·reduced-motion·외형교체·대화종료검사포함. 실제canvas영상522811B/DOM대화·소리미포함 |
| 팀/채택 | Claude8 기존7source/end/idle, raw24(기존17+이번7)후보보존. 신규raw와root파생consumer채택구분/public4역할유지/cue는기존ANIMVFX추가모듈. 신규STORYraw own-key P2/BOSSfootAnchor·referenceHeightUNKNOWN/MAPecho오류미채택 |
| 송신/보존 | Codex7전문첫송신자동승인검토거절/수신0·다른6미송신, ART기존선택대기/전원가동선언0. owner STATELOG4 별도/foreign68·보호10·기존23·sourcePNG/scene/nav/save·2_3/Q전용·어택티켓금지유지 |
| 인수/다음 Gate | VISUAL VERDICT: RETOUCH. 독립NPC표시·대화시험과본편연결/보스여정/native6/청취/IK발픽셀/A급 인수를구분. 고밀도지면·절벽/전경alpha·feather 보정 및본편consumer연결남음 |

전수 키워드검색 근거와 정확상세수치/API/핀/§23 MAP PRODUCTION REPORT: `docs/4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md`의 현행목표 절. 실제editor/provenance는 MAP_SCENE_EDITOR_20261005.md, 공식완료ID·fullpin·후보미채택 및MAP/STORY경로·삭제규칙위반의실제증거/피해UNKNOWN은 CH1_2_5D_TEAM_CANDIDATES_20261006.md. 외부 `/Users/fordeargamers/.codex/visualizations/rift-interactive-20261006/`의 final-interaction-v2-result.json/editor-final-result.json/화면/interactive-motion.webm/Git영수증을따른다. 이전QA를새검사로합산0. 코드/주요docs/raw는25a6e38df92c132cf6f1dd98db364391fbb18699에서완료소유NUL82 checkpoint, 나머지관련docs는80부터순차checkpoint·정상push/remoteexact로보존한다. paused자동화·아침메일/새팀·실행세션/설치·권한·게시·Windows재개0.

## 2026-10-07 지형 콜백 종료와 효과 오류 격리의 현행 정본

ROOT-ACTOR-TERRAIN-CALLBACK-CLOSURE-20261007 및 ROOT-ACTOR-UPDATE-FAILURE-CONSUMER-GUARD-20261007의 완료 사실이다. 앞선 12639/39715 source·CPU24/104·Chrome15의 '현재' 설명은 해당 시점 이력이며 아래 핀이 현행이다. 맵 원화·geometry·nav·본편/P/G/세이브·보상·키바인딩·보호2_3/Q전용 magic blackBean·어택티켓 계약은 변경하지 않았다.

| 항목 | 현행 값·구현·검수 경계 |
|---|---|
| public producer | tools/2_5d/actor-effect-lifetime.mjs 12844B / SHA256 660f09d604f4a5f4bcc9ae5e3e1774d2bd52e42744585704706337845c0b0afb. borrowed terrain.worldToScene 직후 disposed이면 p/mesh 접근 전에 place=false, spawn은 visible/live/spawned 재게시0. dust/attack 생성 및 기존 live 순회는 즉시 inactive stats 복사 반환. 원 terrain thrown value·기존 cleanup 오류 의미 보존 |
| public consumer | tools/2_5d-world-lab.mjs 41575B / SHA256 df1760cbf0c1862dc01e591011212aa5a65dcd8d807a49da0441778c5780994e. actor ID/handle/rig/epoch 캡처·snapshot 오류와 update catch 분리, 실패한 동일 slot만 INERT-before-release. 해제 callback 뒤 새 slot/선택/rebuild를 다시 쓰지 않음 |
| 재진입·프레임 | updateOwner가 있으면 살아 있는 정상 pose에서 장식 update만 skip(true), camera/dialogue의 나머지 pose는 유지. dispose가 먼저 owner/epoch를 무효화. pose/render/sample/UI 이후 lifecycle 확인 및 이미 예약된 RAF/document.hidden 확인으로 단일 기존 RAF 유지·종료 뒤 draw/UI/예약0 |
| readonly 진단 | __rift25Lifecycle.snapshot().effectUpdate 및 __rift25Lab.snapshot().effectUpdate = frozen {failures,phase,reasons:frozen copy}. failures는0 시작·caught effect update마다+1·Number.MAX_SAFE_INTEGER 포화. phase=idle/snapshot/updating/retiring, 실패한 현행 slot reason=update-failed, 새 rebuild publish는 해당 reason을 빈문자열로 갱신. 고정 status 리프에 '효과 재생 오류 N' 표시 |
| 소유·미해결 | 아직 다른 slot이 같은 handle을 보유하면 실패 slot에서 release를 보류하고 최종 teardown에 맡김. alias 완전 인수0. material/Mesh/scene.add private pending ledger, 참조 미반환 constructor 내부 할당, rig.snapshot 원오류→readytrue/RAF0 복구는 별도 미해결. Error.message/getter 조회0 |
| 정상 상수 | maxLive24, dust520ms/attack240ms/간격110ms, footBand4320·bands19/39, groundLift0.003, public dust0.14/attack0.17, RGB0x1a140f/0xc8623a·opacity0.5/0.8·reducedMotion=false·depthTest=true 불변. lab 플레이어dust0.022/attack0.08·드루이드dust0.042/attack0.145·depthTest=false 불변 |
| 새 producer source 검수 | 단일 Node 실행9그룹37조건 PASS/FAIL0/exit0. 실제 Three/public producer + 주입 borrowed terrain callback/event의 범위. old24/104/전문13 재실행·합산0 |
| 새 consumer source 검수 | 단일 Node 실행13그룹105조건 PASS/FAIL0/미도달0/exit0. 변경 source18함수/readonly hook·정상 actual Three/public producer. DOM/RAF/renderer/pagehide는 VM fixture이며 Chrome/GPU/native 인수 아님 |
| 새 실제 브라우저 원결과 | 기존3387 격리 parent의 Chrome1/context1/parent1/child5, 원4scope PASS/1scope FAIL·19조건 PASS/1조건 FAIL·exit1 보존. selection scope의 reason==='disposed' 기대실패이며 종료 후 onActorChange가 reason만 바꾸는 실제 source를 관측. activefalse/live0/pool0·해제 event·postwrite0와 같은 뜻으로 취급0 |
| 새 저장자료 제한 평가 | 추가 Chrome/context/child0, 기존 성공19 재평가0. 원 failed 공통1 설명과 미도달4만 after/failureObservation JSON pointer로 좁게 평가하여5지원/UNKNOWN0/exit0. 원 browserFAIL·exit1을 대체하거나5 clean browserPASS로 합산0 |
| 새 실제 화면 | 실제 다크드루이드 이동 y3740→3709.684 및 walk 대표 PNG를 root가 직접 확인. 새 active GL LINKtrue/getError0와 선택변경 뒤 정상 silvertail updates1→2·frames20→21/old16고정 관측. 합성 선택/pagehide는 isTrustedfalse, 실제 물리 GPU 회수·전체카메라·영상·본편native6·청취·보상save 인수0 |
| 공식 memory 입력 | end bb77d9f1-d84b-4851-9e04-cd477b7594c1@2026-10-06T21:10:48.664Z / raw6260B e12cbb9e0c3b4aaee0b28126c654f5ae3ae602cfe6e5f5a9c459c5dded0ad698. reported13은 실제producer7+frame모델6; root source105/37과 합산·실험 반복0 |
| 다음 작업·운영 | 기존 owner의 UPDATE-RETIRE-CALLBACKS 메모리 TASK 송신1은 새 전문 중복지시 없이 공식 end/첫source만 수집. root 소유 producer ledger·rig fatal 진단/회복·선명도·본편 최소 연결은 미완료. 실제4NPC·베린 유품 품목 질문은 해당 지급만대기, STORY 미소비 큐 재송신0. 24시간 제작·주간 사용률 약15 percentage points/day 목표 유지·이 채팅 일일 정확 token 보장0 |

전체 docs 관련 검색은 after-review 27경로538줄/899461B/SHA256 ab9c872435dd23e436143bc6ee613e6689fc13b67a33205ba1d34a8fa87ae4d2이며 모든 경로 disposition을 보존한다. 최초 draft 검색27경로608줄/1059412B/96ada057a39adb91ea8640e3443ca1b50dfb7b072e68790921b67e1d9cc4ac18도 이력 보존. 소유 문서는 원 fullprefix100%·EOF LF1을 보존하며 code2+관련 docs의 정상 commit/push·원격 exact 확인으로 이어진다. 타인 foreign68·owner STATE/LOG4·held WOLF raw 및 이전 승인 거절 목적은 변경하지 않는다.

MAP PRODUCTION REPORT (§23): MASTER=지옥의 틈의 actor cosmetic 수명·프레임 오류 격리. LARGE OUTER MASS→MEDIUM CONNECTION→GROUND CONNECTION→PLAYABLE/COMBAT→LANDMARK/CENTER→SMALL DETAIL=원화·대지·배치·nav·전투 변경0/기존 guide·SSOT·LOCK 유지. CAMERA QA=새 독립3387의 이동·walk endpoint PNG1 직접 확인/전체 여정·영상 미인수. TECH QA=producer9/37, consumer13/105, 원 Chrome19PASS1FAIL/exit1 및 저장자료 좁은5지원 평가를 분리. 실제 물리 GPU·본편native6·audio·durable save 미인수. **VISUAL VERDICT: RETOUCH**. 배경 확대 흐림이 남아 있으며 A급·실플레이 완료로 계산하지 않는다.

외부 증거: /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-terrain-callback-closure/final-receipt.json (9184B/c054acf05392da5e7228751beb6a7078e99cb0de1ca26ca1425682cf47beec18), actor-update-failure-consumer-guard/final-source-receipt.json (9352B/2c9cf0d08802276b243e7a9c31b16ef27d802a61bd9785c881ccaa1a69f2da2e), actor-terrain-frame-browser/ 원실패·제한평가·PNG 및 actor-update-failure-formal-end.json (6871B/7bb543948989cc2f3c6ca3b1d2c65556bde7cdf58daa3762d518fe8036e09ebd). 최초 소비자 draft41558/a811 검토의 paused pose 회귀는 검수 실행 전에41575/df1760으로 보정·백업 보존했고, rig snapshot 원오류 미해결은 숨기지 않는다.

브라우저 exact evidence / final receipt6200B: 88e918fa55e90ac33b26e113d7d1a7d4d1a29a8ee9f43686fc86e104a947a735; summary25866B/dbf709bf5f9d1fb370c5030c9f75e280e6db5a9a787785b43dacfd5c705d7091; §23 report4251B/1160af0c152b54c9b2c15076fbd3cc1137d0f247915dfaed9855299a1a95e532. 실제PNG1093251B/68c096c355ec2c065d5ac9d67f68eb9b71e0a91182bd546b0b484c047d1f1250, 경로 /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-terrain-frame-browser/actual-motion-after-isolated-update-error.png.

### 2026-10-07 ROOT-ACTOR-PENDING-ALLOCATION-LEDGER-20261007 · 현 소비 계약

| 항목 | 현재 구현 / 인수 범위 |
|---|---|
| public source | `tools/2_5d/actor-effect-lifetime.mjs` 14758 B / SHA256 `95b16f5daaf3b64661f59076b0d4fff041ef3d4ca1f760c1df63f98cc78d6e44` |
| 획득 소유권 | material·Mesh 반환 참조는 private pending으로 기록. 성공적으로 등록된 항목만 기존 `all`·`meshes`·최초 `dispose()` 반환 수에 포함한다. pending 개수 공개 0 |
| 종료·부분 실패 | ctor 반환·Mesh setter·scene.add 종료 뒤 disposed guard. 추가 게시·후속 root setter/add 차단; add 진행 중 detach는 반환 뒤 처리하여 dispose 뒤 attach를 누락하지 않음 |
| 회수 중복 | rollback/dispose는 같은 controller의 persistent identity dedup을 공유. borrowed scene/terrain 회수 0. remove 및 owned release 실패를 성공 해제로 계산하지 않으며 재시도 0 |
| 새 snapshot 필드 | frozen `allocationCleanup={detachFailures,releaseFailures}`. 각 primitive 안전정수 0 시작, 해당 실제 예외에 1 증가, `Number.MAX_SAFE_INTEGER`에서 포화 |
| 원 오류·수치 | constructor/add의 원 thrown value(null 포함) 유지. 정상 API·풀/수명/밴드/초기 committed 숫자와 기존 update/terrain guard 보존 |
| 최초 source 검수 | 14628 B / `eff18b04cc80c47ee41f62602b782a44ac213e074fe3e936c2d333eaf3f2dfb3`에서 실제 source·Three와 주입 ctor/borrowed scene 콜백의 단일 Node 16그룹·162조건 PASS. 기존 검사 재실행 0 |
| 읽기 반례와 제한 보정 | root 읽기검토의 Mesh setter→dispose→late scene.add 가능성은 native 실제 관측이 아니다. 해당 경계만 새 source에서 신규 단일 source CPU 4그룹·74조건 PASS / FAIL0·미도달0 / exit0, 원162 재실행0; 최초162와 합산·핀 이동·원 실패 교체 0 |
| 한계 | 참조 미반환 ctor 내부 할당 UNKNOWN. 임의 ctor identity alias·dependency 자체 외부 late write 일반 보장 0. 실패 remove의 실제 attached 상태·release event 0은 회수 성공이 아니다. GUI·GPU·본편/native6·청취·실save 새 인수 0 |

원 source12844/660f와 종료 소비자41575/df1760는 각각 보존 이력이다. 이번 변경은 효과 자원 획득·회수 계약이며 맵 PNG/scene/nav·geometry 배치·카메라·전투·Q 전용·보호2_3 변경 0. §23: 작업=효과 allocation consumer, MASTER/지형/플레이/랜드마크/세부/카메라 새 제작=0, TECH=신규 단일 source CPU 4그룹·74조건 PASS / FAIL0·미도달0 / exit0, 원162 재실행0 및 이전16/162를 별도 기록, 신규 VISUAL NOT ASSESSED / 기존 전체 RETOUCH. 같은 검사·TASK·이력 재실행 0.

다음 미완료: 맵 흐림·절벽 접합 시각 품질, rig.snapshot/render fatal frame 복구, NPC 유품·부탁의 본편 durable 소비자, 실제 native6·청취·보상 save. 최신 운영 근거는 PROJECT_MANAGEMENT_MASTER와 연속 dispatch 정본을 따른다.

### 2026-10-07 ROOT-RIFT-PLATE-SHARPNESS-AB-20261007 · 현재 비교 consumer와 실화면 인수

| 항목 | 현재 구현 / 검수 범위 |
|---|---|
| ground source | `tools/2_5d/rift-ground-detail.mjs` 21249 B / `830eef30ee9bc9e74219d12fa954300796a5b2ee53ce961bc3544affdfb8837e` |
| terrain source | `tools/2_5d/rift-terrain.mjs` 16816 B / `c7079fdbc32f4d19cc9ee89e6dc67ae81d6cb92d7d28e7169d29829ed45d44a0` |
| lab source | `tools/2_5d-world-lab.mjs` 42125 B / `4c5cdb71a0bd4330c3afb6d75440b41f6f33f42989360af31a517999ec1be101`; HTML 12266 B / `e2f0f1692df08f67bc2e6dc42f8e692a53ca060e33833813c8f58492adb8089c` |
| 비교 UI / API | `plate-sharpness` select 0 / 0.5 / 1, 기본0/OFF. leaf `plate-sharpness-status`. 새 factory옵션 `plateSharpness=0, renderer=null`(borrowed), ground/terrain `setPlateSharpness(number)`; 유한 number0..1 검사. `__rift25Lab.snapshot().terrain.groundDetail.plateSharpness`의 requestedStrength/effectiveStrength 구분 |
| 처리 범위 | 등록된1254×1254 원 plate의 ground RGB 확대만 Catmull-Rom 16 taps와 중앙2×2 채널별 min/max clamp. UV texel-centre clamp. 기존sample의alpha·multiply 보존. gamma 변환 추가0·원PNG/scene/nav/geometry/camera/rig/save 변경0 |
| 활성 조건 / fallback | 실제같은borrowed renderer·pinned Three160 map chunk·등록plate·WebGL2 또는 엄격WebGL1 OES_standard_derivatives. 양축 derivative footprint >0 및 ≤1 조건에서만 확대RGB 재구성. unknown/mismatch/minifying는 원plate. ground-detail OFF 또는 dispose 뒤 effective0. compiled는hook 계약이며 LINK 인수와 별개 |
| 샘플 비용 | 활성확대 plate 원1+추가RGB16=17 fetch(기존대비+16). 기존ground nominal4→20, 조건별분기·GPU실측아님. 읽기계획의+15는 미채택 제안 이력. 추가 texture/geometry/renderer/RAF/timer0 |
| source Gate | 동결code4의 신규 Node1회 11그룹153조건 PASS / FAIL0·미도달0·exit0. actualThree160/actualfactory·shaderhook와 GLSL CPU계산; image decode/canvas/renderer capabilities는fixture·GPU0. 이전suite 재실행·합산0 |
| 실Chrome Gate | 같은4source핀 신규 Chrome1/context1/labpage1/child0. 6그룹13조건 PASS / FAIL0·미도달0·exit0, 재실행0. paused160%/DPR1/전사(5480,3740)/detailON 동일조건에서 실제select handler→uniform 0→0.5→1→0. source4+보호8 exact·scene/storage 불변. selectOption change는isTrustedfalse |
| 실제 픽셀 | 0.5 RGB600148px / 1 RGB745063px 변화, 합성최종framebuffer alpha차이 각각0. OFF복귀 RGBA 및PNG exact. 이 alpha는 중간 원plate 투명shader alpha의 독립 검증이 아니다 |
| 실제 LINK / 비용 관측 | 13program LINK true·GL0·404/오류/foreign0. 각조건 warmup8+renderer.render wall60표본 median 0/0.5/1/복귀 = 0.5/0.6/0.5/0.6ms, calls11/triangles2456 동일. GPU시간·17fetch 비용실측·실물성능 보장이 아니다 |
| 시각 판정 / 적용 | root와GUI담당이 원본/강함PNG 직접 관찰. 바닥 결·윤곽 소폭 강화, 절벽·뿌리 저해상도 흐림은 여전히 큼. 전체 VISUAL VERDICT: RETOUCH. 비교기능만 적용, 기본0/OFF 유지·새디테일복원/A급완성/맵선명도완성PASS0 |
| 정확 근거 | implementation/final-receipt16070B/c2bdd2f21f4315a4eb5398e300095f8ebca4fb594167fa2e19d8b72435bdcc8a. browser/final-receipt9199B/b800f617a39c8f800a0a4c280a760213c943ea5374e02c5323de186f35962a31. source153과GUI13 합산0. readonlyreview7443B/c3f39c3320b37c7e50097383219b1193df552519dc97f09420a6d8ec0404ac4e는같은4핀초안읽기, 테스트아님 |

§23 MAP PRODUCTION REPORT: 작업=등록지면RGB 확대비교; 선행=fullguide·SSOT_INDEX·stageLOCK와exact읽기계획37853/a6df. MASTER PLAN→LARGE OUTER MASS→MEDIUM CONNECTION→GROUND CONNECTION→PLAYABLE/COMBAT→LANDMARK/CENTER→SMALL DETAIL은 기존등록공간보존/새geometry·배치0. CAMERA QA=동일paused160%/DPR1 새Chrome A/B·복귀·전사동작재개. TECH QA=source11/153와GUI6/13 별도핀·source12 exact·LINK13/GL0. VISUAL VERDICT: RETOUCH. PNG4와controls1은 외부 `plate-sharpness-ab-browser/`에 보존. 본편/native6·청취·실보상save·GPU물리메모리·실물모니터·독립platealpha 미인수.

현재shader 비교기능의기본OFF와전경/절벽흐림 RETOUCH를유지한다. 다음작업은실editor mask1024중간축소·feather/cache 및fatalframe 소비접점, NPCdurablebinding·본편native6/청취/save이며 정본PROJECT_MANAGEMENT_MASTER의 최신운영근거를따른다.
### 2026-10-07 ROOT-EDITOR-MASK-SOURCE-NATIVE-AB-20261007 · 선택 원본 마스크 비교와 실제 Canvas 검수

| 항목 | 현재 구현 / 정확한 인수 경계 |
|---|---|
| source | `tools/map-scene-editor.js` 82229 B / `4c037c1cd732ecb6001365ef46352abe47dbfaa2bd8fec4458024fe0adc633fd` |
| 기본 / 적용 대상 | `scene-mask-resolution` select legacy/native, 기본legacy. 선택한 feather 또는 sourceParallax composed-mask 객체1개만 native opt-in. leaf `scene-mask-resolution-status`; `EXODUSER_SCENE_EDITOR.maskResolution()` read-only 관측 |
| 버퍼 / 경계 | legacy는 기존 최대축1024 중간 버퍼(작은crop는 확대될 수 있음), native는 기존8192 image-admission 범위 안의 원본 crop `ceil(w/h)`. crop/월드aspect/월드feather·256 feather샘플/CTM/opacity 보존. 새8192 cap 정책 추가0 |
| 실제 대상 | 등록 심연 `obj-rift-depth` source1920×1920 / fullcrop / world8000×8000 / feather120 / sourceParallax0.965: legacy1024²→native1920². roots/horn3은 직접clip 경로여서 이 composed-mask 비교 적용·개선 주장0 |
| 선택 / 캐시 | 기존 최대8 insertion-order 캐시 유지, 옵션·선택 전환 시 이전native만 해제하여 retained native≤1. 원본PNG/scene/nav/배치 변경0. native retainedRGBA 계산값과 실제물리메모리·GC·GPU회수 구분 |
| 내보내기 / 저장 | unselected·직접clip·PNG export는 기존legacy 처리. 원화1920 이상 새로운 세부 생성0. 실제동일scene/localStorage 불변; 본편 save·보상 저장 인수0 |
| source CPU 이력 | 최초82218 B / bd89e5da3bdbdcca2d835607b1e885fed1cbb9224d10e6e3edffd395fd1f3ac6에서 신규Node1회10그룹129조건 PASS / FAIL0·미도달0·exit0. DOM/Image/Canvas ports fixture, 실제Canvas RGB/GPU0. 최종82229는 옵션문구1개 정정뿐이며 전체inverse exact; CPU129 재실행·최종핀 이동0 |
| 첫 실제 Chrome | 최종82229/4c037 실제JS response exact. Chrome1/context1/editorpage1. 그룹1·2 PASS, 그룹3의복귀RGBA FAIL(도달5조건중4PASS/1FAIL), 그룹3잔여·4~6 미도달·exit1. RGB912418px/max11 차이, alpha차0. legacy mask/image alpha histogram·feather256 hash·crop/destination/CTM/opacity exact. 최초실패 보존·원인확정0 |
| 한정 후속 | 실패3·미도달4~6만 새Chrome1/context1/page1, 4그룹6조건 PASS / FAIL0·미도달0·exit0. 비교 전4회 main readback+실제UI redraw warmup은준비관측/PASS집계0. sentinel 최초→2번째 변경, 2~4번째 exact. Chromium backend 전환은 가설/미관측 |
| 후속 실제 픽셀 | 안정화된 같은view4100/4100/zoom0.864/selection에서 legacy→native→legacy RGBA와PNG exact복귀. native RGB678172px/max13 변화·합성최종alpha차0. 최초미안정복귀FAIL을 지우거나 전체6cleanPASS로 합산0 |
| 실제 cache 관측 | native선택1/retainedRGBA29491200 B → plainhorn선택native0/abysslegacy1024/8388608 B → abyss재선택native1. 실제1객체 관측, 설정8 eviction/2 composed객체/GPU메모리 인수0 |
| 보호 / 시각 | source14정확핀·scene/storage{} exact, 오류·404·foreign0. root/GUI담당 원본·native PNG 직접관찰: 심연 미세세부차이 약함, 확대된 절벽·전경의 전체흐림 지속. VISUAL VERDICT: RETOUCH, 기본legacy 유지·A급/본편/native6/청취/실보상save 인수0 |
| 영수증 | worker final34835 B / 92b8d3f1949f982df007104cd17dcb57747e66926e1caa985b45bc3bc0d808dc. 첫 실패분석4034 B / b54582d8aa3653db3b7cdb38d572639c1e26ee9b593a615a951050abd4883e54. GUI final 7806 B / e8b9454e0c6f1f361654e3592ac1e7e8a6041f723beef78c61c43dc2772a8adb; 첫검사와한정후속 별도핀/합산0. |

§23 MAP PRODUCTION REPORT: 작업=기존선택composed-mask의legacy/native 중간해상도 비교; fullguide·SSOT_INDEX·stageLOCK 선행정확근거를재사용. MASTER PLAN→LARGE OUTER MASS→MEDIUM CONNECTION→GROUND CONNECTION→PLAYABLE/COMBAT→LANDMARK/CENTER→SMALL DETAIL은등록원화·geometry·nav·배치를보존/새제작0. CAMERA QA=같은view/zoom/selection Canvas A/B와첫복귀FAIL·관측안정화후한정복귀인수분리. TECH QA=sourceCPU10/129 이력핀·최종문구inverse, 실제첫FAIL 및한정후속4/6, 실제native선택해제·legacy export·source14정확. VISUAL VERDICT: RETOUCH. 첫/후속PNG와원자료는외부 `editor-mask-source-native-browser/`에보존. 전체맵선명도완성·main/native6·청취·GPU물리회수·실save 미인수.

선택된composed-mask의기본legacy와실제첫복귀FAIL/관측안정화한정후속을분리하여유지한다. 원화·전경·절벽확대흐림은전체RETOUCH이며본편/native6·청취/save미인수. 다음fatalframe 소비접점과최신운영근거는PROJECT_MANAGEMENT_MASTER를따른다.

### 2026-10-07 ROOT-RIFT-FRAME-FATAL-CONSUMER-20261007 · 필수 snapshot/render 실패의 현재 owner 중단

| 항목 | 현재 consumer / 정확한 검수 범위 |
|---|---|
| source | `tools/2_5d-world-lab.mjs` 45509 B / `3c5faddc2c0dc32b3e0feef3cce9550ec4a4aeb3b99be8bf61a044d69b8ac8ad` |
| 최소 접점 | 공통 `readRigSnapshot(id,rig,owner=null)`: effect update·paused updateUi·select의 실제 rig.snapshot 호출. 공통 render의 실제renderer.render. init/provider 전체예외·game.html 본편의일괄예외처리 변경0 |
| current fence | snapshot 전 id/rig/lifecycleEpoch·선택슬롯·optional effectUpdateOwner 참조, render 전 renderer/scene/camera/lifecycleEpoch 참조를캡처. 호출전후 current재확인. disposed/contextLost/epoch·identity/선택변경이 먼저이면 stale primitive관측만하고현재자원·UI·ready를덮지않음. 실제같은id re-init기능 추가/확인0 |
| 중단 / 우선순위 | 현재 실패만 최초private thrown reference+presence를기록(undefined/null도보존); ready=false/error고정/raf0/lastTime=null/heldclear·attackQueued=false·previewMode=null·anchorJob=null·rebuildrequest/pending/owner·updateowner해제를plainstate로먼저commit. previewentry무효화. 기존resume/rebuild/current guard로재시작0 |
| 고정 오류 | `FRAME_FATAL_ERROR='캐릭터 또는 화면 표시 오류로 시험을 중단했습니다. 페이지를 다시 열어 주세요.'`. raw `error.message`/String/getter/coercion 읽기0, 외부throw를기존fail(error) formatter에전달0. DOM leaf만보고·부모내용교체0, control.disabled/기존loading표시 |
| 진단 | `__rift25Lifecycle.snapshot().frameFatal` frozen primitive: failed/hasCause/phase(`rig-snapshot` 또는 `render`)/actorId/epoch/staleFailures/reportFailures/heldKeyCount/attackQueued/previewMode/anchorPending/rebuildPending/rebuildOwnerActive/updateOwnerActive. stale/report count는기존Number.MAX_SAFE_INTEGER까지saturate. rawcause/rig/renderer/ownerhandle 공개0 |
| 보고 재진입 | DOM/cancelRAF 보고 전후disposed·epoch·고정error current경계를확인하고개별보고실패는reportFailures로보존. 원thrown identity/phase와failclosed 상태를덮지않음. render성공/현재일때만frames++ |
| 자원 수명 / 미도입 | fatal은sticky STOPPED 상태이며즉시resource release정책0. 기존pagehide/dispose가단일full teardown owner, WeakSet attempt-before-release·독립정리실패계수계약유지. 재시도3/한프레임bridge/lastSnapshot cache/새필드schema검증/새RAF·timer·factory0 |
| source Gate | 최종45509/3c5f의신규Node1회 actual-source VM8그룹41조건 PASS / FAIL0·미도달0·준비오류0·exit0. 실제sourcefunction/span과actualThree/publicproducer정상경로, DOM/RAF/rig/renderer는통제ports. fullbrowser/WebGL GPU검사아님. oldmemory7/9·effect37/105·oldChrome 재실행·합산0 |
| source 경계 | active snapshot·pausedUI/select·frame/directrender·pagehide승리·selected/slot변경·undefined/null/hostileformatter·후속독립dispose/report실패·safe진단/restart 차단을호출한 CPU근거. 모든provider/driver예외를처리했다고확대0. 공개 `__rift25Lab.snapshot` 원형불변: 실패후안전검수는Lifecycle진단사용 |
| 실제 Chrome | 실제 최종world HTTP source45509/3c5f exact, originalrig/Three query provider를호출한후통제된snapshot/render fixture throw(자발적provider/GPU driver오류가아님). 최초Chrome1/context1/parentQAfixture1/순차actuallabchild3: frame rig.snapshot·frame renderer.render 2그룹12조건PASS, paused-select그룹TIMEOUT FAIL/exit1·6조건미도달. actualfixedleafUI/RAF0·입력/jobs해제·rawformatter getters0·trusted nativepagehide·rig3/renderer1 및riggeometry3/material3 dispose호출관측, 물리GPU해제보장아님. 세번째는trustedpause click/ArrowDown에도change0/fixtureThrows0/전사·readytrue/정상pausedRAF여서제품실패경계未도달. 세번째준비만새Chrome1/context1/parent1/child1 한정후속 ArrowDown+Enter: 다시native-selectcommit TIMEOUT/exit1,0PASS/1FAIL·조건0도달·6미도달,fixtureThrows0/readytrue·전사유지. 추가Chrome0·선택consumer GUI UNKNOWN, pausedRAF updateUi GUI UNKNOWN(CPUactualsource근거별도). 총Chrome/context/parent2씩·child4, 원첫2PASS/1FAIL과후속0PASS/1FAIL을합산·성공12/CPU41재실행0. actualsource12정확/원scene/storage·pageerror/404/foreign0. 최초raw341391B/8f71a4438b002d119e2b3287cac4196449ecdac5d6c86347cfc94d754d29df4f, 후속raw74934B/fccc3a0d5d28b6c16ed4345a8520d8612186ee9bb16345995c030f5ebc1c9769 동결 |
| 정확 근거 | worker final21520 B / 826615d9ca926e3725aec10b390369f7b43ea6e2a436c7bc0fe20255afea4bf3; readonly계획13398 B / 849c28b3fe23e799c03fdde9d1765a70d9c94d1407c65f8ccb4ba62d9578da69는실행0 이력. 새actualChrome final9747 B / 9c8f87a7b94b228073c0a98d8bafc44ed580b4b40131bd3ad193d70909735dfa; summary24217/dcbaf2bdf44bdf6c276692bd37cf46b5881491e853a596e7fb37cab28402bd13; §23 report3886/cebec413b296fce7c5b10d38ab580b48c10d4cf4cbb27a60b969c797fd0d3edb |

§23 MAP PRODUCTION REPORT: 작업=기존world의필수snapshot/render TECH QA 실패consumer; fullguide/SSOT_INDEX/stageLOCK의기존정확읽기근거재사용. MASTER→OUTER→MEDIUM→GROUND→PLAYABLE→LANDMARK→DETAIL은원PNG/scene/nav/geometry/발접지/배치/카메라보존·새맵제작0. CAMERA QA=새오류UI에대한실제lab실패주입범위분리. TECH QA=최종source8/41 및새Chrome별도핀; stickySTOPPED→nativepagehide teardown 관측, 물리GPU해제아님. VISUAL VERDICT: RETOUCH(기존전체맵), 오류UI검수는맵선명도/A급완성의인수가아님. 본편/native6·청취·실보상save·allproviderfault 미인수.

#### 원총괄 현재 운영·새 전문 메모리 원자료 (후보 미채택)

| 단위 | 정확 공식 완료·검수 범위 |
|---|---|
| root 현재 보존 | ROOT-RIFT-FRAME-FATAL-CONSUMER-20261007의 완료 code1+관련정본docs21만 정상 checkpoint 대상. 직전 HEAD/remote exact c6f295858c656cf729fb77f1417ad039ed280dee. 타인68·owner STATE/LOG4·WOLF HOLD1은 별도 유지/index 포함0. 현재 code45509/3c5f, worker21520/8266와 GUI9747/9c8f의 신규 근거만 동기화. 실제 push 및 원격 SHA는 해당 단위 외부 remote-preservation-receipt.json으로 사후 확인하며 이 문서의 과거 HEAD를 현재 HEAD로 치환하지 않음 |
| 전체 docs 검색·분류 | 신규코드후 rg docs 전체40경로358행. 현재 source 계약 관련 정본21개 동기화; 나머지19개는 owner 로그의 과거 결과, 변경하지 않은 게임/안개/영상/다른 rig-lab 오류 처리·키바인딩·맵geometry·오디오 계약을 원형 유지. 전체 경로별 disposition/백업/prefix/EOF/GFM은 root-current-docs-sync-receipt.json. 보호2_3/타인 WIP 변경0 |
| MAP project preview | CH1-RIFT-EDITOR-PROJECT-PREVIEW-ISOLATION-20261007-MAP-MEMORY 공식end32bf873e-4619-4c7d-b1fb-145c1d260569@2026-10-06T22:23:15.264Z, raw6838/9b40293abd8b46d29bec6646003a451dd91a7114e33603fb7072a1039ccec9bd; 외부 보존11565/29ad9712a5cd9745fefe9dc1504208c6c48973adb21e4d4dbea36e6d30b7de42. 현재 editor 표시 flags의 project 유출은 확인되지 않음; 임의필드 clone passthrough 가정과 실제 저장 배선은 별개. guide의 이전 선행 순서 FAIL은 소급 PASS0 |
| ANIM material 원자료 | CH1-RIFT-CHARACTER-MATERIAL-VFX-READABILITY-20261007-ANIMVFX-MEMORY 공식endc03dbdfe-a638-4b6c-b9a9-2f2c9d7fb15d@2026-10-06T22:21:43.874Z, raw7179/ab117eba5e7198db0ec8f7b1c29c48af93b729a9fa500bbee1211c8ff4b29c45; 보존18360/c2d5050df822989fa3b3ff01096077ff416ca3699e574c75492b2f33cd64a9da. 최초 산술stdin은 assert1PASS 뒤 잘못된 예상34.675/실제34.275로 FAIL·후속미도달/exit1, 수정 재실행0. 실제 픽셀/실루엣 인수0 |
| root 재질 실제 context 읽기 | read-only-result10580/42c5e21a02de576b8414e9a192a02f6c6d4ca191ceaf1557230f05a4f5676153, 실행·GUI0. Three r160의 opaque→transmissive→transparent 및 리스트 내부 renderOrder 계약은 맞음. 그러나 실제 world consumer는 rig.material.transparent=true/depthTest=false/depthWrite=false로 덮고 effect도transparent=true이므로 base rig factory의 opaque 계약만으로 world를 판정하면 안 됨. 실제 world에서는 동일groupOrder의 effect19/39와actor25.6–34.6 비교가 투명 리스트 내부 source 계약에 해당. 실제 GPU 가림/선명도/새 alphaTest·filter·depth 정책 채택0 |
| MAP restore token 새 원자료 | CH1-RIFT-PREVIEW-RESTORE-ACTUAL-TOKEN-UNWIND-20261007-MAP-MEMORY 공식end97d3c06d-f4a8-404c-bfd6-e0c5e30ce5e7@2026-10-06T22:38:43.522Z, raw5403/8bc123de504a09b58491178968dc1899e1b8b9647e4c4edd8af3160249bcb22d; 보존6429/5da44fcac1d66140268ffed47eda55167f5786fa9b68f6efed9ad989a53b0b54. 실제 entry 함수+fake 기록 port를 구동해 old handle restore/dispose·new handle 미호출, restore throw 후 dispose/Promise rejection observer/once를 관측했다는 메모리결과. 이것은 실제 iframe pose의 cross-token 격리 인수가 아님. release가 호출하는 handle 자체와 port가 구현하는 실제 token 격리를 구분. 실제 editor import cancel 배선/iframe pose/async side effect UNKNOWN, 새 cleanup e.message 제안·async 정책 미채택 |
| ANIM pass-depth 새 원자료 | CH1-RIFT-VFX-RENDER-PASS-DEPTH-CONTRACT-20261007-ANIMVFX-MEMORY 공식end33d949d7-96fa-4f91-bf7e-212e25089842@2026-10-06T22:38:02.931Z, raw6485/f58fed970783bc7d4a22a4341714be88852662f5dea5663bb8060dfa613fe8f7; 보존7499/451ae2be85d8da8de1a81d14bc77e2a297bd39f09658d3d0467bca5ccd56d7eb. 새로운 Three source Read/실행0. base opaque만 적용해 actualworld도opaque라고 한 결론은 root 관측된 world override와 충돌하므로 채택0. LinearFilter와 opaque alphaTest만으로 반투명 blend fringe를 단정하지 않음; actualworld의 transparent override는 별도. depthTest:true 옵션은 consumer의 depthWrite=false·렌더순서까지 포함한 새 실제 검수 없이 채택0 |
| 기존 owner 후속 | Claude8 최신 turn134: ANIM 모션 위상/UV 신규TASK1·peer1·실제source1/end0, MAP 후속은 전문 완료문의 인간승인 질문으로 보류. root는 기존 사용자 직접 팀운영 승인에 비춰 이 보류만 복구 피드백1회; 실제 외부manifest 도구거절/삭제·피해UNKNOWN/cleanup0 경계는 그대로. 전문 중복·새팀·새실행세션0. 실제 계속 여부는 새 owner 송신/peer/source/end 근거로만 확인 |
| 다음 독립 root 접점 | 본편 root P/character와 child 최초 actor 선택의 연결을 별도 exact-source 읽기 중. 기존 epoch/save/Continue 검사는 재실행0. P/HP/inventory 전체전달·본편 native 인수를 이 계획으로 선언0. NPC 유품 실제 contentID/수량·부탁 questID/구조대상은 기존 미확정 유지 |
| 운영/인수 경계 | 연속 제작 유지/다른paused자동화·아침메일재개0. 사용률 목표 약15 account weekly percentage points/day, 공유 관측·일별token 미제공이므로 이 채팅의 정확 하루소비 보장0/토큰태우기0. 본편native6·청취·실save·A급완성0. 원화1254→8000확대 흐림/legacy1024mask는 미해결·VISUAL RETOUCH. WOLF 거절 뒤 같은 산출물 corrected-path write 이력·피해UNKNOWN 유지, 해당 후보 추가읽기·실행·검수·채택·Git0 |

### 2026-10-07 ROOT-RIFT-MAIN-CHARACTER-SEED-20261007 · 부모 선택과 최초 2.5D 표시 연결

이 절은 초기 캐릭터 표시 연결의 최신 source 계약이다. 이전 핀의 child 캐릭터 전달0/host17683·world45509는 당시 이력으로 보존한다. 본편 root 진단의 미인수 상수와 public host의 초기 표시 ACK는 서로 다른 범위다.

| 항목 | 현재 구현·정확한 범위 |
|---|---|
| host source | tools/2_5d/main-rift-host.mjs 18931 B / a242f619d0a6f1bf3e8809a8f059e0979606b4356addd6f9b1e12c73cbc4f967 |
| child source | tools/2_5d-world-lab.mjs 46833 B / fbab9b30265a0b211220e0e03775249bee8385fdae26c5c30bfe691409bcb5cb |
| 실제 누락 접점 | 기존 game의 _charIdx0/1→warrior/silvertail 및 runtime readHostContext→host는 존재. 이전 host 고정 iframe URL·child 초기 select(warrior) 때문에 silvertail도 전사로 표시. 실제 현재 사용자의 live class 관측을 이 source 반례로 대신하지 않음 |
| 호스트 허용값 | contextSnapshot.character는 정확 primitive 문자열 warrior 또는 silvertail. MAIN_RIFT_HOST.characterSeedKey='main-character', characterLinkScope='initial-display-only', fullPlayerLinked=false. unknown/empty/main dark-druid는 admission 실패 |
| per-entry URL | 캡처한 context.character만 새 URL.searchParams.set('main-character',character)로 넣고 expectedCharacter/entryURL/characterAck=false를 해당 record에 보관. onLoad와poll이 동일origin·lab pathname·정확 record.entryURL href를 검사. parent P/UUID/HP/inventory/flags/좌표/facing의 query·payload 직렬화0 |
| child 초기 준비 | readInitialCharacterSeed(window.location.search)→main-character 없음이면 standalone/editor 기본warrior. present는 getAll 결과 정확1개+허용두ID만 통과, empty/duplicate/unsupported는 고정 내부오류로중단. renderer 생성 전에검사. prepareInitialCharacterDisplay가 state.selected·dropdown.value·rig visible·helper hidden·CHARACTER_RIG_CATALOG 한글명을 first ready/reset/render 전에동기화 |
| 초기 ACK | initialCharacter는 private 초기ID, initialCharacterReady는 reset/select 이후 ready·error없음·disposed아님·선택일치에따른boolean. __rift25Lab.snapshot의 own-data primitive initialCharacter/initialCharacterReady/selected를 host가 loading때읽고 ready=true일때 expectedCharacter와정확일치해야characterAck=true/active/handle을resolve. child snapshot accessor/proxy/throw는 고정 'UNKNOWN · 지옥의 틈 초기 표시 ACK 읽기 실패'로 치환·외부message/String 읽기0 |
| 재진입·변경 경계 | ACK read 이후 current record·sameContext 재확인; stale/cancelled entry가 새 entry를active로 만들지 않음. active 이후 새manual비교를강제원복0; standalone dark-druid 수동비교는기존경로. 초기ACK는계속 player 상태를동기화한다는뜻이아님 |
| 진단 범위 구분 | host.snapshot().childCharacterLinked는 current.characterAck===true만. MAIN_RIFT_HOST.fullPlayerLinked=false 유지. window.__riftMainIntegration.snapshot()의 childCharacterLinked:false/durableSaveAccepted:false/demoHubAccepted:false 등 game 자체미인수진단은실제game코드불변이므로그대로이며 host 초기표시true로대체0 |
| 그대로인 소비자 | game.html4050426/ece8c398068903caf666979b33c3e0f541043db1e58f98a65d7c68e427f74230와 main-rift-runtime.mjs7519/b93cb86f7857bd4242af8b9cc9478cceea591d03aad872bca76a5af06b471b69 byte불변. Continue/epoch/save/lease/guardedAdvance·기존5000ms/900ms·host30000ms/100ms 정책변경·재검사0. spawn5480/3740·geometry/nav/PNG/카메라·렌더기본값·발접지변경0 |
| source 최초 Gate | actual importedhost+actual child unchangedfunction/startup/API span을 VM에서호출, actualThree/catalog+통제DOM/RAF/rig/renderer/iframe/P/G ports. 최초8그룹 중4완료·29조건도달(28PASS/1FAIL)·4그룹잔여미도달/exit1. fixture의 INTERACTION_CUE_PROVENANCE/SLICE_ACCEPTANCE_PROVENANCE/SCENE_REGISTRATION_PROVENANCE 3누락→actualsnapshot참조예외→host실패/정상timer1기대FAIL. 제품결함확인0·원FAIL동결 |
| source 한정후속 | root승인으로외부fixture의실제누락imports3만공급. 이미PASS한조건재단언0/제품2코드핀변경0. 미도달 ACK·hostactive·P identity 두class각3조건+standalone/manual3+정상timer1만 새4그룹10조건PASS/FAIL0·미도달0·준비오류0/exit0. 원FAIL과합산/전체clean suite PASS선언0·old검사0 |
| source 정확근거 | worker final21003/686b31461510bf0c6cbc0f191ded0d9c32fe6118f433acd1f5376ce3449b79f8; 최초raw7624/6acc16e83e9a876f334de74077a909d873ddf105b5e183edc5ee8a6125783379; 판정1083/6107533374c9675ec4aae266fe7842a8686c7bd23813dccbde968fef7f95daa8; 한정raw3512/a62bee6ed7148a8908b8dbf7c2680362c37c8e6f4ebeda0f76b990e20bcdf9d9. source2 역변환 exact·소유doc원prefix159478·EOF1/GFM3표 |
| 새 actual Chrome | 신규 actualChrome1/context1/parent1에서 host child2를전사→실버테일순차실행(max동시1). 새2그룹12조건PASS/FAIL0/미도달0/exit0, 추가실행0. 첫원본render ordinal1과ACK전전사6draw·실버테일7draw 모두해당rig/이름/dropdown일치. host own-data ACK3/childCharacterLinked=true(initial-display-only), runtime top-level false는그대로. 각GL13program LINKtrue/getError0/contextLostfalse/canvas1036×714; source-owned timer1→close0/finaldispose0, 전체native timerqueueUNKNOWN. source17exact/P·G detachedfixture·storage{}불변/오류·404·외부·변경요청0. root·helper PNG2직접확인: 초기표시UI PASS/전체맵RETOUCH. final9034/3fa1faad6b5dda2c3ec8609f6e2d3397bbda76d908676717fe9d67bf8525546c; summary22474/41fd6c7a8d284404bff1f51fa24611d3fbd96871b1a1108df2ca9fc901ee739a; raw388349/58988832f471a8c4f5567054fc3d0b4f1428312cf59ff0892517d5daf8b743ac; 전사PNG859610/41cd4c7bdca71d80b5681de872d71933404b992745a1986c26b228fc485e16cb·실버테일PNG861337/d87d4917a92cbfc7a977798d1beeb902d6c59a386179e81c27a5201682acd995. actualgame.html/native6/fullplayer/save/audio/physicalscanout인수0·oldGUI/CPU합산0 |
| 추가 새 실제 rig 소비자 검수 | 실제character-rigs factory3(전사2독립/실버테일1)→update72호출→private setFrame/nativeThree UV matrix/geometry attributes·weightChecks 소비를신규Node1에서검수: 새7그룹93조건PASS/FAIL0/미도달0/exit0. attack frame8/phase1뒤idle·독립소유자·dispose각1, nativeTexture35의disposeevent35 확인. PNG26/metadata2exact. Image는PNG IHDR크기기반MOCK이며실RGBAdecode·GPUupload·world실행·actualGUI·본편native6·청취·save인수0. 새visual NOT ASSESSED/전체RETOUCH. 준비단계Path.write_text newline API오류1은제품도달0/Node0, root승인외부파일쓰기API만보정뒤최초제품Node1; 제품실패재시도0. final5888/39d2e931065fc9df34ab3f6f36e4687cb3ca4f85699952b8cc2ea43a5532ed04, unit16128/1258909d0e4a6686c9433e37040ae743199f7292c6bf6abedc6706a3e5454da7, raw771/2cd6bfc0430edd2a3b59ed1a6b18eabc0559e9077e0eaacae48f7f05a3be8aec. source수정권고0 |
| docs·정상보존 | 신규code후 전체rg28경로370행/raw433377/f1d85f951cb7068549f12a946c996b6db9ebfee86f65257a16eb564aecd278bc. root 관련정본24개를현재계약/범위로동기화·모든path disposition. ownerLOG와다른출시후보/맵geometry 이력4경로는원값유지. fullbyte백업→fullprefix/EOF1/GFM→정확소유code2+docs24 정상commit/push·remoteexact은 외부 main-character-seed-consumer/remote-preservation-receipt.json에서확인. foreign68·ownerSTATELOG4·heldWOLF1 소유외/stage0 |

§23 MAP PRODUCTION REPORT: MASTER=기존본편두class의지옥의틈초기표시연결. fullguide607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b/SSOT_INDEX·stageLOCK의기존정확full읽기근거적용. LARGE OUTER→MEDIUM→GROUND→PLAYABLE→LANDMARK→DETAIL은기존PNG/scene/nav/geometry/카메라/랜드마크/기존23보존·새배치0. CAMERA QA=새actualhost/child초기render표시범위만. TECH QA=최초sourceFAIL29도달/한정4x10과actualChrome별도영수증. VISUAL VERDICT: RETOUCH(전체맵), 새class 표시검수는전체맵선명도·해부학모션·본편native6·청취·실보상save·A급완성의인수가아님. 원화1254→8000확대/기본legacy1024mask흐림미해결.

| 새 전문 원자료·독립 후속 | 원총괄 보존·채택 경계 |
|---|---|
| ANIM motion UV 공식 raw | endda8430aa-df06-47d5-b729-ad0394de1d2e@2026-10-06T22:44:15.704Z, raw6359/a887281013d8afc85125ae4730bc5d4bb7d02fb5a826b3355b2e327b9a992972; 외부7081/4694e403a03d0e17b772e997bf10a6b08b4988cf6bf3a7b955eff4345580d2d5. 전문보고stdin8PASS는actualcharacterRigFrame+복사공식만·actualupdate/setFrame/GPU未호출. root readonly12195/8f2d1d396abab42518a3847e612025df6185b5e60a2237bcab724eb8f8b6a838에서신규source결함확정0, 실버테일walk가변crop/anchor→geometry실소비를새검수범위로분리 |
| MAP host/modal 원자료 | end70832dd3-592c-47c1-98d8-0f199c955fa5, raw4935/9f220fec67181b840ade1c00f92a470f39ebb013ba4bc13f6ef1624949f13898; 보존5665/c4a05aa52540a0201ee6a1e8751f9819aa5d0eadaf7242b9905275436ba525a6. 새공식memory후보미채택, root실행·실화면·본편인수0 |
| ANIM dialogue owner 원자료 | end53b09739-bd8c-479f-b0a4-6838041a4aec, raw6240/9b9ad0f617ddca16b5f459d4158d23de3a89b2553cca5dd83f19e845f67cfaa9; 보존6895/7f55fb6f0a265ec35d7a7b550ca629fc3a8f048d5bcaf82e433df6bfe05e1cf7. 새공식memory후보미채택, root실행·실화면·본편인수0 |
| 새 owner 업무 | Claude8 기존owner가 MAP CH1-RIFT-SCENE-OBJECT-ASSET-INTEGRITY-20261007-MAP-MEMORY와 QA CH1-LOBBY-CHARACTER-VISIBLE-BOUNDS-20261007-QA-MEMORY를각sent1/peer1/firstsource1/end0·busy로기록. ANIM CH1-RIFT-VFX-ARBITRATED-ATTACK-EMISSION-20261007-ANIMVFX-MEMORY도sent1/peer1/Read1/firstsource1/end0·busy. 수신/첫source를완료로계산0·전원가동과장0. MAP추가권한질문은이미승인된기존팀독립작업에대한전문자가질문이며실제autoapproval거절로오인0, 기존승인범위업무계속. 새raw의의미검토·후속은기존owner에게만1회인계 |
| 계속운영/보호 | 기존Claude8/Codex7만전문송신소유·root직접/중복송신0·새팀/세션0. 거절된Codex송신/ART선택/WOLF쓰기목적재시도·도구/경로/호스트/권한우회0, MAP/STORY외부쓰기·삭제피해UNKNOWN유지. WOLF거절뒤같은산출물correctedpathwrite 이력보존·추가접근/검수/실행/채택/Git0. 타인WIP/사용자save/보호2_3·Q전용magicblackBean(E불가)·어택티켓금지보존. 실제NUL80부터완료소유checkpoint/100전새산출중단. 계정주간사용률약15pp/day 목표는공유관측이며이채팅정확일별token보장·토큰태우기0. 기존단일root연속heartbeat/다른paused자동화·아침메일재개0 |
