import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {parse} from 'acorn';
import {extract} from './binding-save-harness.mjs';

const owned='tools/team-followup-20261001/ITEM/';
const destination=owned+'browser-host/';
const hash=source=>crypto.createHash('sha256').update(source).digest('hex');
const read=file=>fs.readFileSync(file,'utf8');
const imports=source=>parse(source,{ecmaVersion:'latest',sourceType:'module'}).body.filter(node=>node.type==='ImportDeclaration');
const moduleNames=['persistence-integration-port','binding-ports','binding-d10','d10-consumer'];
const targets=new Map(moduleNames.map(name=>[owned+name+'.mjs',destination+name+'.js']));
const relative=(from,to)=>{const result=path.posix.relative(path.posix.dirname(from),to);return result.startsWith('.')?result:'./'+result;};

export function generateBrowserHost(){
  const files={},modules=[];
  for(const [sourcePath,targetPath] of targets){
    const source=read(sourcePath),edits=[];
    for(const node of imports(source)){
      const dependency=path.posix.normalize(path.posix.join(path.posix.dirname(sourcePath),node.source.value));
      const target=targets.get(dependency)||dependency;
      assert(target.endsWith('.js'));
      edits.push({start:node.source.start,end:node.source.end,original:source.slice(node.source.start,node.source.end),replacement:JSON.stringify(relative(targetPath,target)),dependency,target});
    }
    let output=source;
    for(const edit of edits.toReversed())output=output.slice(0,edit.start)+edit.replacement+output.slice(edit.end);
    const outputImports=imports(output);let reversed=output;
    for(let index=outputImports.length-1;index>=0;index--){const node=outputImports[index];reversed=reversed.slice(0,node.source.start)+edits[index].original+reversed.slice(node.source.end);}
    assert.equal(reversed,source);
    files[targetPath]=output;
    modules.push({sourcePath,targetPath,sourceSha256:hash(source),targetSha256:hash(output),reverseImportEditsExact:true,
      edits:edits.map(({start,end,original,replacement,dependency,target})=>({start,end,original,replacement,dependency,target}))});
  }
  const html=read('game.html');
  const constants=['EL','RARITY_MUL','SLOT_NAMES','SLOT_EMOJI','AFFIX_POOL','_AFSLOT','IMPLICIT_TABLE','LEGENDARY_SPECIAL','UNIQUE_SPECIAL'];
  const functions=['rollAffixes','mkItem'];
  const fragments=[...constants.map(name=>({name,source:extract(html,name,true)})),...functions.map(name=>({name,source:extract(html,name)}))];
  const fixture=`export function createMkItemFixture({random,now=()=>100000}={}){\n  if(typeof random!=='function'||typeof now!=='function')throw new TypeError('fixture RNG/clock 필요');\n  const Math=Object.create(globalThis.Math);Math.random=random;\n  const Date={now};const performance={now};\n  const P={lv:20},_DEMO_MODE=false,_DEMO_AFFIX_BANNED=new Set();\n${fragments.map(entry=>entry.source).join('\n')}\n  return function(slot,tier,element,rarity){\n    if(slot!=='armor')throw new TypeError('reviewOnly armor fixture만 허용');\n    return mkItem(slot,tier,element,rarity);\n  };\n}\n`;
  files[destination+'mk-item-fixture.js']=fixture;
  const dependencies=['unique-item-project/definitions.js','unique-item-project/roll-values.js',owned+'browser-bootstrap-api.js',owned+'browser-bootstrap-ui.js'];
  const manifest={schema:'reviewOnly-browser-host-v1',modules,
    sourceGame:{file:'game.html',sha256:hash(html),wholeHTMLExecuted:false},
    extraction:fragments.map(entry=>({name:entry.name,sha256:hash(entry.source),bytes:Buffer.byteLength(entry.source)})),
    fixture:{file:destination+'mk-item-fixture.js',sha256:hash(fixture),config:'synthetic P.lv20/demo=false, only armor; local Math/Date shadows, no game state'},
    unchangedDependencies:dependencies.map(file=>({file,sha256:hash(read(file))})),
    httpChecks:[...targets.values(),destination+'mk-item-fixture.js',...dependencies].map(file=>({url:'/'+file,expectedMime:'JavaScript'})),
    browserImport:'UNKNOWN',productionApplied:false};
  files[destination+'manifest.json']=JSON.stringify(manifest,null,2)+'\n';
  return {files,manifest};
}

if(process.argv.includes('--emit'))process.stdout.write(JSON.stringify(generateBrowserHost().files));
