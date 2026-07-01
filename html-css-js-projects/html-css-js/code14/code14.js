// JavaScript for Code 14
document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const wordCountDisplay = document.getElementById('wordCount');
    const charCountDisplay = document.getElementById('charCount');
    const charNoSpaceDisplay = document.getElementById('charNoSpaceCount');

    function updateCounts() {
        const text = textInput.value;
        
        // Word count - handle empty string case
        const trimmedText = text.trim();
        const words = trimmedText === '' ? [] : trimmedText.split(/\s+/);
        
        // Update displays
        wordCountDisplay.textContent = words.length;
        charCountDisplay.textContent = text.length;
        charNoSpaceDisplay.textContent = text.replace(/\s/g, '').length;
    }

    textInput.addEventListener('input', updateCounts);
    
    // Trigger count on load for the default text
    updateCounts();
});