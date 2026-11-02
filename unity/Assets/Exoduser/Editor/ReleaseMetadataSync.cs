using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using Exoduser.UnityPort.Core;

// The root release-version.json is the release SSOT, also in a sparse checkout.
// Keep this independent of Editor APIs so malformed/missing inputs can be tested.
public static class ReleaseMetadataSync
{
    public static string Copy(string source, string destination)
    {
        string json = File.ReadAllText(source);
        var release = SaveJson.Parse(json);
        string version = release.Str("version"), date = release.Str("date");
        if (version == null || !Regex.IsMatch(version, @"^\d+\.\d+\.\d+$") ||
            date == null || !DateTime.TryParseExact(date, "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.None, out var parsed) || string.IsNullOrEmpty(release.Str("channel")))
            throw new FormatException("Invalid release-version.json: version/date/channel are required");
        if (!File.Exists(destination) || File.ReadAllText(destination) != json)
            File.WriteAllText(destination, json, new UTF8Encoding(false));
        return version;
    }
}
