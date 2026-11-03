using System.Collections.Generic;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort {
 public sealed partial class NativePauseMenu {
  // Native-only QA copy is kept apart from the exact imported web label catalog.
  static readonly Dictionary<string,string> qaSettingsNotSaved=new Dictionary<string,string>{
   {"ko","검수 실행의 설정은 저장하지 않습니다."},
   {"en","Settings are not saved during this QA run."},
   {"de","Einstellungen werden während dieses QA-Tests nicht gespeichert."},
   {"fr","Les paramètres ne sont pas enregistrés pendant ce test QA."}
  };
  internal static string QaSettingsPersistenceNotice(string locale){string value;return qaSettingsNotSaved.TryGetValue(LobbyLanguage.Normalize(locale),out value)?value:qaSettingsNotSaved["en"];}
 }
}
