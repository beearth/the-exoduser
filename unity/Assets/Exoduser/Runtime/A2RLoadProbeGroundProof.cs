using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace Exoduser.UnityPort
{
    // Same-frame camera comparison avoids classifying animated water/wind between runs as a texture change.
    // Requires both explicit proof flag and the existing sandboxed --a2r-load-probe.
    public sealed class A2RLoadProbeGroundProof : MonoBehaviour
    {
        [Serializable] sealed class Manifest { public Pack[] packs; }
        [Serializable] sealed class Pack { public string resource; public string[] ids; }
        sealed class Slice { public Texture2DArray array; public int index; }
        sealed class Pair { public MeshRenderer renderer; public Material live, original, baked; }
        [Serializable] sealed class Frame
        {
            public string scene, originalPath, bakedPath;
            public int width,height,frame,groundRenderers,changedPixels,maxChannelDelta;
            public Vector3 cameraPosition;
        }
        [Serializable] sealed class Receipt
        {
            public string scope="actual game camera, original vs baked at the same Unity frame; full camera image including other world renderers; overlay-only UI is outside camera target";
            public List<Frame> frames=new List<Frame>();
        }
        readonly List<Pair> pairs=new List<Pair>();readonly Receipt receipt=new Receipt();
        string output;
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        static void Boot()
        {
            if(!A2RLoadProbe.Enabled || Array.IndexOf(Environment.GetCommandLineArgs(),"--a2r-ground-pixel-proof")<0)return;
            var go=new GameObject("A2R opt-in same-frame ground proof");DontDestroyOnLoad(go);go.AddComponent<A2RLoadProbeGroundProof>();
        }
        IEnumerator Start()
        {
            var args=Environment.GetCommandLineArgs();int at=Array.IndexOf(args,"-output");
            if(at<0)throw new InvalidOperationException("Ground proof requires smoke -output path");
            string smoke=args[at+1];output=Path.Combine(NativeQaSandbox.Root,"ground-pixel-proof");Directory.CreateDirectory(output);
            foreach(string scene in new[]{"02-field-entry","05-camp-3840"})
            {
                float deadline=Time.realtimeSinceStartup+600;
                while(!File.Exists(Path.Combine(smoke,scene+".png")) && Time.realtimeSinceStartup<deadline)yield return null;
                if(!File.Exists(Path.Combine(smoke,scene+".png")))throw new InvalidOperationException("Ground proof scene not reached: "+scene);
                var game=NativeGame.Instance;
                var field=typeof(NativeGame).GetField("r3Cam",BindingFlags.Instance|BindingFlags.NonPublic);
                var camera=field!=null?field.GetValue(game) as Camera:null;
                if(camera==null)throw new InvalidOperationException("Ground proof game-camera contract changed");
                if(pairs.Count==0)PreparePairs();
                Capture(camera,scene);yield return null;
            }
            Debug.Log("A2R_GROUND_PIXEL_PROOF_DONE frames="+receipt.frames.Count+" changedPixels="+TotalChanges());
            Destroy(gameObject);
        }
        int TotalChanges(){int total=0;foreach(var frame in receipt.frames)total+=frame.changedPixels;return total;}
        void PreparePairs()
        {
            var manifest=JsonUtility.FromJson<Manifest>(Resources.Load<TextAsset>("A2R/Baked/Ground/manifest").text);
            var slices=new Dictionary<string,Slice>(StringComparer.Ordinal);
            foreach(var pack in manifest.packs)
            {
                var array=Resources.Load<Texture2DArray>(pack.resource);
                for(int i=0;i<pack.ids.Length;i++)slices.Add(pack.ids[i],new Slice{array=array,index=i});
            }
            const string prefix="C10 terrain projection ";
            foreach(var renderer in UnityEngine.Object.FindObjectsByType<MeshRenderer>(FindObjectsInactive.Include,FindObjectsSortMode.None))
            {
                if(!renderer.gameObject.name.StartsWith(prefix,StringComparison.Ordinal))continue;
                string id=renderer.gameObject.name.Substring(prefix.Length);
                var live=renderer.sharedMaterial;var original=new Material(live);var baked=new Material(live);
                original.DisableKeyword("_A2R_GROUND_ARRAY");
                original.SetTexture("_MainTex",Resources.Load<Texture2D>("A2R/C10/Art/"+id));
                original.SetTexture("_NormalTex",Resources.Load<Texture2D>("A2R/C10/Art/"+id+"_normal"));
                original.SetTexture("_MaskTex",Resources.Load<Texture2D>("A2R/C10/Art/"+id+"_mask"));
                var paint=slices[id];var normal=slices[id+"_normal"];var mask=slices[id+"_mask"];
                baked.SetTexture("_MainArray",paint.array);baked.SetTexture("_NormalArray",normal.array);baked.SetTexture("_MaskArray",mask.array);
                baked.SetVector("_GroundSlices",new Vector4(paint.index,normal.index,mask.index,0));baked.EnableKeyword("_A2R_GROUND_ARRAY");
                pairs.Add(new Pair{renderer=renderer,live=live,original=original,baked=baked});
            }
            if(pairs.Count!=64)throw new InvalidOperationException("Ground proof requires all 64 projected tiles, got "+pairs.Count);
        }
        void Capture(Camera camera,string scene)
        {
            var target=new RenderTexture(Screen.width,Screen.height,24,RenderTextureFormat.ARGB32);target.Create();
            var frame=new Frame{scene=scene,width=target.width,height=target.height,frame=Time.frameCount,
                groundRenderers=pairs.Count,cameraPosition=camera.transform.position,
                originalPath=Path.Combine(output,scene+"-original.png"),bakedPath=Path.Combine(output,scene+"-baked.png")};
            try
            {
                foreach(var pair in pairs)pair.renderer.sharedMaterial=pair.original;
                var a=Render(camera,target);
                foreach(var pair in pairs)pair.renderer.sharedMaterial=pair.baked;
                var b=Render(camera,target);
                if(a.Length!=b.Length)throw new InvalidOperationException("Ground camera proof image shape changed");
                for(int i=0;i<a.Length;i+=4)
                {
                    bool changed=false;for(int c=0;c<4;c++){int delta=Math.Abs(a[i+c]-b[i+c]);if(delta!=0)changed=true;frame.maxChannelDelta=Math.Max(frame.maxChannelDelta,delta);}
                    if(changed)frame.changedPixels++;
                }
                Save(frame.originalPath,a,target.width,target.height);Save(frame.bakedPath,b,target.width,target.height);
                receipt.frames.Add(frame);File.WriteAllText(Path.Combine(output,"proof.json"),JsonUtility.ToJson(receipt,true));
                Debug.Log("A2R_GROUND_PIXEL_PROOF scene="+scene+" frame="+frame.frame+" size="+frame.width+"x"+frame.height+
                    " changedPixels="+frame.changedPixels+" maxDelta="+frame.maxChannelDelta);
            }
            finally
            {
                foreach(var pair in pairs)if(pair.renderer!=null)pair.renderer.sharedMaterial=pair.live;
                target.Release();Destroy(target);
            }
        }
        static byte[] Render(Camera camera,RenderTexture target)
        {
            RenderPipeline.SubmitRenderRequest(camera,new UniversalRenderPipeline.SingleCameraRequest{destination=target});
            var request=AsyncGPUReadback.Request(target,0,TextureFormat.RGBA32);request.WaitForCompletion();
            if(request.hasError)throw new InvalidOperationException("Ground camera proof readback failed");
            return request.GetData<byte>().ToArray();
        }
        static void Save(string path,byte[] pixels,int width,int height)
        {
            var image=new Texture2D(width,height,TextureFormat.RGBA32,false);
            try{image.LoadRawTextureData(pixels);image.Apply(false,false);File.WriteAllBytes(path,image.EncodeToPNG());}
            finally{Destroy(image);}
        }
        void OnDestroy()
        {
            foreach(var pair in pairs)
            {
                if(pair.renderer!=null)pair.renderer.sharedMaterial=pair.live;
                Destroy(pair.original);Destroy(pair.baked);
            }
        }
    }
}
