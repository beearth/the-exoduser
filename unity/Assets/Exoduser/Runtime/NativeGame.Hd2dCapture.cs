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
            public string key,state,playerMaterial,bossState,bossTexture,bossMaterial;public Vector4 bossRect;public bool bossSprite,contact;public int tick,width,height;public bool sprite,model,roll;public float footError,pixelError,hp;public Vector3 camera,centre;
        }
        [Serializable] sealed class Hd2dFile { public string path;public int width,height; }
        [Serializable] sealed class Hd2dReceipt
        {
            public string scope="실제 hidden Player·격리세이브·실제Core/렌더/HUD. 시각검수 fixture: 탐험AI정지/고정추가적, 전투AI재개, 이동전HP/idle·Harp225정리·아레나gate강제개방·수동Core틱/목표60fps, 60Hz Core시간 기준 영웅30fps·드루이드20fps 샘플(실측GPU fps 아님). 자연완주·OS손조작 증거 아님";
            public List<Hd2dFile> screenshots=new List<Hd2dFile>();public bool passed;public List<string> failures=new List<string>();public List<Hd2dFrame> frames=new List<Hd2dFrame>();
        }
        IEnumerator Hd2dCapture()
        {
            string output=Argument("-output");
            if(string.IsNullOrEmpty(output)||string.IsNullOrEmpty(Argument("--unity-qa-sandbox"))){Application.Quit(2);yield break;}
            Directory.CreateDirectory(output);if(Directory.GetFileSystemEntries(output).Length!=0){Debug.LogError("HD2D capture requires a new empty output folder: "+output);Application.Quit(2);yield break;}var rc=new Hd2dReceipt();
            Application.targetFrameRate=60;QualitySettings.vSyncCount=0;AudioListener.volume=0;AudioListener.pause=true;smokeActive=true;dropSmoke=true;pauseSmoke=true;Application.runInBackground=true;
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
                    if(i%2==0){Hd2dRecord(rc,width+"-motion-"+i);Hd2dQueue(rc,Path.Combine(motion,(i/2).ToString("D4")+".png"));}
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
                    if(boss!=null){p.X=boss.X;p.Y=boss.Y+220;UpdateViews();for(int i=0;i<8;i++)yield return null;yield return Hd2dShot(output,width+"-druid",rc);yield return Hd2dDruidMotion(output,width,boss,rc);}
                    else rc.failures.Add("arena druid missing "+width);
                }
                else rc.failures.Add("field gate missing "+width);
                sim.Stage.LeaveArenaToField();UpdateViews();yield return null;
            }
            yield return Hd2dWaitScreenshots(rc);
            if(rc.screenshots.Count!=336)rc.failures.Add("capture count expected336 got"+rc.screenshots.Count);
            rc.passed=rc.failures.Count==0;File.WriteAllText(Path.Combine(output,"hd2d-player.json"),JsonUtility.ToJson(rc,true));
            lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();yield return new WaitForSecondsRealtime(.8f);Application.Quit(rc.passed?0:2);
        }
        IEnumerator Hd2dDruidMotion(string output,int width,EnemyState boss,Hd2dReceipt rc)
        {
            string directory=Path.Combine(output,width+"-druid-motion");Directory.CreateDirectory(directory);int completed=0;Simulation.Config.EnemyAiEnabled=true;
            for(int i=0;i<360;i++)
            {
                if(Simulation.Player.Hp<=0){rc.failures.Add("druid motion ended by player death at "+i+": "+width);yield break;}
                StepInput(i<180?.6f:-.6f,0,boss.X,boss.Y,false,false);completed++;yield return null;yield return new WaitForEndOfFrame();
                if(i%3==0){Hd2dRecord(rc,width+"-druid-motion-"+i);Hd2dQueue(rc,Path.Combine(directory,(i/3).ToString("D4")+".png"));}
            }
            if(completed!=360||Simulation.Player.Hp<=0)rc.failures.Add("druid motion incomplete or final-tick death: "+width+" ticks="+completed);
        }
        IEnumerator Hd2dShot(string output,string key,Hd2dReceipt rc)
        {
            UpdateViews();yield return null;yield return new WaitForEndOfFrame();Hd2dRecord(rc,key);
            string path=Path.Combine(output,key+".png");var file=Hd2dQueue(rc,path);float until=Time.realtimeSinceStartup+5;
            while(!Hd2dFileReady(file)&&Time.realtimeSinceStartup<until)yield return null;
            if(!Hd2dFileReady(file))rc.failures.Add("screenshot missing "+key);
        }
        static Hd2dFile Hd2dQueue(Hd2dReceipt rc,string path)
        {
            var file=new Hd2dFile{path=path,width=Screen.width,height=Screen.height};rc.screenshots.Add(file);ScreenCapture.CaptureScreenshot(path);return file;
        }
        static bool Hd2dFileReady(Hd2dFile file)
        {
            try
            {
                using(var stream=new FileStream(file.path,FileMode.Open,FileAccess.Read,FileShare.ReadWrite))
                {
                    if(stream.Length<36)return false;var header=new byte[24];if(stream.Read(header,0,24)!=24)return false;
                    if(header[0]!=137||header[1]!=80||header[2]!=78||header[3]!=71)return false;
                    int width=(header[16]<<24)|(header[17]<<16)|(header[18]<<8)|header[19],height=(header[20]<<24)|(header[21]<<16)|(header[22]<<8)|header[23];if(width!=file.width||height!=file.height)return false;
                    stream.Seek(-12,SeekOrigin.End);var end=new byte[12];if(stream.Read(end,0,12)!=12)return false;
                    return end[4]==73&&end[5]==69&&end[6]==78&&end[7]==68&&end[8]==174&&end[9]==66&&end[10]==96&&end[11]==130;
                }
            }
            catch(IOException){return false;}
        }
        static IEnumerator Hd2dWaitScreenshots(Hd2dReceipt rc)
        {
            float until=Time.realtimeSinceStartup+15;
            while(Time.realtimeSinceStartup<until){bool all=true;foreach(var file in rc.screenshots)if(!Hd2dFileReady(file)){all=false;break;}if(all)yield break;yield return null;}
            foreach(var file in rc.screenshots)if(!Hd2dFileReady(file))rc.failures.Add("PNG missing/incomplete/resolution mismatch: "+file.path);
        }
        void Hd2dRecord(Hd2dReceipt rc,string key)
        {
            var camera=HudCamera;var p=Simulation.Player;float below=NativeHd2D.FootLift(playerView.sprite)*Mathf.Abs(playerView.transform.lossyScale.y);
            var foot=playerView.transform.position-camera.transform.up*below;var a=camera.WorldToScreenPoint(foot);var b=camera.WorldToScreenPoint(Point(p.X,p.Y));
            float gap=Vector2.Distance(a,b),pixel=Vector2.Distance(new Vector2(a.x,a.y),new Vector2(Mathf.Round(a.x),Mathf.Round(a.y)));
            var frame=new Hd2dFrame{key=key,tick=Simulation.TickCount,width=Screen.width,height=Screen.height,state=p.State,sprite=playerView.enabled,model=heroView!=null&&heroView.Ready,roll=Simulation.RollActive,footError=gap,pixelError=pixel,hp=p.Hp,camera=camera.transform.position,centre=playerView.transform.position};
            frame.playerMaterial=playerView.sharedMaterial!=null?playerView.sharedMaterial.shader.name:"missing";
            var contactObject=GameObject.Find("HD2D contact: "+playerView.name);var contactRenderer=contactObject!=null?contactObject.GetComponent<MeshRenderer>():null;frame.contact=contactRenderer!=null&&contactRenderer.enabled;
            var boss=Simulation.Stage.FindBoss();if(boss!=null&&Simulation.Druid!=null&&Simulation.Druid.Data.TryGetValue(boss,out var data)){frame.bossState=data.S;var body=GameObject.Find("Druid body");if(body!=null){var sr=body.GetComponent<SpriteRenderer>();frame.bossSprite=sr.enabled;if(sr.sprite!=null){frame.bossTexture=sr.sprite.texture.name;var r=sr.sprite.rect;frame.bossRect=new Vector4(r.x,r.y,r.width,r.height);}frame.bossMaterial=sr.sharedMaterial!=null?sr.sharedMaterial.shader.name:"missing";}}
            rc.frames.Add(frame);
            if(frame.playerMaterial!="EXODUSER/HD2D/SpriteLit")rc.failures.Add("final player shader overwritten: "+key+" "+frame.playerMaterial);
            if(!frame.contact)rc.failures.Add("player contact missing: "+key);
            if(!playerView.enabled||heroView!=null&&heroView.Ready)rc.failures.Add("pixel actor not active: "+key);
            if(gap>.75f)rc.failures.Add("foot/Core anchor gap "+gap+"px: "+key);
            if(pixel>.02f)rc.failures.Add("final camera pixel grid gap "+pixel+"px: "+key);
        }
    }
}
