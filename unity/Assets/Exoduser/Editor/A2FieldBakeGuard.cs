using System.IO;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEngine;
using Exoduser.UnityPort;

public sealed class A2FieldBakeGuard : IPreprocessBuildWithReport
{
    public int callbackOrder {get{return -100;}}
    public void OnPreprocessBuild(BuildReport report)
    {
        const string folder="Assets/Exoduser/Resources/A2R/Baked/Field/";
        if(!File.Exists(folder+"index.json"))return;
        var index=JsonUtility.FromJson<NativeGame.A2FieldCacheIndex>(File.ReadAllText(folder+"index.json"));
        var map=JsonUtility.FromJson<MapData>(Resources.Load<TextAsset>("Data/ch1_map").text);
        if(!index.verified||index.version!=NativeGame.A2FieldCacheVersion||index.mapHash!=Hash128.Compute(JsonUtility.ToJson(map)).ToString())throw new BuildFailedException("A2 field bake is unverified or map/schema is stale");
        if(index.inputPaths.Length!=index.inputHashes.Length)throw new BuildFailedException("A2 field bake input table invalid");
        for(int i=0;i<index.inputPaths.Length;i++)if(AssetDatabase.GetAssetDependencyHash(index.inputPaths[i]).ToString()!=index.inputHashes[i])throw new BuildFailedException("A2 field bake input changed: "+index.inputPaths[i]);
        foreach(var stage in index.stages)if(AssetDatabase.LoadAssetAtPath<GameObject>(folder+stage+".prefab")==null||!File.Exists(folder+stage+"-state.bytes")||!File.Exists(folder+stage+"-meta.json"))throw new BuildFailedException("A2 field bake stage missing: "+stage);
    }
}
