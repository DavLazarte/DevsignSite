<?php
$srcDir = 'assets/img/logos/';
$dstDir = 'assets/img/logos/opt/';
if (!is_dir($dstDir)) mkdir($dstDir, 0755, true);

$logos = glob($srcDir . '*.webp');

foreach ($logos as $f) {
    $name = basename($f);
    $im = @imagecreatefromwebp($f);
    if (!$im) continue;
    
    $w = imagesx($im);
    $h = imagesy($im);
    
    // Check corner color and alpha
    $c00 = imagecolorat($im, 0, 0);
    $a00 = ($c00 >> 24) & 0x7F;
    $r00 = ($c00 >> 16) & 0xFF;
    $g00 = ($c00 >> 8) & 0xFF;
    $b00 = $c00 & 0xFF;
    
    // Create truecolor with alpha
    $clean = imagecreatetruecolor($w, $h);
    imagealphablending($clean, false);
    imagesavealpha($clean, true);
    $trans = imagecolorallocatealpha($clean, 0, 0, 0, 127);
    imagefilledrectangle($clean, 0, 0, $w, $h, $trans);
    
    $isDarkBg = ($a00 == 0 && $r00 < 35 && $g00 < 35 && $b00 < 35);
    $isWhiteBg = ($a00 == 0 && $r00 > 235 && $g00 > 235 && $b00 > 235);
    
    $minX = $w; $maxX = 0; $minY = $h; $maxY = 0;
    
    for ($x=0; $x<$w; $x++) {
        for ($y=0; $y<$h; $y++) {
            $c = imagecolorat($im, $x, $y);
            $a = ($c >> 24) & 0x7F;
            $r = ($c >> 16) & 0xFF;
            $g = ($c >> 8) & 0xFF;
            $b = $c & 0xFF;
            
            if ($a >= 120) {
                // Already fully transparent
                imagesetpixel($clean, $x, $y, $trans);
                continue;
            }
            
            if ($isDarkBg) {
                // If pixel is near black, make transparent
                $maxRgb = max($r, $g, $b);
                if ($maxRgb < 38) {
                    imagesetpixel($clean, $x, $y, $trans);
                    continue;
                }
                // Special case for am.webp which has white letters on black: convert white/gray to #0A2540
                if ($name === 'am.webp') {
                    $alphaCalc = (int)(127 * (1 - ($maxRgb / 255)));
                    $pixelColor = imagecolorallocatealpha($clean, 10, 37, 64, min(127, $alphaCalc));
                    imagesetpixel($clean, $x, $y, $pixelColor);
                } else {
                    // Soften edges based on luminance
                    $alphaCalc = ($maxRgb < 70) ? (int)(127 * (1 - ($maxRgb / 70))) : 0;
                    $pixelColor = imagecolorallocatealpha($clean, $r, $g, $b, min(127, $alphaCalc));
                    imagesetpixel($clean, $x, $y, $pixelColor);
                }
            } elseif ($isWhiteBg) {
                // If pixel is near white, make transparent
                $minRgb = min($r, $g, $b);
                if ($minRgb > 240) {
                    imagesetpixel($clean, $x, $y, $trans);
                    continue;
                }
                $pixelColor = imagecolorallocatealpha($clean, $r, $g, $b, $a);
                imagesetpixel($clean, $x, $y, $pixelColor);
            } else {
                $pixelColor = imagecolorallocatealpha($clean, $r, $g, $b, $a);
                imagesetpixel($clean, $x, $y, $pixelColor);
            }
            
            if ($x < $minX) $minX = $x;
            if ($x > $maxX) $maxX = $x;
            if ($y < $minY) $minY = $y;
            if ($y > $maxY) $maxY = $y;
        }
    }
    
    // Crop bounding box
    if ($minX < $maxX && $minY < $maxY) {
        $cropW = $maxX - $minX + 1;
        $cropH = $maxY - $minY + 1;
        
        // Target max height = 80px, max width = 240px
        $targetH = 80;
        $targetW = round($cropW * ($targetH / $cropH));
        if ($targetW > 240) {
            $targetW = 240;
            $targetH = round($cropH * ($targetW / $cropW));
        }
        
        $resized = imagecreatetruecolor($targetW, $targetH);
        imagealphablending($resized, false);
        imagesavealpha($resized, true);
        $transResized = imagecolorallocatealpha($resized, 0, 0, 0, 127);
        imagefilledrectangle($resized, 0, 0, $targetW, $targetH, $transResized);
        
        imagecopyresampled($resized, $clean, 0, 0, $minX, $minY, $targetW, $targetH, $cropW, $cropH);
        
        imagewebp($resized, $dstDir . $name, 90);
        imagedestroy($resized);
    } else {
        // Fallback resize
        imagewebp($clean, $dstDir . $name, 90);
    }
    
    imagedestroy($clean);
    imagedestroy($im);
    
    printf("Optimized %-22s -> %5.1f KB\n", $name, filesize($dstDir . $name)/1024);
}
