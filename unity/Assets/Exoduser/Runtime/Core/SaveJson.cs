using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace Exoduser.UnityPort.Core
{
 public enum JsonKind { Null,Bool,Number,String,Array,Object }
 // Ordered JSON tree for the web save shape (JsonUtility cannot write the slot-keyed `inv.equipped` object or free-form passthrough sections).
 public sealed class JsonValue
 {
  public JsonKind Kind;
  public bool Bool;
  public double Number;
  public string Text;                                   // String value, or the original Number token (kept for byte-exact passthrough)
  public List<JsonValue> Items;
  public List<KeyValuePair<string,JsonValue>> Members;
  public static readonly JsonValue Null=new JsonValue{Kind=JsonKind.Null};
  public static JsonValue Of(bool v){return new JsonValue{Kind=JsonKind.Bool,Bool=v};}
  public static JsonValue Of(double v){return new JsonValue{Kind=JsonKind.Number,Number=v};}
  public static JsonValue Of(string v){return v==null?Null:new JsonValue{Kind=JsonKind.String,Text=v};}
  public static JsonValue NewArray(){return new JsonValue{Kind=JsonKind.Array,Items=new List<JsonValue>()};}
  public static JsonValue NewObject(){return new JsonValue{Kind=JsonKind.Object,Members=new List<KeyValuePair<string,JsonValue>>()};}
  public JsonValue Add(JsonValue v){Items.Add(v);return this;}
  public JsonValue Set(string key,JsonValue v){
   for(int i=0;i<Members.Count;i++)if(Members[i].Key==key){Members[i]=new KeyValuePair<string,JsonValue>(key,v);return this;}
   Members.Add(new KeyValuePair<string,JsonValue>(key,v));return this;
  }
  public JsonValue Get(string key){if(Members==null)return null;for(int i=0;i<Members.Count;i++)if(Members[i].Key==key)return Members[i].Value;return null;}
  public bool Has(string key){return Get(key)!=null;}
  // JS `+x||fallback` style readers: wrong kind or missing means the fallback, like the web restore code.
  public double Num(string key,double fallback){var v=Get(key);return v!=null&&v.Kind==JsonKind.Number?v.Number:fallback;}
  public string Str(string key){var v=Get(key);return v!=null&&v.Kind==JsonKind.String?v.Text:null;}
 }

 public static class SaveJson
 {
  public const int MaxDepth=64;
  public static string Write(JsonValue v){var b=new StringBuilder();Write(b,v);return b.ToString();}
  public static string Number(double d)
  {
   if(double.IsNaN(d)||double.IsInfinity(d))return "null";           // JSON.stringify(NaN|Infinity) === "null"
   if(d==0)return "0";
   if(d==Math.Floor(d)&&Math.Abs(d)<1e15)return ((long)d).ToString(CultureInfo.InvariantCulture);
   return d.ToString("R",CultureInfo.InvariantCulture);
  }
  static void Write(StringBuilder b,JsonValue v)
  {
   switch(v.Kind)
   {
    case JsonKind.Null:b.Append("null");break;
    case JsonKind.Bool:b.Append(v.Bool?"true":"false");break;
    case JsonKind.Number:b.Append(v.Text!=null?v.Text:Number(v.Number));break;
    case JsonKind.String:Quote(b,v.Text);break;
    case JsonKind.Array:b.Append('[');for(int i=0;i<v.Items.Count;i++){if(i>0)b.Append(',');Write(b,v.Items[i]);}b.Append(']');break;
    default:b.Append('{');for(int i=0;i<v.Members.Count;i++){if(i>0)b.Append(',');Quote(b,v.Members[i].Key);b.Append(':');Write(b,v.Members[i].Value);}b.Append('}');break;
   }
  }
  static void Quote(StringBuilder b,string s)
  {
   b.Append('"');
   foreach(char c in s)
   {
    switch(c)
    {
     case '"':b.Append("\\\"");break;case '\\':b.Append("\\\\");break;case '\n':b.Append("\\n");break;case '\r':b.Append("\\r");break;
     case '\t':b.Append("\\t");break;case '\b':b.Append("\\b");break;case '\f':b.Append("\\f");break;
     default:if(c<32)b.Append("\\u").Append(((int)c).ToString("x4"));else b.Append(c);break;
    }
   }
   b.Append('"');
  }

  public static JsonValue Parse(string text)
  {
   if(text==null)throw new FormatException("null json");
   int i=0;var v=ParseValue(text,ref i,0);Skip(text,ref i);
   if(i!=text.Length)throw new FormatException("trailing json at "+i);
   return v;
  }
  static void Skip(string s,ref int i){while(i<s.Length&&(s[i]==' '||s[i]=='\t'||s[i]=='\n'||s[i]=='\r'))i++;}
  static JsonValue ParseValue(string s,ref int i,int depth)
  {
   if(depth>MaxDepth)throw new FormatException("json too deep");
   Skip(s,ref i);if(i>=s.Length)throw new FormatException("unexpected end");
   char c=s[i];
   if(c=='{')
   {
    i++;var o=JsonValue.NewObject();Skip(s,ref i);
    if(i<s.Length&&s[i]=='}'){i++;return o;}
    while(true)
    {
     Skip(s,ref i);if(i>=s.Length||s[i]!='"')throw new FormatException("object key expected at "+i);
     string key=ParseString(s,ref i);Skip(s,ref i);if(i>=s.Length||s[i]!=':')throw new FormatException("colon expected at "+i);i++;
     var val=ParseValue(s,ref i,depth+1);o.Set(key,val);Skip(s,ref i);
     if(i<s.Length&&s[i]==','){i++;continue;}
     if(i<s.Length&&s[i]=='}'){i++;return o;}
     throw new FormatException("object end expected at "+i);
    }
   }
   if(c=='[')
   {
    i++;var a=JsonValue.NewArray();Skip(s,ref i);
    if(i<s.Length&&s[i]==']'){i++;return a;}
    while(true)
    {
     a.Items.Add(ParseValue(s,ref i,depth+1));Skip(s,ref i);
     if(i<s.Length&&s[i]==','){i++;continue;}
     if(i<s.Length&&s[i]==']'){i++;return a;}
     throw new FormatException("array end expected at "+i);
    }
   }
   if(c=='"')return JsonValue.Of(ParseString(s,ref i));
   if(string.CompareOrdinal(s,i,"true",0,4)==0){i+=4;return JsonValue.Of(true);}
   if(string.CompareOrdinal(s,i,"false",0,5)==0){i+=5;return JsonValue.Of(false);}
   if(string.CompareOrdinal(s,i,"null",0,4)==0){i+=4;return JsonValue.Null;}
   int start=i;if(i<s.Length&&s[i]=='-')i++;
   while(i<s.Length&&(char.IsDigit(s[i])||s[i]=='.'||s[i]=='e'||s[i]=='E'||s[i]=='+'||s[i]=='-'))i++;
   double d;if(i==start||!double.TryParse(s.Substring(start,i-start),NumberStyles.Float,CultureInfo.InvariantCulture,out d)||double.IsInfinity(d))throw new FormatException("bad value at "+start);
   return new JsonValue{Kind=JsonKind.Number,Number=d,Text=s.Substring(start,i-start)};
  }
  static string ParseString(string s,ref int i)
  {
   i++;var b=new StringBuilder();
   while(true)
   {
    if(i>=s.Length)throw new FormatException("unterminated string");
    char c=s[i++];
    if(c=='"')return b.ToString();
    if(c!='\\'){b.Append(c);continue;}
    if(i>=s.Length)throw new FormatException("bad escape");
    char e=s[i++];
    switch(e)
    {
     case '"':b.Append('"');break;case '\\':b.Append('\\');break;case '/':b.Append('/');break;case 'n':b.Append('\n');break;case 'r':b.Append('\r');break;
     case 't':b.Append('\t');break;case 'b':b.Append('\b');break;case 'f':b.Append('\f');break;
     case 'u':{if(i+4>s.Length)throw new FormatException("bad unicode escape");b.Append((char)Convert.ToInt32(s.Substring(i,4),16));i+=4;break;}
     default:throw new FormatException("bad escape \\"+e);
    }
   }
  }
 }
}
