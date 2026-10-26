using System;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort {
 public sealed class NativeSkills {
  public bool Open {get;private set;}
  public int SelectedSlot {get;private set;}=SkillUiState.LmbSlot;
  readonly SkillUiData data;readonly Font font;readonly Texture2D icon,iron;
  GUIStyle title,body,small,button,key;Vector2 scroll;
  public NativeSkills(){
   data=JsonUtility.FromJson<SkillUiData>(Resources.Load<TextAsset>("Data/skill_ui").text);
   if(data.slots.Length!=13||data.slots[6].definition!="lmb"||data.skill.id!="kiSlash")throw new InvalidOperationException("Source skill slot catalogue mismatch");
   font=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-Regular");icon=Resources.Load<Texture2D>("Art/ui/skill_icons/kiSlash");iron=Resources.Load<Texture2D>("Art/ui/inventory/iron");
  }
  public void SetOpen(bool value,int slot=6){Open=value;if(value)Select(slot);}
  public void Select(int slot){SelectedSlot=Mathf.Clamp(slot,0,12);scroll=Vector2.zero;}
  public void HandleKeys(Action close,Action equip){
   if(Input.GetKeyDown(KeyCode.K)){close();return;}
   if(Input.GetKeyDown(KeyCode.LeftArrow))Select(SelectedSlot-1);
   if(Input.GetKeyDown(KeyCode.RightArrow))Select(SelectedSlot+1);
   if(Input.GetKeyDown(KeyCode.Home))Select(0);if(Input.GetKeyDown(KeyCode.End))Select(12);
   if(Input.GetKeyDown(KeyCode.Alpha1))Select(0);if(Input.GetKeyDown(KeyCode.Alpha2))Select(1);if(Input.GetKeyDown(KeyCode.Alpha3))Select(2);if(Input.GetKeyDown(KeyCode.Alpha4))Select(3);
   if(Input.GetKeyDown(KeyCode.Return)&&SelectedSlot==6)equip();
  }
  void Styles(){if(title!=null)return;body=new GUIStyle(GUI.skin.label){font=font,fontSize=20,wordWrap=true};body.normal.textColor=new Color(.91f,.87f,.78f);small=new GUIStyle(body){fontSize=16};small.normal.textColor=new Color(.69f,.65f,.58f);title=new GUIStyle(body){fontSize=32};title.normal.textColor=new Color(.85f,.73f,.52f);button=new GUIStyle(GUIStyle.none){font=font,fontSize=20,alignment=TextAnchor.MiddleCenter};button.normal.textColor=body.normal.textColor;key=new GUIStyle(button){fontSize=16};}
  static void Fill(Rect r,Color c){var old=GUI.color;GUI.color=c;GUI.DrawTexture(r,Texture2D.whiteTexture);GUI.color=old;}
  void Surface(Rect r,bool selected=false){var old=GUI.color;GUI.color=new Color(.4f,.38f,.34f);GUI.DrawTexture(r,iron,ScaleMode.ScaleAndCrop);GUI.color=old;Fill(r,new Color(0,0,0,.77f));Fill(new Rect(r.x,r.y,r.width,2),selected?new Color(.85f,.68f,.4f):new Color(.3f,.26f,.19f));}
  bool Button(Rect r,string label,bool selected=false){Surface(r,selected);return GUI.Button(r,label,button);}
  public void Draw(Simulation sim,Action close,Action equip){
   if(!Open)return;Styles();var old=GUI.matrix;var color=GUI.color;bool enabled=GUI.enabled;
   try {
    GUI.matrix=Matrix4x4.identity;Fill(new Rect(0,0,Screen.width,Screen.height),new Color(0,0,0,.76f));
    // Web common tab bar at its 1920x1080 skill-window position (U-08); the interim 1280x720 body sits below it at 1.4x until U-05 redraws the window.
    float s=Mathf.Min(Screen.width/1920f,Screen.height/1080f);var baseM=Matrix4x4.TRS(new Vector3((Screen.width-1920*s)/2,(Screen.height-1080*s)/2,0),Quaternion.identity,Vector3.one*s);
    GUI.matrix=baseM;NativePanelTabBar.Draw(NativePanelTabBar.Preset.Skill,"skillPanel");
    GUI.matrix=baseM*Matrix4x4.TRS(new Vector3(64,72,0),Quaternion.identity,Vector3.one*1.4f);
    Surface(new Rect(40,32,1200,656),true);GUI.Label(new Rect(68,50,720,50),"스킬 · 전투 슬롯",title);
    if(Button(new Rect(1080,52,132,44),"닫기  ESC"))close();
    for(int i=0;i<13;i++){
     var rect=new Rect(68+i*88,120,82,92);Surface(rect,i==SelectedSlot);
     if(i==6&&sim.Config.ActiveAttack=="kiSlash")GUI.DrawTexture(new Rect(rect.x+21,rect.y+9,40,40),icon,ScaleMode.ScaleToFit,true);
     else GUI.Label(new Rect(rect.x,rect.y+14,rect.width,30),"—",key);
     GUI.Label(new Rect(rect.x,rect.y+57,rect.width,28),data.slots[i].key,key);
     if(GUI.Button(rect,"",GUIStyle.none))Select(i);
    }
    Surface(new Rect(68,236,316,368));Surface(new Rect(408,236,804,368));
    GUI.Label(new Rect(88,254,276,64),data.slots[SelectedSlot].key+" 슬롯",title);
    if(SelectedSlot==6){
     GUI.DrawTexture(new Rect(116,322,220,180),icon,ScaleMode.ScaleToFit,true);
     GUI.Label(new Rect(88,526,276,32),"기검참 · Lv "+Math.Max(1,sim.Config.KiSlashLevel),body);
     GUI.Label(new Rect(88,563,276,30),sim.Config.ActiveAttack=="kiSlash"?"현재 장착 중":"장착 가능",small);
     var viewport=new Rect(432,254,752,272);float h=body.CalcHeight(new GUIContent(data.skill.description),724);
     scroll=GUI.BeginScrollView(viewport,scroll,new Rect(0,0,724,h+170));
     GUI.Label(new Rect(0,0,724,h),data.skill.description,body);
     GUI.Label(new Rect(0,h+20,724,44),"현재 레벨의 공격당 체력 소모  "+(10+(Math.Max(1,sim.Config.KiSlashLevel)-1)*2),body);
     GUI.Label(new Rect(0,h+70,724,70),"좌클릭으로 1·2타를 잇고, 세 번째 공격을 길게 누르세요.\n최대 충전까지 2초. 마우스를 놓으면 검기를 발사합니다.",body);
     GUI.EndScrollView();
     GUI.enabled=enabled&&sim.Config.ActiveAttack!="kiSlash"&&sim.Player.State=="idle"&&sim.Player.Hp>0;
     if(Button(new Rect(432,540,752,44),sim.Config.ActiveAttack=="kiSlash"?"좌클릭에 장착 중":"좌클릭에 장착",true))equip();GUI.enabled=enabled;
    }else{
     GUI.Label(new Rect(88,326,276,100),"현재 사용할 수 있는\n스킬이 없습니다.",body);
     GUI.Label(new Rect(432,266,752,64),"이 슬롯의 스킬은 아직 준비 중입니다.",title);
     GUI.Label(new Rect(432,336,752,148),"이번 미리보기에서는 좌클릭 기검참을 사용할 수 있습니다.\n숫자 1~4는 스킬 슬롯이며 물약 단축키가 아닙니다.\n추가 스킬의 습득·강화·합체는 아직 지원되지 않습니다.",body);
     if(Button(new Rect(432,540,752,44),"사용 가능한 기검참 보기",true))Select(6);
    }
    GUI.Label(new Rect(68,625,1120,38),"← → 슬롯 선택    1~4 숫자 슬롯 보기    K / ESC 닫기    ·    전투가 일시정지되어 있습니다.",small);
   }finally{GUI.matrix=old;GUI.color=color;GUI.enabled=enabled;}
  }
 }
}
