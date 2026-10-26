using System;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        SourcePets pets;
        SourcePetDialogue petDialogue;
        NativePetView petView;
        GUIStyle petText;
        readonly GUIContent petContent=new GUIContent();
        internal SourcePets FieldPets => pets;
        internal Texture2D PetFlame => petView.Flames[(int)(pets.Iris.T*.08)%4];
        void InitializePets()
        {
            pets=new SourcePets();petView=new NativePetView(transform);
            var data=Resources.Load<TextAsset>("Data/pets");
            if(data==null)throw new InvalidOperationException("Missing original pet dialogue");
            petDialogue=new SourcePetDialogue(JsonUtility.FromJson<PetDialogueData>(data.text));
        }
        void ResetPets(){pets.Reset(Simulation.Player.X,Simulation.Player.Y,UnityEngine.Random.Range(0,100));petDialogue.Reset();Simulation.PetKilled+=petDialogue.OnKill;RenderPets();}
        void TickPets()
        {
            // Source lesson.tick returns before updatePet only during intro. SupportedComplete
            // is a port boundary: freeze, never invent the next lesson or its pet events.
            if(firstPractice!=null&&(firstPractice.Phase==FirstPracticePhase.Intro||firstPractice.Phase==FirstPracticePhase.SupportedComplete))return;
            pets.Tick(Simulation);
            // Source9619 reads (it.enhLv||0), not it.enh. enhLv has no Unity owner;
            // preserve its source default0 instead of silently fixing the original hint.
            bool heroic=false,unenhanced=false;foreach(var item in inventory.State.Equipped)if(item!=null&&item.rarity>=3){heroic=true;unenhanced=true;}
            petDialogue.Tick(Simulation,firstPractice!=null,inventory.State.Bag.Count,heroic,unenhanced);
        }
        void RenderPets(){petView.Render(pets);}
        void PollPetInput(){if(firstPractice==null&&Input.GetKeyDown(KeyCode.Y))pets.IrisOff=!pets.IrisOff;}
        void DrawPets(float width,float height)
        {
            if(petDialogue.Alpha<=0||Simulation.Player.Hp<=0)return;
            petDialogue.SetLanguage(lobby.Language);petContent.text=petDialogue.Text;
            if(petText==null){petText=new GUIStyle(GUI.skin.label){font=font,fontSize=15,fontStyle=FontStyle.Bold,wordWrap=true,alignment=TextAnchor.MiddleLeft,padding=new RectOffset(0,0,0,0)};petText.normal.textColor=Color.white;}
            bool crow=petDialogue.Who=="crow";
            // DOM2587 + ui inset10 + bottom220; portrait480x320, scale1.5.
            float scale=Mathf.Min(Screen.width/1920f,Screen.height/1080f);
            float margin=20/scale; // CSS left/right20px is outside the portrait's scale transform.
            float x=crow?margin:width-margin-720;
            if(!crow&&firstPractice!=null&&!menu&&gameFocused)x=PracticePanel(width).x-12-720;
            float y=height-230-480;
            var old=GUI.color;var alpha=petDialogue.Alpha;
            GUI.color=new Color(1,1,1,alpha);GUI.DrawTexture(new Rect(x,y,720,480),crow?petView.CrowPortrait:petView.CatPortrait,ScaleMode.StretchToFill,true);
            var rect=crow?new Rect(x+138,y+355.5f,459,76.5f):new Rect(x+183,y+375,285,63);
            petText.fontSize=22; // .92rem * 1.5, source font stack's bundled sans fallback.
            GUI.color=new Color(0,0,0,alpha*.95f);GUI.Label(new Rect(rect.x,rect.y+1.5f,rect.width,rect.height),petContent,petText);
            GUI.color=new Color(1,1,1,alpha);GUI.Label(rect,petContent,petText);GUI.color=old;
        }
        void DisposePets(){petView?.Dispose();petView=null;}
    }
}
