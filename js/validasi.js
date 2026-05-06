/* ============================================
   DATA SIM — Level 2: Validasi Script
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    loadAIDataIfAvailable();
    initRuleToggles();
    initDataNavigation();
    initValidationOptions();
    initPeriksaButton();
    renderCurrentData();
});

/* === Load AI Data === */
function loadAIDataIfAvailable() {
    const aiData = sessionStorage.getItem('ai_level2');
    if (!aiData) return;
    try {
        const parsed = JSON.parse(aiData);
        if (Array.isArray(parsed) && parsed.length > 0) {
            validationData.length = 0;
            parsed.forEach(item => validationData.push(item));
        }
    } catch (e) { console.error('Error loading AI data for Level 2:', e); }
}

/* === Data for Validation ===
   Each item = 1 student data row.
   "issues" = correct answers (array of: "valid", "format", "lengkap", "nomor")
   Students can select 1-4 options per row.
*/
const validationData = [
    {
        nama: 'Andi Wijaya',
        nis: '2024001',
        tgl_lahir: '12/05/2008',
        kelas: 'X-TKJ',
        no_telp: '08123456789',
        issues: ['valid'], // semua data benar
        errorDetails: []
    },
    {
        nama: 'Budi 123',
        nis: '2024002',
        tgl_lahir: '10/10/2009',
        kelas: 'X-TKJ',
        no_telp: '08199867766',
        issues: ['format'],
        errorDetails: ['Nama mengandung angka']
    },
    {
        nama: 'Citra Lestari',
        nis: '',
        tgl_lahir: '15/01/2008',
        kelas: 'X-TKJ',
        no_telp: '08521234432',
        issues: ['lengkap'],
        errorDetails: ['NIS kosong (data tidak lengkap)']
    },
    {
        nama: 'Andi Wijaya',
        nis: '2024004',
        tgl_lahir: '12/05/2008',
        kelas: 'X-TKJ',
        no_telp: '08123456789',
        issues: ['valid'], // duplikat tapi data itu sendiri valid formatnya
        errorDetails: []
    },
    {
        nama: 'Dewi Sartika',
        nis: '2024005',
        tgl_lahir: '22/03/2010',
        kelas: 'XTKJ',
        no_telp: '08123456781',
        issues: ['format'],
        errorDetails: ['Format kelas tidak konsisten (seharusnya X-TKJ)']
    },
    {
        nama: 'Eko Prasetyo',
        nis: '2024006',
        tgl_lahir: '05/12/2007',
        kelas: 'X-TKJ',
        no_telp: '08133445',
        issues: ['nomor'],
        errorDetails: ['Nomor telepon terlalu pendek (hanya 8 digit)']
    },
    {
        nama: 'Fani Rahayu',
        nis: '2024007',
        tgl_lahir: '2008-07-15',
        kelas: 'X-TKJ',
        no_telp: '08133344455',
        issues: ['format'],
        errorDetails: ['Format tanggal tidak konsisten (seharusnya DD/MM/YYYY)']
    }
];

/* === State === */
const state = {
    currentIndex: 0,
    answers: {}, // { index: Set(['valid', 'format', ...]) }
    allAnswered: false
};

/* === Rule Toggle (collapsible) === */
function initRuleToggles() {
    document.querySelectorAll('.rule-header').forEach(header => {
        header.addEventListener('click', () => {
            const card = header.closest('.rule-card');
            card.classList.toggle('open');
        });
    });
    // Open first rule by default
    document.querySelector('.rule-card')?.classList.add('open');
}

/* === Data Navigation === */
function initDataNavigation() {
    const btnKembali = document.getElementById('btn-kembali');
    const btnNext = document.getElementById('btn-next-data');

    btnKembali.addEventListener('click', () => {
        saveCurrentAnswer();
        if (state.currentIndex > 0) {
            state.currentIndex--;
            renderCurrentData();
        }
    });

    btnNext.addEventListener('click', () => {
        saveCurrentAnswer();
        if (state.currentIndex < validationData.length - 1) {
            state.currentIndex++;
            renderCurrentData();
        }
    });
}

/* === Render Data === */
function renderCurrentData() {
    const item = validationData[state.currentIndex];
    const fieldsEl = document.getElementById('data-fields');

    const fields = [
        { label: 'NAMA LENGKAP', value: item.nama || '— kosong —' },
        { label: 'NIS', value: item.nis || '— kosong —' },
        { label: 'TANGGAL LAHIR', value: item.tgl_lahir || '— kosong —' },
        { label: 'KELAS', value: item.kelas || '— kosong —' },
        { label: 'NO TELP', value: item.no_telp || '— kosong —' },
    ];

    fieldsEl.innerHTML = fields.map((f, i) => `
        <div class="data-field" style="animation-delay: ${i * 0.05}s">
            <div class="data-field-label">${f.label}</div>
            <div class="data-field-value">${f.value}</div>
        </div>
    `).join('');

    // Update nav
    document.getElementById('data-nav-current').textContent = state.currentIndex + 1;
    document.getElementById('data-nav-total').textContent = validationData.length;

    // Update buttons
    document.getElementById('btn-kembali').disabled = state.currentIndex === 0;
    const btnNext = document.getElementById('btn-next-data');
    
    if (state.currentIndex === validationData.length - 1) {
        btnNext.style.display = 'none';
    } else {
        btnNext.style.display = '';
    }

    // Restore saved answer for this index
    restoreAnswer();
    updatePeriksaButton();
}

/* === Validation Options === */
function initValidationOptions() {
    const options = document.querySelectorAll('.val-option input');
    options.forEach(input => {
        input.addEventListener('change', () => {
            const label = input.closest('.val-option');
            
            if (input.checked) {
                label.classList.add('selected');
                
                // If "valid" selected, deselect others
                if (input.value === 'valid') {
                    options.forEach(other => {
                        if (other !== input && other.checked) {
                            other.checked = false;
                            other.closest('.val-option').classList.remove('selected');
                        }
                    });
                } else {
                    // If any issue selected, deselect "valid"
                    const validInput = document.querySelector('.val-option input[value="valid"]');
                    if (validInput.checked) {
                        validInput.checked = false;
                        validInput.closest('.val-option').classList.remove('selected');
                    }
                }
            } else {
                label.classList.remove('selected');
            }

            saveCurrentAnswer();
            updatePeriksaButton();
            playSelectSound();
        });
    });
}

/* === Save/Restore Answers === */
function saveCurrentAnswer() {
    const selected = new Set();
    document.querySelectorAll('.val-option input:checked').forEach(inp => {
        selected.add(inp.value);
    });
    if (selected.size > 0) {
        state.answers[state.currentIndex] = selected;
    } else {
        delete state.answers[state.currentIndex];
    }
}

function restoreAnswer() {
    // Reset all
    document.querySelectorAll('.val-option input').forEach(inp => {
        inp.checked = false;
        inp.closest('.val-option').classList.remove('selected');
    });

    const saved = state.answers[state.currentIndex];
    if (saved) {
        saved.forEach(val => {
            const inp = document.querySelector(`.val-option input[value="${val}"]`);
            if (inp) {
                inp.checked = true;
                inp.closest('.val-option').classList.add('selected');
            }
        });
    }
}

/* === Periksa Button === */
function updatePeriksaButton() {
    const btn = document.getElementById('btn-periksa');
    const allAnswered = Object.keys(state.answers).length === validationData.length;

    // Show periksa button only when on last item or all answered
    if (allAnswered || state.currentIndex === validationData.length - 1) {
        btn.style.display = '';
    } else {
        btn.style.display = 'none';
    }

    btn.disabled = !allAnswered;
    
    if (!allAnswered) {
        const remaining = validationData.length - Object.keys(state.answers).length;
        btn.querySelector('span').textContent = `Periksa Jawaban (${remaining} data belum dijawab)`;
    } else {
        btn.querySelector('span').textContent = 'Periksa Jawaban';
    }
}

function initPeriksaButton() {
    const btn = document.getElementById('btn-periksa');
    btn.addEventListener('click', () => {
        saveCurrentAnswer();
        if (Object.keys(state.answers).length < validationData.length) return;

        // Calculate results
        let correct = 0;
        let wrong = 0;
        const details = [];

        validationData.forEach((item, idx) => {
            const userAnswer = state.answers[idx] || new Set();
            const correctAnswer = new Set(item.issues);

            // Check if answers match exactly
            const isCorrect = setsEqual(userAnswer, correctAnswer);

            if (isCorrect) {
                correct++;
            } else {
                wrong++;
            }

            details.push({
                nama: item.nama,
                userAnswer: Array.from(userAnswer),
                correctAnswer: item.issues,
                isCorrect: isCorrect,
                errorDetails: item.errorDetails
            });
        });

        const resultData = {
            type: 'validasi',
            correct: correct,
            wrong: wrong,
            total: validationData.length,
            score: Math.round((correct / validationData.length) * 100),
            details: details
        };

        sessionStorage.setItem('validasi_result', JSON.stringify(resultData));
        window.location.href = 'simulasi-hasil-validasi.html';
    });
}

function setsEqual(a, b) {
    if (a.size !== b.size) return false;
    for (const val of a) {
        if (!b.has(val)) return false;
    }
    return true;
}

/* === Sound === */
function playSelectSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 600;
        osc.type = 'sine';
        gain.gain.value = 0.04;
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
}
