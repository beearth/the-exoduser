# ITEM unequip bag-count guard — saved source evidence

Completion: ITEM-unequip-count-cap-rolling1445-20261002

Authorization: actual received SUPERVISOR-ITEM-1451 delivers 2 files at this completion boundary. STATE read0a4c83 still says reservation not writable until actual boundary delivery; this message is that delivery. Unique new folder, older artifacts immutable. No production/shared-doc/Git/native/save/browser edits.

## Existing execution, not rerun

Original execution dd128b exit0: 8 distinct source/candidate groups. Armor card and ossuary urn actual contextmenu callbacks; whole unequip/grid functions. Both files. At299 normal→300 identical. At300 original→301 and clears equipped; candidate stays300, same item remains equipped, enh3/refund7/crystal object unchanged/mats123. Descriptor fixtures and apply/render/save/audio observers; actual DOM/CP/sound/save/native UNKNOWN. Armor failure still calls existing applyStats/render once, ossuary failure earlyreturns with no selection clear. No equip/swap/R/pickup old tests replayed. Saved checks.mjs is pure transform only, saved test file was not executed; Node syntax check only planned. Numeric contracts remain BAG_MAX300/common count, grid categories unchanged.

Script SHA aaed1ce99553687b64d39dd2a23ea54d8df38705e7ee67d189148df71f26caf5
Raw stdout SHA717c15bcb94671b43f3069be48eb9d858edf0e373cee4c3086f5d9ea49f51855
Memory patch SHAe79da533d1f9b308650fd152ddc387c3423b9427a56c2fe32c1fcc1943da86ea
Memory handoff SHA574f473090e05adbe469001a8d20a1d58d80f3052f4130ed56840edfe49a0d43

## Root synchronization handoff

| Location | Exact rule | Scope |
|---|---|---|
| unequipItem | after if(!item)return, before size/INV.bag.push: if(INV.bag.length>=BAG_MAX){notify(_T('가방에 공간이 없습니다!'));return} | both game files; count300 unchanged |
| armor contextmenu | current failed item stays equipped; existing applyStats/render calls remain | no caller patch |
| ossuary urn contextmenu | existing if(INV.equipped.ossuary)return preserves selection on failure | normal success clears selected |
| resources | no enhancement/refund/crystal/cost/RNG modifications | values in tests are fixtures |
| docs2_7 + docs15 matching sections | document common count rejection for unequip alongside grid rejection and existing equipped ownership | root edits; shared docs untouched here |
| equip swap | not executed by this submission | old results not counted in8 |

Post-save-code docs whole search receipt:
```json
{"exit":0,"lines":150,"sha":"c64bb408ece33894ced49b2ec7ac6c5a267cefcba6cf8d822263d60a8abe616d"}

```

## Complete metadata
```json
{
  "completion": "ITEM-unequip-mixed-bag-cap-current-slot-memory-20261002-1434",
  "groups": 8,
  "execChunk": "dd128b",
  "exit": 0,
  "patch": "export function applyUnequipCountPatch(s){const old='function unequipItem(slot){\\n  const item=INV.equipped[slot];\\n  if(!item)return;';assert.equal(s.split(old).length,2);return s.replace(old,old+\"\\n  if(INV.bag.length>=BAG_MAX){notify(_T('가방에 공간이 없습니다!'));return}\")}",
  "docs": {
    "exit": 0,
    "lines": 151,
    "sha": "2c9f98cdbe59c4b0f19f428b26e027d2f9e81e667acdaaa8b3cd15a06fee5c2e"
  },
  "anchors": [
    {
      "file": "game.html",
      "sourceSHA": "e462f2345682856d24bb416a17aec763281a8dceb02f21af565db189992353ea",
      "candidateSHA": "6dc50a73ee6e6eb283de2ff42bf409ecb16e8a6abdd3360dff93f6563af4328d",
      "callbackSHA": "a497b1a1c425cda2381ad2ebb8bc4a9a9d53dd23a53208c738398b03d5cf4fee",
      "urnSHA": "a5aac87144b42ffbdd06fe2f6580ae16e619c299b9e045f80e61ed736c1f856f",
      "unequipSHA": "4db94632e0350e764141bc257d45482d9a630caa9a7ef544c5006293239048f0",
      "syntax": 6
    },
    {
      "file": "game-easy-test.html",
      "sourceSHA": "68fa8e17d379fdf7e9da20b153d874e2ac74544d790397b4d36edbcc1207f390",
      "candidateSHA": "b10b56b5b47ba3c45357e2c2ae85f42385a7b89e1045fd60d3f36e0594b51016",
      "callbackSHA": "a497b1a1c425cda2381ad2ebb8bc4a9a9d53dd23a53208c738398b03d5cf4fee",
      "urnSHA": "a5aac87144b42ffbdd06fe2f6580ae16e619c299b9e045f80e61ed736c1f856f",
      "unequipSHA": "4db94632e0350e764141bc257d45482d9a630caa9a7ef544c5006293239048f0",
      "syntax": 6
    }
  ],
  "docsRootTable": [
    [
      "unequipItem",
      "after !item earlyreturn, before grid lookup/bag push count gate",
      "INV.bag.length>=BAG_MAX; notify existing no-space text; BAG_MAX300 unchanged"
    ],
    [
      "armor contextmenu",
      "failed unequip keeps equipped item; existing caller applyStats/render still1 each",
      "render/apply observers only, full stats/DOM not executed"
    ],
    [
      "ossuary contextmenu",
      "existing guard if(INV.equipped.ossuary)return prevents selection clear/refresh on failure",
      "same object/slot remains; normal success selectednull"
    ],
    [
      "item state",
      "enh3/_enhRefund7/samecrystal identity preserved; mats123 unchanged",
      "fixtures not production values altered"
    ],
    [
      "equip swap",
      "existing code returns old then removes incoming item; not exercised in this submission",
      "old lifecycle/swap results not rerun nor included in8"
    ]
  ],
  "scope": "Actual whole unequip/grid functions and actual armor card contextmenu + ossuary urn contextmenu. Legal descriptor fixtures and render/apply/save/audio observers. No previous R/BAG_MAX pickup tests repeated, no actual browser/render/CP/save/audio/equip swap replay.",
  "newFiles": 0,
  "productionWrites": 0,
  "sharedDocsWrites": 0,
  "gitCalls": 0,
  "nativeTests": 0,
  "submittedArtifactsEdited": 0
}
```

## Exact original script
```js
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import crypto from 'node:crypto';import {parseExpressionAt,parse} from 'acorn';import {spawnSync} from 'node:child_process';const sha=s=>crypto.createHash('sha256').update(s).digest('hex'),rows=[],anchors=[];
function f(s,n){const i=s.indexOf('function '+n+'(');assert(i>=0);return s.slice(i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end)}
function c(s,n){const k='const '+n+'=',i=s.indexOf(k);assert(i>=0);return s.slice(i,parseExpressionAt(s,i+k.length,{ecmaVersion:'latest'}).end)+';'}
export function applyUnequipCountPatch(s){const old='function unequipItem(slot){\n  const item=INV.equipped[slot];\n  if(!item)return;';assert.equal(s.split(old).length,2);return s.replace(old,old+"\n  if(INV.bag.length>=BAG_MAX){notify(_T('가방에 공간이 없습니다!'));return}")}
for(const file of ['game.html','game-easy-test.html']){const source=fs.readFileSync(file,'utf8'),patched=applyUnequipCountPatch(source);
const ci=source.lastIndexOf('div.oncontextmenu=',source.indexOf('// 우클릭 → 해제')),cs=ci+'div.oncontextmenu='.length,callback=source.slice(cs,parseExpressionAt(source,cs,{ecmaVersion:'latest'}).end);
const ui=source.indexOf('urn.oncontextmenu='),us=ui+'urn.oncontextmenu='.length,urn=source.slice(us,parseExpressionAt(source,us,{ecmaVersion:'latest'}).end);assert(ci>=0&&ui>=0);
anchors.push({file,sourceSHA:sha(source),candidateSHA:sha(patched),callbackSHA:sha(callback),urnSHA:sha(urn),unequipSHA:sha(f(source,'unequipItem'))});
function run(slot,count,candidate){const bag=Array.from({length:count},(_,i)=>({id:'B'+i,slot:'bonePart',anc:'iron_warlord',part:'skull',rarity:0,tier:0,_gx:i%10,_gy:Math.floor(i/10)})),refs=[...bag],crystal={id:'FIXTURE_CR',enh:2},item={id:'EQUIPPED',slot,rarity:5,enh:3,_enhRefund:7,socketCount:1,crystals:[crystal],name:'fixture'},trace={save:0,recalc:0,apply:0,render:0,clear:0,fm:0,noise:0},notes=[];
const x=vm.createContext({INV:{bag,equipped:{[slot]:item},selected:'eq:'+slot},BAG_MAX:300,G:{mats:123},P:{lv:10},item,slot,oss:item,_T:s=>s,notify:s=>notes.push(s),recalcSt(){trace.recalc++},dbSaveForce(){trace.save++},applyStats(){trace.apply++},renderInv(){trace.render++},_invClearHover(){trace.clear++},playFM(){trace.fm++},playNoise(){trace.noise++}});
const t=candidate?patched:source;vm.runInContext(['ITEM_SIZE','WTYPE_SIZE','BTYPE_SIZE','INV_COLS'].map(n=>c(t,n)).join('\n')+'\n'+['_invRows','_itemSz','_invCategoryKey','_invGrid','_invFindSpace','unequipItem'].map(n=>f(t,n)).join('\n')+'\nconst callback='+ (slot==='ossuary'?urn:callback)+';callback({preventDefault(){}})',x);
const row={file,slot,count,candidate,bagCount:bag.length,equippedSame:x.INV.equipped[slot]===item,newInBag:bag.includes(item),refsPreserved:refs.every(it=>bag.includes(it)),enh:item.enh,refund:item._enhRefund,crystalSame:item.crystals[0]===crystal,crystalCount:item.crystals.filter(Boolean).length,mats:x.G.mats,selected:x.INV.selected,position:[item._gx??null,item._gy??null],trace,notes};rows.push(row);return row;}
for(const slot of ['armor','ossuary'])for(const count of [299,300]){const a=run(slot,count,false),b=run(slot,count,true);assert(b.refsPreserved&&b.crystalSame);assert.equal(b.enh,3);assert.equal(b.refund,7);assert.equal(b.mats,123);assert.equal(b.bagCount,300);if(count===299){const trim=({candidate,...v})=>v;assert.deepEqual(trim(a),trim(b));assert(b.newInBag&&!b.equippedSame);assert.equal(b.trace.save,1)}else{assert.equal(a.bagCount,301);assert(!a.equippedSame&&a.newInBag);assert(b.equippedSame&&!b.newInBag);assert.equal(b.trace.save,0);assert.equal(b.trace.recalc,0);assert.equal(b.trace.fm+b.trace.noise,0)}}
let syntax=0;for(const m of patched.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(/src\s*=|importmap/.test(m[1]))continue;parse(m[2],{ecmaVersion:'latest',sourceType:/type\s*=\s*['"]module/.test(m[1])?'module':'script',allowReturnOutsideFunction:true});syntax++}anchors.at(-1).syntax=syntax;
}
const docs=spawnSync('rg',['-n','unequipItem|BAG_MAX|가방.*가득|해제.*공간|교체.*공간|해제.*실패|유골함.*해제','docs/'],{encoding:'utf8',maxBuffer:16000000});assert.equal(docs.status,0);
console.log(JSON.stringify({completion:'ITEM-unequip-mixed-bag-cap-current-slot-memory-20261002-1434',groups:8,rows,anchors,docs:{exit:docs.status,lines:docs.stdout.split('\n').length-1,sha:sha(docs.stdout)},scope:'Actual whole unequip/grid functions and actual armor card contextmenu + ossuary urn contextmenu. Legal descriptor fixtures and render/apply/save/audio observers. No previous R/BAG_MAX pickup tests repeated, no actual browser/render/CP/save/audio/equip swap replay.'},null,2));
```

## Exact original execution output
```json
{
  "completion": "ITEM-unequip-mixed-bag-cap-current-slot-memory-20261002-1434",
  "groups": 8,
  "rows": [
    {
      "file": "game.html",
      "slot": "armor",
      "count": 299,
      "candidate": false,
      "bagCount": 300,
      "equippedSame": false,
      "newInBag": true,
      "refsPreserved": true,
      "enh": 3,
      "refund": 7,
      "crystalSame": true,
      "crystalCount": 1,
      "mats": 123,
      "selected": "eq:armor",
      "position": [
        0,
        0
      ],
      "trace": {
        "save": 1,
        "recalc": 1,
        "apply": 1,
        "render": 1,
        "clear": 0,
        "fm": 1,
        "noise": 1
      },
      "notes": [
        "fixture 해제"
      ]
    },
    {
      "file": "game.html",
      "slot": "armor",
      "count": 299,
      "candidate": true,
      "bagCount": 300,
      "equippedSame": false,
      "newInBag": true,
      "refsPreserved": true,
      "enh": 3,
      "refund": 7,
      "crystalSame": true,
      "crystalCount": 1,
      "mats": 123,
      "selected": "eq:armor",
      "position": [
        0,
        0
      ],
      "trace": {
        "save": 1,
        "recalc": 1,
        "apply": 1,
        "render": 1,
        "clear": 0,
        "fm": 1,
        "noise": 1
      },
      "notes": [
        "fixture 해제"
      ]
    },
    {
      "file": "game.html",
      "slot": "armor",
      "count": 300,
      "candidate": false,
      "bagCount": 301,
      "equippedSame": false,
      "newInBag": true,
      "refsPreserved": true,
      "enh": 3,
      "refund": 7,
      "crystalSame": true,
      "crystalCount": 1,
      "mats": 123,
      "selected": "eq:armor",
      "position": [
        0,
        0
      ],
      "trace": {
        "save": 1,
        "recalc": 1,
        "apply": 1,
        "render": 1,
        "clear": 0,
        "fm": 1,
        "noise": 1
      },
      "notes": [
        "fixture 해제"
      ]
    },
    {
      "file": "game.html",
      "slot": "armor",
      "count": 300,
      "candidate": true,
      "bagCount": 300,
      "equippedSame": true,
      "newInBag": false,
      "refsPreserved": true,
      "enh": 3,
      "refund": 7,
      "crystalSame": true,
      "crystalCount": 1,
      "mats": 123,
      "selected": "eq:armor",
      "position": [
        null,
        null
      ],
      "trace": {
        "save": 0,
        "recalc": 0,
        "apply": 1,
        "render": 1,
        "clear": 0,
        "fm": 0,
        "noise": 0
      },
      "notes": [
        "가방에 공간이 없습니다!"
      ]
    },
    {
      "file": "game.html",
      "slot": "ossuary",
      "count": 299,
      "candidate": false,
      "bagCount": 300,
      "equippedSame": false,
      "newInBag": true,
      "refsPreserved": true,
      "enh": 3,
      "refund": 7,
      "crystalSame": true,
      "crystalCount": 1,
      "mats": 123,
      "selected": null,
      "position": [
        0,
        30
      ],
      "trace": {
        "save": 1,
        "recalc": 1,
        "apply": 1,
        "render": 1,
        "clear": 1,
        "fm": 1,
        "noise": 1
      },
      "notes": [
        "fixture 해제"
      ]
    },
    {
      "file": "game.html",
      "slot": "ossuary",
      "count": 299,
      "candidate": true,
      "bagCount": 300,
      "equippedSame": false,
      "newInBag": true,
      "refsPreserved": true,
      "enh": 3,
      "refund": 7,
      "crystalSame": true,
      "crystalCount": 1,
      "mats": 123,
      "selected": null,
      "position": [
        0,
        30
      ],
      "trace": {
        "save": 1,
        "recalc": 1,
        "apply": 1,
        "render": 1,
        "clear": 1,
        "fm": 1,
        "noise": 1
      },
      "notes": [
        "fixture 해제"
      ]
    },
    {
      "file": "game.html",
      "slot": "ossuary",
      "count": 300,
      "candidate": false,
      "bagCount": 301,
      "equippedSame": false,
      "newInBag": true,
      "refsPreserved": true,
      "enh": 3,
      "refund": 7,
      "crystalSame": true,
      "crystalCount": 1,
      "mats": 123,
      "selected": null,
      "position": [
        0,
        30
      ],
      "trace": {
        "save": 1,
        "recalc": 1,
        "apply": 1,
        "render": 1,
        "clear": 1,
        "fm": 1,
        "noise": 1
      },
      "notes": [
        "fixture 해제"
      ]
    },
    {
      "file": "game.html",
      "slot": "ossuary",
      "count": 300,
      "candidate": true,
      "bagCount": 300,
      "equippedSame": true,
      "newInBag": false,
      "refsPreserved": true,
      "enh": 3,
      "refund": 7,
      "crystalSame": true,
      "crystalCount": 1,
      "mats": 123,
      "selected": "eq:ossuary",
      "position": [
        null,
        null
      ],
      "trace": {
        "save": 0,
        "recalc": 0,
        "apply": 0,
        "render": 0,
        "clear": 0,
        "fm": 0,
        "noise": 0
      },
      "notes": [
        "가방에 공간이 없습니다!"
      ]
    },
    {
      "file": "game-easy-test.html",
      "slot": "armor",
      "count": 299,
      "candidate": false,
      "bagCount": 300,
      "equippedSame": false,
      "newInBag": true,
      "refsPreserved": true,
      "enh": 3,
      "refund": 7,
      "crystalSame": true,
      "crystalCount": 1,
      "mats": 123,
      "selected": "eq:armor",
      "position": [
        0,
        0
      ],
      "trace": {
        "save": 1,
        "recalc": 1,
        "apply": 1,
        "render": 1,
        "clear": 0,
        "fm": 1,
        "noise": 1
      },
      "notes": [
        "fixture 해제"
      ]
    },
    {
      "file": "game-easy-test.html",
      "slot": "armor",
      "count": 299,
      "candidate": true,
      "bagCount": 300,
      "equippedSame": false,
      "newInBag": true,
      "refsPreserved": true,
      "enh": 3,
      "refund": 7,
      "crystalSame": true,
      "crystalCount": 1,
      "mats": 123,
      "selected": "eq:armor",
      "position": [
        0,
        0
      ],
      "trace": {
        "save": 1,
        "recalc": 1,
        "apply": 1,
        "render": 1,
        "clear": 0,
        "fm": 1,
        "noise": 1
      },
      "notes": [
        "fixture 해제"
      ]
    },
    {
      "file": "game-easy-test.html",
      "slot": "armor",
      "count": 300,
      "candidate": false,
      "bagCount": 301,
      "equippedSame": false,
      "newInBag": true,
      "refsPreserved": true,
      "enh": 3,
      "refund": 7,
      "crystalSame": true,
      "crystalCount": 1,
      "mats": 123,
      "selected": "eq:armor",
      "position": [
        0,
        0
      ],
      "trace": {
        "save": 1,
        "recalc": 1,
        "apply": 1,
        "render": 1,
        "clear": 0,
        "fm": 1,
        "noise": 1
      },
      "notes": [
        "fixture 해제"
      ]
    },
    {
      "file": "game-easy-test.html",
      "slot": "armor",
      "count": 300,
      "candidate": true,
      "bagCount": 300,
      "equippedSame": true,
      "newInBag": false,
      "refsPreserved": true,
      "enh": 3,
      "refund": 7,
      "crystalSame": true,
      "crystalCount": 1,
      "mats": 123,
      "selected": "eq:armor",
      "position": [
        null,
        null
      ],
      "trace": {
        "save": 0,
        "recalc": 0,
        "apply": 1,
        "render": 1,
        "clear": 0,
        "fm": 0,
        "noise": 0
      },
      "notes": [
        "가방에 공간이 없습니다!"
      ]
    },
    {
      "file": "game-easy-test.html",
      "slot": "ossuary",
      "count": 299,
      "candidate": false,
      "bagCount": 300,
      "equippedSame": false,
      "newInBag": true,
      "refsPreserved": true,
      "enh": 3,
      "refund": 7,
      "crystalSame": true,
      "crystalCount": 1,
      "mats": 123,
      "selected": null,
      "position": [
        0,
        30
      ],
      "trace": {
        "save": 1,
        "recalc": 1,
        "apply": 1,
        "render": 1,
        "clear": 1,
        "fm": 1,
        "noise": 1
      },
      "notes": [
        "fixture 해제"
      ]
    },
    {
      "file": "game-easy-test.html",
      "slot": "ossuary",
      "count": 299,
      "candidate": true,
      "bagCount": 300,
      "equippedSame": false,
      "newInBag": true,
      "refsPreserved": true,
      "enh": 3,
      "refund": 7,
      "crystalSame": true,
      "crystalCount": 1,
      "mats": 123,
      "selected": null,
      "position": [
        0,
        30
      ],
      "trace": {
        "save": 1,
        "recalc": 1,
        "apply": 1,
        "render": 1,
        "clear": 1,
        "fm": 1,
        "noise": 1
      },
      "notes": [
        "fixture 해제"
      ]
    },
    {
      "file": "game-easy-test.html",
      "slot": "ossuary",
      "count": 300,
      "candidate": false,
      "bagCount": 301,
      "equippedSame": false,
      "newInBag": true,
      "refsPreserved": true,
      "enh": 3,
      "refund": 7,
      "crystalSame": true,
      "crystalCount": 1,
      "mats": 123,
      "selected": null,
      "position": [
        0,
        30
      ],
      "trace": {
        "save": 1,
        "recalc": 1,
        "apply": 1,
        "render": 1,
        "clear": 1,
        "fm": 1,
        "noise": 1
      },
      "notes": [
        "fixture 해제"
      ]
    },
    {
      "file": "game-easy-test.html",
      "slot": "ossuary",
      "count": 300,
      "candidate": true,
      "bagCount": 300,
      "equippedSame": true,
      "newInBag": false,
      "refsPreserved": true,
      "enh": 3,
      "refund": 7,
      "crystalSame": true,
      "crystalCount": 1,
      "mats": 123,
      "selected": "eq:ossuary",
      "position": [
        null,
        null
      ],
      "trace": {
        "save": 0,
        "recalc": 0,
        "apply": 0,
        "render": 0,
        "clear": 0,
        "fm": 0,
        "noise": 0
      },
      "notes": [
        "가방에 공간이 없습니다!"
      ]
    }
  ],
  "anchors": [
    {
      "file": "game.html",
      "sourceSHA": "e462f2345682856d24bb416a17aec763281a8dceb02f21af565db189992353ea",
      "candidateSHA": "6dc50a73ee6e6eb283de2ff42bf409ecb16e8a6abdd3360dff93f6563af4328d",
      "callbackSHA": "a497b1a1c425cda2381ad2ebb8bc4a9a9d53dd23a53208c738398b03d5cf4fee",
      "urnSHA": "a5aac87144b42ffbdd06fe2f6580ae16e619c299b9e045f80e61ed736c1f856f",
      "unequipSHA": "4db94632e0350e764141bc257d45482d9a630caa9a7ef544c5006293239048f0",
      "syntax": 6
    },
    {
      "file": "game-easy-test.html",
      "sourceSHA": "68fa8e17d379fdf7e9da20b153d874e2ac74544d790397b4d36edbcc1207f390",
      "candidateSHA": "b10b56b5b47ba3c45357e2c2ae85f42385a7b89e1045fd60d3f36e0594b51016",
      "callbackSHA": "a497b1a1c425cda2381ad2ebb8bc4a9a9d53dd23a53208c738398b03d5cf4fee",
      "urnSHA": "a5aac87144b42ffbdd06fe2f6580ae16e619c299b9e045f80e61ed736c1f856f",
      "unequipSHA": "4db94632e0350e764141bc257d45482d9a630caa9a7ef544c5006293239048f0",
      "syntax": 6
    }
  ],
  "docs": {
    "exit": 0,
    "lines": 151,
    "sha": "2c9f98cdbe59c4b0f19f428b26e027d2f9e81e667acdaaa8b3cd15a06fee5c2e"
  },
  "scope": "Actual whole unequip/grid functions and actual armor card contextmenu + ossuary urn contextmenu. Legal descriptor fixtures and render/apply/save/audio observers. No previous R/BAG_MAX pickup tests repeated, no actual browser/render/CP/save/audio/equip swap replay."
}

```

