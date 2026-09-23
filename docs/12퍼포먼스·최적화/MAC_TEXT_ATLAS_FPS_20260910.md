> **후속 변경:** 이 문서는 글자 캐시만 고친 시점의 측정이다. 이후 20FPS 재제보로 Mac 기본 렌더러도 수정했다. [현재 실행 정책](MAC_DEFAULT_WEBGPU_FPS_20260910.md).

# Mac 로컬 프레임 저하: 숫자 font-weight에 의한 텍스트 캐시 초기화

2026-09-10 사용자: localhost:3333 실행 성공 후 MacBook에서 FPS가 10대로 하락한다고 제보. 현재 Mac의 별도 Chrome 진단 프로필에서 조사하고 로컬 game.html을 수정했다. GitHub push/서비스 배포는 하지 않았다.

## 확인한 코드 결함

| 항목 | 수정 전 | 수정 후 |
|---|---|---|
| `_getAtlasTxt` 크기 해석 | `parseFloat(font)||14` | CSS shorthand에서 px 크기 토큰 추출; 없으면14 |
| 실제 데미지 폰트 `900 22px "Noto Sans KR"` | 굵기900을 크기로 오독 | 크기22 |
| 셀 높이 `ceil(fs*1.6)+8` | 1448px | 44px |
| 아틀라스 | 2048×512px | 동일 |
| 캐시 초기화 | 1448>512이므로 같은 전투 문구를 그릴 때마다 전체 clear/UV 캐시 삭제 | 정상 크기로 배치하고 동일 font/text/color는 재사용 |
| `bold 32px` | parseFloat 실패로14px 취급, 작은 셀에 글자 잘릴 가능성 | 32px, 셀 높이60px |
| 업로드 경로 | 캐시 miss마다 `_glVer` 증가 → WebGL2 texImage2D 또는 WebGPU copyExternalImageToTexture | 실제 새로운 글자가 추가될 때만 버전 증가 |

실기 추적에서 `Q!`, `⚡쉴드 파괴!`, 데미지 숫자가 같은 문자열·폰트·색인데 반복 miss했다. 수정 전 WebGPU 실행 중 3초에3792회 miss를 기록했다. 공통 코드 결함이므로 Windows에도 존재한다. 이번 세션은 Windows 실측을 하지 않았으며, Mac만의 하드웨어 결함이나 과거 BGRA swizzle 오류의 재발로 단정하지 않는다. 현재 Chrome stderr에서 그 swizzle 오류는 관측하지 못했다.

## Mac 실기 측정

환경: Apple M5 Pro, macOS26.6.2, Chrome152.0.7977.83, headed 실제 GPU. WebGL2 renderer=`ANGLE (Apple, ANGLE Metal Renderer: Apple M5 Pro, Unspecified Version)`. WebGPU도 실제 초기화 성공과 Metal adapter를 확인했다. viewport1440×900, deviceScaleFactor2, 게임 캔버스1440×900, high/resScale100/fpsCap0.

`game.html?bosstest=3&slot=mac-diagnostic&perf=1&webgpu=0|1`에서 초기 로딩 후 보스 `_btFrozen=true`로 설정하고 각10초 rAF 간격을 수집했다. 기존 잔류 장판·데미지 표시는 계속 실행되므로 완전히 같은 프레임을 재생하는 벤치마크는 아니다. document.hidden=false/G.on=true 확인. 원래 사용자의 창·세이브와 별도 프로필이며 /api 요청은 부팅 중 fixture로 처리했고 별도 진단 슬롯 이름을 사용했다.

| 경로 | 글자 수정 | FPS 표시 | rAF 평균 FPS | 표시 FPS 범위 | rAF p95(ms) | WebGL texImage2D/10초 |
|---|---|---|---|---|---|---|
| WebGL2 | 전 | ON | 30.70 | 21~44 | 50.0 | 7048 |
| WebGL2 | 전 | OFF | 50.94 | 35~59 | 26.0 | 5292 |
| WebGL2 | 후 | OFF | 55.70 | 43~60 | 25.0 | 835 |
| WebGL2 | 후 | ON | 55.35 | 52~67 | 25.0 | 1025 |
| WebGPU | 전 | OFF | 91.50 | 48~120 | 24.9 | 미계측 |
| WebGPU | 후 | OFF | 120.00 | 119~120 | 9.3 | 미계측 |

WebGPU 수정 전후는 페이지를 유지하고 함수만 교체했다. WebGL2 수정 후는 새 로드였다. WebGL2 ATMOS는 기존 자동 품질 조절로1, WebGPU는2였으므로 두 백엔드의 완전한 동일 품질 비교로 해석하지 않는다. 수정 전 WebGL2 FPS 표시 ON에서는 ATMOS2로 설정했으나 측정 종료 시1이었다. 초기 로딩 hitch는 별도이며 지속 프레임 표와 구분한다. JavaScript update+draw 평균은 WebGL2 ON에서 약1.73→1.21ms였고 rAF는 훨씬 느렸으므로 CPU 시간만으로 GPU/합성 성능을 판단할 수 없다.

사용자 제보의10대까지는 이 통제되지 않은 보스 장면에서 지속 재현하지 못했다. 캐시 초기화 결함과 그 수정 효과는 확인했지만 사용자 실제 장면·Safari·장시간 전투·전체 스테이지 해결을 보장하지 않는다. 기본 WebGL2는 수정 후에도 WebGPU보다 느리다. 렌더러 선택 계약은 유지: 기본/0은 WebGL2, 명시적1만 WebGPU. 사용자는 현재 게임 주소의 다른 쿼리/slot을 유지하며 `webgpu=1`로 비교 가능하다.

## 검증과 적용

| 항목 | 결과 |
|---|---|
| `test/textAtlasFontSize.test.js` | 전6개 중5개 실패 → 후6개 PASS. 숫자 굵기·bold·italic/소수 px/line-height·일반 px,120프레임 반복 캐시 검사 |
| 120프레임 회귀 | 6종 font/text/color를 반복했을 때 초기화480→0회, 수정 후 raster/version 갱신6회 |
| 인접 회귀 | webglDynamicTexReuse3 + rendererOptIn11 PASS. 신규 포함 총20 PASS |
| 실제 화면 | 수정 후 WebGL2 화면에서 전투 글자와 HUD 확인. 정지 이미지로 깜빡임 해결을 판정하지 않음 |
| 백업 | `tmp/mac-fps-20260910/game.before.html` |
| 변경 범위 | `_getAtlasTxt` px 파싱. 맵·카메라·조명·전투 수치·품질 기본값·렌더러 정책 무변경 |
| 적용 | localhost의 game.html 새로고침 필요. 기존 탭은 이전 함수를 계속 실행함 |

실행: `node --test test/textAtlasFontSize.test.js test/webglDynamicTexReuse.test.js test/rendererOptIn.test.js`.
