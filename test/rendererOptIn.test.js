import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('game.html','utf8');
const start=source.indexOf('async function _bootRenderer(){');
const end=source.indexOf('//  [S03] CONFIG',start);
assert.ok(start>=0&&end>start);
async function boot({search='',mac=true,electron=false,gpu=true,gpuOK=true,glOK=true}={}){
  const calls=[],logs=[];
  const c={IS_MAC:mac,IS_ELECTRON:electron,navigator:gpu?{gpu:{}}:{},location:{search},URLSearchParams,
    console:{log:(...v)=>logs.push(v.join(' ')),error:()=>{}},
    _useGPU:false,_useGL:false,_hwGPU:'test adapter',GPU:null,GL:null,X:null,
    C:{getContext:()=>({})},_buildProxyX(){c.X={};},_initBurstSystem(){},
    async _initWebGPU(){calls.push('WebGPU');c._useGPU=gpu&&gpuOK;return c._useGPU;},
    _initWebGL(){calls.push('WebGL2');c._useGL=glOK;return glOK;}};
  vm.createContext(c);await vm.runInContext(source.slice(start,end)+'\n_bootRenderer()',c);
  return {calls,logs};
}
for(const [name,options,expected] of [
  ['Mac with navigator.gpu defaults to WebGL2',{},['WebGL2']],
  ['Mac webgpu=0 bypasses WebGPU',{search:'?webgpu=0'},['WebGL2']],
  ['Mac webgpu=1 opts in',{search:'?webgpu=1'},['WebGPU']],
  ['Mac webgpu=true does not opt in',{search:'?webgpu=true'},['WebGL2']],
  ['Windows defaults to WebGL2',{mac:false},['WebGL2']],
  ['Windows explicit opt in',{mac:false,search:'?webgpu=1'},['WebGPU']],
  ['Unavailable WebGPU falls back',{search:'?webgpu=1',gpu:false},['WebGPU','WebGL2']],
  ['Failed WebGPU init falls back',{search:'?webgpu=1',gpuOK:false},['WebGPU','WebGL2']],
  ['Electron retains WebGL2',{electron:true,search:'?webgpu=1'},['WebGL2']],
])test(name,async()=>assert.deepEqual((await boot(options)).calls,expected));
test('summary reports actual fallback renderer',async()=>{
  const {logs}=await boot({search:'?webgpu=1',gpuOK:false});
  assert.ok(logs.some(v=>v.startsWith('[GPU] WebGL2 |')));
  assert.ok(!logs.some(v=>v.startsWith('[GPU] WebGPU |')));
});
test('summary reports Canvas2D if GL is unavailable',async()=>{
  const {logs}=await boot({gpu:false,glOK:false});
  assert.ok(logs.some(v=>v.startsWith('[GPU] Canvas2D |')));
});
