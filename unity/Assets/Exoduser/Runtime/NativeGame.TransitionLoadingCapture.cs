using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
 // QA 촬영 전용: `--unity-transition-loading-capture <절대 출력 폴더>`.
 // 격리 저장소 안에 전사를 만들고, 로비 "시작" 버튼과 같은 `lobby.EnterSelectedCharacter()`로 1-1 필드 전환을 시작한다.
 // 전환·조립 코드는 건드리지 않고 관찰만 한다: 5개 시점의 화면 전체 PNG와 receipt(transition-loading.json).
 // 시점: (a) 시작 0.5초 (b) 1.5초 (c) 조립 진행률 0.5 전후 첫 프레임 (d) 조립 종료 직후 페이드인 전 (e) 필드가 보인 뒤 1초.
 public sealed partial class NativeGame
 {
  [Serializable] sealed class TransitionLoadingSample
  {
   public string id,png,phase,boundary,lobbyStage,stage;
   public float elapsed,fraction;
   public bool active,busy,pngWritten;
   public int width,height;
  }
  sealed class TransitionLoadingPending{public int id;public string boundary;public float start;public bool seal,label;}
  [Serializable] sealed class TransitionLoadingReceipt
  {
   public bool passed,returnedToLobby,assemblySeen,fieldVisible;
   public string requestedSize,error,sandbox,graphicsDevice,runtimeSha256,finalLobbyStage,boundaries,missing;
   public float assemblySeconds,totalSeconds;
   public int introSkips,exitCode;
   public List<TransitionLoadingSample> samples=new List<TransitionLoadingSample>();
  }
  IEnumerator TransitionLoadingCapture()
  {
   string output=Argument("--unity-transition-loading-capture");
   var report=new TransitionLoadingReceipt();
   var body=TransitionLoadingCaptureBody(output,report);
   while(true)
   {
    bool more;object current;
    try{more=body.MoveNext();current=more?body.Current:null;}
    catch(Exception ex)
    {
     Debug.LogError("TRANSITION_LOADING_QA_FAILED "+ex);
     report.passed=false;report.error=ex.ToString();report.exitCode=2;
     TransitionLoadingWrite(output,report);
     Application.Quit(2);yield break;
    }
    if(!more)break;
    yield return current;
   }
   TransitionLoadingWrite(output,report);
   Debug.Log("TRANSITION_LOADING_CAPTURE passed="+report.passed+" samples="+report.samples.Count+" assembly="+report.assemblySeconds.ToString("0.0")+"s");
   Application.Quit(report.exitCode);
  }
  static void TransitionLoadingWrite(string output,TransitionLoadingReceipt report)
  {
   try{if(!string.IsNullOrEmpty(output)&&Path.IsPathRooted(output)){Directory.CreateDirectory(output);File.WriteAllText(Path.Combine(output,"transition-loading.json"),JsonUtility.ToJson(report,true));}}
   catch(Exception ex){Debug.LogError("TRANSITION_LOADING_RECEIPT_FAILED "+ex.Message);}
  }
  IEnumerator TransitionLoadingCaptureBody(string output,TransitionLoadingReceipt report)
  {
   if(!NativeQaSandbox.Active||string.IsNullOrEmpty(output)||!Path.IsPathRooted(output))
    throw new InvalidOperationException("Transition loading capture requires the QA sandbox and an absolute output folder");
   Directory.CreateDirectory(output);
   report.sandbox=NativeQaSandbox.Root;report.graphicsDevice=SystemInfo.graphicsDeviceName;
   using(var sha=System.Security.Cryptography.SHA256.Create())using(var binary=File.OpenRead(typeof(NativeGame).Assembly.Location))
    report.runtimeSha256=BitConverter.ToString(sha.ComputeHash(binary)).Replace("-","").ToLowerInvariant();
   AudioListener.volume=0;AudioListener.pause=true;Application.runInBackground=true;
   int width=1920,height=1080;string sizeArg=Argument("--unity-transition-loading-size");
   if(!string.IsNullOrEmpty(sizeArg)){var parts=sizeArg.ToLowerInvariant().Split('x');if(parts.Length!=2||!int.TryParse(parts[0],out width)||!int.TryParse(parts[1],out height)||width<320||height<240)throw new InvalidOperationException("--unity-transition-loading-size needs <W>x<H>, got '"+sizeArg+"'");}
   report.requestedSize=width+"x"+height;
   Screen.SetResolution(width,height,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.8f);
   // 준비 단계만 자동 입력 상태로 둔다(전환 없이 로비·전사 생성). 시작 직전에 해제해 제품 경로 그대로 전환한다.
   menu=true;Running=false;lobbySmoke=true;lobby.AutomatedInput=true;lobby.ShowLobby();
   yield return new WaitForSecondsRealtime(.5f);
   if(lobby.Characters.SelectedIndex<0)
   {
    if(!lobby.OpenCharacterCreation()||!lobby.ChooseCharacterVisual(0)||!lobby.ConfirmCharacterVisual()||!lobby.CreateCharacter("검수전사"))
     throw new InvalidOperationException("QA character could not be created in the sandbox");
    yield return null;
   }
   lobbySmoke=false;lobby.AutomatedInput=false;yield return null;yield return null;
   int idBefore=0;{var before=NativeScreenTransition.History;if(before!=null&&before.Count>0)idBefore=before[before.Count-1].id;}
   float start=Time.realtimeSinceStartup;
   if(!lobby.EnterSelectedCharacter())throw new InvalidOperationException("Lobby start was rejected (EnterSelectedCharacter returned false)");
   var pending=new List<TransitionLoadingPending>();int seenId=idBefore,seals=0,labels=0;
   bool shotC=false,shotD=false,shotE=false,sawActive=false,fieldSeen=false;
   float assemblyStart=-1,assemblyEnd=-1,fieldAt=-1,lastSkip=-10;const float limit=240f;
   while(Time.realtimeSinceStartup-start<limit)
   {
    yield return null;
    float elapsed=Time.realtimeSinceStartup-start,now=Time.realtimeSinceStartup;
    bool active=NativeTransitionProgress.Active,busy=NativeScreenTransition.Busy;
    if(active&&!sawActive){sawActive=true;assemblyStart=now;}
    bool assemblyJustEnded=sawActive&&!active&&assemblyEnd<0;
    if(assemblyJustEnded)assemblyEnd=now;
    // 시작 인장·소개 페이지는 사용자가 Esc로 넘기는 것과 같은 상태기계 Skip()으로만 넘긴다.
    string stage=lobby.StartupEntryActive?lobby.StartupStage:"";
    if(!busy&&(stage=="Nemesis"||stage=="Guide")&&now-lastSkip>.4f){lobby.StartupCaptureState.Skip();lastSkip=now;report.introSkips++;}
    if(!fieldSeen&&!busy&&!lobby.IsBlocking&&!lobby.StartupEntryActive){fieldSeen=true;fieldAt=now;}
    {var rows0=NativeScreenTransition.History;if(rows0!=null)foreach(var r0 in rows0)if(r0.id>seenId){seenId=r0.id;pending.Add(new TransitionLoadingPending{id=r0.id,boundary=r0.boundary,start=r0.started});}}
    string id=null;TransitionLoadingPending due=null;bool dueSeal=false;
    foreach(var p in pending){var cur=NativeScreenTransition.History;bool still=busy&&cur!=null&&cur.Count>0&&cur[cur.Count-1].id==p.id;if(!still)continue;
     if(!p.seal&&now-p.start>=.45f){due=p;dueSeal=true;break;}if(!p.label&&now-p.start>=1.2f){due=p;break;}}
    if(!shotD&&assemblyJustEnded&&busy){shotD=true;id="d-assembly-done";}
    else if(!shotC&&active&&NativeTransitionProgress.Fraction>=.5f){shotC=true;id="c-progress-0.5";}
    else if(due!=null){if(dueSeal){due.seal=true;seals++;}else{due.label=true;labels++;}id="transition-"+due.boundary+(dueSeal?"-seal":"-label");}
    else if(!shotE&&fieldSeen&&now-fieldAt>=1f){shotE=true;id="e-field-1s";}
    if(id!=null)
    {
     yield return new WaitForEndOfFrame();
     var tex=ScreenCapture.CaptureScreenshotAsTexture();string png=Path.Combine(output,id.StartsWith("transition-")?id+".png":"transition-"+id+".png");
     File.WriteAllBytes(png,tex.EncodeToPNG());Destroy(tex);
     var flow=NativeScreenTransition.State;var rows=NativeScreenTransition.History;
     report.samples.Add(new TransitionLoadingSample{id=id,png=png,elapsed=Time.realtimeSinceStartup-start,fraction=NativeTransitionProgress.Fraction,
      active=NativeTransitionProgress.Active,busy=NativeScreenTransition.Busy,phase=flow==null?"none":flow.Phase.ToString(),
      boundary=rows!=null&&rows.Count>0?rows[rows.Count-1].boundary:"",lobbyStage=lobby.StageName,stage=NativeTransitionProgress.Stage,
      width=Screen.width,height=Screen.height,pngWritten=File.Exists(png)&&new FileInfo(png).Length>1000});
    }
    if(shotE)break;
   }
   var all=NativeScreenTransition.History;var names=new List<string>();
   if(all!=null)for(int i=0;i<all.Count;i++)
   {
    var row=all[i];if(row.id<=idBefore)continue;names.Add(row.boundary+(row.failed?"(failed)":"")+(row.cancelled?"(cancelled)":""));
    if(row.failed||row.boundary=="return-lobby"&&sawActive)report.returnedToLobby=true;
   }
   report.boundaries=string.Join(",",names.ToArray());
   report.assemblySeen=sawActive;report.fieldVisible=fieldSeen;report.finalLobbyStage=lobby.StageName;
   if(sawActive&&assemblyEnd<0)assemblyEnd=Time.realtimeSinceStartup;
   report.assemblySeconds=sawActive?assemblyEnd-assemblyStart:0;report.totalSeconds=Time.realtimeSinceStartup-start;
   var missing=new List<string>();
   if(seals==0)missing.Add("seal");if(labels==0)missing.Add("label");if(!shotC)missing.Add("c");if(!shotD)missing.Add("d");if(!shotE)missing.Add("e");
   report.missing=string.Join(",",missing.ToArray());
   bool filesOk=true;foreach(var sample in report.samples)if(!sample.pngWritten)filesOk=false;
   report.passed=missing.Count==0&&filesOk&&!report.returnedToLobby;
   if(!report.passed){report.exitCode=4;report.error="missing samples: "+report.missing+(filesOk?"":" ; png not written")+(report.returnedToLobby?" ; transition returned to lobby":"");}
  }
 }
}
