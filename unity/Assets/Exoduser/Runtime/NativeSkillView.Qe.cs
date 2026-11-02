using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
 public sealed partial class NativeSkillView
 {
  readonly Sprite[] shieldAuraFrames=new Sprite[2],flameArcFrames=new Sprite[8];
  Item shieldGuard,flameArc;Mesh guardRangeMesh;MeshRenderer guardRangeRenderer;
  public bool ShieldAuraShown{get;private set;}public bool FlameArcShown{get;private set;}
  public float ShieldRangeShown{get;private set;}
  int shieldAge,lastGuardTick=-1;
  readonly List<Vector3> guardVertices=new List<Vector3>();readonly List<Color> guardColors=new List<Color>();readonly List<int> guardIndices=new List<int>();
  void LoadQeVisuals()
  {
   var q=Resources.Load<Texture2D>("Art/vfx/skill_shield_aura");var e=Resources.Load<Texture2D>("Art/vfx/skill_flame_blade_swing");
   if(q==null||e==null)throw new InvalidOperationException("Q/E 원본 VFX 시트 누락");
   // 웹 오라는20셀 중 앞2셀을8 draw마다 교대한다. E는4×2의8셀이다.
   for(int f=0;f<2;f++)shieldAuraFrames[f]=Sprite.Create(q,new Rect(f*480,q.height-480,480,480),new Vector2(.5f,.5f),100,0,SpriteMeshType.FullRect);
   int fw=e.width/4,fh=e.height/2;
   for(int f=0;f<8;f++)flameArcFrames[f]=Sprite.Create(e,new Rect(f%4*fw+1,e.height-(f/4+1)*fh+1,fw-2,fh-2),new Vector2(.5f,.5f),100,0,SpriteMeshType.FullRect);
   shieldGuard=NewItem("웹 Q 방어 오라");shieldGuard.a=NewRenderer(shieldGuard,"외곽 오라",shieldAuraFrames[0],malice,0);shieldGuard.b=NewRenderer(shieldGuard,"흡수 코어",shieldAuraFrames[0],malice,0);
   centeredMaliceSprites.Add(shieldGuard.a);centeredMaliceSprites.Add(shieldGuard.b);
   var range=new GameObject("Q 실제 판정 반경");range.transform.SetParent(shieldGuard.go.transform,false);guardRangeMesh=new Mesh{name="Q 판정 반경 점선"};range.AddComponent<MeshFilter>().sharedMesh=guardRangeMesh;guardRangeRenderer=range.AddComponent<MeshRenderer>();guardRangeRenderer.sharedMaterial=malice;
   flameArc=NewItem("웹 E 불꽃칼날");flameArc.a=NewRenderer(flameArc,"원본 스윙",flameArcFrames[0],malice,0);centeredMaliceSprites.Add(flameArc.a);
   shieldGuard.go.SetActive(false);flameArc.go.SetActive(false);
  }
  static Vector3 QeCenter(PlayerState p){return Point(p.X,p.Y)+(NativeRemodel3D.Active?Vector3.up*.5f:Vector3.zero);}
  void UpdateQeVisuals(Simulation sim,float time)
  {
   var p=sim.Player;ShieldAuraShown=p.State=="sBlock"&&p.Hp>0;shieldGuard.go.SetActive(ShieldAuraShown);ShieldRangeShown=0;
   if(ShieldAuraShown)
   {
    if(lastGuardTick!=sim.TickCount){shieldAge++;lastGuardTick=sim.TickCount;}
    shieldGuard.go.transform.position=QeCenter(p);int frame=(shieldAge/8)%2;bool parry=sim.SbParryT>0;
    float pulse=parry?1:.85f+Mathf.Sin(time*1000/60*3)*.15f;float radius=(float)Exoduser.UnityPort.Core.Combat.ParryRules.SBlockChargeRadius(sim.SbHoldT);ShieldRangeShown=radius;
    shieldGuard.a.sprite=shieldGuard.b.sprite=shieldAuraFrames[frame];Fit(shieldGuard.a,radius*.5f*3.75f*pulse,480);Fit(shieldGuard.b,20*3.75f*pulse,480);
    shieldGuard.a.color=shieldGuard.b.color=new Color(1,1,1,Mathf.Min(1,pulse*1.4f));shieldGuard.a.sortingOrder=(int)p.Y+8;shieldGuard.b.sortingOrder=(int)p.Y+9;
    BuildGuardRange(p,radius,parry,time);guardRangeRenderer.sortingOrder=(int)p.Y+7;
   }else{shieldAge=0;lastGuardTick=-1;}
   float progress=p.State=="sBash"?(24-p.StateTicks)/40f:(40-p.StateTicks)/40f;
   FlameArcShown=sim.ShieldWingTicks>0&&(p.State=="sBash"||p.State=="sRecover")&&progress<1;flameArc.go.SetActive(FlameArcShown);
   if(FlameArcShown)
   {
    flameArc.go.transform.position=QeCenter(p);flameArc.a.sprite=flameArcFrames[Mathf.Clamp(Mathf.FloorToInt(progress*8),0,7)];
    var shield=sim.EquippedInventory!=null?sim.EquippedInventory.GetEquipped("shield"):null;float bonus=shield!=null?(float)shield.bonusRange:0;
    float range=1+(Math.Max(1,Math.Min(sim.Skills.Level("maliceSwipe"),sim.Skills.Level("shieldThrow")))-1)*.05f;
    float size=(200+bonus*8)*(float)Math.Min(3,Math.Max(1,sim.SBashChgMul))*range;Fit(flameArc.a,size,flameArc.a.sprite.rect.width);
    flameArc.a.transform.localRotation=Quaternion.Euler(0,0,-p.Facing*Mathf.Rad2Deg);flameArc.a.color=Color.white;flameArc.a.sortingOrder=(int)p.Y+10;
   }
  }
  void BuildGuardRange(PlayerState p,float radius,bool parry,float time)
  {
   var vertices=guardVertices;var colors=guardColors;var indices=guardIndices;vertices.Clear();colors.Clear();indices.Clear();float circumference=2*Mathf.PI*radius,shift=time*120;Color c=(parry?new Color(1,1,1,.68f):new Color(105/255f,184/255f,1,.68f)).linear;
   Vector3 center=shieldGuard.go.transform.position;
   for(float start=-23;start<circumference;start+=23)
   {
    float offset=((shift%circumference)+circumference)%circumference;
    float a=(start+offset)/radius,b=(start+14+offset)/radius;int n=vertices.Count;
    for(int end=0;end<2;end++)for(int side=0;side<2;side++)
    {
     float angle=end==0?a:b,r=radius+(side==0?-1.25f:1.25f);float x=p.X+Mathf.Cos(angle)*r,y=p.Y+Mathf.Sin(angle)*r;
     Vector3 pt=Point(x,y)+(NativeRemodel3D.Active?Vector3.up*.03f:Vector3.zero);vertices.Add(pt-center);colors.Add(c);
    }
    indices.Add(n);indices.Add(n+1);indices.Add(n+2);indices.Add(n+2);indices.Add(n+1);indices.Add(n+3);
   }
   guardRangeMesh.Clear();guardRangeMesh.SetVertices(vertices);guardRangeMesh.SetColors(colors);guardRangeMesh.SetTriangles(indices,0);guardRangeMesh.RecalculateBounds();
  }
  void UpdateBashWave(Item item,SlamWave wave)
  {
   item.a.enabled=item.b.enabled=false;if(item.rings==null){item.rings=new[]{NewRing(item,Color.white),NewRing(item,Color.white)};foreach(var l in item.rings){l.useWorldSpace=true;l.sharedMaterial=malice;l.applyActiveColorSpace=false;l.positionCount=96;}}
   float progress=wave.T/(float)wave.MaxT,fade=Mathf.Max(0,1-progress),radius=30+(wave.MaxR-30)*progress,width=12*(1-progress*.55f)+5;
   Color color=wave.Flame?new Color(1,122/255f,36/255f):new Color(102/255f,170/255f,221/255f);
   for(int ring=0;ring<2;ring++)
   {
    var line=item.rings[ring];Color c=color;c.a=ring==0?Mathf.Min(1,1.1f*fade):.7f*fade;line.startColor=line.endColor=c.linear;line.widthMultiplier=(ring==0?width:Mathf.Max(2,width*.28f))/100;line.sortingOrder=(int)wave.Y+3+ring;
    float r=radius*(ring==0?1:1.075f);for(int j=0;j<96;j++){float a=j*Mathf.PI*2/96;line.SetPosition(j,Point(wave.X+Mathf.Cos(a)*r,wave.Y+Mathf.Sin(a)*r)+(NativeRemodel3D.Active?Vector3.up*.04f:Vector3.zero));}
   }
  }
  void ResetQeVisuals(){ShieldAuraShown=FlameArcShown=false;ShieldRangeShown=0;shieldAge=0;lastGuardTick=-1;if(shieldGuard!=null)shieldGuard.go.SetActive(false);if(flameArc!=null)flameArc.go.SetActive(false);}
  void DisposeQeVisuals(){ResetQeVisuals();centeredMaliceSprites.Remove(shieldGuard.a);centeredMaliceSprites.Remove(shieldGuard.b);centeredMaliceSprites.Remove(flameArc.a);UnityEngine.Object.Destroy(shieldGuard.go);UnityEngine.Object.Destroy(flameArc.go);UnityEngine.Object.Destroy(guardRangeMesh);foreach(var s in shieldAuraFrames)UnityEngine.Object.Destroy(s);foreach(var s in flameArcFrames)UnityEngine.Object.Destroy(s);}
 }
}
