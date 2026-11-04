// Source-only probe: run.cjs compiles the actual renderer methods into small
// hosts. Unity font metrics, pixels and the full Player remain Mac gates.
using System;
using System.Collections.Generic;
using System.IO;
using Exoduser.UnityPort;
using UnityEngine;
namespace UnityEngine {
 public sealed class TextAsset { public string text; public TextAsset(string v){text=v;} }
 public static class Resources { public static string Root; public static T Load<T>(string key) where T:class {var p=Path.Combine(Root,key+".json");return File.Exists(p)?new TextAsset(File.ReadAllText(p)) as T:null;} }
 public class Font {}
 public enum FontStyle {Normal,Bold}
 public enum TextClipping {Overflow,Clip}
 public enum TextAnchor {MiddleLeft,MiddleCenter,UpperCenter,MiddleRight}
 public struct Color {public float r,g,b,a;public Color(float r,float g,float b,float a=1){this.r=r;this.g=g;this.b=b;this.a=a;} }
 public struct Rect {public float x,y,width,height; public float xMax=>x+width;public Rect(float a,float b,float c,float d){x=a;y=b;width=c;height=d;} }
 public sealed class GUIContent {public string text;public GUIContent(string v){text=v;} }
 public sealed class GUIStyleState {public Color textColor;}
 public class GUIStyle {
  public TextClipping clipping;public GUIStyleState normal=new GUIStyleState();
  public GUIStyle(){} public GUIStyle(GUIStyle s){clipping=s.clipping;}
  public Rect CalcSize(GUIContent c){return new Rect(System.Globalization.StringInfo.ParseCombiningCharacters(c.text).Length*10,20,0,0);}
 }
 public static class Mathf {public static float Min(float a,float b)=>Math.Min(a,b);public static float Max(float a,float b)=>Math.Max(a,b);}
}
namespace Exoduser.UnityPort {
 static class NativeUiAudit {public static IDisposable GroupText(Rect r,string s)=>new Scope();sealed class Scope:IDisposable {public void Dispose(){}}}
 static class NativeSilverHellUi {public static readonly List<(Rect rect,string text)> Paint=new List<(Rect,string)>();public static void Label(Rect r,string s,GUIStyle st){Paint.Add((r,s));} }
}
class RendererTests {
 static int count;static List<string> failures=new List<string>();
 static void Check(bool ok,string name){count++;if(!ok)failures.Add(name);}
 static string Painted(){return string.Concat(NativeSilverHellUi.Paint.ConvertAll(x=>x.text));}
 static void Main(string[] args){
  Console.OutputEncoding=System.Text.Encoding.UTF8;
  Resources.Root=args[0];
  var skills=new SkillsProbe();var inventory=new InventoryProbe();var forge=new ForgeProbe();var r=new Rect(0,0,2000,40);var font=new Font();var color=new Color();
  foreach(var code in new[]{"ko","de","fr"}){
   skills.LocaleCode=inventory.LocaleCode=forge.LocaleCode=code;
   foreach(var key in new[]{"가시덫","회복의 영역","칼등 처내기","닫기 [ESC]"}){
    string expected=NativeLocaleCatalog.Text(key,null,code);
    NativeSilverHellUi.Paint.Clear();skills.Text(r,key,font,16,color);Check(Painted()==expected,"skills paint "+code+" "+key);
    Check(skills.Width(font,16,FontStyle.Normal,key,0)==expected.Length*10,"skills measure "+code+" "+key);
    NativeSilverHellUi.Paint.Clear();skills.Text(r,key,font,16,color,spacing:1);Check(Painted()==expected,"skills spaced "+code+" "+key);
   }
   string all=NativeLocaleCatalog.Text("전체",null,code);
   NativeSilverHellUi.Paint.Clear();inventory.Serif(r,"전체",16,color,spacing:1);Check(Painted()==all,"ossuary paint "+code);
   Check(inventory.SerifWidth("전체",16,false,0)==all.Length*10,"ossuary measure "+code);
   NativeSilverHellUi.Paint.Clear();forge.Txt(r,"전체",ForgeProbe.F.NM,16,color,sp:1);Check(Painted()==all,"forge paint "+code);
   Check(forge.Meas("전체",ForgeProbe.F.NM,16)==all.Length*10,"forge measure "+code);
  }
  Console.WriteLine("renderer source methods: "+count+" checks, "+failures.Count+" failures");foreach(var f in failures)Console.WriteLine("FAIL "+f);if(failures.Count>0)Environment.ExitCode=1;
 }
}
