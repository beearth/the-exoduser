# BALANCE 장비 제작 공간 거절/비용 후보 — 1453

원본16건+연결확인6건 완료근거를 재실행0으로 보존. 원가격100000/가방300/확률불변. 실제pickupItem/grid/버튼코드 연결, mkItem·DOM·음향·stats·save는fixture. 실제사용자게임/save/native 검증0. 실패시 비용복원·부분성공알림·자동저장직렬화는 root Gate이며본체미적용.

```json
{
  "completionId": "BALANCE-equipment-craft-full-bag-charge-memory",
  "allocation": "SUPERVISOR-BALANCE-1453 reserved2",
  "newFiles": 2,
  "testsRerun": 0,
  "primary": {
    "completionId": "BALANCE-equipment-craft-full-bag-charge-memory",
    "sourceRuns": 16,
    "sources": [
      {
        "file": "game.html",
        "wholeSHA": "e462f2345682856d24bb416a17aec763281a8dceb02f21af565db189992353ea",
        "anchors": {
          "renderForge": "6407a724ea6d9f1d9ba3f36dfc12d5b7f8a712ff2ada17320b7fac8f6066c2eb",
          "pickupItem": "ade09a8fd8d1a11e19348c6783dacd6a44cbcbf2da62ff61bbb458e9608ee92c",
          "_invRows": "e1415c40ede82b6b5fc6260c57ba409eb8a478179a76c9bbdd2a00b6c4614b37",
          "_itemSz": "46bd4128c19de28f26caa21c25a0acfe5e3029d0d71ca7812c57bd78337cc33b",
          "_invCategoryKey": "b8b86509119cb9ba3be57fd921c6dbd0375220d466d30a52c040d305d3a8e501",
          "_invGrid": "74b9c7e2115c4a412fe0bba26a629e2094838795645d17797b6df83a5c80cc47",
          "_invFindSpace": "50456341b2c5ccfc03684820566bc9359e97357ece10a62a6171908fd4b59788",
          "_malCost": "b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f"
        },
        "candidateSHA": "5811c72d681d5c4c589b6b6065d0693b2900b4d2e8fb61367344531260116d35",
        "patch": {
          "old": "          pickupItem(item);",
          "newer": "          if(pickupItem(item)===false){G.mats+=CRAFT_COST;renderForge();return;}"
        }
      },
      {
        "file": "game-easy-test.html",
        "wholeSHA": "68fa8e17d379fdf7e9da20b153d874e2ac74544d790397b4d36edbcc1207f390",
        "anchors": {
          "renderForge": "44c24b9c9130b66b3cce2e50ff923ae06a4d35834fd2c9b01c46797a5ff0dcf1",
          "pickupItem": "b790a6796976fcb6c38fedf7cdbea03337829243141a089a40e524aa170d9146",
          "_invRows": "e1415c40ede82b6b5fc6260c57ba409eb8a478179a76c9bbdd2a00b6c4614b37",
          "_itemSz": "46bd4128c19de28f26caa21c25a0acfe5e3029d0d71ca7812c57bd78337cc33b",
          "_invCategoryKey": "b8b86509119cb9ba3be57fd921c6dbd0375220d466d30a52c040d305d3a8e501",
          "_invGrid": "74b9c7e2115c4a412fe0bba26a629e2094838795645d17797b6df83a5c80cc47",
          "_invFindSpace": "50456341b2c5ccfc03684820566bc9359e97357ece10a62a6171908fd4b59788",
          "_malCost": "b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f"
        },
        "candidateSHA": "9080dd0b58f2e1fa0f6d2bdd2f101f70924f7824358cfa1ed50093bad6e04c18",
        "patch": {
          "old": "          pickupItem(item);",
          "newer": "          if(pickupItem(item)===false){G.mats+=CRAFT_COST;renderForge();return;}"
        }
      }
    ],
    "rows": [
      {
        "file": "game.html",
        "scenario": "normal-room",
        "policy": "current",
        "out": {
          "mats": 100000,
          "beforeCount": 0,
          "afterCount": 1,
          "created": 1,
          "equipped": false,
          "hud": "악의: 100000",
          "trace": [
            [
              "RNG",
              0.25
            ],
            [
              "RNG",
              0.25
            ],
            [
              "mkItem",
              "armor",
              0,
              1,
              3,
              null
            ],
            [
              "itemSfx"
            ],
            [
              "notify",
              "3 crafted 획득!"
            ],
            [
              "lesson"
            ],
            [
              "saveForce"
            ],
            [
              "pickupSfx"
            ]
          ]
        }
      },
      {
        "file": "game.html",
        "scenario": "normal-room",
        "policy": "candidate",
        "out": {
          "mats": 100000,
          "beforeCount": 0,
          "afterCount": 1,
          "created": 1,
          "equipped": false,
          "hud": "악의: 100000",
          "trace": [
            [
              "RNG",
              0.25
            ],
            [
              "RNG",
              0.25
            ],
            [
              "mkItem",
              "armor",
              0,
              1,
              3,
              null
            ],
            [
              "itemSfx"
            ],
            [
              "notify",
              "3 crafted 획득!"
            ],
            [
              "lesson"
            ],
            [
              "saveForce"
            ],
            [
              "pickupSfx"
            ]
          ]
        }
      },
      {
        "file": "game.html",
        "scenario": "full-bag",
        "policy": "current",
        "out": {
          "mats": 100000,
          "beforeCount": 300,
          "afterCount": 300,
          "created": 0,
          "equipped": false,
          "hud": "악의: 100000",
          "trace": [
            [
              "RNG",
              0.25
            ],
            [
              "RNG",
              0.25
            ],
            [
              "mkItem",
              "armor",
              0,
              1,
              3,
              null
            ],
            [
              "notify",
              "가방에 공간이 없습니다!"
            ],
            [
              "pickupSfx"
            ]
          ]
        }
      },
      {
        "file": "game.html",
        "scenario": "full-bag",
        "policy": "candidate",
        "out": {
          "mats": 200000,
          "beforeCount": 300,
          "afterCount": 300,
          "created": 0,
          "equipped": false,
          "hud": "악의: 200000",
          "trace": [
            [
              "RNG",
              0.25
            ],
            [
              "RNG",
              0.25
            ],
            [
              "mkItem",
              "armor",
              0,
              1,
              3,
              null
            ],
            [
              "notify",
              "가방에 공간이 없습니다!"
            ]
          ]
        }
      },
      {
        "file": "game.html",
        "scenario": "one-space-shift",
        "policy": "current",
        "out": {
          "mats": 0,
          "beforeCount": 299,
          "afterCount": 300,
          "created": 1,
          "equipped": false,
          "hud": "악의: 0",
          "trace": [
            [
              "RNG",
              0.25
            ],
            [
              "RNG",
              0.25
            ],
            [
              "mkItem",
              "armor",
              0,
              1,
              3,
              null
            ],
            [
              "itemSfx"
            ],
            [
              "notify",
              "3 crafted 획득!"
            ],
            [
              "lesson"
            ],
            [
              "saveForce"
            ],
            [
              "RNG",
              0.25
            ],
            [
              "RNG",
              0.25
            ],
            [
              "mkItem",
              "armor",
              0,
              1,
              3,
              null
            ],
            [
              "notify",
              "가방에 공간이 없습니다!"
            ],
            [
              "notify",
              "2개 제작 완료!"
            ],
            [
              "pickupSfx"
            ]
          ]
        }
      },
      {
        "file": "game.html",
        "scenario": "one-space-shift",
        "policy": "candidate",
        "out": {
          "mats": 100000,
          "beforeCount": 299,
          "afterCount": 300,
          "created": 1,
          "equipped": false,
          "hud": "악의: 100000",
          "trace": [
            [
              "RNG",
              0.25
            ],
            [
              "RNG",
              0.25
            ],
            [
              "mkItem",
              "armor",
              0,
              1,
              3,
              null
            ],
            [
              "itemSfx"
            ],
            [
              "notify",
              "3 crafted 획득!"
            ],
            [
              "lesson"
            ],
            [
              "saveForce"
            ],
            [
              "RNG",
              0.25
            ],
            [
              "RNG",
              0.25
            ],
            [
              "mkItem",
              "armor",
              0,
              1,
              3,
              null
            ],
            [
              "notify",
              "가방에 공간이 없습니다!"
            ]
          ]
        }
      },
      {
        "file": "game.html",
        "scenario": "full-bag-empty-equip",
        "policy": "current",
        "out": {
          "mats": 100000,
          "beforeCount": 300,
          "afterCount": 300,
          "created": 0,
          "equipped": true,
          "hud": "악의: 100000",
          "trace": [
            [
              "RNG",
              0.25
            ],
            [
              "RNG",
              0.25
            ],
            [
              "mkItem",
              "armor",
              0,
              1,
              3,
              null
            ],
            [
              "pickupSfx"
            ],
            [
              "equipSfx"
            ],
            [
              "notify",
              "3 crafted 자동 장착!"
            ],
            [
              "recalc"
            ],
            [
              "stats"
            ],
            [
              "pickupSfx"
            ]
          ]
        }
      },
      {
        "file": "game.html",
        "scenario": "full-bag-empty-equip",
        "policy": "candidate",
        "out": {
          "mats": 100000,
          "beforeCount": 300,
          "afterCount": 300,
          "created": 0,
          "equipped": true,
          "hud": "악의: 100000",
          "trace": [
            [
              "RNG",
              0.25
            ],
            [
              "RNG",
              0.25
            ],
            [
              "mkItem",
              "armor",
              0,
              1,
              3,
              null
            ],
            [
              "pickupSfx"
            ],
            [
              "equipSfx"
            ],
            [
              "notify",
              "3 crafted 자동 장착!"
            ],
            [
              "recalc"
            ],
            [
              "stats"
            ],
            [
              "pickupSfx"
            ]
          ]
        }
      },
      {
        "file": "game-easy-test.html",
        "scenario": "normal-room",
        "policy": "current",
        "out": {
          "mats": 100000,
          "beforeCount": 0,
          "afterCount": 1,
          "created": 1,
          "equipped": false,
          "hud": "악의: 100000",
          "trace": [
            [
              "RNG",
              0.25
            ],
            [
              "RNG",
              0.25
            ],
            [
              "mkItem",
              "armor",
              0,
              1,
              3,
              null
            ],
            [
              "itemSfx"
            ],
            [
              "notify",
              "3 crafted 획득!"
            ],
            [
              "lesson"
            ],
            [
              "saveForce"
            ],
            [
              "pickupSfx"
            ]
          ]
        }
      },
      {
        "file": "game-easy-test.html",
        "scenario": "normal-room",
        "policy": "candidate",
        "out": {
          "mats": 100000,
          "beforeCount": 0,
          "afterCount": 1,
          "created": 1,
          "equipped": false,
          "hud": "악의: 100000",
          "trace": [
            [
              "RNG",
              0.25
            ],
            [
              "RNG",
              0.25
            ],
            [
              "mkItem",
              "armor",
              0,
              1,
              3,
              null
            ],
            [
              "itemSfx"
            ],
            [
              "notify",
              "3 crafted 획득!"
            ],
            [
              "lesson"
            ],
            [
              "saveForce"
            ],
            [
              "pickupSfx"
            ]
          ]
        }
      },
      {
        "file": "game-easy-test.html",
        "scenario": "full-bag",
        "policy": "current",
        "out": {
          "mats": 100000,
          "beforeCount": 300,
          "afterCount": 300,
          "created": 0,
          "equipped": false,
          "hud": "악의: 100000",
          "trace": [
            [
              "RNG",
              0.25
            ],
            [
              "RNG",
              0.25
            ],
            [
              "mkItem",
              "armor",
              0,
              1,
              3,
              null
            ],
            [
              "notify",
              "가방에 공간이 없습니다!"
            ],
            [
              "pickupSfx"
            ]
          ]
        }
      },
      {
        "file": "game-easy-test.html",
        "scenario": "full-bag",
        "policy": "candidate",
        "out": {
          "mats": 200000,
          "beforeCount": 300,
          "afterCount": 300,
          "created": 0,
          "equipped": false,
          "hud": "악의: 200000",
          "trace": [
            [
              "RNG",
              0.25
            ],
            [
              "RNG",
              0.25
            ],
            [
              "mkItem",
              "armor",
              0,
              1,
              3,
              null
            ],
            [
              "notify",
              "가방에 공간이 없습니다!"
            ]
          ]
        }
      },
      {
        "file": "game-easy-test.html",
        "scenario": "one-space-shift",
        "policy": "current",
        "out": {
          "mats": 0,
          "beforeCount": 299,
          "afterCount": 300,
          "created": 1,
          "equipped": false,
          "hud": "악의: 0",
          "trace": [
            [
              "RNG",
              0.25
            ],
            [
              "RNG",
              0.25
            ],
            [
              "mkItem",
              "armor",
              0,
              1,
              3,
              null
            ],
            [
              "itemSfx"
            ],
            [
              "notify",
              "3 crafted 획득!"
            ],
            [
              "lesson"
            ],
            [
              "saveForce"
            ],
            [
              "RNG",
              0.25
            ],
            [
              "RNG",
              0.25
            ],
            [
              "mkItem",
              "armor",
              0,
              1,
              3,
              null
            ],
            [
              "notify",
              "가방에 공간이 없습니다!"
            ],
            [
              "notify",
              "2개 제작 완료!"
            ],
            [
              "pickupSfx"
            ]
          ]
        }
      },
      {
        "file": "game-easy-test.html",
        "scenario": "one-space-shift",
        "policy": "candidate",
        "out": {
          "mats": 100000,
          "beforeCount": 299,
          "afterCount": 300,
          "created": 1,
          "equipped": false,
          "hud": "악의: 100000",
          "trace": [
            [
              "RNG",
              0.25
            ],
            [
              "RNG",
              0.25
            ],
            [
              "mkItem",
              "armor",
              0,
              1,
              3,
              null
            ],
            [
              "itemSfx"
            ],
            [
              "notify",
              "3 crafted 획득!"
            ],
            [
              "lesson"
            ],
            [
              "saveForce"
            ],
            [
              "RNG",
              0.25
            ],
            [
              "RNG",
              0.25
            ],
            [
              "mkItem",
              "armor",
              0,
              1,
              3,
              null
            ],
            [
              "notify",
              "가방에 공간이 없습니다!"
            ]
          ]
        }
      },
      {
        "file": "game-easy-test.html",
        "scenario": "full-bag-empty-equip",
        "policy": "current",
        "out": {
          "mats": 100000,
          "beforeCount": 300,
          "afterCount": 300,
          "created": 0,
          "equipped": true,
          "hud": "악의: 100000",
          "trace": [
            [
              "RNG",
              0.25
            ],
            [
              "RNG",
              0.25
            ],
            [
              "mkItem",
              "armor",
              0,
              1,
              3,
              null
            ],
            [
              "pickupSfx"
            ],
            [
              "equipSfx"
            ],
            [
              "notify",
              "3 crafted 자동 장착!"
            ],
            [
              "recalc"
            ],
            [
              "stats"
            ],
            [
              "pickupSfx"
            ]
          ]
        }
      },
      {
        "file": "game-easy-test.html",
        "scenario": "full-bag-empty-equip",
        "policy": "candidate",
        "out": {
          "mats": 100000,
          "beforeCount": 300,
          "afterCount": 300,
          "created": 0,
          "equipped": true,
          "hud": "악의: 100000",
          "trace": [
            [
              "RNG",
              0.25
            ],
            [
              "RNG",
              0.25
            ],
            [
              "mkItem",
              "armor",
              0,
              1,
              3,
              null
            ],
            [
              "pickupSfx"
            ],
            [
              "equipSfx"
            ],
            [
              "notify",
              "3 crafted 자동 장착!"
            ],
            [
              "recalc"
            ],
            [
              "stats"
            ],
            [
              "pickupSfx"
            ]
          ]
        }
      }
    ],
    "docs": {
      "query": "pickupItem|가방.*공간|제작.*빈|CRAFT_COST|제작 비용|가방.*제작",
      "matches": 77,
      "sha": "cc76905cde62e9570dc14e3b9f7f2cc0ca13ec7862277d34019cb4cc09e8972e"
    },
    "limits": [
      "Actual full renderForge→actual equipment button→actual pickupItem→actual item size/category/grid/findSpace; 300placed2x2 items fill120rows10cols",
      "No detached callback replay; one ordinary button input or Shift input",
      "Item generator/RNG/DOM/audio/stats/save/Date fixtures; native game input/save UNKNOWN",
      "Candidate restores only failed attempt debit and returns after actual pickup false; full-bag failure refund intent needs root economic-policy acceptance, not applied",
      "Normal room purchase and empty-equipment autoequip outputs/traces unchanged",
      "No production shared docs Git files edits"
    ],
    "newFiles": 0,
    "script": "import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {tokenizer,parse} from 'acorn';import {spawnSync} from 'node:child_process';\nconst sha=x=>createHash('sha256').update(x).digest('hex');\nfunction extract(s,n){const start=s.indexOf('function '+n+'(');assert(start>=0,n);return balanced(s,start);}\nfunction balanced(s,start){const t=tokenizer(s.slice(start),{ecmaVersion:'latest'});let d=0,o=false;for(;;){const k=t.getToken(),l=k.type.label;if(l==='{'||l==='$'+'{'){d++;o=true;}if(l==='}')d--;if(o&&d===0)return s.slice(start,start+k.end);if(l==='eof')throw Error('extract eof');}}\n\nconst rows=[],sources=[];\nclass E{constructor(){this.children=[];this.style={setProperty(){}};this.classList={add(){}};this.textContent=''}appendChild(x){this.children.push(x);return x}replaceChildren(...x){this.children=x}set innerHTML(x){this.markup=x;this.children=[]}get innerHTML(){return this.markup||''}}\nfor(const file of ['game.html','game-easy-test.html']){\nconst s=fs.readFileSync(file,'utf8'),names=['renderForge','pickupItem','_invRows','_itemSz','_invCategoryKey','_invGrid','_invFindSpace','_malCost'],f=Object.fromEntries(names.map(n=>[n,extract(s,n)]));\nconst old='          pickupItem(item);',newer='          if(pickupItem(item)===false){G.mats+=CRAFT_COST;renderForge();return;}';assert.equal(f.renderForge.split(old).length,2);const candidate=f.renderForge.replace(old,newer);\nsources.push({file,wholeSHA:sha(s),anchors:Object.fromEntries(names.map(n=>[n,sha(f[n])])),candidateSHA:sha(candidate),patch:{old,newer}});\nfor(const scenario of ['normal-room','full-bag','one-space-shift','full-bag-empty-equip']){\nfor(const policy of ['current','candidate']){\nconst nodes=new Map(),trace=[],bag=[];if(scenario!=='normal-room')for(let y=0;y<120;y+=2)for(let x=0;x<10;x+=2)bag.push({slot:'armor',_gx:x,_gy:y});if(scenario==='one-space-shift')bag.pop();\nconst beforeCount=bag.length,$=id=>{if(!nodes.has(id))nodes.set(id,new E());return nodes.get(id)};\nconst c=vm.createContext({G:{mats:200000,forgeTab:'armor',stage:0},P:{x:0,y:0},INV:{bag,equipped:scenario==='full-bag-empty-equip'?{}:{armor:{slot:'armor',name:'old',rarity:3,el:0}}},BAG_MAX:300,INV_COLS:10,ITEM_SIZE:{armor:[2,2]},WTYPE_SIZE:{},BTYPE_SIZE:{},_MALICE_COST_MUL:.5,$,document:{createElement:()=>new E()},_forgeSel:null,_salSel:new Set(),_rerollSel:null,_crForgeSel:-1,_ensureForgeAtlasLoad(){},BGM:{play(){}},_T:x=>x,_L:x=>x,_rarName:x=>x,_itemIco:()=>'',RARITY_C:['','','','#hero','#legend'],ELN:{0:'physical'},EL:{P:0,F:1,I:2,D:3,L:4,H:5},SI_TO_HELL:[0],SFX:{pickup:()=>trace.push(['pickupSfx'])},playEquipSfx:()=>trace.push(['equipSfx']),playItemPickupSfx:()=>trace.push(['itemSfx']),_petSayCD:()=>{},notify:x=>trace.push(['notify',x]),recalcSt:()=>trace.push(['recalc']),applyStats:()=>trace.push(['stats']),dbSaveForce:()=>trace.push(['saveForce']),mkItem:(...a)=>{trace.push(['mkItem',...a]);return {slot:a[0],name:'crafted',rarity:a[3],el:a[2]}},window:{_systemLesson:{pickedUp:()=>trace.push(['lesson'])}},Math:Object.assign(Object.create(Math),{random:()=>{trace.push(['RNG',.25]);return .25}}),Date:{now:()=>123456}});\nvm.runInContext(names.map(n=>n==='renderForge'?(policy==='current'?f[n]:candidate):f[n]).join('\\n')+'\\nconst CRAFT_COST=_malCost(200000);renderForge();',c);\nconst button=$('fgGrid').children.find(e=>e.onclick&&String(e.onclick).includes('CRAFT_COST'));assert(button);button.onclick(scenario==='one-space-shift'?{shiftKey:true}:{});\nconst created=bag.filter(x=>x.name==='crafted').length,equipped=c.INV.equipped.armor?.name==='crafted';\nconst out={mats:c.G.mats,beforeCount,afterCount:bag.length,created,equipped,hud:$('forgeMats').textContent,trace};\nif(scenario==='full-bag'){assert.equal(out.mats,policy==='current'?100000:200000);assert.equal(created,0);assert.equal(bag.length,300);}\nelse if(scenario==='one-space-shift'){assert.equal(out.mats,policy==='current'?0:100000);assert.equal(created,1);assert.equal(bag.length,300);}\nelse {assert.equal(out.mats,100000);assert.equal(created,scenario==='normal-room'?1:0);assert.equal(equipped,scenario==='full-bag-empty-equip');}\nrows.push({file,scenario,policy,out});\n}\n}\nfor(const scenario of ['normal-room','full-bag-empty-equip']){const r=rows.filter(x=>x.file===file&&x.scenario===scenario);assert.deepEqual(r[0].out,r[1].out);}\n}\nconst query='pickupItem|가방.*공간|제작.*빈|CRAFT_COST|제작 비용|가방.*제작';const d=spawnSync('rg',['-n',query,'docs'],{encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(d.status,0);\nconsole.log(JSON.stringify({completionId:'BALANCE-equipment-craft-full-bag-charge-memory',sourceRuns:rows.length,sources,rows,docs:{query,matches:d.stdout.trim().split('\\n').length,sha:sha(d.stdout)},limits:['Actual full renderForge→actual equipment button→actual pickupItem→actual item size/category/grid/findSpace; 300placed2x2 items fill120rows10cols','No detached callback replay; one ordinary button input or Shift input','Item generator/RNG/DOM/audio/stats/save/Date fixtures; native game input/save UNKNOWN','Candidate restores only failed attempt debit and returns after actual pickup false; full-bag failure refund intent needs root economic-policy acceptance, not applied','Normal room purchase and empty-equipment autoequip outputs/traces unchanged','No production shared docs Git files edits'],newFiles:0},null,2));\n",
    "receipt": {
      "chunk_id": "a32930",
      "wall_time_seconds": 0.00000775,
      "exit_code": 0,
      "original_token_count": 4446,
      "output": "{\n  \"completionId\": \"BALANCE-equipment-craft-full-bag-charge-memory\",\n  \"sourceRuns\": 16,\n  \"sources\": [\n    {\n      \"file\": \"game.html\",\n      \"wholeSHA\": \"e462f2345682856d24bb416a17aec763281a8dceb02f21af565db189992353ea\",\n      \"anchors\": {\n        \"renderForge\": \"6407a724ea6d9f1d9ba3f36dfc12d5b7f8a712ff2ada17320b7fac8f6066c2eb\",\n        \"pickupItem\": \"ade09a8fd8d1a11e19348c6783dacd6a44cbcbf2da62ff61bbb458e9608ee92c\",\n        \"_invRows\": \"e1415c40ede82b6b5fc6260c57ba409eb8a478179a76c9bbdd2a00b6c4614b37\",\n        \"_itemSz\": \"46bd4128c19de28f26caa21c25a0acfe5e3029d0d71ca7812c57bd78337cc33b\",\n        \"_invCategoryKey\": \"b8b86509119cb9ba3be57fd921c6dbd0375220d466d30a52c040d305d3a8e501\",\n        \"_invGrid\": \"74b9c7e2115c4a412fe0bba26a629e2094838795645d17797b6df83a5c80cc47\",\n        \"_invFindSpace\": \"50456341b2c5ccfc03684820566bc9359e97357ece10a62a6171908fd4b59788\",\n        \"_malCost\": \"b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f\"\n      },\n      \"candidateSHA\": \"5811c72d681d5c4c589b6b6065d0693b2900b4d2e8fb61367344531260116d35\",\n      \"patch\": {\n        \"old\": \"          pickupItem(item);\",\n        \"newer\": \"          if(pickupItem(item)===false){G.mats+=CRAFT_COST;renderForge();return;}\"\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"wholeSHA\": \"68fa8e17d379fdf7e9da20b153d874e2ac74544d790397b4d36edbcc1207f390\",\n      \"anchors\": {\n        \"renderForge\": \"44c24b9c9130b66b3cce2e50ff923ae06a4d35834fd2c9b01c46797a5ff0dcf1\",\n        \"pickupItem\": \"b790a6796976fcb6c38fedf7cdbea03337829243141a089a40e524aa170d9146\",\n        \"_invRows\": \"e1415c40ede82b6b5fc6260c57ba409eb8a478179a76c9bbdd2a00b6c4614b37\",\n        \"_itemSz\": \"46bd4128c19de28f26caa21c25a0acfe5e3029d0d71ca7812c57bd78337cc33b\",\n        \"_invCategoryKey\": \"b8b86509119cb9ba3be57fd921c6dbd0375220d466d30a52c040d305d3a8e501\",\n        \"_invGrid\": \"74b9c7e2115c4a412fe0bba26a629e2094838795645d17797b6df83a5c80cc47\",\n        \"_invFindSpace\": \"50456341b2c5ccfc03684820566bc9359e97357ece10a62a6171908fd4b59788\",\n        \"_malCost\": \"b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f\"\n      },\n      \"candidateSHA\": \"9080dd0b58f2e1fa0f6d2bdd2f101f70924f7824358cfa1ed50093bad6e04c18\",\n      \"patch\": {\n        \"old\": \"          pickupItem(item);\",\n        \"newer\": \"          if(pickupItem(item)===false){G.mats+=CRAFT_COST;renderForge();return;}\"\n      }\n    }\n  ],\n  \"rows\": [\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"normal-room\",\n      \"policy\": \"current\",\n      \"out\": {\n        \"mats\": 100000,\n        \"beforeCount\": 0,\n        \"afterCount\": 1,\n        \"created\": 1,\n        \"equipped\": false,\n        \"hud\": \"악의: 100000\",\n        \"trace\": [\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"mkItem\",\n            \"armor\",\n            0,\n            1,\n            3,\n            null\n          ],\n          [\n            \"itemSfx\"\n          ],\n          [\n            \"notify\",\n            \"3 crafted 획득!\"\n          ],\n          [\n            \"lesson\"\n          ],\n          [\n            \"saveForce\"\n          ],\n          [\n            \"pickupSfx\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"normal-room\",\n      \"policy\": \"candidate\",\n      \"out\": {\n        \"mats\": 100000,\n        \"beforeCount\": 0,\n        \"afterCount\": 1,\n        \"created\": 1,\n        \"equipped\": false,\n        \"hud\": \"악의: 100000\",\n        \"trace\": [\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"mkItem\",\n            \"armor\",\n            0,\n            1,\n            3,\n            null\n          ],\n          [\n            \"itemSfx\"\n          ],\n          [\n            \"notify\",\n            \"3 crafted 획득!\"\n          ],\n          [\n            \"lesson\"\n          ],\n          [\n            \"saveForce\"\n          ],\n          [\n            \"pickupSfx\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"full-bag\",\n      \"policy\": \"current\",\n      \"out\": {\n        \"mats\": 100000,\n        \"beforeCount\": 300,\n        \"afterCount\": 300,\n        \"created\": 0,\n        \"equipped\": false,\n        \"hud\": \"악의: 100000\",\n        \"trace\": [\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"mkItem\",\n            \"armor\",\n            0,\n            1,\n            3,\n            null\n          ],\n          [\n            \"notify\",\n            \"가방에 공간이 없습니다!\"\n          ],\n          [\n            \"pickupSfx\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"full-bag\",\n      \"policy\": \"candidate\",\n      \"out\": {\n        \"mats\": 200000,\n        \"beforeCount\": 300,\n        \"afterCount\": 300,\n        \"created\": 0,\n        \"equipped\": false,\n        \"hud\": \"악의: 200000\",\n        \"trace\": [\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"mkItem\",\n            \"armor\",\n            0,\n            1,\n            3,\n            null\n          ],\n          [\n            \"notify\",\n            \"가방에 공간이 없습니다!\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"one-space-shift\",\n      \"policy\": \"current\",\n      \"out\": {\n        \"mats\": 0,\n        \"beforeCount\": 299,\n        \"afterCount\": 300,\n        \"created\": 1,\n        \"equipped\": false,\n        \"hud\": \"악의: 0\",\n        \"trace\": [\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"mkItem\",\n            \"armor\",\n            0,\n            1,\n            3,\n            null\n          ],\n          [\n            \"itemSfx\"\n          ],\n          [\n            \"notify\",\n            \"3 crafted 획득!\"\n          ],\n          [\n            \"lesson\"\n          ],\n          [\n            \"saveForce\"\n          ],\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"mkItem\",\n            \"armor\",\n            0,\n            1,\n            3,\n            null\n          ],\n          [\n            \"notify\",\n            \"가방에 공간이 없습니다!\"\n          ],\n          [\n            \"notify\",\n            \"2개 제작 완료!\"\n          ],\n          [\n            \"pickupSfx\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"one-space-shift\",\n      \"policy\": \"candidate\",\n      \"out\": {\n        \"mats\": 100000,\n        \"beforeCount\": 299,\n        \"afterCount\": 300,\n        \"created\": 1,\n        \"equipped\": false,\n        \"hud\": \"악의: 100000\",\n        \"trace\": [\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"mkItem\",\n            \"armor\",\n            0,\n            1,\n            3,\n            null\n          ],\n          [\n            \"itemSfx\"\n          ],\n          [\n            \"notify\",\n            \"3 crafted 획득!\"\n          ],\n          [\n            \"lesson\"\n          ],\n          [\n            \"saveForce\"\n          ],\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"mkItem\",\n            \"armor\",\n            0,\n            1,\n            3,\n            null\n          ],\n          [\n            \"notify\",\n            \"가방에 공간이 없습니다!\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"full-bag-empty-equip\",\n      \"policy\": \"current\",\n      \"out\": {\n        \"mats\": 100000,\n        \"beforeCount\": 300,\n        \"afterCount\": 300,\n        \"created\": 0,\n        \"equipped\": true,\n        \"hud\": \"악의: 100000\",\n        \"trace\": [\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"mkItem\",\n            \"armor\",\n            0,\n            1,\n            3,\n            null\n          ],\n          [\n            \"pickupSfx\"\n          ],\n          [\n            \"equipSfx\"\n          ],\n          [\n            \"notify\",\n            \"3 crafted 자동 장착!\"\n          ],\n          [\n            \"recalc\"\n          ],\n          [\n            \"stats\"\n          ],\n          [\n            \"pickupSfx\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"full-bag-empty-equip\",\n      \"policy\": \"candidate\",\n      \"out\": {\n        \"mats\": 100000,\n        \"beforeCount\": 300,\n        \"afterCount\": 300,\n        \"created\": 0,\n        \"equipped\": true,\n        \"hud\": \"악의: 100000\",\n        \"trace\": [\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"mkItem\",\n            \"armor\",\n            0,\n            1,\n            3,\n            null\n          ],\n          [\n            \"pickupSfx\"\n          ],\n          [\n            \"equipSfx\"\n          ],\n          [\n            \"notify\",\n            \"3 crafted 자동 장착!\"\n          ],\n          [\n            \"recalc\"\n          ],\n          [\n            \"stats\"\n          ],\n          [\n            \"pickupSfx\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"normal-room\",\n      \"policy\": \"current\",\n      \"out\": {\n        \"mats\": 100000,\n        \"beforeCount\": 0,\n        \"afterCount\": 1,\n        \"created\": 1,\n        \"equipped\": false,\n        \"hud\": \"악의: 100000\",\n        \"trace\": [\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"mkItem\",\n            \"armor\",\n            0,\n            1,\n            3,\n            null\n          ],\n          [\n            \"itemSfx\"\n          ],\n          [\n            \"notify\",\n            \"3 crafted 획득!\"\n          ],\n          [\n            \"lesson\"\n          ],\n          [\n            \"saveForce\"\n          ],\n          [\n            \"pickupSfx\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"normal-room\",\n      \"policy\": \"candidate\",\n      \"out\": {\n        \"mats\": 100000,\n        \"beforeCount\": 0,\n        \"afterCount\": 1,\n        \"created\": 1,\n        \"equipped\": false,\n        \"hud\": \"악의: 100000\",\n        \"trace\": [\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"mkItem\",\n            \"armor\",\n            0,\n            1,\n            3,\n            null\n          ],\n          [\n            \"itemSfx\"\n          ],\n          [\n            \"notify\",\n            \"3 crafted 획득!\"\n          ],\n          [\n            \"lesson\"\n          ],\n          [\n            \"saveForce\"\n          ],\n          [\n            \"pickupSfx\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"full-bag\",\n      \"policy\": \"current\",\n      \"out\": {\n        \"mats\": 100000,\n        \"beforeCount\": 300,\n        \"afterCount\": 300,\n        \"created\": 0,\n        \"equipped\": false,\n        \"hud\": \"악의: 100000\",\n        \"trace\": [\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"mkItem\",\n            \"armor\",\n            0,\n            1,\n            3,\n            null\n          ],\n          [\n            \"notify\",\n            \"가방에 공간이 없습니다!\"\n          ],\n          [\n            \"pickupSfx\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"full-bag\",\n      \"policy\": \"candidate\",\n      \"out\": {\n        \"mats\": 200000,\n        \"beforeCount\": 300,\n        \"afterCount\": 300,\n        \"created\": 0,\n        \"equipped\": false,\n        \"hud\": \"악의: 200000\",\n        \"trace\": [\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"mkItem\",\n            \"armor\",\n            0,\n            1,\n            3,\n            null\n          ],\n          [\n            \"notify\",\n            \"가방에 공간이 없습니다!\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"one-space-shift\",\n      \"policy\": \"current\",\n      \"out\": {\n        \"mats\": 0,\n        \"beforeCount\": 299,\n        \"afterCount\": 300,\n        \"created\": 1,\n        \"equipped\": false,\n        \"hud\": \"악의: 0\",\n        \"trace\": [\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"mkItem\",\n            \"armor\",\n            0,\n            1,\n            3,\n            null\n          ],\n          [\n            \"itemSfx\"\n          ],\n          [\n            \"notify\",\n            \"3 crafted 획득!\"\n          ],\n          [\n            \"lesson\"\n          ],\n          [\n            \"saveForce\"\n          ],\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"mkItem\",\n            \"armor\",\n            0,\n            1,\n            3,\n            null\n          ],\n          [\n            \"notify\",\n            \"가방에 공간이 없습니다!\"\n          ],\n          [\n            \"notify\",\n            \"2개 제작 완료!\"\n          ],\n          [\n            \"pickupSfx\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"one-space-shift\",\n      \"policy\": \"candidate\",\n      \"out\": {\n        \"mats\": 100000,\n        \"beforeCount\": 299,\n        \"afterCount\": 300,\n        \"created\": 1,\n        \"equipped\": false,\n        \"hud\": \"악의: 100000\",\n        \"trace\": [\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"mkItem\",\n            \"armor\",\n            0,\n            1,\n            3,\n            null\n          ],\n          [\n            \"itemSfx\"\n          ],\n          [\n            \"notify\",\n            \"3 crafted 획득!\"\n          ],\n          [\n            \"lesson\"\n          ],\n          [\n            \"saveForce\"\n          ],\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"mkItem\",\n            \"armor\",\n            0,\n            1,\n            3,\n            null\n          ],\n          [\n            \"notify\",\n            \"가방에 공간이 없습니다!\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"full-bag-empty-equip\",\n      \"policy\": \"current\",\n      \"out\": {\n        \"mats\": 100000,\n        \"beforeCount\": 300,\n        \"afterCount\": 300,\n        \"created\": 0,\n        \"equipped\": true,\n        \"hud\": \"악의: 100000\",\n        \"trace\": [\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"mkItem\",\n            \"armor\",\n            0,\n            1,\n            3,\n            null\n          ],\n          [\n            \"pickupSfx\"\n          ],\n          [\n            \"equipSfx\"\n          ],\n          [\n            \"notify\",\n            \"3 crafted 자동 장착!\"\n          ],\n          [\n            \"recalc\"\n          ],\n          [\n            \"stats\"\n          ],\n          [\n            \"pickupSfx\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"full-bag-empty-equip\",\n      \"policy\": \"candidate\",\n      \"out\": {\n        \"mats\": 100000,\n        \"beforeCount\": 300,\n        \"afterCount\": 300,\n        \"created\": 0,\n        \"equipped\": true,\n        \"hud\": \"악의: 100000\",\n        \"trace\": [\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"RNG\",\n            0.25\n          ],\n          [\n            \"mkItem\",\n            \"armor\",\n            0,\n            1,\n            3,\n            null\n          ],\n          [\n            \"pickupSfx\"\n          ],\n          [\n            \"equipSfx\"\n          ],\n          [\n            \"notify\",\n            \"3 crafted 자동 장착!\"\n          ],\n          [\n            \"recalc\"\n          ],\n          [\n            \"stats\"\n          ],\n          [\n            \"pickupSfx\"\n          ]\n        ]\n      }\n    }\n  ],\n  \"docs\": {\n    \"query\": \"pickupItem|가방.*공간|제작.*빈|CRAFT_COST|제작 비용|가방.*제작\",\n    \"matches\": 77,\n    \"sha\": \"cc76905cde62e9570dc14e3b9f7f2cc0ca13ec7862277d34019cb4cc09e8972e\"\n  },\n  \"limits\": [\n    \"Actual full renderForge→actual equipment button→actual pickupItem→actual item size/category/grid/findSpace; 300placed2x2 items fill120rows10cols\",\n    \"No detached callback replay; one ordinary button input or Shift input\",\n    \"Item generator/RNG/DOM/audio/stats/save/Date fixtures; native game input/save UNKNOWN\",\n    \"Candidate restores only failed attempt debit and returns after actual pickup false; full-bag failure refund intent needs root economic-policy acceptance, not applied\",\n    \"Normal room purchase and empty-equipment autoequip outputs/traces unchanged\",\n    \"No production shared docs Git files edits\"\n  ],\n  \"newFiles\": 0\n}\n"
    },
    "failure": {
      "chunk_id": "cd2872",
      "wall_time_seconds": 0.000007,
      "exit_code": 1,
      "original_token_count": 195,
      "output": "evalmachine.<anonymous>:708\n  playItemPickupSfx(item);notify(`${_rarName(item.rarity)} ${_T(item.name)} ${_T('획득!')}`);\n                                 ^\n\nReferenceError: _rarName is not defined\n    at pickupItem (evalmachine.<anonymous>:708:34)\n    at btn.onclick (evalmachine.<anonymous>:662:11)\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:18:118\n    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)\n    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)\n    at async node:internal/modules/esm/loader:246:26\n    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:243:20)\n    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)\n\nNode.js v24.15.0\n"
    },
    "rootDocsHandoff": [
      {
        "path": "docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md",
        "contract": "실제 장비제작→pickupItem의false(공간없음)를 caller가 무시하여 악의10만소비·아이템0. Shift299→300경계에서 실물1개지만20만소비·2개완료문구. 빈슬롯자동장착 정상 유지. 실패분 비용복원/반복중단 후보는 economic-policy root수락Gate, 미적용."
      },
      {
        "path": "docs/14밸런스+수치테이블/14밸런스+수치테이블.md",
        "contract": "CRAFT_COST100000불변. 후보는 성공인도된회차만 비용유지; pickupfalse의이미차감한당회차만복원. 정상 RNG/픽업/저장/음향trace같음. mkItem2roll고정fixture nativeUNKNOWN."
      }
    ],
    "productionApplied": false
  },
  "connectedConfirm": {
    "completionId": "BALANCE-gamepad-connected-confirm-selection-clear-1434",
    "sourceRuns": 6,
    "sources": [
      {
        "file": "game.html",
        "wholeSHA": "e462f2345682856d24bb416a17aec763281a8dceb02f21af565db189992353ea",
        "navSHA": "3089e0aaac89e10c59769ffc246230eb04abeefabaf56e9e21a2ac7865047796",
        "forgeSHA": "6407a724ea6d9f1d9ba3f36dfc12d5b7f8a712ff2ada17320b7fac8f6066c2eb",
        "candidateSHA": "9dab9f6a3cc487fb14c24c8353e9875305a110c35c0d88bc1eee35f91a326ceb",
        "patch": {
          "old": "_gpUIPrev.lb=lb;_gpUIPrev.rb=rb;",
          "newer": "_gpUIPrev.lb=lb;_gpUIPrev.rb=rb;\nif(a&&!_gpUIPrev.a&&cur&&!panel.contains(cur)){_gpUIPrev.a=a;_gpBtnsPrev['k0']=true;return;}"
        }
      },
      {
        "file": "game-easy-test.html",
        "wholeSHA": "68fa8e17d379fdf7e9da20b153d874e2ac74544d790397b4d36edbcc1207f390",
        "navSHA": "cc02ae15d667b7500e2f21dd84e0ee79ce6c2b704e526111face98ab52f4b4b0",
        "forgeSHA": "44c24b9c9130b66b3cce2e50ff923ae06a4d35834fd2c9b01c46797a5ff0dcf1",
        "candidateSHA": "2c19397cd3f76b76a0db0b658c0a18c44953f669b57ad1b23aa6f9bb073704de",
        "patch": {
          "old": "_gpUIPrev.lb=lb;_gpUIPrev.rb=rb;",
          "newer": "_gpUIPrev.lb=lb;_gpUIPrev.rb=rb;\nif(a&&!_gpUIPrev.a&&cur&&!panel.contains(cur)){_gpUIPrev.a=a;_gpBtnsPrev['k0']=true;return;}"
        }
      }
    ],
    "rows": [
      {
        "file": "game.html",
        "scenario": "persistent-a-normal",
        "policy": "current",
        "before": {
          "mats": 50,
          "pot": 0
        },
        "out": {
          "mats": 47,
          "pot": 1,
          "tab": "potion",
          "selected": false,
          "prev": {
            "lb": false,
            "rb": false,
            "start": false,
            "a": true,
            "b": false,
            "y": false,
            "b8": false,
            "b9": false
          }
        },
        "final": {
          "mats": 47,
          "pot": 1,
          "tab": "potion",
          "selected": false
        },
        "buttonStillConnected": true,
        "trace": [
          [
            "click",
            "",
            true
          ],
          [
            "text",
            0,
            -20,
            "❤️‍🔥 HP 물약 Lv.1!",
            "#ffcc00",
            50
          ],
          [
            "save"
          ]
        ]
      },
      {
        "file": "game.html",
        "scenario": "persistent-lb-a",
        "policy": "current",
        "before": {
          "mats": 50,
          "pot": 0
        },
        "out": {
          "mats": 50,
          "pot": 0,
          "tab": "upgrade",
          "selected": false,
          "prev": {
            "lb": true,
            "rb": false,
            "start": false,
            "a": true,
            "b": false,
            "y": false,
            "b8": false,
            "b9": false
          }
        },
        "final": {
          "mats": 50,
          "pot": 0,
          "tab": "upgrade",
          "selected": false
        },
        "buttonStillConnected": true,
        "trace": [
          [
            "click",
            "",
            true
          ],
          [
            "click",
            "",
            true
          ]
        ]
      },
      {
        "file": "game.html",
        "scenario": "persistent-lb-then-a",
        "policy": "current",
        "before": {
          "mats": 50,
          "pot": 0
        },
        "out": {
          "mats": 50,
          "pot": 0,
          "tab": "upgrade",
          "selected": false,
          "prev": {
            "lb": true,
            "rb": false,
            "start": false,
            "a": false,
            "b": false,
            "y": false,
            "b8": false,
            "b9": false
          }
        },
        "final": {
          "mats": 50,
          "pot": 0,
          "tab": "upgrade",
          "selected": false
        },
        "buttonStillConnected": true,
        "trace": [
          [
            "click",
            "",
            true
          ],
          [
            "click",
            "",
            true
          ]
        ]
      },
      {
        "file": "game-easy-test.html",
        "scenario": "persistent-a-normal",
        "policy": "current",
        "before": {
          "mats": 50,
          "pot": 0
        },
        "out": {
          "mats": 47,
          "pot": 1,
          "tab": "potion",
          "selected": false,
          "prev": {
            "lb": false,
            "rb": false,
            "start": false,
            "a": true,
            "b": false,
            "y": false,
            "b8": false,
            "b9": false
          }
        },
        "final": {
          "mats": 47,
          "pot": 1,
          "tab": "potion",
          "selected": false
        },
        "buttonStillConnected": true,
        "trace": [
          [
            "click",
            "",
            true
          ],
          [
            "text",
            0,
            -20,
            "❤️‍🔥 HP 물약 Lv.1!",
            "#ffcc00",
            50
          ],
          [
            "save"
          ]
        ]
      },
      {
        "file": "game-easy-test.html",
        "scenario": "persistent-lb-a",
        "policy": "current",
        "before": {
          "mats": 50,
          "pot": 0
        },
        "out": {
          "mats": 50,
          "pot": 0,
          "tab": "upgrade",
          "selected": false,
          "prev": {
            "lb": true,
            "rb": false,
            "start": false,
            "a": true,
            "b": false,
            "y": false,
            "b8": false,
            "b9": false
          }
        },
        "final": {
          "mats": 50,
          "pot": 0,
          "tab": "upgrade",
          "selected": false
        },
        "buttonStillConnected": true,
        "trace": [
          [
            "click",
            "",
            true
          ],
          [
            "click",
            "",
            true
          ]
        ]
      },
      {
        "file": "game-easy-test.html",
        "scenario": "persistent-lb-then-a",
        "policy": "current",
        "before": {
          "mats": 50,
          "pot": 0
        },
        "out": {
          "mats": 50,
          "pot": 0,
          "tab": "upgrade",
          "selected": false,
          "prev": {
            "lb": true,
            "rb": false,
            "start": false,
            "a": false,
            "b": false,
            "y": false,
            "b8": false,
            "b9": false
          }
        },
        "final": {
          "mats": 50,
          "pot": 0,
          "tab": "upgrade",
          "selected": false
        },
        "buttonStillConnected": true,
        "trace": [
          [
            "click",
            "",
            true
          ],
          [
            "click",
            "",
            true
          ]
        ]
      }
    ],
    "docs": {
      "query": "_gpUINav|LB/RB|탭 전환|패드.*대장간|가루.*제작",
      "matches": 28,
      "sha": "150751fa1bed35428f08c508820821c9a1df20fd4c38689bfa053b20b3a7820d"
    },
    "correction": "Connected persistent fgCraftBtn survives LB render but actual tab callback clears _forgeSel before _fgCraft, so no stale economic debit. Sequential LB then A selects live current DOM; old saved callback never called directly.",
    "limits": [
      "Actual whole _gpUINav→actual forge tab onclick→whole renderForge→automatic old cur.click; Gamepad snapshot and DOM mock",
      "One LB+A snapshot supplied; _pollGamepad/device/native browser not executed, Dpad focused-index setup explicit",
      "Original source only no new candidate needed; full _fgSelect/_fgCraft executed",
      "A normal potion upgrade0→1 cost3; connected LB+A or sequentialLBthenA cost0",
      "No production/shared docs/Git/new files changed"
    ],
    "newFiles": 0,
    "script": "import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {tokenizer,parse} from 'acorn';import {spawnSync} from 'node:child_process';\nconst sha=x=>createHash('sha256').update(x).digest('hex');\nfunction extract(s,n){const start=s.indexOf('function '+n+'(');assert(start>=0,n);return balanced(s,start);}\nfunction balanced(s,start){const t=tokenizer(s.slice(start),{ecmaVersion:'latest'});let d=0,o=false;for(;;){const k=t.getToken(),l=k.type.label;if(l==='{'||l==='$'+'{'){d++;o=true;}if(l==='}')d--;if(o&&d===0)return s.slice(start,start+k.end);if(l==='eof')throw Error('extract eof');}}\n\nconst rows=[],sources=[];\nfor(const file of ['game.html','game-easy-test.html']){\nconst html=fs.readFileSync(file,'utf8'),select=extract(html,'_fgSelect'),craft=extract(html,'_fgCraft'),heal=extract(html,'potHeal'),nav=extract(html,'_gpUINav'),forge=extract(html,'renderForge'),crystals=html.slice(html.indexOf('const CR_ATK_SLOTS='),html.indexOf('const ITEM_SIZE=')),mal=extract(html,'_malCost');\nconst old='_gpUIPrev.lb=lb;_gpUIPrev.rb=rb;';\nconst newer=old+\"\\nif(a&&!_gpUIPrev.a&&cur&&!panel.contains(cur)){_gpUIPrev.a=a;_gpBtnsPrev['k0']=true;return;}\";\nconst ni=nav.indexOf(old,nav.indexOf('const cur=items[_gpUIIdx]'));assert(ni>=0);const candidate=nav.slice(0,ni)+newer+nav.slice(ni+old.length);assert.notEqual(candidate,nav);sources.push({file,wholeSHA:sha(html),navSHA:sha(nav),forgeSHA:sha(forge),candidateSHA:sha(candidate),patch:{old,newer}});\nfor(const scenario of ['persistent-a-normal','persistent-lb-a','persistent-lb-then-a']){\nfor(const policy of ['current']){\nconst trace=[],nodes=new Map();let panel;\nclass E{constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.style={setProperty(){}};this.dataset={};this.className='';this.classList={add:()=>{},contains:k=>this.className.split(' ').includes(k)};this.textContent='';}appendChild(x){this.children.push(x);x.parentElement=this;return x}replaceChildren(...x){this.children.forEach(c=>c.parentElement=null);this.children=x;x.forEach(c=>c.parentElement=this)}set innerHTML(x){this.markup=x;this.replaceChildren()}get innerHTML(){return this.markup||''}setAttribute(k,v){this[k]=v}get offsetParent(){let n=this;while(n){if(n.style.display==='none')return null;n=n.parentElement;}return {};}closest(){return null}querySelector(){return null}contains(x){return x===this||this.children.some(c=>c.contains(x))}querySelectorAll(sel){const all=this.children.flatMap(c=>[c,...c.querySelectorAll('*')]);return sel==='*'?all:sel==='.fg-tab'?all.filter(c=>c.className.split(' ').includes('fg-tab')):all.filter(c=>typeof c.onclick==='function')}click(){trace.push(['click',this.textContent,panel?.contains(this)]);this.onclick?.({})}scrollIntoView(){}}\npanel=new E();panel.id='forge';const $=id=>{if(!nodes.has(id)){const e=new E();e.id=id;nodes.set(id,e)}return nodes.get(id)};panel.appendChild($('fgTabs'));panel.appendChild($('fgGrid'));$('forgeConfirm').appendChild($('fgCraftBtn'));panel.appendChild($('forgeConfirm'));\nconst buttons=Array.from({length:16},(_,i)=>({pressed:i===0&&scenario!=='persistent-lb-then-a'||i===4&&scenario!=='persistent-a-normal'}));\nconst c=vm.createContext({document:{createElement:tag=>new E(tag),elementFromPoint:()=>null},$,G:{on:true,paused:true,mats:50,forgeTab:'potion'},P:{lv:100,x:0,y:0},POT_LV:{hp:0},_earringSlot:()=>false,OPT:{lang:'ko'},_T:x=>x,_L:x=>x,_glyph:()=>'',_MALICE_COST_MUL:.5,_ensureForgeAtlasLoad(){},BGM:{play(){}},SFX:{forge:()=>trace.push(['sound'])},addTxt:(...a)=>trace.push(['text',...a]),dbSaveNow:()=>trace.push(['save']),notify:x=>trace.push(['notify',x]),INV:{equipped:{},bag:[]},SLOT_NAMES:[],_forgeSel:null,_salSel:new Set(),_rerollSel:null,_gpad:{buttons,axes:[0,0,0,0]},_gpAxes:Array(8).fill(0),_gpVC:{vis:false},_gpUIPrev:{},_gpUIIdx:0,_gpBtnsPrev:{},_gpUIRepeatDir:null,_gpRSScrolled:false,performance:{now:()=>1000},listeningBind:null,_listenAlt:false,_GP_UI_DELAY:200,_GP_UI_INTERVAL:100,_gpUIStep:()=>{throw Error('unexpected move')},_gpVibrate:()=>{},Math:Object.assign(Object.create(Math),{random:()=>{throw Error('unexpected RNG')}})});\nvm.runInContext(mal+'\\n'+crystals+'\\n'+select+'\\n'+craft+'\\n'+heal+'\\n'+forge+'\\n'+(policy==='current'?nav:candidate)+'\\nconst REROLL_COST=_malCost(200);_crForgeTab=\"decomp\";CRYSTAL_DUST=50;renderForge();',c);\nconst card=$('fgGrid').children.find(e=>e.onclick);assert(card);card.click();const persistent=$('fgCraftBtn');assert.equal(persistent.onclick,c._fgCraft);\nconst items=panel.querySelectorAll('selectors'),idx=items.findIndex(e=>e===persistent);assert(idx>=0);c._gpUIIdx=idx;trace.length=0;\nconst before=vm.runInContext('({mats:G.mats,pot:POT_LV.hp})',c);\nc.panel=panel;vm.runInContext('_gpUINav(panel)',c);\nconst out=JSON.parse(JSON.stringify(vm.runInContext('({mats:G.mats,pot:POT_LV.hp,tab:G.forgeTab,selected:_forgeSel!==null,prev:_gpUIPrev})',c)));\n\nif(scenario==='persistent-lb-then-a'){buttons[4].pressed=false;buttons[0].pressed=true;vm.runInContext('_gpUINav(panel)',c);}\nconst final=JSON.parse(JSON.stringify(vm.runInContext('({mats:G.mats,pot:POT_LV.hp,tab:G.forgeTab,selected:_forgeSel!==null})',c)));\nassert.equal(final.tab,scenario==='persistent-a-normal'?'potion':'upgrade');\nassert.equal(final.mats,scenario==='persistent-a-normal'?47:50);assert.equal(final.pot,scenario==='persistent-a-normal'?1:0);assert.equal(final.selected,false);\nassert.equal(panel.contains(persistent),true);assert.equal($('fgCraftBtn'),persistent);\nrows.push({file,scenario,policy,before,out,final,buttonStillConnected:panel.contains(persistent),trace});\n}\n}\n\n}\nconst query='_gpUINav|LB/RB|탭 전환|패드.*대장간|가루.*제작';const d=spawnSync('rg',['-n',query,'docs'],{encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(d.status,0);\nconsole.log(JSON.stringify({completionId:'BALANCE-gamepad-connected-confirm-selection-clear-1434',sourceRuns:rows.length,sources,rows,docs:{query,matches:d.stdout.trim().split('\\n').length,sha:sha(d.stdout)},correction:'Connected persistent fgCraftBtn survives LB render but actual tab callback clears _forgeSel before _fgCraft, so no stale economic debit. Sequential LB then A selects live current DOM; old saved callback never called directly.',limits:['Actual whole _gpUINav→actual forge tab onclick→whole renderForge→automatic old cur.click; Gamepad snapshot and DOM mock','One LB+A snapshot supplied; _pollGamepad/device/native browser not executed, Dpad focused-index setup explicit','Original source only no new candidate needed; full _fgSelect/_fgCraft executed','A normal potion upgrade0→1 cost3; connected LB+A or sequentialLBthenA cost0','No production/shared docs/Git/new files changed'],newFiles:0},null,2));\n",
    "receipt": {
      "chunk_id": "79b011",
      "wall_time_seconds": 0.000006917,
      "exit_code": 0,
      "original_token_count": 1854,
      "output": "{\n  \"completionId\": \"BALANCE-gamepad-connected-confirm-selection-clear-1434\",\n  \"sourceRuns\": 6,\n  \"sources\": [\n    {\n      \"file\": \"game.html\",\n      \"wholeSHA\": \"e462f2345682856d24bb416a17aec763281a8dceb02f21af565db189992353ea\",\n      \"navSHA\": \"3089e0aaac89e10c59769ffc246230eb04abeefabaf56e9e21a2ac7865047796\",\n      \"forgeSHA\": \"6407a724ea6d9f1d9ba3f36dfc12d5b7f8a712ff2ada17320b7fac8f6066c2eb\",\n      \"candidateSHA\": \"9dab9f6a3cc487fb14c24c8353e9875305a110c35c0d88bc1eee35f91a326ceb\",\n      \"patch\": {\n        \"old\": \"_gpUIPrev.lb=lb;_gpUIPrev.rb=rb;\",\n        \"newer\": \"_gpUIPrev.lb=lb;_gpUIPrev.rb=rb;\\nif(a&&!_gpUIPrev.a&&cur&&!panel.contains(cur)){_gpUIPrev.a=a;_gpBtnsPrev['k0']=true;return;}\"\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"wholeSHA\": \"68fa8e17d379fdf7e9da20b153d874e2ac74544d790397b4d36edbcc1207f390\",\n      \"navSHA\": \"cc02ae15d667b7500e2f21dd84e0ee79ce6c2b704e526111face98ab52f4b4b0\",\n      \"forgeSHA\": \"44c24b9c9130b66b3cce2e50ff923ae06a4d35834fd2c9b01c46797a5ff0dcf1\",\n      \"candidateSHA\": \"2c19397cd3f76b76a0db0b658c0a18c44953f669b57ad1b23aa6f9bb073704de\",\n      \"patch\": {\n        \"old\": \"_gpUIPrev.lb=lb;_gpUIPrev.rb=rb;\",\n        \"newer\": \"_gpUIPrev.lb=lb;_gpUIPrev.rb=rb;\\nif(a&&!_gpUIPrev.a&&cur&&!panel.contains(cur)){_gpUIPrev.a=a;_gpBtnsPrev['k0']=true;return;}\"\n      }\n    }\n  ],\n  \"rows\": [\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"persistent-a-normal\",\n      \"policy\": \"current\",\n      \"before\": {\n        \"mats\": 50,\n        \"pot\": 0\n      },\n      \"out\": {\n        \"mats\": 47,\n        \"pot\": 1,\n        \"tab\": \"potion\",\n        \"selected\": false,\n        \"prev\": {\n          \"lb\": false,\n          \"rb\": false,\n          \"start\": false,\n          \"a\": true,\n          \"b\": false,\n          \"y\": false,\n          \"b8\": false,\n          \"b9\": false\n        }\n      },\n      \"final\": {\n        \"mats\": 47,\n        \"pot\": 1,\n        \"tab\": \"potion\",\n        \"selected\": false\n      },\n      \"buttonStillConnected\": true,\n      \"trace\": [\n        [\n          \"click\",\n          \"\",\n          true\n        ],\n        [\n          \"text\",\n          0,\n          -20,\n          \"❤️‍🔥 HP 물약 Lv.1!\",\n          \"#ffcc00\",\n          50\n        ],\n        [\n          \"save\"\n        ]\n      ]\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"persistent-lb-a\",\n      \"policy\": \"current\",\n      \"before\": {\n        \"mats\": 50,\n        \"pot\": 0\n      },\n      \"out\": {\n        \"mats\": 50,\n        \"pot\": 0,\n        \"tab\": \"upgrade\",\n        \"selected\": false,\n        \"prev\": {\n          \"lb\": true,\n          \"rb\": false,\n          \"start\": false,\n          \"a\": true,\n          \"b\": false,\n          \"y\": false,\n          \"b8\": false,\n          \"b9\": false\n        }\n      },\n      \"final\": {\n        \"mats\": 50,\n        \"pot\": 0,\n        \"tab\": \"upgrade\",\n        \"selected\": false\n      },\n      \"buttonStillConnected\": true,\n      \"trace\": [\n        [\n          \"click\",\n          \"\",\n          true\n        ],\n        [\n          \"click\",\n          \"\",\n          true\n        ]\n      ]\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"persistent-lb-then-a\",\n      \"policy\": \"current\",\n      \"before\": {\n        \"mats\": 50,\n        \"pot\": 0\n      },\n      \"out\": {\n        \"mats\": 50,\n        \"pot\": 0,\n        \"tab\": \"upgrade\",\n        \"selected\": false,\n        \"prev\": {\n          \"lb\": true,\n          \"rb\": false,\n          \"start\": false,\n          \"a\": false,\n          \"b\": false,\n          \"y\": false,\n          \"b8\": false,\n          \"b9\": false\n        }\n      },\n      \"final\": {\n        \"mats\": 50,\n        \"pot\": 0,\n        \"tab\": \"upgrade\",\n        \"selected\": false\n      },\n      \"buttonStillConnected\": true,\n      \"trace\": [\n        [\n          \"click\",\n          \"\",\n          true\n        ],\n        [\n          \"click\",\n          \"\",\n          true\n        ]\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"persistent-a-normal\",\n      \"policy\": \"current\",\n      \"before\": {\n        \"mats\": 50,\n        \"pot\": 0\n      },\n      \"out\": {\n        \"mats\": 47,\n        \"pot\": 1,\n        \"tab\": \"potion\",\n        \"selected\": false,\n        \"prev\": {\n          \"lb\": false,\n          \"rb\": false,\n          \"start\": false,\n          \"a\": true,\n          \"b\": false,\n          \"y\": false,\n          \"b8\": false,\n          \"b9\": false\n        }\n      },\n      \"final\": {\n        \"mats\": 47,\n        \"pot\": 1,\n        \"tab\": \"potion\",\n        \"selected\": false\n      },\n      \"buttonStillConnected\": true,\n      \"trace\": [\n        [\n          \"click\",\n          \"\",\n          true\n        ],\n        [\n          \"text\",\n          0,\n          -20,\n          \"❤️‍🔥 HP 물약 Lv.1!\",\n          \"#ffcc00\",\n          50\n        ],\n        [\n          \"save\"\n        ]\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"persistent-lb-a\",\n      \"policy\": \"current\",\n      \"before\": {\n        \"mats\": 50,\n        \"pot\": 0\n      },\n      \"out\": {\n        \"mats\": 50,\n        \"pot\": 0,\n        \"tab\": \"upgrade\",\n        \"selected\": false,\n        \"prev\": {\n          \"lb\": true,\n          \"rb\": false,\n          \"start\": false,\n          \"a\": true,\n          \"b\": false,\n          \"y\": false,\n          \"b8\": false,\n          \"b9\": false\n        }\n      },\n      \"final\": {\n        \"mats\": 50,\n        \"pot\": 0,\n        \"tab\": \"upgrade\",\n        \"selected\": false\n      },\n      \"buttonStillConnected\": true,\n      \"trace\": [\n        [\n          \"click\",\n          \"\",\n          true\n        ],\n        [\n          \"click\",\n          \"\",\n          true\n        ]\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"persistent-lb-then-a\",\n      \"policy\": \"current\",\n      \"before\": {\n        \"mats\": 50,\n        \"pot\": 0\n      },\n      \"out\": {\n        \"mats\": 50,\n        \"pot\": 0,\n        \"tab\": \"upgrade\",\n        \"selected\": false,\n        \"prev\": {\n          \"lb\": true,\n          \"rb\": false,\n          \"start\": false,\n          \"a\": false,\n          \"b\": false,\n          \"y\": false,\n          \"b8\": false,\n          \"b9\": false\n        }\n      },\n      \"final\": {\n        \"mats\": 50,\n        \"pot\": 0,\n        \"tab\": \"upgrade\",\n        \"selected\": false\n      },\n      \"buttonStillConnected\": true,\n      \"trace\": [\n        [\n          \"click\",\n          \"\",\n          true\n        ],\n        [\n          \"click\",\n          \"\",\n          true\n        ]\n      ]\n    }\n  ],\n  \"docs\": {\n    \"query\": \"_gpUINav|LB/RB|탭 전환|패드.*대장간|가루.*제작\",\n    \"matches\": 28,\n    \"sha\": \"150751fa1bed35428f08c508820821c9a1df20fd4c38689bfa053b20b3a7820d\"\n  },\n  \"correction\": \"Connected persistent fgCraftBtn survives LB render but actual tab callback clears _forgeSel before _fgCraft, so no stale economic debit. Sequential LB then A selects live current DOM; old saved callback never called directly.\",\n  \"limits\": [\n    \"Actual whole _gpUINav→actual forge tab onclick→whole renderForge→automatic old cur.click; Gamepad snapshot and DOM mock\",\n    \"One LB+A snapshot supplied; _pollGamepad/device/native browser not executed, Dpad focused-index setup explicit\",\n    \"Original source only no new candidate needed; full _fgSelect/_fgCraft executed\",\n    \"A normal potion upgrade0→1 cost3; connected LB+A or sequentialLBthenA cost0\",\n    \"No production/shared docs/Git/new files changed\"\n  ],\n  \"newFiles\": 0\n}\n"
    },
    "corrections": [
      "Copied prior candidateSHA/patch metadata are reference only; every row policy current, candidate source was not run in this task.",
      "Limits description one LB+A snapshot applies persistent-lb-a; persistent-lb-then-a uses two successive actual nav calls.",
      "No new economic defect or production patch on this connected persistent button branch."
    ],
    "rootDocsHandoff": "3.3 gamepad interaction and2.8 potion docs: fgCraftBtn object remains connected but forge tabclick clears _forgeSel; actual_fgCraft earlyreturns. LBthenA freshDOM selection. No costformula changes or stalecost bypass reproduced. Native UNKNOWN."
  },
  "note": "checks.mjs is exact successful prior stdin, not executed after save. Original whole source fixtures and failed receipt preserved. Candidate monetary restoration remains root policy gate; no production/shared docs applied."
}
```
