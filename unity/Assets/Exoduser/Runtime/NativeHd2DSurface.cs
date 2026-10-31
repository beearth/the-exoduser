using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Exoduser.UnityPort
{
    // UNAPPLIED phase 2 prototype. Explicit source registration; no gameplay/terrain ownership.
    public static class NativeHd2DSurface
    {
        sealed class Entry
        {
            public SpriteRenderer Source; public bool Additive, PreviousForceOff, Projected;
            public int Frame,Revision=-1;public Vector3 Position,Scale;public Quaternion Rotation;public Vector2 Size,Pivot;public bool FlipX,FlipY;public float Epsilon,Ppu;public Terrain Ground;public Sprite UvSprite;public Mesh Mesh; public MeshRenderer Renderer; public GameObject Object;
            public readonly MaterialPropertyBlock Block=new MaterialPropertyBlock();
            public readonly List<Vector3> Vertices=new List<Vector3>(); public readonly List<Vector2> Uv=new List<Vector2>();
            public readonly List<int> Triangles=new List<int>(); public readonly List<float> U=new List<float>(),V=new List<float>();
        }
        static readonly Dictionary<SpriteRenderer,Entry> entries=new Dictionary<SpriteRenderer,Entry>();
        static readonly List<SpriteRenderer> dead=new List<SpriteRenderer>();
        static readonly Dictionary<int,Material> materials=new Dictionary<int,Material>();
        static bool missingShaderWarned;static int revision,planeFrame=-1;static Camera planeCamera;static readonly Plane[] planes=new Plane[6];
        public static int HeightQueries{get;private set;}public static int GeometryRebuilds{get;private set;}
        public static void Invalidate(){revision++;}
        public static void DisposeAll(){foreach(var e in entries.Values)Release(e);entries.Clear();foreach(var m in materials.Values)Destroy(m);materials.Clear();missingShaderWarned=false;}
        static readonly int MainTex=Shader.PropertyToID("_MainTex"),Tint=Shader.PropertyToID("_Color");
        public static void Bind(SpriteRenderer source,bool add=false)
        {
            if(source==null||!NativeHd2D.Enabled)return;
            if(!entries.TryGetValue(source,out var e)){e=new Entry{Source=source};entries.Add(source,e);}
            NativeHd2D.ForgetActorForSurface(source);e.Additive=add;e.Frame=Time.frameCount;
        }
        public static void Unbind(SpriteRenderer source)
        {
            if(source==null||!entries.TryGetValue(source,out var e))return;
            Release(e);entries.Remove(source);
        }
        public static void Restore()
        {
            dead.Clear();HeightQueries=0;GeometryRebuilds=0;
            foreach(var pair in entries)
            {
                var e=pair.Value;
                if(pair.Key==null){Release(e);dead.Add(pair.Key);continue;}
                if(e.Projected){e.Source.forceRenderingOff=e.PreviousForceOff;e.Projected=false;}
                if(e.Renderer!=null)e.Renderer.enabled=false;
            }
            foreach(var source in dead)entries.Remove(source);
        }
        public static bool Project(SpriteRenderer source,Camera camera)
        {
            if(!NativeRemodel3D.Active||!NativeHd2D.Enabled||source==null||!entries.TryGetValue(source,out var e)||e.Frame!=Time.frameCount)return false;
            if(!source.enabled||!source.gameObject.activeInHierarchy||source.sprite==null)return true;
            if(e.Projected)return true;
            e.PreviousForceOff=source.forceRenderingOff;
            if(e.PreviousForceOff)return true;
            source.forceRenderingOff=true;e.Projected=true;
            if(camera!=null)
            {
                if(planeFrame!=Time.frameCount||planeCamera!=camera){GeometryUtility.CalculateFrustumPlanes(camera,planes);planeFrame=Time.frameCount;planeCamera=camera;}
                float radius=(source.sprite.bounds.extents.magnitude*source.transform.lossyScale.magnitude)+1;
                if(!GeometryUtility.TestPlanesAABB(planes,new Bounds(source.transform.position,Vector3.one*radius*2)))return true;
            }
            Ensure(e);Build(e,camera);
            source.GetPropertyBlock(e.Block);e.Block.SetTexture(MainTex,source.sprite.texture);e.Block.SetColor(Tint,source.color);
            var original=source.sharedMaterial;string shaderName=original!=null?original.shader.name:"";
            int mode=shaderName=="EXODUSER/KiSlashInk"?3:shaderName=="EXODUSER/KiSlashAdditive"?2:shaderName=="EXODUSER/SkillAdditive"?1:0;
            float dst=original!=null&&original.HasProperty("_DstBlend")?original.GetFloat("_DstBlend"):(e.Additive?1:10);
            e.Block.SetFloat("_SurfaceMode",mode);e.Block.SetFloat("_Flat",original!=null&&original.HasProperty("_Flat")?original.GetFloat("_Flat"):0);
            e.Block.SetFloat("_NormalBlend",original!=null&&original.HasProperty("_NormalBlend")?original.GetFloat("_NormalBlend"):0);
            if(mode==0&&original!=null&&original.HasProperty("_Color"))e.Block.SetColor(Tint,source.color*original.GetColor("_Color"));
            var surfaceMaterial=MaterialFor((int)dst,mode==3);
            if(surfaceMaterial==null){source.forceRenderingOff=e.PreviousForceOff;e.Projected=false;e.Renderer.enabled=false;return false;}
            e.Renderer.SetPropertyBlock(e.Block);e.Renderer.sharedMaterial=surfaceMaterial;
            e.Renderer.sortingLayerID=source.sortingLayerID;e.Renderer.sortingOrder=source.sortingOrder;e.Renderer.enabled=true;
            source.forceRenderingOff=true;e.Projected=true;return true;
        }
        static Material MaterialFor(int dst,bool ink)
        {
            int key=dst*16+(ink?5:1);if(materials.TryGetValue(key,out var material))return material;
            var shader=Resources.Load<Shader>("Shaders/HD2DGround");
            if(shader==null||!shader.isSupported){if(!missingShaderWarned)Debug.LogWarning("[HD2D] 바닥 셰이더 로드/지원 실패. 원본 스프라이트 표시 유지");missingShaderWarned=true;return null;}
            material=new Material(shader){name="HD2D surface blend "+dst};material.SetFloat("_DstBlend",dst);material.SetFloat("_SrcAlphaBlend",ink?5:1);materials.Add(key,material);return material;
        }
        static void Ensure(Entry e)
        {
            if(e.Object!=null)return;
            e.Object=new GameObject("HD2D surface: "+e.Source.name);SceneManager.MoveGameObjectToScene(e.Object,e.Source.gameObject.scene);
            e.Object.transform.SetPositionAndRotation(Vector3.zero,Quaternion.identity);
            e.Mesh=new Mesh{name="HD2D height surface"};e.Mesh.MarkDynamic();e.Object.AddComponent<MeshFilter>().sharedMesh=e.Mesh;
            e.Renderer=e.Object.AddComponent<MeshRenderer>();e.Renderer.shadowCastingMode=UnityEngine.Rendering.ShadowCastingMode.Off;e.Renderer.receiveShadows=false;
        }
        static void Axis(List<float> list,int steps,float pivot)
        {
            list.Clear();for(int i=0;i<=steps;i++)list.Add(i/(float)steps);
            bool found=false;foreach(float value in list)if(Mathf.Abs(value-pivot)<.00001f){found=true;break;}
            if(!found){list.Add(Mathf.Clamp01(pivot));list.Sort();}
        }
        static void Build(Entry e,Camera camera)
        {
            var source=e.Source;var sprite=source.sprite;var tr=source.transform;var rect=sprite.rect;var pivot=sprite.pivot;float ppu=sprite.pixelsPerUnit;
            var anchor=tr.position;var size=new Vector2(rect.width,rect.height);float epsilon=0;
            if(camera!=null){float upPx=Vector2.Distance(camera.WorldToScreenPoint(anchor),camera.WorldToScreenPoint(anchor+Vector3.up));epsilon=Mathf.Min(.003f,.15f/Mathf.Max(upPx,1));}
            bool geometry=e.Revision!=revision||e.Ground!=NativeRemodel3D.Ground||e.Position!=anchor||e.Rotation!=tr.rotation||e.Scale!=tr.lossyScale||e.Size!=size||e.Pivot!=pivot||e.Ppu!=ppu||e.FlipX!=source.flipX||e.FlipY!=source.flipY||Mathf.Abs(e.Epsilon-epsilon)>.000001f;
            bool uv=geometry||e.UvSprite!=sprite;
            if(geometry)
            {
                float width=tr.TransformVector(new Vector3(rect.width/ppu,0,0)).magnitude,height=tr.TransformVector(new Vector3(0,rect.height/ppu,0)).magnitude;
                Axis(e.U,Mathf.Clamp(Mathf.CeilToInt(width/.20f),2,16),pivot.x/rect.width);Axis(e.V,Mathf.Clamp(Mathf.CeilToInt(height/.20f),2,16),pivot.y/rect.height);
                e.Vertices.Clear();e.Triangles.Clear();
                foreach(float v in e.V)foreach(float u in e.U)
                {
                    float x=u*rect.width-pivot.x,y=v*rect.height-pivot.y;if(source.flipX)x=-x;if(source.flipY)y=-y;
                    var offset=tr.TransformVector(new Vector3(x/ppu,y/ppu,0));float wx=anchor.x+offset.x,wz=anchor.z+offset.y;
                    e.Vertices.Add(new Vector3(wx,NativeRemodel3D.GroundY(wx,wz)+epsilon,wz));HeightQueries++;
                }
                int n=e.U.Count;for(int y=0;y<e.V.Count-1;y++)for(int x=0;x<n-1;x++){int a=y*n+x;e.Triangles.Add(a);e.Triangles.Add(a+n);e.Triangles.Add(a+1);e.Triangles.Add(a+1);e.Triangles.Add(a+n);e.Triangles.Add(a+n+1);}
                e.Mesh.Clear();e.Mesh.SetVertices(e.Vertices);e.Mesh.SetTriangles(e.Triangles,0);e.Mesh.RecalculateBounds();GeometryRebuilds++;
                e.Revision=revision;e.Ground=NativeRemodel3D.Ground;e.Position=anchor;e.Rotation=tr.rotation;e.Scale=tr.lossyScale;e.Size=size;e.Pivot=pivot;e.Ppu=ppu;e.FlipX=source.flipX;e.FlipY=source.flipY;e.Epsilon=epsilon;
            }
            if(uv)
            {
                e.Uv.Clear();foreach(float v in e.V)foreach(float u in e.U)e.Uv.Add(new Vector2((rect.x+u*rect.width)/sprite.texture.width,(rect.y+v*rect.height)/sprite.texture.height));
                e.Mesh.SetUVs(0,e.Uv);e.UvSprite=sprite;
            }
        }
        static void Release(Entry e)
        {
            if(e.Renderer!=null)e.Renderer.enabled=false;
            if(e.Source!=null&&e.Projected)e.Source.forceRenderingOff=e.PreviousForceOff;
            if(e.Object!=null)Destroy(e.Object);if(e.Mesh!=null)Destroy(e.Mesh);
        }
        static void Destroy(Object value){if(Application.isPlaying)Object.Destroy(value);else Object.DestroyImmediate(value);}
    }
}
