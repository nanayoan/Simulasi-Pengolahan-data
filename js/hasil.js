/* ============================================
   DATA SIM — Hasil Identifikasi Script
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const data = loadResults();
    if (!data) {
        window.location.href = 'simulasi-validasi.html';
        return;
    }
    processResults(data);
});

/* === Load from sessionStorage === */
function loadResults() {
    const raw = sessionStorage.getItem('identifikasi_result');
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

/* === Process & Display Results === */
function processResults(data) {
    const { selected, errors, tableData, totalErrors } = data;
    const selectedSet = new Set(selected);
    const errorKeys = new Set(errors.map(e => e.key));

    // Calculate stats
    let correctCount = 0;       // User selected AND it's actually an error
    let wrongCount = 0;          // User selected but it's NOT an error
    let missedCount = 0;         // Actual error but user did NOT select it

    // Check user selections against actual errors
    selectedSet.forEach(key => {
        if (errorKeys.has(key)) {
            correctCount++;
        } else {
            wrongCount++;
        }
    });

    // Find missed errors
    errorKeys.forEach(key => {
        if (!selectedSet.has(key)) {
            missedCount++;
        }
    });

    const score = Math.round((Math.max(0, correctCount - wrongCount) / totalErrors) * 100);
    const totalMistakes = wrongCount + missedCount;

    // Animate score display
    animateScore(score);
    updateScoreText(score, correctCount, totalErrors);
    animateProgress(score, correctCount, totalErrors);
    updateStats(correctCount, totalMistakes);
    buildDetailList(errors, selectedSet, errorKeys, tableData);

    // Confetti if high score
    if (score >= 80) {
        setTimeout(() => launchConfetti(), 1200);
    }

    // Enable next level button if score >= 60
    const btnNext = document.getElementById('btn-next-level');
    btnNext.disabled = false;
    btnNext.addEventListener('click', () => {
        window.location.href = 'simulasi-level2.html';
    });
}

/* === Animate Score Counter === */
function animateScore(target) {
    const el = document.getElementById('score-number');
    const progressVal = document.getElementById('progress-value');
    let current = 0;
    const duration = 1500;
    const startTime = performance.now();

    function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        current = Math.round(eased * target);
        el.textContent = current;
        progressVal.textContent = current + '%';
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    setTimeout(() => requestAnimationFrame(update), 800);
}

/* === Score Text === */
function updateScoreText(score, correct, total) {
    const titleEl = document.getElementById('score-title');
    const subtitleEl = document.getElementById('score-subtitle');
    const scoreNum = document.getElementById('score-number');
    const trophyIcon = document.getElementById('trophy-icon');

    let title, subtitle;

    if (score === 100) {
        title = 'Sempurna! 🎉';
        subtitle = 'Kamu berhasil menemukan semua data bermasalah. Kamu adalah Data Detective sejati!';
        scoreNum.classList.add('gold');
        trophyIcon.classList.add('gold');
    } else if (score >= 80) {
        title = 'Luar Biasa!';
        subtitle = 'Kamu berhasil menemukan sebagian besar data yang bermasalah. Terus tingkatkan kemampuanmu!';
        scoreNum.classList.add('green');
        trophyIcon.classList.add('green');
    } else if (score >= 60) {
        title = 'Bagus Sekali!';
        subtitle = 'Kamu berhasil menemukan sebagian besar data yang bermasalah.';
    } else if (score >= 40) {
        title = 'Cukup Baik';
        subtitle = 'Kamu perlu lebih teliti lagi dalam mengidentifikasi data bermasalah.';
    } else {
        title = 'Perlu Latihan Lagi';
        subtitle = 'Jangan menyerah! Coba perhatikan tips detective dan ulangi lagi.';
    }

    titleEl.textContent = title;
    subtitleEl.textContent = subtitle;
}

/* === Animate Progress Bar === */
function animateProgress(score, correct, total) {
    const fill = document.getElementById('progress-fill');
    const detail = document.getElementById('progress-detail');

    detail.textContent = `${correct} dari ${total} masalah teridentifikasi dengan benar.`;

    // Set color based on score
    if (score >= 80) {
        fill.style.background = 'linear-gradient(90deg, #10B981, #059669)';
    } else if (score >= 60) {
        fill.style.background = 'linear-gradient(90deg, var(--color-primary), #6366F1)';
    } else if (score >= 40) {
        fill.style.background = 'linear-gradient(90deg, #F59E0B, #D97706)';
    } else {
        fill.style.background = 'linear-gradient(90deg, #EF4444, #DC2626)';
    }

    setTimeout(() => {
        fill.style.width = score + '%';
    }, 1400);
}

/* === Update Stat Cards === */
function updateStats(correct, mistakes) {
    const correctEl = document.getElementById('stat-correct-num');
    const wrongEl = document.getElementById('stat-wrong-num');

    // Animate numbers with delay
    setTimeout(() => animateNumber(correctEl, correct), 1500);
    setTimeout(() => animateNumber(wrongEl, mistakes), 1700);
}

function animateNumber(el, target) {
    let current = 0;
    const step = Math.max(1, Math.floor(target / 15));
    const interval = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(interval);
        }
        el.textContent = current;
    }, 50);
}

/* === Build Detail List === */
function buildDetailList(errors, selectedSet, errorKeys, tableData) {
    const list = document.getElementById('detail-list');
    const items = [];

    // 1. Correctly identified errors (TERIDENTIFIKASI)
    errors.forEach(err => {
        if (selectedSet.has(err.key)) {
            items.push({
                type: 'correct',
                name: getNameFromRow(tableData, err.row),
                anomaly: err.errorType,
                badge: 'Teridentifikasi',
                badgeClass: 'teridentifikasi',
                order: 1
            });
        }
    });

    // 2. Missed errors (TERLEWAT)
    errors.forEach(err => {
        if (!selectedSet.has(err.key)) {
            items.push({
                type: 'missed',
                name: getNameFromRow(tableData, err.row),
                anomaly: `${err.errorType} - Terlewat`,
                badge: 'Terlewat',
                badgeClass: 'terlewat',
                order: 2
            });
        }
    });

    // 3. Wrong selections (SALAH) — user selected a correct cell
    selectedSet.forEach(key => {
        if (!errorKeys.has(key)) {
            const [row, col] = key.split('-');
            const name = getNameFromRow(tableData, row);
            items.push({
                type: 'wrong',
                name: name,
                anomaly: `Kolom ${col} - Salah identifikasi`,
                badge: 'Salah',
                badgeClass: 'salah',
                order: 3
            });
        }
    });

    // Sort: correct first, missed, wrong last
    items.sort((a, b) => a.order - b.order);

    // Render items
    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'detail-item';
        div.innerHTML = `
            <div class="detail-status-icon ${item.type}">
                ${getStatusIcon(item.type)}
            </div>
            <div class="detail-text">
                <div class="detail-name">${item.name}</div>
                <div class="detail-anomaly">Anomali: <strong>${item.anomaly}</strong></div>
            </div>
            <span class="detail-badge ${item.badgeClass}">${item.badge}</span>
        `;

        list.appendChild(div);

        // Staggered animation
        setTimeout(() => div.classList.add('show'), 1800 + (index * 120));
    });
}

/* === Helper: Get Name from Row === */
function getNameFromRow(tableData, rowNum) {
    const row = tableData.find(r => r.row === rowNum);
    return row ? row.nama : `Baris ${rowNum}`;
}

/* === Helper: Status Icons === */
function getStatusIcon(type) {
    switch (type) {
        case 'correct':
            return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`;
        case 'missed':
            return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>`;
        case 'wrong':
            return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 9V13M12 17H12.01" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>`;
        default:
            return '';
    }
}

/* === Confetti Effect === */
function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = [];
    const colors = ['#4A6CF7', '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

    for (let i = 0; i < 60; i++) {
        particles.push({
            x: canvas.width / 2 + (Math.random() - 0.5) * 100,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 1) * 10 - 4,
            size: Math.random() * 8 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            gravity: 0.15,
            life: 1,
            decay: 0.005 + Math.random() * 0.01
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;

        particles.forEach(p => {
            if (p.life <= 0) return;
            alive = true;

            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.rotation += p.rotationSpeed;
            p.life -= p.decay;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            ctx.restore();
        });

        if (alive) requestAnimationFrame(animate);
    }

    animate();
}
