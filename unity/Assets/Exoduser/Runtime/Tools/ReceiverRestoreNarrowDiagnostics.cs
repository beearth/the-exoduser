using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.CompilerServices;
using UnityEngine;

namespace Exoduser.UnityPort.Tools {
public sealed partial class ReceiverRestoreNarrowCapture {
 [Serializable] sealed class GraphEntry {public string path,type,value;}
 [Serializable] sealed class GraphStage {public string stage,coreHash;public List<GraphEntry> entries=new List<GraphEntry>();}
 [Serializable] sealed class GraphChange {public string path,beforeType,beforeValue,afterType,afterValue;}
 [Serializable] sealed class GraphDiff {public string beforeStage,afterStage,beforeHash,afterHash;public bool exactHash;public List<GraphChange> changes=new List<GraphChange>();}
 [Serializable] sealed class BindingRecord {public string path,before,current,after;public bool changed,recognizedGameViewportBinding,restored;[NonSerialized]public object owner;[NonSerialized]public FieldInfo field;[NonSerialized]public Delegate saved;}
 [Serializable] sealed class TextureReference {public string property,id;public bool clrNull;}
 [Serializable] sealed class MaterialReference {public string id,shader;public List<TextureReference> textures=new List<TextureReference>();}
 [Serializable] sealed class DiagnosticReceipt {public string scope="Actual fixture Core field graph and delegate identities; no field exclusions or relaxed hash gate. Only two detached fixture viewport bindings are eligible for exact restoration.";public List<GraphDiff> comparisons=new List<GraphDiff>();public List<BindingRecord> bindings=new List<BindingRecord>();public List<MaterialReference> materialBaseline=new List<MaterialReference>();public List<string> assetMismatches=new List<string>();public bool rawFixtureHashSame,finalFixtureHashSame;}
 sealed class RefComparer:IEqualityComparer<object>{public new bool Equals(object x,object y)=>ReferenceEquals(x,y);public int GetHashCode(object x)=>RuntimeHelpers.GetHashCode(x);}
 DiagnosticReceipt diagnostic=new DiagnosticReceipt();GraphStage initialGraph;
 string DelegateText(Delegate value){return value==null?"null":string.Join(";",value.GetInvocationList().Select(d=>d.Method.DeclaringType.FullName+"::"+d.Method.Name+" target="+(d.Target==null?"static":d.Target.GetType().FullName+"#"+RuntimeHelpers.GetHashCode(d.Target).ToString(CultureInfo.InvariantCulture))));}
 void CaptureFixtureBindings(){
  foreach(var pair in new[]{new KeyValuePair<string,object>("$.WorldPointVisible",fixture),new KeyValuePair<string,object>("$.Druid.WorldPointVisible",fixture.Druid)}){
   if(pair.Value==null)throw new InvalidOperationException("Fixture viewport owner absent: "+pair.Key);
   var field=pair.Value.GetType().GetField("WorldPointVisible",F);if(field==null||!typeof(Delegate).IsAssignableFrom(field.FieldType))throw new MissingFieldException("Fixture viewport delegate ABI changed: "+pair.Key);
   var saved=field.GetValue(pair.Value) as Delegate;diagnostic.bindings.Add(new BindingRecord{path=pair.Key,owner=pair.Value,field=field,saved=saved,before=DelegateText(saved)});
  }
 }
 void RestoreFixtureViewportBindings(){
  if(!ReferenceEquals(game.Simulation,original)||ReferenceEquals(original,fixture)||game.Running||game.enabled||(late!=null&&late.enabled))throw new InvalidOperationException("Detached fixture restoration requires original Simulation reference");
  foreach(var row in diagnostic.bindings){var current=row.field.GetValue(row.owner) as Delegate;row.current=DelegateText(current);row.changed=!Equals(current,row.saved);
   if(row.changed){var methods=current?.GetInvocationList();row.recognizedGameViewportBinding=methods!=null&&methods.Length==1&&ReferenceEquals(methods[0].Target,game)&&methods[0].Method.DeclaringType==typeof(NativeGame)&&methods[0].Method.Name=="WorldPointVisible";
    if(row.recognizedGameViewportBinding){if(!ReferenceEquals(row.field.GetValue(row.owner),current))throw new InvalidOperationException("Fixture viewport delegate changed before exact restore: "+row.path);row.field.SetValue(row.owner,row.saved);}
   }
   var after=row.field.GetValue(row.owner) as Delegate;row.after=DelegateText(after);row.restored=Equals(after,row.saved); // Unknown callback is preserved and must fail final hash if different.
  }
  SaveDiagnostics();
 }
 void WalkGraph(object value,string path,GraphStage graph,Dictionary<object,string> seen){
  if(value==null){graph.entries.Add(new GraphEntry{path=path,type="null",value="null"});return;}var type=value.GetType();string text=null;
  if(value is Delegate callback)text=DelegateText(callback);
  else if(value is float single)text=single.ToString("R",CultureInfo.InvariantCulture)+" bits="+Convert.ToBase64String(BitConverter.GetBytes(single));
  else if(value is double number)text=number.ToString("R",CultureInfo.InvariantCulture)+" bits="+Convert.ToBase64String(BitConverter.GetBytes(number));
  else if(type.IsPrimitive||type.IsEnum||value is string||value is decimal)text=Convert.ToString(value,CultureInfo.InvariantCulture);
  if(text!=null){graph.entries.Add(new GraphEntry{path=path,type=type.FullName,value=text});return;}
  if(!type.IsValueType){if(seen.TryGetValue(value,out var first)){graph.entries.Add(new GraphEntry{path=path,type=type.FullName,value="ref:"+first});return;}seen.Add(value,path);}
  graph.entries.Add(new GraphEntry{path=path,type=type.FullName,value=type.IsValueType?"struct":"object#"+RuntimeHelpers.GetHashCode(value).ToString(CultureInfo.InvariantCulture)});
  if(value is IEnumerable sequence){int i=0;foreach(var item in sequence)WalkGraph(item,path+"["+(i++).ToString(CultureInfo.InvariantCulture)+"]",graph,seen);graph.entries.Add(new GraphEntry{path=path+".length",type="count",value=i.ToString(CultureInfo.InvariantCulture)});return;}
  foreach(var field in type.GetFields(F).Where(f=>!f.IsStatic).OrderBy(f=>f.Name,StringComparer.Ordinal))WalkGraph(field.GetValue(value),path+"."+field.Name,graph,seen);
 }
 void CaptureFixtureGraph(string stage){
  var graph=new GraphStage{stage=stage,coreHash=State(fixture)};WalkGraph(fixture,"$",graph,new Dictionary<object,string>(new RefComparer()));
  File.WriteAllText(Path.Combine(output,"fixture-core-"+stage+".json"),JsonUtility.ToJson(graph,true));
  File.WriteAllLines(Path.Combine(output,"fixture-core-"+stage+".txt"),graph.entries.Select(e=>e.path+"\t"+e.type+"\t"+e.value.Replace("\r","\\r").Replace("\n","\\n").Replace("\t","\\t")));
  if(initialGraph==null)initialGraph=graph;else{
   var before=initialGraph.entries.ToDictionary(e=>e.path);var after=graph.entries.ToDictionary(e=>e.path);var diff=new GraphDiff{beforeStage=initialGraph.stage,afterStage=stage,beforeHash=initialGraph.coreHash,afterHash=graph.coreHash,exactHash=initialGraph.coreHash==graph.coreHash};
   foreach(var key in before.Keys.Union(after.Keys).OrderBy(k=>k,StringComparer.Ordinal)){before.TryGetValue(key,out var a);after.TryGetValue(key,out var b);if(a?.type!=b?.type||a?.value!=b?.value)diff.changes.Add(new GraphChange{path=key,beforeType=a?.type,beforeValue=a?.value,afterType=b?.type,afterValue=b?.value});}diagnostic.comparisons.Add(diff);
   if(stage=="after-native-restore")diagnostic.rawFixtureHashSame=diff.exactHash;if(stage=="after-binding-cleanup")diagnostic.finalFixtureHashSame=diff.exactHash;
  }
  SaveDiagnostics();
 }
 void SaveDiagnostics(){File.WriteAllText(Path.Combine(output,"restore-diagnostics.json"),JsonUtility.ToJson(diagnostic,true));}
 Dictionary<string,Texture> CaptureMaterialTextures(Material material){
  var textures=material.GetTexturePropertyNames().ToDictionary(name=>name,name=>material.GetTexture(name));var row=new MaterialReference{id=Id(material),shader=Id(material.shader)};foreach(var pair in textures.OrderBy(p=>p.Key,StringComparer.Ordinal))row.textures.Add(new TextureReference{property=pair.Key,id=Id(pair.Value),clrNull=ReferenceEquals(pair.Value,null)});diagnostic.materialBaseline.Add(row);return textures;
 }
 bool ValidateStableAssets(){
  diagnostic.assetMismatches.Clear();
  foreach(var material in assets){if(material==null){diagnostic.assetMismatches.Add("destroyed material CLR#"+RuntimeHelpers.GetHashCode(material));continue;}
   if(material.shader!=assetShaders[material])diagnostic.assetMismatches.Add(Id(material)+" shader reference changed");
   var now=new HashSet<string>(material.GetTexturePropertyNames(),StringComparer.Ordinal);var saved=assetTextures[material];if(!now.SetEquals(saved.Keys))diagnostic.assetMismatches.Add(Id(material)+" texture property name set changed");
   foreach(var property in saved){if(!now.Contains(property.Key))continue;var current=material.GetTexture(property.Key);if(!ReferenceEquals(current,property.Value)||!ReferenceEquals(property.Value,null)&&property.Value==null)diagnostic.assetMismatches.Add(Id(material)+" texture "+property.Key+" reference changed or destroyed");}
  }
  foreach(var row in r.old.Where(x=>x.category=="stable"&&!ReferenceEquals(x.sprite,null))){if(row.sprite==null||row.spriteTexture==null||!(row.value is SpriteRenderer sr)||!ReferenceEquals(sr.sprite,row.sprite)||!ReferenceEquals(sr.sprite.texture,row.spriteTexture))diagnostic.assetMismatches.Add(row.id+" "+row.name+" stable sprite/texture reference changed or destroyed");}
  SaveDiagnostics();return diagnostic.assetMismatches.Count==0;
 }
}
}
