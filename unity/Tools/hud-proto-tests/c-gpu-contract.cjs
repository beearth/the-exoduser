'use strict';
// HLSL storage/reflection and production alpha-expression checks; no Unity/Metal/GPU execution.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..'),dir='unity/Assets/Exoduser/Resources/Shaders/';
const shader=fs.readFileSync(path.join(root,dir+'HudPrototypeC.shader'),'utf8');
let checks=0;const check=(ok,m)=>{checks++;assert.ok(ok,m);};
function globals(text){const program=text.split('CGPROGRAM')[1].split('ENDCG')[0].replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'');let depth=0,result=[];
 for(const line of program.split('\n')){const m=/^\s*(static\s+)?const\s+float\s+(\w+)\s*=\s*([^;]+);/.exec(line);
  if(depth===0&&m)result.push({name:m[2],value:Number(m[3]),static:!!m[1]});depth+=(line.match(/\{/g)||[]).length-(line.match(/\}/g)||[]).length;}return result;}
const cg=globals(shader);check(cg.every(g=>g.static),'every C global design constant must be static const, not an externally supplied uniform');
const ab=globals(fs.readFileSync(path.join(root,dir+'HudPrototype.shader'),'utf8'));
console.log('C globals '+JSON.stringify(cg));console.log('Frozen shared A/B globals (report only) '+JSON.stringify(ab));
check(!shader.includes('EmptyCenterAlpha')&&!shader.includes('EmptyEdgeAlpha'),'opaque bowl alpha has no global value dependency');
check(shader.includes('float3 color=lerp(bowl,liquid,wet);'),'dry RGB directly selects the existing bowl token');
check(shader.includes('return outputColor(float4(color,edge));'),'liquid fragment returns circular coverage alpha directly');
const edgeExpression=shader.match(/float r=length\(d\),edge=([^;]+);/);check(!!edgeExpression,'production circular alpha expression');
const edge=new Function('r','_Diameter','saturate','return '+edgeExpression[1]+';'),sat=x=>Math.max(0,Math.min(1,x));
for(const diameter of [156,175])for(let i=0;i<=100;i++){
 const r=(.5-1/diameter)*i/100;check(edge(r,diameter,sat)===1,'GPU alpha expression is exactly one throughout the interior');
}check(edge(.5,156,sat)===.5&&edge(.5+1/156,156,sat)===0,'only circle perimeter/outside retains AA/transparency');
// Gamma compilation removes Unity-only color conversion calls. A minimal vertex-output struct
// replaces UnityCG; the production fragment and helpers below are otherwise compiled unchanged.
const out=path.join(root,'unity/Library/HudProtoTests');fs.mkdirSync(out,{recursive:true});
const hlsl='struct v2f_img { float4 pos:SV_POSITION; float2 uv:TEXCOORD0; };\n'+shader.split('CGPROGRAM')[1].split('ENDCG')[0].replace(/^\s*#pragma.*$/gm,'').replace(/^\s*#include.*$/gm,'');
const input=path.join(out,'H8-contract.hlsl'),binary=path.join(out,'H8-contract.dxbc'),assembly=path.join(out,'H8-contract.asm');fs.writeFileSync(input,hlsl);
const compiler=process.env.EXO_FXC||'C:/Program Files (x86)/Windows Kits/10/bin/10.0.26100.0/x64/fxc.exe';
check(fs.existsSync(compiler),'FXC is required for this Windows offline regression (EXO_FXC overrides path)');
const compiled=cp.spawnSync(compiler,['/nologo','/Gec','/T','ps_5_0','/E','frag','/D','UNITY_COLORSPACE_GAMMA=1','/Fo',binary,'/Fc',assembly,input],{windowsHide:true,encoding:'utf8',maxBuffer:8*1024*1024});
check(compiled.status===0,'FXC production fragment compile: '+compiled.stdout+compiled.stderr);
const reflected=fs.readFileSync(assembly,'utf8');
for(const name of ['EmptyCenterAlpha','EmptyEdgeAlpha','SurfaceSoftPixels','SurfaceWavePixels'])check(!new RegExp('//\\s+float '+name+';').test(reflected),name+' is absent from external constant buffer reflection');
check(/float _Mode;/.test(reflected)&&/float _Mana;/.test(reflected),'reflection still contains intended runtime inputs');
console.log('PASS '+checks+' C static-constant/FXC-reflection/direct-alpha contracts (Metal values unobserved)');
