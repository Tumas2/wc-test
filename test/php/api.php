<?php

header("Cache-Control: no-cache, must-revalidate");
header('Content-Type: application/json; charset=utf-8');

// echo json_encode($_SERVER);

parse_str($_SERVER['QUERY_STRING'], $output);

echo json_encode(
    $output
);

// $slug = str_replace("/swc/test/php/api/", "", "{$_SERVER['REQUEST_URI']}");