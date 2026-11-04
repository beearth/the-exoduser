using System;
using System.IO;
using System.Reflection;
using UnityEngine;
using Exoduser.UnityPort;

public static class A2FieldBakePropertyCheck
{
    static int Bits(float value){return BitConverter.ToInt32(BitConverter.GetBytes(value),0);}
    static bool Same(Vector4 a,Vector4 b){for(int i=0;i<4;i++)if(Bits(a[i])!=Bits(b[i]))return false;return true;}
    public static void Verify()
    {
        var original=new GameObject("A2 property original");var cached=new GameObject("A2 property cached");Material material=null;
        try
        {
            material=new Material(Shader.Find("EXODUSER/A2HangingMoss"));
            var source=original.AddComponent<MeshRenderer>();source.sharedMaterial=material;
            var destination=cached.AddComponent<MeshRenderer>();destination.sharedMaterial=material;
            var before=new MaterialPropertyBlock();before.SetColor("_BaseColor",new Color(.6f,.62f,.4f,1));
            before.SetFloat("_BumpScale",.73f);before.SetVector("_A2R3DWind",new Vector4(.028f,.012f,-.023f,.17f));source.SetPropertyBlock(before);
            before.Clear();source.GetPropertyBlock(before);
            var legacyValue=new NativeGame.A2FieldCacheProperty{color=before.GetColor("_BaseColor")};
            var legacyDecoded=JsonUtility.FromJson<NativeGame.A2FieldCacheProperty>(JsonUtility.ToJson(legacyValue));
            var legacy=new MaterialPropertyBlock();legacy.SetColor("_BaseColor",legacyDecoded.color);
            if(Same(before.GetVector("_BaseColor"),legacy.GetVector("_BaseColor")))throw new InvalidDataException("Known colour replay loss was not reproduced");
            var read=typeof(A2FieldBakeBuild).GetMethod("ReadProperties",BindingFlags.Static|BindingFlags.NonPublic);
            var properties=(NativeGame.A2FieldCacheProperty[])read.Invoke(null,new object[]{source,source.sharedMaterials});
            var packed=new NativeGame.A2FieldCacheRenderer{properties=properties};
            var decoded=JsonUtility.FromJson<NativeGame.A2FieldCacheRenderer>(JsonUtility.ToJson(packed));
            typeof(NativeGame).GetMethod("A2FieldRestoreProperties",BindingFlags.Static|BindingFlags.NonPublic).Invoke(null,new object[]{destination,decoded.properties});
            var after=new MaterialPropertyBlock();destination.GetPropertyBlock(after);
            if(!Same(before.GetVector("_BaseColor"),after.GetVector("_BaseColor")))throw new InvalidDataException("Stored linear colour bits changed");
            if(!Same(before.GetColor("_BaseColor"),after.GetColor("_BaseColor")))throw new InvalidDataException("Observed colour bits changed");
            if(!Same(before.GetVector("_A2R3DWind"),after.GetVector("_A2R3DWind")))throw new InvalidDataException("Vector bits changed");
            if(Bits(before.GetFloat("_BumpScale"))!=Bits(after.GetFloat("_BumpScale")))throw new InvalidDataException("Scalar bits changed");
            var output=PortVerification.Argument("-output");Directory.CreateDirectory(output);
            File.WriteAllText(Path.Combine(output,"property-replay.txt"),"기존 Color/JSON 재설정 손실 재현. 실제 ReadProperties→JSON→런타임 복원으로 원시 색·관측 색·음수 포함 벡터·스칼라 비트 동일.");
            Debug.Log("[A2 전체필드] PropertyBlock 원시 비트 복원 검사 통과");
        }
        finally{UnityEngine.Object.DestroyImmediate(original);UnityEngine.Object.DestroyImmediate(cached);if(material!=null)UnityEngine.Object.DestroyImmediate(material);}
    }
}
