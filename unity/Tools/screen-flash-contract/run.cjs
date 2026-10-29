// 실제 Unity OnGUI 문장을 C#으로 컴파일하고 실행한 웹 원본 합성과 대조한다.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const vm = require('node:vm');
const index = process.argv.indexOf('--out');
if (index < 0 || !process.argv[index + 1]) throw new Error('--out I:/... 필수');
const out = path.resolve(process.argv[index + 1]);
if (!/^I:[\\/]/i.test(out)) throw new Error('출력은 I 드라이브만 허용');
const project = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(project, 'Assets/Exoduser/Runtime/NativeGame.cs'), 'utf8');
const branch = source.split(/\r?\n/).find(s => s.includes('if(Simulation.ScreenFlashAlpha>0)Fill('));
if (!branch || !branch.trim().endsWith(';')) throw new Error('실제 OnGUI 화면 플래시 문장을 찾지 못함');
const oracle = JSON.parse(fs.readFileSync(path.join(__dirname, 'web-oracle.json'), 'utf8'));
const cases = [0, .25, .232, .034, .016, -.1].map(alpha => {
  const observed = [];
  const X = {globalAlpha: 1, fillStyle: '', fillRect() {
    const rgba = this.fillStyle.match(/rgba\(([^)]+)\)/)[1].split(',').map(Number);
    observed.push({r: rgba[0] / 255, g: rgba[1] / 255, b: rgba[2] / 255, a: rgba[3] * this.globalAlpha});
  }};
  const context = vm.createContext({X, C: {width: 1600, height: 900}, _dtSp: 1});
  vm.runInContext(oracle['설정문'], context);
  context.scrFlashA = alpha;
  vm.runInContext(oracle['그리기문'], context);
  return {alpha, observed};
});
fs.mkdirSync(out, {recursive: true});
const rows = cases.map(c => '{' + c.alpha + 'f,' + (c.observed[0]?.a || 0) + 'f,' + c.observed.length + 'f}').join(',');
const program = `using System;
using System.Collections.Generic;
class Color { public float r,g,b,a; public Color(float r,float g,float b,float a){this.r=r;this.g=g;this.b=b;this.a=a;} }
class Rect { public Rect(float x,float y,float w,float h){} }
class State { public float ScreenFlashAlpha; }
class Program {
 static State Simulation=new State(); static List<Color> fills=new List<Color>();
 static void Fill(Rect r,Color c){fills.Add(c);}
 static void Draw(){${branch.trim()}}
 static int Main(){Console.OutputEncoding=System.Text.Encoding.UTF8;int checks=0,failed=0;float[,] rows={${rows}};
  for(int n=0;n<rows.GetLength(0);n++){Simulation.ScreenFlashAlpha=rows[n,0];fills.Clear();Draw();
   checks++;if(fills.Count!=(int)rows[n,2]){failed++;Console.WriteLine("FAIL 그리기 횟수 alpha="+rows[n,0]);}
   if(fills.Count>0){checks++;if(Math.Abs(fills[0].a-rows[n,1])>0.000001f){failed++;Console.WriteLine("FAIL 합성 알파 입력="+rows[n,0]+" 웹="+rows[n,1]+" Unity="+fills[0].a);}
    checks++;if(Math.Abs(fills[0].r-200f/255)>0.000001f||fills[0].g!=0||fills[0].b!=0){failed++;Console.WriteLine("FAIL 색상 변경");}}
   checks++;if(Simulation.ScreenFlashAlpha!=rows[n,0]){failed++;Console.WriteLine("FAIL Core 알파 변경");}
  }Console.WriteLine("검사="+checks+" 실패="+failed);return failed>0?1:0;
 }
}`;
fs.writeFileSync(path.join(out, 'Program.cs'), program);
const options = {cwd: project, windowsHide: true, encoding: 'utf8', timeout: 120000, env: {
  ...process.env, DOTNET_CLI_HOME: path.join(out, 'dotnet-home'), DOTNET_ADD_GLOBAL_TOOLS_TO_PATH: 'false',
  DOTNET_NOLOGO: '1', DOTNET_SKIP_FIRST_TIME_EXPERIENCE: '1'
}};
const dotnet = 'C:/Program Files/dotnet/dotnet.exe';
// 외부 패키지·NuGet 복원 없이 설치된 .NET 8 참조팩으로 실제 문장만 컴파일한다.
const packRoot = 'C:/Program Files/dotnet/packs/Microsoft.NETCore.App.Ref';
const version = fs.readdirSync(packRoot).filter(x => x.startsWith('8.')).sort((a,b) => a.localeCompare(b, undefined, {numeric:true})).at(-1);
if (!version) throw new Error('.NET 8 참조팩 없음');
const ref = path.join(packRoot, version, 'ref/net8.0');
const binary = path.join(out, 'Contract.dll');
const references = fs.readdirSync(ref).filter(x => x.endsWith('.dll')).map(x => '-r:' + path.join(ref, x));
let r = cp.spawnSync(dotnet, ['C:/Program Files/dotnet/sdk/8.0.301/Roslyn/bincore/csc.dll', '-nologo', '-target:exe', '-out:' + binary, ...references, path.join(out, 'Program.cs')], options);
let log = (r.stdout || '') + (r.stderr || '');
const compiled = r.status === 0;
if (compiled) {
  fs.writeFileSync(path.join(out, 'Contract.runtimeconfig.json'), JSON.stringify({runtimeOptions:{tfm:'net8.0',framework:{name:'Microsoft.NETCore.App',version:'8.0.0'}}}));
  r = cp.spawnSync(dotnet, [binary], options);
  log += (r.stdout || '') + (r.stderr || '');
}
const counts = log.match(/검사=(\d+) 실패=(\d+)/);
const result = {범위: '실제 OnGUI 한 문장 C# 컴파일 및 실행. Unity 전체 컴파일·Player 아님',
  검사: counts ? Number(counts[1]) : null, 실패: counts ? Number(counts[2]) : null,
  원본: oracle['원본blob'], 웹기준: oracle['웹기준'], compiled, status: r.status, error: r.error?.message, cases, log};
fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
process.exitCode = r.status ?? 1;
