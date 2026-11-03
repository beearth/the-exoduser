// Actual NativeUiSounds behavior; Unity device is replaced. Player buffer QA remains separate.
const fs=require('fs'),cp=require('child_process'),path=require('path');
const out=process.argv[2];if(!out||!path.isAbsolute(out))throw Error('absolute output required');fs.mkdirSync(out,{recursive:true});
const rt=path.resolve(__dirname,'../../Assets/Exoduser/Runtime');
fs.writeFileSync(out+'/Harness.cs',String.raw`
using System;using System.Collections.Generic;using System.Reflection;using UnityEngine;using Exoduser.UnityPort;
namespace UnityEngine {
 public class MonoBehaviour{} public class DefaultExecutionOrder:Attribute{public DefaultExecutionOrder(int i){}}
 public struct Vector2{public float x,y;public Vector2(float x,float y){this.x=x;this.y=y;}public override string ToString()=>x+","+y;}
 public struct Rect{public Vector2 position,size;public Rect(float x,float y,float w,float h){position=new Vector2(x,y);size=new Vector2(w,h);}public bool Contains(Vector2 p)=>p.x>=position.x&&p.x<position.x+size.x&&p.y>=position.y&&p.y<position.y+size.y;}
 public enum EventType{MouseMove,Repaint} public class Event{public static Event current=new Event();public EventType type;public Vector2 mousePosition;}
 public static class GUI{public static bool enabled=true;}public static class GUIUtility{public static Vector2 GUIToScreenPoint(Vector2 p)=>p;}
 public static class Time{public static double realtimeSinceStartupAsDouble;public static int frameCount;}
}
namespace Exoduser.UnityPort {
 public class NativeFeedbackAudio{public int UiRevision;public List<string> Keys=new List<string>();public float Gain,Pitch;public void PlayUiSample(string k,float g,float p=1,bool exactPitch=false){UiRevision++;Keys.Add(k);Gain=g;Pitch=p;}public void PlayUiTab(){PlayUiSample("ui_tab",.22f);}}
 public static class NativeDecisionSound{public static int LastDecisionFrame=-1;}
}
class Tests{
 static int checks,failed;static bool allowed=true;static bool lobby=true;static NativeFeedbackAudio sound;static NativeUiSounds ui;
 static void Check(string id,bool ok){checks++;if(!ok){failed++;Console.WriteLine("FAIL "+id);}}
 static void Call(string n){typeof(NativeUiSounds).GetMethod(n,BindingFlags.NonPublic|BindingFlags.Instance).Invoke(ui,null);}
 static void Start(){sound=new NativeFeedbackAudio();ui=new NativeUiSounds();var m=typeof(NativeUiSounds).GetMethod("Initialize",BindingFlags.NonPublic|BindingFlags.Instance);m.Invoke(ui,m.GetParameters().Length==3?new object[]{sound,(Func<bool>)(()=>allowed),(Func<bool>)(()=>lobby)}:new object[]{sound,(Func<bool>)(()=>allowed)});Time.realtimeSinceStartupAsDouble=10;Time.frameCount=100;NativeDecisionSound.LastDecisionFrame=-1;GUI.enabled=true;}
 static void Move(float x){Event.current.type=EventType.MouseMove;Event.current.mousePosition=new Vector2(x,10);Call("OnGUI");ui.BeforeButton(new Rect(0,0,20,20),"a");ui.BeforeButton(new Rect(30,0,20,20),"b");}
 static void Tick(double dt){Time.realtimeSinceStartupAsDouble+=dt;Time.frameCount++;Call("LateUpdate");}
 static void Navigate(string id){var m=typeof(NativeUiSounds).GetMethod("Navigate",BindingFlags.NonPublic|BindingFlags.Instance);Check("navigation callback exists",m!=null);m?.Invoke(ui,new object[]{id});}
 static void Own(Action action){var m=typeof(NativeUiSounds).GetMethod("OwnSoundButton",BindingFlags.NonPublic|BindingFlags.Static);Check("own sound guard exists",m!=null);if(m!=null)m.Invoke(null,new object[]{(Func<bool>)(()=>{action();return true;})});}
 static int Main(){
 Start();Move(10);Check("lobby hover uses web gain .6",Math.Abs(sound.Gain-.6f)<.00001);Move(10);Check("same hover once",sound.Keys.Count==1);
 Tick(.01);Move(40);Check("60ms hover throttle",sound.Keys.Count==1);Tick(.051);Check("latest hover eventually audible",sound.Keys.Count==2);
 Start();Move(10);Tick(.01);Move(40);Move(80);Tick(.1);Check("leaving cancels delayed hover",sound.Keys.Count==1);
 Start();GUI.enabled=false;Move(10);Check("disabled silent",sound.Keys.Count==0);GUI.enabled=true;allowed=false;Move(10);ui.Clicked();Tick(.1);Check("blur silent",sound.Keys.Count==0);allowed=true;
 Start();ui.Clicked();Tick(.02);Check("ordinary confirm once",sound.Keys.Count==1&&sound.Keys[0]=="ui_button_confirm"&&Math.Abs(sound.Gain-.35f)<.00001);ui.Clicked();Tick(.02);Check("80ms confirm throttle",sound.Keys.Count==1);
 Start();ui.Clicked();NativeDecisionSound.LastDecisionFrame=Time.frameCount;Tick(.02);Check("decision suppresses confirm",sound.Keys.Count==0);
 Start();Own(()=>ui.Clicked());Tick(.1);Check("own sound has no generic confirm even without decision",sound.Keys.Count==0);
 Start();Navigate("title:1");Navigate("title:1");Check("keyboard pad navigation one hover",sound.Keys.Count==1&&Math.Abs(sound.Gain-.6f)<.00001);
 Start();lobby=false;Move(10);Check("combat hover remains .25",Math.Abs(sound.Gain-.25f)<.00001);lobby=true;
 Console.WriteLine("checks="+checks+" failed="+failed);return failed==0?0:2;
 }}
`);
const sdk='G:/unity/Editor/6000.6.7f1/Editor/Data/DotNetSdk';const refs=fs.readdirSync(sdk+'/packs/Microsoft.NETCore.App.Ref/8.0.21/ref/net8.0').filter(x=>x.endsWith('.dll')).map(x=>'-r:"'+sdk+'/packs/Microsoft.NETCore.App.Ref/8.0.21/ref/net8.0/'+x+'"');
fs.writeFileSync(out+'/test.rsp',['-nologo','-nostdlib+','-target:exe','-out:"'+out+'/test.dll"',...refs,'"'+out+'/Harness.cs"','"'+rt+'/NativeUiSounds.cs"'].join('\n'));
const opts={encoding:'utf8',windowsHide:true};let r=cp.spawnSync(sdk+'/dotnet.exe',[sdk+'/sdk/8.0.318/Roslyn/bincore/csc.dll','@'+out+'/test.rsp'],opts);if(r.status!==0){console.log(r.stdout+r.stderr);process.exit(r.status||3);}
fs.writeFileSync(out+'/test.runtimeconfig.json',JSON.stringify({runtimeOptions:{tfm:'net8.0',framework:{name:'Microsoft.NETCore.App',version:'8.0.21'}}}));r=cp.spawnSync(sdk+'/dotnet.exe',[out+'/test.dll'],opts);fs.writeFileSync(out+'/result.txt',r.stdout+r.stderr);console.log(r.stdout+r.stderr);process.exitCode=r.status||0;
