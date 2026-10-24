using System;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort {
    public static class NativeInventorySeed {
        [Serializable] sealed class EmptySlots {public int[] slots;}
        public static InventorySeedData Load(){
            var data=JsonUtility.FromJson<InventorySeedData>(Resources.Load<TextAsset>("Data/inventory_seed").text);
            var empty=JsonUtility.FromJson<EmptySlots>(Resources.Load<TextAsset>("Data/inventory_empty_slots").text);
            // Unity JsonUtility instantiates null elements of inline class arrays.
            // Restore only source-exported null indices; never loosen item admission.
            foreach(int index in empty.slots){
                if(index<0||index>=data.equipped.Length)throw new InvalidOperationException("Invalid source empty slot");
                var it=data.equipped[index];if(it!=null&&(it.id!=0||!string.IsNullOrEmpty(it.slot)))throw new InvalidOperationException("Empty-slot manifest drift");
                data.equipped[index]=null;
            }
            return data;
        }
    }
}
