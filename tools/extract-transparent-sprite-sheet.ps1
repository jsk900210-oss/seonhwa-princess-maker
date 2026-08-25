param(
  [Parameter(Mandatory=$true)][string]$InputPath,
  [Parameter(Mandatory=$true)][string]$OutputDirectory,
  [Parameter(Mandatory=$true)][string]$Prefix
)

Add-Type -AssemblyName System.Drawing
[System.IO.Directory]::CreateDirectory($OutputDirectory) | Out-Null
$source = [System.Drawing.Bitmap]::FromFile($InputPath)
$cellWidth = [math]::Floor($source.Width / 3)

try {
  for ($frame = 0; $frame -lt 3; $frame++) {
    $sprite = New-Object System.Drawing.Bitmap 320, 320, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($sprite)
    try {
      $graphics.Clear([System.Drawing.Color]::Transparent)
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $sourceRect = New-Object System.Drawing.Rectangle ($frame * $cellWidth), 0, $cellWidth, $source.Height
      $targetRect = New-Object System.Drawing.Rectangle 0, 0, 320, 320
      $graphics.DrawImage($source, $targetRect, $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)
    } finally { $graphics.Dispose() }

    $visited = New-Object 'bool[]' (320 * 320)
    $queue = New-Object 'System.Collections.Generic.Queue[int]'
    for ($x = 0; $x -lt 320; $x++) { $queue.Enqueue($x); $queue.Enqueue((319 * 320) + $x) }
    for ($y = 1; $y -lt 319; $y++) { $queue.Enqueue($y * 320); $queue.Enqueue(($y * 320) + 319) }
    while ($queue.Count -gt 0) {
      $index = $queue.Dequeue()
      if ($visited[$index]) { continue }
      $visited[$index] = $true
      $x = $index % 320; $y = [math]::Floor($index / 320)
      $pixel = $sprite.GetPixel($x, $y)
      $max = [math]::Max($pixel.R, [math]::Max($pixel.G, $pixel.B))
      $min = [math]::Min($pixel.R, [math]::Min($pixel.G, $pixel.B))
      if ($min -lt 218 -or ($max - $min) -gt 20) { continue }
      $sprite.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
      if ($x -gt 0) { $queue.Enqueue($index - 1) }
      if ($x -lt 319) { $queue.Enqueue($index + 1) }
      if ($y -gt 0) { $queue.Enqueue($index - 320) }
      if ($y -lt 319) { $queue.Enqueue($index + 320) }
    }
    $output = Join-Path $OutputDirectory "$Prefix-$($frame + 1).png"
    $sprite.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)
    $sprite.Dispose()
  }
} finally { $source.Dispose() }
