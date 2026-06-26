// JavaScript for Code 14
document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const wordCountDisplay = document.getElementById('wordCount');

    textInput.addEventListener('input', () => {
        const text = textInput.value.trim();
        
        // Split by spaces or newlines, then filter out empty strings
        const words = text.split(/\s+/).filter(word => word.length > 0);
        
        // Update the display
        wordCountDisplay.textContent = words.length;
    });
    
    // Trigger count on load for the default text
    textInput.dispatchEvent(new Event('input'));
});