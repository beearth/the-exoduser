// Only resource, JSON and IMGUI measurement boundaries are substituted.
// These are not Unity API compatibility or screen tests.
using System;
using System.Text.Json;
namespace UnityEngine
{
 public struct Rect
 {
  public float x,y,width,height;
  public Rect(float x,float y,float width,float height){this.x=x;this.y=y;this.width=width;this.height=height;}
  public float yMin=>y;
  public float yMax=>y+height;
 }
 public sealed class GUIContent {public GUIContent(string text){}}
 public sealed class GUIStyle
 {
  public object font;public TextClipping clipping;
  public GUIStyle(){}public GUIStyle(GUIStyle source){font=source.font;clipping=source.clipping;}
 }
 public enum TextClipping {Clip}
 public enum EventType {Repaint,Layout}
 public sealed class Event {public static Event current=new Event();public EventType type;}
 public struct Matrix4x4 {public float m11;}
 public static class GUI {public static Matrix4x4 matrix=new Matrix4x4{m11=1};}
 public static class Mathf
 {
  public static float Max(float a,float b)=>Math.Max(a,b);
  public static float Abs(float value)=>Math.Abs(value);
  public static float Ceil(float value)=>(float)Math.Ceiling(value);
 }
 public sealed class TextAsset {public string text;}
 public static class Debug
 {
  public static int Warnings;public static string LastWarning;
  public static void LogWarning(object message){Warnings++;LastWarning=message.ToString();}
 }
 public static class Resources
 {
  public static Func<Type,string,object> Loader;
  public static T Load<T>(string name) where T:class=>(T)Loader(typeof(T),name);
 }
 public static class JsonUtility
 {
  public static T FromJson<T>(string json)=>JsonSerializer.Deserialize<T>(json,new JsonSerializerOptions{IncludeFields=true});
 }
}
namespace UnityEngine.UIElements {public sealed class PanelSettings{}}
namespace UnityEngine.TextCore.Text {public sealed class FontAsset{}}
namespace Exoduser.UnityPort
{
 internal static class NativeUiAudit
 {
  internal static Func<UnityEngine.Rect,UnityEngine.Rect> Measure;
  internal static UnityEngine.Rect TextLayoutBounds(UnityEngine.Rect rect,UnityEngine.GUIContent content,UnityEngine.GUIStyle style)=>Measure(rect);
 }
 internal static class NativeSilverHellUi
 {
  internal static int Labels;internal static string LastText;
  internal static object TextFont(object original,string text)=>original;
  internal static void Label(UnityEngine.Rect rect,string text,UnityEngine.GUIStyle style){Labels++;LastText=text;}
 }
}
