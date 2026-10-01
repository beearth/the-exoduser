import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {analyzeCSP,inspectHTML,inspectJS,classifyViolation} from './browser-csp-analysis.mjs';

const result=analyzeCSP(),rows=[];
function check(name,action){action();rows.push({name,status:'PASS'});}
const before=new Map(result.sources.map(source=>[source.file,fs.readFileSync(source.file)]));
check('root 인수 당시 source hash 일치',()=>assert(result.sources.filter(source=>source.acceptanceHashMatches!==null).every(source=>source.acceptanceHashMatches)));
check('초기HTML inline STYLE/속성없음·외부CSS',()=>{const html=result.sources.find(source=>source.file.endsWith('index.html'));assert.equal(html.styleElements.length,0);assert.equal(html.styleAttributes.length,0);assert.equal(html.stylesheetLinks.length,1);assert.equal(html.policies.length,1);});
check('전체 검사JS 직접 스타일주입없음',()=>assert(result.sources.filter(source=>source.file.endsWith('.js')).every(source=>source.risks.length===0)));
check('HTML style 요소/속성 최소반례 탐지',()=>{assert.equal(inspectHTML('<style>p{color:red}</style>').styleElements.length,1);assert.equal(inspectHTML('<p style="color:red">fixture</p>').styleAttributes.length,1);});
check('JS 생성/속성/CSSOM 최소반례 탐지',()=>{for(const source of ["document.createElement('style')","node.setAttribute('style','color:red')","node.style.color='red'","node.style.cssText='color:red'","node.innerHTML='<style></style>'"])assert(inspectJS(source).risks.length>0);});
check('elem/attr/외부URI는 구분하되 주체는UNKNOWN',()=>{assert.equal(classifyViolation({effectiveDirective:'style-src-elem',blockedURI:'inline'}).family,'style element / stylesheet');assert.equal(classifyViolation({effectiveDirective:'style-src-attr',blockedURI:'inline'}).family,'style attribute');assert.equal(classifyViolation({effectiveDirective:'style-src-elem',blockedURI:'https://fixture.invalid/style.css'}).inline,false);assert(classifyViolation({sourceFile:'fixture'}).origin.startsWith('UNKNOWN'));});
check('진단정책 원host와동일·완화0',()=>{const host=fs.readFileSync('tools/team-followup-20261001/ITEM/browser-host/index.html','utf8');const diagnostic=fs.readFileSync('tools/team-followup-20261001/ITEM/browser-csp/diagnostic.html','utf8');assert.equal(inspectHTML(host).policies[0],inspectHTML(diagnostic).policies[0]);assert(!diagnostic.includes('unsafe-inline'));assert.equal(inspectHTML(diagnostic).styleElements.length,0);assert.equal(inspectHTML(diagnostic).styleAttributes.length,0);});
check('명시버튼 이전 주입0·event 필드 원자료 기록',()=>{
  const listeners=new Map(),nodes=new Map();let created=0;
  const document={head:{appendChild(){created++;}},addEventListener:(kind,callback)=>listeners.set(kind,callback),
    getElementById:id=>{if(!nodes.has(id))nodes.set(id,{textContent:'',addEventListener:(kind,callback)=>listeners.set(id+kind,callback),setAttribute(){created++;}});return nodes.get(id);},createElement:()=>({})};
  vm.runInNewContext(fs.readFileSync('tools/team-followup-20261001/ITEM/browser-csp/diagnostic.js','utf8'),{document,performance:{now:()=>1}});
  assert.equal(created,0);listeners.get('DOMContentLoaded')();assert.equal(created,0);
  listeners.get('securitypolicyviolation')({effectiveDirective:'style-src-elem',blockedURI:'inline',sourceFile:'fixture',lineNumber:9,sample:'fixture'});
  const event=JSON.parse(nodes.get('events').textContent)[0];assert.equal(event.lineNumber,9);assert.equal(event.action,'baseline: no intentional style injection');
  listeners.get('element-probeclick')();assert.equal(created,1);listeners.get('attribute-probeclick')();assert.equal(created,2);
});
check('원문/함수SHA 보존',()=>{for(const [file,bytes] of before)assert(fs.readFileSync(file).equals(bytes));});
process.stdout.write(JSON.stringify({...result,rows,pass:rows.length,fail:0,
  diagnosticSha:crypto.createHash('sha256').update(fs.readFileSync('tools/team-followup-20261001/ITEM/browser-csp/diagnostic.js')).digest('hex'),
  limit:'정적 직접 주입 검사 및 VM 이벤트fixture; CSP enforcement 실제검사는 root. 동적계산/외부확장 주입을 배제하는 완전한 분석 아님'},null,2)+'\n');
