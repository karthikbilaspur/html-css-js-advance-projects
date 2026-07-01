const passwordField = document.getElementById('passwordField');
const toggleBtn = document.getElementById('toggleBtn');

toggleBtn.addEventListener('click', () => {
    // Determine the new type
    const isPassword = passwordField.type === 'password';
    passwordField.type = isPassword ? 'text' : 'password';
    
    // Toggle the button text
    toggleBtn.textContent = isPassword ? 'Hide' : 'Show';
    
    // Keep focus on the input field after clicking the toggle
    passwordField.focus();
});