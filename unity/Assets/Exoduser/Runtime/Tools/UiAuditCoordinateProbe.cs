using System;using System.Collections;using System.Collections.Generic;using System.IO;using System.Reflection;using UnityEngine;
namespace Exoduser.UnityPort.Tools {
 // Explicit sandbox-only calibration. Solid pixels are independent of the audit's boxes.
 public sealed class UiAuditCoordinateProbe:MonoBehaviour {
  [Serializable] public sealed class Row {public string name;public int width,height;public Rect expected,rawExpected;public Vector2 legacyMin,legacyMax,identityThenMatrixMin,identityThenMatrixMax,unclipMin,unclipMax;}
  [Serializable] public sealed class Receipt {public string scope="GUI 좌표 보정 전용 실제 Player; 게임 UI/자연 플레이 합격 아님";public List<Row> rows=new List<Row>();}
  static string Arg(string n){var a=Environment.GetCommandLineArgs();int i=Array.IndexOf(a,n);return i>=0&&i+1<a.Length?a[i+1]:null;}
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)] static void Boot(){if(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-ui-coordinate-check")>=0&&FindFirstObjectByType<UiAuditCoordinateProbe>()==null)new GameObject("UI coordinate isolated probe").AddComponent<UiAuditCoordinateProbe>();}
  readonly string[] cases={"identity","edge-root","edge-group","edge-nested","edge-scroll","right-root","right-group","right-nested","right-scroll"};
  readonly Receipt receipt=new Receipt();string output,current;Row row;bool armed;Vector2 windowOrigin;
  static readonly Type clipType=typeof(GUI).Assembly.GetType("UnityEngine.GUIClip");
  static readonly MethodInfo unclip=clipType?.GetMethod("Unclip",BindingFlags.Public|BindingFlags.NonPublic|BindingFlags.Static,null,new[]{typeof(Vector2)},null);
  IEnumerator Start(){
   if(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-ui-coordinate-check")<0){enabled=false;yield break;}
   output=Arg("-output");if(!NativeQaSandbox.Active||string.IsNullOrEmpty(output)||!Path.IsPathRooted(output)){Application.Quit(3);yield break;}Directory.CreateDirectory(output);
   foreach(var g in FindObjectsByType<NativeGame>(FindObjectsSortMode.None))g.enabled=false;foreach(var l in FindObjectsByType<NativeLobby>(FindObjectsSortMode.None))l.enabled=false;
   AudioListener.pause=true;AudioListener.volume=0;NativeUiAudit.Active=true;
   int[,] sizes={{1920,1080},{2560,1080},{3840,1080},{1600,900},{2560,1600}};
   for(int n=0;n<5;n++){
    Screen.SetResolution(sizes[n,0],sizes[n,1],FullScreenMode.Windowed);yield return null;yield return null;
    foreach(var name in cases){current=name;row=null;armed=true;yield return null;yield return new WaitForEndOfFrame();
     if(row==null||Screen.width!=sizes[n,0]||Screen.height!=sizes[n,1]){Debug.LogError("UI_COORD_PROBE missing repaint/resolution");Application.Quit(2);yield break;}
     string stem=Screen.width+"x"+Screen.height+"-"+name;NativeUiAudit.Save(Path.Combine(output,stem+".json"),name,"ko");
     var tex=ScreenCapture.CaptureScreenshotAsTexture();File.WriteAllBytes(Path.Combine(output,stem+".png"),tex.EncodeToPNG());Destroy(tex);receipt.rows.Add(row);armed=false;
    }
   }
   File.WriteAllText(Path.Combine(output,"coordinate-probe.json"),JsonUtility.ToJson(receipt,true));Debug.Log("UI_COORD_PROBE completed "+receipt.rows.Count);Application.Quit(0);
  }
  void OnGUI(){if(!armed)return;var old=GUI.matrix;var color=GUI.color;int depth=GUI.depth;try{
   GUI.depth=-1000;GUI.matrix=Matrix4x4.identity;if(Event.current.type==EventType.Repaint){NativeUiAudit.BeginFrame();windowOrigin=GUIUtility.GUIToScreenPoint(Vector2.zero);}
   GUI.color=Color.black;GUI.DrawTexture(new Rect(0,0,Screen.width,Screen.height),Texture2D.whiteTexture);GUI.color=Color.cyan;
   float scale=Screen.height/1080f;var edge=Matrix4x4.Scale(new Vector3(scale,scale,1));GUI.matrix=current.StartsWith("right")?edge*Matrix4x4.Translate(new Vector3(Screen.width/scale-1920,0,0)):current.StartsWith("edge")?edge:Matrix4x4.identity;
   Rect r=new Rect(130,160,80,50),logical=r;bool group=current.EndsWith("group")||current.EndsWith("nested"),nested=current.EndsWith("nested"),scroll=current.EndsWith("scroll");
   if(group){GUI.BeginGroup(new Rect(180,240,600,500));logical.position+=new Vector2(180,240);}
   if(nested){GUI.BeginGroup(new Rect(40,55,300,250));logical.position+=new Vector2(40,55);}
   if(scroll){GUI.BeginScrollView(new Rect(180,240,600,500),new Vector2(25,35),new Rect(0,0,800,700),false,false,GUIStyle.none,GUIStyle.none);r=new Rect(570,485,100,80);logical=new Rect(725,690,55,50);}
   try{
    NativeUiAudit.DrawTexture(r,Texture2D.whiteTexture);NativeUiAudit.Region(r,"component","probe",current);
    if(Event.current.type==EventType.Repaint){var m=GUI.matrix;Vector2 a=m.MultiplyPoint3x4(logical.min),b=m.MultiplyPoint3x4(logical.max);var rawLogical=logical;if(scroll)rawLogical.size=new Vector2(100,80);Vector2 ra=m.MultiplyPoint3x4(rawLogical.min),rb=m.MultiplyPoint3x4(rawLogical.max);row=new Row{name=current,width=Screen.width,height=Screen.height,expected=Rect.MinMaxRect(a.x,a.y,b.x,b.y),rawExpected=Rect.MinMaxRect(ra.x,ra.y,rb.x,rb.y),legacyMin=GUIUtility.GUIToScreenPoint(r.min)-windowOrigin,legacyMax=GUIUtility.GUIToScreenPoint(r.max)-windowOrigin};
     GUI.matrix=Matrix4x4.identity;var imn=GUIUtility.GUIToScreenPoint(r.min)-windowOrigin;var imx=GUIUtility.GUIToScreenPoint(r.max)-windowOrigin;GUI.matrix=m;
     row.identityThenMatrixMin=m.MultiplyPoint3x4(imn);row.identityThenMatrixMax=m.MultiplyPoint3x4(imx);
     if(unclip!=null){row.unclipMin=(Vector2)unclip.Invoke(null,new object[]{r.min});row.unclipMax=(Vector2)unclip.Invoke(null,new object[]{r.max});}
    }
   }finally{if(scroll)GUI.EndScrollView();if(nested)GUI.EndGroup();if(group)GUI.EndGroup();}
  }finally{GUI.matrix=old;GUI.color=color;GUI.depth=depth;}}
 }
}
