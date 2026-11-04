using System;
using System.Collections;
using System.IO;
using System.Reflection;
using System.Text.Json.Nodes;
using Exoduser.UnityPort;
using UnityEngine;

static class Program
{
 static int passed,failed;
 static readonly BindingFlags Hidden=BindingFlags.Static|BindingFlags.NonPublic;
 static string original;static int catalogLoads;
 static void Check(bool value,string reason){if(!value)throw new Exception(reason);}
 static void Test(string name,Action body)
 {
  try{body();passed++;Console.WriteLine("PASS "+name);}
  catch(Exception error){failed++;Console.WriteLine("FAIL "+name+": "+error.GetType().Name+": "+error.Message);}
 }
 static void Reset(Type type)
 {
  foreach(var field in type.GetFields(Hidden))
  {
   if(field.GetValue(null) is IDictionary dictionary)dictionary.Clear();
   else if(!field.IsInitOnly)field.SetValue(null,field.FieldType.IsValueType?Activator.CreateInstance(field.FieldType):null);
  }
 }
 static void CatalogResource(string text)
 {
  Resources.Loader=(type,name)=>{catalogLoads++;return name=="Data/pet_bubble"&&text!=null?new TextAsset{text=text}:null;};
 }
 static void EmptySnapshot()
 {
  var codes=(string[])typeof(NativePetBubbleCatalog).GetField("codes",Hidden).GetValue(null);
  Check(codes!=null&&codes.Length==0,"empty codes not published on failure");
  foreach(string name in new[]{"entries","cues"})
   Check(((IDictionary)typeof(NativePetBubbleCatalog).GetField(name,Hidden).GetValue(null)).Count==0,name+" partially published");
 }
 static void FailedThenReset(string name,Action supply)
 {
  Test(name,()=>{
   Reset(typeof(NativePetBubbleCatalog));catalogLoads=0;Debug.Warnings=0;Debug.LastWarning=null;supply();
   // Do not catch exceptions here: either Cue throwing fails the case.
   Check(NativePetBubbleCatalog.Cue("env_ch0")==null,"first failed-load Cue was not null");
   Check(NativePetBubbleCatalog.Cue("env_ch0")==null,"second failed-load Cue was not null");
   Check(catalogLoads==1,"failed load retried");
   Check(Debug.Warnings==1&&!string.IsNullOrEmpty(Debug.LastWarning),"failure must warn exactly once");
   EmptySnapshot();
   Check(NativePetBubbleCatalog.Cue(null)==null,"null cue id was not safe");
   string key=(string)JsonNode.Parse(original)["entries"][0]["key"];
   Check(NativePetBubbleCatalog.Text(key,"en")==""&&NativePetBubbleCatalog.Text(key,"unknown")==""&&
    NativePetBubbleCatalog.Text(null,null)=="","empty snapshot Text was not safe");
   CatalogResource(original);
   Check(NativePetBubbleCatalog.Cue("env_ch0")==null&&NativePetBubbleCatalog.Text(key,"en")=="","latch allowed recovery before Reset");
   Check(catalogLoads==1&&Debug.Warnings==1,"latched queries loaded or warned again");
   Reset(typeof(NativePetBubbleCatalog));
   Check(NativePetBubbleCatalog.Cue("env_ch0")!=null,"Reset did not clear failure latch");
   Check(catalogLoads==2&&Debug.Warnings==1,"Reset must permit exactly one successful reload without warning");
  });
 }
 static void InvalidThenReset(string name,Action<JsonObject> corrupt)
 {
  FailedThenReset(name,()=>{
   var broken=JsonNode.Parse(original).AsObject();corrupt(broken);CatalogResource(broken.ToJsonString());
  });
 }
 static int Main(string[] args)
 {
  original=File.ReadAllText(Path.Combine(args[0],"unity/Assets/Exoduser/Resources/Data/pet_bubble.json"));
  Test("pause: first measurement throws -> baseline",()=>{
   NativeUiAudit.Measure=rect=>throw new InvalidOperationException("TextCore unavailable");
   Check(PauseMeasurementBoundary.Measure().y==1022,"baseline not restored");
  });
  Test("pause: notice measurement throws -> baseline",()=>{
   int calls=0;NativeUiAudit.Measure=rect=>++calls==1?new Rect(0,1004,1,20):throw new InvalidOperationException("zero lines");
   Check(PauseMeasurementBoundary.Measure().y==1022,"baseline not restored");
  });
  Test("pause: throws after correction -> baseline",()=>{
   int calls=0;NativeUiAudit.Measure=rect=>++calls==3?throw new InvalidOperationException("Advanced Text"):rect;
   Check(PauseMeasurementBoundary.Measure().y==1022,"partially corrected position escaped");
  });
  foreach(float scale in new[]{1f,2f})Test("pause: normal spacing at scale "+scale,()=>{
   GUI.matrix=new Matrix4x4{m11=scale};NativeUiAudit.Measure=rect=>rect;
   Check(PauseMeasurementBoundary.Measure().y==1024+1/scale,"normal spacing changed");
  });
  Test("pause: four correction steps retained",()=>{
   GUI.matrix=new Matrix4x4{m11=1};int calls=0;
   NativeUiAudit.Measure=rect=>++calls==1?new Rect(0,1004,1,20):new Rect(0,1022,1,18);
   Check(PauseMeasurementBoundary.Measure().y==1034&&calls==5,"iteration bound changed");
  });
  foreach(int mask in new[]{0,1,2,3})Test("arabic: Repaint assets mask "+mask,()=>{
   Reset(typeof(NativeDemoArabicText));NativeSilverHellUi.Labels=0;Event.current.type=EventType.Repaint;
   Resources.Loader=(type,name)=>name.EndsWith("ArabicCaptionPanel")?(mask&1)!=0?new UnityEngine.UIElements.PanelSettings():null:
    (mask&2)!=0?new UnityEngine.TextCore.Text.FontAsset():null;
   NativeDemoText.Label(new Rect(),"مرحبا",new GUIStyle(),"test");
   Check(NativeSilverHellUi.Labels==(mask==3?0:1),"incorrect fallback dispatch");
   if(mask!=3)Check(NativeSilverHellUi.LastText=="مرحبا","fallback text changed");
  });
  Test("arabic: Layout path still skips asset load",()=>{
   Reset(typeof(NativeDemoArabicText));Event.current.type=EventType.Layout;
   Resources.Loader=(type,name)=>throw new Exception("unexpected resource load");
   Check(NativeDemoArabicText.Draw(new Rect(),"مرحبا",new GUIStyle(),null),"layout handling changed");
  });
  Test("arabic: non Arabic uses Label",()=>{
   Event.current.type=EventType.Repaint;NativeSilverHellUi.Labels=0;
   Resources.Loader=(type,name)=>throw new Exception("unexpected resource load");
   NativeDemoText.Label(new Rect(),"hello",new GUIStyle());Check(NativeSilverHellUi.Labels==1,"Label skipped");
  });
  Test("arabic: missing asset can recover on later Repaint",()=>{
   Reset(typeof(NativeDemoArabicText));CatalogResource(null);
   Check(!NativeDemoArabicText.Draw(new Rect(),"مرحبا",new GUIStyle(),null),"missing assets accepted");
   Resources.Loader=(type,name)=>Activator.CreateInstance(type);
   Check(NativeDemoArabicText.Draw(new Rect(),"مرحبا",new GUIStyle(),null),"recovery failed");
  });
  InvalidThenReset("catalogue: duplicate entry latches empty snapshot",json=>{
   var rows=json["entries"].AsArray();rows.Add(rows[0].DeepClone());
  });
  InvalidThenReset("catalogue: late short texts latch empty snapshot",json=>{
   var rows=json["entries"].AsArray();rows[rows.Count-1]["texts"].AsArray().RemoveAt(28);
  });
  InvalidThenReset("catalogue: duplicate cue latches empty snapshot",json=>{
   var rows=json["cues"].AsArray();rows.Add(rows[0].DeepClone());
  });
  InvalidThenReset("catalogue: invalid locale count latches empty snapshot",json=>json["codes"].AsArray().RemoveAt(28));
  FailedThenReset("catalogue: missing resource latches empty snapshot",()=>CatalogResource(null));
  FailedThenReset("catalogue: malformed JSON latches empty snapshot",()=>CatalogResource("{"));
  FailedThenReset("catalogue: null bundle latches empty snapshot",()=>CatalogResource("null"));
  FailedThenReset("catalogue: resource exception latches empty snapshot",()=>{
   Resources.Loader=(type,name)=>{catalogLoads++;throw new IOException("resource failure");};
  });
  InvalidThenReset("catalogue: null codes latch empty snapshot",json=>json["codes"]=null);
  InvalidThenReset("catalogue: null entries latch empty snapshot",json=>json["entries"]=null);
  InvalidThenReset("catalogue: null cues latch empty snapshot",json=>json["cues"]=null);
  InvalidThenReset("catalogue: late null entry latches empty snapshot",json=>{
   var rows=json["entries"].AsArray();rows[rows.Count-1]=null;
  });
  InvalidThenReset("catalogue: late null texts latch empty snapshot",json=>{
   var rows=json["entries"].AsArray();rows[rows.Count-1]["texts"]=null;
  });
  InvalidThenReset("catalogue: long texts latch empty snapshot",json=>json["entries"][0]["texts"].AsArray().Add("extra"));
  InvalidThenReset("catalogue: late null cue latches empty snapshot",json=>{
   var rows=json["cues"].AsArray();rows[rows.Count-1]=null;
  });
  InvalidThenReset("catalogue: null entry key latches empty snapshot",json=>json["entries"][0]["key"]=null);
  InvalidThenReset("catalogue: null cue id latches empty snapshot",json=>json["cues"][0]["id"]=null);
  Test("callers: failed catalogue null offers keep queue and capture queries safe",()=>{
   Reset(typeof(NativePetBubbleCatalog));CatalogResource("{");Debug.Warnings=0;catalogLoads=0;
   var queue=new NativePetBubbleQueue();queue.Reset();queue.BeginFrame(0,false,false,false);
   foreach(string id in new[]{"env_ch0","boss_intro_ch0","hp_critical","crisis_hp30","warn_hp50"})
    queue.Offer(NativePetBubbleCatalog.Cue(id));
   Check(queue.Dispatch()==null&&!queue.Active&&!queue.Visible,"null offers activated queue");
   queue.BeginFrame(4,false,false,false);
   Check(!queue.PairPhase&&queue.Speaker==null&&queue.Key==null&&queue.Id==null,"empty capture queue fields unsafe");
   var text=NativePetBubbleHints.Resolve(NativePetBubbleCatalog.Text(queue.Key,"ar"),action=>throw new Exception("empty hint must not resolve bindings"));
   NativeSilverHellUi.Labels=0;NativeDemoText.Label(new Rect(),text,new GUIStyle());
   Check(text==""&&NativeSilverHellUi.Labels==0,"empty view text was rendered");
   Check(catalogLoads==1&&Debug.Warnings==1,"caller path reloaded or warned again");
  });
  Test("catalogue: absent locale and English index safely return empty",()=>{
   Reset(typeof(NativePetBubbleCatalog));var json=JsonNode.Parse(original);var codes=json["codes"].AsArray();
   for(int i=0;i<codes.Count;i++)if((string)codes[i]=="en")codes[i]="zz";
   CatalogResource(json.ToJsonString());
   Check(NativePetBubbleCatalog.Text((string)json["entries"][0]["key"],"unknown")=="","negative fallback index unsafe");
  });
  Test("catalogue: every shipped locale, text and cue preserved",()=>{
   Reset(typeof(NativePetBubbleCatalog));CatalogResource(original);Debug.Warnings=0;var json=JsonNode.Parse(original);
   foreach(var entry in json["entries"].AsArray())for(int i=0;i<29;i++)
    Check(NativePetBubbleCatalog.Text((string)entry["key"],(string)json["codes"][i])==(string)entry["texts"][i],"text mismatch");
   foreach(var cue in json["cues"].AsArray())
   {
    var loaded=NativePetBubbleCatalog.Cue((string)cue["id"]);
    foreach(var field in typeof(NativePetBubbleCue).GetFields())
     Check(System.Text.Json.JsonSerializer.Serialize(field.GetValue(loaded))==cue[field.Name].ToJsonString(),"cue mismatch: "+field.Name);
   }
   Check(Debug.Warnings==0,"valid catalogue warned");
  });
  Test("catalogue: unknown keys and locale fallback unchanged",()=>{
   Check(NativePetBubbleCatalog.Cue("missing")==null,"unknown cue changed");
   Check(NativePetBubbleCatalog.Text(null,"en")==""&&NativePetBubbleCatalog.Text("missing","en")=="","unknown text changed");
   var row=JsonNode.Parse(original)["entries"][0];string key=(string)row["key"];
   Check(NativePetBubbleCatalog.Text(key,"unknown")==NativePetBubbleCatalog.Text(key,"en"),"English fallback changed");
  });
  Test("catalogue: loaded snapshot does not reload",()=>{
   Resources.Loader=(type,name)=>throw new Exception("unexpected reload");
   Check(NativePetBubbleCatalog.Cue("env_ch0")!=null,"loaded cue missing");
  });
  Console.WriteLine($"RESULT passed={passed} failed={failed}");return failed==0?0:1;
 }
}
