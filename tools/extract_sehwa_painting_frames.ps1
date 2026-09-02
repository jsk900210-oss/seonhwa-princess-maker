param(
  [Parameter(Mandatory=$true)][string]$Source,
  [Parameter(Mandatory=$true)][string]$Destination
)

Add-Type -AssemblyName System.Drawing
$inputBitmap=[System.Drawing.Bitmap]::FromFile($Source)
$width=$inputBitmap.Width
$height=$inputBitmap.Height
$sourceBitmap=[System.Drawing.Bitmap]::new([int]$width,[int]$height,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
for($copyY=0;$copyY -lt $height;$copyY++){for($copyX=0;$copyX -lt $width;$copyX++){$sourceBitmap.SetPixel($copyX,$copyY,$inputBitmap.GetPixel($copyX,$copyY))}}
$inputBitmap.Dispose()
$seen=New-Object 'bool[]' ($width*$height)
$queue=New-Object 'System.Collections.Generic.Queue[int]'

function Test-CheckerBackground([System.Drawing.Color]$Color){
  $spread=[Math]::Max($Color.R,[Math]::Max($Color.G,$Color.B))-[Math]::Min($Color.R,[Math]::Min($Color.G,$Color.B))
  return $Color.R -ge 232 -and $Color.G -ge 232 -and $Color.B -ge 232 -and $spread -le 8
}
function Add-Edge([int]$X,[int]$Y){
  if($X -lt 0 -or $Y -lt 0 -or $X -ge $width -or $Y -ge $height){return}
  $index=$Y*$width+$X
  if(-not $seen[$index] -and (Test-CheckerBackground ($sourceBitmap.GetPixel($X,$Y)))){$seen[$index]=$true;$queue.Enqueue($index)}
}

for($x=0;$x -lt $width;$x++){Add-Edge $x 0;Add-Edge $x ($height-1)}
for($y=0;$y -lt $height;$y++){Add-Edge 0 $y;Add-Edge ($width-1) $y}
while($queue.Count -gt 0){
  [int]$current=$queue.Dequeue();[int]$x=$current%$width;[int]$y=[Math]::Floor($current/$width)
  Add-Edge ($x-1) $y
  Add-Edge ($x+1) $y
  Add-Edge $x ($y-1)
  Add-Edge $x ($y+1)
}
for($y=0;$y -lt $height;$y++){for($x=0;$x -lt $width;$x++){
  $index=$y*$width+$x
  if($seen[$index] -or (Test-CheckerBackground ($sourceBitmap.GetPixel($x,$y)))){$sourceBitmap.SetPixel($x,$y,[System.Drawing.Color]::FromArgb(0,0,0,0))}
}}

New-Item -ItemType Directory -Force -Path $Destination | Out-Null
for($row=0;$row -lt 2;$row++){for($column=0;$column -lt 5;$column++){
  $left=[Math]::Floor($column*$width/5);$top=[Math]::Floor($row*$height/2)
  $right=[Math]::Floor(($column+1)*$width/5);$bottom=[Math]::Floor(($row+1)*$height/2)
  $frame=[System.Drawing.Bitmap]::new([int]($right-$left),[int]($bottom-$top),[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  for($frameY=0;$frameY -lt $frame.Height;$frameY++){for($frameX=0;$frameX -lt $frame.Width;$frameX++){
    $frame.SetPixel($frameX,$frameY,$sourceBitmap.GetPixel($left+$frameX,$top+$frameY))
  }}
  $number=$row*5+$column+1
  $frame.Save((Join-Path $Destination ("frame-{0:d2}.png" -f $number)),[System.Drawing.Imaging.ImageFormat]::Png)
  $frame.Dispose()
}}
$sourceBitmap.Dispose()
