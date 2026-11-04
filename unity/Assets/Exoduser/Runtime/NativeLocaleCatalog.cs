using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
 // Read existing Data schemas without JsonUtility dropping newly supplied locale fields.
 // Parsing and indexing happen once per resource. Locale changes only select cached strings.
 public static class NativeLocaleCatalog
 {
  sealed class Table
  {
   internal readonly Dictionary<string,Dictionary<string,string>> Rows=new Dictionary<string,Dictionary<string,string>>(StringComparer.Ordinal);
   internal void Put(string key,string code,string value)
   {
    if(string.IsNullOrEmpty(key)||string.IsNullOrWhiteSpace(value))return;
    if(!Rows.TryGetValue(key,out var row))Rows[key]=row=new Dictionary<string,string>(StringComparer.Ordinal);
    row[code]=value;
   }
   internal string At(string key,string code)
   {return key!=null&&Rows.TryGetValue(key,out var row)&&row.TryGetValue(code,out var value)?value:null;}
  }
  static readonly Dictionary<string,Table> tables=new Dictionary<string,Table>(StringComparer.Ordinal);
  static readonly string[] sources={"native_ui_fallbacks","visual_select_labels","first_practice","stat_panel_web","keybind_ui_web","a15_settings_labels_exact","a15_options_web","demo_text","areatitle_web","character_dialog_labels","patch_notes_labels","stageclear_labels"};
  static bool Present(string text){return !string.IsNullOrWhiteSpace(text);}
  static string Source(string locale,string ko,string en)
  {return LobbyLanguage.Normalize(locale)==LobbyLanguage.GetCode(0)&&Present(ko)?ko:Present(en)?en:Present(ko)?ko:"";}
  static Table Load(string resource)
  {
   if(tables.TryGetValue(resource,out var table))return table;
   table=new Table();var asset=Resources.Load<TextAsset>("Data/"+resource);
   if(asset!=null){var root=SaveJson.Parse(asset.text);Walk(table,root,"",null,root.Get("codes"));}
   // Locale-row catalog keys often are field IDs. The Korean value is also a lookup alias.
   var aliases=new List<KeyValuePair<string,Dictionary<string,string>>>();
   var originalKeys=new HashSet<string>(table.Rows.Keys,StringComparer.Ordinal);
   foreach(var row in table.Rows)if(row.Value.TryGetValue(LobbyLanguage.GetCode(0),out var original)&&Present(original))aliases.Add(new KeyValuePair<string,Dictionary<string,string>>(original,row.Value));
   foreach(var alias in aliases){if(!table.Rows.TryGetValue(alias.Key,out var row))table.Rows[alias.Key]=row=new Dictionary<string,string>();foreach(var value in alias.Value)if(!row.ContainsKey(value.Key))row[value.Key]=value.Value;if(originalKeys.Contains(alias.Key))foreach(var value in row)if(!alias.Value.ContainsKey(value.Key))alias.Value[value.Key]=value.Value;}
   tables[resource]=table;return table;
  }
  static string String(JsonValue node){return node!=null&&node.Kind==JsonKind.String?node.Text:null;}
  static void Walk(Table table,JsonValue node,string path,string locale,JsonValue codes)
  {
   if(node==null)return;
   if(node.Kind==JsonKind.String&&locale!=null){table.Put(path,locale,node.Text);return;}
   if(node.Kind==JsonKind.Array){for(int i=0;i<node.Items.Count;i++){var child=node.Items[i];bool languageRow=child.Str("code")!=null;Walk(table,child,languageRow?path:path+"["+i+"]",locale,codes);}return;}
   if(node.Kind!=JsonKind.Object)return;
   if(node.Get("codes")?.Items!=null)codes=node.Get("codes");
   string rowCode=LobbyLanguage.Resolve(node.Str("code"));locale=rowCode??locale;
   string id=node.Str("key")??node.Str("id"),identity=id??path;
   var texts=node.Get("texts");
   if(codes?.Items!=null&&texts?.Items!=null)for(int i=0;i<codes.Items.Count&&i<texts.Items.Count;i++)table.Put(identity,String(codes.Items[i]),String(texts.Items[i]));
   if(locale!=null){
    string text=node.Str("text");if(text!=null)table.Put(identity,locale,text);
    foreach(var member in node.Members)if(member.Key!="code"&&member.Key!="key"&&member.Key!="id"&&member.Key!="text"&&member.Value.Kind==JsonKind.String)table.Put(path+"."+member.Key,locale,member.Value.Text);
   }
   // Inline {ko,en,de,...}, legacy {kr,en}, and stat {nameKo,nameEn,nameDe,...}.
   foreach(var member in node.Members){
    string prefix=null;if(member.Key=="ko"||member.Key=="kr")prefix="";else if(member.Key.EndsWith("Ko",StringComparison.Ordinal))prefix=member.Key.Substring(0,member.Key.Length-2);
    if(prefix==null||member.Value.Kind!=JsonKind.String)continue;
    string key=prefix.Length==0?identity:identity+"."+prefix;
    for(int i=0;i<LobbyLanguage.Count;i++){
     string code=LobbyLanguage.GetCode(i),field=prefix.Length==0?code:prefix+char.ToUpperInvariant(code[0])+code.Substring(1);
     string value=node.Str(field);if(i==0)value=member.Value.Text;
     // `id` is the record identifier in first_practice. Indonesian lives in locales[].
     if(prefix.Length==0&&code=="id"&&node.Str("key")==null)value=null;
     table.Put(key,code,value);table.Put(member.Value.Text,code,value);
    }
   }
   var locales=node.Get("locales");if(locales?.Items!=null)foreach(var value in locales.Items){string code=LobbyLanguage.Resolve(value.Str("code"));if(code!=null){table.Put(identity,code,value.Str("text"));table.Put(node.Str("nativeKo"),code,value.Str("text"));}}
   foreach(var member in node.Members){
    if(member.Key=="source"||member.Key=="atlas"||member.Key=="sourceFiles"||member.Key=="locales")continue;
    string nestedLocale=LobbyLanguage.Resolve(member.Key);
    bool languageObject=nestedLocale!=null&&(member.Value.Kind==JsonKind.Object||member.Value.Kind==JsonKind.Array);
    Walk(table,member.Value,languageObject?path:path.Length==0?member.Key:path+"."+member.Key,languageObject?nestedLocale:locale,codes);
   }
  }
  public static string Get(string resource,string key,string locale,string ko=null,string en=null)
  {
   var table=Load(resource);string code=LobbyLanguage.Normalize(locale),value=table.At(key,code);
   if(Present(value))return value;
   // Supplied originals are part of the row, especially for catalogs without a KO record.
   if(code==LobbyLanguage.GetCode(0)&&Present(ko))return ko;
   value=table.At(key,"en");if(Present(value))return value;if(Present(en))return en;
   value=table.At(key,"ko");return Present(value)?value:Source(locale,ko,null);
  }
  public static string Text(string ko,string en,string locale)
  {
   string code=LobbyLanguage.Normalize(locale);
   foreach(var source in sources){var value=Load(source).At(ko,code);if(Present(value))return value;}
   if(code==LobbyLanguage.GetCode(0)&&Present(ko))return ko;
   foreach(var source in sources){var value=Load(source).At(ko,"en");if(Present(value))return value;}
   if(Present(en))return en;
   foreach(var source in sources){var value=Load(source).At(ko,"ko");if(Present(value))return value;}
   return Present(ko)?ko:"";
  }
 }
}
