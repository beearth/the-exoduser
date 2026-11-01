using System.Collections;
using System.IO;
using UnityEngine;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        [System.Serializable] sealed class A2FieldRenderCost { public string scope="격리 QA 정지구도 렌더 부하. 자연 전투 FPS/기기 성능 보장과 구분";public int width,height,frames;public float elapsedSeconds,framesPerSecond,p95FrameMs; }
        [System.Serializable] sealed class A2BridgeFilter
        {
            public string name;public float[] vertices;public int[] triangles;
            public float minX,maxX,minY,maxY,minZ,maxZ;public int waterCrossingTriangles;
        }
        [System.Serializable] sealed class A2FieldGeometry
        {
            public string scope="동일 실제 Player의 생성 완료 메시. 카메라 RT 시안과 구분";
            public float waterY=-.45f;public int trunkBodyVerticesInOriginalWalk,fieldTrees,groundChunks;
            public System.Collections.Generic.List<A2BridgeFilter> filters=new System.Collections.Generic.List<A2BridgeFilter>();
        }
        void A2FieldCaptureGeometry(string output)
        {
            var result=new A2FieldGeometry();
            foreach(var filter in a2Root.GetComponentsInChildren<MeshFilter>())
            {
                var mesh=filter.sharedMesh;if(!mesh.isReadable)continue;
                var renderer=filter.GetComponent<MeshRenderer>();if(renderer!=null&&renderer.sharedMaterial==a2FieldSoil)result.groundChunks++;
                // FBX 자식 이름 대신 생성 루트 이름으로 소유 범위를 확인한다.
                var ancestor=filter.transform;while(ancestor.parent!=null&&ancestor.parent!=a2Root.transform)ancestor=ancestor.parent;
                bool trunk=ancestor.name=="A2_Hollow_Loft_Tree"||ancestor.name=="A2 전경 바깥 거목";
                var points=mesh.vertices;
                if(trunk)
                {
                    result.fieldTrees++;
                    foreach(var v in points)
                    {
                        var p=filter.transform.TransformPoint(v);float h=p.y-a2Field.Height(p.x,p.z);
                        if(h>.25f&&h<1.6f&&Map.CanMove(p.x*100,-p.z*100,15))result.trunkBodyVerticesInOriginalWalk++;
                    }
                }
                if(ancestor.name!="A2 시작 목교")continue;
                var f=new A2BridgeFilter{name=filter.name,vertices=new float[points.Length*3],triangles=mesh.triangles,minX=float.PositiveInfinity,minY=float.PositiveInfinity,minZ=float.PositiveInfinity,maxX=float.NegativeInfinity,maxY=float.NegativeInfinity,maxZ=float.NegativeInfinity};
                for(int i=0;i<points.Length;i++)
                {
                    var p=filter.transform.TransformPoint(points[i]);f.vertices[i*3]=p.x;f.vertices[i*3+1]=p.y;f.vertices[i*3+2]=p.z;
                    f.minX=Mathf.Min(f.minX,p.x);f.maxX=Mathf.Max(f.maxX,p.x);f.minY=Mathf.Min(f.minY,p.y);f.maxY=Mathf.Max(f.maxY,p.y);f.minZ=Mathf.Min(f.minZ,p.z);f.maxZ=Mathf.Max(f.maxZ,p.z);
                }
                for(int i=0;i<f.triangles.Length;i+=3)
                {
                    float a=f.vertices[f.triangles[i]*3+1],b=f.vertices[f.triangles[i+1]*3+1],c=f.vertices[f.triangles[i+2]*3+1];
                    if(Mathf.Min(a,Mathf.Min(b,c))<result.waterY&&Mathf.Max(a,Mathf.Max(b,c))>result.waterY)f.waterCrossingTriangles++;
                }
                result.filters.Add(f);
            }
            File.WriteAllText(Path.Combine(output,"실제필드-메시검수.json"),JsonUtility.ToJson(result,true));
        }
        IEnumerator A2FieldCapture()
        {
            string output=Argument("-output");
            if(string.IsNullOrEmpty(output)||!NativeQaSandbox.Active){Application.Quit(2);yield break;}
            Directory.CreateDirectory(output);AudioListener.volume=0;AudioListener.pause=true;Application.runInBackground=true;
            smokeActive=true;pauseSmoke=true;keyshotErrors=0;Application.logMessageReceived+=KeyshotLog;
            lobby.Flow.ShowLobby();lobby.Flow.SelectPreview();if(!lobby.Flow.EnterTest()){Application.Quit(2);yield break;}
            EndFirstPractice(true);frontendEntryInputFence=false;menu=false;Running=false;gameFocused=true;
            Simulation.Config.EnemyAiEnabled=false;var receipt=new KeyshotReceipt();
            receipt.scope="일반 --remodel3d 전체 필드/HUD 최종 프레임. 격리 저장·직접 위치 이동·정지 구도, 자연 완주와 구분. 추가 A2 실행 옵션 없음";
            float deadline=Time.realtimeSinceStartup+45;
            while(!Remodel3DReady&&Time.realtimeSinceStartup<deadline){UpdateViews();yield return null;}
            if(!Remodel3DReady){Application.Quit(3);yield break;}
            A2FieldCaptureGeometry(output);
            var locations=new[]{new Vector2(4020,7420),new Vector2(3500,6250),new Vector2(4000,5000),new Vector2(2200,4400),new Vector2(6500,4400),new Vector2(4600,3500),new Vector2(4000,1850),new Vector2(4020,500),new Vector2(4790.811f,7142.689f),new Vector2(3320,7500),new Vector2(3320,7000)};
            var names=new[]{"01-시작","02-초반","03-전투공터","04-서측","05-동측","06-랜드마크","07-후반","08-보스입구","09-거목몸통재현","10-왼전경하단경계","11-왼전경상단경계"};
            foreach(int width in new[]{1920,3840})
            {
                Screen.SetResolution(width,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.5f);
#if UNITY_STANDALONE_WIN
                if(Screen.width!=width||Screen.height!=1080)FieldCaptureResize(width,1080);
#endif
                float sizeDeadline=Time.realtimeSinceStartup+5;
                while((Screen.width!=width||Screen.height!=1080)&&Time.realtimeSinceStartup<sizeDeadline)yield return null;
                if(Screen.width!=width||Screen.height!=1080)
                {
                    File.WriteAllText(Path.Combine(output,"해상도-실패.json"),"{\"expectedWidth\":"+width+",\"expectedHeight\":1080,\"actualWidth\":"+Screen.width+",\"actualHeight\":"+Screen.height+"}");
                    Debug.LogError("[A2 필드촬영] 요청/실제 해상도 불일치");Application.Quit(3);yield break;
                }
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
                    // 스크린샷 ReadPixels 비용을 제외하고 실제 PlayerLoop 프레임만 측정한다.
                    var renderCost=new A2FieldRenderCost{width=Screen.width,height=Screen.height,frames=60};
                    var times=new float[renderCost.frames];var watch=System.Diagnostics.Stopwatch.StartNew();
                    for(int frame=0;frame<times.Length;frame++){yield return null;times[frame]=Time.unscaledDeltaTime*1000;}
                    watch.Stop();System.Array.Sort(times);renderCost.elapsedSeconds=(float)watch.Elapsed.TotalSeconds;
                    renderCost.framesPerSecond=renderCost.frames/Mathf.Max(.0001f,renderCost.elapsedSeconds);renderCost.p95FrameMs=times[Mathf.CeilToInt(times.Length*.95f)-1];
                    File.WriteAllText(Path.Combine(folder,names[i]+"-렌더부하.json"),JsonUtility.ToJson(renderCost,true));
                    yield return KeyshotSave(folder,names[i],receipt);
                }
            }
            receipt.unityErrors=keyshotErrors;
            receipt.passed=keyshotErrors==0&&receipt.frames.Count==22&&receipt.frames.TrueForAll(f=>f.remodel&&f.actualScreen&&f.screenHeight==1080&&(f.screenWidth==1920||f.screenWidth==3840)&&f.luminance>.01f);
            File.WriteAllText(Path.Combine(output,"전체필드-검수.json"),JsonUtility.ToJson(receipt,true));
            Application.logMessageReceived-=KeyshotLog;lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();
            yield return new WaitForSecondsRealtime(.5f);Application.Quit(receipt.passed?0:3);
        }
#if UNITY_STANDALONE_WIN
        delegate bool FieldWindowCallback(System.IntPtr window,System.IntPtr state);
        [System.Runtime.InteropServices.StructLayout(System.Runtime.InteropServices.LayoutKind.Sequential)] struct FieldWindowRect {public int left,top,right,bottom;}
        [System.Runtime.InteropServices.DllImport("user32.dll",EntryPoint="EnumWindows")] static extern bool FieldWindows(FieldWindowCallback callback,System.IntPtr state);
        [System.Runtime.InteropServices.DllImport("user32.dll",EntryPoint="GetWindowThreadProcessId")] static extern uint FieldWindowProcess(System.IntPtr window,out uint process);
        [System.Runtime.InteropServices.DllImport("user32.dll",EntryPoint="GetClassNameW",CharSet=System.Runtime.InteropServices.CharSet.Unicode)] static extern int FieldWindowClass(System.IntPtr window,System.Text.StringBuilder name,int size);
        [System.Runtime.InteropServices.DllImport("user32.dll",EntryPoint="GetClientRect")] static extern bool FieldWindowClient(System.IntPtr window,out FieldWindowRect rect);
        [System.Runtime.InteropServices.DllImport("user32.dll",EntryPoint="GetWindowRect")] static extern bool FieldWindowFrame(System.IntPtr window,out FieldWindowRect rect);
        [System.Runtime.InteropServices.DllImport("user32.dll",EntryPoint="SetWindowPos",SetLastError=true)] static extern bool FieldWindowResize(System.IntPtr window,System.IntPtr after,int x,int y,int width,int height,uint flags);
        static void FieldCaptureResize(int width,int height)
        {
            // 격리 QA Player 자신의 창만 보정한다. 디스플레이/사용자 창/일반 설정은 변경하지 않는다.
            if(!NativeQaSandbox.Active||Application.isBatchMode)return;
            uint pid=(uint)System.Diagnostics.Process.GetCurrentProcess().Id;var own=System.IntPtr.Zero;
            FieldWindows((window,state)=>{uint owner;FieldWindowProcess(window,out owner);if(owner!=pid)return true;var name=new System.Text.StringBuilder(128);FieldWindowClass(window,name,128);if(name.ToString()!="UnityWndClass")return true;own=window;return false;},System.IntPtr.Zero);
            uint verified;FieldWindowRect client,frame;
            if(own==System.IntPtr.Zero||FieldWindowProcess(own,out verified)==0||verified!=pid||!FieldWindowClient(own,out client)||!FieldWindowFrame(own,out frame))
            {Debug.LogError("[A2 필드촬영] 자기 창 소유권/크기 조회 실패");return;}
            int outerWidth=width+(frame.right-frame.left)-(client.right-client.left),outerHeight=height+(frame.bottom-frame.top)-(client.bottom-client.top);
            bool resized=FieldWindowResize(own,System.IntPtr.Zero,0,0,outerWidth,outerHeight,0x16);
            Debug.Log("[A2 필드촬영] 자기창 PID="+pid+" 크기 "+(client.right-client.left)+"x"+(client.bottom-client.top)+" → "+width+"x"+height+" 성공="+resized+" NOMOVE/NOZORDER/NOACTIVATE");
        }
#endif

    }
}
