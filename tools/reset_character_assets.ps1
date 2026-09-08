$ErrorActionPreference = 'Stop'
$assetRoot = (Resolve-Path (Join-Path $PSScriptRoot '../assets')).Path
$relativeTargets = @(
 'characters/seonhwa',
 'characters/dialogue-fullbody/seonhwa',
 'events/holidays/moonlight-pageant/seonhwa',
 'events/holidays/sehwa-contest/seonhwa',
 'schedule-layers-v2/childcare/hero-actions',
 'schedule-layers-v2/farmwork/hero-actions',
 'schedule-layers-v2/woodwork/hero-actions'
)
$deletedFiles = 0
foreach ($relative in $relativeTargets) {
 $target = [IO.Path]::GetFullPath((Join-Path $assetRoot $relative))
 if (-not $target.StartsWith($assetRoot + [IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)) { throw "Unsafe target: $target" }
 if (Test-Path -LiteralPath $target) {
  $resolved = (Resolve-Path -LiteralPath $target).Path
  if ($resolved -ne $target) { throw "Unexpected resolved path: $resolved" }
  if (Get-ChildItem -LiteralPath $target -Recurse -Force | Where-Object {$_.Attributes -band [IO.FileAttributes]::ReparsePoint}) {throw "Link inside $target"}
  $deletedFiles += @(Get-ChildItem -LiteralPath $target -File -Recurse -Force).Count
  Remove-Item -LiteralPath $target -Recurse -Force
  Write-Output "Removed $relative"
 }
}
Write-Output "Deleted $deletedFiles files in explicit protagonist directories."
