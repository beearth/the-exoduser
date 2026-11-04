using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using Exoduser.UnityPort;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEngine;
using Object=UnityEngine.Object;

// Only card resources and the terrain-derived WATER mask belong to this lane.
// A2RGroundPainting and its 64 ground tiles are deliberately not visited here.
public sealed class A2RWebCardsBake : IPreprocessBuildWithReport
{
    const string Folder="Assets/Exoduser/Resources/A2R/Baked/WebCards";
    [Serializable] sealed class Input { public A2RWebAssets.Card[] cards; }
    [Serializable] sealed class Stamp { public string mapHash,sourceHash;public int cards,meshes,materials; }
    public int callbackOrder { get { return -100; } }
    public void OnPreprocessBuild(BuildReport report){ Bake(); Verify(); }
    static MethodInfo Method(string name){return typeof(A2RWebAssets).GetMethod(name,BindingFlags.Static|BindingFlags.Instance|BindingFlags.NonPublic|BindingFlags.Public);}
    static T Invoke<T>(string name,params object[] args){return (T)Method(name).Invoke(null,args);}
    static Input Read(){return JsonUtility.FromJson<Input>(Resources.Load<TextAsset>("A2R/web-assets").text);}
    static string MapHash(){return Invoke<string>("WaterKey",JsonUtility.FromJson<MapData>(Resources.Load<TextAsset>("Data/ch1_map").text));}
    static T Save<T>(T asset,string name) where T:Object
    {
        string path=Folder+"/"+name;var old=AssetDatabase.LoadAssetAtPath<T>(path);
        if(old==null){AssetDatabase.CreateAsset(asset,path);return asset;}
        EditorUtility.CopySerialized(asset,old);EditorUtility.SetDirty(old);Object.DestroyImmediate(asset);return old;
    }
    static string Fingerprint(Input input)
    {
        var paths=new SortedSet<string>(StringComparer.Ordinal){"Assets/Exoduser/Runtime/A2RWebAssets.cs","Assets/Exoduser/Runtime/A2FieldLayout.cs","Assets/Exoduser/Runtime/A2ForestLayout.cs","Assets/Exoduser/Editor/A2RWebCardsBake.cs","Assets/Exoduser/Resources/A2R/web-assets.json","Assets/Exoduser/Resources/Data/ch1_map.json"};
        foreach(var c in input.cards)foreach(var art in new[]{c.asset,c.variationAsset})if(!string.IsNullOrEmpty(art))foreach(var suffix in new[]{"","_normal"}){var texture=Resources.Load<Texture2D>(art+suffix);if(texture!=null)paths.Add(AssetDatabase.GetAssetPath(texture));}
        foreach(var shader in new[]{"A2R/CardOpaque","A2R/CardFade","Shaders/HD2DContact"})paths.Add(AssetDatabase.GetAssetPath(Resources.Load<Shader>(shader)));
        var text=new System.Text.StringBuilder(MapHash());foreach(var p in paths)text.Append(p).Append(AssetDatabase.GetAssetDependencyHash(p));return Hash128.Compute(text.ToString()).ToString();
    }
    static IEnumerable<(A2RWebAssets.Card card,A2RWebAssets.Card pivot,bool flip)> Geometries(Input input)
    {
        foreach(var c in input.cards)
        {
            yield return (c,c,false);
            if(c.kind!="vegetation")continue;
            var art=string.IsNullOrEmpty(c.variationAsset)?c.asset:c.variationAsset;
            var pivot=Array.Find(input.cards,p=>p.asset==art)??c;
            yield return (c,pivot,false);yield return (c,pivot,true);
        }
    }
    public static int Bake()
    {
        var input=Read();string hash=Fingerprint(input);string stampPath=Folder+"/stamp.json";
        // Stable paths/GUIDs: rebuild in place, never create candidate directories.
        if(File.Exists(stampPath))
        {
            var stamp=JsonUtility.FromJson<Stamp>(File.ReadAllText(stampPath));
            if(stamp.sourceHash==hash&&AssetDatabase.LoadAssetAtPath<Texture2D>(Folder+"/water-domain.asset")!=null){Debug.Log("[웹카드 굽기] 입력 동일, 기존 에셋 사용");return 0;}
        }
        Directory.CreateDirectory(Folder);AssetDatabase.Refresh();
        var meshKeys=new HashSet<string>();var artKeys=new HashSet<string>();
        foreach(var g in Geometries(input))
        {
            string key=Invoke<string>("MeshKey",g.card,g.pivot,g.flip);if(!meshKeys.Add(key))continue;
            Save(Invoke<Mesh>("WindMesh",g.card,g.pivot,g.flip),"mesh-"+key+".asset");
        }
        foreach(var c in input.cards)foreach(var art in new[]{c.asset,c.variationAsset})
        {
            if(string.IsNullOrEmpty(art)||!artKeys.Add(art))continue;
            var texture=Resources.Load<Texture2D>(art);var normal=Resources.Load<Texture2D>(art+"_normal");
            if(texture==null||normal==null)throw new InvalidOperationException("카드 원화·노멀 누락: "+art);
            // Original imported GPU textures/mips are referenced verbatim. No duplicate PNG,
            // resize, recompression, alpha rewrite or normal generation is introduced.
            foreach(var mode in new[]{"opaque","floor","fade"})
            {
                var material=new Material(Resources.Load<Shader>(mode=="fade"?"A2R/CardFade":"A2R/CardOpaque")){name="A2R baked "+art+" "+mode};
                material.SetTexture("_MainTex",texture);material.SetTexture("_NormalTex",normal);
                if(mode=="floor")material.renderQueue=2480;else if(mode=="fade")material.renderQueue=3000;
                Save(material,"material-"+Invoke<string>("ArtKey",art)+"-"+mode+".mat");
            }
        }
        var quad=GameObject.CreatePrimitive(PrimitiveType.Quad);
        try{Save(Object.Instantiate(quad.GetComponent<MeshFilter>().sharedMesh),"ao-quad.asset");}finally{Object.DestroyImmediate(quad);}
        var ao=new Material(Resources.Load<Shader>("Shaders/HD2DContact")){name="A2R shared web foot AO"};ao.SetFloat("_Opacity",.8f);Save(ao,"ao.mat");
        var map=JsonUtility.FromJson<MapData>(Resources.Load<TextAsset>("Data/ch1_map").text);var field=new A2FieldLayout(map);
        var bytes=new byte[512*512];for(int y=0;y<512;y++)for(int x=0;x<512;x++){float wx=(x+.5f)*80/512,wz=-(y+.5f)*80/512;bytes[y*512+x]=field.TerrainHeight(wx,wz)<-.46f?(byte)255:(byte)0;}
        var domain=new Texture2D(512,512,TextureFormat.R8,false,true){name="A2R baked water domain",wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};domain.SetPixelData(bytes,0);domain.Apply(false,false);Save(domain,"water-domain.asset");
        AssetDatabase.SaveAssets();
        File.WriteAllText(stampPath,JsonUtility.ToJson(new Stamp{mapHash=MapHash(),sourceHash=hash,cards=input.cards.Length,meshes=meshKeys.Count,materials=artKeys.Count*3},true));AssetDatabase.ImportAsset(stampPath);
        Debug.Log("[웹카드 굽기] 카드="+input.cards.Length+" 공유 메시="+meshKeys.Count+" 원화="+artKeys.Count+" 수면=262144픽셀 / 지면64장 변경 없음");return 0;
    }
    static void Equal<T>(T[] a,T[] b,string label)
    {
        if(a.Length!=b.Length)throw new Exception(label+" 길이 차이");for(int i=0;i<a.Length;i++)if(!EqualityComparer<T>.Default.Equals(a[i],b[i]))throw new Exception(label+" 차이 "+i);
    }
    public static int Verify()
    {
        var input=Read();int checkedMeshes=0;
        foreach(var g in Geometries(input))
        {
            string key=Invoke<string>("MeshKey",g.card,g.pivot,g.flip);var baked=Resources.Load<Mesh>("A2R/Baked/WebCards/mesh-"+key);
            if(baked==null)throw new Exception("구운 메시 누락: "+key);
            var original=Invoke<Mesh>("WindMesh",g.card,g.pivot,g.flip);
            try{Equal(original.vertices,baked.vertices,"정점");Equal(original.uv,baked.uv,"UV");Equal(original.triangles,baked.triangles,"인덱스");Equal(original.normals,baked.normals,"법선");Equal(original.tangents,baked.tangents,"탄젠트");if(original.bounds!=baked.bounds)throw new Exception("바람 경계 차이");checkedMeshes++;}finally{Object.DestroyImmediate(original);}
        }
        var arts=new HashSet<string>();foreach(var c in input.cards)foreach(var art in new[]{c.asset,c.variationAsset})if(!string.IsNullOrEmpty(art)&&arts.Add(art))foreach(var mode in new[]{"opaque","floor","fade"})
        {
            var m=Resources.Load<Material>("A2R/Baked/WebCards/material-"+Invoke<string>("ArtKey",art)+"-"+mode);if(m==null)throw new Exception("구운 재질 누락 "+art);
            if(m.GetTexture("_MainTex")!=Resources.Load<Texture2D>(art)||m.GetTexture("_NormalTex")!=Resources.Load<Texture2D>(art+"_normal"))throw new Exception("원화·노멀 참조 차이 "+art);
        }
        var map=JsonUtility.FromJson<MapData>(Resources.Load<TextAsset>("Data/ch1_map").text);var field=new A2FieldLayout(map);var domain=Resources.Load<Texture2D>("A2R/Baked/WebCards/water-domain");if(domain==null)throw new Exception("구운 수면 누락");
        var bytes=domain.GetRawTextureData<byte>();for(int y=0;y<512;y++)for(int x=0;x<512;x++)if(bytes[y*512+x]!=(field.TerrainHeight((x+.5f)*80/512,-(y+.5f)*80/512)<-.46f?(byte)255:(byte)0))throw new Exception("수면 픽셀 차이");
        string originalKey=Invoke<string>("WaterKey",map);map.tileSize++;if(Invoke<string>("WaterKey",map)==originalKey)throw new Exception("다른 배율의 수면 캐시 거부 실패");
        VerifySharing(input.cards[0]);
        Debug.Log("[웹카드 검증] PASS 메시 "+checkedMeshes+"조건 완전 일치, 원화·노멀 원본 참조, 수면262144픽셀 완전 일치, 공유 및 MPB 가림 보존");return 0;
    }
    static void VerifySharing(A2RWebAssets.Card card)
    {
        var scene=UnityEditor.SceneManagement.EditorSceneManager.NewPreviewScene();
        var root=new GameObject("A2R sharing fixture");var web=root.AddComponent<A2RWebAssets>();var camera=new GameObject("A2R test camera").AddComponent<Camera>();camera.enabled=false;
        UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(root,scene);UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(camera.gameObject,scene);
        try
        {
            var different=JsonUtility.FromJson<A2RWebAssets.Card>(JsonUtility.ToJson(card));different.emission=card.emission+.25f;
            var a=web.CreateR15ReviewCard(card,root.transform,0);var b=web.CreateR15ReviewCard(different,root.transform,0);
            if(a.GetComponent<MeshFilter>().sharedMesh!=b.GetComponent<MeshFilter>().sharedMesh||a.GetComponent<MeshRenderer>().sharedMaterial!=b.GetComponent<MeshRenderer>().sharedMaterial)throw new Exception("동일 카드 메시·재질 공유 실패");
            var body=a.GetComponent<MeshRenderer>();var faded=b.GetComponent<MeshRenderer>();var block=new MaterialPropertyBlock();body.GetPropertyBlock(block);if(block.GetFloat("_Emission")!=card.emission)throw new Exception("첫 카드 인스턴스 속성 덮임");faded.GetPropertyBlock(block);if(block.GetFloat("_Emission")!=different.emission)throw new Exception("두번째 카드 인스턴스 속성 누락");
            var propertiesType=typeof(A2RWebAssets).GetNestedType("CardProperties",BindingFlags.NonPublic);var reference=new Material(body.sharedMaterial);
            try
            {
                foreach(var tint in new[]{new Color(.82f,.76f,.58f,1),new Color(.86f,.88f,.84f,1),new Color(1.04f,.92f,1.08f,1)})
                {
                    reference.SetColor("_Tint",tint);var properties=Activator.CreateInstance(propertiesType,new object[]{body.sharedMaterial,false});propertiesType.GetMethod("SetColor").Invoke(properties,new object[]{"_Tint",tint});propertiesType.GetMethod("Apply").Invoke(properties,new object[]{body});body.GetPropertyBlock(block);if(block.GetVector("_Tint")!=reference.GetVector("_Tint"))throw new Exception("기존 재질→MPB 색 공간 값 차이");
                }
            }finally{Object.DestroyImmediate(reference);}
            body.GetPropertyBlock(block);var wind=new Vector4(.3f,1.2f,.06f,0);var storedTint=block.GetVector("_Tint");block.SetVector("_A2RWind",wind);body.SetPropertyBlock(block);
            var occlusion=root.AddComponent<A2ROcclusion>();occlusion.Initialize(root.transform,camera,()=>Vector3.zero);occlusion.Register(body,faded,true,true);occlusion.SetLook(true);occlusion.SetMasksEnabled(false);
            foreach(var r in new[]{body,faded}){block.Clear();r.GetPropertyBlock(block);if(block.GetVector("_A2RWind")!=wind||block.GetVector("_Tint")!=storedTint)throw new Exception("가림 처리에서 인스턴스 속성 유실");}
        }
        finally{UnityEditor.SceneManagement.EditorSceneManager.ClosePreviewScene(scene);}
    }
    // The build callback above bakes/verifies once, before asset collection.
    public static int Build(){return Exoduser.A2RBuilder.Build();}
}
