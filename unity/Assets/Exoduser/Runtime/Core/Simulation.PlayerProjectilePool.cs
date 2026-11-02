using System;using System.Collections.Generic;
namespace Exoduser.UnityPort.Core {
 internal sealed class PlayerProjectileCarry {internal double Grace,Rehit;internal int PierceCount;}
 public sealed partial class Simulation {
  // Actual web begins with120 _mkPProj objects; every pop, including the first, calls _resetPProj.
  readonly Stack<PlayerProjectileCarry> playerProjectileFree=CreatePlayerProjectilePool();
  static Stack<PlayerProjectileCarry> CreatePlayerProjectilePool(){var pool=new Stack<PlayerProjectileCarry>(BoltPoolSize);for(int i=0;i<BoltPoolSize;i++)pool.Push(new PlayerProjectileCarry());return pool;}
  public int BoltFreeCount {get{return playerProjectileFree.Count;}set{int n=Math.Max(0,Math.Min(BoltPoolSize,value));while(playerProjectileFree.Count>n)playerProjectileFree.Pop();while(playerProjectileFree.Count<n)playerProjectileFree.Push(new PlayerProjectileCarry());}}
  PlayerProjectileCarry TakePlayerProjectile(out bool fresh){fresh=playerProjectileFree.Count==0;return fresh?new PlayerProjectileCarry():playerProjectileFree.Pop();}
  void RecyclePlayerProjectile(PlayerProjectileCarry state){if(state!=null&&playerProjectileFree.Count<BoltPoolSize)playerProjectileFree.Push(state);}
  PlayerSkillProjectile TakeSkillProjectile(PlayerSkillProjectile p){bool fresh;p.PoolCarry=TakePlayerProjectile(out fresh);p.Fresh=fresh;p.PierceRate=fresh?0:50+(EquippedInventory?.AffixTotal("pierceFlat")??Crossbow.PierceFlat);p.PierceCount=p.PoolCarry.PierceCount;p.Rehit=p.PoolCarry.Rehit;if(p.Grace==0)p.Grace=p.PoolCarry.Grace;if(!fresh){if(p.PierceProbability==0)p.PierceProbability=Math.Min(.95,Growth.Value("pPierce")*.05);if(p.PierceMax==0)p.PierceMax=Growth.Value("pPierce");}return p;}
  void RecycleSkillProjectile(PlayerSkillProjectile p){if(p.PoolCarry==null)return;p.PoolCarry.Grace=p.Grace;p.PoolCarry.Rehit=p.Rehit;p.PoolCarry.PierceCount=p.PierceCount;RecyclePlayerProjectile(p.PoolCarry);p.PoolCarry=null;}
 }
}
