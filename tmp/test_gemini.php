<?php
require_once __DIR__ . '/../api/config.php';

$ch = curl_init(GEMINI_ENDPOINT);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode([
        'contents' => [['parts' => [['text' => 'Reply with exactly: {"test":"ok"}']]]],
        'generationConfig' => ['maxOutputTokens' => 50, 'responseMimeType' => 'application/json']
    ]),
    CURLOPT_TIMEOUT => 30,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => 0
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
$errno = curl_errno($ch);
curl_close($ch);

$output = "HTTP: $httpCode\nError($errno): $error\nResponse: " . substr($response, 0, 600);
file_put_contents(__DIR__ . '/result.txt', $output);
echo "Done. Check tmp/result.txt";
