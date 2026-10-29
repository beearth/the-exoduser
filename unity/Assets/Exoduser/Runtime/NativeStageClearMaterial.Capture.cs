using System;using System.Collections;using System.Collections.Generic;using System.IO;using UnityEngine;
namespace Exoduser.UnityPort {
 // 표시 전용 원화 마감 검사. 실제 완료/보상/Core/M1 검사가 아니며 기존 확인값을 주입한다.
 public static class NativeStageClearMaterialCapture {
  const string Flag="--unity-stageclear-material-capture";
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]static void Boot(){if(Array.IndexOf(Environment.GetCommandLineArgs(),Flag)>=0)new GameObject("StageClearMaterialReview").AddComponent<Host>();}
  sealed class Host:MonoBehaviour{IEnumerator Start(){while(NativeGame.Instance==null||NativeGame.Instance.Simulation==null)yield return null;yield return NativeGame.Instance.StageClearMaterialReview();}}
 }
 public sealed partial class NativeGame {
  [Serializable]sealed class MaterialFrame {public string name,locale;public int width,height,pieces,overflow,missingGlyphs;public Rect frame,button;public string[] visible;}
  [Serializable]sealed class MaterialReceipt {public string scope="원화UV/프레임 표시전용 QA: 직접 아레나 진입·정지·이전M1 확인값137/168·88초·SP10 주입, 자연클리어/새Core·전체M1/손조작E2E 아님";public bool passed;public int failures;public List<string> checks=new List<string>();public List<MaterialFrame> frames=new List<MaterialFrame>();}
  MaterialReceipt materialReview;string materialOutput;
  void MaterialCheck(bool ok,string text){materialReview.checks.Add((ok?"통과 ":"실패 ")+text);if(!ok)materialReview.failures++;}
  IEnumerator MaterialShot(string name){yield return new WaitForEndOfFrame();var f=new MaterialFrame{name=name,locale=lobby.Language,width=Screen.width,height=Screen.height,pieces=stageClear.MaterialPieces,overflow=stageClear.LayoutOverflowCount,missingGlyphs=stageClear.MissingGlyphs,frame=stageClear.MaterialFrameScreenRect,button=stageClear.ButtonScreenRect,visible=stageClear.VisibleTexts.ToArray()};materialReview.frames.Add(f);MaterialCheck(stageClear.MaterialReady&&f.pieces>12,name+" 기존원화로드/UV실제그림");MaterialCheck(f.frame.x>=15.9f&&f.frame.y>=15.9f&&f.frame.xMax<=Screen.width-15.9f&&f.frame.yMax<=Screen.height-15.9f,name+" 장식모서리포함화면여백16");MaterialCheck(f.frame.Contains(f.button.min)&&f.frame.Contains(f.button.max)&&f.button.height>=44,name+" 버튼경계/접근높이44");MaterialCheck(f.overflow==0&&Array.IndexOf(f.visible,"137 / 168")>=0&&Array.IndexOf(f.visible,"1:28")>=0&&Array.IndexOf(f.visible,"+10 SP")>=0,name+" 같은값/새재질본문경계");ScreenCapture.CaptureScreenshot(Path.Combine(materialOutput,name+".png"));yield return null;}
  internal IEnumerator StageClearMaterialReview(){
   materialOutput=Argument("-output");materialReview=new MaterialReceipt();if(string.IsNullOrEmpty(materialOutput)||string.IsNullOrEmpty(Argument("--unity-qa-sandbox"))||!NativeReviewArgs.BossDirect){Debug.LogError("재질QA는명시적출력/격리저장/boss-direct필수");Application.Quit(2);yield break;}Directory.CreateDirectory(materialOutput);pauseSmoke=true;smokeActive=true;Running=false;AudioListener.volume=0;AudioListener.pause=true;Application.runInBackground=true;
   lobby.ShowLobby();lobby.SelectPreview();bool entered=lobby.EnterNativeTest();EndFirstPractice(true);frontendEntryInputFence=false;menu=false;Running=false;var sim=Simulation;var p=sim.Player;var flow=sim.Stage;int ticks=0;while((!flow.InArena||flow.LoadPhase!=0)&&ticks++<700){p.Hp=p.MaxHp;p.Shield=p.MaxShield;p.Iframes=99999;StepInput(0,0,p.X,p.Y-100,false,false);if(ticks%30==0)yield return null;}MaterialCheck(entered&&flow.InArena,"실제렌더아레나표시도달-전투/완료검사아님");if(!flow.InArena){yield return MaterialFinish();yield break;}
   p.X=(flow.Arena.ExitX+.5f)*40;p.Y=(flow.Arena.ExitY+.5f)*40;UpdateViews();
   var input=new NativeStageClearOverlay.Input{kind=NativeStageClearOverlay.Kind.Zone,stageKills=137,totalSpawned=168,clearSeconds=88,statPointsAwarded=10,statPointsBalance=28,regionsCleared=4,potions=0,deaths=0,bossKilled=true};stageClear.AuditText=true;stageClear.LocaleCode="ko";lobby.SetLanguage("ko");stageClear.Show(input);stageClear.ForcedAge=1.5f;Screen.SetResolution(1600,900,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.4f);yield return MaterialShot("material-1600-ko");
   Screen.SetResolution(960,540,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.2f);yield return MaterialShot("material-960-ko");foreach(string code in new[]{"en","el","da","ja","ms","ar"}){lobby.SetLanguage(code);yield return new WaitForSecondsRealtime(.08f);yield return MaterialShot("material-960-"+code);}
   bool next=stageClear.RequestNext();yield return null;MaterialCheck(next&&!stageClear.Active&&lobby.IsBlocking,"기존생산콜백의결과닫기/로비동작유지-진단review로실제저장은차단");MaterialCheck(!stageClear.RequestNext(),"재질그림이입력게이트/중복요청을변경하지않음");yield return MaterialFinish();
  }
  IEnumerator MaterialFinish(){materialReview.passed=materialReview.failures==0;File.WriteAllText(Path.Combine(materialOutput,"material-review.json"),JsonUtility.ToJson(materialReview,true));yield return new WaitForSecondsRealtime(.3f);Application.Quit(materialReview.passed?0:2);}
 }
}
