# Face-centred square crops of the team headshots at retina sizes.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root   = Split-Path $PSScriptRoot -Parent
$imgDir = Join-Path $root 'assets\images\team'
New-Item -ItemType Directory -Force -Path $imgDir | Out-Null

# cx/cy/side are the face-centred crop window in the 600x900 source
$people = @(
    @{ src = 'Pankaj-1.jpg'; slug = 'pankaj'; cx = 288; cy = 300; side = 440 },
    @{ src = 'Rishabh.jpg';  slug = 'rishabh'; cx = 300; cy = 330; side = 480 }
)

$enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$pars = New-Object System.Drawing.Imaging.EncoderParameters 1
$pars.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 92L

foreach ($p in $people) {
    $img = [System.Drawing.Image]::FromFile((Join-Path $root "assets\images\$($p.src)"))

    $x = [Math]::Max(0, $p.cx - $p.side / 2)
    $y = [Math]::Max(0, $p.cy - $p.side / 2)
    $side = [Math]::Min($p.side, [Math]::Min($img.Width - $x, $img.Height - $y))
    $crop = New-Object System.Drawing.Rectangle ([int]$x), ([int]$y), ([int]$side), ([int]$side)

    foreach ($size in 400, 280) {
        $bmp = New-Object System.Drawing.Bitmap $size, $size
        $bmp.SetResolution(96, 96)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.DrawImage($img, (New-Object System.Drawing.Rectangle 0, 0, $size, $size), $crop, [System.Drawing.GraphicsUnit]::Pixel)
        $g.Dispose()

        $out = Join-Path $imgDir "$($p.slug)-$size.jpg"
        $bmp.Save($out, $enc, $pars)
        $bmp.Dispose()
        Write-Host "  wrote team/$($p.slug)-$size.jpg ($size x $size)"
    }
    $img.Dispose()
}
Write-Host "Team headshots processed."
