using System;
using UnityEngine;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeLobby
    {
        [Serializable] sealed class BasicStoryCatalog { public BasicStoryLanguage[] entries; }
        [Serializable] sealed class BasicStoryLanguage { public string code,title; public string[] stories; }
        BasicStoryCatalog basicStoryCatalog;
        bool basicStoryLoaded;
        int basicStoryVisual=-1;
        string basicStoryLanguage="";
        Vector2 basicStoryScroll;

        void DrawCharacterBasicStory(int index)
        {
            if(!basicStoryLoaded)
            {
                basicStoryLoaded=true;
                var asset=Resources.Load<TextAsset>("Data/character_basic_stories");
                if(asset!=null)try { basicStoryCatalog=JsonUtility.FromJson<BasicStoryCatalog>(asset.text); }
                catch(Exception e) { Debug.LogWarning("Character background: "+e.Message); }
            }
            BasicStoryLanguage row=null,english=null;
            if(basicStoryCatalog?.entries!=null)foreach(var entry in basicStoryCatalog.entries)
            {
                if(entry==null)continue;
                if(entry.code==Language)row=entry;
                if(entry.code=="en")english=entry;
            }
            row=row??english;
            if(row?.stories==null||index<0||index>=row.stories.Length)return;
            if(basicStoryVisual!=index||basicStoryLanguage!=Language)
            {basicStoryScroll=Vector2.zero;basicStoryVisual=index;basicStoryLanguage=Language;}
            var matrix=GUI.matrix;
            try
            {
                GUI.matrix=NativeUiViewport.EdgeMatrix;
                const float width=380,inset=28,inner=324;
                string text=row.stories[index];
                // Word-boundary wrap (web keep-all): GUIStyle.wordWrap splits Korean words mid-syllable.
                const float bodySize=16,bodyLine=29;
                float contentHeight=SilverParagraphHeight(text,bodySize,inner-18,bodyLine);
                float height=Mathf.Clamp(contentHeight+116,210,560);
                var panel=new Rect(40,(1080-height)/2,width,height);
                SilverCornerPanel(panel);
                NativeUiAudit.Region(panel,"component","character-basic-story","기본 스토리");
                CharacterLabel(new Rect(panel.x+inset,panel.y+28,inner,30),row.title,silverVisualTitle,TextAnchor.UpperLeft,true);
                Fill(new Rect(panel.x+inset,panel.y+72,inner,1),new Color(.61f,.62f,.62f,.25f));
                var viewport=new Rect(panel.x+inset,panel.y+92,inner,height-116);
                basicStoryScroll=NativeUiAudit.BeginScrollView(viewport,basicStoryScroll,
                    new Rect(0,0,inner-18,Mathf.Max(viewport.height,contentHeight)),false,false);
                DrawSilverParagraph(0,0,inner-18,text,bodySize,bodyLine,new Color(197/255f,194/255f,187/255f));
                NativeUiAudit.EndScrollView();
            }
            finally {GUI.matrix=matrix;}
        }
    }
}
