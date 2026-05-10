# shQuery 버퍼 오염 방지 가이드

## 문제 요약

`shQuery()`는 `_shBufs[_shBufI]` 배열의 **참조**를 반환한다. 같은 프레임 내에서 `_shBufI`가 변하지 않으면, 다음 `shQuery()` 호출이 **이전 결과를 덮어쓴다**.

## 위험 패턴

```js
// ⚠ 위험: ne가 hurtE 내부의 shQuery에 의해 파괴됨
const ne = shQuery(x, y, r);
for (let i = 0; i < ne.length; i++) {
    hurtE(ne[i], dmg, ...);  // hurtE 내부에서 shQuery 재호출 → ne 파괴!
}
```

### hurtE 내부의 shQuery 호출 위치 (2026-05-02 기준)

| 줄 | 어픽스/기능 | 조건 | shQuery 호출 |
|---|---|---|---|
| 30148 | M22 동료불사 | `e.mods && !e.ib` | `shQuery(e.x,e.y,120)` |
| 30417 | lightChain (연쇄번개) | `_eqAffix('lightChain')>0` | `shQuery(e.x,e.y,120)` |
| 30421 | chainTarget (연쇄타격) | `_eqAffix('chainTarget')>0` | `shQuery(e.x,e.y,100)` |
| 30463 | staggerExplosion (경직폭발) | `_eqAffix('staggerExplosion')>0` | `shQuery(e.x,e.y,100)` |
| 30685 | poisonBurst (독폭발) | `_eqAffix('poisonBurst')>0` | `shQuery(e.x,e.y,_pbR)` |
| 30699 | 보스 사망 폭발 | `e.ib && e.hp<=0` | `shQuery(e.x,e.y,blR)` |

**주의**: `e.mods=[]`(빈 배열)은 JS에서 **truthy**이므로 M22 분기에 항상 진입한다. `e.mods.includes('M22')`가 false여서 실제 감소는 없지만, **shQuery 호출 자체는 실행되어 버퍼를 오염시킨다.**

→ 2026-05-02 시점에서 `e.mods`는 매 프레임 `[]`로 초기화되므로(23008번), M22 체크의 shQuery가 매번 실행됨.

## 안전 패턴

### 방법 1: 결과 복사 (권장 — 단순하고 확실)
```js
const _raw = shQuery(x, y, r);
const ne = [];
for (let i = 0; i < _raw.length; i++) ne[i] = _raw[i];
// 이제 ne는 독립 배열, hurtE가 shQuery를 호출해도 안전
for (let i = 0; i < ne.length; i++) {
    hurtE(ne[i], dmg, ...);
}
```

### 방법 2: _shBufI 증가 (기존 사용 사례: 31096번)
```js
const ne = shQuery(x, y, r);
_shBufI++;  // 다음 shQuery가 다른 버퍼를 사용하도록
for (let i = 0; i < ne.length; i++) {
    hurtE(ne[i], dmg, ...);
}
// 주의: _shBufI는 최대 7 (8개 버퍼). 중첩 3단 이상이면 위험
```

### 방법 3: shQuery 미사용 (직접 ens 순회)
```js
for (let i = 0; i < ens.length; i++) {
    const e = ens[i];
    if (!e.alive) continue;
    if (dst(e.x, e.y, bx, by) >= boomR) continue;
    hurtE(e, dmg, ...);
}
// shQuery 없이 ens 직접 순회 → 버퍼 오염 불가
// 단점: O(n) 전수 탐색 (공간해싱 이점 없음)
```

## 해결 상태 (2026-05-03)

### 근본 수정: hurtE 진입 시 `_shBufI++`

hurtE 함수 진입 직후 `_shBufI++`를 추가하여, hurtE 내부의 모든 shQuery 호출이 **호출자와 다른 버퍼 슬롯**을 사용하도록 수정. 이로써 외부 30곳+ AoE 호출이 **전부 자동으로 안전**해짐.

- `_shBufI`는 update() 시작 시 0으로 리셋 (감소 불필요)
- 8개 버퍼 풀 + `_shBufI<8?_shBufI:7` 가드 → 오버플로우 안전
- 기존 31097번의 수동 `_shBufI++`는 중복이므로 제거됨

| 위치 | 상태 |
|---|---|
| hurtE 진입부 (30143) | ✅ `_shBufI++` 추가 — 근본 해결 |
| `_fireExsBoom` (32777) | ✅ 배열 복사 유지 (이중 안전) |
| 31097 폭발 판정 | ✅ 수동 `_shBufI++` 제거 (hurtE에서 자동 처리) |
| 외부 AoE 30곳+ | ✅ hurtE 보호로 전부 자동 안전 |

## eShield 관련 주의

> **삭제됨 (2026-05-10)**: eShield 이원 방어 시스템 전면 제거. 모든 데미지가 HP에 직행. eShield=0 고정.
