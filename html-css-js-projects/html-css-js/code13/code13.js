// JavaScript for Code 13
document.addEventListener('DOMContentLoaded', () => {
    const copyBtn = document.getElementById('copyBtn');
    const textInput = document.getElementById('textToCopy');
    const message = document.getElementById('message');

    copyBtn.addEventListener('click', async () => {
        try {
            // Select the text from our input field
            const text = textInput.value;
            
            // Modern API to write to clipboard
            await navigator.clipboard.writeText(text);
            
            // Show feedback
            message.textContent = 'Code copied successfully!';
            
            // Clear message after 2 seconds
            setTimeout(() => { message.textContent = ''; }, 2000);
        } catch (err) {
            message.textContent = 'Failed to copy text.';
            console.error('Clipboard API Error: ', err);
        }
    });
});