<?php
/**
 * Devsign — Procesador de Formulario de Contacto
 * Optimizado para hosting DonWeb / Ferozo (PHP 8.x)
 * Destino: admin@devsign.ar
 */

// Si no es POST, redirigir al inicio
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /#contacto', true, 302);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

// Configuración
$destinatario = 'admin@devsign.ar';
$remitente = 'Devsign Web <admin@devsign.ar>';

// Honeypot anti-spam (el campo _gotcha debe estar vacío)
if (!empty($_POST['_gotcha'])) {
    echo json_encode([
        'ok' => true,
        'message' => 'Consulta enviada correctamente.'
    ]);
    exit;
}

// Sanitizar entradas
$nombre   = isset($_POST['nombre']) ? trim(strip_tags($_POST['nombre'])) : '';
$contacto = isset($_POST['whatsapp']) ? trim(strip_tags($_POST['whatsapp'])) : (isset($_POST['contacto']) ? trim(strip_tags($_POST['contacto'])) : '');
$negocio  = isset($_POST['negocio']) ? trim(strip_tags($_POST['negocio'])) : '';
$interes  = isset($_POST['interes']) ? trim(strip_tags($_POST['interes'])) : 'general';

// Detalle según el interés o rubro
$rubro = '';
if (!empty($_POST['rubro'])) {
    $rubro = trim(strip_tags($_POST['rubro']));
} elseif (!empty($_POST['detalle_sistemas'])) {
    $rubro = trim(strip_tags($_POST['detalle_sistemas']));
} elseif (!empty($_POST['detalle_ia'])) {
    $rubro = trim(strip_tags($_POST['detalle_ia']));
} elseif (!empty($_POST['detalle_web'])) {
    $rubro = trim(strip_tags($_POST['detalle_web']));
} elseif (!empty($_POST['detalle_marketing'])) {
    $rubro = trim(strip_tags($_POST['detalle_marketing']));
} elseif (!empty($_POST['detalle_general'])) {
    $rubro = trim(strip_tags($_POST['detalle_general']));
}

$mensaje = isset($_POST['mensaje']) ? trim(strip_tags($_POST['mensaje'])) : '';

// Validación básica
if (empty($nombre) || empty($contacto)) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'error' => 'Por favor completá tu nombre y un medio de contacto (teléfono o email).'
    ]);
    exit;
}

// Etiqueta legible para el interés
$interesLabels = [
    'sistemas'       => 'Sistemas a medida y POS',
    'automatizacion' => 'Automatización y Agentes de IA',
    'web'            => 'Sitios web e Invitaciones digitales',
    'marketing'      => 'Marketing, diseño y redes',
    'general'        => 'Consulta general'
];
$interesLegible = $interesLabels[$interes] ?? 'Consulta general';

// Detectar si el contacto es un email válido para Reply-To
$esEmail = filter_var($contacto, FILTER_VALIDATE_EMAIL);
$replyTo = $esEmail ? $contacto : 'admin@devsign.ar';

// Asunto
$asunto = "=?UTF-8?B?" . base64_encode("[Web Devsign] Nueva consulta: $nombre — $interesLegible") . "?=";

// Fecha y hora (Zona horaria Argentina)
date_default_timezone_set('America/Argentina/Buenos_Aires');
$fechaEnvio = date('d/m/Y H:i:s');
$ipOrigen   = $_SERVER['REMOTE_ADDR'] ?? 'Desconocida';

// Cuerpo HTML del correo
$mensajeHtml  = nl2br(htmlspecialchars($mensaje, ENT_QUOTES, 'UTF-8'));
$rubroHtml    = !empty($rubro) ? htmlspecialchars($rubro, ENT_QUOTES, 'UTF-8') : 'No especificado';
$nombreHtml   = htmlspecialchars($nombre, ENT_QUOTES, 'UTF-8');
$negocioHtml  = !empty($negocio) ? htmlspecialchars($negocio, ENT_QUOTES, 'UTF-8') : 'No especificado';
$contactoHtml = htmlspecialchars($contacto, ENT_QUOTES, 'UTF-8');

$cuerpoHtml = <<<HTML
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Nueva consulta desde devsign.ar</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
    <!-- Cabecera -->
    <tr>
      <td style="padding: 24px 32px; background: linear-gradient(135deg, #0A2540 0%, #0057FF 100%); color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">Devsign · Nueva Consulta Web</h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #00C6FF;">Recibido a través del formulario de devsign.ar</p>
      </td>
    </tr>
    <!-- Datos del interesado -->
    <tr>
      <td style="padding: 28px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; line-height: 1.6;">
          <tr>
            <td style="padding-bottom: 12px; color: #64748b; width: 140px; font-weight: 600;">Nombre:</td>
            <td style="padding-bottom: 12px; color: #0f172a; font-weight: 700; font-size: 15px;">{$nombreHtml}</td>
          </tr>
          <tr>
            <td style="padding-bottom: 12px; color: #64748b; font-weight: 600;">Negocio / Evento:</td>
            <td style="padding-bottom: 12px; color: #334155; font-weight: 600;">{$negocioHtml}</td>
          </tr>
          <tr>
            <td style="padding-bottom: 12px; color: #64748b; font-weight: 600;">Contacto / WhatsApp:</td>
            <td style="padding-bottom: 12px; color: #0057FF; font-weight: 700;">{$contactoHtml}</td>
          </tr>
          <tr>
            <td style="padding-bottom: 12px; color: #64748b; font-weight: 600;">Interés:</td>
            <td style="padding-bottom: 12px; color: #0f172a;">
              <span style="display: inline-block; padding: 3px 10px; background-color: #e0f2fe; color: #0284c7; border-radius: 999px; font-size: 12px; font-weight: 600;">
                {$interesLegible}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 16px; color: #64748b; font-weight: 600;">Rubro / Proyecto:</td>
            <td style="padding-bottom: 16px; color: #334155;">{$rubroHtml}</td>
          </tr>
        </table>

        <!-- Mensaje -->
        <div style="margin-top: 16px; padding: 18px 20px; background-color: #f8fafc; border-left: 4px solid #0057FF; border-radius: 6px;">
          <p style="margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700;">Mensaje:</p>
          <p style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.6;">{$mensajeHtml}</p>
        </div>

        <!-- Pie técnico -->
        <p style="margin: 24px 0 0 0; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
          Enviado el {$fechaEnvio} desde la IP {$ipOrigen}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;

// Encabezados MIME para DonWeb / Ferozo
$cabeceras = [];
$cabeceras[] = "From: {$remitente}";
$cabeceras[] = "Reply-To: {$replyTo}";
$cabeceras[] = "MIME-Version: 1.0";
$cabeceras[] = "Content-Type: text/html; charset=UTF-8";
$cabeceras[] = "X-Mailer: PHP/" . phpversion();

$cabecerasStr = implode("\r\n", $cabeceras);

// Intentar envío
$enviado = @mail($destinatario, $asunto, $cuerpoHtml, $cabecerasStr);

// En entorno local (Laragon sin sendmail configurado) o si mail() retorna false
// Devolvemos 200 para que el frontend maneje la confirmación, pero informamos si falló
if ($enviado || str_contains($_SERVER['HTTP_HOST'] ?? '', 'devsign.test') || str_contains($_SERVER['HTTP_HOST'] ?? '', 'localhost')) {
    echo json_encode([
        'ok' => true,
        'message' => '¡Gracias! Recibimos tu consulta y te responderemos a la brevedad.'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'No pudimos enviar el mensaje por correo en este momento. Por favor escribinos directamente por WhatsApp.'
    ]);
}
