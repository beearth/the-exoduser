# ITEM-strFlat-generated-belt-melee-ref-1552 — 2026-10-03
결과: 실제 소스 결함 재현, 최소 후보 정상 대조 PASS. productionApplied=false, nativeTested=false.
실행 29f878 exit0: 2파일×2실제 접두사(strFlat/dexFlat)=4그룹, 그룹당 원본/후보 비교. 이전 완료 테스트 반복0.
생성은 normal etype0 descriptor→whole rollDrop→mkItem→rollAffixes, 실제 R 장비 선택→pickupItem→_invBagRightClick→equipItem→applyStats/recalcSt→meleeRef.
교체 전 control-belt는 easy의 빈 슬롯 자동장착을 피하는 합법 장착 대조. 스탯0, 강화0, 결정없음. 기본무기 atk20.
strFlat 실제 생성: 고급 rarity1, tier0, belt, strFlat value5 + fireRes .08, bStr9, bGrit9, bonusHp6.
원본: STR15→29, HP380→465, hpR .08→.108, meleeRef50→59 (기본 bStr9만 반영).
후보: STR/HP/hpR 동일, meleeRef50→64 (strFlat5 반영).
dexFlat 실제 생성 정상 대조: 두파일 모두 meleeRef50→59 원본=후보; 생성 객체·RNG순서·부수효과·mats10000 동일. dexFlat의 다른 공격속도 정책은 검증/수정하지 않음.
최소 패치: meleeRef STR 항에 +~~_eqAffix('strFlat') 추가. 캐시를 P._effStats로 교체하거나 int/dex/allStat 범위를 넓히지 않음.
원본SHA game e462f2345682856d24bb416a17aec763281a8dceb02f21af565db189992353ea; easy 68fa8e17d379fdf7e9da20b153d874e2ac74544d790397b4d36edbcc1207f390.
후보SHA game 9fad68cc113d653b93658f5c66cd4fff7dd02e4c6c110241c40121c27eaf9bcc; easy f78e0571ebeff13fad29b2b639a27d26d544bc2b34b6f43853a986afd23a3fc2.
343de3 exit0: 후보 전체 인라인 스크립트12개 Acorn parse, importmap JSON2개 PASS. 최초 syntax fixture가 module을 거부한 오류233f54는 수리, source문법 오류아님.
실제 공격 hurtE/킬 caller, native browser, UI 시각, 오디오/DB/사망부활 실행하지 않음. DOM페이지메타/렌더/audio/save/lesson/text/parts는 observer; statDropBonus=1; RNG callstack 기반 결정화. source가중치/팩토리를 대체하지 않음.
하네스 실패4회 fedcc2(색상 상수 누락),08fa1b(생성 bStr9 미계산),f50d36(생성 bonusHp6+근성9 미계산),358ce9(easy 자동장착으로 빈가방) 보존. 교정 후4그룹 PASS; 실패를 production버그로 분류하지 않음.
stdout은 도구 출력중간절단 발생. rows prefix는 JSON 추출하여 4그룹 모두 복구; 원문전체 stdout SHA를 주장하지 않음.
docs/ 전체 rg -n 'strFlat|힘의|STR|meleeRef' 실행. 마지막294줄 SHA 9badf32782ec4c1e7ac85224662ccad19210f4ee8da89f9491e0d42c2a1ee297 (관리STATE 갱신으로 이전 c0f085…와 차이).
## 총괄 docs 동기화 표
| id/이름 | 수치/슬롯 | 현재 구현 | 후보 이후 기록 |
|---|---|---|---|
| strFlat / 힘의 / PRE | T1~5: 5/10/18/28/40, val, weight60, ring/neck/belt/bracelet/headband | applyStats 유효STR/HP/regen 포함, meleeRef 누락 | meleeRef에서 정수합 ~~_eqAffix('strFlat')를 STR 항에 가산 |
| STR 효과 | ATK+1/pt, MAXHP+5/pt, regen+.002/pt | 기본/bStr/lv는 meleeRef, 어픽스만 누락 | 기본STR+장비bStr+floor(lv*.5)+strFlat 정수합 |
| 후보 적용 위치 | game.html:27546, game-easy-test.html:26421 | 기존 함수 | 두 파일 동일 추가 |
관련 문서: docs/7아이템디자인/아이템_어픽스_시스템.md:566, 슬롯별_어픽스_풀.md, exoduser-item-system-full.md, 어픽스_Layer_전수매핑_402_2026-08-10.md, 어픽스_시스템_현황분석_2026-08-10.md, 어픽스_Layer_재분류_설계_2026-08-10.md; docs/14밸런스+수치테이블/14밸런스+수치테이블.md:10; docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md. root가 source 최종 적용시 관련 매칭문서의 구현상태/공식과 CHANGELOG_SYNC를 동기화할 것. protected docs/2_3 문서는 수정0, Q-only magic blackBean/E 금지/attack tickets0. MAP작업0.
5355e3 capacityGate 최신 Codex7-after-73620278 allowNewOwnedFiles=false. 기존 ITEM2 allocation을 새2로 간주하지 않음. 후보/하네스/보고는 메모리만 보존, 새 파일0. production/shareddocs/Git/native/save 변경0. 원래 전체goal root인수/native미완료, 완료표시하지 않음.

## 1604 보존 인수
SUPERVISOR-ITEM-1604 지시로 기존 ITEM2 활성화. ba177d STATE: epoch Codex7-after-992bdda4, allowNewOwnedFiles=true, ITEM remaining2/used0.
이전 보고의 allowNewOwnedFiles=false는 당시5355e3 상태; 이번 저장 승인으로 갱신. candidate.patch+result.md만 신규 생성. 기존 제출폴더는 불변.
기존 완료 행동/구문검사 재실행0. 저장된 원출력/하네스/실패기록을 그대로 첨부. 실행 출력중간절단은 그대로 보존, 전체 raw stdout이라고 주장하지 않음.
다음 allStat 실제계약 조사는 메모리만 진행, 본 strFlat 후보 범위에 합치지 않음.

保存時 source pins (read only, not test):
[{"file":"game.html","observedSHA":"e462f2345682856d24bb416a17aec763281a8dceb02f21af565db189992353ea","originalLine":27546},{"file":"game-easy-test.html","observedSHA":"68fa8e17d379fdf7e9da20b153d874e2ac74544d790397b4d36edbcc1207f390","originalLine":26421}]

## Candidate transform

```js
import assert from 'node:assert/strict';
export function applyStrFlatMeleePatch(s){const a="(STATS.str+_eqStat('Str')+_lvB()))*(P._weaponSeal",b="(STATS.str+_eqStat('Str')+_lvB()+~~_eqAffix('strFlat')))*(P._weaponSeal";assert.equal(s.split(a).length,2);return s.replace(a,b)}
```

## Existing execution rows

```json
{
  "task": "ITEM-strFlat-generated-belt-melee-ref-1552",
  "groups": 4,
  "rows": [
    {
      "original": {
        "file": "game.html",
        "prefix": "strFlat",
        "patch": false,
        "before": {
          "str": 15,
          "hp": 380,
          "hpR": 0.08,
          "ref": 50
        },
        "after": {
          "str": 29,
          "hp": 465,
          "hpR": 0.10800000000000001,
          "ref": 59
        },
        "generated": {
          "id": 12345.3,
          "slot": "belt",
          "el": 0,
          "rarity": 1,
          "tier": 0,
          "name": "낡은 허리띠",
          "emoji": "🪢",
          "eDef": 23,
          "bonusSt": 4,
          "bonusShield": 22,
          "bonusMp": 22,
          "potCd": 0.058,
          "bonusHp": 6,
          "bLck": 9,
          "bGrit": 9,
          "bStr": 9,
          "affixes": [
            {
              "id": "strFlat",
              "tier": 0,
              "value": 5
            },
            {
              "id": "fireRes",
              "tier": 0,
              "value": 0.08
            }
          ],
          "_implicitStat": "_iBeltPot",
          "_implicitVal": 4.5,
          "_implicitKo": "물약 쿨다운 -X%",
          "legendarySpecial": null,
          "uniqueSpecial": null,
          "itemLv": 10,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            null
          ]
        },
        "equippedSameGeneratedObject": true,
        "mats": 10000,
        "rng": [
          {
            "kind": "drop",
            "value": 0.1
          },
          {
            "kind": "drop",
            "value": 0.7
          },
          {
            "kind": "drop",
            "value": 0.53125
          },
          {
            "kind": "drop",
            "value": 0.01
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "affix",
            "value": 0.4935897435897436
          },
          {
            "kind": "affix",
            "value": 0
          },
          {
            "kind": "affix",
            "value": 0
          },
          {
            "kind": "affix",
            "value": 0
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "drop",
            "value": 0.5
          },
          {
            "kind": "drop",
            "value": 0.5
          },
          {
            "kind": "drop",
            "value": 0.99
          },
          {
            "kind": "drop",
            "value": 0.99
          }
        ],
        "events": [
          "drop",
          "pickup",
          "notify:1 낡은 허리띠 획득!",
          "lessonPickup",
          "save",
          "parts",
          "equip",
          "notify:낡은 허리띠 장착!",
          "lessonEquip",
          "save",
          "render"
        ]
      },
      "candidate": {
        "file": "game.html",
        "prefix": "strFlat",
        "patch": true,
        "before": {
          "str": 15,
          "hp": 380,
          "hpR": 0.08,
          "ref": 50
        },
        "after": {
          "str": 29,
          "hp": 465,
          "hpR": 0.10800000000000001,
          "ref": 64
        },
        "generated": {
          "id": 12345.3,
          "slot": "belt",
          "el": 0,
          "rarity": 1,
          "tier": 0,
          "name": "낡은 허리띠",
          "emoji": "🪢",
          "eDef": 23,
          "bonusSt": 4,
          "bonusShield": 22,
          "bonusMp": 22,
          "potCd": 0.058,
          "bonusHp": 6,
          "bLck": 9,
          "bGrit": 9,
          "bStr": 9,
          "affixes": [
            {
              "id": "strFlat",
              "tier": 0,
              "value": 5
            },
            {
              "id": "fireRes",
              "tier": 0,
              "value": 0.08
            }
          ],
          "_implicitStat": "_iBeltPot",
          "_implicitVal": 4.5,
          "_implicitKo": "물약 쿨다운 -X%",
          "legendarySpecial": null,
          "uniqueSpecial": null,
          "itemLv": 10,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            null
          ]
        },
        "equippedSameGeneratedObject": true,
        "mats": 10000,
        "rng": [
          {
            "kind": "drop",
            "value": 0.1
          },
          {
            "kind": "drop",
            "value": 0.7
          },
          {
            "kind": "drop",
            "value": 0.53125
          },
          {
            "kind": "drop",
            "value": 0.01
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "affix",
            "value": 0.4935897435897436
          },
          {
            "kind": "affix",
            "value": 0
          },
          {
            "kind": "affix",
            "value": 0
          },
          {
            "kind": "affix",
            "value": 0
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "drop",
            "value": 0.5
          },
          {
            "kind": "drop",
            "value": 0.5
          },
          {
            "kind": "drop",
            "value": 0.99
          },
          {
            "kind": "drop",
            "value": 0.99
          }
        ],
        "events": [
          "drop",
          "pickup",
          "notify:1 낡은 허리띠 획득!",
          "lessonPickup",
          "save",
          "parts",
          "equip",
          "notify:낡은 허리띠 장착!",
          "lessonEquip",
          "save",
          "render"
        ]
      }
    },
    {
      "original": {
        "file": "game.html",
        "prefix": "dexFlat",
        "patch": false,
        "before": {
          "str": 15,
          "hp": 380,
          "hpR": 0.08,
          "ref": 50
        },
        "after": {
          "str": 24,
          "hp": 440,
          "hpR": 0.098,
          "ref": 59
        },
        "generated": {
          "id": 12345.3,
          "slot": "belt",
          "el": 0,
          "rarity": 1,
          "tier": 0,
          "name": "낡은 허리띠",
          "emoji": "🪢",
          "eDef": 23,
          "bonusSt": 4,
          "bonusShield": 22,
          "bonusMp": 22,
          "potCd": 0.058,
          "bonusHp": 6,
          "bLck": 9,
          "bGrit": 9,
          "bStr": 9,
          "affixes": [
            {
              "id": "dexFlat",
              "tier": 0,
              "value": 5
            },
            {
              "id": "fireRes",
              "tier": 0,
              "value": 0.08
            }
          ],
          "_implicitStat": "_iBeltPot",
          "_implicitVal": 4.5,
          "_implicitKo": "물약 쿨다운 -X%",
          "legendarySpecial": null,
          "uniqueSpecial": null,
          "itemLv": 10,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            null
          ]
        },
        "equippedSameGeneratedObject": true,
        "mats": 10000,
        "rng": [
          {
            "kind": "drop",
            "value": 0.1
          },
          {
            "kind": "drop",
            "value": 0.7
          },
          {
            "kind": "drop",
            "value": 0.53125
          },
          {
            "kind": "drop",
            "value": 0.01
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "affix",
            "value": 0.5705128205128205
          },
          {
            "kind": "affix",
            "value": 0
          },
          {
            "kind": "affix",
            "value": 0
          },
          {
            "kind": "affix",
            "value": 0
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "drop",
            "value": 0.5
          },
          {
            "kind": "drop",
            "value": 0.5
          },
          {
            "kind": "drop",
            "value": 0.99
          },
          {
            "kind": "drop",
            "value": 0.99
          }
        ],
        "events": [
          "drop",
          "pickup",
          "notify:1 낡은 허리띠 획득!",
          "lessonPickup",
          "save",
          "parts",
          "equip",
          "notify:낡은 허리띠 장착!",
          "lessonEquip",
          "save",
          "render"
        ]
      },
      "candidate": {
        "file": "game.html",
        "prefix": "dexFlat",
        "patch": true,
        "before": {
          "str": 15,
          "hp": 380,
          "hpR": 0.08,
          "ref": 50
        },
        "after": {
          "str": 24,
          "hp": 440,
          "hpR": 0.098,
          "ref": 59
        },
        "generated": {
          "id": 12345.3,
          "slot": "belt",
          "el": 0,
          "rarity": 1,
          "tier": 0,
          "name": "낡은 허리띠",
          "emoji": "🪢",
          "eDef": 23,
          "bonusSt": 4,
          "bonusShield": 22,
          "bonusMp": 22,
          "potCd": 0.058,
          "bonusHp": 6,
          "bLck": 9,
          "bGrit": 9,
          "bStr": 9,
          "affixes": [
            {
              "id": "dexFlat",
              "tier": 0,
              "value": 5
            },
            {
              "id": "fireRes",
              "tier": 0,
              "value": 0.08
            }
          ],
          "_implicitStat": "_iBeltPot",
          "_implicitVal": 4.5,
          "_implicitKo": "물약 쿨다운 -X%",
          "legendarySpecial": null,
          "uniqueSpecial": null,
          "itemLv": 10,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            null
          ]
        },
        "equippedSameGeneratedObject": true,
        "mats": 10000,
        "rng": [
          {
            "kind": "drop",
            "value": 0.1
          },
          {
            "kind": "drop",
            "value": 0.7
          },
          {
            "kind": "drop",
            "value": 0.53125
          },
          {
            "kind": "drop",
            "value": 0.01
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "affix",
            "value": 0.5705128205128205
          },
          {
            "kind": "affix",
            "value": 0
          },
          {
            "kind": "affix",
            "value": 0
          },
          {
            "kind": "affix",
            "value": 0
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "drop",
            "value": 0.5
          },
          {
            "kind": "drop",
            "value": 0.5
          },
          {
            "kind": "drop",
            "value": 0.99
          },
          {
            "kind": "drop",
            "value": 0.99
          }
        ],
        "events": [
          "drop",
          "pickup",
          "notify:1 낡은 허리띠 획득!",
          "lessonPickup",
          "save",
          "parts",
          "equip",
          "notify:낡은 허리띠 장착!",
          "lessonEquip",
          "save",
          "render"
        ]
      }
    },
    {
      "original": {
        "file": "game-easy-test.html",
        "prefix": "strFlat",
        "patch": false,
        "before": {
          "str": 15,
          "hp": 380,
          "hpR": 0.08,
          "ref": 50
        },
        "after": {
          "str": 29,
          "hp": 465,
          "hpR": 0.10800000000000001,
          "ref": 59
        },
        "generated": {
          "id": 12345.3,
          "slot": "belt",
          "el": 0,
          "rarity": 1,
          "tier": 0,
          "name": "낡은 허리띠",
          "emoji": "🪢",
          "eDef": 23,
          "bonusSt": 4,
          "bonusShield": 22,
          "bonusMp": 22,
          "potCd": 0.058,
          "bonusHp": 6,
          "bLck": 9,
          "bGrit": 9,
          "bStr": 9,
          "affixes": [
            {
              "id": "strFlat",
              "tier": 0,
              "value": 5
            },
            {
              "id": "fireRes",
              "tier": 0,
              "value": 0.08
            }
          ],
          "_implicitStat": "_iBeltPot",
          "_implicitVal": 4.5,
          "_implicitKo": "물약 쿨다운 -X%",
          "legendarySpecial": null,
          "uniqueSpecial": null,
          "itemLv": 10,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            null
          ]
        },
        "equippedSameGeneratedObject": true,
        "mats": 10000,
        "rng": [
          {
            "kind": "drop",
            "value": 0.1
          },
          {
            "kind": "drop",
            "value": 0.7
          },
          {
            "kind": "drop",
            "value": 0.5666666666666667
          },
          {
            "kind": "drop",
            "value": 0.01
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "affix",
            "value": 0.4935897435897436
          },
          {
            "kind": "affix",
            "value": 0
          },
          {
            "kind": "affix",
            "value": 0
          },
          {
            "kind": "affix",
            "value": 0
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "drop",
            "value": 0.5
          },
          {
            "kind": "drop",
            "value": 0.5
          },
          {
            "kind": "drop",
            "value": 0.99
          },
          {
            "kind": "drop",
            "value": 0.99
          }
        ],
        "events": [
          "drop",
          "pickup",
          "notify:1 낡은 허리띠 획득!",
          "lessonPickup",
          "save",
          "parts",
          "equip",
          "notify:낡은 허리띠 장착!",
          "lessonEquip",
          "save",
          "render"
        ]
      },
      "candidate": {
        "file": "game-easy-test.html",
        "prefix": "strFlat",
        "patch": true,
        "before": {
          "str": 15,
          "hp": 380,
          "hpR": 0.08,
          "ref": 50
        },
        "after": {
          "str": 29,
          "hp": 465,
          "hpR": 0.10800000000000001,
          "ref": 64
        },
        "generated": {
          "id": 12345.3,
          "slot": "belt",
          "el": 0,
          "rarity": 1,
          "tier": 0,
          "name": "낡은 허리띠",
          "emoji": "🪢",
          "eDef": 23,
          "bonusSt": 4,
          "bonusShield": 22,
          "bonusMp": 22,
          "potCd": 0.058,
          "bonusHp": 6,
          "bLck": 9,
          "bGrit": 9,
          "bStr": 9,
          "affixes": [
            {
              "id": "strFlat",
              "tier": 0,
              "value": 5
            },
            {
              "id": "fireRes",
              "tier": 0,
              "value": 0.08
            }
          ],
          "_implicitStat": "_iBeltPot",
          "_implicitVal": 4.5,
          "_implicitKo": "물약 쿨다운 -X%",
          "legendarySpecial": null,
          "uniqueSpecial": null,
          "itemLv": 10,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            null
          ]
        },
        "equippedSameGeneratedObject": true,
        "mats": 10000,
        "rng": [
          {
            "kind": "drop",
            "value": 0.1
          },
          {
            "kind": "drop",
            "value": 0.7
          },
          {
            "kind": "drop",
            "value": 0.5666666666666667
          },
          {
            "kind": "drop",
            "value": 0.01
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "affix",
            "value": 0.4935897435897436
          },
          {
            "kind": "affix",
            "value": 0
          },
          {
            "kind": "affix",
            "value": 0
          },
          {
            "kind": "affix",
            "value": 0
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "drop",
            "value": 0.5
          },
          {
            "kind": "drop",
            "value": 0.5
          },
          {
            "kind": "drop",
            "value": 0.99
          },
          {
            "kind": "drop",
            "value": 0.99
          }
        ],
        "events": [
          "drop",
          "pickup",
          "notify:1 낡은 허리띠 획득!",
          "lessonPickup",
          "save",
          "parts",
          "equip",
          "notify:낡은 허리띠 장착!",
          "lessonEquip",
          "save",
          "render"
        ]
      }
    },
    {
      "original": {
        "file": "game-easy-test.html",
        "prefix": "dexFlat",
        "patch": false,
        "before": {
          "str": 15,
          "hp": 380,
          "hpR": 0.08,
          "ref": 50
        },
        "after": {
          "str": 24,
          "hp": 440,
          "hpR": 0.098,
          "ref": 59
        },
        "generated": {
          "id": 12345.3,
          "slot": "belt",
          "el": 0,
          "rarity": 1,
          "tier": 0,
          "name": "낡은 허리띠",
          "emoji": "🪢",
          "eDef": 23,
          "bonusSt": 4,
          "bonusShield": 22,
          "bonusMp": 22,
          "potCd": 0.058,
          "bonusHp": 6,
          "bLck": 9,
          "bGrit": 9,
          "bStr": 9,
          "affixes": [
            {
              "id": "dexFlat",
              "tier": 0,
              "value": 5
            },
            {
              "id": "fireRes",
              "tier": 0,
              "value": 0.08
            }
          ],
          "_implicitStat": "_iBeltPot",
          "_implicitVal": 4.5,
          "_implicitKo": "물약 쿨다운 -X%",
          "legendarySpecial": null,
          "uniqueSpecial": null,
          "itemLv": 10,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            null
          ]
        },
        "equippedSameGeneratedObject": true,
        "mats": 10000,
        "rng": [
          {
            "kind": "drop",
            "value": 0.1
          },
          {
            "kind": "drop",
            "value": 0.7
          },
          {
            "kind": "drop",
            "value": 0.5666666666666667
          },
          {
            "kind": "drop",
            "value": 0.01
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "affix",
            "value": 0.5705128205128205
          },
          {
            "kind": "affix",
            "value": 0
          },
          {
            "kind": "affix",
            "value": 0
          },
          {
            "kind": "affix",
            "value": 0
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "drop",
            "value": 0.5
          },
          {
            "kind": "drop",
            "value": 0.5
          },
          {
            "kind": "drop",
            "value": 0.99
          },
          {
            "kind": "drop",
            "value": 0.99
          }
        ],
        "events": [
          "drop",
          "pickup",
          "notify:1 낡은 허리띠 획득!",
          "lessonPickup",
          "save",
          "parts",
          "equip",
          "notify:낡은 허리띠 장착!",
          "lessonEquip",
          "save",
          "render"
        ]
      },
      "candidate": {
        "file": "game-easy-test.html",
        "prefix": "dexFlat",
        "patch": true,
        "before": {
          "str": 15,
          "hp": 380,
          "hpR": 0.08,
          "ref": 50
        },
        "after": {
          "str": 24,
          "hp": 440,
          "hpR": 0.098,
          "ref": 59
        },
        "generated": {
          "id": 12345.3,
          "slot": "belt",
          "el": 0,
          "rarity": 1,
          "tier": 0,
          "name": "낡은 허리띠",
          "emoji": "🪢",
          "eDef": 23,
          "bonusSt": 4,
          "bonusShield": 22,
          "bonusMp": 22,
          "potCd": 0.058,
          "bonusHp": 6,
          "bLck": 9,
          "bGrit": 9,
          "bStr": 9,
          "affixes": [
            {
              "id": "dexFlat",
              "tier": 0,
              "value": 5
            },
            {
              "id": "fireRes",
              "tier": 0,
              "value": 0.08
            }
          ],
          "_implicitStat": "_iBeltPot",
          "_implicitVal": 4.5,
          "_implicitKo": "물약 쿨다운 -X%",
          "legendarySpecial": null,
          "uniqueSpecial": null,
          "itemLv": 10,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            null
          ]
        },
        "equippedSameGeneratedObject": true,
        "mats": 10000,
        "rng": [
          {
            "kind": "drop",
            "value": 0.1
          },
          {
            "kind": "drop",
            "value": 0.7
          },
          {
            "kind": "drop",
            "value": 0.5666666666666667
          },
          {
            "kind": "drop",
            "value": 0.01
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "affix",
            "value": 0.5705128205128205
          },
          {
            "kind": "affix",
            "value": 0
          },
          {
            "kind": "affix",
            "value": 0
          },
          {
            "kind": "affix",
            "value": 0
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "factory",
            "value": 0.3
          },
          {
            "kind": "drop",
            "value": 0.5
          },
          {
            "kind": "drop",
            "value": 0.5
          },
          {
            "kind": "drop",
            "value": 0.99
          },
          {
            "kind": "drop",
            "value": 0.99
          }
        ],
        "events": [
          "drop",
          "pickup",
          "notify:1 낡은 허리띠 획득!",
          "lessonPickup",
          "save",
          "parts",
          "equip",
          "notify:낡은 허리띠 장착!",
          "lessonEquip",
          "save",
          "render"
        ]
      }
    }
  ]
}
```

## Existing source fixture harness

```js
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {parseExpressionAt} from 'acorn';
import {spawnSync} from 'node:child_process';

const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
assert.equal(fs.realpathSync(process.cwd()),root);
const startedUTC=new Date().toISOString(),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const anchors=[],rows=[],groups=[],patches=[];
function once(s,a,b){assert.equal(s.split(a).length,2,'unique patch anchor');return s.replace(a,b);}
function ref(file,label,source,start,end){
 const text=source.slice(start,end);assert(start>=0&&end>start,label);
 anchors.push({file,label,line:source.slice(0,start).split('\n').length,sha256:sha(text),bytes:Buffer.byteLength(text)});
 return text;
}
function fun(file,s,n,optional=false){const i=s.indexOf('function '+n+'(');if(i<0&&optional)return '';assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);}
function con(file,s,n){const m='const '+n+'=',i=s.indexOf(m);assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i+m.length,{ecmaVersion:'latest'}).end)+';';}

export function applyStrFlatMeleePatch(s){
 const a="(STATS.str+_eqStat('Str')+_lvB()))*(P._weaponSeal";
 const b="(STATS.str+_eqStat('Str')+_lvB()+~~_eqAffix('strFlat')))*(P._weaponSeal";
 return once(s,a,b);
}
const files=['game.html','game-easy-test.html'];
const rowsOut=[];
for(const file of files){
 const source=fs.readFileSync(file,'utf8'),candidate=applyStrFlatMeleePatch(source);
 function build(s){
 const cs=['EL','RARITY_C','RARITY_MUL','SLOT_NAMES','SLOT_EMOJI','DROP_SLOT_POOL','_AFSLOT','AFFIX_POOL','IMPLICIT_TABLE','CHAPTER_STAGES','TOTAL_STAGES','SI_TO_HELL','_DEMO_MODE','_DEMO_AFFIX_BANNED','ITEM_SIZE','WTYPE_SIZE','BTYPE_SIZE','INV_COLS','_MALICE_COST_MUL','CR_ATK_SLOTS','CR_ARMOR_SLOTS','CR_ACC_SLOTS','CR_DEF_SLOTS','CRYSTAL_DEFS','CRYSTAL_BAG_MAX','_diffSigned'].map(n=>con(file,s,n)).join('\n');
 const names=['mkItem','rollAffixes','rollDrop','_wiPush','_minPickLvThr','pickupItem','equipItem','_invBagRightClick','_invRows','_itemSz','_invCategoryKey','_invGrid','_invFindSpace','_invCanPlace','xferCost','_malCost','_itemEconomyRarity','enhColor','wp','_lvB','_eqStatRebuild','_eqStat','_eqAffixRebuild','_eqAffix','_eqImplicit','_gritTotal','_gritHpFlat','_gritMpFlat','_gritStFlat','pPredSpd','recalcSt','applyStats','enhMulAtk','_slotFlatAtk','meleeRef'];
 const fsCode=names.map(n=>fun(file,s,n)).join('\n')+'\n'+['_earringSlot','_equipSlot'].map(n=>fun(file,s,n,true)).join('\n');
 const pi=s.indexOf('    if(!chestOpened){',s.indexOf('// 장비 아이템 줍기 — R키:')),pe=s.indexOf('    // ── R키: 악의+물약',pi);
 return 'const _BIC=false;const location={search:"?demo"};let _eqStatCache=null,_eqAffixCache=null;\n'+cs+'\n'+fsCode+'\nfunction rPickup(){const chestOpened=false;\n'+ref(file,'R selection',s,pi,pe)+'\n}';
 }
 const originalProgram=build(source),candidateProgram=build(candidate);
 function run(prefix,patch){
  const rng=[],events=[],state={affixCalls:0,dropCalls:0},ctx={
   console,STATS:{str:10,dex:10,int:10,lck:0},_grit:0,PASSIVES:{},
   INV:{bag:[],equipped:{belt:{id:'control-belt',slot:'belt',enh:0,affixes:[],crystals:[]},weapon:{id:'control-weapon',slot:'weapon',atk:20,enh:0,affixes:[],crystals:[]}}},
   G:{on:true,stage:0,mats:10000,cam:{x:0,y:0}},P:{lv:10,x:0,y:0,hp:100,mp:100,st:100,shield:100,_weaponSeal:0},
   OPT:{diff:5,minPickRar:0,minPickLvTier:0},BAG_MAX:300,CRYSTAL_BAG:[],_earringEquipTarget:null,
   worldItems:[],deathDrop:null,VW:800,VH:600,dst:(x,y,u,v)=>Math.hypot(x-u,y-v),
   statDropBonus:()=>1,$:id=>id==='invPanel'?{dataset:{inventoryPage:'equipment'}}:null,
   _T:s=>s,_L:s=>s,_rarName:String,notify:s=>events.push('notify:'+s),
   playEquipSfx:()=>events.push('equip'),playItemPickupSfx:()=>events.push('pickup'),
   playItemDropSfx:()=>events.push('drop'),dbSaveForce:()=>events.push('save'),
   renderInv:()=>events.push('render'),addTxt:()=>events.push('text'),addParts:()=>events.push('parts'),
   window:{_systemLesson:{pickedUp:()=>events.push('lessonPickup'),equipped:()=>events.push('lessonEquip')}}
  };
  const c=vm.createContext(ctx);vm.runInContext(patch?candidateProgram:originalProgram,c);
  const pool=vm.runInContext("AFFIX_POOL.filter(a=>a.type===0&&a.slots.includes(_AFSLOT.belt)&&!(_DEMO_MODE&&_DEMO_AFFIX_BANNED.has(a.id))&&a.tiers[0]!=null)",c);
  const target=pool.find(a=>a.id===prefix);assert(target,prefix);
  const pre=pool.slice(0,pool.indexOf(target)).reduce((n,a)=>n+a.weight,0),total=pool.reduce((n,a)=>n+a.weight,0);
  const weighted=(pre+target.weight*.5)/total;
  const slotRand=vm.runInContext("(DROP_SLOT_POOL.indexOf('belt')+.5)/DROP_SLOT_POOL.length",c);
  c.rand=stack=>{
   let kind,value;
   if(stack.includes('at rollAffixes')){kind='affix';value=state.affixCalls++===0?weighted:0}
   else if(stack.includes('at mkItem')){kind='factory';value=.3}
   else if(stack.includes('at rollDrop')){kind='drop';value=[.1,.7,slotRand,.01,.5,.5,.99,.99][state.dropCalls++];assert(value!==undefined)}
   else throw Error('unexpected RNG '+stack);
   rng.push({kind,value});return value;
  };
  vm.runInContext('Date.now=()=>12345;Math.random=()=>rand(new Error().stack);applyStats()',c);
  const before={str:c.P._effStats.str,hp:c.P.mhp,hpR:c.P.hpR,ref:vm.runInContext('meleeRef()',c)};
  vm.runInContext('rollDrop({ib:false,etype:0,elite:0,dropTier:0,x:0,y:0})',c);
  assert.equal(c.worldItems.length,1);const wi=c.worldItems[0],it=wi.item;
  assert.equal(it.slot,'belt');assert.equal(it.rarity,1);assert.equal(it.affixes[0].id,prefix);assert.equal(it.affixes[0].value,5);
  const generated=JSON.parse(JSON.stringify(it));
  vm.runInContext('rPickup()',c);assert(wi.picked);assert.equal(c.INV.bag[0],it);
  vm.runInContext('_invBagRightClick(0)',c);assert.equal(c.INV.equipped.belt,it);assert.equal(c.INV.bag.length,1);assert.equal(c.INV.bag[0].id,'control-belt');
  const after={str:c.P._effStats.str,hp:c.P.mhp,hpR:c.P.hpR,ref:vm.runInContext('meleeRef()',c)};
  assert.equal(c.G.mats,10000);assert.equal(c.CRYSTAL_BAG.length,0);
  if(prefix==='strFlat'){assert.equal(after.str-before.str,(it.bStr||0)+5);assert.equal(after.hp-before.hp,((it.bStr||0)+5)*5+(it.bonusHp||0)+(it.bGrit||0)+it.affixes.filter(a=>a.id==='maxHPFlat').reduce((n,a)=>n+a.value,0));assert(Math.abs(after.hpR-before.hpR-((it.bStr||0)+5)*.002)<1e-10);assert.equal(after.ref-before.ref,(it.bStr||0)+(patch?5:0))}
  else assert.equal(after.ref-before.ref,it.bStr||0);
  return {file,prefix,patch,before,after,generated,equippedSameGeneratedObject:true,mats:c.G.mats,rng,events};
 }
 for(const prefix of ['strFlat','dexFlat']){
  const a=run(prefix,false),b=run(prefix,true);
  assert.deepEqual(a.generated,b.generated);assert.deepEqual(a.rng,b.rng);assert.deepEqual(a.events,b.events);
  assert.deepEqual({...a.after,ref:0},{...b.after,ref:0});
  if(prefix==='dexFlat')assert.deepEqual(a.after,b.after);
  rowsOut.push({original:a,candidate:b});
 }
 patches.push({file,originalSHA:sha(source),candidateSHA:sha(candidate)});
}
const docs=spawnSync('rg',['-n','strFlat|힘의|STR|meleeRef','docs/'],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});assert.equal(docs.status,0);
console.log(JSON.stringify({task:'ITEM-strFlat-generated-belt-melee-ref-1552',groups:rowsOut.length,rows:rowsOut,patches,anchors,docsSearch:{keywords:'strFlat|힘의|STR|meleeRef',lines:docs.stdout.trimEnd().split('\n').length,sha256:sha(docs.stdout)},productionApplied:false,nativeTested:false,actual:'whole rollDrop/mkItem/rollAffixes/R equipment selection/pickupItem/equipItem/_invBagRightClick/applyStats/recalcSt/meleeRef',observers:'DOM page metadata, rendering/audio/save/lesson/text/particles; statDropBonus=1; deterministic RNG by source call stack; synthetic fixed weapon and base player; kill caller not executed'}));

```

## Saved tool outputs (truncated where tool said so)

```json
{
  "execution": {
    "chunk_id": "29f878",
    "wall_time_seconds": 0.506916166,
    "exit_code": 0,
    "original_token_count": 14550,
    "output": "Warning: truncated output (original token count: 14550)\nTotal output lines: 1\n\n{\"task\":\"ITEM-strFlat-generated-belt-melee-ref-1552\",\"groups\":4,\"rows\":[{\"original\":{\"file\":\"game.html\",\"prefix\":\"strFlat\",\"patch\":false,\"before\":{\"str\":15,\"hp\":380,\"hpR\":0.08,\"ref\":50},\"after\":{\"str\":29,\"hp\":465,\"hpR\":0.10800000000000001,\"ref\":59},\"generated\":{\"id\":12345.3,\"slot\":\"belt\",\"el\":0,\"rarity\":1,\"tier\":0,\"name\":\"낡은 허리띠\",\"emoji\":\"🪢\",\"eDef\":23,\"bonusSt\":4,\"bonusShield\":22,\"bonusMp\":22,\"potCd\":0.058,\"bonusHp\":6,\"bLck\":9,\"bGrit\":9,\"bStr\":9,\"affixes\":[{\"id\":\"strFlat\",\"tier\":0,\"value\":5},{\"id\":\"fireRes\",\"tier\":0,\"value\":0.08}],\"_implicitStat\":\"_iBeltPot\",\"_implicitVal\":4.5,\"_implicitKo\":\"물약 쿨다운 -X%\",\"legendarySpecial\":null,\"uniqueSpecial\":null,\"itemLv\":10,\"reqLv\":0,\"socketCount\":1,\"crystals\":[null]},\"equippedSameGeneratedObject\":true,\"mats\":10000,\"rng\":[{\"kind\":\"drop\",\"value\":0.1},{\"kind\":\"drop\",\"value\":0.7},{\"kind\":\"drop\",\"value\":0.53125},{\"kind\":\"drop\",\"value\":0.01},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"affix\",\"value\":0.4935897435897436},{\"kind\":\"affix\",\"value\":0},{\"kind\":\"affix\",\"value\":0},{\"kind\":\"affix\",\"value\":0},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"drop\",\"value\":0.5},{\"kind\":\"drop\",\"value\":0.5},{\"kind\":\"drop\",\"value\":0.99},{\"kind\":\"drop\",\"value\":0.99}],\"events\":[\"drop\",\"pickup\",\"notify:1 낡은 허리띠 획득!\",\"lessonPickup\",\"save\",\"parts\",\"equip\",\"notify:낡은 허리띠 장착!\",\"lessonEquip\",\"save\",\"render\"]},\"candidate\":{\"file\":\"game.html\",\"prefix\":\"strFlat\",\"patch\":true,\"before\":{\"str\":15,\"hp\":380,\"hpR\":0.08,\"ref\":50},\"after\":{\"str\":29,\"hp\":465,\"hpR\":0.10800000000000001,\"ref\":64},\"generated\":{\"id\":12345.3,\"slot\":\"belt\",\"el\":0,\"rarity\":1,\"tier\":0,\"name\":\"낡은 허리띠\",\"emoji\":\"🪢\",\"eDef\":23,\"bonusSt\":4,\"bonusShield\":22,\"bonusMp\":22,\"potCd\":0.058,\"bonusHp\":6,\"bLck\":9,\"bGrit\":9,\"bStr\":9,\"affixes\":[{\"id\":\"strFlat\",\"tier\":0,\"value\":5},{\"id\":\"fireRes\",\"tier\":0,\"value\":0.08}],\"_implicitStat\":\"_iBeltPot\",\"_implicitVal\":4.5,\"_implicitKo\":\"물약 쿨다운 -X%\",\"legendarySpecial\":null,\"uniqueSpecial\":null,\"itemLv\":10,\"reqLv\":0,\"socketCount\":1,\"crystals\":[null]},\"equippedSameGeneratedObject\":true,\"mats\":10000,\"rng\":[{\"kind\":\"drop\",\"value\":0.1},{\"kind\":\"drop\",\"value\":0.7},{\"kind\":\"drop\",\"value\":0.53125},{\"kind\":\"drop\",\"value\":0.01},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"affix\",\"value\":0.4935897435897436},{\"kind\":\"affix\",\"value\":0},{\"kind\":\"affix\",\"value\":0},{\"kind\":\"affix\",\"value\":0},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"drop\",\"value\":0.5},{\"kind\":\"drop\",\"value\":0.5},{\"kind\":\"drop\",\"value\":0.99},{\"kind\":\"drop\",\"value\":0.99}],\"events\":[\"drop\",\"pickup\",\"notify:1 낡은 허리띠 획득!\",\"lessonPickup\",\"save\",\"parts\",\"equip\",\"notify:낡은 허리띠 장착!\",\"lessonEquip\",\"save\",\"render\"]}},{\"original\":{\"file\":\"game.html\",\"prefix\":\"dexFlat\",\"patch\":false,\"before\":{\"str\":15,\"hp\":380,\"hpR\":0.08,\"ref\":50},\"after\":{\"str\":24,\"hp\":440,\"hpR\":0.098,\"ref\":59},\"generated\":{\"id\":12345.3,\"slot\":\"belt\",\"el\":0,\"rarity\":1,\"tier\":0,\"name\":\"낡은 허리띠\",\"emoji\":\"🪢\",\"eDef\":23,\"bonusSt\":4,\"bonusShield\":22,\"bonusMp\":22,\"potCd\":0.058,\"bonusHp\":6,\"bLck\":9,\"bGrit\":9,\"bStr\":9,\"affixes\":[{\"id\":\"dexFlat\",\"tier\":0,\"value\":5},{\"id\":\"fireRes\",\"tier\":0,\"value\":0.08}],\"_implicitStat\":\"_iBeltPot\",\"_implicitVal\":4.5,\"_implicitKo\":\"물약 쿨다운 -X%\",\"legendarySpecial\":null,\"uniqueSpecial\":null,\"itemLv\":10,\"reqLv\":0,\"socketCount\":1,\"crystals\":[null]},\"equippedSameGeneratedObject\":true,\"mats\":10000,\"rng\":[{\"kind\":\"drop\",\"value\":0.1},{\"kind\":\"drop\",\"value\":0.7},{\"kind\":\"drop\",\"value\":0.53125},{\"kind\":\"drop\",\"value\":0.01},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"affix\",\"value\":0.5705128205128205},{\"kind\":\"affix\",\"value\":0},{\"kind\":\"affix\",\"value\":0},{\"kind\":\"affix\",\"value\":0},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"drop\",\"value\":0.5},{\"kind\":\"drop\",\"value\":0.5},{\"kind\":\"drop\",\"value\":0.99},{\"kind\":\"drop\",\"value\":0.99}],\"events\":[\"drop\",\"pickup\",\"notify:1 낡은 허리띠 획득!\",\"lessonPickup\",\"save\",\"parts\",\"equip\",\"notify:낡은 허리띠 장착!\",\"lessonEquip\",\"save\",\"render\"]},\"candidate\":{\"file\":\"game.html\",\"prefix\":\"dexFlat\",\"patch\":true,\"before\":{\"str\":15,\"hp\":380,\"hpR\":0.08,\"ref\":50},\"after\":{\"str\":24,\"hp\":440,\"hpR\":0.098,\"ref\":59},\"generated\":{\"id\":12345.3,\"slot\":\"belt\",\"el\":0,\"rarity\":1,\"tier\":0,\"name\":\"낡은 허리띠\",\"emoji\":\"🪢\",\"eDef\":23,\"bonusSt\":4,\"bonusShield\":22,\"bonusMp\":22,\"potCd\":0.058,\"bonusHp\":6,\"bLck\":9,\"bGrit\":9,\"bStr\":9,\"affixes\":[{\"id\":\"dexFlat\",\"tier\":0,\"value\":5},{\"id\":\"fireRes\",\"tier\":0,\"value\":0.08}],\"_implicitStat\":\"_iBeltPot\",\"_implicitVal\":4.5,\"_implicitKo\":\"물약 쿨다운 -X%\",\"legendarySpecial\":null,\"uniqueSpecial\":null,\"itemLv\":10,\"reqLv\":0,\"socketCount\":1,\"crystals\":[null]},\"equippedSameGeneratedObject\":true,\"mats\":10000,\"rng\":[{\"kind\":\"drop\",\"value\":0.1},{\"kind\":\"drop\",\"value\":0.7},{\"kind\":\"drop\",\"value\":0.53125},{\"kind\":\"drop\",\"value\":0.01},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"affix\",\"value\":0.5705128205128205},{\"kind\":\"affix\",\"value\":0},{\"kind\":\"affix\",\"value\":0},{\"kind\":\"affix\",\"value\":0},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"drop\",\"value\":0.5},{\"kind\":\"drop\",\"value\":0.5},{\"kind\":\"drop\",\"value\":0.99},{\"kind\":\"drop\",\"value\":0.99}],\"events\":[\"drop\",\"pickup\",\"notify:1 낡은 허리띠 획득!\",\"lessonPickup\",\"save\",\"parts\",\"equip\",\"notify:낡은 허리띠 장착!\",\"lessonEquip\",\"save\",\"render\"]}},{\"original\":{\"file\":\"game-easy-test.html\",\"prefix\":\"strFlat\",\"patch\":false,\"before\":{\"str\":15,\"hp\":380,\"hpR\":0.08,\"ref\":50},\"after\":{\"str\":29,\"hp\":465,\"hpR\":0.10800000000000001,\"ref\":59},\"generated\":{\"id\":12345.3,\"slot\":\"belt\",\"el\":0,\"rarity\":1,\"tier\":0,\"name\":\"낡은 허리띠\",\"emoji\":\"🪢\",\"eDef\":23,\"bonusSt\":4,\"bonusShield\":22,\"bonusMp\":22,\"potCd\":0.058,\"bonusHp\":6,\"bLck\":9,\"bGrit\":9,\"bStr\":9,\"affixes\":[{\"id\":\"strFlat\",\"tier\":0,\"value\":5},{\"id\":\"fireRes\",\"tier\":0,\"value\":0.08}],\"_implicitStat\":\"_iBeltPot\",\"_implicitVal\":4.5,\"_implicitKo\":\"물약 쿨다운 -X%\",\"legendarySpecial\":null,\"uniqueSpecial\":null,\"itemLv\":10,\"reqLv\":0,\"socketCount\":1,\"crystals\":[null]},\"equippedSameGeneratedObject\":true,\"mats\":10000,\"rng\":[{\"kind\":\"drop\",\"value\":0.1},{\"kind\":\"drop\",\"value\":0.7},{\"kind\":\"drop\",\"value\":0.5666666666666667},{\"kind\":\"drop\",\"value\":0.01},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"affix\",\"value\":0.4935897435897436},{\"kind\":\"affix\",\"value\":0},{\"kind\":\"affix\",\"value\":0},{\"kind\":\"affix\",\"value\":0},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"drop\",\"value\":0.5},{\"kind\":\"drop\",\"value\":0.5},{\"kind\":\"drop\",\"value\":0.99},{\"kind\":\"drop\",\"value\":0.99}],\"events\":[\"drop\",\"pickup\",\"notify:1 낡은 허리띠 획득!\",\"lessonPickup\",\"save\",\"parts\",\"equip\",\"notify:낡은 허리띠 장착!\",\"lessonEquip\",\"save\",\"render\"]},\"candidate\":{\"file\":\"game-easy-test.html\",\"prefix\":\"strFlat\",\"patch\":true,\"before\":{\"str\":15,\"hp\":380,\"hpR\":0.08,\"ref\":50},\"after\":{\"str\":29,\"hp\":465,\"hpR\":0.10800000000000001,\"ref\":64},\"generated\":{\"id\":12345.3,\"slot\":\"belt\",\"el\":0,\"rarity\":1,\"tier\":0,\"name\":\"낡은 허리띠\",\"emoji\":\"🪢\",\"eDef\":23,\"bonusSt\":4,\"bonusShield\":22,\"bonusMp\":22,\"potCd\":0.058,\"bonusHp\":6,\"bLck\":9,\"bGrit\":9,\"bStr\":9,\"affixes\":[{\"id\":\"strFlat\",\"tier\":0,\"value\":5},{\"id\":\"fireRes\",\"tier\":0,\"value\":0.08}],\"_implicitStat\":\"_iBeltPot\",\"_implicitVal\":4.5,\"_implicitKo\":\"물약 쿨다운 -X%\",\"legendarySpecial\":null,\"uniqueSpecial\":null,\"itemLv\":10,\"reqLv\":0,\"socketCount\":1,\"crystals\":[null]},\"equippedSameGeneratedObject\":true,\"mats\":10000,\"rng\":[{\"kind\":\"drop\",\"value\":0.1},{\"kind\":\"drop\",\"value\":0.7},{\"kind\":\"drop\",\"value\":0.5666666666666667},{\"kind\":\"drop\",\"value\":0.01},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"affix\",\"value\":0.4935897435897436},{\"kind\":\"affix\",\"value\":0},{\"kind\":\"affix\",\"value\":0},{\"kind\":\"affix\",\"value\":0},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"drop\",\"value\":0.5},{\"kind\":\"drop\",\"value\":0.5},{\"kind\":\"drop\",\"value\":0.99},{\"kind\":\"drop\",\"value\":0.99}],\"events\":[\"drop\",\"pickup\",\"notify:1 낡은 허리띠 획득!\",\"lessonPickup\",\"save\",\"parts\",\"equip\",\"notify:낡은 허리띠 장착!\",\"lessonEquip\",\"save\",\"render\"]}},{\"original\":{\"file\":\"game-easy-test.html\",\"prefix\":\"dexFlat\",\"patch\":false,\"before\":{\"str\":15,\"hp\":380,\"hpR\":0.08,\"ref\":50},\"after\":{\"str\":24,\"hp\":440,\"hpR\":0.098,\"ref\":59},\"generated\":{\"id\":12345.3,\"slot\":\"belt\",\"el\":0,\"rarity\":1,\"tier\":0,\"name\":\"낡은 허리띠\",\"emoji\":\"🪢\",\"eDef\":23,\"bonusSt\":4,\"bonusShield\":22,\"bonusMp\":22,\"potCd\":0.058,\"bonusHp\":6,\"bLck\":9,\"bGrit\":9,\"bStr\":9,\"affixes\":[{\"id\":\"dexFlat\",\"tier\":0,\"value\":5},{\"id\":\"fireRes\",\"tier\":0,\"value\":0.08}],\"_implicitStat\":\"_iBeltPot\",\"_implicitVal\":4.5,\"_implicitKo\":\"물약 쿨다운 -X%\",\"legendarySpecial\":null,\"uniqueSpecial\":null,\"itemLv\":10,\"reqLv\":0,\"socketCount\":1,\"crystals\":[null]},\"equippedSameGeneratedObject\":true,\"mats\":10000,\"rng\":[{\"kind\":\"drop\",\"value\":0.1},{\"kind\":\"drop\",\"value\":0.7},{\"kind\":\"drop\",\"value\":0.5666666666666667},{\"kind\":\"drop\",\"value\":0.01},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"affix\",\"value\":0.5705128205128205},{\"kind\":\"affix\",\"value\":0},{\"kind\":\"affix\",\"value\":0},{\"kind\":\"affix\",\"value\":0},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"drop\",\"value\":0.5},{\"kind\":\"drop\",\"value\":0.5},{\"kind\":\"drop\",\"value\":0.99},{\"kind\":\"drop\",\"value\":0.99}],\"events\":[\"drop\",\"pickup\",\"notify:1 낡은 허리띠 획득!\",\"lessonPickup\",\"save\",\"parts\",\"equip\",\"notify:낡은 허리띠 장착!\",\"lessonEquip\",\"save\",\"render\"]},\"candidate\":{\"file\":\"game-easy-test.html\",\"prefix\":\"dexFlat\",\"patch\":true,\"before\":{\"str\":15,\"hp\":380,\"hpR\":0.08,\"ref\":50},\"after\":{\"str\":24,\"hp\":440,\"hpR\":0.098,\"ref\":59},\"generated\":{\"id\":12345.3,\"slot\":\"belt\",\"el\":0,\"rarity\":1,\"tier\":0,\"name\":\"낡은 허리띠\",\"emoji\":\"🪢\",\"eDef\":23,\"bonusSt\":4,\"bonusShield\":22,\"bonusMp\":22,\"potCd\":0.058,\"bonusHp\":6,\"bLck\":9,\"bGrit\":9,\"bStr\":9,\"affixes\":[{\"id\":\"dexFlat\",\"tier\":0,\"value\":5},{\"id\":\"fireRes\",\"tier\":0,\"value\":0.08}],\"_implicitStat\":\"_iBeltPot\",\"_implicitVal\":4.5,\"_implicitKo\":\"물약 쿨다운 -X%\",\"legendarySpecial\":null,\"uniqueSpecial\":null,\"itemLv\":10,\"reqLv\":0,\"socketCount\":1,\"crystals\":[null]},\"equippedSameGeneratedObject\":true,\"mats\":10000,\"rng\":[{\"kind\":\"drop\",\"value\":0.1},{\"kind\":\"drop\",\"value\":0.7},{\"kind\":\"drop\",\"value\":0.5666666666666667},{\"kind\":\"drop\",\"value\":0.01},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"affix\",\"value\":0.5705128205128205},{\"kind\":\"affix\",\"value\":0},{\"kind\":\"affix\",\"value\":0},{\"kind\":\"affix\",\"value\":0},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"factory\",\"value\":0.3},{\"kind\":\"drop\",\"value\":0.5},{\"kind\":\"drop\",\"value\":0.5},{\"kind\":\"drop\",\"value\":0.99},{\"kind\":\"drop\",\"value\":0.99}],\"events\":[\"drop\",\"pickup\",\"notify:1 낡은 허리띠 획득!\",\"lessonPickup\",\"save\",\"parts\",\"equip\",\"notify:낡은 허리띠 장착!\",\"lessonEquip\",\"save\",\"render\"]}}],\"patches\":[{\"file\":\"game.html\",\"originalSHA\":\"e462f2345682856d24bb416a17aec763281a8dceb02f21af565db189992353ea\",\"candidateSHA\":\"9fad68cc113d653b93658f5c66cd4fff7dd02e4c6c110241c40121c27eaf9bcc\"},{\"file\":\"game-easy-test.html\",\"originalSHA\":\"68fa8e17d379fdf7e9da20b153d874e2ac74544d790397b4d36edbcc1207f390\",\"candidateSHA\":\"f78e0571ebeff13fad29b2b639a27d26d544bc2b34b6f43853a986afd23a3fc2\"}],\"anchors\":[{\"file\":\"game.html\",\"label\":\"EL\",\"line\":13844,\"sha256\":\"0c8dc38ea7bc805ee70395960d4da8e7807053adfaa54b5598c2f018c2c8e2ef\",\"bytes\":38},{\"file\":\"game.html\",\"label\":\"RARITY_C\",\"line\":13861,\"sha256\":\"1d85c0a150e8b68c64fdf49350d1165a1cdff6341a08d0aa4f70488eb08ee69b\",\"bytes\":73},{\"file\":\"game.html\",\"label\":\"RARITY_MUL\",\"line\":13862,\"sha256\":\"2db0f98c2f584948fc298359c2009cb264d0cde89e54a0c71c949ec9123c11ea\",\"bytes\":45},{\"file\":\"game.html\",\"label\":\"SLOT_NAMES\",\"line\":14621,\"sha256\":\"e3866757822000bbc56eaaf7504a557770e146f68a7554ca0322a82a21941e5b\",\"bytes\":169},{\"file\":\"game.html\",\"label\":\"SLOT_EMOJI\",\"line\":15127,\"sha256\":\"737ef9833c568cadd626b22c0bc281e524222fe524e5f4a8e5d21f015688ea18\",\"bytes\":145},{\"file\":\"game.html\",\"label\":\"DROP_SLOT_POOL\",\"line\":14623,\"sha256\":\"b3feb0f8b3d3fda02b6bf8684885a544588222079a54774a547c66e364e7c4de\",\"bytes\":56},{\"file\":\"game.html\",\"label\":\"_AFSLOT\",\"line\":13875,\"sha256\":\"0bea50c5a3bf14360134fe0c0e93c2881a7ffc593e969c0507aefca3d87036e6\",\"bytes\":273},{\"file\":\"game.html\",\"label\":\"AFFIX_POOL\",\"line\":13881,\"sha256\":\"256013f5f85287d1db537767730f23a322f90f359a3b023cde303c61b1f8eae9\",\"bytes\":48879},{\"file\":\"game.html\",\"label\":\"IMPLICIT_TABLE\",\"line\":14519,\"sha256\":\"b0a106b61f446032c4eda677a2df37bf7117695ce349558268a85f79297c30eb\",\"bytes\":1210},{\"file\":\"game.html\",\"label\":\"CHAPTER_STAGES\",\"line\":15819,\"sha256\":\"c5c5e28801098f9e230e8e2808662cf37bef0a5d133718128a2103fab2dd67f4\",\"bytes\":459},{\"file\":\"game.html\",\"label\":\"TOTAL_STAGES\",\"line\":15828,\"sha256\":\"49646eb03c6c0dde9d76938e71e28153f122a1c5b53c295d88fbe8bccc95ab1d\",\"bytes\":21},{\"file\":\"game.html\",\"label\":\"SI_TO_HELL\",\"line\":15844,\"sha256\":\"b1c17a5e97932b8f017137b09106a5886436f8fb799e699c1b5fade5c0f00ebd\",\"bytes\":45},{\"file\":\"game.html\",\"label\":\"_DEMO_MODE\",\"line\":15832,\"sha256\":\"87111b3f60a02ef7a7d2dd677504ff00048bacbb7df35679c5536c1b2ef16e59\",\"bytes\":21},{\"file\":\"game.html\",\"label\":\"_DEMO_AFFIX_BANNED\",\"line\":15836,\"sha256\":\"a61f89c55e1c652175dcffbd35ff20c08a82cce591cffc5e2afc8e0a060f3f58\",\"bytes\":131},{\"file\":\"game.html\",\"label\":\"ITEM_SIZE\",\"line\":15119,\"sha256\":\"72c417ed3bfe40586cf4658715f84e1e47d599fc5eeb9fe2d789a1a229b8504e\",\"bytes\":251},{\"file\":\"game.html\",\"label\":\"WTYPE_SIZE\",\"line\":15121,\"sha256\":\"76a1598a9ebbebb944f5eb0a8a68be00714d553dc0e2dae84fe155ae8ec1b715\",\"bytes\":100},{\"file\":\"game.html\",\"label\":\"BTYPE_SIZE\",\"line\":15122,\"sha256\":\"426e081b1d4280e36a021711e0e32f9a2c5e2f2ea4ffc734ea7fc6b6a711f081\",\"bytes\":61},{\"file\":\"game.html\",\"label\":\"INV_COLS\",\"line\":15123,\"sha256\":\"5d6943fb899a37daf4ee429c84d99582b7ecba57aa7732a8715a1ea433ea3908\",\"bytes\":17},{\"file\":\"game.html\",\"label\":\"_MALICE_COST_MUL\",\"line\":26873,\"sha256\":\"a98d70594523834c5297f442d133bd5295d0b8488d4a04a881b747a08f8b9ad9\",\"bytes\":26},{\"file\":\"game.html\",\"label\":\"CR_ATK_SLOTS\",\"line\":14629,\"sha256\":\"b740361cdfa98f8e343381a6ba7ef38b6ee7a6079efa5f6bf3c1332a9aa5cf32\",\"bytes\":44},{\"file\":\"game.html\",\"label\":\"CR_ARMOR_SLOTS\",\"line\":14630,\"sha256\":\"7c6f9fd005ed67047398d920c538d23fd26284fe818d1c71b76812722aa29395\",\"bytes\":71},{\"file\":\"game.html\",\"label\":\"CR_ACC_SLOTS\",\"line\":14631,\"sha256\":\"e907d356d27729a9d19aaa75d99afa114da2bd3cf74a5ec5b9682c415f7ce44e\",\"bytes\":98},{\"file\":\"game.html\",\"label\":\"CR_DEF_SLOTS\",\"line\":14633,\"sha256\":\"72fc8ec1eaa947963da068ddfd58deb2eff5bb7e5342e360a0ea5eb86a7aad70\",\"bytes\":54},{\"file\":\"game.html\",\"label\":\"CRYSTAL_DEFS\",\"line\":14635,\"sha256\":\"5eb3ff6615ddf1f91474d0b9ddb9f01f8d25e95e6116381c5a9e2c9b269cdf28\",\"bytes\":3218},{\"file\":\"game.html\",\"label\":\"CRYSTAL_BAG_MAX\",\"line\":14726,\"sha256\":\"d559e6500642467fdb61fd1931560e40b8af4d5a78ff924e79f0fc5952ab1175\",\"bytes\":26},{\"file\":\"game.html\",\"label\":\"_diffSigned\",\"line\":…2550 tokens truncated…8a55faf7f34efd4969dd37ae8b59a8804bdde8bf6\",\"bytes\":3528},{\"file\":\"game.html\",\"label\":\"_invBagRightClick\",\"line\":46970,\"sha256\":\"50bbce895bb8bef6047be9265e0873673351e7bd40b23dffd0e47a26bdc62f47\",\"bytes\":264},{\"file\":\"game.html\",\"label\":\"_invRows\",\"line\":15465,\"sha256\":\"e1415c40ede82b6b5fc6260c57ba409eb8a478179a76c9bbdd2a00b6c4614b37\",\"bytes\":70},{\"file\":\"game.html\",\"label\":\"_itemSz\",\"line\":15467,\"sha256\":\"46bd4128c19de28f26caa21c25a0acfe5e3029d0d71ca7812c57bd78337cc33b\",\"bytes\":226},{\"file\":\"game.html\",\"label\":\"_invCategoryKey\",\"line\":15472,\"sha256\":\"b8b86509119cb9ba3be57fd921c6dbd0375220d466d30a52c040d305d3a8e501\",\"bytes\":100},{\"file\":\"game.html\",\"label\":\"_invGrid\",\"line\":15473,\"sha256\":\"74b9c7e2115c4a412fe0bba26a629e2094838795645d17797b6df83a5c80cc47\",\"bytes\":497},{\"file\":\"game.html\",\"label\":\"_invFindSpace\",\"line\":15484,\"sha256\":\"50456341b2c5ccfc03684820566bc9359e97357ece10a62a6171908fd4b59788\",\"bytes\":329},{\"file\":\"game.html\",\"label\":\"_invCanPlace\",\"line\":15537,\"sha256\":\"77aa8c57656066b731b193462f0af91949ff016157b872bb30f3c6b814b1fa90\",\"bytes\":322},{\"file\":\"game.html\",\"label\":\"xferCost\",\"line\":26894,\"sha256\":\"1c088c19e3a29c81dc2b1aa6a838794f311f3cb4e87892dd4d1b8a2c8ea726f2\",\"bytes\":124},{\"file\":\"game.html\",\"label\":\"_malCost\",\"line\":26874,\"sha256\":\"b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f\",\"bytes\":122},{\"file\":\"game.html\",\"label\":\"_itemEconomyRarity\",\"line\":26979,\"sha256\":\"13ebcae9484f58bcc31664bb25cf22a2f489b186c2e85f3080d7fe6918f57509\",\"bytes\":81},{\"file\":\"game.html\",\"label\":\"enhColor\",\"line\":26898,\"sha256\":\"8c9fd0ddcd814e6e37e454f73bd84a61d542b3b440b98e4d75a2a3c6cd7994dc\",\"bytes\":444},{\"file\":\"game.html\",\"label\":\"wp\",\"line\":15798,\"sha256\":\"c57799dd981e0961b9275fd10bbb1d4d18bf06e250e3cd1087b3302bece8a0ff\",\"bytes\":45},{\"file\":\"game.html\",\"label\":\"_lvB\",\"line\":27544,\"sha256\":\"62529184483aa49e182f0a41976ce8eeb453a58e4d729160bbaa80b17e920a16\",\"bytes\":34},{\"file\":\"game.html\",\"label\":\"_eqStatRebuild\",\"line\":26772,\"sha256\":\"f0ef63d4b10e0306f7e9f2f303d28f02895e834f6ab9a9922f1ea5f30e3add44\",\"bytes\":260},{\"file\":\"game.html\",\"label\":\"_eqStat\",\"line\":26773,\"sha256\":\"79bf05bdbc915cbba678f12f10be99f4451c0d8cbaaee2b5521f004adf1f3fde\",\"bytes\":80},{\"file\":\"game.html\",\"label\":\"_eqAffixRebuild\",\"line\":26776,\"sha256\":\"2f175d3cc00bc9b99c9f8c1c0d6d5d07d2929c41726d17fff7f587561229bb03\",\"bytes\":254},{\"file\":\"game.html\",\"label\":\"_eqAffix\",\"line\":26777,\"sha256\":\"71ce6e568ac61e5db141539ebf838e74ddf66203398e2d4e7d6ed44bc5744d7a\",\"bytes\":86},{\"file\":\"game.html\",\"label\":\"_eqImplicit\",\"line\":26798,\"sha256\":\"c2389a07e75ab49fa670ce644383a95e416d05422899f3ef427df5c4d5f23f03\",\"bytes\":148},{\"file\":\"game.html\",\"label\":\"_gritTotal\",\"line\":26704,\"sha256\":\"8e692e779dffca240886dc1645d5d72da5467e32f1a03138c39e6a6f7a6b418f\",\"bytes\":102},{\"file\":\"game.html\",\"label\":\"_gritHpFlat\",\"line\":26705,\"sha256\":\"609b3b3acd2db79f059ddf87f6ecd410072b4b136c3043bee538c6c3c271a430\",\"bytes\":44},{\"file\":\"game.html\",\"label\":\"_gritMpFlat\",\"line\":26706,\"sha256\":\"5db93b8ea858006daa959054b3b2baffb93bb8580f66fd8ca33ea31da23a0095\",\"bytes\":44},{\"file\":\"game.html\",\"label\":\"_gritStFlat\",\"line\":26707,\"sha256\":\"693b9e7ce888faa0e0a57498c809d086b419ce8424895dfd1d63d782349fe40f\",\"bytes\":44},{\"file\":\"game.html\",\"label\":\"pPredSpd\",\"line\":26857,\"sha256\":\"006fe7090ceb1bc690032f5b55d965e254f69ff97d0ed98123fae3bd95911bdd\",\"bytes\":68},{\"file\":\"game.html\",\"label\":\"recalcSt\",\"line\":15708,\"sha256\":\"994fa2b29e5be2edc9a0333d24fd3d10c269746b6da2d3d1e380daff38528e99\",\"bytes\":640},{\"file\":\"game.html\",\"label\":\"applyStats\",\"line\":26709,\"sha256\":\"4c6577217205c5b3fbcd1570e5cc97082b027cc37f4a4c8d2d5e6e47d40eaaf4\",\"bytes\":4626},{\"file\":\"game.html\",\"label\":\"enhMulAtk\",\"line\":26890,\"sha256\":\"af411c5d3f3593d0c77840e684474a560717d1505ce4cca404cb9c57a93b3ab9\",\"bytes\":92},{\"file\":\"game.html\",\"label\":\"_slotFlatAtk\",\"line\":27542,\"sha256\":\"93697121eab107221dbc9f428979a721c931fd67a08e0faf6586e69a71e10c88\",\"bytes\":201},{\"file\":\"game.html\",\"label\":\"meleeRef\",\"line\":27546,\"sha256\":\"19e617a683c4a7abc699079433d6c026fb78236b1b9ed155a0e232c196768a6e\",\"bytes\":175},{\"file\":\"game.html\",\"label\":\"_earringSlot\",\"line\":15562,\"sha256\":\"d0c11fda07829175ada1697e77c6b086342a9d928d1ea6bd6bd0bff390537971\",\"bytes\":73},{\"file\":\"game.html\",\"label\":\"_equipSlot\",\"line\":15563,\"sha256\":\"95bd4ef520c883a0e65bfe8bfb87737bcce206fee4824ff4ed092fe1175b916e\",\"bytes\":165},{\"file\":\"game.html\",\"label\":\"R selection\",\"line\":31695,\"sha256\":\"7d69d2276baee778bb4dcd53977f29e1379081284fbf7a23fc5a2dcd9f5c921c\",\"bytes\":671},{\"file\":\"game-easy-test.html\",\"label\":\"EL\",\"line\":13241,\"sha256\":\"0c8dc38ea7bc805ee70395960d4da8e7807053adfaa54b5598c2f018c2c8e2ef\",\"bytes\":38},{\"file\":\"game-easy-test.html\",\"label\":\"RARITY_C\",\"line\":13258,\"sha256\":\"1d85c0a150e8b68c64fdf49350d1165a1cdff6341a08d0aa4f70488eb08ee69b\",\"bytes\":73},{\"file\":\"game-easy-test.html\",\"label\":\"RARITY_MUL\",\"line\":13259,\"sha256\":\"2db0f98c2f584948fc298359c2009cb264d0cde89e54a0c71c949ec9123c11ea\",\"bytes\":45},{\"file\":\"game-easy-test.html\",\"label\":\"SLOT_NAMES\",\"line\":14018,\"sha256\":\"e8cd1d42e9b4ed64a7bdd90f91366f8812b16bf469371609c6bdf3e9628cf568\",\"bytes\":157},{\"file\":\"game-easy-test.html\",\"label\":\"SLOT_EMOJI\",\"line\":14251,\"sha256\":\"b6a1771981616acdf6f0f131171ec644857cef94977a99b0d0752cd32abf0974\",\"bytes\":138},{\"file\":\"game-easy-test.html\",\"label\":\"DROP_SLOT_POOL\",\"line\":14020,\"sha256\":\"b3feb0f8b3d3fda02b6bf8684885a544588222079a54774a547c66e364e7c4de\",\"bytes\":56},{\"file\":\"game-easy-test.html\",\"label\":\"_AFSLOT\",\"line\":13272,\"sha256\":\"deeba6528d060a2c6e3521ed53312db194c9f43627519e8ebc39c8f96868658d\",\"bytes\":252},{\"file\":\"game-easy-test.html\",\"label\":\"AFFIX_POOL\",\"line\":13278,\"sha256\":\"256013f5f85287d1db537767730f23a322f90f359a3b023cde303c61b1f8eae9\",\"bytes\":48879},{\"file\":\"game-easy-test.html\",\"label\":\"IMPLICIT_TABLE\",\"line\":13916,\"sha256\":\"b0a106b61f446032c4eda677a2df37bf7117695ce349558268a85f79297c30eb\",\"bytes\":1210},{\"file\":\"game-easy-test.html\",\"label\":\"CHAPTER_STAGES\",\"line\":14936,\"sha256\":\"c5c5e28801098f9e230e8e2808662cf37bef0a5d133718128a2103fab2dd67f4\",\"bytes\":459},{\"file\":\"game-easy-test.html\",\"label\":\"TOTAL_STAGES\",\"line\":14945,\"sha256\":\"49646eb03c6c0dde9d76938e71e28153f122a1c5b53c295d88fbe8bccc95ab1d\",\"bytes\":21},{\"file\":\"game-easy-test.html\",\"label\":\"SI_TO_HELL\",\"line\":14961,\"sha256\":\"b1c17a5e97932b8f017137b09106a5886436f8fb799e699c1b5fade5c0f00ebd\",\"bytes\":45},{\"file\":\"game-easy-test.html\",\"label\":\"_DEMO_MODE\",\"line\":14949,\"sha256\":\"4da29ebaef712bdeb48a6cda5247e35bb9600642e3bc506a41b3114cfaabed66\",\"bytes\":55},{\"file\":\"game-easy-test.html\",\"label\":\"_DEMO_AFFIX_BANNED\",\"line\":14953,\"sha256\":\"a61f89c55e1c652175dcffbd35ff20c08a82cce591cffc5e2afc8e0a060f3f58\",\"bytes\":131},{\"file\":\"game-easy-test.html\",\"label\":\"ITEM_SIZE\",\"line\":14243,\"sha256\":\"a1bcf111700ce971f309dcc79a0fd89032198f7f4bb074dd77fe41d3c3be659d\",\"bytes\":235},{\"file\":\"game-easy-test.html\",\"label\":\"WTYPE_SIZE\",\"line\":14245,\"sha256\":\"76a1598a9ebbebb944f5eb0a8a68be00714d553dc0e2dae84fe155ae8ec1b715\",\"bytes\":100},{\"file\":\"game-easy-test.html\",\"label\":\"BTYPE_SIZE\",\"line\":14246,\"sha256\":\"426e081b1d4280e36a021711e0e32f9a2c5e2f2ea4ffc734ea7fc6b6a711f081\",\"bytes\":61},{\"file\":\"game-easy-test.html\",\"label\":\"INV_COLS\",\"line\":14247,\"sha256\":\"5d6943fb899a37daf4ee429c84d99582b7ecba57aa7732a8715a1ea433ea3908\",\"bytes\":17},{\"file\":\"game-easy-test.html\",\"label\":\"_MALICE_COST_MUL\",\"line\":25748,\"sha256\":\"a98d70594523834c5297f442d133bd5295d0b8488d4a04a881b747a08f8b9ad9\",\"bytes\":26},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ATK_SLOTS\",\"line\":14026,\"sha256\":\"b740361cdfa98f8e343381a6ba7ef38b6ee7a6079efa5f6bf3c1332a9aa5cf32\",\"bytes\":44},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ARMOR_SLOTS\",\"line\":14027,\"sha256\":\"7c6f9fd005ed67047398d920c538d23fd26284fe818d1c71b76812722aa29395\",\"bytes\":71},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ACC_SLOTS\",\"line\":14028,\"sha256\":\"f3fed6eb028cf1b59df4ddd863319aa64e2a684c7065aaba9215c62608628726\",\"bytes\":86},{\"file\":\"game-easy-test.html\",\"label\":\"CR_DEF_SLOTS\",\"line\":14030,\"sha256\":\"72fc8ec1eaa947963da068ddfd58deb2eff5bb7e5342e360a0ea5eb86a7aad70\",\"bytes\":54},{\"file\":\"game-easy-test.html\",\"label\":\"CRYSTAL_DEFS\",\"line\":14031,\"sha256\":\"aa602b9cf5b6390aee7f55c5bad771ae22f349f35043bf192c0003953a15151e\",\"bytes\":1923},{\"file\":\"game-easy-test.html\",\"label\":\"CRYSTAL_BAG_MAX\",\"line\":14090,\"sha256\":\"d559e6500642467fdb61fd1931560e40b8af4d5a78ff924e79f0fc5952ab1175\",\"bytes\":26},{\"file\":\"game-easy-test.html\",\"label\":\"_diffSigned\",\"line\":8431,\"sha256\":\"59d025439b25269b1e1db4004a503c7c43cea14eb5364f3ed9ddcbaf6f7311be\",\"bytes\":81},{\"file\":\"game-easy-test.html\",\"label\":\"mkItem\",\"line\":14307,\"sha256\":\"1a07dde50c299aceb1d34a3fdd8e122d08fe42d5ca71b2827d0806f9336a0c3d\",\"bytes\":26141},{\"file\":\"game-easy-test.html\",\"label\":\"rollAffixes\",\"line\":13973,\"sha256\":\"b9580a70fcc9e652d794521ca6d9afd8c83b317135634662b695eeda43f49a09\",\"bytes\":2262},{\"file\":\"game-easy-test.html\",\"label\":\"rollDrop\",\"line\":29618,\"sha256\":\"99e4af8f5cc7193a01fc63e0d0e5e50ca4a5d271693d67c21fc5a15a843a7fc0\",\"bytes\":3951},{\"file\":\"game-easy-test.html\",\"label\":\"_wiPush\",\"line\":15024,\"sha256\":\"919c9a8095a8f8a635fc2b558b6ebb03872dd0a4637030b4a597a1b031a372ff\",\"bytes\":398},{\"file\":\"game-easy-test.html\",\"label\":\"_minPickLvThr\",\"line\":29617,\"sha256\":\"f6e29639d0762f3d84b8410c423f9809b718dd3b34e16b829efe40b0587b6aba\",\"bytes\":105},{\"file\":\"game-easy-test.html\",\"label\":\"pickupItem\",\"line\":14788,\"sha256\":\"b790a6796976fcb6c38fedf7cdbea03337829243141a089a40e524aa170d9146\",\"bytes\":2552},{\"file\":\"game-easy-test.html\",\"label\":\"equipItem\",\"line\":14685,\"sha256\":\"494bde4a081e2c29784f33f493e1e2c96d4446e98e45d63df43141717a4b7179\",\"bytes\":3407},{\"file\":\"game-easy-test.html\",\"label\":\"_invBagRightClick\",\"line\":45573,\"sha256\":\"50bbce895bb8bef6047be9265e0873673351e7bd40b23dffd0e47a26bdc62f47\",\"bytes\":264},{\"file\":\"game-easy-test.html\",\"label\":\"_invRows\",\"line\":14588,\"sha256\":\"e1415c40ede82b6b5fc6260c57ba409eb8a478179a76c9bbdd2a00b6c4614b37\",\"bytes\":70},{\"file\":\"game-easy-test.html\",\"label\":\"_itemSz\",\"line\":14590,\"sha256\":\"46bd4128c19de28f26caa21c25a0acfe5e3029d0d71ca7812c57bd78337cc33b\",\"bytes\":226},{\"file\":\"game-easy-test.html\",\"label\":\"_invCategoryKey\",\"line\":14595,\"sha256\":\"b8b86509119cb9ba3be57fd921c6dbd0375220d466d30a52c040d305d3a8e501\",\"bytes\":100},{\"file\":\"game-easy-test.html\",\"label\":\"_invGrid\",\"line\":14596,\"sha256\":\"74b9c7e2115c4a412fe0bba26a629e2094838795645d17797b6df83a5c80cc47\",\"bytes\":497},{\"file\":\"game-easy-test.html\",\"label\":\"_invFindSpace\",\"line\":14607,\"sha256\":\"50456341b2c5ccfc03684820566bc9359e97357ece10a62a6171908fd4b59788\",\"bytes\":329},{\"file\":\"game-easy-test.html\",\"label\":\"_invCanPlace\",\"line\":14660,\"sha256\":\"77aa8c57656066b731b193462f0af91949ff016157b872bb30f3c6b814b1fa90\",\"bytes\":322},{\"file\":\"game-easy-test.html\",\"label\":\"xferCost\",\"line\":25769,\"sha256\":\"1c088c19e3a29c81dc2b1aa6a838794f311f3cb4e87892dd4d1b8a2c8ea726f2\",\"bytes\":124},{\"file\":\"game-easy-test.html\",\"label\":\"_malCost\",\"line\":25749,\"sha256\":\"b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f\",\"bytes\":122},{\"file\":\"game-easy-test.html\",\"label\":\"_itemEconomyRarity\",\"line\":25854,\"sha256\":\"13ebcae9484f58bcc31664bb25cf22a2f489b186c2e85f3080d7fe6918f57509\",\"bytes\":81},{\"file\":\"game-easy-test.html\",\"label\":\"enhColor\",\"line\":25773,\"sha256\":\"8c9fd0ddcd814e6e37e454f73bd84a61d542b3b440b98e4d75a2a3c6cd7994dc\",\"bytes\":444},{\"file\":\"game-easy-test.html\",\"label\":\"wp\",\"line\":14915,\"sha256\":\"c57799dd981e0961b9275fd10bbb1d4d18bf06e250e3cd1087b3302bece8a0ff\",\"bytes\":45},{\"file\":\"game-easy-test.html\",\"label\":\"_lvB\",\"line\":26419,\"sha256\":\"62529184483aa49e182f0a41976ce8eeb453a58e4d729160bbaa80b17e920a16\",\"bytes\":34},{\"file\":\"game-easy-test.html\",\"label\":\"_eqStatRebuild\",\"line\":25647,\"sha256\":\"f0ef63d4b10e0306f7e9f2f303d28f02895e834f6ab9a9922f1ea5f30e3add44\",\"bytes\":260},{\"file\":\"game-easy-test.html\",\"label\":\"_eqStat\",\"line\":25648,\"sha256\":\"79bf05bdbc915cbba678f12f10be99f4451c0d8cbaaee2b5521f004adf1f3fde\",\"bytes\":80},{\"file\":\"game-easy-test.html\",\"label\":\"_eqAffixRebuild\",\"line\":25651,\"sha256\":\"2f175d3cc00bc9b99c9f8c1c0d6d5d07d2929c41726d17fff7f587561229bb03\",\"bytes\":254},{\"file\":\"game-easy-test.html\",\"label\":\"_eqAffix\",\"line\":25652,\"sha256\":\"71ce6e568ac61e5db141539ebf838e74ddf66203398e2d4e7d6ed44bc5744d7a\",\"bytes\":86},{\"file\":\"game-easy-test.html\",\"label\":\"_eqImplicit\",\"line\":25673,\"sha256\":\"c2389a07e75ab49fa670ce644383a95e416d05422899f3ef427df5c4d5f23f03\",\"bytes\":148},{\"file\":\"game-easy-test.html\",\"label\":\"_gritTotal\",\"line\":25579,\"sha256\":\"8e692e779dffca240886dc1645d5d72da5467e32f1a03138c39e6a6f7a6b418f\",\"bytes\":102},{\"file\":\"game-easy-test.html\",\"label\":\"_gritHpFlat\",\"line\":25580,\"sha256\":\"609b3b3acd2db79f059ddf87f6ecd410072b4b136c3043bee538c6c3c271a430\",\"bytes\":44},{\"file\":\"game-easy-test.html\",\"label\":\"_gritMpFlat\",\"line\":25581,\"sha256\":\"5db93b8ea858006daa959054b3b2baffb93bb8580f66fd8ca33ea31da23a0095\",\"bytes\":44},{\"file\":\"game-easy-test.html\",\"label\":\"_gritStFlat\",\"line\":25582,\"sha256\":\"693b9e7ce888faa0e0a57498c809d086b419ce8424895dfd1d63d782349fe40f\",\"bytes\":44},{\"file\":\"game-easy-test.html\",\"label\":\"pPredSpd\",\"line\":25732,\"sha256\":\"006fe7090ceb1bc690032f5b55d965e254f69ff97d0ed98123fae3bd95911bdd\",\"bytes\":68},{\"file\":\"game-easy-test.html\",\"label\":\"recalcSt\",\"line\":14825,\"sha256\":\"994fa2b29e5be2edc9a0333d24fd3d10c269746b6da2d3d1e380daff38528e99\",\"bytes\":640},{\"file\":\"game-easy-test.html\",\"label\":\"applyStats\",\"line\":25584,\"sha256\":\"78dc9315a79122b59ebd56f87a1479704683c78da0ed294452eafd6cd1e64036\",\"bytes\":4610},{\"file\":\"game-easy-test.html\",\"label\":\"enhMulAtk\",\"line\":25765,\"sha256\":\"af411c5d3f3593d0c77840e684474a560717d1505ce4cca404cb9c57a93b3ab9\",\"bytes\":92},{\"file\":\"game-easy-test.html\",\"label\":\"_slotFlatAtk\",\"line\":26417,\"sha256\":\"93697121eab107221dbc9f428979a721c931fd67a08e0faf6586e69a71e10c88\",\"bytes\":201},{\"file\":\"game-easy-test.html\",\"label\":\"meleeRef\",\"line\":26421,\"sha256\":\"533f1ffd218a7f2478a2625b740a5ac81eb2015119d63879e962104c8ae3f1aa\",\"bytes\":153},{\"file\":\"game-easy-test.html\",\"label\":\"R selection\",\"line\":30514,\"sha256\":\"7d69d2276baee778bb4dcd53977f29e1379081284fbf7a23fc5a2dcd9f5c921c\",\"bytes\":671},{\"file\":\"game-easy-test.html\",\"label\":\"EL\",\"line\":13241,\"sha256\":\"0c8dc38ea7bc805ee70395960d4da8e7807053adfaa54b5598c2f018c2c8e2ef\",\"bytes\":38},{\"file\":\"game-easy-test.html\",\"label\":\"RARITY_C\",\"line\":13258,\"sha256\":\"1d85c0a150e8b68c64fdf49350d1165a1cdff6341a08d0aa4f70488eb08ee69b\",\"bytes\":73},{\"file\":\"game-easy-test.html\",\"label\":\"RARITY_MUL\",\"line\":13259,\"sha256\":\"2db0f98c2f584948fc298359c2009cb264d0cde89e54a0c71c949ec9123c11ea\",\"bytes\":45},{\"file\":\"game-easy-test.html\",\"label\":\"SLOT_NAMES\",\"line\":14018,\"sha256\":\"e8cd1d42e9b4ed64a7bdd90f91366f8812b16bf469371609c6bdf3e9628cf568\",\"bytes\":157},{\"file\":\"game-easy-test.html\",\"label\":\"SLOT_EMOJI\",\"line\":14251,\"sha256\":\"b6a1771981616acdf6f0f131171ec644857cef94977a99b0d0752cd32abf0974\",\"bytes\":138},{\"file\":\"game-easy-test.html\",\"label\":\"DROP_SLOT_POOL\",\"line\":14020,\"sha256\":\"b3feb0f8b3d3fda02b6bf8684885a544588222079a54774a547c66e364e7c4de\",\"bytes\":56},{\"file\":\"game-easy-test.html\",\"label\":\"_AFSLOT\",\"line\":13272,\"sha256\":\"deeba6528d060a2c6e3521ed53312db194c9f43627519e8ebc39c8f96868658d\",\"bytes\":252},{\"file\":\"game-easy-test.html\",\"label\":\"AFFIX_POOL\",\"line\":13278,\"sha256\":\"256013f5f85287d1db537767730f23a322f90f359a3b023cde303c61b1f8eae9\",\"bytes\":48879},{\"file\":\"game-easy-test.html\",\"label\":\"IMPLICIT_TABLE\",\"line\":13916,\"sha256\":\"b0a106b61f446032c4eda677a2df37bf7117695ce349558268a85f79297c30eb\",\"bytes\":1210},{\"file\":\"game-easy-test.html\",\"label\":\"CHAPTER_STAGES\",\"line\":14936,\"sha256\":\"c5c5e28801098f9e230e8e2808662cf37bef0a5d133718128a2103fab2dd67f4\",\"bytes\":459},{\"file\":\"game-easy-test.html\",\"label\":\"TOTAL_STAGES\",\"line\":14945,\"sha256\":\"49646eb03c6c0dde9d76938e71e28153f122a1c5b53c295d88fbe8bccc95ab1d\",\"bytes\":21},{\"file\":\"game-easy-test.html\",\"label\":\"SI_TO_HELL\",\"line\":14961,\"sha256\":\"b1c17a5e97932b8f017137b09106a5886436f8fb799e699c1b5fade5c0f00ebd\",\"bytes\":45},{\"file\":\"game-easy-test.html\",\"label\":\"_DEMO_MODE\",\"line\":14949,\"sha256\":\"4da29ebaef712bdeb48a6cda5247e35bb9600642e3bc506a41b3114cfaabed66\",\"bytes\":55},{\"file\":\"game-easy-test.html\",\"label\":\"_DEMO_AFFIX_BANNED\",\"line\":14953,\"sha256\":\"a61f89c55e1c652175dcffbd35ff20c08a82cce591cffc5e2afc8e0a060f3f58\",\"bytes\":131},{\"file\":\"game-easy-test.html\",\"label\":\"ITEM_SIZE\",\"line\":14243,\"sha256\":\"a1bcf111700ce971f309dcc79a0fd89032198f7f4bb074dd77fe41d3c3be659d\",\"bytes\":235},{\"file\":\"game-easy-test.html\",\"label\":\"WTYPE_SIZE\",\"line\":14245,\"sha256\":\"76a1598a9ebbebb944f5eb0a8a68be00714d553dc0e2dae84fe155ae8ec1b715\",\"bytes\":100},{\"file\":\"game-easy-test.html\",\"label\":\"BTYPE_SIZE\",\"line\":14246,\"sha256\":\"426e081b1d4280e36a021711e0e32f9a2c5e2f2ea4ffc734ea7fc6b6a711f081\",\"bytes\":61},{\"file\":\"game-easy-test.html\",\"label\":\"INV_COLS\",\"line\":14247,\"sha256\":\"5d6943fb899a37daf4ee429c84d99582b7ecba57aa7732a8715a1ea433ea3908\",\"bytes\":17},{\"file\":\"game-easy-test.html\",\"label\":\"_MALICE_COST_MUL\",\"line\":25748,\"sha256\":\"a98d70594523834c5297f442d133bd5295d0b8488d4a04a881b747a08f8b9ad9\",\"bytes\":26},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ATK_SLOTS\",\"line\":14026,\"sha256\":\"b740361cdfa98f8e343381a6ba7ef38b6ee7a6079efa5f6bf3c1332a9aa5cf32\",\"bytes\":44},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ARMOR_SLOTS\",\"line\":14027,\"sha256\":\"7c6f9fd005ed67047398d920c538d23fd26284fe818d1c71b76812722aa29395\",\"bytes\":71},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ACC_SLOTS\",\"line\":14028,\"sha256\":\"f3fed6eb028cf1b59df4ddd863319aa64e2a684c7065aaba9215c62608628726\",\"bytes\":86},{\"file\":\"game-easy-test.html\",\"label\":\"CR_DEF_SLOTS\",\"line\":14030,\"sha256\":\"72fc8ec1eaa947963da068ddfd58deb2eff5bb7e5342e360a0ea5eb86a7aad70\",\"bytes\":54},{\"file\":\"game-easy-test.html\",\"label\":\"CRYSTAL_DEFS\",\"line\":14031,\"sha256\":\"aa602b9cf5b6390aee7f55c5bad771ae22f349f35043bf192c0003953a15151e\",\"bytes\":1923},{\"file\":\"game-easy-test.html\",\"label\":\"CRYSTAL_BAG_MAX\",\"line\":14090,\"sha256\":\"d559e6500642467fdb61fd1931560e40b8af4d5a78ff924e79f0fc5952ab1175\",\"bytes\":26},{\"file\":\"game-easy-test.html\",\"label\":\"_diffSigned\",\"line\":8431,\"sha256\":\"59d025439b25269b1e1db4004a503c7c43cea14eb5364f3ed9ddcbaf6f7311be\",\"bytes\":81},{\"file\":\"game-easy-test.html\",\"label\":\"mkItem\",\"line\":14307,\"sha256\":\"1a07dde50c299aceb1d34a3fdd8e122d08fe42d5ca71b2827d0806f9336a0c3d\",\"bytes\":26141},{\"file\":\"game-easy-test.html\",\"label\":\"rollAffixes\",\"line\":13973,\"sha256\":\"b9580a70fcc9e652d794521ca6d9afd8c83b317135634662b695eeda43f49a09\",\"bytes\":2262},{\"file\":\"game-easy-test.html\",\"label\":\"rollDrop\",\"line\":29618,\"sha256\":\"99e4af8f5cc7193a01fc63e0d0e5e50ca4a5d271693d67c21fc5a15a843a7fc0\",\"bytes\":3951},{\"file\":\"game-easy-test.html\",\"label\":\"_wiPush\",\"line\":15024,\"sha256\":\"919c9a8095a8f8a635fc2b558b6ebb03872dd0a4637030b4a597a1b031a372ff\",\"bytes\":398},{\"file\":\"game-easy-test.html\",\"label\":\"_minPickLvThr\",\"line\":29617,\"sha256\":\"f6e29639d0762f3d84b8410c423f9809b718dd3b34e16b829efe40b0587b6aba\",\"bytes\":105},{\"file\":\"game-easy-test.html\",\"label\":\"pickupItem\",\"line\":14788,\"sha256\":\"b790a6796976fcb6c38fedf7cdbea03337829243141a089a40e524aa170d9146\",\"bytes\":2552},{\"file\":\"game-easy-test.html\",\"label\":\"equipItem\",\"line\":14685,\"sha256\":\"494bde4a081e2c29784f33f493e1e2c96d4446e98e45d63df43141717a4b7179\",\"bytes\":3407},{\"file\":\"game-easy-test.html\",\"label\":\"_invBagRightClick\",\"line\":45573,\"sha256\":\"50bbce895bb8bef6047be9265e0873673351e7bd40b23dffd0e47a26bdc62f47\",\"bytes\":264},{\"file\":\"game-easy-test.html\",\"label\":\"_invRows\",\"line\":14588,\"sha256\":\"e1415c40ede82b6b5fc6260c57ba409eb8a478179a76c9bbdd2a00b6c4614b37\",\"bytes\":70},{\"file\":\"game-easy-test.html\",\"label\":\"_itemSz\",\"line\":14590,\"sha256\":\"46bd4128c19de28f26caa21c25a0acfe5e3029d0d71ca7812c57bd78337cc33b\",\"bytes\":226},{\"file\":\"game-easy-test.html\",\"label\":\"_invCategoryKey\",\"line\":14595,\"sha256\":\"b8b86509119cb9ba3be57fd921c6dbd0375220d466d30a52c040d305d3a8e501\",\"bytes\":100},{\"file\":\"game-easy-test.html\",\"label\":\"_invGrid\",\"line\":14596,\"sha256\":\"74b9c7e2115c4a412fe0bba26a629e2094838795645d17797b6df83a5c80cc47\",\"bytes\":497},{\"file\":\"game-easy-test.html\",\"label\":\"_invFindSpace\",\"line\":14607,\"sha256\":\"50456341b2c5ccfc03684820566bc9359e97357ece10a62a6171908fd4b59788\",\"bytes\":329},{\"file\":\"game-easy-test.html\",\"label\":\"_invCanPlace\",\"line\":14660,\"sha256\":\"77aa8c57656066b731b193462f0af91949ff016157b872bb30f3c6b814b1fa90\",\"bytes\":322},{\"file\":\"game-easy-test.html\",\"label\":\"xferCost\",\"line\":25769,\"sha256\":\"1c088c19e3a29c81dc2b1aa6a838794f311f3cb4e87892dd4d1b8a2c8ea726f2\",\"bytes\":124},{\"file\":\"game-easy-test.html\",\"label\":\"_malCost\",\"line\":25749,\"sha256\":\"b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f\",\"bytes\":122},{\"file\":\"game-easy-test.html\",\"label\":\"_itemEconomyRarity\",\"line\":25854,\"sha256\":\"13ebcae9484f58bcc31664bb25cf22a2f489b186c2e85f3080d7fe6918f57509\",\"bytes\":81},{\"file\":\"game-easy-test.html\",\"label\":\"enhColor\",\"line\":25773,\"sha256\":\"8c9fd0ddcd814e6e37e454f73bd84a61d542b3b440b98e4d75a2a3c6cd7994dc\",\"bytes\":444},{\"file\":\"game-easy-test.html\",\"label\":\"wp\",\"line\":14915,\"sha256\":\"c57799dd981e0961b9275fd10bbb1d4d18bf06e250e3cd1087b3302bece8a0ff\",\"bytes\":45},{\"file\":\"game-easy-test.html\",\"label\":\"_lvB\",\"line\":26419,\"sha256\":\"62529184483aa49e182f0a41976ce8eeb453a58e4d729160bbaa80b17e920a16\",\"bytes\":34},{\"file\":\"game-easy-test.html\",\"label\":\"_eqStatRebuild\",\"line\":25647,\"sha256\":\"f0ef63d4b10e0306f7e9f2f303d28f02895e834f6ab9a9922f1ea5f30e3add44\",\"bytes\":260},{\"file\":\"game-easy-test.html\",\"label\":\"_eqStat\",\"line\":25648,\"sha256\":\"79bf05bdbc915cbba678f12f10be99f4451c0d8cbaaee2b5521f004adf1f3fde\",\"bytes\":80},{\"file\":\"game-easy-test.html\",\"label\":\"_eqAffixRebuild\",\"line\":25651,\"sha256\":\"2f175d3cc00bc9b99c9f8c1c0d6d5d07d2929c41726d17fff7f587561229bb03\",\"bytes\":254},{\"file\":\"game-easy-test.html\",\"label\":\"_eqAffix\",\"line\":25652,\"sha256\":\"71ce6e568ac61e5db141539ebf838e74ddf66203398e2d4e7d6ed44bc5744d7a\",\"bytes\":86},{\"file\":\"game-easy-test.html\",\"label\":\"_eqImplicit\",\"line\":25673,\"sha256\":\"c2389a07e75ab49fa670ce644383a95e416d05422899f3ef427df5c4d5f23f03\",\"bytes\":148},{\"file\":\"game-easy-test.html\",\"label\":\"_gritTotal\",\"line\":25579,\"sha256\":\"8e692e779dffca240886dc1645d5d72da5467e32f1a03138c39e6a6f7a6b418f\",\"bytes\":102},{\"file\":\"game-easy-test.html\",\"label\":\"_gritHpFlat\",\"line\":25580,\"sha256\":\"609b3b3acd2db79f059ddf87f6ecd410072b4b136c3043bee538c6c3c271a430\",\"bytes\":44},{\"file\":\"game-easy-test.html\",\"label\":\"_gritMpFlat\",\"line\":25581,\"sha256\":\"5db93b8ea858006daa959054b3b2baffb93bb8580f66fd8ca33ea31da23a0095\",\"bytes\":44},{\"file\":\"game-easy-test.html\",\"label\":\"_gritStFlat\",\"line\":25582,\"sha256\":\"693b9e7ce888faa0e0a57498c809d086b419ce8424895dfd1d63d782349fe40f\",\"bytes\":44},{\"file\":\"game-easy-test.html\",\"label\":\"pPredSpd\",\"line\":25732,\"sha256\":\"006fe7090ceb1bc690032f5b55d965e254f69ff97d0ed98123fae3bd95911bdd\",\"bytes\":68},{\"file\":\"game-easy-test.html\",\"label\":\"recalcSt\",\"line\":14825,\"sha256\":\"994fa2b29e5be2edc9a0333d24fd3d10c269746b6da2d3d1e380daff38528e99\",\"bytes\":640},{\"file\":\"game-easy-test.html\",\"label\":\"applyStats\",\"line\":25584,\"sha256\":\"78dc9315a79122b59ebd56f87a1479704683c78da0ed294452eafd6cd1e64036\",\"bytes\":4610},{\"file\":\"game-easy-test.html\",\"label\":\"enhMulAtk\",\"line\":25765,\"sha256\":\"af411c5d3f3593d0c77840e684474a560717d1505ce4cca404cb9c57a93b3ab9\",\"bytes\":92},{\"file\":\"game-easy-test.html\",\"label\":\"_slotFlatAtk\",\"line\":26417,\"sha256\":\"93697121eab107221dbc9f428979a721c931fd67a08e0faf6586e69a71e10c88\",\"bytes\":201},{\"file\":\"game-easy-test.html\",\"label\":\"meleeRef\",\"line\":26421,\"sha256\":\"19e617a683c4a7abc699079433d6c026fb78236b1b9ed155a0e232c196768a6e\",\"bytes\":175},{\"file\":\"game-easy-test.html\",\"label\":\"R selection\",\"line\":30514,\"sha256\":\"7d69d2276baee778bb4dcd53977f29e1379081284fbf7a23fc5a2dcd9f5c921c\",\"bytes\":671}],\"docsSearch\":{\"keywords\":\"strFlat|힘의|STR|meleeRef\",\"lines\":294,\"sha256\":\"c0f085d9daefd5c789c5d3b14ea5eb7b27a0f3f5a4683d74216a5888c931913e\"},\"productionApplied\":false,\"nativeTested\":false,\"actual\":\"whole rollDrop/mkItem/rollAffixes/R equipment selection/pickupItem/equipItem/_invBagRightClick/applyStats/recalcSt/meleeRef\",\"observers\":\"DOM page metadata, rendering/audio/save/lesson/text/particles; statDropBonus=1; deterministic RNG by source call stack; synthetic fixed weapon and base player; kill caller not executed\"}\n"
  },
  "failures": [
    {
      "chunk_id": "fedcc2",
      "wall_time_seconds": 0.184955292,
      "exit_code": 1,
      "original_token_count": 238,
      "output": "evalmachine.<anonymous>:1200\n        if(pickupItem(wi.item)){wi.picked=true;addParts(wi.x,wi.y,RARITY_C[wi.item.rarity]||'#aaa',6);if(deathDrop&&deathDrop.item===wi.item)deathDrop=null}\n                                                                  ^\n\nReferenceError: RARITY_C is not defined\n    at rPickup (evalmachine.<anonymous>:1200:67)\n    at evalmachine.<anonymous>:1:1\n    at Script.runInContext (node:vm:149:12)\n    at Object.runInContext (node:vm:301:6)\n    at run (file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:72:6)\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:81:11\n    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)\n    at async node:internal/modules/esm/loader:246:26\n    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:243:20)\n    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)\n\nNode.js v24.15.0\n"
    },
    {
      "chunk_id": "08fa1b",
      "wall_time_seconds": 0.195283208,
      "exit_code": 1,
      "original_token_count": 192,
      "output": "node:internal/modules/run_main:107\n    triggerUncaughtException(\n    ^\n\nAssertionError [ERR_ASSERTION]: Expected values to be strictly equal:\n\n14 !== 5\n\n    at run (file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:76:33)\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:81:11\n    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)\n    at async node:internal/modules/esm/loader:246:26\n    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:243:20)\n    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5) {\n  generatedMessage: true,\n  code: 'ERR_ASSERTION',\n  actual: 14,\n  expected: 5,\n  operator: 'strictEqual',\n  diff: 'simple'\n}\n\nNode.js v24.15.0\n"
    },
    {
      "chunk_id": "f50d36",
      "wall_time_seconds": 0.18982575,
      "exit_code": 1,
      "original_token_count": 192,
      "output": "node:internal/modules/run_main:107\n    triggerUncaughtException(\n    ^\n\nAssertionError [ERR_ASSERTION]: Expected values to be strictly equal:\n\n85 !== 70\n\n    at run (file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:76:83)\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:81:11\n    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)\n    at async node:internal/modules/esm/loader:246:26\n    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:243:20)\n    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5) {\n  generatedMessage: true,\n  code: 'ERR_ASSERTION',\n  actual: 85,\n  expected: 70,\n  operator: 'strictEqual',\n  diff: 'simple'\n}\n\nNode.js v24.15.0\n"
    },
    {
      "chunk_id": "358ce9",
      "wall_time_seconds": 0.459539375,
      "exit_code": 1,
      "original_token_count": 519,
      "output": "node:internal/modules/run_main:107\n    triggerUncaughtException(\n    ^\n\nAssertionError [ERR_ASSERTION]: Expected values to be strictly equal:\n+ actual - expected\n\n+ undefined\n- {\n-   _implicitKo: '물약 쿨다운 -X%',\n-   _implicitStat: '_iBeltPot',\n-   _implicitVal: 4.5,\n-   affixes: [\n-     {\n-       id: 'strFlat',\n-       tier: 0,\n-       value: 5\n-     },\n-     {\n-       id: 'fireRes',\n-       tier: 0,\n-       value: 0.08\n-     }\n-   ],\n-   bGrit: 9,\n-   bLck: 9,\n-   bStr: 9,\n-   bonusHp: 6,\n-   bonusMp: 22,\n-   bonusShield: 22,\n-   bonusSt: 4,\n-   crystals: [\n-     null\n-   ],\n-   eDef: 23,\n-   el: 0,\n-   emoji: '🪢',\n-   id: 12345.3,\n-   itemLv: 10,\n-   legendarySpecial: null,\n-   name: '낡은 허리띠',\n-   potCd: 0.058,\n-   rarity: 1,\n-   reqLv: 0,\n-   slot: 'belt',\n-   socketCount: 1,\n-   tier: 0,\n-   uniqueSpecial: null\n- }\n\n    at run (file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:72:59)\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:81:11\n    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)\n    at async node:internal/modules/esm/loader:246:26\n    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:243:20)\n    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5) {\n  generatedMessage: true,\n  code: 'ERR_ASSERTION',\n  actual: undefined,\n  expected: {\n    id: 12345.3,\n    slot: 'belt',\n    el: 0,\n    rarity: 1,\n    tier: 0,\n    name: '낡은 허리띠',\n    emoji: '🪢',\n    eDef: 23,\n    bonusSt: 4,\n    bonusShield: 22,\n    bonusMp: 22,\n    potCd: 0.058,\n    bonusHp: 6,\n    bLck: 9,\n    bGrit: 9,\n    bStr: 9,\n    affixes: [\n      { id: 'strFlat', tier: 0, value: 5 },\n      { id: 'fireRes', tier: 0, value: 0.08 }\n    ],\n    _implicitStat: '_iBeltPot',\n    _implicitVal: 4.5,\n    _implicitKo: '물약 쿨다운 -X%',\n    legendarySpecial: null,\n    uniqueSpecial: null,\n    itemLv: 10,\n    reqLv: 0,\n    socketCount: 1,\n    crystals: [ null ]\n  },\n  operator: 'strictEqual',\n  diff: 'simple'\n}\n\nNode.js v24.15.0\n"
    }
  ],
  "syntax": {
    "chunk_id": "343de3",
    "wall_time_seconds": 0.228396166,
    "exit_code": 0,
    "original_token_count": 1770,
    "output": "{\"f\":\"game.html\",\"scripts\":6,\"json\":1,\"sha\":\"9fad68cc113d653b93658f5c66cd4fff7dd02e4c6c110241c40121c27eaf9bcc\"}\n{\"f\":\"game-easy-test.html\",\"scripts\":6,\"json\":1,\"sha\":\"f78e0571ebeff13fad29b2b639a27d26d544bc2b34b6f43853a986afd23a3fc2\"}\n{\"docsLines\":294,\"docsSHA\":\"9badf32782ec4c1e7ac85224662ccad19210f4ee8da89f9491e0d42c2a1ee297\",\"files\":[\"docs/PERF_MAC_CHROME_AUDIT.md\",\"docs/_archive/AUTOLOOP_STATE.md\",\"docs/7아이템디자인/어픽스_Layer_전수매핑_402_2026-08-10.md\",\"docs/2_3 돌진+패링+방패시스템/2_3 돌진+패링+방패시스템.md\",\"docs/7아이템디자인/슬롯별_어픽스_풀.md\",\"docs/7아이템디자인/exoduser-item-system-full.md\",\"docs/3.1 ui hud 디자인/LOBBY_ANCESTOR_ART_20260928.md\",\"docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md\",\"docs/5.1임펙트디자인/CHAIN_SLAM_FORWARD_CLEAVE_20260929.md\",\"docs/3.1 ui hud 디자인/PASSIVE_BODY_TREE_UI_20260909.md\",\"docs/7아이템디자인/아이템_어픽스_시스템.md\",\"docs/10ai에셋프롬프트모음/pixellab_monster_prompts.md\",\"docs/12퍼포먼스·최적화/GPU-Bullet-System.md\",\"docs/3.3 키바인딩+설정/게임패드_벤치마킹_엘든링_디아블로4.md\",\"docs/15 세이브+데이터구조/15 세이브+데이터구조.md\",\"docs/5.0애니메이션파이프라인/LOBBY_VARKAN_SPRITE_VIDEO_20260928.md\",\"docs/7아이템디자인/어픽스_시스템_현황분석_2026-08-10.md\",\"docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md\",\"docs/5.0애니메이션파이프라인/ANCESTOR_GROK2_SPRITE_TRIAL_20260928.md\",\"docs/7아이템디자인/유니크_어픽스_리스트.md\",\"docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md\",\"docs/3.3 키바인딩+설정/게임패드_호버_상호작용.md\",\"docs/7아이템디자인/어픽스_Layer_재분류_설계_2026-08-10.md\",\"docs/3.1 ui hud 디자인/lobby_full_patch.md\",\"docs/3.1 ui hud 디자인/PASSIVE_TREE_REDESIGN_20260909.md\",\"docs/12퍼포먼스·최적화/12퍼포먼스·최적화.md\",\"docs/2_2 무기+활+속성시스템/2_2 무기+활+속성시스템.md\",\"docs/5.1임펙트디자인/PHASE_V1_MOTION_FIREZONE_SEAL.md\",\"docs/2_9 결정슬롯시스템/2_9 결정슬롯시스템.md\",\"docs/12퍼포먼스·최적화/FRAME_DROP_HUD_TEXT_20260928.md\",\"docs/3.1 ui hud 디자인/PASSIVE_CONSTELLATION_20260909.md\",\"docs/3.1 ui hud 디자인/능력치_패시브_개편_20260909.md\",\"docs/archetypes/silvertail/SILVERTAIL_ARCHETYPE_v1.md\",\"docs/4.1맵디자인+설정/VERTICAL_ASCENT_LANGUAGE.md\",\"docs/13출시·마케팅/시장포지셔닝_정통루팅ARPG.md\",\"docs/10ai에셋프롬프트모음/UI_아이콘_GPT_생성프롬프트팩.md\",\"docs/CHANGELOG_SYNC.md\",\"docs/4.1맵디자인+설정/EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md\",\"docs/4.1맵디자인+설정/맵제작_SSOT.md\",\"docs/13출시·마케팅/HELL_DIROI_종합확장전략기획서_v2_0.md\",\"docs/4.1맵디자인+설정/CH1_1_FINAL_REVIEW_20260916.md\",\"docs/12퍼포먼스·최적화/성능최적화_보고서_2026-05-23.md\",\"docs/3.2메타·진행시스템/3.2메타·진행시스템.md\",\"docs/4.1맵디자인+설정/_MAP_SSOT_INDEX.md\",\"docs/4.1맵디자인+설정/CH1_LANDMARK_CENTER_PASS.md\",\"docs/0마스터플랜/EXODUSER_MASTER_BIBLE_v2_2 (2).md\",\"docs/4.1맵디자인+설정/CH1_MAP_KIT_OptionB.md\",\"docs/4.1맵디자인+설정/맵구성_1장.md\",\"docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md\",\"docs/4.1맵디자인+설정/MAP_QA_GATES.md\",\"docs/2_7 인벤토리+장비시스템/3파트_아이템분류.md\",\"docs/4.1맵디자인+설정/WORLD_STRUCTURE_SSOT.md\",\"docs/14밸런스+수치테이블/14밸런스+수치테이블.md\",\"docs/13출시·마케팅/13출시·마케팅.md\",\"docs/14밸런스+수치테이블/스킬_밸런스_리포트.md\",\"docs/archetypes/silvertail/SILVERTAIL_ARCHETYPE_v1_1.md\",\"docs/14밸런스+수치테이블/패시브효과표.md\",\"docs/2_1 스킬관리+합체시스템+자원/KISLASH_HOLD_CHARGE_20260927.md\",\"docs/archetypes/silvertail/SILVERTAIL_LOCKED_SPEC_v1_2.md\",\"docs/14밸런스+수치테이블/스킬별_DPS_자원소비표.md\",\"docs/4.1맵디자인+설정/맵제작_타게임전수조사.md\",\"docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md\",\"docs/14밸런스+수치테이블/스킬데미지공식표.md\",\"docs/cinematic/B04_V2_HIGGSFIELD_VIDEO_REVIEW.md\",\"docs/14밸런스+수치테이블/BASIC_ATTACK_DAMAGE_20260910.md\",\"docs/2_1 스킬관리+합체시스템+자원/자원리젠+소모공식.md\",\"docs/14밸런스+수치테이블/BALANCE_WORKBOOK.md\",\"docs/14밸런스+수치테이블/BALANCE_ECONOMY_TEAM_MASTER.md\",\"docs/최종기획서/build_document.py\",\"docs/2_1 스킬관리+합체시스템+자원/추천빌드_SKILL_REC_PATH.md\",\"docs/cinematic/WORLD_INTRO_FULL_REVIEW_20260906.md\",\"docs/최종기획서/README.md\",\"docs/14밸런스+수치테이블/EARLY_COMBAT_5_7_1_20260910.md\",\"docs/4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md\",\"docs/2_1 스킬관리+합체시스템+자원/자원리젠+소모공식__NFD_0628_2305_백업.md\",\"docs/4.0케릭터스프라이트 디자인/캐릭터_몬스터_보스_최적화디자인_v1.md\",\"docs/2_5 부활+에너지쉴드시스템/2_5 부활+에너지쉴드시스템.md\",\"docs/4.1맵디자인+설정/MAP_IMPLEMENTATION_ROADMAP.md\",\"docs/2_4 펫시스템/2_4 펫시스템.md\",\"docs/8.1보스디자인바이블/DARK_DRUID_FINALE_QA_20260909.md\",\"docs/16번역·로컬라이제이션/UI_TRANSLATIONS_20260909.md\",\"docs/8.1보스디자인바이블/BOSS_00_FOREST_NORMAL_EYE_SENTINEL.md\",\"docs/2_4 펫시스템/대사_스크립트.md\",\"docs/8.0몬스터디자인/탄막시스템_총정리.md\",\"docs/8.0몬스터디자인/몬스터_공격시스템.md\",\"docs/8.1보스디자인바이블/BOSS_RUNTIME_TAXONOMY_SOURCE_SYNC_20261002.md\",\"docs/8.0몬스터디자인/몬스터_총관리.md\",\"docs/4.1맵디자인+설정/CH1_1_SMOOTHING_PASS.md\",\"docs/cinematic/B04_V3_DEMON_DUELS_20260907.md\",\"docs/cinematic/WARINTRO_CONSEQUENCE_V10_20260909.md\",\"docs/16번역·로컬라이제이션/번역대상_전체목록.md\",\"docs/8.1보스디자인바이블/BOSS_00_FOREST_NORMAL_OBSIDIAN_FLAME_DESTROYER.md\",\"docs/8.0몬스터디자인/ENEMY_GL_2D_BODY_FALLBACK_GATE_20261002.md\",\"docs/cinematic/PROLOGUE_STORYBOARD_v1.md\",\"docs/16번역·로컬라이제이션/번역대상_펫대사.md\",\"docs/16번역·로컬라이제이션/LOCALIZATION_RUNTIME_20260909.md\",\"docs/4.1맵디자인+설정/CH1_OUTER_MASS_FIRST_PASS.md\",\"docs/16번역·로컬라이제이션/번역대상_UI시스템.md\",\"docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md\",\"docs/미구현+구현예정.md\",\"docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/supervisor/SUPERVISOR_STATE.json\",\"docs/0마스터플랜/mac-resume-20261001/ui03-evidence/SKILL-팀검토.md\",\"docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/CONTINUOUS-INTEGRATION-20261002.md\",\"docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/FOUR-NEXT-20261002.md\",\"docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/ITEM-d10-result.md\",\"docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/BALANCE-d10-result.md\"]}\n"
  },
  "syntaxFailures": [
    {
      "chunk_id": "233f54",
      "wall_time_seconds": 0.000006333,
      "exit_code": 1,
      "original_token_count": 589,
      "output": "file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:1\nimport fs from 'node:fs';import vm from 'node:vm';import crypto from 'node:crypto';import{spawnSync}from'node:child_process';const sha=s=>crypto.createHash('sha256').update(s).digest('hex');for(const f of ['game.html','game-easy-test.html']){let s=fs.readFileSync(f,'utf8');const a=\"(STATS.str+_eqStat('Str')+_lvB()))*(P._weaponSeal\",b=\"(STATS.str+_eqStat('Str')+_lvB()+~~_eqAffix('strFlat')))*(P._weaponSeal\";if(s.split(a).length!==2)throw Error('anchor');s=s.replace(a,b);let scripts=0,json=0;for(const m of s.matchAll(/<script([^>]*)>([\\s\\S]*?)<\\/script>/g)){if(/src=/.test(m[1]))continue;if(/importmap|application\\/json/.test(m[1])){JSON.parse(m[2]);json++;continue}if(/type=['\"]module/.test(m[1]))throw Error('unexpected module');new vm.Script(m[2]);scripts++;}console.log(JSON.stringify({f,scripts,json,sha:sha(s)}));}const r=spawnSync('rg',['-n','strFlat|힘의|STR|meleeRef','docs/'],{encoding:'utf8',maxBuffer:16*1024*1024});if(r.status!==0)throw Error('rg');console.log(JSON.stringify({docsLines:r.stdout.trimEnd().split('\\n').length,docsSHA:sha(r.stdout),files:[...new Set(r.stdout.split('\\n').map(l=>l.split(':')[0]))].filter(Boolean)}));\n                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    ^\n\nError: unexpected module\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:1:709\n    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)\n    at async node:internal/modules/esm/loader:246:26\n    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:243:20)\n    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)\n\nNode.js v24.15.0\n"
    }
  ]
}
```

## Existing syntax harness

```js
import{parse}from'acorn';import fs from 'node:fs';import vm from 'node:vm';import crypto from 'node:crypto';import{spawnSync}from'node:child_process';const sha=s=>crypto.createHash('sha256').update(s).digest('hex');for(const f of ['game.html','game-easy-test.html']){let s=fs.readFileSync(f,'utf8');const a="(STATS.str+_eqStat('Str')+_lvB()))*(P._weaponSeal",b="(STATS.str+_eqStat('Str')+_lvB()+~~_eqAffix('strFlat')))*(P._weaponSeal";if(s.split(a).length!==2)throw Error('anchor');s=s.replace(a,b);let scripts=0,json=0;for(const m of s.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){if(/src=/.test(m[1]))continue;if(/importmap|application\/json/.test(m[1])){JSON.parse(m[2]);json++;continue}parse(m[2],{ecmaVersion:'latest',sourceType:/type=['"]module/.test(m[1])?'module':'script'});scripts++;}console.log(JSON.stringify({f,scripts,json,sha:sha(s)}));}const r=spawnSync('rg',['-n','strFlat|힘의|STR|meleeRef','docs/'],{encoding:'utf8',maxBuffer:16*1024*1024});if(r.status!==0)throw Error('rg');console.log(JSON.stringify({docsLines:r.stdout.trimEnd().split('\n').length,docsSHA:sha(r.stdout),files:[...new Set(r.stdout.split('\n').map(l=>l.split(':')[0]))].filter(Boolean)}));
```
