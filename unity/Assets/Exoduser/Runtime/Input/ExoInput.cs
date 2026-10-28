using InputKey=UnityEngine.InputSystem.Key;
using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.Controls;
using UnityEngine.InputSystem.LowLevel;

namespace Exoduser.UnityPort
{
 // The web key table stays in NativeKeyBindInput; this facade replaces legacy polling only.
 public static class ExoInput
 {
  static readonly Dictionary<KeyCode,InputKey> keys=new Dictionary<KeyCode,InputKey>();
  static readonly HashSet<KeyCode> warned=new HashSet<KeyCode>();
  static Keyboard imeKeyboard;
  static string compositionString="";

  static ExoInput()
  {
   for(char c='A';c<='Z';c++) Map((KeyCode)Enum.Parse(typeof(KeyCode),c.ToString()),(InputKey)Enum.Parse(typeof(InputKey),c.ToString()));
   for(int n=0;n<=9;n++)
   {
    Map((KeyCode)((int)KeyCode.Alpha0+n),(InputKey)Enum.Parse(typeof(InputKey),"Digit"+n));
    Map((KeyCode)((int)KeyCode.Keypad0+n),(InputKey)Enum.Parse(typeof(InputKey),"Numpad"+n));
   }
   for(int n=1;n<=15;n++) Map((KeyCode)((int)KeyCode.F1+n-1),(InputKey)Enum.Parse(typeof(InputKey),"F"+n));
   Map(KeyCode.UpArrow,InputKey.UpArrow);Map(KeyCode.DownArrow,InputKey.DownArrow);Map(KeyCode.LeftArrow,InputKey.LeftArrow);Map(KeyCode.RightArrow,InputKey.RightArrow);
   Map(KeyCode.LeftShift,InputKey.LeftShift);Map(KeyCode.RightShift,InputKey.RightShift);
   Map(KeyCode.LeftControl,InputKey.LeftCtrl);Map(KeyCode.RightControl,InputKey.RightCtrl);
   Map(KeyCode.LeftAlt,InputKey.LeftAlt);Map(KeyCode.RightAlt,InputKey.RightAlt);
   Map(KeyCode.LeftMeta,InputKey.LeftMeta);Map(KeyCode.RightMeta,InputKey.RightMeta);
   Map(KeyCode.Space,InputKey.Space);Map(KeyCode.Tab,InputKey.Tab);Map(KeyCode.Escape,InputKey.Escape);
   Map(KeyCode.Return,InputKey.Enter);Map(KeyCode.KeypadEnter,InputKey.NumpadEnter);Map(KeyCode.Backspace,InputKey.Backspace);
   Map(KeyCode.Delete,InputKey.Delete);Map(KeyCode.Insert,InputKey.Insert);Map(KeyCode.Home,InputKey.Home);Map(KeyCode.End,InputKey.End);
   Map(KeyCode.PageUp,InputKey.PageUp);Map(KeyCode.PageDown,InputKey.PageDown);
   Map(KeyCode.CapsLock,InputKey.CapsLock);Map(KeyCode.Numlock,InputKey.NumLock);Map(KeyCode.ScrollLock,InputKey.ScrollLock);
   Map(KeyCode.Pause,InputKey.Pause);Map(KeyCode.Print,InputKey.PrintScreen);
   Map(KeyCode.Minus,InputKey.Minus);Map(KeyCode.Equals,InputKey.Equals);
   Map(KeyCode.LeftBracket,InputKey.LeftBracket);Map(KeyCode.RightBracket,InputKey.RightBracket);Map(KeyCode.Backslash,InputKey.Backslash);
   Map(KeyCode.Semicolon,InputKey.Semicolon);Map(KeyCode.Quote,InputKey.Quote);Map(KeyCode.Comma,InputKey.Comma);
   Map(KeyCode.Period,InputKey.Period);Map(KeyCode.Slash,InputKey.Slash);Map(KeyCode.BackQuote,InputKey.Backquote);
   Map(KeyCode.KeypadPlus,InputKey.NumpadPlus);Map(KeyCode.KeypadMinus,InputKey.NumpadMinus);
   Map(KeyCode.KeypadMultiply,InputKey.NumpadMultiply);Map(KeyCode.KeypadDivide,InputKey.NumpadDivide);
   Map(KeyCode.KeypadPeriod,InputKey.NumpadPeriod);Map(KeyCode.Menu,InputKey.ContextMenu);
   InputSystem.onDeviceChange+=OnDeviceChange;
   BindImeKeyboard();
  }

  static void Map(KeyCode oldKey,InputKey newKey){keys.Add(oldKey,newKey);}
  public static bool TryMap(KeyCode oldKey,out InputKey newKey){return keys.TryGetValue(oldKey,out newKey);}
  static bool Mapped(KeyCode oldKey,out InputKey newKey)
  {
   if(TryMap(oldKey,out newKey))return true;
   if(!IsPadButton(oldKey)&&warned.Add(oldKey))Debug.LogWarning("ExoInput: unmapped KeyCode "+oldKey);
   return false;
  }
  static bool IsPadButton(KeyCode key){return key==KeyCode.JoystickButton0||key==KeyCode.JoystickButton1||key==KeyCode.JoystickButton7||key==KeyCode.JoystickButton9;}
  static ButtonControl PadButton(Gamepad pad,KeyCode key)
  {
   switch(key)
   {
    case KeyCode.JoystickButton0:return pad.buttonSouth;
    case KeyCode.JoystickButton1:return pad.buttonEast;
    case KeyCode.JoystickButton7:return pad.startButton;
    case KeyCode.JoystickButton9:return pad.rightStickButton;
    default:return null;
   }
  }
  static bool Pad(KeyCode key,int kind)
  {
   foreach(var pad in Gamepad.all)
   {
    var button=PadButton(pad,key);
    if(button!=null&&Pressed(button,kind))return true;
   }
   int index=key==KeyCode.JoystickButton0?0:key==KeyCode.JoystickButton1?1:key==KeyCode.JoystickButton7?7:9;
   foreach(var stick in Joystick.all)
   {
    foreach(var control in stick.allControls)
    {
     if(control is ButtonControl button&&(button.name=="button"+index||index==0&&button==stick.trigger)&&Pressed(button,kind))return true;
    }
   }
   return false;
  }
  static bool Pressed(ButtonControl button,int kind)
  {return kind==0?button.wasPressedThisFrame:kind==1?button.isPressed:button.wasReleasedThisFrame;}
  static bool PollKey(KeyCode oldKey,int kind)
  {
   if(IsPadButton(oldKey))return Pad(oldKey,kind);
   InputKey key;
   if(!Mapped(oldKey,out key))return false;
   var keyboard=Keyboard.current;
   return keyboard!=null&&Pressed(keyboard[key],kind);
  }
  public static bool KeyDown(KeyCode key){return PollKey(key,0);}
  public static bool Key(KeyCode key){return PollKey(key,1);}
  public static bool KeyUp(KeyCode key){return PollKey(key,2);}

  static ButtonControl MouseButton(int index)
  {
   var mouse=UnityEngine.InputSystem.Mouse.current;
   if(mouse==null)return null;
   switch(index)
   {
    case 0:return mouse.leftButton;
    case 1:return mouse.rightButton;
    case 2:return mouse.middleButton;
    case 3:return mouse.backButton;
    case 4:return mouse.forwardButton;
    default:return null;
   }
  }
  public static bool MouseDown(int index){var button=MouseButton(index);return button!=null&&button.wasPressedThisFrame;}
  public static bool Mouse(int index){var button=MouseButton(index);return button!=null&&button.isPressed;}
  public static Vector3 MousePosition
  {
   get
   {
    var mouse=UnityEngine.InputSystem.Mouse.current;
    if(mouse==null)return Vector3.zero;
    var position=mouse.position.ReadValue();
    return new Vector3(position.x,position.y,0);
   }
  }
  static bool AnyButton(bool down)
  {
   for(int n=0;n<=4;n++)if(down?MouseDown(n):Mouse(n))return true;
   foreach(var pad in Gamepad.all)foreach(var control in pad.allControls)
    if(control is ButtonControl button&&!button.synthetic&&Pressed(button,down?0:1))return true;
   foreach(var stick in Joystick.all)foreach(var control in stick.allControls)
    if(control is ButtonControl button&&!button.synthetic&&Pressed(button,down?0:1))return true;
   return false;
  }
  public static bool AnyKey{get{var keyboard=Keyboard.current;return keyboard!=null&&keyboard.anyKey.isPressed||AnyButton(false);}}
  public static bool AnyKeyDown{get{var keyboard=Keyboard.current;return keyboard!=null&&keyboard.anyKey.wasPressedThisFrame||AnyButton(true);}}
  public static bool PadConnected{get{return Gamepad.all.Count>0||Joystick.all.Count>0;}}
  public static float VerticalRaw()
  {
   bool up=Key(KeyCode.W)||Key(KeyCode.UpArrow),down=Key(KeyCode.S)||Key(KeyCode.DownArrow);
   foreach(var pad in Gamepad.all)
   {
    float y=pad.leftStick.ReadValue().y;
    up|=y>0.5f||pad.dpad.up.isPressed;
    down|=y< -0.5f||pad.dpad.down.isPressed;
   }
   foreach(var stick in Joystick.all)
   {
    float y=stick.stick.ReadValue().y;
    up|=y>0.5f;down|=y< -0.5f;
   }
   return (up?1:0)-(down?1:0);
  }
  static void OnDeviceChange(InputDevice device,InputDeviceChange change)
  {
   if(device is Keyboard)BindImeKeyboard();
  }
  static void BindImeKeyboard()
  {
   var current=Keyboard.current;
   if(current==imeKeyboard)return;
   if(imeKeyboard!=null)
   {
    imeKeyboard.onIMECompositionChange-=OnComposition;
    imeKeyboard.onTextInput-=OnTextInput;
   }
   imeKeyboard=current;
   compositionString="";
   if(imeKeyboard!=null)
   {
    imeKeyboard.onIMECompositionChange+=OnComposition;
    imeKeyboard.onTextInput+=OnTextInput;
   }
  }
  static void OnComposition(IMECompositionString value){compositionString=value.ToString();}
  static void OnTextInput(char value){compositionString="";}
  public static string CompositionString{get{BindImeKeyboard();return compositionString;}}
 }
}
