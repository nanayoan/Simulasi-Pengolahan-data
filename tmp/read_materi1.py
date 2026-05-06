import PyPDF2, sys
sys.stdout.reconfigure(encoding='utf-8')
reader = PyPDF2.PdfReader(r'c:\laragon\www\Simulasi-Pengolahan-data\assets\images\Materi_1_Identifikasi_Data .pdf')
for i, page in enumerate(reader.pages):
    text = page.extract_text()
    if text:
        # Clean up: join broken words
        lines = text.split('\n')
        cleaned = []
        for line in lines:
            stripped = line.strip()
            if stripped:
                cleaned.append(stripped)
        print(f'\n=== PAGE {i+1} ===')
        print(' '.join(cleaned))
