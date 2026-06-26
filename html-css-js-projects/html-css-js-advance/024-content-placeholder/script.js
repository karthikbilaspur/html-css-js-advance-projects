const loadBtn = document.getElementById('loadBtn');
const skeleton = document.getElementById('skeleton');
const realContent = document.getElementById('realContent');

let isLoaded = false;

loadBtn.addEventListener('click', () => {
    if (isLoaded) {
        // Reset to show skeleton again
        skeleton.style.display = 'block';
        realContent.style.display = 'none';
        loadBtn.textContent = 'Load Content';
        isLoaded = false;
    } else {
        // Simulate loading delay
        loadBtn.textContent = 'Loading...';
        loadBtn.disabled = true;

        setTimeout(() => {
            skeleton.style.display = 'none';
            realContent.style.display = 'block';
            loadBtn.textContent = 'Show Skeleton';
            loadBtn.disabled = false;
            isLoaded = true;
        }, 2000); // 2 second fake delay
    }
});

// Auto-load after 1 second on page open for demo
window.addEventListener('load', () => {
    setTimeout(() => {
        loadBtn.click();
    }, 1000);
});