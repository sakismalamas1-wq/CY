<?php
$data = json_decode(file_get_contents('php://input'), true);
if (isset($data['report'])) {
    file_put_contents('TOTAL.TXT', $data['report'], FILE_APPEND);
    echo json_encode(["status" => "ok"]);
}
?>