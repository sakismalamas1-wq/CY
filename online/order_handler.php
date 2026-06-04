<?php
// order_handler.php

// 1. Παίρνουμε τα δεδομένα που έστειλε το cart.js
$json_data = file_get_contents('php://input');
$order = json_decode($json_data, true);

if ($order) {
    // 2. Ορίζουμε πού θα αποθηκεύονται οι παραγγελίες
    // Θα τις βάλουμε σε έναν φάκελο "web_orders" για να τις βρίσκει εύκολα το POS
    $folder = '../web_orders';
    if (!is_dir($folder)) {
        mkdir($folder, 0777, true);
    }

    // 3. Φτιάχνουμε ένα μοναδικό όνομα αρχείου (π.χ. order_171456789.json)
    $filename = $folder . '/order_' . time() . '.json';

    // 4. Αποθηκεύουμε την παραγγελία
    if (file_put_contents($filename, $json_data)) {
        echo json_encode(["status" => "success", "message" => "Order saved"]);
    } else {
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(["status" => "error", "message" => "Could not save order"]);
    }
} else {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(["status" => "error", "message" => "Invalid data"]);
}
?>