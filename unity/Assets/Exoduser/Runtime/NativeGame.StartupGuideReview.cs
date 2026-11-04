using System;
using System.Collections;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  // Review only (--unity-startup-guide-review -output <dir> [--unity-barrier-legacy]): reaches the real startup guide page 1 through the lobby callbacks
  // (with waits for the page transitions), saves 1920x1080 stills and a 5 s frame sequence. Presentation/QA only; Core untouched.
  readonly System.Collections.Generic.List<Vector2> guideQaShots=new System.Collections.Generic.List<Vector2>();   // review only: world positions of static enemy-bullet discs
  void DrawGuideQaShots()
  {
   if(guideQaShots.Count==0||Simulation==null)return;float k=ToGUI(1,0).x-ToGUI(0,0).x;Color c=Hex(0xb26dff);
   foreach(var w in guideQaShots){var g=ToGUI(w.x,w.y);float r=9*k;Fill(new Rect(g.x-r*1.9f,g.y-r*1.9f,r*3.8f,r*3.8f),new Color(c.r,c.g,c.b,.16f));Fill(new Rect(g.x-r*1.3f,g.y-r*1.3f,r*2.6f,r*2.6f),new Color(c.r,c.g,c.b,.35f));Fill(new Rect(g.x-r*.8f,g.y-r*.8f,r*1.6f,r*1.6f),c);Fill(new Rect(g.x-r*.35f,g.y-r*.35f,r*.7f,r*.7f),new Color(1,1,1,.9f));}
  }
  IEnumerator StartupGuideReview()
  {
   string output=Argument("-output");if(string.IsNullOrWhiteSpace(output)||string.IsNullOrEmpty(lobby.CharacterStoreDirectory)){Debug.LogError("STARTUP GUIDE REVIEW requires -output and an isolated roster");Application.Quit(2);yield break;}
   Directory.CreateDirectory(output);string seq=Path.Combine(output,"seq");Directory.CreateDirectory(seq);var log=new System.Text.StringBuilder();
   Action<string> note=s=>{log.AppendLine(s);Debug.Log("[guide-review] "+s);};
   Screen.SetResolution(1920,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.5f);
   // Cause of create=False: TransitionPage() only runs the lobby callbacks synchronously for AutomatedInput/legacy fixtures; otherwise it queues a screen transition
   // that waits for video readiness (never ready in a capture), so characterStep stayed 0. Scripted QA must mark the lobby as automated.
   Directory.CreateDirectory(lobby.CharacterStoreDirectory);   // store status was Missing and the save was rejected until the roster folder exists
   lobby.AutomatedInput=true;
   lobby.ShowLobby();yield return new WaitForSecondsRealtime(1.5f);
   if(lobby.Characters.Count==0){
    note("open="+lobby.OpenCharacterCreation());
    bool ok=false;for(float end=Time.realtimeSinceStartup+10;!ok&&Time.realtimeSinceStartup<end;){yield return new WaitForSecondsRealtime(.4f);ok=lobby.ChooseCharacterVisual(0);}note("choose="+ok);
    ok=false;for(float end=Time.realtimeSinceStartup+10;!ok&&Time.realtimeSinceStartup<end;){yield return new WaitForSecondsRealtime(.4f);ok=lobby.ConfirmCharacterVisual();}note("confirm="+ok);
    ok=false;for(float end=Time.realtimeSinceStartup+10;!ok&&Time.realtimeSinceStartup<end;){yield return new WaitForSecondsRealtime(.4f);ok=lobby.CreateCharacter("은빛검수");}note("create="+ok+" store="+lobby.CharacterStoreState+" dir="+lobby.CharacterStoreDirectory+" count="+lobby.Characters.Count);
    yield return new WaitForSecondsRealtime(2.5f);
    lobby.ShowLobby();yield return new WaitForSecondsRealtime(1.5f);
   }
   note("entry="+lobby.BeginCharacterEntry(false));
   float deadline=Time.realtimeSinceStartup+25;while(lobby.StartupCaptureState.Page!=FrontendEntryPage.Nemesis&&Time.realtimeSinceStartup<deadline)yield return null;
   note("page="+lobby.StartupCaptureState.Page);yield return new WaitForSecondsRealtime(.5f);
   lobby.StartupCaptureState.Skip();yield return new WaitForSecondsRealtime(1f);
   note("page="+lobby.StartupCaptureState.Page+" step="+lobby.StartupCaptureState.GuideStep);
   if(lobby.StartupCaptureState.Page==FrontendEntryPage.Guide){
    yield return new WaitForSecondsRealtime(1f);yield return SkillCapture(output,"guide-1-1920");
    // second cut: distant enemies + bullets on screen together with the circle (static review props; the simulation is stopped on this page)
    var pl=Simulation.Player;var e1=Simulation.SpawnNormalEnemy(pl.X+260,pl.Y-330);var e2=Simulation.SpawnNormalEnemy(pl.X-300,pl.Y-380);if(e1!=null){e1.Attack=0;e1.Speed=0;}if(e2!=null){e2.Attack=0;e2.Speed=0;}
    for(int i=0;i<8;i++){float a=i*Mathf.PI*2/8f+.3f,rad=i%2==0?150f:215f;guideQaShots.Add(new Vector2(pl.X+Mathf.Cos(a)*rad,pl.Y+Mathf.Sin(a)*rad*.8f));}
    UpdateViews();yield return new WaitForSecondsRealtime(.6f);yield return SkillCapture(output,"guide-1-bullets-1920");
    note("enemies="+(e1!=null)+","+(e2!=null)+" shots="+guideQaShots.Count);guideQaShots.Clear();
    for(int i=0;i<75;i++){yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(seq,"f"+i.ToString("D4")+".png"));yield return new WaitForSecondsRealtime(1f/15f);}
   }
   File.WriteAllText(Path.Combine(output,"guide-review.txt"),log.ToString());lobby.CloseStartupCaptureMedia();
   yield return new WaitForSecondsRealtime(1);Application.Quit(0);
  }
 }
}
