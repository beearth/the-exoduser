namespace Exoduser.UnityPort.Core
{
 public enum PausePage { Main, Settings, Quit }
 public enum PauseKey { Up, Down, Previous, Next, Home, End, Left, Right, Accept, Back }
 public enum PauseAction { None, Resume, Restart, ReturnLobby, Quit, FramePrevious, FrameNext, ToggleFullscreen, SfxDown, SfxUp, BgmDown, BgmUp, Defaults, RowLeft, RowRight, RowAccept }
 // Menu focus only. Settings values, game lifetime and platform calls stay with their owners.
 public sealed class PauseNavigation
 {
  public PausePage Page {get;private set;}
  public int Tab {get;private set;}
  public int Cursor {get;private set;}
  public bool Focused {get;private set;}=true;
  // Web ESC: the settings window opens directly (no intermediate pause list) and ESC / Close resumes the game.
  public bool DirectSettings {get;set;}
  public bool WaitingForRelease {get;private set;}
  // A15 web settings: rows per tab (cursor 0-3 = tabs, 4.. = rows in page order, last = Close). null keeps the old fixed layout.
  public int[] SettingsRows {get;set;}
  public int Count {get{return Page==PausePage.Main?4:Page==PausePage.Quit?2:SettingsRows!=null?4+SettingsRows[Tab]+1:Tab==0?7:Tab==1||Tab==2?8:6;}}
  public void Reset(){Page=PausePage.Main;Cursor=0;DirectSettings=false;Fence();}
  public void Open(PausePage page){Page=page;Cursor=page==PausePage.Settings?Tab:0;Fence();}
  public void SelectTab(int tab){if(tab<0||tab>3)return;Tab=tab;Cursor=tab;Fence();}
  public void PointAt(int index){if(Focused&&index>=0&&index<Count)Cursor=index;}
  public void Fence(){WaitingForRelease=true;}
  public void ObserveReleased(bool anyHeld){if(Focused&&!anyHeld)WaitingForRelease=false;}
  public void SetFocus(bool focus){Focused=focus;Fence();if(Page==PausePage.Quit)Cursor=0;}
  public bool BackPage(){if(Page==PausePage.Main)return false;
   if(DirectSettings){if(Page==PausePage.Quit){Page=PausePage.Settings;Cursor=Tab;Fence();return true;}return false;}Cursor=Page==PausePage.Settings?1:3;Page=PausePage.Main;Fence();return true;}
  public PauseAction Handle(PauseKey key,bool dead)
  {
   if(!Focused||WaitingForRelease)return PauseAction.None;
   Fence();
   if(key==PauseKey.Back)return BackPage()?PauseAction.None:dead?PauseAction.None:PauseAction.Resume;
   if(key==PauseKey.Up||key==PauseKey.Previous){Cursor=(Cursor+Count-1)%Count;return PauseAction.None;}
   if(key==PauseKey.Down||key==PauseKey.Next){Cursor=(Cursor+1)%Count;return PauseAction.None;}
   if(key==PauseKey.Home){if(Page==PausePage.Settings&&Cursor<4)SelectTab(0);else Cursor=0;return PauseAction.None;}
   if(key==PauseKey.End){if(Page==PausePage.Settings&&Cursor<4)SelectTab(3);else Cursor=Count-1;return PauseAction.None;}
   bool left=key==PauseKey.Left,right=key==PauseKey.Right;
   if(Page==PausePage.Quit){if(left||right){Cursor=1-Cursor;return PauseAction.None;}if(key==PauseKey.Accept){if(Cursor==0){BackPage();return PauseAction.None;}return PauseAction.Quit;}return PauseAction.None;}
   if(Page==PausePage.Main){if(key!=PauseKey.Accept)return PauseAction.None;switch(Cursor){case 0:return dead?PauseAction.Restart:PauseAction.Resume;case 1:Open(PausePage.Settings);break;case 2:return PauseAction.ReturnLobby;case 3:Open(PausePage.Quit);break;}return PauseAction.None;}
   if(Cursor<4){if(left||right)SelectTab((Cursor+(left?3:1))%4);else if(key==PauseKey.Accept)SelectTab(Cursor);return PauseAction.None;}
   if(Cursor==Count-1&&key==PauseKey.Accept)return BackPage()?PauseAction.None:dead?PauseAction.None:PauseAction.Resume;
   if(SettingsRows!=null){if(left)return PauseAction.RowLeft;if(right)return PauseAction.RowRight;if(key==PauseKey.Accept)return PauseAction.RowAccept;return PauseAction.None;}
   if(Cursor==Count-2&&key==PauseKey.Accept)return PauseAction.Defaults;
   if(Tab==0&&Cursor==4&&key==PauseKey.Accept)return PauseAction.ToggleFullscreen;
   if(Tab==1){if(Cursor==4){if(left)return PauseAction.FramePrevious;if(right)return PauseAction.FrameNext;}if(Cursor==5&&key==PauseKey.Accept)return PauseAction.ToggleFullscreen;}
   if(Tab==2){if(Cursor==4){if(left)return PauseAction.SfxDown;if(right)return PauseAction.SfxUp;}if(Cursor==5){if(left)return PauseAction.BgmDown;if(right)return PauseAction.BgmUp;}}
   return PauseAction.None;
  }
 }
}
