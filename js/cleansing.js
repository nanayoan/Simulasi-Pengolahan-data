/* ============================================
   DATA SIM — Level 4: Pembersihan (Cleansing)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    loadAIDataIfAvailable();
    renderTable();
    initStatusButtons();
    initModals();
    initPeriksaButton();
});

/* === Load AI Data === */
function loadAIDataIfAvailable() {
    const aiData = sessionStorage.getItem('ai_level4');
    if (!aiData) return;
    try {
        const parsed = JSON.parse(aiData);
        if (Array.isArray(parsed) && parsed.length > 0) {
            cleansingData.length = 0;
            parsed.forEach(item => cleansingData.push(item));
        }
    } catch (e) { console.error('Error loading AI data for Level 4:', e); }
}

/* === Data: 9 student rows with reference data ===
   correctStatus: bersih | diedit | dihapus | ditandai
   correctEdits: for "diedit" rows, what the corrected data should be
   ref: reference data (null = no reference available)
*/
const cleansingData = [
    {
        no: 1,
        input: { nama: 'Andi Wijaya', nis: '2024001', tgl: '12/05/2008', kelas: 'X-TKJ', notelp: '08123456789' },
        ref: { nama: 'Andi Wijaya', nis: '2024001', tgl: '12/05/2008', kelas: 'X-TKJ', notelp: '08123456789' },
        correctStatus: 'bersih',
        correctEdits: null,
        explanation: 'Data cocok dengan referensi, semua field benar'
    },
    {
        no: 2,
        input: { nama: 'Budi123 santoso', nis: '2024002', tgl: '10/10/2009', kelas: 'X-RPL', notelp: '08123456789' },
        ref: { nama: 'Budi Santoso', nis: '2024002', tgl: '10/10/2009', kelas: 'X-TKJ', notelp: '08123456789' },
        correctStatus: 'diedit',
        correctEdits: { nama: 'Budi Santoso', kelas: 'X-TKJ' },
        explanation: 'Nama mengandung angka & kelas salah, perlu diedit sesuai referensi'
    },
    {
        no: 3,
        input: { nama: 'Citra Dewi', nis: '2024001', tgl: '15/01/2008', kelas: 'X-TB', notelp: '08199867766' },
        ref: { nama: 'Citra Dewi', nis: '2024003', tgl: '15/01/2008', kelas: 'X-TKJ', notelp: '08199867766' },
        correctStatus: 'diedit',
        correctEdits: { nis: '2024003', kelas: 'X-TKJ' },
        explanation: 'NIS duplikat (sama dengan Andi) & kelas salah, edit sesuai referensi'
    },
    {
        no: 4,
        input: { nama: 'Andi Wijaya', nis: '2024001', tgl: '12/05/2008', kelas: 'X-TKJ', notelp: '08123456789' },
        ref: { nama: 'Andi Wijaya', nis: '2024001', tgl: '12/05/2008', kelas: 'X-TKJ', notelp: '08123456789' },
        correctStatus: 'dihapus',
        correctEdits: null,
        explanation: 'Data duplikat dengan baris 1, harus dihapus'
    },
    {
        no: 5,
        input: { nama: 'Dewi Sartika', nis: '2024005', tgl: '22/03/2010', kelas: 'X-TKJ', notelp: '08123456781' },
        ref: { nama: 'Dewi Sartika', nis: '2024005', tgl: '22/03/2010', kelas: 'X-TKJ', notelp: '08123456781' },
        correctStatus: 'bersih',
        correctEdits: null,
        explanation: 'Data cocok dengan referensi'
    },
    {
        no: 6,
        input: { nama: 'Eko Prasetyo', nis: '2024006', tgl: '2008-07-15', kelas: 'X-TKJ', notelp: '08133445' },
        ref: { nama: 'Eko Prasetyo', nis: '2024006', tgl: '05/12/2007', kelas: 'X-TKJ', notelp: '08133445566' },
        correctStatus: 'diedit',
        correctEdits: { tgl: '05/12/2007', notelp: '08133445566' },
        explanation: 'Format tanggal salah & nomor telepon tidak lengkap'
    },
    {
        no: 7,
        input: { nama: 'Fani Rahayu', nis: '2024007', tgl: '15/07/2008', kelas: 'X-TKJ', notelp: '08133344455' },
        ref: { nama: 'Fani Rahayu', nis: '2024007', tgl: '15/07/2008', kelas: 'X-TKJ', notelp: '08133344455' },
        correctStatus: 'bersih',
        correctEdits: null,
        explanation: 'Data cocok dengan referensi'
    },
    {
        no: 8,
        input: { nama: 'Hendra Kusuma', nis: '2024002', tgl: '01/11/2004', kelas: 'X-TKJ', notelp: '08593829485' },
        ref: { nama: 'Hendra Kusuma', nis: '2024008', tgl: '01/11/2004', kelas: 'X-TKJ', notelp: '08593829485' },
        correctStatus: 'diedit',
        correctEdits: { nis: '2024008' },
        explanation: 'NIS duplikat dengan Budi, edit sesuai referensi'
    },
    {
        no: 9,
        input: { nama: 'Gita Sari', nis: '2024009', tgl: '05/12/2007', kelas: 'X-TKJ', notelp: '08133344455' },
        ref: null,
        correctStatus: 'ditandai',
        correctEdits: null,
        explanation: 'Tidak ada data referensi, perlu ditandai untuk konfirmasi lebih lanjut'
    }
];

/* === State === */
const state = {
    activeStatus: null,  // currently selected status tool
    rowStatuses: {},     // { rowIndex: 'bersih' | 'diedit' | 'dihapus' | 'ditandai' }
    rowEdits: {},        // { rowIndex: { field: newValue } }
    editingRow: null     // row index currently being edited
};

const fieldLabels = {
    nama: 'NAMA LENGKAP',
    nis: 'NIS',
    tgl: 'TANGGAL LAHIR',
    kelas: 'KELAS',
    notelp: 'NO TELEPON'
};

/* === Render Table === */
function renderTable() {
    const tbody = document.getElementById('cl-tbody');
    tbody.innerHTML = '';

    cleansingData.forEach((item, idx) => {
        const currentData = getDisplayData(idx);
        const status = state.rowStatuses[idx];

        const tr = document.createElement('tr');
        tr.dataset.index = idx;

        if (status === 'dihapus') tr.classList.add('row-deleted');
        if (status) tr.classList.add('row-selected');

        tr.innerHTML = `
            <td>${item.no}</td>
            <td>${currentData.nama}</td>
            <td>${currentData.nis || '—'}</td>
            <td>${currentData.tgl}</td>
            <td>${currentData.kelas}</td>
            <td>${currentData.notelp}</td>
            <td>${status ? getStatusBadge(status) : '<span style="color: var(--color-text-muted); font-size: 0.75rem;">—</span>'}</td>
            <td>
                <div class="action-btns">
                    <button class="action-icon btn-edit" data-row="${idx}" title="Edit Data">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17 3C17.55 2.45 18.29 2.13 19.09 2.13C19.89 2.13 20.63 2.45 21.18 3C21.73 3.55 22.05 4.29 22.05 5.09C22.05 5.89 21.73 6.63 21.18 7.18L7.82 20.54L2 22L3.46 16.18L17 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <button class="action-icon btn-ref" data-row="${idx}" title="Lihat Referensi">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>
                    </button>
                </div>
            </td>
        `;

        // Click row to apply status
        tr.addEventListener('click', (e) => {
            if (e.target.closest('.action-icon')) return; // don't trigger on icon clicks
            if (state.activeStatus) {
                state.rowStatuses[idx] = state.activeStatus;
                renderTable();
                updateProgress();
                playSelectSound();
            }
        });

        tbody.appendChild(tr);
    });

    // Bind action buttons
    tbody.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openEditModal(parseInt(btn.dataset.row));
        });
    });

    tbody.querySelectorAll('.btn-ref').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openRefModal(parseInt(btn.dataset.row));
        });
    });
}

function getDisplayData(idx) {
    const original = cleansingData[idx].input;
    const edits = state.rowEdits[idx];
    if (!edits) return { ...original };
    return { ...original, ...edits };
}

function getStatusBadge(status) {
    const icons = {
        bersih: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
        diedit: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M17 3L21 7L7.82 20.18L2 22L3.82 16.18L17 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
        dihapus: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
        ditandai: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 9V13M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
    };
    const labels = { bersih: 'Bersih', diedit: 'Diedit', dihapus: 'Dihapus', ditandai: 'Ditandai' };
    return `<span class="status-badge ${status}">${icons[status]} ${labels[status]}</span>`;
}

/* === Status Buttons === */
function initStatusButtons() {
    document.querySelectorAll('.cl-status-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const status = btn.dataset.status;
            if (state.activeStatus === status) {
                state.activeStatus = null;
                btn.classList.remove('active');
            } else {
                state.activeStatus = status;
                document.querySelectorAll('.cl-status-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        });
    });
}

/* === Edit Modal === */
function openEditModal(rowIdx) {
    state.editingRow = rowIdx;
    const data = getDisplayData(rowIdx);
    
    document.getElementById('edit-nama').value = data.nama;
    document.getElementById('edit-nis').value = data.nis;
    document.getElementById('edit-tgl').value = data.tgl;
    document.getElementById('edit-kelas').value = data.kelas;
    document.getElementById('edit-notelp').value = data.notelp;

    document.getElementById('modal-edit-overlay').classList.add('show');
}

function closeEditModal() {
    document.getElementById('modal-edit-overlay').classList.remove('show');
    state.editingRow = null;
}

/* === Reference Modal === */
function openRefModal(rowIdx) {
    const item = cleansingData[rowIdx];
    const fieldsEl = document.getElementById('ref-fields');
    const emptyEl = document.getElementById('ref-empty');

    if (!item.ref) {
        fieldsEl.style.display = 'none';
        emptyEl.style.display = '';
    } else {
        fieldsEl.style.display = '';
        emptyEl.style.display = 'none';
        fieldsEl.innerHTML = Object.keys(item.ref).map(key => `
            <div class="ref-field">
                <div class="ref-field-label">${fieldLabels[key]}</div>
                <div class="ref-field-value">${item.ref[key]}</div>
            </div>
        `).join('');
    }

    document.getElementById('modal-ref-overlay').classList.add('show');
}

function closeRefModal() {
    document.getElementById('modal-ref-overlay').classList.remove('show');
}

/* === Modal Initialization === */
function initModals() {
    // Edit modal
    document.getElementById('modal-edit-close').addEventListener('click', closeEditModal);
    document.getElementById('btn-edit-cancel').addEventListener('click', closeEditModal);
    document.getElementById('modal-edit-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeEditModal();
    });

    document.getElementById('edit-form').addEventListener('submit', (e) => {
        e.preventDefault();
        if (state.editingRow === null) return;

        const edits = {
            nama: document.getElementById('edit-nama').value.trim(),
            nis: document.getElementById('edit-nis').value.trim(),
            tgl: document.getElementById('edit-tgl').value.trim(),
            kelas: document.getElementById('edit-kelas').value.trim(),
            notelp: document.getElementById('edit-notelp').value.trim()
        };

        state.rowEdits[state.editingRow] = edits;

        // Auto-set status to "diedit" if not already set
        if (!state.rowStatuses[state.editingRow]) {
            state.rowStatuses[state.editingRow] = 'diedit';
        }

        closeEditModal();
        renderTable();
        updateProgress();
        playSelectSound();
    });

    // Reference modal
    document.getElementById('modal-ref-close').addEventListener('click', closeRefModal);
    document.getElementById('modal-ref-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeRefModal();
    });

    // Escape key closes modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeEditModal();
            closeRefModal();
        }
    });
}

/* === Progress === */
function updateProgress() {
    const total = cleansingData.length;
    const answered = Object.keys(state.rowStatuses).length;
    document.getElementById('progress-pill-value').textContent = `${answered}/${total}`;

    const btn = document.getElementById('btn-periksa');
    btn.disabled = answered < total;

    if (answered < total) {
        btn.querySelector('span').textContent = `Periksa Jawaban (${total - answered} belum)`;
    } else {
        btn.querySelector('span').textContent = 'Periksa Jawaban';
    }
}

/* === Periksa Jawaban === */
function initPeriksaButton() {
    document.getElementById('btn-periksa').addEventListener('click', () => {
        const total = cleansingData.length;
        if (Object.keys(state.rowStatuses).length < total) return;

        let correct = 0, wrong = 0;
        const details = [];

        cleansingData.forEach((item, idx) => {
            const userStatus = state.rowStatuses[idx];
            const userEdits = state.rowEdits[idx] || {};
            const isStatusCorrect = userStatus === item.correctStatus;

            // Check full data integrity based on expected status
            let isDataCorrect = true;

            if (item.correctStatus === 'bersih') {
                // "Bersih": status must be correct AND data must NOT have been corrupted
                // Compare current display data against original input — they should be identical
                const current = getDisplayData(idx);
                const original = item.input;
                for (const field of Object.keys(original)) {
                    if (current[field] !== original[field]) {
                        isDataCorrect = false;
                        break;
                    }
                }
            } else if (item.correctStatus === 'diedit' && item.ref) {
                // "Diedit": ALL fields must match the reference data after editing
                // This catches: fixing the error but corrupting another field
                const current = getDisplayData(idx);
                for (const field of Object.keys(item.ref)) {
                    if (current[field] !== item.ref[field]) {
                        isDataCorrect = false;
                        break;
                    }
                }
            } else if (item.correctStatus === 'ditandai') {
                // "Ditandai": data should not have been modified (no reference to check against)
                const current = getDisplayData(idx);
                const original = item.input;
                for (const field of Object.keys(original)) {
                    if (current[field] !== original[field]) {
                        isDataCorrect = false;
                        break;
                    }
                }
            }
            // "Dihapus": no data integrity check needed — just correct status

            const isCorrect = isStatusCorrect && isDataCorrect;

            if (isCorrect) correct++;
            else wrong++;

            const statusLabels = {
                bersih: 'Data Bersih', diedit: 'Data Diedit',
                dihapus: 'Data Dihapus', ditandai: 'Ditandai'
            };

            // Build detail reason for wrong answers
            let wrongReason = '';
            if (!isStatusCorrect) {
                wrongReason = `Status seharusnya "${statusLabels[item.correctStatus]}"`;
            } else if (!isDataCorrect && item.correctStatus === 'bersih') {
                wrongReason = 'Data telah diubah padahal seharusnya tetap utuh';
            } else if (!isDataCorrect && item.correctStatus === 'ditandai') {
                wrongReason = 'Data telah diubah padahal seharusnya tetap utuh';
            } else if (!isDataCorrect && item.correctStatus === 'diedit') {
                wrongReason = 'Data belum sesuai referensi setelah diedit';
            }

            details.push({
                nama: item.input.nama,
                no: item.no,
                userStatus: statusLabels[userStatus] || userStatus,
                correctStatus: statusLabels[item.correctStatus],
                isCorrect,
                isStatusCorrect,
                isDataCorrect,
                wrongReason,
                explanation: item.explanation
            });
        });

        const resultData = {
            type: 'cleansing',
            correct, wrong,
            total,
            score: Math.round((correct / total) * 100),
            details
        };

        sessionStorage.setItem('cleansing_result', JSON.stringify(resultData));
        window.location.href = 'simulasi-hasil-cleansing.html';
    });
}

/* === Sound === */
function playSelectSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 500; osc.type = 'sine';
        gain.gain.value = 0.04;
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
}
