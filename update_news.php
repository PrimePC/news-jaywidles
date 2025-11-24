<?php
// update_news.php

// Security: Replace this with a long random string
$secret_key = "YOUR_SECRET_API_KEY_HERE";

// Get headers
$headers = getallheaders();
$auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';

// Check API Key
if ($auth_header !== "Bearer " . $secret_key) {
    http_response_code(403);
    die("Unauthorized");
}

// Get POST data
$json_input = file_get_contents('php://input');
$data = json_decode($json_input, true);

if ($data) {
    // Save to a static JSON file that index.html can read
    file_put_contents('news_data.json', json_encode($data, JSON_PRETTY_PRINT));
    echo "News updated successfully at " . date('Y-m-d H:i:s');
} else {
    http_response_code(400);
    echo "Invalid JSON data";
}
?>