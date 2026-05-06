import PyPDF2
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

pdf_dir = r'c:\laragon\www\Simulasi-Pengolahan-data\assets\images'
pdfs = [
    'Materi_1_Identifikasi_Data .pdf',
    'Materi_2_Validasi_Data.pdf',
    'Materi_3_Verifikasi_Data.pdf',
    'Materi_4_Pembersihan_Data .pdf'
]

for pdf_name in pdfs:
    path = os.path.join(pdf_dir, pdf_name)
    try:
        reader = PyPDF2.PdfReader(path)
        print(f'\n{"="*60}')
        print(f'FILE: {pdf_name}')
        print(f'Pages: {len(reader.pages)}')
        print(f'{"="*60}')
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            print(f'\n--- Page {i+1} ---')
            print(text if text else '(no text extracted)')
    except Exception as e:
        print(f'Error reading {pdf_name}: {e}')
