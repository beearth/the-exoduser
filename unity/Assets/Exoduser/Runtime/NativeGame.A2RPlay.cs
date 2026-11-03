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
            public string scope="Product title LobbyKeys + character/entry callbacks + original StepInput/Core walking. No player coordinate assignment. Tutorial Skip callback and refreshed fixture invulnerability; not hand-play or balance QA.";
            public string sandbox;public bool passed,arrived,noTeleport=true;public int errors,ticks,blockedTicks;public float walkedPixels,seconds,campFps;public List<string> failures=new List<string>(),steps=new List<string>();public Vector2 start,end;
        }
        A2RPlayReceipt a2rPlay;string a2rPlayOutput;float a2rPlayStarted;
        internal void BeginA2RPlaySmoke(){StartCoroutine(A2RPlaySmoke());}
        void A2RPlayLog(string message,string stack,LogType type){if(type==LogType.Error||type==LogType.Exception||type==LogType.Assert){a2rPlay.errors++;a2rPlay.failures.Add(message);}}
        void A2RPlayWrite(){File.WriteAllText(Path.Combine(a2rPlayOutput,"play-smoke.json"),JsonUtility.ToJson(a2rPlay,true));}
        IEnumerator A2RPlayShot(string id)
        {
            UpdateViews();for(int i=0;i<3;i++)yield return null;yield return new WaitForEndOfFrame();var image=new Texture2D(Screen.width,Screen.height,TextureFormat.RGB24,false);image.ReadPixels(new Rect(0,0,Screen.width,Screen.height),0,0);image.Apply();File.WriteAllBytes(Path.Combine(a2rPlayOutput,id+".png"),image.EncodeToPNG());Destroy(image);a2rPlay.steps.Add(id+" stage="+lobby.StageName+" player="+Simulation.Player.X+","+Simulation.Player.Y);A2RPlayWrite();
        }
        IEnumerator A2RPlayKey(Key key,bool hold=false)
        {
            var keyboard=Keyboard.current??InputSystem.AddDevice<Keyboard>();InputSystem.QueueStateEvent(keyboard,new KeyboardState(key));float until=Time.realtimeSinceStartup+(hold?6:.1f);while(Time.realtimeSinceStartup<until&&(hold?lobby.CharacterStoryActive:true))yield return null;InputSystem.QueueStateEvent(keyboard,new KeyboardState());for(int i=0;i<3;i++)yield return null;
        }
        IEnumerator A2RPlaySmoke()
        {
            a2rPlayOutput=Argument("-output");if(string.IsNullOrEmpty(a2rPlayOutput)||!Path.IsPathRooted(a2rPlayOutput)||!NativeQaSandbox.Active){Application.Quit(2);yield break;}
            Directory.CreateDirectory(a2rPlayOutput);a2rPlayStarted=Time.realtimeSinceStartup;a2rPlay=new A2RPlayReceipt{sandbox=NativeQaSandbox.Root};Application.logMessageReceived+=A2RPlayLog;Application.runInBackground=true;AudioListener.volume=0;AudioListener.pause=true;
            smokeActive=true;pauseSmoke=true;dropSmoke=true;lobbySmoke=true;introKeysSmoke=true;lobby.AutomatedInput=false;SetGameFocus(true);lobby.SetPlaybackFocus(true);
            yield return A2RPlayShot("00-startup");float deadline=Time.realtimeSinceStartup+110,lastKey=-10;
            while(lobby.Flow.Page!=LobbyPage.Lobby&&Time.realtimeSinceStartup<deadline){if(Time.realtimeSinceStartup-lastKey>.8f){string stage=lobby.StageName;if(stage=="FDG"||stage=="SplashTitle"||stage=="Title")LobbyKeys.Press(KeyCode.Return);else if(stage=="WorldIntro")LobbyKeys.Hold(KeyCode.Escape,true);lastKey=Time.realtimeSinceStartup;}yield return null;}
            LobbyKeys.ReleaseAll();if(lobby.Flow.Page!=LobbyPage.Lobby){a2rPlay.failures.Add("Product title did not reach Lobby");A2RPlayFinish();yield break;}yield return A2RPlayShot("01-lobby");
            if(lobby.Characters.Count==0&&(!lobby.OpenCharacterCreation()||!lobby.ConfirmCharacterVisual()||!lobby.CreateCharacter("A2R검수")))a2rPlay.failures.Add("Isolated character creation failed");
            deadline=Time.realtimeSinceStartup+25;while(lobby.CharacterStoryActive&&Time.realtimeSinceStartup<deadline)yield return A2RPlayKey(Key.Escape,true);
            if(!lobby.StartupEntryActive&&lobby.IsBlocking&&!lobby.EnterSelectedCharacter()){a2rPlay.failures.Add("Product EnterSelectedCharacter rejected");A2RPlayFinish();yield break;}
            deadline=Time.realtimeSinceStartup+50;while(lobby.IsBlocking&&Time.realtimeSinceStartup<deadline){if(lobby.StartupStage=="Nemesis"||lobby.StartupStage=="Guide")yield return A2RPlayKey(Key.Escape);else yield return null;}
            if(lobby.IsBlocking){a2rPlay.failures.Add("Product startup did not reach field");A2RPlayFinish();yield break;}if(firstPractice!=null)EndFirstPractice(true);
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
            a2rPlay.end=new Vector2(Simulation.Player.X,Simulation.Player.Y);a2rPlay.arrived=Vector2.Distance(a2rPlay.end,goal)<55;if(!a2rPlay.arrived)a2rPlay.failures.Add("Actual walk did not reach camp");yield return A2RPlayShot("04-camp-arrival");
            File.WriteAllText(Path.Combine(a2rPlayOutput,"web-assets-receipt.json"),JsonUtility.ToJson(a2rWeb.Result,true));if(a2rWeb.Result.groundTiles!=64||a2rWeb.Result.sourceCards<142||a2rWeb.Result.floating!=0)a2rPlay.failures.Add("Full-art/grounding receipt failed");
            float at=Time.realtimeSinceStartup;int frames=0;while(Time.realtimeSinceStartup-at<3){UpdateViews();frames++;yield return null;}a2rPlay.campFps=frames/(Time.realtimeSinceStartup-at);
            Screen.SetResolution(3840,1080,FullScreenMode.Windowed);deadline=Time.realtimeSinceStartup+8;while((Screen.width!=3840||Screen.height!=1080)&&Time.realtimeSinceStartup<deadline)yield return null;
            if(Screen.width==3840&&Screen.height==1080){for(int i=0;i<10;i++){UpdateViews();yield return null;}yield return A2RPlayShot("05-camp-3840");}else a2rPlay.failures.Add("3840 native resolution failed");A2RPlayFinish();
        }
        List<Vector2> A2RWalkPath(Vector2 start,Vector2 goal)
        {
            const int size=200;var previous=new int[size*size];for(int i=0;i<previous.Length;i++)previous[i]=-2;int source=Mathf.Clamp((int)(start.y/40),0,199)*size+Mathf.Clamp((int)(start.x/40),0,199),target=(int)(goal.y/40)*size+(int)(goal.x/40);var queue=new Queue<int>();queue.Enqueue(source);previous[source]=-1;float radius=Simulation.Player.Radius;
            while(queue.Count>0){int index=queue.Dequeue();if(index==target)break;int x=index%size,y=index/size;foreach(var d in new[]{Vector2Int.up,Vector2Int.right,Vector2Int.down,Vector2Int.left}){int xx=x+d.x,yy=y+d.y;if(xx<0||yy<0||xx>=size||yy>=size)continue;int n=yy*size+xx;if(previous[n]!=-2||!Map.CanMove(xx*40+20,yy*40+20,radius+5))continue;bool clear=true;for(int k=1;k<4;k++)if(!Map.CanMove(x*40+20+d.x*k*10,y*40+20+d.y*k*10,radius+5))clear=false;if(!clear)continue;previous[n]=index;queue.Enqueue(n);}}
            var result=new List<Vector2>();if(previous[target]==-2)return result;for(int n=target;n>=0;n=previous[n])result.Add(new Vector2(n%size*40+20,n/size*40+20));result.Reverse();result.Add(goal);return result;
        }
        void A2RPlayFinish(){LobbyKeys.ReleaseAll();a2rPlay.seconds=Time.realtimeSinceStartup-a2rPlayStarted;a2rPlay.passed=a2rPlay.arrived&&a2rPlay.errors==0&&a2rPlay.failures.Count==0;A2RPlayWrite();Application.logMessageReceived-=A2RPlayLog;lobby.CloseStartupCaptureMedia();sound.Reset();Application.Quit(a2rPlay.passed?0:3);}
    }
}
