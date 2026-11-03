using System;
using System.IO;
using UnityEngine;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        public static bool GrayboxConnected {get {var t=Resources.Load<TextAsset>("Map25D/active-presentation");return t!=null&&t.text.Trim()=="GB1";}}
        public static bool GrayboxRequested {get {var t=Resources.Load<TextAsset>("Map25D/active-presentation");return t!=null&&(t.text.Trim()=="GB1"||t.text.Trim()=="GB1a");}}
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        static void GrayboxSupplyMapInput()
        {
            var args=Environment.GetCommandLineArgs();
            if(!GrayboxRequested||(Array.IndexOf(args,"--unity-map25d")<0&&Array.IndexOf(args,"--map25d-play-smoke")<0&&Array.IndexOf(args,"--unity-map25d-capture")<0))return;
            var game=Instance;if(game==null)throw new InvalidOperationException("GB1 host Awake has not completed");
            if(!GrayboxConnected){
                var original=JsonUtility.FromJson<MapData>(Resources.Load<TextAsset>("Data/ch1_map").text);bool same=original.tiles.Length==game.Map.Data.tiles.Length;for(int i=0;i<original.tiles.Length&&same;i++)if(original.tiles[i]!=game.Map.Data.tiles[i])same=false;
                foreach(var c in game.chunks.Values)if(c.renderer!=null)Destroy(c.renderer.gameObject);game.chunks.Clear();foreach(var p in game.props)if(p!=null)Destroy(p.gameObject);game.props.Clear();game.Map.Data.chunks=Array.Empty<MapChunk>();
                int at=Array.IndexOf(args,"-output");if(at>=0&&at+1<args.Length){Directory.CreateDirectory(args[at+1]);File.WriteAllText(Path.Combine(args[at+1],"gb1a-runtime-map-input.json"),"{\"mode\":\"GB1a\",\"originalWalkTilesIdentical\":"+(same?"true":"false")+",\"newCoreInputApplied\":false,\"originalTileCount\":40000,\"onlyOriginalArtRenderersRemoved\":true}");}
                if(!same)throw new InvalidOperationException("GB1a original walking input changed");Debug.Log("[GB1a] Original walk input verified, new Core adapter disabled; only art renderers omitted.");return;
            }
            var input=Resources.Load<TextAsset>("Map25D/GB1/gb1-map");if(input==null)throw new InvalidOperationException("GB1 map input missing");
            // The existing host accepts SourceMap(MapData) and ResetRun binds it to
            // Simulation.CanMove / LineOfSight / projectile walls / field tiles.
            // This happens once before product lobby entry; no Core patch or reflection.
            var data=JsonUtility.FromJson<MapData>(input.text);game.Map=A2FieldLayout.CreateMap(data);
            foreach(var c in game.chunks.Values)if(c.renderer!=null)Destroy(c.renderer.gameObject);game.chunks.Clear();
            foreach(var p in game.props)if(p!=null)Destroy(p.gameObject);game.props.Clear();
            game.ResetRun();Debug.Log("[GB1] SourceMap input installed before lobby. Core unchanged; original anchors, gates, colliders and spawn rules retained.");
        }
    }
}
