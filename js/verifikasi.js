/* ============================================
   DATA SIM — Level 3: Verifikasi Script
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    loadAIDataIfAvailable();
    initDotNavigation();
    initDataNavigation();
    initVerificationOptions();
    initPeriksaButton();
    renderCurrentData();
});

/* === Load AI Data === */
function loadAIDataIfAvailable() {
    const aiData = sessionStorage.getItem('ai_level3');
    if (!aiData) return;
    try {
        const parsed = JSON.parse(aiData);
        if (Array.isArray(parsed) && parsed.length > 0) {
            verificationData.length = 0;
            parsed.forEach(item => verificationData.push(item));
        }
    } catch (e) { console.error('Error loading AI data for Level 3:', e); }
}

/* === Verification Data ===
   Each item is a student data row.
   "inputData" = what was entered (possibly with errors)
   "refData" = reference data from wali kelas
   "correctAnswer" = "benar" | "perbaikan" | "tidak-bisa"
*/
const verificationData = [
    {
        inputData: {
            nama: 'Andi Wijaya',
            nis: '2024001',
            tgl_lahir: '12/05/2008',
            kelas: 'X-TKJ',
            no_telp: '08123456789'
        },
        refData: {
            nama: 'Andi Wijaya',
            nis: '2024001',
            tgl_lahir: '12/05/2008',
            kelas: 'X-TKJ',
            no_telp: '08123456789'
        },
        correctAnswer: 'benar',
        explanation: 'Semua data cocok dengan referensi'
    },
    {
        inputData: {
            nama: 'Budi Santoso',
            nis: '2024002',
            tgl_lahir: '10/10/2009',
            kelas: 'X-TKJ',
            no_telp: '08199867766'
        },
        refData: {
            nama: 'Budi Santoso',
            nis: '2024002',
            tgl_lahir: '10/10/2009',
            kelas: 'X-TKJ',
            no_telp: '08199867766'
        },
        correctAnswer: 'benar',
        explanation: 'Semua data cocok dengan referensi'
    },
    {
        inputData: {
            nama: 'Citra Lestari',
            nis: '',
            tgl_lahir: '15/01/2008',
            kelas: 'X-TKJ',
            no_telp: '08521234432'
        },
        refData: {
            nama: 'Citra Lestari',
            nis: '2024003',
            tgl_lahir: '15/01/2008',
            kelas: 'X-TKJ',
            no_telp: '08521234432'
        },
        correctAnswer: 'perbaikan',
        explanation: 'NIS kosong, data referensi menunjukkan NIS 2024003'
    },
    {
        inputData: {
            nama: 'Dewi Sartika',
            nis: '2024005',
            tgl_lahir: '22/03/2010',
            kelas: 'X-TKJ',
            no_telp: '08123456781'
        },
        refData: {
            nama: 'Dewi Sartika',
            nis: '2024005',
            tgl_lahir: '22/03/2010',
            kelas: 'X-TKJ',
            no_telp: '08123456781'
        },
        correctAnswer: 'benar',
        explanation: 'Semua data cocok dengan referensi'
    },
    {
        inputData: {
            nama: 'Eko Prasetyo',
            nis: '2024006',
            tgl_lahir: '05/12/2007',
            kelas: 'X-TKJ',
            no_telp: '08133445'
        },
        refData: {
            nama: 'Eko Prasetyo',
            nis: '2024006',
            tgl_lahir: '05/12/2007',
            kelas: 'X-TKJ',
            no_telp: '08133445566'
        },
        correctAnswer: 'perbaikan',
        explanation: 'Nomor telepon tidak cocok: 08133445 vs 08133445566'
    },
    {
        inputData: {
            nama: 'Fani Rahayu',
            nis: '2024007',
            tgl_lahir: '15/07/2008',
            kelas: 'X-TKJ',
            no_telp: '08133344455'
        },
        refData: {
            nama: 'Fani Rahayu',
            nis: '2024007',
            tgl_lahir: '15/07/2008',
            kelas: 'X-TKJ',
            no_telp: '08133344455'
        },
        correctAnswer: 'benar',
        explanation: 'Semua data cocok dengan referensi'
    }
];

const fieldLabels = {
    nama: 'NAMA LENGKAP',
    nis: 'NIS',
    tgl_lahir: 'TANGGAL LAHIR',
    kelas: 'KELAS',
    no_telp: 'NO TELP'
};

/* === State === */
const state = {
    currentIndex: 0,
    answers: {} // { index: 'benar' | 'perbaikan' | 'tidak-bisa' }
};

/* === Dot Navigation === */
function initDotNavigation() {
    const dotsContainer = document.getElementById('ver-dots');
    verificationData.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'ver-dot' + (i === 0 ? ' active' : '');
        dot.dataset.index = i;
        dot.addEventListener('click', () => {
            saveCurrentAnswer();
            state.currentIndex = i;
            renderCurrentData();
        });
        dotsContainer.appendChild(dot);
    });
}

function updateDots() {
    document.querySelectorAll('.ver-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === state.currentIndex);
        dot.classList.toggle('answered', state.answers.hasOwnProperty(i) && i !== state.currentIndex);
    });
}

/* === Data Navigation === */
function initDataNavigation() {
    document.getElementById('btn-kembali').addEventListener('click', () => {
        saveCurrentAnswer();
        if (state.currentIndex > 0) {
            state.currentIndex--;
            renderCurrentData();
        }
    });

    document.getElementById('btn-next-data').addEventListener('click', () => {
        saveCurrentAnswer();
        if (state.currentIndex < verificationData.length - 1) {
            state.currentIndex++;
            renderCurrentData();
        }
    });
}

/* === Render Data === */
function renderCurrentData() {
    const item = verificationData[state.currentIndex];
    const inputEl = document.getElementById('ver-fields-input');
    const refEl = document.getElementById('ver-fields-ref');

    const keys = Object.keys(item.inputData);

    // Render input data
    inputEl.innerHTML = keys.map((key, i) => {
        const val = item.inputData[key] || '— kosong —';
        const isEmpty = !item.inputData[key];
        
        let valueClass = '';
        if (isEmpty) valueClass = 'empty-val';

        return `<div class="ver-field" style="animation-delay: ${i * 0.05}s">
            <div class="ver-field-label">${fieldLabels[key]}</div>
            <div class="ver-field-value ${valueClass}">${val}</div>
        </div>`;
    }).join('');

    // Render reference data
    refEl.innerHTML = keys.map((key, i) => {
        const val = item.refData[key] || '— kosong —';

        return `<div class="ver-field" style="animation-delay: ${i * 0.05}s">
            <div class="ver-field-label">${fieldLabels[key]}</div>
            <div class="ver-field-value">${val}</div>
        </div>`;
    }).join('');

    // Update nav
    document.getElementById('data-nav-current').textContent = state.currentIndex + 1;
    document.getElementById('data-nav-total').textContent = verificationData.length;

    document.getElementById('btn-kembali').disabled = state.currentIndex === 0;
    const btnNext = document.getElementById('btn-next-data');
    btnNext.style.display = state.currentIndex === verificationData.length - 1 ? 'none' : '';

    // Restore answer
    restoreAnswer();
    updateDots();
    updatePeriksaButton();
}

/* === Verification Options === */
function initVerificationOptions() {
    document.querySelectorAll('.ver-option input').forEach(inp => {
        inp.addEventListener('change', () => {
            document.querySelectorAll('.ver-option').forEach(opt => opt.classList.remove('selected'));
            if (inp.checked) {
                inp.closest('.ver-option').classList.add('selected');
            }
            saveCurrentAnswer();
            updatePeriksaButton();
            playSelectSound();
        });
    });
}

/* === Save / Restore === */
function saveCurrentAnswer() {
    const checked = document.querySelector('.ver-option input:checked');
    if (checked) {
        state.answers[state.currentIndex] = checked.value;
    }
}

function restoreAnswer() {
    document.querySelectorAll('.ver-option input').forEach(inp => {
        inp.checked = false;
        inp.closest('.ver-option').classList.remove('selected');
    });

    const saved = state.answers[state.currentIndex];
    if (saved) {
        const inp = document.querySelector(`.ver-option input[value="${saved}"]`);
        if (inp) {
            inp.checked = true;
            inp.closest('.ver-option').classList.add('selected');
        }
    }
}

/* === Periksa === */
function updatePeriksaButton() {
    const btn = document.getElementById('btn-periksa');
    const allAnswered = Object.keys(state.answers).length === verificationData.length;

    if (allAnswered || state.currentIndex === verificationData.length - 1) {
        btn.style.display = '';
    } else {
        btn.style.display = 'none';
    }

    btn.disabled = !allAnswered;

    if (!allAnswered) {
        const remaining = verificationData.length - Object.keys(state.answers).length;
        btn.querySelector('span').textContent = `Periksa Jawaban (${remaining} belum)`;
    } else {
        btn.querySelector('span').textContent = 'Periksa Jawaban';
    }
}

function initPeriksaButton() {
    document.getElementById('btn-periksa').addEventListener('click', () => {
        saveCurrentAnswer();
        if (Object.keys(state.answers).length < verificationData.length) return;

        let correct = 0, wrong = 0;
        const details = [];

        verificationData.forEach((item, idx) => {
            const userAnswer = state.answers[idx];
            const isCorrect = userAnswer === item.correctAnswer;
            if (isCorrect) correct++;
            else wrong++;

            const answerLabels = {
                'benar': 'Data Sudah Benar',
                'perbaikan': 'Perlu Perbaikan',
                'tidak-bisa': 'Tidak Bisa Diverifikasi'
            };

            details.push({
                nama: item.inputData.nama,
                userAnswer: answerLabels[userAnswer] || userAnswer,
                correctAnswer: answerLabels[item.correctAnswer],
                isCorrect,
                explanation: item.explanation
            });
        });

        const resultData = {
            type: 'verifikasi',
            correct, wrong,
            total: verificationData.length,
            score: Math.round((correct / verificationData.length) * 100),
            details
        };

        sessionStorage.setItem('verifikasi_result', JSON.stringify(resultData));
        window.location.href = 'simulasi-hasil-verifikasi.html';
    });
}

/* === Sound === */
function playSelectSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 700; osc.type = 'sine';
        gain.gain.value = 0.04;
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
}
