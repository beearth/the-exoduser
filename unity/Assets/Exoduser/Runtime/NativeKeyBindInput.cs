using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
 // Bridge between the web key-binding state (Core/KeyBindings, web key codes) and Unity input. One shared KeyBindings instance (web: the global BINDS / BINDS2).
 // Unity KeyCode <-> web `event.code` table; Down/Held read the primary and the alternate key of an action (web: _chkJust(BINDS[a]) || _chkJust(BINDS2[a])).
 public static class NativeKeyBindInput {
  public static readonly KeyBindings Bindings=new KeyBindings();
  static readonly Dictionary<string,KeyCode> toUnity=new Dictionary<string,KeyCode>();
  static readonly Dictionary<KeyCode,string> toWeb=new Dictionary<KeyCode,string>();
  static void Map(string code,KeyCode key){toUnity[code]=key;toWeb[key]=code;}
  static NativeKeyBindInput(){
   for(char c='A';c<='Z';c++)Map("Key"+c,(KeyCode)Enum.Parse(typeof(KeyCode),c.ToString()));
   for(int i=0;i<=9;i++){Map("Digit"+i,(KeyCode)((int)KeyCode.Alpha0+i));Map("Numpad"+i,(KeyCode)((int)KeyCode.Keypad0+i));}
   for(int i=1;i<=15;i++)Map("F"+i,(KeyCode)((int)KeyCode.F1+i-1));
   Map("ArrowUp",KeyCode.UpArrow);Map("ArrowDown",KeyCode.DownArrow);Map("ArrowLeft",KeyCode.LeftArrow);Map("ArrowRight",KeyCode.RightArrow);
   Map("ShiftLeft",KeyCode.LeftShift);Map("ShiftRight",KeyCode.RightShift);Map("ControlLeft",KeyCode.LeftControl);Map("ControlRight",KeyCode.RightControl);
   Map("AltLeft",KeyCode.LeftAlt);Map("AltRight",KeyCode.RightAlt);Map("MetaLeft",KeyCode.LeftMeta);Map("MetaRight",KeyCode.RightMeta);
   Map("Space",KeyCode.Space);Map("Tab",KeyCode.Tab);Map("Escape",KeyCode.Escape);Map("Enter",KeyCode.Return);Map("NumpadEnter",KeyCode.KeypadEnter);Map("Backspace",KeyCode.Backspace);
   Map("Delete",KeyCode.Delete);Map("Insert",KeyCode.Insert);Map("Home",KeyCode.Home);Map("End",KeyCode.End);Map("PageUp",KeyCode.PageUp);Map("PageDown",KeyCode.PageDown);
   Map("CapsLock",KeyCode.CapsLock);Map("NumLock",KeyCode.Numlock);Map("ScrollLock",KeyCode.ScrollLock);Map("Pause",KeyCode.Pause);Map("PrintScreen",KeyCode.Print);
   Map("Minus",KeyCode.Minus);Map("Equal",KeyCode.Equals);Map("BracketLeft",KeyCode.LeftBracket);Map("BracketRight",KeyCode.RightBracket);Map("Backslash",KeyCode.Backslash);
   Map("Semicolon",KeyCode.Semicolon);Map("Quote",KeyCode.Quote);Map("Comma",KeyCode.Comma);Map("Period",KeyCode.Period);Map("Slash",KeyCode.Slash);Map("Backquote",KeyCode.BackQuote);
   Map("NumpadAdd",KeyCode.KeypadPlus);Map("NumpadSubtract",KeyCode.KeypadMinus);Map("NumpadMultiply",KeyCode.KeypadMultiply);Map("NumpadDivide",KeyCode.KeypadDivide);Map("NumpadDecimal",KeyCode.KeypadPeriod);
   Map("ContextMenu",KeyCode.Menu);
  }
  public static int MappedCodeCount{get{return toUnity.Count;}}
  public static IEnumerable<string> MappedCodes{get{return toUnity.Keys;}}
  // web code -> Unity key ("mouseN" is not a key)
  public static bool TryKey(string code,out KeyCode key){key=KeyCode.None;return code!=null&&toUnity.TryGetValue(code,out key);}
  // Unity key -> web code (null = not bindable)
  public static string CodeFor(KeyCode key){string c;return toWeb.TryGetValue(key,out c)?c:null;}
  static bool IsMouse(string code,out int button){button=0;if(code!=null&&code.Length==6&&code.StartsWith("mouse")&&char.IsDigit(code[5])){button=code[5]-'0';return true;}return false;}
  public static bool CodeDown(string code){int b;KeyCode k;if(IsMouse(code,out b))return ExoInput.MouseDown(b);return TryKey(code,out k)&&ExoInput.KeyDown(k);}
  public static bool CodeHeld(string code){int b;KeyCode k;if(IsMouse(code,out b))return ExoInput.Mouse(b);return TryKey(code,out k)&&ExoInput.Key(k);}
  // web _chkJust / _chkHeld over both slots
  public static bool Down(string action){return CodeDown(Bindings.Primary(action))||CodeDown(Bindings.Secondary(action));}
  public static bool Held(string action){return CodeHeld(Bindings.Primary(action))||CodeHeld(Bindings.Secondary(action));}
  // web roll: BINDS.roll / BINDS2.roll keyboard keys only (mouse buttons are filtered out of _rlKeys)
  public static bool HeldKeyboard(string action){string a=Bindings.Primary(action),b=Bindings.Secondary(action);return a!=null&&!a.StartsWith("mouse")&&CodeHeld(a)||b!=null&&!b.StartsWith("mouse")&&CodeHeld(b);}
 }
}
