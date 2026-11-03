using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        [Serializable] sealed class GroundSkillShot
        {
            public string site,skill,file,receiver;
            public int requestedAge,runtimeAge,cell=-1;
            public bool active,flashEnabled;
            public float alpha,terrainY,waterY=-.45f,slope,edgeFeather,projectorMargin;
            public Vector3 anchor,waterNeighbour,projectorSize;
        }
        [Serializable] sealed class GroundSkillsReceipt
        {
            public string scope="Actual A2 field and production NativeSkillView, controlled real DispatchSlot casts; not natural combat or visual PASS";
            public string graphicsApi,sandbox;
            public int width,height,hiddenRenderers,casts;
            public bool passed,actorsHidden,uiHidden,edgeBaseline,projectiles,visualVerified;
            public List<GroundSkillShot> shots=new List<GroundSkillShot>();
        }
        struct GroundSkillSite
        {
            public string id,receiver;public Vector2 point,waterNeighbour;public float slope;
        }
        static bool GroundCaptureFlag(string flag) { return Array.IndexOf(Environment.GetCommandLineArgs(),flag)>=0; }
        static string GroundCaptureOption(string name,string fallback)
        { string value=Argument(name);return string.IsNullOrEmpty(value)?fallback:value; }
        float GroundCaptureSlope(float x,float z)
        {
            return new Vector2(a2Field.TerrainHeight(x+.5f,z)-a2Field.TerrainHeight(x-.5f,z),
                a2Field.TerrainHeight(x,z+.5f)-a2Field.TerrainHeight(x,z-.5f)).magnitude;
        }
        GroundSkillSite[] GroundCaptureSites()
        {
            var bridge=GameObject.Find("A2 시작 목교");Vector3 top;
            if(bridge==null||!A2UpperSurfaceVertex(bridge,new Vector3(43.2f,0,-71.8f),out top))
                throw new InvalidOperationException("Actual A2 bridge upper surface unavailable");
            var flat=new GroundSkillSite{id="flat",receiver="A2 terrain",point=new Vector2(40.2f,-77f)};
            var slope=new GroundSkillSite{id="slope",receiver="A2 terrain slope"};
            var swamp=new GroundSkillSite{id="swamp",receiver="A2 terrain/water edge (-0.45m)"};
            float flatScore=float.PositiveInfinity,slopeScore=float.NegativeInfinity,waterScore=float.PositiveInfinity;
            bool foundFlat=false,foundSlope=false,foundWater=false;
            // Select actual walkable terrain near the proven bridge camera, never
            // substitute a QA quad or alter the map to manufacture the four sites.
            for(float z=-95;z<=-40;z+=.5f)for(float x=20;x<=70;x+=.5f)
            {
                if(a2Field.Water(x,z)||!Map.CanMove(x*100,-z*100,15))continue;
                float h=a2Field.TerrainHeight(x,z);
                if(Mathf.Abs(NativeRemodel3D.GroundY(x,z)-h)>.08f)continue; // no root/deck mislabeled as soil
                float gradient=GroundCaptureSlope(x,z),distance=(x-40.2f)*(x-40.2f)+(z+77)*(z+77);
                if(distance<100&&gradient<flatScore){flatScore=gradient;flat.point=new Vector2(x,z);flat.slope=gradient;foundFlat=true;}
                if(distance<625&&gradient>.06f&&gradient>slopeScore){slopeScore=gradient;slope.point=new Vector2(x,z);slope.slope=gradient;foundSlope=true;}
                for(int side=0;side<4;side++)
                {
                    var q=new Vector2(x+(side==0?1:side==1?-1:0),z+(side==2?1:side==3?-1:0));
                    if(!a2Field.Water(q.x,q.y)||distance>=waterScore)continue;
                    waterScore=distance;swamp.point=new Vector2(x,z);swamp.waterNeighbour=q;swamp.slope=gradient;foundWater=true;
                }
            }
            if(!foundFlat||flatScore>.04f||!foundSlope||!foundWater)throw new InvalidOperationException("Four actual terrain sites could not be classified");
            return new[]{flat,slope,new GroundSkillSite{id="bridge",receiver=bridge.name,point=new Vector2(43.2f,-71.8f),slope=GroundCaptureSlope(43.2f,-71.8f)},swamp};
        }
        static void GroundCaptureHideActors(Dictionary<Renderer,bool> saved,NativeHeroView hero)
        {
            foreach(var renderer in FindObjectsByType<Renderer>(FindObjectsSortMode.None))
            {
                var sprite=renderer as SpriteRenderer;
                bool actor=sprite!=null&&NativeHd2D.IsActor(sprite);
                bool contact=renderer.sharedMaterial!=null&&renderer.sharedMaterial.shader!=null&&renderer.sharedMaterial.shader.name=="EXODUSER/HD2DContact";
                bool model=hero!=null&&hero.Ready&&renderer.transform.IsChildOf(hero.Model.transform);
                if(!actor&&!contact&&!model)continue;
                if(!saved.ContainsKey(renderer))saved[renderer]=renderer.forceRenderingOff;
                renderer.forceRenderingOff=true;
            }
        }
        GroundSkillShot GroundCaptureShot(GroundSkillSite site,string skill,int age,bool baseline)
        {
            var shot=new GroundSkillShot{site=site.id,receiver=site.receiver,skill=skill,requestedAge=age,runtimeAge=-1,
                anchor=NativeRemodel3D.Point(Simulation.Player.X,Simulation.Player.Y),terrainY=a2Field.TerrainHeight(site.point.x,site.point.y),
                slope=site.slope,waterNeighbour=new Vector3(site.waterNeighbour.x,-.45f,site.waterNeighbour.y),edgeFeather=baseline?0:.04f};
            if(skill=="giantSlam")
            {
                foreach(var wave in Simulation.SlamWaves){shot.runtimeAge=wave.T;shot.active=true;}
                foreach(var sr in FindObjectsByType<SpriteRenderer>(FindObjectsSortMode.None))
                {
                    if(sr.transform.parent==null||!sr.transform.parent.name.StartsWith("slam",StringComparison.Ordinal))continue;
                    if(sr.name=="flash"){shot.flashEnabled=sr.enabled&&sr.color.a>0;continue;}
                    if(sr.name!="wave"||sr.sprite==null)continue;
                    var rect=sr.sprite.rect;shot.cell=Mathf.RoundToInt((sr.sprite.texture.height-rect.y-rect.height)/rect.height)*2+Mathf.RoundToInt(rect.x/rect.width);
                    shot.alpha=sr.color.a;
                    var surface=sr.GetComponent<NativeGroundSkillSurface>();
                    if(surface!=null&&surface.SurfaceRenderer!=null)
                    {
                        var bounds=surface.SurfaceRenderer.bounds;shot.projectorSize=bounds.size;
                        shot.projectorMargin=bounds.extents.x-rect.width/sr.sprite.pixelsPerUnit*Mathf.Abs(sr.transform.lossyScale.x)*.5f;
                    }
                }
            }
            else foreach(var zone in Simulation.FireZones)if(zone.Type==skill){shot.runtimeAge=zone.T;shot.active=true;}
            return shot;
        }
        IEnumerator GroundSkillMapCapture()
        {
            string output=Argument("-output");
            if(Application.isBatchMode||!NativeQaSandbox.Active||!NativeRemodel3D.Requested||!NativeHd2D.Enabled||string.IsNullOrEmpty(output)||!Path.IsPathRooted(output))
                throw new InvalidOperationException("Ground skills capture requires a visible HD2D/remodel Player, absolute output and QA sandbox");
            if(Directory.Exists(output)&&Directory.GetFileSystemEntries(output).Length!=0)throw new InvalidOperationException("Capture output must be empty; use fixed captures-current after deleting the previous set");
            Directory.CreateDirectory(output);
            int width;if(!int.TryParse(Argument("-ground-width"),out width))width=1920;
            if(width!=1920&&width!=2560&&width!=3840)throw new ArgumentException("ground-width must be1920,2560,3840");
            string siteFilter=GroundCaptureOption("-ground-sites","all"),skillFilter=GroundCaptureOption("-ground-skill","all"),sequenceSite=GroundCaptureOption("-ground-sequence-site","bridge");
            bool hide=GroundCaptureFlag("--unity-ground-hide-actors"),baseline=GroundCaptureFlag("--unity-ground-edge-baseline");
            var receipt=new GroundSkillsReceipt{width=width,height=1080,graphicsApi=SystemInfo.graphicsDeviceType.ToString(),
                sandbox=NativeQaSandbox.Root,actorsHidden=hide,uiHidden=hide,edgeBaseline=baseline,projectiles=GroundCaptureFlag("--unity-ground-projectiles")};
            var hidden=new Dictionary<Renderer,bool>();bool previousUi=groundReceiverQaActive;
            bool previousScripted=practiceScripted;
            float previousDelta=Time.captureDeltaTime;string previousSlot=Simulation.Skills.Slots[0];
            try
            {
                groundReceiverQaActive=hide;AudioListener.volume=0;AudioListener.pause=true;Application.runInBackground=true;Application.targetFrameRate=60;Time.captureDeltaTime=1f/60;
                smokeActive=true;dropSmoke=true;pauseSmoke=true;Running=false;menu=false;
                Screen.SetResolution(width,1080,FullScreenMode.Windowed);
                lobby.Flow.ShowLobby();lobby.Flow.SelectPreview();if(!lobby.Flow.EnterTest())throw new InvalidOperationException("A2 field entry failed");
                lobby.CloseStartupCaptureMedia();lobby.enabled=false;EndFirstPractice(true);frontendEntryInputFence=false;gameFocused=true;
                practiceScripted=true;Running=false; // reuse the existing manual-tick fixture fence
                Debug.Log("GROUND_SKILLS_SANDBOX_BOUND "+NativeQaSandbox.Root);
                var sim=Simulation;var p=sim.Player;sim.Config.EnemyAiEnabled=false;sim.SpawnHoles=null;sim.CrossbowAuto=false;sim.Stage.Enabled=false;
                float deadline=Time.realtimeSinceStartup+50;
                while((!Remodel3DReady||a2Field==null||r3Cam==null||!NativeRemodel3D.Active||Screen.width!=width||Screen.height!=1080)&&Time.realtimeSinceStartup<deadline){UpdateViews();yield return null;}
                if(!Remodel3DReady||a2Field==null||r3Cam==null||!NativeRemodel3D.Active||Screen.width!=width||Screen.height!=1080)throw new InvalidOperationException("Actual A2 field/resolution unavailable");
                var sites=GroundCaptureSites();int selectedSites=0,selectedSkills=0;
                foreach(var site in sites)
                {
                    if(siteFilter!="all"&&Array.IndexOf(siteFilter.Split(','),site.id)<0)continue;
                    selectedSites++;
                    foreach(string skill in new[]{"spikeTrap","holyDome","giantSlam"})
                    {
                        if(skillFilter!="all"&&skillFilter!=skill)continue;selectedSkills++;
                        sim.Enemies.Clear();sim.FireZones.Clear();sim.SlamWaves.Clear();sim.SkillBlades.Clear();sim.MaliceOrbs.Clear();sim.Projectiles.Clear();sim.IceOrbActive=false;
                        sim.SpikeTrapCd=sim.HolyDomeCd=sim.GiantSlamCd=0;sim.Materials=1000;p.Stamina=p.MaxStamina;p.Mana=p.MaxMana;p.State="idle";p.StateTicks=0;p.Iframes=10000;
                        p.X=site.point.x*100;p.Y=-site.point.y*100;lastX=p.X;lastY=p.Y;damage.Clear();damageFloaters.Clear();
                        if(sim.Druid!=null)sim.Druid.Projectiles.Clear();
                        sim.Enemies.Add(new EnemyState{Id=-99001,Etype=0,Hp=1000000,MaxHp=1000000,Level=1,X=p.X+48,Y=p.Y,Radius=15,Poise=1000,MaxPoise=1000,Stunned=180});
                        for(int settle=0;settle<12;settle++){UpdateViews();Running=false;yield return null;}
                        if(receipt.projectiles&&sim.Druid!=null)for(int k=0;k<3;k++)
                            sim.Druid.Projectiles.Add(new BossProjectile{X=p.X+400+k*35,Y=p.Y+85+k*22,Vx=-3,Vy=0,R=8,Sz=1.1,Life=180,Ml=180,Dmg=1,Active=true,DruidPoison=k==0,El=k==2?3:0,ParryClass=k==1?"physical":"magic"});
                        sim.Skills.Slots[0]=skill;int casts=sim.SkillCastCount;
                        if(!sim.DispatchSlot(0)||sim.SkillCastCount!=casts+1)throw new InvalidOperationException("Actual skill cast failed: "+skill);
                        receipt.casts++;
                        bool sequence=skill=="giantSlam"&&site.id==sequenceSite;
                        int end=sequence?45:15;
                        for(int age=0;age<=end;age++)
                        {
                            UpdateViews();Running=false;
                            if(baseline&&skill=="giantSlam")foreach(var sr in FindObjectsByType<SpriteRenderer>(FindObjectsSortMode.None))
                                if(sr.name=="wave"&&sr.transform.parent!=null&&sr.transform.parent.name.StartsWith("slam",StringComparison.Ordinal))
                                {var block=new MaterialPropertyBlock();sr.GetPropertyBlock(block);block.SetFloat("_GroundEdgeFeather",0);sr.SetPropertyBlock(block);NativeGroundSkillSurface.Project(sr);}
                            if(hide)GroundCaptureHideActors(hidden,heroView);
                            yield return null;yield return new WaitForEndOfFrame();
                            if(sequence||age==15)
                            {
                                if(!NativeGroundSkillProjection.Available)throw new InvalidOperationException(NativeGroundSkillProjection.Error);
                                var shot=GroundCaptureShot(site,skill,age,baseline);
                                if(age<45&&(!shot.active||shot.runtimeAge!=age))throw new InvalidOperationException("Capture age drift: "+skill+" expected"+age+" actual"+shot.runtimeAge);
                                if(skill=="giantSlam"&&age==45&&shot.active)throw new InvalidOperationException("Slam survived its Core lifetime");
                                shot.file=site.id+"-"+skill+"-t"+age.ToString("00")+"-"+width+".png";
                                var screen=ScreenCapture.CaptureScreenshotAsTexture();File.WriteAllBytes(Path.Combine(output,shot.file),screen.EncodeToPNG());Destroy(screen);receipt.shots.Add(shot);
                            }
                            if(age<end){sim.Tick(0,0,p.X+300,p.Y,false,false);foreach(var enemy in sim.Enemies)enemy.Stunned=180;}
                        }
                    }
                }
                if(selectedSites==0||selectedSkills==0)throw new ArgumentException("No ground sites/skills selected");
                receipt.hiddenRenderers=hidden.Count;receipt.passed=!hide||hidden.Count>0;
            }
            finally
            {
                foreach(var pair in hidden)if(pair.Key!=null)pair.Key.forceRenderingOff=pair.Value;
                groundReceiverQaActive=previousUi;practiceScripted=previousScripted;Time.captureDeltaTime=previousDelta;Simulation.Skills.Slots[0]=previousSlot;
                File.WriteAllText(Path.Combine(output,"ground-skills-receipt.json"),JsonUtility.ToJson(receipt,true));
            }
            Debug.Log("GROUND_SKILLS_CAPTURE_DONE "+receipt.shots.Count+" shots; visual approval still required");Application.Quit(receipt.passed?0:2);
        }
    }
}
