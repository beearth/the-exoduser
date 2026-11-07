using System;
using System.Collections;
using System.IO;
using UnityEngine;
namespace Exoduser.UnityPort
{
    // `--unity-a2-sight-check -output <dir> --remodel3d`: 영웅을 큰 나무 뒤에 두고 가림 구멍을 실제 Player에서 촬영한다. 격리 세이브 전용.
    public sealed partial class NativeGame
    {
        A2SightFade a2SightFade;
        internal static T TrackRuntimeObject<T>(T made) where T:UnityEngine.Object{return R3Track(made);}

        void A2SightSetup()
        {
            if(a2Root==null||r3Cam==null)return;
            a2SightFade=a2Root.AddComponent<A2SightFade>();
            a2SightFade.Initialize(r3Cam,()=>NativeRemodel3D.Point(Simulation.Player.X,Simulation.Player.Y),r3Roots);
        }

        string A2SightPlayerState(){var s=playerView;return s==null?"playerView 없음":"enabled="+s.enabled+" active="+s.gameObject.activeInHierarchy+" sprite="+(s.sprite!=null)+" visible="+s.isVisible+" pos="+s.transform.position+" alpha="+s.color.a+" heroView="+(heroView!=null&&heroView.Ready)+" rig="+(rigPixelHero!=null&&rigPixelHero.Ready)+" cam="+(r3Cam!=null?r3Cam.transform.position.ToString():"none");}
        IEnumerator A2SightCheck()
        {
            string output=Argument("-output");
            if(string.IsNullOrEmpty(output)||!NativeQaSandbox.Active){Application.Quit(2);yield break;}
            Directory.CreateDirectory(output);AudioListener.volume=0;AudioListener.pause=true;Application.runInBackground=true;
            smokeActive=true;pauseSmoke=true;
            lobby.Flow.ShowLobby();lobby.Flow.SelectPreview();if(!lobby.Flow.EnterTest()){Application.Quit(2);yield break;}
            EndFirstPractice(true);frontendEntryInputFence=false;menu=false;Running=false;gameFocused=true;
            Simulation.Config.EnemyAiEnabled=false;
            float deadline=Time.realtimeSinceStartup+60;
            while(!Remodel3DReady&&Time.realtimeSinceStartup<deadline){UpdateViews();yield return null;}
            if(!Remodel3DReady||a2SightFade==null){Application.Quit(3);yield break;}
            {var ctrl=Simulation.Player;ctrl.X=4020*A2Scale.K;ctrl.Y=7420*A2Scale.K;lastX=4020*A2Scale.K;lastY=7420*A2Scale.K;float t0=Time.realtimeSinceStartup+.6f;while(Time.realtimeSinceStartup<t0){UpdateViews();yield return null;}yield return new WaitForEndOfFrame();var c0=ScreenCapture.CaptureScreenshotAsTexture();File.WriteAllBytes(Path.Combine(output,"control-start.png"),c0.EncodeToPNG());Destroy(c0);Debug.Log("[A2 가림 검사] 대조 "+A2SightPlayerState());}
            int shot=0;var report=new System.Text.StringBuilder("{\"candidates\":"+a2SightFade.Candidates+",\"shots\":[");
            foreach(var c in Map.Data.colliders)
            {
                if(Mathf.Min(c.rx,c.ry)<120)continue;
                float standY=float.NaN;foreach(var back in new[]{170f,210f,260f,310f,130f})if(Map.CanMove(c.x,c.y-back,15)){standY=c.y-back;break;}
                if(float.IsNaN(standY))continue;
                var p=Simulation.Player;p.X=c.x;p.Y=standY;lastX=c.x;lastY=standY;
                float until=Time.realtimeSinceStartup+.6f;
                while(Time.realtimeSinceStartup<until){UpdateViews();yield return null;}
                yield return new WaitForEndOfFrame();
                var tex=ScreenCapture.CaptureScreenshotAsTexture();
                File.WriteAllBytes(Path.Combine(output,"sight-"+shot.ToString("00")+".png"),tex.EncodeToPNG());Destroy(tex);
                report.Append((shot>0?",":"")+"{\"x\":"+c.x+",\"y\":"+standY+",\"faded\":"+a2SightFade.FadedCount+"}");
                Debug.Log("[A2 가림 검사] "+shot+" "+A2SightPlayerState());if(++shot>=4)break;
            }
            report.Append("]}");File.WriteAllText(Path.Combine(output,"sight-check.json"),report.ToString());
            Application.Quit(shot>0?0:4);
        }
    }
}
