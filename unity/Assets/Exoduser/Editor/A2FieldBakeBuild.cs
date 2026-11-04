using System;
using System.IO;
using System.Collections;
using System.Collections.Generic;
using System.Reflection;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEditor;
using Exoduser.UnityPort;

// Deterministic base-field asset authoring. No Core or A2R presentation builder changes.
public static class A2FieldBakeBuild
{
    const string Folder="Assets/Exoduser/Resources/A2R/Baked/Field";
    const BindingFlags Private=BindingFlags.NonPublic|BindingFlags.Instance;
    static readonly string[] Stages={"outer","foreground","landmarks","connections","ground","cover","bridge","atmosphere"};
    static readonly string[] Methods={"A2FieldOuterMass","A2Foreground","A2FieldLandmarks","A2FieldConnections","A2FieldGround","A2FieldGroundCover","A2BridgeMoss","A2FieldAtmosphere"};
    static readonly Dictionary<Mesh,Mesh> Meshes=new Dictionary<Mesh,Mesh>();
    static readonly Dictionary<Material,Material> Materials=new Dictionary<Material,Material>();
    static readonly Dictionary<Texture,Texture> Textures=new Dictionary<Texture,Texture>();
    static readonly Dictionary<Sprite,Sprite> Sprites=new Dictionary<Sprite,Sprite>();
    static Mesh container;
    static object Get(object game,string name){return game.GetType().GetField(name,Private).GetValue(game);}
    static void Set(object game,string name,object value){game.GetType().GetField(name,Private).SetValue(game,value);}
    sealed class Context : IDisposable
    {
        public GameObject Host,Root,Camera;public NativeGame Game;public A2FieldLayout Field;public Material Soil;public MapData Data;
        public void Dispose(){UnityEngine.Object.DestroyImmediate(Host);UnityEngine.Object.DestroyImmediate(Root);UnityEngine.Object.DestroyImmediate(Camera);UnityEngine.Object.DestroyImmediate(Soil);}
    }
    static Context Create()
    {
        var c=new Context();c.Host=new GameObject("A2 asset bake host");c.Host.SetActive(false);c.Game=c.Host.AddComponent<NativeGame>();
        c.Data=JsonUtility.FromJson<MapData>(Resources.Load<TextAsset>("Data/ch1_map").text);c.Field=new A2FieldLayout(c.Data);
        typeof(NativeGame).GetProperty("Map").SetValue(c.Game,new SourceMap(c.Data));
        c.Root=new GameObject("A2 asset bake field");c.Camera=new GameObject("A2 asset bake camera");c.Camera.SetActive(false);
        c.Soil=new Material(Shader.Find("EXODUSER/HellGroundPBR"));
        Set(c.Game,"a2Field",c.Field);Set(c.Game,"a2Root",c.Root);Set(c.Game,"a2FieldSoil",c.Soil);Set(c.Game,"r3Roots",new GameObject[0]);Set(c.Game,"r3Cam",c.Camera.AddComponent<Camera>());
        var sheet=Resources.Load<Texture2D>("Art/map/hell_lighting/torch_flame");if(sheet==null)throw new InvalidDataException("Torch sheet missing");
        var flames=new Sprite[8];for(int i=0;i<8;i++)flames[i]=Sprite.Create(sheet,new Rect(i%4*(sheet.width/4),(1-i/4)*(sheet.height/2),sheet.width/4,sheet.height/2),new Vector2(.5f,.12f),100);
        Set(c.Game,"hellFlameFrames",flames);NativeRemodel3D.Field=c.Field;NativeRemodel3D.ForestA2=true;return c;
    }
    public static void BakeAndCheck()
    {
        BakeAndCheckAt(PortVerification.Argument("-output"));
    }
    public static void CompareThenBake()
    {
        A2FieldBakeProbe.Measure();
        BakeAndCheckAt(Path.Combine(PortVerification.Argument("-output"),"cache"));
    }
    static void BakeAndCheckAt(string output)
    {
        if(string.IsNullOrEmpty(output))throw new ArgumentException("-output required");Directory.CreateDirectory(output);
        var previous=NativeRemodel3D.Field;bool forest=NativeRemodel3D.ForestA2;var previousOverride=NativeGame.A2FieldCacheQaOverride;
        List<RenderProof> original;
        try
        {
            using(var c=Create())
            {
                for(int i=0;i<Methods.Length;i++)typeof(NativeGame).GetMethod(Methods[i],Private).Invoke(c.Game,i==1?new object[]{true}:null);
                A2FieldBakeProbe.WriteGeometry(Path.Combine(output,"baseline-geometry.bin"),c.Root,c.Field);original=CaptureRenderers(c.Root);
            }
            Bake();
            NativeGame.A2FieldCacheQaOverride=true;
            using(var c=Create())
            {
                var timings=new System.Text.StringBuilder("단계\t밀리초\n");
                foreach(var stage in Stages)
                {
                    var timer=System.Diagnostics.Stopwatch.StartNew();
                    bool loaded=(bool)typeof(NativeGame).GetMethod("A2FieldTryLoadStage",Private).Invoke(c.Game,new object[]{stage});
                    if(!loaded)throw new InvalidDataException("Baked stage rejected: "+stage);
                    timings.Append(stage).Append('\t').Append(timer.Elapsed.TotalMilliseconds.ToString("F3",System.Globalization.CultureInfo.InvariantCulture)).Append('\n');
                }
                File.WriteAllText(Path.Combine(output,"cached-stages.tsv"),timings.ToString());
                A2FieldBakeProbe.WriteGeometry(Path.Combine(output,"optimized-geometry.bin"),c.Root,c.Field);
                var current=CaptureRenderers(c.Root);if(original.Count!=current.Count)throw new InvalidDataException("Baked renderer count changed");
                float maxWorld=0;
                for(int i=0;i<original.Count;i++)
                {
                    if(original[i].Value!=current[i].Value)throw new InvalidDataException("Baked material/block/render state changed: "+i+" "+original[i].Name);
                    for(int j=0;j<16;j++)maxWorld=Mathf.Max(maxWorld,Mathf.Abs(original[i].World[j]-current[i].World[j]));
                }
                if(maxWorld>1e-5f)throw new InvalidDataException("Baked renderer transform changed: "+maxWorld);
                File.WriteAllText(Path.Combine(output,"render-state.txt"),"재질·PropertyBlock·렌더 상태 동일 / "+current.Count+"개 / 월드 행렬 최대 차 "+maxWorld);
            }
            A2FieldBakeProbe.Compare(output);
            var verified=JsonUtility.FromJson<NativeGame.A2FieldCacheIndex>(File.ReadAllText(Folder+"/index.json"));verified.verified=true;
            File.WriteAllText(Folder+"/index.json",JsonUtility.ToJson(verified,true));AssetDatabase.Refresh(ImportAssetOptions.ForceSynchronousImport);
            Debug.Log("[A2 전체필드] 구운 필드 전후 검사 통과 / Player·화면 판정 아님");
        }
        finally {NativeRemodel3D.Field=previous;NativeRemodel3D.ForestA2=forest;NativeGame.A2FieldCacheQaOverride=previousOverride;}
    }
    sealed class RenderProof{public string Name,Value;public Matrix4x4 World;}
    static List<RenderProof> CaptureRenderers(GameObject root)
    {
        var result=new List<RenderProof>();var materials=new Dictionary<Material,string>();
        foreach(var r in root.GetComponentsInChildren<Renderer>(true))
        {
            if(NativeGroundSkillProjection.IsProxy(r.GetComponent<MeshFilter>()))continue;
            var value=new System.Text.StringBuilder();value.Append(r.name).Append('|').Append(r.gameObject.activeSelf).Append('|').Append(r.enabled).Append('|').Append(r.forceRenderingOff).Append('|').Append(r.gameObject.layer).Append('|').Append((int)r.shadowCastingMode).Append('|').Append(r.receiveShadows).Append('|').Append(r.renderingLayerMask).Append('|').Append(r.sortingLayerID).Append('|').Append(r.sortingOrder);
            foreach(var m in r.sharedMaterials)
            {
                if(m==null){value.Append("|null");continue;}string signature;
                if(!materials.TryGetValue(m,out signature)){signature=MaterialSignature(m);materials.Add(m,signature);}value.Append('|').Append(signature);
            }
            var properties=ReadProperties(r,r.sharedMaterials);Array.Sort(properties,(a,b)=>string.CompareOrdinal(a.name,b.name));
            foreach(var p in properties)value.Append('|').Append(JsonUtility.ToJson(p));
            result.Add(new RenderProof{Name=r.name,Value=value.ToString(),World=r.localToWorldMatrix});
        }
        return result;
    }
    static string MaterialSignature(Material material)
    {
        var text=new System.Text.StringBuilder(material.shader.name+"/"+material.renderQueue+"/"+material.enableInstancing);
        var keywords=material.shaderKeywords;Array.Sort(keywords,StringComparer.Ordinal);text.Append(string.Join(",",keywords));
        for(int i=0;i<material.shader.GetPropertyCount();i++)
        {
            string name=material.shader.GetPropertyName(i);text.Append('|').Append(name).Append('=');
            switch(material.shader.GetPropertyType(i))
            {
                case ShaderPropertyType.Color:var color=material.GetColor(name);Append(text,new Vector4(color.r,color.g,color.b,color.a));break;
                case ShaderPropertyType.Vector:Append(text,material.GetVector(name));break;
                case ShaderPropertyType.Texture:
                    var texture=material.GetTexture(name);
                    if(texture!=null)
                    {
                        text.Append(texture.width).Append('/').Append(texture.height).Append('/').Append(texture.wrapMode).Append('/').Append(texture.filterMode).Append('/').Append(texture.anisoLevel);
                        var image=texture as Texture2D;
                        if(image!=null&&image.isReadable&&image.name=="A2 전체 실제 지면 물가 거리장")text.Append(Convert.ToBase64String(image.GetRawTextureData()));
                        else {string guid;long local; if(AssetDatabase.TryGetGUIDAndLocalFileIdentifier(texture.GetEntityId(),out guid,out local))text.Append(guid).Append('/').Append(local);else text.Append(texture.GetEntityId().ToString());}
                    }
                    else text.Append("null");
                    var scale=material.GetTextureScale(name);var offset=material.GetTextureOffset(name);Append(text,new Vector4(scale.x,scale.y,offset.x,offset.y));break;
                case ShaderPropertyType.Int:text.Append(material.GetInteger(name));break;
                default:text.Append(material.GetFloat(name).ToString("R",System.Globalization.CultureInfo.InvariantCulture));break;
            }
        }
        return text.ToString();
    }
    static void Append(System.Text.StringBuilder text,Vector4 value)
    {for(int i=0;i<4;i++)text.Append(value[i].ToString("R",System.Globalization.CultureInfo.InvariantCulture)).Append(',');}
    public static void Bake()
    {
        var previous=NativeRemodel3D.Field;bool forest=NativeRemodel3D.ForestA2;Directory.CreateDirectory(Folder);AssetDatabase.Refresh(ImportAssetOptions.ForceSynchronousImport);
        Meshes.Clear();Materials.Clear();Textures.Clear();Sprites.Clear();
        container=new Mesh{name="A2 field baked assets"};AssetDatabase.CreateAsset(container,Folder+"/geometry.asset");
        try
        {
            using(var c=Create())
            {
                string hash=Hash128.Compute(JsonUtility.ToJson(c.Data)).ToString();
                for(int stage=0;stage<Stages.Length;stage++)
                {
                    int first=c.Root.transform.childCount;
                    typeof(NativeGame).GetMethod(Methods[stage],Private).Invoke(c.Game,stage==1?new object[]{true}:null);
                    var group=new GameObject("A2 baked "+Stages[stage]);group.transform.SetParent(c.Root.transform,false);
                    while(c.Root.transform.childCount>first+1)c.Root.transform.GetChild(first).SetParent(group.transform,false);
                    foreach(Transform child in group.transform)
                    {
                        var instance=PrefabUtility.GetOutermostPrefabInstanceRoot(child.gameObject);
                        if(instance!=null)PrefabUtility.UnpackPrefabInstance(instance,PrefabUnpackMode.Completely,InteractionMode.AutomatedAction);
                    }
                    SaveStage(c,group,stage,hash);
                }
                var paths=InputPaths();var hashes=new string[paths.Length];for(int i=0;i<paths.Length;i++)hashes[i]=AssetDatabase.GetAssetDependencyHash(paths[i]).ToString();
                var index=new NativeGame.A2FieldCacheIndex{version=NativeGame.A2FieldCacheVersion,mapHash=hash,stages=Stages,inputPaths=paths,inputHashes=hashes};
                File.WriteAllText(Folder+"/index.json",JsonUtility.ToJson(index,true));
            }
            AssetDatabase.SaveAssets();AssetDatabase.Refresh(ImportAssetOptions.ForceSynchronousImport);
            Debug.Log("[A2 전체필드] 굽기 저장 완료 / 8단계 / 생성 메시 "+Meshes.Count+" / 재질 "+Materials.Count+" / 텍스처 "+Textures.Count);
        }
        finally {NativeRemodel3D.Field=previous;NativeRemodel3D.ForestA2=forest;}
    }
    static void SaveStage(Context c,GameObject group,int stage,string hash)
    {
        var all=group.GetComponentsInChildren<MeshFilter>(true);var filters=new List<MeshFilter>();foreach(var f in all)if(!NativeGroundSkillProjection.IsProxy(f))filters.Add(f);
        var drawn=new List<Renderer>();foreach(var r in group.GetComponentsInChildren<Renderer>(true))if(!NativeGroundSkillProjection.IsProxy(r.GetComponent<MeshFilter>()))drawn.Add(r);
        var states=new NativeGame.A2FieldCacheRenderer[drawn.Count];
        var rootMaterial=(Material)Get(c.Game,"a2FieldRootMaterial");var water=(Material)Get(c.Game,"a2Water");
        for(int i=0;i<drawn.Count;i++)
        {
            var slots=drawn[i].sharedMaterials;var roles=new string[slots.Length];
            for(int j=0;j<slots.Length;j++)roles[j]=slots[j]==c.Soil?"soil":slots[j]!=null&&slots[j]==rootMaterial?"root":slots[j]!=null&&slots[j]==water?"water":"";
            states[i]=new NativeGame.A2FieldCacheRenderer{roles=roles,properties=ReadProperties(drawn[i],slots)};
        }
        var registry=(IDictionary)typeof(NativeGroundSkillProjection).GetField("receivers",BindingFlags.NonPublic|BindingFlags.Static).GetValue(null);
        var records=new List<object>();
        foreach(DictionaryEntry entry in registry){var source=entry.Key as MeshFilter;if(source!=null&&filters.Contains(source))records.Add(entry.Value);}
        using(var writer=new BinaryWriter(File.Create(Folder+"/"+Stages[stage]+"-state.bytes")))
        {
            writer.Write(0x41324632);writer.Write(Stages[stage]);bool heights=stage==0||stage==2||stage==3;writer.Write(heights);if(heights)c.Field.WriteVisualSurfaces(writer);
            writer.Write(records.Count);
            foreach(var record in records)
            {
                var t=record.GetType();var source=(MeshFilter)t.GetField("Source").GetValue(record);bool bounded=(bool)t.GetField("Bounded").GetValue(record),isWater=(bool)t.GetField("Water").GetValue(record);
                var proxy=(MeshFilter)t.GetField("Filter").GetValue(record);var range=bounded?proxy.sharedMesh.uv2:new Vector2[0];bool deck=bounded&&range.Length>0&&range[0].x==-10000;
                writer.Write(filters.IndexOf(source));writer.Write(bounded);writer.Write(isWater);writer.Write(deck);writer.Write(deck?range[0].y:0);
                if(bounded)
                {
                    var points=source.sharedMesh.vertices;var world=new float[points.Length*3];var beds=deck?new float[0]:new float[points.Length];
                    for(int i=0;i<points.Length;i++){var p=source.transform.TransformPoint(points[i]);world[i*3]=p.x;world[i*3+1]=p.y;world[i*3+2]=p.z;if(!deck)beds[i]=range[i].x;}
                    WriteArray(writer,world);WriteArray(writer,source.sharedMesh.triangles);WriteArray(writer,beds);
                }
            }
        }
        // Proxy objects are recreated through the unchanged projection API at load.
        foreach(var f in all)if(NativeGroundSkillProjection.IsProxy(f))UnityEngine.Object.DestroyImmediate(f.gameObject);
        foreach(var f in filters)f.sharedMesh=Persist(f.sharedMesh);
        foreach(var r in drawn)
        {
            var slots=r.sharedMaterials;for(int i=0;i<slots.Length;i++)slots[i]=Persist(slots[i]);r.sharedMaterials=slots;
            var sprite=r as SpriteRenderer;if(sprite!=null&&sprite.sprite!=null&&!AssetDatabase.Contains(sprite.sprite))
            {
                Sprite saved;if(!Sprites.TryGetValue(sprite.sprite,out saved)){saved=UnityEngine.Object.Instantiate(sprite.sprite);saved.name=sprite.sprite.name;AssetDatabase.AddObjectToAsset(saved,container);Sprites.Add(sprite.sprite,saved);}sprite.sprite=saved;
            }
        }
        foreach(var reflection in group.GetComponentsInChildren<A2RiverReflection>(true)){reflection.Viewer=null;reflection.Surface=Persist(reflection.Surface);}
        bool success;PrefabUtility.SaveAsPrefabAsset(group,Folder+"/"+Stages[stage]+".prefab",out success);if(!success)throw new InvalidDataException("Prefab save failed: "+Stages[stage]);
        var meta=new NativeGame.A2FieldCacheStage{version=NativeGame.A2FieldCacheVersion,mapHash=hash,filters=filters.Count,renderers=states};
        File.WriteAllText(Folder+"/"+Stages[stage]+"-meta.json",JsonUtility.ToJson(meta,true));
    }
    static Mesh Persist(Mesh source)
    {
        if(source==null||EditorUtility.IsPersistent(source))return source;Mesh saved;
        if(!Meshes.TryGetValue(source,out saved)){saved=UnityEngine.Object.Instantiate(source);saved.name=source.name;saved.hideFlags=HideFlags.None;AssetDatabase.AddObjectToAsset(saved,container);Meshes.Add(source,saved);}return saved;
    }
    static Material Persist(Material source)
    {
        if(source==null||EditorUtility.IsPersistent(source))return source;Material saved;if(Materials.TryGetValue(source,out saved))return saved;
        saved=new Material(source){name=source.name,hideFlags=HideFlags.None};Materials.Add(source,saved);
        foreach(var name in source.GetTexturePropertyNames())
        {
            var texture=source.GetTexture(name);if(texture==null||EditorUtility.IsPersistent(texture))continue;
            Texture cached;if(!Textures.TryGetValue(texture,out cached))
            {
                var image=texture as Texture2D;if(image==null||!image.isReadable)throw new InvalidDataException("Generated texture must retain editor pixels: "+name);
                cached=UnityEngine.Object.Instantiate(image);cached.name=image.name;cached.hideFlags=HideFlags.None;AssetDatabase.AddObjectToAsset(cached,container);Textures.Add(texture,cached);
            }
            saved.SetTexture(name,cached);
        }
        AssetDatabase.AddObjectToAsset(saved,container);return saved;
    }
    static NativeGame.A2FieldCacheProperty[] ReadProperties(Renderer renderer,Material[] materials)
    {
        var block=new MaterialPropertyBlock();renderer.GetPropertyBlock(block);var types=new Dictionary<string,ShaderPropertyType>();
        foreach(var m in materials)if(m!=null&&m.shader!=null)for(int i=0;i<m.shader.GetPropertyCount();i++)types[m.shader.GetPropertyName(i)]=m.shader.GetPropertyType(i);
        types["_BaseColor"]=ShaderPropertyType.Color;types["_Color"]=ShaderPropertyType.Color;types["_BumpScale"]=ShaderPropertyType.Float;types["_OcclusionStrength"]=ShaderPropertyType.Float;types["_A2R3DWind"]=ShaderPropertyType.Vector;
        var result=new List<NativeGame.A2FieldCacheProperty>();
        foreach(var pair in types)if(block.HasProperty(pair.Key))
        {
            var p=new NativeGame.A2FieldCacheProperty{name=pair.Key};
            switch(pair.Value)
            {
                case ShaderPropertyType.Color:p.kind=0;p.color=block.GetColor(pair.Key);break;
                case ShaderPropertyType.Vector:p.kind=1;p.vector=block.GetVector(pair.Key);break;
                case ShaderPropertyType.Int:p.kind=3;p.integer=block.GetInteger(pair.Key);break;
                case ShaderPropertyType.Texture:
                    p.kind=4;var texture=block.GetTexture(pair.Key);if(texture!=null){var path=AssetDatabase.GetAssetPath(texture);int at=path.LastIndexOf("/Resources/",StringComparison.Ordinal);if(at<0)throw new InvalidDataException("Property-block texture outside Resources");p.texture=Path.ChangeExtension(path.Substring(at+11),null);}break;
                default:p.kind=2;p.scalar=block.GetFloat(pair.Key);break;
            }
            result.Add(p);
        }
        return result.ToArray();
    }
    static void WriteArray(BinaryWriter writer,Array data)
    {writer.Write(data.Length);var bytes=new byte[Buffer.ByteLength(data)];Buffer.BlockCopy(data,0,bytes,0,bytes.Length);writer.Write(bytes);}
    public static string[] InputPaths()
    {
        var paths=new List<string>{"Assets/Exoduser/Resources/Data/ch1_map.json"};
        paths.Add("Assets/Exoduser/Editor/A2FieldBakeBuild.cs");
        foreach(var name in new[]{"NativeGame.A2Field.cs","NativeGame.A2Forest.cs","NativeGame.A2Foreground.cs","NativeGame.A2GroundCover.cs","NativeGame.A2ShoreField.cs","NativeGame.A2Bramble.cs","A2FieldLayout.cs","A2ForestLayout.cs","NativeGroundSkillProjection.cs","SourceMap.cs","NativeRemodel3D.cs"})paths.Add("Assets/Exoduser/Runtime/"+name);
        foreach(var id in AssetDatabase.FindAssets("t:GameObject",new[]{"Assets/Exoduser/Resources/Art/map/a2"})){var path=AssetDatabase.GUIDToAssetPath(id);if(path.EndsWith(".fbx",StringComparison.OrdinalIgnoreCase)||path.EndsWith(".prefab",StringComparison.OrdinalIgnoreCase))paths.Add(path);}
        foreach(var id in AssetDatabase.FindAssets("t:Material",new[]{"Assets/Exoduser/Resources/Art/map/a2"}))paths.Add(AssetDatabase.GUIDToAssetPath(id));
        paths.Add(AssetDatabase.GetAssetPath(Resources.Load<Texture2D>("Art/map/hell_lighting/torch_flame")));return paths.ToArray();
    }
}
