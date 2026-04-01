param(
  [switch]$Staged
)

$allowBypass = $env:ALLOW_MISSING_DOCS -eq '1'

if ($Staged) {
  $files = @(git -c core.quotePath=false diff --cached --name-only --diff-filter=ACMR)
} else {
  $files = @(
    git -c core.quotePath=false diff --name-only --diff-filter=ACMR
    git -c core.quotePath=false diff --cached --name-only --diff-filter=ACMR
    git -c core.quotePath=false ls-files --others --exclude-standard
  )
}

$files = @(
  $files |
    Where-Object { $_ -and $_.Trim().Length -gt 0 } |
    ForEach-Object {
      $p = $_.Trim()
      if ($p.StartsWith('"') -and $p.EndsWith('"')) {
        $p = $p.Substring(1, $p.Length - 2)
      }
      $p.Replace('\', '/')
    } |
    Select-Object -Unique
)

$codeFiles = @($files | Where-Object { -not $_.StartsWith('docs/') })
$docsFiles = @($files | Where-Object { $_.StartsWith('docs/') })
$progressLog = 'docs/CHANGELOG_SYNC.md'
$hasProgressLog = $docsFiles -contains $progressLog

if ($codeFiles.Count -eq 0) {
  exit 0
}

if (($docsFiles.Count -gt 0 -and $hasProgressLog) -or $allowBypass) {
  exit 0
}

$scope = if ($Staged) { 'staged' } else { 'working tree' }
Write-Host ""
Write-Host "[docs-sync-check] $scope changes include non-doc files, but docs sync is incomplete." -ForegroundColor Red
Write-Host ""
Write-Host "Changed non-doc files:"
foreach ($file in $codeFiles) {
  Write-Host "- $file"
}
Write-Host ""
Write-Host "Required action:"
if ($docsFiles.Count -eq 0) {
  Write-Host "- Update the matching docs/ files before commit."
} else {
  Write-Host "- docs/ changes exist, but the progress log is missing."
}
Write-Host "- Update $progressLog with this change set."
Write-Host "- Or set ALLOW_MISSING_DOCS=1 for an explicit one-off bypass."
Write-Host ""
exit 1
