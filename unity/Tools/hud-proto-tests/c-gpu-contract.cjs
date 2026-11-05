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
// Use the project's installed Unity 6000.6.7f1 includes in both color-space branches.
// This is an explicit SM5/D3D11 offline fixture, not Unity's target selection or Metal output.
const out=path.join(root,'unity/Library/HudProtoTests');fs.mkdirSync(out,{recursive:true});
const hlsl=shader.split('CGPROGRAM')[1].split('ENDCG')[0].replace(/^\s*#pragma.*$/gm,'');
const input=path.join(out,'H8-contract.hlsl');fs.writeFileSync(input,hlsl);
const compiler=process.env.EXO_FXC||'C:/Program Files (x86)/Windows Kits/10/bin/10.0.26100.0/x64/fxc.exe';
const includes=process.env.EXO_UNITY_CGINCLUDES||'G:/unity/Editor/6000.6.7f1/Editor/Data/Resources/CGIncludes';
check(fs.existsSync(compiler),'FXC is required for this Windows offline regression (EXO_FXC overrides path)');
for(const file of ['UnityCG.cginc','UnityShaderVariables.cginc','HLSLSupport.cginc','UnityShaderUtilities.cginc','UnityInstancing.cginc'])
 check(fs.existsSync(path.join(includes,file)),'actual Unity include is required: '+file+' (EXO_UNITY_CGINCLUDES overrides directory)');
const binaries=[];
for(const colorSpace of ['Gamma','Linear']){
 const binary=path.join(out,'H8-contract-'+colorSpace+'.dxbc'),assembly=path.join(out,'H8-contract-'+colorSpace+'.asm');
 const args=['/nologo','/Gec','/T','ps_5_0','/E','frag','/I',includes,
  '/D','SHADER_API_D3D11=1','/D','SHADER_API_DESKTOP=1','/D','SHADER_TARGET=50','/D','SHADER_STAGE_FRAGMENT=1'];
 // The source uses #ifndef, so defining UNITY_COLORSPACE_GAMMA=0 would still select Gamma.
 if(colorSpace==='Gamma')args.push('/D','UNITY_COLORSPACE_GAMMA=1');
 args.push('/Fo',binary,'/Fc',assembly,input);
 const compiled=cp.spawnSync(compiler,args,{windowsHide:true,encoding:'utf8',maxBuffer:8*1024*1024});
 check(compiled.status===0,'FXC '+colorSpace+' production fragment compile: '+compiled.stdout+compiled.stderr);
 const reflected=fs.readFileSync(assembly,'utf8');
 for(const name of ['EmptyCenterAlpha','EmptyEdgeAlpha','SurfaceSoftPixels','SurfaceWavePixels'])
  check(!new RegExp('//\\s+float '+name+';').test(reflected),colorSpace+': '+name+' is absent from external constant buffer reflection');
 check(/float _Mode;/.test(reflected)&&/float _Mana;/.test(reflected),colorSpace+': reflection still contains intended runtime inputs');
 binaries.push(fs.readFileSync(binary));console.log('FXC '+colorSpace+' PASS; Unity includes '+includes);
}
check(!binaries[0].equals(binaries[1]),'Gamma and Linear compile to different programs');
console.log('PASS '+checks+' C static-constant/FXC Gamma+Linear/direct-alpha contracts (Metal values unobserved)');
