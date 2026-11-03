using System;
using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEngine;
using Exoduser.UnityPort;

// Mac Editor gate only (run once by the lead through the shared runner). PC lanes use compilation and leave this import gate to Mac.
// Reads Resources/Data/enemy_rig_models.json and checks that each of the 30 rows really imported as a skinned model with the clips,
// sockets and bounds the table promises. Writes enemy3d-import.json to the absolute -output directory; any failure exits 1.
public static class Enemy3DImportCheck
{
 [Serializable] sealed class Row
 {
  public int etype;public bool startEyeMass;public string model,assetPath;public bool loaded;public int skinnedRenderers,bones,renderers;public float skinnedHeight,totalHeight;
  public string[] clips=Array.Empty<string>(),missingSlots=Array.Empty<string>(),missingSockets=Array.Empty<string>(),missingExtras=Array.Empty<string>();
  public bool passed;public string reason;
 }
 [Serializable] sealed class Receipt
 {
  public bool passed;public string scope="Resources.Load, SkinnedMeshRenderer/bone count, AnimationClip names at the asset path, slot/extras names (runtime '|' suffix rule), sockets, instantiated renderer bounds; Player/visual gate remains separate";
  public int rows,failed;public List<Row> models=new List<Row>();
 }
 // Same lookup rule as NativeEnemyRigAnimator: exact clip name or the part after the last '|'.
 static bool HasClip(HashSet<string> names,string slot)
 {
  foreach(var n in names){if(string.Equals(n,slot,StringComparison.OrdinalIgnoreCase))return true;int cut=n.LastIndexOf('|');if(cut>=0&&string.Equals(n.Substring(cut+1),slot,StringComparison.OrdinalIgnoreCase))return true;}
  return false;
 }
 public static void Run()
 {
  string output=null;var args=Environment.GetCommandLineArgs();for(int i=0;i+1<args.Length;i++)if(args[i]=="-output")output=args[i+1];
  if(string.IsNullOrEmpty(output)||!Path.IsPathRooted(output))throw new ArgumentException("-output must be an absolute receipt directory");
  Directory.CreateDirectory(output);var receipt=new Receipt{passed=true};
  var data=Resources.Load<TextAsset>("Data/enemy_rig_models");
  var catalog=data==null?null:JsonUtility.FromJson<EnemyRigCatalog>(data.text);
  if(catalog==null||catalog.models==null||catalog.models.Length!=30)receipt.passed=false;
  var keys=new HashSet<string>();
  foreach(var d in catalog!=null&&catalog.models!=null?catalog.models:Array.Empty<EnemyRigDefinition>())
  {
   var row=new Row{etype=d.etype,startEyeMass=d.startEyeMass,model=d.modelResource};var why=new List<string>();
   if(!keys.Add(d.etype+":"+d.startEyeMass))why.Add("duplicate key");
   var go=Resources.Load<GameObject>(d.modelResource);row.loaded=go!=null;
   if(go==null)why.Add("Resources.Load failed");
   else
   {
    row.assetPath=AssetDatabase.GetAssetPath(go);
    var skins=go.GetComponentsInChildren<SkinnedMeshRenderer>(true);row.skinnedRenderers=skins.Length;row.renderers=go.GetComponentsInChildren<Renderer>(true).Length;
    foreach(var s in skins)row.bones=Math.Max(row.bones,s.bones==null?0:s.bones.Length);
    if(skins.Length==0)why.Add("no SkinnedMeshRenderer");
    if(row.bones<=0)why.Add("no bones");
    var names=new HashSet<string>();
    foreach(var o in AssetDatabase.LoadAllAssetsAtPath(row.assetPath))if(o is AnimationClip c&&!c.name.StartsWith("__preview__",StringComparison.Ordinal))names.Add(c.name);
    row.clips=new string[names.Count];names.CopyTo(row.clips);Array.Sort(row.clips,StringComparer.Ordinal);
    var slots=new List<string>();foreach(var s in new[]{d.idle,d.move,d.tell,d.active,d.recover,d.hit,d.stagger,d.death})if(!string.IsNullOrEmpty(s)&&!HasClip(names,s))slots.Add(s);
    row.missingSlots=slots.ToArray();if(slots.Count>0)why.Add("missing slot clips");
    var extras=new List<string>();if(d.extras!=null)foreach(var s in d.extras)if(!HasClip(names,s))extras.Add(s);
    row.missingExtras=extras.ToArray();if(extras.Count>0)why.Add("missing extras clips");
    var transforms=new HashSet<string>();foreach(var t in go.GetComponentsInChildren<Transform>(true))transforms.Add(t.name);
    var sockets=new List<string>();if(d.sockets!=null)foreach(var s in d.sockets)if(!transforms.Contains(s))sockets.Add(s);
    row.missingSockets=sockets.ToArray();if(sockets.Count>0)why.Add("missing sockets");
    var instance=UnityEngine.Object.Instantiate(go);
    try
    {
     bool any=false,anySkin=false;Bounds total=default,body=default;
     foreach(var r in instance.GetComponentsInChildren<Renderer>(true))
     {
      var b=r.bounds;if(any)total.Encapsulate(b);else{total=b;any=true;}
      if(r is SkinnedMeshRenderer){if(anySkin)body.Encapsulate(b);else{body=b;anySkin=true;}}
     }
     row.totalHeight=any?total.size.y:0;row.skinnedHeight=anySkin?body.size.y:0;
    }
    finally{UnityEngine.Object.DestroyImmediate(instance);}
    if(row.skinnedHeight<=0)why.Add("renderer bounds height is zero");
   }
   row.passed=why.Count==0;row.reason=string.Join("; ",why);
   receipt.models.Add(row);receipt.rows++;if(!row.passed){receipt.failed++;receipt.passed=false;}
  }
  File.WriteAllText(Path.Combine(output,"enemy3d-import.json"),JsonUtility.ToJson(receipt,true));
  Debug.Log("ENEMY3D_IMPORT passed="+receipt.passed+" rows="+receipt.rows+" failed="+receipt.failed);
  if(!receipt.passed)EditorApplication.Exit(1);
 }
}
