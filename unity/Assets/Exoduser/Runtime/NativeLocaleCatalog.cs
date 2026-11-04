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
   internal readonly Dictionary<string,string> Paths=new Dictionary<string,string>(StringComparer.Ordinal);
   readonly Dictionary<string,List<string>> originals=new Dictionary<string,List<string>>(StringComparer.Ordinal);
   readonly Dictionary<string,string> aliases=new Dictionary<string,string>(StringComparer.Ordinal);
   internal void Put(string key,string code,string value)
   {
    if(string.IsNullOrEmpty(key)||string.IsNullOrWhiteSpace(value))return;
    if(!Rows.TryGetValue(key,out var row))Rows[key]=row=new Dictionary<string,string>(StringComparer.Ordinal);
    row[code]=value;
    if(code=="ko"){
     if(!originals.TryGetValue(value,out var keys))originals[value]=keys=new List<string>();
     if(!keys.Contains(key))keys.Add(key);
    }
   }
   internal void IndexAliases(){
    foreach(var original in originals){
     string first=original.Value[0];bool same=true;
     foreach(var key in original.Value){
      var a=Rows[first];var b=Rows[key];
      if(a.Count!=b.Count){same=false;break;}
      foreach(var value in a)if(!b.TryGetValue(value.Key,out var other)||other!=value.Value){same=false;break;}
      if(!same)break;
     }
     // Ambiguous originals never combine partial translations from independent IDs.
     if(same)aliases[original.Key]=first;
    }
   }
   internal string At(string key,string code)
   {
    if(key==null)return null;
    if(!Rows.TryGetValue(key,out var row)){
     if(!aliases.TryGetValue(key,out var target))return null;
     row=Rows[target];
    }
    return row.TryGetValue(code,out var value)?value:null;
   }
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
   table.IndexAliases();
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
   // Audit overlays identify the original field by path, never by shared KO text.
   if(texts?.Items!=null&&node.Str("path")!=null&&table.Paths.TryGetValue(node.Str("path"),out var target))identity=target;
   else table.Paths[path]=identity;
   if(codes?.Items!=null&&texts?.Items!=null)for(int i=0;i<codes.Items.Count&&i<texts.Items.Count;i++)table.Put(identity,String(codes.Items[i]),String(texts.Items[i]));
   if(locale!=null){
    string text=node.Str("text");if(text!=null)table.Put(identity,locale,text);
    foreach(var member in node.Members)if(member.Key!="code"&&member.Key!="key"&&member.Key!="id"&&member.Key!="text"&&member.Value.Kind==JsonKind.String)table.Put(path+"."+member.Key,locale,member.Value.Text);
   }
   // Inline {ko,en,de,...}, legacy {kr,en}, and stat {nameKo,nameEn,nameDe,...}.
   foreach(var member in node.Members){
    if(member.Key=="nativeKo"&&node.Get("locales")?.Items!=null)continue;
    string prefix=null;if(member.Key=="ko"||member.Key=="kr")prefix="";else if(member.Key.EndsWith("Ko",StringComparison.Ordinal))prefix=member.Key.Substring(0,member.Key.Length-2);
    if(prefix==null||member.Value.Kind!=JsonKind.String)continue;
    string key=prefix.Length==0?identity:identity+"."+prefix;
    table.Paths[prefix.Length==0?path:path+"."+prefix]=key;
    for(int i=0;i<LobbyLanguage.Count;i++){
     string code=LobbyLanguage.GetCode(i),field=prefix.Length==0?code:prefix+char.ToUpperInvariant(code[0])+code.Substring(1);
     string value=node.Str(field);if(i==0)value=member.Value.Text;
     // `id` is the record identifier in first_practice. Indonesian lives in locales[].
     if(prefix.Length==0&&code=="id"&&node.Str("key")==null)value=null;
     table.Put(key,code,value);
    }
   }
   var locales=node.Get("locales");if(locales?.Items!=null){
    table.Put(identity,LobbyLanguage.GetCode(0),node.Str("nativeKo"));table.Put(identity,"en",node.Str("nativeEn"));
    foreach(var value in locales.Items){string code=LobbyLanguage.Resolve(value.Str("code"));if(code!=null)table.Put(identity,code,value.Str("text"));}
   }
   foreach(var member in node.Members){
    if(member.Key=="source"||member.Key=="atlas"||member.Key=="sourceFiles"||member.Key=="locales"||member.Key=="localization")continue;
    string nestedLocale=LobbyLanguage.Resolve(member.Key);
    bool languageObject=nestedLocale!=null&&(member.Value.Kind==JsonKind.Object||member.Value.Kind==JsonKind.Array);
    Walk(table,member.Value,languageObject?path:path.Length==0?member.Key:path+"."+member.Key,languageObject?nestedLocale:locale,codes);
   }
   // Resolve structural paths before applying their translation overlays, regardless of JSON member order.
   Walk(table,node.Get("localization"),path.Length==0?"localization":path+".localization",locale,codes);
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
