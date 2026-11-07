const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const project=path.resolve(__dirname,'../..'),out=path.join(project,'Library/FieldScaleNavigation');fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(project,'Assets/Exoduser/Runtime/NativeGame.FullRunQa.cs'),'utf8');
const start=source.indexOf('sealed class FullRunNavigation');let end=source.indexOf('{',start),depth=1;while(depth){end++;if(source[end]==='{')depth++;else if(source[end]==='}')depth--;}
const nav=source.slice(start,end+1);
const stub=`using System;using System.Collections.Generic;
struct Vector2 {public float x,y;public Vector2(float x,float y){this.x=x;this.y=y;}public static Vector2 zero=>new Vector2();public static Vector2 operator -(Vector2 a,Vector2 b)=>new Vector2(a.x-b.x,a.y-b.y);public static float SqrMagnitude(Vector2 v)=>v.x*v.x+v.y*v.y;public static float Distance(Vector2 a,Vector2 b)=>(float)Math.Sqrt(SqrMagnitude(a-b));}
static class Mathf {public static int Clamp(int v,int a,int b)=>Math.Clamp(v,a,b);public static float Abs(float v)=>Math.Abs(v);public static float Sign(float v)=>Math.Sign(v);}
class Program {static int Main(){var c=typeof(FullRunNavigation).GetConstructor(new[]{typeof(int)});var nav=c==null?new FullRunNavigation():(FullRunNavigation)c.Invoke(new object[]{310});float x=6030,y=11130;
Func<float,float,float,bool> pass=(a,b,r)=>a>=r&&a<12000-r&&b>=r&&b<12000-r&&!(b+r>10400&&b-r<10600&&a-r<7500);
for(int t=0;t<1800;t++){var v=nav.Direction(x,y,3510,10050,15,pass,t);if(pass(x+v.x*6,y+v.y*6,15)){x+=v.x*6;y+=v.y*6;}if(Vector2.Distance(new Vector2(x,y),new Vector2(3510,10050))<40){Console.WriteLine("expanded route reached");return 0;}}
Console.WriteLine("expanded route blocked "+x+","+y);return 1;}}
`;
fs.writeFileSync(path.join(out,'Program.cs'),stub+nav);
fs.writeFileSync(path.join(out,'Checks.csproj'),'<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net8.0</TargetFramework></PropertyGroup></Project>');
const r=cp.spawnSync('G:/unity/Editor/6000.6.7f1/Editor/Data/DotNetSdk/dotnet.exe',['run','--project',path.join(out,'Checks.csproj'),'-p:NuGetAudit=false','-p:UseSharedCompilation=false'],{encoding:'utf8',windowsHide:true,env:{...process.env,DOTNET_CLI_HOME:path.join(project,'Library/FieldScaleDotnet')}});
console.log(r.stdout||'',r.stderr||'');assert.equal(r.status,0,'expanded navigation must reach the southern target');
