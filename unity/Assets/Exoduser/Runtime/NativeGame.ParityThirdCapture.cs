using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
 public sealed partial class NativeGame {
  IEnumerator ParityThirdCapture(){
   var checks=new List<string>();overlapLanguage="ko";lobby.SetLanguage("ko");
   overlapCoverage.languages=new[]{"ko"};overlapCoverage.resolutions=new[]{"1920x1080","2560x1080","3840x1080"};
   foreach(int width in new[]{1920,2560,3840}){
    Screen.SetResolution(width,1080,FullScreenMode.Windowed);yield return null;yield return null;
#if UNITY_STANDALONE_WIN
    if(Screen.width!=width||Screen.height!=1080){UiWideSetClientSize(width,1080);yield return null;}
#endif
    float limit=Time.realtimeSinceStartup+5;while((Screen.width!=width||Screen.height!=1080)&&Time.realtimeSinceStartup<limit)yield return null;
    if(Screen.width!=width||Screen.height!=1080)throw new InvalidOperationException("third capture resolution mismatch");
    menu=false;Running=false;pauseMenu.Reset();stageClear.Hide();nextDifficulty.Cancel();
    lobby.Begin();lobby.AdvanceSplash();yield return new WaitForSecondsRealtime(1.1f);yield return UiWaitTitleArt();
    if(BuildFlavor.ReleaseVersion==Argument("--expected-release")&&!string.IsNullOrEmpty(BuildFlavor.ReleaseVersion))checks.Add(width+" title current release="+BuildFlavor.ReleaseVersion);
    else throw new InvalidOperationException("stale embedded release");
    yield return UiOverlapShot("3차-메뉴");
    lobby.ShowLobby();lobby.Characters.TryRestore(new[]{"삼차검수"+width},0);lobby.OpenCharacterCreation();
    foreach(int visual in new[]{0,1}){lobby.ChooseCharacterVisual(visual);yield return UiWaitCharacterMovie(visual);yield return UiOverlapShot("3차-캐릭터"+visual);}
    lobby.CloseCharacterCreation();lobby.SelectPreview();lobby.EnterNativeTest();frontendEntryInputFence=false;EndFirstPractice(true);Running=false;menu=false;areaTitle.Hide();levelUp.Hide();
    SetForge(true);foreach(string tab in new[]{"upgrade","potion","salvage","reroll","crystal","craft"}){forge.SelectTab(tab);yield return UiOverlapShot("3차-대장간-"+tab);}SetForge(false);
    SetSkills(true,6);foreach(int slot in new[]{6,0,7,8,11,13,14}){skills.Select(slot);yield return UiOverlapShot("3차-스킬"+slot);}Simulation.Player.Level=50;Simulation.Player.StatPoints=40;Simulation.Materials=1000;
    if(NativeSkillManagementPolicy.Level(Simulation,"spikeTrap")==0&&!NativeSkillManagementPolicy.Learn(Simulation,"spikeTrap",10,80,1))throw new InvalidOperationException("live skill learn");
    if(!NativeSkillManagementPolicy.Equip(Simulation,0,"spikeTrap")||!NativeSkillManagementPolicy.Upgrade(Simulation,"spikeTrap"))throw new InvalidOperationException("live skill equip/upgrade");
    skills.Select(0);yield return UiOverlapShot("3차-스킬-실제강화");
    int skillSp=Simulation.Player.StatPoints,skillMats=Simulation.Materials,skillLv=NativeSkillManagementPolicy.Level(Simulation,"spikeTrap");
    if(!skills.RequestReset(Simulation,"spikeTrap"))throw new InvalidOperationException("skill reset confirmation missing");yield return UiOverlapShot("3차-스킬-리셋확인");skills.ResolveReset(false);
    if(Simulation.Player.StatPoints!=skillSp||Simulation.Materials!=skillMats||NativeSkillManagementPolicy.Level(Simulation,"spikeTrap")!=skillLv)throw new InvalidOperationException("skill reset cancel mutated ledger");
    if(!skills.RequestReset(Simulation,"spikeTrap")||!skills.ResolveReset(true)||NativeSkillManagementPolicy.Level(Simulation,"spikeTrap")!=0||Simulation.Materials!=skillMats)throw new InvalidOperationException("skill reset refund failed");
    checks.Add(width+" actual skill learn/equip/upgrade/reset-confirm/cancel/refund PASS");SetSkills(false,6);
    Simulation.Player.StatPoints=10;Simulation.Player.PassivePoints=0;
    SetStats(true);yield return UiOverlapShot("3차-능력치");
    typeof(NativeStatPanel).GetMethod("SelectNode",BindingFlags.Instance|BindingFlags.NonPublic).Invoke(stats,new object[]{"str",0});
    int previous=Simulation.Growth.Stats["str"];
    if(!stats.PlanChange("str",1))throw new InvalidOperationException("STR plan rejected");yield return UiOverlapShot("3차-능력치-STR계획");
    if(!stats.ApplyPlan()||Simulation.Growth.Stats["str"]!=previous+1||Simulation.Player.StatPoints!=9)throw new InvalidOperationException("STR apply did not spend one actual SP");
    yield return UiOverlapShot("3차-능력치-STR적용");
    if(!stats.ReservePassive("pAtk",1)||Simulation.Growth.Queue.Count!=1)throw new InvalidOperationException("AP0 reservation failed");
    yield return UiOverlapShot("3차-능력치-예약");if(!stats.CancelReservation(0)||Simulation.Growth.Queue.Count!=0)throw new InvalidOperationException("reservation cancel failed");
    checks.Add(width+" STR plan/apply actual SP and AP0 reserve/cancel PASS");SetStats(false);
    int offset=Simulation.Config.StageDiffOffset;bool confirmed=false,cancelled=false;
    nextDifficulty.Show(offset,"ko",v=>{confirmed=true;Simulation.Config.StageDiffOffset=v;},()=>cancelled=true);
    foreach(int index in new[]{0,2,4}){nextDifficulty.Pick(index);yield return UiOverlapShot("3차-난이도"+index);}
    nextDifficulty.Cancel();if(!cancelled||confirmed||Simulation.Config.StageDiffOffset!=offset)throw new InvalidOperationException("difficulty cancel mutated stage");
    nextDifficulty.Show(offset,"ko",v=>{confirmed=true;Simulation.Config.StageDiffOffset=v;},()=>{});nextDifficulty.Pick(3);nextDifficulty.Confirm();
    if(!confirmed||Simulation.Config.StageDiffOffset!=50)throw new InvalidOperationException("difficulty confirm missing offset");Simulation.Config.StageDiffOffset=offset;
    checks.Add(width+" difficulty selection/cancel/confirm actual callbacks PASS");
   }
   File.WriteAllText(Path.Combine(overlapOutput,"third-checks.json"),"{\"scope\":\"isolated product API fixtures; not natural play\",\"checks\":[\""+string.Join("\",\"",checks.ToArray())+"\"]}");
  }
 }
}
