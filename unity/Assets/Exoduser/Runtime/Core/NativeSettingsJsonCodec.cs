using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace Exoduser.UnityPort.Core
{
 // Small settings-only JSON codec: keeps unknown top-level values (including future gamepad data)
 // byte-for-byte as JSON values while emitting the 20 known keyboard actions explicitly.
 public static class NativeSettingsJsonCodec
 {
  static readonly HashSet<string> Known=new HashSet<string>{"schema","version","revision","sfxPercent","bgmPercent","frameCap","fullscreen","binds","binds2"};
  public static string Encode(NativeSettingsSnapshot s)
  {
   var b=new StringBuilder("{");
   Add(b,"schema",Quote(s.schema));Add(b,"version",s.version.ToString(CultureInfo.InvariantCulture));Add(b,"revision",s.revision.ToString(CultureInfo.InvariantCulture));
   Add(b,"sfxPercent",s.sfxPercent.ToString(CultureInfo.InvariantCulture));Add(b,"bgmPercent",s.bgmPercent.ToString(CultureInfo.InvariantCulture));Add(b,"frameCap",s.frameCap.ToString(CultureInfo.InvariantCulture));Add(b,"fullscreen",s.fullscreen?"true":"false");
   Add(b,"binds",Bindings(s.binds,false));Add(b,"binds2",Bindings(s.binds2,true));
   if(s.extra!=null)foreach(var entry in s.extra){if(!Known.Contains(entry.Key))Add(b,entry.Key,entry.Value);}
   return b.Append('}').ToString();
  }
  static void Add(StringBuilder b,string key,string value){if(b.Length>1)b.Append(',');b.Append(Quote(key)).Append(':').Append(value);}
  static string Bindings(string[] values,bool secondary)
  {
   var b=new StringBuilder("{");for(int i=0;i<KeyBindings.Actions.Length;i++){
    if(i>0)b.Append(',');string v=values!=null&&i<values.Length?values[i]:(secondary?null:KeyBindings.DefaultPrimaryOf(KeyBindings.Actions[i]));
    b.Append(Quote(KeyBindings.Actions[i])).Append(':').Append(v==null?"null":Quote(v));
   }return b.Append('}').ToString();
  }
  static string Quote(string value)
  {
   if(value==null)return "null";var b=new StringBuilder("\"");foreach(char c in value){switch(c){case '"':b.Append("\\\"");break;case '\\':b.Append("\\\\");break;case '\n':b.Append("\\n");break;case '\r':b.Append("\\r");break;case '\t':b.Append("\\t");break;default:if(c<32)b.Append("\\u").Append(((int)c).ToString("x4"));else b.Append(c);break;}}return b.Append('"').ToString();
  }
  public static NativeSettingsSnapshot Decode(string json)
  {
   var fields=new Reader(json).Object();var s=new NativeSettingsSnapshot();
   s.schema=String(fields,"schema");s.version=Int(fields,"version");s.revision=Long(fields,"revision");s.sfxPercent=Int(fields,"sfxPercent");s.bgmPercent=Int(fields,"bgmPercent");s.frameCap=Int(fields,"frameCap");s.fullscreen=Bool(fields,"fullscreen");
   s.binds=Defaults(false);s.binds2=Defaults(true);
   if(s.version==2){ReadBindings(fields,"binds",s.binds);ReadBindings(fields,"binds2",s.binds2);}
   s.extra=new Dictionary<string,string>();foreach(var entry in fields)if(!Known.Contains(entry.Key))s.extra.Add(entry.Key,entry.Value);
   return s;
  }
  public static string[] Defaults(bool secondary){var a=new string[KeyBindings.Actions.Length];if(!secondary)for(int i=0;i<a.Length;i++)a[i]=KeyBindings.DefaultPrimaryOf(KeyBindings.Actions[i]);return a;}
  public static void ApplyBindings(NativeSettingsSnapshot snapshot,KeyBindings bindings,Func<string,bool> supported)
  {
   if(snapshot==null||bindings==null||supported==null)throw new ArgumentNullException();
   bindings.ResetAll();string rejection;
   // Remove stale defaults before restoring remapped charge/weapon/shield values.
   foreach(string action in KeyBindings.Actions){bindings.TrySet(action,null,false,out rejection);bindings.ClearSecondary(action);}
   for(int i=0;i<KeyBindings.Actions.Length;i++){
    string action=KeyBindings.Actions[i],code=snapshot.binds!=null&&i<snapshot.binds.Length?snapshot.binds[i]:KeyBindings.DefaultPrimaryOf(action);
    if(code!=null&&!supported(code))code=KeyBindings.DefaultPrimaryOf(action);
    bindings.TrySet(action,code,false,out rejection);
   }
   for(int i=0;i<KeyBindings.Actions.Length;i++){
    string action=KeyBindings.Actions[i],code=snapshot.binds2!=null&&i<snapshot.binds2.Length?snapshot.binds2[i]:null;
    if(code==null||supported(code))bindings.TrySet(action,code,true,out rejection);
   }
  }
  static void ReadBindings(Dictionary<string,string> fields,string name,string[] target)
  {
   string raw;if(!fields.TryGetValue(name,out raw)||!raw.TrimStart().StartsWith("{",StringComparison.Ordinal))return;
   Dictionary<string,string> values;try{values=new Reader(raw).Object();}catch(FormatException){return;}
   for(int i=0;i<KeyBindings.Actions.Length;i++){string item;if(!values.TryGetValue(KeyBindings.Actions[i],out item))continue;
    if(item=="null")target[i]=null;else if(item.Length>=2&&item[0]=='"'){try{string code=new Reader(item).StringValue();if(code.Length>0&&code.Length<=64)target[i]=code;}catch(FormatException){}}
   }
  }
  static string String(Dictionary<string,string> f,string k){string v;return f.TryGetValue(k,out v)?new Reader(v).StringValue():null;}
  static int Int(Dictionary<string,string> f,string k){string v;int n;return f.TryGetValue(k,out v)&&int.TryParse(v,NumberStyles.Integer,CultureInfo.InvariantCulture,out n)?n:int.MinValue;}
  static long Long(Dictionary<string,string> f,string k){string v;long n;return f.TryGetValue(k,out v)&&long.TryParse(v,NumberStyles.Integer,CultureInfo.InvariantCulture,out n)?n:long.MinValue;}
  static bool Bool(Dictionary<string,string> f,string k){string v;if(!f.TryGetValue(k,out v)||v!="true"&&v!="false")throw new FormatException("boolean");return v=="true";}
  sealed class Reader
  {
   readonly string s;int p;public Reader(string text){s=text??throw new FormatException("null");}
   void Ws(){while(p<s.Length&&char.IsWhiteSpace(s[p]))p++;}char Peek(){Ws();if(p>=s.Length)throw new FormatException("eof");return s[p];}
   void Expect(char c){if(Peek()!=c)throw new FormatException("token");p++;}
   public string StringValue(){var b=new StringBuilder();Expect('"');while(p<s.Length){char c=s[p++];if(c=='"'){Ws();if(p!=s.Length)throw new FormatException("trailing");return b.ToString();}if(c<32)throw new FormatException("control");if(c!='\\'){b.Append(c);continue;}if(p>=s.Length)throw new FormatException("escape");c=s[p++];switch(c){case '"':b.Append('"');break;case '\\':b.Append('\\');break;case '/':b.Append('/');break;case 'b':b.Append('\b');break;case 'f':b.Append('\f');break;case 'n':b.Append('\n');break;case 'r':b.Append('\r');break;case 't':b.Append('\t');break;case 'u':if(p+4>s.Length)throw new FormatException("unicode");int code;if(!int.TryParse(s.Substring(p,4),NumberStyles.HexNumber,CultureInfo.InvariantCulture,out code))throw new FormatException("unicode");b.Append((char)code);p+=4;break;default:throw new FormatException("escape");}}throw new FormatException("string");}
   string ParseString(){var b=new StringBuilder();Expect('"');while(p<s.Length){char c=s[p++];if(c=='"')return b.ToString();if(c<32)throw new FormatException("control");if(c!='\\'){b.Append(c);continue;}if(p>=s.Length)throw new FormatException("escape");c=s[p++];switch(c){case '"':b.Append('"');break;case '\\':b.Append('\\');break;case '/':b.Append('/');break;case 'b':b.Append('\b');break;case 'f':b.Append('\f');break;case 'n':b.Append('\n');break;case 'r':b.Append('\r');break;case 't':b.Append('\t');break;case 'u':if(p+4>s.Length)throw new FormatException("unicode");int code;if(!int.TryParse(s.Substring(p,4),NumberStyles.HexNumber,CultureInfo.InvariantCulture,out code))throw new FormatException("unicode");b.Append((char)code);p+=4;break;default:throw new FormatException("escape");}}throw new FormatException("string");}
   string Token(){char c=Peek();int start=p;if(c=='"'){ParseString();return s.Substring(start,p-start);}if(c=='{'){p++;if(Peek()=='}'){p++;return s.Substring(start,p-start);}while(true){ParseString();Expect(':');Token();char next=Peek();if(next=='}'){p++;break;}Expect(',');}return s.Substring(start,p-start);}if(c=='['){p++;if(Peek()==']'){p++;return s.Substring(start,p-start);}while(true){Token();char next=Peek();if(next==']'){p++;break;}Expect(',');}return s.Substring(start,p-start);}while(p<s.Length&&s[p]!=','&&s[p]!='}'&&s[p]!=']'&&!char.IsWhiteSpace(s[p]))p++;string v=s.Substring(start,p-start);double n;if(v!="true"&&v!="false"&&v!="null"&&!double.TryParse(v,NumberStyles.Float,CultureInfo.InvariantCulture,out n))throw new FormatException("value");return v;}
   public Dictionary<string,string> Object(){var d=new Dictionary<string,string>();Expect('{');if(Peek()=='}'){p++;Ws();if(p!=s.Length)throw new FormatException("trailing");return d;}while(true){string key=ParseString();Expect(':');string value=Token();if(d.ContainsKey(key))throw new FormatException("duplicate");d.Add(key,value);char next=Peek();if(next=='}'){p++;break;}Expect(',');}Ws();if(p!=s.Length)throw new FormatException("trailing");return d;}
  }
 }
}
