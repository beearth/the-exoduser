using System.IO;
using System.Text;

namespace Exoduser.UnityPort
{
 // Routing only: which folder holds a flavor's saves. The store schemas and codecs stay unchanged.
 // 11-04 decision: the full flavor keeps using the folder the old product-name build wrote to (no copy, no import);
 // demo/BIC/EA start fresh under their own namespace below the current product root. Nothing here reads or writes the folder.
 public static class NativeFlavorSavePaths
 {
  public enum RootKind {Windows,MacPlayer,Other}
  // Product name of the old build; its folder name is fixed here on purpose (it no longer follows the product title).
  public const string LegacyProductName="EXODUSER · Unity 이식 검증판";
  // Windows: LocalLow/<company>/<old product>. Mac Player: Application Support/<bundle id folder>. Other (Editor): unchanged persistentDataPath.
  public static string FullRoot(string persistentRoot,string company,RootKind kind)
  {
   if(kind==RootKind.Other)return persistentRoot;
   var parent=Directory.GetParent(persistentRoot);if(parent==null)return persistentRoot;
   if(kind==RootKind.Windows)return Path.Combine(parent.FullName,LegacyProductName);
   // Unity macOS Player may use unity.company.product or company/product below Application Support; step up to Application Support.
   string support=parent.Name==company&&parent.Parent!=null?parent.Parent.FullName:parent.FullName;
   return Path.Combine(support,BundleIdentifier(company,LegacyProductName));
  }
  // Namespaced flavors (demo/BIC/EA, QA sandbox): <root>/<namespace>.
  public static string NamespacedRoot(string root,string saveNamespace)
  {
   if(string.IsNullOrWhiteSpace(root)||!Path.IsPathRooted(root)||string.IsNullOrEmpty(saveNamespace))throw new System.ArgumentException("Absolute save root and flavor namespace required.");
   foreach(char c in saveNamespace)if(!(c>='A'&&c<='Z'||c>='a'&&c<='z'||c>='0'&&c<='9'||c=='-'||c=='_'))throw new System.ArgumentException("Invalid save namespace.");
   return Path.Combine(Path.GetFullPath(root),saveNamespace);
  }
  // Unity builds the macOS bundle id from company and product, turning every byte of the UTF-8 text that is not
  // an ASCII letter or digit into '-' (a two-byte letter becomes two dashes).
  public static string BundleIdentifier(string company,string product)
  {
   return "com."+Sanitize(company)+"."+Sanitize(product);
  }
  static string Sanitize(string text)
  {
   var result=new StringBuilder();
   foreach(byte b in Encoding.UTF8.GetBytes(text??""))result.Append(b>='A'&&b<='Z'||b>='a'&&b<='z'||b>='0'&&b<='9'?(char)b:'-');
   return result.ToString();
  }
 }
}
