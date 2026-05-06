/* ============================================
   DATA SIM — Level 1: Identifikasi Script
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    loadAIDataIfAvailable();
    initCellSelection();
    initPeriksaButton();
});

/* === Load AI Data (if available) === */
function loadAIDataIfAvailable() {
    const aiData = sessionStorage.getItem('ai_level1');
    if (!aiData) return;

    try {
        const parsed = JSON.parse(aiData);
        const rows = parsed.rows;
        if (!rows || !rows.length) return;

        const tbody = document.getElementById('data-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        rows.forEach((row, idx) => {
            const tr = document.createElement('tr');
            tr.dataset.row = String(idx + 1);

            // Row number cell
            const tdNo = document.createElement('td');
            tdNo.textContent = idx + 1;
            tr.appendChild(tdNo);

            // Data fields
            const fields = ['nis', 'nama', 'tgl_lahir', 'kelas', 'no_telp'];
            fields.forEach(field => {
                const td = document.createElement('td');
                td.className = 'cell-data';
                td.dataset.row = String(idx + 1);
                td.dataset.col = field;
                td.textContent = row[field] || '';

                // Mark errors
                if (row.errors && row.errors[field]) {
                    td.dataset.error = 'true';
                    td.dataset.errorType = (row.errorTypes && row.errorTypes[field]) || 'Data salah';
                }

                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });

    } catch (e) {
        console.error('Error loading AI data for Level 1:', e);
    }
}

/* === State === */
const state = {
    selectedCells: new Set(),
    checked: false
};

/* === Cell Selection Logic === */
function initCellSelection() {
    const cells = document.querySelectorAll('.cell-data');

    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            if (state.checked) return;

            const key = `${cell.dataset.row}-${cell.dataset.col}`;

            if (cell.classList.contains('selected')) {
                cell.classList.remove('selected');
                state.selectedCells.delete(key);
            } else {
                cell.classList.add('selected');
                state.selectedCells.add(key);
                playSelectSound();
            }

            updateUI();
        });

        // Touch feedback
        cell.addEventListener('mousedown', () => {
            if (!state.checked) cell.style.transform = 'scale(0.97)';
        });
        cell.addEventListener('mouseup', () => { cell.style.transform = ''; });
        cell.addEventListener('mouseleave', () => { cell.style.transform = ''; });
    });
}

/* === Update UI === */
function updateUI() {
    const count = state.selectedCells.size;
    const pillText = document.getElementById('pill-text');
    const actionSelected = document.getElementById('action-selected');
    const btn = document.getElementById('btn-periksa');

    // Update pill
    pillText.textContent = count === 0 ? 'Pilih sel yang salah' : `${count} sel dipilih`;

    // Update action bar count
    actionSelected.textContent = count;

    // Enable/disable button
    btn.disabled = count === 0;
}

/* === Periksa Button === */
function initPeriksaButton() {
    const btn = document.getElementById('btn-periksa');
    btn.addEventListener('click', () => {
        if (state.selectedCells.size === 0 || state.checked) return;
        state.checked = true;

        // Gather all error cells (ground truth)
        const errorCells = document.querySelectorAll('.cell-data[data-error="true"]');
        const errors = [];
        errorCells.forEach(cell => {
            errors.push({
                key: `${cell.dataset.row}-${cell.dataset.col}`,
                row: cell.dataset.row,
                col: cell.dataset.col,
                errorType: cell.dataset.errorType,
                cellValue: cell.textContent.trim()
            });
        });

        // Gather all table rows for detail display
        const rows = document.querySelectorAll('#data-tbody tr');
        const tableData = [];
        rows.forEach(row => {
            const cells = row.querySelectorAll('.cell-data');
            const rowData = {};
            cells.forEach(cell => {
                rowData[cell.dataset.col] = cell.textContent.trim();
            });
            tableData.push({
                row: row.dataset.row,
                nama: rowData.nama || '',
                nis: rowData.nis || '',
                ...rowData
            });
        });

        // Save to sessionStorage
        const resultData = {
            selected: Array.from(state.selectedCells),
            errors: errors,
            tableData: tableData,
            totalErrors: errors.length
        };

        sessionStorage.setItem('identifikasi_result', JSON.stringify(resultData));

        // Navigate to results page
        window.location.href = 'simulasi-hasil.html';
    });
}

/* === Sound Effect === */
function playSelectSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.05;
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
    } catch (e) {
        // Silently fail
    }
}
