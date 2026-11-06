# 웹 게임 크기 관례 비교 (300MB 목표 근거)

확인일 2026-11-06. 공개 페이지에서 읽히는 값만 적었다. 직접 잰 값은 없다. 조사는 서브에이전트가 했고, [원문] 값도 페이지 요약 도구를 거친 인용이라 제출 문서에 쓰기 전에 링크에서 다시 확인해야 한다.

**요약: 300MB는 관례적 목표가 아니다.** 수치를 공개한 포털은 초기 다운로드를 30~50MB로, 총량을 250~500MB로 제한한다. 300MB는 500MB 상한 안에는 들지만 250MB 상한은 넘고, 한 번에 받는다면 초기 상한을 크게 넘는다. 이 규정들은 포털 게시 조건이며 Chroma 출품 규칙이 아니다. 확인한 Chroma 페이지 3곳에서는 크기 제한을 찾지 못했다.

| 대상 | 값 | 태그 | 출처 |
|---|---|---|---|
| CrazyGames | 초기 ≤50MB, 모바일 홈 ≤20MB, 총 ≤250MB, 게임플레이 도달 ≤20초(외부 호스팅 시 QA) | [원문] | https://docs.crazygames.com/requirements/technical/ |
| Jogos.com | 초기 PC ≤50MB·모바일 ≤25MB, 총 PC ≤500MB·모바일 ≤250MB | [원문] | https://docs.jogos.com/guide/requirements/technical.html |
| YouTube Playables | 초기 <30MiB(권장 <15MiB), 총 <250MiB, 5초 이내 로딩 권장 | [원문] | https://developers.google.com/youtube/gaming/playables/certification/requirements_stability |
| Poki | MB 수치 없음. 로딩이 10초를 넘으면 이탈 경향 | [원문] | https://developers.poki.com/guide/requirements-quality |
| itch.io | 압축 해제 총 500MB, 단일 파일 200MB, 파일 1,000개, 부적절하면 문의 안내 | [원문] | https://itch.io/docs/creators/html5 |
| Unity WebGL Publisher | 압축 빌드 ≤500MB | [원문] | https://docs.unity3d.com/Packages/com.unity.connect.share@2.0/manual/index.html |
| Unity 6 포럼 빌드 보고 | Brotli .data 130MB, .wasm 8.54MB. 25Mbit/s에서 다운로드만 30초 이상(개인 보고) | [원문] | https://discussions.unity.com/t/unity6-webgl-initial-loading-is-very-slow/1553286 |

단위는 각 출처의 표기를 따랐다. itch.io는 압축 해제 기준이라 다른 행과 기준이 다르다. **itch.io 기준이면 우리 빌드의 압축 해제 크기가 비교 대상이고, 단일 파일 200MB 제한은 data 파일 한 덩어리 구조에 걸린다(추론).**

## 표가 말하지 않는 것

- 250~400MB로 출시된 3D Unity 브라우저 게임 사례는 찾지 못했다. 300MB에서의 이탈률·실제 로드 시간 근거도 없다.
- 단순 계산(압축 해제 제외, 25Mbit/s): 300MB 약 96초, 687MB 약 220초.
- 포털 규정은 총량과 초기 다운로드를 따로 제한한다. 따라서 총량보다 첫 묶음을 얼마로 나누느냐가 더 직접적인 비교 대상이다. 분할은 런타임 변경(Addressables 등)이라 이 문서에서 평가하지 않았다.

## 확인하지 못한 것

- Chroma: 제출 사이트(HTTP 429), 나머지 부문 페이지. 확인한 곳: https://www.chromaawards.com/prizes/game-arcade-party , https://www.chromaawards.com/prizes/game-experimental-open-format , https://www.chromaawards.com/prizes/game-meshy-game-of-the-year-award . "제한 없음"이 아니라 "찾지 못함"이다.
- Newgrounds 공식 위키(HTTP 403), Poki 8MB(제3자 가이드뿐), GameDistribution 게시 규정.
