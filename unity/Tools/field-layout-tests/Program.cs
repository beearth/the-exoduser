using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using Exoduser.UnityPort;
using Exoduser.UnityPort.Core;

class Program
{
    static int checks, failures;
    static void Check(bool value, string name) { checks++; if (!value) { failures++; Console.WriteLine("FAIL " + name); } }
    static bool Near(double a, double b) { return Math.Abs(a-b)<.002; }
    static int Main(string[] args)
    {
        // Reflection keeps the first red run executable before the profile exists.
        var type=typeof(Simulation).Assembly.GetType("Exoduser.UnityPort.Core.FieldLayout");
        Check(type!=null,"field layout profile exists");
        if(type==null)return 1;
        var source=JsonSerializer.Deserialize<MapData>(File.ReadAllText(args[0]),new JsonSerializerOptions{IncludeFields=true});
        string original=JsonSerializer.Serialize(source,new JsonSerializerOptions{IncludeFields=true});
        // New modes first fail as a runtime assertion, rather than a compile error.
        FieldLayout linear=null, middle=null;
        try { linear=FieldLayout.FromArguments(new[]{"--field-scale","2","--field-enemies","linear"}); }
        catch(ArgumentException) { }
        try { middle=FieldLayout.FromArguments(new[]{"--field-scale","2","--field-enemies","1.5"}); }
        catch(ArgumentException) { }
        Check(linear!=null,"x2-linear CLI profile");
        Check(middle!=null,"x2 intermediate CLI profile");
        if(linear==null||middle==null)return 1;
        Check(ReferenceEquals(FieldLayout.FromArguments(Array.Empty<string>()),FieldLayout.Original),"default profile unchanged");
        foreach(string invalid in new[]{"0","-1","NaN","Infinity","3","typo"}) {
            bool rejected=false;try { FieldLayout.FromArguments(new[]{"--field-enemies",invalid}); }catch(ArgumentException){rejected=true;}
            Check(rejected,"invalid enemy factor "+invalid);
        }
        foreach(double k in new[]{1.0,1.3,1.5,2.0})foreach(string mode in new[]{"keep","area","linear","1.5"})
        {
            if(k!=2&&(mode=="linear"||mode=="1.5"))continue;
            bool area=mode=="area";
            dynamic profile=FieldLayout.FromArguments(new[]{"--field-scale",k.ToString(System.Globalization.CultureInfo.InvariantCulture),"--field-enemies",mode});
            var data=(MapData)typeof(SourceMap).GetMethod("CreateFieldData").Invoke(null,new object[]{source,profile});
            var map=new SourceMap(data);
            var s=new Simulation(new SimulationConfig{StageIndex=0,EnemyAiEnabled=false,StartX=data.startX,StartY=data.startY,PlayerMaxHp=1000000});
            ((dynamic)s).ConfigureField(profile,data.width,data.height);
            s.CanMove=map.CanMove;s.HasLineOfSight=map.LineOfSight;s.IsProjectileWall=map.ProjectileBlocked;
            s.FloorTile=(x,y)=>!map.Blocked((x+.5f)*40,(y+.5f)*40);
            s.Stage.InitializeField(data.tiles,data.width);s.Stage.Enabled=true;
            s.EnableFieldSpawns();s.SpawnStartEnemies();s.InitRegions();s.EnableFieldBosses();
            string tag=k+"/"+mode;
            Check(data.width==(int)(200*k)&&data.height==data.width,tag+" dimensions");
            Check(Near(data.startX,4020*k)&&Near(data.startY,7420*k),tag+" start");
            Check(map.CanMove(data.startX,data.startY,15),tag+" start radius 15");
            Check(data.tiles.Count(t=>t==2)==3&&data.tiles.Count(t=>t==3)==3,tag+" fixed 3+3 markers");
            int gx=(int)Math.Floor(4020*k/40),gy=(int)Math.Floor(220*k/40),ey=(int)Math.Floor(300*k/40);
            Check(s.Stage.FieldGateCx==gx&&s.Stage.FieldGateY==gy,tag+" quantized gate");
            Check(s.Stage.Exits.All(t=>t.Y==ey&&Math.Abs(t.X-gx)<=1),tag+" quantized entry");
            int expected=area?(int)Math.Round(168*k*k):mode=="linear"?336:mode=="1.5"?252:168;
            Check(s.Stage.TotalSpawned==expected&&s.Regions.Sum(r=>r.Total)==expected,tag+" planned total");
            if(k==2&&mode=="linear")Check(s.Regions.Select(r=>r.Total).SequenceEqual(new[]{46,120,106,64}),tag+" proportional regions");
            int[] regions={2,3,2,3,2,1,0,1,1,2,0,1,3,3};
            for(int i=0;i<14;i++) {
                var h=s.SpawnHoles.Holes[i];var old=SpawnHoleSystem.Stage0Holes[i];
                Check(Near(h.X,old[0]*k)&&Near(h.Y,old[1]*k),tag+" hole "+i+" continuous anchor");
                Check(s.RegionIdxAt(h.X,h.Y)==regions[i],tag+" hole "+i+" region");
                Check(map.CanMove((float)h.X,(float)h.Y,15),tag+" hole "+i+" radius 15");
            }
            Check(s.StartEyeMasses==2&&s.StartGuards==1,tag+" fixed enemies present");
            var guard=s.Stage.GateGuard;
            Check(guard!=null&&Near(guard.X,4020*k)&&Near(guard.Y,340*k),tag+" guard absolute anchor");
            if(guard!=null)Check(map.CanMove(guard.X,guard.Y,guard.Radius),tag+" guard actual radius");
            var markers=new List<NativeMinimapObjective>();NativeMinimapObjectives.Collect(s,markers);
            s.TickFieldBosses();
            int[] fbRegion={2,3,0,1};double[,] sites={{2340,6340},{5940,6020},{2100,1700},{5940,1700}};
            for(int i=0;i<4;i++) {
                var fb=s.FieldBosses[i];var marker=markers.Single(m=>m.Kind==NativeMinimapObjectiveKind.Angler&&m.Index==i);
                Check(Near(fb.X,sites[i,0]*k)&&Near(fb.Y,sites[i,1]*k),tag+" angler "+i+" anchor");
                Check(Near(marker.X,fb.X)&&Near(marker.Y,fb.Y),tag+" angler pre/post marker "+i);
                Check(s.RegionIdxAt(fb.X,fb.Y)==fbRegion[i],tag+" angler region "+i);
                Check(map.CanMove((float)fb.X,(float)fb.Y,15)&&map.CanMove((float)fb.X,(float)fb.Y,(float)fb.R),tag+" angler actual radius "+i);
            }
            var reachable=Reachable(map,data.startX,data.startY);
            foreach(var ex in s.Stage.Exits)Check(reachable[ex.Y*data.width+ex.X],tag+" entry reachable");
            foreach(var h in s.SpawnHoles.Holes)Check(reachable[(int)(h.Y/40)*data.width+(int)(h.X/40)],tag+" hole reachable");
            foreach(var fb in s.FieldBosses)Check(reachable[(int)(fb.Y/40)*data.width+(int)(fb.X/40)],tag+" angler reachable");
            s.Stage.BossSpawners[0]=(sim,x,y)=>sim.AddEnemy(new EnemyState{Hp=100,MaxHp=100,IsBoss=true,X=x,Y=y,Radius=20});
            s.Stage.ForceUnlock();s.Stage.FieldBossDone=true;
            s.Player.X=(gx+.5f)*40;s.Player.Y=(ey+.5f)*40;
            for(int i=0;i<100;i++)s.Stage.Tick();
            Check(s.Stage.InArena&&BossArenaLayout.Width==128&&BossArenaLayout.Height==108,tag+" independent arena");
            s.Stage.LeaveArenaToField();
            Check(!s.Stage.InArena&&Near(s.Player.X,4020*k)&&Near(s.Player.Y,460*k),tag+" return absolute anchor");
            Check(map.CanMove(s.Player.X,s.Player.Y,s.Player.Radius),tag+" field return radius");
            Console.WriteLine("PROFILE "+tag+" total="+s.Stage.TotalSpawned+" regions="+string.Join(",",s.Regions.Select(r=>r.Total)));
        }
        Check(original==JsonSerializer.Serialize(source,new JsonSerializerOptions{IncludeFields=true}),"source data unchanged");
        Console.WriteLine("RESULT "+checks+" checks / "+failures+" failures");return failures==0?0:1;
    }
    static bool[] Reachable(SourceMap map,float x,float y) {
        var d=map.Data;var seen=new bool[d.tiles.Length];var q=new Queue<int>();int first=(int)(y/40)*d.width+(int)(x/40);seen[first]=true;q.Enqueue(first);
        while(q.Count>0){int p=q.Dequeue(),px=p%d.width,py=p/d.width;foreach(var offset in new[]{-1,1,-d.width,d.width}){
            int n=p+offset;if(n<0||n>=seen.Length||seen[n]||Math.Abs(n%d.width-px)+Math.Abs(n/d.width-py)!=1)continue;
            if(!map.CanMove((n%d.width+.5f)*40,(n/d.width+.5f)*40,15))continue;seen[n]=true;q.Enqueue(n);
        }}return seen;
    }
}
