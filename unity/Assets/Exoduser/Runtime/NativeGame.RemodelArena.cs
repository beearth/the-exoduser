using System;
using System.Collections.Generic;
using UnityEngine;
using Unity.Cinemachine;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        NativeArena3DView r3Arena;
        bool r3ArenaFailed,r3ArenaMode;
        float r3ArenaPrepareMs,r3ArenaModeMs;
        readonly NativeArena3DCameraState r3ArenaCamera=new NativeArena3DCameraState();
        readonly Dictionary<Renderer,bool> r3FieldRenderers=new Dictionary<Renderer,bool>();
        bool r3TerrainDraw,r3TerrainFoliage;
        CinemachineBrain.UpdateMethods r3FieldCameraUpdate;
        System.Collections.IEnumerator RemodelArenaPrewarm(){
            if(!A2Requested)yield break;
            NativeArenaActorMetrics.CalibrateHero(heroView==null?null:heroView.Model);
            try{r3Arena=new NativeArena3DView(transform,Exoduser.UnityPort.Core.BossArenaLayout.Generate(0),r3Cam);}catch(Exception e){r3ArenaFailed=true;Debug.LogWarning("[RB1-8] prewarm constructor failed "+e.Message);yield break;}
            var work=RemodelArenaPrewarmAssets();while(true){bool more=false;try{more=work.MoveNext();}catch(Exception e){r3ArenaFailed=true;r3Arena.Dispose();r3Arena=null;Debug.LogWarning("[RB1-8] prewarm failed,2D fallback "+e.Message);yield break;}if(!more)break;yield return work.Current;}
        }
        System.Collections.IEnumerator RemodelArenaPrewarmAssets(){
            foreach(string sheet in new[]{"base8_v3","walk","attack","beast","transform","dive","emerge"}){var timer=System.Diagnostics.Stopwatch.StartNew();NativeDruidArt.Tex(NativeDruidArt.BodyDir+sheet);Debug.Log("[RB1-8] actor-prewarm "+sheet+" cpuMs="+timer.Elapsed.TotalMilliseconds);yield return null;}
            for(int i=0;i<8;i++){NativeDruidArt.EmergeCell(i);yield return null;}
            var work=r3Arena.Prewarm();while(work.MoveNext())yield return work.Current;
        }
        bool RemodelArenaPrepare()
        {
            var timer=System.Diagnostics.Stopwatch.StartNew();
            if(r3ArenaFailed||!r3Loaded||!NativeRemodel3D.ForestA2||Simulation.Stage.Arena==null)return false;
            try
            {
                if(r3Cam==null||r3Vcam==null||r3Marker==null||r3Vcam.GetComponent<CinemachineFollow>()==null)throw new InvalidOperationException("LOOK-001 camera rig missing");
                if(r3Arena==null||!r3Arena.Bind(Simulation.Stage.Arena))return false;
                r3Arena.Sync(Simulation);r3ArenaPrepareMs=(float)timer.Elapsed.TotalMilliseconds;return true;
            }
            catch(Exception e)
            {
                r3ArenaFailed=true;r3Arena?.Dispose();r3Arena=null;
                Debug.LogWarning("[RB1-8a] 3D 아레나 준비 실패, 기존2D 유지: "+e.Message);return false;
            }
        }
        void RemodelArenaMode(bool on)
        {
            if(r3ArenaMode!=on)
            {
                var timer=System.Diagnostics.Stopwatch.StartNew();
                Remodel3DRestoreBillboards();NativeGroundSkillSurface.RestoreAll();
                if(on)
                {
                    r3FieldRenderers.Clear();
                    foreach(var sceneRoot in r3Roots)if(sceneRoot!=null)foreach(var r in sceneRoot.GetComponentsInChildren<Renderer>(true)){r3FieldRenderers[r]=r.enabled;r.enabled=false;}
                    var ground=NativeRemodel3D.Ground;if(ground!=null){r3TerrainDraw=ground.drawHeightmap;r3TerrainFoliage=ground.drawTreesAndFoliage;ground.drawHeightmap=false;ground.drawTreesAndFoliage=false;}
                    if(r3Brain!=null){r3FieldCameraUpdate=r3Brain.UpdateMethod;r3Brain.UpdateMethod=CinemachineBrain.UpdateMethods.ManualUpdate;}
                    if(hellArenaRig!=null)hellArenaRig.SetActive(false);
                }
                else
                {
                    foreach(var pair in r3FieldRenderers)if(pair.Key!=null)pair.Key.enabled=pair.Value;r3FieldRenderers.Clear();
                    var ground=NativeRemodel3D.Ground;if(ground!=null){ground.drawHeightmap=r3TerrainDraw;ground.drawTreesAndFoliage=r3TerrainFoliage;}
                    if(r3Brain!=null)r3Brain.UpdateMethod=r3FieldCameraUpdate;
                    if(a2EnemyShadowRoot!=null)a2EnemyShadowRoot.SetActive(NativeRemodel3D.Active);
                }
                r3ArenaMode=on;r3ArenaModeMs=(float)timer.Elapsed.TotalMilliseconds;
                Debug.Log("[RB1-8] mode="+on+" tick="+Simulation.TickCount+" cpuMs="+r3ArenaModeMs+" prepareMs="+r3ArenaPrepareMs+" meshBuilds="+(r3Arena==null?0:r3Arena.MeshBuilds));
            }
            NativeRemodel3D.ArenaActive=on;r3Arena?.SetActive(on);arenaView?.SetVisible(!on);
        }
        void RemodelArenaCameraStep()
        {
            var boss=Simulation.Druid!=null?Simulation.Druid.Boss:Simulation.Stage.Boss;
            bool hold=r3ArenaMode&&boss!=null&&(boss.Alive||BossSinkVisible(boss));
            r3ArenaCamera.Step(hold,Time.unscaledDeltaTime);
        }
        void RemodelArenaDispose(){RemodelArenaMode(false);r3Arena?.Dispose();r3Arena=null;}
    }
}
