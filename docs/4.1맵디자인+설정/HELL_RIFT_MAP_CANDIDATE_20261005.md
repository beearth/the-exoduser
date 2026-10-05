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
