using System;
using System.Collections;
using System.Collections.Generic;
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
            public bool quadActive, quadEnabled, quadInFrustum, probeInFrustum;
            public string cameraRenderType;
            public Vector3 quadScreen, probeScreen, quadNormal;
            public Color probePixel;
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
                lobby.CloseStartupCaptureMedia();lobby.enabled=false;EndFirstPractice(true);
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
                    grounds[k].transform.rotation=Quaternion.Euler(90,0,0);
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
                cameraData.renderType=CameraRenderType.Base;
                receipt.cameraRenderType=cameraData.renderType.ToString();
                var probe=GameObject.CreatePrimitive(PrimitiveType.Cube);probe.name="QA Frustum Probe";probe.layer=layer;
                probe.transform.position=new Vector3(0,.4f,2.2f);probe.transform.localScale=Vector3.one*.5f;
                probe.GetComponent<MeshRenderer>().sharedMaterial=new Material(Shader.Find("Universal Render Pipeline/Lit"));
                foreach(var other in FindObjectsByType<Camera>(FindObjectsSortMode.None))if(other!=cam)other.enabled=false;
                var planes=GeometryUtility.CalculateFrustumPlanes(cam);
                var quadRenderer=grounds[1].GetComponent<MeshRenderer>();
                receipt.quadActive=grounds[1].activeInHierarchy;receipt.quadEnabled=quadRenderer.enabled;
                receipt.quadInFrustum=GeometryUtility.TestPlanesAABB(planes,quadRenderer.bounds);
                receipt.probeInFrustum=GeometryUtility.TestPlanesAABB(planes,probe.GetComponent<MeshRenderer>().bounds);
                receipt.quadScreen=cam.WorldToScreenPoint(grounds[1].transform.position);
                receipt.probeScreen=cam.WorldToScreenPoint(probe.transform.position);
                receipt.quadNormal=grounds[1].GetComponent<MeshFilter>().sharedMesh.normals[0];
                var sourceDecal=Resources.Load<Material>("QA/GroundDecal");
                if(sourceDecal==null)throw new InvalidOperationException("Bundled QA decal material unavailable");
                var decalMaterial=new Material(sourceDecal);receipt.decalShader=decalMaterial.shader.name;
                if(decalMaterial.shader.name=="Hidden/InternalErrorShader" || !decalMaterial.HasProperty("_FillColor"))
                    throw new InvalidOperationException("Bundled RM1 decal shader unavailable: "+receipt.decalShader);
                if(decalMaterial.FindPass("DBufferProjector")<0)
                    throw new InvalidOperationException("QA material has no DBufferProjector pass: "+receipt.decalShader);
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
                        if(width==1920 && state==0)
                        {
                            int px=Mathf.Clamp(Mathf.RoundToInt(receipt.probeScreen.x),0,width-1);
                            int py=Mathf.Clamp(Mathf.RoundToInt(receipt.probeScreen.y),0,height-1);
                            receipt.probePixel=images[state].GetPixel(px,py);
                        }
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

        [Serializable] sealed class GroundMapSite
        {
            public string id, receiver, material, shader, offA, offB, on, window;
            public int width, height, selfChanged, insideChanged, outsideChanged, selfMax, insideMax, outsideMax;
            public int rawSelfChanged, rawEffectChanged, rawOutsideChanged, rawSelfMax, rawEffectMax;
            public bool passed, coreWalkable;
            public float terrainY, actorGroundY, bridgeTopY;
            public Vector3 anchor, cameraPosition, cameraEuler, screenAnchor, receiverPosition, receiverEuler;
            public Vector4 roi;
        }
        [Serializable] sealed class GroundMapReceipt
        {
            public string scope="기존 A2 실제 필드/목교/HD2D 픽셀 배우. QA projector만 주입, 플레이·전투 자연완주 아님";
            public string error, graphicsDevice, graphicsApi, renderer, technique, soilShader, rootShader, bridgeRenderers;
            public int screenWidth, screenHeight, mrtCount, groundChunks, rootRenderers, directVideoPlayers;
            public float listenerVolume, outputPeak, projectorDepth, projectorHeightOffset, startAngleFade, endAngleFade;
            public bool passed, hd2d, remodel, featureActive, listenerPaused;
            public List<GroundMapSite> sites=new List<GroundMapSite>();
        }
        IEnumerator GroundMapCapture()
        {
            var body=GroundMapCaptureBody();
            while(true)
            {
                bool more;object current;
                try{more=body.MoveNext();current=more?body.Current:null;}
                catch(Exception ex)
                {
                    Debug.LogError("GROUND_MAP_QA_FAILED "+ex);
                    string path=Argument("-output");
                    if(!string.IsNullOrEmpty(path)&&Path.IsPathRooted(path)&&Directory.Exists(path))
                        File.WriteAllText(Path.Combine(path,"ground-map-receipt.json"),JsonUtility.ToJson(new GroundMapReceipt{error=ex.ToString()},true));
                    Application.Quit(2);yield break;
                }
                if(!more)yield break;
                yield return current;
            }
        }
        static Texture2D GroundMapRender(Camera camera,RenderTexture target,string path)
        {
            camera.targetTexture=target;camera.Render();
            var old=RenderTexture.active;RenderTexture.active=target;
            var tex=new Texture2D(target.width,target.height,TextureFormat.RGB24,false);
            tex.ReadPixels(new Rect(0,0,target.width,target.height),0,0);tex.Apply();RenderTexture.active=old;
            File.WriteAllBytes(path,tex.EncodeToPNG());return tex;
        }
        static int GroundMapDifference(Color32 a,Color32 b)
        {
            return Mathf.Max(Mathf.Abs(a.r-b.r),Mathf.Abs(a.g-b.g),Mathf.Abs(a.b-b.b));
        }
        static void GroundMapMeasure(GroundMapSite site,Texture2D offA,Texture2D offB,Texture2D on,Vector3 anchor)
        {
            var a=offA.GetPixels32();var b=offB.GetPixels32();var c=on.GetPixels32();
            int w=offA.width,h=offA.height;
            int x0=Mathf.Max(0,Mathf.FloorToInt(anchor.x)-230),x1=Mathf.Min(w,Mathf.CeilToInt(anchor.x)+230);
            int y0=Mathf.Max(0,Mathf.FloorToInt(anchor.y)-140),y1=Mathf.Min(h,Mathf.CeilToInt(anchor.y)+140);
            site.roi=new Vector4(x0,y0,x1,y1);
            for(int y=0;y<h;y++)for(int x=0;x<w;x++)
            {
                int index=y*w+x;int self=GroundMapDifference(a[index],b[index]);int effect=GroundMapDifference(b[index],c[index]);
                bool inside=x>=x0&&x<x1&&y>=y0&&y<y1;
                if(self>0)site.rawSelfChanged++;
                if(effect>0){site.rawEffectChanged++;if(!inside)site.rawOutsideChanged++;}
                site.rawSelfMax=Mathf.Max(site.rawSelfMax,self);
                site.rawEffectMax=Mathf.Max(site.rawEffectMax,effect);
                if(self>4)site.selfChanged++;site.selfMax=Mathf.Max(site.selfMax,self);
                if(effect<=self+4)continue;
                if(inside){site.insideChanged++;site.insideMax=Mathf.Max(site.insideMax,effect);}
                else{site.outsideChanged++;site.outsideMax=Mathf.Max(site.outsideMax,effect);}
            }
            site.passed=site.insideChanged>50&&site.insideMax>10&&site.selfChanged<site.insideChanged/10;
        }
        IEnumerator GroundMapCaptureBody()
        {
            if(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-ground-skills")>=0)
            {
                var skills=GroundSkillMapCapture();
                try{while(skills.MoveNext())yield return skills.Current;}
                finally{(skills as IDisposable)?.Dispose();}
                yield break;
            }
            string output=Argument("-output");
            if(Application.isBatchMode||!NativeQaSandbox.Active||!NativeRemodel3D.Requested||!NativeHd2D.Enabled||
               string.IsNullOrEmpty(output)||!Path.IsPathRooted(output))
                throw new InvalidOperationException("Visible remodel3d HD2D Player, absolute -output, QA sandbox required");
            if(Directory.Exists(output)&&Directory.GetFileSystemEntries(output).Length!=0)throw new InvalidOperationException("Output must be empty");
            Directory.CreateDirectory(output);
            AudioListener.volume=0;AudioListener.pause=true;Application.runInBackground=true;
            smokeActive=true;pauseSmoke=true;Running=false;menu=false;
            Screen.SetResolution(1920,1080,FullScreenMode.Windowed);
            lobby.Flow.ShowLobby();lobby.Flow.SelectPreview();
            if(!lobby.Flow.EnterTest())throw new InvalidOperationException("A2 field entry failed");
            EndFirstPractice(true);frontendEntryInputFence=false;gameFocused=true;
            Simulation.Config.EnemyAiEnabled=false;
            float deadline=Time.realtimeSinceStartup+50;
            while((!Remodel3DReady||a2Root==null||a2Field==null||a2FieldSoil==null||r3Cam==null||!NativeRemodel3D.Active)&&Time.realtimeSinceStartup<deadline)
            {UpdateViews();yield return null;}
            if(!Remodel3DReady||a2Root==null||a2Field==null||a2FieldSoil==null||r3Cam==null||!NativeRemodel3D.Active)
                throw new InvalidOperationException("Actual A2 field not ready");
            if(Screen.width!=1920||Screen.height!=1080)throw new InvalidOperationException("1920x1080 actual window unavailable: "+Screen.width+"x"+Screen.height);
            var receipt=new GroundMapReceipt{screenWidth=Screen.width,screenHeight=Screen.height,hd2d=NativeHd2D.Enabled,
                remodel=NativeRemodel3D.Active,graphicsDevice=SystemInfo.graphicsDeviceName,graphicsApi=SystemInfo.graphicsDeviceType.ToString(),
                mrtCount=SystemInfo.supportedRenderTargetCount,renderer=r3Cam.GetUniversalAdditionalCameraData().scriptableRenderer.GetType().Name,
                soilShader=a2FieldSoil.shader.name};
            var all=a2Root.GetComponentsInChildren<MeshRenderer>(true);MeshRenderer root=null;GameObject bridge=null;
            float nearest=float.PositiveInfinity;
            var bridgeParts=new List<string>();
            foreach(var renderer in all)
            {
                if(renderer.sharedMaterial==a2FieldSoil)receipt.groundChunks++;
                if(renderer.sharedMaterial!=null&&renderer.sharedMaterial.shader.name=="EXODUSER/A2RootSurface"&&renderer.enabled&&renderer.gameObject.activeInHierarchy)
                {
                    receipt.rootRenderers++;float dx=renderer.bounds.center.x-43.2f,dz=renderer.bounds.center.z+71.8f;
                    float dist=dx*dx+dz*dz;if(dist<nearest){nearest=dist;root=renderer;}
                }
            }
            bridge=GameObject.Find("A2 시작 목교");
            if(root==null||bridge==null||receipt.groundChunks==0)throw new InvalidOperationException("Actual root/bridge/ground receiver missing");
            receipt.rootShader=root.sharedMaterial.shader.name;
            foreach(var renderer in bridge.GetComponentsInChildren<MeshRenderer>(true))
                bridgeParts.Add(renderer.name+"="+(renderer.sharedMaterial==null?"none":renderer.sharedMaterial.name+"/"+renderer.sharedMaterial.shader.name));
            receipt.bridgeRenderers=string.Join("|",bridgeParts.ToArray());
            var cameraData=r3Cam.GetUniversalAdditionalCameraData();
            foreach(var feature in (System.Collections.IEnumerable)typeof(ScriptableRenderer).GetProperty("rendererFeatures",BindingFlags.Instance|BindingFlags.NonPublic|BindingFlags.Public).GetValue(cameraData.scriptableRenderer,null))
                if(feature is DecalRendererFeature)
                {
                    var decal=(DecalRendererFeature)feature;receipt.featureActive=decal.isActive;
                    var method=decal.GetType().GetMethod("GetTechnique",BindingFlags.Instance|BindingFlags.NonPublic,null,new[]{typeof(ScriptableRenderer)},null);
                    receipt.technique=method==null?"unavailable":Convert.ToString(method.Invoke(decal,new object[]{cameraData.scriptableRenderer}));
                }
            if(!receipt.featureActive||receipt.technique!="DBuffer"||receipt.mrtCount<4)throw new InvalidOperationException("Actual renderer not DBuffer MRT4");
            var baseMaterial=Resources.Load<Material>("QA/GroundDecal");
            if(baseMaterial==null||baseMaterial.shader.name=="Hidden/InternalErrorShader")throw new InvalidOperationException("QA projector shader missing");
            if(baseMaterial.FindPass("DBufferProjector")<0)throw new InvalidOperationException("QA projector shader has no DBufferProjector pass: "+baseMaterial.shader.name);
            var decalMaterial=new Material(baseMaterial);decalMaterial.SetFloat("_Shape",4);decalMaterial.SetFloat("_SizeX",3);decalMaterial.SetFloat("_SizeY",1.4f);
            decalMaterial.SetFloat("_Progress",1);decalMaterial.SetFloat("_Grow",1);decalMaterial.SetFloat("_Flash",0);decalMaterial.SetFloat("_EdgeGlow",0);
            decalMaterial.SetColor("_FillColor",new Color(.1f,.9f,.8f,.75f));
            var projector=new GameObject("QA Actual Map Projector").AddComponent<DecalProjector>();
            const float projectorDepth=.45f,projectorHeightOffset=.04f;
            projector.material=decalMaterial;projector.size=new Vector3(3,1.4f,projectorDepth);projector.pivot=Vector3.zero;
            projector.startAngleFade=45f;projector.endAngleFade=70f;
            projector.transform.rotation=Quaternion.Euler(90,0,0);projector.enabled=false;
            receipt.projectorDepth=projectorDepth;receipt.projectorHeightOffset=projectorHeightOffset;
            receipt.startAngleFade=projector.startAngleFade;receipt.endAngleFade=projector.endAngleFade;
            var anchors=new[]{new Vector2(40.2f,-77f),new Vector2(root.bounds.center.x,root.bounds.center.z),new Vector2(43.2f,-71.8f)};
            var ids=new[]{"start","passage-root-boundary","actual-wood-bridge"};
            for(int siteIndex=0;siteIndex<anchors.Length;siteIndex++)
            {
                float x=anchors[siteIndex].x,z=anchors[siteIndex].y;
                Simulation.Player.X=x*100;Simulation.Player.Y=-z*100;lastX=x*100;lastY=-z*100;
                for(int frame=0;frame<12;frame++){UpdateViews();yield return null;}
                float terrainY=a2Field.TerrainHeight(x,z),actorY=NativeRemodel3D.GroundY(x,z),bridgeY=-999f;
                Vector3 bridgeTop;if(siteIndex==2&&A2UpperSurfaceVertex(bridge,new Vector3(x,0,z),out bridgeTop))bridgeY=bridgeTop.y;
                float surfaceY=bridgeY< -900?actorY:Mathf.Max(actorY,bridgeY);
                projector.transform.position=new Vector3(x,surfaceY+projectorHeightOffset,z);
                foreach(int width in new[]{1920,3840})
                {
                    var site=new GroundMapSite{id=ids[siteIndex],width=width,height=1080,
                        receiver=siteIndex==1?root.name:siteIndex==2?bridge.name:"A2 실제 지면 청크",
                        material=siteIndex==1?root.sharedMaterial.name:siteIndex==2?receipt.bridgeRenderers:a2FieldSoil.name,
                        shader=siteIndex==1?root.sharedMaterial.shader.name:siteIndex==2?"actual bridge mixed renderers":a2FieldSoil.shader.name,
                        terrainY=terrainY,actorGroundY=actorY,bridgeTopY=bridgeY,
                        coreWalkable=Map.CanMove(x*100,-z*100,15),anchor=new Vector3(x,surfaceY,z),
                        cameraPosition=r3Cam.transform.position,cameraEuler=r3Cam.transform.eulerAngles,
                        receiverPosition=siteIndex==1?root.transform.position:siteIndex==2?bridge.transform.position:a2Root.transform.position,
                        receiverEuler=siteIndex==1?root.transform.eulerAngles:siteIndex==2?bridge.transform.eulerAngles:a2Root.transform.eulerAngles};
                    var rt=new RenderTexture(width,1080,24,RenderTextureFormat.ARGB32);rt.Create();
                    var previous=r3Cam.targetTexture;r3Cam.targetTexture=rt;
                    site.screenAnchor=r3Cam.WorldToScreenPoint(site.anchor);
                    projector.enabled=false;site.offA=Path.Combine(output,ids[siteIndex]+"-"+width+"-off-a.png");
                    var offA=GroundMapRender(r3Cam,rt,site.offA);
                    site.offB=Path.Combine(output,ids[siteIndex]+"-"+width+"-off-b.png");
                    var offB=GroundMapRender(r3Cam,rt,site.offB);
                    projector.enabled=true;site.on=Path.Combine(output,ids[siteIndex]+"-"+width+"-on.png");
                    var on=GroundMapRender(r3Cam,rt,site.on);
                    GroundMapMeasure(site,offA,offB,on,site.screenAnchor);
                    r3Cam.targetTexture=previous;rt.Release();Destroy(rt);Destroy(offA);Destroy(offB);Destroy(on);
                    receipt.sites.Add(site);
                    if(width==1920)
                    {
                        site.window=Path.Combine(output,ids[siteIndex]+"-window-1920-on.png");
                        yield return new WaitForEndOfFrame();
                        var screen=ScreenCapture.CaptureScreenshotAsTexture();
                        File.WriteAllBytes(site.window,screen.EncodeToPNG());Destroy(screen);
                    }
                    projector.enabled=false;
                }
            }
            receipt.listenerPaused=AudioListener.pause;receipt.listenerVolume=AudioListener.volume;
            var audio=new float[1024];AudioListener.GetOutputData(audio,0);
            foreach(float sample in audio)receipt.outputPeak=Mathf.Max(receipt.outputPeak,Mathf.Abs(sample));
            foreach(var video in Resources.FindObjectsOfTypeAll<UnityEngine.Video.VideoPlayer>())
                if(video!=null&&video.audioOutputMode==UnityEngine.Video.VideoAudioOutputMode.Direct)receipt.directVideoPlayers++;
            receipt.passed=receipt.graphicsApi=="Metal"&&receipt.hd2d&&receipt.remodel&&receipt.sites.Count==6&&
                receipt.listenerPaused&&receipt.listenerVolume==0&&receipt.outputPeak==0&&receipt.directVideoPlayers==0;
            foreach(var site in receipt.sites)receipt.passed&=site.passed;
            if(!receipt.passed)receipt.error="One or more actual-map fixture checks failed; inspect self-repeat/ROI/raw images";
            File.WriteAllText(Path.Combine(output,"ground-map-receipt.json"),JsonUtility.ToJson(receipt,true));
            lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();
            yield return new WaitForSecondsRealtime(1);
            Debug.Log("QA_MEDIA_DRAIN_COMPLETE GROUND_MAP");Application.Quit(receipt.passed?0:2);
        }
    }
}
