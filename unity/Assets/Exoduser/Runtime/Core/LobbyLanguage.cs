using System;
namespace Exoduser.UnityPort.Core
{
 // Canonical order/names and alias semantics come from the original world intro UI.
 public static class LobbyLanguage
 {
  static readonly string[] codes={"ko", "en", "zh", "zht", "ja", "vi", "th", "id", "ms", "es", "fr", "it", "ptbr", "ro", "de", "nl", "sv", "da", "no", "ru", "uk", "pl", "cs", "hu", "bg", "el", "fi", "tr", "ar"};
  static readonly string[] names={"한국어", "English", "中文简体", "繁體中文", "日本語", "Tiếng Việt", "ไทย", "Bahasa Indonesia", "Bahasa Melayu", "Español (España)", "Français", "Italiano", "Português (Brasil)", "Română", "Deutsch", "Nederlands", "Svenska", "Dansk", "Norsk", "Русский", "Українська", "Polski", "Čeština", "Magyar", "Български", "Ελληνικά", "Suomi", "Türkçe", "العربية"};
  public static int Count { get { return codes.Length; } }
  public static string GetCode(int index) { return codes[index]; }
  public static string GetDisplayName(string value)
  {
   string code=Normalize(value);
   for(int i=0;i<codes.Length;i++)if(codes[i]==code)return names[i];
   return "English";
  }
  static bool Prefix(string value,string prefix)
  {
   return value==prefix||value.StartsWith(prefix+"-",StringComparison.Ordinal);
  }
  // Resolve preserves unknown -> null so callers can try a next browser preference.
  public static string Resolve(string value)
  {
   if(value==null)return null;
   string raw=value.ToLowerInvariant().Replace('_','-');
   if(Prefix(raw,"zh-tw")||Prefix(raw,"zh-hk")||Prefix(raw,"zh-mo")||Prefix(raw,"zh-hant"))return "zht";
   if(raw=="ptbr"||Prefix(raw,"pt"))return "ptbr";
   if(Prefix(raw,"nb")||Prefix(raw,"nn"))return "no";
   int separator=raw.IndexOf('-');
   string code=separator<0?raw:raw.Substring(0,separator);
   for(int i=0;i<codes.Length;i++)if(codes[i]==code)return code;
   return null;
  }
  public static string Normalize(string value) { return Resolve(value)??"en"; }
 }
}
