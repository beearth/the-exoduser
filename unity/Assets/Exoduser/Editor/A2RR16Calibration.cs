using System;
using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEngine;
namespace Exoduser {
 public static class A2RR16Calibration {
  public static readonly string[] Names={"cocoon","hang_cage","skull_totem","sword_pile","sroot_a","sroot_b","sbone","bone_arch","c1tree","ctree15","ctree18"};
  [Serializable] sealed class Input {public Row[] rows;}
  [Serializable] sealed class Row {public string name,asset;public float height,cameraPitch,cameraFov,cameraDistance;public Vector3 anchor,cameraPosition;}
  [Serializable] sealed class Catalog {public Model[] models;}
  [Serializable] sealed class Model {public string name,resource;public bool prepared;}
  [Serializable] public sealed class Scale {public string name;public float scale,paintingWidth,unscaledWidth,scaledWidth,residualPercent;public bool clamped;public Vector3 anchor,cameraPosition;public float cameraPitch,cameraFov,cameraDistance;}
  [Serializable] sealed class Output {public string scope="r15 exact stored anchor/camera/FOV, 1920x1080, 34deg. Painting alpha >= .12 edge pixels projected through original pivot and yaw. Display LOD0 (source LOD1) indexed mesh vertices projected; extrema are silhouette span, not inflated renderer bounds. Uniform scale binary search constrained .6..1. No Core or game camera changes.";public string[] models=Names;public List<Scale> scales=new List<Scale>();}
  static float ModelWidth(GameObject root,Renderer[] renderers,Camera camera,float height,float scale){root.transform.localScale=Vector3.one*height*scale;float low=float.PositiveInfinity,high=float.NegativeInfinity;foreach(var r in renderers){var f=r.GetComponent<MeshFilter>();if(f==null)continue;var vertices=f.sharedMesh.vertices;foreach(var i in f.sharedMesh.triangles){float x=camera.WorldToScreenPoint(f.transform.TransformPoint(vertices[i])).x;low=Mathf.Min(low,x);high=Mathf.Max(high,x);}}return high-low;}
  public static readonly string[] R19Names={"ctree13","ctree14","ctree16","ctree17","fg_rot01","fg_rot03"};
  public static int Measure(){return MeasureCore(Names,false);}
  public static int MeasureR19(){return MeasureCore(R19Names,true);}
  static int MeasureCore(string[] names,bool merge){
   const string dir="I:/EXODUSER-Storage/map25d/a2redesign/";var input=JsonUtility.FromJson<Input>(File.ReadAllText(dir+"r15-sheet.json"));var catalog=JsonUtility.FromJson<Catalog>(Resources.Load<TextAsset>("A2R/Models3D/catalog").text);var cards=JsonUtility.FromJson<Cards>(Resources.Load<TextAsset>("A2R/web-assets").text).cards;var output=new Output();if(merge){var old=JsonUtility.FromJson<Output>(File.ReadAllText("Assets/Exoduser/Resources/A2R/Models3D/allowed-models.json"));output.models=old.models;output.scales=old.scales;output.scales.RemoveAll(x=>Array.IndexOf(names,x.name)>=0);var list=new List<string>(output.models);foreach(var n in new List<string>(names){"sbone","sword_pile"})if(!list.Contains(n))list.Add(n);output.models=list.ToArray();}var cam=new GameObject("R16 CPU silhouette projection").AddComponent<Camera>();cam.enabled=false;cam.pixelRect=new Rect(0,0,1920,1080);cam.aspect=1920f/1080;
   try{foreach(var name in names){var row=Array.Find(input.rows,r=>r.name==name);var spec=Array.Find(catalog.models,r=>r.name==name);var card=Array.Find(cards,c=>c.asset==row.asset);cam.transform.SetPositionAndRotation(row.cameraPosition,Quaternion.Euler(row.cameraPitch,0,0));cam.fieldOfView=row.cameraFov;var rotation=Quaternion.Euler(0,0,0);var texture=new Texture2D(2,2);texture.LoadImage(File.ReadAllBytes(AssetDatabase.GetAssetPath(Resources.Load<Texture2D>(card.asset))));var pixels=texture.GetPixels32();float min=float.PositiveInfinity,max=float.NegativeInfinity;
    for(int y=0;y<texture.height;y++){int first=-1,last=-1;for(int x=0;x<texture.width;x++)if(pixels[y*texture.width+x].a>=31){if(first<0)first=x;last=x;}if(first<0)continue;foreach(var x in new[]{first,last+1})foreach(var yy in new[]{y,y+1}){var point=row.anchor+rotation*new Vector3((x/(float)texture.width-card.footU)*card.width,(yy/(float)texture.height-card.footV)*card.height,0);float screen=cam.WorldToScreenPoint(point).x;min=Mathf.Min(min,screen);max=Mathf.Max(max,screen);}}UnityEngine.Object.DestroyImmediate(texture);
    var go=(GameObject)PrefabUtility.InstantiatePrefab(Resources.Load<GameObject>(spec.resource));try{go.transform.SetPositionAndRotation(row.anchor,Quaternion.Euler(0,spec.prepared?180:0,0));var lod=go.GetComponent<LODGroup>();var renderers=lod!=null?lod.GetLODs()[1].renderers:go.GetComponentsInChildren<Renderer>();float target=max-min,original=ModelWidth(go,renderers,cam,row.height,1),lo=.6f,hi=1;for(int n=0;n<24;n++){float mid=(lo+hi)*.5f;if(ModelWidth(go,renderers,cam,row.height,mid)>target)hi=mid;else lo=mid;}float scale=(lo+hi)*.5f,actual=ModelWidth(go,renderers,cam,row.height,scale);output.scales.Add(new Scale{name=name,scale=scale,paintingWidth=target,unscaledWidth=original,scaledWidth=actual,residualPercent=(actual/target-1)*100,clamped=scale<.6001f||scale>.9999f,anchor=row.anchor,cameraPosition=row.cameraPosition,cameraPitch=row.cameraPitch,cameraFov=row.cameraFov,cameraDistance=row.cameraDistance});}finally{UnityEngine.Object.DestroyImmediate(go);}}
    var json=JsonUtility.ToJson(output,true);File.WriteAllText("Assets/Exoduser/Resources/A2R/Models3D/allowed-models.json",json);File.WriteAllText(dir+"r16-scale-measurement.json",json);AssetDatabase.ImportAsset("Assets/Exoduser/Resources/A2R/Models3D/allowed-models.json");Debug.Log("A2R_R16_MEASURED "+output.scales.Count+" exact r15 silhouettes");return 0;
   }finally{UnityEngine.Object.DestroyImmediate(cam.gameObject);}
  }
  [Serializable] sealed class Cards {public UnityPort.A2RWebAssets.Card[] cards;}
 }
}
