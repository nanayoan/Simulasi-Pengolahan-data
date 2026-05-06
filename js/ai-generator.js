/* ============================================
   DATA SIM — Question Generator UI
   Handles modal, calls local QuestionGenerator,
   and stores results in sessionStorage.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initGeneratorModal();
    checkExistingData();
});

/* === State === */
const genState = {
    selectedTemplate: 'mudah',
    isGenerating: false
};

/* === Modal Init === */
function initGeneratorModal() {
    const overlay = document.getElementById('ai-modal-overlay');
    if (!overlay) return;

    // Open
    document.getElementById('btn-ai-generate')?.addEventListener('click', () => {
        if (genState.isGenerating) return;
        overlay.classList.add('show');
        showState('form');
    });

    // Close
    document.getElementById('ai-modal-close')?.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay && !genState.isGenerating) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !genState.isGenerating) closeModal();
    });

    // Template selection
    document.querySelectorAll('.ai-template-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.ai-template-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            genState.selectedTemplate = card.dataset.template;
        });
    });

    // Default select
    document.querySelector('.ai-template-card[data-template="mudah"]')?.classList.add('selected');

    // Generate button
    document.getElementById('ai-btn-generate')?.addEventListener('click', handleGenerate);

    // Retry button
    document.getElementById('ai-btn-retry')?.addEventListener('click', () => showState('form'));

    // Start simulation button
    document.getElementById('ai-btn-start')?.addEventListener('click', () => {
        closeModal();
        window.location.href = 'simulasi-validasi.html';
    });


}

function closeModal() {
    document.getElementById('ai-modal-overlay')?.classList.remove('show');
}

function showState(state) {
    document.getElementById('ai-form-state').style.display = state === 'form' ? '' : 'none';
    document.getElementById('ai-loading-state').className = 'ai-loading' + (state === 'loading' ? ' show' : '');
    document.getElementById('ai-success-state').className = 'ai-success' + (state === 'success' ? ' show' : '');
    document.getElementById('ai-error-state').className = 'ai-error' + (state === 'error' ? ' show' : '');
}

/* === Generate (Local — No API needed!) === */
function handleGenerate() {
    if (genState.isGenerating) return;
    genState.isGenerating = true;

    showState('loading');

    // Small delay for UX (show loading animation briefly)
    setTimeout(() => {
        try {
            const data = QuestionGenerator.generateAll(genState.selectedTemplate);

            // Store in sessionStorage
            sessionStorage.setItem('ai_level1', JSON.stringify(data.level1));
            sessionStorage.setItem('ai_level2', JSON.stringify(data.level2));
            sessionStorage.setItem('ai_level3', JSON.stringify(data.level3));
            sessionStorage.setItem('ai_level4', JSON.stringify(data.level4));
            sessionStorage.setItem('ai_generated', 'true');
            sessionStorage.setItem('ai_template', genState.selectedTemplate);
            // Store difficulty label for badge display
            const difficultyLabels = { mudah: '🟢 Mudah', sedang: '🟡 Sedang', sulit: '🔴 Sulit' };
            sessionStorage.setItem('ai_difficulty', difficultyLabels[genState.selectedTemplate] || '🟡 Sedang');

            showState('success');
            updateBadge(true);

        } catch (err) {
            console.error('Generate Error:', err);
            document.getElementById('ai-error-text').textContent = 'Gagal membuat soal: ' + err.message;
            showState('error');
        } finally {
            genState.isGenerating = false;
        }
    }, 800); // Brief loading animation
}

/* === Check existing data === */
function checkExistingData() {
    updateBadge(sessionStorage.getItem('ai_generated') === 'true');
}

function updateBadge(hasData) {
    const badge = document.getElementById('ai-active-badge');
    if (badge) badge.style.display = hasData ? '' : 'none';
}
