using System;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.Rendering.Universal;


namespace Exoduser.UnityPort
{
    // Simulation/animation still write the original actors. Only the final draw is moved
    // to an orthographic camera, after perspective projection and integer pixel fitting.
    [DefaultExecutionOrder(30000)]
    public sealed class R4PixelActors : MonoBehaviour
    {
        const int DrawLayer=31;
        bool drawing=true;Camera world,overlay;SpriteRenderer hero;int oldMask;Mesh quad;bool nearContactPriority;float heroPixels1080;Light moon;
        readonly Dictionary<SpriteRenderer,Entry> entries=new Dictionary<SpriteRenderer,Entry>();
        readonly List<Entry> ordered=new List<Entry>();float nextScan;
        sealed class Entry {public SpriteRenderer source;public MeshRenderer image;public Material material;public MeshRenderer contact;public bool originalHidden,remaster;public float depth,ratio,texelFactor;public int step,divisor;public Vector2 logical,origin;public Vector3 foot;public Texture2D atlas;public Rect rect;}
        [Serializable] public sealed class Metric {public string name,texture,textureFilter,originalTexture;public bool hero,worldDrawDisabled,remaster;public Color tint;public Vector2 sourceRect,originalSourceRect,logicalSize,screenOrigin,textureSize;public Rect atlasRect;public int integerScale,sourceDivisor;public float perspectiveDepth,sizeRatio,virtualPixelsPerUnit,registrationFactor;public Vector3 worldFoot;}
        [Serializable] public sealed class Receipt {public string method="perspective positions / orthographic camera / native source texels and integer destination / near-contact hero visibility bias / world depth occlusion";public int width,height;public bool depthTexture,heroNearContactPriority;public float heroFootDepth,heroHeadDepth,heroFootDepthFlipped,heroHeadDepthFlipped;public List<Metric> actors=new List<Metric>();}
        public void Configure(Camera camera,SpriteRenderer player,float referencePixels1080=0)
        {
            world=camera;hero=player;heroPixels1080=referencePixels1080;oldMask=world.cullingMask;R4WorldDepth.Viewer=world;
            foreach(var light in FindObjectsByType<Light>(FindObjectsInactive.Exclude))if(light.enabled&&light.type==LightType.Directional&&light.name=="Cold moon")moon=light;
            foreach(var r in FindObjectsByType<Renderer>(FindObjectsInactive.Exclude))if(r.gameObject.layer==DrawLayer)throw new InvalidOperationException("R4 actor overlay layer already used");
            world.cullingMask&=~(1<<DrawLayer);
            var go=new GameObject("R4 integer pixel orthographic actor camera");go.transform.SetParent(transform,false);overlay=go.AddComponent<Camera>();overlay.orthographic=true;overlay.nearClipPlane=.1f;overlay.farClipPlane=20;overlay.cullingMask=1<<DrawLayer;overlay.allowHDR=false;overlay.allowMSAA=false;overlay.clearFlags=CameraClearFlags.Depth;
            overlay.transform.SetPositionAndRotation(new Vector3(0,0,-10),Quaternion.identity);
            var data=overlay.GetUniversalAdditionalCameraData();data.renderType=CameraRenderType.Overlay;data.renderPostProcessing=false;data.SetRenderer(1);
            world.GetUniversalAdditionalCameraData().cameraStack.Add(overlay);
            quad=new Mesh{name="R4 integer pixel quad"};quad.vertices=new[]{Vector3.zero,Vector3.right,Vector3.one-Vector3.forward,Vector3.up};quad.uv=new[]{Vector2.zero,Vector2.right,Vector2.one,Vector2.up};quad.colors=new[]{Color.white,Color.white,Color.white,Color.white};quad.triangles=new[]{0,1,2,0,2,3};quad.RecalculateBounds();Scan();
        }
        void Scan()
        {
            foreach(var sr in FindObjectsByType<SpriteRenderer>(FindObjectsInactive.Exclude))if(NativeHd2D.IsActor(sr)&&!entries.ContainsKey(sr)){
                var go=new GameObject("pixel: "+sr.name);go.layer=DrawLayer;go.transform.SetParent(transform,false);go.AddComponent<MeshFilter>().sharedMesh=quad;var image=go.AddComponent<MeshRenderer>();image.shadowCastingMode=UnityEngine.Rendering.ShadowCastingMode.Off;image.receiveShadows=false;
                var material=new Material(Resources.Load<Shader>("Map25D/R4PixelActor")){name="R4 integer "+sr.name};image.sharedMaterial=material;
                MeshRenderer contact=null;if(sr.transform.parent!=null)foreach(var candidate in sr.transform.parent.GetComponentsInChildren<MeshRenderer>())if(candidate.name=="HD2D contact: "+sr.name){contact=candidate;break;}
                entries.Add(sr,new Entry{source=sr,image=image,material=material,contact=contact,originalHidden=sr.forceRenderingOff});
            }
            nextScan=Time.unscaledTime+.25f;
        }
        void LateUpdate()
        {
            if(world==null||!drawing)return;if(Time.unscaledTime>=nextScan)Scan();
            overlay.transform.position=new Vector3(Screen.width*.5f,Screen.height*.5f,-10);overlay.orthographicSize=Screen.height*.5f;overlay.aspect=(float)Screen.width/Screen.height;ordered.Clear();
            foreach(var pair in entries){var e=pair.Value;var sr=e.source;if(sr==null){if(e.image!=null)e.image.enabled=false;continue;}
                bool visible=sr.enabled&&sr.gameObject.activeInHierarchy&&sr.sprite!=null;sr.forceRenderingOff=true;e.image.enabled=visible;if(!visible)continue;
                var sprite=sr.sprite;var scale=sr.transform.lossyScale;
                Vector3 foot=sr.transform.position-world.transform.up*(NativeHd2D.FootLift(sprite)*Mathf.Abs(scale.y));
                if(e.contact==null&&sr.transform.parent!=null){var tr=sr.transform.parent.Find("HD2D contact: "+sr.name);if(tr!=null)e.contact=tr.GetComponent<MeshRenderer>();}
                if(e.contact!=null){Vector3 registeredFoot;foot=Map25DContactShadows.TryGetFoot(e.contact,out registeredFoot)?registeredFoot:e.contact.transform.position-Vector3.up*.018f;}
                var projected=world.WorldToScreenPoint(foot);e.foot=foot;e.depth=projected.z;
                if(projected.z<=0){e.image.enabled=false;continue;}
                float pixelsPerUnit=Screen.height/(2*Mathf.Tan(world.fieldOfView*.5f*Mathf.Deg2Rad)*projected.z);
                float oldHeight=sprite.rect.height/sprite.pixelsPerUnit*Mathf.Abs(scale.y)*pixelsPerUnit;
                // CTO 03:40: every original texel survives, including 256px enemies.
                // Never quantize a source atlas to a smaller logical raster. Integer
                // screen magnification is chosen from the native source dimensions.
                bool isHero=sr==hero;const int divisor=1;var atlas=sprite.texture;var rect=sprite.textureRect;Texture2D candidateAtlas=null;Rect candidateRect=default;int a64Offset=0;bool remaster=isHero&&Map25DHeroRemaster.TryGet(sprite,out candidateAtlas,out candidateRect,out a64Offset);float texelFactor=remaster?2:1;if(remaster){atlas=candidateAtlas;rect=candidateRect;}
                int step=Mathf.Max(1,Mathf.RoundToInt(oldHeight*(isHero?1.4f:1)/sprite.textureRect.height));
                // Stable HD-2D reference: original 2x game texels -> 3x at1080p.
                // Perspective moves the foot, but never inflates the source pixels.
                if(isHero&&heroPixels1080>0){int originalStep=Mathf.Max(1,Mathf.FloorToInt(heroPixels1080*Screen.height/1080f+.5f));if(Map25DHeroRemaster.Requested)originalStep=Mathf.Max(2,2*Mathf.RoundToInt(originalStep/2f));step=Mathf.Max(1,originalStep/(int)texelFactor);}
                var size=rect.size;
                float footInSource=sprite.pivot.y-Vector3.Dot(sr.transform.position-foot,world.transform.up)/Mathf.Max(.00001f,Mathf.Abs(scale.y))*sprite.pixelsPerUnit;
                var offset=sprite.textureRectOffset;float pivotX=(sprite.pivot.x-offset.x)*texelFactor/divisor,footY=(footInSource-offset.y)*texelFactor/divisor+(remaster?a64Offset:0);if(sr.flipX)pivotX=size.x-pivotX;if(sr.flipY)footY=size.y-footY;
                var origin=new Vector2(Mathf.Round(projected.x-pivotX*step),Mathf.Round(projected.y-footY*step));
                e.image.transform.localPosition=new Vector3(origin.x,origin.y,0);e.image.transform.localScale=new Vector3(size.x*step,size.y*step,1);e.material.SetTexture("_MainTex",atlas);
                float u=rect.x/atlas.width,v=rect.y/atlas.height,uw=rect.width/atlas.width,vh=rect.height/atlas.height;if(sr.flipX){u+=uw;uw=-uw;}if(sr.flipY){v+=vh;vh=-vh;}
                e.material.SetVector("_AtlasRect",new Vector4(u,v,uw,vh));e.material.SetVector("_LogicalSize",new Vector4(size.x,size.y,0,0));e.material.SetColor("_Color",sr.color);e.material.SetFloat("_ActorDepth",projected.z);e.material.SetFloat("_Hero",isHero?1:0);
                var moonDirection=moon!=null?-moon.transform.forward:Vector3.right;var fire=Shader.GetGlobalVector("_Map25DCampReflection");var fireDirection=new Vector3(fire.x,0,fire.y)-foot;var rim=new Vector4(Vector3.Dot(moonDirection,world.transform.right),Vector3.Dot(moonDirection,world.transform.up),Vector3.Dot(fireDirection,world.transform.right),Vector3.Dot(fireDirection,world.transform.up));e.material.SetVector("_RimDirections",rim);
                e.step=step;e.divisor=divisor;e.logical=size;e.origin=origin;e.ratio=size.y*step/Mathf.Max(1,oldHeight);e.remaster=remaster;e.texelFactor=texelFactor;e.atlas=atlas;e.rect=rect;ordered.Add(e);
            }
            ordered.Sort((a,b)=>{int depth=b.depth.CompareTo(a.depth);return Mathf.Abs(a.depth-b.depth)>.001f?depth:a.source.sortingOrder.CompareTo(b.source.sortingOrder);});
            // Native-resolution enemies now have their full painted silhouette. At
            // physical contact their bodies may cover the entire 48px hero. Keep
            // ordinary far/near sorting, but draw the hero after touching enemies.
            // Environment occlusion still uses the world's depth in the shader.
            nearContactPriority=false;int heroIndex=ordered.FindIndex(e=>e.source==hero);
            if(heroIndex>=0){var h=ordered[heroIndex];int lastContact=heroIndex;for(int i=heroIndex+1;i<ordered.Count;i++){var delta=ordered[i].foot-h.foot;delta.y=0;if(delta.sqrMagnitude<1.4f*1.4f&&Mathf.Abs(ordered[i].depth-h.depth)<1.1f)lastContact=i;}if(lastContact>heroIndex){ordered.RemoveAt(heroIndex);ordered.Insert(lastContact,h);nearContactPriority=true;}}
            for(int i=0;i<ordered.Count;i++)ordered[i].image.sortingOrder=i;
        }
        public void SetDrawing(bool on){drawing=on;if(overlay!=null)overlay.enabled=on;if(world!=null){var stack=world.GetUniversalAdditionalCameraData().cameraStack;if(on&&!stack.Contains(overlay))stack.Add(overlay);if(!on)stack.Remove(overlay);}foreach(var e in entries.Values){if(e.image!=null)e.image.enabled=on;if(!on&&e.source!=null)e.source.forceRenderingOff=e.originalHidden;}}
        public void WriteReceipt(string path)
        {
            var receipt=new Receipt{width=Screen.width,height=Screen.height,depthTexture=R4WorldDepth.Texture!=null,heroNearContactPriority=nearContactPriority};
            foreach(var e in ordered)receipt.actors.Add(new Metric{name=e.source.name,texture=e.atlas.name,tint=e.source.color,originalTexture=e.source.sprite.texture.name,textureFilter=e.atlas.filterMode.ToString(),textureSize=new Vector2(e.atlas.width,e.atlas.height),atlasRect=e.rect,hero=e.source==hero,remaster=e.remaster,worldDrawDisabled=e.source.forceRenderingOff,sourceRect=e.rect.size,originalSourceRect=e.source.sprite.textureRect.size,logicalSize=e.logical,screenOrigin=e.origin,integerScale=e.step,sourceDivisor=e.divisor,perspectiveDepth=e.depth,sizeRatio=e.ratio,virtualPixelsPerUnit=e.source.sprite.pixelsPerUnit*e.texelFactor,registrationFactor=e.texelFactor,worldFoot=e.foot});
            if(R4WorldDepth.Texture!=null&&entries.TryGetValue(hero,out var h)){var foot=world.WorldToScreenPoint(h.foot);float head=foot.y+h.logical.y*h.step*.50f;receipt.heroFootDepth=DepthSample(foot.x,foot.y);receipt.heroHeadDepth=DepthSample(foot.x,head);receipt.heroFootDepthFlipped=DepthSample(foot.x,Screen.height-foot.y);receipt.heroHeadDepthFlipped=DepthSample(foot.x,Screen.height-head);}
            File.WriteAllText(path,JsonUtility.ToJson(receipt,true));
        }
        static float DepthSample(float x,float y){var previous=RenderTexture.active;RenderTexture.active=R4WorldDepth.Texture.rt;var tex=new Texture2D(1,1,TextureFormat.RFloat,false,true);tex.ReadPixels(new Rect(Mathf.Clamp(Mathf.RoundToInt(x),0,Screen.width-1),Mathf.Clamp(Mathf.RoundToInt(y),0,Screen.height-1),1,1),0,0);tex.Apply();float depth=tex.GetPixel(0,0).r;Destroy(tex);RenderTexture.active=previous;return depth;}
        void OnDestroy(){if(R4WorldDepth.Viewer==world)R4WorldDepth.Viewer=null;if(world!=null){world.cullingMask=oldMask;world.GetUniversalAdditionalCameraData().cameraStack.Remove(overlay);}foreach(var e in entries.Values){if(e.source!=null)e.source.forceRenderingOff=e.originalHidden;if(e.material!=null)Destroy(e.material);}if(quad!=null)Destroy(quad);}
    }
}
