using System;using System.Collections.Generic;using System.IO;using UnityEditor;using UnityEngine;
using Exoduser.UnityPort;
namespace Exoduser.CharacterLab
{
    // Mac batch import/contract gate only. PC compiles this code without running Unity.
    public static class DruidRigPixelVerification
    {
        const string PathName="Assets/Exoduser/Resources/Art/Bosses/Druid/OldmanV81.fbx";
        [Serializable] sealed class ClipReceipt {public string name;public float seconds,expectedSeconds,footSlipHorizontalCm;public bool rootOrLocomotion;}
        [Serializable] sealed class Receipt
        {
            public string scope="Unity import/Generic Avatar/31 clip lengths/local horizontal feet only; no gameplay visual or world foot plant PASS",animationType;
            public bool passed,avatarValid,humanoid,socket,fist;public int renderers,auxiliaryBones;
            public List<ClipReceipt> clips=new List<ClipReceipt>();public List<string> errors=new List<string>();
        }
        static string Key(string name){foreach(string key in NativeDruidRigPolicy.AllClips)if(name.Equals(key,StringComparison.OrdinalIgnoreCase)||name.EndsWith("|"+key,StringComparison.OrdinalIgnoreCase))return key;return null;}
        static Vector2 Horizontal(Transform bone){return new Vector2(bone.position.x,bone.position.z);}
        public static void Verify()
        {
            var result=new Receipt();GameObject model=null;bool sampling=false;
            try
            {
                var importer=AssetImporter.GetAtPath(PathName) as ModelImporter;if(importer==null)throw new InvalidOperationException("Druid FBX importer missing");
                result.animationType=importer.animationType.ToString();
                if(importer.materialName!=ModelImporterMaterialName.BasedOnMaterialName)result.errors.Add("Material labels must remain the LOCK palette names");
                if(importer.animationType!=ModelImporterAnimationType.Generic)result.errors.Add("Expected Generic exact Meshy bones");
                var prefab=AssetDatabase.LoadAssetAtPath<GameObject>(PathName);if(prefab==null)throw new InvalidOperationException("Druid model import failed");
                var animator=prefab.GetComponent<Animator>();result.avatarValid=animator!=null&&animator.avatar!=null&&animator.avatar.isValid;result.humanoid=animator!=null&&animator.isHuman;
                if(!result.avatarValid||result.humanoid)result.errors.Add("Generic Avatar validation failed");
                foreach(var t in prefab.GetComponentsInChildren<Transform>(true))
                {
                    if(t.name=="StaffSocket_L")result.socket=t.parent!=null&&t.parent.name=="LeftHand";
                    if(t.name.StartsWith("Cloak_Back_",StringComparison.Ordinal)||t.name.StartsWith("Panel_Front_",StringComparison.Ordinal)||t.name.StartsWith("Beard_",StringComparison.Ordinal)||t.name.StartsWith("Chain_L_",StringComparison.Ordinal))result.auxiliaryBones++;
                }
                if(!result.socket)result.errors.Add("StaffSocket_L/LeftHand missing");if(result.auxiliaryBones!=10)result.errors.Add("Expected auxiliary bones10");
                var renderers=prefab.GetComponentsInChildren<Renderer>(true);result.renderers=renderers.Length;if(renderers.Length!=4)result.errors.Add("Expected exactly four source renderers");
                foreach(var renderer in renderers)
                {
                    if(renderer is SkinnedMeshRenderer skin&&skin.sharedMesh!=null&&skin.sharedMesh.GetBlendShapeIndex("Fist_L")>=0)result.fist=true;
                    foreach(var material in renderer.sharedMaterials)if(material==null||NativeDruidRigPolicy.Palette(material.name.Replace(" (Instance)",""))==null)result.errors.Add("Unmapped material "+(material==null?"null":material.name));
                }
                if(!result.fist)result.errors.Add("Fist_L missing");
                var clips=new Dictionary<string,AnimationClip>();
                foreach(var asset in AssetDatabase.LoadAllAssetsAtPath(PathName))if(asset is AnimationClip clip&&!clip.name.StartsWith("__preview__",StringComparison.Ordinal))
                {
                    string key=Key(clip.name);if(key==null){result.errors.Add("Unknown clip "+clip.name);continue;}
                    bool skeleton=false;foreach(var binding in AnimationUtility.GetCurveBindings(clip))if(binding.path.IndexOf("LeftFoot",StringComparison.Ordinal)>=0||binding.path.IndexOf("LeftLeg",StringComparison.Ordinal)>=0)skeleton=true;
                    if(!skeleton)result.errors.Add("No Generic leg curves: "+key);clips[key]=clip;
                }
                model=UnityEngine.Object.Instantiate(prefab);model.hideFlags=HideFlags.HideAndDontSave;Transform left=null,right=null;
                foreach(var t in model.GetComponentsInChildren<Transform>(true)){if(t.name=="LeftFoot")left=t;if(t.name=="RightFoot")right=t;}
                if(left==null||right==null)throw new InvalidOperationException("Foot bones missing");
                if(AnimationMode.InAnimationMode())throw new InvalidOperationException("Existing editor animation session: run gate in isolated batch");
                AnimationMode.StartAnimationMode();sampling=true;
                foreach(string key in NativeDruidRigPolicy.AllClips)
                {
                    AnimationClip clip;if(!clips.TryGetValue(key,out clip)){result.errors.Add("Missing clip "+key);continue;}
                    int frames=NativeDruidRigPolicy.Frames(key);var row=new ClipReceipt{name=key,seconds=clip.length,expectedSeconds=frames/60f,rootOrLocomotion=key=="Walk"||key=="charge_run"||key=="grab_lunge"||key=="burrow_dive"||key=="burrow_erupt"};
                    if(Mathf.Abs(clip.length-row.expectedSeconds)>.001f||Mathf.Abs(clip.frameRate-60)>.01f)result.errors.Add("60fps duration mismatch "+key);
                    Vector2 firstLeft=Vector2.zero,firstRight=Vector2.zero;
                    for(int f=0;f<=frames;f++)
                    {
                        AnimationMode.BeginSampling();AnimationMode.SampleAnimationClip(model,clip,Mathf.Min(clip.length,f/60f));AnimationMode.EndSampling();
                        var l=Horizontal(left);var r=Horizontal(right);if(f==0){firstLeft=l;firstRight=r;}
                        row.footSlipHorizontalCm=Mathf.Max(row.footSlipHorizontalCm,Vector2.Distance(l,firstLeft)*100,Vector2.Distance(r,firstRight)*100);
                    }
                    if(!row.rootOrLocomotion&&row.footSlipHorizontalCm>.02f)result.errors.Add("Foot horizontal slip "+key+" "+row.footSlipHorizontalCm+"cm");
                    result.clips.Add(row);
                }
                foreach(string path in new[]{"Shaders/DruidRigPixelToon","Shaders/RigPixelComposite"}){var shader=Resources.Load<Shader>(path);if(shader==null||ShaderUtil.ShaderHasError(shader))result.errors.Add("Shader import error "+path);}
            }
            catch(Exception error){result.errors.Add(error.Message);}
            finally{if(sampling)AnimationMode.StopAnimationMode();if(model!=null)UnityEngine.Object.DestroyImmediate(model);}
            result.passed=result.errors.Count==0;string output=null;var args=Environment.GetCommandLineArgs();int at=Array.IndexOf(args,"-output");if(at>=0&&at+1<args.Length)output=args[at+1];
            if(!string.IsNullOrEmpty(output)){Directory.CreateDirectory(output);File.WriteAllText(System.IO.Path.Combine(output,"druid-rigpixel-import.json"),JsonUtility.ToJson(result,true));}
            Debug.Log("DRUID_RIG_IMPORT "+JsonUtility.ToJson(result));if(!result.passed)throw new InvalidOperationException("Druid import contract failed: "+string.Join("; ",result.errors));
        }
    }
}
