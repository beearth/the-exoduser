using System;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
 public sealed partial class NativeLobby
 {
  bool frontendPadQaEnabled,qaConfirm,qaCancel,qaStart,qaPreviousConfirm,qaPreviousStart;
  int qaLastFrame=-1;
  FrontendPadFrame qaFrame;

  internal bool EnableFrontendPadQa()
  {
   var args=Environment.GetCommandLineArgs();string root;
   if(Array.IndexOf(args,"--unity-frontend-pad-qa")<0||!NativeSettingsStorageScope.TryResolveCinematicReview(args,out root))return false;
   int at=Array.IndexOf(args,"--frontend-pad-qa-pid"),expected;
   if(at<0||at+1>=args.Length||!int.TryParse(args[at+1],out expected)||expected!=System.Diagnostics.Process.GetCurrentProcess().Id)return false;
   string marker=Path.Combine(root,"frontend-pad-qa.marker");
   try{if(!File.Exists(marker)||File.ReadAllText(marker)!="EXODUSER_FRONTEND_PAD_QA_V1\n")return false;}
   catch(IOException){return false;}catch(UnauthorizedAccessException){return false;}
   frontendPadQaEnabled=true;qaConfirm=qaCancel=qaStart=qaPreviousConfirm=qaPreviousStart=false;qaLastFrame=-1;frontendPad.Reset();return true;
  }

  internal bool SetFrontendPadQaState(bool confirm,bool cancel,bool start)
  {
   if(!frontendPadQaEnabled)return false;
   qaConfirm=confirm;qaCancel=cancel;qaStart=start;return true;
  }

  internal bool SetGuideSkipFocusQa(bool skip)
  {
   if(!frontendPadQaEnabled||startup.Page!=FrontendEntryPage.Guide)return false;
   guideSkipFocus=skip;return true;
  }

  FrontendPadFrame ReadFrontendPadQaFrame()
  {
   if(qaLastFrame==Time.frameCount)return qaFrame;
   qaLastFrame=Time.frameCount;
   qaFrame=new FrontendPadFrame{Number=qaLastFrame,ConfirmHeld=qaConfirm,ConfirmDown=qaConfirm&&!qaPreviousConfirm,
    CancelHeld=qaCancel,StartHeld=qaStart,StartDown=qaStart&&!qaPreviousStart};
   qaPreviousConfirm=qaConfirm;qaPreviousStart=qaStart;return qaFrame;
  }
 }
}
