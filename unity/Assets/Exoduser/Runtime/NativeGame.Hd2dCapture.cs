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
        [Serializable] sealed class Hd2dFrame
        {
            public string key,state;public int tick,width,height;public bool sprite,model,roll;public float footError,pixelError,hp;public Vector3 camera,centre;
        }
        [Serializable] sealed class Hd2dReceipt
        {
            public string scope="실제 hidden Player·격리세이브·실제Core/렌더/HUD. 시각검수 fixture: 탐험AI정지/고정추가적, 전투AI재개, 아레나gate강제개방. 자연완주·OS손조작 증거 아님";
            public bool passed;public List<string> failures=new List<string>();public List<Hd2dFrame> frames=new List<Hd2dFrame>();
        }
        IEnumerator Hd2dCapture()
        {
            string output=Argument("-output");
            if(string.IsNullOrEmpty(output)||string.IsNullOrEmpty(Argument("--unity-qa-sandbox"))){Application.Quit(2);yield break;}
            Directory.CreateDirectory(output);var rc=new Hd2dReceipt();
            AudioListener.volume=0;AudioListener.pause=true;smokeActive=true;dropSmoke=true;pauseSmoke=true;Application.runInBackground=true;
            lobby.ShowLobby();lobby.SelectPreview();lobby.EnterNativeTest();EndFirstPractice(true);frontendEntryInputFence=false;menu=false;Running=false;SetGameFocus(true);
            float until=Time.realtimeSinceStartup+45;
            while(NativeRemodel3D.Requested&&!NativeRemodel3D.Active&&Time.realtimeSinceStartup<until){UpdateViews();yield return null;}
            if(NativeRemodel3D.Requested&&!NativeRemodel3D.Active)rc.failures.Add("requested field scene not ready");
            foreach(int width in new[]{1920,3840})
            {
                Screen.SetResolution(width,1080,FullScreenMode.Windowed);until=Time.realtimeSinceStartup+10;
                while((Screen.width!=width||Screen.height!=1080)&&Time.realtimeSinceStartup<until)yield return null;
                for(int i=0;i<6;i++)yield return null;
                if(Screen.width!=width||Screen.height!=1080){rc.failures.Add("resolution mismatch "+width+": "+Screen.width+"x"+Screen.height);continue;}
                ResetRun();EndFirstPractice(true);frontendEntryInputFence=false;menu=false;Running=false;SetGameFocus(true);
                var sim=Simulation;var p=sim.Player;sim.Config.EnemyAiEnabled=false;sim.SpawnHoles=null;
                foreach(var spec in new[]{new[]{0,140,-100},new[]{4,-170,-100},new[]{9,270,40},new[]{29,-290,40}})
                    if(Map.CanMove(p.X+spec[1],p.Y+spec[2],24))sim.SpawnEnemy(p.X+spec[1],p.Y+spec[2],spec[0],null,false);
                for(int i=0;i<6;i++){UpdateViews();yield return null;}
                yield return Hd2dShot(output,width+"-exploration",rc);
                sim.Config.EnemyAiEnabled=true;
                for(int i=0;i<150;i++)
                {
                    StepInput(0,0,p.X+140,p.Y-100,i<100,false);yield return null;
                    if(i==60)yield return Hd2dShot(output,width+"-combat",rc);
                }
                // 화면 흔들림/구르기 검수용 실제 Core 이동 연속 프레임. 구르기 검수 시작에 HP/상태·구르기 자원만 격리 fixture에서 정리한다.
                string motion=Path.Combine(output,width+"-motion");Directory.CreateDirectory(motion);
                sim.Config.EnemyAiEnabled=false;p.Hp=p.MaxHp;p.State="idle";p.StateTicks=0;sim.HarpGauge=225;
                float mx=0,my=-1;bool free=false;
                foreach(var dir in new[]{new Vector2(0,-1),new Vector2(1,0),new Vector2(0,1),new Vector2(-1,0)})
                {bool open=true;for(int j=1;j<=12;j++)if(!Map.CanMove(p.X+dir.x*j*25,p.Y+dir.y*j*25,p.Radius)){open=false;break;}if(open){mx=dir.x;my=dir.y;free=true;break;}}
                if(!free)rc.failures.Add("motion route missing "+width);bool rolled=false;
                for(int i=0;i<90;i++)
                {
                    if(i==24)sim.SetRollInput(my<0,my>0,mx<0,mx>0,true);
                    if(i==25)sim.SetRollInput(my<0,my>0,mx<0,mx>0,false);
                    StepInput(i<65?mx:0,i<65?my:0,p.X+mx*200,p.Y+my*200,false,false);rolled|=sim.RollActive;yield return null;yield return new WaitForEndOfFrame();
                    if(i%2==0){Hd2dRecord(rc,width+"-motion-"+i);ScreenCapture.CaptureScreenshot(Path.Combine(motion,(i/2).ToString("D4")+".png"));}
                }
                if(!rolled)rc.failures.Add("Core roll not observed "+width);
                // 실제 아레나 생성·본전투 view를 쓰되 gate의 긴 필드 이동만 fixture로 생략한다.
                p.Hp=p.MaxHp;sim.Stage.FieldBossDone=true;sim.Stage.ForceUnlock();
                if(sim.Stage.Exits.Count>0)
                {
                    var gate=sim.Stage.Exits[0];p.X=(gate.X+.5f)*40;p.Y=(gate.Y+.5f)*40;
                    for(int i=0;i<400&&!sim.Stage.InArena;i++){StepInput(0,0,p.X+100,p.Y,false,false);if(i%20==0)yield return null;}
                    for(int i=0;i<360&&sim.Stage.LoadPhase!=0;i++){StepInput(0,0,p.X+100,p.Y,false,false);if(i%20==0)yield return null;}
                    var boss=sim.Stage.FindBoss();
                    if(boss!=null){p.X=boss.X;p.Y=boss.Y+220;UpdateViews();for(int i=0;i<8;i++)yield return null;yield return Hd2dShot(output,width+"-druid",rc);}
                    else rc.failures.Add("arena druid missing "+width);
                }
                else rc.failures.Add("field gate missing "+width);
                sim.Stage.LeaveArenaToField();UpdateViews();yield return null;
            }
            rc.passed=rc.failures.Count==0;File.WriteAllText(Path.Combine(output,"hd2d-player.json"),JsonUtility.ToJson(rc,true));
            lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();yield return new WaitForSecondsRealtime(.8f);Application.Quit(rc.passed?0:2);
        }
        IEnumerator Hd2dShot(string output,string key,Hd2dReceipt rc)
        {
            UpdateViews();yield return null;yield return new WaitForEndOfFrame();Hd2dRecord(rc,key);
            string path=Path.Combine(output,key+".png");ScreenCapture.CaptureScreenshot(path);float until=Time.realtimeSinceStartup+5;
            while(!File.Exists(path)&&Time.realtimeSinceStartup<until)yield return null;
            if(!File.Exists(path))rc.failures.Add("screenshot missing "+key);
        }
        void Hd2dRecord(Hd2dReceipt rc,string key)
        {
            var camera=HudCamera;var p=Simulation.Player;float below=NativeHd2D.FootLift(playerView.sprite)*Mathf.Abs(playerView.transform.lossyScale.y);
            var foot=playerView.transform.position-camera.transform.up*below;var a=camera.WorldToScreenPoint(foot);var b=camera.WorldToScreenPoint(Point(p.X,p.Y));
            float gap=Vector2.Distance(a,b),pixel=Vector2.Distance(new Vector2(a.x,a.y),new Vector2(Mathf.Round(a.x),Mathf.Round(a.y)));
            rc.frames.Add(new Hd2dFrame{key=key,tick=Simulation.TickCount,width=Screen.width,height=Screen.height,state=p.State,sprite=playerView.enabled,model=heroView!=null&&heroView.Ready,roll=Simulation.RollActive,footError=gap,pixelError=pixel,hp=p.Hp,camera=camera.transform.position,centre=playerView.transform.position});
            if(!playerView.enabled||heroView!=null&&heroView.Ready)rc.failures.Add("pixel actor not active: "+key);
            if(gap>.75f)rc.failures.Add("foot/Core anchor gap "+gap+"px: "+key);
            if(pixel>.02f)rc.failures.Add("final camera pixel grid gap "+pixel+"px: "+key);
        }
    }
}
