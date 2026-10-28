using System;
using System.IO;
using Exoduser.UnityPort;
using UnityEditor;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.LowLevel;

public static class ExoInputVerification
{
 [Serializable] sealed class Receipt
 {
  public bool passed; public int mappedCodes; public int checks; public string error;
  public bool currentIsVirtualKeyboard;
  public bool virtualWDown; public bool virtualWHeld;
  public bool currentWDown; public bool currentWHeld;
  public bool currentAnyDown; public bool currentAnyHeld;
  public bool facadeWDown; public bool facadeWHeld; public bool facadeAnyDown;
 }
 static void Check(bool condition, string message, Receipt receipt)
 {
  receipt.checks++;
  if (!condition) throw new Exception(message);
 }

 public static void Run()
 {
  var args=Environment.GetCommandLineArgs();
  int outputAt=Array.IndexOf(args,"-output");
  if(outputAt<0||outputAt+1>=args.Length||!Path.IsPathRooted(args[outputAt+1]))
  {
   Debug.LogError("ExoInputVerification requires an absolute -output folder");
   EditorApplication.Exit(2);
   return;
  }
  string output=args[outputAt+1];
  var receipt=new Receipt();
  var oldMode=InputSystem.settings.updateMode;
  Keyboard keyboard=null;
  Mouse mouse=null;
  Gamepad gamepad=null;
  try
  {
   Directory.CreateDirectory(output);
   foreach(var code in NativeKeyBindInput.MappedCodes)
   {
    KeyCode keyCode;
    Key key;
    Check(NativeKeyBindInput.TryKey(code,out keyCode)&&ExoInput.TryMap(keyCode,out key),"unmapped web code "+code,receipt);
    receipt.mappedCodes++;
   }
   Check(receipt.mappedCodes==107&&receipt.mappedCodes==NativeKeyBindInput.MappedCodeCount,"web code count",receipt);
   InputSystem.settings.updateMode=InputSettings.UpdateMode.ProcessEventsManually;
   keyboard=InputSystem.AddDevice<Keyboard>();
   mouse=InputSystem.AddDevice<Mouse>();
   Check(!keyboard.wKey.wasPressedThisFrame,"virtual W starts released",receipt);
   Check(!mouse.leftButton.wasPressedThisFrame,"virtual mouse starts released",receipt);
   InputSystem.QueueStateEvent(keyboard,new KeyboardState(Key.W));
   InputSystem.Update();
   var current=Keyboard.current;
   receipt.currentIsVirtualKeyboard=current==keyboard;
   receipt.virtualWDown=keyboard.wKey.wasPressedThisFrame;
   receipt.virtualWHeld=keyboard.wKey.isPressed;
   receipt.currentWDown=current!=null&&current.wKey.wasPressedThisFrame;
   receipt.currentWHeld=current!=null&&current.wKey.isPressed;
   receipt.currentAnyDown=current!=null&&current.anyKey.wasPressedThisFrame;
   receipt.currentAnyHeld=current!=null&&current.anyKey.isPressed;
   receipt.facadeWDown=ExoInput.KeyDown(KeyCode.W);
   receipt.facadeWHeld=ExoInput.Key(KeyCode.W);
   receipt.facadeAnyDown=ExoInput.AnyKeyDown;
   Check(receipt.facadeWDown&&receipt.facadeWHeld&&receipt.facadeAnyDown,"W press frame",receipt);
   InputSystem.Update();
   Check(!ExoInput.KeyDown(KeyCode.W)&&ExoInput.Key(KeyCode.W)&&!ExoInput.AnyKeyDown,"W held frame",receipt);
   InputSystem.QueueStateEvent(keyboard,new KeyboardState());
   InputSystem.Update();
   Check(!ExoInput.Key(KeyCode.W)&&ExoInput.KeyUp(KeyCode.W),"W release frame",receipt);
   InputSystem.QueueStateEvent(mouse,new MouseState{position=new Vector2(321,456),buttons=1});
   InputSystem.Update();
   Check(ExoInput.MouseDown(0)&&NativeKeyBindInput.Down("weapon")&&ExoInput.AnyKeyDown,"mouse left press frame",receipt);
   Check(ExoInput.MousePosition==new Vector3(321,456,0),"mouse screen position",receipt);
   gamepad=InputSystem.AddDevice<Gamepad>();
   Check(!gamepad.buttonSouth.wasPressedThisFrame,"virtual gamepad South starts released",receipt);
   InputSystem.QueueStateEvent(gamepad,new GamepadState(GamepadButton.South));
   InputSystem.Update();
   Check(ExoInput.PadConnected&&ExoInput.KeyDown(KeyCode.JoystickButton0)&&ExoInput.AnyKeyDown,"gamepad South press frame",receipt);
  }
  catch(Exception error)
  {
   receipt.error=error.ToString();
   Debug.LogError(receipt.error);
  }
  finally
  {
   if(gamepad!=null)InputSystem.RemoveDevice(gamepad);
   if(mouse!=null)InputSystem.RemoveDevice(mouse);
   if(keyboard!=null)InputSystem.RemoveDevice(keyboard);
   InputSystem.settings.updateMode=oldMode;
   receipt.passed=receipt.error==null;
   try { File.WriteAllText(Path.Combine(output,"exo-input-verification.json"),JsonUtility.ToJson(receipt,true)); }
   catch(Exception error) { receipt.passed=false; Debug.LogError(error); }
   EditorApplication.Exit(receipt.passed?0:2);
  }
 }
}
