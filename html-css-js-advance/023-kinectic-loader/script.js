// Optional: Add some dynamic behavior to the loader

const loaderText = document.querySelector('h1');
const messages = ['Loading...', 'Almost there...', 'Just a moment...', 'Preparing...'];
let messageIndex = 0;

// Change loading text every 2 seconds
setInterval(() => {
    messageIndex = (messageIndex + 1) % messages.length;
    loaderText.style.opacity = '0';

    setTimeout(() => {
        loaderText.textContent = messages[messageIndex];
        loaderText.style.opacity = '1';
    }, 300);
}, 2000);

// Smooth fade transition for text
loaderText.style.transition = 'opacity 0.3s ease';

// Example: Hide loader after 8 seconds and show content
// Uncomment this if you want to simulate loading complete
/*
setTimeout(() => {
    document.querySelector('.loader-container').style.display = 'none';
    document.body.innerHTML = '<h1>Content Loaded!</h1>';
}, 8000);
*/