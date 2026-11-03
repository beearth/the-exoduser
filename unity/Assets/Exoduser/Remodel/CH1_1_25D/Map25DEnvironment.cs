using System;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace Exoduser.UnityPort
{
    [Serializable] public sealed class Map25DCard { public string id,asset,layer,type;public float x,y,drawX,footY,width,height,rotation,sway;public float[] tint; }
    [Serializable] public sealed class Map25DTile {public string asset;public int x,y;}
    [Serializable] public sealed class Map25DReviewCamera {public string id;public float x,y;}
    [Serializable] public sealed class Map25DLight { public string id;public float x,y,radius,energy;public float[] color,flicker,pulse;public bool shadow; }
    [Serializable] public sealed class Map25DForeground {public string id,asset;public float x,y,width,height;}
    [Serializable] public sealed class Map25DRiver {public float x,y,width;}
    [Serializable] public sealed class Map25DShaft {public float x,y,width,height;}
    [Serializable] public sealed class Map25DBubble {public float x,y,size,phase;}
    [Serializable] public sealed class Map25DFrame {public string asset,mode;public float corner,width,height,roll,sway,mip,opacity,offsetX,offsetY,depth,anchorX;public float[] uv,tint;}
    [Serializable] public sealed class Map25DProjection {public Transform body,ground;public Map25DCard spec;}
    [Serializable] public sealed class Map25DLayout {
        public int[] window;public float[] bounds,hero,moonFill;public float postExposure,cameraYaw,cameraDistance,lookAhead,lookSide;
        public Map25DCard[] cards;public Map25DLight[] lights;public Map25DForeground[] foreground;
        public Map25DRiver[] riverPoints;
        public Map25DShaft[] shaftPoints;
        public Map25DBubble[] bubbleVents;
        public Map25DFrame[] frameCards;
        public Map25DTile[] groundTiles;public Map25DReviewCamera[] reviewCameras;public float chunkWorld,worldSize,tileSize,cameraPitch,floorBase,cardBase,treeBase,fernBase,waterBase,fogFootDensity;public float[] fogFootColor;public bool perspective,projectedCards,groundConnections,round4,round5,solidForms,pixelActors,graybox;public float cameraFov,heroScale,heroPixels1080,waterHeight,moonIntensity;
    }

    // Presentation only. Installation is explicit, source collision and simulation never belong to this component.
    [DefaultExecutionOrder(20000)]
    public sealed class Map25DEnvironment : MonoBehaviour
    {
        public Light HeroLamp;public Light[] AnimatedLights;public Map25DLight[] Specs;public Material Water;
        public Terrain HeightSurface;public Camera Viewer;public Transform Hero;public Volume Tone;
        public bool Configured {get;private set;}
        public Action<float> Reframe;
        public bool ReviewLightsOff;
        public bool Round3 {get;private set;}
        public TextAsset EmbeddedLayout;public Map25DLayout Recipe {get;private set;}
        public string ReviewLayoutPath {get;private set;}
        public Texture2D WalkMask;public Map25DProjection[] ProjectedProps;
        readonly System.Collections.Generic.Dictionary<string,float> cardFeet=new System.Collections.Generic.Dictionary<string,float>();
        float CardFoot(Map25DCard c){float v;if(cardFeet.TryGetValue(c.asset,out v))return v;var t=Resources.Load<Texture2D>("Map25D/Art/"+c.asset);v=0;if(t!=null&&t.isReadable){var a=t.GetPixels32();int first=t.height;for(int y=0;y<t.height;y++){bool hit=false;for(int x=0;x<t.width;x++)if(a[y*t.width+x].a>20){hit=true;break;}if(hit){first=y;break;}}v=first<t.height?first/(float)t.height:0;}cardFeet[c.asset]=v;return v;}
        float CardGround(float x,float z){RaycastHit hit;if(Physics.Raycast(new Vector3(x,60,z),Vector3.down,out hit,120,1<<28,QueryTriggerInteraction.Ignore))return hit.point.y;if(HeightSurface!=null)return HeightSurface.SampleHeight(new Vector3(x,0,z))+HeightSurface.transform.position.y;return 0;}
        float cameraYaw;RenderPipelineAsset round4OriginalPipeline;
        public float CameraDistance {get;private set;} public float LookAhead {get;private set;} public float LookSide {get;private set;}
        Material actorContact;Shader originalActorContact;
        readonly System.Collections.Generic.List<Transform> frames=new System.Collections.Generic.List<Transform>();
        Map25DFrame[] frameSpecs;
        public void Configure(Camera camera)
        {
            Viewer=camera;NativeRemodel3D.Ground=HeightSurface;
            string json=(EmbeddedLayout!=null?EmbeddedLayout:Resources.Load<TextAsset>("Map25D/layout")).text;var args=Environment.GetCommandLineArgs();int review=Array.IndexOf(args,"--map25d-review-layout");if(review>=0&&review+1<args.Length){ReviewLayoutPath=args[review+1];json=System.IO.File.ReadAllText(ReviewLayoutPath);Debug.Log("[Map25D] Explicit review recipe "+ReviewLayoutPath);}var layout=JsonUtility.FromJson<Map25DLayout>(json);Recipe=layout;if(layout.round4){round4OriginalPipeline=QualitySettings.renderPipeline;QualitySettings.renderPipeline=Resources.Load<UniversalRenderPipelineAsset>("Map25D/R4Pipeline");}var vents=new Vector4[8];
            Round3=layout.round5||layout.groundTiles!=null&&layout.groundTiles.Length==64;
            var fill=layout.moonFill??new[]{0f,0f,0f};Shader.SetGlobalVector("_Map25DMoonFill",new Vector4(fill[0],fill[1],fill[2],0));
            if(layout.bubbleVents!=null)for(int i=0;i<Mathf.Min(8,layout.bubbleVents.Length);i++){var v=layout.bubbleVents[i];vents[i]=new Vector4(v.x/100,-v.y/100,v.phase,v.size/100);}
            Shader.SetGlobalVectorArray("_Map25DBubbles",vents);
            var path=new Vector4[8];for(int i=0;i<Mathf.Min(8,layout.riverPoints.Length);i++){var p=layout.riverPoints[i];path[i]=new Vector4(p.x/100,-p.y/100,p.width/100,0);}Shader.SetGlobalVectorArray("_Map25DWaterPath",path);if(WalkMask!=null)Shader.SetGlobalTexture("_Map25DWalkMask",WalkMask);
            frameSpecs=layout.frameCards;cameraYaw=layout.cameraYaw;CameraDistance=layout.cameraDistance>0?layout.cameraDistance:NativeRemodelCamera.Distance;LookAhead=layout.lookAhead>0?layout.lookAhead:NativeRemodelCamera.TargetOffset.z;LookSide=layout.lookSide;
            if(frameSpecs!=null)foreach(var frame in frameSpecs){
                var go=GameObject.CreatePrimitive(PrimitiveType.Quad);go.name="Map25D peripheral branch "+frame.corner;Destroy(go.GetComponent<Collider>());go.transform.SetParent(camera.transform,false);go.transform.localScale=new Vector3(frame.width,frame.height,1);go.transform.localRotation=Quaternion.Euler(0,0,frame.roll);
                var mat=new Material(Resources.Load<Shader>("Map25D/Painted"));mat.SetTexture("_MainTex",Resources.Load<Texture2D>("Map25D/Art/"+frame.asset));mat.SetTexture("_NormalTex",Resources.Load<Texture2D>("Map25D/Art/"+frame.asset+"_normal"));var color=frame.tint??new[]{.10f,.15f,.20f};mat.SetColor("_Color",new Color(color[0],color[1],color[2],frame.opacity>0?frame.opacity:1));mat.SetFloat("_Frame",frame.mode=="left"?6:frame.mode=="canopy"?5:frame.mode=="right"?(frame.depth>8.3f?4:2):frame.mode=="top"?3:1);mat.SetFloat("_Sway",frame.sway);mat.SetFloat("_Blur",frame.mip>0?frame.mip:3);mat.SetFloat("_ZWrite",0);mat.SetVector("_UVRect",new Vector4(frame.uv[0],frame.uv[1],frame.uv[2],frame.uv[3]));mat.renderQueue=2900;
                var renderer=go.GetComponent<MeshRenderer>();renderer.sharedMaterial=mat;renderer.shadowCastingMode=ShadowCastingMode.Off;renderer.receiveShadows=false;frames.Add(go.transform);
            }
            camera.allowHDR=true;var extra=camera.GetUniversalAdditionalCameraData();extra.renderPostProcessing=true;extra.requiresDepthTexture=true;
            if(layout.groundTiles==null&&Water!=null){var reflection=gameObject.AddComponent<A2RiverReflection>();reflection.Viewer=camera;reflection.Surface=Water;reflection.Height=layout.round5?layout.waterHeight:-.55f;}
            var camp=Array.Find(layout.lights,l=>l.id=="camp_fire_0");var fire=camp!=null?new Vector3(camp.x/100,.55f,-camp.y/100):new Vector3(18.2f,.55f,-40.1f);
            // No point particles: the review forbids residual bright specks. Flame light and continuous mist move instead.
            foreach(var renderer in GetComponentsInChildren<MeshRenderer>()){var material=renderer.sharedMaterial;if(material==null||(material.shader.name!="EXODUSER/Map25D/WebPainting"&&material.shader.name!="EXODUSER/Map25D/R4Surface"))continue;float level=material.GetFloat("_Base");if(material.name.StartsWith("r3_ground_",StringComparison.Ordinal)&&layout.floorBase>0)level=layout.floorBase;else if(material.name.StartsWith("Existing web moat",StringComparison.Ordinal)&&layout.waterBase>0)level=layout.waterBase;else foreach(var c in layout.cards)if(renderer.name==c.id||renderer.name.StartsWith(c.id+" flat",StringComparison.Ordinal)){level=c.type=="vegetation"?(layout.fernBase>0?layout.fernBase:level):c.type=="boundary_tree"?(layout.treeBase>0?layout.treeBase:level):(layout.cardBase>0?layout.cardBase:level);break;}var block=new MaterialPropertyBlock();renderer.GetPropertyBlock(block);block.SetFloat("_Base",level);renderer.SetPropertyBlock(block);}
            foreach(var fog in GetComponentsInChildren<MeshRenderer>())if(fog.name=="Forest foot ribbon"){var block=new MaterialPropertyBlock();if(layout.fogFootDensity>0)block.SetFloat("_Density",layout.fogFootDensity);if(layout.fogFootColor!=null&&layout.fogFootColor.Length==4)block.SetColor("_Color",new Color(layout.fogFootColor[0],layout.fogFootColor[1],layout.fogFootColor[2],layout.fogFootColor[3]));fog.SetPropertyBlock(block);}
            if(ProjectedProps!=null)foreach(var prop in ProjectedProps)if(prop.ground!=null)prop.ground.gameObject.SetActive(layout.groundConnections&&prop.spec.type!="vegetation");
            if(GetComponent<Map25DContactShadows>()==null)gameObject.AddComponent<Map25DContactShadows>();Configured=true;
        }
        public void CullLights(Vector3 centre)
        {
            if(AnimatedLights==null)return;for(int i=0;i<AnimatedLights.Length;i++){int closer=0;float d=(AnimatedLights[i].transform.position-centre).sqrMagnitude;for(int j=0;j<AnimatedLights.Length;j++){float other=(AnimatedLights[j].transform.position-centre).sqrMagnitude;if(other<d||other==d&&j<i)closer++;}AnimatedLights[i].enabled=!ReviewLightsOff&&closer<7;}
        }
        void Motes(string name,int count,Vector3 position,Vector3 size,float lifetime,Color color,float diameter,float speed)
        {
            var go=new GameObject(name);go.transform.SetParent(transform,false);go.transform.position=position;go.layer=4;
            var particles=go.AddComponent<ParticleSystem>();particles.Stop(true,ParticleSystemStopBehavior.StopEmittingAndClear);particles.useAutoRandomSeed=false;particles.randomSeed=20261020;
            var main=particles.main;main.maxParticles=count;main.startLifetime=lifetime;main.startSpeed=speed;main.startSize=diameter;main.startColor=color;main.simulationSpace=ParticleSystemSimulationSpace.World;main.prewarm=true;main.loop=true;
            var emission=particles.emission;emission.rateOverTime=count/lifetime;var shape=particles.shape;shape.shapeType=ParticleSystemShapeType.Box;shape.scale=size;
            var velocity=particles.velocityOverLifetime;velocity.enabled=true;velocity.space=ParticleSystemSimulationSpace.World;velocity.x=speed*.25f;velocity.y=speed;velocity.z=0;
            var fade=particles.colorOverLifetime;fade.enabled=true;var gradient=new Gradient();gradient.SetKeys(new[]{new GradientColorKey(Color.white,0),new GradientColorKey(Color.white,1)},new[]{new GradientAlphaKey(0,0),new GradientAlphaKey(1,.2f),new GradientAlphaKey(.7f,.72f),new GradientAlphaKey(0,1)});fade.color=gradient;
            var renderer=particles.GetComponent<ParticleSystemRenderer>();renderer.sharedMaterial=new Material(Resources.Load<Shader>("Map25D/AmbientMote"));renderer.renderMode=ParticleSystemRenderMode.Billboard;renderer.shadowCastingMode=ShadowCastingMode.Off;particles.Play();
        }
        void LateUpdate()
        {
            float time=Time.time;
            if(Configured&&Reframe!=null)Reframe(cameraYaw);
            ReprojectCards();
            if(Configured&&actorContact==null){foreach(var r in FindObjectsByType<MeshRenderer>(FindObjectsInactive.Exclude))if(r.name.StartsWith("HD2D contact: ",StringComparison.Ordinal)&&r.sharedMaterial!=null){actorContact=r.sharedMaterial;originalActorContact=actorContact.shader;actorContact.shader=Resources.Load<Shader>("Map25D/FootContact");break;}}
            if(Viewer!=null)for(int i=0;i<frames.Count;i++){var f=frameSpecs[i];float depth=f.depth>0?f.depth:8,halfW=(Viewer.orthographic?1:depth)/Viewer.projectionMatrix.m00,halfH=(Viewer.orthographic?1:depth)/Viewer.projectionMatrix.m11;float width=f.width<0?halfW*2+2:f.width;frames[i].localScale=new Vector3(width,f.height,1);Vector3 pos;if(f.mode=="left")pos=new Vector3(-halfW*1.06f+f.offsetX,f.offsetY,depth);else if(f.mode=="right")pos=new Vector3((f.anchorX!=0?halfW*f.anchorX:halfW+width*.15f)+f.offsetX,f.offsetY,depth);else if(f.mode=="top"||f.mode=="canopy")pos=new Vector3(f.offsetX,halfH+f.height*.18f+f.offsetY,depth);else if(f.mode=="bottomLeft")pos=new Vector3(-halfW+.6f+f.offsetX,-halfH-.3f+f.offsetY,depth);else if(f.mode=="bottomRight")pos=new Vector3(halfW-.6f+f.offsetX,-halfH-.3f+f.offsetY,depth);else pos=new Vector3(f.corner*(halfW-.65f),-halfH+.40f,depth);frames[i].localPosition=pos;}
            if(AnimatedLights!=null)for(int i=0;i<AnimatedLights.Length;i++){
                var s=Specs[i];float phase=s.x*.0137f+s.y*.0091f,k=1;
                if(s.flicker!=null&&s.flicker.Length==2)k+=s.flicker[0]*(.65f*Mathf.Sin(time*s.flicker[1]*.3f+phase)+.35f*Mathf.Sin(time*s.flicker[1]*.49f+phase));
                if(s.pulse!=null&&s.pulse.Length==2)k+=s.pulse[0]*Mathf.Sin(time*s.pulse[1]+phase);
                AnimatedLights[i].intensity=s.energy*2.4f*Mathf.Max(.25f,k);
                if(s.id=="camp_fire_0")Shader.SetGlobalVector("_Map25DCampReflection",new Vector4(s.x/100,-s.y/100,ReviewLightsOff?0:AnimatedLights[i].intensity,0));
                if(s.id=="tree_glow_m_ctree15")Shader.SetGlobalVector("_Map25DPortalReflection",new Vector4(s.x/100,-s.y/100,ReviewLightsOff?0:AnimatedLights[i].intensity,0));
            }
            if(NativeGame.Instance!=null&&NativeGame.Instance.Simulation!=null){var p=NativeGame.Instance.Simulation.Player;Shader.SetGlobalVector("_Map25DHero",new Vector4(p.X/100,0,-p.Y/100,1));if(HeroLamp!=null)HeroLamp.transform.position=NativeRemodel3D.Point(p.X,p.Y)+new Vector3(-.22f,.6f,-.5f);}
            if(Configured&&Viewer!=null)CullLights(Viewer.transform.position+Viewer.transform.forward*12);
        }
        void ReprojectCards(){if(Viewer==null)return;var forward=Viewer.transform.forward;var up=Viewer.transform.up;var groundForward=new Vector3(forward.x,0,forward.z).normalized;var right=Vector3.Cross(Vector3.up,groundForward);Shader.SetGlobalVector("_Map25DViewForward",new Vector4(forward.x,forward.y,forward.z,Viewer.orthographic?1:0));if(ProjectedProps==null)return;foreach(var entry in ProjectedProps){var c=entry.spec;if(Recipe!=null&&Recipe.round4){if(entry.body!=null){float groundY=CardGround(c.drawX/100,-c.footY/100)-.04f-CardFoot(c)*c.height/100;entry.body.SetPositionAndRotation(new Vector3(c.drawX/100,groundY,-c.footY/100),Quaternion.Euler(0,Viewer.transform.eulerAngles.y,0));entry.body.localScale=new Vector3(1,c.type=="vegetation"?Mathf.Min(1,(c.layer=="low"?1.3f:.9f)/(c.height/100)):1,1);}continue;}float originalH=c.height/100,h=originalH*(Viewer.orthographic?Mathf.Max(.1f,-forward.y):1);var anchor=new Vector3(c.x/100,0,-c.y/100)+right*((c.drawX-c.x)/100)-groundForward*((c.footY-c.height*.5f-c.y)/100);if(c.type=="vegetation")h=Mathf.Min(.9f,h);var ray=Viewer.orthographic?forward:(anchor-Viewer.transform.position).normalized;float lift=h*.5f*up.y/Mathf.Max(.05f,-ray.y);var root=anchor-ray*lift-up*h*.5f;if(c.type=="vegetation")root=new Vector3(c.drawX/100,0,-c.footY/100);foreach(var tr in new[]{entry.body,entry.ground})if(tr!=null){tr.SetPositionAndRotation(root,Viewer.transform.rotation);tr.localScale=new Vector3(1,h/originalH,1);var renderer=tr.GetComponent<MeshRenderer>();var block=new MaterialPropertyBlock();renderer.GetPropertyBlock(block);block.SetVector("_SwayAnchor",new Vector4(root.x,0,root.z,1));renderer.SetPropertyBlock(block);}}}
        public void SetPresentationActive(bool on){if(Recipe!=null&&Recipe.round4)QualitySettings.renderPipeline=on?Resources.Load<UniversalRenderPipelineAsset>("Map25D/R4Pipeline"):round4OriginalPipeline;foreach(var frame in frames)if(frame!=null)frame.gameObject.SetActive(on);if(actorContact!=null&&originalActorContact!=null)actorContact.shader=on?Resources.Load<Shader>("Map25D/FootContact"):originalActorContact;}
        void OnDestroy(){if(Recipe!=null&&Recipe.round4)QualitySettings.renderPipeline=round4OriginalPipeline;if(actorContact!=null&&originalActorContact!=null)actorContact.shader=originalActorContact;}
    }
}
