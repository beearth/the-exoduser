using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.Video;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // Explicitly sandboxed, Player-only proof of the ordinary enemy's visual direction.
    public sealed partial class NativeGame
    {
        [Serializable] sealed class FacingOnlyFrame
        {
            public string name,capture,bodyTexture,walkTexture,state;
            public int direction,expectedDirection,walkFrame,skin,width,height,bodyOrder,walkOrder;
            public bool moving,bodyEnabled,walkEnabled,bodyCellValid,walkCellValid,samePosition,sameScale;
            public float enemyX,enemyY,playerX,playerY;
            public double coreFacing,webFacing;
        }
        [Serializable] sealed class FacingOnlyReceipt
        {
            public string scope="QA-injected ordinary enemy in real 1920x1080 Player; visual facing only",sandbox,device,deviceType;
            public bool passed,listenerPaused;public float listenerPeak;public int width,height,directVideoPlayers;
            public List<string> failures=new List<string>();public List<FacingOnlyFrame> frames=new List<FacingOnlyFrame>();
        }
        IEnumerator FacingOnlyQa()
        {
            string output=Argument("-output"),requestedSandbox=Argument(NativeQaSandbox.Argument);
            if(Application.isBatchMode||string.IsNullOrEmpty(output)||!Path.IsPathRooted(output)||
                string.IsNullOrEmpty(requestedSandbox)||!Path.IsPathRooted(requestedSandbox)||!NativeQaSandbox.Active)
            {Debug.LogError("FACING_ONLY_QA requires a GUI Player, absolute output and explicit sandbox");Application.Quit(2);yield break;}
            Directory.CreateDirectory(output);AudioListener.volume=0;AudioListener.pause=true;
            Application.runInBackground=true;smokeActive=true;pauseSmoke=true;
            var result=new FacingOnlyReceipt{sandbox=NativeQaSandbox.Root,device=SystemInfo.graphicsDeviceName,deviceType=SystemInfo.graphicsDeviceType.ToString()};
            Screen.SetResolution(1920,1080,FullScreenMode.Windowed);
            lobby.Flow.ShowLobby();lobby.Flow.SelectPreview();
            if(!lobby.Flow.EnterTest()){result.failures.Add("lobby test entry failed");Application.Quit(2);yield break;}
            if(firstPractice!=null)EndFirstPractice(true);frontendEntryInputFence=false;menu=false;SetGameFocus(true);Running=false;
            float deadline=Time.realtimeSinceStartup+45;
            while(!Remodel3DReady&&Time.realtimeSinceStartup<deadline){UpdateViews();yield return null;}
            if(!Remodel3DReady)result.failures.Add("3D scene not ready");
            while((Screen.width!=1920||Screen.height!=1080)&&Time.realtimeSinceStartup<deadline)yield return null;
            result.width=Screen.width;result.height=Screen.height;
            if(result.width!=1920||result.height!=1080)result.failures.Add("actual 1920x1080 window unavailable");
            var sim=Simulation;var p=sim.Player;sim.Config.EnemyAiEnabled=false;sim.Enemies.Clear();sim.FireZones.Clear();sim.SpawnHoles=null;
            p.Hp=p.MaxHp;p.Iframes=100000;p.X=4000;p.Y=5000;lastX=p.X;lastY=p.Y;UpdateViews();
            var enemy=sim.SpawnEnemy(p.X+200,p.Y,0,null,false);
            if(enemy==null)result.failures.Add("ordinary enemy spawn failed");
            else
            {
                UpdateViews();
                string[] names={"01-idle-west","02-micro-west","03-vertical-north","04-noisy-west","05-reversal-east","06-attack-east","07-idle-east"};
                float[] xs={p.X+200,p.X+200.02f,p.X,p.X+200.02f,p.X-200,p.X-200,p.X-200};
                float[] ys={p.Y,p.Y,p.Y+200,p.Y+.02f,p.Y,p.Y,p.Y};
                int[] expected={4,4,6,4,0,0,0};
                for(int i=0;i<names.Length;i++)
                {
                    enemy.X=xs[i];enemy.Y=ys[i];enemy.State=i==5?"attack":"idle";enemy.Facing=i%2==0?0:(float)Math.PI;
                    if(enemy.Web!=null){enemy.Web.x=enemy.X;enemy.Web.y=enemy.Y;enemy.Web.s=enemy.State;enemy.Web.facing=i%2==0?Math.PI/2:Math.PI;}
                    UpdateViews();var ev=enemies[enemy.Id];
                    bool moving=i==1||i==2||i==3||i==4||i==5;
                    ev.lastX=enemy.X-(moving?.02f:0);ev.lastY=enemy.Y;ev.distance=moving?128f*(i%4):0;renderedTick=-1;
                    UpdateViews();yield return null;yield return new WaitForEndOfFrame();
                    var body=ev.body.sprite;var walk=ev.walk.sprite;int dir=NativeEnemyVisualFacing.Direction(enemy,p);
                    string path=Path.Combine(output,names[i]+"-actual-window-1920x1080.png");
                    var screen=ScreenCapture.CaptureScreenshotAsTexture();
                    try{File.WriteAllBytes(path,screen.EncodeToPNG());}finally{Destroy(screen);}
                    string suffix=enemyDirections[dir];var bodyAtlas=Resources.Load<Texture2D>("Art/enemy/atlas_ch1_8dir_"+suffix);
                    var walkAtlas=Resources.Load<Texture2D>("Art/enemy/atlas_ch1_8dir_walk_"+suffix);
                    var row=new FacingOnlyFrame{name=names[i],capture=Path.GetFileName(path),state=enemy.State,
                        width=Screen.width,height=Screen.height,direction=dir,expectedDirection=expected[i],walkFrame=(int)(ev.distance/128)%4,skin=ev.skin,
                        moving=ev.moving,bodyEnabled=ev.body.enabled,walkEnabled=ev.walk.enabled,bodyOrder=ev.body.sortingOrder,walkOrder=ev.walk.sortingOrder,
                        bodyTexture=body!=null&&body.texture!=null?body.texture.name:"",walkTexture=walk!=null&&walk.texture!=null?walk.texture.name:"",
                        bodyCellValid=body!=null&&body.texture==bodyAtlas&&body.rect.width==256&&body.rect.height==256,
                        walkCellValid=walk!=null&&walk.texture==walkAtlas&&walk.rect.width==256&&walk.rect.height==256,
                        samePosition=Vector3.Distance(ev.body.transform.position,ev.walk.transform.position)<.00001f,
                        sameScale=Vector3.Distance(ev.body.transform.localScale,ev.walk.transform.localScale)<.00001f,
                        enemyX=enemy.X,enemyY=enemy.Y,playerX=p.X,playerY=p.Y,coreFacing=enemy.Facing,webFacing=enemy.Web!=null?enemy.Web.facing:double.NaN};
                    result.frames.Add(row);
                    if(dir!=expected[i]||ev.moving!=moving||!row.bodyEnabled||row.walkEnabled!=moving||!row.bodyCellValid||!row.walkCellValid||
                        !row.samePosition||!row.sameScale||row.walkOrder!=row.bodyOrder+1)result.failures.Add(names[i]+" facing/atlas/renderer contract");
                }
                sim.Enemies.Clear();UpdateViews();yield return null;
            }
            var sample=new float[1024];AudioListener.GetOutputData(sample,0);foreach(float v in sample)result.listenerPeak=Mathf.Max(result.listenerPeak,Mathf.Abs(v));
            result.listenerPaused=AudioListener.pause;result.directVideoPlayers=FindObjectsByType<VideoPlayer>().Length;
            if(!result.listenerPaused||result.listenerPeak!=0||result.directVideoPlayers!=0)result.failures.Add("audio/video not drained");
            result.passed=result.failures.Count==0&&result.frames.Count==7;
            File.WriteAllText(Path.Combine(output,"facing-only-qa.json"),JsonUtility.ToJson(result,true));
            lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();yield return new WaitForSecondsRealtime(.5f);
            Debug.Log("QA_MEDIA_DRAIN_COMPLETE FACING_ONLY");Application.Quit(result.passed?0:3);
        }
    }
}
