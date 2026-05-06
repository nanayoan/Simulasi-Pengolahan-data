/* ============================================
   DATA SIM — Algorithmic Question Generator
   Generates random questions for all 4 levels
   WITHOUT requiring any AI API.
   ============================================ */

const QuestionGenerator = (() => {

    /* ============================
       DATA POOLS
       ============================ */
    const NAMA_DEPAN = [
        'Andi', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fani', 'Gita', 'Hendra',
        'Indah', 'Joko', 'Kartika', 'Lina', 'Mira', 'Nadia', 'Oscar',
        'Putri', 'Rahma', 'Sari', 'Taufik', 'Umi', 'Vina', 'Wati',
        'Yusuf', 'Zahra', 'Agus', 'Bayu', 'Dian', 'Eka', 'Firman',
        'Galih', 'Hani', 'Irfan', 'Jasmine', 'Kiki', 'Luthfi', 'Maya'
    ];

    const NAMA_BELAKANG = [
        'Wijaya', 'Santoso', 'Lestari', 'Sartika', 'Prasetyo', 'Rahayu',
        'Kusuma', 'Permana', 'Hidayat', 'Nugraha', 'Saputra', 'Maharani',
        'Utami', 'Ramadhan', 'Setiawan', 'Anggraeni', 'Purnama', 'Wibowo',
        'Hartono', 'Susanto', 'Cahyani', 'Fitriani', 'Aditya', 'Handayani',
        'Kurniawan', 'Safitri', 'Budiman', 'Indrawati', 'Pratama', 'Suharto'
    ];

    const KELAS_VALID = [
        'X-TKJ', 'X-RPL', 'X-TB', 'X-MM',
        'XI-TKJ', 'XI-RPL', 'XI-TB', 'XI-MM',
        'XII-TKJ', 'XII-RPL', 'XII-TB', 'XII-MM'
    ];

    const KELAS_SALAH = [
        // Tanpa tanda hubung / format salah
        'XTKJ', 'XRPL', 'XTB', 'XMM',
        'XITKJ', 'XIRPL', 'XITB', 'XIMM',
        // Spasi tidak konsisten
        'X TKJ', 'X  TKJ', 'XI TKJ', 'XII TKJ',
        'X RPL', 'XI RPL', 'XII RPL',
        // Huruf kecil / campuran
        'x-tkj', 'xi-rpl', 'xii-mm',
        'x tkj', 'xi tkj', 'x-Tkj', 'Xi-rpl',
        // Typo umum
        'X-TKJJ', 'X-RPLL', 'X-MMM',
        'XI-TK', 'XII-RP', 'X-TBB',
        // Karakter tidak valid
        'X_TKJ', 'XI/TKJ', 'X.TKJ', 'XII_RPL',
        // Format terbalik
        'TKJ-X', 'RPL-XI', 'MM-XII', 'TB-X',
        // Spasi di awal/akhir
        ' X-TKJ', 'X-TKJ ', ' XI-RPL ',
        // Kombinasi aneh
        '10-TKJ', 'XI-123', 'KELAS X TKJ', 'XII TKJ 1'
    ];

    const BULAN = ['01','02','03','04','05','06','07','08','09','10','11','12'];
    const TAHUN_LAHIR = ['2006', '2007', '2008', '2009', '2010'];

    /* ============================
       UTILITY FUNCTIONS
       ============================ */
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function pickN(arr, n) {
        const shuffled = [...arr].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, n);
    }
    function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
    function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

    function generateNIS(base, index) {
        return String(base + index).padStart(7, '0');
    }

    function generateValidDate() {
        const d = String(randInt(1, 28)).padStart(2, '0');
        const m = pick(BULAN);
        const y = pick(TAHUN_LAHIR);
        return `${d}/${m}/${y}`;
    }

    function generateValidPhone() {
        const prefixes = ['0812', '0813', '0852', '0857', '0878', '0819', '0859', '0858'];
        const prefix = pick(prefixes);
        const rest = String(randInt(1000000, 99999999)).padStart(8, '0').slice(0, randInt(6, 8));
        return prefix + rest;
    }

    function generateName() {
        return pick(NAMA_DEPAN) + ' ' + pick(NAMA_BELAKANG);
    }

    /* ============================
       ERROR GENERATORS
       ============================ */
    function corruptName(name) {
        const parts = name.split(' ');
        const first = parts[0] || 'Nama';
        const last = parts[1] || 'Siswa';
        const methods = [
            () => first + randInt(10, 999),                              // "Andi123" (no space, + angka)
            () => first + randInt(1, 9) + ' ' + last,                   // "Andi3 Wijaya"
            () => name.toLowerCase(),                                    // "andi wijaya"
            () => first.charAt(0).toLowerCase() + first.slice(1) + ' ' + last, // "andi Wijaya" (huruf kecil awal)
            () => first + '.' + last,                                    // "Andi.Wijaya" (titik bukan spasi)
        ];
        return pick(methods)();
    }

    function corruptDate(date) {
        const p = date.split('/');
        const methods = [
            () => `${p[2]}-${p[1]}-${p[0]}`,                           // YYYY-MM-DD (jelas berbeda)
            () => `${p[0]}-${p[1]}-${p[2]}`,                           // DD-MM-YYYY (dash bukan slash)
            () => `${p[0]}/${p[1]}/${p[2].slice(2)}`,                   // DD/MM/YY (tahun 2 digit)
            () => `${p[1]}/${p[0]}/${p[2]}`,                            // bulan/hari tertukar (hanya jika hasilnya jelas beda)
        ];
        // Pastikan MM/DD swap hanya digunakan jika hasilnya JELAS berbeda dari asli
        // (jika hari > 12 maka swap akan terlihat jelas karena bulan > 12)
        const day = parseInt(p[0]);
        if (day <= 12) {
            // Hari ≤ 12: swap bisa terlihat sama, hapus opsi swap
            methods.pop();
        }
        return pick(methods)();
    }

    function corruptPhone(phone) {
        const methods = [
            () => phone.slice(0, randInt(5, 8)),                      // too short
            () => phone + String(randInt(100, 999)),                   // too long
            () => phone.slice(0, 4) + 'xx' + phone.slice(6),         // contains letters
            () => '62' + phone.slice(1),                               // wrong prefix
        ];
        return pick(methods)();
    }

    function corruptKelas() { return pick(KELAS_SALAH); }

    /* ============================
       LEVEL 1: IDENTIFIKASI
       ============================ */
    function generateLevel1(config) {
        const { totalRows = 10, minErrors = 5, minClean = 3 } = config;
        const nisBase = 2024000 + randInt(1, 100);
        const rows = [];
        const names = [];

        // Generate all clean rows first
        for (let i = 0; i < totalRows; i++) {
            const name = generateName();
            names.push(name);
            rows.push({
                nama: name,
                nis: generateNIS(nisBase, i + 1),
                tgl_lahir: generateValidDate(),
                kelas: pick(KELAS_VALID),
                no_telp: generateValidPhone(),
                errors: { nama: false, nis: false, tgl_lahir: false, kelas: false, no_telp: false },
                errorTypes: {}
            });
        }

        // Determine which rows get errors
        const errorCount = Math.max(minErrors, totalRows - minClean);
        const indices = shuffle([...Array(totalRows).keys()]);
        const errorIndices = indices.slice(0, errorCount);

        // Available error types
        const errorFunctions = [
            (row) => {
                const original = row.nama;
                row.nama = corruptName(original);
                row.errors.nama = true;
                row.errorTypes.nama = 'Nama mengandung karakter tidak valid';
            },
            (row) => {
                row.tgl_lahir = corruptDate(row.tgl_lahir);
                row.errors.tgl_lahir = true;
                row.errorTypes.tgl_lahir = 'Format tanggal tidak konsisten';
            },
            (row) => {
                row.no_telp = corruptPhone(row.no_telp);
                row.errors.no_telp = true;
                row.errorTypes.no_telp = 'Nomor telepon tidak valid';
            },
            (row) => {
                row.kelas = corruptKelas();
                row.errors.kelas = true;
                row.errorTypes.kelas = 'Format kelas tidak konsisten';
            },
            (row, idx, allRows) => {
                // NIS duplicate — mark BOTH rows as error
                const otherIdx = indices.find(i => i !== idx && !errorIndices.includes(i));
                if (otherIdx !== undefined) {
                    row.nis = allRows[otherIdx].nis;
                    row.errors.nis = true;
                    row.errorTypes.nis = 'NIS duplikat dengan data lain';
                    // Also mark the source row as duplicate error
                    allRows[otherIdx].errors.nis = true;
                    allRows[otherIdx].errorTypes.nis = 'NIS duplikat dengan data lain';
                }
            },
            (row) => {
                row.nis = '';
                row.errors.nis = true;
                row.errorTypes.nis = 'NIS kosong';
            }
        ];

        // Apply errors
        errorIndices.forEach((idx, i) => {
            const fn = errorFunctions[i % errorFunctions.length];
            fn(rows[idx], idx, rows);

            // For "sulit" mode, add extra errors to some rows
            if (config.difficulty === 'sulit' && Math.random() > 0.5) {
                const extraFn = errorFunctions[(i + 2) % errorFunctions.length];
                extraFn(rows[idx], idx, rows);
            }
        });

        // For "duplikat" mode, add more duplicates
        if (config.focus === 'duplikat') {
            const dupCount = Math.min(3, totalRows - errorCount);
            for (let d = 0; d < dupCount; d++) {
                const srcIdx = randInt(0, Math.min(3, totalRows - 1));
                const targetIdx = errorCount + d;
                if (targetIdx < totalRows) {
                    rows[targetIdx].nis = rows[srcIdx].nis;
                    rows[targetIdx].errors.nis = true;
                    rows[targetIdx].errorTypes.nis = 'NIS duplikat dengan data lain';
                }
            }
        }

        return { rows };
    }

    /* ============================
       LEVEL 2: VALIDASI
       ============================ */
    function generateLevel2(config) {
        const { totalItems = 7, minValid = 2 } = config;
        const items = [];
        const nisBase = 2024000 + randInt(100, 200);

        // Issue generators
        const issueGenerators = {
            format: (item) => {
                const type = randInt(0, 2);
                if (type === 0) {
                    item.nama = corruptName(item.nama);
                    item.errorDetails.push('Nama mengandung format yang salah');
                } else if (type === 1) {
                    item.tgl_lahir = corruptDate(item.tgl_lahir);
                    item.errorDetails.push('Format tanggal tidak konsisten (seharusnya DD/MM/YYYY)');
                } else {
                    item.kelas = corruptKelas();
                    item.errorDetails.push('Format kelas tidak konsisten');
                }
            },
            lengkap: (item) => {
                const field = pick(['nis', 'no_telp', 'tgl_lahir']);
                item[field] = '';
                const labels = { nis: 'NIS', no_telp: 'Nomor telepon', tgl_lahir: 'Tanggal lahir' };
                item.errorDetails.push(`${labels[field]} kosong (data tidak lengkap)`);
            },
            nomor: (item) => {
                const type = randInt(0, 1);
                if (type === 0) {
                    item.no_telp = corruptPhone(item.no_telp);
                    item.errorDetails.push('Nomor telepon tidak valid');
                } else {
                    item.nis = String(randInt(10000, 99999));
                    item.errorDetails.push('NIS format tidak valid (bukan 7 digit)');
                }
            }
        };

        // Create all items
        for (let i = 0; i < totalItems; i++) {
            items.push({
                nama: generateName(),
                nis: generateNIS(nisBase, i + 1),
                tgl_lahir: generateValidDate(),
                kelas: pick(KELAS_VALID),
                no_telp: generateValidPhone(),
                issues: ['valid'],
                errorDetails: []
            });
        }

        // Set valid items
        const indices = shuffle([...Array(totalItems).keys()]);
        const validIndices = new Set(indices.slice(0, minValid));

        // Apply issues to non-valid items
        const issueTypes = ['format', 'lengkap', 'nomor'];
        indices.slice(minValid).forEach((idx, i) => {
            const item = items[idx];
            item.issues = [];
            item.errorDetails = [];

            // Primary issue
            const primaryIssue = issueTypes[i % issueTypes.length];
            item.issues.push(primaryIssue);
            issueGenerators[primaryIssue](item);

            // Sometimes add a second issue (for variety)
            // BUT: don't combine 'lengkap' with 'nomor' — they conflict
            if (config.difficulty === 'sulit' || (Math.random() > 0.6 && item.issues.length < 2)) {
                const secondIssue = issueTypes[(i + 1) % issueTypes.length];
                const conflicting = (primaryIssue === 'lengkap' && secondIssue === 'nomor') ||
                                    (primaryIssue === 'nomor' && secondIssue === 'lengkap');
                if (secondIssue !== primaryIssue && !conflicting) {
                    item.issues.push(secondIssue);
                    issueGenerators[secondIssue](item);
                }
            }
        });

        return items;
    }

    /* ============================
       LEVEL 3: VERIFIKASI
       ============================ */
    function generateLevel3(config) {
        const { totalItems = 6, minBenar = 2, minPerbaikan = 2, minTidakBisa = 1 } = config;
        const items = [];
        const nisBase = 2024000 + randInt(200, 300);

        // Generate base data
        for (let i = 0; i < totalItems; i++) {
            const name = generateName();
            const nis = generateNIS(nisBase, i + 1);
            const tgl = generateValidDate();
            const kelas = pick(KELAS_VALID);
            const phone = generateValidPhone();

            items.push({
                inputData: { nama: name, nis: nis, tgl_lahir: tgl, kelas: kelas, no_telp: phone },
                refData: { nama: name, nis: nis, tgl_lahir: tgl, kelas: kelas, no_telp: phone },
                correctAnswer: 'benar',
                explanation: 'Semua data cocok dengan referensi'
            });
        }

        // Assign statuses
        const indices = shuffle([...Array(totalItems).keys()]);
        let assigned = 0;

        // "benar" items (first minBenar)
        // Already set as benar by default

        // "perbaikan" items
        for (let i = minBenar; i < minBenar + minPerbaikan && i < totalItems; i++) {
            const idx = indices[i];
            const item = items[idx];
            item.correctAnswer = 'perbaikan';

            // Create mismatch
            const field = pick(['nama', 'nis', 'tgl_lahir', 'kelas', 'no_telp']);
            const labels = { nama: 'Nama', nis: 'NIS', tgl_lahir: 'Tanggal lahir', kelas: 'Kelas', no_telp: 'Nomor telepon' };

            if (field === 'nama') {
                item.inputData.nama = corruptName(item.refData.nama);
                item.explanation = `Nama tidak cocok: "${item.inputData.nama}" vs "${item.refData.nama}"`;
            } else if (field === 'nis') {
                item.inputData.nis = '';
                item.explanation = `NIS kosong, data referensi menunjukkan NIS ${item.refData.nis}`;
            } else if (field === 'tgl_lahir') {
                item.inputData.tgl_lahir = corruptDate(item.refData.tgl_lahir);
                item.explanation = `Tanggal lahir tidak cocok: "${item.inputData.tgl_lahir}" vs "${item.refData.tgl_lahir}"`;
            } else if (field === 'kelas') {
                item.inputData.kelas = corruptKelas();
                item.explanation = `Kelas tidak cocok: "${item.inputData.kelas}" vs "${item.refData.kelas}"`;
            } else {
                item.inputData.no_telp = corruptPhone(item.refData.no_telp);
                item.explanation = `${labels[field]} tidak cocok: "${item.inputData[field]}" vs "${item.refData[field]}"`;
            }
        }

        // "tidak-bisa" items
        for (let i = minBenar + minPerbaikan; i < minBenar + minPerbaikan + minTidakBisa && i < totalItems; i++) {
            const idx = indices[i];
            const item = items[idx];
            item.correctAnswer = 'tidak-bisa';

            // Make ref data ambiguous — empty so it shows '— kosong —' in UI
            item.refData.nis = '';
            item.refData.tgl_lahir = '';
            item.explanation = 'Data referensi tidak lengkap/ambigu, tidak bisa diverifikasi';
        }

        // Remaining items: mix of benar and perbaikan
        for (let i = minBenar + minPerbaikan + minTidakBisa; i < totalItems; i++) {
            const idx = indices[i];
            if (Math.random() > 0.5) {
                // Make it perbaikan
                const item = items[idx];
                item.correctAnswer = 'perbaikan';
                item.inputData.no_telp = corruptPhone(item.refData.no_telp);
                item.explanation = `Nomor telepon tidak cocok: "${item.inputData.no_telp}" vs "${item.refData.no_telp}"`;
            }
            // else keep as benar
        }

        return items;
    }

    /* ============================
       LEVEL 4: CLEANSING
       ============================ */
    function generateLevel4(config) {
        const { totalItems = 9, minBersih = 2, minDiedit = 3, minDihapus = 1 } = config;
        const items = [];
        const nisBase = 2024000 + randInt(300, 400);

        // Generate all as clean first
        for (let i = 0; i < totalItems; i++) {
            const name = generateName();
            const nis = generateNIS(nisBase, i + 1);
            const tgl = generateValidDate();
            const kelas = pick(KELAS_VALID);
            const phone = generateValidPhone();

            items.push({
                no: i + 1,
                input: { nama: name, nis: nis, tgl: tgl, kelas: kelas, notelp: phone },
                ref: { nama: name, nis: nis, tgl: tgl, kelas: kelas, notelp: phone },
                correctStatus: 'bersih',
                correctEdits: null,
                explanation: 'Data cocok dengan referensi, semua field benar'
            });
        }

        const indices = shuffle([...Array(totalItems).keys()]);

        // "bersih" — first minBersih items stay as-is

        // "diedit" items
        for (let i = minBersih; i < minBersih + minDiedit && i < totalItems; i++) {
            const idx = indices[i];
            const item = items[idx];
            item.correctStatus = 'diedit';
            item.correctEdits = {};

            // Pick 1-2 fields to corrupt
            const fields = shuffle(['nama', 'nis', 'tgl', 'kelas', 'notelp']);
            const numCorrupt = randInt(1, 2);

            for (let f = 0; f < numCorrupt; f++) {
                const field = fields[f];
                const correctValue = item.ref[field];

                if (field === 'nama') {
                    item.input.nama = corruptName(correctValue);
                    item.correctEdits.nama = correctValue;
                } else if (field === 'nis') {
                    item.input.nis = String(randInt(10, 999));
                    item.correctEdits.nis = correctValue;
                } else if (field === 'tgl') {
                    item.input.tgl = corruptDate(correctValue);
                    item.correctEdits.tgl = correctValue;
                } else if (field === 'kelas') {
                    item.input.kelas = corruptKelas();
                    item.correctEdits.kelas = correctValue;
                } else {
                    item.input.notelp = corruptPhone(correctValue);
                    item.correctEdits.notelp = correctValue;
                }
            }

            const editedFields = Object.keys(item.correctEdits).join(' & ');
            item.explanation = `${editedFields} perlu diedit sesuai referensi`;
        }

        // "dihapus" — duplicate of an earlier clean row
        for (let i = minBersih + minDiedit; i < minBersih + minDiedit + minDihapus && i < totalItems; i++) {
            const idx = indices[i];
            const srcIdx = indices[0]; // copy from first clean row
            const item = items[idx];

            item.input = { ...items[srcIdx].input };
            item.ref = { ...items[srcIdx].ref };
            item.correctStatus = 'dihapus';
            item.correctEdits = null;
            item.explanation = `Data duplikat dengan baris ${items[srcIdx].no}, harus dihapus`;
        }

        // "ditandai" — exactly 1, ref = null (last one in the error slots)
        const ditandaiIdx = indices[minBersih + minDiedit + minDihapus];
        if (ditandaiIdx !== undefined && ditandaiIdx < totalItems) {
            const item = items[ditandaiIdx];
            item.ref = null;
            item.correctStatus = 'ditandai';
            item.correctEdits = null;
            item.explanation = 'Tidak ada data referensi, perlu ditandai untuk konfirmasi';
        }

        // Remaining items stay as bersih

        return items;
    }

    /* ============================
       TEMPLATE CONFIGS
       ============================ */
    const TEMPLATES = {
        mudah: {
            difficulty: 'mudah',
            focus: null,
            level1: { totalRows: 10, minErrors: 4, minClean: 5 },
            level2: { totalItems: 7, minValid: 3 },
            level3: { totalItems: 6, minBenar: 3, minPerbaikan: 1, minTidakBisa: 1 },
            level4: { totalItems: 9, minBersih: 3, minDiedit: 2, minDihapus: 1 }
        },
        sedang: {
            difficulty: 'sedang',
            focus: null,
            level1: { totalRows: 10, minErrors: 5, minClean: 3 },
            level2: { totalItems: 7, minValid: 2 },
            level3: { totalItems: 6, minBenar: 2, minPerbaikan: 2, minTidakBisa: 1 },
            level4: { totalItems: 9, minBersih: 2, minDiedit: 3, minDihapus: 1 }
        },
        sulit: {
            difficulty: 'sulit',
            focus: null,
            level1: { totalRows: 10, minErrors: 7, minClean: 2 },
            level2: { totalItems: 7, minValid: 1 },
            level3: { totalItems: 6, minBenar: 1, minPerbaikan: 3, minTidakBisa: 1 },
            level4: { totalItems: 9, minBersih: 1, minDiedit: 4, minDihapus: 2 }
        }
    };

    /* ============================
       PUBLIC: GENERATE ALL
       ============================ */
    function generateAll(templateName = 'standar') {
        const template = TEMPLATES[templateName] || TEMPLATES.sedang;

        const config1 = { ...template.level1, difficulty: template.difficulty, focus: template.focus };
        const config2 = { ...template.level2, difficulty: template.difficulty };
        const config3 = { ...template.level3, difficulty: template.difficulty };
        const config4 = { ...template.level4, difficulty: template.difficulty, focus: template.focus };

        return {
            level1: generateLevel1(config1),
            level2: generateLevel2(config2),
            level3: generateLevel3(config3),
            level4: generateLevel4(config4)
        };
    }

    return { generateAll };
})();
