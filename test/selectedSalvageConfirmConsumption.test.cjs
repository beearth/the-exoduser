// Whole registered keydown + actual gameConfirm + selected-salvage renderer
// statements. Renderer wrapper/DOM event transport, localization, save and audio
// are doubles. Other identity/value mutations are synthetic; no native/full UI.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const root=process.cwd(),dir=process.env.EXODUSER_TEST_SOURCE_DIR||root,baseline=process.env.EXODUSER_TEST_BASELINE_DIR;assert(baseline,'explicit original baseline required');
const helper=fs.readFileSync(path.join(root,'test/inventoryJunkConfirmRevalidationAcceptance.test.cjs'),'utf8'),end=helper.indexOf('(async () => {');assert(end>0);let prefix=helper.slice(0,end).replaceAll("'invJunkBtn'","'invSalvageBtn'");
function replace(a,b){assert.equal(prefix.split(a).length,2,a);prefix=prefix.replace(a,b)}
replace('_invSalSel: new Set([0]),',"_invSalSel: new Set(scenario.startsWith('multi-')||scenario.includes('overflow')||scenario==='duplicate-ref'?[0,1]:[0]),");
replace(".includes(scenario)) key('KeyF');",".includes(scenario)||scenario==='multi-keyF') key('KeyF');");
replace("  const work = nodes.get('invSalvageBtn').click();",`  if(scenario==='before-infinite') A._enhRefund='Infinity';\n  if(scenario==='before-negative') A.tier=-600;\n  if(scenario==='before-overflow'){A._enhRefund=1e308;B._enhRefund=1e308;}\n  const work = nodes.get('invSalvageBtn').click();`);
replace("const bag = single ? [A] :", "const bag = scenario==='duplicate-ref'?[A,A,B]:single ? [A] :");
replace("  const work = nodes.get('invSalvageBtn').click();", "  let secondWork;const work = nodes.get('invSalvageBtn').click();");
replace("  const quote = nodes.get('gcMsg').innerHTML;", "  const quote = nodes.get('gcMsg').innerHTML;if(scenario==='double-click'){secondWork=nodes.get('invSalvageBtn').click();assert.equal(nodes.get('gcMsg').innerHTML,quote);assert(nodes.get('gcModal').classes.has('on'));}");
replace("  await work;", "  await work;if(secondWork)await secondWork;");
replace("    nodes.get(['modal-cancel', 'cancel-after-keyF'].includes(scenario)",`    if(scenario==='pending-insert') context.INV.bag.unshift(N);\n    if(scenario==='pending-selection-change'){context._invSalSel.clear();context._invSalSel.add(1);}\n    if(scenario==='pending-refund-change') A._enhRefund=500;\n    if(scenario==='pending-infinite') A._enhRefund='Infinity';\n    if(scenario==='pending-negative') A.tier=-600;\n    if(scenario==='pending-overflow'){A._enhRefund=1e308;B._enhRefund=1e308;}\n    nodes.get(['modal-cancel', 'cancel-after-keyF'].includes(scenario)`);
replace("  const single = ['all-invalid-keyF'", "  if(scenario==='zero-value') A.tier=-500;\n  const single = ['all-invalid-keyF'");
const h={require,__dirname:path.join(root,'test'),process,console,Buffer};vm.createContext(h);vm.runInContext(prefix,h);const plain=x=>JSON.parse(JSON.stringify(x));
function program(file,base){const text=fs.readFileSync(path.join(base,file),'utf8'),e=h.extract(text),f=acorn.parseExpressionAt(text,text.indexOf('function renderInv('),{ecmaVersion:'latest'}),s=f.body.body;function group(name){const i=s.findIndex(n=>n.type==='VariableDeclaration'&&n.declarations.some(d=>d.id.name===name));assert(i>=0&&s[i+1].type==='IfStatement');return text.slice(s[i].start,s[i+1].end)}const junk=group('_jkBtn');assert(e.program.includes(junk));return e.program.replace(junk,group('_isBtn'));}
const cases=[['normal',['B'],1500,true],['zero-value',['B'],500,true],['duplicate-ref',['B'],1500,true],['double-click',['B'],1500,true],['multi-normal',[],3500,true],['modal-cancel',['A','B'],500,true],['cancel-after-keyF',['A','B'],500,true],['pending-keyF',['A','B'],500,true],['pending-keyX',['B'],1500,true],['multi-keyF',['A'],2500,true],['before-fav',['A','B'],500,false],['pending-removed',['B'],500,true],['pending-replaced',['R','B'],500,true],['pending-equipped',['A','B'],500,true],['new-junk-after-confirm',['B','N'],1500,true],['pending-insert',['N','B'],1500,true],['pending-selection-change',['B'],1500,true],['pending-refund-change',['B'],2000,true],['before-infinite',['A','B'],500,false],['before-negative',['A','B'],500,false],['before-overflow',['A','B'],500,false],['pending-infinite',['A','B'],500,true],['pending-negative',['A','B'],500,true],['pending-overflow',['A','B'],500,true]];
for(const file of ['game.html','game-easy-test.html']){
 const actual=program(file,dir),original=program(file,baseline);
 for(const [scenario,bag,mats,opened] of cases)test(`${file}: live selected salvage ${scenario}`,async()=>{
  const r=plain(await h.run(actual,scenario));assert.deepEqual(r.bag,bag);assert.equal(r.mats,mats);assert.equal(r.opened,opened);assert(r.closed);assert.equal(r.rng,0);
  const committed=mats>500||scenario==='zero-value';assert.equal(r.events.filter(e=>e.name==='SFX.pickup').length,+committed);assert.equal(r.events.filter(e=>e.name==='dbSaveNow').length,+committed);
  if(committed){assert.equal(r.selected,null);assert.deepEqual(r.salvageSelected,[]);}else{assert.equal(r.selected,0);assert.deepEqual(r.salvageSelected,scenario==='pending-overflow'||scenario==='before-overflow'?[0,1]:[0]);}
  if(['normal','multi-normal','modal-cancel','cancel-after-keyF','new-junk-after-confirm','pending-keyX','double-click','zero-value'].includes(scenario))assert.deepEqual(r,plain(await h.run(original,scenario)),'exact original normal/cancel state/quote/calls');
  if(scenario.includes('keyF'))assert.equal(r.A.fav,true);
 });
}
