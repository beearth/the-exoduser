using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.Rendering.Universal;

namespace Exoduser.UnityPort
{
    // Explicit QA only: old 6ad shader against current product shader, with all projectors disabled.
    public sealed partial class NativeGame
    {
        [Serializable] sealed class NoEffectSite
        {
            public string id, shader, baselineShader, baselineImage, currentImage, repeatImage, windowImage;
            public int width, height, rawRgbaChanged, rawRgbaMax, repeatChanged, repeatMax;
            public bool passed;
        }
        [Serializable] sealed class NoEffectReceipt
        {
            public string scope, error, graphicsApi, graphicsDevice;
            public bool passed, listenerPaused;
            public int width, height, projectorsFound, projectorsEnabled, groundChunks, rootRenderers, directVideoPlayers;
            public float listenerVolume, outputPeak;
            public List<NoEffectSite> sites=new List<NoEffectSite>();
        }
        static string NoEffectBaselineName(string productName)
        {
            return "EXODUSER/QA/NoDecalBaseline/"+productName.Substring(productName.LastIndexOf('/')+1);
        }
        static Material NoEffectClone(Material product)
        {
            var shader=Shader.Find(NoEffectBaselineName(product.shader.name));
            if(shader==null||shader.name=="Hidden/InternalErrorShader")throw new InvalidOperationException("Missing baseline "+product.shader.name);
            var copy=new Material(shader);copy.CopyPropertiesFromMaterial(product);
            if(copy.shader!=shader)throw new InvalidOperationException("Copy changed baseline shader");
            if(product.HasProperty("_BaseColor")&&copy.GetColor("_BaseColor")!=product.GetColor("_BaseColor"))
                throw new InvalidOperationException("BaseColor mismatch after clone");
            return copy;
        }
        static Texture2D NoEffectRender(Camera camera,RenderTexture target,string path)
        {
            camera.targetTexture=target;camera.Render();
            var old=RenderTexture.active;RenderTexture.active=target;
            var image=new Texture2D(target.width,target.height,TextureFormat.RGBA32,false);
            image.ReadPixels(new Rect(0,0,target.width,target.height),0,0);image.Apply();RenderTexture.active=old;
            File.WriteAllBytes(path,image.EncodeToPNG());return image;
        }
        static void NoEffectDiff(Texture2D baseline,Texture2D current,Texture2D repeat,NoEffectSite site)
        {
            var a=baseline.GetPixels32();var b=current.GetPixels32();var c=repeat.GetPixels32();
            for(int i=0;i<a.Length;i++)
            {
                int d=Mathf.Max(Mathf.Abs(a[i].r-b[i].r),Mathf.Abs(a[i].g-b[i].g),Mathf.Abs(a[i].b-b[i].b),Mathf.Abs(a[i].a-b[i].a));
                int n=Mathf.Max(Mathf.Abs(b[i].r-c[i].r),Mathf.Abs(b[i].g-c[i].g),Mathf.Abs(b[i].b-c[i].b),Mathf.Abs(b[i].a-c[i].a));
                if(d>0)site.rawRgbaChanged++;if(n>0)site.repeatChanged++;
                site.rawRgbaMax=Mathf.Max(site.rawRgbaMax,d);site.repeatMax=Mathf.Max(site.repeatMax,n);
            }
            // No threshold and no self+4 filtering. A nonzero result is reported as such.
            site.passed=site.rawRgbaChanged==0&&site.repeatChanged==0;
        }
        static void NoEffectDisableProjectors(NoEffectReceipt receipt)
        {
            foreach(var projector in Resources.FindObjectsOfTypeAll<DecalProjector>())
            {
                receipt.projectorsFound++;
                if(projector.enabled){receipt.projectorsEnabled++;projector.enabled=false;}
            }
        }
        static void NoEffectAudio(NoEffectReceipt receipt)
        {
            receipt.listenerPaused=AudioListener.pause;receipt.listenerVolume=AudioListener.volume;
            var audio=new float[1024];AudioListener.GetOutputData(audio,0);
            foreach(float v in audio)receipt.outputPeak=Mathf.Max(receipt.outputPeak,Mathf.Abs(v));
            foreach(var video in Resources.FindObjectsOfTypeAll<UnityEngine.Video.VideoPlayer>())
                if(video!=null&&video.audioOutputMode==UnityEngine.Video.VideoAudioOutputMode.Direct)receipt.directVideoPlayers++;
        }
        IEnumerator DecalNoEffectQa(bool map)
        {
            string output=Argument("-output");
            var receipt=new NoEffectReceipt{scope=map?"actual A2 soil/root, no projector, raw RGBA":"flat soil/root/Lit, no projector, raw RGBA"};
            IEnumerator body=map?DecalNoEffectMapBody(receipt,output):DecalNoEffectFlatBody(receipt,output);
            while(true)
            {
                bool more;object current;
                try{more=body.MoveNext();current=more?body.Current:null;}
                catch(Exception ex){receipt.error=ex.ToString();Debug.LogError("NO_EFFECT_QA_FAILED "+ex);break;}
                if(!more)break;yield return current;
            }
            NoEffectAudio(receipt);
            receipt.graphicsApi=SystemInfo.graphicsDeviceType.ToString();receipt.graphicsDevice=SystemInfo.graphicsDeviceName;
            receipt.passed=string.IsNullOrEmpty(receipt.error)&&receipt.graphicsApi=="Metal"&&receipt.width==1920&&receipt.height==1080&&
                receipt.listenerPaused&&receipt.listenerVolume==0&&receipt.outputPeak==0&&receipt.directVideoPlayers==0&&
                receipt.sites.Count==(map?4:6);
            foreach(var site in receipt.sites)receipt.passed&=site.passed;
            if(!string.IsNullOrEmpty(output)&&Path.IsPathRooted(output)&&Directory.Exists(output))
                File.WriteAllText(Path.Combine(output,"no-effect-receipt.json"),JsonUtility.ToJson(receipt,true));
            yield return new WaitForSecondsRealtime(1);
            Debug.Log("QA_MEDIA_DRAIN_COMPLETE NO_EFFECT");Application.Quit(receipt.passed?0:2);
        }
        static void NoEffectRequire(string output,bool map)
        {
            if(Application.isBatchMode||!NativeQaSandbox.Active||string.IsNullOrEmpty(output)||!Path.IsPathRooted(output)||
               (map&&(!NativeRemodel3D.Requested||!NativeHd2D.Enabled)))
                throw new InvalidOperationException("Visible QA sandbox Player and absolute -output required");
            if(Directory.Exists(output)&&Directory.GetFileSystemEntries(output).Length!=0)throw new InvalidOperationException("Output must be empty");
            Directory.CreateDirectory(output);
            AudioListener.volume=0;AudioListener.pause=true;Application.runInBackground=true;
        }
        IEnumerator DecalNoEffectFlatBody(NoEffectReceipt receipt,string output)
        {
            NoEffectRequire(output,false);smokeActive=true;pauseSmoke=true;Running=false;menu=false;
            lobby.ShowLobby();lobby.SelectPreview();
            if(!lobby.EnterNativeTest())throw new InvalidOperationException("Native preview entry failed");
            lobby.CloseStartupCaptureMedia();lobby.enabled=false;EndFirstPractice(true);
            if(view!=null)view.enabled=false;
            Screen.SetResolution(1920,1080,FullScreenMode.Windowed);
            float deadline=Time.realtimeSinceStartup+15;
            while((Screen.width!=1920||Screen.height!=1080)&&Time.realtimeSinceStartup<deadline)yield return null;
            receipt.width=Screen.width;receipt.height=Screen.height;
            if(receipt.width!=1920||receipt.height!=1080)throw new InvalidOperationException("1920 window unavailable");
            const int layer=29;
            string[] names={"EXODUSER/HellGroundPBR","EXODUSER/A2RootSurface","Universal Render Pipeline/Lit"};
            var renderers=new MeshRenderer[3];var materials=new Material[3];var baseline=new Material[3];
            for(int k=0;k<3;k++)
            {
                var shader=Shader.Find(names[k]);if(shader==null)throw new InvalidOperationException("Missing "+names[k]);
                var go=GameObject.CreatePrimitive(PrimitiveType.Quad);go.name="NoEffect "+names[k];go.layer=layer;
                go.transform.position=new Vector3((k-1)*3,0,0);go.transform.rotation=Quaternion.Euler(90,0,0);
                go.transform.localScale=new Vector3(2.6f,3.4f,1);
                var mat=new Material(shader);mat.SetColor("_BaseColor",new Color(.28f,.27f,.26f,1));
                if(mat.HasProperty("_FullField"))mat.SetFloat("_FullField",0);
                renderers[k]=go.GetComponent<MeshRenderer>();renderers[k].sharedMaterial=mat;materials[k]=mat;
                if(k<2)baseline[k]=NoEffectClone(mat);
                Destroy(go.GetComponent<Collider>());
            }
            var sun=new GameObject("NoEffect Sun").AddComponent<Light>();sun.type=LightType.Directional;sun.intensity=1;
            sun.transform.rotation=Quaternion.Euler(50,-30,0);
            var cam=new GameObject("NoEffect Camera").AddComponent<Camera>();cam.enabled=true;cam.depth=100;cam.orthographic=true;
            cam.orthographicSize=3.5f;cam.transform.position=new Vector3(0,8,0);cam.transform.rotation=Quaternion.Euler(90,0,0);
            cam.cullingMask=1<<layer;cam.clearFlags=CameraClearFlags.SolidColor;cam.backgroundColor=new Color(.035f,.035f,.04f);
            cam.nearClipPlane=.1f;cam.farClipPlane=20;cam.allowHDR=false;
            cam.gameObject.AddComponent<UniversalAdditionalCameraData>().renderPostProcessing=false;
            foreach(var other in FindObjectsByType<Camera>(FindObjectsSortMode.None))if(other!=cam)other.enabled=false;
            NoEffectDisableProjectors(receipt);yield return null;yield return null;
            foreach(int width in new[]{1920,3840})
            {
                var target=new RenderTexture(width,1080,24,RenderTextureFormat.ARGB32);target.Create();
                for(int k=0;k<3;k++)
                {
                    var site=new NoEffectSite{id=names[k].Substring(names[k].LastIndexOf('/')+1),shader=names[k],
                        baselineShader=k<2?baseline[k].shader.name:names[k],width=width,height=1080};
                    site.baselineImage=Path.Combine(output,site.id+"-"+width+"-baseline.png");
                    site.currentImage=Path.Combine(output,site.id+"-"+width+"-current.png");
                    site.repeatImage=Path.Combine(output,site.id+"-"+width+"-repeat.png");
                    if(k<2)renderers[k].sharedMaterial=baseline[k];
                    var a=NoEffectRender(cam,target,site.baselineImage);
                    renderers[k].sharedMaterial=materials[k];
                    var b=NoEffectRender(cam,target,site.currentImage);
                    var c=NoEffectRender(cam,target,site.repeatImage);
                    NoEffectDiff(a,b,c,site);receipt.sites.Add(site);
                    if(width==1920)
                    {
                        cam.targetTexture=null;yield return new WaitForEndOfFrame();
                        site.windowImage=Path.Combine(output,site.id+"-window-1920.png");
                        var screen=ScreenCapture.CaptureScreenshotAsTexture();File.WriteAllBytes(site.windowImage,screen.EncodeToPNG());Destroy(screen);
                    }
                    Destroy(a);Destroy(b);Destroy(c);
                }
                cam.targetTexture=null;target.Release();Destroy(target);
            }
        }
        IEnumerator DecalNoEffectMapBody(NoEffectReceipt receipt,string output)
        {
            NoEffectRequire(output,true);smokeActive=true;pauseSmoke=true;Running=false;menu=false;
            Screen.SetResolution(1920,1080,FullScreenMode.Windowed);
            lobby.Flow.ShowLobby();lobby.Flow.SelectPreview();
            if(!lobby.Flow.EnterTest())throw new InvalidOperationException("A2 field entry failed");
            EndFirstPractice(true);frontendEntryInputFence=false;gameFocused=true;Simulation.Config.EnemyAiEnabled=false;
            float deadline=Time.realtimeSinceStartup+50;
            while((!Remodel3DReady||a2Root==null||a2Field==null||a2FieldSoil==null||r3Cam==null||!NativeRemodel3D.Active)&&Time.realtimeSinceStartup<deadline)
            {UpdateViews();yield return null;}
            if(!Remodel3DReady||a2Root==null||a2Field==null||a2FieldSoil==null||r3Cam==null||!NativeRemodel3D.Active)
                throw new InvalidOperationException("Actual A2 field not ready");
            receipt.width=Screen.width;receipt.height=Screen.height;
            if(receipt.width!=1920||receipt.height!=1080)throw new InvalidOperationException("1920 actual window unavailable");
            var swaps=new List<MeshRenderer>();var originals=new List<Material>();var aliases=new List<Material>();
            var map=new Dictionary<Material,Material>();
            foreach(var renderer in a2Root.GetComponentsInChildren<MeshRenderer>(true))
            {
                var original=renderer.sharedMaterial;if(original==null)continue;
                bool soil=original==a2FieldSoil,root=original.shader.name=="EXODUSER/A2RootSurface";
                if(!soil&&!root)continue;
                if(soil)receipt.groundChunks++;else receipt.rootRenderers++;
                if(!map.TryGetValue(original,out var alias)){alias=NoEffectClone(original);map.Add(original,alias);}
                swaps.Add(renderer);originals.Add(original);aliases.Add(alias);
            }
            if(receipt.groundChunks==0||receipt.rootRenderers==0)throw new InvalidOperationException("Missing actual soil/root");
            NoEffectDisableProjectors(receipt);
            var anchors=new[]{new Vector2(40.2f,-77f),new Vector2(43.2f,-71.8f)};
            var ids=new[]{"actual-soil","actual-root"};
            for(int location=0;location<2;location++)
            {
                float x=anchors[location].x,z=anchors[location].y;
                Simulation.Player.X=x*100;Simulation.Player.Y=-z*100;lastX=x*100;lastY=-z*100;
                for(int frame=0;frame<12;frame++){UpdateViews();yield return null;}
                foreach(int width in new[]{1920,3840})
                {
                    var site=new NoEffectSite{id=ids[location],shader=location==0?"EXODUSER/HellGroundPBR":"EXODUSER/A2RootSurface",
                        baselineShader=NoEffectBaselineName(location==0?"EXODUSER/HellGroundPBR":"EXODUSER/A2RootSurface"),width=width,height=1080};
                    var target=new RenderTexture(width,1080,24,RenderTextureFormat.ARGB32);target.Create();
                    site.baselineImage=Path.Combine(output,site.id+"-"+width+"-baseline.png");
                    site.currentImage=Path.Combine(output,site.id+"-"+width+"-current.png");
                    site.repeatImage=Path.Combine(output,site.id+"-"+width+"-repeat.png");
                    var prior=r3Cam.targetTexture;
                    for(int i=0;i<swaps.Count;i++)swaps[i].sharedMaterial=aliases[i];
                    var a=NoEffectRender(r3Cam,target,site.baselineImage);
                    for(int i=0;i<swaps.Count;i++)swaps[i].sharedMaterial=originals[i];
                    var b=NoEffectRender(r3Cam,target,site.currentImage);
                    var c=NoEffectRender(r3Cam,target,site.repeatImage);
                    NoEffectDiff(a,b,c,site);receipt.sites.Add(site);
                    r3Cam.targetTexture=prior;target.Release();Destroy(target);Destroy(a);Destroy(b);Destroy(c);
                    if(width==1920)
                    {
                        yield return new WaitForEndOfFrame();
                        site.windowImage=Path.Combine(output,site.id+"-window-1920.png");
                        var screen=ScreenCapture.CaptureScreenshotAsTexture();File.WriteAllBytes(site.windowImage,screen.EncodeToPNG());Destroy(screen);
                    }
                }
            }
            lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();
        }
    }
}
