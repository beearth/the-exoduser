using System;
using System.Reflection;
using Exoduser.UnityPort.Core;
using Exoduser.UnityPort;
class Program
{
 sealed class Host:IBossHost
 {
  public double Rand()=>.5;public int Stage=>1;public double ArenaW=>20000;public double ArenaH=>20000;public double PX{get;set;}=4000;public double PY{get;set;}=4000;public double PRadius=>15;public double PFacing=>0;public double PIframes{get;set;}=100;public bool PlayerAlive=>true;
  public bool ParryWindowOpen()=>false;public bool TileWall(double x,double y)=>false;public bool IsWall(double x,double y)=>false;public bool CanMove(double x,double y,double r)=>true;public bool SafePoint(double x,double y,double r,out double ox,out double oy){ox=x;oy=y;return true;}public bool FlowDir(double x,double y,out double dx,out double dy){dx=0;dy=0;return true;}public bool Los(double x,double y,double tx,double ty)=>true;
  public void HurtPlayer(int d,bool m){}public void KnockPlayer(double x,double y){}public void StopPlayerKnock(){}public void PlayerPoison(double s,double w){}public bool TryParry(EnemyState b,double d,double s,double p,double k)=>false;public void BossHurt(EnemyState b,int d,double a){}public void Text(double x,double y,string k,string c,int l){}public void Shake(double n){}public void Fx(string k,double x,double y,double r){}public EnemyState SpawnMinion(double x,double y,int e,int t)=>null;public void BossMoved(EnemyState b){}
 }
 static int checks;static void Check(bool value,string message){checks++;if(!value)throw new Exception(message);}
 static readonly MethodInfo tick=typeof(DruidBoss).GetMethod("UpdateProjectiles",BindingFlags.Instance|BindingFlags.NonPublic);
 static FieldInfo visible;
 static BossProjectile Run(double distance,double life,bool mine,bool red,Func<double,double,double,bool> camera)
 {
  var boss=new DruidBoss(new Host());visible.SetValue(boss,camera);var p=new BossProjectile{X=4000+distance,Y=4000,Life=life,Ml=100,R=4,Sz=4,Active=true,Mine=mine,RedBean=red};boss.Projectiles.Add(p);tick.Invoke(boss,null);return p;
 }
 static void Main()
 {
  visible=typeof(DruidBoss).GetField("WorldPointVisible");Check(visible!=null,"actual Core camera visibility callback missing");
  Check(!Run(2600,.1,false,false,null).Active,"legacy far expiry stays dead");
  Check(!Run(2600,.1,false,false,(x,y,m)=>false).Active,"offscreen far expiry stays dead");
  Check(Run(2600,.1,false,false,(x,y,m)=>true).Active,"visible far projectile survives range cleanup");
  Check(Run(2500,.1,false,false,null).Active,"2500 exact boundary unchanged");
  Check(!Run(2500.001,.1,false,false,null).Active,"6250000 threshold unchanged");
  Check(!Run(2600,.1,true,false,(x,y,m)=>true).Active,"mine lifetime unchanged");
  Check(!Run(2600,.1,false,true,(x,y,m)=>true).Active,"red-bean lifetime unchanged");
  Check(!Run(2600,-901,false,false,(x,y,m)=>true).Active,"forced expiry remains dead");
  double margin=0;Run(2600,.1,false,false,(x,y,m)=>{margin=m;return true;});Check(margin==104,"projectile radius plus100 visibility margin");
  int calls=0;Run(100,.1,false,false,(x,y,m)=>{calls++;return true;});Run(2600,100,false,false,(x,y,m)=>{calls++;return true;});Check(calls==0,"camera callback only on far expiry");
  foreach(double d in new[]{0,100,2499,2500,2500.001,2600,4000})foreach(double life in new[]{-901,-.5,0,.5,1,100})foreach(int kind in new[]{0,1,2}){var legacy=Run(d,life,kind==1,kind==2,null);var outside=Run(d,life,kind==1,kind==2,(x,y,m)=>false);Check(legacy.Active==outside.Active&&legacy.Life==outside.Life,"null/offscreen legacy equivalence");}
  foreach(double aspect in new[]{1920d/1080,2560d/1080,3840d/1080,2560d/1600})foreach(double zoom in new[]{1d,.8,.5})foreach(double x in new[]{70d,999,1000,4020,7930})foreach(double y in new[]{70d,999,7420}){double hh=540/zoom,hw=hh*aspect;var range=NativeWorldChunkRange.Fit(x,y,hw,hh);for(int cx=(int)Math.Floor((x-hw)/1000);cx<=(int)Math.Floor((x+hw)/1000);cx++)for(int cy=(int)Math.Floor((y-hh)/1000);cy<=(int)Math.Floor((y+hh)/1000);cy++)Check(range.Contains(cx,cy),"actual camera visible chunk retained");if(aspect==1920d/1080&&zoom==1)Check(range.RadiusX==2&&range.RadiusY==1,"1920 initial chunk radius unchanged");}
  Console.WriteLine("PASS "+checks+" actual projectile visibility/lifetime and camera chunk checks");
 }
}
