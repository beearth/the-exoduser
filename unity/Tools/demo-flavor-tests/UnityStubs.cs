using System;using System.IO;using System.Text.Json;
namespace UnityEngine {
 public struct Color {public Color(float r,float g,float b,float a){}}
 public sealed class TextAsset {public string text;}
 public static class Resources {public static T Load<T>(string p) where T:class {var file=Path.Combine(Environment.GetEnvironmentVariable("EXO_TEST_RESOURCE_ROOT"),p+".json");return File.Exists(file)?new TextAsset{text=File.ReadAllText(file)} as T:null;}}
 public static class JsonUtility {public static T FromJson<T>(string s){return JsonSerializer.Deserialize<T>(s,new JsonSerializerOptions{IncludeFields=true});}}
 public static class Debug {public static void LogWarning(string s){Console.WriteLine(s);}}
}
