using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeLobby
    {
        GUIStyle silverName,silverBody,silverMicro;
        Texture2D silverLobbyPoster,lobbySlotPortrait;
        sealed class SilverSlotSummary{internal int level=1,stage;internal bool unreadable;}
        readonly System.Collections.Generic.Dictionary<string,SilverSlotSummary> silverSlotSummaries=new System.Collections.Generic.Dictionary<string,SilverSlotSummary>();
        string SilverSlotCaption(string name)
        {
            if(!silverSlotSummaries.TryGetValue(name,out var summary)){summary=new SilverSlotSummary();silverSlotSummaries[name]=summary;
                if(!string.IsNullOrEmpty(CharacterStoreDirectory)){var store=new CombatSaveStore(System.IO.Path.Combine(System.IO.Path.GetDirectoryName(CharacterStoreDirectory),"combat-save-v1"));if(store.Exists(name)){if(store.TryLoad(name,out var data,out var revision,out var status)){var p=data.Get("player");var g=data.Get("game");summary.level=Mathf.Clamp((int)(p==null?1:p.Num("lv",1)),1,1461);summary.stage=Mathf.Clamp((int)(g==null?0:g.Num("stage",0)),0,34);}else summary.unreadable=true;}}
            }
            if(summary.unreadable)return "—";
            int[] starts={0,4,10,14,21,26,32};string[] names={"썩은 숲","벌레굴","지옥의 겨울","고통의 화염지대","지옥의 군단","사도의 마굴","지옥성"};string[] english={"Rotten Forest","Bug Cave","Hell's Winter","Land of Agony and Flame","Legion of Hell","Apostle's Lair","Hell Castle"};int chapter=0;for(int c=1;c<starts.Length;c++)if(summary.stage>=starts[c])chapter=c;
            return "Lv."+summary.level+" · "+(chapter+1)+VisualSelectionLabel("장"," Chapter")+" "+VisualSelectionLabel(names[chapter],english[chapter])+" "+(summary.stage-starts[chapter]+1)+VisualSelectionLabel("층","F");
        }
        void SilverStyles()
        {
            EnsureSilverArt();
            if(silverName!=null)return;
            var font=NativeSilverHellUi.Font()??lobbyText.font;
            var body=NativeSilverHellUi.Font(true)??font;
            silverName=new GUIStyle(lobbyText)
            {
                font=font,fontSize=22,fontStyle=FontStyle.Normal
            };
            silverName.normal.textColor=NativeSilverHellUi.Text;
            silverBody=new GUIStyle(silverName)
            {
                font=body,fontSize=13
            };
            silverBody.normal.textColor=NativeSilverHellUi.Dim;
            silverMicro=new GUIStyle(silverBody)
            {
                font=Resources.Load<Font>("Art/fonts/Cinzel-600")??silverLatin,fontSize=11
            };
            silverMicro.normal.textColor=NativeSilverHellUi.Dim;
        }
        void DrawSilverLobbyBody(bool enabled)
        {
            SilverStyles();
            var edgeMatrix=GUI.matrix;GUI.matrix=NativeUiViewport.RightMatrix;NativeUiAudit.Region(new Rect(1360,0,560,1080),"component","frontend-right","로비 오른쪽 레일");
            NativeUiAudit.DrawTexture(new Rect(1360,0,560,1080),lobbySilverShade);
            NativeSilverHellUi.FrameOnly(new Rect(1368,8,544,1064));
            var lang=new Rect(1424,188,140,36);
            SilverLabel(lang,LobbyLanguageLabel(Language),silverMicro,TextAnchor.MiddleLeft);
            Fill(new Rect(1424,217,140,1),new Color(.61f,.62f,.62f,.3f));
            GUI.SetNextControlName("lobby-language");if(NativeUiAudit.Button(lang,"",GUIStyle.none))ToggleLanguages();
            SilverLabel(new Rect(1690,188,142,36),"OFFLINE",silverMicro,TextAnchor.MiddleRight);
            Image(new Rect(1473,236,310,148),gateLogo);
            GUI.enabled=enabled&&!showLanguages&&!lobbyQuitPrompt&&!CharacterModalOpen;
            Fill(new Rect(1428,400,400,1),new Color(.61f,.62f,.62f,.4f));
            bool controls=GUI.enabled;
            GUI.enabled=controls&&characterScroll>0;
            if(Characters.Count>2&&NativeUiAudit.Button(new Rect(1752,383,36,28),"▲",silverMicro))characterScroll--;
            GUI.enabled=controls&&characterScroll+2<Characters.Count;
            if(Characters.Count>2&&NativeUiAudit.Button(new Rect(1792,383,36,28),"▼",silverMicro))characterScroll++;
            GUI.enabled=controls;
            for(int n=0;n<2;n++)
            {
                int index=characterScroll+n;
                var card=new Rect(1428,421+n*94,390,84);
                string name=Characters.NameAt(index);
                if(name.Length==0){DrawEmptySilverSlot(card);continue;}
                bool selected=index==Characters.SelectedIndex;
                if(selected){
                    Fill(card,new Color(194/255f,26/255f,16/255f,.1f));
                    Fill(new Rect(card.x,card.y,2,card.height),new Color(194/255f,26/255f,16/255f));
                }
                Border(card,new Color(.61f,.62f,.62f,.13f),1);
                var portrait=new Rect(card.x+14,card.y+14,56,56);
                if(lobbySlotPortrait==null)lobbySlotPortrait=Resources.Load<Texture2D>("Art/CharacterSelect/portrait_warrior")??Resources.Load<Texture2D>("Art/lobby/warrior_portrait");
                Image(new Rect(portrait.x+1,portrait.y+1,54,54),lobbySlotPortrait,ScaleMode.ScaleAndCrop);
                Border(portrait,new Color(.61f,.62f,.62f,.25f),1);
                // 11-04 lead review: on super-wide screens (edge width > 1920) the UI scale is height-based (1.0 at 3840x1080), so panel text was only 1x-sized. A floor is applied to this panel's text only; 16:9 is unchanged.
                int wide=NativeUiViewport.Edges.Width>1921f?2:0;
                int nameSize=20+wide;while(nameSize>14+wide&&SpacedWidth(silverName.font,nameSize,name,nameSize*.08f)>152)nameSize--;
                var nameBox=new Rect(1510,card.y+9,152,30);NativeUiAudit.BeginGroup(nameBox);try{DrawSpaced(0,0,30,name,silverName.font,nameSize,nameSize*.08f,NativeSilverHellUi.Text,true);}finally{NativeUiAudit.EndGroup();}
                var slotMicro=silverMicro;var slotBody=silverBody;
                if(wide>0){slotMicro=new GUIStyle(silverMicro){fontSize=silverMicro.fontSize+2};slotBody=new GUIStyle(silverBody){fontSize=silverBody.fontSize+2};}
                SilverLabel(new Rect(1676,card.y+17,88,20),K("전사","WARRIOR"),slotMicro,TextAnchor.MiddleRight);
                SilverLabel(new Rect(1510,card.y+49,266,24),SilverSlotCaption(name),slotBody,TextAnchor.MiddleLeft);
                GUI.SetNextControlName("character-slot-"+index);if(NativeUiAudit.Button(new Rect(card.x,card.y,345,84),"",GUIStyle.none))SelectCharacter(index);
                if((selected||card.Contains(Event.current.mousePosition))&&NativeUiAudit.Button(new Rect(1788,card.y+21,24,34),"×",silverBody))RequestCharacterDelete(index);
            }
            var create=new Rect(1428,609,400,64);
            var createStyle=new GUIStyle(silverName)
            {
                fontSize=15,wordWrap=true
            };
            Border(create,new Color(.61f,.62f,.62f,.3f),1);
            var plus=new Rect(create.x+14,create.y+12,40,40);Border(plus,new Color(.61f,.62f,.62f,.3f),1);
            SilverLabel(plus,"+",silverName,TextAnchor.MiddleCenter);
            string createLabel=K("새 캐릭터","New character");
            SilverLabel(new Rect(1510,609,220,64),createLabel,createStyle,TextAnchor.MiddleLeft);
            SilverLabel(new Rect(1738,609,76,64),Characters.Count.ToString(),silverBody,TextAnchor.MiddleRight);
            Fill(new Rect(1428,672,400,1),new Color(.61f,.62f,.62f,.13f));
            GUI.enabled=controls&&characterWritesAllowed;
            GUI.SetNextControlName("character-create-card");
            if(NativeUiAudit.Button(create,"",GUIStyle.none))OpenCharacterCreation();
            if(characterRestoreCreateFocus&&Event.current.type==EventType.Repaint)
            {
                if(GUI.enabled)GUI.FocusControl("character-create-card");
                characterRestoreCreateFocus=false;
            }
            GUI.enabled=controls;
            var play=new Rect(1428,702,416,156);
            bool canEnter=controls&&Characters.SelectedIndex>=0&&NativeSilverHellUi.ReviewState!="disabled";
            RefreshLobbyEntryArt();
            NativeSilverHellUi.ArtImage(play,canEnter?lobbySilverEnter:lobbySilverDisabled);
            // ENTER is baked into the source painting. No duplicate translated label.
            GUI.enabled=canEnter;
            if(Event.current.type==EventType.Repaint){
                EntryRect=play;EntryPointer=Event.current.mousePosition;EntryPointerScreen=GUI.matrix.MultiplyPoint3x4(EntryPointer);EntryPointerInside=play.Contains(EntryPointer);
                bool hovered=EntryReviewState=="hover"||EntryReviewState==null&&EntryPointerInside;
                EntryHoverVisible=canEnter&&hovered&&NativeSilverHellUi.EntryFocus(play);
            }
            GUI.SetNextControlName("lobby-enter");DrawEntryHover(play,canEnter);if(EntrySoundButton(play))EnterSelectedCharacter();
            GUI.enabled=controls;
            SilverLabel(new Rect(1424,866,100,42),K("▶ 시네마틱","▶ Cinematic"),silverMicro,TextAnchor.MiddleLeft);
            GUI.SetNextControlName("lobby-replay");if(NativeUiAudit.Button(new Rect(1424,866,100,42),"",GUIStyle.none))ReplayIntro();
            SilverLabel(new Rect(1516,866,210,42),K("STEAM 위시리스트 추가","ADD TO STEAM WISHLIST"),silverMicro,TextAnchor.MiddleLeft);
            GUI.SetNextControlName("lobby-steam");if(DecisionSoundButton(new Rect(1516,866,210,42))){PlayStartupEnter();Application.OpenURL(SteamWishlistUrl);}
            DrawPatchNotesLauncher();
            DrawPower(new Rect(1812,870,36,36));
            GUI.SetNextControlName("lobby-quit");if(NativeUiAudit.Button(new Rect(1812,870,36,36),"",GUIStyle.none))lobbyQuitPrompt=true;
            GUI.matrix=edgeMatrix;
        }
        int lobbyEntryDensity;
        void RefreshLobbyEntryArt(){int density=Screen.height>1080?2:1;if(lobbyEntryDensity==density)return;lobbyEntryDensity=density;lobbySilverEnter=Resources.Load<Texture2D>("Art/ui/silver_hell/lobby_enter_ready_"+density+"x");lobbySilverDisabled=Resources.Load<Texture2D>("Art/ui/silver_hell/lobby_enter_disabled_"+density+"x");}
        // 11-04 RETOUCH: empty-slot face Y 5.3 -> 8.5. Alpha .94 stays (it is what hides the lamp/flag bleed at 3840); alpha alone cannot lift Y above the dark bg (Y 4.3~5.8),
        // so the face colour rises: Y(out)=(1-a)*Ybg+a*Yface, Yface(8,8,12)=8.46 -> 8.2 over bg 4.3~5.8, 8.9 over the 15.3 panel.
        static readonly Color SilverSlotFace=new Color(8/255f,8/255f,12/255f,.94f);
        void DrawEmptySilverSlot(Rect card){Fill(card,SilverSlotFace);Border(card,new Color(.61f,.62f,.62f,.13f),1);Border(new Rect(card.x+14,card.y+14,56,56),new Color(.61f,.62f,.62f,.12f),1);}
        internal bool DeathUiEntryPointerCapture,DeathUiEntryPointerInside,EntryPointerInside,EntryHoverVisible;
        internal string EntryReviewState;
        internal Vector2 EntryPointer,EntryPointerScreen;internal Rect EntryRect;
    }
}
