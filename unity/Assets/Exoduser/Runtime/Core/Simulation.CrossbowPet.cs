using System;
namespace Exoduser.UnityPort.Core {
 public sealed partial class Simulation {
  public bool CrossbowPetEnabled;
  public double CrossbowPetX,CrossbowPetY,CrossbowPetT=25,CrossbowPetTargetX,CrossbowPetTargetY,CrossbowPetAngle;
  public bool CrossbowPetMoving;
  public void EnableCrossbowPet(){CrossbowPetEnabled=true;CrossbowPetX=Player.X-30;CrossbowPetY=Player.Y-28;CrossbowPetT=25;CrossbowPetTargetX=Player.X;CrossbowPetTargetY=Player.Y;}
  void TickCrossbowPet(){
   if(!CrossbowPetEnabled)return;
   CrossbowPetT++;
   CrossbowPetTargetX=Player.X+Math.Cos(CrossbowPetT*.02+Math.PI)*44;
   CrossbowPetTargetY=Player.Y-28+Math.Sin(CrossbowPetT*.03+1.5)*8;
   double dx=CrossbowPetTargetX-CrossbowPetX,dy=CrossbowPetTargetY-CrossbowPetY,d=Math.Sqrt(dx*dx+dy*dy);CrossbowPetMoving=d>5;
   if(d>3){double speed=Math.Min(18,d*.12);CrossbowPetX+=dx/d*speed;CrossbowPetY+=dy/d*speed;}else{CrossbowPetX=CrossbowPetTargetX;CrossbowPetY=CrossbowPetTargetY;}
   double px=CrossbowPetX-Player.X,py=CrossbowPetY-Player.Y;
   if(Math.Sqrt(px*px+py*py)>520){CrossbowPetX=Player.X-30;CrossbowPetY=Player.Y-28;CrossbowPetTargetX=CrossbowPetX;CrossbowPetTargetY=CrossbowPetY;}
  }
 }
}
