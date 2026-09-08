# Explicitly authorized reset: vacation, ending and holiday directories only.
$ErrorActionPreference = 'Stop'
$assetRoot = (Resolve-Path (Join-Path $PSScriptRoot '../assets')).Path
$prologue = Join-Path $assetRoot 'cinematics/prologue'
$before = @(Get-ChildItem -LiteralPath $prologue -File | Get-FileHash | ForEach-Object { $_.Path + ':' + $_.Hash })
$count = 0
foreach ($relative in @('events/vacation','endings','events/holidays')) {
 $target = [IO.Path]::GetFullPath((Join-Path $assetRoot $relative))
 if (-not $target.StartsWith($assetRoot + [IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)) { throw "Unsafe target: $target" }
 if (Test-Path -LiteralPath $target) {
  $item = Get-Item -LiteralPath $target
  if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "Linked target: $target" }
  if ((Resolve-Path -LiteralPath $target).Path -ne $target) { throw "Unexpected target: $target" }
  $children = @(Get-ChildItem -LiteralPath $target -Recurse -Force)
  if ($children | Where-Object {$_.Attributes -band [IO.FileAttributes]::ReparsePoint}) { throw "Linked child: $target" }
  $count += @($children | Where-Object {-not $_.PSIsContainer}).Count
  Remove-Item -LiteralPath $target -Recurse -Force
  Write-Output "Removed: $relative"
 }
}
$after = @(Get-ChildItem -LiteralPath $prologue -File | Get-FileHash | ForEach-Object { $_.Path + ':' + $_.Hash })
if (Compare-Object $before $after) { throw 'Prologue changed unexpectedly' }
Write-Output "Removed $count files. Verified $($after.Count) prologue files unchanged by hash."
