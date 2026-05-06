/* ============================================
   DATA SIM — Hasil Pembersihan Script
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const data = loadResults();
    if (!data) { window.location.href = 'simulasi-level4.html'; return; }
    processResults(data);
});

function loadResults() {
    const raw = sessionStorage.getItem('cleansing_result');
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
    btnNext.addEventListener('click', () => {
        window.location.href = 'simulasi-hasil-akhir.html';
    });
}

function animateScore(target) {
    const el = document.getElementById('score-number');
    const pv = document.getElementById('progress-value');
    const start = performance.now();
    function update(now) {
        const p = Math.min((now - start) / 1500, 1);
        const v = Math.round((1 - Math.pow(1 - p, 3)) * target);
        el.textContent = v; pv.textContent = v + '%';
        if (p < 1) requestAnimationFrame(update);
    }
    setTimeout(() => requestAnimationFrame(update), 800);
}

function updateScoreText(score) {
    const t = document.getElementById('score-title');
    const s = document.getElementById('score-subtitle');
    const n = document.getElementById('score-number');
    const ic = document.getElementById('trophy-icon');

    if (score === 100) {
        t.textContent = 'Sempurna! 🎉';
        s.textContent = 'Kamu berhasil membersihkan semua data dengan tepat. Database kini rapi!';
        n.classList.add('gold'); ic.classList.add('gold');
    } else if (score >= 80) {
        t.textContent = 'Luar Biasa!';
        s.textContent = 'Kamu berhasil membersihkan sebagian besar data kotor dengan tepat.';
        n.classList.add('green'); ic.classList.add('green');
    } else if (score >= 60) {
        t.textContent = 'Bagus Sekali!';
        s.textContent = 'Database kini jauh lebih rapi! Terus asah kemampuanmu.';
    } else {
        t.textContent = 'Perlu Latihan Lagi';
        s.textContent = 'Coba perhatikan referensi dan kolom data lebih teliti.';
    }
}

function animateProgress(score, correct, total) {
    const fill = document.getElementById('progress-fill');
    document.getElementById('progress-detail').textContent = `${correct} dari ${total} baris data berhasil dibersihkan dengan benar.`;
    if (score >= 80) fill.style.background = 'linear-gradient(90deg, #10B981, #059669)';
    else if (score >= 60) fill.style.background = 'linear-gradient(90deg, var(--color-primary), #6366F1)';
    else fill.style.background = 'linear-gradient(90deg, #EF4444, #DC2626)';
    setTimeout(() => { fill.style.width = score + '%'; }, 1400);
}

function updateStats(correct, wrong) {
    setTimeout(() => animN(document.getElementById('stat-correct-num'), correct), 1500);
    setTimeout(() => animN(document.getElementById('stat-wrong-num'), wrong), 1700);
}

function animN(el, target) {
    let c = 0; const s = Math.max(1, Math.floor(target / 10));
    const iv = setInterval(() => { c += s; if (c >= target) { c = target; clearInterval(iv); } el.textContent = c; }, 60);
}

function buildDetailList(details) {
    const list = document.getElementById('detail-list');
    const statusIcons = {
        correct: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        missed: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>'
    };

    details.forEach((item, idx) => {
        const type = item.isCorrect ? 'correct' : 'missed';
        let badge, badgeClass;

        if (item.isCorrect) {
            badge = item.correctStatus;
            badgeClass = 'teridentifikasi';
        } else {
            // Show what was wrong — use specific reason
            if (!item.isStatusCorrect) {
                badge = 'Status salah';
                badgeClass = 'salah';
            } else if (!item.isDataCorrect) {
                badge = 'Data belum sesuai';
                badgeClass = 'terlewat';
            } else {
                badge = 'Salah';
                badgeClass = 'salah';
            }
        }

        const desc = item.isCorrect 
            ? item.explanation 
            : (item.wrongReason || `Jawabanmu: ${item.userStatus} → Seharusnya: ${item.correctStatus}`);

        const div = document.createElement('div');
        div.className = 'detail-item';
        div.innerHTML = `
            <div class="detail-status-icon ${type}">${statusIcons[type]}</div>
            <div class="detail-text">
                <div class="detail-name">${item.nama} (No. ${item.no})</div>
                <div class="detail-anomaly">${desc}</div>
            </div>
            <span class="detail-badge ${badgeClass}">${badge}</span>
        `;
        list.appendChild(div);
        setTimeout(() => div.classList.add('show'), 1800 + (idx * 120));
    });
}

function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    const particles = [], colors = ['#4A6CF7', '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    for (let i = 0; i < 60; i++) particles.push({
        x: canvas.width/2+(Math.random()-0.5)*100, y: canvas.height/2,
        vx: (Math.random()-0.5)*12, vy: (Math.random()-1)*10-4,
        size: Math.random()*8+3, color: colors[Math.floor(Math.random()*colors.length)],
        rotation: Math.random()*360, rotationSpeed: (Math.random()-0.5)*10,
        gravity: 0.15, life: 1, decay: 0.005+Math.random()*0.01
    });
    (function animate() {
        ctx.clearRect(0,0,canvas.width,canvas.height); let alive = false;
        particles.forEach(p => {
            if (p.life <= 0) return; alive = true;
            p.x+=p.vx; p.y+=p.vy; p.vy+=p.gravity; p.rotation+=p.rotationSpeed; p.life-=p.decay;
            ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rotation*Math.PI/180);
            ctx.globalAlpha=p.life; ctx.fillStyle=p.color;
            ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*0.6); ctx.restore();
        });
        if (alive) requestAnimationFrame(animate);
    })();
}
