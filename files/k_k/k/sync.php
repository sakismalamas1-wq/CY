<?php
clearstatcache();
header("Cache-Control: no-cache, must-revalidate");
header('Content-Type: application/json');

$tablesFile = 'tables_data.json';
$productsFile = 'menu_data.json'; // Το αρχείο του μενού σου
$licenseFile = 'license.json';   // Το αρχείο της άδειας

// --- POST (SAVE) ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if ($input) {
        if (isset($input['tables'])) {
            file_put_contents($tablesFile, json_encode($input['tables']), LOCK_EX);
        }
        if (isset($input['products'])) {
            file_put_contents($productsFile, json_encode($input['products']), LOCK_EX);
        }
        echo json_encode(["status" => "ok"]);
    }
} 
// --- GET (SYNC) ---
else {
    $response = [];
    
    // ΕΛΕΓΧΟΣ ΑΔΕΙΑΣ
    $is_expired = false;
    if (file_exists($licenseFile)) {
        $lic = json_decode(file_get_contents($licenseFile), true);
        if (date('Y-m-d') > $lic['expire_date']) {
            $is_expired = true;
        }
    } else {
        // Αν δεν υπάρχει το αρχείο license.json, το κλειδώνουμε για σιγουριά
        $is_expired = true; 
    }

    $response['license_error'] = $is_expired;

    if (!$is_expired) {
        $response['tables'] = file_exists($tablesFile) ? json_decode(file_get_contents($tablesFile), true) : new stdClass();
        if (file_exists($productsFile)) {
            $menuData = json_decode(file_get_contents($productsFile), true);
            $response['products'] = $menuData;
            $response['server_products'] = $menuData; 
        }
    }
    
    echo json_encode($response);
}
?>