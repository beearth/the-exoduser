using System.Collections;
using System.IO;
using UnityEngine;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        IEnumerator A2FieldCapture()
        {
            string output=Argument("-output");
            if(string.IsNullOrEmpty(output)||string.IsNullOrEmpty(Argument("--unity-qa-sandbox"))){Application.Quit(2);yield break;}
            Directory.CreateDirectory(output);AudioListener.volume=0;AudioListener.pause=true;Application.runInBackground=true;
            smokeActive=true;pauseSmoke=true;keyshotErrors=0;Application.logMessageReceived+=KeyshotLog;
            lobby.Flow.ShowLobby();lobby.Flow.SelectPreview();if(!lobby.Flow.EnterTest()){Application.Quit(2);yield break;}
            EndFirstPractice(true);frontendEntryInputFence=false;menu=false;Running=false;gameFocused=true;
            Simulation.Config.EnemyAiEnabled=false;var receipt=new KeyshotReceipt();
            receipt.scope="일반 --remodel3d 전체 필드/HUD 최종 프레임. 격리 저장·직접 위치 이동·정지 구도, 자연 완주와 구분. 추가 A2 실행 옵션 없음";
            float deadline=Time.realtimeSinceStartup+45;
            while(!Remodel3DReady&&Time.realtimeSinceStartup<deadline){UpdateViews();yield return null;}
            if(!Remodel3DReady){Application.Quit(3);yield break;}
            var locations=new[]{new Vector2(4020,7420),new Vector2(3500,6250),new Vector2(4000,5000),new Vector2(2200,4400),new Vector2(6500,4400),new Vector2(4600,3500),new Vector2(4000,1850),new Vector2(4020,500)};
            var names=new[]{"01-시작","02-초반","03-전투공터","04-서측","05-동측","06-랜드마크","07-후반","08-보스입구"};
            foreach(int width in new[]{1920,3840})
            {
                Screen.SetResolution(width,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.5f);
                string folder=Path.Combine(output,width+"x1080");Directory.CreateDirectory(folder);
                for(int i=0;i<locations.Length;i++)
                {
                    var p=locations[i];
                    if(!Map.CanMove(p.x,p.y,15))
                    {
                        bool found=false;
                        for(int radius=1;radius<=12&&!found;radius++)for(int j=0;j<16;j++)
                        {float angle=j*Mathf.PI/8;var q=p+new Vector2(Mathf.Cos(angle),Mathf.Sin(angle))*radius*40;if(Map.CanMove(q.x,q.y,15)){p=q;found=true;break;}}
                    }
                    Simulation.Player.X=p.x;Simulation.Player.Y=p.y;lastX=p.x;lastY=p.y;
                    for(int frame=0;frame<12;frame++){UpdateViews();yield return null;}
                    yield return KeyshotSave(folder,names[i],receipt);
                }
            }
            receipt.unityErrors=keyshotErrors;
            receipt.passed=keyshotErrors==0&&receipt.frames.Count==16&&receipt.frames.TrueForAll(f=>f.remodel&&f.actualScreen&&f.screenHeight==1080&&(f.screenWidth==1920||f.screenWidth==3840)&&f.luminance>.01f);
            File.WriteAllText(Path.Combine(output,"전체필드-검수.json"),JsonUtility.ToJson(receipt,true));
            Application.logMessageReceived-=KeyshotLog;lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();
            yield return new WaitForSecondsRealtime(.5f);Application.Quit(receipt.passed?0:3);
        }
    }
}
