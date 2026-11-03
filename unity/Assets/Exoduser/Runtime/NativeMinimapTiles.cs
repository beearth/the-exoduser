using System;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
    // Read-only view of the currently active world, including arena entry/retry/exit invalidation.
    internal struct NativeMinimapTiles
    {
        SourceMap field;BossArenaLayout arena;bool bossAlive;
        internal static NativeMinimapTiles Read(SourceMap field,StageFlow flow)
            =>new NativeMinimapTiles{field=field,arena=flow!=null&&flow.InArena?flow.Arena:null,bossAlive=flow==null||flow.BossAlive};
        internal int Width=>arena!=null?BossArenaLayout.Width:field.Data.width;
        internal int Height=>arena!=null?BossArenaLayout.Height:field.Data.height;
        internal int TileSize=>arena!=null?BossArenaLayout.TileSize:field.Data.tileSize>0?field.Data.tileSize:64;
        internal int Tile(int x,int y)=>arena!=null?arena.Tile(x,y):field.DisplayTile(x,y);
        internal bool Same(NativeMinimapTiles other)=>ReferenceEquals(field,other.field)&&ReferenceEquals(arena,other.arena)&&bossAlive==other.bossAlive;
    }
}
