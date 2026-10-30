// 실제 셰이더의 색 분기만 실행한다. 최종 GPU/1x 판정은 이 수치 검사와 별도다.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const shader=fs.readFileSync(path.resolve(__dirname,'../../Assets/Exoduser/Resources/Shaders/DruidProjectile.shader'),'utf8');
const block=shader.slice(shader.indexOf('float3 dark='),shader.indexOf('float alpha='));
assert(block.includes('float3 body=')&&block.includes('float3 glow='),'실제 색 분기를 찾음');
const executable=block.replace(/float3\s+/g,'let ').replace(/float3\(/g,'V(')+'\n({body,glow});';
let checks=0;
for(const ridge of [0,.5,1]){
  const evaluate=(thorn,friendly)=>vm.runInNewContext(executable,{_Thorn:thorn,_Friendly:friendly,ridge,V:(...x)=>x,lerp:(a,b,t)=>a.map((n,i)=>n+(b[i]-n)*t)});
  const thorn=evaluate(1,0),poison=evaluate(0,0),reflected=evaluate(1,1);
  assert(thorn.body[0]>thorn.body[1]&&thorn.body[1]>thorn.body[2],'물리 가시 핵/능선은 수피 갈색 R>G>B');checks++;
  assert(thorn.glow[1]>thorn.glow[0]&&thorn.glow[0]>thorn.glow[2],'물리 가시 가장자리는 국소 황록광');checks++;
  assert(poison.body[1]>poison.body[0]&&poison.body[0]>poison.body[2],'마법 독 핵은 녹색');checks++;
  assert(reflected.body[2]>reflected.body[1]&&reflected.body[1]>reflected.body[0],'반사탄은 물리 속성보다 청색 구분이 우선');checks++;
}
console.log('셰이더 색 검사='+checks+' 실패=0');
// 실제 젖은 표면 식을 격자에서 실행한다. HLSL pow의 음수 밑수는 NaN이다.
const wetBlock=shader.slice(shader.lastIndexOf('float2 wetUV=' )>=0?shader.lastIndexOf('float2 wetUV='):shader.indexOf('float wet='),shader.indexOf('float veinStrength='));
const wetExecutable=wetBlock.replace(/float2\s+|float\s+/g,'let ').replace(/float2\(/g,'V(')+'\nwet;';
let surfaceChecks=0;
for(let x=-1;x<=1.001;x+=.1)for(let y=-1;y<=1.001;y+=.1){
 const p={x,y};const wet=vm.runInNewContext(wetExecutable,{p,V:(...v)=>v,dot:(a,b)=>a.reduce((s,n,i)=>s+n*b[i],0),exp:Math.exp,pow:(a,b)=>a<0?NaN:Math.pow(a,b)});
 assert(Number.isFinite(wet)&&wet>=0&&wet<=1,'표면 반사광은 전체 UV에서 유한한 [0,1]');surfaceChecks++;
}
console.log('셰이더 표면 유한값 검사='+surfaceChecks+' 실패=0');
