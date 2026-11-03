using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.LowLevel;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        [Serializable] sealed class A2RPlayReceipt
        {
            public string scope="Ordinary lobby/character/entry callbacks, startup skip and original StepInput/Core camp walking. No coordinate assignment on the main route. Optional supplementary fixed-pose visual fixture is labeled separately. Fixture invulnerability; not human play or balance QA.";
            public List<string> frontendBoundaries=new List<string>();public bool ordinaryEntryVerified,legacyFrontendBypass;public int nearestDrawCalls;public int nearestCoveredPixels;public List<A2RPlayFrame> frames=new List<A2RPlayFrame>();
            public bool sightVerified;public string heroFrame,visualFixture;public int overlapRenderers,peakOverlapRenderers,visualPoseAssignments,legacyFogFeatures,nearestProbeCoveredPixels;
            public string sandbox;public bool passed,arrived,noTeleport=true;public int errors,ticks,blockedTicks;public float walkedPixels,seconds,campFps;public List<string> failures=new List<string>(),steps=new List<string>();public Vector2 start,end;
        }
        [Serializable] sealed class A2RPlayFrame {public string id;public int width,height;public Vector2 heroScreen;public List<Vector2> distantEnemies=new List<Vector2>();public Vector3 cameraPosition;public float cameraFov;}
        A2RPlayReceipt a2rPlay;string a2rPlayOutput;float a2rPlayStarted;
        internal void BeginA2RPlaySmoke(){StartCoroutine(A2RPlaySmoke());}
        void A2RPlayLog(string message,string stack,LogType type){if(type==LogType.Error||type==LogType.Exception||type==LogType.Assert){a2rPlay.errors++;a2rPlay.failures.Add(message);}}
        void A2RPlayWrite(){File.WriteAllText(Path.Combine(a2rPlayOutput,"play-smoke.json"),JsonUtility.ToJson(a2rPlay,true));}
        IEnumerator A2RPlayShot(string id)
        {
            UpdateViews();for(int i=0;i<3;i++)yield return null;yield return new WaitForEndOfFrame();var image=new Texture2D(Screen.width,Screen.height,TextureFormat.RGB24,false);image.ReadPixels(new Rect(0,0,Screen.width,Screen.height),0,0);image.Apply();File.WriteAllBytes(Path.Combine(a2rPlayOutput,id+".png"),image.EncodeToPNG());Destroy(image);if(r3Cam!=null&&playerView!=null){var v=r3Cam.WorldToScreenPoint(a2rLighting.Readability.HeroBounds.center);var f=new A2RPlayFrame{id=id,width=Screen.width,height=Screen.height,heroScreen=new Vector2(v.x,Screen.height-v.y),cameraPosition=r3Cam.transform.position,cameraFov=r3Cam.fieldOfView};foreach(var e in enemies.Values)if(e.body!=null&&e.body.enabled&&e.body.gameObject.activeInHierarchy){var q=r3Cam.WorldToScreenPoint(e.body.bounds.center);if(q.z>0&&q.x>0&&q.x<Screen.width&&q.y>Screen.height*.60f&&q.y<Screen.height)f.distantEnemies.Add(new Vector2(q.x,Screen.height-q.y));}a2rPlay.frames.Add(f);}A2RCompositionWrite(id);a2rPlay.steps.Add(id+" stage="+lobby.StageName+" player="+Simulation.Player.X+","+Simulation.Player.Y);A2RPlayWrite();
        }
        IEnumerator A2RPlayKey(Key key,bool hold=false)
        {
            var keyboard=Keyboard.current??InputSystem.AddDevice<Keyboard>();InputSystem.QueueStateEvent(keyboard,new KeyboardState(key));float until=Time.realtimeSinceStartup+(hold?6:.1f);while(Time.realtimeSinceStartup<until&&(hold?lobby.CharacterStoryActive:true))yield return null;InputSystem.QueueStateEvent(keyboard,new KeyboardState());for(int i=0;i<3;i++)yield return null;
        }
        IEnumerator A2RPlaySmoke()
        {
            a2rPlayOutput=Argument("-output");if(string.IsNullOrEmpty(a2rPlayOutput)||!Path.IsPathRooted(a2rPlayOutput)||!NativeQaSandbox.Active){Application.Quit(2);yield break;}
            Directory.CreateDirectory(a2rPlayOutput);a2rPlayStarted=Time.realtimeSinceStartup;a2rPlay=new A2RPlayReceipt{sandbox=NativeQaSandbox.Root};foreach(var arg in Environment.GetCommandLineArgs())if(arg.StartsWith("--unity-",StringComparison.Ordinal)&&arg.EndsWith("-smoke",StringComparison.Ordinal))a2rPlay.legacyFrontendBypass=true;Application.logMessageReceived+=A2RPlayLog;Application.runInBackground=true;AudioListener.volume=0;AudioListener.pause=true;
            smokeActive=true;pauseSmoke=true;dropSmoke=true;lobbySmoke=true;introKeysSmoke=true;lobby.AutomatedInput=false;SetGameFocus(true);lobby.SetPlaybackFocus(true);
            yield return A2RPlayShot("00-startup");
            // As in FullRunQa: open the real lobby only after cold field setup has finished.
            // NativeGame's quick-start transition can otherwise age past 12s during that synchronous load.
            if(Array.IndexOf(Environment.GetCommandLineArgs(),"--a2r-lobby-start")>=0){float ready=Time.realtimeSinceStartup+120;while((!Remodel3DReady||a2rWeb==null||!a2rWeb.Applied)&&Time.realtimeSinceStartup<ready){UpdateViews();yield return null;}yield return A2RWaitFrontend("cold-load");lobby.ShowLobby();yield return A2RWaitFrontend("ready-lobby");}
            float deadline=Time.realtimeSinceStartup+110,lastKey=-10;
            while(lobby.Flow.Page!=LobbyPage.Lobby&&Time.realtimeSinceStartup<deadline){if(Time.realtimeSinceStartup-lastKey>.8f){string stage=lobby.StageName;if(stage=="FDG"||stage=="SplashTitle"||stage=="Title")LobbyKeys.Press(KeyCode.Return);else if(stage=="WorldIntro")LobbyKeys.Hold(KeyCode.Escape,true);lastKey=Time.realtimeSinceStartup;}yield return null;}
            LobbyKeys.ReleaseAll();if(lobby.Flow.Page!=LobbyPage.Lobby){a2rPlay.failures.Add("Product title did not reach Lobby");A2RPlayFinish();yield break;}yield return A2RPlayShot("01-lobby");
            yield return A2RWaitFrontend("initial-lobby");
            if(lobby.Characters.Count==0){bool opened=lobby.OpenCharacterCreation();yield return A2RWaitFrontend("selection");bool confirmed=opened&&lobby.ChooseCharacterVisual(0)&&lobby.ConfirmCharacterVisual();yield return A2RWaitFrontend("name");bool created=confirmed&&lobby.CreateCharacter("A2R검수");yield return A2RWaitFrontend("created-story");if(!created)a2rPlay.failures.Add("Isolated character creation failed");lobby.ShowLobby();yield return A2RWaitFrontend("entry-lobby");}
            if(a2rPlay.failures.Count>0||!lobby.EnterSelectedCharacter()){a2rPlay.failures.Add("Product EnterSelectedCharacter rejected");A2RPlayFinish();yield break;}
            yield return A2RWaitFrontend("lobby-game");deadline=Time.realtimeSinceStartup+30;while(lobby.StartupEntryActive&&lobby.StartupCaptureState.Page!=FrontendEntryPage.Nemesis&&Time.realtimeSinceStartup<deadline){lobby.SetPlaybackFocus(true);yield return null;}
            if(lobby.StartupEntryActive){lobby.StartupCaptureState.Skip();yield return null;lobby.StartupCaptureState.Skip();yield return null;}
            deadline=Time.realtimeSinceStartup+20;while(lobby.IsBlocking&&Time.realtimeSinceStartup<deadline){lobby.SetPlaybackFocus(true);yield return null;}
            if(lobby.IsBlocking||a2rPlay.failures.Count>0){a2rPlay.failures.Add("Product startup did not reach field");A2RPlayFinish();yield break;}a2rPlay.ordinaryEntryVerified=!a2rPlay.legacyFrontendBypass;if(firstPractice!=null)EndFirstPractice(true);
            deadline=Time.realtimeSinceStartup+45;while((!Remodel3DReady||a2rWeb==null||!a2rWeb.Applied)&&Time.realtimeSinceStartup<deadline){UpdateViews();yield return null;}
            if(a2rWeb==null||!a2rWeb.Applied){a2rPlay.failures.Add("Default A2R presentation not active");A2RPlayFinish();yield break;}
            a2rPlay.start=new Vector2(Simulation.Player.X,Simulation.Player.Y);yield return A2RPlayShot("02-field-entry");Running=false;frontendEntryInputFence=false;var goal=new Vector2(2050,4400);var route=A2RWalkPath(a2rPlay.start,goal);
            if(route.Count==0){a2rPlay.failures.Add("No radius-safe Core route to camp");A2RPlayFinish();yield break;}
            int waypoint=0,stall=0,nextShot=600;float next=Time.realtimeSinceStartup;deadline=next+150;
            while(waypoint<route.Count&&Time.realtimeSinceStartup<deadline)
            {
                float now=Time.realtimeSinceStartup;int catchup=0;
                while(next<=now&&catchup++<8&&waypoint<route.Count)
                {
                    var p=Simulation.Player;var current=new Vector2(p.X,p.Y);if(Vector2.Distance(current,route[waypoint])<5){waypoint++;continue;}var move=(route[waypoint]-current).normalized;p.Iframes=600;StepInput(move.x,move.y,route[waypoint].x,route[waypoint].y,false,false);float moved=Vector2.Distance(current,new Vector2(p.X,p.Y));a2rPlay.walkedPixels+=moved;a2rPlay.ticks++;if(moved<.01f){stall++;a2rPlay.blockedTicks++;}else stall=0;next+=1/60f;if(stall>120){a2rPlay.failures.Add("Core walking stalled at "+current);waypoint=route.Count;break;}
                }
                UpdateViews();if(a2rPlay.ticks>=nextShot){nextShot+=600;yield return A2RPlayShot("03-route-"+a2rPlay.ticks);}yield return null;
            }
            a2rPlay.nearestDrawCalls=a2rOcclusion.NearestDrawCalls;a2rPlay.nearestCoveredPixels=a2rOcclusion.NearestCoveredPixels();a2rPlay.end=new Vector2(Simulation.Player.X,Simulation.Player.Y);a2rPlay.arrived=Vector2.Distance(a2rPlay.end,goal)<55;if(!a2rPlay.arrived)a2rPlay.failures.Add("Actual walk did not reach camp");yield return A2RPlayShot("04-camp-arrival");
            a2rPlay.legacyFogFeatures=a2rLighting.LegacyFogFeatures;a2rPlay.heroFrame=a2rLighting.Readability.HeroFrame;a2rPlay.overlapRenderers=a2rLighting.Readability.OverlapCount;a2rPlay.peakOverlapRenderers=a2rLighting.Readability.PeakOverlapCount;
            if(a2rModels!=null&&A2RProps3D.Enabled){a2rModels.SetLook(false);yield return new WaitForSecondsRealtime(.3f);yield return A2RPlayShot("04c-camp-3d-off");a2rModels.SetLook(true);yield return new WaitForSecondsRealtime(.3f);yield return A2RPlayShot("04d-camp-3d-on");}
            a2rLighting.Readability.CaptureHideEnemies=true;yield return A2RPlayShot("04b-hero-isolated");a2rLighting.Readability.CaptureHideEnemies=false;
            File.WriteAllText(Path.Combine(a2rPlayOutput,"web-assets-receipt.json"),JsonUtility.ToJson(a2rWeb.Result,true));if(a2rWeb.Result.groundTiles!=64||a2rWeb.Result.sourceCards<142||a2rWeb.Result.floating!=0)a2rPlay.failures.Add("Full-art/grounding receipt failed");
            if(a2rModels!=null){File.WriteAllText(Path.Combine(a2rPlayOutput,"props3d-receipt.json"),JsonUtility.ToJson(a2rModels.Result,true));if(A2RProps3D.Enabled&&(a2rModels.Result.standingCards>0||a2rModels.Result.floating>0||a2rModels.Result.missing>0))a2rPlay.failures.Add("3D placement/grounding receipt failed");}
            float at=Time.realtimeSinceStartup;int frames=0;while(Time.realtimeSinceStartup-at<3){UpdateViews();frames++;yield return null;}a2rPlay.campFps=frames/(Time.realtimeSinceStartup-at);
            Screen.SetResolution(3840,1080,FullScreenMode.Windowed);deadline=Time.realtimeSinceStartup+8;while((Screen.width!=3840||Screen.height!=1080)&&Time.realtimeSinceStartup<deadline)yield return null;
            if(Screen.width==3840&&Screen.height==1080){for(int i=0;i<10;i++){UpdateViews();yield return null;}yield return A2RPlayShot("05-camp-3840");}else a2rPlay.failures.Add("3840 native resolution failed");
            if(Array.IndexOf(Environment.GetCommandLineArgs(),"--a2r-r17-proof")>=0)yield return A2RR17Proof();if(Array.IndexOf(Environment.GetCommandLineArgs(),"--a2r-r16-proof")>=0)yield return A2RR16Proof();if(Array.IndexOf(Environment.GetCommandLineArgs(),"--a2r-r15-sheet")>=0)yield return A2RR15Sheet();if(Array.IndexOf(Environment.GetCommandLineArgs(),"--a2r-r14-proof")>=0)yield return A2RR14Proof();if(Array.IndexOf(Environment.GetCommandLineArgs(),"--a2r-night-proof")>=0)yield return A2RNightProof();if(Array.IndexOf(Environment.GetCommandLineArgs(),"--a2r-sight-smoke")>=0)yield return A2RSightSmoke();if(Array.IndexOf(Environment.GetCommandLineArgs(),"--a2r-surface-diagnostic")>=0)yield return A2RSurfaceDiagnostic();if(Array.IndexOf(Environment.GetCommandLineArgs(),"--a2r-nature-capture")>=0)yield return A2RNatureDetails();A2RPlayFinish();
        }
        IEnumerator A2RWaitFrontend(string boundary){float deadline=Time.realtimeSinceStartup+25;while((NativeScreenTransition.Busy||lobby.CinematicEntryPending)&&Time.realtimeSinceStartup<deadline){lobby.SetPlaybackFocus(true);yield return null;}if(NativeScreenTransition.Busy||lobby.CinematicEntryPending)a2rPlay.failures.Add("Frontend timeout:"+boundary);if(boundary!="cold-load"&&NativeScreenTransition.History!=null&&NativeScreenTransition.History.Count>0){var last=NativeScreenTransition.History[NativeScreenTransition.History.Count-1];if(last.failed||last.cancelled)a2rPlay.failures.Add("Frontend transition failed:"+boundary+":"+last.error);}a2rPlay.frontendBoundaries.Add(boundary);A2RPlayWrite();yield return null;}
        List<Vector2> A2RWalkPath(Vector2 start,Vector2 goal)
        {
            const int size=200;var previous=new int[size*size];for(int i=0;i<previous.Length;i++)previous[i]=-2;int source=Mathf.Clamp((int)(start.y/40),0,199)*size+Mathf.Clamp((int)(start.x/40),0,199),target=(int)(goal.y/40)*size+(int)(goal.x/40);var queue=new Queue<int>();queue.Enqueue(source);previous[source]=-1;float radius=Simulation.Player.Radius;
            while(queue.Count>0){int index=queue.Dequeue();if(index==target)break;int x=index%size,y=index/size;foreach(var d in new[]{Vector2Int.up,Vector2Int.right,Vector2Int.down,Vector2Int.left}){int xx=x+d.x,yy=y+d.y;if(xx<0||yy<0||xx>=size||yy>=size)continue;int n=yy*size+xx;if(previous[n]!=-2||!Map.CanMove(xx*40+20,yy*40+20,radius+5))continue;bool clear=true;for(int k=1;k<4;k++)if(!Map.CanMove(x*40+20+d.x*k*10,y*40+20+d.y*k*10,radius+5))clear=false;if(!clear)continue;previous[n]=index;queue.Enqueue(n);}}
            var result=new List<Vector2>();if(previous[target]==-2)return result;for(int n=target;n>=0;n=previous[n])result.Add(new Vector2(n%size*40+20,n/size*40+20));result.Reverse();result.Add(goal);return result;
        }
        void A2RPlayFinish(){LobbyKeys.ReleaseAll();a2rPlay.errors=Mathf.Max(a2rPlay.errors,A2REarlyQA.ErrorCount);if(A2REarlyQA.ErrorCount>0)a2rPlay.failures.Add("Full-process QA errors: "+A2REarlyQA.ErrorCount+" (see early-errors.json, including startup)");a2rPlay.seconds=Time.realtimeSinceStartup-a2rPlayStarted;a2rPlay.passed=a2rPlay.ordinaryEntryVerified&&a2rPlay.arrived&&a2rPlay.errors==0&&a2rPlay.failures.Count==0;A2RPlayWrite();Application.logMessageReceived-=A2RPlayLog;lobby.CloseStartupCaptureMedia();sound.Reset();Application.Quit(a2rPlay.passed?0:3);}
    }
}
