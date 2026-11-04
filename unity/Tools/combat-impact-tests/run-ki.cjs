const toolpaths=require('../_shared/toolpaths.cjs');
// Ki presentation regression: Roslyn only; no Unity, browser or external writes.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../../..'),out=path.join(root,'tools/combat-impact-check/ki');
fs.mkdirSync(out,{recursive:true});
const latest=p=>fs.readdirSync(p).filter(x=>/^\d/.test(x)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})).at(-1);
const pack=toolpaths.refRoot(),sdk=toolpaths.sdkRoot();
const ref=path.join(pack,latest(pack),'ref'),tfm=fs.readdirSync(ref).at(-1),files=[path.join(__dirname,'KiPresentationTests.cs')];
const source=fs.readFileSync(path.join(root,'unity/Assets/Exoduser/Runtime/KiImpactView.cs'),'utf8');
const start=source.indexOf('    public static class KiImpactPresentation'),end=source.indexOf('    public sealed class KiImpactView');
if(start>=0){const p=path.join(out,'KiImpactPresentation.cs');fs.writeFileSync(p,'using System;namespace Exoduser.UnityPort {\n'+source.slice(start,end)+'\n}');files.push(p);}
const impact=fs.readFileSync(path.join(root,'unity/Assets/Exoduser/Runtime/NativeGame.Impact.cs'),'utf8');
const native=fs.readFileSync(path.join(root,'unity/Assets/Exoduser/Runtime/NativeGame.cs'),'utf8');
const slash=fs.readFileSync(path.join(root,'unity/Assets/Exoduser/Runtime/KiSlashView.cs'),'utf8');
const wiring=[
 ['real crescent uses short alpha policy',/KiImpactPresentation\.TrailAlpha\(age\)/.test(slash)],
 ['real crescent uses thin front edge',/KiImpactPresentation\.TrailThickness/.test(slash)],
 ['real crescent caps body opacity',/KiImpactPresentation\.BodyAlpha\(age\)/.test(slash)],
 ['native camera includes Ki feedback amplitude',/impacts\.CameraOffset\(Simulation\.TickCount\)/.test(native)],
 ['3D marker and flat projection share Ki contact camera',/KiContactCameraOffset\(\)/.test(impact)],
 ['spark spawning uses event charge scale',/SparkCount\(e\.Step,e\.Scale\)/.test(source)]
];
const core=path.join(out,'FeedbackStub.cs');fs.writeFileSync(core,'namespace Exoduser.UnityPort.Core {}');files.push(core);
const env={...process.env,DOTNET_CLI_HOME:out,DOTNET_CLI_TELEMETRY_OPTOUT:'1',DOTNET_SKIP_FIRST_TIME_EXPERIENCE:'1'};
const run=args=>toolpaths.spawnSync(toolpaths.dotnet(),args,{cwd:root,encoding:'utf8',windowsHide:true,env,timeout:60000,stdio:['ignore','pipe','pipe']});
let r=run([path.join(sdk,latest(sdk),'Roslyn/bincore/csc.dll'),'/nologo','/target:exe','/out:'+path.join(out,'checks.dll'),...fs.readdirSync(path.join(ref,tfm)).filter(f=>f.endsWith('.dll')).map(f=>'/r:'+path.join(ref,tfm,f)),...files]);
let log=(r.stdout||'')+(r.stderr||'')+(r.error?.message||'');
if(r.status===0){fs.writeFileSync(path.join(out,'checks.runtimeconfig.json'),JSON.stringify({runtimeOptions:{tfm,framework:{name:'Microsoft.NETCore.App',version:tfm.slice(3)+'.0'},rollForward:'LatestMajor'}}));r=run([path.join(out,'checks.dll')]);log+=(r.stdout||'')+(r.stderr||'')+(r.error?.message||'');}
// Measure the original additive RGB sheet; this is not a Player brightness test.
function sheetMeasurements(){
 const png=fs.readFileSync(path.join(root,'unity/Assets/Exoduser/Resources/Art/vfx/ki_slash_hit_silver_sheet.png'));
 const width=png.readUInt32BE(16),height=png.readUInt32BE(20),channels=3;
 if(width!==1254||height!==1254||png[24]!==8||png[25]!==2||png[28]!==0)throw Error('Unexpected original Ki hit PNG format');
 const chunks=[];
 for(let offset=8;offset<png.length;){const length=png.readUInt32BE(offset);if(png.toString('ascii',offset+4,offset+8)==='IDAT')chunks.push(png.subarray(offset+8,offset+8+length));offset+=length+12;}
 const raw=require('node:zlib').inflateSync(Buffer.concat(chunks)),stride=width*channels,pixels=Buffer.alloc(height*stride);
 const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
 for(let y=0;y<height;y++){
  const filter=raw[y*(stride+1)];if(filter>4)throw Error('Invalid PNG filter');
  for(let x=0;x<stride;x++){
   const a=x>=channels?pixels[y*stride+x-channels]:0,b=y?pixels[(y-1)*stride+x]:0,c=y&&x>=channels?pixels[(y-1)*stride+x-channels]:0;
   pixels[y*stride+x]=(raw[y*(stride+1)+x+1]+(filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):paeth(a,b,c)))&255;
  }
 }
 const frames=[];
 for(let f=0;f<4;f++){
  let totalLuma=0,peak=0,over240=0;
  for(let y=0;y<627;y++)for(let x=0;x<627;x++){
   const i=((Math.floor(f/2)*627+y)*width+(f%2*627+x))*channels;
   const luma=.299*pixels[i]+.587*pixels[i+1]+.114*pixels[i+2];totalLuma+=luma;peak=Math.max(peak,luma);if(luma>=240)over240++;
  }
  frames.push({frame:f,totalLuma:Math.round(totalLuma),peak,over240});
 }
 fs.writeFileSync(path.join(out,'sheet-measurements.json'),JSON.stringify({method:'Original RGB texel luminance, top-left row-major cells; Player unverified',frames},null,2));
 return frames;
}
const frames=sheetMeasurements();
wiring.push(['original hit sheet peak is cell one, shown at contact +3 ticks',frames[0].totalLuma>0&&frames[1].totalLuma===Math.max(...frames.map(f=>f.totalLuma))]);
let wiringFailures=0;for(const [name,passed] of wiring){if(!passed){log+='FAIL '+name+'\n';wiringFailures++;}}
log+='ki-wiring: '+wiring.length+' checks, '+wiringFailures+' failures\n';
if(wiringFailures&&r.status===0)r.status=1;
fs.writeFileSync(path.join(out,process.argv.includes('--red')?'red.log':'checks.log'),log);process.stdout.write(log);process.exitCode=r.status??1;
