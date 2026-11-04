using System;
using System.IO;
using System.Collections.Generic;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;

namespace Exoduser
{
    // Imports only the validated static, uncompressed profile extracted by tools/a2r-extract-models.cjs.
    public static class A2RModelsImporter
    {
        const string Root="Assets/Exoduser/Resources/A2R/Models3D";
        [Serializable] sealed class TextureSpec {public string file,role;public int wrap;}
        [Serializable] sealed class ModelSpec {public string id,file;public bool prepared;}
        [Serializable] sealed class Input {public ModelSpec[] models;public TextureSpec[] textures;}
        [Serializable] sealed class Primitive {public string file;public int material;public bool hasColors;}
        [Serializable] sealed class MeshSpec {public Primitive[] primitives;}
        [Serializable] sealed class Node {public string name;public int mesh;public float[] position,rotation,scale;public int[] children;}
        [Serializable] sealed class Mat {public string name,@base,normal,metal,ao,alpha;public float[] color;public float metallic,roughness,normalScale,aoStrength,cutoff;}
        [Serializable] sealed class Model {public string id,source;public bool prepared;public int[] roots;public Node[] nodes;public MeshSpec[] meshes;public Mat[] materials;}
        [Serializable] sealed class Output {public List<Record> models=new List<Record>();}
        [Serializable] sealed class Record {public string name,resource,source;public bool prepared;public float width,depth;public int lods,triangles;}
        static bool d3; // D3: untextured Blender materials carry linear glTF colours; small plants must not lose size to the legacy -.35 bounds trim.
        public static int Import()
        {
            var args=DevTools.ExoArgs.Get();int at=Array.IndexOf(args,"-inputRoot");string input=at>=0?args[at+1]:"I:/EXODUSER-Storage/map25d/a2redesign/model-import";
            var spec=JsonUtility.FromJson<Input>(File.ReadAllText(Path.Combine(input,"catalog.json")));bool original19=Array.IndexOf(args,"-originalR19")>=0;bool d4=Array.IndexOf(args,"-tripoD4")>=0;d3=Array.IndexOf(args,"-tripoD3")>=0||d4;bool foliage=Array.IndexOf(args,"-foliageR18")>=0||original19||d3;if(spec.models.Length!=(d4?6:d3?15:original19?1:foliage?7:50))throw new Exception("Expected 50 supplied A2R models");
            foreach(string folder in new[]{"Textures","Meshes","Materials","Prefabs"})Directory.CreateDirectory(Root+"/"+folder);AssetDatabase.Refresh(ImportAssetOptions.ForceSynchronousImport);
            foreach(var t in spec.textures){string file=Root+"/Textures/"+t.file;var importer=(TextureImporter)AssetImporter.GetAtPath(file);importer.textureType=t.role=="normal"?TextureImporterType.NormalMap:TextureImporterType.Default;importer.sRGBTexture=t.role=="base";importer.alphaIsTransparency=t.role=="base";importer.mipmapEnabled=true;importer.npotScale=TextureImporterNPOTScale.None;importer.textureCompression=TextureImporterCompression.Uncompressed;importer.maxTextureSize=4096;importer.filterMode=FilterMode.Trilinear;importer.anisoLevel=8;importer.wrapMode=t.wrap==33071?TextureWrapMode.Clamp:t.wrap==33648?TextureWrapMode.Mirror:TextureWrapMode.Repeat;importer.SaveAndReimport();}
            var output=foliage?JsonUtility.FromJson<Output>(File.ReadAllText(Root+"/catalog.json")):new Output();if(foliage)output.models.RemoveAll(r=>Array.Exists(spec.models,e=>e.id==r.name));foreach(var entry in spec.models){var model=JsonUtility.FromJson<Model>(File.ReadAllText(Path.Combine(input,entry.file)));output.models.Add(Build(input,model));}File.WriteAllText(Root+"/catalog.json",JsonUtility.ToJson(output,true));AssetDatabase.Refresh();AssetDatabase.SaveAssets();Debug.Log("A2R_MODELS_IMPORTED models="+output.models.Count+" textures="+spec.textures.Length);return 0;
        }
        [Serializable] sealed class Calibration {public CalibrationMaterial[] materials;}
        [Serializable] sealed class CalibrationMaterial {public string key;public float[] multiplier;}
        static Color CalibratedColor(string id,int index,Color original){var file=AssetDatabase.LoadAssetAtPath<TextAsset>(Root+"/color-corrections.json");if(file==null)return original;var input=JsonUtility.FromJson<Calibration>(file.text);foreach(var row in input.materials)if(row.key==id+"_"+index)return new Color(original.r*row.multiplier[0],original.g*row.multiplier[1],original.b*row.multiplier[2],original.a);return original;}
        static Texture2D Tex(string file){return string.IsNullOrEmpty(file)?null:AssetDatabase.LoadAssetAtPath<Texture2D>(Root+"/Textures/"+file);}
        static T Save<T>(T value,string file) where T:UnityEngine.Object {var old=AssetDatabase.LoadAssetAtPath<T>(file);if(old==null){AssetDatabase.CreateAsset(value,file);return value;}EditorUtility.CopySerialized(value,old);UnityEngine.Object.DestroyImmediate(value);EditorUtility.SetDirty(old);return old;}
        static Mesh ReadMesh(string file,string name)
        {
            using(var r=new BinaryReader(File.OpenRead(file))){if(r.ReadUInt32()!=0x3152334d)throw new Exception("Mesh input header");int n=r.ReadInt32(),count=r.ReadInt32();bool colors=r.ReadInt32()!=0;var v=new Vector3[n];var normals=new Vector3[n];var uv=new Vector2[n];var c=new Color[n];for(int i=0;i<n;i++){v[i]=new Vector3(r.ReadSingle(),r.ReadSingle(),r.ReadSingle());normals[i]=new Vector3(r.ReadSingle(),r.ReadSingle(),r.ReadSingle());uv[i]=new Vector2(r.ReadSingle(),r.ReadSingle());c[i]=new Color(r.ReadSingle(),r.ReadSingle(),r.ReadSingle(),r.ReadSingle());}var indices=new int[count];for(int i=0;i<count;i++)indices[i]=r.ReadInt32();var mesh=new Mesh{name=name,indexFormat=IndexFormat.UInt32,vertices=v,normals=normals,uv=uv,colors=c};mesh.SetTriangles(indices,0);mesh.RecalculateBounds();if(!colors){float lo=mesh.bounds.min.y,h=Mathf.Max(.001f,mesh.bounds.size.y);for(int i=0;i<n;i++)c[i]=new Color(Mathf.Pow(Mathf.Clamp01((v[i].y-lo)/h),2),((i*137)%997)/997f,0,1);mesh.colors=c;}mesh.RecalculateTangents();var bounds=mesh.bounds;bounds.Expand(.35f);mesh.bounds=bounds;return mesh;}
        }
        // The extractor's COLOR_0 is often SURFACE_SHADE, not motion. Recover the
        // explicit custom attribute from the original GLB after binary extraction.
        [Serializable] sealed class WindAttributes {public int _WIND_PULSE=-1;}
        [Serializable] sealed class WindPrimitive {public WindAttributes attributes;}
        [Serializable] sealed class WindMesh {public WindPrimitive[] primitives;}
        [Serializable] sealed class WindAccessor {public int bufferView=-1,byteOffset,componentType,count;public bool normalized;public string type;public WindSparse sparse;}
        [Serializable] sealed class WindSparse {public int count;}
        [Serializable] sealed class WindView {public int buffer,byteOffset,byteLength,byteStride;}
        [Serializable] sealed class WindDocument {public WindMesh[] meshes;public WindAccessor[] accessors;public WindView[] bufferViews;}
        public sealed class WindSource
        {
            readonly WindDocument doc;readonly byte[] bin;
            public WindSource(string file)
            {
                using(var r=new BinaryReader(File.OpenRead(file)))
                {
                    if(r.ReadUInt32()!=0x46546c67||r.ReadUInt32()!=2||r.ReadUInt32()!=r.BaseStream.Length)throw new InvalidDataException("Invalid wind GLB header");
                    string json=null;byte[] data=null;
                    while(r.BaseStream.Position<r.BaseStream.Length)
                    {
                        int length=checked((int)r.ReadUInt32());uint type=r.ReadUInt32();
                        if(length<0||r.BaseStream.Position+length>r.BaseStream.Length)throw new InvalidDataException("Truncated wind GLB");
                        var chunk=r.ReadBytes(length);if(type==0x4e4f534a)json=System.Text.Encoding.UTF8.GetString(chunk);else if(type==0x004e4942)data=chunk;
                    }
                    if(json==null||data==null)throw new InvalidDataException("Wind GLB needs JSON and BIN");
                    doc=JsonUtility.FromJson<WindDocument>(json);bin=data;
                }
            }
            public Color[] Read(int mesh,int primitive,int vertexCount)
            {
                var attrs=doc.meshes[mesh].primitives[primitive].attributes;
                if(attrs==null||attrs._WIND_PULSE<0)return null;
                var a=doc.accessors[attrs._WIND_PULSE];
                if(a.count!=vertexCount||a.bufferView<0||(a.sparse!=null&&a.sparse.count>0)||(a.type!="VEC3"&&a.type!="VEC4"))throw new InvalidDataException("Unsupported _WIND_PULSE accessor");
                int size=a.componentType==5126?4:a.componentType==5123?2:a.componentType==5121?1:0,channels=a.type=="VEC4"?4:3;
                if(size==0||(a.componentType!=5126&&!a.normalized))throw new InvalidDataException("Wind RGB needs FLOAT or normalized unsigned data");
                var v=doc.bufferViews[a.bufferView];int stride=v.byteStride==0?size*channels:v.byteStride;
                long end=(long)a.byteOffset+(long)(a.count-1)*stride+channels*size;
                if(v.buffer!=0||a.count<=0||stride<channels*size||a.byteOffset<0||v.byteOffset<0||end>v.byteLength||(long)v.byteOffset+end>bin.Length)throw new InvalidDataException("Wind accessor outside BIN");
                var colors=new Color[a.count];
                for(int i=0;i<a.count;i++)
                {
                    int start=v.byteOffset+a.byteOffset+i*stride;var color=new Color(0,0,0,1);
                    for(int c=0;c<channels;c++)
                    {
                        int at=start+c*size;float value=size==4?BitConverter.ToSingle(bin,at):size==2?BitConverter.ToUInt16(bin,at)/65535f:bin[at]/255f;
                        if(float.IsNaN(value)||float.IsInfinity(value)||value<0||value>1)throw new InvalidDataException("Wind RGB outside 0..1");
                        color[c]=value;
                    }
                    colors[i]=color;
                }
                return colors;
            }
        }
        public static bool ApplyWindPulse(Mesh mesh,WindSource source,int meshIndex,int primitiveIndex)
        {
            if(source==null)return false;var colors=source.Read(meshIndex,primitiveIndex,mesh.vertexCount);if(colors==null)return false;
            mesh.colors=colors;return true;
        }
        [Serializable] sealed class WindFixtures {public WindFixture[] files;}
        [Serializable] sealed class WindFixture {public string file;public WindExpectation[] primitives;}
        [Serializable] sealed class WindExpectation {public int mesh,primitive,count;public float[] first,last;}
        static void WindRequire(bool value,string message){if(!value)throw new InvalidOperationException("A2R wind: "+message);}
        public static int VerifyWind()
        {
            var args=DevTools.ExoArgs.Get();int at=Array.IndexOf(args,"-windFixtures");
            WindRequire(at>=0&&at+1<args.Length,"external fixture path required");
            var fixtures=JsonUtility.FromJson<WindFixtures>(File.ReadAllText(args[at+1]));int primitives=0,vertices=0;
            foreach(var entry in fixtures.files)
            {
                var source=new WindSource(entry.file);
                foreach(var p in entry.primitives)
                {
                    var mesh=new Mesh{indexFormat=IndexFormat.UInt32,vertices=new Vector3[p.count]};
                    try
                    {
                        WindRequire(ApplyWindPulse(mesh,source,p.mesh,p.primitive),"custom attribute missing "+entry.file);
                        var colors=mesh.colors;WindRequire(colors.Length==p.count,"vertex count");
                        for(int c=0;c<4;c++){WindRequire(Mathf.Abs(colors[0][c]-p.first[c])<.000001f,"first custom RGB");WindRequire(Mathf.Abs(colors[p.count-1][c]-p.last[c])<.000001f,"last custom RGB");}
                        WindRequire(mesh.vertices[0]==Vector3.zero,"import changed geometry");vertices+=p.count;primitives++;
                    }
                    finally{UnityEngine.Object.DestroyImmediate(mesh);}
                }
            }
            // A comparison toggle must stop vegetation without disabling water dynamics.
            var host=new GameObject("wind verification only");
            var mossMesh=new Mesh{vertices=new[]{Vector3.zero,Vector3.right,Vector3.up,Vector3.up+Vector3.right},triangles=new[]{0,2,1,1,2,3}};mossMesh.RecalculateBounds();
            var mossMat=new Material(Resources.Load<Shader>("Shaders/A2HangingMoss"));var fadeMat=new Material(Resources.Load<Shader>("A2R/LitFade"));
            try
            {
                var moss=new GameObject("editor moss");moss.transform.SetParent(host.transform,false);moss.AddComponent<MeshFilter>().sharedMesh=mossMesh;moss.AddComponent<MeshRenderer>().sharedMaterial=mossMat;
                var portion=new GameObject("A2R sight circle portion");portion.transform.SetParent(moss.transform,false);portion.AddComponent<MeshFilter>().sharedMesh=mossMesh;var fade=portion.AddComponent<MeshRenderer>();fade.sharedMaterial=fadeMat;
                var nature=host.AddComponent<Exoduser.UnityPort.A2RNatureDynamics>();
                typeof(Exoduser.UnityPort.A2RNatureDynamics).GetMethod("PrepareHangingMoss",System.Reflection.BindingFlags.Instance|System.Reflection.BindingFlags.NonPublic).Invoke(nature,new object[]{host.transform});
                var prepared=moss.GetComponent<MeshFilter>().sharedMesh;
                WindRequire(prepared!=mossMesh&&prepared.colors[0].r==1&&prepared.colors[2].r==0,"moss top pinned");
                WindRequire(portion.GetComponent<MeshFilter>().sharedMesh==prepared,"moss fade geometry match");
                nature.SetLook(true);var block=new MaterialPropertyBlock();fade.GetPropertyBlock(block);WindRequire(Mathf.Abs(block.GetVector("_A2R3DWind").x-.065f)<.000001f,"moss LitFade amplitude");
                WindRequire(Shader.GetGlobalFloat("_A2RNatureOn")==1,"water remains enabled");WindRequire(Shader.GetGlobalFloat("_A2RWindOff")==1,"off flag bound");nature.SetLook(false);WindRequire(Shader.GetGlobalFloat("_A2R3DWindOn")==0,"look reset");
            }
            finally{UnityEngine.Object.DestroyImmediate(host);UnityEngine.Object.DestroyImmediate(mossMesh);UnityEngine.Object.DestroyImmediate(mossMat);UnityEngine.Object.DestroyImmediate(fadeMat);}
            foreach(var name in new[]{"A2R/LitOpaque","A2R/LitFade","A2R/CardOpaque","A2R/CardFade","Shaders/A2HangingMoss"})
            {
                var shader=Resources.Load<Shader>(name);WindRequire(shader!=null,"shader missing "+name);
                var material=new Material(shader);
                try{for(int pass=0;pass<material.passCount;pass++)ShaderUtil.CompilePass(material,pass,true);WindRequire(!ShaderUtil.ShaderHasError(shader),"shader compile "+name);}
                finally{UnityEngine.Object.DestroyImmediate(material);}
            }
            Debug.Log("A2R_WIND_VERIFY_PASS models="+fixtures.files.Length+" primitives="+primitives+" vertices="+vertices+" shaders=5 mossPinned=1 fadeMatch=1 off=1 water=1");return 0;
        }
        static Record Build(string input,Model model)
        {
            var materials=new Material[model.materials.Length];for(int i=0;i<materials.Length;i++){var s=model.materials[i];var mat=new Material(Resources.Load<Shader>("A2R/LitOpaque")){name=model.id+" "+s.name,enableInstancing=true};mat.EnableKeyword("_SPECULARHIGHLIGHTS_OFF");mat.EnableKeyword("_ENVIRONMENTREFLECTIONS_OFF");mat.SetTexture("_BaseMap",Tex(s.@base));mat.SetColor("_BaseColor",d3&&string.IsNullOrEmpty(s.@base)?new Color(s.color[0],s.color[1],s.color[2],s.color[3]).gamma:CalibratedColor(model.id,i,new Color(s.color[0],s.color[1],s.color[2],s.color[3])));mat.SetFloat("_Metallic",s.metallic);mat.SetFloat("_Smoothness",model.id=="sword_pile"||model.id=="hang_cage"?.6f:.3f);if(!string.IsNullOrEmpty(s.normal)){mat.SetTexture("_BumpMap",Tex(s.normal));mat.SetFloat("_BumpScale",s.normalScale);mat.EnableKeyword("_NORMALMAP");}if(!string.IsNullOrEmpty(s.metal)){mat.SetTexture("_MetallicGlossMap",Tex(s.metal));mat.EnableKeyword("_METALLICSPECGLOSSMAP");}if(!string.IsNullOrEmpty(s.ao)){mat.SetTexture("_OcclusionMap",Tex(s.ao));mat.SetFloat("_OcclusionStrength",s.aoStrength);mat.EnableKeyword("_OCCLUSIONMAP");}if(s.alpha!="OPAQUE"){mat.SetFloat("_Cutoff",s.cutoff);mat.EnableKeyword("_ALPHATEST_ON");}materials[i]=Save(mat,Root+"/Materials/"+model.id+"_"+i+".mat");}
            var windSource=File.Exists(model.source)?new WindSource(model.source):null;
            var meshes=new Mesh[model.meshes.Length][];int triangleCount=0;for(int i=0;i<meshes.Length;i++){meshes[i]=new Mesh[model.meshes[i].primitives.Length];for(int j=0;j<meshes[i].Length;j++){var p=model.meshes[i].primitives[j];var mesh=ReadMesh(Path.Combine(input,p.file),model.id+" mesh"+i+" primitive"+j);
                if(ApplyWindPulse(mesh,windSource,i,j))
                {
                    // Keep pulse <=3% even for a thin primitive. All users of a shared
                    // material use its smallest positive local dimension as the bound.
                    var b=mesh.bounds;if(!d3)b.Expand(-.35f);float size=Mathf.Min(b.size.x,Mathf.Min(b.size.y,b.size.z));
                    var mat=materials[p.material];var wind=mat.GetVector("_A2R3DWind");wind.w=wind.w>0?Mathf.Min(wind.w,size):size;mat.SetVector("_A2R3DWind",wind);EditorUtility.SetDirty(mat);
                }
                triangleCount+=mesh.triangles.Length/3;meshes[i][j]=Save(mesh,Root+"/Meshes/"+model.id+"_"+i+"_"+j+".asset");}}
            var root=new GameObject(model.id);var space=new GameObject("Original glTF nodes");space.transform.SetParent(root.transform,false);var nodes=new GameObject[model.nodes.Length];var renderers=new List<Renderer>();var lod=new List<Renderer>[] {new List<Renderer>(),new List<Renderer>(),new List<Renderer>()};
            try{for(int i=0;i<nodes.Length;i++){var s=model.nodes[i];nodes[i]=new GameObject(s.name);nodes[i].transform.SetParent(space.transform,false);nodes[i].transform.localPosition=new Vector3(s.position[0],s.position[1],s.position[2]);nodes[i].transform.localRotation=new Quaternion(s.rotation[0],s.rotation[1],s.rotation[2],s.rotation[3]);nodes[i].transform.localScale=new Vector3(s.scale[0],s.scale[1],s.scale[2]);}for(int i=0;i<nodes.Length;i++)foreach(int child in model.nodes[i].children)nodes[child].transform.SetParent(nodes[i].transform,false);
                for(int i=0;i<nodes.Length;i++){var n=model.nodes[i];if(n.mesh<0)continue;int level=n.name.IndexOf("LOD2",StringComparison.OrdinalIgnoreCase)>=0?2:n.name.IndexOf("LOD1",StringComparison.OrdinalIgnoreCase)>=0?1:0;for(int j=0;j<meshes[n.mesh].Length;j++){var go=new GameObject("primitive "+j);go.transform.SetParent(nodes[i].transform,false);go.AddComponent<MeshFilter>().sharedMesh=meshes[n.mesh][j];var r=go.AddComponent<MeshRenderer>();r.sharedMaterial=materials[model.meshes[n.mesh].primitives[j].material];r.shadowCastingMode=ShadowCastingMode.On;r.receiveShadows=true;renderers.Add(r);lod[level].Add(r);}}
                if(renderers.Count==0)throw new Exception("Model has no renderers "+model.id);var source=lod[0].Count>0?lod[0]:renderers;bool first=true;Bounds b=new Bounds();foreach(var r in source){var mesh=r.GetComponent<MeshFilter>().sharedMesh;var bounds=mesh.bounds;if(!d3)bounds.Expand(-.35f);Vector3 low=new Vector3(float.PositiveInfinity,float.PositiveInfinity,float.PositiveInfinity),high=-new Vector3(float.PositiveInfinity,float.PositiveInfinity,float.PositiveInfinity);for(int k=0;k<8;k++){var v=r.transform.TransformPoint(bounds.center+Vector3.Scale(bounds.extents,new Vector3((k&1)==0?-1:1,(k&2)==0?-1:1,(k&4)==0?-1:1)));low=Vector3.Min(low,v);high=Vector3.Max(high,v);}var rb=new Bounds((low+high)*.5f,high-low);if(first){b=rb;first=false;}else b.Encapsulate(rb);}float h=Mathf.Max(.001f,b.size.y);space.transform.localScale=Vector3.one/h;space.transform.localPosition=new Vector3(-b.center.x,-b.min.y,-b.center.z)/h;
                var populated=new List<List<Renderer>>();foreach(var level in lod)if(level.Count>0)populated.Add(level);if(lod[0].Count==0)lod=populated.ToArray();int levels=lod.Length==3?(lod[2].Count>0?3:lod[1].Count>0?2:1):lod.Length;var group=root.AddComponent<LODGroup>();group.fadeMode=LODFadeMode.None;var options=new LOD[levels];for(int i=0;i<levels;i++)options[i]=new LOD(i==levels-1?.00001f:i==0?.18f:.06f,lod[i].ToArray());group.SetLODs(options);group.RecalculateBounds();PrefabUtility.SaveAsPrefabAsset(root,Root+"/Prefabs/"+model.id+".prefab");return new Record{name=model.id,resource="A2R/Models3D/Prefabs/"+model.id,source=model.source,prepared=model.prepared,width=b.size.x/h,depth=b.size.z/h,lods=levels,triangles=triangleCount};}
            finally{UnityEngine.Object.DestroyImmediate(root);}
        }
    }
}
