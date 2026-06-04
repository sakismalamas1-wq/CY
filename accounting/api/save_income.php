<?php

$file = "../data/income.json";

$data = json_decode(file_get_contents("php://input"), true);

$current = [];

if(file_exists($file)){
    $current = json_decode(file_get_contents($file), true);
}

$current[] = $data;

file_put_contents(
    $file,
    json_encode($current, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
);

echo json_encode([
    "status"=>"ok"
]);