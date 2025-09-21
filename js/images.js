// ==== IMAGE MODAL SCRIPT ====
document.addEventListener('DOMContentLoaded', () => {
    // إنشاء المودال لو ما موجود
    let modal = document.getElementById('imgModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'imgModal';
        modal.className = 'img-modal';
        modal.innerHTML = `
            <span class="img-modal-close">&times;</span>
            <img class="img-modal-content" id="modalImg">
        `;
        document.body.appendChild(modal);
    }

    const modalImg = document.getElementById('modalImg');
    const closeBtn = modal.querySelector('.img-modal-close');

    // فتح المودال لأي صورة
    document.addEventListener('click', e => {
        if (e.target.tagName === 'IMG') {
            modal.style.display = 'flex';
            modalImg.src = e.target.src;
        }
    });

    // غلق المودال عند الضغط على زر الإغلاق
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // غلق المودال عند الضغط على الخلفية
    modal.addEventListener('click', e => {
        if (e.target === modal) modal.style.display = 'none';
    });
});