# CH1 바닥 녹색 노이즈 버그 리포트
> 정리일: 2026-04-03

## 증상
- CH1 바닥 전역에 연두색 원형 노이즈가 반복적으로 찍혀 보였다.
- 바닥 타일이 사라졌거나, 독성 점액/광원 데칼이 강제로 덮인 것처럼 보였다.
- 패턴이 화면 전체에 규칙적으로 퍼져 있어서 단일 에셋 손상보다는 렌더 패스 문제에 가까웠다.

## 실제 원인
- 원인은 에셋 파일이 아니라 `buildMapCache()` 내부의 `Pass 4: 분위기 광원`이었다.
- 이 루프가 `map===0 || map===4 || map===5` 바닥 셀마다 확률적으로 radial gradient를 찍고 있었다.
- 색상은 CH1 테마 액센트 `_MTHEME[0].ac === '#66ee55'`를 사용했다.
- 그래서 `gt_soil` 바닥 타일이나 `wall_edge_tile.png`를 복구해도 녹색 글로우는 계속 남았다.

## 문제 코드 성격
```js
if(R()<.06){
  const ac=_hexRgb(th.ac);
  const rad=20+R()*25;
  const g=c.createRadialGradient(...);
  g.addColorStop(0, `rgba(${ac.r},${ac.g},${ac.b},.06)`);
  g.addColorStop(1, `rgba(${ac.r},${ac.g},${ac.b},0)`);
  c.fillStyle=g;
  c.fillRect(...);
}
```

## 오진했던 후보
- `gt_soil` 바닥 타일 누락 또는 캐시 문제
- `wall_edge_tile.png` 경계 에셋 누락
- `tile=5` 경계 룬 바닥 렌더
- `Pass 5` 장식의 파란 세로 띠
- `Pass 5` 장식의 녹색 새싹/이끼

## 최종 수정
- `game.html`에서 `Pass 4` 분위기 광원 블록을 제거했다.
- CH1 기본 바닥은 `gt_soil` 타일링과 벽-바닥 경계 에셋만 남긴다.
- 회귀 테스트 `test/ch1FloorSoilRestore.test.js`에 `CH1 floor does not paint green ambient radial glows` 케이스를 추가했다.

## 관련 코드 위치
- `game.html`
  - `_MTHEME[0]` CH1 액센트색 정의
  - `gt_soil` CH1 바닥 텍스처 로드
  - `buildMapCache()` non-stream 바닥/벽 렌더
- `test/ch1FloorSoilRestore.test.js`
  - CH1 바닥 녹색 ambient glow 금지 회귀 테스트

## 재발 방지 규칙
1. CH1 기본 바닥에는 명시 승인 없는 procedural glow를 추가하지 않는다.
2. 바닥 시각효과를 넣을 때는 에셋 레이어인지 코드 생성 오버레이인지 먼저 문서에 기록한다.
3. 바닥 렌더 패스를 추가할 때는 제거 가능한 토글이나 stage 제한을 같이 둔다.
4. `buildMapCache()` 바닥 경로를 바꾸면 회귀 테스트를 같이 추가한다.
