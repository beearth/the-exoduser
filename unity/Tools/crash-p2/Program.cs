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
 static string original;
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
   else if(!field.IsInitOnly)field.SetValue(null,null);
  }
 }
 static void CatalogResource(string text)
 {
  Resources.Loader=(type,name)=>name=="Data/pet_bubble"&&text!=null?new TextAsset{text=text}:null;
 }
 static void Unpublished()
 {
  Check(typeof(NativePetBubbleCatalog).GetField("codes",Hidden).GetValue(null)==null,"codes published on failure");
  foreach(string name in new[]{"entries","cues"})
   Check(((IDictionary)typeof(NativePetBubbleCatalog).GetField(name,Hidden).GetValue(null)).Count==0,name+" partially published");
 }
 static void InvalidThenRecover(string name,Action<JsonObject> corrupt)
 {
  Test(name,()=>{
   Reset(typeof(NativePetBubbleCatalog));
   var broken=JsonNode.Parse(original).AsObject();corrupt(broken);CatalogResource(broken.ToJsonString());
   bool rejected=false;try{NativePetBubbleCatalog.Cue("env_ch0");}catch(Exception){rejected=true;}
   Check(rejected,"corrupt catalogue accepted");Unpublished();
   CatalogResource(original);Check(NativePetBubbleCatalog.Cue("env_ch0")!=null,"recovery failed");
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
  InvalidThenRecover("catalogue: duplicate entry publishes nothing",json=>{
   var rows=json["entries"].AsArray();rows.Add(rows[0].DeepClone());
  });
  InvalidThenRecover("catalogue: late short texts publishes nothing",json=>{
   var rows=json["entries"].AsArray();rows[rows.Count-1]["texts"].AsArray().RemoveAt(28);
  });
  InvalidThenRecover("catalogue: duplicate cue publishes nothing",json=>{
   var rows=json["cues"].AsArray();rows.Add(rows[0].DeepClone());
  });
  InvalidThenRecover("catalogue: invalid locale count publishes nothing",json=>json["codes"].AsArray().RemoveAt(28));
  Test("catalogue: missing resource publishes nothing and recovers",()=>{
   Reset(typeof(NativePetBubbleCatalog));CatalogResource(null);bool rejected=false;
   try{NativePetBubbleCatalog.Cue("env_ch0");}catch(InvalidOperationException){rejected=true;}
   Check(rejected,"missing resource accepted");Unpublished();CatalogResource(original);
   Check(NativePetBubbleCatalog.Cue("env_ch0")!=null,"recovery failed");
  });
  Test("catalogue: every shipped locale, text and cue preserved",()=>{
   Reset(typeof(NativePetBubbleCatalog));CatalogResource(original);var json=JsonNode.Parse(original);
   foreach(var entry in json["entries"].AsArray())for(int i=0;i<29;i++)
    Check(NativePetBubbleCatalog.Text((string)entry["key"],(string)json["codes"][i])==(string)entry["texts"][i],"text mismatch");
   foreach(var cue in json["cues"].AsArray())
   {
    var loaded=NativePetBubbleCatalog.Cue((string)cue["id"]);
    foreach(var field in typeof(NativePetBubbleCue).GetFields())
     Check(System.Text.Json.JsonSerializer.Serialize(field.GetValue(loaded))==cue[field.Name].ToJsonString(),"cue mismatch: "+field.Name);
   }
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
