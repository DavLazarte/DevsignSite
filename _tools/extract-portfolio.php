<?php
/**
 * Extrae las 6 piezas en base64 de portfolio/index.html y optimiza también
 * las fotos de equipo (david/giuliano) y el logo como WebP livianos.
 */
$root = dirname(__DIR__);
$html = file_get_contents($root . '/portfolio/index.html');
preg_match_all('/data:image\/([a-zA-Z+]+);base64,([A-Za-z0-9+\/=]+)/', $html, $matches, PREG_SET_ORDER);

$outDir = $root . '/assets/img/portfolio';
if (!is_dir($outDir)) {
    mkdir($outDir, 0777, true);
}

foreach ($matches as $i => $m) {
    $num = str_pad((string)($i + 1), 2, '0', STR_PAD_LEFT);
    $raw = base64_decode($m[2]);
    $src = imagecreatefromstring($raw);
    $w = imagesx($src);
    $h = imagesy($src);
    $maxW = 900;

    if ($w > $maxW) {
        $newW = $maxW;
        $newH = (int) round($h * ($maxW / $w));
        $dst = imagecreatetruecolor($newW, $newH);
        imagealphablending($dst, false);
        imagesavealpha($dst, true);
        $transparent = imagecolorallocatealpha($dst, 0, 0, 0, 127);
        imagefilledrectangle($dst, 0, 0, $newW, $newH, $transparent);
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $newW, $newH, $w, $h);
        imagedestroy($src);
        $src = $dst;
        $w = $newW;
        $h = $newH;
    } else {
        imagepalettetotruecolor($src);
        imagealphablending($src, true);
        imagesavealpha($src, true);
    }

    $outPath = $outDir . "/pieza-{$num}.webp";
    imagewebp($src, $outPath, 86);
    imagedestroy($src);
    $kb = round(filesize($outPath) / 1024, 1);
    echo "pieza-{$num}.webp ({$w}x{$h}, {$kb} KB)\n";
}

// Fotos de equipo
$teamDir = $root . '/assets/img/equipo';
if (!is_dir($teamDir)) {
    mkdir($teamDir, 0777, true);
}
foreach (['david', 'giuliano'] as $person) {
    $inFile = $root . "/images/{$person}.png";
    if (!file_exists($inFile)) continue;
    $src = imagecreatefrompng($inFile);
    $w = imagesx($src);
    $h = imagesy($src);
    $newW = 720;
    $newH = (int) round($h * ($newW / $w));
    $dst = imagecreatetruecolor($newW, $newH);
    imagealphablending($dst, false);
    imagesavealpha($dst, true);
    $transparent = imagecolorallocatealpha($dst, 0, 0, 0, 127);
    imagefilledrectangle($dst, 0, 0, $newW, $newH, $transparent);
    imagecopyresampled($dst, $src, 0, 0, 0, 0, $newW, $newH, $w, $h);
    $outPath = $teamDir . "/{$person}.webp";
    imagewebp($dst, $outPath, 85);
    imagedestroy($src);
    imagedestroy($dst);
    $kb = round(filesize($outPath) / 1024, 1);
    echo "equipo/{$person}.webp ({$newW}x{$newH}, {$kb} KB)\n";
}

// Logo optimizado en WebP y PNG redimensionado
$logoIn = $root . '/images/logo.png';
if (file_exists($logoIn)) {
    $src = imagecreatefrompng($logoIn);
    $w = imagesx($src);
    $h = imagesy($src);
    $newW = 480;
    $newH = (int) round($h * ($newW / $w));
    $dst = imagecreatetruecolor($newW, $newH);
    imagealphablending($dst, false);
    imagesavealpha($dst, true);
    $transparent = imagecolorallocatealpha($dst, 0, 0, 0, 127);
    imagefilledrectangle($dst, 0, 0, $newW, $newH, $transparent);
    imagecopyresampled($dst, $src, 0, 0, 0, 0, $newW, $newH, $w, $h);
    $outWebp = $root . '/assets/img/logo.webp';
    imagewebp($dst, $outWebp, 90);
    imagedestroy($src);
    imagedestroy($dst);
    $kb = round(filesize($outWebp) / 1024, 1);
    echo "logo.webp ({$newW}x{$newH}, {$kb} KB)\n";
}
