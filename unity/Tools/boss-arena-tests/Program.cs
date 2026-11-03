using System;
using System.Linq;
using Exoduser.UnityPort;
using Exoduser.UnityPort.Core;
class ArenaTests
{
    static int checks,bad;
    static void Check(bool ok,string label)
    {
        checks++;
        if(!ok)
        {
            bad++;
            Console.WriteLine("FAIL "+label);
        }
    }
    static int Main()
    {
        var a=BossArenaLayout.Generate(0);
        var before=(int[])a.Tiles.Clone();
        var mesh=NativeArena3DPlan.Build(a);
        Check(a.Tiles.SequenceEqual(before),"collision tiles unchanged");
        Check(mesh.Vertices.Count<=16,"no 560k vertex entry allocation");
        Check(mesh.Vertices.All(v=>v.Y==0),"south boundary cannot blanket hero with vertical walls");
        Check(mesh.Vertices.Min(v=>v.X)<=-NativeArena3DPlan.Margin*NativeArena3DPlan.Tile&&mesh.Vertices.Max(v=>v.X)>BossArenaLayout.Width*NativeArena3DPlan.Tile,"solid ground beyond viewport edges");
        Check(mesh.Triangles.All(i=>i>=0&&i<mesh.Vertices.Count),"valid indices");
        a.Tiles[a.ExitY*BossArenaLayout.Width+a.ExitX]=0;
        var opened=NativeArena3DPlan.Build(a);
        Check(opened.Vertices.Count==mesh.Vertices.Count,"exit needs no rebuilt ground");
        var camera=new NativeArena3DCameraState();
        foreach(bool active in new[]
        {
            true,false,true,false
        }
        )foreach(float dt in new[]
        {
            0f,.01f,.3f,.6f,1f
        }
        )
        {
            camera.Step(active,dt);
            Check(Math.Abs(camera.Distance-16.5f)<.0001,"21:45 camera equals field at every transition");
        }
        var groves=NativeArena3DPlan.Forest(a);
        Check(groves.Count>=60&&groves.Count<=72,"bounded forest prewarm count");
        Check(groves.All(g=>g.Height>=3&&g.Height<=6),"forest mass 3..6m");
        Check(groves.All(g=>a.Blocked(g.X*100,-g.Z*100)),"forest outside Core playable floor");
        Check(NativeArenaReviewPolicy.Activation("bossHeartWind",1,"bossRmWind",0,0,false,false,0,0)==null,"heartbeat wind cannot pass actual coverage");
        Check(NativeArenaReviewPolicy.Activation("bossHeartPause",30,"bossHeartWind",1,0,false,false,0,0)=="heartbeat","heartbeat actual pulse recognized");
        Check(NativeArenaReviewPolicy.Activation("bossSlam",6,"bossSlamWind",0,0,false,false,0,0)==null,"slam swing start is not impact");
        Check(NativeArenaReviewPolicy.Activation("bossRec",76,"bossSlam",0,0,false,false,0,0)=="slam","slam impact recovery recognized");
        Check(NativeArenaReviewPolicy.Activation("bossDruidErupt",40,"bossDruidUnder",0,0,false,false,0,0)==null,"erupt warning cannot pass activation");
        Check(NativeArenaReviewPolicy.Activation("bossDruidErupt",10,"bossDruidErupt",0,0,true,false,0,0)=="burrowStrike","erupt actual hit recognized");
        Check(NativeArenaReviewPolicy.Activation("bossSlash",10,"bossSlashWind",0,0,false,false,0,0)==null,"slash swing before hit excluded");
        Check(NativeArenaReviewPolicy.Activation("bossSlash",8,"bossSlash",0,0,false,false,0,0)=="slashCombo","slash hit frame recognized");
        Check(NativeArenaReviewPolicy.Activation("bossChargeWind",1,"bossRmWind",0,0,false,false,0,0)==null,"charge warning excluded");
        Check(NativeArenaReviewPolicy.Activation("bossCharge",40,"bossChargeWind",0,0,false,false,0,0)=="charge","charge execution recognized");
        Check(NativeArenaReviewPolicy.Activation("bossGrabWind",1,"bossRmWind",0,0,false,false,0,0)==null,"grab warning excluded");
        Check(NativeArenaReviewPolicy.Activation("bossGrabLunge",20,"bossGrabWind",0,0,false,false,0,0)=="grab","grab lunge recognized even on miss");
        Check(NativeArenaReviewPolicy.Activation("bossGrab",120,"bossGrabLunge",0,0,false,false,0,0)==null,"grab contact not counted twice");
        Check(NativeArenaReviewPolicy.Activation("bossRec",60,"bossRmWind",0,0,false,false,4,3)=="groundFissure","live fissure recognized by serial");
        Check(NativeArenaReviewPolicy.Activation("bossRec",59,"bossRec",0,0,false,false,4,4)==null,"lingering fissure not counted twice");
        var torchPlan=typeof(NativeArena3DPlan).GetMethod("Torches");
        Check(torchPlan!=null,"8b supplies two grounded torch anchors");
        if(torchPlan!=null)for(int stage=0;stage<7;stage++){
            var room=BossArenaLayout.Generate(stage);var anchors=(NativeArena3DPlan.Vertex[])torchPlan.Invoke(null,new object[]{room});
            Check(anchors.Length==2,"exactly two torch anchors");
            Check(anchors.All(t=>t.Y==0&&!room.Blocked(t.X*100,-t.Z*100)),"torches sit on arena floor");
            Check(Math.Abs(anchors[0].X-anchors[1].X)>10,"torches leave combat centre readable");
            Check(Math.Abs((anchors[0].X+anchors[1].X)/2-(room.RoomCx+.5f)*NativeArena3DPlan.Tile)<.001,"torch pair follows Core room centre");
        }
        Console.WriteLine("boss-arena-plan checks="+checks+" failed="+bad);
        return bad>0?1:0;
    }
}
