document.addEventListener("DOMContentLoaded", function () {
    const certificates = [
        "I2CSUpdate20250211-26-4my448.pdf",
        "6ce20bc5-0b51-4690-8f65-fdded13c428f.png",
        "Advanced Penetration Testing.jpg",
        "bhmea23.jpg",
        "coursat_certificate_bd80-42d0-ffb1-6970.jpg",
        "download.pdf",
        "Ethical Hacker.pdf",
        "Kali Linux.jpg",
        "noName1.pdf"
    ];
    const container = document.getElementById("certificates");
    
    certificates.forEach(cert => {
        const isPDF = cert.endsWith(".pdf");
        const encodedCert = encodeURIComponent(cert);
        const col = document.createElement("div");
        col.classList.add("col-md-4", "col-sm-6", "mb-4");
        col.innerHTML = `
            <div class="card certificate-card shadow-sm bg-dark text-white">
                ${isPDF ? 
                    `<div class="card-body text-center">
                        <i class="fa fa-file-pdf" onclick="showCertificate('/resources/certificates/${encodedCert}', 'pdf')"></i>
                        <p class="mt-2">View PDF</p>
                    </div>` 
                    : 
                    `<img src="/resources/certificates/${encodedCert}" onclick="showCertificate('/resources/certificates/${encodedCert}', 'image')">`
                }
            </div>`;
        container.appendChild(col);
    });
});

function showCertificate(src, type) {
    const modalBody = document.getElementById("modalBody");
    modalBody.innerHTML = "";
    document.activeElement.blur();
    if (type === "image") {
        modalBody.innerHTML = `<img src="${src}" class="img-fluid">`;
    } else {
        modalBody.innerHTML = `<canvas id="pdfCanvas"></canvas>`;
        pdfjsLib.getDocument(src).promise.then(pdf => {
            pdf.getPage(1).then(page => {
                const canvas = document.getElementById("pdfCanvas");
                const context = canvas.getContext("2d");
                const viewport = page.getViewport({ scale: 1.5 });
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                page.render({ canvasContext: context, viewport: viewport });
            });
        });
    }
    new bootstrap.Modal(document.getElementById("certificateModal")).show();
}