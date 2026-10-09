# Builds sharp, multi-resolution brand assets from the source logo.jpg
# The logo mark itself is never redrawn - only upscaled, sharpened and cropped.

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root    = Split-Path $PSScriptRoot -Parent
$imgDir  = Join-Path $root 'assets\images'
$src     = Join-Path $imgDir 'logo.jpg'

Add-Type -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;

public static class Img {
    public static Bitmap Resize(Image src, int w, int h) {
        Bitmap bmp = new Bitmap(w, h, PixelFormat.Format32bppArgb);
        bmp.SetResolution(96, 96);
        using (Graphics g = Graphics.FromImage(bmp)) {
            g.CompositingQuality = CompositingQuality.HighQuality;
            g.InterpolationMode  = InterpolationMode.HighQualityBicubic;
            g.SmoothingMode      = SmoothingMode.HighQuality;
            g.PixelOffsetMode    = PixelOffsetMode.HighQuality;
            using (ImageAttributes ia = new ImageAttributes()) {
                ia.SetWrapMode(WrapMode.TileFlipXY);
                g.DrawImage(src, new Rectangle(0, 0, w, h), 0, 0, src.Width, src.Height, GraphicsUnit.Pixel, ia);
            }
        }
        return bmp;
    }

    // Unsharp mask - recovers edge definition lost to JPEG compression + upscaling.
    public static Bitmap Sharpen(Bitmap src, double amount) {
        int w = src.Width, h = src.Height;
        Bitmap dst = new Bitmap(w, h, PixelFormat.Format32bppArgb);
        Rectangle rect = new Rectangle(0, 0, w, h);
        BitmapData sd = src.LockBits(rect, ImageLockMode.ReadOnly,  PixelFormat.Format32bppArgb);
        BitmapData dd = dst.LockBits(rect, ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
        int stride = sd.Stride;
        byte[] s = new byte[stride * h];
        byte[] d = new byte[stride * h];
        System.Runtime.InteropServices.Marshal.Copy(sd.Scan0, s, 0, s.Length);

        double[] k = { -1, -1, -1, -1, 9, -1, -1, -1, -1 };
        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                int i = y * stride + x * 4;
                if (x == 0 || y == 0 || x == w - 1 || y == h - 1) {
                    d[i] = s[i]; d[i+1] = s[i+1]; d[i+2] = s[i+2]; d[i+3] = s[i+3];
                    continue;
                }
                for (int c = 0; c < 3; c++) {
                    double sum = 0; int ki = 0;
                    for (int ky = -1; ky <= 1; ky++)
                        for (int kx = -1; kx <= 1; kx++)
                            sum += s[(y + ky) * stride + (x + kx) * 4 + c] * k[ki++];
                    double orig = s[i + c];
                    double v = orig + (sum - orig) * amount;
                    d[i + c] = (byte)(v < 0 ? 0 : (v > 255 ? 255 : v));
                }
                d[i + 3] = s[i + 3];
            }
        }
        System.Runtime.InteropServices.Marshal.Copy(d, 0, dd.Scan0, d.Length);
        src.UnlockBits(sd);
        dst.UnlockBits(dd);
        return dst;
    }
}
"@ -ReferencedAssemblies System.Drawing, System.Drawing.Primitives 2>$null

function Save-Png($bmp, $path) {
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host ("  wrote {0} ({1}x{2})" -f (Split-Path $path -Leaf), $bmp.Width, $bmp.Height)
}

# ---------------------------------------------------------------- master upscale
$orig = [System.Drawing.Image]::FromFile($src)
Write-Host "Source logo: $($orig.Width) x $($orig.Height)"

$scale  = 6
$big    = [Img]::Resize($orig, $orig.Width * $scale, $orig.Height * $scale)
$master = [Img]::Sharpen($big, 0.35)
$big.Dispose()
Save-Png $master (Join-Path $imgDir 'logo-master.png')

# ---------------------------------------------------------------- responsive set
foreach ($w in 200, 400, 600) {
    $h = [int][Math]::Round($w * $master.Height / $master.Width)
    $v = [Img]::Resize($master, $w, $h)
    $name = switch ($w) { 200 { 'logo.png' } 400 { 'logo@2x.png' } 600 { 'logo@3x.png' } }
    Save-Png $v (Join-Path $imgDir $name)
    $v.Dispose()
}

# ---------------------------------------------------------------- kiwi lettermark
# Locate the coral kiwi glyph by colour so the crop is exact, not guessed.
$minX = [int]::MaxValue; $minY = [int]::MaxValue; $maxX = -1; $maxY = -1
$probe = New-Object System.Drawing.Bitmap $orig
for ($y = 0; $y -lt $probe.Height; $y++) {
    for ($x = 0; $x -lt $probe.Width; $x++) {
        $c = $probe.GetPixel($x, $y)
        if ($c.R -gt 140 -and $c.G -lt 130 -and $c.B -lt 130) {
            if ($x -lt $minX) { $minX = $x }; if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }; if ($y -gt $maxY) { $maxY = $y }
        }
    }
}
$probe.Dispose()
Write-Host "Kiwi mark bounds: ($minX,$minY) -> ($maxX,$maxY)"

$bw = $maxX - $minX + 1
$bh = $maxY - $minY + 1
$side = [Math]::Max($bw, $bh)
$pad  = [int]($side * 0.30)
$box  = $side + $pad * 2
$cx   = $minX + $bw / 2
$cy   = $minY + $bh / 2

$markSrc = New-Object System.Drawing.Bitmap $box, $box
$g = [System.Drawing.Graphics]::FromImage($markSrc)
$g.Clear([System.Drawing.ColorTranslator]::FromHtml('#0C0634'))
$g.DrawImage($orig, [int]($box / 2 - $cx), [int]($box / 2 - $cy))
$g.Dispose()

$markBig = [Img]::Resize($markSrc, 512, 512)
$mark    = [Img]::Sharpen($markBig, 0.30)
$markBig.Dispose(); $markSrc.Dispose()
Save-Png $mark (Join-Path $imgDir 'logomark-512.png')
Save-Png $mark (Join-Path $imgDir 'android-chrome-512x512.png')

$m192 = [Img]::Resize($mark, 192, 192); Save-Png $m192 (Join-Path $imgDir 'android-chrome-192x192.png'); $m192.Dispose()

# Apple touch icon - white plate, mark inset (iOS does not round transparent art well)
$apple = New-Object System.Drawing.Bitmap 180, 180
$g = [System.Drawing.Graphics]::FromImage($apple)
$g.Clear([System.Drawing.Color]::White)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$inner = [Img]::Resize($mark, 150, 150)
$g.DrawImage($inner, 15, 15, 150, 150)
$g.Dispose(); $inner.Dispose()
Save-Png $apple (Join-Path $imgDir 'apple-touch-icon.png')
$apple.Dispose()

# ---------------------------------------------------------------- favicon.ico (16/32/48, PNG-encoded)
$sizes   = 16, 32, 48
$streams = @()
foreach ($s in $sizes) {
    $f  = [Img]::Resize($mark, $s, $s)
    $ms = New-Object System.IO.MemoryStream
    $f.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $streams += , @{ size = $s; bytes = $ms.ToArray() }
    $ms.Dispose(); $f.Dispose()
}
$ico = New-Object System.IO.MemoryStream
$bw2 = New-Object System.IO.BinaryWriter $ico
$bw2.Write([UInt16]0); $bw2.Write([UInt16]1); $bw2.Write([UInt16]$streams.Count)
$offset = 6 + 16 * $streams.Count
foreach ($e in $streams) {
    $bw2.Write([Byte]$e.size); $bw2.Write([Byte]$e.size)
    $bw2.Write([Byte]0); $bw2.Write([Byte]0)
    $bw2.Write([UInt16]1); $bw2.Write([UInt16]32)
    $bw2.Write([UInt32]$e.bytes.Length); $bw2.Write([UInt32]$offset)
    $offset += $e.bytes.Length
}
foreach ($e in $streams) { $bw2.Write($e.bytes) }
$bw2.Flush()
[System.IO.File]::WriteAllBytes((Join-Path $root 'favicon.ico'), $ico.ToArray())
$bw2.Dispose(); $ico.Dispose()
Write-Host "  wrote favicon.ico (16/32/48)"

# ---------------------------------------------------------------- OG image 1200x630
$og = New-Object System.Drawing.Bitmap 1200, 630
$g  = [System.Drawing.Graphics]::FromImage($og)
$g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.Clear([System.Drawing.ColorTranslator]::FromHtml('#0C0634'))

# soft radial glows, kept clear of the logo lock-up area
function Add-Glow($gfx, $x, $y, $d, $color, $alpha) {
    $p = New-Object System.Drawing.Drawing2D.GraphicsPath
    $p.AddEllipse($x, $y, $d, $d)
    $b = New-Object System.Drawing.Drawing2D.PathGradientBrush $p
    $b.CenterColor    = [System.Drawing.Color]::FromArgb($alpha, $color.R, $color.G, $color.B)
    $b.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 12, 6, 52))
    $gfx.FillPath($b, $p)
    $b.Dispose(); $p.Dispose()
}
Add-Glow $g -260 -200 820 ([System.Drawing.ColorTranslator]::FromHtml('#00B89C')) 60
Add-Glow $g  880  330 760 ([System.Drawing.ColorTranslator]::FromHtml('#FF4948')) 45

$ogLogo = [Img]::Resize($master, 440, [int][Math]::Round(440 * $master.Height / $master.Width))
$logoX = [int]((1200 - 440) / 2)
$logoY = 150
# flat plate in the exact logo colour guarantees the lock-up never sits on a busy background
$g.FillRectangle((New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#0C0634'))), ($logoX - 40), ($logoY - 34), 520, ($ogLogo.Height + 68))
$g.DrawImage($ogLogo, $logoX, $logoY, 440, $ogLogo.Height)
$logoBottom = $logoY + $ogLogo.Height
$ogLogo.Dispose()

$fmt = New-Object System.Drawing.StringFormat
$fmt.Alignment = [System.Drawing.StringAlignment]::Center

$apos  = [string][char]0x2019
$fontA = New-Object System.Drawing.Font 'Segoe UI Semibold', 34, ([System.Drawing.FontStyle]::Bold)
$brA   = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$g.DrawString("Auckland${apos}s Independent Mortgage Advisers", $fontA, $brA,
    (New-Object System.Drawing.RectangleF 0, ($logoBottom + 46), 1200, 70), $fmt)

$fontB = New-Object System.Drawing.Font 'Segoe UI', 22
$brB   = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#9591B6'))
$dot = [string][char]0x00B7
$g.DrawString("We compare 15+ lenders  $dot  Free advice  $dot  027 303 0000", $fontB, $brB,
    (New-Object System.Drawing.RectangleF 0, ($logoBottom + 112), 1200, 50), $fmt)

$g.FillRectangle((New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#00B89C'))), 0, 606, 1200, 24)
$g.Dispose()
Save-Png $og (Join-Path $imgDir 'og-image.png')
$og.Dispose()

$mark.Dispose(); $master.Dispose(); $orig.Dispose()
Write-Host "`nBrand assets built."
