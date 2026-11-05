using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Text;
using UnityEngine;
namespace Exoduser.UnityPort
{
    // 출처: docs/0마스터플랜/worklog/cloud-lanes/BRIEF_CLEAN_MAP_20261105.md §1 M0·M1.
    // 빼기 목록 출처: claude/unity-mac-clean-map-20261105 @a2d519fc9 docs/0마스터플랜/CLEAN_MAP/M0_REMOVE_LIST_20261105.md §1·§2.
    // --a2-clean: M0 빼기 + M1 지면. --a2-clean --a2-clean-m0: M0 빼기만(M1 전 지면 그대로). 플래그가 없으면 이 파일의 어떤 경로도 실행되지 않는다.
    public static class A2CleanMode
    {
        public static readonly bool Enabled=Array.IndexOf(Environment.GetCommandLineArgs(),"--a2-clean")>=0;
        public static readonly bool M1Ground=Enabled&&Array.IndexOf(Environment.GetCommandLineArgs(),"--a2-clean-m0")<0;
    }
    public sealed partial class NativeGame
    {
        // a2Root 바로 아래에서 남기는 묶음. 나머지 렌더러는 좌표를 유지한 채 전부 끈다.
        static readonly HashSet<string> A2CleanKept=new HashSet<string>{"A2 전체 필드 지면","A2 원본 보행 밖 독액 개울","A2 시작 목교","A2 지면 높이 안개","A2 필드 국소 빛기둥"};
        readonly SortedDictionary<string,int> a2CleanDisabled=new SortedDictionary<string,int>(StringComparer.Ordinal);
        int a2CleanDisabledTotal;
        void A2CleanStrip()
        {
            foreach(Transform child in a2Root.transform)
            {
                if(A2CleanKept.Contains(child.name))continue;
                foreach(var r in child.GetComponentsInChildren<Renderer>(true))
                {
                    if(!r.enabled)continue;
                    r.enabled=false;a2CleanDisabledTotal++;
                    a2CleanDisabled.TryGetValue(r.name,out var count);a2CleanDisabled[r.name]=count+1;
                }
                // 횃불은 받침·불꽃·광원을 통째로 끈다. 필드 경로에서 이 묶음의 광원은 횃불 불꽃뿐이다(A2Forest.cs A2Torch).
                foreach(var l in child.GetComponentsInChildren<Light>(true))
                {
                    if(!l.enabled)continue;
                    l.enabled=false;string key="(Light) "+l.name;
                    a2CleanDisabled.TryGetValue(key,out var lights);a2CleanDisabled[key]=lights+1;
                }
            }
            Debug.Log("[A2 Clean] 렌더러 "+a2CleanDisabledTotal+"개 끔/M1지면="+A2CleanMode.M1Ground);
            if(A2CleanMode.M1Ground)A2CleanGround();
        }
        // 출처: BRIEF_CLEAN_MAP §1 M1. 자산: forest_ground_04=A2_ForestSoil(docs/engine/UNITY_KEYSHOT_A2_20261030.md 2026-10-31 05:40).
        // 단순 타일 2.0u만 쓴다. 수치는 HellGroundPBR의 _A2_CLEAN_GROUND 분기. 1u=1m 가정, 문서 근거 없음.
        void A2CleanGround(){a2FieldSoil.EnableKeyword("_A2_CLEAN_GROUND");}
        [Serializable] sealed class A2CleanShotsReceipt
        {
            public string mode,pitchNote;public bool cleanEnabled,m1Ground;public float pitchDeg,distU,bridgeY;public Vector2 swampSite;
            public int disabledRenderers,enabledMeshRenderersUnderRoot,unityErrors;public bool passed;public List<KeyshotFrame> frames=new List<KeyshotFrame>();
        }
        // 물가에서 2~3.5u 떨어진 통행 지점 중 다리에서 10u 이상이고 가장 가까운 곳. 같은 맵이면 항상 같은 좌표다.
        bool A2CleanSwampSite(out Vector2 site)
        {
            site=Vector2.zero;float best=float.MaxValue;var bridge=new Vector2(4320,7180);
            for(float py=20;py<8000;py+=40)for(float px=20;px<8000;px+=40)
            {
                float toBridge=Vector2.Distance(new Vector2(px,py),bridge);if(toBridge<1000||toBridge>=best||!Map.CanMove(px,py,15))continue;
                float wx=px/100,wz=-py/100;bool far=false,near=false;
                for(int j=0;j<16;j++)
                {
                    float a=j*Mathf.PI/8,cx=Mathf.Cos(a),cz=Mathf.Sin(a);
                    if(a2Field.Water(wx+cx*3.5f,wz+cz*3.5f))far=true;
                    if(a2Field.Water(wx+cx*2,wz+cz*2))near=true;
                }
                if(far&&!near){best=toBridge;site=new Vector2(px,py);}
            }
            return best<float.MaxValue;
        }
        // `--unity-a2-clean-shots -output <dir> --remodel3d [--a2-clean [--a2-clean-m0]] [--a2-clean-swamp x:y]`: 옵션 없음/M0/M1을 같은 좌표에서 찍는다. 격리 세이브 전용.
        IEnumerator A2CleanShots()
        {
            string output=Argument("-output");
            if(string.IsNullOrEmpty(output)||!NativeQaSandbox.Active){Application.Quit(2);yield break;}
            Directory.CreateDirectory(output);AudioListener.volume=0;AudioListener.pause=true;Application.runInBackground=true;
            smokeActive=true;pauseSmoke=true;keyshotErrors=0;Application.logMessageReceived+=KeyshotLog;
            lobby.Flow.ShowLobby();lobby.Flow.SelectPreview();if(!lobby.Flow.EnterTest()){Application.Quit(2);yield break;}
            EndFirstPractice(true);frontendEntryInputFence=false;menu=false;Running=false;gameFocused=true;
            Simulation.Config.EnemyAiEnabled=false;
            float deadline=Time.realtimeSinceStartup+240;
            while(!Remodel3DReady&&Time.realtimeSinceStartup<deadline){UpdateViews();yield return null;}
            if(!Remodel3DReady){Application.Quit(3);yield break;}
            Vector2 swamp;var forced=Argument("--a2-clean-swamp");
            if(!string.IsNullOrEmpty(forced)){var xy=forced.Split(':');swamp=new Vector2(float.Parse(xy[0]),float.Parse(xy[1]));}
            else if(!A2CleanSwampSite(out swamp)){Debug.LogError("[A2 Clean] 물가 지점 없음");Application.Quit(3);yield break;}
            var receipt=new KeyshotReceipt();
            var result=new A2CleanShotsReceipt{mode=A2CleanMode.M1Ground?"m1":A2CleanMode.Enabled?"m0":"base",cleanEnabled=A2CleanMode.Enabled,m1Ground=A2CleanMode.M1Ground,pitchDeg=NativeRemodel3D.Pitch*Mathf.Rad2Deg,distU=NativeRemodel3D.DistU,swampSite=swamp,disabledRenderers=a2CleanDisabledTotal,pitchNote="NativeRemodel3D.Pitch 그대로"};
            var bridgeObject=GameObject.Find("A2 시작 목교");if(bridgeObject!=null)result.bridgeY=bridgeObject.transform.position.y;
            var points=new[]{new Vector2(4200,7460),new Vector2(4320,7180),swamp};var names=new[]{"start","bridge","swamp"};
            foreach(int width in new[]{1920,3840})
            {
                Screen.SetResolution(width,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.5f);
#if UNITY_STANDALONE_WIN
                if(Screen.width!=width||Screen.height!=1080)FieldCaptureResize(width,1080);
#endif
                float sizeDeadline=Time.realtimeSinceStartup+5;
                while((Screen.width!=width||Screen.height!=1080)&&Time.realtimeSinceStartup<sizeDeadline)yield return null;
                if(Screen.width!=width||Screen.height!=1080){Debug.LogError("[A2 Clean] 요청/실제 해상도 불일치 "+Screen.width+"x"+Screen.height);Application.Quit(3);yield break;}
                string folder=Path.Combine(output,width+"x1080");Directory.CreateDirectory(folder);
                for(int i=0;i<points.Length;i++)
                {
                    Simulation.Player.X=points[i].x;Simulation.Player.Y=points[i].y;lastX=points[i].x;lastY=points[i].y;
                    for(int frame=0;frame<72;frame++){UpdateViews();yield return null;}
                    yield return KeyshotSave(folder,names[i],receipt);
                }
            }
            var kept=new SortedDictionary<string,int>(StringComparer.Ordinal);
            foreach(var r in a2Root.GetComponentsInChildren<MeshRenderer>(true))if(r.enabled&&r.gameObject.activeInHierarchy)
            {result.enabledMeshRenderersUnderRoot++;string key=r.name.StartsWith("A2 지면 ",StringComparison.Ordinal)?"A2 지면 *":r.name;kept.TryGetValue(key,out var c);kept[key]=c+1;}
            var csv=new StringBuilder("state,renderer,count\n");
            foreach(var pair in a2CleanDisabled)csv.Append("disabled,").Append(pair.Key).Append(',').Append(pair.Value).Append('\n');
            foreach(var pair in kept)csv.Append("enabled,").Append(pair.Key).Append(',').Append(pair.Value).Append('\n');
            File.WriteAllText(Path.Combine(output,"renderers.csv"),csv.ToString(),new UTF8Encoding(true));
            result.frames=receipt.frames;result.unityErrors=keyshotErrors;
            result.passed=keyshotErrors==0&&receipt.frames.Count==6&&receipt.frames.TrueForAll(f=>f.remodel&&f.actualScreen&&f.screenHeight==1080);
            File.WriteAllText(Path.Combine(output,"receipt.json"),JsonUtility.ToJson(result,true));
            Application.logMessageReceived-=KeyshotLog;lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();
            yield return new WaitForSecondsRealtime(.5f);Application.Quit(result.passed?0:3);
        }
    }
}
