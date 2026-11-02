using System;using UnityEngine;using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort {
 public sealed partial class NativeSkillView {
  Sprite[] pillarFrames;Sprite protectionDome,vortex;
  bool BuildExtendedZone(Item item,FireZone zone){
   if(zone.Type=="darkPillar"){if(pillarFrames==null){var texture=Resources.Load<Texture2D>("Art/vfx/skill_dark_pillar_sheet");if(texture==null)throw new InvalidOperationException("악의기둥 원본 lava_erupt 누락");pillarFrames=new Sprite[9];int fw=texture.width/3,fh=texture.height/3;for(int f=0;f<9;f++)pillarFrames[f]=Sprite.Create(texture,new Rect(f%3*fw,texture.height-(f/3+1)*fh,fw,fh),new Vector2(.5f,.25f),100,0,SpriteMeshType.FullRect);}item.a=NewRenderer(item,"dark pillar",pillarFrames[0],alpha,0);return true;}
   if(zone.Type=="maliceDome"){if(protectionDome==null){var texture=Resources.Load<Texture2D>("Art/vfx/skill_protection_dome");if(texture==null)throw new InvalidOperationException("신의영역 원본 malice_dome 누락");protectionDome=Sprite.Create(texture,new Rect(0,0,1536,1024),new Vector2(.5f,.25f),100,0,SpriteMeshType.FullRect);}item.a=NewRenderer(item,"protection dome",protectionDome,alpha,0);return true;}
   if(zone.Type=="holyPrison"){item.a=NewRenderer(item,"holy prison",dome,alpha,-19000);groundSkillSprites.Add(item.a);NativeGroundSkillSurface.Mark(item.a,true,zone.R*.01f*Mathf.Sqrt(2));return true;}
   if(zone.Type=="iceStorm"){if(vortex==null)vortex=Whole("Art/vfx/skill_vortex");item.a=NewRenderer(item,"ice vortex",vortex,alpha,-19000);item.b=NewRenderer(item,"ice vortex core",vortex,alpha,-18999);groundSkillSprites.Add(item.a);groundSkillSprites.Add(item.b);NativeGroundSkillSurface.Mark(item.a,true,zone.R*.01f*Mathf.Sqrt(2));NativeGroundSkillSurface.Mark(item.b,true,zone.R*.007f*Mathf.Sqrt(2));item.rings=new[]{NewRing(item,Color.white)};return true;}
   return false;
  }
  bool UpdateExtendedZone(Item item,FireZone zone,Simulation sim,float time){
   float progress=zone.T/(float)Math.Max(1,zone.MaxT),fade=Mathf.Clamp01((1-progress)/.2f)*.3f;var ground=NativeRemodel3D.Active?Quaternion.Euler(90,0,0):Quaternion.identity;
   if(zone.Type=="darkPillar"){int step=zone.T/6,frame=step<9?step:3+(step-9)%6;item.a.sprite=pillarFrames[Mathf.Clamp(frame,0,8)];Fit(item.a,384*zone.R/120,pillarFrames[0].rect.width);item.a.color=new Color(1,1,1,(.68f+.08f*Mathf.Sin(time*4))*fade);item.a.sortingOrder=(int)zone.Y;return true;}
   if(zone.Type=="maliceDome"){float scale=zone.T<15?zone.T/15f:zone.T>zone.MaxT-15?(zone.MaxT-zone.T)/15f:1;scale=scale*scale*(3-2*scale);float size=zone.R*1.6f*scale;Fit(item.a,size,1536);item.a.enabled=size>=1;item.a.color=new Color(1,1,1,(.8f+.15f*Mathf.Sin(time*3))*Mathf.Min(1,scale*2));item.a.sortingOrder=(int)zone.Y+5;return true;}
   if(zone.Type=="holyPrison"){bool hide=false;foreach(var other in sim.FireZones)if(other.Type=="holyDome"&&Mathf.Abs(other.X-zone.X)<5&&Mathf.Abs(other.Y-zone.Y)<5){hide=true;break;}item.a.enabled=!hide;item.a.transform.localRotation=Quaternion.Euler(0,0,time*.05f*Mathf.Rad2Deg);Fit(item.a,zone.R*2*Mathf.Min(1,(1-progress)*5),dome.rect.width);item.a.color=new Color(1,1,1,(.5f+.3f*Mathf.Sin(time*3))*Mathf.Clamp01(1-progress));return true;}
   if(zone.Type=="iceStorm"){float deploy=Mathf.Min(1,zone.T/20f),size=zone.R*2*deploy;Fit(item.a,size,vortex.rect.width);Fit(item.b,size*.7f,vortex.rect.width);item.a.transform.localRotation=Quaternion.Euler(0,0,time*.06f*Mathf.Rad2Deg);item.b.transform.localRotation=Quaternion.Euler(0,0,-time*.09f*Mathf.Rad2Deg);item.a.color=new Color(1,1,1,(.4f+.2f*Mathf.Sin(time*3))*fade);item.b.color=new Color(1,1,1,(.25f+.1f*Mathf.Sin(time*5))*fade);item.rings[0].widthMultiplier=.02f;SetRing(item.rings[0],zone.R*deploy,new Color(136/255f,221/255f,1,(.12f+.06f*Mathf.Sin(time*2))*fade),item.a);return true;}
   return false;
  }
  void DisposeExtendedZones(){if(pillarFrames!=null)foreach(var frame in pillarFrames)UnityEngine.Object.Destroy(frame);if(protectionDome!=null)UnityEngine.Object.Destroy(protectionDome);if(vortex!=null)UnityEngine.Object.Destroy(vortex);}
 }
}
