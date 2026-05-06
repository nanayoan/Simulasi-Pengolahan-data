/* ============================================
   DATA SIM — Simulasi Page Script
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initModuleCards();
    initScrollAnimations();
});

/* --- Module Card Interactions --- */
function initModuleCards() {
    const moduleCards = document.querySelectorAll('.module-card');
    const moduleBtns = document.querySelectorAll('.module-btn');

    // Card click → navigate to module
    moduleCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking the button (button has its own handler)
            if (e.target.closest('.module-btn')) return;
            
            const module = card.dataset.module;
            navigateToModule(module);
        });
    });

    // Button click → navigate to module
    moduleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const module = btn.dataset.module;
            
            // Add ripple effect
            addRipple(btn, e);
            
            setTimeout(() => navigateToModule(module), 300);
        });
    });

    // Add tilt effect on hover (desktop)
    if (window.matchMedia('(min-width: 768px)').matches) {
        moduleCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;

                card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }
}

/* --- CTA Button — direct link, no scroll override --- */
// CTA button now uses href="simulasi-validasi.html" directly


/* --- Scroll-triggered Animations --- */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe module cards
    document.querySelectorAll('.module-card').forEach(card => {
        card.style.animationPlayState = 'paused';
        observer.observe(card);
    });
}

/* --- Navigate to Module --- */
function navigateToModule(module) {
    const moduleNames = {
        'validasi': 'Validasi Data',
        'verifikasi': 'Verifikasi Data',
        'cleansing': 'Data Cleansing'
    };

    console.log(`Starting module: ${module}`);
    
    if (module === 'validasi') {
        window.location.href = 'simulasi-validasi.html';
    } else {
        showToast(`Modul ${moduleNames[module]} akan segera hadir! 🚀`);
    }
}

/* --- Ripple Effect --- */
function addRipple(element, event) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    Object.assign(ripple.style, {
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        left: `${x}px`,
        top: `${y}px`,
        background: 'rgba(255, 255, 255, 0.3)',
        borderRadius: '50%',
        transform: 'scale(0)',
        animation: 'ripple 0.6s ease-out',
        pointerEvents: 'none'
    });

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
}

// Add ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to { transform: scale(4); opacity: 0; }
    }
`;
document.head.appendChild(rippleStyle);
