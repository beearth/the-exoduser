using System;
using System.IO;
using UnityEngine;

namespace Exoduser.UnityPort
{
 public sealed partial class NativeLobby
 {
  [Serializable] sealed class PatchNotesCatalog { public PatchNotesEntry[] notes; }
  [Serializable] sealed class PatchNotesEntry { public string version,date; public PatchNotesLanguage ko,en; }
  [Serializable] sealed class PatchNotesLanguage { public PatchNotesSection[] sections; }
  [Serializable] sealed class PatchNotesSection { public string title; public string[] items; }
  [Serializable] sealed class PatchNotesLabels { public PatchNotesLabelEntry[] entries; }
  [Serializable] sealed class PatchNotesLabelEntry { public string code,title,close,empty; }

  PatchNotesCatalog patchNotesCatalog;
  PatchNotesLabels patchNotesLabels;
  bool patchNotesLoaded,patchNotesOpen,patchNotesFocusClose,patchNotesRestoreFocus;
  bool patchNotesQaChecked,patchNotesQaEnabled;
  int patchNotesQaRosterCount,patchNotesQaSelectedIndex;
  string patchNotesPreviousFocus;
  Vector2 patchNotesScroll;
  GUIStyle patchNotesTitle,patchNotesVersion,patchNotesSection,patchNotesItem,patchNotesEmpty,patchNotesClose;

  void LoadPatchNotes()
  {
   if(patchNotesLoaded)return;
   patchNotesLoaded=true;
   var source=Resources.Load<TextAsset>("Data/patch_notes");
   if(source!=null){try{patchNotesCatalog=JsonUtility.FromJson<PatchNotesCatalog>(source.text);}catch(Exception e){Debug.LogWarning("Patch notes data: "+e.Message);}}
   var labels=Resources.Load<TextAsset>("Data/patch_notes_labels");
   if(labels!=null){try{patchNotesLabels=JsonUtility.FromJson<PatchNotesLabels>(labels.text);}catch(Exception e){Debug.LogWarning("Patch notes labels: "+e.Message);}}
  }
  string PatchNotesUiLabel(string field)
  {
   LoadPatchNotes();
   PatchNotesLabelEntry english=null;
   var entries=patchNotesLabels==null?null:patchNotesLabels.entries;
   if(entries!=null)foreach(var entry in entries){
    if(entry==null)continue;
    if(entry.code=="en")english=entry;
    if(entry.code==Language){string value=PatchNotesLabelValue(entry,field);if(!string.IsNullOrEmpty(value))return value;}
   }
   string fallback=PatchNotesLabelValue(english,field);
   if(!string.IsNullOrEmpty(fallback))return fallback;
   if(field=="title")return K("패치 노트","PATCH NOTES");
   if(field=="close")return K("닫기","Close");
   return K("패치 노트가 없습니다","No patch notes yet.");
  }
  static string PatchNotesLabelValue(PatchNotesLabelEntry entry,string field)
  {
   if(entry==null)return null;
   if(field=="title")return entry.title;
   if(field=="close")return entry.close;
   return entry.empty;
  }
  void OpenPatchNotes()
  {
   if(patchNotesOpen||showLanguages||lobbyQuitPrompt||CharacterModalOpen)return;
   LoadPatchNotes();patchNotesPreviousFocus=GUI.GetNameOfFocusedControl();patchNotesScroll=Vector2.zero;
   patchNotesOpen=true;patchNotesFocusClose=true;patchNotesRestoreFocus=false;
  }
  void OpenPatchNotesForQaOnce()
  {
   if(patchNotesQaChecked||Event.current.type!=EventType.Repaint)return;
   patchNotesQaChecked=true;
   var args=Environment.GetCommandLineArgs();
   if(Array.IndexOf(args,"--unity-patch-notes-review")<0)return;
   int outputAt=Array.IndexOf(args,"-output");
   bool hasOutput=outputAt>=0&&outputAt+1<args.Length&&Path.IsPathRooted(args[outputAt+1]);
   string output=hasOutput?Path.GetFullPath(args[outputAt+1]):"";
   if(Array.IndexOf(args,"--unity-frontend-review")<0||Application.identifier!="com.fordeargamers.exoduser.a03a04qa20261027"||!hasOutput||!Directory.Exists(output)||!File.Exists(Path.Combine(output,"a03-modal-qa.marker"))){Debug.LogError("A03_QA_REJECTED: unique UI QA app, frontend review, absolute marked output required");return;}
   patchNotesQaRosterCount=Characters.Count;patchNotesQaSelectedIndex=Characters.SelectedIndex;
   OpenPatchNotes();patchNotesQaEnabled=patchNotesOpen;
   Debug.Log("A03_QA_OPEN: "+patchNotesOpen+" output="+output+" screen="+Screen.width+"x"+Screen.height+" roster="+patchNotesQaRosterCount+" selected="+patchNotesQaSelectedIndex+" language="+Language);
  }
  void ClosePatchNotes()
  {
   patchNotesOpen=false;patchNotesFocusClose=false;patchNotesRestoreFocus=true;
   if(patchNotesQaEnabled)Debug.Log("A03_QA_CLOSE: roster="+Characters.Count+" selected="+Characters.SelectedIndex+" unchanged="+(Characters.Count==patchNotesQaRosterCount&&Characters.SelectedIndex==patchNotesQaSelectedIndex)+" language="+Language);
  }
  void HandlePatchNotesKeys()
  {
   var e=Event.current;
   if(AutomatedInput||e.type!=EventType.KeyDown)return;
   if(patchNotesOpen){
    if(e.keyCode==KeyCode.Escape||e.keyCode==KeyCode.Return||e.keyCode==KeyCode.KeypadEnter||e.keyCode==KeyCode.Space){ClosePatchNotes();e.Use();return;}
    if(e.keyCode==KeyCode.PageDown||e.keyCode==KeyCode.DownArrow){patchNotesScroll.y+=80;e.Use();return;}
    if(e.keyCode==KeyCode.PageUp||e.keyCode==KeyCode.UpArrow){patchNotesScroll.y=Mathf.Max(0,patchNotesScroll.y-80);e.Use();return;}
    if(e.keyCode==KeyCode.Tab){GUI.FocusControl("patch-notes-close");e.Use();return;}
    e.Use();return;
   }
   if(!showLanguages&&!lobbyQuitPrompt&&!CharacterModalOpen&&e.keyCode==KeyCode.Tab&&string.IsNullOrEmpty(GUI.GetNameOfFocusedControl())){GUI.FocusControl("patch-notes-open");e.Use();return;}
   if(!showLanguages&&!lobbyQuitPrompt&&!CharacterModalOpen&&GUI.GetNameOfFocusedControl()=="patch-notes-open"&&(e.keyCode==KeyCode.Return||e.keyCode==KeyCode.KeypadEnter||e.keyCode==KeyCode.Space)){OpenPatchNotes();e.Use();}
  }
  void DrawPatchNotesLauncher()
  {
   LoadPatchNotes();
   Rect rect=new Rect(1744,866,60,42);
   Label(rect,BuildFlavor.Current.Label,silverMicro??lobbyMicro,TextAnchor.MiddleCenter);
   // LT-3: the web has ONE top-left overlay (#lobbyVerOverlay, drawn by NativeLobbyBuildLabels) and it is also the patch-notes opener; this launcher only owns the click area / focus ring.
   // It used to draw its own "vX / OFFLINE" text from the first patch-notes entry on top of that overlay (two shifted copies, an old version).
   GUI.SetNextControlName("patch-notes-open");
   if(GUI.Button(rect,"",GUIStyle.none))OpenPatchNotes();
   if(patchNotesRestoreFocus&&Event.current.type==EventType.Repaint){GUI.FocusControl(string.IsNullOrEmpty(patchNotesPreviousFocus)?"patch-notes-open":patchNotesPreviousFocus);patchNotesRestoreFocus=false;}
   if(!patchNotesOpen&&GUI.GetNameOfFocusedControl()=="patch-notes-open")Border(rect,new Color(.84f,.69f,.48f,.8f),1);
  }
  void PatchNotesStyles()
  {
   if(patchNotesTitle!=null)return;
   patchNotesTitle=new GUIStyle(lobbyTitle){fontSize=23,alignment=TextAnchor.MiddleCenter,wordWrap=false};patchNotesTitle.normal.textColor=new Color(.851f,.753f,.541f);
   patchNotesVersion=new GUIStyle(lobbyText){fontSize=20,wordWrap=false};patchNotesVersion.normal.textColor=new Color(.925f,.875f,.769f);
   patchNotesSection=new GUIStyle(lobbyText){fontSize=17,wordWrap=false};patchNotesSection.normal.textColor=new Color(.871f,.439f,.306f);
   patchNotesItem=new GUIStyle(lobbyText){fontSize=16,wordWrap=true};patchNotesItem.normal.textColor=new Color(.91f,.851f,.776f);
   patchNotesEmpty=new GUIStyle(patchNotesItem){alignment=TextAnchor.MiddleCenter};
   patchNotesClose=new GUIStyle(patchNotesItem){alignment=TextAnchor.MiddleCenter,wordWrap=false};
  }
  void DrawPatchNotesPanel()
  {
   if(!patchNotesOpen)return;
   PatchNotesStyles();
   Rect panel=new Rect(680,210,560,660),body=new Rect(706,285,508,500);
   Fill(new Rect(0,0,1920,1080),new Color(.008f,.004f,.004f,.66f));
   if(DismissOutside(panel)){ClosePatchNotes();return;}
   Fill(panel,new Color(.071f,.047f,.039f,.985f));Border(panel,new Color(.643f,.576f,.451f,.5f),1);
   Border(new Rect(panel.x+5,panel.y+5,panel.width-10,panel.height-10),new Color(.643f,.576f,.451f,.22f),1);
   Label(new Rect(710,229,500,34),PatchNotesUiLabel("title"),patchNotesTitle,TextAnchor.MiddleCenter);
   Fill(new Rect(716,274,488,1),new Color(.643f,.576f,.451f,.55f));
   float contentHeight=MeasurePatchNotesBody(body.width-22);
   patchNotesScroll=GUI.BeginScrollView(body,patchNotesScroll,new Rect(0,0,body.width-18,Mathf.Max(body.height,contentHeight)),false,true);
   DrawPatchNotesBody(body.width-22);
   GUI.EndScrollView();
   Rect close=new Rect(894,810,132,38);Fill(close,new Color(.114f,.078f,.075f));Border(close,new Color(.643f,.576f,.451f,.5f),1);
   GUI.SetNextControlName("patch-notes-close");if(GUI.Button(close,PatchNotesUiLabel("close"),patchNotesClose))ClosePatchNotes();
   if(patchNotesFocusClose&&Event.current.type==EventType.Repaint){GUI.FocusControl("patch-notes-close");patchNotesFocusClose=false;}
   if(GUI.GetNameOfFocusedControl()=="patch-notes-close")Border(close,new Color(.84f,.47f,.28f),2);
  }
  float MeasurePatchNotesBody(float width){return RenderPatchNotesBody(width,false);}
  void DrawPatchNotesBody(float width){RenderPatchNotesBody(width,true);}
  float RenderPatchNotesBody(float width,bool draw)
  {
   var notes=patchNotesCatalog==null?null:patchNotesCatalog.notes;
   if(notes==null||notes.Length==0){if(draw)Label(new Rect(0,24,width,55),PatchNotesUiLabel("empty"),patchNotesEmpty,TextAnchor.MiddleCenter);return 85;}
   float y=2;
   for(int i=0;i<notes.Length;i++){
    var note=notes[i];if(note==null)continue;
    string version="v"+(note.version??"")+" · "+(note.date??"").Replace("-","");
    if(draw)Label(new Rect(2,y,width-4,28),version,patchNotesVersion,TextAnchor.MiddleLeft);y+=32;
    var language=Language=="ko"&&note.ko!=null&&note.ko.sections!=null&&note.ko.sections.Length>0?note.ko:note.en??note.ko;
    if(language==null||language.sections==null)continue;
    foreach(var section in language.sections){
     if(section==null)continue;
     if(draw){Label(new Rect(2,y,width-4,24),section.title??"",patchNotesSection,TextAnchor.MiddleLeft);Fill(new Rect(2,y+24,width-4,1),new Color(.643f,.576f,.451f,.2f));}y+=31;
     if(section.items==null)continue;
     foreach(string item in section.items){
      float height=Mathf.Max(27,patchNotesItem.CalcHeight(new GUIContent(item??""),width-28)+5);
      if(draw){Fill(new Rect(6,y+10,5,5),new Color(.729f,.627f,.463f));Label(new Rect(20,y,width-26,height),item??"",patchNotesItem,TextAnchor.UpperLeft);}y+=height;
     }
     y+=7;
    }
    y+=8;
   }
   return y+6;
  }
 }
}
