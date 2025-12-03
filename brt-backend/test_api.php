#!/usr/bin/env php
<?php

// Simple test for the API endpoints
$base_url = 'http://127.0.0.1:8003';

echo "=== API ENDPOINTS TEST ===\n\n";

// Test the test endpoint first
echo "1. Testing /api/v1/test endpoint:\n";
$response = file_get_contents($base_url . '/api/v1/test');
echo "Response: " . $response . "\n\n";

// Test register endpoint
echo "2. Testing /api/register endpoint:\n";
$register_data = [
    'name' => 'Test User',
    'email' => 'test@example.com',
    'password' => 'password123',
    'password_confirmation' => 'password123'
];

$options = [
    'http' => [
        'header' => "Content-type: application/json\r\n",
        'method' => 'POST',
        'content' => json_encode($register_data)
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($base_url . '/api/register', false, $context);

if ($result === FALSE) {
    echo "Error: Failed to get response\n";
    echo "HTTP Response Headers:\n";
    print_r($http_response_header);
} else {
    echo "Response: " . $result . "\n";
}

echo "\n=== TEST COMPLETE ===\n";
