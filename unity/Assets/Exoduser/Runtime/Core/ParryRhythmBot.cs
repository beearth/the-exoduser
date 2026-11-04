using System;using System.Collections.Generic;
namespace Exoduser.UnityPort.Core {
 // Seven of each ten observed, reachable tell signals receive an input. No gameplay RNG or forced rewards.
 public sealed class ParryRhythmBot {
  readonly HashSet<long> issued=new HashSet<long>();readonly HashSet<BossProjectile> bullets=new HashSet<BossProjectile>();public int opportunities,attempts;
  bool Attempt(){opportunities++;bool hit=(opportunities-1)%10<7;if(hit)attempts++;return hit;}
  public int Input(Simulation s){ // bit 1 E, bit 2 Q, bit 4 dodge
   foreach(var e in s.Enemies){var w=e.Web;if(!e.Alive||w==null||w.s!="g2Tell"||w.MeleeTimer>6||w.MeleeTimer<=0)continue;double dx=e.X-s.Player.X,dy=e.Y-s.Player.Y;if(dx*dx+dy*dy>250*250)continue;long key=((long)e.Id<<32)|(uint)w.MeleeTellSerial;if(!issued.Add(key))continue;if(w.MeleeUnparryable)return 4;if(Attempt())return 1;}
   if(s.Druid!=null)foreach(var p in s.Druid.Projectiles){if(!p.Active||p.Friendly||bullets.Contains(p))continue;double dx=s.Player.X-p.X,dy=s.Player.Y-p.Y,dist=Math.Sqrt(dx*dx+dy*dy),speed=Math.Sqrt(p.Vx*p.Vx+p.Vy*p.Vy);if(speed<=0||dx*p.Vx+dy*p.Vy<=0||dist>Math.Max(90,speed*7))continue;bullets.Add(p);if(p.ParryClass=="forbidden")return 4;if(Attempt())return p.ParryClass=="physical"?1:2;}
   return 0;
  }
 }
}
