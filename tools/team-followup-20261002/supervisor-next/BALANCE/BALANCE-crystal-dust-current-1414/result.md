# BALANCE 가루제작 현재 계약 — 1414

주검증24건: 전체 renderForge→종류/성급 선택→실제 제작 콜백 source. 정상50가루1회 동일. 이전callback replay에서 음수가루/상한초과/낡은가격·이름을 재현하고 최소후보 대조. 실제 빠른입력 자연도달 UNKNOWN. DOM/음향/저장 stub; 운영 미적용.

재실행0으로 이전 미저장 완료근거도 함께 보존. 불완전/실패 stdout은 원형 유지. 총괄은 현재 WIP에 최소패치 병합 후 관련 docs 전체 동기화 및 native gate를 수행해야 한다. 2_3 변경0.

```json
{
  "completionId": "BALANCE-crystal-dust-craft-current-gate-1414",
  "epoch": "rolling-after-ca261460-1404",
  "newFiles": 1,
  "productionApplied": false,
  "testsRerunForSaving": 0,
  "primary": {
    "completionId": "BALANCE-crystal-dust-craft-current-gate-1414",
    "sourceRuns": 24,
    "sources": [
      {
        "file": "game.html",
        "wholeSHA": "ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613",
        "forgeSHA": "6407a724ea6d9f1d9ba3f36dfc12d5b7f8a712ff2ada17320b7fac8f6066c2eb",
        "candidateSHA": "3a5507957a46f748719dab1150843bf616bb070dd7d8f1db3cb5778cedba8832",
        "patch": {
          "old": "btn.onclick=()=>{if(!ok)return;CRYSTAL_DUST-=dustCost;",
          "newer": "btn.onclick=()=>{const cd=CRYSTAL_DEFS[_crCraftType],s=CRYSTAL_STAR[_crCraftStar],dustCost=CRYSTAL_DUST_COST[_crCraftStar];if(!cd||!Number.isInteger(_crCraftStar)||!s||!Number.isFinite(dustCost)||dustCost<=0||!Number.isFinite(CRYSTAL_DUST)||CRYSTAL_DUST<dustCost||CRYSTAL_BAG.length>=CRYSTAL_BAG_MAX)return;CRYSTAL_DUST-=dustCost;"
        }
      },
      {
        "file": "game-easy-test.html",
        "wholeSHA": "8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129",
        "forgeSHA": "44c24b9c9130b66b3cce2e50ff923ae06a4d35834fd2c9b01c46797a5ff0dcf1",
        "candidateSHA": "6753f4522b1e7edd453b683f4cba500c047babec00106896f2ba8233c2f35952",
        "patch": {
          "old": "btn.onclick=()=>{if(!ok)return;CRYSTAL_DUST-=dustCost;",
          "newer": "btn.onclick=()=>{const cd=CRYSTAL_DEFS[_crCraftType],s=CRYSTAL_STAR[_crCraftStar],dustCost=CRYSTAL_DUST_COST[_crCraftStar];if(!cd||!Number.isInteger(_crCraftStar)||!s||!Number.isFinite(dustCost)||dustCost<=0||!Number.isFinite(CRYSTAL_DUST)||CRYSTAL_DUST<dustCost||CRYSTAL_BAG.length>=CRYSTAL_BAG_MAX)return;CRYSTAL_DUST-=dustCost;"
        }
      }
    ],
    "rows": [
      {
        "file": "game.html",
        "scenario": "normal-exact",
        "policy": "current",
        "out": {
          "mats": 0,
          "dust": 0,
          "bagCount": 1,
          "last": {
            "id": "cr_blood_oath",
            "star": 0,
            "enh": 0
          },
          "saveCalls": 1,
          "trace": [
            [
              "sound"
            ],
            [
              "text",
              0,
              -20,
              "조각 피의 맹세 제작!",
              "#888888",
              60
            ],
            [
              "save"
            ]
          ]
        }
      },
      {
        "file": "game.html",
        "scenario": "normal-exact",
        "policy": "candidate",
        "out": {
          "mats": 0,
          "dust": 0,
          "bagCount": 1,
          "last": {
            "id": "cr_blood_oath",
            "star": 0,
            "enh": 0
          },
          "saveCalls": 1,
          "trace": [
            [
              "sound"
            ],
            [
              "text",
              0,
              -20,
              "조각 피의 맹세 제작!",
              "#888888",
              60
            ],
            [
              "save"
            ]
          ]
        }
      },
      {
        "file": "game.html",
        "scenario": "repeat-exact",
        "policy": "current",
        "out": {
          "mats": 0,
          "dust": -50,
          "bagCount": 2,
          "last": {
            "id": "cr_blood_oath",
            "star": 0,
            "enh": 0
          },
          "saveCalls": 2,
          "trace": [
            [
              "sound"
            ],
            [
              "text",
              0,
              -20,
              "조각 피의 맹세 제작!",
              "#888888",
              60
            ],
            [
              "save"
            ],
            [
              "sound"
            ],
            [
              "text",
              0,
              -20,
              "조각 피의 맹세 제작!",
              "#888888",
              60
            ],
            [
              "save"
            ]
          ]
        }
      },
      {
        "file": "game.html",
        "scenario": "repeat-exact",
        "policy": "candidate",
        "out": {
          "mats": 0,
          "dust": 0,
          "bagCount": 1,
          "last": {
            "id": "cr_blood_oath",
            "star": 0,
            "enh": 0
          },
          "saveCalls": 1,
          "trace": [
            [
              "sound"
            ],
            [
              "text",
              0,
              -20,
              "조각 피의 맹세 제작!",
              "#888888",
              60
            ],
            [
              "save"
            ]
          ]
        }
      },
      {
        "file": "game.html",
        "scenario": "current-star",
        "policy": "current",
        "out": {
          "mats": 0,
          "dust": 150,
          "bagCount": 1,
          "last": {
            "id": "cr_blood_oath",
            "star": 1,
            "enh": 0
          },
          "saveCalls": 1,
          "trace": [
            [
              "sound"
            ],
            [
              "text",
              0,
              -20,
              "조각 피의 맹세 제작!",
              "#888888",
              60
            ],
            [
              "save"
            ]
          ]
        }
      },
      {
        "file": "game.html",
        "scenario": "current-star",
        "policy": "candidate",
        "out": {
          "mats": 0,
          "dust": 0,
          "bagCount": 1,
          "last": {
            "id": "cr_blood_oath",
            "star": 1,
            "enh": 0
          },
          "saveCalls": 1,
          "trace": [
            [
              "sound"
            ],
            [
              "text",
              0,
              -20,
              "파편 피의 맹세 제작!",
              "#44cc44",
              60
            ],
            [
              "save"
            ]
          ]
        }
      },
      {
        "file": "game.html",
        "scenario": "current-insufficient",
        "policy": "current",
        "out": {
          "mats": 0,
          "dust": -25,
          "bagCount": 1,
          "last": {
            "id": "cr_blood_oath",
            "star": 0,
            "enh": 0
          },
          "saveCalls": 1,
          "trace": [
            [
              "sound"
            ],
            [
              "text",
              0,
              -20,
              "조각 피의 맹세 제작!",
              "#888888",
              60
            ],
            [
              "save"
            ]
          ]
        }
      },
      {
        "file": "game.html",
        "scenario": "current-insufficient",
        "policy": "candidate",
        "out": {
          "mats": 0,
          "dust": 25,
          "bagCount": 0,
          "last": null,
          "saveCalls": 0,
          "trace": []
        }
      },
      {
        "file": "game.html",
        "scenario": "last-capacity",
        "policy": "current",
        "out": {
          "mats": 0,
          "dust": 0,
          "bagCount": 10000,
          "last": {
            "id": "cr_blood_oath",
            "star": 0,
            "enh": 0
          },
          "saveCalls": 2,
          "trace": [
            [
              "sound"
            ],
            [
              "text",
              0,
              -20,
              "조각 피의 맹세 제작!",
              "#888888",
              60
            ],
            [
              "save"
            ],
            [
              "sound"
            ],
            [
              "text",
              0,
              -20,
              "조각 피의 맹세 제작!",
              "#888888",
              60
            ],
            [
              "save"
            ]
          ]
        }
      },
      {
        "file": "game.html",
        "scenario": "last-capacity",
        "policy": "candidate",
        "out": {
          "mats": 0,
          "dust": 50,
          "bagCount": 9999,
          "last": {
            "id": "cr_blood_oath",
            "star": 0,
            "enh": 0
          },
          "saveCalls": 1,
          "trace": [
            [
              "sound"
            ],
            [
              "text",
              0,
              -20,
              "조각 피의 맹세 제작!",
              "#888888",
              60
            ],
            [
              "save"
            ]
          ]
        }
      },
      {
        "file": "game-easy-test.html",
        "scenario": "normal-exact",
        "policy": "current",
        "out": {
          "mats": 0,
          "dust": 0,
          "bagCount": 1,
          "last": {
            "id": "cr_atk",
            "star": 0,
            "enh": 0
          },
          "saveCalls": 1,
          "trace": [
            [
              "sound"
            ],
            [
              "text",
              0,
              -20,
              "조각 ATK결정 제작!",
              "#888888",
              60
            ],
            [
              "save"
            ]
          ]
        }
      },
      {
        "file": "game-easy-test.html",
        "scenario": "normal-exact",
        "policy": "candidate",
        "out": {
          "mats": 0,
          "dust": 0,
          "bagCount": 1,
          "last": {
            "id": "cr_atk",
            "star": 0,
            "enh": 0
          },
          "saveCalls": 1,
          "trace": [
            [
              "sound"
            ],
            [
              "text",
              0,
              -20,
              "조각 ATK결정 제작!",
              "#888888",
              60
            ],
            [
              "save"
            ]
          ]
        }
      },
      {
        "file": "game-easy-test.html",
        "scenario": "repeat-exact",
        "policy": "current",
        "out": {
          "mats": 0,
          "dust": -50,
          "bagCount": 2,
          "last": {
            "id": "cr_atk",
            "star": 0,
            "enh": 0
          },
          "saveCalls": 2,
          "trace": [
            [
              "sound"
            ],
            [
              "text",
              0,
              -20,
              "조각 ATK결정 제작!",
              "#888888",
              60
            ],
            [
              "save"
            ],
            [
              "sound"
            ],
            [
              "text",
              0,
              -20,
              "조각 ATK결정 제작!",
              "#888888",
              60
            ],
            [
              "save"
            ]
          ]
        }
      },
      {
        "file": "game-easy-test.html",
        "scenario": "repeat-exact",
        "policy": "candidate",
        "out": {
          "mats": 0,
          "dust": 0,
          "bagCount": 1,
          "last": {
            "id": "cr_atk",
            "star": 0,
            "enh": 0
          },
          "saveCalls": 1,
          "trace": [
            [
              "sound"
            ],
            [
              "text",
              0,
              -20,
              "조각 ATK결정 제작!",
              "#888888",
              60
            ],
            [
              "save"
            ]
          ]
        }
      },
      {
        "file": "game-easy-test.html",
        "scenario": "current-star",
        "policy": "current",
        "out": {
          "mats": 0,
          "dust": 150,
          "bagCount": 1,
          "last": {
            "id": "cr_atk",
            "star": 1,
            "enh": 0
          },
          "saveCalls": 1,
          "trace": [
            [
              "sound"
            ],
            [
              "text",
              0,
              -20,
              "조각 ATK결정 제작!",
              "#888888",
              60
            ],
            [
              "save"
            ]
          ]
        }
      },
      {
        "file": "game-easy-test.html",
        "scenario": "current-star",
        "policy": "candidate",
        "out": {
          "mats": 0,
          "dust": 0,
          "bagCount": 1,
          "last": {
            "id": "cr_atk",
            "star": 1,
            "enh": 0
          },
          "saveCalls": 1,
          "trace": [
            [
              "sound"
            ],
            [
              "text",
              0,
              -20,
              "파편 ATK결정 제작!",
              "#44cc44",
              60
            ],
            [
              "save"
            ]
          ]
        }
      },
      {
        "file": "game-easy-test.html",
        "scenario": "current-insufficient",
        "policy": "current",
        "out": {
          "mats": 0,
          "dust": -25,
          "bagCount": 1,
          "last": {
            "id": "cr_atk",
            "star": 0,
            "enh": 0
          },
          "saveCalls": 1,
          "trace": [
            [
              "sound"
            ],
            [
              "text",
              0,
              -20,
              "조각 ATK결정 제작!",
              "#888888",
              60
            ],
            [
              "save"
            ]
          ]
        }
      },
      {
        "file": "game-easy-test.html",
        "scenario": "current-insufficient",
        "policy": "candidate",
        "out": {
          "mats": 0,
          "dust": 25,
          "bagCount": 0,
          "last": null,
          "saveCalls": 0,
          "trace": []
        }
      },
      {
        "file": "game-easy-test.html",
        "scenario": "last-capacity",
        "policy": "current",
        "out": {
          "mats": 0,
          "dust": 0,
          "bagCount": 10000,
          "last": {
            "id": "cr_atk",
            "star": 0,
            "enh": 0
          },
          "saveCalls": 2,
          "trace": [
            [
              "sound"
            ],
            [
              "text",
              0,
              -20,
              "조각 ATK결정 제작!",
              "#888888",
              60
            ],
            [
              "save"
            ],
            [
              "sound"
            ],
            [
              "text",
              0,
              -20,
              "조각 ATK결정 제작!",
              "#888888",
              60
            ],
            [
              "save"
            ]
          ]
        }
      },
      {
        "file": "game-easy-test.html",
        "scenario": "last-capacity",
        "policy": "candidate",
        "out": {
          "mats": 0,
          "dust": 50,
          "bagCount": 9999,
          "last": {
            "id": "cr_atk",
            "star": 0,
            "enh": 0
          },
          "saveCalls": 1,
          "trace": [
            [
              "sound"
            ],
            [
              "text",
              0,
              -20,
              "조각 ATK결정 제작!",
              "#888888",
              60
            ],
            [
              "save"
            ]
          ]
        }
      }
    ],
    "docs": {
      "query": "CRYSTAL_DUST|CRYSTAL_DUST_COST|CRYSTAL_BAG_MAX|가루.*제작|제작.*가루",
      "matches": 19,
      "sha": "adceb474d73b34a56d431484bfef760bdb7adb3fa0a758ce4e3ea6cb296a98f3"
    },
    "limits": [
      "Full actual renderForge decomp tab→type button→dust craft button; current-star test also actual star selector→old callback",
      "Current dust change/cap-last/repeat callback injected; native old callback rapid-input reachability UNKNOWN",
      "Existing recipes50/200/500/1500/5000 unchanged; cap9999 unchanged",
      "DOM/audio/save stubbed; no native game visual persistence PASS",
      "No production shared docs Git files edits"
    ],
    "newFiles": 0,
    "script": "import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {tokenizer,parse} from 'acorn';import {spawnSync} from 'node:child_process';\nconst sha=x=>createHash('sha256').update(x).digest('hex');\nfunction extract(s,n){const start=s.indexOf('function '+n+'(');assert(start>=0,n);return balanced(s,start);}\nfunction balanced(s,start){const t=tokenizer(s.slice(start),{ecmaVersion:'latest'});let d=0,o=false;for(;;){const k=t.getToken(),l=k.type.label;if(l==='{'||l==='$'+'{'){d++;o=true;}if(l==='}')d--;if(o&&d===0)return s.slice(start,start+k.end);if(l==='eof')throw Error('extract eof');}}\n\nclass E{constructor(){this.children=[];this.style={setProperty(){}};this.classList={add(){}};this.dataset={};this.textContent=''}appendChild(x){this.children.push(x);return x}replaceChildren(...x){this.children=x}setAttribute(k,v){this[k]=v}set innerHTML(x){this.markup=x;this.children=[]}get innerHTML(){return this.markup||''}querySelector(){return null}}\nconst descend=e=>[e,...e.children.flatMap(descend)],rows=[],sources=[];\nfor(const file of ['game.html','game-easy-test.html']){\nconst html=fs.readFileSync(file,'utf8'),forge=extract(html,'renderForge'),crystals=html.slice(html.indexOf('const CR_ATK_SLOTS='),html.indexOf('const ITEM_SIZE=')),mal=extract(html,'_malCost');\nconst old='btn.onclick=()=>{if(!ok)return;CRYSTAL_DUST-=dustCost;';\nconst newer='btn.onclick=()=>{const cd=CRYSTAL_DEFS[_crCraftType],s=CRYSTAL_STAR[_crCraftStar],dustCost=CRYSTAL_DUST_COST[_crCraftStar];if(!cd||!Number.isInteger(_crCraftStar)||!s||!Number.isFinite(dustCost)||dustCost<=0||!Number.isFinite(CRYSTAL_DUST)||CRYSTAL_DUST<dustCost||CRYSTAL_BAG.length>=CRYSTAL_BAG_MAX)return;CRYSTAL_DUST-=dustCost;';\nconst candidate=forge.replace(old,newer);assert.notEqual(candidate,forge);sources.push({file,wholeSHA:sha(html),forgeSHA:sha(forge),candidateSHA:sha(candidate),patch:{old,newer}});\nfor(const scenario of ['normal-exact','repeat-exact','current-star','current-insufficient','last-capacity']){\nfor(const policy of ['current','candidate']){\nconst nodes=new Map(),trace=[],bag=[];\nconst c=vm.createContext({document:{createElement:()=>new E()},$:id=>{if(!nodes.has(id))nodes.set(id,new E());return nodes.get(id)},G:{mats:0,forgeTab:'crystal'},P:{x:0,y:0},OPT:{lang:'ko'},_T:x=>x,_L:x=>x,_glyph:()=>'',_MALICE_COST_MUL:.5,_ensureForgeAtlasLoad(){},BGM:{play(){}},SFX:{forge:()=>trace.push(['sound'])},addTxt:(...a)=>trace.push(['text',...a]),dbSaveNow:()=>trace.push(['save']),notify:x=>trace.push(['notify',x]),INV:{equipped:{},bag:[]},SLOT_NAMES:[],_forgeSel:null,_salSel:new Set(),_rerollSel:null,bag,Math:Object.assign(Object.create(Math),{random:()=>{throw Error('unexpected RNG')}})});\nvm.runInContext(mal+'\\n'+crystals+'\\n'+(policy==='current'?forge:candidate)+'\\nCRYSTAL_BAG=bag;_crForgeTab=\"decomp\";',c);\n\nconst run=x=>vm.runInContext(x,c),id=run('Object.keys(CRYSTAL_DEFS)[0]');\nif(scenario==='last-capacity')bag.push(...Array.from({length:9998},()=>({id,star:0,enh:0})));\nrun('CRYSTAL_DUST=50;renderForge()');\nconst typeButton=descend(nodes.get('fgGrid')).find(e=>e.onclick&&String(e.onclick).includes('_crCraftType=id'));assert(typeButton);typeButton.onclick();\nconst button=descend(nodes.get('fgGrid')).find(e=>e.onclick&&String(e.onclick).includes('CRYSTAL_DUST-=dustCost'));assert(button);\nif(scenario==='current-star'){\n run('CRYSTAL_DUST=200');\n const starButton=descend(nodes.get('fgGrid')).find(e=>e.onclick&&String(e.onclick).includes('_crCraftStar=si')&&e.textContent.startsWith('2'));assert(starButton);starButton.onclick();\n}\nif(scenario==='current-insufficient')run('CRYSTAL_DUST=25');\nif(scenario==='last-capacity')run('CRYSTAL_DUST=100');\nbutton.onclick();if(['repeat-exact','last-capacity'].includes(scenario))button.onclick();\nconst out={mats:c.G.mats,dust:run('CRYSTAL_DUST'),bagCount:bag.length,last:bag.length?JSON.parse(JSON.stringify(bag.at(-1))):null,saveCalls:trace.filter(x=>x[0]==='save').length,trace};\nassert.equal(out.mats,0);\nconst expectedDust=scenario==='repeat-exact'&&policy==='current'?-50:scenario==='current-star'?(policy==='current'?150:0):scenario==='current-insufficient'?(policy==='current'?-25:25):scenario==='last-capacity'?(policy==='current'?0:50):0;\nassert.equal(out.dust,expectedDust);\nif(scenario==='last-capacity')assert.equal(out.bagCount,policy==='current'?10000:9999);\nelse assert.equal(out.bagCount,scenario==='repeat-exact'&&policy==='current'?2:scenario==='current-insufficient'&&policy==='candidate'?0:1);\nif(scenario==='current-star')assert.equal(out.last.star,1);\nrows.push({file,scenario,policy,out});\n}\n}\nconst n=rows.filter(x=>x.file===file&&x.scenario==='normal-exact');assert.deepEqual(n[0].out,n[1].out);\n}\nconst query='CRYSTAL_DUST|CRYSTAL_DUST_COST|CRYSTAL_BAG_MAX|가루.*제작|제작.*가루';const d=spawnSync('rg',['-n',query,'docs'],{encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(d.status,0);\nconsole.log(JSON.stringify({completionId:'BALANCE-crystal-dust-craft-current-gate-1414',sourceRuns:rows.length,sources,rows,docs:{query,matches:d.stdout.trim().split('\\n').length,sha:sha(d.stdout)},limits:['Full actual renderForge decomp tab→type button→dust craft button; current-star test also actual star selector→old callback','Current dust change/cap-last/repeat callback injected; native old callback rapid-input reachability UNKNOWN','Existing recipes50/200/500/1500/5000 unchanged; cap9999 unchanged','DOM/audio/save stubbed; no native game visual persistence PASS','No production shared docs Git files edits'],newFiles:0},null,2));\n",
    "receipt": {
      "chunk_id": "181b97",
      "wall_time_seconds": 0.0416075,
      "exit_code": 0,
      "original_token_count": 3615,
      "output": "{\n  \"completionId\": \"BALANCE-crystal-dust-craft-current-gate-1414\",\n  \"sourceRuns\": 20,\n  \"sources\": [\n    {\n      \"file\": \"game.html\",\n      \"wholeSHA\": \"ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613\",\n      \"forgeSHA\": \"6407a724ea6d9f1d9ba3f36dfc12d5b7f8a712ff2ada17320b7fac8f6066c2eb\",\n      \"candidateSHA\": \"3a5507957a46f748719dab1150843bf616bb070dd7d8f1db3cb5778cedba8832\",\n      \"patch\": {\n        \"old\": \"btn.onclick=()=>{if(!ok)return;CRYSTAL_DUST-=dustCost;\",\n        \"newer\": \"btn.onclick=()=>{const cd=CRYSTAL_DEFS[_crCraftType],s=CRYSTAL_STAR[_crCraftStar],dustCost=CRYSTAL_DUST_COST[_crCraftStar];if(!cd||!Number.isInteger(_crCraftStar)||!s||!Number.isFinite(dustCost)||dustCost<=0||!Number.isFinite(CRYSTAL_DUST)||CRYSTAL_DUST<dustCost||CRYSTAL_BAG.length>=CRYSTAL_BAG_MAX)return;CRYSTAL_DUST-=dustCost;\"\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"wholeSHA\": \"8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129\",\n      \"forgeSHA\": \"44c24b9c9130b66b3cce2e50ff923ae06a4d35834fd2c9b01c46797a5ff0dcf1\",\n      \"candidateSHA\": \"6753f4522b1e7edd453b683f4cba500c047babec00106896f2ba8233c2f35952\",\n      \"patch\": {\n        \"old\": \"btn.onclick=()=>{if(!ok)return;CRYSTAL_DUST-=dustCost;\",\n        \"newer\": \"btn.onclick=()=>{const cd=CRYSTAL_DEFS[_crCraftType],s=CRYSTAL_STAR[_crCraftStar],dustCost=CRYSTAL_DUST_COST[_crCraftStar];if(!cd||!Number.isInteger(_crCraftStar)||!s||!Number.isFinite(dustCost)||dustCost<=0||!Number.isFinite(CRYSTAL_DUST)||CRYSTAL_DUST<dustCost||CRYSTAL_BAG.length>=CRYSTAL_BAG_MAX)return;CRYSTAL_DUST-=dustCost;\"\n      }\n    }\n  ],\n  \"rows\": [\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"normal-exact\",\n      \"policy\": \"current\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 0,\n        \"bagCount\": 1,\n        \"last\": {\n          \"id\": \"cr_blood_oath\",\n          \"star\": 0,\n          \"enh\": 0\n        },\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"조각 피의 맹세 제작!\",\n            \"#888888\",\n            60\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"normal-exact\",\n      \"policy\": \"candidate\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 0,\n        \"bagCount\": 1,\n        \"last\": {\n          \"id\": \"cr_blood_oath\",\n          \"star\": 0,\n          \"enh\": 0\n        },\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"조각 피의 맹세 제작!\",\n            \"#888888\",\n            60\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"repeat-exact\",\n      \"policy\": \"current\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": -50,\n        \"bagCount\": 2,\n        \"last\": {\n          \"id\": \"cr_blood_oath\",\n          \"star\": 0,\n          \"enh\": 0\n        },\n        \"saveCalls\": 2,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"조각 피의 맹세 제작!\",\n            \"#888888\",\n            60\n          ],\n          [\n            \"save\"\n          ],\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"조각 피의 맹세 제작!\",\n            \"#888888\",\n            60\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"repeat-exact\",\n      \"policy\": \"candidate\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 0,\n        \"bagCount\": 1,\n        \"last\": {\n          \"id\": \"cr_blood_oath\",\n          \"star\": 0,\n          \"enh\": 0\n        },\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"조각 피의 맹세 제작!\",\n            \"#888888\",\n            60\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"current-star\",\n      \"policy\": \"current\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 150,\n        \"bagCount\": 1,\n        \"last\": {\n          \"id\": \"cr_blood_oath\",\n          \"star\": 1,\n          \"enh\": 0\n        },\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"조각 피의 맹세 제작!\",\n            \"#888888\",\n            60\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"current-star\",\n      \"policy\": \"candidate\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 0,\n        \"bagCount\": 1,\n        \"last\": {\n          \"id\": \"cr_blood_oath\",\n          \"star\": 1,\n          \"enh\": 0\n        },\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"파편 피의 맹세 제작!\",\n            \"#44cc44\",\n            60\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"current-insufficient\",\n      \"policy\": \"current\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": -25,\n        \"bagCount\": 1,\n        \"last\": {\n          \"id\": \"cr_blood_oath\",\n          \"star\": 0,\n          \"enh\": 0\n        },\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"조각 피의 맹세 제작!\",\n            \"#888888\",\n            60\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"current-insufficient\",\n      \"policy\": \"candidate\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 25,\n        \"bagCount\": 0,\n        \"last\": null,\n        \"saveCalls\": 0,\n        \"trace\": []\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"last-capacity\",\n      \"policy\": \"current\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 0,\n        \"bagCount\": 10000,\n        \"last\": {\n          \"id\": \"cr_blood_oath\",\n          \"star\": 0,\n          \"enh\": 0\n        },\n        \"saveCalls\": 2,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"조각 피의 맹세 제작!\",\n            \"#888888\",\n            60\n          ],\n          [\n            \"save\"\n          ],\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"조각 피의 맹세 제작!\",\n            \"#888888\",\n            60\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"last-capacity\",\n      \"policy\": \"candidate\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 50,\n        \"bagCount\": 9999,\n        \"last\": {\n          \"id\": \"cr_blood_oath\",\n          \"star\": 0,\n          \"enh\": 0\n        },\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"조각 피의 맹세 제작!\",\n            \"#888888\",\n            60\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"normal-exact\",\n      \"policy\": \"current\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 0,\n        \"bagCount\": 1,\n        \"last\": {\n          \"id\": \"cr_atk\",\n          \"star\": 0,\n          \"enh\": 0\n        },\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"조각 ATK결정 제작!\",\n            \"#888888\",\n            60\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"normal-exact\",\n      \"policy\": \"candidate\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 0,\n        \"bagCount\": 1,\n        \"last\": {\n          \"id\": \"cr_atk\",\n          \"star\": 0,\n          \"enh\": 0\n        },\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"조각 ATK결정 제작!\",\n            \"#888888\",\n            60\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"repeat-exact\",\n      \"policy\": \"current\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": -50,\n        \"bagCount\": 2,\n        \"last\": {\n          \"id\": \"cr_atk\",\n          \"star\": 0,\n          \"enh\": 0\n        },\n        \"saveCalls\": 2,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"조각 ATK결정 제작!\",\n            \"#888888\",\n            60\n          ],\n          [\n            \"save\"\n          ],\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"조각 ATK결정 제작!\",\n            \"#888888\",\n            60\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"repeat-exact\",\n      \"policy\": \"candidate\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 0,\n        \"bagCount\": 1,\n        \"last\": {\n          \"id\": \"cr_atk\",\n          \"star\": 0,\n          \"enh\": 0\n        },\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"조각 ATK결정 제작!\",\n            \"#888888\",\n            60\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"current-star\",\n      \"policy\": \"current\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 150,\n        \"bagCount\": 1,\n        \"last\": {\n          \"id\": \"cr_atk\",\n          \"star\": 1,\n          \"enh\": 0\n        },\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"조각 ATK결정 제작!\",\n            \"#888888\",\n            60\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"current-star\",\n      \"policy\": \"candidate\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 0,\n        \"bagCount\": 1,\n        \"last\": {\n          \"id\": \"cr_atk\",\n          \"star\": 1,\n          \"enh\": 0\n        },\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"파편 ATK결정 제작!\",\n            \"#44cc44\",\n            60\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"current-insufficient\",\n      \"policy\": \"current\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": -25,\n        \"bagCount\": 1,\n        \"last\": {\n          \"id\": \"cr_atk\",\n          \"star\": 0,\n          \"enh\": 0\n        },\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"조각 ATK결정 제작!\",\n            \"#888888\",\n            60\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"current-insufficient\",\n      \"policy\": \"candidate\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 25,\n        \"bagCount\": 0,\n        \"last\": null,\n        \"saveCalls\": 0,\n        \"trace\": []\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"last-capacity\",\n      \"policy\": \"current\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 0,\n        \"bagCount\": 10000,\n        \"last\": {\n          \"id\": \"cr_atk\",\n          \"star\": 0,\n          \"enh\": 0\n        },\n        \"saveCalls\": 2,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"조각 ATK결정 제작!\",\n            \"#888888\",\n            60\n          ],\n          [\n            \"save\"\n          ],\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"조각 ATK결정 제작!\",\n            \"#888888\",\n            60\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"last-capacity\",\n      \"policy\": \"candidate\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 50,\n        \"bagCount\": 9999,\n        \"last\": {\n          \"id\": \"cr_atk\",\n          \"star\": 0,\n          \"enh\": 0\n        },\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"조각 ATK결정 제작!\",\n            \"#888888\",\n            60\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    }\n  ],\n  \"docs\": {\n    \"query\": \"CRYSTAL_DUST|CRYSTAL_DUST_COST|CRYSTAL_BAG_MAX|가루.*제작|제작.*가루\",\n    \"matches\": 19,\n    \"sha\": \"adceb474d73b34a56d431484bfef760bdb7adb3fa0a758ce4e3ea6cb296a98f3\"\n  },\n  \"limits\": [\n    \"Full actual renderForge decomp tab→type button→dust craft button; current-star test also actual star selector→old callback\",\n    \"Current dust change/cap-last/repeat callback injected; native old callback rapid-input reachability UNKNOWN\",\n    \"Existing recipes50/200/500/1500/5000 unchanged; cap9999 unchanged\",\n    \"DOM/audio/save stubbed; no native game visual persistence PASS\",\n    \"No production shared docs Git files edits\"\n  ],\n  \"newFiles\": 0\n}\n"
    },
    "supplement": {
      "script": "import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {tokenizer,parse} from 'acorn';import {spawnSync} from 'node:child_process';\nconst sha=x=>createHash('sha256').update(x).digest('hex');\nfunction extract(s,n){const start=s.indexOf('function '+n+'(');assert(start>=0,n);return balanced(s,start);}\nfunction balanced(s,start){const t=tokenizer(s.slice(start),{ecmaVersion:'latest'});let d=0,o=false;for(;;){const k=t.getToken(),l=k.type.label;if(l==='{'||l==='$'+'{'){d++;o=true;}if(l==='}')d--;if(o&&d===0)return s.slice(start,start+k.end);if(l==='eof')throw Error('extract eof');}}\n\nclass E{constructor(){this.children=[];this.style={setProperty(){}};this.classList={add(){}};this.dataset={};this.textContent=''}appendChild(x){this.children.push(x);return x}replaceChildren(...x){this.children=x}setAttribute(k,v){this[k]=v}set innerHTML(x){this.markup=x;this.children=[]}get innerHTML(){return this.markup||''}querySelector(){return null}}\nconst descend=e=>[e,...e.children.flatMap(descend)],rows=[],sources=[];\nfor(const file of ['game.html','game-easy-test.html']){\nconst html=fs.readFileSync(file,'utf8'),forge=extract(html,'renderForge'),crystals=html.slice(html.indexOf('const CR_ATK_SLOTS='),html.indexOf('const ITEM_SIZE=')),mal=extract(html,'_malCost');\nconst old='btn.onclick=()=>{if(!ok)return;CRYSTAL_DUST-=dustCost;';\nconst newer='btn.onclick=()=>{const cd=CRYSTAL_DEFS[_crCraftType],s=CRYSTAL_STAR[_crCraftStar],dustCost=CRYSTAL_DUST_COST[_crCraftStar];if(!cd||!Number.isInteger(_crCraftStar)||!s||!Number.isFinite(dustCost)||dustCost<=0||!Number.isFinite(CRYSTAL_DUST)||CRYSTAL_DUST<dustCost||CRYSTAL_BAG.length>=CRYSTAL_BAG_MAX)return;CRYSTAL_DUST-=dustCost;';\nconst candidate=forge.replace(old,newer);assert.notEqual(candidate,forge);sources.push({file,wholeSHA:sha(html),forgeSHA:sha(forge),candidateSHA:sha(candidate),patch:{old,newer}});\nfor(const scenario of ['current-type']){\nfor(const policy of ['current','candidate']){\nconst nodes=new Map(),trace=[],bag=[];\nconst c=vm.createContext({document:{createElement:()=>new E()},$:id=>{if(!nodes.has(id))nodes.set(id,new E());return nodes.get(id)},G:{mats:0,forgeTab:'crystal'},P:{x:0,y:0},OPT:{lang:'ko'},_T:x=>x,_L:x=>x,_glyph:()=>'',_MALICE_COST_MUL:.5,_ensureForgeAtlasLoad(){},BGM:{play(){}},SFX:{forge:()=>trace.push(['sound'])},addTxt:(...a)=>trace.push(['text',...a]),dbSaveNow:()=>trace.push(['save']),notify:x=>trace.push(['notify',x]),INV:{equipped:{},bag:[]},SLOT_NAMES:[],_forgeSel:null,_salSel:new Set(),_rerollSel:null,bag,Math:Object.assign(Object.create(Math),{random:()=>{throw Error('unexpected RNG')}})});\nvm.runInContext(mal+'\\n'+crystals+'\\n'+(policy==='current'?forge:candidate)+'\\nCRYSTAL_BAG=bag;_crForgeTab=\"decomp\";',c);\n\nconst run=x=>vm.runInContext(x,c),id=run('Object.keys(CRYSTAL_DEFS)[0]');\nif(scenario==='last-capacity')bag.push(...Array.from({length:9998},()=>({id,star:0,enh:0})));\nrun('CRYSTAL_DUST=50;renderForge()');\nconst typeButton=descend(nodes.get('fgGrid')).find(e=>e.onclick&&String(e.onclick).includes('_crCraftType=id'));assert(typeButton);typeButton.onclick();\nconst button=descend(nodes.get('fgGrid')).find(e=>e.onclick&&String(e.onclick).includes('CRYSTAL_DUST-=dustCost'));assert(button);\nif(scenario==='current-type'){const choices=descend(nodes.get('fgGrid')).filter(e=>e.onclick&&String(e.onclick).includes('_crCraftType=id'));assert(choices.length>1);choices[1].onclick();}\nif(scenario==='current-insufficient')run('CRYSTAL_DUST=25');\nif(scenario==='last-capacity')run('CRYSTAL_DUST=100');\nbutton.onclick();if(['repeat-exact','last-capacity'].includes(scenario))button.onclick();\nconst out={mats:c.G.mats,dust:run('CRYSTAL_DUST'),bagCount:bag.length,last:bag.length?JSON.parse(JSON.stringify(bag.at(-1))):null,saveCalls:trace.filter(x=>x[0]==='save').length,trace};\nassert.equal(out.mats,0);\nconst expectedDust=scenario==='repeat-exact'&&policy==='current'?-50:scenario==='current-star'?(policy==='current'?150:0):scenario==='current-insufficient'?(policy==='current'?-25:25):scenario==='last-capacity'?(policy==='current'?0:50):0;\nassert.equal(out.dust,expectedDust);\nif(scenario==='last-capacity')assert.equal(out.bagCount,policy==='current'?10000:9999);\nelse assert.equal(out.bagCount,scenario==='repeat-exact'&&policy==='current'?2:scenario==='current-insufficient'&&policy==='candidate'?0:1);\nassert.equal(out.last.id,run('_crCraftType'));assert.notEqual(out.last.id,id);assert.equal(out.last.star,0);\nrows.push({file,scenario,policy,out});\n}\n}\n\n}\nconst query='CRYSTAL_DUST|CRYSTAL_DUST_COST|CRYSTAL_BAG_MAX|가루.*제작|제작.*가루';const d=spawnSync('rg',['-n',query,'docs'],{encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(d.status,0);\nconsole.log(JSON.stringify({completionId:'BALANCE-crystal-dust-current-type-supplement',sourceRuns:rows.length,sources,rows,docs:{query,matches:d.stdout.trim().split('\\n').length,sha:sha(d.stdout)},limits:['Full actual renderForge decomp tab→type button→dust craft button; current-star test also actual star selector→old callback','Current dust change/cap-last/repeat callback injected; native old callback rapid-input reachability UNKNOWN','Existing recipes50/200/500/1500/5000 unchanged; cap9999 unchanged','DOM/audio/save stubbed; no native game visual persistence PASS','No production shared docs Git files edits'],newFiles:0},null,2));\n",
      "receipt": {
        "chunk_id": "87859c",
        "wall_time_seconds": 0.000005292,
        "exit_code": 0,
        "original_token_count": 1169,
        "output": "{\n  \"completionId\": \"BALANCE-crystal-dust-current-type-supplement\",\n  \"sourceRuns\": 4,\n  \"sources\": [\n    {\n      \"file\": \"game.html\",\n      \"wholeSHA\": \"ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613\",\n      \"forgeSHA\": \"6407a724ea6d9f1d9ba3f36dfc12d5b7f8a712ff2ada17320b7fac8f6066c2eb\",\n      \"candidateSHA\": \"3a5507957a46f748719dab1150843bf616bb070dd7d8f1db3cb5778cedba8832\",\n      \"patch\": {\n        \"old\": \"btn.onclick=()=>{if(!ok)return;CRYSTAL_DUST-=dustCost;\",\n        \"newer\": \"btn.onclick=()=>{const cd=CRYSTAL_DEFS[_crCraftType],s=CRYSTAL_STAR[_crCraftStar],dustCost=CRYSTAL_DUST_COST[_crCraftStar];if(!cd||!Number.isInteger(_crCraftStar)||!s||!Number.isFinite(dustCost)||dustCost<=0||!Number.isFinite(CRYSTAL_DUST)||CRYSTAL_DUST<dustCost||CRYSTAL_BAG.length>=CRYSTAL_BAG_MAX)return;CRYSTAL_DUST-=dustCost;\"\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"wholeSHA\": \"8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129\",\n      \"forgeSHA\": \"44c24b9c9130b66b3cce2e50ff923ae06a4d35834fd2c9b01c46797a5ff0dcf1\",\n      \"candidateSHA\": \"6753f4522b1e7edd453b683f4cba500c047babec00106896f2ba8233c2f35952\",\n      \"patch\": {\n        \"old\": \"btn.onclick=()=>{if(!ok)return;CRYSTAL_DUST-=dustCost;\",\n        \"newer\": \"btn.onclick=()=>{const cd=CRYSTAL_DEFS[_crCraftType],s=CRYSTAL_STAR[_crCraftStar],dustCost=CRYSTAL_DUST_COST[_crCraftStar];if(!cd||!Number.isInteger(_crCraftStar)||!s||!Number.isFinite(dustCost)||dustCost<=0||!Number.isFinite(CRYSTAL_DUST)||CRYSTAL_DUST<dustCost||CRYSTAL_BAG.length>=CRYSTAL_BAG_MAX)return;CRYSTAL_DUST-=dustCost;\"\n      }\n    }\n  ],\n  \"rows\": [\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"current-type\",\n      \"policy\": \"current\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 0,\n        \"bagCount\": 1,\n        \"last\": {\n          \"id\": \"cr_hunter_eye\",\n          \"star\": 0,\n          \"enh\": 0\n        },\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"조각 피의 맹세 제작!\",\n            \"#888888\",\n            60\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"current-type\",\n      \"policy\": \"candidate\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 0,\n        \"bagCount\": 1,\n        \"last\": {\n          \"id\": \"cr_hunter_eye\",\n          \"star\": 0,\n          \"enh\": 0\n        },\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"조각 사냥꾼의 눈 제작!\",\n            \"#888888\",\n            60\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"current-type\",\n      \"policy\": \"current\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 0,\n        \"bagCount\": 1,\n        \"last\": {\n          \"id\": \"cr_crit\",\n          \"star\": 0,\n          \"enh\": 0\n        },\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"조각 ATK결정 제작!\",\n            \"#888888\",\n            60\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"current-type\",\n      \"policy\": \"candidate\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 0,\n        \"bagCount\": 1,\n        \"last\": {\n          \"id\": \"cr_crit\",\n          \"star\": 0,\n          \"enh\": 0\n        },\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"조각 크리결정 제작!\",\n            \"#888888\",\n            60\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    }\n  ],\n  \"docs\": {\n    \"query\": \"CRYSTAL_DUST|CRYSTAL_DUST_COST|CRYSTAL_BAG_MAX|가루.*제작|제작.*가루\",\n    \"matches\": 19,\n    \"sha\": \"c8e4d6eb89a9ae384fb51be298aa458f3890b76f34bbe615dc907aa89777622e\"\n  },\n  \"limits\": [\n    \"Full actual renderForge decomp tab→type button→dust craft button; current-star test also actual star selector→old callback\",\n    \"Current dust change/cap-last/repeat callback injected; native old callback rapid-input reachability UNKNOWN\",\n    \"Existing recipes50/200/500/1500/5000 unchanged; cap9999 unchanged\",\n    \"DOM/audio/save stubbed; no native game visual persistence PASS\",\n    \"No production shared docs Git files edits\"\n  ],\n  \"newFiles\": 0\n}\n"
      },
      "correction": "Supplement actual current-kind selector only, 4new source runs. Other scenario limits copied from primary are not claims of repeat runs."
    },
    "rootDocsHandoff": {
      "path": "docs/2_9 결정슬롯시스템/2_9 결정슬롯시스템.md",
      "contract": "가루 제작 콜백 진입 시 현재 _crCraftType/_crCraftStar로 종류/성급/가격/표시를 읽고 유효종류·정수성급·현재 잔액·보유상한9999를 검사 후 차감+생성. 레시피50/200/500/1500/5000 변경0. 부족·가득참이면 생성/음향/저장0. 정상50가루1회 source identical. 이전DOM callback 자연도달UNKNOWN."
    }
  },
  "previousUnpersisted": [
    {
      "key": "balanceSynthCurrentMaterialHandoff",
      "handoff": {
        "completionId": "BALANCE-crystal-synth-current-material-memory",
        "sourceRuns": 20,
        "sources": [
          {
            "file": "game.html",
            "wholeSHA": "ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613",
            "forgeSHA": "6407a724ea6d9f1d9ba3f36dfc12d5b7f8a712ff2ada17320b7fac8f6066c2eb",
            "candidateSHA": "3a187ec75b2d72dc520e286a2f9ef1cf52e501c0026f95a51227bef8953b7447",
            "patch": {
              "old": "const rem=g.idxs.slice(0,3).sort((a,b)=>b-a);",
              "newer": "if(!Number.isInteger(g.star)||g.star<0||g.star>=4||!CRYSTAL_DEFS[g.id])return;const rem=[];for(let i=0;i<CRYSTAL_BAG.length&&rem.length<3;i++){const cr=CRYSTAL_BAG[i];if(cr.id===g.id&&cr.star===g.star)rem.push(i)}if(rem.length<3)return;rem.sort((a,b)=>b-a);"
            }
          },
          {
            "file": "game-easy-test.html",
            "wholeSHA": "8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129",
            "forgeSHA": "44c24b9c9130b66b3cce2e50ff923ae06a4d35834fd2c9b01c46797a5ff0dcf1",
            "candidateSHA": "e89ebec70f46b7f4da6ce1015e2ae4fb5441270aae615b60bd225e2c65183ffe",
            "patch": {
              "old": "const rem=g.idxs.slice(0,3).sort((a,b)=>b-a);",
              "newer": "if(!Number.isInteger(g.star)||g.star<0||g.star>=4||!CRYSTAL_DEFS[g.id])return;const rem=[];for(let i=0;i<CRYSTAL_BAG.length&&rem.length<3;i++){const cr=CRYSTAL_BAG[i];if(cr.id===g.id&&cr.star===g.star)rem.push(i)}if(rem.length<3)return;rem.sort((a,b)=>b-a);"
            }
          }
        ],
        "rows": [
          {
            "file": "game.html",
            "scenario": "normal-one",
            "policy": "current",
            "id": "cr_blood_oath",
            "other": "cr_hunter_eye",
            "out": {
              "mats": 0,
              "bag": [
                {
                  "id": "cr_blood_oath",
                  "star": 1,
                  "enh": 0
                }
              ],
              "hud": "악의: 0",
              "saveCalls": 1,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "파편 피의 맹세 합성!",
                  "#44cc44",
                  60
                ],
                [
                  "stats"
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game.html",
            "scenario": "normal-one",
            "policy": "candidate",
            "id": "cr_blood_oath",
            "other": "cr_hunter_eye",
            "out": {
              "mats": 0,
              "bag": [
                {
                  "id": "cr_blood_oath",
                  "star": 1,
                  "enh": 0
                }
              ],
              "hud": "악의: 0",
              "saveCalls": 1,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "파편 피의 맹세 합성!",
                  "#44cc44",
                  60
                ],
                [
                  "stats"
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game.html",
            "scenario": "repeat-consumed",
            "policy": "current",
            "id": "cr_blood_oath",
            "other": "cr_hunter_eye",
            "out": {
              "mats": 0,
              "bag": [
                {
                  "id": "cr_blood_oath",
                  "star": 1,
                  "enh": 0
                }
              ],
              "hud": "악의: 0",
              "saveCalls": 2,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "파편 피의 맹세 합성!",
                  "#44cc44",
                  60
                ],
                [
                  "stats"
                ],
                [
                  "save"
                ],
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "파편 피의 맹세 합성!",
                  "#44cc44",
                  60
                ],
                [
                  "stats"
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game.html",
            "scenario": "repeat-consumed",
            "policy": "candidate",
            "id": "cr_blood_oath",
            "other": "cr_hunter_eye",
            "out": {
              "mats": 0,
              "bag": [
                {
                  "id": "cr_blood_oath",
                  "star": 1,
                  "enh": 0
                }
              ],
              "hud": "악의: 0",
              "saveCalls": 1,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "파편 피의 맹세 합성!",
                  "#44cc44",
                  60
                ],
                [
                  "stats"
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game.html",
            "scenario": "replaced-kind",
            "policy": "current",
            "id": "cr_blood_oath",
            "other": "cr_hunter_eye",
            "out": {
              "mats": 0,
              "bag": [
                {
                  "id": "cr_blood_oath",
                  "star": 1,
                  "enh": 0
                }
              ],
              "hud": "악의: 0",
              "saveCalls": 1,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "파편 피의 맹세 합성!",
                  "#44cc44",
                  60
                ],
                [
                  "stats"
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game.html",
            "scenario": "replaced-kind",
            "policy": "candidate",
            "id": "cr_blood_oath",
            "other": "cr_hunter_eye",
            "out": {
              "mats": 0,
              "bag": [
                {
                  "id": "cr_blood_oath",
                  "star": 0,
                  "enh": 2
                },
                {
                  "id": "cr_hunter_eye",
                  "star": 0,
                  "enh": 0
                },
                {
                  "id": "cr_blood_oath",
                  "star": 0,
                  "enh": 2
                }
              ],
              "hud": "악의: 0",
              "saveCalls": 0,
              "trace": []
            }
          },
          {
            "file": "game.html",
            "scenario": "changed-to-cap",
            "policy": "current",
            "id": "cr_blood_oath",
            "other": "cr_hunter_eye",
            "out": {
              "mats": 0,
              "bag": [
                {
                  "id": "cr_blood_oath",
                  "star": 1,
                  "enh": 0
                }
              ],
              "hud": "악의: 0",
              "saveCalls": 1,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "파편 피의 맹세 합성!",
                  "#44cc44",
                  60
                ],
                [
                  "stats"
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game.html",
            "scenario": "changed-to-cap",
            "policy": "candidate",
            "id": "cr_blood_oath",
            "other": "cr_hunter_eye",
            "out": {
              "mats": 0,
              "bag": [
                {
                  "id": "cr_blood_oath",
                  "star": 4,
                  "enh": 2
                },
                {
                  "id": "cr_blood_oath",
                  "star": 4,
                  "enh": 2
                },
                {
                  "id": "cr_blood_oath",
                  "star": 4,
                  "enh": 2
                }
              ],
              "hud": "악의: 0",
              "saveCalls": 0,
              "trace": []
            }
          },
          {
            "file": "game.html",
            "scenario": "indices-shifted",
            "policy": "current",
            "id": "cr_blood_oath",
            "other": "cr_hunter_eye",
            "out": {
              "mats": 0,
              "bag": [
                {
                  "id": "cr_blood_oath",
                  "star": 0,
                  "enh": 2
                },
                {
                  "id": "cr_blood_oath",
                  "star": 1,
                  "enh": 0
                }
              ],
              "hud": "악의: 0",
              "saveCalls": 1,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "파편 피의 맹세 합성!",
                  "#44cc44",
                  60
                ],
                [
                  "stats"
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game.html",
            "scenario": "indices-shifted",
            "policy": "candidate",
            "id": "cr_blood_oath",
            "other": "cr_hunter_eye",
            "out": {
              "mats": 0,
              "bag": [
                {
                  "id": "cr_hunter_eye",
                  "star": 0,
                  "enh": 0
                },
                {
                  "id": "cr_blood_oath",
                  "star": 1,
                  "enh": 0
                }
              ],
              "hud": "악의: 0",
              "saveCalls": 1,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "파편 피의 맹세 합성!",
                  "#44cc44",
                  60
                ],
                [
                  "stats"
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game-easy-test.html",
            "scenario": "normal-one",
            "policy": "current",
            "id": "cr_atk",
            "other": "cr_crit",
            "out": {
              "mats": 0,
              "bag": [
                {
                  "id": "cr_atk",
                  "star": 1,
                  "enh": 0
                }
              ],
              "hud": "악의: 0",
              "saveCalls": 1,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "파편 ATK결정 합성!",
                  "#44cc44",
                  60
                ],
                [
                  "stats"
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game-easy-test.html",
            "scenario": "normal-one",
            "policy": "candidate",
            "id": "cr_atk",
            "other": "cr_crit",
            "out": {
              "mats": 0,
              "bag": [
                {
                  "id": "cr_atk",
                  "star": 1,
                  "enh": 0
                }
              ],
              "hud": "악의: 0",
              "saveCalls": 1,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "파편 ATK결정 합성!",
                  "#44cc44",
                  60
                ],
                [
                  "stats"
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game-easy-test.html",
            "scenario": "repeat-consumed",
            "policy": "current",
            "id": "cr_atk",
            "other": "cr_crit",
            "out": {
              "mats": 0,
              "bag": [
                {
                  "id": "cr_atk",
                  "star": 1,
                  "enh": 0
                }
              ],
              "hud": "악의: 0",
              "saveCalls": 2,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "파편 ATK결정 합성!",
                  "#44cc44",
                  60
                ],
                [
                  "stats"
                ],
                [
                  "save"
                ],
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "파편 ATK결정 합성!",
                  "#44cc44",
                  60
                ],
                [
                  "stats"
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game-easy-test.html",
            "scenario": "repeat-consumed",
            "policy": "candidate",
            "id": "cr_atk",
            "other": "cr_crit",
            "out": {
              "mats": 0,
              "bag": [
                {
                  "id": "cr_atk",
                  "star": 1,
                  "enh": 0
                }
              ],
              "hud": "악의: 0",
              "saveCalls": 1,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "파편 ATK결정 합성!",
                  "#44cc44",
                  60
                ],
                [
                  "stats"
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game-easy-test.html",
            "scenario": "replaced-kind",
            "policy": "current",
            "id": "cr_atk",
            "other": "cr_crit",
            "out": {
              "mats": 0,
              "bag": [
                {
                  "id": "cr_atk",
                  "star": 1,
                  "enh": 0
                }
              ],
              "hud": "악의: 0",
              "saveCalls": 1,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "파편 ATK결정 합성!",
                  "#44cc44",
                  60
                ],
                [
                  "stats"
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game-easy-test.html",
            "scenario": "replaced-kind",
            "policy": "candidate",
            "id": "cr_atk",
            "other": "cr_crit",
            "out": {
              "mats": 0,
              "bag": [
                {
                  "id": "cr_atk",
                  "star": 0,
                  "enh": 2
                },
                {
                  "id": "cr_crit",
                  "star": 0,
                  "enh": 0
                },
                {
                  "id": "cr_atk",
                  "star": 0,
                  "enh": 2
                }
              ],
              "hud": "악의: 0",
              "saveCalls": 0,
              "trace": []
            }
          },
          {
            "file": "game-easy-test.html",
            "scenario": "changed-to-cap",
            "policy": "current",
            "id": "cr_atk",
            "other": "cr_crit",
            "out": {
              "mats": 0,
              "bag": [
                {
                  "id": "cr_atk",
                  "star": 1,
                  "enh": 0
                }
              ],
              "hud": "악의: 0",
              "saveCalls": 1,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "파편 ATK결정 합성!",
                  "#44cc44",
                  60
                ],
                [
                  "stats"
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game-easy-test.html",
            "scenario": "changed-to-cap",
            "policy": "candidate",
            "id": "cr_atk",
            "other": "cr_crit",
            "out": {
              "mats": 0,
              "bag": [
                {
                  "id": "cr_atk",
                  "star": 4,
                  "enh": 2
                },
                {
                  "id": "cr_atk",
                  "star": 4,
                  "enh": 2
                },
                {
                  "id": "cr_atk",
                  "star": 4,
                  "enh": 2
                }
              ],
              "hud": "악의: 0",
              "saveCalls": 0,
              "trace": []
            }
          },
          {
            "file": "game-easy-test.html",
            "scenario": "indices-shifted",
            "policy": "current",
            "id": "cr_atk",
            "other": "cr_crit",
            "out": {
              "mats": 0,
              "bag": [
                {
                  "id": "cr_atk",
                  "star": 0,
                  "enh": 2
                },
                {
                  "id": "cr_atk",
                  "star": 1,
                  "enh": 0
                }
              ],
              "hud": "악의: 0",
              "saveCalls": 1,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "파편 ATK결정 합성!",
                  "#44cc44",
                  60
                ],
                [
                  "stats"
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game-easy-test.html",
            "scenario": "indices-shifted",
            "policy": "candidate",
            "id": "cr_atk",
            "other": "cr_crit",
            "out": {
              "mats": 0,
              "bag": [
                {
                  "id": "cr_crit",
                  "star": 0,
                  "enh": 0
                },
                {
                  "id": "cr_atk",
                  "star": 1,
                  "enh": 0
                }
              ],
              "hud": "악의: 0",
              "saveCalls": 1,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "파편 ATK결정 합성!",
                  "#44cc44",
                  60
                ],
                [
                  "stats"
                ],
                [
                  "save"
                ]
              ]
            }
          }
        ],
        "docs": {
          "query": "合成|같은 종류.*성급|합성.*3개|star.*4|결정 합성",
          "matches": 780,
          "sha": "d341efbfa1d1fecbdd3fba0030f1ffc548d9dc45d8647e017d2e46f01cf92f2a"
        },
        "limits": [
          "Full actual renderForge synth branch and actual synth button source executed; no separate confirmation dialog exists",
          "No malice or dust cost in synth source; mats0 preserved; same kind+star3→nextstar1 enh0",
          "Current matching-material semantics retained; same kind+star replacement is eligible, no invented exact-object lock",
          "Fixtures inject bag replacement, star mutation, index shift or detached callback replay; native reachability UNKNOWN",
          "DOM audio stats save stubbed; no native game save or visual PASS",
          "No production shared docs Git new files edits"
        ],
        "productionApplied": false,
        "newFiles": 0,
        "script": "import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {tokenizer,parse} from 'acorn';import {spawnSync} from 'node:child_process';\nconst sha=x=>createHash('sha256').update(x).digest('hex');\nfunction extract(s,n){const start=s.indexOf('function '+n+'(');assert(start>=0,n);return balanced(s,start);}\nfunction balanced(s,start){const t=tokenizer(s.slice(start),{ecmaVersion:'latest'});let d=0,o=false;for(;;){const k=t.getToken(),l=k.type.label;if(l==='{'||l==='$'+'{'){d++;o=true;}if(l==='}')d--;if(o&&d===0)return s.slice(start,start+k.end);if(l==='eof')throw Error('extract eof');}}\n\nclass E{constructor(){this.children=[];this.style={setProperty(){}};this.classList={add(){}};this.dataset={};this.textContent=''}appendChild(x){this.children.push(x);return x}replaceChildren(...x){this.children=x}setAttribute(k,v){this[k]=v}set innerHTML(x){this.markup=x;this.children=[]}get innerHTML(){return this.markup||''}querySelector(){return null}}\nconst descend=e=>[e,...e.children.flatMap(descend)],rows=[],sources=[];\nfor(const file of ['game.html','game-easy-test.html']){\n const s=fs.readFileSync(file,'utf8'),forge=extract(s,'renderForge'),crystals=s.slice(s.indexOf('const CR_ATK_SLOTS='),s.indexOf('const ITEM_SIZE=')),mal=extract(s,'_malCost');\n const old=\"const rem=g.idxs.slice(0,3).sort((a,b)=>b-a);\";\n const newer=\"if(!Number.isInteger(g.star)||g.star<0||g.star>=4||!CRYSTAL_DEFS[g.id])return;const rem=[];for(let i=0;i<CRYSTAL_BAG.length&&rem.length<3;i++){const cr=CRYSTAL_BAG[i];if(cr.id===g.id&&cr.star===g.star)rem.push(i)}if(rem.length<3)return;rem.sort((a,b)=>b-a);\";\n const candidate=forge.replace(old,newer);assert.notEqual(candidate,forge);\n sources.push({file,wholeSHA:sha(s),forgeSHA:sha(forge),candidateSHA:sha(candidate),patch:{old,newer}});\n for(const scenario of ['normal-one','repeat-consumed','replaced-kind','changed-to-cap','indices-shifted']){\n for(const policy of ['current','candidate']){\n const nodes=new Map(),trace=[],bag=[];\n const c=vm.createContext({document:{createElement:()=>new E()},$:id=>{if(!nodes.has(id))nodes.set(id,new E());return nodes.get(id)},G:{mats:0,forgeTab:'crystal'},OPT:{lang:'ko'},P:{x:0,y:0},_T:x=>x,_L:x=>x,_glyph:()=>'',_MALICE_COST_MUL:.5,_ensureForgeAtlasLoad(){},BGM:{play(){}},SFX:{forge:()=>trace.push(['sound'])},applyStats:()=>trace.push(['stats']),addTxt:(...a)=>trace.push(['text',...a]),dbSaveNow:()=>trace.push(['save']),notify:x=>trace.push(['notify',x]),INV:{equipped:{},bag:[]},SLOT_NAMES:[],_forgeSel:null,_salSel:new Set(),_rerollSel:null,bag,Math:Object.assign(Object.create(Math),{random:()=>{throw Error('unexpected RNG')}})});\n vm.runInContext(mal+'\\n'+crystals+'\\n'+(policy==='current'?forge:candidate)+'\\nCRYSTAL_BAG=bag;_crForgeTab=\"synth\";',c);\n const run=x=>vm.runInContext(x,c),id=run('Object.keys(CRYSTAL_DEFS)[0]'),other=run('Object.keys(CRYSTAL_DEFS)[1]');\n bag.push(...Array.from({length:3},()=>({id,star:0,enh:2})));\n run('renderForge()');const button=descend(nodes.get('fgGrid')).find(e=>e.onclick&&String(e.onclick).includes('const rem='));assert(button);\n if(scenario==='replaced-kind')bag[1]={id:other,star:0,enh:0};\n if(scenario==='changed-to-cap')for(const cr of bag)cr.star=4;\n const outsider={id:other,star:0,enh:0};if(scenario==='indices-shifted')bag.unshift(outsider);\n button.onclick();if(scenario==='repeat-consumed')button.onclick();\n const out={mats:c.G.mats,bag:JSON.parse(JSON.stringify(bag)),hud:nodes.get('forgeMats').textContent,saveCalls:trace.filter(x=>x[0]==='save').length,trace};\n assert.equal(out.mats,0);\n if(scenario==='normal-one'||scenario==='repeat-consumed'){assert.equal(bag.length,1);assert.equal(bag[0].star,1);assert.equal(out.saveCalls,scenario==='repeat-consumed'&&policy==='current'?2:1);}\n else if(scenario==='indices-shifted'){assert.equal(bag.length,2);assert.equal(bag.includes(outsider),policy==='candidate');}\n else if(policy==='candidate'){assert.equal(bag.length,3);assert.equal(out.saveCalls,0);}\n else{assert.equal(bag.length,1);assert.equal(bag[0].id,id);assert.equal(bag[0].star,1);}\n rows.push({file,scenario,policy,id,other,out});\n }\n }\n const normal=rows.filter(x=>x.file===file&&x.scenario==='normal-one');assert.deepEqual(normal[0].out,normal[1].out);\n}\nconst query='合成|같은 종류.*성급|합성.*3개|star.*4|결정 합성';const d=spawnSync('rg',['-n',query,'docs'],{encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(d.status,0);\nconsole.log(JSON.stringify({completionId:'BALANCE-crystal-synth-current-material-memory',sourceRuns:rows.length,sources,rows,docs:{query,matches:d.stdout.trim().split('\\n').length,sha:sha(d.stdout)},limits:['Full actual renderForge synth branch and actual synth button source executed; no separate confirmation dialog exists','No malice or dust cost in synth source; mats0 preserved; same kind+star3→nextstar1 enh0','Current matching-material semantics retained; same kind+star replacement is eligible, no invented exact-object lock','Fixtures inject bag replacement, star mutation, index shift or detached callback replay; native reachability UNKNOWN','DOM audio stats save stubbed; no native game save or visual PASS','No production shared docs Git new files edits'],productionApplied:false,newFiles:0},null,2));\n",
        "receipt": {
          "chunk_id": "2c2111",
          "wall_time_seconds": 0.000006292,
          "exit_code": 0,
          "original_token_count": 4247,
          "output": "{\n  \"completionId\": \"BALANCE-crystal-synth-current-material-memory\",\n  \"sourceRuns\": 20,\n  \"sources\": [\n    {\n      \"file\": \"game.html\",\n      \"wholeSHA\": \"ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613\",\n      \"forgeSHA\": \"6407a724ea6d9f1d9ba3f36dfc12d5b7f8a712ff2ada17320b7fac8f6066c2eb\",\n      \"candidateSHA\": \"3a187ec75b2d72dc520e286a2f9ef1cf52e501c0026f95a51227bef8953b7447\",\n      \"patch\": {\n        \"old\": \"const rem=g.idxs.slice(0,3).sort((a,b)=>b-a);\",\n        \"newer\": \"if(!Number.isInteger(g.star)||g.star<0||g.star>=4||!CRYSTAL_DEFS[g.id])return;const rem=[];for(let i=0;i<CRYSTAL_BAG.length&&rem.length<3;i++){const cr=CRYSTAL_BAG[i];if(cr.id===g.id&&cr.star===g.star)rem.push(i)}if(rem.length<3)return;rem.sort((a,b)=>b-a);\"\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"wholeSHA\": \"8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129\",\n      \"forgeSHA\": \"44c24b9c9130b66b3cce2e50ff923ae06a4d35834fd2c9b01c46797a5ff0dcf1\",\n      \"candidateSHA\": \"e89ebec70f46b7f4da6ce1015e2ae4fb5441270aae615b60bd225e2c65183ffe\",\n      \"patch\": {\n        \"old\": \"const rem=g.idxs.slice(0,3).sort((a,b)=>b-a);\",\n        \"newer\": \"if(!Number.isInteger(g.star)||g.star<0||g.star>=4||!CRYSTAL_DEFS[g.id])return;const rem=[];for(let i=0;i<CRYSTAL_BAG.length&&rem.length<3;i++){const cr=CRYSTAL_BAG[i];if(cr.id===g.id&&cr.star===g.star)rem.push(i)}if(rem.length<3)return;rem.sort((a,b)=>b-a);\"\n      }\n    }\n  ],\n  \"rows\": [\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"normal-one\",\n      \"policy\": \"current\",\n      \"id\": \"cr_blood_oath\",\n      \"other\": \"cr_hunter_eye\",\n      \"out\": {\n        \"mats\": 0,\n        \"bag\": [\n          {\n            \"id\": \"cr_blood_oath\",\n            \"star\": 1,\n            \"enh\": 0\n          }\n        ],\n        \"hud\": \"악의: 0\",\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"파편 피의 맹세 합성!\",\n            \"#44cc44\",\n            60\n          ],\n          [\n            \"stats\"\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"normal-one\",\n      \"policy\": \"candidate\",\n      \"id\": \"cr_blood_oath\",\n      \"other\": \"cr_hunter_eye\",\n      \"out\": {\n        \"mats\": 0,\n        \"bag\": [\n          {\n            \"id\": \"cr_blood_oath\",\n            \"star\": 1,\n            \"enh\": 0\n          }\n        ],\n        \"hud\": \"악의: 0\",\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"파편 피의 맹세 합성!\",\n            \"#44cc44\",\n            60\n          ],\n          [\n            \"stats\"\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"repeat-consumed\",\n      \"policy\": \"current\",\n      \"id\": \"cr_blood_oath\",\n      \"other\": \"cr_hunter_eye\",\n      \"out\": {\n        \"mats\": 0,\n        \"bag\": [\n          {\n            \"id\": \"cr_blood_oath\",\n            \"star\": 1,\n            \"enh\": 0\n          }\n        ],\n        \"hud\": \"악의: 0\",\n        \"saveCalls\": 2,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"파편 피의 맹세 합성!\",\n            \"#44cc44\",\n            60\n          ],\n          [\n            \"stats\"\n          ],\n          [\n            \"save\"\n          ],\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"파편 피의 맹세 합성!\",\n            \"#44cc44\",\n            60\n          ],\n          [\n            \"stats\"\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"repeat-consumed\",\n      \"policy\": \"candidate\",\n      \"id\": \"cr_blood_oath\",\n      \"other\": \"cr_hunter_eye\",\n      \"out\": {\n        \"mats\": 0,\n        \"bag\": [\n          {\n            \"id\": \"cr_blood_oath\",\n            \"star\": 1,\n            \"enh\": 0\n          }\n        ],\n        \"hud\": \"악의: 0\",\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"파편 피의 맹세 합성!\",\n            \"#44cc44\",\n            60\n          ],\n          [\n            \"stats\"\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"replaced-kind\",\n      \"policy\": \"current\",\n      \"id\": \"cr_blood_oath\",\n      \"other\": \"cr_hunter_eye\",\n      \"out\": {\n        \"mats\": 0,\n        \"bag\": [\n          {\n            \"id\": \"cr_blood_oath\",\n            \"star\": 1,\n            \"enh\": 0\n          }\n        ],\n        \"hud\": \"악의: 0\",\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"파편 피의 맹세 합성!\",\n            \"#44cc44\",\n            60\n          ],\n          [\n            \"stats\"\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"replaced-kind\",\n      \"policy\": \"candidate\",\n      \"id\": \"cr_blood_oath\",\n      \"other\": \"cr_hunter_eye\",\n      \"out\": {\n        \"mats\": 0,\n        \"bag\": [\n          {\n            \"id\": \"cr_blood_oath\",\n            \"star\": 0,\n            \"enh\": 2\n          },\n          {\n            \"id\": \"cr_hunter_eye\",\n            \"star\": 0,\n            \"enh\": 0\n          },\n          {\n            \"id\": \"cr_blood_oath\",\n            \"star\": 0,\n            \"enh\": 2\n          }\n        ],\n        \"hud\": \"악의: 0\",\n        \"saveCalls\": 0,\n        \"trace\": []\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"changed-to-cap\",\n      \"policy\": \"current\",\n      \"id\": \"cr_blood_oath\",\n      \"other\": \"cr_hunter_eye\",\n      \"out\": {\n        \"mats\": 0,\n        \"bag\": [\n          {\n            \"id\": \"cr_blood_oath\",\n            \"star\": 1,\n            \"enh\": 0\n          }\n        ],\n        \"hud\": \"악의: 0\",\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"파편 피의 맹세 합성!\",\n            \"#44cc44\",\n            60\n          ],\n          [\n            \"stats\"\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"changed-to-cap\",\n      \"policy\": \"candidate\",\n      \"id\": \"cr_blood_oath\",\n      \"other\": \"cr_hunter_eye\",\n      \"out\": {\n        \"mats\": 0,\n        \"bag\": [\n          {\n            \"id\": \"cr_blood_oath\",\n            \"star\": 4,\n            \"enh\": 2\n          },\n          {\n            \"id\": \"cr_blood_oath\",\n            \"star\": 4,\n            \"enh\": 2\n          },\n          {\n            \"id\": \"cr_blood_oath\",\n            \"star\": 4,\n            \"enh\": 2\n          }\n        ],\n        \"hud\": \"악의: 0\",\n        \"saveCalls\": 0,\n        \"trace\": []\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"indices-shifted\",\n      \"policy\": \"current\",\n      \"id\": \"cr_blood_oath\",\n      \"other\": \"cr_hunter_eye\",\n      \"out\": {\n        \"mats\": 0,\n        \"bag\": [\n          {\n            \"id\": \"cr_blood_oath\",\n            \"star\": 0,\n            \"enh\": 2\n          },\n          {\n            \"id\": \"cr_blood_oath\",\n            \"star\": 1,\n            \"enh\": 0\n          }\n        ],\n        \"hud\": \"악의: 0\",\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"파편 피의 맹세 합성!\",\n            \"#44cc44\",\n            60\n          ],\n          [\n            \"stats\"\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"indices-shifted\",\n      \"policy\": \"candidate\",\n      \"id\": \"cr_blood_oath\",\n      \"other\": \"cr_hunter_eye\",\n      \"out\": {\n        \"mats\": 0,\n        \"bag\": [\n          {\n            \"id\": \"cr_hunter_eye\",\n            \"star\": 0,\n            \"enh\": 0\n          },\n          {\n            \"id\": \"cr_blood_oath\",\n            \"star\": 1,\n            \"enh\": 0\n          }\n        ],\n        \"hud\": \"악의: 0\",\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"파편 피의 맹세 합성!\",\n            \"#44cc44\",\n            60\n          ],\n          [\n            \"stats\"\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"normal-one\",\n      \"policy\": \"current\",\n      \"id\": \"cr_atk\",\n      \"other\": \"cr_crit\",\n      \"out\": {\n        \"mats\": 0,\n        \"bag\": [\n          {\n            \"id\": \"cr_atk\",\n            \"star\": 1,\n            \"enh\": 0\n          }\n        ],\n        \"hud\": \"악의: 0\",\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"파편 ATK결정 합성!\",\n            \"#44cc44\",\n            60\n          ],\n          [\n            \"stats\"\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"normal-one\",\n      \"policy\": \"candidate\",\n      \"id\": \"cr_atk\",\n      \"other\": \"cr_crit\",\n      \"out\": {\n        \"mats\": 0,\n        \"bag\": [\n          {\n            \"id\": \"cr_atk\",\n            \"star\": 1,\n            \"enh\": 0\n          }\n        ],\n        \"hud\": \"악의: 0\",\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"파편 ATK결정 합성!\",\n            \"#44cc44\",\n            60\n          ],\n          [\n            \"stats\"\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"repeat-consumed\",\n      \"policy\": \"current\",\n      \"id\": \"cr_atk\",\n      \"other\": \"cr_crit\",\n      \"out\": {\n        \"mats\": 0,\n        \"bag\": [\n          {\n            \"id\": \"cr_atk\",\n            \"star\": 1,\n            \"enh\": 0\n          }\n        ],\n        \"hud\": \"악의: 0\",\n        \"saveCalls\": 2,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"파편 ATK결정 합성!\",\n            \"#44cc44\",\n            60\n          ],\n          [\n            \"stats\"\n          ],\n          [\n            \"save\"\n          ],\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"파편 ATK결정 합성!\",\n            \"#44cc44\",\n            60\n          ],\n          [\n            \"stats\"\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"repeat-consumed\",\n      \"policy\": \"candidate\",\n      \"id\": \"cr_atk\",\n      \"other\": \"cr_crit\",\n      \"out\": {\n        \"mats\": 0,\n        \"bag\": [\n          {\n            \"id\": \"cr_atk\",\n            \"star\": 1,\n            \"enh\": 0\n          }\n        ],\n        \"hud\": \"악의: 0\",\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"파편 ATK결정 합성!\",\n            \"#44cc44\",\n            60\n          ],\n          [\n            \"stats\"\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"replaced-kind\",\n      \"policy\": \"current\",\n      \"id\": \"cr_atk\",\n      \"other\": \"cr_crit\",\n      \"out\": {\n        \"mats\": 0,\n        \"bag\": [\n          {\n            \"id\": \"cr_atk\",\n            \"star\": 1,\n            \"enh\": 0\n          }\n        ],\n        \"hud\": \"악의: 0\",\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"파편 ATK결정 합성!\",\n            \"#44cc44\",\n            60\n          ],\n          [\n            \"stats\"\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"replaced-kind\",\n      \"policy\": \"candidate\",\n      \"id\": \"cr_atk\",\n      \"other\": \"cr_crit\",\n      \"out\": {\n        \"mats\": 0,\n        \"bag\": [\n          {\n            \"id\": \"cr_atk\",\n            \"star\": 0,\n            \"enh\": 2\n          },\n          {\n            \"id\": \"cr_crit\",\n            \"star\": 0,\n            \"enh\": 0\n          },\n          {\n            \"id\": \"cr_atk\",\n            \"star\": 0,\n            \"enh\": 2\n          }\n        ],\n        \"hud\": \"악의: 0\",\n        \"saveCalls\": 0,\n        \"trace\": []\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"changed-to-cap\",\n      \"policy\": \"current\",\n      \"id\": \"cr_atk\",\n      \"other\": \"cr_crit\",\n      \"out\": {\n        \"mats\": 0,\n        \"bag\": [\n          {\n            \"id\": \"cr_atk\",\n            \"star\": 1,\n            \"enh\": 0\n          }\n        ],\n        \"hud\": \"악의: 0\",\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"파편 ATK결정 합성!\",\n            \"#44cc44\",\n            60\n          ],\n          [\n            \"stats\"\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"changed-to-cap\",\n      \"policy\": \"candidate\",\n      \"id\": \"cr_atk\",\n      \"other\": \"cr_crit\",\n      \"out\": {\n        \"mats\": 0,\n        \"bag\": [\n          {\n            \"id\": \"cr_atk\",\n            \"star\": 4,\n            \"enh\": 2\n          },\n          {\n            \"id\": \"cr_atk\",\n            \"star\": 4,\n            \"enh\": 2\n          },\n          {\n            \"id\": \"cr_atk\",\n            \"star\": 4,\n            \"enh\": 2\n          }\n        ],\n        \"hud\": \"악의: 0\",\n        \"saveCalls\": 0,\n        \"trace\": []\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"indices-shifted\",\n      \"policy\": \"current\",\n      \"id\": \"cr_atk\",\n      \"other\": \"cr_crit\",\n      \"out\": {\n        \"mats\": 0,\n        \"bag\": [\n          {\n            \"id\": \"cr_atk\",\n            \"star\": 0,\n            \"enh\": 2\n          },\n          {\n            \"id\": \"cr_atk\",\n            \"star\": 1,\n            \"enh\": 0\n          }\n        ],\n        \"hud\": \"악의: 0\",\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"파편 ATK결정 합성!\",\n            \"#44cc44\",\n            60\n          ],\n          [\n            \"stats\"\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"indices-shifted\",\n      \"policy\": \"candidate\",\n      \"id\": \"cr_atk\",\n      \"other\": \"cr_crit\",\n      \"out\": {\n        \"mats\": 0,\n        \"bag\": [\n          {\n            \"id\": \"cr_crit\",\n            \"star\": 0,\n            \"enh\": 0\n          },\n          {\n            \"id\": \"cr_atk\",\n            \"star\": 1,\n            \"enh\": 0\n          }\n        ],\n        \"hud\": \"악의: 0\",\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"파편 ATK결정 합성!\",\n            \"#44cc44\",\n            60\n          ],\n          [\n            \"stats\"\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    }\n  ],\n  \"docs\": {\n    \"query\": \"合成|같은 종류.*성급|합성.*3개|star.*4|결정 합성\",\n    \"matches\": 780,\n    \"sha\": \"d341efbfa1d1fecbdd3fba0030f1ffc548d9dc45d8647e017d2e46f01cf92f2a\"\n  },\n  \"limits\": [\n    \"Full actual renderForge synth branch and actual synth button source executed; no separate confirmation dialog exists\",\n    \"No malice or dust cost in synth source; mats0 preserved; same kind+star3→nextstar1 enh0\",\n    \"Current matching-material semantics retained; same kind+star replacement is eligible, no invented exact-object lock\",\n    \"Fixtures inject bag replacement, star mutation, index shift or detached callback replay; native reachability UNKNOWN\",\n    \"DOM audio stats save stubbed; no native game save or visual PASS\",\n    \"No production shared docs Git new files edits\"\n  ],\n  \"productionApplied\": false,\n  \"newFiles\": 0\n}\n"
        },
        "failure": {
          "chunk_id": "14a7b3",
          "wall_time_seconds": 0.000007,
          "exit_code": 1,
          "original_token_count": 189,
          "output": "node:internal/modules/run_main:107\n    triggerUncaughtException(\n    ^\n\nAssertionError [ERR_ASSERTION]: Expected values to be strictly equal:\n\n3 !== 1\n\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:28:67\n    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)\n    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)\n    at async node:internal/modules/esm/loader:246:26\n    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:243:20)\n    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5) {\n  generatedMessage: true,\n  code: 'ERR_ASSERTION',\n  actual: 3,\n  expected: 1,\n  operator: 'strictEqual',\n  diff: 'simple'\n}\n\nNode.js v24.15.0\n"
        },
        "rootDocsHandoff": {
          "path": "docs/2_9 결정슬롯시스템/2_9 결정슬롯시스템.md",
          "contract": "개별 합성 시 현재 CRYSTAL_BAG에서 같은 id+star 재료3개를 재탐색. star 정수0..3만 합성; 부족/유효종류없음은 생성·삭제·음향·스탯·저장0. 악의/가루 비용0, 결과star+1/enh0 불변. 동일종류·성급 대체물 허용 기존의 그룹 계약 유지. Native stale callback reachability UNKNOWN."
        }
      }
    },
    {
      "key": "balanceDecompIdentityHandoff",
      "handoff": {
        "completionId": "BALANCE-crystal-decomp-identity-refund-memory",
        "sourceRuns": 16,
        "sources": [
          {
            "file": "game.html",
            "wholeSHA": "ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613",
            "forgeSHA": "6407a724ea6d9f1d9ba3f36dfc12d5b7f8a712ff2ada17320b7fac8f6066c2eb",
            "candidateSHA": "362bd14174311cc1c5f73cc1a783b0d4c3360afb8b6751347de5ba50b4cfa6eb",
            "patch": {
              "old": "row.onclick=()=>{CRYSTAL_BAG.splice(i,1);CRYSTAL_DUST+=dustGet;",
              "newer": "row.onclick=()=>{const _idx=CRYSTAL_BAG.indexOf(cr);if(_idx<0||!Number.isInteger(cr.star)||cr.star<0||cr.star>=CRYSTAL_DUST_COST.length)return;const dustGet=~~(CRYSTAL_DUST_COST[cr.star]*0.5);CRYSTAL_BAG.splice(_idx,1);CRYSTAL_DUST+=dustGet;"
            }
          },
          {
            "file": "game-easy-test.html",
            "wholeSHA": "8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129",
            "forgeSHA": "44c24b9c9130b66b3cce2e50ff923ae06a4d35834fd2c9b01c46797a5ff0dcf1",
            "candidateSHA": "e3c1560d8978c91a5da722568fe5d57db2556cead4ddf2a54b01f69a8b066db3",
            "patch": {
              "old": "row.onclick=()=>{CRYSTAL_BAG.splice(i,1);CRYSTAL_DUST+=dustGet;",
              "newer": "row.onclick=()=>{const _idx=CRYSTAL_BAG.indexOf(cr);if(_idx<0||!Number.isInteger(cr.star)||cr.star<0||cr.star>=CRYSTAL_DUST_COST.length)return;const dustGet=~~(CRYSTAL_DUST_COST[cr.star]*0.5);CRYSTAL_BAG.splice(_idx,1);CRYSTAL_DUST+=dustGet;"
            }
          }
        ],
        "rows": [
          {
            "file": "game.html",
            "scenario": "normal-one",
            "policy": "current",
            "out": {
              "mats": 0,
              "dust": 25,
              "bag": [],
              "saveCalls": 1,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "분해! 가루 +25",
                  "#ff8844",
                  50
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game.html",
            "scenario": "normal-one",
            "policy": "candidate",
            "out": {
              "mats": 0,
              "dust": 25,
              "bag": [],
              "saveCalls": 1,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "분해! 가루 +25",
                  "#ff8844",
                  50
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game.html",
            "scenario": "repeat-consumed",
            "policy": "current",
            "out": {
              "mats": 0,
              "dust": 50,
              "bag": [],
              "saveCalls": 2,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "분해! 가루 +25",
                  "#ff8844",
                  50
                ],
                [
                  "save"
                ],
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "분해! 가루 +25",
                  "#ff8844",
                  50
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game.html",
            "scenario": "repeat-consumed",
            "policy": "candidate",
            "out": {
              "mats": 0,
              "dust": 25,
              "bag": [],
              "saveCalls": 1,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "분해! 가루 +25",
                  "#ff8844",
                  50
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game.html",
            "scenario": "indices-shifted",
            "policy": "current",
            "out": {
              "mats": 0,
              "dust": 25,
              "bag": [
                {
                  "id": "cr_blood_oath",
                  "star": 0,
                  "enh": 2
                }
              ],
              "saveCalls": 1,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "분해! 가루 +25",
                  "#ff8844",
                  50
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game.html",
            "scenario": "indices-shifted",
            "policy": "candidate",
            "out": {
              "mats": 0,
              "dust": 25,
              "bag": [
                {
                  "id": "cr_hunter_eye",
                  "star": 0,
                  "enh": 0
                }
              ],
              "saveCalls": 1,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "분해! 가루 +25",
                  "#ff8844",
                  50
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game.html",
            "scenario": "changed-star",
            "policy": "current",
            "out": {
              "mats": 0,
              "dust": 25,
              "bag": [],
              "saveCalls": 1,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "분해! 가루 +25",
                  "#ff8844",
                  50
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game.html",
            "scenario": "changed-star",
            "policy": "candidate",
            "out": {
              "mats": 0,
              "dust": 100,
              "bag": [],
              "saveCalls": 1,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "분해! 가루 +100",
                  "#ff8844",
                  50
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game-easy-test.html",
            "scenario": "normal-one",
            "policy": "current",
            "out": {
              "mats": 0,
              "dust": 25,
              "bag": [],
              "saveCalls": 1,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "분해! 가루 +25",
                  "#ff8844",
                  50
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game-easy-test.html",
            "scenario": "normal-one",
            "policy": "candidate",
            "out": {
              "mats": 0,
              "dust": 25,
              "bag": [],
              "saveCalls": 1,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "분해! 가루 +25",
                  "#ff8844",
                  50
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game-easy-test.html",
            "scenario": "repeat-consumed",
            "policy": "current",
            "out": {
              "mats": 0,
              "dust": 50,
              "bag": [],
              "saveCalls": 2,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "분해! 가루 +25",
                  "#ff8844",
                  50
                ],
                [
                  "save"
                ],
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "분해! 가루 +25",
                  "#ff8844",
                  50
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game-easy-test.html",
            "scenario": "repeat-consumed",
            "policy": "candidate",
            "out": {
              "mats": 0,
              "dust": 25,
              "bag": [],
              "saveCalls": 1,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "분해! 가루 +25",
                  "#ff8844",
                  50
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game-easy-test.html",
            "scenario": "indices-shifted",
            "policy": "current",
            "out": {
              "mats": 0,
              "dust": 25,
              "bag": [
                {
                  "id": "cr_atk",
                  "star": 0,
                  "enh": 2
                }
              ],
              "saveCalls": 1,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "분해! 가루 +25",
                  "#ff8844",
                  50
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game-easy-test.html",
            "scenario": "indices-shifted",
            "policy": "candidate",
            "out": {
              "mats": 0,
              "dust": 25,
              "bag": [
                {
                  "id": "cr_crit",
                  "star": 0,
                  "enh": 0
                }
              ],
              "saveCalls": 1,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "분해! 가루 +25",
                  "#ff8844",
                  50
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game-easy-test.html",
            "scenario": "changed-star",
            "policy": "current",
            "out": {
              "mats": 0,
              "dust": 25,
              "bag": [],
              "saveCalls": 1,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "분해! 가루 +25",
                  "#ff8844",
                  50
                ],
                [
                  "save"
                ]
              ]
            }
          },
          {
            "file": "game-easy-test.html",
            "scenario": "changed-star",
            "policy": "candidate",
            "out": {
              "mats": 0,
              "dust": 100,
              "bag": [],
              "saveCalls": 1,
              "trace": [
                [
                  "sound"
                ],
                [
                  "text",
                  0,
                  -20,
                  "분해! 가루 +100",
                  "#ff8844",
                  50
                ],
                [
                  "save"
                ]
              ]
            }
          }
        ],
        "docs": {
          "query": "CRYSTAL_DUST|CRYSTAL_DUST_COST|1개 분해|결정 분해|분해 환급",
          "matches": 18,
          "sha": "38a2135df618d10b177b9670a3c69c93ab6cf9bac2cc8b5d13dd373bf764231d"
        },
        "limits": [
          "Actual full renderForge decomp row callback executed; DOM audio save stubbed",
          "Bag index shift/star mutation/detached callback replay injected; native rapid-input reachability UNKNOWN",
          "Current single selected object identity preserved; refund formula50% unchanged recalculated for current star",
          "No malice charge; mats0 unchanged",
          "No production shared docs Git files edits"
        ],
        "newFiles": 0,
        "script": "import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {tokenizer,parse} from 'acorn';import {spawnSync} from 'node:child_process';\nconst sha=x=>createHash('sha256').update(x).digest('hex');\nfunction extract(s,n){const start=s.indexOf('function '+n+'(');assert(start>=0,n);return balanced(s,start);}\nfunction balanced(s,start){const t=tokenizer(s.slice(start),{ecmaVersion:'latest'});let d=0,o=false;for(;;){const k=t.getToken(),l=k.type.label;if(l==='{'||l==='$'+'{'){d++;o=true;}if(l==='}')d--;if(o&&d===0)return s.slice(start,start+k.end);if(l==='eof')throw Error('extract eof');}}\n\nclass E{constructor(){this.children=[];this.style={setProperty(){}};this.classList={add(){}};this.dataset={};this.textContent=''}appendChild(x){this.children.push(x);return x}replaceChildren(...x){this.children=x}setAttribute(k,v){this[k]=v}set innerHTML(x){this.markup=x;this.children=[]}get innerHTML(){return this.markup||''}querySelector(){return null}}\nconst descend=e=>[e,...e.children.flatMap(descend)],rows=[],sources=[];\nfor(const file of ['game.html','game-easy-test.html']){\nconst html=fs.readFileSync(file,'utf8'),forge=extract(html,'renderForge'),crystals=html.slice(html.indexOf('const CR_ATK_SLOTS='),html.indexOf('const ITEM_SIZE=')),mal=extract(html,'_malCost');\nconst old='row.onclick=()=>{CRYSTAL_BAG.splice(i,1);CRYSTAL_DUST+=dustGet;';\nconst newer='row.onclick=()=>{const _idx=CRYSTAL_BAG.indexOf(cr);if(_idx<0||!Number.isInteger(cr.star)||cr.star<0||cr.star>=CRYSTAL_DUST_COST.length)return;const dustGet=~~(CRYSTAL_DUST_COST[cr.star]*0.5);CRYSTAL_BAG.splice(_idx,1);CRYSTAL_DUST+=dustGet;';\nconst candidate=forge.replace(old,newer);assert.notEqual(candidate,forge);sources.push({file,wholeSHA:sha(html),forgeSHA:sha(forge),candidateSHA:sha(candidate),patch:{old,newer}});\nfor(const scenario of ['normal-one','repeat-consumed','indices-shifted','changed-star']){\nfor(const policy of ['current','candidate']){\nconst nodes=new Map(),trace=[],bag=[];\nconst c=vm.createContext({document:{createElement:()=>new E()},$:id=>{if(!nodes.has(id))nodes.set(id,new E());return nodes.get(id)},G:{mats:0,forgeTab:'crystal'},P:{x:0,y:0},OPT:{lang:'ko'},_T:x=>x,_L:x=>x,_glyph:()=>'',_MALICE_COST_MUL:.5,_ensureForgeAtlasLoad(){},BGM:{play(){}},SFX:{forge:()=>trace.push(['sound'])},addTxt:(...a)=>trace.push(['text',...a]),dbSaveNow:()=>trace.push(['save']),notify:x=>trace.push(['notify',x]),INV:{equipped:{},bag:[]},SLOT_NAMES:[],_forgeSel:null,_salSel:new Set(),_rerollSel:null,bag,Math:Object.assign(Object.create(Math),{random:()=>{throw Error('unexpected RNG')}})});\nvm.runInContext(mal+'\\n'+crystals+'\\n'+(policy==='current'?forge:candidate)+'\\nCRYSTAL_BAG=bag;_crForgeTab=\"decomp\";',c);\nconst run=x=>vm.runInContext(x,c),id=run('Object.keys(CRYSTAL_DEFS)[0]'),other=run('Object.keys(CRYSTAL_DEFS)[1]'),target={id,star:0,enh:2},outsider={id:other,star:0,enh:0};bag.push(target);run('renderForge()');\nconst button=descend(nodes.get('fgGrid')).find(e=>e.onclick&&String(e.onclick).includes('CRYSTAL_DUST+=dustGet'));assert(button);\nif(scenario==='indices-shifted')bag.unshift(outsider);if(scenario==='changed-star')target.star=1;\nbutton.onclick();if(scenario==='repeat-consumed')button.onclick();\nconst out={mats:c.G.mats,dust:run('CRYSTAL_DUST'),bag:JSON.parse(JSON.stringify(bag)),saveCalls:trace.filter(x=>x[0]==='save').length,trace};\nassert.equal(out.mats,0);assert.equal(out.dust,scenario==='repeat-consumed'&&policy==='current'?50:scenario==='changed-star'&&policy==='candidate'?100:25);\nassert.equal(bag.includes(outsider),scenario==='indices-shifted'&&policy==='candidate');\nassert.equal(bag.includes(target),scenario==='indices-shifted'&&policy==='current');\nrows.push({file,scenario,policy,out});\n}\n}\nconst n=rows.filter(x=>x.file===file&&x.scenario==='normal-one');assert.deepEqual(n[0].out,n[1].out);\n}\nconst query='CRYSTAL_DUST|CRYSTAL_DUST_COST|1개 분해|결정 분해|분해 환급';const d=spawnSync('rg',['-n',query,'docs'],{encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(d.status,0);\nconsole.log(JSON.stringify({completionId:'BALANCE-crystal-decomp-identity-refund-memory',sourceRuns:rows.length,sources,rows,docs:{query,matches:d.stdout.trim().split('\\n').length,sha:sha(d.stdout)},limits:['Actual full renderForge decomp row callback executed; DOM audio save stubbed','Bag index shift/star mutation/detached callback replay injected; native rapid-input reachability UNKNOWN','Current single selected object identity preserved; refund formula50% unchanged recalculated for current star','No malice charge; mats0 unchanged','No production shared docs Git files edits'],newFiles:0},null,2));\n",
        "receipt": {
          "chunk_id": "c29b4e",
          "wall_time_seconds": 0.000006834,
          "exit_code": 0,
          "original_token_count": 2673,
          "output": "{\n  \"completionId\": \"BALANCE-crystal-decomp-identity-refund-memory\",\n  \"sourceRuns\": 16,\n  \"sources\": [\n    {\n      \"file\": \"game.html\",\n      \"wholeSHA\": \"ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613\",\n      \"forgeSHA\": \"6407a724ea6d9f1d9ba3f36dfc12d5b7f8a712ff2ada17320b7fac8f6066c2eb\",\n      \"candidateSHA\": \"362bd14174311cc1c5f73cc1a783b0d4c3360afb8b6751347de5ba50b4cfa6eb\",\n      \"patch\": {\n        \"old\": \"row.onclick=()=>{CRYSTAL_BAG.splice(i,1);CRYSTAL_DUST+=dustGet;\",\n        \"newer\": \"row.onclick=()=>{const _idx=CRYSTAL_BAG.indexOf(cr);if(_idx<0||!Number.isInteger(cr.star)||cr.star<0||cr.star>=CRYSTAL_DUST_COST.length)return;const dustGet=~~(CRYSTAL_DUST_COST[cr.star]*0.5);CRYSTAL_BAG.splice(_idx,1);CRYSTAL_DUST+=dustGet;\"\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"wholeSHA\": \"8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129\",\n      \"forgeSHA\": \"44c24b9c9130b66b3cce2e50ff923ae06a4d35834fd2c9b01c46797a5ff0dcf1\",\n      \"candidateSHA\": \"e3c1560d8978c91a5da722568fe5d57db2556cead4ddf2a54b01f69a8b066db3\",\n      \"patch\": {\n        \"old\": \"row.onclick=()=>{CRYSTAL_BAG.splice(i,1);CRYSTAL_DUST+=dustGet;\",\n        \"newer\": \"row.onclick=()=>{const _idx=CRYSTAL_BAG.indexOf(cr);if(_idx<0||!Number.isInteger(cr.star)||cr.star<0||cr.star>=CRYSTAL_DUST_COST.length)return;const dustGet=~~(CRYSTAL_DUST_COST[cr.star]*0.5);CRYSTAL_BAG.splice(_idx,1);CRYSTAL_DUST+=dustGet;\"\n      }\n    }\n  ],\n  \"rows\": [\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"normal-one\",\n      \"policy\": \"current\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 25,\n        \"bag\": [],\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"분해! 가루 +25\",\n            \"#ff8844\",\n            50\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"normal-one\",\n      \"policy\": \"candidate\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 25,\n        \"bag\": [],\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"분해! 가루 +25\",\n            \"#ff8844\",\n            50\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"repeat-consumed\",\n      \"policy\": \"current\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 50,\n        \"bag\": [],\n        \"saveCalls\": 2,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"분해! 가루 +25\",\n            \"#ff8844\",\n            50\n          ],\n          [\n            \"save\"\n          ],\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"분해! 가루 +25\",\n            \"#ff8844\",\n            50\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"repeat-consumed\",\n      \"policy\": \"candidate\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 25,\n        \"bag\": [],\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"분해! 가루 +25\",\n            \"#ff8844\",\n            50\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"indices-shifted\",\n      \"policy\": \"current\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 25,\n        \"bag\": [\n          {\n            \"id\": \"cr_blood_oath\",\n            \"star\": 0,\n            \"enh\": 2\n          }\n        ],\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"분해! 가루 +25\",\n            \"#ff8844\",\n            50\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"indices-shifted\",\n      \"policy\": \"candidate\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 25,\n        \"bag\": [\n          {\n            \"id\": \"cr_hunter_eye\",\n            \"star\": 0,\n            \"enh\": 0\n          }\n        ],\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"분해! 가루 +25\",\n            \"#ff8844\",\n            50\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"changed-star\",\n      \"policy\": \"current\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 25,\n        \"bag\": [],\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"분해! 가루 +25\",\n            \"#ff8844\",\n            50\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"changed-star\",\n      \"policy\": \"candidate\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 100,\n        \"bag\": [],\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"분해! 가루 +100\",\n            \"#ff8844\",\n            50\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"normal-one\",\n      \"policy\": \"current\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 25,\n        \"bag\": [],\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"분해! 가루 +25\",\n            \"#ff8844\",\n            50\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"normal-one\",\n      \"policy\": \"candidate\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 25,\n        \"bag\": [],\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"분해! 가루 +25\",\n            \"#ff8844\",\n            50\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"repeat-consumed\",\n      \"policy\": \"current\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 50,\n        \"bag\": [],\n        \"saveCalls\": 2,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"분해! 가루 +25\",\n            \"#ff8844\",\n            50\n          ],\n          [\n            \"save\"\n          ],\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"분해! 가루 +25\",\n            \"#ff8844\",\n            50\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"repeat-consumed\",\n      \"policy\": \"candidate\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 25,\n        \"bag\": [],\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"분해! 가루 +25\",\n            \"#ff8844\",\n            50\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"indices-shifted\",\n      \"policy\": \"current\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 25,\n        \"bag\": [\n          {\n            \"id\": \"cr_atk\",\n            \"star\": 0,\n            \"enh\": 2\n          }\n        ],\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"분해! 가루 +25\",\n            \"#ff8844\",\n            50\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"indices-shifted\",\n      \"policy\": \"candidate\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 25,\n        \"bag\": [\n          {\n            \"id\": \"cr_crit\",\n            \"star\": 0,\n            \"enh\": 0\n          }\n        ],\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"분해! 가루 +25\",\n            \"#ff8844\",\n            50\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"changed-star\",\n      \"policy\": \"current\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 25,\n        \"bag\": [],\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"분해! 가루 +25\",\n            \"#ff8844\",\n            50\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"changed-star\",\n      \"policy\": \"candidate\",\n      \"out\": {\n        \"mats\": 0,\n        \"dust\": 100,\n        \"bag\": [],\n        \"saveCalls\": 1,\n        \"trace\": [\n          [\n            \"sound\"\n          ],\n          [\n            \"text\",\n            0,\n            -20,\n            \"분해! 가루 +100\",\n            \"#ff8844\",\n            50\n          ],\n          [\n            \"save\"\n          ]\n        ]\n      }\n    }\n  ],\n  \"docs\": {\n    \"query\": \"CRYSTAL_DUST|CRYSTAL_DUST_COST|1개 분해|결정 분해|분해 환급\",\n    \"matches\": 18,\n    \"sha\": \"38a2135df618d10b177b9670a3c69c93ab6cf9bac2cc8b5d13dd373bf764231d\"\n  },\n  \"limits\": [\n    \"Actual full renderForge decomp row callback executed; DOM audio save stubbed\",\n    \"Bag index shift/star mutation/detached callback replay injected; native rapid-input reachability UNKNOWN\",\n    \"Current single selected object identity preserved; refund formula50% unchanged recalculated for current star\",\n    \"No malice charge; mats0 unchanged\",\n    \"No production shared docs Git files edits\"\n  ],\n  \"newFiles\": 0\n}\n"
        },
        "rootDocsHandoff": {
          "path": "docs/2_9 결정슬롯시스템/2_9 결정슬롯시스템.md",
          "contract": "분해 행의 실제 선택 객체 cr가 현재 CRYSTAL_BAG에 존재하는지 확인. 없으면 환급/음향/저장0; 존재하면 현재 성급의 제작가50% 환급. index가 이동해도 선택 객체1개만 삭제, 다른 종류 보존. 수치·상한·그룹 UI 불변. 실제 이전DOM callback 도달성 UNKNOWN."
        },
        "productionApplied": false
      }
    },
    {
      "key": "balanceShopBoundaryHandoff",
      "handoff": {
        "completionId": "BALANCE-shop-craft-boundary-crystal-memory",
        "sourceRuns": 26,
        "script": "import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {tokenizer,parse} from 'acorn';import {spawnSync} from 'node:child_process';\nconst sha=x=>createHash('sha256').update(x).digest('hex');\nfunction extract(s,n){const start=s.indexOf('function '+n+'(');assert(start>=0,n);return balanced(s,start);}\nfunction balanced(s,start){const t=tokenizer(s.slice(start),{ecmaVersion:'latest'});let d=0,o=false;for(;;){const k=t.getToken(),l=k.type.label;if(l==='{'||l==='$'+'{'){d++;o=true;}if(l==='}')d--;if(o&&d===0)return s.slice(start,start+k.end);if(l==='eof')throw Error('extract eof');}}\n\nconst rows=[],sources=[];\nclass E{constructor(){this.children=[];this.style={setProperty(){}};this.classList={add(){}};this.dataset={};this.textContent=''}appendChild(x){this.children.push(x);return x}replaceChildren(...x){this.children=x}setAttribute(k,v){this[k]=v}set innerHTML(x){this.markup=x;this.children=[]}get innerHTML(){return this.markup||''}querySelector(){return null}}\nconst descend=e=>[e,...e.children.flatMap(descend)];\nfor(const file of ['game.html','game-easy-test.html']){\nconst html=fs.readFileSync(file,'utf8'),crystals=html.slice(html.indexOf('const CR_ATK_SLOTS='),html.indexOf('const ITEM_SIZE=')),forge=extract(html,'renderForge'),mal=extract(html,'_malCost');\nconst old=\"btn.onclick=()=>{if(G.mats<cost||!hasFeed)return;G.mats-=cost;\";\nconst newer=\"btn.onclick=()=>{const _target=CRYSTAL_BAG.indexOf(cr);if(_target<0||(cr.enh||0)>=20)return;const _cost=crystalEnhCost(cr);const _feed=CRYSTAL_BAG.findIndex((c,ci)=>ci!==_target&&c.id===cr.id&&c.star===cr.star);if(_feed<0||G.mats<_cost)return;_crForgeSel=_target;G.mats-=_cost;\";\nconst candidate=forge.replace(old,newer);assert.notEqual(candidate,forge);\nsources.push({file,wholeSHA:sha(html),crystalsSHA:sha(crystals),forgeSHA:sha(forge),candidateSHA:sha(candidate),patch:{old,newer}});\nfor(const scenario of ['craft-exact-repeat','craft-shift-exact','crystal-exact-repeat','crystal-stale-no-feed','crystal-stale-price','crystal-fresh-normal']){\nfor(const policy of (scenario.startsWith('craft')?['current']:['current','candidate'])){\nconst nodes=new Map(),trace=[],bag=[{id:'cr_martyr_tear',star:0,enh:0},{id:'cr_martyr_tear',star:0,enh:0}];\nif(['crystal-stale-price','crystal-fresh-normal'].includes(scenario))bag.push({id:'cr_martyr_tear',star:0,enh:0});\nconst ctx=vm.createContext({HTMLButtonElement:E,document:{createElement:()=>new E()},$:id=>{if(!nodes.has(id))nodes.set(id,new E());return nodes.get(id)},G:{mats:100000,forgeTab:scenario.startsWith('craft')?'armor':'crystal',stage:0},P:{x:0,y:0},OPT:{lang:'ko'},_T:x=>x,_L:x=>x,_glyph:()=>'',_MALICE_COST_MUL:.5,_ensureForgeAtlasLoad(){},BGM:{play(){}},SFX:{forge:()=>trace.push('forge'),pickup:()=>trace.push('pickup')},applyStats:()=>trace.push('stats'),recalcSt:()=>trace.push('recalc'),addTxt:(...a)=>trace.push(['text',...a]),dbSaveNow:()=>trace.push('save'),notify:x=>trace.push(['notify',x]),INV:{equipped:{armor:{slot:'armor',name:'control'}},bag:[]},SLOT_NAMES:['weapon','armor','ring1'],_slotName:i=>i,_forgeSel:null,_salSel:new Set(),_rerollSel:null,bag,SI_TO_HELL:[0],RARITY_C:['','','','#hero','#legend'],EL:{P:0,F:1,I:2,D:3,L:4,H:5},ELN:{0:'physical'},_itemIco:()=>'',_rarName:x=>x,mkItem:(...a)=>{trace.push(['mkItem',...a]);return {slot:a[0]}},pickupItem:x=>{trace.push(['pickupItem',x]);},Math:Object.assign(Object.create(Math),{random:()=>.25})});\nvm.runInContext(mal+'\\n'+crystals+'\\n'+(policy==='current'?forge:candidate)+'\\nconst CRAFT_COST=_malCost(200000);CRYSTAL_BAG=bag;',ctx);\nconst _id=vm.runInContext('Object.keys(CRYSTAL_DEFS).find(k=>CRYSTAL_DEFS[k].cat===\\'def\\')',ctx);for(const cr of bag)cr.id=_id;\nconst run=x=>vm.runInContext(x,ctx),button=()=>descend(nodes.get('fgGrid')).find(e=>String(e.textContent).startsWith('강화 (악의 '));\nlet cost,nextCost;\nif(scenario.startsWith('craft')){\nctx.G.mats=run('CRAFT_COST');cost=ctx.G.mats;run('renderForge()');const b=descend(nodes.get('fgGrid')).find(e=>typeof e.onclick==='function'&&String(e.textContent).includes('제작 ('));assert(b);b.onclick(scenario.includes('shift')?{shiftKey:true}:{});b.onclick({});assert.equal(ctx.G.mats,0);assert.equal(trace.filter(x=>Array.isArray(x)&&x[0]==='mkItem').length,1);\n}else{\ncost=run('crystalEnhCost(bag[0])');nextCost=run('crystalEnhCost({...bag[0],enh:1})');\nctx.G.mats=scenario==='crystal-exact-repeat'?cost:scenario==='crystal-stale-price'?cost*2:cost+nextCost;\nrun('renderForge()');const row=descend(nodes.get('fgGrid')).find(e=>e.onclick&&String(e.onclick).includes('_crForgeSel=i'));assert(row);row.onclick();const b=button();assert(b);b.onclick();\nif(scenario==='crystal-fresh-normal')button().onclick();else b.onclick();\nif(scenario==='crystal-exact-repeat'){assert.equal(ctx.G.mats,0);assert.equal(bag[0].enh,1);}\nelse if(policy==='candidate'&&scenario==='crystal-stale-no-feed'){assert.equal(bag[0].enh,1);assert.equal(ctx.G.mats,nextCost);}\nelse if(policy==='candidate'&&scenario==='crystal-stale-price'){assert.equal(bag[0].enh,1);assert.equal(ctx.G.mats,cost);}\nelse{assert.equal(bag[0].enh,2);assert.equal(ctx.G.mats,scenario==='crystal-stale-price'?0:scenario==='crystal-fresh-normal'?0:nextCost-cost);}\n}\nrows.push({file,scenario,policy,cost,nextCost,mats:ctx.G.mats,bag:JSON.parse(JSON.stringify(bag)),hud:nodes.get('forgeMats').textContent,trace});\n}\n}\nfor(const scenario of ['crystal-exact-repeat','crystal-fresh-normal']){const r=rows.filter(x=>x.file===file&&x.scenario===scenario);assert.deepEqual(r[0].trace,r[1].trace);assert.equal(r[0].hud,r[1].hud);}\n}\nconst query='crystalEnhCost|동급 결정|결정 강화 비용|CRAFT_COST|제작 비용';const d=spawnSync('rg',['-n',query,'docs'],{encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(d.status,0);\nconsole.log(JSON.stringify({completionId:'BALANCE-crystal-stale-purchase-boundary-memory',sourceRuns:rows.length,sources,rows,docs:{query,matches:d.stdout.trim().split('\\n').length,sha:sha(d.stdout),text:d.stdout},limits:['Actual full renderForge and row selection, button callback, currency check/debit and forgeMats HUD executed','Full crystal definitions and actual _malCost/crystalEnhCost used','DOM sound stats item-generation and save are stubs; fixed RNG .25','Retained detached callback replay is source-level only; native rapid-input reachability unverified','No negative malice or double debit reproduced at exact boundary; stale crystal callback violates required feed/current price when affordable','No production/docs/Git/new files changed'],newFiles:0},null,2));\n",
        "receipt": {
          "chunk_id": "c4dfd6",
          "wall_time_seconds": 0.000006208,
          "exit_code": 0,
          "original_token_count": 4451,
          "output": "{\n  \"completionId\": \"BALANCE-crystal-stale-purchase-boundary-memory\",\n  \"sourceRuns\": 20,\n  \"sources\": [\n    {\n      \"file\": \"game.html\",\n      \"wholeSHA\": \"ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613\",\n      \"crystalsSHA\": \"232966ce820acdd21e123b233889a8f70f9871bdd425fc53453715ff18389396\",\n      \"forgeSHA\": \"6407a724ea6d9f1d9ba3f36dfc12d5b7f8a712ff2ada17320b7fac8f6066c2eb\",\n      \"candidateSHA\": \"5dd2bd5a51aefbe386135673a53ed037567d91239c69eb05eaaa885920180979\",\n      \"patch\": {\n        \"old\": \"btn.onclick=()=>{if(G.mats<cost||!hasFeed)return;G.mats-=cost;\",\n        \"newer\": \"btn.onclick=()=>{const _target=CRYSTAL_BAG.indexOf(cr);if(_target<0||(cr.enh||0)>=20)return;const _cost=crystalEnhCost(cr);const _feed=CRYSTAL_BAG.findIndex((c,ci)=>ci!==_target&&c.id===cr.id&&c.star===cr.star);if(_feed<0||G.mats<_cost)return;_crForgeSel=_target;G.mats-=_cost;\"\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"wholeSHA\": \"8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129\",\n      \"crystalsSHA\": \"768602fb3280af31b514bba11f3a4c971db6ea29bba21c675ec8c9e5f3cf8298\",\n      \"forgeSHA\": \"44c24b9c9130b66b3cce2e50ff923ae06a4d35834fd2c9b01c46797a5ff0dcf1\",\n      \"candidateSHA\": \"893292519589c82a5d1f1c05e8f03e096b0e64f27839c626c293575996e1d4a9\",\n      \"patch\": {\n        \"old\": \"btn.onclick=()=>{if(G.mats<cost||!hasFeed)return;G.mats-=cost;\",\n        \"newer\": \"btn.onclick=()=>{const _target=CRYSTAL_BAG.indexOf(cr);if(_target<0||(cr.enh||0)>=20)return;const _cost=crystalEnhCost(cr);const _feed=CRYSTAL_BAG.findIndex((c,ci)=>ci!==_target&&c.id===cr.id&&c.star===cr.star);if(_feed<0||G.mats<_cost)return;_crForgeSel=_target;G.mats-=_cost;\"\n      }\n    }\n  ],\n  \"rows\": [\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"craft-exact-repeat\",\n      \"policy\": \"current\",\n      \"cost\": 100000,\n      \"mats\": 0,\n      \"bag\": [\n        {\n          \"id\": \"cr_martyr_tear\",\n          \"star\": 0,\n          \"enh\": 0\n        },\n        {\n          \"id\": \"cr_martyr_tear\",\n          \"star\": 0,\n          \"enh\": 0\n        }\n      ],\n      \"hud\": \"악의: 0\",\n      \"trace\": [\n        [\n          \"mkItem\",\n          \"armor\",\n          0,\n          1,\n          3,\n          null\n        ],\n        [\n          \"pickupItem\",\n          {\n            \"slot\": \"armor\"\n          }\n        ],\n        \"pickup\",\n        [\n          \"notify\",\n          \"악의가 부족합니다!\"\n        ]\n      ]\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"craft-shift-exact\",\n      \"policy\": \"current\",\n      \"cost\": 100000,\n      \"mats\": 0,\n      \"bag\": [\n        {\n          \"id\": \"cr_martyr_tear\",\n          \"star\": 0,\n          \"enh\": 0\n        },\n        {\n          \"id\": \"cr_martyr_tear\",\n          \"star\": 0,\n          \"enh\": 0\n        }\n      ],\n      \"hud\": \"악의: 0\",\n      \"trace\": [\n        [\n          \"mkItem\",\n          \"armor\",\n          0,\n          1,\n          3,\n          null\n        ],\n        [\n          \"pickupItem\",\n          {\n            \"slot\": \"armor\"\n          }\n        ],\n        \"pickup\",\n        [\n          \"notify\",\n          \"악의가 부족합니다!\"\n        ]\n      ]\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"crystal-exact-repeat\",\n      \"policy\": \"current\",\n      \"cost\": 250,\n      \"nextCost\": 375,\n      \"mats\": 0,\n      \"bag\": [\n        {\n          \"id\": \"cr_martyr_tear\",\n          \"star\": 0,\n          \"enh\": 1\n        }\n      ],\n      \"hud\": \"악의: 0\",\n      \"trace\": [\n        \"forge\",\n        [\n          \"text\",\n          0,\n          -20,\n          \"순교자의 눈물 +1!\",\n          \"#bb88ff\",\n          50\n        ],\n        \"stats\",\n        \"save\"\n      ]\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"crystal-exact-repeat\",\n      \"policy\": \"candidate\",\n      \"cost\": 250,\n      \"nextCost\": 375,\n      \"mats\": 0,\n      \"bag\": [\n        {\n          \"id\": \"cr_martyr_tear\",\n          \"star\": 0,\n          \"enh\": 1\n        }\n      ],\n      \"hud\": \"악의: 0\",\n      \"trace\": [\n        \"forge\",\n        [\n          \"text\",\n          0,\n          -20,\n          \"순교자의 눈물 +1!\",\n          \"#bb88ff\",\n          50\n        ],\n        \"stats\",\n        \"save\"\n      ]\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"crystal-stale-no-feed\",\n      \"policy\": \"current\",\n      \"cost\": 250,\n      \"nextCost\": 375,\n      \"mats\": 125,\n      \"bag\": [\n        {\n          \"id\": \"cr_martyr_tear\",\n          \"star\": 0,\n          \"enh\": 2\n        }\n      ],\n      \"hud\": \"악의: 125\",\n      \"trace\": [\n        \"forge\",\n        [\n          \"text\",\n          0,\n          -20,\n          \"순교자의 눈물 +1!\",\n          \"#bb88ff\",\n          50\n        ],\n        \"stats\",\n        \"save\",\n        \"forge\",\n        [\n          \"text\",\n          0,\n          -20,\n          \"순교자의 눈물 +2!\",\n          \"#bb88ff\",\n          50\n        ],\n        \"stats\",\n        \"save\"\n      ]\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"crystal-stale-no-feed\",\n      \"policy\": \"candidate\",\n      \"cost\": 250,\n      \"nextCost\": 375,\n      \"mats\": 375,\n      \"bag\": [\n        {\n          \"id\": \"cr_martyr_tear\",\n          \"star\": 0,\n          \"enh\": 1\n        }\n      ],\n      \"hud\": \"악의: 375\",\n      \"trace\": [\n        \"forge\",\n        [\n          \"text\",\n          0,\n          -20,\n          \"순교자의 눈물 +1!\",\n          \"#bb88ff\",\n          50\n        ],\n        \"stats\",\n        \"save\"\n      ]\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"crystal-stale-price\",\n      \"policy\": \"current\",\n      \"cost\": 250,\n      \"nextCost\": 375,\n      \"mats\": 0,\n      \"bag\": [\n        {\n          \"id\": \"cr_martyr_tear\",\n          \"star\": 0,\n          \"enh\": 2\n        }\n      ],\n      \"hud\": \"악의: 0\",\n      \"trace\": [\n        \"forge\",\n        [\n          \"text\",\n          0,\n          -20,\n          \"순교자의 눈물 +1!\",\n          \"#bb88ff\",\n          50\n        ],\n        \"stats\",\n        \"save\",\n        \"forge\",\n        [\n          \"text\",\n          0,\n          -20,\n          \"순교자의 눈물 +2!\",\n          \"#bb88ff\",\n          50\n        ],\n        \"stats\",\n        \"save\"\n      ]\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"crystal-stale-price\",\n      \"policy\": \"candidate\",\n      \"cost\": 250,\n      \"nextCost\": 375,\n      \"mats\": 250,\n      \"bag\": [\n        {\n          \"id\": \"cr_martyr_tear\",\n          \"star\": 0,\n          \"enh\": 1\n        },\n        {\n          \"id\": \"cr_martyr_tear\",\n          \"star\": 0,\n          \"enh\": 0\n        }\n      ],\n      \"hud\": \"악의: 250\",\n      \"trace\": [\n        \"forge\",\n        [\n          \"text\",\n          0,\n          -20,\n          \"순교자의 눈물 +1!\",\n          \"#bb88ff\",\n          50\n        ],\n        \"stats\",\n        \"save\"\n      ]\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"crystal-fresh-normal\",\n      \"policy\": \"current\",\n      \"cost\": 250,\n      \"nextCost\": 375,\n      \"mats\": 0,\n      \"bag\": [\n        {\n          \"id\": \"cr_martyr_tear\",\n          \"star\": 0,\n          \"enh\": 2\n        }\n      ],\n      \"hud\": \"악의: 0\",\n      \"trace\": [\n        \"forge\",\n        [\n          \"text\",\n          0,\n          -20,\n          \"순교자의 눈물 +1!\",\n          \"#bb88ff\",\n          50\n        ],\n        \"stats\",\n        \"save\",\n        \"forge\",\n        [\n          \"text\",\n          0,\n          -20,\n          \"순교자의 눈물 +2!\",\n          \"#bb88ff\",\n          50\n        ],\n        \"stats\",\n        \"save\"\n      ]\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"crystal-fresh-normal\",\n      \"policy\": \"candidate\",\n      \"cost\": 250,\n      \"nextCost\": 375,\n      \"mats\": 0,\n      \"bag\": [\n        {\n          \"id\": \"cr_martyr_tear\",\n          \"star\": 0,\n          \"enh\": 2\n        }\n      ],\n      \"hud\": \"악의: 0\",\n      \"trace\": [\n        \"forge\",\n        [\n          \"text\",\n          0,\n          -20,\n          \"순교자의 눈물 +1!\",\n          \"#bb88ff\",\n          50\n        ],\n        \"stats\",\n        \"save\",\n        \"forge\",\n        [\n          \"text\",\n          0,\n          -20,\n          \"순교자의 눈물 +2!\",\n          \"#bb88ff\",\n          50\n        ],\n        \"stats\",\n        \"save\"\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"craft-exact-repeat\",\n      \"policy\": \"current\",\n      \"cost\": 100000,\n      \"mats\": 0,\n      \"bag\": [\n        {\n          \"id\": \"cr_hp\",\n          \"star\": 0,\n          \"enh\": 0\n        },\n        {\n          \"id\": \"cr_hp\",\n          \"star\": 0,\n          \"enh\": 0\n        }\n      ],\n      \"hud\": \"악의: 0\",\n      \"trace\": [\n        [\n          \"mkItem\",\n          \"armor\",\n          0,\n          1,\n          3,\n          null\n        ],\n        [\n          \"pickupItem\",\n          {\n            \"slot\": \"armor\"\n          }\n        ],\n        \"pickup\",\n        [\n          \"notify\",\n          \"악의가 부족합니다!\"\n        ]\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"craft-shift-exact\",\n      \"policy\": \"current\",\n      \"cost\": 100000,\n      \"mats\": 0,\n      \"bag\": [\n        {\n          \"id\": \"cr_hp\",\n          \"star\": 0,\n          \"enh\": 0\n        },\n        {\n          \"id\": \"cr_hp\",\n          \"star\": 0,\n          \"enh\": 0\n        }\n      ],\n      \"hud\": \"악의: 0\",\n      \"trace\": [\n        [\n          \"mkItem\",\n          \"armor\",\n          0,\n          1,\n          3,\n          null\n        ],\n        [\n          \"pickupItem\",\n          {\n            \"slot\": \"armor\"\n          }\n        ],\n        \"pickup\",\n        [\n          \"notify\",\n          \"악의가 부족합니다!\"\n        ]\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"crystal-exact-repeat\",\n      \"policy\": \"current\",\n      \"cost\": 250,\n      \"nextCost\": 375,\n      \"mats\": 0,\n      \"bag\": [\n        {\n          \"id\": \"cr_hp\",\n          \"star\": 0,\n          \"enh\": 1\n        }\n      ],\n      \"hud\": \"악의: 0\",\n      \"trace\": [\n        \"forge\",\n        [\n          \"text\",\n          0,\n          -20,\n          \"HP결정 +1!\",\n          \"#bb88ff\",\n          50\n        ],\n        \"stats\",\n        \"save\"\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"crystal-exact-repeat\",\n      \"policy\": \"candidate\",\n      \"cost\": 250,\n      \"nextCost\": 375,\n      \"mats\": 0,\n      \"bag\": [\n        {\n          \"id\": \"cr_hp\",\n          \"star\": 0,\n          \"enh\": 1\n        }\n      ],\n      \"hud\": \"악의: 0\",\n      \"trace\": [\n        \"forge\",\n        [\n          \"text\",\n          0,\n          -20,\n          \"HP결정 +1!\",\n          \"#bb88ff\",\n          50\n        ],\n        \"stats\",\n        \"save\"\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"crystal-stale-no-feed\",\n      \"policy\": \"current\",\n      \"cost\": 250,\n      \"nextCost\": 375,\n      \"mats\": 125,\n      \"bag\": [\n        {\n          \"id\": \"cr_hp\",\n          \"star\": 0,\n          \"enh\": 2\n        }\n      ],\n      \"hud\": \"악의: 125\",\n      \"trace\": [\n        \"forge\",\n        [\n          \"text\",\n          0,\n          -20,\n          \"HP결정 +1!\",\n          \"#bb88ff\",\n          50\n        ],\n        \"stats\",\n        \"save\",\n        \"forge\",\n        [\n          \"text\",\n          0,\n          -20,\n          \"HP결정 +2!\",\n          \"#bb88ff\",\n          50\n        ],\n        \"stats\",\n        \"save\"\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"crystal-stale-no-feed\",\n      \"policy\": \"candidate\",\n      \"cost\": 250,\n      \"nextCost\": 375,\n      \"mats\": 375,\n      \"bag\": [\n        {\n          \"id\": \"cr_hp\",\n          \"star\": 0,\n          \"enh\": 1\n        }\n      ],\n      \"hud\": \"악의: 375\",\n      \"trace\": [\n        \"forge\",\n        [\n          \"text\",\n          0,\n          -20,\n          \"HP결정 +1!\",\n          \"#bb88ff\",\n          50\n        ],\n        \"stats\",\n        \"save\"\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"crystal-stale-price\",\n      \"policy\": \"current\",\n      \"cost\": 250,\n      \"nextCost\": 375,\n      \"mats\": 0,\n      \"bag\": [\n        {\n          \"id\": \"cr_hp\",\n          \"star\": 0,\n          \"enh\": 2\n        }\n      ],\n      \"hud\": \"악의: 0\",\n      \"trace\": [\n        \"forge\",\n        [\n          \"text\",\n          0,\n          -20,\n          \"HP결정 +1!\",\n          \"#bb88ff\",\n          50\n        ],\n        \"stats\",\n        \"save\",\n        \"forge\",\n        [\n          \"text\",\n          0,\n          -20,\n          \"HP결정 +2!\",\n          \"#bb88ff\",\n          50\n        ],\n        \"stats\",\n        \"save\"\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"crystal-stale-price\",\n      \"policy\": \"candidate\",\n      \"cost\": 250,\n      \"nextCost\": 375,\n      \"mats\": 250,\n      \"bag\": [\n        {\n          \"id\": \"cr_hp\",\n          \"star\": 0,\n          \"enh\": 1\n        },\n        {\n          \"id\": \"cr_hp\",\n          \"star\": 0,\n          \"enh\": 0\n        }\n      ],\n      \"hud\": \"악의: 250\",\n      \"trace\": [\n        \"forge\",\n        [\n          \"text\",\n          0,\n          -20,\n          \"HP결정 +1!\",\n          \"#bb88ff\",\n          50\n        ],\n        \"stats\",\n        \"save\"\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"crystal-fresh-normal\",\n      \"policy\": \"current\",\n      \"cost\": 250,\n      \"nextCost\": 375,\n      \"mats\": 0,\n      \"bag\": [\n        {\n          \"id\": \"cr_hp\",\n          \"star\": 0,\n          \"enh\": 2\n        }\n      ],\n      \"hud\": \"악의: 0\",\n      \"trace\": [\n        \"forge\",\n        [\n          \"text\",\n          0,\n          -20,\n          \"HP결정 +1!\",\n          \"#bb88ff\",\n          50\n        ],\n        \"stats\",\n        \"save\",\n        \"forge\",\n        [\n          \"text\",\n          0,\n          -20,\n          \"HP결정 +2!\",\n          \"#bb88ff\",\n          50\n        ],\n        \"stats\",\n        \"save\"\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"crystal-fresh-normal\",\n      \"policy\": \"candidate\",\n      \"cost\": 250,\n      \"nextCost\": 375,\n      \"mats\": 0,\n      \"bag\": [\n        {\n          \"id\": \"cr_hp\",\n          \"star\": 0,\n          \"enh\": 2\n        }\n      ],\n      \"hud\": \"악의: 0\",\n      \"trace\": [\n        \"forge\",\n        [\n          \"text\",\n          0,\n          -20,\n          \"HP결정 +1!\",\n          \"#bb88ff\",\n          50\n        ],\n        \"stats\",\n        \"save\",\n        \"forge\",\n        [\n          \"text\",\n          0,\n          -20,\n          \"HP결정 +2!\",\n          \"#bb88ff\",\n          50\n        ],\n        \"stats\",\n        \"save\"\n      ]\n    }\n  ],\n  \"docs\": {\n    \"query\": \"crystalEnhCost|동급 결정|결정 강화 비용|CRAFT_COST|제작 비용\",\n    \"matches\": 11,\n    \"sha\": \"12d4b5d167373595032cfc6894b52c269adb01ff1efd8de437059a98b3e28f6c\",\n    \"text\": \"docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md:1154:| 캡처 | tmp/forge_alignment_after_1280.png. 게임 시작 전체 경로·실제 강화/제작 비용 소비는 검증 범위 밖 |\\ndocs/CHANGELOG_SYNC.md:49604:| 캡처 | tmp/forge_alignment_after_1280.png. 게임 시작 전체 경로·실제 강화/제작 비용 소비는 검증 범위 밖 |\\r\\ndocs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md:1017:| 캡처 | tmp/forge_alignment_after_1280.png. 게임 시작 전체 경로·실제 강화/제작 비용 소비는 검증 범위 밖 |\\ndocs/16번역·로컬라이제이션/번역대상_전체목록.md:580:| 0412 | 제작 비용 | Craft cost |\\r\\ndocs/16번역·로컬라이제이션/LOCALIZATION_RUNTIME_20260909.md:143:양쪽 HTML에 동일 적용. 저장된 아이템 이름, 장비 수치, 제작 비용과 강화 효과는 변경하지 않는다.\\ndocs/14밸런스+수치테이블/14밸런스+수치테이블.md:258:- CRAFT_COST 100,000악의 → 영웅 이상 랜덤 장비 (영웅90%/전설10%)\\ndocs/2_9 결정슬롯시스템/2_9 결정슬롯시스템.md:281:- 결정 강화 비용: `악의 = 결정기본가 × (1 + 강화레벨 × 0.5)` + **동급 결정 1개** (같은 종류 + 같은 성급)\\ndocs/2_9 결정슬롯시스템/2_9 결정슬롯시스템.md:427:2. [x] 결정 수치 계산 함수: crystalVal(crystal), crystalEnhCost(crystal)\\ndocs/0마스터플랜/mac-resume-20261001/vscode-dispatch/ITEM-result.md:44:기존 원자료의 관측기 없는3쌍에서 요청→최초 draw/_flush **반환** 중앙값9.9→4.9ms. 이는 화면표시·GPU완료가 아니다. 기존경로만 관측한6쌍은 단계 귀속으로 분리하고 성능 주근거로 합산하지 않는다. PNG 최초제출 호출0.6–1.3ms(중앙1.1ms)는 기존 중앙0.2ms보다 증가했다. PNG 제작22.2ms는 사전 일회 제작 비용이며 런타임 부트 개선으로 세지 않는다.\\ndocs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md:389:양쪽 HTML에 동일 적용. 저장된 아이템 이름, 장비 수치, 제작 비용과 강화 효과는 변경하지 않는다.\\r\\ndocs/0마스터플랜/mac-resume-20261001/Mac-반지-PNG-재사용-진단.md:66:- 파생 PNG 제작22.2ms: 로드5.8 / decode확인1.5 / draw0.3 / mask10.6 / PNG직렬화4.0. 파일시스템 기록·패키징은 제외다. 한 번의 제작 비용이며 게임 부트 시간으로 숨겨 옮기지 않았다.\\n\"\n  },\n  \"limits\": [\n    \"Actual full renderForge and row selection, button callback, currency check/debit and forgeMats HUD executed\",\n    \"Full crystal definitions and actual _malCost/crystalEnhCost used\",\n    \"DOM sound stats item-generation and save are stubs; fixed RNG .25\",\n    \"Retained detached callback replay is source-level only; native rapid-input reachability unverified\",\n    \"No negative malice or double debit reproduced at exact boundary; stale crystal callback violates required feed/current price when affordable\",\n    \"No production/docs/Git/new files changed\"\n  ],\n  \"newFiles\": 0\n}\n"
        },
        "failures": [
          {
            "chunk_id": "67a284",
            "wall_time_seconds": 0.000005333,
            "exit_code": 1,
            "original_token_count": 191,
            "output": "evalmachine.<anonymous>:68\nfunction _crDefN(d){return OPT.lang!=='ko'?_T(d.ko):d.ko}\n                                                      ^\n\nTypeError: Cannot read properties of undefined (reading 'ko')\n    at _crDefN (evalmachine.<anonymous>:68:55)\n    at evalmachine.<anonymous>:616:187\n    at Array.forEach (<anonymous>)\n    at renderForge (evalmachine.<anonymous>:613:19)\n    at evalmachine.<anonymous>:1:1\n    at Script.runInContext (node:vm:149:12)\n    at Object.runInContext (node:vm:301:6)\n    at run (file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:21:17)\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:28:1\n    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)\n\nNode.js v24.15.0\n"
          },
          {
            "chunk_id": "3e9aa4",
            "wall_time_seconds": 0.00000625,
            "exit_code": 1,
            "original_token_count": 193,
            "output": "node:internal/modules/run_main:107\n    triggerUncaughtException(\n    ^\n\nAssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:\n\n  assert(list)\n\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:29:92\n    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)\n    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)\n    at async node:internal/modules/esm/loader:246:26\n    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:243:20)\n    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5) {\n  generatedMessage: true,\n  code: 'ERR_ASSERTION',\n  actual: undefined,\n  expected: true,\n  operator: '==',\n  diff: 'simple'\n}\n\nNode.js v24.15.0\n"
          }
        ],
        "merchant": {
          "script": "import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {tokenizer,parse} from 'acorn';import {spawnSync} from 'node:child_process';\nconst sha=x=>createHash('sha256').update(x).digest('hex');\nfunction extract(s,n){const start=s.indexOf('function '+n+'(');assert(start>=0,n);return balanced(s,start);}\nfunction balanced(s,start){const t=tokenizer(s.slice(start),{ecmaVersion:'latest'});let d=0,o=false;for(;;){const k=t.getToken(),l=k.type.label;if(l==='{'||l==='$'+'{'){d++;o=true;}if(l==='}')d--;if(o&&d===0)return s.slice(start,start+k.end);if(l==='eof')throw Error('extract eof');}}\n\nconst rows=[];\nfor(const file of ['game.html','game-easy-test.html']){\nconst s=fs.readFileSync(file,'utf8'),shop=balanced(s,s.indexOf('if(e.etype===93){')),mal=extract(s,'_malCost');\nfor(const scenario of ['exact','normal-surplus','insufficient']){\nconst trace=[],e={etype:93,x:0,y:0,r:5,speed:1,_mcFleeDelay:0},G={stage:0,mats:scenario==='exact'?50:scenario==='normal-surplus'?100:49},K={KeyF:true};\nconst c=vm.createContext({e,G,K,P:{x:0,y:0},sp:1,d:10,_MALICE_COST_MUL:.5,Math:Object.assign(Object.create(Math),{random:()=>.25}),canMv:()=>true,addTxt:(...a)=>trace.push(['txt',...a]),_T:x=>x,SLOT_NAMES:['armor'],SI_TO_HELL:[0],EL:{P:0,F:1,I:2,D:3,L:4},mkItem:(...a)=>{trace.push(['mkItem',...a]);return {slot:a[0]}},_wiPush:x=>trace.push(['world',x]),SFX:{levelup:()=>trace.push(['sound'])}});\nvm.runInContext(mal+'\\n'+shop,c);K.KeyF=true;vm.runInContext(shop,c);\nassert.equal(G.mats,scenario==='exact'?0:scenario==='normal-surplus'?50:49);\nassert.equal(trace.filter(x=>x[0]==='mkItem').length,scenario==='insufficient'?0:1);assert.equal(e._mcShopUsed,true);\nrows.push({file,scenario,mats:G.mats,used:e._mcShopUsed,fleeDelay:e._mcFleeDelay,trace,sourceSHA:sha(shop)});\n}\n}\nconsole.log(JSON.stringify({completionId:'BALANCE-merchant-exact-repeat-source',sourceRuns:6,rows,limits:['Full actual etype93 source block run twice including renewed KeyF; input/UI/item/audio/world spawning stubbed','Shop displays world text via actual caller; no forge HUD here','No production docs Git or file changes']},null,2));\n",
          "receipt": {
            "chunk_id": "a513d2",
            "wall_time_seconds": 0.00000725,
            "exit_code": 0,
            "original_token_count": 1417,
            "output": "{\n  \"completionId\": \"BALANCE-merchant-exact-repeat-source\",\n  \"sourceRuns\": 6,\n  \"rows\": [\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"exact\",\n      \"mats\": 0,\n      \"used\": true,\n      \"fleeDelay\": 119,\n      \"trace\": [\n        [\n          \"txt\",\n          0,\n          -35,\n          \"[F] 상점\",\n          \"#ddaa44\",\n          55\n        ],\n        [\n          \"mkItem\",\n          \"armor\",\n          2,\n          1,\n          4\n        ],\n        [\n          \"world\",\n          {\n            \"x\": -4,\n            \"y\": 20,\n            \"type\": \"item\",\n            \"item\": {\n              \"slot\": \"armor\"\n            },\n            \"picked\": false\n          }\n        ],\n        [\n          \"txt\",\n          0,\n          -20,\n          \"거래 성공!\",\n          \"#44ff44\",\n          50\n        ],\n        [\n          \"sound\"\n        ],\n        [\n          \"txt\",\n          0,\n          -35,\n          \"상인이 떠납니다...\",\n          \"#886644\",\n          60\n        ]\n      ],\n      \"sourceSHA\": \"4425c47c967138c37fc8ce0865424fc1ed413bda5badbea5b2996d3dac9ae7bd\"\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"normal-surplus\",\n      \"mats\": 50,\n      \"used\": true,\n      \"fleeDelay\": 119,\n      \"trace\": [\n        [\n          \"txt\",\n          0,\n          -35,\n          \"[F] 상점\",\n          \"#ddaa44\",\n          55\n        ],\n        [\n          \"mkItem\",\n          \"armor\",\n          2,\n          1,\n          4\n        ],\n        [\n          \"world\",\n          {\n            \"x\": -4,\n            \"y\": 20,\n            \"type\": \"item\",\n            \"item\": {\n              \"slot\": \"armor\"\n            },\n            \"picked\": false\n          }\n        ],\n        [\n          \"txt\",\n          0,\n          -20,\n          \"거래 성공!\",\n          \"#44ff44\",\n          50\n        ],\n        [\n          \"sound\"\n        ],\n        [\n          \"txt\",\n          0,\n          -35,\n          \"상인이 떠납니다...\",\n          \"#886644\",\n          60\n        ]\n      ],\n      \"sourceSHA\": \"4425c47c967138c37fc8ce0865424fc1ed413bda5badbea5b2996d3dac9ae7bd\"\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"insufficient\",\n      \"mats\": 49,\n      \"used\": true,\n      \"fleeDelay\": 119,\n      \"trace\": [\n        [\n          \"txt\",\n          0,\n          -35,\n          \"[F] 상점\",\n          \"#ddaa44\",\n          55\n        ],\n        [\n          \"txt\",\n          0,\n          -20,\n          \"악의 부족! (50)\",\n          \"#ff4444\",\n          50\n        ],\n        [\n          \"txt\",\n          0,\n          -35,\n          \"상인이 떠납니다...\",\n          \"#886644\",\n          60\n        ]\n      ],\n      \"sourceSHA\": \"4425c47c967138c37fc8ce0865424fc1ed413bda5badbea5b2996d3dac9ae7bd\"\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"exact\",\n      \"mats\": 0,\n      \"used\": true,\n      \"fleeDelay\": 119,\n      \"trace\": [\n        [\n          \"txt\",\n          0,\n          -35,\n          \"[F] 상점\",\n          \"#ddaa44\",\n          55\n        ],\n        [\n          \"mkItem\",\n          \"armor\",\n          2,\n          1,\n          4\n        ],\n        [\n          \"world\",\n          {\n            \"x\": -4,\n            \"y\": 20,\n            \"type\": \"item\",\n            \"item\": {\n              \"slot\": \"armor\"\n            },\n            \"picked\": false\n          }\n        ],\n        [\n          \"txt\",\n          0,\n          -20,\n          \"거래 성공!\",\n          \"#44ff44\",\n          50\n        ],\n        [\n          \"sound\"\n        ],\n        [\n          \"txt\",\n          0,\n          -35,\n          \"상인이 떠납니다...\",\n          \"#886644\",\n          60\n        ]\n      ],\n      \"sourceSHA\": \"4425c47c967138c37fc8ce0865424fc1ed413bda5badbea5b2996d3dac9ae7bd\"\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"normal-surplus\",\n      \"mats\": 50,\n      \"used\": true,\n      \"fleeDelay\": 119,\n      \"trace\": [\n        [\n          \"txt\",\n          0,\n          -35,\n          \"[F] 상점\",\n          \"#ddaa44\",\n          55\n        ],\n        [\n          \"mkItem\",\n          \"armor\",\n          2,\n          1,\n          4\n        ],\n        [\n          \"world\",\n          {\n            \"x\": -4,\n            \"y\": 20,\n            \"type\": \"item\",\n            \"item\": {\n              \"slot\": \"armor\"\n            },\n            \"picked\": false\n          }\n        ],\n        [\n          \"txt\",\n          0,\n          -20,\n          \"거래 성공!\",\n          \"#44ff44\",\n          50\n        ],\n        [\n          \"sound\"\n        ],\n        [\n          \"txt\",\n          0,\n          -35,\n          \"상인이 떠납니다...\",\n          \"#886644\",\n          60\n        ]\n      ],\n      \"sourceSHA\": \"4425c47c967138c37fc8ce0865424fc1ed413bda5badbea5b2996d3dac9ae7bd\"\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"insufficient\",\n      \"mats\": 49,\n      \"used\": true,\n      \"fleeDelay\": 119,\n      \"trace\": [\n        [\n          \"txt\",\n          0,\n          -35,\n          \"[F] 상점\",\n          \"#ddaa44\",\n          55\n        ],\n        [\n          \"txt\",\n          0,\n          -20,\n          \"악의 부족! (50)\",\n          \"#ff4444\",\n          50\n        ],\n        [\n          \"txt\",\n          0,\n          -35,\n          \"상인이 떠납니다...\",\n          \"#886644\",\n          60\n        ]\n      ],\n      \"sourceSHA\": \"4425c47c967138c37fc8ce0865424fc1ed413bda5badbea5b2996d3dac9ae7bd\"\n    }\n  ],\n  \"limits\": [\n    \"Full actual etype93 source block run twice including renewed KeyF; input/UI/item/audio/world spawning stubbed\",\n    \"Shop displays world text via actual caller; no forge HUD here\",\n    \"No production docs Git or file changes\"\n  ]\n}\n"
          }
        },
        "patch": [
          {
            "file": "game.html",
            "patch": {
              "old": "btn.onclick=()=>{if(G.mats<cost||!hasFeed)return;G.mats-=cost;",
              "newer": "btn.onclick=()=>{const _target=CRYSTAL_BAG.indexOf(cr);if(_target<0||(cr.enh||0)>=20)return;const _cost=crystalEnhCost(cr);const _feed=CRYSTAL_BAG.findIndex((c,ci)=>ci!==_target&&c.id===cr.id&&c.star===cr.star);if(_feed<0||G.mats<_cost)return;_crForgeSel=_target;G.mats-=_cost;"
            },
            "candidateSHA": "5dd2bd5a51aefbe386135673a53ed037567d91239c69eb05eaaa885920180979"
          },
          {
            "file": "game-easy-test.html",
            "patch": {
              "old": "btn.onclick=()=>{if(G.mats<cost||!hasFeed)return;G.mats-=cost;",
              "newer": "btn.onclick=()=>{const _target=CRYSTAL_BAG.indexOf(cr);if(_target<0||(cr.enh||0)>=20)return;const _cost=crystalEnhCost(cr);const _feed=CRYSTAL_BAG.findIndex((c,ci)=>ci!==_target&&c.id===cr.id&&c.star===cr.star);if(_feed<0||G.mats<_cost)return;_crForgeSel=_target;G.mats-=_cost;"
            },
            "candidateSHA": "893292519589c82a5d1f1c05e8f03e096b0e64f27839c626c293575996e1d4a9"
          }
        ],
        "docs": {
          "query": "crystalEnhCost|동급 결정|결정 강화 비용|CRAFT_COST|제작 비용",
          "matches": 11,
          "sha": "12d4b5d167373595032cfc6894b52c269adb01ff1efd8de437059a98b3e28f6c",
          "text": "docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md:1154:| 캡처 | tmp/forge_alignment_after_1280.png. 게임 시작 전체 경로·실제 강화/제작 비용 소비는 검증 범위 밖 |\ndocs/CHANGELOG_SYNC.md:49604:| 캡처 | tmp/forge_alignment_after_1280.png. 게임 시작 전체 경로·실제 강화/제작 비용 소비는 검증 범위 밖 |\r\ndocs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md:1017:| 캡처 | tmp/forge_alignment_after_1280.png. 게임 시작 전체 경로·실제 강화/제작 비용 소비는 검증 범위 밖 |\ndocs/16번역·로컬라이제이션/번역대상_전체목록.md:580:| 0412 | 제작 비용 | Craft cost |\r\ndocs/16번역·로컬라이제이션/LOCALIZATION_RUNTIME_20260909.md:143:양쪽 HTML에 동일 적용. 저장된 아이템 이름, 장비 수치, 제작 비용과 강화 효과는 변경하지 않는다.\ndocs/14밸런스+수치테이블/14밸런스+수치테이블.md:258:- CRAFT_COST 100,000악의 → 영웅 이상 랜덤 장비 (영웅90%/전설10%)\ndocs/2_9 결정슬롯시스템/2_9 결정슬롯시스템.md:281:- 결정 강화 비용: `악의 = 결정기본가 × (1 + 강화레벨 × 0.5)` + **동급 결정 1개** (같은 종류 + 같은 성급)\ndocs/2_9 결정슬롯시스템/2_9 결정슬롯시스템.md:427:2. [x] 결정 수치 계산 함수: crystalVal(crystal), crystalEnhCost(crystal)\ndocs/0마스터플랜/mac-resume-20261001/vscode-dispatch/ITEM-result.md:44:기존 원자료의 관측기 없는3쌍에서 요청→최초 draw/_flush **반환** 중앙값9.9→4.9ms. 이는 화면표시·GPU완료가 아니다. 기존경로만 관측한6쌍은 단계 귀속으로 분리하고 성능 주근거로 합산하지 않는다. PNG 최초제출 호출0.6–1.3ms(중앙1.1ms)는 기존 중앙0.2ms보다 증가했다. PNG 제작22.2ms는 사전 일회 제작 비용이며 런타임 부트 개선으로 세지 않는다.\ndocs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md:389:양쪽 HTML에 동일 적용. 저장된 아이템 이름, 장비 수치, 제작 비용과 강화 효과는 변경하지 않는다.\r\ndocs/0마스터플랜/mac-resume-20261001/Mac-반지-PNG-재사용-진단.md:66:- 파생 PNG 제작22.2ms: 로드5.8 / decode확인1.5 / draw0.3 / mask10.6 / PNG직렬화4.0. 파일시스템 기록·패키징은 제외다. 한 번의 제작 비용이며 게임 부트 시간으로 숨겨 옮기지 않았다.\n"
        },
        "rootDocsHandoff": [
          {
            "path": "docs/2_9 결정슬롯시스템/2_9 결정슬롯시스템.md",
            "contract": "개별강화 콜백 진입 시 현재 대상 객체가 CRYSTAL_BAG에 존재하는지, enh<20인지, 현재 crystalEnhCost와 현재 동급 재료1개를 다시 검사한 뒤 차감. 원가·50% 할인·상한 변경0. stale callback source-only 재현과 native reachability 미검증을 구분."
          }
        ],
        "productionApplied": false,
        "newFiles": 0,
        "reexecutionsForSaving": 0
      }
    },
    {
      "key": "balancePotionSoundCommitHandoff",
      "handoff": {
        "completionId": "BALANCE-quick-potion-sound-resource-commit-1337",
        "evidence": {
          "task": "BALANCE-quick-potion-sound-resource-commit-1337",
          "at": "2026-10-02T13:31:23.243Z",
          "sources": [
            {
              "file": "game.html",
              "anchors": {
                "useQuickslot": "9663a435ba0771b30e9238c599d8c29bfe8e69ce074257cab91b99a675b28483",
                "potHeal": "320846b67de0a24d93dab7b3f12c0ff8b499886e01defb6fc2037a8e82b0cdb7",
                "playFM": "afd3add856318ce74e56b564f4872e02e2c64a3f6d77ff805b3555017bd7b582",
                "_r": "a2ae931f0268caf75ddb17d752c77cd32960a6cf59eac23be2db7dc76dda8ab3"
              },
              "potionMethodSHA": "11b94397057a311945401623c2d738139b0413cda7fd5115b89b5b3f20f7c66c",
              "candidateSHA": "7be82cdfe288a8eb33b69288b396e9c3d8ee18d7649bc7976994da3819782a31",
              "patch": "Remove SFX.potion before cooldown. HP branch calls SFX.potion immediately after HP mutation/before text. Non-HP future path calls potion before count cleanup (current POT HP only)."
            },
            {
              "file": "game-easy-test.html",
              "anchors": {
                "useQuickslot": "0c69a6c019e58bc2ea4a35905c79513470b46f301320c7bd304d02be486daf60",
                "potHeal": "320846b67de0a24d93dab7b3f12c0ff8b499886e01defb6fc2037a8e82b0cdb7",
                "playFM": "afd3add856318ce74e56b564f4872e02e2c64a3f6d77ff805b3555017bd7b582",
                "_r": "a2ae931f0268caf75ddb17d752c77cd32960a6cf59eac23be2db7dc76dda8ab3"
              },
              "potionMethodSHA": "11b94397057a311945401623c2d738139b0413cda7fd5115b89b5b3f20f7c66c",
              "candidateSHA": "13dffd1e839ea0cc8b69d27c6dfe6cff1b1727ab659c87db1fc9c5a9221b48f2",
              "patch": "Remove SFX.potion before cooldown. HP branch calls SFX.potion immediately after HP mutation/before text. Non-HP future path calls potion before count cleanup (current POT HP only)."
            }
          ],
          "rows": [
            {
              "file": "game.html",
              "policy": "current",
              "fail": false,
              "outcome": {
                "hp": 250,
                "mats": 4,
                "cd": 420,
                "errorSame": false
              },
              "timers": [
                560,
                55,
                110,
                170
              ],
              "traceSHA": "4c8bbd12efae17a3ec0655d59bd7067e017aba394204fca65bfe9fbe040b7222",
              "operations": [
                "createOscillator",
                "createGain",
                "createOscillator",
                "createGain",
                "set",
                "set",
                "exp",
                "RNG",
                "set",
                "exp",
                "connect",
                "connect",
                "set",
                "linear",
                "exp",
                "connect",
                "connect",
                "start",
                "start",
                "stop",
                "stop",
                "timer",
                "noise",
                "timer",
                "timer",
                "timer",
                "text",
                "parts",
                "updateQS"
              ]
            },
            {
              "file": "game.html",
              "policy": "candidate",
              "fail": false,
              "outcome": {
                "hp": 250,
                "mats": 4,
                "cd": 420,
                "errorSame": false
              },
              "timers": [
                560,
                55,
                110,
                170
              ],
              "traceSHA": "4c8bbd12efae17a3ec0655d59bd7067e017aba394204fca65bfe9fbe040b7222",
              "operations": [
                "createOscillator",
                "createGain",
                "createOscillator",
                "createGain",
                "set",
                "set",
                "exp",
                "RNG",
                "set",
                "exp",
                "connect",
                "connect",
                "set",
                "linear",
                "exp",
                "connect",
                "connect",
                "start",
                "start",
                "stop",
                "stop",
                "timer",
                "noise",
                "timer",
                "timer",
                "timer",
                "text",
                "parts",
                "updateQS"
              ]
            },
            {
              "file": "game.html",
              "policy": "current",
              "fail": true,
              "outcome": {
                "hp": 150,
                "mats": 4,
                "cd": 0,
                "errorSame": true
              },
              "timers": [],
              "traceSHA": "7b56bcc5be6adc0276d4376c2336b813d7f6526035beb71d3354da088a7b90d4",
              "operations": [
                "createOscillator"
              ]
            },
            {
              "file": "game.html",
              "policy": "candidate",
              "fail": true,
              "outcome": {
                "hp": 250,
                "mats": 4,
                "cd": 420,
                "errorSame": true
              },
              "timers": [],
              "traceSHA": "7b56bcc5be6adc0276d4376c2336b813d7f6526035beb71d3354da088a7b90d4",
              "operations": [
                "createOscillator"
              ]
            },
            {
              "file": "game-easy-test.html",
              "policy": "current",
              "fail": false,
              "outcome": {
                "hp": 250,
                "mats": 4,
                "cd": 420,
                "errorSame": false
              },
              "timers": [
                560,
                55,
                110,
                170
              ],
              "traceSHA": "4c8bbd12efae17a3ec0655d59bd7067e017aba394204fca65bfe9fbe040b7222",
              "operations": [
                "createOscillator",
                "createGain",
                "createOscillator",
                "createGain",
                "set",
                "set",
                "exp",
                "RNG",
                "set",
                "exp",
                "connect",
                "connect",
                "set",
                "linear",
                "exp",
                "connect",
                "connect",
                "start",
                "start",
                "stop",
                "stop",
                "timer",
                "noise",
                "timer",
                "timer",
                "timer",
                "text",
                "parts",
                "updateQS"
              ]
            },
            {
              "file": "game-easy-test.html",
              "policy": "candidate",
              "fail": false,
              "outcome": {
                "hp": 250,
                "mats": 4,
                "cd": 420,
                "errorSame": false
              },
              "timers": [
                560,
                55,
                110,
                170
              ],
              "traceSHA": "4c8bbd12efae17a3ec0655d59bd7067e017aba394204fca65bfe9fbe040b7222",
              "operations": [
                "createOscillator",
                "createGain",
                "createOscillator",
                "createGain",
                "set",
                "set",
                "exp",
                "RNG",
                "set",
                "exp",
                "connect",
                "connect",
                "set",
                "linear",
                "exp",
                "connect",
                "connect",
                "start",
                "start",
                "stop",
                "stop",
                "timer",
                "noise",
                "timer",
                "timer",
                "timer",
                "text",
                "parts",
                "updateQS"
              ]
            },
            {
              "file": "game-easy-test.html",
              "policy": "current",
              "fail": true,
              "outcome": {
                "hp": 150,
                "mats": 4,
                "cd": 0,
                "errorSame": true
              },
              "timers": [],
              "traceSHA": "7b56bcc5be6adc0276d4376c2336b813d7f6526035beb71d3354da088a7b90d4",
              "operations": [
                "createOscillator"
              ]
            },
            {
              "file": "game-easy-test.html",
              "policy": "candidate",
              "fail": true,
              "outcome": {
                "hp": 250,
                "mats": 4,
                "cd": 420,
                "errorSame": true
              },
              "timers": [],
              "traceSHA": "7b56bcc5be6adc0276d4376c2336b813d7f6526035beb71d3354da088a7b90d4",
              "operations": [
                "createOscillator"
              ]
            }
          ],
          "sourceRuns": 8,
          "docs": {
            "query": "useQuickslot|playFM|SFX.potion|물약.*쿨|동기.*실패",
            "exitCode": 0,
            "matches": 73,
            "sha": "2c3a5bba5d100f8206343f1bf043229e87a266c947ad2d0118e68b95ba9f7bec"
          },
          "limits": [
            "Full useQuickslot→actual SFX.potion method→actual playFM; createOscillator constructor error injected, not actual device failure",
            "Normal audio node args/connect/start/stop/timer/RNG/text order equal; pitch0 input and AudioContext/timers mocked",
            "Failure same Error propagates; candidate protects HP/currency/CD commit only, no full RAF/game continuation guarantee",
            "playNoise stubbed and asynchronous potion timers not fired; audio cleanup/partial graph SOUND owner",
            "Non-HP future sounds path shifted; current actual POT has onlyHP; future ST/MP not validated"
          ],
          "productionApplied": false,
          "newFiles": 0
        },
        "candidate": "Move SFX.potion after HP/cooldown commit in HP branch before healing text; preserve non-HP future sound call path separately. Same Error propagation, no swallowing/retry. Merge with earlier fallen guard and cooldown-sign candidates in useQuickslot, do not replace root WIP whole function.",
        "docsHandoff": "Root sync docs/2_8 actual ordering: check→stats/currency→cooldown→HP→sound→text/parts/UI. Sound failure may still interrupt later effects/full frame; no native/RAF recovery claim. SOUND owns audio backend cleanup. Base420,min6,cost1,heal formulas unchanged; protected2_3 untouched.",
        "newFiles": 0,
        "productionApplied": false
      }
    }
  ],
  "audioRaw": {
    "script": "import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {tokenizer,parse} from 'acorn';import {spawnSync} from 'node:child_process';\nconst sha=x=>createHash('sha256').update(x).digest('hex');\nfunction extract(s,n){const start=s.indexOf('function '+n+'(');assert(start>=0,n);return balanced(s,start);}\nfunction balanced(s,start){const t=tokenizer(s.slice(start),{ecmaVersion:'latest'});let d=0,o=false;for(;;){const k=t.getToken(),l=k.type.label;if(l==='{'||l==='$'+'{'){d++;o=true;}if(l==='}')d--;if(o&&d===0)return s.slice(start,start+k.end);if(l==='eof')throw Error('extract eof');}}\n\nconst rows=[],sources=[];\nfor(const file of ['game.html','game-easy-test.html']){\nconst s=fs.readFileSync(file,'utf8'),names=['useQuickslot','potHeal','playFM','_r'],f=Object.fromEntries(names.map(n=>[n,extract(s,n)]));\nconst method=balanced(s,s.indexOf('  potion(){')+2);\nlet candidate=f.useQuickslot.replace('  SFX.potion();\\n','').replace('    P.hp=Math.min(P.mhp,P.hp+v);\\n','    P.hp=Math.min(P.mhp,P.hp+v);\\n    SFX.potion();\\n').replace(\"  if(s.type!=='hp'&&s.count<=0)\",\"  if(s.type!=='hp')SFX.potion();\\n  if(s.type!=='hp'&&s.count<=0)\");\nassert.notEqual(candidate,f.useQuickslot);\nsources.push({file,anchors:Object.fromEntries(names.map(n=>[n,sha(f[n])])),potionMethodSHA:sha(method),candidateSHA:sha(candidate),patch:\"Remove SFX.potion before cooldown. HP branch calls SFX.potion immediately after HP mutation/before text. Non-HP future path calls potion before count cleanup (current POT HP only).\"});\nfor(const fail of [false,true])for(const policy of ['current','candidate']){\nconst trace=[],timers=[],failure=new Error('injected AudioContext createOscillator failure'),P={hp:150,mhp:350,x:0,y:0},G={on:true,paused:false,mats:5};\nlet id=0;const param=(label)=>({label,setValueAtTime:(...a)=>trace.push(['set',label,...a]),exponentialRampToValueAtTime:(...a)=>trace.push(['exp',label,...a]),linearRampToValueAtTime:(...a)=>trace.push(['linear',label,...a])});\nconst node=kind=>{const label=kind+(++id);return {label,frequency:param(label+'.frequency'),gain:param(label+'.gain'),connect:t=>trace.push(['connect',label,t.label]),start:t=>trace.push(['start',label,t]),stop:t=>trace.push(['stop',label,t]),disconnect:()=>{}}};\nconst audio={currentTime:0,createOscillator:()=>{trace.push(['createOscillator']);if(fail)throw failure;return node('osc')},createGain:()=>{trace.push(['createGain']);return node('gain')}};\nconst c={P,G,QSLOTS:[{type:'hp',count:1}],qsCooldown:[0,0,0,0],POT:{hp:{col:'#33cc66'}},POT_LV:{hp:0},PASSIVES:{pRegen:0},_activeNodeCnt:0,_MAX_ACTIVE_NODES:99,actx:()=>audio,mbus:()=>({label:'mbus'}),Math:Object.assign(Object.create(Math),{random:()=>{trace.push(['RNG']);return 0}}),gl:()=>({}),blt:()=>({}),_eqAffix:()=>0,_T:x=>x,showPH:()=>{},addTxt:()=>trace.push(['text']),addParts:()=>trace.push(['parts']),updateQS:()=>trace.push(['updateQS']),$:()=>null,playNoise:(...a)=>trace.push(['noise',...a]),playTone:()=>{},setTimeout:(fn,t)=>{timers.push({fn,t});trace.push(['timer',t]);}};\nconst ctx=vm.createContext(c);vm.runInContext(names.map(n=>n==='useQuickslot'?(policy==='current'?f[n]:candidate):f[n]).join('\\n')+'\\nconst SFX={'+method+'};',ctx);\nlet caught;try{vm.runInContext('useQuickslot(0)',ctx)}catch(e){caught=e}\nassert.equal(G.mats,4);\nif(fail){assert.equal(caught,failure);if(policy==='current'){assert.equal(P.hp,150);assert.equal(c.qsCooldown[0],0)}else{assert.equal(P.hp,250);assert.equal(c.qsCooldown[0],420)}assert.equal(timers.length,0)}\nelse{assert.equal(caught,undefined);assert.equal(P.hp,250);assert.equal(c.qsCooldown[0],420);assert.equal(c._activeNodeCnt,1);assert.equal(timers.length,4)}\nrows.push({file,policy,fail,outcome:{hp:P.hp,mats:G.mats,cd:c.qsCooldown[0],errorSame:caught===failure},trace,timers:timers.map(t=>t.t)});\n}\nconst normal=rows.filter(r=>r.file===file&&!r.fail);assert.deepEqual(normal[0].trace,normal[1].trace);assert.deepEqual(normal[0].outcome,normal[1].outcome);\n}\nconst q='useQuickslot|playFM|SFX.potion|물약.*쿨|동기.*실패',d=spawnSync('rg',['-n',q,'docs'],{encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(d.status,0);\nconsole.log(JSON.stringify({task:'BALANCE-quick-potion-sound-resource-commit-1337',at:new Date().toISOString(),sources,rows:rows.map(({trace,...r})=>({...r,traceSHA:sha(JSON.stringify(trace)),operations:trace.map(x=>x[0])})),sourceRuns:8,docs:{query:q,exitCode:d.status,matches:d.stdout.trim().split('\\n').length,sha:sha(d.stdout)},limits:['Full useQuickslot→actual SFX.potion method→actual playFM; createOscillator constructor error injected, not actual device failure','Normal audio node args/connect/start/stop/timer/RNG/text order equal; pitch0 input and AudioContext/timers mocked','Failure same Error propagates; candidate protects HP/currency/CD commit only, no full RAF/game continuation guarantee','playNoise stubbed and asynchronous potion timers not fired; audio cleanup/partial graph SOUND owner','Non-HP future sounds path shifted; current actual POT has onlyHP; future ST/MP not validated'],productionApplied:false,newFiles:0},null,2));",
    "receipt": {
      "chunk_id": "9115b5",
      "wall_time_seconds": 0.000005917,
      "exit_code": 0,
      "original_token_count": 1937,
      "output": "{\n  \"task\": \"BALANCE-quick-potion-sound-resource-commit-1337\",\n  \"at\": \"2026-10-02T13:31:23.243Z\",\n  \"sources\": [\n    {\n      \"file\": \"game.html\",\n      \"anchors\": {\n        \"useQuickslot\": \"9663a435ba0771b30e9238c599d8c29bfe8e69ce074257cab91b99a675b28483\",\n        \"potHeal\": \"320846b67de0a24d93dab7b3f12c0ff8b499886e01defb6fc2037a8e82b0cdb7\",\n        \"playFM\": \"afd3add856318ce74e56b564f4872e02e2c64a3f6d77ff805b3555017bd7b582\",\n        \"_r\": \"a2ae931f0268caf75ddb17d752c77cd32960a6cf59eac23be2db7dc76dda8ab3\"\n      },\n      \"potionMethodSHA\": \"11b94397057a311945401623c2d738139b0413cda7fd5115b89b5b3f20f7c66c\",\n      \"candidateSHA\": \"7be82cdfe288a8eb33b69288b396e9c3d8ee18d7649bc7976994da3819782a31\",\n      \"patch\": \"Remove SFX.potion before cooldown. HP branch calls SFX.potion immediately after HP mutation/before text. Non-HP future path calls potion before count cleanup (current POT HP only).\"\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"anchors\": {\n        \"useQuickslot\": \"0c69a6c019e58bc2ea4a35905c79513470b46f301320c7bd304d02be486daf60\",\n        \"potHeal\": \"320846b67de0a24d93dab7b3f12c0ff8b499886e01defb6fc2037a8e82b0cdb7\",\n        \"playFM\": \"afd3add856318ce74e56b564f4872e02e2c64a3f6d77ff805b3555017bd7b582\",\n        \"_r\": \"a2ae931f0268caf75ddb17d752c77cd32960a6cf59eac23be2db7dc76dda8ab3\"\n      },\n      \"potionMethodSHA\": \"11b94397057a311945401623c2d738139b0413cda7fd5115b89b5b3f20f7c66c\",\n      \"candidateSHA\": \"13dffd1e839ea0cc8b69d27c6dfe6cff1b1727ab659c87db1fc9c5a9221b48f2\",\n      \"patch\": \"Remove SFX.potion before cooldown. HP branch calls SFX.potion immediately after HP mutation/before text. Non-HP future path calls potion before count cleanup (current POT HP only).\"\n    }\n  ],\n  \"rows\": [\n    {\n      \"file\": \"game.html\",\n      \"policy\": \"current\",\n      \"fail\": false,\n      \"outcome\": {\n        \"hp\": 250,\n        \"mats\": 4,\n        \"cd\": 420,\n        \"errorSame\": false\n      },\n      \"timers\": [\n        560,\n        55,\n        110,\n        170\n      ],\n      \"traceSHA\": \"4c8bbd12efae17a3ec0655d59bd7067e017aba394204fca65bfe9fbe040b7222\",\n      \"operations\": [\n        \"createOscillator\",\n        \"createGain\",\n        \"createOscillator\",\n        \"createGain\",\n        \"set\",\n        \"set\",\n        \"exp\",\n        \"RNG\",\n        \"set\",\n        \"exp\",\n        \"connect\",\n        \"connect\",\n        \"set\",\n        \"linear\",\n        \"exp\",\n        \"connect\",\n        \"connect\",\n        \"start\",\n        \"start\",\n        \"stop\",\n        \"stop\",\n        \"timer\",\n        \"noise\",\n        \"timer\",\n        \"timer\",\n        \"timer\",\n        \"text\",\n        \"parts\",\n        \"updateQS\"\n      ]\n    },\n    {\n      \"file\": \"game.html\",\n      \"policy\": \"candidate\",\n      \"fail\": false,\n      \"outcome\": {\n        \"hp\": 250,\n        \"mats\": 4,\n        \"cd\": 420,\n        \"errorSame\": false\n      },\n      \"timers\": [\n        560,\n        55,\n        110,\n        170\n      ],\n      \"traceSHA\": \"4c8bbd12efae17a3ec0655d59bd7067e017aba394204fca65bfe9fbe040b7222\",\n      \"operations\": [\n        \"createOscillator\",\n        \"createGain\",\n        \"createOscillator\",\n        \"createGain\",\n        \"set\",\n        \"set\",\n        \"exp\",\n        \"RNG\",\n        \"set\",\n        \"exp\",\n        \"connect\",\n        \"connect\",\n        \"set\",\n        \"linear\",\n        \"exp\",\n        \"connect\",\n        \"connect\",\n        \"start\",\n        \"start\",\n        \"stop\",\n        \"stop\",\n        \"timer\",\n        \"noise\",\n        \"timer\",\n        \"timer\",\n        \"timer\",\n        \"text\",\n        \"parts\",\n        \"updateQS\"\n      ]\n    },\n    {\n      \"file\": \"game.html\",\n      \"policy\": \"current\",\n      \"fail\": true,\n      \"outcome\": {\n        \"hp\": 150,\n        \"mats\": 4,\n        \"cd\": 0,\n        \"errorSame\": true\n      },\n      \"timers\": [],\n      \"traceSHA\": \"7b56bcc5be6adc0276d4376c2336b813d7f6526035beb71d3354da088a7b90d4\",\n      \"operations\": [\n        \"createOscillator\"\n      ]\n    },\n    {\n      \"file\": \"game.html\",\n      \"policy\": \"candidate\",\n      \"fail\": true,\n      \"outcome\": {\n        \"hp\": 250,\n        \"mats\": 4,\n        \"cd\": 420,\n        \"errorSame\": true\n      },\n      \"timers\": [],\n      \"traceSHA\": \"7b56bcc5be6adc0276d4376c2336b813d7f6526035beb71d3354da088a7b90d4\",\n      \"operations\": [\n        \"createOscillator\"\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"policy\": \"current\",\n      \"fail\": false,\n      \"outcome\": {\n        \"hp\": 250,\n        \"mats\": 4,\n        \"cd\": 420,\n        \"errorSame\": false\n      },\n      \"timers\": [\n        560,\n        55,\n        110,\n        170\n      ],\n      \"traceSHA\": \"4c8bbd12efae17a3ec0655d59bd7067e017aba394204fca65bfe9fbe040b7222\",\n      \"operations\": [\n        \"createOscillator\",\n        \"createGain\",\n        \"createOscillator\",\n        \"createGain\",\n        \"set\",\n        \"set\",\n        \"exp\",\n        \"RNG\",\n        \"set\",\n        \"exp\",\n        \"connect\",\n        \"connect\",\n        \"set\",\n        \"linear\",\n        \"exp\",\n        \"connect\",\n        \"connect\",\n        \"start\",\n        \"start\",\n        \"stop\",\n        \"stop\",\n        \"timer\",\n        \"noise\",\n        \"timer\",\n        \"timer\",\n        \"timer\",\n        \"text\",\n        \"parts\",\n        \"updateQS\"\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"policy\": \"candidate\",\n      \"fail\": false,\n      \"outcome\": {\n        \"hp\": 250,\n        \"mats\": 4,\n        \"cd\": 420,\n        \"errorSame\": false\n      },\n      \"timers\": [\n        560,\n        55,\n        110,\n        170\n      ],\n      \"traceSHA\": \"4c8bbd12efae17a3ec0655d59bd7067e017aba394204fca65bfe9fbe040b7222\",\n      \"operations\": [\n        \"createOscillator\",\n        \"createGain\",\n        \"createOscillator\",\n        \"createGain\",\n        \"set\",\n        \"set\",\n        \"exp\",\n        \"RNG\",\n        \"set\",\n        \"exp\",\n        \"connect\",\n        \"connect\",\n        \"set\",\n        \"linear\",\n        \"exp\",\n        \"connect\",\n        \"connect\",\n        \"start\",\n        \"start\",\n        \"stop\",\n        \"stop\",\n        \"timer\",\n        \"noise\",\n        \"timer\",\n        \"timer\",\n        \"timer\",\n        \"text\",\n        \"parts\",\n        \"updateQS\"\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"policy\": \"current\",\n      \"fail\": true,\n      \"outcome\": {\n        \"hp\": 150,\n        \"mats\": 4,\n        \"cd\": 0,\n        \"errorSame\": true\n      },\n      \"timers\": [],\n      \"traceSHA\": \"7b56bcc5be6adc0276d4376c2336b813d7f6526035beb71d3354da088a7b90d4\",\n      \"operations\": [\n        \"createOscillator\"\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"policy\": \"candidate\",\n      \"fail\": true,\n      \"outcome\": {\n        \"hp\": 250,\n        \"mats\": 4,\n        \"cd\": 420,\n        \"errorSame\": true\n      },\n      \"timers\": [],\n      \"traceSHA\": \"7b56bcc5be6adc0276d4376c2336b813d7f6526035beb71d3354da088a7b90d4\",\n      \"operations\": [\n        \"createOscillator\"\n      ]\n    }\n  ],\n  \"sourceRuns\": 8,\n  \"docs\": {\n    \"query\": \"useQuickslot|playFM|SFX.potion|물약.*쿨|동기.*실패\",\n    \"exitCode\": 0,\n    \"matches\": 73,\n    \"sha\": \"2c3a5bba5d100f8206343f1bf043229e87a266c947ad2d0118e68b95ba9f7bec\"\n  },\n  \"limits\": [\n    \"Full useQuickslot→actual SFX.potion method→actual playFM; createOscillator constructor error injected, not actual device failure\",\n    \"Normal audio node args/connect/start/stop/timer/RNG/text order equal; pitch0 input and AudioContext/timers mocked\",\n    \"Failure same Error propagates; candidate protects HP/currency/CD commit only, no full RAF/game continuation guarantee\",\n    \"playNoise stubbed and asynchronous potion timers not fired; audio cleanup/partial graph SOUND owner\",\n    \"Non-HP future sounds path shifted; current actual POT has onlyHP; future ST/MP not validated\"\n  ],\n  \"productionApplied\": false,\n  \"newFiles\": 0\n}\n"
    }
  },
  "ownership": "BALANCE only new unique owned output; production/shared docs/Git/user game/save untouched; old artifacts immutable"
}
```
