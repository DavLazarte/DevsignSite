<#
  Devsign — genera los PNG base (apple-touch-icon y Open Graph).
  Uso: powershell -ExecutionPolicy Bypass -File _tools/make-icons.ps1
  Requiere .NET System.Drawing (viene con Windows). No necesita Node ni librerías.
#>

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$logoPath = Join-Path $root 'images\logo.png'
$iconsDir = Join-Path $root 'assets\icons'
$ogDir = Join-Path $root 'assets\img\og'

New-Item -ItemType Directory -Force -Path $iconsDir, $ogDir | Out-Null

function New-RoundedRect([System.Drawing.RectangleF]$rect, [float]$radius) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $radius * 2
  $path.AddArc($rect.X, $rect.Y, $d, $d, 180, 90)
  $path.AddArc($rect.Right - $d, $rect.Y, $d, $d, 270, 90)
  $path.AddArc($rect.Right - $d, $rect.Bottom - $d, $d, $d, 0, 90)
  $path.AddArc($rect.X, $rect.Bottom - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function New-LetterDPath([float]$x, [float]$y, [float]$height) {
  # D maciza: trazo recto arriba, semicírculo a la derecha y trazo recto abajo.
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $width = [math]::Round($height * 0.68)
  $path.AddLine($x, $y, $x + $width - ($height / 2), $y)
  $path.AddArc($x + $width - $height, $y, $height, $height, -90, 180)
  $path.AddLine($x + $width - ($height / 2), $y + $height, $x, $y + $height)
  $path.CloseFigure()
  return $path
}

# --- apple-touch-icon.png (180×180, sin transparencia) ----------------------
$size = 180
$bmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'
$g.Clear([System.Drawing.ColorTranslator]::FromHtml('#0A2540'))

$dPath = New-LetterDPath -x 60 -y 46 -height 88
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Point(60, 46)),
  (New-Object System.Drawing.Point(120, 134)),
  [System.Drawing.ColorTranslator]::FromHtml('#0057FF'),
  [System.Drawing.ColorTranslator]::FromHtml('#00C6FF')
)
$g.FillPath($brush, $dPath)
$g.Dispose()
$bmp.Save((Join-Path $iconsDir 'apple-touch-icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose(); $brush.Dispose(); $dPath.Dispose()

# --- og-default.png (1200×630) ---------------------------------------------
$w = 1200; $h = 630
$bmp = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'
$g.InterpolationMode = 'HighQualityBicubic'

$bgRect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
$bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Point(0, 0)),
  (New-Object System.Drawing.Point($w, $h)),
  [System.Drawing.ColorTranslator]::FromHtml('#061529'),
  [System.Drawing.ColorTranslator]::FromHtml('#0A2540')
)
$g.FillRectangle($bg, $bgRect)
$bg.Dispose()

# Glow cian (aprox. del hero)
$glow = New-Object System.Drawing.Drawing2D.GraphicsPath
$glow.AddEllipse(760, -180, 700, 620)
$glowBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush($glow)
$glowBrush.CenterColor = [System.Drawing.Color]::FromArgb(70, 0, 198, 255)
$glowBrush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 0, 198, 255))
$g.FillPath($glowBrush, $glow)
$glowBrush.Dispose(); $glow.Dispose()

$glow2 = New-Object System.Drawing.Drawing2D.GraphicsPath
$glow2.AddEllipse(-220, 330, 620, 480)
$glow2Brush = New-Object System.Drawing.Drawing2D.PathGradientBrush($glow2)
$glow2Brush.CenterColor = [System.Drawing.Color]::FromArgb(56, 0, 87, 255)
$glow2Brush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 0, 87, 255))
$g.FillPath($glow2Brush, $glow2)
$glow2Brush.Dispose(); $glow2.Dispose()

# Grilla sutil
$gridPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(14, 255, 255, 255), 1)
for ($x = 0; $x -le $w; $x += 64) { $g.DrawLine($gridPen, $x, 0, $x, $h) }
for ($y = 0; $y -le $h; $y += 64) { $g.DrawLine($gridPen, 0, $y, $w, $y) }
$gridPen.Dispose()

# Logo centrado (2x sobre fondo oscuro)
$logo = [System.Drawing.Image]::FromFile($logoPath)
$logoW = 520
$logoH = [int][math]::Round($logo.Height * ($logoW / $logo.Width))
$logoX = [int](($w - $logoW) / 2)
$logoY = [int](($h - $logoH) / 2)
$g.DrawImage($logo, $logoX, $logoY, $logoW, $logoH)
$logo.Dispose()

# Línea de marca inferior
$linePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 0, 198, 255), 3)
$g.DrawLine($linePen, 0, $h - 6, $w, $h - 6)
$linePen.Dispose()

$g.Dispose()
$bmp.Save((Join-Path $ogDir 'og-default.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

"OK · apple-touch-icon.png y og-default.png generados"
