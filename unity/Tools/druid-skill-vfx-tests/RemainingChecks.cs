using System;
using Exoduser.UnityPort.Core;
using Exoduser.UnityPort.Vfx;

static partial class Program
{
    static void RemainingChecks()
    {
        var timeline = typeof(DruidSlamVfxTimeline).Assembly.GetType("Exoduser.UnityPort.Vfx.DruidRemainingVfxTimeline");
        Check(timeline != null, "five remaining moves expose their Core-tick timeline");
        if (timeline == null) return;
        double Value(string name, params object[] args) { return Convert.ToDouble(timeline.GetMethod(name).Invoke(null, args)); }
        bool Flag(string name, params object[] args) { return (bool)timeline.GetMethod(name).Invoke(null, args); }
        Check(Value("Fade", -1d, 150d, 60d) == 0 && Value("Fade", 0d, 150d, 60d) == 1 && Value("Fade", 150d, 150d, 60d) == 0, "residue exists only during its Core-tick lifetime");
        Check(Value("Fade", 120d, 150d, 60d) == .5, "residue fades during its last second");
        Check(Value("BurrowReveal", 40d, 40d) == 0 && Value("BurrowReveal", 6d, 40d) == 1, "eruption cracks reach the radius on Core St2=6");
        Check(Value("PulseRadius", 0d, 286d, 1800d) == 286 && Value("PulseRadius", 12d, 286d, 1800d) == 1800, "heartbeat crosses arena in 12 ticks from actual safe radius");
        Check(Flag("FissureEnded", new Fissure { Straight=true, Done=true }) && Flag("FissureEnded", new Fissure { Exploded=true }) && !Flag("FissureEnded", new Fissure { Straight=true }), "straight Done and legacy Exploded each end the fissure");
        Check(Flag("GrabStep", 20d, 20d) && Flag("GrabStep", 10d, 11d) && !Flag("GrabStep", 10d, 10d) && !Flag("GrabStep", 12d, 13d), "grab footfalls are one-shot at 0/10 and pause never repeats them");
        Check(Value("PathWidth", "charge", 130d) == 65 && Math.Abs(Value("PathWidth", "burrow", 111d)-66.6)<1e-8 && Value("PathWidth", "fissure", 57d) == DruidBoss.FissureHitHalfWidth*2, "path widths follow Core radius and fissure collision");
        for (int i=0;i<=12;i++) Check(Value("PulseRadius", (double)i, 286d, 1800d) >= 286, "pulse stays outside safe ring tick "+i);
        bool collisionWidth=true;
        for(int seed=0;seed<20;seed++)for(int along=0;along<2000;along++)
            if(Math.Abs(Value("EdgeOffset",(double)along,seed,140d))+Value("PathHalfWidth",140d)>DruidBoss.FissureHitHalfWidth+1e-8)collisionWidth=false;
        Check(collisionWidth,"40,000 fissure edge samples stay within actual Core half-width 70");
        var budgetType=timeline.Assembly.GetType("Exoduser.UnityPort.Vfx.DruidVfxSpawnBudget");
        Check(budgetType!=null,"body spawn budget exists");
        if(budgetType!=null)
        {
            var budget=Activator.CreateInstance(budgetType);var take=budgetType.GetMethod("Take");var clear=budgetType.GetMethod("Clear");
            bool Take(int tick,int live) { return (bool)take.Invoke(budget,new object[]{tick,live}); }
            Check(Take(10,0)&&Take(10,1)&&!Take(10,2),"bursts share two new sprites per tick");
            Check(!Take(11,24)&&Take(11,23)&&Take(11,23)&&!Take(11,0),"24 active limit; failed request does not consume spawn slot");
            clear.Invoke(budget,null);Check(Take(1,0),"reset releases budget");
        }
        if (repo.Length>0)
        {
            string view=Src(VfxDir+"DruidSkillVfxView.Remaining.cs"), shader=Src("unity/Assets/Exoduser/Resources/Shaders/DruidGroundBody.shader");
            Check(view.Contains("sim.BossFx +=")&&view.Contains("BossFx -=")&&view.Contains("ResetRemaining"),"events bind, detach and reset");
            Check(view.Contains("f.Done")&&view.Contains("f.Exploded"),"fissure termination handles both paths");
            Check(view.Contains("TryGetGrabSockets")&&view.Contains("RegisterBodyVfx"),"tubes use sockets and boss Point RT");
            Check(shader.Contains("_SafeZones")&&shader.Contains("_Pillars")&&shader.Contains("shadowT > 0")&&shader.Contains("shadowT < 1"),"heartbeat masks Core circles and finite pillar shadows");
            Check(view.Contains("_EmitTex")&&view.Contains("root_vein_decal_emit"),"authored emission mask is used");
            Check(view.Contains("tint.a=s.Add?1:")&&DruidSlamVfxTimeline.CoreOpacity(0)>1,"contact core retains the HDR peak without a second alpha envelope");
            foreach(var name in new[]{"crack_strip_tile","ground_furrow_tile","root_vein_decal","root_vein_decal_emit","amber_drain_streak","pulse_band","wall_impact_dust","earth_eruption","thorn_spike","thorn_burst"})
                Check(System.IO.File.Exists(System.IO.Path.Combine(repo,"unity/Assets/Exoduser/Resources/Art/vfx/boss/earth/"+name+".png")),"approved sheet: "+name);
        }
    }
}
