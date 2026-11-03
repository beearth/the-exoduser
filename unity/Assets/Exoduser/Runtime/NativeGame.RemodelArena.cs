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
        readonly NativeArena3DCameraState r3ArenaCamera=new NativeArena3DCameraState();
        readonly Dictionary<Renderer,bool> r3FieldRenderers=new Dictionary<Renderer,bool>();
        bool r3TerrainDraw,r3TerrainFoliage;
        CinemachineBrain.UpdateMethods r3FieldCameraUpdate;
        bool RemodelArenaPrepare()
        {
            if(r3ArenaFailed||!r3Loaded||!NativeRemodel3D.ForestA2||Simulation.Stage.Arena==null)return false;
            try
            {
                if(r3Cam==null||r3Vcam==null||r3Marker==null||r3Vcam.GetComponent<CinemachineFollow>()==null)throw new InvalidOperationException("LOOK-001 camera rig missing");
                if(r3Arena==null||r3Arena.Layout!=Simulation.Stage.Arena){r3Arena?.Dispose();r3Arena=new NativeArena3DView(transform,Simulation.Stage.Arena);}
                r3Arena.Sync(Simulation);return true;
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
                r3ArenaMode=on;
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
