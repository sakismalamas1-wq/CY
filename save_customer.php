<?php
$data = json_decode(file_get_contents('php://input'), true);
if (!$data) exit;

$file = 'customers.json';
$customers = json_decode(file_get_contents($file), true) ?: [];

// Έλεγχος αν υπάρχει ήδη το τηλέφωνο για να το ενημερώσουμε αντί να το διπλοεγγράψουμε
$found = false;
foreach ($customers as &$c) {
    if ($c['phone'] === $data['phone']) {
        $c = $data;
        $found = true;
        break;
    }
}

if (!$found) {
    $customers[] = $data;
}

file_put_contents($file, json_encode($customers, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
echo json_encode(["status" => "ok"]);
?>