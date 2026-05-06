import PyPDF2, sys
sys.stdout.reconfigure(encoding='utf-8')
pdfs = [
    ('Materi_2_Validasi_Data.pdf', 'VALIDASI'),
    ('Materi_3_Verifikasi_Data.pdf', 'VERIFIKASI'),
    ('Materi_4_Pembersihan_Data .pdf', 'PEMBERSIHAN'),
]
for fname, label in pdfs:
    path = rf'c:\laragon\www\Simulasi-Pengolahan-data\assets\images\{fname}'
    reader = PyPDF2.PdfReader(path)
    print(f'\n{"#"*60}')
    print(f'# {label} ({len(reader.pages)} pages)')
    print(f'{"#"*60}')
    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        if text:
            lines = [l.strip() for l in text.split('\n') if l.strip()]
            print(f'\n=== PAGE {i+1} ===')
            print(' '.join(lines))
