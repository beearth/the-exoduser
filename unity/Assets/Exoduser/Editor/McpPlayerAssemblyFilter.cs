using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.Build;
using UnityEngine;

namespace Exoduser.Editor
{
    // MCP는 에디터 저작 도구다. upstream Runtime helper도 제품 Player에 배포하지 않는다.
    public sealed class McpPlayerAssemblyFilter : IFilterBuildAssemblies
    {
        public int callbackOrder => 0;

        public string[] OnFilterAssemblies(BuildOptions buildOptions, string[] assemblies)
        {
            var filtered = assemblies.Where(assembly =>
                !Path.GetFileNameWithoutExtension(assembly)
                    .StartsWith("MCPForUnity.", StringComparison.OrdinalIgnoreCase)).ToArray();
            Debug.Log($"EXO_MCP_PLAYER_EXCLUDE removed={assemblies.Length - filtered.Length}");
            return filtered;
        }
    }
}
