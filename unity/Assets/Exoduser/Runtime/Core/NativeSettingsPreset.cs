using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace Exoduser.UnityPort.Core
{
 public enum PresetResult { Loaded, Empty, Invalid }
 // Web _savePreset/_loadPreset (game.html 49815-49843): one JSON per slot holding binds (primary keys), binds2 (secondary keys) and opt (which carries lang).
 // Unity adds the audio/FPS values that live in NativeSettingsState instead of OPT: {"opt":{..,"lang":".."},"binds":{..},"binds2":{..},"sfxVol":n,"bgmVol":n,"fpsCap":n}.
 // Older Unity slots ({"opt":..,"sfxVol":..,"bgmVol":..,"fpsCap":..}) still load: a missing part leaves the current value alone.
 public static class NativeSettingsPreset
 {
  public static string Encode(NativeSettingsState state,KeyBindings keys)
  {
   var b=new StringBuilder("{\"opt\":").Append(state.Options.Encode());
   b.Append(",\"binds\":").Append(Bindings(keys,false)).Append(",\"binds2\":").Append(Bindings(keys,true));
   b.Append(",\"sfxVol\":").Append(state.SfxPercent.ToString(CultureInfo.InvariantCulture));
   b.Append(",\"bgmVol\":").Append(state.BgmPercent.ToString(CultureInfo.InvariantCulture));
   b.Append(",\"fpsCap\":").Append(state.FrameCap.ToString(CultureInfo.InvariantCulture)).Append('}');
   return b.ToString();
  }
  static string Bindings(KeyBindings keys,bool secondary)
  {
   var b=new StringBuilder("{");bool first=true;
   foreach(string action in keys.Listed){
    if(!first)b.Append(',');first=false;string v=secondary?keys.Secondary(action):keys.Primary(action);
    b.Append('"').Append(action).Append("\":").Append(v==null?"null":"\""+v.Replace("\\","\\\\").Replace("\"","\\\"")+"\"");
   }
   return b.Append('}').ToString();
  }
  // Applies a stored slot. Empty slot -> Empty (the web shows "no saved data"); unreadable JSON -> Invalid and nothing is changed.
  // sfx/bgm/cap are -1 when the slot has no valid value for them (the caller then keeps the current value and only calls the hosts for the others).
  public static PresetResult Apply(string json,NativeSettingsState state,KeyBindings keys,Func<string,bool> supported,out int sfx,out int bgm,out int cap)
  {
   sfx=bgm=cap=-1;
   if(string.IsNullOrEmpty(json))return PresetResult.Empty;
   Dictionary<string,string> fields;
   try{fields=NativeSettingsJsonCodec.ParseObject(json);}catch(FormatException){return PresetResult.Invalid;}
   string raw;
   Dictionary<string,string> binds=null,binds2=null;
   try{
    if(fields.TryGetValue("binds",out raw)&&raw.TrimStart().StartsWith("{",StringComparison.Ordinal))binds=NativeSettingsJsonCodec.ParseObject(raw);
    if(fields.TryGetValue("binds2",out raw)&&raw.TrimStart().StartsWith("{",StringComparison.Ordinal))binds2=NativeSettingsJsonCodec.ParseObject(raw);
   }catch(FormatException){return PresetResult.Invalid;}
   if(fields.TryGetValue("opt",out raw)&&raw.TrimStart().StartsWith("{",StringComparison.Ordinal))state.Options.Decode(raw);
   int n;
   if(fields.TryGetValue("sfxVol",out raw)&&int.TryParse(raw,NumberStyles.Integer,CultureInfo.InvariantCulture,out n)&&n>=0&&n<=100){state.SetSfxPercent(n);sfx=state.SfxPercent;}
   if(fields.TryGetValue("bgmVol",out raw)&&int.TryParse(raw,NumberStyles.Integer,CultureInfo.InvariantCulture,out n)&&n>=0&&n<=100){state.SetBgmPercent(n);bgm=state.BgmPercent;}
   if(fields.TryGetValue("fpsCap",out raw)&&int.TryParse(raw,NumberStyles.Integer,CultureInfo.InvariantCulture,out n)&&state.TrySetFrameCap(n))cap=state.FrameCap;
   if((binds!=null||binds2!=null)&&keys!=null&&supported!=null)ApplyBinds(binds,binds2,keys,supported);
   return PresetResult.Loaded;
  }
  // Web: `for k in data.binds: if k in BINDS` / `for k in data.binds2: if k in BINDS2||k in BINDS`. Start from the live keys, overlay the slot, then restore all of them at once (swaps never hit the chain conflict mid-way).
  static void ApplyBinds(Dictionary<string,string> binds,Dictionary<string,string> binds2,KeyBindings keys,Func<string,bool> supported)
  {
   int count=KeyBindings.Actions.Length;var snapshot=new NativeSettingsSnapshot{binds=new string[count],binds2=new string[count]};
   for(int i=0;i<count;i++){snapshot.binds[i]=keys.Primary(KeyBindings.Actions[i]);snapshot.binds2[i]=keys.Secondary(KeyBindings.Actions[i]);}
   var listed=new HashSet<string>(keys.Listed);
   for(int i=0;i<count;i++){
    string action=KeyBindings.Actions[i],token,code;
    if(binds!=null&&listed.Contains(action)&&binds.TryGetValue(action,out token)&&TryCode(token,out code))snapshot.binds[i]=code;
    if(binds2!=null&&listed.Contains(action)&&binds2.TryGetValue(action,out token)&&TryCode(token,out code))snapshot.binds2[i]=code;
   }
   NativeSettingsJsonCodec.ApplyBindings(snapshot,keys,supported);
  }
  static bool TryCode(string token,out string code)
  {
   code=null;if(token=="null")return true;
   if(token.Length<2||token[0]!='"')return false;
   try{string s=NativeSettingsJsonCodec.ParseString(token);if(s.Length==0||s.Length>64)return false;code=s;return true;}catch(FormatException){return false;}
  }
 }
}
