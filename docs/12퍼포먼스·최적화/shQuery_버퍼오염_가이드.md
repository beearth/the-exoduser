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

## 현재 위험 지점 목록 (2026-05-02 전수조사)

shQuery 결과를 들고 hurtE를 루프에서 호출하는 곳 **30곳+** 확인. 주요 위험:

| 줄 | 기능 | 상태 |
|---|---|---|
| 32777 | `_fireExsBoom` (허수아비 폭발) | ✅ 수정됨 (배열 복사) |
| 31096 | 폭발 판정 | ✅ 수정됨 (`_shBufI++`) |
| 23549 | 폭탄 AoE (bomb proj) | ⚠ 미수정 |
| 23618 | 폭탄 AoE (bomb dead) | ⚠ 미수정 |
| 23622 | 폭탄 AoE (bomb dead #2) | ⚠ 미수정 |
| 24726 | 블래스트샷 폭발 | ⚠ 미수정 |
| 25103 | 용암소환 AoE | ⚠ 미수정 |
| 30417 | lightChain (hurtE 내부) | ⚠ 재귀 오염원 |
| 30421 | chainTarget (hurtE 내부) | ⚠ 재귀 오염원 |
| 30463 | staggerExplosion (hurtE 내부) | ⚠ 재귀 오염원 |

### 근본 해결 방안 (TODO)

hurtE 내부의 shQuery 호출들(30417, 30421, 30463)이 **모든 AoE의 오염원**이므로, 이 3곳을 수정하면 외부 30곳이 전부 안전해진다.

방법: hurtE 진입 시 `_shBufI++`, 리턴 전 `_shBufI--` (스택 방식). 또는 hurtE 내부 shQuery를 별도 복사 방식으로 전환.

## eShield 관련 주의

- 모든 적의 `eShield = maxHP` (이원 방어 시스템)
- magic 판정이면 쉴드 전액 차감, HP에 도달하려면 쉴드를 먼저 0으로 만들어야 함
- HP바는 `e.hp`만 표시 → 쉴드만 깎이면 "데미지 0"으로 보임
- **AoE 폭발처럼 한 방에 큰 데미지를 넣어야 하는 스킬**은 `e.eShield=0` (쉴드 분쇄)을 먼저 실행해야 체감됨
- 일반 공격은 틱 단위로 쉴드→HP 순차 깎기라 문제없음
