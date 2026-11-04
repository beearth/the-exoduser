# 패링 반사(청콩) oracle

적 탄을 E 쳐내기·Q 패링으로 되돌려 보내는 웹 규칙(`Runtime/Core/ParryReflect.cs`)을 **원본 `game.html` 문장을 Node VM에서 그대로 실행한 결과**와 대조한다. 손으로 옮긴 기대값은 없다(`oracle.json`의 모든 `out`은 `export.cjs`가 만든다). Unity Player에는 들어가지 않는 개발 도구다. 도구 뼈대(앵커 문자열 추출·`grid()`·`load()`)는 `../dash-parry-oracle/export.cjs`와 같다.

```powershell
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/parry-reflect-oracle/export.cjs --source <game.html> --out unity/Tools/parry-reflect-oracle/oracle.json
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/parry-reflect-oracle/run.cjs --project <unity 폴더> --out <runs 폴더> --label <이름>      # .NET 8로 Core 대조 (불일치 0이어야 통과)
```

- 만든 때의 웹 원본: `origin/main`의 `game.html`(`git show origin/main:game.html`). `dash-parry-oracle`의 `export.cjs`는 이 원본에서 다른 섹션이 깨지므로(웹이 `_canMobility`를 쓰기 시작) 이 도구를 따로 두었다.
- 대조 C#: `Runtime/Core/**` 전체를 .NET 8로 컴파일(UnityEngine 의존 없음). 규칙 섹션은 `{Js,ParryRules,ParryReflect}.cs`, `anglerRuntime`·`parryShot`은 `Simulation`·`DruidBoss`(`Simulation.ParryShot.cs`)를 돌린다.

| 섹션 | 실행한 원문 | 검사 |
|---|---|---|
| `reflect` | 투사체 루프의 패링 분기 사슬 `const _qZone=` … 일반탄 Q 마법 패링(game.html 35064-35248)을 `_pHit`·`continue`까지 그대로. 앞의 반경 문장(`_pCollR`~`_rbDeflR`, 35033-35049)과 `pParryProjDmg`·`_projectileParryClass` 등 실제 함수 사용 | 투사체 종류 26종 × 플레이어 상태·거리·표적·무적·합체 격자 3000건: 반사 여부, 반사된 탄의 속도·피해·수명·청콩 플래그·폭발 반경, `doParry` 인자(피해·위치·적색/무지개/태그·자원 배율), `parryBank`, 얼음 폭발, 탄 소멸·`_pHit`·분기 이탈 |
| `reflectHoming` | 청콩 유도 블록(34978-34992) | 속도·표적 거리·`sp` 격자 90건: 선회 후 속도 |
| `reflectBlast` | 반사탄이 적에 닿는 블록(35286-35320) 전체 | 탄·적 배치 1800건: 접촉 판정, 폭발 반경·낙하 피해, 넉백, 독 수치(상태 이상은 Core에 아직 없어 값만 비교), 쿨다운 |
| `anglerEnergy` | 앵글러 물 에너지탄(`fbEnergy`) 터미널: `_isBigEnergy` 반경 문장 + `const _qZone=`…`// ══ 빨간콩탄:` 원문, `_resolveBigEnergyParry`·`_splitParriedBigEnergy`·`_startBigEnergyPlayerSlide` 실제 함수 | 상태 6 × 거리 21종(19~501px) × 패링창 2 × 해제 반경 0/300/500 × 무적 2 = 1,512건: 분류, Q 터미널, 반사 피해·자원 ×10·태그, 5발(위치·속도·피해·속성·r·사거리), 접촉, 폭발(`_fbEnergyBoom`) 수, 회수 수 |
| `anglerRuntime` | (Simulation 직접) | 실제 `Simulation`+`DruidBoss`: Q 분열 5발·1회 지급, E/무방비 비반사, 접촉 피해·슬라이드 100·폭발 1회, 무적·돌진 무피해, 보호막 넉백 5 유지, 해제 반경 500·거리 450 Q 분열(400px 필터 없음), 벽 접촉, 실제 적 타격, 다른 탄 분류 불변, 실제 생성기 `fbEnergy` |
| `parryShot` | 분열탄 5발을 웹 플레이어 투사체 루프 `{let w=0;for(let i=0;i<pProjs.length;i++){`…(35624-36078) 그대로, 풀(`_mkPProj`/`_resetPProj`/`_getPProj`+초기 120개)·`elMul`·`_fmXY`/`_fmCanHit`/`_fmApply`·`_parryMagicFieldTarget`·`_hurtFieldMobs`·`_parryMagicHitFx` 실제 함수 | 80시나리오 × 최대 140프레임: 탄(위치·속도·피해·거리·반사 수·관통 수·반사 쿨·맞힌 집합·속성·관통률), 모든 `hurtE`(프레임·적·피해·본타/스플래시), 적 넉백·기절·생존, 필드보스 HP·피격 쿨, 적중 임팩트 수. 사거리 끝 프레임(7.5×120=900 경계)은 탄별 비교 대신 다음 프레임 안 소멸만 확인. 웹 스플래시 링 파티클의 `Math.random` 24회(표현)는 C# 훅이 같은 수만큼 건너뛴다 |

범위 밖(의도): 소리·입자·떠오르는 글자, 패링 수업(`_lessonShot`), 오입력·무지개·화이트/다크볼·회전 흡수의 **페널티 효과**(탄이 소모된다는 사실만 비교), 반사 폭탄 가지, 유니크 관통, 화마귀 `fdEnergy`(Unity Core에 없음). 분열탄의 웹과 남는 차이는 docs/8.0몬스터디자인/몬스터_공격시스템.md "대형 에너지탄 반사 소유권" 절.
