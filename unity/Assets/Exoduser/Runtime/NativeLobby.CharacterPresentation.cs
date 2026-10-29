using UnityEngine;
namespace Exoduser.UnityPort
{
 public sealed partial class NativeLobby
 {
  NativeCharacterPresentationPlayback characterPresentationPlayback;
  [System.Serializable] sealed class VisualLabelCatalog { public VisualLabelLanguage[] entries; }
  [System.Serializable] sealed class VisualLabelLanguage { public string code; public VisualLabelItem[] labels; }
  [System.Serializable] sealed class VisualLabelItem { public string key,text; }
  VisualLabelCatalog visualLabelCatalog;bool visualLabelCatalogLoaded;string visualLabelLanguage="";
  readonly System.Collections.Generic.Dictionary<string,string> visualLabelMap=new System.Collections.Generic.Dictionary<string,string>();
  string VisualSelectionLabel(string key,string fallback)
  {
   if(Language=="ko")return key;
   if(!visualLabelCatalogLoaded){
    visualLabelCatalogLoaded=true;var source=Resources.Load<TextAsset>("Data/visual_select_labels");
    if(source!=null)try{visualLabelCatalog=JsonUtility.FromJson<VisualLabelCatalog>(source.text);}catch(System.Exception e){Debug.LogWarning("Visual selection labels: "+e.Message);}
   }
   if(visualLabelLanguage!=Language){
    visualLabelLanguage=Language;visualLabelMap.Clear();VisualLabelLanguage selected=null,english=null;
    var entries=visualLabelCatalog==null?null:visualLabelCatalog.entries;
    if(entries!=null)foreach(var entry in entries){if(entry==null)continue;if(entry.code=="en")english=entry;if(entry.code==Language)selected=entry;}
    var row=selected??english;if(row!=null&&row.labels!=null)foreach(var item in row.labels)if(item!=null&&!string.IsNullOrEmpty(item.key)&&!string.IsNullOrEmpty(item.text))visualLabelMap[item.key]=item.text;
   }
   return visualLabelMap.TryGetValue(key,out var value)?value:fallback;
  }
  Texture2D[] presentationCutouts,presentationBusts;
  Texture2D presentationRingAtlas,presentationRingChains,presentationTraitGlyphs,presentationSigil;
  Texture2D presentationChains,presentationSceneWarrior,presentationSceneSilvertail,presentationWarriorPoster,presentationSilvertailPoster,presentationIron,presentationButton;
  int presentationVideoVisual=-1;
  float presentationVideoStartedAt;
  Vector2 presentationTraitScroll;
  int presentationTraitScrollVisual=-1;
  string presentationTraitScrollLanguage="";
  GUIStyle presentationHeading,presentationKoHeading,presentationSubtitle,presentationJob,presentationKoJob,presentationName,presentationDescription,presentationTraitTitle,presentationTraitBody,presentationRail,presentationRailFooter,presentationReleaseLabel,presentationAction,presentationCreateAction,presentationInput,presentationNameTitle,presentationKoNameTitle,presentationNameDescription,presentationNameLabel,presentationNameError,presentationNameButton;
  GUIStyle presentationTraitTitleMeasure,presentationTraitBodyMeasure,presentationRailMeasure;
  readonly string[] presentationJobs={"전사","블레이드 댄서","창포수","사신","공허 창술사"};
  readonly string[] presentationNames={"엑소듀서 전사","실버테일","헬거너","변성술사","창법사"};
  readonly string[] presentationDescriptions={"거대검을 휘두르는 흑철의 전사","회전하는 단 하나의 검, 그녀의 춤은 파멸","자신의 피를 탄환 삼는 혈월의 창포수","베어낸 영혼을 먹고 자라는 청염의 낫","룬으로 공간을 봉인하는 공허의 전령"};
  readonly string[,] presentationTraits={
   {"⚔|근접 화신|거대검을 휘두르는 정면 돌파형 전투가입니다.","🛡|흑철의 방어|검은 갑옷으로 적의 공세를 견디고 되받아칩니다.","💥|파멸의 일격|느리지만 치명적인 광역 참격을 내리꽂습니다."},
   {"🌀|검무의 화신|회전대검으로 사방의 적을 동시에 베어냅니다.","🗡|멈추지 않는 기동|쉬지 않고 움직이며 쌓은 기세를 일격에 터뜨립니다.","✨|무희의 춤|화려한 회피와 폭발적인 딜을 오가는 곡예입니다."},
   {"🩸|혈탄 장전|체력을 소모해 충전한 관통탄을 발사합니다.","🎯|관통 창격|창포로 일직선상의 적을 모두 꿰뚫습니다.","💨|역추진 도약|사격 반동을 이용해 뒤로 도약합니다."},
   {"🌙|반월참|낫을 크게 휘둘러 전방 반원을 베어냅니다.","👻|영혼 수확|처치한 적의 영혼을 거둬 낫을 강화합니다.","🌀|망령 걸음|청염으로 흩어졌다 원하는 곳에 다시 나타납니다."},
   {"🔮|공허 투창|공허창을 던져 관통시킨 뒤 다시 회수합니다.","✴|룬 각인|지면에 봉인 룬을 새겨 적을 묶습니다.","🌌|균열 이동|공간을 찢고 룬이 있는 곳으로 이동합니다."}
  };
  void InitializeCharacterPresentation()
  {
   presentationCutouts=new Texture2D[5];presentationBusts=new Texture2D[5];
   presentationRingAtlas=Resources.Load<Texture2D>("Art/CharacterSelect/generated/presentation_ring_atlas");
   presentationRingChains=Resources.Load<Texture2D>("Art/CharacterSelect/generated/presentation_ring_chains");
   presentationTraitGlyphs=Resources.Load<Texture2D>("Art/CharacterSelect/generated/trait_glyphs");
   presentationSigil=Resources.Load<Texture2D>("Art/CharacterSelect/generated/blackiron_sigil");
   string[] cuts={"warrior_cut","silvertail_cut","hellgunner_color_cut_20261021","transmuter_color_cut_20261021","spearmage_color_cut_20261021"};
   string[] busts={"portrait_warrior","portrait_silvertail","portrait_hellgunner_color_20261021","portrait_transmuter_color_20261021","portrait_spearmage_color_20261021"};
   for(int i=0;i<5;i++){presentationCutouts[i]=Resources.Load<Texture2D>("Art/CharacterSelect/"+cuts[i]);presentationBusts[i]=Resources.Load<Texture2D>("Art/CharacterSelect/"+busts[i]);}
   presentationChains=Resources.Load<Texture2D>("Art/CharacterSelect/coming_soon_chains_v2");
   presentationSceneWarrior=Resources.Load<Texture2D>("Art/CharacterSelect/bg_scene1");presentationSceneSilvertail=Resources.Load<Texture2D>("Art/CharacterSelect/bg_scene2");
   presentationWarriorPoster=Resources.Load<Texture2D>("Art/CharacterSelect/poster_idle_warrior_cs3_4k");presentationSilvertailPoster=Resources.Load<Texture2D>("Art/CharacterSelect/poster_idle_silvertail_4k");
   presentationIron=Resources.Load<Texture2D>("Art/CharacterSelect/UI/iron");presentationButton=Resources.Load<Texture2D>("Art/CharacterSelect/UI/button_iron");
   var cinzel=Resources.Load<Font>("Art/fonts/CinzelDecorative-Bold");var nanum=Resources.Load<Font>("Art/fonts/NanumMyeongjo-Regular");
   presentationHeading=new GUIStyle(characterTitle){font=cinzel,fontSize=38,alignment=TextAnchor.MiddleCenter};presentationHeading.normal.textColor=new Color(.91f,.78f,.48f);
   presentationKoHeading=new GUIStyle(presentationHeading){font=nanum};
   presentationSubtitle=new GUIStyle(characterSmall){fontSize=16,alignment=TextAnchor.MiddleCenter};presentationSubtitle.normal.textColor=new Color(.60f,.52f,.41f);
   presentationJob=new GUIStyle(characterSmall){font=cinzel,fontSize=14};presentationJob.normal.textColor=new Color(.78f,.60f,.29f);presentationKoJob=new GUIStyle(presentationJob){font=nanum};
   presentationName=new GUIStyle(characterTitle){font=nanum,fontSize=34};presentationName.normal.textColor=new Color(.95f,.90f,.80f);
   presentationDescription=new GUIStyle(characterText){fontSize=15};presentationDescription.normal.textColor=new Color(.72f,.64f,.53f);
   presentationTraitTitle=new GUIStyle(characterSmall){fontSize=15,fontStyle=FontStyle.Bold};presentationTraitTitle.normal.textColor=new Color(.89f,.81f,.65f);
   presentationTraitBody=new GUIStyle(characterSmall){fontSize=13};presentationTraitBody.normal.textColor=new Color(.56f,.50f,.41f);
   presentationRail=new GUIStyle(characterSmall){fontSize=13,alignment=TextAnchor.MiddleCenter,fontStyle=FontStyle.Bold};presentationRail.normal.textColor=new Color(.52f,.45f,.35f);presentationRailFooter=new GUIStyle(presentationRail){fontSize=11,fontStyle=FontStyle.Normal,wordWrap=false};presentationReleaseLabel=new GUIStyle(characterSmall){fontSize=14,alignment=TextAnchor.MiddleCenter};presentationReleaseLabel.normal.textColor=new Color(.68f,.59f,.46f);
   presentationTraitTitleMeasure=new GUIStyle(presentationTraitTitle){wordWrap=false,clipping=TextClipping.Overflow};presentationTraitBodyMeasure=new GUIStyle(presentationTraitBody){wordWrap=false,clipping=TextClipping.Overflow};presentationRailMeasure=new GUIStyle(presentationRail){wordWrap=false,clipping=TextClipping.Overflow};
   presentationAction=new GUIStyle(characterButton){fontSize=15,padding=new RectOffset(12,12,12,12)};presentationAction.normal.background=presentationButton;presentationAction.hover.background=presentationButton;presentationAction.active.background=presentationButton;
   presentationCreateAction=new GUIStyle(presentationAction){fontSize=17};
   presentationInput=new GUIStyle(characterField){fontSize=16,alignment=TextAnchor.MiddleLeft,padding=new RectOffset(18,18,14,14)};
   presentationNameTitle=new GUIStyle(characterTitle){font=cinzel,fontSize=24,alignment=TextAnchor.MiddleCenter};presentationNameTitle.normal.textColor=new Color(.80f,.67f,.47f);presentationKoNameTitle=new GUIStyle(presentationNameTitle){font=nanum};
   presentationNameDescription=new GUIStyle(characterSmall){fontSize=13,alignment=TextAnchor.MiddleCenter};presentationNameDescription.normal.textColor=new Color(.53f,.46f,.33f);
   presentationNameLabel=new GUIStyle(characterSmall){fontSize=14,alignment=TextAnchor.MiddleLeft};presentationNameLabel.normal.textColor=new Color(.74f,.63f,.51f);
   presentationNameError=new GUIStyle(characterSmall){fontSize=12,alignment=TextAnchor.MiddleLeft};presentationNameError.normal.textColor=new Color(.80f,.27f,.23f);
   presentationNameButton=new GUIStyle(presentationAction){fontSize=14};
   characterPresentationPlayback=GetComponent<NativeCharacterPresentationPlayback>();if(characterPresentationPlayback==null)characterPresentationPlayback=gameObject.AddComponent<NativeCharacterPresentationPlayback>();
   if(characterPresentationPlayback.Video==null)characterPresentationPlayback.Video=new NativeLobbyVideo(transform);
  }
  void CloseCharacterPresentationVideo(){if(characterPresentationPlayback!=null&&characterPresentationPlayback.Video!=null)characterPresentationPlayback.Video.Close();presentationVideoVisual=-1;}
  void DrawCharacterVisualPresentation()
  {
   if(Screen.width>=1100){DrawSilverCharacterVisual();return;}
   CharacterStyles();float w=Screen.width,h=Screen.height;int i=Mathf.Clamp(characterVisual,0,4);bool locked=i!=0;
   float px=Mathf.Min(w*.04f,64),side=Mathf.Min(w*.26f,340),gap=Mathf.Min(w*.02f,28);
   float bodyY=Mathf.LerpUnclamped(128.467f,143.992f,(h-720f)/360f),actionY=h-Mathf.Min(h*.03f,30)-46.5f;
   float railHeight=122.5f+(h-720f)*.004167f,railY=actionY-18-railHeight,bodyHeight=Mathf.LerpUnclamped(384.211f,717.508f,(h-720f)/360f);
   float rightX=w-px-side,stageX=px+side+gap,stageWidth=Mathf.Max(0,rightX-gap-stageX);
   Fill(new Rect(0,0,w,h),new Color(.025f,.015f,.022f,1));
   Texture2D scene=i==1?presentationSceneSilvertail:presentationSceneWarrior;if(scene!=null){Color old=GUI.color;GUI.color=new Color(.74f,.74f,.74f,1);GUI.DrawTexture(new Rect(-20,-20,w+40,h+40),scene,ScaleMode.ScaleAndCrop,true);GUI.color=old;}
   if(i<2&&characterPresentationPlayback!=null&&characterPresentationPlayback.Video!=null){
    string video=i==0?"cs_idle_warrior_cs3_4k.mp4":"cs_idle_silvertail_4k.mp4";var playback=characterPresentationPlayback.Video;
    if(presentationVideoVisual!=i){playback.Open(video,true,true,false);presentationVideoVisual=i;presentationVideoStartedAt=Time.unscaledTime;}
    if(i==0&&playback.Player!=null&&playback.Prepared)playback.Player.playbackSpeed=.75f;
    bool videoFailed=playback.Error.Length>0||(!playback.Prepared||playback.Frame<0)&&Time.unscaledTime-presentationVideoStartedAt>=5;
    Texture movie=playback.Error.Length==0&&playback.Prepared&&playback.Frame>=0?playback.Texture:videoFailed?null:(i==0?presentationWarriorPoster:presentationSilvertailPoster);
    if(movie!=null){Color old=GUI.color;GUI.color=new Color(1,1,1,locked ? .58f : .82f);GUI.DrawTexture(new Rect(0,0,w,h),movie,ScaleMode.ScaleAndCrop,true);GUI.color=old;}
    if(videoFailed&&presentationCutouts[i]!=null){Color old=GUI.color;GUI.color=locked?new Color(.45f,.45f,.45f,1):Color.white;GUI.DrawTexture(new Rect(stageX,bodyY,stageWidth,bodyHeight),presentationCutouts[i],ScaleMode.ScaleToFit,true);GUI.color=old;}
   }else if(characterPresentationPlayback!=null&&characterPresentationPlayback.Video!=null&&presentationVideoVisual>=0){characterPresentationPlayback.Video.Close();presentationVideoVisual=-1;}
   if(i>=2&&presentationCutouts[i]!=null)GUI.DrawTexture(new Rect(stageX,bodyY,stageWidth,bodyHeight),presentationCutouts[i],ScaleMode.ScaleToFit,true);
   Fill(new Rect(0,0,w,h),new Color(.025f,.016f,.021f,.22f));Fill(new Rect(0,0,w,Mathf.Min(h*.16f,174)),new Color(0,0,0,.24f));Fill(new Rect(0,railY,w,h-railY),new Color(0,0,0,.62f));
   DrawCharacterVisualVignette(w,h);
   float frameX=Mathf.Min(w*.014f,20),frameY=Mathf.Min(h*.016f,16);Border(new Rect(frameX,frameY,w-frameX*2,h-frameY*2),new Color(.48f,.34f,.20f,.65f),1);Corner(new Vector2(frameX,frameY),1,1);Corner(new Vector2(w-frameX,h-frameY),-1,-1);
   Label(new Rect(0,Mathf.Min(h*.045f,42),w,50),VisualSelectionLabel("캐릭터 선택","CHOOSE YOUR CHARACTER"),Language=="ko"?presentationKoHeading:presentationHeading,TextAnchor.MiddleCenter);
   Label(new Rect(0,Mathf.Min(h*.045f,42)+51,w,26),VisualSelectionLabel("지옥에 강림할 화신을 선택하라","Choose your vessel to descend into hell"),presentationSubtitle,TextAnchor.MiddleCenter);
   float rightY=Mathf.LerpUnclamped(127.195f,143.992f,(h-720f)/360f);Rect left=new Rect(px,bodyY,side,bodyHeight),right=new Rect(rightX,rightY,side,bodyHeight);
   float inset=8,inner=side-inset*2,viewT=(h-720f)/360f;
   Label(new Rect(px+inset,Mathf.LerpUnclamped(150.545f,326.016f,viewT),inner,18.5f),VisualSelectionLabel(presentationJobs[i],new[]{"WARRIOR","BLADE DANCER","HELLGUNNER","TRANSMUTER","SPEARMAGE"}[i]),Language=="ko"?presentationKoJob:presentationJob,TextAnchor.MiddleLeft);
   Label(new Rect(px+inset,Mathf.LerpUnclamped(183.045f,358.516f,viewT),inner,Mathf.LerpUnclamped(52.273f,52.64f,viewT)),VisualSelectionLabel(presentationNames[i],new[]{"Exoduser Warrior","Silvertail","Hellgunner","Transmuter","Spearmage"}[i]),presentationName,TextAnchor.UpperLeft);
   Fill(new Rect(px+inset,Mathf.LerpUnclamped(233.317f,409.156f,viewT),56,2),new Color(.78f,.57f,.25f,.8f));
   Label(new Rect(px+inset,Mathf.LerpUnclamped(255.318f,431.156f,viewT),inner,Mathf.LerpUnclamped(23.547f,24.32f,viewT)),VisualSelectionLabel(presentationDescriptions[i],new[]{"A black-iron warrior wielding a greatsword.","One spinning sword; her dance is annihilation.","A blood-moon marksman who uses her own blood as ammunition.","A hunter who transmutes core flame into bow, scythe, spear and sword.","A herald of the void who seals space with runes."}[i]),presentationDescription,TextAnchor.UpperLeft);
   Texture2D bust=presentationBusts[i];if(bust!=null){float thumbW=Mathf.Min(w*.11f,150),thumbY=Mathf.LerpUnclamped(302.865f,479.477f,viewT);Rect thumb=new Rect(px+inset,thumbY,thumbW,thumbW*4/3);Fill(thumb,new Color(.08f,.065f,.055f));DrawTextureTopAlignedCrop(thumb,bust);Border(thumb,new Color(.56f,.39f,.20f,.8f),1);}
   DrawTraitFrame(right,i,railY);
   GUI.SetNextControlName("visual-info-left");if(GUI.Button(left,"",GUIStyle.none))GUI.FocusControl("visual-info-left");
   GUI.SetNextControlName("visual-info-right");if(GUI.Button(right,"",GUIStyle.none))GUI.FocusControl("visual-info-right");
   if(GUI.GetNameOfFocusedControl()=="visual-info-left")Border(left,new Color(.92f,.78f,.53f),2);
   if(GUI.GetNameOfFocusedControl()=="visual-info-right")Border(right,new Color(.92f,.78f,.53f),2);
   DrawCharacterRail(w,px,railY);
   float actionX=(w-760)/2,cancelWidth=98.563f;Rect cancel=new Rect(actionX,actionY+1.25f,cancelWidth,44),create=new Rect(w*.5f+247.063f,actionY,132.938f,46.5f);
   bool priorEnabled=GUI.enabled;GUI.enabled=priorEnabled;GUI.SetNextControlName("visual-cancel");if(GUI.Button(cancel,CharacterDialogLabel("cancel",K("취소","CANCEL")),presentationAction))CloseCharacterCreation();
   GUI.enabled=priorEnabled&&!locked;GUI.SetNextControlName("visual-create");if(GUI.Button(create,locked?CharacterDialogLabel("comingSoon",K("출시 준비 중","COMING SOON")):CharacterDialogLabel("create",K("생성","CREATE")),presentationCreateAction))ConfirmCharacterVisual();GUI.enabled=priorEnabled;
   if(GUI.GetNameOfFocusedControl()=="visual-cancel")Border(cancel,new Color(.92f,.78f,.53f),2);
   if(!locked&&GUI.GetNameOfFocusedControl()=="visual-create")Border(create,new Color(.92f,.78f,.53f),2);
   if(characterVisualFocusPending&&Event.current.type==EventType.Repaint){GUI.FocusControl("visual-icon-"+i);characterVisualFocusPending=false;}
   if(i==1){if(presentationChains!=null){Color old=GUI.color;GUI.color=new Color(1,1,1,.58f);GUI.DrawTexture(new Rect(stageX,bodyY+bodyHeight*.18f,stageWidth,bodyHeight*.72f),presentationChains,ScaleMode.ScaleToFit,true);GUI.color=old;}Label(new Rect(stageX,railY-31,stageWidth,26),VisualSelectionLabel("출시 준비 중","COMING SOON"),presentationSubtitle,TextAnchor.MiddleCenter);}
   else if(i>=2){float releaseBottom=bodyY+bodyHeight-4,chainSize=Mathf.Min(72,bodyHeight*.20f);Rect chainRect=new Rect((w-chainSize)*.5f,releaseBottom-28-8-chainSize,chainSize,chainSize);if(presentationChains!=null){Color old=GUI.color;GUI.color=new Color(1,1,1,.78f);GUI.DrawTexture(chainRect,presentationChains,ScaleMode.ScaleToFit,true);GUI.color=old;}Label(new Rect(w*.5f-150,releaseBottom-28,300,28),VisualSelectionLabel("출시 준비 중","COMING SOON"),presentationReleaseLabel,TextAnchor.MiddleCenter);}
  }
  void DrawCharacterNamePresentation()
  {
   float w=Screen.width,h=Screen.height;Fill(new Rect(0,0,w,h),new Color(0,0,0,.90f));Rect panel=new Rect((w-440)/2,(h-333.5f)/2,440,333.5f);
   Fill(panel,new Color(.055f,.047f,.045f,.98f));if(presentationIron!=null){Color old=GUI.color;GUI.color=new Color(.19f,.19f,.19f,.55f);GUI.DrawTexture(panel,presentationIron,ScaleMode.StretchToFill,true);GUI.color=old;}
   Border(panel,new Color(.43f,.33f,.23f,.78f),1);
   float x=panel.x+41,y=panel.y;
   Label(new Rect(x,y+49,358,32.5f),CharacterDialogLabel("title",K("새 캐릭터 생성","Create Character")),Language=="ko"?presentationKoNameTitle:presentationNameTitle,TextAnchor.MiddleCenter);
   Label(new Rect(x,y+89.5f,358,18.5f),CharacterDialogLabel("description",K("지옥에 보낼 캐릭터의 이름을 지어주세요","Choose a name for the character you will send to hell.")),presentationNameDescription,TextAnchor.MiddleCenter);
   Label(new Rect(x,y+136,358,21),CharacterDialogLabel("nameLabel",K("캐릭터 이름 (2~8자)","Character name (2–8 characters)")),presentationNameLabel,TextAnchor.MiddleLeft);
   GUI.SetNextControlName("character-name");characterName=GUI.TextField(new Rect(x,y+165,358,53),characterName,8,presentationInput);
   if(characterFocus&&Event.current.type==EventType.Repaint){GUI.FocusControl("character-name");characterFocus=false;}
   if(!string.IsNullOrEmpty(characterError))Label(new Rect(x,y+218,358,18),characterError,presentationNameError,TextAnchor.MiddleLeft);
   GUI.SetNextControlName("character-cancel");if(GUI.Button(new Rect(x,y+238,173,46.5f),CharacterDialogLabel("cancel",K("취소","CANCEL")),presentationNameButton))CloseCharacterCreation();
   GUI.SetNextControlName("character-create");if(GUI.Button(new Rect(x+185,y+238,173,46.5f),CharacterDialogLabel("create",K("생성","CREATE")),presentationNameButton))CreateCharacter(characterName);
  }
  void DrawCharacterVisualVignette(float w,float h){
   Fill(new Rect(0,0,w,Mathf.Min(h*.11f,112)),new Color(0,0,0,.34f));Fill(new Rect(0,h-Mathf.Min(h*.132f,142),w,Mathf.Min(h*.132f,142)),new Color(0,0,0,.55f));
   for(int n=0;n<26;n++){float x=(n*3.9f+((n*n)%7))*w/100f;float duration=6+((n*7)%9),phase=Mathf.Repeat(Time.unscaledTime+((n*11)%14),duration),p=phase/duration;float dx=((n%2)==0?-1:1)*(6+(n%5)*5);float y=h+12-p*(h*.92f),px=x+dx*p,s=(2+n%3)*(.6f+.5f*p);float alpha=p<.12f?p/.12f*.9f:p<.8f?.9f-(p-.12f)*.2f:.9f*(1-p)/.2f;Fill(new Rect(px,y,s,s),new Color(1,.59f,.30f,Mathf.Clamp01(alpha)*.5f));}
  }
  static float PresentationWrappedHeight(GUIStyle style,GUIStyle measure,string value,float width,float minimum)
  {
   float usable=Mathf.Max(1,width-8),space=measure.CalcSize(new GUIContent(" ")).x,lineHeight=Mathf.Max(style.lineHeight,style.fontSize+4);
   int lines=0;
   foreach(string paragraph in value.Split('\n')){
    lines++;float used=0;
    foreach(string word in paragraph.Split(' ')){
     float wordWidth=measure.CalcSize(new GUIContent(word)).x;
     if(wordWidth<=usable){float next=used==0?wordWidth:used+space+wordWidth;if(next>usable&&used>0){lines++;used=wordWidth;}else used=next;continue;}
     if(used>0){lines++;used=0;}
     foreach(char letter in word){float letterWidth=measure.CalcSize(new GUIContent(letter.ToString())).x;if(used+letterWidth>usable&&used>0){lines++;used=0;}used+=letterWidth;}
    }
   }
   return Mathf.Max(minimum,Mathf.Ceil(Mathf.Max(style.CalcHeight(new GUIContent(value),width),lines*lineHeight+3)));
  }
  void DrawTraitFrame(Rect r,int visual,float railY)
  {
   float viewT=(Screen.height-720f)/360f,baseHeight=Mathf.LerpUnclamped(312.75f,325.594f,viewT),yOffset=Mathf.LerpUnclamped(36.998f,195.953f,viewT);
   float boxY=r.y+yOffset,boxWidth=r.width-16,firstRow=67.5f,baseRow=Mathf.LerpUnclamped(74.75f,79.031f,viewT);
   float textWidth=boxWidth-109;string[] titles=new string[3],bodies=new string[3];float[] titleHeights=new float[3],bodyHeights=new float[3],rowHeights=new float[3];float contentHeight=0;
   for(int i=0;i<3;i++){string[] bits=presentationTraits[visual,i].Split('|');titles[i]=VisualSelectionLabel(bits[1],TraitEnglish(visual,i));bodies[i]=VisualSelectionLabel(bits[2],TraitEnglishBody(visual,i));titleHeights[i]=PresentationWrappedHeight(presentationTraitTitle,presentationTraitTitleMeasure,titles[i],textWidth,21);bodyHeights[i]=PresentationWrappedHeight(presentationTraitBody,presentationTraitBodyMeasure,bodies[i],textWidth,34);rowHeights[i]=Mathf.Max(baseRow,titleHeights[i]+2+bodyHeights[i]+7);contentHeight+=rowHeights[i];}
   float height=Mathf.Min(Mathf.Max(baseHeight,firstRow+contentHeight+8),Mathf.Max(110,railY-boxY-8));Rect box=new Rect(r.x+8,boxY,boxWidth,height);
   Fill(box,new Color(.08f,.058f,.043f,.88f));if(presentationSigil!=null){Color old=GUI.color;GUI.color=new Color(.68f,.56f,.39f,.16f);GUI.DrawTexture(box,presentationSigil,ScaleMode.ScaleAndCrop,true);GUI.color=old;}Border(box,new Color(.43f,.32f,.20f,.58f),1);DrawFrameCorners(box,20,2,new Color(.72f,.53f,.32f,.88f));
   Label(new Rect(box.x+22,box.y+26,box.width-44,34.5f),VisualSelectionLabel("플레이 방식","PLAYSTYLE"),presentationTraitTitle,TextAnchor.MiddleCenter);Fill(new Rect(box.x+22,box.y+60,box.width-44,1),new Color(.48f,.34f,.20f,.55f));
   DrawCircleFill(new Vector2(box.center.x,box.y-14),14,new Color(.12f,.085f,.058f,.98f));DrawCircleOutline(new Vector2(box.center.x,box.y-14),14,1,new Color(.61f,.43f,.24f,.9f));DrawGlyph(new Rect(box.center.x-14,box.y-28,28,28),15,new Color(.82f,.67f,.43f,1));
   if(presentationTraitScrollVisual!=visual||presentationTraitScrollLanguage!=Language){presentationTraitScroll=Vector2.zero;presentationTraitScrollVisual=visual;presentationTraitScrollLanguage=Language;}
   Rect viewport=new Rect(box.x+22,box.y+firstRow,box.width-44,Mathf.Max(1,height-firstRow-8));presentationTraitScroll=GUI.BeginScrollView(viewport,presentationTraitScroll,new Rect(0,0,viewport.width-18,Mathf.Max(viewport.height,contentHeight)),false,false);
   float rowY=0;for(int i=0;i<3;i++){Rect icon=new Rect(0,rowY,34,34);Fill(icon,new Color(.10f,.075f,.05f,.85f));DrawTraitFrameCorners(icon,6,1,new Color(.48f,.36f,.22f,.66f));DrawGlyph(icon,visual*3+i,new Color(.79f,.66f,.46f,1));Label(new Rect(47,rowY,textWidth,titleHeights[i]),titles[i],presentationTraitTitle,TextAnchor.MiddleLeft);Label(new Rect(47,rowY+titleHeights[i]+2,textWidth,bodyHeights[i]),bodies[i],presentationTraitBody,TextAnchor.UpperLeft);rowY+=rowHeights[i];}GUI.EndScrollView();
  }
  void DrawCharacterRail(float w,float px,float y)
  {
   float size=Mathf.Min(70,Mathf.Max(44,w*.056f)),gap=Mathf.Min(w*.026f,36),total=5*size+4*gap,start=(w-total)/2;float labelY=y+size+9;string[] labels={"전사","실버테일","헬거너","변성술사","창법사"};
   for(int i=0;i<5;i++){Rect ring=new Rect(start+i*(size+gap),y,size,size);DrawCircleFill(new Vector2(ring.center.x,ring.center.y),size*.5f,new Color(.12f,.10f,.09f,.95f));DrawCircleOutline(new Vector2(ring.center.x,ring.center.y),size*.5f+2,2,new Color(.04f,.03f,.025f));DrawCircleOutline(new Vector2(ring.center.x,ring.center.y),size*.5f+4,2,i==characterVisual?new Color(.48f,.17f,.14f):new Color(.24f,.18f,.13f));DrawCircleOutline(new Vector2(ring.center.x,ring.center.y),size*.5f+5,1,new Color(.17f,.08f,.07f));if(presentationRingAtlas!=null){int cell=i==0?0:i+5;Rect uv=new Rect((cell%5)/5f,1f-((cell/5)+1)/2f,.2f,.5f);GUI.DrawTextureWithTexCoords(ring,presentationRingAtlas,uv,true);}if(i>0&&presentationRingChains!=null){Color old=GUI.color;GUI.color=new Color(1,1,1,.68f);GUI.DrawTexture(ring,presentationRingChains,ScaleMode.ScaleToFit,true);GUI.color=old;}float labelWidth=ring.width+28;string classLabel=VisualSelectionLabel(labels[i],new[]{"Warrior","Silvertail","Hellgunner","Transmuter","Spearmage"}[i]);float classHeight=PresentationWrappedHeight(presentationRail,presentationRailMeasure,classLabel,labelWidth,18);Label(new Rect(ring.x-14,labelY,labelWidth,classHeight),classLabel,presentationRail,TextAnchor.UpperCenter);if(i>0)Label(new Rect(ring.x-14,labelY+classHeight+2,labelWidth,18),VisualSelectionLabel("출시 준비 중","Coming soon"),presentationRailFooter,TextAnchor.MiddleCenter);Rect button=new Rect(ring.x-14,ring.y-4,ring.width+28,size+45);GUI.SetNextControlName("visual-icon-"+i);if(GUI.Button(button,"",GUIStyle.none)){ChooseCharacterVisual(i);GUI.FocusControl("visual-icon-"+i);}if(GUI.GetNameOfFocusedControl()=="visual-icon-"+i)Border(button,new Color(.92f,.78f,.53f),2);}
  }
  void DrawGlyph(Rect rect,int index,Color color){if(presentationTraitGlyphs==null)return;int col=index%5,row=index/5;Rect uv=new Rect(col/5f,1f-(row+1)/4f,.2f,.25f);Color old=GUI.color;GUI.color=color;GUI.DrawTextureWithTexCoords(rect,presentationTraitGlyphs,uv,true);GUI.color=old;}
  void DrawFrameCorners(Rect r,float length,float thickness,Color color){float x=r.x,y=r.y,w=r.width,h=r.height;Fill(new Rect(x,y,length,thickness),color);Fill(new Rect(x,y,thickness,length),color);Fill(new Rect(x+w-length,y,length,thickness),color);Fill(new Rect(x+w-thickness,y,thickness,length),color);Fill(new Rect(x,y+h-thickness,length,thickness),color);Fill(new Rect(x,y+h-length,thickness,length),color);Fill(new Rect(x+w-length,y+h-thickness,length,thickness),color);Fill(new Rect(x+w-thickness,y+h-length,thickness,length),color);}
  void DrawTraitFrameCorners(Rect r,float length,float thickness,Color color)=>DrawFrameCorners(r,length,thickness,color);
  void DrawCircleFill(Vector2 center,float radius,Color color){for(int y=-28;y<=28;y++){float dy=y*radius/28,width=2*Mathf.Sqrt(Mathf.Max(0,radius*radius-dy*dy));Fill(new Rect(center.x-width*.5f,center.y+dy,width,1.25f),color);}}
  void DrawCircleOutline(Vector2 center,float radius,float thickness,Color color){int segments=Mathf.Max(24,Mathf.CeilToInt(Mathf.PI*2*radius/3f));float step=Mathf.PI*2/segments;for(int i=0;i<segments;i++){float a=(i+.5f)*step,halfChord=radius*Mathf.Sin(step*.5f),length=halfChord*2+thickness*.8f;Vector2 midpoint=center+new Vector2(Mathf.Cos(a),Mathf.Sin(a))*radius;var matrix=GUI.matrix;GUIUtility.RotateAroundPivot((a+Mathf.PI*.5f)*Mathf.Rad2Deg,midpoint);Fill(new Rect(midpoint.x-length*.5f,midpoint.y-thickness*.5f,length,thickness),color);GUI.matrix=matrix;}}
  void DrawTextureTopAlignedCrop(Rect rect,Texture2D texture){float source=(float)texture.width/texture.height,target=rect.width/rect.height;Rect uv=source>target?new Rect((1-target/source)*.5f,0,target/source,1):new Rect(0,1-source/target,1,source/target);GUI.DrawTextureWithTexCoords(rect,texture,uv,true);}
  void Corner(Vector2 p,int sx,int sy){float len=44;Color c=new Color(.67f,.49f,.30f,.78f);Fill(new Rect(p.x+(sx<0?-len:0),p.y+(sy<0?-1:0),len,2),c);Fill(new Rect(p.x+(sx<0?-1:0),p.y+(sy<0?-len:0),2,len),c);}
  static string TraitEnglish(int v,int t){return new[,]{{"Melee Incarnation","Black-Iron Defense","Ruinous Strike"},{"Blade Dancer","Twin-Dagger Mobility","Dancer's Step"},{"Blood Round","Piercing Shot","Recoil Dash"},{"Crescent Slash","Soul Harvest","Wraith Step"},{"Void Javelin","Rune Seal","Rift Step"}}[v,t];}
  static string TraitEnglishBody(int v,int t){return new[,]{{"A frontline fighter who wields a massive greatsword.","Endure enemy attacks in black armor, then strike back.","Slow, devastating area slashes crush the enemy."},{"Spin a greatblade to cut down enemies on every side.","Close in with swift, agile chains of attacks.","Acrobatic play blends dazzling evasion with explosive damage."},{"Spend health to charge and fire piercing rounds.","Pierce a line of enemies with a revolver rifle.","Use recoil to leap backward from danger."},{"Sweep a scythe in a wide forward arc.","Harvest defeated souls to strengthen blue-flame weapons.","Scatter into blue flame and reappear where desired."},{"Throw and recall a void spear through enemies.","Inscribe sealing runes on the ground to bind foes.","Tear space and travel to a rune's location."}}[v,t];}
 }
}
