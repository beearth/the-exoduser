using System;
using System.IO;
using System.Reflection;
using System.Diagnostics;
using UnityEditor;
using UnityEngine;
using Exoduser.UnityPort;

// Asset-only assembly probe: inactive host, no Awake, scene, simulation or Player.
public static class A2FieldBakeProbe
{
    const BindingFlags Flags=BindingFlags.Instance|BindingFlags.NonPublic;
    static void Set(Component game,string field,object value){game.GetType().GetField(field,Flags).SetValue(game,value);}
    public static void Measure()
    {
        var output=PortVerification.Argument("-output");
        if(string.IsNullOrEmpty(output))throw new ArgumentException("-output required");
        Directory.CreateDirectory(output);
        var baseline=PortVerification.Argument("-fieldbuild-baseline-assembly");
        if(string.IsNullOrEmpty(baseline))baseline=Path.Combine(Directory.GetParent(output).FullName,"baseline/Exoduser.FieldbuildBaseline.dll");
        if(!File.Exists(baseline))throw new FileNotFoundException("Compile the unchanged runtime as Exoduser.FieldbuildBaseline.dll first, or supply -fieldbuild-baseline-assembly",baseline);
        MeasureVersion(output,Assembly.LoadFrom(baseline),"baseline");
        MeasureVersion(output,typeof(NativeGame).Assembly,"optimized");
        Compare(output);
    }
    static void MeasureVersion(string output,Assembly assembly,string version)
    {
        Func<string,Type> type=name=>assembly.GetType("Exoduser.UnityPort."+name,true);
        var remodel=type("NativeRemodel3D");var fieldSlot=remodel.GetField("Field");var forestSlot=remodel.GetField("ForestA2");
        var previousField=fieldSlot.GetValue(null);var previousForest=forestSlot.GetValue(null);
        var host=new GameObject("A2 field asset probe");host.SetActive(false);
        var root=new GameObject("A2 probe root");
        var camera=new GameObject("A2 probe camera");camera.SetActive(false);
        Material soil=null;
        try
        {
            var game=host.AddComponent(type("NativeGame"));
            var registered=JsonUtility.FromJson<MapData>(Resources.Load<TextAsset>("Data/ch1_map").text);
            if(registered.colliders==null||registered.props==null||registered.chunks==null)throw new InvalidDataException("Registered map arrays missing");
            // JsonUtility cannot build nested classes from a reference-only assembly.
            // Parse its registered project type and copy every public data field.
            var data=CopyData(registered,type("MapData"));
            UnityEngine.Debug.Log("[A2 전체필드] 검사 맵 "+version+" tiles="+registered.tiles.Length+" colliders="+registered.colliders.Length+" props="+registered.props.Length+" chunks="+registered.chunks.Length);
            type("NativeGame").GetProperty("Map").SetValue(game,Activator.CreateInstance(type("SourceMap"),new[]{data}));
            var field=Activator.CreateInstance(type("A2FieldLayout"),new[]{data});fieldSlot.SetValue(null,field);forestSlot.SetValue(null,true);
            Set(game,"a2Field",field);Set(game,"a2Root",root);Set(game,"r3Roots",new GameObject[0]);Set(game,"r3Cam",camera.AddComponent<Camera>());
            soil=new Material(Shader.Find("EXODUSER/HellGroundPBR"));Set(game,"a2FieldSoil",soil);
            File.WriteAllText(Path.Combine(output,version+"-stages.tsv"),"단계\t밀리초\n");
            A2RStage.Begin();var total=Stopwatch.StartNew();
            foreach(var name in new[]{"A2FieldOuterMass","A2Foreground","A2FieldLandmarks","A2FieldConnections","A2FieldGround","A2FieldGroundCover","A2BridgeMoss","A2FieldAtmosphere"})
            {
                var timer=Stopwatch.StartNew();
                type("NativeGame").GetMethod(name,Flags).Invoke(game,name=="A2Foreground"?new object[]{true}:null);
                File.AppendAllText(Path.Combine(output,version+"-stages.tsv"),name+"\t"+timer.Elapsed.TotalMilliseconds.ToString("F3",System.Globalization.CultureInfo.InvariantCulture)+"\n");
                type("NativeGame").GetMethod("A2FieldCostFlush",Flags).Invoke(game,new object[]{name});
                A2RStage.Mark(name);
            }
            UnityEngine.Debug.Log("[A2 전체필드] 에셋 조립 검사 "+total.ElapsedMilliseconds+"ms / Player 측정 아님");
            // Store actual geometry in traversal order for before/after comparison.
            // Hidden receiver meshes are included; material, camera and visual gates remain separate.
            WriteGeometry(Path.Combine(output,version+"-geometry.bin"),root,field);
        }
        finally
        {
            fieldSlot.SetValue(null,previousField);forestSlot.SetValue(null,previousForest);
            UnityEngine.Object.DestroyImmediate(host);UnityEngine.Object.DestroyImmediate(root);UnityEngine.Object.DestroyImmediate(camera);
            if(soil!=null)UnityEngine.Object.DestroyImmediate(soil);
        }
    }
    public static void WriteGeometry(string file,GameObject root,object field)
    {
            using(var writer=new BinaryWriter(File.Create(file)))
            {
                var filters=root.GetComponentsInChildren<MeshFilter>(true);writer.Write(filters.Length);
                foreach(var filter in filters)
                {
                    var mesh=filter.sharedMesh;writer.Write(filter.gameObject.name);
                    writer.Write(mesh.isReadable);
                    // Unchanged imported meshes stay shared and keep their import flags.
                    if(!mesh.isReadable)
                    {
                        string guid;long localId;
                        if(!AssetDatabase.TryGetGUIDAndLocalFileIdentifier(mesh.GetEntityId(),out guid,out localId))throw new InvalidDataException("Unreadable mesh has no asset identity: "+mesh.name);
                        writer.Write(guid);writer.Write(localId);continue;
                    }
                    var points=mesh.vertices;writer.Write(points.Length);
                    foreach(var p in points){writer.Write(p.x);writer.Write(p.y);writer.Write(p.z);}
                    var normals=mesh.normals;writer.Write(normals.Length);
                    foreach(var n in normals){writer.Write(n.x);writer.Write(n.y);writer.Write(n.z);}
                    var uv=mesh.uv;writer.Write(uv.Length);foreach(var u in uv){writer.Write(u.x);writer.Write(u.y);}
                    var tangents=mesh.tangents;writer.Write(tangents.Length);foreach(var t in tangents){writer.Write(t.x);writer.Write(t.y);writer.Write(t.z);writer.Write(t.w);}
                    var indices=mesh.triangles;writer.Write(indices.Length);foreach(int index in indices)writer.Write(index);
                }
                var height=field.GetType().GetMethod("Height");
                for(int y=0;y<=160;y++)for(int x=0;x<=160;x++)writer.Write((float)height.Invoke(field,new object[]{x*.5f,-y*.5f}));
            }
    }
    public static void Compare(string output)
    {
        float maxPosition=0,maxNormal=0,maxTangent=0,maxHeight=0;
        using(var a=new BinaryReader(File.OpenRead(Path.Combine(output,"baseline-geometry.bin"))))
        using(var b=new BinaryReader(File.OpenRead(Path.Combine(output,"optimized-geometry.bin"))))
        {
            int count=a.ReadInt32();if(count!=b.ReadInt32())throw new Exception("Mesh count changed");
            for(int mesh=0;mesh<count;mesh++)
            {
                var name=a.ReadString();if(name!=b.ReadString())throw new Exception("Traversal changed: "+name);
                bool readable=a.ReadBoolean();if(readable!=b.ReadBoolean())throw new Exception("Readability changed: "+name);
                if(!readable){if(a.ReadString()!=b.ReadString()||a.ReadInt64()!=b.ReadInt64())throw new Exception("Shared asset changed: "+name);continue;}
                maxPosition=Mathf.Max(maxPosition,CompareChannel(a,b,3,false));
                maxNormal=Mathf.Max(maxNormal,CompareChannel(a,b,3,false));
                if(CompareChannel(a,b,2,false)!=0)throw new Exception("UV changed: "+name);
                maxTangent=Mathf.Max(maxTangent,CompareChannel(a,b,4,false));
                CompareChannel(a,b,1,true);
            }
            for(int i=0;i<161*161;i++)maxHeight=Mathf.Max(maxHeight,Mathf.Abs(a.ReadSingle()-b.ReadSingle()));
            if(a.BaseStream.Position!=a.BaseStream.Length||b.BaseStream.Position!=b.BaseStream.Length)throw new Exception("Geometry data length changed");
        }
        var summary="정점 최대 차="+maxPosition+", 법선="+maxNormal+", 탄젠트="+maxTangent+", 표시 높이="+maxHeight+"; UV·인덱스 동일. Player 시간·화면·끄기 인자 미검증. Editor 후측정은 리소스 캐시가 데워진 조건.\n";
        File.WriteAllText(Path.Combine(output,"comparison.txt"),summary);
        if(maxPosition>1e-5f||maxNormal>1e-4f||maxTangent>1e-4f||maxHeight>1e-5f)throw new Exception(summary);
        File.WriteAllText(Path.Combine(output,"probe-ok.txt"),summary);
    }
    static float CompareChannel(BinaryReader a,BinaryReader b,int stride,bool indices)
    {
        int count=a.ReadInt32();if(count!=b.ReadInt32())throw new Exception("Mesh channel length changed");
        float max=0;
        for(int i=0;i<count*stride;i++)
        {
            if(indices){if(a.ReadInt32()!=b.ReadInt32())throw new Exception("Triangle index changed");}
            else {float x=a.ReadSingle(),y=b.ReadSingle();if(float.IsNaN(x)||float.IsNaN(y))throw new Exception("NaN mesh channel");max=Mathf.Max(max,Mathf.Abs(x-y));}
        }
        return max;
    }
    static object CopyData(object source,Type target)
    {
        if(source==null)return null;
        if(target.IsPrimitive||target.IsEnum||target==typeof(string))return source;
        if(target.IsArray)
        {
            var input=(Array)source;var element=target.GetElementType();var result=Array.CreateInstance(element,input.Length);
            for(int i=0;i<input.Length;i++)result.SetValue(CopyData(input.GetValue(i),element),i);
            return result;
        }
        var copy=Activator.CreateInstance(target);
        foreach(var field in target.GetFields(BindingFlags.Public|BindingFlags.Instance))
        {
            var original=source.GetType().GetField(field.Name,BindingFlags.Public|BindingFlags.Instance);
            if(original==null)throw new InvalidDataException("Map schema mismatch: "+field.Name);
            field.SetValue(copy,CopyData(original.GetValue(source),field.FieldType));
        }
        return copy;
    }
}
