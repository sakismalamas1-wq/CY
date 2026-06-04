<?php
$data = file_get_contents('php://input');
if($data) {
    file_put_contents('menu_data.json', $data);
    echo "ok";
}
?>