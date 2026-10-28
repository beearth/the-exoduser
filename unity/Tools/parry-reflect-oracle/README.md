# 패링 반사(청콩) oracle

적 탄을 E 쳐내기·Q 패링으로 되돌려 보내는 웹 규칙(`Runtime/Core/ParryReflect.cs`)을 **원본 `game.html` 문장을 Node VM에서 그대로 실행한 결과**와 대조한다. 손으로 옮긴 기대값은 없다(`oracle.json`의 모든 `out`은 `export.cjs`가 만든다). Unity Player에는 들어가지 않는 개발 도구다. 도구 뼈대(앵커 문자열 추출·`grid()`·`load()`)는 `../dash-parry-oracle/export.cjs`와 같다.

```powershell
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/parry-reflect-oracle/export.cjs --source <game.html> --out unity/Tools/parry-reflect-oracle/oracle.json
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/parry-reflect-oracle/run.cjs --project <unity 폴더> --out <runs 폴더> --label <이름>      # .NET 8로 Core 대조 (불일치 0이어야 통과)
```

- 만든 때의 웹 원본: `origin/main`의 `game.html`(`git show origin/main:game.html`). `dash-parry-oracle`의 `export.cjs`는 이 원본에서 다른 섹션이 깨지므로(웹이 `_canMobility`를 쓰기 시작) 이 도구를 따로 두었다.
- 대조 C#: `Runtime/Core/{Js,ParryRules,ParryReflect}.cs` (UnityEngine 의존 없음).

| 섹션 | 실행한 원문 | 검사 |
|---|---|---|
| `reflect` | 투사체 루프의 패링 분기 사슬 `const _qZone=` … 일반탄 Q 마법 패링(game.html 35064-35248)을 `_pHit`·`continue`까지 그대로. 앞의 반경 문장(`_pCollR`~`_rbDeflR`, 35033-35049)과 `pParryProjDmg`·`_projectileParryClass` 등 실제 함수 사용 | 투사체 종류 26종 × 플레이어 상태·거리·표적·무적·합체 격자 3000건: 반사 여부, 반사된 탄의 속도·피해·수명·청콩 플래그·폭발 반경, `doParry` 인자(피해·위치·적색/무지개/태그·자원 배율), `parryBank`, 얼음 폭발, 탄 소멸·`_pHit`·분기 이탈 |
| `reflectHoming` | 청콩 유도 블록(34978-34992) | 속도·표적 거리·`sp` 격자 90건: 선회 후 속도 |
| `reflectBlast` | 반사탄이 적에 닿는 블록(35286-35320) 전체 | 탄·적 배치 1800건: 접촉 판정, 폭발 반경·낙하 피해, 넉백, 독 수치(상태 이상은 Core에 아직 없어 값만 비교), 쿨다운 |

범위 밖(의도): 소리·입자·떠오르는 글자, 패링 수업(`_lessonShot`), 오입력·무지개·화이트/다크볼·회전 흡수의 **페널티 효과**(탄이 소모된다는 사실만 비교), 반사 폭탄 가지, 유니크 관통, 대형 에너지탄 교체(`BigEnergyParry`로 보고만).
