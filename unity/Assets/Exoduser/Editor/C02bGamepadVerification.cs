using System;
using System.IO;
using System.Reflection;
using Exoduser.UnityPort;
using UnityEditor;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.LowLevel;

// Virtual-device contract for the first playable combat pad path; no OS controller is claimed.
public static class C02bGamepadVerification
{
 [Serializable] sealed class Receipt { public bool passed; public int checks; public string error; }
 static void Check(bool ok,string label,Receipt receipt){receipt.checks++;if(!ok)throw new Exception(label);}

 public static void Run()
 {
  var args=Environment.GetCommandLineArgs();int at=Array.IndexOf(args,"-output");
  if(at<0||at+1>=args.Length||!Path.IsPathRooted(args[at+1])){Debug.LogError("absolute -output required");EditorApplication.Exit(2);return;}
  string output=args[at+1];Directory.CreateDirectory(output);
  var receipt=new Receipt();var oldMode=InputSystem.settings.updateMode;Gamepad pad=null;
  var gate=typeof(NativeKeyBindInput).GetProperty("GameplayPadEnabled",BindingFlags.Public|BindingFlags.Static);
  try
  {
   Check(gate!=null&&gate.CanWrite,"gameplay pad gate missing",receipt);
   InputSystem.settings.updateMode=InputSettings.UpdateMode.ProcessEventsManually;
   pad=InputSystem.AddDevice<Gamepad>();
   InputSystem.QueueStateEvent(pad,new GamepadState());InputSystem.Update();
   gate.SetValue(null,true);
   InputSystem.QueueStateEvent(pad,new GamepadState(GamepadButton.South){leftStick=new Vector2(.7f,0)});InputSystem.Update();
   Check(NativeKeyBindInput.Down("weapon")&&NativeKeyBindInput.Held("weapon"),"A attacks on the new press",receipt);
   Check(NativeKeyBindInput.Held("right"),"left stick moves right",receipt);
   InputSystem.QueueStateEvent(pad,new GamepadState(GamepadButton.East){leftStick=new Vector2(.7f,0)});InputSystem.Update();
   Check(NativeKeyBindInput.HeldKeyboard("roll")&&NativeKeyBindInput.Held("right"),"B and direction reach roll",receipt);
   gate.SetValue(null,false);
   Check(!NativeKeyBindInput.Held("weapon")&&!NativeKeyBindInput.Held("right")&&!NativeKeyBindInput.HeldKeyboard("roll"),"UI gate blocks combat",receipt);
   InputSystem.RemoveDevice(pad);pad=null;gate.SetValue(null,true);
   Check(!NativeKeyBindInput.Held("weapon")&&!NativeKeyBindInput.Held("right"),"device removal releases combat",receipt);
  }
  catch(Exception error){receipt.error=error.ToString();Debug.LogError(receipt.error);}
  finally
  {
   if(gate!=null&&gate.CanWrite)gate.SetValue(null,false);
   if(pad!=null)InputSystem.RemoveDevice(pad);
   InputSystem.settings.updateMode=oldMode;
   receipt.passed=receipt.error==null;
   File.WriteAllText(Path.Combine(output,"c02b-gamepad-verification.json"),JsonUtility.ToJson(receipt,true));
   EditorApplication.Exit(receipt.passed?0:2);
  }
 }
}
