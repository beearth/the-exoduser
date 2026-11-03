using System;using Exoduser.UnityPort.Core;using UnityEngine;
namespace Exoduser.UnityPort {
 public sealed partial class NativeGame {
  static readonly bool EnemyRigRequested=NativeEnemyRigPolicy.Requested(Environment.GetCommandLineArgs());
  NativeEnemyRigRenderer enemyRig;
  void AttachEnemyRig(){if(!EnemyRigRequested||enemyRig!=null)return;enemyRig=gameObject.AddComponent<NativeEnemyRigRenderer>();enemyRig.Initialize(()=>HudCamera,EnemyRigSpritesFor,Argument("-output"),id=>ImpactActive&&contactVfx!=null&&contactVfx.EnemyFrozen(id,ImpactNow));if(combatImpacts!=null)combatImpacts.EnemyRigAnchor=(e,c)=>enemyRig!=null?enemyRig.ImpactAnchor(e,c):null;}
  EnemyRigSprites EnemyRigSpritesFor(int id){if(enemies.TryGetValue(id,out var ev))return new EnemyRigSprites{Body=ev.body,Walk=ev.walk,Distance=ev.distance};return default;}
  public void WriteEnemyRigReceipt(string directory){enemyRig?.WriteReceipt(directory);}
 }
}
