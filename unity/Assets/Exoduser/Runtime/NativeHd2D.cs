using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // 표현 정책만 소유한다. Core·세이브·입력은 변경하지 않는다.
    public static class NativeHd2D
    {
        public static readonly bool Enabled = Array.IndexOf(Environment.GetCommandLineArgs(), "--legacy-models") < 0;
        [Serializable] sealed class Foot { public string texture; public int x, y; public float bottom; }
        [Serializable] sealed class Feet { public Foot[] feet; }
        static readonly Dictionary<Sprite,float> footCache = new Dictionary<Sprite,float>();
        static readonly Dictionary<string, float> bottoms = new Dictionary<string, float>();
        static readonly Dictionary<SpriteRenderer, int> actors = new Dictionary<SpriteRenderer, int>();
        static readonly Dictionary<SpriteRenderer,SpriteRenderer> overlayBases = new Dictionary<SpriteRenderer,SpriteRenderer>();
        static readonly Dictionary<SpriteRenderer,float> contactWidths = new Dictionary<SpriteRenderer,float>();
        static readonly HashSet<SpriteRenderer> pivotFeet = new HashSet<SpriteRenderer>();
        static Material lit, contact;
        static readonly MaterialPropertyBlock shadowBlock = new MaterialPropertyBlock();
        static readonly Dictionary<SpriteRenderer, MeshRenderer> shadows = new Dictionary<SpriteRenderer, MeshRenderer>();
        static bool loaded;
        static readonly List<SpriteRenderer> deadActors = new List<SpriteRenderer>();
        public static bool IsActor(SpriteRenderer sr) { return actors.TryGetValue(sr,out var frame)&&frame==Time.frameCount; }
        public static void Actor(SpriteRenderer sr,bool pivotIsFoot=false,float contactWidth=0f)
        {
            if (!Enabled || sr == null) return;
            actors[sr] = Time.frameCount;contactWidths[sr]=contactWidth;overlayBases.Remove(sr);
            if(pivotIsFoot)pivotFeet.Add(sr);else pivotFeet.Remove(sr);
            if (sr.sprite != null) sr.sprite.texture.filterMode = FilterMode.Point;
            if (lit == null)
            {
                var shader = Resources.Load<Shader>("Shaders/HD2DSpriteLit");
                if (shader == null) throw new InvalidOperationException("HD2D sprite shader missing");
                lit = new Material(shader) { name = "HD2D pixel actors" };
            }
            sr.sharedMaterial = lit;
            if(actors.Count>2048)PruneActors();
        }
        public static void Overlay(SpriteRenderer overlay,SpriteRenderer body)
        {
            Actor(overlay);if(Enabled&&overlay!=null&&body!=null)overlayBases[overlay]=body;
        }
        static void RemoveActor(SpriteRenderer sr)
        {
            if(shadows.TryGetValue(sr,out var shadow)&&shadow!=null)
            {
                if(Application.isPlaying)UnityEngine.Object.Destroy(shadow.gameObject);else UnityEngine.Object.DestroyImmediate(shadow.gameObject);
            }
            actors.Remove(sr);contactWidths.Remove(sr);pivotFeet.Remove(sr);overlayBases.Remove(sr);shadows.Remove(sr);
        }
        static void PruneActors()
        {
            deadActors.Clear();foreach(var actor in actors.Keys)if(actor==null)deadActors.Add(actor);
            foreach(var actor in deadActors)RemoveActor(actor);deadActors.Clear();
        }
        public static void BeginProjection()
        {
            PruneActors();foreach(var shadow in shadows.Values)if(shadow!=null)shadow.enabled=false;
        }
        public static void ProjectFlatActors(Camera camera)
        {
            BeginProjection();
            foreach(var pair in actors)if(pair.Key!=null&&pair.Value==Time.frameCount&&pair.Key.enabled&&pair.Key.gameObject.activeInHierarchy)
                ProjectActor(pair.Key,camera,pair.Key.transform.rotation.eulerAngles.z,false);
        }
        public static void ProjectActor(SpriteRenderer sr,Camera camera,float roll,bool ground3D=true)
        {
            var anchor=SnapAnchor(camera,sr.transform.position);
            var rotation=camera.transform.rotation*Quaternion.Euler(0,0,roll);
            var footSource=overlayBases.TryGetValue(sr,out var body)&&body!=null?body:sr;
            float below=(pivotFeet.Contains(footSource)?0:FootLift(footSource.sprite))*Mathf.Abs(footSource.transform.lossyScale.y);
            sr.transform.SetPositionAndRotation(anchor+camera.transform.up*below,rotation);
            if(footSource!=sr)return; // 원본보행은 부분 overlay다. 같은발선·그림자1개를 공유한다.
            if(!shadows.TryGetValue(sr,out var shadow)||shadow==null)
            {
                var go=GameObject.CreatePrimitive(PrimitiveType.Quad);go.name="HD2D contact: "+sr.name;
                var collider=go.GetComponent<Collider>();
                if(Application.isPlaying)UnityEngine.Object.Destroy(collider);else UnityEngine.Object.DestroyImmediate(collider);
                go.transform.SetParent(sr.transform.parent,false);
                shadow=go.GetComponent<MeshRenderer>();
                if(contact==null)contact=new Material(Resources.Load<Shader>("Shaders/HD2DContact")){name="HD2D contact shadow"};
                shadow.sharedMaterial=contact;shadows[sr]=shadow;
            }
            shadow.enabled=true;
            shadowBlock.Clear();shadowBlock.SetFloat("_Opacity",sr.color.a);shadow.SetPropertyBlock(shadowBlock);
            shadow.sortingOrder=sr.sortingOrder-1;
            shadow.transform.SetPositionAndRotation(anchor+(ground3D?Vector3.up:Vector3.forward)*.018f,ground3D?Quaternion.Euler(90,0,0):Quaternion.identity);
            float width=contactWidths.TryGetValue(sr,out var fixedWidth)&&fixedWidth>0?fixedWidth:sr.sprite.rect.width/sr.sprite.pixelsPerUnit*Mathf.Abs(sr.transform.lossyScale.x)*.5f;
            width=Mathf.Clamp(width,.24f,2.8f);
            shadow.transform.localScale=new Vector3(width,width*.6f,1);

        }
        public static float FootLift(Sprite sprite)
        {
            if(footCache.TryGetValue(sprite,out var cached))return cached;
            if (!loaded)
            {
                var json = Resources.Load<TextAsset>("Data/hd2d_feet");
                if (json == null) throw new InvalidOperationException("HD2D feet metadata missing");
                var data = JsonUtility.FromJson<Feet>(json.text);
                foreach (var f in data.feet) bottoms[f.texture + ":" + f.x + ":" + f.y] = f.bottom;
                loaded = true;
            }
            var rect = sprite.rect;
            float bottom;
            if(!bottoms.TryGetValue(sprite.texture.name+":"+(int)rect.x+":"+(int)rect.y,out bottom))bottom=0;
            float lift=(sprite.pivot.y-bottom)/sprite.pixelsPerUnit;footCache[sprite]=lift;return lift;
        }
        public static Vector3 SnapAnchor(Camera camera, Vector3 anchor)
        {
            if (camera == null || camera.pixelHeight <= 0) return anchor;
            var screen = camera.WorldToScreenPoint(anchor);
            screen.x = Mathf.Round(screen.x); screen.y = Mathf.Round(screen.y);
            return camera.ScreenToWorldPoint(screen);
        }
    }
}
