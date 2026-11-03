using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        float gb1Video1Start=-1,gb1Video2Start=-1;int gb1Video1Frames,gb1Video2Frames;bool gb1FirstShot,gb1Journey2;
        readonly List<float> gb1Video1Times=new List<float>(),gb1Video2Times=new List<float>();
        [Serializable] sealed class GB1Motion {public string scope;public int width=1920,height=1080,frames;public float realSeconds;public List<float> videoTimes;}
        IEnumerator GB1WalkFrame()
        {
            if(!GrayboxRequested)yield break;float now=Time.realtimeSinceStartup;
            if(!gb1FirstShot&&Vector2.Distance(new Vector2(Simulation.Player.X,Simulation.Player.Y),new Vector2(4020,6650))<400){gb1FirstShot=true;yield return GB1Shot("gb1-02-first");}
            if(gb1Journey2&&gb1Video2Start<0&&Simulation.Player.Y<=4150)gb1Video2Start=Time.realtimeSinceStartup;
            int which=gb1Video2Start>=0?2:1;float start=which==2?gb1Video2Start:gb1Video1Start,duration=which==2?11:10;if(start<0)yield break;int count=which==2?gb1Video2Frames:gb1Video1Frames;float t=now-start;if(t<0||t>duration||t<count*.1f)yield break;
            yield return new WaitForEndOfFrame();var texture=ScreenCapture.CaptureScreenshotAsTexture();string dir=Path.Combine(map25DPlayOutput,"video0"+which);Directory.CreateDirectory(dir);SaveMap25DBmp(Path.Combine(dir,count.ToString("D4")+".bmp"),texture.GetPixels32(),texture.width,texture.height);Destroy(texture);var times=which==2?gb1Video2Times:gb1Video1Times;times.Add(Time.realtimeSinceStartup-start);if(which==2)gb1Video2Frames++;else gb1Video1Frames++;
        }
        IEnumerator GB1Shot(string id){yield return Map25DPlayShot(id,"GB1 actual walked position; no coordinate assignment");var audit=map25D.GetComponent<Map25DGraybox>();if(audit!=null)audit.Audit(r3Cam,Path.Combine(map25DPlayOutput,id+"-grounding.json"));}
        IEnumerator GB1WideShot(string id,bool measure=false)
        {
            Screen.SetResolution(3840,1080,FullScreenMode.Windowed);float until=Time.realtimeSinceStartup+10;while(Screen.width!=3840&&Time.realtimeSinceStartup<until)yield return null;for(int i=0;i<5;i++){UpdateViews();yield return null;}yield return GB1Shot(id);if(measure){int frames=0;var samples=new List<float>();float start=Time.realtimeSinceStartup,last=start;int cap=Application.targetFrameRate;Application.targetFrameRate=-1;QualitySettings.vSyncCount=0;while(Time.realtimeSinceStartup-start<6){UpdateViews();yield return null;float now=Time.realtimeSinceStartup;samples.Add((now-last)*1000);last=now;frames++;}samples.Sort();File.WriteAllText(Path.Combine(map25DPlayOutput,id+"-fps.json"),"{\"width\":3840,\"height\":1080,\"fps\":"+(frames/(Time.realtimeSinceStartup-start)).ToString(System.Globalization.CultureInfo.InvariantCulture)+",\"p95Ms\":"+samples[Mathf.Min(samples.Count-1,(int)(samples.Count*.95f))].ToString(System.Globalization.CultureInfo.InvariantCulture)+",\"scope\":\"actual uncapped6s static walked camp, Core paused; dense combat separate\"}");Application.targetFrameRate=cap;}Screen.SetResolution(1920,1080,FullScreenMode.Windowed);for(int i=0;i<5;i++){UpdateViews();yield return null;}
        }
        IEnumerator GB1WalkTo(Vector2 goal,string shot)
        {
            var route=Map25DFindWalkPath(new Vector2(Simulation.Player.X,Simulation.Player.Y),goal);if(route.Count==0){map25DPlayReceipt.failures.Add("GB1 route unavailable "+goal);yield break;}int index=0,stall=0;float next=Time.realtimeSinceStartup,deadline=next+150;
            while(index<route.Count&&Time.realtimeSinceStartup<deadline){float now=Time.realtimeSinceStartup;int catchup=0;while(next<=now&&catchup++<8&&index<route.Count){var p=Simulation.Player;var current=new Vector2(p.X,p.Y);if(Vector2.Distance(current,route[index])<5){index++;continue;}var d=(route[index]-current).normalized;p.Iframes=600;StepInput(d.x,d.y,route[index].x,route[index].y,false,false);Map25DTrackEnemies();float moved=Vector2.Distance(current,new Vector2(p.X,p.Y));map25DPlayReceipt.walkedPixels+=moved;map25DPlayReceipt.ticks++;if(moved<.01f){stall++;map25DPlayReceipt.blockedTicks++;}else stall=0;next+=1/60f;if(stall>120){map25DPlayReceipt.failures.Add("GB1 walk stalled "+goal);index=route.Count;break;}}UpdateViews();yield return null;yield return GB1WalkFrame();}
            if(Vector2.Distance(new Vector2(Simulation.Player.X,Simulation.Player.Y),goal)>50)map25DPlayReceipt.failures.Add("GB1 did not arrive "+goal);yield return GB1Shot(shot);
        }
        void GB1WriteFirstVideo(){File.WriteAllText(Path.Combine(map25DPlayOutput,"video01.json"),JsonUtility.ToJson(new GB1Motion{scope="GB1a original Core walking unchanged; first continuous10s of start-to-camp route, composition terrain may differ",frames=gb1Video1Frames,realSeconds=10,videoTimes=gb1Video1Times},true));}
        IEnumerator GB1ContinueProof()
        {
            yield return GB1Shot("gb1-03-camp");yield return GB1WideShot("gb1-03-camp-3840",true);gb1Journey2=true;
            yield return GB1WalkTo(new Vector2(2110,3540),"gb1-a2");yield return GB1WideShot("gb1-a2-3840");
            yield return GB1WalkTo(new Vector2(2420,2420),"gb1-04-bridge-north");
            yield return GB1WalkTo(new Vector2(3400,2690),"gb1-05-root");
            yield return GB1WalkTo(new Vector2(5420,1820),"gb1-06-combat");yield return GB1WideShot("gb1-06-combat-3840");yield return Map25DDenseCombatBench();Screen.SetResolution(1920,1080,FullScreenMode.Windowed);for(int i=0;i<6;i++){UpdateViews();yield return null;}
            yield return GB1WalkTo(new Vector2(4020,820),"gb1-07-gate");yield return GB1WideShot("gb1-07-gate-3840");
            Map25DEnemyAudit(Path.Combine(map25DPlayOutput,"gb1-enemy-gate.json"),false);
            File.WriteAllText(Path.Combine(map25DPlayOutput,"video01.json"),JsonUtility.ToJson(new GB1Motion{scope="Continuous first10s of actual start-to-camp walking route; full trip is longer, no speed-up",frames=gb1Video1Frames,realSeconds=10,videoTimes=gb1Video1Times},true));File.WriteAllText(Path.Combine(map25DPlayOutput,"video02.json"),JsonUtility.ToJson(new GB1Motion{scope="Continuous actual camp-to-north-bank walking. Raw11s; deliver final10s without time scaling",frames=gb1Video2Frames,realSeconds=11,videoTimes=gb1Video2Times},true));
            lobby.ShowLobby();Running=false;for(int i=0;i<8;i++)yield return null;yield return Map25DPlayShot("gb1-lobby-return");if(map25DPresentationOn)map25DPlayReceipt.failures.Add("GB1 layer leaked into lobby");
        }
    }
}
