using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeLobby
    {
        GUIStyle silverName,silverBody,silverMicro;
        Texture2D silverLobbyPoster;
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
            NativeUiAudit.DrawTexture(new Rect(1360,0,560,1080),lobbySilverShade);
            var lang=new Rect(1424,188,140,36);
            SilverLabel(lang,LobbyLanguageLabel(Language),silverMicro,TextAnchor.MiddleLeft);
            Fill(new Rect(1424,217,140,1),new Color(.61f,.62f,.62f,.3f));
            if(NativeUiAudit.Button(lang,"",GUIStyle.none))ToggleLanguages();
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
                string name=Characters.NameAt(index);
                if(name.Length==0)continue;
                var card=new Rect(1428,421+n*94,390,84);
                bool selected=index==Characters.SelectedIndex;
                if(selected)
                {
                    Fill(card,new Color(194/255f,26/255f,16/255f,.1f));
                    Fill(new Rect(card.x,card.y,2,card.height),new Color(194/255f,26/255f,16/255f));
                }
                Fill(new Rect(card.x,card.yMax-1,card.width,1),new Color(.61f,.62f,.62f,.13f));
                DrawSpaced(1450,card.y+10,32,name,silverName.font,22,22*.08f,NativeSilverHellUi.Text,true);
                SilverLabel(new Rect(1600,card.y+20,160,20),K("전사","WARRIOR"),silverMicro,TextAnchor.MiddleLeft);
                SilverLabel(new Rect(1450,card.y+52,342,24),SilverSlotCaption(name),silverBody,TextAnchor.MiddleLeft);
                if(NativeUiAudit.Button(new Rect(card.x,card.y,345,84),"",GUIStyle.none))SelectCharacter(index);
                if((selected||card.Contains(Event.current.mousePosition))&&NativeUiAudit.Button(new Rect(1782,card.y+21,30,34),"×",silverBody))RequestCharacterDelete(index);
            }
            var create=new Rect(1428,609,400,64);
            var createStyle=new GUIStyle(silverName)
            {
                fontSize=15
            };
            SilverLabel(new Rect(1450,609,360,64),"+ "+K("새 캐릭터","New character"),createStyle,TextAnchor.MiddleLeft);
            Fill(new Rect(1428,672,400,1),new Color(.61f,.62f,.62f,.13f));
            GUI.enabled=controls&&characterWritesAllowed&&Characters.Count<CharacterRoster.Capacity;
            GUI.SetNextControlName("character-create-card");
            if(NativeUiAudit.Button(create,"",GUIStyle.none))OpenCharacterCreation();
            if(characterRestoreCreateFocus&&Event.current.type==EventType.Repaint)
            {
                if(GUI.enabled)GUI.FocusControl("character-create-card");
                characterRestoreCreateFocus=false;
            }
            GUI.enabled=controls;
            var play=new Rect(1428,722,400,76);
            bool canEnter=controls&&Characters.SelectedIndex>=0;
            var tint=GUI.color;if(!canEnter)GUI.color=new Color(tint.r*.52f,tint.g*.52f,tint.b*.52f,tint.a);
            NativeSilverHellUi.ActionPlate(play,canEnter,canEnter&&play.Contains(Event.current.mousePosition)?1:0,!AutomatedInput&&play.Contains(Event.current.mousePosition)&&ExoInput.Mouse(0));
            GUI.color=tint;
            var enterText=K("입장","ENTER");float enterSpacing=22*.14f,enterWidth=SpacedWidth(silverName.font,22,enterText,enterSpacing)-enterSpacing;
            DrawSpaced(play.center.x-enterWidth/2,play.y,play.height,enterText,silverName.font,22,enterSpacing,canEnter?NativeSilverHellUi.Bright:NativeSilverHellUi.Dim,true);
            GUI.enabled=controls&&Characters.SelectedIndex>=0;
            if(NativeUiAudit.Button(play,"",GUIStyle.none))EnterSelectedCharacter();
            GUI.enabled=controls;
            SilverLabel(new Rect(1424,866,100,42),K("▶ 시네마틱","▶ Cinematic"),silverMicro,TextAnchor.MiddleLeft);
            if(NativeUiAudit.Button(new Rect(1424,866,100,42),"",GUIStyle.none))ReplayIntro();
            SilverLabel(new Rect(1516,866,210,42),K("STEAM 위시리스트 추가","ADD TO STEAM WISHLIST"),silverMicro,TextAnchor.MiddleLeft);
            if(NativeUiAudit.Button(new Rect(1516,866,210,42),"",GUIStyle.none))Application.OpenURL(SteamWishlistUrl);
            DrawPatchNotesLauncher();
            DrawPower(new Rect(1812,870,36,36));
            if(NativeUiAudit.Button(new Rect(1812,870,36,36),"",GUIStyle.none))lobbyQuitPrompt=true;
        }
    }
}
