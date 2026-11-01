using System;
using System.Collections;
using System.IO;
using System.Reflection;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace Exoduser.UnityPort
{
    // Isolated Player GPU fixture. All three receivers share one camera, light and projector.
    public sealed partial class NativeGame
    {
        bool groundReceiverQaActive;

        [Serializable] sealed class GroundReceiverSample
        {
            public string receiver, shader;
            public int width, height;
            public float insideDelta, outsideDelta, edgeInsideDelta, edgeOutsideDelta;
            public bool passed;
        }
        [Serializable] sealed class GroundReceiverReceipt
        {
            public bool passed, batchMode, listenerPaused, dbufferMrt3Keyword, featureActive;
            public string graphicsDevice, graphicsApi, renderer, technique, decalShader, error;
            public int mrtCount, directVideoPlayers, screenWidth, screenHeight;
            public float listenerVolume, outputPeak;
            public GroundReceiverSample[] samples = new GroundReceiverSample[6];
        }

        IEnumerator GroundReceiverCapture()
        {
            var body=GroundReceiverCaptureBody();
            while(true)
            {
                bool more;object current;
                try{more=body.MoveNext();current=more?body.Current:null;}
                catch(Exception ex)
                {
                    Debug.LogError("GROUND_RECEIVER_QA_FAILED "+ex);
                    string output=Argument("-output");
                    if(!string.IsNullOrEmpty(output)&&Path.IsPathRooted(output)&&Directory.Exists(output))
                        File.WriteAllText(Path.Combine(output,"ground-receiver-receipt.json"),JsonUtility.ToJson(new GroundReceiverReceipt{error=ex.ToString()},true));
                    Application.Quit(2);yield break;
                }
                if(!more)yield break;
                yield return current;
            }
        }
        IEnumerator GroundReceiverCaptureBody()
        {
            var receipt = new GroundReceiverReceipt();
            string output = Argument("-output");
                if(Application.isBatchMode || !NativeQaSandbox.Active || string.IsNullOrEmpty(output) || !Path.IsPathRooted(output))
                    throw new InvalidOperationException("Visible Player, absolute -output and --unity-qa-sandbox required");
                if(Directory.Exists(output) && Directory.GetFileSystemEntries(output).Length != 0)
                    throw new InvalidOperationException("Output must be empty");
                Directory.CreateDirectory(output);
                AudioListener.volume=0; AudioListener.pause=true; Application.runInBackground=true;
                smokeActive=true; pauseSmoke=true; Running=false; menu=false;
                lobby.ShowLobby();lobby.SelectPreview();
                if(!lobby.EnterNativeTest())throw new InvalidOperationException("QA native preview entry failed");
                lobby.CloseStartupCaptureMedia();EndFirstPractice(true);
                if(view!=null)view.enabled=false;
                Screen.SetResolution(1920,1080,FullScreenMode.Windowed);
                float deadline=Time.realtimeSinceStartup+15;
                while((Screen.width!=1920 || Screen.height!=1080) && Time.realtimeSinceStartup<deadline)yield return null;
                receipt.screenWidth=Screen.width;receipt.screenHeight=Screen.height;
                if(receipt.screenWidth!=1920 || receipt.screenHeight!=1080)throw new InvalidOperationException("1920x1080 window unavailable");

                const int layer=29;
                var groundShaders=new[]{"EXODUSER/HellGroundPBR","EXODUSER/A2RootSurface","Universal Render Pipeline/Lit"};
                var grounds=new GameObject[3];
                for(int k=0;k<3;k++)
                {
                    var shader=Shader.Find(groundShaders[k]);if(shader==null)throw new InvalidOperationException("Missing receiver "+groundShaders[k]);
                    grounds[k]=GameObject.CreatePrimitive(PrimitiveType.Quad);grounds[k].name="QA "+groundShaders[k];grounds[k].layer=layer;
                    grounds[k].transform.position=new Vector3((k-1)*3f,0,0);
                    grounds[k].transform.rotation=Quaternion.Euler(-90,0,0);
                    grounds[k].transform.localScale=new Vector3(2.6f,3.4f,1);
                    var mat=new Material(shader);mat.SetColor("_BaseColor",new Color(.28f,.27f,.26f,1));
                    if(mat.HasProperty("_FullField"))mat.SetFloat("_FullField",0);
                    grounds[k].GetComponent<MeshRenderer>().sharedMaterial=mat;
                    Destroy(grounds[k].GetComponent<Collider>());
                }
                var sun=new GameObject("QA Sun").AddComponent<Light>();sun.type=LightType.Directional;sun.intensity=1.0f;
                sun.transform.rotation=Quaternion.Euler(50,-30,0);
                var cam=new GameObject("QA Ground Camera").AddComponent<Camera>();cam.enabled=true;cam.depth=100;cam.orthographic=true;cam.orthographicSize=3.5f;
                cam.transform.position=new Vector3(0,8,0);cam.transform.rotation=Quaternion.Euler(90,0,0);
                cam.cullingMask=1<<layer;cam.clearFlags=CameraClearFlags.SolidColor;cam.backgroundColor=new Color(.035f,.035f,.04f);
                cam.nearClipPlane=.1f;cam.farClipPlane=20;cam.allowHDR=false;
                var cameraData=cam.gameObject.AddComponent<UniversalAdditionalCameraData>();cameraData.renderPostProcessing=false;
                var sourceDecal=Resources.Load<Material>("QA/GroundDecal");
                if(sourceDecal==null)throw new InvalidOperationException("Bundled QA decal material unavailable");
                var decalMaterial=new Material(sourceDecal);receipt.decalShader=decalMaterial.shader.name;
                if(decalMaterial.shader.name=="Hidden/InternalErrorShader" || !decalMaterial.HasProperty("_FillColor"))
                    throw new InvalidOperationException("Bundled RM1 decal shader unavailable: "+receipt.decalShader);
                decalMaterial.SetFloat("_Shape",4);decalMaterial.SetFloat("_SizeX",10f);decalMaterial.SetFloat("_SizeY",.8f);
                decalMaterial.SetFloat("_Progress",1);decalMaterial.SetFloat("_Grow",1);decalMaterial.SetFloat("_Flash",0);
                decalMaterial.SetFloat("_EdgeGlow",0);
                decalMaterial.SetColor("_FillColor",new Color(.95f,.045f,.06f,.9f));
                var projector=new GameObject("QA Single Projector").AddComponent<DecalProjector>();
                projector.transform.position=new Vector3(0,1,0);projector.transform.rotation=Quaternion.Euler(90,0,0);
                projector.material=decalMaterial;projector.size=new Vector3(10f,.8f,4f);projector.pivot=Vector3.zero;
                projector.gameObject.layer=layer;

                receipt.graphicsDevice=SystemInfo.graphicsDeviceName;receipt.graphicsApi=SystemInfo.graphicsDeviceType.ToString();
                receipt.mrtCount=SystemInfo.supportedRenderTargetCount;receipt.batchMode=Application.isBatchMode;
                receipt.renderer=cameraData.scriptableRenderer.GetType().Name;
                var featureProperty=typeof(ScriptableRenderer).GetProperty("rendererFeatures",BindingFlags.Instance|BindingFlags.NonPublic|BindingFlags.Public);
                var features=featureProperty==null?null:featureProperty.GetValue(cameraData.scriptableRenderer,null) as System.Collections.IEnumerable;
                if(features==null)throw new InvalidOperationException("Renderer features unavailable");
                foreach(var entry in features)
                    if(entry is DecalRendererFeature)
                    {
                        var feature=(DecalRendererFeature)entry;
                        receipt.featureActive=feature.isActive;
                        var method=feature.GetType().GetMethod("GetTechnique",BindingFlags.Instance|BindingFlags.NonPublic,null,new[]{typeof(ScriptableRenderer)},null);
                        receipt.technique=method==null?"unavailable":Convert.ToString(method.Invoke(feature,new object[]{cameraData.scriptableRenderer}));
                    }
                if(!receipt.featureActive || receipt.technique!="DBuffer" || receipt.mrtCount<4)
                    throw new InvalidOperationException("Renderer is not valid DBuffer/MRT4: "+receipt.technique+" MRT="+receipt.mrtCount);
                yield return null;yield return null;
                int sampleIndex=0;
                foreach(int width in new[]{1920,3840})
                {
                    const int height=1080;
                    var target=new RenderTexture(width,height,24,RenderTextureFormat.ARGB32);target.Create();
                    var images=new Texture2D[2];
                    for(int state=0;state<2;state++)
                    {
                        projector.enabled=state==1;
                        cam.targetTexture=target;cam.Render();
                        receipt.dbufferMrt3Keyword|=Shader.IsKeywordEnabled("_DBUFFER_MRT3");
                        var old=RenderTexture.active;RenderTexture.active=target;
                        images[state]=new Texture2D(width,height,TextureFormat.RGB24,false);
                        images[state].ReadPixels(new Rect(0,0,width,height),0,0);images[state].Apply();RenderTexture.active=old;
                        File.WriteAllBytes(Path.Combine(output,width+"x1080-"+(state==0?"off":"on")+".png"),images[state].EncodeToPNG());
                        if(width==1920)
                        {
                            cam.targetTexture=null;
                            yield return new WaitForEndOfFrame();
                            ScreenCapture.CaptureScreenshot(Path.Combine(output,"window-1920x1080-"+(state==0?"off":"on")+".png"));
                            yield return null;
                        }
                    }
                    cam.targetTexture=target;
                    for(int k=0;k<3;k++)
                    {
                        float x=(k-1)*3f;
                        float delta(float z)
                        {
                            var pixel=cam.WorldToScreenPoint(new Vector3(x,0,z));
                            int px=Mathf.Clamp(Mathf.RoundToInt(pixel.x),0,width-1),py=Mathf.Clamp(Mathf.RoundToInt(pixel.y),0,height-1);
                            Color a=images[0].GetPixel(px,py),b=images[1].GetPixel(px,py);
                            return Mathf.Max(Mathf.Abs(a.r-b.r),Mathf.Abs(a.g-b.g),Mathf.Abs(a.b-b.b));
                        }
                        var item=new GroundReceiverSample{receiver=k==0?"HellGround soil":k==1?"A2Root ground":"Lit bridge",shader=groundShaders[k],width=width,height=height,
                            insideDelta=delta(0),outsideDelta=delta(1.2f),edgeInsideDelta=delta(.34f),edgeOutsideDelta=delta(.46f)};
                        item.passed=item.insideDelta>.06f && item.outsideDelta<.025f && item.edgeInsideDelta>.04f && item.edgeOutsideDelta<.025f;
                        receipt.samples[sampleIndex++]=item;
                    }
                    cam.targetTexture=null;target.Release();Destroy(target);Destroy(images[0]);Destroy(images[1]);
                }
                receipt.listenerPaused=AudioListener.pause;receipt.listenerVolume=AudioListener.volume;
                var audio=new float[1024];AudioListener.GetOutputData(audio,0);
                foreach(float v in audio)receipt.outputPeak=Mathf.Max(receipt.outputPeak,Mathf.Abs(v));
                foreach(var video in Resources.FindObjectsOfTypeAll<UnityEngine.Video.VideoPlayer>())
                    if(video!=null && video.audioOutputMode==UnityEngine.Video.VideoAudioOutputMode.Direct)receipt.directVideoPlayers++;
                receipt.passed=receipt.graphicsApi=="Metal" && receipt.screenWidth==1920 && receipt.screenHeight==1080 &&
                    receipt.featureActive && receipt.technique=="DBuffer" && receipt.mrtCount>=4 && receipt.listenerPaused &&
                    receipt.listenerVolume==0 && receipt.outputPeak==0 && receipt.directVideoPlayers==0;
                foreach(var sample in receipt.samples)receipt.passed&=sample!=null && sample.passed;
                if(!receipt.passed)receipt.error="One or more GPU receiver/QA gates failed";
            if(!string.IsNullOrEmpty(output) && Path.IsPathRooted(output) && Directory.Exists(output))
                File.WriteAllText(Path.Combine(output,"ground-receiver-receipt.json"),JsonUtility.ToJson(receipt,true));
            yield return new WaitForSecondsRealtime(1f);
            Debug.Log("QA_MEDIA_DRAIN_COMPLETE GROUND_RECEIVER");Application.Quit(receipt.passed?0:2);
        }
    }
}
