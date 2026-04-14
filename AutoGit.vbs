Set ws = CreateObject("WScript.Shell")
ws.Run "powershell.exe -NonInteractive -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File G:\hell\auto_commit.ps1", 0, False
