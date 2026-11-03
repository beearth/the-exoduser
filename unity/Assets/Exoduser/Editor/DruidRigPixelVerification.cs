using System;using System.Collections.Generic;using System.IO;using UnityEditor;using UnityEngine;
namespace Exoduser.CharacterLab
{
    // Mac import/Avatar gate only. PC can compile this file but must not launch Unity to run it.
    public static class DruidRigPixelVerification
    {
        const string PathName="Assets/Exoduser/Resources/Art/Bosses/Druid/OldmanV7.fbx";
        [Serializable] sealed class Receipt {public string scope="Unity asset import/Generic Avatar/clip inspection only; no GPU/gameplay PASS",animationType;public bool passed,avatarValid,humanoid,socket;public int renderers;public List<string> clips=new List<string>(),errors=new List<string>();}
        public static void Verify()
        {
            var result=new Receipt();
            try
            {
                var importer=AssetImporter.GetAtPath(PathName) as ModelImporter;
                if(importer==null)throw new InvalidOperationException("Druid FBX importer missing");
                result.animationType=importer.animationType.ToString();if(importer.materialName!=ModelImporterMaterialName.BasedOnMaterialName)result.errors.Add("Material labels must remain the LOCK palette names");if(importer.animationType!=ModelImporterAnimationType.Generic)result.errors.Add("Expected Generic, preserve exact Meshy bones");
                var prefab=AssetDatabase.LoadAssetAtPath<GameObject>(PathName);if(prefab==null)throw new InvalidOperationException("Druid model failed to import");
                var animator=prefab.GetComponent<Animator>();result.avatarValid=animator!=null&&animator.avatar!=null&&animator.avatar.isValid;result.humanoid=animator!=null&&animator.isHuman;
                if(!result.avatarValid||result.humanoid)result.errors.Add("Generic Avatar validation failed");
                foreach(var t in prefab.GetComponentsInChildren<Transform>(true))if(t.name=="StaffSocket_L")result.socket=t.parent!=null&&t.parent.name=="LeftHand";
                if(!result.socket)result.errors.Add("StaffSocket_L/LeftHand missing");
                var renderers=prefab.GetComponentsInChildren<Renderer>(true);result.renderers=renderers.Length;if(renderers.Length<4)result.errors.Add("Expected char1/front panel/staff/orb renderers");
                bool fist=false;foreach(var renderer in renderers){if(renderer is SkinnedMeshRenderer skin&&skin.sharedMesh!=null&&skin.sharedMesh.GetBlendShapeIndex("Fist_L")>=0)fist=true;if(renderer.name.IndexOf("Icosphere",StringComparison.OrdinalIgnoreCase)>=0)result.errors.Add("Bone-display Icosphere must not ship");foreach(var material in renderer.sharedMaterials)if(material==null||Exoduser.UnityPort.NativeDruidRigPolicy.Palette(material.name.Replace(" (Instance)",""))==null)result.errors.Add("Unmapped boss material "+(material==null?"null":material.name));}
                if(!fist)result.errors.Add("v7 Fist_L blendshape missing");
                int bones=0;foreach(var t in prefab.GetComponentsInChildren<Transform>(true))if(t.name.StartsWith("Cloak_Back_",StringComparison.Ordinal)||t.name.StartsWith("Panel_Front_",StringComparison.Ordinal)||t.name.StartsWith("Beard_",StringComparison.Ordinal)||t.name.StartsWith("Chain_L_",StringComparison.Ordinal))bones++;if(bones!=10)result.errors.Add("v7 auxiliary bones must remain 10");
                bool walk=false,idle=false;foreach(var asset in AssetDatabase.LoadAllAssetsAtPath(PathName))if(asset is AnimationClip clip&&!clip.name.StartsWith("__preview__",StringComparison.Ordinal)){result.clips.Add(clip.name);bool skeleton=false;foreach(var binding in AnimationUtility.GetCurveBindings(clip))if(binding.path.IndexOf("LeftFoot",StringComparison.Ordinal)>=0||binding.path.IndexOf("LeftLeg",StringComparison.Ordinal)>=0)skeleton=true;if(!skeleton){result.errors.Add("No Generic leg curve in "+clip.name);continue;}walk|=clip.name.Equals("Walk",StringComparison.OrdinalIgnoreCase)||clip.name.EndsWith("|Walk",StringComparison.OrdinalIgnoreCase)||clip.name.EndsWith("_Walk",StringComparison.OrdinalIgnoreCase);idle|=clip.name.Equals("Idle",StringComparison.OrdinalIgnoreCase)||clip.name.EndsWith("|Idle",StringComparison.OrdinalIgnoreCase)||clip.name.EndsWith("_Idle",StringComparison.OrdinalIgnoreCase);}
                if(!walk||!idle)result.errors.Add("Provided v7 Idle/Walk clip names did not import");
                foreach(var shader in new[]{"Shaders/DruidRigPixelToon","Shaders/RigPixelComposite"}){var source=Resources.Load<Shader>(shader);if(source==null||ShaderUtil.ShaderHasError(source))result.errors.Add("Shader import error: "+shader);}
            }
            catch(Exception error){result.errors.Add(error.Message);}
            result.passed=result.errors.Count==0;string output=null;var args=Environment.GetCommandLineArgs();int at=Array.IndexOf(args,"-output");if(at>=0&&at+1<args.Length)output=args[at+1];if(!string.IsNullOrEmpty(output)){Directory.CreateDirectory(output);File.WriteAllText(System.IO.Path.Combine(output,"druid-rigpixel-import.json"),JsonUtility.ToJson(result,true));}
            Debug.Log("DRUID_RIG_IMPORT "+JsonUtility.ToJson(result));if(!result.passed)throw new InvalidOperationException("Druid rig import gate failed: "+string.Join("; ",result.errors));
        }
    }
}
