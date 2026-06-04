<?php
// save_settings.php
$json_data = file_get_contents('php://input');

if ($json_data) {
    if (file_put_contents('settings.json', $json_data)) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Could not write to file"]);
    }
}
?>