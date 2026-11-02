using System;using System.IO;using UnityEditor;using UnityEditor.SceneManagement;using UnityEngine;using Exoduser.UnityPort.Tools;
public static class UiAuditCoordinateBuild {
 public static void Build(){var a=Environment.GetCommandLineArgs();int i=Array.IndexOf(a,"-output");if(i<0||i+1>=a.Length||!Path.IsPathRooted(a[i+1]))throw new Exception("absolute -output required");string output=a[i+1];Directory.CreateDirectory(output);
  const string scenePath="Assets/__UiAuditCoordinateProbe.unity";if(File.Exists(scenePath))throw new Exception("probe scene already exists; preserve before next build");
  var scene=EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);new GameObject("GUI coordinate calibration only").AddComponent<UiAuditCoordinateProbe>();EditorSceneManager.SaveScene(scene,scenePath);
  var report=BuildPipeline.BuildPlayer(new BuildPlayerOptions{scenes=new[]{scenePath},locationPathName=Path.Combine(output,"EXODUSER-Unity.exe"),target=BuildTarget.StandaloneWindows64,options=BuildOptions.None});
  File.WriteAllText(Path.Combine(output,"coordinate-build.txt"),"scope=coordinate calibration only\nresult="+report.summary.result+"\nerrors="+report.summary.totalErrors+"\n");if(report.summary.totalErrors!=0||report.summary.result!=UnityEditor.Build.Reporting.BuildResult.Succeeded)throw new Exception("coordinate calibration build failed");
 }
}
