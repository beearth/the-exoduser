// Root application verification. Read-only inputs, JSON stdout, no result writer.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {parse} from 'acorn';
import {createDocument} from '../../team-followup-20261001/UIUX/inventory-dom/node-dom.mjs';

const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const own=path.join(root,'tools/team-followup-20261002/root-integration/uiux-minus-lifetime-checks.mjs');
const backup=path.join(root,'tmp/mac-migration-runtime/continued-review-20261002/uiux-minus-backup');
const guard='if(!d.isConnected||!grid.contains(d))return;';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const report={taskId:'ROOT-UIUX-MINUS-LIFETIME-20261002',startedUTC:new Date().toISOString(),
  node:process.version,nodeExecutable:process.execPath,productionApplied:true,
  comparisons:[],syntax:[],roleExecutionsRerun:0,plusExecutions:0,writes:0,
  limits:{scenario:'whirlDet only; connected minus then saved detached callback direct call',
    nativeInput:false,naturalDoubleClick:false,fullRender:false,runtime:false,visual:false,
    actualStorage:false,audioPlayback:false,audioInternalRng:false,otherFusion:false,reset:false,
    PReplacement:false,asyncReset:false},
  realBoundary:'actual minus/card/host/group/refund/grid clear/append source fragments',
  doubles:'existing read-only DOM, synthetic P/G and fragment renderer, UI/save/SFX sinks'};

try {
  assert.equal(fs.realpathSync(root),root);
  assert.equal(fileURLToPath(import.meta.url),own);
  const before=JSON.parse(fs.readFileSync(path.join(backup,'before.json'),'utf8'));
  const roleCheckPath=path.join(root,'tools/team-followup-20261002/continuous/UIUX/checks.mjs');
  const roleSource=fs.readFileSync(roleCheckPath,'utf8');
  assert.equal(sha(roleSource),before.roleInputs.find(row=>row.file.endsWith('/checks.mjs')).sha256);
  report.roleCheckSourceSHA256=sha(roleSource);

  // Reuse audited helper declarations without importing/running the role runner.
  const ast=parse(roleSource,{ecmaVersion:'latest',sourceType:'module'});
  const names=['extract','line','fragments','execute'];
  const definitions=names.map(name=>{
    const matches=ast.body.filter(node=>node.type==='FunctionDeclaration'&&node.id.name===name);
    assert.equal(matches.length,1,name);
    return roleSource.slice(matches[0].start,matches[0].end);
  });
  const priorAssertion="assert.ok(!p.minus.text.includes(guard),'Minus already guarded: do not manufacture RED');";
  assert.equal(definitions[2].split(priorAssertion).length-1,1);
  definitions[2]=definitions[2].replace(priorAssertion,
    "assert.ok(p.minus.text.includes(guard),'Adopted minus guard missing');");
  const context=vm.createContext({assert,vm,createDocument,sha,guard,structuredClone});
  const helpers=new vm.Script(definitions.join('\n')+'\n({fragments,execute})',
    {filename:'read-only-role-helper-declarations'}).runInContext(context);

  for(const row of before.html){
    const original=fs.readFileSync(row.backup),current=fs.readFileSync(path.join(root,row.file));
    assert.equal(sha(original),row.sha256,row.file+' backup');
    const marker=Buffer.from('function _skMinusClick(){');
    const start=original.indexOf(marker);
    assert(start>=0);assert.equal(original.indexOf(marker,start+marker.length),-1);
    const at=start+marker.length;
    const expected=Buffer.concat([original.subarray(0,at),Buffer.from(guard),original.subarray(at)]);
    assert(current.equals(expected),row.file+' changes beyond the one guard');
    const source=current.toString('utf8'),parts=helpers.fragments(source);
    assert(parts.minus.text.includes('function _skMinusClick(){'+guard));
    assert.equal(parts.minus.text.split(guard).length-1,1);
    const production=helpers.execute(row.file,parts,'production');
    const unguardedText=parts.minus.text.replace(guard,'');
    const negativeParts={...parts,minus:{...parts.minus,text:unguardedText}};
    const negative=helpers.execute(row.file,negativeParts,'source');
    assert.equal(production.verdict,'GREEN');assert.equal(negative.verdict,'RED');
    assert.deepEqual(production.trace[0],negative.trace[0]);
    assert.deepEqual(production.trace[1],negative.trace[1],'Connected first complete effect must remain identical');
    const brief=execution=>({verdict:execution.verdict,verification:execution.verification,
      selection:execution.selection,first:execution.trace[1],detached:execution.trace[2],
      detachedDelta:execution.detachedDelta,minusSHA256:execution.minusSHA256,
      rendererSHA256:execution.rendererSHA256,helperSHA256:execution.helperSHA256});
    report.comparisons.push({file:row.file,beforeSHA256:row.sha256,currentSHA256:sha(current),
      singleGuardBytes:Buffer.byteLength(guard),outsideGuardBytesUnchanged:true,
      production:brief(production),guardRemovedMemory:brief(negative),normalCompleteEquivalence:'PASS'});

    let jsCount=0,mapCount=0;
    for(const match of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
      const attributes=match[1];
      if(/\bsrc\s*=/i.test(attributes))continue;
      const type=(/\btype\s*=\s*["']([^"']+)["']/i.exec(attributes)?.[1]||'').toLowerCase();
      if(type==='importmap'){JSON.parse(match[2]);mapCount++;}
      else if(!type||['module','text/javascript','application/javascript'].includes(type)){
        parse(match[2],{ecmaVersion:'latest',sourceType:type==='module'?'module':'script'});jsCount++;
      }
    }
    report.syntax.push({file:row.file,inlineJavaScript:jsCount,importMapJSON:mapCount,status:'PASS'});
    assert.equal(sha(fs.readFileSync(path.join(root,row.file))),sha(current),row.file+' changed during verification');
  }
  const js=report.syntax.reduce((sum,row)=>sum+row.inlineJavaScript,0);
  const maps=report.syntax.reduce((sum,row)=>sum+row.importMapJSON,0);
  assert.equal(js,12);assert.equal(maps,2);
  report.counts={productionGREEN:2,guardRemovedMemoryRED:2,normalCompleteEquivalence:2,
    scenarioCount:1,comparisonExecutions:4,inlineJavaScript:js,importMapJSON:maps,previousAdded:0};
  report.rolePreservation=before.roleInputs.map(row=>({file:row.file,
    unchanged:sha(fs.readFileSync(path.join(root,row.file)))===row.sha256}));
  assert(report.rolePreservation.every(row=>row.unchanged));
  report.status='PASS';
} catch(error){
  report.status='FAIL';report.error={name:error.name,message:error.message};process.exitCode=1;
}
report.finishedUTC=new Date().toISOString();
console.log(JSON.stringify(report,null,2));
