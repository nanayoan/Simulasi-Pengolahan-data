/* ============================================
   DATA SIM — Main Application Script
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initCardInteractions();
    preventBackNavigation();
    loadDifficultyBadge();
});

/* --- Load selected difficulty level into badge --- */
function loadDifficultyBadge() {
    const badgeText = document.getElementById('badge-difficulty-text');
    if (badgeText) {
        const difficulty = sessionStorage.getItem('ai_difficulty');
        if (difficulty) badgeText.textContent = difficulty;
    }
}

/* --- Prevent Browser Back during Simulation --- */
function preventBackNavigation() {
    const isSimPage = /simulasi-(validasi|level|hasil)/.test(location.pathname);
    if (isSimPage) {
        history.pushState(null, null, location.href);
        window.addEventListener('popstate', () => {
            history.pushState(null, null, location.href);
        });
    }
}

/* --- Bottom Navigation --- */
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active from all
            navItems.forEach(nav => nav.classList.remove('active'));

            // Set active on clicked
            item.classList.add('active');

            // Get target page
            const page = item.dataset.page;
            handleNavigation(page);
        });
    });
}

/* --- Card Interactions --- */
function initCardInteractions() {
    // Cards now use regular <a> links, no JS interception needed
}

/* --- Set Active Navigation Item --- */
function setActiveNav(page) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(nav => {
        nav.classList.toggle('active', nav.dataset.page === page);
    });
}

/* --- Handle Page Navigation --- */
function handleNavigation(page) {
    console.log(`Navigating to: ${page}`);

    switch (page) {
        case 'beranda':
            window.location.href = '/';
            break;
        case 'materi':
            window.location.href = 'materi.html';
            break;
        case 'simulasi':
            window.location.href = 'simulasi.html';
            break;
    }
}

/* --- Toast Notification --- */
function showToast(message) {
    // Remove any existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    // Create toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    // Style the toast
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '90px',
        left: '50%',
        transform: 'translateX(-50%) translateY(20px)',
        background: 'rgba(26, 29, 38, 0.9)',
        color: '#fff',
        padding: '12px 24px',
        borderRadius: '12px',
        fontSize: '0.875rem',
        fontWeight: '500',
        fontFamily: "'Inter', sans-serif",
        zIndex: '999',
        opacity: '0',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        maxWidth: '90%',
        textAlign: 'center'
    });

    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    // Auto dismiss
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}
