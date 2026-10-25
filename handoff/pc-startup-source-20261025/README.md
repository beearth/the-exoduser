# Read-only PC startup UI source capture

The manifest identifies the exact files on the PC checkout and their HEAD/index/work/remote-main SHA-256 values. The PC checkout has local WIP and is not equivalent to remote main. Matching files can be read from immutable remote-main commit:path. Only differing linked source files are included under files/. Runtime availability is stated separately in manifest.json. Do not import this older checkout wholesale or replace current Mac product work with this snapshot. No gameplay saves were accessed.
