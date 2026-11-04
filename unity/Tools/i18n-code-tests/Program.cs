using System;
using System.Collections.Generic;
using System.IO;
using Exoduser.UnityPort;
using Exoduser.UnityPort.Core;

namespace UnityEngine {
 public sealed class TextAsset { public string text; public TextAsset(string value){text=value;} }
 public static class Resources {
  public static readonly Dictionary<string,string> Fixtures=new Dictionary<string,string>();
  public static string Root;
  public static T Load<T>(string key) where T:class {
   string value; if(!Fixtures.TryGetValue(key,out value)){var file=Path.Combine(Root,key+".json");if(!File.Exists(file))return null;value=File.ReadAllText(file);}
   return new TextAsset(value) as T;
  }
 }
}
class Program {
 static int count;
 static void Equal(string expected,string actual,string name){count++;if(expected!=actual)throw new Exception(name+": expected ["+expected+"], got ["+actual+"]");}
 static void Main(string[] args){
  UnityEngine.Resources.Root=args[0];
  UnityEngine.Resources.Fixtures["Data/test-audit-nested"]="{\"localization\":{\"codes\":[\"ko\",\"en\",\"fr\"],\"entries\":[{\"path\":\"nodes[0].name\",\"key\":\"지능 (INT)\",\"texts\":[\"지능 (INT)\",\"INT\",\"INT\"]}]}}";
  Equal("INT",NativeLocaleCatalog.Get("test-audit-nested","지능 (INT)","fr"),"audit nested codes are inherited by entries");
  var locales=JsonValue.NewObject().Set("key",JsonValue.Of("move"));
  for(int i=0;i<LobbyLanguage.Count;i++){string code=LobbyLanguage.GetCode(i);locales.Set(code,JsonValue.Of(code+" move"));}
  UnityEngine.Resources.Fixtures["Data/test-inline"]=SaveJson.Write(JsonValue.NewObject().Set("entries",JsonValue.NewArray().Add(locales)));
  for(int i=0;i<LobbyLanguage.Count;i++){string code=LobbyLanguage.GetCode(i);Equal(code+" move",NativeLocaleCatalog.Get("test-inline","move",code),"29 inline "+code);}
  UnityEngine.Resources.Fixtures["Data/test-fallback"]="{\"entries\":[{\"id\":\"blank\",\"ko\":\"한국어\",\"en\":\"English\",\"de\":\"  \"},{\"id\":\"onlyKo\",\"ko\":\"한국어\"}]}";
  Equal("English",NativeLocaleCatalog.Get("test-fallback","blank","de"),"empty selected -> en");
  Equal("한국어",NativeLocaleCatalog.Get("test-fallback","onlyKo","fr"),"missing en -> ko");
  Equal("English",NativeLocaleCatalog.Get("test-fallback","blank","de-DE"),"normalized locale");
  Equal("English fallback",NativeLocaleCatalog.Get("test-fallback","INTERNAL_MISSING_KEY","ru","한국어 기본값","English fallback"),"missing key -> en literal");
  Equal("한국어 기본값",NativeLocaleCatalog.Get("test-fallback","INTERNAL_MISSING_KEY","ko","한국어 기본값","English fallback"),"ko source fallback");
  Equal("",NativeLocaleCatalog.Get("test-fallback","INTERNAL_MISSING_KEY","ru"),"never expose key");
  UnityEngine.Resources.Fixtures["Data/test-id"]="{\"entries\":[{\"id\":\"move\",\"ko\":\"이동\",\"en\":\"Move\",\"locales\":[{\"code\":\"id\",\"text\":\"Gerak\"}]}]}";
  Equal("Gerak",NativeLocaleCatalog.Get("test-id","move","id"),"Indonesian must not overwrite entry id");
  UnityEngine.Resources.Fixtures["Data/test-schemas"]="{\"nodes\":[{\"key\":\"pAtk\",\"nameKo\":\"공격\",\"nameEn\":\"Attack\",\"nameDe\":\"Angriff\"}],\"entries\":[{\"code\":\"en\",\"labels\":[{\"key\":\"시작\",\"text\":\"Start\"},{\"key\":\"빈 값\",\"text\":\"Fallback\"}]},{\"code\":\"de\",\"labels\":[{\"key\":\"시작\",\"text\":\"Starten\"},{\"key\":\"빈 값\",\"text\":\"\"}]}]}";
  Equal("Angriff",NativeLocaleCatalog.Get("test-schemas","공격","de"),"stat suffix schema");
  Equal("Starten",NativeLocaleCatalog.Get("test-schemas","시작","de"),"locale label rows");
  Equal("Fallback",NativeLocaleCatalog.Get("test-schemas","빈 값","de"),"per-key fallback within partial row");
  UnityEngine.Resources.Fixtures["Data/test-array"]="{\"codes\":[\"ko\",\"en\",\"fr\"],\"entries\":[{\"key\":\"원문\",\"texts\":[\"원문\",\"Source\",\"Traduction\"]}]}";
  Equal("Traduction",NativeLocaleCatalog.Get("test-array","원문","fr"),"codes/texts schema");
  Equal("Source",NativeLocaleCatalog.Get("test-array","원문","ru"),"absent language in codes");
  Equal("Bewege dich zuerst",NativeLocaleCatalog.Get("first_practice","moveTitle","de"),"real practice ID joins translated Korean alias");
  Equal("Coba bergerak dahulu",NativeLocaleCatalog.Get("first_practice","moveTitle","id"),"record ID resolves Indonesian translation");
  Equal("INT",NativeLocaleCatalog.Get("stat_panel_web","지능 (INT)","fr"),"real stat name is compact");
  Equal("Einstellungen",NativeLocaleCatalog.Get("a15_settings_labels_exact","settings.title","de"),"real exact locales");
  UnityEngine.Resources.Fixtures["Data/test-nested"]="{\"notes\":[{\"ko\":{\"sections\":[{\"title\":\"변경\",\"items\":[\"원문\"]}]},\"en\":{\"sections\":[{\"title\":\"Changes\",\"items\":[\"Source\"]}]},\"de\":{\"sections\":[{\"title\":\"Änderungen\",\"items\":[\"\"]}]}}]}";
  Equal("Änderungen",NativeLocaleCatalog.Get("test-nested","notes[0].sections[0].title","de"),"nested patch section");
  Equal("Source",NativeLocaleCatalog.Get("test-nested","notes[0].sections[0].items[0]","de"),"empty nested item -> en");
  Equal("Einstellungen",NativeLocaleCatalog.Text("설정","Settings","de"),"lobby K actual catalog route");
  Equal("설정",NativeLocaleCatalog.Text("설정","Settings","ko"),"lobby K language change");
  Equal("Предпросмотр",NativeLocaleCatalog.Text("미리보기","Preview","ru"),"filled source catalog selects Russian");
  Equal("Game",NativeLocaleCatalog.Get("a15_options_web","t.game","ko",null,"Game"),"missing internal option key never leaks");
  Console.OutputEncoding=System.Text.Encoding.UTF8;
  Console.WriteLine("로더 동작 검사 "+count+"건 통과");
 }
}
