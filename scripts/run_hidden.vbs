Set WshShell = CreateObject("Wscript.Shell")
WshShell.Run "powershell.exe -ExecutionPolicy Bypass -File ""G:\hell\auto_commit.ps1""", 0, False
