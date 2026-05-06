/* ============================================
   DATA SIM — Hasil Akhir (Final Summary)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const scores = loadAllScores();
    renderOverallScore(scores);
    renderLevelCards(scores);
    renderQualityAnalysis(scores);
    initFinishButton();
});

/* === Load Scores from sessionStorage === */
function loadAllScores() {
    const defaults = { score: 0, correct: 0, total: 1 };

    function parse(key) {
        try {
            const raw = sessionStorage.getItem(key);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) { return null; }
    }

    const identifikasi = parse('identifikasi_result');
    const validasi = parse('validasi_result');
    const verifikasi = parse('verifikasi_result');
    const cleansing = parse('cleansing_result');

    // Calculate identifikasi score
    let idScore = 0;
    if (identifikasi) {
        const sel = new Set(identifikasi.selected || []);
        const errs = new Set((identifikasi.errors || []).map(e => e.key));
        let correct = 0;
        sel.forEach(k => { if (errs.has(k)) correct++; });
        idScore = Math.round((correct / (identifikasi.totalErrors || 1)) * 100);
    }

    return {
        identifikasi: { score: idScore, data: identifikasi },
        validasi: { score: validasi ? validasi.score : 0, data: validasi },
        verifikasi: { score: verifikasi ? verifikasi.score : 0, data: verifikasi },
        cleansing: { score: cleansing ? cleansing.score : 0, data: cleansing }
    };
}

/* === Overall Score === */
function renderOverallScore(scores) {
    const avg = Math.round(
        (scores.identifikasi.score +
         scores.validasi.score +
         scores.verifikasi.score +
         scores.cleansing.score) / 4
    );

    // Animate number
    const el = document.getElementById('ha-score-number');
    const trophy = document.getElementById('ha-trophy-icon');
    animateCounter(el, avg, 1500);

    // Set title, subtitle, and colors
    const title = document.getElementById('ha-score-title');
    const sub = document.getElementById('ha-score-subtitle');

    if (avg === 100) {
        title.textContent = 'Sempurna! 🎉';
        sub.textContent = 'Kamu telah menguasai semua tahapan pengolahan data dengan sempurna. Kamu adalah Data Master sejati!';
        el.classList.add('gold');
        trophy.classList.add('gold');
    } else if (avg >= 80) {
        title.textContent = 'Luar Biasa!';
        sub.textContent = 'Kamu telah menguasai semua tahapan pengolahan data dengan sangat baik. Keakuratan dan efisiensi analisismu patut diacungi jempol.';
        el.classList.add('green');
        trophy.classList.add('green');
    } else if (avg >= 60) {
        title.textContent = 'Bagus Sekali!';
        sub.textContent = 'Kamu sudah memahami dasar pengolahan data. Terus berlatih untuk meningkatkan ketelitianmu!';
    } else if (avg >= 40) {
        title.textContent = 'Cukup Baik';
        sub.textContent = 'Kamu masih perlu meningkatkan pemahaman tentang pengolahan data. Jangan menyerah!';
    } else {
        title.textContent = 'Perlu Latihan Lagi';
        sub.textContent = 'Pelajari kembali materi pengolahan data dan coba simulasi lagi. Kamu pasti bisa!';
    }

    // Confetti
    if (avg >= 80) setTimeout(() => launchConfetti(), 1200);
}

/* === Level Cards === */
function renderLevelCards(scores) {
    const grid = document.getElementById('ha-levels-grid');

    const levels = [
        {
            label: 'LEVEL 1', name: 'Identifikasi', score: scores.identifikasi.score,
            iconClass: 'blue',
            icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/><path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
        },
        {
            label: 'LEVEL 2', name: 'Validasi', score: scores.validasi.score,
            iconClass: 'green',
            icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><line x1="12" y1="8" x2="12" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16.5" r="1" fill="currentColor"/></svg>'
        },
        {
            label: 'LEVEL 3', name: 'Verifikasi', score: scores.verifikasi.score,
            iconClass: 'purple',
            icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" stroke-width="2"/></svg>'
        },
        {
            label: 'LEVEL 4', name: 'Pembersihan', score: scores.cleansing.score,
            iconClass: 'amber',
            icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 7H20M10 11V17M14 11V17M5 7L6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        }
    ];

    levels.forEach((lvl, i) => {
        const badge = getBadge(lvl.score);
        const card = document.createElement('div');
        card.className = 'ha-level-card';
        card.innerHTML = `
            <div class="ha-level-header">
                <div>
                    <span class="ha-level-label">${lvl.label}</span>
                    <div class="ha-level-name">${lvl.name}</div>
                </div>
                <div class="ha-level-icon ${lvl.iconClass}">${lvl.icon}</div>
            </div>
            <div class="ha-level-footer">
                <div class="ha-level-score">${lvl.score}<span>%</span></div>
                <span class="ha-level-badge ${badge.cls}">${badge.text}</span>
            </div>
        `;
        grid.appendChild(card);
        setTimeout(() => card.classList.add('show'), 800 + i * 150);
    });
}

/* === Quality Analysis === */
function renderQualityAnalysis(scores) {
    const container = document.getElementById('ha-quality-bars');
    const healthEl = document.getElementById('ha-health-score');
    const healthDesc = document.getElementById('ha-health-desc');

    // Compute quality categories from level data
    const categories = [
        {
            name: 'Akurasi Format',
            score: computeFormatAccuracy(scores),
            color: '#4A6CF7',
            bg: 'var(--color-primary-bg)',
            icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 7L20 7M4 12H20M4 17H12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>'
        },
        {
            name: 'Konsistensi Nama',
            score: computeNameConsistency(scores),
            color: '#8B5CF6',
            bg: 'rgba(139, 92, 246, 0.1)',
            icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 21V19C20 16.79 18.21 15 16 15H8C5.79 15 4 16.79 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/></svg>'
        },
        {
            name: 'Kelengkapan Data',
            score: computeCompleteness(scores),
            color: '#10B981',
            bg: 'var(--color-green-bg)',
            icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" stroke-width="2"/></svg>'
        },
        {
            name: 'Kesesuaian Referensi',
            score: scores.verifikasi.score,
            color: '#F59E0B',
            bg: '#FFF7ED',
            icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" stroke-width="2"/></svg>'
        }
    ];

    // Health score = weighted average
    const health = Math.round(categories.reduce((sum, c) => sum + c.score, 0) / categories.length);
    animateCounter(healthEl, health, 1200);

    if (health >= 90) healthDesc.textContent = 'Kualitas data keseluruhanmu sangat tinggi!';
    else if (health >= 70) healthDesc.textContent = 'Kualitas data keseluruhanmu baik.';
    else healthDesc.textContent = 'Masih ada ruang untuk perbaikan kualitas data.';

    // Render bars
    categories.forEach((cat, i) => {
        const badge = getBadge(cat.score);
        const item = document.createElement('div');
        item.className = 'ha-quality-item';
        item.innerHTML = `
            <div class="ha-quality-top">
                <div class="ha-quality-left">
                    <div class="ha-quality-icon" style="background:${cat.bg}; color:${cat.color}">${cat.icon}</div>
                    <span class="ha-quality-name">${cat.name}</span>
                </div>
                <div class="ha-quality-right">
                    <span class="ha-quality-pct">${cat.score}%</span>
                    <span class="ha-quality-badge ${badge.cls}" style="font-size:0.58rem">${badge.text}</span>
                </div>
            </div>
            <div class="ha-quality-track">
                <div class="ha-quality-fill" style="background:${cat.color}"></div>
            </div>
        `;
        container.appendChild(item);

        setTimeout(() => {
            item.classList.add('show');
            item.querySelector('.ha-quality-fill').style.width = cat.score + '%';
        }, 1600 + i * 200);
    });
}

/* === Compute Quality Metrics === */
function computeFormatAccuracy(scores) {
    // Based on Level 2 validasi — how well student identified format issues
    // and Level 4 cleansing — fixing format issues
    const v = scores.validasi.score || 0;
    const c = scores.cleansing.score || 0;
    return Math.round((v * 0.5 + c * 0.5));
}

function computeNameConsistency(scores) {
    // Based on identifikasi (finding name errors) + cleansing (fixing them)
    const id = scores.identifikasi.score || 0;
    const c = scores.cleansing.score || 0;
    return Math.round((id * 0.5 + c * 0.5));
}

function computeCompleteness(scores) {
    // Based on validasi (finding missing data) + identifikasi (spotting gaps)
    const v = scores.validasi.score || 0;
    const id = scores.identifikasi.score || 0;
    return Math.round((v * 0.6 + id * 0.4));
}

/* === Helpers === */
function getBadge(score) {
    if (score === 100) return { text: 'SEMPURNA', cls: 'sempurna' };
    if (score >= 80)  return { text: 'SANGAT BAIK', cls: 'sangat-baik' };
    if (score >= 60)  return { text: 'BAIK', cls: 'baik' };
    if (score >= 40)  return { text: 'CUKUP', cls: 'cukup' };
    return { text: 'KURANG', cls: 'kurang' };
}

function animateCounter(el, target, duration) {
    const start = performance.now();
    function update(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(update);
    }
    setTimeout(() => requestAnimationFrame(update), 600);
}

/* === Finish Button === */
function initFinishButton() {
    document.getElementById('btn-finish').addEventListener('click', () => {
        // Clear all simulation data
        sessionStorage.removeItem('identifikasi_result');
        sessionStorage.removeItem('validasi_result');
        sessionStorage.removeItem('verifikasi_result');
        sessionStorage.removeItem('cleansing_result');
        window.location.href = 'index.html';
    });
}

/* === Confetti === */
function launchConfetti() {
    const canvas = document.getElementById('ha-confetti');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const particles = [];
    const colors = ['#4A6CF7', '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    for (let i = 0; i < 80; i++) particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 150,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 1) * 12 - 4,
        size: Math.random() * 8 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.12,
        life: 1,
        decay: 0.004 + Math.random() * 0.008
    });
    (function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        particles.forEach(p => {
            if (p.life <= 0) return;
            alive = true;
            p.x += p.vx; p.y += p.vy; p.vy += p.gravity;
            p.rotation += p.rotationSpeed; p.life -= p.decay;
            ctx.save(); ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            ctx.restore();
        });
        if (alive) requestAnimationFrame(animate);
    })();
}
