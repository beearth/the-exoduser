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
        public static int Import()
        {
            var args=DevTools.ExoArgs.Get();int at=Array.IndexOf(args,"-inputRoot");string input=at>=0?args[at+1]:"I:/EXODUSER-Storage/map25d/a2redesign/model-import";
            var spec=JsonUtility.FromJson<Input>(File.ReadAllText(Path.Combine(input,"catalog.json")));if(spec.models.Length!=50)throw new Exception("Expected 50 supplied A2R models");
            foreach(string folder in new[]{"Textures","Meshes","Materials","Prefabs"})Directory.CreateDirectory(Root+"/"+folder);AssetDatabase.Refresh(ImportAssetOptions.ForceSynchronousImport);
            foreach(var t in spec.textures){string file=Root+"/Textures/"+t.file;var importer=(TextureImporter)AssetImporter.GetAtPath(file);importer.textureType=t.role=="normal"?TextureImporterType.NormalMap:TextureImporterType.Default;importer.sRGBTexture=t.role=="base";importer.alphaIsTransparency=t.role=="base";importer.mipmapEnabled=true;importer.npotScale=TextureImporterNPOTScale.None;importer.textureCompression=TextureImporterCompression.Uncompressed;importer.maxTextureSize=4096;importer.filterMode=FilterMode.Trilinear;importer.anisoLevel=8;importer.wrapMode=t.wrap==33071?TextureWrapMode.Clamp:t.wrap==33648?TextureWrapMode.Mirror:TextureWrapMode.Repeat;importer.SaveAndReimport();}
            var output=new Output();foreach(var entry in spec.models){var model=JsonUtility.FromJson<Model>(File.ReadAllText(Path.Combine(input,entry.file)));output.models.Add(Build(input,model));}File.WriteAllText(Root+"/catalog.json",JsonUtility.ToJson(output,true));AssetDatabase.Refresh();AssetDatabase.SaveAssets();Debug.Log("A2R_MODELS_IMPORTED models="+output.models.Count+" textures="+spec.textures.Length);return 0;
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
        static Record Build(string input,Model model)
        {
            var materials=new Material[model.materials.Length];for(int i=0;i<materials.Length;i++){var s=model.materials[i];var mat=new Material(Resources.Load<Shader>("A2R/LitOpaque")){name=model.id+" "+s.name,enableInstancing=true};mat.SetTexture("_BaseMap",Tex(s.@base));mat.SetColor("_BaseColor",CalibratedColor(model.id,i,new Color(s.color[0],s.color[1],s.color[2],s.color[3])));mat.SetFloat("_Metallic",s.metallic);mat.SetFloat("_Smoothness",model.id=="sword_pile"||model.id=="hang_cage"?.6f:.3f);if(!string.IsNullOrEmpty(s.normal)){mat.SetTexture("_BumpMap",Tex(s.normal));mat.SetFloat("_BumpScale",s.normalScale);mat.EnableKeyword("_NORMALMAP");}if(!string.IsNullOrEmpty(s.metal)){mat.SetTexture("_MetallicGlossMap",Tex(s.metal));mat.EnableKeyword("_METALLICSPECGLOSSMAP");}if(!string.IsNullOrEmpty(s.ao)){mat.SetTexture("_OcclusionMap",Tex(s.ao));mat.SetFloat("_OcclusionStrength",s.aoStrength);mat.EnableKeyword("_OCCLUSIONMAP");}if(s.alpha!="OPAQUE"){mat.SetFloat("_Cutoff",s.cutoff);mat.EnableKeyword("_ALPHATEST_ON");}materials[i]=Save(mat,Root+"/Materials/"+model.id+"_"+i+".mat");}
            var meshes=new Mesh[model.meshes.Length][];int triangleCount=0;for(int i=0;i<meshes.Length;i++){meshes[i]=new Mesh[model.meshes[i].primitives.Length];for(int j=0;j<meshes[i].Length;j++){var p=model.meshes[i].primitives[j];var mesh=ReadMesh(Path.Combine(input,p.file),model.id+" mesh"+i+" primitive"+j);triangleCount+=mesh.triangles.Length/3;meshes[i][j]=Save(mesh,Root+"/Meshes/"+model.id+"_"+i+"_"+j+".asset");}}
            var root=new GameObject(model.id);var space=new GameObject("Original glTF nodes");space.transform.SetParent(root.transform,false);var nodes=new GameObject[model.nodes.Length];var renderers=new List<Renderer>();var lod=new List<Renderer>[] {new List<Renderer>(),new List<Renderer>(),new List<Renderer>()};
            try{for(int i=0;i<nodes.Length;i++){var s=model.nodes[i];nodes[i]=new GameObject(s.name);nodes[i].transform.SetParent(space.transform,false);nodes[i].transform.localPosition=new Vector3(s.position[0],s.position[1],s.position[2]);nodes[i].transform.localRotation=new Quaternion(s.rotation[0],s.rotation[1],s.rotation[2],s.rotation[3]);nodes[i].transform.localScale=new Vector3(s.scale[0],s.scale[1],s.scale[2]);}for(int i=0;i<nodes.Length;i++)foreach(int child in model.nodes[i].children)nodes[child].transform.SetParent(nodes[i].transform,false);
                for(int i=0;i<nodes.Length;i++){var n=model.nodes[i];if(n.mesh<0)continue;int level=n.name.IndexOf("LOD2",StringComparison.OrdinalIgnoreCase)>=0?2:n.name.IndexOf("LOD1",StringComparison.OrdinalIgnoreCase)>=0?1:0;for(int j=0;j<meshes[n.mesh].Length;j++){var go=new GameObject("primitive "+j);go.transform.SetParent(nodes[i].transform,false);go.AddComponent<MeshFilter>().sharedMesh=meshes[n.mesh][j];var r=go.AddComponent<MeshRenderer>();r.sharedMaterial=materials[model.meshes[n.mesh].primitives[j].material];r.shadowCastingMode=ShadowCastingMode.On;r.receiveShadows=true;renderers.Add(r);lod[level].Add(r);}}
                if(renderers.Count==0)throw new Exception("Model has no renderers "+model.id);var source=lod[0].Count>0?lod[0]:renderers;bool first=true;Bounds b=new Bounds();foreach(var r in source){var mesh=r.GetComponent<MeshFilter>().sharedMesh;var bounds=mesh.bounds;bounds.Expand(-.35f);Vector3 low=new Vector3(float.PositiveInfinity,float.PositiveInfinity,float.PositiveInfinity),high=-new Vector3(float.PositiveInfinity,float.PositiveInfinity,float.PositiveInfinity);for(int k=0;k<8;k++){var v=r.transform.TransformPoint(bounds.center+Vector3.Scale(bounds.extents,new Vector3((k&1)==0?-1:1,(k&2)==0?-1:1,(k&4)==0?-1:1)));low=Vector3.Min(low,v);high=Vector3.Max(high,v);}var rb=new Bounds((low+high)*.5f,high-low);if(first){b=rb;first=false;}else b.Encapsulate(rb);}float h=Mathf.Max(.001f,b.size.y);space.transform.localScale=Vector3.one/h;space.transform.localPosition=new Vector3(-b.center.x,-b.min.y,-b.center.z)/h;
                int levels=lod[2].Count>0?3:lod[1].Count>0?2:1;var group=root.AddComponent<LODGroup>();group.fadeMode=LODFadeMode.None;var options=new LOD[levels];for(int i=0;i<levels;i++)options[i]=new LOD(i==levels-1?.00001f:i==0?.18f:.06f,lod[i].ToArray());group.SetLODs(options);group.RecalculateBounds();PrefabUtility.SaveAsPrefabAsset(root,Root+"/Prefabs/"+model.id+".prefab");return new Record{name=model.id,resource="A2R/Models3D/Prefabs/"+model.id,source=model.source,prepared=model.prepared,width=b.size.x/h,depth=b.size.z/h,lods=levels,triangles=triangleCount};}
            finally{UnityEngine.Object.DestroyImmediate(root);}
        }
    }
}
