using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeLobby
    {
        GUIStyle silverName,silverBody,silverMicro;
        Texture2D silverLobbyPoster;
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
            GUI.DrawTexture(new Rect(1360,0,560,1080),lobbySilverShade);
            var lang=new Rect(1424,188,140,36);
            Label(lang,LobbyLanguageLabel(Language),silverMicro,TextAnchor.MiddleLeft);
            Fill(new Rect(1424,217,140,1),new Color(.61f,.62f,.62f,.3f));
            if(GUI.Button(lang,"",GUIStyle.none))ToggleLanguages();
            Label(new Rect(1690,188,142,36),"OFFLINE",silverMicro,TextAnchor.MiddleRight);
            Image(new Rect(1473,236,310,148),gateLogo);
            GUI.enabled=enabled&&!showLanguages&&!lobbyQuitPrompt&&!CharacterModalOpen;
            Fill(new Rect(1428,400,400,1),new Color(.61f,.62f,.62f,.4f));
            bool controls=GUI.enabled;
            GUI.enabled=controls&&characterScroll>0;
            if(Characters.Count>2&&GUI.Button(new Rect(1752,383,36,28),"▲",silverMicro))characterScroll--;
            GUI.enabled=controls&&characterScroll+2<Characters.Count;
            if(Characters.Count>2&&GUI.Button(new Rect(1792,383,36,28),"▼",silverMicro))characterScroll++;
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
                Label(new Rect(1600,card.y+20,160,20),K("전사","WARRIOR"),silverMicro,TextAnchor.MiddleLeft);
                Label(new Rect(1450,card.y+52,342,24),CharacterSlotCaption(),silverBody,TextAnchor.MiddleLeft);
                if(GUI.Button(new Rect(card.x,card.y,345,84),"",GUIStyle.none))SelectCharacter(index);
                if((selected||card.Contains(Event.current.mousePosition))&&GUI.Button(new Rect(1782,card.y+21,30,34),"×",silverBody))RequestCharacterDelete(index);
            }
            var create=new Rect(1428,609,400,64);
            var createStyle=new GUIStyle(silverName)
            {
                fontSize=15
            };
            Label(new Rect(1450,609,360,64),"+ "+K("새 캐릭터","New character"),createStyle,TextAnchor.MiddleLeft);
            Fill(new Rect(1428,672,400,1),new Color(.61f,.62f,.62f,.13f));
            GUI.enabled=controls&&characterWritesAllowed&&Characters.Count<CharacterRoster.Capacity;
            GUI.SetNextControlName("character-create-card");
            if(GUI.Button(create,"",GUIStyle.none))OpenCharacterCreation();
            if(characterRestoreCreateFocus&&Event.current.type==EventType.Repaint)
            {
                if(GUI.enabled)GUI.FocusControl("character-create-card");
                characterRestoreCreateFocus=false;
            }
            GUI.enabled=controls;
            var play=new Rect(1428,702,416,156);
            Image(play,Characters.SelectedIndex>=0?lobbySilverEnter:lobbySilverDisabled);
            GUI.enabled=controls&&Characters.SelectedIndex>=0;
            if(GUI.Button(play,"",GUIStyle.none))EnterSelectedCharacter();
            GUI.enabled=controls;
            Label(new Rect(1424,866,100,42),K("▶ 시네마틱","▶ Cinematic"),silverMicro,TextAnchor.MiddleLeft);
            if(GUI.Button(new Rect(1424,866,100,42),"",GUIStyle.none))ReplayIntro();
            Label(new Rect(1516,866,210,42),K("STEAM 위시리스트 추가","ADD TO STEAM WISHLIST"),silverMicro,TextAnchor.MiddleLeft);
            if(GUI.Button(new Rect(1516,866,210,42),"",GUIStyle.none))Application.OpenURL(SteamWishlistUrl);
            DrawPatchNotesLauncher();
            DrawPower(new Rect(1812,870,36,36));
            if(GUI.Button(new Rect(1812,870,36,36),"",GUIStyle.none))lobbyQuitPrompt=true;
        }
    }
}
