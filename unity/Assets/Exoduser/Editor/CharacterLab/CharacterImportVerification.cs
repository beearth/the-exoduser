using System;
using System.Linq;
using UnityEditor;
using UnityEditor.Animations;
using UnityEngine;

namespace Exoduser.CharacterLab
{
    // Run after each character import. Fails the batch job if the avatar, materials,
    // textures, or standalone animation clips are not ready for a clean checkout.
    public static class CharacterImportVerification
    {
        public static void VerifySilvertail() => Verify("Silvertail", SilvertailImport.Dir, SilvertailImport.Rigged,
            SilvertailImport.PrefabPath, SilvertailImport.CtrlPath);

        public static void VerifyIvan() => Verify("Ivan", IvanImport.Dir, IvanImport.Rigged,
            IvanImport.PrefabPath, IvanImport.CtrlPath);

        static void Require(bool condition, string message)
        {
            if (!condition) throw new InvalidOperationException("[UCH VERIFY] " + message);
        }

        static void Verify(string name, string dir, string rigged, string prefabPath, string controllerPath)
        {
            var avatar = AssetDatabase.LoadAllAssetsAtPath(rigged).OfType<Avatar>().FirstOrDefault();
            Require(avatar && avatar.isValid && avatar.isHuman, name + " Humanoid avatar invalid");

            var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(prefabPath);
            Require(prefab, name + " prefab missing");
            var animator = prefab.GetComponent<Animator>();
            Require(animator && animator.avatar && animator.avatar.isValid && animator.avatar.isHuman,
                name + " prefab Animator avatar invalid");
            var renderers = prefab.GetComponentsInChildren<SkinnedMeshRenderer>(true);
            Require(renderers.Length > 0 && renderers.All(r => r.sharedMaterials.Length > 0 &&
                r.sharedMaterials.All(m => m && m.shader && m.shader.name == "Universal Render Pipeline/Lit")),
                name + " skinned renderer material invalid");

            var controller = AssetDatabase.LoadAssetAtPath<AnimatorController>(controllerPath);
            Require(controller && controller.layers.Length > 0, name + " controller missing");
            foreach (var state in controller.layers[0].stateMachine.states)
            {
                Require(state.state.motion, name + " motion missing in " + state.state.name);
                string path = AssetDatabase.GetAssetPath(state.state.motion);
                Require(path.StartsWith(dir + "/", StringComparison.Ordinal) && path.EndsWith(".anim", StringComparison.Ordinal),
                    name + " motion must be a standalone .anim: " + path);
            }

            var baseColor = AssetImporter.GetAtPath(dir + "/" + name + "_BaseColor.png") as TextureImporter;
            var normal = AssetImporter.GetAtPath(dir + "/" + name + "_Normal.png") as TextureImporter;
            var metallic = AssetImporter.GetAtPath(dir + "/" + name + "_MetallicSmoothness.png") as TextureImporter;
            Require(baseColor && baseColor.sRGBTexture, name + " base color must be sRGB");
            Require(normal && normal.textureType == TextureImporterType.NormalMap, name + " normal map import invalid");
            Require(metallic && !metallic.sRGBTexture, name + " metallic/smoothness must be linear");
            Debug.Log("[UCH VERIFY] " + name + " PASS");
        }
    }
}
