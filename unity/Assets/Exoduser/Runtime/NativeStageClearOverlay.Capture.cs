using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
 // `--unity-overlay-capture clear <dir>`: draws the stage-clear panel from explicit test values that mirror the web captures (formal and demo build),
 // 초기 이식의 제한 입력 재현이다. 현행 일반 실행은 실제 StageCleared 이벤트와 별개 경로이며 미지원 항목은 표시하지 않는다.
 // NativeGame/NativeLobby are silenced, not modified.
 public static class NativeStageClearOverlayCapture {
  const string Arg="--unity-overlay-capture";
  static bool Requested(out string output){
   var a=Environment.GetCommandLineArgs();int i=Array.IndexOf(a,Arg);output=null;
   if(i<0||i+2>=a.Length||a[i+1]!="clear")return false;
   output=a[i+2];return true;
  }
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
  static void EarlyMute(){if(Requested(out _))AudioListener.volume=0;}
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
  static void Boot(){if(Requested(out var dir)){var host=new GameObject("StageClearOverlayCapture").AddComponent<Host>();host.dir=dir;}}

  [Serializable] sealed class Receipt {public bool passed;public int failures,width,height,simKills,simTicks,parSeconds,parScore;public string stateSource,testNote,rankFormal,rankDemo;public float[] ages;public string[] checks,files;}
  sealed class Host : MonoBehaviour {
   public string dir;NativeStageClearOverlay overlay;bool show;
   readonly List<string> checks=new List<string>(),files=new List<string>();int failures;
   void Check(bool ok,string what){checks.Add((ok?"PASS ":"FAIL ")+what);if(!ok)failures++;}
   void OnGUI(){if(overlay==null||!show)return;GUI.depth=-1000;overlay.Draw();}
   IEnumerator Start(){
    AudioListener.volume=0;AudioListener.pause=true;
    while(NativeGame.Instance==null||NativeGame.Instance.Simulation==null)yield return null;
    var game=NativeGame.Instance;yield return null;yield return null;
    game.enabled=false;var lobby=game.GetComponent<NativeLobby>();if(lobby!=null)lobby.enabled=false;
    foreach(var src in FindObjectsByType<AudioSource>())src.Stop();
    if(Camera.main!=null){Camera.main.cullingMask=0;Camera.main.backgroundColor=new Color(.015f,.02f,.018f);}
    Directory.CreateDirectory(dir);
    var sim=game.Simulation;overlay=new NativeStageClearOverlay();
    // (a) web formal-build capture values: 5 kills of 168 spawned, 4s, no combo, no deaths, no damage taken, no regions
    var formal=new NativeStageClearOverlay.Input{kind=NativeStageClearOverlay.Kind.Zone,stageKills=5,totalSpawned=168,clearSeconds=4,regionsCleared=0,bossKilled=true,deaths=0,dmgTaken=0,comboMax=0,
     dmgDealt=0,crits=0,parries=0,potions=0,maxHit=0,dashCount=0,dashMeters=0,walkMeters=0};
    int par=overlay.ParSeconds(168),parScore=overlay.ParScore(168);
    Check(par==510,"par seconds for 168 spawns = round(90+168*2.5) = 510 (got "+par+")");
    Check(parScore==5180,"par score for 168 spawns = 168*10+3500 = 5180 (got "+parScore+")");
    string rankFormal=overlay.Rank(4,par,5*10+1000+(par-4)*10+500+500,parScore,0);
    Check(rankFormal=="S","web formal values (score 7110) rank S (got "+rankFormal+")");
    var ages=new[]{0f,.15f,.3f,.6f,1.5f};
    overlay.ForcedAge=0;overlay.Show(formal);show=true;Check(overlay.Active,"Show(formal) activates the overlay");
    foreach(var age in ages){overlay.ForcedAge=age;yield return new WaitForSecondsRealtime(.25f);yield return Shot("unity_clear_t"+Mathf.RoundToInt(age*1000));}
    // (b) demo-build capture values (web ref 08): 16 kills, 7s, demo last-stage copy
    var demo=formal;demo.kind=NativeStageClearOverlay.Kind.DemoEnd;demo.stageKills=16;demo.clearSeconds=7;
    overlay.Show(demo);overlay.ForcedAge=1.5f;yield return new WaitForSecondsRealtime(.25f);yield return Shot("unity_clear_demo");
    // (c) hell-escape copy
    var hell=formal;hell.kind=NativeStageClearOverlay.Kind.HellEscape;hell.hellIndex=0;
    overlay.Show(hell);overlay.ForcedAge=1.5f;yield return new WaitForSecondsRealtime(.25f);yield return Shot("unity_clear_hell");
    // (d) 초기 캡처가 넘기는 제한 입력. 현행 StageFlow 일반 결과의 지원 범위를 뜻하지 않는다.
    int kills=sim.Kills,ticks=sim.TickCount;
    var real=new NativeStageClearOverlay.Input{kind=NativeStageClearOverlay.Kind.Zone,stageKills=kills,clearSeconds=ticks/60};
    real=NativeStageClearOverlay.WithAutoPotion(real,sim.PotionState);   // B11: potions used from the Core auto potion state
    overlay.Show(real);overlay.ForcedAge=1.5f;yield return new WaitForSecondsRealtime(.25f);yield return Shot("unity_clear_real");
    overlay.Hide();Check(!overlay.Active,"Hide() deactivates");show=false;
    var rec=new Receipt{passed=failures==0,failures=failures,width=Screen.width,height=Screen.height,simKills=kills,simTicks=ticks,parSeconds=par,parScore=parScore,rankFormal=rankFormal,rankDemo="S",
     stateSource="초기 캡처의 제한 입력: Simulation.Kills/TickCount 및 자동물약만 전달. 현행 일반 StageCleared/보스/지역 데이터 지원 범위와 구분",
     testNote="unity_clear_t* / demo / hell frames use explicit test values copied from the web captures (formal: 5 kills of 168, 4s; demo: 16 kills, 7s) to compare layout; recorded here, not game state",
     ages=ages,checks=checks.ToArray(),files=files.ToArray()};
    File.WriteAllText(Path.Combine(dir,"stageclear-capture.json"),JsonUtility.ToJson(rec,true));
    Application.Quit(failures==0?0:2);
   }
   IEnumerator Shot(string name){yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(dir,name+".png"));files.Add(name+".png");yield return null;}
  }
 }
}


namespace Exoduser.UnityPort
{
    public static class NativeStageClearPresentationCapture
    {
        internal const string Flag="--unity-stageclear-presentation-capture";
        static bool Requested{get{return Array.IndexOf(Environment.GetCommandLineArgs(),Flag)>=0;}}
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]static void Mute(){if(Requested){AudioListener.volume=0;AudioListener.pause=true;}}
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]static void Boot(){if(Requested)new GameObject("StageClearPresentationReview").AddComponent<Entry>();}
        sealed class Entry:MonoBehaviour{IEnumerator Start(){while(NativeGame.Instance==null||NativeGame.Instance.Simulation==null)yield return null;yield return NativeGame.Instance.StageClearPresentationReview();}}
    }
    public sealed partial class NativeGame
    {
        [Serializable]sealed class ClearReviewFrame{public string name,scope,locale;public int width,height,overflow,missingGlyphs,kills,totalSpawned,clearSeconds,rewardSP,balanceSP,regions,potions,deaths;public bool buttonInside,hasScore;public Rect button;public string[] visible;}
        [Serializable]sealed class ClearReviewReceipt{public string scope="실제 Core 완료 이벤트의 QA 직접 진입·강제 보스 처치와 별도 기존M1스냅샷 표시. 자연M1/손조작E2E 아님";public bool passed;public int failures;public List<string> checks=new List<string>();public List<ClearReviewFrame> frames=new List<ClearReviewFrame>();public string saveDirectory;public long revisionBefore,revisionAfter;}
        ClearReviewReceipt clearReview;string clearReviewOutput;
        void ClearReviewStep(float aimX,float aimY){var p=Simulation.Player;p.Hp=p.MaxHp;p.Shield=p.MaxShield;p.Iframes=99999;StepInput(0,0,aimX,aimY,false,false);}
        string ClearReviewState(){var p=Simulation.Player;var f=Simulation.Stage;return "tick="+Simulation.TickCount+" state="+p.State+" hp="+p.Hp+" xy="+p.X+","+p.Y+" arena="+f.InArena+" phase="+f.LoadPhase+" bossAlive="+f.BossAlive+" exits="+f.Exits.Count+" cleared="+f.StageCleared;}
        void ClearCheck(bool ok,string text){clearReview.checks.Add((ok?"통과 ":"실패 ")+text);if(!ok)clearReview.failures++;}
        IEnumerator ClearReviewFrameSave(string name,string scope){
            yield return new WaitForEndOfFrame();var rect=stageClear.ButtonScreenRect;var l=stageClear.LastLayout;
            bool inside=rect.x>=0&&rect.y>=0&&rect.xMax<=Screen.width&&rect.yMax<=Screen.height&&l!=null&&l.Panel.Contains(rect.x,rect.y)&&l.Panel.Contains(rect.xMax,rect.yMax);
            var snapshot=stageClear.CurrentInput;var f=new ClearReviewFrame{kills=snapshot.stageKills??-1,totalSpawned=snapshot.totalSpawned??-1,clearSeconds=snapshot.clearSeconds??-1,rewardSP=snapshot.statPointsAwarded??-1,balanceSP=snapshot.statPointsBalance??-1,regions=snapshot.regionsCleared??-1,potions=snapshot.potions??-1,deaths=snapshot.deaths??-1,hasScore=stageClear.PresentationModel().Score!=null,name=name,scope=scope,locale=lobby.Language,width=Screen.width,height=Screen.height,overflow=stageClear.LayoutOverflowCount,missingGlyphs=stageClear.MissingGlyphs,buttonInside=inside,button=rect,visible=stageClear.VisibleTexts.ToArray()};
            clearReview.frames.Add(f);ClearCheck(inside,name+" 결과/버튼이 화면과 패널 안");ClearCheck(f.overflow==0,name+" 문구 높이 넘침0");ClearCheck(f.missingGlyphs==0,name+" 사용 글꼴 누락0");ClearCheck(!Array.Exists(f.visible,s=>s.Contains("미이식")),name+" 일반화면에 내부구현문구0");
            ScreenCapture.CaptureScreenshot(Path.Combine(clearReviewOutput,name+".png"));yield return null;
        }
        internal IEnumerator StageClearPresentationReview(){
            clearReviewOutput=Argument("-output");clearReview=new ClearReviewReceipt();
            if(string.IsNullOrEmpty(clearReviewOutput)||string.IsNullOrEmpty(Argument("--unity-qa-sandbox"))||NativeReviewArgs.Any){Debug.LogError("클리어 QA 출력/격리저장 필수, 기존 강제review 인자와 동시사용 불가");Application.Quit(2);yield break;}
            Directory.CreateDirectory(clearReviewOutput);pauseSmoke=true;smokeActive=true;Application.runInBackground=true;AudioListener.volume=0;AudioListener.pause=true;
            lobby.ShowLobby();yield return null;
            string fresh="SC"+(DateTime.Now.Ticks%100000).ToString("00000");bool created=lobby.OpenCharacterCreation()&&lobby.ChooseCharacterVisual(0)&&lobby.ConfirmCharacterVisual()&&lobby.CreateCharacter(fresh);
            lobby.ShowLobby();bool entered=lobby.BeginCharacterEntry(false);float deadline=Time.realtimeSinceStartup+20;
            while(lobby.StartupCaptureState.Page!=FrontendEntryPage.Nemesis&&lobby.IsBlocking&&Time.realtimeSinceStartup<deadline)yield return null;
            lobby.StartupCaptureState.Skip();yield return null;lobby.StartupCaptureState.Skip();yield return null;
            deadline=Time.realtimeSinceStartup+15;while(lobby.IsBlocking&&Time.realtimeSinceStartup<deadline)yield return null;
            ClearCheck(created&&entered&&!lobby.IsBlocking,"격리 신규캐릭터가 실제 진입 API로 게임 도달");
            if(lobby.IsBlocking){yield return ClearReviewFinish();yield break;}
            EndFirstPractice(true);frontendEntryInputFence=false;menu=false;Running=false;var sim=Simulation;var p=sim.Player;var flow=sim.Stage;
            ClearCheck(!PlayerDown,"아레나 QA 시작 전 생존: "+ClearReviewState());if(PlayerDown){yield return ClearReviewFinish();yield break;}
            sim.Config.EnemyAiEnabled=false;sim.Enemies.Clear();sim.Loot.Clear();flow.FieldBossDone=true;flow.ForceUnlock();var gate=flow.Exits[1];p.X=(gate.X+.5f)*40;p.Y=(gate.Y+.5f)*40;p.Iframes=99999;
            int load=0;while((!flow.InArena||flow.LoadPhase!=0)&&load++<1000){ClearReviewStep(p.X+100,p.Y);if(load%30==0)yield return null;}
            var boss=flow.FindBoss();ClearCheck(boss!=null&&flow.InArena,"QA 직접 진입으로 실제 보스 아레나 도달");if(boss==null){yield return ClearReviewFinish();yield break;}
            for(int i=0;i<300;i++)ClearReviewStep(boss.X,boss.Y);
            int kill=0;while(flow.BossAlive&&kill++<4000){p.Hp=p.MaxHp;if(boss.Alive)sim.HurtEnemy(boss,boss.MaxHp*4);ClearReviewStep(boss.X,boss.Y);if(kill%30==0)yield return null;}
            for(int i=0;i<100;i++)ClearReviewStep(boss.X,boss.Y);
            p.X=(flow.Arena.ExitX+.5f)*40;p.Y=(flow.Arena.ExitY+.5f)*40;int beforeSp=p.StatPoints,ct=0;
            while(!flow.StageCleared&&ct++<150)ClearReviewStep(p.X,p.Y-100);
            var actual=stageClear.CurrentInput;
            ClearCheck(flow.StageCleared&&stageClear.Active,"실제 출구 Core 이벤트로 결과 활성화: "+ClearReviewState());if(!flow.StageCleared||!stageClear.Active){yield return ClearReviewFinish();yield break;}ClearCheck(p.StatPoints-beforeSp==10&&actual.statPointsAwarded==p.StatPoints-beforeSp,"실제SP증가10과표시보상일치");ClearCheck(actual.stageKills==flow.StageKills&&actual.clearSeconds==flow.BossClearSeconds,"처치·시간이현재Core스냅샷과일치");ClearCheck(stageClear.PresentationModel().Score==null,"일반실행의미지원점수/등급생성0");
            stageClear.AuditText=true;stageClear.ForcedAge=1.5f;lobby.SetLanguage("ko");Screen.SetResolution(1600,900,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.3f);
            yield return ClearReviewFrameSave("event-result-1600-ko","QA직접진입/강제보스처치, 결과는실제Core이벤트·현재데이터. 자연M1아님");
            Screen.SetResolution(960,540,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.25f);yield return ClearReviewFrameSave("event-result-960-ko","동일실제Core결과의작은창");
            for(int i=0;i<LobbyLanguage.Count;i++){string code=LobbyLanguage.GetCode(i);lobby.SetLanguage(code);stageClear.Show(actual);stageClear.ForcedAge=1.5f;yield return new WaitForSecondsRealtime(.06f);yield return ClearReviewFrameSave("locale-960-"+code,code=="ar"?"기존IMGUI RTL제약의영문폴백":"동일실측결과·원본웹사전문구");}
            // 비교 숫자는 기존 b3e441ca M1에서 확인된 값만 UI에 전달. 현재 시뮬레이션/보상은 변경하지 않는다.
            var copied=actual;copied.stageKills=137;copied.totalSpawned=168;copied.clearSeconds=88;copied.statPointsAwarded=10;copied.regionsCleared=4;copied.deaths=0;copied.potions=0;
            lobby.SetLanguage("ko");stageClear.Show(copied);stageClear.ForcedAge=1.5f;Screen.SetResolution(1600,900,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.25f);yield return ClearReviewFrameSave("qa-snapshot-1600-ko","기존M1확인값137/168·88초·SP10을복사한표시전용강제결과. 새로운자연클리어아님");
            stageClear.Show(actual);stageClear.ForcedAge=1.5f;yield return null;clearReview.revisionBefore=combatRevision;clearReview.saveDirectory=lobby.CharacterStoreDirectory;
            string reviewCharacter=lobby.ActiveCharacterName;bool next=stageClear.RequestNext();yield return null;clearReview.revisionAfter=combatRevision;
            ClearCheck(next&&!stageClear.Active&&lobby.IsBlocking,"생산버튼경로가결과닫기/로비이동실행");ClearCheck(clearReview.revisionAfter>clearReview.revisionBefore&&HasCombatSave(reviewCharacter),"생산버튼콜백이실제격리세이브기록");ClearCheck(!stageClear.RequestNext(),"중복버튼요청거부");
            yield return ClearReviewFinish();
        }
        IEnumerator ClearReviewFinish(){clearReview.passed=clearReview.failures==0;File.WriteAllText(Path.Combine(clearReviewOutput,"stageclear-presentation-review.json"),JsonUtility.ToJson(clearReview,true));yield return new WaitForSecondsRealtime(.4f);Application.Quit(clearReview.passed?0:2);}
    }
}
