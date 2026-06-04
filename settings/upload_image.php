<?php
$targetDir = "images_food/";

if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
}

if(isset($_FILES["image"])) {
    $fileName = basename($_FILES["image"]["name"]);
    $targetFile = $targetDir . $fileName;

    if(move_uploaded_file($_FILES["image"]["tmp_name"], $targetFile)) {
        echo json_encode(["status" => "success", "file" => $fileName]);
    } else {
        echo json_encode(["status" => "error"]);
    }
}
?>