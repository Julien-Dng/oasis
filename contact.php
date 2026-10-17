<?php
/**
 * Oasis Web Agency — traitement du formulaire de contact.
 * Hébergement OVH mutualisé (PHP + fonction mail()).
 *
 * - Répond en JSON aux envois AJAX (fetch depuis contact.html)
 * - Repli HTML pour les navigateurs sans JavaScript
 * - Validation + limites de taille
 * - Anti-spam : honeypot, jeton JavaScript + délai minimum de saisie,
 *   limitation par IP, filtres de contenu (liens, alphabets, mots-clés)
 */

// ------- Configuration -------
$TO      = 'contact@oasiswebagency.com';   // destinataire des messages
$FROM    = 'contact@oasiswebagency.com';   // doit être une adresse de VOTRE domaine (OVH)
$SUBJECT = 'Nouveau message depuis oasiswebagency.com';

// Anti-spam
$MIN_SECONDS   = 4;       // délai minimum entre l'affichage du formulaire et l'envoi
$MAX_SECONDS   = 86400;   // un formulaire ouvert depuis plus de 24h est refusé
$RATE_SHORT    = 3;       // envois max par IP sur 10 minutes
$RATE_DAY      = 8;       // envois max par IP sur 24 heures
$MAX_LINKS     = 2;       // nombre de liens max dans le message
$SPAM_WORDS    = array(   // mots-clés typiques du spam (insensible à la casse)
    'viagra', 'cialis', 'casino', 'porn', 'xxx', 'escort', 'sex dating', 'bitcoin',
    'forex', 'binary option', 'payday loan', 'guest post', 'rank your website',
    'first page of google', 'whatsapp me', 'unsubscribe',
);
$RATE_DIR      = __DIR__ . '/.antispam'; // stockage des compteurs (protégé par .htaccess)

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
       . '<h1>' . $title . '</h1><p>' . $msg . '</p><a href="/">Retour à l\'accueil</a></div></body></html>';
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

// ------- Jeton JavaScript + délai de saisie -------
// Le champ "t" est rempli par assets/app.js au chargement de la page :
// les robots qui postent directement sur contact.php ne l'ont pas.
$t = isset($_POST['t']) ? (int) $_POST['t'] : 0;
if ($t <= 0) {
    respond(false, 'Merci d\'activer JavaScript pour envoyer le formulaire.');
}
$elapsed = time() - (int) floor($t / 1000);
if ($elapsed < $MIN_SECONDS || $elapsed > $MAX_SECONDS) {
    respond(true); // envoi trop rapide (robot) ou jeton périmé : on ignore en silence
}

// ------- Limitation par IP -------
function rate_limited($dir, $short, $day) {
    $ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'inconnu';
    if (!is_dir($dir) && !@mkdir($dir, 0700, true)) return false; // pas de stockage : on n'empêche pas l'envoi
    if (!file_exists($dir . '/.htaccess')) {
        @file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n");
    }
    $file = $dir . '/' . hash('sha256', $ip) . '.json';
    $now  = time();
    $fp   = @fopen($file, 'c+');
    if (!$fp) return false;
    flock($fp, LOCK_EX);
    $hits = json_decode(stream_get_contents($fp), true);
    $hits = is_array($hits) ? array_filter($hits, function ($ts) use ($now) { return $ts > $now - 86400; }) : array();
    $recent = count(array_filter($hits, function ($ts) use ($now) { return $ts > $now - 600; }));
    $blocked = $recent >= $short || count($hits) >= $day;
    if (!$blocked) $hits[] = $now;
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode(array_values($hits)));
    flock($fp, LOCK_UN);
    fclose($fp);
    // Nettoyage occasionnel des fichiers anciens
    if (mt_rand(1, 50) === 1) {
        foreach ((array) glob($dir . '/*.json') as $f) {
            if (@filemtime($f) < $now - 86400) @unlink($f);
        }
    }
    return $blocked;
}
if (rate_limited($RATE_DIR, $RATE_SHORT, $RATE_DAY)) {
    respond(false, 'Trop de messages envoyés depuis votre connexion. Merci de réessayer plus tard.');
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
if (mb_strlen(trim($message)) < 10) {
    respond(false, 'Votre message est un peu court : décrivez-nous votre projet en quelques mots.');
}

// ------- Filtres de contenu anti-spam (rejet silencieux) -------
function looks_like_spam($nom, $entreprise, $message, $max_links, $words) {
    $link = '~(https?://|www\.|\[url|<a\s)~i';
    // Pas de lien dans le nom ou l'entreprise
    if (preg_match($link, $nom) || preg_match($link, $entreprise)) return true;
    // Trop de liens dans le message, ou balises BBCode / HTML de lien
    if (preg_match_all('~(https?://|www\.)~i', $message) > $max_links) return true;
    if (preg_match('~\[url|\[link|<a\s+href~i', $message)) return true;
    // Alphabets jamais utilisés par nos clients (cyrillique, chinois/japonais, coréen)
    if (preg_match('/[\p{Cyrillic}\p{Han}\p{Hiragana}\p{Katakana}\p{Hangul}]/u', $nom . $entreprise . $message)) return true;
    // Mots-clés de spam
    $haystack = mb_strtolower($nom . ' ' . $entreprise . ' ' . $message);
    foreach ($words as $w) {
        if (strpos($haystack, $w) !== false) return true;
    }
    return false;
}
if (looks_like_spam($nom, $entreprise, $message, $MAX_LINKS, $SPAM_WORDS)) {
    respond(true); // on fait comme si tout allait bien pour ne pas renseigner le robot
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
