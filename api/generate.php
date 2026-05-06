<?php
/* ============================================
   DATA SIM — AI Question Generator Endpoint
   Calls Gemini 2.0 Flash to generate questions
   for all 4 simulation levels at once.
   ============================================ */

require_once __DIR__ . '/config.php';

// CORS + headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

// Parse input
$input = json_decode(file_get_contents('php://input'), true);
$template = $input['template'] ?? 'standar';
$customPrompt = $input['customPrompt'] ?? '';

// Build prompt
$prompt = buildPrompt($template, $customPrompt);

// Call Gemini with retry
$result = callGeminiWithRetry($prompt);

if ($result === null) {
    global $lastError;
    jsonResponse([
        'error' => 'Gagal menghubungi AI setelah beberapa percobaan. Silakan coba lagi.',
        'debug' => $lastError ?? 'unknown'
    ], 500);
}

jsonResponse(['success' => true, 'data' => $result]);

/* ============================================
   Build the Gemini prompt based on template
   ============================================ */
function buildPrompt($template, $customPrompt) {
    $templateInstructions = [
        'standar' => 'Buat data siswa dengan kesalahan umum yang bervariasi: format nama salah, NIS duplikat, tanggal format salah, kelas typo, nomor telepon kurang digit. Tingkat kesulitan sedang.',
        'menantang' => 'Buat data siswa dengan banyak kesalahan tersembunyi dan sulit dideteksi: kesalahan halus seperti spasi ganda, angka mirip huruf, format hampir benar tapi salah, duplikat yang tidak jelas. Tingkat kesulitan tinggi.',
        'duplikat' => 'Fokuskan pada masalah duplikasi data: buat beberapa baris yang merupakan duplikat persis, duplikat dengan variasi kecil (typo nama), dan NIS yang sama untuk siswa berbeda. Minimal 3 kasus duplikat.',
        'khusus' => 'Buat data siswa dengan variasi kesalahan berdasarkan instruksi tambahan dari pengguna.'
    ];

    $instruction = $templateInstructions[$template] ?? $templateInstructions['standar'];
    $customPart = $customPrompt ? "\n\nInstruksi tambahan dari pengguna: $customPrompt" : '';

    return <<<PROMPT
Kamu adalah generator soal untuk simulasi pengolahan data siswa SMA/SMK. Buat data untuk 4 level simulasi sekaligus.

KONTEKS: Data yang dihasilkan adalah data siswa dengan kolom: nama, nis (7 digit), tgl_lahir (format DD/MM/YYYY), kelas (format X-TKJ, X-RPL, dll), no_telp (10-12 digit diawali 08).

INSTRUKSI TEMPLATE: {$instruction}{$customPart}

HASILKAN JSON DENGAN FORMAT TEPAT BERIKUT (TANPA MARKDOWN, TANPA KOMENTAR, HANYA JSON MURNI):

{
  "level1": {
    "rows": [
      BUAT TEPAT 10 BARIS. Setiap baris:
      {
        "nama": "string",
        "nis": "string 7 digit",
        "tgl_lahir": "DD/MM/YYYY",
        "kelas": "string",
        "no_telp": "string",
        "errors": { "nama": boolean, "nis": boolean, "tgl_lahir": boolean, "kelas": boolean, "no_telp": boolean },
        "errorTypes": { HANYA field yang error: "fieldname": "penjelasan singkat kesalahan" }
      }
      ATURAN: Minimal 5 baris memiliki error (error = true di salah satu field). Minimal 3 baris tanpa error sama sekali.
    ]
  },
  "level2": [
    BUAT TEPAT 7 ITEM. Setiap item:
    {
      "nama": "string",
      "nis": "string",
      "tgl_lahir": "DD/MM/YYYY atau format salah",
      "kelas": "string",
      "no_telp": "string",
      "issues": ["valid"] ATAU kombinasi dari ["format", "lengkap", "nomor"],
      "errorDetails": ["penjelasan untuk setiap issue"]
    }
    ATURAN ISSUES:
    - "valid" = semua data benar (gunakan sendiri, tidak boleh dikombinasi)
    - "format" = ada format penulisan yang salah (nama ada angka, tanggal format salah, kelas tanpa strip)
    - "lengkap" = ada kolom kosong/tidak terisi
    - "nomor" = nomor telepon atau NIS formatnya salah (terlalu pendek, mengandung huruf, dll)
    - Satu data bisa punya lebih dari 1 issue (misal ["format", "nomor"])
    - Minimal 2 data harus "valid", sisanya campuran issues
  ],
  "level3": [
    BUAT TEPAT 6 ITEM. Setiap item:
    {
      "inputData": { "nama": "string", "nis": "string", "tgl_lahir": "string", "kelas": "string", "no_telp": "string" },
      "refData": { "nama": "string", "nis": "string", "tgl_lahir": "string", "kelas": "string", "no_telp": "string" },
      "correctAnswer": "benar" | "perbaikan" | "tidak-bisa",
      "explanation": "penjelasan mengapa jawaban ini benar"
    }
    ATURAN:
    - "benar" = inputData cocok 100% dengan refData (minimal 2 item)
    - "perbaikan" = ada perbedaan antara inputData dan refData (minimal 2 item)
    - "tidak-bisa" = refData memiliki data yang tidak jelas/ambigu ATAU inputData dan refData sama-sama bermasalah (minimal 1 item)
    - Untuk "perbaikan": buat perbedaan yang jelas terlihat di field tertentu
  ],
  "level4": [
    BUAT TEPAT 9 ITEM. Setiap item:
    {
      "no": nomor_urut,
      "input": { "nama": "string", "nis": "string", "tgl": "string", "kelas": "string", "notelp": "string" },
      "ref": { "nama": "string", "nis": "string", "tgl": "string", "kelas": "string", "notelp": "string" } ATAU null,
      "correctStatus": "bersih" | "diedit" | "dihapus" | "ditandai",
      "correctEdits": { HANYA field yang perlu diedit: "fieldname": "nilai_benar" } ATAU null,
      "explanation": "penjelasan mengapa status ini benar"
    }
    ATURAN STATUS:
    - "bersih" = input cocok dengan ref, semua benar (minimal 2 item)
    - "diedit" = input berbeda dari ref, perlu diedit ke nilai ref (minimal 3 item). correctEdits berisi field yang salah dan nilai benarnya
    - "dihapus" = data duplikat dengan baris lain (minimal 1 item). ref sama dengan baris yang diduplikasi
    - "ditandai" = ref adalah null (tidak ada referensi). Tepat 1 item saja
    PERHATIAN field level4: "tgl" bukan "tgl_lahir", "notelp" bukan "no_telp". Ini BERBEDA dari level 1-3.
  ]
}

ATURAN PENTING:
1. Gunakan nama Indonesia yang realistis (Andi, Budi, Citra, Dewi, Eko, Fani, Gita, Hendra, Indah, Joko, dll)
2. NIS harus format 7 digit dimulai dari 2024xxx
3. Tanggal lahir realistis untuk siswa SMA (tahun 2006-2010) 
4. Kelas yang valid: X-TKJ, X-RPL, X-TB, X-MM, XI-TKJ, XI-RPL
5. Nomor telepon Indonesia diawali 08, panjang 10-12 digit
6. Untuk data yang SALAH, buat kesalahannya bervariasi dan menarik untuk dipelajari
7. HANYA output JSON murni. TIDAK ada markdown, tidak ada backtick, tidak ada penjelasan tambahan
8. Pastikan JSON valid dan bisa di-parse
PROMPT;
}

/* ============================================
   Call Gemini API with retry logic
   ============================================ */
function callGeminiWithRetry($prompt) {
    for ($i = 0; $i < MAX_RETRIES; $i++) {
        $result = callGemini($prompt);
        if ($result !== null) return $result;
        if ($i < MAX_RETRIES - 1) sleep(RETRY_DELAY_SECONDS);
    }
    return null;
}

function callGemini($prompt) {
    global $lastError;
    
    $payload = json_encode([
        'contents' => [
            ['parts' => [['text' => $prompt]]]
        ],
        'generationConfig' => [
            'temperature' => 0.8,
            'topP' => 0.95,
            'maxOutputTokens' => 8192,
            'responseMimeType' => 'application/json'
        ]
    ]);

    $ch = curl_init(GEMINI_ENDPOINT);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_TIMEOUT => 60,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => 0
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        $lastError = "cURL Error: $error";
        error_log("Gemini cURL Error: $error");
        return null;
    }

    if ($httpCode === 429) {
        $lastError = "Rate Limited (429)";
        error_log("Gemini Rate Limited (429)");
        return null;
    }

    if ($httpCode !== 200) {
        $lastError = "HTTP $httpCode: " . substr($response, 0, 300);
        error_log("Gemini HTTP Error: $httpCode — $response");
        return null;
    }

    $data = json_decode($response, true);
    $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;

    if (!$text) {
        error_log("Gemini: No text in response");
        return null;
    }

    // Clean up: remove any markdown code blocks if present
    $text = preg_replace('/^```json\s*/i', '', $text);
    $text = preg_replace('/\s*```$/i', '', $text);
    $text = trim($text);

    $parsed = json_decode($text, true);
    if (!$parsed) {
        error_log("Gemini: Invalid JSON response — " . substr($text, 0, 200));
        return null;
    }

    // Validate structure
    if (!isset($parsed['level1']) || !isset($parsed['level2']) || 
        !isset($parsed['level3']) || !isset($parsed['level4'])) {
        error_log("Gemini: Missing level keys in response");
        return null;
    }

    return $parsed;
}
