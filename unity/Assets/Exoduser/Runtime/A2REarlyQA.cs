using System;
using System.IO;
using System.Collections.Generic;
using UnityEngine;
namespace Exoduser.UnityPort
{
    // QA-only: collect failures before NativeGame and the ordinary lobby smoke exist.
    public static class A2REarlyQA
    {
        [Serializable] sealed class Entry {public string message,stack,type;}
        [Serializable] sealed class Receipt {public string scope="Full-process explicit-sandbox QA logging registered BeforeSplashScreen, including errors before the play-smoke subscribes.";public List<Entry> errors=new List<Entry>();}
        static Receipt receipt=new Receipt();static string output;
        public static int ErrorCount {get{return receipt.errors.Count;}}
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSplashScreen)]
        static void Install()
        {
            var args=Environment.GetCommandLineArgs();if(Array.IndexOf(args,"--a2r-play-smoke")<0||Array.IndexOf(args,"--unity-qa-sandbox")<0)return;int at=Array.IndexOf(args,"-output");if(at<0||at+1>=args.Length||!Path.IsPathRooted(args[at+1]))return;output=args[at+1];Directory.CreateDirectory(output);Write();Application.logMessageReceived+=Record;
        }
        static void Record(string message,string stack,LogType type)
        {
            if(type!=LogType.Error&&type!=LogType.Exception&&type!=LogType.Assert)return;receipt.errors.Add(new Entry{message=message,stack=string.IsNullOrEmpty(stack)?Environment.StackTrace:stack,type=type.ToString()});Write();
        }
        static void Write(){try{if(output!=null)File.WriteAllText(Path.Combine(output,"early-errors.json"),JsonUtility.ToJson(receipt,true));}catch{/* The ordinary output-path gate reports IO failures; never recurse into Unity logging. */}}
    }
}
