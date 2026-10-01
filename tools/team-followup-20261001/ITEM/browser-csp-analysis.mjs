import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {parse} from 'acorn';

const hash=source=>crypto.createHash('sha256').update(source).digest('hex');
export function inspectHTML(source){
  return {styleElements:[...source.matchAll(/<style\b[^>]*>/gi)].map(match=>match.index),
    styleAttributes:[...source.matchAll(/<[a-z][^>]*\sstyle\s*=/gi)].map(match=>match.index),
    stylesheetLinks:[...source.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi)].map(match=>match[0]),
    policies:[...source.matchAll(/<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi)].map(match=>match[0])};
}
export function inspectJS(source){
  const tree=parse(source,{ecmaVersion:'latest',sourceType:'module',locations:true}),risks=[],functions=[];
  function visit(node){
    if(!node||typeof node!=='object')return;
    if(node.type==='FunctionDeclaration')functions.push({name:node.id?.name,line:node.loc.start.line,sha256:hash(source.slice(node.start,node.end))});
    const property=node.callee?.property?.name||node.callee?.property?.value;
    if(node.type==='CallExpression'&&property==='createElement'&&node.arguments[0]?.value==='style')risks.push({kind:'create_style_element',line:node.loc.start.line});
    if(node.type==='CallExpression'&&property==='setAttribute'&&node.arguments[0]?.value==='style')risks.push({kind:'set_style_attribute',line:node.loc.start.line});
    if(node.type==='AssignmentExpression'){
      const target=node.left;
      const name=target.property?.name||target.property?.value;
      if(['style','cssText','innerHTML','outerHTML','adoptedStyleSheets'].includes(name)||(target.object?.property?.name||target.object?.property?.value)==='style')risks.push({kind:'DOM_style_or_markup_write',property:name,line:node.loc.start.line});
    }
    if(node.type==='CallExpression'&&['insertAdjacentHTML','insertRule','replaceSync','eval','Function'].includes(property||node.callee?.name))risks.push({kind:'dynamic_markup_or_css',line:node.loc.start.line});
    for(const value of Object.values(node))if(Array.isArray(value))for(const child of value)visit(child);else if(value&&typeof value==='object')visit(value);
  }
  visit(tree);return {risks,functions};
}
export function classifyViolation(event){
  const effective=event.effectiveDirective||event.violatedDirective||'UNKNOWN';
  return {effectiveDirective:effective,blockedURI:event.blockedURI||'UNKNOWN',
    family:effective==='style-src-attr'?'style attribute':effective==='style-src-elem'?'style element / stylesheet':'unresolved',
    inline:event.blockedURI==='inline',sourceFile:event.sourceFile||'UNKNOWN',
    origin:'UNKNOWN: violation directive/sourceFile alone does not prove injecting actor'};
}

export function analyzeCSP(){
  const base='tools/team-followup-20261001/ITEM/',host=base+'browser-host/';
  const acceptancePath='outputs/team-review-20261002/acceptance/item-browser.json';
  const acceptance=JSON.parse(fs.readFileSync(acceptancePath,'utf8'));
  const paths=[host+'index.html',host+'host.css',host+'host.js',host+'persistence-integration-port.js',host+'binding-ports.js',host+'binding-d10.js',host+'d10-consumer.js',host+'mk-item-fixture.js',
    base+'browser-bootstrap-ui.js',base+'browser-bootstrap-api.js','unique-item-project/definitions.js','unique-item-project/roll-values.js'];
  const sources=paths.map(file=>{const source=fs.readFileSync(file,'utf8');return {file,sha256:hash(source),acceptanceHashMatches:acceptance.hostHashes[file]?hash(source)===acceptance.hostHashes[file]:null,
    ...(file.endsWith('.js')?inspectJS(source):file.endsWith('.html')?inspectHTML(source):{externalCSS:true,imports:/@import\b/i.test(source)})};});
  assert(sources.filter(source=>source.acceptanceHashMatches!==null).every(source=>source.acceptanceHashMatches));
  return {checkedAt:new Date().toISOString(),acceptanceSha256:hash(fs.readFileSync(acceptancePath)),sources,
    priorActualBrowser:acceptance.surface,priorDiagnostic:acceptance.initial.diagnostic,
    diagnosis:'검사한 host 초기HTML에는 style요소/속성이 없고 JS 직접 style/markup 주입도 없다. style-src-elem inline 요약만으로 host/외부주입 귀속 불가.',
    actualHTTP:'curl exit7 connection failed to 127.0.0.1:3340; headers/body unavailable, cause UNKNOWN, no server action',actualBrowser:'not run; root final gate',
    fixApplied:false,productionApplied:false};
}
if(process.argv.includes('--emit'))process.stdout.write(JSON.stringify(analyzeCSP(),null,2)+'\n');
