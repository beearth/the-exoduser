// Compile exact source method bodies, with deterministic measurement/paint sinks.
// This exercises translation order and locale changes without Unity or a Player.
const fs=require('fs'),path=require('path'),cp=require('child_process');
const root=path.resolve(__dirname,'../..'),out=path.resolve(process.argv[2]),cache=path.join(out,'renderer-cache');
fs.mkdirSync(cache,{recursive:true});
function method(file,name){const s=fs.readFileSync(path.join(root,'Assets/Exoduser/Runtime',file),'utf8'),at=s.indexOf(name);if(at<0)throw Error('Missing method '+name);let start=s.lastIndexOf('\n',at)+1,open=s.indexOf('{',at),depth=1,i=open+1;for(;i<s.length&&depth;i++){if(s[i]==='{')depth++;if(s[i]==='}')depth--;}return s.slice(start,i).replace(/^(\s*)(float|void) /,'$1public $2 ');}
const header='using System;using System.Collections.Generic;using UnityEngine;namespace Exoduser.UnityPort {',fields='public string LocaleCode="ko";';
let source=header+'class SkillsProbe {'+fields+'GUIStyle Style(Font f,int size,FontStyle fs)=>new GUIStyle();'+['float Width(','void Text('].map(n=>method('NativeSkills.cs',n)).join('\n')+'}\n';
source+='class InventoryProbe {'+fields+'GUIStyle SerifStyle(int size,bool bold)=>new GUIStyle();'+['float SerifWidth(','void Serif('].map(n=>method('NativeInventoryOssuary.cs',n)).join('\n')+'}\n';
source+='class ForgeProbe {'+fields+'public enum F {NM,Sans,SansSemi}GUIStyle Style(F f,int size,bool bold,bool italic)=>new GUIStyle();int Px(float s)=>(int)s;Rect Off(Rect r)=>r;'+['float Meas(','float Txt('].map(n=>method('NativeForgePanel.cs',n)).join('\n')+'}}';
fs.writeFileSync(cache+'/Renderers.cs',source);
const files=[cache+'/Renderers.cs',__dirname+'/RendererTests.cs',root+'/Assets/Exoduser/Runtime/NativeLocaleCatalog.cs',root+'/Assets/Exoduser/Runtime/NativeUiTextRun.cs',root+'/Assets/Exoduser/Runtime/Core/SaveJson.cs',root+'/Assets/Exoduser/Runtime/Core/LobbyLanguage.cs'];
fs.writeFileSync(cache+'/Checks.csproj','<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net10.0</TargetFramework><EnableDefaultCompileItems>false</EnableDefaultCompileItems><NuGetAudit>false</NuGetAudit></PropertyGroup><ItemGroup>'+files.map(f=>'<Compile Include="'+f.replaceAll('&','&amp;')+'"/>').join('')+'</ItemGroup></Project>');
fs.writeFileSync(cache+'/NuGet.Config','<configuration><packageSources><clear/></packageSources></configuration>');
const opts={encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','pipe'],env:{...process.env,DOTNET_CLI_HOME:out+'/dotnet-home',DOTNET_CLI_TELEMETRY_OPTOUT:'1',DOTNET_SKIP_FIRST_TIME_EXPERIENCE:'1'}};
let r=cp.spawnSync('dotnet',['build',cache+'/Checks.csproj','--verbosity','quiet','--configfile',cache+'/NuGet.Config','-p:UseSharedCompilation=false'],opts);fs.writeFileSync(out+'/renderer-build.log',(r.stdout||'')+(r.stderr||''));
if(r.status!==0){console.error(r.stdout||r.stderr||r.error);process.exit(r.status??1);}
r=cp.spawnSync('dotnet',[cache+'/bin/Debug/net10.0/Checks.dll',root+'/Assets/Exoduser/Resources'],opts);fs.writeFileSync(out+'/'+(process.argv[3]||'renderer-tests')+'.log',(r.stdout||'')+(r.stderr||''));console.log(r.stdout||r.stderr||r.error);process.exit(r.status??1);
