<?php
/**
 * Oasis Web Agency — traitement du formulaire de contact.
 * Hébergement OVH mutualisé (PHP + fonction mail()).
 *
 * - Répond en JSON aux envois AJAX (fetch depuis contact.html)
 * - Repli HTML pour les navigateurs sans JavaScript
 * - Validation + honeypot anti-spam + limites de taille
 */

// ------- Configuration -------
$TO      = 'contact@oasiswebagency.com';   // destinataire des messages
$FROM    = 'contact@oasiswebagency.com';   // doit être une adresse de VOTRE domaine (OVH)
$SUBJECT = 'Nouveau message depuis oasiswebagency.com';

// ------- Utilitaires -------
function is_ajax() {
    return (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'fetch')
        || (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false);
}
function respond($ok, $error = '') {
    if (is_ajax()) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(array('ok' => $ok, 'error' => $error));
        exit;
    }
    // Repli HTML (sans JavaScript)
    header('Content-Type: text/html; charset=utf-8');
    $title = $ok ? 'Message envoyé' : 'Erreur';
    $msg   = $ok
        ? "Merci pour votre message. Nous revenons vers vous sous 48h."
        : ("Votre message n'a pas pu être envoyé. " . htmlspecialchars($error, ENT_QUOTES, 'UTF-8') . " Vous pouvez nous écrire directement à contact@oasiswebagency.com.");
    echo '<!doctype html><html lang="fr"><head><meta charset="utf-8">'
       . '<meta name="viewport" content="width=device-width,initial-scale=1"><title>' . $title . ' — Oasis</title>'
       . '<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0B0A08;color:#F4EFE6;'
       . 'font-family:system-ui,-apple-system,sans-serif;text-align:center;padding:24px}'
       . '.c{max-width:440px}h1{font-size:1.8rem;margin:0 0 12px}p{color:#A79E8C;line-height:1.6}'
       . 'a{display:inline-block;margin-top:24px;background:#2DD4BF;color:#05201C;text-decoration:none;'
       . 'font-weight:600;padding:13px 24px;border-radius:11px}</style></head><body><div class="c">'
       . '<h1>' . $title . '</h1><p>' . $msg . '</p><a href="index.html">Retour à l\'accueil</a></div></body></html>';
    exit;
}

// ------- Méthode -------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Méthode non autorisée.');
}

// ------- Honeypot anti-spam (champ caché "website") -------
if (!empty($_POST['website'])) {
    // Un bot a rempli le piège : on fait comme si tout allait bien, sans envoyer.
    respond(true);
}

// ------- Récupération & nettoyage -------
function clean($k, $max = 5000) {
    $v = isset($_POST[$k]) ? trim($_POST[$k]) : '';
    $v = str_replace(array("\r", "\n"), array('', ' '), $v); // anti-injection d'en-têtes
    return mb_substr($v, 0, $max);
}
$nom        = clean('nom', 120);
$email      = clean('email', 180);
$entreprise = clean('entreprise', 160);
$service    = clean('service', 120);
$message    = isset($_POST['message']) ? mb_substr(trim($_POST['message']), 0, 8000) : '';

// ------- Validation -------
if ($nom === '' || $email === '' || trim($message) === '') {
    respond(false, 'Merci de remplir les champs obligatoires.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, "L'adresse email n'est pas valide.");
}

// ------- Construction de l'email -------
$body  = "Nouveau message depuis le site oasiswebagency.com\n";
$body .= "----------------------------------------------\n\n";
$body .= "Nom        : $nom\n";
$body .= "Email      : $email\n";
$body .= "Entreprise : " . ($entreprise !== '' ? $entreprise : '—') . "\n";
$body .= "Service    : " . ($service !== '' ? $service : '—') . "\n\n";
$body .= "Message :\n$message\n\n";
$body .= "----------------------------------------------\n";
$body .= "Envoyé le " . date('d/m/Y à H:i') . " depuis " . (isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'inconnu') . "\n";

$headers  = 'From: Oasis Web Agency <' . $FROM . ">\r\n";
$headers .= 'Reply-To: ' . $nom . ' <' . $email . ">\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=utf-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";

$subject = '=?UTF-8?B?' . base64_encode($SUBJECT) . '?='; // sujet accentué correct

// ------- Envoi (le 5e paramètre fixe l'expéditeur d'enveloppe, requis chez OVH) -------
$sent = @mail($TO, $subject, $body, $headers, '-f' . $FROM);

if ($sent) {
    respond(true);
} else {
    respond(false, "L'envoi a échoué côté serveur.");
}
