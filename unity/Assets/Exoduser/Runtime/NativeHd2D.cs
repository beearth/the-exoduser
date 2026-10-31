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
        static readonly Dictionary<string, float> bottoms = new Dictionary<string, float>();
        static readonly Dictionary<SpriteRenderer, int> actors = new Dictionary<SpriteRenderer, int>();
        static readonly Dictionary<SpriteRenderer,float> contactWidths = new Dictionary<SpriteRenderer,float>();
        static readonly HashSet<SpriteRenderer> pivotFeet = new HashSet<SpriteRenderer>();
        static Material lit, contact;
        static readonly Dictionary<SpriteRenderer, MeshRenderer> shadows = new Dictionary<SpriteRenderer, MeshRenderer>();
        static bool loaded;
        public static bool IsActor(SpriteRenderer sr) { return actors.TryGetValue(sr,out var frame)&&frame==Time.frameCount; }
        public static void Actor(SpriteRenderer sr,bool pivotIsFoot=false,float contactWidth=0f)
        {
            if (!Enabled || sr == null) return;
            actors[sr] = Time.frameCount;contactWidths[sr]=contactWidth;
            if(pivotIsFoot)pivotFeet.Add(sr);else pivotFeet.Remove(sr);
            if (sr.sprite != null) sr.sprite.texture.filterMode = FilterMode.Point;
            if (lit == null)
            {
                var shader = Resources.Load<Shader>("Shaders/HD2DSpriteLit");
                if (shader == null) throw new InvalidOperationException("HD2D sprite shader missing");
                lit = new Material(shader) { name = "HD2D pixel actors" };
            }
            sr.sharedMaterial = lit;
            if (actors.Count > 2048)
            {
                var dead = new List<SpriteRenderer>();
                foreach (var pair in actors) if (pair.Key == null) dead.Add(pair.Key);
                foreach (var r in dead) actors.Remove(r);
            }
        }
        public static void BeginProjection()
        {
            var dead=new List<SpriteRenderer>();
            foreach(var pair in shadows)
            {
                if(pair.Value!=null)pair.Value.enabled=false;
                if(pair.Key==null){if(pair.Value!=null){if(Application.isPlaying)UnityEngine.Object.Destroy(pair.Value.gameObject);else UnityEngine.Object.DestroyImmediate(pair.Value.gameObject);}dead.Add(pair.Key);}
            }
            foreach(var key in dead){shadows.Remove(key);actors.Remove(key);pivotFeet.Remove(key);contactWidths.Remove(key);}
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
            float below=(pivotFeet.Contains(sr)?0:FootLift(sr.sprite))*Mathf.Abs(sr.transform.lossyScale.y);
            sr.transform.SetPositionAndRotation(anchor+rotation*Vector3.up*below,rotation);
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
            shadow.sortingOrder=sr.sortingOrder-1;
            shadow.transform.SetPositionAndRotation(anchor+(ground3D?Vector3.up:Vector3.forward)*.018f,ground3D?Quaternion.Euler(90,0,0):Quaternion.identity);
            float width=contactWidths.TryGetValue(sr,out var fixedWidth)&&fixedWidth>0?fixedWidth:sr.sprite.rect.width/sr.sprite.pixelsPerUnit*Mathf.Abs(sr.transform.lossyScale.x)*.5f;
            width=Mathf.Clamp(width,.24f,2.8f);
            shadow.transform.localScale=new Vector3(width,width*.6f,1);
            if(shadows.Count>2048){var dead=new List<SpriteRenderer>();foreach(var pair in shadows)if(pair.Key==null){if(pair.Value!=null)UnityEngine.Object.Destroy(pair.Value.gameObject);dead.Add(pair.Key);}foreach(var key in dead)shadows.Remove(key);}
        }
        public static float FootLift(Sprite sprite)
        {
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
            if (bottoms.TryGetValue(sprite.texture.name + ":" + (int)rect.x + ":" + (int)rect.y, out bottom))
                return (sprite.pivot.y - bottom) / sprite.pixelsPerUnit;
            return sprite.pivot.y / sprite.pixelsPerUnit;
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
