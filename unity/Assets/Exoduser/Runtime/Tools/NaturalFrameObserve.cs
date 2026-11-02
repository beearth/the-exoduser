using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using UnityEngine;

namespace Exoduser.UnityPort.Tools {
// Read-only observer; one MonoBehaviour.Update per rendered frame. No NativeGame edit needed.
public sealed class NaturalFrameObserve : MonoBehaviour {
 const BindingFlags F=BindingFlags.Instance|BindingFlags.Public|BindingFlags.NonPublic;
 [Serializable] public sealed class Frame { public int frame,tick,aliveEnemies; public double realtime; public long utcTicks; public float intervalSeconds; public bool warmup,running,enabled,focused,inArena,settingsOpen; public string playerState,menuPage; }
 [Serializable] public sealed class Report {
  public string source,productSource,inputSession,startedUtc,error;
  public string scope="Time.unscaledDeltaTime once per Unity Update; 10s launch warmup + 60s observation. Includes menus and loading. OS input session label is operator declaration, not input provenance proof. No automatic input or process termination.";
  public string metric="CPU/main-thread frame interval, not GPU completion, OS display cadence or NativeGame.Update duration";
  public bool complete; public int observedFrames; public double p50Ms,p95Ms,maxMs; public List<Frame> frames=new List<Frame>(10000);
 }
 NativeGame game; object menu; FieldInfo menuPage; PropertyInfo settingsOpen; Report report=new Report(); string directory; double start; bool finished;
 static string Arg(string key){var a=Environment.GetCommandLineArgs();int i=Array.IndexOf(a,key);return i>=0&&i+1<a.Length?a[i+1]:"";}
 [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)] static void Boot(){
  var args=Environment.GetCommandLineArgs();if(Array.IndexOf(args,"--unity-natural-frame-observe")<0)return;
  // Observe an ordinary interactive launch only. No fixture/mute/time/graphics policy is set here.
  if(Application.isBatchMode||args.Any(a=>a.StartsWith("--unity-",StringComparison.Ordinal)&&a!="--unity-natural-frame-observe"&&a!="--unity-qa-sandbox")||!Path.IsPathRooted(Arg("-natural-frame-output"))||string.IsNullOrWhiteSpace(Arg("-natural-input-session"))){Debug.LogError("NATURAL_FRAME_OBSERVE requires ordinary GUI launch, exclusive absolute output and declared input session");return;}
  new GameObject("Natural frame interval observer").AddComponent<NaturalFrameObserve>();
 }
 void Start(){
  directory=Arg("-natural-frame-output");if(Directory.Exists(directory)){Debug.LogError("NATURAL_FRAME_OBSERVE output already exists; observer disabled");enabled=false;return;}
  Directory.CreateDirectory(directory);report.startedUtc=DateTime.UtcNow.ToString("O");report.source=Arg("-source-sha");report.productSource=Arg("-product-source-sha");report.inputSession=Arg("-natural-input-session");start=Time.realtimeSinceStartupAsDouble;
 }
 void Update(){
  if(finished||directory==null)return;
  try{
   if(game==null){game=FindAnyObjectByType<NativeGame>();if(game!=null){menu=typeof(NativeGame).GetField("pauseMenu",F)?.GetValue(game);if(menu!=null){menuPage=menu.GetType().GetField("page",F);settingsOpen=menu.GetType().GetProperty("SettingsOpen",F);}}}
   double now=Time.realtimeSinceStartupAsDouble,elapsed=now-start;var sim=game==null?null:game.Simulation;int alive=0;if(sim!=null)foreach(var e in sim.Enemies)if(e.Alive)alive++;
   report.frames.Add(new Frame{frame=Time.frameCount,realtime=now,utcTicks=DateTime.UtcNow.Ticks,intervalSeconds=Time.unscaledDeltaTime,warmup=elapsed<10,running=game!=null&&game.Running,enabled=game!=null&&game.enabled,focused=Application.isFocused,tick=sim==null?-1:sim.TickCount,aliveEnemies=alive,inArena=sim!=null&&sim.Stage.InArena,playerState=sim==null?"unavailable":sim.Player.State,menuPage=menu==null?"unavailable":Convert.ToString(menuPage?.GetValue(menu)),settingsOpen=menu!=null&&settingsOpen!=null&&(bool)settingsOpen.GetValue(menu)});
   if(elapsed>=70){report.complete=true;Flush();}
  }catch(Exception ex){report.error=ex.ToString();Flush();}
 }
 static double Percentile(double[] a,double p){return a.Length==0?0:a[Math.Max(0,(int)Math.Ceiling(a.Length*p)-1)];}
 void Flush(){if(finished||directory==null)return;finished=true;var intervals=report.frames.Where(f=>!f.warmup).Select(f=>(double)f.intervalSeconds*1000).OrderBy(x=>x).ToArray();report.observedFrames=intervals.Length;report.p50Ms=Percentile(intervals,.50);report.p95Ms=Percentile(intervals,.95);report.maxMs=intervals.Length==0?0:intervals[intervals.Length-1];
  // Write after collection. No per-frame disk I/O and no app quit/pause/input changes.
  using(var stream=new FileStream(Path.Combine(directory,"natural-frame-observe.json"),FileMode.CreateNew,FileAccess.Write))using(var writer=new StreamWriter(stream))writer.Write(JsonUtility.ToJson(report,true));enabled=false;
 }
 void OnApplicationQuit(){if(directory!=null&&!finished){report.complete=false;Flush();}}
}
}
