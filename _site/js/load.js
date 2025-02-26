(function() {
    // Create and style the loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.style.position = 'fixed';
    loadingOverlay.style.top = '0';
    loadingOverlay.style.left = '0';
    loadingOverlay.style.width = '100vw';
    loadingOverlay.style.height = '100vh';
    loadingOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    loadingOverlay.style.display = 'flex';
    loadingOverlay.style.justifyContent = 'center';
    loadingOverlay.style.alignItems = 'center';
    loadingOverlay.style.zIndex = '9999';

    // Create a spinner or any loading animation
    const spinner = document.createElement('div');
    spinner.style.border = '8px solid #f3f3f3';
    spinner.style.borderTop = '8px solid #3498db';
    spinner.style.borderRadius = '50%';
    spinner.style.width = '50px';
    spinner.style.height = '50px';
    spinner.style.animation = 'spin 1s linear infinite';
    loadingOverlay.appendChild(spinner);

    // Append the overlay to the body
    document.body.appendChild(loadingOverlay);

    // Style for the spinner animation (optional)
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    // Max load timeout of 2 seconds
    const maxLoadTime = 2000;
    const hideOverlay = () => {
        loadingOverlay.style.display = 'none';
    };

    // Hide the loading overlay after 2 seconds regardless of loading state
    setTimeout(hideOverlay, maxLoadTime);

    // Wait for all images, videos, and other resources to be loaded
    window.onload = function() {
        hideOverlay();
    };

    // You can also listen for individual image/video loading events if needed
    const elements = document.querySelectorAll('img, video');
    let totalElements = elements.length;
    let loadedElements = 0;

    elements.forEach(element => {
        element.onload = element.onerror = function() {
            loadedElements++;
            if (loadedElements === totalElements) {
                hideOverlay();
            }
        };
    });
})();
