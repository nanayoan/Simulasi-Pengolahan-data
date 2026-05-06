/* ============================================
   DATA SIM — Hasil Validasi Script
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const data = loadResults();
    if (!data) {
        window.location.href = 'simulasi-level2.html';
        return;
    }
    processResults(data);
});

function loadResults() {
    const raw = sessionStorage.getItem('validasi_result');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
}

function processResults(data) {
    const { correct, wrong, total, score, details } = data;

    animateScore(score);
    updateScoreText(score, correct, total);
    animateProgress(score, correct, total);
    updateStats(correct, wrong);
    buildDetailList(details);

    if (score >= 80) setTimeout(() => launchConfetti(), 1200);

    const btnNext = document.getElementById('btn-next-level');
    btnNext.disabled = false;
    btnNext.addEventListener('click', () => {
        window.location.href = 'simulasi-level3.html';
    });
}

/* === Animated Counter === */
function animateScore(target) {
    const el = document.getElementById('score-number');
    const pv = document.getElementById('progress-value');
    let current = 0;
    const duration = 1500;
    const startTime = performance.now();

    function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        current = Math.round(eased * target);
        el.textContent = current;
        pv.textContent = current + '%';
        if (progress < 1) requestAnimationFrame(update);
    }
    setTimeout(() => requestAnimationFrame(update), 800);
}

function updateScoreText(score, correct, total) {
    const titleEl = document.getElementById('score-title');
    const subtitleEl = document.getElementById('score-subtitle');
    const scoreNum = document.getElementById('score-number');
    const trophyIcon = document.getElementById('trophy-icon');

    if (score === 100) {
        titleEl.textContent = 'Sempurna! 🎉';
        subtitleEl.textContent = 'Kamu berhasil memvalidasi semua data dengan benar. Hebat!';
        scoreNum.classList.add('gold');
        trophyIcon.classList.add('gold');
    } else if (score >= 80) {
        titleEl.textContent = 'Luar Biasa!';
        subtitleEl.textContent = 'Kamu berhasil memvalidasi sebagian besar data dengan benar.';
        scoreNum.classList.add('green');
        trophyIcon.classList.add('green');
    } else if (score >= 60) {
        titleEl.textContent = 'Bagus Sekali!';
        subtitleEl.textContent = 'Kamu berhasil memvalidasi sebagian besar data. Terus asah ketelitianmu!';
    } else if (score >= 40) {
        titleEl.textContent = 'Cukup Baik';
        subtitleEl.textContent = 'Coba perhatikan aturan validasi lebih teliti.';
    } else {
        titleEl.textContent = 'Perlu Latihan Lagi';
        subtitleEl.textContent = 'Ulangi dan perhatikan aturan validasi di panel kiri.';
    }
}

function animateProgress(score, correct, total) {
    const fill = document.getElementById('progress-fill');
    const detail = document.getElementById('progress-detail');
    detail.textContent = `${correct} dari ${total} data tervalidasi dengan benar.`;

    if (score >= 80) fill.style.background = 'linear-gradient(90deg, #10B981, #059669)';
    else if (score >= 60) fill.style.background = 'linear-gradient(90deg, var(--color-primary), #6366F1)';
    else if (score >= 40) fill.style.background = 'linear-gradient(90deg, #F59E0B, #D97706)';
    else fill.style.background = 'linear-gradient(90deg, #EF4444, #DC2626)';

    setTimeout(() => { fill.style.width = score + '%'; }, 1400);
}

function updateStats(correct, wrong) {
    const cEl = document.getElementById('stat-correct-num');
    const wEl = document.getElementById('stat-wrong-num');
    setTimeout(() => animateNumber(cEl, correct), 1500);
    setTimeout(() => animateNumber(wEl, wrong), 1700);
}

function animateNumber(el, target) {
    let c = 0;
    const step = Math.max(1, Math.floor(target / 10));
    const iv = setInterval(() => {
        c += step;
        if (c >= target) { c = target; clearInterval(iv); }
        el.textContent = c;
    }, 60);
}

/* === Detail List === */
function buildDetailList(details) {
    const list = document.getElementById('detail-list');
    const issueLabels = {
        'valid': 'Data sudah valid',
        'format': 'Format tidak konsisten',
        'lengkap': 'Data tidak lengkap',
        'nomor': 'Nomor tidak valid'
    };

    details.forEach((item, index) => {
        const type = item.isCorrect ? 'correct' : 'wrong';
        const badge = item.isCorrect ? 'Tervalidasi' : (item.errorDetails.length > 0 ? 'Salah' : 'Terlewat');
        const badgeClass = item.isCorrect ? 'teridentifikasi' : (item.errorDetails.length > 0 ? 'salah' : 'terlewat');

        const userLabels = item.userAnswer.map(v => issueLabels[v] || v).join(', ');
        const correctLabels = item.correctAnswer.map(v => issueLabels[v] || v).join(', ');

        let anomalyText = '';
        if (item.isCorrect) {
            anomalyText = userLabels;
        } else {
            anomalyText = `Jawabanmu: ${userLabels || 'Kosong'} → Seharusnya: ${correctLabels}`;
        }

        const div = document.createElement('div');
        div.className = 'detail-item';
        div.innerHTML = `
            <div class="detail-status-icon ${type === 'correct' ? 'correct' : 'missed'}">
                ${type === 'correct' ? 
                    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' :
                    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>'
                }
            </div>
            <div class="detail-text">
                <div class="detail-name">${item.nama}</div>
                <div class="detail-anomaly">${anomalyText}</div>
            </div>
            <span class="detail-badge ${badgeClass}">${badge}</span>
        `;
        list.appendChild(div);
        setTimeout(() => div.classList.add('show'), 1800 + (index * 120));
    });
}

/* === Confetti === */
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
            p.x += p.vx; p.y += p.vy; p.vy += p.gravity;
            p.rotation += p.rotationSpeed; p.life -= p.decay;
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
