using System;using System.Collections.Generic;using System.IO;using UnityEngine;using UnityEngine.Rendering;using UnityEngine.Rendering.Universal;using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
    // The hero/enemy Point-RT contract, isolated boss layer. No Core or camera pose writer.
    [DefaultExecutionOrder(1002)] public sealed class NativeDruidRigPixelView:MonoBehaviour
    {
        const int Layer=27;const string Resource="Art/Bosses/Druid/OldmanV7";
        [Serializable] sealed class ImportData {public string sourceVersion,sourceSha256;public float hornHeight,meshHeight;public int boneCount,chestEmissionFaces;}
        GameObject root,model;Renderer[] skins;Camera capture;MeshRenderer image,contact;Material composite,shadow;RenderTexture texture;
        readonly List<Material> materials=new List<Material>();readonly Dictionary<Camera,int> masks=new Dictionary<Camera,int>();
        Func<Camera> cameraSource;Action hideDefault;string output;ImportData imported;NativeDruidRigAnimator motion;
        UniversalRenderPipeline.SingleCameraRequest request;EnemyState enemy;DruidData data;Bounds bounds;Vector3 ground;
        int tick,sinkTick,renderedFrame=-1,lastMotionTick=int.MinValue;float lastX,lastY;bool coreMoving;bool failed,active,sinking,frozen;float hornUnits,baseRadius,projectedHeight;
        Light[] lights=Array.Empty<Light>();int nextLights;readonly Vector4[] lightPositions=new Vector4[4],lightColors=new Vector4[4];readonly float[] lightDistances=new float[4];Light moon;
        public bool Ready {get;private set;}public int RenderCount {get;private set;}public int TexelScale {get;private set;}public int TextureWidth {get{return texture==null?0:texture.width;}}public float RenderMilliseconds {get;private set;}
        public Bounds Bounds {get{return bounds;}}
        public void Initialize(Func<Camera> cameraSource,Action hideDefault,string output)
        {
            this.cameraSource=cameraSource;this.hideDefault=hideDefault;this.output=output;
            try
            {
                var info=Resources.Load<TextAsset>("Art/Bosses/Druid/oldman-import");if(info==null)throw new InvalidOperationException("oldman import receipt missing");imported=JsonUtility.FromJson<ImportData>(info.text);
                var prefab=Resources.Load<GameObject>(Resource);var toon=Resources.Load<Shader>("Shaders/DruidRigPixelToon");var compose=Resources.Load<Shader>("Shaders/RigPixelComposite");
                if(prefab==null||toon==null||compose==null||imported.hornHeight<=0||imported.meshHeight<=0)throw new InvalidOperationException("v7 model/metadata/shared pixel shaders missing");
                root=new GameObject("Druid rig-pixel Core root");root.transform.SetParent(transform,false);model=Instantiate(prefab,root.transform);model.transform.localPosition=Vector3.zero;model.transform.localRotation=Quaternion.identity;model.transform.localScale=Vector3.one;
                foreach(var tr in model.GetComponentsInChildren<Transform>(true))tr.gameObject.layer=Layer;
                skins=model.GetComponentsInChildren<Renderer>(true);if(skins.Length==0)throw new InvalidOperationException("v7 has no renderer");
                Renderer body=null;Transform left=null,right=null,socket=null;
                foreach(var tr in model.GetComponentsInChildren<Transform>(true)){if(tr.name=="LeftFoot")left=tr;if(tr.name=="RightFoot")right=tr;if(tr.name=="StaffSocket_L")socket=tr;}
                foreach(var r in skins)if(r.name=="char1")body=r;
                if(body==null||left==null||right==null||socket==null)throw new InvalidOperationException("v7 body/feet/staff socket missing");
                if(socket.parent==null||socket.parent.name!="LeftHand")throw new InvalidOperationException("StaffSocket_L no longer belongs to LeftHand");
                var bodyBox=body.bounds;hornUnits=bodyBox.size.y*imported.hornHeight/imported.meshHeight;if(hornUnits<=.0001f)throw new InvalidOperationException("v7 horn units invalid");
                var foot=(left.position+right.position)*.5f;foot.y=bodyBox.min.y;model.transform.position-=foot-root.transform.position;
                foreach(var r in skins)
                {
                    var old=r.sharedMaterials;var replacement=new Material[old.Length];
                    for(int i=0;i<old.Length;i++)
                    {
                        string name=old[i]==null?"":old[i].name.Replace(" (Instance)","");string hex=NativeDruidRigPolicy.Palette(name);Color color;if(hex==null||!ColorUtility.TryParseHtmlString(hex,out color))throw new InvalidOperationException("Unmapped v7 material: "+name);
                        var mat=new Material(toon){name="Druid rig-pixel "+name};mat.SetColor("_PaletteColor",color);mat.SetColor("_BaseColor",Color.white);mat.SetFloat("_MetallicPlane",0);
                        float tag=name=="druid_feather"||name=="front_panel_cloth"?.7f:name=="staff_leather"?.8f:name=="druid_bark"||name=="staff_bark"?.6f:1;
                        mat.SetFloat("_SurfaceTag",tag);mat.SetFloat("_DruidGroundClip",1);mat.SetFloat("_DruidGroundY",0);mat.SetFloat("_DruidGlow",name=="lantern_orb"||name=="druid_glow"?1:0);Color amber;ColorUtility.TryParseHtmlString("#d49a5c",out amber);mat.SetColor("_DruidEmission",amber);
                        replacement[i]=mat;materials.Add(mat);
                    }
                    r.sharedMaterials=replacement;r.shadowCastingMode=ShadowCastingMode.Off;r.receiveShadows=false;r.forceRenderingOff=true;if(r is SkinnedMeshRenderer skin)skin.updateWhenOffscreen=true;
                }
                motion=new NativeDruidRigAnimator(model,Resource);
                if(Array.IndexOf(motion.AvailableClips,"Walk")<0||Array.IndexOf(motion.AvailableClips,"Idle")<0)throw new InvalidOperationException("Provided v7 Idle/Walk did not import; keep existing boss");
                if(!motion.AvatarValid||motion.Humanoid)throw new InvalidOperationException("Expected valid Generic Avatar; keep existing boss");
                capture=new GameObject("Druid rig-pixel capture").AddComponent<Camera>();capture.transform.SetParent(transform,false);capture.enabled=false;capture.orthographic=true;capture.clearFlags=CameraClearFlags.SolidColor;capture.backgroundColor=Color.clear;capture.cullingMask=1<<Layer;capture.nearClipPlane=.05f;capture.farClipPlane=24;capture.allowHDR=false;capture.allowMSAA=false;
                var extra=capture.GetUniversalAdditionalCameraData();extra.renderPostProcessing=false;extra.renderShadows=false;extra.requiresColorOption=CameraOverrideOption.Off;extra.requiresDepthOption=CameraOverrideOption.Off;extra.volumeLayerMask=0;
                composite=new Material(compose);image=Quad("Druid rig-pixel composite",composite);var contactShader=Resources.Load<Shader>("Shaders/HD2DContact");if(contactShader!=null){shadow=new Material(contactShader);contact=Quad("Druid rig ground contact",shadow);}request=new UniversalRenderPipeline.SingleCameraRequest();
                Debug.Log("[DruidRig] imported="+imported.sourceVersion+" selected=Generic avatarValid="+motion.AvatarValid+" humanoid="+motion.Humanoid+" clips="+string.Join(",",motion.AvailableClips)+" source="+imported.sourceSha256);
            }
            catch(Exception error){Fail(error);}
        }
        MeshRenderer Quad(string name,Material material)
        {
            var go=GameObject.CreatePrimitive(PrimitiveType.Quad);go.name=name;go.transform.SetParent(transform,false);Destroy(go.GetComponent<Collider>());var renderer=go.GetComponent<MeshRenderer>();renderer.sharedMaterial=material;renderer.shadowCastingMode=ShadowCastingMode.Off;renderer.receiveShadows=false;renderer.enabled=false;return renderer;
        }
        public void Sync(EnemyState boss,DruidData state,int coreTick,bool sink,int sinkAge,bool poseFrozen)
        {
            if(failed)return;enemy=boss;data=state;tick=coreTick;sinking=sink;sinkTick=sinkAge;frozen=poseFrozen;
            active=boss!=null&&state!=null&&NativeRemodel3D.ArenaActive&&(boss.Alive||sink)&&state.S!="bossDruidUnder";
            if(!active){Hide();return;}
            if(lastMotionTick!=coreTick){coreMoving=lastMotionTick!=int.MinValue&&(Mathf.Abs(boss.X-lastX)+Mathf.Abs(boss.Y-lastY)>.001f);lastX=boss.X;lastY=boss.Y;lastMotionTick=coreTick;}
            if(baseRadius<=0)baseRadius=(float)Math.Max(.01,state.R);
        }
        public void Deactivate(){active=false;Hide();}
        void Hide(){Ready=false;if(image!=null)image.enabled=false;if(contact!=null)contact.enabled=false;}
        static Rect ScreenBounds(Camera camera,Bounds box)
        {
            float x0=float.PositiveInfinity,y0=x0,x1=float.NegativeInfinity,y1=x1;
            for(int n=0;n<8;n++){var p=camera.WorldToScreenPoint(box.center+Vector3.Scale(box.extents,new Vector3((n&1)==0?-1:1,(n&2)==0?-1:1,(n&4)==0?-1:1)));if(p.z<=camera.nearClipPlane)throw new InvalidOperationException("Boss intersects capture near plane");x0=Mathf.Min(x0,p.x);x1=Mathf.Max(x1,p.x);y0=Mathf.Min(y0,p.y);y1=Mathf.Max(y1,p.y);}
            return Rect.MinMaxRect(x0,y0,x1,y1);
        }
        void HideLayer(Camera camera){if(camera==null||camera==capture)return;if(!masks.ContainsKey(camera))masks[camera]=camera.cullingMask;camera.cullingMask&=~(1<<Layer);}
  void Lighting(Vector3 ground){
   if(lights.Length==0||Time.frameCount>=nextLights){lights=FindObjectsByType<Light>(FindObjectsSortMode.None);nextLights=Time.frameCount+120;}moon=null;for(int i=0;i<4;i++){lightPositions[i]=lightColors[i]=Vector4.zero;lightDistances[i]=float.MaxValue;}
   foreach(var l in lights){if(l==null||!l.isActiveAndEnabled||l.intensity<=0)continue;if(l.type==LightType.Directional){if(moon==null||l.intensity>moon.intensity)moon=l;continue;}if(l.type!=LightType.Point)continue;float d=(l.transform.position-ground).sqrMagnitude;if(d>l.range*l.range||d>=lightDistances[3])continue;int k=3;while(k>0&&d<lightDistances[k-1]){lightDistances[k]=lightDistances[k-1];lightPositions[k]=lightPositions[k-1];lightColors[k]=lightColors[k-1];k--;}lightDistances[k]=d;var p=l.transform.position;lightPositions[k]=new Vector4(p.x,p.y,p.z,l.range);var c=l.color.linear*l.intensity;lightColors[k]=new Vector4(c.r,c.g,c.b,1);}
   Shader.SetGlobalVector("_RigPixelMoonDirection",moon!=null?-moon.transform.forward:Vector3.up);Shader.SetGlobalColor("_RigPixelMoonColor",moon!=null?moon.color.linear*moon.intensity:Color.black);Shader.SetGlobalColor("_RigPixelAmbient",RenderSettings.ambientEquatorColor.linear);Shader.SetGlobalVectorArray("_RigPixelPointPositions",lightPositions);Shader.SetGlobalVectorArray("_RigPixelPointColors",lightColors);
  }

        void LateUpdate()
        {
            if(failed||!active||enemy==null||data==null||renderedFrame==Time.frameCount){if(!active)Hide();return;}
            if(!enemy.Alive&&!sinking){Hide();return;}
            var camera=cameraSource==null?null:cameraSource();if(camera==null||!camera.isActiveAndEnabled||!NativeRemodel3D.ArenaActive){Hide();return;}
            try
            {
                HideLayer(camera);HideLayer(Camera.main);
                float height=NativeArenaActorMetrics.HeroIdleWorld*2.8f,phase=(float)data.R/baseRadius;
                ground=NativeRemodel3D.Point(enemy.X,enemy.Y);
                float descent=sinking?height*phase*Mathf.Clamp01(sinkTick/(float)NativeGame.SinkBodyTicks):0;
                root.transform.SetPositionAndRotation(ground-Vector3.up*descent,Quaternion.Euler(0,Mathf.Atan2(Mathf.Cos(enemy.Facing),-Mathf.Sin(enemy.Facing))*Mathf.Rad2Deg,0));root.transform.localScale=Vector3.one*(height/hornUnits*phase);
                motion.Sample(data.S,data.RmMoveId,tick,coreMoving,frozen);
                foreach(var mat in materials)mat.SetFloat("_DruidGroundY",ground.y);
                bounds=skins[0].bounds;foreach(var renderer in skins)bounds.Encapsulate(renderer.bounds);
                var foot=camera.WorldToScreenPoint(ground);if(foot.z<=0){Hide();return;}
                var box=ScreenBounds(camera,bounds);projectedHeight=box.height;float wpp=(camera.ScreenToWorldPoint(foot+Vector3.up)-ground).magnitude;TexelScale=NativeRigPixelPolicy.TexelScale(camera.pixelHeight);
                int size=NativeRigPixelPolicy.TextureSize(wpp,TexelScale,(Mathf.Max(box.width,box.height)+4*TexelScale)*wpp);if(size==0)throw new InvalidOperationException("Druid exceeds safe RT canvas");
                if(texture==null||texture.width!=size){if(texture!=null){texture.Release();Destroy(texture);}texture=new RenderTexture(size,size,24,RenderTextureFormat.ARGB32,RenderTextureReadWrite.Linear){name="Druid Point RT",filterMode=FilterMode.Point,wrapMode=TextureWrapMode.Clamp,antiAliasing=1,useMipMap=false,autoGenerateMips=false};texture.Create();composite.SetTexture("_MainTex",texture);}
                float extent=size*wpp*TexelScale,cx=Mathf.Round((box.center.x-foot.x)/TexelScale)*wpp*TexelScale,cy=Mathf.Round((box.center.y-foot.y)/TexelScale)*wpp*TexelScale;
                capture.orthographicSize=extent*.5f;capture.aspect=1;capture.transform.SetPositionAndRotation(ground+camera.transform.right*cx+camera.transform.up*cy-camera.transform.forward*8,camera.transform.rotation);request.destination=texture;
                var snap=NativeHd2D.SnapAnchor(camera,ground);image.transform.SetPositionAndRotation(snap+camera.transform.right*cx+camera.transform.up*cy,camera.transform.rotation);image.transform.localScale=new Vector3(extent,extent,1);image.sortingOrder=(int)enemy.Y;
                Lighting(ground);var direction=moon!=null?-moon.transform.forward:Vector3.up;composite.SetVector("_RimDirection",new Vector4(Vector3.Dot(direction,camera.transform.right),Vector3.Dot(direction,camera.transform.up),0,0));composite.SetColor("_RimColor",(moon!=null?moon.color:Color.white)*.08f);
                double before=Time.realtimeSinceStartupAsDouble;foreach(var renderer in skins)renderer.forceRenderingOff=false;
                try{if(!RenderPipeline.SupportsRenderRequest(capture,request))throw new InvalidOperationException("URP SingleCameraRequest unavailable");RenderPipeline.SubmitRenderRequest(capture,request);}finally{foreach(var renderer in skins)renderer.forceRenderingOff=true;}
                RenderMilliseconds=(float)((Time.realtimeSinceStartupAsDouble-before)*1000);RenderCount++;renderedFrame=Time.frameCount;Ready=true;image.enabled=true;hideDefault?.Invoke();
                if(contact!=null){contact.enabled=!sinking;contact.transform.SetPositionAndRotation(ground+Vector3.up*.018f,Quaternion.Euler(90,0,0));contact.transform.localScale=new Vector3(1.2f*phase,.7f*phase,1);contact.sortingOrder=image.sortingOrder-1;}
            }
            catch(Exception error){Fail(error);}
        }
        [Serializable] public sealed class Frame
        {
            public string mode="rigpixel",modelResource=Resource,sourceVersion,sourceSha,coreState,moveId,pose,clip,gate="Mac import/visual/performance pending";
            public bool ready,failed,missingClip,humanoid,avatarValid;public int tick,frame,renders,rtSize,texelScale,missingStates,chestEmissionFaces;public float renderMs,hornWorldHeight,projectedBoundsHeightPx;public int rawAlphaHeightPx;public string rawAlphaScope="isolated raw RT before composite cleanup/outline and world occlusion; includes roots and staff";public Bounds bounds;
        }
        public Frame CaptureFrame(){return new Frame{sourceVersion=imported==null?"":imported.sourceVersion,sourceSha=imported==null?"":imported.sourceSha256,chestEmissionFaces=imported==null?0:imported.chestEmissionFaces,coreState=data==null?"":data.S,moveId=data==null?"":data.RmMoveId,pose=motion==null?"":motion.Role,clip=motion==null?"":motion.Clip,ready=Ready,failed=failed,missingClip=motion==null||motion.MissingClip,humanoid=motion!=null&&motion.Humanoid,avatarValid=motion!=null&&motion.AvatarValid,tick=tick,frame=renderedFrame,renders=RenderCount,rtSize=TextureWidth,texelScale=TexelScale,missingStates=motion==null?0:motion.MissingStates,renderMs=RenderMilliseconds,projectedBoundsHeightPx=projectedHeight,hornWorldHeight=NativeArenaActorMetrics.HeroIdleWorld*2.8f*(baseRadius>0&&data!=null?(float)data.R/baseRadius:1),bounds=bounds};}
        public int CaptureRawRt(string path)
        {
            if(!Ready||texture==null)return -1;
            var previous=RenderTexture.active;var sample=new Texture2D(texture.width,texture.height,TextureFormat.RGBA32,false,true);
            try
            {
                RenderTexture.active=texture;sample.ReadPixels(new Rect(0,0,texture.width,texture.height),0,0);sample.Apply(false);
                var pixels=sample.GetRawTextureData<Color32>();int lo=texture.height,hi=-1;
                for(int y=0;y<texture.height;y++)for(int x=0;x<texture.width;x++)if(pixels[y*texture.width+x].a>32){lo=Mathf.Min(lo,y);hi=Mathf.Max(hi,y);break;}
                File.WriteAllBytes(path,sample.EncodeToPNG());return hi>=lo?(hi-lo+1)*TexelScale:0;
            }
            finally{RenderTexture.active=previous;Destroy(sample);}
        }
        public void WriteReceipt(string directory){if(string.IsNullOrEmpty(directory))return;Directory.CreateDirectory(directory);File.WriteAllText(Path.Combine(directory,"druid-rigpixel.json"),JsonUtility.ToJson(CaptureFrame(),true));}
        void Fail(Exception error){failed=true;Hide();if(root!=null)root.SetActive(false);Debug.LogWarning("[DruidRig] existing boss fallback, once: "+error.Message);}
        void OnDestroy(){WriteReceipt(output);motion?.Dispose();foreach(var pair in masks)if(pair.Key!=null)pair.Key.cullingMask=(pair.Key.cullingMask&~(1<<Layer))|(pair.Value&(1<<Layer));if(texture!=null){texture.Release();Destroy(texture);}foreach(var mat in materials)Destroy(mat);if(composite!=null)Destroy(composite);if(shadow!=null)Destroy(shadow);if(root!=null)Destroy(root);if(capture!=null)Destroy(capture.gameObject);if(image!=null)Destroy(image.gameObject);if(contact!=null)Destroy(contact.gameObject);}
    }
}
