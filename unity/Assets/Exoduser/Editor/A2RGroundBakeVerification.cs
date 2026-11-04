using System;
using System.IO;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;
using System.Collections.Generic;

namespace Exoduser
{
    public static class A2RGroundBakeVerification
    {
        [Serializable] sealed class Input { public Tile[] groundTiles; }
        [Serializable] sealed class Tile { public string asset; }
        [Serializable] sealed class Layout { public int version; public Pack[] packs; }
        [Serializable] sealed class Pack { public string resource; public string[] ids; }
        sealed class Binding { public Texture2DArray array; public int slice; }
        [Serializable] sealed class Receipt
        {
            public int images, mips, changedBytes, renderPairs, changedPixels;
            public long comparedBytes, comparedPixels, visiblePixels;
        }
        public static void InspectAndRequireBake()
        {
            A2RGroundBakeProbeVerification.Verify();
            var input = JsonUtility.FromJson<Input>(Resources.Load<TextAsset>("A2R/web-assets").text);
            foreach(var suffix in new[] { "", "_normal", "_mask" })
            {
                var texture = Resources.Load<Texture2D>("A2R/C10/Art/"+input.groundTiles[0].asset+suffix);
                Debug.Log("A2R_GROUND_SOURCE format="+texture.format+" graphics="+texture.graphicsFormat+
                    " size="+texture.width+"x"+texture.height+" mips="+texture.mipmapCount+
                    " readable="+texture.isReadable+" filter="+texture.filterMode+" aniso="+texture.anisoLevel+
                    " wrap="+texture.wrapModeU+"/"+texture.wrapModeV);
            }
            // The first run must reject the missing bake, before implementation.
            if(Resources.Load<TextAsset>("A2R/Baked/Ground/manifest") == null)
                throw new InvalidOperationException("A2R_GROUND_EXPECTED_RED: exact-mip ground bake is missing");
        }
        public static void VerifyBake()
        {
            int limit=QualitySettings.globalTextureMipmapLimit;
            try{QualitySettings.globalTextureMipmapLimit=0;VerifyFullResolution();}
            finally{QualitySettings.globalTextureMipmapLimit=limit;}
        }
        static void VerifyFullResolution()
        {
            var text=Resources.Load<TextAsset>("A2R/Baked/Ground/manifest");
            Require(text!=null,"missing baked manifest");
            var layout=JsonUtility.FromJson<Layout>(text.text);
            Require(layout.version==1 && layout.packs!=null,"manifest version");
            var bindings=new Dictionary<string,Binding>(StringComparer.Ordinal);
            foreach(var pack in layout.packs)
            {
                var array=Resources.Load<Texture2DArray>(pack.resource);
                Require(array!=null && !array.isReadable,"persistent GPU-only array: "+pack.resource);
                Require(array.depth==pack.ids.Length,"array depth");
                for(int i=0;i<pack.ids.Length;i++) bindings.Add(pack.ids[i],new Binding {array=array,slice=i});
            }
            var input=JsonUtility.FromJson<Input>(Resources.Load<TextAsset>("A2R/web-assets").text);
            Require(input.groundTiles.Length==64 && bindings.Count==192,"exact 64 x 3 source coverage");
            var receipt=new Receipt();
            foreach(var tile in input.groundTiles) foreach(var suffix in new[]{"","_normal","_mask"})
            {
                string id=tile.asset+suffix;
                var source=Resources.Load<Texture2D>("A2R/C10/Art/"+id); var binding=bindings[id]; var array=binding.array;
                Require(source.graphicsFormat==array.graphicsFormat && source.width==array.width &&
                    source.height==array.height && source.mipmapCount==array.mipmapCount,"native format/mip shape: "+id);
                Require(source.filterMode==array.filterMode && source.anisoLevel==array.anisoLevel &&
                    source.wrapModeU==array.wrapModeU && source.wrapModeV==array.wrapModeV &&
                    source.wrapModeW==array.wrapModeW && source.mipMapBias==array.mipMapBias,"sampler unchanged: "+id);
                for(int mip=0;mip<source.mipmapCount;mip++)
                {
                    var before=AsyncGPUReadback.Request(source,mip);before.WaitForCompletion();
                    var after=AsyncGPUReadback.Request(array,mip,0,Mathf.Max(1,source.width>>mip),
                        0,Mathf.Max(1,source.height>>mip),binding.slice,1);after.WaitForCompletion();
                    Require(!before.hasError && !after.hasError,"GPU readback: "+id+" mip="+mip);
                    var a=before.GetData<byte>();var b=after.GetData<byte>();
                    Require(a.Length==b.Length,"native byte length");
                    for(int i=0;i<a.Length;i++) if(a[i]!=b[i]) receipt.changedBytes++;
                    receipt.comparedBytes+=a.Length;receipt.mips++;
                }
                receipt.images++;
            }
            Require(receipt.changedBytes==0,"all stored texels/mips byte-identical");
            VerifyShader(input,bindings,receipt);
            Require(receipt.changedPixels==0 && receipt.visiblePixels>0,"shader output must match and contain ground");
            var args=Environment.GetCommandLineArgs();int at=Array.IndexOf(args,"-output");
            string output=at>=0?args[at+1]:"I:/EXODUSER-Storage/codex-takeover/map-loadprof/editor";
            Directory.CreateDirectory(output);File.WriteAllText(Path.Combine(output,"bake-verification.json"),JsonUtility.ToJson(receipt,true));
            Debug.Log("A2R_GROUND_BAKE_PASS images="+receipt.images+" mips="+receipt.mips+" bytes="+receipt.comparedBytes+
                " changedBytes="+receipt.changedBytes+" renderPairs="+receipt.renderPairs+" pixels="+receipt.comparedPixels+
                " changedPixels="+receipt.changedPixels+" visiblePixels="+receipt.visiblePixels);
        }
        static void VerifyShader(Input input,Dictionary<string,Binding> bindings,Receipt receipt)
        {
            var shader=Resources.Load<Shader>("A2R/GroundPainting");
            Require(shader!=null && !ShaderUtil.ShaderHasError(shader),"ground shader compiles");
            var mesh=new Mesh();
            mesh.vertices=new[]{new Vector3(39,0,-39),new Vector3(41,0,-39),new Vector3(39,0,-41),new Vector3(41,0,-41)};
            mesh.normals=new[]{Vector3.up,Vector3.up,Vector3.up,Vector3.up};mesh.triangles=new[]{0,1,2,1,3,2};
            mesh.uv=new[]{Vector2.zero,Vector2.right,Vector2.up,Vector2.one};mesh.RecalculateBounds();
            bool async=ShaderUtil.allowAsyncCompilation;ShaderUtil.allowAsyncCompilation=false;
            try
            {
                foreach(var tile in input.groundTiles)
                {
                    var before=new Material(shader);var after=new Material(shader);
                    try
                    {
                        var normal=bindings[tile.asset+"_normal"];var mask=bindings[tile.asset+"_mask"];var paint=bindings[tile.asset];
                        before.SetTexture("_MainTex",Resources.Load<Texture2D>("A2R/C10/Art/"+tile.asset));
                        before.SetTexture("_NormalTex",Resources.Load<Texture2D>("A2R/C10/Art/"+tile.asset+"_normal"));
                        before.SetTexture("_MaskTex",Resources.Load<Texture2D>("A2R/C10/Art/"+tile.asset+"_mask"));
                        after.SetTexture("_MainArray",paint.array);after.SetTexture("_NormalArray",normal.array);after.SetTexture("_MaskArray",mask.array);
                        after.SetVector("_GroundSlices",new Vector4(paint.slice,normal.slice,mask.slice,0));after.EnableKeyword("_A2R_GROUND_ARRAY");
                        foreach(var size in new[]{64,256})
                        {
                            var a=Draw(mesh,before,size);var b=Draw(mesh,after,size);
                            Require(a.Length==b.Length,"shader image shape");
                            for(int i=0;i<a.Length;i+=4)
                            {
                                bool changed=false;for(int c=0;c<4;c++)if(a[i+c]!=b[i+c])changed=true;
                                if(changed)receipt.changedPixels++;
                                if(a[i+3]!=0)receipt.visiblePixels++;
                            }
                            receipt.comparedPixels+=a.Length/4;receipt.renderPairs++;
                        }
                    }
                    finally{UnityEngine.Object.DestroyImmediate(before);UnityEngine.Object.DestroyImmediate(after);}
                }
            }
            finally{ShaderUtil.allowAsyncCompilation=async;UnityEngine.Object.DestroyImmediate(mesh);}
        }
        static byte[] Draw(Mesh mesh,Material material,int size)
        {
            var target=new RenderTexture(size,size,24,RenderTextureFormat.ARGB32,RenderTextureReadWrite.Linear);target.Create();
            var command=new CommandBuffer();
            try
            {
                command.SetRenderTarget(target);command.ClearRenderTarget(true,true,Color.clear);
                var view=Matrix4x4.Scale(new Vector3(1,1,-1))*Matrix4x4.TRS(new Vector3(40,10,-40),Quaternion.Euler(90,0,0),Vector3.one).inverse;
                command.SetViewProjectionMatrices(view,GL.GetGPUProjectionMatrix(Matrix4x4.Ortho(-1,1,-1,1,.1f,100),true));
                command.DrawMesh(mesh,Matrix4x4.identity,material,0,0);Graphics.ExecuteCommandBuffer(command);
                var request=AsyncGPUReadback.Request(target);request.WaitForCompletion();
                Require(!request.hasError,"shader render readback");return request.GetData<byte>().ToArray();
            }
            finally{command.Release();target.Release();UnityEngine.Object.DestroyImmediate(target);}
        }
        static void Require(bool condition,string message)
        {
            if(!condition)throw new InvalidOperationException("A2R ground verification: "+message);
        }
    }
}
