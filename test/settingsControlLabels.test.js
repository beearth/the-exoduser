import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const code = fs.readFileSync(new URL('../ui-panels.js', import.meta.url), 'utf8');
const source = code.slice(code.indexOf('  function describeSettingsControls('), code.indexOf('  function settings('));
function fixture({nestedName=false,nestedValue=false,labelled=false}={}) {
  const node = (children=[]) => ({children,attributes:{},id:'',setAttribute(k,v){this.attributes[k]=v;},hasAttribute(k){return k in this.attributes;}});
  const name=node(nestedName?[node()]:[]), value=node(nestedValue?[node()]:[]);
  name.textContent='음량';value.textContent='70%';
  const row={querySelector:selector=>selector==='.set-name'?name:value};
  const control=node();control.id='optSfx';control.closest=()=>row;
  if(labelled)control.setAttribute('aria-label','Custom volume');
  const message=node(),preset={classList:{add(v){this.value=v;}}};
  const root={querySelectorAll:()=>[control],querySelector:selector=>selector==='#saveMsg'?message:preset};
  vm.runInNewContext(source+'\ndescribeSettingsControls(root);',{root});
  return {name,value,control,message,preset};
}
test('settings range is named by the existing translated leaf and describes its live readout',()=>{
  const {name,value,control}=fixture();
  assert.equal(control.attributes['aria-labelledby'],name.id);
  assert.equal(control.attributes['aria-describedby'],value.id);
  name.textContent='Volume';value.textContent='80%';
  assert.equal(name.id,'settings-label-optSfx');
  assert.equal(value.id,'settings-value-optSfx');
});
test('explicit names and nested DOM are preserved',()=>{
  assert.equal(fixture({labelled:true}).control.attributes['aria-labelledby'],undefined);
  assert.equal(fixture({nestedName:true}).control.attributes['aria-labelledby'],undefined);
  assert.equal(fixture({nestedValue:true}).control.attributes['aria-describedby'],undefined);
});
test('preset feedback is a polite atomic status and its heading uses the shared style',()=>{
  const {message,preset}=fixture();
  assert.deepEqual(message.attributes,{'role':'status','aria-live':'polite','aria-atomic':'true'});
  assert.equal(preset.classList.value,'set-label');
});
