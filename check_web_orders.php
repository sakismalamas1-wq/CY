<?php
// check_web_orders.php
header('Content-Type: application/json');

$folder = 'web_orders'; // Ο φάκελος που αποθηκεύει ο order_handler.php
$new_orders = [];

if (is_dir($folder)) {
    // Διαβάζουμε όλα τα αρχεία .json μέσα στον φάκελο
    $files = glob($folder . '/*.json');
    
    foreach ($files as $file) {
        $content = file_get_contents($file);
        $new_orders[] = json_decode($content, true);
        
        // ΠΡΟΑΙΡΕΤΙΚΟ: Μπορείς να μετακινείς το αρχείο σε έναν φάκελο "processed" 
        // για να μην χτυπάει συνέχεια το alert.
        // rename($file, $folder . '/processed/' . basename($file));
    }
}

echo json_encode($new_orders);
?>