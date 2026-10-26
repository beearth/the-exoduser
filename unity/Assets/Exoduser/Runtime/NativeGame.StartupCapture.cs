using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  int startupResetCount,frontendFenceSetFrame=-1,frontendFenceReleasedFrame=-1;
  [Serializable] sealed class StartupCaptureReceipt {public string scope,rosterDirectory;public bool passed,automatedInput;public int failures,resetDelta,fenceSetFrame,fenceReleasedFrame;public string[] checks;}
  IEnumerator StartupCapture()
  {
   if(Argument("-startParity")=="true"){yield return StartParityCapture();yield break;}
   string output=Argument("-output");var checks=new List<string>();int failures=0;Action<bool,string> check=(ok,label)=>{checks.Add((ok?"PASS ":"FAIL ")+label);if(!ok)failures++;};
   if(string.IsNullOrWhiteSpace(output)||output.StartsWith("-",StringComparison.Ordinal)||string.IsNullOrEmpty(lobby.CharacterStoreDirectory)){Debug.LogError("STARTUP CAPTURE requires explicit writable -output QA namespace");Application.Quit(2);yield break;}
   Directory.CreateDirectory(output);check(lobby.CharacterStoreDirectory==Path.Combine(Path.GetFullPath(output),"character-roster-v1"),"explicit isolated roster namespace");check(!lobby.AutomatedInput,"scripted callback capture leaves AutomatedInput false; no OS input claim");
   Screen.SetResolution(1280,720,FullScreenMode.Windowed);yield return null;lobby.ShowLobby();
   if(lobby.Characters.Count==0){lobby.OpenCharacterCreation();lobby.ConfirmCharacterVisual();check(lobby.CreateCharacter("입장검수"),"create only inside explicit capture roster");lobby.ShowLobby();}
   check(lobby.Characters.SelectedIndex>=0,"capture selected identity exists");int resets=startupResetCount;
   check(lobby.BeginCharacterEntry(false),"actual ordinary entry callback accepted");check(lobby.StartupCaptureState.Page==FrontendEntryPage.Loading&&!Running,"actual loading blocks Simulation");yield return SkillCapture(output,"startup-loading-720p");
   float deadline=Time.realtimeSinceStartup+12;while(lobby.StartupCaptureState.Page!=FrontendEntryPage.Nemesis&&Time.realtimeSinceStartup<deadline)yield return null;
   check(lobby.StartupCaptureState.Page==FrontendEntryPage.Nemesis&&!Running,"1200ms loading reaches actual Nemesis");
   while(lobby.StartupCaptureState.LineIndex<2&&Time.realtimeSinceStartup<deadline)yield return null;
   yield return new WaitForSecondsRealtime(.2f);check(lobby.StartupCaptureState.VisibleCharacters>0&&!lobby.StartupCaptureState.FullText,"source dialogue is typing");yield return SkillCapture(output,"startup-nemesis-typing-720p");
   int line=lobby.StartupCaptureState.LineIndex;lobby.StartupCaptureState.Advance();check(lobby.StartupCaptureState.FullText&&lobby.StartupCaptureState.LineIndex==line,"first callback advance reveals dialogue");yield return SkillCapture(output,"startup-nemesis-full-720p");lobby.StartupCaptureState.Advance();check(lobby.StartupCaptureState.LineIndex==line+1,"second callback advance moves line");
   lobby.StartupCaptureState.Skip();yield return null;check(lobby.StartupCaptureState.Page==FrontendEntryPage.Guide&&!Running,"Nemesis skip reaches actual guide with stopped Simulation");
   for(int step=0;step<4;step++){
    check(lobby.StartupCaptureState.GuideStep==step,"source guide page "+(step+1));Screen.SetResolution(1280,720,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.3f);yield return SkillCapture(output,"startup-guide-"+(step+1)+"-720p");
    if(step==0||step==3){Screen.SetResolution(1920,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.3f);yield return SkillCapture(output,"startup-guide-"+(step+1)+"-1080p");}
    lobby.StartupCaptureState.Advance();
   }
   check(lobby.StartupCaptureState.Page==FrontendEntryPage.Curtain&&!Running,"Start opens curtain while Simulation is stopped");yield return SkillCapture(output,"startup-curtain-1080p");
   deadline=Time.realtimeSinceStartup+5;while((lobby.IsBlocking||frontendEntryInputFence)&&Time.realtimeSinceStartup<deadline)yield return null;
   check(!lobby.IsBlocking&&Running&&!frontendEntryInputFence,"actual completion resumes only after input release fence");check(frontendFenceSetFrame>=0&&frontendFenceReleasedFrame>=frontendFenceSetFrame,"entry release fence armed and processed");check(startupResetCount-resets==1,"exactly one ResetRun during the entry");Running=false;
   Screen.SetResolution(1280,720,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.3f);yield return SkillCapture(output,"startup-gameplay-hud-720p");Screen.SetResolution(1920,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.3f);yield return SkillCapture(output,"startup-gameplay-hud-1080p");
   lobby.CloseStartupCaptureMedia();sound?.Reset();check(!Running,"capture holds gameplay stopped before shutdown");
   File.WriteAllText(Path.Combine(output,"startup-capture.json"),JsonUtility.ToJson(new StartupCaptureReceipt{scope="Narrow scripted runtime callbacks and Player PNGs for actual entry/guide/current HUD; not keyboard or mouse OS-input QA. No full tutorial/practice completion claim.",rosterDirectory=lobby.CharacterStoreDirectory,passed=failures==0,automatedInput=lobby.AutomatedInput,failures=failures,resetDelta=startupResetCount-resets,fenceSetFrame=frontendFenceSetFrame,fenceReleasedFrame=frontendFenceReleasedFrame,checks=checks.ToArray()},true));
   yield return new WaitForSecondsRealtime(1);Application.Quit(failures==0?0:2);
  }
  [Serializable] sealed class StartParityEnemy
  {
   public int id,etype,hp,elite,modifier,spawnTicks;public float x,y,radius,speed,stateTicks,projectileTicks,bossPatternTicks;
   public bool alive,alerted;public string state;
  }
  [Serializable] sealed class StartParityState
  {
   public string scope,stage,practice,product,identifier,settingsDirectory,rosterDirectory;
   public int curtainTicks,simulationTicks,originalTicks,irisTargetId,width,height;
   public float playerX,playerY,iframes;public double irisX,irisY,irisT;
   public bool irisTargetInActiveList,sourcePetFiltering;
   public StartParityEnemy[] activeEnemies,heldEnemies;
  }
  static StartParityEnemy[] StartParityEnemies(Simulation simulation)
  {
   var rows=new StartParityEnemy[simulation.Enemies.Count];
   for(int i=0;i<rows.Length;i++){var e=simulation.Enemies[i];rows[i]=new StartParityEnemy{
    id=e.Id,etype=e.Etype,hp=e.Hp,elite=e.Elite,modifier=e.EliteAttackModifier,spawnTicks=e.SpawnTicks,x=e.X,y=e.Y,radius=e.Radius,speed=e.Speed,bossPatternTicks=e.BossPatternTicks,
    stateTicks=e.StateTicks,projectileTicks=e.ProjectileTicks,alive=e.Alive,alerted=e.Alerted,state=e.State};}
   return rows;
  }
  IEnumerator StartParityFrame(string output,string name)
  {
   yield return new WaitForEndOfFrame();
   var target=pets.IrisTarget;bool targetActive=false;
   foreach(var e in Simulation.Enemies)if(ReferenceEquals(e,target)){targetActive=true;break;}
   File.WriteAllText(Path.Combine(output,name+".json"),JsonUtility.ToJson(new StartParityState{
    scope="Actual ordinary entry callbacks; state at screenshot request, no simulation reposition/freeze/RNG injection. Web observation is separate.",
    stage=lobby.StartupStage,practice=FirstPracticeStage,product=Application.productName,identifier=Application.identifier,
    settingsDirectory=nativeSettingsDirectory,rosterDirectory=lobby.CharacterStoreDirectory,
    curtainTicks=startupCurtainTicks,simulationTicks=Simulation.TickCount,originalTicks=practiceSession==null?Simulation.TickCount:practiceSession.Original.TickCount,
    irisTargetId=target==null?0:target.Id,irisTargetInActiveList=targetActive,
    width=Screen.width,height=Screen.height,playerX=Simulation.Player.X,playerY=Simulation.Player.Y,iframes=Simulation.Player.Iframes,
    irisX=pets.Iris.X,irisY=pets.Iris.Y,irisT=pets.Iris.T,sourcePetFiltering=petView.SourceFiltering,
    activeEnemies=StartParityEnemies(Simulation),heldEnemies=practiceSession==null?new StartParityEnemy[0]:StartParityEnemies(practiceSession.Original)},true));
   ScreenCapture.CaptureScreenshot(Path.Combine(output,name+".png"));
   yield return null;
  }
  IEnumerator StartParityCapture()
  {
   yield return null;
   string output=Argument("-output");
   if(!SettingsQaIdentity||!Path.IsPathRooted(output)||nativeSettingsStore!=null||
    lobby.CharacterStoreDirectory!=Path.Combine(Path.GetFullPath(output),"character-roster-v1"))
   {Debug.LogError("Start parity capture requires isolated QA identity and output roster");Application.Quit(2);yield break;}
   Directory.CreateDirectory(output);pauseSmoke=true;SetGameFocus(true);
   Screen.SetResolution(1920,1080,FullScreenMode.Windowed);QualitySettings.vSyncCount=0;Application.targetFrameRate=120;
   lobby.ShowLobby();
   if(lobby.Characters.Count==0){lobby.OpenCharacterCreation();lobby.ConfirmCharacterVisual();if(!lobby.CreateCharacter("시작검수")){Debug.LogError("Start parity character creation failed");Application.Quit(2);yield break;}lobby.ShowLobby();}
   if(!lobby.BeginCharacterEntry(true)){Debug.LogError("Start parity ordinary entry rejected");Application.Quit(2);yield break;}
   lobby.StartupCaptureState.Skip();yield return null;
   // Warm the actual Guide without advancing gameplay. No legacy smoke entry.
   for(int i=0;i<180;i++)yield return null;
   if(lobby.StartupStage!="Guide"){Debug.LogError("Start parity guide not reached");Application.Quit(2);yield break;}
   lobby.StartupCaptureState.Skip();
   yield return StartParityFrame(output,"start-curtain-open");
   while(lobby.StartupStage=="Curtain"&&lobby.StartupCaptureState.Elapsed<.45)yield return null;
   yield return StartParityFrame(output,"start-curtain-mid");
   float deadline=Time.realtimeSinceStartup+5;
   while((lobby.IsBlocking||frontendEntryInputFence)&&Time.realtimeSinceStartup<deadline)yield return null;
   if(lobby.IsBlocking||!Running||FirstPracticeStage!="Intro"||startupCurtainTicks<=0)
   {Debug.LogError("Start parity lesson entry or curtain clock failed");Application.Quit(2);yield break;}
   yield return StartParityFrame(output,"start-lesson-intro");
   if(Array.IndexOf(Environment.GetCommandLineArgs(),"--lighting-capture-only")>=0)
   {yield return new WaitForSecondsRealtime(.5f);lobby.CloseStartupCaptureMedia();sound?.Reset();Application.Quit(0);yield break;}
   // One performance sample of this naturally reached, stationary lesson intro.
   // The lesson itself freezes simulation/pets, exactly as the source intro does.
   const int count=900;var samples=new double[count];int running=0,focused=0;
   for(int i=0;i<180;i++)yield return null;
   worldLighting.MeasureAllocations=true;worldLighting.RenderAllocatedBytes=0;worldLighting.UpdateAllocatedBytes=0;
   worldLighting.TargetRecreates=0;worldLighting.RenderCalls=0;worldLighting.CacheRefreshes=0;
   for(int i=0;i<count;i++){yield return null;samples[i]=Time.unscaledDeltaTime*1000;if(Running)running++;if(gameFocused)focused++;}
   worldLighting.MeasureAllocations=false;double sum=0;foreach(double value in samples)sum+=value;Array.Sort(samples);
   File.WriteAllText(Path.Combine(output,"start-performance.json"),JsonUtility.ToJson(new LightingReviewReceipt{
    scope="Natural ordinary-entry first lesson intro;900 render frames after180 warmup,cap120/vsync0; source lesson freezes actors/pets. One sample, not dense combat or valid GC certification.",
    product=Application.productName,identifier=Application.identifier,settingsDirectory=nativeSettingsDirectory,rosterDirectory=lobby.CharacterStoreDirectory,
    width=Screen.width,height=Screen.height,samples=count,averageMs=sum/count,p95Ms=samples[(int)Math.Ceiling(count*.95)-1],p99Ms=samples[(int)Math.Ceiling(count*.99)-1],
    targetFrameRate=Application.targetFrameRate,vsync=QualitySettings.vSyncCount,runningFrames=running,focusedFrames=focused,
    lightingRenderCalls=worldLighting.RenderCalls,lightingCacheRefreshes=worldLighting.CacheRefreshes,targetRecreates=worldLighting.TargetRecreates,
    lightingRenderAllocatedBytes=worldLighting.RenderAllocatedBytes,lightingUpdateAllocatedBytes=worldLighting.UpdateAllocatedBytes,
    playerX=Simulation.Player.X,playerY=Simulation.Player.Y,sourcePetFiltering=petView.SourceFiltering},true));
   lobby.CloseStartupCaptureMedia();sound?.Reset();Application.Quit(0);
  }
 }
}
