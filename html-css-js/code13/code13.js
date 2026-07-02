// JavaScript for Code 13
document.addEventListener('DOMContentLoaded', () => {
    const copyBtn = document.getElementById('copyBtn');
    const textInput = document.getElementById('textToCopy');
    const message = document.getElementById('message');

    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(textInput.value);
            
            // Visual feedback
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            message.textContent = 'Code copied successfully!';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                message.textContent = '';
            }, 2000);
            
        } catch (err) {
            message.textContent = 'Failed to copy text.';
            console.error('Clipboard API Error: ', err);
        }
    });
});