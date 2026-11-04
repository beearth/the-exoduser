// Options wave 1 contract (pause/settings parity P01 P02 P13 P30 P34 P42): Core-only checks, no Unity, no player, no user save folder.
// usage: dotnet run -- <Resources/Data/a15_options_web.json> <out-dir> [receipt.json]
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using Exoduser.UnityPort.Core;

static class Program
{
 static int count;
 static void Check(bool ok,string label){if(!ok)throw new Exception("FAIL "+label);count++;}
 static NativeSettingsStore Store(string dir,NativeSettingsState state){return new NativeSettingsStore(dir,NativeSettingsJsonCodec.Encode,NativeSettingsJsonCodec.Decode,state,false);}
 // The same restore steps as NativeGame.InitializeNativeSettings (state, options, presets, keys).
 static NativeSettingsState Load(string dir,KeyBindings keys,out NativeSettingsStoreStatus status,int initialCap=0)
 {
  var state=new NativeSettingsState(initialCap);var store=Store(dir,state);NativeSettingsSnapshot snap;
  if(!store.TryLoad(out snap,out status))throw new Exception("load failed "+status);
  state.TryRestore(snap.sfxPercent,snap.bgmPercent,snap.frameCap);string raw;
  if(snap.extra!=null){if(snap.extra.TryGetValue("opt",out raw))state.Options.Decode(raw);for(int i=0;i<state.Presets.Length;i++)if(snap.extra.TryGetValue("preset"+(i+1),out raw))state.Presets[i]=raw;}
  if(status!=NativeSettingsStoreStatus.Missing&&keys!=null)NativeSettingsJsonCodec.ApplyBindings(snap,keys,code=>true);
  return state;
 }
 static NativeSettingsStoreStatus Save(string dir,NativeSettingsState s,KeyBindings keys){var store=Store(dir,s);NativeSettingsStoreStatus st;if(!store.TryLoad(out _,out st))return st;store.TrySave(s,false,keys,false,out st);return st;}
 static string Fresh(string root,string name){string d=Path.Combine(root,name+"-"+Guid.NewGuid().ToString("N").Substring(0,8));Directory.CreateDirectory(d);return Path.Combine(d,"native-settings-v1");}
 static void Main(string[] args)
 {
  string optionsJson=args[0],root=Path.GetFullPath(args[1]);Directory.CreateDirectory(root);NativeSettingsStoreStatus status;string rejection;
  // ---- P13: FPS default = web OPT.fpsCap 0 (unlimited); a saved cap still wins
  Check(new NativeSettingsState().FrameCap==0&&new NativeSettingsState().UnityFrameCap==-1,"P13 declared default is unlimited");
  Check(NativeSettingsStore.Capture(new NativeSettingsState(),false).frameCap==0,"P13 snapshot of a new state is 0");
  {string dir=Fresh(root,"fps");var s=Load(dir,null,out status);Check(status==NativeSettingsStoreStatus.Missing&&s.FrameCap==0,"P13 missing file boots unlimited (no hidden 120)");
   Check(s.TrySetFrameCap(120)&&Save(dir,s,null)==NativeSettingsStoreStatus.Saved,"P13 save 120");
   var again=Load(dir,null,out status);Check(status==NativeSettingsStoreStatus.Loaded&&again.FrameCap==120,"P13 saved 120 is restored over the default");}
  // ---- P02: language persistence
  Check(new NativeOptionSet().Lang=="","P02 fresh options have no saved language");
  {var o=new NativeOptionSet();o.Lang="en";Check(o.Encode().Contains("\"lang\":\"en\""),"P02 Encode writes lang");var o2=new NativeOptionSet();o2.Decode(o.Encode());Check(o2.Lang=="en","P02 Decode reads lang");
   foreach(string bad in new[]{"","EN","e","english","e n","한국","x1"}){o2.Lang=bad;Check(o2.Lang=="","P02 invalid language rejected: "+bad);}
   o.RestoreDefaults();Check(o.Lang=="","P02 RestoreDefaults clears the saved language");
   var legacy=new NativeOptionSet();legacy.Lang="de";legacy.Decode("{\"shake\":35,\"bgmTrack\":\"auto\",\"reduceMotion\":false}");Check(legacy.Lang=="de"&&legacy.Get("shake")==35,"P02 old opt text without lang keeps the current language");
   var enc=new NativeOptionSet().Encode();Check(!enc.Contains("\"lang\""),"P02 unset language adds no key (old readers see the same text as before)");}
  {string dir=Fresh(root,"lang");var keys=new KeyBindings();var s=Load(dir,keys,out status);s.Options.Lang="ja";Check(Save(dir,s,keys)==NativeSettingsStoreStatus.Saved,"P02 save with language");
   var back=Load(dir,new KeyBindings(),out status);Check(status==NativeSettingsStoreStatus.Loaded&&back.Options.Lang=="ja","P02 language survives a restart (store roundtrip)");
   // an old file written before this change: no lang anywhere
   string old=Fresh(root,"lang-old");Directory.CreateDirectory(old);File.WriteAllText(Path.Combine(old,NativeSettingsStore.DataFileName),NativeSettingsJsonCodec.Encode(NativeSettingsStore.Capture(new NativeSettingsState(120),false)).Replace("\"revision\":0","\"revision\":1").Replace("\"binds2\":","\"opt\":{\"shake\":35},\"binds2\":"));
   var oldState=Load(old,new KeyBindings(),out status,0);Check(status==NativeSettingsStoreStatus.Loaded&&oldState.Options.Lang==""&&oldState.Options.Get("shake")==35,"P02 old file without lang loads and keeps the default behaviour");
   Check(LobbyLanguage.Startup(oldState.Options.Lang,"ko")=="ko","P02 no saved language -> host default");}
  Check(LobbyLanguage.Startup("ja","ko")=="ja"&&LobbyLanguage.Startup("zht","ko")=="zht"&&LobbyLanguage.Startup("ptbr","ko")=="ptbr","P02 saved language beats the start decision");
  Check(LobbyLanguage.Startup("","ko")=="ko"&&LobbyLanguage.Startup(null,"en")=="en"&&LobbyLanguage.Startup("zz","ko")=="ko","P02 empty/unknown saved value keeps the host default");
  // ---- P01: reduce motion roundtrip
  {string dir=Fresh(root,"rm");var keys=new KeyBindings();var s=Load(dir,keys,out status);Check(!s.Options.ReduceMotion,"P01 default off");s.Options.ReduceMotion=true;
   Check(Save(dir,s,keys)==NativeSettingsStoreStatus.Saved,"P01 save");var back=Load(dir,new KeyBindings(),out status);Check(back.Options.ReduceMotion,"P01 reduce motion survives a restart");}
  // ---- P34: presets carry keys + language
  {var state=new NativeSettingsState(120);var keys=new KeyBindings();state.Options.Set("shake",35);state.Options.ReduceMotion=true;state.Options.Lang="en";state.Options.BgmTrack="hell1";state.SetSfxPercent(25);state.SetBgmPercent(45);
   Check(keys.TrySet("up","KeyZ",false,out rejection)&&keys.TrySet("up","KeyX",true,out rejection)&&keys.TrySet("interact","Digit1",false,out rejection),"P34 fixture edits keys");
   string slot=NativeSettingsPreset.Encode(state,keys);Check(slot.StartsWith("{\"opt\":{",StringComparison.Ordinal)&&slot.Contains("\"binds\":{")&&slot.Contains("\"binds2\":{")&&slot.Contains("\"lang\":\"en\""),"P34 slot has opt(lang), binds, binds2");
   var parsed=NativeSettingsJsonCodec.ParseObject(slot);Check(parsed.ContainsKey("opt")&&parsed.ContainsKey("binds")&&parsed.ContainsKey("binds2")&&parsed["sfxVol"]=="25"&&parsed["bgmVol"]=="45"&&parsed["fpsCap"]=="120","P34 slot fields");
   var binds=NativeSettingsJsonCodec.ParseObject(parsed["binds"]);Check(binds.Count==keys.Listed.Count&&binds["up"]=="\"KeyZ\"","P34 binds cover every listed action");
   var target=new NativeSettingsState();var keys2=new KeyBindings();int sfx,bgm,cap;
   Check(NativeSettingsPreset.Apply(slot,target,keys2,c=>true,out sfx,out bgm,out cap)==PresetResult.Loaded,"P34 load result");
   Check(target.Options.Lang=="en"&&target.Options.Get("shake")==35&&target.Options.ReduceMotion&&target.Options.BgmTrack=="hell1","P34 options and language restored");
   Check(sfx==25&&bgm==45&&cap==120&&target.SfxPercent==25&&target.BgmPercent==45&&target.FrameCap==120,"P34 audio and fps restored");
   Check(keys2.Primary("up")=="KeyZ"&&keys2.Secondary("up")=="KeyX"&&keys2.Primary("interact")=="Digit1","P34 primary and secondary keys restored");
   // old-format slot (before this change): no binds, no lang -> keys untouched
   string oldSlot="{\"opt\":{\"shake\":10},\"sfxVol\":70,\"bgmVol\":20,\"fpsCap\":60}";var keys3=new KeyBindings();var s3=new NativeSettingsState();s3.Options.Lang="de";
   Check(keys3.TrySet("up","KeyZ",false,out rejection)&&NativeSettingsPreset.Apply(oldSlot,s3,keys3,c=>true,out sfx,out bgm,out cap)==PresetResult.Loaded&&keys3.Primary("up")=="KeyZ"&&s3.Options.Lang=="de"&&s3.Options.Get("shake")==10&&sfx==70&&bgm==20&&cap==60,"P34 older slot loads, keys and language stay");
   // empty slot: web "no saved data"; broken slot: web "load failed", nothing changes
   var s4=new NativeSettingsState();var k4=new KeyBindings();s4.Options.Set("shake",50);
   Check(NativeSettingsPreset.Apply("",s4,k4,c=>true,out sfx,out bgm,out cap)==PresetResult.Empty&&NativeSettingsPreset.Apply(null,s4,k4,c=>true,out sfx,out bgm,out cap)==PresetResult.Empty,"P34 empty slot result");
   Check(NativeSettingsPreset.Apply("{broken",s4,k4,c=>true,out sfx,out bgm,out cap)==PresetResult.Invalid&&NativeSettingsPreset.Apply("{\"binds\":{\"up\":\"KeyZ\",\"up\":\"KeyX\"}}",s4,k4,c=>true,out sfx,out bgm,out cap)==PresetResult.Invalid&&s4.Options.Get("shake")==50&&k4.Primary("up")=="KeyW","P34 broken slot is rejected without touching anything");
   // unsupported key code in a slot -> that action keeps its default (same adapter as the settings file)
   var k5=new KeyBindings();var s5=new NativeSettingsState();NativeSettingsPreset.Apply("{\"binds\":{\"up\":\"NotAKey\",\"down\":\"KeyJ\"}}",s5,k5,c=>c!="NotAKey",out sfx,out bgm,out cap);Check(k5.Primary("up")=="KeyW"&&k5.Primary("down")=="KeyJ","P34 unsupported key code falls back to the default");
   // swapping two keys through a slot must not trip the one-key-per-action checks half way
   var k6=new KeyBindings();var s6=new NativeSettingsState();NativeSettingsPreset.Apply("{\"binds\":{\"up\":\"KeyS\",\"down\":\"KeyW\"}}",s6,k6,c=>true,out sfx,out bgm,out cap);Check(k6.Primary("up")=="KeyS"&&k6.Primary("down")=="KeyW","P34 key swap loads");
   // two full slots + everything else still fit the settings file size limit
   var big=new NativeSettingsState(120);var bigKeys=new KeyBindings();big.Options.Lang="ptbr";big.Options.BgmTrack="t:bgm/1장_썩은숲/Wrath of the Golden Age (Remastered).wav";foreach(string a in KeyBindings.Actions)bigKeys.TrySet(a,a=="charge"?"KeyO":a=="weapon"?"KeyI":a=="shield"?"KeyL":"KeyP",true,out rejection);
   for(int i=0;i<2;i++)big.Presets[i]=NativeSettingsPreset.Encode(big,bigKeys);string dir=Fresh(root,"size");var bs=Store(dir,big);Check(bs.TryLoad(out _,out status),"P34 size load");
   bool saved=bs.TrySave(big,true,bigKeys,true,out status);Check(saved&&status==NativeSettingsStoreStatus.Saved,"P34 two full slots fit the settings file ("+status+")");
   long bytes=new FileInfo(Path.Combine(dir,NativeSettingsStore.DataFileName)).Length;Check(bytes<NativeSettingsStore.MaximumBytes-1024,"P34 file keeps 1 KiB headroom: "+bytes+" of "+NativeSettingsStore.MaximumBytes);
   var restored=Load(dir,new KeyBindings(),out status);Check(restored.Presets[0]==big.Presets[0]&&restored.Presets[1]==big.Presets[1],"P34 slots survive a restart byte for byte");}
  // ---- P30: BGM select
  {Check(NativeBgmSelection.Resolve("hell1","auto")=="hell1"&&NativeBgmSelection.Resolve("boss","auto")=="boss","P30 auto follows the stage key");
   Check(NativeBgmSelection.Resolve("hell1","boss")=="boss"&&NativeBgmSelection.Resolve("boss","hell1")=="hell1"&&NativeBgmSelection.Resolve("hell1","lobby")=="lobby","P30 a chosen song replaces the stage song");
   Check(NativeBgmSelection.Resolve("death","hell1")=="death"&&NativeBgmSelection.Resolve("victory","boss")=="victory","P30 death and victory keep their own song (web gate)");
   Check(NativeBgmSelection.Resolve("","boss")==""&&NativeBgmSelection.Resolve(null,"boss")=="","P30 no game music in the lobby / menu stays silent");
   foreach(string unsupported in new[]{"hell2","hell3","hell4","finalboss","forge","allRandom","t:bgm/공통/forge.mp3","","nonsense",null})Check(NativeBgmSelection.Resolve("hell1",unsupported)=="hell1"&&NativeBgmSelection.Effective(unsupported)=="auto","P30 unsupported value falls back to auto: "+unsupported);
   using(var doc=JsonDocument.Parse(File.ReadAllText(optionsJson))){
    var entries=doc.RootElement.GetProperty("entries");string[] values=null;int en=Enumerable.Range(0,doc.RootElement.GetProperty("codes").GetArrayLength()).First(i=>doc.RootElement.GetProperty("codes")[i].GetString()=="en");
    foreach(var e in entries.EnumerateArray())if(e.GetProperty("key").GetString()=="bgm.values")values=e.GetProperty("texts")[en].GetString().Split('\u0001');
    Check(values!=null&&values.Length==73,"P30 menu list has 73 values");
    for(int i=0;i<NativeBgmSelection.SupportedCount;i++)Check(values.Contains(NativeBgmSelection.SupportedAt(i)),"P30 supported value is in the menu list: "+NativeBgmSelection.SupportedAt(i));
    // The menu lists only supported values, in web order; a saved unsupported value is shown as auto (NativeBgmSelection.Effective) and never rewritten.
    var listed=values.Where(NativeBgmSelection.IsSupported).ToArray();Check(listed.Length==NativeBgmSelection.SupportedCount,"P30 menu shows exactly the supported values");
    Check(listed.SequenceEqual(new[]{"auto","lobby","hell1","boss","death","victory"}),"P30 listed values keep the web order");
    Check(NativeBgmSelection.Effective("hell2")=="auto"&&NativeBgmSelection.Effective("hell1")=="hell1","P30 a saved value outside the list is displayed as auto");
    {var o=new NativeOptionSet();o.BgmTrack="hell3";o.Decode("{\"shake\":40}");Check(o.BgmTrack=="hell3","P30 reading settings keeps an unsupported saved track untouched");Check(o.Encode().Contains("\"bgmTrack\":\"hell3\""),"P30 the saved file value is not overwritten by displaying it as auto");}
    var fallback=values.Where(v=>!NativeBgmSelection.IsSupported(v)).ToArray();Check(fallback.Length==73-NativeBgmSelection.SupportedCount,"P30 every other value is a fallback");
    File.WriteAllText(Path.Combine(root,"bgm-fallback-values.txt"),string.Join("\n",fallback)+"\n");
    foreach(string a15 in new[]{"n.optReduceMotion","m.presetSaved","m.presetLoaded","m.presetEmpty","m.presetFail"}){bool found=false;foreach(var e in entries.EnumerateArray())if(e.GetProperty("key").GetString()==a15){found=true;Check(e.GetProperty("texts").GetArrayLength()==29&&e.GetProperty("texts").EnumerateArray().All(t=>t.GetString().Length>0),"labels: 29 non-empty texts for "+a15);if(a15!="n.optReduceMotion"&&a15!="m.presetFail")Check(e.GetProperty("texts").EnumerateArray().All(t=>t.GetString().Contains("{0}")),"labels: slot placeholder in "+a15);}Check(found,"labels: entry exists "+a15);}
   }}
  // ---- P42: keyboard focus stops of the key list, walked through the real PauseNavigation
  {Check(NativeKeyFocus.StopCount(21)==43&&NativeKeyFocus.StopCount(19)==39&&NativeKeyFocus.StopCount(0)==0,"P42 stop counts (21 rows, 19 after the web reset quirk)");
   Check(NativeKeyFocus.Row(0)==0&&!NativeKeyFocus.IsSecondary(0)&&NativeKeyFocus.Row(1)==0&&NativeKeyFocus.IsSecondary(1)&&NativeKeyFocus.Row(2)==1&&NativeKeyFocus.Row(41)==20&&NativeKeyFocus.IsSecondary(41),"P42 order = action by action, main then secondary (web DOM order)");
   Check(NativeKeyFocus.IsReset(42,21)&&!NativeKeyFocus.IsSlot(42,21)&&NativeKeyFocus.IsSlot(41,21),"P42 reset button is the last stop");
   Check(NativeKeyFocus.Horizontal(5,21,-1)==4&&NativeKeyFocus.Horizontal(4,21,1)==5&&NativeKeyFocus.Horizontal(4,21,-1)==4&&NativeKeyFocus.Horizontal(5,21,1)==5&&NativeKeyFocus.Horizontal(42,21,1)==42&&NativeKeyFocus.Horizontal(99,21,-1)==99,"P42 left/right jump between main and secondary of one action");
   var nav=new PauseNavigation{SettingsRows=new[]{22,28,3,3+NativeKeyFocus.StopCount(21)}};nav.Open(PausePage.Settings);nav.SelectTab(3);nav.DirectSettings=true;
   Check(nav.Count==4+46+1,"P42 controls tab count = tabs + 3 rows + 43 stops + close");
   int Press(PauseKey key){nav.ObserveReleased(false);nav.Handle(key,false);return nav.Cursor;}
   Check(nav.Cursor==3,"P42 starts on the tab header");
   Check(Press(PauseKey.Down)==4&&Press(PauseKey.Down)==5&&Press(PauseKey.Down)==6,"P42 Down walks the cursor card, the second card and the size slider");
   Check(Press(PauseKey.Down)==7,"P42 next Down lands on key stop 0 (move up, main)");
   var seen=new List<int>();for(int i=0;i<43;i++){seen.Add(nav.Cursor-7);Press(PauseKey.Down);}
   Check(seen.SequenceEqual(Enumerable.Range(0,43)),"P42 Down visits all 43 stops once in order");
   Check(nav.Cursor==50&&nav.Cursor==nav.Count-1,"P42 after the last stop focus reaches Close");
   Check(Press(PauseKey.Down)==0,"P42 wraps to the first tab header (menu stays closed-loop)");
   nav.SelectTab(3);for(int i=0;i<3+1;i++)Press(PauseKey.Down);for(int i=0;i<5;i++)Press(PauseKey.Next);Check(nav.Cursor-7==5,"P42 Tab key (Next) advances one stop like Down");
   Check(Press(PauseKey.Up)-7==4,"P42 Up goes back one stop");
   nav.ObserveReleased(false);var accept=nav.Handle(PauseKey.Right,false);Check(accept==PauseAction.RowRight,"P42 Right reaches the host as RowRight on a key stop");
   nav.ObserveReleased(false);Check(nav.Handle(PauseKey.Accept,false)==PauseAction.RowAccept,"P42 Enter reaches the host as RowAccept on a key stop");
   nav.ObserveReleased(false);var short19=new PauseNavigation{SettingsRows=new[]{22,28,3,3+NativeKeyFocus.StopCount(19)}};short19.Open(PausePage.Settings);short19.SelectTab(3);Check(short19.Count==4+42+1,"P42 count follows the live row count");}
  // ---- P33: the settings character card shows the only playable visual; the roster refuses other visuals
  {var roster=new CharacterRoster();Check(CharacterRoster.PlayableVisualIndex==0&&roster.Validate("두글자",CharacterRoster.PlayableVisualIndex)==CharacterCreateError.None&&roster.Validate("두글자",1)==CharacterCreateError.Locked,"P33 only visual 0 is playable, the others are locked");}
  string receipt=args.Length>2?args[2]:Path.Combine(root,"options-wave1-receipt.json");
  File.WriteAllText(receipt,JsonSerializer.Serialize(new{scope="Core-only: Options/Preset/Store/Bgm/KeyFocus/PauseNavigation contracts. No Unity, no Player, no user save folder.",passed=count,failed=0}));
  Console.WriteLine("OPTIONS-WAVE1 PASS "+count);
 }
}
