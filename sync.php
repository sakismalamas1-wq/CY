<?php
clearstatcache();
header("Cache-Control: no-cache, must-revalidate");
header('Content-Type: application/json');

$tablesFile = 'tables_data.json';
// Εδώ ορίζουμε το αρχείο που περιέχει το μενού σου
$productsFile = 'menu_data.json'; 

// --- POST (SAVE) ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if ($input) {
        // 1. Αποθήκευση Τραπεζιών
        if (isset($input['tables'])) {
            file_put_contents($tablesFile, json_encode($input['tables']), LOCK_EX);
        }
        // 2. Αποθήκευση προϊόντων
        if (isset($input['products'])) {
            file_put_contents($productsFile, json_encode($input['products']), LOCK_EX);
        }
        echo json_encode(["status" => "ok"]);
    }
} 
// --- GET (SYNC) ---
else {
    $response = [];
    
    // Φόρτωση Τραπεζιών
    if (file_exists($tablesFile)) {
        $response['tables'] = json_decode(file_get_contents($tablesFile), true);
    } else {
        $response['tables'] = new stdClass();
    }
	
	// Μέσα στο sync.php, εκεί που λαμβάνεις τα δεδομένα:
$data = json_decode(file_get_contents('php://input'), true);
if ($data && isset($data['products'])) {
    // Αυτό δημιουργεί το αρχείο που χρειάζεται το site!
    file_put_contents('tables_data.json', json_encode($data));
}

    // Φόρτωση Προϊόντων
    if (file_exists($productsFile)) {
        $menuData = json_decode(file_get_contents($productsFile), true);
        // Στέλνουμε τα προϊόντα και με τα δύο ονόματα για να δουλεύουν POS και PDA
        $response['products'] = $menuData;        // Για το POS
        $response['server_products'] = $menuData; // Για το PDA
    } else {
        $response['products'] = [];
        $response['server_products'] = [];
    }
    
    echo json_encode($response);
}
?>