using System;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using Exoduser.UnityPort;
namespace Exoduser
{
    public static class KeyshotRenderSetup
    {
        const string Renderer="Assets/Exoduser/Rendering/URP_PC_High_Renderer.asset";
        const string FogMaterial="Assets/Exoduser/Rendering/M_HellHeightFog.mat";
        public static void Run()
        {
            try
            {
                var data=AssetDatabase.LoadAssetAtPath<UniversalRendererData>(Renderer);if(data==null)throw new Exception("PC 렌더러 누락");
                HellSsaoFeature ao=null;HellFogFeature fog=null;
                foreach(var f in data.rendererFeatures){if(f is HellSsaoFeature a)ao=a;if(f is HellFogFeature h)fog=h;}
                if(ao==null){ao=ScriptableObject.CreateInstance<HellSsaoFeature>();ao.name="지옥 필드 접촉음영";AssetDatabase.AddObjectToAsset(ao,data);data.rendererFeatures.Add(ao);}
                var state=new SerializedObject(ao);var settings=state.FindProperty("m_Settings");
                settings.FindPropertyRelative("Downsample").boolValue=false;settings.FindPropertyRelative("AfterOpaque").boolValue=false;settings.FindPropertyRelative("Source").intValue=1;
                settings.FindPropertyRelative("Intensity").floatValue=.6f;settings.FindPropertyRelative("Radius").floatValue=.18f;settings.FindPropertyRelative("DirectLightingStrength").floatValue=.12f;
                settings.FindPropertyRelative("Samples").intValue=0;settings.FindPropertyRelative("BlurQuality").intValue=0;state.ApplyModifiedPropertiesWithoutUndo();ao.SetActive(true);EditorUtility.SetDirty(ao);
                var shader=Shader.Find("EXODUSER/HellHeightFog");if(shader==null)throw new Exception("높이안개 셰이더 누락");
                var mat=AssetDatabase.LoadAssetAtPath<Material>(FogMaterial);if(mat==null){mat=new Material(shader);AssetDatabase.CreateAsset(mat,FogMaterial);}
                if(fog==null){fog=ScriptableObject.CreateInstance<HellFogFeature>();fog.name="지옥 필드 높이 광산란";AssetDatabase.AddObjectToAsset(fog,data);data.rendererFeatures.Add(fog);}
                fog.injectionPoint=FullScreenPassRendererFeature.InjectionPoint.BeforeRenderingPostProcessing;fog.fetchColorBuffer=true;fog.requirements=ScriptableRenderPassInput.Depth;fog.passMaterial=mat;fog.SetActive(true);
                EditorUtility.SetDirty(fog);EditorUtility.SetDirty(data);AssetDatabase.SaveAssets();
                if(ShaderUtil.ShaderHasError(shader))throw new Exception("높이안개 셰이더 컴파일 오류");
                var soil=Shader.Find("EXODUSER/ArenaSoilLit");if(soil==null||ShaderUtil.ShaderHasError(soil))throw new Exception("보스바닥 셰이더 오류");
                Debug.Log("키샷 렌더러 설정 완료: 전체해상도 SSAO·높이안개. 런타임 실제3D카메라에서만 실행");EditorApplication.Exit(0);
            }
            catch(Exception e){Debug.LogException(e);EditorApplication.Exit(2);}
        }
    }
}
