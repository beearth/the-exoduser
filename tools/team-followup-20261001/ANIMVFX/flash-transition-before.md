# flash-transition-before.md — 원파일 before 보존 (game.html 미수정 증빙)

game.html SHA-256(before/현재, 미수정): `7631f5a083672124624e0b8dc22b0716d10c8815dbb1e6aee98a5e2e51299993`

## _hitFlash 생애 경로 원본 (읽기 전용 추출)

- game.html:33149  `if(e._hitFlash>0)e._hitFlash=Math.max(0,e._hitFlash-sp); // 피격 플래시 수명: 고정스텝 update 감쇠(주사율 독립, 60fps 6틱≈100ms). slowmo/hitstop은 sp로 존중. render는 그리기만`
- game.html:50888  `if(e._hitFlash)e._hitFlash=0;`

## 동일객체 부활 전이 3곳 (현재 `_hitFlash` 소거 없음)

- game.html:33205  (보스 부활)  `e.hp=~~(e.mhp*.5);e.eShield=0;e.eShieldMax=0;e.s='recover';e.st2=60;e.stunned=0;e.kb={x:0,y:0};`
- game.html:16219  (드루이드 피날레 부활)  `e.alive=true;e.hp=Math.max(1,Math.floor(e.mhp*.35));e.eShield=0;e.eShieldMax=0;`
- game.html:37558  (주술사 시체 부활(etype9))  `corpse.alive=true;corpse.hp=~~(corpse.mhp*.5);corpse.eShield=0;corpse.eShieldMax=0;corpse.s='recover';corpse.st2=60;corpse.stunned=0;corpse.poise=corpse.maxPoise;corpse.reviveIframes=0;`
